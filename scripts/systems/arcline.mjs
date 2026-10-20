// Extracts the Arcline design system from its landing page.
//
//   node scripts/systems/arcline.mjs
//
// Reads public/demos/arcline-neon-glass.html (never edits it) and writes
// public/systems/arcline/ (specimen.html, tokens.css, arcline.css) through the
// shared pipeline in lib.mjs. The page is a React bundle with no static markup,
// so the markup is read from the page as rendered: the script opens it in
// headless Microsoft Edge (EDGE overrides the path), takes the DOM React
// built, and slices components out of that. The CSS comes straight from the
// file. The system needs no React: the reveal lights, the mobile menu and the
// billing switch run on a small script with data-ac-* hooks; the chat bar,
// voice orb and FAQ are pure CSS and HTML, as on the page.
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { root, readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/arcline-neon-glass.html";
const { css: pageCssRaw } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 0. The rendered page ──────────────────────────────────────────────
   React builds every element at load; read #root once it has settled. */
async function renderedDom() {
  const EDGE = process.env.EDGE ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  const port = 9680 + Math.floor(Math.random() * 40);
  const prof = path.join(process.env.TEMP ?? "/tmp", `arcline-${port}`);
  const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  try {
    let ws;
    for (let i = 0; i < 60 && !ws; i++) {
      try {
        const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
        if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
      } catch {}
      if (!ws) await sleep(200);
    }
    if (!ws) throw new Error("Edge did not start: set EDGE to msedge.exe");
    await new Promise((r) => ws.addEventListener("open", r));
    let id = 0;
    const pend = new Map();
    ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id) pend.get(m.id)?.(m); });
    const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: pathToFileURL(path.join(root, SOURCE)).href });
    await sleep(3000);
    const r = await send("Runtime.evaluate", { expression: "document.getElementById('root').innerHTML", returnByValue: true });
    ws.close();
    return r.result.result.value;
  } finally {
    edge.kill();
  }
}
const DOM = await renderedDom();
const el = (marker) => sliceEl(DOM, marker).html;

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root blocks (the "Blue & black theme"
   block wins over the first). The neutral ramp and the accents are written
   as hex; tints, glass and the hue numbers the edge lights read stay as the
   page wrote them. One declaration per line; the group comments are what the
   SYSTEMS board lays its panels out by. */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const ROOT = {};
for (const [, body] of stripComments(pageCssRaw).matchAll(/:root\s*\{([^}]*)\}/g)) {
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) ROOT[name] = value.trim();
}
const hex = (hsl) => {
  const m = /hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/.exec(hsl);
  if (!m) throw new Error("not hsl: " + hsl);
  const [h, s, l] = [+m[1], +m[2] / 100, +m[3] / 100];
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, "0");
  return ("#" + f(0) + f(8) + f(4)).toUpperCase();
};
const v = (name) => { if (!(name in ROOT)) throw new Error("no " + name); return ROOT[name]; };
const RAMP = ["50", "100", "150", "200", "300", "400", "500", "600", "650", "700", "750", "800", "900"];
const TOKENS = `/* InstaLanding design system · Arcline · arcline@${VERSION}
   Extracted from https://instalanding.ai/demos/arcline-neon-glass.html
   Fonts: none required. The stack leads with Poppins and falls back to the platform face. */
:root {
  color-scheme: dark;

  /* Color · ramp */
${RAMP.map((n) => `  --ac-gray${n}: ${hex(v("--gray" + n))};`).join("\n")}
  --ac-white: #FFFFFF;
  --ac-black: #000000;

  /* Color · accent */
  --ac-blue: ${hex(v("--blue"))};
  --ac-blue-hi: ${hex(v("--blue-hi"))};
  --ac-blue-lo: ${hex(v("--blue-lo"))};
  --ac-blue-tint: ${v("--blue-tint")};
  --ac-blue-line: ${v("--blue-line")};

  /* Color · glass */
  --ac-glass: ${v("--glass")};
  --ac-glass-border: ${v("--glass-border").replace(/var\(--/g, "var(--ac-")};
  --ac-shadow: ${v("--shadow")};
  --ac-backdrop: ${v("--backdrop")};

  /* Color · light hues */
  --ac-hue1: ${v("--hue1")};
  --ac-hue2: ${v("--hue2")};
  --ac-hue: ${v("--hue")};
  --ac-sat: ${v("--sat")};

  /* Type · families */
  --ac-font: ${v("--font")};
  --ac-mono: ${v("--mono")};

  /* Type · scale */
  --ac-text-base: clamp(0.75rem, 0.7rem + 0.25vw, 1rem);
  --ac-display: 5em;
  --ac-display-sm: 3.75em;
  --ac-title-xl: 2.75em;
  --ac-stat: 2.5em;
  --ac-title-lg: 2.25em;
  --ac-title: 2em;
  --ac-text-lg: 1.25em;
  --ac-text-md: 1.125em;
  --ac-text-sm: 0.875em;
  --ac-text-xs: 0.75em;

  /* Shape · radii */
  --ac-radius-widget: 4em;
  --ac-radius-xl: 3em;
  --ac-radius-lg: 2em;
  --ac-radius-md: 1.5em;
  --ac-radius-sm: 1.25em;
  --ac-radius-xs: 0.75em;
  --ac-radius-chip: 0.875rem;

  /* Shape · borders */
  --ac-border: 1px;
  --ac-border-sweep: 1.5px;
  --ac-border-bloom: 6px;

  /* Depth · glass and light */
  --ac-glass-blur: blur(14px) saturate(1.2);
  --ac-glow-r: ${v("--glow-r")};
  --ac-shadow-panel: 0 0 0 1px hsl(var(--ac-hue1), 80%, 75%, 0.04) inset, hsl(var(--ac-hue2), 60%, 2%) 0 10px 16px -8px, hsl(var(--ac-hue2), 60%, 4%) 0 20px 36px -14px;

  /* Motion · easing */
  --ac-ease-out-sine: ${v("--ease-out-sine")};
  --ac-ease-in-out-sine: ${v("--ease-in-out-sine")};
  --ac-ease-in-out-cubic: ${v("--ease-in-out-cubic")};
  --ac-neon-ease: ${v("--neon-ease")};
  --ac-ease-sweep: cubic-bezier(0.55, 0.1, 0.35, 1);

  /* Motion · durations */
  --ac-trans-dur: ${v("--trans-dur")};
  --ac-dur-reveal: 0.8s;
  --ac-corner-lead: ${v("--corner-lead")};
  --ac-dur-sheen: 1.6s;
  --ac-sweep-dur: ${v("--sweep-dur")};

  /* Space · layout */
  --ac-page-max: 72em;
  --ac-content-max: 56.5em;
  --ac-widgets-max: 48em;
  --ac-section-y: 7.5em;
  --ac-gap: 1.5em;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
const end = "(?=\\s*[;}])";
const fsz = (em, tok) => [new RegExp(`font-size:\\s*${em.replace(".", "\\.")}em${end}`, "g"), `font-size: var(--ac-${tok})`];
const rad = (val, tok) => [new RegExp(`border-radius:\\s*${val.replace(".", "\\.")}${end}`, "g"), `border-radius: var(--ac-radius-${tok})`];
const SWAPS = [
  // The page's own custom properties move under the prefix (definitions, var() and @property alike);
  // "--" inside a class name (.btn--apple) follows a word character and is left alone
  [/(?<![\w-])--(?!ac-)([a-z][\w-]*)/g, "--ac-$1"],
  [/#(src-db|src-docs|src-chat|src-code|fake-refresh)(?![\w-])/g, "#ac-$1"],
  fsz("5", "display"), fsz("3.75", "display-sm"), fsz("2.75", "title-xl"), fsz("2.5", "stat"), fsz("2.25", "title-lg"), fsz("2", "title"),
  fsz("1.25", "text-lg"), fsz("1.125", "text-md"), fsz("0.875", "text-sm"), fsz("0.75", "text-xs"),
  rad("4em", "widget"), rad("3em", "xl"), rad("2em", "lg"), rad("1.5em", "md"), rad("1.25em", "sm"), rad("0.75em", "xs"), rad("0.875rem", "chip"),
  [/border: 1px solid var\(--ac-glass-border\)/g, "border: var(--ac-border) solid var(--ac-glass-border)"],
  [/border: 1\.5px solid transparent/g, "border: var(--ac-border-sweep) solid transparent"],
  [/border-width: 6px/g, "border-width: var(--ac-border-bloom)"],
  [/blur\(14px\) saturate\(1\.2\)/g, "var(--ac-glass-blur)"],
  [/cubic-bezier\(0\.55, 0\.1, 0\.35, 1\)/g, "var(--ac-ease-sweep)"],
  [/ 0\.8s var\(--ac-ease-out-sine\)/g, " var(--ac-dur-reveal) var(--ac-ease-out-sine)"],
  [/sheen-pass 1\.6s/g, "sheen-pass var(--ac-dur-sheen)"],
  [/max-width: 72em/g, "max-width: var(--ac-page-max)"],
  [/max-width: 56\.5em/g, "max-width: var(--ac-content-max)"],
  [/max-width: 48em/g, "max-width: var(--ac-widgets-max)"],
];

/* ── 3. Component CSS: the page's <style>, minus what only the page needs ── */
// light-dark(a, b): the page is dark only, so keep b
function darkOnly(css) {
  let out = "", i = 0;
  for (let at; (at = css.indexOf("light-dark(", i)) >= 0; ) {
    out += css.slice(i, at);
    let depth = 0, j = at + "light-dark".length, comma = -1;
    for (; j < css.length; j++) {
      if (css[j] === "(") depth++;
      else if (css[j] === ")") { if (--depth === 0) break; }
      else if (css[j] === "," && depth === 1 && comma < 0) comma = j;
    }
    out += css.slice(comma + 1, j).trim();
    i = j + 1;
  }
  return out + css.slice(i);
}
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
// Page-only parts: the document shell and scroller, the arches behind it, the
// first-load entrance, page sections and the generic "centre buttons in a section" rule.
const DROP = new RegExp([
  `^:root`, `^html`, `^body::before`, `^\\.top${nb}`, `\\.first-load`, `\\.widget--entering`, `^article`, `^main`,
  `^section$`, `^section\\.block`, `^section \\.btn$`, `^\\.hero$`,
  // fills on sprite symbols: a <use> clone can't match a rooted selector, so they move into the symbols
  `^#`,
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
    if (prelude.startsWith("@keyframes") || prelude.startsWith("@property")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s));
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}

// Document-level selectors become selectors on the system root; the site
// header and its nav become classes, so they can't restyle a host's own.
function scopeSelector(sel) {
  if (sel === "*") return ":where(.ac, .ac *)";
  if (sel === "body") return ".ac";
  return sel
    .replace(/^section (?=\.)/, "")
    .replace(/(^|[\s>+~(])header(?=$|[\s.:\[>+~)])/g, "$1.header")
    .replace(/(^|[\s>+~(])nav(?=$|[\s.:\[>+~)])/g, "$1.nav");
}
function scope(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${scope(body)}\n}`;
    if (prelude.startsWith("@keyframes") || prelude.startsWith("@property")) return rule;
    return `${splitSelectors(prelude).map(scopeSelector).join(",\n")} {${body}}`;
  }).join("\n");
}

let base = darkOnly(stripComments(pageCssRaw));
base = scope(keep(base));

// Every class the kept CSS uses gets the ac- prefix (read from selectors only)
const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "ac") CLASSES.add(m[1]);
}
["open", "closing", "is-visible", "is-active", "header", "nav", "inline"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = [...new Set([...base.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]))];
const { tokenize, prefixCss, prefixMarkup } = normalizer({ prefix: "ac", hex: { "#fff": "white" }, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES });

// Anything still without the root after prefixing (bare h1, a, p, input…) goes under :where(.ac)
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes") || prelude.startsWith("@property")) return rule;
    return `${splitSelectors(prelude).map((s) => (/\.ac(?![\w-])/.test(s) ? s : `:where(.ac) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
/* The page set its type size on :root; the system sets it on its root */
.ac { font-size: var(--ac-text-base); color-scheme: dark; }
/* The sign-up modal shown in place, open, rather than over the page */
.ac-modal.ac-open.ac-inline { position: relative; inset: auto; display: block; max-height: none; overflow: visible; margin: 0 auto; z-index: auto; }`;
const componentCss = rootEvery(prefixCss(tokenize(base)) + "\n" + EXTRA).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Markup helpers ───────────────────────────────────────────────── */
// React's state classes and the page's routing attributes are not the system
const IDS = new Set([...DOM.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
const unhook = (html) => html
  .replace(/ class="([^"]*)"/g, (m, cls) => {
    const kept = cls.split(/\s+/).filter((c) => c && !/^(widget--entering|is-visible|first-load)$/.test(c));
    return kept.length ? ` class="${kept.join(" ")}"` : "";
  })
  .replace(/ id="(features|how-it-works|developers|pricing|faq|root)"/g, "")
  .replace(/ data-(section|component|discover)="[^"]*"/g, "")
  .replace(/ href="\/[^"]*"/g, ' href="#"')
  // ids, and everything that points at them, under the prefix
  .replace(/ (id|for|aria-labelledby)="([^"]+)"/g, (m, a, x) => (IDS.has(x) ? ` ${a}="ac-${x}"` : m))
  .replace(/href="#([\w-]+)"/g, (m, x) => (IDS.has(x) ? `href="#ac-${x}"` : m))
  .replace(/url\(#([\w-]+)\)/g, (m, x) => (IDS.has(x) ? `url(#ac-${x})` : m))
  // SVG fill="var(--gray700)" attributes read the tokens too
  .replace(/var\(--(?!ac-)([\w-]+)/g, "var(--ac-$1")
  .replace(/<header(?=[\s>])/g, '<header class="header"')
  .replace(/<nav(?=[\s>])/g, '<nav class="nav"');
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });

/* ── 5. Components (each one real markup from the rendered page) ────────── */
const header = el('<header data-section="nav"')
  .replace('<button class="btn btn--square btn--mobile" type="button" title="Menu"', '<button class="btn btn--square btn--mobile" data-ac-menu type="button" title="Menu"')
  .replace('<button class="btn btn--square btn--mobile" type="button" title="Close"', '<button class="btn btn--square btn--mobile" data-ac-menu-close type="button" title="Close"')
  .replace('<div class="backdrop"></div>', '<div class="backdrop" data-ac-menu-close></div>');
add("nav", "Navigation", "The lowercase wordmark, quiet links that light a glass tile on hover, and a white sign-up pill; under 768px a square menu button slides the links in over a dark backdrop.",
  header, { js: true, defs: true });

const hero = el('<div class="hero"');
const h1 = /<h1>[\s\S]*?<\/h1>\s*<p>[\s\S]*?<\/p>/.exec(hero)[0];
const head = el('<div class="reveal block__head"');
add("type", "Headline & section head", "One weight-400 display line in a white-to-blue gradient, a light lede, and the section head: a blue-tint eyebrow chip over a centred title. Everything is set lowercase to match the wordmark.",
  `<div class="hero">${h1}</div>\n<div style="height: 3em"></div>\n${head}`, { js: true });

const featured = el('<div class="reveal plan plan--featured"');
const btnRow = [
  /<button class="btn" type="button">Sign up<\/button>/.exec(header)[0],
  /<button class="btn btn--dark" type="button">[\s\S]*?<\/button>/.exec(el('<div class="cta__actions">'))[0],
  /<a class="btn" href="[^"]*"[^>]*>Talk to sales<\/a>/.exec(el('<div class="cta__actions">'))[0],
  /<button class="btn btn--square" type="button" title="See features"[\s\S]*?<\/button>/.exec(el('<div class="widget__actions">'))[0],
].join("\n");
add("buttons", "Buttons", "Blue pills with a soft blue glow, square glass icon buttons, the two-line download button, the white SSO button, and the full-width glass submit and plan buttons from the sign-up form and the price cards.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5em">
${btnRow}
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1.5em; margin-top: 1.5em">
${/<button type="button" class="btn btn--apple">[\s\S]*?<\/button>/.exec(DOM)[0]}
${/<button type="button" class="btn btn--google">[\s\S]*?<\/button>/.exec(DOM)[0]}
</div>
<div style="display: grid; gap: 1.5em; max-width: 20em; margin-top: 1.5em">
${/<button class="btn btn--submit" type="submit">[\s\S]*?<\/button>/.exec(DOM)[0]}
${/<button class="btn plan__btn" type="button">[\s\S]*?<\/button>/.exec(featured)[0]}
</div>`, { defs: true });

add("chat", "Chat bar & voice orb", "A frosted input that wakes on focus, attachment buttons behind a plus, and a microphone that expands into a 19rem panel with a breathing orb: four gradient circles orbiting inside a glass cap. Typing and voice states are pure CSS (a required input and a hidden checkbox).",
  `<div class="hero" style="max-width: 48rem; margin: 0 auto">${el('<div class="chat"')}</div>`, { defs: true });

add("widgets", "Neon glass widgets", "The signature panels: frosted glass whose border is lit by a comet racing around it, a diagonal sheen, then neon corner lights that flicker on. A stat with a rising graph, a connect-sources hub with rays and rings, and a question stack with an action.",
  el('<div class="widgets"'), { js: true, defs: true });

add("features", "Feature cards", "Six glass cards on a three-column grid: a blue-tint icon tile, a balanced title and a short line. Each one lights up as it scrolls into view, staggered across the row.",
  el('<div class="features"'), { js: true, defs: true });

add("steps", "Step cards", "Numbered glass steps with an illustration drawn in SVG (sources joining a hub, documents clustering into a map, an agent run with an approval), a step tag, a title and a line.",
  el('<ol class="steps"'), { js: true });

add("stats", "Stats strip", "One wide glass panel with four figures in light display numerals over small grey labels.",
  el('<div class="reveal stats"'), { js: true });

add("developers", "Code panel", "An eyebrow, a title and a checklist beside a glass code window: traffic-light dots, a file name and syntax tokens in blue, cyan and grey. The code keeps its real casing.",
  `<div class="dev">${el('<div class="reveal dev__text"')}\n${el('<div class="reveal code"')}</div>`, { js: true, defs: true });

const billing = el('<div class="reveal billing"')
  .replace('<span>Monthly</span>', '<span data-ac-bill="monthly">Monthly</span>')
  .replace('<span class="is-active">', '<span class="is-active" data-ac-bill="yearly">')
  .replace('<input class="switch__input" role="switch" type="checkbox"', '<input class="switch__input" data-ac-billing role="switch" type="checkbox"');
const plans = el('<div class="plans"')
  .replace('<div class="plan__price">$19</div>', '<div class="plan__price" data-ac-yearly="$19" data-ac-monthly="$24">$19</div>')
  .replace('<div class="plan__per">per seat / month, billed yearly</div>', '<div class="plan__per" data-ac-yearly="per seat / month, billed yearly" data-ac-monthly="per seat / month">per seat / month, billed yearly</div>');
add("pricing", "Pricing plans", "A Monthly / Yearly switch over three glass plans: the featured one carries a brighter cyan rim, a badge and a filled blue button. The switch rewrites the Team price ($19 yearly, $24 monthly).",
  `<div data-ac-pricing>\n${billing}\n${plans}\n</div>`, { js: true, defs: true });

add("faq", "FAQ", "Glass <details> rows: the question on one line with a plus that turns into a cross, the answer in quiet grey below.",
  el('<div class="reveal faq"'), { js: true, defs: true });

add("cta", "Closing panel", "A wide glass panel lit from below, with the hub's rays and rings behind a big title, a line and two buttons.",
  el('<div class="reveal cta"'), { js: true, defs: true });

const modal = el('<div class="modal"').replace('<div class="modal"', '<div class="modal open inline"');
add("modal", "Sign-up modal", "The sign-up dialog, shown in place: a glass sheet with an icon title, an SSO button, a rule, two pill inputs and a submit button. On the page it opens over a dark backdrop and its corner lights come on as it opens.",
  modal, { defs: true });

add("footer", "Footer", "The wordmark with a line, three columns of quiet links and a full-width legal line.",
  el('<footer class="footer"'), { defs: true });

/* ── 6. Shared SVG defs: the icon sprite every component points at ─────── */
// The page coloured some symbols from its stylesheet (#src-db > circle, #fake-refresh rect);
// the system puts those fills on the symbols themselves
const SYMBOL_FILL = {};
for (const [, id, fill] of stripComments(pageCssRaw).matchAll(/#([\w-]+) (?:> circle|rect) \{\s*fill: ([^;]+);/g)) SYMBOL_FILL[id] = fill.trim();
const sprite = sliceEl(DOM, '<svg width="0" height="0" display="none">').html;
const defs = sprite
  .replace('<svg width="0" height="0" display="none">', '<svg id="ac-defs" width="0" height="0" style="position: absolute; width: 0; height: 0; overflow: hidden" aria-hidden="true">')
  .replace(/(<symbol id="([\w-]+)"[^>]*><(?:circle|rect) fill=")[^"]*"/g, (m, a, id) => (SYMBOL_FILL[id] ? a + SYMBOL_FILL[id] + '"' : m))
  .replace(/<symbol id="([\w-]+)"/g, '<symbol id="ac-$1"')
  .replace(/url\(#([\w-]+)\)/g, (m, x) => (IDS.has(x) ? `url(#ac-${x})` : m))
  .replace(/var\(--(?!ac-)([\w-]+)/g, "var(--ac-$1");

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Arcline components. No React: reveals, the mobile menu and the billing switch are wired here. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Glass panels light up (comet sweep, sheen, corner lights) when .ac-is-visible lands on a .ac-reveal */
  var io = !reduce && 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('ac-is-visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 }) : null;
  function init(scope) {
    scope.querySelectorAll('.ac-reveal:not([data-ac-seen])').forEach(function (el) {
      el.setAttribute('data-ac-seen', '');
      if (io) io.observe(el); else el.classList.add('ac-is-visible');
    });
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

  /* Mobile menu: the nav slides in over its backdrop, and slides back out */
  function closeMenu(nav) {
    if (!nav.classList.contains('ac-open')) return;
    nav.classList.remove('ac-open');
    if (reduce) return;
    nav.classList.add('ac-closing');
    setTimeout(function () { nav.classList.remove('ac-closing'); }, 300);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    var open = t.closest('[data-ac-menu]');
    if (open) {
      var nav = open.closest('.ac-header').querySelector('.ac-nav');
      nav.classList.remove('ac-closing');
      nav.classList.add('ac-open');
      return;
    }
    var close = t.closest('[data-ac-menu-close]');
    if (close) closeMenu(close.closest('.ac-header').querySelector('.ac-nav'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') document.querySelectorAll('.ac-nav.ac-open').forEach(closeMenu);
  });

  /* Billing switch: swaps every [data-ac-monthly] / [data-ac-yearly] text and the active label */
  document.addEventListener('change', function (e) {
    var sw = e.target.closest('[data-ac-billing]');
    if (!sw) return;
    var box = sw.closest('[data-ac-pricing]') || document;
    var key = sw.checked ? 'yearly' : 'monthly';
    box.querySelectorAll('[data-ac-' + key + ']').forEach(function (n) { n.textContent = n.getAttribute('data-ac-' + key); });
    box.querySelectorAll('[data-ac-bill]').forEach(function (n) { n.classList.toggle('ac-is-active', n.getAttribute('data-ac-bill') === key); });
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--ac-gray900)}
.ac{position:relative;overflow:hidden;background:radial-gradient(60em 40em at 50% -10%, hsla(218, 95%, 50%, 0.22), transparent 70%), var(--ac-gray900)}
.ac::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(38em 30em at 88% 6%, hsl(var(--ac-hue1), 95%, 50%, 0.2), transparent 70%), radial-gradient(34em 28em at 8% 40%, hsl(var(--ac-hue2), 95%, 45%, 0.14), transparent 70%)}
.sp-top{position:relative;padding:2em 1.5em 3em}
.sp-top-in{max-width:var(--ac-page-max);margin:0 auto}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75em 1.5em;padding:1.5em 0;box-shadow:0 1px 0 var(--ac-gray700);font-size:var(--ac-text-sm);color:var(--ac-gray300)}
.sp-meta .ac-logo{font-size:1.25rem}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:3em;align-items:center;padding-top:3em}
.sp-hero h1{text-align:left;padding-top:0;margin-bottom:0.25em}
.sp-lede{margin:0;max-width:30em;font-size:var(--ac-text-md);font-weight:300;color:var(--ac-gray300)}
.sp-swatches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0.75em}
.sp-swatches i{display:block;aspect-ratio:1;border-radius:var(--ac-radius-md);border:var(--ac-border) solid var(--ac-glass-border);box-shadow:var(--ac-shadow-panel)}
.sp-main{position:relative;max-width:calc(var(--ac-page-max) + 3em);margin:0 auto;padding:0 1.5em 8em}
.sp-sec{padding:4em 0;border-bottom:1px solid var(--ac-gray700);scroll-margin-top:12px}
.ac .sp-head{display:grid;grid-template-columns:minmax(0,17em) minmax(0,1fr);gap:0.5em 2.5em;max-width:none;margin:0 0 2.5em;padding:0;box-shadow:none;animation:none;justify-content:stretch}
.ac .sp-head h2{margin:0.6em 0 0;font-size:var(--ac-title);font-weight:400;line-height:1.1;text-align:left}
.sp-label{margin:0;font-size:var(--ac-text-xs);letter-spacing:0.18em;color:var(--ac-blue-hi)}
.ac .sp-note{margin:0;max-width:40em;font-size:1em;font-weight:300;line-height:1.6;color:var(--ac-gray300)}
.sp-demo{position:relative}
@media (max-width:900px){.sp-hero{grid-template-columns:minmax(0,1fr)}.ac .sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const logo = /<a class="logo"[\s\S]*?<\/a>/.exec(header)[0];
const HERO = `
<header class="sp-top">
<div class="sp-top-in">
<div class="sp-meta">${prefixMarkup(unhook(logo))}<span>instalanding design system · arcline@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div>
<h1>neon glass, lit from the edge.</h1>
<p class="sp-lede">Blue-black frosted panels whose border is lit by a racing comet, neon corner lights, a breathing voice orb and lowercase type on a platform face. Extracted from the Neon Glass App landing page.</p>
</div>
<div class="sp-swatches" aria-label="Core colours">
<i title="--ac-gray900" style="background:var(--ac-gray900)"></i>
<i title="--ac-gray800" style="background:var(--ac-gray800)"></i>
<i title="--ac-gray600" style="background:var(--ac-gray600)"></i>
<i title="--ac-gray100" style="background:var(--ac-gray100)"></i>
<i title="--ac-blue-lo" style="background:var(--ac-blue-lo)"></i>
<i title="--ac-blue" style="background:var(--ac-blue)"></i>
<i title="--ac-blue-hi" style="background:var(--ac-blue-hi)"></i>
<i title="--ac-blue-tint" style="background:var(--ac-blue-tint)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Arcline",
  slug: "arcline",
  version: VERSION,
  prefix: "ac",
  rootClass: "ac",
  labelClass: "sp-label",
  script: "scripts/systems/arcline.mjs",
  source: SOURCE,
  metaDescription: "The Arcline design system: tokens and working components extracted from the Neon Glass App landing page.",
  defsNote: "the icon sprite (logo, interface icons, source glyphs) every component points at",
  jsNote: "reveal lights on scroll, the mobile menu and the billing switch (no React)",
  fonts: "",
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: defs,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "arcline", prefix: "ac", rootClass: "ac", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "widget", "card", "step", "plan", "chat", "switch", "reveal", "faq", "cta", "modal", "footer", "logo"] });
