import Link from "next/link";
import type { Metadata } from "next";
import { caseStudy } from "@/content/case-study";
import Screenshot from "@/components/Screenshot";
import { LightboxTrigger, type LightboxImage } from "@/components/Lightbox";
import Icon from "@/components/Icon";
import { Accent, Eyebrow, Para, SectionTitle, SmartLink, btnGhost, btnIcon, btnPrimary, card } from "@/components/ui";
import { breadcrumbs, pageMetadata, personRef } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import { siteUrl } from "@/lib/site";
import CopyLink from "@/components/CopyLink";

export const metadata: Metadata = pageMetadata({
  title: `${caseStudy.title} — Case study — Ammara Badat`,
  description:
    "Capstone case study: a secure clinic platform built with Next.js and Supabase. The problem, my role, the stack, a demo video and lessons learned.",
  path: "/projects/nextjs-dashboard",
  type: "article",
});

// A video file in /public plays on the page; anything else (YouTube, Loom) is a link.
const isVideoFile = /\.(mp4|webm)$/i.test(caseStudy.videoUrl);

const sections = [
  ...(isVideoFile ? [{ id: "demo", label: "Demo video" }] : []),
  { id: "problem", label: "The problem" },
  { id: "role", label: "My role" },
  { id: "stack", label: "The stack" },
  { id: "built", label: "What I built" },
  { id: "screenshots", label: "Screenshots" },
  { id: "challenges", label: "Challenges" },
  { id: "next", label: "What's next" },
];

export default function CaseStudy() {
  const cs = caseStudy;
  const [heroShot, ...otherShots] = cs.screenshots;
  // All screenshots in one list for the full-screen viewer
  const gallery: LightboxImage[] = cs.screenshots.map((shot) => ({ src: shot.src, alt: shot.alt, caption: shot.caption }));

  return (
    <article>
      <JsonLd
        data={[
          breadcrumbs([
            { name: "Projects", path: "/projects" },
            { name: cs.title, path: "/projects/nextjs-dashboard" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${cs.title}: capstone case study`,
            description: cs.tagline,
            url: `${siteUrl}/projects/nextjs-dashboard`,
            image: `${siteUrl}${cs.screenshots[0]?.src ?? "/opengraph-image.png"}`,
            author: personRef,
            about: { "@type": "SoftwareApplication", name: cs.title, applicationCategory: "HealthApplication", url: cs.liveUrl },
          },
        ]}
      />
      <Link href="/projects" className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mist hover:text-teal">
        <Icon name="arrow-left" className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
        All projects
      </Link>

      {/* Header */}
      <header className="mt-8">
        <Eyebrow>Capstone case study</Eyebrow>
        <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">
          {cs.title.split(" ").slice(0, -1).join(" ")} <Accent>{cs.title.split(" ").slice(-1).join("")}</Accent>
        </h1>
        <div className="mt-5 max-w-2xl">
          <Para text={cs.tagline} className="text-xl leading-relaxed text-mist" />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <SmartLink href={cs.liveUrl} className={btnPrimary}>
            Live site
            <Icon name="arrow-up-right" className={`h-3.5 w-3.5 ${btnIcon}`} />
          </SmartLink>
          <SmartLink href={cs.repoUrl} className={btnGhost}>
            <Icon name="github" className="h-4 w-4" />
            GitHub repo
          </SmartLink>
          {cs.videoUrl && (
            <SmartLink href={isVideoFile ? "#demo" : cs.videoUrl} className={btnGhost}>
              <Icon name="play" className="h-4 w-4" />
              Watch the demo
            </SmartLink>
          )}
          <CopyLink url={`${siteUrl}/projects/nextjs-dashboard`} label="this case study" />
        </div>

        {/* Quick facts */}
        <dl className="fx-rise mt-10 grid gap-4 sm:grid-cols-3" style={{ animationDelay: "300ms" }}>
          <div className={`${card} p-5`}>
            <dt className="font-mono text-xs uppercase tracking-widest text-teal">When</dt>
            <dd className="mt-1 text-snow">
              {cs.year} · {cs.context}
            </dd>
          </div>
          <div className={`${card} p-5 sm:col-span-2`}>
            <dt className="font-mono text-xs uppercase tracking-widest text-teal">Built for</dt>
            <dd className="mt-1">
              <Para text={cs.audience} className="text-snow" />
            </dd>
          </div>
        </dl>
      </header>

      {heroShot && (
        <figure className="fx-reveal mt-12">
          <LightboxTrigger
            images={gallery}
            index={0}
            label={`Enlarge screenshot: ${heroShot.alt}`}
            className="group relative block w-full overflow-hidden rounded-lg text-left"
          >
            <Screenshot
              src={heroShot.src}
              alt={heroShot.alt}
              sizes="(min-width: 1152px) 1088px, 100vw"
              priority
              className="transition duration-700 group-hover:scale-[1.02]"
            />
            <ZoomHint />
          </LightboxTrigger>
          <figcaption className="mt-3 font-mono text-xs text-mist">{heroShot.caption}</figcaption>
        </figure>
      )}

      <div className="mt-16 grid gap-12 lg:grid-cols-[12rem_1fr]">
        {/* On this page */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-28 space-y-3 border-l border-line pl-4 font-mono text-xs uppercase tracking-widest">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-mist hover:text-teal">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="max-w-3xl space-y-16">
          {isVideoFile && (
            <section>
              <SectionTitle id="demo">
                Demo <Accent>video</Accent>
              </SectionTitle>
              <figure className="fx-reveal mt-6">
                <video
                  controls
                  preload="metadata"
                  playsInline
                  poster={cs.videoPoster || undefined}
                  className="h-auto w-full rounded-lg border border-line bg-black text-white"
                >
                  <source src={cs.videoUrl} type="video/mp4" />
                  Your browser can&apos;t play this video.{" "}
                  <a href={cs.videoUrl} className="text-teal underline">
                    Download it instead
                  </a>
                  .
                </video>
                {cs.videoCaption && (
                  <figcaption className="mt-3 font-mono text-xs text-mist">{cs.videoCaption}</figcaption>
                )}
              </figure>
            </section>
          )}

          <section>
            <SectionTitle id="problem">
              The <Accent>problem</Accent>
            </SectionTitle>
            <div className="mt-5">
              <Para text={cs.problem} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="role">
              My <Accent>role</Accent>
            </SectionTitle>
            <div className="mt-5">
              <Para text={cs.role} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="stack">
              The <Accent>stack</Accent>
            </SectionTitle>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {cs.stack.map((item) => (
                <li
                  key={item.name}
                  className={`${card} spotlight fx-reveal p-4 transition hover:-translate-y-0.5 hover:border-teal/50`}
                >
                  <p className="font-mono text-sm font-bold text-teal">{item.name}</p>
                  <p className="mt-1 text-sm text-mist">{item.use}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id="built">
              What I <Accent>built</Accent>
            </SectionTitle>
            <ul className="mt-6 space-y-3">
              {cs.features.map((feature) => (
                <li key={feature} className="fx-reveal flex gap-3 text-mist">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-racing" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle id="screenshots">
              <Accent>Screenshots</Accent>
            </SectionTitle>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {otherShots.map((shot, i) => (
                <figure key={shot.src} className="fx-reveal">
                  <LightboxTrigger
                    images={gallery}
                    index={i + 1}
                    label={`Enlarge screenshot: ${shot.alt}`}
                    className="group relative block w-full overflow-hidden rounded-lg text-left"
                  >
                    <Screenshot
                      src={shot.src}
                      alt={shot.alt}
                      sizes="(min-width: 640px) 384px, 100vw"
                      className="transition duration-700 group-hover:scale-[1.04]"
                    />
                    <ZoomHint />
                  </LightboxTrigger>
                  <figcaption className="mt-2 font-mono text-xs text-mist">{shot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle id="challenges">
              Challenges & <Accent>lessons</Accent>
            </SectionTitle>
            <div className="mt-5 space-y-5">
              <Para text={cs.challenges} className="text-lg leading-relaxed text-mist" />
              <Para text={cs.learned} className="text-lg leading-relaxed text-mist" />
            </div>
          </section>

          <section>
            <SectionTitle id="next">
              What I&apos;d do <Accent>next</Accent>
            </SectionTitle>
            <ul className="mt-6 space-y-3">
              {cs.next.map((item) =>
                item.startsWith("TODO") ? (
                  <li key={item}>
                    <Para text={item} />
                  </li>
                ) : (
                  <li key={item} className="flex gap-3 text-mist">
                    <span aria-hidden="true" className="font-mono text-teal">
                      →
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </section>

          <div className={`${card} flex flex-wrap items-center justify-between gap-4 p-6`}>
            <p className="font-display text-xl font-black uppercase">
              See it for <Accent>yourself</Accent>
            </p>
            <div className="flex flex-wrap gap-3">
              <SmartLink href={cs.liveUrl} className={btnPrimary}>
                Live site
                <Icon name="arrow-up-right" className={`h-3.5 w-3.5 ${btnIcon}`} />
              </SmartLink>
              <SmartLink href={cs.repoUrl} className={btnGhost}>
                <Icon name="github" className="h-4 w-4" />
                GitHub repo
              </SmartLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Small "click to enlarge" badge that shows on hover and keyboard focus */
function ZoomHint() {
  return (
    <span
      aria-hidden="true"
      className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/70 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <Icon name="expand" className="h-3.5 w-3.5" />
      Enlarge
    </span>
  );
}
