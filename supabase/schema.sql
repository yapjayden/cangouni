-- CanGoUni — Supabase schema
-- Run this in your Supabase project's SQL editor (Dashboard → SQL → New query).
--
-- Stores each signed-in user's profile + course shortlist. Row-level security
-- ensures a user can only read/write their own row.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  profile     jsonb,
  bookmarks   jsonb,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user can do anything to their own row, and nothing to anyone else's.
drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
