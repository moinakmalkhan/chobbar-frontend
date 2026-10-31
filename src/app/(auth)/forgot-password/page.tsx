"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const request = useMutation({ mutationFn: (v: { email: string }) => authService.requestReset(v.email), onError: (e) => notify.error(e) });
  return (
    <AuthCard title="Reset your password" description="Enter the email you signed up with and we'll send a reset link valid for 2 hours." footer={<Link href="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>}>
      {request.isSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <MailCheck className="mb-2 size-6" />
          If an account exists for that address, a reset link is on its way. Check spam if it doesn't arrive in a few minutes.
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => request.mutate(v))} className="space-y-4" noValidate>
          <div><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" invalid={!!errors.email} {...register("email")} /><FieldError>{errors.email?.message}</FieldError></div>
          <Button type="submit" className="w-full" size="lg" loading={request.isPending}>Send reset link</Button>
        </form>
      )}
    </AuthCard>
  );
}
