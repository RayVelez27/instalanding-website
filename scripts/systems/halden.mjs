// Extracts the Halden design system from its landing page.
//
//   node scripts/systems/halden.mjs
//
// Reads public/demos/halden-clinical.html (never edits it) and writes
// public/systems/halden/ (specimen.html, tokens.css, halden.css) through the
// shared pipeline in lib.mjs. The page keeps its CSS in cascade layers (tokens,
// base, atoms, layout, sections, scenes) with one <style> per section, scoped
// by section id; the system flattens the layers in their cascade order, turns
// each section id into a component class (#diagnosis -> .hd-diagnosis), drops
// the m- / l- atom prefixes (.m-btn -> .hd-btn) and scopes everything under .hd.
// The page scrolls with GSAP, SplitText and Lenis; the system does not: every
// component renders complete, and the menu, the diagnosis scan, the route
// cursor, the review reading box and the booking form run on one small script
// with data-hd-* hooks. Every picture is the page's own inline SVG.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/halden-clinical.html";
const { page, el } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">';
const GRAIN = /\.m-surface \{[^}]*?background-image: (url\("data:image\/svg\+xml,[^"]+"\))/.exec(page)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Halden · halden@${VERSION}
   Extracted from https://instalanding.ai/demos/halden-clinical.html
   Fonts (Google Fonts): Geist 300-600 (text and display), Geist Mono 400-500 (labels), Instrument Serif italic (accents) */
:root {
  /* Color · core */
  --hd-ink: #090C0E;
  --hd-paper: #F3F5F6;
  --hd-cobalt: #2B46FF;
  --hd-monitor: #3FD99A;

  /* Color · greys */
  --hd-mist: #D3D9DC;
  --hd-steel: #8A959B;
  --hd-slate: #58626A;
  --hd-graphite: #1A2329;
  --hd-frost: #E2E7EA;
  --hd-white: #FFFFFF;

  /* Type · families */
  --hd-font-sans: "Geist", "Helvetica Neue", Arial, sans-serif;
  --hd-font-mono: "Geist Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  --hd-font-serif: "Instrument Serif", "Iowan Old Style", Georgia, serif;

  /* Type · scale */
  --hd-display: clamp(56px, 10.4vw, 152px);
  --hd-quote: clamp(28px, 4.1vw, 58px);
  --hd-title: clamp(26px, 2.9vw, 40px);
  --hd-price: 22px;
  --hd-text: 17px;
  --hd-body: 16.5px;
  --hd-small: 12px;
  --hd-caps: 11.5px;
  --hd-spread: 11px;

  /* Shape · radii */
  --hd-r-pill: 999px;
  --hd-r-sm: 6px;
  --hd-r-md: 10px;
  --hd-r-lg: 12px;
  --hd-r-xl: 14px;

  /* Shape · borders */
  --hd-hairline: 1px;

  /* Depth · grain, glow and shadow */
  --hd-grain: ${GRAIN};
  --hd-glow: radial-gradient(120% 70% at 85% 0%, color-mix(in srgb, var(--hd-cobalt) 16%, transparent), transparent 60%);
  --hd-shadow-form: 0 40px 80px -50px rgba(9, 12, 14, .35);

  /* Motion · easing */
  --hd-ease: cubic-bezier(.7, 0, .2, 1);
  --hd-ease-out: cubic-bezier(.16, .8, .2, 1);
  --hd-ease-pulse: cubic-bezier(.65, 0, .25, 1);

  /* Motion · durations */
  --hd-dur-fast: .3s;
  --hd-dur-open: .35s;
  --hd-dur: .45s;
  --hd-dur-flow: .7s;
  --hd-dur-live: 2.4s;
  --hd-dur-pulse: 3.6s;
  --hd-dur-ecg: 5.2s;

  /* Space · layout */
  --hd-gutter: clamp(16px, 1.8vw, 28px);
  --hd-section: clamp(96px, 12vw, 184px);
  --hd-block: clamp(64px, 9vw, 120px);
  --hd-nav-h: 60px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's numbered tokens get names; every other custom property (the local
// knobs --u, --pitch, --l, --r, --m, --a, --b, --label …) moves under --hd-
const VARS = {
  label: "label-w",
  "color-1": "ink", "color-2": "paper", "color-3": "mist", "color-4": "steel", "color-5": "slate", "color-6": "cobalt",
  "color-7": "graphite", "color-8": "frost", "color-9": "monitor",
  "font-1": "font-sans", "font-2": "font-mono", "font-3": "font-mono", "font-4": "font-serif",
  "radius-1": "r-pill", "radius-2": "r-sm", "space-1": "gutter", "space-2": "section",
};
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("hd-") ? m : `--hd-${VARS[n] ?? n}`));
// Section ids become component classes (already final: the prefixer leaves hd- names alone)
const SEC = { navigation: "nav", opening: "hero", diagnosis: "diagnosis", prices: "rates", bench: "bench", refurb: "shelf", fleet: "routes", mailin: "steps", reviews: "reviews", faq: "faq", visit: "booking", footer: "footer" };
// Atoms lose their m- / l- prefix before taking hd- (.m-btn -> .hd-btn, .l-grid -> .hd-grid)
const bare = (c) => c.replace(/^m-/, "").replace(/^l-(grid|wrap)$/, "$1");
const end = "(?=\\s*[;}])";
const esc = (v) => v.replace(/[().,]/g, "\\$&");
const fs = (v, tok) => [new RegExp(`font-size:\\s*${esc(v)}${end}`, "g"), `font-size: var(--hd-${tok})`];
const SWAPS = [
  fs("clamp(56px, 10.4vw, 152px)", "display"), fs("clamp(28px, 4.1vw, 58px)", "quote"), fs("clamp(26px, 2.9vw, 40px)", "title"),
  fs("22px", "price"), fs("17px", "text"), fs("16.5px", "body"), fs("12px", "small"), fs("11.5px", "caps"), fs("11px", "spread"),
  [new RegExp(`border-radius:\\s*10px${end}`, "g"), "border-radius: var(--hd-r-md)"],
  [new RegExp(`border-radius:\\s*12px${end}`, "g"), "border-radius: var(--hd-r-lg)"],
  [new RegExp(`border-radius:\\s*14px${end}`, "g"), "border-radius: var(--hd-r-xl)"],
  [/((?:^|[\s;{])border(?:-(?:top|bottom|left|right))?:\s*)1px solid/g, "$1var(--hd-hairline) solid"],
  [/box-shadow: 0 40px 80px -50px rgba\(9, 12, 14, \.35\)/g, "box-shadow: var(--hd-shadow-form)"],
  [/background-image: url\("data:image\/svg\+xml,[^"]+"\)/g, "background-image: var(--hd-grain)"],
  [/radial-gradient\(120% 70% at 85% 0%, color-mix\(in srgb, var\(--hd-cobalt\) 16%, transparent\), transparent 60%\), var\(--hd-grain, none\)/g, "var(--hd-glow), var(--hd-grain)"],
  [/height: 60px;/g, "height: var(--hd-nav-h);"],
  [/cubic-bezier\(\.7, 0, \.2, 1\)/g, "var(--hd-ease)"],
  [/cubic-bezier\(\.16, \.8, \.2, 1\)/g, "var(--hd-ease-out)"],
  [/cubic-bezier\(\.65, 0, \.25, 1\)/g, "var(--hd-ease-pulse)"],
  [/ \.45s(?=[\s;,)}])/g, " var(--hd-dur)"],
  [/ \.35s(?=[\s;,)}])/g, " var(--hd-dur-open)"],
  [/ \.3s(?=[\s;,)}])/g, " var(--hd-dur-fast)"],
  [/ \.7s linear/g, " var(--hd-dur-flow) linear"],
  [/ 2\.4s ease-out/g, " var(--hd-dur-live) ease-out"],
  [/ 3\.6s /g, " var(--hd-dur-pulse) "],
  [/ 5\.2s linear/g, " var(--hd-dur-ecg) linear"],
  [/background: #fff;/g, "background: var(--hd-white);"],
];

/* ── 3. Component CSS: the page's layered <style> blocks, flattened ───── */
function splitRules(css) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) { out.push(css.slice(start, i + 1).trim()); start = i + 1; }
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
// Every <style data-8b-part> block, unwrapped from its @layer and re-sorted in the
// page's layer order, so the flat sheet cascades the way the layered one did
const LAYERS = ["base", "atoms", "layout", "sections", "scenes"];
const byLayer = Object.fromEntries(LAYERS.map((l) => [l, []]));
for (const m of page.matchAll(/<style data-8b-part="([^"]+)">\n([\s\S]*?)<\/style>/g)) {
  if (m[1] === "layers" || m[1] === "tokens") continue;
  for (const rule of splitRules(m[2].replace(/\/\*[\s\S]*?\*\//g, ""))) {
    const layer = /^@layer ([a-z]+)\s*\{/.exec(rule);
    if (!layer) throw new Error("unlayered rule in " + m[1]);
    byLayer[layer[1]].push(...splitRules(rule.slice(rule.indexOf("{") + 1, -1)));
  }
}
const pageCss = LAYERS.map((l) => byLayer[l].join("\n")).join("\n");

// Page-only parts: the document shell, Lenis, the skip link, the hidden-nav state,
// the opening's second act (stair headline, tiles, flood), the parts sheet and the
// pinned horizontal shelf
const DROP = /^html|\.lenis|^\.skip|#parts|\.op-(second|stair|tiles?|note|flood)|#opening \.[wt]\d|\.nav__bar\.is-hidden|\[data-shelf\]/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.hd, .hd *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.hd, .hd *)${sel.slice(1)}`;
  if (sel === "body") return ".hd";
  return sel
    .replace(/#([a-z]+)/g, (m, id) => (SEC[id] ? `.hd-${SEC[id]}` : m))
    .replace(/\[data-(scan|run|loop)/g, "[data-hd-$1")
    .replace(/\.([a-z][\w-]*)/g, (m, c) => (c.startsWith("hd-") ? m : `.${bare(c)}`));
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule.replace("m-link-flow", "link-flow");
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body.replace("m-link-flow", "link-flow")}}` : "";
  }).filter(Boolean).join("\n");
}
// The page's ground was ink; the system's root is paper (ink sections carry .hd-surface)
const BODY_TONE = "background: var(--color-1); color: var(--color-3); font-family";
if (!pageCss.includes(BODY_TONE)) throw new Error("body tone not found");
const base = renameVars(keep(pageCss.replace(BODY_TONE, "background: var(--color-2); color: var(--color-1); font-family")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's scroll hooks, anchors and ids belong to the page, not the system;
// ids inside the inline pictures stay, under hd-
const SVG_IDS = new Set();
for (const s of page.slice(page.search(/<body[\s>]/)).matchAll(/<svg[\s\S]*?<\/svg>/g)) for (const m of s[0].matchAll(/ id="([^"]+)"/g)) SVG_IDS.add(m[1]);
const unhook = (html) => html
  .replace(/ data-8b-[a-z-]+(="[^"]*")?(?=[\s>])/g, "")
  .replace(/ data-(section|lenis-prevent|r)(="[^"]*")?(?=[\s>])/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/(<a\b[^>]*?) href="#[a-z-]*"/g, '$1 href="#"')
  .replace(/ id="([^"]+)"/g, (m, id) => (SVG_IDS.has(id) ? ` id="hd-${id}"` : ""))
  .replace(/url\(#([^)]+)\)/g, (m, id) => (SVG_IDS.has(id) ? `url(#hd-${id})` : m))
  .replace(/href="#([^"]+)"/g, (m, id) => (SVG_IDS.has(id) ? `href="#hd-${id}"` : m))
  .replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter(Boolean).map((c) => (c.startsWith("hd-") ? c : bare(c))).join(" ")}"`);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });
// A page section as a component: its id becomes the component class
const section = (id, tag = "section") => el(`<${tag} id="${id}"`).replace(new RegExp(`^<${tag} id="${id}"(?: class="([^"]*)")?[^>]*>`), (_, cls) => `<${tag} class="hd-${SEC[id]}${cls ? " " + cls : ""}">`);
const cut = (html, marker) => html.replace(sliceEl(html, marker).html, "");

add("nav", "Navigation", "An ink bar on a four-column grid: the wordmark with its three-dash mark, a live status line with a pulsing monitor-green dot (from 1280px), mono uppercase links whose dashed underline draws in on hover, and the Book service pill. Under 1024px the links fold behind an icon button that opens a menu panel of large links and contact lines.",
  section("navigation", "header").replace('<header class="hd-nav">', '<header class="hd-nav m-surface">'), { js: true });

const btn = /<a class="m-btn" href="#visit"><span class="m-btn__label">Book service<\/span><\/a>/.exec(page)[0];
const btn2 = /<a data-8b-placeholder="email" class="m-btn-2" href="mailto:accounts@halden\.example"><span class="m-btn__label">Open an account<\/span><\/a>/.exec(page)[0];
const lnk = /<a class="m-link m-text-3" href="#visit">Reserve<\/a>/.exec(page)[0];
const iconBtn = /<button class="nav__toggle m-icon-btn"[^>]*>[\s\S]*?<\/button>/.exec(page)[0].replace("nav__toggle ", "");
const selected = /<p class="pr-note m-text">[\s\S]*?<\/p>/.exec(page)[0];
add("buttons", "Buttons & links", "Pill buttons in Geist Mono caps with a trailing dash: on hover cobalt wipes in from the left and the dash stretches (light on ink, ink on paper). Links carry a dashed underline that flows on hover; the icon button is two pill bars that slide apart; a cobalt highlight (.hd-select) marks the one phrase that matters.",
  `<div class="m-surface" style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px; padding: 32px var(--hd-gutter)">${btn}${lnk}${iconBtn}</div>
<div class="m-surface-2" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); align-items: center; gap: 22px; padding: 32px var(--hd-gutter)"><div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">${btn2}${lnk}<span class="m-dash" style="width: 3em" aria-hidden="true"></span></div>${selected.replace(' class="pr-note m-text"', ' class="m-text" style="max-width: 44ch"')}</div>`);

add("hero", "Dot-matrix hero", "The HALDEN wordmark built from pill rows on a 5 x 7 grid per letter (sized from the container by --hd-u, so letters change by editing the spans), a cobalt glow over grain, a Geist headline that turns to Instrument Serif italic, a lead, a pill button and a link, an ECG trace with a monitor-green sweep, and the address bar. The rows pulse sideways in turn; on phones the wordmark breaks into two lines.",
  `<div class="hd-hero">\n${cut(sliceEl(page, '<div class="op-stage m-surface">', page.search(/<body[\s>]/)).html, '<div class="op-flood"')}\n</div>`, { js: true });

add("readout", "Live readout strip", "The monitor's ECG trace over a mono status bar: a graphite baseline, a faint green tail and a glowing green head sweep across every 5.2s. Monitor green appears only on live readouts like this one.",
  `<div class="hd-hero hd-readout m-surface">\n${/<svg class="op-ecg"[\s\S]*?<\/svg>/.exec(page)[0]}\n${/<ul class="op-bar m-text-3">[\s\S]*?<\/ul>/.exec(page)[0]}\n</div>`);

add("diagnosis", "Diagnosis board", "A staggered display headline beside a graphite board of twelve checks: name on the left, a dashed result on the right, faults marked with a long cobalt dash. A cobalt band scans down the list, each result appears as it passes and the summary lands last. Without the script, or with motion reduced, every result is shown.",
  section("diagnosis"), { js: true });

add("rates", "Rate card", "A real table on paper: grouped rows of service names with model lines in mono caps, a cobalt bar sized to the bench time (--hd-m in minutes, out of 180), and a right-aligned price. The note above uses the cobalt highlight; the footnote is mono caps.",
  cut(section("prices"), '<tbody data-8b-motion="dash">\n      <tr class="pr-group"><th colspan="3" scope="colgroup" class="m-text-3">Imaging and diagnostics'));

add("bench", "Bench strips", "A three-word headline set on the column grid, then one picture cut into four strips with 3px seams (one SVG drawn once, the other strips <use> it at an offset), a mono caption and three short columns of copy.",
  section("bench"));

add("shelf", "Device shelf", "Device cards on ink: a mono index, a 4:5 picture with a graphite hairline, the name in Geist, a mono spec line and a price beside a Reserve link over a rule. An intro row and a closing note bracket the cards.",
  cut(cut(section("refurb"), '<article class="rf-item">\n        <p class="rf-num m-text-3">(05)'), '<article class="rf-item">\n        <p class="rf-num m-text-3">(04)'));

add("routes", "Route board", "A week of pickup windows on an hour axis: each day's label in Geist with the area in mono caps, each window a pill bar with its time above it, positioned by --hd-a and --hd-b (start and end hour, 08-18). A cobalt cursor sweeps the day; windows it has passed turn ink and the current one turns cobalt.",
  section("fleet"), { js: true });

add("steps", "Process steps", "A two-word display title, then four steps on the column grid, each opened by a full-width pill dash, a Geist step name and a line of copy; a pill button and a mono note close it.",
  section("mailin"));

add("reviews", "Review quotes", "Large light Geist quotes that step across the grid, with a mono byline. A cobalt selection box reads each quote word by word, turning the word paper as it passes.",
  cut(section("reviews"), '<li class="rv-item">\n      <blockquote class="rv-quote m-text-4"><span class="rv-sel" aria-hidden="true"></span><p>They told us'), { js: true });

add("faq", "FAQ", "A staggered display title beside native details rows on graphite rules; the pill dash at the end of each question shrinks and slides when it opens.",
  section("faq"));

add("booking", "Booking form", "Visit facts in a two-column definition list over a picture, beside a white form card: mono caps labels over underlined fields, selects and a textarea, a cobalt focus ring, an ink submit pill and a status line that answers on submit (cobalt when something is missing).",
  section("visit"), { js: true });

add("footer", "Footer", "On ink: the ECG trace, a brand line with a serif accent, three mono columns of links and the legal line over a graphite rule.",
  section("footer", "footer"));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.replace(/url\([^)]*\)/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "hd" && !m[1].startsWith("hd-")) CLASSES.add(m[1]);
}
// Classes only the markup or the script uses get the prefix too
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("hd-")) CLASSES.add(n);
["is-done", "is-scan", "is-on", "is-summed", "is-past", "is-now", "is-sel", "is-error", "rv-w"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["link-flow", "op-in", "op-rise", "op-pulse", "live", "ecg-tail", "ecg-head"];
const ATTRS = ["ok", "error"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "hd", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(renameVars(html));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .hd itself, or :where(.hd) in front
const ROOTED = /(^|[\s,(>+~])\.hd(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.hd) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
.hd-nav { position: relative; }
.hd-nav .hd-nav__bar { position: relative; inset: auto; z-index: auto; }
.hd-nav .hd-nav__menu { position: relative; inset: auto; z-index: auto; min-height: 0; padding: 72px var(--hd-gutter) 28px; overflow: visible; }
.hd-nav .hd-nav__menu-close { top: 14px; }
.hd-hero .hd-op-stage { position: relative; height: auto; padding: clamp(28px, 4vw, 56px) var(--hd-gutter) 0; }
.hd-hero .hd-op-wm { --hd-u: calc(100cqw / 35); margin-block: 0 clamp(32px, 5vw, 72px); }
.hd-hero .hd-op-copy { min-height: 0; }
.hd-readout { padding: 22px var(--hd-gutter) 4px; }
@media (max-width: 47.99em) {
.hd-hero .hd-op-wm { --hd-u: calc(100cqw / 17); }
.hd-routes .hd-fl-win:last-child .hd-fl-time { left: auto; right: 0; }
}
@media (prefers-reduced-motion: no-preference) {
.hd-diagnosis[data-hd-scan] .hd-dg-band { transition: opacity .2s, transform .22s var(--hd-ease-out), height .22s var(--hd-ease-out); }
.hd-reviews .hd-rv-sel { transition: transform .2s var(--hd-ease-out), opacity .2s; }
}`;
// Fixed and viewport-tall on the page; components sit in the flow and size from their own width.
// Sections pad with --hd-block here (pages space them with --hd-section).
const componentCss = rootEvery(prefixCss(tokenize(base)).replace(/padding: var\(--hd-section\) /g, "padding: var(--hd-block) ") + "\n" + EXTRA)
  .replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Halden components, no libraries. The menu and the booking form answer clicks
     and submits; the hero pulse, the diagnosis scan, the route cursor and the
     review reading box loop only while on screen, and not at all with
     prefers-reduced-motion (every component is complete without them). */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  function seen(el, fn) {
    if (!window.IntersectionObserver) { fn(true); return; }
    new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }).observe(el);
  }

  /* Hero: the wordmark rows pulse only while the stage is on screen */
  function hero(stage) {
    var sec = stage.closest('.hd-hero');
    if (sec) seen(stage, function (on) { sec.setAttribute('data-hd-loop', on ? 'on' : 'off'); });
  }

  /* Diagnosis: a cobalt band walks the checks, each result appears as it passes, then the summary */
  function scan(sec) {
    var list = sec.querySelector('.hd-dg-list'), band = sec.querySelector('.hd-dg-band');
    if (!list || !band) return;
    var rows = [].slice.call(list.children), n = rows.length, i = -1, timer = 0;
    function paint() {
      rows.forEach(function (r, k) { r.classList.toggle('hd-is-done', k < i); r.classList.toggle('hd-is-scan', k === i); });
      var row = rows[i];
      if (row) { band.style.height = row.offsetHeight + 'px'; band.style.transform = 'translateY(' + row.offsetTop + 'px)'; }
      band.classList.toggle('hd-is-on', !!row);
      sec.classList.toggle('hd-is-summed', i >= n);
    }
    function tick() {
      i = i >= n ? -1 : i + 1;
      paint();
      timer = setTimeout(tick, i >= n ? 4200 : i < 0 ? 700 : 460);
    }
    seen(sec, function (on) {
      clearTimeout(timer);
      if (!on) return;
      sec.setAttribute('data-hd-scan', '');
      tick();
    });
  }

  /* Routes: a cursor sweeps 08:00 to 18:00; windows behind it turn ink, the one under it cobalt */
  function route(sec) {
    var board = sec.querySelector('.hd-fl-board'), cursor = sec.querySelector('.hd-fl-cursor'), track = sec.querySelector('.hd-fl-track');
    if (!board || !cursor || !track) return;
    var bars = [].map.call(sec.querySelectorAll('.hd-fl-win'), function (w) {
      return { bar: w.querySelector('.hd-fl-bar'), a: parseFloat(w.style.getPropertyValue('--hd-a')), b: parseFloat(w.style.getPropertyValue('--hd-b')) };
    });
    var raf = 0, t0 = 0, RUN = 7000, HOLD = 1600;
    function update(p) {
      var hour = 8 + p * 10;
      cursor.style.transform = 'translateX(' + (track.offsetLeft + p * track.offsetWidth - 1) + 'px)';
      cursor.classList.toggle('hd-is-on', p > 0 && p < 1);
      bars.forEach(function (o) {
        if (!o.bar) return;
        o.bar.classList.toggle('hd-is-past', p >= 1 || hour >= o.b);
        o.bar.classList.toggle('hd-is-now', p > 0 && p < 1 && hour >= o.a && hour < o.b);
      });
    }
    function frame(now) { update(Math.min(1, ((now - t0) % (RUN + HOLD)) / RUN)); raf = requestAnimationFrame(frame); }
    seen(board, function (on) {
      cancelAnimationFrame(raf);
      if (!on) return;
      sec.setAttribute('data-hd-run', '');
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    });
  }

  /* Reviews: the selection box reads the quote word by word */
  function read(quote) {
    var p = quote.querySelector('p'), box = quote.querySelector('.hd-rv-sel');
    if (!p || !box) return;
    var words = p.textContent.trim().split(/\\s+/);
    p.textContent = '';
    words.forEach(function (w, k) {
      var s = document.createElement('span');
      s.className = 'hd-rv-w';
      s.textContent = w;
      p.appendChild(s);
      if (k < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
    var spans = p.querySelectorAll('.hd-rv-w'), i = -1, timer = 0;
    function step() {
      if (i >= 0) spans[i].classList.remove('hd-is-sel');
      i = i + 1 >= spans.length ? -1 : i + 1;
      box.classList.toggle('hd-is-on', i >= 0);
      if (i >= 0) {
        var s = spans[i], pad = s.offsetHeight * .08;
        s.classList.add('hd-is-sel');
        // A new line: jump instead of gliding across the text
        var y = p.offsetTop + s.offsetTop, jump = y !== box._hdY;
        box._hdY = y;
        if (jump) { box.style.transition = 'opacity .2s'; void box.offsetWidth; }
        box.style.transform = 'translate(' + (p.offsetLeft + s.offsetLeft - pad) + 'px,' + (p.offsetTop + s.offsetTop) + 'px) scale(' + ((s.offsetWidth + pad * 2) / 100) + ',' + (s.offsetHeight / 100) + ')';
      }
      if (box.style.transition) requestAnimationFrame(function () { box.style.transition = ''; });
      timer = setTimeout(step, i < 0 ? 1400 : 240);
    }
    seen(quote, function (on) { clearTimeout(timer); if (on) step(); });
  }

  function init(scope) {
    if (reduce) return;
    each(scope, '.hd-op-stage', function (el) { if (el._hd) return; el._hd = true; hero(el); });
    each(scope, '.hd-diagnosis', function (el) { if (el._hd) return; el._hd = true; scan(el); });
    each(scope, '.hd-routes', function (el) { if (el._hd) return; el._hd = true; route(el); });
    each(scope, '.hd-rv-quote', function (el) { if (el._hd) return; el._hd = true; read(el); });
  }
  init(document);
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; init(document); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Menu: the icon button opens the panel under the bar; close, a link or Escape shut it */
  function setMenu(nav, open) {
    var menu = nav.querySelector('.hd-nav__menu'), toggle = nav.querySelector('.hd-nav__toggle');
    if (!menu) return;
    menu.hidden = !open;
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    var focus = open ? menu.querySelector('.hd-nav__menu-close') : toggle;
    if (focus) focus.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.hd')) return;
    var nav = t.closest('.hd-nav');
    if (nav && t.closest('.hd-nav__toggle')) { setMenu(nav, true); return; }
    if (nav && t.closest('.hd-nav__menu-close')) { setMenu(nav, false); return; }
    if (nav && t.closest('.hd-nav__menu a')) { nav.querySelector('.hd-nav__menu').hidden = true; var tg = nav.querySelector('.hd-nav__toggle'); if (tg) tg.setAttribute('aria-expanded', 'false'); }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    each(document, '.hd-nav', function (nav) { var m = nav.querySelector('.hd-nav__menu'); if (m && !m.hidden) setMenu(nav, false); });
  });

  /* Booking: name and a contact are required; the status line answers */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.hd-vs-form');
    if (!form) return;
    e.preventDefault();
    var status = form.querySelector('.hd-vs-status');
    var name = form.elements.namedItem('name'), contact = form.elements.namedItem('contact');
    var ok = !!(name && name.value.trim() && contact && contact.value.trim());
    if (status) {
      status.textContent = status.getAttribute(ok ? 'data-hd-ok' : 'data-hd-error');
      status.classList.toggle('hd-is-error', !ok);
    }
    if (ok) form.reset();
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(/<a class="nav__brand" href="#opening">[\s\S]*?<\/a>/.exec(page)[0]));
const CHROME = `
body{margin:0;background:var(--hd-paper)}
.sp-top{padding:20px var(--hd-gutter) 64px;color:var(--hd-ink)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:1px solid var(--hd-frost)}
.sp-meta>span{font:400 var(--hd-caps)/1.4 var(--hd-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--hd-slate)}
.sp-brand{display:inline-flex;align-items:center;gap:10px;font:500 14px/1 var(--hd-font-sans);letter-spacing:.22em;text-transform:uppercase;text-decoration:none;color:var(--hd-ink)}
.sp-brand .hd-dash{height:6px;min-width:0;width:7px}
.sp-brand .hd-dash:nth-child(2){width:16px}
.sp-brand>span{display:inline-flex;gap:3px;align-items:center}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:32px 48px;align-items:end;margin-top:clamp(40px,7vw,96px)}
.sp-hero h1{margin:0;font:300 clamp(46px,8vw,124px)/.92 var(--hd-font-sans);letter-spacing:-.05em}
.sp-hero h1 em{font-family:var(--hd-font-serif);font-style:italic;font-weight:400;letter-spacing:-.02em;color:var(--hd-slate)}
.sp-hero p{margin:0;max-width:46ch;font-size:var(--hd-body);line-height:1.6;color:var(--hd-slate)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:24px}
.sp-swatches i{display:block;height:52px;border-radius:var(--hd-r-sm);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--hd-ink) 10%,transparent)}
.sp-main{padding:0 var(--hd-gutter) 120px}
.sp-sec{padding:64px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font:350 clamp(24px,2.4vw,34px)/1.1 var(--hd-font-sans);letter-spacing:-.028em;color:var(--hd-ink)}
.sp-label{margin:0;font:400 var(--hd-caps)/1.4 var(--hd-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--hd-cobalt)}
.sp-note{margin:0;max-width:660px;font-size:15.5px;line-height:1.6;color:var(--hd-slate)}
.sp-demo{position:relative;border-radius:var(--hd-r-xl);overflow:clip;box-shadow:0 0 0 1px var(--hd-frost)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HERO = `
<header class="sp-top">
<div class="sp-meta">${brand.replace('class="hd-nav__brand"', 'class="sp-brand"').replace('class="hd-nav__mark"', "")}<span>Design system · halden@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Ink and paper, <em>on record.</em></h1>
<div>
<p>A calm, precise clinical language: ink and paper sections, one cobalt signal, monitor green kept for live readouts, Geist set light with Instrument Serif italic accents, mono caps for every label, and a dot-matrix wordmark built from pill rows. Extracted from the Halden Clinical Equipment page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--hd-ink" style="background:var(--hd-ink)"></i><i title="--hd-paper" style="background:var(--hd-paper)"></i><i title="--hd-cobalt" style="background:var(--hd-cobalt)"></i><i title="--hd-monitor" style="background:var(--hd-monitor)"></i><i title="--hd-steel" style="background:var(--hd-steel)"></i>
</div>
</div>
</div>
</header>`;
const DEFS = '<svg id="hd-defs" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden"></svg>';
const specimen = renderSpecimen({
  name: "Halden",
  slug: "halden",
  version: VERSION,
  prefix: "hd",
  rootClass: "hd",
  labelClass: "sp-label",
  script: "scripts/systems/halden.mjs",
  source: SOURCE,
  metaDescription: "The Halden design system: tokens and working components extracted from the Halden Clinical Equipment page.",
  defsNote: "empty: every picture is inline SVG inside its component (ids under hd-)",
  jsNote: "the menu, the hero pulse gate, the diagnosis scan, the route cursor, the review reading box and the booking form (no GSAP)",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "halden", prefix: "hd", rootClass: "hd", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["m-btn", "btn", "m-link", "link", "m-text", "dg-row", "pr-table", "rf-item", "fl-day", "ml-step", "rv-item", "fq-item", "vs-form", "op-wm", "nav__bar"] });
