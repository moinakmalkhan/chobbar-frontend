"use client";

import { ChevronRight } from "lucide-react";

import { Link } from "@/i18n/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 scrollbar-none overflow-x-auto">
      <ol className="text-muted-foreground flex items-center gap-1.5 text-xs whitespace-nowrap">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? <ChevronRight aria-hidden className="rtl-flip size-3 opacity-60" /> : null}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={i === items.length - 1 ? "page" : undefined}
                className="text-foreground font-medium"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
