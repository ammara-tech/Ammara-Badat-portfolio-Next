import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { loadProjects, slugify } from "@/lib/projects";
import { notes } from "@/content/notes";

/*
  Sitemap for search engines, served at /sitemap.xml.
  It lists every public page, plus one page per project from Supabase,
  so a project added in /admin is found by Google without editing this file.
  /admin is left out on purpose.
*/

// Rebuild the sitemap at most once an hour
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const pages: { path: string; priority: number; changeFrequency: Entry["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
  { path: "/projects/nextjs-dashboard", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/skills", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/notes", priority: 0.7, changeFrequency: "weekly" },
  { path: "/cv", priority: 0.7, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const fixed: Entry[] = pages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  // If Supabase can't be reached, the sitemap still works with the fixed pages
  const { projects } = await loadProjects();
  const projectPages: Entry[] = projects
    .filter((p) => !p.case_study_url) // the capstone is already listed as its case study
    .map((p) => ({
      url: `${siteUrl}/projects/${slugify(p.title)}`,
      lastModified: p.created_at ? new Date(p.created_at) : lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const notePages: Entry[] = notes.map((n) => ({
    url: `${siteUrl}/notes/${n.slug}`,
    lastModified: new Date(`${n.date}T12:00:00`),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...fixed, ...notePages, ...projectPages];
}
