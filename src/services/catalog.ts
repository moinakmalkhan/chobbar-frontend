import { api } from "@/lib/api";
import type {
  CategoryDetail,
  CategoryNode,
  Collection,
  Facets,
  Paginated,
  ProductCard,
  ProductDetail,
  ProductQuery,
} from "@/types/api";

/** Drop empty values and join arrays so query strings stay short and cache keys stable. */
export function cleanParams(params: object) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    out[k] = Array.isArray(v) ? v.join(",") : String(v);
  }
  return out;
}

/** Facets don't depend on page/sort: drop them so the cache key (and request) is shared. */
export function withoutPaging(params: ProductQuery): ProductQuery {
  const rest = { ...params };
  delete rest.page;
  delete rest.page_size;
  delete rest.ordering;
  return rest;
}

export const catalogService = {
  categories: () => api.get<CategoryNode[]>("/catalog/categories/").then((r) => r.data),
  category: (slug: string) => api.get<CategoryDetail>(`/catalog/categories/${slug}/`).then((r) => r.data),
  collections: () => api.get<Collection[]>("/catalog/collections/").then((r) => r.data),
  collection: (slug: string) => api.get<Collection>(`/catalog/collections/${slug}/`).then((r) => r.data),
  products: (params: ProductQuery) =>
    api
      .get<Paginated<ProductCard>>("/catalog/products/", { params: cleanParams(params) })
      .then((r) => r.data),
  facets: (params: ProductQuery) =>
    api
      .get<Facets>("/catalog/products/facets/", { params: cleanParams(withoutPaging(params)) })
      .then((r) => r.data),
  product: (slug: string) => api.get<ProductDetail>(`/catalog/products/${slug}/`).then((r) => r.data),
  related: (slug: string) => api.get<ProductCard[]>(`/catalog/products/${slug}/related/`).then((r) => r.data),
  feed: (name: "featured" | "new-arrivals" | "best-sellers") =>
    api.get<ProductCard[]>(`/catalog/products/${name}/`).then((r) => r.data),
  notifyMe: (variant: string, email?: string) =>
    api
      .post<{ detail: string }>("/catalog/stock-alerts/", { variant, ...(email ? { email } : {}) })
      .then((r) => r.data),
};
