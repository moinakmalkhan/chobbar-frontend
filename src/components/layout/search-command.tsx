"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Layers, Search, Shirt, TrendingUp, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { searchService } from "@/services/search";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

/**
 * Search dropdown: debounced (250 ms) autocomplete with products, categories
 * and fabrics, keyboard navigation and trending queries when empty.
 */
export function SearchCommand() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const router = useRouter();
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);
  const q = useDebouncedValue(value.trim(), 250);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggest = useQuery({
    queryKey: queryKeys.suggest(q),
    queryFn: ({ signal }) => searchService.suggest(q, signal),
    enabled: open && q.length >= 2,
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });
  const trending = useQuery({ queryKey: queryKeys.trending, queryFn: searchService.trending, enabled: open, staleTime: 30 * 60_000 });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setValue("");
      setCursor(0);
    }
    setOpen(next);
  };

  const products = q.length >= 2 ? (suggest.data?.products ?? []) : [];
  const categories = q.length >= 2 ? (suggest.data?.categories ?? []) : [];
  const fabrics = q.length >= 2 ? (suggest.data?.fabrics ?? []) : [];
  const items: { href: string; label: string }[] = [
    ...(q ? [{ href: `/search?q=${encodeURIComponent(q)}`, label: `Search for “${q}”` }] : []),
    ...products.map((p) => ({ href: `/products/${p.slug}`, label: p.name })),
    ...categories.map((c) => ({ href: `/categories/${c.slug}`, label: c.name })),
    ...fabrics.map((f) => ({ href: `/fabrics#${f.slug}`, label: f.name })),
  ];

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && items[cursor]) {
      e.preventDefault();
      go(items[cursor].href);
    }
  };

  let index = 0;
  const nextIndex = () => index++;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="top-[8vh] translate-y-0 gap-0 p-0 sm:max-w-2xl" onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus(); }}>
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search products, categories, fabrics or SKUs…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            aria-label="Search"
            aria-activedescendant={items[cursor] ? `sr-${cursor}` : undefined}
            autoComplete="off"
          />
          {value ? (
            <button type="button" onClick={() => setValue("")} className="rounded-full p-1 hover:bg-muted" aria-label="Clear">
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2" role="listbox">
          {q.length < 2 ? (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><TrendingUp className="size-3.5" /> Trending</p>
              <div className="flex flex-wrap gap-2">
                {(trending.data?.length ? trending.data : ["soccer jersey", "hoodie", "tracksuit", "compression", "basketball", "polo"]).map((t) => (
                  <button key={t} type="button" onClick={() => setValue(t)} className="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-brand-400 hover:text-brand-600">
                    {t}
                  </button>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">Tip: paste a SKU like <code className="rounded bg-muted px-1">LS-SOC-001</code>, or use <Link href="/quick-order" onClick={() => setOpen(false)} className="text-brand-600 underline">quick order</Link> for bulk entry.</p>
            </div>
          ) : suggest.isLoading && !suggest.data ? (
            <div className="space-y-2 p-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <>
              <Row id={`sr-${index}`} active={cursor === nextIndex()} onClick={() => go(`/search?q=${encodeURIComponent(q)}`)} icon={<Search className="size-4" />}>
                <span>Search for <span className="font-semibold">“{q}”</span></span>
                <ArrowRight className="ml-auto size-4 text-muted-foreground" />
              </Row>
              {products.length ? (
                <>
                  <Heading>Products</Heading>
                  {products.map((p) => (
                    <Row key={p.id} id={`sr-${index}`} active={cursor === nextIndex()} onClick={() => go(`/products/${p.slug}`)} icon={p.image ? <Image src={p.image.url} alt="" width={40} height={40} className="size-10 rounded-lg object-cover" /> : <Shirt className="size-4" />}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{p.category_name} · {p.sku} · MOQ {p.min_order_quantity}</span>
                      </span>
                      <span className="text-sm font-semibold">from {formatMoney(p.base_price)}</span>
                    </Row>
                  ))}
                </>
              ) : null}
              {categories.length ? (
                <>
                  <Heading>Categories</Heading>
                  {categories.map((c) => (
                    <Row key={c.slug} id={`sr-${index}`} active={cursor === nextIndex()} onClick={() => go(`/categories/${c.slug}`)} icon={<Layers className="size-4" />}>
                      <span className="flex-1 font-medium">{c.name}</span>
                      <span className="text-xs text-muted-foreground">{c.product_count} products</span>
                    </Row>
                  ))}
                </>
              ) : null}
              {fabrics.length ? (
                <>
                  <Heading>Fabrics</Heading>
                  {fabrics.map((f) => (
                    <Row key={f.slug} id={`sr-${index}`} active={cursor === nextIndex()} onClick={() => go(`/fabrics#${f.slug}`)} icon={<span className="size-4 rounded-full bg-brand-400" />}>
                      <span className="flex-1 font-medium">{f.name}</span>
                      <span className="text-xs capitalize text-muted-foreground">{f.quality}</span>
                    </Row>
                  ))}
                </>
              ) : null}
              {!products.length && !categories.length && !fabrics.length && !suggest.isFetching ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No matches yet — press Enter to run a full search.</p>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

function Row({ id, active, onClick, icon, children }: { id: string; active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button id={id} type="button" role="option" aria-selected={active} onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors", active ? "bg-muted" : "hover:bg-muted/60")}>
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">{icon}</span>
      {children}
    </button>
  );
}
