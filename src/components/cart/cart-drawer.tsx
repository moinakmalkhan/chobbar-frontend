"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useCartMutations } from "@/hooks/use-cart";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";

export function CartDrawer() {
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const { data: cart, isLoading } = useCart({ enabled: open });
  const { remove } = useCartMutations();
  const items = cart?.items ?? [];
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent side="right" className="gap-0 p-0">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-brand-500" /> Your order
            {cart?.quantity ? <span className="text-sm font-normal text-muted-foreground">· {cart.quantity} pcs</span> : null}
          </DialogTitle>
          <DialogDescription>Prices update automatically with your quantities and fabrics.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-5">
          {isLoading && !cart ? (
            <div className="space-y-4 py-5">{[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
          ) : items.length ? (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <CartLine key={item.id} item={item} currency={cart!.currency} compact onRemove={(id) => remove.mutate(id)} busy={remove.isPending} />
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Configure a product — pick a fabric, enter sizes per gender — and it will show up here with live pricing." action={<Button onClick={close} asChild><Link href="/products">Browse products</Link></Button>} className="my-6 border-0" />
          )}
        </div>
        {items.length ? (
          <div className="border-t border-border bg-surface p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal (ex-works)</span>
              <span className="text-lg font-bold tabular-nums">{formatMoney(cart!.subtotal, cart!.currency)}</span>
            </div>
            {Number(cart!.savings) > 0 ? <p className="mt-0.5 text-xs text-emerald-600">You're saving {formatMoney(cart!.savings, cart!.currency)} with volume pricing.</p> : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" asChild onClick={close}><Link href="/cart">Review cart</Link></Button>
              <Button asChild onClick={close}><Link href="/checkout">Checkout <ArrowRight /></Link></Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Prefer a negotiated price? <Link href="/cart" onClick={close} className="font-medium text-brand-600 underline">Request a quote</Link> from the cart.</p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
