// Extracts the Ostler design system from its landing page.
//
//   node scripts/systems/ostler.mjs
//
// Reads public/demos/ostler-hotel-concierge.html (never edits it) and writes
// public/systems/ostler/ (specimen.html, tokens.css, ostler.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell (html, main's section spacing, the scroll
// progress bar and the sprite helper) and turns the page's GSAP choreography
// into CSS driven by a few custom properties:
// - GSAP, ScrollTrigger, SplitText and Lenis do not come along. SplitText's
//   letters are split here at build time with the page's own seeded random
//   (rnd(i)), so every fill word keeps its tilted stance with no script, and
//   the hero's "Ostler" springs into it (an elastic linear() easing sampled
//   from GSAP's elastic.out(1, .45)) and rocks, all in CSS.
// - The page pins its hero, module rail and "Awake" statement. Pinning needs a
//   tall section, which a component cannot carry into a host or a board panel,
//   so here nothing pins: the component script writes each component's scroll
//   progress (--os-p and friends) as it crosses the viewport and CSS maps it to
//   the same moves (the hero card shrinks and tilts while its letters fly off,
//   the knockout word zooms 9x, the step cards scale and tilt away, the prints
//   drift at their data-speed). The module rail becomes a real sideways
//   scroller whose covers tilt and whose words drift as they cross it.
// - Reveals (data-os-reveal up|tag|wipe|drop, data-os-split, data-os-rule and
//   dropped letters) only hide what is still below the viewport when the
//   script arms them, so nothing is ever hidden without the script.
// - The 6% film grain is .os-grain on a root (the specimen's); it is fixed to
//   the viewport, so it is opt-in rather than on every .os.
// Every picture is the page's inline SVG; its ids move under os- and the
// shared filters and gradients become <svg id="os-defs">.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/ostler-hotel-concierge.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Gabarito:wght@500..900&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap";
if (!page.includes(FONTS_HREF)) throw new Error("font link not found");
const FONTS = `<link href="${FONTS_HREF}" rel="stylesheet">`;

/* ── 0. The page's easings, sampled into CSS linear() ─────────────────── */
// GSAP's elastic.out(1, .45) (the hero's spring and the dropped letters) and
// back.out(2.2) (the bouncing words and price tags), exactly as GSAP defines them
const elasticOut = (period) => (t) => (t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t - period / 4) * ((2 * Math.PI) / period)) + 1);
const backOut = (o) => (t) => (t ? (t - 1) * (t - 1) * ((o + 1) * (t - 1) + o) + 1 : 0);
const sample = (f, n) => `linear(${Array.from({ length: n + 1 }, (_, i) => +f(i / n).toFixed(3)).join(", ")})`;
const ELASTIC = sample(elasticOut(0.45), 48);
const BACK = sample(backOut(2.2), 24);

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   The page's :root names move under os- (--r -> --os-radius, --r-s ->
   --os-radius-print, --out -> --os-ease-out); its literal colours, sizes,
   shadows and timings get names. Group comments are what the SYSTEMS board
   lays its panels out by. */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const TOKENS = `/* InstaLanding design system · Ostler · ostler@${VERSION}
   Extracted from https://instalanding.ai/demos/ostler-hotel-concierge.html
   Fonts: Gabarito 500-900, Instrument Sans 400-700 with italics (Google Fonts) */
:root {
  /* Color · core */
  --os-ink: #100C0D;
  --os-red: #A72D2D;
  --os-red-deep: #7A2222;
  --os-cream: #E2DCCE;
  --os-olive: #5B6A45;
  --os-white: #FFFFFF;

  /* Color · night */
  --os-lobby: #2A0D0F;
  --os-lobby-deep: #1D0A0B;
  --os-online: #9FD18B;
  --os-glass: rgba(16, 12, 13, 0.62);

  /* Color · lines */
  --os-muted: color-mix(in oklab, currentColor 72%, transparent);
  --os-line: color-mix(in oklab, currentColor 26%, transparent);

  /* Type · families */
  --os-font-display: "Gabarito", system-ui, sans-serif;
  --os-font-text: "Instrument Sans", system-ui, sans-serif;
  --os-font-serif: Georgia, "Times New Roman", serif;

  /* Type · scale */
  --os-wordmark: clamp(56px, 9vw, 150px);
  --os-day: clamp(52px, 6vw, 100px);
  --os-h2: clamp(40px, 6vw, 96px);
  --os-stat: clamp(44px, 4.6vw, 76px);
  --os-step: clamp(38px, 4.2vw, 70px);
  --os-price: clamp(36px, 3.8vw, 60px);
  --os-ticker: clamp(26px, 3.4vw, 52px);
  --os-statement: clamp(28px, 3vw, 46px);
  --os-title: clamp(28px, 3vw, 44px);
  --os-menu: clamp(30px, 8vw, 44px);
  --os-h3: clamp(24px, 2.3vw, 34px);
  --os-row: clamp(22px, 2.1vw, 32px);
  --os-question: clamp(21px, 2vw, 30px);
  --os-quote: clamp(20px, 1.7vw, 25px);
  --os-lead: clamp(18px, 1.5vw, 21px);
  --os-brand: 27px;
  --os-body: 17px;
  --os-small: 15px;
  --os-caption: 14px;
  --os-label: 13px;

  /* Type · fill */
  --os-k: 0.52;

  /* Shape · radii */
  --os-radius: clamp(20px, 2.3vw, 34px);
  --os-radius-print: clamp(12px, 1.2vw, 18px);
  --os-radius-pill: 999px;
  --os-radius-logo: 5px;
  --os-radius-diamond: 2px;

  /* Shape · borders */
  --os-stroke: 1.5px;
  --os-mark: clamp(7px, 0.65vw, 10px);

  /* Depth · prints and glass */
  --os-shadow-cover: 0 40px 70px -40px rgba(0, 0, 0, 0.8);
  --os-shadow-shot: 0 30px 60px -28px rgba(0, 0, 0, 0.85);
  --os-shadow-print: 0 30px 60px -30px rgba(16, 12, 13, 0.55);
  --os-shadow-header: inset 0 0 0 1px color-mix(in oklab, var(--os-cream) 10%, transparent), 0 10px 30px -12px rgba(0, 0, 0, 0.6);

  /* Texture · grain */
  --os-grain: ${GRAIN};

  /* Motion · easing */
  --os-spring: cubic-bezier(0.34, 1.56, 0.5, 1);
  --os-ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --os-ease-reveal: cubic-bezier(0.215, 0.61, 0.355, 1);
  --os-ease-wipe: cubic-bezier(0.645, 0.045, 0.355, 1);
  --os-sine: cubic-bezier(0.37, 0, 0.63, 1);
  --os-elastic: ${ELASTIC};
  --os-back: ${BACK};

  /* Motion · durations */
  --os-dur-fade: 0.3s;
  --os-dur-color: 0.35s;
  --os-dur-menu: 0.4s;
  --os-dur-nudge: 0.45s;
  --os-dur-tilt: 0.5s;
  --os-dur-fill: 0.55s;
  --os-dur-wobble: 0.6s;
  --os-dur-pop: 0.8s;
  --os-dur-bounce: 0.95s;
  --os-dur-reveal: 1s;
  --os-dur-rule: 1.1s;
  --os-dur-grain: 1.2s;
  --os-dur-drop: 1.3s;
  --os-dur-spring: 1.5s;
  --os-dur-rock-delay: 1.9s;
  --os-dur-pulse: 2.2s;
  --os-dur-rock: 2.4s;
  --os-dur-voice: 4.5s;
  --os-dur-breathe: 9s;
  --os-dur-ticker: 52s;

  /* Space · layout */
  --os-gap: clamp(10px, 1.4vw, 20px);
  --os-pad: clamp(22px, 4.4vw, 72px);
  --os-head: 68px;
  --os-hero-h: calc(100svh - var(--os-head) - 2 * var(--os-gap));
  --os-stage-h: max(min(100svh, 900px), 640px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────────
   Done in the page's own vocabulary first (var(--red), var(--spring) ...),
   then every custom property moves under os- and the literal hexes become tokens. */
const VARS = { r: "radius", "r-s": "radius-print", out: "ease-out" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("os-") ? m : `--os-${VARS[n] ?? n}`));
const HEX = { "#2a0d0f": "lobby", "#1d0a0b": "lobby-deep", "#9fd18b": "online", "#fff": "white" };
// [from, to, expected count] in the page's vocabulary; every one must be found
const RAW_SWAPS = [
  // The grain: on the page it covers the body; here it is opt-in on a root
  [/body::after\{content:"";position:fixed;inset:-60px;z-index:90;pointer-events:none;opacity:\.06;background-image:url\("data:[^"]*"\)\}/, '.os.grain::after{content:"";position:fixed;inset:-60px;z-index:90;pointer-events:none;opacity:.06;background-image:var(--grain)}', 1],
  [".motion body::after{animation:grain 1.2s steps(6) infinite}", ".os.grain::after{animation:grain var(--dur-grain) steps(6) infinite}", 1],
  ['.art text{font-family:"Instrument Sans",system-ui,sans-serif}', ".art text{font-family:var(--font-text)}", 1],
  ['.art .d{font-family:"Gabarito",system-ui,sans-serif}', ".art .d{font-family:var(--font-display)}", 1],
  ['font-family:Georgia, "Times New Roman", serif', "font-family:var(--font-serif)", 1],
  // Type
  ["font:400 17px/1.55 var(--font-text)", "font:400 var(--body)/1.55 var(--font-text)", 1],
  ["font-size:clamp(40px, 6vw, 96px)", "font-size:var(--h2)", 1],
  ["font-size:clamp(24px, 2.3vw, 34px)", "font-size:var(--h3)", 1],
  ["font-size:clamp(18px, 1.5vw, 21px)", "font-size:var(--lead)", 1],
  ["font:600 13px/1 var(--font-text)", "font:600 var(--label)/1 var(--font-text)", 1],
  ["font:500 15px/1 var(--font-text)", "font:500 var(--small)/1 var(--font-text)", 1],
  ["font-size:27px", "font-size:var(--brand)", 1],
  ["font:800 clamp(30px, 8vw, 44px)/1.1 var(--font-display)", "font:800 var(--menu)/1.1 var(--font-display)", 1],
  ["font-size:clamp(28px, 3vw, 44px)", "font-size:var(--title)", 1],
  ["font:800 clamp(26px,3.4vw,52px)/1 var(--font-display)", "font:800 var(--ticker)/1 var(--font-display)", 1],
  ["font-size:clamp(44px, 4.6vw, 76px)", "font-size:var(--stat)", 1],
  ["font-size:clamp(22px, 2.1vw, 32px)", "font-size:var(--row)", 2],
  ["font-size:clamp(36px, 3.8vw, 60px)", "font-size:var(--price)", 1],
  ["font-size:clamp(28px, 3vw, 46px)", "font-size:var(--statement)", 1],
  ["font-size:clamp(38px, 4.2vw, 70px)", "font-size:var(--step)", 1],
  ["font-size:clamp(52px, 6vw, 100px)", "font-size:var(--day)", 1],
  ["font-size:clamp(20px, 1.7vw, 25px)", "font-size:var(--quote)", 1],
  ["font-size:clamp(21px, 2vw, 30px)", "font-size:var(--question)", 1],
  ["font-size:clamp(56px, 9vw, 150px)", "font-size:var(--wordmark)", 1],
  ["font-size:15px", "font-size:var(--small)", 5],
  ["font-size:14px", "font-size:var(--caption)", 0],
  ["font-size:13px", "font-size:var(--label)", 1],
  ["padding:8px 0 10px;font-size:17px", "padding:8px 0 10px;font-size:var(--body)", 1],
  // Shape
  ["border-radius:999px", "border-radius:var(--radius-pill)", 0],
  ["border-radius:2px", "border-radius:var(--radius-diamond)", 2],
  ["border-radius:5px", "border-radius:var(--radius-logo)", 1],
  ["1.5px solid", "var(--stroke) solid", 14],
  ["inset 0 0 0 1.5px var(--cream)", "inset 0 0 0 var(--stroke) var(--cream)", 1],
  // Depth and literal colours
  ["box-shadow:inset 0 0 0 1px color-mix(in oklab, var(--cream) 10%, transparent),0 10px 30px -12px rgba(0,0,0,.6)", "box-shadow:var(--shadow-header)", 1],
  ["box-shadow:0 30px 60px -30px rgba(16,12,13,.55)", "box-shadow:var(--shadow-print)", 1],
  ["box-shadow:0 40px 70px -40px rgba(0,0,0,.8)", "box-shadow:var(--shadow-cover)", 1],
  ["box-shadow:0 30px 60px -28px rgba(0,0,0,.85)", "box-shadow:var(--shadow-shot)", 1],
  ["background:rgba(16,12,13,.62)", "background:var(--glass)", 1],
  ["box-shadow:0 0 0 0 rgba(159,209,139,.7)", "box-shadow:0 0 0 0 color-mix(in srgb, var(--online) 70%, transparent)", 1],
  ["rgba(159,209,139,0)", "transparent", 2],
  // Motion
  ["transition:transform .5s var(--spring),color .35s", "transition:transform var(--dur-tilt) var(--spring),color var(--dur-color)", 1],
  ["transition:clip-path .55s var(--out)", "transition:clip-path var(--dur-fill) var(--out)", 1],
  ["transition:transform .45s var(--spring)", "transition:transform var(--dur-nudge) var(--spring)", 2],
  ["transition:text-decoration-color .3s", "transition:text-decoration-color var(--dur-fade)", 1],
  ["animation:wobble .6s var(--spring)", "animation:wobble var(--dur-wobble) var(--spring)", 2],
  ["transition:transform .4s var(--spring)", "transition:transform var(--dur-menu) var(--spring)", 1],
  ["transition:opacity .3s,transform .5s var(--spring),visibility 0s .3s", "transition:opacity var(--dur-fade),transform var(--dur-tilt) var(--spring),visibility 0s var(--dur-fade)", 1],
  ["transition:opacity .3s,transform .5s var(--spring)}", "transition:opacity var(--dur-fade),transform var(--dur-tilt) var(--spring)}", 1],
  ["animation:pulse 2.2s infinite", "animation:pulse var(--dur-pulse) infinite", 1],
  ["animation:tick 52s linear infinite", "animation:tick var(--dur-ticker) linear infinite", 1],
  ["transition:border-color .3s", "transition:border-color var(--dur-fade)", 1],
  // The header sits in flow; .hdr--fixed pins it, and its dropdown hangs from the bar, not the viewport
  [".hdr{position:fixed;inset:0 0 auto;", ".hdr{position:relative;", 1],
  [".hdr__nav{position:fixed;top:calc(var(--head) + 6px)", ".hdr__nav{position:absolute;top:calc(var(--head) + 6px)", 1],
  // The hero: no pin and no fixed-header offset; it is as tall as --hero-h
  [".hero{padding-top:var(--head)}", ".hero{position:relative;overflow-x:clip}", 1],
  ["height:calc(100svh - var(--head) - 2 * var(--gap));min-height:620px", "height:var(--hero-h);min-height:620px", 1],
  ["min-height:calc(100svh - var(--head) - 2 * var(--gap))", "min-height:var(--hero-h)", 1],
  // The module rail is a sideways scroller (the page's pinned layout, without the pin)
  [".rails__track{display:grid;grid-template-columns:repeat(auto-fill, minmax(min(100%, 300px), 1fr));gap:var(--gap) calc(var(--gap) * 1.5);padding:0 var(--gap)}",
    ".rails__track{display:flex;align-items:center;width:max-content;gap:clamp(20px, 3vw, 48px);padding:0 max(var(--gap), 4vw)}", 1],
  [".motion .rails__intro{width:min(440px, 78vw);flex:none}", ".rails__intro{width:min(440px, 78vw);flex:none}", 1],
  [".motion .cover{width:clamp(270px, min(29vw, 52svh), 420px);flex:none;will-change:transform}", ".cover{width:clamp(270px, min(29vw, 52svh), 420px);flex:none}", 1],
  ["@media (max-width:700px){.motion .cover{width:min(80vw, 42svh);aspect-ratio:2/3}}", "@media (max-width:700px){.cover{width:min(80vw, 42svh);aspect-ratio:2/3}}", 1],
  // The statement stage is --stage-h tall and never pinned
  [".again__stage{position:relative;height:max(100svh, 640px);", ".again__stage{position:relative;height:var(--stage-h);", 1],
  [".motion .again__knock{will-change:transform}", ".again__knock{will-change:transform}", 1],
  // The step cards stack as they scroll (sticky needs no script)
  [".motion .step{position:sticky;", ".step{position:sticky;", 1],
  // The quote marquee runs once the script has cloned its cards (.is-run)
  [".motion .voices__list{display:flex;width:max-content;gap:0;padding:0}", ".voices__list.is-run{display:flex;width:max-content;gap:0;padding:0;animation:os-voices calc(var(--n, 6) * var(--dur-voice)) linear infinite}", 1],
  [".motion .voice{width:clamp(270px, 26vw, 380px);margin-right:var(--gap)}", ".voices__list.is-run .voice{flex:none;width:clamp(270px, 26vw, 380px);margin-right:var(--gap)}", 1],
  // main > * gave the gallery its positioning and clipping
  [".lookbook{display:grid;", ".lookbook{position:relative;overflow:clip;display:grid;", 1],
];
let raw = pageCss;
for (const [from, to, n] of RAW_SWAPS) {
  if (from instanceof RegExp) {
    const count = (raw.match(new RegExp(from.source, "g")) || []).length;
    if (count !== n) throw new Error(`expected ${n} of ${from}, found ${count}`);
    raw = raw.replace(from, to);
    continue;
  }
  const count = raw.split(from).length - 1;
  if (count === 0 && n !== 0) throw new Error("css not found: " + from.slice(0, 70));
  if (n && count !== n) throw new Error(`expected ${n} of "${from.slice(0, 50)}", found ${count}`);
  raw = raw.split(from).join(to);
}

/* ── 3. Component CSS: the page's one <style>, minus the shell, plus the motion ── */
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
// Page-only: the document shell, :root (now the tokens), main's section spacing, the scroll
// progress bar, the sprite helper (the sprite is #os-defs) and every pinned or will-change .motion rule
const DROP = /^(html|:root|main>\*|main>\*\+\*|\.progress|\.sprite|\.hero>\*|\.motion .*)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.os, .os *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.os, .os *)${sel.slice(1)}`;
  if (sel === "body") return ".os";
  return sel;
}
const squash = (s) => s.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim();
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = squash(rule.slice(0, at));
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return `${prelude} {${squash(body)}}`;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(", ")} { ${squash(body)} }` : "";
  }).filter(Boolean).join("\n");
}

// The page's GSAP moves, as CSS reading the progress the component script writes.
// Written in the page's vocabulary; keyframes added here are already os- prefixed.
const MOTION_CSS = `
.hdr--fixed{position:fixed;inset:0 0 auto}
.char{display:inline-block;rotate:var(--r, 0deg);translate:0 var(--y, 0%)}
.hero__card{transform:translateY(calc(var(--pe, 0) * 2%)) rotate(calc(var(--pe, 0) * -2.5deg)) scale(calc(1 - var(--pe, 0) * var(--shrink, .14)))}
.hero__photo .art{animation:os-breathe var(--dur-breathe) var(--sine) infinite alternate;translate:0 calc(var(--p, 0) * 6%)}
.hero__info,.hero__side{translate:0 calc(var(--pe, 0) * -40%);opacity:calc(1 - var(--pe, 0))}
.hero__ch{display:inline-block;translate:calc(var(--fx) * var(--pf, 0)) calc(var(--fy) * var(--pf, 0));rotate:calc(var(--fr) * var(--pf, 0))}
.hero__chi{display:inline-block;rotate:var(--r);translate:0 var(--y);animation:os-spring var(--dur-spring) var(--elastic) calc(100ms + var(--i) * 70ms) both, os-rock var(--dur-rock) var(--sine) calc(var(--dur-rock-delay) + var(--i) * 400ms) infinite alternate}
.hero.is-flying .hero__wordclip{clip-path:inset(-300% -30% -200% -30%)}
.hero.is-paused .hero__chi{animation-play-state:running, paused}
.hero.is-paused .hero__photo .art{animation-play-state:paused}
.ticker.is-paused .ticker__track{animation-play-state:paused}
@keyframes os-spring{from{rotate:0deg;translate:0 0}}
@keyframes os-rock{from{rotate:var(--r)}to{rotate:var(--r2)}}
@keyframes os-breathe{to{scale:1.045}}
@keyframes os-voices{to{translate:-50% 0}}
@media (max-width:699px){.hero__card{--shrink:.1}}
.rails__pin{position:relative;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x proximity;scroll-padding-inline:max(var(--gap), 4vw);padding:clamp(30px, 4vw, 56px) 0;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.rails__pin.is-dragging{scroll-snap-type:none;cursor:grabbing;user-select:none}
.rails__intro{scroll-snap-align:start}
.cover{scroll-snap-align:center;rotate:calc(var(--tilt, 0) * 1deg);translate:0 calc(var(--lift, 0) * 1%)}
.cover__word{translate:calc(var(--drift, 0) * 1%) 0}
.cover__photo .art{translate:calc(var(--pan, 0) * 1%) 0}
.again__knock{scale:calc(1 + 8 * var(--z, 0));opacity:calc(1 - var(--fade, 0))}
.again__photo .art{scale:calc(1.3 - .3 * var(--q, 1))}
.again__card{translate:0 calc((1 - var(--rise, 1)) * 135%);rotate:calc((1 - var(--rise, 1)) * 5deg)}
.step{scale:calc(1 - .08 * var(--s, 0));rotate:calc(var(--sdir, -1) * 2.2deg * var(--s, 0));translate:0 calc(-2% * var(--s, 0))}
.step:nth-child(even){--sdir:1}
.shot{translate:0 calc(var(--speed, 0) * var(--p, 0) * -100%)}
[data-os-parallax] .art{scale:1.16;translate:0 calc((var(--p, .5) * 14 - 7) * 1%)}
.word{display:inline-block}
.is-armed[data-os-reveal="up"]:not(.is-in){translate:0 44px;opacity:0}
[data-os-reveal="up"].is-in{transition:translate var(--dur-reveal) var(--ease-reveal) var(--d, 0ms),opacity var(--dur-reveal) var(--ease-reveal) var(--d, 0ms)}
[data-os-reveal="tag"]{transform-origin:70% 50%}
.is-armed[data-os-reveal="tag"]:not(.is-in){scale:.4;rotate:-14deg;opacity:0}
[data-os-reveal="tag"].is-in{transition:scale var(--dur-pop) var(--back) var(--d, 0ms),rotate var(--dur-pop) var(--back) var(--d, 0ms),opacity var(--dur-fade) linear var(--d, 0ms)}
.is-armed[data-os-reveal="wipe"]:not(.is-in){clip-path:inset(0 100% 0 0)}
[data-os-reveal="wipe"].is-in{transition:clip-path var(--dur-reveal) var(--ease-wipe) var(--d, 0ms)}
.is-armed[data-os-reveal="drop"]:not(.is-in){translate:0 -18%;rotate:9deg;scale:1.08;opacity:0}
[data-os-reveal="drop"].is-in{transition:translate var(--dur-drop) var(--spring),rotate var(--dur-drop) var(--spring),scale var(--dur-drop) var(--spring),opacity var(--dur-fade) linear}
[data-os-rule]{transform-origin:0 50%}
.is-armed[data-os-rule]:not(.is-in){scale:0 1}
[data-os-rule].is-in{transition:scale var(--dur-rule) var(--ease-wipe) var(--d, 0ms)}
.is-armed[data-os-split]:not(.is-in) .word{translate:0 80%;rotate:var(--r0);opacity:0}
[data-os-split].is-in .word{transition:translate var(--dur-bounce) var(--back) var(--d),rotate var(--dur-bounce) var(--back) var(--d),opacity var(--dur-fade) linear var(--d)}
.is-armed[data-os-bounce="drop"]:not(.is-in) .char{translate:0 -150%;rotate:var(--r0);opacity:0}
[data-os-bounce="drop"].is-in .char{transition:translate var(--dur-drop) var(--elastic) var(--d),rotate var(--dur-drop) var(--elastic) var(--d),opacity var(--dur-fade) linear var(--d)}
@media (prefers-reduced-motion:reduce){.hero__chi,.hero__photo .art,.voices__list.is-run{animation:none}.os.grain::after{animation:none}}`;

const base = renameVars(keep((raw + "\n" + MOTION_CSS).replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
let H = page.slice(BODY);
// SVG ids (filters, gradients, symbols) move under os-, with every reference to them
const SVG_IDS = new Set();
for (const m of H.matchAll(/<svg[\s\S]*?<\/svg>/g)) for (const i of m[0].matchAll(/ id="([^"]+)"/g)) SVG_IDS.add(i[1]);
for (const id of SVG_IDS) {
  if (H.includes(`href="#${id}"`) && !H.includes(`<use href="#${id}"`)) throw new Error("svg id is also an anchor: " + id);
  H = H.split(` id="${id}"`).join(` id="os-${id}"`).split(`url(#${id})`).join(`url(#os-${id})`).split(`href="#${id}"`).join(`href="#os-${id}"`);
}

// SplitText, at build time: the page's seeded random gives every letter its stance
const rnd = (i) => { const x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
const f = (v, unit) => `${+v.toFixed(2)}${unit}`;
const letters = (text) => [...text].map((c) => (c === " " ? null : c));
// "still" words hold the stance; "drop" words fall into it, in a random order, when they arrive
function splitChars(text, kind) {
  const chars = letters(text);
  const n = chars.filter(Boolean).length;
  const order = [...Array(n).keys()].sort((a, b) => rnd(a + 21) - rnd(b + 21));
  let i = -1;
  return chars.map((c) => {
    if (!c) return " ";
    i++;
    const st = `--r:${f((rnd(i) - 0.5) * 16, "deg")};--y:${f((rnd(i + 11) - 0.5) * 14, "%")}`;
    const drop = kind === "drop" ? `;--r0:${f((rnd(i + 3) - 0.5) * 80, "deg")};--d:${order.indexOf(i) * 60}ms` : "";
    return `<span class="char" aria-hidden="true" style="${st}${drop}">${c}</span>`;
  }).join("");
}
// The hero word: an outer span that flies off on scroll and an inner one that springs and rocks
function heroChars(text) {
  let i = -1;
  return letters(text).map((c) => {
    if (!c) return " ";
    i++;
    const r = (rnd(i) - 0.5) * 16;
    const fly = `--fx:${f((rnd(i + 8) - 0.5) * 60, "%")};--fy:${f(-(120 + rnd(i + 2) * 190), "%")};--fr:${f((rnd(i + 1) - 0.5) * 70, "deg")}`;
    const inner = `--i:${i};--r:${f(r, "deg")};--r2:${f(r + (rnd(i + 5) > 0.5 ? 3 : -3), "deg")};--y:${f((rnd(i + 11) - 0.5) * 14, "%")}`;
    return `<span class="hero__ch" aria-hidden="true" style="${fly}"><span class="hero__chi" style="${inner}">${c}</span></span>`;
  }).join("");
}
const splitBounce = (html) => html
  .replace(/(<(h[1-6]|p)( [^>]*)data-bounce="(still|drop)"([^>]*))>([^<]+)<\/\2>/g, (_, open, tag, _a, kind, _b, text) => `${open} aria-label="${text}">${splitChars(text, kind)}</${tag}>`)
  .replace(/(<h1 class="hero__word[^"]*"[^>]*)>([^<]+)<\/h1>/g, (_, open, text) => `${open} aria-label="${text}">${heroChars(text)}</h1>`);

// Section anchors become "#"; the page's section ids and markers go (SVG ids, now os-, stay)
const unhook = (html) => splitBounce(html)
  .replace(/ data-(section|kind|fixed)="[^"]*"/g, "")
  .replace(/ id="(?!os-)[^"]*"/g, "")
  .replace(/ aria-controls="nav"/g, "")
  .replace(/ href="#(?!os-)[a-z]*"/g, ' href="#"')
  .replace(/\n {2,}/g, "\n");
const piece = (marker) => sliceEl(H, marker, 0).html;
const asDiv = (html) => html.replace(/^<(section|footer)/, "<div").replace(/<\/(section|footer)>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const HERO = piece('<section id="hero"');
const ARROW = sliceEl(HERO, '<svg class="btn__arrow"', 0).html;
const LOBBY = sliceEl(HERO, '<figure class="hero__photo">', 0).html;

add("nav", "Header bar & menu", "A rounded ink bar, blurred over whatever scrolls under it (--os-shadow-header): the red diamond and Gabarito 900 wordmark, five links that turn wavy on hover, and the cream Book a demo pill. Under 900px the links fold into a cream dropdown card of large Gabarito links (tilted in on --os-spring) behind a two-line icon button that crosses; Escape closes it. It sits in flow; add .os-hdr--fixed to pin it to the top of the page.",
  piece('<header class="hdr"'), { js: true });

add("buttons", "Pill buttons, links & icon buttons", "One button: the outlined pill (.os-btn) with a drawn arrow. On hover a circle of fill grows from the arrow end (--os-dur-fill on --os-ease-out), the pill tilts -3deg on --os-spring and the arrow nudges right; .os-btn--solid starts filled. On a cream card (.os-on-cream) the pill fills ink and the solid one turns red. Text links (.os-link) carry a quiet underline that turns wavy; icon buttons (.os-icon-btn) wobble.",
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:var(--gap);margin:0 var(--gap)">
<div class="card on-red" style="margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:18px 22px"><a class="btn" href="#"><span>See the product</span>${ARROW}</a><a class="btn btn--solid" href="#"><span>Book a demo</span>${ARROW}</a><a class="link" href="#">What shipped this month</a></div>
<div class="card on-cream" style="margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:18px 22px"><a class="btn" href="#"><span>See how it works</span>${ARROW}</a><a class="btn btn--solid" href="#"><span>Request a demo</span>${ARROW}</a><a class="link" href="#">Get a quote for your hotel</a></div>
<div class="card on-olive" style="margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:18px 22px"><a class="btn" href="#"><span>Get a quote</span>${ARROW}</a><button class="icon-btn" type="button" aria-label="Next">${ARROW.replace('class="btn__arrow"', 'class="btn__arrow" style="width:20px"')}</button><a class="link" href="#">Hear from their teams</a></div>
</div>`);

add("type", "Fill-type, headings & labels", "Display words are Gabarito 900 at line-height .8 and -0.045em, sized to fill their box exactly: put the word in a .os-fillbox (a container) and give it .os-display.os-fill and --os-len, its letter count; font-size is 100cqi / (--os-len x --os-k). Its letters stand slightly tilted, each at its own angle (the page's seeded stance). Headings are Gabarito 800 (.os-h2, .os-h3), copy is Instrument Sans (.os-lead at 500, .os-muted for the quieter line) and labels are small caps-spaced (.os-eyebrow).",
  `<div style="display:grid;gap:clamp(26px,3.6vw,48px);padding:var(--pad) calc(var(--gap) + var(--pad) * .5)">
<p class="eyebrow">Fill-type · Gabarito 900 · --k .52</p>
<div class="fillbox"><p class="display fill" style="--len:9" data-bounce="still">Concierge</p></div>
<h2 class="h2" style="max-width:18ch">Guests don't want another app. They want an answer at 2am.</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px 48px;align-items:start">
<h3 class="h3">It learns your hotel</h3>
<p class="lead">Ostler answers guest messages in 41 languages, books the extras and hands the tricky ones to your team.</p>
<p class="muted">Anything else? Ask us on a call, or write and a person will answer within one working day.</p>
</div>
</div>`);

add("cards", "Section cards & corner marks", "Every section is a rounded card (--os-radius) inset from the page by --os-gap and padded by --os-pad, on the ink page: .os-card with .os-on-red, .os-on-cream or .os-on-olive, which also re-points currentColor, so --os-line and --os-muted follow. .os-marks adds the two small square corner marks (--os-mark), top right and bottom left. Pictures inside sit in .os-print frames (--os-radius-print).",
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:var(--gap);margin:0 var(--gap)">
<div class="card on-red marks" style="margin:0;display:grid;gap:18px;align-content:space-between;min-height:260px"><p class="eyebrow">.os-on-red</p><p class="h3">Shipped in October</p><p class="muted">We release every Thursday.</p></div>
<div class="card on-cream marks" style="margin:0;display:grid;gap:18px;align-content:space-between;min-height:260px"><p class="eyebrow">.os-on-cream</p><p class="h3">Asked in every demo</p><p class="muted">A person answers within a day.</p></div>
<div class="card on-olive marks" style="margin:0;display:grid;gap:18px;align-content:space-between;min-height:260px"><p class="eyebrow">.os-on-olive</p><p class="h3">Priced per room</p><p class="muted">No setup fee, no per-message charges.</p></div>
</div>`);

add("hero", "Springing hero & guest phone", "A tall red card over a blurred lobby at night (warm bokeh that slowly breathes), with \"Ostler\" filling 92% of its width across the top edge, clipped so it hangs from it. On load each letter springs into its tilted stance (--os-elastic, staggered) and then rocks gently (--os-dur-rock). A guest's phone shows a full concierge chat with floating notification cards; title, lead and a See the product pill sit bottom left with a pulsing Online now dot. As it scrolls away the card shrinks and tilts while every letter flies up and off and the copy fades. Under 900px the phone drops below the copy.",
  asDiv(HERO), { js: true });

add("ticker", "Claim ticker & hotel names", "A full-width band between hairlines: claims in Gabarito 800 alternating solid and outlined (1.2px cream stroke), each followed by a small red diamond, scrolling left over --os-dur-ticker (paused off screen). Under it a centred row of hotel names set in mixed styles (Gabarito, Georgia italic, spaced caps) at 62% cream.",
  `<div>\n${piece('<div class="ticker"')}\n${piece('<div class="logos"')}\n</div>`, { js: true });

add("story", "Story card, print & stats", "A cream card on a 12-column grid: a headline whose words bounce in (data-os-split), a tilted print (a manager's 7am lock screen) that drops into place, a lead paragraph and three stats in Gabarito 900 red over a hairline.",
  piece('<div class="story__card'), { js: true });

add("covers", "Module covers rail", "A sideways rail: an intro (heading, muted lead, link), then 4:5 covers in red, olive and cream, each a drawn mockup with its module name filling the width at the bottom edge, a price and a line. It scrolls sideways (drag, swipe or trackpad, snapping to covers); as each cover crosses the rail it tilts from 5deg to -4deg, alternating direction, while its word drifts one way and its picture the other.",
  asDiv(piece('<section id="rails"')), { js: true });

add("pricing", "Per-room price list", "An olive card: heading, lead and the weekly dashboard (it drifts inside its print as it scrolls, data-os-parallax) beside six price rows. Each row's rule draws across (data-os-rule) and its price pops in with a spin (data-os-reveal=\"tag\"): name in Gabarito 800, a muted note, the price in Gabarito 900 with a small unit.",
  piece('<div class="repairs__card'), { js: true });

add("statement", "Knockout statement", "The hotel at night full-bleed with \"Awake\" knocked out of an ink layer (mix-blend-mode multiply, the word in white). As it crosses the viewport the word zooms 9x from its own centre until the photo shows through, the photo settles from 1.3x, and a cream card rises: \"Your front desk closes. Ostler doesn't.\" Without the script the word and the card both show.",
  asDiv(piece('<section id="again"')), { js: true });

add("steps", "Sticky step cards", "A sticky intro beside four step cards in cream, red, olive and cream, each numbered by a counter (01-04) with a Gabarito 900 title, a line of copy and a drawn picture. The cards are sticky, so they stack; as the next one arrives the one under it scales to .92 and tilts away, alternating direction.",
  asDiv(piece('<section id="sell"')), { js: true });

add("changelog", "Changelog rows", "A red card: heading and lead beside dated rows with giant Gabarito 900 day numbers, a title, a muted line and a cream pill tag (Live) or an outlined one (Next Thursday). Rows wipe in from the left as they arrive.",
  piece('<div class="drops__card'), { js: true });

add("voices", "Quote marquee", "An olive card with a bouncing headline over a row of cream quote cards (Gabarito 700 quotes, a faint red quote mark, the name in red). The script clones the cards once (aria-hidden, untabbable) and runs the row left over --os-dur-voice per card; hovering or focusing it eases the row to a stop and back, and it pauses off screen.",
  piece('<div class="voices__card'), { js: true });

add("gallery", "Tilted prints & dropped letters", "Six tilted hotel prints (bedroom, rooftop pool, lobby, candlelit table, spa, seaside) scattered round \"Checked in\", whose letters drop in elastically in a random order and land in their stance. Each print drifts upward at its own data-os-speed as the section scrolls, so they slide past each other; each has a glass caption pill.",
  asDiv(piece('<section id="lookbook"')), { js: true });

add("faq", "FAQ rows", "A cream card: heading and muted note beside details/summary rows under hairlines, the question in Gabarito 800 (wavy underline on hover) and a round plus that turns into a minus on --os-spring; the icon wobbles on hover.",
  piece('<div class="faq__card'), { js: true });

add("contact", "Contact card & demo form", "A red card with \"Talk to us\" filling its width (dropped letters), a lead, an hours list in hairline rows and links; the reception print (brass bell, key boxes) drifting in its frame; and a deeper-red demo form with underlined fields and a solid pill. It sends nothing: it thanks inline in a polite live status.",
  piece('<div class="visit__card'), { js: true });

add("footer", "Footer & wordmark", "A giant Gabarito 900 \"Ostler\" (--os-wordmark) beside the footer links, then a hairline and a row of small print in --os-muted.",
  asDiv(piece('<footer class="foot"')));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "os" && !m[1].startsWith("os-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("os-")) CLASSES.add(n);
const KEYFRAMES = ["grain", "wobble", "pulse", "tick"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({
  prefix: "os", hex: HEX, classes: [...CLASSES], keyframes: KEYFRAMES,
  attrs: ["reveal", "split", "bounce", "rule", "parallax", "speed", "sent", "open", "close"],
});
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .os itself, or :where(.os) in front
const ROOTED = /(^|[\s,(>+~])\.os(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const a = rule.indexOf("{");
    const prelude = rule.slice(0, a).trim();
    const body = rule.slice(a + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.os) ${s}`)).join(", ")} {${body}}`;
  }).join("\n");
}
// Headings and controls inherit the root's font inside a host
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.os) ${t}`).join(", ")} { font-family: inherit; }`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(base))).trim()}`;
// #000 is a mask stop (opaque), not a colour
const leftHex = componentCss.replace(/url\([^)]*\)/g, "").match(/#[0-9a-f]{3,6}\b/gi)?.filter((h) => !/^#0{3,4}$/.test(h));
if (leftHex?.length) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));
const leftKf = componentCss.match(/animation:\s*(?!os-|none)[a-z]/g);
if (leftKf) throw new Error("unprefixed animation: " + leftKf.join(" "));

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Ostler components, no libraries. Everything is delegated from the
     document or found by a scan that reruns when the DOM changes, so
     components added later work without setup.
     - Header: the menu button toggles .os-is-open (aria-expanded and its
       label follow); a link or Escape closes it. The demo form thanks inline.
     - Scroll: one rAF-throttled pass on every scroll (any scroller) and resize
       writes each component's progress as custom properties: the hero (--os-p,
       eased --os-pe and --os-pf, .os-is-flying), the statement (--os-z,
       --os-fade, --os-q, --os-rise), step cards (--os-s), prints drifting at
       data-os-speed (--os-p), parallax pictures (--os-p) and rail covers as
       they cross their rail (--os-tilt, --os-lift, --os-drift, --os-pan).
     - Reveals: data-os-reveal (up, tag, wipe, drop), data-os-split (words
       bounce in), data-os-rule (rules draw) and data-os-bounce="drop" (letters
       fall into their stance) are armed only when they start below the
       viewport, then revealed as they arrive, staggered.
     - Marquee: the quote row is cloned once and run; hover or focus eases it
       to a stop. Rails drag sideways with a mouse. Looping things pause off screen.
     Under prefers-reduced-motion nothing is armed, written or run. */
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var all = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var rnd = function (i) { var x = Math.sin(i * 91.7 + 13.1) * 43758.5453; return x - Math.floor(x); };
  var backOut = function (t) { t -= 1; return t * t * (2.3 * t + 1.3) + 1; };

  /* Header menu and the demo form */
  function setMenu(hdr, open) {
    if (!hdr) return;
    var btn = hdr.querySelector('.os-hdr__menu');
    hdr.classList.toggle('os-is-open', open);
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    var label = btn.getAttribute(open ? 'data-os-close' : 'data-os-open');
    if (label) btn.setAttribute('aria-label', label);
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var btn = e.target.closest('.os-hdr__menu');
    if (btn) { var h = btn.closest('.os-hdr'); setMenu(h, !h.classList.contains('os-is-open')); return; }
    var link = e.target.closest('.os-hdr__nav a');
    if (link) setMenu(link.closest('.os-hdr'), false);
    var a = e.target.closest('.os a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') all('.os-hdr.os-is-open').forEach(function (h) { setMenu(h, false); });
  });
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.os-visit__form');
    if (!form) return;
    e.preventDefault();
    var status = form.querySelector('.os-visit__status');
    if (status) status.textContent = form.getAttribute('data-os-sent') || '';
    form.reset();
  });

  /* Reveals */
  var STAGGER = { up: 90, tag: 80, wipe: 100, drop: 0 };
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      io.unobserve(t);
      var kind = t.getAttribute('data-os-reveal');
      var step = kind ? STAGGER[kind] || 0 : t.hasAttribute('data-os-rule') ? 80 : 0;
      if (step) t.style.setProperty('--os-d', (n++ * step) + 'ms');
      t.classList.add('os-is-in');
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  function splitWords(el) {
    if (el.children.length) return;
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\\s+/).map(function (w, i) {
      var s = document.createElement('span');
      s.className = 'os-word';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--os-r0', ((rnd(i + 4) - 0.5) * 26).toFixed(1) + 'deg');
      s.style.setProperty('--os-d', i * 45 + 'ms');
      s.textContent = w;
      return s.outerHTML;
    }).join(' ');
  }
  function arm(el) {
    if (el._osArmed) return;
    el._osArmed = 1;
    if (!io || reduced.matches) return;
    var r = el.getBoundingClientRect();
    if (!r.height || r.top < innerHeight * 0.88) return;
    if (el.hasAttribute('data-os-split')) splitWords(el);
    el.classList.add('os-is-armed');
    io.observe(el);
  }

  /* Looping things pause off screen */
  var vis = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      e.target.classList.toggle('os-is-paused', !e.isIntersecting);
      if (e.target._osRun) e.target._osRun(e.isIntersecting);
    });
  }) : null;

  /* The quote marquee */
  function marquee(row) {
    if (row._osMarquee) return;
    row._osMarquee = 1;
    var list = row.querySelector('.os-voices__list');
    if (!list || !list.children.length || reduced.matches) return;
    var items = [].slice.call(list.children);
    items.forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      all('a, button', c).forEach(function (x) { x.setAttribute('tabindex', '-1'); });
      list.appendChild(c);
    });
    list.style.setProperty('--os-n', items.length);
    list.classList.add('os-is-run');
    var anim = list.getAnimations ? list.getAnimations()[0] : null;
    if (!anim) return;
    var target = 1, rate = 1, raf = 0;
    var ease = function () {
      rate += (target - rate) * 0.14;
      if (Math.abs(target - rate) < 0.01) rate = target;
      anim.playbackRate = rate;
      raf = rate === target ? 0 : requestAnimationFrame(ease);
    };
    var to = function (v) { return function () { target = v; if (!raf) raf = requestAnimationFrame(ease); }; };
    row.addEventListener('mouseenter', to(0));
    row.addEventListener('mouseleave', to(1));
    row.addEventListener('focusin', to(0));
    row.addEventListener('focusout', to(1));
    row._osRun = function (on) { if (on) anim.play(); else anim.pause(); };
    if (vis) vis.observe(row);
  }

  /* Rails drag sideways with a mouse */
  document.addEventListener('pointerdown', function (e) {
    var pin = e.pointerType === 'mouse' && e.button === 0 && e.target.closest && e.target.closest('.os-rails__pin');
    if (!pin || e.target.closest('a, button')) return;
    var x0 = e.clientX, s0 = pin.scrollLeft, moved = false;
    var move = function (ev) {
      if (!moved && Math.abs(ev.clientX - x0) > 4) { moved = true; pin.classList.add('os-is-dragging'); }
      if (moved) pin.scrollLeft = s0 - (ev.clientX - x0);
    };
    var up = function () {
      pin.classList.remove('os-is-dragging');
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  /* Scroll-driven progress */
  var queued = false;
  function frame() {
    queued = false;
    if (reduced.matches) return;
    var vh = innerHeight;
    var near = function (r) { return r.bottom > -vh * 0.25 && r.top < vh * 1.25; };
    all('.os-hero').forEach(function (hero) {
      var r = hero.getBoundingClientRect();
      if (!near(r)) return;
      var p = clamp(-r.top / (r.height * 0.6));
      hero.style.setProperty('--os-p', p.toFixed(4));
      hero.style.setProperty('--os-pe', (p * p).toFixed(4));
      hero.style.setProperty('--os-pf', (p * p).toFixed(4));
      hero.classList.toggle('os-is-flying', p > 0.01);
    });
    all('.os-again__stage').forEach(function (stage) {
      var r = stage.getBoundingClientRect();
      if (!near(r)) return;
      var p = clamp((vh - r.top) / (r.height + vh));
      var z = clamp((p - 0.38) / 0.34);
      stage.style.setProperty('--os-z', (z * z).toFixed(4));
      stage.style.setProperty('--os-fade', clamp((p - 0.62) / 0.12).toFixed(4));
      stage.style.setProperty('--os-q', clamp(p / 0.62).toFixed(4));
      stage.style.setProperty('--os-rise', backOut(clamp((p - 0.56) / 0.14)).toFixed(4));
      var knock = stage.querySelector('.os-again__knock'), word = stage.querySelector('.os-again__word');
      if (knock && word) knock.style.transformOrigin = (word.offsetLeft + word.offsetWidth / 2) + 'px ' + (word.offsetTop + word.offsetHeight * 0.55) + 'px';
    });
    all('.os-steps').forEach(function (list) {
      var steps = [].slice.call(list.children);
      steps.forEach(function (s, i) {
        var next = steps[i + 1];
        if (!next) return;
        var r = next.getBoundingClientRect();
        var top = parseFloat(getComputedStyle(next).top) || 100;
        s.style.setProperty('--os-s', clamp((vh - r.top) / Math.max(1, vh - top)).toFixed(4));
      });
    });
    var parents = [];
    all('[data-os-speed]').forEach(function (el) {
      if (!el._osSpeed) { el._osSpeed = 1; el.style.setProperty('--os-speed', parseFloat(el.getAttribute('data-os-speed')) || 0); }
      if (parents.indexOf(el.parentElement) < 0) parents.push(el.parentElement);
    });
    parents.concat(all('[data-os-parallax]')).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (!near(r)) return;
      el.style.setProperty('--os-p', clamp((vh - r.top) / (r.height + vh)).toFixed(4));
    });
    all('.os-rails__pin').forEach(function (pin) {
      var w = pin.clientWidth;
      if (!near(pin.getBoundingClientRect())) return;
      all('.os-cover', pin).forEach(function (c, i) {
        var dir = i % 2 ? -1 : 1;
        var left = c.offsetLeft - pin.scrollLeft;
        var t = clamp((w - left) / (w + c.offsetWidth));
        c.style.setProperty('--os-tilt', ((5 - 9 * t) * dir).toFixed(2));
        c.style.setProperty('--os-lift', (4 - 7 * t).toFixed(2));
        c.style.setProperty('--os-drift', (9 - 18 * t).toFixed(2));
        c.style.setProperty('--os-pan', (-5 + 10 * t).toFixed(2));
      });
    });
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(frame); } }
  document.addEventListener('scroll', schedule, { capture: true, passive: true });
  addEventListener('resize', schedule);

  /* Scan: arm what is new */
  function scan() {
    all('[data-os-reveal], [data-os-split], [data-os-rule], [data-os-bounce="drop"]').forEach(arm);
    all('.os-voices__row').forEach(marquee);
    if (vis) all('.os-hero, .os-ticker').forEach(function (el) { if (!el._osVis) { el._osVis = 1; vis.observe(el); } });
    schedule();
  }
  var pending = false;
  function rescan() { if (!pending) { pending = true; requestAnimationFrame(function () { pending = false; scan(); }); } }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  if ('MutationObserver' in window) new MutationObserver(rescan).observe(document.documentElement, { childList: true, subtree: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: a red card over the lobby with the springing word, its copy swapped for the system's
const PALETTE = ["--os-ink", "--os-red", "--os-red-deep", "--os-cream", "--os-olive"];
const TOP = `<div class="card on-red marks sp-card">
${LOBBY}
<div class="hero__wordclip"><h1 class="hero__word display" style="--len:6">Ostler</h1></div>
<div class="sp-foot">
<div class="hero__info">
<p class="hero__title">Late-night hospitality, set on oxblood, cream and olive cards</p>
<p class="hero__lead">Gabarito 900 that fills its box and springs apart letter by letter, Instrument Sans for the conversation, pill buttons that tilt, corner marks, and every room drawn in SVG. Extracted from the Ostler AI hotel concierge page.</p>
</div>
<div class="sp-side">
<div class="sp-swatches">${PALETTE.map((t) => `<i style="background:var(${t})"></i>`).join("")}</div>
<a class="btn btn--solid" href="#c-hero"><span>See the components</span>${ARROW}</a>
</div>
</div>
</div>`;
const CHROME = `
body{margin:0;background:var(--os-ink)}
.sp-top{padding:var(--os-gap) var(--os-gap) 0}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;padding:6px clamp(14px,1.6vw,22px) 14px}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font:600 var(--os-label)/1.2 var(--os-font-text);letter-spacing:.14em;text-transform:uppercase;color:var(--os-muted)}
.sp-label::before{content:"";flex:none;width:8px;height:8px;background:var(--os-red);border-radius:var(--os-radius-diamond);transform:rotate(45deg)}
.sp-card{margin:0;container-type:inline-size;min-height:max(520px,min(calc(100svh - 64px),820px));display:grid;align-content:end;overflow:clip;color:var(--os-cream)}
.sp-foot{position:relative;z-index:3;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:24px 40px}
.sp-foot .os-hero__info{width:min(600px,100%)}
.sp-side{display:grid;gap:18px;justify-items:end}
.sp-swatches{display:flex;gap:8px}
.sp-swatches i{width:40px;height:40px;border-radius:50%;box-shadow:inset 0 0 0 var(--os-stroke) color-mix(in oklab,var(--os-cream) 70%,transparent)}
.sp-main{padding:0 0 120px}
.sp-sec{padding:clamp(56px,7vw,104px) 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,400px) minmax(0,1fr);gap:10px 48px;align-items:end;margin:0 calc(var(--os-gap) + var(--os-pad) * .5) 24px}
.sp-head h2{margin:12px 0 0;font:800 clamp(34px,4vw,60px)/.92 var(--os-font-display);letter-spacing:-.035em;text-wrap:balance}
.sp-note{margin:0;max-width:760px;font-size:15px;line-height:1.5;color:var(--os-muted)}
.sp-demo{position:relative;overflow:clip}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){.sp-side{justify-items:start}.sp-card{min-height:600px}}
@media (max-width:900px){#c-nav .sp-demo{min-height:430px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">ostler@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(TOP))}
</header>`;
const SPRITE = sliceEl(H, '<svg class="sprite"', 0).html;
const DEFS = SPRITE.replace('<svg class="sprite" aria-hidden="true" focusable="false">', '<svg id="os-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">').replace(/\n {2,}/g, "\n");
if (!DEFS.startsWith('<svg id="os-defs"')) throw new Error("sprite not found");
const specimen = renderSpecimen({
  name: "Ostler",
  slug: "ostler",
  version: VERSION,
  prefix: "os",
  rootClass: "os",
  labelClass: "sp-label",
  script: "scripts/systems/ostler.mjs",
  source: SOURCE,
  metaDescription: "The Ostler design system: tokens and working components extracted from the Ostler AI hotel concierge page.",
  defsNote: "the shared filters and gradients every picture uses (drop shadows, blurs, warm glow, brass, wood, linen) and the star and tick symbols; every id is under os-",
  jsNote: "the header menu, the demo form, scroll progress for the hero, statement, step cards, prints and rail covers, reveals, the quote marquee and rail dragging; no libraries",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
}).replace('<div class="os">', '<div class="os os-grain">');
if (/<canvas|<script src|gsap\.|ScrollTrigger\.|Lenis|SplitText\./.test(specimen)) throw new Error("the specimen carries a library");

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "ostler", prefix: "os", rootClass: "os", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn--solid", "card", "on-red", "on-cream", "on-olive", "marks", "display", "fill", "fillbox", "h2", "h3", "lead", "art", "print", "hero__card", "cover", "step", "steps", "drop", "voice", "shot", "qa", "price", "link", "char", "hdr", "foot"] });
