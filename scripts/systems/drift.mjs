// Extracts the Drift design system from its landing page.
//
//   node scripts/systems/drift.mjs
//
// Reads public/demos/drift-wind-routing.html (never edits it) and writes
// public/systems/drift/ (specimen.html, tokens.css, drift.css) through the
// shared pipeline in lib.mjs. The page keeps one <style> in cascade layers
// (reset, base, layout, ui) behind a few unlayered rules that beat a host
// wrapper; the system flattens the layers in their own order (which is also
// source order, so the cascade holds) and keeps all of it but the document
// shell, the scroll scene's hidden states and rules for parts the page no
// longer renders (preset cards, the readout strip, static pressure figures).
// The fixed nav and full-screen menu become position:absolute: a page pins
// them with fixed.
// The page's hero is a WebGL field (14,000 particles through six pressure
// vortices, ping-ponged trails) under a 2D overlay of isobars and a solved
// route, all driven by GSAP and ScrollTrigger. None of that comes along. The
// component script re-creates the field in Canvas 2D from the page's own
// numbers: the same vortex sum, the same six presets (MODES), the same speed
// ramp, trails faded by a translucent fill the way the page's three small
// dashboards already do it in 2D (their code is ported nearly as written).
// Isobars are contoured by marching squares from the same pressure function;
// the solved route is searched against the live wind as on the page. Colours
// are read from the tokens at run time, so the playground recolours the wind.
// What the page's script writes at boot is written here at build time from
// its own data: the live board's rows and sparklines (its fleet), the 0.25°
// heat grid (its field at t = 0) and the opening lines of the agent log. The
// bridge dial is drawn by the component script, as on the page.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/drift-wind-routing.html";
const { page, BODY, css: pageCss, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
if (!FONTS.includes("IBM+Plex+Mono")) throw new Error("font link not found");
if (!pageCss.startsWith("@layer reset, base, layout, ui;")) throw new Error("page <style> not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root, its rules and its scripts. The
   page's names (--bg, --bg-2, --paper, --ink, --muted, --low, --high, --rule,
   --key-bg, --font-*, --label) keep their names under dr-. The wind ramp is
   the page's Mistral palette (the hero, the heat grid, the board and the dial
   all colour by it); the three dashboard fields keep their own grounds and
   ramps (as low, mid and high stops; the script fills in the eight bins).
   Group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Drift · drift@${VERSION}
   Extracted from https://instalanding.ai/demos/drift-wind-routing.html
   Fonts: Archivo (wdth 62-125, 300-800), Instrument Sans (wdth 75-100, 400-600), IBM Plex Mono 400/500 (Google Fonts) */
:root {
  /* Color · core */
  --dr-bg: #0D141A;
  --dr-bg-2: #0A1017;
  --dr-paper: #F0ECE3;
  --dr-ink: #121A21;
  --dr-muted: #A3B0B8;
  --dr-low: #E0896A;
  --dr-high: #6A9FE0;

  /* Color · signal */
  --dr-ok: #8CBF75;
  --dr-ok-hi: #C9E6B9;
  --dr-ok-soft: #CFE6C4;
  --dr-violet: #B48CF0;
  --dr-amber: #E0B46A;
  --dr-code-num: #D3C97A;

  /* Color · wind ramp (0 to 42 kt, eight bins) */
  --dr-wind-1: #45679C;
  --dr-wind-2: #4383AD;
  --dr-wind-3: #3FA2A4;
  --dr-wind-4: #65B483;
  --dr-wind-5: #B6C659;
  --dr-wind-6: #D6A442;
  --dr-wind-7: #D1753D;
  --dr-wind-8: #B84646;

  /* Color · dashboard fields */
  --dr-glacier-bg: #06141A;
  --dr-glacier: #6FD3DC;
  --dr-glacier-lo: #0E3A4A;
  --dr-glacier-mid: #57C4C4;
  --dr-glacier-hi: #F2FBF8;
  --dr-aurora-bg: #110C1B;
  --dr-aurora: #F29AC0;
  --dr-aurora-lo: #2A1B4D;
  --dr-aurora-mid: #B84C93;
  --dr-aurora-hi: #FFC38A;
  --dr-moss-bg: #08130E;
  --dr-moss: #C4DC6A;
  --dr-moss-lo: #1B4A2B;
  --dr-moss-mid: #9BBD52;
  --dr-moss-hi: #F3E9A0;
  --dr-ship-1: #FFD08A;
  --dr-ship-2: #8FE3D6;

  /* Color · surfaces */
  --dr-plate: #0B1218;
  --dr-board-top: #0F171D;
  --dr-board-bottom: #0A1015;
  --dr-log-bg: #070B0F;
  --dr-sheet-top: #111A21;
  --dr-dial-face: #091015;
  --dr-dial-band: #22303B;
  --dr-step: #0D151B;

  /* Color · lines */
  --dr-rule: color-mix(in oklab, var(--dr-paper) 14%, transparent);
  --dr-rule-strong: color-mix(in oklab, var(--dr-paper) 32%, transparent);
  --dr-key-bg: var(--dr-bg);

  /* Type · families */
  --dr-font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --dr-font-body: "Instrument Sans", "Helvetica Neue", Arial, sans-serif;
  --dr-font-mono: "IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;

  /* Type · scale */
  --dr-display: clamp(1.75rem, 7vw, 7rem);
  --dr-display-sm: clamp(1.6rem, 7.2vw, 3rem);
  --dr-h1: clamp(2.5rem, 6.4vmin, 5.2rem);
  --dr-h2: clamp(1.9rem, 4.6vmin, 3.2rem);
  --dr-h3: 1.45rem;
  --dr-menu-size: clamp(2rem, 5.4vw, 4.4rem);
  --dr-figure: clamp(2.2rem, 4.4vmin, 3.2rem);
  --dr-price: 2.8rem;
  --dr-lede: 1.0625rem;
  --dr-text: 15px;
  --dr-label: 0.6875rem;
  --dr-track-label: 0.14em;
  --dr-stretch: 112%;
  --dr-stretch-wide: 125%;

  /* Shape · radii */
  --dr-radius-pill: 999px;
  --dr-radius-sheet: 1.1rem;
  --dr-radius-board: 1rem;
  --dr-radius-widget: 0.6rem;
  --dr-radius-bar: 2px;
  --dr-radius-btn: 0;

  /* Shape · borders */
  --dr-hairline: 1px;
  --dr-key: 2px;

  /* Depth · shadows & glass */
  --dr-shadow-nav: 0 18px 40px -18px rgb(0 0 0 / 0.75);
  --dr-shadow-card: 0 30px 60px -40px rgb(0 0 0 / 0.8);
  --dr-shadow-board: 0 40px 80px -50px rgb(0 0 0 / 0.9);
  --dr-shadow-sheet: 0 40px 80px -40px rgb(0 0 0 / 0.9);
  --dr-shadow-widget: 0 10px 24px -14px rgb(0 0 0 / 0.8);
  --dr-shadow-headline: 0 2px 28px rgb(0 0 0 / 0.55), 0 0 3px rgb(0 0 0 / 0.35);
  --dr-glass-nav: blur(18px) saturate(1.4);
  --dr-glass-widget: blur(10px);

  /* Motion · easing */
  --dr-ease: ease;
  --dr-ease-inout: ease-in-out;
  --dr-ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dr-ease-wipe: cubic-bezier(0.7, 0, 0.2, 1);
  --dr-ease-dial: cubic-bezier(0.65, 0, 0.25, 1);

  /* Motion · durations */
  --dr-dur-hover: 0.25s;
  --dr-dur-panel: 0.3s;
  --dr-dur-menu: 0.7s;
  --dr-dur-settle: 0.9s;
  --dr-dur-dial: 1.1s;
  --dr-dur-draw: 1.2s;
  --dr-dur-pulse: 2s;
  --dr-dur-sweep: 10s;

  /* Field · flow lines (read by the component script) */
  --dr-field-alpha: 0.42;
  --dr-field-fade: 0.07;
  --dr-field-density: 1;

  /* Space · layout */
  --dr-wrap: 1320px;
  --dr-nav-w: 68rem;
  --dr-gutter: clamp(1rem, 3vmin, 2rem);
  --dr-band: clamp(4.5rem, 10vmin, 8rem);
  --dr-hero-h: min(100svh, 860px);
  --dr-hero-min: 40rem;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under dr- (the statement's local --ss is the display token)
const VARS = { ss: "display" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("dr-") ? m : `--dr-${VARS[n] ?? n}`));
const HEX = {
  "#0d141a": "bg", "#0a1017": "bg-2", "#f0ece3": "paper", "#121a21": "ink", "#a3b0b8": "muted", "#e0896a": "low", "#6a9fe0": "high",
  "#8cbf75": "ok", "#c9e6b9": "ok-hi", "#cfe6c4": "ok-soft", "#b48cf0": "violet", "#e0b46a": "amber", "#d3c97a": "code-num",
  "#6fd3dc": "glacier", "#f29ac0": "aurora", "#c4dc6a": "moss", "#ffd08a": "ship-1", "#8fe3d6": "ship-2",
  "#0b1218": "plate", "#0f171d": "board-top", "#0a1015": "board-bottom", "#070b0f": "log-bg", "#111a21": "sheet-top", "#0d151b": "step",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--dr-${tok})`];
const mixOf = (tok) => (_, a) => `color-mix(in oklab, var(--dr-${tok}) ${Math.round(parseFloat(a) * 100)}%, transparent)`;
// These run after renameVars and on whitespace-collapsed CSS (one space everywhere)
const SWAPS = [
  // Translucent literals of token colours become mixes of the token
  [/rgb\(240 236 227 \/ ([\d.]+)\)/g, mixOf("paper")],
  [/rgb\(140 191 117 \/ ([\d.]+)\)/g, mixOf("ok")],
  [/rgb\(6 20 26\)/g, "var(--dr-glacier-bg)"],
  [/rgb\(17 12 27\)/g, "var(--dr-aurora-bg)"],
  [/rgb\(8 19 14\)/g, "var(--dr-moss-bg)"],
  // Depth
  val("0 18px 40px -18px rgb(0 0 0 / 0.75)", "shadow-nav"),
  val("0 30px 60px -40px rgb(0 0 0 / 0.8)", "shadow-card"),
  val("0 40px 80px -50px rgb(0 0 0 / 0.9)", "shadow-board"),
  val("0 40px 80px -40px rgb(0 0 0 / 0.9)", "shadow-sheet"),
  val("0 10px 24px -14px rgb(0 0 0 / 0.8)", "shadow-widget"),
  val("0 2px 28px rgb(0 0 0 / 0.55), 0 0 3px rgb(0 0 0 / 0.35)", "shadow-headline"),
  val("blur(18px) saturate(1.4)", "glass-nav"),
  [/backdrop-filter: blur\(10px\)/g, "backdrop-filter: var(--dr-glass-widget)"],
  // Radii
  [/border-radius: 999px/g, "border-radius: var(--dr-radius-pill)"],
  [/border-radius: 1\.1rem/g, "border-radius: var(--dr-radius-sheet)"],
  [/border-radius: 1rem/g, "border-radius: var(--dr-radius-board)"],
  [/border-radius: 0\.6rem/g, "border-radius: var(--dr-radius-widget)"],
  [/border-radius: 2px 2px 0 0/g, "border-radius: var(--dr-radius-bar) var(--dr-radius-bar) 0 0"],
  [/border-radius: 0;/g, "border-radius: var(--dr-radius-btn);"],
  // Borders: hairlines and the 2px key frame
  [/(border(?:-[a-z-]+)?: )1px (solid|dashed)/g, "$1var(--dr-hairline) $2"],
  [/(border(?:-[a-z-]+)?: )2px solid/g, "$1var(--dr-key) solid"],
  // Type
  [/font-size: 1\.0625rem/g, "font-size: var(--dr-lede)"],
  [/font-size: clamp\(1\.9rem, 4\.6vmin, 3\.2rem\)/g, "font-size: var(--dr-h2)"],
  [/font-size: clamp\(2\.5rem, 6\.4vmin, 5\.2rem\)/g, "font-size: var(--dr-h1)"],
  [/(\.panel-body h3 \{ )font-size: 1\.45rem/g, "$1font-size: var(--dr-h3)"],
  [/font-size: clamp\(2\.2rem, 4\.4vmin, 3\.2rem\)/g, "font-size: var(--dr-figure)"],
  [/font-size: 2\.8rem/g, "font-size: var(--dr-price)"],
  [/font-size: clamp\(2rem, 5\.4vw, 4\.4rem\)/g, "font-size: var(--dr-menu-size)"],
  [/font-size: 15px/g, "font-size: var(--dr-text)"],
  [/font-stretch: 112%/g, "font-stretch: var(--dr-stretch)"],
  [/font-stretch: 125%/g, "font-stretch: var(--dr-stretch-wide)"],
  [/letter-spacing: 0\.14em/g, "letter-spacing: var(--dr-track-label)"],
  // Motion
  [/cubic-bezier\(0\.2, 0\.7, 0\.2, 1\)/g, "var(--dr-ease-out)"],
  [/cubic-bezier\(0\.7, 0, 0\.2, 1\)/g, "var(--dr-ease-wipe)"],
  [/cubic-bezier\(0\.65, 0, 0\.25, 1\)/g, "var(--dr-ease-dial)"],
  [/0\.25s ease(?![-\w])/g, "var(--dr-dur-hover) var(--dr-ease)"],
  [/0\.3s ease-in-out/g, "var(--dr-dur-panel) var(--dr-ease-inout)"],
  [/0\.7s var\(--dr-ease-wipe\)/g, "var(--dr-dur-menu) var(--dr-ease-wipe)"],
  [/0\.9s var\(--dr-ease-out\) both/g, "var(--dr-dur-settle) var(--dr-ease-out) both"],
  [/1\.1s var\(--dr-ease-dial\)/g, "var(--dr-dur-dial) var(--dr-ease-dial)"],
  [/1\.2s var\(--dr-ease-out\)/g, "var(--dr-dur-draw) var(--dr-ease-out)"],
  [/2s ease-out infinite/g, "var(--dr-dur-pulse) ease-out infinite"],
  [/10s linear infinite/g, "var(--dr-dur-sweep) linear infinite"],
  // Layout
  [/padding-block: clamp\(4\.5rem, 10vmin, 8rem\)/g, "padding-block: var(--dr-band)"],
];

/* ── 3. Component CSS: the page's <style>, flattened out of its layers ── */
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
// Page-only: the document shell, the light chart-paper theme no section uses, the scroll scene's
// states, and rules for parts the page no longer renders (preset cards, readout strip, static
// pressure figures, the paper advisory table, the hero-copy column, the odometer reels).
const DROP = /^(html|:root|\[id\])|\.light\b|\.no-scene|\.pressure-|\.preset|\.readout|\.plate-flow|\.plate-tag|\.plate--b|\.plate \.pressure|\.scroll-cue|\.hero-copy|\.sheet-meta|\.sheet t[hd]|\.sheet table|\.odo|data-field|\.display span/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.dr, .dr *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.dr, .dr *)${sel.slice(1)}`;
  if (sel === "body") return ".dr";
  return sel;
}
// Layers are unwrapped in place: their declared order (reset, base, layout, ui) is their source order
function flatten(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@layer")) return flatten(body);
    if (prelude.startsWith("@media")) {
      const inner = flatten(body);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",")}{${body.trim()}}` : "";
  }).filter(Boolean).join("\n");
}
let rules = pageCss.replace(/\/\*[\s\S]*?\*\//g, "");
const cut = (from, to = "") => {
  if (!rules.includes(from)) throw new Error("rule not found: " + from.slice(0, 70));
  rules = rules.replace(from, to);
};
rules = rules.replace(/\s+/g, " ");
// The unlayered block that beats the host wrapper is a page shell; the layered base below repeats it
rules = rules.slice(rules.indexOf("@layer reset {")).replace("@layer reset, base, layout, ui;", "");
// The scroll scene hides the second line and the sub until it reveals them; the system shows them
cut(".statement .bottom-line, .statement-sub { visibility: hidden; }");
// The intro is one screen on the page; in a host it takes the hero height token
cut("block-size: 100svh; min-block-size: 30rem;", "block-size: var(--dr-hero-h); min-block-size: var(--dr-hero-min);");
cut("--ss: clamp(1.75rem, 7vw, 7rem);");
cut(".intro { --ss: clamp(1.6rem, 7.2vw, 3rem); }", ".statement { font-size: var(--dr-display-sm); }");
// The stage was sized to the viewport and scaled by the scroll scene; here it fills the map
cut("inline-size: var(--stage-w, 100vw); block-size: var(--stage-h, 100vh);", "inline-size: 100%; block-size: 100%;");
cut("transform: translate(-50%, -50%) scale(var(--stage-s, 1));", "transform: translate(-50%, -50%);");
// Widths measured against the viewport are measured against the container
cut("inline-size: min(1320px, calc(100vw - var(--gutter) * 2));", "inline-size: min(var(--dr-wrap), 100% - var(--gutter) * 2);");
cut("inline-size: min(68rem, 100%);", "inline-size: min(var(--dr-nav-w), 100%);");
cut("calc((100vw - 68rem) / 2 + 1.35rem)", "calc((100% - var(--dr-nav-w)) / 2 + 1.35rem)");
// The nav and its full-screen menu sit inside whatever holds them; a page pins them with position: fixed
rules = rules.replace(/position: fixed/g, "position: absolute");
// Two local re-sets of tokens would stop the playground reaching the code plate and the dial
cut("--paper: #f0ece3; --high: #6a9fe0; border: 1px solid #0d141a;", "border: 1px solid #0d141a;");
cut("--ink: #22303b;");
cut(".d-band { fill: none; stroke: var(--ink); }", ".d-band { fill: none; stroke: var(--dial-band); }");
// Ids the page's script hooked become classes
rules = rules
  .replace(/#wind_canvas/g, ".wind-canvas").replace(/#chart_overlay/g, ".chart-overlay").replace(/#legend_bar/g, ".legend-bar")
  .replace(/#r([123]) /g, ".d-r$1 ")
  // Data attributes the script and the CSS share move under dr- too
  .replace(/\[data-(variant|kind)(?=[=\]])/g, "[data-dr-$1");
if (/#[a-z_]+[\s{.,:]/i.test(rules.replace(/#[0-9a-f]{3,8}\b/gi, ""))) throw new Error("an id selector is left: " + rules.match(/#[a-z_]+[\s{.,:]/i)[0]);
// The legend bar was painted by the script from the palette; the system paints it from the wind tokens
const EXTRA = `
.dr { color-scheme: dark; }
.legend-bar { background: linear-gradient(90deg, ${[1, 2, 3, 4, 5, 6, 7, 8].map((k) => `var(--wind-${k})`).join(", ")}); }
.img-small .inner { position: relative; overflow: hidden; border: 1px solid var(--rule-strong); background: var(--bg); }
.img-small .inner canvas { position: absolute; inset: 0; inline-size: 100%; block-size: 100%; display: block; }
.navframe { position: relative; isolation: isolate; block-size: 40rem; overflow: clip; background: repeating-linear-gradient(to right, color-mix(in oklab, var(--paper) 5%, transparent) 0 1px, transparent 1px calc(100% / 12)), repeating-linear-gradient(to bottom, color-mix(in oklab, var(--paper) 5%, transparent) 0 1px, transparent 1px 4rem), var(--bg); }
.legend-key { display: flex; flex-wrap: wrap; gap: 0.6rem 1.4rem; font-family: var(--font-mono); font-size: var(--label); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.legend-key span { display: inline-flex; align-items: center; gap: 0.5rem; }
.legend-key .swatch { margin-inline-end: 0; inline-size: 1.4rem; }
@media (prefers-reduced-motion: reduce) { .hero-top, .hero-foot, .markers, .stat::before { animation: none; transition: none; } }`;
const base = renameVars(flatten(rules + EXTRA));

/* ── 4. What the page's script writes, written at build time ─────────── */
const grab = (from, to) => {
  const a = page.indexOf(from), b = page.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error("page script marker not found: " + from);
  return page.slice(a, b + to.length);
};
// The hero's six presets and the three dashboards' fields, as the page declares them
const MODES = new Function(`${grab("const MODES = {", "\n  };")}\nreturn MODES;`)();
const VARIANTS = new Function(`${grab("const VARIANTS = {", "\n  };")}\nreturn VARIANTS;`)();
const FLEET = new Function(`${grab("const fleet = [", "\n  ];")}\nreturn fleet;`)();
const WP = new Function(`${grab("const WP = [", "\n  ];")}\nreturn WP;`)();
const INFLOW = Number(/const INFLOW = ([\d.]+);/.exec(page)[1]);
if (Object.keys(MODES).length !== 6 || FLEET.length !== 6 || WP.length !== 7 || !(INFLOW > 0)) throw new Error("page data not found");
// One shape for every field: background drift, gain, flow, inflow and the systems
const DATA = {
  modes: Object.fromEntries(Object.entries(MODES).map(([k, m]) => [k, { label: m.label, bgU: m.bgU, bgV: m.bgV, gain: m.fieldGain, flow: m.flowSpeed, inflow: INFLOW, systems: m.systems }])),
  variants: Object.fromEntries(Object.entries(VARIANTS).map(([k, v]) => [k, { bgU: v.bg[0], bgV: v.bg[1], gain: v.gain, flow: 2.6, inflow: 0.3, systems: v.systems.map((s) => ({ x: s.x, y: s.y, spin: s.spin, r: s.r, strength: s.s })) }])),
  fleet: FLEET.map(({ name, slug, leg, kt, preset, delta, pos, course }) => ({ name, slug, leg, kt, preset, delta, pos, course })),
  waypoints: WP,
};

// Live board rows: the page's fleet, sparklines and statuses
const windTok = (kt) => `var(--wind-${Math.min(7, Math.max(0, Math.round((kt / 42) * 7))) + 1})`;
const fmtDelta = (v) => `${v < 0 ? "−" : "+"}${Math.abs(v).toFixed(1)}h`;
const histOf = (f, i) => {
  const h = Array.from({ length: 24 }, (_, k) => Math.max(4, f.kt * (0.6 + 0.4 * (k / 23)) + Math.sin((i + 1) * 3.1 + k * 0.7) * 3 + Math.sin(i + 1 + k * 0.23) * 2.4));
  h[23] = f.kt;
  return h;
};
const spark = (f, i) => {
  const hist = histOf(f, i);
  const d = hist.map((v, k) => `${k ? "L" : "M"}${((k / 23) * 72).toFixed(1)} ${(18 - (v / 42) * 16).toFixed(1)}`).join("");
  const last = (18 - (hist[23] / 42) * 16).toFixed(1);
  return `<svg class="spark" viewBox="0 0 72 18" aria-hidden="true"><path d="${d}" style="stroke:${windTok(f.kt)}"/><circle cx="72" cy="${last}" r="1.8" style="fill:${windTok(f.kt)}"/></svg>`;
};
const ROWS = FLEET.map((f, i) => {
  const hold = f.kt >= 35;
  return `<tr><td><span class="vessel"><span class="spin" aria-hidden="true"></span>${f.name}</span></td><td>${f.leg}</td>` +
    `<td><span class="status ${hold ? "status--hold" : "status--ok"}">${hold ? "Weather hold" : "On track"}</span></td>` +
    `<td class="wind-cell">${spark(f, i)}<span class="kt">${Math.round(f.kt)} kt</span></td>` +
    `<td class="${f.delta > 0 ? "delta delta--down" : "delta"}"><span class="delta-val">${fmtDelta(f.delta)}</span></td></tr>`;
}).join("\n");
// The log opens mid-shift, as the page seeds it
const LOG = FLEET.slice(3).map((f, i) =>
  `<div class="log-line${i === 2 ? " log-caret" : ""}"><span class="ts">[06:00:0${i}Z] </span><span class="who">${f.slug.padEnd(15)}</span>push advisory → bridge (38 kB) <span class="ok">✓ ack</span></div>`).join("\n");

// 0.25° heat grid: 24 × 9 cells of the page's field at t = 0, on the wind ramp, 1° lines every fourth cell
const heatField = (x, y, t) => 0.5 + 0.28 * Math.sin(x * 0.42 + t * 0.6) * Math.cos(y * 0.55 - t * 0.4) + 0.22 * Math.sin((x + y) * 0.23 + t * 0.3);
const HEAT = [];
for (let y = 0; y < 9; y++) for (let x = 0; x < 24; x++) {
  const v = Math.max(0, Math.min(0.999, heatField(x, y, 0)));
  HEAT.push(`<rect x="${x * 4}" y="${y * 4}" width="4.05" height="4.05" style="--d:${(0.3 + (x + y) * 0.025).toFixed(3)}s;fill:var(--wind-${Math.floor(v * 8) + 1})"/>`);
}
for (let x = 4; x < 24; x += 4) HEAT.push(`<line x1="${x * 4}" x2="${x * 4}" y1="0" y2="36"/>`);
for (let y = 4; y < 9; y += 4) HEAT.push(`<line y1="${y * 4}" y2="${y * 4}" x1="0" x2="96"/>`);

/* ── 5. Markup: slices of the page's body ────────────────────────────── */
let H = page.slice(BODY).replace(/ class=on>/g, ' class="on">');
const swap = (from, to) => {
  if (!H.includes(from)) throw new Error("markup not found: " + from.slice(0, 70));
  H = H.split(from).join(to);
};
// The script's id hooks become classes and data attributes
swap('<canvas id="wind_canvas" aria-hidden="true"></canvas>', '<canvas class="wind-canvas" aria-hidden="true"></canvas>');
swap('<canvas id="chart_overlay" aria-hidden="true"></canvas>', '<canvas class="chart-overlay" aria-hidden="true"></canvas>');
swap('<div id="legend_bar"></div>', '<div class="legend-bar"></div>');
swap('<span class="inner" id="chart_slot"></span>', '<span class="inner" data-field="slot"><canvas aria-hidden="true"></canvas></span>');
swap('<span id="mode_label">', '<span data-mode-label>');
for (const k of ["eta", "fuel", "course"]) swap(`<dd id="rc_${k}">`, `<dd data-rc="${k}">`);
for (const k of ["main", "wind", "bars"]) swap(`id="dial_${k}"`, `data-dial="${k}"`);
swap('<span class="board-meta" id="board_meta">', '<span class="board-meta" data-board="meta">');
swap('<span class="board-clock" id="board_clock">', '<span class="board-clock" data-board="clock">');
swap('<tbody id="route_rows"></tbody>', `<tbody>\n${ROWS}\n</tbody>`);
swap('<div class="board-log" id="board_log" aria-hidden="true"></div>', `<div class="board-log" aria-hidden="true">\n${LOG}\n</div>`);
swap('<svg class="viz-heat" id="viz_heat" viewBox="0 0 96 36" preserveAspectRatio="none"></svg>', `<svg class="viz-heat" viewBox="0 0 96 36" preserveAspectRatio="none">${HEAT.join("")}</svg>`);
// The odometer reels are the page's scroll flourish; the figures stay as plain text
H = H.replace(/<span class="odo" data-value="[^"]*">([^<]*)<\/span>/g, "$1");
// Presets say which one is on
H = H.replace(/<button type="button" data-mode="([a-z]+)"( class="is-active")?>/g, (_, m, on) => `<button type="button" data-mode="${m}"${on ? ' class="is-active" aria-pressed="true"' : ' aria-pressed="false"'}>`);
swap('<span>© <span id="year">2026</span>', "<span>© 2026");
if (/<canvas id|base64/.test(H.slice(0, H.indexOf("<script")))) throw new Error("an id'd canvas or inlined data is left in the markup");

// Section anchors become "#"; the script's remaining id hooks and the page's markers go
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-component="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ href="#[a-z_]*"/g, ' href="#"')
  // Source indentation goes, except inside <pre> (the code plate keeps its own)
  .split(/(<pre[\s\S]*?<\/pre>)/).map((part, i) => (i % 2 ? part : part.replace(/\n {2,}/g, "\n"))).join("");
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const dlMac = /<a class="dl dl--mac" href="#access">[\s\S]*?<\/a>/.exec(H)[0];
const dlWin = /<a class="dl dl--win" href="#access">[\s\S]*?<\/a>/.exec(H)[0];
const dlSm = /<div class="footer-dl">[\s\S]*?<\/div>/.exec(H)[0];
const btnGhost = /<a class="btn" href="#access">[\s\S]*?<\/a>/.exec(H)[0];
const btnSolid = /<button class="btn btn--solid" type="submit">[\s\S]*?<\/button>/.exec(H)[0].replace(' type="submit"', ' type="button"');
const modePanel = piece('<div class="mode-panel"');

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("nav", "Nav pill & menu", "A glass pill over the page (--dr-glass-nav on 64% night, a 13% cream hairline): the DRIFT wordmark in Archivo 800 at --dr-stretch-wide with a mono 'routing' tag, the cream Request access pill and a round toggle whose two strokes turn into a cross. The toggle wipes a full-screen menu down from the top on --dr-ease-wipe: numbered Archivo rows that rise into place one after another, and an aside with the app buttons, the desk's address and a mono status line. Shown open, inside .dr-navframe (a 40rem frame ruled like chart paper) so it previews as a card; on a page, drop the frame and pin .dr-nav and .dr-menu with position: fixed. Escape closes it.",
  `<div class="navframe menu-open">\n${piece('<header class="nav"').replace('aria-expanded="false"', 'aria-expanded="true"').replace('aria-label="Open menu"', 'aria-label="Close menu"')}\n${piece('<nav class="menu"').replace('aria-hidden="true"', 'aria-hidden="false"')}\n</div>`, { js: true });

add("buttons", "Buttons, presets & status chips", "One drawn object per screen: the primary is a cream pill (.dr-pill-cta, or .dr-dl.dr-dl--mac with an icon) and the solid keyed button (.dr-btn.dr-btn--solid), whose 2px frame has three gaps punched in --dr-key-bg and a dash leading the label; on hover it empties to an outline and the gaps close. Secondary actions are hairlines (.dr-btn, .dr-dl--win). Presets are square mono toggles that fill cream when on (aria-pressed). Status chips carry a dot and a word, tinted by --dr-s: on track, fetching, solving, pushing, hold.",
  `<div style="display:grid;gap:28px">
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
<a class="pill-cta" href="#">Request access ${ARROW}</a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-label="Open menu"><span></span><span></span></button>
${btnGhost.replace(/^<a class="btn" href="#access">/, '<a class="btn" href="#">')}
${btnSolid}
</div>
<div class="hero-actions" style="flex-direction:row;flex-wrap:wrap;inline-size:auto">
${dlMac}
${dlWin}
</div>
${dlSm}
${modePanel.replace('<div class="mode-panel"', '<div class="mode-panel" style="justify-content:flex-start"')}
<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">
<span class="status status--ok">On track</span><span class="status status--fetch">Fetching field</span><span class="status status--solve">Solving tracks</span><span class="status status--push">Pushing to bridge</span><span class="status status--hold">Weather hold</span>
<span class="panel-head" style="border:0;padding:0 0 0 8px"><span class="live"><i></i>Live</span></span>
</div>
</div>`, { js: true });

add("type", "Type, labels & readouts", "Three faces with three jobs. Archivo (--dr-font-display) sets every heading in capitals: weight 600 widened to --dr-stretch (112%), line-height .98, with the quieter half of a headline in a 52% cream span. Instrument Sans carries copy at --dr-text, the lede at --dr-lede in 76% cream. IBM Plex Mono is the instrument voice: every label is 11px (--dr-label) uppercase at .14em, in --dr-muted; figures are Archivo 500 with tabular numerals and a mono unit beside them.",
  `<div style="display:grid;gap:36px">
<div style="display:flex;flex-wrap:wrap;gap:18px 40px;align-items:baseline">
<a class="wordmark" href="#">DRIFT <small>routing</small></a>
<p class="kicker">Get the app</p>
<div class="caption"><div class="caption-title">Western Mediterranean</div><div class="caption-hint">Field v3 · 0.25° · isobars 4 hPa · Mistral</div></div>
</div>
<h1 class="display">Route the weather. <span style="display:block;font-weight:400;color:color-mix(in oklab, var(--paper) 52%, transparent)">Not around it.</span></h1>
<div class="section-head" style="padding:0">
<div><h2 class="section-title">A pressure field, not a forecast PDF</h2></div>
<p class="lede">Every system on the chart is a vortex with a radius, a spin and a strength. Advect a ship through the sum of them and you have the route.</p>
</div>
<div class="panel" style="max-inline-size:34rem">
<div class="panel-head"><span>Fig. 01 · Systems</span><span class="live"><i></i>Live</span></div>
<div class="panel-body"><h3>Read the systems</h3><p>Lows spin one way and draw air in, highs spin the other and push it out.</p></div>
</div>
<div style="display:flex;flex-wrap:wrap;gap:24px 56px">
<div class="stat" style="padding:0;border:0"><span class="stat-label">Fuel saved, 2025</span><strong class="stat-num">9.4<small>%</small></strong><span class="stat-note">Against the great-circle plan</span></div>
<div class="stat" style="padding:0;border:0"><span class="stat-label">Re-solve cadence</span><strong class="stat-num">6<small>min</small></strong><span class="stat-note">240 solves a day, per voyage</span></div>
<p class="tier-price">$390</p>
</div>
</div>`);

add("hero", "Wind field hero", "The page's signature: a live wind field behind everything. Particles advect through the sum of six pressure vortices and leave fading trails coloured by speed on the wind ramp (--dr-wind-1 calm to --dr-wind-8 gale); over them, isobars every 4 hPa contoured from the same pressure, L and H chips that follow the systems, the great circle dashed and the cheapest track solid with a ship on it. The headline sits on top in Archivo capitals with a soft --dr-shadow-headline, a live slot of the field set between its words, and the chart's furniture frames it: caption and route readout up top, legend and preset row below. The six presets swap the systems; the route card re-solves. Canvas 2D, DPR 1, paused off screen, one held frame under reduced motion.",
  asDiv(piece('<section class="intro"')), { js: true });

add("legend", "Legends, scales & markers", "The chart's reading aids, all from the page. The wind legend is an 8-stop ramp bar over a mono kt scale; each bin also has a swatch with its range, so speed never rests on colour alone. Pressure chips name the system by letter (L in --dr-low, H in --dr-high) beside the central pressure. Route keys pair a solid line (solved track) with a dashed one (great circle). The longitude scale is the footer's chart edge: ticks every 1/30 and 1/6 drawn with repeating gradients. Status chips always carry their word.",
  `<div style="display:grid;gap:36px">
<div style="display:flex;flex-wrap:wrap;gap:28px 56px;align-items:end">
<div class="legend" style="pointer-events:auto">
<div class="legend-bar"></div>
<div class="legend-scale"><span>0 kt</span><span>20</span><span>40+ kt</span></div>
</div>
<div style="display:flex;gap:10px">
<div class="iso-marker" data-kind="L" style="position:relative"><b>L</b><span>996</span></div>
<div class="iso-marker" data-kind="H" style="position:relative"><b>H</b><span>1024</span></div>
</div>
<div class="route-card-foot" style="border:0;padding:0"><span><i></i>Solved track</span><span><i class="dash"></i>Great circle</span></div>
</div>
<div class="legend-key">
${[[1, "0–5"], [2, "5–11"], [3, "11–17"], [4, "17–23"], [5, "23–29"], [6, "29–35"], [7, "35–40"], [8, "40+ kt"]].map(([k, r]) => `<span><i class="swatch" style="background:var(--wind-${k})"></i>${r}</span>`).join("\n")}
</div>
<div style="max-inline-size:22rem"><div class="viz-meter" style="block-size:0.6rem">${Array.from({ length: 30 }, (_, i) => `<i${i < 19 ? ' style="background:var(--ok)"' : ""}></i>`).join("")}</div><div class="viz-scale" style="margin-top:6px"><span>0</span><span>5</span><span>10</span><span>15%</span></div></div>
${piece('<div class="footer-scale"').replace('<div class="footer-scale"', '<div class="footer-scale" style="margin-block-start:0"')}
</div>`);

add("stats", "Instrument stats", "A four-cell strip where every figure carries its own small instrument: growth bars that rise from the base, a 30-cell fuel meter that lights green to the value with the last lit cell glowing, the 0.25° heat grid on the wind ramp (it re-samples its field every 0.9s while on screen), and a solve clock whose blue sweep flashes each tick. A hairline draws across the top of each cell as the strip arrives (.dr-is-in). Two columns under 62rem.",
  piece('<ul class="stats"'), { js: true });

add("dashboards", "Field dashboards", "The hero's field at card scale, one instrument each, each with its own ground, ramp and accent (--dr-acc): Systems draws the wind as glacier stipple around a deepening low with breathing isobars and a barograph; Fleet draws aurora ribbons with three ships sailing the field and live speed over ground; Re-solve prints moss wind barbs and swaps the old and new track on a 6s demo cadence with a countdown ring and the diff. Readouts sit on glass widgets (--dr-radius-widget, --dr-glass-widget). Cards lift 3px on hover.",
  asDiv(piece('<section class="band" id="model"')), { js: true });

add("bridge", "Advisory dial", "The routing advisory as an instrument: three rings (waypoint, a full compass tape, arrival day) turn on --dr-ease-dial to bring the current value under the index mark; the centre is a compass card with the course hand, the wind hand in --dr-low and the solver's blue sweep; two side dials show the wind at the waypoint and a bar per waypoint along the track, coloured on the wind ramp with numbers under every bar. A mono readout and seven waypoint buttons (aria-pressed) sit below. It steps through the voyage by itself while on screen and stops for 15s when someone picks a waypoint.",
  asDiv(piece('<section class="band band--quiet" id="bridge"')), { js: true });

add("board", "Live board", "A routing agent at work, terminal style: a mono bar with a live dot, the desk path and a UTC clock; a fixed-layout table (nothing the agent writes can change its width) with each leg's 24h wind as a sparkline coloured on the wind ramp next to its kt figure, a status chip and the ETA delta (early in --dr-high, late in --dr-low, always signed). The agent walks the fleet: the working row gets a scan of light and a braille spinner, the status steps fetch, solve, push, and every step types into the log below with a block caret.",
  asDiv(piece('<section class="band" id="routes"')), { js: true });

add("code", "API code plate", "A flat night plate in mono at .78rem/1.85: comments at 42% cream, verbs in --dr-high, strings in --dr-ok, numbers in --dr-code-num. It sits beside a section title, a lede and a hairline .dr-btn.",
  asDiv(piece('<section class="band" id="api"')));

add("pricing", "Plans", "Three hairline plates with a mono head row (name left, terms right), an Archivo 500 price at --dr-price, a mono kicker and a list marked with short cream dashes. The chosen plan is .dr-panel--featured: a stronger rule and a 6% cream wash. Two columns under 62rem, one under 46rem.",
  asDiv(piece('<section class="band band--quiet" id="pricing"')));

add("access", "FAQ & sign-up", "A section title and lede over a one-line sign-up (a hairline email field and the solid keyed button), with a polite status line; beside it a <details> accordion ruled top and bottom, its mono + turning to a cream dash when open. The demo form validates natively and sends nothing.",
  asDiv(piece('<section class="band" id="access"')), { js: true });

add("footer", "Footer & longitude scale", "The chart's lower edge rather than a sitemap: the wordmark, one line and the small app pills; three mono-headed columns whose links grow a small arrow on hover; a longitude scale (6°W to 30°E) ruled by repeating gradients; and a mono bottom row with a pulsing status dot and the 'not for navigation' line.",
  piece('<footer class="footer"'));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "dr" && !m[1].startsWith("dr-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("dr-")) CLASSES.add(n);
const ATTRS = ["mode", "mode-label", "rc", "dial", "board", "k", "r", "wp", "variant", "kind", "field"];
const KEYFRAMES = ["settle", "tick-flash", "sweep", "diff-flash", "live-pulse", "scan", "delta-flash", "caret"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "dr", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .dr itself, or :where(.dr) in front
const ROOTED = /(^|[\s,(>+~])\.dr(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.dr) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* On the page, headings and controls inherit from body. Inside a host they'd pick up the host's own
   fonts, so they inherit from .dr. It goes first: the page's own rules come after it and win. */
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.dr) ${t}`).join(",")}{font-family:inherit}`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(base))).trim()}`;
// (#000 stays: it is the opaque stop of the board log's mask, an alpha, not a colour)
const leftHex = componentCss.replace(/#000(?![0-9a-f])/gi, "").match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Component script ─────────────────────────────────────────────── */
// Written as a real function so node parses it at build time; DATA is the page's own presets,
// dashboard fields, fleet and waypoints, read above.
function driftComponents(DATA) {
  /* Drift components, no libraries. Everything is set up by a scan that also
     runs whenever markup is added (a MutationObserver), so components added
     later, or cloned, work without setup. Colours are read from the tokens
     (--dr-wind-1..8, --dr-bg, the dashboard ramps) every couple of seconds,
     so editing a token recolours the field. Fields run at most 30 fps, pause
     off screen and in hidden tabs, and under prefers-reduced-motion build
     their trails once and hold that frame. */
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const all = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const pad3 = (n) => String(Math.round(n) % 360).padStart(3, "0");
  const signed = (v, d) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(d);

  /* ── Colour: any CSS colour a token holds, as [r, g, b] ── */
  const probe = document.createElement("canvas").getContext("2d");
  function rgbOf(value) {
    probe.fillStyle = "#000";
    probe.fillStyle = value || "#000";
    const s = probe.fillStyle;
    if (s[0] === "#") return [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
    return s.match(/[\d.]+/g).slice(0, 3).map(Number);
  }
  const tok = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();
  const rgba = (c, a) => "rgba(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + a + ")";
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  // A dashboard ramp from its low, mid and high stops: eight bins, the mid stop at the fifth
  function ramp3(lo, mid, hi) {
    return Array.from({ length: 8 }, (_, i) => (i <= 4 ? mix(lo, mid, i / 4) : mix(mid, hi, (i - 4) / 3)));
  }
  const LOOKS = {
    hero: (el) => ({ draw: "lines", bg: rgbOf(tok(el, "--dr-bg")), ramp: [1, 2, 3, 4, 5, 6, 7, 8].map((k) => rgbOf(tok(el, "--dr-wind-" + k))), alpha: parseFloat(tok(el, "--dr-field-alpha")) || 0.42, fade: parseFloat(tok(el, "--dr-field-fade")) || 0.07, gain: 11, width: 1 }),
    systems: (el) => ({ draw: "stipple", bg: rgbOf(tok(el, "--dr-glacier-bg")), ramp: ramp3(rgbOf(tok(el, "--dr-glacier-lo")), rgbOf(tok(el, "--dr-glacier-mid")), rgbOf(tok(el, "--dr-glacier-hi"))), alpha: 0.8, fade: 0.12, gain: 1 / 0.03 }),
    fleet: (el) => ({ draw: "lines", bg: rgbOf(tok(el, "--dr-aurora-bg")), ramp: ramp3(rgbOf(tok(el, "--dr-aurora-lo")), rgbOf(tok(el, "--dr-aurora-mid")), rgbOf(tok(el, "--dr-aurora-hi"))), alpha: 0.5, fade: 0.035, gain: 1 / 0.03, width: 0.9 }),
    resolve: (el) => ({ draw: "barbs", bg: rgbOf(tok(el, "--dr-moss-bg")), ramp: ramp3(rgbOf(tok(el, "--dr-moss-lo")), rgbOf(tok(el, "--dr-moss-mid")), rgbOf(tok(el, "--dr-moss-hi"))), alpha: 0.9, fade: 1, gain: 1 / 0.03 }),
  };

  /* ── The field: particles advected through a sum of pressure vortices ──
     host     the element the canvases fill
     o.look   a LOOKS key; o.cfg the systems ({ bgU, bgV, gain, flow, inflow, systems })
     o.dpr    the pixel-ratio cap; o.per the area per particle; o.max a particle cap
     o.over   an optional overlay canvas and o.draw(t, dt, api) to draw on it each frame */
  function makeField(host, canvas, o) {
    const fx = canvas.getContext("2d");
    const ox = o.over ? o.over.getContext("2d") : null;
    const st = { w: 0, h: 0, aspect: 1, running: false, raf: 0, last: 0, t0: performance.now(), frames: 0 };
    let look = LOOKS[o.look](host), cfg = o.cfg, sys = [], N = 0, px, py, life;
    const DPR = Math.min(window.devicePixelRatio || 1, o.dpr || 1);
    function setCfg(next) {
      cfg = next;
      sys = cfg.systems.map((s) => Object.assign({}, s, { bx: s.x, by: s.y, ph: Math.random() * 6.28 }));
    }
    setCfg(cfg);
    function wind(x, y) {
      let u = cfg.bgU, v = cfg.bgV;
      for (const s of sys) {
        const rx = x - s.x * st.aspect, ry = y - s.y;
        const d2 = rx * rx + ry * ry + 0.0001, d = Math.sqrt(d2);
        const mag = s.strength * (d / s.r) * Math.exp(-d2 / (2 * s.r * s.r)) * cfg.gain;
        u += s.spin * mag * (-ry / d) - s.spin * cfg.inflow * mag * (rx / d);
        v += s.spin * mag * (rx / d) - s.spin * cfg.inflow * mag * (ry / d);
      }
      return [u, v];
    }
    function pressure(x, y) {
      let p = 1013;
      for (const s of sys) {
        const dx = x - s.x * st.aspect, dy = y - s.y, R = s.r * 1.35;
        p -= s.spin * s.strength * 18 * Math.exp(-(dx * dx + dy * dy) / (2 * R * R));
      }
      return p;
    }
    const spawn = (i) => { px[i] = Math.random() * st.aspect; py[i] = Math.random(); life[i] = 1.15 + Math.random() * 2.75; };
    function clear() { fx.fillStyle = rgba(look.bg, 1); fx.fillRect(0, 0, st.w, st.h); }
    function resize() {
      const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
      if (w === st.w && h === st.h) return false;
      st.w = w; st.h = h; st.aspect = w / h;
      for (const c of [canvas, o.over]) if (c) { c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); }
      fx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (ox) ox.setTransform(DPR, 0, 0, DPR, 0, 0);
      clear();
      const density = parseFloat(tok(host, "--dr-field-density")) || 1;
      N = Math.round(Math.min(o.max || 1e9, ((w * h) / (o.per || 70)) * density));
      px = new Float32Array(N); py = new Float32Array(N); life = new Float32Array(N);
      for (let i = 0; i < N; i++) spawn(i);
      return true;
    }
    function step(dt, t) {
      for (const s of sys) {
        s.x = s.bx + Math.sin(t * 0.09 + s.ph) * 0.03;
        s.y = s.by + Math.cos(t * 0.08 + s.ph) * 0.03;
      }
      fx.fillStyle = rgba(look.bg, look.fade);
      fx.fillRect(0, 0, st.w, st.h);
      const h = st.h;
      const bins = look.ramp.length;
      const binOf = (u, v) => Math.min(bins - 1, Math.floor(clamp((u * u + v * v) * look.gain, 0, 0.999) * bins));
      const paths = look.ramp.map(() => new Path2D());
      if (look.draw === "barbs") {
        // A regular grid of wind arrows, the way a forecast chart prints them
        const g = 17;
        for (let y = g / 2, row = 0; y < st.h; y += g, row++) {
          for (let x = g / 2 + (row % 2) * (g / 2); x < st.w; x += g) {
            const [u, v] = wind(x / h, y / h);
            const sp = Math.hypot(u, v) || 1e-6;
            const len = clamp(sp * 70, 3, g * 0.8);
            const ux = u / sp, uy = v / sp;
            const x0 = x - (ux * len) / 2, y0 = y - (uy * len) / 2, x1 = x + (ux * len) / 2, y1 = y + (uy * len) / 2;
            const p = paths[binOf(u, v)];
            p.moveTo(x0, y0); p.lineTo(x1, y1);
            p.moveTo(x1, y1); p.lineTo(x1 - ux * 3.2 - uy * 2.2, y1 - uy * 3.2 + ux * 2.2);
          }
        }
        fx.lineWidth = 1.2;
        fx.lineCap = "round";
        paths.forEach((p, k) => { fx.strokeStyle = rgba(look.ramp[k], look.alpha); fx.stroke(p); });
        return;
      }
      const k = dt * cfg.flow * 0.9;
      for (let i = 0; i < N; i++) {
        const [u, v] = wind(px[i], py[i]);
        const nx = px[i] + u * k, ny = py[i] + v * k;
        life[i] -= dt;
        if (life[i] < 0 || nx < 0 || nx > st.aspect || ny < 0 || ny > 1) { spawn(i); continue; }
        const p = paths[binOf(u, v)];
        if (look.draw === "stipple") p.rect(nx * h - 0.8, ny * h - 0.8, 1.6, 1.6);
        else { p.moveTo(px[i] * h, py[i] * h); p.lineTo(nx * h, ny * h); }
        px[i] = nx; py[i] = ny;
      }
      if (look.draw === "stipple") paths.forEach((p, k2) => { fx.fillStyle = rgba(look.ramp[k2], look.alpha); fx.fill(p); });
      else {
        fx.lineWidth = look.width || 1;
        fx.lineCap = "round";
        paths.forEach((p, k2) => { fx.strokeStyle = rgba(look.ramp[k2], look.alpha); fx.stroke(p); });
      }
    }
    const api = { st, wind, pressure, sys: () => sys, ox, host };
    function render(dt, t) {
      st.frames++;
      if (st.frames % 60 === 0) look = LOOKS[o.look](host);
      step(dt, t);
      if (ox) { ox.clearRect(0, 0, st.w, st.h); if (o.draw) o.draw(t, dt, api); }
    }
    function frame(now) {
      st.raf = 0;
      if (!st.running) return;
      st.raf = requestAnimationFrame(frame);
      if (now - st.last < 33) return;
      const dt = Math.min(0.05, (now - st.last) / 1000 || 0.033);
      st.last = now;
      render(dt, (now - st.t0) / 1000);
    }
    // Under reduced motion: build the trails once (about 40 frames, as the page does) and hold
    function still() {
      look = LOOKS[o.look](host);
      clear();
      for (let i = 0; i < 40; i++) render(0.033, i * 0.033);
    }
    function start() {
      if (RM) { if (!st.frames) still(); return; }
      if (st.raf) return;
      st.running = true; st.last = performance.now(); st.raf = requestAnimationFrame(frame);
    }
    function stop() { st.running = false; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; }
    resize();
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (resize() && RM) still(); }).observe(host);
    return { host, start, stop, setCfg: (c) => { setCfg(c); if (RM) still(); }, api };
  }

  /* ── Hero chart overlay: graticule, isobars, the solved route, the L/H chips ── */
  const BASE_HOURS = 107, BASE_FUEL = 318.4; // 1,442 nm at 13.5 kt; mt on the great circle
  function chartOverlay(intro) {
    const route = { k: 0, shown: 0, gc: 1, best: 1, frames: 0 };
    let iso = null, isoAt = -99;
    const markers = intro.querySelector(".dr-markers");
    const readout = (k) => intro.querySelector('[data-dr-rc="' + k + '"]');
    let chips = [];
    function buildChips(api) {
      if (!markers) return;
      markers.textContent = "";
      chips = api.sys().map((s) => {
        const el = document.createElement("div");
        el.className = "dr-iso-marker";
        el.setAttribute("data-dr-kind", s.spin > 0 ? "L" : "H");
        el.innerHTML = "<b>" + (s.spin > 0 ? "L" : "H") + "</b><span></span>";
        markers.appendChild(el);
        return el;
      });
    }
    const A = [0.07, 0.66], B = [0.93, 0.36];
    function pt(k, t, a) {
      const ax = A[0] * a, ay = A[1], bx = B[0] * a, by = B[1];
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), off = L * k * Math.sin(Math.PI * t);
      return [ax + dx * t + (-dy / L) * off, ay + dy * t + (dx / L) * off];
    }
    function cost(k, api) {
      let time = 0, [x0, y0] = pt(k, 0, api.st.aspect);
      for (let i = 1; i <= 24; i++) {
        const [x1, y1] = pt(k, i / 24, api.st.aspect);
        const sx = x1 - x0, sy = y1 - y0, ds = Math.hypot(sx, sy);
        const [u, v] = api.wind((x0 + x1) / 2, (y0 + y1) / 2);
        time += ds / Math.max(0.35, 1 + 1.6 * ((u * sx + v * sy) / ds));
        x0 = x1; y0 = y1;
      }
      return time;
    }
    function solve(api) {
      let best = 0, bestC = Infinity;
      for (let k = -0.3; k <= 0.301; k += 0.03) { const c = cost(k, api); if (c < bestC) { bestC = c; best = k; } }
      route.k = best;
      const ratio = bestC / cost(0, api);
      const [x0, y0] = pt(best, 0, api.st.aspect), [x1, y1] = pt(best, 0.04, api.st.aspect);
      const course = (Math.atan2(x1 - x0, -(y1 - y0)) * 180) / Math.PI + 360;
      if (readout("eta")) readout("eta").textContent = signed(BASE_HOURS * (ratio - 1), 1) + " h";
      if (readout("fuel")) readout("fuel").textContent = signed(BASE_FUEL * (ratio - 1), 0) + " mt";
      if (readout("course")) readout("course").textContent = pad3(course) + "°";
    }
    // Isobars every 4 hPa, contoured by marching squares from the field's own pressure
    function isobars(api) {
      const { w, h } = api.st, g = 28;
      const cols = Math.ceil(w / g) + 1, rows = Math.ceil(h / g) + 1;
      const P = new Float32Array(cols * rows);
      let lo = Infinity, hi = -Infinity;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const p = api.pressure((i * g) / h, (j * g) / h);
        P[j * cols + i] = p; if (p < lo) lo = p; if (p > hi) hi = p;
      }
      const path = new Path2D();
      for (let L = Math.ceil(lo / 4) * 4; L <= hi; L += 4) {
        for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
          const a = P[j * cols + i], b = P[j * cols + i + 1], c = P[(j + 1) * cols + i + 1], d = P[(j + 1) * cols + i];
          const pts = [];
          if ((a > L) !== (b > L)) pts.push([i + (L - a) / (b - a), j]);
          if ((b > L) !== (c > L)) pts.push([i + 1, j + (L - b) / (c - b)]);
          if ((d > L) !== (c > L)) pts.push([i + (L - d) / (c - d), j + 1]);
          if ((a > L) !== (d > L)) pts.push([i, j + (L - a) / (d - a)]);
          for (let n = 0; n + 1 < pts.length; n += 2) { path.moveTo(pts[n][0] * g, pts[n][1] * g); path.lineTo(pts[n + 1][0] * g, pts[n + 1][1] * g); }
        }
      }
      return path;
    }
    function stroke(ox, k, a, h) {
      ox.beginPath();
      for (let i = 0; i <= 48; i++) { const [x, y] = pt(k, i / 48, a); i ? ox.lineTo(x * h, y * h) : ox.moveTo(x * h, y * h); }
      ox.stroke();
    }
    const draw = (t, dt, api) => {
      const { ox, st } = api, h = st.h, a = st.aspect;
      const paper = rgbOf(tok(intro, "--dr-paper")), bg = rgbOf(tok(intro, "--dr-bg"));
      if (!chips.length) buildChips(api);
      if (route.frames++ % 45 === 0) solve(api);
      if (st.frames - isoAt > 15) { iso = isobars(api); isoAt = st.frames; }
      // Graticule
      ox.lineWidth = 1;
      ox.strokeStyle = rgba(paper, 0.05);
      ox.beginPath();
      for (let i = 1; i < 6; i++) { ox.moveTo((st.w * i) / 6, 0); ox.lineTo((st.w * i) / 6, st.h); }
      for (let j = 1; j < 4; j++) { ox.moveTo(0, (st.h * j) / 4); ox.lineTo(st.w, (st.h * j) / 4); }
      ox.stroke();
      ox.strokeStyle = rgba(paper, 0.16);
      ox.stroke(iso);
      // Great circle dashed, the solved track solid with a dark keyline, ports square
      route.shown += (route.k - route.shown) * 0.06;
      ox.setLineDash([4, 6]); ox.strokeStyle = rgba(paper, 0.5); ox.lineWidth = 1; stroke(ox, 0, a, h); ox.setLineDash([]);
      ox.strokeStyle = rgba(bg, 0.55); ox.lineWidth = 4; stroke(ox, route.shown, a, h);
      ox.strokeStyle = rgba(paper, 0.95); ox.lineWidth = 1.6; stroke(ox, route.shown, a, h);
      ox.fillStyle = rgba(paper, 1);
      for (const tt of [0, 1]) { const [x, y] = pt(0, tt, a); ox.fillRect(x * h - 3, y * h - 3, 6, 6); }
      const s = (t * 0.025) % 1, [sx, sy] = pt(route.shown, s, a), [qx, qy] = pt(route.shown, Math.min(1, s + 0.01), a);
      ox.save(); ox.translate(sx * h, sy * h); ox.rotate(Math.atan2(qy - sy, qx - sx));
      ox.beginPath(); ox.moveTo(7, 0); ox.lineTo(-5, -4); ox.lineTo(-3, 0); ox.lineTo(-5, 4); ox.closePath();
      ox.lineWidth = 3; ox.strokeStyle = rgba(bg, 0.8); ox.stroke(); ox.fillStyle = rgba(paper, 1); ox.fill();
      ox.restore();
      // L and H chips follow their systems
      if (st.frames % 3 === 0) api.sys().forEach((sy2, i) => {
        const el = chips[i];
        if (!el) return;
        const txt = String(Math.round(api.pressure(sy2.x * a, sy2.y)));
        if (el.lastChild.textContent !== txt) el.lastChild.textContent = txt;
        el.style.transform = "translate(" + (sy2.x * st.w - el.offsetWidth / 2).toFixed(1) + "px, " + (sy2.y * st.h - el.offsetHeight / 2).toFixed(1) + "px)";
      });
    };
    return { draw, reset: () => { chips = []; route.frames = 0; isoAt = -99; } };
  }

  /* ── Dashboard instruments (the page's own, ported) ── */
  function dashInstrument(plate, variant) {
    const q = (k) => plate.querySelector('[data-dr-k="' + k + '"]');
    const INK = (a) => rgba(rgbOf(tok(plate, "--dr-paper")), a);
    if (variant === "systems") {
      const baro = [];
      let tick = 0;
      return (t, dt, api) => {
        const { ox, st } = api, s = api.sys()[0];
        const cx = s.x * st.w, cy = s.y * st.h, center = api.pressure(s.x * st.aspect, s.y);
        ox.lineWidth = 1;
        ox.font = '11px "IBM Plex Mono", ui-monospace, monospace';
        ox.textAlign = "center"; ox.textBaseline = "middle";
        for (let k = 1; k <= 4; k++) {
          const level = Math.ceil(center / 4) * 4 + (k - 1) * 4, breathe = 1 + Math.sin(t * 0.8 - k * 0.6) * 0.025, rx = st.h * (0.09 + k * 0.075) * breathe;
          ox.strokeStyle = INK(0.42 - k * 0.07);
          ox.beginPath(); ox.ellipse(cx, cy, rx * 1.18, rx, -0.35, 0, Math.PI * 2); ox.stroke();
          const lx = cx + Math.cos(-0.35) * rx * 1.18, ly = cy + Math.sin(-0.35) * rx * 1.18, tw = ox.measureText(String(level)).width + 6;
          ox.fillStyle = rgba(rgbOf(tok(plate, "--dr-plate")), 0.9); ox.fillRect(lx - tw / 2, ly - 7, tw, 14);
          ox.fillStyle = INK(0.7); ox.fillText(String(level), lx, ly + 0.5);
        }
        ox.fillStyle = tok(plate, "--dr-low");
        ox.beginPath(); ox.arc(cx, cy, 3, 0, Math.PI * 2); ox.fill();
        // The low deepens and fills on a slow cycle; the barograph records it
        s.strength = 1.15 + Math.sin(t * 0.22) * 0.18;
        if (!baro.length) for (let i = 47; i > 0; i--) baro.push(center + 18 * (s.strength - (1.15 + Math.sin(0.22 * (t - i * 0.2)) * 0.18)) * 0.9);
        if (++tick % 6 === 0 || baro.length < 48) {
          baro.push(center); if (baro.length > 48) baro.shift();
          if (q("hpa")) q("hpa").textContent = Math.round(center);
          const d = center - (baro.length > 18 ? baro[baro.length - 18] : baro[0]);
          if (q("trend")) q("trend").textContent = signed(d, 1) + " hPa / 3 h · " + (d < 0 ? "deepening" : "filling");
          const lo = Math.min.apply(null, baro) - 1, hi = Math.max.apply(null, baro) + 1;
          const pts = baro.map((v, i) => [(i / 47) * 160, 4 + (1 - (v - lo) / (hi - lo)) * 32]);
          const off = 160 - pts[pts.length - 1][0];
          const line = pts.map(([x, y], i) => (i ? "L" : "M") + (x + off).toFixed(1) + " " + y.toFixed(1)).join("");
          const L = plate.querySelector(".dr-baro-line"), Ar = plate.querySelector(".dr-baro-area"), D = plate.querySelector(".dr-baro-dot");
          if (L) L.setAttribute("d", line);
          if (Ar) Ar.setAttribute("d", line + "L160 40L" + (pts[0][0] + off).toFixed(1) + " 40Z");
          if (D) D.setAttribute("cy", pts[pts.length - 1][1].toFixed(1));
        }
      };
    }
    if (variant === "fleet") {
      const ships = [0, 1, 2].map((i) => ({ x: 0.08 + i * 0.25, y: 0.3 + i * 0.22, trail: [], sog: 13 }));
      return (t, dt, api) => {
        const { ox, st } = api, hgt = st.h;
        const colors = [tok(plate, "--dr-ship-1"), tok(plate, "--dr-ship-2"), tok(plate, "--dr-paper")];
        ships.forEach((sh, i) => {
          const [u, v] = api.wind(sh.x, sh.y);
          // Ships hold an eastbound heading through water and get pushed by the wind
          const vx = 0.07 + u * 0.6, vy = v * 0.6;
          sh.x += vx * dt; sh.y = clamp(sh.y + vy * dt, 0.08, 0.92);
          sh.sog = 13.5 + ((vx - 0.07) / 0.07) * 1.4;
          sh.trail.push([sh.x, sh.y]); if (sh.trail.length > 70) sh.trail.shift();
          if (sh.x > st.aspect + 0.03) { sh.x = -0.03; sh.y = 0.25 + Math.random() * 0.5; sh.trail.length = 0; }
          ox.strokeStyle = colors[i]; ox.globalAlpha = 0.7; ox.setLineDash([2, 4]); ox.lineWidth = 1;
          ox.beginPath(); sh.trail.forEach(([x, y], k) => (k ? ox.lineTo(x * hgt, y * hgt) : ox.moveTo(x * hgt, y * hgt))); ox.stroke();
          ox.setLineDash([]); ox.globalAlpha = 1;
          ox.save(); ox.translate(sh.x * hgt, sh.y * hgt); ox.rotate(Math.atan2(vy, vx));
          ox.beginPath(); ox.moveTo(7, 0); ox.lineTo(-5, -4); ox.lineTo(-3, 0); ox.lineTo(-5, 4); ox.closePath();
          ox.lineWidth = 3; ox.strokeStyle = rgba(rgbOf(tok(plate, "--dr-plate")), 0.8); ox.stroke(); ox.fillStyle = colors[i]; ox.fill();
          ox.restore();
        });
        if (st.frames % 10 === 0) {
          ships.forEach((sh, i) => { if (q("sog" + i)) q("sog" + i).textContent = clamp(sh.sog, 9, 18).toFixed(1); });
          const avg = ships.reduce((a, sh) => a + sh.sog, 0) / ships.length;
          if (q("fuel")) q("fuel").textContent = "−" + (2.6 + (avg - 13.5) * 0.6).toFixed(1) + "%";
        }
      };
    }
    const CYCLE = 6, solve = { prev: 0.12, next: -0.1, shown: -0.1, last: -1, course0: 84 };
    return (t, dt, api) => {
      const { ox, st } = api, a = st.aspect, h = st.h;
      const pt = (k, tt) => {
        const ax = 0.06 * a, ay = 0.54, bx = 0.94 * a, by = 0.46, dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), off = L * k * Math.sin(Math.PI * tt);
        return [ax + dx * tt + (-dy / L) * off, ay + dy * tt + (dx / L) * off];
      };
      const cost = (k) => {
        let time = 0, [x0, y0] = pt(k, 0);
        for (let i = 1; i <= 20; i++) {
          const [x1, y1] = pt(k, i / 20), sx = x1 - x0, sy = y1 - y0, ds = Math.hypot(sx, sy), [u, v] = api.wind((x0 + x1) / 2, (y0 + y1) / 2);
          time += ds / Math.max(0.35, 1 + 1.6 * ((u * sx + v * sy) / ds)); x0 = x1; y0 = y1;
        }
        return time;
      };
      const line = (k, style, width, dash) => {
        ox.setLineDash(dash); ox.lineWidth = width; ox.strokeStyle = style; ox.beginPath();
        for (let i = 0; i <= 40; i++) { const [x, y] = pt(k, i / 40); i ? ox.lineTo(x * h, y * h) : ox.moveTo(x * h, y * h); }
        ox.stroke(); ox.setLineDash([]);
      };
      const cycle = Math.floor(t / CYCLE), into = t - cycle * CYCLE;
      if (cycle !== solve.last) {
        solve.last = cycle;
        // Systems drift a little each cadence; re-solve against the new field
        api.sys().forEach((s) => { s.bx = clamp(s.bx + (Math.random() - 0.5) * 0.12, 0.15, 0.85); s.by = clamp(s.by + (Math.random() - 0.5) * 0.12, 0.2, 0.8); });
        let best = 0, bestC = Infinity;
        for (let k = -0.32; k <= 0.32; k += 0.04) { const c = cost(k); if (c < bestC) { bestC = c; best = k; } }
        const oldC = cost(solve.next);
        solve.prev = solve.next; solve.next = best;
        const course = Math.round(84 - best * 60), diff = q("diff");
        if (diff) { diff.textContent = "ETA " + signed(24 * (bestC / oldC - 1), 1) + " h"; diff.classList.remove("dr-flash"); void diff.offsetWidth; diff.classList.add("dr-flash"); }
        if (q("course")) q("course").textContent = "Course " + pad3(solve.course0) + "° → " + pad3(course) + "°";
        solve.course0 = course;
      }
      solve.shown += (solve.next - solve.shown) * 0.08;
      line(solve.prev, INK(0.4), 1, [3, 5]);
      line(solve.shown, rgba(rgbOf(tok(plate, "--dr-plate")), 0.55), 4, []);
      line(solve.shown, INK(0.95), 1.6, []);
      ox.fillStyle = INK(1);
      for (const tt of [0, 1]) { const [x, y] = pt(0, tt); ox.fillRect(x * h - 3, y * h - 3, 6, 6); }
      if (q("count")) q("count").textContent = "0:" + String(Math.ceil(CYCLE - into)).padStart(2, "0");
      const ring = plate.querySelector(".dr-ring-fg");
      if (ring) ring.style.strokeDashoffset = String(113.1 * (into / CYCLE));
    };
  }

  /* ── Visibility: fields run only on screen and in a visible tab ── */
  const fields = new Map(), onScreen = new Set();
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const f = fields.get(e.target);
      if (!f) continue;
      if (e.isIntersecting && !document.hidden) { onScreen.add(f); f.start(); } else { onScreen.delete(f); f.stop(); }
    }
  }, { rootMargin: "100px" }) : null;
  document.addEventListener("visibilitychange", () => onScreen.forEach((f) => (document.hidden ? f.stop() : f.start())));
  function watch(f) { fields.set(f.host, f); if (io) io.observe(f.host); else f.start(); }
  const modeOf = (intro) => {
    const on = intro && intro.querySelector(".dr-mode-panel .dr-is-active[data-dr-mode]");
    return DATA.modes[(on && on.getAttribute("data-dr-mode")) || "mistral"] || DATA.modes.mistral;
  };

  /* ── Stats: reveal once, then the heat grid re-samples while on screen ── */
  function setupStats(strip) {
    const cells = all(".dr-viz-heat rect", strip).map((r) => ({ r, x: +r.getAttribute("x") / 4, y: +r.getAttribute("y") / 4 }));
    const field = (x, y, t) => 0.5 + 0.28 * Math.sin(x * 0.42 + t * 0.6) * Math.cos(y * 0.55 - t * 0.4) + 0.22 * Math.sin((x + y) * 0.23 + t * 0.3);
    const paint = (t) => cells.forEach((c) => { c.r.style.fill = "var(--dr-wind-" + (Math.floor(clamp(field(c.x, c.y, t), 0, 0.999) * 8) + 1) + ")"; });
    if (RM || !io) { strip.classList.add("dr-is-in"); return; }
    let timer = 0;
    const t0 = performance.now();
    new IntersectionObserver((es) => {
      const on = es[0].isIntersecting;
      if (on) strip.classList.add("dr-is-in");
      if (on && !timer) timer = setInterval(() => !document.hidden && paint((performance.now() - t0) / 1000), 900);
      else if (!on && timer) { clearInterval(timer); timer = 0; }
    }, { threshold: 0.4 }).observe(strip);
  }

  /* ── Bridge dial: rings turn to the waypoint, heading and arrival day ── */
  const dials = new WeakMap();
  function setupDial(root) {
    const NS = "http://www.w3.org/2000/svg";
    const main = root.querySelector('[data-dr-dial="main"]'), windSvg = root.querySelector('[data-dr-dial="wind"]'), barsSvg = root.querySelector('[data-dr-dial="bars"]');
    if (!main || !windSvg || !barsSvg) return;
    [main, windSvg, barsSvg].forEach((s) => (s.textContent = ""));
    root.classList.remove("dr-is-live");
    const WP = DATA.waypoints, steps = all(".dr-wp-steps button", root), read = (k) => root.querySelector('[data-dr-r="' + k + '"]');
    const DAYS = ["04 MAR", "05 MAR", "06 MAR", "07 MAR", "08 MAR"], DIRS = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
    const P = (a) => "color-mix(in oklab, var(--dr-paper) " + a + "%, transparent)";
    const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); if (parent) parent.appendChild(n); return n; };
    const polar = (r, a, c = 200) => [c + r * Math.sin((a * Math.PI) / 180), c - r * Math.cos((a * Math.PI) / 180)];
    const arc = (r, a0, a1) => { const [x0, y0] = polar(r, a0), [x1, y1] = polar(r, a1); return "M" + x0.toFixed(2) + " " + y0.toFixed(2) + "A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + x1.toFixed(2) + " " + y1.toFixed(2); };
    const RINGS = [
      { id: "r1", r: 172, span: 270, items: WP.map((_, i) => "WP " + (i + 1)), preview: "WAYPOINT" },
      { id: "r2", r: 136, span: 360, items: Array.from({ length: 12 }, (_, i) => String(i * 30).padStart(3, "0")), preview: "HEADING" },
      { id: "r3", r: 100, span: 270, items: DAYS, preview: "ARRIVAL" },
    ];
    const ring = {};
    el("path", { d: "M192 2 L208 2 L200 12 Z", style: "fill:var(--dr-paper)" }, main);
    for (const R of RINGS) {
      el("circle", { cx: 200, cy: 200, r: R.r, class: "dr-d-back", "stroke-width": 28 }, main);
      el("circle", { cx: 200, cy: 200, r: R.r + 14, class: "dr-d-edge" }, main);
      el("circle", { cx: 200, cy: 200, r: R.r - 14, class: "dr-d-edge" }, main);
      const g = el("g", { class: "dr-d-ring dr-d-" + R.id }, main);
      if (R.span === 360) el("circle", { cx: 200, cy: 200, r: R.r, class: "dr-d-band", "stroke-width": 28 }, g);
      else el("path", { d: arc(R.r, -135, 135), class: "dr-d-band", "stroke-width": 28, "stroke-linecap": "butt" }, g);
      const items = el("g", { class: "dr-d-items" }, g), angles = [];
      if (R.span === 360) for (let d = 0; d < 360; d += 10) {
        if (d % 30 === 0) continue;
        const [x0, y0] = polar(R.r + 9, d), [x1, y1] = polar(R.r + 13, d);
        el("line", { x1: x0, y1: y0, x2: x1, y2: y1, class: "dr-d-tick" }, items);
      }
      R.items.forEach((label, i) => {
        const a = R.span === 360 ? i * 30 : -135 + (R.span / R.items.length) * (i + 0.5);
        angles.push(a);
        el("text", { x: 200, y: 200 - R.r, "text-anchor": "middle", "dominant-baseline": "central", class: "dr-d-item", transform: "rotate(" + a + " 200 200)" }, items).textContent = label;
      });
      el("text", { x: 200, y: 200 - R.r, "text-anchor": "middle", "dominant-baseline": "central", class: "dr-d-preview", style: "fill:" + P(75) }, main).textContent = R.preview;
      ring[R.id] = { g, angles, items: items.querySelectorAll(".dr-d-item"), rot: 0 };
    }
    // Centre: compass card with course, wind and the solver's sweep
    el("circle", { cx: 200, cy: 200, r: 78, style: "fill:var(--dr-dial-face);stroke:" + P(18) }, main);
    for (let d = 0; d < 360; d += 5) {
      const long = d % 45 === 0, [x0, y0] = polar(long ? 64 : 69, d), [x1, y1] = polar(73, d);
      el("line", { x1: x0, y1: y0, x2: x1, y2: y1, style: "stroke:" + P(long ? 60 : 25), "stroke-width": long ? 1.4 : 1 }, main);
    }
    [["N", 0], ["E", 90], ["S", 180], ["W", 270]].forEach(([l, a]) => { const [x, y] = polar(54, a); el("text", { x, y, "text-anchor": "middle", "dominant-baseline": "central", style: "fill:" + P(55), "font-size": 10 }, main).textContent = l; });
    el("text", { x: 200, y: 200, "text-anchor": "middle", "dominant-baseline": "central", class: "dr-t-display dr-d-center-preview", style: "fill:var(--dr-paper)", "font-size": 18, "letter-spacing": "0.18em" }, main).textContent = "DRIFT";
    const hands = el("g", { class: "dr-d-hands" }, main);
    el("line", { x1: 200, y1: 212, x2: 200, y2: 128, style: "stroke:var(--dr-high)", "stroke-width": 1.2 }, el("g", { class: "dr-d-sweep" }, hands));
    const windHand = el("g", { class: "dr-d-hand" }, hands);
    el("line", { x1: 200, y1: 200, x2: 200, y2: 150, style: "stroke:var(--dr-low)", "stroke-width": 2.5, "stroke-linecap": "round" }, windHand);
    el("path", { d: "M200 140 L206 152 L194 152 Z", style: "fill:var(--dr-low)" }, windHand);
    const courseHand = el("g", { class: "dr-d-hand" }, hands);
    el("rect", { x: 196, y: 134, width: 8, height: 72, rx: 4, style: "fill:var(--dr-paper)" }, courseHand);
    el("circle", { cx: 200, cy: 200, r: 7, style: "fill:var(--dr-paper)" }, hands);
    el("circle", { cx: 200, cy: 200, r: 2.5, style: "fill:var(--dr-ink)" }, hands);
    // Side dial: wind at the waypoint
    el("circle", { cx: 80, cy: 80, r: 74, style: "fill:var(--dr-dial-face);stroke:" + P(18) }, windSvg);
    for (let d = 0; d < 360; d += 15) { const [x0, y0] = polar(64, d, 80), [x1, y1] = polar(70, d, 80); el("line", { x1: x0, y1: y0, x2: x1, y2: y1, style: "stroke:" + P(25) }, windSvg); }
    const wItems = el("g", { class: "dr-d-items" }, windSvg), arrow = el("g", { class: "dr-s-arrow" }, wItems);
    el("path", { d: "M80 22 L86 34 L82 33 L82 50 L78 50 L78 33 L74 34 Z", style: "fill:var(--dr-low)" }, arrow);
    const wDir = el("text", { x: 80, y: 82, "text-anchor": "middle", class: "dr-t-display", style: "fill:var(--dr-paper)", "font-size": 26 }, wItems);
    const wKt = el("text", { x: 80, y: 104, "text-anchor": "middle", style: "fill:" + P(65), "font-size": 11 }, wItems);
    // Side dial: wind along the track, one bar per waypoint, numbered
    el("circle", { cx: 80, cy: 80, r: 74, style: "fill:var(--dr-dial-face);stroke:" + P(18) }, barsSvg);
    const bItems = el("g", { class: "dr-d-items" }, barsSvg);
    const bars = WP.map((w, i) => {
      const x = 34 + i * 13.5, hh = 8 + (w.kt / 32) * 48;
      el("rect", { x: x - 4, y: 44, width: 8, height: 56, rx: 2, style: "fill:" + P(7) }, bItems);
      const r = el("rect", { x: x - 4, y: 100 - hh, width: 8, height: hh, rx: 2, class: "dr-s-bar", style: "fill:var(--dr-wind-" + (Math.min(7, Math.round((w.kt / 32) * 7)) + 1) + ")" }, bItems);
      const t = el("text", { x, y: 114, "text-anchor": "middle", style: "fill:" + P(50), "font-size": 9 }, bItems);
      t.textContent = i + 1;
      return { r, t };
    });
    el("text", { x: 80, y: 34, "text-anchor": "middle", style: "fill:" + P(75), "font-size": 10, "letter-spacing": "0.08em" }, bItems).textContent = "KT";

    function turnTo(id, target) { const s = ring[id]; s.rot += ((target - s.rot) % 360 + 540) % 360 - 180; s.g.style.transform = "rotate(" + s.rot + "deg)"; }
    function mark(id, index) { ring[id].items.forEach((t, i) => t.classList.toggle("dr-on", i === index)); }
    const rot = { course: 0, wind: 0, arrow: 0 };
    function spin(node, key, deg) { rot[key] += ((deg - rot[key]) % 360 + 540) % 360 - 180; node.style.transform = "rotate(" + rot[key] + "deg)"; }
    let current = 0;
    function show(i) {
      current = i;
      const w = WP[i];
      turnTo("r1", -ring.r1.angles[i]); mark("r1", i);
      mark("r2", Math.round(w.course / 30) % 12);
      // The tape turns to the exact course, not just the nearest label
      turnTo("r2", -w.course);
      turnTo("r3", -ring.r3.angles[w.day]); mark("r3", w.day);
      spin(courseHand, "course", 0);
      const downwind = (DIRS[w.dir] + 180) % 360;
      // On the compass card the ring has turned to the heading, so the wind is shown relative to the bow
      spin(windHand, "wind", downwind - w.course);
      spin(arrow, "arrow", downwind);
      wDir.textContent = w.dir; wKt.textContent = w.kt + " KT";
      bars.forEach(({ r, t }, k) => { r.style.opacity = k === i ? 1 : 0.35; t.style.fill = k === i ? "var(--dr-paper)" : P(45); });
      if (read("pos")) read("pos").textContent = w.pos;
      if (read("cs")) read("cs").textContent = w.arrive ? "Arrived · berth" : pad3(w.course) + "° · " + w.speed.toFixed(1) + " kt";
      if (read("wx")) read("wx").textContent = w.dir + " " + w.kt + " kt · " + w.mslp;
      if (read("eta")) read("eta").textContent = w.eta;
      steps.forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    }
    let timer = 0, resumeAt = 0, started = false, inView = false;
    const tick = () => { if (inView && !document.hidden && performance.now() >= resumeAt) show((current + 1) % WP.length); };
    const play = () => { if (!timer && !RM) timer = setInterval(tick, 3400); };
    const pause = () => { clearInterval(timer); timer = 0; };
    function intro() {
      if (started) return;
      started = true;
      if (RM) { root.classList.add("dr-is-live"); show(0); return; }
      // Names first, then each ring turns into place
      setTimeout(() => { root.classList.add("dr-is-live"); show(0); }, 500);
    }
    show(0);
    [["r1", -90], ["r2", -150], ["r3", -60]].forEach(([id, a]) => { ring[id].rot = a; ring[id].g.style.transform = "rotate(" + a + "deg)"; });
    dials.set(root, { pick: (i) => { resumeAt = performance.now() + 15000; show(i); } });
    if (io) new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) { intro(); play(); } else pause(); }, { threshold: 0.35 }).observe(root);
    else { inView = true; intro(); play(); }
  }

  /* ── Live board: a routing agent walks the fleet and types its log ── */
  function setupBoard(board) {
    const rows = all("tbody tr", board), log = board.querySelector(".dr-board-log");
    const clock = board.querySelector('[data-dr-board="clock"]'), meta = board.querySelector('[data-dr-board="meta"]');
    if (!rows.length || !log) return;
    const SPIN = "⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏";
    const STATUS = { ok: ["dr-status--ok", "On track"], hold: ["dr-status--hold", "Weather hold"], fetch: ["dr-status--fetch", "Fetching field"], solve: ["dr-status--solve", "Solving tracks"], push: ["dr-status--push", "Pushing to bridge"] };
    const windVar = (kt) => "var(--dr-wind-" + (Math.min(7, Math.max(0, Math.round((kt / 42) * 7))) + 1) + ")";
    const fleet = DATA.fleet.slice(0, rows.length).map((f, i) => {
      const hist = Array.from({ length: 24 }, (_, k) => Math.max(4, f.kt * (0.6 + 0.4 * (k / 23)) + Math.sin((i + 1) * 3.1 + k * 0.7) * 3 + Math.sin(i + 1 + k * 0.23) * 2.4));
      hist[23] = f.kt;
      const tr = rows[i];
      tr.classList.remove("dr-is-working");
      return Object.assign({}, f, { hist, row: tr, spin: tr.querySelector(".dr-spin"), status: tr.querySelector(".dr-status"), windCell: tr.querySelector(".dr-wind-cell"), deltaCell: tr.lastElementChild, deltaVal: tr.querySelector(".dr-delta-val") });
    });
    const spark = (f) => {
      const d = f.hist.map((v, k) => (k ? "L" : "M") + ((k / 23) * 72).toFixed(1) + " " + (18 - (v / 42) * 16).toFixed(1)).join("");
      return '<svg class="dr-spark" viewBox="0 0 72 18" aria-hidden="true"><path d="' + d + '" style="stroke:' + windVar(f.kt) + '"/><circle cx="72" cy="' + (18 - (f.hist[23] / 42) * 16).toFixed(1) + '" r="1.8" style="fill:' + windVar(f.kt) + '"/></svg>';
    };
    const start = Date.UTC(2026, 2, 6, 6, 0, 0), t0 = performance.now();
    const stamp = () => new Date(start + (performance.now() - t0)).toISOString().slice(11, 19) + "Z";
    const fmt = (v) => (v < 0 ? "−" : "+") + Math.abs(v).toFixed(1) + "h";
    const settled = (f) => (f.kt >= 35 ? "hold" : "ok");
    const setStatus = (f, key) => { f.status.className = "dr-status " + STATUS[key][0]; f.status.textContent = STATUS[key][1]; };
    if (clock) { clock.textContent = stamp(); setInterval(() => { if (!document.hidden) clock.textContent = stamp(); }, 1000); }
    if (RM) return;
    let running = false, spinTimer = 0, active = null, spinI = 0;
    let caret = log.querySelector(".dr-log-caret");
    function newLine() {
      if (caret) caret.classList.remove("dr-log-caret");
      const line = document.createElement("div");
      line.className = "dr-log-line dr-log-caret";
      log.appendChild(line);
      while (log.children.length > 9) log.firstChild.remove();
      return (caret = line);
    }
    const wait = (ms) => new Promise((r) => { const end = performance.now() + ms; const t = () => (performance.now() >= end && running ? r() : setTimeout(t, 60)); t(); });
    // Types a line made of [class, text] parts, two characters at a time
    function type(parts) {
      const line = newLine();
      const spans = parts.map(([cls, text]) => { const sp = document.createElement("span"); if (cls) sp.className = cls; line.appendChild(sp); return { sp, text }; });
      return new Promise((resolve) => {
        let i = 0, c = 0;
        const step = () => {
          if (!running) { setTimeout(step, 200); return; }
          if (i >= spans.length) { resolve(line); return; }
          const { sp, text } = spans[i];
          c += 2; sp.textContent = text.slice(0, c);
          if (c >= text.length) { i++; c = 0; }
          setTimeout(step, 14);
        };
        step();
      });
    }
    const who = (f) => [["dr-ts", "[" + stamp() + "] "], ["dr-who", f.slug.padEnd(15)]];
    async function work(f) {
      active = f;
      f.row.classList.add("dr-is-working");
      if (meta) meta.textContent = fleet.length + " voyages · agent on " + f.slug;
      setStatus(f, "fetch");
      await type(who(f).concat([["", "fetch field v3 @ " + f.pos + " "], ["dr-ok", "✓ 0.25°"]]));
      await wait(500);
      setStatus(f, "solve");
      const line = await type(who(f).concat([["", "solve " + (24 + Math.floor(Math.random() * 16)) + " tracks  "], ["dr-bar", "▱▱▱▱▱▱▱▱▱▱"]]));
      const bar = line.querySelector(".dr-bar");
      for (let k = 1; k <= 10; k++) { await wait(110); bar.textContent = "▰".repeat(k) + "▱".repeat(10 - k); }
      // The field moved since the last solve: wind and the best delta shift
      f.kt = Math.max(8, Math.min(42, f.kt + (Math.random() - 0.45) * 6));
      const change = (Math.random() - 0.6) * 0.6, next = Math.round((f.delta + change) * 10) / 10, course = (f.course + Math.round((Math.random() - 0.5) * 12) + 360) % 360;
      await type(who(f).concat([["", "best Δ " + signed(change, 1) + "h · course " + pad3(f.course) + "°→" + pad3(course) + "°"]]));
      f.course = course;
      await wait(350);
      setStatus(f, "push");
      await type(who(f).concat([["", "push advisory → bridge (38 kB) "], ["dr-ok", "✓ ack"]]));
      await wait(300);
      f.delta = next; f.hist.shift(); f.hist.push(f.kt);
      f.windCell.innerHTML = spark(f) + '<span class="dr-kt">' + Math.round(f.kt) + " kt</span>";
      f.deltaCell.className = f.delta > 0 ? "dr-delta dr-delta--down" : "dr-delta";
      f.deltaVal.textContent = fmt(f.delta);
      f.deltaVal.classList.remove("dr-flash"); void f.deltaVal.offsetWidth; f.deltaVal.classList.add("dr-flash");
      setStatus(f, settled(f));
      if (settled(f) === "hold") await type(who(f).concat([["dr-warn", "hold: " + Math.round(f.kt) + " kt on route, waiting for the next field"]]));
      f.row.classList.remove("dr-is-working");
      f.spin.textContent = "";
      active = null;
      if (meta) meta.textContent = fleet.length + " voyages · agent idle";
    }
    async function loop() {
      for (let i = 0; ; i += 1 + (Math.random() < 0.3 ? 1 : 0)) { await wait(700); await work(fleet[i % fleet.length]); }
    }
    let started = false;
    const setRunning = (on) => {
      running = on;
      if (on && !spinTimer) spinTimer = setInterval(() => { spinI = (spinI + 1) % SPIN.length; if (active) active.spin.textContent = SPIN[spinI]; }, 80);
      if (!on && spinTimer) { clearInterval(spinTimer); spinTimer = 0; }
    };
    if (io) {
      new IntersectionObserver((es) => { const on = es[0].isIntersecting && !document.hidden; setRunning(on); if (on && !started) { started = true; loop(); } }, { threshold: 0.15 }).observe(board);
      document.addEventListener("visibilitychange", () => setRunning(!document.hidden && started));
    } else { setRunning(true); loop(); }
  }

  /* ── Setup: one scan, re-run whenever markup is added ── */
  const seen = new WeakSet();
  const once = (el) => (seen.has(el) ? false : (seen.add(el), true));
  function scan() {
    all(".dr .dr-intro").forEach((intro) => {
      if (!once(intro)) return;
      const map = intro.querySelector(".dr-map"), wc = map && map.querySelector(".dr-wind-canvas");
      if (wc) {
        const chart = chartOverlay(intro);
        const f = makeField(map, wc, { look: "hero", cfg: modeOf(intro), dpr: 1, per: 90, max: window.innerWidth < 760 ? 1800 : 4200, over: map.querySelector(".dr-chart-overlay"), draw: chart.draw });
        f.chart = chart;
        watch(f);
      }
      const slot = intro.querySelector('[data-dr-field="slot"]'), sc = slot && slot.querySelector("canvas");
      if (sc) watch(makeField(slot, sc, { look: "hero", cfg: modeOf(intro), dpr: 2, per: 40 }));
    });
    all(".dr .dr-mini").forEach((plate) => {
      if (!once(plate)) return;
      const variant = plate.getAttribute("data-dr-variant"), cv = plate.querySelector(".dr-mini-field");
      if (!cv || !DATA.variants[variant]) return;
      watch(makeField(plate, cv, { look: variant, cfg: DATA.variants[variant], dpr: 1.5, per: variant === "systems" ? 45 : 70, over: plate.querySelector(".dr-mini-overlay"), draw: dashInstrument(plate, variant) }));
    });
    all(".dr .dr-stats").forEach((s) => once(s) && setupStats(s));
    all(".dr .dr-bridge").forEach((b) => once(b) && setupDial(b));
    all(".dr .dr-board").forEach((b) => once(b) && setupBoard(b));
  }

  /* ── Presets, the menu, waypoints and the sign-up, delegated ── */
  function setMenu(toggle, open) {
    const scope = toggle.closest(".dr-navframe") || toggle.closest(".dr");
    if (!scope) return;
    scope.classList.toggle("dr-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    const menu = scope.querySelector(".dr-menu");
    if (menu) menu.setAttribute("aria-hidden", String(!open));
  }
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t.closest || !t.closest(".dr")) return;
    const preset = t.closest(".dr-mode-panel [data-dr-mode]");
    if (preset) {
      all("[data-dr-mode]", preset.closest(".dr-mode-panel")).forEach((b) => { b.classList.toggle("dr-is-active", b === preset); b.setAttribute("aria-pressed", String(b === preset)); });
      const intro = preset.closest(".dr-intro"), mode = DATA.modes[preset.getAttribute("data-dr-mode")];
      if (intro && mode) {
        fields.forEach((f) => { if (intro.contains(f.host)) { f.setCfg(mode); if (f.chart) f.chart.reset(); } });
        all("[data-dr-mode-label]", intro).forEach((l) => (l.textContent = mode.label));
      }
      return;
    }
    const toggle = t.closest(".dr-menu-toggle");
    if (toggle) { setMenu(toggle, toggle.getAttribute("aria-expanded") !== "true"); return; }
    const wp = t.closest(".dr-wp-steps [data-dr-wp]");
    if (wp) { const d = dials.get(wp.closest(".dr-bridge")); if (d) d.pick(Number(wp.getAttribute("data-dr-wp"))); return; }
    const a = t.closest('a[href="#"]');
    if (a) {
      e.preventDefault();
      const scope = a.closest(".dr-menu-open"), tg = scope && a.closest(".dr-menu") && scope.querySelector(".dr-menu-toggle");
      if (tg) setMenu(tg, false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    all(".dr-menu-open .dr-menu-toggle[aria-expanded='true']").forEach((tg) => { setMenu(tg, false); tg.focus(); });
  });
  document.addEventListener("submit", (e) => {
    const form = e.target.closest && e.target.closest(".dr .dr-signup");
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const label = form.querySelector(".dr-btn .dr-text");
    if (label) label.textContent = "Berth requested";
    const status = form.parentElement.querySelector(".dr-form-status");
    if (status) status.textContent = "Logged. We route your next leg alongside your current provider and send both tracks.";
  });

  scan();
  let queued = false;
  new MutationObserver(() => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); }).observe(document.documentElement, { childList: true, subtree: true });
}
const JS = `(function () {
  'use strict';
  var DATA = ${JSON.stringify(DATA)};
  (${driftComponents.toString()})(DATA);
})();`;
// Every dr- class the script writes must exist in the CSS or the markup
{
  const known = componentCss + C.map((c) => c.markup).join("");
  const missing = [...new Set([...JS.matchAll(/["' ]\.?(dr-[a-z][\w-]*)/g)].map((m) => m[1]))]
    .filter((n) => !/^dr-(wind-\d|field-|glacier|aurora|moss|ship|paper|plate|low|high|bg|ink|dial-face)/.test(n) && !known.includes(n));
  if (missing.length) console.warn("script classes not in the CSS or markup:", missing.join(" "));
}

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own hero, its words swapped for the system's
const HERO = asDiv(piece('<section class="intro"'))
  .replace('aria-label="Route the weather. Not around it."', 'aria-label="Drift design system. Read the wind."')
  .replace('<span class="word">Route</span>', '<span class="word">Drift</span>')
  .replace('<span class="word">the</span>', '<span class="word">design</span>')
  .replace('<span class="word">weather.</span>', '<span class="word">system.</span>')
  .replace('<span class="word">Not around it.</span>', '<span class="word">Read the wind.</span>')
  .replace(/(<p class="lede">)[^<]*/, "$1A living wind field, mono readouts, legends and scales, and one cream pill. Tokens and working components extracted from the Drift weather-routing page.")
  .replace(/<div class="hero-actions">[\s\S]*?<\/div>/, `<div class="hero-actions">\n<a class="dl dl--mac" href="#c-hero"><span>See the components</span></a>\n<a class="dl dl--win" href="#c-legend"><span>Legends &amp; scales</span></a>\n</div>`);
if (!HERO.includes("See the components") || !HERO.includes(">Drift<")) throw new Error("specimen hero swap failed");
const CHROME = `
body{margin:0;background:var(--dr-bg)}
.sp-top{position:relative}
.sp-meta{position:absolute;z-index:6;top:22px;left:0;right:0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;width:min(var(--dr-wrap),100% - 2 * var(--dr-gutter));margin:0 auto;pointer-events:none}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;font:400 var(--dr-label)/1.4 var(--dr-font-mono);text-transform:uppercase;letter-spacing:var(--dr-track-label);color:var(--dr-muted)}
.sp-label::before{content:"";width:18px;height:6px;background:linear-gradient(90deg,var(--dr-wind-1),var(--dr-wind-4),var(--dr-wind-8))}
.sp-main{width:min(var(--dr-wrap),100% - 2 * var(--dr-gutter));margin:0 auto;padding:24px 0 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:24px}
.sp-head h2{margin:10px 0 0;font:600 38px/1 var(--dr-font-display);font-stretch:var(--dr-stretch);text-transform:uppercase;color:var(--dr-paper)}
.sp-note{margin:0;max-width:680px;font:400 15px/1.6 var(--dr-font-body);color:color-mix(in oklab,var(--dr-paper) 74%,transparent)}
.sp-demo{position:relative;overflow:clip;padding:clamp(18px,3vw,36px);background:var(--dr-bg);border:1px solid var(--dr-rule)}
#c-nav .sp-demo,#c-hero .sp-demo,#c-stats .sp-demo,#c-footer .sp-demo{padding:0}
.sp-demo>.dr-band{padding-block:clamp(8px,2vw,16px);border:0}
.sp-demo>.dr-band--quiet{margin:calc(-1 * clamp(18px,3vw,36px));padding:clamp(26px,4vw,48px) clamp(18px,3vw,36px)}
.sp-demo>.dr-band>.dr-shell{inline-size:auto}
.sp-demo>.dr-stats{border-block:0}
@media (max-width:809px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-head h2{font-size:28px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">drift@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(HERO))}
</header>`;
const DEFS = `<svg id="dr-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"></svg>`;
const specimen = renderSpecimen({
  name: "Drift",
  slug: "drift",
  version: VERSION,
  prefix: "dr",
  rootClass: "dr",
  labelClass: "sp-label",
  script: "scripts/systems/drift.mjs",
  source: SOURCE,
  metaDescription: "The Drift design system: tokens and working components extracted from the Drift weather-routing page.",
  defsNote: "empty: Drift draws its fields in Canvas 2D and its dials and charts in inline SVG, inside each component",
  jsNote: "the wind fields (hero, headline slot, three dashboards), the chart overlay and route solve, presets, stats reveal and heat grid, the bridge dial, the live board's agent, the menu and the sign-up",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});
if (/base64|gsap|webgl/i.test(specimen.replace(/WebGL/g, ""))) throw new Error("the specimen carries a library or WebGL");

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "drift", prefix: "dr", rootClass: "dr", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "dl", "nav", "menu", "intro", "map", "stats", "stat", "panel", "mini", "board", "sheet", "bridge", "legend", "code", "faq", "footer", "shell", "band", "status", "live"] });
