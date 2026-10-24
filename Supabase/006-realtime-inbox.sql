-- Live admin inbox
-- Run this once in the Supabase SQL Editor (role: postgres).
--
-- Turns on Supabase Realtime for the messages table, so a new contact form
-- message appears in /admin without refreshing (components/Inbox.tsx).
--
-- Security: Realtime follows the RLS policies from 004-messages-contact-form.sql.
-- A browser is only sent the rows it is allowed to SELECT, so visitors and other
-- accounts receive nothing. Only my account ("Owner can read messages") gets them.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- Check: this should return one row for public.messages
-- select * from pg_publication_tables where pubname = 'supabase_realtime';
