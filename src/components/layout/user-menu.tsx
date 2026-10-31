"use client";

import { Bell, Heart, LogOut, MessageCircle, Package, Settings, User as UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/misc";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";

export function UserMenu() {
  const { user, isAuthenticated, hydrated } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const logout = useLogout();
  const unread = useUnreadCount().data ?? 0;

  if (!hydrated || !isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        aria-label={t("nav.signIn")}
        className="hover:bg-muted grid size-10 place-items-center rounded-full transition-colors"
      >
        <UserIcon className="size-[19px]" />
      </Link>
    );
  }
  const items = [
    { href: "/account", icon: UserIcon, label: t("account.overview") },
    { href: "/account/orders", icon: Package, label: t("nav.orders") },
    { href: "/wishlist", icon: Heart, label: t("nav.wishlist") },
    { href: "/account/notifications", icon: Bell, label: t("nav.notifications"), badge: unread },
    { href: "/account/messages", icon: MessageCircle, label: t("account.messages") },
    { href: "/account/settings", icon: Settings, label: t("account.settings") },
  ];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("nav.account")}
        className="hover:bg-muted relative grid size-10 place-items-center rounded-full transition-colors"
      >
        <Avatar src={user.avatar_url} name={user.full_name || user.email} className="size-8" />
        {unread > 0 ? (
          <span className="bg-brand-600 ring-background absolute end-1 top-1 size-2.5 rounded-full ring-2" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-foreground truncate text-sm font-semibold">
            {t("account.hi", { name: user.first_name || user.email.split("@")[0] })}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map(({ href, icon: Icon, label, badge }) => (
          <DropdownMenuItem key={href} onSelect={() => router.push(href)}>
            <Icon />
            <span className="flex-1">{label}</span>
            {badge ? (
              <span className="bg-brand-600 rounded-full px-1.5 text-[10px] font-bold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logout()}>
          <LogOut />
          {t("nav.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
