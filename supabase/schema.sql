-- PreDeparture Supabase schema
-- Run this file in the Supabase SQL editor to enable accounts, cloud sync
-- and community chat.

create extension if not exists pgcrypto;

create table if not exists public.predeparture_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  questionnaire jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.predeparture_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  done jsonb not null default '{}'::jsonb,
  docs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.predeparture_profiles enable row level security;
alter table public.predeparture_progress enable row level security;

drop policy if exists "Users can read their profile"
on public.predeparture_profiles;

create policy "Users can read their profile"
on public.predeparture_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their profile"
on public.predeparture_profiles;

create policy "Users can insert their profile"
on public.predeparture_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their profile"
on public.predeparture_profiles;

create policy "Users can update their profile"
on public.predeparture_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read their progress"
on public.predeparture_progress;

create policy "Users can read their progress"
on public.predeparture_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their progress"
on public.predeparture_progress;

create policy "Users can insert their progress"
on public.predeparture_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their progress"
on public.predeparture_progress;

create policy "Users can update their progress"
on public.predeparture_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create table if not exists public.predeparture_community_members (
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_key text not null,
  group_key text not null,
  display_name text not null default 'Student',
  joined_at timestamptz not null default now(),
  primary key (user_id, cohort_key, group_key)
);

create table if not exists public.predeparture_community_messages (
  id uuid primary key default gen_random_uuid(),
  cohort_key text not null,
  group_key text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Student',
  body text not null check (length(trim(body)) > 0 and length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists predeparture_community_members_cohort_idx
on public.predeparture_community_members (cohort_key, group_key);

create index if not exists predeparture_community_messages_group_idx
on public.predeparture_community_messages (cohort_key, group_key, created_at);

alter table public.predeparture_community_members enable row level security;
alter table public.predeparture_community_messages enable row level security;

drop policy if exists "Authenticated users can read community memberships"
on public.predeparture_community_members;

create policy "Authenticated users can read community memberships"
on public.predeparture_community_members
for select
using (auth.uid() is not null);

drop policy if exists "Users can join community groups"
on public.predeparture_community_members;

create policy "Users can join community groups"
on public.predeparture_community_members
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their community membership"
on public.predeparture_community_members;

create policy "Users can update their community membership"
on public.predeparture_community_members
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can leave community groups"
on public.predeparture_community_members;

create policy "Users can leave community groups"
on public.predeparture_community_members
for delete
using (auth.uid() = user_id);

drop policy if exists "Members can read group messages"
on public.predeparture_community_messages;

create policy "Members can read group messages"
on public.predeparture_community_messages
for select
using (
  exists (
    select 1
    from public.predeparture_community_members member
    where member.user_id = auth.uid()
      and member.cohort_key = predeparture_community_messages.cohort_key
      and member.group_key = predeparture_community_messages.group_key
  )
);

drop policy if exists "Members can post group messages"
on public.predeparture_community_messages;

create policy "Members can post group messages"
on public.predeparture_community_messages
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.predeparture_community_members member
    where member.user_id = auth.uid()
      and member.cohort_key = predeparture_community_messages.cohort_key
      and member.group_key = predeparture_community_messages.group_key
  )
);

do $$
begin
  alter publication supabase_realtime
  add table public.predeparture_community_messages;
exception
  when duplicate_object then null;
end $$;
