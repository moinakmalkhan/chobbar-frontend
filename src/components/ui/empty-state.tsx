import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-in fade-in flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {Icon ? (
        <div className="relative mb-5">
          <div
            aria-hidden
            className="bg-brand-500/10 absolute inset-0 -z-10 scale-150 rounded-full blur-2xl"
          />
          <div className="bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300 grid size-16 place-items-center rounded-2xl">
            <Icon className="size-7" strokeWidth={1.75} />
          </div>
        </div>
      ) : null}
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-1.5 max-w-sm text-sm text-pretty">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
