"use client";

import { createContext, useCallback, useContext, useMemo } from "react";

import { setApiLocale } from "@/lib/api";

import { LOCALE_META, type Locale } from "./config";
import type { Dictionary, TranslationKey } from "./types";

interface I18nValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** Prefix an app path with the current locale: href("/cart") → "/ur/cart". */
  href: (path: string) => string;
  money: (value: number | string | null | undefined) => string;
  number: (value: number | string | null | undefined) => string;
  date: (value: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function lookup(dict: Dictionary, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (node && typeof node === "object" && part in (node as Record<string, unknown>))
      node = (node as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof node === "string" ? node : undefined;
}

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  setApiLocale(locale, {
    timeout: dict.errors.timeout,
    network: dict.errors.network,
    throttled: dict.errors.throttled,
    notFound: dict.errors.notFound,
    generic: dict.errors.generic,
    checkForm: dict.errors.checkForm,
  });
  const meta = LOCALE_META[locale];
  const numberFormat = useMemo(
    () => new Intl.NumberFormat(meta.intl, { maximumFractionDigits: 0 }),
    [meta.intl],
  );

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let text = lookup(dict, key) ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
      return text;
    },
    [dict],
  );

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: meta.dir,
      dict,
      t,
      href: (path: string) =>
        /^(https?:|mailto:|tel:|#)/.test(path)
          ? path
          : `/${locale}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`,
      money: (v) => `${t("common.currency")} ${numberFormat.format(Math.round(Number(v ?? 0)))}`,
      number: (v) => numberFormat.format(Number(v ?? 0)),
      date: (v, opts = { day: "numeric", month: "short", year: "numeric" }) =>
        v ? new Intl.DateTimeFormat(meta.intl, opts).format(new Date(v)) : "—",
    }),
    [locale, meta, dict, t, numberFormat],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
