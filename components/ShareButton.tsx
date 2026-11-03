"use client";

import { useEffect, useId, useRef, useState } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { btnGhost } from "@/components/ui";
import { prefersNativeShare, shareLinks } from "@/lib/share";

/*
  "Share" button on project pages, the case study and dev notes (next to Copy link).
  - Phones: opens the phone's own share sheet (WhatsApp, LinkedIn, email, ...).
  - Laptops: a small menu with LinkedIn, WhatsApp and Email links.
  The menu closes with Escape, by clicking outside it, or after choosing.
  Nothing is shared until the visitor picks where to.
*/

const icons: Record<string, IconName> = { LinkedIn: "linkedin", WhatsApp: "chat", Email: "mail" };

export default function ShareButton({ url, title, label }: { url: string; title: string; label: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  // Close on Escape (focus goes back to the button) or on a click outside the menu
  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  async function share() {
    if (prefersNativeShare(navigator, window.matchMedia("(pointer: coarse)").matches)) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (e) {
        // Closing the share sheet isn't an error; anything else falls back to the menu
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    setOpen((o) => !o);
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        ref={button}
        type="button"
        onClick={share}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Share ${label}`}
        className={`${btnGhost} ${open ? "border-teal text-teal" : ""}`}
      >
        <Icon name="share" className="h-4 w-4" />
        Share
      </button>
      {open && (
        <ul id={menuId} className="absolute left-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-line-strong bg-panel py-1 shadow-xl">
          {shareLinks(url, title).map((link, i) => (
            <li key={link.name}>
              <a
                ref={i === 0 ? firstLink : undefined}
                href={link.href}
                target={link.newTab ? "_blank" : undefined}
                rel={link.newTab ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-snow hover:bg-teal/10 hover:text-teal focus:bg-teal/10 focus:text-teal focus:outline-none"
              >
                <Icon name={icons[link.name]} className="h-4 w-4" />
                {link.name}
                {link.newTab && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
