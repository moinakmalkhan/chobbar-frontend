"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/shared/auth-card";
import { GoogleButton } from "@/components/shared/google-button";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { fieldErrors } from "@/lib/api";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

const BUSINESS_TYPES = [["club", "Sports club"], ["school", "School / University"], ["retailer", "Retailer / Team store"], ["distributor", "Distributor / Wholesaler"], ["brand", "Private label brand"], ["other", "Other"]] as const;
const COUNTRIES = [["US", "United States"], ["GB", "United Kingdom"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"], ["AU", "Australia"], ["CA", "Canada"], ["AE", "United Arab Emirates"], ["SA", "Saudi Arabia"], ["PK", "Pakistan"], ["ZA", "South Africa"], ["IT", "Italy"], ["ES", "Spain"], ["SE", "Sweden"], ["NO", "Norway"], ["IE", "Ireland"], ["NZ", "New Zealand"]] as const;

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().optional(),
  email: z.string().email("Enter a valid work email"),
  phone: z.string().optional(),
  password: z.string().min(10, "Use at least 10 characters"),
  company_name: z.string().min(2, "Enter your club or company name"),
  business_type: z.string(),
  country: z.string().length(2),
});
type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const { completeLogin } = useAuth();
  const { register, handleSubmit, setValue, watch, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { business_type: "club", country: "US" } });

  const signup = useMutation({
    mutationFn: (v: Values) => authService.register(v),
    onSuccess: (data) => {
      completeLogin(data, "/account?welcome=1");
      notify.info("Verify your email", "We sent a confirmation link — verify to unlock ordering.");
    },
    onError: (e) => {
      const fe = fieldErrors(e);
      Object.entries(fe).forEach(([k, msg]) => setError(k as keyof Values, { message: msg }));
      notify.error(e, "Couldn't create your account");
    },
  });
  const google = useMutation({ mutationFn: authService.google, onSuccess: (d) => completeLogin(d, "/account"), onError: (e) => notify.error(e, "Google sign-up failed") });
  const onGoogle = useCallback((t: string) => google.mutate(t), [google]);

  return (
    <AuthCard title="Open a wholesale account" description="Free, takes a minute. You'll see wholesale prices immediately; net terms unlock after verification." footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></>}>
      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={handleSubmit((v) => signup.mutate(v))} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="first_name">First name</Label><Input id="first_name" autoComplete="given-name" invalid={!!errors.first_name} {...register("first_name")} /><FieldError>{errors.first_name?.message}</FieldError></div>
          <div><Label htmlFor="last_name">Last name</Label><Input id="last_name" autoComplete="family-name" {...register("last_name")} /></div>
        </div>
        <div><Label htmlFor="email">Work email</Label><Input id="email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} /><FieldError>{errors.email?.message}</FieldError></div>
        <div><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="new-password" invalid={!!errors.password} {...register("password")} /><FieldError>{errors.password?.message}</FieldError><Hint>At least 10 characters. Mix letters, numbers and symbols.</Hint></div>
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your organisation</p>
          <div className="space-y-3">
            <div><Label htmlFor="company_name">Club / company name</Label><Input id="company_name" autoComplete="organization" invalid={!!errors.company_name} {...register("company_name")} /><FieldError>{errors.company_name?.message}</FieldError></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Type</Label>
                <Select value={watch("business_type")} onValueChange={(v) => setValue("business_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BUSINESS_TYPES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Country</Label>
                <Select value={watch("country")} onValueChange={(v) => setValue("country", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label htmlFor="phone">Phone (optional)</Label><Input id="phone" type="tel" autoComplete="tel" {...register("phone")} /></div>
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={signup.isPending}>Create account</Button>
        <p className="text-center text-xs text-muted-foreground">By continuing you agree to our <Link href="/terms" className="underline">terms of sale</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.</p>
      </form>
    </AuthCard>
  );
}
