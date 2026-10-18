// Extracts the Overclock design system from its landing page.
//
//   node scripts/systems/overclock.mjs
//
// Reads public/demos/overclock-deploy.html (never edits it) and writes
// public/systems/overclock/ through scripts/systems/lib.mjs: specimen.html,
// tokens.css and overclock.css.
//
// The page is a black-and-white manga issue: ink panels with hand-drawn
// (SVG-displaced) outlines, halftone screentone, Bangers lettering over Anton
// numerals and Barlow Condensed body, a sliced retro sun over a city skyline.
// Its five :root colours become the core, its repeated literals (greys, the
// terminal ink, the night panel) become tokens, and every class, keyframe and
// filter id moves under the oc- prefix. The page's typing loop is page logic,
// so the terminal is shown on its finished frame; the sun and skyline builders
// are kept, self-contained, in the component script.
import { readPage, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/overclock-deploy.html";
const { page, el, css: pageCssRaw, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
const P = "oc";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. Group comments ("/* Color · core *​/")
   are read by the dialog to lay the token panels out, so keep the format. */
const TOKENS = `/* InstaLanding design system · Overclock · overclock@${VERSION}
   Extracted from https://instalanding.ai/demos/overclock-deploy.html
   Fonts (Google Fonts): Bangers (lettering), Anton (numerals), Barlow Condensed 400/600/700 + italic 600 (body), JetBrains Mono 400/700 */
:root {
  /* Color · core */
  --oc-ink: #111111;
  --oc-paper: #F8F8F5;
  --oc-white: #FFFFFF;
  --oc-grey: #E2E2DF;
  --oc-mid: #BDBDB8;
  --oc-desk: #ECECE7;
  --oc-dot: #D8D8D3;

  /* Color · terminal & night */
  --oc-term-text: #EAEAE4;
  --oc-term-dim: #8A8A85;
  --oc-night-text: #CFCFCA;
  --oc-night-shadow: #3D3D3D;
  --oc-night-rule: #2C2C2C;
  --oc-night-line: #444444;
  --oc-night-btn: #555555;

  /* Color · screentone */
  --oc-tone-light: #EEEEEE;
  --oc-tone-mid: #DDDDDD;
  --oc-tone-mark: #CCCCCC;

  /* Type · families */
  --oc-font-display: "Bangers", "Comic Sans MS", sans-serif;
  --oc-font-numeral: "Anton", Impact, sans-serif;
  --oc-font-body: "Barlow Condensed", "Arial Narrow", sans-serif;
  --oc-font-mono: "JetBrains Mono", ui-monospace, monospace;
  --oc-font-sfx: sans-serif;

  /* Type · scale */
  --oc-display-xl: 84px;
  --oc-display-lg: 82px;
  --oc-display-md: 48px;
  --oc-display-sm: 30px;
  --oc-numeral-xl: 64px;
  --oc-numeral-lg: 56px;
  --oc-numeral-md: 42px;
  --oc-button: 20px;
  --oc-body-lg: 19px;
  --oc-body: 17px;
  --oc-code: 13px;
  --oc-label: 12px;
  --oc-micro: 11px;

  /* Shape · radii */
  --oc-radius-panel: 0px;
  --oc-radius-round: 50%;

  /* Shape · borders */
  --oc-border-rule: 2px;
  --oc-border-ink: 3px;
  --oc-border-frame: 4px;
  --oc-border-heavy: 6px;

  /* Depth · hard ink shadows */
  --oc-shadow-btn: 4px 4px 0 var(--oc-mid);
  --oc-shadow-btn-hover: 6px 6px 0 var(--oc-mid);
  --oc-shadow-btn-press: 1px 1px 0 var(--oc-mid);
  --oc-shadow-ink: 4px 4px 0 var(--oc-ink);
  --oc-shadow-ink-hover: 6px 6px 0 var(--oc-ink);
  --oc-shadow-frame: 10px 10px 0 var(--oc-ink);
  --oc-shadow-panel: 10px 10px 0 var(--oc-white), 10px 10px 0 4px var(--oc-ink);
  --oc-shadow-night: 7px 7px 0 var(--oc-night-shadow);

  /* Motion · easing */
  --oc-ease-pop: cubic-bezier(.16, 1, .3, 1);
  --oc-ease-needle: cubic-bezier(.4, 0, .2, 1);

  /* Motion · durations */
  --oc-dur-press: .12s;
  --oc-dur-open: .35s;
  --oc-dur-rise: .9s;
  --oc-dur-cursor: 1s;
  --oc-dur-floor: 1.5s;
  --oc-dur-sunrise: 2.8s;
  --oc-dur-chip: 4s;

  /* Space · layout */
  --oc-page-max: 1120px;
  --oc-gutter: 14px;
  --oc-gap: 12px;
  --oc-panel-pad: 18px;
  --oc-section-gap: 26px;

  /* Pattern · screentone */
  --oc-tone-dot: 1.2px;
  --oc-tone-pitch: 7px;
  --oc-tone-page-pitch: 9px;
  --oc-hatch-pitch: 6px;
  --oc-speed-ray: 1.2deg;
  --oc-speed-gap: 7deg;
}`;

/* ── 2. The page CSS, trimmed to the system ───────────────────────────── */
function drop(css, re, what) {
  if (!re.test(css)) throw new Error("drop not found: " + what);
  return css.replace(re, "");
}
let css = pageCssRaw;
css = drop(css, /^:root\{[\s\S]*?\n\}\n/m, ":root");
css = drop(css, /^html\{scroll-behavior:smooth\}\n/m, "html");
// The page's body becomes the system root (the dotted desk stays page chrome)
css = css.replace(/^body\{[\s\S]*?\n\}\n/m, `.oc{
  color:var(--ink);
  font-family:"Barlow Condensed",sans-serif;
  font-size:17px;
  line-height:1.55;
}
`);
// The page frame is page chrome, not a component
css = drop(css, /^\.page\{[\s\S]*?\n\}\n/m, ".page");
css = drop(css, /^\s*\.page\{margin:0;border-width:0 0 4px;box-shadow:none\}\n/m, ".page media");

/* Element rules become rules on the system root, with :where() so they stay
   as weak as they were and the classes still win. A comment before a rule is
   captured with its selector by the pattern below: keep it, scope what follows. */
function scopeElements(text) {
  return text.replace(/(^|[{}])(\s*)([^{}@]+?)(\s*)\{/g, (m, open, sp, rawSel, sp2) => {
    const [, lead, sel] = /^((?:\s*\/\*[\s\S]*?\*\/)*\s*)([\s\S]*)$/.exec(rawSel);
    const s = sel.trim();
    if (!s || /^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/.test(s)) return m;
    const scoped = s.split(",").map((one) => {
      const x = one.trim();
      if (x.startsWith(".") || x.startsWith(":where(")) return x;
      if (x === "*") return ":where(.oc), :where(.oc) *";
      return `:where(.oc) ${x}`;
    }).join(",");
    return `${open}${sp}${lead}${scoped}${sp2}{`;
  });
}
css = scopeElements(css).replace(/url\(#sketchy(-sm)?\)/g, "url(#oc-sketchy$1)");

/* ── 3. Normalisation: page variables and literals -> tokens ─────────── */
const HEX = {
  "#eaeae4": "term-text", "#8a8a85": "term-dim", "#cfcfca": "night-text", "#3d3d3d": "night-shadow", "#2c2c2c": "night-rule",
  "#444": "night-line", "#555": "night-btn", "#eee": "tone-light", "#ddd": "tone-mid", "#ccc": "tone-mark", "#fff": "white",
};
const SWAPS = [
  ...["ink", "paper", "white", "grey", "mid"].map((v) => [new RegExp(`var\\(--${v}\\)`, "g"), `var(--oc-${v})`]),
  // fonts
  [/"Bangers",sans-serif|"Bangers"/g, "var(--oc-font-display)"],
  [/"Anton",sans-serif/g, "var(--oc-font-numeral)"],
  [/"Barlow Condensed",sans-serif|"Barlow Condensed"/g, "var(--oc-font-body)"],
  [/"JetBrains Mono",monospace/g, "var(--oc-font-mono)"],
  // type scale
  [/font:400 82px\/\.86 var\(--oc-font-display\)/g, "font:400 var(--oc-display-lg)/.86 var(--oc-font-display)"],
  [/font:400 84px\/\.86 var\(--oc-font-display\)/g, "font:400 var(--oc-display-xl)/.86 var(--oc-font-display)"],
  [/font:400 48px\/\.9 var\(--oc-font-display\)/g, "font:400 var(--oc-display-md)/.9 var(--oc-font-display)"],
  [/font:400 30px\/\.95 var\(--oc-font-display\)/g, "font:400 var(--oc-display-sm)/.95 var(--oc-font-display)"],
  [/font:400 64px\/\.8 var\(--oc-font-numeral\)/g, "font:400 var(--oc-numeral-xl)/.8 var(--oc-font-numeral)"],
  [/font:400 56px\/1 var\(--oc-font-numeral\)/g, "font:400 var(--oc-numeral-lg)/1 var(--oc-font-numeral)"],
  [/font:400 42px\/1 var\(--oc-font-numeral\)/g, "font:400 var(--oc-numeral-md)/1 var(--oc-font-numeral)"],
  [/font:400 20px\/1 var\(--oc-font-display\);letter-spacing:2px;\n  text-decoration:none/g, "font:400 var(--oc-button)/1 var(--oc-font-display);letter-spacing:2px;\n  text-decoration:none"],
  [/font-size:17px;/g, "font-size:var(--oc-body);"],
  [/font-size:19px/g, "font-size:var(--oc-body-lg)"],
  // shape
  [/border-radius:50%/g, "border-radius:var(--oc-radius-round)"],
  [/((?:border|border-top|border-bottom|border-right|border-left):)3px solid var\(--oc-ink\)/g, "$1var(--oc-border-ink) solid var(--oc-ink)"],
  [/((?:border|border-top|border-bottom|border-right|border-left):)4px solid var\(--oc-ink\)/g, "$1var(--oc-border-frame) solid var(--oc-ink)"],
  [/((?:border|border-top|border-bottom|border-right|border-left):)5px solid var\(--oc-ink\)/g, "$1var(--oc-border-frame) solid var(--oc-ink)"],
  [/border:6px solid var\(--oc-ink\)/g, "border:var(--oc-border-heavy) solid var(--oc-ink)"],
  [/2px dashed var\(--oc-ink\)/g, "var(--oc-border-rule) dashed var(--oc-ink)"],
  // depth
  [/10px 10px 0 var\(--oc-white\),10px 10px 0 4px var\(--oc-ink\)/g, "var(--oc-shadow-panel)"],
  [/(?<![\w.-])4px 4px 0 var\(--oc-mid\)/g, "var(--oc-shadow-btn)"],
  [/(?<![\w.-])6px 6px 0 var\(--oc-mid\)/g, "var(--oc-shadow-btn-hover)"],
  [/(?<![\w.-])1px 1px 0 var\(--oc-mid\)/g, "var(--oc-shadow-btn-press)"],
  [/(?<![\w.-])4px 4px 0 var\(--oc-ink\)/g, "var(--oc-shadow-ink)"],
  [/(?<![\w.-])6px 6px 0 var\(--oc-ink\)/g, "var(--oc-shadow-ink-hover)"],
  [/(?<![\w.-])7px 7px 0 var\(--oc-night-shadow\)/g, "var(--oc-shadow-night)"],
  // screentone
  [/radial-gradient\(circle,var\(--oc-ink\) 1\.2px,transparent 1\.4px\) 0 0\/7px 7px/g,
    "radial-gradient(circle,var(--oc-ink) var(--oc-tone-dot),transparent calc(var(--oc-tone-dot) + .2px)) 0 0/var(--oc-tone-pitch) var(--oc-tone-pitch)"],
  [/var\(--oc-tone-light\) 0,var\(--oc-tone-light\) 2px,var\(--oc-white\) 2px,var\(--oc-white\) 6px/g,
    "var(--oc-tone-light) 0,var(--oc-tone-light) 2px,var(--oc-white) 2px,var(--oc-white) var(--oc-hatch-pitch)"],
  [/var\(--oc-ink\) 0 1\.2deg,transparent 1\.2deg 7deg/g, "var(--oc-ink) 0 var(--oc-speed-ray),transparent var(--oc-speed-ray) var(--oc-speed-gap)"],
  // motion
  [/cubic-bezier\(\.16,1,\.3,1\)/g, "var(--oc-ease-pop)"],
  [/transition:transform \.12s,box-shadow \.12s/g, "transition:transform var(--oc-dur-press),box-shadow var(--oc-dur-press)"],
  [/transform \.35s /g, "transform var(--oc-dur-open) "],
  [/animation:blink 1s /g, "animation:blink var(--oc-dur-cursor) "],
  [/animation:rise \.9s /g, "animation:rise var(--oc-dur-rise) "],
  [/animation:sunrise 2\.8s /g, "animation:sunrise var(--oc-dur-sunrise) "],
  [/animation:floor 1\.5s /g, "animation:floor var(--oc-dur-floor) "],
  [/animation:chipFloat 4s /g, "animation:chipFloat var(--oc-dur-chip) "],
  // space
  [/max-width:1120px/g, "max-width:var(--oc-page-max)"],
  [/\.wrap\{padding:14px\}/g, ".wrap{padding:var(--oc-gutter)}"],
  [/gap:12px([;}])/g, "gap:var(--oc-gap)$1"],
  [/margin-top:26px/g, "margin-top:var(--oc-section-gap)"],
  [/\.info\{padding:18px 18px 20px\}/g, ".info{padding:var(--oc-panel-pad) var(--oc-panel-pad) 20px}"],
];
// Every class the trimmed CSS uses gets the oc- prefix
const CLASSES = [...new Set([...css.replace(/url\([^)]*\)/g, "").matchAll(/\.([a-z][\w-]*)/gi)].map((m) => m[1]))]
  .filter((c) => c !== "oc");
const KEYFRAMES = ["blink", "rise", "sunrise", "floor", "blink2", "faqIn", "chipFloat"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({ prefix: P, hex: HEX, swaps: SWAPS, classes: CLASSES, keyframes: KEYFRAMES, attrs: ["sun", "skyline", "copy", "signup"] });
const componentCss = prefixCss(tokenize(css)).trim() + `

/* A component shown on its own sits in a plain block: the page's hero padding
   reserved room for the sun, which the cover component doesn't carry. */
.oc-cover-panel.oc-hero{padding:44px 30px 52px}
.oc-cover-panel.oc-hero:before{width:1340px;height:1340px;left:-520px;top:-580px}
/* Single-column tracks must be able to shrink below their nowrap code lines */
@media(max-width:900px){.oc-steps,.oc-pricing,.oc-faq-grid{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){
  .oc-cover-panel.oc-hero{padding:34px 18px 40px}
  .oc-nav{padding:10px 12px}
  .oc-nav .oc-btn{padding:10px 14px;font-size:16px}
}`;

/* ── 4. Components (each one real markup from the page) ──────────────── */
const local = (html) => html.replace(/href="#[\w-]*"/g, 'href="#"');
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(local(markup)), ...opts });

add("nav", "Navigation", "A white strip ruled in ink: the Bangers wordmark beside a tilted ink block, uppercase condensed links that invert on hover, and an ink button.",
  el('<header class="nav" data-section="nav">').replace(' data-section="nav"', ' style="border:4px solid var(--ink)"'), { defs: true });

add("buttons", "Buttons", "Bangers on a hard 4px shadow: ink with a grey shadow, white with an ink shadow, and inverted on an ink panel. They lift 2px on hover and press flat.",
  `<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
${/<a class="btn" href="#signup">Start free<\/a>/.exec(page)[0]}
${/<a class="btn btn-ghost" href="#how">See how it works<\/a>/.exec(page)[0]}
</div>
<div class="plan-hot" style="transform: none; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; margin-top: 24px; padding: 24px">
${/<a class="btn" href="#signup">Go Pro<\/a>/.exec(page)[0]}
</div>`, { defs: true });

add("cover", "Cover", "The issue cover on dense screentone: a paper moon, an inverted issue tag, a white-filled Bangers headline stroked in ink and tilted, a Japanese strap line, a lead with one inked phrase, two buttons and a copyable install command.",
  `<section class="hero oc-cover-panel" style="min-height: 0; display: block">
${el('<div class="hero-copy">').replace(' id="installCmd"', "").replace(' id="copyBtn"', " data-copy")}
</section>`, { js: true, defs: true });

const TERM = [
  "$ oc deploy --prod",
  '<span class="dim">→ detecting project…</span>',
  "  framework   Next.js 16",
  "  runtime     node 24",
  '<span class="dim">→ building (cache hit 97%)…</span>',
  "  compiled    0.8s",
  '<span class="dim">→ rolling out to 38 regions…</span>',
  "  ██████████████████ 100%",
  "",
  '<span class="ok">✓ LIVE</span> https://my-app.overclock.example  <span class="dim">(12.1s)</span>',
  '$ <span class="cursor"></span>',
].join("\n");
add("terminal", "Terminal panel", "A terminal as a comic panel: a white title strip, ink body, a white-then-ink double shadow, a slight tilt, and a round speech bubble shouting over it.",
  `<div style="padding: 54px 18px 18px 6px">
${el('<div class="term-wrap">').replace('<pre id="term" aria-hidden="true"></pre>', `<pre aria-hidden="true">${TERM}</pre>`)}
</div>`, { defs: true });

add("sun", "Retro sun & skyline", "The sliced retro sun: a disc whose gaps slide down it, rings that pulse out, a seeded city skyline with blinking windows, and a perspective grid floor that scrolls toward you.",
  `<div style="position: relative; height: 460px; overflow: hidden; background: var(--paper); border: 4px solid var(--ink)">
${el('<div class="hero-sun" aria-hidden="true">').replace('class="hero-sun"', 'class="hero-sun" style="left: 50%; bottom: 150px"')}
${el('<div class="hero-horizon" aria-hidden="true">')}
</div>`, { js: true });

add("stats", "Stats strip", "Anton numerals over tracked uppercase labels, split by ink rules.",
  el('<div class="stats" data-section="stats">').replace(' data-section="stats"', ' style="border:4px solid var(--ink)"'), { defs: true });

add("break", "Panel break", "A strip of diagonal speed hatching between sections, with a tilted Bangers caption box across it.",
  el('<div class="break"><span>3 villains'), { defs: true });

add("section-title", "Section title", "A Bangers heading set tight and uppercase, with a short right-aligned condensed paragraph.",
  el('<div class="section-title">'));

add("cards", "Feature panels", "Panels with scene art on paper or night ink: a tilted number block, a stamped tag, katakana sound effects, a Bangers title, an inverted role label and dashed facts.",
  `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 12px">
${el('<article class="card card-two">').replace('<article class="card card-two">', '<article class="card card-two" style="grid-area: auto">')}
${el('<article class="card card-three">').replace('<article class="card card-three">', '<article class="card card-three" style="grid-area: auto">')}
</div>`, { js: true, defs: true });

add("steps", "Story steps", "Numbered step panels under a tilted ink caption, each with a pale Anton numeral and an inline command, then a note that marks words up with ink, wavy underline, strikes and screentone.",
  el('<section class="story" id="how"').replace(' id="how" data-section="how-it-works"', ""), { defs: true });

add("pricing", "Pricing", "Three panels with ▶ bullets on dashed rules; the featured plan inverts to ink, tilts a degree and wears a tilted tag.",
  `<div style="padding-top: 16px">
${el('<div class="pricing">')}
</div>`, { defs: true });

add("faq", "Reader mail", "Native details with hand-drawn outlines: a tilted Q-number, a Bangers question, and a ring icon that spins and fills as it opens.",
  el('<div class="faq-grid">'), { defs: true });

add("cta", "Final chapter", "The closing panel on ink: an outlined kicker, a huge paper title with a hard grey shadow, a tilted strap, an email field in a terminal prompt, perks, and an inverted sun over a racing floor.",
  el('<section class="end" id="signup"')
    .replace(' id="signup" data-section="cta"', ' style="margin-top: 0"')
    .replace(' id="signupForm"', " data-signup")
    .replace(' id="email"', "")
    .replace(' id="signupMsg"', ""), { js: true, defs: true });

add("footer", "Footer", "One white strip: small print, tracked uppercase links and a sign-off, ruled in ink.",
  el('<footer class="foot" data-section="footer">').replace(' data-section="footer"', ' style="border:4px solid var(--ink)"'));

/* ── 5. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Overclock components. Fills every [data-oc-sun] with a sliced retro sun and
     every [data-oc-skyline] with a seeded skyline (configured by data-cx, data-r,
     data-bars… and data-w, data-seed…), again whenever new ones are added; copies
     the install command; checks the signup email. */
  var INK = '#111', PAPER = '#f8f8f5';
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;

  function buildSun(g) {
    var d = g.dataset, cx = +d.cx, cy = +d.cy, r = +d.r, n = +(d.bars || 7), dur = +(d.dur || 6);
    var inv = d.invert === '1', disk = inv ? PAPER : INK, gap = inv ? INK : PAPER, id = 'oc-sun-' + (uid++);
    var st = d.start !== undefined ? +d.start : .3, en = d.end !== undefined ? +d.end : 1;
    var top = cy - r + 2 * r * st, bot = cy - r + 2 * r * en, h0 = 2, h1 = r * (en - st) * 0.32, x = cx - r, w = 2 * r;
    var out = '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath>' +
      '<g clip-path="url(#' + id + ')"><rect x="' + x + '" y="' + (cy - r) + '" width="' + w + '" height="' + (2 * r) + '" fill="' + disk + '"/>';
    for (var i = 0; i < n; i++) {
      var t = i / n;
      if (REDUCE) {
        out += '<rect x="' + x + '" width="' + w + '" y="' + (top + (bot - top) * t).toFixed(1) + '" height="' + (h0 + (h1 - h0) * t).toFixed(1) + '" fill="' + gap + '"/>';
      } else {
        var b = (-t * dur).toFixed(2);
        out += '<rect x="' + x + '" width="' + w + '" y="' + top + '" height="' + h0 + '" fill="' + gap + '">' +
          '<animate attributeName="y" values="' + top + ';' + bot + '" dur="' + dur + 's" begin="' + b + 's" repeatCount="indefinite"/>' +
          '<animate attributeName="height" values="' + h0 + ';' + h1 + '" dur="' + dur + 's" begin="' + b + 's" repeatCount="indefinite"/></rect>';
      }
    }
    out += '</g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + (inv ? PAPER : INK) + '" stroke-width="' + (d.stroke || 3) + '"/>';
    g.innerHTML = out;
  }

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function buildSkyline(g) {
    var d = g.dataset, W = +d.w, base = +d.base, min = +d.min, max = +d.max, r = rng(+d.seed || 1);
    var night = d.mode === 'night', dip = d.dip !== undefined ? +d.dip : null;
    var edge = night ? ' stroke="' + PAPER + '" stroke-width="2"' : '';
    var blink = function () { return ' class="oc-blink" style="animation-delay:' + (-r() * 2.6).toFixed(2) + 's"'; };
    var x = -6, out = '';
    while (x < W) {
      var w = Math.round(26 + r() * 44), h = min + r() * (max - min);
      if (dip !== null) { var k = Math.min(1, Math.abs((x + w / 2) / W - dip) / 0.22); h = min * .6 + (h - min * .6) * (0.25 + 0.75 * k); }
      h = Math.round(h);
      var y = base - h;
      out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (h + 6) + '" fill="' + INK + '"' + edge + '/>';
      if (r() < .5) {
        for (var wy = y + 8; wy < base - 8; wy += 11) for (var wx = x + 6; wx < x + w - 8; wx += 9) {
          if (r() < .55) { var bl = r() < .16; out += '<rect x="' + wx + '" y="' + wy + '" width="4" height="5" fill="' + PAPER + '"' + (bl ? blink() : '') + '/>'; }
        }
      } else {
        for (var wy2 = y + 8; wy2 < base - 6; wy2 += 8) {
          out += '<rect x="' + (x + 5) + '" y="' + wy2 + '" width="' + (w - 10) + '" height="2.5" fill="' + PAPER + '"/>';
          if (r() < .35) out += '<rect x="' + (x + w - 10) + '" y="' + wy2 + '" width="3" height="2.5" fill="' + INK + '"' + blink() + '/>';
        }
      }
      if (r() < .28) {
        var ax = x + Math.round(w / 2);
        out += '<line x1="' + ax + '" y1="' + y + '" x2="' + ax + '" y2="' + (y - 16) + '" stroke="' + (night ? PAPER : INK) + '" stroke-width="2"/>' +
          '<circle cx="' + ax + '" cy="' + (y - 18) + '" r="2.6" fill="' + (night ? PAPER : INK) + '"' + blink() + '/>';
      }
      x += w + Math.round(r() * 6);
    }
    g.innerHTML = out;
  }

  function build() {
    var s = document.querySelectorAll('[data-oc-sun]:not([data-oc-built])');
    for (var i = 0; i < s.length; i++) { buildSun(s[i]); s[i].setAttribute('data-oc-built', ''); }
    var k = document.querySelectorAll('[data-oc-skyline]:not([data-oc-built])');
    for (var j = 0; j < k.length; j++) { buildSkyline(k[j]); k[j].setAttribute('data-oc-built', ''); }
  }
  build();
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; build(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* Copy the install command beside the button */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-oc-copy]');
    if (!b) return;
    var code = b.closest('.oc-install').querySelector('code');
    var done = function () { b.textContent = 'Copied!'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(code.textContent).then(done, done); else done();
  });

  /* Signup: check the address, answer in the line under the field */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest('[data-oc-signup]');
    if (!f) return;
    e.preventDefault();
    var input = f.querySelector('input'), msg = f.querySelector('.oc-signup-msg');
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.value.trim())) { msg.textContent = '✗ That email looks off — try again'; return; }
    msg.textContent = "✓ You're on the list. Next chapter soon!";
    input.value = '';
  });
})();`;

/* ── 6. Shared SVG defs: the two hand-drawn wobble filters ───────────── */
const defs = el('<svg style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true">')
  .replace("<svg ", '<svg id="oc-defs" ')
  .replace('<filter id="sketchy" ', '<filter id="oc-sketchy" ')
  .replace('<filter id="sketchy-sm" ', '<filter id="oc-sketchy-sm" ');

/* ── 7. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:radial-gradient(circle,var(--oc-dot) 1px,transparent 1.3px) 0 0/var(--oc-tone-page-pitch) var(--oc-tone-page-pitch),var(--oc-desk)}
.sp-top{position:relative;overflow:hidden;border-bottom:var(--oc-border-frame) solid var(--oc-ink);background:radial-gradient(circle,var(--oc-ink) var(--oc-tone-dot),transparent calc(var(--oc-tone-dot) + .2px)) 0 0/var(--oc-tone-pitch) var(--oc-tone-pitch),var(--oc-paper)}
.sp-top:before{content:"";position:absolute;width:820px;height:820px;left:-300px;top:-330px;background:var(--oc-paper);border:var(--oc-border-heavy) solid var(--oc-ink);border-radius:50%;filter:url(#oc-sketchy)}
.sp-top-in{position:relative;z-index:1;max-width:var(--oc-page-max);margin:0 auto;padding:36px 24px 56px}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}
.sp-title{margin:34px 0 0;font:400 clamp(66px,11vw,140px)/.84 var(--oc-font-display);letter-spacing:3px;text-transform:uppercase;color:var(--oc-white);-webkit-text-stroke:8px var(--oc-ink);paint-order:stroke fill;transform:rotate(-2deg);transform-origin:left}
.sp-jp{display:inline-block;margin:16px 0 0 46px;background:var(--oc-white);border:var(--oc-border-ink) solid var(--oc-ink);padding:5px 12px 3px;font:400 22px var(--oc-font-numeral);letter-spacing:2px;filter:url(#oc-sketchy-sm)}
.sp-lede{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:22px 44px;align-items:end;margin-top:30px}
.sp-lede p{margin:0;max-width:48ch;background:var(--oc-paper);padding:14px 18px;font-size:var(--oc-body-lg);border:var(--oc-border-ink) solid var(--oc-ink)}
.sp-lede strong{background:var(--oc-ink);color:var(--oc-white);padding:0 5px}
.sp-swatches{display:flex;flex-wrap:wrap;gap:10px}
.sp-swatches i{display:block;width:42px;height:42px;border:var(--oc-border-ink) solid var(--oc-ink);box-shadow:var(--oc-shadow-ink)}
.sp-main{max-width:var(--oc-page-max);margin:30px auto 60px;padding:6px 26px 60px;background:var(--oc-paper);border:var(--oc-border-frame) solid var(--oc-ink);box-shadow:var(--oc-shadow-frame)}
.sp-sec{padding:46px 0;border-bottom:var(--oc-border-rule) dashed var(--oc-ink);scroll-margin-top:12px}
.sp-sec:last-child{border-bottom:0}
.sp-head{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:8px 40px;margin-bottom:26px}
.sp-head h2{margin:12px 0 0;font:400 34px/.95 var(--oc-font-display);letter-spacing:1px;text-transform:uppercase}
.sp-note{margin:0;max-width:640px;font-size:16px;line-height:1.55}
.sp-demo{position:relative}
@media (max-width:720px){
  .sp-head{grid-template-columns:minmax(0,1fr)}
  .sp-main{margin:0;border-width:0;box-shadow:none;padding:6px 16px 60px}
  .sp-top:before{width:560px;height:560px;left:-280px;top:-250px}
  .sp-title{-webkit-text-stroke:6px var(--oc-ink)}
  .sp-jp{margin-left:14px;font-size:17px}
}
`;
const HERO = `
<header class="sp-top">
<div class="sp-top-in">
<div class="sp-meta"><p class="oc-issue">InstaLanding design system</p><p class="oc-issue">overclock@${VERSION} · ${C.length} components</p></div>
<h1 class="sp-title">Overclock<br>system!</h1>
<span class="sp-jp">限界を超えろ — beyond the limit</span>
<div class="sp-lede">
<p>A black-and-white manga issue: ink panels with hand-drawn outlines, halftone screentone, Bangers lettering over Anton numerals, speech bubbles and a sliced retro sun. <strong>Extracted from the Manga Panel Dev Tool page.</strong></p>
<div class="sp-swatches" aria-label="Core colours">${["ink", "paper", "white", "grey", "mid", "term-text"].map((t) => `<i title="--oc-${t}" style="background:var(--oc-${t})"></i>`).join("")}</div>
</div>
</div>
</header>`;

const specimen = renderSpecimen({
  name: "Overclock",
  slug: "overclock",
  version: VERSION,
  prefix: P,
  rootClass: "oc",
  labelClass: "oc-issue",
  script: "scripts/systems/overclock.mjs",
  source: SOURCE,
  metaDescription: "The Overclock design system: tokens and working components extracted from the Manga Panel Dev Tool landing page.",
  defsNote: "the two hand-drawn wobble filters (#oc-sketchy, #oc-sketchy-sm) every ink outline uses",
  jsNote: "builds the sliced suns and skylines, copies the install command, checks the signup email",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: defs,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "overclock", prefix: P, rootClass: "oc", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "card", "plan", "term", "nav", "hero", "stats", "break", "step", "faq-item", "foot", "end"] });
