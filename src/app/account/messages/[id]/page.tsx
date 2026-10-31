"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ChatThread } from "@/components/chat/chat-thread";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { chatService } from "@/services/chat";

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const conversation = useQuery({ queryKey: queryKeys.conversation(id), queryFn: () => chatService.conversation(id) });
  const close = useMutation({ mutationFn: () => chatService.close(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.conversation(id) }); queryClient.invalidateQueries({ queryKey: queryKeys.conversations }); notify.info("Conversation closed"); }, onError: (e) => notify.error(e) });
  if (conversation.isLoading) return <Skeleton className="h-96" />;
  if (!conversation.data) return <p className="text-sm text-muted-foreground">Conversation not found.</p>;
  const c = conversation.data;
  return (
    <div className="flex h-[calc(100dvh-14rem)] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <Link href="/account/messages" className="rounded-lg p-1.5 hover:bg-muted" aria-label="Back"><ArrowLeft className="size-4" /></Link>
        <div className="min-w-0 flex-1"><h1 className="truncate font-semibold">{c.subject}</h1><p className="truncate text-xs text-muted-foreground">{c.assigned_to ? `Handled by ${c.assigned_to}` : "Sales team"}{c.order ? <> · <Link href={`/account/orders/${c.order.id}`} className="font-mono underline">{c.order.number}</Link></> : null}{c.quote ? <> · <Link href={`/account/quotes/${c.quote.id}`} className="font-mono underline">{c.quote.number}</Link></> : null}</p></div>
        <StatusBadge status={c.status} label={c.status === "pending" ? "Waiting on you" : c.status} />
        {c.status !== "closed" ? <Button variant="ghost" size="sm" onClick={() => close.mutate()} loading={close.isPending}><CheckCheck /> Resolve</Button> : null}
      </div>
      <ChatThread conversationId={c.id} closed={c.status === "closed"} />
    </div>
  );
}
