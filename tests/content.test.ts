import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { skillGroups, type Skill } from "@/content/skills";
import { certificationGroups } from "@/content/certifications";
import { headingIds, lastChanged, noteNeighbours, notes } from "@/content/notes";
import { showBackToTop } from "@/lib/back-to-top";
import { historyButtons } from "@/lib/nav-arrows";
import { caseStudy } from "@/content/case-study";
import { breadcrumbs, pageMetadata } from "@/lib/seo";
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

  it("the CV PDF is in public/", () => {
    expect(publicFile("/cv/Ammara-Badat-CV.pdf")).toBe(true);
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
