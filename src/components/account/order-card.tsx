"use client";

import { ChevronRight } from "lucide-react";

import { SmartImage } from "@/components/shared/smart-image";
import { StatusBadge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import type { OrderSummary } from "@/types/api";

export function OrderCard({ order }: { order: OrderSummary }) {
  const { t, money, date, number } = useI18n();
  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group border-border bg-card hover:border-foreground/25 flex items-center gap-4 rounded-3xl border p-4 transition-all hover:shadow-[var(--shadow-soft)] sm:p-5"
    >
      <div className="flex shrink-0 -space-x-6 rtl:space-x-reverse">
        {(order.thumbnails.length ? order.thumbnails : [null]).slice(0, 3).map((src, i) => (
          <SmartImage
            key={i}
            src={src}
            alt=""
            width={64}
            height={80}
            wrapperClassName="h-20 w-16 rounded-xl ring-2 ring-card"
          />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold" dir="ltr">
            {order.number}
          </p>
          <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("account.placedOn", { date: date(order.created_at) })} ·{" "}
          {t("account.itemsCount", { count: number(order.total_quantity) })}
        </p>
        <p className="mt-1 font-semibold tabular-nums">{money(order.grand_total)}</p>
      </div>
      <ChevronRight className="rtl-flip text-muted-foreground size-5 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
    </Link>
  );
}
