"use client";

import { Home, LayoutGrid, Search, ShoppingBag, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCartCount } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/client";
import { Link, stripLocale } from "@/i18n/link";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";

/** App-style tab bar on phones. Hidden where a page has its own sticky action bar. */
export function BottomNav() {
  const { t, number } = useI18n();
  const path = stripLocale(usePathname());
  const count = useCartCount();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  if (/^\/(products\/[^/]+|checkout)/.test(path)) return null;

  const item =
    "flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors";
  const on = (active: boolean) => (active ? "text-brand-600 dark:text-brand-400" : "text-muted-foreground");
  return (
    <>
      <div aria-hidden className="h-16 lg:hidden" />
      <nav
        aria-label={t("nav.menu")}
        className="border-border safe-bottom fixed inset-x-0 bottom-0 z-40 border-t bg-[var(--header)] backdrop-blur-md lg:hidden"
      >
        <div className="flex h-16">
          <Link href="/" className={cn(item, on(path === "/"))}>
            <Home className="size-5" />
            {t("nav.home")}
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className={cn(item, on(path.startsWith("/categories") || path.startsWith("/products")))}
          >
            <LayoutGrid className="size-5" />
            {t("nav.shop")}
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={cn(item, on(path.startsWith("/search")))}
          >
            <Search className="size-5" />
            {t("common.search")}
          </button>
          <button type="button" onClick={openDrawer} className={cn(item, on(path === "/cart"), "relative")}>
            <span className="relative">
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span
                  key={count}
                  className="bg-brand-600 animate-pop absolute -end-2.5 -top-1.5 grid min-w-4 place-items-center rounded-full px-1 text-[9px] leading-4 font-bold text-white"
                >
                  {number(count)}
                </span>
              ) : null}
            </span>
            {t("nav.bag")}
          </button>
          <Link href="/account" className={cn(item, on(path.startsWith("/account") || path === "/login"))}>
            <User className="size-5" />
            {t("nav.account")}
          </Link>
        </div>
      </nav>
    </>
  );
}
