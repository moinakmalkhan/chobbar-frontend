export const LOCALES = ["en", "ur", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: Locale[] = ["ur", "ar"];
export const LOCALE_COOKIE = "chobbar_lang";

export const LOCALE_META: Record<
  Locale,
  { name: string; english: string; dir: "ltr" | "rtl"; htmlLang: string; intl: string }
> = {
  en: { name: "English", english: "English", dir: "ltr", htmlLang: "en", intl: "en-PK" },
  ur: { name: "اردو", english: "Urdu", dir: "rtl", htmlLang: "ur", intl: "ur-PK" },
  ar: { name: "العربية", english: "Arabic", dir: "rtl", htmlLang: "ar", intl: "ar-u-nu-latn" },
};

/** Visitor country (from the CDN's IP geolocation header) → default language. */
export const COUNTRY_LOCALE: Record<string, Locale> = {
  PK: "ur",
  SA: "ar",
  AE: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  EG: "ar",
  JO: "ar",
  IQ: "ar",
  LB: "ar",
  LY: "ar",
  MA: "ar",
  DZ: "ar",
  TN: "ar",
  YE: "ar",
  SY: "ar",
  SD: "ar",
  PS: "ar",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale) {
  return LOCALE_META[locale].dir;
}
