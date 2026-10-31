# Chobbar — workspace CLAUDE.md (paste into the folder that holds all three repos)

Three repositories make up chobbar.shop:
- `chobbar-backend/` — Django 5.2 + DRF API, PostgreSQL, Redis, Celery, Channels, django-unfold admin. Read its `CLAUDE.md` first.
- `chobbar-frontend/` — Next.js 16 storefront (en/ur/ar, RTL). Read its `CLAUDE.md` first.
- `chobbar-android/` — Kotlin + Jetpack Compose app. Read its `CLAUDE.md` first.

## Run everything locally
```bash
cd chobbar-backend && cp .env.example .env && make up && make seed   # API :8000, admin /admin/, Mailpit :8025
cd chobbar-frontend && cp .env.example .env.local && npm install && npm run dev   # http://localhost:3000
# Android: open chobbar-android in Android Studio; the debug build talks to http://10.0.2.2:8000
```
Logins: admin@chobbar.shop / Admin!Chobbar2026 (staff) · ali@example.com / Customer!2026 (customer). Coupons: WELCOME10, CHOBBAR500, FREESHIP.

## Rules across repos
- Change API shapes in the backend serializers **and** `chobbar-frontend/src/types/api.ts` **and** the Android DTOs together.
- New user-facing text needs English, Urdu and Arabic in every client.
- Commit messages: plain, descriptive, no tool attribution lines.
