// Extracts the Prism design system from its landing page.
//
//   node scripts/systems/prism.mjs
//
// Reads public/demos/prism-evals-editorial.html (never edits it) and writes
// public/systems/prism/ (specimen.html, tokens.css, prism.css) through the
// shared pipeline in lib.mjs. Most of the page's markup is written by its own
// script (tickers, run cards, product previews, the gate table): those pieces
// are produced here by running the page's own generator code, so the specimen
// holds the exact markup the page renders. The page animates with GSAP; the
// system does not: the gooey compositions, mat re-cuts and testimonial tabs
// run on a small self-contained script with data-pz-* hooks.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/prism-evals-editorial.html";
const { page, el, css: pageCssRaw, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Prism · prism@${VERSION}
   Extracted from https://instalanding.ai/demos/prism-evals-editorial.html
   Fonts (Google Fonts): Asul 400/700, Cabin 400-700 (and italic), Covered By Your Grace, IBM Plex Mono 400/500 */
:root {
  /* Color · core */
  --pz-paper: #FFFFFF;
  --pz-ink: #000000;
  --pz-accent: #FF4081;
  --pz-white: #FFFFFF;
  --pz-b5: #F1F1F1;
  --pz-b10: #E5E5E5;
  --pz-b60: #6B6B6B;
  --pz-white-5: rgba(255, 255, 255, 0.05);

  /* Color · generative */
  --pz-g1: #561CCD;
  --pz-g2: #A169E9;
  --pz-g3: #361BEC;
  --pz-g4: #100091;
  --pz-g5: #FC7F0C;
  --pz-g6: #FF4081;

  /* Color · product screen */
  --pz-panel: #0D0A24;
  --pz-panel-hover: #1B1640;
  --pz-panel-fg: #ECE9F7;
  --pz-panel-dim: #8B86A8;
  --pz-panel-rule: rgba(255, 255, 255, 0.08);
  --pz-ok: #7FD8A6;
  --pz-ok-deep: #1D7F52;
  --pz-night: #08061A;
  --pz-snip: #0F0C26;
  --pz-track-light: #EEEDF3;
  --pz-cta-line: #D6D2E6;

  /* Color · quiet text */
  --pz-logo: #9B98A6;
  --pz-tab: #AAA7B5;
  --pz-feat-dim: #A9A9A9;

  /* Type · families */
  --pz-font-display: "Asul", Georgia, serif;
  --pz-font-sans: "Cabin", system-ui, sans-serif;
  --pz-font-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
  --pz-font-hand: "Covered By Your Grace", cursive;

  /* Type · scale */
  --pz-display-hero: clamp(110px, 22vw, 340px);
  --pz-display-lg: clamp(40px, 6.6vw, 96px);
  --pz-display-md: clamp(36px, 5vw, 64px);
  --pz-title: 24px;
  --pz-body-lg: 18px;
  --pz-body: 16px;
  --pz-label: 14px;
  --pz-mono: 13px;
  --pz-label-sm: 12px;
  --pz-mono-sm: 11px;

  /* Shape · radii */
  --pz-radius-pill: 999px;
  --pz-radius-panel: 6px;
  --pz-radius-btn-sm: 5px;
  --pz-radius-sm: 4px;

  /* Shape · borders */
  --pz-border: 1px;
  --pz-rim: 2px;
  --pz-border-card: 3px;
  --pz-mat: 16px;
  --pz-mat-wide: 22px;

  /* Depth · mats and grain */
  --pz-shadow-rim: 0 0 0 2px rgba(255, 255, 255, 0.92), 0 10px 24px -12px rgba(13, 10, 36, 0.6);
  --pz-shadow-mat: 0 34px 60px -34px rgba(16, 0, 145, 0.55);
  --pz-shadow-panel: 0 50px 90px -40px rgba(16, 0, 145, 0.55);
  --pz-shadow-snip: 0 24px 50px -24px rgba(0, 0, 0, 0.9);
  --pz-grain-opacity: 0.22;

  /* Motion · easing */
  --pz-ease: ease;
  --pz-ease-goo: ease-in-out;
  --pz-ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  /* Motion · durations */
  --pz-dur-fast: 0.2s;
  --pz-dur-goo: 0.22s;
  --pz-dur: 0.25s;
  --pz-dur-turn: 0.3s;
  --pz-dur-tilt: 0.35s;
  --pz-dur-lift: 0.5s;
  --pz-dur-caret: 1s;
  --pz-dur-morph: 1.6s;
  --pz-dur-quote: 8s;
  --pz-dur-ticker-big: 50s;
  --pz-dur-ticker: 60s;

  /* Space · layout */
  --pz-page-max: 1968px;
  --pz-pad: 24px;
  --pz-gap: 24px;
  --pz-section-y: clamp(96px, 10vw, 160px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
const HEX = {
  "#ff4081": "accent", "#000000": "ink", "#000": "ink", "#ffffff": "white", "#fff": "white",
  "#f1f1f1": "b5", "#e5e5e5": "b10", "#6b6b6b": "b60",
  "#561ccd": "g1", "#a169e9": "g2", "#361bec": "g3", "#100091": "g4", "#fc7f0c": "g5",
  "#0d0a24": "panel", "#1b1640": "panel-hover", "#ece9f7": "panel-fg", "#8b86a8": "panel-dim", "#7fd8a6": "ok",
  "#1d7f52": "ok-deep", "#08061a": "night", "#0f0c26": "snip", "#eeedf3": "track-light", "#d6d2e6": "cta-line",
  "#9b98a6": "logo", "#aaa7b5": "tab", "#a9a9a9": "feat-dim",
};
// The page's own custom properties, renamed into the system
const VARS = {
  accent: "accent", ink: "ink", paper: "paper", b5: "b5", b10: "b10", b60: "b60", "white-5": "white-5",
  g1: "g1", g2: "g2", g3: "g3", g4: "g4", g5: "g5", g6: "g6",
  panel: "panel", "panel-fg": "panel-fg", "panel-dim": "panel-dim", "panel-rule": "panel-rule", ok: "ok", night: "night",
  display: "font-display", hand: "font-hand", sans: "font-sans", mono: "font-mono", pad: "pad",
};
const end = "(?=\\s*[;}])";
const fs = (px, tok) => [new RegExp(`font-size:\\s*${px}px${end}`, "g"), `font-size: var(--pz-${tok})`];
const rad = (px, tok) => [new RegExp(`border-radius:\\s*${px}px${end}`, "g"), `border-radius: var(--pz-radius-${tok})`];
const dur = (s, tok) => [new RegExp(` ${s.replace(".", "\\.")}s(?=[\\s;,)])`, "g"), ` var(--pz-${tok})`];
const SWAPS = [
  [/var\(--([\w-]+)\)/g, (m, name) => (VARS[name] ? `var(--pz-${VARS[name]})` : m)],
  [/url\(#goo\)/g, "url(#pz-goo)"],
  [/font-size: clamp\(110px, 22vw, 340px\)/g, "font-size: var(--pz-display-hero)"],
  [/font-size: clamp\(40px, 6\.6vw, 96px\)/g, "font-size: var(--pz-display-lg)"],
  [/font-size: clamp\(36px, 5vw, 64px\)/g, "font-size: var(--pz-display-md)"],
  fs(24, "title"), fs(18, "body-lg"), fs(16, "body"), fs(14, "label"), fs(13, "mono"), fs(12, "label-sm"), fs(11, "mono-sm"),
  rad(999, "pill"), rad(6, "panel"), rad(5, "btn-sm"), rad(4, "sm"),
  [/0 0 0 2px rgba\(255, 255, 255, 0\.92\), 0 10px 24px -12px rgba\(13, 10, 36, 0\.6\)/g, "var(--pz-shadow-rim)"],
  [/0 34px 60px -34px rgba\(16, 0, 145, 0\.55\)/g, "var(--pz-shadow-mat)"],
  [/0 50px 90px -40px rgba\(16, 0, 145, 0\.55\)/g, "var(--pz-shadow-panel)"],
  [/0 24px 50px -24px rgba\(0, 0, 0, 0\.9\)/g, "var(--pz-shadow-snip)"],
  [/opacity: 0\.22;/g, "opacity: var(--pz-grain-opacity);"],
  [/--fw: 16px/g, "--fw: var(--pz-mat)"],
  [/--fw: 22px/g, "--fw: var(--pz-mat-wide)"],
  [/max-width: 1968px/g, "max-width: var(--pz-page-max)"],
  [/transition: 0\.22s ease-in-out/g, "transition: var(--pz-dur-goo) var(--pz-ease-goo)"],
  dur("0.2", "dur-fast"), dur("0.25", "dur"), dur("0.3", "dur-turn"), dur("0.35", "dur-tilt"), dur("0.5", "dur-lift"), dur("1.6", "dur-morph"),
  [/ 60s linear/g, " var(--pz-dur-ticker) linear"],
  [/animation-duration: 50s/g, "animation-duration: var(--pz-dur-ticker-big)"],
  [/ 8s linear/g, " var(--pz-dur-quote) linear"],
  [/ 1s steps\(1\)/g, " var(--pz-dur-caret) steps(1)"],
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
// Page-only parts: the document shell, section spacing, the scroll scenes
// (about floats, the pinned run headline, process steps) and rules the
// finished page never uses (the old services band, quote carousel, bar CTA).
const DROP = new RegExp([
  `^html`, `\\.wrap${nb}`, `^section\\[id\\]`, `\\.quotes`, `\\.process`, `\\.steps${nb}`, `\\.step${nb}`, `\\.svc`,
  `^\\.card${nb}`, `\\.qbtn`, `\\.qstage`, `\\.qghost`, `\\.qmain`, `\\.about-`, `\\.float-card`, `\\.sec-tall`, `\\.row-between`,
  `^\\.sec${nb}`, `^\\.pf${nb}`, `^\\.chip${nb}`, `\\.term-host`, `\\.runs-head`, `\\.runs-count`, `#runs`, `\\.bar${nb}`,
  `\\.gate${nb}`, `\\.gate-in`, `\\.gate-copy`, `\\.pricing${nb}`,
].join("|"));
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@container")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s));
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}

// Document-level selectors become selectors on the system root
function scopeSelector(sel) {
  if (sel === "*") return ":where(.pz, .pz *)";
  if (sel === "*::before") return ":where(.pz *)::before";
  if (sel === "*::after") return ":where(.pz *)::after";
  if (sel === "body") return ".pz";
  if (sel === ":root") return ".pz";
  return sel;
}
function scope(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@container")) return `${prelude} {\n${scope(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map(scopeSelector).join(",\n")} {${body.replace(/--pad:/g, "--pz-pad:")}}`;
  }).join("\n");
}

let base = stripComments(pageCssRaw).replace(/:root\s*\{[\s\S]*?\n\}\n/, "");
base = scope(keep(base))
  .replace(/\[data-goo\]/g, "[data-pz-goo]")
  .replace(/\[data-pv\]/g, "[data-pz-pv]");

// Every class the kept CSS uses gets the pz- prefix (read from selectors only)
const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "pz") CLASSES.add(m[1]);
}
CLASSES.add("cta--md"); // the footer CTA size has no rules of its own
const KEYFRAMES = ["ticker", "caret", "qprog"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({
  prefix: "pz", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ["goo", "cols", "rows", "pv", "q", "i"],
});

// Anything still without the root after prefixing (bare a, img, ::selection…) goes under :where(.pz)
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@container")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (s.includes(".pz") ? s : `:where(.pz) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
/* The specimen's compositions are built by the component script, so a host
   without one keeps its ground colour instead of collapsing */
.pz-art { min-height: 1px; }
/* On a phone the legal row needs the spacer's half of the footer */
@media (max-width: 720px) { .pz-footer-bottom .pz-spacer { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .pz-goo--slow .pz-inner, .pz-cta::before, .pz-cta::after, .pz-run-art { transition: none; }
}`;
const componentCss = rootEvery(prefixCss(tokenize(base)) + "\n" + stripComments(EXTRA)).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. The page's own generators, run here ──────────────────────────── */
const SCRIPT = page.slice(page.lastIndexOf("<script>"));
const code = (from, to) => {
  const a = SCRIPT.indexOf(from), b = SCRIPT.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error("script slice not found: " + from.slice(0, 40));
  return SCRIPT.slice(a, b);
};
const sinks = {};
const fakeDocument = { getElementById: (id) => (sinks[id] ??= { innerHTML: "", textContent: "" }) };
const run = (src, names) => new Function("document", `${src}\nreturn { ${names.join(", ")} };`)(fakeDocument);

const { PV } = run(code("  var hd = function (a, b)", '  Array.prototype.forEach.call(document.querySelectorAll("[data-pv]")'), ["PV"]);
run(code("  var RUNS = [", "  /* ── Preview library"), ["RUNS"]);
run(code('  var artGrid = document.getElementById("artGrid");', "  /* ── Tickers"), []);
run(code("  var TICKER = [", "  /* ── The run gallery"), []);
run(code("  var GATE = [", "  /* ── Motion"), []);
const { QUOTES } = run(code("  var QUOTES = [", '  var voices = document.getElementById("voices");'), ["QUOTES"]);
const qSparkSrc = code("  function qSpark(vals) {", "  function countUp").trim();
const { qSpark } = run(qSparkSrc, ["qSpark"]);

// SVG presentation colours become styles, so the hex pass turns them into tokens
const svgColours = (html) => html.replace(/ (fill|stroke)="(#[0-9a-fA-F]{3,6})"/g, (_, a, h) => ` style="${a}: ${h}"`);
const fillPv = (html) => html.replace(/data-pv="([\w-]+)"><\/div>/g, (m, k) => (PV[k] ? `data-pv="${k}">${svgColours(PV[k]())}</div>` : m));
const fillSink = (html, id) => {
  const re = new RegExp(`(<([a-z]+)[^>]* id="${id}"[^>]*>)(</\\2>)`);
  if (!re.test(html)) throw new Error("no empty #" + id);
  return html.replace(re, (_, open, tag, close) => open + svgColours(sinks[id].innerHTML) + close);
};
const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/* ── 5. Markup helpers ───────────────────────────────────────────────── */
// The page's reveal / parallax hooks belong to its GSAP timeline, not the system
const unhook = (html) => html
  .replace(/ id="(q[A-Z]\w*)"/g, ' data-q="$1"')
  .replace(/ id="[^"]*"/g, "")
  .replace(/ data-anim="[^"]*"/g, "")
  .replace(/ data-speed="[^"]*"/g, "")
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/href="#[a-z-]+"/g, 'href="#"');
const toDiv = (html, tag) => html.replace(new RegExp(`^<${tag}`), "<div").replace(new RegExp(`</${tag}>$`), "</div>");

/* ── 6. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });

add("nav", "Navigation", "A white bar with a hairline under it: the Asul wordmark set tight, four uppercase links centred on the bar, and the small dark CTA with its goo compartment. On the page it sticks under the safe-area inset.",
  el('<nav class="nav"').replace('<nav class="nav"', '<nav class="nav" style="position: relative; top: 0"'), { js: true, defs: true });

const ctaSm = /<a class="cta cta--sm"[\s\S]*?<\/a>/.exec(el('<nav class="nav"'))[0];
const ctaMd = /<a class="cta cta--md"[\s\S]*?<\/a>/.exec(el('<footer class="footer"'))[0];
const ctaLg = /<a class="cta cta--lg"[\s\S]*?<\/a>/.exec(el('<div class="art" style="aspect-ratio: 1 / 1"'))[0];
const linkr = /<a class="linkr" href="#gate">Read the method[\s\S]*?<\/a>/.exec(page)[0];
const tierCta = /<a class="tier-cta"[\s\S]*?<\/a>/.exec(el('<div class="tiers">'))[0];
const studio = el('<button class="studio-btn"');
add("buttons", "Buttons", "The CTA is a dark indigo key with a goo-art compartment holding a clipboard: on hover the rows tick off one by one, the chevron nudges forward and the art re-cuts itself. Three sizes. Beside it: the ruled text link, the grey tier link and the black studio button.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 28px">
${ctaSm}
${ctaMd}
${linkr}
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 28px; margin-top: 28px; padding: 32px; background: var(--pz-b5)">
${ctaLg}
${studio}
<div style="flex: 1 1 220px; max-width: 320px">${tierCta}</div>
</div>`, { js: true, defs: true });

add("type", "Type", "Asul bold, uppercase, line-height .96 and -0.04em tracking for every headline; one handwritten Covered By Your Grace note in the accent above it; Cabin for body at 18px with grey supporting copy; uppercase micro labels at 14px.",
  `${el('<div class="voices-head">')}
<div style="margin-top: 48px">${el('<h2 class="display h-sec"')}</div>
<div style="display: flex; flex-wrap: wrap; gap: 24px 48px; margin-top: 32px">
${el('<p class="micro" data-anim="reveal" style="max-width: 130px')}
${el('<p class="micro muted" data-anim="reveal">Release')}
${el('<p class="body-lg" style="max-width: 260px">')}
</div>`);

add("hero", "Wordmark hero", "The wordmark as the hero: Asul at up to 340px, a handwritten word laid over its middle in the accent, a © and a year as tiny marks on its corners, and four uppercase facts pinned to the corners of the band.",
  toDiv(el('<section class="hero"'), "section"));

const artGrid = fillSink(el('<div class="art" style="aspect-ratio: 1 / 1"'), "artGrid");
add("art", "Generative art", "Every image is a grid of cells, each holding one shape sized, turned, rounded and coloured at random from six colours, run through an SVG gooey filter so neighbours melt together. Click to resample. The hero piece carries an 8x8 rule grid with lit squares, a note and a large CTA; the band is the same art stretched wide.",
  `<div style="max-width: 640px; margin: 0 auto">
${artGrid}
</div>
<div style="margin-top: 32px">
${el('<div class="art cta-band"')}
</div>`, { js: true, defs: true });

add("ticker", "Tickers", "Two endless strips between hairlines: uppercase micro words with short rules, and a big Asul strip with accent swatches before every other phrase. Both pause on hover.",
  `${fillSink(el('<div class="ticker" data-section="ticker">'), "topTicker")}
<div style="margin-top: 32px">
${fillSink(el('<div class="ticker ticker--big"'), "bigTicker")}
</div>`);

add("logos", "Logo strip", "A muted label and a row of invented customer names, alternating Asul caps and Cabin italic in a soft grey, spread across the row.",
  toDiv(el('<section class="logos"'), "section").replace('<div class="logos"', '<div class="logos" style="padding: 0"'));

// The page lays out three rows; one row shows the rhythm. Snippets sit under
// their cards, as the page does below 1440px.
const runRow = sliceEl(fillSink(`<div id="runsGrid"></div>`, "runsGrid"), '<div class="run-row">').html
  .replace(/snip snip--right/g, "snip snip--below")
  .replace(/(<div class="snip [^"]*" aria-hidden="true" data-side="[a-z]+") style="[^"]*"/g, '$1 style="position: relative; margin-top: 22px"')
  .replace(/ data-side="[a-z]+"/g, "");
add("runs", "Run cards", "Product cards mounted on generative mats: the art behind, a white rim, the UI on top, a mono label tab on the thicker bottom band and a rotated status stamp on the corner. Each card's terminal snippet hangs under it on a connector. Hovering a card re-cuts its mat.",
  `<div class="runs">${fillPv(runRow)}</div>`, { js: true, defs: true });

const host = (k, ratio = "3 / 4") => `<div style="aspect-ratio: ${ratio}" data-pv="${k}"></div>`;
add("previews", "Product previews", "Slices of the product in mono on the indigo screen or on white: score cards with a sparkline, prompt diffs, judge verdicts, model bake-offs, trace waterfalls, drift alerts, agent replays, cost histograms, fixtures and gate checks. Regressions in the accent, passes in green. Minis sit on dark bands.",
  fillPv(`<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 24px">
${["models", "trace", "drift", "replay", "cost", "fixture", "check", "blocked"].map((k) => host(k)).join("\n")}
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: 16px; margin-top: 24px; padding: 24px; background: var(--pz-panel)">
${["mini-evals", "mini-gate", "mini-traces"].map((k) => host(k, "4 / 3")).join("\n")}
</div>`));

add("gate", "Gate report", "The product proof: a deep indigo report on a mat, with a path and a blocked pill, run metadata, a suite table whose regressions carry an accent dot and a delta bar, a sparkline that drops through its dashed threshold and the failing case with the judge's note.",
  `<div style="max-width: 880px; margin: 0 auto">
${fillSink(fillSink(el('<div class="frame gate-frame"'), "gateRows"), "gateSpark")}
</div>`, { js: true, defs: true });

// The testimonial panel, filled with the first quote; the script rotates them
const q0 = QUOTES[0];
const tabs = QUOTES.map((q, i) => `<button class="q-tab${i ? "" : " on"}" role="tab" type="button" aria-selected="${i ? "false" : "true"}" data-i="${i}"><i></i>${esc(q.co)}<small>${esc(q.name)}</small></button>`).join("");
const qFrame = el('<div class="frame q-frame"')
  .replace('id="qText"></blockquote>', `id="qText">${esc(q0.quote)}</blockquote>`)
  .replace('id="qAv" aria-hidden="true"></div>', `id="qAv" aria-hidden="true">${q0.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>`)
  .replace('id="qName"></p>', `id="qName">${esc(q0.name)}</p>`)
  .replace('id="qRole"></p>', `id="qRole">${esc(q0.role + " · " + q0.co)}</p>`)
  .replace('id="qStat"></div>', `id="qStat">${esc(q0.stat)}</div>`)
  .replace('id="qStatLabel"></p>', `id="qStatLabel">${esc(q0.label)}</p>`)
  .replace('id="qSpark"></div>', `id="qSpark">${qSpark(q0.spark)}</div>`)
  .replace('id="qWs"></span>', `id="qWs">${esc(q0.ws)}</span>`)
  .replace('id="qDate"></span>', `id="qDate">${esc(q0.date)}</span>`);
add("voices", "Testimonial panel", "A quote panel on a wide mat: Asul quote with a huge accent quote mark and initials avatar on white, and the number behind it on the indigo screen with a sparkline. Five tabs below fill an accent progress bar and advance on their own; hovering pauses them.",
  `<div class="voices" style="padding: 0">
${qFrame}
${el('<div class="q-tabs"').replace("></div>", `>${tabs}</div>`)}
</div>`, { js: true, defs: true });

add("pricing", "Pricing tiers", "Three tiers in one hairline box: a huge Asul price with a small uppercase unit, ruled feature lists and a full-width link; the featured tier inverts to black with an accent link.",
  `${el('<div class="pricing-head">')}\n${el('<div class="tiers">')}`);

add("contact", "Start panel", "Two columns: a grey panel with a handwritten note over an Asul headline and numbered mono steps, and a mat holding a terminal that types the setup, with the studio button on top.",
  fillPv(el('<div class="contact-row">')), { js: true, defs: true });

add("footer", "Footer", "A hairline, the wordmark with a line of copy and the medium CTA, three uppercase link columns, and a legal row with a short rule between links.",
  toDiv(el('<footer class="footer"'), "footer").replace('<div class="footer"', '<div class="footer" style="margin-top: 0"'), { js: true, defs: true });

/* ── 7. Shared SVG defs: the gooey filters every composition runs through ── */
const defs = /<svg width="0" height="0" aria-hidden="true" style="position: absolute">[\s\S]*?<\/svg>/.exec(page)[0]
  .replace('<svg width="0" height="0" aria-hidden="true" style="position: absolute">', '<svg id="pz-defs" width="0" height="0" aria-hidden="true" style="position: absolute">')
  .replace('id="goo"', 'id="pz-goo"').replace('id="goo-sm"', 'id="pz-goo-sm"');

/* ── 8. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Prism components. No GSAP: compositions, mat re-cuts and the testimonial tabs are built here. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Weighted like the page: mostly violets, the accent twice, orange as the one warm note.
     Tokens, not hex, so a re-coloured system re-colours every composition. */
  var PALETTE = ['var(--pz-g1)', 'var(--pz-g2)', 'var(--pz-g3)', 'var(--pz-g4)', 'var(--pz-g1)', 'var(--pz-g3)', 'var(--pz-g2)', 'var(--pz-g6)', 'var(--pz-g6)', 'var(--pz-g5)'];
  var SHAPES = ['', 'pz-s1', 'pz-s2', 'pz-s3', 'pz-s4', 'pz-s5'];
  var rand = function (n) { return Math.floor(Math.random() * n); };
  var pick = function (arr) { return arr[rand(arr.length)]; };

  /* The generative composition: a grid of cells, each with two colours, a size of
     100% or 200%, a quarter-turn, no radius or a huge one, and one of six shapes */
  function sampleGoo(grid) {
    grid.style.background = pick(PALETTE);
    var cells = grid.children;
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      cell.style.setProperty('--c1', pick(PALETTE));
      cell.style.setProperty('--c2', pick(PALETTE));
      cell.style.setProperty('--size', (rand(2) + 1) * 100 + '%');
      cell.style.setProperty('--angle', rand(4) * 90 + 'deg');
      cell.style.setProperty('--radius', rand(2) * 100 + 'vw');
      cell.firstChild.className = 'pz-inner ' + pick(SHAPES);
    }
  }
  function buildGoo(host) {
    if (host._pzBuilt) return;
    host._pzBuilt = true;
    var kind = host.getAttribute('data-pz-goo');
    var cols = +host.getAttribute('data-pz-cols') || 6, rows = +host.getAttribute('data-pz-rows') || 6;
    var grid = document.createElement('div');
    grid.className = 'pz-goo';
    grid.setAttribute('aria-hidden', 'true');
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--rows', rows);
    if (kind === 'tile' || kind === 'avatar' || kind === 'btn') grid.style.filter = 'url(#pz-goo-sm)';
    if (kind === 'hero') grid.classList.add('pz-goo--slow');
    for (var i = 0; i < cols * rows; i++) {
      var cell = document.createElement('div');
      cell.className = 'pz-cell';
      cell.appendChild(document.createElement('div')).className = 'pz-inner';
      grid.appendChild(cell);
    }
    host.appendChild(grid);
    sampleGoo(grid);
    grid.addEventListener('click', function () { sampleGoo(grid); });
    /* the hero piece morphs on a slow beat, only while it is on screen */
    if (kind === 'hero' && !reduce) {
      var on = true;
      setInterval(function () { if (on && !document.hidden && grid.isConnected) sampleGoo(grid); }, 7000);
      if (window.IntersectionObserver) new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(grid);
    }
  }
  /* hovering a framed card or a CTA re-cuts its own art */
  function recut(el, sel) {
    if (el._pzRecut) return;
    el._pzRecut = true;
    el.addEventListener('mouseenter', function () { var g = el.querySelector(sel); if (g) sampleGoo(g); });
  }

  /* Testimonials: the progress bar on the active tab runs out, then the next quote shows */
  var QUOTES = ${JSON.stringify(QUOTES)};
${qSparkSrc.replace(/^/gm, "  ")}
  function setupVoices(root) {
    if (root._pzBuilt) return;
    var tabs = root.querySelectorAll('.pz-q-tab');
    if (!tabs.length) return;
    root._pzBuilt = true;
    var q = function (k) { return root.querySelector('[data-pz-q="' + k + '"]'); };
    var qi = 0;
    function show(i) {
      qi = i;
      var d = QUOTES[i];
      q('qText').textContent = d.quote;
      q('qAv').textContent = d.name.split(' ').map(function (w) { return w.charAt(0); }).slice(0, 2).join('');
      q('qName').textContent = d.name;
      q('qRole').textContent = d.role + ' \\u00b7 ' + d.co;
      q('qStat').textContent = d.stat;
      q('qStatLabel').textContent = d.label;
      q('qSpark').innerHTML = qSpark(d.spark);
      q('qWs').textContent = d.ws;
      q('qDate').textContent = d.date;
      [].forEach.call(tabs, function (t, k) { t.classList.remove('pz-on'); t.setAttribute('aria-selected', String(k === i)); });
      void root.offsetWidth; /* restart the progress bar */
      tabs[i].classList.add('pz-on');
    }
    [].forEach.call(tabs, function (t) {
      t.addEventListener('click', function () { show(+t.getAttribute('data-pz-i')); });
      var bar = t.querySelector('i');
      if (bar) bar.addEventListener('animationend', function () { if (t.classList.contains('pz-on')) show((qi + 1) % QUOTES.length); });
    });
    root.addEventListener('mouseenter', function () { root.classList.add('pz-paused'); });
    root.addEventListener('mouseleave', function () { root.classList.remove('pz-paused'); });
  }

  function init(scope) {
    scope.querySelectorAll('[data-pz-goo]').forEach(buildGoo);
    scope.querySelectorAll('.pz-frame').forEach(function (f) { recut(f, ':scope > .pz-frame-goo > .pz-goo'); });
    scope.querySelectorAll('.pz-cta').forEach(function (b) { recut(b, '.pz-cta-goo > .pz-goo'); });
    scope.querySelectorAll('.pz-voices').forEach(setupVoices);
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
})();`;

/* ── 9. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--pz-paper)}
.sp-top{padding:20px var(--pz-pad) 56px;border-bottom:1px solid var(--pz-b10)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;padding-bottom:14px;border-bottom:1px solid var(--pz-b10)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:48px;align-items:end;margin-top:56px;max-width:1440px;margin-inline:auto}
.sp-hero h1{font-size:clamp(56px,8.4vw,132px)}
.sp-lede{margin-top:24px;max-width:520px;color:var(--pz-b60)}
.sp-art{aspect-ratio:1/1}
.sp-chips{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:40px;max-width:520px}
.sp-chips i{display:block;aspect-ratio:1}
.sp-main{max-width:1440px;margin:0 auto;padding:16px var(--pz-pad) 120px}
.sp-sec{padding:56px 0;border-bottom:1px solid var(--pz-b10);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:8px 40px;margin-bottom:32px}
.sp-head h2{margin:10px 0 0;font:700 32px/0.96 var(--pz-font-display);text-transform:uppercase;letter-spacing:-0.04em}
.sp-label{margin:0;font:500 12px/1 var(--pz-font-mono);letter-spacing:0.04em;text-transform:uppercase;color:var(--pz-accent)}
.sp-note{margin:0;max-width:640px;font:400 17px/1.5 var(--pz-font-sans);color:var(--pz-b60)}
.sp-demo{position:relative}
@media (max-width:900px){.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:720px){.sp-top{padding:16px 18px 40px}.sp-main{padding:8px 18px 80px}}
`;
const HERO = `
<header class="sp-top">
<div class="sp-meta"><p class="pz-wordmark">Prism</p><span class="pz-micro pz-muted">InstaLanding design system · prism@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div>
<p class="pz-hand">Grown, not drawn</p>
<h1 class="pz-display">Generative editorial</h1>
<p class="pz-body-lg sp-lede">Asul set huge and uppercase on white, a handwritten accent note, mono product slices on a deep indigo screen, and every picture a gooey grid of six colours that recuts itself. Extracted from the Generative Editorial Product landing page.</p>
<div class="sp-chips" aria-label="The generative palette">
<i title="--pz-g1" style="background:var(--pz-g1)"></i><i title="--pz-g2" style="background:var(--pz-g2)"></i><i title="--pz-g3" style="background:var(--pz-g3)"></i><i title="--pz-g4" style="background:var(--pz-g4)"></i><i title="--pz-g5" style="background:var(--pz-g5)"></i><i title="--pz-g6" style="background:var(--pz-g6)"></i>
</div>
</div>
<div class="pz-art sp-art" data-pz-goo="hero" data-pz-cols="8" data-pz-rows="8" role="img" aria-label="A generative composition: click to resample"><span class="pz-art-note">Click to resample</span></div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Prism",
  slug: "prism",
  version: VERSION,
  prefix: "pz",
  rootClass: "pz",
  labelClass: "sp-label",
  script: "scripts/systems/prism.mjs",
  source: SOURCE,
  metaDescription: "The Prism design system: tokens and working components extracted from the Generative Editorial Product landing page.",
  defsNote: "the gooey filters (pz-goo, pz-goo-sm) every generative composition runs through",
  jsNote: "gooey compositions, mat and CTA re-cuts, the testimonial tabs (no GSAP)",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 10. Write ───────────────────────────────────────────────────────── */
writeSystem({ slug: "prism", prefix: "pz", rootClass: "pz", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["cta", "goo", "frame", "pv", "ticker", "gate-ui", "tier", "q-tab", "snip", "linkr", "display", "micro"] });
