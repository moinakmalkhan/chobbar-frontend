import { ProductCard } from "@/components/catalog/product-card";
import type { ProductCard as Card } from "@/types/api";

export function ProductGrid({ products, priorityCount = 4 }: { products: Card[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} priority={i < priorityCount} />
      ))}
    </div>
  );
}
