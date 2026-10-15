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
  coach_key   text                              -- which coach profile this login is (arjun, kavya, rahul, meera, vikram, tanvi, ananya)
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

-- Replace these placeholder staff with the real owner / coach / front-desk phone numbers.
insert into staff (phone, name, role, coach_key) values
  ('9000000001', 'Arjun Rathore', 'owner',     'arjun'),
  ('9000000002', 'Rahul Sandhu',  'coach',     'rahul'),
  ('9000000003', 'Front Desk',    'frontdesk', null)
on conflict (phone) do nothing;
update staff set coach_key = 'rahul' where phone = '9000000002' and coach_key is null;
update staff set coach_key = 'arjun' where phone = '9000000001' and coach_key is null;
