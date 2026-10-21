"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { about } from "@/content/about";
import { skillGroups } from "@/content/skills";
import { certificationGroups } from "@/content/certifications";
import { getTheme, setTheme } from "@/lib/theme";

/*
  The code card from my first portfolio, now a small terminal.
  The developer.ts lines still type themselves out, then visitors can type
  commands (or tap the quick buttons) to explore the site.
  Type "help" to see every command.
*/

// The code card, one line at a time. Each part: [text, colour class]
type Part = [string, string?];
const codeLines: Part[][] = [
  [["const", "text-racing-text"], [" developer = {"]],
  [["  name: "], [`"${about.name}"`, "text-teal"], [","]],
  [["  role: "], [`"${about.role}"`, "text-teal"], [","]],
  [["  stack: ["], ['"Next.js"', "text-teal"], [", "], ['"TypeScript"', "text-teal"], [", "], ['"Supabase"', "text-teal"], ["],"]],
  [["  status: "], ['"open to work"', "text-teal"], [","]],
  [["};"]],
];

// One line of terminal output. A line can hold a link.
type Line = { text: string; tone?: "cmd" | "muted" | "accent" | "error"; href?: string; linkText?: string };

const pages: Record<string, string> = {
  home: "/",
  about: "/about",
  projects: "/projects",
  "case-study": "/projects/nextjs-dashboard",
  skills: "/skills",
  certificates: "/about#certifications",
  contact: "/contact",
};

const help: [string, string][] = [
  ["help", "list every command"],
  ["about", "who I am"],
  ["skills", "what I work with"],
  ["projects", "open my projects"],
  ["case-study", "open the capstone case study"],
  ["certs", "my certifications"],
  ["contact", "how to reach me"],
  ["cv", "download my CV"],
  ["github", "open my GitHub"],
  ["open <page>", "go to a page, e.g. open skills"],
  ["search", "search the whole site (Ctrl K)"],
  ["theme", "switch light / dark mode"],
  ["clear", "clear the screen"],
];

const commandNames = [...help.map(([c]) => c.split(" ")[0]), "ls", "whoami", "date", "echo", "sudo"];

const quick = ["help", "about", "skills", "projects", "cv"];

const tones: Record<NonNullable<Line["tone"]>, string> = {
  cmd: "text-snow",
  muted: "text-mist",
  accent: "text-teal",
  error: "text-racing-text",
};

export default function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  // Keep the newest output in view (scrolls the card only, not the page)
  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  function go(href: string, label: string): Line[] {
    window.setTimeout(() => router.push(href), 450);
    return [{ text: `Opening ${label}…`, tone: "accent" }];
  }

  function run(raw: string): Line[] | "clear" {
    const input = raw.trim();
    const [name = "", ...args] = input.split(/\s+/);
    const cmd = name.toLowerCase();
    const arg = args.join(" ");

    switch (cmd) {
      case "":
        return [];
      case "help":
        return [
          { text: "Commands:", tone: "muted" },
          ...help.map(([c, d]) => ({ text: `  ${c.padEnd(13)} ${d}`, tone: "cmd" as const })),
          { text: "Tip: ↑ and ↓ repeat commands, Tab finishes a word.", tone: "muted" },
        ];
      case "about":
      case "whoami":
        return [
          { text: `${about.name}, ${about.role}`, tone: "accent" },
          { text: `${about.location} · ${about.status}`, tone: "muted" },
          { text: about.intro, tone: "cmd" },
          { text: "More: ", tone: "muted", href: "/about", linkText: "/about" },
        ];
      case "skills":
        return [
          ...skillGroups.map((g) => ({ text: `${g.title}: ${g.skills.map((s) => s.name).join(", ")}`, tone: "cmd" as const })),
          { text: "Every skill links to proof: ", tone: "muted", href: "/skills", linkText: "/skills" },
        ];
      case "certs":
      case "certificates": {
        const total = certificationGroups.reduce((n, g) => n + g.certificates.length, 0);
        return [
          { text: `${total} certificates`, tone: "accent" },
          ...certificationGroups.map((g) => ({ text: `${g.issuer}: ${g.certificates.length}`, tone: "cmd" as const })),
          { text: "View them: ", tone: "muted", href: "/about#certifications", linkText: "/about#certifications" },
        ];
      }
      case "contact":
        return [
          { text: `Email  ${about.contact.email}`, tone: "cmd", href: `mailto:${about.contact.email}`, linkText: "send" },
          { text: `Phone  ${about.contact.phone}`, tone: "cmd" },
          { text: "Or use the form: ", tone: "muted", href: "/contact", linkText: "/contact" },
        ];
      case "cv": {
        const a = document.createElement("a");
        a.href = about.contact.cv;
        a.download = "";
        a.click();
        return [{ text: `Downloading ${about.contact.cv.split("/").pop()}…`, tone: "accent" }];
      }
      case "github":
        window.open(about.contact.github, "_blank", "noopener,noreferrer");
        return [{ text: `Opening ${about.contact.github.replace("https://", "")}…`, tone: "accent" }];
      case "projects":
        return go("/projects", "projects");
      case "case-study":
        return go("/projects/nextjs-dashboard", "the case study");
      case "ls":
        return [{ text: Object.keys(pages).join("   "), tone: "accent" }, { text: "Try: open <name>", tone: "muted" }];
      case "open":
      case "cd": {
        const target = arg.toLowerCase().replace(/^\/+/, "") || "home";
        if (pages[target]) return go(pages[target], target);
        return [{ text: `No page called "${arg}". Pages: ${Object.keys(pages).join(", ")}`, tone: "error" }];
      }
      case "theme": {
        const wanted = arg.toLowerCase();
        const next = wanted === "light" || wanted === "dark" ? wanted : getTheme() === "dark" ? "light" : "dark";
        setTheme(next);
        return [{ text: `Switched to ${next} mode.`, tone: "accent" }];
      }
      case "search":
        window.dispatchEvent(new Event("palette:open"));
        return [{ text: "Opening search… (tip: Ctrl K works on every page)", tone: "accent" }];
      case "date":
        return [{ text: new Date().toLocaleString("en-ZA", { dateStyle: "full", timeStyle: "short" }), tone: "cmd" }];
      case "echo":
        return [{ text: arg, tone: "cmd" }];
      case "sudo":
        return [
          { text: "Permission denied. Only one person has admin here 😉", tone: "error" },
          { text: "But you can still hire me: ", tone: "muted", href: "/contact", linkText: "contact" },
        ];
      case "clear":
        return "clear";
      default:
        return [{ text: `command not found: ${name}. Type "help" to see what I understand.`, tone: "error" }];
    }
  }

  function submit(command: string) {
    const result = run(command);
    if (command.trim()) {
      setHistory((h) => [...h.filter((c) => c !== command.trim()), command.trim()]);
    }
    setHistoryIndex(-1);
    setValue("");
    if (result === "clear") {
      setLines([]);
      return;
    }
    const echo: Line = { text: `$ ${command}`, tone: "cmd" };
    setLines((l) => [...l, echo, ...result].slice(-80)); // keep the last 80 lines
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(value);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(i);
      setValue(history[i]);
    } else if (e.key === "ArrowDown" && historyIndex !== -1) {
      e.preventDefault();
      const i = historyIndex + 1;
      if (i >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(i);
        setValue(history[i]);
      }
    } else if (e.key === "Tab" && value.trim() && !value.includes(" ")) {
      // Only take over Tab when there is a word to finish, so keyboard users can still Tab away
      const match = commandNames.find((c) => c.startsWith(value.trim().toLowerCase()));
      if (match && match !== value) {
        e.preventDefault();
        setValue(match);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line-strong bg-panel/90 shadow-2xl shadow-black/40 backdrop-blur">
      {/* Window bar */}
      <div className="flex items-center gap-2 border-b border-line bg-panel-alt px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-racing" />
        <span className="h-3 w-3 rounded-full bg-mist-dim" />
        <span className="h-3 w-3 rounded-full bg-teal" />
        <span className="ml-3 font-mono text-xs text-mist">developer.ts — terminal</span>
      </div>

      {/* Clicking anywhere on the screen puts the cursor in the input */}
      <div
        ref={screenRef}
        onClick={() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }}
        className="max-h-[22rem] overflow-y-auto p-4 font-mono text-[11px] leading-6 text-snow sm:p-5 sm:text-[13px] sm:leading-7"
      >
        <pre className="overflow-x-auto" aria-label="Code card describing me">
          <code>
            {codeLines.map((line, i) => (
              <span key={i} className="fx-type block" style={{ animationDelay: `${700 + i * 220}ms` }}>
                {line.map(([text, colour], j) => (
                  <span key={j} className={colour}>
                    {text}
                  </span>
                ))}
              </span>
            ))}
          </code>
        </pre>
        <p className="fx-type text-mist-dim" style={{ animationDelay: `${700 + codeLines.length * 220}ms` }}>
          {'// type "help" or tap a command below'}
        </p>

        {/* Output */}
        <div role="log" aria-live="polite" aria-label="Terminal output" className="mt-2">
          {lines.map((line, i) => (
            <p key={i} className={`whitespace-pre-wrap break-words ${tones[line.tone ?? "cmd"]}`}>
              {line.text}
              {line.href &&
                (line.href.startsWith("/") ? (
                  <Link href={line.href} className="text-teal underline underline-offset-2 hover:text-snow">
                    {line.linkText}
                  </Link>
                ) : (
                  <a href={line.href} className="ml-2 text-teal underline underline-offset-2 hover:text-snow">
                    {line.linkText}
                  </a>
                ))}
            </p>
          ))}
        </div>

        {/* Prompt */}
        <form
          onSubmit={onSubmit}
          className="fx-type flex items-center gap-2"
          style={{ animationDelay: `${900 + codeLines.length * 220}ms` }}
        >
          <label htmlFor="terminal-input" className="shrink-0 text-teal">
            <span aria-hidden="true">~ $</span>
            <span className="sr-only">Type a command, for example help</span>
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            placeholder="help"
            className="min-w-0 flex-1 bg-transparent text-base text-snow caret-teal outline-none focus-visible:shadow-[inset_0_-1px_0_var(--color-teal)] placeholder:text-mist-dim sm:text-[13px]"
          />
        </form>
      </div>

      {/* Quick commands for phones and mouse users */}
      <div className="flex flex-wrap gap-2 border-t border-line bg-panel-alt/60 px-4 py-3">
        {quick.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => submit(c)}
            className="rounded border border-line-strong px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-mist transition hover:border-teal hover:text-teal"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
