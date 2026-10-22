import { publicClient, type Project } from "@/lib/supabase";
import { slugify } from "@/lib/slug";

export { slugify, projectHref } from "@/lib/slug";

/*
  Shared helpers for loading projects from Supabase.
  Used by the Projects page, each project's own page and the sitemap.
*/

export async function loadProjects(): Promise<{ projects: Project[]; error: string | null }> {
  try {
    const { data, error } = await publicClient()
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) return { projects: [], error: error.message };
    return { projects: (data ?? []) as Project[], error: null };
  } catch (err) {
    return { projects: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Finds one project by its page address. Returns null if there's no such project.
 * If Supabase can't be reached it throws, so visitors see the friendly error page
 * (app/error.tsx) with a "Try again" button instead of a wrong "page not found".
 */
export async function findProject(slug: string) {
  const { projects, error } = await loadProjects();
  if (error) throw new Error(`Projects couldn't be loaded: ${error}`);
  const index = projects.findIndex((p) => slugify(p.title) === slug);
  if (index === -1) return null;
  return { project: projects[index], others: projects.filter((_, i) => i !== index) };
}
