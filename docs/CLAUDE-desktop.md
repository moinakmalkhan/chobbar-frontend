# Leepa Sports — workspace CLAUDE.md (paste into the folder that holds both repos)

Two repositories make up the Leepa Sports B2B platform:
- `leepasports-backend/` — Django 5.2 + DRF API, PostgreSQL, Redis, Celery, Channels, django-unfold admin. Read its `CLAUDE.md` first.
- `leepasports-frontend/` — Next.js 16 storefront and account area. Read its `CLAUDE.md` first.

## Start everything (local)
```bash
# terminal 1 — infrastructure (or: docker compose up db redis inside leepasports-backend)
# PostgreSQL 16 on :5432 (db leepasports, user postgres/postgres) and Redis on :6379

# terminal 2 — API (WebSockets need daphne)
cd leepasports-backend && . .venv/bin/activate
python manage.py migrate && python manage.py seed_catalog --demo
daphne -b 0.0.0.0 -p 8000 config.asgi:application

# terminal 3 — background tasks (optional while CELERY_TASK_ALWAYS_EAGER=True)
cd leepasports-backend && . .venv/bin/activate && celery -A config worker -B -l info

# terminal 4 — storefront
cd leepasports-frontend && npm run dev
```
Storefront http://localhost:3000 · API docs http://localhost:8000/api/docs/ · Admin http://localhost:8000/admin/

Logins: admin@leepasports.com / Admin!Leepa2026 (staff) · buyer@riversidefc.com / Buyer!Leepa2026 (company owner) · coach@riversidefc.com / Coach!Leepa2026 (buyer, 2,000 limit).

## How the pieces fit
- Prices: `Fabric.price_pkr` (mill rate per kg) × `Product.fabric_consumption_kg` ÷ `ExchangeRate` + `Product.labor_price`, then size surcharge, customer-group %, volume tier %, or a contract `PriceListItem`. Backend `apps/pricing/services.py` is the single source of truth; the frontend configurator calls `POST /pricing/quote/` (debounced) to display it.
- Order flow: cart (server-side, repriced on every read) → checkout (address, freight estimate, PO, bank transfer or net terms) → approval if above a member/company threshold → payment proof → staff confirm → in production → QC → shipped (tracking) → delivered → completed. Every step emits an event that creates in-app notifications, realtime toasts and emails.
- Quotes: cart → RFQ → staff publish prices in admin → buyer accepts → order.
- Chat: `/ws/chat/<conversation>/` with JWT in the query string; REST fallback with cursor pagination; staff reply from the admin.
- Search: Postgres FTS generated column + trigram + synonyms; autocomplete at `/search/suggest/`.

## Working rules
- Change API shapes in the backend serializers **and** `leepasports-frontend/src/types/api.ts` together.
- Backend business logic goes in `services.py` inside a transaction; frontend data access goes through `src/services/*` + React Query.
- Run `python -m pytest -q` (backend) and `npm run typecheck && npm run lint && npm run build` (frontend) before committing.
- Keep commit messages plain and descriptive; no tool attribution lines.
