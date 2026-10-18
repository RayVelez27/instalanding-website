// Extracts the Meridian design system from its landing page.
//
//   node scripts/systems/meridian.mjs
//
// Reads public/demos/meridian-led-storefront.html (never edits it) and writes
// public/systems/meridian/ (specimen.html, tokens.css, meridian.css) through the
// shared pipeline in lib.mjs. The page animates with GSAP; the system does not:
// the LED boards, the dot-matrix ticker, the Personal / Business switch, the
// slider and the FAQ run on a small self-contained script with data-md-* hooks.
import { readPage, dropStyle, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/meridian-led-storefront.html";
const { el, css: pageCssRaw, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Meridian · meridian@${VERSION}
   Extracted from https://instalanding.ai/demos/meridian-led-storefront.html
   Fonts (Google Fonts): Bricolage Grotesque 400-800, Fraunces italic 300-600, Instrument Sans 400-700, Inter 400-800 */
:root {
  /* Color · core */
  --md-bg: #F6F5F1;
  --md-surface: #FFFFFF;
  --md-ink: #111317;
  --md-gray: #6F747C;
  --md-dark: #16191E;
  --md-clay: #F1F0EC;
  --md-purple: #9D8CDC;
  --md-purple-deep: #6C5BBD;
  --md-green: #8FDEA0;
  --md-blue: #2F6FE0;

  /* Color · accents */
  --md-hairline: rgba(17, 19, 23, 0.08);
  --md-live: #6EE86E;
  --md-blue-glow: #5B9BFF;
  --md-blue-soft: #9CC0FF;
  --md-pink: #F59AFF;
  --md-btn-dark: #1D2129;
  --md-rule: #D4D3CF;

  /* Color · LED lines */
  --md-led-a: #FF4136;
  --md-led-b: #29B6FF;
  --md-led-c: #FFD60A;
  --md-led-d: #6EE86E;
  --md-led-e: #FF53B0;
  --md-led-f: #FF9A1F;
  --md-led-glyph: #B6F5C3;

  /* Color · LED housing */
  --md-led-panel: #0C0C10;
  --md-led-panel-hi: #1D1A26;
  --md-led-screen: #17151D;
  --md-led-dot: #1F1C26;
  --md-led-ticker: #0B0C0F;
  --md-led-mute: #8B8F98;

  /* Color · clay tints */
  --md-lilac: #DDD5FB;
  --md-lilac-deep: #B4A6E6;
  --md-mint: #D9F5DF;
  --md-mint-deep: #9FDFAF;
  --md-night: #2B2442;

  /* Type · families */
  --md-font-display: "Bricolage Grotesque", "Inter", sans-serif;
  --md-font-serif: "Fraunces", Georgia, serif;
  --md-font-body: "Instrument Sans", "Inter", sans-serif;
  --md-font-ui: "Inter", sans-serif;

  /* Type · scale */
  --md-display-xl: 88px;
  --md-display-lg: 60px;
  --md-display-md: 56px;
  --md-title-lg: 34px;
  --md-title: 26px;
  --md-title-sm: 22px;
  --md-body-lg: 17px;
  --md-body: 15px;
  --md-body-sm: 14px;
  --md-label: 12px;
  --md-label-sm: 11px;

  /* Shape · radii */
  --md-radius-pill: 999px;
  --md-radius-xl: 40px;
  --md-radius-lg: 32px;
  --md-radius-card: 26px;
  --md-radius-md: 22px;
  --md-radius-sm: 14px;
  --md-radius-xs: 10px;

  /* Shape · borders */
  --md-border: 1px;
  --md-border-strong: 2px;

  /* Depth · clay and glass */
  --md-shadow-soft: 0 1px 2px rgba(17,19,23,0.04), 0 8px 24px rgba(17,19,23,0.06), 0 32px 64px -24px rgba(17,19,23,0.12);
  --md-shadow-clay: 15px 15px 30px rgba(0,0,0,0.05), -10px -10px 20px rgba(255,255,255,0.8), inset 2px 2px 5px rgba(255,255,255,1), inset -3px -3px 10px rgba(0,0,0,0.04);
  --md-shadow-clay-dark: 10px 15px 25px rgba(0,0,0,0.18), inset 2px 2px 5px rgba(255,255,255,0.15), inset -3px -3px 8px rgba(0,0,0,0.4);
  --md-shadow-clay-purple: 15px 20px 35px rgba(157,140,220,0.25), inset 2px 2px 8px rgba(255,255,255,0.4), inset -4px -4px 12px rgba(0,0,0,0.15);
  --md-shadow-clay-green: 8px 12px 20px rgba(143,222,160,0.3), inset 2px 2px 6px rgba(255,255,255,0.6), inset -3px -3px 8px rgba(0,0,0,0.1);
  --md-glass: rgba(255,255,255,0.72);
  --md-glass-blur: blur(18px) saturate(1.4);

  /* Motion · easing */
  --md-ease-out: cubic-bezier(.2, .8, .2, 1);
  --md-ease-switch: cubic-bezier(.215, .61, .355, 1);
  --md-ease-in-out: cubic-bezier(.42, 0, .58, 1);

  /* Motion · durations */
  --md-dur-press: 0.2s;
  --md-dur-fast: 0.25s;
  --md-dur: 0.3s;
  --md-dur-turn: 0.35s;
  --md-dur-slide: 0.45s;
  --md-dur-mode: 0.6s;
  --md-dur-blink: 1.6s;
  --md-dur-chase: 2s;
  --md-dur-breathe: 5s;
  --md-dur-hues: 9s;

  /* Space · layout */
  --md-page-max: 1320px;
  --md-gutter: 40px;
  --md-section-y: 130px;
  --md-gap: 20px;
  --md-gap-sm: 12px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
const HEX = {
  "#f6f5f1": "bg", "#111317": "ink", "#6f747c": "gray", "#16191e": "dark", "#f1f0ec": "clay",
  "#9d8cdc": "purple", "#6c5bbd": "purple-deep", "#8fdea0": "green", "#2f6fe0": "blue",
  "#6ee86e": "live", "#5b9bff": "blue-glow", "#9cc0ff": "blue-soft", "#f59aff": "pink", "#1d2129": "btn-dark", "#d4d3cf": "rule",
  "#ff4136": "led-a", "#29b6ff": "led-b", "#ffd60a": "led-c", "#ff53b0": "led-e", "#ff9a1f": "led-f", "#b6f5c3": "led-glyph",
  "#0c0c10": "led-panel", "#1d1a26": "led-panel-hi", "#17151d": "led-screen", "#1f1c26": "led-dot", "#0b0c0f": "led-ticker", "#8b8f98": "led-mute",
  "#ddd5fb": "lilac", "#b4a6e6": "lilac-deep", "#d9f5df": "mint", "#9fdfaf": "mint-deep", "#2b2442": "night",
};
// The page's own custom properties, renamed into the system
const VARS = {
  "bg-color": "bg", surface: "surface", "text-dark": "ink", "text-gray": "gray", hairline: "hairline",
  "brand-purple": "purple", "brand-purple-deep": "purple-deep", "brand-green": "green", "brand-dark": "dark", "clay-light": "clay",
  serif: "font-serif", display: "font-display", text: "font-body",
  "clay-shadow-light": "shadow-clay", "clay-shadow-dark": "shadow-clay-dark", "clay-shadow-purple": "shadow-clay-purple",
  "clay-shadow-green": "shadow-clay-green", "soft-shadow": "shadow-soft",
};
const end = "(?=\\s*[;}])";
const fs = (px, tok) => [new RegExp(`font-size:\\s*${px}px${end}`, "g"), `font-size: var(--md-${tok})`];
const rad = (px, tok) => [new RegExp(`border-radius:\\s*${px}px${end}`, "g"), `border-radius: var(--md-radius-${tok})`];
const SWAPS = [
  fs(88, "display-xl"), fs(60, "display-lg"), fs(56, "display-md"), fs(34, "title-lg"), fs(26, "title"), fs(22, "title-sm"),
  fs(17, "body-lg"), fs(15, "body"), fs(14, "body-sm"), fs(12, "label"), fs(11, "label-sm"),
  rad(999, "pill"), rad(40, "xl"), rad(32, "lg"), rad(26, "card"), rad(22, "md"), rad(14, "sm"), rad(10, "xs"),
  [/cubic-bezier\(\.2,\s*\.8,\s*\.2,\s*1\)/g, "var(--md-ease-out)"],
  [/ 0\.3s(?=[\s;,)])/g, " var(--md-dur)"],
  [/ 0\.25s(?=[\s;,)])/g, " var(--md-dur-fast)"],
  [/ 0\.45s(?=[\s;,)])/g, " var(--md-dur-slide)"],
  [/ 0\.35s(?=[\s;,)])/g, " var(--md-dur-turn)"],
  [/ 0\.6s(?=[\s;,)])/g, " var(--md-dur-mode)"],
  [/ 1\.6s ease-in-out/g, " var(--md-dur-blink) ease-in-out"],
  [/ 2s linear/g, " var(--md-dur-chase) linear"],
  [/ 9s linear/g, " var(--md-dur-hues) linear"],
  [/ 5s ease-in-out/g, " var(--md-dur-breathe) ease-in-out"],
  [/url\(#glow-(light-biz|light|warm|green)\)/g, "url(#md-glow-$1)"],
];

/* ── 3. Component CSS: the page's <style>, minus what only the page needs ── */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
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
const nb = "(?![\\w-])";
// Page-only parts: the document shell, the hero layout and its timeline, the
// mode toast, scroll-reveal hooks, section spacing.
const DROP = new RegExp([
  `^html`, `^body::before`, `\\.ambient`, `\\.container${nb}`, `^\\.hero${nb}`, `\\.left-col`, `\\.right-col`, `\\.top-right-info`,
  `\\.info-text`, `\\.pixel-art`, `\\.bottom-timeline`, `\\.timeline-`, `\\.bottom-text-`, `\\.editors-choice`, `\\.bg-green-blob`,
  `\\.mode-toast`, `^section${nb}`, `^footer${nb}`, `^\\.quick${nb}`, `\\.faq-wrap`, `\\.faq-intro`, `\\.asterisk`, `\\.glow-filters`,
  `\\.led-trains`,
].join("|"));
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return prelude.includes("accent-in") ? "" : rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s));
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}

// Document-level selectors become selectors on the system root
function scopeSelector(sel) {
  let s = sel;
  if (s === "*") return ":where(.md, .md *)";
  if (s === "body") return ".md";
  s = s.replace(/^body\.is-business/, ".md.md-business").replace(/^body:not\(\.is-business\)/, ".md:not(.md-business)");
  return s;
}
function scope(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${scope(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map(scopeSelector).join(",\n")} {${body}}`;
  }).join("\n");
}

let base = stripComments(pageCssRaw).replace(/:root\s*\{[\s\S]*?\n\}\n/, "");
base = scope(keep(base));
base = base.replace(/var\(--([\w-]+)\)/g, (m, name) => (VARS[name] ? `var(--md-${VARS[name]})` : m));

// Every class the kept CSS uses gets the md- prefix (read from selectors only)
const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "md") CLASSES.add(m[1]);
}
["active", "open", "on", "booted", "orbit", "orbit2", "sat", "filtering", "offscreen", "led-stage", "led-board", "led-lit"].forEach((c) => CLASSES.add(c));
CLASSES.delete("md-business");
CLASSES.add("is-business"); // never emitted, kept harmless
const KEYFRAMES = ["led-chase", "led-hues", "led-breathe", "led-blink", "btn-dots-arrow"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({ prefix: "md", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES });

// Anything still without the root after prefixing (bare h1, a, nav, em…) goes under :where(.md)
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (s.includes(".md") ? s : `:where(.md) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
/* Ticker scroll, driven by CSS instead of GSAP: the track holds the message twice */
.md-ticker-track { animation: md-ticker var(--md-ticker-dur, 6s) steps(var(--md-ticker-steps, 100)) infinite; }
@keyframes md-ticker { to { transform: translateX(-50%); } }
/* The segmented thumb slides on its own transition (GSAP did this on the page) */
.md-segmented .md-seg-thumb { transition: transform var(--md-dur-slide) var(--md-ease-switch), width var(--md-dur-slide) var(--md-ease-switch); }
/* The shield card's orbit rings turn on CSS (GSAP did this on the page) */
.md-v-gov .md-orbit { animation: md-orbit 14s linear infinite; }
.md-v-gov .md-orbit2 { animation: md-orbit 22s linear infinite reverse; }
@keyframes md-orbit { to { transform: rotate(360deg); } }
/* FAQ answers open on height */
.md-faq-a { transition: height var(--md-dur-slide) var(--md-ease-out); }
/* A slider in a narrow column keeps its slides stacked (the page only did this under 1024px) */
.md-slider .md-slide { transition: opacity var(--md-dur-slide) var(--md-ease-out); }
@media (prefers-reduced-motion: reduce) {
  .md-ticker-track, .md-v-gov .md-orbit, .md-v-gov .md-orbit2 { animation: none; }
  .md-segmented .md-seg-thumb, .md-faq-a, .md-slider .md-slide { transition: none; }
}`;
const componentCss = rootEvery(prefixCss(tokenize(base)) + "\n" + EXTRA).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Markup helpers ───────────────────────────────────────────────── */
// The page's reveal / float hooks belong to its GSAP timeline, not the system
const unhook = (html) => html
  .replace(/ class="([^"]*)"/g, (m, cls) => {
    const kept = cls.split(/\s+/).filter((c) => c && !/^(gsap-[\w-]+|reveal-card|reveal|float-subtle|float-heavy|float-delay-\d)$/.test(c));
    return kept.length ? ` class="${kept.join(" ")}"` : "";
  })
  .replace(/ id="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-component="[^"]*"/g, "")
  .replace(/href="#[a-z-]+"/g, 'href="#"');
const brandmark = (() => {
  const nav = el('<nav class="gsap-nav"');
  return /<span class="brandmark">[\s\S]*?<\/svg>\s*Meridian<\/span>|<span class="brandmark">[\s\S]*?<\/span>/.exec(nav)[0];
})();
const LED = {
  hero: { cols: 36, rows: 20, mode: "chase", lines: {
    a: [[1, 3], [6, 8], [16, 8], [22, 14], [35, 14]], b: [[2, 18], [10, 10], [24, 10], [30, 4], [35, 4]],
    c: [[18, 1], [18, 7], [20, 9], [20, 19]], d: [[0, 12], [7, 12], [12, 7], [26, 7], [31, 12], [35, 12]],
    e: [[8, 17], [13, 17], [17, 13], [25, 13], [29, 17], [34, 17]], f: [[4, 1], [8, 5], [26, 5], [29, 2], [35, 2]] } },
  laptop: { cols: 24, rows: 16, mode: "rainbow", lines: {
    a: [[1, 2], [5, 6], [13, 6], [18, 11], [23, 11]], b: [[1, 14], [7, 8], [17, 8], [22, 3], [23, 3]],
    c: [[12, 0], [12, 15]], d: [[0, 10], [4, 10], [8, 14], [23, 14]] } },
  trade: { cols: 30, rows: 17, mode: "chase", lines: {
    a: [[0, 8], [29, 8]], b: [[3, 16], [11, 8], [19, 0]], c: [[15, 0], [15, 16]], d: [[2, 1], [17, 16], [29, 16]],
    f: [[29, 2], [23, 8], [23, 12], [27, 16]] } },
};
const ledAttr = (k) => ` data-md-led='${JSON.stringify(LED[k])}'`;

/* ── 5. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });

const nav = el('<nav class="gsap-nav"')
  .replace('<div class="segmented" id="segmented"', '<div class="segmented" data-md-seg');
add("nav", "Glass navigation", "A frosted pill on a soft shadow: the globe brandmark, quiet links and the Personal / Business segmented switch, whose white thumb slides between the two and swaps every [data-for] copy inside the system root.",
  `<div style="padding: 18px; border-radius: 26px; background: var(--md-bg)">\n${nav.replace("<nav ", '<nav style="position: relative; top: 0" ')}\n</div>`, { js: true });

const preorder = /<a href="#featured" class="btn-primary btn-dots">[\s\S]*?<\/a>/.exec(el('<div class="cta-group gsap-hero" data-for="personal">'))[0];
const onDark = /<a href="#" class="btn-primary btn-dots on-dark">[\s\S]*?<\/a>/.exec(el('<div class="slide s1 active">'))[0];
const shopNow = /<a href="#" class="btn-primary">Shop now[\s\S]*?<\/a>/.exec(el('<div class="travel '))[0];
add("buttons", "Buttons", "Dark pill buttons with clay depth: the dotted-arrow knob that animates on hover (pink in Personal, blue in Business), the green rotating arrow, the inverted pill for dark surfaces and an underlined text link.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">
${preorder}
${shopNow}
<a href="#" class="link-underline">Help me choose a laptop</a>
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px; margin-top: 22px; padding: 26px; border-radius: 32px; background: var(--md-dark)">
${onDark}
</div>`);

add("type", "Headline pairing", "Bricolage Grotesque headlines with one Fraunces italic word in a lilac gradient and a soft glow, a live-dot eyebrow, and a description in graded grey with one phrase lifted to ink.",
  el('<div class="section-head">'), { defs: true });

const badgeRow = el('<div class="badge-row gsap-hero">');
const reset = 'position: relative; inset: auto; top: auto; right: auto; bottom: auto; left: auto';
const sticker = el('<div class="floating-element sticker').replace('class="floating-element sticker float-heavy"', `class="floating-element sticker" style="${reset}; transform: rotate(15deg)"`);
const pillDark = el('<div class="floating-element pill-dark').replace('class="floating-element pill-dark float-subtle"', `class="floating-element pill-dark" style="${reset}"`);
const pillSecure = el('<div class="floating-element pill-secure').replace('class="floating-element pill-secure float-delay-1"', `class="floating-element pill-secure" style="${reset}"`);
const feather = el('<div class="feather').replace('class="feather float-subtle"', `class="feather" style="${reset}"`);
const chipBadge = el('<div class="chip-badge"').replace('<div class="chip-badge"', `<div class="chip-badge" style="${reset}; transform: none"`);
add("badges", "Badges & pills", "The small floating pieces: a NEW badge with a live dot, a rotated clay sticker, white offer pills with clay icon tiles, a lock pill, a glowing feature tag and a dark chip badge.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">
${badgeRow}
${sticker}
${pillDark}
${pillSecure}
${feather}
${chipBadge}
</div>`);

const ledPanel = el('<div class="led-panel"')
  .replace('<div class="led-panel" data-component="led-metro-map">', '<div class="led-panel" style="position: relative; top: 0; width: 100%">')
  .replace('<div class="led-modes" id="heroModes"', '<div class="led-modes" data-md-led-modes')
  .replace('<div class="led-swatches" id="heroSwatches"', '<div class="led-swatches" data-md-led-swatches')
  .replace('<div class="led-screen hero-led" id="heroLED" aria-hidden="true"></div>', `<div class="led-screen hero-led"${ledAttr("hero")} aria-hidden="true"></div>`);
add("led", "LED metro display", "A dark glass panel holding a dot-matrix board: metro lines lit dot by dot, interchange rings where lines cross, Chase / Rainbow / Breathe modes and colour swatches that isolate a line. Built from waypoints on a grid.",
  `<div style="max-width: 720px; margin: 0 auto">\n${ledPanel}\n</div>`, { js: true });

const ticker = el('<div class="ticker" id="ticker"')
  .replace('<div class="ticker" id="ticker" data-component="dot-matrix-ticker"', '<div class="ticker" data-md-ticker="MERIDIAN BOOK ULTRA  •  PRE-ORDER NOW  •  UP TO $1,000 BACK  •  "');
add("ticker", "Dot-matrix ticker", "A 5x7 dot font scrolling one column at a time across a dark LED field, with a soft green phosphor glow and faded edges.",
  `<div style="padding: 16px; border-radius: 32px; background: var(--md-dark)">\n${ticker.replace(/aria-label="[^"]*"/, 'aria-label="Meridian Book Ultra. Pre-order now. Up to $1,000 back."')}\n</div>`, { js: true });

add("assist", "Assist card", "A frosted card for AI suggestions: a clay app tile with the spark mark, a two-line title, a purple clay badge, and chips that invert to dark on hover.",
  `<div style="padding: 24px 24px 24px 44px; border-radius: 32px; background: var(--md-bg)">\n${el('<div class="download-card')}\n</div>`);

add("quick", "Quick links", "Six white tiles with a clay icon square and an arrow: on hover a dark panel rises from the bottom, the icon turns green and the arrow turns. The rows swap with the Personal / Business switch.",
  `${el('<div class="quick-row" data-for="personal">')}\n${el('<div class="quick-row" data-for="business">')}`);

const slider = el('<div class="slider dark-ui')
  .replace('<div class="slider dark-ui reveal-card" id="slider" data-component="slider"', '<div class="slider dark-ui" data-md-slider')
  .replace('<div class="led-screen" id="laptopLED"></div>', `<div class="led-screen"${ledAttr("laptop")}></div>`)
  .replace(/<button id="slidePlay"[\s\S]*?<\/button>\s*/, "")
  .replace('<button id="slidePrev"', '<button data-md-prev')
  .replace('<button id="slideNext"', '<button data-md-next')
  .replace('<span id="slideNum">01</span>', '<span data-md-num>01</span>')
  .replace('<i id="slideProgress"></i>', '<i style="width: 33.4%"></i>');
add("slider", "Feature slider", "Full-bleed rounded slides on a dark, lilac and mint clay ground, each with a tag, a headline with a Fraunces accent, a button and a CSS device (a laptop with an LED screen, a tablet with pen and keyboard, a stack of laptops). Counter and round controls.",
  slider, { js: true, defs: true });

add("travel", "Product banner", "A two-part white card: copy with Fraunces italic specs on one side, and on the other a lilac-to-mint field with rings, a floating tag and a light CSS laptop.",
  el('<div class="travel '), { defs: true });

const articles = el('<div class="articles">')
  .replace('<div class="led-screen" id="tradeLED" aria-hidden="true"></div>', `<div class="led-screen"${ledAttr("trade")} aria-hidden="true"></div>`);
add("articles", "Story cards", "Large rounded cards with an inset visual (a clay shield in orbit rings, an LED route map, datacentre towers among leaves), a category label, a bold title and an arrow that turns on hover.",
  articles, { js: true });

add("faq", "FAQ", "White rows that lift to a soft shadow when open; a round clay plus turns into a dark cross with green arms, and the answer opens below.",
  `${el('<div class="faq-list reveal" data-for="personal">')}\n${el('<div class="faq-list reveal" data-for="business">')}`, { js: true });

const ballot = el('<div class="ballot ')
  .replace('<div class="ticker" id="ticker" data-component="dot-matrix-ticker"', '<div class="ticker" data-md-ticker="ELECTION DAY  •  NOV 3  •  CHECK YOUR REGISTRATION  •  "');
add("ballot", "Dark banner", "A dark rounded banner with a green glow: the dot-matrix ticker on top, then a clay icon tile, a headline with a glowing green Fraunces accent, and the inverted dotted-arrow button.",
  ballot, { js: true, defs: true });

const footer = el('<footer data-section="footer">')
  .replace(/<span class="follow-logo" id="followLogo" role="img" aria-label="Meridian"><\/span>/, `<span class="follow-logo" role="img" aria-label="Meridian">${brandmark}</span>`)
  .replace(/<span class="footer-logo" id="footerLogo" aria-hidden="true"><\/span>/, `<span class="footer-logo" aria-hidden="true">${brandmark}</span>`)
  .replace(/<footer[^>]*>/, '<div style="padding: 0 4px">').replace(/<\/footer>$/, "</div>");
add("footer", "Footer", "Follow Meridian with clay social tiles, six link columns in quiet grey, and a bottom row with a globe language link, a privacy toggle and the brandmark.",
  footer);

/* ── 6. Shared SVG defs: the glow filters behind every Fraunces accent ── */
const defs = el('<svg class="glow-filters"')
  .replace('<svg class="glow-filters"', '<svg id="md-defs" class="md-glow-filters" style="position: absolute; width: 0; height: 0; overflow: hidden"')
  .replace(/id="glow-(light-biz|light|warm|green)"/g, 'id="md-glow-$1"');

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Meridian components. No GSAP: the LED boards, ticker, switch, slider and FAQ are built here. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = { a: '#FF4136', b: '#29B6FF', c: '#FFD60A', d: '#6EE86E', e: '#FF53B0', f: '#FF9A1F' };

  /* LED board: waypoints on a cols x rows grid, straight or 45-degree segments */
  function expand(wps) {
    var pts = [wps[0].slice()];
    for (var k = 0; k < wps.length - 1; k++) {
      var x = wps[k][0], y = wps[k][1], x2 = wps[k + 1][0], y2 = wps[k + 1][1];
      while (x !== x2 || y !== y2) {
        if (x !== x2) x += Math.sign(x2 - x);
        if (y !== y2) y += Math.sign(y2 - y);
        pts.push([x, y]);
      }
    }
    return pts;
  }
  function buildLED(screen) {
    if (screen._mdBuilt) return;
    screen._mdBuilt = true;
    var cfg = JSON.parse(screen.getAttribute('data-md-led'));
    var stage = document.createElement('div');
    stage.className = 'md-led-stage';
    stage.style.setProperty('--cols', cfg.cols);
    stage.style.setProperty('--rows', cfg.rows);
    var board = '', lit = '', seen = {};
    Object.keys(cfg.lines).forEach(function (key) {
      var pts = expand(cfg.lines[key]);
      pts.forEach(function (p, i) {
        var s = '--x:' + p[0] + ';--y:' + p[1] + ';--i:' + i + ';--n:' + pts.length + ';--lc:' + COLORS[key];
        board += '<i class="md-ln-' + key + '" style="' + s + '"></i>';
        lit += '<i class="md-ln-' + key + '" style="' + s + '"></i>';
        var id = p[0] + ',' + p[1];
        seen[id] = (seen[id] || 0) + 1;
      });
    });
    Object.keys(seen).forEach(function (id) {
      if (seen[id] > 1) { var xy = id.split(','); board += '<u style="--x:' + xy[0] + ';--y:' + xy[1] + '"></u>'; }
    });
    stage.innerHTML = '<div class="md-led-board">' + board + '</div><div class="md-led-lit">' + lit + '</div>';
    screen.appendChild(stage);
    screen.classList.add('md-mode-' + (cfg.mode || 'chase'));
    function fit() {
      var w = screen.clientWidth, h = screen.clientHeight;
      if (w && h) stage.style.setProperty('--pitch', Math.min(w / cfg.cols, h / cfg.rows) + 'px');
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(screen);
    fit();
    requestAnimationFrame(function () { requestAnimationFrame(function () { screen.classList.add('md-booted'); }); });

    // The panel's own controls, if it has them
    var panel = screen.closest('.md-led-panel');
    if (!panel) return;
    var sw = panel.querySelector('[data-md-led-swatches]');
    if (sw && !sw.children.length) {
      var on = {};
      Object.keys(cfg.lines).forEach(function (key) {
        var b = document.createElement('button');
        b.type = 'button';
        b.style.setProperty('--sw', COLORS[key]);
        b.setAttribute('aria-label', 'Highlight line ' + key.toUpperCase());
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () {
          on[key] = !on[key];
          b.classList.toggle('md-on', on[key]);
          b.setAttribute('aria-pressed', String(!!on[key]));
          var any = Object.keys(on).some(function (k) { return on[k]; });
          screen.classList.toggle('md-filtering', any);
          stage.querySelectorAll('i').forEach(function (d) {
            var k = (d.className.match(/md-ln-(\\w)/) || [])[1];
            d.classList.toggle('md-on', !!on[k]);
          });
        });
        sw.appendChild(b);
      });
    }
  }

  /* Dot-matrix ticker: a 5x7 font drawn as SVG dots, scrolled by a CSS steps() animation */
  var FONT = {
    A: ['01110','10001','10001','11111','10001','10001','10001'], B: ['11110','10001','10001','11110','10001','10001','11110'],
    C: ['01110','10001','10000','10000','10000','10001','01110'], D: ['11110','10001','10001','10001','10001','10001','11110'],
    E: ['11111','10000','10000','11110','10000','10000','11111'], G: ['01110','10001','10000','10111','10001','10001','01111'],
    H: ['10001','10001','10001','11111','10001','10001','10001'], I: ['01110','00100','00100','00100','00100','00100','01110'],
    K: ['10001','10010','10100','11000','10100','10010','10001'], L: ['10000','10000','10000','10000','10000','10000','11111'],
    M: ['10001','11011','10101','10101','10001','10001','10001'], N: ['10001','11001','10101','10011','10001','10001','10001'],
    O: ['01110','10001','10001','10001','10001','10001','01110'], P: ['11110','10001','10001','11110','10000','10000','10000'],
    R: ['11110','10001','10001','11110','10100','10010','10001'], S: ['01111','10000','10000','01110','00001','00001','11110'],
    T: ['11111','00100','00100','00100','00100','00100','00100'], U: ['10001','10001','10001','10001','10001','10001','01110'],
    V: ['10001','10001','10001','10001','10001','01010','00100'], W: ['10001','10001','10001','10101','10101','10101','01010'],
    Y: ['10001','10001','01010','00100','00100','00100','00100'], '0': ['01110','10001','10011','10101','11001','10001','01110'],
    '1': ['00100','01100','00100','00100','00100','00100','01110'], '3': ['11110','00001','00001','01110','00001','00001','11110'],
    '$': ['00100','01111','10100','01110','00101','11110','00100'], ',': ['00000','00000','00000','00000','00110','00100','01000'],
    '-': ['00000','00000','00000','11111','00000','00000','00000'], '\\u2022': ['00000','00000','01110','01110','01110','00000','00000'],
    ' ': ['00000','00000','00000','00000','00000','00000','00000']
  };
  function buildTicker(el) {
    if (el._mdBuilt) return;
    el._mdBuilt = true;
    var track = el.querySelector('.md-ticker-track');
    var cols = [];
    el.getAttribute('data-md-ticker').split('').forEach(function (ch) {
      var g = FONT[ch] || FONT[' '];
      for (var c = 0; c < 5; c++) cols.push(g.map(function (row) { return row[c] === '1'; }));
      cols.push([false, false, false, false, false, false, false]);
    });
    var p = parseFloat(getComputedStyle(el).getPropertyValue('--p')) || 7, w = cols.length * p, h = 7 * p, r = p * 0.32, dots = '';
    cols.forEach(function (col, x) { col.forEach(function (on, y) { if (on) dots += '<circle cx="' + ((x + 0.5) * p) + '" cy="' + ((y + 0.5) * p) + '" r="' + r + '"/>'; }); });
    var svg = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" fill="#B6F5C3" aria-hidden="true">' + dots + '</svg>';
    track.innerHTML = svg + svg;
    track.style.setProperty('--md-ticker-steps', cols.length);
    track.style.setProperty('--md-ticker-dur', (cols.length * 0.07).toFixed(2) + 's');
  }

  /* Personal / Business switch: slides the thumb, swaps [data-for] copy inside the nearest .md */
  function placeThumb(seg) {
    var t = seg.querySelector('.md-seg-thumb'), a = seg.querySelector('button.md-active');
    if (t && a && a.offsetWidth) { t.style.width = a.offsetWidth + 'px'; t.style.transform = 'translateX(' + (a.offsetLeft - 4) + 'px)'; }
  }

  function init(scope) {
    scope.querySelectorAll('[data-md-led]').forEach(buildLED);
    scope.querySelectorAll('[data-md-ticker]').forEach(buildTicker);
    scope.querySelectorAll('[data-md-seg]').forEach(placeThumb);
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
  window.addEventListener('resize', function () { document.querySelectorAll('[data-md-seg]').forEach(placeThumb); });

  document.addEventListener('click', function (e) {
    var t = e.target;
    var segBtn = t.closest('[data-md-seg] button');
    if (segBtn) {
      var seg = segBtn.closest('[data-md-seg]');
      seg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('md-active', b === segBtn); b.setAttribute('aria-pressed', String(b === segBtn)); });
      placeThumb(seg);
      var root = seg.closest('.md');
      if (root) root.classList.toggle('md-business', segBtn.getAttribute('data-mode') === 'business');
      return;
    }
    var modeBtn = t.closest('[data-md-led-modes] button');
    if (modeBtn) {
      var group = modeBtn.closest('[data-md-led-modes]');
      group.querySelectorAll('button').forEach(function (b) { b.classList.toggle('md-active', b === modeBtn); b.setAttribute('aria-pressed', String(b === modeBtn)); });
      var screen = modeBtn.closest('.md-led-panel').querySelector('.md-led-screen');
      screen.classList.remove('md-mode-chase', 'md-mode-rainbow', 'md-mode-breathe');
      screen.classList.add('md-mode-' + modeBtn.getAttribute('data-mode'));
      return;
    }
    var q = t.closest('.md-faq-q');
    if (q) {
      var item = q.closest('.md-faq-item'), a = item.querySelector('.md-faq-a'), open = !item.classList.contains('md-open');
      item.classList.toggle('md-open', open);
      q.setAttribute('aria-expanded', String(open));
      a.style.height = open ? a.scrollHeight + 'px' : '0px';
      return;
    }
    var step = t.closest('[data-md-prev], [data-md-next]');
    if (step) {
      var slider = step.closest('[data-md-slider]'), slides = slider.querySelectorAll('.md-slide');
      var cur = [].indexOf.call(slides, slider.querySelector('.md-slide.md-active'));
      var next = (cur + (step.hasAttribute('data-md-next') ? 1 : -1) + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('md-active', i === next); });
      slider.classList.toggle('md-dark-ui', next === 0);
      var num = slider.querySelector('[data-md-num]');
      if (num) num.textContent = '0' + (next + 1);
      var bar = slider.querySelector('.md-progress i');
      if (bar) bar.style.width = ((next + 1) / slides.length * 100).toFixed(1) + '%';
    }
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--md-bg)}
.sp-top{position:relative;overflow:hidden;padding:28px var(--md-gutter) 56px}
.sp-ambient{position:absolute;inset:0;pointer-events:none}
.sp-ambient span{position:absolute;border-radius:50%;filter:blur(90px)}
.sp-ambient span:nth-child(1){width:520px;height:520px;background:rgba(157,140,220,0.28);top:-160px;right:4%}
.sp-ambient span:nth-child(2){width:420px;height:420px;background:rgba(143,222,160,0.22);top:200px;right:34%}
.sp-ambient span:nth-child(3){width:360px;height:360px;background:rgba(255,214,170,0.25);top:40px;left:-120px}
.sp-top-in{position:relative;max-width:var(--md-page-max);margin:0 auto}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;padding:14px 14px 14px 24px;border-radius:22px;background:var(--md-glass);backdrop-filter:var(--md-glass-blur);-webkit-backdrop-filter:var(--md-glass-blur);border:1px solid rgba(255,255,255,0.9);box-shadow:var(--md-shadow-soft);font:600 13px/1 var(--md-font-ui);color:var(--md-gray)}
.sp-meta b{color:var(--md-ink);font-size:20px;font-family:var(--md-font-display)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:40px;align-items:center;margin-top:64px}
.sp-hero h1{font-size:clamp(52px,7vw,96px)}
.sp-lede{margin:20px 0 0;max-width:520px;font:500 18px/1.6 var(--md-font-body);color:var(--md-gray)}
.sp-clays{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.sp-clays i{display:block;aspect-ratio:1;border-radius:28px}
.sp-main{max-width:var(--md-page-max);margin:0 auto;padding:16px var(--md-gutter) 120px}
.sp-sec{padding:56px 0;border-bottom:1px solid var(--md-hairline);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:8px 40px;margin-bottom:28px}
.sp-head h2{margin:10px 0 0;font:700 30px/1 var(--md-font-display);letter-spacing:-0.03em;max-width:none}
.sp-label{margin:0;font:700 12px/1 var(--md-font-ui);letter-spacing:1.5px;text-transform:uppercase;color:var(--md-gray)}
.sp-note{margin:0;max-width:640px;font:500 16px/1.6 var(--md-font-body);color:var(--md-gray)}
.sp-demo{position:relative}
@media (max-width:900px){.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:720px){.sp-top{padding:16px 16px 40px}.sp-main{padding:8px 16px 80px}}
`;
const HERO = `
<header class="sp-top">
<div class="sp-ambient" aria-hidden="true"><span></span><span></span><span></span></div>
<div class="sp-top-in">
<div class="sp-meta"><b>${prefixMarkup(brandmark)}</b><span>InstaLanding design system · meridian@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div>
${prefixMarkup(unhook(el('<div class="badge-row gsap-hero">')))}
<h1>Clay, glass and <em>light</em></h1>
<p class="sp-lede">Warm clay surfaces, frosted glass, an LED dot-matrix display and Bricolage set big with a Fraunces italic accent. Extracted from the LED Metro Tech Storefront landing page.</p>
</div>
<div class="sp-clays" aria-label="Core colours">
<i title="--md-dark" style="background:var(--md-dark);box-shadow:var(--md-shadow-clay-dark)"></i>
<i title="--md-purple" style="background:var(--md-purple);box-shadow:var(--md-shadow-clay-purple)"></i>
<i title="--md-green" style="background:var(--md-green);box-shadow:var(--md-shadow-clay-green)"></i>
<i title="--md-clay" style="background:var(--md-clay);box-shadow:var(--md-shadow-clay)"></i>
<i title="--md-surface" style="background:var(--md-surface);box-shadow:var(--md-shadow-clay)"></i>
<i title="--md-blue" style="background:var(--md-blue);box-shadow:var(--md-shadow-clay-dark)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Meridian",
  slug: "meridian",
  version: VERSION,
  prefix: "md",
  rootClass: "md",
  labelClass: "sp-label",
  script: "scripts/systems/meridian.mjs",
  source: SOURCE,
  metaDescription: "The Meridian design system: tokens and working components extracted from the LED Metro Tech Storefront landing page.",
  defsNote: "the glow filters behind every Fraunces italic accent",
  jsNote: "LED boards, the dot-matrix ticker, the Personal / Business switch, the slider and the FAQ (no GSAP)",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: defs,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "meridian", prefix: "md", rootClass: "md", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn-primary", "btn-dots", "led-panel", "led-screen", "slider", "slide", "faq-item", "chip", "segmented", "ticker"] });
