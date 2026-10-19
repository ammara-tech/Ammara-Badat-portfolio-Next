# Ammara Badat — Portfolio

**Live site:** https://ammara-badat-portfolio-next.vercel.app

## Who this site is for
Recruiters, hiring managers and tech leads at South African software teams and agencies
who are hiring junior developers, plus anyone reviewing my work from the
IT Programming (ITProg26) course at Unicollege, Krugersdorp.

## The role I want
**Junior Full Stack Developer**: building complete web applications from interface to database.

- **Front end:** HTML, CSS and JavaScript, plus React and Next.js, building responsive, interactive interfaces
- **Back end and data:** Python, SQL and Supabase
- **Tools:** Git and GitHub, Vercel and AI prompting

## Pages
| Page | Route | What it shows |
|------|-------|---------------|
| Home | `/` | Intro, role, "open to work" status, key skills, links to Projects and Contact |
| About | `/about` | My background, how I like to work, and education (ITProg26, Unicollege) |
| Projects | `/projects` | Project cards loaded live from Supabase: Personal Portfolio, MyFlix, F1 Race Hub, Fish-bones, Neon Arcade, Next.js Dashboard and this site |
| Contact | `/contact` | Email, GitHub and LinkedIn, plus a contact form |
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
| `image_url` | text | Screenshot or thumbnail |
| `tags` | text[] | Tech used, shown as tags |
| `sort_order` | int | Order on the Projects page |
| `created_at` | timestamptz | When the row was added |

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

## History
This is a rebuild of my first portfolio, made with plain HTML, CSS and JavaScript:
[live site](https://ammara-badat-portfolio.vercel.app)
