"use client";

import { Check, CheckCheck, Loader2, Paperclip, SendHorizontal, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/misc";
import { useAuth } from "@/hooks/use-auth";
import { useConversationThread } from "@/hooks/use-chat";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useI18n } from "@/i18n/client";
import { cn, mediaUrl } from "@/lib/utils";

export function ChatThread({
  conversationId,
  closed = false,
  className,
}: {
  conversationId: string;
  closed?: boolean;
  className?: string;
}) {
  const { t, date } = useI18n();
  const { user } = useAuth();
  const { messages, history, send, sendTyping, markRead, typing, connected } =
    useConversationThread(conversationId);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const stickToBottom = useRef(true);
  const stopTyping = useDebouncedCallback(() => sendTyping(false), 1500);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, typing]);

  useEffect(() => {
    if (messages.length) markRead();
  }, [messages.length, markRead]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 40 && history.hasNextPage && !history.isFetchingNextPage) {
      const before = el.scrollHeight;
      history
        .fetchNextPage()
        .then(() => requestAnimationFrame(() => (el.scrollTop = el.scrollHeight - before)));
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!body.trim() && !file) return;
    stickToBottom.current = true;
    send(body.trim(), file);
    setBody("");
    setFile(null);
    if (fileInput.current) fileInput.current.value = "";
    sendTyping(false);
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {history.isFetchingNextPage ? (
          <Loader2 className="text-muted-foreground mx-auto mb-2 size-4 animate-spin" />
        ) : null}
        {history.isLoading ? (
          <div className="grid h-full place-items-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : null}
        {messages.map((m, i) => {
          if (m.kind === "system") {
            return (
              <p key={m.id} className="text-muted-foreground py-2 text-center text-xs">
                {m.body}
              </p>
            );
          }
          const mine = !!user && m.sender?.id === user.id;
          const prev = messages[i - 1];
          const grouped = !!prev && prev.sender?.id === m.sender?.id && prev.kind !== "system";
          return (
            <div
              key={m.id}
              className={cn(
                "animate-in fade-in slide-in-from-bottom-2 flex items-end gap-2",
                mine && "flex-row-reverse",
                grouped ? "mt-0.5" : "mt-3",
              )}
            >
              {!mine ? (
                <div className="w-7 shrink-0">
                  {!grouped ? (
                    <Avatar
                      src={m.sender?.avatar_url}
                      name={m.sender?.name || "Chobbar"}
                      className="size-7"
                    />
                  ) : null}
                </div>
              ) : null}
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  mine ? "bg-brand-600 rounded-ee-md text-white" : "bg-muted rounded-es-md",
                )}
              >
                {!mine && !grouped && m.sender?.is_staff ? (
                  <p className="text-brand-700 dark:text-brand-400 mb-0.5 text-[11px] font-semibold">
                    {m.sender.name}
                  </p>
                ) : null}
                {m.body ? <p className="break-words whitespace-pre-wrap">{m.body}</p> : null}
                {m.attachment || m.attachment_name ? (
                  <a
                    href={mediaUrl(m.attachment) ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-1 flex items-center gap-1.5 text-xs underline",
                      mine ? "text-white/90" : "text-foreground/80",
                    )}
                  >
                    <Paperclip className="size-3.5" />
                    {m.attachment_name || "file"}
                  </a>
                ) : null}
                <p
                  className={cn(
                    "mt-0.5 flex items-center justify-end gap-1 text-[10px]",
                    mine ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {date(m.created_at, { hour: "numeric", minute: "2-digit" })}
                  {mine ? m.pending ? <Check className="size-3" /> : <CheckCheck className="size-3" /> : null}
                </p>
              </div>
            </div>
          );
        })}
        {typing ? (
          <div className="text-muted-foreground animate-in fade-in flex items-center gap-2 pt-2 text-xs">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="bg-muted-foreground size-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
            {t("chat.typing", { name: typing })}
          </div>
        ) : null}
      </div>
      {closed ? (
        <p className="border-border text-muted-foreground border-t px-4 py-3 text-center text-sm">
          {t("chat.closed")}
        </p>
      ) : (
        <form onSubmit={submit} className="border-border border-t p-3">
          {file ? (
            <div className="bg-muted mb-2 flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                <Paperclip className="size-3.5 shrink-0" />
                <span className="truncate">{file.name}</span>
              </span>
              <button type="button" onClick={() => setFile(null)} aria-label={t("common.remove")}>
                <X className="size-3.5" />
              </button>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              aria-label={t("chat.attach")}
              className="text-muted-foreground hover:bg-muted grid size-10 shrink-0 place-items-center rounded-full"
            >
              <Paperclip className="size-[18px]" />
            </button>
            <textarea
              value={body}
              rows={1}
              onChange={(e) => {
                setBody(e.target.value);
                sendTyping(true);
                stopTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              aria-label={t("chat.placeholder")}
              placeholder={connected ? t("chat.placeholder") : t("chat.connecting")}
              className="border-border bg-card focus:border-brand-500 [field-sizing:content] max-h-32 min-h-10 flex-1 resize-none rounded-2xl border px-3.5 py-2.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!body.trim() && !file}
              aria-label={t("chat.send")}
              className="bg-brand-600 hover:bg-brand-700 grid size-10 shrink-0 place-items-center rounded-full text-white transition-all active:scale-90 disabled:opacity-40"
            >
              <SendHorizontal className="rtl-flip size-[18px]" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
