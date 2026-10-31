import type { Metadata } from "next";

import { CategoryShowcase } from "@/components/home/category-showcase";
import { FabricStrip } from "@/components/home/fabric-strip";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { PersonalisedRow } from "@/components/home/personalised-row";
import { TrustBar } from "@/components/home/trust-bar";
import { serverGet } from "@/lib/server-api";
import type { CategoryNode, Fabric, ProductCard } from "@/types/api";

export const metadata: Metadata = { title: "Leepa Sports — Wholesale Teamwear & Custom Sportswear Manufacturer" };
export const revalidate = 300;

export default async function HomePage() {
  const [categories, featured, fabrics] = await Promise.all([
    serverGet<CategoryNode[]>("/catalog/categories/"),
    serverGet<ProductCard[]>("/catalog/products/featured/"),
    serverGet<Fabric[]>("/catalog/fabrics/"),
  ]);
  return (
    <>
      <Hero />
      <TrustBar />
      <CategoryShowcase categories={categories ?? []} />
      <FeaturedProducts products={featured ?? []} />
      <HowItWorks />
      <FabricStrip fabrics={fabrics ?? []} />
      <PersonalisedRow />
    </>
  );
}
