import "server-only";

import type { Locale } from "./config";
import type { Dictionary, TranslationKey } from "./types";

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  ur: () => import("./dictionaries/ur.json").then((m) => m.default as Dictionary),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default as Dictionary),
};

export function getDictionary(locale: Locale) {
  return loaders[locale]();
}

/** Server-side `t()` for metadata and server components. */
export async function getT(locale: Locale) {
  const dict = await getDictionary(locale);
  return (key: TranslationKey, vars?: Record<string, string | number>) => {
    let node: unknown = dict;
    for (const part of key.split(".")) node = (node as Record<string, unknown> | undefined)?.[part];
    let text = typeof node === "string" ? node : key;
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
    return text;
  };
}
