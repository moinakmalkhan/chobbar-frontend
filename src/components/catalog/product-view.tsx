"use client";

import { Bell, Check, Heart, RotateCcw, Share2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ImageGallery } from "@/components/catalog/image-gallery";
import { isLight } from "@/components/catalog/product-filters";
import { SizeGuide } from "@/components/catalog/size-guide";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity";
import { Rating } from "@/components/shared/rating";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useAddToCart, useToggleWishlist, useWishlist } from "@/hooks/use-cart";
import { useProduct } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { catalogService } from "@/services/catalog";
import { useLocalStore } from "@/stores/local-store";
import type { ProductDetail } from "@/types/api";

function NotifyMe({ variantId }: { variantId: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <p className="animate-in fade-in flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Check className="size-4" />
        {t("product.notifyDone")}
      </p>
    );
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await catalogService.notifyMe(variantId, email || undefined);
          setDone(true);
          notify.success(t("product.notifyDone"));
        } catch (err) {
          notify.error(err);
        } finally {
          setBusy(false);
        }
      }}
    >
      {!user ? (
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("product.notifyEmail")}
          aria-label={t("product.notifyEmail")}
          className="h-13 rounded-full"
        />
      ) : null}
      <Button
        type="submit"
        size="lg"
        variant="secondary"
        loading={busy}
        className={user ? "w-full" : "shrink-0"}
      >
        <Bell />
        {t("product.notifyMe")}
      </Button>
    </form>
  );
}

export function ProductView({ initial }: { initial: ProductDetail }) {
  const { t, money, number } = useI18n();
  const { data: product = initial } = useProduct(initial.slug, initial);
  const addToCart = useAddToCart();
  const wishlist = useWishlist();
  const toggleWishlist = useToggleWishlist();
  const pushViewed = useLocalStore((s) => s.pushViewed);

  // Colours in catalog order, each with whether any size is in stock.
  const colors = useMemo(() => {
    const seen = new Map<string, { name: string; slug: string; hex: string; inStock: boolean }>();
    for (const v of product.variants) {
      if (!v.color) continue;
      const prev = seen.get(v.color.slug);
      seen.set(v.color.slug, { ...v.color, inStock: (prev?.inStock ?? false) || v.in_stock });
    }
    return [...seen.values()];
  }, [product.variants]);

  const sizes = product.size_group?.sizes.map((s) => s.label) ?? [
    ...new Set(product.variants.map((v) => v.size).filter(Boolean) as string[]),
  ];
  const [color, setColor] = useState<string | null>(
    () => colors.find((c) => c.inStock)?.slug ?? colors[0]?.slug ?? null,
  );
  const [size, setSize] = useState<string | null>(() => (sizes.length === 1 ? sizes[0] : null));
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  const variantFor = (c: string | null, s: string | null) =>
    product.variants.find((v) => (v.color?.slug ?? null) === c && (v.size ?? null) === s);
  const variant =
    variantFor(color, size) ??
    (sizes.length === 0 ? product.variants.find((v) => (v.color?.slug ?? null) === color) : undefined);
  const price = variant?.price ?? product.price;
  const images = useMemo(() => {
    const forColor = product.images.filter((i) => i.color === color);
    const neutral = product.images.filter((i) => !i.color);
    return forColor.length ? [...forColor, ...neutral] : product.images;
  }, [product.images, color]);
  const saved = wishlist.has(product.slug);
  const colorName = colors.find((c) => c.slug === color)?.name;

  useEffect(() => {
    // Store only the card fields on the device (small, and enough to render a rail).
    const {
      id,
      name,
      slug,
      sku,
      brand,
      gender,
      category,
      category_name,
      short_description,
      image,
      hover_image,
      price,
      compare_at_price,
      discount_percent,
      is_on_sale,
      in_stock,
      rating_avg,
      rating_count,
      colors,
      sizes,
      is_featured,
      is_new,
    } = product;
    pushViewed({
      id,
      name,
      slug,
      sku,
      brand,
      gender,
      category,
      category_name,
      short_description,
      image,
      hover_image,
      price,
      compare_at_price,
      discount_percent,
      is_on_sale,
      in_stock,
      rating_avg,
      rating_count,
      colors,
      sizes,
      is_featured,
      is_new,
    });
  }, [product, pushViewed]);

  // Keep quantity within the selected variant's stock.
  const maxQty = Math.max(1, Math.min(10, variant?.stock ?? 10));
  const quantity = Math.min(qty, maxQty);

  const add = () => {
    if (!size && sizes.length) {
      setSizeError(true);
      document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
      notify.warning(t("product.selectSize"));
      return;
    }
    if (!variant) return;
    addToCart.mutate({ variant: variant.id, quantity, name: `${product.name} · ${variant.label}` });
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else {
        await navigator.clipboard.writeText(url);
        notify.success(t("product.linkCopied"));
      }
    } catch {
      /* user cancelled */
    }
  };

  const soldOut = variant ? !variant.in_stock : size !== null && !variant;
  const addLabel = soldOut ? t("common.soldOut") : t("product.addToBag");

  return (
    <div className="container-x py-6 lg:py-10">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), href: "/" },
          ...product.breadcrumbs.map((b) => ({ label: b.name, href: `/categories/${b.slug}` })),
          { label: product.name },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ImageGallery images={images} name={product.name} />
        </div>

        <div className="flex flex-col gap-6">
          <div className="animate-rise">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {product.is_new ? (
                <span className="bg-ink-900 dark:text-ink-900 rounded-full px-2.5 py-0.5 text-xs font-bold text-white dark:bg-white">
                  {t("common.new")}
                </span>
              ) : null}
              {product.discount_percent ? (
                <span className="bg-brand-600 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                  −{product.discount_percent}%
                </span>
              ) : null}
              <span className="text-muted-foreground text-sm">{product.category_name}</span>
            </div>
            <h1 className="font-display text-2xl leading-tight font-extrabold sm:text-3xl">{product.name}</h1>
            {product.rating_count > 0 ? (
              <a
                href="#reviews"
                className="text-muted-foreground hover:text-foreground mt-2 inline-flex items-center gap-2 text-sm"
              >
                <Rating value={product.rating_avg} />
                <span>{t("reviews.basedOn", { count: number(product.rating_count) })}</span>
              </a>
            ) : null}
            <Price price={price} compare={product.compare_at_price} size="lg" className="mt-4" />
            {product.compare_at_price && product.compare_at_price > price ? (
              <p className="text-brand-700 dark:text-brand-400 mt-1 text-sm font-medium">
                {t("product.saveAmount", { amount: money(product.compare_at_price - price) })}
              </p>
            ) : null}
            {product.short_description ? (
              <p className="text-muted-foreground mt-4 text-pretty">{product.short_description}</p>
            ) : null}
          </div>

          {colors.length ? (
            <div>
              <p className="mb-3 text-sm">
                <span className="font-semibold">{t("product.color")}:</span>{" "}
                <span className="text-muted-foreground">{colorName}</span>
              </p>
              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={t("product.color")}>
                {colors.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    role="radio"
                    aria-checked={c.slug === color}
                    aria-label={c.name}
                    title={c.name}
                    onClick={() => setColor(c.slug)}
                    className={cn(
                      "relative grid size-11 place-items-center rounded-full ring-1 ring-black/10 transition-all dark:ring-white/20",
                      c.slug === color && "ring-foreground ring-offset-background ring-2 ring-offset-2",
                      !c.inStock && "opacity-40",
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    {c.slug === color ? (
                      <Check
                        className={cn(
                          "animate-in zoom-in-95 size-4",
                          isLight(c.hex) ? "text-ink-900" : "text-white",
                        )}
                        strokeWidth={3}
                      />
                    ) : null}
                    {!c.inStock ? (
                      <span
                        aria-hidden
                        className="bg-foreground absolute inset-x-1 top-1/2 h-px -rotate-45"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {sizes.length ? (
            <div id="size-picker">
              <div className="mb-3 flex items-center justify-between">
                <p className={cn("text-sm font-semibold", sizeError && "text-red-600")}>
                  {sizeError && !size ? t("product.selectSize") : t("product.size")}
                </p>
                {product.size_group?.guide?.length ? (
                  <SizeGuide guide={product.size_group.guide} groupName={product.size_group.name} />
                ) : null}
              </div>
              <div
                className={cn(
                  "grid grid-cols-4 gap-2 sm:grid-cols-6",
                  sizeError && !size && "animate-[shake_0.4s_ease-in-out]",
                )}
                role="radiogroup"
                aria-label={t("product.size")}
              >
                {sizes.map((s) => {
                  const v = variantFor(color, s);
                  const out = !v || !v.in_stock;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={s === size}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      dir="ltr"
                      className={cn(
                        "relative h-12 rounded-xl border text-sm font-semibold transition-all active:scale-95",
                        s === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground/50",
                        out && s !== size && "text-muted-foreground line-through decoration-1",
                        sizeError && !size && "border-red-300",
                      )}
                    >
                      {s}
                      {v?.low_stock && s !== size ? (
                        <span className="absolute end-1 top-1 size-1.5 rounded-full bg-amber-500" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {variant?.low_stock ? (
                <p className="animate-in fade-in mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  {t("product.lowStock", { count: variant.stock })}
                </p>
              ) : null}
            </div>
          ) : null}

          {soldOut && variant ? (
            <NotifyMe key={variant.id} variantId={variant.id} />
          ) : (
            <div className="flex items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQty} max={maxQty} />
              <Button
                size="lg"
                className="flex-1"
                onClick={add}
                loading={addToCart.isPending}
                disabled={soldOut}
              >
                <ShoppingBag />
                {addLabel}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="size-13 shrink-0"
                aria-pressed={saved}
                aria-label={saved ? t("product.wishlistRemove") : t("product.wishlistAdd")}
                onClick={() => toggleWishlist.mutate({ slug: product.slug, name: product.name })}
              >
                <Heart className={cn("!size-5", saved && "fill-brand-600 text-brand-600 animate-pop")} />
              </Button>
            </div>
          )}

          <ul className="bg-surface grid gap-3 rounded-2xl p-4 text-sm sm:grid-cols-3">
            <li className="flex items-center gap-2.5">
              <Truck className="text-brand-600 size-[18px] shrink-0" />
              {t("home.perkDelivery")}
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="text-brand-600 size-[18px] shrink-0" />
              {t("home.perkCod")}
            </li>
            <li className="flex items-center gap-2.5">
              <RotateCcw className="text-brand-600 size-[18px] shrink-0" />
              {t("home.perkReturns")}
            </li>
          </ul>

          <Accordion type="multiple" defaultValue={["details"]}>
            <AccordionItem value="details">
              <AccordionTrigger>{t("product.details")}</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {product.description ? <p className="whitespace-pre-line">{product.description}</p> : null}
                {Object.keys(product.specifications ?? {}).length ? (
                  <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5">
                    {Object.entries(product.specifications).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-foreground font-medium">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <p className="text-xs">
                  {t("product.sku")}: <span dir="ltr">{variant?.sku ?? product.sku}</span>
                </p>
              </AccordionContent>
            </AccordionItem>
            {product.material || product.care_instructions ? (
              <AccordionItem value="care">
                <AccordionTrigger>{t("product.materialCare")}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  {product.material ? (
                    <p>
                      <span className="text-foreground font-medium">{t("product.material")}:</span>{" "}
                      {product.material}
                    </p>
                  ) : null}
                  {product.care_instructions ? (
                    <p>
                      <span className="text-foreground font-medium">{t("product.care")}:</span>{" "}
                      {product.care_instructions}
                    </p>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ) : null}
            <AccordionItem value="delivery">
              <AccordionTrigger>{t("product.deliveryReturns")}</AccordionTrigger>
              <AccordionContent className="space-y-2">
                <p>{t("product.deliveryText")}</p>
                <p>{t("product.returnsText")}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <button
            type="button"
            onClick={share}
            className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm font-medium"
          >
            <Share2 className="size-4" />
            {t("product.share")}
          </button>
        </div>
      </div>

      {/* Phone sticky action bar */}
      <div className="border-border safe-bottom fixed inset-x-0 bottom-0 z-30 border-t bg-[var(--header)] p-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-xs">
              {[colorName, size].filter(Boolean).join(" · ") || product.name}
            </p>
            <Price price={price} compare={product.compare_at_price} size="sm" />
          </div>
          {soldOut && variant ? (
            <Button
              size="lg"
              variant="secondary"
              onClick={() =>
                document
                  .getElementById("size-picker")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            >
              <Bell />
              {t("product.notifyMe")}
            </Button>
          ) : (
            <Button size="lg" onClick={add} loading={addToCart.isPending} disabled={soldOut}>
              <ShoppingBag />
              {addLabel}
            </Button>
          )}
        </div>
      </div>
      <div aria-hidden className="h-20 lg:hidden" />
    </div>
  );
}
