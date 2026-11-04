import { buildCvPdf } from "@/lib/cv-pdf";
import { cv } from "@/content/cv";
import { loadProjects } from "@/lib/projects";
import { moreProjects } from "@/lib/cv-projects";

/*
  /cv/Ammara-Badat-CV.pdf: my CV as a PDF, built from content/cv.ts (lib/cv-pdf.ts), plus every
  other project I've published in /admin under "More projects" (lib/cv-projects.ts).
  It's the same address as the old hand-made PDF, so the Download buttons didn't change.

  Next.js builds it when the site deploys, then checks for new projects at most every
  10 minutes (revalidate). If Supabase can't be reached, the PDF is still made, just
  without "More projects".
*/

export const revalidate = 600;

export async function GET() {
  const { projects } = await loadProjects();
  const pdf = await buildCvPdf(moreProjects(cv.projects, projects));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="Ammara-Badat-CV.pdf"',
    },
  });
}
