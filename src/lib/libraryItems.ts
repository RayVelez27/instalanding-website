import { feedPrompts, type PromptEntry } from "@/data/prompts";
import { motions, type MotionEntry } from "@/data/motion";
import { systemCover, systems, type SystemEntry } from "@/data/systems";

/**
 * The library as one list of cards: every page, motion study and design
 * system, with what a card shows, where it links, the words search matches
 * and the HTML file COPY CODE copies. HOME's rails and the top-bar search both read
 * it. The data is static, so it is laid out once per load, newest first.
 */
export type Kind = "page" | "motion" | "system";
export interface Item {
  kind: Kind;
  key: string;
  title: string;
  sub: string;
  image: string;
  to: string;
  words: string;
  /** The single HTML file COPY CODE copies: the demo, the motion study, the system's specimen */
  code: string;
  /** dark / light, and the look words, for dealing a varied order */
  theme?: string;
  looks: string[];
}

const day = (added?: string) => (added ? Date.parse(added) || 0 : 0);
export const newest = <T extends { added?: string }>(list: readonly T[]) =>
  [...list].sort((a, b) => day(b.added) - day(a.added));

const pageItem = (p: PromptEntry): Item => ({
  kind: "page",
  key: `p:${p.slug}`,
  title: p.title.replace(/ Landing Page$| Page$/, ""),
  sub:
    (p.style ?? [])
      .filter((s) => s !== "dark" && s !== "light")
      .slice(0, 2)
      .join(" · ")
      .replace(/-/g, " ") || p.categoryLabel,
  image: p.thumbnail ?? "",
  to: `/prompt/${p.slug}`,
  words: [
    p.title,
    p.description,
    ...(p.style ?? []),
    ...(p.bestFor ?? []),
    p.theme ?? "",
  ]
    .join(" ")
    .toLowerCase(),
  code: p.demo ?? "",
  theme: p.theme,
  looks: (p.style ?? []).filter((s) => s !== "dark" && s !== "light"),
});
const motionItem = (m: MotionEntry): Item => ({
  kind: "motion",
  key: `m:${m.slug}`,
  title: m.title,
  sub: `${m.kind.toLowerCase()} · ${m.tracks.length} tracks · ${m.life}s`,
  image: m.poster,
  to: `/motion/${m.slug}`,
  words: [m.title, m.tagline, m.kind, m.theme, ...m.tags, ...m.bestFor]
    .join(" ")
    .toLowerCase(),
  code: m.demo,
  theme: m.theme,
  looks: m.tags,
});
const systemItem = (s: SystemEntry): Item => ({
  kind: "system",
  key: `s:${s.slug}`,
  title: s.name,
  sub: `${s.components.length} components · ${s.theme}`,
  image: systemCover(s),
  to: `/systems/${s.slug}`,
  words: [s.name, s.tagline, s.description, s.theme, ...s.tags]
    .join(" ")
    .toLowerCase(),
  code: s.files.specimen,
  theme: s.theme,
  looks: s.tags,
});

export const LABEL: Record<Kind, string> = {
  page: "PAGE",
  motion: "MOTION",
  system: "SYSTEM",
};

/* The data is static, so it is laid out once per load. Newest first. */
export const PAGES = newest(
  feedPrompts.filter((p) => !p.youtube && p.thumbnail && p.demo),
);
export const PAGE_ITEMS = PAGES.map(pageItem);
export const MOTION_ITEMS = newest(motions).map(motionItem);
export const SYSTEM_ITEMS = newest(systems).map(systemItem);
export const EVERYTHING = [...PAGE_ITEMS, ...MOTION_ITEMS, ...SYSTEM_ITEMS];

/**
 * A random order with variety: dark and light alternate, and no item shares
 * a look (glassmorphism, webgl, editorial, …) with either of the two before
 * it. Built greedily from a shuffle; when nothing fits it relaxes the look
 * rule first, then the theme rule, so every item still appears.
 */
export const variedOrder = (items: readonly Item[]): Item[] => {
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const out: Item[] = [];
  const clash = (a: Item, b: Item) => a.looks.some((l) => b.looks.includes(l));
  while (pool.length) {
    const prev = out.slice(-2);
    const last = prev[prev.length - 1];
    const fits = (it: Item, strictLooks: boolean, strictTheme: boolean) =>
      (!strictTheme || !last || !it.theme || it.theme !== last.theme) &&
      (!strictLooks || prev.every((p) => !clash(p, it)));
    const i =
      [ [true, true], [false, true], [true, false], [false, false] ]
        .map(([l, t]) => pool.findIndex((it) => fits(it, l, t)))
        .find((k) => k >= 0) ?? 0;
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
};
