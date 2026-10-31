"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { refreshAccessToken } from "@/lib/api";
import { env } from "@/lib/env";
import { isExpiring } from "@/lib/jwt";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { appPath } from "@/lib/utils";
import { notificationsService } from "@/services/notifications";
import { useAuthStore } from "@/stores/auth-store";
import type { Notification } from "@/types/api";

export function useUnreadCount() {
  const { isAuthenticated, hydrated } = useAuth();
  return useQuery({
    queryKey: queryKeys.unread,
    queryFn: notificationsService.unread,
    enabled: hydrated && isAuthenticated,
    staleTime: 60_000,
  });
}

export function useNotificationsFeed() {
  const { isAuthenticated, hydrated } = useAuth();
  return useInfiniteQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam }) => notificationsService.list(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.next,
    enabled: hydrated && isAuthenticated,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.unread });
  };
  const markRead = useMutation({ mutationFn: notificationsService.read, onSuccess: invalidate });
  const markAllRead = useMutation({
    mutationFn: notificationsService.readAll,
    onSuccess: () => {
      invalidate();
      notify.success(t("account.allCaughtUp"));
    },
  });
  return { markRead, markAllRead };
}

/**
 * Realtime notifications over WebSocket. Refreshes the JWT before connecting,
 * reconnects with exponential backoff, pauses while the tab is hidden (saves
 * battery on low-end phones) and surfaces each event as a toast + cache update.
 */
export function useRealtimeNotifications() {
  const { isAuthenticated, hydrated } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useI18n();
  const routerRef = useRef(router);
  const tRef = useRef(t);
  useEffect(() => {
    routerRef.current = router;
    tRef.current = t;
  });

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    let socket: WebSocket | null = null;
    let closed = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let ping: ReturnType<typeof setInterval> | null = null;

    const onMessage = (event: MessageEvent) => {
      if (event.data === "pong") return;
      let payload: Partial<Notification> & { event?: string };
      try {
        payload = JSON.parse(event.data);
      } catch {
        return;
      }
      if (payload.event !== "notification") return;
      queryClient.invalidateQueries({ queryKey: queryKeys.unread });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      if (payload.kind === "order" || payload.kind === "payment" || payload.kind === "return") {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order"] });
        queryClient.invalidateQueries({ queryKey: queryKeys.returns });
      }
      if (payload.kind === "chat") {
        queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        queryClient.invalidateQueries({ queryKey: queryKeys.chatUnread });
      }
      const path = appPath(payload.url);
      const title = payload.title ?? "";
      const body = payload.body ?? "";
      if (path)
        notify.action(title, body, {
          label: tRef.current("common.viewAll"),
          onClick: () => routerRef.current.push(path),
        });
      else if (payload.level === "success") notify.success(title, body);
      else if (payload.level === "warning") notify.warning(title, body);
      else notify.info(title, body);
    };

    const connect = async () => {
      if (closed || document.visibilityState === "hidden") return;
      let token = useAuthStore.getState().access;
      if (!token || isExpiring(token)) token = await refreshAccessToken();
      if (!token || closed) return;
      socket = new WebSocket(`${env.wsUrl}/notifications/?token=${encodeURIComponent(token)}`);
      socket.onopen = () => {
        attempts = 0;
        // A missed event while offline? Catch up once on (re)connect.
        queryClient.invalidateQueries({ queryKey: queryKeys.unread });
      };
      socket.onmessage = onMessage;
      socket.onclose = (e) => {
        socket = null;
        if (closed || e.code === 4401) return;
        timer = setTimeout(connect, Math.min(30_000, 1000 * 2 ** attempts++));
      };
      socket.onerror = () => socket?.close();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !socket) connect();
    };
    document.addEventListener("visibilitychange", onVisibility);
    connect();
    ping = setInterval(() => socket?.readyState === WebSocket.OPEN && socket.send("ping"), 45_000);
    return () => {
      closed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      if (ping) clearInterval(ping);
      if (timer) clearTimeout(timer);
      socket?.close();
    };
  }, [hydrated, isAuthenticated, queryClient]);
}
