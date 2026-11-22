/**
 * A site event: a DataFast custom goal (the script in index.html defines
 * window.datafast) and the same event in PostHog (src/lib/posthog.ts), so both
 * dashboards see every copy, open and download. Names are lowercase with
 * underscores; property values are strings. Never throws: analytics must not
 * break a click, and on the dev server or with a blocker the scripts are simply
 * absent.
 */
export function track(goal: string, props?: Record<string, string>) {
  try {
    (window as unknown as { datafast?: (g: string, p?: Record<string, string>) => void }).datafast?.(goal, props);
  } catch {
    /* ignore */
  }
  try {
    window.posthog?.capture(goal, props);
  } catch {
    /* ignore */
  }
}
