"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function Price({
  price,
  compare,
  className,
  size = "md",
}: {
  price: number;
  compare?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { money, t } = useI18n();
  const onSale = !!compare && compare > price;
  const pct = onSale ? Math.round(((compare! - price) / compare!) * 100) : 0;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "font-bold tabular-nums",
          onSale && "text-brand-700 dark:text-brand-400",
          size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-[15px]",
        )}
      >
        {money(price)}
      </span>
      {onSale ? (
        <>
          <s className={cn("text-muted-foreground tabular-nums", size === "lg" ? "text-base" : "text-xs")}>
            {money(compare)}
          </s>
          {size === "lg" ? (
            <span className="text-brand-700 dark:text-brand-400 text-sm font-semibold">
              {t("common.off", { percent: pct })}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
