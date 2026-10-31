import { SiteShell } from "@/components/layout/site-shell";
import { isLocale } from "@/i18n/config";
import { serverGet } from "@/lib/server-api";
import type { CategoryNode, Storefront } from "@/types/api";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const lang = isLocale(locale) ? locale : "en";
  const [categories, storefront] = await Promise.all([
    serverGet<CategoryNode[]>("/catalog/categories/", { locale: lang }),
    serverGet<Storefront>("/content/storefront/", { locale: lang }),
  ]);
  return (
    <SiteShell categories={categories} storefront={storefront}>
      {children}
    </SiteShell>
  );
}
