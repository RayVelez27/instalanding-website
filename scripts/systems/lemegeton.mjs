// Extracts the Lemegeton design system from its landing page.
//
//   node scripts/systems/lemegeton.mjs
//
// Reads public/demos/lemegeton-antivirus.html (never edits it) and writes
// public/systems/lemegeton/ (specimen.html, tokens.css, lemegeton.css) through
// the shared pipeline in lib.mjs. The page is a hazard-terminal HUD: its tokens
// sit on body as RGB triplets (rgba(var(--glow-rgb), .45)); the system turns
// every one of them into a hex token mixed with color-mix(), so the playground
// can recolour the glow, the amber, the danger red and the green from one
// value each. The page's attribute classes (.-bordered, .--danger, .-blink,
// .-static) become lm-bordered, lm--danger, lm-blink and lm-static, and its
// body.alert retint becomes .lm-alert, which works on the root or any element
// inside it. The fixed shell (the .aug scroller, the top bar, the overlay menu,
// the fixed scanline layer) is dropped or made static: the top bar and the
// section nav sit in the flow, and the scanlines are an absolute .lm-scan layer
// any positioned box can carry. Everything the page's script builds at boot
// (hex grids, the 72-name seal ring, the rank tally and filters, the spirit
// sigils, the summon panel, the first scan lines) is built here with the
// page's own functions, so the markup is complete as is.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/lemegeton-antivirus.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
// The page names Roboto Condensed and Noto Serif JP in its system stacks; the system loads them so the
// condensed UI face and the Mincho headings render the same everywhere (local Hiragino / Yu Mincho still win first).
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Noto+Serif+JP:wght@700&display=swap" rel="stylesheet">';

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's body tokens, its body.alert retint, its
   rank classes and its rules. One declaration per line; the group comments
   are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Lemegeton · lemegeton@${VERSION}
   Extracted from https://instalanding.ai/demos/lemegeton-antivirus.html
   Fonts: system stacks led by Roboto Condensed (UI, labels), Hiragino / Yu Mincho / Noto Serif JP (display and kanji) and ui-monospace (readouts) */
:root {
  /* Color · core */
  --lm-black: #000000;
  --lm-amber: #FFAA00;
  --lm-glow: #FF6600;
  --lm-danger: #FF3300;
  --lm-ok: #33FF66;

  /* Color · danger */
  --lm-danger-fill: #FF2233;
  --lm-danger-glow: #FF0000;

  /* Color · text and surfaces */
  --lm-white: #F4EFE6;
  --lm-text: #E2D9CB;
  --lm-dim: #D9902A;
  --lm-muted: #C08A4E;
  --lm-track: #1D0B02;
  --lm-cell-off: #2A0D03;
  --lm-term-time: #B0A796;
  --lm-term-file: #D6CDBF;

  /* Color · ranks */
  --lm-king: #FFAA00;
  --lm-duke: #FF6A2B;
  --lm-prince: #D59BFF;
  --lm-marquis: #4FD6FF;
  --lm-president: #57FF7A;
  --lm-earl: #FFE14D;
  --lm-knight: #F2F2F2;
  --lm-blood: #FF3B30;

  /* Color · alert mode */
  --lm-alert-glow: #FF1428;
  --lm-alert-amber: #FF3B30;
  --lm-alert-dim: #FF5A4F;
  --lm-alert-muted: #E06A5F;

  /* Color · derived */
  --lm-line: color-mix(in srgb, var(--lm-glow) 45%, transparent);
  --lm-line-soft: color-mix(in srgb, var(--lm-glow) 18%, transparent);
  --lm-accent: var(--lm-amber);
  --lm-accent-glow: var(--lm-glow);

  /* Type · families */
  --lm-font-cond: "Roboto Condensed", "Arial Narrow", "Helvetica Neue Condensed", "Liberation Sans Narrow", "Nimbus Sans Narrow", "Avenir Next Condensed", "Helvetica Neue", Arial, sans-serif;
  --lm-font-serif: "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif JP", "Noto Serif CJK JP", "Source Han Serif", "Times New Roman", Times, serif;
  --lm-font-mono: ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;

  /* Type · scale */
  --lm-fs: 14px;
  --lm-lh: 23px;
  --lm-hero: clamp(44px, 6vw, 104px);
  --lm-final: clamp(44px, 7vw, 120px);
  --lm-summon: clamp(44px, 5.4vw, 86px);
  --lm-h2: calc(var(--lm-fs) * 3.6);
  --lm-figure: calc(var(--lm-fs) * 3.4);
  --lm-label-lg: calc(var(--lm-fs) * 2.3);
  --lm-small: calc(var(--lm-fs) * .93);
  --lm-micro: calc(var(--lm-fs) * .86);
  --lm-term: 12.5px;

  /* Shape · radii */
  --lm-r-card: 10px;
  --lm-r-panel: 8px;
  --lm-r-btn: 6px;
  --lm-r-chip: 5px;

  /* Shape · borders */
  --lm-border: 2px;
  --lm-border-heavy: 3px;

  /* Depth · glow, stripes and scanlines */
  --lm-scanlines: repeating-linear-gradient(to bottom, rgba(0,0,0,.28) 0 1px, transparent 1px 3px);
  --lm-grid-size: 36px;
  --lm-stripe: 15px;

  /* Motion · easing */
  --lm-ease: cubic-bezier(.2,.7,.2,1);
  --lm-step: steps(2, jump-none);

  /* Motion · durations */
  --lm-dur: .45s;
  --lm-dur-lift: .5s;
  --lm-dur-pulse: 1.6s;
  --lm-dur-blink: 3s;
  --lm-dur-ward: 90s;
  --lm-dur-ward-inner: 24s;
  --lm-dur-seal: 300s;
  --lm-dur-seal-inner: 120s;

  /* Space · layout */
  --lm-gutter: 8px;
  --lm-pad: min(5vw, 110px);
  --lm-sec: clamp(60px, 8vw, 120px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// rgba(var(--x-rgb), a) -> color-mix() on a hex token, so one value recolours a colour and all its glows
const RGB = { "glow-rgb": "glow", "danger-glow-rgb": "danger-glow", "ok-rgb": "ok", "accent-rgb": "accent-glow" };
const pct = (a) => String(+(parseFloat(a) * 100).toFixed(1));
const mixRgb = (s) => s.replace(/rgba\(var\(--([a-z-]+-rgb)\),\s*([\d.]+)\)/g, (m, v, a) => {
  if (!RGB[v]) throw new Error("unknown rgb token " + v);
  return `color-mix(in srgb, var(--lm-${RGB[v]}) ${pct(a)}%, transparent)`;
});
// The page's custom properties take their system names (--text-color -> --lm-amber)
const VARS = { "text-color": "amber", "danger-fill-color": "danger-fill", "danger-text-color": "danger", "body-text": "text", bg: "black",
  cond: "font-cond", serif: "font-serif", mono: "font-mono", transition: "dur", fontSize: "fs", lineHeight: "lh", "gutter-size": "gutter" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("lm-") ? m : `--lm-${VARS[n] ?? n}`));
const HEX = { "#000": "black", "#2a0d03": "cell-off", "#1d0b02": "track", "#b0a796": "term-time", "#d6cdbf": "term-file" };
const esc = (v) => v.replace(/[().*,]/g, "\\$&");
const fsz = (v, tok) => [new RegExp(esc(v), "g"), `var(--lm-${tok})`];
const SWAPS = [
  fsz("clamp(44px, 6vw, 104px)", "hero"), fsz("clamp(44px, 7vw, 120px)", "final"), fsz("clamp(44px, 5.4vw, 86px)", "summon"),
  fsz("calc(var(--lm-fs) * 3.6)", "h2"), fsz("calc(var(--lm-fs) * 3.4)", "figure"), fsz("calc(var(--lm-fs) * 2.3)", "label-lg"),
  fsz("calc(var(--lm-fs) * .93)", "small"), fsz("calc(var(--lm-fs) * .86)", "micro"),
  [/font: 12\.5px/g, "font: var(--lm-term)"],
  [/border-radius: 10px(?=[;\s}])/g, "border-radius: var(--lm-r-card)"],
  [/border-radius: 8px(?=[;\s}])/g, "border-radius: var(--lm-r-panel)"],
  [/border-radius: 6px(?=[;\s}])/g, "border-radius: var(--lm-r-btn)"],
  [/border-radius: 5px(?=[;\s}])/g, "border-radius: var(--lm-r-chip)"],
  [/(border(?:-top|-bottom|-left|-right)?): 2px (solid|dotted|dashed)/g, "$1: var(--lm-border) $2"],
  [/(border(?:-top|-bottom|-left|-right)?): 3px (solid|dotted|dashed)/g, "$1: var(--lm-border-heavy) $2"],
  [/border-width: 3px/g, "border-width: var(--lm-border-heavy)"],
  [/border-width: 2px/g, "border-width: var(--lm-border)"],
  [/--lm-stripe-size: 15px/g, "--lm-stripe-size: var(--lm-stripe)"],
  [/--lm-blink-duration: 3s/g, "--lm-blink-duration: var(--lm-dur-blink)"],
  [/var\(--lm-blink-duration, 3s\)/g, "var(--lm-blink-duration, var(--lm-dur-blink))"],
  [/steps\(2, jump-none\)/g, "var(--lm-step)"],
  [/glowpulse 1\.6s ease-in-out/g, "glowpulse var(--lm-dur-pulse) ease-in-out"],
  [/turn 300s/g, "turn var(--lm-dur-seal)"], [/turn 120s/g, "turn var(--lm-dur-seal-inner)"],
  [/turn 90s/g, "turn var(--lm-dur-ward)"], [/turn 24s/g, "turn var(--lm-dur-ward-inner)"],
  [/\.5s cubic-bezier\(\.2,\.7,\.2,1\)/g, "var(--lm-dur-lift) var(--lm-ease)"],
  [/border-color \.5s, box-shadow \.5s/g, "border-color var(--lm-dur-lift), box-shadow var(--lm-dur-lift)"],
];
// .-bordered -> .lm-bordered, .--danger -> .lm--danger (the page's attribute classes start with dashes)
const dashCss = (css) => css.replace(/\.(-{1,2}[a-z][\w-]*)/g, ".lm$1");
const dashMarkup = (html) => html.replace(/ class="([^"]*)"/g, (_, l) => ` class="${l.split(/\s+/).filter(Boolean).map((c) => (c.startsWith("-") ? "lm" + c : c)).join(" ")}"`);

/* ── 3. Component CSS: the page's one <style>, minus the shell ────────── */
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
// Page-only parts: the document shell and its tokens (rewritten above and in EXTRA), the scroller, the skip
// link, the fixed scanline layer and the overlay menu (its kings, links and settings are page furniture)
const DROP = /^(:root|\*|html|body|body\.alert|\.aug|\.scan|\.skip|\.skip:focus|\.R-[A-Za-z]+|\.fitbox|#my-element.*|\.sigil.*|\.tog-title.*|\.menu \.aug-tog)$|^\.aug-tog|^\.aug-season/;
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s));
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // The alert-mode button is styled by its id on the page; the system hooks it by attribute
  .replace(/#darkmode\[aria-pressed="true"\]/g, '.aug-menu-btn[data-lm-alert][aria-pressed="true"]')
  // The nav's fade mask is alpha, not the black token
  .replace(/linear-gradient\(to right, #000 calc/g, "linear-gradient(to right, black calc");
const base = renameVars(mixRgb(dashCss(keep(pageRules))));

/* ── 4. Build-time data: the page's own script, evaluated here ───────── */
// The roster and the helpers (hash, pad, plural, hexHTML, sigil) are sliced out of the page's script verbatim
const script = page.slice(page.indexOf("var S = ["), page.indexOf("/* ---------- hero ring"));
const { S, RANKS, hash, pad, plural, hexHTML, sigil, escHtml } = new Function(`${script.replace(/document\.querySelectorAll\('\[data-hex\]'\)[\s\S]*?\n  \}\);\n/, "")}
  return { S, RANKS, hash, pad, plural, hexHTML, sigil, escHtml: esc };`)();
// The page's hex-grid builder, run on a spec string ("rows,cols,tone[,small]"); className is "hex-grid" on the page
function hexGrid(spec) {
  const p = spec.split(","), rows = +p[0], cols = +p[1], tone = p[2], small = p[3] === "small";
  const cls = (tone === "amber" ? "--amber" : tone === "ok" ? "--ok" : "") + (small ? " -sm" : "");
  let h = hash("hex-grid" + rows + cols), html = "";
  for (let r = 0; r < rows; r++) {
    html += '<div class="hex-row">';
    for (let c = 0; c < cols; c++) { h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; html += hexHTML(cls + ((h % 7 === 0) ? " -off" : " -blink")); }
    html += "</div>";
  }
  return html;
}
const fillHex = (html) => html.replace(/<div class="hex-grid" data-hex="([^"]+)"([^>]*)><\/div>/g, (m, spec, rest) => `<div class="hex-grid"${rest}>${hexGrid(spec)}</div>`);
const tally = {};
RANKS.forEach((r) => (tally[r] = 0));
S.forEach((x) => tally[x[1]]++);
const RANKS_HTML = RANKS.map((r) => '<div class="rank R-' + r + '">' + hexHTML("--rank") + plural(r) + "<span>" + pad(tally[r], 2) + "</span></div>").join("");
const FILTERS_HTML = '<button class="filter on R-King" data-r="all" aria-pressed="true">' + hexHTML("--rank") + "all <small>72</small></button>" +
  RANKS.map((r) => '<button class="filter R-' + r + '" data-r="' + r + '" aria-pressed="false">' + hexHTML("--rank") + plural(r) + " <small>" + tally[r] + "</small></button>").join("");
// A dozen of the 72 that covers all seven ranks; the first is summoned
const PICK = [0, 1, 2, 3, 4, 20, 49, 22, 43, 8, 35, 71];
const SPIRITS_HTML = PICK.map((i) => {
  const x = S[i], on = i === 0;
  return '<button class="spirit R-' + x[1] + (on ? " on" : "") + '" data-r="' + x[1] + '" aria-pressed="' + on + '" aria-label="Spirit ' + (i + 1) + ", " + x[0] + ", " + x[1] + ", binds " + escHtml(x[3]) + '">' +
    '<span class="no" aria-hidden="true">' + pad(i + 1, 2) + '</span><span class="rk" aria-hidden="true">' + hexHTML("--rank") + "</span>" + sigil(x[0]) +
    '<span class="nm">' + x[0] + '</span><span class="rn">' + x[1] + '</span><span class="bd">' + escHtml(x[3]) + "</span></button>";
}).join("");
// The scan terminal after the page's first six boot steps (the clock is fixed so the file is stable)
const files = /var files = (\[[^\]]+\]);/.exec(page)[1];
const FILES = JSON.parse(files.replace(/'/g, '"'));
let tick = 0, meter = 0, banished = 4, hitNow = false;
const TERM = [];
for (let w = 0; w < 6; w++) {
  tick++;
  const f = FILES[(tick * 5) % FILES.length], stamp = "03:13:" + pad(10 + w * 1, 2);
  if (tick % 3 === 0) {
    const i = (tick * 11 + 5) % 72, x = S[i];
    TERM.push('<div><span class="t">' + stamp + '</span><span class="bound">▲ no.' + pad(i + 1, 2) + " <b>" + x[0].toUpperCase() + "</b> bound " + escHtml(x[3]) + "</span></div>");
    hitNow = true; banished++;
  } else {
    TERM.push('<div><span class="t">' + stamp + '</span><span class="f ' + (tick % 5 === 0 ? "ok" : "") + '">' + (tick % 5 === 0 ? "clean · " : "scan · ") + escHtml(f) + "</span></div>");
    hitNow = false;
  }
  meter = (meter + 3 + (tick % 4)) % 101;
}

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// Section anchors become "#"; the seal's text paths keep their ids under lm-; every other id is page wiring
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/<textPath href="#(ringPath2?)"/g, '<textPath data-keep-href="$1"')
  .replace(/ href="#[^"]*"/g, ' href="#"')
  .replace(/ id="(ringPath2?)"/g, ' data-keep-id="$1"')
  .replace(/ id="[^"]*"/g, "")
  .replace(/ data-keep-id="([^"]+)"/g, ' id="lm-$1"')
  .replace(/ data-keep-href="([^"]+)"/g, ' href="#lm-$1"');
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<(section|header)/, "<div").replace(/<\/(section|header)>$/, "</div>");
const drop = (html, marker) => { const p = sliceEl(html, marker); return html.slice(0, html.indexOf(marker)) + html.slice(p.end); };

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: mixRgb(dashMarkup(fillHex(unhook(markup)))).replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m)), ...opts });

const TOPBAR = el('<div class="aug-menu"');
const HERO = el('<header class="aug-ban"');
const LEFT = piece(HERO, '<div class="aug-ban-left"');
const RIGHT = piece(HERO, '<div class="aug-ban-right"');
const NAV = el('<nav class="aug-nav"');
const WARDS = el('<section class="section" id="liturgy"');
const SCAN = el('<section class="section" id="vigil"');
const GRIM = el('<section class="section" id="registry"');
const PRICING = el('<section class="section" id="rites"');

add("topbar", "Top bar", "A black bar on a glowing amber rule: the 封印 stamp brand with its condensed wordmark and caption, two mini status pills (green with a blinking dot, amber), and outlined condensed buttons that fill amber on hover or when pressed. Pause motion freezes every spinner, blink and stream inside the root (lm-static); alert mode retints it red (lm-alert) and its pressed state is danger red.",
  drop(TOPBAR, '<button id="menu"')
    .replace('id="motion"', 'data-motion').replace('id="darkmode"', 'data-alert'), { js: true });

const btnPrimary = piece(LEFT, '<a href="#rites" class="btn btn-primary"');
const btnGhost = piece(LEFT, '<a href="#registry" class="btn btn-ghost"');
add("buttons", "Buttons & links", "Buttons are condensed uppercase on a 3px amber outline with a 1px glow ring inside and out. Primary is solid amber with black text and an outer glow, and inverts on hover; ghost is outlined and takes a faint amber wash. Toolbar buttons are 2px outlines that fill amber; square nav buttons carry chevrons. Links are white uppercase with an accent ▸ that slides right, or an amber underline rule.",
  `<div class="demo-pad">
<div class="demo-row">${btnPrimary}${btnGhost}${piece(PRICING, '<a href="#" class="btn btn-primary"')}</div>
<div class="demo-row">${piece(TOPBAR, '<button id="motion"').replace('id="motion"', "data-motion")}${piece(TOPBAR, '<button id="darkmode"').replace('id="darkmode"', "data-alert").replace('aria-pressed="false"', 'aria-pressed="true"')}${piece(NAV, '<div class="aug-nav-right"')}</div>
<div class="demo-row"><div class="ward R-King demo-bare">${piece(WARDS, '<a class="ward-link"')}</div>${piece(PRICING, '<div class="plans-note"')}</div>
</div>`, { js: true });

const metaPills = piece(TOPBAR, '<div class="menu-meta"');
const hudTop = piece(RIGHT, '<div class="hud-top"');
const klabel = piece(RIGHT, '<div class="label klabel');
add("labels", "Labels, pills & stamps", "Labels are condensed uppercase with a four-way text glow. -bordered adds a 3px border with a 1px glow inside and out; --danger is red, --ok green, --rank takes the rank colour; -mini and -sm are the small pill sizes, -short is the heavy one-word size, and -blink pulses a red glow (the text never dims). The kanji label pairs a big Mincho stamp with a caption beside a striped decal; eyebrows are an amber kanji stamp on an outlined caption.",
  `<div class="demo-pad">
<div class="demo-row">${hudTop.replace(/^<div class="hud-top">/, '<div class="hud-top demo-wide">')}</div>
<div class="demo-row">${metaPills}${piece(LEFT, '<div class="hero-micro"')}</div>
<div class="demo-row"><div class="summon-no R-King">${piece(GRIM, '<span class="label -bordered -sm --rank"')}<span class="label -bordered -sm --rank">king</span>${piece(GRIM, '<span class="label -bordered -mini --ok">召喚')}</div>${piece(WARDS, '<span class="status label -bordered -mini --danger"').replace("status ", "")}${piece(el('<section class="final"'), '<span class="label -bordered -mini --danger -blink"')}</div>
<div class="demo-row">${klabel}${piece(LEFT, '<span class="eyebrow"')}${piece(GRIM, '<span class="eyebrow"')}${piece(SCAN, '<span class="eyebrow"')}</div>
</div>`);

add("type", "Display type & scanlines", "Display type is a heavy Mincho serif, uppercase with tight tracking and a soft amber glow, in white; one word turns danger red. A condensed amber kicker sits above it at a third of the size, and a vertical outlined 七十二 rides the corner. The scanline layer (lm-scan) is a repeating 1px-in-3px dark band multiplied over any positioned box. Section heads pair an eyebrow stamp, a serif h2 and a body lead.",
  `<div class="type-demo">${LEFT.replace(/<\/div>$/, '<div class="scan" aria-hidden="true"></div></div>')}
<div class="demo-pad">${piece(GRIM, '<div class="sec-head"')}</div></div>`);

add("hex", "Hex-cell meters", "Hexagon cells built from one bar and two rotated pseudo-elements, glowing in danger red, amber (--amber), green (--ok) or the rank colour (--rank), with -sm cells and dark -off cells. Cells blink on stepped timing, offset by row and column so the grid shimmers. The page generates its grids from data-hex=\"rows,cols,tone[,small]\"; here the cells are written out. The rank tally shows single cells as rank keys.",
  `<div class="demo-pad">
<div class="demo-row"><div class="hex-grid" data-hex="3,9,danger"></div><div class="hex-grid" data-hex="3,9,amber"></div><div class="hex-grid" data-hex="3,6,ok"></div><div class="hex-grid" data-hex="2,3,amber,small"></div></div>
<div class="ranks demo-ranks">${RANKS_HTML}</div>
</div>`);

const RING = S.map((x) => x[0]).join(" · ") + " · ";
add("seal", "Seal HUD", "The occult seal, drawn in SVG: an outer ring of all 72 names on a text path and a dotted tick ring turning one way, an inner red ring with the Clavicula legend, a red hexagram and six node circles turning the other way, and a red core. A crosshair reticle sits behind it, mono readouts with amber and red edge rules flank it, outlined danger labels blink above it, and a danger hex grid and the 内部 kanji label sit below. Click it to pause motion.",
  RIGHT.replace(/(<textPath href="#ringPath")([^>]*)>[^<]*</, `$1$2>${RING}<`).replace(/(<span id="hudThreats">)\d+/, `$1${pad(banished, 4)}`), { js: true });

add("alert", "Alert mode", "The page's alarm state: lm-alert on the root or any element inside it swaps the glow to #FF1428 and the amber to #FF3B30 (dim and muted follow), so every outline, glow, hex cell and stamp turns red at once (on the root, the ruled grid too). Rank colours keep their own hues. The top bar's alert button toggles it on the nearest root.",
  `<div class="alert demo-pad">
<div class="demo-row">${hudTop.replace(/^<div class="hud-top">/, '<div class="hud-top demo-wide">')}</div>
<div class="demo-row"><div class="hex-grid" data-hex="3,9,amber"></div>${metaPills}</div>
${piece(el('<section class="section covenant"'), '<div class="sec-head"')}
<div class="demo-row">${btnPrimary}${btnGhost}</div>
</div>`);

add("nav", "Section nav", "A 44px black strip on an amber rule: a small amber hex grid, condensed uppercase links prefixed with dim kanji (the current one fills amber), a green blinking all-systems-nominal status, and square chevron buttons. The links scroll sideways on phones and the kanji drop out.",
  NAV.replace('<a href="#liturgy">', '<a href="#liturgy" class="on" aria-current="true">'), { js: true });

add("readouts", "Readout strip", "Four cells ruled apart: a big glowing amber monospace figure, a condensed uppercase caption, a dim kanji index and a thin amber progress bar on a dark track. Two columns under 1100px.",
  el('<div class="proof"'));

add("wards", "Ward cards", "Three cards, each in its rank colour: a header with a solid kanji stamp, a mono ward code and a striped decal; a ruled-grid plate holding an emblem drawn in SVG (rings and dashed ticks turning slowly) with a mono readout and a status pill; then a condensed kicker, a serif title, a lead, dotted-rule spec pills and a link whose arrow slides. Cards lift and glow on hover.",
  asDiv(WARDS));

add("scan", "Scan terminal", "A terminal window on a heavy amber outline: a kanji title bar with a green status pill, three core boxes that turn red and read BANISH when they vote on a threat, a mono log of timestamped scans (clean files green, bound threats red with the spirit's name in white) and a glowing progress meter. Beside it, a section head and a rank tally keyed by hex cells.",
  asDiv(SCAN)
    .replace(/<div class="core">([\s\S]*?)<b>clear<\/b><\/div>/g, (m, a) => (hitNow ? `<div class="core hit">${a}<b>banish</b></div>` : m))
    .replace('<div class="term" id="term"></div>', `<div class="term">${TERM.join("")}</div>`)
    .replace('<i id="meterBar"></i>', `<i style="width:${meter}%"></i>`)
    .replace(/(<b id="meterPct">)0%/, `$1${meter}%`)
    .replace('<div class="ranks" id="ranks"></div>', `<div class="ranks">${RANKS_HTML}</div>`));

add("filters", "Search & rank filters", "A section head beside the tools: a search field on a heavy amber outline with a 検 stamp and a mono count, then rank filter buttons, each outlined in its rank colour with a hex key and a mono count, that fill solid when pressed. Pressing one shows only that rank's cards in the grid.",
  `<div class="demo-pad">${piece(GRIM, '<div class="grimoire-head"')}
<div class="filters" role="group" aria-label="Filter by rank">${FILTERS_HTML}</div></div>`, { js: true });

const b = S[0], hb = hash(b[0]);
add("summon", "Summon panel", "The featured record, in its rank colour: a striped left edge, a circular sigil plate (each spirit's sigil traces its name's letters round a 26-point wheel), rank and number pills with a green summoned pill, a huge serif name, lore and what it binds, and big mono stats with a blinking bound-and-watching status.",
  `<div class="demo-pad">${piece(GRIM, '<div class="summon R-King"')
    .replace('<div class="summon-sigil" id="sSigil"></div>', `<div class="summon-sigil">${sigil(b[0])}</div>`)
    .replace(/(<p class="lore" id="sLore">)/, `$1${escHtml(b[2])}`)
    .replace(/(<span id="sBinds">)/, `$1${escHtml(b[3])}`)
    .replace(/(<b id="sToday">)0/, `$1${(hb % 9000 + 120).toLocaleString("en-US")}`)
    .replace(/(<b id="sSpeed">)0ms/, `$1${hb % 280 + 40}ms`)}</div>`);

add("spirits", "Spirit grid", "Spirit cards on black in their rank colour: a solid number tab, a hex rank key, the spirit's sigil (it turns 45° on hover), a condensed name, the rank and what it binds. The chosen card glows and carries a SUMMONED band. Two columns on phones.",
  `<div class="demo-pad"><div class="spirits">${SPIRITS_HTML}</div></div>`, { js: true });

add("directives", "Directives", "Four outlined cards on a faint red wash: a big glowing mono number, a dim kanji, a condensed uppercase title and a short lead.",
  asDiv(el('<section class="section covenant"')));

add("pricing", "Pacts", "Three plans in their rank colours: a serif name with a kanji numeral, a big mono price, a dotted rule and diamond bullets, and a full-width button. The featured plan has the heavy outline, a glow and a blinking danger recommended tag on its top edge.",
  asDiv(PRICING));

add("cta", "Hazard CTA", "A frame of red hazard stripes with glowing edges around a black core: a blinking danger pill, a huge serif headline, a lead, the primary button, and a giant outlined 結界 behind it.",
  asDiv(el('<section class="final"')));

add("footer", "Footer", "A ruled footer: the stamp brandmark, condensed uppercase links that turn amber on hover, and a muted credit line.",
  el('<footer class="foot"'));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
// The root carries what the page set on body and on its .aug scroller: type, colour and the ruled grid.
// Rank classes, the derived colours and the alert retint are restated so they recompute wherever they're set.
const RANK_CSS = ["King", "Duke", "Prince", "Marquis", "President", "Earl", "Knight", "Blood"]
  .map((r) => `.R-${r} { --lm-accent: var(--lm-${r.toLowerCase()}); --lm-accent-glow: var(--lm-${r.toLowerCase()}); }`).join("\n");
const EXTRA = `
.lm {
  font: 400 var(--lm-fs) / var(--lm-lh) var(--lm-font-cond); font-stretch: condensed; letter-spacing: .2px;
  color: var(--lm-text);
  background-color: var(--lm-black);
  background-image: linear-gradient(color-mix(in srgb, var(--lm-glow) 5.5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--lm-glow) 5.5%, transparent) 1px, transparent 1px);
  background-size: var(--lm-grid-size) var(--lm-grid-size);
}
.lm.alert, .lm .alert { --lm-glow: var(--lm-alert-glow); --lm-amber: var(--lm-alert-amber); --lm-dim: var(--lm-alert-dim); --lm-muted: var(--lm-alert-muted); }
.lm, .lm .alert {
  --lm-line: color-mix(in srgb, var(--lm-glow) 45%, transparent);
  --lm-line-soft: color-mix(in srgb, var(--lm-glow) 18%, transparent);
  --lm-accent: var(--lm-amber);
  --lm-accent-glow: var(--lm-glow);
}
${RANK_CSS}
:where(.lm, .lm *), :where(.lm, .lm *)::before, :where(.lm, .lm *)::after { box-sizing: border-box; }
h1, h2, h3, h4, h5, h6 { font-family: inherit; }
.scan { position: absolute; inset: 0; z-index: 2; pointer-events: none; background: var(--lm-scanlines); mix-blend-mode: multiply; }
.smooth .scan { display: none; }
.aug-menu { position: relative; z-index: auto; }
.aug-nav { position: relative; z-index: auto; }
.aug-ban-left, .aug-ban-right { border: 0; }
.aug-ban-right { max-height: none; }
.type-demo .aug-ban-left { padding: clamp(36px, 5vw, 80px); }
.type-demo .sec-head { margin-bottom: 0; }
.demo-pad { padding: clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }
.demo-row + .demo-row, .demo-pad > * + .demo-row, .demo-row + .ranks { margin-top: 24px; }
.demo-wide { flex: 1; }
.demo-bare.ward { display: inline-flex; background: none; border: 0; overflow: visible; }
.demo-bare .ward-link { padding-top: 0; }
.demo-ranks { max-width: 640px; }
.alert .sec-head { margin: 28px 0 0; }
@media (max-width: 760px) {
.type-demo .aug-ban-left { padding: 52px 16px; }
}`;
const CLASSES = new Set();
const allCss = dashCss(base + EXTRA);
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "lm" && !m[1].startsWith("lm-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("lm")) CLASSES.add(n);
// Set by the component script, not present in the markup
["alert", "on", "hit"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["blink", "glowpulse", "turn", "rise"];
const ATTRS = ["motion", "alert", "r"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "lm", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(mixRgb(css))}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .lm itself, or :where(.lm) in front. The state classes the script
// puts on the root itself (lm-static, lm-smooth, lm-alert) match on the root or on any element inside it.
const ROOTED = /(^|[\s,(>+~])\.lm(?![\w-])/;
const ROOT_STATES = /^\.lm-(static|smooth|alert)(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).flatMap((s) => (ROOTED.test(s) ? [s] : ROOT_STATES.test(s) ? [`.lm${s}`, `.lm ${s}`] : [`:where(.lm) ${s}`])).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(dashCss(base + "\n" + EXTRA)))).replace(/\n{3,}/g, "\n\n").trim();
if (/rgb\),|--[a-z]+-rgb/.test(componentCss)) throw new Error("an RGB triplet token survived");

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Lemegeton components, no libraries. Pause motion and alert mode toggle
     lm-static and lm-alert on the nearest .lm root (clicking the seal pauses
     too); the section nav marks the link you press; rank filters press one at
     a time and show only that rank's spirit cards in the same root; a spirit
     card marks itself summoned. Under prefers-reduced-motion the CSS already
     stops every spinner, blink and pulse. */
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  var PAUSE = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="1.5" y="1" width="3" height="10" fill="currentColor"/><rect x="7.5" y="1" width="3" height="10" fill="currentColor"/></svg>';
  var PLAY = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 1 L11 6 L2 11 Z" fill="currentColor"/></svg>';
  function setStatic(root, on) {
    root.classList.toggle('lm-static', on);
    each(root, '[data-lm-motion]', function (b) {
      b.setAttribute('aria-pressed', String(on));
      var l = b.querySelector('.lm-lbl'), i = b.querySelector('.lm-ico');
      if (l) l.textContent = on ? 'resume motion' : 'pause motion';
      if (i) i.innerHTML = on ? PLAY : PAUSE;
    });
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    var root = t.closest('.lm');
    if (!root) return;

    var m = t.closest('[data-lm-motion]');
    if (m || t.closest('.lm-aug-ban-right')) { setStatic(root, !root.classList.contains('lm-static')); return; }

    var al = t.closest('[data-lm-alert]');
    if (al) {
      var on = !root.classList.contains('lm-alert');
      root.classList.toggle('lm-alert', on);
      each(root, '[data-lm-alert]', function (b) { b.setAttribute('aria-pressed', String(on)); });
      return;
    }

    var link = t.closest('.lm-nav-links a');
    if (link) {
      e.preventDefault();
      each(link.parentNode, 'a', function (a) { var me = a === link; a.classList.toggle('lm-on', me); if (me) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      return;
    }

    var f = t.closest('.lm-filter');
    if (f) {
      var r = f.getAttribute('data-lm-r'), n = 0;
      each(f.parentNode, '.lm-filter', function (b) { var me = b === f; b.classList.toggle('lm-on', me); b.setAttribute('aria-pressed', String(me)); });
      each(root, '.lm-spirit', function (c) { var ok = r === 'all' || c.getAttribute('data-lm-r') === r; c.style.display = ok ? '' : 'none'; if (ok) n++; });
      each(root, '.lm-count b', function (b) { b.textContent = n; });
      return;
    }

    var s = t.closest('.lm-spirit');
    if (s) {
      each(s.parentNode, '.lm-spirit', function (c) { var me = c === s; c.classList.toggle('lm-on', me); c.setAttribute('aria-pressed', String(me)); });
      return;
    }

    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(dashMarkup(unhook(piece(TOPBAR, '<a href="#" class="brand"'))));
const CHROME = `
body{margin:0;background:#000}
.sp-top{position:relative;overflow:hidden;padding:22px clamp(16px,4vw,56px) 72px;border-bottom:var(--lm-border) solid var(--lm-line)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:var(--lm-border) solid var(--lm-line)}
.sp-meta>span{font:700 var(--lm-small)/1 var(--lm-font-cond);letter-spacing:2px;text-transform:uppercase;color:var(--lm-dim)}
.sp-hero{position:relative;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px 48px;align-items:end;margin-top:clamp(40px,7vw,96px)}
.sp-hero h1{margin:0;font:700 clamp(44px,6.4vw,104px)/.9 var(--lm-font-serif);letter-spacing:-.035em;text-transform:uppercase;color:var(--lm-white);text-shadow:0 0 26px color-mix(in srgb,var(--lm-glow) 30%,transparent)}
.sp-hero h1 em{font-style:normal;color:var(--lm-danger);text-shadow:0 0 18px color-mix(in srgb,var(--lm-danger-glow) 55%,transparent)}
.sp-hero p{margin:0;max-width:46ch;font-size:calc(var(--lm-fs)*1.2);line-height:1.55;color:var(--lm-text)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:24px}
.sp-swatches i{display:block;height:52px;border-radius:var(--lm-r-btn);box-shadow:inset 0 0 0 2px var(--lm-line)}
.sp-main{padding:0 clamp(16px,4vw,56px) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font:700 clamp(28px,2.8vw,40px)/1 var(--lm-font-serif);letter-spacing:-.03em;text-transform:uppercase;color:var(--lm-white)}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;font:700 var(--lm-small)/1 var(--lm-font-cond);letter-spacing:2px;text-transform:uppercase;color:var(--lm-amber)}
.sp-label::before{content:"";width:8px;height:8px;background:var(--lm-amber);transform:rotate(45deg);box-shadow:0 0 6px color-mix(in srgb,var(--lm-glow) 70%,transparent)}
.sp-note{margin:0;max-width:680px;font-size:calc(var(--lm-fs)*1.1);line-height:1.55;color:var(--lm-text)}
.sp-demo{--lm-pad:clamp(16px,4vw,48px);position:relative;border-radius:var(--lm-r-card);overflow:clip;background:var(--lm-black);box-shadow:0 0 0 var(--lm-border) var(--lm-line)}
.sp-demo .lm-section{padding:clamp(40px,5vw,72px) clamp(16px,4vw,48px)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${brand}<span>Design system · lemegeton@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Bind it.<br><em>Seal</em> it.</h1>
<div>
<p>A dark hazard-terminal language: black and a ruled amber grid, outlined amber chips and buttons with double glow rings, red danger labels that pulse, green status pills, Mincho kanji stamps over a heavy condensed serif display, scanlines, hexagon-cell meters, striped hazard decals, an occult seal drawn in SVG with counter-rotating rings, and an alert mode that retints all of it red. Extracted from the Hazard Terminal Security page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--lm-black" style="background:var(--lm-black)"></i><i title="--lm-amber" style="background:var(--lm-amber)"></i><i title="--lm-glow" style="background:var(--lm-glow)"></i><i title="--lm-danger" style="background:var(--lm-danger)"></i><i title="--lm-ok" style="background:var(--lm-ok)"></i>
</div>
</div>
</div>
<div class="lm-scan" aria-hidden="true"></div>
</header>`;
const specimen = renderSpecimen({
  name: "Lemegeton",
  slug: "lemegeton",
  version: VERSION,
  prefix: "lm",
  rootClass: "lm",
  labelClass: "sp-label",
  script: "scripts/systems/lemegeton.mjs",
  source: SOURCE,
  metaDescription: "The Lemegeton design system: tokens and working components extracted from the Hazard Terminal Security page.",
  defsNote: "empty: every drawing (the seal, the ward emblems, the sigils) is inline SVG in its component",
  jsNote: "pause motion and alert mode on the root, the seal's click-to-pause, the section nav, the rank filters and the spirit grid",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: '<svg id="lm-defs" width="0" height="0" aria-hidden="true" style="position:absolute"></svg>',
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "lemegeton", prefix: "lm", rootClass: "lm", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["label", "btn", "btn-primary", "btn-ghost", "hex", "hex-grid", "eyebrow", "ward", "spirit", "filter", "plan", "summon", "window", "proof", "foot", "aug-menu", "aug-nav", "circle", "scan", "alert"] });
