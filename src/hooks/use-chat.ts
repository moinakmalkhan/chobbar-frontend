"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { refreshAccessToken } from "@/lib/api";
import { env } from "@/lib/env";
import { isExpiring } from "@/lib/jwt";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { uid } from "@/lib/utils";
import { chatService } from "@/services/chat";
import { useAuthStore } from "@/stores/auth-store";
import type { ChatMessage, CursorPage } from "@/types/api";

export function useConversations() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => chatService.conversations(),
    enabled: hydrated && isAuthenticated,
    staleTime: 30_000,
  });
}

export function useChatUnread() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.chatUnread,
    queryFn: chatService.unread,
    enabled: hydrated && isAuthenticated,
    staleTime: 60_000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  return useMutation({
    mutationFn: chatService.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      notify.success(t("chat.sent"), t("chat.subtitle"));
    },
    onError: (e) => notify.error(e),
  });
}

type Pages = { pages: CursorPage<ChatMessage>[]; pageParams: unknown[] };

/**
 * Live thread: history via cursor-paginated REST, realtime via WebSocket with
 * optimistic sends (client_id de-dupe), typing indicators and read receipts.
 */
export function useConversationThread(conversationId: string | null) {
  const { isAuthenticated, hydrated, user } = useAuth();
  const queryClient = useQueryClient();
  const [typing, setTyping] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = useMemo(
    () => (conversationId ? queryKeys.messages(conversationId) : ["conversation", "none"]),
    [conversationId],
  );

  const history = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => chatService.messages(conversationId!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next,
    enabled: hydrated && isAuthenticated && Boolean(conversationId),
    staleTime: Infinity,
  });

  const upsert = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<Pages>(key, (old) => {
        if (!old) return { pages: [{ next: null, previous: null, results: [message] }], pageParams: [null] };
        const pages = old.pages.map((p) => ({ ...p, results: [...p.results] }));
        for (const page of pages) {
          const idx = page.results.findIndex(
            (m) => m.id === message.id || (message.client_id && m.client_id === message.client_id),
          );
          if (idx >= 0) {
            page.results[idx] = { ...message, pending: false };
            return { ...old, pages };
          }
        }
        pages[0] = {
          ...(pages[0] ?? { next: null, previous: null }),
          results: [message, ...(pages[0]?.results ?? [])],
        };
        return { ...old, pages };
      });
    },
    [key, queryClient],
  );

  useEffect(() => {
    if (!conversationId || !hydrated || !isAuthenticated) return;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const connect = async () => {
      let token = useAuthStore.getState().access;
      if (!token || isExpiring(token)) token = await refreshAccessToken();
      if (!token || closed) return;
      const ws = new WebSocket(`${env.wsUrl}/chat/${conversationId}/?token=${encodeURIComponent(token)}`);
      socket.current = ws;
      ws.onopen = () => {
        attempts = 0;
        setConnected(true);
      };
      ws.onmessage = (ev) => {
        let data: {
          event?: string;
          message?: ChatMessage;
          is_typing?: boolean;
          user?: { id: string; name: string };
          detail?: string;
        };
        try {
          data = JSON.parse(ev.data);
        } catch {
          return;
        }
        if ((data.event === "message" || data.event === "ack") && data.message) {
          upsert(data.message);
          queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        } else if (
          data.event === "typing" &&
          data.user &&
          data.user.id !== useAuthStore.getState().user?.id
        ) {
          setTyping(data.is_typing ? data.user.name : null);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setTyping(null), 4000);
        } else if (data.event === "error") notify.error({ detail: data.detail ?? "", code: "chat" });
      };
      ws.onclose = (e) => {
        setConnected(false);
        socket.current = null;
        if (!closed && e.code !== 4401 && e.code !== 4403)
          retry = setTimeout(connect, Math.min(20_000, 1000 * 2 ** attempts++));
      };
      ws.onerror = () => ws.close();
    };
    connect();
    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socket.current?.close();
      socket.current = null;
    };
  }, [conversationId, hydrated, isAuthenticated, upsert, queryClient]);

  const send = useCallback(
    async (body: string, attachment?: File | null) => {
      if (!conversationId || (!body.trim() && !attachment)) return;
      const client_id = uid();
      upsert({
        id: client_id,
        client_id,
        kind: attachment ? "file" : "text",
        body,
        attachment: null,
        attachment_name: attachment?.name ?? "",
        sender: user
          ? { id: user.id, name: user.full_name, is_staff: user.is_staff, avatar_url: user.avatar_url }
          : null,
        created_at: new Date().toISOString(),
        pending: true,
      });
      if (!attachment && socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: "message", body, client_id }));
        return;
      }
      try {
        const form = new FormData();
        form.append("body", body);
        form.append("client_id", client_id);
        if (attachment) form.append("attachment", attachment);
        upsert(await chatService.send(conversationId, form));
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
      } catch (e) {
        notify.error(e);
      }
    },
    [conversationId, upsert, user, queryClient],
  );

  const sendTyping = useCallback((is_typing: boolean) => {
    if (socket.current?.readyState === WebSocket.OPEN)
      socket.current.send(JSON.stringify({ type: "typing", is_typing }));
  }, []);

  const markRead = useCallback(() => {
    if (!conversationId) return;
    if (socket.current?.readyState === WebSocket.OPEN) socket.current.send(JSON.stringify({ type: "read" }));
    else chatService.read(conversationId).catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
  }, [conversationId, queryClient]);

  const messages = useMemo(
    () =>
      (history.data?.pages ?? [])
        .flatMap((p) => p.results)
        .slice()
        .reverse(),
    [history.data],
  );
  return { messages, history, send, sendTyping, markRead, typing, connected };
}
