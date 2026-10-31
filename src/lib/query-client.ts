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
  company: ["company"] as const,
  members: ["company", "members"] as const,
  invitations: ["company", "invitations"] as const,
  addresses: ["company", "addresses"] as const,
  categories: ["categories"] as const,
  category: (slug: string) => ["category", slug] as const,
  products: (params: object) => ["products", params] as const,
  product: (slug: string) => ["product", slug] as const,
  related: (slug: string) => ["product", slug, "related"] as const,
  featured: ["products", "featured"] as const,
  fabrics: ["fabrics"] as const,
  price: (params: object) => ["price", params] as const,
  cart: ["cart"] as const,
  savedLists: ["saved-lists"] as const,
  savedList: (id: string) => ["saved-lists", id] as const,
  shippingMethods: ["shipping-methods"] as const,
  bankAccounts: ["bank-accounts"] as const,
  orders: (params: object) => ["orders", params] as const,
  order: (id: string) => ["order", id] as const,
  invoice: (id: string) => ["order", id, "invoice"] as const,
  ordersSummary: ["orders", "summary"] as const,
  payments: (orderId: string) => ["payments", orderId] as const,
  quotes: (params: object) => ["quotes", params] as const,
  quote: (id: string) => ["quote", id] as const,
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
  tracking: (n: string, e: string) => ["tracking", n, e] as const,
};
