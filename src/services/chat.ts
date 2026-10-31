import { api } from "@/lib/api";
import type { ChatMessage, Conversation, CursorPage, Paginated } from "@/types/api";

export const chatService = {
  conversations: (params: { page?: number; status?: string } = {}) => api.get<Paginated<Conversation>>("/chat/conversations/", { params }).then((r) => r.data),
  conversation: (id: string) => api.get<Conversation>(`/chat/conversations/${id}/`).then((r) => r.data),
  start: (payload: { subject?: string; body: string; order?: string | null; quote?: string | null }) => api.post<Conversation>("/chat/conversations/", payload).then((r) => r.data),
  messages: (id: string, cursor?: string | null) => api.get<CursorPage<ChatMessage>>(`/chat/conversations/${id}/messages/`, { params: { cursor: cursor ?? undefined } }).then((r) => r.data),
  send: (id: string, payload: { body?: string; attachment?: File | null; client_id?: string }) => {
    if (payload.attachment) {
      const form = new FormData();
      form.append("attachment", payload.attachment);
      if (payload.body) form.append("body", payload.body);
      if (payload.client_id) form.append("client_id", payload.client_id);
      return api.post<ChatMessage>(`/chat/conversations/${id}/messages/`, form).then((r) => r.data);
    }
    return api.post<ChatMessage>(`/chat/conversations/${id}/messages/`, payload).then((r) => r.data);
  },
  markRead: (id: string) => api.post(`/chat/conversations/${id}/read/`),
  close: (id: string) => api.post<Conversation>(`/chat/conversations/${id}/close/`).then((r) => r.data),
  unreadCount: () => api.get<{ count: number }>("/chat/conversations/unread-count/").then((r) => r.data.count),
};
