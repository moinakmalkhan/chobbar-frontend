"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, MessageSquare, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useStartConversation } from "@/hooks/use-chat";
import { formatDate, formatDateTime, formatMoney, GENDER_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import { quotesService } from "@/services/quotes";
import { useUIStore } from "@/stores/ui-store";
import type { PaymentMethod } from "@/types/api";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canOrder, company } = useAuth();
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  const start = useStartConversation();
  const quote = useQuery({ queryKey: queryKeys.quote(id), queryFn: () => quotesService.get(id) });
  const [acceptOpen, setAcceptOpen] = useState(false);
  const decline = useMutation({ mutationFn: () => quotesService.decline(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.quote(id) }); queryClient.invalidateQueries({ queryKey: ["quotes"] }); notify.info("Quote declined"); }, onError: (e) => notify.error(e) });

  if (quote.isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-64" /></div>;
  if (!quote.data) return <p className="text-sm text-muted-foreground">Quote not found.</p>;
  const q = quote.data;
  const expired = q.valid_until ? new Date(q.valid_until) < new Date(new Date().toDateString()) : false;
  const canAccept = q.status === "quoted" && !expired && canOrder;

  return (
    <div className="space-y-6">
      <Link href="/account/quotes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> All quotes</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Quote</p><h1 className="font-mono text-3xl font-bold">{q.number}</h1><p className="mt-1 text-sm text-muted-foreground">Requested {formatDateTime(q.created_at)} by {q.requested_by} · {q.total_quantity} pcs</p><div className="mt-2 flex gap-2"><StatusBadge status={expired && q.status === "quoted" ? "expired" : q.status} label={expired && q.status === "quoted" ? "Expired" : q.status_display} />{q.valid_until && q.status === "quoted" ? <span className="rounded-full border border-border px-2.5 py-0.5 text-xs">Valid until {formatDate(q.valid_until)}</span> : null}</div></div>
        <div className="flex flex-wrap gap-2">
          {canAccept ? <Button onClick={() => setAcceptOpen(true)}><CheckCircle2 /> Accept & order</Button> : null}
          {["submitted", "under_review", "quoted"].includes(q.status) && canOrder ? <Button variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => decline.mutate()} loading={decline.isPending}><XCircle /> Decline</Button> : null}
          <Button variant="outline" onClick={() => start.mutate({ body: `Hi, about quote ${q.number}…`, quote: q.id }, { onSuccess: (c) => setChatOpen(true, c.id) })} loading={start.isPending}><MessageSquare /> Discuss</Button>
          {q.orders.length ? <Button variant="outline" asChild><Link href={`/account/orders/${q.orders[0]}`}>View order</Link></Button> : null}
        </div>
      </div>

      {q.status === "quoted" && q.response_message ? <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 text-sm dark:border-brand-500/30 dark:bg-brand-500/10"><p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Message from {q.handled_by || "sales"}</p><p className="mt-1 whitespace-pre-wrap">{q.response_message}</p></div> : null}
      {["submitted", "under_review"].includes(q.status) ? <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">Our team is pricing this request. You'll get an email and a notification as soon as the quote is ready — usually within one business day.</p> : null}

      <Card>
        <CardHeader><CardTitle>Lines</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-2">Item</th><th className="px-4 py-2">Sizes</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-right">List</th><th className="px-4 py-2 text-right">Quoted</th><th className="px-4 py-2 text-right">Total</th></tr></thead>
            <tbody className="divide-y divide-border">
              {q.items.map((i) => (
                <tr key={i.id}><td className="px-4 py-3"><p className="font-semibold">{i.product_name}</p><p className="text-xs text-muted-foreground">{i.sku} · {i.fabric_name}{i.color ? ` · ${i.color}` : ""}</p></td><td className="px-4 py-3 text-xs text-muted-foreground">{i.breakdown.map((l) => `${GENDER_LABELS[l.gender]?.[0]} ${l.size}×${l.quantity}`).join(", ")}</td><td className="px-4 py-3 text-right tabular-nums">{i.quantity}</td><td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{formatMoney(i.requested_unit_price, q.currency)}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{i.quoted_unit_price != null ? formatMoney(i.quoted_unit_price, q.currency) : "—"}</td><td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(i.line_total, q.currency)}</td></tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2 border-border font-bold"><td colSpan={5} className="px-4 py-3 text-right">{q.quoted_total != null ? "Quoted total" : "List total"}</td><td className="px-4 py-3 text-right tabular-nums">{formatMoney(q.quoted_total ?? q.requested_total, q.currency)}</td></tr></tfoot>
          </table>
        </CardContent>
      </Card>

      {q.customer_notes || q.target_budget || q.delivery_deadline ? (
        <Card><CardHeader><CardTitle>Your request</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm sm:grid-cols-3">{q.target_budget ? <div><p className="text-xs text-muted-foreground">Target / piece</p><p className="font-medium">{formatMoney(q.target_budget, q.currency)}</p></div> : null}{q.delivery_deadline ? <div><p className="text-xs text-muted-foreground">Needed by</p><p className="font-medium">{formatDate(q.delivery_deadline)}</p></div> : null}{q.customer_notes ? <div className="sm:col-span-3"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-wrap">{q.customer_notes}</p></div> : null}</CardContent></Card>
      ) : null}

      <AcceptDialog open={acceptOpen} onOpenChange={setAcceptOpen} quoteId={id} currency={q.currency} total={Number(q.quoted_total ?? 0)} netAllowed={Boolean(company?.is_verified && company.payment_terms.startsWith("net_"))} onDone={(orderId) => router.push(`/account/orders/${orderId}?placed=1`)} />
    </div>
  );
}

function AcceptDialog({ open, onOpenChange, quoteId, currency, total, netAllowed, onDone }: { open: boolean; onOpenChange: (o: boolean) => void; quoteId: string; currency: string; total: number; netAllowed: boolean; onDone: (orderId: string) => void }) {
  const queryClient = useQueryClient();
  const addresses = useQuery({ queryKey: queryKeys.addresses, queryFn: accountsService.addresses, enabled: open });
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("bank_transfer");
  const [po, setPo] = useState("");
  const accept = useMutation({
    mutationFn: () => quotesService.accept(quoteId, { shipping_address: address || addresses.data?.[0]?.id || "", payment_method: payment, po_number: po }),
    onSuccess: (order) => { queryClient.invalidateQueries({ queryKey: ["quotes"] }); queryClient.invalidateQueries({ queryKey: ["orders"] }); notify.success(`Order ${order.number} created from quote`); onOpenChange(false); onDone(order.id); },
    onError: (e) => notify.error(e, "Couldn't accept quote"),
  });
  const selected = address || addresses.data?.find((a) => a.is_default)?.id || addresses.data?.[0]?.id || "";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Accept quote · {formatMoney(total, currency)}</DialogTitle><DialogDescription>This creates an order at the quoted prices. Freight is confirmed with your invoice.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); accept.mutate(); }}>
          <div><Label>Ship to</Label>{addresses.data?.length ? <Select value={selected} onValueChange={setAddress}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{addresses.data.map((a) => <SelectItem key={a.id} value={a.id}>{a.label || a.line1}, {a.city}</SelectItem>)}</SelectContent></Select> : <p className="text-sm text-muted-foreground">Add an address under <Link href="/account/addresses" className="underline">Addresses</Link> first.</p>}</div>
          <div><Label>Payment</Label><Select value={payment} onValueChange={(v) => setPayment(v as PaymentMethod)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bank_transfer">Bank transfer</SelectItem><SelectItem value="net_terms" disabled={!netAllowed}>Net terms {netAllowed ? "" : "(not enabled)"}</SelectItem></SelectContent></Select></div>
          <div><Label htmlFor="po">PO number (optional)</Label><Input id="po" value={po} onChange={(e) => setPo(e.target.value)} /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={accept.isPending} disabled={!selected}>Accept & place order</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
