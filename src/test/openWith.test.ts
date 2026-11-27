import { describe, it, expect } from "vitest";
import { AGENTS, MAX_LINK, agentPrompt, itemSource } from "@/lib/openWith";
import { prompts } from "@/data/prompts";
import { motions } from "@/data/motion";
import { systems } from "@/data/systems";
import { products } from "@/data/products";
import { videos } from "@/data/videos";
import { iconSets } from "@/data/icons";
import type { SheetKind } from "@/components/ItemSheet";

const items: [SheetKind, string, string][] = [
  ...prompts.filter((p) => p.demo).map((p) => ["page", p.slug, p.title] as [SheetKind, string, string]),
  ...motions.map((m) => ["motion", m.slug, m.title] as [SheetKind, string, string]),
  ...systems.map((s) => ["system", s.slug, s.name] as [SheetKind, string, string]),
  ...products.map((p) => ["product", p.slug, p.title] as [SheetKind, string, string]),
  ...videos.map((v) => ["video", v.slug, v.title] as [SheetKind, string, string]),
  ...iconSets.map((s) => ["icons", s.slug, s.title] as [SheetKind, string, string]),
];

describe("open with your agent", () => {
  it("covers every kind of item", () => {
    expect(new Set(items.map(([k]) => k)).size).toBe(6);
  });

  it.each(items)("%s %s: every link carries the prompt intact and stays short", (kind, slug, title) => {
    const prompt = agentPrompt(kind, slug, title);
    expect(prompt).toContain(itemSource(kind, slug));
    for (const a of AGENTS) {
      if (!a.link) continue;
      const url = a.link(prompt);
      expect(url.length, a.id).toBeLessThan(MAX_LINK);
      const encoded = url.split(/[?#](?:q|prompt)=/)[1];
      expect(decodeURIComponent(encoded), a.id).toBe(prompt);
    }
  });

  it("points pages, motion and systems at their plain-text briefs", () => {
    expect(itemSource("page", "x")).toBe("https://instalanding.ai/p/x.txt");
    expect(itemSource("motion", "x")).toBe("https://instalanding.ai/m/x.txt");
    expect(itemSource("system", "x")).toBe("https://instalanding.ai/s/x.txt");
  });

  it("copies instead of linking for the desk tools", () => {
    for (const id of ["cursor", "hermes"]) {
      const a = AGENTS.find((x) => x.id === id)!;
      expect(a.link).toBeUndefined();
      expect(a.copyNote).toBeTruthy();
    }
  });
});
