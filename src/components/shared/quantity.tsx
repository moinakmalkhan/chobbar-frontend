"use client";

import { Minus, Plus } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = "md",
  disabled,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const { t, number } = useI18n();
  const btn = cn(
    "grid place-items-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "size-7" : "size-10",
  );
  return (
    <div
      className={cn("border-border bg-card inline-flex items-center rounded-full border p-0.5", className)}
      role="group"
      aria-label={t("product.quantity")}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label="−"
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          "min-w-8 text-center font-semibold tabular-nums",
          size === "sm" ? "text-xs" : "text-sm",
        )}
        aria-live="polite"
      >
        {number(value)}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="+"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
