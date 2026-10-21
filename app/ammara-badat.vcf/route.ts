import { about } from "@/content/about";
import { siteUrl } from "@/lib/site";

/*
  "Save my contact": a vCard file at /ammara-badat.vcf.
  Opening it on a phone adds me to the contacts app in one tap,
  with my name, job title, email, phone and links filled in.
  It is built from content/about.ts, so it stays up to date.
*/

export const dynamic = "force-static";

export function GET() {
  const { email, phone, github, linkedin } = about.contact;
  const [first, ...rest] = about.name.split(" ");
  const last = rest.join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${about.name}`,
    `TITLE:${about.role}`,
    `EMAIL;TYPE=INTERNET,PREF:${email}`,
    `TEL;TYPE=CELL:${phone.replace(/\s/g, "")}`,
    `URL:${siteUrl}`,
    `X-SOCIALPROFILE;TYPE=github:${github}`,
    ...(linkedin ? [`X-SOCIALPROFILE;TYPE=linkedin:${linkedin}`] : []),
    "ADR;TYPE=WORK:;;;;Gauteng;;South Africa",
    `NOTE:Portfolio: ${siteUrl}  GitHub: ${github}${linkedin ? `  LinkedIn: ${linkedin}` : ""}`,
    "END:VCARD",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Ammara-Badat.vcf"',
    },
  });
}
