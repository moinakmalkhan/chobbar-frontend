"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

export function setTheme(dark: boolean) {
  const root = document.documentElement;
  // Suppress every transition for one frame so the swap is instant and jank-free.
  root.classList.add("[&_*]:!transition-none");
  root.classList.toggle("dark", dark);
  try {
    localStorage.setItem("chobbar.theme", dark ? "dark" : "light");
  } catch {
    /* private mode */
  }
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("[&_*]:!transition-none")));
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useIsDark();
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => setTheme(!dark)}
      aria-label={dark ? t("nav.lightMode") : t("nav.darkMode")}
      className={cn(
        "hover:bg-muted relative grid size-10 place-items-center rounded-full transition-colors",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-[19px] transition-all duration-300",
          dark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute size-[19px] transition-all duration-300",
          dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
    </button>
  );
}
