import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ListingHeader } from "@/components/catalog/listing-header";
import { ProductListing } from "@/components/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { isLocale, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { serverGet } from "@/lib/server-api";
import type { Collection, Paginated, ProductCard } from "@/types/api";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = await serverGet<Collection>(`/catalog/collections/${slug}/`, {
    locale: isLocale(locale) ? locale : "en",
  });
  if (!c) return {};
  return {
    title: c.name,
    description: c.tagline || c.description || undefined,
    alternates: { canonical: `/${locale}/collections/${slug}` },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const [t, collection, initial] = await Promise.all([
    getT(locale),
    serverGet<Collection>(`/catalog/collections/${slug}/`, { locale }),
    serverGet<Paginated<ProductCard>>("/catalog/products/", {
      locale,
      searchParams: { collection: slug, page_size: 24 },
    }),
  ]);
  if (!collection) notFound();
  return (
    <div className="container-x py-8">
      <ListingHeader
        title={collection.name}
        description={collection.tagline || collection.description}
        count={collection.product_count}
        image={collection.image}
        crumbs={[{ label: t("nav.collections") }, { label: collection.name }]}
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing base={{ collection: slug }} initialData={initial} />
      </Suspense>
    </div>
  );
}
