"use client";

import { Lock, ShoppingBag } from "lucide-react";

import { CartLine } from "@/components/cart/cart-line";
import { CartTotals } from "@/components/cart/cart-totals";
import { CouponForm } from "@/components/cart/coupon-form";
import { FreeDeliveryProgress } from "@/components/cart/free-delivery";
import { ForYou, RecentlyViewed } from "@/components/home/home-sections";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";

export default function CartPage() {
  const { t, number } = useI18n();
  const { data: cart, isLoading } = useCart();

  return (
    <>
      <div className="container-x py-8">
        <Breadcrumbs items={[{ label: t("nav.home"), href: "/" }, { label: t("cart.title") }]} />
        <h1 className="font-display mb-8 text-3xl font-extrabold">
          {t("cart.title")}
          {cart?.quantity ? (
            <span className="text-muted-foreground ms-2 text-lg font-semibold">
              ({number(cart.quantity)})
            </span>
          ) : null}
        </h1>
        {isLoading ? (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-72" />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t("cart.empty")}
            description={t("cart.emptyHint")}
            action={
              <Button asChild size="lg">
                <Link href="/collections/new-arrivals">{t("common.shopNow")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <FreeDeliveryProgress
                subtotal={cart.subtotal - cart.discount}
                freeShipping={cart.free_shipping}
              />
              {cart.issues.length ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  {cart.issues.map((i) => (
                    <p key={i}>{i}</p>
                  ))}
                </div>
              ) : null}
              <div className="divide-border border-border bg-card divide-y rounded-3xl border">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5">
                    <CartLine item={item} />
                  </div>
                ))}
              </div>
              <Link
                href="/products"
                className="text-muted-foreground hover:text-foreground inline-block text-sm font-medium underline-offset-4 hover:underline"
              >
                {t("cart.continueShopping")}
              </Link>
            </div>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border-border bg-card space-y-5 rounded-3xl border p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">{t("checkout.summary")}</h2>
                <CouponForm cart={cart} />
                <CartTotals
                  subtotal={cart.subtotal}
                  discount={cart.discount}
                  freeShipping={cart.free_shipping}
                />
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">
                    <Lock />
                    {t("cart.checkout")}
                  </Link>
                </Button>
                <p className="text-muted-foreground text-center text-xs">{t("cart.secure")}</p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <ForYou />
      <RecentlyViewed />
    </>
  );
}
