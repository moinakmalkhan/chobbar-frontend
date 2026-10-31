import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import type { ProductCard } from "@/types/api";

export function FeaturedProducts({ products }: { products: ProductCard[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface py-14 lg:py-20">
      <div className="container-x">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Best sellers</p>
            <h2 className="mt-1 font-display text-3xl font-bold">What clubs reorder every season</h2>
          </div>
          <Link href="/products?featured=true" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:underline sm:flex">See all <ArrowUpRight className="size-4" /></Link>
        </div>
        <ProductGrid products={products.slice(0, 8)} />
      </div>
    </section>
  );
}
