"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { deviceReducesMotion, setMotion } from "@/lib/motion";

/*
  "Animations on / off" switch at the top of the page.
  Added after peer review, when a classmate said the site has a lot of animation
  for someone who likes a minimal style. Now each visitor can choose.

  variant "icon":   a round button next to the light/dark switch (tablet and desktop)
  variant "switch": a labelled on/off switch inside the phone menu
*/
export default function MotionToggle({ variant = "icon" }: { variant?: "icon" | "switch" }) {
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

  const label = device
    ? "Animations are off because your device asks for less motion"
    : `Animations ${on ? "on" : "off"}. Turn them ${on ? "off" : "on"}`;

  if (variant === "icon") {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on && !device}
        aria-label={label}
        title={label}
        disabled={device}
        onClick={() => setMotion(!on)}
        className="group rounded-full border border-line-strong p-2 text-mist transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon name={on && !device ? "sparkles" : "pause"} className="h-4 w-4" />
      </button>
    );
  }

  if (device) {
    return <p className="normal-case tracking-normal text-mist">Animations are off (set by your device)</p>;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setMotion(!on)}
      className="flex items-center gap-3 uppercase tracking-widest text-mist transition hover:text-snow"
    >
      Animations
      <span aria-hidden="true" className={`relative block h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-teal" : "bg-line-strong"}`}>
        <span
          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-ink transition-transform ${on ? "translate-x-4.5" : "translate-x-0.5"}`}
        />
      </span>
      <span className="w-6 text-left">{on ? "On" : "Off"}</span>
    </button>
  );
}
