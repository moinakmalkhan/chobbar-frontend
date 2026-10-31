"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cartService } from "@/services/cart";
import { useCartStore } from "@/stores/cart-store";

export default function SavedListsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { canOrder } = useAuth();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const lists = useQuery({ queryKey: [...queryKeys.savedLists, page], queryFn: () => cartService.savedLists(page) });
  const addToCart = useMutation({ mutationFn: (id: string) => cartService.addListToCart(id), onSuccess: (r) => { queryClient.invalidateQueries({ queryKey: queryKeys.cart }); notify.action("Added to cart", r.detail, { label: "View cart", onClick: openDrawer }); }, onError: (e) => notify.error(e) });
  const remove = useMutation({ mutationFn: (id: string) => cartService.deleteSavedList(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.savedLists }); notify.success("List deleted"); }, onError: (e) => notify.error(e) });
  const data = lists.data;
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Saved lists</p>
      <h1 className="font-display text-3xl font-bold">Requisition lists</h1>
      <p className="text-sm text-muted-foreground">Save a configured cart once, reorder it every season. Lists are shared with your whole team.</p>
      <div className="mt-5">
        {lists.isLoading ? <Skeleton className="h-40" /> : !data?.results.length ? <EmptyState icon={Bookmark} title="No saved lists" description="Build a cart, then use “Save as list” to keep the configuration for next time." action={<Button asChild><Link href="/products">Start a cart</Link></Button>} /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {data.results.map((l) => (
              <div key={l.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2"><div><Link href={`/account/saved-lists/${l.id}`} className="font-semibold hover:text-brand-600">{l.name}</Link><p className="text-xs text-muted-foreground">{l.item_count} line{l.item_count === 1 ? "" : "s"} · by {l.created_by || "team"} · updated {formatDate(l.updated_at)}</p></div><Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-red-600" onClick={() => remove.mutate(l.id)} aria-label="Delete list"><Trash2 /></Button></div>
                {l.description ? <p className="mt-2 text-sm text-muted-foreground">{l.description}</p> : null}
                <div className="mt-4 flex gap-2"><Button size="sm" onClick={() => addToCart.mutate(l.id)} loading={addToCart.isPending && addToCart.variables === l.id} disabled={!canOrder}><ShoppingBag /> Add to cart</Button><Button size="sm" variant="outline" asChild><Link href={`/account/saved-lists/${l.id}`}>View</Link></Button></div>
              </div>
            ))}
          </div>
        )}
      </div>
      {data ? <Pagination className="mt-5" page={data.page} totalPages={data.total_pages} count={data.count} pageSize={data.page_size} onChange={setPage} /> : null}
    </div>
  );
}
