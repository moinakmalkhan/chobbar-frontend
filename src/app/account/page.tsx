"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ClipboardList, Package, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/catalog/product-grid";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatMoney, ORDER_STATUS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { ordersService } from "@/services/orders";
import { quotesService } from "@/services/quotes";
import { searchService } from "@/services/search";

export default function AccountOverview() {
  const { user, company, canOrder } = useAuth();
  const summary = useQuery({ queryKey: queryKeys.ordersSummary, queryFn: ordersService.summary, enabled: !!company });
  const orders = useQuery({ queryKey: queryKeys.orders({ page: 1, page_size: 5 }), queryFn: () => ordersService.list({ page: 1, page_size: 5 }), enabled: !!company });
  const quotes = useQuery({ queryKey: queryKeys.quotes({ page: 1 }), queryFn: () => quotesService.list({ page: 1 }), enabled: !!company });
  const reco = useQuery({ queryKey: queryKeys.recommendations(), queryFn: () => searchService.recommendations(), enabled: !!company, staleTime: 5 * 60_000 });
  const currency = company?.currency ?? "USD";

  if (!company) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <h1 className="font-display text-2xl font-bold">Welcome, {user?.first_name}</h1>
        <p className="mt-2 text-muted-foreground">Create your company to unlock ordering, quotes and team access.</p>
        <Button className="mt-5" asChild><Link href="/account/company">Create company</Link></Button>
      </div>
    );
  }
  const s = summary.data;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Overview</p><h1 className="font-display text-3xl font-bold">Hi {user?.first_name || "there"} 👋</h1><p className="text-sm text-muted-foreground">{company.name} · {company.customer_group ?? "Standard pricing"}</p></div>
        {canOrder ? <div className="flex gap-2"><Button variant="outline" asChild><Link href="/quick-order">Quick order</Link></Button><Button asChild><Link href="/products">New order <ArrowRight /></Link></Button></div> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Package} label="Open orders" value={s ? String(s.open) : undefined} hint={s ? `${s.in_production} in production · ${s.shipped} shipped` : ""} href="/account/orders?open=true" />
        <Stat icon={ShieldCheck} label="Awaiting approval" value={s ? String(s.pending_approval) : undefined} hint="Needs an admin" href="/account/orders?status=pending_approval" tone={s?.pending_approval ? "warning" : undefined} />
        <Stat icon={Wallet} label="Outstanding balance" value={s ? formatMoney(s.outstanding, currency) : undefined} hint={`${s?.awaiting_payment ?? 0} awaiting payment`} href="/account/orders?status=pending_payment" />
        <Stat icon={ClipboardList} label="Lifetime spend" value={s ? formatMoney(s.spent, currency, { compact: true }) : undefined} hint={`${s?.total ?? 0} orders total`} href="/account/orders" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>Recent orders</CardTitle><Link href="/account/orders" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link></CardHeader>
          <CardContent className="pt-0">
            {orders.isLoading ? <Skeleton className="h-32" /> : orders.data?.results.length ? (
              <ul className="divide-y divide-border">
                {orders.data.results.map((o) => (
                  <li key={o.id}><Link href={`/account/orders/${o.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-brand-600"><span><span className="font-mono font-semibold">{o.number}</span><span className="block text-xs text-muted-foreground">{formatDate(o.created_at)} · {o.total_quantity} pcs{o.po_number ? ` · PO ${o.po_number}` : ""}</span></span><span className="flex items-center gap-3"><StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} /><span className="font-semibold tabular-nums">{formatMoney(o.grand_total, o.currency)}</span></span></Link></li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-sm text-muted-foreground">No orders yet. Your first configured kit will show up here.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>Quotes</CardTitle><Link href="/account/quotes" className="text-xs font-semibold text-brand-600 hover:underline">View all</Link></CardHeader>
          <CardContent className="pt-0">
            {quotes.isLoading ? <Skeleton className="h-32" /> : quotes.data?.results.length ? (
              <ul className="divide-y divide-border">
                {quotes.data.results.slice(0, 5).map((q) => (
                  <li key={q.id}><Link href={`/account/quotes/${q.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-brand-600"><span><span className="font-mono font-semibold">{q.number}</span><span className="block text-xs text-muted-foreground">{q.total_quantity} pcs · {q.valid_until ? `valid until ${formatDate(q.valid_until)}` : formatDate(q.created_at)}</span></span><span className="flex items-center gap-3"><StatusBadge status={q.status} label={q.status_display} /><span className="font-semibold tabular-nums">{formatMoney(q.quoted_total ?? q.requested_total, q.currency)}</span></span></Link></li>
                ))}
              </ul>
            ) : <p className="py-6 text-center text-sm text-muted-foreground">No quote requests yet. Configure a cart and ask sales for a negotiated price.</p>}
          </CardContent>
        </Card>
      </div>

      {reco.data?.length ? <section><h2 className="mb-4 font-display text-xl font-bold">Recommended for {company.name}</h2><ProductGrid products={reco.data.slice(0, 4)} /></section> : null}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint, href, tone }: { icon: typeof Package; label: string; value?: string; hint: string; href: string; tone?: "warning" }) {
  return (
    <Link href={href} className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-brand-300">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><Icon className="size-4 text-muted-foreground" /></div>
      {value === undefined ? <Skeleton className="mt-2 h-7 w-20" /> : <p className={`mt-1 font-display text-2xl font-bold ${tone === "warning" ? "text-brand-600" : ""}`}>{value}</p>}
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
