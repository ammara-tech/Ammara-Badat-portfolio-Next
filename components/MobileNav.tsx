"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";

/*
  App-style navigation bar at the bottom of the screen, on phones only
  (it's hidden from tablet size up, where the normal navbar has room).
  The most-used places are within reach of your thumb. It slides away while
  you scroll down to read, and comes back as soon as you scroll up.
*/

const items: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/projects", label: "Projects", icon: "cube" },
  { href: "/notes", label: "Notes", icon: "document" },
  { href: "/contact", label: "Contact", icon: "mail" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // Hide when scrolling down past the top, show when scrolling up or near the bottom
      const nearBottom = window.innerHeight + y > document.body.scrollHeight - 40;
      setHidden(y > 160 && y > lastY.current + 4 && !nearBottom);
      if (Math.abs(y - lastY.current) > 4) lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const cell =
    "flex flex-1 flex-col items-center justify-center gap-1 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors";

  return (
    <nav
      aria-label="Quick links"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-300 md:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="flex items-stretch">
        {items.slice(0, 2).map((item) => (
          <li key={item.href} className="flex flex-1">
            <Link
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`${cell} ${active(item.href) ? "text-teal" : "text-mist"}`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}

        {/* Search in the middle, like an app's main action */}
        <li className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("palette:open"))}
            aria-label="Search the site"
            className="-mt-4 flex h-13 w-13 items-center justify-center rounded-full bg-racing text-white shadow-lg shadow-racing/30 transition active:scale-95"
          >
            <Icon name="search" className="h-5 w-5" />
          </button>
        </li>

        {items.slice(2).map((item) => (
          <li key={item.href} className="flex flex-1">
            <Link
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`${cell} ${active(item.href) ? "text-teal" : "text-mist"}`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
