import { api } from "@/lib/api";
import type { CursorPage, Notification } from "@/types/api";

export const notificationsService = {
  list: (cursor?: string | null, unread = false) =>
    api.get<CursorPage<Notification>>("/notifications/", { params: { cursor: cursor ?? undefined, unread: unread ? 1 : undefined } }).then((r) => r.data),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count/").then((r) => r.data.count),
  markRead: (id: string) => api.post(`/notifications/${id}/read/`),
  markAllRead: () => api.post("/notifications/read-all/"),
  clearRead: () => api.delete("/notifications/clear/"),
};
