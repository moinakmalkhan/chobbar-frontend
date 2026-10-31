"use client";

import { ArrowLeft, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ChatThread } from "@/components/chat/chat-thread";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useChatUnread, useConversations, useStartConversation } from "@/hooks/use-chat";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

/** Floating chat launcher: list of conversations → live thread. Lazy-loaded. */
export function ChatWidget() {
  const { isAuthenticated, hydrated } = useAuth();
  const open = useUIStore((s) => s.chatOpen);
  const activeId = useUIStore((s) => s.activeConversationId);
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  const { data: unread } = useChatUnread();
  const { data: conversations } = useConversations({ page: 1 });
  const start = useStartConversation();
  const [draft, setDraft] = useState("");

  if (!hydrated) return null;
  const active = conversations?.results.find((c) => c.id === activeId);

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <div className="flex h-[70dvh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 border-b border-border bg-ink-900 px-4 py-3 text-white">
            {active ? (
              <button type="button" onClick={() => setChatOpen(true, null)} className="rounded-lg p-1 hover:bg-white/10" aria-label="Back"><ArrowLeft className="size-4" /></button>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{active ? active.subject : "Chat with Leepa Sports"}</p>
              <p className="truncate text-xs text-ink-300">{active ? (active.assigned_to ? `with ${active.assigned_to}` : "Sales team") : "Typically replies within a few hours"}</p>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} className="rounded-lg p-1 hover:bg-white/10" aria-label="Close chat"><X className="size-4" /></button>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="size-8 text-brand-500" />
              <p className="text-sm text-muted-foreground">Sign in to chat with our sales team about pricing, artwork and orders.</p>
              <Button asChild size="sm" onClick={() => setChatOpen(false)}><Link href="/login">Sign in</Link></Button>
            </div>
          ) : active ? (
            <ChatThread conversationId={active.id} closed={active.status === "closed"} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto">
                {conversations?.results.length ? (
                  <ul className="divide-y divide-border">
                    {conversations.results.map((c) => (
                      <li key={c.id}>
                        <button type="button" onClick={() => setChatOpen(true, c.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted">
                          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", c.unread_count ? "bg-brand-500" : "bg-transparent")} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-semibold">{c.subject}</span>
                              <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(c.last_message_at)}</span>
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{c.last_message_preview || "No messages yet"}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-6 text-center text-sm text-muted-foreground">No conversations yet. Ask us anything about fabrics, sizing, artwork or lead times.</p>
                )}
              </div>
              <form
                className="border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!draft.trim()) return;
                  start.mutate({ body: draft.trim() }, { onSuccess: (c) => { setDraft(""); setChatOpen(true, c.id); } });
                }}
              >
                <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Start a new conversation…" className="min-h-[64px]" />
                <Button type="submit" size="sm" className="mt-2 w-full" loading={start.isPending} disabled={!draft.trim()}>Send to sales team</Button>
              </form>
            </div>
          )}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setChatOpen(!open)}
        className="relative flex h-13 items-center gap-2 rounded-full bg-ink-900 px-4 text-sm font-semibold text-white shadow-lg shadow-ink-900/30 transition-transform hover:scale-[1.03] active:scale-95 dark:bg-brand-500"
        aria-label="Open chat"
      >
        <MessageCircle className="size-5" />
        <span className="hidden sm:inline">Chat with sales</span>
        {unread ? <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white dark:bg-white dark:text-ink-900">{unread}</span> : null}
      </button>
    </div>
  );
}
