"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
import { about } from "@/content/about";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/notes", label: "Notes" },
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

  // Escape closes the phone menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

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
      <nav aria-label="Main" className="relative mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="group shrink-0 whitespace-nowrap font-display text-lg font-black uppercase tracking-wide">
          Ammara Badat
          <span className="inline-block text-racing-text transition-transform duration-300 group-hover:scale-150">.</span>
        </Link>

        {/* Light/dark switch and, on phones, the menu button.
            It comes before the links in the code so Tab goes button → links. */}
        <div className="flex items-center gap-3 md:order-last md:ml-4 lg:ml-6">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            aria-label="Search the site (Ctrl K)"
            aria-keyshortcuts="Control+K Meta+K"
            className="flex items-center gap-2 rounded-full border border-line-strong p-2 text-mist transition hover:border-teal hover:text-teal lg:px-3"
          >
            <Icon name="search" className="h-4 w-4" />
            <span className="hidden font-mono text-[11px] uppercase tracking-widest lg:inline">Search</span>
            <kbd className="hidden rounded border border-line-strong px-1 font-mono text-[10px] lg:inline">Ctrl K</kbd>
          </button>
          <ThemeToggle />
          <button
            className="relative h-8 w-8 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
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
        </div>

        <ul
          id="site-menu"
          className={`${open ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-5 border-b border-line bg-ink px-4 py-6 font-mono text-xs uppercase tracking-widest md:static md:ml-auto md:pl-5 md:tracking-wider lg:pl-0 lg:tracking-widest md:flex md:w-auto md:flex-row md:gap-4 lg:gap-9 md:border-0 md:bg-transparent md:p-0`}
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
          <li>
            <a
              href={about.contact.cv}
              download
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded border border-racing/60 px-3 py-1.5 text-snow transition hover:border-racing hover:bg-racing/15"
            >
              <Icon name="download" className="h-3.5 w-3.5" />
              CV
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
