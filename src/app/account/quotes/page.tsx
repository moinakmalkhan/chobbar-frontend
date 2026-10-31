"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { quotesService } from "@/services/quotes";

export default function QuotesPage() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: queryKeys.quotes({ page }), queryFn: () => quotesService.list({ page }), placeholderData: keepPreviousData });
  const data = query.data;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Quotes</p><h1 className="font-display text-3xl font-bold">Quote requests</h1><p className="text-sm text-muted-foreground">Negotiated pricing from our sales team. Accepted quotes become orders instantly.</p></div><Button asChild><Link href="/cart?quote=1">Request a quote</Link></Button></div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        {query.isLoading ? <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div> : !data?.results.length ? <EmptyState icon={ClipboardList} title="No quotes yet" description="Configure products in the cart, then choose “Request a quote” for volume or custom pricing." className="border-0" /> : (
          <ul className="divide-y divide-border">
            {data.results.map((q) => (
              <li key={q.id}><Link href={`/account/quotes/${q.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm hover:bg-muted/40"><span><span className="font-mono font-semibold">{q.number}</span><span className="block text-xs text-muted-foreground">{formatDate(q.created_at)} · {q.total_quantity} pcs · {q.item_count} line{q.item_count === 1 ? "" : "s"}{q.valid_until ? ` · valid until ${formatDate(q.valid_until)}` : ""}</span></span><span className="flex items-center gap-3"><StatusBadge status={q.status} label={q.status_display} /><span className="text-right"><span className="block font-semibold tabular-nums">{formatMoney(q.quoted_total ?? q.requested_total, q.currency)}</span>{q.quoted_total != null && Number(q.quoted_total) < Number(q.requested_total) ? <span className="text-xs text-emerald-600">saves {formatMoney(Number(q.requested_total) - Number(q.quoted_total), q.currency)}</span> : <span className="text-xs text-muted-foreground">{q.quoted_total == null ? "list price" : "quoted"}</span>}</span></span></Link></li>
            ))}
          </ul>
        )}
      </div>
      {data ? <Pagination className="mt-5" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={setPage} /> : null}
    </div>
  );
}
