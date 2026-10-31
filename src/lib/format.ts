const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number | string | null | undefined, currency = "USD", options?: { compact?: boolean }) {
  const amount = Number(value ?? 0);
  const key = `${currency}:${options?.compact ? "c" : "f"}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: options?.compact ? 0 : 2,
      notation: options?.compact ? "compact" : "standard",
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(amount);
}

export function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-US").format(Number(value ?? 0));
}

export function formatPercent(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

export function formatDate(value: string | Date | null | undefined, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", opts).format(new Date(value));
}

export function formatDateTime(value: string | Date | null | undefined) {
  return formatDate(value, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(value: string | Date | null | undefined) {
  if (!value) return "";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (diff < 60) return "just now";
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  if (diff < 86400 * 30) return rtf.format(-Math.floor(diff / 86400), "day");
  return formatDate(value);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`;
}

export const GENDER_LABELS: Record<string, string> = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
  boys: "Boys",
  girls: "Girls",
  youth: "Youth",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_approval: "Pending approval",
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  in_production: "In production",
  quality_check: "Quality check",
  shipped: "Shipped",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PAYMENT_TERMS_LABELS: Record<string, string> = {
  prepaid: "Prepaid",
  deposit_50: "50% deposit",
  net_15: "Net 15",
  net_30: "Net 30",
  net_60: "Net 60",
};

export const QUALITY_LABELS: Record<string, string> = {
  economy: "Economy",
  standard: "Standard",
  premium: "Premium",
  elite: "Elite / Pro",
};
