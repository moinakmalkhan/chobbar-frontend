"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { cn, mediaUrl } from "@/lib/utils";
import type { Banner } from "@/types/api";

/** Art-directed slide: wide image on desktop, portrait on phones, only one ever downloads. */
function SlideImage({ banner, priority }: { banner: Banner; priority: boolean }) {
  const common = { alt: banner.title, sizes: "100vw", priority, quality: 80 } as const;
  const desktop = getImageProps({ ...common, src: mediaUrl(banner.image)!, width: 1920, height: 820 }).props;
  const mobile = banner.mobile_image
    ? getImageProps({ ...common, src: mediaUrl(banner.mobile_image)!, width: 900, height: 1200 }).props
    : null;
  return (
    <picture>
      {mobile ? <source media="(max-width: 767px)" srcSet={mobile.srcSet} sizes="100vw" /> : null}
      <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...desktop} className="absolute inset-0 size-full object-cover" />
    </picture>
  );
}

export function Hero({ banners }: { banners: Banner[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<number | null>(null);
  const count = banners.length;
  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setTimeout(() => go(index + 1), 6500);
    return () => clearTimeout(id);
  }, [index, paused, count, go]);

  if (!count) return <HeroFallback />;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("home.heroEyebrow")}
      className="bg-ink-950 relative isolate overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        const rtl = document.documentElement.dir === "rtl";
        if (Math.abs(dx) > 50) go(index + (dx < 0 !== rtl ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="relative h-[78svh] max-h-[760px] min-h-[520px] md:h-[min(70vh,680px)]">
        {banners.map((b, i) => (
          <div
            key={b.id}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-out",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
          >
            <div className={cn("absolute inset-0 rtl:-scale-x-100", i === index && "animate-ken")}>
              <SlideImage banner={b} priority={i === 0} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/15 md:to-transparent rtl:md:bg-gradient-to-l" />
            <div className="container-x relative flex h-full items-end pb-20 md:items-center md:pb-0">
              {i === index ? (
                <div className="max-w-xl">
                  {b.eyebrow ? (
                    <p className="animate-rise mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
                      <span className="bg-brand-500 size-1.5 rounded-full" />
                      {b.eyebrow}
                    </p>
                  ) : null}
                  <h1 className="font-display animate-rise text-4xl leading-[1.05] font-extrabold text-balance [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                    {b.title}
                  </h1>
                  {b.subtitle ? (
                    <p className="animate-rise mt-4 max-w-md text-base text-pretty text-white/80 [animation-delay:160ms] sm:text-lg">
                      {b.subtitle}
                    </p>
                  ) : null}
                  <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
                    <Button asChild size="lg" variant="white">
                      <Link href={b.cta_url || "/products"}>
                        {b.cta_label || t("common.shopNow")}
                        <ArrowRight className="rtl-flip" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {count > 1 ? (
        <div className="container-x absolute inset-x-0 bottom-6 z-20 flex items-center justify-between">
          <div className="flex gap-2" role="tablist">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} / ${count}`}
                onClick={() => go(i)}
                className="relative h-1.5 w-10 overflow-hidden rounded-full bg-white/25"
              >
                <span
                  key={`${index}-${paused}`}
                  className={cn(
                    "absolute inset-y-0 start-0 rounded-full bg-white",
                    i === index
                      ? paused
                        ? "w-full"
                        : "w-full origin-left animate-[grow_6.5s_linear_both] rtl:origin-right"
                      : i < index
                        ? "w-full"
                        : "w-0",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={t("common.previous")}
              className="grid size-11 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
            >
              <ChevronLeft className="rtl-flip size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={t("common.next")}
              className="grid size-11 place-items-center rounded-full border border-white/25 transition-colors hover:bg-white/10"
            >
              <ChevronRight className="rtl-flip size-5" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HeroFallback() {
  const { t } = useI18n();
  return (
    <section className="bg-ink-950 relative overflow-hidden text-white">
      <div
        aria-hidden
        className="bg-brand-600/40 absolute -end-40 top-1/2 size-[640px] -translate-y-1/2 rounded-full blur-3xl"
      />
      <div className="container-x relative py-28 md:py-40">
        <p className="text-brand-300 animate-rise mb-4 text-xs font-semibold tracking-[0.18em] uppercase">
          {t("home.heroEyebrow")}
        </p>
        <h1 className="font-display animate-rise max-w-2xl text-4xl leading-[1.05] font-extrabold [animation-delay:80ms] sm:text-6xl">
          {t("home.heroTitle")}
        </h1>
        <p className="animate-rise mt-5 max-w-lg text-lg text-white/75 [animation-delay:160ms]">
          {t("home.heroSubtitle")}
        </p>
        <div className="animate-rise mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
          <Button asChild size="lg" variant="white">
            <Link href="/collections/new-arrivals">{t("home.heroCta")}</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/collections/sale">{t("home.heroCta2")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
