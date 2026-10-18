import { useSyncExternalStore } from "react";

/**
 * True at phone widths (the same 720px breakpoint as the phone feed). Read
 * synchronously, unlike useIsMobile, so the first render is already the right
 * layout: the prompt page must not mount the desktop live preview on a phone
 * and then swap it out.
 */
const QUERY = "(max-width: 720px)";

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

export const isPhone = () => typeof window !== "undefined" && window.matchMedia(QUERY).matches;

export const useIsPhone = () => useSyncExternalStore(subscribe, isPhone, () => false);
