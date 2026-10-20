/**
 * A DataFast custom goal (the script in index.html defines window.datafast).
 * Names are lowercase with underscores; property values are strings. Never
 * throws: analytics must not break a click, and on the dev server or with a
 * blocker the script is simply absent.
 */
export function track(goal: string, props?: Record<string, string>) {
  try {
    (window as unknown as { datafast?: (g: string, p?: Record<string, string>) => void }).datafast?.(goal, props);
  } catch {
    /* ignore */
  }
}
