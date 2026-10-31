"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/account/account-shell";
import { AddressDialog } from "@/components/account/address-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/client";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import type { Address } from "@/types/api";

export default function AddressesPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: queryKeys.addresses, queryFn: accountsService.addresses });
  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
  const remove = useMutation({
    mutationFn: accountsService.deleteAddress,
    onSuccess: () => {
      refresh();
      notify.success(t("account.addressRemoved"));
    },
    onError: (e) => notify.error(e),
  });
  const makeDefault = useMutation({
    mutationFn: (id: string) => accountsService.updateAddress(id, { is_default: true }),
    onSuccess: refresh,
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageTitle
        title={t("account.addresses")}
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus />
            {t("account.addAddress")}
          </Button>
        }
      />
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      ) : data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((a) => (
            <div
              key={a.id}
              className="border-border bg-card animate-in fade-in flex flex-col rounded-3xl border p-5"
            >
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="text-brand-600 size-4" />
                <span className="font-semibold">{t(`account.labels.${a.label}`)}</span>
                {a.is_default ? <Badge variant="soft">{t("common.default")}</Badge> : null}
              </div>
              <address className="text-muted-foreground flex-1 space-y-0.5 text-sm not-italic">
                <p className="text-foreground">{a.full_name}</p>
                <p>{[a.line1, a.line2].filter(Boolean).join(", ")}</p>
                <p>{[a.city, a.province, a.postal_code].filter(Boolean).join(", ")}</p>
                <p dir="ltr" className="rtl:text-right">
                  {a.phone}
                </p>
              </address>
              <div className="mt-4 flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditing(a);
                    setOpen(true);
                  }}
                >
                  <Pencil />
                  {t("common.edit")}
                </Button>
                {!a.is_default ? (
                  <Button variant="ghost" size="sm" onClick={() => makeDefault.mutate(a.id)}>
                    <Star />
                    {t("account.makeDefault")}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => remove.mutate(a.id)}
                >
                  <Trash2 />
                  {t("common.delete")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={MapPin} title={t("account.noAddresses")} />
      )}
      <AddressDialog address={editing} open={open} onOpenChange={setOpen} />
    </>
  );
}
