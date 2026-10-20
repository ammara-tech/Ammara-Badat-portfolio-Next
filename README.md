# Ammara Badat — Portfolio

**Live site:** https://ammara-badat-portfolio-next.vercel.app

## Who this site is for
Recruiters, hiring managers and tech leads at South African software teams and agencies
who are hiring junior developers, plus anyone reviewing my work from the
IT Programming (ITProg26) course at Unicollege, Krugersdorp.

## The role I want
**Junior Full Stack Developer**: building complete web applications from interface to database.

- **Front end:** HTML, CSS and JavaScript, plus React and Next.js, building responsive, interactive interfaces
- **Back end and data:** SQL and Supabase (Auth, Row Level Security)
- **Tools:** Git and GitHub, Vercel and AI prompting

## Pages
| Page | Route | What it shows |
|------|-------|---------------|
| Home | `/` | Intro, role, "open to work" status and a code card, with links to Projects and Contact |
| About | `/about` | A 30-second intro: who I am, the role I want, my education (ITProg26, Unicollege) and my 9 certifications |
| Projects | `/projects` | Project cards loaded live from Supabase, each with a screenshot, tags and live/GitHub links. The capstone is shown first |
| Case study | `/projects/nextjs-dashboard` | Capstone case study: the problem, my role, the stack, a demo video, screenshots, live and repo links, and what I'd do next |
| Skills | `/skills` | Every skill linked to evidence: a file in a repo, a commit or a live page |
| Contact | `/contact` | Email, phone, GitHub and LinkedIn |
| Admin | `/admin` | Owner-only: sign in, then add, edit and delete projects (not linked in the navbar) |

## Wireframes
- [Home](Docs/wireframe-home.png)
- [Projects](Docs/wireframe-projects.png)
- [Contact](Docs/wireframe-contact.png)

## Tech stack
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Row Level Security) · deployed on Vercel

## Database
One table, `projects`, defined in [`Supabase/schema.sql`](Supabase/schema.sql):

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `title` | text | Project name (required) |
| `summary` | text | One-line description |
| `live_url` | text | Link to the live site |
| `repo_url` | text | Link to the GitHub repo |
| `image_url` | text | Screenshot (files live in `public/projects/`) |
| `video_url` | text | Optional demo video (the capstone's lives in `public/case-study/demo.mp4`) |
| `case_study_url` | text | Link to a case study page (set for the capstone) |
| `tags` | text[] | Tech used, shown as tags |
| `sort_order` | int | Order on the Projects page |
| `created_at` | timestamptz | When the row was added |

`video_url` and `case_study_url` were added in Milestone 3 by
[`Supabase/003-screenshots-video-case-study.sql`](Supabase/003-screenshots-video-case-study.sql).

## Content
The page text lives in the `content/` folder, separate from the code:
`content/about.ts` (About, Home and Contact), `content/case-study.ts` (capstone case study) and
`content/skills.ts` (skills and their evidence links) and `content/certifications.ts` (my certificates,
shown on the About page; the images are in `public/certificates/`). Every skill must have at least one evidence
link, or the site will not build, so I can't list a skill I can't back up.

## Security: Row Level Security
RLS is enabled on `projects` with four policies:

| Policy | Who | Rule |
|--------|-----|------|
| Anyone can read projects | `anon`, `authenticated` | `select` always allowed |
| Owner can insert projects | `authenticated` | only if `auth.uid()` is my user ID |
| Owner can update projects | `authenticated` | only if `auth.uid()` is my user ID |
| Owner can delete projects | `authenticated` | only if `auth.uid()` is my user ID |

Screenshot: [Policies in Supabase](Docs/rls-policies.png)

Public sign-ups are turned off in Supabase Auth, so mine is the only account. Even if another
account existed, the policies check my exact user ID, so "any signed-in user" still cannot write.

### How I proved a visitor cannot write
Signed out, in an incognito window, I used the public anon key from the browser console to try
every operation against the live database:

| Test | Result |
|------|--------|
| Read projects | ✅ Allowed, returned all projects |
| Insert a project | ❌ Blocked: `42501 new row violates row-level security policy` (401) |
| Update MyFlix's title | ❌ Blocked: 0 rows changed |
| Delete MyFlix | ❌ Blocked: 0 rows deleted |

Screenshot: [RLS test in the browser console](Docs/rls-test-console.png)

## Environment variables
Set in Vercel (Settings → Environment Variables) and, for local development, in `.env.local`
(git-ignored). Values are never committed.

| Name | What it is |
|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key (safe in the browser because RLS protects the data) |

The Supabase service role / secret key is not used anywhere in this project.

## Run locally
1. Create `.env.local` in the project root with the two variables above.
2. Run:
```bash
npm install
npm run dev
```
3. Open http://localhost:3000.

## Use of AI
I used Claude (by Anthropic) as an AI assistant while building this site. It helped me:

- generate the wireframe images in `Docs/` from the layout I described, based on my first portfolio
- assisted in creating and editing the Next.js starter files, the navbar, the placeholder pages, the Supabase connection,
  the Projects page and the `/admin` page with code i previously used for a project that also used a similar stack to this
- write the SQL for the `projects` table
- draft parts of this README
- switch the site to my v1 portfolio colours and fonts
- build the Milestone 3 pages (Skills, case study, About, Contact)
- write the case study, About text and one-line skill descriptions, based on my own README, demo
  notes and presentation speech for the clinic platform; I checked and edited them so they are
  accurate and sound like me
- turn my certificate PDFs into web images and build the Certifications section
- build the visual upgrade: animations, scroll effects, icons, the custom 404 page, the favicon and
  the share preview image, keeping my first portfolio's colours and fonts
- compress my own screen recording of the clinic platform so it plays on the case study page


I made the decisions about the site's audience, role, pages and design, chose which projects to
include and how to describe them, set up GitHub, Supabase and Vercel myself, tested every feature,
ran the RLS test and checked the results. I went through the AI-written code and text and edited
it so I understand it and can explain it.

## History
This is a rebuild of my first portfolio, made with plain HTML, CSS and JavaScript:
[live site](https://ammara-badat-portfolio.vercel.app)
