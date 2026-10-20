"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/projects/nextjs-dashboard" should still highlight "Projects"
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur">
      <nav className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="font-display text-lg font-black uppercase tracking-wide">
          Ammara Badat<span className="text-racing">.</span>
        </Link>

        <button
          className="text-2xl md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>

        <ul
          className={`${open ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-5 border-b border-line bg-ink px-4 py-5 font-mono text-xs uppercase tracking-widest md:static md:flex md:w-auto md:flex-row md:gap-9 md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive(href) ? "page" : undefined}
                className={`relative py-1.5 transition-colors ${
                  isActive(href)
                    ? "text-snow after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:bg-racing"
                    : "text-mist hover:text-snow"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
