import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Titillium_Web } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const titillium = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-titillium",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ammara Badat — Junior Full Stack Developer",
  description: "Portfolio of Ammara Badat, a junior full stack developer in South Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${titillium.variable}`}>
      <body className="min-h-screen bg-ink font-sans text-snow antialiased">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-8">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 font-mono text-xs text-mist sm:px-8">
            <p>© {new Date().getFullYear()} Ammara Badat</p>
            <p>Built with Next.js, Tailwind CSS and Supabase</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
