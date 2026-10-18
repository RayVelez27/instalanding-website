import type { PromptEntry } from "@/data/prompts";

/**
 * The feed's filter tags come from each entry's own `style` list, so a new
 * template adds itself to the row. Spellings of the same idea are merged, and
 * a tag needs at least two templates to earn a chip.
 */
const ALIAS: Record<string, string> = {
  threejs: "three.js",
  glass: "glassmorphism",
  "amber-accent": "amber",
  "dark-mode": "dark",
  claymorphism: "clay",
};

const MIN = 2;

// Dark and light come from the entry's theme (what the page really is); style
// lists sometimes describe a palette rather than the theme, so those two are dropped there
export const tagsOf = (p: PromptEntry) => [
  ...new Set([
    ...(p.theme ? [p.theme] : []),
    ...(p.style ?? []).map((t) => ALIAS[t] ?? t).filter((t) => t !== "dark" && t !== "light"),
  ]),
];

/** Dark and light first, then the rest by how many items they cover. */
export function rankTags(lists: readonly string[][], min = 1) {
  const count = new Map<string, number>();
  for (const tags of lists) for (const t of tags) count.set(t, (count.get(t) ?? 0) + 1);
  const rank = (t: string) => (t === "dark" ? 0 : t === "light" ? 1 : 2);
  return [...count.entries()]
    .filter(([, n]) => n >= min)
    .sort((a, b) => rank(a[0]) - rank(b[0]) || b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, n]) => ({ tag, n }));
}

export const feedTags = (list: readonly PromptEntry[]) => rankTags(list.map(tagsOf), MIN);

/** A design system's chips: its theme, then its own tags (there are few systems, so every tag counts). */
export const systemTagsOf = (s: { theme: string; tags: readonly string[] }) => [
  ...new Set([s.theme, ...s.tags.map((t) => t.toLowerCase()).filter((t) => t !== "dark" && t !== "light")]),
];
