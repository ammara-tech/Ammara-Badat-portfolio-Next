import Link from "next/link";
import type { Metadata } from "next";
import { about } from "@/content/about";
import Certifications from "@/components/Certifications";
import CountUp from "@/components/CountUp";
import Icon from "@/components/Icon";
import { certificationGroups } from "@/content/certifications";
import { Accent, Divider, Eyebrow, PageTitle, Para, SectionTitle, btnGhost, btnIcon, btnPrimary, card } from "@/components/ui";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";
import { countProjects } from "@/lib/projects";
import { projectStat } from "@/lib/stats";

export const metadata: Metadata = pageMetadata({
  title: "About — Ammara Badat",
  description:
    "Who I am, how I work and the junior full stack role I'm looking for, plus my 4 Certiport IT Specialist certifications.",
  path: "/about",
  type: "profile",
});

const certificateCount = certificationGroups.reduce((n, g) => n + g.certificates.length, 0);

// The project count comes from Supabase: the page is rebuilt at most once a minute,
// so a project published in /admin shows up in the number within a minute
export const revalidate = 60;

export default async function About() {
  // Technologies first, then my live project count, the year, and a count of my certificates
  const projects = projectStat(await countProjects());
  const [technologies, year] = about.stats;
  const stats = [technologies, ...(projects ? [projects] : []), year, { value: String(certificateCount), label: "Certifications earned" }];

  return (
    <div className="space-y-16">
      <JsonLd
        data={[
          breadcrumbs([{ name: "About", path: "/about" }]),
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: `${siteUrl}/about`,
            mainEntity: personRef,
          },
        ]}
      />
      {/* 30-second intro */}
      <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <Eyebrow>About me</Eyebrow>
          <PageTitle>
            Who <Accent>I am</Accent>
          </PageTitle>

          <div className="fx-rise mt-8 space-y-5 text-lg" style={{ animationDelay: "200ms" }}>
            {about.paragraphs.map((text, i) => (
              <Para key={i} text={text} className="leading-relaxed text-mist first:text-snow" />
            ))}
          </div>

          <div className="fx-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: "320ms" }}>
            <Link href="/projects" className={btnPrimary}>
              See my projects
              <Icon name="arrow-right" className={`h-4 w-4 ${btnIcon}`} />
            </Link>
            <Link href="/skills" className={btnGhost}>
              Skills & evidence
            </Link>
            <a href="#certifications" className={btnGhost}>
              Certifications
            </a>
            <a href={about.contact.cv} download className={btnGhost}>
              <Icon name="download" className="h-4 w-4" />
              Download CV
            </a>
          </div>
        </div>

        {/* What I'm looking for */}
        <aside
          className={`${card} fx-rise relative isolate h-fit overflow-hidden border-l-[3px] border-l-racing p-6`}
          style={{ animationDelay: "260ms" }}
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 -z-10 h-40 w-40 rounded-full bg-racing/15 blur-3xl"
          />
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-teal">The role I want</p>
          <p className="mt-2 font-display text-2xl font-black uppercase">{about.role}</p>
          <ul className="mt-5 space-y-3">
            {about.lookingFor.map((item, i) =>
              item.startsWith("TODO") ? (
                <li key={i}>
                  <Para text={item} />
                </li>
              ) : (
                <li key={i} className="flex gap-3 text-mist">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </aside>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`${card} spotlight fx-reveal group relative overflow-hidden p-6 transition hover:border-teal/50`}
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-racing to-teal transition-transform duration-500 group-hover:scale-x-100"
            />
            <p className="font-display text-4xl font-black text-snow">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-mist">{stat.label}</p>
          </div>
        ))}
      </section>

      <Divider />

      {/* Education */}
      <section>
        <SectionTitle>
          How I <Accent>got here</Accent>
        </SectionTitle>
        <div className={`${card} fx-reveal mt-6 grid gap-4 p-6 sm:grid-cols-[6rem_1fr]`}>
          <div className="flex items-center gap-3 sm:flex-col sm:items-start">
            <span className="rounded-lg border border-teal/30 bg-teal/10 p-2 text-teal">
              <Icon name="academic-cap" className="h-6 w-6" />
            </span>
            <p className="font-mono text-sm text-teal">{about.education.year}</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-bold uppercase">{about.education.title}</h3>
            <p className="font-mono text-xs uppercase tracking-widest text-mist">{about.education.school}</p>
            <p className="mt-3 leading-relaxed text-mist">{about.education.description}</p>
          </div>
        </div>
      </section>

      <Divider />

      <Certifications />
    </div>
  );
}
