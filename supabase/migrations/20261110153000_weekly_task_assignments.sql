create or replace function private.assign_weekly_tasks_for_membership(
  target_user_id uuid,
  target_faction_id smallint,
  target_week_start date
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_rank smallint;
  lowest_difficulty smallint;
  highest_difficulty smallint;
  existing_assignment_count integer;
  assignments_to_add integer;
  inserted_assignment_count integer;
begin
  if target_week_start is null or extract(isodow from target_week_start) <> 1 then
    raise exception 'Task assignment week must start on Monday';
  end if;

  select uf.rank_level into current_rank
    from public.user_factions uf
    where uf.user_id = target_user_id
      and uf.faction_id = target_faction_id
      and uf.membership_status = 'active'
    for update;
  if not found or current_rank < 1 then
    return 0;
  end if;

  if current_rank <= 3 then
    lowest_difficulty := 1;
    highest_difficulty := 3;
  elsif current_rank <= 7 then
    lowest_difficulty := 4;
    highest_difficulty := 7;
  else
    lowest_difficulty := 8;
    highest_difficulty := 10;
  end if;

  select count(*)::integer into existing_assignment_count
    from public.task_assignments ta
    join public.tasks t on t.id = ta.task_id
    where ta.user_id = target_user_id
      and ta.week_start_date = target_week_start
      and t.faction_id = target_faction_id
      and ta.status <> 'cancelled';

  assignments_to_add := greatest(0, 3 - existing_assignment_count);
  if assignments_to_add = 0 then
    return 0;
  end if;

  insert into public.task_assignments (user_id, task_id, week_start_date, due_date)
  select target_user_id, candidate.id, target_week_start, target_week_start + 6
    from (
      select t.id
        from public.tasks t
        where t.faction_id = target_faction_id
          and t.is_active
          and t.difficulty_level between lowest_difficulty and highest_difficulty
          and not exists (
            select 1 from public.task_assignments existing
            where existing.user_id = target_user_id
              and existing.task_id = t.id
              and existing.week_start_date = target_week_start
          )
        order by random()
        limit assignments_to_add
    ) candidate
  on conflict (user_id, task_id, week_start_date) do nothing;

  get diagnostics inserted_assignment_count = row_count;
  return inserted_assignment_count;
end;
$$;

revoke all on function private.assign_weekly_tasks_for_membership(uuid, smallint, date) from public, anon, authenticated;

create policy "Members can read tasks assigned to them"
  on public.tasks for select to authenticated
  using (
    exists (
      select 1 from public.task_assignments ta
      where ta.task_id = id and ta.user_id = (select auth.uid())
    )
  );

create or replace function public.ensure_current_week_task_assignments()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_week_start date := date_trunc('week', timezone('Europe/Ljubljana', clock_timestamp()))::date;
  membership record;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;

  for membership in
    select uf.faction_id
      from public.user_factions uf
      where uf.user_id = current_user_id and uf.membership_status = 'active'
  loop
    perform private.assign_weekly_tasks_for_membership(
      current_user_id,
      membership.faction_id,
      current_week_start
    );
  end loop;
end;
$$;

revoke all on function public.ensure_current_week_task_assignments() from public, anon;
grant execute on function public.ensure_current_week_task_assignments() to authenticated;

create or replace function public.assign_weekly_tasks_for_active_memberships()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  local_now timestamp without time zone := timezone('Europe/Ljubljana', clock_timestamp());
  current_week_start date;
  membership record;
begin
  -- Seasonal UTC jobs converge on Monday 00:00 in Europe/Ljubljana.
  if extract(isodow from local_now) <> 1 or local_now::time >= time '00:05' then
    return;
  end if;

  current_week_start := date_trunc('week', local_now)::date;
  for membership in
    select uf.user_id, uf.faction_id
      from public.user_factions uf
      where uf.membership_status = 'active'
  loop
    perform private.assign_weekly_tasks_for_membership(
      membership.user_id,
      membership.faction_id,
      current_week_start
    );
  end loop;
end;
$$;

revoke all on function public.assign_weekly_tasks_for_active_memberships() from public, anon, authenticated;
grant execute on function public.assign_weekly_tasks_for_active_memberships() to service_role;

select cron.schedule(
  'weekly-task-assignments-cet',
  '0 23 * * 0',
  'select public.assign_weekly_tasks_for_active_memberships();'
);
select cron.schedule(
  'weekly-task-assignments-cest',
  '0 22 * * 0',
  'select public.assign_weekly_tasks_for_active_memberships();'
);
