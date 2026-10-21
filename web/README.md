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
- Staff: sign in on `/login` with the staff number (same page as members; `/staff-login` forwards there) → `/admin` (owner, front desk) or `/coach-app` (coach). Admin and Coach App are hand-written in `components/staff/` and use the real database.

## Ported screens
Most pages under `screens/` were generated from the design prototypes by `scripts/convert.py`. Files whose header says `HAND-EDITED` (Login, FreeTrial, MemberPortal) are maintained by hand and skipped by the script.

## Payments (Razorpay)

Members pay for plans through Razorpay's popup. The server prices every order itself (plan, 5% / 10% discount, coupon) so the browser can't change the amount, verifies Razorpay's signature, then activates the membership.

1. Razorpay Dashboard in **Test Mode** -> Account & Settings -> API Keys -> Generate Test Key.
2. Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` (here in `.env.local` and in Vercel).
3. Webhook: Settings -> Webhooks -> Add. URL `https://<your-site>/api/razorpay/webhook`, secret = your `RAZORPAY_WEBHOOK_SECRET`, events `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`. This catches payments where the browser closed before confirming.
4. Re-run `supabase/schema.sql` (adds `orders` and `memberships`).
5. Test cards / UPI for test mode: https://razorpay.com/docs/payments/payments/test-card-upi-details/
6. Going live: switch the dashboard to Live Mode, generate Live keys, replace the three variables, add the webhook again in Live Mode.

- Front desk: Admin -> Payments -> Record payment (cash / UPI / card). The plan activates immediately and an invoice number is issued.
- Refunds: do them in the Razorpay dashboard; a full refund ends the plan automatically via the webhook.
- Plans extend: renewing before a plan ends starts the new period the day after the current one ends. Yoga is always one month.
- Local testing without Razorpay keys: `RAZORPAY_MOCK=1 npm run dev`.
- Not built yet: auto-renew (UPI Autopay needs Razorpay Subscriptions enabled on your account), emailed/WhatsApp receipts.

## Class booking

Members book from the portal (Classes tab) for the next 7 days. A booking is a class + a date, stored in `bookings`.

- Needs an active plan that covers one of the class's disciplines on that date; kids (under 13) only book Kids classes.
- Seats = class capacity. When full, members join a waitlist; when someone cancels, the oldest waitlisted member is promoted automatically.
- Members can cancel up to 2 hours before class (`CUTOFF_MIN` in `lib/server/bookings.ts`); after that, the front desk handles it.
- No double-booking at overlapping times, no booking classes that started or were cancelled.
- When the owner cancels a date in Admin -> Schedule, every booking for it is cancelled.
- Coach App: the register starts with everyone booked (plus walk-ins you add); mark present / late / absent. Admin shows seats booked on the dashboard and Schedule.
- Re-run `supabase/schema.sql` once to add the `bookings` table.
- Still sample data in the portal: streaks, "classes this month", hours trained and belt progress.
