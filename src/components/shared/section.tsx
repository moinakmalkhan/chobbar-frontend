"use client";

import { ArrowRight } from "lucide-react";

import { Link } from "@/i18n/link";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div data-reveal className={cn("mb-6 flex items-end justify-between gap-4 sm:mb-8", className)}>
      <div>
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{title}</h2>
        {subtitle ? <p className="text-muted-foreground mt-1 text-sm sm:text-base">{subtitle}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group text-foreground/80 hover:text-brand-700 dark:hover:text-brand-400 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors"
        >
          {linkLabel}
          <ArrowRight className="rtl-flip size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
