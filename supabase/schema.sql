-- nailz.jae schema
-- Paste this into the Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New query)
-- and click Run. Safe to re-run.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  service_id      text not null,
  service_name    text,
  service_price   numeric,
  date            date not null,
  time            text not null,
  name            text not null,
  phone           text,
  email           text,
  social          text,
  payment         text,
  note            text,
  inspiration_src text,
  status          text not null default 'pending'
    check (status in ('pending','confirmed','denied')),
  created_at      timestamptz not null default now()
);

create index if not exists bookings_date_idx        on public.bookings (date);
create index if not exists bookings_status_idx      on public.bookings (status);
create index if not exists bookings_created_at_idx  on public.bookings (created_at desc);

-- ─────────────────────────────────────────────────────────────
-- availability  (one row per day)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.availability (
  date  date primary key,
  open  boolean not null default false,
  slots text[]  not null default '{}'
);

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table public.bookings     enable row level security;
alter table public.availability enable row level security;

-- bookings: anon can create a booking, only authed (admin) can read/update/delete the full row
drop policy if exists "bookings_anon_insert"  on public.bookings;
drop policy if exists "bookings_authed_all"   on public.bookings;
create policy "bookings_anon_insert"
  on public.bookings for insert to anon, authenticated
  with check (status = 'pending');
create policy "bookings_authed_all"
  on public.bookings for all to authenticated
  using (true) with check (true);

-- availability: everyone can read, only admin can write
drop policy if exists "availability_public_read"  on public.availability;
drop policy if exists "availability_authed_write" on public.availability;
create policy "availability_public_read"
  on public.availability for select to anon, authenticated
  using (true);
create policy "availability_authed_write"
  on public.availability for all to authenticated
  using (true) with check (true);

-- ─────────────────────────────────────────────────────────────
-- public_booked_slots()  — lets the public site know which times
-- are taken without exposing client PII.  SECURITY DEFINER bypasses
-- the bookings SELECT policy and returns only (date, time).
-- ─────────────────────────────────────────────────────────────
create or replace function public.public_booked_slots()
returns table (date date, "time" text)
language sql
security definer
set search_path = public
as $$
  select date, time from public.bookings
  where status in ('pending','confirmed');
$$;
grant execute on function public.public_booked_slots() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Seed the next 28 days of availability (Mon–Sat open) if empty
-- ─────────────────────────────────────────────────────────────
insert into public.availability (date, open, slots)
select
  d::date,
  extract(dow from d) <> 0,
  case when extract(dow from d) <> 0
    then array['9:00 AM','10:30 AM','12:00 PM','1:30 PM','3:00 PM','4:30 PM','6:00 PM']
    else array[]::text[]
  end
from generate_series(current_date, current_date + interval '27 days', interval '1 day') as d
on conflict (date) do nothing;

-- ─────────────────────────────────────────────────────────────
-- Realtime: broadcast changes so the admin sees new bookings live
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.availability;
