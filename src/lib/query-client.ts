"use client";

import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error: unknown) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: { retry: false },
    },
  });
}

export const queryKeys = {
  me: ["me"] as const,
  addresses: ["addresses"] as const,
  provinces: ["provinces"] as const,
  storefront: ["storefront"] as const,
  categories: ["categories"] as const,
  category: (slug: string) => ["category", slug] as const,
  collections: ["collections"] as const,
  products: (params: object) => ["products", params] as const,
  facets: (params: object) => ["facets", params] as const,
  product: (slug: string) => ["product", slug] as const,
  related: (slug: string) => ["product", slug, "related"] as const,
  feed: (name: string) => ["feed", name] as const,
  cart: ["cart"] as const,
  wishlist: ["wishlist"] as const,
  shippingQuote: (params: object) => ["shipping-quote", params] as const,
  paymentMethods: ["payment-methods"] as const,
  bankAccounts: ["bank-accounts"] as const,
  orders: (params: object) => ["orders", params] as const,
  order: (id: string) => ["order", id] as const,
  ordersSummary: ["orders", "summary"] as const,
  returns: ["returns"] as const,
  payments: (orderId: string) => ["payments", orderId] as const,
  reviews: (params: object) => ["reviews", params] as const,
  reviewSummary: (slug: string) => ["reviews", "summary", slug] as const,
  notifications: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  suggest: (q: string) => ["suggest", q] as const,
  search: (params: object) => ["search", params] as const,
  trending: ["trending"] as const,
  recommendations: (slug?: string) => ["recommendations", slug ?? "me"] as const,
  recentlyViewed: ["recently-viewed"] as const,
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversation", id] as const,
  messages: (id: string) => ["conversation", id, "messages"] as const,
  chatUnread: ["conversations", "unread"] as const,
  tracking: (n: string, c: string) => ["tracking", n, c] as const,
  faq: ["faq"] as const,
  page: (slug: string) => ["page", slug] as const,
};
