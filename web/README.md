# Dojo X web

Next.js app for the Dojo X Fight Academy site: public pages, member login + portal, free-trial booking, staff Admin and Coach App.

```
npm install
npm run dev        # http://localhost:3000
```

## Data and login

| | Without Supabase keys | With Supabase keys |
|---|---|---|
| Storage | `.data/dojo.json` (local dev only, git-ignored) | Supabase Postgres |
| Login codes | Demo: any 6 digits work (`000000` is rejected) | Same, until a WhatsApp/SMS provider is wired into `app/api/auth/request` |

### Connect Supabase
1. Create a project at https://supabase.com.
2. SQL Editor → paste and run `supabase/schema.sql` (tables, RLS on, placeholder staff).
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project Settings → API)
   - `SUPABASE_SERVICE_ROLE_KEY` (same page; **server only, never expose**)
   - `SESSION_SECRET` (`openssl rand -hex 32`)
4. Restart `npm run dev`. Replace the placeholder staff rows (`9000000001-3`) with real owner / coach / front-desk numbers.

All database access goes through `app/api/*` using the service-role key; the browser never talks to Supabase directly.

### What is stored
- **accounts** (one per phone), **members** (the account owner plus family: profile, emergency contact, signed waiver, member ID), **trials** (free-trial bookings), **staff** (owner / coach / frontdesk).
- Demo number `98450 21734` is seeded with the sample Sharma family so the portal has data to show.
- Plans, payments, bookings and the revenue charts are still sample data until checkout/payments are real.

### Routes
- Members: `/login` (phone → code → profile → waiver → family), `/member-portal`, `/free-trial`
- Staff: `/staff-login` → `/admin` (owner, front desk) or `/coach-app` (coach). Admin and Coach App are hand-written in `components/staff/` and use the real database.

## Ported screens
Most pages under `screens/` were generated from the design prototypes by `scripts/convert.py`. Files whose header says `HAND-EDITED` (Login, FreeTrial, MemberPortal) are maintained by hand and skipped by the script.
