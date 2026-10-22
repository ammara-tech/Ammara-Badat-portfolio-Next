/*
  Animations on or off.
  A visitor can switch animations off with the switch in the footer (or Ctrl+K,
  or the terminal's "motion" command). The choice is saved in localStorage and
  applied before the page paints, by the same small script as the theme
  (lib/theme.ts). Devices that ask for reduced motion always get it, whatever the switch says.
*/

const KEY = "motion";

/** True when the device itself asks for less motion (an accessibility or battery setting) */
export function deviceReducesMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when animations should not play, for either reason */
export function motionReduced() {
  return document.documentElement.dataset.motion === "reduced" || deviceReducesMotion();
}

export function setMotion(on: boolean) {
  const root = document.documentElement;
  if (on) delete root.dataset.motion;
  else root.dataset.motion = "reduced";
  try {
    if (on) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, "reduced");
  } catch {
    // private mode: the choice just won't be remembered
  }
  window.dispatchEvent(new CustomEvent("motionchange", { detail: on }));
}
