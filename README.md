# Chobbar — web storefront

Next.js storefront for **[chobbar.shop](https://chobbar.shop)**: activewear and streetwear made in Sialkot, sold direct to customers across Pakistan.
It talks to the Django API in `chobbar-backend` (`/api/v1/`) and its WebSockets for support chat and realtime notifications.

- English, Urdu and Arabic, with full right-to-left layouts. Visitors land in their language automatically (saved choice → country from the CDN's IP header → browser language).
- Guest-first shopping: bag, wishlist and recently viewed work without an account; sign in with email or Google (Gmail) and everything syncs.
- Cash on delivery and bank transfer / JazzCash / EasyPaisa with receipt upload, live delivery quotes per city, coupons, order tracking, returns and exchanges, reviews, support chat.
- Fast on low-end phones: server-rendered pages, CSS-only animations, lazy-loaded widgets, optimised images, reduced effects on weak devices.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000 — the API must be running on :8000
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API base, e.g. `https://api.chobbar.shop/api/v1` |
| `NEXT_PUBLIC_WS_URL` | WebSocket base, e.g. `wss://api.chobbar.shop/ws` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL, e.g. `https://chobbar.shop` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth web client id (enables "Continue with Google") |
| `INTERNAL_API_TOKEN` | Server-only secret shared with the API so server-side rendering is not rate-limited |

## Checks
```bash
npm run typecheck && npm run lint && npm run build
```

See `CLAUDE.md` for structure and conventions.
