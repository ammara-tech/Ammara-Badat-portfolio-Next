/*
  "Then and now": a before-and-after slider (components/BeforeAfter.tsx) on a project's page,
  keyed by its page address (/projects/<key>). Both pictures are real screenshots in /public.
  ✍️ To show the site as it looks today, replace the "after" screenshot with a new one.
*/
export type ThenAndNow = {
  before: { src: string; label: string };
  after: { src: string; label: string };
  caption: string;
};

export const thenAndNow: Record<string, ThenAndNow> = {
  "portfolio-v2-this-site": {
    before: { src: "/projects/personal-portfolio.png", label: "Jul 2026: my first portfolio" },
    after: { src: "/projects/portfolio-v2.png", label: "Oct 2026: rebuilt in Next.js" },
    caption:
      "The same look, rebuilt from three plain files into a Next.js and TypeScript app with a database, an admin area and automated tests. Drag the line, or use the arrow keys, to compare.",
  },
};
