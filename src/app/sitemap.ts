import type { MetadataRoute } from "next";

import { LOCALES } from "@/i18n/config";
import { env } from "@/lib/env";
import { serverGet } from "@/lib/server-api";
import type { CategoryNode, Collection, Paginated, ProductCard, Storefront } from "@/types/api";

export const revalidate = 3600;

function flatten(nodes: CategoryNode[]): string[] {
  return nodes.flatMap((n) => [n.slug, ...flatten(n.children)]);
}

/** Every public URL in all three languages, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, collections, storefront] = await Promise.all([
    serverGet<CategoryNode[]>("/catalog/categories/"),
    serverGet<Collection[]>("/catalog/collections/"),
    serverGet<Storefront>("/content/storefront/"),
  ]);
  const products: ProductCard[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await serverGet<Paginated<ProductCard>>("/catalog/products/", {
      searchParams: { page, page_size: 100 },
    });
    if (!res) break;
    products.push(...res.results);
    if (!res.next) break;
  }
  const paths = [
    { path: "", priority: 1, freq: "daily" as const },
    { path: "/products", priority: 0.8, freq: "daily" as const },
    { path: "/faq", priority: 0.3, freq: "monthly" as const },
    { path: "/track", priority: 0.3, freq: "yearly" as const },
    ...flatten(categories ?? []).map((s) => ({
      path: `/categories/${s}`,
      priority: 0.8,
      freq: "weekly" as const,
    })),
    ...(collections ?? []).map((c) => ({
      path: `/collections/${c.slug}`,
      priority: 0.7,
      freq: "weekly" as const,
    })),
    ...products.map((p) => ({ path: `/products/${p.slug}`, priority: 0.9, freq: "weekly" as const })),
    ...(storefront?.pages ?? []).map((p) => ({
      path: `/pages/${p.slug}`,
      priority: 0.3,
      freq: "monthly" as const,
    })),
  ];
  return paths.flatMap(({ path, priority, freq }) =>
    LOCALES.map((l) => ({
      url: `${env.siteUrl}/${l}${path}`,
      changeFrequency: freq,
      priority,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, `${env.siteUrl}/${x}${path}`])) },
    })),
  );
}
