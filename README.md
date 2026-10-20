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
| Contact | `/contact` | Contact form (saved to Supabase, spam-protected), email, phone, GitHub, LinkedIn and CV download |
| CV | [`/cv/Ammara-Badat-CV.pdf`](public/cv/Ammara-Badat-CV.pdf) | One-page CV (PDF), linked from the navbar, Home, About and Contact |
| Admin | `/admin` | Owner-only: sign in, read contact form messages, and add, edit and delete projects (not linked in the navbar) |

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

## Contact form (Milestone 4)
Messages from `/contact` are saved to a `messages` table, defined in
[`Supabase/004-messages-contact-form.sql`](Supabase/004-messages-contact-form.sql).

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `name` | text | Sender's name (1–100 characters) |
| `email` | text | Sender's email (checked format) |
| `message` | text | The message (10–3000 characters) |
| `ip_hash` | text | One-way hash of the sender's IP, used only for the rate limit (the IP itself is never stored) |
| `is_read` | boolean | Whether I've read it in `/admin` |
| `created_at` | timestamptz | When it was sent |

### Who can do what (RLS)
| Policy | Who | Rule |
|--------|-----|------|
| Anyone can send a message | `anon`, `authenticated` | `insert` only, and it must arrive unread |
| Owner can read messages | `authenticated` | only if `auth.uid()` is my user ID |
| Owner can update messages | `authenticated` | only if `auth.uid()` is my user ID (mark as read) |
| Owner can delete messages | `authenticated` | only if `auth.uid()` is my user ID |

Visitors can add a message but can never read, change or delete one, including their own.
The inbox is on the `/admin` page, which only my account can use.

### Spam protection: honeypot + rate limit
I chose a **honeypot** and a **rate limit**, so real visitors never have to solve a CAPTCHA:

1. **Honeypot:** the form has a hidden "website" field that people never see and keyboard users
   can't reach. Bots fill in every field, so if it has a value the message is dropped.
2. **Speed check:** a person takes more than 3 seconds to fill in the form; bots submit instantly.
   Bots caught by 1 or 2 get a fake "sent" reply so they don't learn what gave them away
   ([`app/api/contact/route.ts`](app/api/contact/route.ts)).
3. **Rate limit in the database:** a trigger allows at most **3 messages per email address or per
   visitor every 10 minutes**, and 30 messages per hour in total. Because it runs inside Supabase,
   it also stops anyone who skips my form and calls the database directly.

### How I tested it
Before running the SQL on Supabase, I tested it on a local PostgreSQL set up like Supabase:

| Test | Result |
|------|--------|
| Visitor sends a message | ✅ Saved |
| Visitor reads messages | ❌ 0 rows |
| Visitor marks as read / deletes | ❌ 0 rows changed |
| Visitor sends a bad email or a 2-character message | ❌ Rejected by the column checks |
| 4th message from the same email or visitor within 10 minutes | ❌ "Too many messages. Please try again in a few minutes." |
| Another signed-in account reads messages | ❌ 0 rows |
| My account reads, marks as read and deletes | ✅ Works |

The form itself: a filled-in honeypot or a 1-second submission is silently dropped, bad input shows a
friendly error, and the rate limit shows this message to the visitor:
[screenshot](Docs/contact-form-rate-limit.png).

## Responsive and accessibility checks (Milestone 4)
Every page was checked at **360px and 390px (phones), 768px (tablet), 1024px and 1440px (desktop)**.

- **Layout:** no page scrolls sideways or cuts off text at any of those widths.
  [Home](Docs/responsive-home.png) · [Projects](Docs/responsive-projects.png) · [Contact](Docs/responsive-contact.png)
- **Keyboard:** every link, button and form field can be reached with Tab, in a sensible order, with a
  visible teal focus outline. A "Skip to content" link appears on the first Tab press, the phone menu
  closes with Escape, and the hidden honeypot field is skipped.
- **Contrast:** every piece of text was measured against its background and passes WCAG AA
  (4.5:1 for normal text, 3:1 for large text). Fixes: the dim grey went from `#63667a` (3.0:1) to
  `#868a9c` (4.7:1 or better), small red text uses a brighter red `#ff3b5c`, and the red buttons use
  white text (4.32:1 → 4.70:1). My racing red is kept for large headings, where it passes.
- **Worst layout bug fixed:** on phones the Home page scrolled sideways, because the long line in the
  `developer.ts` code card forced the hero column wider than the screen. I fixed it by limiting the
  grid column (`grid-cols-1` = `minmax(0, 1fr)`), letting the role line wrap, and making the code
  smaller on phones.

## Upgrade pack 2 (improves Milestones 1–4)
| Feature | Where | What it shows |
|---|---|---|
| Interactive terminal | Home | The `developer.ts` card from my first portfolio now takes commands: `help`, `about`, `skills`, `projects`, `certs`, `contact`, `cv`, `open <page>`, `theme`, `clear`. ↑/↓ repeat commands, Tab finishes a word, and quick buttons work on phones. |
| Spotlight cards | Projects, Skills, About, case study, admin | A glow and a bright edge follow the mouse. One listener for the whole site (`components/Spotlight.tsx`); does nothing on touch screens. |
| Project filters | Projects | Filter by tech. Tags come from the database, the choice is kept in the address (`?tag=Next.js`) so it can be shared, and cards slide into place with the View Transitions API. |
| Lightbox | About (certificates), case study | Full-screen viewer built on the native `<dialog>`: Escape closes it, focus is trapped and returns to the button, arrow keys and swiping move between images. |
| Image upload | /admin | Drop a screenshot into the form and it uploads to Supabase Storage, then fills in the image URL. Checks type and size (5 MB) first. |
| Admin overview | /admin | Cards for projects, unread messages and messages this week, plus a 7-day bar chart. |
| Light / dark mode | Navbar | Sun/moon button. The choice is saved in `localStorage` and applied before the page paints, so there's no flash. Every colour in light mode was checked for WCAG AA contrast. |
| Search engine extras | `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` | `/sitemap.xml`, `/robots.txt` (keeps `/admin` and `/api` out of search), and JSON-LD structured data describing me, my job title and certifications. |

### Storage security (RLS on files)
`Supabase/005-project-images-storage.sql` creates a public `project-images` bucket (images only,
5 MB max) and four policies on `storage.objects`:

| Who | View image by URL | Upload | List / replace / delete |
|---|---|---|---|
| Visitor (anon) | ✅ | ❌ | ❌ |
| Another signed-in user | ✅ | ❌ | ❌ |
| My account (owner) | ✅ | ✅ | ✅ |

I tested the policies on a local Postgres copy: a visitor and another user were blocked with
"new row violates row-level security policy", a visitor listed 0 files, another user's delete
removed 0 rows, and only the owner could upload, rename and delete.

After the upgrade the responsive (360–1440px), keyboard and contrast checks were run again in
**both** themes, and everything still passes.

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
