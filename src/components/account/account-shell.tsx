"use client";

import { Bell, Bookmark, Building2, ClipboardList, LayoutDashboard, MapPin, MessageSquare, Package, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useChatUnread } from "@/hooks/use-chat";
import { useUnreadCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/quotes", label: "Quotes", icon: ClipboardList },
  { href: "/account/saved-lists", label: "Saved lists", icon: Bookmark },
  { href: "/account/messages", label: "Messages", icon: MessageSquare, badge: "chat" },
  { href: "/account/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/team", label: "Team", icon: Users, manage: true },
  { href: "/account/company", label: "Company", icon: Building2 },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, isAuthenticated, canManage, company, user } = useAuth();
  const { data: unread } = useUnreadCount();
  const { data: chatUnread } = useChatUnread();

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) return <div className="container-x py-10"><Skeleton className="h-10 w-56" /><Skeleton className="mt-6 h-64" /></div>;
  const items = NAV.filter((n) => !n.manage || canManage);
  const badges: Record<string, number | undefined> = { chat: chatUnread, notifications: unread };

  return (
    <div className="container-x py-6 lg:py-10">
      {!user?.is_email_verified ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <span>Please verify your email to place orders and request quotes.</span>
          <Link href="/verify-email" className="font-semibold underline">Resend link</Link>
        </div>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside>
          <div className="mb-4 hidden rounded-2xl border border-border bg-card p-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company</p>
            <p className="mt-1 truncate font-semibold">{company?.name ?? "No company yet"}</p>
            {company ? <p className="truncate text-xs text-muted-foreground">{company.is_verified ? "Verified account" : "Pending verification"} · {company.currency}</p> : null}
          </div>
          <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-none lg:mx-0 lg:flex-col lg:px-0 lg:pb-0" aria-label="Account">
            {items.map(({ href, label, icon: Icon, exact, badge }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              const count = badge ? badges[badge] : undefined;
              return (
                <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-ink-900 text-white dark:bg-white dark:text-ink-900" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="size-4" /> {label}
                  {count ? <span className={cn("ml-auto rounded-full px-1.5 text-[10px] font-bold", active ? "bg-brand-500 text-white" : "bg-brand-500 text-white")}>{count}</span> : null}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
