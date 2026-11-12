/*
  MY JOURNEY — the timeline on the About page (components/Journey.tsx).
  From my first repository to my latest live apps, oldest first.

  Each date is the month I created that project's GitHub repository, so anyone can check it
  on my GitHub. "href" is the project's page on this site (or its live site).
  ✍️ The one-line descriptions are mine: keep them short and true.
  Checked in tests/content.test.ts (oldest first, every step has a date and a line).
*/

export type JourneyStep = {
  date: string; // "2026-06": the month the GitHub repository was created
  title: string;
  line: string; // one sentence: what it was and what it taught me
  href?: string;
  milestone?: boolean; // the big steps, drawn larger on the timeline
};

export const journey: JourneyStep[] = [
  {
    date: "2026-02",
    title: "Started IT Programming",
    line: "Began ITProg26 at Unicollege and made my first GitHub repository.",
    milestone: true,
  },
  {
    date: "2026-06",
    title: "MyFlix",
    line: "My first app: a movie finder and cinema game in plain HTML, CSS and JavaScript.",
    href: "/projects/myflix",
  },
  {
    date: "2026-06",
    title: "F1 Race Hub",
    line: "A Formula 1 dashboard of drivers, teams and races, split into JavaScript modules.",
    href: "/projects/f1-race-hub",
  },
  {
    date: "2026-07",
    title: "My first portfolio",
    line: "Built from scratch with HTML, CSS and JavaScript.",
    href: "/projects/personal-portfolio",
  },
  {
    date: "2026-07",
    title: "Fish-bones",
    line: "A game set in the Arctic, where predator and prey are both hungry.",
    href: "/projects/fish-bones",
  },
  {
    date: "2026-09",
    title: "Next.js Dashboard, my capstone",
    line: "My first full stack app: Next.js, PostgreSQL and Supabase, with an invoice dashboard and a family clinic system.",
    href: "/projects/nextjs-dashboard",
    milestone: true,
  },
  {
    date: "2026-10",
    title: "Neon Arcade",
    line: "Ten browser games with one shared progression system, installable as an app.",
    href: "/projects/neon-arcade",
  },
  {
    date: "2026-10",
    title: "This portfolio",
    line: "Rebuilt with Next.js, TypeScript and Supabase: an admin area, two-step sign-in and automated tests.",
    href: "/projects/portfolio-v2-this-site",
    milestone: true,
  },
  {
    date: "2026-10",
    title: "PaperTrail, TickList and Rememba",
    line: "My first three Firebase apps in one week: quotes and invoices, a shared shopping list, and flashcards. All work offline.",
    href: "/projects/papertrail",
    milestone: true,
  },
  {
    date: "2026-11",
    title: "ShiftBoard",
    line: "A staff rota where managers and staff see different things, protected by security rules.",
    href: "/projects/shiftboard",
  },
  {
    date: "2026-11",
    title: "HireTrack",
    line: "A board for my own job hunt, with reminders, interview prep and honest stats.",
    href: "/projects/hiretrack",
  },
  {
    date: "2026-11",
    title: "StokvelBook, ColourCheck and CVcraft",
    line: "Three apps in one day: a stokvel's record book nobody can quietly change, a colour contrast checker, and a CV builder.",
    href: "/projects/stokvelbook",
  },
  {
    date: "2026-11",
    title: "QueueUp",
    line: "A walk-in queue on everyone's phone: scan a QR code, take a number, and wait wherever you like.",
    href: "/projects/queueup",
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-06" -> "Jun 2026" */
export function journeyDate(date: string) {
  const [year, month] = date.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
