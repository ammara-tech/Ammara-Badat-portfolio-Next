/*
  ✍️ MY CAPSTONE CASE STUDY — the writing in this file must be in my own words.

  Shown at /projects/nextjs-dashboard.
  Any text that starts with "TODO" shows on the page as a dashed red box
  until I replace it.

  Facts I can draw on (from my proposal.md and README in the nextjs-dashoard repo):
  - Three dashboards in one Next.js app: billing (invoices, customers, revenue),
    Family Clinic (/medi-clinic) and Medical Aid (/medical-aid)
  - Audience: the owner and front desk of a small family clinic, and its patients
  - Two key charts: new patients per month (is the practice growing?) and
    this month's no-show share (should reception send reminders?)
  - Roles: owner, front desk, doctor, patient, pharmacist, stock manager, admin,
    set through trusted Supabase app_metadata
  - Supabase Auth + Postgres Row Level Security, e.g. supabase/fix-patients-rls-recursion.sql
  - Patient portal: online booking, masked card wallet, document uploads to a private bucket
  - Extras: dark/light mode, English/Afrikaans toggle, guided demo tour, keyboard shortcuts,
    PDF invoices, hover cards on every chart
  - Not done yet (README): real payments, email/SMS, drug interaction checks,
    stock going down when medicine is dispensed
*/

export type Shot = { src: string; alt: string; caption: string };

export const caseStudy = {
  title: "Family Clinic Platform",
  // One sentence that sums up the project.
  tagline:
    "TODO: One sentence that sums it up. E.g. what it is and who it's for, in your words.",

  liveUrl: "https://nextjs-dashoard-psi.vercel.app",
  repoUrl: "https://github.com/ammara-tech/nextjs-dashoard",
  // Optional: a YouTube / Loom / Google Drive link to a short demo video. Leave "" if none.
  videoUrl: "",

  year: "2026",
  context: "ITProg26 capstone, Unicollege",

  // Who you built it for.
  audience:
    "TODO: Who is this for? (e.g. the owner and front desk of a small family clinic, and the families who are its patients)",

  // The problem — 2–4 sentences. What was going wrong or missing before?
  problem:
    "TODO: Describe the problem in 2–4 sentences. What does a small clinic struggle with, and what questions did the owner need the dashboard to answer?",

  // Your role — what YOU did. Be specific.
  role:
    "TODO: What did you do yourself? E.g. solo project: planning, database design, Supabase Auth and RLS, building the dashboards, deploying on Vercel. Mention anything you got help with.",

  // The stack. "use" says what each tool did in this project.
  stack: [
    { name: "Next.js (App Router)", use: "Pages, layouts and server-rendered dashboards" },
    { name: "TypeScript", use: "Typed data for patients, appointments and invoices" },
    { name: "Supabase Auth", use: "Sign-in for every role, with roles stored in app_metadata" },
    { name: "PostgreSQL + RLS", use: "Each role only sees the rows it is allowed to" },
    { name: "Supabase Storage", use: "Patient document uploads to a private bucket" },
    { name: "Tailwind CSS", use: "Styling, plus dark and light mode" },
    { name: "Zod", use: "Validating form data on the server" },
    { name: "Vercel", use: "Hosting, deployed from the main branch" },
  ],

  // Key features — short bullet points. Edit, remove or add.
  features: [
    "Billing dashboard: revenue, latest invoices, and invoice search and filters",
    "Clinic dashboard with new patients per month and no-show charts",
    "Separate sign-ins and dashboards for owner, front desk, doctors and pharmacy",
    "Patient portal with online booking and document uploads",
    "Medical aid care plans with sign-up and demo payments",
    "Dark/light mode, English/Afrikaans toggle and a guided demo tour",
  ],

  // Screenshots: save the images in public/case-study/ with these exact names.
  screenshots: [
    {
      src: "/case-study/landing.png",
      alt: "Landing page with cards for the three dashboards",
      caption: "The landing page links the billing, clinic and medical aid dashboards.",
    },
    {
      src: "/case-study/clinic-dashboard.png",
      alt: "Family Clinic owner dashboard with charts",
      caption: "The owner's dashboard: new patients per month and this month's no-shows.",
    },
    {
      src: "/case-study/patient-portal.png",
      alt: "Patient portal booking screen",
      caption: "Patients can book appointments and upload documents.",
    },
    {
      src: "/case-study/billing-dashboard.png",
      alt: "Billing dashboard with revenue chart and invoices",
      caption: "The original billing dashboard with revenue and latest invoices.",
    },
  ] satisfies Shot[],

  // The hardest part and how you solved it. 2–4 sentences.
  challenges:
    "TODO: What was the hardest part and how did you fix it? (Ideas: the RLS policy that caused infinite recursion on the patients table, keeping each role's data separate, or the 'JWT issued in the future' clock error.)",

  // What you learned. 1–3 sentences.
  learned: "TODO: What did this project teach you? 1–3 sentences.",

  // What you'd do next. Bullet points.
  next: [
    "TODO: What would you build next? (Ideas from your README: real payment processing, email/SMS reminders, drug interaction checks, stock that goes down when medicine is dispensed.)",
  ],
};
