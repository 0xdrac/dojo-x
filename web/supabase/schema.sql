-- Dojo X: run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
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
  role        text not null check (role in ('owner','coach','frontdesk'))
);

alter table accounts enable row level security;
alter table members  enable row level security;
alter table trials   enable row level security;
alter table staff    enable row level security;

-- Replace these placeholder staff with the real owner / coach / front-desk phone numbers.
insert into staff (phone, name, role) values
  ('9000000001', 'Arjun Rathore', 'owner'),
  ('9000000002', 'Rahul Sandhu',  'coach'),
  ('9000000003', 'Front Desk',    'frontdesk')
on conflict (phone) do nothing;
