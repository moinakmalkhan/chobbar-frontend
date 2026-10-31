"use client";

import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations, useStartConversation } from "@/hooks/use-chat";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const conversations = useConversations({ page, status: status || undefined });
  const data = conversations.data;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Messages</p><h1 className="font-display text-3xl font-bold">Conversations with Leepa Sports</h1><p className="text-sm text-muted-foreground">Sales, artwork and production questions — all in one place, attached to your orders.</p></div><Button onClick={() => setOpen(true)}><Plus /> New conversation</Button></div>
      <div className="mt-5 flex gap-1">{[["", "All"], ["open", "Open"], ["pending", "Waiting on you"], ["closed", "Closed"]].map(([v, l]) => <button key={v} type="button" onClick={() => { setStatus(v); setPage(1); }} className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium", status === v ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "bg-muted text-muted-foreground hover:text-foreground")}>{l}</button>)}</div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {conversations.isLoading ? <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div> : !data?.results.length ? <EmptyState icon={MessageSquare} title="No conversations" description="Ask about fabrics, sizing, artwork or an order — we usually answer within a few hours." action={<Button onClick={() => setOpen(true)}>Start a conversation</Button>} className="border-0" /> : (
          <ul className="divide-y divide-border">
            {data.results.map((c) => (
              <li key={c.id}><Link href={`/account/messages/${c.id}`} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/40"><span className={cn("mt-2 size-2 shrink-0 rounded-full", c.unread_count ? "bg-brand-500" : "bg-transparent")} /><span className="min-w-0 flex-1"><span className="flex items-center gap-2"><span className={cn("truncate text-sm", c.unread_count ? "font-bold" : "font-semibold")}>{c.subject}</span>{c.order ? <span className="rounded bg-muted px-1.5 text-[10px] font-mono">{c.order.number}</span> : null}{c.quote ? <span className="rounded bg-muted px-1.5 text-[10px] font-mono">{c.quote.number}</span> : null}</span><span className="block truncate text-xs text-muted-foreground">{c.last_message_preview || "No messages yet"}</span></span><span className="flex shrink-0 flex-col items-end gap-1"><StatusBadge status={c.status} label={c.status === "pending" ? "Waiting on you" : c.status} /><span className="text-[11px] text-muted-foreground">{timeAgo(c.last_message_at)}</span></span></Link></li>
            ))}
          </ul>
        )}
      </div>
      {data ? <Pagination className="mt-5" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={setPage} /> : null}
      <NewConversationDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function NewConversationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const start = useStartConversation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New conversation</DialogTitle><DialogDescription>Goes straight to the sales and production team.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); start.mutate({ subject, body }, { onSuccess: () => { onOpenChange(false); setSubject(""); setBody(""); } }); }}>
          <div><Label htmlFor="subject">Subject</Label><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Sponsor logo on away kit" /></div>
          <div><Label htmlFor="body">Message</Label><Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} required /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={start.isPending} disabled={!body.trim()}>Send</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
