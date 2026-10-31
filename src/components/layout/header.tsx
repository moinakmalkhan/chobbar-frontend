"use client";

import { Heart, Menu, Search, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { SmartImage } from "@/components/shared/smart-image";
import { useCartCount, useWishlist } from "@/hooks/use-cart";
import { useCategories, useStorefront } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { Link, stripLocale } from "@/i18n/link";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import type { CategoryNode, Storefront } from "@/types/api";

function AnnouncementBar({ storefront }: { storefront?: Storefront }) {
  const items = storefront?.announcements ?? [];
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);
  if (!items.length) return null;
  const item = items[i % items.length];
  return (
    <div className="bg-ink-950 text-white">
      <div className="container-x flex h-9 items-center justify-center overflow-hidden text-center text-xs font-medium sm:text-[13px]">
        <p key={item.id} className="animate-in fade-in slide-in-from-bottom-2 truncate">
          {item.url ? (
            <Link href={item.url} className="hover:underline">
              {item.text}
            </Link>
          ) : (
            item.text
          )}
        </p>
      </div>
    </div>
  );
}

function MegaMenu({ category }: { category: CategoryNode }) {
  const { t } = useI18n();
  return (
    <div className="border-border bg-background pointer-events-none invisible absolute inset-x-0 top-full -translate-y-1 border-b opacity-0 shadow-xl transition-all duration-200 group-focus-within/nav:pointer-events-auto group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100 group-hover/nav:pointer-events-auto group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
      <div className="container-x grid grid-cols-[1fr_auto] gap-10 py-8">
        <div>
          <Link
            href={`/categories/${category.slug}`}
            className="font-display hover:text-brand-700 dark:hover:text-brand-400 text-lg font-bold"
          >
            {t("nav.shopAll", { name: category.name })}
          </Link>
          <ul className="mt-4 grid grid-cols-2 gap-x-10 gap-y-2.5 sm:grid-cols-3">
            {category.children.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="group/link text-foreground/80 hover:text-foreground flex items-baseline gap-2 text-sm transition-colors"
                >
                  <span className="relative after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform group-hover/link:after:scale-x-100 rtl:after:origin-right">
                    {c.name}
                  </span>
                  <span className="text-muted-foreground text-xs">{c.product_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {category.image ? (
          <Link
            href={`/categories/${category.slug}`}
            className="group/img block w-56 overflow-hidden rounded-2xl"
          >
            <SmartImage
              src={category.image}
              alt={category.name}
              width={224}
              height={224}
              wrapperClassName="aspect-square"
              className="transition-transform duration-700 group-hover/img:scale-105"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function Header({
  initialCategories,
  initialStorefront,
}: {
  initialCategories?: CategoryNode[] | null;
  initialStorefront?: Storefront | null;
}) {
  const { t, number } = useI18n();
  const pathname = stripLocale(usePathname());
  const categories = useCategories(initialCategories).data ?? [];
  const storefront = useStorefront(initialStorefront).data;
  const count = useCartCount();
  const wishlistCount = useWishlist().count;
  const openDrawer = useCartStore((s) => s.openDrawer);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // ⌘K / Ctrl+K and "/" open search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const menu = categories.filter((c) => c.show_in_menu);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <AnnouncementBar storefront={storefront} />
      <div ref={sentinel} aria-hidden className="h-px" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-border bg-[var(--header)] shadow-[0_8px_30px_-20px_rgb(0_0_0/0.25)] backdrop-blur-md"
            : "bg-background border-transparent",
        )}
      >
        <div className="container-x flex h-16 items-center gap-2 lg:h-[72px]">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={t("nav.menu")}
            className="hover:bg-muted -ms-2 grid size-10 place-items-center rounded-full lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Link href="/" aria-label="Chobbar" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo className="h-7 sm:h-8" />
          </Link>

          <nav aria-label={t("nav.shop")} className="ms-6 hidden h-full items-stretch lg:flex">
            {menu.map((c) => (
              <div key={c.slug} className="group/nav static flex">
                <Link
                  href={`/categories/${c.slug}`}
                  className={cn(
                    "hover:text-brand-700 dark:hover:text-brand-400 relative flex items-center px-3.5 text-sm font-semibold transition-colors",
                    "after:bg-brand-600 after:absolute after:inset-x-3.5 after:bottom-0 after:h-0.5 after:scale-x-0 after:rounded-full after:transition-transform group-hover/nav:after:scale-x-100",
                    isActive(`/categories/${c.slug}`) && "after:scale-x-100",
                  )}
                >
                  {c.name}
                </Link>
                {c.children.length ? <MegaMenu category={c} /> : null}
              </div>
            ))}
            <Link
              href="/collections/sale"
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center px-3.5 text-sm font-bold transition-colors"
            >
              {t("nav.sale")}
            </Link>
          </nav>

          <div className="ms-auto flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="border-border bg-muted/60 text-muted-foreground hover:border-foreground/20 hidden h-10 w-52 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors xl:flex"
            >
              <Search className="size-4" />
              <span className="flex-1 truncate text-start">{t("common.search")}</span>
              <kbd className="border-border bg-background rounded border px-1.5 text-[10px]" dir="ltr">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label={t("common.search")}
              className="hover:bg-muted grid size-10 place-items-center rounded-full xl:hidden"
            >
              <Search className="size-[19px]" />
            </button>
            <LanguageSwitcher className="hidden md:inline-flex" compact />
            <ThemeToggle className="hidden md:grid" />
            <Link
              href="/wishlist"
              aria-label={t("nav.wishlist")}
              className="hover:bg-muted relative hidden size-10 place-items-center rounded-full sm:grid"
            >
              <Heart className="size-[19px]" />
              {wishlistCount > 0 ? (
                <span className="bg-ink-900 dark:text-ink-900 absolute end-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] leading-[18px] font-bold text-white dark:bg-white">
                  {number(wishlistCount)}
                </span>
              ) : null}
            </Link>
            <UserMenu />
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`${t("nav.bag")} (${count})`}
              className="hover:bg-muted relative grid size-10 place-items-center rounded-full"
            >
              <ShoppingBag className="size-[19px]" />
              {count > 0 ? (
                <span
                  key={count}
                  className="bg-brand-600 animate-pop absolute end-0.5 top-0.5 grid min-w-[18px] place-items-center rounded-full px-1 text-[10px] leading-[18px] font-bold text-white"
                >
                  {count > 99 ? "99+" : number(count)}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
