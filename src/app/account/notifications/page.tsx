"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationMutations, useNotificationsFeed } from "@/hooks/use-notifications";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const LEVEL_DOT: Record<string, string> = { info: "bg-sky-500", success: "bg-emerald-500", warning: "bg-amber-500", error: "bg-red-500" };

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const feed = useNotificationsFeed(unreadOnly);
  const { markRead, markAllRead, clearRead } = useNotificationMutations();
  const items = feed.data?.pages.flatMap((p) => p.results) ?? [];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Notifications</p><h1 className="font-display text-3xl font-bold">Activity</h1></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}><CheckCheck /> Mark all read</Button><Button variant="ghost" size="sm" onClick={() => clearRead.mutate()} loading={clearRead.isPending}><Trash2 /> Clear read</Button></div></div>
      <div className="mt-5 flex gap-1">{[[false, "All"], [true, "Unread"]].map(([v, l]) => <button key={String(v)} type="button" onClick={() => setUnreadOnly(v as boolean)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", unreadOnly === v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "bg-muted text-muted-foreground hover:text-foreground")}>{l as string}</button>)}</div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {feed.isLoading ? <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div> : !items.length ? <EmptyState icon={Bell} title="You're all caught up" description="Order, quote, payment and message updates will show up here and in realtime toasts." className="border-0" /> : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const inner = (
                <>
                  <span className={cn("mt-2 size-2 shrink-0 rounded-full", n.is_read ? "bg-transparent" : LEVEL_DOT[n.level])} />
                  <span className="min-w-0 flex-1"><span className={cn("block text-sm", n.is_read ? "font-medium" : "font-bold")}>{n.title}</span>{n.body ? <span className="block text-xs text-muted-foreground">{n.body}</span> : null}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.created_at)}</span>
                </>
              );
              const cls = "flex items-start gap-3 px-5 py-3.5 hover:bg-muted/40";
              return (
                <li key={n.id}>
                  {n.url ? <Link href={n.url} className={cls} onClick={() => !n.is_read && markRead.mutate(n.id)}>{inner}</Link> : <button type="button" className={cn(cls, "w-full text-left")} onClick={() => !n.is_read && markRead.mutate(n.id)}>{inner}</button>}
                </li>
              );
            })}
          </ul>
        )}
        {feed.hasNextPage ? <div className="border-t border-border p-3 text-center"><Button variant="ghost" size="sm" onClick={() => feed.fetchNextPage()} loading={feed.isFetchingNextPage}>Load more</Button></div> : null}
      </div>
    </div>
  );
}
