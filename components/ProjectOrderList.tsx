"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getBrowserClient, type Project } from "@/lib/supabase";
import Icon from "@/components/Icon";

/*
  The project list on /admin, in the order the Projects page shows them.
  Each project has a Live / Draft switch: drafts are hidden from visitors by RLS
  (Supabase/007-drafts-activity-log.sql), but still show here for me.
  Drag a project by its handle (mouse or finger) to a new place, or use the
  ↑ and ↓ buttons (keyboard and screen-reader friendly). The new order is saved
  to Supabase straight away, as each project's sort_order (0, 1, 2, ...).
  RLS makes sure only my account can save it.
*/

type Props = {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onSaved: () => void;
};

export default function ProjectOrderList({ projects, onEdit, onDelete, onSaved }: Props) {
  const [items, setItems] = useState(projects);
  const [dragId, setDragId] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "busy" | "ok" | "error"; text: string } | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const startOrder = useRef<string[]>([]);

  // Show fresh data from the database, except in the middle of a drag
  useEffect(() => {
    if (!dragId) setItems(projects);
  }, [projects, dragId]);

  async function save(next: Project[], movedTitle: string) {
    const changed = next
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => p.sort_order !== i);
    if (changed.length === 0) return;

    setStatus({ type: "busy", text: "Saving the new order…" });
    const supabase = getBrowserClient();
    const results = await Promise.all(
      changed.map(({ p, i }) => supabase.from("projects").update({ sort_order: i }).eq("id", p.id).select("id")),
    );

    const failed = results.find((r) => r.error || !r.data || r.data.length === 0);
    if (failed) {
      // RLS blocks updates silently, so no rows back means "not allowed"
      setStatus({ type: "error", text: failed.error?.message ?? "The order wasn't saved. You may not have permission." });
      setItems(projects);
      return;
    }

    const position = next.findIndex((p) => p.title === movedTitle) + 1;
    setStatus({ type: "ok", text: `Saved. "${movedTitle}" is now number ${position} of ${next.length}.` });
    onSaved();
  }

  async function togglePublished(project: Project) {
    const published = project.published === false; // the new value
    setStatus({ type: "busy", text: published ? `Publishing "${project.title}"…` : `Moving "${project.title}" to drafts…` });
    const { data, error } = await getBrowserClient()
      .from("projects")
      .update({ published })
      .eq("id", project.id)
      .select("id");
    if (error || !data || data.length === 0) {
      setStatus({ type: "error", text: error?.message ?? "Nothing was saved. You may not have permission." });
      return;
    }
    setItems((list) => list.map((p) => (p.id === project.id ? { ...p, published } : p)));
    setStatus({
      type: "ok",
      text: published ? `"${project.title}" is live on the Projects page.` : `"${project.title}" is now a draft. Only you can see it.`,
    });
    onSaved();
  }

  function move(index: number, step: number) {
    const target = index + step;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setItems(next);
    save(next, moved.title);
  }

  // ---------- Dragging with a mouse or finger ----------
  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, id: string) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startOrder.current = items.map((p) => p.id);
    setDragId(id);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragId) return;
    // Find which row the pointer is over, using the middle of each row
    const from = items.findIndex((p) => p.id === dragId);
    let to = from;
    items.forEach((p, i) => {
      const el = rows.current.get(p.id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (e.clientY > r.top && e.clientY < r.bottom) to = i;
    });
    if (to !== from) {
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setItems(next);
    }
  }

  function onPointerUp() {
    if (!dragId) return;
    const moved = items.find((p) => p.id === dragId);
    setDragId(null);
    const changed = items.some((p, i) => p.id !== startOrder.current[i]);
    if (moved && changed) save(items, moved.title);
  }

  return (
    <>
      <p className="mt-2 text-sm text-mist">
        Drag <Icon name="grip" className="inline h-4 w-4 align-text-bottom" /> to change the order on the Projects page, or use the arrows.
      </p>

      {status && (
        <p
          role={status.type === "error" ? "alert" : "status"}
          className={`mt-3 text-sm ${status.type === "error" ? "text-racing-text" : status.type === "ok" ? "text-teal" : "text-mist"}`}
        >
          {status.text}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {items.map((project, index) => (
          <li
            key={project.id}
            ref={(el) => {
              if (el) rows.current.set(project.id, el);
              else rows.current.delete(project.id);
            }}
            className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-panel p-4 transition-shadow ${
              dragId === project.id ? "relative z-10 border-teal shadow-2xl shadow-black/40" : "border-line"
            }`}
          >
            <div className="flex min-w-0 flex-1 basis-64 items-center gap-3">
              <button
                type="button"
                aria-label={`Drag to move ${project.title}`}
                onPointerDown={(e) => onPointerDown(e, project.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                tabIndex={-1}
                className={`shrink-0 touch-none rounded p-1.5 text-mist hover:text-teal ${dragId === project.id ? "cursor-grabbing text-teal" : "cursor-grab"}`}
              >
                <Icon name="grip" className="h-5 w-5" />
              </button>

              {project.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={project.image_url}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="hidden h-12 w-20 shrink-0 rounded border border-line object-cover object-top sm:block"
                />
              ) : (
                <span className="hidden h-12 w-20 shrink-0 items-center justify-center rounded border border-dashed border-line-strong sm:flex">
                  <Icon name="photo" className="h-5 w-5 text-mist-dim" />
                </span>
              )}
              <div className="min-w-0">
                <p className="font-medium">
                  <span className="mr-2 text-mist-dim">{index + 1}.</span>
                  {project.title}
                  {project.published === false && (
                    <span className="ml-2 rounded border border-line-strong px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-widest text-mist">
                      Draft
                    </span>
                  )}
                </p>
                {project.summary && <p className="mt-1 text-sm text-mist">{project.summary}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={project.published !== false}
                aria-label={`Published on my site: ${project.title}`}
                onClick={() => togglePublished(project)}
                className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest transition ${
                  project.published !== false
                    ? "border-teal/50 text-teal hover:bg-teal/10"
                    : "border-line-strong text-mist hover:border-teal hover:text-teal"
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 rounded-full ${project.published !== false ? "bg-teal" : "bg-line-strong"}`} />
                {project.published !== false ? "Live" : "Draft"}
              </button>
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${project.title} up`}
                className="rounded border border-line-strong p-1.5 text-mist hover:border-teal hover:text-teal disabled:opacity-30"
              >
                <Icon name="chevron-up" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move ${project.title} down`}
                className="rounded border border-line-strong p-1.5 text-mist hover:border-teal hover:text-teal disabled:opacity-30"
              >
                <Icon name="chevron-down" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="rounded border border-line-strong px-3 py-1 text-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="rounded border border-racing/50 px-3 py-1 text-sm text-racing-text"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
