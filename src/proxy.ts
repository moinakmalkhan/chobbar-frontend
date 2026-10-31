/**
 * Locale routing. Every page lives under /en, /ur or /ar.
 * A request without a locale is redirected to:
 *   1. the language the visitor picked before (cookie),
 *   2. the language of their country (CDN IP-geolocation header),
 *   3. their browser's Accept-Language,
 *   4. English.
 */
import { NextResponse, type NextRequest } from "next/server";

import { COUNTRY_LOCALE, DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from "@/i18n/config";

const COUNTRY_HEADERS = [
  "cf-ipcountry",
  "x-vercel-ip-country",
  "cloudfront-viewer-country",
  "x-country-code",
];

function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { code: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => isLocale(r.code))?.code as Locale) ?? null;
}

export function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  for (const header of COUNTRY_HEADERS) {
    const country = request.headers.get(header)?.toUpperCase();
    if (country && COUNTRY_LOCALE[country]) return COUNTRY_LOCALE[country];
  }
  return fromAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    const response = NextResponse.next();
    const current = pathname.split("/")[1];
    // Remember an explicit locale from the URL so future bare URLs land in the same language.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== current) {
      response.cookies.set(LOCALE_COOKIE, current, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, metadata files and anything with a file extension.
  matcher: ["/((?!_next|api|favicon|robots.txt|sitemap.xml|manifest.webmanifest|images|icons|.*\\..*).*)"],
};
