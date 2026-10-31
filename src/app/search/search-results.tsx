"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ActiveFilterChips, FilterPanel, MobileFilters, SortSelect, useFilterParams } from "@/components/catalog/product-filters";
import { ProductGrid } from "@/components/catalog/product-grid";
import { paramsFromSearch } from "@/components/catalog/product-listing";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { queryKeys } from "@/lib/query-client";
import { searchService } from "@/services/search";
import { useUIStore } from "@/stores/ui-store";

export function SearchResults() {
  const sp = useSearchParams();
  const { set } = useFilterParams();
  const q = sp.get("q")?.trim() ?? "";
  const params = useMemo(() => ({ ...paramsFromSearch(sp), q }), [sp, q]);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const query = useQuery({ queryKey: queryKeys.search(params), queryFn: () => searchService.search(params), placeholderData: keepPreviousData, enabled: q.length > 0 });
  const data = query.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-24"><FilterPanel /></div></aside>
      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Search</p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{q ? <>Results for “{q}”</> : "Search the catalog"}</h1>
            <p className="text-sm text-muted-foreground">{data ? `${data.count.toLocaleString()} products` : q ? "Searching…" : "Type to search products, categories, fabrics and SKUs."}</p>
          </div>
          <div className="flex items-center gap-2"><MobileFilters /><SortSelect /></div>
        </div>
        <div className="mb-4"><ActiveFilterChips /></div>
        {!q ? (
          <EmptyState icon={SearchX} title="What are you looking for?" description="Try “sublimated soccer jersey”, “hoodie” or a SKU like LS-TRN-001." action={<button type="button" onClick={() => setSearchOpen(true)} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white">Open search</button>} />
        ) : (
          <>
            <ProductGrid
              products={data?.results}
              loading={query.isFetching && !data}
              emptyTitle={`Nothing matched “${q}”`}
              emptyDescription="Check the spelling or try a broader term. Our team can also source anything you don't see."
              action={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {(data?.suggestions ?? []).map((s) => <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-brand-400 hover:text-brand-600">{s}</Link>)}
                  <Link href="/products" className="text-sm font-medium text-brand-600 underline">Browse all products</Link>
                </div>
              }
            />
            {data ? <Pagination className="mt-8" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={(p) => { set({ page: String(p) }, false); window.scrollTo({ top: 0, behavior: "smooth" }); }} /> : null}
          </>
        )}
      </section>
    </div>
  );
}
