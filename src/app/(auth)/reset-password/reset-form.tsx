"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

const schema = z.object({ password: z.string().min(10, "Use at least 10 characters"), confirm: z.string() }).refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });
  const reset = useMutation({
    mutationFn: (v: Values) => authService.confirmReset(token, v.password),
    onSuccess: (d) => { notify.success("Password updated", d.detail); router.push("/login"); },
    onError: (e) => notify.error(e, "Couldn't reset password"),
  });
  if (!token) return <AuthCard title="Invalid link" description="This reset link is missing its token." footer={<Link href="/forgot-password" className="font-semibold text-brand-600">Request a new link</Link>}><p /></AuthCard>;
  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit((v) => reset.mutate(v))} className="space-y-4" noValidate>
        <div><Label htmlFor="password">New password</Label><Input id="password" type="password" autoComplete="new-password" invalid={!!errors.password} {...register("password")} /><FieldError>{errors.password?.message}</FieldError></div>
        <div><Label htmlFor="confirm">Confirm password</Label><Input id="confirm" type="password" autoComplete="new-password" invalid={!!errors.confirm} {...register("confirm")} /><FieldError>{errors.confirm?.message}</FieldError></div>
        <Button type="submit" className="w-full" size="lg" loading={reset.isPending}>Update password</Button>
      </form>
    </AuthCard>
  );
}
