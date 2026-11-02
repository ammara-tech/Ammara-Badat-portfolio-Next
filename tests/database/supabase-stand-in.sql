-- A small stand-in for the parts of Supabase my SQL files rely on, so the database
-- rules can be tested on a plain, empty Postgres (on GitHub, or a local copy).
-- It is ONLY for tests: never run it on the real Supabase project.
--
-- What it copies from Supabase:
--   - the API roles: anon (a visitor) and authenticated (anyone signed in)
--   - auth.uid() and auth.jwt(), which read the login token, like Supabase's own
--   - auth.mfa_factors, where Supabase keeps authenticator apps
--   - storage.buckets and storage.objects, with row level security on, like Supabase Storage
--   - the supabase_realtime publication (for 006 and 007)
--   - Supabase's default rights: the API roles may use every new table in public, and
--     row level security is what actually stops them. That's the important part: the
--     tests only pass because of my policies, not because of missing rights.

-- Roles belong to the whole server, so they may already exist from an earlier run
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end;
$$;

create schema if not exists extensions;
create schema auth;
create schema storage;

grant usage on schema public, auth, storage, extensions to anon, authenticated;

-- Like Supabase: new tables, sequences and functions in public are open to the API roles
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;

-- The login token. Supabase puts it in request.jwt.claims; the tests set it the same way.
create function auth.jwt() returns jsonb
language sql stable
as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;

create function auth.uid() returns uuid
language sql stable
as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;

grant execute on function auth.jwt(), auth.uid() to anon, authenticated;

create table auth.mfa_factors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  factor_type text not null default 'totp',
  status text not null default 'verified'
);

-- Storage
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;
grant all on storage.buckets, storage.objects to anon, authenticated;

-- Realtime
create publication supabase_realtime;
