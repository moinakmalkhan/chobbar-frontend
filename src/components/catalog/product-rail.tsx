"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/client";
import type { ProductCard as Card } from "@/types/api";

/** Horizontal, scroll-snapping product row: native swipe on phones, arrow buttons on desktop. */
export function ProductRail({ products, loading = false }: { products?: Card[]; loading?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, dir } = useI18n();
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft); // negative in RTL
    setEdges({ start: pos < 8, end: pos + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
  }, [products, update]);

  const scroll = (towards: "start" | "end") => {
    const el = ref.current;
    if (!el) return;
    const delta = el.clientWidth * 0.85 * (towards === "end" ? 1 : -1) * (dir === "rtl" ? -1 : 1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const items = loading && !products ? Array.from({ length: 5 }, () => null) : (products ?? []);
  if (!loading && items.length === 0) return null;

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        onScroll={update}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 scrollbar-none gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0"
      >
        {items.map((p, i) => (
          <div key={p?.id ?? i} className="w-[44%] shrink-0 snap-start sm:w-[31%] lg:w-[calc(25%-15px)]">
            {p ? <ProductCard product={p} index={i} /> : <ProductCardSkeleton />}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll("start")}
        disabled={edges.start}
        aria-label={t("common.previous")}
        className="border-border bg-background/95 absolute start-0 top-[38%] hidden size-11 -translate-y-1/2 place-items-center rounded-full border shadow-lg transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-0 lg:-ms-5 lg:grid"
      >
        <ChevronLeft className="rtl-flip size-5" />
      </button>
      <button
        type="button"
        onClick={() => scroll("end")}
        disabled={edges.end}
        aria-label={t("common.next")}
        className="border-border bg-background/95 absolute end-0 top-[38%] hidden size-11 -translate-y-1/2 place-items-center rounded-full border shadow-lg transition-all hover:scale-105 disabled:pointer-events-none disabled:opacity-0 lg:-me-5 lg:grid"
      >
        <ChevronRight className="rtl-flip size-5" />
      </button>
    </div>
  );
}
