import { api } from "@/lib/api";
import type { ProductCard, SearchResponse, SuggestResponse } from "@/types/api";
import type { ProductListParams } from "@/services/catalog";

export const searchService = {
  suggest: (q: string, signal?: AbortSignal) => api.get<SuggestResponse>("/search/suggest/", { params: { q }, signal }).then((r) => r.data),
  search: (params: ProductListParams & { q: string }) => api.get<SearchResponse>("/search/", { params, paramsSerializer: { indexes: null } }).then((r) => r.data),
  trending: () => api.get<{ queries: string[] }>("/search/trending/").then((r) => r.data.queries),
  recommendations: (product?: string) => api.get<ProductCard[]>("/search/recommendations/", { params: product ? { product } : {} }).then((r) => r.data),
  recentlyViewed: () => api.get<ProductCard[]>("/search/recently-viewed/").then((r) => r.data),
};
