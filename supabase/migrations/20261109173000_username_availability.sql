-- Public registration needs to check username availability without exposing profile rows.
create or replace function public.is_username_available(candidate_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select candidate_username is not null
    and char_length(candidate_username) between 3 and 30
    and candidate_username ~ '^[A-Za-z0-9_]+$'
    and not exists (
      select 1 from public.profiles p
      where lower(p.username) = lower(candidate_username)
    );
$$;

revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;
