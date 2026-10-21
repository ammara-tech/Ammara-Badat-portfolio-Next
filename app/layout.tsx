import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono, Titillium_Web } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Icon from "@/components/Icon";
import LazyExtras from "@/components/LazyExtras";
import { about } from "@/content/about";
import { certificationGroups } from "@/content/certifications";
import { themeScript } from "@/lib/theme";
import { siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["700", "900"], // only the weights the headings use, so fewer font files to download
  variable: "--font-titillium",
  display: "swap",
});

const title = "Ammara Badat — Junior Full Stack Developer";
const description =
  "Portfolio of Ammara Badat, a junior full stack developer in South Africa building with Next.js, React and Supabase.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Ammara Badat Portfolio",
  authors: [{ name: about.name, url: siteUrl }],
  creator: about.name,
  keywords: [
    "Ammara Badat",
    "junior full stack developer",
    "junior front-end developer",
    "Next.js developer",
    "React developer",
    "Supabase",
    "South Africa",
    "Gauteng",
    "portfolio",
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Ammara Badat",
    locale: "en_ZA",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#15151e",
};

/*
  Structured data (JSON-LD). Search engines read this to understand that the
  site is about a person, what she does and where to find her.
  https://schema.org/Person
*/
const certificates = certificationGroups.flatMap((g) => g.certificates.map((c) => ({ name: c.name, issuer: g.issuer })));

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Ammara Badat",
      description,
      inLanguage: "en-ZA",
      author: { "@id": `${siteUrl}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: about.name,
      jobTitle: about.role,
      url: siteUrl,
      email: `mailto:${about.contact.email}`,
      image: `${siteUrl}/opengraph-image.png`,
      address: { "@type": "PostalAddress", addressRegion: "Gauteng", addressCountry: "ZA" },
      sameAs: [about.contact.github, about.contact.linkedin].filter(Boolean),
      knowsAbout: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS", "SQL", "PostgreSQL", "Supabase"],
      hasCredential: certificates.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.name,
        recognizedBy: { "@type": "Organization", name: c.issuer },
      })),
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { email, github, linkedin } = about.contact;

  return (
    // suppressHydrationWarning: the theme script below may add data-theme="light" before React loads
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable} ${titillium.variable}`}>
      <head>
        {/* Applies the saved light/dark choice before the page paints (no flash) */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="min-h-screen overflow-x-clip bg-ink font-sans text-snow antialiased">
        {/* Keyboard users can jump straight past the navbar */}
        <a
          href="#main"
          className="fixed left-4 top-3 z-[70] -translate-y-20 rounded bg-teal px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest text-ink transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>

        {/* Reading progress bar and background glow (see globals.css) */}
        <div aria-hidden="true" className="fx-progress fixed inset-x-0 top-0 z-[60] h-0.5 bg-linear-to-r from-racing to-teal" />
        <div aria-hidden="true" className="site-backdrop" />

        <Navbar />
        <main id="main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-16 outline-none sm:px-8">
          {children}
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-8">
            <div>
              <p className="font-display text-lg font-black uppercase tracking-wide">
                Ammara Badat<span className="text-racing-text">.</span>
              </p>
              <p className="font-mono text-xs text-mist">
                © {new Date().getFullYear()} · Built with Next.js, Tailwind CSS and Supabase
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="rounded-full border border-line-strong p-2.5 text-mist transition hover:border-teal hover:text-teal"
              >
                <Icon name="mail" />
              </a>
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="rounded-full border border-line-strong p-2.5 text-mist transition hover:border-teal hover:text-teal"
              >
                <Icon name="github" />
              </a>
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="rounded-full border border-line-strong p-2.5 text-mist transition hover:border-teal hover:text-teal"
                >
                  <Icon name="linkedin" />
                </a>
              )}
            </div>
          </div>
        </footer>

        {/* Spotlight glow, full-screen image viewer and Ctrl+K search, loaded after the page */}
        <LazyExtras />

        {/* Vercel Web Analytics (visits, no cookies) and Speed Insights (real visitors' load times) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
