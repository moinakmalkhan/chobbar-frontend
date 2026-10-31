"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Building2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Hint, Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { fieldErrors } from "@/lib/api";
import { formatMoney, PAYMENT_TERMS_LABELS } from "@/lib/format";
import { queryKeys } from "@/lib/query-client";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";
import { authService } from "@/services/auth";

const schema = z.object({ name: z.string().min(2), legal_name: z.string().optional(), business_type: z.string(), tax_id: z.string().optional(), website: z.string().url().or(z.literal("")).optional(), email: z.string().email().or(z.literal("")).optional(), phone: z.string().optional(), country: z.string().length(2), approval_threshold: z.string().optional() });
type Values = z.infer<typeof schema>;

export default function CompanyPage() {
  const queryClient = useQueryClient();
  const { company: brief, canManage, setUser, setCompany } = useAuth();
  const company = useQuery({ queryKey: queryKeys.company, queryFn: accountsService.company, enabled: !!brief, retry: false });
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { business_type: "club", country: "US" } });
  useEffect(() => { if (company.data) reset({ ...company.data, approval_threshold: String(company.data.approval_threshold ?? 0) } as Values); }, [company.data, reset]);

  const save = useMutation({
    mutationFn: (v: Values) => {
      const payload = { ...v, approval_threshold: v.approval_threshold ? Number(v.approval_threshold) : 0 };
      return brief ? accountsService.updateCompany(payload) : accountsService.createCompany(payload);
    },
    onSuccess: async (saved) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company });
      if (!brief) {
        // New company → refresh the profile so the membership (and acting company) is known client-side.
        const me = await authService.me();
        setUser(me);
        setCompany(saved.id);
        queryClient.invalidateQueries();
      }
      notify.success(brief ? "Company updated" : "Company created", brief ? undefined : "You can now order and invite your team.");
    },
    onError: (e) => { Object.entries(fieldErrors(e)).forEach(([k, m]) => setError(k as keyof Values, { message: m })); notify.error(e, "Couldn't save"); },
  });
  const disabled = Boolean(brief) && !canManage;

  return (
    <div className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Company</p><h1 className="font-display text-3xl font-bold">{brief ? brief.name : "Create your company"}</h1>{!brief ? <p className="text-sm text-muted-foreground">Orders, quotes and team access are tied to a company account.</p> : null}</div>
      {brief ? (
        company.isLoading ? <Skeleton className="h-28" /> : company.data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile label="Status" value={company.data.is_verified ? <span className="inline-flex items-center gap-1 text-emerald-600"><BadgeCheck className="size-4" /> Verified</span> : <Badge variant="warning">Pending verification</Badge>} hint={company.data.is_verified ? "Net terms available" : "Verification unlocks net terms"} />
            <Tile label="Payment terms" value={PAYMENT_TERMS_LABELS[company.data.payment_terms]} hint="Set by Leepa Sports" />
            <Tile label="Credit" value={Number(company.data.credit_limit) ? `${formatMoney(company.data.credit_available, company.data.currency)} available` : "—"} hint={Number(company.data.credit_limit) ? `of ${formatMoney(company.data.credit_limit, company.data.currency)} limit` : "No credit line yet"} />
            <Tile label="Pricing group" value={company.data.customer_group ?? "Standard"} hint={`${company.data.member_count} team member${company.data.member_count === 1 ? "" : "s"}`} />
          </div>
        ) : null
      ) : null}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4 text-brand-500" /> Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => save.mutate(v))} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div><Label htmlFor="name">Company / club name</Label><Input id="name" disabled={disabled} invalid={!!errors.name} {...register("name")} /><FieldError>{errors.name?.message}</FieldError></div>
            <div><Label htmlFor="legal_name">Legal name</Label><Input id="legal_name" disabled={disabled} {...register("legal_name")} /></div>
            <div><Label htmlFor="business_type">Type</Label><select id="business_type" disabled={disabled} {...register("business_type")} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">{[["club", "Sports club"], ["school", "School / University"], ["retailer", "Retailer / Team store"], ["distributor", "Distributor"], ["brand", "Brand"], ["other", "Other"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
            <div><Label htmlFor="country">Country (ISO)</Label><Input id="country" maxLength={2} className="uppercase" disabled={disabled} invalid={!!errors.country} {...register("country")} /></div>
            <div><Label htmlFor="tax_id">Tax / VAT id</Label><Input id="tax_id" disabled={disabled} {...register("tax_id")} /></div>
            <div><Label htmlFor="website">Website</Label><Input id="website" placeholder="https://" disabled={disabled} invalid={!!errors.website} {...register("website")} /><FieldError>{errors.website?.message}</FieldError></div>
            <div><Label htmlFor="email">Billing email</Label><Input id="email" type="email" disabled={disabled} {...register("email")} /></div>
            <div><Label htmlFor="phone">Phone</Label><Input id="phone" disabled={disabled} {...register("phone")} /></div>
            {brief ? <div className="sm:col-span-2"><Label htmlFor="approval_threshold">Approval threshold ({brief.currency})</Label><Input id="approval_threshold" inputMode="decimal" disabled={disabled} {...register("approval_threshold")} /><Hint>Buyers' orders above this subtotal need an owner/admin approval. 0 disables approvals (per-member limits still apply).</Hint></div> : null}
            {!disabled ? <div className="sm:col-span-2"><Button type="submit" loading={save.isPending}>{brief ? "Save changes" : "Create company"}</Button></div> : <p className="text-xs text-muted-foreground sm:col-span-2">Only owners and admins can edit company details.</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return <div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p><p className="text-xs text-muted-foreground">{hint}</p></div>;
}
