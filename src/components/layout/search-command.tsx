"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Loader2, Search, TrendingUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Price } from "@/components/shared/price";
import { SmartImage } from "@/components/shared/smart-image";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { queryKeys } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { searchService } from "@/services/search";
import { useLocalStore } from "@/stores/local-store";
import { useUIStore } from "@/stores/ui-store";

type Row = { key: string; href: string; render: React.ReactNode; record?: string };

export function SearchCommand() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const { t } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const debounced = useDebouncedValue(q.trim(), 280);
  const recent = useLocalStore((s) => s.recentSearches);
  const pushSearch = useLocalStore((s) => s.pushSearch);
  const clearSearches = useLocalStore((s) => s.clearSearches);
  const listRef = useRef<HTMLDivElement>(null);

  const suggest = useQuery({
    queryKey: queryKeys.suggest(debounced),
    queryFn: ({ signal }) => searchService.suggest(debounced, signal),
    enabled: open && debounced.length >= 2,
    staleTime: 5 * 60_000,
  });
  const trending = useQuery({
    queryKey: queryKeys.trending,
    queryFn: searchService.trending,
    enabled: open,
    staleTime: 30 * 60_000,
  });

  const go = (href: string, record?: string) => {
    if (record) pushSearch(record);
    setOpen(false);
    setQ("");
    router.push(href);
  };
  const submit = (value = q) => {
    const v = value.trim();
    if (v) go(`/search?q=${encodeURIComponent(v)}`, v);
  };

  const rows = useMemo<Row[]>(() => {
    const data = suggest.data;
    if (!data || debounced.length < 2) return [];
    const out: Row[] = [];
    data.products.forEach((p) =>
      out.push({
        key: `p-${p.slug}`,
        href: `/products/${p.slug}`,
        record: debounced,
        render: (
          <div className="flex items-center gap-3">
            <SmartImage
              src={p.image?.url}
              alt={p.name}
              width={48}
              height={60}
              wrapperClassName="h-[60px] w-12 shrink-0 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-muted-foreground truncate text-xs">{p.category_name}</p>
            </div>
            <Price price={p.price} compare={p.compare_at_price} size="sm" className="shrink-0 justify-end" />
          </div>
        ),
      }),
    );
    data.categories.forEach((c) =>
      out.push({
        key: `c-${c.slug}`,
        href: `/categories/${c.slug}`,
        render: (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium">{c.name}</span>
            <span className="text-muted-foreground text-xs">
              {t("common.results", { count: c.product_count })}
            </span>
          </div>
        ),
      }),
    );
    data.collections.forEach((c) =>
      out.push({
        key: `k-${c.slug}`,
        href: `/collections/${c.slug}`,
        render: <span className="text-sm font-medium">{c.name}</span>,
      }),
    );
    return out;
  }, [suggest.data, debounced, t]);

  const [rowCount, setRowCount] = useState(rows.length);
  if (rowCount !== rows.length) {
    setRowCount(rows.length);
    setActive(0);
  }
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(rows.length, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Row 0 is "see all results"; product/category rows follow.
      if (active > 0 && rows[active - 1]) go(rows[active - 1].href, rows[active - 1].record);
      else submit();
    }
  };

  const productRows = rows.filter((r) => r.key.startsWith("p-"));
  const otherRows = rows.filter((r) => !r.key.startsWith("p-"));
  const indexOf = (key: string) => rows.findIndex((r) => r.key === key) + 1;
  const loading = suggest.isFetching && debounced.length >= 2;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="bg-ink-950/45 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out fixed inset-0 z-50 backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="bg-background data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out sm:border-border fixed inset-0 z-50 flex flex-col shadow-2xl focus:outline-none sm:inset-x-auto sm:top-[8vh] sm:left-1/2 sm:max-h-[78vh] sm:w-[min(680px,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-3xl sm:border"
        >
          <DialogPrimitive.Title className="sr-only">{t("search.title")}</DialogPrimitive.Title>
          <div className="border-border flex items-center gap-2 border-b px-3 py-2 sm:px-4">
            <DialogPrimitive.Close
              className="hover:bg-muted grid size-10 place-items-center rounded-full sm:hidden"
              aria-label={t("common.close")}
            >
              <ArrowLeft className="rtl-flip size-5" />
            </DialogPrimitive.Close>
            {loading ? (
              <Loader2 className="text-muted-foreground hidden size-5 animate-spin sm:block" />
            ) : (
              <Search className="text-muted-foreground hidden size-5 sm:block" />
            )}
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t("nav.searchPlaceholder")}
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={rows.length > 0}
              aria-controls="search-results"
              aria-activedescendant={rows.length ? `search-row-${active}` : undefined}
              className="placeholder:text-muted-foreground h-12 flex-1 bg-transparent text-base outline-none"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="hover:bg-muted grid size-9 place-items-center rounded-full"
                aria-label={t("common.close")}
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="border-border text-muted-foreground hidden rounded-md border px-1.5 py-0.5 text-[11px] sm:block">
                Esc
              </kbd>
            )}
          </div>

          <div
            ref={listRef}
            id="search-results"
            role="listbox"
            className="flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3"
          >
            {debounced.length < 2 ? (
              <div className="animate-in fade-in space-y-6 p-2">
                {recent.length ? (
                  <section>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                        {t("search.recent")}
                      </h3>
                      <button
                        type="button"
                        onClick={clearSearches}
                        className="text-muted-foreground hover:text-foreground text-xs"
                      >
                        {t("search.clear")}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => submit(s)}
                          className="border-border hover:border-foreground/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
                        >
                          <Clock className="text-muted-foreground size-3.5" />
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}
                {trending.data?.length ? (
                  <section>
                    <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      {t("search.trending")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {trending.data.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => submit(s)}
                          className="bg-muted hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/15 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
                        >
                          <TrendingUp className="size-3.5" />
                          {s}
                        </button>
                      ))}
                    </div>
                  </section>
                ) : null}
                {!recent.length && !trending.data?.length ? (
                  <div className="py-10 text-center">
                    <p className="font-display text-lg font-bold">{t("search.empty")}</p>
                    <p className="text-muted-foreground mt-1 text-sm">{t("search.emptyHint")}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="animate-in fade-in">
                <button
                  id="search-row-0"
                  role="option"
                  aria-selected={active === 0}
                  data-index={0}
                  onMouseEnter={() => setActive(0)}
                  onClick={() => submit()}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-3 text-start text-sm font-medium",
                    active === 0 && "bg-muted",
                  )}
                >
                  <Search className="text-brand-600 size-4" />
                  {t("search.seeAllResults", { query: debounced })}
                </button>
                {productRows.length ? (
                  <h3 className="text-muted-foreground px-3 pt-3 pb-1 text-xs font-semibold tracking-wider uppercase">
                    {t("search.products")}
                  </h3>
                ) : null}
                {productRows.map((r) => (
                  <ResultRow
                    key={r.key}
                    row={r}
                    index={indexOf(r.key)}
                    active={active}
                    setActive={setActive}
                    go={go}
                  />
                ))}
                {otherRows.length ? (
                  <h3 className="text-muted-foreground px-3 pt-3 pb-1 text-xs font-semibold tracking-wider uppercase">
                    {t("search.categories")}
                  </h3>
                ) : null}
                {otherRows.map((r) => (
                  <ResultRow
                    key={r.key}
                    row={r}
                    index={indexOf(r.key)}
                    active={active}
                    setActive={setActive}
                    go={go}
                  />
                ))}
                {!loading && suggest.data && rows.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-8 text-center text-sm">
                    {t("search.noMatches")}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ResultRow({
  row,
  index,
  active,
  setActive,
  go,
}: {
  row: Row;
  index: number;
  active: number;
  setActive: (i: number) => void;
  go: (href: string, record?: string) => void;
}) {
  return (
    <button
      id={`search-row-${index}`}
      role="option"
      aria-selected={active === index}
      data-index={index}
      onMouseEnter={() => setActive(index)}
      onClick={() => go(row.href, row.record)}
      className={cn(
        "block w-full rounded-xl px-3 py-2 text-start transition-colors",
        active === index && "bg-muted",
      )}
    >
      {row.render}
    </button>
  );
}
