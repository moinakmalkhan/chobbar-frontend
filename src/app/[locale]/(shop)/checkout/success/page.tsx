"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Package, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";

import { CartTotals } from "@/components/cart/cart-totals";
import { LAST_ORDER_KEY } from "@/components/checkout/checkout-form";
import { SmartImage } from "@/components/shared/smart-image";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useBankAccounts } from "@/hooks/use-orders";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { ordersService, paymentsService } from "@/services/orders";
import type { Order } from "@/types/api";

function readLastOrder(): string | null {
  try {
    return sessionStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}

function CopyButton({ value }: { value: string }) {
  const { t } = useI18n();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value).catch(() => undefined);
        setDone(true);
        notify.success(t("success.copied"));
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label={t("success.copy")}
      className="text-muted-foreground hover:bg-muted hover:text-foreground grid size-8 place-items-center rounded-full"
    >
      {done ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </button>
  );
}

function ReceiptUpload({ order }: { order: Order }) {
  const { t } = useI18n();
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <p className="animate-in fade-in rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        {t("success.receiptDone")}
      </p>
    );
  }
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!reference.trim()) return;
        setBusy(true);
        try {
          const form = new FormData();
          form.append("reference", reference.trim());
          form.append("email", order.email);
          if (file) form.append("proof", file);
          await paymentsService.submitProof(order.id, form);
          setDone(true);
          notify.success(t("success.receiptDone"));
        } catch (err) {
          notify.error(err);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div>
        <Label htmlFor="reference">{t("success.reference")}</Label>
        <Input id="reference" required value={reference} onChange={(e) => setReference(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="proof">{t("success.receiptFile")}</Label>
        <label
          htmlFor="proof"
          className="border-border text-muted-foreground hover:border-foreground/40 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 text-sm transition-colors"
        >
          <Upload className="size-5" />
          <span className="truncate">{file ? file.name : t("success.chooseFile")}</span>
        </label>
        <input
          id="proof"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <Button type="submit" className="w-full" loading={busy} disabled={!reference.trim()}>
        {t("success.submitReceipt")}
      </Button>
    </form>
  );
}

function SuccessContent() {
  const { t, money } = useI18n();
  const id = useSearchParams().get("order") ?? "";
  const { isAuthenticated, hydrated } = useAuth();
  const raw = useSyncExternalStore(
    () => () => undefined,
    readLastOrder,
    () => null,
  );
  const cached = raw ? (JSON.parse(raw) as Order) : null;
  const local = cached && cached.id === id ? cached : null;
  const remote = useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => ordersService.get(id),
    enabled: hydrated && isAuthenticated && !!id,
    initialData: local ?? undefined,
  });
  const order = remote.data ?? local;
  const bank = useBankAccounts(order?.payment_method === "bank_transfer");

  if (!order) {
    if (!hydrated || remote.isLoading) return <Skeleton className="mx-auto h-96 max-w-2xl" />;
    return (
      <EmptyState
        icon={Package}
        title={t("track.title")}
        description={t("track.subtitle")}
        action={
          <Button asChild>
            <Link href="/track">{t("success.trackOrder")}</Link>
          </Button>
        }
      />
    );
  }

  const name = order.shipping_address.full_name.split(" ")[0] || order.shipping_address.full_name;
  const isBank = order.payment_method === "bank_transfer";
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="relative mx-auto mb-6 grid size-20 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 [animation-iteration-count:2]"
          />
          <span className="animate-in zoom-in-95 relative grid size-20 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Check className="size-10" strokeWidth={3} />
          </span>
        </div>
        <h1 className="font-display animate-rise text-3xl font-extrabold">{t("success.title", { name })}</h1>
        <p className="text-muted-foreground animate-rise mt-2 [animation-delay:80ms]">
          {t("success.subtitle", { number: order.number, email: order.email })}
        </p>
      </div>

      <div className="border-border bg-card mt-8 rounded-3xl border p-5 sm:p-6">
        <p className="text-sm">
          {isBank
            ? t("success.bankNext", { amount: money(order.grand_total), number: order.number })
            : t("success.codNext", { amount: money(order.grand_total) })}
        </p>
        {isBank ? (
          <div className="mt-5 space-y-3">
            {(bank.data ?? []).map((b) => (
              <div key={b.label} className="bg-surface rounded-2xl p-4 text-sm">
                <p className="font-semibold">{b.bank_name}</p>
                <p className="text-muted-foreground">{b.account_name}</p>
                <p className="mt-1 flex items-center justify-between gap-2 font-mono" dir="ltr">
                  {b.account_number}
                  <CopyButton value={b.account_number.replace(/\s/g, "")} />
                </p>
                {b.iban ? (
                  <p
                    className="text-muted-foreground flex items-center justify-between gap-2 font-mono text-xs"
                    dir="ltr"
                  >
                    {b.iban}
                    <CopyButton value={b.iban} />
                  </p>
                ) : null}
              </div>
            ))}
            <div className="border-border border-t pt-5">
              <h2 className="mb-4 font-semibold">{t("success.uploadReceipt")}</h2>
              <ReceiptUpload order={order} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-border bg-card mt-6 rounded-3xl border p-5 sm:p-6">
        <ul className="mb-5 space-y-3">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-3">
              <SmartImage
                src={i.image_url}
                alt={i.product_name}
                width={56}
                height={70}
                wrapperClassName="h-[70px] w-14 shrink-0 rounded-lg"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.product_name}</p>
                <p className="text-muted-foreground text-xs">
                  {i.variant_label} × {i.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{money(i.line_total)}</p>
            </li>
          ))}
        </ul>
        <CartTotals
          subtotal={order.subtotal}
          discount={order.discount_total}
          shipping={order.shipping_total}
          codFee={order.cod_fee}
          total={order.grand_total}
        />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link
            href={
              isAuthenticated
                ? `/account/orders/${order.id}`
                : `/track?number=${order.number}&contact=${encodeURIComponent(order.email)}`
            }
          >
            {t("success.trackOrder")}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/products">{t("success.keepShopping")}</Link>
        </Button>
      </div>
      {!isAuthenticated ? (
        <p className="text-muted-foreground mt-6 text-center text-sm">
          <Link
            href={`/register?email=${encodeURIComponent(order.email)}`}
            className="text-foreground font-semibold underline underline-offset-4"
          >
            {t("success.createAccount")}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container-x py-10 sm:py-16">
      <Suspense fallback={<Skeleton className="mx-auto h-96 max-w-2xl" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
