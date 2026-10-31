"use client";

import { Clock, Layers, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatMoney, GENDER_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/types/api";

export function ProductCard({ product, priority = false, index = 0, className }: { product: ProductCardType; priority?: boolean; index?: number; className?: string }) {
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className={cn("group relative flex animate-in fade-in flex-col overflow-hidden rounded-2xl border border-border bg-card fill-mode-both transition-shadow hover:shadow-lg hover:shadow-ink-900/5", className)}
    >
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-muted" aria-label={product.name}>
        {product.image ? (
          <Image src={product.image.url} alt={product.image.alt} fill priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
        ) : (
          <Placeholder name={product.name} />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.is_new ? <Badge variant="brand"><Sparkles className="size-3" /> New</Badge> : null}
          {product.is_featured && !product.is_new ? <Badge variant="dark">Best seller</Badge> : null}
        </div>
        {product.is_customizable ? <span className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">Customizable</span> : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{product.category_name}</p>
        <h3 className="mt-1 line-clamp-2 font-display text-[15px] font-bold leading-snug">
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 hover:text-brand-600">{product.name}</Link>
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{product.base_fabric} · {product.genders.map((g) => GENDER_LABELS[g]).join(", ")}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">from</p>
            <p className="text-lg font-bold leading-none tabular-nums">
              {formatMoney(product.base_price)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">/pc</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Layers className="size-3" /> MOQ {product.min_order_quantity}</span>
            <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {product.lead_time_days} days</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function Placeholder({ name, className }: { name: string; className?: string }) {
  const hue = Array.from(name).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
  return (
    <div className={cn("flex size-full items-center justify-center", className)} style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 92%), hsl(${(hue + 40) % 360} 60% 84%))` }}>
      <svg viewBox="0 0 120 120" className="w-1/2 opacity-70" aria-hidden>
        <path d="M38 22 L60 30 L82 22 L104 38 L92 54 L84 48 L84 100 L36 100 L36 48 L28 54 L16 38 Z" fill="none" stroke={`hsl(${hue} 50% 35%)`} strokeWidth="4" strokeLinejoin="round" />
        <path d="M48 24 Q60 40 72 24" fill="none" stroke={`hsl(${hue} 50% 35%)`} strokeWidth="4" />
      </svg>
    </div>
  );
}
