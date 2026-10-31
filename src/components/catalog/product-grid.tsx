import { PackageSearch } from "lucide-react";

import { ProductCard } from "@/components/catalog/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types/api";

export function ProductGrid({ products, loading, columns = 4, emptyTitle = "No products match", emptyDescription = "Try removing a filter or searching for something else.", className, action }: { products?: ProductCardType[]; loading?: boolean; columns?: 3 | 4; emptyTitle?: string; emptyDescription?: string; className?: string; action?: React.ReactNode }) {
  const grid = cn("grid grid-cols-2 gap-3 sm:gap-5", columns === 4 ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3", className);
  if (loading && !products?.length) {
    return <div className={grid}>{Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}</div>;
  }
  if (!products?.length) return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} action={action} />;
  return (
    <div className={cn(grid, loading && "opacity-60 transition-opacity")}>
      {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} priority={i < 4} />)}
    </div>
  );
}
