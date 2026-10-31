/*
  "Currently building" on the Projects page (components/CurrentlyBuilding.tsx).
  Projects I'm working on now, and the ones I'm building next, before they have a live link and a card.
  "building" shows as In progress; "next" shows as Up next, so nobody thinks I've started what I haven't.
  When one goes live, I add its card in /admin and delete it from this list.
  When the list is empty, the section disappears by itself.
  Checked in tests/content.test.ts.
*/

export type BuildingProject = {
  name: string;
  summary: string; // one or two sentences: what it does and who it's for
  tags: string[];
  stage: "building" | "next";
};

export const currentlyBuilding: BuildingProject[] = [
  {
    name: "Recall",
    summary:
      "Flashcards that work out when you should see each card again (spaced repetition), with study streaks and progress charts. Installable, and it works offline.",
    tags: ["Next.js", "TypeScript", "Firebase", "PWA"],
    stage: "building",
  },
  {
    name: "ShiftBoard",
    summary:
      "Staff rotas for small businesses: a drag-and-drop weekly rota, shift swaps that a manager approves, and hours totals for payroll. Free for small teams.",
    tags: ["Next.js", "TypeScript", "Firebase"],
    stage: "next",
  },
  {
    name: "HireTrack",
    summary:
      "A job application tracker: a drag-and-drop board from Applied to Offer, interview dates and follow-up reminders. I'm building it for my own job hunt first.",
    tags: ["Next.js", "TypeScript", "Firebase"],
    stage: "next",
  },
];
