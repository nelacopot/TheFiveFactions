-- Allow an uploader to remove only their own orphaned or replaced evidence image.
create policy "Members delete their own evidence images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.has_role((select auth.uid()), 'Member')
  );
