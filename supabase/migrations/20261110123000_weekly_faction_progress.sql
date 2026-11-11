alter table public.user_factions
  add column last_progress_week_start date,
  add column consecutive_incomplete_weeks smallint not null default 0
    check (consecutive_incomplete_weeks >= 0);

create or replace function private.reset_user_faction_weekly_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.membership_status in ('inactive', 'factionless') and new.membership_status = 'active' then
    new.last_progress_week_start := null;
    new.consecutive_incomplete_weeks := 0;
  end if;
  return new;
end;
$$;

create trigger reset_user_faction_weekly_progress_before_rejoin
  before update of membership_status on public.user_factions
  for each row execute function private.reset_user_faction_weekly_progress();

create or replace function public.process_weekly_faction_progress()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  local_now timestamp without time zone := timezone('Europe/Ljubljana', clock_timestamp());
  completed_week_start date;
  weekly_result record;
  current_membership record;
  next_rank smallint;
  next_experience integer;
  next_streak integer;
  next_incomplete_weeks smallint;
  next_status text;
  is_consecutive_week boolean;
begin
  -- The two cron entries cover CET and CEST in UTC. This guard makes the
  -- seasonal no-op safe and gives a few minutes for a delayed cron run.
  if not (
    (extract(isodow from local_now) = 7 and local_now::time >= time '23:59')
    or (extract(isodow from local_now) = 1 and local_now::time < time '00:05')
  ) then
    return;
  end if;

  completed_week_start := date_trunc('week', local_now)::date - 7;

  for weekly_result in
    select
      uf.user_id,
      uf.faction_id,
      count(ta.id)::integer as assignment_count,
      bool_and(ta.status = 'done') as completed_all
    from public.user_factions uf
    join public.tasks t on t.faction_id = uf.faction_id
    join public.task_assignments ta
      on ta.task_id = t.id
      and ta.user_id = uf.user_id
      and ta.week_start_date = completed_week_start
      and ta.status <> 'cancelled'
    where uf.membership_status = 'active'
    group by uf.user_id, uf.faction_id
  loop
    select
      uf.rank_level,
      uf.experience_points,
      uf.current_streak_weeks,
      uf.last_progress_week_start,
      uf.consecutive_incomplete_weeks
      into current_membership
      from public.user_factions uf
      where uf.user_id = weekly_result.user_id
        and uf.faction_id = weekly_result.faction_id
        and uf.membership_status = 'active'
      for update;

    if not found then
      continue;
    end if;
    if current_membership.last_progress_week_start is not null
       and current_membership.last_progress_week_start >= completed_week_start then
      continue;
    end if;

    is_consecutive_week := current_membership.last_progress_week_start = completed_week_start - 7;
    next_rank := current_membership.rank_level;
    next_experience := current_membership.experience_points;
    next_streak := current_membership.current_streak_weeks;
    next_incomplete_weeks := current_membership.consecutive_incomplete_weeks;
    next_status := 'active';

    if weekly_result.assignment_count > 0 and weekly_result.completed_all then
      next_streak := case when is_consecutive_week then next_streak + 1 else 1 end;
      next_incomplete_weeks := 0;
      next_experience := next_experience + 1;

      if next_rank < 10 and next_experience >= 2 then
        next_rank := next_rank + 1;
        next_experience := 0;
      elsif next_rank >= 10 then
        next_experience := 0;
      end if;
    else
      next_streak := 0;
      next_incomplete_weeks := case
        when is_consecutive_week then next_incomplete_weeks + 1
        else 1
      end;

      if next_incomplete_weeks >= 2 then
        next_rank := greatest(next_rank - 1, 0);
        next_experience := 0;
        next_incomplete_weeks := 0;
        if next_rank = 0 then
          next_status := 'factionless';
        end if;
      end if;
    end if;

    update public.user_factions
      set rank_level = next_rank,
          experience_points = next_experience,
          current_streak_weeks = next_streak,
          consecutive_incomplete_weeks = next_incomplete_weeks,
          last_progress_week_start = completed_week_start,
          membership_status = next_status
      where user_id = weekly_result.user_id
        and faction_id = weekly_result.faction_id;

    if next_status = 'factionless' then
      perform private.cancel_faction_assignments(weekly_result.user_id, weekly_result.faction_id);
    end if;
  end loop;
end;
$$;

revoke all on function public.process_weekly_faction_progress() from public, anon, authenticated;
grant execute on function public.process_weekly_faction_progress() to service_role;

create extension if not exists pg_cron;

select cron.schedule(
  'weekly-faction-progress-cet',
  '59 22 * * 0',
  'select public.process_weekly_faction_progress();'
);
select cron.schedule(
  'weekly-faction-progress-cest',
  '59 21 * * 0',
  'select public.process_weekly_faction_progress();'
);
