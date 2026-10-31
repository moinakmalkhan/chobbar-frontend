"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ProductCard } from "@/types/api";

/**
 * Data that belongs on the shopper's device:
 *  - guest wishlist (synced to the account on sign-in),
 *  - recently viewed products (instant render, no request),
 *  - recent searches,
 *  - last checkout contact + city so repeat guests don't retype.
 */
interface LocalState {
  wishlist: string[]; // product slugs
  recentlyViewed: ProductCard[];
  recentSearches: string[];
  checkoutContact: { email: string; phone: string; full_name: string; city: string; province: string } | null;
  toggleWishlist: (slug: string) => boolean;
  setWishlist: (slugs: string[]) => void;
  pushViewed: (product: ProductCard) => void;
  pushSearch: (q: string) => void;
  clearSearches: () => void;
  saveContact: (c: LocalState["checkoutContact"]) => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      recentlyViewed: [],
      recentSearches: [],
      checkoutContact: null,
      toggleWishlist: (slug) => {
        const has = get().wishlist.includes(slug);
        set({
          wishlist: has ? get().wishlist.filter((s) => s !== slug) : [slug, ...get().wishlist].slice(0, 100),
        });
        return !has;
      },
      setWishlist: (wishlist) => set({ wishlist }),
      pushViewed: (product) =>
        set({
          recentlyViewed: [product, ...get().recentlyViewed.filter((p) => p.slug !== product.slug)].slice(
            0,
            12,
          ),
        }),
      pushSearch: (q) => {
        const value = q.trim();
        if (value.length < 2) return;
        set({
          recentSearches: [
            value,
            ...get().recentSearches.filter((s) => s.toLowerCase() !== value.toLowerCase()),
          ].slice(0, 6),
        });
      },
      clearSearches: () => set({ recentSearches: [] }),
      saveContact: (checkoutContact) => set({ checkoutContact }),
    }),
    {
      name: "chobbar.local",
      // Rehydrated after mount (see Providers) so server HTML and the first client render match.
      skipHydration: true,
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
