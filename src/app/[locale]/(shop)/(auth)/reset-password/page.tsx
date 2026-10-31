"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { AuthCard } from "@/components/shared/auth-card";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import { FieldError, Hint, Label } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { useRouter } from "@/i18n/link";
import { fieldErrors } from "@/lib/api";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

function ResetForm() {
  const { t } = useI18n();
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <AuthCard title={t("auth.resetTitle")}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (password.length < 10) return setError(t("auth.minPassword"));
          if (password !== confirm) return setError(t("auth.mismatch"));
          setError(null);
          setBusy(true);
          try {
            const res = await authService.confirmReset(token, password);
            notify.success(res.detail);
            router.replace("/login");
          } catch (err) {
            setError(fieldErrors(err).password ?? null);
            notify.error(err);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <Label htmlFor="password">{t("auth.newPassword")}</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Hint>{t("auth.passwordHint")}</Hint>
        </div>
        <div>
          <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <FieldError>{error}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!token}>
          {t("auth.updatePassword")}
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
