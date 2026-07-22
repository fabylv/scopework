-- RepairIQ — initial schema
-- Run this once in the Supabase SQL Editor to create all required tables.

-- ─── Role grants ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on all tables in schema public to authenticated;

-- ─── Projects ────────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  address     text,
  notes       text,
  status      text not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users manage own projects"
  on public.projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Photos ──────────────────────────────────────────────────────────────────
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  public_url  text not null,
  status      text not null default 'pending',
  created_at  timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "Users manage own photos"
  on public.photos for all
  using  (auth.uid() = (select user_id from public.projects where id = photos.project_id))
  with check (auth.uid() = (select user_id from public.projects where id = photos.project_id));

-- ─── Issues ──────────────────────────────────────────────────────────────────
create table if not exists public.issues (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  description     text not null,
  category        text,
  location        text,
  severity        text,
  estimated_cost  numeric,
  confidence      numeric,
  created_at      timestamptz not null default now()
);

alter table public.issues enable row level security;

create policy "Users manage own issues"
  on public.issues for all
  using  (auth.uid() = (select user_id from public.projects where id = issues.project_id))
  with check (auth.uid() = (select user_id from public.projects where id = issues.project_id));

-- ─── Contractors ─────────────────────────────────────────────────────────────
create table if not exists public.contractors (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  trade       text,
  category    text not null default 'Trades',
  phone       text,
  email       text,
  rate        numeric,
  created_at  timestamptz not null default now()
);

alter table public.contractors enable row level security;

create policy "Users manage own contractors"
  on public.contractors for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
