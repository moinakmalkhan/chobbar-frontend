import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
  size = 14,
}: {
  value: number;
  count?: number;
  className?: string;
  size?: number;
}) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={`${value.toFixed(1)} / 5`}>
      <span className="flex" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : i - 0.5 === rounded
                  ? "fill-amber-400/50 text-amber-400"
                  : "text-ink-300 dark:text-ink-600 fill-transparent",
            )}
            strokeWidth={1.5}
          />
        ))}
      </span>
      {count !== undefined ? (
        <span className="text-muted-foreground text-xs tabular-nums">({count})</span>
      ) : null}
    </span>
  );
}
