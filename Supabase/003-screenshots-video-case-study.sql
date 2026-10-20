-- Milestone 3: screenshots, video links and the capstone case study
-- Run this once in the Supabase SQL Editor (role: postgres).
-- The existing RLS policies already cover the new columns, so nothing else changes.

-- 1. Two new optional columns
alter table public.projects
  add column if not exists video_url text,
  add column if not exists case_study_url text;

-- 2. Screenshot paths (the image files live in public/projects/ in the repo)
update public.projects set image_url = '/projects/personal-portfolio.png' where title = 'Personal Portfolio';
update public.projects set image_url = '/projects/myflix.png'             where title = 'MyFlix';
update public.projects set image_url = '/projects/f1-race-hub.png'        where title = 'F1 Race Hub';
update public.projects set image_url = '/projects/fish-bones.png'         where title = 'Fish-bones';
update public.projects set image_url = '/projects/neon-arcade.png'        where title = 'Neon Arcade';
update public.projects set image_url = '/projects/nextjs-dashboard.png'   where title = 'Next.js Dashboard';
update public.projects set image_url = '/projects/portfolio-v2.png'       where title = 'Portfolio v2 (this site)';

-- 3. Mark the capstone: link it to its case study page and show it first
update public.projects
set case_study_url = '/projects/nextjs-dashboard',
    sort_order = 0
where title = 'Next.js Dashboard';

-- 4. Check the result: every row should have an image_url
select title, image_url, case_study_url, sort_order
from public.projects
order by sort_order;
