"use client";

import { Paperclip, SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useConversationThread } from "@/hooks/use-chat";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ChatThread({ conversationId, className, closed = false }: { conversationId: string; className?: string; closed?: boolean }) {
  const { user } = useAuth();
  const { messages, history, send, sendTyping, markRead, typing, connected } = useConversationThread(conversationId);
  const [draft, setDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const typingSent = useRef(false);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);
  useEffect(() => {
    if (messages.length) markRead();
  }, [messages.length, markRead]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const body = draft.trim();
    if (!body && !file) return;
    send(body, file);
    setDraft("");
    setFile(null);
    typingSent.current = false;
    sendTyping(false);
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {history.hasNextPage ? (
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={() => history.fetchNextPage()} loading={history.isFetchingNextPage}>Load earlier messages</Button>
          </div>
        ) : null}
        {history.isLoading ? <>{[0, 1, 2].map((i) => <Skeleton key={i} className={cn("h-12 w-2/3", i % 2 && "ml-auto")} />)}</> : null}
        {messages.map((m) => {
          const mine = m.sender?.id === user?.id;
          if (m.kind === "system") return <p key={m.id} className="text-center text-xs text-muted-foreground">{m.body}</p>;
          return (
            <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
              {!mine ? <Avatar src={m.sender?.avatar_url} name={m.sender?.name ?? "Leepa"} className="size-7" /> : null}
              <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs", mine ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-muted", m.pending && "opacity-60")}>
                {!mine && m.sender ? <p className="mb-0.5 text-[11px] font-semibold opacity-80">{m.sender.name}{m.sender.is_staff ? " · Leepa Sports" : ""}</p> : null}
                {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}
                {m.attachment ? <a href={m.attachment} target="_blank" rel="noreferrer" className={cn("mt-1 inline-flex items-center gap-1 text-xs underline", mine ? "text-white" : "text-brand-600")}><Paperclip className="size-3" /> {m.attachment_name || "Attachment"}</a> : m.attachment_name && m.pending ? <p className="text-xs italic">Uploading {m.attachment_name}…</p> : null}
                <p className={cn("mt-1 text-[10px]", mine ? "text-white/70" : "text-muted-foreground")}>{m.pending ? "Sending…" : formatDateTime(m.created_at)}</p>
              </div>
            </div>
          );
        })}
        {typing ? <p className="text-xs text-muted-foreground">{typing} is typing…</p> : null}
        <div ref={bottom} />
      </div>
      {closed ? (
        <p className="border-t border-border p-3 text-center text-xs text-muted-foreground">This conversation is closed. Start a new one if you need more help.</p>
      ) : (
        <form onSubmit={submit} className="border-t border-border p-3">
          {file ? <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground"><Paperclip className="size-3" /> {file.name} <button type="button" className="ml-1 underline" onClick={() => setFile(null)}>remove</button></p> : null}
          <div className="flex items-end gap-2">
            <label className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-muted" aria-label="Attach file">
              <Paperclip className="size-4" />
              <input type="file" className="hidden" accept="image/*,.pdf,.ai,.eps,.svg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
            <textarea
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (!typingSent.current) { sendTyping(true); typingSent.current = true; setTimeout(() => (typingSent.current = false), 2500); }
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }}
              rows={1}
              placeholder={connected ? "Write a message…" : "Connecting…"}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              aria-label="Message"
            />
            <Button type="submit" size="icon" aria-label="Send" disabled={!draft.trim() && !file}>
              <SendHorizonal />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
