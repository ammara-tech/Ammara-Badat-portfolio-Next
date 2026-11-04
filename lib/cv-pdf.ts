import { PDFDocument, PDFName, PDFString, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { about } from "@/content/about";
import { cv } from "@/content/cv";
import { siteUrl } from "@/lib/site";
import type { CvExtra } from "@/lib/cv-projects";

/*
  My CV as a PDF, built from the same words as the /cv page (content/cv.ts and content/about.ts),
  so the two can never disagree. app/cv/Ammara-Badat-CV.pdf/route.ts serves it at the same address
  the old hand-made PDF had, so every "Download PDF" button still works.
  Next.js builds it on deploy and rebuilds it at most every 10 minutes, so it costs nothing per visitor.

  "More projects" lists every other project I've published in /admin (lib/cv-projects.ts).
  One A4 page (a second page is added only if the text ever gets too long), Helvetica,
  real selectable text (so job sites can read it) and clickable links.
  Tested in tests/cv-pdf.test.ts.
*/

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 42;
const WIDTH = A4.width - MARGIN * 2;
const INK = rgb(0.1, 0.1, 0.12);
const SOFT = rgb(0.35, 0.36, 0.4);
const ACCENT = rgb(0.0, 0.45, 0.42); // the site's teal, darkened for white paper
const LINE = rgb(0.8, 0.81, 0.84);

/** Helvetica can only draw the Windows-1252 characters, so swap anything else for a close match */
export function pdfSafe(text: string) {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/—/g, "–") // em dash to en dash (both look fine; en dash is supported)
    .replace(/→/g, "->")
    .replace(/[^\x20-\x7E -ÿ–•…€]/g, "");
}

/** Splits text into lines that fit the width */
export function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of pdfSafe(text).split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** As many whole words as fit in the width, ending with "…" if any were cut ("" if nothing fits) */
export function fitText(text: string, font: PDFFont, size: number, width: number) {
  const safe = pdfSafe(text);
  if (font.widthOfTextAtSize(safe, size) <= width) return safe;
  const words = safe.split(" ");
  for (let n = words.length - 1; n > 0; n--) {
    const cut = `${words.slice(0, n).join(" ").replace(/[\s,;:\u2013-]+$/, "")}\u2026`;
    if (!/[A-Za-z0-9]/.test(cut)) return ""; // only a dash and "…" left: show nothing instead
    if (font.widthOfTextAtSize(cut, size) <= width) return cut;
  }
  return "";
}

/** "/projects/x" becomes the full address, because a PDF has no "current site" */
const absolute = (href: string) => (href.startsWith("/") ? `${siteUrl}${href}` : href);
const bare = (href: string) => href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

/** extra: the "More projects" lines (lib/cv-projects.ts), from my published projects in /admin */
export async function buildCvPdf(extra: CvExtra[] = []): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${about.name} – CV`);
  doc.setAuthor(about.name);
  doc.setSubject(`CV of ${about.name}, ${about.role}`);
  doc.setKeywords(["CV", about.role, "Next.js", "React", "TypeScript", "Supabase", "SQL"]);
  doc.setCreator(`${bare(siteUrl)} (built from content/cv.ts)`);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page: PDFPage = doc.addPage([A4.width, A4.height]);
  let y = A4.height - MARGIN;

  const space = (needed: number) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([A4.width, A4.height]);
      y = A4.height - MARGIN;
    }
  };

  const text = (t: string, x: number, size: number, font = regular, color = INK) =>
    page.drawText(pdfSafe(t), { x, y, size, font, color });

  const link = (label: string, href: string, x: number, size: number, font = regular, color = ACCENT) => {
    const safe = pdfSafe(label);
    page.drawText(safe, { x, y, size, font, color });
    const w = font.widthOfTextAtSize(safe, size);
    const annot = doc.context.register(
      doc.context.obj({
        Type: "Annot",
        Subtype: "Link",
        Rect: [x, y - 2, x + w, y + size],
        Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(absolute(href)) },
      }),
    );
    page.node.addAnnot(annot);
    return w;
  };

  const paragraph = (t: string, x: number, size: number, width: number, font = regular, color = INK, gap = 1.3) => {
    for (const line of wrap(t, font, size, width)) {
      space(size * gap);
      text(line, x, size, font, color);
      y -= size * gap;
    }
  };

  const heading = (t: string) => {
    space(30);
    y -= 9;
    text(t.toUpperCase(), MARGIN, 9.5, bold, ACCENT);
    y -= 4.5;
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4.width - MARGIN, y }, thickness: 0.6, color: LINE });
    y -= 12;
  };

  // ---------- Name, role and contact details ----------
  text(about.name, MARGIN, 24, bold);
  y -= 18;
  text(about.role, MARGIN, 11.5, bold, ACCENT);
  y -= 16;

  const { email, phone, github, linkedin } = about.contact;
  const contacts: { label: string; href?: string }[] = [
    { label: "Gauteng, South Africa" },
    { label: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { label: email, href: `mailto:${email}` },
  ];
  const webLinks = [
    { label: `Portfolio: ${bare(siteUrl)}`, href: siteUrl },
    { label: `GitHub: ${bare(github)}`, href: github },
    ...(linkedin ? [{ label: `LinkedIn: ${bare(linkedin)}`, href: linkedin }] : []),
  ];
  for (const row of [contacts, webLinks]) {
    let x = MARGIN;
    row.forEach((c, i) => {
      // Too long for this line? Carry on at the start of the next one
      if (i > 0 && x + 14 + regular.widthOfTextAtSize(pdfSafe(c.label), 9) > A4.width - MARGIN) {
        y -= 13;
        x = MARGIN;
      } else if (i > 0) {
        text("|", x + 4, 9, regular, LINE);
        x += 14;
      }
      if (c.href) {
        x += link(c.label, c.href, x, 9, regular, SOFT);
      } else {
        text(c.label, x, 9, regular, SOFT);
        x += regular.widthOfTextAtSize(pdfSafe(c.label), 9);
      }
    });
    y -= 13;
  }

  // ---------- Profile ----------
  heading("Profile");
  paragraph(cv.profile, MARGIN, 9.5, WIDTH);

  // ---------- Skills ----------
  heading("Technical skills");
  const labelWidth = 96;
  for (const s of cv.skills) {
    space(13);
    text(s.label, MARGIN, 9.5, bold);
    paragraph(s.value, MARGIN + labelWidth, 9.5, WIDTH - labelWidth);
    y -= 2;
  }

  // ---------- Projects ----------
  heading("Projects");
  for (const p of cv.projects) {
    space(40);
    text(p.title, MARGIN, 10.5, bold);
    // Links on the right: "Live · Code · Case study"
    const parts = p.links.map((l) => pdfSafe(l.label));
    const sep = " · ";
    let x = A4.width - MARGIN - regular.widthOfTextAtSize(parts.join(sep), 9);
    p.links.forEach((l, i) => {
      if (i > 0) {
        text(sep, x, 9, regular, SOFT);
        x += regular.widthOfTextAtSize(sep, 9);
      }
      x += link(l.label, l.href, x, 9);
    });
    y -= 12;
    paragraph(p.stack, MARGIN, 8.8, WIDTH, regular, SOFT);
    for (const point of p.points) {
      const lines = wrap(point, regular, 9.1, WIDTH - 12);
      lines.forEach((line, i) => {
        space(11.8);
        if (i === 0) text("•", MARGIN + 2, 9.1);
        text(line, MARGIN + 12, 9.1);
        y -= 11.8;
      });
    }
    y -= 3.5;
  }

  // ---------- More projects: one line each, added automatically from /admin ----------
  if (extra.length > 0) {
    heading("More projects");
    for (const p of extra) {
      space(13);
      const sep = " \u00B7 ";
      const linkText = p.links.map((l) => pdfSafe(l.label)).join(sep);
      const linksWidth = regular.widthOfTextAtSize(linkText, 9);
      // The title, then as much of the summary as fits before the links
      text(p.title, MARGIN, 9.6, bold);
      const titleWidth = bold.widthOfTextAtSize(pdfSafe(p.title), 9.6) + 3;
      const room = WIDTH - titleWidth - linksWidth - 20;
      const summary = p.summary ? fitText(`\u2013 ${p.summary}`, regular, 9.2, room) : "";
      if (summary) text(summary, MARGIN + titleWidth, 9.2, regular, SOFT);
      let x = A4.width - MARGIN - linksWidth;
      p.links.forEach((l, i) => {
        if (i > 0) {
          text(sep, x, 9, regular, SOFT);
          x += regular.widthOfTextAtSize(sep, 9);
        }
        x += link(l.label, l.href, x, 9);
      });
      y -= 12.5;
    }
  }

  // ---------- Certifications ----------
  heading("Certifications");
  for (const c of cv.certifications) {
    const dateWidth = regular.widthOfTextAtSize(pdfSafe(c.date), 9.2);
    space(13);
    const top = y;
    paragraph(`${c.issuer}: ${c.names}`, MARGIN, 9.2, WIDTH - dateWidth - 16);
    const end = y;
    y = top;
    text(c.date, A4.width - MARGIN - dateWidth, 9.2, regular, SOFT);
    y = end - 2;
  }

  // ---------- Education ----------
  heading("Education");
  space(26);
  const e = cv.education;
  const yearWidth = regular.widthOfTextAtSize(pdfSafe(e.year), 9.2);
  text(e.title, MARGIN, 9.8, bold);
  const titleWidth = bold.widthOfTextAtSize(pdfSafe(e.title), 9.8);
  text(` · ${e.school}`, MARGIN + titleWidth, 9.8);
  text(e.year, A4.width - MARGIN - yearWidth, 9.2, regular, SOFT);
  y -= 13;
  paragraph(e.description, MARGIN, 9.2, WIDTH, regular, SOFT);

  // Open at 100% on the first page in most PDF readers
  doc.catalog.set(PDFName.of("PageMode"), PDFName.of("UseNone"));

  return doc.save();
}
