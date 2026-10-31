"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban, CheckCircle2, FileText, Landmark, MessageSquare, Printer, RotateCcw, Truck, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { OrderTimeline } from "@/components/account/order-timeline";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatDateTime, formatMoney, GENDER_LABELS, ORDER_STATUS_LABELS, PAYMENT_TERMS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { ordersService } from "@/services/orders";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { useStartConversation } from "@/hooks/use-chat";
import type { Payment } from "@/types/api";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canOrder, canManage, company } = useAuth();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  const start = useStartConversation();
  const order = useQuery({ queryKey: queryKeys.order(id), queryFn: () => ordersService.get(id) });
  const payments = useQuery({ queryKey: queryKeys.payments(id), queryFn: () => ordersService.payments(id), enabled: !!order.data });
  const bank = useQuery({ queryKey: queryKeys.bankAccounts, queryFn: ordersService.bankAccounts, enabled: order.data?.payment_method === "bank_transfer" && order.data.payment_status !== "paid" });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [proofFor, setProofFor] = useState<Payment | null>(null);
  const refresh = () => { queryClient.invalidateQueries({ queryKey: queryKeys.order(id) }); queryClient.invalidateQueries({ queryKey: ["orders"] }); queryClient.invalidateQueries({ queryKey: queryKeys.payments(id) }); };

  const approve = useMutation({ mutationFn: () => ordersService.approve(id), onSuccess: (o) => { refresh(); notify.success(`${o.number} approved`, o.status === "pending_payment" ? "Awaiting payment to start production." : "Confirmed for production."); }, onError: (e) => notify.error(e, "Couldn't approve") });
  const reorder = useMutation({ mutationFn: () => ordersService.reorder(id), onSuccess: (r) => { queryClient.invalidateQueries({ queryKey: queryKeys.cart }); notify.action("Added to cart", r.detail, { label: "View cart", onClick: openDrawer }); }, onError: (e) => notify.error(e, "Couldn't reorder") });

  if (order.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;
  if (!order.data) return <p className="text-sm text-muted-foreground">Order not found.</p>;
  const o = order.data;
  const justPlaced = sp.get("placed") === "1";

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All orders</Link>
      {justPlaced ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div><p className="font-semibold">Thanks — order {o.number} is in.</p><p>{o.status === "pending_payment" ? "Transfer the amount below and submit the reference so we can start production." : o.status === "pending_approval" ? "A company admin has been asked to approve it." : "We've confirmed it and are scheduling production."} A confirmation email is on its way.</p></div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Order</p>
          <h1 className="font-mono text-3xl font-bold">{o.number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {formatDateTime(o.created_at)} by {o.placed_by || "—"}{o.po_number ? ` · PO ${o.po_number}` : ""} · {o.total_quantity} pcs</p>
          <div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} /><StatusBadge status={o.payment_status} /><span className="rounded-full border border-border px-2.5 py-0.5 text-xs">{o.payment_method === "net_terms" ? PAYMENT_TERMS_LABELS[o.payment_terms] : "Bank transfer"}</span></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {o.status === "pending_approval" && canManage ? <Button onClick={() => approve.mutate()} loading={approve.isPending}><CheckCircle2 /> Approve order</Button> : null}
          <Button variant="outline" asChild><Link href={`/print/invoice/${o.id}`} target="_blank"><Printer /> {o.payment_status === "paid" || o.payment_method === "net_terms" ? "Invoice" : "Pro-forma"}</Link></Button>
          {canOrder ? <Button variant="outline" onClick={() => reorder.mutate()} loading={reorder.isPending}><RotateCcw /> Reorder</Button> : null}
          <Button variant="outline" onClick={() => start.mutate({ body: `Hi, I have a question about order ${o.number}.`, order: o.id }, { onSuccess: (c) => setChatOpen(true, c.id) })} loading={start.isPending}><MessageSquare /> Ask about this order</Button>
          {o.can_cancel && canOrder ? <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setCancelOpen(true)}><Ban /> Cancel</Button> : null}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="size-4 text-brand-500" /> Progress</CardTitle></CardHeader>
        <CardContent>
          <OrderTimeline history={o.history} status={o.status} />
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            <Info label="Estimated ship date" value={formatDate(o.estimated_ship_date)} />
            <Info label="Freight" value={o.shipping_method ? `${o.shipping_method.name} · ${o.shipping_method.min_days}–${o.shipping_method.max_days} days` : "To be confirmed"} />
            <Info label="Tracking" value={o.tracking_number ? <>{o.carrier} <span className="font-mono">{o.tracking_number}</span>{o.tracking_url ? <> · <a href={o.tracking_url} target="_blank" rel="noreferrer" className="text-brand-600 underline">Track</a></> : null}</> : "Available once shipped"} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Items</CardTitle></CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {o.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-5">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">{item.image_url ? <Image src={item.image_url} alt="" fill sizes="80px" className="object-cover" /> : null}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.product_slug ? <Link href={`/products/${item.product_slug}`} className="hover:text-brand-600">{item.product_name}</Link> : item.product_name}</p><p className="text-xs text-muted-foreground">{item.sku} · {item.fabric_name}{item.color ? ` · ${item.color}` : ""}</p></div><p className="font-semibold tabular-nums">{formatMoney(item.line_total, o.currency)}</p></div>
                  <div className="mt-2 flex flex-wrap gap-1.5">{item.breakdown.map((l) => <span key={`${l.gender}-${l.size_id}`} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs"><span className="text-muted-foreground">{GENDER_LABELS[l.gender]?.[0]}</span> <b>{l.size}</b> × {l.quantity}</span>)}</div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{item.quantity} pcs × {formatMoney(item.unit_price, o.currency)}{item.notes ? ` · ${item.notes}` : ""}{item.artwork ? <> · <a href={item.artwork} target="_blank" rel="noreferrer" className="text-brand-600 underline">artwork</a></> : null}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-1.5 text-sm">
                <Row l="Subtotal" v={formatMoney(o.subtotal, o.currency)} />
                {Number(o.discount_total) > 0 ? <Row l="Volume & group savings" v={`−${formatMoney(o.discount_total, o.currency)}`} accent /> : null}
                <Row l="Freight (est.)" v={formatMoney(o.shipping_total, o.currency)} />
                {Number(o.tax_total) > 0 ? <Row l="Tax" v={formatMoney(o.tax_total, o.currency)} /> : null}
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{formatMoney(o.grand_total, o.currency)}</dd></div>
                <Row l="Paid" v={formatMoney(o.amount_paid, o.currency)} />
                {o.status !== "cancelled" ? <Row l="Balance due" v={formatMoney(o.balance_due, o.currency)} strong /> : null}
                {o.due_date ? <Row l="Invoice due" v={formatDate(o.due_date)} /> : null}
              </dl>
            </CardContent>
          </Card>

          {o.status !== "cancelled" && o.payment_method === "bank_transfer" ? (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Landmark className="size-4 text-brand-500" /> Payment</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {payments.data?.results.map((p) => (
                  <div key={p.id} className="rounded-xl border border-border p-3 text-sm">
                    <div className="flex items-center justify-between"><span className="font-semibold capitalize">{p.kind} · {formatMoney(p.amount, p.currency)}</span><StatusBadge status={p.status} /></div>
                    {p.reference ? <p className="mt-1 text-xs text-muted-foreground">Ref {p.reference}{p.submitted_at ? ` · sent ${formatDate(p.submitted_at)}` : ""}</p> : null}
                    {(p.status === "pending" || p.status === "failed") && canOrder ? <Button size="sm" className="mt-2 w-full" variant="secondary" onClick={() => setProofFor(p)}><Upload /> I've paid — submit reference</Button> : null}
                    {p.status === "submitted" ? <p className="mt-1 text-xs text-muted-foreground">We'll confirm within one business day.</p> : null}
                  </div>
                ))}
                {bank.data?.length && o.payment_status !== "paid" ? (
                  <div className="rounded-xl bg-surface p-3 text-xs">
                    <p className="mb-1 font-semibold">Wire details</p>
                    {bank.data.map((b) => <dl key={b.account_number} className="space-y-0.5 text-muted-foreground"><div><b className="text-foreground">{b.bank_name}</b> · {b.account_name}</div><div>Acc {b.account_number}{b.iban ? ` · IBAN ${b.iban}` : ""}</div><div>SWIFT {b.swift} · {b.currency}</div></dl>)}
                    <p className="mt-1.5">Use <span className="font-mono font-semibold text-foreground">{o.number}</span> as the payment reference.</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-4 text-brand-500" /> Delivery</CardTitle></CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1">
              <Address title="Ship to" a={o.shipping_address} />
              <Address title="Bill to" a={o.billing_address} />
              {o.customer_notes ? <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your notes</p><p className="mt-1 whitespace-pre-wrap text-muted-foreground">{o.customer_notes}</p></div> : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <CancelDialog open={cancelOpen} onOpenChange={setCancelOpen} id={id} onDone={() => { refresh(); router.refresh(); }} />
      <ProofDialog payment={proofFor} onOpenChange={(open) => !open && setProofFor(null)} onDone={refresh} />
      <span className="hidden">{company?.name}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl bg-surface p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-0.5 font-medium">{value}</p></div>;
}
function Row({ l, v, accent, strong }: { l: string; v: string; accent?: boolean; strong?: boolean }) {
  return <div className="flex justify-between"><dt className="text-muted-foreground">{l}</dt><dd className={`tabular-nums ${accent ? "text-emerald-600" : ""} ${strong ? "font-semibold" : ""}`}>{v}</dd></div>;
}
function Address({ title, a }: { title: string; a: { contact_name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string; contact_phone?: string } }) {
  if (!a?.line1) return null;
  return <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p><p className="mt-1 text-muted-foreground"><span className="font-medium text-foreground">{a.contact_name}</span><br />{a.line1}{a.line2 ? <>, {a.line2}</> : null}<br />{a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}<br />{a.country}{a.contact_phone ? <><br />{a.contact_phone}</> : null}</p></div>;
}

function CancelDialog({ open, onOpenChange, id, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; id: string; onDone: () => void }) {
  const [reason, setReason] = useState("");
  const cancel = useMutation({ mutationFn: () => ordersService.cancel(id, reason), onSuccess: () => { notify.info("Order cancelled", "Any reserved credit has been released."); onOpenChange(false); onDone(); }, onError: (e) => notify.error(e, "Couldn't cancel") });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Cancel this order?</DialogTitle><DialogDescription>Orders can be cancelled online until production starts. This can't be undone.</DialogDescription></DialogHeader>
        <div><Label htmlFor="reason">Reason (optional)</Label><Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <DialogFooter><Button variant="ghost" onClick={() => onOpenChange(false)}>Keep order</Button><Button variant="destructive" onClick={() => cancel.mutate()} loading={cancel.isPending}>Cancel order</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProofDialog({ payment, onOpenChange, onDone }: { payment: Payment | null; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const submit = useMutation({ mutationFn: () => ordersService.submitProof(payment!.id, { reference, note, proof: file }), onSuccess: () => { notify.success("Payment reference submitted", "Finance will confirm it shortly and production will be scheduled."); onOpenChange(false); onDone(); setReference(""); setNote(""); setFile(null); }, onError: (e) => notify.error(e, "Couldn't submit") });
  return (
    <Dialog open={!!payment} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Submit payment details</DialogTitle><DialogDescription>{payment ? `${payment.kind} of ${formatMoney(payment.amount, payment.currency)}` : ""}. Attach a transfer receipt to speed up confirmation.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}>
          <div><Label htmlFor="ref">Bank reference / transaction id</Label><Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} required /></div>
          <div><Label htmlFor="proof">Receipt (PDF or image, optional)</Label><Input id="proof" type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div><Label htmlFor="pnote">Note</Label><Textarea id="pnote" value={note} onChange={(e) => setNote(e.target.value)} rows={2} /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={submit.isPending} disabled={!reference.trim()}>Submit</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
