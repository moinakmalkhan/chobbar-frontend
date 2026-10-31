"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookmarkPlus, MessageSquareQuote, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { CartLine } from "@/components/cart/cart-line";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useCart, useCartMutations } from "@/hooks/use-cart";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { formatMoney } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import { cartService } from "@/services/cart";
import { quotesService } from "@/services/quotes";
import type { CartItem } from "@/types/api";

export function CartPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, hydrated, canOrder, company, user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const { remove, update, clear, setNotes } = useCartMutations();
  const [quoteOpen, setQuoteOpen] = useState(sp.get("quote") === "1");
  const [saveOpen, setSaveOpen] = useState(false);
  const debouncedNotes = useDebouncedCallback((v: string) => setNotes.mutate(v), 600);

  const onChangeQty = (item: CartItem, size_id: number, gender: string, quantity: number) => {
    const breakdown = item.breakdown.map((l) => (l.size_id === size_id && l.gender === gender ? { ...l, quantity } : l)).filter((l) => l.quantity > 0).map((l) => ({ gender: l.gender, size_id: l.size_id, quantity: l.quantity }));
    if (!breakdown.length) return remove.mutate(item.id);
    update.mutate({ id: item.id, payload: { breakdown } });
  };

  if (!hydrated || (isLoading && !cart)) {
    return <div className="container-x py-10"><Skeleton className="h-8 w-48" /><Skeleton className="mt-6 h-40 w-full" /></div>;
  }
  const items = cart?.items ?? [];
  const hasErrors = items.some((i) => i.price_breakdown?.error);

  return (
    <div className="container-x py-8 lg:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 1 of 2</p><h1 className="font-display text-3xl font-bold">Your order</h1></div>
        {items.length ? (
          <div className="flex gap-2">
            {isAuthenticated && company ? <Button variant="outline" size="sm" onClick={() => setSaveOpen(true)}><BookmarkPlus /> Save as list</Button> : null}
            <Button variant="ghost" size="sm" onClick={() => clear.mutate()} loading={clear.isPending} className="text-muted-foreground"><Trash2 /> Clear</Button>
          </div>
        ) : null}
      </div>

      {!items.length ? (
        <EmptyState icon={ShoppingBag} title="Nothing here yet" description="Configure a product to see live wholesale pricing, or paste SKUs into quick order." action={<div className="flex gap-2"><Button asChild><Link href="/products">Browse products</Link></Button><Button variant="outline" asChild><Link href="/quick-order">Quick order</Link></Button></div>} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <section>
            <div className="divide-y divide-border rounded-2xl border border-border bg-card px-5">
              {items.map((item) => <CartLine key={item.id} item={item} currency={cart!.currency} onRemove={(id) => remove.mutate(id)} onChangeQty={onChangeQty} busy={update.isPending || remove.isPending} />)}
            </div>
            <div className="mt-6">
              <Label htmlFor="order-notes">Notes for our team (optional)</Label>
              <Textarea id="order-notes" defaultValue={cart!.notes} onChange={(e) => debouncedNotes(e.target.value)} placeholder="Delivery deadline, artwork details, packing instructions…" />
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="font-display text-lg font-bold">Summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">{cart!.item_count} line{cart!.item_count === 1 ? "" : "s"} · {cart!.quantity} pcs</dt><dd className="tabular-nums">{formatMoney(cart!.subtotal, cart!.currency)}</dd></div>
                {Number(cart!.savings) > 0 ? <div className="flex justify-between text-emerald-600"><dt>Volume & group savings</dt><dd className="tabular-nums">−{formatMoney(cart!.savings, cart!.currency)}</dd></div> : null}
                <div className="flex justify-between"><dt className="text-muted-foreground">Freight</dt><dd className="text-muted-foreground">Estimated at checkout</dd></div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-bold"><dt>Subtotal (ex-works)</dt><dd className="tabular-nums">{formatMoney(cart!.subtotal, cart!.currency)}</dd></div>
              </dl>
              {hasErrors ? <p className="mt-3 text-xs font-medium text-red-600">Fix the highlighted lines before checking out.</p> : null}
              <div className="mt-5 space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Button className="w-full" size="lg" asChild><Link href="/login?next=/checkout">Sign in to checkout <ArrowRight /></Link></Button>
                    <p className="text-center text-xs text-muted-foreground">Your cart is saved and will merge into your account.</p>
                  </>
                ) : !company ? (
                  <Button className="w-full" size="lg" asChild><Link href="/account/company">Set up your company to order</Link></Button>
                ) : !canOrder ? (
                  <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Your role ({user?.memberships[0]?.role}) can't place orders. Ask a company admin.</p>
                ) : (
                  <>
                    <Button className="w-full" size="lg" disabled={hasErrors} onClick={() => router.push("/checkout")}>Proceed to checkout <ArrowRight /></Button>
                    <Button className="w-full" size="lg" variant="outline" disabled={hasErrors} onClick={() => setQuoteOpen(true)}><MessageSquareQuote /> Request a quote instead</Button>
                  </>
                )}
              </div>
              <ul className="mt-5 space-y-1.5 text-xs text-muted-foreground">
                <li>• Prices recalculated live from current fabric rates.</li>
                <li>• Quotes are answered within 1 business day and convert to orders.</li>
                <li>• Net terms and PO numbers supported for verified companies.</li>
              </ul>
            </div>
          </aside>
        </div>
      )}

      <RequestQuoteDialog open={quoteOpen} onOpenChange={setQuoteOpen} />
      <SaveListDialog open={saveOpen} onOpenChange={setSaveOpen} onSaved={() => queryClient.invalidateQueries({ queryKey: queryKeys.savedLists })} />
    </div>
  );
}

function RequestQuoteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, company } = useAuth();
  const addresses = useQuery({ queryKey: queryKeys.addresses, queryFn: accountsService.addresses, enabled: open && isAuthenticated && !!company });
  const [notes, setNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [address, setAddress] = useState<string>("");
  const request = useMutation({
    mutationFn: () => quotesService.request({ customer_notes: notes, target_budget: budget ? Number(budget) : null, delivery_deadline: deadline || null, shipping_address: address || null }),
    onSuccess: (quote) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      notify.success(`Quote request ${quote.number} sent`, "We'll reply within one business day.");
      onOpenChange(false);
      router.push(`/account/quotes/${quote.id}`);
    },
    onError: (e) => notify.error(e, "Couldn't send quote request"),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Request a quote</DialogTitle><DialogDescription>We'll send your configured cart to sales. They reply with negotiated unit prices you can accept online.</DialogDescription></DialogHeader>
        {!isAuthenticated ? (
          <div className="space-y-3"><p className="text-sm text-muted-foreground">Sign in so we can attach the quote to your company.</p><Button asChild><Link href="/login?next=/cart?quote=1">Sign in</Link></Button></div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); request.mutate(); }}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="budget">Target budget / piece (optional)</Label><Input id="budget" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 6.50" /></div>
              <div><Label htmlFor="deadline">Needed by (optional)</Label><Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
            </div>
            {addresses.data?.length ? (
              <div><Label>Ship to</Label><Select value={address} onValueChange={setAddress}><SelectTrigger><SelectValue placeholder="Choose an address (optional)" /></SelectTrigger><SelectContent>{addresses.data.map((a) => <SelectItem key={a.id} value={a.id}>{a.label || a.line1}, {a.city}</SelectItem>)}</SelectContent></Select></div>
            ) : null}
            <div><Label htmlFor="qnotes">Anything we should know?</Label><Textarea id="qnotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sponsor logos, special packaging, season timeline…" /></div>
            <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={request.isPending}>Send quote request</Button></DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SaveListDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (o: boolean) => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const save = useMutation({
    mutationFn: () => cartService.saveCartAsList(name.trim()),
    onSuccess: (list) => { notify.success(`Saved “${list.name}”`, "Reorder it any time from Saved lists."); onSaved(); onOpenChange(false); setName(""); },
    onError: (e) => notify.error(e),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Save cart as a list</DialogTitle><DialogDescription>Named lists are shared with your team and can be added to the cart in one click.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save.mutate(); }}>
          <div><Label htmlFor="list-name">List name</Label><Input id="list-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. First team home kit 26/27" autoFocus /></div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={save.isPending} disabled={!name.trim()}>Save list</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
