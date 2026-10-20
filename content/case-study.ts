/*
  MY CAPSTONE CASE STUDY — shown at /projects/nextjs-dashboard.

  Written from my own project docs in the nextjs-dashoard repo
  (README.md, presentations/DEMO.md and presentations/walkthrough-speech.md),
  with AI help to shorten and arrange it. ✍️ Read it through and change
  anything that doesn't sound like me.

  Any text that starts with "TODO" shows on the page as a dashed red box.
*/

export type Shot = { src: string; alt: string; caption: string };

export const caseStudy = {
  title: "Family Clinic Platform",
  tagline:
    "A secure clinic system for family practices, where reception, doctors, pharmacy and patients each see only what their role allows.",

  liveUrl: "https://nextjs-dashoard-psi.vercel.app",
  repoUrl: "https://github.com/ammara-tech/nextjs-dashoard",
  // Optional: a YouTube / Loom / Google Drive link to a short demo video. Leave "" if none.
  videoUrl: "",

  year: "2026",
  context: "ITProg26 capstone, Unicollege",

  audience:
    "The owner, front desk, doctors and pharmacy of a small family practice, and the families who are its patients.",

  problem:
    "A family practice runs on many moving parts: bookings, patient records, payments, medical aid and invoices. Often these live in separate tools and shared spreadsheets, which is slow for families and risky for health data, because a receptionist, a doctor and a pharmacist should not all see the same things. The owner also needed quick answers to two questions: is the practice growing, and how many appointments end up as no-shows?",

  role:
    "I built it on my own: planning and writing the proposals, designing the Supabase database and its row-level security policies, building all three dashboards in Next.js, writing the demo and presentation, and deploying it on Vercel. The billing dashboard started from the official Next.js tutorial, and I built the Family Clinic and Medical Aid dashboards on top of it.",

  stack: [
    { name: "Next.js (App Router)", use: "Server components fetch data next to the page; server actions handle writes" },
    { name: "TypeScript", use: "Typed data for patients, appointments, claims and invoices" },
    { name: "Supabase Auth", use: "One login for every role, with roles stored in trusted settings users can't edit" },
    { name: "PostgreSQL + RLS", use: "The database decides which rows each role can see or change" },
    { name: "Supabase Storage", use: "Patient documents in a private store, opened only through short-lived links" },
    { name: "Supabase Realtime", use: "Pages refresh by themselves and the bell shows new notifications" },
    { name: "Tailwind CSS", use: "Consistent styling, with dark and light mode" },
    { name: "Vercel", use: "Automatic deploys from main; a failed build leaves the last version live" },
  ],

  features: [
    "Four doors into the clinic: patients, administration, doctors and pharmacy, each with its own sign-in and view",
    "Owner dashboard answering \"Is the practice growing?\" and \"What share of appointments are no-shows?\"",
    "Patient portal: book with a provider in an open slot, upload private documents, save cards and edit my profile",
    "Doctor dashboard with today's schedule, weekly Monday-to-Friday shifts and a week calendar",
    "Care Plans and medical aid claims that move through Submitted, In review, Approved or Rejected, and Paid",
    "Automatic PDF invoices for every payment and every appointment with recorded services",
    "Dark/light mode, English/Afrikaans, keyboard shortcuts, live notifications and a ten-step guided tour",
  ],

  screenshots: [
    {
      src: "/case-study/landing.png",
      alt: "Landing page with cards for the Family Clinic, Next.js and Medical Aid dashboards",
      caption: "One platform, three dashboards, each with its own card and colour.",
    },
    {
      src: "/case-study/clinic-dashboard.png",
      alt: "Family Clinic admin overview with new patients bar chart and no-show donut chart",
      caption: "The admin overview: new patients per month and this month's no-show share.",
    },
    {
      src: "/case-study/patient-portal.png",
      alt: "Patient portal with the Book an appointment form",
      caption: "Patients book with a provider in an open slot from their own portal.",
    },
    {
      src: "/case-study/billing-dashboard.png",
      alt: "Next.js billing dashboard with revenue chart and latest invoices",
      caption: "The original Next.js invoice dashboard, still working alongside the clinic.",
    },
  ] satisfies Shot[],

  challenges:
    "The hardest part was access control. Hiding things on the screen isn't enough, so I moved the rules into the database with row-level security and stored roles in trusted Auth settings. My first patients policy checked the patients table from inside itself and Supabase stopped with \"infinite recursion detected in policy\", so I rewrote it in a separate fix script. I also hit \"JWT issued at future\" errors caused by my computer's clock, and made each dashboard panel load on its own so one failing query shows a warning instead of crashing the page.",

  learned:
    "Security belongs in the database, not just the interface: even if someone tampers with the page, the database still refuses to show another patient's records. I also learned to be upfront about limits, like labelling demo payments and not claiming compliance I haven't earned.",

  next: [
    "Connect a real payment gateway with verified webhooks",
    "Add refunds for plan members, plus e-mail and SMS alerts",
    "Finish translating the remaining pages into Afrikaans",
    "Complete a legal and privacy (POPIA) review before any real patient data",
  ],
};
