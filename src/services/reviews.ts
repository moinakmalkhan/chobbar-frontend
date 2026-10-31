import { api } from "@/lib/api";
import type { Paginated, Review, ReviewSummary } from "@/types/api";

export const reviewsService = {
  list: (params: { product?: string; page?: number; rating?: number; ordering?: string; mine?: 1 }) =>
    api.get<Paginated<Review>>("/reviews/", { params }).then((r) => r.data),
  summary: (product: string) =>
    api.get<ReviewSummary>("/reviews/summary/", { params: { product } }).then((r) => r.data),
  create: (data: FormData) => api.post<Review>("/reviews/", data).then((r) => r.data),
  remove: (id: string) => api.delete(`/reviews/${id}/`),
  helpful: (id: string) =>
    api.post<{ helpful: boolean; helpful_count: number }>(`/reviews/${id}/helpful/`).then((r) => r.data),
};
