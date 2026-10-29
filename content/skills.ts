/*
  SKILLS + EVIDENCE

  Rule: every skill must link to evidence (a project, a file, a commit or a live page).
  The type below makes that impossible to forget: "evidence" needs at least one link,
  so the site will not build if a skill has none.

  ✍️ The "note" lines are short descriptions — check they're true and in your words.
*/

import { certificateLink as cert } from "@/content/certifications";

export type Evidence = { label: string; href: string };

export type Skill = {
  name: string;
  note: string;
  evidence: [Evidence, ...Evidence[]];
};

export type SkillGroup = { title: string; skills: Skill[] };

const gh = "https://github.com/ammara-tech";
const portfolio = `${gh}/Ammara-Badat-portfolio-Next`;
const clinic = `${gh}/nextjs-dashoard`;

export const skillGroups: SkillGroup[] = [
  {
    title: "Front end",
    skills: [
      {
        name: "HTML",
        note: "Semantic page structure for every project, including a 10-game arcade.",
        evidence: [
          { label: "Neon Arcade: index.html", href: `${gh}/Neon-Arcade/blob/main/index.html` },
          { label: "Neon Arcade (live)", href: "https://neon-arcade-nu.vercel.app/" },
          cert("certiport-html-css", "Certiport HTML and CSS"),
          cert("certiport-html5-app-dev", "Certiport HTML5 App Development"),
        ],
      },
      {
        name: "CSS & responsive design",
        note: "Layouts that work on phones and desktops, split into tidy stylesheets.",
        evidence: [
          { label: "MyFlix: css/ folder", href: `${gh}/myflix/tree/main/css` },
          { label: "F1 Race Hub: css/ folder", href: `${gh}/F1-Race-Hub-2026/tree/main/css` },
          cert("certiport-html-css", "Certiport HTML and CSS"),
        ],
      },
      {
        name: "JavaScript (ES modules)",
        note: "Apps split into modules for state, rendering and features.",
        evidence: [
          { label: "F1 Race Hub: js/ folder", href: `${gh}/F1-Race-Hub-2026/tree/main/js` },
          { label: "Fish-bones: js/game.js", href: `${gh}/Fish-bones/blob/main/js/game.js` },
          cert("certiport-javascript", "Certiport JavaScript"),
        ],
      },
      {
        name: "Canvas & game loops",
        note: "Animated games drawn on <canvas> with requestAnimationFrame.",
        evidence: [
          { label: "Fish-bones: js/game.js", href: `${gh}/Fish-bones/blob/main/js/game.js` },
          { label: "Neon Arcade: js/core.js", href: `${gh}/Neon-Arcade/blob/main/js/core.js` },
        ],
      },
      {
        name: "Working with APIs",
        note: "Fetching live data and turning it into a usable interface.",
        evidence: [
          { label: "F1 Race Hub: js/api/jolpica.js", href: `${gh}/F1-Race-Hub-2026/blob/main/js/api/jolpica.js` },
          { label: "MyFlix: js/api/anilist.js", href: `${gh}/myflix/blob/main/js/api/anilist.js` },
        ],
      },
      {
        name: "Browser storage",
        note: "Saving favourites, scores and progress with localStorage.",
        evidence: [
          {
            label: "F1 Race Hub: js/features/favourites.js",
            href: `${gh}/F1-Race-Hub-2026/blob/main/js/features/favourites.js`,
          },
          { label: "Neon Arcade: js/core.js", href: `${gh}/Neon-Arcade/blob/main/js/core.js` },
        ],
      },
      {
        name: "Progressive Web Apps",
        note: "A service worker and manifest so apps install and work offline.",
        evidence: [
          { label: "Neon Arcade: sw.js", href: `${gh}/Neon-Arcade/blob/main/sw.js` },
          { label: "Neon Arcade: manifest", href: `${gh}/Neon-Arcade/blob/main/manifest.webmanifest` },
          { label: "MyFlix: sw.js", href: `${gh}/myflix/blob/main/sw.js` },
        ],
      },
    ],
  },
  {
    title: "React & Next.js",
    skills: [
      {
        name: "React",
        note: "Components, state and effects, e.g. the admin page for this site.",
        evidence: [
          { label: "This site: app/admin/page.tsx", href: `${portfolio}/blob/main/app/admin/page.tsx` },
        ],
      },
      {
        name: "Next.js (App Router)",
        note: "Layouts, server components and routes in two deployed apps.",
        evidence: [
          { label: "This site: app/ folder", href: `${portfolio}/tree/main/app` },
          { label: "Clinic platform: app/medi-clinic", href: `${clinic}/tree/main/app/medi-clinic` },
        ],
      },
      {
        name: "SEO & page metadata",
        note: "Page titles, descriptions and search-friendly pages in Next.js.",
        evidence: [
          { label: "This site: app/layout.tsx", href: `${portfolio}/blob/main/app/layout.tsx` },
        ],
      },
      {
        name: "TypeScript",
        note: "Typed data for projects, patients and invoices.",
        evidence: [
          { label: "This site: lib/supabase.ts", href: `${portfolio}/blob/main/lib/supabase.ts` },
          { label: "This site: content/skills.ts", href: `${portfolio}/blob/main/content/skills.ts` },
        ],
      },
      {
        name: "Tailwind CSS",
        note: "Utility-first styling with my own colour theme.",
        evidence: [
          { label: "This site: app/globals.css", href: `${portfolio}/blob/main/app/globals.css` },
          { label: "Clinic platform: tailwind.config.ts", href: `${clinic}/blob/main/tailwind.config.ts` },
        ],
      },
    ],
  },
  {
    title: "Back end & data",
    skills: [
      {
        name: "SQL & PostgreSQL",
        note: "Designing tables and writing migrations for Supabase.",
        evidence: [
          { label: "This site: Supabase/schema.sql", href: `${portfolio}/blob/main/Supabase/schema.sql` },
          { label: "Clinic platform: clinic-scheduling.sql", href: `${clinic}/blob/main/supabase/clinic-scheduling.sql` },
        ],
      },
      {
        name: "Supabase Auth",
        note: "Email sign-in, protected pages and role-based access.",
        evidence: [
          { label: "This site: /admin sign-in", href: `${portfolio}/blob/main/app/admin/page.tsx` },
          { label: "Clinic platform: clinic-login", href: `${clinic}/tree/main/app/clinic-login` },
        ],
      },
      {
        name: "Row Level Security",
        note: "Owner-only writes here; per-role access in the clinic platform.",
        evidence: [
          { label: "Commit: owner-only RLS policies", href: `${portfolio}/commit/ee4144c5655002c6369c097f5a4f6e4000ee6fa4` },
          { label: "RLS test screenshot", href: `${portfolio}/blob/main/Docs/rls-test-console.png` },
          { label: "Clinic platform: RLS recursion fix", href: `${clinic}/blob/main/supabase/fix-patients-rls-recursion.sql` },
        ],
      },
      {
        name: "Server-side validation",
        note: "Checking form data with Zod before it reaches the database.",
        evidence: [
          { label: "Clinic platform: lib/actions.ts", href: `${clinic}/blob/main/app/medi-clinic/lib/actions.ts` },
        ],
      },
    ],
  },
  {
    title: "Tools & workflow",
    skills: [
      {
        name: "Software development fundamentals",
        note: "Core programming concepts, problem-solving and the software development life cycle.",
        evidence: [
          cert("certiport-software-development", "Certiport Software Development"),
        ],
      },
      {
        name: "Git & GitHub",
        note: "Small, clearly named commits for each step of a project.",
        evidence: [{ label: "This site: commit history", href: `${portfolio}/commits/main` }],
      },
      {
        name: "Vercel deployment",
        note: "Every project is deployed, with environment variables kept out of the repo.",
        evidence: [
          { label: "This site (live)", href: "https://ammara-badat-portfolio-next.vercel.app" },
          { label: "Clinic platform (live)", href: "https://nextjs-dashoard-psi.vercel.app" },
        ],
      },
      {
        name: "Technical writing",
        note: "Proposals, READMEs and setup guides for my projects.",
        evidence: [
          { label: "Clinic platform: proposal.md", href: `${clinic}/blob/main/proposal.md` },
          { label: "This site: README", href: `${portfolio}/blob/main/README.md` },
        ],
      },
    ],
  },
];
