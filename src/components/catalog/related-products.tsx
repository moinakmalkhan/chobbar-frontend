"use client";

import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/catalog/product-grid";
import { queryKeys } from "@/lib/query-client";
import { catalogService } from "@/services/catalog";
import { searchService } from "@/services/search";

export function RelatedProducts({ slug }: { slug: string }) {
  const related = useQuery({ queryKey: queryKeys.related(slug), queryFn: () => catalogService.related(slug), staleTime: 15 * 60_000 });
  const together = useQuery({ queryKey: queryKeys.recommendations(slug), queryFn: () => searchService.recommendations(slug), staleTime: 15 * 60_000 });
  const togetherIds = new Set((together.data ?? []).map((p) => p.id));
  const relatedOnly = (related.data ?? []).filter((p) => !togetherIds.has(p.id));
  return (
    <div className="mt-16 space-y-14">
      {together.data?.length ? (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Frequently ordered together</p>
          <h2 className="mb-6 mt-1 font-display text-2xl font-bold">Complete the kit</h2>
          <ProductGrid products={together.data.slice(0, 4)} />
        </section>
      ) : null}
      {relatedOnly.length ? (
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">You may also like</p>
          <h2 className="mb-6 mt-1 font-display text-2xl font-bold">More from this range</h2>
          <ProductGrid products={relatedOnly.slice(0, 4)} />
        </section>
      ) : null}
    </div>
  );
}
