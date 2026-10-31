"use client";

import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Settings,
  Star,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { Avatar } from "@/components/ui/misc";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useChatUnread } from "@/hooks/use-chat";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useI18n } from "@/i18n/client";
import { Link, stripLocale, useRouter } from "@/i18n/link";
import { cn } from "@/lib/utils";

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const { user, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const path = stripLocale(usePathname());
  const logout = useLogout();
  const unread = useUnreadCount().data ?? 0;
  const chatUnread = useChatUnread().data ?? 0;

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [hydrated, isAuthenticated, path, router]);

  const nav = [
    { href: "/account", icon: LayoutDashboard, label: t("account.overview"), exact: true },
    { href: "/account/orders", icon: Package, label: t("account.orders") },
    { href: "/account/returns", icon: RotateCcw, label: t("account.returns") },
    { href: "/wishlist", icon: Heart, label: t("account.wishlist") },
    { href: "/account/addresses", icon: MapPin, label: t("account.addresses") },
    { href: "/account/reviews", icon: Star, label: t("account.reviews") },
    { href: "/account/messages", icon: MessageCircle, label: t("account.messages"), badge: chatUnread },
    { href: "/account/notifications", icon: Bell, label: t("account.notifications"), badge: unread },
    { href: "/account/settings", icon: Settings, label: t("account.settings") },
  ];
  const active = (href: string, exact?: boolean) =>
    exact ? path === href : path === href || path.startsWith(`${href}/`);

  if (!hydrated || !isAuthenticated || !user) {
    return (
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <Skeleton className="hidden h-96 lg:block" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container-x py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-[250px_1fr] lg:gap-10">
        <aside className="mb-6 lg:mb-0">
          <div className="mb-5 hidden items-center gap-3 lg:flex">
            <Avatar src={user.avatar_url} name={user.full_name || user.email} className="size-12 text-sm" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.full_name || user.email.split("@")[0]}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
          </div>
          <nav
            aria-label={t("nav.account")}
            className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0"
          >
            {nav.map(({ href, icon: Icon, label, exact, badge }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href, exact) ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition-colors lg:rounded-xl lg:border-0 lg:py-2.5",
                  active(href, exact)
                    ? "border-foreground bg-foreground text-background lg:bg-muted lg:text-foreground"
                    : "border-border hover:bg-muted",
                )}
              >
                <Icon className="hidden size-[18px] lg:block" />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="bg-brand-600 rounded-full px-1.5 text-[10px] leading-5 font-bold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="text-muted-foreground hover:bg-muted hover:text-foreground hidden items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors lg:flex"
            >
              <LogOut className="size-[18px]" />
              {t("nav.signOut")}
            </button>
          </nav>
        </aside>
        <div className="animate-in fade-in min-w-0">{children}</div>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
