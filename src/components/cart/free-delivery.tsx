"use client";

import { Truck } from "lucide-react";

import { useStorefront } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { zoneFor } from "@/lib/shipping";
import { useLocalStore } from "@/stores/local-store";

/** Progress towards free delivery, using the shopper's saved city when we know it. */
export function FreeDeliveryProgress({
  subtotal,
  freeShipping,
}: {
  subtotal: number;
  freeShipping?: boolean;
}) {
  const { t, money } = useI18n();
  const shipping = useStorefront().data?.shipping;
  const contact = useLocalStore((s) => s.checkoutContact);
  if (!shipping) return null;
  const zone = contact?.city ? zoneFor(shipping.zones, contact.city, contact.province) : null;
  const threshold = zone?.free_over ?? shipping.free_over_min;
  if (!threshold) return null;
  const done = freeShipping || subtotal >= threshold;
  const pct = done ? 100 : Math.max(4, Math.round((subtotal / threshold) * 100));
  return (
    <div className="bg-muted/70 rounded-2xl p-3.5">
      <p className="flex items-center gap-2 text-sm">
        <Truck className={done ? "size-4 text-emerald-600" : "text-muted-foreground size-4"} />
        {done ? (
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
            {t("cart.freeDeliveryUnlocked")}
          </span>
        ) : (
          t("cart.freeDeliveryProgress", { amount: money(threshold - subtotal) })
        )}
      </p>
      <div
        className="bg-border mt-2.5 h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={
            done
              ? "h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-out"
              : "bg-brand-600 h-full rounded-full transition-[width] duration-700 ease-out"
          }
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
