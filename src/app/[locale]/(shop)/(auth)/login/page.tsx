"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthCard } from "@/components/shared/auth-card";
import { GoogleButton } from "@/components/shared/google-button";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";
import { fieldErrors } from "@/lib/api";
import { safeNext } from "@/lib/next-path";
import { notify } from "@/lib/toast";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { isAuthenticated, hydrated } = useAuth();
  const login = useLogin();
  const schema = useMemo(
    () =>
      z.object({
        email: z.string().trim().email(t("auth.invalidEmail")),
        password: z.string().min(1, t("common.required")),
      }),
    [t],
  );
  const { register, handleSubmit, setError, formState } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (hydrated && isAuthenticated && !login.isPending) router.replace(next);
  }, [hydrated, isAuthenticated, login.isPending, next, router]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
    } catch (e) {
      Object.entries(fieldErrors(e)).forEach(([k, v]) => setError(k as "email" | "password", { message: v }));
      notify.error(e);
    }
  });

  return (
    <AuthCard
      title={t("auth.welcomeBack")}
      subtitle={t("auth.signInSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <Link
            href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-foreground font-semibold underline underline-offset-4"
          >
            {t("auth.createAccount")}
          </Link>
        </>
      }
    >
      <GoogleButton oneTap />
      <div className="text-muted-foreground my-6 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        {t("auth.orEmail")}
        <span className="bg-border h-px flex-1" />
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            invalid={!!formState.errors.email}
            {...register("email")}
          />
          <FieldError>{formState.errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              {t("auth.password")}
            </Label>
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground text-xs font-medium"
            >
              {t("auth.forgot")}
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            invalid={!!formState.errors.password}
            {...register("password")}
          />
          <FieldError>{formState.errors.password?.message}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          {t("auth.signIn")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
