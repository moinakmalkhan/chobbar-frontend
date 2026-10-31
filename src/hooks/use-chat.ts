"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { refreshAccessToken } from "@/lib/api";
import { env } from "@/lib/env";
import { isExpiring } from "@/lib/jwt";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { uid } from "@/lib/utils";
import { chatService } from "@/services/chat";
import type { ChatMessage, Conversation, CursorPage } from "@/types/api";

export function useConversations(params: { status?: string; page?: number } = {}) {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({ queryKey: [...queryKeys.conversations, params], queryFn: () => chatService.conversations(params), enabled: hydrated && isAuthenticated, staleTime: 30_000 });
}

export function useChatUnread() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({ queryKey: queryKeys.chatUnread, queryFn: chatService.unreadCount, enabled: hydrated && isAuthenticated, staleTime: 60_000, refetchInterval: 90_000 });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      notify.success("Message sent", "Our sales team usually replies within a few hours.");
    },
    onError: (e) => notify.error(e, "Couldn't start the conversation"),
  });
}

/**
 * Live thread: history via cursor-paginated REST, realtime via WebSocket with
 * optimistic sends (client_id de-dupe) and typing indicators.
 */
export function useConversationThread(conversationId: string | null) {
  const { access, isAuthenticated, hydrated } = useAuth();
  const queryClient = useQueryClient();
  const [typing, setTyping] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = useMemo(() => (conversationId ? queryKeys.messages(conversationId) : ["conversation", "none"]), [conversationId]);

  const history = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => chatService.messages(conversationId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.next ? new URL(last.next).searchParams.get("cursor") : null),
    enabled: hydrated && isAuthenticated && Boolean(conversationId),
    staleTime: Infinity,
  });

  const appendMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<{ pages: CursorPage<ChatMessage>[]; pageParams: unknown[] }>(key, (old) => {
        if (!old) return old;
        const pages = old.pages.map((p) => ({ ...p, results: [...p.results] }));
        const first = pages[0] ?? { next: null, previous: null, results: [] };
        const idx = first.results.findIndex((m) => (message.client_id && m.client_id === message.client_id) || m.id === message.id);
        if (idx >= 0) first.results[idx] = { ...message, pending: false };
        else first.results.unshift(message);
        pages[0] = first;
        return { ...old, pages };
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
    [key, queryClient],
  );

  useEffect(() => {
    if (!conversationId || !hydrated || !isAuthenticated) return;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const connect = async () => {
      let token = access;
      if (!token || isExpiring(token)) token = await refreshAccessToken();
      if (!token || closed) return;
      const ws = new WebSocket(`${env.wsUrl}/chat/${conversationId}/?token=${encodeURIComponent(token)}`);
      socket.current = ws;
      ws.onopen = () => { attempts = 0; setConnected(true); };
      ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.event === "message" || data.event === "ack") appendMessage(data.message);
        else if (data.event === "typing") {
          setTyping(data.is_typing ? data.user.name : null);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(null), 3000);
        } else if (data.event === "error") notify.error({ detail: data.detail, code: "chat" }, "Message not sent");
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, Math.min(20_000, 1000 * 2 ** attempts++));
      };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      socket.current?.close();
      socket.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, hydrated, isAuthenticated, appendMessage]);

  const send = useCallback(
    async (body: string, attachment?: File | null) => {
      if (!conversationId) return;
      const client_id = uid();
      const me = queryClient.getQueryData<{ id: string; full_name: string; is_staff: boolean; avatar_url: string }>(queryKeys.me);
      appendMessage({ id: client_id, client_id, kind: attachment ? "file" : "text", body, attachment: null, attachment_name: attachment?.name ?? "", sender: me ? { id: me.id, name: me.full_name, is_staff: me.is_staff, avatar_url: me.avatar_url } : null, created_at: new Date().toISOString(), pending: true });
      if (!attachment && socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: "message", body, client_id }));
        return;
      }
      try {
        const saved = await chatService.send(conversationId, { body, attachment, client_id });
        appendMessage(saved);
      } catch (e) {
        notify.error(e, "Message not sent");
      }
    },
    [conversationId, appendMessage, queryClient],
  );

  const sendTyping = useCallback((is_typing: boolean) => {
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "typing", is_typing }));
  }, []);

  const markRead = useCallback(() => {
    if (!conversationId) return;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "read" }));
    else chatService.markRead(conversationId).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
  }, [conversationId, queryClient]);

  const messages: ChatMessage[] = (history.data?.pages ?? []).flatMap((p) => p.results).slice().reverse();
  return { messages, history, send, sendTyping, markRead, typing, connected };
}

export type { Conversation };
