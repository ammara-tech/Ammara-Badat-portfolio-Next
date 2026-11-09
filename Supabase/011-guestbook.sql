-- Guestbook: visitors leave a short message, and it only appears on the site after I approve it.
-- Run this once in the Supabase SQL Editor (role: postgres), BEFORE deploying the code that
-- uses it. Safe to run twice.
--
-- Who can do what:
--   visitors (anon) and signed-in users -> can ADD an entry (always as "waiting"), and READ
--                                          approved entries' name, message and date only
--   only my account with two-step       -> can read every entry, approve or hide it, and delete it
--
-- Spam protection (the database part, so it can't be skipped):
--   a trigger allows 2 entries per visitor (hashed IP) every 10 minutes and 20 an hour in total,
--   and always saves a new entry as not approved, with the database's own time.
--   The API route (app/api/guestbook/route.ts) adds the honeypot, the speed check and a no-links rule.

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  message text not null check (char_length(trim(message)) between 2 and 280),
  approved boolean not null default false,
  ip_hash text, -- a one-way hash of the visitor's IP, never the IP itself; never shown to visitors
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

-- Column rights: visitors can never read the IP hash, and can only fill in name, message and the hash
revoke all on public.guestbook from anon, authenticated;
grant select (id, name, message, approved, created_at) on public.guestbook to anon, authenticated;
grant insert (name, message, ip_hash) on public.guestbook to anon, authenticated;
grant update (approved) on public.guestbook to authenticated;
grant delete on public.guestbook to authenticated;

drop policy if exists "Anyone can sign the guestbook" on public.guestbook;
drop policy if exists "Anyone can read approved entries" on public.guestbook;
drop policy if exists "Owner can approve entries" on public.guestbook;
drop policy if exists "Owner can delete entries" on public.guestbook;

create policy "Anyone can sign the guestbook"
  on public.guestbook for insert
  to anon, authenticated
  with check (approved = false);

create policy "Anyone can read approved entries"
  on public.guestbook for select
  to anon, authenticated
  using (approved or (select public.is_owner()));

create policy "Owner can approve entries"
  on public.guestbook for update
  to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()));

create policy "Owner can delete entries"
  on public.guestbook for delete
  to authenticated
  using ((select public.is_owner()));

-- The spam limit. "security definer" lets it count entries visitors can't read.
create or replace function public.guestbook_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Visitors can't fake these
  new.created_at := now();
  new.approved := false;

  if new.ip_hash is not null and (
    select count(*) from public.guestbook g
    where g.ip_hash = new.ip_hash and g.created_at > now() - interval '10 minutes'
  ) >= 2 then
    raise exception 'You''ve just signed the guestbook. Please try again in a few minutes.'
      using errcode = 'P0001';
  end if;

  if (select count(*) from public.guestbook g where g.created_at > now() - interval '1 hour') >= 20 then
    raise exception 'The guestbook is busy right now. Please try again later.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists guestbook_rate_limit on public.guestbook;
create trigger guestbook_rate_limit
  before insert on public.guestbook
  for each row execute function public.guestbook_rate_limit();
