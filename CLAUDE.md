# Chobbar — web storefront (Next.js)

Customer storefront for **chobbar.shop** (activewear & streetwear, made in Sialkot). Repo: `chobbar-frontend`.
Talks to the Django API in `chobbar-backend` (`NEXT_PUBLIC_API_URL`, default http://localhost:8000/api/v1) and its WebSockets (`NEXT_PUBLIC_WS_URL`).
Languages: English, Urdu and Arabic (Urdu/Arabic are right-to-left).

## Stack
Next.js 16 (App Router, Turbopack, `src/proxy.ts`) · React 19 · TypeScript strict · Tailwind v4 (tokens in `src/app/globals.css`) · Radix primitives (`src/components/ui`) · TanStack Query v5 · Zustand · axios · react-hook-form + zod · sonner · lucide · marked. No JS animation library: animations are CSS only.

## Run locally
```bash
npm install
cp .env.example .env.local      # NEXT_PUBLIC_GOOGLE_CLIENT_ID enables "Continue with Google"; INTERNAL_API_TOKEN must match the backend
npm run dev                      # http://localhost:3000 (backend on :8000)
npm run typecheck && npm run lint && npm run build
```

## Layout
```
src/proxy.ts            locale routing: bare URLs redirect to /en|/ur|/ar (cookie → CDN country header → Accept-Language → en)
src/i18n                config (locales, RTL, country→language), dictionaries/{en,ur,ar}.json, server.ts (getDictionary/getT),
                        client.tsx (I18nProvider, useI18n: t/href/money/number/date/dir), link.tsx (locale-aware Link/useRouter)
src/app/[locale]        layout.tsx (html lang/dir, fonts, providers) · error · not-found · print/receipt/[id]
src/app/[locale]/(shop) layout (SiteShell) · home · products · products/[slug] · categories/[slug] · collections/[slug] · search
                        cart · checkout · checkout/success · track · faq · pages/[slug] · wishlist · (auth)/login|register|forgot-password|reset-password|verify-email
                        account/{overview,orders,orders/[id],returns,addresses,reviews,messages,messages/[id],notifications,settings}
src/app                 robots.ts · sitemap.ts (all locales + hreflang) · manifest.ts
src/components          ui/ (kit) · layout/ (header, mega menu, mobile nav, bottom nav, search, footer, language switcher, logo) · catalog/ · cart/
                        checkout/ · account/ · orders/ · chat/ · home/ · content/ · shared/ (smart-image, price, rating, google-button, …)
src/lib                 api.ts (axios + JWT refresh + language header) · server-api.ts (SSR fetch, server-only) · query-client.ts (queryKeys)
                        toast.ts (notify) · shipping.ts · pk.ts (cities/provinces/phone) · utils.ts (cn, mediaUrl, appPath)
src/services            one module per API domain        src/hooks  use-auth, use-cart, use-catalog, use-orders, use-chat, use-notifications, …
src/stores              auth-store, cart-store (guest token), local-store (guest wishlist, recently viewed, recent searches, last checkout contact), ui-store
```

## Conventions (follow these)
- Every page lives under `[locale]`. Use `Link`/`useRouter` from `@/i18n/link` (they add the locale); never hard-code `/en`.
- All copy goes through `t("section.key")`; add keys to **all three** dictionaries (en/ur/ar must have identical keys). Use `money()`/`date()`/`number()` from `useI18n()`.
- RTL: use logical utilities only (`ms/me/ps/pe`, `start/end`, `text-start`, `rounded-s/e`, `border-s/e`); flip directional icons with `rtl-flip`; sheets use `side="start|end"`.
- Data: React Query via `src/services/*` with keys from `queryKeys`. SEO pages fetch on the server with `serverGet(path, { locale })` and pass `initialData`.
- Persisted stores use `skipHydration` and are rehydrated in `Providers` after mount; gate anything that reads device state on `useAuth().hydrated` so server HTML and the first client render match.
- Auth: tokens in the auth store; `src/lib/api.ts` refreshes the access JWT before requests when <45 s remain (single-flight) and retries once on 401. Headers `X-Language`, `X-Cart-Token`, `X-Session-Key` are added automatically.
- Toasts: always `notify.*` from `src/lib/toast.ts`; map API field errors with `fieldErrors(e)` + `setError`.
- Debounce user input before querying (search 280 ms, price filter 500 ms, city → delivery quote 400 ms, cart quantity 350 ms).
- Low-end devices: `useDevice().lowEnd` sets `html[data-lowend]` which shortens animations and drops blur. Prefer CSS `animate-in`, `animate-rise`, `data-reveal` (scroll reveal). Heavy widgets load with `next/dynamic` (cart drawer, search, mobile nav, chat).
- Images: `SmartImage` (fade-in, shimmer, branded fallback). Media URLs go through `mediaUrl()`.
- Styling tokens: `brand-*` (rose), `ink-*` (warm stone), `bg-background/card/muted/surface`; dark mode via `.dark` on `<html>` (persisted in `chobbar.theme`).
- Commit messages: plain, descriptive, no tool attribution lines.
