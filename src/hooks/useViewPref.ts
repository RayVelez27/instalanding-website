import { useState } from "react";

/**
 * A route's view switch (GRID, or its immersive second view), remembered per
 * visitor on this device. GRID is the default; the second view hides the
 * route's banner and filters, and the switch stays to come back.
 */
export function useViewPref<V extends string>(key: string, second: V) {
  const read = (): "grid" | V => {
    try {
      return localStorage.getItem(key) === second ? second : "grid";
    } catch {
      return "grid";
    }
  };
  const [view, setView] = useState<"grid" | V>(read);
  const pick = (v: "grid" | V) => {
    setView(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  };
  return [view, pick] as const;
}
