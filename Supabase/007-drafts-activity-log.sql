-- Drafts and an activity log for /admin
-- Run this once in the Supabase SQL Editor (role: postgres), BEFORE deploying the
-- code that uses it. Safe to run twice.
--
-- 1. Draft or published
--    Each project gets a "published" switch. Visitors can only read published
--    projects; my account can read everything, so drafts still show in /admin.
--    This is enforced by RLS, so a draft can't be read even by calling the API directly.
--
-- 2. Activity log
--    A trigger writes a row to activity_log every time a project is added, edited,
--    published, moved to drafts, reordered or deleted, including who did it.
--    Only my account can read the log. There are no insert, update or delete
--    policies, so nobody can add, change or remove entries from a browser: only
--    the trigger (which runs inside the database) can write to it.

-- ---------- 1. Draft or published ----------

alter table public.projects
  add column if not exists published boolean not null default true;

drop policy if exists "Anyone can read projects" on public.projects;
drop policy if exists "Anyone can read published projects" on public.projects;

create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (
    published
    or (select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid
  );

-- ---------- 2. Activity log ----------

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  action text not null check (action in ('added', 'edited', 'published', 'unpublished', 'reordered', 'deleted')),
  project_id uuid,             -- no foreign key, so history stays after a project is deleted
  project_title text not null,
  details text,                -- e.g. "summary, tags" or "as a draft"
  actor uuid,                  -- who did it (auth.uid())
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

drop policy if exists "Owner can read the activity log" on public.activity_log;

create policy "Owner can read the activity log"
  on public.activity_log for select
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

-- Belt and braces: even without policies, take away write rights from the API roles
revoke insert, update, delete, truncate on public.activity_log from anon, authenticated;

-- The trigger. "security definer" lets it write to the log, which the API roles can't.
create or replace function public.log_project_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed text[] := '{}';
  act text;
  info text;
begin
  if tg_op = 'INSERT' then
    insert into public.activity_log (action, project_id, project_title, details, actor)
    values ('added', new.id, new.title, case when new.published then null else 'as a draft' end, auth.uid());
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.activity_log (action, project_id, project_title, details, actor)
    values ('deleted', old.id, old.title, null, auth.uid());
    return old;
  end if;

  -- UPDATE: work out what changed, in plain words
  if new.title          is distinct from old.title          then changed := changed || 'title'::text; end if;
  if new.summary        is distinct from old.summary        then changed := changed || 'summary'::text; end if;
  if new.live_url       is distinct from old.live_url       then changed := changed || 'live link'::text; end if;
  if new.repo_url       is distinct from old.repo_url       then changed := changed || 'GitHub link'::text; end if;
  if new.image_url      is distinct from old.image_url      then changed := changed || 'image'::text; end if;
  if new.video_url      is distinct from old.video_url      then changed := changed || 'video'::text; end if;
  if new.case_study_url is distinct from old.case_study_url then changed := changed || 'case study link'::text; end if;
  if new.tags           is distinct from old.tags           then changed := changed || 'tags'::text; end if;

  if cardinality(changed) > 0 then
    act := 'edited';
    if new.published is distinct from old.published then
      changed := changed || (case when new.published then 'published' else 'moved to drafts' end);
    end if;
    info := array_to_string(changed, ', ');
  elsif new.published is distinct from old.published then
    act := case when new.published then 'published' else 'unpublished' end;
  elsif new.sort_order is distinct from old.sort_order then
    act := 'reordered';
    info := 'to number ' || (new.sort_order + 1);
  else
    return new; -- nothing worth logging
  end if;

  insert into public.activity_log (action, project_id, project_title, details, actor)
  values (act, new.id, new.title, info, auth.uid());
  return new;
end;
$$;

drop trigger if exists projects_activity on public.projects;

create trigger projects_activity
  after insert or update or delete on public.projects
  for each row execute function public.log_project_activity();

-- Live timeline in /admin (Realtime follows the RLS policy above, so only my account receives it)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end $$;

-- Check: every project should say published = true, and the policy list should
-- show "Anyone can read published projects"
-- select title, published from public.projects order by sort_order;
-- select policyname, cmd from pg_policies where tablename in ('projects', 'activity_log');
