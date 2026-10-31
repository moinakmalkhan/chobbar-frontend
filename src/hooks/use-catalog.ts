"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-client";
import { catalogService, type ProductListParams } from "@/services/catalog";
import type { CategoryNode } from "@/types/api";

export function useCategories(initialData?: CategoryNode[]) {
  return useQuery({ queryKey: queryKeys.categories, queryFn: catalogService.categories, staleTime: 10 * 60_000, initialData });
}

export function useProducts(params: ProductListParams) {
  return useQuery({ queryKey: queryKeys.products(params), queryFn: () => catalogService.products(params), placeholderData: keepPreviousData });
}

export function useFabrics() {
  return useQuery({ queryKey: queryKeys.fabrics, queryFn: catalogService.fabrics, staleTime: 30 * 60_000 });
}

export function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((n) => [n, ...flattenCategories(n.children)]);
}
