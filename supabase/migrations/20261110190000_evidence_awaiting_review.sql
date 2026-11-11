-- The evidence record itself starts in awaiting_review; rejected submissions
-- remain immutable and a new evidence row can be created for the same assignment.
alter table public.evidence
  drop constraint if exists evidence_status_check;

update public.evidence
  set status = 'awaiting_review'
  where status = 'pending';

alter table public.evidence
  alter column status set default 'awaiting_review';

alter table public.evidence
  add constraint evidence_status_check
  check (status in ('awaiting_review', 'approved', 'rejected'));

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

  new.status := 'awaiting_review';
  new.submitted_at := now();
  update public.task_assignments
    set status = 'awaiting_review', completed_at = null
    where id = new.assignment_id;
  return new;
end;
$$;

drop policy if exists "Users submit evidence for their own assignments" on public.evidence;
create policy "Users submit evidence for their own assignments"
  on public.evidence for insert to authenticated
  with check (
    status = 'awaiting_review'
    and exists (
      select 1 from public.task_assignments ta
      where ta.id = assignment_id and ta.user_id = (select auth.uid())
    )
  );

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

  if evidence_status is distinct from 'awaiting_review' then
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

drop policy if exists "Members review another member's pending evidence once" on public.evidence_reviews;
create policy "Members review another member's awaiting evidence once"
  on public.evidence_reviews for insert to authenticated
  with check (
    reviewer_id = (select auth.uid())
    and private.has_role((select auth.uid()), 'Member')
  );
