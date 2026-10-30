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
    name: "TickList",
    summary:
      "A shared shopping and chores list for families and flatmates: tick off the milk and it disappears on everyone's phone straight away. Invite people with a link, and it works offline in the shop.",
    tags: ["Next.js", "TypeScript", "Firebase", "Realtime", "PWA"],
  },
  {
    name: "Recall",
    summary:
      "Flashcards that work out when you should see each card again (spaced repetition), with study streaks and progress charts. Installable, and it works offline.",
    tags: ["Next.js", "TypeScript", "Firebase", "PWA"],
  },
];
