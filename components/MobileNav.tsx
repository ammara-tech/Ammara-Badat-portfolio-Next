"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/Icon";

/*
  App-style navigation bar fixed to the bottom of the screen, on phones only
  (it's hidden from tablet size up, where the normal navbar has room).
  It always stays in the same place, so the main pages are always one tap away.

  Smoothness: it uses a solid background instead of a blur (a blur has to be
  redrawn on every scroll frame, which made it stutter on phones), and it
  doesn't move or animate while you scroll.
*/

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/projects", label: "Projects", icon: "cube" },
  { href: "/notes", label: "Notes", icon: "document" },
  { href: "/contact", label: "Contact", icon: "mail" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const link = (item: (typeof items)[number]) => {
    const on = active(item.href);
    return (
      <li key={item.href} className="flex flex-1">
        <Link
          href={item.href}
          aria-current={on ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors active:bg-line ${
            on ? "text-teal" : "text-mist"
          }`}
        >
          {/* A small teal line above the page you're on */}
          <span
            aria-hidden="true"
            className={`absolute inset-x-5 top-0 h-0.5 rounded-full bg-teal transition-opacity ${on ? "opacity-100" : "opacity-0"}`}
          />
          <Icon name={item.icon} className="h-5 w-5" />
          {item.label}
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-ink pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgb(0_0_0/0.25)] md:hidden"
    >
      <ul className="flex items-stretch">
        {items.slice(0, 2).map(link)}

        {/* Search in the middle, like an app's main action */}
        <li className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            aria-label="Search the site"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-racing text-white shadow-md shadow-racing/30 transition-transform active:scale-90"
          >
            <Icon name="search" className="h-5 w-5" />
          </button>
        </li>

        {items.slice(2).map(link)}
      </ul>
    </nav>
  );
}
