"use client";

import { ArrowLeft, MessageCircle, Plus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ChatThread } from "@/components/chat/chat-thread";
import { NewConversation } from "@/components/chat/new-conversation";
import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useChatUnread, useConversations } from "@/hooks/use-chat";
import { useI18n } from "@/i18n/client";
import { Link, stripLocale } from "@/i18n/link";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export default function ChatWidget() {
  const { t, locale } = useI18n();
  const { isAuthenticated } = useAuth();
  const open = useUIStore((s) => s.chatOpen);
  const activeId = useUIStore((s) => s.activeConversationId);
  const setOpen = useUIStore((s) => s.setChatOpen);
  const [composing, setComposing] = useState(false);
  const conversations = useConversations();
  const unread = useChatUnread().data ?? 0;
  const path = stripLocale(usePathname());
  const active = conversations.data?.results.find((c) => c.id === activeId);

  // The checkout stays distraction-free; the messages page has the full-size thread.
  if (!open && (path.startsWith("/checkout") || path.startsWith("/account/messages"))) return null;
  // Phones: product pages and the bag have their own sticky actions, so the launcher steps aside there
  // (chat stays reachable from the menu, the FAQ and order pages).
  const phoneHidden = path.startsWith("/products/") || path === "/cart" || path === "/wishlist";
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t("chat.launcher")}
        aria-expanded={open}
        className={cn(
          phoneHidden && !open && "hidden lg:grid",
          "bg-ink-900 dark:text-ink-900 fixed end-4 bottom-20 z-40 grid size-12 place-items-center rounded-full text-white shadow-xl shadow-black/20 transition-transform hover:scale-105 active:scale-95 sm:size-14 lg:end-6 lg:bottom-6 dark:bg-white",
        )}
      >
        <MessageCircle className={cn("size-6 transition-all duration-300", open && "scale-50 opacity-0")} />
        <X className={cn("absolute size-6 transition-all duration-300", !open && "scale-50 opacity-0")} />
        {unread > 0 && !open ? (
          <span className="bg-brand-600 ring-background absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full px-1 text-[11px] leading-5 font-bold text-white ring-2">
            {unread}
          </span>
        ) : null}
      </button>
      {open ? (
        <section
          role="dialog"
          aria-label={t("chat.title")}
          className="border-border bg-background animate-in fade-in zoom-in-95 fixed inset-x-3 top-20 bottom-36 z-40 flex origin-bottom-right flex-col overflow-hidden rounded-3xl border shadow-2xl sm:inset-x-auto sm:end-6 sm:top-auto sm:h-[min(600px,72vh)] sm:w-[380px] lg:bottom-24 rtl:origin-bottom-left"
        >
          <header className="bg-ink-900 dark:bg-ink-800 flex items-center gap-3 px-4 py-3.5 text-white">
            {active || composing ? (
              <button
                type="button"
                onClick={() => {
                  setComposing(false);
                  setOpen(true, null);
                }}
                aria-label={t("common.back")}
                className="-ms-1 grid size-8 place-items-center rounded-full hover:bg-white/10"
              >
                <ArrowLeft className="rtl-flip size-4" />
              </button>
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-white">
                <LogoMark className="text-ink-900 dark:text-ink-900 h-6 [--logo-cut:#fff] dark:[--logo-accent:#e11d48]" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{active?.subject ?? t("chat.title")}</p>
              <p className="flex items-center gap-1.5 text-xs text-white/70">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("chat.subtitle")}
              </p>
            </div>
          </header>
          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <MessageCircle className="text-brand-600 size-10" />
              <p className="text-muted-foreground text-sm">{t("chat.signIn")}</p>
              <Button asChild onClick={() => setOpen(false)}>
                <Link href={`/login?next=${encodeURIComponent(path)}`}>{t("nav.signIn")}</Link>
              </Button>
            </div>
          ) : composing ? (
            <NewConversation
              onStarted={(c) => {
                setComposing(false);
                setOpen(true, c.id);
              }}
            />
          ) : activeId ? (
            <ChatThread conversationId={activeId} closed={active?.status === "closed"} />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto p-2">
                {conversations.data?.results.length ? (
                  conversations.data.results.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setOpen(true, c.id)}
                      className="hover:bg-muted flex w-full items-start gap-3 rounded-2xl p-3 text-start transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{c.subject}</p>
                          <span className="text-muted-foreground shrink-0 text-[11px]">
                            {timeAgo(c.last_message_at ?? c.created_at, locale)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {c.last_message_preview}
                        </p>
                      </div>
                      {c.unread_count ? (
                        <span className="bg-brand-600 mt-1 grid min-w-5 place-items-center rounded-full px-1 text-[10px] leading-5 font-bold text-white">
                          {c.unread_count}
                        </span>
                      ) : null}
                    </button>
                  ))
                ) : (
                  <div className="text-muted-foreground p-6 text-center text-sm">
                    {t("account.startChat")}
                  </div>
                )}
              </div>
              <div className="border-border border-t p-3">
                <Button className="w-full" onClick={() => setComposing(true)}>
                  <Plus />
                  {t("account.newConversation")}
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}
