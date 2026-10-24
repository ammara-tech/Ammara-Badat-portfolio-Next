# How my portfolio works

A plain-English guide to the code, so I can explain any part of it.
Words in **bold** are explained the first time they appear. Last updated after the admin
upgrades (live inbox, drafts, activity log, one-tab sign-in and two-step sign-in).

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
| **Supabase** | The **database** (where data is stored), **Auth** (sign-in), **Storage** (uploaded images) and **Realtime** (live updates). Holds my projects, contact messages, images and the admin activity log. | supabase.com |
| **GitHub** | Stores the code and its history. Runs my tests on every push and Lighthouse after every deploy. | github.com |

```
Visitor's browser ──► Vercel (my Next.js code) ──► Supabase (database, sign-in, images, live updates)
```

The most important idea: **the database, not the screen, decides who may read or change each row.**

---

## 2. Where everything lives

```
app/            Pages. Each folder is a web address (app/about/page.tsx = /about)
components/     Reusable building blocks (Navbar, ContactForm, Inbox, TwoStep, ...)
content/        My words: about.ts, case-study.ts, skills.ts, certifications.ts, notes.ts, cv.ts
lib/            Helpers: Supabase connection, SEO, theme, projects, and small "decision" functions
                (inbox.ts, activity.ts, idle.ts, admin-session.ts, two-step.ts) that the tests check
public/         Files served as they are: screenshots, certificates, CV, video, icons
Supabase/       The SQL I ran in Supabase to create tables and security rules, in order (schema.sql, 003 to 008)
tests/          Automated tests (Vitest)
Docs/           Wireframes, screenshots that prove things work, and this guide
.github/        The GitHub Actions: tests on every push, Lighthouse after every deploy
```

**Why my words are in `content/`:** the pages only handle layout. To change my About text or add a
certificate, I edit one file and every page that uses it updates.

**Why the `lib/` decision functions:** code that talks to Supabase or the browser is hard to test. So
the decisions (for example "after the password, what should the admin page show?") are small functions
that only take values in and give an answer back. The components call them, and the tests check them.

---

## 3. How pages work (the App Router)

Next.js uses **file-based routing**: the folder name is the address.

| File | Address |
|---|---|
| `app/page.tsx` | `/` (Home) |
| `app/about/page.tsx` | `/about` |
| `app/projects/[slug]/page.tsx` | `/projects/neon-arcade`, `/projects/myflix`, ... The `[slug]` part is a **dynamic segment**: one file makes a page for every project. |
| `app/notes/[slug]/page.tsx` | One page per dev note |
| `app/cv/page.tsx` | `/cv`, my CV as a web page |
| `app/admin/page.tsx` | `/admin`, my private admin page |
| `app/api/contact/route.ts` | `/api/contact`, an **API route** (code that runs on the server and answers requests instead of showing a page) |

Special files:
- `app/layout.tsx` wraps **every** page: the `<html>`, fonts, navbar, footer, phone navigation bar and the skip link.
- `app/template.tsx` also wraps every page but is created fresh on each page change. That's why the
  page-change animation plays every time.
- `app/not-found.tsx` is my custom 404 page ("Off the track").
- `app/error.tsx` is the "Pit stop" page with a **Try again** button if something fails, and
  `loading.tsx` files show skeletons while data loads.

### Server components and client components
This is the most important Next.js idea in the project.

- **Server components** (the default) run on Vercel's server. They can read the database directly,
  and the visitor only receives finished HTML, so they're fast and easy for Google to read.
  Example: `app/projects/page.tsx` loads projects from Supabase on the server.
- **Client components** start with `"use client"` and run in the visitor's browser. I only use them
  when something needs to react to the visitor: clicks, typing, state. Examples: `ContactForm`,
  `Navbar`, `Terminal`, `ThemeToggle`, and the whole admin page.

**State** (data a component remembers that can change, like "is the menu open?") is kept with
React's `useState`. `useEffect` runs code after the component appears, for example to add a
keyboard listener or start a live connection.

---

## 4. Supabase: data, sign-in and security

### The connection (`lib/supabase.ts`)
- Two settings come from Vercel's **environment variables** (settings kept outside the code, so
  nothing private is in GitHub): `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `publicClient()` is used on the server for public pages. It never signs in, so it reads data the
  same way a visitor would.
- `getBrowserClient()` is used in the browser on `/admin`. It keeps the sign-in in **sessionStorage**
  (explained in section 5), not the usual localStorage.
- The settings are read **lazily** (only when needed, not when the file loads). That fixed my first
  Vercel build crash, because the build doesn't have a database connection.

### Tables
| Table | What's in it | SQL file |
|---|---|---|
| `projects` | title, summary, links, image, tags, order, and `published` (false = draft) | `schema.sql`, `003`, `007` |
| `messages` | contact form messages: name, email, message, read/unread, a hashed IP | `004` |
| `activity_log` | the history of every change to a project (written only by a trigger) | `007` |
| `storage.objects` | images uploaded from /admin (Supabase Storage keeps files as rows too) | `005` |

### Row Level Security (RLS): the heart of the security
The anon key is **public**: anyone can find it in the browser. So the website can't be what keeps
people out; the **database** must. **RLS** is a set of rules (called **policies**) on each table.
Once it's switched on, the database refuses everything unless a policy allows it, and Postgres checks
the rules on every request.

My policies:

| Table | Read | Add | Edit | Delete |
|---|---|---|---|---|
| projects | everyone, but only **published** ones; the owner also sees drafts | owner only | owner only | owner only |
| messages | owner only | **everyone** (it's a contact form) | owner only | owner only |
| activity_log | owner only | nobody (only the trigger) | nobody | nobody |
| project images | everyone (public bucket) | owner only | owner only | owner only |

**"Owner only"** is one function, `public.is_owner()` (`008-two-step-sign-in.sql`):

```sql
select auth.uid() = 'my-user-id'::uuid           -- it's my account
   and (auth.jwt() ->> 'aal') = 'aal2';          -- and I entered my authenticator code
```

- `auth.uid()` is the ID of whoever is signed in. If it isn't my ID, the database says no.
- `aal` is the **assurance level** Supabase writes into the login token (the **JWT**, a signed pass
  the browser sends with every request): **aal1** = password only, **aal2** = password plus the code
  from my authenticator app. So a guessed or stolen password alone gets nothing, even through the API.

Before two-step sign-in, "owner only" was just the user ID check. Every owner policy now uses
`is_owner()`, so the rule lives in one place.

**How I proved it:**
- As a visitor, in the browser console (`Docs/rls-test-console.png`): adding a project failed with error
  **42501** ("violates row-level security policy"). Editing and deleting changed nothing and returned an
  empty list `[]`, because the visitor can't "see" any rows to change.
- On a local copy of the database: signed in as me with only a password (aal1), I couldn't read
  messages, drafts or the log, and adding a project or image was refused. With aal2 everything worked.
  Another account, even with aal2, got nothing.

**Why an update returns an empty list instead of an error:** RLS hides the rows you can't touch, so the
update matches nothing. That's why the admin page checks that a row came back, and shows
"Nothing was saved. You may not have permission" instead of pretending it worked.

Sign-ups are switched off in Supabase, so nobody else can even create an account. `/admin` isn't in
the navbar, and `robots` tells search engines not to list it.

---

## 5. Signing in to `/admin` (three layers)

### Layer 1 and 2: password, then a code (`components/TwoStep.tsx`, `lib/two-step.ts`)
1. `/admin` always starts on the sign-in form (email and password, `signInWithPassword`).
2. After the password, `getAuthenticatorAssuranceLevel()` tells the page what's next, and
   `nextStep()` decides:
   - **code**: an authenticator app is set up, so ask for its 6-digit code
   - **setup**: no app yet, so show a QR code to scan once (`mfa.enroll`), then ask for the first code
   - **dashboard**: both steps done (aal2)
3. The code is checked with `mfa.challengeAndVerify`. On success Supabase upgrades the sign-in to aal2.

The app makes a new code every 30 seconds from a secret that is only on my phone. This is **TOTP**
(a time-based one-time password). It works offline and doesn't need an email inbox.
If I lose my phone, I can delete the MFA factor in the Supabase dashboard (Authentication → Users)
and set up the new phone.

### Layer 3: the sign-in lives in one tab (`lib/admin-session.ts`)
Browsers have two small storage spaces for each website:
- **localStorage**: shared by every tab, and stays after the browser is closed (Supabase's default)
- **sessionStorage**: belongs to one tab only, and is wiped when that tab or window closes

My admin uses sessionStorage, so:
- a new tab, a new window or another person on the same computer gets the sign-in form
- closing the window signs me out, even if I forget to press Sign out
- refreshing keeps me signed in

Browsers can bring a closed tab back *with* its sessionStorage (Ctrl+Shift+T, or restoring tabs after
a restart). So the page writes down the time when it is closed or left (the **pagehide** event). When
it opens again, a refresh comes back within about a second, but a reopened tab comes back much later,
so it signs out. Sign-in events are ignored until that check is done, so a reopened tab never shows
the dashboard, not even for a moment.

### Auto sign-out (`components/IdleSignOut.tsx`, `lib/idle.ts`)
Clicks, typing and scrolling reset a timer. After 30 minutes without activity a "Still there?"
countdown appears for the last minute, then it signs out. If the laptop was asleep, the first check
after waking signs out straight away.

---

## 6. The admin dashboard

Everything here only loads for my account (RLS), and only after both sign-in steps.

| Feature | File | How it works |
|---|---|---|
| Overview | `AdminOverview.tsx` | Cards for projects (and drafts), unread messages and messages this week, plus a 7-day bar chart. |
| Live inbox | `Inbox.tsx`, `lib/inbox.ts` | **Supabase Realtime** keeps a connection open and pushes new, changed and deleted rows from `messages`, so a message appears without refreshing, with a "New message from …" pop-up. Realtime follows RLS, so only my account receives them (`006-realtime-inbox.sql` switches it on). |
| Unread count in the tab | `Inbox.tsx` | The browser tab title becomes "(2) Admin — Ammara Badat". |
| Search and filters | `lib/inbox.ts` → `matchesSearch()` | Finds messages by name, email or text in any capitals; All / Unread / Read buttons. |
| Reply | `lib/inbox.ts` → `replyLink()` | A `mailto:` link with the sender's address, a subject, a greeting with their first name and their message quoted. |
| Undo delete | `Inbox.tsx` | The message disappears straight away, but the delete is only sent to Supabase after 5 seconds. Undo cancels the timer. If the delete fails, the message comes back with an error. |
| Add / edit form | `app/admin/page.tsx` | Saves to `projects`, then checks a row came back (RLS can block silently). |
| Draft / Live switch | `ProjectOrderList.tsx` | Updates `published`. Visitors never receive drafts, because of the read policy, so the public pages needed no changes. |
| Live preview | `app/admin/page.tsx` + `ProjectCard` from `ProjectGrid.tsx` | The real project card, built from the form as I type. It has the **inert** attribute, so its links can't be clicked or reached with Tab. |
| Activity log | `ActivityLog.tsx`, `lib/activity.ts` | Shows the history written by the database trigger (section 7), live through Realtime. Reorders from one drag are grouped into one line. |
| Image upload | `ImageUpload.tsx` | Checks the type and size (5 MB), uploads to the `project-images` bucket with a timestamp in the name (so nothing is overwritten), then fills in the image URL. |
| Drag-and-drop order | `ProjectOrderList.tsx` | Drag with a mouse or finger, or use ↑/↓. Saves each project's `sort_order` straight away. |

---

## 7. The activity log trigger (`007-drafts-activity-log.sql`)

A **trigger** is code the database runs automatically when a row changes. Mine runs after every
insert, update or delete on `projects` and writes a row to `activity_log`:

- added (or "added as a draft"), deleted
- published, moved to drafts
- reordered ("to number 3")
- edited, with the fields that changed in plain words ("summary, tags")

It is **security definer** (it runs with the database owner's rights), which is how it can write to a
table that the website can't. `activity_log` has a read policy for me only and **no** insert, update or
delete policies, so nobody can add, change or remove entries from a browser. A history written by the
browser could be faked or skipped; this one can't.

---

## 8. The contact form and spam protection

**Flow:** `ContactForm.tsx` (browser) → `POST /api/contact` (server, `app/api/contact/route.ts`)
→ `messages` table (Supabase) → my live inbox on `/admin` (`Inbox.tsx`).

**Three layers of spam protection, with no CAPTCHA:**
1. **Honeypot:** a hidden field that people can't see or Tab to, but bots fill in. If it has anything
   in it, the message is thrown away.
2. **Too fast:** the form remembers when it was opened. A form sent faster than a person could fill
   it in is treated as a bot. For layers 1 and 2, the server still answers "sent", so the bot doesn't
   learn what gave it away.
3. **Rate limit in the database:** a **trigger** in `004-...sql` limits messages per email address,
   per visitor and per hour in total. It runs inside Supabase, so it can't be skipped.

**The visitor's IP address is never stored.** The server stores a **hash** instead (a one-way
scramble with SHA-256; the same IP always gives the same hash, but you can't turn the hash back into
the IP). That's enough to count messages per visitor.

The API route checks the same rules as the database (name, valid email, message length) so people
get a friendly message. If the database's rate limit says no (error code `P0001`), the route answers
with **429** ("Too Many Requests").

---

## 9. Projects

- `lib/projects.ts` → `loadProjects()` reads the `projects` table, ordered by `sort_order`. It reads as
  a visitor, so drafts are left out by the database.
- `app/projects/page.tsx` loads fresh on every visit (`force-dynamic`), so a project I publish or move
  to drafts shows or hides straight away.
- `ProjectGrid.tsx` (client) adds the **tag filter**. Tags come from the projects, so a new tag in
  /admin becomes a filter automatically. The chosen tag is kept in the address (`?tag=Next.js`) so it
  can be shared. Cards slide into place with the **View Transitions API** (a browser feature that
  animates between two states of a page).
- **Project pages:** `lib/slug.ts` turns a title into an address ("F1 Race Hub" → `f1-race-hub`).
  `app/projects/[slug]/page.tsx` finds the project with that slug. The capstone **redirects** to its
  case study page instead.

---

## 10. Design, theme and accessibility

- **Colours** are **design tokens** (named colours, like `--color-teal`) defined once in
  `app/globals.css`. Tailwind classes such as `bg-panel` and `text-racing` use them.
- **Light/dark mode** (`lib/theme.ts`, `ThemeToggle.tsx`): light mode adds `data-theme="light"` to
  `<html>`, which swaps every colour token. The choice is saved in localStorage. A tiny script in
  `<head>` applies it **before the page is drawn**, so there is no white or dark "flash".
- **Animations switch** (`MotionToggle.tsx`, `lib/motion.ts`): added after peer review. It sets
  `data-motion="reduced"` on `<html>`, which uses the same calm rules as the device setting
  **reduced motion**. A device that asks for reduced motion always wins.
- **Accessibility** (making the site usable for everyone, including keyboard and screen-reader users):
  - a "Skip to content" link on the first Tab press
  - a visible teal focus outline on everything you can Tab to
  - every colour pair passes **WCAG AA** contrast (the web's standard for readable text: 4.5 to 1
    for normal text), in both themes
  - the image viewer and search use the native `<dialog>` element: Escape closes them, focus stays
    inside them, and focus goes back to the button afterwards
  - switches use `role="switch"` and `aria-checked`, and pop-ups use `role="status"` so screen readers announce them
- **Mobile first** (works at every screen size): checked at 360, 390, 768, 1024 and 1440 pixels wide,
  and on my own phone. Phones get a navigation bar at the bottom (`MobileNav.tsx`). It once moved
  because an invisible glow made the page 8 pixels wider than the screen; the glow is now limited and
  `<html>` has `overflow-x: clip`.

---

## 11. The interactive extras

| Feature | File | How it works |
|---|---|---|
| Terminal on Home | `Terminal.tsx` | A text input. `run()` reads the command with a `switch` and returns lines to show. ↑/↓ remember past commands; Tab finishes a word. |
| Ctrl+K search | `CommandPalette.tsx` | A `<dialog>` with pages, notes, skills, certificates and actions. Projects are loaded from Supabase the first time it opens (drafts are left out). Every typed word must appear in a result. |
| Image viewer | `Lightbox.tsx` | A button sends a `lightbox:open` **event** (a message other parts of the page can listen for) with the images. The viewer listens and opens. |
| Spotlight cards | `Spotlight.tsx` + `.spotlight` in globals.css | One mouse listener sets `--mx` and `--my` (the mouse position) on the card, and CSS draws a glow there. |
| Live GitHub repos | `GitHubActivity.tsx` | Asks the GitHub API for my latest repos on the server, **cached** (saved and reused) for an hour. Hidden if GitHub can't be reached. |
| Page transitions | `app/template.tsx` | A red-to-teal stripe and a short slide-up on every page change. |
| Dev notes | `content/notes.ts`, `app/notes/` | Short posts, each with its own page, share image and structured data, an RSS feed and a reading progress bar (`ReadingProgress.tsx`). |
| Copy email | `CopyEmail.tsx` | Copies my address to the clipboard and shows "Copied!". |
| Save my contact | `app/ammara-badat.vcf/route.ts` | Builds a **vCard** (the standard contact-card file phones understand) from `content/about.ts`. |
| Web CV | `app/cv/page.tsx`, `content/cv.ts` | My CV as a page that prints cleanly, next to the PDF download. |

---

## 12. SEO: being findable

**SEO** (search engine optimisation) means helping Google find, understand and show the site.

- **Titles and descriptions:** every page uses `pageMetadata()` from `lib/seo.ts`, which also sets:
  - a **canonical URL** (the one official address of a page, so `/projects?tag=CSS` isn't counted as a
    different page)
  - **Open Graph** tags: the title, text and picture shown when a link is shared on WhatsApp or LinkedIn
- **Share images:** `opengraph-image.jpg` files in page folders. Project pages and dev notes **draw
  their own** on the server with `lib/og.tsx` (Next.js's `ImageResponse`).
- **Sitemap** (`app/sitemap.ts` → `/sitemap.xml`): every page for Google, including one per
  published project and one per dev note. Submitted in Google Search Console.
- **robots** (`app/robots.ts` → `/robots.txt`): lets search engines in, except `/admin` and `/api`.
- **Structured data / JSON-LD** (`components/JsonLd.tsx`): hidden facts for Google in a standard format:
  who I am, my job title, my certifications, breadcrumbs, projects and articles.
- **RSS** (`/notes/rss.xml`): a feed so people can follow my dev notes.
- **Search Console:** the `GOOGLE_SITE_VERIFICATION` setting proves to Google that I own the site.

---

## 13. Performance: why it scores 96

| Problem Lighthouse found | Fix |
|---|---|
| Heading and intro were invisible while fading in (LCP 3.4 s, Speed Index 5.1 s) | Animations now only slide; the content is visible from the first frame |
| Too much JavaScript at load (TBT 550 ms) | The search, image viewer and spotlight load only the first time they're used (`LazyExtras.tsx`, `next/dynamic`) |
| Large images | `next/image` sends smaller WebP files in the size the screen needs, and reserves their space so nothing jumps |
| Font files | Only the 2 heading font weights I use are downloaded |

Mobile scores: **Performance 96, Accessibility 100, Best Practices 100, SEO 100.**

---

## 14. Tests and checks on GitHub

- **Unit tests** (`tests/`, run with `npm test`) use **Vitest**: small programs that run my code with
  example inputs and check the answers. There are 65 checks:
  - page addresses (`slug.test.ts`), the contact form rules (`contact.test.ts`)
  - every skill having evidence, every linked file existing, the dev notes, SEO helpers and the
    contact card (`content.test.ts`), and the reading progress bar (`reading.test.ts`)
  - the admin logic (`admin.test.ts`): inbox search and the Reply link, the activity log wording and
    grouping, the auto sign-out timer, the one-tab sign-in rule and the two-step sign-in steps
- **Tests on every push** (`.github/workflows/tests.yml`): GitHub installs the project and runs
  `npm test`. A green tick in the Actions tab means everything passed.
- **Lighthouse CI** (`.github/workflows/lighthouse.yml`): after every production deploy, GitHub runs
  Lighthouse on six pages and fails the check if Accessibility or SEO drops below 90.
- **Database rules** (RLS, triggers, the aal2 rule) run inside Supabase, so they aren't in the 65.
  I tested them on a local copy of the database as a visitor, as another account and as me.

---

## 15. Questions I might be asked (with my answers)

**Why is it safe to have the Supabase key in the browser?**
It's the anon (public) key. It can only do what RLS allows, and RLS only lets my account, signed in
with two steps, change anything. The secret service key is never used.

**What happens if someone calls Supabase directly to delete my projects?**
RLS refuses it: `is_owner()` is false for them. I tested this and got error 42501 for adding, and an
empty result for editing and deleting.

**What if someone guesses my password?**
They only get an aal1 sign-in. The admin page asks for the authenticator code, and the database rules
need aal2, so they can't read messages or change anything, even through the API.

**Server component vs client component?**
Server components run on Vercel and send finished HTML; they can read the database. Client
components (`"use client"`) run in the browser and handle clicks, typing and state.

**How does the live inbox work?**
Supabase Realtime pushes new rows from the messages table to my admin page. It follows RLS, so only
my account receives them.

**Why is the activity log a trigger and not code in the page?**
A history written by the browser could be faked or skipped. The trigger runs inside the database on
every change, and there are no write policies on the log, so only the trigger can add entries.

**Why does a new tab show the sign-in form?**
The sign-in is kept in sessionStorage, which belongs to one tab and is wiped when it closes.

**How are drafts hidden?**
The read policy is "published, or it's the owner", so visitors never receive drafts.

**How does your spam protection work without a CAPTCHA?**
A hidden honeypot field, a check for forms sent too fast, and a rate limit trigger inside the database.

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

**What do your tests check, and why did the number grow?**
Page addresses, the contact form rules, skills evidence, files, notes, SEO and the admin logic. It
grew from 47 to 65 because every admin feature came with its own tests.
