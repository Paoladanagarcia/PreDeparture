-- Integration test: run against the migrated database. All fixtures roll back.
begin;
insert into auth.users(id) values
('c05941d0-480a-4103-abcb-06c547401001'),('c05941d0-480a-4103-abcb-06c547401002'),
('c05941d0-480a-4103-abcb-06c547401003'),('c05941d0-480a-4103-abcb-06c547401004');
insert into public.predeparture_member_profiles(user_id,first_name,last_name) values
('c05941d0-480a-4103-abcb-06c547401001','Test','Owner'),
('c05941d0-480a-4103-abcb-06c547401002','Test','Peer'),
('c05941d0-480a-4103-abcb-06c547401003','Test','Outside');
insert into public.predeparture_community_members(user_id,cohort_key,group_key) values
('c05941d0-480a-4103-abcb-06c547401001','profile-policy-test','general'),
('c05941d0-480a-4103-abcb-06c547401002','profile-policy-test','general'),
('c05941d0-480a-4103-abcb-06c547401003','profile-policy-test','housing');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"c05941d0-480a-4103-abcb-06c547401001","role":"authenticated"}',true);
do $$
declare affected integer;
begin
  if (select count(*) from public.predeparture_member_profiles where user_id in
    ('c05941d0-480a-4103-abcb-06c547401001','c05941d0-480a-4103-abcb-06c547401002')) <> 2 then raise exception 'self/shared read failed'; end if;
  if exists(select 1 from public.predeparture_member_profiles where user_id='c05941d0-480a-4103-abcb-06c547401003') then raise exception 'unrelated profile exposed'; end if;
  update public.predeparture_member_profiles set first_name='Updated',bio='Saved bio' where user_id='c05941d0-480a-4103-abcb-06c547401001';
  if not exists(select 1 from public.predeparture_member_profiles where user_id='c05941d0-480a-4103-abcb-06c547401001' and full_name='Updated Owner' and bio='Saved bio') then raise exception 'save failed'; end if;
  update public.predeparture_member_profiles set bio='Unauthorized' where user_id='c05941d0-480a-4103-abcb-06c547401002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'edited another profile'; end if;
  begin
    insert into public.predeparture_member_profiles(user_id,first_name,last_name) values ('c05941d0-480a-4103-abcb-06c547401004','Not','Owner');
    raise exception 'insert ownership bypass';
  exception when insufficient_privilege then null; end;
  begin
    update public.predeparture_member_profiles set user_id='c05941d0-480a-4103-abcb-06c547401004' where user_id='c05941d0-480a-4103-abcb-06c547401001';
    raise exception 'ownership reassignment bypass';
  exception when insufficient_privilege then null; end;
  begin
    update public.predeparture_member_profiles set last_name=' ' where user_id='c05941d0-480a-4103-abcb-06c547401001';
    raise exception 'empty name accepted';
  exception when check_violation then null; end;
  delete from public.predeparture_community_members where user_id='c05941d0-480a-4103-abcb-06c547401001' and cohort_key='profile-policy-test';
  if exists(select 1 from public.predeparture_member_profiles where user_id='c05941d0-480a-4103-abcb-06c547401002') then raise exception 'profile accessible after leaving'; end if;
end $$;
reset role;
select not has_table_privilege('anon','public.predeparture_member_profiles','select') as anonymous_access_blocked, 'profile RLS checks passed' as result;
rollback;
