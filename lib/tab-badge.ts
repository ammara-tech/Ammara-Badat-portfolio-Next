/*
  The number badge on the browser tab icon in /admin (components/TabIconBadge.tsx).
  It takes my site icon (an SVG, which is just text) and adds a teal circle with
  the number of unread messages, like an app badge on a phone.

  A tab icon is only 16 pixels wide, so the badge has to be big to be readable.
  To keep it from covering "AB", the logo shrinks into the bottom-left corner
  and the badge sits in the free top-right corner.
  Tested in tests/admin.test.ts.
*/

const SHRINK = 0.7; // the logo is drawn at 70% size while there's a badge

/** "" for none, "1" to "9", then "9+" so it always fits in the circle */
export function badgeLabel(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "";
  return count > 9 ? "9+" : String(Math.floor(count));
}

/** Adds the badge to the icon's SVG text. With no unread messages, the icon is unchanged. */
export function addBadge(svg: string, count: number): string {
  const label = badgeLabel(count);
  const start = svg.indexOf(">", svg.indexOf("<svg")) + 1; // end of the opening <svg ...> tag
  const end = svg.lastIndexOf("</svg>");
  if (!label || start <= 0 || end < start) return svg;

  const logo = `<g transform="translate(0 ${64 - 64 * SHRINK}) scale(${SHRINK})">${svg.slice(start, end)}</g>`;
  const size = label.length > 1 ? 20 : 26;
  const badge =
    `<circle cx="47" cy="16" r="16" fill="#27F4D2" stroke="#15151E" stroke-width="2"/>` +
    `<text x="47" y="${16 + size * 0.36}" text-anchor="middle" font-family="Arial, sans-serif" ` +
    `font-weight="900" font-size="${size}" fill="#15151E">${label}</text>`;
  return svg.slice(0, start) + logo + badge + svg.slice(end);
}
