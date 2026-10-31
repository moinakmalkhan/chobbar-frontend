"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { catalogService, withoutPaging } from "@/services/catalog";
import { contentService } from "@/services/content";
import { searchService } from "@/services/search";
import type {
  CategoryNode,
  Paginated,
  ProductCard,
  ProductDetail,
  ProductQuery,
  Storefront,
} from "@/types/api";

export function useStorefront(initialData?: Storefront | null) {
  return useQuery({
    queryKey: queryKeys.storefront,
    queryFn: contentService.storefront,
    initialData: initialData ?? undefined,
    staleTime: 5 * 60_000,
  });
}

export function useCategories(initialData?: CategoryNode[] | null) {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: catalogService.categories,
    initialData: initialData ?? undefined,
    staleTime: 10 * 60_000,
  });
}

export function useProducts(params: ProductQuery, initialData?: Paginated<ProductCard> | null) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => (params.q ? searchService.search(params) : catalogService.products(params)),
    initialData: initialData ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useFacets(params: ProductQuery) {
  const rest = withoutPaging(params);
  return useQuery({
    queryKey: queryKeys.facets(rest),
    queryFn: () => catalogService.facets(rest),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

export function useProduct(slug: string, initialData?: ProductDetail | null) {
  return useQuery({
    queryKey: queryKeys.product(slug),
    queryFn: () => catalogService.product(slug),
    initialData: initialData ?? undefined,
    staleTime: 60_000,
  });
}

export function useRelated(slug: string) {
  return useQuery({
    queryKey: queryKeys.related(slug),
    queryFn: () => catalogService.related(slug),
    staleTime: 10 * 60_000,
  });
}

export function useFeed(
  name: "featured" | "new-arrivals" | "best-sellers",
  initialData?: ProductCard[] | null,
) {
  return useQuery({
    queryKey: queryKeys.feed(name),
    queryFn: () => catalogService.feed(name),
    initialData: initialData ?? undefined,
    staleTime: 5 * 60_000,
  });
}

export function useRecommendations(slug?: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.recommendations(slug),
    queryFn: () => searchService.recommendations(slug),
    enabled,
    staleTime: 10 * 60_000,
  });
}

/** Cards for a list of slugs (guest wishlist), one request. */
export function useProductsBySlugs(slugs: string[]) {
  return useQuery({
    queryKey: ["products", "slugs", slugs],
    queryFn: () => catalogService.products({ slugs: slugs.join(","), page_size: 100 }),
    enabled: slugs.length > 0,
    placeholderData: keepPreviousData,
  });
}
