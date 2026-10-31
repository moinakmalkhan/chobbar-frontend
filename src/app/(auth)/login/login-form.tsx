"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/shared/auth-card";
import { GoogleButton } from "@/components/shared/google-button";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

const schema = z.object({ email: z.string().email("Enter a valid email"), password: z.string().min(1, "Enter your password") });
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const { completeLogin } = useAuth();
  const next = useSearchParams().get("next");
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) });

  const login = useMutation({
    mutationFn: (v: Values) => authService.login(v.email, v.password),
    onSuccess: (data) => completeLogin(data, next),
    onError: (e) => notify.error(e, "Sign in failed"),
  });
  const google = useMutation({
    mutationFn: (token: string) => authService.google(token),
    onSuccess: (data) => completeLogin(data, next),
    onError: (e) => notify.error(e, "Google sign-in failed"),
  });
  const onGoogle = useCallback((token: string) => google.mutate(token), [google]);

  return (
    <AuthCard title="Welcome back" description="Sign in to see your wholesale pricing, quotes and orders." footer={<>New to Leepa Sports? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Open a company account</Link></>}>
      <GoogleButton onCredential={onGoogle} text="signin_with" />
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or with email<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@club.com" invalid={!!errors.email} {...register("email")} />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between"><Label htmlFor="password">Password</Label><Link href="/forgot-password" className="mb-1.5 text-xs font-medium text-brand-600 hover:underline">Forgot password?</Link></div>
          <div className="relative">
            <Input id="password" type={show ? "text" : "password"} autoComplete="current-password" invalid={!!errors.password} className="pr-11" {...register("password")} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
          </div>
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={login.isPending}>Sign in</Button>
      </form>
    </AuthCard>
  );
}
