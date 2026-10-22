import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { skillGroups, type Skill } from "@/content/skills";
import { certificationGroups } from "@/content/certifications";
import { notes } from "@/content/notes";
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
