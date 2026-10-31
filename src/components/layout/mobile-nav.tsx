"use client";

import { ChevronRight, HelpCircle, MessageCircle, Package, Truck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { LanguagePills } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { useUIStore } from "@/stores/ui-store";

export function MobileNav() {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const setChatOpen = useUIStore((s) => s.setChatOpen);
  const categories = useCategories().data ?? [];
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        side="start"
        className="gap-0 p-0"
        closeLabel={t("common.close")}
        aria-describedby={undefined}
      >
        <div className="border-border flex h-16 items-center border-b px-5">
          <DialogTitle className="sr-only">{t("nav.menu")}</DialogTitle>
          <Logo className="h-7" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <div className="grid grid-cols-2 gap-2 py-2">
            <Link
              href="/collections/new-arrivals"
              className="bg-ink-900 dark:text-ink-900 rounded-2xl p-4 text-sm font-bold text-white dark:bg-white"
            >
              {t("nav.newIn")}
            </Link>
            <Link
              href="/collections/sale"
              className="bg-brand-600 rounded-2xl p-4 text-sm font-bold text-white"
            >
              {t("nav.sale")}
            </Link>
          </div>
          <Accordion type="single" collapsible>
            {categories.map((c) => (
              <AccordionItem key={c.slug} value={c.slug}>
                <AccordionTrigger className="text-base">{c.name}</AccordionTrigger>
                <AccordionContent className="pb-3">
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={`/categories/${c.slug}`}
                        className="text-foreground hover:bg-muted flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold"
                      >
                        {t("nav.shopAll", { name: c.name })}
                        <ChevronRight className="rtl-flip size-4" />
                      </Link>
                    </li>
                    {c.children.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/categories/${s.slug}`}
                          className="text-foreground/80 hover:bg-muted flex items-center justify-between rounded-xl px-3 py-2.5"
                        >
                          {s.name}
                          <span className="text-muted-foreground text-xs">{s.product_count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <ul className="mt-4 space-y-1 text-sm">
            {[
              {
                href: isAuthenticated ? "/account/orders" : "/login",
                icon: Package,
                label: isAuthenticated ? t("nav.orders") : t("nav.signIn"),
              },
              { href: "/track", icon: Truck, label: t("nav.trackOrder") },
              { href: "/faq", icon: HelpCircle, label: t("nav.help") },
            ].map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3 font-medium"
                >
                  <Icon className="text-muted-foreground size-[18px]" />
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setChatOpen(true);
                }}
                className="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3 font-medium"
              >
                <MessageCircle className="text-muted-foreground size-[18px]" />
                {t("chat.launcher")}
              </button>
            </li>
          </ul>
        </div>
        <div className="border-border safe-bottom space-y-3 border-t px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t("common.language")}</span>
            <ThemeToggle />
          </div>
          <LanguagePills />
        </div>
      </DialogContent>
    </Dialog>
  );
}
