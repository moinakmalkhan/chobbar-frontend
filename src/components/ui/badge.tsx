import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "border-transparent bg-muted text-foreground",
      brand: "border-transparent bg-brand-500 text-white",
      soft: "border-transparent bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
      outline: "border-border text-foreground",
      success: "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      warning: "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      danger: "border-transparent bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
      info: "border-transparent bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
      dark: "border-transparent bg-ink-900 text-white dark:bg-white dark:text-ink-900",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending_approval: "warning",
  pending_payment: "warning",
  confirmed: "info",
  in_production: "info",
  quality_check: "info",
  shipped: "soft",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
  unpaid: "warning",
  deposit_paid: "info",
  paid: "success",
  overdue: "danger",
  refunded: "default",
  submitted: "warning",
  under_review: "info",
  quoted: "soft",
  accepted: "success",
  declined: "danger",
  expired: "default",
  converted: "success",
  pending: "warning",
  open: "warning",
  closed: "default",
  economy: "default",
  standard: "info",
  premium: "soft",
  elite: "success",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "default"} className={className}>
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
