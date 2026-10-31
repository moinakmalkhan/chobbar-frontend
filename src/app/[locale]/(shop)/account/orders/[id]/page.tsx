"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  ExternalLink,
  MapPin,
  MessageCircle,
  Printer,
  RefreshCcw,
  RotateCcw,
  Star,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { CancelDialog, ReturnDialog } from "@/components/account/order-dialogs";
import { CartTotals } from "@/components/cart/cart-totals";
import { ReviewDialog } from "@/components/catalog/reviews-section";
import { NewConversation } from "@/components/chat/new-conversation";
import { OrderProgress, Timeline } from "@/components/orders/order-progress";
import { SmartImage } from "@/components/shared/smart-image";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder, useOrderActions } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { paymentsService } from "@/services/orders";
import { useUIStore } from "@/stores/ui-store";
import type { Order } from "@/types/api";

function PaymentBox({ order }: { order: Order }) {
  const { t, date } = useI18n();
  const payments = useQuery({
    queryKey: queryKeys.payments(order.id),
    queryFn: () => paymentsService.forOrder(order.id),
  });
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const latest = payments.data?.[0];
  const needsProof =
    order.payment_method === "bank_transfer" &&
    order.payment_status === "unpaid" &&
    order.status !== "cancelled" &&
    (!latest || latest.status === "pending" || latest.status === "failed");
  const method =
    order.payment_method === "cod"
      ? t("checkout.cod")
      : order.payment_method === "bank_transfer"
        ? t("checkout.bank")
        : t("checkout.card");
  return (
    <div className="border-border bg-card rounded-3xl border p-5">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Banknote className="size-4" />
        {t("account.payment")}
      </h2>
      <p className="text-sm">{method}</p>
      <StatusBadge
        className="mt-2"
        status={order.payment_status}
        label={t(`status.${order.payment_status}`)}
      />
      {latest && latest.status === "submitted" ? (
        <p className="text-muted-foreground mt-3 text-xs">
          {t("status.submitted")} · {date(latest.submitted_at)}
        </p>
      ) : null}
      {needsProof ? (
        <form
          className="border-border mt-4 space-y-3 border-t pt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const form = new FormData();
              form.append("reference", reference);
              if (file) form.append("proof", file);
              await paymentsService.submitProof(order.id, form);
              notify.success(t("success.receiptDone"));
              payments.refetch();
            } catch (err) {
              notify.error(err);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="text-sm font-medium">{t("success.uploadReceipt")}</p>
          <div>
            <Label htmlFor="ref">{t("success.reference")}</Label>
            <Input id="ref" required value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <input
            type="file"
            accept="image/*"
            aria-label={t("success.receiptFile")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="file:bg-muted block w-full text-xs file:me-3 file:rounded-full file:border-0 file:px-3 file:py-2 file:text-xs file:font-semibold"
          />
          <Button type="submit" size="sm" className="w-full" loading={busy} disabled={!reference.trim()}>
            {t("success.submitReceipt")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, money, date } = useI18n();
  const router = useRouter();
  const { data: order, isLoading, isError } = useOrder(id);
  const { reorder } = useOrderActions(id);
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [chatOpen, setChatDialog] = useState(false);
  const [review, setReview] = useState<{ slug: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }
  if (isError || !order) {
    return (
      <EmptyState
        icon={XCircle}
        title={t("errors.notFound")}
        action={
          <Button asChild variant="outline">
            <Link href="/account/orders">{t("common.back")}</Link>
          </Button>
        }
      />
    );
  }
  const addr = order.shipping_address;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/account/orders"
          className="text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="rtl-flip size-4" />
          {t("account.orders")}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display flex flex-wrap items-center gap-3 text-2xl font-extrabold sm:text-3xl">
              <span dir="ltr">{order.number}</span>
              <StatusBadge status={order.status} label={t(`status.${order.status}`)} />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("account.placedOn", { date: date(order.created_at, { dateStyle: "long" }) })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => reorder.mutate()} loading={reorder.isPending}>
              <RefreshCcw />
              {t("account.reorder")}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/print/receipt/${order.id}`} target="_blank">
                <Printer />
                {t("account.printReceipt")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
        <OrderProgress status={order.status} />
        {order.estimated_delivery || order.tracking_number ? (
          <div className="bg-surface mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm">
            <div className="space-y-0.5">
              {order.estimated_delivery ? (
                <p>
                  {t("track.estimated")}:{" "}
                  <span className="font-semibold">{date(order.estimated_delivery)}</span>
                </p>
              ) : null}
              {order.tracking_number ? (
                <p>
                  {order.carrier} · <span dir="ltr">{order.tracking_number}</span>
                </p>
              ) : null}
            </div>
            {order.tracking_url ? (
              <Button asChild size="sm" variant="secondary">
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                  {t("track.trackWithCourier")}
                  <ExternalLink />
                </a>
              </Button>
            ) : null}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          {order.can_cancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle />
              {t("account.cancelOrder")}
            </Button>
          ) : null}
          {order.can_return ? (
            <Button variant="outline" size="sm" onClick={() => setReturnOpen(true)}>
              <RotateCcw />
              {t("account.requestReturn")}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => setChatDialog(true)}>
            <MessageCircle />
            {t("account.chatAboutOrder")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
            <ul className="divide-border divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  {item.product_slug ? (
                    <Link href={`/products/${item.product_slug}`} className="shrink-0">
                      <SmartImage
                        src={item.image_url}
                        alt={item.product_name}
                        width={72}
                        height={90}
                        wrapperClassName="h-[90px] w-[72px] rounded-xl"
                      />
                    </Link>
                  ) : (
                    <SmartImage
                      src={item.image_url}
                      alt={item.product_name}
                      width={72}
                      height={90}
                      wrapperClassName="h-[90px] w-[72px] shrink-0 rounded-xl"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-muted-foreground text-sm">
                      {item.variant_label} × {item.quantity}
                    </p>
                    {item.returned_quantity ? (
                      <p className="text-muted-foreground text-xs">
                        {t("status.returned")}: {item.returned_quantity}
                      </p>
                    ) : null}
                    {item.can_review && item.product_slug ? (
                      <button
                        type="button"
                        onClick={() => setReview({ slug: item.product_slug!, name: item.product_name })}
                        className="text-brand-700 dark:text-brand-400 mt-2 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                      >
                        <Star className="size-4" />
                        {t("account.writeReview")}
                      </button>
                    ) : null}
                  </div>
                  <p className="font-semibold tabular-nums">{money(item.line_total)}</p>
                </li>
              ))}
            </ul>
            <div className="border-border mt-5 border-t pt-5">
              <CartTotals
                subtotal={order.subtotal}
                discount={order.discount_total}
                shipping={order.shipping_total}
                codFee={order.cod_fee}
                total={order.grand_total}
              />
              {order.coupon_code ? (
                <p className="text-muted-foreground mt-2 text-xs" dir="ltr">
                  {order.coupon_code}
                </p>
              ) : null}
            </div>
          </div>
          {order.returns.length ? (
            <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
              <h2 className="mb-4 font-semibold">{t("account.returns")}</h2>
              <ul className="space-y-3">
                {order.returns.map((r) => (
                  <li
                    key={r.id}
                    className="bg-surface flex flex-wrap items-center justify-between gap-2 rounded-2xl p-3 text-sm"
                  >
                    <span dir="ltr" className="font-medium">
                      {r.number}
                    </span>
                    <span>{t(r.kind === "refund" ? "account.refund" : "account.exchange")}</span>
                    <StatusBadge status={r.status} label={t(`status.${r.status}`)} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="border-border bg-card rounded-3xl border p-5 sm:p-6">
            <h2 className="mb-5 font-semibold">{t("account.timeline")}</h2>
            <Timeline
              entries={order.history.map((h) => ({ status: h.to_status, note: h.note, at: h.created_at }))}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="border-border bg-card rounded-3xl border p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin className="size-4" />
              {t("account.deliveryTo")}
            </h2>
            <address className="text-muted-foreground space-y-0.5 text-sm not-italic">
              <p className="text-foreground font-medium">{addr.full_name}</p>
              <p>{addr.line1}</p>
              {addr.line2 ? <p>{addr.line2}</p> : null}
              <p>{[addr.city, addr.province, addr.postal_code].filter(Boolean).join(", ")}</p>
              <p dir="ltr" className="rtl:text-right">
                {addr.phone}
              </p>
            </address>
            {order.shipping_zone ? (
              <p className="text-muted-foreground mt-3 text-xs">
                {t("checkout.eta", { min: order.shipping_zone.min_days, max: order.shipping_zone.max_days })}
              </p>
            ) : null}
          </div>
          <PaymentBox order={order} />
          <div className="bg-surface rounded-3xl p-5 text-sm">
            <p className="font-semibold">{t("account.needHelp")}</p>
            <button
              type="button"
              className="text-brand-700 dark:text-brand-400 mt-2 font-medium hover:underline"
              onClick={() => {
                setChatOpen(true, null);
              }}
            >
              {t("chat.launcher")}
            </button>
          </div>
        </div>
      </div>

      <CancelDialog order={order} open={cancelOpen} onOpenChange={setCancelOpen} />
      {order.can_return ? (
        <ReturnDialog order={order} open={returnOpen} onOpenChange={setReturnOpen} />
      ) : null}
      {review ? (
        <ReviewDialog
          productSlug={review.slug}
          productName={review.name}
          open={!!review}
          onOpenChange={(v) => !v && setReview(null)}
        />
      ) : null}
      <Dialog open={chatOpen} onOpenChange={setChatDialog}>
        <DialogContent className="p-0" closeLabel={t("common.close")} aria-describedby={undefined}>
          <DialogTitle className="px-5 pt-5">{t("account.chatAboutOrder")}</DialogTitle>
          <NewConversation
            orderId={order.id}
            orderNumber={order.number}
            onStarted={(c) => {
              setChatDialog(false);
              router.push(`/account/messages/${c.id}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
