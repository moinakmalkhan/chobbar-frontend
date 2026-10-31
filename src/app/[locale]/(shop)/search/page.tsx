import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchResults } from "@/components/catalog/search-results";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { isLocale } from "@/i18n/config";
import { getT } from "@/i18n/server";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const [{ locale }, { q }] = await Promise.all([params, searchParams]);
  const t = await getT(isLocale(locale) ? locale : "en");
  return {
    title: q ? t("search.resultsFor", { query: q }) : t("search.title"),
    robots: { index: false, follow: true },
  };
}

export default function SearchPage() {
  return (
    <div className="container-x py-8">
      <Suspense fallback={<ProductGridSkeleton />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
