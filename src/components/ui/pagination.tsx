"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  totalPages: number;
  count?: number;
  pageSize?: number;
  onChange: (page: number) => void;
  className?: string;
}

function range(page: number, total: number) {
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export function Pagination({ page, totalPages, count, pageSize, onChange, className }: Props) {
  const { t, number } = useI18n();
  if (totalPages <= 1) return null;
  const pages = range(page, totalPages);
  const from = pageSize ? (page - 1) * pageSize + 1 : null;
  const to = pageSize && count ? Math.min(page * pageSize, count) : null;
  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}
    >
      {count !== undefined && from && to ? (
        <p className="text-muted-foreground text-sm">
          {t("common.showing", { from: number(from), to: number(to), total: number(count) })}
        </p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("common.previous")}
        >
          <ChevronLeft className="rtl-flip" />
        </Button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center">
            {i > 0 && pages[i - 1] !== p - 1 ? <span className="text-muted-foreground px-1">…</span> : null}
            <Button
              variant={p === page ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
              className="text-xs tabular-nums"
            >
              {number(p)}
            </Button>
          </span>
        ))}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label={t("common.next")}
        >
          <ChevronRight className="rtl-flip" />
        </Button>
      </div>
    </nav>
  );
}
