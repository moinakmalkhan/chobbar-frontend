/** Locale-agnostic helpers. Prefer `useI18n().money/date` inside components. */
export function timeAgo(value: string | Date | null | undefined, locale = "en") {
  if (!value) return "";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diff < 60) return rtf.format(0, "second");
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 86400 * 30) return rtf.format(-Math.floor(diff / 86400), "day");
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(value));
}

export function discountPercent(price: number, compare: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}
