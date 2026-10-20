-- Upgrade: upload project screenshots from /admin to Supabase Storage
-- Run this once in the Supabase SQL Editor (role: postgres).
-- It is safe to run again: the bucket is skipped if it exists and the
-- policies are dropped and re-created.
--
-- Who can do what:
--   everyone (the public)   -> can SEE the images (a public bucket serves files by URL)
--   only my account (owner) -> can UPLOAD, REPLACE, LIST and DELETE images
--
-- Storage files are rows in the storage.objects table, so they are protected
-- with Row Level Security policies, the same way as my projects and messages.

-- 1. The bucket: public to view, images only, 5 MB max per file
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- 2. Owner-only policies on the files in that bucket
drop policy if exists "Owner can upload project images" on storage.objects;
drop policy if exists "Owner can list project images" on storage.objects;
drop policy if exists "Owner can replace project images" on storage.objects;
drop policy if exists "Owner can delete project images" on storage.objects;

create policy "Owner can upload project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  );

-- Listing and deleting through the API also need SELECT
create policy "Owner can list project images"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  );

create policy "Owner can replace project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  )
  with check (
    bucket_id = 'project-images'
    and (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  );

create policy "Owner can delete project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  );

-- 3. Check it worked: should show the bucket and 4 policies
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'project-images';
select policyname, cmd, roles from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like '%project images%'
order by policyname;
