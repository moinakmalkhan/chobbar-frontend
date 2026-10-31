"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import { ProductGrid } from "@/components/catalog/product-grid";
import {
  countFilters,
  EMPTY_FILTERS,
  type FilterState,
  ProductFilters,
} from "@/components/catalog/product-filters";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { useFacets, useProducts } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Gender, Paginated, ProductCard, ProductQuery } from "@/types/api";

const SORTS = [
  { value: "recommended", key: "listing.sortRecommended" },
  { value: "-created_at", key: "listing.sortNewest" },
  { value: "-sales_count", key: "listing.sortBest" },
  { value: "price", key: "listing.sortPriceAsc" },
  { value: "-price", key: "listing.sortPriceDesc" },
  { value: "-rating_avg", key: "listing.sortRating" },
] as const;

const PAGE_SIZE = 24;

export function readFilters(sp: URLSearchParams): FilterState {
  const list = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  return {
    gender: list("gender"),
    size: list("size"),
    color: list("color"),
    min_price: sp.get("min_price") ?? undefined,
    max_price: sp.get("max_price") ?? undefined,
    in_stock: sp.get("in_stock") === "true",
    on_sale: sp.get("on_sale") === "true",
  };
}

/** Builds the API query from the base scope (category/collection/q) plus URL state. */
export function buildQuery(base: ProductQuery, sp: URLSearchParams): ProductQuery {
  const f = readFilters(sp);
  const ordering = sp.get("ordering") ?? undefined;
  return {
    ...base,
    page: Number(sp.get("page") ?? 1) || 1,
    page_size: PAGE_SIZE,
    ordering: ordering && ordering !== "recommended" ? ordering : undefined,
    gender: f.gender.length ? f.gender.join(",") : base.gender,
    size: f.size.join(",") || undefined,
    color: f.color.join(",") || undefined,
    min_price: f.min_price,
    max_price: f.max_price,
    in_stock: f.in_stock || undefined,
    on_sale: f.on_sale || base.on_sale || undefined,
  };
}

export function ProductListing({
  base,
  initialData,
  hideGender = false,
  header,
}: {
  base: ProductQuery;
  initialData?: Paginated<ProductCard> | null;
  hideGender?: boolean;
  header?: React.ReactNode;
}) {
  const { t, number } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const params = useMemo(() => buildQuery(base, new URLSearchParams(sp.toString())), [base, sp]);
  const filters = useMemo(() => readFilters(new URLSearchParams(sp.toString())), [sp]);
  // Server-rendered first page is only valid for the unfiltered view.
  const pristine = sp.toString() === "" || sp.toString() === `q=${encodeURIComponent(base.q ?? "")}`;
  const products = useProducts(params, pristine ? initialData : undefined);
  const facets = useFacets(params);
  const active = countFilters(filters);

  const update = useCallback(
    (
      patch: Record<string, string | undefined>,
      opts: { resetPage?: boolean; scroll?: boolean } = { resetPage: true },
    ) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "" || v === "false") next.delete(k);
        else next.set(k, v);
      }
      if (opts.resetPage !== false) next.delete("page");
      const qs = next.toString();
      startTransition(() =>
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: opts.scroll ?? false }),
      );
    },
    [pathname, router, sp],
  );

  const setFilters = (f: FilterState) =>
    update({
      gender: f.gender.join(",") || undefined,
      size: f.size.join(",") || undefined,
      color: f.color.join(",") || undefined,
      min_price: f.min_price,
      max_price: f.max_price,
      in_stock: f.in_stock ? "true" : undefined,
      on_sale: f.on_sale ? "true" : undefined,
    });

  const chips: { label: string; clear: () => void }[] = [
    ...filters.gender.map((g) => ({
      label: t(`listing.genders.${g as Gender}`),
      clear: () => setFilters({ ...filters, gender: filters.gender.filter((x) => x !== g) }),
    })),
    ...filters.size.map((s) => ({
      label: s,
      clear: () => setFilters({ ...filters, size: filters.size.filter((x) => x !== s) }),
    })),
    ...filters.color.map((c) => ({
      label: facets.data?.colors.find((x) => x.slug === c)?.name ?? c,
      clear: () => setFilters({ ...filters, color: filters.color.filter((x) => x !== c) }),
    })),
    ...(filters.min_price || filters.max_price
      ? [
          {
            label: `${filters.min_price ?? "0"} – ${filters.max_price ?? "∞"}`,
            clear: () => setFilters({ ...filters, min_price: undefined, max_price: undefined }),
          },
        ]
      : []),
    ...(filters.in_stock
      ? [{ label: t("listing.inStockOnly"), clear: () => setFilters({ ...filters, in_stock: false }) }]
      : []),
    ...(filters.on_sale
      ? [{ label: t("listing.onSaleOnly"), clear: () => setFilters({ ...filters, on_sale: false }) }]
      : []),
  ];

  const data = products.data;
  const loading = products.isLoading && !data;
  const ordering = sp.get("ordering") ?? "recommended";

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-7rem)] scrollbar-none overflow-y-auto pe-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{t("listing.filters")}</h2>
            {active ? (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              >
                {t("listing.clearAll")}
              </button>
            ) : null}
          </div>
          <ProductFilters
            facets={facets.data}
            value={filters}
            onChange={setFilters}
            hideGender={hideGender}
          />
        </div>
      </aside>

      <div className="min-w-0">
        {header}
        <div className="bg-background/95 sticky top-16 z-20 -mx-4 mb-5 flex items-center gap-2 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-10 lg:hidden">
                <SlidersHorizontal />
                {t("listing.filters")}
                {active ? (
                  <span className="bg-brand-600 grid size-5 place-items-center rounded-full text-[10px] text-white">
                    {active}
                  </span>
                ) : null}
              </Button>
            </DialogTrigger>
            <DialogContent
              side="bottom"
              className="gap-2 px-5"
              closeLabel={t("common.close")}
              aria-describedby={undefined}
            >
              <div className="flex items-center justify-between pe-8">
                <DialogTitle className="text-lg">{t("listing.filters")}</DialogTitle>
                {active ? (
                  <button
                    type="button"
                    onClick={() => setFilters(EMPTY_FILTERS)}
                    className="text-muted-foreground text-sm underline"
                  >
                    {t("listing.clearAll")}
                  </button>
                ) : null}
              </div>
              <div className="-mx-1 flex-1 overflow-y-auto px-1">
                <ProductFilters
                  facets={facets.data}
                  value={filters}
                  onChange={setFilters}
                  hideGender={hideGender}
                />
              </div>
              <DialogTriggerClose
                label={t("listing.showResults", { count: number(data?.count ?? 0) })}
                loading={isPending || products.isFetching}
              />
            </DialogContent>
          </Dialog>
          <p className="text-muted-foreground hidden text-sm sm:block" aria-live="polite">
            {data ? t("common.results", { count: number(data.count) }) : " "}
          </p>
          <div className="ms-auto">
            <Select
              value={ordering}
              onValueChange={(v) => update({ ordering: v === "recommended" ? undefined : v })}
            >
              <SelectTrigger
                className="h-10 w-auto min-w-44 rounded-full text-sm"
                aria-label={t("listing.sortBy")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {SORTS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {t(s.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {chips.length ? (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={c.clear}
                className="bg-muted hover:bg-border animate-in fade-in zoom-in-95 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {c.label}
                <X className="size-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-muted-foreground px-1 text-xs font-medium underline-offset-4 hover:underline"
            >
              {t("listing.clearAll")}
            </button>
          </div>
        ) : null}

        <div
          className={cn(
            "transition-opacity duration-300",
            (isPending || (products.isFetching && products.isPlaceholderData)) && "opacity-60",
          )}
        >
          {loading ? (
            <ProductGridSkeleton />
          ) : data && data.results.length ? (
            <>
              <ProductGrid products={data.results} />
              <Pagination
                className="mt-12"
                page={data.page}
                totalPages={data.total_pages}
                count={data.count}
                pageSize={data.page_size}
                onChange={(p) => {
                  update({ page: p > 1 ? String(p) : undefined }, { resetPage: false, scroll: true });
                }}
              />
            </>
          ) : (
            <EmptyState
              icon={SlidersHorizontal}
              title={t("listing.noResults")}
              description={t("listing.noResultsHint")}
              action={
                active ? (
                  <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                    {t("listing.clearAll")}
                  </Button>
                ) : null
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DialogTriggerClose({ label, loading }: { label: string; loading: boolean }) {
  return (
    <DialogClose asChild>
      <Button size="lg" className="w-full" loading={loading}>
        {label}
      </Button>
    </DialogClose>
  );
}
