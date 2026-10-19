import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ammara Badat — Junior Full Stack Developer",
  description: "Portfolio of Ammara Badat, a junior full stack developer in South Africa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-16">{children}</main>
        <footer className="border-t border-white/10 py-6 text-center text-sm text-neutral-500">
          © {new Date().getFullYear()} Ammara Badat · Built with Next.js
        </footer>
      </body>
    </html>
  );
}