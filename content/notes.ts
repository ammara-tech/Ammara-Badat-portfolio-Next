/*
  ✍️ DEV NOTES — short posts about things I built and learned.

  Each note is a list of blocks: a paragraph ("p"), a sub-heading ("h2"),
  a bullet list ("ul"), a code sample ("code") or a highlighted tip ("tip").
  To add a note, copy one of the objects below, give it a new slug and put it
  at the top of the list (newest first). The page, the sitemap, the RSS feed
  and the Ctrl+K search all pick it up automatically.

  These are drafts — read them and change anything so it sounds like me.
*/

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
  date: string; // YYYY-MM-DD
  tags: string[];
  body: Block[];
};

export const notes: Note[] = [
  {
    slug: "why-my-portfolio-has-tests",
    title: "Why my portfolio has 47 automated tests",
    description:
      "Tests are small programs that check my code still does what it should. Here's what mine check and how GitHub runs them on every push.",
    date: "2026-10-23",
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
          "Spam protection: a normal message is accepted, while a filled-in hidden field or a form sent in under 3 seconds is treated as a bot. Empty names, bad emails and messages that are too short or too long are rejected.",
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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm test`,
      },
      {
        type: "p",
        text: "This sits next to my Lighthouse check, another GitHub Action that tests speed, accessibility and SEO after every deploy. Together they mean a mistake shows up in minutes, not when a recruiter finds it.",
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
        text: "In peer review, my classmate Legion said my site stands out and feels finished, but that it has too much colour and animation for someone who likes a minimal style. That was fair. The animations are part of my style, so I didn't want to delete them, but I also didn't want them to get in anyone's way.",
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
    tags: ["Security", "Supabase", "Forms"],
    body: [
      {
        type: "p",
        text: "A public contact form is an open door for spam bots. The usual fix is a CAPTCHA (the \"I'm not a robot\" puzzle), but those annoy real people. I wanted protection that visitors never notice.",
      },
      { type: "h2", text: "Layer 1: a honeypot" },
      {
        type: "p",
        text: "The form has an extra field called \"website\" that people can't see or reach with the keyboard. Bots fill in every field they find, so if that field has anything in it, my API route quietly throws the message away but still answers \"sent\", so the bot doesn't learn anything.",
      },
      { type: "h2", text: "Layer 2: too fast to be human" },
      {
        type: "p",
        text: "The form remembers when it was opened. A message sent less than three seconds later is almost certainly a bot, so it gets the same quiet treatment.",
      },
      { type: "h2", text: "Layer 3: a rate limit in the database" },
      {
        type: "p",
        text: "This is the one that can't be skipped, because it runs inside Supabase itself, not in my website code. A trigger checks every new message before it is saved:",
      },
      {
        type: "ul",
        items: [
          "at most 3 messages per email address every 10 minutes",
          "at most 3 per visitor every 10 minutes (I store a one-way hash of the IP address, never the IP itself)",
          "at most 30 messages an hour in total",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `if recent_from_sender >= 3 then
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
    tags: ["Supabase", "RLS", "Security"],
    body: [
      {
        type: "p",
        text: "My Projects page loads from a Supabase database, and my /admin page lets me add, edit and delete projects. The key that connects my site to Supabase is public (anyone can find it in the browser), so the website alone can't be trusted to keep people out. The database has to do it.",
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
        type: "tip",
        text: "Lesson: test security as the person you're trying to keep out, not just as yourself.",
      },
    ],
  },
];

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

/** "2026-10-21" -> "21 October 2026" */
export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}
