"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";
import { historyButtons, type NavigationInfo } from "@/lib/nav-arrows";

/*
  Back, Forward and Refresh buttons on the site itself, like the ones in a browser.
  They matter most when the portfolio is installed on a phone's home screen, where
  there is no browser bar at all.

  variant "bar":  three round icon buttons next to my name (laptops and desktops)
  variant "menu": the same three with words, at the top of the phone menu
*/

type NavigationApi = NavigationInfo & {
  addEventListener(type: string, fn: () => void): void;
  removeEventListener(type: string, fn: () => void): void;
};

export default function NavArrows({ variant = "bar", onUse }: { variant?: "bar" | "menu"; onUse?: () => void }) {
  const pathname = usePathname();
  const [state, setState] = useState({ canBack: false, canForward: false });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const navigation = (window as unknown as { navigation?: NavigationApi }).navigation;
    const update = () => setState(historyButtons(navigation, window.history.length));
    update();
    // Chrome and Edge tell us every time the current page in the history changes
    navigation?.addEventListener("currententrychange", update);
    return () => navigation?.removeEventListener("currententrychange", update);
  }, [pathname]);

  function back() {
    onUse?.();
    window.history.back();
  }
  function forward() {
    onUse?.();
    window.history.forward();
  }
  function refresh() {
    setRefreshing(true); // spins the icon until the page reloads
    window.location.reload();
  }

  const buttons = [
    { label: "Back", aria: "Go back", title: "Back (Alt + Left arrow)", icon: "arrow-left" as const, onClick: back, disabled: !state.canBack },
    { label: "Forward", aria: "Go forward", title: "Forward (Alt + Right arrow)", icon: "arrow-right" as const, onClick: forward, disabled: !state.canForward },
    { label: "Refresh", aria: "Refresh this page", title: "Refresh (F5)", icon: "refresh" as const, onClick: refresh, disabled: false },
  ];

  if (variant === "menu") {
    return (
      <div role="group" aria-label="Page navigation" className="flex gap-2">
        {buttons.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            disabled={b.disabled}
            aria-label={b.aria}
            className="flex flex-1 items-center justify-center gap-2 rounded border border-line-strong px-2 py-2 text-mist transition hover:border-teal hover:text-teal disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-mist"
          >
            <Icon name={b.icon} className={`h-4 w-4 ${b.icon === "refresh" && refreshing ? "animate-spin" : ""}`} />
            {b.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div role="group" aria-label="Page navigation" className="flex items-center gap-0.5">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          onClick={b.onClick}
          disabled={b.disabled}
          aria-label={b.aria}
          title={b.title}
          className="rounded-full p-1.5 text-mist transition hover:bg-panel hover:text-teal disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-mist"
        >
          <Icon name={b.icon} className={`h-4 w-4 ${b.icon === "refresh" && refreshing ? "animate-spin" : ""}`} />
        </button>
      ))}
    </div>
  );
}
