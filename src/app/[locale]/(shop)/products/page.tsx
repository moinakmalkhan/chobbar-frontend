import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListing } from "@/components/catalog/product-listing";
import { ListingHeader } from "@/components/catalog/listing-header";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { isLocale, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { serverGet } from "@/lib/server-api";
import type { Paginated, ProductCard } from "@/types/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getT(isLocale(locale) ? locale : "en");
  return { title: t("nav.allProducts"), alternates: { canonical: `/${locale}/products` } };
}

export default async function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const [t, initial] = await Promise.all([
    getT(locale),
    serverGet<Paginated<ProductCard>>("/catalog/products/", { locale, searchParams: { page_size: 24 } }),
  ]);
  return (
    <div className="container-x py-8">
      <ListingHeader title={t("nav.allProducts")} crumbs={[{ label: t("nav.allProducts") }]} />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing base={{}} initialData={initial} />
      </Suspense>
    </div>
  );
}
