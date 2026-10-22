/*
  ✍️ MY CV — shown as a web page at /cv.
  It matches my PDF CV (public/cv/Ammara-Badat-CV.pdf). If I change one, I update the other.
*/

const gh = "https://github.com/ammara-tech";
const site = "https://ammara-badat-portfolio-next.vercel.app";

export type CvProject = {
  title: string;
  links: { label: string; href: string }[];
  stack: string;
  points: string[];
};

export const cv = {
  profile:
    "Junior full stack developer who builds complete web applications, from responsive interfaces in React and Next.js to secure back ends with SQL and Supabase. Certified in HTML and CSS, HTML5 Application Development, JavaScript and Software Development (Certiport IT Specialist). Available immediately for junior full stack or front-end roles in Gauteng, hybrid or on-site.",

  skills: [
    {
      label: "Front end",
      value:
        "HTML, CSS, JavaScript (ES modules), TypeScript, React, Next.js (App Router), Tailwind CSS, responsive design, Progressive Web Apps",
    },
    {
      label: "Back end & data",
      value: "SQL, PostgreSQL, Supabase (Auth, Row Level Security, Storage), REST APIs, server-side validation",
    },
    {
      label: "Tools & practice",
      value:
        "Git and GitHub, Vercel, VS Code, accessibility (WCAG AA contrast, keyboard navigation), SEO, Lighthouse, automated tests, technical writing",
    },
  ],

  projects: [
    {
      title: "Family Clinic Platform (capstone)",
      links: [
        { label: "Live", href: "https://nextjs-dashoard-psi.vercel.app" },
        { label: "Code", href: `${gh}/nextjs-dashoard` },
        { label: "Case study", href: "/projects/nextjs-dashboard" },
      ],
      stack: "Next.js, TypeScript, Supabase (Auth, RLS, Storage), Tailwind CSS, Vercel",
      points: [
        "Built a secure clinic system with separate sign-ins and dashboards for the owner, front desk, doctors, pharmacy and patients.",
        "Enforced access in the database with row-level security and trusted roles, so each role only sees the records it is allowed to.",
        "Delivered a patient portal with online booking and private document uploads, and owner charts for practice growth and no-shows.",
      ],
    },
    {
      title: "Developer Portfolio",
      links: [
        { label: "Live", href: site },
        { label: "Code", href: `${gh}/Ammara-Badat-portfolio-Next` },
      ],
      stack: "Next.js, TypeScript, Supabase, Tailwind CSS",
      points: [
        "Projects stored in Supabase, managed from an owner-only admin page with image uploads and drag-and-drop ordering.",
        "Contact form with owner-only reading, a honeypot field and a database rate limit; Lighthouse 96 performance and 100 accessibility, best practices and SEO.",
      ],
    },
    {
      title: "Neon Arcade",
      links: [
        { label: "Live", href: "https://neon-arcade-nu.vercel.app" },
        { label: "Code", href: `${gh}/Neon-Arcade` },
      ],
      stack: "JavaScript, HTML, CSS, Canvas, PWA",
      points: ["Retro browser arcade with 10 games, a shared ticket and trophy system and a daily challenge; installs and works offline."],
    },
    {
      title: "F1 Race Hub",
      links: [
        { label: "Live", href: "https://f1-race-hub-2026.vercel.app" },
        { label: "Code", href: `${gh}/F1-Race-Hub-2026` },
      ],
      stack: "JavaScript, HTML, CSS, REST API",
      points: ["Formula 1 dashboard using live data for drivers, teams, races and circuits, with favourites and driver comparisons."],
    },
    {
      title: "MyFlix",
      links: [
        { label: "Live", href: "https://myflix-lemon.vercel.app" },
        { label: "Code", href: `${gh}/myflix` },
      ],
      stack: "JavaScript, HTML, CSS, public APIs, PWA",
      points: ["Movie and TV browsing app with search, favourites, genres and a movie guessing game."],
    },
  ] satisfies CvProject[],

  certifications: [
    {
      issuer: "Certiport Information Technology Specialist",
      names: "HTML and CSS; HTML5 Application Development; Software Development; JavaScript",
      date: "2026 – 2031",
    },
    {
      issuer: "Vercel Next.js Learn",
      names: "App Router Fundamentals; Pages Router Fundamentals; React Foundations for Next.js; SEO Fundamentals",
      date: "2026",
    },
    { issuer: "Harvard University CS50", names: "Introduction to Programming with Scratch", date: "2026" },
  ],

  education: {
    title: "IT Programming (ITProg26)",
    school: "Unicollege, Krugersdorp",
    year: "2026",
    description: "Full-time course covering web development, programming logic, databases and software development.",
  },
};
