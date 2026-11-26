// Extracts the Paste-Up design system from its landing page.
//
//   node scripts/systems/pasteup.mjs
//
// Reads public/demos/paste-up-travel-journal.html (never edits it) and writes
// public/systems/pasteup/ (specimen.html, tokens.css, pasteup.css, the
// textures and the four example photos) through the shared pipeline in
// lib.mjs. The page keeps one flat <style>; the system keeps the rules its
// markup still uses (the page's stylesheet also carries rules for an earlier
// hero, the stack of day sheets, the drop slot and the rail ticket, that no
// element matches any more; those and their keyframes are left behind) minus
// the document shell (html and the smooth-scroll rule).
// The page inlines its pictures as data URIs; the system writes each one out
// as a file next to the specimen and names it by relative url() in the
// component CSS, which resolves against pasteup.css when that is linked (by the
// SYSTEMS dialog or any host) and against the specimen, where the CSS is
// inlined. Link the CSS from instalanding.ai, or copy the files beside it.
//   - The material of the look: the cobalt paper grain (tex-grain.jpg), the
//     paper fibre the sheets, prints, scraps and cut letters multiply over
//     (tex-paper.png), the torn strip behind the labels (tex-strip-1.png) and
//     three masking-tape strips (tex-tape-1..3.png). The tape was an <img> per
//     strip on the page; here it is <i class="pu-tape pu-tape-1..3">, a
//     background. Inlined, the textures made a 330 KB stylesheet.
//   - The four photos of Matera (photo-*.jpg) are example content behind
//     .pu-ph-sassi and its siblings. Bring your own: set background-image on a .pu-ph.
// Everything moves in CSS, as on the page. The one script is the page's
// pointer parallax for the hero collage, made delegated.
// The page's torn labels (.nsh) carry will-change: filter because Chrome
// sometimes painted the strip but not the words on it; the system keeps that.
import fs from "node:fs";
import path from "node:path";
import { readPage, sliceEl, dropStyle, normalizer, renderSpecimen, writeSystem, root } from "./lib.mjs";

const SOURCE = "public/demos/paste-up-travel-journal.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Alfa+Slab+One&family=Anton&family=Archivo+Black&family=Courier+Prime:wght@700&family=Playfair+Display:ital,wght@1,900&display=swap";
if (!page.includes(FONTS_HREF)) throw new Error("font link not found");
const FONTS = `<link href="${FONTS_HREF}" rel="stylesheet">`;
const OUT = path.join(root, "public/systems/pasteup");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's rules and inline styles; the page has
   no custom properties of its own beyond its animation inputs. Group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Paste-Up · pasteup@${VERSION}
   Extracted from https://instalanding.ai/demos/paste-up-travel-journal.html
   Fonts: Anton, Alfa Slab One, Abril Fatface, Archivo Black, Playfair Display italic 900
   and Courier Prime 700 (Google Fonts). Textures: tex-*.png/jpg beside pasteup.css */
:root {
  /* Color · core */
  --pu-cobalt: #1B3FD0;
  --pu-yellow: #FFD21E;
  --pu-paper: #F6F5F1;
  --pu-ink: #16130F;
  --pu-pink: #FF9AB5;
  --pu-red: #E23A26;
  --pu-white: #FFFFFF;

  /* Color · paper & text */
  --pu-photo-blank: #D8D2C6;
  --pu-ink-soft: #3A342C;
  --pu-ink-copy: #2D2822;
  --pu-spent: #C9CEDE;
  --pu-spent-ink: #4A5270;
  --pu-print: #F8F6F0;

  /* Shade · rgb channels (used as rgb(var(--pu-shade) / alpha)) */
  --pu-shade: 4 10 60;
  --pu-shade-deep: 3 8 52;
  --pu-glow-hi: 120 155 255;
  --pu-glow-lo: 70 110 255;

  /* Type · families */
  --pu-font-body: "Courier Prime", ui-monospace, monospace;
  --pu-font-anton: "Anton", Impact, sans-serif;
  --pu-font-slab: "Alfa Slab One", Rockwell, serif;
  --pu-font-fat: "Abril Fatface", Didot, serif;
  --pu-font-black: "Archivo Black", "Arial Black", sans-serif;
  --pu-font-italic: "Playfair Display", Georgia, serif;

  /* Type · scale */
  --pu-serif: clamp(58px, 6.6vw, 92px);
  --pu-h2-scrap: 56px;
  --pu-h3-card: 24px;
  --pu-h3: 22px;
  --pu-price: 48px;
  --pu-lead: 19px;
  --pu-body: 17px;
  --pu-copy: 16px;
  --pu-label: 15px;
  --pu-marquee-size: 17px;

  /* Shape · radii */
  --pu-radius: 0;
  --pu-radius-round: 50%;

  /* Shape · borders */
  --pu-rule: 1.5px;
  --pu-rule-bold: 2px;

  /* Shape · cuts (clip-path edges) */
  --pu-cut-0: polygon(3% 5%,97% 0%,100% 94%,5% 100%);
  --pu-cut-1: polygon(0% 4%,52% 0%,100% 6%,96% 100%,4% 95%);
  --pu-cut-2: polygon(5% 0%,100% 4%,95% 100%,48% 97%,0% 99%);
  --pu-cut-3: polygon(1% 7%,98% 2%,100% 58%,97% 100%,3% 94%);
  --pu-rag-1: polygon(.5% 1.4%,31% 0%,68% 1.1%,99.5% .2%,100% 47%,99% 99.2%,61% 100%,27% 98.6%,.2% 99.7%,0% 52%);
  --pu-rag-2: polygon(1.2% .3%,52% .9%,98.6% 0%,100% 38%,99.2% 99.6%,44% 100%,0% 98.8%,.8% 55%);
  --pu-rag-3: polygon(0% .9%,43% 0%,99.7% 1.6%,99% 51%,100% 98.8%,57% 100%,1% 99.1%,.4% 44%);

  /* Depth · shadows */
  --pu-shadow-paper: 0 1px 2px rgb(var(--pu-shade) / .45), 0 22px 48px -10px rgb(var(--pu-shade-deep) / .6);
  --pu-shadow-print: 0 1px 2px rgb(var(--pu-shade) / .45), 0 4px 8px rgb(var(--pu-shade) / .25), 0 28px 56px -14px rgb(var(--pu-shade-deep) / .65);
  --pu-shadow-marquee: 0 2px 3px rgb(var(--pu-shade) / .5), 0 12px 26px rgb(var(--pu-shade-deep) / .45);

  /* Lift · drop-shadow filters (paper casts its shadow by its cut outline) */
  --pu-drop-scrap: drop-shadow(0 1px .6px rgb(var(--pu-shade) / .5)) drop-shadow(0 3px 5px rgb(var(--pu-shade) / .34));
  --pu-drop-print: drop-shadow(0 1px 1px rgb(var(--pu-shade) / .5)) drop-shadow(0 5px 9px rgb(var(--pu-shade) / .38));
  --pu-drop-label: drop-shadow(0 1px .6px rgb(var(--pu-shade) / .45)) drop-shadow(0 2px 3px rgb(var(--pu-shade) / .3));
  --pu-drop-stamp: drop-shadow(0 2px 2px rgb(var(--pu-shade) / .45)) drop-shadow(0 10px 16px rgb(var(--pu-shade) / .4));
  --pu-tape-filter: sepia(.35) saturate(1.5) brightness(1.07) contrast(1.06) drop-shadow(0 1px 1px rgb(var(--pu-shade) / .32));
  --pu-glow-serif: 0 3px 18px rgb(var(--pu-shade-deep) / .45);

  /* Motion · easing */
  --pu-ease-print: cubic-bezier(.3,.6,.3,1);
  --pu-ease-stick: cubic-bezier(.2,.9,.3,1.2);
  --pu-ease-land: cubic-bezier(.2,.9,.3,1.25);
  --pu-ease-rise: cubic-bezier(.2,.8,.2,1);
  --pu-ease-draw: cubic-bezier(.6,0,.2,1);
  --pu-ease-layer: cubic-bezier(.2,.7,.2,1);

  /* Motion · durations */
  --pu-dur-hover: 160ms;
  --pu-dur-stick: .2s;
  --pu-dur-land: .5s;
  --pu-dur-layer: .5s;
  --pu-dur-drop: .7s;
  --pu-dur-rise: .8s;
  --pu-dur-sheet: .9s;
  --pu-dur-print: .9s;
  --pu-dur-draw: .9s;
  --pu-dur-marquee: 38s;
  --pu-land-stagger: 70ms;

  /* Space · layout */
  --pu-wrap: 1240px;
  --pu-wrap-hero: 1320px;
  --pu-gutter: 32px;
  --pu-section-top: 90px;
  --pu-section-bottom: 110px;
  --pu-grain-size: 1080px;
  --pu-paper-tile: 128px 80px;
  --pu-marquee-tilt: -1.6deg;
  --pu-hover-lift: -3px;
}`;

/* ── 2. The rules the markup still uses, then the pictures out of them ── */
let H = page.slice(BODY);
function splitRules(src) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) { out.push(src.slice(start, i + 1).trim()); start = i + 1; }
  }
  return out.filter(Boolean);
}
function splitSelectors(sel) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < sel.length; i++) {
    if (sel[i] === "(") depth++;
    else if (sel[i] === ")") depth--;
    else if (sel[i] === "," && depth === 0) { out.push(sel.slice(start, i).trim()); start = i + 1; }
  }
  out.push(sel.slice(start).trim());
  return out.filter(Boolean);
}
// A selector is kept when every class it names is on some element of the page
const USED = new Set([...H.matchAll(/ class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)).filter(Boolean));
function prune(src) {
  return splitRules(src).map((rule) => {
    const i = rule.indexOf("{");
    const prelude = rule.slice(0, i).trim();
    const body = rule.slice(i + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = prune(body);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((sel) => [...sel.matchAll(/\.([a-zA-Z][\w-]*)/g)].every((m) => USED.has(m[1])));
    return parts.length ? `${parts.join(",")}{${body}}` : "";
  }).filter(Boolean).join("\n");
}
let css = prune(pageCss.replace(/\/\*[\s\S]*?\*\//g, ""));
// Keyframes nothing animates with any more go too
const KF_ALL = [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]);
const LIVE = KF_ALL.filter((k) => new RegExp(`animation:\\s*${k}(?![\\w-])`).test(css));
css = splitRules(css).filter((r) => !r.startsWith("@keyframes") || LIVE.includes(/@keyframes ([\w-]+)/.exec(r)[1])).join("\n");
const DEAD = KF_ALL.filter((k) => !LIVE.includes(k));
if (DEAD.join() !== "arrive,ride,fadein") throw new Error("unexpected dead keyframes: " + DEAD.join());

// Each url("data:...") in the page's CSS, by the rule it sits in
const TEX_RULES = [
  [".pg{", "grain"], [".cut>i,.ppr{", "paper"], [".s1{", "strip-1"],
  [".ph-sassi{", "photo:sassi"], [".ph-duomo{", "photo:duomo"], [".ph-pane{", "photo:pane"], [".ph-cucu{", "photo:cucu"],
];
const ext = (data) => (data.startsWith("data:image/png") ? "png" : "jpg");
const save = (file, data) => {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(data.slice(data.indexOf(",") + 1), "base64"));
  return file;
};
for (const [rule, name] of TEX_RULES) {
  const at = css.indexOf(rule);
  if (at < 0) throw new Error("texture rule not found: " + rule);
  const m = /url\("(data:[^"]+)"\)/.exec(css.slice(at));
  if (!m) throw new Error("no data url in " + rule);
  const data = m[1];
  const file = save(name.startsWith("photo:") ? `photo-${name.slice(6)}.${ext(data)}` : `tex-${name}.${ext(data)}`, data);
  // The paper fibre is also the marquee's: every use of the same data becomes the one file
  css = css.split(`url("${data}")`).join(`url("${file}")`);
}
// The tape strips were <img>s in the markup: three distinct PNGs
const TAPES = [];
H = H.replace(/<img class="tape( stick)?" src="(data:[^"]+)" alt="" style="([^"]*)">/g, (_, stick, data, style) => {
  let n = TAPES.indexOf(data);
  if (n < 0) n = TAPES.push(data) - 1;
  return `<i class="tape tape-${n + 1}${stick ?? ""}" aria-hidden="true" style="${style}"></i>`;
});
if (TAPES.length !== 3) throw new Error("expected three tape strips, found " + TAPES.length);
if (TAPES.some((d) => ext(d) !== "png")) throw new Error("a tape strip is not a PNG");
TAPES.forEach((d, i) => save(`tex-tape-${i + 1}.png`, d));
if (/data:/.test(css) || /<img|data:/.test(H.slice(0, H.indexOf("<script")))) throw new Error("inlined data left in the rules or markup");

/* ── 3. Normalisation ────────────────────────────────────────────────── */
// The page's animation inputs (--d, --i, --dx, --dy, --spin, --px, --py) move under pu-
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("pu-") ? m : `--pu-${n}`));
const HEX = {
  "#1b3fd0": "cobalt", "#ffd21e": "yellow", "#f6f5f1": "paper", "#16130f": "ink", "#ff9ab5": "pink", "#e23a26": "red",
  "#d8d2c6": "photo-blank", "#3a342c": "ink-soft", "#2d2822": "ink-copy", "#c9cede": "spent", "#4a5270": "spent-ink", "#fff": "white",
};
const v = (t) => `var(--pu-${t})`;
// Literal values as the page writes them, in its rules and its inline styles alike. Order matters:
// whole stacks before the colours inside them, families with fallbacks before bare families.
const LIT = [
  // Paper lift and depth
  ["drop-shadow(0 1px .6px rgb(4 10 60/.5)) drop-shadow(0 3px 5px rgb(4 10 60/.34))", v("drop-scrap")],
  ["drop-shadow(0 1px 1px rgb(4 10 60/.5)) drop-shadow(0 5px 9px rgb(4 10 60/.38))", v("drop-print")],
  ["drop-shadow(0 1px .6px rgb(4 10 60/.45)) drop-shadow(0 2px 3px rgb(4 10 60/.3))", v("drop-label")],
  ["drop-shadow(0 2px 2px rgb(4 10 60/.45)) drop-shadow(0 10px 16px rgb(4 10 60/.4))", v("drop-stamp")],
  ["sepia(.35) saturate(1.5) brightness(1.07) contrast(1.06) drop-shadow(0 1px 1px rgb(4 10 60/.32))", v("tape-filter")],
  ["0 1px 2px rgb(4 10 60/.45),0 4px 8px rgb(4 10 60/.25),0 28px 56px -14px rgb(3 8 52/.65)", v("shadow-print")],
  ["0 1px 2px rgb(4 10 60/.45),0 22px 48px -10px rgb(3 8 52/.6)", v("shadow-paper")],
  ["0 2px 3px rgb(4 10 60/.5),0 12px 26px rgb(3 8 52/.45)", v("shadow-marquee")],
  ["text-shadow:0 3px 18px rgb(3 8 52/.45)", `text-shadow:${v("glow-serif")}`],
  ["rgb(4 10 60/", `rgb(${v("shade")}/`],
  ["rgb(3 8 52/", `rgb(${v("shade-deep")}/`],
  ["rgb(120 155 255/", `rgb(${v("glow-hi")}/`],
  ["rgb(70 110 255/", `rgb(${v("glow-lo")}/`],
  ["rgb(22 19 15/.08)", `color-mix(in srgb,${v("ink")} 8%,transparent)`],
  ["#f8f6f0", v("print")],
  // Cut and torn edges
  ...["polygon(3% 5%,97% 0%,100% 94%,5% 100%)", "polygon(0% 4%,52% 0%,100% 6%,96% 100%,4% 95%)", "polygon(5% 0%,100% 4%,95% 100%,48% 97%,0% 99%)", "polygon(1% 7%,98% 2%,100% 58%,97% 100%,3% 94%)"]
    .map((p, i) => [p, v(`cut-${i}`)]),
  ...["polygon(.5% 1.4%,31% 0%,68% 1.1%,99.5% .2%,100% 47%,99% 99.2%,61% 100%,27% 98.6%,.2% 99.7%,0% 52%)", "polygon(1.2% .3%,52% .9%,98.6% 0%,100% 38%,99.2% 99.6%,44% 100%,0% 98.8%,.8% 55%)", "polygon(0% .9%,43% 0%,99.7% 1.6%,99% 51%,100% 98.8%,57% 100%,1% 99.1%,.4% 44%)"]
    .map((p, i) => [p, v(`rag-${i + 1}`)]),
  // Type (sizes first, while the families are still literal)
  ["font:italic 900 clamp(58px,6.6vw,92px)/.95 'Playfair Display',serif", `font:italic 900 ${v("serif")}/.95 ${v("font-italic")}`],
  ["font:700 19px/1.55 'Courier Prime',monospace", `font:700 ${v("lead")}/1.55 ${v("font-body")}`],
  ["font:700 17px/1.5 'Courier Prime',monospace", `font:700 ${v("body")}/1.5 ${v("font-body")}`],
  ["font:400 22px/1.15 'Archivo Black',sans-serif", `font:400 ${v("h3")}/1.15 ${v("font-black")}`],
  ["font:400 24px/1.15 'Archivo Black',sans-serif", `font:400 ${v("h3-card")}/1.15 ${v("font-black")}`],
  ["font:400 48px/1 'Anton',sans-serif", `font:400 ${v("price")}/1 ${v("font-anton")}`],
  ["font:400 17px/1 'Archivo Black',sans-serif", `font:400 ${v("marquee-size")}/1 ${v("font-black")}`],
  ["font-size:56px", `font-size:${v("h2-scrap")}`],
  ["font-size:16px", `font-size:${v("copy")}`],
  ["'Courier Prime',monospace", v("font-body")],
  ["'Anton',sans-serif", v("font-anton")],
  ["'Alfa Slab One',serif", v("font-slab")],
  ["'Archivo Black',sans-serif", v("font-black")],
  ["'Playfair Display',serif", v("font-italic")],
  ["'Courier Prime'", v("font-body")],
  ["'Anton'", v("font-anton")],
  ["'Alfa Slab One'", v("font-slab")],
  ["'Abril Fatface'", v("font-fat")],
  ["'Archivo Black'", v("font-black")],
  ["'Playfair Display'", v("font-italic")],
  // Borders
  ["1.5px dashed", `${v("rule")} dashed`],
  ["1.5px solid", `${v("rule")} solid`],
  ["2px dashed", `${v("rule-bold")} dashed`],
  ["border-radius:50%", `border-radius:${v("radius-round")}`],
  // Motion
  ["transition:translate 160ms,rotate 160ms", `transition:translate ${v("dur-hover")},rotate ${v("dur-hover")}`],
  ["transition:transform .5s cubic-bezier(.2,.7,.2,1)", `transition:transform ${v("dur-layer")} ${v("ease-layer")}`],
  ["draw .9s 1.45s cubic-bezier(.6,0,.2,1)", `draw ${v("dur-draw")} 1.45s ${v("ease-draw")}`],
  ["sheetin .9s cubic-bezier(.2,.8,.2,1)", `sheetin ${v("dur-sheet")} ${v("ease-rise")}`],
  ["printin .9s cubic-bezier(.3,.6,.3,1)", `printin ${v("dur-print")} ${v("ease-print")}`],
  ["stick .2s cubic-bezier(.2,.9,.3,1.2)", `stick ${v("dur-stick")} ${v("ease-stick")}`],
  ["dropin .7s 2.15s cubic-bezier(.2,.9,.3,1.2)", `dropin ${v("dur-drop")} 2.15s ${v("ease-stick")}`],
  ["rise .8s var(--d,0s) cubic-bezier(.2,.8,.2,1)", `rise ${v("dur-rise")} var(--d,0s) ${v("ease-rise")}`],
  ["land .5s calc(var(--i,0) * 70ms + .25s) cubic-bezier(.2,.9,.3,1.25)", `land ${v("dur-land")} calc(var(--i,0) * ${v("land-stagger")} + .25s) ${v("ease-land")}`],
  ["marq 38s linear", `marq ${v("dur-marquee")} linear`],
  // Layout and texture
  ["max-width:1240px", `max-width:${v("wrap")}`],
  ["max-width:1320px", `max-width:${v("wrap-hero")}`],
  ["padding-left:32px;padding-right:32px", `padding-left:${v("gutter")};padding-right:${v("gutter")}`],
  ["padding-top:90px;padding-bottom:110px", `padding-top:${v("section-top")};padding-bottom:${v("section-bottom")}`],
  ["center top / 1080px repeat", `center top / ${v("grain-size")} repeat`],
  ["background-size:128px 80px", `background-size:${v("paper-tile")}`],
  ["0 0/128px 80px", `0 0/${v("paper-tile")}`],
  ["bottom:30px;rotate:-1.6deg", `bottom:30px;rotate:${v("marquee-tilt")}`],
  [".btn:hover{translate:0 -3px", `.btn:hover{translate:0 ${v("hover-lift")}`],
];
const lit = (s) => LIT.reduce((acc, [from, to]) => acc.split(from).join(to), s);

/* ── 4. Component CSS: the page's live rules, minus the shell ────────── */
const DROP = /^html$/;
function scopeSelector(sel) {
  // The page's universal rules (box sizing, reduced motion) reach only inside the root
  if (sel.startsWith("*")) return `:where(.pu, .pu *)${sel.slice(1)}`;
  if (sel === "body") return ".pu";
  // The page's wrapper (.pg) is the root's ground too: wrap a page in .pu and it sits on the grain
  if (sel === ".pg") return ".pu,.pg";
  return sel;
}
const squash = (s) => s.replace(/\s*\n\s*/g, "").trim();
function keep(src) {
  return splitRules(src).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",")}{${squash(body)}}` : "";
  }).filter(Boolean).join("\n");
}
// Written in the page's vocabulary (its class names, its literal values), then normalised with the rest:
// the root carries what the page's wrapper set inline, and the tape strips are backgrounds now.
const EXTRA_CSS = `
body{color:#fff;-webkit-font-smoothing:antialiased;font:700 17px/1.5 'Courier Prime',monospace}
.tape{display:block;background:center / 100% 100% no-repeat}
.tape-1{background-image:url("tex-tape-1.png")}.tape-2{background-image:url("tex-tape-2.png")}.tape-3{background-image:url("tex-tape-3.png")}`;
// The scraps' paper fibre multiplies over their colour; the tape and labels must keep their own layer (see .nsh)
const base = renameVars(keep(lit(css + "\n" + EXTRA_CSS)));
if (!base.includes(".nsh{will-change:filter}")) throw new Error("the .nsh paint fix is missing");

/* ── 5. Markup ───────────────────────────────────────────────────────── */
if (/<[^>]* style="[^"]*"[^>]* style="/.test(H)) throw new Error("an element carries two style attributes");
const swap = (from, to) => {
  if (!H.includes(from)) throw new Error("markup not found: " + from.slice(0, 70));
  H = H.replace(from, to);
};
// Section anchors become "#"; the page's ids and section markers go
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ href="#[a-z]*"/g, ' href="#"')
  .replace(/\n {2,}/g, "\n");
const at = (marker, from = 0) => {
  const i = H.indexOf(marker, from);
  if (i < 0) throw new Error("marker not found: " + marker.slice(0, 70));
  return i;
};
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
// The element `marker` that contains (or starts just before) `inside`
const pieceAt = (marker, inside, from = 0) => sliceEl(H, marker, H.lastIndexOf(marker, at(inside, from))).html;
const asDiv = (html) => html.replace(/^<(section|footer)/, "<div").replace(/<\/(section|footer)>$/, "</div>");
// A section's page spacing belongs to the page; the component is what's inside
const SECTION_BOX = ["max-width", "margin", "padding-left", "padding-right", "padding-top", "padding-bottom", "box-sizing"];
const section = (marker) => dropStyle(asDiv(piece(marker)), SECTION_BOX);
// Absolutely placed on the stage; standalone it sits in the flow
const unplace = (html) => dropStyle(html, ["left", "top", "right", "position", "z-index"]).replace(/^(<[^>]*? style=")/, "$1position:relative;");

const NAV = piece('<header class="nav"');
const HERO = piece('<section id="top" class="hero"');
const STAGE = piece('<div class="stagewrap">');
const MARQ = piece('<div class="marquee"');
const DIVIDER = piece('<div aria-hidden="true" style="display:flex;align-items:center;gap:10px;max-width:1240px');
const HOW = at('<section id="how"'), DET = at('<section id="details"'), TRIP = at('<section id="trip"');

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("nav", "Header & cut-letter wordmark", "The header row over a 1.5px dashed white rule: the PASTE-UP wordmark as eight cut letters (each its own scrap: one of the six faces, a paper, ink or yellow ground, its own tilt and offset), three Courier Prime links at 86% white that turn yellow on hover, and the yellow + GET THE APP button tilted -3deg. The links go under 520px.",
  NAV);

add("type", "Cut letters & ransom titles", "Titles are cut out, never set. A cut letter is <span class=\"pu-cut pu-e0..e3\"><i>: the span carries the size, tilt (rotate) and offset (translate) inline and casts --pu-drop-scrap; the <i> carries the paper (paper, yellow, pink, red or ink), the face, and a clip-path edge (--pu-cut-0..3) over the paper fibre (tex-paper.png). Rotate the edges and faces so no two neighbours match, and keep tilts within ±5deg. Inside .pu-hl the letters land one by one (--pu-i × --pu-land-stagger). Section titles cut whole words instead, padded scraps at --pu-h2-scrap. The italic Playfair line with its drawn yellow underline (.pu-uline) and the Courier eyebrow, lead and facts carry the rest.",
  `<div style="display:flex;flex-direction:column;gap:44px">
${piece('<p class="eyebrow rise"')}
${piece('<h1 style="margin:0;display:flex;flex-direction:column;gap:6px">')}
${sliceEl(H, "<h2", HOW).html}
<div style="display:flex;flex-wrap:wrap;align-items:flex-end;gap:28px 48px">
${pieceAt('<div aria-hidden="true" style="min-height:76px', "Cut-letter titles", DET)}
</div>
${piece('<p class="lead rise"')}
${piece('<ul class="facts rise"')}
</div>`);

add("buttons", "Tilted buttons & links", "A button is a cut scrap in a link: <a class=\"pu-btn\"> tilted -2deg to -3deg inline, holding a .pu-cut.pu-e0 whose <i> is the yellow paper with Archivo Black capitals at .05em and a + or an arrow. Ink paper is the second button. Hover lifts it by --pu-hover-lift over --pu-dur-hover. Text links are Courier Prime: .pu-ghostlink sits on a 2px dashed white underline that turns yellow, .pu-navlink is plain. A spent control drops to --pu-spent paper with --pu-spent-ink; a destructive one is a round red scrap.",
  `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:28px 40px">
${pieceAt('<a class="btn"', "START TODAY'S PAGE<svg")}
${pieceAt('<a class="btn"', "+ GET THE APP")}
${pieceAt('<a class="btn"', "+ START FREE")}
${pieceAt('<a class="btn"', "+ GO TRAVELLER")}
${pieceAt('<span class="cut e0" style="rotate:-3deg">', "PAGE FULL")}
${pieceAt('<span class="cut" style="width:44px', "M4 4l8 8")}
${piece('<a class="ghostlink"')}
${piece('<a class="navlink"')}
</div>`);

add("labels", "Time chips & torn labels", "Every photo is named, never captioned: a black Anton time chip (.pu-chip, tilted -5deg on its own clip) tucked over a torn-paper strip (.pu-s1, the torn strip tex-strip-1.png stretched to fit) with the name in Courier Prime 700, wrapped in .pu-nsh, which casts --pu-drop-label and carries will-change: filter. Keep that: without its own layer Chrome sometimes repaints the strip but not the words on it. A cut number tucked under an ink tab counts photos; the chip alone marks a volume.",
  `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:34px 44px">
${sliceEl(H, '<span class="nsh"', DET).html}
${pieceAt('<span class="nsh"', "Duomo steps", DET)}
${pieceAt('<span style="display:inline-flex;align-items:center">', ">6</i>")}
<b class="chip" style="font-size:13px">VOL. 01</b>
</div>`);

add("scraps", "Paper scraps, tape & torn edges", "Surfaces are paper, not cards: a .pu-ppr scrap (paper, yellow or pink, the fibre multiplied over it) with one of three torn outlines (.pu-rag, .pu-rag2, .pu-rag3: --pu-rag-1..3), inside a .pu-prt that casts --pu-drop-print by that outline. Tilt each by ±1.5deg. Tape is three strips (.pu-tape-1..3, 96×23 by default, warmed by --pu-tape-filter) placed absolutely across an edge at a few degrees; scale them up to pin a whole sheet. Photos are .pu-ph tiles cut by the same rag edges, on --pu-photo-blank until the picture loads.",
  `<div style="display:flex;flex-wrap:wrap;align-items:flex-start;gap:40px 36px;padding-top:14px">
<div class="prt" style="flex:1 1 200px;position:relative;rotate:-1.5deg;min-width:0"><div class="ppr rag" style="background-color:#f6f5f1;padding:40px 24px 26px;color:#16130f"><h3 style="margin:0;font:400 22px/1.15 'Archivo Black',sans-serif;text-transform:uppercase">Paper</h3><p style="margin:8px 0 0;font:700 17px/1.5 'Courier Prime',monospace;font-size:16px;color:#3a342c">.ppr.rag</p></div><i class="tape tape-1" aria-hidden="true" style="top:-11px;left:calc(50% - 48px);rotate:3deg"></i></div>
<div class="prt" style="flex:1 1 200px;position:relative;rotate:1.2deg;min-width:0"><div class="ppr rag2" style="background-color:#ffd21e;padding:40px 24px 26px;color:#16130f"><h3 style="margin:0;font:400 22px/1.15 'Archivo Black',sans-serif;text-transform:uppercase">Yellow</h3><p style="margin:8px 0 0;font:700 17px/1.5 'Courier Prime',monospace;font-size:16px;color:#3a342c">.ppr.rag2</p></div><i class="tape tape-2" aria-hidden="true" style="top:-11px;left:calc(50% - 48px);rotate:-4deg"></i></div>
<div class="prt" style="flex:1 1 200px;position:relative;rotate:-0.8deg;min-width:0"><div class="ppr rag3" style="background-color:#ff9ab5;padding:40px 24px 26px;color:#16130f"><h3 style="margin:0;font:400 22px/1.15 'Archivo Black',sans-serif;text-transform:uppercase">Pink</h3><p style="margin:8px 0 0;font:700 17px/1.5 'Courier Prime',monospace;font-size:16px;color:#3a342c">.ppr.rag3</p></div><i class="tape tape-3" aria-hidden="true" style="top:-11px;left:calc(50% - 48px);rotate:5deg"></i></div>
<div style="flex:1 1 200px;position:relative;aspect-ratio:3/2;rotate:2deg;min-width:0"><div class="prt" style="position:absolute;inset:0"><div class="ph ph-pane rag2" role="img" aria-label="A loaf of Pane di Matera"></div></div><i class="tape tape-2" aria-hidden="true" style="top:-10px;left:26px;rotate:-7deg"></i></div>
</div>`);

// The hero's prints, lifted off the collage into the flow (a print keeps its size up to the column's width)
const PRINTS = [];
for (let i = H.indexOf('<div class="print ppr"'); i >= 0; i = H.indexOf('<div class="print ppr"', i + 1)) PRINTS.push(sliceEl(H, '<div class="print ppr"', i).html);
if (PRINTS.length !== 3) throw new Error("expected three prints, found " + PRINTS.length);
add("prints", "Taped photo prints", "A photo print (.pu-print.pu-ppr): a --pu-print border 11px wide around a .pu-ph, the fibre multiplied over it, cast by --pu-shadow-print, held by one strip of tape (.pu-tape.pu-stick) across its top or a corner. Prints fly in from off the page: give each --pu-dx, --pu-dy and --pu-spin (where it comes from and how it turns) and an animation-delay, and it lands over --pu-dur-print on --pu-ease-print; its tape sticks 0.62s after its delay. Tilt prints -6 to 5deg.",
  `<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:48px 56px;padding:20px 0">
${PRINTS.map((p) => unplace(p).replace('style="position:relative;', 'style="position:relative;max-width:100%;')).join("\n")}
</div>`);

add("stamp", "Stamp & postmark", "A perforated stamp (.pu-stamp, 126px: a radial-gradient mask punches the edge every 11px) holding a photo tile, with a rubber postmark (two rings and four wavy cancel lines, an inline SVG in ink at 50%) struck across its left edge. It drops in on --pu-ease-stick at 2.15s, the last thing onto the hero: set animation-delay to place it elsewhere.",
  `<div style="display:flex;align-items:center;padding:24px 8px 24px 72px">
${unplace(piece('<div class="stamp"'))}
</div>`);

add("marquee", "Tape marquee", "A black tape strip across the bottom of the hero: --pu-ink over the paper fibre, tilted --pu-marquee-tilt with slightly cut ends, Archivo Black capitals at .14em scrolling left over --pu-dur-marquee, each phrase followed by yellow scissors. The track repeats its phrases four times and moves by a quarter, so it loops without a seam. Place it absolutely at the foot of a section that hides overflow.",
  `<div style="position:relative;height:118px;overflow:hidden">
${MARQ}
</div>`);

add("divider", "Scissors cut line", "Sections are parted by a cut-here line: scissors in cobalt with a white outline, then a 2px dashed white rule at 60% across the content width.",
  DIVIDER);

add("collage", "Paste-up collage", "The hero's picture: a collage on six parallax layers (data-pu-depth 6 to 36 px of travel). Two loose sheets, white and pink (.pu-paper.pu-ppr, cast by --pu-shadow-paper), settle in tilted -6deg and 5.5deg; three prints fly in from off the page one after another, each held by a strip of tape that sticks a beat later; the stamp drops in last. Fixed at 740×690 and zoomed down at each breakpoint.",
  STAGE, { js: true });

add("hero", "Paste-up hero", "The opening: the header, then copy on the left (an eyebrow with an ink chip, a cut-letter title that lands letter by letter over an italic Playfair line with a drawn yellow underline, the lead, the yellow button beside a dashed link, and three facts with yellow icons) and the paste-up collage on the right, over a soft light, with the tape marquee across the foot. A fine pointer drifts the stage's layers. One column under 1020px.",
  asDiv(HERO), { js: true });

add("steps", "Taped step cards", "Three steps on paper scraps, each taped at the top centre and tilted a little differently: a cut numeral on pink, yellow or red, an Archivo Black capital heading and Courier copy in --pu-ink-soft, under a section title cut from four words.",
  section('<section id="how"'));

add("details", "Detail cards", "Four feature scraps in two columns (paper, yellow, pink, paper; each with its own rag edge and tilt), each led by a live sample of the thing it describes: a torn label, a cut-letter DAY title, a photo count beside a spent PAGE FULL button, and a round red peel-off mark beside a label.",
  section('<section id="details"'));

add("trip", "Taped photo row", "Photos in the order they were taken, centred and wrapping: each a rag-edged tile with a tape strip across one corner or the top, tilted -3 to 2.5deg, its time label below.",
  section('<section id="trip"'));

add("pricing", "Paper pricing", "Two plans on scraps, paper and yellow, tilted ±1.2deg: a cut label (ink FREE, red TRAVELLER), the price in Anton at --pu-price beside its terms in Courier, + bullets, and a tilted button pushed to the foot.",
  section('<section id="pricing"'));

add("cta", "Red cut-letter CTA", "The closing call on a red rag scrap tilted -1deg: TODAY DESERVES A PAGE. in big cut letters (paper, yellow and red, every face), a line in white Courier and the yellow button.",
  section('<section id="start"'));

add("footer", "Footer", "Above a 2px dashed white rule at 60%: the cut-letter wordmark at 80%, four Courier links and the legal line.",
  dropStyle(asDiv(piece("<footer")), SECTION_BOX));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@") || /^\s*(from|to|\d)/.test(sel)) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "pu" && !m[1].startsWith("pu-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("pu-")) CLASSES.add(n);
const KEYFRAMES = ["printin", "stick", "land", "rise", "sheetin", "dropin", "draw", "marq"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "pu", hex: HEX, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ["depth"] });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, s) => ` style="${renameVars(lit(s))}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .pu itself, or :where(.pu) in front
const ROOTED = /(^|[\s,(>+~])\.pu(?![\w-])/;
function rootEvery(src) {
  return splitRules(src).map((rule) => {
    const i = rule.indexOf("{");
    const prelude = rule.slice(0, i).trim();
    const body = rule.slice(i + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.pu) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* Headings and controls inherit the root's font inside a host (the components set their own faces inline) */
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.pu) ${t}`).join(",")}{font-family:inherit}`;
const ruleCss = rootEvery(prefixCss(tokenize(base))).trim();
const leftHex = ruleCss.match(/#[0-9a-f]{3,6}\b/gi)?.filter((h) => !/^#0{3,4}$/.test(h));
if (leftHex?.length) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));
const componentCss = `${RESET}\n${ruleCss}`;
for (const c of C) {
  const left = c.markup.match(/#[0-9a-f]{3,6}\b/gi);
  if (left) console.warn(`literal colours left in ${c.id}:`, [...new Set(left)].join(" "));
}

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Paste-Up components, no libraries. Everything else moves in CSS; this is
     the page's one script, delegated from the document so stages added later
     work: inside a .pu-hero (or a lone .pu-stagewrap) each .pu-layer drifts
     with a fine pointer by its data-pu-depth (px of travel either way), and
     settles back when the pointer leaves. Off under reduced motion and on
     touch. Links to "#" do nothing. */
  var fine = matchMedia('(pointer:fine)'), still = matchMedia('(prefers-reduced-motion:reduce)');
  var scope = null, raf = 0, tx = 0, ty = 0;
  function apply(el, x, y) {
    [].forEach.call(el.querySelectorAll('.pu-layer'), function (l) {
      var d = +l.getAttribute('data-pu-depth') || 0;
      l.style.transform = 'translate3d(' + (x * d).toFixed(2) + 'px, ' + (y * d).toFixed(2) + 'px, 0)';
    });
  }
  function scopeOf(t) {
    if (!t || !t.closest) return null;
    return t.closest('.pu .pu-hero') || t.closest('.pu .pu-stagewrap');
  }
  document.addEventListener('pointermove', function (e) {
    if (!fine.matches || still.matches) return;
    var s = scopeOf(e.target);
    if (s !== scope) { if (scope) apply(scope, 0, 0); scope = s; }
    if (!s) return;
    var r = s.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (scope) apply(scope, tx, ty); });
  });
  document.documentElement.addEventListener('pointerleave', function () { if (scope) apply(scope, 0, 0); scope = null; });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.pu a[href="#"]');
    if (a) e.preventDefault();
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own hero without its header, the wordmark's cut letters as the title
const LOGO = sliceEl(NAV, '<span style="display:inline-flex;align-items:flex-end;gap:2px">', 0).html;
let li = 0;
const TITLE = LOGO
  .replace('gap:2px">', 'gap:2px;zoom:2.2">')
  .replace(/<span class="cut (e\d)" style="/g, (_, e) => `<span class="cut ${e}" style="--i:${li++};`);
const HERO_TOP = asDiv(HERO)
  .replace(NAV, "")
  .replace(/(<b class="chip" style="font-size:13px">)[^<]*(<\/b><span>)[^<]*/, `$1v${VERSION}$2The design system that pastes itself`)
  .replace(/(<span class="hl" style="[^"]*">)[\s\S]*?(<\/span>)(\n<span class="serif)/, (m, open) => `${open}${TITLE}</span>\n<span class="serif`)
  .replace(/(<span class="serif rise" style="--d:\.75s">)gets a (<span class="uline">)page\./, "$1in a $2system.")
  .replace(/(<p class="lead rise" style="--d:\.9s">)[^<]*/, "$1Cobalt paper grain, ransom-note cut letters, masking tape, torn name labels with time chips, stamps, a tape marquee and photos that fly in and stick. All CSS, one small script.")
  .replace(/(START TODAY'S PAGE)(<svg)/, "SEE THE COMPONENTS$2")
  .replace(/(<a class="ghostlink" href="#how">)[^<]*/, "$1Tokens")
  .replace(/Times from your camera/, `${C.length} components`)
  .replace(/Six photos a page/, "Six display faces")
  .replace(/Cut-letter titles<\/li>/, "Motion in CSS</li>");
if (!HERO_TOP.includes("SEE THE COMPONENTS") || HERO_TOP.includes("EVERY") || HERO_TOP.includes('class="nav"') || !HERO_TOP.includes("in a <span")) throw new Error("specimen hero rewrite failed");
const CHROME = `
body{margin:0;background:var(--pu-cobalt)}
.sp-meta{position:relative;z-index:2;max-width:var(--pu-wrap-hero);margin:0 auto;padding:20px 40px 0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px}
.sp-label{margin:0;font:700 13px/1.4 var(--pu-font-body);letter-spacing:.04em;text-transform:uppercase;color:rgb(255 255 255/.86)}
.sp-label::before{content:"";display:inline-block;width:10px;height:10px;margin:0 9px 1px 0;background:var(--pu-yellow);rotate:-8deg;vertical-align:middle}
.sp-top .pu-hero{min-height:0;padding-bottom:150px}
.sp-main{max-width:var(--pu-wrap);margin:0 auto;padding:24px var(--pu-gutter) 120px}
.sp-sec{padding:84px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:22px;padding-bottom:18px;border-bottom:var(--pu-rule-bold) dashed rgb(255 255 255/.4)}
.sp-head h2{margin:10px 0 0;font:400 clamp(26px,3vw,36px)/1.05 var(--pu-font-black);text-transform:uppercase;color:var(--pu-white)}
.sp-note{margin:0;max-width:700px;font:700 15px/1.55 var(--pu-font-body);color:rgb(255 255 255/.86)}
.sp-demo{position:relative;overflow:clip;padding:clamp(12px,3vw,36px);border:var(--pu-rule) dashed rgb(255 255 255/.32)}
.sp-demo>.pu-hero{margin:calc(-1 * clamp(12px,3vw,36px))}
@media (max-width:820px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-meta{padding:16px 22px 0}.sp-main{padding-left:16px;padding-right:16px}}
/* The title is the wordmark at 2.2x: on a phone it has to come down further than the page's own .72 */
@media (max-width:520px){.sp-top .pu-hl{zoom:.64}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">pasteup@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(HERO_TOP))}
</header>`;
const DEFS = `<svg id="pu-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"></svg>`;
const specimen = renderSpecimen({
  name: "Paste-Up",
  slug: "pasteup",
  version: VERSION,
  prefix: "pu",
  rootClass: "pu",
  labelClass: "sp-label",
  script: "scripts/systems/pasteup.mjs",
  source: SOURCE,
  metaDescription: "The Paste-Up design system: tokens and working components extracted from the Paste-Up travel journal page.",
  defsNote: "empty: Paste-Up draws with CSS, inline SVG icons and its textures (tex-*.png/jpg beside the CSS)",
  jsNote: "the collage's pointer parallax (data-pu-depth layers); everything else moves in CSS",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});
// Pictures are files beside the specimen, never inlined
if (/<img|data:image|base64,/.test(specimen)) throw new Error("the specimen carries an inlined image");

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "pasteup", prefix: "pu", rootClass: "pu", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["cut", "e0", "e1", "e2", "e3", "ppr", "rag", "rag2", "rag3", "prt", "nsh", "tape", "chip", "btn", "s1", "s2", "ph", "lay", "hero", "nav", "navlink", "stage", "layer", "stamp", "paper", "print", "marquee", "track", "hl", "serif", "uline", "facts", "ghostlink", "big"] });
