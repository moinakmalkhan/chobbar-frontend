"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function TotalsRow({
  label,
  value,
  strong,
  accent,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        strong ? "text-base font-bold" : "text-sm",
        className,
      )}
    >
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span className={cn("tabular-nums", accent && "font-semibold text-emerald-700 dark:text-emerald-400")}>
        {value}
      </span>
    </div>
  );
}

/** Subtotal / discount / delivery / total block shared by drawer, bag page and checkout. */
export function CartTotals({
  subtotal,
  discount,
  shipping,
  codFee,
  total,
  freeShipping,
}: {
  subtotal: number;
  discount: number;
  shipping?: number | null;
  codFee?: number | null;
  total?: number | null;
  freeShipping?: boolean;
}) {
  const { t, money } = useI18n();
  return (
    <div className="space-y-2.5">
      <TotalsRow label={t("cart.subtotal")} value={money(subtotal)} />
      {discount > 0 ? <TotalsRow label={t("cart.discount")} value={`−${money(discount)}`} accent /> : null}
      <TotalsRow
        label={t("cart.delivery")}
        value={
          shipping === undefined || shipping === null ? (
            <span className="text-muted-foreground">
              {freeShipping ? t("common.free") : t("cart.deliveryCalculated")}
            </span>
          ) : shipping === 0 ? (
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t("common.free")}</span>
          ) : (
            money(shipping)
          )
        }
      />
      {codFee ? <TotalsRow label={t("checkout.codFee")} value={money(codFee)} /> : null}
      <div className="border-border border-t pt-3">
        <TotalsRow label={t("cart.total")} value={money(total ?? subtotal - discount)} strong />
      </div>
      {discount > 0 ? (
        <p className="text-end text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {t("cart.youSave", { amount: money(discount) })}
        </p>
      ) : null}
    </div>
  );
}
