/*
  ✍️ DEV NOTES — short posts about things I built and learned.

  Each note is a list of blocks: a paragraph ("p"), a sub-heading ("h2"),
  a bullet list ("ul"), a code sample ("code") or a highlighted tip ("tip").
  To add a note, copy one of the objects below, give it a new slug and put it
  at the top of the list (newest first). The page, the sitemap, the RSS feed
  and the Ctrl+K search all pick it up automatically.

  These are drafts — read them and change anything so it sounds like me.
*/

import { slugify } from "@/lib/slug";

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "tip"; text: string };

export type Note = {
  slug: string;
  title: string;
  description: string; // one or two sentences, shown on the list and in Google
  date: string; // YYYY-MM-DD, when I published it
  updated?: string; // YYYY-MM-DD, only if I changed the note on a later day (shown as "Updated ...")
  tags: string[];
  body: Block[];
};

export const notes: Note[] = [
  {
    slug: "security-headers",
    title: "Security headers: telling the browser to be stricter",
    description:
      "Seven lines of config that switch on browser protections for every page, why I left one rule out, and a tab badge for unread messages.",
    date: "2026-10-28",
    tags: ["Security", "Next.js", "Headers"],
    body: [
      {
        type: "p",
        text: "Most of my site's security lives in the database: Row Level Security decides who can read or change anything. But the browser has protections too, and they're switched off unless the website asks for them. A website asks using headers: short instructions sent with every page, before the page itself.",
      },
      { type: "h2", text: "What I switched on" },
      {
        type: "ul",
        items: [
          "No framing: other sites can't show my pages inside a frame. This stops clickjacking, where a real page is hidden under a fake button so you click something you didn't mean to.",
          "No type guessing: a file sent as text is never run as a script.",
          "Always https: browsers remember to use the secure version of my site for two years, even if someone types http://.",
          "Less shared: when a visitor clicks a link to another site, that site only sees my domain, not the exact page.",
          "Unused features off: my site never needs the camera, microphone, location or payments, so nothing on it can ask for them.",
          "Forms only send to my own site, and old browser plugins are blocked.",
        ],
      },
      {
        type: "p",
        text: "In Next.js, they all go in next.config.ts, and one rule adds them to every address:",
      },
      {
        type: "code",
        lang: "ts",
        code: `async headers() {
  return [{ source: "/(.*)", headers: securityHeaders }];
},`,
      },
      {
        type: "p",
        text: "Headers aren't secret. Anyone can see them in the Network tab of the browser's developer tools, so writing about them doesn't help an attacker. They only switch protections on.",
      },
      { type: "h2", text: "The rule I left out on purpose" },
      {
        type: "p",
        text: "The strongest header is a Content Security Policy with a script rule, which says exactly which scripts may run. I didn't add that part. Next.js, my dark-mode script and Vercel Analytics all use small scripts written inside the page, and a strict rule would block them. The site would look fine in some places and quietly break in others. Doing it properly needs a nonce, a new random code for every page load, which is a bigger change. So it's listed in my README's known gaps instead of half-done.",
      },
      {
        type: "p",
        text: "A test checks that every header is sent on every page, and it also fails if a script rule is ever added by accident. I proved it works by adding one: the test failed straight away.",
      },
      { type: "h2", text: "Also today: a badge on the admin tab" },
      {
        type: "p",
        text: "My admin tab already showed \"(2) Admin\" when I had unread messages, but with lots of tabs open the title gets cut off. Now the tab icon gets a small number badge too, like an app on a phone. My icon is an SVG, which is just text, so the page shrinks the logo into the corner, adds a circle with the number, and swaps the tab icon for the new picture. I made sure the badge never covers my initials. When everything is read, the normal icon comes back.",
      },
      {
        type: "tip",
        text: "Lesson: security has layers. The database protects the data, and headers protect the visitor's browser. Knowing which rule to leave out, and saying so, is part of doing it well.",
      },
    ],
  },
  {
    slug: "why-my-missing-pages-said-200",
    title: "Why my missing project pages said 200, not 404",
    description:
      "A made-up project address showed my \"not found\" page, but told browsers and Google everything was fine. Here's why, and the fix.",
    date: "2026-10-27",
    tags: ["Next.js", "SEO", "Debugging"],
    body: [
      {
        type: "p",
        text: "While checking my live site today, I tried a project address that doesn't exist. The page said \"Project not found\", which looked right. But when I checked the status code, the number a server sends back with every page, it was 200, which means \"OK\". A missing page should say 404, \"Not Found\". My made-up note addresses already returned 404. Only project pages didn't.",
      },
      { type: "h2", text: "Why it happened" },
      {
        type: "p",
        text: "My Projects page has a loading screen: a loading.tsx file that shows grey placeholder cards while my projects load from Supabase. What I didn't know is that a loading screen also covers every page in the folders below it, so it was covering each project page too.",
      },
      {
        type: "p",
        text: "To show a loading screen straight away, Next.js has to start sending the page before the data arrives, and the status code is sent first. So by the time my project page found out the project didn't exist, the 200 had already been sent and couldn't be taken back. Next.js did the next best thing: it showed my not-found page and added a tag telling Google not to list it. Google calls this a \"soft 404\".",
      },
      { type: "h2", text: "The fix: a route group" },
      {
        type: "p",
        text: "I still wanted the loading screen on the Projects list, just not above each project. Next.js has route groups for this: a folder whose name is in brackets organises files without becoming part of the address. I moved the Projects page and its loading screen into a (list) folder:",
      },
      {
        type: "code",
        lang: "text",
        code: `app/projects/(list)/page.tsx      → still /projects
app/projects/(list)/loading.tsx   → only covers /projects
app/projects/[slug]/page.tsx      → no loading screen above it`,
      },
      {
        type: "p",
        text: "Now a project page checks Supabase before sending anything, so a wrong address gets a real 404. I also added a test that fails if anyone puts a loading screen back above the project pages, because nothing on screen would show the problem: the page looks exactly the same either way.",
      },
      { type: "h2", text: "Also today: numbers on the filters" },
      {
        type: "p",
        text: "On my admin activity log, the All / Projects / Messages / Images buttons now show how many recent entries each kind has, so I can see at a glance if a new message has arrived. Counting is a small tested function, and entries from before I added kinds still count as projects.",
      },
      {
        type: "tip",
        text: "Lesson: \"it looks right\" and \"it is right\" aren't the same. The page looked perfect; only the status code showed the problem. Checking what the server actually sends is part of testing.",
      },
    ],
  },
  {
    slug: "one-timeline-for-projects-messages-and-images",
    title: "One timeline for projects, messages and images",
    description:
      "My admin activity log only knew about projects. Now the database also records messages and images, without keeping anything private.",
    date: "2026-10-27",
    tags: ["Supabase", "Triggers", "Privacy"],
    body: [
      {
        type: "p",
        text: "My admin page has an activity log: a timeline of changes, written by the database itself. Until today it only recorded projects. If a message arrived and I deleted it, or I uploaded a screenshot and then removed it, there was no record. For my final project, I wanted one place that answers the question \"what happened on my site recently?\"",
      },
      { type: "h2", text: "Two more triggers" },
      {
        type: "p",
        text: "The project history is written by a trigger: code that runs inside the database every time a row changes. I added two more in the same style. One runs when a message is saved or deleted, and one runs when a file in my project images folder in Supabase Storage is uploaded or deleted. Storage keeps a row for every file, so a trigger can watch it like any other table.",
      },
      {
        type: "code",
        lang: "sql",
        code: `create trigger messages_activity
  after insert or delete on public.messages
  for each row execute function public.log_message_activity();`,
      },
      {
        type: "p",
        text: "Each entry now also says what kind of thing it is about: a project, a message or an image. Older entries were all about projects, so the page treats an entry without a kind as a project, and nothing from before is lost.",
      },
      { type: "h2", text: "Keeping private things private" },
      {
        type: "p",
        text: "Messages come from strangers, so I thought about what the log should keep. It only copies the sender's name, never their email address or what they wrote. That's enough for \"New message from Thabo\", and if I delete a message, its text really is gone, not hiding in my history. For images, the log keeps only the file name.",
      },
      { type: "h2", text: "Same rules as before" },
      {
        type: "ul",
        items: [
          "Only my account, signed in with my authenticator code, can read the log.",
          "Nobody can add, change or delete entries from a browser, not even me. Only the triggers can write.",
          "The trigger functions can't be called directly through the API either; they only run when a row changes.",
          "New entries appear live, so a message shows up in the timeline the moment it arrives.",
        ],
      },
      { type: "h2", text: "Filters" },
      {
        type: "p",
        text: "With three kinds of entry, the timeline got busy, so I added All / Projects / Messages / Images buttons above it, in the same style as my inbox filters. The filtering is a small function with its own tests, including one that checks older entries still count as projects.",
      },
      {
        type: "p",
        text: "Before running the new setup file on Supabase, I ran all my setup files on a local copy of the database and acted out a real day: a visitor sent a message, then I uploaded an image, deleted it and deleted the message. The log had exactly four new entries, a visitor could still read none of them, and trying to call the trigger functions directly was refused.",
      },
      {
        type: "tip",
        text: "Lesson: a log is only useful if you trust it, and only safe if it doesn't keep more than it needs. Letting the database write it handles the first part; choosing what to copy handles the second.",
      },
    ],
  },
  {
    slug: "from-65-to-83-tests",
    title: "From 65 to 83 tests: testing my docs, my buttons and my spreadsheets",
    description:
      "Every small feature I added this week came with tests, and some tests now check my documentation too. Here's where the 18 new checks came from.",
    date: "2026-10-26",
    tags: ["Testing", "Vitest", "Security"],
    body: [
      {
        type: "p",
        text: "Two days ago I wrote about my tests growing from 47 to 65. This week I added more small features, and npm test now runs 83 checks. I kept the same rule: if a feature makes a decision, the decision gets a test.",
      },
      { type: "h2", text: "Where the 18 new checks came from" },
      {
        type: "ul",
        items: [
          "65 → 69, my docs (4 checks): the README's dev note count matches the real notes, every database setup file is listed in the setup steps, and every file the README or my code guide mentions really exists.",
          "69 → 72, dev note navigation (3 checks): every sub-heading gets its own unique address, two headings with the same words get -2 on the end, and each note links to the right older and newer note.",
          "72 → 76, updated dates and back to top (4 checks): an \"Updated\" date is a real date and never before the note was published, and the back-to-top button stays hidden near the top and appears after scrolling down.",
          "76 → 78, Back and Forward buttons (2 checks): they follow what the browser says when it can tell us, and make a sensible guess when it can't.",
          "78 → 79, README links (1 check): every link inside the README points to a heading that exists, so reorganising it can't leave a broken link.",
          "79 → 83, CSV download (4 checks): cells are quoted correctly, the file has the right header and rows, the file name has the date, and messages can't sneak a formula into a spreadsheet.",
        ],
      },
      { type: "h2", text: "The test I'm proudest of" },
      {
        type: "p",
        text: "My admin inbox can now download messages as a CSV file for Excel or Google Sheets. Those messages come from a public contact form, so anyone can write anything. Spreadsheets treat a cell that starts with = as a formula, so a message written to look like one could run when I open the file. This is called CSV injection. My download puts a ' in front of any cell that starts with a formula character, so it shows as plain text. The test proves it:",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("stops a message from running as a spreadsheet formula", () => {
  expect(csvCell("@everyone")).toBe("'@everyone");
});`,
      },
      { type: "h2", text: "Tests that check words, not code" },
      {
        type: "p",
        text: "Five of the new checks don't test my code at all. They read my README and code guide as plain text and compare them with the real project. I proved they work by breaking my README on purpose, with a wrong count, a misspelt file name and a broken link, and each time a test failed and said exactly what was wrong.",
      },
      {
        type: "p",
        text: "Like before, my database rules aren't in these 83, because they run inside Supabase. I test those separately on a local copy of the database.",
      },
      {
        type: "tip",
        text: "Lesson: a small feature still deserves a test. The CSV button is about 20 lines of code, but one of those lines is a security fix, and a test makes sure nobody removes it by accident.",
      },
    ],
  },
  {
    slug: "lighthouse-check-that-never-ran",
    title: "The Lighthouse check that never ran, and making it four times faster",
    description:
      "My README said Lighthouse tested my site after every deploy. When I looked at GitHub, it had never run once. Here's what I found and how I fixed it.",
    date: "2026-10-26",
    tags: ["Lighthouse", "GitHub Actions", "Debugging"],
    body: [
      {
        type: "p",
        text: "For Milestone 5, I set up Lighthouse CI: a GitHub Action that runs Lighthouse on my live site and fails if Accessibility or SEO drops below 90. My README said it ran after every deploy. Then I opened the Actions tab on GitHub and noticed something: my Tests workflow had 23 green runs, and Lighthouse had none. Not failed, just never started.",
      },
      { type: "h2", text: "Why it never ran" },
      {
        type: "p",
        text: "The workflow was set to start on a deployment_status event: a message that some hosting setups send to GitHub when a deployment finishes. My Vercel project doesn't send that message to GitHub, so the trigger never fired. Nothing was broken in a way that showed up as an error. The check just sat there waiting.",
      },
      { type: "h2", text: "Fix 1: run after every push" },
      {
        type: "p",
        text: "I changed it to start on every push to main, wait 4 minutes for Vercel to deploy, then test six pages three times each. It worked: the first run was green. But it took 8 minutes 46 seconds, and most of that was waiting.",
      },
      { type: "h2", text: "Fix 2: start the moment the new version is live" },
      {
        type: "p",
        text: "Instead of guessing how long Vercel takes, I let the site say which version it is. I added a tiny address, /api/version, that returns the ID of the commit the live site was built from. That ID is already public on GitHub, so it shares nothing private. The workflow checks it every 15 seconds and starts Lighthouse as soon as it matches the commit that was just pushed.",
      },
      {
        type: "code",
        lang: "bash",
        code: `for i in $(seq 1 40); do
  live=$(curl -fsS "$SITE/api/version" | grep -oE '[0-9a-f]{40}')
  if [ "$live" = "$GITHUB_SHA" ]; then exit 0; fi   # the new version is live
  sleep 15
done`,
      },
      {
        type: "p",
        text: "I made two smaller changes too. Each page is tested once instead of three times, because Accessibility and SEO scores don't change between runs (Performance only gives a warning). And pushes that only change documents, like my README, skip Lighthouse completely, because they don't change the live site.",
      },
      { type: "h2", text: "The result" },
      {
        type: "ul",
        items: [
          "Before: never ran at all.",
          "Fix 1: 8 minutes 46 seconds, then 8 minutes 7 seconds.",
          "Fix 2: 2 minutes 14 seconds on the first run, about four times faster.",
        ],
      },
      {
        type: "p",
        text: "I also fixed my README and code guide, which had described a check that wasn't happening.",
      },
      {
        type: "tip",
        text: "Lesson: an automatic check that never runs looks exactly like one that always passes. Every now and then, go and look at the Actions tab and make sure it's really there.",
      },
    ],
  },
  {
    slug: "keeping-docs-honest",
    title: "Keeping my docs as honest as my code",
    description:
      "My README and code guide fell behind my site without me noticing. I fixed them, and now my tests fail if the docs go stale again.",
    date: "2026-10-26",
    tags: ["Documentation", "Testing", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "My portfolio has two documents that explain it: the README, which is the first thing anyone sees on GitHub, and Docs/how-it-works.md, a plain-English guide to the code that I study from. Last week I added a lot to my admin page in a few days. The code was tested. The docs weren't, and they quietly fell behind.",
      },
      { type: "h2", text: "What had gone stale" },
      {
        type: "ul",
        items: [
          "The README still said my database had one table. It had three, plus storage for images.",
          "The code guide still said signing in takes you straight to the dashboard. By then there was a second sign-in step.",
          "The security tables described the older, weaker version of my rules.",
          "My Lighthouse scores table was missing its header row, so GitHub didn't show it as a table at all.",
          "One line named an image format my site no longer uses.",
        ],
      },
      {
        type: "p",
        text: "None of this broke the site, which is exactly why nobody noticed. But a README is a promise about what the code does. If my lecturer or an employer reads it and then finds the code does something different, they stop trusting the rest.",
      },
      { type: "h2", text: "Fixing it, and a new habit" },
      {
        type: "p",
        text: "I rewrote the out-of-date parts of both documents and added the missing sections. Then I made a rule for myself: every commit updates everything it affects, including the README, the code guide, the dev note count, the test count and the setup steps.",
      },
      { type: "h2", text: "Letting the tests check the docs" },
      {
        type: "p",
        text: "Rules you have to remember are easy to forget, so I wrote tests that read my docs as plain text and compare them with the real project. They run on GitHub on every push, with the rest of my tests:",
      },
      {
        type: "ul",
        items: [
          "The README's dev note count must match the real number of notes, in numbers and in words.",
          "Every SQL file in my Supabase folder must appear in the README's setup steps, so nobody setting up the project misses one.",
          "Every file the README or the code guide mentions must really exist, so a renamed or deleted file can't leave a broken reference behind.",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: `it("every SQL file in Supabase/ is in the README's setup steps", () => {
  const sqlFiles = readdirSync("Supabase").filter((f) => f.endsWith(".sql"));
  const notListed = sqlFiles.filter((f) => !readme.includes(\`\\\`\${f}\\\`\`));
  expect(notListed).toEqual([]);
});`,
      },
      {
        type: "p",
        text: "To make sure the tests really work, I broke my README on purpose: I changed the note count and misspelt one file name. Two tests failed and named exactly what was wrong. Then I put it back and everything passed.",
      },
      { type: "h2", text: "What the tests can't do" },
      {
        type: "p",
        text: "They check numbers and file names, not meaning. A test can't tell whether a sentence still describes what the code does. That part is still my job, which is why the habit matters as much as the tests.",
      },
      {
        type: "tip",
        text: "Lesson: documentation is part of the product. If something can be checked automatically, check it; if it can't, make updating it part of every change.",
      },
    ],
  },
  {
    slug: "writing-about-security-safely",
    title: "Writing about security without handing hackers a map",
    description:
      "I went back through my dev notes and took out details that could help an attacker, but kept the code. Here's what I removed, what I kept, and why.",
    date: "2026-10-25",
    tags: ["Security", "Writing", "Supabase"],
    body: [
      {
        type: "p",
        text: "My dev notes explain how I built my portfolio, including its security: Row Level Security, the spam protection on my contact form and two-step sign-in for my admin page. Explaining your work is the point of a dev log. But I realised some of my notes were also a step-by-step guide to the exact numbers and names behind my defences. So I read every note again, as if I were someone trying to get in.",
      },
      { type: "h2", text: "Two kinds of security" },
      {
        type: "ul",
        items: [
          "Security that depends on secrets staying hidden. If someone learns the detail, the protection is gone. Hiding things is called \"security through obscurity\", and on its own it's weak.",
          "Security that still works when people know exactly how it's built. My database rules are like this: knowing that only my account, with my authenticator code, can change a project doesn't help anyone become my account.",
        ],
      },
      {
        type: "p",
        text: "My portfolio leans on the second kind. Row Level Security, the two-step rule and the rate limit all run inside the database, so they protect my data even from someone who has read all my code. My GitHub repo is public anyway, so the code itself was never a secret.",
      },
      { type: "h2", text: "So why remove anything?" },
      {
        type: "p",
        text: "Because some details make an attacker's job easier, even when they can't break the main defence. If you know exactly how many messages you can send before a limit kicks in, you can send just under it. If you know the name of a hidden spam-trap field, a bot can be told to skip it. That doesn't open my database, but it does make my spam protection weaker. A blog post doesn't need those details to teach the idea.",
      },
      { type: "h2", text: "What I changed" },
      {
        type: "ul",
        items: [
          "Exact numbers became descriptions: \"a limit on messages from the same email address in a short time\" instead of the real numbers.",
          "Hidden field names and internal storage names were left out. The idea is explained; the name isn't needed.",
          "Code examples stayed, but with placeholders like max_per_sender and 'my-user-id' instead of real values.",
          "Timings became general, like \"after a while without activity\".",
          "I stopped naming the address of my admin page in the notes.",
          "I also updated two notes whose code showed an older, weaker version of my rules, so nobody reads them and thinks a password alone is enough.",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Before: the real limit was in the post
-- After: the idea is the same, the number stays in the database
if recent_from_sender >= max_per_sender then
  raise exception 'Too many messages. Please try again in a few minutes.';
end if;`,
      },
      { type: "h2", text: "What I kept on purpose" },
      {
        type: "p",
        text: "I didn't hide how my defences work, because that is the useful part for anyone learning, and because it shows the defences are strong. Saying \"visitors get an empty list\" or \"only a database trigger can write to the history\" explains why an attack fails. It doesn't help anyone make it succeed.",
      },
      { type: "h2", text: "The checklist I use now" },
      {
        type: "ul",
        items: [
          "No real IDs, emails, passwords, keys or project addresses. Placeholders only.",
          "No exact limits, thresholds or time windows for security features.",
          "No names of hidden fields, internal storage keys or private pages.",
          "Explain why an attack fails, not how to get around a defence.",
          "If a note shows old code, update it or say clearly that it changed.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: real security should still work when everyone knows how it's built. Writing about it carefully is just good manners: share the idea, keep the numbers.",
      },
    ],
  },
  {
    slug: "from-47-to-65-tests",
    title: "From 47 to 65 tests: what changed and why",
    description:
      "A day after writing about my 47 automated tests, I had 65. Every new feature on my admin page came with tests of its own. Here's the breakdown.",
    date: "2026-10-24",
    tags: ["Testing", "Vitest", "Admin"],
    body: [
      {
        type: "p",
        text: "Yesterday I wrote a note called \"Why my portfolio has 47 automated tests\". It was true when I wrote it, but the number has already moved: npm test now runs 65 checks. That isn't a mistake. The number grew because I followed my own rule: every new feature gets tests for the logic that must not break.",
      },
      { type: "h2", text: "Where the 18 new checks came from" },
      {
        type: "p",
        text: "All of them are in one new file, tests/admin.test.ts, because they all test my admin page:",
      },
      {
        type: "ul",
        items: [
          "47 → 52, live inbox (5 checks): searching by name, email or text in any capitals, an empty search showing everything, non-matches being hidden, and the Reply link using the right address, subject, first name and quoted message.",
          "52 → 58, activity log and auto sign-out (6 checks): each change described in plain words, reorders from one drag grouped into one line, \"5 min ago\" style times, and the sign-out timer staying quiet, warning before the time runs out and signing out when it does, even after the laptop was asleep.",
          "58 → 61, one-tab sign-in (3 checks): a normal refresh keeps me signed in, a closed tab reopened later signs out, and a tab that was never closed is left alone.",
          "61 → 65, two-step sign-in (4 checks): the code screen after the password, the set-up screen when no app is connected, the dashboard only after both steps, and pasted codes with spaces cleaned up.",
        ],
      },
      { type: "h2", text: "Tests I wrote vs checks that run" },
      {
        type: "p",
        text: "In my last note, 28 written tests became 47 checks, because one test runs once for every skill on my Skills page. Now there are 46 written tests (28 + 18) and still one check per skill, so 65 checks run.",
      },
      { type: "h2", text: "Making the admin code testable" },
      {
        type: "p",
        text: "Most of the new admin code talks to Supabase or the browser, which is hard to test. So I moved the decisions into small functions in lib/ that only take values in and give an answer back. For example, nextStep() in lib/two-step.ts decides what to show after the password, and idleState() in lib/idle.ts decides whether to warn or sign out. The components call these functions, and the tests check them directly.",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("only shows the dashboard after both steps", () => {
  expect(nextStep({ currentLevel: "aal2", nextLevel: "aal2" })).toBe("dashboard");
});`,
      },
      {
        type: "p",
        text: "The database rules (RLS, the activity log trigger and the two-step aal2 rule) aren't in these 65, because they run inside Supabase, not in my code. I tested those separately on a local copy of the database as a visitor, as another account and as me, and wrote the results in each feature's note.",
      },
      {
        type: "tip",
        text: "Lesson: a number in a blog post is only true on the day it was written. What matters is that it keeps going up with every feature.",
      },
    ],
  },
  {
    slug: "two-step-sign-in",
    title: "Two-step sign-in: a password isn't enough any more",
    description:
      "My admin page now needs a 6-digit code from an authenticator app on my phone, and the database itself refuses owner access without it.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Security", "Supabase", "MFA"],
    body: [
      {
        type: "p",
        text: "My admin page was protected by an email and password. If someone guessed or stole the password, they could read my messages and change my projects. Two-step sign-in (also called MFA, multi-factor authentication) fixes that: after the password, you also need a code that only my phone can make.",
      },
      { type: "h2", text: "Why an authenticator app and not email codes" },
      {
        type: "p",
        text: "Supabase can send sign-in codes by email, but I wanted something that doesn't depend on an inbox. An authenticator app on my phone makes a new 6-digit code every 30 seconds from a secret that is only on my phone. This is called TOTP, a time-based one-time password. It works offline, and Supabase supports it for free.",
      },
      { type: "h2", text: "How signing in works now" },
      {
        type: "ul",
        items: [
          "Step 1: email and password, as before.",
          "Step 2: the 6-digit code from the app. Only then does the dashboard appear.",
          "The first time, the page shows a QR code instead. I scanned it with the app and typed in the first code to prove it worked. After that, it only ever asks for the code.",
          "There's no way to skip it: without an app set up, the page goes straight to the set-up screen.",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: `const { data } = await supabase.auth.mfa.enroll({ factorType: "totp" }); // QR code to scan
await supabase.auth.mfa.challengeAndVerify({ factorId, code });             // check a code`,
      },
      { type: "h2", text: "The part that really protects the data" },
      {
        type: "p",
        text: "Hiding the dashboard behind a code screen isn't enough on its own, because someone with my password could skip my page and call the Supabase API directly. So I changed the database rules too. Supabase puts an \"assurance level\" in every login token: aal1 means password only, aal2 means password plus code. All my owner rules now go through one function that checks both my user ID and aal2:",
      },
      {
        type: "code",
        lang: "sql",
        code: `create function public.is_owner() returns boolean as $$
  select auth.uid() = 'my-user-id'::uuid
     and (auth.jwt() ->> 'aal') = 'aal2';
$$;

create policy "Owner can read messages"
  on public.messages for select to authenticated
  using ((select public.is_owner()));`,
      },
      {
        type: "p",
        text: "I tested it on a local copy of the database. Signed in as me with only a password (aal1), I couldn't read messages, drafts or the activity log, adding a project or uploading an image failed with \"violates row-level security policy\", and editing or deleting changed nothing. With the code (aal2), everything worked. Visitors can still send messages from the Contact page.",
      },
      {
        type: "p",
        text: "One small bug I found while testing: pasting a code like \"123 456\" only kept 5 digits, because the box had a 6-character limit and counted the space. Now the page removes spaces first.",
      },
      {
        type: "tip",
        text: "Lesson: two-step sign-in only counts if the database checks it too. A code screen stops people using my page; the aal2 rule stops them using my data.",
      },
    ],
  },
  {
    slug: "sign-in-that-ends-when-the-tab-closes",
    title: "A sign-in that ends when I close the tab",
    description:
      "If I forgot to sign out of my admin page, anyone using that computer could open it. Now the sign-in lives in one tab and ends when it closes.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Security", "Supabase", "Browser storage"],
    body: [
      {
        type: "p",
        text: "I noticed a problem with my admin page: if I signed in on a computer and forgot to press Sign out, the next person to open my admin page on that computer went straight into my dashboard. Opening it in a new tab did the same. That's because of where Supabase keeps the sign-in.",
      },
      { type: "h2", text: "localStorage vs sessionStorage" },
      {
        type: "p",
        text: "Browsers have two small storage spaces for each website. localStorage is shared by every tab and stays until it is cleared, even after the browser is closed. sessionStorage belongs to one tab only and is wiped when that tab or window closes. Supabase uses localStorage by default, so the sign-in stayed around. I told it to use sessionStorage instead:",
      },
      {
        type: "code",
        lang: "ts",
        code: `createClient(url, key, {
  auth: { storage: window.sessionStorage },
});`,
      },
      { type: "h2", text: "What happens now" },
      {
        type: "ul",
        items: [
          "My admin page always opens on the sign-in form. Nothing from the dashboard is in the page until Supabase confirms a sign-in made in this tab.",
          "A new tab, a new window or another person on the same computer gets the sign-in form, while my own tab stays signed in.",
          "Closing the window signs me out, even if I forget to press Sign out.",
          "Refreshing keeps me signed in, because sessionStorage survives a refresh.",
        ],
      },
      { type: "h2", text: "The sneaky case: reopening a closed tab" },
      {
        type: "p",
        text: "While testing, I learned that browsers can bring a closed tab back together with its sessionStorage, with Ctrl+Shift+T or when Chrome restores tabs after a restart. So the page writes down the time whenever it is closed or left (the pagehide event). When it opens again, it compares: a refresh comes back within about a second, but a reopened tab comes back much later. If it was gone for more than a few seconds, it signs out.",
      },
      {
        type: "code",
        lang: "ts",
        code: `window.addEventListener("pagehide", () =>
  sessionStorage.setItem(LEFT_AT_KEY, String(Date.now())));

// when the page opens again
if (Date.now() - leftAt > REOPEN_LIMIT) await supabase.auth.signOut({ scope: "local" });`,
      },
      {
        type: "p",
        text: "I also delete the old sign-in that earlier versions saved in localStorage, so nothing is left behind. I tested every case in a browser: a fresh visit, signing in, refreshing, a second tab, reopening a closed tab and starting a new browser. Only my own open tab ever showed the dashboard.",
      },
      {
        type: "tip",
        text: "Lesson: where you store a sign-in decides how long it lasts. For a private admin page, shorter is safer.",
      },
    ],
  },
  {
    slug: "drafts-and-activity-log",
    title: "Drafts and an activity log: letting the database keep track",
    description:
      "My admin page now has drafts that visitors can't see, a live preview, a history of every change and an automatic sign-out.",
    date: "2026-10-24",
    updated: "2026-10-27",
    tags: ["Supabase", "RLS", "Triggers"],
    body: [
      {
        type: "p",
        text: "Until now, every project I added in my admin page went live on my site straight away, and nothing remembered what I had changed. I wanted to work on a project before showing it, see how it would look first, and have a history of my changes.",
      },
      { type: "h2", text: "1. Drafts that are really hidden" },
      {
        type: "p",
        text: "Each project now has a published column and a Live / Draft switch in my admin page. The easy way to hide drafts would be to filter them out in my page code, but then anyone calling the Supabase API directly could still read them. So I changed the Row Level Security rule instead:",
      },
      {
        type: "code",
        lang: "sql",
        code: `create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (published or (select public.is_owner()));`,
      },
      {
        type: "p",
        text: "Visitors only get published projects. is_owner() is true only for my account (and, since I added two-step sign-in, only after I've entered my authenticator code), so I get everything, so drafts still show in my admin page with a Draft label. My public pages didn't need any changes at all, because the database now leaves drafts out for them.",
      },
      { type: "h2", text: "2. A live preview" },
      {
        type: "p",
        text: "While I fill in the form, a preview underneath shows the real project card from my Projects page, built from what I've typed so far. It's the same component, not a copy, so it can't look different. The preview has the HTML attribute inert, which means its buttons can't be clicked or reached with Tab, so I can't leave the page with unsaved changes by accident.",
      },
      { type: "h2", text: "3. An activity log written by the database" },
      {
        type: "p",
        text: "I could have saved a history entry from my admin page after each change, but a history written by the browser can be faked or skipped. Instead, a trigger (code that runs inside the database automatically) writes to an activity_log table whenever a project is added, edited, published, moved to drafts, reordered or deleted. It even works out what changed, like \"Edited MyFlix (summary, tags)\".",
      },
      {
        type: "code",
        lang: "sql",
        code: `create trigger projects_activity
  after insert or update or delete on public.projects
  for each row execute function public.log_project_activity();`,
      },
      {
        type: "ul",
        items: [
          "Only my account can read the log (an RLS select policy).",
          "There are no insert, update or delete policies, so nobody can add, change or remove entries from a browser, not even me. Only the trigger can write.",
          "Dragging one project can move several others, so entries made within a few seconds are grouped into one line: \"Changed the project order (3 projects moved)\".",
          "New entries appear live, using Realtime like my inbox.",
        ],
      },
      {
        type: "p",
        text: "Update: the log now also records messages and project images, not just projects. My note \"One timeline for projects, messages and images\" explains how.",
      },
      {
        type: "p",
        text: "I tested it on a local copy of the database: as a visitor and as another signed-in account, reading the log returned nothing, and adding, changing or deleting entries failed with \"permission denied\". A draft stayed hidden from both, even when they tried to publish it.",
      },
      { type: "h2", text: "4. Automatic sign-out" },
      {
        type: "p",
        text: "If I leave my laptop open, anyone could use my admin page. Now, after a while without clicks, typing or scrolling, a \"Still there?\" box counts down, and then I'm signed out. If the laptop was asleep, I'm signed out as soon as it wakes.",
      },
      {
        type: "tip",
        text: "Lesson: if a rule really matters, like who can see a draft or what goes in a history, let the database enforce it. The page can then focus on looking good.",
      },
    ],
  },
  {
    slug: "live-admin-inbox",
    title: "Making my admin inbox live with Supabase Realtime",
    description:
      "New contact messages now pop into my admin page the moment they're sent, without refreshing, and only my account receives them.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Supabase", "Realtime", "Admin"],
    body: [
      {
        type: "p",
        text: "My contact form saves messages to Supabase, and my private admin page has an inbox to read them. It worked, but I had to press Refresh to see anything new. A real inbox should tell you when something arrives, so I made it live.",
      },
      { type: "h2", text: "Supabase Realtime" },
      {
        type: "p",
        text: "Supabase Realtime keeps a connection open between my admin page and the database. When a row is added, changed or deleted in the messages table, the database pushes that change to the page straight away. I only had to switch it on for my table, once, in the SQL Editor:",
      },
      {
        type: "code",
        lang: "sql",
        code: `alter publication supabase_realtime add table public.messages;`,
      },
      {
        type: "p",
        text: "Then the inbox listens for changes. A new message is added to the top of the list and a small pop-up says \"New message from Thabo\". A small \"Live\" dot next to the title shows the connection is working.",
      },
      {
        type: "code",
        lang: "ts",
        code: `supabase
  .channel("admin-inbox")
  .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
    if (payload.eventType === "INSERT") {
      // add it to the top of the inbox and show the pop-up
    }
  })
  .subscribe();`,
      },
      { type: "h2", text: "Is that safe?" },
      {
        type: "p",
        text: "This was my first question. If the database pushes messages out, could a visitor listen in? No: Realtime follows the same Row Level Security rules as everything else. A browser is only sent the rows it is allowed to read, and only my account is allowed to read messages. A visitor who subscribes to the same table simply receives nothing.",
      },
      { type: "h2", text: "Small things that make it feel like a real inbox" },
      {
        type: "ul",
        items: [
          "The browser tab shows how many messages are unread, like \"(2) Admin\", so I notice even when I'm in another tab.",
          "A search box finds messages by name, email or text, and All / Unread / Read buttons filter the list.",
          "Reply opens my email app with the sender's address, a subject, a greeting with their first name and their message quoted underneath.",
          "Deleting a message shows \"Message deleted · Undo\" for 5 seconds before it is really deleted, so one wrong tap isn't permanent.",
        ],
      },
      {
        type: "p",
        text: "For Undo, the message disappears from the list straight away, but the delete is only sent to Supabase after 5 seconds. Pressing Undo cancels the timer, so nothing was ever deleted. If the delete fails, for example because I'm not allowed, the message comes back and an error explains why.",
      },
      {
        type: "tip",
        text: "Lesson: a live feature still has to follow the security rules. Realtime with RLS means I didn't have to write any new security code; the rules I already had protect it.",
      },
    ],
  },
  {
    slug: "why-my-portfolio-has-tests",
    title: "Why my portfolio has 47 automated tests",
    description:
      "Tests are small programs that check my code still does what it should. Here's what mine check and how GitHub runs them on every push.",
    date: "2026-10-23",
    updated: "2026-10-26",
    tags: ["Testing", "Vitest", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "Every time I change my site, something else could break without me noticing. Clicking through every page after every change is slow, and I would still miss things. So my portfolio has automated tests: small pieces of code that run my real code with example inputs and check the answers are right.",
      },
      { type: "h2", text: "What a test looks like" },
      {
        type: "p",
        text: "I use Vitest, a testing tool that works well with TypeScript. A test describes what should happen in plain words, runs the code, and then \"expects\" a result. This one checks that a project title becomes the right page address:",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("turns & into 'and'", () => {
  expect(slugify("Fish & Bones")).toBe("fish-and-bones");
});`,
      },
      {
        type: "p",
        text: "If someone (including me) changes slugify and breaks it, this test fails and says exactly which rule stopped working.",
      },
      { type: "h2", text: "What my tests check" },
      {
        type: "ul",
        items: [
          "Page addresses: project titles turn into clean addresses, and a project with a case study links to it.",
          "Spam protection: a normal message is accepted, while a filled-in hidden field or a form sent impossibly fast is treated as a bot. Empty names, bad emails and messages that are too short or too long are rejected.",
          "Proof for every skill: every skill on my Skills page must link to evidence, so I can't list a skill I can't back up.",
          "Files really exist: every certificate image, case study screenshot and my CV PDF are where the site links to them, so there are no broken images.",
          "Dev notes: every note has its own address, a real date and a description short enough for Google.",
          "SEO and the contact card: pages get a canonical address and share tags, and the \"Save my contact\" file is a valid vCard.",
          "The reading progress bar on this page: empty at the top, half full halfway, and never more than full.",
        ],
      },
      {
        type: "p",
        text: "Some tests run once for every item, like one check per skill, which is how 28 written tests become 47 checks.",
      },
      { type: "h2", text: "GitHub runs them for me" },
      {
        type: "p",
        text: "I don't have to remember to run them. A GitHub Action (a small job GitHub runs on its own computers) installs my project and runs npm test every time I push. In the Actions tab on GitHub, a green tick means everything passed and a red cross shows which test failed.",
      },
      {
        type: "code",
        lang: "yaml",
        code: `on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: npm install
      - run: npm test`,
      },
      {
        type: "p",
        text: "This sits next to my Lighthouse check, another GitHub Action that tests the live site's speed, accessibility and SEO a few minutes after every push. Together they mean a mistake shows up in minutes, not when a recruiter finds it.",
      },
      {
        type: "tip",
        text: "Lesson: a test is a promise written in code. Write one for each rule you never want to break, and let GitHub check it for you.",
      },
    ],
  },
  {
    slug: "animations-switch-from-peer-review",
    title: "Turning peer review into a feature: the animations switch",
    description:
      "A classmate said my portfolio had too much colour and animation. Instead of removing them, I let every visitor choose.",
    date: "2026-10-23",
    tags: ["Accessibility", "Peer review", "CSS"],
    body: [
      {
        type: "p",
        text: "In peer review, my classmate said my site stands out and feels finished, but that it has too much colour and animation for someone who likes a minimal style. That was fair. The animations are part of my style, so I didn't want to delete them, but I also didn't want them to get in anyone's way.",
      },
      { type: "h2", text: "The idea: let the visitor decide" },
      {
        type: "p",
        text: "I added an animations switch. On a laptop or tablet it is a small round button in the top bar, next to the light and dark mode button. On a phone it is an on/off switch inside the menu. It also works from the Ctrl+K search and from my terminal with the command motion.",
      },
      {
        type: "p",
        text: "I first put the switch in the footer, but nobody scrolls all the way down to change a setting. People look for settings at the top, next to the theme button, so that is where it lives now.",
      },
      { type: "h2", text: "How it remembers your choice" },
      {
        type: "p",
        text: "When you switch animations off, the site saves the word \"reduced\" in localStorage (a small storage space the browser keeps for each website) and adds data-motion=\"reduced\" to the page's <html> tag. On your next visit, a tiny script in the page's <head> reads that choice before anything is drawn, so the animations never flash on and then stop.",
      },
      {
        type: "code",
        lang: "js",
        code: `// Runs before the page is drawn (lib/theme.ts)
if (localStorage.getItem("motion") === "reduced")
  document.documentElement.dataset.motion = "reduced";`,
      },
      { type: "h2", text: "What the calm version looks like" },
      {
        type: "p",
        text: "My CSS already had rules for prefers-reduced-motion, a setting on phones and computers for people who get dizzy or distracted by movement. I copied those same rules for data-motion=\"reduced\", so switching off gives exactly the same calm version:",
      },
      {
        type: "ul",
        items: [
          "Every animation and transition finishes instantly.",
          "The scrolling strip of tech I work with stops and becomes a neat, centred list.",
          "Cards and sections appear straight away instead of sliding in as you scroll.",
          "The stripe that sweeps across the top when you change page is hidden.",
        ],
      },
      { type: "h2", text: "When the device has already said no" },
      {
        type: "p",
        text: "If your phone or computer is set to reduce motion, that always wins. The switch shows as off and can't be turned on, and its label explains why: \"Animations are off because your device asks for less motion\". A website shouldn't override an accessibility setting someone chose on purpose.",
      },
      {
        type: "p",
        text: "The switch also has role=\"switch\" and aria-checked, so a screen reader announces it as an on/off switch and says whether animations are on.",
      },
      {
        type: "tip",
        text: "Lesson: feedback doesn't always mean removing something. Sometimes the best fix is giving people a choice and making the default respect their settings.",
      },
    ],
  },
  {
    slug: "phone-navigation-bar",
    title: "Building a phone navigation bar that actually stays put",
    description:
      "I added an app-style bar to the bottom of my site on phones. It kept moving, and the real cause was an 8-pixel glow I couldn't even see.",
    date: "2026-10-22",
    tags: ["Mobile", "CSS", "Debugging"],
    body: [
      {
        type: "p",
        text: "On phones, my site now has a bar fixed to the bottom of the screen with Home, Projects, Search, Notes and Contact, like an app. Your thumb can reach it, so you never have to scroll back up to the menu. My first version had three problems.",
      },
      { type: "h2", text: "1. Hiding it while scrolling felt broken" },
      {
        type: "p",
        text: "I first made the bar slide away when you scroll down and come back when you scroll up, which a lot of apps do. On my phone it just felt unreliable: the bar kept disappearing exactly when I wanted to tap it. Now it never moves. A navigation bar you can always find is better than a clever one.",
      },
      { type: "h2", text: "2. The blur made scrolling stutter" },
      {
        type: "p",
        text: "The bar had a see-through, blurred background. It looks nice, but the phone has to redraw that blur on every frame while you scroll, which made the page judder. A solid background with a soft shadow above it looks almost the same and scrolls smoothly.",
      },
      { type: "h2", text: "3. The real bug: something was 8 pixels too wide" },
      {
        type: "p",
        text: "On the Home page only, the bar sat partly below the bottom of the screen and the page could wobble sideways. I measured the page with JavaScript and found it was 398 pixels wide on a 390-pixel phone. The culprit was the soft red and teal glow behind my terminal card. It was set to spread 24 pixels past the card on every side, so on a narrow screen it poked out past the edge.",
      },
      {
        type: "p",
        text: "You can't see the glow's edge, but the phone's browser can. When anything is wider than the screen, it makes the whole page wider to fit it, and \"fixed to the bottom of the screen\" then means the bottom of that wider, slightly zoomed page. Two fixes:",
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- The glow only spreads sideways on large screens -->
<div class="fx-glow absolute -inset-y-6 inset-x-0 lg:-inset-6 ..."></div>

<!-- And the page can never be wider than the screen -->
<html class="overflow-x-clip">`,
      },
      { type: "h2", text: "How I checked it" },
      {
        type: "ul",
        items: [
          "I scrolled through five pages on three phone sizes (360, 390 and 430 pixels wide) and recorded where the bar's bottom edge was on every step. It was always exactly at the bottom of the screen.",
          "I scrolled to the very end of each page to check the footer isn't hidden behind the bar. The page has extra space at the bottom on phones so nothing gets covered.",
          "I compared screenshots of my desktop pages before and after. They're identical, because the bar only exists below tablet size.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: if something fixed to the screen won't stay put on a phone, look for anything wider than the screen, even something invisible like a glow or a shadow.",
      },
    ],
  },
  {
    slug: "testing-on-a-real-phone",
    title: "What I learned when I tested my portfolio on my own phone",
    description:
      "My site looked perfect on my laptop. On my phone, the tech strip froze, cards left blank gaps and the screenshots were slow. Here's what was really going on.",
    date: "2026-10-22",
    tags: ["Mobile", "CSS", "Accessibility"],
    body: [
      {
        type: "p",
        text: "I had checked my portfolio at phone sizes in the browser's developer tools, and everything passed. Then I opened it on my actual phone and found five problems straight away. Testing on a real device showed me things a desktop browser pretending to be a phone did not.",
      },
      { type: "h2", text: "1. The tech strip froze when I tapped it" },
      {
        type: "p",
        text: "My \"Tech I work with\" strip scrolls sideways and pauses when you hover over it with a mouse. Phones don't have hover, so they treat a tap as a hover, and the hover never ends. One tap and the strip stopped for good. The fix was to only pause on hover on devices that actually have a mouse:",
      },
      {
        type: "code",
        lang: "css",
        code: `@media (hover: hover) {
  .fx-marquee-wrap:hover .fx-marquee {
    animation-play-state: paused;
  }
}`,
      },
      { type: "h2", text: "2. My phone was asking for less motion" },
      {
        type: "p",
        text: "Even after that, most of my animations still didn't play on my phone. The reason surprised me: my phone's power saving mode tells websites \"reduce motion\" (a setting for people who feel dizzy or distracted by movement), and my site was already respecting it by switching animations off. So the site was doing the right thing. The problem was what it looked like afterwards: the strip stopped half-way, with tech names cut off at the edge of the screen.",
      },
      {
        type: "p",
        text: "Now, when a device asks for less motion, the strip turns into a neat wrapped list that shows every technology. People who want a calm site still see everything.",
      },
      { type: "h2", text: "3. Blank gaps while scrolling" },
      {
        type: "p",
        text: "My cards fade in as they scroll into view, and they only finished fading once they were 22% of the way up the screen. On a laptop that's fine, but a phone screen is short, so the bottom part of the screen often looked empty while I scrolled. On phones and tablets, cards now finish appearing once their top edge is 120 pixels onto the screen:",
      },
      {
        type: "code",
        lang: "css",
        code: `@media (max-width: 1023px) {
  .fx-reveal {
    animation-range: entry 0px entry 120px;
  }
}`,
      },
      { type: "h2", text: "4. Light mode looked wrong" },
      {
        type: "p",
        text: "My phone's browser has its own dark mode that recolours websites, so it was fighting my light theme. I added one setting that tells browsers my site already has its own dark and light themes (color-scheme: dark light), so they leave my colours alone.",
      },
      { type: "h2", text: "5. Slow screenshots and a missing QR code" },
      {
        type: "ul",
        items: [
          "Screenshots: I switched the image format Vercel creates from AVIF to WebP, which is much quicker to make the first time, and added a soft shimmer while an image loads so the space never looks broken.",
          "QR code: I had hidden it on phones because \"you can't scan your own screen\". But it's actually handy on a phone, so someone else can scan it straight off my screen. Now it shows everywhere.",
        ],
      },
      {
        type: "p",
        text: "All of these fixes only apply to phones and tablets, or to people who ask for less motion. I compared screenshots of my desktop pages before and after, and they stayed the same.",
      },
      {
        type: "tip",
        text: "Lesson: developer tools are a good start, but always test on a real phone. Real phones have touch screens, battery-saving settings and their own browser features that change how a site behaves.",
      },
    ],
  },
  {
    slug: "lighthouse-74-to-96",
    title: "How I took my Lighthouse score from 74 to 96",
    description:
      "My portfolio scored 100 for accessibility and SEO but only 74 for performance on mobile. The problem was my own animations.",
    date: "2026-10-21",
    tags: ["Performance", "Lighthouse", "Next.js"],
    body: [
      {
        type: "p",
        text: "Lighthouse is a free tool in Chrome that tests a web page and gives it scores out of 100. When I ran it on my portfolio as a phone, Accessibility, Best Practices and SEO were all 100, but Performance was only 74.",
      },
      { type: "h2", text: "What the report said" },
      {
        type: "ul",
        items: [
          "Largest Contentful Paint (when the biggest piece of content appears): 3.4 seconds",
          "Speed Index (how fast the page looks finished): 5.1 seconds",
          "Total Blocking Time (how long JavaScript stops the page from responding): 550 ms",
        ],
      },
      {
        type: "p",
        text: "The surprising part: my page actually showed up in 1.5 seconds. The problem was my entrance animations. My heading and intro started at opacity 0 and faded in, and my code card typed itself out over about two seconds. To Lighthouse, invisible content is content that hasn't loaded yet.",
      },
      { type: "h2", text: "What I changed" },
      {
        type: "ul",
        items: [
          "The heading and intro now slide up a few pixels but are visible from the very first frame.",
          "The code card types in about twice as fast.",
          "The Ctrl+K search, the image viewer and the mouse-glow effect now load just after the page appears, instead of with it.",
          "I only download the two heading font weights I actually use, instead of four.",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: `/* Before: hidden until the animation finishes */
@keyframes fx-rise {
  from { opacity: 0; transform: translateY(18px); }
}

/* After: always visible, it just slides into place */
@keyframes fx-enter {
  from { transform: translateY(14px); }
}`,
      },
      {
        type: "p",
        text: "Performance went from 74 to 88, and then to 96 on a clean run in an Incognito window, because browser extensions slow Lighthouse down. The site looks the same; it just stops hiding itself.",
      },
      {
        type: "tip",
        text: "Lesson: an animation can make a fast page look slow to a test. Animate where things move, not whether they can be seen.",
      },
    ],
  },
  {
    slug: "contact-form-without-captcha",
    title: "Stopping spam on my contact form without a CAPTCHA",
    description:
      "How I protect my portfolio's contact form with a hidden honeypot field, a timing check and a rate limit inside the database.",
    date: "2026-10-21",
    updated: "2026-10-24",
    tags: ["Security", "Supabase", "Forms"],
    body: [
      {
        type: "p",
        text: "A public contact form is an open door for spam bots. The usual fix is a CAPTCHA (the \"I'm not a robot\" puzzle), but those annoy real people. I wanted protection that visitors never notice.",
      },
      { type: "h2", text: "Layer 1: a honeypot" },
      {
        type: "p",
        text: "The form has an extra field that people can't see or reach with the keyboard. Bots fill in every field they find, so if that field has anything in it, my API route quietly throws the message away but still answers \"sent\", so the bot doesn't learn anything.",
      },
      { type: "h2", text: "Layer 2: too fast to be human" },
      {
        type: "p",
        text: "The form remembers when it was opened. A message sent faster than any person could type it is almost certainly a bot, so it gets the same quiet treatment.",
      },
      { type: "h2", text: "Layer 3: a rate limit in the database" },
      {
        type: "p",
        text: "This is the one that can't be skipped, because it runs inside Supabase itself, not in my website code. A trigger checks every new message before it is saved:",
      },
      {
        type: "ul",
        items: [
          "a limit on messages from the same email address in a short time",
          "a limit per visitor (I store a one-way hash of the IP address, never the IP itself)",
          "a limit on the total number of messages per hour, in case lots of bots try at once",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `-- the real limits are kept in the database, not in this post
if recent_from_sender >= max_per_sender then
  raise exception 'Too many messages. Please try again in a few minutes.'
    using errcode = 'P0001';
end if;`,
      },
      {
        type: "p",
        text: "My API route turns that error into a friendly \"please try again\" message with the HTTP status 429 (Too Many Requests).",
      },
      { type: "h2", text: "And who can read the messages?" },
      {
        type: "p",
        text: "Row Level Security (database rules for who can see each row) lets anyone add a message, but only my account can read, mark as read or delete them. I tested it: a visitor can send a message, but asking the database for messages gives them an empty list.",
      },
      {
        type: "tip",
        text: "Lesson: put the rule that must never be skipped as close to the data as possible.",
      },
    ],
  },
  {
    slug: "row-level-security-explained",
    title: "Row Level Security: letting the database say no",
    description:
      "My admin page can add, edit and delete projects, but only for my account. Here's how Supabase Row Level Security makes sure of it, and how I proved it.",
    date: "2026-10-21",
    updated: "2026-10-25",
    tags: ["Supabase", "RLS", "Security"],
    body: [
      {
        type: "p",
        text: "My Projects page loads from a Supabase database, and my admin page lets me add, edit and delete projects. The key that connects my site to Supabase is public (anyone can find it in the browser), so the website alone can't be trusted to keep people out. The database has to do it.",
      },
      { type: "h2", text: "What Row Level Security does" },
      {
        type: "p",
        text: "Row Level Security (RLS) is a set of rules on a table. Once it is switched on, the database refuses everything unless a rule (a \"policy\") allows it. I wrote four policies for my projects table:",
      },
      {
        type: "ul",
        items: [
          "Anyone can read projects (they're on my public site).",
          "Only my account can add a project.",
          "Only my account can edit a project.",
          "Only my account can delete a project.",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `create policy "Owner can add projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = 'my-user-id'::uuid);`,
      },
      {
        type: "p",
        text: "auth.uid() is the ID of whoever is signed in. If it isn't mine, the database says no, even if someone copies my site's code and sends the request themselves.",
      },
      { type: "h2", text: "How I proved it" },
      {
        type: "p",
        text: "I opened my live site as a visitor, opened the browser console and tried to change the database directly with the public key:",
      },
      {
        type: "ul",
        items: [
          "Adding a project failed with error 42501 (\"new row violates row-level security policy\").",
          "Editing and deleting didn't fail loudly — they just changed nothing and returned an empty list, because the visitor can't \"see\" any rows to change.",
          "Signed in as me, all three worked.",
        ],
      },
      {
        type: "p",
        text: "That second point caught me out at first. My admin page now checks whether any rows came back, and shows \"Nothing was saved. You may not have permission\" instead of pretending it worked.",
      },
      {
        type: "p",
        text: "Update: these rules are even stricter now. \"Only my account\" also means I must have entered the code from my authenticator app, so a stolen password isn't enough. My note on two-step sign-in explains how.",
      },
      {
        type: "tip",
        text: "Lesson: test security as the person you're trying to keep out, not just as yourself.",
      },
    ],
  },
];

/**
 * Gives each sub-heading in a note its own address, like #what-had-gone-stale, so a link
 * can point straight to that section. Blocks that aren't headings get null.
 * Two headings with the same words get -2, -3 on the end so every address is unique.
 */
export function headingIds(body: Block[]) {
  const used = new Map<string, number>();
  return body.map((block) => {
    if (block.type !== "h2") return null;
    const base = slugify(block.text) || "section";
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

/** The notes either side of this one. The list is newest first, so "older" is the next one in it. */
export function noteNeighbours(slug: string) {
  const i = notes.findIndex((n) => n.slug === slug);
  if (i === -1) return { older: null, newer: null };
  return { older: notes[i + 1] ?? null, newer: i > 0 ? notes[i - 1] : null };
}

/** The date a note last changed: its "updated" date if it has one, otherwise when it was published */
export function lastChanged(note: Note) {
  return note.updated ?? note.date;
}

export function findNote(slug: string) {
  return notes.find((n) => n.slug === slug) ?? null;
}

/** About how long a note takes to read, at 200 words a minute */
export function readingMinutes(note: Note) {
  const text = note.body
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.type === "code" ? b.code : b.text))
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

/** "2026-10-25" -> "25 Oct", for tight spaces like the notes list */
export function formatShortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

/** "2026-10-21" -> "21 October 2026" */
export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}
