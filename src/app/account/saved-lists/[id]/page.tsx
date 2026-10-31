"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GENDER_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cartService } from "@/services/cart";
import { useCartStore } from "@/stores/cart-store";

export default function SavedListDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const list = useQuery({ queryKey: queryKeys.savedList(id), queryFn: () => cartService.savedList(id) });
  const addToCart = useMutation({ mutationFn: () => cartService.addListToCart(id), onSuccess: (r) => { queryClient.invalidateQueries({ queryKey: queryKeys.cart }); notify.action("Added to cart", r.detail, { label: "View cart", onClick: openDrawer }); }, onError: (e) => notify.error(e) });
  if (list.isLoading) return <Skeleton className="h-64" />;
  if (!list.data) return <p className="text-sm text-muted-foreground">List not found.</p>;
  const l = list.data;
  return (
    <div className="space-y-5">
      <Link href="/account/saved-lists" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Saved lists</Link>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-display text-3xl font-bold">{l.name}</h1>{l.description ? <p className="text-muted-foreground">{l.description}</p> : null}</div><Button onClick={() => addToCart.mutate()} loading={addToCart.isPending}><ShoppingBag /> Add all to cart</Button></div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {l.items.map((i) => (
          <div key={i.id} className="flex gap-4 p-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">{i.product.image ? <Image src={i.product.image.url} alt="" fill sizes="64px" className="object-cover" /> : null}</div>
            <div className="min-w-0 flex-1"><Link href={`/products/${i.product.slug}`} className="font-semibold hover:text-brand-600">{i.product.name}</Link><p className="text-xs text-muted-foreground">{i.fabric ?? i.product.base_fabric}{i.color ? ` · ${i.color}` : ""}</p><p className="mt-1 text-xs">{i.breakdown.map((b) => `${GENDER_LABELS[b.gender]?.[0]} ${b.size}×${b.quantity}`).join(", ")}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
