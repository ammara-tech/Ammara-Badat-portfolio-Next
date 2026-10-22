"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Icon, { type IconName } from "@/components/Icon";
import { about } from "@/content/about";
import { skillGroups } from "@/content/skills";
import { certificationGroups } from "@/content/certifications";
import { caseStudy } from "@/content/case-study";
import { notes } from "@/content/notes";
import { slugify } from "@/lib/slug";
import { getTheme, setTheme } from "@/lib/theme";
import { setMotion } from "@/lib/motion";

/*
  Command palette: press Ctrl + K (or ⌘ K on a Mac), or the Search button in
  the navbar, then type to jump to any page, project, skill or certificate,
  or to run an action like downloading my CV.

  Accessibility: it is a native <dialog> (Escape closes it, focus is trapped),
  and the list follows the ARIA "combobox + listbox" pattern, so screen
  readers announce the highlighted result while you use the arrow keys.
*/

type Item = {
  id: string;
  group: "Pages" | "Projects" | "Notes" | "Skills" | "Certificates" | "Actions";
  label: string;
  hint?: string;
  keywords?: string;
  icon: IconName;
  href?: string;
  run?: () => void;
};

const groupOrder: Item["group"][] = ["Pages", "Projects", "Notes", "Actions", "Skills", "Certificates"];

const pages: Item[] = [
  { id: "p-home", group: "Pages", label: "Home", icon: "window", href: "/", keywords: "start terminal" },
  { id: "p-about", group: "Pages", label: "About", icon: "document", href: "/about", keywords: "me bio education role" },
  { id: "p-projects", group: "Pages", label: "Projects", icon: "cube", href: "/projects", keywords: "work portfolio built" },
  { id: "p-case", group: "Pages", label: `Case study: ${caseStudy.title}`, icon: "document", href: "/projects/nextjs-dashboard", keywords: "capstone clinic demo video" },
  { id: "p-skills", group: "Pages", label: "Skills", icon: "terminal", href: "/skills", keywords: "evidence proof tech" },
  { id: "p-certs", group: "Pages", label: "Certifications", icon: "badge", href: "/about#certifications", keywords: "certificates certiport vercel cs50" },
  { id: "p-contact", group: "Pages", label: "Contact", icon: "mail", href: "/contact", keywords: "message hire email form" },
  { id: "p-cv", group: "Pages", label: "CV (web page)", icon: "document", href: "/cv", keywords: "resume curriculum vitae print" },
  { id: "p-notes", group: "Pages", label: "Dev notes", icon: "document", href: "/notes", keywords: "blog posts articles writing rss" },
];

const skills: Item[] = skillGroups.flatMap((g) =>
  g.skills.map((s) => ({
    id: `s-${slugify(s.name)}`,
    group: "Skills" as const,
    label: s.name,
    hint: g.title,
    keywords: s.note,
    icon: "code" as const,
    href: `/skills#${slugify(s.name)}`,
  })),
);

const certificates: Item[] = certificationGroups.flatMap((g) =>
  g.certificates.map((c) => ({
    id: `c-${slugify(c.name)}`,
    group: "Certificates" as const,
    label: c.name,
    hint: g.issuer.split(" · ")[0],
    keywords: g.issuer,
    icon: "badge" as const,
    href: "/about#certifications",
  })),
);

const noteItems: Item[] = notes.map((n) => ({
  id: `n-${n.slug}`,
  group: "Notes" as const,
  label: n.title,
  hint: n.tags.slice(0, 2).join(" · "),
  keywords: `${n.description} ${n.tags.join(" ")}`,
  icon: "document" as const,
  href: `/notes/${n.slug}`,
}));

type ProjectRow = { id: string; title: string; summary: string | null; tags: string[]; case_study_url: string | null };

/** onReady: called once the palette is listening (used by LazyExtras to open it straight away) */
export default function CommandPalette({ onReady }: { onReady?: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [projects, setProjects] = useState<Item[]>([]);
  const [copied, setCopied] = useState(false);

  const close = () => dialogRef.current?.close();

  const actions: Item[] = useMemo(
    () => [
      {
        id: "a-cv",
        group: "Actions",
        label: "Download my CV (PDF)",
        icon: "download",
        keywords: "resume",
        run: () => {
          const a = document.createElement("a");
          a.href = about.contact.cv;
          a.download = "";
          a.click();
        },
      },
      {
        id: "a-motion",
        group: "Actions",
        label: "Turn animations on / off",
        icon: "sparkles",
        keywords: "motion animation calm reduce",
        run: () => setMotion(document.documentElement.dataset.motion === "reduced"),
      },
      {
        id: "a-theme",
        group: "Actions",
        label: "Switch light / dark mode",
        icon: "sun",
        keywords: "theme colour color",
        run: () => setTheme(getTheme() === "dark" ? "light" : "dark"),
      },
      {
        id: "a-copy",
        group: "Actions",
        label: copied ? "Email copied!" : "Copy my email address",
        hint: about.contact.email,
        icon: "mail",
        keywords: "contact clipboard",
        run: () => {
          navigator.clipboard?.writeText(about.contact.email).catch(() => {});
          setCopied(true);
        },
      },
      { id: "a-vcard", group: "Actions", label: "Save my contact card (vCard)", icon: "user", href: about.contact.vcard, keywords: "phone contacts address book" },
      { id: "a-email", group: "Actions", label: "Send me an email", icon: "mail", href: `mailto:${about.contact.email}`, keywords: "contact" },
      { id: "a-github", group: "Actions", label: "Open my GitHub", icon: "github", href: about.contact.github, keywords: "code repos" },
      ...(about.contact.linkedin
        ? [{ id: "a-linkedin", group: "Actions" as const, label: "Open my LinkedIn", icon: "linkedin" as const, href: about.contact.linkedin }]
        : []),
    ],
    [copied],
  );

  // Open with Ctrl+K / ⌘K, or when another part of the site asks (navbar button, terminal)
  useEffect(() => {
    const open = () => {
      if (dialogRef.current?.open) return;
      setQuery("");
      setActive(0);
      setCopied(false);
      dialogRef.current?.showModal();
      inputRef.current?.focus();
      document.documentElement.style.overflow = "hidden";
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("palette:open", open);
    onReady?.();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("palette:open", open);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once, when the palette first appears
  }, []);

  // Projects live in Supabase, so they are loaded the first time the palette opens.
  // The Supabase library is only downloaded at that moment, which keeps every page fast.
  async function loadProjects() {
    if (projects.length) return;
    try {
      const { getBrowserClient } = await import("@/lib/supabase");
      const { data } = await getBrowserClient()
        .from("projects")
        .select("id, title, summary, tags, case_study_url")
        .order("sort_order", { ascending: true });
      setProjects(
        ((data ?? []) as ProjectRow[]).map((p) => ({
          id: `pr-${p.id}`,
          group: "Projects",
          label: p.title,
          hint: p.case_study_url ? "Case study" : p.tags.slice(0, 3).join(" · "),
          keywords: `${p.summary ?? ""} ${p.tags.join(" ")}`,
          icon: "cube",
          href: p.case_study_url || `/projects/${slugify(p.title)}`,
        })),
      );
    } catch {
      // No projects in the palette if Supabase can't be reached; everything else still works
    }
  }

  // Every word typed must appear somewhere in the item's text
  const results = useMemo(() => {
    const all = [...pages, ...projects, ...noteItems, ...actions, ...skills, ...certificates];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = words.length
      ? all.filter((item) => {
          const text = `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.group}`.toLowerCase();
          return words.every((w) => text.includes(w));
        })
      : all.filter((item) => item.group !== "Skills" && item.group !== "Certificates" && item.group !== "Notes");
    return groupOrder.flatMap((g) => matches.filter((m) => m.group === g)).slice(0, 40);
  }, [query, projects, actions]);

  // Keep the highlighted result on screen
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function choose(item: Item) {
    if (item.run) {
      item.run();
      if (item.id !== "a-copy") close();
      return;
    }
    if (!item.href) return;
    close();
    if (item.href.startsWith("http") || item.href.startsWith("mailto:")) {
      window.open(item.href, item.href.startsWith("http") ? "_blank" : "_self", "noopener,noreferrer");
    } else if (/\.[a-z0-9]+$/i.test(item.href)) {
      // A file on my site (like my contact card) is downloaded, not opened as a page
      window.location.href = item.href;
    } else {
      router.push(item.href);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(results.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) choose(item);
    }
  }

  const activeItem = results[active];

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search the site"
      onClose={() => {
        document.documentElement.style.overflow = "";
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      // Load projects as soon as it opens (the input gets focus straight away)
      onFocus={loadProjects}
      className="mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl border border-line-strong bg-panel p-0 text-snow shadow-2xl shadow-black/60 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      <div className="fx-zoom">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="h-5 w-5 shrink-0 text-teal" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, projects, skills…"
            role="combobox"
            aria-label="Search the site"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? `palette-${activeItem.id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent py-4 text-base text-snow outline-none placeholder:text-mist"
          />
          <kbd className="hidden rounded border border-line-strong px-1.5 py-0.5 font-mono text-[11px] text-mist sm:block">Esc</kbd>
        </div>

        <div ref={listRef} id="palette-results" role="listbox" aria-label="Results" className="max-h-[min(60vh,26rem)] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-mist">
              No results for “{query}”. Try a skill like “React” or a project name.
            </p>
          )}
          {groupOrder.map((group) => {
            const items = results.filter((r) => r.group === group);
            if (!items.length) return null;
            return (
              <div key={group} role="group" aria-labelledby={`palette-group-${group}`} className="mb-1">
                <p
                  id={`palette-group-${group}`}
                  className="px-3 pb-1 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-mist"
                >
                  {group}
                </p>
                {items.map((item) => {
                  const index = results.indexOf(item);
                  const selected = index === active;
                  return (
                    <div
                      key={item.id}
                      id={`palette-${item.id}`}
                      role="option"
                      aria-selected={selected}
                      data-index={index}
                      onMouseMove={() => setActive(index)}
                      onClick={() => choose(item)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${
                        selected ? "bg-teal/10 text-snow" : "text-snow"
                      }`}
                    >
                      <Icon name={item.icon} className={`h-4 w-4 shrink-0 ${selected ? "text-teal" : "text-mist"}`} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.hint && <span className="hidden shrink-0 truncate text-xs text-mist sm:block sm:max-w-[45%]">{item.hint}</span>}
                      {selected && <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-teal" />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4 py-2.5 font-mono text-[11px] text-mist">
          <span>↑ ↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
          <span className="ml-auto hidden sm:block">Ctrl K anywhere</span>
        </div>
      </div>
    </dialog>
  );
}
