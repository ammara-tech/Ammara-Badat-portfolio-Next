"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          Ammara Badat<span className="text-emerald-400">.</span>
        </Link>

        <button
          className="text-2xl md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>

        <ul
          className={`${open ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-4 border-b border-white/10 bg-neutral-950 px-4 py-4 md:static md:flex md:w-auto md:flex-row md:gap-8 md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={pathname === href ? "text-emerald-400" : "text-neutral-300 hover:text-white"}
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