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
    name: "QueueUp",
    summary:
      "A walk-in queue for barbers, clinics and small shops: customers join by scanning a QR code and see their place in line live on their phone, instead of waiting inside.",
    tags: ["Next.js", "TypeScript", "Firebase"],
    stage: "next",
  },
  {
    name: "BookMe",
    summary:
      "An online booking page for salons, tutors and mechanics: customers pick a free time slot, and the owner sees the day's bookings and can block time off.",
    tags: ["Next.js", "TypeScript", "Firebase"],
    stage: "next",
  },
  {
    name: "RSVPme",
    summary:
      "Event invites with RSVPs, and a QR code check-in at the door using the phone's camera, for church events, braais and student societies.",
    tags: ["Next.js", "TypeScript", "Firebase"],
    stage: "next",
  },
];
