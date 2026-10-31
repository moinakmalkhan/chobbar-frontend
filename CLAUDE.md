# Leepa Sports — frontend (Next.js)

Storefront + B2B account area for Leepa Sports. Talks to the Django API in `leepasports-backend` (`NEXT_PUBLIC_API_URL`, default http://localhost:8000/api/v1) and its WebSockets (`NEXT_PUBLIC_WS_URL`).

## Stack
Next.js 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind v4 (tokens in `src/app/globals.css`) · Radix primitives (shadcn-style kit in `src/components/ui`) · TanStack Query v5 · Zustand (auth/cart/ui stores) · axios · react-hook-form + zod · sonner toasts · framer-motion (reduced on low-end devices) · lucide icons.

## Run locally
```bash
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google sign-in
npm run dev                      # http://localhost:3000 (backend must run on :8000)
npm run typecheck && npm run lint && npm run build
```

## Layout
```
src/app                 routes: / products categories/[slug] products/[slug] search fabrics how-it-works cart checkout
                        quick-order track (auth)/{login,register,forgot-password,reset-password,verify-email,invitations/[token]}
                        account/{overview,orders,orders/[id],quotes,quotes/[id],saved-lists,addresses,team,messages,notifications,settings,company}
                        print/invoice/[id]  robots.ts  sitemap.ts
src/components/ui       button, input, badge(StatusBadge), card, dialog(side=right|bottom), dropdown, tabs, select, misc(checkbox/radio/switch/tooltip/avatar), pagination, skeleton, empty-state
src/components/layout   header (mega menu, ⌘K search, cart/notification badges), nav, user-menu, search-command, footer, providers, site-shell
src/components/catalog  product-card/grid, product-filters (URL state), product-listing, product-configurator, size-matrix, fabric-picker, price-summary, image-gallery
src/components/cart     cart-line, cart-drawer        src/components/chat  chat-widget, chat-thread
src/components/account  account-shell, order-timeline, address-form
src/lib                 api.ts (axios + JWT refresh), jwt.ts, query-client.ts (queryKeys), toast.ts (notify), format.ts, server-api.ts, env.ts, utils.ts
src/services            one module per API domain (auth, accounts, catalog, cart, orders, quotes, search, notifications, chat)
src/hooks               use-auth, use-cart, use-catalog, use-chat, use-notifications (realtime WS), use-debounce, use-device
src/stores              auth-store (persisted tokens/user/companyId), cart-store (guest token, session key, drawer), ui-store
src/types/api.ts        API types mirroring the Django serializers
```

## Conventions (follow these)
- Data fetching: React Query via `src/services/*`; keys come from `queryKeys` in `src/lib/query-client.ts`. Public SEO pages (home, products, categories, product detail, fabrics) fetch on the server with `serverGet` (ISR 5 min) and hand `initialData` to client components.
- Auth: tokens live in the persisted zustand store. `src/lib/api.ts` decodes the access JWT and refreshes it *before* requests when <45 s remain (single-flight), retries once on 401, and fires `onSessionExpired`. Headers `X-Company-Id`, `X-Cart-Token`, `X-Session-Key` are added automatically. Never call the API with raw fetch from client code.
- Toasts: always `notify.success/info/warning/error/action/promise` from `src/lib/toast.ts`; `notify.error(e)` understands the API error envelope. Map field errors with `fieldErrors(e)` + `setError`.
- Forms: react-hook-form + zod; inputs from `components/ui/input` (`Label`, `Input`, `Textarea`, `FieldError`, `Hint`).
- Debounce user input before querying (`useDebouncedValue` 250–400 ms); search dropdown, filters and the live price quote already do.
- Low-end devices: `useDevice().lowEnd` drives `MotionConfig reducedMotion`; prefer CSS `animate-in` utilities over framer-motion for lists; lazy-load heavy widgets with `next/dynamic` (cart drawer, chat).
- Pagination: list endpoints return `Paginated<T>`; render `<Pagination>` and keep `page` in the URL for catalog pages; feeds (notifications, chat) use `useInfiniteQuery` with cursors.
- Styling: Tailwind tokens `brand-*`, `ink-*`, `bg-background/card/muted/surface`, `text-muted-foreground`, `border-border`; dark mode via `.dark` on `<html>` (persisted in `leepa.theme`). Rounded-xl/2xl, 16 px gutters on mobile via `.container-x`.
- Accessibility: every icon button has `aria-label`; dialogs have a `DialogTitle`; keyboard support in the search dropdown and size matrix.
- Commit messages: plain, descriptive, no tool attribution lines.
