-- Community identity is separate from private exchange questionnaires.
create table public.predeparture_member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(btrim(first_name)) between 1 and 60),
  last_name text not null check (char_length(btrim(last_name)) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 280),
  full_name text generated always as (btrim(first_name || ' ' || last_name)) stored
);
alter table public.predeparture_member_profiles enable row level security;
revoke all on public.predeparture_member_profiles from public, anon, authenticated;
grant select, insert, update on public.predeparture_member_profiles to authenticated;
create policy member_profile_read on public.predeparture_member_profiles for select to authenticated
using (user_id = (select auth.uid()) or exists (
  select 1 from public.predeparture_community_members viewer
  join public.predeparture_community_members member
    on member.cohort_key = viewer.cohort_key and member.group_key = viewer.group_key
  where viewer.user_id = (select auth.uid()) and member.user_id = predeparture_member_profiles.user_id
));
create policy member_profile_insert on public.predeparture_member_profiles for insert to authenticated
with check (user_id = (select auth.uid()));
create policy member_profile_update on public.predeparture_member_profiles for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
-- Copy only names explicitly supplied during signup; never derive identity from email.
insert into public.predeparture_member_profiles (user_id, first_name, last_name)
select id, btrim(raw_user_meta_data->>'first_name'), btrim(raw_user_meta_data->>'last_name')
from auth.users
where char_length(btrim(raw_user_meta_data->>'first_name')) between 1 and 60
and char_length(btrim(raw_user_meta_data->>'last_name')) between 1 and 60
on conflict (user_id) do nothing;
