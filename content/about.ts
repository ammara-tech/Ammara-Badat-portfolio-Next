/*
  ✍️ MY WORDS — edit everything in this file so it sounds like me.

  Used by the Home, About and Contact pages.
  Any text that starts with "TODO" shows on the site as a dashed red box
  until I replace it, so I can't miss anything.

  The About page should take about 30 seconds to read:
  who I am, what I build, and the role I'm looking for.
*/

export const about = {
  name: "Ammara Badat",
  role: "Junior Full Stack Developer",
  location: "South Africa",
  status: "Available for opportunities",

  // Shown on the Home page under the main heading (1–2 sentences).
  // This is the intro from my first portfolio.
  intro:
    "I design and build complete web applications — from interface to database — with a focus on clean logic, readable code, and interfaces that work the way people expect them to.",

  // The 30-second About. Three short paragraphs works well.
  // Paragraphs 1 and 2 are from my first portfolio; paragraph 3 is based on the role in my README.
  // (Python was taken out of paragraph 1 because there's no public link to back it up yet.)
  paragraphs: [
    "I'm a full stack developer who enjoys the whole picture of building software — shaping an interface in HTML and CSS, wiring it up with JavaScript and React, and giving it a backbone with SQL and Supabase underneath.",
    "I like projects that force me to connect the dots between layers — a form that needs validating, a database that needs querying, an interface that needs to stay usable no matter what's happening underneath.",
    "I'm looking for a junior full stack developer role with a South African software team or agency, building complete web applications with React and Next.js on the front end and SQL and Supabase underneath. My capstone, a secure clinic platform, shows the kind of work I want to keep doing.",
  ],

  // Short bullet points for the "What I'm looking for" box.
  lookingFor: [
    "Junior full stack or front-end developer roles",
    "React / Next.js on the front end, SQL and Supabase on the back end",
    "Gauteng, hybrid or on-site",
    "Available to start immediately",
  ],

  // Numbers for the stats row on the About page.
  stats: [
    { value: "10+", label: "Core technologies learned" },
    { value: "7", label: "Projects built & shipped" },
    { value: "2026", label: "IT Programming student" },
  ],

  education: {
    year: "2026",
    title: "IT Programming (ITProg26)",
    school: "Unicollege, Krugersdorp",
    // From my first portfolio.
    description:
      "A full-time IT programming course covering the foundations of software development, from writing structured code to thinking through problems the way a developer does. The course combined web development, programming logic, and hands-on systems work into one practical curriculum.",
  },

  contact: {
    email: "badat.ammarax@gmail.com",
    phone: "+27 60 621 3987",
    github: "https://github.com/ammara-tech",
    // Leave empty ("") until you have a LinkedIn profile.
    linkedin: "https://www.linkedin.com/in/ammara-badat",
    // My CV, downloadable from the navbar, Home, About and Contact pages (file in public/cv/).
    cv: "/cv/Ammara-Badat-CV.pdf",
    // "Save my contact" card download (app/ammara-badat.vcf/route.ts)
    vcard: "/ammara-badat.vcf",
  },

  // My latest Lighthouse scores (mobile, Home page), shown in the footer.
  // Update these when I run Lighthouse again. The proof is in Docs/lighthouse-home.png.
  lighthouse: {
    performance: 96,
    accessibility: 100,
    bestPractices: 100,
    seo: 100,
    proof: "https://github.com/ammara-tech/Ammara-Badat-portfolio-Next/blob/main/Docs/lighthouse-home.png",
  },
};
