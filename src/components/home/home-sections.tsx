"use client";

import { ArrowRight, Banknote, Factory, RotateCcw, Truck } from "lucide-react";

import { ProductRail } from "@/components/catalog/product-rail";
import { SectionHeading } from "@/components/shared/section";
import { SmartImage } from "@/components/shared/smart-image";
import { useAuth } from "@/hooks/use-auth";
import { useFeed, useProducts, useRecommendations } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { useLocalStore } from "@/stores/local-store";
import type { Banner, CategoryNode, Collection, Paginated, ProductCard } from "@/types/api";

export function Perks() {
  const { t } = useI18n();
  const perks = [
    { icon: Truck, label: t("home.perkDelivery") },
    { icon: Banknote, label: t("home.perkCod") },
    { icon: RotateCcw, label: t("home.perkReturns") },
    { icon: Factory, label: t("home.perkMade") },
  ];
  return (
    <section className="border-border bg-surface border-b">
      <div className="container-x grid grid-cols-2 gap-x-4 gap-y-3 py-5 md:grid-cols-4">
        {perks.map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            data-reveal
            style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
            className="flex items-center gap-3 text-sm font-medium"
          >
            <span className="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 grid size-10 shrink-0 place-items-center rounded-full">
              <Icon className="size-[18px]" />
            </span>
            <span className="leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryTiles({ categories }: { categories: CategoryNode[] }) {
  const { t } = useI18n();
  if (!categories.length) return null;
  return (
    <section className="container-x pt-16 sm:pt-20">
      <SectionHeading title={t("home.shopByCategory")} />
      <div className="-mx-4 flex snap-x snap-mandatory scrollbar-none gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            href={`/categories/${c.slug}`}
            data-reveal
            style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
            className="group relative w-[42%] shrink-0 snap-start overflow-hidden rounded-3xl sm:w-[28%] lg:w-auto"
          >
            <SmartImage
              src={c.image}
              alt={c.name}
              fill
              sizes="(min-width: 1024px) 18vw, 42vw"
              wrapperClassName="aspect-[4/5]"
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white">
              <div>
                <p className="font-display text-lg leading-tight font-bold">{c.name}</p>
                <p className="text-xs text-white/75">{t("common.results", { count: c.product_count })}</p>
              </div>
              <span className="text-ink-900 grid size-9 shrink-0 place-items-center rounded-full bg-white transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                <ArrowRight className="rtl-flip size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FeedRail({
  feed,
  title,
  subtitle,
  href,
  initial,
}: {
  feed: "new-arrivals" | "best-sellers" | "featured";
  title: string;
  subtitle?: string;
  href: string;
  initial?: ProductCard[] | null;
}) {
  const { t } = useI18n();
  const query = useFeed(feed, initial);
  if (!query.isLoading && !query.data?.length) return null;
  return (
    <section className="container-x pt-16 sm:pt-20">
      <SectionHeading title={title} subtitle={subtitle} href={href} linkLabel={t("common.viewAll")} />
      <ProductRail products={query.data} loading={query.isLoading} />
    </section>
  );
}

export function SaleRail({ initial }: { initial?: Paginated<ProductCard> | null }) {
  const { t } = useI18n();
  const query = useProducts({ on_sale: true, page_size: 12, ordering: "-sales_count" }, initial);
  if (!query.isLoading && !query.data?.results.length) return null;
  return (
    <section className="pt-16 sm:pt-20">
      <div className="container-x">
        <div className="bg-brand-600 relative overflow-hidden rounded-3xl px-5 py-10 text-white sm:px-10">
          <div aria-hidden className="absolute -end-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mb-8 flex items-end justify-between gap-4">
            <div data-reveal>
              <p className="text-xs font-bold tracking-[0.18em] text-white/80 uppercase">{t("nav.sale")}</p>
              <h2 className="font-display mt-1 text-3xl font-extrabold sm:text-4xl">{t("home.saleTitle")}</h2>
              <p className="mt-1 text-sm text-white/80 sm:text-base">{t("home.saleSub")}</p>
            </div>
            <Link
              href="/collections/sale"
              className="text-brand-700 hidden shrink-0 items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105 sm:inline-flex"
            >
              {t("common.viewAll")}
              <ArrowRight className="rtl-flip size-4" />
            </Link>
          </div>
          <div className="relative [&_article_.text-muted-foreground]:text-white/70 [&_article_a]:text-white [&_article_s]:text-white/60 [&_article_span.text-brand-700]:text-white">
            <ProductRail products={query.data?.results} loading={query.isLoading} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PromoBanners({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;
  return (
    <section className="container-x grid gap-4 pt-16 sm:pt-20 md:grid-cols-2">
      {banners.slice(0, 2).map((b, i) => (
        <Link
          key={b.id}
          href={b.cta_url || "/products"}
          data-reveal
          style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
          className="group bg-ink-900 relative isolate overflow-hidden rounded-3xl text-white"
        >
          <SmartImage
            src={b.image}
            alt={b.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            wrapperClassName="aspect-[15/8] md:aspect-[16/9] rtl:-scale-x-100"
            className="transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10">
            {b.eyebrow ? (
              <p className="text-brand-300 text-xs font-bold tracking-[0.18em] uppercase">{b.eyebrow}</p>
            ) : null}
            <h3 className="font-display mt-1 max-w-xs text-2xl leading-tight font-extrabold sm:text-3xl">
              {b.title}
            </h3>
            {b.subtitle ? <p className="mt-2 max-w-xs text-sm text-white/80">{b.subtitle}</p> : null}
            <span className="mt-5 inline-flex w-fit items-center gap-1.5 text-sm font-semibold underline-offset-4 group-hover:underline">
              {b.cta_label}
              <ArrowRight className="rtl-flip size-4" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function CollectionsGrid({ collections }: { collections: Collection[] }) {
  const { t } = useI18n();
  const items = collections.filter((c) => c.product_count > 0).slice(0, 6);
  if (!items.length) return null;
  return (
    <section className="container-x pt-16 sm:pt-20">
      <SectionHeading title={t("nav.collections")} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {items.map((c, i) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            data-reveal
            style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}
            className="group bg-muted relative overflow-hidden rounded-3xl"
          >
            <SmartImage
              src={c.image}
              alt={c.name}
              fill
              sizes="(min-width: 1024px) 30vw, 46vw"
              wrapperClassName="aspect-square sm:aspect-[4/3]"
              className="transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-6">
              <p className="font-display text-lg font-bold sm:text-2xl">{c.name}</p>
              {c.tagline ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-white/80 sm:text-sm">{c.tagline}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function MadeInSialkot() {
  const { t } = useI18n();
  const stats = [
    { value: "100%", label: t("home.storyStat1") },
    { value: "48h", label: t("home.storyStat2") },
    { value: "14", label: t("home.storyStat3") },
  ];
  return (
    <section className="container-x pt-16 sm:pt-24">
      <div className="bg-ink-950 grid items-center gap-10 overflow-hidden rounded-3xl p-8 text-white sm:p-12 lg:grid-cols-2">
        <div data-reveal>
          <p className="text-brand-400 text-xs font-bold tracking-[0.18em] uppercase">
            {t("home.storyEyebrow")}
          </p>
          <h2 className="font-display mt-2 text-3xl leading-tight font-extrabold sm:text-4xl">
            {t("home.storyTitle")}
          </h2>
          <p className="mt-4 max-w-lg text-white/70">{t("home.storyText")}</p>
        </div>
        <dl className="grid grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
              className="rounded-2xl bg-white/5 p-4 text-center ring-1 ring-white/10 sm:p-6"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-brand-400 text-3xl font-extrabold sm:text-4xl" dir="ltr">
                {s.value}
              </dd>
              <dd className="mt-1 text-xs text-white/70 sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const { t } = useI18n();
  const items = useLocalStore((s) => s.recentlyViewed).filter((p) => p.slug !== excludeSlug);
  if (items.length < 2) return null;
  return (
    <section className="container-x pt-16 sm:pt-20">
      <SectionHeading title={t("home.recentlyViewed")} />
      <ProductRail products={items} />
    </section>
  );
}

export function ForYou() {
  const { t } = useI18n();
  const { isAuthenticated, hydrated } = useAuth();
  const viewed = useLocalStore((s) => s.recentlyViewed.length);
  const query = useRecommendations(undefined, hydrated && (isAuthenticated || viewed > 0));
  if (!query.data?.length) return null;
  return (
    <section className="container-x pt-16 sm:pt-20">
      <SectionHeading title={t("home.forYou")} />
      <ProductRail products={query.data} />
    </section>
  );
}
