import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Titillium_Web } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Icon from "@/components/Icon";
import { about } from "@/content/about";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

const siteUrl = "https://ammara-badat-portfolio-next.vercel.app";
const title = "Ammara Badat — Junior Full Stack Developer";
const description =
  "Portfolio of Ammara Badat, a junior full stack developer in South Africa building with Next.js, React and Supabase.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { email, github, linkedin } = about.contact;

  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${titillium.variable}`}>
      <body className="min-h-screen overflow-x-clip bg-ink font-sans text-snow antialiased">
        {/* Reading progress bar and background glow (see globals.css) */}
        <div aria-hidden="true" className="fx-progress fixed inset-x-0 top-0 z-[60] h-0.5 bg-linear-to-r from-racing to-teal" />
        <div aria-hidden="true" className="site-backdrop" />

        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-8">{children}</main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-8">
            <div>
              <p className="font-display text-lg font-black uppercase tracking-wide">
                Ammara Badat<span className="text-racing">.</span>
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
      </body>
    </html>
  );
}
