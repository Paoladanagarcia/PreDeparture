# PreDeparture

PreDeparture is a web app that helps international students prepare for an exchange abroad. It turns scattered information about visas, housing, insurance, banking, arrival logistics and funding into a personalized roadmap.

The first supported destinations are UC Berkeley and Stanford University in the United States.

## Features

- Personalized onboarding for destination, university, nationality, arrival date and duration
- Chronological checklist before departure and after arrival
- Timeline view grouped by preparation phase
- Resource guides for visa, housing, banking, phone plans, arrival, scholarships and insurance
- Optional user accounts with Supabase authentication
- Cloud sync for profile and checklist progress when signed in
- Gemini-powered AI assistant through a secure Vercel serverless API route
- Profile page with exchange details and progress
- About / Sources page explaining official-source guidance and deadline limitations
- Mobile navigation and responsive dashboard layout

## Tech Stack

- React
- TypeScript
- Vite
- TanStack Router
- Tailwind CSS
- shadcn/radix UI components
- Vercel-ready static deployment

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build is generated in the `dist` folder.

## Deployment

This project is configured as a standard Vite/React single-page app.

For Vercel:

- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites are configured in `vercel.json`

For Netlify:

- Build command: `npm run build`
- Publish directory: `dist`
- Add a SPA redirect to send all routes to `index.html` if needed

## Gemini AI Assistant

The AI assistant calls the local Vercel serverless route at `/api/ask`. The Gemini key is used only on the server and must not be exposed with a `VITE_` prefix.

For local development, create a `.env.local` file and add:

```bash
GEMINI_API_KEY=your_key_here
```

For Vercel deployment, add the same variable in:

```text
Project Settings -> Environment Variables -> GEMINI_API_KEY
```

The app uses Gemini Flash for short, practical answers about exchange preparation. If Gemini returns a temporary quota error, the assistant shows a clear usage-limit message instead of crashing. If `GEMINI_API_KEY` is missing or the Gemini API is unavailable, the assistant shows a friendly error.

## Optional User Accounts and Cloud Sync

PreDeparture works locally without an account. To enable user accounts and database sync, create a Supabase project and set:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

In Supabase, open **Authentication -> URL Configuration** and set:

- **Site URL**: your deployed site URL, for example `https://your-project.vercel.app`
- **Redirect URLs**: add your deployed auth URL, for example `https://your-project.vercel.app/auth`

For local development, you can also add `http://localhost:5173/auth`.

Then run this SQL in the Supabase SQL editor:

```sql
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
```

When a user signs in, the app loads their saved profile and checklist from Supabase. If no cloud row exists yet, the current local profile/progress is uploaded.

Guest mode is still available: users can start planning without an account, but the roadmap stays in the current browser only. Signing out clears the local roadmap from the browser so another person using the same device does not see the previous account's data.

The Community section uses cohorts based on the user's host university and arrival term, for example "UC Berkeley - Fall 2026" or "Stanford University - Spring 2027". Signed-in users can join focused groups and chat with other students in the same cohort. Guests can preview the community card, but they need an account to join groups or post messages.

## Source and Safety Note

PreDeparture is a preparation tool, not an official university, immigration, legal, medical or financial authority.

Deadlines are planning estimates based on the user's arrival date. Students should verify important requirements directly with official sources such as their host university, their home university, the relevant embassy or government websites before paying fees, booking appointments, signing housing contracts or submitting documents.
