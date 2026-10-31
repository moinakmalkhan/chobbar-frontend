"use client";

import { Check, Globe } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { LOCALE_COOKIE, LOCALE_META, LOCALES, type Locale } from "@/i18n/config";
import { stripLocale } from "@/i18n/link";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";

/**
 * Switching language is a full navigation: <html lang/dir>, fonts and server-rendered
 * content all change, so a hard load is both simpler and smoother than patching in place.
 */
export function useSwitchLocale() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  return (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    if (isAuthenticated) authService.updateMe({ language: next }).catch(() => undefined);
    const qs = window.location.search.replace(/^\?/, "");
    const path = `/${next}${stripLocale(pathname) === "/" ? "" : stripLocale(pathname)}${qs ? `?${qs}` : ""}`;
    // Hard load so cached API data (fetched in the old language) is not reused.
    window.location.href = new URL(path, window.location.origin).toString();
  };
}

export function LanguageSwitcher({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { locale, t } = useI18n();
  const switchTo = useSwitchLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("common.language")}
        className={cn(
          "hover:bg-muted inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium transition-colors",
          className,
        )}
      >
        <Globe className="size-[18px]" />
        {compact ? null : <span>{LOCALE_META[locale].name}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => l !== locale && switchTo(l)}
            className="justify-between gap-6"
          >
            <span className="flex flex-col">
              <span lang={l} className="text-foreground font-medium">
                {LOCALE_META[l].name}
              </span>
              <span className="text-muted-foreground text-xs">{LOCALE_META[l].english}</span>
            </span>
            {l === locale ? <Check className="!text-brand-600" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Inline pill row for the mobile menu and footer. */
export function LanguagePills({ className }: { className?: string }) {
  const { locale } = useI18n();
  const switchTo = useSwitchLocale();
  return (
    <div className={cn("flex gap-2", className)} role="radiogroup">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === locale}
          lang={l}
          onClick={() => l !== locale && switchTo(l)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            l === locale
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-border hover:border-foreground/30",
          )}
        >
          {LOCALE_META[l].name}
        </button>
      ))}
    </div>
  );
}
