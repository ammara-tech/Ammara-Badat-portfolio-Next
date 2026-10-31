# How my portfolio works

A plain-English guide to the code, so I can explain any part of it.
Words in **bold** are explained the first time they appear. Last updated on 29 October 2026,
after adding browser tests, security headers, messages and images in the activity log, and real 404s.

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
| **GitHub** | Stores the code and its history. Runs my tests on every push, and Lighthouse on the live site a few minutes after every push. | github.com |

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
Supabase/       The SQL I ran in Supabase to create tables and security rules, in order (schema.sql, 003 to 009)
tests/          Automated tests (Vitest)
Docs/           Wireframes, screenshots that prove things work, and this guide
.github/        The GitHub Actions: tests on every push, Lighthouse on the live site after every push
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
| `app/projects/(list)/page.tsx` | `/projects`. A folder name in brackets, like `(list)`, is a **route group**: it organises files without becoming part of the address. |
| `app/projects/[slug]/page.tsx` | `/projects/neon-arcade`, `/projects/myflix`, ... The `[slug]` part is a **dynamic segment**: one file makes a page for every project. |
| `app/notes/[slug]/page.tsx` | One page per dev note |
| `app/cv/page.tsx` | `/cv`, my CV as a web page |
| `app/admin/page.tsx` | `/admin`, my private admin page |
| `app/api/contact/route.ts` | `/api/contact`, an **API route** (code that runs on the server and answers requests instead of showing a page) |
| `app/api/version/route.ts` | `/api/version`, which says which commit the live site was built from (used by Lighthouse CI) |

Special files:
- `app/layout.tsx` wraps **every** page: the `<html>`, fonts, navbar, footer, phone navigation bar and the skip link.
- `app/template.tsx` also wraps every page but is created fresh on each page change. That's why the
  page-change animation plays every time.
- `app/not-found.tsx` is my custom 404 page ("Off the track").
- `app/error.tsx` is the "Pit stop" page with a **Try again** button if something fails, and
  `loading.tsx` files show skeletons while data loads.
- **Loading screens and 404s:** a `loading.tsx` wraps its own page **and every page in the folders below
  it**. While it shows, Next.js has already started sending the page with status **200**, so if the page
  then finds the project doesn't exist, it can only show "not found" with a `noindex` tag, not send a real
  **404**. That's why the Projects loading screen is in `app/projects/(list)/` (it only covers `/projects`)
  and project pages have none: `/projects/made-up` now checks Supabase first and returns a real 404.
  A test in `content.test.ts` fails if a loading screen is put back above the project pages.

### Server components and client components
This is the most important Next.js idea in the project.

- **Server components** (the default) run on Vercel's server. They can read the database directly,
  and the visitor only receives finished HTML, so they're fast and easy for Google to read.
  Example: `app/projects/(list)/page.tsx` loads projects from Supabase on the server.
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
| `activity_log` | the history of every change to a project, message or project image (written only by triggers) | `007`, `009` |
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
| activity_log | owner only | nobody (only the triggers) | nobody | nobody |
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

### Security headers (`lib/security-headers.ts`)
A **header** is extra information sent with every response, before the page itself. Security headers
tell the browser to switch protections on. `next.config.ts` adds mine to every address (`source: "/(.*)"`).

- **No framing** (`X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`): other sites can't put my
  pages inside an `<iframe>`, which stops **clickjacking** (my real page hidden under a fake button).
- **CSP** (Content Security Policy) also stops my relative links being redirected (`base-uri`), forms
  sending anywhere but my site (`form-action`) and old plugins (`object-src`). It has **no** `script-src`
  on purpose: Next.js, the theme script and Vercel Analytics use inline scripts, and blocking them would
  break the site. Doing it properly needs a **nonce** (a random code made for every page load).
- `nosniff`: the browser never guesses a file's type. `Referrer-Policy`: other sites only see my domain.
  `Permissions-Policy`: camera, microphone, location and payments are off. `COOP`: a page I open can't
  reach back through `window.opener`. `HSTS`: always https, for two years (ignored on `localhost`).
- `tests/security.test.ts` checks they're on every page and that no script rule sneaks in.

---

## 5. Signing in to `/admin` (three layers)

### Layer 1 and 2: password, then a code (`components/TwoStep.tsx`, `lib/two-step.ts`)
1. `/admin` always starts on the sign-in form (email and password, `signInWithPassword`). A **Show** / **Hide**
   button next to the password switches the box between `type="password"` and `type="text"`, and it's hidden
   again as soon as I press Sign in, so it's never left showing.
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
| Unread count in the tab | `Inbox.tsx`, `TabIconBadge.tsx`, `lib/tab-badge.ts` | The browser tab title becomes "(2) Admin — Ammara Badat", and the tab icon gets a teal number badge. My icon is an SVG (plain text), so `addBadge()` shrinks the logo into the bottom-left corner and adds a circle with the number in the top-right, so it never covers "AB". The tab icon is pointed at that new picture, and back to the normal one when everything is read. |
| Search and filters | `lib/inbox.ts` → `matchesSearch()` | Finds messages by name, email or text in any capitals; All / Unread / Read buttons. |
| Reply | `lib/inbox.ts` → `replyLink()` | A `mailto:` link with the sender's address, a subject, a greeting with their first name and their message quoted. |
| Download CSV | `Inbox.tsx`, `lib/csv.ts` | Saves the messages I'm viewing (after search and filters) as a **CSV** file (a simple spreadsheet format). It is built in the browser, so nothing is sent anywhere. Cells with commas, quotes or line breaks are wrapped in quotes. Because messages come from a public form, a cell starting with `=`, `+`, `-` or `@` gets a `'` in front, so a spreadsheet shows it as text instead of running it as a formula (**CSV injection**). A hidden mark at the start (a **BOM**) makes Excel read accents and emoji correctly. |
| Mark all read | `Inbox.tsx`, `unreadIds()` in `lib/inbox.ts` | Shown only when something is unread. `unreadIds()` lists the unread messages (leaving out one waiting for Undo delete), and one `update(...).in("id", ids)` changes them all in a single request. RLS still checks it's my account. Undo puts back only those same messages, for 5 seconds. |
| Undo delete | `Inbox.tsx` | The message disappears straight away, but the delete is only sent to Supabase after 5 seconds. Undo cancels the timer. If the delete fails, the message comes back with an error. |
| Add / edit form | `app/admin/page.tsx` | Saves to `projects`, then checks a row came back (RLS can block silently). |
| Draft / Live switch | `ProjectOrderList.tsx` | Updates `published`. Visitors never receive drafts, because of the read policy, so the public pages needed no changes. |
| Live preview | `app/admin/page.tsx` + `ProjectCard` from `ProjectGrid.tsx` | The real project card, built from the form as I type. It has the **inert** attribute, so its links can't be clicked or reached with Tab. |
| Unsaved changes | `UnsavedChangesGuard.tsx`, `lib/unsaved.ts` | The form remembers what it started with (empty, or the project being edited). `changedFields()` compares, ignoring spaces at the ends. While something changed: "Unsaved changes" shows, the **beforeunload** event makes the browser ask "Leave site?" on close or refresh, and a click listener asks "Leave without saving?" before a link moves to another page. That second one is needed because Next.js changes pages without reloading, so the browser's own box never appears. `leavesPage()` skips new tabs, Ctrl-clicks, `#` links and `mailto:`. Auto sign-out still signs me out, because security comes first. |
| Activity log | `ActivityLog.tsx`, `lib/activity.ts` | Shows the history written by the database triggers (section 7), live through Realtime. All / Projects / Messages / Images buttons show one kind at a time (`filterActivity()`), each with a count (`countByKind()`). Reorders from one drag are grouped into one line. |
| Image upload | `ImageUpload.tsx` | Checks the type and size (5 MB), uploads to the `project-images` bucket with a timestamp in the name (so nothing is overwritten), then fills in the image URL. |
| Drag-and-drop order | `ProjectOrderList.tsx` | Drag with a mouse or finger, or use ↑/↓. Saves each project's `sort_order` straight away. |

---

## 7. The activity log triggers (`007` and `009`)

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

`009-activity-log-messages-images.sql` adds two more triggers in the same style, and a `kind` column
(`project`, `message` or `image`) so the page knows what each entry is about:

- **Messages** (`messages_activity`): "New message from Thabo" when one arrives, and "Deleted the message
  from Thabo" when I delete it. Only the sender's **name** is copied, never their email or message, so
  deleting a message really removes its text.
- **Images** (`project_images_activity` on `storage.objects`): "Uploaded the image cover.png" and
  "Deleted the image cover.png". Supabase Storage keeps a row for every file, so a trigger can watch it.
  It ignores any other bucket.
- The trigger functions have `execute` taken away from the API roles, so they can't be called directly;
  they only run when a row changes.
- Entries from before `009` have no kind; `kindOf()` treats them as projects.

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

**Email alert** (`lib/alert.ts`): once a message is saved, the API route calls `after(() => sendAlert(...))`.
`after()` is a Next.js feature that runs code after the reply has gone back to the visitor, so they never wait
for the email, and if Resend is slow or down the message is still saved. `sendAlert()` sends a `POST` to
Resend's API with my key (a server-only setting, `RESEND_API_KEY`) and never throws. `alertEmail()` builds the
email: Reply goes to the visitor (`reply_to`), everything they typed goes through `escapeHtml()` so it shows as
text and can't add links or images, line breaks are taken out of the subject (they could sneak in extra email
headers), and long messages are shortened, with the full one in the admin inbox. Only real messages reach this
point: bots get a fake "sent" before it, and the rate limit stops floods.

**Draft kept on refresh** (`lib/contact-draft.ts`): while a visitor types, the form saves their name,
email and message to **sessionStorage** half a second after they stop typing. sessionStorage belongs to one
browser tab and is wiped when it closes, so nothing leaves their device until they press Send. After a
refresh or Back, `readDraft()` brings it back (it ignores anything broken, too long or empty) with a "Start
over" button, and the draft is deleted once the message is sent. The hidden honeypot field is never saved.
The draft also keeps when the form was first opened, so the "too fast" check still sees the real time.

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
- `app/projects/(list)/page.tsx` loads fresh on every visit (`force-dynamic`), so a project I publish or move
  to drafts shows or hides straight away.
- `ProjectGrid.tsx` (client) adds the **tag filter**. Tags come from the projects, so a new tag in
  /admin becomes a filter automatically. The chosen tag is kept in the address (`?tag=Next.js`) so it
  can be shared. Cards slide into place with the **View Transitions API** (a browser feature that
  animates between two states of a page).
- **Project pages:** `lib/slug.ts` turns a title into an address ("F1 Race Hub" → `f1-race-hub`).
  `app/projects/[slug]/page.tsx` finds the project with that slug. The capstone **redirects** to its
  case study page instead. A slug that matches no project calls `notFound()`, which sends a real 404
  (see "Loading screens and 404s" in section 3).
- **Currently building** (`CurrentlyBuilding.tsx`, `content/currently-building.ts`): under the project
  cards, a list of projects I'm working on, with an "In progress" label. The cards have a dashed border and
  no links, so they don't look like finished work. When a project goes live I add its real card in `/admin`
  and delete it from the list; when the list is empty, the section disappears.
- **Copy link** (`CopyLink.tsx`): on project pages and the case study, copies the page's clean address
  (built from `siteUrl`, so no `?tag=` or `#heading` on the end) for sharing on LinkedIn or WhatsApp.

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
| Dev notes | `content/notes.ts`, `app/notes/` | Short posts, each with its own page, share image and structured data, an RSS feed, a reading progress bar (`ReadingProgress.tsx`) and a **Copy** button on every code example (`CopyCode.tsx`, a small client component inside the server-rendered note; it shares `lib/clipboard.ts` with the Copy email button). `headingIds()` gives every sub-heading its own address (a **#** link appears on hover or Tab), and `noteNeighbours()` finds the older and newer note for the links at the end. A note changed on a later day has an `updated` date, shown as "Updated" and used by the sitemap and structured data. The list page uses `NotesList.tsx` with a **Filter by topic** row (`lib/note-tags.ts`: `tagCounts()`, `filterButtons()` for topics used by two or more notes, and `withTag()`); the chosen topic goes in the address (`?tag=Security`), and only a short summary of each note is sent to the browser. Each note ends with up to three **related notes** (`relatedNotes()`): the most shared topics first, then the note's main (first) topic, then the newest, skipping the Older/Newer notes. The topics on a note link to the filtered list. |
| Copy email | `CopyEmail.tsx` | Copies my address to the clipboard and shows "Copied!". It shares `lib/clipboard.ts` with the Copy code and Copy link buttons. |
| Back, Forward, Refresh | `NavArrows.tsx`, `lib/nav-arrows.ts` | Browser-style buttons next to my name (laptops and desktops) and at the top of the phone menu, for when the site is installed on a phone and has no browser bar. Back and Forward use `history.back()` and `history.forward()`; Refresh reloads the page. The **Navigation API** (a newer browser feature) says whether there is a page to go back or forward to, so the buttons grey out when there isn't. |
| Back to top | `BackToTop.tsx`, `lib/back-to-top.ts` | Appears after scrolling more than one and a half screens. Jumps to the top (smoothly, unless motion is reduced) and moves keyboard focus to the page content. Sits above the phone navigation bar; hidden on the admin page. |
| Live project count | `app/about/page.tsx`, `lib/stats.ts`, `countProjects()` in `lib/projects.ts` | The About page asks Supabase how many projects there are (`count: "exact", head: true`, so only the number comes back, not the projects). It reads as a visitor, so RLS leaves drafts out. `revalidate = 60` rebuilds the page at most once a minute, so a newly published project shows within a minute while the page stays fast. If Supabase can't be reached, `projectStat()` leaves the card out instead of showing a wrong number. |
| Local time | `LocalTime.tsx`, `lib/local-time.ts` | "It's 13:16 here in Johannesburg" on the Contact page, plus the visitor's time if it's different (`localTimeLine()`, using `Intl.DateTimeFormat` with the `Africa/Johannesburg` time zone). It's worked out in the browser after the page loads, because the server doesn't know the visitor's time zone, and it updates every 30 seconds. The line keeps its space while loading, so nothing jumps. |
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
  published project and one per dev note (dated by when the note last changed). Submitted in Google Search Console.
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
  example inputs and check the answers. There are 122 checks:
  - page addresses (`slug.test.ts`), the contact form rules, its draft, the local time and the email alert (`contact.test.ts`)
  - every skill having evidence, every linked file existing, the dev notes (including unique heading
    addresses, the older/newer links and updated dates), the back-to-top button, the back/forward buttons, SEO helpers
    the contact card, the Currently building list, the About page's project count, the dev notes topic filter and related notes, and no loading screen above the project pages (`content.test.ts`), and the reading progress bar (`reading.test.ts`)
  - the admin logic (`admin.test.ts`): inbox search, Mark all read, the Reply link and the CSV download (including the
    formula protection), the activity log wording, filters, counts and
    grouping, the tab icon badge, the unsaved changes warning, the auto sign-out timer, the one-tab sign-in rule and the two-step sign-in steps
  - the security headers (`security.test.ts`): sent on every page, framing blocked, scripts not limited
  - the docs themselves (`docs.test.ts`): the README's dev note count matches the real notes, every SQL
    file is listed in the README's setup steps, every file the README or this guide mentions exists, and
    every link inside the README points to a heading that exists
- **Tests on every push** (`.github/workflows/tests.yml`): GitHub installs the project on Node.js 22 and runs
  `npm test`. A green tick in the Actions tab means everything passed.
- **Browser tests** (`e2e/`, `playwright.config.ts`, `.github/workflows/browser-tests.yml`): **Playwright**
  opens the live site in a real Chromium browser, twice: as a laptop and as a phone (a Pixel 7 screen).
  It waits for the new deploy the same way Lighthouse does, then:
  - `contact.spec.ts`: fills in the contact form like a visitor. When it presses Send, the test answers
    instead of my server (`page.route`), so no real message is sent. It checks the spam trap is hidden, the
    browser stops a too-short message, the right details are sent, errors appear, and the draft survives a
    refresh. Then it calls the real `/api/contact` only with requests the API throws away before the
    database (a filled-in spam trap, a form sent too fast, a wrong email), so nothing is ever saved.
  - `admin.spec.ts`: `/admin` shows only the sign-in form (no dashboard text), has `noindex`, and the
    **Show password** button switches the box between hidden and visible. It never types a real password.
  - `site.spec.ts`: every main page loads with its title, a made-up project gets a real 404, the live
    security headers, and the phone menu opening and closing with Escape.
  - If anything fails, the run has a report with screenshots and a step-by-step **trace** to download.
  - Unit tests (Vitest) check my functions; browser tests check the pages people actually use. Both matter:
    a function can be right and the button that calls it still broken.
- **Lighthouse CI** (`.github/workflows/lighthouse.yml`): after every push to main that changes the site,
  GitHub checks `/api/version` every 15 seconds until Vercel is serving that commit, then runs Lighthouse
  once on six pages of the live site and fails the check if Accessibility or SEO drops below 90.
  Pushes that only change documents skip it.
  - It first waited for a "deployment finished" message from Vercel, but my Vercel project doesn't send
    those, so it never ran. I found this by checking the Actions tab.
  - Then it waited a fixed 4 minutes and tested each page 3 times, which took about 9 minutes. Now it starts
    as soon as the deploy is live and tests each page once, because Accessibility and SEO scores don't
    change between runs (Performance is only a warning).
- **Database rules** (RLS, triggers, the aal2 rule) run inside Supabase, so they aren't in the 122.
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
A history written by the browser could be faked or skipped. The triggers run inside the database on
every change, and there are no write policies on the log, so only the triggers can add entries.

**Why does the log keep a sender's name but not their message?**
It only needs enough to say "New message from Thabo". Keeping less means less private data stored,
and deleting a message really removes what they wrote.

**Why does a new tab show the sign-in form?**
The sign-in is kept in sessionStorage, which belongs to one tab and is wiped when it closes.

**How are drafts hidden?**
The read policy is "published, or it's the owner", so visitors never receive drafts.

**How does your spam protection work without a CAPTCHA?**
A hidden honeypot field, a check for forms sent too fast, and a rate limit trigger inside the database.

**Why store a hash of the IP and not the IP?**
Privacy. The hash is enough to count messages per visitor, but it can't be turned back into the IP.

**Why did a missing project page return 200, and how did you fix it?**
A `loading.tsx` above the page meant Next.js started sending it (status 200) before the page knew the
project didn't exist. I moved the Projects loading screen into a route group so it only covers
`/projects`, and now a wrong project address returns a real 404. A test stops the loading screen
coming back above project pages.

**What are your security headers for?**
They're instructions sent with every page that switch browser protections on. The main one stops other
sites putting my pages in a frame (clickjacking). Others stop type guessing, force https and switch off
the camera and microphone. I didn't add a script rule because Next.js needs inline scripts; doing that
properly needs nonces, which is in my known gaps.

**What's the difference between your unit tests and your browser tests?**
Unit tests (Vitest, `tests/`) run my functions with example inputs, in a second, without a browser. Browser
tests (Playwright, `e2e/`) open the real live site as a laptop and a phone and click through it, so they catch
things like a hidden button or a broken page. They answer the contact form themselves, so they never send a
real message, and they never sign in.

**How does a new project get its own page?**
`[slug]` is a dynamic segment. `slugify()` turns the title into the address, and the page finds the
matching project in Supabase. The sitemap adds it automatically too.

**How does dark/light mode avoid flashing?**
A small script in `<head>` reads localStorage and sets `data-theme` before the page is drawn.

**How did you get Performance from 74 to 96?**
My animations hid content at load, and too much JavaScript ran at the start. I made the animations
slide instead of fade and loaded the extras only when first used.

**What do your tests check, and why did the number grow?**
Page addresses, the contact form rules, skills evidence, files, notes, SEO, the admin logic and the docs.
It grew from 47 to 65 because every admin feature came with its own tests, then to 69 when I added
checks that my README and this guide stay in step with the code, 72 with the dev note navigation, 76 with updated dates and the back-to-top button, 78 with the back/forward buttons, 79 with a check for broken links inside the README, 83 with the CSV download, 86 with the activity log for messages and images, 89 with the activity counts and the 404 check, 95 with the security headers and the tab badge, 98 with the unsaved changes warning, 101 with the contact form draft, 103 with the Currently building list, 104 with the Firebase skill, 106 with the live project count, 112 with Mark all read and the dev notes topic filter, 117 with related notes and the local time, and 122 with the email alert.
