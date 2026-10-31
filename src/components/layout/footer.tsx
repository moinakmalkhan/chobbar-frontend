"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { LanguagePills } from "@/components/layout/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useCategories, useStorefront } from "@/hooks/use-catalog";
import { useI18n } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { SITE } from "@/lib/env";
import { notify } from "@/lib/toast";
import { accountsService } from "@/services/accounts";

function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      notify.warning(t("auth.invalidEmail"));
      return;
    }
    setBusy(true);
    try {
      await accountsService.subscribe(email);
      setDone(true);
      notify.success(t("home.newsletterDone"));
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="flex w-full max-w-md gap-2">
      <label htmlFor="footer-email" className="sr-only">
        {t("home.newsletterPlaceholder")}
      </label>
      <input
        id="footer-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        disabled={done}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("home.newsletterPlaceholder")}
        className="focus:border-brand-400 h-12 min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-white transition-colors outline-none placeholder:text-white/50"
      />
      <Button type="submit" loading={busy} disabled={done} className="h-12">
        {done ? "✓" : t("home.newsletterCta")}
      </Button>
    </form>
  );
}

export function Footer() {
  const { t } = useI18n();
  const categories = useCategories().data ?? [];
  const pages = useStorefront().data?.pages ?? [];
  const year = new Date().getFullYear();
  const col = "mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/50";
  const link = "text-sm text-white/75 transition-colors hover:text-white";
  return (
    <footer className="bg-ink-950 mt-24 text-white">
      <div className="container-x">
        <div className="flex flex-col gap-6 border-b border-white/10 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">{t("home.newsletterTitle")}</h2>
            <p className="mt-2 max-w-md text-sm text-white/65">{t("home.newsletterSub")}</p>
          </div>
          <Newsletter />
        </div>
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo className="h-8 text-white [--logo-cut:#0c0a09]" />
            <p className="max-w-xs text-sm text-white/65">{t("common.brandTagline")}</p>
            <ul className="space-y-2 text-sm text-white/75">
              <li className="flex items-center gap-2">
                <MapPin className="text-brand-400 size-4 shrink-0" />
                {SITE.address}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-brand-400 size-4 shrink-0" />
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} dir="ltr" className="hover:text-white">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-brand-400 size-4 shrink-0" />
                <a href={`mailto:${SITE.supportEmail}`} className="hover:text-white">
                  {SITE.supportEmail}
                </a>
              </li>
            </ul>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:bg-brand-600 inline-grid size-10 place-items-center rounded-full bg-white/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-[18px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
          </div>
          <div>
            <h3 className={col}>{t("footer.shop")}</h3>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categories/${c.slug}`} className={link}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/collections/sale" className={link}>
                  {t("nav.sale")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={col}>{t("footer.help")}</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/track" className={link}>
                  {t("nav.trackOrder")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className={link}>
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link href="/account/messages" className={link}>
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className={link}>
                  {t("account.returns")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className={col}>{t("footer.company")}</h3>
            <ul className="space-y-2.5">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link href={`/pages/${p.slug}`} className={link}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-5 border-t border-white/10 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="me-1 text-xs text-white/50">{t("footer.payments")}</span>
            {[t("checkout.cod"), "JazzCash", "EasyPaisa", t("footer.bankTransfer")].map((m) => (
              <span
                key={m}
                className="rounded-md border border-white/15 px-2 py-1 text-[11px] font-semibold text-white/80"
              >
                {m}
              </span>
            ))}
          </div>
          <LanguagePills className="[&_button]:border-white/20 [&_button]:text-white/85" />
        </div>
        <div className="flex flex-col gap-1 pb-8 text-xs text-white/45 sm:flex-row sm:justify-between">
          <p>
            © {year} {SITE.name}. {t("footer.rights")}
          </p>
          <p>{t("footer.madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
