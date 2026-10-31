"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ProductListing } from "@/components/catalog/product-listing";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { useLocalStore } from "@/stores/local-store";

export function SearchResults() {
  const { t } = useI18n();
  const sp = useSearchParams();
  const router = useRouter();
  const q = (sp.get("q") ?? "").trim();
  const [value, setValue] = useState(q);
  const debounced = useDebouncedValue(value.trim(), 450);
  const pushSearch = useLocalStore((s) => s.pushSearch);
  const base = useMemo(() => ({ q }), [q]);

  useEffect(() => {
    if (q) pushSearch(q);
  }, [q, pushSearch]);

  // Live results as you type (debounced) without spamming history entries.
  useEffect(() => {
    if (debounced === q || debounced.length === 1) return;
    router.replace(debounced ? `/search?q=${encodeURIComponent(debounced)}` : "/search", { scroll: false });
  }, [debounced, q, router]);

  return (
    <>
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("search.title") }]} />
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          router.replace(v ? `/search?q=${encodeURIComponent(v)}` : "/search");
        }}
        className="relative mb-6 max-w-2xl"
      >
        <Search className="text-muted-foreground pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          aria-label={t("search.title")}
          enterKeyHint="search"
          className="border-border bg-card focus:border-brand-500 focus:ring-brand-500/15 h-14 w-full rounded-full border ps-12 pe-5 text-base transition-[border-color,box-shadow] outline-none focus:ring-4"
        />
      </form>
      <h1 className="font-display mb-6 text-2xl font-extrabold sm:text-3xl">
        {q ? t("search.resultsFor", { query: q }) : t("nav.allProducts")}
      </h1>
      <ProductListing key={q} base={base} />
    </>
  );
}
