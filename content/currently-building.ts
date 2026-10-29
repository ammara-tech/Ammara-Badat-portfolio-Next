/*
  "Currently building" on the Projects page (components/CurrentlyBuilding.tsx).
  Projects I'm working on now, before they have a live link and a card.
  When one goes live, I add its card in /admin and delete it from this list.
  When the list is empty, the section disappears by itself.
  Checked in tests/content.test.ts.
*/

export type BuildingProject = {
  name: string;
  summary: string; // one or two sentences: what it does and who it's for
  tags: string[];
};

export const currentlyBuilding: BuildingProject[] = [
  {
    name: "F1 Prediction League",
    summary:
      "Private leagues with invite links: friends predict the podium before each race, and points are added up automatically once the results are in.",
    tags: ["Next.js", "TypeScript", "Firebase", "Vercel Cron"],
  },
  {
    name: "Booking + Client Portal",
    summary:
      "Booking pages for South African small businesses: clients book a time and pay a deposit (in test mode), with dashboards for the business and its clients.",
    tags: ["Next.js", "TypeScript", "Firebase", "Online payments"],
  },
];
