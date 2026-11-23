// Extracts the Murmur design system from its landing page.
//
//   node scripts/systems/murmur.mjs
//
// Reads public/demos/murmur-swarm-tickets.html (never edits it) and writes
// public/systems/murmur/ (specimen.html, tokens.css, murmur.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell (html, the smooth-scroll rule, the unused
// .img-fluid helper) and swaps the WebGL canvas rule for the sphere swarm.
// The page's hero is a three.js scene: about a hundred spheres (its own radii
// and positions) fly up, settle, breathe and get pushed around by the pointer.
// three.js, OrbitControls and GSAP do not come along. The swarm is rebuilt in
// CSS: the page's own positions and radii are projected through its camera
// (z 24) here at build time into a cluster of radial-gradient spheres, back to
// front, so it renders with no script at all. CSS plays the fly-in and the
// breathing; the component script pauses the breathing off screen and pushes
// spheres away from a fine pointer. The page's intro (the giant wordmark that
// gives way to the hero chrome once the spheres settle) is CSS too. The
// holographic tickets were CSS on the page already (conic gradients, blend
// modes and an intersecting mask for the perforations and notches) and come
// along whole, with the page's pointer tilt and sheen. GSAP's scroll reveals
// and the footer word's rise are dropped: content is visible as written.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/murmur-swarm-tickets.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&display=swap";
if (!page.includes(FONTS_HREF)) throw new Error("font link not found");
const FONTS = `<link href="${FONTS_HREF}" rel="stylesheet">`;

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules: the page's names
   (--black-color -> --mu-ink, --paper, --blush, --petal, --albedo, --rose,
   --line, --gold-grad -> --mu-gold) move under mu-, its literal colours get
   names. Group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Murmur · murmur@${VERSION}
   Extracted from https://instalanding.ai/demos/murmur-swarm-tickets.html
   Font: Oswald 200-700 (Google Fonts) */
:root {
  /* Color · core */
  --mu-paper: #FBFAFF;
  --mu-ink: #101117;
  --mu-white: #FFFFFF;
  --mu-blush: #F6E4E4;
  --mu-petal: #F2C4C4;
  --mu-albedo: #C7A5A5;
  --mu-rose: #B76E79;
  --mu-red: #E0435A;
  --mu-live: #D6405A;
  --mu-haze: #ECF0FB;

  /* Color · holographic */
  --mu-holo-pink: #F4A7C0;
  --mu-holo-violet: #9B7FD1;
  --mu-holo-cyan: #7CC3DD;
  --mu-peach: #F7DCCF;
  --mu-clay: #DCA79C;
  --mu-copper: #D39A8D;

  /* Color · foil */
  --mu-foil-blush: #FBE3EA;
  --mu-foil-pink: #FFB8CF;
  --mu-foil-lilac: #EADAFF;
  --mu-foil-cream: #FFF4F0;
  --mu-foil-candy: #FFC9DC;
  --mu-foil-sky: #DCEFFF;
  --mu-ring-pink: #FFC2D8;
  --mu-ring-lilac: #F6ECFF;

  /* Color · spheres */
  --mu-orb-hi: #FFF1F1;
  --mu-orb-light: #FFB3B3;
  --mu-orb-pink: #F26D6D;
  --mu-orb-shade: #C23B4A;
  --mu-gold-hi: #FFF6EF;
  --mu-gold-light: #F4D3C4;
  --mu-gold-mid: #D8A092;
  --mu-gold-shade: #9C5A63;
  --mu-pearl-light: #FBF6FF;
  --mu-pearl-mid: #E6DAF0;
  --mu-pearl-shade: #B9A6C6;
  --mu-inkorb-mid: #8A6A78;
  --mu-inkorb-deep: #2B2533;
  --mu-inkorb-shade: #0B0B10;
  --mu-sphere-hi: #FFF0F0;
  --mu-sphere: #FFC4C4;
  --mu-sphere-shade: #F09CA2;

  /* Color · lines */
  --mu-line: rgba(16, 17, 23, 0.12);
  --mu-tear: rgba(16, 17, 23, 0.25);
  --mu-tear-on-ink: rgba(251, 250, 255, 0.3);
  --mu-mail-line: rgba(16, 17, 23, 0.3);
  --mu-tag-bg: rgba(16, 17, 23, 0.88);
  --mu-title-ink: rgba(16, 17, 23, 0.9);

  /* Color · gradients */
  --mu-page: linear-gradient(to right, var(--mu-paper) 0%, 40%, var(--mu-paper) 80%, 90%, var(--mu-haze) 100%);
  --mu-gold: linear-gradient(135deg, var(--mu-peach) 0%, var(--mu-clay) 45%, var(--mu-rose) 100%);
  --mu-holo: linear-gradient(115deg, var(--mu-rose) 0%, var(--mu-red) 16%, var(--mu-holo-pink) 30%, var(--mu-holo-violet) 45%, var(--mu-holo-cyan) 57%, var(--mu-peach) 69%, var(--mu-copper) 82%, var(--mu-rose) 100%);
  --mu-holo-rule: linear-gradient(90deg, var(--mu-rose), var(--mu-red), var(--mu-holo-violet), var(--mu-holo-cyan));
  --mu-orb: radial-gradient(circle at 32% 28%, var(--mu-orb-hi) 0%, var(--mu-orb-light) 20%, var(--mu-orb-pink) 58%, var(--mu-orb-shade) 100%);
  --mu-sphere-fill: radial-gradient(circle at 36% 30%, var(--mu-sphere-hi) 0%, var(--mu-sphere) 36%, var(--mu-sphere-shade) 100%);
  --mu-orb-gold: radial-gradient(circle at 32% 28%, var(--mu-gold-hi) 0%, var(--mu-gold-light) 22%, var(--mu-gold-mid) 58%, var(--mu-gold-shade) 100%);

  /* Type · families */
  --mu-font-display: "Oswald", "Arial Narrow", sans-serif;
  --mu-font-text: "Oswald", "Arial Narrow", sans-serif;

  /* Type · scale */
  --mu-display-numeral: 160px;
  --mu-display-cta: 132px;
  --mu-display-section: 104px;
  --mu-display-step: 80px;
  --mu-display-quote: 68px;
  --mu-display-marquee: 56px;
  --mu-display-stat: 52px;
  --mu-statement: 46px;
  --mu-display-ticket: 44px;
  --mu-display-brand: 42px;
  --mu-h2: 34px;
  --mu-lede: 17px;
  --mu-body: 16px;
  --mu-caption: 13px;
  --mu-micro: 10px;

  /* Shape · radii */
  --mu-radius-wide: 20px;
  --mu-radius-ticket: 16px;
  --mu-radius-stub: 12px;
  --mu-radius-rule: 6px;
  --mu-radius-pill: 50px;
  --mu-radius-tag: 999px 0;

  /* Shape · borders */
  --mu-hair: 1px;
  --mu-tear-w: 2px;
  --mu-rule: 3px;

  /* Shape · die-cut */
  --mu-ticket-stub: 96px;
  --mu-ticket-notch: 13px;
  --mu-ticket-perf: 6px;
  --mu-ticket-stub-wide: 320px;
  --mu-ticket-notch-wide: 16px;
  --mu-perf-pitch: 20px;

  /* Depth · foil, spheres and glow */
  --mu-shadow-ticket-1: 0 2px 2px rgba(120, 40, 60, 0.1);
  --mu-shadow-ticket-2: 0 10px 12px rgba(120, 40, 60, 0.12);
  --mu-shadow-ticket-3: 0 30px 40px rgba(120, 40, 60, 0.16);
  --mu-shadow-orb: 0 30px 50px -22px rgba(194, 59, 74, 0.5);
  --mu-shadow-orb-gold: 0 30px 50px -22px rgba(156, 90, 99, 0.5);
  --mu-shadow-orb-pearl: 0 30px 50px -22px rgba(120, 90, 140, 0.45);
  --mu-shadow-orb-ink: 0 30px 50px -22px rgba(0, 0, 0, 0.7);
  --mu-shadow-swarm: 0 24px 36px rgba(194, 59, 74, 0.14);
  --mu-glow-numeral: 0 8px 18px rgba(183, 110, 121, 0.25);
  --mu-ring-dot: 0 0 0 3px rgba(183, 110, 121, 0.2);

  /* Motion · easing */
  --mu-ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);
  --mu-ease: ease-in-out;

  /* Motion · durations */
  --mu-dur-sheen: 0.3s;
  --mu-dur-fade: 0.5s;
  --mu-dur-wipe: 0.5s;
  --mu-dur-open: 0.7s;
  --mu-dur-draw: 0.8s;
  --mu-dur-orb: 0.9s;
  --mu-dur-swarm-in: 1.1s;
  --mu-dur-breathe: 1.6s;
  --mu-dur-intro: 2.4s;
  --mu-dur-float: 4.5s;
  --mu-dur-sweep: 6s;
  --mu-dur-holo: 7s;
  --mu-dur-drift: 9s;
  --mu-dur-marquee: 32s;

  /* Motion · swarm */
  --mu-breathe: 5px;
  --mu-swarm-stagger: 14ms;
  --mu-push: 26px;

  /* Space · layout */
  --mu-gutter: 20px;
  --mu-section: 140px;
  --mu-head-gap: 70px;
  --mu-hero-h: min(100dvh, 900px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────────
   Done in the page's own vocabulary first (var(--holo), var(--dur-float) ...),
   then every custom property moves under mu- and the literal hexes become tokens. */
const VARS = { "black-color": "ink", "white-color": "white", "gold-grad": "gold" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("mu-") ? m : `--mu-${VARS[n] ?? n}`));
const HEX = {
  "#101117": "ink", "#fbfaff": "paper", "#ecf0fb": "haze", "#f2c4c4": "petal", "#b76e79": "rose", "#e0435a": "red", "#d6405a": "live",
  "#f7dccf": "peach", "#dca79c": "clay", "#fbe3ea": "foil-blush", "#ffb8cf": "foil-pink", "#eadaff": "foil-lilac", "#fff4f0": "foil-cream",
  "#ffc9dc": "foil-candy", "#dcefff": "foil-sky", "#ffc2d8": "ring-pink", "#f6ecff": "ring-lilac",
  "#fff1f1": "orb-hi", "#ffb3b3": "orb-light", "#f26d6d": "orb-pink", "#c23b4a": "orb-shade",
  "#fff6ef": "gold-hi", "#f4d3c4": "gold-light", "#d8a092": "gold-mid", "#9c5a63": "gold-shade",
  "#fbf6ff": "pearl-light", "#e6daf0": "pearl-mid", "#b9a6c6": "pearl-shade",
  "#8a6a78": "inkorb-mid", "#2b2533": "inkorb-deep", "#0b0b10": "inkorb-shade", "#fff": "white",
};
const HOLO = "linear-gradient(115deg, #b76e79 0%, #e0435a 16%, #f4a7c0 30%, #9b7fd1 45%, #7cc3dd 57%, #f7dccf 69%, #d39a8d 82%, #b76e79 100%)";
const ORB = "radial-gradient(circle at 32% 28%, #fff1f1 0%, #ffb3b3 20%, #f26d6d 58%, #c23b4a 100%)";
const ORB_GOLD = "radial-gradient(circle at 32% 28%, #fff6ef 0%, #f4d3c4 22%, #d8a092 58%, #9c5a63 100%)";
// [from, to, expected count] in the page's vocabulary; every one must be found
const RAW_SWAPS = [
  // Gradients that are tokens
  [HOLO, "var(--holo)", 2],
  ["linear-gradient(90deg, #b76e79, #e0435a, #9b7fd1, #7cc3dd)", "var(--holo-rule)", 1],
  [ORB, "var(--orb)", 2],
  [ORB_GOLD, "var(--orb-gold)", 2],
  ["background: linear-gradient(to right, #fbfaff 0%, 40.00000059604645%, #fbfaff 80.0000011920929%, 90.00000059604645%, #ecf0fb 100%);", "background: var(--page);", 1],
  ['font-family: "Oswald", sans-serif;', "font-family: var(--font-text);", 1],
  // Translucent ink
  ["rgba(16, 17, 23, 0.88)", "var(--tag-bg)", 2],
  ["rgba(16, 17, 23, 0.22)", "var(--tear)", 1],
  ["rgba(16, 17, 23, 0.25)", "var(--tear)", 4],
  ["rgba(16, 17, 23, 0.9)", "var(--title-ink)", 2],
  ["rgba(16, 17, 23, 0.92)", "var(--title-ink)", 1],
  ["rgba(16, 17, 23, 0.3)", "var(--mail-line)", 1],
  ["rgba(251, 250, 255, 0.3)", "var(--tear-on-ink)", 1],
  // Shadows and glows
  ["drop-shadow(0 2px 2px rgba(120, 40, 60, 0.1))\n    drop-shadow(0 10px 12px rgba(120, 40, 60, 0.12))\n    drop-shadow(0 30px 40px rgba(120, 40, 60, 0.16))",
    "drop-shadow(var(--shadow-ticket-1)) drop-shadow(var(--shadow-ticket-2)) drop-shadow(var(--shadow-ticket-3))", 1],
  ["drop-shadow(0 8px 18px rgba(183, 110, 121, 0.25))", "drop-shadow(var(--glow-numeral))", 1],
  ["drop-shadow(0 8px 18px rgba(183, 110, 121, 0.22))", "drop-shadow(var(--glow-numeral))", 1],
  ["box-shadow: 0 30px 50px -22px rgba(194, 59, 74, 0.5)", "box-shadow: var(--shadow-orb)", 1],
  ["box-shadow: 0 30px 50px -22px rgba(156, 90, 99, 0.5)", "box-shadow: var(--shadow-orb-gold)", 1],
  ["box-shadow: 0 30px 50px -22px rgba(120, 90, 140, 0.45)", "box-shadow: var(--shadow-orb-pearl)", 1],
  ["box-shadow: 0 30px 50px -22px rgba(0, 0, 0, 0.7)", "box-shadow: var(--shadow-orb-ink)", 1],
  ["box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.2)", "box-shadow: var(--ring-dot)", 1],
  // Type
  ["h1 { font-size: 160px; }", "h1 { font-size: var(--display-numeral); }", 1],
  ["h2 { font-size: 34px; }", "h2 { font-size: var(--h2); }", 1],
  ["font-size: 42px; font-weight: 900", "font-size: var(--display-brand); font-weight: 700", 1],
  ["font-size: 56px; line-height: 1;", "font-size: var(--display-marquee); line-height: 1;", 1],
  ["font-size: 104px;", "font-size: var(--display-section);", 1],
  ["font-size: 46px;", "font-size: var(--statement);", 1],
  ["display: block; font-size: 52px;", "display: block; font-size: var(--display-stat);", 1],
  ["font-size: 44px;", "font-size: var(--display-ticket);", 1],
  ["font-size: 80px; font-weight: 200;", "font-size: var(--display-step); font-weight: 200;", 1],
  ["font-size: 68px;", "font-size: var(--display-quote);", 1],
  ["font-size: 132px;", "font-size: var(--display-cta);", 1],
  ["font-size: 16px;\n  line-height: 1.3;", "font-size: var(--body);\n  line-height: 1.3;", 1],
  ["font-weight: 300; font-size: 17px;", "font-weight: 300; font-size: var(--lede);", 2],
  // Radii
  ["border-radius: 16px;", "border-radius: var(--radius-ticket);", 1],
  ["border-radius: 20px;", "border-radius: var(--radius-wide);", 1],
  ["border-radius: 12px;", "border-radius: var(--radius-stub);", 1],
  ["border-radius: 6px;", "border-radius: var(--radius-rule);", 1],
  ["border-radius: 999px 0;", "border-radius: var(--radius-tag);", 2],
  ["border-radius: 50px", "border-radius: var(--radius-pill)", 5],
  // Borders
  ["2px dashed", "var(--tear-w) dashed", 5],
  ["1px solid var(--line)", "var(--hair) solid var(--line)", 7],
  ["height: 3px; background: var(--black-color)", "height: var(--rule); background: var(--black-color)", 2],
  // The die-cut: the ticket's own shape vars now read their tokens
  ["--stub: 96px;\n  --perf: 6px;\n  --notch: 13px;", "--stub: var(--ticket-stub);\n  --perf: var(--ticket-perf);\n  --notch: var(--ticket-notch);", 1],
  ["--stubw: 320px;\n  --notch: 16px;", "--stubw: var(--ticket-stub-wide);\n  --notch: var(--ticket-notch-wide);", 1],
  [" / 20px 100% repeat-x", " / var(--perf-pitch) 100% repeat-x", 2],
  [" / 100% 20px repeat-y", " / 100% var(--perf-pitch) repeat-y", 2],
  // Motion
  ["cubic-bezier(0.2, 0.8, 0.2, 1)", "var(--ease-out)", 7],
  ["opacity 0.5s ease-in-out", "opacity var(--dur-fade) var(--ease)", 2],
  ["transition: all 0.5s; -webkit-transition: all 0.5s;", "transition: all var(--dur-wipe);", 1],
  ["holo-shift 7s ease-in-out", "holo-shift var(--dur-holo) var(--ease)", 2],
  ["marquee-sweep 6s ease-in-out", "marquee-sweep var(--dur-sweep) var(--ease)", 1],
  ["marquee 32s linear", "marquee var(--dur-marquee) linear", 1],
  ["ticket-float 4.5s ease-in-out", "ticket-float var(--dur-float) var(--ease)", 1],
  ["calc(var(--i, 0) * -0.75s)", "calc(var(--i, 0) * var(--dur-float) / -6)", 1],
  ["holo-drift 9s ease-in-out", "holo-drift var(--dur-drift) var(--ease)", 1],
  ["transform 0.5s var(--ease-out)", "transform var(--dur-wipe) var(--ease-out)", 0],
  ["transition: background-position 0.3s;", "transition: background-position var(--dur-sheen);", 1],
  ["width 0.8s", "width var(--dur-draw)", 1],
  ["flex 0.7s", "flex var(--dur-open)", 1],
  // Layout
  [".section { padding: 140px 20px;", ".section { padding: var(--section) var(--gutter);", 1],
  ["align-items: center; padding: 16px 20px;", "align-items: center; padding: 16px var(--gutter);", 1],
  ["padding-bottom: 24px; margin-bottom: 70px;", "padding-bottom: 24px; margin-bottom: var(--head-gap);", 1],
  ["padding: 100px 20px 30px; min-height: calc(100dvh - 90px);", "padding: 100px var(--gutter) 30px; min-height: calc(var(--hero-h) - 90px);", 1],
  ["100dvh", "var(--hero-h)", 5],
  // The canvas becomes the swarm; the hero is as tall as --hero-h
  [".hero { position: relative; min-height: var(--hero-h);", ".hero { position: relative; min-height: var(--hero-h);", 1],
  [".hero canvas { position: absolute; top: 0; left: 0; z-index: 1; }",
    ".hero .swarm { position: absolute; left: 50%; top: 50%; width: min(92%, 1320px); translate: -50% -52%; z-index: 1; }", 1],
  // The page's intro was a script timeout; here it is CSS, played once
  [".hide-text { opacity: 0; transition: opacity var(--dur-fade) var(--ease); }",
    ".hide-text { animation: chrome-in var(--dur-fade) var(--ease) var(--dur-intro) both; }\n.main-txt { animation: chrome-out var(--dur-fade) var(--ease) var(--dur-intro) both; }", 1],
  // On the page html and body clip the marquee; here the root does, without becoming a scroll container
  ["html, body { overflow-x: hidden; }", "body { overflow-x: clip; }", 1],
];
let raw = pageCss;
for (const [from, to, n] of RAW_SWAPS) {
  const count = raw.split(from).length - 1;
  if (count === 0 && n !== 0) throw new Error("css not found: " + from.slice(0, 70));
  if (n && count !== n) throw new Error(`expected ${n} of "${from.slice(0, 50)}", found ${count}`);
  raw = raw.split(from).join(to);
}

/* ── 3. Component CSS: the page's one <style>, minus the shell, plus the swarm ── */
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
// Page-only: the document shell, :root (now the tokens) and an image helper no markup uses
const DROP = /^(html|:root|\.img-fluid)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.mu, .mu *)";
  if (sel === "body") return ".mu";
  return sel;
}
// Flattens whitespace inside a rule so the output reads one rule per line
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

// The sphere swarm, written in the page's vocabulary. The spheres are <i>s placed by
// --x/--y (centre, % of the box) and sized by --s (% of the box's width); --i is
// their back-to-front order, which staggers the fly-in and phases the breathing.
const SWARM_CSS = `
.swarm { position: relative; width: 100%; aspect-ratio: var(--swarm-ratio); pointer-events: none; filter: drop-shadow(var(--shadow-swarm)); }
.swarm i { position: absolute; left: var(--x); top: var(--y); width: var(--s); aspect-ratio: 1; border-radius: 50%; background: var(--sphere-fill); pointer-events: auto;
  transform: translate(calc(-50% + var(--px, 0px)), calc(-50% + var(--py, 0px)));
  transition: transform var(--dur-orb) var(--ease-out);
  animation: swarm-in var(--dur-swarm-in) var(--ease-out) calc(var(--i) * var(--swarm-stagger)) both, swarm-breathe var(--dur-breathe) var(--ease) calc(var(--i) * var(--dur-breathe) / -16) infinite alternate; }
.swarm i.gold { background: var(--orb-gold); }
.swarm.paused i { animation-play-state: running, paused; }
@keyframes swarm-in { from { top: 135%; opacity: 0; scale: 0.6; } }
@keyframes swarm-breathe { from { translate: 0 calc(var(--breathe) * -1); } to { translate: 0 var(--breathe); } }
@keyframes chrome-in { from { opacity: 0; } }
@keyframes chrome-out { to { opacity: 0; visibility: hidden; } }
.swarm-frame { position: relative; overflow: hidden; padding: 36px 0 28px; }
.swarm-frame .rotated-text { top: 50%; right: 14px; transform: translate(50%, -50%) rotate(90deg); }
.swarm-frame .swarm-cap { position: absolute; left: 0; bottom: 0; display: flex; gap: 18px; font-size: var(--caption); text-transform: uppercase; }
.swarm-frame .swarm-cap b { font-weight: 600; }
@media (prefers-reduced-motion: reduce) {
  .swarm i { animation: none; transition: none; }
  .hide-text { animation: none; }
  .main-txt { animation: none; opacity: 0; visibility: hidden; }
}`;
// The page's tilt on .ticket writes transform; the stub demo row lays tickets out without it
const EXTRA_CSS = `
.stub-row { display: flex; flex-wrap: wrap; align-items: center; gap: 40px 48px; }
.stub-row .barcode-wrap small { font-size: var(--micro); }
.stub-codes { display: flex; flex-wrap: wrap; gap: 28px 40px; align-items: flex-end; }
.stub-codes .stub-label { margin-bottom: 8px; }
.stub-states { display: flex; flex-direction: column; gap: 4px; }
/* On the page the citation inherits the quote's -2px tracking, which closes up its spaces at 14px */
.quote cite { letter-spacing: 0.5px; }
/* Under 768px the page's cluster bleeds past the edges; and in a column narrower than the
   page's 390px the hero's bottom row wraps instead of clipping its last social link */
@media (max-width: 767px) {
  .hero .swarm { width: 116%; }
  .banner-inner .bottom-desc { flex-wrap: wrap; gap: 16px 12px; }
}`;

const base = renameVars(keep((raw + "\n" + SWARM_CSS + "\n" + EXTRA_CSS).replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. The swarm, from the page's own scene ─────────────────────────── */
// radii[] and positions[] lifted from the page's script, projected through its camera (z 24, looking at the origin)
const SCENE_AT = page.indexOf("const radii = [");
const SCENE_END = page.indexOf("const material");
if (SCENE_AT < 0 || SCENE_END < 0) throw new Error("scene arrays not found");
const { radii, positions } = new Function(`${page.slice(SCENE_AT, SCENE_END)}\nreturn { radii, positions };`)();
if (radii.length !== positions.length || positions.length < 80) throw new Error("scene arrays don't match");
// On the page the spheres never sit at their listed positions: every frame each one is pulled
// 1.8% toward its spot and then every overlapping pair is pushed apart (min distance (rA + rB) * 1.2),
// which loosens the cluster. The page's own loop, run here until it settles, gives the resting cluster.
const rest = positions.map((p) => ({ ...p }));
for (let f = 0; f < 900; f++) {
  rest.forEach((p, i) => { const o = positions[i]; p.x += (o.x - p.x) * 0.018; p.y += (o.y - p.y) * 0.018; p.z += (o.z - p.z) * 0.018; });
  for (let i = 0; i < rest.length; i++) for (let j = i + 1; j < rest.length; j++) {
    const a = rest[i], b = rest[j];
    let tx = b.x - a.x, ty = b.y - a.y, tz = b.z - a.z;
    const d = Math.hypot(tx, ty, tz), min = (radii[i] + radii[j]) * 1.2;
    if (d >= min || d === 0) continue;
    tx /= d; ty /= d; tz /= d;
    const k = (min - d) * 0.4;
    // as on the page, the shared vector is scaled once for A and again for B
    tx *= k; ty *= k; tz *= k; a.x -= tx; a.y -= ty; a.z -= tz;
    tx *= k; ty *= k; tz *= k; b.x += tx; b.y += ty; b.z += tz;
  }
}
const CAM = 24;
const proj = rest.map((p, i) => {
  const k = CAM / (CAM - p.z);
  return { x: p.x * k, y: p.y * k, r: radii[i] * k, z: p.z };
});
const PAD = 0.5;
const minX = Math.min(...proj.map((p) => p.x - p.r)) - PAD, maxX = Math.max(...proj.map((p) => p.x + p.r)) + PAD;
const minY = Math.min(...proj.map((p) => p.y - p.r)) - PAD, maxY = Math.max(...proj.map((p) => p.y + p.r)) + PAD;
const W = maxX - minX, Hh = maxY - minY;
const RATIO = `${(W / Hh).toFixed(3)}`;
const pct = (v) => `${+v.toFixed(2)}%`;
const SPHERES = proj
  .map((p, i) => ({ ...p, n: i }))
  .sort((a, b) => a.z - b.z)
  .map((p, i) => `<i style="--x:${pct(((p.x - minX) / W) * 100)};--y:${pct(((maxY - p.y) / Hh) * 100)};--s:${pct(((2 * p.r) / W) * 100)};--i:${i}"></i>`)
  .join("");
const SWARM = `<div class="swarm" aria-hidden="true">${SPHERES}</div>`;
// the box's aspect ratio is a property of the scene, set on the component (not a token)
const swarmCss = base.replace("aspect-ratio: var(--mu-swarm-ratio)", `aspect-ratio: ${RATIO}`);

/* ── 5. Markup ───────────────────────────────────────────────────────── */
let H = page.slice(BODY);
const swap = (from, to) => {
  if (!H.includes(from)) throw new Error("markup not found: " + from.slice(0, 70));
  H = H.replace(from, to);
};
swap('<canvas class="webgl" id="webgl" aria-hidden="true"></canvas>', SWARM);
// Section anchors become "#"; the page's ids, GSAP's .reveal and the section markers go
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ href="#[a-z]*"/g, ' href="#"')
  .replace(/ class="reveal"/g, "")
  .replace(/ reveal"/g, '"')
  .replace(/ class="([^"]*)"/g, (_, l) => ` class="${l.replace(/\s+/g, " ").trim()}"`)
  .replace(/\n {2,}/g, "\n");
const piece = (marker) => sliceEl(H, marker, 0).html;
const at = (marker) => {
  const i = H.indexOf(marker);
  if (i < 0) throw new Error("marker not found: " + marker);
  return i;
};
// The element `marker` that contains (or starts just before) `inside`
const pieceAt = (marker, inside) => sliceEl(H, marker, H.lastIndexOf(marker, at(inside))).html;
const asDiv = (html) => html.replace(/^<(section|footer)/, "<div").replace(/<\/(section|footer)>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const HEADER = piece('<div class="header-inner">');
const HERO = piece('<section class="hero"');
const HERO_TICKET = piece('<a href="#contact" class="ticket wide hero-ticket"');
const SOCIAL = sliceEl(H, "<ul>", at('<div class="desc-inner">')).html;
const LAB_HEAD = pieceAt('<div class="section-head', 'id="studio"');

add("nav", "Header & wordmark", "The header row: the Oswald wordmark set uppercase and tight (--mu-display-brand, 700, -1px), four uppercase links 120px apart whose 2px ink underline wipes in from the left over --mu-dur-wipe, and the black pill on the right (.mu-btn.mu-btn--nav) with its arrow. The links go under 768px.",
  HEADER);

add("buttons", "Buttons & links", "One button: the black pill (.mu-btn), uppercase Oswald 500 on --mu-ink with --mu-paper text. On hover the --mu-gold gradient rises from the bottom over --mu-dur-wipe on --mu-ease-out, the text turns ink and the arrow kicks up and right. .mu-btn--nav is the same pill shrunk for a 64px header. Text links are uppercase with an underline (.mu-mail, a hairline in --mu-mail-line); social links are 40px circles on a --mu-line hairline that fill with --mu-gold on hover.",
  `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:28px 36px">
<a href="#" class="btn">Request early access <i class="arrow" aria-hidden="true">→</i></a>
<a href="#" class="btn btn--nav">Early access <i class="arrow" aria-hidden="true">→</i></a>
<a href="#" class="mail">hello@murmurlabs.ai</a>
${sliceEl(H, '<div class="footer-social">', 0).html}
</div>`);

add("type", "Type, numerals & labels", "Everything is Oswald. Display type is uppercase, heavy and tight: section titles at --mu-display-section (600, .92 line height, -3px) with the second line in the moving --mu-holo foil, and the hero's index numerals at --mu-display-numeral in the same foil with a soft rose glow (.mu-holo-num). Small labels are uppercase Oswald 400-600 at 13-16px; .mu-section-num puts a 20x3px ink dash before an index (02 — Lab). Statements are big and light (300) with the claim in 600.",
  `<div style="display:grid;gap:56px">
<div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px 48px">
<div class="banner-inner" style="min-height:0;height:auto;padding:0">${pieceAt('<div class="top-desc">', '<div class="banner')}</div>
<div style="display:flex;align-items:flex-end;gap:48px"><h1 class="holo-num" aria-hidden="true">X</h1><h1 class="holo-num" aria-hidden="true">01</h1></div>
</div>
${LAB_HEAD.replace('class="section-head reveal"', 'class="section-head" style="margin-bottom:0"')}
<p class="statement" style="max-width:980px">Murmur Labs is an <strong>applied AI research lab</strong>. Intelligence isn't one giant model, it's <span class="accent"><strong>hundreds of specialised agents colliding</strong></span>.</p>
</div>`);

add("hero", "Swarm hero", "The page's opening: a cluster of glossy pink spheres in the middle of a lab-white field, the giant MURMUR wordmark behind it that fades once the spheres have flown in, then the chrome: a two-line kicker with an ink dash, a foil X over a mini admission ticket bottom left, an uppercase line in the middle, a foil 01 with its holographic rule and the social links bottom right, and vertical side text. The intro is CSS and plays once (--mu-dur-intro); the hero is --mu-hero-h tall.",
  asDiv(HERO), { js: true });

add("swarm", "Sphere swarm", "The page's three.js cluster rebuilt in CSS: the scene's own hundred-odd spheres projected through its camera into a box with the cluster's aspect ratio, each an <i> with the --mu-sphere-fill radial gradient placed by --mu-x/--mu-y and sized by --mu-s, drawn back to front under one soft --mu-shadow-swarm. They fly up into place (--mu-dur-swarm-in, staggered by --mu-swarm-stagger), breathe up and down by --mu-breathe, and a fine pointer pushes the nearest ones away (--mu-push) before they ease back. Off screen the breathing pauses; under reduced motion it is still. Add .mu-gold to an <i> for a gold sphere.",
  `<div class="swarm-frame">
${SWARM}
<span class="rotated-text">Hover to perturb the swarm</span>
<p class="swarm-cap"><span>Agents <b>${positions.length}</b></span><span>Median routing <b>40ms</b></span></p>
</div>`, { js: true });

add("stub", "Admission stub & barcode", "The small ticket from the hero (.mu-ticket.mu-wide.mu-hero-ticket): a leaf-shaped ink tag (--mu-radius-tag, 999px 0), a title in Oswald 700 and an \"Admit one\" line on foil, a dashed tear, and a stub with a serial number and a CSS barcode (22 box-shadow bars in ink) over its code. Notches sit either side of the tear (--mu-ticket-notch), the outer edges are perforated (--mu-ticket-perf). Status lines put a ringed dot before an uppercase state: rose for beta and preview, --mu-live for generally available.",
  `<div class="stub-row">
${HERO_TICKET}
<div class="stub-codes">
<div class="barcode-wrap"><p class="stub-label">Product</p><div class="barcode"></div><small>ML-01-2026</small></div>
<div class="barcode-wrap"><p class="stub-label">Model</p><div class="barcode"></div><small>ML-M04</small></div>
<div class="barcode-wrap"><p class="stub-label">Pass</p><div class="barcode"></div><small>ML-EA-2026</small></div>
</div>
<div class="stub-states">
<span class="status ga">Generally available</span>
<span class="status">Public beta</span>
<span class="status">Research preview</span>
</div>
</div>`, { js: true });

add("marquee", "Holographic ticket strip", "A full-bleed foil band tilted -1.6deg with perforated top and bottom edges (--mu-perf over a 22px pitch) and dashed tear lines inside them. The words scroll left over --mu-dur-marquee, alternating solid ink and 1.5px outline, each followed by a small sphere (rose-gold, then pink); a light sweep crosses the strip every --mu-dur-sweep. Hover pauses the scroll.",
  piece('<div class="marquee"'), { js: true });

add("products", "Product tickets", "The products as a grid of three vertical holographic tickets, the middle column dropped 90px. Each ticket is a die-cut foil card (.mu-ticket-bg: a conic gradient of --mu-foil-* under drifting iridescent rings and a pointer-following sheen, cut by an intersecting mask into perforated ends and two side notches above the stub). Inside: a leaf tag and serial (No. 01 ✦), a big uppercase title, a cluster of spheres that spread on hover, a dashed tear, and the stub with a one-line description, a status and a barcode. A huge white watermark numeral sits behind in overlay. Tickets float on --mu-dur-float, out of phase by --mu-i, and tilt toward a fine pointer.",
  asDiv(pieceAt('<section class="section"', 'id="work"')), { js: true });

add("lab", "Statement & stats", "A section head (title with a foil second line, and the index on the right after its dash) over a two-column block: a big light statement with the claim in 600 and a foil phrase, and a short side note above three stats in Oswald 500 at --mu-display-stat with uppercase captions, under a hairline.",
  asDiv(pieceAt('<section class="section"', 'id="studio"')));

add("steps", "Platform steps", "Four steps under hairlines, each with a thin numeral (Oswald 200 at --mu-display-step), an uppercase h3, a light paragraph and outlined uppercase chips. On hover a 3px --mu-gold rule draws across the top over --mu-dur-draw. Two columns under 1200px, one under 768px.",
  asDiv(pieceAt('<section class="section"', 'id="process"')));

add("models", "Model family", "Six tall tickets in a row, each its own foil (the ticket's --mu-holo-1 to --mu-holo-7 set inline) with one sphere sized to the model. Hovering one widens it (flex 1 to 2.4 over --mu-dur-open), opens its description, grows its sphere and slides in its barcode. The last is the ink ticket (.mu-dark): dark foil, paper text, an inverted barcode. Under 1200px they become a grid with everything open.",
  asDiv(pieceAt('<section class="section"', 'id="materials"')), { js: true });

add("quote", "Pull quote", "A centred uppercase quote at --mu-display-quote (500, 1.04 line height, -2px) with one phrase in foil, and a small uppercase citation.",
  asDiv(piece('<section class="quote"')));

add("cta", "Admission CTA", "The closing call as a wide admission ticket (.mu-ticket.mu-wide): perforated left and right, notched top and bottom beside a 320px stub. The main part holds the tag and serial, a giant two-line title at --mu-display-cta with one outlined word, a short paragraph, the black pill and an email link; the stub says Admit One, holds three spheres, the pass name and a barcode. Under 768px the stub drops below and the ticket turns vertical.",
  asDiv(pieceAt('<section class="section"', 'id="contact"')), { js: true });

add("footer", "Footer & wordmark", "Four columns (the lab line, two link lists whose hairline underline wipes in, and round social links) under headings with a short ink dash, then the wordmark across the full width in foil (--mu-gold, 19.5vw, -.04em), a plain-spoken disclaimer, and a bottom row of uppercase small print.",
  asDiv(piece("<footer")));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of swarmCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "mu" && !m[1].startsWith("mu-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("mu-")) CLASSES.add(n);
const KEYFRAMES = ["holo-shift", "marquee-sweep", "marquee", "ticket-float", "holo-drift", "swarm-in", "swarm-breathe", "chrome-in", "chrome-out"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "mu", hex: HEX, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ["tilt"] });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .mu itself, or :where(.mu) in front
const ROOTED = /(^|[\s,(>+~])\.mu(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const a = rule.indexOf("{");
    const prelude = rule.slice(0, a).trim();
    const body = rule.slice(a + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.mu) ${s}`)).join(", ")} {${body}}`;
  }).join("\n");
}
// Headings and controls inherit the root's font inside a host
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.mu) ${t}`).join(", ")} { font-family: inherit; }`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(swarmCss))).trim()}`;
// #0000 and #000 are mask stops (transparent / opaque), not colours
const leftHex = componentCss.match(/#[0-9a-f]{3,6}\b/gi)?.filter((h) => !/^#0{3,4}$/.test(h));
if (leftHex?.length) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Murmur components, no libraries. Everything is delegated from the
     document, so components added later work without setup.
     - Swarm: the fly-in and the breathing are CSS. An IntersectionObserver
       adds .mu-paused to swarms off screen (the breathing stops; the fly-in
       still finishes). A fine pointer pushes the spheres near it away by up to
       --mu-push; they ease back over --mu-dur-orb when it moves on.
     - Tickets: on a fine pointer, .mu-ticket tilts toward the pointer (scaled
       by data-mu-tilt) and moves its sheen (--mu-mx / --mu-my); it settles
       when the pointer leaves. The marquee band's sheen follows the pointer too.
     Under prefers-reduced-motion the push and the tilt are off. */
  var fine = matchMedia('(pointer: fine)');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var all = function (sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); };

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.target.classList.toggle('mu-paused', !e.isIntersecting); });
  }) : null;
  function watch() { if (io) all('.mu-swarm').forEach(function (s) { if (!s._muSeen) { s._muSeen = 1; io.observe(s); } }); }
  watch();
  if ('MutationObserver' in window) new MutationObserver(watch).observe(document.documentElement, { childList: true, subtree: true });

  function push(swarm, x, y) {
    var r = swarm.getBoundingClientRect();
    var reach = r.width * 0.12;
    var max = parseFloat(getComputedStyle(swarm).getPropertyValue('--mu-push')) || 26;
    all('i', swarm).forEach(function (s) {
      var cx = r.left + r.width * parseFloat(s.style.getPropertyValue('--mu-x')) / 100;
      var cy = r.top + r.height * parseFloat(s.style.getPropertyValue('--mu-y')) / 100;
      var dx = cx - x, dy = cy - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      if (d < reach) {
        var k = (1 - d / reach) * max;
        s.style.setProperty('--mu-px', (dx / d * k).toFixed(1) + 'px');
        s.style.setProperty('--mu-py', (dy / d * k).toFixed(1) + 'px');
      } else if (s.style.getPropertyValue('--mu-px')) {
        s.style.removeProperty('--mu-px');
        s.style.removeProperty('--mu-py');
      }
    });
  }
  function settle(swarm) {
    all('i', swarm).forEach(function (s) { s.style.removeProperty('--mu-px'); s.style.removeProperty('--mu-py'); });
  }

  var tilted = null, pushed = null;
  function untilt(t) {
    t.style.transform = '';
    t.style.setProperty('--mu-mx', '50%');
    t.style.setProperty('--mu-my', '30%');
  }
  document.addEventListener('pointermove', function (e) {
    if (!fine.matches || reduced.matches || !e.target.closest) return;
    // The swarm sits under the hero's chrome, so find it by position, not by target
    var host = e.target.closest('.mu-hero, .mu-swarm-frame, .mu-swarm');
    var swarm = host && (host.classList.contains('mu-swarm') ? host : host.querySelector('.mu-swarm'));
    if (pushed && pushed !== swarm) { settle(pushed); pushed = null; }
    if (swarm) { push(swarm, e.clientX, e.clientY); pushed = swarm; }

    var t = e.target.closest('.mu-ticket');
    if (tilted && tilted !== t) { untilt(tilted); tilted = null; }
    if (t) {
      var r = t.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      var k = parseFloat(t.getAttribute('data-mu-tilt') || 1);
      t.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 10 * k) + 'deg) rotateY(' + ((px - 0.5) * 12 * k) + 'deg)';
      t.style.setProperty('--mu-mx', px * 100 + '%');
      t.style.setProperty('--mu-my', py * 100 + '%');
      tilted = t;
    }
    var band = e.target.closest('.mu-marquee-band');
    if (band) {
      var b = band.getBoundingClientRect();
      band.style.setProperty('--mu-mx', (e.clientX - b.left) / b.width * 100 + '%');
      band.style.setProperty('--mu-my', (e.clientY - b.top) / b.height * 100 + '%');
    }
  });
  document.documentElement.addEventListener('pointerleave', function () {
    if (tilted) { untilt(tilted); tilted = null; }
    if (pushed) { settle(pushed); pushed = null; }
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.mu a[href="#"]');
    if (a) e.preventDefault();
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: a section head and the hero's admission ticket, their words swapped for the system's
const TOP_TICKET = HERO_TICKET
  .replace(/ data-tilt="[^"]*"/, ' data-tilt="0.8"')
  .replace(/ aria-label="[^"]*"/, ' aria-label="Murmur design system, see the components"')
  .replace('href="#contact"', 'href="#c-hero"')
  .replace(/(<span class="tag">)[^<]*/, "$1Design system")
  .replace(/(<p class="ht-title">)[^<]*/, `$1Murmur ${VERSION}`)
  .replace(/(<p class="ht-sub">)[^<]*/, `$1Admit one · ${C.length} components`)
  .replace(/(<span class="ht-no">No\. <b>)[^<]*/, "$1030")
  .replace(/(<small>)[^<]*/, "$1MU-100");
const TOP = `<div class="sp-head-top">
<div>
<h1 class="section-title">The Murmur<br><span class="accent">System</span></h1>
<p class="sp-lede">Lab-white paper, condensed uppercase Oswald, foil numerals, black pills and die-cut holographic tickets with perforations and barcodes, around a swarm of glossy pink spheres.</p>
</div>
${TOP_TICKET}
</div>`;
const CHROME = `
body{margin:0;background:var(--mu-paper)}
.mu{background:var(--mu-page)}
.sp-top{padding:16px var(--mu-gutter) 40px;border-bottom:var(--mu-hair) solid var(--mu-line)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;padding-bottom:16px;border-bottom:var(--mu-hair) solid var(--mu-line)}
.sp-head-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:40px;padding-top:72px}
.sp-head-top .mu-section-title{margin:0}
.sp-lede{max-width:560px;margin:24px 0 0;font:300 var(--mu-lede)/1.35 var(--mu-font-text)}
.sp-label{display:flex;align-items:center;gap:12px;margin:0;font:500 var(--mu-caption)/1.4 var(--mu-font-text);text-transform:uppercase;color:var(--mu-ink)}
.sp-label::before{content:"";width:20px;height:var(--mu-rule);background:var(--mu-ink);border-radius:var(--mu-radius-pill);flex:none}
.sp-main{padding:0 var(--mu-gutter) 120px}
.sp-sec{padding:96px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:8px 48px;align-items:end;margin-bottom:24px;padding-bottom:20px;border-bottom:var(--mu-hair) solid var(--mu-line)}
.sp-head h2{margin:12px 0 0;font:600 clamp(36px,4.4vw,60px)/.92 var(--mu-font-display);text-transform:uppercase;letter-spacing:-2px}
.sp-note{margin:0;max-width:720px;font:300 15px/1.45 var(--mu-font-text)}
.sp-demo{position:relative;overflow:clip;padding:clamp(20px,3vw,40px);background:var(--mu-page);border:var(--mu-hair) solid var(--mu-line);border-radius:var(--mu-radius-wide)}
.sp-demo>.mu-hero{margin:calc(-1 * clamp(20px,3vw,40px))}
.sp-demo>.mu-section{padding:8px 0}
.sp-demo>.mu-quote{padding:60px 0}
.sp-demo>.mu-marquee{margin:0 calc(-1 * clamp(20px,3vw,40px))}
.sp-demo>.mu-footer{padding:8px 0 0;border-top:0}
@media (max-width:899px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.sp-head-top{padding-top:40px}.sp-head-top .mu-section-title{font-size:48px;letter-spacing:-1.5px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">murmur@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(TOP))}
</header>`;
const DEFS = `<svg id="mu-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"></svg>`;
const specimen = renderSpecimen({
  name: "Murmur",
  slug: "murmur",
  version: VERSION,
  prefix: "mu",
  rootClass: "mu",
  labelClass: "sp-label",
  script: "scripts/systems/murmur.mjs",
  source: SOURCE,
  metaDescription: "The Murmur design system: tokens and working components extracted from the Murmur Labs holographic ticket page.",
  defsNote: "empty: Murmur draws with CSS only (tickets, barcodes, spheres and the swarm are gradients, masks and box-shadows)",
  jsNote: "the swarm's off-screen pause and pointer push, the ticket tilt and sheen, the marquee sheen; no libraries",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});
if (/<canvas|<script src|THREE\.|gsap\.|base64/.test(specimen)) throw new Error("the specimen carries a canvas or a library");

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "murmur", prefix: "mu", rootClass: "mu", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn--nav", "ticket", "ticket-bg", "tag", "barcode", "orb", "swarm", "hero", "marquee", "section", "section-title", "accent", "holo-num", "card", "step", "swatch", "footer", "stats", "status", "mail"] });
