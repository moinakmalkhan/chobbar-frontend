"use client";

import { Lock, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { CartLine } from "@/components/cart/cart-line";
import { CartTotals } from "@/components/cart/cart-totals";
import { CouponForm } from "@/components/cart/coupon-form";
import { FreeDeliveryProgress } from "@/components/cart/free-delivery";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const { data: cart, isLoading } = useCart();
  const { t, number } = useI18n();
  const pathname = usePathname();
  useEffect(() => close(), [pathname, close]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent
        side="end"
        className="gap-0 p-0"
        closeLabel={t("common.close")}
        aria-describedby={undefined}
      >
        <div className="border-border flex h-16 shrink-0 items-center gap-2 border-b px-5">
          <DialogTitle className="text-lg">{t("cart.title")}</DialogTitle>
          {cart?.quantity ? (
            <span className="bg-muted rounded-full px-2 py-0.5 text-xs font-semibold">
              {number(cart.quantity)}
            </span>
          ) : null}
        </div>
        {isLoading ? (
          <div className="space-y-5 p-5">
            {[0, 1].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-[120px] w-24" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t("cart.empty")}
            description={t("cart.emptyHint")}
            className="flex-1"
            action={
              <Button asChild onClick={close}>
                <Link href="/collections/new-arrivals">{t("common.shopNow")}</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
              <FreeDeliveryProgress
                subtotal={cart.subtotal - cart.discount}
                freeShipping={cart.free_shipping}
              />
              {cart.issues.length ? (
                <div className="rounded-2xl bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  {cart.issues.map((i) => (
                    <p key={i}>{i}</p>
                  ))}
                </div>
              ) : null}
              {cart.items.map((item) => (
                <CartLine key={item.id} item={item} compact onNavigate={close} />
              ))}
            </div>
            <div className="border-border bg-background safe-bottom shrink-0 space-y-4 border-t p-5">
              <CouponForm cart={cart} />
              <CartTotals
                subtotal={cart.subtotal}
                discount={cart.discount}
                freeShipping={cart.free_shipping}
              />
              <div className="grid gap-2">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout" onClick={close}>
                    <Lock />
                    {t("cart.checkout")}
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/cart" onClick={close}>
                    {t("cart.viewBag")}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
