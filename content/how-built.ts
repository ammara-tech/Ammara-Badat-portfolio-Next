/*
  ✍️ MY WORDS — "How this site is built" (/how-its-built): everything that proves the work is
  solid, in one place, for a recruiter who doesn't want to hunt for it.

  The numbers on that page (live apps, dev notes, Lighthouse scores) are not typed here: they come
  from content/recruiters.ts, content/notes.ts and content/about.ts, so they never go out of date.
  Each link goes to the dev note, page or code that backs the claim up. A test (tests/content.test.ts)
  fails if a note link points to a note that doesn't exist.
  These are drafts: read them and change anything that doesn't sound like me.
*/

export type BuiltLink = { label: string; href: string };
export type BuiltSection = {
  id: string;
  title: string;
  text: string;
  items?: string[];
  links: BuiltLink[];
};

export const REPO_URL = "https://github.com/ammara-tech/Ammara-Badat-portfolio-Next";

export const howBuilt = {
  intro:
    "This portfolio is a real app, not a template: a database, an admin area, automated tests and a build that checks itself. Here is what it's made of and how I know it works, with a link to the proof for each part.",

  sections: [
    {
      id: "made-with",
      title: "What it's made with",
      text: "Next.js and React with TypeScript, styled with Tailwind CSS. My projects, the messages people send me and the admin area live in Supabase. Vercel hosts it and measures how it feels for real visitors.",
      items: [
        "Next.js (App Router), React and TypeScript",
        "Tailwind CSS for the styling, with a light and dark theme",
        "Supabase (Postgres) for projects, messages and sign-in",
        "Vercel for hosting, with analytics and speed measurements",
        "My CV PDF is built from the same data the site uses",
      ],
      links: [
        { label: "A CV that updates itself", href: "/notes/a-cv-that-updates-itself" },
        { label: "Giving each of my apps its own look", href: "/notes/giving-each-of-my-apps-its-own-look" },
      ],
    },
    {
      id: "tested",
      title: "Checked automatically",
      text: "Every push to GitHub runs my tests, so a change that breaks something is caught before anyone sees it. There are four kinds of check.",
      items: [
        "Unit tests (Vitest) for the logic: the contact form's rules, project addresses, sorting and more",
        "A real browser (Playwright) that clicks through the site like a visitor",
        "Database tests that try to break the security rules of my Supabase tables",
        "A Lighthouse run that fails the build if speed, accessibility or SEO drops",
      ],
      links: [
        { label: "Why my portfolio has tests", href: "/notes/why-my-portfolio-has-tests" },
        { label: "Testing my site like a real visitor", href: "/notes/testing-my-site-like-a-real-visitor" },
        { label: "Testing my database rules automatically", href: "/notes/testing-my-database-rules-automatically" },
      ],
    },
    {
      id: "secure",
      title: "Secure by default",
      text: "Visitors can read what I publish and nothing else. The rules live in the database itself, so they hold even if someone skips my pages and talks to it directly.",
      items: [
        "Row-level security: a visitor only ever sees published projects",
        "Security headers on every page",
        "The admin area is behind two-step sign-in, and the session ends when the tab closes",
        "The contact form is protected from spam without a captcha, and a visitor's message is kept safe",
      ],
      links: [
        { label: "Row-level security, explained", href: "/notes/row-level-security-explained" },
        { label: "Security headers", href: "/notes/security-headers" },
        { label: "Two-step sign-in", href: "/notes/two-step-sign-in" },
        { label: "Contact form without a captcha", href: "/notes/contact-form-without-captcha" },
      ],
    },
    {
      id: "fast",
      title: "Fast and accessible",
      text: "I measure with Google's Lighthouse and keep the proof. The scores in the numbers above are my Home page; the status page has them for my other apps too.",
      links: [
        { label: "Lighthouse scores for my apps (status page)", href: "/status" },
        { label: "Lighthouse from 74 to 96", href: "/notes/lighthouse-74-to-96" },
        { label: "Why my phone score moves", href: "/notes/why-my-phone-lighthouse-score-moves" },
        { label: "Animations switch, from peer review", href: "/notes/animations-switch-from-peer-review" },
      ],
    },
    {
      id: "offline",
      title: "Works when the internet doesn't",
      text: "If a page can't load, because a visitor is offline or my site is slow to answer, a small service worker shows my Endless Dash game instead of an error page. It's saved in the browser on the first visit, and you can play it any time.",
      links: [
        { label: "Play Endless Dash", href: "/dash-game" },
        { label: "How it works: A game when a page can't load", href: "/notes/a-game-when-a-page-cant-load" },
      ],
    },
    {
      id: "documented",
      title: "Documented, and the docs are checked",
      text: "Each of my bigger apps has a diagram of how it works on its project page, and my README is tested so it can't fall behind the code.",
      links: [
        { label: "How-it-works diagrams and a status page", href: "/notes/how-it-works-diagrams-and-a-status-page" },
        { label: "Keeping the docs honest", href: "/notes/keeping-docs-honest" },
      ],
    },
  ] satisfies BuiltSection[],
};
