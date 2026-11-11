-- Deleting an Auth user cascades through profiles and task assignments.
-- Preserve that cascade through evidence and its reviews so account deletion
-- removes the member's complete task and review history.
alter table public.evidence
  drop constraint evidence_assignment_id_fkey,
  add constraint evidence_assignment_id_fkey
    foreign key (assignment_id)
    references public.task_assignments (id)
    on delete cascade;

alter table public.evidence_reviews
  drop constraint evidence_reviews_evidence_id_fkey,
  add constraint evidence_reviews_evidence_id_fkey
    foreign key (evidence_id)
    references public.evidence (id)
    on delete cascade;
