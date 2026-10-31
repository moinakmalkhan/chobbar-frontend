"use client";

import { MailCheck } from "lucide-react";
import { useState } from "react";

import { AuthCard } from "@/components/shared/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { notify } from "@/lib/toast";
import { authService } from "@/services/auth";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <AuthCard
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle")}
      footer={
        <Link href="/login" className="text-foreground font-semibold underline underline-offset-4">
          {t("auth.signIn")}
        </Link>
      }
    >
      {sent ? (
        <div className="animate-in fade-in flex flex-col items-center gap-3 text-center">
          <MailCheck className="size-10 text-emerald-600" />
          <p className="text-sm">{t("auth.linkSent")}</p>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await authService.requestReset(email.trim());
              setSent(true);
            } catch (err) {
              notify.error(err);
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="w-full" loading={busy}>
            {t("auth.sendLink")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
