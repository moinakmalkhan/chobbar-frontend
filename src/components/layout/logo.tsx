import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("size-8", className)}>
      <rect width="64" height="64" rx="14" className="fill-ink-900 dark:fill-white" />
      <path d="M18 14h10v26h18v10H18z" fill="#f97316" />
      <path d="M34 14h12l-6 14z" className="fill-white dark:fill-ink-900" opacity=".9" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Leepa Sports home">
      <LogoMark />
      {!compact ? (
        <span className="font-display text-xl font-extrabold tracking-tight">
          LEEPA<span className="text-brand-500">SPORTS</span>
        </span>
      ) : null}
    </Link>
  );
}
