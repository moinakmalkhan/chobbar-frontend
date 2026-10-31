"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatMoney, GENDER_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/api";

interface Props {
  item: CartItem;
  currency: string;
  compact?: boolean;
  onRemove?: (id: string) => void;
  onChangeQty?: (item: CartItem, size_id: number, gender: string, quantity: number) => void;
  busy?: boolean;
}

export function CartLine({ item, currency, compact, onRemove, onChangeQty, busy }: Props) {
  const error = item.price_breakdown?.error;
  return (
    <div className={cn("flex gap-3", compact ? "py-3" : "py-5")}>
      <Link href={`/products/${item.product.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
        {item.product.image ? <Image src={item.product.image.url} alt={item.product.image.alt} fill sizes="96px" className="object-cover" /> : null}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${item.product.slug}`} className="block truncate text-sm font-semibold hover:text-brand-600">{item.product.name}</Link>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.fabric_name}{item.color ? ` · ${item.color}` : ""} · {item.product.sku}
            </p>
          </div>
          {onRemove ? (
            <Button variant="ghost" size="icon-sm" onClick={() => onRemove(item.id)} aria-label="Remove" disabled={busy} className="-mr-2 text-muted-foreground hover:text-red-600">
              <Trash2 />
            </Button>
          ) : null}
        </div>

        {!compact ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.breakdown.map((line) => (
              <span key={`${line.gender}-${line.size_id}`} className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs">
                <span className="text-muted-foreground">{GENDER_LABELS[line.gender]?.slice(0, 1)}</span>
                <span className="font-semibold">{line.size}</span>
                {onChangeQty ? (
                  <span className="ml-1 inline-flex items-center overflow-hidden rounded-md border border-border">
                    <button type="button" className="px-1 hover:bg-muted disabled:opacity-40" disabled={busy || line.quantity <= 0} onClick={() => onChangeQty(item, line.size_id, line.gender, Math.max(0, line.quantity - 1))} aria-label="Decrease"><Minus className="size-3" /></button>
                    <span className="min-w-6 text-center tabular-nums">{line.quantity}</span>
                    <button type="button" className="px-1 hover:bg-muted" disabled={busy} onClick={() => onChangeQty(item, line.size_id, line.gender, line.quantity + 1)} aria-label="Increase"><Plus className="size-3" /></button>
                  </span>
                ) : (
                  <span className="tabular-nums">× {line.quantity}</span>
                )}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">{item.breakdown.map((l) => `${l.size}×${l.quantity}`).join(", ")}</p>
        )}

        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {item.quantity} pcs × {formatMoney(item.unit_price, currency)}
            {item.price_breakdown?.volume_discount_percent ? <span className="ml-1.5 rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">-{item.price_breakdown.volume_discount_percent}% volume</span> : null}
          </span>
          <span className="font-semibold tabular-nums">{formatMoney(item.line_total, currency)}</span>
        </div>
        {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
