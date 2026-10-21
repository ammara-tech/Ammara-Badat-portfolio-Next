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
| Project pages | `/projects/neon-arcade` etc. | One page per project, built from Supabase, with breadcrumbs and "More projects" |
| Dev notes | `/notes` | Short posts about what I built and learned, with an [RSS feed](https://ammara-badat-portfolio-next.vercel.app/notes/rss.xml) |
| Contact | `/contact` | Contact form (saved to Supabase, spam-protected), email, phone, GitHub, LinkedIn, CV download, "Save my contact" card and QR code |
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

## SEO, Lighthouse and profile links (Milestone 5)
**Live site:** https://ammara-badat-portfolio-next.vercel.app

### Lighthouse scores (mobile)
| Home | 96 | 100 | 100 | 100 |

![Lighthouse scores](Docs/lighthouse-home.png)

**What Lighthouse flagged and how I fixed it:** My first mobile run scored 74 for Performance. The
load-in animations kept my heading and intro invisible for about 2 seconds (Largest Contentful Paint
3.4 s, Speed Index 5.1 s), and too much JavaScript ran at load (Total Blocking Time 550 ms). I made the
animations slide in without hiding the content, loaded the Ctrl+K search, image viewer and spotlight
effect only after the page appears, and cut the heading font from 4 weights to 2. Performance went
74 → 88 → 96.


Lighthouse also runs automatically: after every production deploy, a GitHub Action
(`.github/workflows/lighthouse.yml`) checks six pages and fails if Accessibility or SEO drops below 90.
See the **Actions** tab.

### Findable: what every page has
- **Title and meta description** written for that page (`lib/seo.ts`), all under 160 characters.
- **Canonical URL**, so `/projects` and `/projects?tag=CSS` count as one page.
- **Open Graph and Twitter tags** with a share image made for each page
  (`opengraph-image.jpg` in each page folder). Every project page draws its own share image
  on the server (`app/projects/[slug]/opengraph-image.tsx`).
- **Sitemap** at [/sitemap.xml](https://ammara-badat-portfolio-next.vercel.app/sitemap.xml), which
  lists every page plus one page per project from Supabase.
- **robots.txt** at [/robots.txt](https://ammara-badat-portfolio-next.vercel.app/robots.txt), which
  keeps `/admin` and `/api` out of search results.
- **Structured data (JSON-LD)** describing me (Person, with my certifications), the website, each
  page's breadcrumbs, the projects and the case study, so Google can show richer results.

### Profile links
- **GitHub:** linked in the footer, on the Contact page, in the Ctrl+K search and in the terminal
  (`github`), and listed in my structured data. The Home page shows my latest repositories live from GitHub.
- **LinkedIn:** [linkedin.com/in/ammara-badat](https://www.linkedin.com/in/ammara-badat) — linked in the footer,
  on the Contact page and in Ctrl+K search. My portfolio URL is on my LinkedIn profile (Contact info → Website and Featured).

### Milestone 5 upgrades
| Upgrade | What it does |
|---|---|
| A page for every project | `/projects/neon-arcade` and so on, built from Supabase, with breadcrumbs, a share image and "More projects". |
| Faster images | Screenshots use Next.js `<Image>`: smaller AVIF/WebP files in the size the screen needs, lazy loading, and no layout jumps. The certificate thumbnails went from about 160 KB each to a few KB. |
| Live GitHub activity | My six most recently updated repos on the Home page, cached for an hour. |
| Ctrl+K search | Search every page, project, skill and certificate, or download my CV, from anywhere. Also opens from the navbar and the terminal (`search`). |
| Installable site | A web app manifest and icons, so the portfolio can be added to a phone's home screen. |
| Speed Insights and Analytics | Vercel's cookie-free visit counts and real visitors' loading times. |
| Lighthouse CI | The GitHub Action above. |

### Milestone 5 extras
| Extra | What it does |
|---|---|
| Google Search Console | The site is verified with Google and the sitemap is submitted, so Google indexes every page. The verification code comes from the `GOOGLE_SITE_VERIFICATION` setting in Vercel (`app/layout.tsx`). |
| Dev notes + RSS | Three short posts (`content/notes.ts`), each with its own page, share image and structured data, plus an RSS feed at `/notes/rss.xml`. New notes are added to the sitemap, the feed and Ctrl+K search automatically. |
| Page transitions | `app/template.tsx`: a red-to-teal stripe sweeps across the top and the new page glides up on every page change. The page is never hidden, so it doesn't hurt Lighthouse. |
| Save my contact + QR code | On the Contact page: a vCard file (`/ammara-badat.vcf`) that adds me to a phone's contacts in one tap, and a QR code that opens the site. |
| Lighthouse badge | My latest scores in the footer, linked to the screenshot that proves them. |

## Environment variables
Set in Vercel (Settings → Environment Variables) and, for local development, in `.env.local`
(git-ignored). Values are never committed.

| Name | What it is |
|------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key (safe in the browser because RLS protects the data) |
| `GOOGLE_SITE_VERIFICATION` (optional) | The code from Google Search Console's "HTML tag" method, e.g. `abc123…` (only the code, not the whole tag). |
| `GITHUB_TOKEN` (optional) | A read-only GitHub token. Only raises the GitHub API limit for the "Live from GitHub" section. |

The Supabase service role / secret key is not used anywhere in this project.

## Setup (run it yourself)
You need Node.js 20 or newer, a free [Supabase](https://supabase.com) project and, to deploy, a
free [Vercel](https://vercel.com) account.

### 1. Supabase
1. Create a Supabase project.
2. **Create the owner account:** Authentication → Users → **Add user** (email and password). Copy the
   user's **UID**.
3. **Turn off sign-ups**, so nobody else can create an account: Authentication → Sign In / Providers →
   Email → switch off **Allow new users to sign up**.
4. In the SQL files in `Supabase/`, replace my UID (`ed0dcf97-9b0a-460e-8ab3-0d025847c218`) with yours.
   It is what makes the RLS policies "owner only".
5. Open the **SQL Editor** and run the files **in this order**:

| Order | File | What it creates |
|---|---|---|
| 1 | `schema.sql` | `projects` table, RLS (anyone reads, only the owner writes) and my starting projects |
| 2 | `003-screenshots-video-case-study.sql` | Video and case study columns, screenshot paths, capstone first |
| 3 | `004-messages-contact-form.sql` | `messages` table for the contact form, owner-only reading and the spam rate limit |
| 4 | `005-project-images-storage.sql` | `project-images` Storage bucket and owner-only upload policies |

6. Copy the **Project URL** and the **anon / publishable key** from Project Settings → API.

### 2. Run locally
1. Create `.env.local` in the project root (it is git-ignored):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
   Use only the base URL, with nothing after `.supabase.co`.
2. Install and start:
```bash
npm install
npm run dev
```
3. Open http://localhost:3000. Sign in at http://localhost:3000/admin with the owner account.

### 3. Deploy
1. Import the GitHub repo into Vercel.
2. Add the environment variables from the table above (Settings → Environment Variables).
3. Deploy. Every push to `main` deploys again, and the Lighthouse GitHub Action then checks the live site.

### How the code works
A plain-English guide to every part of the code is in [Docs/how-it-works.md](Docs/how-it-works.md).

## Use of AI
I built this site with Claude (by Anthropic) as an AI pair programmer. AI use was allowed for this
project, and this is how we split the work.

**What I did**
- Decided who the site is for, the role I want, the pages, the design direction (my first
  portfolio's colours and style) and every feature that was added
- Chose which projects, certificates and evidence to show, and how to describe them
- Set up and ran everything outside the code: GitHub, Vercel, Supabase (tables, SQL, Auth, sign-ups off,
  Storage), Google Search Console and LinkedIn
- Tested every feature on the live site, ran the RLS tests and Lighthouse audits, and reported
  the problems I found, which drove the fixes (for example the Vercel build errors and the 74 → 96
  performance work)
- Recorded the clinic platform demo, took all the screenshots and proof images, and wrote and
  edited my reflections, About text and dev notes
- Reviewed, committed and deployed every change, and learned how each part works
  (see [Docs/how-it-works.md](Docs/how-it-works.md))

**What Claude did**
- Wrote most of the code from my requirements: the pages and components, the Supabase connection,
  the SQL and RLS policies, the contact form's spam protection, and the SEO and performance work
- Generated the wireframe images, the CV PDF, the share images and the LinkedIn banner
- Drafted parts of the README, reflections, case study, dev notes and LinkedIn text, which I edited
- Explained the code so I could understand and present it

I can explain how every part of the site works, and the guide I used to learn it is in the Docs folder.

## History
This is a rebuild of my first portfolio, made with plain HTML, CSS and JavaScript:
[live site](https://ammara-badat-portfolio.vercel.app)
