import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { systems, getSystemForTemplate } from "@/data/systems";
import { getPromptBySlug } from "@/data/prompts";
import { parseTokens, customizedTokens, shade } from "@/lib/systemSpecimen";

const pub = (p: string) => resolve(__dirname, "../../public", p.replace(/^\//, ""));

/* Systems are generated files plus a hand-written entry; these keep the two honest. */
describe.each(systems)("system $slug", (system) => {
  const specimen = readFileSync(pub(system.files.specimen), "utf8");
  const block = (id: string) => {
    const open = `<style id="${id}">\n`;
    const a = specimen.indexOf(open);
    return specimen.slice(a + open.length, specimen.indexOf("</style>", a)).trim();
  };

  it("ships every file it points to", () => {
    for (const f of Object.values(system.files).flat()) expect(existsSync(pub(f)), f).toBe(true);
  });

  it("lists the same components, in order, as the specimen", () => {
    const ids = [...specimen.matchAll(/<section [^>]*data-component="([^"]+)"[^>]*data-label="([^"]+)"/g)].map((m) => [m[1], m[2]]);
    expect(ids).toEqual(system.components.map((c) => [c.id, c.label]));
  });

  it("serves tokens.css and the system CSS straight from the specimen", () => {
    const tokens = block(`${system.prefix}-tokens`);
    expect(readFileSync(pub(system.files.tokens), "utf8").trim()).toBe(tokens);
    const css = readFileSync(pub(system.files.css), "utf8");
    expect(css.startsWith(tokens)).toBe(true);
    expect(css).toContain(block(`${system.prefix}-components`));
  });

  it("only offers playground controls and palette colours the tokens define", () => {
    const values = new Map(parseTokens(block(`${system.prefix}-tokens`)).flatMap((g) => g.tokens.map((t) => [t.name, t.value] as const)));
    for (const c of system.playground) {
      expect(values.has(c.token), c.token).toBe(true);
      for (const f of c.follow ?? []) expect(values.has(f.token), f.token).toBe(true);
    }
    const all = new Set([...values.values()].map((v) => v.toUpperCase()));
    for (const hex of system.palette) expect(all.has(hex.toUpperCase()), hex).toBe(true);
  });

  it("links both ways with real templates", () => {
    for (const slug of system.templates) {
      expect(getPromptBySlug(slug), slug).toBeDefined();
      expect(getSystemForTemplate(slug)?.slug).toBe(system.slug);
    }
  });

  it("scopes its component classes under its prefix", () => {
    const css = block(`${system.prefix}-components`);
    const bare = [...css.matchAll(/(?:^|[\s,{}>+~])\.([a-z][\w-]*)/g)].map((m) => m[1]).filter((c) => !c.startsWith(`${system.prefix}-`) && c !== system.rootClass);
    expect(bare).toEqual([]);
  });

  it("never styles anything outside its root class", () => {
    // Every selector must sit under .<root> (or :where(.<root>)), so linking the CSS can't restyle a host page
    const css = block(`${system.prefix}-components`).replace(/\/\*[\s\S]*?\*\//g, "");
    const root = system.rootClass;
    const leaks: string[] = [];
    for (const m of css.matchAll(/([^{}@][^{}]*)\{/g)) {
      const sel = m[1].trim();
      if (!sel || sel.startsWith("@") || /^(from|to|\d)/.test(sel)) continue;
      for (const part of sel.split(",").map((x) => x.trim())) {
        if (part && !/^(from|to|\d)/.test(part) && !part.includes(`.${root}`)) leaks.push(part);
      }
    }
    expect(leaks).toEqual([]);
  });
});

describe("system helpers", () => {
  it("groups tokens by their comment headings", () => {
    const groups = parseTokens(":root {\n  /* Color · core */\n  --a: #000000;\n  --b: #FFFFFF;\n\n  /* Shape */\n  --r: 4px;\n}");
    expect(groups).toEqual([
      { title: "Color · core", tokens: [{ name: "--a", value: "#000000" }, { name: "--b", value: "#FFFFFF" }] },
      { title: "Shape", tokens: [{ name: "--r", value: "4px" }] },
    ]);
  });

  it("exports edited token values", () => {
    const css = ":root {\n  --a: #000000;\n  --ab: 1px;\n}";
    expect(customizedTokens(css, { "--a": "#FF0000" })).toBe(":root {\n  --a: #FF0000;\n  --ab: 1px;\n}");
  });

  it("shades toward black and white", () => {
    expect(shade("#FFFFFF", 0.5)).toBe("#808080");
    expect(shade("#000000", -0.5)).toBe("#808080");
    expect(shade("#ABCDEF", 0)).toBe("#ABCDEF");
  });
});
