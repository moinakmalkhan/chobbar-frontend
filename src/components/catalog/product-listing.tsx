"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ActiveFilterChips, FilterPanel, MobileFilters, SortSelect, useFilterParams } from "@/components/catalog/product-filters";
import { ProductGrid } from "@/components/catalog/product-grid";
import { Pagination } from "@/components/ui/pagination";
import { useProducts } from "@/hooks/use-catalog";
import type { ProductListParams } from "@/services/catalog";
import type { CategoryNode, Paginated, ProductCard } from "@/types/api";

export function paramsFromSearch(sp: URLSearchParams, base: Partial<ProductListParams> = {}): ProductListParams {
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    page: num("page") ?? 1,
    page_size: 24,
    category: base.category ?? sp.get("category") ?? undefined,
    gender: sp.getAll("gender"),
    quality: sp.getAll("quality"),
    fabric: sp.get("fabric") ?? undefined,
    min_price: num("min_price"),
    max_price: num("max_price"),
    max_moq: num("max_moq"),
    ordering: sp.get("ordering") ?? undefined,
    ...base,
  };
}

export function ProductListing({ base = {}, subcategories, initialData, title, description }: { base?: Partial<ProductListParams>; subcategories?: CategoryNode[]; initialData?: Paginated<ProductCard> | null; title?: string; description?: string }) {
  const sp = useSearchParams();
  const { set } = useFilterParams();
  const params = useMemo(() => paramsFromSearch(sp, base), [sp, base]);
  const isDefault = !sp.toString();
  const query = useProducts(params);
  const data = query.data ?? (isDefault ? initialData ?? undefined : undefined);

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 scrollbar-none">
          <FilterPanel>{subcategories}</FilterPanel>
        </div>
      </aside>
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title ? <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1> : null}
            <p className="text-sm text-muted-foreground">{description ?? (data ? `${data.count.toLocaleString()} products` : "Loading…")}</p>
          </div>
          <div className="flex items-center gap-2">
            <MobileFilters>{subcategories}</MobileFilters>
            <SortSelect />
          </div>
        </div>
        <div className="mb-4"><ActiveFilterChips /></div>
        <ProductGrid products={data?.results} loading={query.isFetching && !data} action={<button type="button" onClick={() => set({ gender: null, quality: null, fabric: null, min_price: null, max_price: null, max_moq: null })} className="text-sm font-medium text-brand-600 underline">Clear filters</button>} />
        {data ? <Pagination className="mt-8" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={(p) => { set({ page: String(p) }, false); window.scrollTo({ top: 0, behavior: "smooth" }); }} /> : null}
      </section>
    </div>
  );
}
