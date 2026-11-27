import { useSyncExternalStore } from "react";

/**
 * Light or dark. Light is the default; the choice is saved in localStorage
 * and applied before first paint by the inline script in index.html (same key),
 * so a dark visit never flashes light. The dark theme is the html.agent-dark
 * layer in index.css (plus Tailwind's .dark variables); useThemeClasses at the
 * app root keeps <html> in step. Agent Mode adds its twist in either theme.
 */
export type Theme = "light" | "dark";

export const THEME_KEY = "instalanding.theme";

const read = (): Theme => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

let current: Theme = typeof window === "undefined" ? "light" : read();
const listeners = new Set<() => void>();

export const getTheme = () => current;

export const setTheme = (next: Theme) => {
  current = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage blocked: the choice lasts for this visit */
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTheme = () => useSyncExternalStore(subscribe, () => current, () => "light" as Theme);
