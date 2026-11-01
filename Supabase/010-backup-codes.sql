-- Backup codes for two-step sign-in
-- Run this once in the Supabase SQL Editor (role: postgres), after
-- 009-activity-log-messages-images.sql. Safe to run twice.
--
-- The problem: two-step sign-in needs the authenticator app on my phone. If I lose the
-- phone, I couldn't get into /admin without going into the Supabase dashboard.
--
-- The fix: 10 backup codes, each usable once. I make them on /admin (after a full
-- two-step sign-in) and keep them somewhere safe, away from my phone. If the phone is
-- lost, I sign in with my password, enter one backup code, and the old authenticator
-- is removed so I can set up the new phone straight away.
--
-- How the codes are kept safe:
--   - Only a bcrypt hash of each code is stored (like a password), never the code itself.
--     The codes are shown once, when they are made.
--   - The tables have row level security switched on and NO policies, so nobody can read
--     or change them through the API. Only the three functions below touch them.
--   - Making codes needs a full two-step sign-in (is_owner()).
--   - Using a code needs my password (my account, aal1), and wrong codes are limited:
--     after a few wrong tries in a short time, every try is refused for a while.
--   - Making codes and using one are written to the activity log.

create extension if not exists pgcrypto with schema extensions;

-- ---------- 1. "My account", with or without the second step ----------
-- is_owner() from 008 checks my user ID AND aal2. Using a backup code happens before the
-- second step, so it needs a check for my user ID on its own. The ID now lives in one place.

create or replace function public.is_owner_account()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.uid() = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid, false);
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.is_owner_account() and coalesce((auth.jwt() ->> 'aal') = 'aal2', false);
$$;

-- ---------- 2. The tables (no policies: only the functions below use them) ----------

create table if not exists public.backup_codes (
  id bigint generated always as identity primary key,
  code_hash text not null,      -- bcrypt hash; the code itself is never stored
  used_at timestamptz,          -- set when the code is used; a used code never works again
  created_at timestamptz not null default now()
);

create table if not exists public.backup_code_attempts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()   -- one row per wrong code
);

alter table public.backup_codes enable row level security;
alter table public.backup_code_attempts enable row level security;
revoke all on public.backup_codes, public.backup_code_attempts from anon, authenticated;

-- ---------- 3. The activity log learns about security events ----------

alter table public.activity_log drop constraint if exists activity_log_kind_check;
alter table public.activity_log
  add constraint activity_log_kind_check check (kind in ('project', 'message', 'image', 'security'));

alter table public.activity_log drop constraint if exists activity_log_action_check;
alter table public.activity_log
  add constraint activity_log_action_check check (
    action in (
      'added', 'edited', 'published', 'unpublished', 'reordered', 'deleted', 'received', 'uploaded',
      'codes-made', 'code-used'
    )
  );

-- ---------- 4. Make a new set of 10 codes (full two-step sign-in only) ----------
-- Old codes stop working. Each code is 8 characters, like 7KQM-3XPA, from letters and
-- digits that are hard to mix up (no 0/O, 1/I/L).

create or replace function public.make_backup_codes()
returns setof text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; -- 31 characters
  code text;
  b int;
begin
  if not public.is_owner() then
    raise exception 'Only the owner, fully signed in, can make backup codes' using errcode = '42501';
  end if;

  -- "where id is not null" means every row. Supabase refuses a DELETE with no WHERE when it
  -- comes through the API (a safety net against deleting a whole table by mistake).
  delete from public.backup_codes where id is not null;
  delete from public.backup_code_attempts where id is not null;

  for i in 1..10 loop
    code := '';
    while length(code) < 8 loop
      b := get_byte(extensions.gen_random_bytes(1), 0);
      -- 248 = 31 x 8: skipping 248-255 keeps every character equally likely
      if b < 248 then
        code := code || substr(alphabet, (b % 31) + 1, 1);
      end if;
    end loop;
    insert into public.backup_codes (code_hash) values (extensions.crypt(code, extensions.gen_salt('bf', 8)));
    return next substr(code, 1, 4) || '-' || substr(code, 5, 4);
  end loop;

  insert into public.activity_log (kind, action, project_title, actor)
  values ('security', 'codes-made', 'Backup codes', auth.uid());
end;
$$;

-- ---------- 5. How many unused codes are left (full two-step sign-in only) ----------

create or replace function public.backup_codes_left()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when public.is_owner() then (select count(*)::int from public.backup_codes where used_at is null)
    else null
  end;
$$;

-- ---------- 6. Use a code when the phone is lost (password step only) ----------
-- Returns true if the code was right. Then the old authenticator is removed, and /admin
-- shows the QR code to set up the new phone.

create or replace function public.use_backup_code(code text)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  cleaned text := upper(regexp_replace(coalesce(code, ''), '[^A-Za-z0-9]', '', 'g'));
  match_id bigint;
begin
  if not public.is_owner_account() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  -- Too many wrong codes lately: refuse every try for now
  if (select count(*) from public.backup_code_attempts where created_at > now() - interval '15 minutes') >= 5 then
    raise exception 'Too many wrong codes. Wait 15 minutes and try again.' using errcode = 'P0001';
  end if;

  select id into match_id
  from public.backup_codes
  where used_at is null
    and length(cleaned) = 8
    and code_hash = extensions.crypt(cleaned, code_hash)
  limit 1;

  if match_id is null then
    insert into public.backup_code_attempts default values;
    return false;
  end if;

  update public.backup_codes set used_at = now() where id = match_id;
  delete from public.backup_code_attempts where id is not null;

  -- Remove the lost authenticator app, so a new one can be set up.
  -- (The same as deleting the MFA factor in the dashboard: Authentication -> Users.)
  delete from auth.mfa_factors where user_id = auth.uid();

  insert into public.activity_log (kind, action, project_title, actor)
  values ('security', 'code-used', 'Backup code', auth.uid());
  return true;
end;
$$;

-- Only signed-in users can call the functions (they check for my account themselves)
revoke all on function public.make_backup_codes() from public, anon;
revoke all on function public.backup_codes_left() from public, anon;
revoke all on function public.use_backup_code(text) from public, anon;
grant execute on function public.make_backup_codes() to authenticated;
grant execute on function public.backup_codes_left() to authenticated;
grant execute on function public.use_backup_code(text) to authenticated;

-- Check (as postgres, these show the tables are locked down):
-- select tablename, rowsecurity from pg_tables where tablename in ('backup_codes', 'backup_code_attempts');
-- select count(*) from pg_policies where tablename in ('backup_codes', 'backup_code_attempts');  -- 0
