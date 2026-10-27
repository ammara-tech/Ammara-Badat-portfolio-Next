-- Activity log for messages and images
-- Run this once in the Supabase SQL Editor (role: postgres), after
-- 008-two-step-sign-in.sql. Safe to run twice.
--
-- Until now the activity log on /admin only showed project changes.
-- This adds two more kinds of entry:
--   message: a new message arrived through the contact form, or I deleted one
--   image:   a project image was uploaded or deleted in Storage
--
-- Same rules as before: only triggers inside the database can write to the log,
-- nobody can change or remove entries from a browser, and only my account (with
-- two-step sign-in) can read it.

-- ---------- 1. A "kind" column, and the new actions ----------

alter table public.activity_log
  add column if not exists kind text not null default 'project';

alter table public.activity_log drop constraint if exists activity_log_kind_check;
alter table public.activity_log
  add constraint activity_log_kind_check check (kind in ('project', 'message', 'image'));

-- "received" (a new message) and "uploaded" (a new image) join the project actions
alter table public.activity_log drop constraint if exists activity_log_action_check;
alter table public.activity_log
  add constraint activity_log_action_check check (
    action in ('added', 'edited', 'published', 'unpublished', 'reordered', 'deleted', 'received', 'uploaded')
  );

-- project_title now holds the name shown in the timeline: a project title,
-- the sender's name or an image's file name
comment on column public.activity_log.project_title is 'What the entry is about: a project title, a sender''s name or an image file name';

-- ---------- 2. Messages ----------

create or replace function public.log_message_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- only the sender's name is copied, never their email or message
    insert into public.activity_log (kind, action, project_title, actor)
    values ('message', 'received', new.name, null);
    return new;
  end if;

  insert into public.activity_log (kind, action, project_title, actor)
  values ('message', 'deleted', old.name, auth.uid());
  return old;
end;
$$;

drop trigger if exists messages_activity on public.messages;

create trigger messages_activity
  after insert or delete on public.messages
  for each row execute function public.log_message_activity();

-- ---------- 3. Project images (Storage) ----------

create or replace function public.log_image_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  file text;
begin
  if tg_op = 'INSERT' then
    if new.bucket_id <> 'project-images' then return new; end if;
    file := regexp_replace(new.name, '^.*/', '');  -- just the file name, not the folder
    insert into public.activity_log (kind, action, project_title, actor)
    values ('image', 'uploaded', file, auth.uid());
    return new;
  end if;

  if old.bucket_id <> 'project-images' then return old; end if;
  file := regexp_replace(old.name, '^.*/', '');
  insert into public.activity_log (kind, action, project_title, actor)
  values ('image', 'deleted', file, auth.uid());
  return old;
end;
$$;

drop trigger if exists project_images_activity on storage.objects;

create trigger project_images_activity
  after insert or delete on storage.objects
  for each row execute function public.log_image_activity();

-- Nobody can call these functions directly from the API; only the triggers use them
revoke execute on function public.log_message_activity() from public, anon, authenticated;
revoke execute on function public.log_image_activity() from public, anon, authenticated;

-- Check: the log should show a "kind" for every row, and three triggers
-- select kind, action, project_title, created_at from public.activity_log order by created_at desc limit 10;
-- select tgname from pg_trigger where tgname in ('projects_activity', 'messages_activity', 'project_images_activity');
