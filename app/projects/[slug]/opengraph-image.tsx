import { brandImage, ogSize } from "@/lib/og";
import { findProject } from "@/lib/projects";

/* The share image for each project page, drawn by lib/og.tsx */

export const alt = "Project by Ammara Badat";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findProject(slug);

  return brandImage({
    eyebrow: "PROJECT · AMMARA BADAT",
    title: found?.project.title ?? "Projects",
    summary: found?.project.summary ?? "Web apps by a junior full stack developer in South Africa.",
    tags: found?.project.tags.slice(0, 4) ?? [],
  });
}
