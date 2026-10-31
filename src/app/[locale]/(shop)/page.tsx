import { Hero } from "@/components/home/hero";
import {
  CategoryTiles,
  CollectionsGrid,
  FeedRail,
  ForYou,
  MadeInSialkot,
  Perks,
  PromoBanners,
  RecentlyViewed,
  SaleRail,
} from "@/components/home/home-sections";
import { isLocale, type Locale } from "@/i18n/config";
import { getT } from "@/i18n/server";
import { env, SITE } from "@/lib/env";
import { serverGet } from "@/lib/server-api";
import type { CategoryNode, Collection, Paginated, ProductCard, Storefront } from "@/types/api";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const opts = { locale, revalidate: 300 };
  const [t, storefront, categories, collections, fresh, best, sale] = await Promise.all([
    getT(locale),
    serverGet<Storefront>("/content/storefront/", opts),
    serverGet<CategoryNode[]>("/catalog/categories/", opts),
    serverGet<Collection[]>("/catalog/collections/", opts),
    serverGet<ProductCard[]>("/catalog/products/new-arrivals/", opts),
    serverGet<ProductCard[]>("/catalog/products/best-sellers/", opts),
    serverGet<Paginated<ProductCard>>("/catalog/products/", {
      ...opts,
      searchParams: { on_sale: "true", page_size: 12, ordering: "-sales_count" },
    }),
  ]);
  const banners = storefront?.banners ?? [];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: env.siteUrl,
    logo: `${env.siteUrl}/brand/icon-512.png`,
    email: SITE.supportEmail,
    address: { "@type": "PostalAddress", addressLocality: "Sialkot", addressCountry: "PK" },
    potentialAction: {
      "@type": "SearchAction",
      target: `${env.siteUrl}/${locale}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Hero banners={banners.filter((b) => b.placement === "hero")} />
      <Perks />
      <CategoryTiles categories={(categories ?? []).filter((c) => c.show_in_menu)} />
      <FeedRail
        feed="new-arrivals"
        title={t("home.newArrivals")}
        subtitle={t("home.newArrivalsSub")}
        href="/collections/new-arrivals"
        initial={fresh}
      />
      <PromoBanners banners={banners.filter((b) => b.placement === "promo")} />
      <FeedRail
        feed="best-sellers"
        title={t("home.bestSellers")}
        subtitle={t("home.bestSellersSub")}
        href="/collections/best-sellers"
        initial={best}
      />
      <SaleRail initial={sale} />
      <CollectionsGrid collections={collections ?? []} />
      <ForYou />
      <RecentlyViewed />
      <MadeInSialkot />
    </>
  );
}
