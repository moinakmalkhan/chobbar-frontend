import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground",
        brand: "bg-brand-600 text-white",
        soft: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
        success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
        warning: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        danger: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
        info: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
        dark: "bg-ink-900 text-white dark:bg-white dark:text-ink-900",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipped: "soft",
  out_for_delivery: "soft",
  delivered: "success",
  completed: "success",
  cancelled: "danger",
  returned: "default",
  unpaid: "warning",
  paid: "success",
  cod_pending: "default",
  refunded: "default",
  partially_refunded: "default",
  requested: "warning",
  approved: "info",
  received: "info",
  rejected: "danger",
  submitted: "info",
  failed: "danger",
  open: "success",
  closed: "default",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label: string;
  className?: string;
}) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "default"} className={className}>
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </Badge>
  );
}
