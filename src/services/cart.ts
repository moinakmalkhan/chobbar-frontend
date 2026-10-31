import { api } from "@/lib/api";
import type { Cart, WishlistResponse } from "@/types/api";

export const cartService = {
  get: () => api.get<Cart>("/cart/").then((r) => r.data),
  add: (variant: string, quantity = 1) => api.post<Cart>("/cart/", { variant, quantity }).then((r) => r.data),
  setQuantity: (itemId: string, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}/`, { quantity }).then((r) => r.data),
  remove: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}/`).then((r) => r.data),
  clear: () => api.delete<Cart>("/cart/").then((r) => r.data),
  notes: (notes: string) => api.patch<Cart>("/cart/", { notes }).then((r) => r.data),
  applyCoupon: (code: string, email?: string) =>
    api.post<Cart>("/cart/coupon/", { code, ...(email ? { email } : {}) }).then((r) => r.data),
  removeCoupon: () => api.delete<Cart>("/cart/coupon/").then((r) => r.data),
  wishlist: () => api.get<WishlistResponse>("/cart/wishlist/").then((r) => r.data),
  toggleWishlist: (product: string, variant?: string) =>
    api
      .post<{ wishlisted: boolean; detail: string }>("/cart/wishlist/", {
        product,
        ...(variant ? { variant } : {}),
      })
      .then((r) => r.data),
};
