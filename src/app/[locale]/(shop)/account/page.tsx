"use client";

import { ArrowRight, MailWarning, Package, PackageCheck, RotateCcw, Truck } from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/account/account-shell";
import { OrderCard } from "@/components/account/order-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useOrders, useOrdersSummary } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

export default function AccountOverviewPage() {
  const { t, number } = useI18n();
  const { user } = useAuth();
  const summary = useOrdersSummary();
  const orders = useOrders({ page: 1 });
  const [sending, setSending] = useState(false);
  const stats = [
    { icon: Truck, label: t("account.openOrders"), value: summary.data?.open },
    { icon: Package, label: t("account.totalOrders"), value: summary.data?.total },
    { icon: PackageCheck, label: t("account.delivered"), value: summary.data?.delivered },
    { icon: RotateCcw, label: t("account.activeReturns"), value: summary.data?.returns },
  ];
  return (
    <>
      <PageTitle title={t("account.hi", { name: user?.first_name || user?.email.split("@")[0] || "" })} />
      {user && !user.is_email_verified ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="flex items-center gap-2">
            <MailWarning className="size-4" />
            {t("account.verifyBanner")}
          </p>
          <Button
            size="sm"
            variant="outline"
            loading={sending}
            onClick={async () => {
              setSending(true);
              try {
                const r = await authService.resendVerification();
                notify.success(r.detail);
              } catch (e) {
                notify.error(e);
              } finally {
                setSending(false);
              }
            }}
          >
            {t("account.resendLink")}
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            className="border-border bg-card animate-rise rounded-3xl border p-4 sm:p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Icon className="text-brand-600 size-5" />
            {summary.isLoading ? (
              <Skeleton className="mt-3 h-8 w-12" />
            ) : (
              <p className="font-display mt-3 text-3xl font-extrabold tabular-nums">{number(value ?? 0)}</p>
            )}
            <p className="text-muted-foreground text-xs sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">{t("account.recentOrders")}</h2>
        <Link
          href="/account/orders"
          className="hover:text-brand-700 inline-flex items-center gap-1 text-sm font-semibold"
        >
          {t("common.viewAll")}
          <ArrowRight className="rtl-flip size-4" />
        </Link>
      </div>
      {orders.isLoading ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      ) : orders.data?.results.length ? (
        <div className="space-y-3">
          {orders.data.results.slice(0, 3).map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={t("account.noOrders")}
          description={t("account.noOrdersHint")}
          className="border-border rounded-3xl border border-dashed"
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
