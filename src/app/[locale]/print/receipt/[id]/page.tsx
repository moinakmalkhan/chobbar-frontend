"use client";

import { Printer } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useOrder } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { SITE } from "@/lib/env";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { t, money, date } = useI18n();
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const { data: order } = useOrder(id);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace(`/login?next=/print/receipt/${id}`);
  }, [hydrated, isAuthenticated, id, router]);

  if (!order) return <Skeleton className="m-8 h-[80vh]" />;
  const a = order.shipping_address;
  const method =
    order.payment_method === "cod"
      ? t("checkout.cod")
      : order.payment_method === "bank_transfer"
        ? t("checkout.bank")
        : t("checkout.card");
  return (
    <div className="text-ink-900 mx-auto max-w-3xl bg-white p-8 print:p-0">
      <div className="no-print mb-6 flex justify-end">
        <Button onClick={() => window.print()}>
          <Printer />
          {t("account.printReceipt")}
        </Button>
      </div>
      <header className="border-ink-200 flex items-start justify-between gap-6 border-b pb-6">
        <div>
          <Logo className="text-ink-900 h-9 [--logo-cut:#fff]" />
          <p className="text-ink-500 mt-2 text-xs">
            {SITE.address} · {SITE.supportEmail}
          </p>
        </div>
        <div className="text-end">
          <h1 className="text-2xl font-extrabold">{t("account.receipt")}</h1>
          <p className="text-sm" dir="ltr">
            {order.number}
          </p>
          <p className="text-ink-500 text-xs">{date(order.created_at, { dateStyle: "long" })}</p>
        </div>
      </header>
      <section className="grid grid-cols-2 gap-6 py-6 text-sm">
        <div>
          <p className="text-ink-500 mb-1 text-xs font-bold tracking-wider uppercase">
            {t("account.deliveryTo")}
          </p>
          <p className="font-semibold">{a.full_name}</p>
          <p>{a.line1}</p>
          {a.line2 ? <p>{a.line2}</p> : null}
          <p>{[a.city, a.province, a.postal_code].filter(Boolean).join(", ")}</p>
          <p dir="ltr">{a.phone}</p>
        </div>
        <div>
          <p className="text-ink-500 mb-1 text-xs font-bold tracking-wider uppercase">
            {t("account.payment")}
          </p>
          <p>{method}</p>
          <p>{t(`status.${order.payment_status}`)}</p>
          <p className="text-ink-500 mt-3 mb-1 text-xs font-bold tracking-wider uppercase">
            {t("account.order")}
          </p>
          <p>{t(`status.${order.status}`)}</p>
        </div>
      </section>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-ink-200 text-ink-500 border-y text-start text-xs tracking-wider uppercase">
            <th className="py-2 text-start">{t("product.details")}</th>
            <th className="py-2 text-center">{t("product.quantity")}</th>
            <th className="py-2 text-end">{t("cart.total")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id} className="border-ink-100 border-b">
              <td className="py-3">
                <p className="font-medium">{i.product_name}</p>
                <p className="text-ink-500 text-xs">
                  {i.variant_label} · <span dir="ltr">{i.sku}</span>
                </p>
              </td>
              <td className="py-3 text-center tabular-nums">{i.quantity}</td>
              <td className="py-3 text-end tabular-nums">{money(i.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ms-auto mt-6 w-64 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span>{t("cart.subtotal")}</span>
          <span className="tabular-nums">{money(order.subtotal)}</span>
        </div>
        {order.discount_total ? (
          <div className="flex justify-between">
            <span>{t("cart.discount")}</span>
            <span className="tabular-nums">−{money(order.discount_total)}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>{t("cart.delivery")}</span>
          <span className="tabular-nums">
            {order.shipping_total ? money(order.shipping_total) : t("common.free")}
          </span>
        </div>
        {order.cod_fee ? (
          <div className="flex justify-between">
            <span>{t("checkout.codFee")}</span>
            <span className="tabular-nums">{money(order.cod_fee)}</span>
          </div>
        ) : null}
        <div className="border-ink-200 flex justify-between border-t pt-2 text-base font-bold">
          <span>{t("cart.total")}</span>
          <span className="tabular-nums">{money(order.grand_total)}</span>
        </div>
      </div>
      <p className="text-ink-500 mt-12 text-center text-xs">{t("footer.madeIn")} · chobbar.shop</p>
    </div>
  );
}
