"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { getTheme, setTheme, type Theme } from "@/lib/theme";

/** Sun / moon button in the navbar. Remembers the choice in localStorage. */
export default function ThemeToggle() {
  const [theme, setLocal] = useState<Theme>("dark");

  useEffect(() => {
    setLocal(getTheme());
    // The terminal's "theme" command can change it too
    const onChange = () => setLocal(getTheme());
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(next, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="group rounded-full border border-line-strong p-2 text-mist transition hover:border-teal hover:text-teal"
    >
      <Icon
        name={theme === "dark" ? "sun" : "moon"}
        className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45"
      />
    </button>
  );
}
