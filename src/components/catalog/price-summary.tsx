"use client";

import { ChevronDown, Loader2, TrendingDown } from "lucide-react";
import { useState } from "react";

import { formatMoney, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PriceBreakdown } from "@/types/api";

export function PriceSummary({ price, loading, error, moq, quantity }: { price: PriceBreakdown | null; loading: boolean; error: string | null; moq: number; quantity: number }) {
  const [open, setOpen] = useState(false);
  const currency = price?.currency ?? "USD";
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your price</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={cn("font-display text-3xl font-extrabold tabular-nums transition-opacity", loading && "opacity-50")}>{price ? formatMoney(price.unit_price, currency) : "—"}</span>
            <span className="text-sm text-muted-foreground">/ piece</span>
            {loading ? <Loader2 className="size-4 animate-spin text-brand-500" /> : null}
          </div>
          {price && Number(price.list_unit_price) > Number(price.unit_price) ? <p className="mt-0.5 text-xs text-muted-foreground">List {formatMoney(price.list_unit_price, currency)} · you save {formatPercent(((Number(price.list_unit_price) - Number(price.unit_price)) / Number(price.list_unit_price)) * 100)}</p> : null}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subtotal</p>
          <p className={cn("mt-1 font-display text-2xl font-bold tabular-nums", loading && "opacity-50")}>{price ? formatMoney(price.subtotal, currency) : "—"}</p>
          <p className="text-xs text-muted-foreground">{quantity} pcs · ex-works</p>
        </div>
      </div>

      {error ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">{error}</p> : null}
      {!error && quantity > 0 && quantity < moq ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">Add {moq - quantity} more piece{moq - quantity === 1 ? "" : "s"} to reach the {moq}-piece minimum.</p> : null}

      {price?.next_tier ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <TrendingDown className="size-4 shrink-0" />
          <span>Add <strong>{price.next_tier.more_needed}</strong> more pieces to unlock <strong>{formatPercent(price.next_tier.discount_percent)} off</strong> at {price.next_tier.min_quantity}+.</span>
        </div>
      ) : null}

      {price ? (
        <div className="mt-4 border-t border-border pt-3">
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground" aria-expanded={open}>
            How this price is built <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
          {open ? (
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row label="Labour, trims, print & margin" value={formatMoney(price.labor_price, currency)} />
              <Row label="Fabric at mill rate" value={formatMoney(price.fabric_cost, currency)} />
              {Number(price.fabric_adjustment) ? <Row label="Fabric handling" value={formatMoney(price.fabric_adjustment, currency)} /> : null}
              <Row label="List price" value={formatMoney(price.list_unit_price, currency)} strong />
              {Number(price.group_discount_percent) ? <Row label="Your customer group" value={`−${formatPercent(price.group_discount_percent)}`} accent /> : null}
              {Number(price.volume_discount_percent) ? <Row label={`Volume tier (${price.quantity} pcs)`} value={`−${formatPercent(price.volume_discount_percent)}`} accent /> : null}
              {price.contract_unit_price != null ? <Row label="Contract price" value={formatMoney(price.contract_unit_price, currency)} accent /> : null}
              {price.lines.some((l) => Number(l.surcharge_percent) > 0) ? <Row label="Large-size surcharge" value={price.lines.filter((l) => Number(l.surcharge_percent) > 0).map((l) => `${l.size_label} +${formatPercent(l.surcharge_percent)}`).join(", ")} /> : null}
            </dl>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("tabular-nums", strong && "font-semibold", accent && "font-semibold text-emerald-600")}>{value}</dd>
    </div>
  );
}
