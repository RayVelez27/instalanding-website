// Extracts the Oishi design system from its landing page.
//
//   node scripts/systems/oishi.mjs
//
// Reads public/demos/oishi-taiyaki-ice-cream.html (never edits it) and writes
// public/systems/oishi/ (specimen.html, tokens.css, oishi.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell (html, the smooth-scroll rule and the
// loading overlay).
// The page's pictures are Rive artboards drawn into <canvas> by a vector player
// from a 1.6 MB inlined scene. None of that comes along: not the scene, not the
// player, not the base64 fonts and images. Every canvas becomes an art slot
// (.oi-art), a plain surface of the same size and aspect ratio that says what
// goes there, so the components keep their real proportions while the art stays
// yours. The fonts load from Google Fonts (Josefin Sans, Noto Sans JP) instead
// of the inlined woff2. What the page's script did to the HTML around the
// canvases stays: it writes the six flavor pack buttons from FLAVORS (run here
// at build time with the page's own template), and choosing one sets
// aria-pressed, --flavor and the flavor card's name, Japanese name and filling.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/oishi-taiyaki-ice-cream.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;600;700&family=Noto+Sans+JP:wght@400;500;700;900&display=swap";
const FONTS = `<link href="${FONTS_HREF}" rel="stylesheet">`;

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. The page's names
   (--ink, --cream, --red, --yolk, --tan, --tan-2, --flavor) keep their names
   under oi-. Group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Oishi · oishi@${VERSION}
   Extracted from https://instalanding.ai/demos/oishi-taiyaki-ice-cream.html
   Fonts: Josefin Sans 400/600/700 and Noto Sans JP 400-900 (Google Fonts) */
:root {
  /* Color · core */
  --oi-cream: #F7F1D7;
  --oi-ink: #09090A;
  --oi-red: #F73939;
  --oi-yolk: #FFD643;
  --oi-tan: #DCD4B1;
  --oi-tan-2: #EAE2C2;

  /* Color · flavors */
  --oi-flavor-red-beans: #F73939;
  --oi-flavor-blueberry: #6E52FF;
  --oi-flavor-green-tea: #468746;
  --oi-flavor-bubblegum: #FF6DDF;
  --oi-flavor-chocolate: #74492E;
  --oi-flavor-peach: #FFB03B;
  --oi-flavor: var(--oi-flavor-red-beans);

  /* Color · text */
  --oi-ink-muted: #4A463A;
  --oi-ink-soft: #5B5646;
  --oi-cream-dim: #E9E3C9;
  --oi-slot-line: #2A2A2C;

  /* Type · families */
  --oi-font-display: "Josefin Sans", "Josefin", system-ui, sans-serif;
  --oi-font-body: "Noto Sans JP", "NotoJP", system-ui, sans-serif;

  /* Type · scale */
  --oi-wordmark: clamp(4rem, 13vw, 11rem);
  --oi-h1: clamp(2.7rem, 6.2vw, 5.6rem);
  --oi-h2: clamp(2rem, 4.2vw, 3.25rem);
  --oi-h3: clamp(1.9rem, 3vw, 2.6rem);
  --oi-h4: 1.55rem;
  --oi-lede: clamp(1.05rem, 1.5vw, 1.25rem);
  --oi-body: 1.0625rem;
  --oi-small: 0.9rem;
  --oi-legal: 0.8rem;

  /* Shape · radii */
  --oi-radius-cabinet: 28px;
  --oi-radius-card: 22px;
  --oi-radius-base: 18px;
  --oi-radius-pack: 16px;
  --oi-radius-md: 14px;
  --oi-radius-sm: 10px;
  --oi-radius-xs: 8px;
  --oi-radius-pill: 999px;

  /* Shape · borders */
  --oi-border: 3px;
  --oi-border-btn: 2.5px;
  --oi-border-pill: 2px;
  --oi-underline: 5px;

  /* Depth · hard shadows */
  --oi-shadow-btn: 4px 4px 0 var(--oi-ink);
  --oi-shadow-lift: 5px 5px 0 var(--oi-ink);
  --oi-shadow-press: 1px 1px 0 var(--oi-ink);
  /* the card's shadow takes --oi-flavor where the card sits, so only its offset is a token */
  --oi-shadow-card-offset: 8px 8px 0;
  --oi-shadow-cabinet: 10px 10px 0 var(--oi-ink);
  --oi-shadow-btn-on-ink: 4px 4px 0 var(--oi-cream);
  --oi-shadow-lift-on-ink: 5px 5px 0 var(--oi-cream);

  /* Motion · easing */
  --oi-ease: ease;

  /* Motion · durations */
  --oi-dur-press: 0.12s;
  --oi-dur-hover: 0.15s;
  --oi-dur-flavor: 0.3s;

  /* Space · layout */
  --oi-wrap: 1240px;
  --oi-gutter: clamp(20px, 4vw, 56px);
  --oi-section: clamp(64px, 9vw, 120px);
  --oi-band-skew: -3.2deg;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under oi- (--display -> --oi-font-display, --body -> --oi-font-body,
// the cabinet's local --h -> --oi-cab-h)
const VARS = { display: "font-display", body: "font-body", h: "cab-h" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("oi-") ? m : `--oi-${VARS[n] ?? n}`));
const HEX = { "#4a463a": "ink-muted", "#5b5646": "ink-soft", "#e9e3c9": "cream-dim", "#2a2a2c": "slot-line" };
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--oi-${tok})`];
// These run after renameVars, so the page's var(--ink) already reads var(--oi-ink)
const SWAPS = [
  // Hard offset shadows, as written on the page
  val("10px 10px 0 var(--oi-ink)", "shadow-cabinet"),
  [/8px 8px 0 var\(--oi-flavor\)/g, "var(--oi-shadow-card-offset) var(--oi-flavor)"],
  val("4px 4px 0 var(--oi-ink)", "shadow-btn"),
  val("5px 5px 0 var(--oi-ink)", "shadow-lift"),
  val("1px 1px 0 var(--oi-ink)", "shadow-press"),
  val("4px 4px 0 var(--oi-cream)", "shadow-btn-on-ink"),
  val("5px 5px 0 var(--oi-cream)", "shadow-lift-on-ink"),
  // Radii (the cabinet is round on top, tighter at its base)
  [/border-radius:28px 28px 18px 18px/g, "border-radius:var(--oi-radius-cabinet) var(--oi-radius-cabinet) var(--oi-radius-base) var(--oi-radius-base)"],
  ...[[22, "card"], [16, "pack"], [14, "md"], [10, "sm"], [8, "xs"], [999, "pill"]]
    .map(([px, t]) => [new RegExp(`border-radius:${px}px(?=[;}])`, "g"), `border-radius:var(--oi-radius-${t})`]),
  // Ink borders
  [/(border(?:-top)?:)3px solid/g, "$1var(--oi-border) solid"],
  [/border:2\.5px solid/g, "border:var(--oi-border-btn) solid"],
  [/(border(?:-bottom)?:)2px solid/g, "$1var(--oi-border-pill) solid"],
  [/border-bottom:5px solid/g, "border-bottom:var(--oi-underline) solid"],
  // Type
  [/font-size:clamp\(2\.7rem,6\.2vw,5\.6rem\)/, "font-size:var(--oi-h1)"],
  [/(h2\{font-size:)clamp\(2rem,4\.2vw,3\.25rem\)/, "$1var(--oi-h2)"],
  [/font-size:clamp\(1\.9rem,3vw,2\.6rem\)/, "font-size:var(--oi-h3)"],
  [/(\.oi-steps h3\{font-size:|\.steps h3\{font-size:)1\.55rem/, "$1var(--oi-h4)"],
  [/font-size:clamp\(1\.05rem,1\.5vw,1\.25rem\)/, "font-size:var(--oi-lede)"],
  [/font:400 1\.0625rem\/1\.6/, "font:400 var(--oi-body)/1.6"],
  [/font:700 clamp\(4rem,13vw,11rem\)\/\.8/, "font:700 var(--oi-wordmark)/.8"],
  [/(\.hint\{margin-top:1rem;font-size:)\.9rem/, "$1var(--oi-small)"],
  [/(font-size:)\.8rem(;color:var\(--oi-ink-muted\)|;color:#4a463a)/, "$1var(--oi-legal)$2"],
  // Motion
  [/transition:transform \.12s,box-shadow \.12s/, "transition:transform var(--oi-dur-press) var(--oi-ease),box-shadow var(--oi-dur-press) var(--oi-ease)"],
  [/transition:border-color \.15s,background \.15s/, "transition:border-color var(--oi-dur-hover) var(--oi-ease),background var(--oi-dur-hover) var(--oi-ease)"],
  [/transition:(box-shadow|border-color) \.3s/g, "transition:$1 var(--oi-dur-flavor) var(--oi-ease)"],
  // Layout
  [/max-width:1240px/g, "max-width:var(--oi-wrap)"],
  [/padding:clamp\(64px,9vw,120px\) 0/g, "padding:var(--oi-section) 0"],
  [/skewY\(-3\.2deg\)/g, "skewY(var(--oi-band-skew))"],
  [/skewY\(3\.2deg\)/g, "skewY(calc(var(--oi-band-skew) * -1))"],
];

/* ── 3. Component CSS: the page's one <style>, minus the shell ───────── */
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
// Page-only: the document shell and the loading overlay over the scene. :root becomes the tokens.
const DROP = /^(html|:root|#loading)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.oi, .oi *)";
  if (sel === "body") return ".oi";
  return sel;
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",")}{${body}}` : "";
  }).filter(Boolean).join("\n");
}
// Every artboard canvas becomes an art slot with the canvas's own size rules
const CANVAS_SLOTS = [".screen canvas{", ".pack canvas{", ".card canvas{", ".game .stage canvas{"];
let pageRules = pageCss.replace(/\/\*[\s\S]*?\*\//g, "");
for (const s of CANVAS_SLOTS) {
  if (!pageRules.includes(s)) throw new Error("canvas rule not found: " + s);
  pageRules = pageRules.replace(s, s.replace("canvas{", ".art{"));
}
pageRules = pageRules
  // The canvas's touch and pointer cues belonged to the playable screen, not to an empty slot
  .replace(";touch-action:manipulation;cursor:pointer}", "}")
  // On the page the cabinet sits in a full-width hero, so 92vw was its column; inside a host, the column is 100%
  .replace("width:min(92vw,440px)", "width:min(100%,440px)");
if (pageRules.includes("data:")) throw new Error("inlined data left in the rules");
// The art slot itself: a quiet surface that says what goes there (written in the page's vocabulary)
const SLOT_CSS = `
.art{display:grid;place-content:center;gap:4px;padding:12px;background:var(--cream);color:#5b5646;outline:2px dashed var(--tan);outline-offset:-10px;font:700 .72rem/1.25 var(--display);letter-spacing:.12em;text-transform:uppercase;text-align:center}
.art small{font:900 .72rem/1.2 var(--body);letter-spacing:.2em}
.pack .art{outline-color:rgba(9,9,10,.25);border-radius:10px}
.game .stage .art{background:transparent;color:#e9e3c9;outline-color:#e9e3c9;border-radius:50%}`;
const base = renameVars(keep(SLOT_CSS + "\n" + pageRules));

/* ── 4. Markup: the page's body, with the script's packs written in and the canvases as slots ── */
let H = page.slice(BODY);
const slot = (label, jp, cls = "art") => `<div class="${cls}" aria-hidden="true">${label}${jp ? `<small lang="ja">${jp}</small>` : ""}</div>`;
const swap = (from, to) => {
  if (!H.includes(from)) throw new Error("markup not found: " + from.slice(0, 70));
  H = H.replace(from, to);
};
swap(/<canvas id="cv-main"[^>]*><\/canvas>/.exec(H)?.[0] ?? "<canvas id=\"cv-main\"", slot("Screen art · 9:16", "画面"));
swap('<canvas id="cv-desc" aria-hidden="true"></canvas>', slot("Flavor art · 959:600", "味"));
swap('<canvas class="mascot" id="cv-mascot" aria-hidden="true"></canvas>', slot("Mascot", "", "mascot art"));
swap('<canvas id="cv-star" aria-hidden="true"></canvas><canvas id="cv-guez" aria-hidden="true"></canvas>', slot("Character art · 1:1", "キャラ"));
// The details the script fills in when a flavor is chosen
swap('<h3 id="fl-name">', '<h3 data-fl="name">');
swap('<span class="jpname" lang="ja" id="fl-jp">', '<span class="jpname" lang="ja" data-fl="jp">');
swap('<dd id="fl-fill">', '<dd data-fl="fill">');

// The six pack buttons, from the page's own FLAVORS and its own template (the first one chosen, as choose(0) leaves it)
const FL_AT = page.indexOf("const FLAVORS = [");
const FLAVORS = new Function(`${page.slice(FL_AT, page.indexOf("];", FL_AT) + 2)}\nreturn FLAVORS;`)();
const TPL = /li\.innerHTML = `([^`]+)`/.exec(page)[1];
if (FLAVORS.length !== 6 || !TPL.includes("<canvas")) throw new Error("FLAVORS or the pack template not found");
const key = (f) => f.name.toLowerCase().replace(/\s+/g, "-");
const PACKS = FLAVORS.map((f, i) => `<li>${new Function("f", `return \`${TPL}\`;`)(f)
  .replace('aria-pressed="false"', `aria-pressed="${i === 0}" data-flavor="${key(f)}" data-fill="${f.fill}"`)
  .replace('<canvas aria-hidden="true"></canvas>', slot("").replace('class="art"', `class="art" style="background:var(--oi-flavor-${key(f)})"`))}</li>`).join("\n");
swap('id="packs" aria-label="Choose a flavor"></ul>', `id="packs" aria-label="Choose a flavor">\n${PACKS}\n</ul>`);
// Each flavor's colour is a token; the markup names the flavor, the script maps it to --oi-flavor-<name>
for (const f of FLAVORS) {
  const tok = new RegExp(`--oi-flavor-${key(f)}: ${f.color};`, "i");
  if (!tok.test(TOKENS)) throw new Error("flavor colour not in the tokens: " + f.name);
}
if (/<canvas|base64|DATA_B64/.test(H.slice(0, H.indexOf("<script")))) throw new Error("a canvas or inlined data is left in the markup");

// Section anchors become "#"; the script's id hooks and the page's data-component markers go
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-component="[^"]*"/g, "")
  .replace(/ aria-labelledby="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ href="#[a-z]*"/g, ' href="#"')
  .replace(/\n {2,}/g, "\n");
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("buttons", "Buttons & fact pills", "Buttons are ink-bordered blocks at --oi-radius-md with a hard --oi-shadow-btn (4px 4px 0 ink, no blur): Josefin 700, cream by default, red for the main action. Hover nudges them up-left onto --oi-shadow-lift; pressing pushes them down-right onto --oi-shadow-press, like a vending-machine key. Fact pills are outlined: a 2px ink border on cream, fully round. Hints are small copy in --oi-ink-muted.",
  `<div>
${piece('<ul class="facts">').replace(/<ul class="facts">/, '<ul class="facts" style="margin-top:0">')}
${piece('<div class="ctas">')}
${piece('<p class="hint">')}
</div>`);

add("tategaki", "Tategaki bar", "The logo's red vertical strip: Japanese set top to bottom (writing-mode: vertical-rl, text-orientation: upright) in Noto Sans JP 900, cream on --oi-red with wide .35em tracking. It stands beside the hero copy (たい焼きアイス) and the footer wordmark (おいしい), stretched to their height, and hides on narrow screens.",
  `<div style="display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap">
${piece('<div class="bar" lang="ja" aria-hidden="true">').replace('<div class="bar"', '<div class="bar" style="font-size:1.3rem"')}
${piece('<div class="bar" lang="ja" aria-hidden="true">', H.indexOf("<footer"))}
</div>`);

add("nav", "Header & wordmark", "The header row: the Josefin wordmark with its hiragana (おいしい) in red beside it on a shared baseline, and plain anchor links that pick up a 2px ink underline on hover. The links go under 820px.",
  piece('<header class="top"'));

add("hero", "Hero & cabinet", "Three columns: the tategaki bar, the copy (a big tight Josefin h1, a lede, outlined fact pills, the two buttons and a hint) and the red vending-machine cabinet holding the art. Under 1080px the bar goes; under 820px the cabinet drops below the copy.",
  asDiv(piece('<section class="hero"')));

add("cabinet", "Vending-machine cabinet", "The red cabinet shell: 3px ink border, round top and tighter base (--oi-radius-cabinet over --oi-radius-base) and a 10px hard --oi-shadow-cabinet. A cap line (Vending machine · 自動販売機), a black bezel around the screen, the pickup slot (取出口) beside a yolk coin slot, and two feet. The screen is an art slot at 9:16: put your own canvas, video or image in it. Its height follows --oi-cab-h (min(80vh, 840px)); width is half of that.",
  piece('<div class="cabinet"'));

add("flavors", "Flavor picker & card", "Six pack buttons (aria-pressed) over a flavor card: choosing a pack sets --oi-flavor for the section, so the card's hard shadow and the Japanese name's 5px underline recolour, and the name, Japanese name and filling update. Packs get a --oi-tan-2 ground on hover and an ink border when chosen; each pack's art slot is tinted with its flavor. Six columns, three under 1080px, two under 520px.",
  asDiv(piece('<section class="flavors"')), { js: true });

add("steps", "Numbered steps", "Three steps under 3px ink rules: a 46px round ink counter in Josefin (the last one red), an h3, a short line and the step's Japanese label in Noto Sans JP 900. They stack under 820px.",
  asDiv(piece('<section class="how"')));

add("band", "Skewed ink band", "A full-bleed ink band skewed by --oi-band-skew (its content skewed back straight): an art slot beside an h2 with a red Japanese kicker (ゲジラ), copy in --oi-cream-dim and a yolk button with a cream hard shadow. It stacks under 820px.",
  asDiv(piece('<section class="game"')));

add("footer", "Footer wordmark", "A red tategaki bar, a giant Josefin wordmark (--oi-wordmark, .8 line height, -.04em) with its one-line description, the anchor links in a right-aligned column and a small legal line across the bottom.",
  piece("<footer"));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "oi" && !m[1].startsWith("oi-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("oi-")) CLASSES.add(n);
const ATTRS = ["flavor", "fill", "fl"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "oi", hex: HEX, swaps: SWAPS, classes: [...CLASSES], attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .oi itself, or :where(.oi) in front
const ROOTED = /(^|[\s,(>+~])\.oi(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.oi) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* Headings and controls inherit the root's font inside a host (the page's own h1-h3 rule, after this, still sets Josefin) */
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.oi) ${t}`).join(",")}{font-family:inherit}`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(base))).trim()}`;
const leftHex = componentCss.match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Oishi components, no libraries. The flavor picker is delegated from the
     document, so pickers added later work without setup. Choosing a pack sets
     aria-pressed across its .oi-packs, sets --oi-flavor on the nearest
     .oi-flavors (or the .oi root) to that flavor's token, and writes the
     flavor's name, Japanese name and filling into [data-oi-fl] in the same
     scope. The page also drove its canvas art from here; the art slots are
     yours, so listen for the 'oi:flavor' event (detail: { flavor, index }) to
     drive your own. */
  function choose(btn) {
    var list = btn.closest('.oi-packs');
    if (!list) return;
    var packs = [].slice.call(list.querySelectorAll('.oi-pack'));
    packs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
    var scope = btn.closest('.oi-flavors') || btn.closest('.oi');
    var flavor = btn.getAttribute('data-oi-flavor');
    var nm = btn.querySelector('.oi-nm'), jp = nm && nm.querySelector('small');
    scope.style.setProperty('--oi-flavor', 'var(--oi-flavor-' + flavor + ')');
    var put = function (k, v) { [].forEach.call(scope.querySelectorAll('[data-oi-fl="' + k + '"]'), function (el) { el.textContent = v; }); };
    if (nm) put('name', nm.firstChild.textContent.trim());
    if (jp) put('jp', jp.textContent);
    put('fill', btn.getAttribute('data-oi-fill') || '');
    btn.dispatchEvent(new CustomEvent('oi:flavor', { bubbles: true, detail: { flavor: flavor, index: packs.indexOf(btn) } }));
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.oi')) return;
    var pack = t.closest('.oi-pack');
    if (pack) { choose(pack); return; }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own hero, its words swapped for the system's
const HERO = asDiv(piece('<section class="hero"'))
  .replace(/(<h1[^>]*>)[^<]*/, "$1The Oishi design system.")
  .replace(/(<p class="lede">)[^<]*/, "$1Cream paper, ink borders, hard offset shadows, a red vending-machine cabinet and one accent per flavor.")
  .replace(/<ul class="facts">[\s\S]*?<\/ul>/, `<ul class="facts">\n<li>${C.length} components</li>\n<li>6 flavors</li>\n<li>Josefin + Noto Sans JP</li>\n</ul>`)
  .replace(/(<a class="btn primary"[^>]*>)[^<]*/, "$1See the components")
  .replace(/(<a class="btn" [^>]*>)[^<]*/, "$1Tokens")
  .replace(/(<p class="hint">)[^<]*/, "$1The screen is an art slot: bring your own canvas, video or image.");
const CHROME = `
body{margin:0;background:var(--oi-cream)}
.sp-top{max-width:var(--oi-wrap);margin:0 auto;padding:10px var(--oi-gutter) 0;overflow:hidden}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;padding:6px 16px;border:var(--oi-border) solid var(--oi-ink);border-radius:var(--oi-radius-md);background:var(--oi-tan-2)}
.sp-top .oi-hero{padding:6px 0 72px}
.sp-top .oi-hero h1{font-size:clamp(2.6rem,5.6vw,4.8rem)}
.sp-top .oi-cabinet{--oi-cab-h:528px}
.sp-label{margin:0;font:700 12px/1.4 var(--oi-font-display);text-transform:uppercase;letter-spacing:.08em;color:var(--oi-ink)}
.sp-label::before{content:"";display:inline-block;width:8px;height:8px;margin:0 8px 2px 0;border-radius:50%;background:var(--oi-red);vertical-align:middle}
.sp-main{max-width:var(--oi-wrap);margin:0 auto;padding:24px var(--oi-gutter) 120px}
.sp-sec{padding:64px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-size:40px}
.sp-note{margin:0;max-width:640px;font-size:15px;line-height:1.55;color:var(--oi-ink-muted)}
.sp-demo{position:relative;overflow:clip;padding:clamp(16px,3vw,32px);background:var(--oi-cream);border:var(--oi-border) solid var(--oi-ink);border-radius:var(--oi-radius-cabinet)}
.sp-demo>.oi-top,.sp-demo>.oi-hero{padding:0}
.sp-demo>.oi-flavors,.sp-demo>.oi-how{padding:8px 0;border-top:0}
.sp-demo>.oi-flavors .oi-wrap,.sp-demo>.oi-how .oi-wrap,.sp-demo>.oi-foot .oi-wrap{padding:0}
.sp-demo>.oi-game{margin:56px calc(-1 * clamp(16px,3vw,32px))}
.sp-demo>.oi-foot{padding:32px 0 0}
@media (max-width:820px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-head h2{font-size:30px}.sp-top .oi-cabinet{--oi-cab-h:auto}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">oishi@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(HERO))}
</header>`;
const DEFS = `<svg id="oi-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"></svg>`;
const specimen = renderSpecimen({
  name: "Oishi",
  slug: "oishi",
  version: VERSION,
  prefix: "oi",
  rootClass: "oi",
  labelClass: "sp-label",
  script: "scripts/systems/oishi.mjs",
  source: SOURCE,
  metaDescription: "The Oishi design system: tokens and working components extracted from the Oishi taiyaki ice cream page.",
  defsNote: "empty: Oishi draws with CSS only; the page's art was canvases, which the system leaves as .oi-art slots",
  jsNote: "the flavor picker: aria-pressed, --oi-flavor and the flavor card's text, plus an oi:flavor event for your own art",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});
if (/base64|DATA_B64|<canvas/.test(specimen)) throw new Error("the specimen carries scene data or a canvas");

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "oishi", prefix: "oi", rootClass: "oi", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "primary", "bar", "facts", "cabinet", "screen", "slot", "coin", "feet", "pack", "packs", "card", "about", "steps", "game", "foot", "word", "art", "jp", "wrap"] });
