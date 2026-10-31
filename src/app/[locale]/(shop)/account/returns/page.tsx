"use client";

import { RotateCcw } from "lucide-react";

import { PageTitle } from "@/components/account/account-shell";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useReturns } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";

export default function ReturnsPage() {
  const { t, date, money } = useI18n();
  const { data, isLoading } = useReturns();
  return (
    <>
      <PageTitle title={t("account.returns")} subtitle={t("product.returnsText")} />
      {isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : data?.results.length ? (
        <ul className="space-y-3">
          {data.results.map((r) => (
            <li key={r.id} className="border-border bg-card rounded-3xl border p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  <span dir="ltr">{r.number}</span> ·{" "}
                  <span className="text-muted-foreground" dir="ltr">
                    {r.order_number}
                  </span>
                </p>
                <StatusBadge status={r.status} label={t(`status.${r.status}`)} />
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {t(r.kind === "refund" ? "account.refund" : "account.exchange")} ·{" "}
                {t(`account.reasons.${r.reason as "size"}`)} · {date(r.created_at)}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {r.items.map((i) => (
                  <li key={i.order_item}>
                    {i.product_name}{" "}
                    <span className="text-muted-foreground">
                      · {i.variant_label} × {i.quantity}
                    </span>
                  </li>
                ))}
              </ul>
              {r.refund_amount ? (
                <p className="mt-3 text-sm font-semibold">
                  {t("account.refund")}: {money(r.refund_amount)}
                </p>
              ) : null}
              {r.staff_notes ? (
                <p className="bg-surface mt-3 rounded-2xl p-3 text-sm">{r.staff_notes}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={RotateCcw} title={t("account.noReturns")} />
      )}
    </>
  );
}
