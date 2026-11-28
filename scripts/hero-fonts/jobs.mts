// Every library item: [key, the HTML file to read its fonts from, the picture its accent colour comes from] -> scripts/hero-fonts/jobs.json
// npx tsx scripts/hero-fonts/jobs.mts
import fs from "node:fs";
const DATA = new URL("../../src/data/", import.meta.url).href;
const { feedPrompts } = await import(DATA + "prompts.ts");
const { motions } = await import(DATA + "motion.ts");
const { systems, systemCover } = await import(DATA + "systems.ts");
const { videos } = await import(DATA + "videos.ts");
const { products } = await import(DATA + "products.ts");
const { iconSets } = await import(DATA + "icons.ts");
const jobs = [
  ...feedPrompts.filter((p) => !p.youtube && p.thumbnail && p.demo).map((p) => ["p:" + p.slug, p.demo, p.thumbnail]),
  ...motions.map((m) => ["m:" + m.slug, m.demo, m.poster]),
  ...systems.map((s) => ["s:" + s.slug, s.files.specimen, systemCover(s)]),
  ...videos.map((v) => ["v:" + v.slug, v.demo, v.thumbnail]),
  ...products.map((p) => ["d:" + p.slug, p.demo, p.thumbnail]),
  ...iconSets.map((s) => ["i:" + s.slug, s.demo, s.thumbnail]),
];
fs.writeFileSync(new URL("./jobs.json", import.meta.url), JSON.stringify(jobs));
console.log(jobs.length, "items");
