import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductView } from "@/components/catalog/product-view";
import { RelatedProducts } from "@/components/catalog/related-products";
import { ReviewsSection } from "@/components/catalog/reviews-section";
import { RecentlyViewed } from "@/components/home/home-sections";
import { isLocale, type Locale } from "@/i18n/config";
import { env, SITE } from "@/lib/env";
import { serverGet } from "@/lib/server-api";
import type { ProductDetail } from "@/types/api";

type Props = { params: Promise<{ locale: string; slug: string }> };

async function load(slug: string, locale: Locale) {
  return serverGet<ProductDetail>(`/catalog/products/${slug}/`, { locale, revalidate: 120 });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await load(slug, isLocale(locale) ? locale : "en");
  if (!product) return {};
  const image = product.images[0]?.url;
  return {
    title: product.meta_title || product.name,
    description: product.meta_description || product.short_description,
    alternates: { canonical: `/${locale}/products/${slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.short_description,
      images: image ? [{ url: image, width: 800, height: 1000 }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : "en";
  const product = await load(slug, locale);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || SITE.name },
    description: product.short_description || product.description,
    image: product.images.map((i) => i.url),
    category: product.category_name,
    ...(product.rating_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating_avg,
            reviewCount: product.rating_count,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      url: `${env.siteUrl}/${locale}/products/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price,
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductView initial={product} />
      <ReviewsSection productSlug={product.slug} productName={product.name} />
      <RelatedProducts slug={product.slug} />
      <RecentlyViewed excludeSlug={product.slug} />
    </>
  );
}
