"use client";

import { Bell, ChevronDown, Menu, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/layout/logo";
import { MegaMenu, MobileNav } from "@/components/layout/nav";
import { SearchCommand } from "@/components/layout/search-command";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useCategories } from "@/hooks/use-catalog";
import { useUnreadCount } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, hydrated, company } = useAuth();
  const { data: categories } = useCategories();
  const { data: cart } = useCart();
  const { data: unread } = useUnreadCount();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const quantity = cart?.quantity ?? 0;

  return (
    <header className={cn("no-print sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70", scrolled ? "border-border shadow-xs" : "border-transparent")}>
      {/* Utility bar */}
      <div className="hidden border-b border-border/60 bg-ink-900 text-xs text-ink-200 lg:block">
        <div className="container-x flex h-9 items-center justify-between">
          <p>
            Wholesale only · MOQ from 10 pieces · Mixed sizes & genders allowed · Ships worldwide from Sialkot
          </p>
          <div className="flex items-center gap-5">
            <Link href="/track" className="hover:text-white">Track order</Link>
            <Link href="/quick-order" className="hover:text-white">Quick order</Link>
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            {hydrated && isAuthenticated && company ? <span className="text-brand-300">{company.name}</span> : null}
          </div>
        </div>
      </div>

      <div className="container-x flex h-16 items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
          <Menu />
        </Button>
        <Logo className="mr-2" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <MegaMenu categories={categories ?? []} />
          <NavLink href="/products" active={pathname === "/products"}>All products</NavLink>
          <NavLink href="/fabrics" active={pathname.startsWith("/fabrics")}>Fabrics</NavLink>
          <NavLink href="/how-it-works" active={pathname.startsWith("/how-it-works")}>How it works</NavLink>
        </nav>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="ml-auto hidden h-10 w-full max-w-xs items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:border-ink-300 hover:bg-muted md:flex"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search jerseys, hoodies, SKUs…</span>
          <kbd className="hidden rounded-md border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium lg:inline">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search />
          </Button>
          <ThemeToggle />
          {hydrated && isAuthenticated ? (
            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link href="/account/notifications" className="relative">
                <Bell />
                {unread ? <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span> : null}
              </Link>
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" onClick={openDrawer} aria-label={`Cart, ${quantity} pieces`} className="relative">
            <ShoppingBag />
            {quantity ? <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white dark:bg-brand-500">{quantity > 999 ? "999+" : quantity}</span> : null}
          </Button>
          <UserMenu />
        </div>
      </div>

      <SearchCommand />
      <MobileNav categories={categories ?? []} />
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted", active ? "text-brand-600 dark:text-brand-400" : "text-foreground/80")}>
      {children}
    </Link>
  );
}

export { ChevronDown };
