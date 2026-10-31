"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/hooks/use-auth";
import { env } from "@/lib/env";
import { isExpiring } from "@/lib/jwt";
import { refreshAccessToken } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { notificationsService } from "@/services/notifications";
import type { Notification } from "@/types/api";

export function useUnreadCount() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.unread,
    queryFn: notificationsService.unreadCount,
    enabled: hydrated && isAuthenticated,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useNotificationsFeed(unreadOnly = false) {
  const { isAuthenticated, hydrated } = useAuth();
  return useInfiniteQuery({
    queryKey: [...queryKeys.notifications, unreadOnly],
    queryFn: ({ pageParam }) => notificationsService.list(pageParam, unreadOnly),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.next ? new URL(last.next).searchParams.get("cursor") : null),
    enabled: hydrated && isAuthenticated,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.unread });
  };
  const markRead = useMutation({ mutationFn: notificationsService.markRead, onSuccess: invalidate });
  const markAllRead = useMutation({ mutationFn: notificationsService.markAllRead, onSuccess: () => { invalidate(); notify.success("All caught up"); } });
  const clearRead = useMutation({ mutationFn: notificationsService.clearRead, onSuccess: invalidate });
  return { markRead, markAllRead, clearRead };
}

/**
 * Realtime notifications over WebSocket. Reconnects with backoff, refreshes the
 * JWT before connecting, and surfaces each event as a toast + cache update.
 */
export function useRealtimeNotifications() {
  const { isAuthenticated, hydrated, access } = useAuth();
  const queryClient = useQueryClient();
  const socket = useRef<WebSocket | null>(null);
  const attempts = useRef(0);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let closed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      let token = access;
      if (!token || isExpiring(token)) token = await refreshAccessToken();
      if (!token || closed) return;
      const ws = new WebSocket(`${env.wsUrl}/notifications/?token=${encodeURIComponent(token)}`);
      socket.current = ws;
      ws.onopen = () => {
        attempts.current = 0;
      };
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as Partial<Notification> & { event?: string };
          if (payload.event !== "notification") return;
          queryClient.invalidateQueries({ queryKey: queryKeys.unread });
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
          if (payload.kind === "order" || payload.kind === "payment") {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["order"] });
          }
          if (payload.kind === "quote") queryClient.invalidateQueries({ queryKey: ["quotes"] });
          if (payload.kind === "chat") {
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
            queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
          }
          const title = payload.title ?? "Update";
          const body = payload.body ?? "";
          const url = payload.url;
          const action = url ? { label: "Open", onClick: () => (window.location.href = url) } : undefined;
          if (payload.level === "success") notify.success(title, body);
          else if (payload.level === "warning") notify.warning(title, body);
          else if (payload.level === "error") notify.error({ detail: body, code: "notification" }, title);
          else if (action) notify.action(title, body, action);
          else notify.info(title, body);
        } catch {
          /* ignore malformed frames */
        }
      };
      ws.onclose = () => {
        if (closed) return;
        const delay = Math.min(30_000, 1000 * 2 ** attempts.current++);
        timer = setTimeout(connect, delay);
      };
      ws.onerror = () => ws.close();
    };

    connect();
    const ping = setInterval(() => socket.current?.readyState === WebSocket.OPEN && socket.current.send("ping"), 45_000);
    return () => {
      closed = true;
      clearInterval(ping);
      if (timer) clearTimeout(timer);
      socket.current?.close();
    };
    // Reconnect only when auth state flips, not on every token rotation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isAuthenticated, queryClient]);
}
