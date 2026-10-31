"use client";

import { useQuery } from "@tanstack/react-query";

import { ProductGrid } from "@/components/catalog/product-grid";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-client";
import { searchService } from "@/services/search";

/** Recently viewed + recommendations — only rendered when there's something personal to show. */
export function PersonalisedRow() {
  const { hydrated, isAuthenticated } = useAuth();
  const recent = useQuery({ queryKey: queryKeys.recentlyViewed, queryFn: searchService.recentlyViewed, enabled: hydrated, staleTime: 60_000 });
  const reco = useQuery({ queryKey: queryKeys.recommendations(), queryFn: () => searchService.recommendations(), enabled: hydrated && isAuthenticated, staleTime: 5 * 60_000 });
  const showRecent = (recent.data?.length ?? 0) > 0;
  const showReco = (reco.data?.length ?? 0) > 0;
  if (!showRecent && !showReco) return null;
  return (
    <section className="container-x space-y-14 py-14 lg:py-20">
      {showReco ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Picked for you</p>
          <h2 className="mb-6 mt-1 font-display text-2xl font-bold">Based on what your club orders</h2>
          <ProductGrid products={reco.data!.slice(0, 4)} />
        </div>
      ) : null}
      {showRecent ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Recently viewed</p>
          <h2 className="mb-6 mt-1 font-display text-2xl font-bold">Pick up where you left off</h2>
          <ProductGrid products={recent.data!.slice(0, 4)} />
        </div>
      ) : null}
    </section>
  );
}
