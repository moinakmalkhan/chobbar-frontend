import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function truncate(text: string, length = 80) {
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

const API_ORIGIN = env.apiUrl.replace(/\/api\/v1\/?$/, "");

/** Media URLs may come back relative (cached payloads); make them absolute against the API origin. */
export function mediaUrl(url: string | null | undefined) {
  if (!url) return null;
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

/** Turn a backend URL ("/account/orders/…" or "/admin/…") into an in-app path, or null if it isn't one. */
export function appPath(url: string | null | undefined) {
  if (!url || url.startsWith("/admin")) return null;
  if (/^https?:\/\//.test(url)) return null;
  return url.startsWith("/") ? url : `/${url}`;
}
