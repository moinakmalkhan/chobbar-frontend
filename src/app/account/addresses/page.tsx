"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AddressForm } from "@/components/account/address-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import type { Address } from "@/types/api";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { canOrder, canManage } = useAuth();
  const addresses = useQuery({ queryKey: queryKeys.addresses, queryFn: accountsService.addresses });
  const [editing, setEditing] = useState<Address | null | "new">(null);
  const remove = useMutation({ mutationFn: (id: string) => accountsService.deleteAddress(id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.addresses }); notify.success("Address removed"); }, onError: (e) => notify.error(e) });
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Addresses</p><h1 className="font-display text-3xl font-bold">Shipping & billing</h1></div>{canOrder ? <Button onClick={() => setEditing("new")}><Plus /> Add address</Button> : null}</div>
      <div className="mt-5">
        {addresses.isLoading ? <Skeleton className="h-40" /> : !addresses.data?.length ? <EmptyState icon={MapPin} title="No addresses yet" description="Add the clubhouse, school or warehouse you ship to." action={canOrder ? <Button onClick={() => setEditing("new")}>Add address</Button> : undefined} /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.data.map((a) => (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5 text-sm">
                <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="font-semibold">{a.label || a.contact_name}</span><Badge variant="outline" className="capitalize">{a.kind}</Badge>{a.is_default ? <Badge variant="soft">Default</Badge> : null}</div><div className="flex gap-1">{canOrder ? <Button variant="ghost" size="icon-sm" onClick={() => setEditing(a)} aria-label="Edit"><Pencil /></Button> : null}{canManage ? <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-red-600" onClick={() => remove.mutate(a.id)} aria-label="Delete"><Trash2 /></Button> : null}</div></div>
                <p className="mt-2 text-muted-foreground">{a.contact_name}{a.contact_phone ? ` · ${a.contact_phone}` : ""}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}{a.state ? `, ${a.state}` : ""} {a.postal_code}<br />{a.country}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent><DialogHeader><DialogTitle>{editing === "new" ? "New address" : "Edit address"}</DialogTitle></DialogHeader><AddressForm address={editing && editing !== "new" ? editing : undefined} onDone={() => setEditing(null)} /></DialogContent>
      </Dialog>
    </div>
  );
}
