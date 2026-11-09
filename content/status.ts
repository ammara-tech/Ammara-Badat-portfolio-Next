/*
  ✍️ Lighthouse scores on the status page (/status), from PageSpeed Insights.
  Keyed by the project's page address (/projects/<key>). Only scores I've measured and
  have proof of go here; a site without scores shows "Not measured yet".
  Update them when I run PageSpeed Insights again, and change "checked".
  The portfolio's own scores come from content/about.ts, like the footer badge.
*/

export type Scores = { performance: number; accessibility: number; bestPractices: number; seo: number };
export type SiteScores = { phone: Scores; laptop: Scores; checked: string };

export const lighthouseScores: Record<string, SiteScores> = {
  shiftboard: {
    phone: { performance: 99, accessibility: 100, bestPractices: 100, seo: 100 },
    laptop: { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
    checked: "2026-11-07",
  },
  hiretrack: {
    phone: { performance: 98, accessibility: 100, bestPractices: 100, seo: 100 },
    laptop: { performance: 100, accessibility: 100, bestPractices: 100, seo: 100 },
    checked: "2026-11-08",
  },
};
