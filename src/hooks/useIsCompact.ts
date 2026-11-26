import { useSyncExternalStore } from "react";

/**
 * True on phones and tablets: where an item (page, product, video, motion
 * study, design system) opens as the bottom sheet rather than the desktop
 * dialog. Up to 1100px wide, and touch screens up to 1400px so an iPad in
 * landscape gets the sheet too. Read synchronously, like useIsPhone, so the
 * first render is already the right container.
 */
const QUERY = "(max-width: 1100px), (pointer: coarse) and (max-width: 1400px)";

const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
};

export const isCompact = () => typeof window !== "undefined" && window.matchMedia(QUERY).matches;

export const useIsCompact = () => useSyncExternalStore(subscribe, isCompact, () => false);
