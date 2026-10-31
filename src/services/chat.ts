import { api } from "@/lib/api";
import type { ChatMessage, Conversation, CursorPage, Paginated } from "@/types/api";

export const chatService = {
  conversations: (page = 1) =>
    api.get<Paginated<Conversation>>("/chat/conversations/", { params: { page } }).then((r) => r.data),
  conversation: (id: string) => api.get<Conversation>(`/chat/conversations/${id}/`).then((r) => r.data),
  start: (data: { body: string; subject?: string; order?: string; topic?: string }) =>
    api.post<Conversation>("/chat/conversations/", data).then((r) => r.data),
  messages: (id: string, cursor?: string | null) =>
    api.get<CursorPage<ChatMessage>>(cursor ?? `/chat/conversations/${id}/messages/`).then((r) => r.data),
  send: (id: string, data: FormData) =>
    api.post<ChatMessage>(`/chat/conversations/${id}/messages/`, data).then((r) => r.data),
  read: (id: string) => api.post(`/chat/conversations/${id}/read/`),
  close: (id: string) => api.post<Conversation>(`/chat/conversations/${id}/close/`).then((r) => r.data),
  unread: () => api.get<{ count: number }>("/chat/conversations/unread-count/").then((r) => r.data.count),
};
