"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Package, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { formatDate, formatMoney, ORDER_STATUS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { ordersService } from "@/services/orders";
import { cn } from "@/lib/utils";

const TABS = [["", "All"], ["open", "Open"], ["pending_approval", "Approval"], ["pending_payment", "Payment"], ["in_production", "Production"], ["shipped", "Shipped"], ["completed", "Completed"], ["cancelled", "Cancelled"]] as const;

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}

function OrdersList() {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Number(sp.get("page") ?? 1);
  const tab = sp.get("open") === "true" ? "open" : (sp.get("status") ?? "");
  const [search, setSearch] = useState(sp.get("q") ?? "");
  const q = useDebouncedValue(search.trim(), 350);
  const params = { page, page_size: 15, q: q || undefined, open: tab === "open" ? true : undefined, status: tab && tab !== "open" ? (tab === "in_production" ? ["in_production", "quality_check"] : [tab]) : undefined };
  const query = useQuery({ queryKey: queryKeys.orders(params), queryFn: () => ordersService.list(params), placeholderData: keepPreviousData });
  const setParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(updates).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    router.replace(`/account/orders?${next.toString()}`, { scroll: false });
  };
  const data = query.data;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Orders</p><h1 className="font-display text-3xl font-bold">Order history</h1></div><Button asChild><Link href="/products">New order</Link></Button></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          {TABS.map(([value, label]) => <button key={value} type="button" onClick={() => setParam({ status: value && value !== "open" ? value : null, open: value === "open" ? "true" : null, page: null })} className={cn("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors", tab === value ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "bg-muted text-muted-foreground hover:text-foreground")}>{label}</button>)}
        </div>
        <div className="relative sm:w-64"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order #, PO, product…" className="h-10 pl-9" aria-label="Search orders" /></div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        {query.isLoading ? <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div> : !data?.results.length ? (
          <EmptyState icon={Package} title={q ? `No orders match “${q}”` : "No orders in this view"} description="Orders you place will appear here with live production status." className="border-0" />
        ) : (
          <table className="w-full text-sm">
            <thead className="hidden bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground md:table-header-group"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Ship by</th><th className="px-4 py-3 text-right">Total</th></tr></thead>
            <tbody className={cn("divide-y divide-border", query.isFetching && "opacity-60")}>
              {data.results.map((o) => (
                <tr key={o.id} className="group cursor-pointer hover:bg-muted/40" onClick={() => router.push(`/account/orders/${o.id}`)}>
                  <td className="px-4 py-3"><Link href={`/account/orders/${o.id}`} className="font-mono font-semibold group-hover:text-brand-600">{o.number}</Link><p className="text-xs text-muted-foreground">{formatDate(o.created_at)} · {o.total_quantity} pcs · {o.item_count} line{o.item_count === 1 ? "" : "s"}{o.po_number ? ` · PO ${o.po_number}` : ""}</p><div className="mt-1 flex gap-2 md:hidden"><StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} /><StatusBadge status={o.payment_status} /></div></td>
                  <td className="hidden px-4 py-3 md:table-cell"><StatusBadge status={o.status} label={ORDER_STATUS_LABELS[o.status]} /></td>
                  <td className="hidden px-4 py-3 md:table-cell"><StatusBadge status={o.payment_status} />{Number(o.balance_due) > 0 && o.status !== "cancelled" ? <p className="mt-1 text-xs text-muted-foreground">{formatMoney(o.balance_due, o.currency)} due</p> : null}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{o.tracking_number ? <span className="font-mono text-xs">{o.tracking_number}</span> : formatDate(o.estimated_ship_date)}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(o.grand_total, o.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data ? <Pagination className="mt-5" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={(p) => setParam({ page: String(p) })} /> : null}
    </div>
  );
}
