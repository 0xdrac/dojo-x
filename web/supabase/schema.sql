-- Dojo X: run in the Supabase SQL editor. Safe to re-run: it only adds what is missing (Project -> SQL Editor -> New query).
-- All access goes through the Next.js API routes using the service-role key, so RLS is on with no public policies.

create extension if not exists "pgcrypto";

create table if not exists accounts (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique,            -- 10-digit Indian mobile, digits only
  created_at  timestamptz not null default now()
);

create sequence if not exists member_code_seq start 1;

create table if not exists members (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references accounts(id) on delete cascade,
  rel         text not null default 'You',     -- You / Child / Spouse / Parent / Sibling
  name        text not null,
  dob         date,
  email       text,
  gender      text,
  member_code text not null unique default ('DX-' || to_char(now(), 'YY') || '-' || lpad(nextval('member_code_seq')::text, 4, '0')),
  emergency   jsonb,                           -- { name, phone }
  waiver      jsonb,                           -- { signed, by, type }
  created_at  timestamptz not null default now()
);
create index if not exists members_account_idx on members(account_id);

create table if not exists trials (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid references accounts(id) on delete set null,
  name        text not null,
  phone       text not null,
  email       text,
  discipline  text not null,
  age_group   text,
  experience  text,
  slot        jsonb,                           -- { classId, title, day, time, coach }
  status      text not null default 'booked',  -- booked / attended / no-show / joined
  created_at  timestamptz not null default now()
);
create index if not exists trials_created_idx on trials(created_at desc);

create table if not exists staff (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique,
  name        text not null,
  role        text not null check (role in ('owner','coach','frontdesk')),
  coach_key   text                              -- which coach profile this login is (aman or vishal)
);
alter table staff add column if not exists coach_key text;

-- Weekly class timetable (recurring). day: 0 = Monday ... 6 = Sunday.
create table if not exists classes (
  id           uuid primary key default gen_random_uuid(),
  day          smallint not null check (day between 0 and 6),
  start_time   text not null,                   -- 'HH:MM' 24h
  duration_min int  not null default 60,
  discipline   text not null,                   -- mma, boxing, kickboxing, muaythai, karate, gymnastics, yoga
  title        text not null,
  coach        text not null,                   -- coach key
  level        text not null default 'All levels',
  age_group    text not null default 'Adults',  -- Kids / Teens / Adults
  capacity     int  not null default 20,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- A class can cover several disciplines and have several coaches. `discipline` / `coach` hold the first of each for older readers.
alter table classes add column if not exists disciplines text[];
alter table classes add column if not exists coaches     text[];
update classes set disciplines = array[discipline] where disciplines is null;
update classes set coaches     = array[coach]      where coaches is null;

-- Optional run dates: null start = from now, null end = ongoing. A one-off class has start = end.
alter table classes add column if not exists start_date date;
alter table classes add column if not exists end_date   date;

-- A single cancelled occurrence of a weekly class.
create table if not exists class_cancellations (
  id         uuid primary key default gen_random_uuid(),
  class_id   uuid not null references classes(id) on delete cascade,
  on_date    date not null,
  created_at timestamptz not null default now(),
  unique (class_id, on_date)
);

create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  kind        text not null default 'Event',     -- Fight Night / Grading / Seminar / Workshop / Event
  description text,
  starts_at   timestamptz not null,
  location    text,
  price       int not null default 0,            -- rupees, 0 = free
  capacity    int,
  published   boolean not null default true,
  repeat_days  smallint[],                       -- weekdays it repeats on (0 = Mon ... 6 = Sun); null = one-off
  repeat_until date,                             -- last date of the series
  created_at  timestamptz not null default now()
);
alter table events add column if not exists repeat_days  smallint[];
alter table events add column if not exists repeat_until date;

create table if not exists coupons (
  code        text primary key,
  type        text not null check (type in ('pct','flat')),
  value       int  not null,
  cap         int,                               -- max uses, null = unlimited
  uses        int  not null default 0,
  valid_until date,
  scope       text not null default 'All plans',
  status      text not null default 'active' check (status in ('active','paused')),
  created_at  timestamptz not null default now()
);

create table if not exists attendance (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members(id) on delete cascade,
  class_id   uuid references classes(id) on delete set null,
  on_date    date not null,
  status     text not null default 'present' check (status in ('present','late','absent')),
  source     text not null default 'coach' check (source in ('coach','desk')),
  marked_by  uuid,
  created_at timestamptz not null default now()
);
create unique index if not exists attendance_unique on attendance (member_id, coalesce(class_id, '00000000-0000-0000-0000-000000000000'::uuid), on_date);
create index if not exists attendance_date_idx on attendance (on_date);

create table if not exists class_sessions (
  id           uuid primary key default gen_random_uuid(),
  class_id     uuid not null references classes(id) on delete cascade,
  on_date      date not null,
  note         text,
  submitted_at timestamptz,
  submitted_by uuid,
  unique (class_id, on_date)
);

-- Payments: one row per checkout. `amount` is in whole rupees. source 'desk' = taken at the front desk (cash / UPI / card machine).
create table if not exists orders (
  id                   uuid primary key default gen_random_uuid(),
  account_id           uuid references accounts(id) on delete set null,
  member_ids           uuid[] not null,
  disciplines          text[] not null,
  duration             text not null check (duration in ('monthly','quarterly','half','annual')),
  people               int  not null default 1,
  coupon_code          text,
  gross                int  not null,
  discount_people      int  not null default 0,
  discount_coupon      int  not null default 0,
  amount               int  not null,
  source               text not null default 'online' check (source in ('online','desk')),
  method               text,                      -- upi / card / netbanking / wallet / cash ...
  status               text not null default 'created' check (status in ('created','paid','failed','refunded')),
  razorpay_order_id    text unique,
  razorpay_payment_id  text,
  invoice_no           text unique,               -- e.g. DX/2026-27/00001
  failure_reason       text,
  recorded_by          uuid,
  created_at           timestamptz not null default now(),
  paid_at              timestamptz
);
create index if not exists orders_account_idx on orders(account_id);
create index if not exists orders_paid_idx on orders(paid_at);

-- A paid period of access for one member. A member is "active" while any membership has ends_on >= today.
create table if not exists memberships (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references members(id) on delete cascade,
  order_id    uuid references orders(id) on delete set null,
  disciplines text[] not null,
  duration    text not null,
  starts_on   date not null,
  ends_on     date not null,
  created_at  timestamptz not null default now()
);
create index if not exists memberships_member_idx on memberships(member_id);

-- Class bookings: one row per member per occurrence (class + date). 'waitlist' rows are promoted to 'booked' when a seat frees up.
create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references members(id) on delete cascade,
  class_id      uuid not null references classes(id) on delete cascade,
  on_date       date not null,
  status        text not null default 'booked' check (status in ('booked','waitlist','cancelled')),
  cancel_reason text,
  created_at    timestamptz not null default now(),
  unique (member_id, class_id, on_date)
);
create index if not exists bookings_class_date_idx on bookings(class_id, on_date);
create index if not exists bookings_member_idx on bookings(member_id, on_date);

alter table accounts enable row level security;
alter table members  enable row level security;
alter table trials   enable row level security;
alter table staff    enable row level security;
alter table classes             enable row level security;
alter table class_cancellations enable row level security;
alter table events              enable row level security;
alter table coupons             enable row level security;
alter table attendance          enable row level security;
alter table class_sessions      enable row level security;
alter table orders              enable row level security;
alter table memberships         enable row level security;
alter table bookings            enable row level security;

-- Coupons can also set the whole plan to a fixed price ('set').
alter table coupons drop constraint if exists coupons_type_check;
alter table coupons add constraint coupons_type_check check (type in ('pct','flat','set'));

-- Replace these placeholder staff with the real owner / coach / front-desk phone numbers.
insert into staff (phone, name, role, coach_key) values
  ('9000000001', 'Owner',         'owner',     'aman'),
  ('9000000002', 'Vishal',        'coach',     'vishal'),
  ('9000000003', 'Front Desk',    'frontdesk', null)
on conflict (phone) do nothing;
-- The academy's coaches are Aman and Vishal (Vishal takes the evening batches). Move anything that still points at the old sample coaches.
update staff set name = 'Owner',  coach_key = 'aman'   where phone = '9000000001' and name = 'Arjun Rathore';
update staff set name = 'Vishal', coach_key = 'vishal' where phone = '9000000002' and name = 'Rahul Sandhu';
update staff set coach_key = null where coach_key is not null and coach_key not in ('aman', 'vishal');
update classes set
  coaches = case when start_time >= '16:00' then array['vishal'] else array['aman'] end,
  coach   = case when start_time >= '16:00' then 'vishal'        else 'aman'        end
where not (coaches <@ array['aman', 'vishal']) or coach not in ('aman', 'vishal');

-- If you ran an earlier version of this file, widen the status check so refunds can be recorded:
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check check (status in ('created','paid','failed','refunded'));

-- Which standard evening batch a member trains in: 'amateur' (7-8 PM) or 'pro' (8-9 PM, intermediate & pro). Members with an active plan are auto-booked into it every week.
create table if not exists batch_prefs (
  member_id uuid primary key references members(id) on delete cascade,
  batch     text not null default 'amateur'
);
alter table batch_prefs enable row level security;
