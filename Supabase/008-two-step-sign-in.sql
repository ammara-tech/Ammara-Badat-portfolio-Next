-- Two-step sign-in (authenticator app) for /admin
-- Run this once in the Supabase SQL Editor (role: postgres). Safe to run twice.
--
-- BEFORE running it: deploy the new code, sign in to /admin and set up your
-- authenticator app (the admin page walks you through it). Then run this file.
--
-- What it does:
-- Every "owner only" rule now needs BOTH my user ID AND a two-step sign-in.
-- Supabase marks each sign-in with an "assurance level" (aal) inside the login token:
--   aal1 = password only
--   aal2 = password + a 6-digit code from my authenticator app
-- So even someone who guesses my password gets an aal1 token, and the database
-- refuses to show messages or drafts, or to change projects, images or anything else.

-- One place for the rule, used by every owner policy below
create or replace function public.is_owner()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    auth.uid() = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
    and (auth.jwt() ->> 'aal') = 'aal2',
    false
  );
$$;

-- ---------- projects ----------
drop policy if exists "Anyone can read published projects" on public.projects;
create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (published or (select public.is_owner()));

drop policy if exists "Owner can insert projects" on public.projects;
create policy "Owner can insert projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_owner()));

drop policy if exists "Owner can update projects" on public.projects;
create policy "Owner can update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "Owner can delete projects" on public.projects;
create policy "Owner can delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_owner()));

-- ---------- messages (visitors can still send them) ----------
drop policy if exists "Owner can read messages" on public.messages;
create policy "Owner can read messages"
  on public.messages for select
  to authenticated
  using ((select public.is_owner()));

drop policy if exists "Owner can update messages" on public.messages;
create policy "Owner can update messages"
  on public.messages for update
  to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

drop policy if exists "Owner can delete messages" on public.messages;
create policy "Owner can delete messages"
  on public.messages for delete
  to authenticated
  using ((select public.is_owner()));

-- ---------- activity log ----------
drop policy if exists "Owner can read the activity log" on public.activity_log;
create policy "Owner can read the activity log"
  on public.activity_log for select
  to authenticated
  using ((select public.is_owner()));

-- ---------- project images (Storage) ----------
drop policy if exists "Owner can upload project images" on storage.objects;
create policy "Owner can upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and (select public.is_owner()));

drop policy if exists "Owner can list project images" on storage.objects;
create policy "Owner can list project images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'project-images' and (select public.is_owner()));

drop policy if exists "Owner can replace project images" on storage.objects;
create policy "Owner can replace project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images' and (select public.is_owner()))
  with check (bucket_id = 'project-images' and (select public.is_owner()));

drop policy if exists "Owner can delete project images" on storage.objects;
create policy "Owner can delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and (select public.is_owner()));

-- Check: every owner policy should now mention is_owner()
-- select tablename, policyname, qual, with_check from pg_policies
-- where policyname ilike 'owner%' or policyname ilike 'anyone can read published%';
