import { buildFittedCv } from "@/lib/cv-pdf";
import { cv } from "@/content/cv";
import { loadProjects } from "@/lib/projects";
import { cvProjects } from "@/lib/cv-projects";

/*
  /cv/Ammara-Badat-CV.pdf: my CV as a PDF, built from content/cv.ts (lib/cv-pdf.ts) and my
  published projects in /admin: the newest in full, the rest under "More projects" (lib/cv-projects.ts).
  It's the same address as the old hand-made PDF, so the Download buttons didn't change.

  Next.js builds it when the site deploys, then checks for new projects at most every
  10 minutes (revalidate). If Supabase can't be reached, the PDF is still made, just
  with just my hand-written projects.
*/

export const revalidate = 600;

export async function GET() {
  const { projects } = await loadProjects();
  const layout = cvProjects(cv.projects, projects);
  // Kept to one page: buildFittedCv() shortens it a step at a time if it needs to
  const pdf = await buildFittedCv(layout.extra, layout.projects);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Ammara-Badat-CV.pdf"',
    },
  });
}
