import { describe, it, expect } from "vitest";
import { PAGE_ITEMS, variedOrder } from "@/lib/libraryItems";

/* HOME's landing-pages row: random, but never two of a kind close together */
describe("variedOrder", () => {
  it.each(Array.from({ length: 25 }, (_, i) => i))("run %i keeps every page and spaces them out", () => {
    const run = variedOrder(PAGE_ITEMS);
    expect(new Set(run.map((it) => it.key)).size).toBe(PAGE_ITEMS.length);
    const shown = run.slice(0, 14); // what the row shows
    for (let i = 1; i < shown.length; i++) {
      const [a, b] = [shown[i - 1], shown[i]];
      if (a.theme && b.theme) expect(a.theme, `${a.title} → ${b.title}`).not.toBe(b.theme);
      for (const p of shown.slice(Math.max(0, i - 2), i)) {
        expect(p.looks.filter((l) => shown[i].looks.includes(l)), `${p.title} ~ ${shown[i].title}`).toEqual([]);
      }
    }
  });
});
