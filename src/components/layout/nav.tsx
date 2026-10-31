"use client";

import { ChevronDown, ChevronRight, Package, Shirt, Star, Swords, Wind, Dumbbell, Gamepad2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { CategoryNode } from "@/types/api";

const ICONS: Record<string, LucideIcon> = { shirt: Shirt, dumbbell: Dumbbell, wind: Wind, swords: Swords, star: Star, package: Package, "gamepad-2": Gamepad2 };

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Shirt;
  return <Icon className={className} />;
}

/** Hover/focus mega menu. Only categories that have products arrive from the API. */
export function MegaMenu({ categories }: { categories: CategoryNode[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  if (!categories.length) return null;
  const current = categories[Math.min(active, categories.length - 1)];
  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && hide()}>
      <button type="button" className={cn("flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted", open && "bg-muted")} aria-expanded={open} aria-haspopup="true">
        Shop <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 pt-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid w-[760px] grid-cols-[240px_1fr] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
            <ul className="border-r border-border bg-surface p-2">
              {categories.map((cat, i) => (
                <li key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", i === active ? "bg-background text-brand-600 shadow-xs dark:text-brand-400" : "hover:bg-background/60")}
                  >
                    <CategoryIcon name={cat.icon} className="size-4" />
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.product_count}</span>
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-border pt-1">
                <Link href="/products" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-600 hover:bg-background/60 dark:text-brand-400">
                  View all products <ChevronRight className="size-4" />
                </Link>
              </li>
            </ul>
            <div className="p-5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-base font-bold">{current.name}</h3>
                <Link href={`/categories/${current.slug}`} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Shop all {current.name.toLowerCase()}</Link>
              </div>
              {current.description ? <p className="mt-1 text-xs text-muted-foreground">{current.description}</p> : null}
              <ul className="mt-4 grid grid-cols-2 gap-1.5">
                {current.children.map((child) => (
                  <li key={child.id}>
                    <Link href={`/categories/${child.slug}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
                      <span>{child.name}</span>
                      <span className="text-xs text-muted-foreground">{child.product_count}</span>
                    </Link>
                  </li>
                ))}
                {!current.children.length ? <li className="text-sm text-muted-foreground">Browse all {current.product_count} products.</li> : null}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileNav({ categories }: { categories: CategoryNode[] }) {
  const open = useUIStore((s) => s.mobileNavOpen);
  const setOpen = useUIStore((s) => s.setMobileNavOpen);
  const { isAuthenticated } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const close = () => setOpen(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent side="right" className="w-[88vw] max-w-sm p-0">
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <div className="border-b border-border px-5 py-4" onClick={close}>
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Mobile">
          <ul className="space-y-0.5">
            {categories.map((cat) => (
              <li key={cat.id}>
                <div className="flex items-center">
                  <Link href={`/categories/${cat.slug}`} onClick={close} className="flex flex-1 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted">
                    <CategoryIcon name={cat.icon} className="size-4 text-brand-500" /> {cat.name}
                  </Link>
                  {cat.children.length ? (
                    <button type="button" onClick={() => setExpanded(expanded === cat.id ? null : cat.id)} className="rounded-lg p-2 hover:bg-muted" aria-label={`Toggle ${cat.name}`}>
                      <ChevronDown className={cn("size-4 transition-transform", expanded === cat.id && "rotate-180")} />
                    </button>
                  ) : null}
                </div>
                {expanded === cat.id ? (
                  <ul className="mb-1 ml-9 space-y-0.5 border-l border-border pl-3">
                    {cat.children.map((child) => (
                      <li key={child.id}>
                        <Link href={`/categories/${child.slug}`} onClick={close} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground">
                          {child.name} <span className="text-xs">{child.product_count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <div className="my-3 h-px bg-border" />
          <ul className="space-y-0.5 text-sm font-medium">
            {[["All products", "/products"], ["Fabric guide", "/fabrics"], ["Quick order", "/quick-order"], ["Track an order", "/track"], ["How it works", "/how-it-works"]].map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={close} className="block rounded-xl px-3 py-3 hover:bg-muted">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-border p-4">
          {isAuthenticated ? (
            <Link href="/account" onClick={close} className="block rounded-xl bg-ink-900 px-4 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-ink-900">My account</Link>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={close} className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold">Sign in</Link>
              <Link href="/register" onClick={close} className="rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white">Open account</Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
