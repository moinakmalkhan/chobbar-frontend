"use client";

import { useEffect, useRef, useState } from "react";

import { SmartImage } from "@/components/shared/smart-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/api";

/**
 * Phones: native swipe (scroll-snap) with a progress dots row.
 * Desktop: thumbnail rail + large image with a cheap CSS hover zoom.
 */
export function ImageGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const key = images.map((i) => i.id).join(",");

  // Colour change swaps the image set: reset to the first shot (state adjusted during render, scroll in an effect).
  const [shownKey, setShownKey] = useState(key);
  if (shownKey !== key) {
    setShownKey(key);
    setActive(0);
  }
  useEffect(() => {
    strip.current?.scrollTo({ left: 0 });
  }, [key]);

  const onStripScroll = () => {
    const el = strip.current;
    if (!el) return;
    setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  };

  if (!images.length) {
    return <SmartImage src={null} alt={name} wrapperClassName="aspect-[4/5] rounded-3xl" />;
  }

  return (
    <div className="lg:grid lg:grid-cols-[76px_1fr] lg:gap-4">
      <div className="hidden max-h-[calc(100dvh-8rem)] scrollbar-none flex-col gap-3 overflow-y-auto lg:flex">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`${i + 1} / ${images.length}`}
            aria-current={i === active}
            className={cn(
              "ring-offset-background overflow-hidden rounded-xl ring-2 ring-offset-2 transition-all",
              i === active ? "ring-foreground" : "opacity-70 ring-transparent hover:opacity-100",
            )}
          >
            <SmartImage
              src={img.url}
              alt={img.alt || name}
              width={76}
              height={95}
              wrapperClassName="aspect-[4/5]"
            />
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Desktop main image with hover zoom */}
        <div
          className="bg-muted relative hidden cursor-zoom-in overflow-hidden rounded-3xl lg:block"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
          }}
          onMouseLeave={() => setZoom(null)}
        >
          {images.map((img, i) => (
            <SmartImage
              key={img.id}
              src={img.url}
              alt={img.alt || name}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              wrapperClassName={cn(
                "aspect-[4/5] transition-opacity duration-500",
                i === active ? "relative opacity-100" : "!absolute inset-0 opacity-0",
              )}
              className="transition-transform duration-200 ease-out"
              style={
                i === active && zoom
                  ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Phone swipe strip */}
        <div
          ref={strip}
          onScroll={onStripScroll}
          className="-mx-4 flex snap-x snap-mandatory scrollbar-none overflow-x-auto sm:mx-0 sm:rounded-3xl lg:hidden"
        >
          {images.map((img, i) => (
            <div key={img.id} className="w-full shrink-0 snap-center">
              <SmartImage
                src={img.url}
                alt={img.alt || name}
                fill
                priority={i === 0}
                sizes="100vw"
                wrapperClassName="aspect-[4/5]"
              />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
            {images.map((img, i) => (
              <span
                key={img.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "bg-foreground w-6" : "bg-border w-1.5",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
