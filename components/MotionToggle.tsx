"use client";

import { useEffect, useState } from "react";
import { deviceReducesMotion, setMotion } from "@/lib/motion";

/*
  Footer switch: "Animations on / off".
  Added after peer review, when a classmate said the site has a lot of animation
  for someone who likes a minimal style. Now each visitor can choose.
*/
export default function MotionToggle() {
  const [on, setOn] = useState(true);
  const [device, setDevice] = useState(false);

  useEffect(() => {
    const sync = () => {
      setDevice(deviceReducesMotion());
      setOn(document.documentElement.dataset.motion !== "reduced");
    };
    sync();
    window.addEventListener("motionchange", sync);
    return () => window.removeEventListener("motionchange", sync);
  }, []);

  if (device) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-widest text-mist">Animations off · set by your device</p>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setMotion(!on)}
      className="group flex items-center gap-3 rounded-full border border-line-strong py-1.5 pl-3 pr-1.5 font-mono text-[11px] uppercase tracking-widest text-mist transition hover:border-teal hover:text-snow"
    >
      Animations
      <span
        aria-hidden="true"
        className={`relative block h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-teal" : "bg-line-strong"}`}
      >
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-ink transition-transform ${on ? "translate-x-4.5" : "translate-x-0.5"}`}
        />
      </span>
      <span className="w-6 text-left">{on ? "On" : "Off"}</span>
    </button>
  );
}
