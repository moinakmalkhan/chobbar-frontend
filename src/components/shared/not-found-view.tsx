"use client";

import { Home, Search } from "lucide-react";

import { LogoMark } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { useUIStore } from "@/stores/ui-store";

export function NotFoundView() {
  const { t } = useI18n();
  const openSearch = useUIStore((s) => s.setSearchOpen);
  return (
    <div className="container-x flex min-h-[70dvh] flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-8">
        <span
          aria-hidden
          className="bg-brand-500/15 absolute inset-0 -z-10 scale-150 rounded-full blur-3xl"
        />
        <LogoMark className="animate-rise h-24" />
      </div>
      <p className="font-display text-brand-600 animate-rise text-7xl font-extrabold [animation-delay:60ms]">
        404
      </p>
      <h1 className="font-display animate-rise mt-3 text-2xl font-extrabold [animation-delay:120ms]">
        {t("errors.notFoundTitle")}
      </h1>
      <p className="text-muted-foreground animate-rise mt-2 max-w-sm [animation-delay:180ms]">
        {t("errors.notFoundText")}
      </p>
      <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3 [animation-delay:240ms]">
        <Button asChild>
          <Link href="/">
            <Home />
            {t("errors.goHome")}
          </Link>
        </Button>
        <Button variant="outline" onClick={() => openSearch(true)}>
          <Search />
          {t("common.search")}
        </Button>
      </div>
    </div>
  );
}
