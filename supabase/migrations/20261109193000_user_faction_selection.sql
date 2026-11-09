-- Update a member's complete faction selection atomically. Completed assignments
-- and evidence remain untouched; only unfinished assignments for removed
-- factions are cancelled.
create or replace function public.set_user_factions(target_faction_ids smallint[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  removed_faction_id smallint;
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if target_faction_ids is null or cardinality(target_faction_ids) = 0 then
    raise exception 'Choose at least one faction';
  end if;
  if exists (
       select 1 from unnest(target_faction_ids) as requested(faction_id)
       where requested.faction_id is null
     )
     or (select count(distinct requested.faction_id)
         from unnest(target_faction_ids) as requested(faction_id))
        <> cardinality(target_faction_ids) then
    raise exception 'Faction selection is invalid';
  end if;
  if exists (
    select 1 from unnest(target_faction_ids) as requested(faction_id)
    where not exists (
      select 1 from public.factions f where f.id = requested.faction_id and f.is_active
    )
  ) then
    raise exception 'Faction is not active';
  end if;

  for removed_faction_id in
    update public.user_factions uf
      set membership_status = 'inactive'
      where uf.user_id = current_user_id
        and uf.membership_status = 'active'
        and not (uf.faction_id = any(target_faction_ids))
      returning uf.faction_id
  loop
    perform private.cancel_faction_assignments(current_user_id, removed_faction_id);
  end loop;

  insert into public.user_factions (user_id, faction_id)
  select current_user_id, requested.faction_id
    from unnest(target_faction_ids) as requested(faction_id)
  on conflict (user_id, faction_id) do update
    set membership_status = 'active',
        rank_level = 1,
        experience_points = 0,
        current_streak_weeks = 0,
        joined_at = now()
    where public.user_factions.membership_status in ('inactive', 'factionless');
end;
$$;

revoke all on function public.set_user_factions(smallint[]) from public;
grant execute on function public.set_user_factions(smallint[]) to authenticated;

-- Keep the older single-faction endpoint safe for any existing callers.
create or replace function public.set_faction_membership(target_faction_id smallint, should_join boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  selected_ids smallint[];
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if should_join is null then
    raise exception 'Membership choice is required';
  end if;

  select coalesce(array_agg(uf.faction_id), '{}'::smallint[])
    into selected_ids
    from public.user_factions uf
    where uf.user_id = current_user_id and uf.membership_status = 'active';

  if should_join then
    if not (target_faction_id = any(selected_ids)) then
      selected_ids := array_append(selected_ids, target_faction_id);
    end if;
  else
    selected_ids := array_remove(selected_ids, target_faction_id);
  end if;

  perform public.set_user_factions(selected_ids);
end;
$$;

revoke all on function public.set_faction_membership(smallint, boolean) from public;
grant execute on function public.set_faction_membership(smallint, boolean) to authenticated;
