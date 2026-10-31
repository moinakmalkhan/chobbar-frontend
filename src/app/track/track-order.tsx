"use client";

import { useQuery } from "@tanstack/react-query";
import { PackageSearch, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { OrderTimeline } from "@/components/account/order-timeline";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { ordersService } from "@/services/orders";

export function TrackOrder() {
  const sp = useSearchParams();
  const [number, setNumber] = useState(sp.get("number") ?? "");
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [query, setQuery] = useState<{ number: string; email: string } | null>(sp.get("number") && sp.get("email") ? { number: sp.get("number")!, email: sp.get("email")! } : null);
  const tracking = useQuery({ queryKey: queryKeys.tracking(query?.number ?? "", query?.email ?? ""), queryFn: () => ordersService.track(query!.number, query!.email), enabled: !!query, retry: false });

  return (
    <div className="container-x max-w-3xl py-10 lg:py-16">
      <div className="text-center"><PackageSearch className="mx-auto size-10 text-brand-500" /><h1 className="mt-3 font-display text-3xl font-bold">Track your order</h1><p className="mt-2 text-muted-foreground">Enter the order number from your confirmation email. No sign-in needed.</p></div>
      <form className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={(e) => { e.preventDefault(); setQuery({ number: number.trim().toUpperCase(), email: email.trim() }); }}>
        <div><Label htmlFor="number">Order number</Label><Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="LS-260531-AB12CD" className="font-mono uppercase" required /></div>
        <div><Label htmlFor="email">Email on the order</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@club.com" required /></div>
        <Button type="submit" loading={tracking.isFetching}><Search /> Track</Button>
      </form>
      {tracking.isError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{toApiError(tracking.error).detail}</p> : null}
      {tracking.data ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Order</p><p className="font-mono text-lg font-bold">{tracking.data.number}</p><p className="text-sm text-muted-foreground">{tracking.data.total_quantity} pieces → {tracking.data.ship_to.city}, {tracking.data.ship_to.country}</p></div>
            <div className="text-right text-sm"><p className="font-semibold">{tracking.data.status_display}</p><p className="text-muted-foreground">{tracking.data.shipped_at ? `Shipped ${formatDate(tracking.data.shipped_at)}` : tracking.data.estimated_ship_date ? `Est. ship ${formatDate(tracking.data.estimated_ship_date)}` : ""}</p></div>
          </div>
          <div className="mt-6"><OrderTimeline steps={tracking.data.steps} history={tracking.data.timeline.map((t) => ({ to_status: t.status, note: t.note, created_at: t.at, from_status: "", changed_by: "" }))} status={tracking.data.status} /></div>
          {tracking.data.tracking_number ? (
            <div className="mt-6 rounded-xl bg-surface p-4 text-sm"><p className="font-semibold">{tracking.data.carrier || "Carrier"} · <span className="font-mono">{tracking.data.tracking_number}</span></p>{tracking.data.tracking_url ? <a href={tracking.data.tracking_url} target="_blank" rel="noreferrer" className="text-brand-600 underline">Open carrier tracking ↗</a> : null}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
