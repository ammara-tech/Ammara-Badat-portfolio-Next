import type { Metadata } from "next";
import { about } from "@/content/about";
import { cv } from "@/content/cv";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Icon from "@/components/Icon";
import PrintButton from "@/components/PrintButton";
import { Accent, SmartLink, btnPrimary } from "@/components/ui";

/*
  My CV as a web page: easy to read on a phone, readable by Google, and it prints
  cleanly on white paper (see the @media print rules in globals.css).
  The text lives in content/cv.ts.
*/

export const metadata: Metadata = pageMetadata({
  title: "CV — Ammara Badat",
  description:
    "CV of Ammara Badat, junior full stack developer in Gauteng: skills, projects, Certiport and Vercel certifications, and education.",
  path: "/cv",
  type: "profile",
});

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="cv-heading mt-10 border-b border-line-strong pb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-teal">
      {children}
    </h2>
  );
}

export default function CvPage() {
  const { email, phone, github, linkedin, cv: pdf } = about.contact;

  return (
    <article className="mx-auto max-w-3xl">
      <JsonLd
        data={[
          breadcrumbs([{ name: "CV", path: "/cv" }]),
          { "@context": "https://schema.org", "@type": "ProfilePage", url: `${siteUrl}/cv`, mainEntity: personRef },
        ]}
      />

      {/* Buttons (not printed) */}
      <div className="no-print fx-rise mb-10 flex flex-wrap gap-3">
        <a href={pdf} download className={btnPrimary}>
          <Icon name="download" className="h-4 w-4" />
          Download PDF
        </a>
        <PrintButton />
      </div>

      <header className="cv-header">
        <h1 className="fx-rise font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
          {about.name.split(" ")[0]} <Accent>{about.name.split(" ").slice(1).join(" ")}</Accent>
        </h1>
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.18em] text-teal">{about.role}</p>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-mist">
          <li className="flex items-center gap-1.5">
            <Icon name="map-pin" className="h-4 w-4" />
            Gauteng, South Africa
          </li>
          <li>
            <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-teal">
              <Icon name="mail" className="h-4 w-4" />
              {email}
            </a>
          </li>
          <li>
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-teal">
              <Icon name="phone" className="h-4 w-4" />
              {phone}
            </a>
          </li>
          <li>
            <a href={github} className="flex items-center gap-1.5 hover:text-teal">
              <Icon name="github" className="h-4 w-4" />
              {github.replace("https://", "")}
            </a>
          </li>
          {linkedin && (
            <li>
              <a href={linkedin} className="flex items-center gap-1.5 hover:text-teal">
                <Icon name="linkedin" className="h-4 w-4" />
                {linkedin.replace("https://www.", "")}
              </a>
            </li>
          )}
          <li className="print-only">{siteUrl.replace("https://", "")}</li>
        </ul>
      </header>

      <Heading>Profile</Heading>
      <p className="mt-4 leading-relaxed text-snow">{cv.profile}</p>

      <Heading>Technical skills</Heading>
      <dl className="mt-4 space-y-3">
        {cv.skills.map((s) => (
          <div key={s.label} className="grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4">
            <dt className="font-semibold text-snow">{s.label}</dt>
            <dd className="text-mist">{s.value}</dd>
          </div>
        ))}
      </dl>

      <Heading>Projects</Heading>
      <div className="mt-4 space-y-7">
        {cv.projects.map((p) => (
          <section key={p.title} className="cv-block">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="font-semibold text-snow">{p.title}</h3>
              <p className="flex flex-wrap gap-3 font-mono text-xs">
                {p.links.map((l) => (
                  <SmartLink key={l.label} href={l.href} className="text-teal underline-offset-2 hover:underline">
                    {l.label}
                  </SmartLink>
                ))}
              </p>
            </div>
            <p className="mt-1 text-sm italic text-mist">{p.stack}</p>
            <ul className="mt-2 space-y-1.5">
              {p.points.map((point) => (
                <li key={point} className="flex gap-3 text-mist">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-racing" />
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Heading>Certifications</Heading>
      <ul className="mt-4 space-y-3">
        {cv.certifications.map((c) => (
          <li key={c.issuer} className="flex flex-wrap justify-between gap-x-4 text-mist">
            <span>
              <strong className="text-snow">{c.issuer}:</strong> {c.names}
            </span>
            <span className="font-mono text-xs">{c.date}</span>
          </li>
        ))}
      </ul>

      <Heading>Education</Heading>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4">
        <p className="font-semibold text-snow">
          {cv.education.title} <span className="font-normal text-mist">· {cv.education.school}</span>
        </p>
        <span className="font-mono text-xs text-mist">{cv.education.year}</span>
      </div>
      <p className="mt-1 text-mist">{cv.education.description}</p>

      <p className="mt-10 text-sm text-mist">References available on request.</p>
    </article>
  );
}
