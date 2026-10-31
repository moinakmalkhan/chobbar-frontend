"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { LogoMark } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney, GENDER_LABELS, PAYMENT_TERMS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { ordersService } from "@/services/orders";

/** Printable invoice / pro-forma. Opens in a new tab; Ctrl+P → PDF. */
export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { data: inv, isLoading } = useQuery({ queryKey: queryKeys.invoice(id), queryFn: () => ordersService.invoice(id) });
  useEffect(() => {
    if (inv) document.title = `${inv.document_type} ${inv.number} — Leepa Sports`;
  }, [inv]);
  if (isLoading || !inv) return <div className="mx-auto max-w-3xl p-10"><Skeleton className="h-96" /></div>;
  const a = inv.billing_address;
  return (
    <div className="min-h-screen bg-white text-ink-900">
      <div className="no-print sticky top-0 flex items-center justify-between border-b bg-ink-50 px-6 py-3 text-sm"><span>Preview — use your browser's print dialog to save as PDF.</span><button type="button" onClick={() => window.print()} className="rounded-lg bg-ink-900 px-4 py-2 font-semibold text-white">Print / Save PDF</button></div>
      <div className="mx-auto max-w-3xl p-8 sm:p-12">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-3"><LogoMark className="size-10" /><div><p className="font-display text-xl font-extrabold">LEEPA<span className="text-brand-500">SPORTS</span></p><p className="text-xs text-ink-500">{inv.seller.address}<br />{inv.seller.email}</p></div></div>
          <div className="text-right"><p className="font-display text-2xl font-bold uppercase tracking-tight">{inv.document_type}</p><p className="font-mono text-sm">{inv.number}</p><p className="text-xs text-ink-500">Issued {formatDate(inv.created_at)}{inv.due_date ? ` · Due ${formatDate(inv.due_date)}` : ""}</p></div>
        </header>
        <section className="mt-10 grid grid-cols-2 gap-8 text-sm">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Bill to</p><p className="mt-1 font-semibold">{inv.company}</p><p className="text-ink-600">{a.contact_name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}<br />{a.country}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Details</p><dl className="mt-1 space-y-0.5 text-ink-600"><div className="flex justify-between"><dt>PO number</dt><dd className="font-medium text-ink-900">{inv.po_number || "—"}</dd></div><div className="flex justify-between"><dt>Payment</dt><dd className="font-medium text-ink-900">{inv.payment_method === "net_terms" ? PAYMENT_TERMS_LABELS[inv.payment_terms] : "Bank transfer"}</dd></div><div className="flex justify-between"><dt>Incoterm</dt><dd className="font-medium text-ink-900">EXW Sialkot</dd></div><div className="flex justify-between"><dt>Currency</dt><dd className="font-medium text-ink-900">{inv.currency}</dd></div></dl></div>
        </section>
        <table className="mt-10 w-full text-sm">
          <thead><tr className="border-b-2 border-ink-900 text-left text-xs uppercase tracking-wide"><th className="py-2">Item</th><th className="py-2">Sizes</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Unit</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {inv.items.map((i) => (
              <tr key={i.id} className="border-b border-ink-200 align-top"><td className="py-3"><p className="font-semibold">{i.product_name}</p><p className="text-xs text-ink-500">{i.sku} · {i.fabric_name}{i.color ? ` · ${i.color}` : ""}</p></td><td className="py-3 text-xs text-ink-600">{i.breakdown.map((l) => `${GENDER_LABELS[l.gender]?.[0]} ${l.size}×${l.quantity}`).join(", ")}</td><td className="py-3 text-right tabular-nums">{i.quantity}</td><td className="py-3 text-right tabular-nums">{formatMoney(i.unit_price, inv.currency)}</td><td className="py-3 text-right tabular-nums">{formatMoney(i.line_total, inv.currency)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 ml-auto w-72 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-ink-500">Subtotal</span><span className="tabular-nums">{formatMoney(inv.subtotal, inv.currency)}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Freight (est.)</span><span className="tabular-nums">{formatMoney(inv.shipping_total, inv.currency)}</span></div>
          {Number(inv.tax_total) ? <div className="flex justify-between"><span className="text-ink-500">Tax</span><span className="tabular-nums">{formatMoney(inv.tax_total, inv.currency)}</span></div> : null}
          <div className="flex justify-between border-t-2 border-ink-900 pt-2 text-base font-bold"><span>Total</span><span className="tabular-nums">{formatMoney(inv.grand_total, inv.currency)}</span></div>
          <div className="flex justify-between text-ink-500"><span>Paid</span><span className="tabular-nums">{formatMoney(inv.amount_paid, inv.currency)}</span></div>
          <div className="flex justify-between font-semibold"><span>Balance due</span><span className="tabular-nums">{formatMoney(inv.balance_due, inv.currency)}</span></div>
        </div>
        {inv.bank_accounts.length && Number(inv.balance_due) > 0 ? (
          <section className="mt-10 rounded-xl border border-ink-200 p-4 text-sm"><p className="font-semibold">Payment instructions</p>{inv.bank_accounts.map((b) => <p key={b.account_number} className="mt-1 text-ink-600">{b.bank_name} · {b.account_name} · Acc {b.account_number}{b.iban ? ` · IBAN ${b.iban}` : ""} · SWIFT {b.swift} ({b.currency})</p>)}<p className="mt-2 text-xs text-ink-500">Quote <span className="font-mono font-semibold text-ink-900">{inv.number}</span> as the payment reference. Bank charges are borne by the sender.</p></section>
        ) : null}
        <footer className="mt-12 text-xs text-ink-500">Goods are made to order to the confirmed specification. Prices ex-works Sialkot; duties, taxes and final freight are borne by the buyer. Thank you for your business.</footer>
      </div>
    </div>
  );
}
