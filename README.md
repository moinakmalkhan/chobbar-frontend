# Leepa Sports — storefront & B2B account area

Next.js 16 · React 19 · TypeScript · Tailwind v4 · TanStack Query · Zustand · Radix UI

The customer-facing side of the Leepa Sports wholesale platform. It talks to the Django API in
`leepasports-backend` (`/api/v1/`) and its WebSockets for chat and realtime notifications.

## Features
- **Catalog**: mega-menu built from live categories (only categories with products), filterable/sortable listings with URL state and pagination, category landing pages, SEO metadata, sitemap, JSON-LD.
- **Search**: ⌘K / debounced autocomplete dropdown with products, categories and fabrics; full results page with filters, typo tolerance and "did you mean" suggestions.
- **Product configurator**: fabric picker with live mill-price deltas, size × gender quantity matrix with keyboard navigation and size surcharges, customisation (colour, decoration, logo placements, names & numbers, artwork upload), live price breakdown (labour, fabric, group/volume discounts, next tier nudge), add to order or request a quote.
- **Cart & checkout**: server-priced cart with per-size editing, guest carts merged on sign-in, save-as-list, quote requests, checkout with addresses, freight estimate, PO number, bank transfer or net terms, approval routing.
- **Quick order** by SKU with spreadsheet paste; **public order tracking** by number + email.
- **Account**: dashboard KPIs, orders with status timeline, payments & proof upload, printable invoice/pro-forma, cancel/approve/reorder, quotes (accept online), saved lists, addresses, team & roles with invitations and spend limits, company profile, notifications feed, messages with live chat, settings (profile, email preferences, password).
- **Auth**: email + password, Google sign-in (GIS), verification, password reset, invitations; JWT refreshed proactively from the decoded expiry in an axios interceptor.
- **Realtime**: WebSocket notifications → toasts and cache invalidation; chat with optimistic sends, typing and read receipts.
- **Performance**: ISR for public pages, lazy-loaded heavy widgets, `next/image`, reduced motion on low-end devices, small UI kit instead of a heavy component library.

## Getting started
```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID
npm run dev                   # http://localhost:3000
```
Scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`, `npm run format`.

## Structure
See `CLAUDE.md` for the folder map and conventions.
