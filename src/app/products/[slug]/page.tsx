import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductConfigurator } from "@/components/catalog/product-configurator";
import { RelatedProducts } from "@/components/catalog/related-products";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { serverGet } from "@/lib/server-api";
import type { ProductDetail } from "@/types/api";

export const revalidate = 300;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await serverGet<ProductDetail>(`/catalog/products/${slug}/`);
  if (!product) return { title: "Product" };
  return {
    title: product.meta_title || `${product.name} — wholesale from $${Number(product.base_price).toFixed(2)}`,
    description: product.meta_description || product.short_description,
    openGraph: { images: product.image ? [product.image.url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await serverGet<ProductDetail>(`/catalog/products/${slug}/`);
  if (!product) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short_description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Leepa Sports" },
    offers: { "@type": "Offer", priceCurrency: "USD", price: product.base_price, availability: "https://schema.org/MadeToOrder", eligibleQuantity: { "@type": "QuantitativeValue", minValue: product.min_order_quantity } },
  };
  return (
    <div className="container-x py-6 lg:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ name: "Products", href: "/products" }, ...product.breadcrumbs.map((b) => ({ name: b.name, href: `/categories/${b.slug}` })), { name: product.name }]} />
      <ProductConfigurator product={product} />
      <RelatedProducts slug={product.slug} />
    </div>
  );
}
