"use client";

import { useRef, useState, type DragEvent } from "react";
import { getBrowserClient } from "@/lib/supabase";
import Icon from "@/components/Icon";

/*
  Upload a project screenshot straight from /admin to Supabase Storage.
  The file goes into the "project-images" bucket (Supabase/005-project-images-storage.sql),
  and its public URL is put into the Image URL field of the form.
  Only my account can upload, because of the Storage RLS policies.
*/

const BUCKET = "project-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB, same limit as the bucket
const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

// "My Project (final).PNG" -> "my-project-final.png"
function safeName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase() : "png";
  return `${base || "image"}.${ext}`;
}

function friendlyError(message: string) {
  if (/bucket not found/i.test(message)) return "The storage bucket doesn't exist yet. Run Supabase/005-project-images-storage.sql first.";
  if (/row-level security|unauthorized|403/i.test(message)) return "Upload blocked: only the owner account can upload images.";
  if (/exceeded|too large|413/i.test(message)) return "That file is too big. The limit is 5 MB.";
  return message;
}

export default function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ type: "busy" | "ok" | "error"; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    if (!TYPES.includes(file.type)) {
      setStatus({ type: "error", text: "Please choose a PNG, JPG, WebP or GIF image." });
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus({ type: "error", text: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.` });
      return;
    }

    setStatus({ type: "busy", text: `Uploading ${file.name}…` });
    const supabase = getBrowserClient();
    // A timestamp in front keeps every file name unique, so nothing is overwritten
    const path = `projects/${Date.now()}-${safeName(file.name)}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (error) {
      setStatus({ type: "error", text: friendlyError(error.message) });
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
    setStatus({ type: "ok", text: "Uploaded. Save the project to keep it." });
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[10rem_1fr]">
      {/* Preview of the current image */}
      <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-line bg-ink">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Preview of the project image" className="h-full w-full object-cover object-top" />
        ) : (
          <Icon name="photo" className="h-8 w-8 text-mist-dim" />
        )}
      </div>

      <div>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed p-4 text-center transition focus-within:border-teal focus-within:ring-2 focus-within:ring-teal ${
            dragging ? "border-teal bg-teal/10" : "border-line-strong hover:border-teal"
          }`}
        >
          <Icon name="upload" className="h-5 w-5 text-teal" />
          <span className="text-sm text-snow">Drop an image here or click to upload</span>
          <span className="text-xs text-mist">PNG, JPG, WebP or GIF · up to 5 MB · saved to Supabase Storage</span>
          <input
            ref={inputRef}
            type="file"
            accept={TYPES.join(",")}
            disabled={status?.type === "busy"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
            className="sr-only"
          />
        </label>

        {status && (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={`mt-2 text-sm ${
              status.type === "error" ? "text-racing-text" : status.type === "ok" ? "text-teal" : "text-mist"
            }`}
          >
            {status.text}
          </p>
        )}
      </div>
    </div>
  );
}
