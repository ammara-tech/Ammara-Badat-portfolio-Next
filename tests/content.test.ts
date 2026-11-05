import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { skillGroups, type Skill } from "@/content/skills";
import { certificationGroups } from "@/content/certifications";
import { headingIds, lastChanged, noteNeighbours, notes } from "@/content/notes";
import { showBackToTop } from "@/lib/back-to-top";
import { historyButtons } from "@/lib/nav-arrows";
import { caseStudy } from "@/content/case-study";
import { currentlyBuilding } from "@/content/currently-building";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
import { projectStat } from "@/lib/stats";
import { filterButtons, relatedNotes, tagCounts, withTag } from "@/lib/note-tags";
import { about } from "@/content/about";
import { shareLinks, prefersNativeShare } from "@/lib/share";
import { scoreWords } from "@/components/LighthouseBadge";
import { lastChangeUrl, lastUpdatedLabel } from "@/lib/last-updated";
import { splitCount } from "@/lib/count-up";
import { GET as vcard } from "@/app/ammara-badat.vcf/route";

const publicFile = (path: string) => existsSync(join(process.cwd(), "public", path));

describe("skills: every skill is backed by evidence", () => {
  const skills = skillGroups.flatMap((g) => g.skills);

  it.each(skills.map((s): [string, Skill] => [s.name, s]))("%s has at least one working-looking link", (_name, skill) => {
    expect(skill.evidence.length).toBeGreaterThan(0);
    for (const ev of skill.evidence) expect(ev.href).toMatch(/^(https:\/\/|\/)/);
  });
});

describe("files the site links to really exist", () => {
  it("every certificate image is in public/", () => {
    for (const cert of certificationGroups.flatMap((g) => g.certificates)) expect(publicFile(cert.image)).toBe(true);
  });

  it("every case study screenshot is in public/", () => {
    for (const shot of caseStudy.screenshots) expect(publicFile(shot.src)).toBe(true);
  });

  it("the CV PDF is built by a route at the address the Download buttons use, not a file in public/", () => {
    expect(about.contact.cv).toBe("/cv/Ammara-Badat-CV.pdf");
    expect(existsSync(join(process.cwd(), "app/cv/Ammara-Badat-CV.pdf/route.ts"))).toBe(true);
    // A file in public/ at the same address would clash with the route
    expect(publicFile(about.contact.cv)).toBe(false);
  });
});

describe("dev notes", () => {
  it("every note has its own address", () => {
    const slugs = notes.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every note has a real date and a description short enough for Google", () => {
    for (const n of notes) {
      expect(Number.isNaN(Date.parse(n.date))).toBe(false);
      expect(n.description.length).toBeLessThanOrEqual(160);
    }
  });
});

describe("dev note navigation", () => {
  it("gives every sub-heading in every note its own address", () => {
    for (const n of notes) {
      const ids = headingIds(n.body).filter((id): id is string => id !== null);
      expect(ids.length).toBe(n.body.filter((b) => b.type === "h2").length);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("numbers two headings with the same words", () => {
    const ids = headingIds([
      { type: "h2", text: "What I changed" },
      { type: "p", text: "..." },
      { type: "h2", text: "What I changed" },
    ]);
    expect(ids).toEqual(["what-i-changed", null, "what-i-changed-2"]);
  });

  it("links each note to the older and newer note, with nothing past either end", () => {
    const middle = noteNeighbours(notes[1].slug);
    expect(middle.newer?.slug).toBe(notes[0].slug);
    expect(middle.older?.slug).toBe(notes[2].slug);
    expect(noteNeighbours(notes[0].slug).newer).toBe(null);
    expect(noteNeighbours(notes[notes.length - 1].slug).older).toBe(null);
  });
});

describe("updated dates on dev notes", () => {
  it("are real dates, and never before the note was published", () => {
    for (const n of notes.filter((note) => note.updated)) {
      expect(Number.isNaN(Date.parse(n.updated!))).toBe(false);
      expect(n.updated! > n.date).toBe(true);
    }
  });

  it("use the updated date as the last change, or the published date if there isn't one", () => {
    expect(lastChanged({ ...notes[0], date: "2026-10-21", updated: "2026-10-25" })).toBe("2026-10-25");
    expect(lastChanged({ ...notes[0], date: "2026-10-21", updated: undefined })).toBe("2026-10-21");
  });
});

describe("back-to-top button", () => {
  it("stays hidden near the top and on short pages", () => {
    expect(showBackToTop(0, 800)).toBe(false);
    expect(showBackToTop(1000, 800)).toBe(false);
  });

  it("appears after scrolling more than one and a half screens", () => {
    expect(showBackToTop(1300, 800)).toBe(true);
  });
});

describe("back, forward and refresh buttons", () => {
  it("use what the browser says when it supports the Navigation API", () => {
    expect(historyButtons({ canGoBack: true, canGoForward: false }, 5)).toEqual({ canBack: true, canForward: false });
  });

  it("allow Back only after visiting more than one page in other browsers", () => {
    expect(historyButtons(undefined, 1)).toEqual({ canBack: false, canForward: true });
    expect(historyButtons(null, 3)).toEqual({ canBack: true, canForward: true });
  });
});

describe("project pages can return a real 404", () => {
  // A loading.tsx above a page makes Next.js start sending the page (with status 200)
  // before the page can call notFound(). The Projects loading screen lives in the
  // (list) route group so it only covers /projects, not /projects/[slug].
  const appFile = (path: string) => existsSync(join(process.cwd(), "app", path));

  it("has no loading screen above the project pages", () => {
    expect(appFile("loading.tsx")).toBe(false);
    expect(appFile("projects/loading.tsx")).toBe(false);
    expect(appFile("projects/[slug]/loading.tsx")).toBe(false);
  });

  it("keeps the loading screen for the Projects list", () => {
    expect(appFile("projects/(list)/page.tsx")).toBe(true);
    expect(appFile("projects/(list)/loading.tsx")).toBe(true);
  });
});

describe("currently building", () => {
  it("every project in progress has a name, a short summary and tags", () => {
    for (const p of currentlyBuilding) {
      expect(p.name.trim().length).toBeGreaterThan(0);
      expect(p.summary.length).toBeGreaterThan(20);
      expect(p.summary.length).toBeLessThanOrEqual(200);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });

  it("says whether each one is in progress or up next", () => {
    for (const p of currentlyBuilding) expect(["building", "next"]).toContain(p.stage);
  });

  it("doesn't list the same project twice", () => {
    const names = currentlyBuilding.map((p) => p.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("SEO helpers", () => {
  it("gives every page a canonical address and matching share tags", () => {
    const meta = pageMetadata({ title: "Skills — Ammara Badat", description: "My skills.", path: "/skills" });
    expect(meta.alternates?.canonical).toBe("/skills");
    expect(meta.openGraph).toMatchObject({ title: "Skills — Ammara Badat", url: "/skills" });
  });

  it("numbers breadcrumbs from Home", () => {
    const list = breadcrumbs([{ name: "Projects", path: "/projects" }]);
    expect(list.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(list.itemListElement[0].name).toBe("Home");
  });
});

describe("Save my contact card", () => {
  it("is a valid vCard with my name and links", async () => {
    const res = vcard();
    expect(res.headers.get("content-type")).toContain("text/vcard");
    const text = await res.text();
    expect(text.startsWith("BEGIN:VCARD")).toBe(true);
    expect(text).toContain("FN:Ammara Badat");
    expect(text.trim().endsWith("END:VCARD")).toBe(true);
  });
});

describe("the project count on the About page", () => {
  it("shows the real number of published projects", () => {
    expect(projectStat(8)).toEqual({ value: "8", label: "Projects built & shipped" });
    expect(projectStat(9)?.value).toBe("9");
  });

  it("leaves the card out rather than showing a wrong number, and isn't typed in by hand", () => {
    expect(projectStat(null)).toBe(null);
    expect(projectStat(0)).toBe(null);
    expect(about.stats.some((s) => /project/i.test(s.label))).toBe(false);
  });
});

describe("the topic filter on the Dev notes page", () => {
  const sample = [{ tags: ["Supabase", "Security"] }, { tags: ["Supabase"] }, { tags: ["Firebase", "Security"] }];

  it("counts each topic, most used first", () => {
    expect(tagCounts(sample)).toEqual([
      ["Security", 2],
      ["Supabase", 2],
      ["Firebase", 1],
    ]);
  });

  it("shows topics used by two or more notes, plus the one that's chosen", () => {
    const counts = tagCounts(sample);
    expect(filterButtons(counts, null).map(([t]) => t)).toEqual(["Security", "Supabase"]);
    expect(filterButtons(counts, "Firebase").map(([t]) => t)).toEqual(["Security", "Supabase", "Firebase"]);
  });

  it("filters the notes, and every real note's topic count adds up", () => {
    expect(withTag(sample, "Security")).toHaveLength(2);
    expect(withTag(sample, null)).toHaveLength(3);
    for (const [tag, n] of tagCounts(notes)) expect(withTag(notes, tag)).toHaveLength(n);
  });
});

describe("related notes at the end of a note", () => {
  const all = [
    { slug: "a", date: "2026-10-01", tags: ["Supabase", "Security", "RLS"] },
    { slug: "b", date: "2026-10-02", tags: ["Supabase", "Security"] },
    { slug: "c", date: "2026-10-03", tags: ["Supabase"] },
    { slug: "d", date: "2026-10-04", tags: ["Security"] },
    { slug: "e", date: "2026-10-05", tags: ["CSS"] },
  ];

  it("puts the notes sharing the most topics first, then the note's main (first) topic, then the newest", () => {
    expect(relatedNotes(all, "a").map((n) => n.slug)).toEqual(["b", "c", "d"]);
    expect(relatedNotes(all, "a")[0].shared).toEqual(["Supabase", "Security"]);
  });

  it("never offers the note itself, a note with no shared topic, or one already linked as Older/Newer", () => {
    expect(relatedNotes(all, "e")).toEqual([]);
    expect(relatedNotes(all, "a", ["b"]).map((n) => n.slug)).toEqual(["c", "d"]);
  });

  it("works for every real note", () => {
    for (const n of notes) {
      const related = relatedNotes(notes, n.slug);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.some((r) => r.slug === n.slug)).toBe(false);
    }
  });
});

describe("the Share button", () => {
  const url = "https://example.com/notes/my-note?x=1&y=2";
  const links = shareLinks(url, "My note: RLS & tests");

  it("offers LinkedIn, WhatsApp and email, with the page filled in", () => {
    expect(links.map((l) => l.name)).toEqual(["LinkedIn", "WhatsApp", "Email"]);
    expect(links[0].href).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    expect(decodeURIComponent(links[1].href.split("text=")[1])).toBe(`My note: RLS & tests ${url}`);
    expect(links[2].href.startsWith("mailto:?subject=My%20note%3A%20RLS%20%26%20tests&body=")).toBe(true);
  });

  it("encodes the address, so & and ? in it can't break the share link", () => {
    for (const l of links) expect(l.href).not.toContain("&y=2");
  });

  it("opens LinkedIn and WhatsApp in a new tab, but not the email", () => {
    expect(links.map((l) => l.newTab)).toEqual([true, true, false]);
  });

  it("uses the phone's share sheet only on touch screens that support it", () => {
    const share = () => Promise.resolve();
    expect(prefersNativeShare({ share }, true)).toBe(true);
    expect(prefersNativeShare({ share }, false)).toBe(false); // a laptop: show the links instead
    expect(prefersNativeShare({}, true)).toBe(false); // an older phone browser
    expect(prefersNativeShare(undefined, true)).toBe(false); // while the page is built on the server
  });
});

describe("the Lighthouse badge in the footer", () => {
  const { phone, laptop } = about.lighthouse;

  it("has all four scores for a phone and a laptop, each between 0 and 100", () => {
    for (const s of [phone, laptop]) {
      for (const n of [s.performance, s.accessibility, s.bestPractices, s.seo]) {
        expect(Number.isInteger(n) && n >= 0 && n <= 100).toBe(true);
      }
    }
  });

  it("reads the scores out in words for screen readers", () => {
    expect(scoreWords({ performance: 96, accessibility: 100, bestPractices: 100, seo: 100 })).toBe(
      "Performance 96, Accessibility 100, Best practices 100, SEO 100",
    );
  });
});

describe("Last updated in the footer", () => {
  it("shows the deploy date in South African time", () => {
    expect(lastUpdatedLabel("2026-11-04T08:45:00Z")).toMatch(/^4 Nov 2026$/);
    // 23:30 in London on 4 Nov is already 5 Nov in Johannesburg
    expect(lastUpdatedLabel("2026-11-04T23:30:00Z")).toMatch(/^5 Nov 2026$/);
  });

  it("shows nothing if the build time is missing or broken, instead of a wrong date", () => {
    expect(lastUpdatedLabel(undefined)).toBeNull();
    expect(lastUpdatedLabel("not a date")).toBeNull();
  });

  it("links to the exact change on GitHub, or the list of changes when working locally", () => {
    expect(lastChangeUrl("d09a4f9")).toBe("https://github.com/ammara-tech/Ammara-Badat-portfolio-Next/commit/d09a4f9");
    expect(lastChangeUrl(undefined)).toBe("https://github.com/ammara-tech/Ammara-Badat-portfolio-Next/commits/main");
    expect(lastChangeUrl("<script>")).toBe("https://github.com/ammara-tech/Ammara-Badat-portfolio-Next/commits/main");
  });
});

describe("the counting numbers on the About page", () => {
  it("counts up to the number and keeps what comes after it", () => {
    expect(splitCount("10+")).toEqual({ target: 10, suffix: "+" });
    expect(splitCount("7")).toEqual({ target: 7, suffix: "" });
  });

  it("shows a year or words as they are, without counting", () => {
    expect(splitCount("2026")).toBeNull(); // used to count up to 202 and add a "6"
    expect(splitCount("Gauteng")).toBeNull();
  });
});
