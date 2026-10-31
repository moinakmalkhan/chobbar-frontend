import { api } from "@/lib/api";
import type { BreakdownLine, CategoryDetail, CategoryNode, Fabric, Paginated, PriceBreakdown, ProductCard, ProductDetail } from "@/types/api";

export interface ProductListParams {
  page?: number;
  page_size?: number;
  category?: string;
  gender?: string[];
  fabric?: string;
  quality?: string[];
  min_price?: number;
  max_price?: number;
  max_moq?: number;
  featured?: boolean;
  new?: boolean;
  tag?: string;
  ordering?: string;
  ids?: string;
}

export const catalogService = {
  categories: () => api.get<CategoryNode[]>("/catalog/categories/").then((r) => r.data),
  category: (slug: string) => api.get<CategoryDetail>(`/catalog/categories/${slug}/`).then((r) => r.data),
  products: (params: ProductListParams) =>
    api.get<Paginated<ProductCard>>("/catalog/products/", { params, paramsSerializer: { indexes: null } }).then((r) => r.data),
  product: (slug: string) => api.get<ProductDetail>(`/catalog/products/${slug}/`).then((r) => r.data),
  related: (slug: string) => api.get<ProductCard[]>(`/catalog/products/${slug}/related/`).then((r) => r.data),
  featured: () => api.get<ProductCard[]>("/catalog/products/featured/").then((r) => r.data),
  priceRange: () => api.get<{ min: number; max: number }>("/catalog/products/price-range/").then((r) => r.data),
  fabrics: () => api.get<Fabric[]>("/catalog/fabrics/").then((r) => r.data),
  price: (payload: { product: string; fabric?: string | null; breakdown: BreakdownLine[] }) =>
    api.post<PriceBreakdown>("/pricing/quote/", payload).then((r) => r.data),
};
