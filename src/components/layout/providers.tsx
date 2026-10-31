"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/misc";
import { useDevice } from "@/hooks/use-device";
import { onSessionExpired } from "@/lib/api";
import { makeQueryClient } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { useAuthStore } from "@/stores/auth-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const device = useDevice();
  const router = useRouter();

  useEffect(() => {
    // The axios layer tells us when a refresh failed; react in one place.
    return onSessionExpired(() => {
      queryClient.clear();
      notify.warning("Session expired", "Please sign in again to continue.");
      if (window.location.pathname.startsWith("/account") || window.location.pathname.startsWith("/checkout")) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    });
  }, [queryClient, router]);

  useEffect(() => {
    // Multi-tab logout/login sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "leepa.auth") useAuthStore.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion={device.lowEnd ? "always" : "user"} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </MotionConfig>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        visibleToasts={4}
        offset={16}
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border !border-border !shadow-lg !font-sans",
            title: "!text-sm !font-semibold",
            description: "!text-xs !opacity-90",
            actionButton: "!bg-brand-500 !text-white !rounded-lg",
          },
        }}
      />
    </QueryClientProvider>
  );
}
