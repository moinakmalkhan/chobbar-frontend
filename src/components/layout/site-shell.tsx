"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { useRealtimeNotifications } from "@/hooks/use-notifications";
import { useMeQuery } from "@/hooks/use-auth";

// Heavy, auth-only widgets are loaded lazily so the public catalog stays light.
const CartDrawer = dynamic(() => import("@/components/cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const ChatWidget = dynamic(() => import("@/components/chat/chat-widget").then((m) => m.ChatWidget), { ssr: false });

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useMeQuery();
  useRealtimeNotifications();
  const bare = pathname.startsWith("/print");
  if (bare) return <>{children}</>;
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
    </>
  );
}
