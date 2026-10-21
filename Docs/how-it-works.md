# How my portfolio works

A plain-English guide to the code, so I can explain any part of it.
Words in **bold** are explained the first time they appear.

---

## 1. The big picture

My site is a **Next.js** app (a framework, a ready-made structure, built on top of React) written in
**TypeScript** (JavaScript with types, so mistakes like passing text where a number belongs are
caught before the site runs) and styled with **Tailwind CSS** (small ready-made classes like `p-4` or
`text-teal` instead of writing CSS files).

It has three parts that work together:

| Part | Job | Where |
|---|---|---|
| **Vercel** | Hosts the site. Every push to `main` on GitHub builds and publishes it. | vercel.com |
| **Supabase** | The **database** (where data is stored) and **Auth** (sign-in). Holds my projects, contact messages and uploaded images. | supabase.com |
| **GitHub** | Stores the code and its history. Also runs Lighthouse after every deploy. | github.com |

```
Visitor's browser ──► Vercel (my Next.js code) ──► Supabase (database, sign-in, images)
```

---

## 2. Where everything lives

```
app/            Pages. Each folder is a web address (app/about/page.tsx = /about)
components/     Reusable building blocks (Navbar, ContactForm, Terminal, ...)
content/        My words: about.ts, case-study.ts, skills.ts, certifications.ts, notes.ts
lib/            Helpers: Supabase connection, SEO, theme, project loading
public/         Files served as they are: screenshots, certificates, CV, video, icons
Supabase/       The SQL I ran in Supabase to create tables and security rules
Docs/           Wireframes, screenshots that prove things work, and this guide
.github/        The Lighthouse check that runs on GitHub
```

**Why my words are in `content/`:** the pages only handle layout. To change my About text or add a
certificate, I edit one file and every page that uses it updates.

---

## 3. How pages work (the App Router)

Next.js uses **file-based routing**: the folder name is the address.

| File | Address |
|---|---|
| `app/page.tsx` | `/` (Home) |
| `app/about/page.tsx` | `/about` |
| `app/projects/[slug]/page.tsx` | `/projects/neon-arcade`, `/projects/myflix`, ... The `[slug]` part is a **dynamic segment**: one file makes a page for every project. |
| `app/api/contact/route.ts` | `/api/contact`, an **API route** (code that runs on the server and answers requests instead of showing a page) |

Special files:
- `app/layout.tsx` wraps **every** page: the `<html>`, fonts, navbar, footer and the skip link.
- `app/template.tsx` also wraps every page but is created fresh on each page change. That's why the
  page-change animation plays every time.
- `app/not-found.tsx` is my custom 404 page ("Off the track").

### Server components and client components
This is the most important idea in the project.

- **Server components** (the default) run on Vercel's server. They can read the database directly,
  and the visitor only receives finished HTML, so they're fast. Example: `app/projects/page.tsx`
  loads projects from Supabase on the server.
- **Client components** start with `"use client"` and run in the visitor's browser. I only use them
  when something needs to react to the visitor: clicks, typing, state. Examples: `ContactForm`,
  `Navbar` (the phone menu opens and closes), `Terminal`, `ThemeToggle`.

**State** (data a component remembers that can change, like "is the menu open?") is kept with
React's `useState`. `useEffect` runs code after the component appears, for example to add a
keyboard listener.

---

## 4. Supabase: data, sign-in and security

### The connection (`lib/supabase.ts`)
- Two settings come from Vercel's **environment variables** (settings kept outside the code, so
  nothing private is in GitHub): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `publicClient()` is used on the server for public pages. It never signs in, so it reads data the
  same way a visitor would.
- `getBrowserClient()` is used in the browser on `/admin`. It remembers who is signed in.
- The settings are read **lazily** (only when needed, not when the file loads). That fixed my first
  Vercel build crash, because the build doesn't have a database connection.

### Tables
| Table | What's in it | SQL file |
|---|---|---|
| `projects` | title, summary, links, image, tags, order | `schema.sql`, `003-...sql` |
| `messages` | contact form messages: name, email, message, read/unread, a hashed IP | `004-...sql` |
| `storage.objects` | images uploaded from /admin (Supabase Storage keeps files as rows too) | `005-...sql` |

### Row Level Security (RLS): the heart of the security
The anon key is **public**: anyone can find it in the browser. So the website can't be what keeps
people out; the **database** must. **RLS** is a set of rules (called **policies**) on each table.
Once it's switched on, the database refuses everything unless a policy allows it.

My policies:

| Table | Read | Add | Edit | Delete |
|---|---|---|---|---|
| projects | everyone | owner only | owner only | owner only |
| messages | owner only | **everyone** (it's a contact form) | owner only | owner only |
| project images | everyone (public bucket) | owner only | owner only | owner only |

"Owner only" is this check:
```sql
(select auth.uid()) = 'ed0dcf97-...'::uuid
```
`auth.uid()` is the ID of whoever is signed in. If it isn't my ID, the database says no. Even if
someone copied my code and sent requests themselves, they would be refused.

**How I proved it** (`Docs/rls-test-console.png`): as a visitor, in the browser console, adding a
project failed with error **42501** ("violates row-level security policy"). Editing and deleting
changed nothing and returned an empty list `[]`, because the visitor can't "see" any rows to change.

### The admin page (`app/admin/page.tsx`)
1. Checks whether someone is signed in (`supabase.auth.getSession()`).
2. Not signed in → shows the sign-in form (`signInWithPassword`).
3. Signed in → shows the dashboard: overview cards, the inbox and the add/edit/delete form.
4. After saving, it checks that a row actually came back. If not, it shows
   "Nothing was saved. You may not have permission", because RLS blocks updates silently.

Sign-ups are switched off in Supabase, so nobody else can even create an account. `/admin` isn't in
the navbar, and `robots` tells search engines not to list it.

---

## 5. The contact form and spam protection

**Flow:** `ContactForm.tsx` (browser) → `POST /api/contact` (server, `app/api/contact/route.ts`)
→ `messages` table (Supabase) → my inbox on `/admin` (`Inbox.tsx`).

**Three layers of spam protection, with no CAPTCHA:**
1. **Honeypot:** a hidden field called `website`. People can't see or Tab to it, but bots fill in
   every field. If it has anything in it, the message is thrown away.
2. **Too fast:** the form remembers when it was opened. Sent in under 3 seconds = a bot.
   For layers 1 and 2, the server still answers "sent", so the bot doesn't learn what gave it away.
3. **Rate limit in the database:** a **trigger** (code the database runs automatically before
   saving each row) in `004-...sql` allows at most 3 messages per email or visitor every 10 minutes,
   and 30 an hour in total. It runs inside Supabase, so it can't be skipped.

**The visitor's IP address is never stored.** The server stores a **hash** instead (a one-way
scramble with SHA-256; the same IP always gives the same hash, but you can't turn the hash back into
the IP). That's enough to count messages per visitor.

The API route checks the same rules as the database (name, valid email, 10–3000 characters) so
people get a friendly message. If the database's rate limit says no (error code `P0001`), the
route answers with **429** ("Too Many Requests").

---

## 6. Projects

- `lib/projects.ts` → `loadProjects()` reads the `projects` table, ordered by `sort_order`.
- `app/projects/page.tsx` (server) loads them, then passes them to `ProjectGrid.tsx` (client), which
  adds the **tag filter**. Tags come from the projects, so a new tag in /admin becomes a filter
  automatically. The chosen tag is kept in the address (`?tag=Next.js`) so it can be shared.
- When a filter changes, cards slide into place with the **View Transitions API** (a browser feature
  that animates between two states of a page).
- **Project pages:** `lib/slug.ts` turns a title into an address ("F1 Race Hub" → `f1-race-hub`).
  `app/projects/[slug]/page.tsx` finds the project with that slug. The capstone **redirects** to its
  case study page instead.
- **Image upload** (`ImageUpload.tsx`): checks the file type and size (5 MB), uploads it to the
  `project-images` bucket with a timestamp in the name (so nothing gets overwritten), then puts its
  public URL into the form.

---

## 7. Design, theme and accessibility

- **Colours** are **design tokens** (named colours, like `--color-teal`) defined once in
  `app/globals.css`. Tailwind classes such as `bg-panel` and `text-racing` use them.
- **Light/dark mode** (`lib/theme.ts`, `ThemeToggle.tsx`): light mode adds `data-theme="light"` to
  `<html>`, which swaps every colour token. The choice is saved in **localStorage** (a small storage
  space in the browser). A tiny script in `<head>` applies it **before the page is drawn**, so there
  is no white or dark "flash".
- **Accessibility** (making the site usable for everyone, including keyboard and screen-reader users):
  - a "Skip to content" link on the first Tab press
  - a visible teal focus outline on everything you can Tab to
  - every colour pair passes **WCAG AA** contrast (the web's standard for readable text: 4.5 to 1
    for normal text)
  - animations switch off when the visitor's device asks for **reduced motion**
  - the image viewer and search use the native `<dialog>` element: Escape closes them, focus stays
    inside them, and focus goes back to the button afterwards
- **Responsive** (works at every screen size): checked at 360, 390, 768, 1024 and 1440 pixels wide.

---

## 8. The interactive extras

| Feature | File | How it works |
|---|---|---|
| Terminal on Home | `Terminal.tsx` | A text input. `run()` reads the command with a `switch` and returns lines to show. ↑/↓ remember past commands; Tab finishes a word. |
| Ctrl+K search | `CommandPalette.tsx` | A `<dialog>` with pages, notes, skills, certificates and actions. Projects are loaded from Supabase the first time it opens. Every typed word must appear in a result. |
| Image viewer | `Lightbox.tsx` | A button sends a `lightbox:open` **event** (a message other parts of the page can listen for) with the images. The viewer listens and opens. |
| Spotlight cards | `Spotlight.tsx` + `.spotlight` in globals.css | One mouse listener sets `--mx` and `--my` (the mouse position) on the card, and CSS draws a glow there. |
| Live GitHub repos | `GitHubActivity.tsx` | Asks the GitHub API for my latest repos on the server, **cached** (saved and reused) for an hour. Hidden if GitHub can't be reached. |
| Page transitions | `app/template.tsx` | A red-to-teal stripe and a short slide-up on every page change. |
| Save my contact | `app/ammara-badat.vcf/route.ts` | Builds a **vCard** (the standard contact-card file phones understand) from `content/about.ts`. |

---

## 9. SEO: being findable

**SEO** (search engine optimisation) means helping Google find, understand and show the site.

- **Titles and descriptions:** every page uses `pageMetadata()` from `lib/seo.ts`, which also sets:
  - a **canonical URL** (the one official address of a page, so `/projects?tag=CSS` isn't counted as a
    different page)
  - **Open Graph** tags: the title, text and picture shown when a link is shared on WhatsApp or LinkedIn
- **Share images:** `opengraph-image.jpg` files in page folders. Project pages and dev notes **draw
  their own** on the server with `lib/og.tsx` (Next.js's `ImageResponse`).
- **Sitemap** (`app/sitemap.ts` → `/sitemap.xml`): a list of every page for Google, including one per
  project from Supabase and one per dev note. Submitted in Google Search Console.
- **robots** (`app/robots.ts` → `/robots.txt`): lets search engines in, except `/admin` and `/api`.
- **Structured data / JSON-LD** (`components/JsonLd.tsx`): hidden facts for Google in a standard format:
  who I am, my job title, my certifications, breadcrumbs, projects and articles.
- **RSS** (`/notes/rss.xml`): a feed so people can follow my dev notes.
- **Search Console:** the `GOOGLE_SITE_VERIFICATION` setting proves to Google that I own the site.

---

## 10. Performance: why it scores 96

| Problem Lighthouse found | Fix |
|---|---|
| Heading and intro were invisible while fading in (LCP 3.4 s, Speed Index 5.1 s) | Animations now only slide; the content is visible from the first frame |
| Too much JavaScript at load (TBT 550 ms) | The search, image viewer and spotlight load only the first time they're used (`LazyExtras.tsx`, `next/dynamic`) |
| Large images | `next/image` sends smaller AVIF/WebP files in the size the screen needs, and reserves their space so nothing jumps |
| Font files | Only the 2 heading font weights I use are downloaded |

**Lighthouse CI** (`.github/workflows/lighthouse.yml`): after every production deploy, GitHub runs
Lighthouse on six pages and fails the check if Accessibility or SEO drops below 90.

---

## 11. Questions I might be asked (with my answers)

**Why is it safe to have the Supabase key in the browser?**
It's the anon (public) key. It can only do what RLS allows, and RLS only lets my account change
anything. The secret service key is never used.

**What happens if someone calls Supabase directly to delete my projects?**
RLS refuses it: their `auth.uid()` isn't mine. I tested this and got error 42501 for adding, and an
empty result for editing and deleting.

**Server component vs client component?**
Server components run on Vercel and send finished HTML; they can read the database. Client
components (`"use client"`) run in the browser and handle clicks, typing and state.

**How does your spam protection work without a CAPTCHA?**
A hidden honeypot field, a 3-second minimum, and a rate limit trigger inside the database.

**Why store a hash of the IP and not the IP?**
Privacy. The hash is enough to count messages per visitor, but it can't be turned back into the IP.

**How does a new project get its own page?**
`[slug]` is a dynamic segment. `slugify()` turns the title into the address, and the page finds the
matching project in Supabase. The sitemap adds it automatically too.

**How does dark/light mode avoid flashing?**
A small script in `<head>` reads localStorage and sets `data-theme` before the page is drawn.

**How did you get Performance from 74 to 96?**
My animations hid content at load, and too much JavaScript ran at the start. I made the animations
slide instead of fade and loaded the extras only when first used.
