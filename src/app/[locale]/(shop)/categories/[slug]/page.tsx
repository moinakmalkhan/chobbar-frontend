import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ListingHeader } from "@/components/catalog/listing-header";
import { ProductListing } from "@/components/catalog/product-listing";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { isLocale, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { serverGet } from "@/lib/server-api";
import type { CategoryDetail, Paginated, ProductCard } from "@/types/api";

type Props = { params: Promise<{ locale: string; slug: string }> };

async function load(slug: string, locale: Locale) {
  return serverGet<CategoryDetail>(`/catalog/categories/${slug}/`, { locale });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await load(slug, isLocale(locale) ? locale : "en");
  if (!category) return {};
  return {
    title: category.meta_title || category.name,
    description: category.meta_description || category.description || undefined,
    alternates: { canonical: `/${locale}/categories/${slug}` },
    openGraph: category.image ? { images: [category.image] } : undefined,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const [t, category, initial] = await Promise.all([
    getT(locale),
    load(slug, locale),
    serverGet<Paginated<ProductCard>>("/catalog/products/", {
      locale,
      searchParams: { category: slug, page_size: 24 },
    }),
  ]);
  if (!category) notFound();
  const genderScoped =
    ["men", "women", "kids"].includes(slug) ||
    category.breadcrumbs.some((b) => ["men", "women", "kids"].includes(b.slug));
  return (
    <div className="container-x py-8">
      <ListingHeader
        title={category.name}
        description={category.description}
        count={category.product_count}
        crumbs={[
          { label: t("nav.shop"), href: "/products" },
          ...category.breadcrumbs.map((b) => ({ label: b.name, href: `/categories/${b.slug}` })),
        ]}
        chips={category.children.map((c) => ({ label: c.name, href: `/categories/${c.slug}` }))}
      />
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing base={{ category: slug }} initialData={initial} hideGender={genderScoped} />
      </Suspense>
    </div>
  );
}
