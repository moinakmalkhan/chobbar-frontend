import { api } from "@/lib/api";
import type { BreakdownLine, Cart, CartItem, Paginated, SavedList } from "@/types/api";

export interface AddToCartPayload {
  product: string;
  fabric?: string | null;
  breakdown: BreakdownLine[];
  color?: string;
  customization?: Record<string, unknown>;
  notes?: string;
  artwork?: File | null;
}

function toFormData(payload: Record<string, unknown>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) form.append(key, value);
    else if (typeof value === "object") form.append(key, JSON.stringify(value));
    else form.append(key, String(value));
  }
  return form;
}

export const cartService = {
  get: () => api.get<Cart>("/cart/").then((r) => r.data),
  add: (payload: AddToCartPayload) =>
    payload.artwork
      ? api.post<Cart>("/cart/", toFormData(payload as unknown as Record<string, unknown>)).then((r) => r.data)
      : api.post<Cart>("/cart/", payload).then((r) => r.data),
  updateItem: (id: string, payload: Partial<AddToCartPayload>) => api.patch<CartItem>(`/cart/items/${id}/`, payload).then((r) => r.data),
  removeItem: (id: string) => api.delete(`/cart/items/${id}/`),
  clear: () => api.delete<Cart>("/cart/").then((r) => r.data),
  setNotes: (notes: string) => api.patch<Cart>("/cart/", { notes }).then((r) => r.data),
  quickOrder: (lines: { sku: string; gender: string; size: string; quantity: number }[]) =>
    api.post<{ added: number; errors: { sku: string; error: string }[]; cart: Cart }>("/cart/quick-order/", { lines }).then((r) => r.data),
  savedLists: (page = 1) => api.get<Paginated<SavedList>>("/cart/saved-lists/", { params: { page } }).then((r) => r.data),
  savedList: (id: string) => api.get<SavedList>(`/cart/saved-lists/${id}/`).then((r) => r.data),
  createSavedList: (payload: { name: string; description?: string; is_shared?: boolean }) => api.post<SavedList>("/cart/saved-lists/", payload).then((r) => r.data),
  saveCartAsList: (name: string, description = "") => api.post<SavedList>("/cart/saved-lists/from-cart/", { name, description }).then((r) => r.data),
  addListToCart: (id: string) => api.post<{ added: number; detail: string }>(`/cart/saved-lists/${id}/add-to-cart/`).then((r) => r.data),
  deleteSavedList: (id: string) => api.delete(`/cart/saved-lists/${id}/`),
};
