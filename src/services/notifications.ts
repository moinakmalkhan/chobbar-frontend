import { api } from "@/lib/api";
import type { CursorPage, Notification } from "@/types/api";

export const notificationsService = {
  list: (cursor?: string | null) =>
    api.get<CursorPage<Notification>>(cursor ?? "/notifications/").then((r) => r.data),
  unread: () => api.get<{ count: number }>("/notifications/unread-count/").then((r) => r.data.count),
  read: (id: string) => api.post(`/notifications/${id}/read/`),
  readAll: () => api.post("/notifications/read-all/"),
  clear: () => api.delete("/notifications/clear/"),
};
