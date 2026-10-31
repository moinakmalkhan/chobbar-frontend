"use client";

import { Package } from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrders } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { cn } from "@/lib/utils";

type Tab = "all" | "open" | "past";

export default function OrdersPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(1);
  const orders = useOrders({ page, open: tab === "all" ? undefined : tab === "open" });
  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t("account.allOrders") },
    { key: "open", label: t("account.openOrders") },
    { key: "past", label: t("account.pastOrders") },
  ];
  return (
    <>
      <PageTitle title={t("account.orders")} />
      <div className="bg-muted mb-5 inline-flex rounded-full p-1" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={tab === x.key}
            onClick={() => {
              setTab(x.key);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
              tab === x.key ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {x.label}
          </button>
        ))}
      </div>
      {orders.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : orders.data?.results.length ? (
        <div className={cn("space-y-3 transition-opacity", orders.isPlaceholderData && "opacity-60")}>
          {orders.data.results.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
          <Pagination
            className="pt-4"
            page={orders.data.page}
            totalPages={orders.data.total_pages}
            count={orders.data.count}
            pageSize={orders.data.page_size}
            onChange={setPage}
          />
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={t("account.noOrders")}
          description={t("account.noOrdersHint")}
          action={
            <Button asChild>
              <Link href="/products">{t("common.shopNow")}</Link>
            </Button>
          }
        />
      )}
    </>
  );
}
