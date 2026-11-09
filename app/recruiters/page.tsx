import Link from "next/link";
import type { Metadata } from "next";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Screenshot from "@/components/Screenshot";
import { Accent, Eyebrow, PageTitle, SectionTitle, Tag, btnGhost, btnIcon, btnPrimary, card } from "@/components/ui";
import { about } from "@/content/about";
import { certificationGroups } from "@/content/certifications";
import { notes } from "@/content/notes";
import { recruiters } from "@/content/recruiters";
import { skillGroups } from "@/content/skills";
import { byTheNumbers } from "@/lib/numbers";
import { loadProjects, projectHref } from "@/lib/projects";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import { siteUrl } from "@/lib/site";

/*
  /recruiters: everything a recruiter needs in about 60 seconds, on one screen.
  Who I am and what I'm looking for, how to reach me and my CV, a few numbers, the three
  projects to look at first (the first three in my /admin order) and my skills at a glance.
  The words are in content/recruiters.ts; everything else is read from the rest of the site.
*/

export const metadata: Metadata = pageMetadata({
  title: "For recruiters — Ammara Badat",
  description:
    "Ammara Badat in 60 seconds: a junior full stack developer in Gauteng. What I'm looking for, my CV, my best projects and my skills on one page.",
  path: "/recruiters",
  type: "profile",
});

// The projects come from Supabase: rebuilt at most once a minute, like the About page
export const revalidate = 60;

type Action = { label: string; href: string; icon: IconName; download?: boolean; external?: boolean };

export default async function Recruiters() {
  const { projects } = await loadProjects();
  const top = projects.slice(0, 3);
  const certificates = certificationGroups.flatMap((g) => g.certificates);
  const { email, phone, github, linkedin, cv, vcard } = about.contact;

  const actions: Action[] = [
    { label: "Email me", href: `mailto:${email}`, icon: "mail" },
    { label: "Call me", href: `tel:${phone.replace(/\s/g, "")}`, icon: "phone" },
    ...(linkedin ? [{ label: "LinkedIn", href: linkedin, icon: "linkedin" as const, external: true }] : []),
    { label: "GitHub", href: github, icon: "github", external: true },
    { label: "Save my contact", href: vcard, icon: "user", download: true },
  ];

  const numbers = byTheNumbers({
    projects: projects.length || null,
    liveApps: recruiters.liveApps,
    notes: notes.length,
    certificates: certificates.length,
    accessibility: about.lighthouse.phone.accessibility,
  }).slice(0, 4);

  return (
    <div className="space-y-16">
      <JsonLd
        data={[
          breadcrumbs([{ name: "For recruiters", path: "/recruiters" }]),
          { "@context": "https://schema.org", "@type": "ProfilePage", url: `${siteUrl}/recruiters`, mainEntity: personRef },
        ]}
      />

      <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow>For recruiters</Eyebrow>
          <PageTitle>
            Me in <Accent>60 seconds</Accent>
          </PageTitle>
          <p className="fx-rise mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-widest text-mist" style={{ animationDelay: "180ms" }}>
            <span className="text-snow">{about.name}</span>
            <span>{about.role}</span>
            <span className="flex items-center gap-1.5">
              <Icon name="map-pin" className="h-3.5 w-3.5" />
              {about.location}
            </span>
            <span className="flex items-center gap-1.5 text-teal">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-teal" />
              {about.status}
            </span>
          </p>

          <ul className="fx-rise mt-8 space-y-4 text-lg" style={{ animationDelay: "240ms" }}>
            {recruiters.shortVersion.map((line) => (
              <li key={line} className="flex gap-3 leading-relaxed text-snow">
                <Icon name="check" className="mt-1.5 h-4 w-4 shrink-0 text-teal" />
                {line}
              </li>
            ))}
          </ul>

          <div className="fx-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "320ms" }}>
            <a href={cv} download className={btnPrimary}>
              <Icon name="download" className="h-4 w-4" />
              Download my CV
            </a>
            <Link href="/projects" className={btnGhost}>
              All projects
              <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
            </Link>
          </div>
        </div>

        <div className={`${card} fx-rise h-fit border-l-[3px] border-l-racing p-6`} style={{ animationDelay: "260ms" }}>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">What I&apos;m looking for</p>
          <ul className="mt-4 space-y-3">
            {about.lookingFor.map((item) => (
              <li key={item} className="flex gap-3 text-mist">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.18em] text-teal">Reach me</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <li key={a.label}>
                <a
                  href={a.href}
                  {...(a.download ? { download: true } : {})}
                  {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-2 rounded border border-line-strong px-3 py-2.5 text-sm text-snow transition hover:border-teal hover:text-teal"
                >
                  <Icon name={a.icon} className="h-4 w-4 shrink-0" />
                  {a.label}
                  {a.external && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="numbers">
        <h2 id="numbers" className="sr-only">
          In numbers
        </h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {numbers.map((n) => (
            <li key={n.label} className={`${card} fx-reveal p-5`}>
              <p className="font-display text-4xl font-black text-snow">{n.value}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-mist">{n.label}</p>
            </li>
          ))}
        </ul>
        <p className="fx-reveal mt-4 text-sm text-mist">
          This site scores {about.lighthouse.phone.accessibility} for accessibility and {about.lighthouse.laptop.performance} for performance on a laptop in
          Lighthouse.{" "}
          <a href={about.lighthouse.proof} target="_blank" rel="noopener noreferrer" className="text-teal underline-offset-2 hover:underline">
            See the proof
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </section>

      {top.length > 0 && (
        <section>
          <SectionTitle>
            Look at <Accent>these first</Accent>
          </SectionTitle>
          <ul className="mt-6 grid gap-6 md:grid-cols-3">
            {top.map((p) => (
              <li key={p.id} className={`${card} fx-reveal flex flex-col overflow-hidden`}>
                <Link href={projectHref(p)} className="block border-b border-line">
                  <Screenshot src={p.image_url} alt={`${p.title} screenshot`} className="aspect-video" sizes="(min-width: 768px) 360px, 100vw" />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl font-bold uppercase">
                    <Link href={projectHref(p)} className="hover:text-teal">
                      {p.title}
                    </Link>
                  </h3>
                  {p.summary && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-mist">{p.summary}</p>}
                  <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 font-mono text-xs uppercase tracking-widest">
                    <Link href={projectHref(p)} className="text-teal hover:underline">
                      Read more<span className="sr-only"> about {p.title}</span>
                    </Link>
                    {p.live_url && (
                      <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-mist hover:text-teal">
                        Live site<span className="sr-only"> of {p.title} (opens in a new tab)</span>
                      </a>
                    )}
                    {p.repo_url && (
                      <a href={p.repo_url} target="_blank" rel="noopener noreferrer" className="text-mist hover:text-teal">
                        Code<span className="sr-only"> for {p.title} on GitHub (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <SectionTitle>
          Skills at a <Accent>glance</Accent>
        </SectionTitle>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.title} className="fx-reveal">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-teal">{g.title}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.skills.map((s) => (
                  <Tag key={s.name}>{s.name}</Tag>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="fx-reveal mt-6 text-mist">
          Every skill links to its proof on the{" "}
          <Link href="/skills" className="text-teal underline-offset-2 hover:underline">
            Skills page
          </Link>
          , and my {certificates.length} Certiport certifications can be checked with their codes on the{" "}
          <Link href="/about#certifications" className="text-teal underline-offset-2 hover:underline">
            About page
          </Link>
          .
        </p>
      </section>

      <section className={`${card} fx-reveal flex flex-wrap items-center justify-between gap-6 p-8`}>
        <div>
          <h2 className="font-display text-2xl font-black uppercase">
            Let&apos;s <Accent>talk</Accent>
          </h2>
          <p className="mt-2 text-mist">{recruiters.closing}</p>
        </div>
        <Link href="/contact" className={btnPrimary}>
          Get in touch
          <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
        </Link>
      </section>
    </div>
  );
}
