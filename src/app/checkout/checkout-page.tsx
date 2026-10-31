"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CreditCard, Landmark, MapPin, Plus, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AddressForm } from "@/components/account/address-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { formatMoney, PAYMENT_TERMS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { accountsService } from "@/services/accounts";
import { ordersService } from "@/services/orders";
import type { PaymentMethod } from "@/types/api";

export function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, hydrated, company, canOrder, user, membership } = useAuth();
  const { data: cart, isLoading } = useCart();
  const addresses = useQuery({ queryKey: queryKeys.addresses, queryFn: accountsService.addresses, enabled: hydrated && isAuthenticated && !!company });
  const methods = useQuery({ queryKey: queryKeys.shippingMethods, queryFn: ordersService.shippingMethods, staleTime: 30 * 60_000 });
  const companyDetail = useQuery({ queryKey: queryKeys.company, queryFn: accountsService.company, enabled: hydrated && isAuthenticated && !!company });

  const [shippingChoice, setShipping] = useState("");
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState("");
  const [methodChoice, setMethod] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("bank_transfer");
  const [po, setPo] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace("/login?next=/checkout");
  }, [hydrated, isAuthenticated, router]);
  const defaultShipping = addresses.data?.find((a) => a.is_default && a.kind === "shipping")?.id ?? addresses.data?.[0]?.id ?? "";
  const defaultMethod = methods.data?.[0]?.code ?? "";

  const shipping = shippingChoice || defaultShipping;
  const method = methodChoice || defaultMethod;
  const weightKg = useMemo(() => (cart?.items ?? []).reduce((kg, i) => kg + (0.25 * i.quantity), 0), [cart]);
  const selectedMethod = methods.data?.find((m) => m.code === method);
  const freight = selectedMethod ? Number(selectedMethod.base_price) + Number(selectedMethod.price_per_kg) * weightKg : 0;
  const total = Number(cart?.subtotal ?? 0) + freight;
  const netAllowed = Boolean(companyDetail.data?.is_verified && companyDetail.data.payment_terms.startsWith("net_"));
  const threshold = Number(membership?.order_limit || company?.approval_threshold || 0);
  const needsApproval = membership && !["owner", "admin"].includes(membership.role) && threshold > 0 && Number(cart?.subtotal ?? 0) > threshold;

  const place = useMutation({
    mutationFn: () => ordersService.checkout({ shipping_address: shipping, billing_address: billingSame ? null : billing || null, shipping_method: method, payment_method: payment, po_number: po, customer_notes: notes, requested_delivery_date: deliveryDate || null }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      notify.success(`Order ${order.number} placed`, order.status === "pending_approval" ? "Waiting for a company admin to approve." : order.status === "pending_payment" ? "Bank details are on the order page." : "Confirmed — production is being scheduled.");
      router.push(`/account/orders/${order.id}?placed=1`);
    },
    onError: (e) => notify.error(e, "Couldn't place the order"),
  });

  if (!hydrated || !isAuthenticated || (isLoading && !cart)) return <div className="container-x py-10"><Skeleton className="h-8 w-48" /><Skeleton className="mt-6 h-64" /></div>;
  if (!company) return <div className="container-x py-16 text-center"><Building2 className="mx-auto size-10 text-brand-500" /><h1 className="mt-4 font-display text-2xl font-bold">Set up your company first</h1><p className="mt-2 text-muted-foreground">Orders are placed on behalf of a company account.</p><Button className="mt-5" asChild><Link href="/account/company">Create company</Link></Button></div>;
  if (!cart?.items.length) return <div className="container-x py-16 text-center"><h1 className="font-display text-2xl font-bold">Your cart is empty</h1><Button className="mt-5" asChild><Link href="/products">Browse products</Link></Button></div>;
  if (!canOrder) return <div className="container-x py-16 text-center"><h1 className="font-display text-2xl font-bold">You can't place orders with your current role</h1><p className="mt-2 text-muted-foreground">Ask a company owner or admin to upgrade your role or place the order.</p></div>;
  if (!user?.is_email_verified) return <div className="container-x py-16 text-center"><h1 className="font-display text-2xl font-bold">Verify your email to order</h1><p className="mt-2 text-muted-foreground">Check your inbox for the verification link.</p><Button className="mt-5" variant="outline" asChild><Link href="/verify-email">Resend verification</Link></Button></div>;

  return (
    <div className="container-x py-8 lg:py-12">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 2 of 2</p>
      <h1 className="font-display text-3xl font-bold">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); place.mutate(); }}>
          <Section icon={MapPin} title="Shipping address" action={<Button type="button" variant="ghost" size="sm" onClick={() => setAddressOpen(true)}><Plus /> New address</Button>}>
            {addresses.isLoading ? <Skeleton className="h-20" /> : addresses.data?.length ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {addresses.data.map((a) => (
                  <label key={a.id} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition-colors", shipping === a.id ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : "border-border hover:border-ink-400")}>
                    <input type="radio" name="shipping" value={a.id} checked={shipping === a.id} onChange={() => setShipping(a.id)} className="mt-1 accent-brand-500" />
                    <span><span className="font-semibold">{a.label || a.contact_name}</span>{a.is_default ? <span className="ml-2 rounded bg-muted px-1.5 text-[10px] font-semibold uppercase">Default</span> : null}<br /><span className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.postal_code}, {a.country}</span></span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No addresses yet. <button type="button" className="font-medium text-brand-600 underline" onClick={() => setAddressOpen(true)}>Add your first address</button>.</div>
            )}
            <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="accent-brand-500" /> Billing address is the same</label>
            {!billingSame ? (
              <select value={billing} onChange={(e) => setBilling(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="">Choose billing address</option>{addresses.data?.map((a) => <option key={a.id} value={a.id}>{a.label || a.line1}, {a.city}</option>)}</select>
            ) : null}
          </Section>

          <Section icon={Truck} title="Freight">
            <div className="grid gap-2">
              {methods.data?.map((m) => {
                const est = Number(m.base_price) + Number(m.price_per_kg) * weightKg;
                return (
                  <label key={m.code} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm", method === m.code ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : "border-border hover:border-ink-400")}>
                    <input type="radio" name="method" checked={method === m.code} onChange={() => setMethod(m.code)} className="accent-brand-500" />
                    <span className="flex-1"><span className="font-semibold">{m.name}</span><span className="block text-xs text-muted-foreground">{m.description} · {m.min_days}–{m.max_days} days</span></span>
                    <span className="font-semibold tabular-nums">{formatMoney(est, cart.currency)}</span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Estimated on ~{weightKg.toFixed(1)} kg. Final freight is confirmed with your invoice; duties and taxes are paid by the receiver.</p>
          </Section>

          <Section icon={Landmark} title="Payment">
            <div className="grid gap-2">
              <PayOption checked={payment === "bank_transfer"} onChange={() => setPayment("bank_transfer")} icon={Landmark} title="Bank transfer / wire" text={companyDetail.data?.payment_terms === "deposit_50" ? "50% deposit now, balance before shipping. Bank details shown after ordering." : "Full amount before production. Bank details shown after ordering."} />
              <PayOption checked={payment === "net_terms"} onChange={() => setPayment("net_terms")} disabled={!netAllowed} icon={ShieldCheck} title={`Net terms${companyDetail.data?.payment_terms.startsWith("net_") ? ` (${PAYMENT_TERMS_LABELS[companyDetail.data.payment_terms]})` : ""}`} text={netAllowed ? `Invoice due ${PAYMENT_TERMS_LABELS[companyDetail.data!.payment_terms].toLowerCase()} · ${formatMoney(companyDetail.data!.credit_available, company.currency)} credit available` : "Available to verified companies with approved terms. Ask sales to enable."} />
              <PayOption checked={false} onChange={() => undefined} disabled icon={CreditCard} title="Card" text="Coming soon." />
            </div>
          </Section>

          <Section icon={Building2} title="Purchase order details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label htmlFor="po">PO number (optional)</Label><Input id="po" value={po} onChange={(e) => setPo(e.target.value)} placeholder="Your internal reference" maxLength={64} /></div>
              <div><Label htmlFor="date">Requested delivery date (optional)</Label><Input id="date" type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} /></div>
            </div>
            <div className="mt-4"><Label htmlFor="cnotes">Notes</Label><Textarea id="cnotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Artwork timing, packing per team, labels…" /></div>
          </Section>

          {needsApproval ? <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">This order is above your approval limit of {formatMoney(threshold, company.currency)}. It will be sent to a company admin for approval before we proceed.</p> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" loading={place.isPending} disabled={!shipping || !method}>{needsApproval ? "Submit for approval" : payment === "net_terms" ? "Place order on terms" : "Place order"}</Button>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-bold">Order summary</h2>
            <ul className="mt-3 divide-y divide-border text-sm">
              {cart.items.map((i) => <li key={i.id} className="flex justify-between gap-3 py-2"><span className="min-w-0"><span className="block truncate font-medium">{i.product.name}</span><span className="text-xs text-muted-foreground">{i.fabric_name} · {i.quantity} pcs</span></span><span className="tabular-nums">{formatMoney(i.line_total, cart.currency)}</span></li>)}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatMoney(cart.subtotal, cart.currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Freight (est.)</dt><dd className="tabular-nums">{formatMoney(freight, cart.currency)}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(total, cart.currency)}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">Ordering as <span className="font-medium text-foreground">{company.name}</span> · {user?.email}</p>
          </div>
        </aside>
      </div>

      <Dialog open={addressOpen} onOpenChange={setAddressOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New shipping address</DialogTitle></DialogHeader>
          <AddressForm onDone={(a) => { setAddressOpen(false); if (a) setShipping(a.id); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ icon: Icon, title, action, children }: { icon: typeof MapPin; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 font-display text-lg font-bold"><Icon className="size-5 text-brand-500" /> {title}</h2>{action}</div>
      {children}
    </section>
  );
}

function PayOption({ checked, onChange, disabled, icon: Icon, title, text }: { checked: boolean; onChange: () => void; disabled?: boolean; icon: typeof Landmark; title: string; text: string }) {
  return (
    <label className={cn("flex items-start gap-3 rounded-xl border p-3 text-sm", disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer", checked ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : "border-border hover:border-ink-400")}>
      <input type="radio" name="payment" checked={checked} onChange={onChange} disabled={disabled} className="mt-1 accent-brand-500" />
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span><span className="font-semibold">{title}</span><span className="block text-xs text-muted-foreground">{text}</span></span>
    </label>
  );
}
