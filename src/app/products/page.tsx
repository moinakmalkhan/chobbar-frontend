import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListing } from "@/components/catalog/product-listing";
import { serverGet } from "@/lib/server-api";
import type { Paginated, ProductCard } from "@/types/api";

export const metadata: Metadata = { title: "All products", description: "Wholesale teamwear, training kit, outerwear and accessories. Configure fabric and sizes for live pricing." };
export const revalidate = 300;

export default async function ProductsPage() {
  const initial = await serverGet<Paginated<ProductCard>>("/catalog/products/", { searchParams: { page_size: 24 } });
  return (
    <div className="container-x py-8 lg:py-12">
      <Suspense>
        <ProductListing title="All products" initialData={initial} />
      </Suspense>
    </div>
  );
}
