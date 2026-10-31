"use client";

import Image from "next/image";
import { useState } from "react";

import { Placeholder } from "@/components/catalog/product-card";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/api";

export function ImageGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border bg-muted">
        {current ? <Image key={current.id} src={current.url} alt={current.alt || name} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover animate-in fade-in" /> : <Placeholder name={name} />}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setActive(i)} className={cn("relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors", i === active ? "border-brand-500" : "border-transparent hover:border-border")} aria-label={`Image ${i + 1}`}>
              <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
