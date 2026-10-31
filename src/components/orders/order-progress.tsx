"use client";

import { Check, CircleDot, Home, Package, PackageCheck, Truck, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const STEPS: { status: OrderStatus; icon: typeof Check }[] = [
  { status: "pending", icon: CircleDot },
  { status: "confirmed", icon: Check },
  { status: "processing", icon: Package },
  { status: "shipped", icon: Truck },
  { status: "out_for_delivery", icon: Truck },
  { status: "delivered", icon: Home },
];
const ORDER: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "completed",
];

/** Horizontal stepper on desktop, vertical on phones. Fills progressively with a CSS transition. */
export function OrderProgress({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  if (status === "cancelled" || status === "returned") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">
        <X className="size-5" />
        {t(`status.${status}`)}
      </div>
    );
  }
  const current = Math.min(ORDER.indexOf(status), STEPS.length - 1);
  const pct = (current / (STEPS.length - 1)) * 100;
  return (
    <div>
      <ol className="relative hidden grid-cols-6 sm:grid">
        <span aria-hidden className="bg-border absolute inset-x-[8.33%] top-5 h-0.5" />
        <span
          aria-hidden
          className="bg-brand-600 absolute start-[8.33%] top-5 h-0.5 transition-[width] duration-1000 ease-out"
          style={{ width: `${(pct * 83.34) / 100}%` }}
        />
        {STEPS.map((s, i) => {
          const Icon = status === "completed" && i === STEPS.length - 1 ? PackageCheck : s.icon;
          const done = i <= current;
          return (
            <li key={s.status} className="relative flex flex-col items-center gap-2 text-center">
              <span
                className={cn(
                  "z-10 grid size-10 place-items-center rounded-full border-2 transition-colors duration-500",
                  done
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-border bg-background text-muted-foreground",
                  i === current && "ring-brand-500/20 ring-4",
                )}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <Icon className="size-[18px]" />
              </span>
              <span className={cn("text-xs", done ? "font-semibold" : "text-muted-foreground")}>
                {t(`status.${s.status}`)}
              </span>
            </li>
          );
        })}
      </ol>
      <ol className="space-y-0 sm:hidden">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i <= current;
          return (
            <li key={s.status} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full border-2",
                    done ? "border-brand-600 bg-brand-600 text-white" : "border-border text-muted-foreground",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {i < STEPS.length - 1 ? (
                  <span className={cn("h-6 w-0.5", i < current ? "bg-brand-600" : "bg-border")} />
                ) : null}
              </div>
              <p className={cn("pt-1.5 text-sm", done ? "font-semibold" : "text-muted-foreground")}>
                {t(`status.${s.status}`)}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Timeline({ entries }: { entries: { status: OrderStatus; note: string; at: string }[] }) {
  const { t, date } = useI18n();
  if (!entries.length) return null;
  return (
    <ol className="border-border relative space-y-5 border-s-2 ps-6">
      {[...entries].reverse().map((e, i) => (
        <li key={`${e.status}-${e.at}`} className="relative">
          <span
            className={cn(
              "border-background absolute -start-[31px] top-1 size-3.5 rounded-full border-2",
              i === 0 ? "bg-brand-600" : "bg-ink-300 dark:bg-ink-600",
            )}
          />
          <p className="text-sm font-semibold">{t(`status.${e.status}`)}</p>
          {e.note ? <p className="text-muted-foreground text-sm">{e.note}</p> : null}
          <p className="text-muted-foreground text-xs">
            {date(e.at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
          </p>
        </li>
      ))}
    </ol>
  );
}
