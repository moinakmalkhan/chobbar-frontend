"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { type AddToCartPayload, cartService } from "@/services/cart";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import type { Cart } from "@/types/api";

export function useCart(options: { enabled?: boolean } = {}) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const setGuestToken = useCartStore((s) => s.setGuestToken);
  const query = useQuery({
    queryKey: queryKeys.cart,
    queryFn: cartService.get,
    enabled: hydrated && (options.enabled ?? true),
    staleTime: 30_000,
  });
  useEffect(() => {
    if (query.data?.guest_token) setGuestToken(query.data.guest_token);
  }, [query.data?.guest_token, setGuestToken]);
  return query;
}

export function useCartMutations() {
  const queryClient = useQueryClient();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const setGuestToken = useCartStore((s) => s.setGuestToken);

  const setCart = (cart: Cart) => {
    queryClient.setQueryData(queryKeys.cart, cart);
    if (cart.guest_token) setGuestToken(cart.guest_token);
  };

  const add = useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.add(payload),
    onSuccess: (cart, payload) => {
      setCart(cart);
      const qty = payload.breakdown.reduce((n, l) => n + l.quantity, 0);
      notify.action("Added to cart", `${qty} pieces configured and priced.`, { label: "View cart", onClick: openDrawer });
    },
    onError: (e) => notify.error(e, "Couldn't add to cart"),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddToCartPayload> }) => cartService.updateItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      notify.success("Cart updated", "Prices refreshed with your changes.");
    },
    onError: (e) => notify.error(e, "Couldn't update item"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => cartService.removeItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart });
      const previous = queryClient.getQueryData<Cart>(queryKeys.cart);
      if (previous) {
        const items = previous.items.filter((i) => i.id !== id);
        queryClient.setQueryData<Cart>(queryKeys.cart, {
          ...previous,
          items,
          item_count: items.length,
          quantity: items.reduce((n, i) => n + i.quantity, 0),
          subtotal: items.reduce((n, i) => n + Number(i.line_total), 0),
        });
      }
      return { previous };
    },
    onError: (e, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.cart, ctx.previous);
      notify.error(e, "Couldn't remove item");
    },
    onSuccess: () => notify.success("Removed from cart"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  });

  const clear = useMutation({
    mutationFn: cartService.clear,
    onSuccess: (cart) => {
      setCart(cart);
      notify.info("Cart cleared");
    },
    onError: (e) => notify.error(e),
  });

  const setNotes = useMutation({
    mutationFn: (notes: string) => cartService.setNotes(notes),
    onSuccess: (cart) => setCart(cart),
  });

  return { add, update, remove, clear, setNotes };
}
