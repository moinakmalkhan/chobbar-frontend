"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/misc";
import { useMe } from "@/hooks/use-auth";
import { useDevice } from "@/hooks/use-device";
import { useRealtimeNotifications } from "@/hooks/use-notifications";
import { useRevealObserver } from "@/hooks/use-reveal";
import { useI18n } from "@/i18n/client";
import { useRouter, stripLocale } from "@/i18n/link";
import { onSessionExpired } from "@/lib/api";
import { makeQueryClient } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useLocalStore } from "@/stores/local-store";

function SessionEffects() {
  const router = useRouter();
  const { t } = useI18n();
  const pathname = usePathname();
  const device = useDevice();
  useMe();
  useRealtimeNotifications();
  useRevealObserver(pathname);

  useEffect(() => {
    // Low-end phones get shorter, transform-free animations and no backdrop blur (see globals.css).
    if (!device.ready) return;
    document.documentElement.toggleAttribute("data-lowend", device.lowEnd);
  }, [device.ready, device.lowEnd]);

  useEffect(
    () =>
      onSessionExpired(() => {
        notify.warning(t("auth.sessionExpired"));
        const path = stripLocale(window.location.pathname);
        if (path.startsWith("/account")) router.push(`/login?next=${encodeURIComponent(path)}`);
      }),
    [router, t],
  );

  useEffect(() => {
    // Keep sign-in and the bag in sync across tabs.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "chobbar.auth") useAuthStore.persist.rehydrate();
      if (e.key === "chobbar.cart") useCartStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  useEffect(() => {
    // Device-stored state loads after hydration; auth last because it flips `hydrated` and unlocks queries.
    void useCartStore.persist.rehydrate();
    void useLocalStore.persist.rehydrate();
    void useAuthStore.persist.rehydrate();
  }, []);
  const { dir } = useI18n();
  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir={dir}>
        <TooltipProvider delayDuration={250}>
          <SessionEffects />
          {children}
        </TooltipProvider>
      </DirectionProvider>
      <Toaster
        dir={dir}
        position={dir === "rtl" ? "top-left" : "top-right"}
        richColors
        closeButton
        visibleToasts={3}
        offset={16}
        mobileOffset={{ top: 12, left: 12, right: 12 }}
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border !border-border !shadow-lg !font-sans",
            title: "!text-sm !font-semibold",
            description: "!text-xs !opacity-90",
            actionButton: "!bg-brand-600 !text-white !rounded-full !px-3",
          },
        }}
      />
    </QueryClientProvider>
  );
}
