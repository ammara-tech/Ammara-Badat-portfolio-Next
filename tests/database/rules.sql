-- Automatic tests for my database rules (row level security, the two-step rule,
-- the spam limit and the backup codes).
-- run.sh loads tests/database/supabase-stand-in.sql and every file in Supabase/ first,
-- then this file. Every check runs inside a small transaction that is always undone,
-- so the checks can't affect each other, and nothing is left behind.
--
-- The four people the checks pretend to be:
--   visitor   - not signed in (the anon role), like anyone on the internet
--   stranger  - someone else's account, signed in with two-step (aal2)
--   password  - MY account, but only the password step done (aal1), like someone who guessed it
--   owner     - my account with both steps (aal2), like me on /admin

-- Hide the output of each step; only the results table at the end is shown
\o /dev/null

create schema test;
grant usage on schema test to anon, authenticated;

create table test.results (
  id serial primary key,
  who text not null,
  label text not null,
  passed boolean not null,
  detail text
);
grant insert, select on test.results to anon, authenticated;
grant usage on sequence test.results_id_seq to anon, authenticated;

-- Pretend to be someone: switches the database role and the login token, like the API does
create function test.become(who text) returns void
language plpgsql
as $$
declare
  owner_id constant text := 'ed0dcf97-9b0a-460e-8ab3-0d025847c218';
  stranger_id constant text := '22222222-2222-2222-2222-222222222222';
begin
  perform set_config('test.who', who, false);
  case who
    when 'visitor' then
      perform set_config('request.jwt.claims', '{"role": "anon"}', false);
      perform set_config('role', 'anon', false);
    when 'stranger' then
      perform set_config('request.jwt.claims', json_build_object('sub', stranger_id, 'role', 'authenticated', 'aal', 'aal2')::text, false);
      perform set_config('role', 'authenticated', false);
    when 'password' then
      perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated', 'aal', 'aal1')::text, false);
      perform set_config('role', 'authenticated', false);
    when 'owner' then
      perform set_config('request.jwt.claims', json_build_object('sub', owner_id, 'role', 'authenticated', 'aal', 'aal2')::text, false);
      perform set_config('role', 'authenticated', false);
    else
      raise exception 'Unknown person: %', who;
  end case;
end;
$$;
grant execute on function test.become(text) to anon, authenticated;

-- Runs one statement and undoes it straight after (by raising, then catching, an error).
-- Returns how many rows it read or changed, or -1 if the database refused it.
create function test.attempt(statement text, out affected int, out refusal text)
language plpgsql
as $$
begin
  affected := 0;
  refusal := null;
  begin
    if statement ~* '^\s*(select|with)' then
      execute format('select count(*) from (%s) q', statement) into affected;
    else
      execute statement;
      get diagnostics affected = row_count;
    end if;
    raise exception using errcode = 'TT001'; -- undo everything the statement did
  exception
    when sqlstate 'TT001' then null;
    when others then
      affected := -1;
      refusal := sqlerrm;
  end;
end;
$$;
grant execute on function test.attempt(text) to anon, authenticated;

-- A check: "this person can (or can't) do this".
--   expect 'blocked': refused, or zero rows read or changed
--   expect 'allowed': at least one row read or changed
--   expect a number:  exactly that many rows
create function test.check(label text, statement text, expect text) returns void
language plpgsql
as $$
declare
  r record;
  ok boolean;
begin
  select * into r from test.attempt(statement);
  ok := case expect
    when 'blocked' then r.affected <= 0
    when 'allowed' then r.affected > 0
    else r.affected = expect::int
  end;
  insert into test.results (who, label, passed, detail)
  values (
    current_setting('test.who'),
    label,
    ok,
    case when ok then null
         else format('expected %s, got %s', expect, coalesce('refused: ' || r.refusal, r.affected || ' rows')) end
  );
end;
$$;
grant execute on function test.check(text, text, text) to anon, authenticated;

-- ---------- Starting data (added as postgres, like the SQL Editor) ----------
insert into public.projects (title, summary, published, sort_order) values ('Secret draft', 'Not ready yet', false, 99);
insert into public.messages (name, email, message) values ('Thabo', 'thabo@example.com', 'Hello, I would like to hire you.');
insert into storage.buckets (id, name) values ('avatars', 'avatars'); -- another bucket, to check the image rules only cover project-images
insert into storage.objects (bucket_id, name) values ('project-images', 'covers/cover.png');
insert into public.guestbook (name, message, ip_hash) values ('Naledi', 'Lovely portfolio!', 'hash-naledi'), ('Spammer', 'Waiting for approval', 'hash-spam');
update public.guestbook set approved = true where name = 'Naledi'; -- new entries always start as waiting
insert into auth.mfa_factors (user_id) values ('ed0dcf97-9b0a-460e-8ab3-0d025847c218'), ('22222222-2222-2222-2222-222222222222');

-- ======================================================================
-- Visitor
-- ======================================================================
select test.become('visitor');
select test.check('can read published projects', 'select * from public.projects where published', 'allowed');
select test.check('can''t read drafts', 'select * from public.projects where not published', 'blocked');
select test.check('can''t add a project', $$insert into public.projects (title) values ('Hacked')$$, 'blocked');
select test.check('can''t edit a project', $$update public.projects set title = 'Hacked'$$, 'blocked');
select test.check('can''t delete a project', 'delete from public.projects', 'blocked');
select test.check('can send a message', $$insert into public.messages (name, email, message) values ('Lerato', 'lerato@example.com', 'Hi, this is a test message.')$$, '1');
select test.check('can''t read messages', 'select * from public.messages', 'blocked');
select test.check('can''t mark messages as read', 'update public.messages set is_read = true', 'blocked');
select test.check('can''t delete messages', 'delete from public.messages', 'blocked');
select test.check('can''t read the activity log', 'select * from public.activity_log', 'blocked');
select test.check('can''t write to the activity log', $$insert into public.activity_log (action, project_title) values ('added', 'Fake')$$, 'blocked');
select test.check('can''t upload images', $$insert into storage.objects (bucket_id, name) values ('project-images', 'evil.png')$$, 'blocked');
select test.check('can''t list images', $$select * from storage.objects where bucket_id = 'project-images'$$, 'blocked');
select test.check('can''t delete images', $$delete from storage.objects where bucket_id = 'project-images'$$, 'blocked');
select test.check('can''t read backup codes', 'select * from public.backup_codes', 'blocked');
select test.check('can''t make backup codes', 'select public.make_backup_codes()', 'blocked');
select test.check('can''t try a backup code', $$select public.use_backup_code('AAAA-BBBB')$$, 'blocked');
select test.check('can sign the guestbook', $$insert into public.guestbook (name, message) values ('Sipho', 'Great work!')$$, '1');
select test.check('a new guestbook entry can''t approve itself', $$insert into public.guestbook (name, message, approved) values ('Sipho', 'Approve me')$$, 'blocked');
select test.check('can read approved guestbook entries', 'select id, name, message, created_at from public.guestbook', '1');
select test.check('can''t read the IP hashes', 'select ip_hash from public.guestbook', 'blocked');
select test.check('can''t approve guestbook entries', 'update public.guestbook set approved = true', 'blocked');
select test.check('can''t delete guestbook entries', 'delete from public.guestbook', 'blocked');

-- ======================================================================
-- Stranger: someone else's account, fully signed in
-- ======================================================================
select test.become('stranger');
select test.check('can read published projects', 'select * from public.projects where published', 'allowed');
select test.check('can''t read drafts', 'select * from public.projects where not published', 'blocked');
select test.check('can''t add a project', $$insert into public.projects (title) values ('Hacked')$$, 'blocked');
select test.check('can''t edit a project', $$update public.projects set title = 'Hacked'$$, 'blocked');
select test.check('can''t delete a project', 'delete from public.projects', 'blocked');
select test.check('can''t read messages', 'select * from public.messages', 'blocked');
select test.check('can''t delete messages', 'delete from public.messages', 'blocked');
select test.check('can''t read the activity log', 'select * from public.activity_log', 'blocked');
select test.check('can''t upload images', $$insert into storage.objects (bucket_id, name) values ('project-images', 'evil.png')$$, 'blocked');
select test.check('can''t read backup codes', 'select * from public.backup_codes', 'blocked');
select test.check('can''t make backup codes', 'select public.make_backup_codes()', 'blocked');
select test.check('can''t use a backup code', $$select public.use_backup_code('AAAA-BBBB')$$, 'blocked');
select test.check('can''t count my backup codes', 'select public.backup_codes_left() where public.backup_codes_left() is not null', 'blocked');
select test.check('sees only approved guestbook entries', 'select id from public.guestbook', '1');
select test.check('can''t approve guestbook entries', 'update public.guestbook set approved = true', 'blocked');
select test.check('can''t delete guestbook entries', 'delete from public.guestbook', 'blocked');

-- ======================================================================
-- Password only: my account, but without the authenticator code
-- ======================================================================
select test.become('password');
select test.check('can''t read drafts', 'select * from public.projects where not published', 'blocked');
select test.check('can''t add a project', $$insert into public.projects (title) values ('Hacked')$$, 'blocked');
select test.check('can''t edit a project', $$update public.projects set title = 'Hacked'$$, 'blocked');
select test.check('can''t delete a project', 'delete from public.projects', 'blocked');
select test.check('can''t read messages', 'select * from public.messages', 'blocked');
select test.check('can''t mark messages as read', 'update public.messages set is_read = true', 'blocked');
select test.check('can''t delete messages', 'delete from public.messages', 'blocked');
select test.check('can''t read the activity log', 'select * from public.activity_log', 'blocked');
select test.check('can''t upload images', $$insert into storage.objects (bucket_id, name) values ('project-images', 'evil.png')$$, 'blocked');
select test.check('can''t delete images', $$delete from storage.objects where bucket_id = 'project-images'$$, 'blocked');
select test.check('can''t make backup codes', 'select public.make_backup_codes()', 'blocked');
select test.check('a wrong backup code doesn''t work', $$select 1 where public.use_backup_code('AAAA-BBBB')$$, 'blocked');
select test.check('can''t see waiting guestbook entries', 'select id from public.guestbook where not approved', 'blocked');
select test.check('can''t approve guestbook entries', 'update public.guestbook set approved = true', 'blocked');

-- ======================================================================
-- Owner: my account with both steps
-- ======================================================================
select test.become('owner');
select test.check('can read drafts', 'select * from public.projects where not published', 'allowed');
select test.check('can add a project', $$insert into public.projects (title) values ('New project')$$, '1');
select test.check('can edit a project', $$update public.projects set summary = 'Changed' where title = 'Secret draft'$$, '1');
select test.check('can delete a project', $$delete from public.projects where title = 'Secret draft'$$, '1');
select test.check('can read messages', 'select * from public.messages', 'allowed');
select test.check('can mark messages as read', 'update public.messages set is_read = true', 'allowed');
select test.check('can delete messages', 'delete from public.messages', 'allowed');
select test.check('can read the activity log', 'select * from public.activity_log', 'allowed');
select test.check('can''t fake an activity log entry', $$insert into public.activity_log (action, project_title) values ('added', 'Fake')$$, 'blocked');
select test.check('can''t change the activity log', $$update public.activity_log set project_title = 'Changed'$$, 'blocked');
select test.check('can''t delete the activity log', 'delete from public.activity_log', 'blocked');
select test.check('can upload images', $$insert into storage.objects (bucket_id, name) values ('project-images', 'new.png')$$, '1');
select test.check('can''t upload to another bucket', $$insert into storage.objects (bucket_id, name) values ('avatars', 'x.png')$$, 'blocked');
select test.check('can make 10 backup codes', 'select public.make_backup_codes()', '10');
select test.check('even I can''t read the stored codes directly', 'select * from public.backup_codes', 'blocked');
select test.check('can see waiting guestbook entries', 'select id from public.guestbook where not approved', '1');
select test.check('can approve a guestbook entry', 'update public.guestbook set approved = true where not approved', '1');
select test.check('can delete a guestbook entry', 'delete from public.guestbook', 'allowed');

-- ======================================================================
-- Spam limit and backup codes, step by step (these keep their changes on purpose)
-- ======================================================================
reset role;
select test.become('visitor');
select set_config('test.who', 'spam limit', false);
insert into public.guestbook (name, message, ip_hash) values ('Bot', 'Second one', 'hash-spam');
insert into public.messages (name, email, message) values ('Bot', 'bot@example.com', 'Message number one, hello.');
insert into public.messages (name, email, message) values ('Bot', 'bot@example.com', 'Message number two, hello.');
insert into public.messages (name, email, message) values ('Bot', 'bot@example.com', 'Message number three, hello.');
select test.check('a 4th message from the same email in 10 minutes is refused', $$insert into public.messages (name, email, message) values ('Bot', 'bot@example.com', 'Message number four, hello.')$$, 'blocked');
select test.check('a 3rd guestbook entry from the same visitor in 10 minutes is refused',
  $$insert into public.guestbook (name, message, ip_hash) values ('Bot', 'Third one', 'hash-spam')$$, 'blocked');
select test.check('someone else can still send a message', $$insert into public.messages (name, email, message) values ('Ayesha', 'ayesha@example.com', 'Hello there, nice site!')$$, '1');

-- Make a real set of codes as the owner and keep one, to use it as "password only"
reset role;
select test.become('owner');
create temporary table my_codes on commit preserve rows as select public.make_backup_codes() as code;
reset role;
grant select on my_codes to authenticated;

select test.become('password');
select set_config('test.who', 'backup codes', false);
select test.check('a real code works with just the password', $$select 1 where public.use_backup_code((select code from my_codes limit 1))$$, '1');
-- (that check was undone, so now use it for real)
select public.use_backup_code((select code from my_codes limit 1)) as first_use;
select test.check('the same code never works twice', $$select 1 where public.use_backup_code((select code from my_codes limit 1))$$, 'blocked');
select test.check('typed in small letters without the dash, a code still works', $$select 1 where public.use_backup_code(lower(replace((select code from my_codes offset 1 limit 1), '-', '')))$$, '1');

reset role;
select set_config('test.who', 'backup codes', false);
insert into test.results (who, label, passed, detail)
select 'backup codes', 'using a code removed my authenticator, and only mine',
       (select count(*) from auth.mfa_factors where user_id = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218') = 0
       and (select count(*) from auth.mfa_factors where user_id = '22222222-2222-2222-2222-222222222222') = 1,
       null;
insert into test.results (who, label, passed, detail)
select 'backup codes', 'only hashes are stored, never the codes',
       not exists (select 1 from public.backup_codes b join my_codes c on b.code_hash = replace(c.code, '-', '')),
       null;

select test.become('password');
select set_config('test.who', 'backup codes', false);
select public.use_backup_code('ZZZZ-ZZZZ'), public.use_backup_code('ZZZZ-ZZZZ'), public.use_backup_code('ZZZZ-ZZZZ'),
       public.use_backup_code('ZZZZ-ZZZZ'), public.use_backup_code('ZZZZ-ZZZZ');
select test.check('after several wrong codes, even a right one is refused for a while', $$select 1 where public.use_backup_code((select code from my_codes offset 2 limit 1))$$, 'blocked');

-- ======================================================================
-- Results
-- ======================================================================
reset role;
\o
select case when passed then 'ok  ' else 'FAIL' end as " ", who, label, coalesce(detail, '') as detail
from test.results order by id;

do $$
declare
  failed int := (select count(*) from test.results where not passed);
  total int := (select count(*) from test.results);
begin
  if failed > 0 then
    raise exception '% of % database checks failed', failed, total;
  end if;
  raise notice 'All % database checks passed', total;
end;
$$;
