import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { motions } from "@/data/motion";
import { EASES } from "@/lib/eases";
import { getPromptBySlug } from "@/data/prompts";

const pub = (p: string) => resolve(__dirname, "../../public", p.replace(/^\//, ""));

/* A motion entry is a demo file plus a hand-written choreography; these keep the two honest. */
describe.each(motions)("motion $slug", (m) => {
  const html = readFileSync(pub(m.demo), "utf8");

  it("ships its demo and poster outside /motion/, so the lab route is never shadowed", () => {
    for (const f of [m.demo, m.poster]) {
      expect(existsSync(pub(f))).toBe(true);
      expect(f.startsWith("/motion/")).toBe(false);
    }
  });

  it("takes every control the lab sends, and reports a status line", () => {
    expect(html).toContain("source !== 'il-motion'");
    expect(html).toMatch(/source: 'il-motion-demo', type: 'status'/);
    const ids = ["speed", "step", "autoplay", ...m.knobs.map((k) => k.id), ...m.toggles.map((t) => t.id)];
    for (const id of ids) expect(html, id).toContain(`d.type === '${id}'`);
  });

  it("keeps every track inside the drawn life, with an ease the lab can draw", () => {
    for (const t of m.tracks) {
      expect(t.start).toBeGreaterThanOrEqual(0);
      expect(t.end).toBeLessThanOrEqual(1);
      expect(t.end).toBeGreaterThan(t.start);
      expect(EASES[t.ease]).toBeTypeOf("function");
    }
  });

  it("pairs only with pages that exist and ship a demo", () => {
    expect(m.pairsWith.length).toBeGreaterThan(0);
    for (const slug of m.pairsWith) {
      const page = getPromptBySlug(slug);
      expect(page, slug).toBeDefined();
      expect(page?.demo, slug).toBeTruthy();
    }
  });

  it("starts every knob inside its own range", () => {
    for (const k of m.knobs) {
      expect(k.value).toBeGreaterThanOrEqual(k.min);
      expect(k.value).toBeLessThanOrEqual(k.max);
    }
  });
});

describe("eases", () => {
  it.each(Object.entries(EASES))("%s runs from 0 to 1", (_, f) => {
    expect(f(0)).toBeCloseTo(0);
    expect(f(1)).toBeCloseTo(1, 2);
  });

  it("elastic overshoots and the tighter period settles sooner", () => {
    const loose = EASES["elastic.out(1, 0.3)"];
    const tight = EASES["elastic.out(1, 0.6)"];
    const peak = (f: (t: number) => number) => Math.max(...Array.from({ length: 200 }, (_, i) => f(i / 200)));
    expect(peak(loose)).toBeGreaterThan(1);
    expect(Math.abs(tight(0.5) - 1)).toBeLessThan(0.05);
  });
});
