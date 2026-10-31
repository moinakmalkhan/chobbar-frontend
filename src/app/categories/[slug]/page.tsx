import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductListing } from "@/components/catalog/product-listing";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { serverGet } from "@/lib/server-api";
import type { CategoryDetail, Paginated, ProductCard } from "@/types/api";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await serverGet<CategoryDetail>(`/catalog/categories/${slug}/`);
  if (!category) return { title: "Category" };
  return { title: category.meta_title || `${category.name} — wholesale`, description: category.meta_description || category.description || `Wholesale ${category.name.toLowerCase()} with live pricing.` };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, initial] = await Promise.all([
    serverGet<CategoryDetail>(`/catalog/categories/${slug}/`),
    serverGet<Paginated<ProductCard>>("/catalog/products/", { searchParams: { category: slug, page_size: 24 } }),
  ]);
  if (!category) notFound();
  return (
    <div className="container-x py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Products", href: "/products" }, ...category.breadcrumbs.map((b) => ({ name: b.name, href: `/categories/${b.slug}` }))]} />
      {category.children.length ? (
        <div className="-mx-4 mb-8 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0">
          {category.children.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-brand-400 hover:text-brand-600">
              {c.name} <span className="text-muted-foreground">{c.product_count}</span>
            </Link>
          ))}
        </div>
      ) : <div className="mt-5" />}
      <Suspense>
        <ProductListing base={{ category: slug }} subcategories={category.children} initialData={initial} title={category.name} description={category.description || `${category.product_count} products`} />
      </Suspense>
    </div>
  );
}
