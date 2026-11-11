import { beforeAll, describe, expect, it } from "vitest";
import { PDFDocument, PDFName, StandardFonts, type PDFDict, type PDFArray, type PDFString } from "pdf-lib";
import { buildCvPdf, buildFittedCv, fitText, pdfSafe, wrap } from "@/lib/cv-pdf";
import { cvProjects, firstSentence, moreProjects, sameAddress, sentences } from "@/lib/cv-projects";
import type { Project } from "@/lib/supabase";
import { cv } from "@/content/cv";
import { about } from "@/content/about";
import { siteUrl } from "@/lib/site";

/* The CV PDF is built from content/cv.ts (lib/cv-pdf.ts), so it can't fall behind the /cv page */

/** Every clickable link in a PDF */
function linksIn(pdf: PDFDocument) {
  return pdf.getPages().flatMap((page) => {
    const annots = page.node.lookup(PDFName.of("Annots")) as PDFArray | undefined;
    return (annots?.asArray() ?? []).map((ref) => {
      const action = (pdf.context.lookup(ref) as PDFDict).lookup(PDFName.of("A")) as PDFDict;
      return (action.lookup(PDFName.of("URI")) as PDFString).decodeText();
    });
  });
}

describe("the CV PDF", () => {
  let bytes: Uint8Array;
  let pdf: PDFDocument;
  let links: string[] = [];

  beforeAll(async () => {
    bytes = await buildCvPdf();
    pdf = await PDFDocument.load(bytes);
    links = linksIn(pdf);
  });

  it("is a real PDF that fits on one A4 page", () => {
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(pdf.getPageCount()).toBe(1);
    const { width, height } = pdf.getPage(0).getSize();
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
  });

  it("has my name as its title and author, so it looks right in downloads and job sites", () => {
    expect(pdf.getTitle()).toContain(about.name);
    expect(pdf.getAuthor()).toBe(about.name);
  });

  it("links to every project on my CV page, with full addresses", () => {
    for (const p of cv.projects) {
      for (const l of p.links) {
        expect(links).toContain(l.href.startsWith("/") ? `${siteUrl}${l.href}` : l.href);
      }
    }
  });

  it("links to my email, phone, portfolio and GitHub", () => {
    expect(links).toContain(`mailto:${about.contact.email}`);
    expect(links).toContain(`tel:${about.contact.phone.replace(/\s/g, "")}`);
    expect(links).toContain(siteUrl);
    expect(links).toContain(about.contact.github);
  });
});

describe("CV PDF helpers", () => {
  it("swaps characters Helvetica can't draw for close matches", () => {
    expect(pdfSafe("it’s “quoted” — here → there ✍️")).toBe("it's \"quoted\" – here -> there ");
    expect(pdfSafe("2026 – 2031 · Krugersdorp • é")).toBe("2026 – 2031 · Krugersdorp • é");
  });

  it("wraps long text so no line is wider than the space", async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    const lines = wrap(cv.profile, font, 9.5, 250);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) expect(font.widthOfTextAtSize(line, 9.5)).toBeLessThanOrEqual(250);
    expect(lines.join(" ")).toBe(pdfSafe(cv.profile).replace(/\s+/g, " ").trim());
  });
});

describe("More projects on the CV (from /admin)", () => {
  const project = (title: string, live_url: string | null, repo_url: string | null, extra: Partial<Project> = {}): Project => ({
    id: title, title, summary: `${title} does a thing. And more.`, live_url, repo_url, image_url: null,
    video_url: null, case_study_url: null, tags: [], sort_order: 0, published: true, created_at: "", ...extra,
  });

  it("adds every published project that isn't already on my CV", () => {
    const all = [
      project("Next.js Dashboard", "https://nextjs-dashoard-psi.vercel.app/", null), // the clinic, already on my CV
      project("PaperTrail", "https://papertrail.example", "https://github.com/x/papertrail"),
      project("Secret draft", "https://draft.example", null, { published: false }),
      project("ShiftBoard", null, null),
    ];
    const extra = moreProjects(cv.projects, all);
    expect(extra.map((e) => e.title)).toEqual(["PaperTrail", "ShiftBoard"]);
    expect(extra[0].links.map((l) => l.label)).toEqual(["Live", "Code"]);
    expect(extra[0].summary).toBe("PaperTrail does a thing");
    expect(extra[1].links).toEqual([{ label: "Details", href: "/projects/shiftboard" }]); // no links yet: its page on my site
  });

  it("treats addresses as the same with or without https, www or a slash at the end", () => {
    expect(sameAddress("https://www.Example.com/x/")).toBe(sameAddress("example.com/x"));
  });

  it("keeps just the first sentence of a summary", () => {
    expect(firstSentence("Quotes and invoices. Works offline.")).toBe("Quotes and invoices");
    expect(firstSentence("No full stop at all")).toBe("No full stop at all");
    expect(firstSentence("Version 2.0 is out. Yay.")).toBe("Version 2.0 is out");
  });

  it("cuts a summary at a whole word, with … at the end, when it doesn't fit", async () => {
    const font = await (await PDFDocument.create()).embedFont(StandardFonts.Helvetica);
    const long = "– Quotes and invoices for small South African businesses, with 15% VAT worked out";
    const cut = fitText(long, font, 9.2, 150);
    expect(cut.endsWith("\u2026")).toBe(true);
    expect(font.widthOfTextAtSize(cut, 9.2)).toBeLessThanOrEqual(150);
    expect(fitText("– short", font, 9.2, 150)).toBe("– short");
    expect(fitText(long, font, 9.2, 5)).toBe(""); // no room at all: nothing, not a lonely "…"
  });

  it("still fits on one page with five extra projects", async () => {
    const five = ["PaperTrail", "TickList", "Rememba", "Personal Portfolio", "Fish-bones"].map((t) => ({
           title: t,
      summary: "A one-line summary of what this project does for the people who use it",
      tags: ["Next.js", "Firebase"],
      links: [{ label: "Live", href: "https://example.com" }, { label: "Code", href: "https://github.com/x/y" }],
    }));
    const pdf = await PDFDocument.load(await buildCvPdf(five));
    expect(pdf.getPageCount()).toBe(1);
  });
});

describe("the CV keeps itself up to date", () => {
  const made = (title: string, created_at: string, tags: string[] = ["Next.js", "Firebase"]): Project => ({
    id: title, title, summary: `${title} helps people with something useful. It works offline on any phone. Next.js + Firebase.`,
    live_url: `https://${title.toLowerCase()}.example`, repo_url: `https://github.com/x/${title.toLowerCase()}`, image_url: null,
    video_url: null, case_study_url: null, tags, sort_order: 0, published: true, created_at,
  });
  // Roughly what's published in /admin now
  const all = [
    made("PaperTrail", "2026-10-20"), made("TickList", "2026-10-22"), made("Rememba", "2026-10-24"), made("ShiftBoard", "2026-11-05"),
    made("HireTrack", "2026-11-08"), made("StokvelBook", "2026-11-10T20:00"), made("ColourCheck", "2026-11-10T20:05"), made("CVcraft", "2026-11-10T20:10"),
    made("Fish-bones", "2026-03-01", ["JavaScript", "Canvas"]),
  ];

  it("shows my two main projects first, then my three newest in full", () => {
    const { projects } = cvProjects(cv.projects, all);
    expect(projects.map((p) => p.title)).toEqual([cv.projects[0].title, cv.projects[1].title, "CVcraft", "ColourCheck", "StokvelBook"]);
    const newest = projects[2];
    expect(newest.stack).toBe("Next.js, Firebase");
    expect(newest.points).toEqual(["CVcraft helps people with something useful", "It works offline on any phone"]); // "Next.js + Firebase" is too short to be a point
    expect(newest.links.map((l) => l.label)).toEqual(["Live", "Code", "Details"]);
  });

  it("lists everything else under More projects with tags, newest first, then my older main projects", () => {
    const { extra } = cvProjects(cv.projects, all);
    expect(extra.map((e) => e.title)).toEqual(["HireTrack", "ShiftBoard", "Rememba", "TickList", "PaperTrail", "Fish-bones", ...cv.projects.slice(2).map((p) => p.title)]);
    expect(extra[0].tags).toEqual(["Next.js", "Firebase"]);
    expect(extra[0].links.map((l) => l.label)).toEqual(["Live", "Code"]);
    const neon = extra.find((e) => e.title === "Neon Arcade")!;
    expect(neon.tags).toContain("Canvas");
  });

  it("puts a brand-new project at the top part of my CV by itself", () => {
    const { projects } = cvProjects(cv.projects, [...all, made("QueueUp", "2026-11-11")]);
    expect(projects[2].title).toBe("QueueUp");
  });

  it("splits a summary into sentences for the points", () => {
    expect(sentences("Quotes and invoices for small shops. Works offline with no signal at all. Yay.")).toEqual(["Quotes and invoices for small shops", "Works offline with no signal at all"]);
  });

  it("still fits on one page with today's projects, and with many more", async () => {
    const layout = cvProjects(cv.projects, all);
    expect((await PDFDocument.load(await buildFittedCv(layout.extra, layout.projects))).getPageCount()).toBe(1);
    const many = [...all, ...["QueueUp", "BookMe", "RSVPme", "PowerPlan", "RandWise", "StudyBuddy"].map((t, i) => made(t, `2026-11-1${i}`))];
    const big = cvProjects(cv.projects, many);
    const pdf = await PDFDocument.load(await buildFittedCv(big.extra, big.projects));
    expect(pdf.getPageCount()).toBe(1);
  });
});

