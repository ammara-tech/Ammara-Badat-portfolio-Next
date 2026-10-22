import { describe, expect, it } from "vitest";
import { projectHref, slugify } from "@/lib/slug";
import type { Project } from "@/lib/supabase";

// Builds a project with only the fields these tests need
const project = (title: string, case_study_url: string | null = null) => ({ title, case_study_url }) as Project;

describe("slugify: turns a project title into its page address", () => {
  it("lower-cases and joins words with dashes", () => {
    expect(slugify("Neon Arcade")).toBe("neon-arcade");
  });

  it("keeps numbers and drops symbols", () => {
    expect(slugify("F1 Race Hub 2026!")).toBe("f1-race-hub-2026");
  });

  it("turns & into 'and'", () => {
    expect(slugify("Fish & Bones")).toBe("fish-and-bones");
  });

  it("removes accents", () => {
    expect(slugify("Café Menu")).toBe("cafe-menu");
  });

  it("never starts or ends with a dash", () => {
    expect(slugify("  --My Project--  ")).toBe("my-project");
  });
});

describe("projectHref: where a project card links to", () => {
  it("links to the case study when the project has one", () => {
    expect(projectHref(project("Family Clinic Platform", "/projects/nextjs-dashboard"))).toBe("/projects/nextjs-dashboard");
  });

  it("otherwise links to the project's own page", () => {
    expect(projectHref(project("MyFlix"))).toBe("/projects/myflix");
  });
});
