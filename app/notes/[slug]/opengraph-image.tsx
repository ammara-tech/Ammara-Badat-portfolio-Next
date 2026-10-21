import { brandImage, ogSize } from "@/lib/og";
import { findNote } from "@/content/notes";

/* The share image for each dev note, drawn by lib/og.tsx */

export const alt = "Dev note by Ammara Badat";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = findNote(slug);

  return brandImage({
    eyebrow: "DEV NOTES · AMMARA BADAT",
    title: note?.title ?? "Dev notes",
    summary: note?.description ?? "What I built and learned as a junior full stack developer.",
    tags: note?.tags.slice(0, 3) ?? [],
  });
}
