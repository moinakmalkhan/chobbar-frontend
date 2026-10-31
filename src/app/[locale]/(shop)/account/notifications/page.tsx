"use client";

import {
  Bell,
  CheckCheck,
  CreditCard,
  Gift,
  MessageCircle,
  Package,
  RotateCcw,
  Star,
  User,
} from "lucide-react";

import { PageTitle } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationMutations, useNotificationsFeed } from "@/hooks/use-notifications";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { timeAgo } from "@/lib/format";
import { appPath, cn } from "@/lib/utils";
import type { Notification } from "@/types/api";

const ICONS: Record<Notification["kind"], typeof Bell> = {
  order: Package,
  return: RotateCcw,
  payment: CreditCard,
  promo: Gift,
  review: Star,
  account: User,
  chat: MessageCircle,
  system: Bell,
};

export default function NotificationsPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const feed = useNotificationsFeed();
  const { markRead, markAllRead } = useNotificationMutations();
  const items = feed.data?.pages.flatMap((p) => p.results) ?? [];
  const anyUnread = items.some((n) => !n.is_read);

  return (
    <>
      <PageTitle
        title={t("account.notifications")}
        action={
          anyUnread ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              loading={markAllRead.isPending}
            >
              <CheckCheck />
              {t("account.markAllRead")}
            </Button>
          ) : null
        }
      />
      {feed.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : items.length ? (
        <>
          <ul className="border-border bg-card overflow-hidden rounded-3xl border">
            {items.map((n) => {
              const Icon = ICONS[n.kind] ?? Bell;
              const path = appPath(n.url);
              return (
                <li key={n.id} className="border-border border-b last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.is_read) markRead.mutate(n.id);
                      if (path) router.push(path);
                    }}
                    className={cn(
                      "hover:bg-muted/60 flex w-full items-start gap-4 p-4 text-start transition-colors sm:p-5",
                      !n.is_read && "bg-brand-50/50 dark:bg-brand-500/5",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        n.level === "success"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                          : n.level === "warning"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-muted text-foreground",
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className={cn("text-sm", !n.is_read ? "font-semibold" : "font-medium")}>
                          {n.title}
                        </span>
                        <span className="text-muted-foreground shrink-0 text-xs">
                          {timeAgo(n.created_at, locale)}
                        </span>
                      </span>
                      {n.body ? (
                        <span className="text-muted-foreground mt-0.5 block text-sm">{n.body}</span>
                      ) : null}
                    </span>
                    {!n.is_read ? (
                      <span className="bg-brand-600 mt-2 size-2 shrink-0 rounded-full" aria-label="unread" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {feed.hasNextPage ? (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => feed.fetchNextPage()}
                loading={feed.isFetchingNextPage}
              >
                {t("account.loadMore")}
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState icon={Bell} title={t("account.allCaughtUp")} />
      )}
    </>
  );
}
