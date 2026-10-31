"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useI18n } from "@/i18n/client";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import type { CategoryNode, Storefront } from "@/types/api";

// Interaction-only widgets load on demand so first paint stays light on low-end phones.
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), {
  ssr: false,
});
const SearchCommand = dynamic(
  () => import("@/components/layout/search-command").then((m) => m.SearchCommand),
  { ssr: false },
);
const MobileNav = dynamic(() => import("@/components/layout/mobile-nav").then((m) => m.MobileNav), {
  ssr: false,
});
const ChatWidget = dynamic(() => import("@/components/chat/chat-widget"), { ssr: false });

/** Mounts its children the first time `when` is true, then keeps them (so close animations still run). */
function MountOnce({ when, children }: { when: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(when);
  if (when && !mounted) setMounted(true);
  return mounted ? <>{children}</> : null;
}

export function SiteShell({
  children,
  categories,
  storefront,
}: {
  children: React.ReactNode;
  categories: CategoryNode[] | null;
  storefront: Storefront | null;
}) {
  const { t } = useI18n();
  const drawerOpen = useCartStore((s) => s.drawerOpen);
  const searchOpen = useUIStore((s) => s.searchOpen);
  const navOpen = useUIStore((s) => s.mobileNavOpen);
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="focus:bg-brand-600 sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-white"
      >
        {t("common.skipToContent")}
      </a>
      <Header initialCategories={categories} initialStorefront={storefront} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <MountOnce when={drawerOpen}>
        <CartDrawer />
      </MountOnce>
      <MountOnce when={searchOpen}>
        <SearchCommand />
      </MountOnce>
      <MountOnce when={navOpen}>
        <MobileNav />
      </MountOnce>
      <ChatWidget />
    </div>
  );
}
