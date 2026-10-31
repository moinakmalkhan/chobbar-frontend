"use client";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { SmartImage } from "@/components/shared/smart-image";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";

export function ListingHeader({
  title,
  description,
  count,
  crumbs,
  chips,
  image,
}: {
  title: string;
  description?: string;
  count?: number;
  crumbs: { label: string; href?: string }[];
  chips?: { label: string; href: string }[];
  image?: string | null;
}) {
  const { t, number } = useI18n();
  return (
    <header className="mb-6 sm:mb-8">
      <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, ...crumbs]} />
      <div className={image ? "bg-ink-950 relative overflow-hidden rounded-3xl p-6 text-white sm:p-10" : ""}>
        {image ? (
          <>
            <SmartImage
              src={image}
              alt=""
              fill
              sizes="100vw"
              wrapperClassName="!absolute inset-0 opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent rtl:bg-gradient-to-l" />
          </>
        ) : null}
        <div className="relative">
          <h1 className="font-display animate-rise text-3xl font-extrabold sm:text-4xl">{title}</h1>
          {description ? (
            <p
              className={`animate-rise mt-2 max-w-2xl text-pretty [animation-delay:80ms] ${image ? "text-white/80" : "text-muted-foreground"}`}
            >
              {description}
            </p>
          ) : null}
          {count !== undefined ? (
            <p className={`mt-1 text-sm ${image ? "text-white/70" : "text-muted-foreground"}`}>
              {t("common.results", { count: number(count) })}
            </p>
          ) : null}
        </div>
      </div>
      {chips?.length ? (
        <div className="-mx-4 mt-5 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {chips.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="border-border hover:border-foreground hover:bg-foreground hover:text-background shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
