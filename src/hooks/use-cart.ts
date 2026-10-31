"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cartService } from "@/services/cart";
import { useCartStore } from "@/stores/cart-store";
import { useLocalStore } from "@/stores/local-store";
import type { Cart } from "@/types/api";

/** Persist the guest token the server hands back; drop it once the bag belongs to an account. */
function remember(cart: Cart) {
  const store = useCartStore.getState();
  if (cart.guest_token && cart.guest_token !== store.guestToken) store.setGuestToken(cart.guest_token);
  if (!cart.guest_token && store.guestToken) store.setGuestToken(null);
  return cart;
}

export function useCart() {
  const { hydrated } = useAuth();
  const query = useQuery({
    queryKey: queryKeys.cart,
    queryFn: () => cartService.get().then(remember),
    enabled: hydrated,
    staleTime: 30_000,
  });
  // Until device storage has loaded we don't know whose bag it is: show loading, never "empty".
  // Data is also withheld until then so streamed sections hydrate exactly like the server HTML.
  return { ...query, data: hydrated ? query.data : undefined, isLoading: query.isLoading || !hydrated };
}

export function useCartCount() {
  const { data } = useCart();
  return data?.quantity ?? 0;
}

function useCartMutation<V>(fn: (v: V) => Promise<Cart>, opts: { success?: string; silent?: boolean } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => fn(v).then(remember),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      if (opts.success) notify.success(opts.success);
    },
    onError: (e) => notify.error(e),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const { t } = useI18n();
  return useMutation({
    mutationFn: ({ variant, quantity = 1 }: { variant: string; quantity?: number; name?: string }) =>
      cartService.add(variant, quantity).then(remember),
    onSuccess: (cart, vars) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      notify.action(t("product.addedToBag"), vars.name ?? "", {
        label: t("product.viewBag"),
        onClick: openDrawer,
      });
    },
    onError: (e) => notify.error(e),
  });
}

/** Quantity changes are optimistic so the stepper feels instant even on slow networks. */
export function useSetQuantity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.setQuantity(itemId, quantity).then(remember),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previous = queryClient.getQueryData<Cart>(queryKeys.cart);
      if (previous) {
        const items = previous.items
          .map((i) => (i.id === itemId ? { ...i, quantity, line_total: i.unit_price * quantity } : i))
          .filter((i) => i.quantity > 0);
        const subtotal = items.reduce((s, i) => s + i.line_total, 0);
        queryClient.setQueryData<Cart>(queryKeys.cart, {
          ...previous,
          items,
          subtotal,
          quantity: items.reduce((s, i) => s + i.quantity, 0),
          item_count: items.length,
        });
      }
      return { previous };
    },
    onError: (e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.cart, ctx.previous);
      notify.error(e);
    },
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart, cart),
  });
}

export function useRemoveFromCart() {
  const { t } = useI18n();
  return useCartMutation((itemId: string) => cartService.remove(itemId), { success: t("cart.removed") });
}

export function useApplyCoupon() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, email }: { code: string; email?: string }) =>
      cartService.applyCoupon(code, email).then(remember),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKeys.cart, cart);
      if (cart.coupon_code) notify.success(t("cart.couponApplied"), cart.coupon_message);
      else if (cart.coupon_message) notify.warning(cart.coupon_message);
    },
    onError: (e) => notify.error(e),
  });
}

export function useRemoveCoupon() {
  const { t } = useI18n();
  return useCartMutation(() => cartService.removeCoupon(), { success: t("cart.couponRemoved") });
}

/** Wishlist: server-backed when signed in, device-local for guests. */
export function useWishlist() {
  const { isAuthenticated, hydrated } = useAuth();
  const local = useLocalStore((s) => s.wishlist);
  const query = useQuery({
    queryKey: queryKeys.wishlist,
    queryFn: cartService.wishlist,
    enabled: hydrated && isAuthenticated,
    staleTime: 60_000,
  });
  const slugs = isAuthenticated ? (query.data?.results.map((r) => r.product.slug) ?? []) : local;
  return { ...query, slugs, has: (slug: string) => slugs.includes(slug), count: slugs.length };
}

export function useToggleWishlist() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const toggleLocal = useLocalStore((s) => s.toggleWishlist);
  const { t } = useI18n();
  return useMutation({
    mutationFn: async ({ slug }: { slug: string; name?: string }) => {
      if (!isAuthenticated) return { wishlisted: toggleLocal(slug) };
      return cartService.toggleWishlist(slug);
    },
    onSuccess: (res) => {
      if (isAuthenticated) queryClient.invalidateQueries({ queryKey: queryKeys.wishlist });
      if (res.wishlisted) notify.success(t("product.savedToWishlist"));
      else notify.info(t("product.removedFromWishlist"));
    },
    onError: (e) => notify.error(e),
  });
}
