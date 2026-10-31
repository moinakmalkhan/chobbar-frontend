"use client";

import { Heart } from "lucide-react";
import { memo, useState } from "react";

import { Price } from "@/components/shared/price";
import { Rating } from "@/components/shared/rating";
import { SmartImage } from "@/components/shared/smart-image";
import { useToggleWishlist, useWishlist } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { cn, mediaUrl } from "@/lib/utils";
import type { ProductCard as Card } from "@/types/api";

function ProductCardBase({
  product,
  priority = false,
  index = 0,
}: {
  product: Card;
  priority?: boolean;
  index?: number;
}) {
  const { t } = useI18n();
  const wishlist = useWishlist();
  const toggle = useToggleWishlist();
  const saved = wishlist.has(product.slug);
  const [popKey, setPopKey] = useState(0);
  const hover = mediaUrl(product.hover_image?.url);

  return (
    <article
      data-reveal
      style={{ "--reveal-delay": `${(index % 4) * 60}ms` } as React.CSSProperties}
      className="group relative flex flex-col"
    >
      <Link
        href={`/products/${product.slug}`}
        prefetch={false}
        className="bg-muted relative block overflow-hidden rounded-2xl"
        aria-label={product.name}
      >
        <SmartImage
          src={product.image?.url}
          alt={product.image?.alt || product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          priority={priority}
          wrapperClassName="aspect-[4/5] w-full"
          className="transition-[opacity,transform] duration-700 ease-out group-hover:scale-[1.04]"
        />
        {hover ? (
          <SmartImage
            src={hover}
            alt=""
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            loading="lazy"
            wrapperClassName="!absolute inset-0 hidden opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block group-hover:opacity-100"
          />
        ) : null}
        <div className="pointer-events-none absolute start-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {!product.in_stock ? (
            <span className="bg-ink-900/85 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white">
              {t("common.soldOut")}
            </span>
          ) : product.discount_percent > 0 ? (
            <span className="bg-brand-600 rounded-full px-2.5 py-1 text-[11px] font-bold text-white">
              −{product.discount_percent}%
            </span>
          ) : null}
          {product.is_new && product.in_stock ? (
            <span className="text-ink-900 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold shadow-sm">
              {t("common.new")}
            </span>
          ) : null}
        </div>
      </Link>
      <button
        type="button"
        onClick={() => {
          setPopKey((k) => k + 1);
          toggle.mutate({ slug: product.slug, name: product.name });
        }}
        aria-pressed={saved}
        aria-label={saved ? t("product.wishlistRemove") : t("product.wishlistAdd")}
        className="text-ink-900 dark:bg-ink-900/80 absolute end-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-105 active:scale-90 dark:text-white"
      >
        <Heart
          key={popKey}
          className={cn("size-[18px]", saved && "fill-brand-600 text-brand-600", popKey > 0 && "animate-pop")}
          strokeWidth={2}
        />
      </button>
      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        {product.colors.length > 0 ? (
          <div className="flex items-center gap-1" aria-label={product.colors.map((c) => c.name).join(", ")}>
            {product.colors.slice(0, 5).map((c) => (
              <span
                key={c.slug}
                title={c.name}
                className="size-3 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {product.colors.length > 5 ? (
              <span className="text-muted-foreground text-[11px]">+{product.colors.length - 5}</span>
            ) : null}
          </div>
        ) : null}
        <Link
          href={`/products/${product.slug}`}
          prefetch={false}
          className="hover:text-brand-700 dark:hover:text-brand-400 line-clamp-2 text-sm leading-snug font-medium transition-colors"
        >
          {product.name}
        </Link>
        <p className="text-muted-foreground text-xs">{product.category_name}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price price={product.price} compare={product.compare_at_price} />
          {product.rating_count > 0 ? <Rating value={product.rating_avg} size={12} /> : null}
        </div>
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardBase);
