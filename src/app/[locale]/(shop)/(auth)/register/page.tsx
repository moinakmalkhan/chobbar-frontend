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
import { FieldError, Hint, Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/misc";
import { useAuth, useRegister } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { Link, useRouter } from "@/i18n/link";
import { fieldErrors } from "@/lib/api";
import { safeNext } from "@/lib/next-path";
import { isValidPkPhone } from "@/lib/pk";
import { notify } from "@/lib/toast";

function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const { isAuthenticated, hydrated } = useAuth();
  const registerUser = useRegister();
  const schema = useMemo(
    () =>
      z.object({
        first_name: z.string().trim().min(1, t("common.required")),
        last_name: z.string().trim().optional(),
        email: z.string().trim().email(t("auth.invalidEmail")),
        phone: z
          .string()
          .trim()
          .optional()
          .refine((v) => !v || isValidPkPhone(v), t("checkout.invalidPhone")),
        password: z.string().min(10, t("auth.minPassword")),
        marketing_opt_in: z.boolean(),
      }),
    [t],
  );
  type Values = z.infer<typeof schema>;
  const { register, handleSubmit, setError, setValue, watch, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { email: sp.get("email") ?? "", marketing_opt_in: true },
  });

  useEffect(() => {
    if (hydrated && isAuthenticated && !registerUser.isPending) router.replace(next);
  }, [hydrated, isAuthenticated, registerUser.isPending, next, router]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser.mutateAsync(values);
    } catch (e) {
      Object.entries(fieldErrors(e)).forEach(([k, v]) => setError(k as keyof Values, { message: v }));
      notify.error(e);
    }
  });

  return (
    <AuthCard
      title={t("auth.createTitle")}
      subtitle={t("auth.createSubtitle")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="text-foreground font-semibold underline underline-offset-4">
            {t("auth.signIn")}
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">{t("auth.firstName")}</Label>
            <Input
              id="first_name"
              autoComplete="given-name"
              invalid={!!formState.errors.first_name}
              {...register("first_name")}
            />
            <FieldError>{formState.errors.first_name?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="last_name">{t("auth.lastName")}</Label>
            <Input id="last_name" autoComplete="family-name" {...register("last_name")} />
          </div>
        </div>
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
          <Label htmlFor="phone">
            {t("auth.phone")}{" "}
            <span className="text-muted-foreground font-normal">({t("common.optional")})</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="03xx xxxxxxx"
            invalid={!!formState.errors.phone}
            className="rtl:text-right"
            {...register("phone")}
          />
          <FieldError>{formState.errors.phone?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            invalid={!!formState.errors.password}
            {...register("password")}
          />
          {formState.errors.password ? (
            <FieldError>{formState.errors.password.message}</FieldError>
          ) : (
            <Hint>{t("auth.passwordHint")}</Hint>
          )}
        </div>
        <label className="flex items-start gap-2.5 text-sm">
          <Checkbox
            checked={watch("marketing_opt_in")}
            onCheckedChange={(v) => setValue("marketing_opt_in", v === true)}
            className="mt-0.5"
          />
          {t("auth.marketing")}
        </label>
        <Button type="submit" size="lg" className="w-full" loading={formState.isSubmitting}>
          {t("auth.createAccount")}
        </Button>
        <p className="text-muted-foreground text-center text-xs">{t("auth.terms")}</p>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
