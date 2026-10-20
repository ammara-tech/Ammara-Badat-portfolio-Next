-- Milestone 4: contact form messages
-- Run this once in the Supabase SQL Editor (role: postgres).
--
-- Who can do what:
--   visitors (anon) and signed-in users  -> can ADD a message, nothing else
--   only my account (owner)              -> can READ, mark as read (UPDATE) and DELETE
--
-- Spam protection (layer 1 is in the database, so it can't be skipped):
--   1. Rate limit trigger: max 3 messages per email address or per visitor (hashed IP)
--      every 10 minutes, and max 30 messages per hour in total.
--   2. Honeypot field + "filled in too fast" check in the API route (app/api/contact/route.ts).
--   3. Length and email-format checks on every column.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  email text not null check (
    char_length(email) between 3 and 200
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  message text not null check (char_length(trim(message)) between 10 and 3000),
  ip_hash text, -- a one-way hash of the sender's IP, never the IP itself
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Anyone can send a message, but it must arrive as a new, unread message
create policy "Anyone can send a message"
  on public.messages for insert
  to anon, authenticated
  with check (is_read = false);

-- Only the owner can read messages
create policy "Owner can read messages"
  on public.messages for select
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

-- Only the owner can mark messages as read
create policy "Owner can update messages"
  on public.messages for update
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid)
  with check ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

-- Only the owner can delete messages
create policy "Owner can delete messages"
  on public.messages for delete
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

-- Rate limit. "security definer" lets the check count existing messages,
-- which visitors themselves are not allowed to read.
create or replace function public.messages_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_from_sender int;
  recent_total int;
begin
  -- Visitors can't fake these
  new.created_at := now();
  new.is_read := false;

  select count(*) into recent_from_sender
  from public.messages m
  where m.created_at > now() - interval '10 minutes'
    and (
      lower(m.email) = lower(new.email)
      or (new.ip_hash is not null and m.ip_hash = new.ip_hash)
    );

  if recent_from_sender >= 3 then
    raise exception 'Too many messages. Please try again in a few minutes.'
      using errcode = 'P0001';
  end if;

  select count(*) into recent_total
  from public.messages m
  where m.created_at > now() - interval '1 hour';

  if recent_total >= 30 then
    raise exception 'The inbox is busy right now. Please try again later.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.messages_rate_limit();
