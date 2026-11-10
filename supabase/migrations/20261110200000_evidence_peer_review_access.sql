-- Members may read the minimum assignment and task data needed to review
-- another member's evidence which is still awaiting review.
create policy "Members read assignments for evidence review"
  on public.task_assignments for select to authenticated
  using (
    private.has_role((select auth.uid()), 'Member')
    and user_id <> (select auth.uid())
    and status = 'awaiting_review'
    and exists (
      select 1 from public.evidence e
      where e.assignment_id = public.task_assignments.id
        and e.status = 'awaiting_review'
    )
  );

drop policy if exists "Signed-in users read active tasks; administrators read all" on public.tasks;
create policy "Signed-in users read active tasks; reviewers read pending task details"
  on public.tasks for select to authenticated
  using (
    is_active
    or private.has_role((select auth.uid()), 'Administrator')
    or (
      private.has_role((select auth.uid()), 'Member')
      and exists (
        select 1
          from public.task_assignments ta
          join public.evidence e on e.assignment_id = ta.id
          where ta.task_id = public.tasks.id
            and ta.user_id <> (select auth.uid())
            and ta.status = 'awaiting_review'
            and e.status = 'awaiting_review'
      )
    )
  );
