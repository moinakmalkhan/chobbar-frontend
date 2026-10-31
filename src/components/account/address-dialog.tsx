"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { useI18n } from "@/i18n/client";
import { fieldErrors } from "@/lib/api";
import { PK_CITIES, PK_PROVINCES, isValidPkPhone, provinceForCity } from "@/lib/pk";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { accountsService } from "@/services/accounts";
import type { Address } from "@/types/api";

export function AddressDialog({
  address,
  open,
  onOpenChange,
}: {
  address?: Address | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const schema = useMemo(
    () =>
      z.object({
        label: z.enum(["home", "work", "other"]),
        full_name: z.string().trim().min(2, t("common.required")),
        phone: z.string().trim().refine(isValidPkPhone, t("checkout.invalidPhone")),
        line1: z.string().trim().min(4, t("common.required")),
        line2: z.string().trim(),
        city: z.string().trim().min(2, t("common.required")),
        province: z.string(),
        postal_code: z.string().trim(),
        is_default: z.boolean(),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const empty: Values = {
    label: "home",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postal_code: "",
    is_default: false,
  };
  const { register, handleSubmit, reset, setValue, setError, watch, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: empty,
  });

  useEffect(() => {
    if (open) reset(address ? { ...empty, ...address } : empty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, address, reset]);

  const save = useMutation({
    mutationFn: (v: Values) =>
      address
        ? accountsService.updateAddress(address.id, { ...v, country: "PK" })
        : accountsService.createAddress({ ...v, country: "PK" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.addresses });
      notify.success(t("account.addressSaved"));
      onOpenChange(false);
    },
    onError: (e) => {
      Object.entries(fieldErrors(e)).forEach(([k, v]) => setError(k as keyof Values, { message: v }));
      notify.error(e);
    },
  });
  const label = watch("label");
  const err = formState.errors;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("common.close")} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{address ? t("account.editAddress") : t("account.addAddress")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((v) => save.mutate(v))} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-2 sm:col-span-2">
            {(["home", "work", "other"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setValue("label", l)}
                aria-pressed={label === l}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm",
                  label === l ? "border-foreground bg-foreground text-background" : "border-border",
                )}
              >
                {t(`account.labels.${l}`)}
              </button>
            ))}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-name">{t("checkout.fullName")}</Label>
            <Input id="a-name" autoComplete="name" invalid={!!err.full_name} {...register("full_name")} />
            <FieldError>{err.full_name?.message}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-phone">{t("checkout.phone")}</Label>
            <Input
              id="a-phone"
              type="tel"
              dir="ltr"
              className="rtl:text-right"
              autoComplete="tel"
              invalid={!!err.phone}
              {...register("phone")}
            />
            <FieldError>{err.phone?.message}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-line1">{t("checkout.line1")}</Label>
            <Input id="a-line1" autoComplete="address-line1" invalid={!!err.line1} {...register("line1")} />
            <FieldError>{err.line1?.message}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="a-line2">{t("checkout.line2")}</Label>
            <Input id="a-line2" autoComplete="address-line2" {...register("line2")} />
          </div>
          <div>
            <Label htmlFor="a-city">{t("checkout.city")}</Label>
            <Input
              id="a-city"
              list="a-cities"
              autoComplete="address-level2"
              invalid={!!err.city}
              {...register("city", {
                onChange: (e) =>
                  provinceForCity(e.target.value) && setValue("province", provinceForCity(e.target.value)!),
              })}
            />
            <datalist id="a-cities">
              {Object.keys(PK_CITIES).map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <FieldError>{err.city?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="a-province">{t("checkout.province")}</Label>
            <select
              id="a-province"
              {...register("province")}
              className="border-border bg-card focus:border-brand-500 h-12 w-full rounded-xl border px-3 text-sm outline-none"
            >
              <option value="">—</option>
              {PK_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="a-postal">{t("checkout.postalCode")}</Label>
            <Input
              id="a-postal"
              inputMode="numeric"
              dir="ltr"
              className="rtl:text-right"
              {...register("postal_code")}
            />
          </div>
          <label className="flex items-center gap-2.5 self-end pb-3 text-sm">
            <Checkbox
              checked={watch("is_default")}
              onCheckedChange={(v) => setValue("is_default", v === true)}
            />
            {t("account.makeDefault")}
          </label>
          <Button type="submit" size="lg" className="sm:col-span-2" loading={save.isPending}>
            {t("common.save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
