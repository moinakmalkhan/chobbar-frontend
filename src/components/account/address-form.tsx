"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { fieldErrors } from "@/lib/api";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import type { Address } from "@/types/api";

const schema = z.object({
  kind: z.enum(["shipping", "billing"]),
  label: z.string().max(80).optional(),
  contact_name: z.string().min(1, "Required"),
  contact_phone: z.string().optional(),
  line1: z.string().min(1, "Required"),
  line2: z.string().optional(),
  city: z.string().min(1, "Required"),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().length(2, "2-letter ISO code"),
  is_default: z.boolean(),
});
type Values = z.infer<typeof schema>;

export function AddressForm({ address, onDone }: { address?: Address; onDone: (saved?: Address) => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: address ? { ...address, label: address.label ?? "" } : { kind: "shipping", country: "US", is_default: false, label: "", contact_name: "", contact_phone: "", line1: "", line2: "", city: "", state: "", postal_code: "" },
  });
  const save = useMutation({
    mutationFn: (v: Values) => (address ? accountsService.updateAddress(address.id, v) : accountsService.createAddress(v as Omit<Address, "id">)),
    onSuccess: (saved) => { queryClient.invalidateQueries({ queryKey: queryKeys.addresses }); notify.success(address ? "Address updated" : "Address added"); onDone(saved); },
    onError: (e) => { Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k as keyof Values, { message: m })); notify.error(e, "Couldn't save address"); },
  });
  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="label">Label</Label><Input id="label" placeholder="Clubhouse, Warehouse…" {...register("label")} /></div>
        <div><Label htmlFor="kind">Type</Label><select id="kind" {...register("kind")} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"><option value="shipping">Shipping</option><option value="billing">Billing</option></select></div>
        <div><Label htmlFor="contact_name">Contact name</Label><Input id="contact_name" invalid={!!errors.contact_name} {...register("contact_name")} /><FieldError>{errors.contact_name?.message}</FieldError></div>
        <div><Label htmlFor="contact_phone">Phone</Label><Input id="contact_phone" type="tel" {...register("contact_phone")} /></div>
      </div>
      <div><Label htmlFor="line1">Address line 1</Label><Input id="line1" invalid={!!errors.line1} {...register("line1")} /><FieldError>{errors.line1?.message}</FieldError></div>
      <div><Label htmlFor="line2">Address line 2</Label><Input id="line2" {...register("line2")} /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label htmlFor="city">City</Label><Input id="city" invalid={!!errors.city} {...register("city")} /><FieldError>{errors.city?.message}</FieldError></div>
        <div><Label htmlFor="state">State / region</Label><Input id="state" {...register("state")} /></div>
        <div><Label htmlFor="postal_code">Postal code</Label><Input id="postal_code" {...register("postal_code")} /></div>
        <div><Label htmlFor="country">Country (ISO code)</Label><Input id="country" maxLength={2} className="uppercase" invalid={!!errors.country} {...register("country")} /><FieldError>{errors.country?.message}</FieldError></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-brand-500" {...register("is_default")} /> Make this the default</label>
      <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => onDone()}>Cancel</Button><Button type="submit" loading={save.isPending}>{address ? "Save changes" : "Add address"}</Button></div>
    </form>
  );
}
