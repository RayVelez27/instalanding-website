// Extracts the Mnemo design system from its landing page.
//
//   node scripts/systems/mnemo.mjs
//
// Reads public/demos/mnemo-context-window.html (never edits it) and writes
// public/systems/mnemo/ (specimen.html, tokens.css, mnemo.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style> (a base pass,
// then a "hero refresh" that overrides it); the system keeps all of it but the
// document shell (html, :root and the fixed film-grain overlay on body::after,
// which would sit over a host page). Its three fixed layers (the nav, the menu
// scrim and the sheet) become position:absolute: a page pins them with fixed.
// The page has no images or canvas: the aperture, the pills, the dome and the
// marks are CSS and inline SVG, so everything comes across.
// What the page's script writes at boot is written here at build time, by the
// page's own data: the JSON response in the terminal window (its MODES table)
// and the eviction console's span strip, ring, legend and verdict (its RUN and
// the policy walk, run once with the page's starting settings). The component
// script keeps what the page does on input: the aperture parallax, the policy
// switches and budget slider, the prompt bar's modes and run, the menu sheet
// and the subscribe form.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/mnemo-context-window.html";
const { page, BODY, css: pageCss, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
if (!FONTS.includes("Barlow+Condensed")) throw new Error("font link not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. The page's own
   custom-property names (--bg-1, --nm-lit, --g-warm, --cubic ...) keep their
   names under mn-. Group comments are what the SYSTEMS board lays its panels
   out by. */
const TOKENS = `/* InstaLanding design system · Mnemo · mnemo@${VERSION}
   Extracted from https://instalanding.ai/demos/mnemo-context-window.html
   Fonts: Barlow 300-900 and Barlow Condensed 400-700 (Google Fonts) */
:root {
  /* Color · core */
  --mn-bg-1: #5531B8;
  --mn-bg-2: #2A0F6E;
  --mn-bg-3: #1A0B4A;
  --mn-white: #FFFFFF;
  --mn-coral: #FF6B7D;
  --mn-cream: #FFE8A3;

  /* Color · soft UI light & shade */
  --mn-nm-lit: #7254DC;
  --mn-nm-dim: #3A1C92;

  /* Color · accent */
  --mn-ember: #FF7A5C;
  --mn-indigo: #6F63FF;
  --mn-magenta: #F25CFF;
  --mn-amber: #FFAD5C;
  --mn-lilac: #A48AF0;
  --mn-mauve: #C9B8FF;
  --mn-gold: #FFC56A;
  --mn-rose: #FFB0BD;
  --mn-lime: #C6FF4A;
  --mn-ink-deep: #2A0F5E;
  --mn-badge-dot: #FFB35C;

  /* Color · gradients */
  --mn-g-warm: linear-gradient(90deg, #FFE8A3 0%, #FF7A5C 100%);
  --mn-g-cool: linear-gradient(90deg, #6F63FF 10%, #F25CFF 95%);

  /* Color · drifting pills */
  --mn-pill-cool-a: #5B5CFF;
  --mn-pill-cool-b: #E25CFF;
  --mn-pill-warm-a: #FFC98A;
  --mn-pill-warm-b: #FF6F91;
  --mn-pill-coral-a: #FF9468;
  --mn-pill-coral-b: #FF5FA8;
  --mn-pill-peach: #FFBF8A;
  --mn-pill-ember: #FF8A6B;
  --mn-pill-pink-a: #FF6F9A;
  --mn-pill-pink-b: #E55CFF;

  /* Color · aperture */
  --mn-disc-hi: #6A45D6;
  --mn-disc-lo: #4A28A6;
  --mn-lens-hi: #6040CC;
  --mn-lens-lo: #5230B2;
  --mn-mark-hi: #6A45E0;

  /* Color · headline & send */
  --mn-hl-1: #FFE08A;
  --mn-hl-2: #FFB27A;
  --mn-hl-3: #FF6FA0;
  --mn-hl-4: #E65CFF;
  --mn-go-a: #FFBF5C;
  --mn-go-b: #FF6F7D;
  --mn-em-b: #FF7D8F;
  --mn-em-c: #FF5FB0;
  --mn-cta-a: #FFC35E;
  --mn-cta-b: #FF8A7A;

  /* Color · finale dome */
  --mn-finale-mid: #4A28A8;
  --mn-finale-deep: #3C1D95;
  --mn-dome-1: #B48CFF;
  --mn-dome-2: #8A5CF5;
  --mn-dome-3: #6A3FE0;
  --mn-dome-4: #4F2BB8;
  --mn-orbit-1: #E2DDFF;
  --mn-orbit-2: #FF9070;
  --mn-orbit-3: #FFE0FF;
  --mn-orbit-4: #FF6FE0;
  --mn-orbit-5: #FF7A70;

  /* Type · families */
  --mn-font-sans: "Barlow", system-ui, sans-serif;
  --mn-font-cond: "Barlow Condensed", "Barlow", sans-serif;
  --mn-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Type · scale */
  --mn-display: clamp(44px, 7.6vw, 96px);
  --mn-h2-card: clamp(34px, 4.6vw, 52px);
  --mn-h2: clamp(30px, 4vw, 44px);
  --mn-stat: 42px;
  --mn-h3: 21px;
  --mn-lead: 19px;
  --mn-body: 15.5px;
  --mn-eyebrow: 15px;
  --mn-code: 13px;

  /* Shape · radii */
  --mn-radius-pill: 999px;
  --mn-radius-piece: 80px;
  --mn-radius-xl: 32px;
  --mn-radius-nav: 30px;
  --mn-radius-panel: 26px;
  --mn-radius-plan: 24px;
  --mn-radius-card: 22px;
  --mn-radius-stat: 20px;
  --mn-radius-well: 18px;
  --mn-radius-strip: 16px;
  --mn-radius-control: 14px;
  --mn-radius-sm: 12px;
  --mn-radius-tab: 10px;
  --mn-radius-xs: 6px;

  /* Shape · borders */
  --mn-hairline: 1px;

  /* Depth · soft UI */
  --mn-raise: -10px -10px 30px 0 var(--mn-nm-lit), 10px 10px 30px 0 rgba(22, 6, 72, 0.55);
  --mn-raise-sm: -4px -4px 10px 0 var(--mn-nm-lit), 4px 4px 10px 0 rgba(22, 6, 72, 0.5);
  --mn-raise-xs: -3px -3px 6px 0 var(--mn-nm-lit), 3px 3px 6px 0 rgba(22, 6, 72, 0.5);
  --mn-press: inset -10px -10px 10px 0 rgba(130, 100, 240, 0.5), inset 10px 10px 10px 0 var(--mn-nm-dim);
  --mn-press-sm: inset -4px -4px 6px 0 rgba(130, 100, 240, 0.45), inset 4px 4px 6px 0 var(--mn-nm-dim);
  --mn-well: inset -6px -6px 8px 0 rgba(130, 100, 240, 0.42), inset 6px 6px 8px 0 var(--mn-nm-dim);
  --mn-inner: inset -10px -10px 10px 0 rgba(22, 6, 72, 0.4), inset 10px 10px 10px 0 var(--mn-nm-lit);

  /* Depth · aperture */
  --mn-aperture: inset 0 2px 0 rgba(200, 170, 255, 0.35), inset 0 0 0 1px rgba(190, 160, 255, 0.18), inset -18px -18px 40px 0 rgba(22, 6, 72, 0.35), inset 18px 18px 40px 0 rgba(150, 120, 255, 0.25), 0 30px 90px -20px rgba(22, 6, 72, 0.55);
  --mn-lens: inset 0 0 0 1px rgba(190, 160, 255, 0.12), inset 0 20px 50px -10px rgba(22, 6, 72, 0.45), inset 0 -10px 40px -10px rgba(150, 120, 255, 0.25);
  --mn-blur-mid: blur(10px);
  --mn-blur-far: blur(16px);

  /* Depth · glass & glow */
  --mn-glass: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 24px 60px -18px rgba(22, 6, 72, 0.75), 0 0 50px -10px rgba(170, 110, 255, 0.35);
  --mn-glass-card: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 40px 90px -30px rgba(15, 3, 55, 0.85), 0 0 70px -20px rgba(200, 110, 255, 0.45);
  --mn-badge-glow: 0 0 24px -4px rgba(180, 120, 255, 0.45);
  --mn-go-glow: 0 10px 24px -6px rgba(255, 110, 120, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.45);
  --mn-lift: 0 15px 20px rgba(43, 12, 85, 0.5);
  --mn-frost: blur(16px) saturate(1.3);
  --mn-frost-nav: blur(18px) saturate(1.4);
  --mn-frost-card: blur(22px) saturate(1.35);

  /* Motion · easing */
  --mn-cubic: cubic-bezier(0.4, 0.35, 0, 1.53);
  --mn-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --mn-iris: cubic-bezier(1, 0.06, 0.25, 1);

  /* Motion · durations */
  --mn-dur-quick: 0.25s;
  --mn-dur-press: 0.35s;
  --mn-dur-surface: 0.4s;
  --mn-dur-lift: 0.7s;
  --mn-dur-iris: 0.8s;
  --mn-dur-rise: 0.9s;
  --mn-dur-breathe: 7s;
  --mn-dur-sway: 13s;
  --mn-dur-orbit: 90s;

  /* Space · layout */
  --mn-wrap: 1140px;
  --mn-gutter: 44px;
  --mn-sec: 104px;
  --mn-stage-top: 132px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under mn- (--sans -> --mn-font-sans, --cond -> --mn-font-cond);
// its local ones (--s stagger, --v slider, --w span weight, --i / --base code lines, --dx sway, --a/--c/--g orbit dots) move too
const VARS = { sans: "font-sans", cond: "font-cond" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("mn-") ? m : `--mn-${VARS[n] ?? n}`));
// Six-digit keys only; "#fff" last so it can't eat the start of a longer one (the normaliser also refuses a following hex digit)
const HEX = {
  "#5531b8": "bg-1", "#2a0f6e": "bg-2", "#1a0b4a": "bg-3", "#ff6b7d": "coral", "#ffe8a3": "cream",
  "#7254dc": "nm-lit", "#3a1c92": "nm-dim",
  "#ff7a5c": "ember", "#6f63ff": "indigo", "#f25cff": "magenta", "#ffad5c": "amber", "#a48af0": "lilac", "#c9b8ff": "mauve",
  "#ffc56a": "gold", "#ffb0bd": "rose", "#c6ff4a": "lime", "#2a0f5e": "ink-deep", "#ffb35c": "badge-dot",
  "#5b5cff": "pill-cool-a", "#e25cff": "pill-cool-b", "#ffc98a": "pill-warm-a", "#ff6f91": "pill-warm-b",
  "#ff9468": "pill-coral-a", "#ff5fa8": "pill-coral-b", "#ffbf8a": "pill-peach", "#ff8a6b": "pill-ember",
  "#ff6f9a": "pill-pink-a", "#e55cff": "pill-pink-b",
  "#6a45d6": "disc-hi", "#4a28a6": "disc-lo", "#6040cc": "lens-hi", "#5230b2": "lens-lo", "#6a45e0": "mark-hi",
  "#ffe08a": "hl-1", "#ffb27a": "hl-2", "#ff6fa0": "hl-3", "#e65cff": "hl-4", "#ffbf5c": "go-a", "#ff6f7d": "go-b",
  "#ff7d8f": "em-b", "#ff5fb0": "em-c", "#ffc35e": "cta-a", "#ff8a7a": "cta-b",
  "#4a28a8": "finale-mid", "#3c1d95": "finale-deep", "#b48cff": "dome-1", "#8a5cf5": "dome-2", "#6a3fe0": "dome-3", "#4f2bb8": "dome-4",
  "#e2ddff": "orbit-1", "#ff9070": "orbit-2", "#ffe0ff": "orbit-3", "#ff6fe0": "orbit-4", "#ff7a70": "orbit-5",
  "#ffffff": "white", "#fff": "white",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A value as the page writes it, tolerant of the spacing it varies after commas (and line breaks in long shadows)
const loose = (v) => new RegExp(esc(v).replace(/,\s*/g, ",\\s*"), "g");
const val = (v, tok) => [loose(v), `var(--mn-${tok})`];
// A rule's own font-size (after keep() the selector sits flush against its brace)
const size = (sel, v, tok) => [new RegExp(`(${esc(sel)}\\{[^}]*?font-size: )${esc(v)}`), `$1var(--mn-${tok})`];
const SWAPS = [
  // Type: each class's base size (the breakpoints keep their literal steps)
  [/font-size: clamp\(44px, 7\.6vw, 96px\)/, "font-size: var(--mn-display)"],
  [/font-size: clamp\(34px, 4\.6vw, 52px\)/, "font-size: var(--mn-h2-card)"],
  [/font-size: clamp\(30px, 4vw, 44px\)/, "font-size: var(--mn-h2)"],
  size(".stat b", "42px", "stat"), size(".card h3", "21px", "h3"), size(".hero .sub", "19px", "lead"),
  size(".card p", "15.5px", "body"), size(".eyebrow", "15px", "eyebrow"), size(".code", "13px", "code"),
  [/ui-monospace, SFMono-Regular, Menlo, (Consolas, )?monospace/g, "var(--mn-font-mono)"],
  // Depth: shadows as written on the page, longest first
  val("inset 0 2px 0 rgba(200, 170, 255, 0.35), inset 0 0 0 1px rgba(190, 160, 255, 0.18), inset -18px -18px 40px 0 rgba(22, 6, 72, 0.35), inset 18px 18px 40px 0 rgba(150, 120, 255, 0.25), 0 30px 90px -20px rgba(22, 6, 72, 0.55)", "aperture"),
  val("inset 0 0 0 1px rgba(190, 160, 255, 0.12), inset 0 20px 50px -10px rgba(22, 6, 72, 0.45), inset 0 -10px 40px -10px rgba(150, 120, 255, 0.25)", "lens"),
  val("inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 40px 90px -30px rgba(15, 3, 55, 0.85), 0 0 70px -20px rgba(200, 110, 255, 0.45)", "glass-card"),
  val("inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 24px 60px -18px rgba(22, 6, 72, 0.75), 0 0 50px -10px rgba(170, 110, 255, 0.35)", "glass"),
  val("0 10px 24px -6px rgba(255, 110, 120, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.45)", "go-glow"),
  val("-10px -10px 30px 0 var(--mn-nm-lit), 10px 10px 30px 0 rgba(22, 6, 72, 0.55)", "raise"),
  val("-4px -4px 10px 0 var(--mn-nm-lit), 4px 4px 10px 0 rgba(22, 6, 72, 0.5)", "raise-sm"),
  val("-3px -3px 6px 0 var(--mn-nm-lit), 3px 3px 6px 0 rgba(22, 6, 72, 0.5)", "raise-xs"),
  val("inset -10px -10px 10px 0 rgba(130, 100, 240, 0.5), inset 10px 10px 10px 0 var(--mn-nm-dim)", "press"),
  val("inset -4px -4px 6px 0 rgba(130, 100, 240, 0.45), inset 4px 4px 6px 0 var(--mn-nm-dim)", "press-sm"),
  val("inset -6px -6px 8px 0 rgba(130, 100, 240, 0.42), inset 6px 6px 8px 0 var(--mn-nm-dim)", "well"),
  val("inset -10px -10px 10px 0 rgba(22, 6, 72, 0.4), inset 10px 10px 10px 0 var(--mn-nm-lit)", "inner"),
  val("0 0 24px -4px rgba(180, 120, 255, 0.45)", "badge-glow"),
  val("0 15px 20px rgba(43, 12, 85, 0.5)", "lift"),
  [/blur\(22px\) saturate\(1\.35\)/g, "var(--mn-frost-card)"],
  [/blur\(18px\) saturate\(1\.4\)/g, "var(--mn-frost-nav)"],
  [/blur\(16px\) saturate\(1\.3\)/g, "var(--mn-frost)"],
  [/(\.l-two \.piece\{ filter: )blur\(10px\)/, "$1var(--mn-blur-mid)"],
  [/(\.l-three \.piece\{ filter: )blur\(16px\)/, "$1var(--mn-blur-far)"],
  // Shape: 40px and 50px are the page's other pill radii (controls shorter than 40px), so they read as pills
  ...[[999, "pill"], [80, "piece"], [50, "pill"], [40, "pill"], [32, "xl"], [30, "nav"], [26, "panel"], [24, "plan"], [22, "card"], [20, "stat"],
    [18, "well"], [16, "strip"], [14, "control"], [12, "sm"], [10, "tab"], [6, "xs"]]
    .map(([px, t]) => [new RegExp(`border-radius: ${px}px(?=[;\\s}])`, "g"), `border-radius: var(--mn-radius-${t})`]),
  [/(border(?:-top|-left|-bottom)?: )1px solid/g, "$1var(--mn-hairline) solid"],
  // Space
  [/width: min\(1140px, 100% - 44px\)/, "width: min(var(--mn-wrap), 100% - var(--mn-gutter))"],
  [/(\.sec\{ padding: )104px 0/, "$1var(--mn-sec) 0"],
  [/padding: 132px 0 0/, "padding: var(--mn-stage-top) 0 0"],
  // Motion: the page's timings, in the pairs it writes them
  [/0\.8s 0\.4s cubic-bezier\(1, 0\.06, 0\.25, 1\)/g, "var(--mn-dur-iris) 0.4s var(--mn-iris)"],
  [/0\.8s cubic-bezier\(1, 0\.06, 0\.25, 1\)/g, "var(--mn-dur-iris) var(--mn-iris)"],
  [/13s cubic-bezier\(1, 0\.06, 0\.25, 1\)/g, "var(--mn-dur-sway) var(--mn-iris)"],
  [/cubic-bezier\(1, 0\.06, 0\.25, 1\)/g, "var(--mn-iris)"],
  [/0\.35s var\(--mn-cubic\)/g, "var(--mn-dur-press) var(--mn-cubic)"],
  [/0\.4s var\(--mn-ease\)/g, "var(--mn-dur-surface) var(--mn-ease)"],
  [/0\.9s( [\d.]+s)? var\(--mn-ease\)/g, "var(--mn-dur-rise)$1 var(--mn-ease)"],
  [/0\.7s( [\d.]+s)? var\(--mn-ease\)/g, "var(--mn-dur-lift)$1 var(--mn-ease)"],
  [/7s 2\.5s ease-in-out/g, "var(--mn-dur-breathe) 2.5s ease-in-out"],
  [/90s linear/g, "var(--mn-dur-orbit) linear"],
  [/0\.25s ease/g, "var(--mn-dur-quick) ease"],
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
// Page-only: the document shell and the fixed film grain (a z-index 50 overlay would sit over a host page). :root becomes the tokens.
const DROP = /^(html|:root|body::after)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.mn, .mn *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.mn, .mn *)${sel.slice(1)}`;
  if (sel === "body") return ".mn";
  // The page styles its one <nav> by tag; the system gives it a class
  return sel.replace(/^nav(?=[.\s]|$)/, ".nav");
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
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // The nav, its scrim and its sheet sit inside whatever holds them; a page pins them with position: fixed
  .replace(/position: fixed/g, "position: absolute")
  // Data attributes the script and the CSS share move under mn- too
  .replace(/\[data-(s|type|cited)(?=[=\]])/g, "[data-mn-$1");
const base = renameVars(keep(pageRules));

/* ── 4. What the page's script writes, written at build time ─────────── */
const grab = (from, to) => {
  const a = page.indexOf(from), b = page.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error("page script marker not found: " + from);
  return page.slice(a, b);
};
// The page's invented run and its four prompt-bar modes, as the page declares them
const RUN = new Function(`${grab("const RUN = [", "const STUB")}\nreturn RUN;`)();
const MODES_SRC = grab("const MODES = {", "let mode = ").trim();
const MODES = new Function(`${MODES_SRC}\nreturn MODES;`)();

/* The eviction policy, as the page walks it: pins stay whatever they cost; then, newest first,
   each unpinned span is kept while it fits, and the first that doesn't goes with everything
   older (leaving a 2K stub each when summarise is on). Shared by the build and the component script. */
const POLICY_SRC = `function mnPolicy(run, budget, pinTool, pinCited, stubs) {
    var STUB = 2, C = 2 * Math.PI * 91, GAP = 3;
    function fmt(k) { return k.toLocaleString('en-US') + 'K'; }
    function pinned(s) { return (pinTool && s.type === 'tool') || (pinCited && s.cited); }
    var state = run.map(function (s) { return pinned(s) ? 'pin' : null; });
    var pinK = 0, total = 0;
    run.forEach(function (s) { total += s.size; if (pinned(s)) pinK += s.size; });
    var free = run.filter(function (s) { return !pinned(s); }).reverse(), used = pinK, cut = false;
    free.forEach(function (s, j) {
      var olderStubs = stubs ? (free.length - j - 1) * STUB : 0;
      if (!cut && used + s.size + olderStubs <= budget) { state[s.i] = 'keep'; used += s.size; }
      else { cut = true; state[s.i] = stubs ? 'stub' : 'gone'; }
    });
    function sum(k) { var a = 0; run.forEach(function (s) { if (state[s.i] === k) a += s.size; }); return a; }
    function count(k) { return state.filter(function (x) { return x === k; }).length; }
    var keepK = sum('keep'), goneN = count('stub') + count('gone'), goneK = sum('stub') + sum('gone'), stubK = count('stub') * STUB;
    var inUse = pinK + keepK + stubK, over = pinK > budget, scale = Math.max(budget, inUse);
    function arc(from, len) {
      var L = Math.max(0, len * C - (len > 0 ? GAP : 0));
      return { dash: L.toFixed(2) + ' ' + C.toFixed(2), offset: (-from * C).toFixed(2), opacity: len > 0 ? 1 : 0 };
    }
    var bits = [];
    if (pinTool) bits.push(run.filter(function (s) { return s.type === 'tool'; }).length + ' tool results');
    if (pinCited) bits.push(run.filter(function (s) { return s.cited && !(pinTool && s.type === 'tool'); }).length + (pinTool ? ' more cited spans' : ' cited spans'));
    var txt = bits.length ? '<b>Pinned ' + bits.join(' and ') + '</b> (' + fmt(pinK) + '). ' : '<b>Nothing is pinned</b>, so age alone decides. ';
    if (over) txt += '<b class="mn-warn">Pins alone need ' + fmt(pinK) + ', over the ' + fmt(budget) + ' budget.</b> Raise it or unpin something.';
    else if (!goneN) txt += 'Everything fits, with ' + fmt(budget - inUse) + ' to spare.';
    else txt += 'The ' + goneN + ' oldest unpinned span' + (goneN > 1 ? 's' : '') + ' (' + fmt(goneK) + ') ' + (goneN > 1 ? 'were' : 'was') + ' evicted' +
      (stubs ? ', <b>each leaving a stub</b>, so the run still reads in order.' : ', <b>leaving holes</b> in the run.');
    return {
      state: state, over: over, pct: Math.round(inUse / budget * 100), verdict: txt,
      total: run.length + ' spans · ' + fmt(total) + ' written',
      legend: { pin: fmt(pinK), keep: fmt(keepK), stub: fmt(stubK), gone: fmt(goneK), pinZero: !pinK },
      arcs: { pin: arc(0, pinK / scale), keep: arc(pinK / scale, keepK / scale), stub: arc((pinK + keepK) / scale, stubK / scale) }
    };
  }`;
const policy = new Function(`${POLICY_SRC}\nreturn mnPolicy;`)();
const NAME = { turn: "turn", tool: "tool result", doc: "document" };
const STATE = { pin: "pinned", keep: "kept", stub: "evicted, stub left", gone: "evicted" };
const spanTitle = (s, st) => `Span ${s.i + 1} · ${NAME[s.type]}${s.cited ? ", cited" : ""} · ${s.size.toLocaleString("en-US")}K · ${STATE[st]}`;

/* The terminal's JSON, highlighted line by line as the page's render() does it */
const RENDER_SRC = `function mnRender(obj) {
    var html = JSON.stringify(obj, null, 2).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; })
      .replace(/("(?:[^"\\\\]|\\\\.)*")(\\s*:)?|\\b(true|false|null)\\b|(-?\\d+(?:\\.\\d+)?)/g, function (m, str, colon, lit, num) {
        if (str) return colon ? '<span class="mn-k">' + str + '</span>' + colon : '<span class="mn-s">' + str + '</span>';
        if (lit) return '<span class="mn-b">' + lit + '</span>';
        return '<span class="mn-n">' + num + '</span>';
      });
    return html.split('\\n').map(function (l, i) { return '<span class="mn-ln" style="--mn-i:' + i + '">' + l + '</span>'; }).join('');
  }`;
const render = new Function(`${RENDER_SRC}\nreturn mnRender;`)();

// The page's starting settings: a 620K budget, tool results and cited spans pinned, no stubs
const BUDGET = +/id="budget"[^>]*value="(\d+)"/.exec(page)[1];
const P = policy(RUN.map((s) => ({ ...s })), BUDGET, true, true, false);

let H = page.slice(BODY);
const put = (re, to) => { if (!re.test(H)) throw new Error("not found: " + re); H = H.replace(re, to); };
// Strip: three rows of eight, each span as wide as it is heavy (written in page vocabulary; prefixed below)
const strip = [0, 1, 2].map((r) => `<div class="strip-row">${RUN.slice(r * 8, r * 8 + 8).map((s) =>
  `<span class="span" style="--w:${s.size}" data-type="${s.type}"${s.cited ? ' data-cited=""' : ""} data-s="${P.state[s.i]}" title="${spanTitle(s, P.state[s.i])}"></span>`).join("")}</div>`).join("\n");
put(/(<div class="strip nm nm--inset" id="strip" aria-hidden="true">)(<\/div>)/, `$1\n${strip}\n$2`);
put(/(<span id="runTotal">)[^<]*/, `$1${P.total}`);
put(/(id="dialVal">)[^<]*/, `$1${P.pct}%`);
put(/(id="dialSub">)[^<]*/, `$1${P.over ? "over" : "in use"}`);
for (const k of ["pin", "keep", "stub", "gone"]) put(new RegExp(`(id="lg${k[0].toUpperCase() + k.slice(1)}">)[^<]*`), `$1${P.legend[k]}`);
put(/<li class="k-stub">/, '<li class="k-stub dim">');
for (const k of ["pin", "keep", "stub"]) {
  const a = P.arcs[k];
  put(new RegExp(`<circle class="seg ${k}" ([^/]*)/>`), `<circle class="seg ${k}" $1style="stroke-dasharray:${a.dash};stroke-dashoffset:${a.offset};opacity:${a.opacity}" />`);
}
put(/(<p class="verdict" id="verdict" aria-live="polite">)(<\/p>)/, `$1${P.verdict.replace(/mn-warn/g, "warn")}$2`);
// The switches say which rule they set, so the script can read the policy without the page's ids
put(/ id="sw1"/, ' data-rule="tool"'); put(/ id="sw2"/, ' data-rule="cited"'); put(/ id="sw3"/, ' data-rule="stub"');
// The budget's sr-only <label for> becomes the range's own aria-label (ids don't survive)
put(/\s*<label class="sr" for="budget">Window budget<\/label>/, "");
put(/<input id="budget" type="range"/, '<input type="range" aria-label="Window budget"');
// Terminal: the Open mode's response, as the page paints it once the window lands
put(/<pre class="code" id="code"><\/pre>/, `<pre class="code" style="--base:600ms">${render(MODES.open.out("")).replace(/mn-(k|s|b|n|ln)\b/g, "$1")}</pre>`);

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// Section anchors become "#"; ids, for= and aria-controls/labelledby go (the script hooks are classes and data attributes)
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-component="[^"]*"/g, "")
  .replace(/ id="(?!mk-|fk-|spark")[^"]*"/g, "")
  .replace(/ aria-(controls|labelledby)="[^"]*"/g, "")
  .replace(/ href="#[a-z]*"/g, ' href="#"')
    .replace(/\n {2,}/g, "\n");
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
const inSection = (name, marker) => piece(marker, H.indexOf(`data-section="${name}"`));
const cut = (html, marker) => { const s = sliceEl(html, marker); return html.slice(0, html.indexOf(marker)) + html.slice(s.end); };

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

// The hero stage without its window and logo strip (each is its own component below)
const STAGE = cut(cut(piece('<header class="stage"'), '<div class="preview wrap"'), '<div class="trust wrap">')
  .replace(/^<header class="stage"/, '<div class="stage" style="padding-bottom:88px"').replace(/<\/header>$/, "</div>");

add("buttons", "Buttons & chips", "Buttons are pills in uppercase 12px Barlow at 1.4px tracking: .mn-btn--solid is white on the violet with a deep --mn-lift shadow and turns coral as it sinks 5px on hover; .mn-btn--ghost is a 40% white outline. The nav's Sign up is a frosted pill with a violet glow, the send button an orange-to-coral tile (--mn-go-glow), the burger a raised soft-UI disc whose bars fold into a cream cross. Chips: the frosted .mn-badge (a glowing amber dot, --mn-badge-glow) and the condensed cream .mn-eyebrow label.",
  `<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center">
${inSection("pricing", '<button class="btn btn--solid"')}
${inSection("pricing", '<button class="btn btn--ghost"')}
${piece('<a class="signup nm nm--offset"')}
${piece('<button class="go" type="submit"').replace('type="submit"', 'type="button"')}
${piece('<button class="burger"')}
</div>
<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:center;margin-top:28px">
${piece('<span class="badge">')}
${inSection("features", '<p class="eyebrow">').replace('class="eyebrow"', 'class="eyebrow" style="margin:0"')}
${inSection("pricing", '<span class="plan-name">')}
</div>`, { js: true });

add("surfaces", "Soft-UI wells & switches", "The soft-UI trick: a surface filled with the same flat --mn-bg-1 as the page, lit from the top left (--mn-nm-lit) and shaded bottom right. .mn-nm--offset raises it (--mn-raise on ::before), .mn-nm--inset presses it in (--mn-press on ::after), .mn-nm--inner gives a pillowed dot (--mn-inner). Switches and the slider are wells (--mn-well) holding a raised knob that slides on --mn-cubic and turns coral, and a warm-gradient fill.",
  `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px;align-items:center">
${piece('<div class="stat nm nm--inset">')}
${inSection("pricing", '<div class="price nm nm--inset">')}
<div style="display:flex;gap:28px;align-items:center;justify-content:center">
${piece('<div class="dot nm nm--inner"')}
${inSection("console", '<button class="sw" type="button" data-rule="tool"').replace(' data-rule="tool"', "")}
${inSection("console", '<button class="sw" type="button" data-rule="stub"').replace(' data-rule="stub"', "")}
</div>
</div>
<div style="margin-top:32px;max-width:520px">
${inSection("console", '<div class="slider">')}
</div>`, { js: true });

add("hero", "Recessed aperture hero", "A faint 96px grid on the flat violet, a big recessed disc (--mn-aperture, lit as a dome) with a smaller lens inside it, and three depth layers of gradient pills that sway outward on --mn-dur-sway: the nearest crisp cool pills, then warm ones at --mn-blur-mid, then coral at --mn-blur-far. The layers follow the pointer at their data-mn-depth. Over it: the frosted badge, a 900-weight headline whose lines rise out of masks with a yellow-to-pink phrase, the sub, a dark chip and the prompt bar, all under a breathing coral glow.",
  STAGE, { js: true });

add("ask", "Prompt bar", "A frosted glass card (--mn-frost over a 26% violet, --mn-glass) holding an input with a page icon, then a bar: a pressed-in tab well (--mn-press-sm) whose selected tab rises out of it (--mn-raise-xs), each tab with its own little pill mark and a condensed New tag, and the orange send tile. Choosing a tab changes the placeholder; sending dims the window's code, blinks its status coral and writes the response back in.",
  piece('<form class="ask nm nm--offset"'), { js: true });

add("window", "Terminal window", "A glass window: traffic dots and a pressed mnemo:// url well, a skeleton of the page on the left (condensed labels, grey bars, a coral-outlined card that lights cream when the response lands) and a JSON pane on the right whose lines type in one after another (keys white, strings coral, numbers cream, booleans mauve), with a raised status pill. The left half drops away under 800px.",
  piece('<div class="win nm nm--offset">'), { js: true });

add("trust", "Logo strip", "A hairline-ruled row: a line of copy with a coral figure, then five customer names set in condensed uppercase at 62% white, each in its own hairline cell. Two columns on phones.",
  piece('<div class="trust wrap">'));

add("nav", "Nav pill & menu sheet", "Shown as it sits once the page scrolls: a frosted pill (--mn-frost-nav over 78% violet) with the aperture mark, section links, Sign in, the glowing Sign up and the burger. The burger drops a raised sheet out of the pill: numbered rows with raised arrow discs, the current section pressed in with a warm bar, a ghost and a solid button, all staggering in on --mn-cubic over a blurred scrim. At the top of a page the pill is a full-width bar (drop .mn-scrolled). Here it sits in .mn-navframe, a 560px violet-grid frame that holds the nav, its scrim and its sheet, so it previews as a card; on a page, drop the frame and pin .mn-nav with position: fixed.",
  // Shown open, on its first section, as the menu looks once the burger is pressed. The frame
  // contains the absolutely positioned nav, so the component stays in flow wherever it is shown
  // (the specimen, the SYSTEMS dialog) instead of attaching to the nearest positioned ancestor.
  '<div class="navframe">' + piece("<nav").replace('<nav ', '<nav class="nav scrolled open" ').replace('aria-expanded="false"', 'aria-expanded="true"')
    .replace('<span class="sr">Menu</span>', '<span class="sr">Close menu</span>').replace("href=\"#window\"><span class=\"n\">01", "href=\"#window\" aria-current=\"true\"><span class=\"n\">01") + "</div>", { js: true });

add("features", "Section head & feature cards", "A section head: the condensed cream eyebrow, a 700-weight h2 and a lead. Three raised cards (--mn-raise) with a pillowed dot holding a short gradient pill, a 21px title, copy and a condensed cream tag; a card lifts 6px on hover and presses flat into the page (--mn-inner) while held.",
  inSection("features", '<div class="wrap">'));

add("stats", "Stat wells", "Four pressed-in wells (--mn-press): a 42px 800-weight figure in the warm gradient over a condensed uppercase label, and a quiet condensed note beneath.",
  inSection("stats", '<div class="wrap">'));

add("steps", "Three steps", "Numbered steps, each topped by a 9px gradient bar (cool, warm, then coral) with a condensed cream step label, a 20px title and copy. One column under 980px.",
  inSection("how-it-works", '<div class="steps">'));

add("console", "Eviction console", "Two raised panels. Retention: rows of label and soft switch over a budget slider. The run: three nested recessed rings carrying an SVG arc split into pinned (cream), kept (lilac) and stub segments, a legend, a pressed strip of 24 spans as wide as they are heavy (dashed when evicted, hatched when stubbed, cited ones with a coral dot, tool results notched) and a sentence saying what the policy did. Every switch and the slider re-run the policy; spans that change state flash.",
  inSection("console", '<div class="console"'), { js: true });

add("pricing", "Plans", "Three raised plans: a condensed cream name, a pressed price well with an 800-weight figure, features marked with small cool-gradient pills, and a pill button (the middle plan's is solid).",
  inSection("pricing", '<div class="plans">'));

add("faq", "FAQ", "Native <details> on raised surfaces whose shadow softens when open; the round raised toggle turns half a turn and its cream plus loses a bar.",
  inSection("faq", '<div class="qa">'));

add("finale", "Newsletter dome & footer", "The finale darkens down the violet: a glowing domed planet (--mn-dome-1..4) under a slowly turning orbit of glowing dots, blurred gradient pills at the sides, and a frosted card (--mn-frost-card, --mn-glass-card) with the badge, a 900-weight h2 with a gold-to-pink phrase and a pressed pill form with a gradient Subscribe. Below: the mark, link columns ruled by hairlines, a glass docs card, a status bar with a lime dot and the fine print.",
  piece('<footer class="finale"'), { js: true });

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "mn" && !m[1].startsWith("mn-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("mn-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["open", "scrolled", "busy", "dim", "hit", "over", "flash", "ln", "k", "s", "n", "b", "ok", "warn"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["drop", "fade", "open", "iris", "drift-l", "drift-r", "sway", "punch", "breathe", "lift", "rise", "land", "type-in", "blink", "flash", "orbit"];
const ATTRS = ["depth", "mode", "s", "type", "cited", "rule"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "mn", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
// SVG gradient ids in the marks get the prefix too, so two marks on a host page can't collide
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`))
  .replace(/id="(mk|fk)-(well|pill)"/g, 'id="mn-$1-$2"').replace(/url\(#(mk|fk)-(well|pill)\)/g, "url(#mn-$1-$2)")
  .replace(/id="spark"/g, 'id="mn-spark"').replace(/url\(#spark\)/g, "url(#mn-spark)");
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .mn itself, or :where(.mn) in front
const ROOTED = /(^|[\s,(>+~])\.mn(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.mn) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* On the page, headings and controls inherit Barlow from body. Inside a host
   they'd pick up the host's own heading and control fonts instead, so they
   inherit from .mn. It goes first: the page's own rules come after it and win. */
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.mn) ${t}`).join(",")}{font-family:inherit}`;
// The nav component's own frame: it contains the absolutely positioned nav, scrim and sheet
const NAVFRAME = `
:where(.mn) .mn-navframe{ position: relative; isolation: isolate; height: 560px; overflow: clip; border-radius: var(--mn-radius-panel);
  background: linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px) 0 0/96px 96px,
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px) 0 0/96px 96px, var(--mn-bg-1); }
:where(.mn) .mn-navframe > .mn-nav{ bottom: 0; }`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(base))).trim()}\n${NAVFRAME.trim()}`;
// (#000 stays: it is the opaque stop of the orbit's mask, an alpha, not a colour)
const leftHex = componentCss.replace(/url\([^)]*\)/g, "").replace(/#000(?![0-9a-f])/gi, "").match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Mnemo components, no libraries. Listeners are delegated from the
     document, so components added later work without setup. Under
     prefers-reduced-motion the aperture holds still and code lines land at once. */
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }

  /* Aperture: each [data-mn-depth] layer eases toward the pointer, the nearer the further */
  all('.mn-scene').forEach(function (scene) {
    if (RM) return;
    var host = scene.parentElement, REACH = 42, tx = 0, ty = 0, raf = 0, visible = false;
    var layers = all('[data-mn-depth]', scene).map(function (el) { return { el: el, depth: parseFloat(el.getAttribute('data-mn-depth')) || 0, x: 0, y: 0 }; });
    if (!layers.length) return;
    function frame() {
      raf = requestAnimationFrame(frame);
      var moved = false;
      layers.forEach(function (L) {
        var gx = -tx * REACH * L.depth, gy = -ty * REACH * L.depth;
        L.x += (gx - L.x) * 0.08; L.y += (gy - L.y) * 0.08;
        if (Math.abs(gx - L.x) > 0.01 || Math.abs(gy - L.y) > 0.01) moved = true;
        L.el.style.transform = 'translate3d(' + L.x.toFixed(2) + 'px,' + L.y.toFixed(2) + 'px,0)';
      });
      if (!moved) { cancelAnimationFrame(raf); raf = 0; }
    }
    function start() { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); }
    host.addEventListener('pointermove', function (e) {
      var r = scene.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; start();
    });
    host.addEventListener('pointerleave', function () { tx = 0; ty = 0; start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible = e.isIntersecting; });
      if (visible) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(scene);
  });

  /* Eviction console: the switches and the budget re-run the policy over the strip's spans */
  ${POLICY_SRC}
  var STATE = { pin: 'pinned', keep: 'kept', stub: 'evicted, stub left', gone: 'evicted' };
  var NAME = { turn: 'turn', tool: 'tool result', doc: 'document' };
  function paint(con) {
    var range = con.querySelector('.mn-track input'), strip = con.querySelector('.mn-strip');
    if (!range || !strip) return;
    function on(rule) { var b = con.querySelector('[data-mn-rule="' + rule + '"]'); return !!b && b.getAttribute('aria-pressed') === 'true'; }
    var els = all('.mn-span', strip);
    var run = els.map(function (el, i) { return { i: i, type: el.getAttribute('data-mn-type'), size: +el.style.getPropertyValue('--mn-w') || 0, cited: el.hasAttribute('data-mn-cited') }; });
    var budget = +range.value, p = mnPolicy(run, budget, on('tool'), on('cited'), on('stub'));
    var dial = con.querySelector('.mn-dial');
    if (dial) dial.classList.toggle('mn-over', p.over);
    function text(sel, t) { var el = con.querySelector(sel); if (el) el.textContent = t; }
    text('.mn-readout b', budget + 'K tokens');
    text('.mn-dial-val', p.pct + '%');
    text('.mn-dial-sub', p.over ? 'over' : 'in use');
    text('.mn-dial-head span', p.total);
    ['pin', 'keep', 'stub', 'gone'].forEach(function (k) { text('.mn-k-' + k + ' b', p.legend[k]); });
    var ks = con.querySelector('.mn-k-stub'), kp = con.querySelector('.mn-k-pin');
    if (ks) ks.classList.toggle('mn-dim', !on('stub'));
    if (kp) kp.classList.toggle('mn-dim', p.legend.pinZero);
    ['pin', 'keep', 'stub'].forEach(function (k) {
      var seg = con.querySelector('.mn-seg.mn-' + k), a = p.arcs[k];
      if (seg) { seg.style.strokeDasharray = a.dash; seg.style.strokeDashoffset = a.offset; seg.style.opacity = a.opacity; }
    });
    els.forEach(function (el, i) {
      var st = p.state[i], s = run[i];
      if (el.getAttribute('data-mn-s') !== st) {
        el.classList.remove('mn-flash'); void el.offsetWidth; el.classList.add('mn-flash');
        el.setAttribute('data-mn-s', st);
      }
      el.title = 'Span ' + (i + 1) + ' · ' + NAME[s.type] + (s.cited ? ', cited' : '') + ' · ' + s.size.toLocaleString('en-US') + 'K · ' + STATE[st];
    });
    var v = con.querySelector('.mn-verdict');
    if (v) v.innerHTML = p.verdict;
  }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.mn-track')) return;
    var track = t.closest('.mn-track'), min = +t.min || 0, max = +t.max || 100;
    track.style.setProperty('--mn-v', ((+t.value - min) / (max - min)).toFixed(4));
    var con = t.closest('.mn-console');
    if (con) paint(con);
    else { var out = t.closest('.mn-slider') && t.closest('.mn-slider').querySelector('.mn-readout b'); if (out) out.textContent = t.value + 'K tokens'; }
  });

  /* Prompt bar: the modes write their own JSON into the nearest terminal window */
  ${MODES_SRC}
  ${RENDER_SRC}
  function winFor(form) {
    for (var n = form.parentElement; n; n = n.parentElement) { var w = n.querySelector('.mn-win'); if (w) return w; }
    return null;
  }
  function modeOf(form) { var t = form.querySelector('.mn-mode[aria-selected="true"]'); return (t && t.getAttribute('data-mn-mode')) || 'open'; }
  function paintCode(win, obj, wait) {
    var code = win && win.querySelector('.mn-code');
    if (!code) return;
    code.style.setProperty('--mn-base', (wait || 0) + 'ms');
    code.innerHTML = RM ? mnRender(obj).replace(/--mn-i:\\d+/g, '--mn-i:0') : mnRender(obj);
  }
  function status(win, busy, text) {
    var s = win && win.querySelector('.mn-status');
    if (!s) return;
    s.classList.toggle('mn-busy', busy);
    var t = s.querySelector('span'); if (t) t.textContent = text;
  }
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (form.classList.contains('mn-ask')) {
      e.preventDefault();
      var win = winFor(form), code = win && win.querySelector('.mn-code'), card = win && win.querySelector('.mn-sk-card');
      var input = form.querySelector('input'), mode = MODES[modeOf(form)] || MODES.open;
      clearTimeout(form._mnT);
      status(win, true, 'Reading spans…');
      if (code) code.classList.add('mn-dim');
      if (card) card.classList.remove('mn-hit');
      form._mnT = setTimeout(function () {
        paintCode(win, mode.out(input ? input.value.trim() : ''));
        if (code) code.classList.remove('mn-dim');
        if (card) card.classList.add('mn-hit');
        status(win, false, 'Done · 6 ms');
      }, RM ? 0 : 700);
    } else if (form.classList.contains('mn-f-form')) {
      e.preventDefault();
      var field = form.querySelector('input'), v = field ? field.value.trim() : '';
      var note = form.parentElement && form.parentElement.querySelector('.mn-f-note');
      if (!note) return;
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)) { note.textContent = 'Enter an email address like you@company.com.'; note.className = 'mn-f-note mn-warn'; if (field) field.focus(); return; }
      note.textContent = 'This is a demo, so nothing was sent or stored.';
      note.className = 'mn-f-note mn-ok';
    }
  });

  /* Menu sheet */
  function setOpen(nav, open) {
    nav.classList.toggle('mn-open', open);
    var b = nav.querySelector('.mn-burger');
    if (b) { b.setAttribute('aria-expanded', String(open)); var sr = b.querySelector('.mn-sr'); if (sr) sr.textContent = open ? 'Close menu' : 'Menu'; }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.mn')) return;
    var burger = t.closest('.mn-burger');
    if (burger) { var nav = burger.closest('.mn-nav'); if (nav) setOpen(nav, !nav.classList.contains('mn-open')); else burger.setAttribute('aria-expanded', String(burger.getAttribute('aria-expanded') !== 'true')); return; }
    var shut = t.closest('.mn-scrim, .mn-sheet a');
    if (shut) { setOpen(shut.closest('.mn-nav'), false); }
    var sw = t.closest('.mn-sw');
    if (sw) { sw.setAttribute('aria-pressed', String(sw.getAttribute('aria-pressed') !== 'true')); var con = sw.closest('.mn-console'); if (con) paint(con); return; }
    var tab = t.closest('.mn-mode');
    if (tab) {
      var form = tab.closest('.mn-ask');
      all('.mn-mode', tab.parentElement).forEach(function (b) { b.setAttribute('aria-selected', String(b === tab)); });
      if (form) {
        var m = MODES[tab.getAttribute('data-mn-mode')], input = form.querySelector('input'), win = winFor(form);
        if (m && input) input.placeholder = m.ph;
        clearTimeout(form._mnT);
        if (m && win) {
          var code = win.querySelector('.mn-code'), card = win.querySelector('.mn-sk-card');
          if (code) code.classList.remove('mn-dim');
          if (card) card.classList.remove('mn-hit');
          paintCode(win, m.out(''));
          status(win, false, 'Ready');
        }
      }
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') all('.mn-nav.mn-open').forEach(function (n) { setOpen(n, false); var b = n.querySelector('.mn-burger'); if (b) b.focus(); });
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own aperture stage, its words swapped for the system's
const HERO = cut(STAGE, '<form class="ask nm nm--offset"')
  .replace(' style="padding-bottom:88px"', "")
  .replace("<span>Give your agent</span>", "<span>Mnemo is a</span>")
  .replace("<em>a million tokens</em>", "<em>violet soft-UI</em>")
  .replace("<span>it can reach</span>", "<span>design system</span>")
  .replace(/(<p class="sub">)[^<]*/, "$1A recessed aperture, drifting gradient pills, Barlow set heavy and pressed-in controls. Extracted from the Mnemo context-window page.")
  .replace(/(<p class="chip">)[^<]*/, `$1mnemo@${VERSION} · ${C.length} components`);
const CHROME = `
body{margin:0;background:var(--mn-bg-1)}
.sp-top{position:relative}
.sp-top .mn-stage{padding-bottom:96px}
.sp-top .mn-glow{-webkit-mask-image:linear-gradient(#000 20%,transparent 60%);mask-image:linear-gradient(#000 20%,transparent 60%)}
.sp-meta{position:absolute;z-index:4;top:28px;left:0;right:0;display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;width:min(1140px,100% - 44px);margin:0 auto}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;font:600 13px/1.4 var(--mn-font-cond);text-transform:uppercase;letter-spacing:2.4px;color:var(--mn-cream)}
.sp-label::before{content:"";width:14px;height:6px;border-radius:6px;background:var(--mn-g-warm)}
.sp-main{width:min(1140px,100% - 44px);margin:0 auto;padding:24px 0 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:24px}
.sp-head h2{margin:10px 0 0;font:800 40px/1.05 var(--mn-font-sans);letter-spacing:-.02em;color:var(--mn-white)}
.sp-note{margin:0;max-width:660px;font:400 15px/1.6 var(--mn-font-sans);color:rgba(255,255,255,.78)}
.sp-demo{position:relative;overflow:clip;padding:clamp(20px,3.4vw,40px);background:var(--mn-bg-1);border:1px solid rgba(255,255,255,.1);border-radius:var(--mn-radius-panel)}
#c-hero .sp-demo,#c-finale .sp-demo,#c-nav .sp-demo{padding:0}
.sp-demo>.mn-ask{margin:0 auto}
.sp-demo>.mn-trust{margin-top:0}
.sp-demo>.mn-wrap{width:auto}
@media (max-width:809px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-head h2{font-size:30px}.sp-top .mn-stage{padding:112px 0 180px}}
`;
const HEROHTML = `
<header class="sp-top">
${prefixMarkup(unhook(HERO)).replace(/^<div class="mn-stage">/, `<div class="mn-stage">\n<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">mnemo@${VERSION} · ${C.length} components</p></div>`)}
</header>`;
if (!HEROHTML.includes("sp-meta")) throw new Error("hero stage not found");
const specimen = renderSpecimen({
  name: "Mnemo",
  slug: "mnemo",
  version: VERSION,
  prefix: "mn",
  rootClass: "mn",
  labelClass: "sp-label",
  script: "scripts/systems/mnemo.mjs",
  source: SOURCE,
  metaDescription: "The Mnemo design system: tokens and working components extracted from the Mnemo context-window page.",
  defsNote: "none: the aperture, the pills, the dome and the marks are CSS and inline SVG inside each component",
  jsNote: "the aperture parallax, the eviction console's policy, the prompt bar's modes and run, the menu sheet and the subscribe form",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: "",
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "mnemo", prefix: "mn", rootClass: "mn", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["nm", "nm--offset", "btn", "card", "stage", "piece", "ask", "mode", "go", "win", "code", "span", "sw", "track", "plan", "q", "badge", "chip", "eyebrow", "f-card", "menu", "sheet", "ln", "navframe"] });
