-- The Five Factions: initial application schema.
-- Authentication credentials and email addresses stay in Supabase Auth.

create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text,
  account_status text not null default 'active'
    check (account_status in ('active', 'suspended', 'disabled')),
  created_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 30),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_]+$')
);

create unique index profiles_username_lower_unique on public.profiles (lower(username));

create table public.roles (
  id smallint generated always as identity primary key,
  name text not null unique check (name in ('Member', 'Moderator', 'Administrator')),
  description text not null
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id smallint not null references public.roles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles (id) on delete set null,
  primary key (user_id, role_id)
);

create table public.factions (
  id smallint generated always as identity primary key,
  name text not null unique,
  description text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_factions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  faction_id smallint not null references public.factions (id) on delete restrict,
  rank_level smallint not null default 1 check (rank_level between 0 and 10),
  experience_points integer not null default 0 check (experience_points >= 0),
  current_streak_weeks integer not null default 0 check (current_streak_weeks >= 0),
  joined_at timestamptz not null default now(),
  membership_status text not null default 'active'
    check (membership_status in ('active', 'inactive', 'factionless')),
  primary key (user_id, faction_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  faction_id smallint not null references public.factions (id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null check (char_length(trim(description)) > 0),
  difficulty_level smallint not null check (difficulty_level between 1 and 10),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  is_active boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.task_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete restrict,
  week_start_date date not null,
  due_date date not null,
  status text not null default 'to_do'
    check (status in ('to_do', 'in_progress', 'awaiting_review', 'done', 'rejected', 'cancelled')),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint task_assignments_week_starts_monday
    check (extract(isodow from week_start_date) = 1),
  constraint task_assignments_due_after_start check (due_date >= week_start_date),
  constraint task_assignments_completed_consistent
    check ((status = 'done') = (completed_at is not null)),
  constraint task_assignments_user_task_week_unique unique (user_id, task_id, week_start_date)
);

create index task_assignments_user_week_idx
  on public.task_assignments (user_id, week_start_date desc);

create table public.evidence (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.task_assignments (id) on delete restrict,
  work_description text,
  reflection_text text,
  file_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_at timestamptz not null default now(),
  constraint evidence_has_content check (
    nullif(trim(work_description), '') is not null
    or nullif(trim(reflection_text), '') is not null
    or nullif(trim(file_path), '') is not null
  )
);

create index evidence_assignment_submitted_idx
  on public.evidence (assignment_id, submitted_at desc);

create table public.evidence_reviews (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence (id) on delete restrict,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected')),
  reason text,
  reviewed_at timestamptz not null default now(),
  constraint evidence_reviews_one_per_reviewer unique (evidence_id, reviewer_id)
);

create index evidence_reviews_reviewer_idx on public.evidence_reviews (reviewer_id, reviewed_at desc);

-- Role checks run as a narrowly scoped definer function to avoid recursive RLS queries.
create or replace function private.has_role(check_user_id uuid, check_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = check_user_id and r.name = check_role
  );
$$;

revoke all on function private.has_role(uuid, text) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(uuid, text) to authenticated;

-- Create the private profile and ordinary member role whenever Auth creates an account.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text;
begin
  requested_username := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
    'member_' || substr(new.id::text, 1, 8)
  );

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    requested_username,
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
  );

  insert into public.user_roles (user_id, role_id)
  select new.id, id from public.roles where name = 'Member';
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Members may choose factions, but cannot set their own rank, experience, or streak.
create or replace function private.initialize_user_faction()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.rank_level := 1;
  new.experience_points := 0;
  new.current_streak_weeks := 0;
  new.joined_at := now();
  new.membership_status := 'active';
  return new;
end;
$$;

create trigger initialize_user_faction_before_insert
  before insert on public.user_factions
  for each row execute function private.initialize_user_faction();

create or replace function private.cancel_faction_assignments(target_user_id uuid, target_faction_id smallint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.task_assignments ta
    set status = 'cancelled', completed_at = null
    from public.tasks t
    where ta.task_id = t.id
      and ta.user_id = target_user_id
      and t.faction_id = target_faction_id
      and ta.status in ('to_do', 'in_progress', 'awaiting_review', 'rejected');
  return;
end;
$$;

revoke all on function private.cancel_faction_assignments(uuid, smallint) from public;

-- Membership changes go through this transaction so leaving a faction preserves
-- rank history while cancelling only its unfinished assignments.
create or replace function public.set_faction_membership(target_faction_id smallint, should_join boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;
  if should_join is null then
    raise exception 'Membership choice is required';
  end if;

  if should_join then
    if not exists (
      select 1 from public.factions f where f.id = target_faction_id and f.is_active
    ) then
      raise exception 'Faction is not active';
    end if;
    insert into public.user_factions (user_id, faction_id)
    values (current_user_id, target_faction_id)
    on conflict (user_id, faction_id) do update
      set membership_status = 'active',
          rank_level = case when public.user_factions.membership_status = 'factionless'
            then 1 else public.user_factions.rank_level end,
          experience_points = case when public.user_factions.membership_status = 'factionless'
            then 0 else public.user_factions.experience_points end,
          current_streak_weeks = case when public.user_factions.membership_status = 'factionless'
            then 0 else public.user_factions.current_streak_weeks end,
          joined_at = case when public.user_factions.membership_status = 'factionless'
            then now() else public.user_factions.joined_at end
      where public.user_factions.membership_status in ('inactive', 'factionless');
  else
    update public.user_factions
      set membership_status = 'inactive'
      where user_id = current_user_id
        and faction_id = target_faction_id
        and membership_status = 'active';
    if found then
      perform private.cancel_faction_assignments(current_user_id, target_faction_id);
    end if;
  end if;
end;
$$;

revoke all on function public.set_faction_membership(smallint, boolean) from public;
grant execute on function public.set_faction_membership(smallint, boolean) to authenticated;

create or replace function private.guard_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'Profile id cannot be changed';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'Profile creation time cannot be changed';
  end if;
  if new.account_status is distinct from old.account_status
     and not private.has_role(auth.uid(), 'Administrator') then
    raise exception 'Only administrators can change account status';
  end if;
  return new;
end;
$$;

create trigger guard_profile_update_before_update
  before update on public.profiles
  for each row execute function private.guard_profile_update();

-- Evidence submission and its review update the assignment atomically.
create or replace function private.prepare_evidence_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assignment_status text;
  assignment_owner uuid;
begin
  select ta.status, ta.user_id
    into assignment_status, assignment_owner
    from public.task_assignments ta
    where ta.id = new.assignment_id
    for update;

  if assignment_owner is null or assignment_owner <> auth.uid() then
    raise exception 'Evidence must belong to your own assignment';
  end if;
  if assignment_status not in ('to_do', 'in_progress', 'rejected') then
    raise exception 'This assignment is not accepting evidence';
  end if;

  new.status := 'pending';
  new.submitted_at := now();
  update public.task_assignments
    set status = 'awaiting_review', completed_at = null
    where id = new.assignment_id;
  return new;
end;
$$;

create trigger prepare_evidence_before_insert
  before insert on public.evidence
  for each row execute function private.prepare_evidence_submission();

create or replace function private.apply_evidence_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  evidence_status text;
  assignment_id uuid;
  assignment_owner uuid;
begin
  select e.status, e.assignment_id, ta.user_id
    into evidence_status, assignment_id, assignment_owner
    from public.evidence e
    join public.task_assignments ta on ta.id = e.assignment_id
    where e.id = new.evidence_id
    for update of e, ta;

  if evidence_status is distinct from 'pending' then
    raise exception 'This evidence has already been decided';
  end if;
  if assignment_owner = new.reviewer_id then
    raise exception 'You cannot review your own evidence';
  end if;
  if not private.has_role(new.reviewer_id, 'Member') then
    raise exception 'Only members can review evidence';
  end if;

  update public.evidence set status = new.decision where id = new.evidence_id;
  update public.task_assignments
    set status = case when new.decision = 'approved' then 'done' else 'rejected' end,
        completed_at = case when new.decision = 'approved' then now() else null end
    where id = assignment_id;
  return new;
end;
$$;

create trigger apply_evidence_review_before_insert
  before insert on public.evidence_reviews
  for each row execute function private.apply_evidence_review();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.factions enable row level security;
alter table public.user_factions enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignments enable row level security;
alter table public.evidence enable row level security;
alter table public.evidence_reviews enable row level security;

grant select, update on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.factions to authenticated;
grant select on public.user_factions to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.task_assignments to authenticated;
grant select, insert on public.evidence to authenticated;
grant select, insert on public.evidence_reviews to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant all on public.profiles, public.roles, public.user_roles, public.factions,
  public.user_factions, public.tasks, public.task_assignments, public.evidence,
  public.evidence_reviews to service_role;

create policy "Profiles are visible to signed-in members"
  on public.profiles for select to authenticated using (true);
create policy "Members can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Signed-in users can read roles"
  on public.roles for select to authenticated using (true);
create policy "Administrators manage roles"
  on public.roles for all to authenticated
  using (private.has_role((select auth.uid()), 'Administrator'))
  with check (private.has_role((select auth.uid()), 'Administrator'));

create policy "Users read their own roles; administrators read all"
  on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or private.has_role((select auth.uid()), 'Administrator'));
create policy "Administrators manage user roles"
  on public.user_roles for all to authenticated
  using (private.has_role((select auth.uid()), 'Administrator'))
  with check (private.has_role((select auth.uid()), 'Administrator'));

create policy "Users read active factions; administrators read all"
  on public.factions for select to authenticated
  using (is_active or private.has_role((select auth.uid()), 'Administrator'));
create policy "Administrators manage factions"
  on public.factions for all to authenticated
  using (private.has_role((select auth.uid()), 'Administrator'))
  with check (private.has_role((select auth.uid()), 'Administrator'));

create policy "Users read their own faction memberships"
  on public.user_factions for select to authenticated
  using (user_id = (select auth.uid()) or private.has_role((select auth.uid()), 'Administrator'));
create policy "Signed-in users read active tasks; administrators read all"
  on public.tasks for select to authenticated
  using (is_active or private.has_role((select auth.uid()), 'Administrator'));
create policy "Administrators manage tasks"
  on public.tasks for all to authenticated
  using (private.has_role((select auth.uid()), 'Administrator'))
  with check (private.has_role((select auth.uid()), 'Administrator'));

create policy "Users read their own assignments; administrators read all"
  on public.task_assignments for select to authenticated
  using (user_id = (select auth.uid()) or private.has_role((select auth.uid()), 'Administrator'));
create policy "Administrators manage assignments"
  on public.task_assignments for all to authenticated
  using (private.has_role((select auth.uid()), 'Administrator'))
  with check (private.has_role((select auth.uid()), 'Administrator'));

create policy "Members can read evidence for community review"
  on public.evidence for select to authenticated using (true);
create policy "Users submit evidence for their own assignments"
  on public.evidence for insert to authenticated
  with check (
    status = 'pending'
    and exists (
      select 1 from public.task_assignments ta
      where ta.id = assignment_id and ta.user_id = (select auth.uid())
    )
  );

create policy "Members can read evidence reviews"
  on public.evidence_reviews for select to authenticated using (true);
create policy "Members review another member's pending evidence once"
  on public.evidence_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and private.has_role((select auth.uid()), 'Member')
    and exists (
      select 1 from public.evidence e
      join public.task_assignments ta on ta.id = e.assignment_id
      where e.id = evidence_id and e.status = 'pending'
        and ta.status = 'awaiting_review' and ta.user_id <> (select auth.uid())
    )
  );

-- Proof images are private; the path starts with the uploader's auth user id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 52428800, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Members upload evidence images to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_role((select auth.uid()), 'Member')
  );
create policy "Members can read evidence images for peer review"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'evidence'
    and private.has_role((select auth.uid()), 'Member')
  );

insert into public.roles (name, description) values
  ('Member', 'A community member who chooses factions, completes tasks, and reviews evidence.'),
  ('Moderator', 'A member who handles reports and community safety.'),
  ('Administrator', 'Manages factions, tasks, accounts, and application rules.')
on conflict (name) do nothing;

insert into public.factions (name, description) values
  ('Altruism', 'Practice generosity, empathy, and service to others.'),
  ('Intellect', 'Grow through curiosity, learning, and thoughtful problem solving.'),
  ('Grit', 'Build courage, discipline, and perseverance through effort.'),
  ('Harmony', 'Cultivate balance, patience, peace, and care.'),
  ('Verity', 'Practice honesty, integrity, and clear communication.')
on conflict (name) do nothing;
