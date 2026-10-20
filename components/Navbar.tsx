"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  // The bar gets a little darker once you scroll down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "/projects/nextjs-dashboard" should still highlight "Projects"
  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur transition-colors duration-300 ${
        scrolled || open ? "border-line bg-ink/90" : "border-transparent bg-ink/50"
      }`}
    >
      <nav className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="group font-display text-lg font-black uppercase tracking-wide">
          Ammara Badat
          <span className="inline-block text-racing transition-transform duration-300 group-hover:scale-150">.</span>
        </Link>

        <button
          className="relative h-8 w-8 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {/* Three lines that turn into an X */}
          <span
            className={`absolute left-1 h-0.5 w-6 bg-snow transition-all duration-300 ${open ? "top-[15px] rotate-45" : "top-2"}`}
          />
          <span
            className={`absolute left-1 top-[15px] h-0.5 w-6 bg-snow transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`absolute left-1 h-0.5 w-6 bg-snow transition-all duration-300 ${open ? "top-[15px] -rotate-45" : "top-[22px]"}`}
          />
        </button>

        <ul
          className={`${open ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-5 border-b border-line bg-ink px-4 py-6 font-mono text-xs uppercase tracking-widest md:static md:flex md:w-auto md:flex-row md:gap-9 md:border-0 md:bg-transparent md:p-0`}
        >
          {links.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`relative py-1.5 transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-racing after:transition-transform after:duration-300 ${
                    active ? "text-snow after:scale-x-100" : "text-mist after:scale-x-0 hover:text-snow hover:after:scale-x-100"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
