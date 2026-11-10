-- Durable email outbox for weekly task assignments and evidence decisions.
create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipient_email text not null,
  event_type text not null check (event_type in ('weekly_tasks', 'evidence_approved', 'evidence_rejected')),
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index notification_outbox_pending_idx
  on public.notification_outbox (user_id, next_attempt_at)
  where status <> 'sent';

alter table public.notification_outbox enable row level security;
revoke all on public.notification_outbox from anon, authenticated;
grant select, insert, update, delete on public.notification_outbox to service_role;

create or replace function private.queue_weekly_task_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_email text;
  target_faction_name text;
begin
  if new.status = 'cancelled' then return new; end if;

  select u.email, f.name into target_email, target_faction_name
    from auth.users u
    join public.tasks t on t.id = new.task_id
    join public.factions f on f.id = t.faction_id
    where u.id = new.user_id;
  if target_email is null then return new; end if;

  insert into public.notification_outbox
    (user_id, recipient_email, event_type, dedupe_key, payload)
  select new.user_id, target_email, 'weekly_tasks',
      'weekly_tasks:' || new.user_id::text || ':' || t.faction_id::text || ':' || new.week_start_date::text,
      jsonb_build_object('week_start_date', new.week_start_date, 'faction_id', t.faction_id,
        'faction_name', target_faction_name)
    from public.tasks t
    where t.id = new.task_id
  on conflict (dedupe_key) do nothing;
  return new;
end;
$$;

create trigger queue_weekly_task_notification_after_insert
  after insert on public.task_assignments
  for each row execute function private.queue_weekly_task_notification();

create or replace function private.queue_evidence_status_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  target_email text;
  target_task_title text;
  target_faction_name text;
begin
  if old.status is not distinct from new.status or new.status not in ('approved', 'rejected') then
    return new;
  end if;

  select ta.user_id, u.email, t.title, f.name
    into target_user_id, target_email, target_task_title, target_faction_name
    from public.task_assignments ta
    join auth.users u on u.id = ta.user_id
    join public.tasks t on t.id = ta.task_id
    join public.factions f on f.id = t.faction_id
    where ta.id = new.assignment_id;
  if target_user_id is null or target_email is null then return new; end if;

  insert into public.notification_outbox
    (user_id, recipient_email, event_type, dedupe_key, payload)
  values (
    target_user_id,
    target_email,
    'evidence_' || new.status,
    'evidence:' || new.id::text || ':' || new.status,
    jsonb_build_object('evidence_id', new.id, 'task_title', target_task_title,
      'faction_name', target_faction_name)
  )
  on conflict (dedupe_key) do nothing;
  return new;
end;
$$;

create trigger queue_evidence_status_notification_after_update
  after update of status on public.evidence
  for each row execute function private.queue_evidence_status_notification();

create or replace function public.claim_my_notification_emails()
returns table (id uuid, recipient_email text, event_type text, payload jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentication is required'; end if;

  return query
    with due as (
      select n.id from public.notification_outbox n
        where n.user_id = current_user_id
          and n.next_attempt_at <= now()
          and (n.status = 'pending' or (n.status = 'sending' and n.locked_at < now() - interval '10 minutes'))
        order by n.created_at
        for update skip locked
        limit 10
    ), claimed as (
      update public.notification_outbox n
        set status = 'sending', locked_at = now()
        from due where n.id = due.id
        returning n.id, n.recipient_email, n.event_type, n.payload
    )
    select claimed.id, claimed.recipient_email, claimed.event_type, claimed.payload from claimed;
end;
$$;

create or replace function public.finish_my_notification_email(notification_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notification_outbox
    set status = 'sent', sent_at = now(), locked_at = null, last_error = null
    where id = notification_id and user_id = auth.uid() and status = 'sending';
  if not found then raise exception 'Notification is not available'; end if;
end;
$$;

create or replace function public.retry_my_notification_email(notification_id uuid, error_message text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notification_outbox
    set status = 'pending',
        attempt_count = attempt_count + 1,
        next_attempt_at = now() + make_interval(secs => least(3600, 30 * (2 ^ least(attempt_count, 7))::integer)),
        locked_at = null,
        last_error = left(error_message, 1000)
    where id = notification_id and user_id = auth.uid() and status = 'sending';
  if not found then raise exception 'Notification is not available'; end if;
end;
$$;

create or replace function public.claim_notification_emails_for_dispatch()
returns table (id uuid, user_id uuid, recipient_email text, event_type text, payload jsonb)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
    with due as (
      select n.id from public.notification_outbox n
        where n.next_attempt_at <= now()
          and (n.status = 'pending' or (n.status = 'sending' and n.locked_at < now() - interval '10 minutes'))
        order by n.created_at
        for update skip locked
        limit 50
    ), claimed as (
      update public.notification_outbox n
        set status = 'sending', locked_at = now()
        from due where n.id = due.id
        returning n.id, n.user_id, n.recipient_email, n.event_type, n.payload
    )
    select claimed.id, claimed.user_id, claimed.recipient_email, claimed.event_type, claimed.payload from claimed;
end;
$$;

revoke all on function public.claim_my_notification_emails() from public, anon;
revoke all on function public.finish_my_notification_email(uuid) from public, anon;
revoke all on function public.retry_my_notification_email(uuid, text) from public, anon;
grant execute on function public.claim_my_notification_emails() to authenticated;
grant execute on function public.finish_my_notification_email(uuid) to authenticated;
grant execute on function public.retry_my_notification_email(uuid, text) to authenticated;
revoke all on function public.claim_notification_emails_for_dispatch() from public, anon, authenticated;
grant execute on function public.claim_notification_emails_for_dispatch() to service_role;

