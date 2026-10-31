import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { serverGet } from "@/lib/server-api";
import type { CategoryNode, Paginated, ProductCard } from "@/types/api";

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children)]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([serverGet<CategoryNode[]>("/catalog/categories/"), serverGet<Paginated<ProductCard>>("/catalog/products/", { searchParams: { page_size: 100 } })]);
  const base = env.siteUrl;
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/fabrics`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    ...flatten(categories ?? []).map((c) => ({ url: `${base}/categories/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...(products?.results ?? []).map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
