-- Projects table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  live_url text,
  repo_url text,
  image_url text,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Turn on Row Level Security
alter table public.projects enable row level security;

-- Anyone (signed in or not) can read projects
create policy "Anyone can read projects"
  on public.projects for select
  to anon, authenticated
  using (true);

-- Only the owner can insert, update or delete
create policy "Owner can insert projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

create policy "Owner can update projects"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid)
  with check ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid);

create policy "Owner can delete projects"
  on public.projects for delete
  to authenticated
  using ((select auth.uid()) = 'ed0dcf97-9b0a-460e-8ab3-0d025847c218'::uuid)

-- Table: public.projects values:
insert into public.projects (title, summary, live_url, repo_url, tags, sort_order) values
('Personal Portfolio',
 'My first developer portfolio, built from scratch with plain HTML, CSS and JavaScript.',
 'https://ammara-badat-portfolio.vercel.app',
 'https://github.com/ammara-tech/Ammara-Badat-portfolio',
 '{HTML,CSS,JavaScript}', 1),
('MyFlix',
 'A movie & TV browsing app with a searchable catalogue.',
 'https://myflix-lemon.vercel.app/',
 'https://github.com/ammara-tech/myflix',
 '{JavaScript,HTML,CSS}', 2),
('F1 Race Hub',
 'A dashboard for browsing Formula 1 race data and results.',
 'https://f1-race-hub-2026.vercel.app/',
 'https://github.com/ammara-tech/F1-Race-Hub-2026',
 '{JavaScript,HTML,CSS}', 3),
('Fish-bones',
 'An interactive game.',
 'https://fish-bones.vercel.app/',
 'https://github.com/ammara-tech/Fish-bones',
 '{JavaScript,HTML,CSS}', 4),
('Neon Arcade',
 'A retro browser arcade with 10 games and a shared progression system.',
 'https://neon-arcade-nu.vercel.app/',
 'https://github.com/ammara-tech/Neon-Arcade',
 '{JavaScript,HTML,CSS,Canvas,PWA}', 5),
('Next.js Dashboard',
 'A full stack Next.js app with an invoice dashboard and a family clinic system.',
 'https://nextjs-dashoard-psi.vercel.app',
 'https://github.com/ammara-tech/nextjs-dashoard',
 '{Next.js,TypeScript,PostgreSQL,Supabase}', 6),
('Portfolio v2 (this site)',
 'My developer portfolio rebuilt with Next.js, TypeScript, Tailwind CSS and Supabase.',
 'https://ammara-badat-portfolio-next.vercel.app',
 'https://github.com/ammara-tech/Ammara-Badat-portfolio-Next',
 '{Next.js,TypeScript,Tailwind,Supabase}', 7);