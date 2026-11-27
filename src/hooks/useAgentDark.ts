import { useLayoutEffect } from "react";
import { useAgentMode } from "@/lib/agentMode";
import { useTheme } from "@/lib/theme";

/**
 * The theme is the visitor's choice (light by default; see lib/theme.ts and the
 * pre-paint script in index.html). Dark is <html class="dark agent-dark">.
 * Agent Mode adds its twist on top in either theme (html.agent-on: mint
 * accents and scanlines; on dark, a green-charcoal ground).
 *
 * useThemeClasses runs once at the app root. useAgentDark stays for the pages
 * that read the mode; it no longer touches the DOM.
 */
export function useAgentDark() {
  return useAgentMode();
}

export function useThemeClasses() {
  const agent = useAgentMode();
  const theme = useTheme();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const dark = theme === "dark";
    root.classList.toggle("dark", dark);
    root.classList.toggle("agent-dark", dark);
    root.classList.toggle("agent-on", agent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#141518" : "#ffffff");
  }, [agent, theme]);
}
