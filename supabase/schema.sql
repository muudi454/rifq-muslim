-- ============================================================================
-- RIFQ Muslim · Supabase schema (free tier)
-- Run this once in Supabase → SQL Editor → New query → Run.
-- It creates the profile, bookmark, settings and tasbih tables with
-- row-level security so each user can only read and write their own rows.
-- ============================================================================

-- ---------------------------------------------------------------- profiles --
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  city text not null default '',
  country text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are self readable" on public.profiles;
create policy "profiles are self readable"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles are self insertable" on public.profiles;
create policy "profiles are self insertable"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles are self updatable" on public.profiles;
create policy "profiles are self updatable"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles are self deletable" on public.profiles;
create policy "profiles are self deletable"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create a profile row automatically for every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------------- bookmarks --
create table if not exists public.bookmarks (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('quran', 'hadith', 'dua')),
  ref text not null default '',
  title text not null default '',
  text text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists bookmarks_user_created_idx
  on public.bookmarks (user_id, created_at desc);

alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks are self readable" on public.bookmarks;
create policy "bookmarks are self readable"
  on public.bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "bookmarks are self insertable" on public.bookmarks;
create policy "bookmarks are self insertable"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks are self updatable" on public.bookmarks;
create policy "bookmarks are self updatable"
  on public.bookmarks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "bookmarks are self deletable" on public.bookmarks;
create policy "bookmarks are self deletable"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------- user settings --
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "settings are self readable" on public.user_settings;
create policy "settings are self readable"
  on public.user_settings for select
  using (auth.uid() = user_id);

drop policy if exists "settings are self insertable" on public.user_settings;
create policy "settings are self insertable"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "settings are self updatable" on public.user_settings;
create policy "settings are self updatable"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "settings are self deletable" on public.user_settings;
create policy "settings are self deletable"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- --------------------------------------------------------- tasbih sessions --
create table if not exists public.tasbih_sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  dhikr text not null default '',
  count integer not null default 0 check (count >= 0),
  target integer not null default 33 check (target > 0),
  created_at timestamptz not null default now()
);

create index if not exists tasbih_user_created_idx
  on public.tasbih_sessions (user_id, created_at desc);

alter table public.tasbih_sessions enable row level security;

drop policy if exists "tasbih are self readable" on public.tasbih_sessions;
create policy "tasbih are self readable"
  on public.tasbih_sessions for select
  using (auth.uid() = user_id);

drop policy if exists "tasbih are self insertable" on public.tasbih_sessions;
create policy "tasbih are self insertable"
  on public.tasbih_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "tasbih are self updatable" on public.tasbih_sessions;
create policy "tasbih are self updatable"
  on public.tasbih_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tasbih are self deletable" on public.tasbih_sessions;
create policy "tasbih are self deletable"
  on public.tasbih_sessions for delete
  using (auth.uid() = user_id);
