import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/*
  Draws a share image (the picture shown when a link is shared on WhatsApp,
  LinkedIn, Teams or X) in my portfolio's colours. Used by the project pages
  and the dev notes, so each one gets its own picture automatically.
  Note: these images only understand "display: flex" layouts.
*/

export const ogSize = { width: 1200, height: 630 };

export async function brandImage({
  eyebrow,
  title,
  summary,
  tags,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  tags: string[];
}) {
  const size = ogSize;
  // Inter, a free font (SIL Open Font License): Black for the title, Regular for the rest
  const [interBlack, interRegular] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Inter-Black.otf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-Regular.otf")),
  ]);
  const shortSummary = summary.length > 130 ? `${summary.slice(0, 127).replace(/\s+\S*$/, "")}…` : summary;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundColor: "#15151e",
          backgroundImage:
            "radial-gradient(circle at 90% 0%, rgba(232, 0, 45, 0.35), transparent 50%), radial-gradient(circle at 0% 100%, rgba(39, 244, 210, 0.22), transparent 45%)",
          color: "#f5f5f7",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, letterSpacing: 4, color: "#27f4d2" }}>
          <div style={{ width: 40, height: 4, backgroundColor: "#e8002d" }} />
          {eyebrow}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 22 ? 76 : 96,
              fontFamily: "Inter Black",
              lineHeight: 1,
              letterSpacing: -2,
              textTransform: "uppercase",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", width: 420, height: 8, marginTop: 28, backgroundImage: "linear-gradient(90deg, #e8002d, #27f4d2)" }} />
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, lineHeight: 1.35, color: "#c9cbd6", maxWidth: 1000 }}>
            {shortSummary}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  border: "2px solid rgba(245, 245, 247, 0.25)",
                  borderRadius: 999,
                  fontSize: 22,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 24, color: "#9497a6" }}>ammara-badat-portfolio-next.vercel.app</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interRegular, style: "normal", weight: 400 },
        { name: "Inter Black", data: interBlack, style: "normal", weight: 900 },
      ],
    },
  );
}
