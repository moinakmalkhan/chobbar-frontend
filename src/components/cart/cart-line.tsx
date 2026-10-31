"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { QuantityStepper } from "@/components/shared/quantity";
import { SmartImage } from "@/components/shared/smart-image";
import { useRemoveFromCart, useSetQuantity } from "@/hooks/use-cart";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/types/api";

export function CartLine({
  item,
  compact = false,
  onNavigate,
}: {
  item: CartItem;
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { t, money } = useI18n();
  const setQty = useSetQuantity();
  const remove = useRemoveFromCart();
  // Rapid taps on +/− update the UI optimistically but hit the API once.
  const [local, setLocal] = useState<number | null>(null);
  const commit = useDebouncedCallback(
    (quantity: number) => setQty.mutate({ itemId: item.id, quantity }, { onSettled: () => setLocal(null) }),
    350,
  );
  const qty = local ?? item.quantity;
  const max = Math.max(1, Math.min(10, item.available || item.quantity));
  const image = item.product.image?.url;
  const href = `/products/${item.product.slug}`;

  return (
    <div
      className={cn(
        "animate-in fade-in flex gap-3.5",
        remove.isPending && "pointer-events-none opacity-40 transition-opacity",
      )}
    >
      <Link href={href} onClick={onNavigate} className="shrink-0">
        <SmartImage
          src={image}
          alt={item.product.name}
          width={96}
          height={120}
          wrapperClassName={cn("rounded-xl", compact ? "h-[100px] w-20" : "h-[120px] w-24")}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={href}
              onClick={onNavigate}
              className="hover:text-brand-700 dark:hover:text-brand-400 line-clamp-2 text-sm leading-snug font-semibold"
            >
              {item.product.name}
            </Link>
            <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
              {item.variant.color ? (
                <span
                  className="size-2.5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: item.variant.color.hex }}
                />
              ) : null}
              {[item.variant.color?.name, item.variant.size].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove.mutate(item.id)}
            aria-label={t("cart.remove")}
            className="text-muted-foreground hover:bg-muted -me-1.5 -mt-1 grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
        {item.issue ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-3.5" />
            {item.issue}
          </p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            value={qty}
            max={max}
            onChange={(q) => {
              setLocal(q);
              commit(q);
            }}
          />
          <div className="text-end">
            <p className="text-sm font-bold tabular-nums">{money(item.unit_price * qty)}</p>
            {qty > 1 ? (
              <p className="text-muted-foreground text-[11px] tabular-nums">
                {money(item.unit_price)} × {qty}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
