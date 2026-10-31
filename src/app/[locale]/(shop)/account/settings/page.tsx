"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";

import { PageTitle } from "@/components/account/account-shell";
import { LanguagePills } from "@/components/layout/language-switcher";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, Hint, Input, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { useAuth, useLogout, useUpdateProfile } from "@/hooks/use-auth";
import { useI18n } from "@/i18n/client";
import { fieldErrors } from "@/lib/api";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import type { User } from "@/types/api";

function Section({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={cn(
        "bg-card rounded-3xl border p-5 sm:p-6",
        danger ? "border-red-200 dark:border-red-500/30" : "border-border",
      )}
    >
      <h2 className={cn("font-display mb-5 text-lg font-bold", danger && "text-red-600")}>{title}</h2>
      {children}
    </section>
  );
}

function ProfileForm({ user }: { user: User }) {
  const { t } = useI18n();
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
    date_of_birth: user.date_of_birth ?? "",
    shop_for: user.shop_for,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        setErrors({});
        update.mutate({ ...form, date_of_birth: form.date_of_birth || null } as Partial<User>, {
          onError: (err) => (setErrors(fieldErrors(err)), notify.error(err)),
        });
      }}
    >
      <div>
        <Label htmlFor="fn">{t("auth.firstName")}</Label>
        <Input
          id="fn"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <FieldError>{errors.first_name}</FieldError>
      </div>
      <div>
        <Label htmlFor="ln">{t("auth.lastName")}</Label>
        <Input
          id="ln"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="ph">{t("auth.phone")}</Label>
        <Input
          id="ph"
          type="tel"
          dir="ltr"
          className="rtl:text-right"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <FieldError>{errors.phone}</FieldError>
      </div>
      <div>
        <Label htmlFor="dob">{t("account.birthday")}</Label>
        <Input
          id="dob"
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
        />
        <Hint>{t("account.birthdayHint")}</Hint>
      </div>
      <div className="sm:col-span-2">
        <Label>{t("account.shopFor")}</Label>
        <div className="flex flex-wrap gap-2">
          {(["", "men", "women"] as const).map((v) => (
            <button
              key={v || "all"}
              type="button"
              aria-pressed={form.shop_for === v}
              onClick={() => setForm({ ...form, shop_for: v })}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                form.shop_for === v ? "border-foreground bg-foreground text-background" : "border-border",
              )}
            >
              {v === "" ? t("account.shopForAll") : t(`listing.genders.${v}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <Label>{t("auth.email")}</Label>
        <Input value={user.email} disabled dir="ltr" className="rtl:text-right" />
      </div>
      <Button type="submit" className="w-fit" loading={update.isPending}>
        {t("common.saveChanges")}
      </Button>
    </form>
  );
}

function PasswordForm({ user }: { user: User }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (next.length < 10) return setErrors({ new_password: t("auth.minPassword") });
        setBusy(true);
        setErrors({});
        try {
          await authService.changePassword(current, next);
          notify.success(t("account.passwordChanged"));
          setCurrent("");
          setNext("");
        } catch (err) {
          setErrors(fieldErrors(err));
          notify.error(err);
        } finally {
          setBusy(false);
        }
      }}
    >
      {!user.has_password ? (
        <p className="text-muted-foreground text-sm">{t("account.setPasswordHint")}</p>
      ) : null}
      {user.has_password ? (
        <div>
          <Label htmlFor="cur">{t("account.currentPassword")}</Label>
          <PasswordInput
            id="cur"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <FieldError>{errors.current_password}</FieldError>
        </div>
      ) : null}
      <div>
        <Label htmlFor="new">{t("auth.newPassword")}</Label>
        <PasswordInput
          id="new"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        {errors.new_password ? (
          <FieldError>{errors.new_password}</FieldError>
        ) : (
          <Hint>{t("auth.passwordHint")}</Hint>
        )}
      </div>
      <Button type="submit" loading={busy}>
        {user.has_password ? t("account.changePassword") : t("account.setPassword")}
      </Button>
    </form>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const update = useUpdateProfile();
  const logout = useLogout();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  if (!user) return null;
  const prefs = user.notification_preferences ?? {};
  return (
    <>
      <PageTitle title={t("account.settings")} />
      <div className="space-y-6">
        <Section title={t("account.profile")}>
          <ProfileForm user={user} />
        </Section>
        <Section title={t("common.language")}>
          <p className="text-muted-foreground mb-4 text-sm">{t("account.languageHint")}</p>
          <LanguagePills />
        </Section>
        <Section title={t("account.preferences")}>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">{t("account.prefOrders")}</span>
                <span className="text-muted-foreground block text-xs">{t("account.prefOrdersHint")}</span>
              </span>
              <Switch
                checked={prefs.orders !== false}
                onCheckedChange={(v) => update.mutate({ notification_preferences: { ...prefs, orders: v } })}
              />
            </label>
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">{t("account.prefPromos")}</span>
                <span className="text-muted-foreground block text-xs">{t("home.newsletterSub")}</span>
              </span>
              <Switch
                checked={user.marketing_opt_in}
                onCheckedChange={(v) => update.mutate({ marketing_opt_in: v })}
              />
            </label>
          </div>
        </Section>
        <Section title={user.has_password ? t("account.changePassword") : t("account.setPassword")}>
          <PasswordForm user={user} />
        </Section>
        <Section title={t("account.dangerZone")} danger>
          <p className="text-muted-foreground mb-4 text-sm">{t("account.deleteHint")}</p>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            {t("account.deleteConfirm")}
          </Button>
        </Section>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent closeLabel={t("common.close")}>
          <DialogHeader>
            <AlertTriangle className="mb-2 size-8 text-red-600" />
            <DialogTitle>{t("account.deleteConfirm")}</DialogTitle>
            <DialogDescription>{t("account.deleteHint")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              loading={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await authService.deleteMe();
                  notify.success(t("account.deleted"));
                  await logout({ silent: true });
                } catch (err) {
                  notify.error(err);
                  setDeleting(false);
                }
              }}
            >
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
