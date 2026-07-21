-- ScopeWork — Project data schema
-- Run this in your Supabase SQL editor or via supabase db push

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table if not exists projects (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  address     text not null,
  notes       text not null default '',
  model       text not null default 'openai' check (model in ('openai', 'anthropic', 'google')),
  thumbnail   text,                        -- compressed data URL of first photo
  is_sample   boolean not null default false, -- true for seeded demo projects
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Photos table
create table if not exists photos (
  id               uuid primary key default uuid_generate_v4(),
  project_id       uuid not null references projects(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  storage_path     text,                   -- Supabase Storage path when using file upload
  analysis_result  jsonb,                  -- full AnalysisResult JSON
  error            text,                   -- set if analysis failed
  icon             text,                   -- 96×96 data URL thumbnail
  photo_index      int not null default 1,
  created_at       timestamptz not null default now()
);

-- Repairs table (denormalized for fast querying)
create table if not exists repairs (
  id                uuid primary key default uuid_generate_v4(),
  project_id        uuid not null references projects(id) on delete cascade,
  photo_id          uuid not null references photos(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  type              text not null,
  location          text not null,
  severity          text not null check (severity in ('minor', 'moderate', 'major')),
  confidence        numeric(3,2) not null default 0.5,
  needs_closer_photo boolean not null default false,
  guidance          text,
  photo_index       int not null default 1,
  created_at        timestamptz not null default now()
);

-- Auto-update updated_at on projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

-- Indexes
create index if not exists photos_project_id_idx  on photos(project_id);
create index if not exists repairs_project_id_idx on repairs(project_id);
create index if not exists repairs_photo_id_idx   on repairs(photo_id);
create index if not exists projects_user_id_idx   on projects(user_id);

-- Row Level Security — users only see their own data
alter table projects enable row level security;
alter table photos    enable row level security;
alter table repairs   enable row level security;

create policy "users own their projects" on projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own their photos" on photos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users own their repairs" on repairs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
