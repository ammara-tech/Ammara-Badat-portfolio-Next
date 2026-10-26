import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";
import { notes } from "@/content/notes";

/*
  Docs checks: these fail if my README or Docs/how-it-works.md fall behind the code.
  My docs went stale once (they still said "one table" after I had added three),
  so now GitHub checks them on every push, like the rest of my tests.
*/

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const readme = read("README.md");

// Every file name in the project (skipping installed packages and build output)
const skip = new Set(["node_modules", ".git", ".next", ".vercel"]);
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}
const fileNames = new Set(walk("").map((f) => basename(f)));

// Names in my docs that look like files but aren't (with the reason)
const notFiles = new Set([
  "developer.ts", // the title shown on the code card on my Home page, not a real file
]);

const numberWords = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
  "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven",
  "twenty-eight", "twenty-nine", "thirty"];

/** Files a document points to: Markdown links, and `code` that looks like a file path */
function referencedFiles(markdown: string) {
  const links = [...markdown.matchAll(/\]\(([^)\s]+)\)/g)]
    .map((m) => m[1])
    .filter((l) => !/^(https?:|#|mailto:)/.test(l))
    .map((l) => decodeURIComponent(l.split("#")[0]));
  const code = [...markdown.matchAll(/`([^`\s]+)`/g)]
    .map((m) => m[1])
    .filter((c) => !c.startsWith("/") && !c.includes("...") && !c.startsWith("http"))
    .filter((c) => /\.(tsx?|sql|md|ya?ml|json|css|mjs)$/.test(c) || c.endsWith("/"));
  return { links, code };
}

function missingIn(doc: string) {
  const { links, code } = referencedFiles(read(doc));
  const missing: string[] = [];
  for (const link of links) {
    if (!existsSync(join(root, normalize(join(dirname(doc), link))))) missing.push(link);
  }
  for (const ref of code) {
    if (notFiles.has(ref)) continue;
    // A folder ("lib/") or a path ("lib/seo.ts") must exist from the project root;
    // a bare file name ("Inbox.tsx") must exist somewhere in the project
    const found = ref.endsWith("/") || ref.includes("/") ? existsSync(join(root, ref)) : fileNames.has(ref);
    if (!found) missing.push(ref);
  }
  return missing;
}

describe("docs stay in step with the code", () => {
  it("the README's dev note count matches the real number of notes", () => {
    expect(readme).toContain(`**${notes.length} dev notes**`);
    expect(readme).toContain(`(${numberWords[notes.length]} so far)`);
  });

  it("every SQL file in Supabase/ is in the README's setup steps", () => {
    const sqlFiles = readdirSync(join(root, "Supabase")).filter((f) => f.endsWith(".sql"));
    const notListed = sqlFiles.filter((f) => !readme.includes(`\`${f}\``));
    expect(notListed).toEqual([]);
  });

  it("every file the README mentions really exists", () => {
    expect(missingIn("README.md")).toEqual([]);
  });

  it("every file the code guide (Docs/how-it-works.md) mentions really exists", () => {
    expect(missingIn("Docs/how-it-works.md")).toEqual([]);
  });
});
