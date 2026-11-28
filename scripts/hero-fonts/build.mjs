// fonts.json (from extract.mjs) -> src/data/heroFonts.ts. Usage: node scripts/hero-fonts/build.mjs [out.ts] [fonts.json]
import fs from "node:fs"; import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const OUT = process.argv[2] ?? path.join(HERE, "../../src/data/heroFonts.ts");
const raw = JSON.parse(fs.readFileSync(process.argv[3] ?? path.join(HERE, "fonts.json"), "utf8"));

/** System and generic names: nothing to load */
const GENERIC = new Set(["system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto", "helvetica", "helvetica neue", "arial", "sans-serif", "serif", "monospace", "cursive", "fantasy", "ui-sans-serif", "ui-serif", "ui-monospace", "ui-rounded", "georgia", "times new roman", "times", "courier new", "courier", "menlo", "monaco", "consolas", "sf mono", "sf pro display", "sf pro text", "dejavu sans mono", "apple color emoji", "segoe ui emoji", "noto color emoji", "inherit", "initial"]);
/** Faces a file inlines under its own name, and the Google family they come from */
const ALIAS = { cygeist: "Geist", orbitronui: "Orbitron", "chivo mono ds": "Chivo Mono" };
/**
 * Families the site loads itself (src/index.css): never re-declared from an
 * item's stylesheet, or its weights would take over the site's own headings
 */
const SITE = new Set(["inter tight", "ibm plex mono"]);
/** A Google Fonts link without the site's families; null when nothing is left */
const withoutSite = (href) => {
  const u = new URL(href);
  const fams = u.searchParams.getAll("family").filter((f) => !SITE.has(f.split(":")[0].replace(/\+/g, " ").toLowerCase()));
  if (!fams.length) return null;
  u.searchParams.delete("family");
  const rest = u.searchParams.toString();
  return `${u.origin}${u.pathname}?${fams.map((f) => "family=" + encodeURIComponent(f).replace(/%20/g, "+").replace(/%3A/g, ":").replace(/%40/g, "@").replace(/%3B/g, ";").replace(/%2C/g, ",")).join("&")}${rest ? "&" + rest : ""}`;
};
/** The browser's default: the file never set a font for that text */
const DEFAULT_FACE = "times new roman";

/** Hand-tuned values that win over what was read from the file (key -> fields) */
const OVERRIDES = {
  // Its wide-tracked headline read too loose at the hero's size
  "m:maison-noir-disintegrate": { ls: 0.04 },
};

const names = (stack) => stack.split(",").map((f) => f.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
const quote = (f) => (GENERIC.has(f.toLowerCase()) && !/\s/.test(f) ? f : `'${f}'`);
/** A stack with aliases put first, at most five names */
const stackOf = (stack) => {
  const out = [];
  for (const f of names(stack)) {
    const a = ALIAS[f.toLowerCase()];
    if (a) out.push(a);
    out.push(f);
  }
  return [...new Set(out)].slice(0, 5).map(quote).join(", ");
};
const linkFor = (fam, links) =>
  links.find((l) => decodeURIComponent(l).replace(/\+/g, " ").toLowerCase().includes("family=" + fam.toLowerCase()));
const googleHref = (fam) => `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fam).replace(/%20/g, "+")}&display=swap`;

const rows = {};
const skipped = [];
for (const [key, v] of Object.entries(raw)) {
  const headFirst = v?.head ? names(v.head.family)[0]?.toLowerCase() : "";
  // No text to read (drawn on a canvas), or text the file never styled: the site font stays
  if (!v || v.error || !v.head || headFirst === DEFAULT_FACE) { skipped.push(key); continue; }
  const bodyStack = names(v.body.family)[0]?.toLowerCase() === DEFAULT_FACE ? v.head.family : v.body.family;
  const d = stackOf(v.head.family), b = stackOf(bodyStack);
  const links = (v.links ?? []).filter((l) => l.startsWith("https://fonts.googleapis.com/") && l.includes("family="));
  const href = new Set();
  for (const fam of new Set([...names(d), ...names(b)])) {
    if (GENERIC.has(fam.toLowerCase())) continue;
    const own = linkFor(fam, links);
    if (own) href.add(own);
    else if (Object.values(ALIAS).includes(fam)) href.add(googleHref(fam));
  }
  // The first face of each stack, if nothing loads it yet, is asked of Google by name (a family Google lacks just falls back)
  for (const fam of [names(d)[0], names(b)[0]]) {
    if (!fam || GENERIC.has(fam.toLowerCase())) continue;
    if (![...href].some((l) => linkFor(fam, [l]))) href.add(googleHref(fam));
  }
  const lsPx = v.head.ls === "normal" ? 0 : parseFloat(v.head.ls) || 0;
  const ls = Math.max(-0.07, Math.min(0.08, lsPx / (v.head.size || 1)));
  const sheets = [...href].map(withoutSite).filter(Boolean);
  rows[key] = {
    d,
    dw: String(Math.round(+v.head.weight || 400)),
    ...(v.head.style === "italic" ? { di: 1 } : {}),
    ls: +ls.toFixed(3),
    b,
    ...(sheets.length ? { href: [...new Set(sheets)] } : {}),
    ...OVERRIDES[key],
  };
}

const body = Object.entries(rows).map(([k, r]) => `  ${JSON.stringify(k)}: ${JSON.stringify(r)},`).join("\n");
fs.writeFileSync(OUT, `/**
 * The font pairing of every library item, for the HOME hero (components/HomeHero.tsx):
 * the headline's family, weight, style and tracking (em) and the body text's family,
 * read from each item's own HTML file in a browser, plus the Google Fonts
 * stylesheets that load them. Keyed like libraryItems (p: page, m: motion,
 * s: system, v: video, d: product, i: icon set). An item missing here (its text
 * is drawn on a canvas, or never styled) keeps the site's font.
 *
 * Generated, do not edit by hand. With the dev server running:
 *   npx tsx scripts/hero-fonts/jobs.mts && node scripts/hero-fonts/extract.mjs && node scripts/hero-fonts/build.mjs
 */
export interface HeroFont {
  /** Headline font stack */
  d: string;
  /** Headline weight */
  dw: string;
  /** Headline is italic */
  di?: 1;
  /** Headline letter-spacing, em */
  ls: number;
  /** Body font stack */
  b: string;
  /** Stylesheets to load */
  href?: string[];
}

export const HERO_FONTS: Record<string, HeroFont> = {
${body}
};
`);
console.log(Object.keys(rows).length, "items written;", skipped.length, "keep the site font:", skipped.join(" "));
