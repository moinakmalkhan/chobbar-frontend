"use client";

import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/account/account-shell";
import { ChatThread } from "@/components/chat/chat-thread";
import { NewConversation } from "@/components/chat/new-conversation";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations } from "@/hooks/use-chat";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MessagesView({ activeId }: { activeId?: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { data, isLoading } = useConversations();
  const [composing, setComposing] = useState(false);
  const active = data?.results.find((c) => c.id === activeId);
  const showThread = Boolean(activeId) || composing;

  return (
    <>
      <PageTitle
        title={t("account.messages")}
        action={
          <Button
            onClick={() => {
              setComposing(true);
              if (activeId) router.push("/account/messages");
            }}
          >
            <Plus />
            {t("account.newConversation")}
          </Button>
        }
      />
      <div className="border-border bg-card grid h-[min(70vh,680px)] overflow-hidden rounded-3xl border md:grid-cols-[300px_1fr]">
        <div
          className={cn("border-border min-h-0 overflow-y-auto md:border-e", showThread && "hidden md:block")}
        >
          {isLoading ? (
            <div className="space-y-2 p-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : data?.results.length ? (
            <ul className="p-2">
              {data.results.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/account/messages/${c.id}`}
                    onClick={() => setComposing(false)}
                    className={cn(
                      "hover:bg-muted flex items-start gap-3 rounded-2xl p-3 transition-colors",
                      c.id === activeId && "bg-muted",
                    )}
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
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={MessageCircle}
              title={t("account.noConversations")}
              description={t("account.startChat")}
            />
          )}
        </div>
        <div className={cn("flex min-h-0 flex-col", !showThread && "hidden md:flex")}>
          {composing ? (
            <>
              <div className="border-border flex items-center gap-2 border-b p-3">
                <button
                  type="button"
                  onClick={() => setComposing(false)}
                  aria-label={t("common.back")}
                  className="hover:bg-muted grid size-9 place-items-center rounded-full md:hidden"
                >
                  <ArrowLeft className="rtl-flip size-4" />
                </button>
                <p className="font-semibold">{t("account.newConversation")}</p>
              </div>
              <NewConversation
                onStarted={(c) => {
                  setComposing(false);
                  router.push(`/account/messages/${c.id}`);
                }}
              />
            </>
          ) : activeId ? (
            <>
              <div className="border-border flex items-center gap-2 border-b p-3">
                <Link
                  href="/account/messages"
                  aria-label={t("common.back")}
                  className="hover:bg-muted grid size-9 place-items-center rounded-full md:hidden"
                >
                  <ArrowLeft className="rtl-flip size-4" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{active?.subject ?? "…"}</p>
                  {active?.order ? (
                    <Link
                      href={`/account/orders/${active.order.id}`}
                      className="text-muted-foreground text-xs hover:underline"
                      dir="ltr"
                    >
                      {active.order.number}
                    </Link>
                  ) : null}
                </div>
                {active ? (
                  <StatusBadge
                    status={active.status}
                    label={t(`status.${active.status === "pending" ? "open" : active.status}`)}
                  />
                ) : null}
              </div>
              <ChatThread key={activeId} conversationId={activeId} closed={active?.status === "closed"} />
            </>
          ) : (
            <div className="text-muted-foreground grid flex-1 place-items-center p-6 text-center text-sm">
              <div>
                <MessageCircle className="text-brand-600/60 mx-auto mb-3 size-10" />
                {t("account.startChat")}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
