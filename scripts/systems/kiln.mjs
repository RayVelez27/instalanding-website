// Extracts the Kiln design system from its landing page.
//
//   node scripts/systems/kiln.mjs
//
// Reads public/demos/kiln-panel.html (never edits it) and writes
// public/systems/kiln/ (specimen.html, tokens.css, kiln.css) through ./lib.mjs.
//
// Kiln is machined hardware: bead-blasted aluminium plates with a copper
// laminate edge, copper screws, recessed wells, engraved mono legends, amber
// lamps. The page is one big simulation; the components below are its parts
// in a sensible static state (a gauge at 62%, a coil at 72% heat, a finished
// install log), with small kn- scoped scripts where a part is interactive.
import { readPage, dropStyle, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/kiln-panel.html";
const { el, css: pageCssRaw, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page: its own :root variables plus the
   literals it repeats. Group comments are read by the SYSTEMS board. */
const TOKENS = `/* InstaLanding design system · Kiln · kiln@${VERSION}
   Extracted from https://instalanding.ai/demos/kiln-panel.html
   Fonts (Google Fonts): Archivo 500-900, JetBrains Mono 400/500/700 */
:root {
  /* Color · core */
  --kn-void: #08090B;
  --kn-alu-hi: #2A2D33;
  --kn-alu: #1E2025;
  --kn-alu-lo: #16171B;
  --kn-text: #D4D8DE;
  --kn-mute: #7C828C;
  --kn-amber: #FF9426;
  --kn-ember: #FF4F14;
  --kn-green: #3FD96E;
  --kn-red: #FF3B3B;
  --kn-cyan: #35E6DE;

  /* Color · metal & wells */
  --kn-seam: #07080A;
  --kn-dim: #4D535C;
  --kn-engrave: #5F656E;
  --kn-well-floor: #050607;
  --kn-well: #0C0D10;
  --kn-well-hi: #0D0E11;
  --kn-well-lo: #141519;
  --kn-edge: #15161A;
  --kn-line: #3A3E46;
  --kn-led-off: #24272D;
  --kn-bar-off: #2C3037;
  --kn-bright: #EEF0F3;
  --kn-title: #E3E6EA;
  --kn-log: #A9B0B8;

  /* Color · copper */
  --kn-copper-hi: #FFD9B8;
  --kn-copper: #E07830;
  --kn-copper-mid: #8A4218;
  --kn-copper-lo: #4A2718;
  --kn-copper-deep: #2A0F06;
  --kn-copper-rim: #0D0500;
  --kn-copper-fill: #A34A0C;

  /* Color · lamps */
  --kn-lamp-green: #DCFFE8;
  --kn-lamp-amber: #FFF0DC;
  --kn-lamp-red: #FFDEDE;

  /* Color · rating plate */
  --kn-plate-hi: #DFE7E2;
  --kn-plate: #B9C6BF;
  --kn-plate-mid: #93A49C;
  --kn-plate-lo: #6D7F77;
  --kn-plate-text: #17221D;
  --kn-plate-ink: #111C18;
  --kn-plate-brand: #0F1A16;
  --kn-plate-label: #3C4D46;
  --kn-plate-fine: #45564F;

  /* Type · families */
  --kn-font-display: "Archivo", system-ui, sans-serif;
  --kn-font-body: "Archivo", system-ui, sans-serif;
  --kn-font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Type · scale */
  --kn-display-xl: clamp(40px, 4.5vw, 70px);
  --kn-display-rack: clamp(44px, 5.4vw, 68px);
  --kn-display-lg: clamp(26px, 4vw, 42px);
  --kn-title-md: 20px;
  --kn-body-lg: 16px;
  --kn-body: 15px;
  --kn-body-sm: 13.5px;
  --kn-readout: 30px;
  --kn-label: 11px;
  --kn-legend: 9.5px;
  --kn-legend-tracking: .34em;

  /* Shape · radii */
  --kn-radius-plate: 14px;
  --kn-radius-well: 12px;
  --kn-radius-badge: 10px;
  --kn-radius-window: 9px;
  --kn-radius-btn: 8px;
  --kn-radius-unit: 4px;
  --kn-radius-switch: 24px;

  /* Shape · borders */
  --kn-border-hair: 1px;
  --kn-border-rating: 2px;

  /* Depth · laminate, wells and glow */
  --kn-stack:
    0 3px 0 #0b0d10,
    0 5px 0 #180702,
    0 6px 0 #3d190a,
    0 7px 0 #8a4218,
    0 8px 0 #d1783a,
    0 9px 0 #ffdcb8,
    0 10px 0 #c1692c,
    0 11px 0 #6e3416,
    0 12px 0 #180702,
    0 14px 0 #0b0d10,
    0 16px 0 #06080a;
  --kn-well-inset: inset 0 0 0 1px rgba(0, 0, 0, 0.7), inset 0 3px 7px rgba(0, 0, 0, 0.85), inset 0 -1px 0 rgba(255, 255, 255, 0.04), 0 1px 0 rgba(255, 255, 255, 0.06);
  --kn-glow-amber: 0 0 0 1px var(--kn-amber), 0 0 24px -6px rgba(255, 148, 38, 0.55), 0 4px 10px rgba(0, 0, 0, 0.7);
  --kn-drop: 0 30px 60px -24px #000, 0 18px 26px -12px rgba(0, 0, 0, 0.8);

  /* Motion · easing */
  --kn-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --kn-spring: cubic-bezier(0.34, 1.7, 0.5, 1);

  /* Motion · durations */
  --kn-dur-quick: .25s;
  --kn-dur-btn: .32s;
  --kn-dur-switch: .36s;
  --kn-dur-led: .45s;
  --kn-dur-roll: .55s;
  --kn-dur-caret: .9s;
  --kn-dur-wave: 2.4s;

  /* Space · layout */
  --kn-page-max: 1160px;
  --kn-gutter: 18px;
  --kn-section-y: 92px;
  --kn-panel-gap: 16px;
  --kn-bay-gap: 14px;

  /* Pattern · machine state */
  --kn-heat: 0;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
const HEX = {
  "#08090b": "void", "#2a2d33": "alu-hi", "#1e2025": "alu", "#16171b": "alu-lo", "#d4d8de": "text", "#7c828c": "mute",
  "#ff9426": "amber", "#ff4f14": "ember", "#3fd96e": "green", "#ff3b3b": "red", "#35e6de": "cyan",
  "#07080a": "seam", "#4d535c": "dim", "#5f656e": "engrave", "#050607": "well-floor", "#0c0d10": "well", "#0d0e11": "well-hi",
  "#141519": "well-lo", "#15161a": "edge", "#3a3e46": "line", "#24272d": "led-off", "#2c3037": "bar-off", "#eef0f3": "bright",
  "#e3e6ea": "title", "#a9b0b8": "log",
  "#ffd9b8": "copper-hi", "#e07830": "copper", "#8a4218": "copper-mid", "#4a2718": "copper-lo", "#2a0f06": "copper-deep",
  "#0d0500": "copper-rim", "#a34a0c": "copper-fill",
  "#dcffe8": "lamp-green", "#fff0dc": "lamp-amber", "#ffdede": "lamp-red",
  "#dfe7e2": "plate-hi", "#b9c6bf": "plate", "#93a49c": "plate-mid", "#6d7f77": "plate-lo", "#17221d": "plate-text",
  "#111c18": "plate-ink", "#0f1a16": "plate-brand", "#3c4d46": "plate-label", "#45564f": "plate-fine",
};
// The page's own custom properties, renamed into the system
const VARS = {
  void: "void", "alu-hi": "alu-hi", alu: "alu", "alu-lo": "alu-lo", seam: "seam", text: "text", mute: "mute", dim: "dim",
  engrave: "engrave", amber: "amber", ember: "ember", green: "green", red: "red", cyan: "cyan", heat: "heat", stack: "stack",
  ease: "ease", spring: "spring", display: "font-display", mono: "font-mono",
};
const end = "(?=\\s*[;}])";
const SWAPS = [
  [/clamp\(40px, 4\.5vw, 70px\)/g, "var(--kn-display-xl)"],
  [/clamp\(44px, 5\.4vw, 68px\)/g, "var(--kn-display-rack)"],
  [/clamp\(26px, 4vw, 42px\)/g, "var(--kn-display-lg)"],
  [new RegExp(`border-radius:\\s*14px${end}`, "g"), "border-radius: var(--kn-radius-plate)"],
  [new RegExp(`border-radius:\\s*12px${end}`, "g"), "border-radius: var(--kn-radius-well)"],
  [new RegExp(`border-radius:\\s*10px${end}`, "g"), "border-radius: var(--kn-radius-badge)"],
  [new RegExp(`border-radius:\\s*9px${end}`, "g"), "border-radius: var(--kn-radius-window)"],
  [new RegExp(`border-radius:\\s*8px${end}`, "g"), "border-radius: var(--kn-radius-btn)"],
  [new RegExp(`border-radius:\\s*4px${end}`, "g"), "border-radius: var(--kn-radius-unit)"],
  [new RegExp(`border-radius:\\s*24px${end}`, "g"), "border-radius: var(--kn-radius-switch)"],
  [/0\.25s var\(--kn-ease\)/g, "var(--kn-dur-quick) var(--kn-ease)"],
  [/0\.32s var\(--kn-ease\)/g, "var(--kn-dur-btn) var(--kn-ease)"],
  [/0\.36s var\(--kn-spring\)/g, "var(--kn-dur-switch) var(--kn-spring)"],
  [/0\.45s var\(--kn-ease\)/g, "var(--kn-dur-led) var(--kn-ease)"],
  [/0\.55s var\(--kn-ease\)/g, "var(--kn-dur-roll) var(--kn-ease)"],
  [/ 2\.4s linear/g, " var(--kn-dur-wave) linear"],
  [/ 0\.9s step-end/g, " var(--kn-dur-caret) step-end"],
  [/url\(#pivotg\)/g, "url(#kn-pivotg)"],
  [/width: min\(1160px, 100% - 36px\)/g, "width: min(var(--kn-page-max), 100% - 2 * var(--kn-gutter))"],
];

/* ── 3. Component CSS: the page's <style>, minus what only the page needs ── */
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
// Top-level rules (an @media block counts as one)
function splitRules(css) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) { out.push(css.slice(start, i + 1).trim()); start = i + 1; }
  }
  return out.filter(Boolean);
}
// Selector list split on top-level commas only (not inside :is(), :not())
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
// Page-only parts: the full-screen menu, the hero room and 3D chassis, the live
// machine face, the route and cutaway diagrams, section shells, the footer.
const DROP = new RegExp([
  `#route`, `#cut`, `\\.menu${nb}`, `\\.menu-(bg|inner|label|nav|side|order|foot)${nb}`, `\\.mi${nb}`, `\\.mt${nb}`, `\\.md${nb}`,
  `\\.nav-open`, `\\.chassis`, `\\.hero-stage`, `\\.feet`, `\\.why${nb}`, `\\.why-scroll`, `\\.swipe`, `\\.cutaway`, `\\.cut-stage`,
  `\\.cp${nb}`, `\\.air${nb}`, `\\.leader`, `\\.callout`, `\\.inside${nb}`, `\\.inside-sec`, `\\.type-char`, `\\.typing-caret`,
  `\\.spill`, `\\.machine${nb}`, `\\.face${nb}`, `\\.face-brand`, `\\.fan`, `\\.turbine`, `^\\.hero${nb}`, `\\.nameplate`,
  `\\.plate-badge`, `\\.sheet`, `\\.steps`, `\\.compare${nb}`, `\\.configs`, `\\.slot-row`, `\\.unit${nb}`, `\\.topnav`,
  `\\.specs${nb}`, `\\.spec${nb}`, `\\.dialsm`, `\\.cta${nb}`, `\\.cta-sec`, `\\.section${nb}`, `\\.spec-sec`, `\\.versus-sec`,
  `\\.install-sec`, `\\.rack-sec`, `\\.faq-sec`, `\\.faq-side`, `\\.faq-grid`, `\\.order${nb}`, `\\.stack${nb}`, `\\.readout`,
  `\\.reasons`, `\\.footer`, `\\.status${nb}`,
].join("|"));
const DROP_KEYFRAMES = ["flash", "flow"];
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return DROP_KEYFRAMES.includes(prelude.split(/\s+/)[1]) ? "" : rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s));
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}

// Base rules the page set on the document, scoped to .kn (bare elements under :where(), so they stay weak)
let base = pageCssRaw
  .replace(/:root\s*\{[\s\S]*?\n\}\n/, "")
  .replace("* { margin: 0; padding: 0; box-sizing: border-box; }", ":where(.kn, .kn *) { margin: 0; padding: 0; box-sizing: border-box; }")
  .replace("html { scroll-behavior: smooth; }", "")
  .replace(/body \{[\s\S]*?\n\}/, ".kn {\n  color: var(--text);\n  font-family: var(--display);\n  -webkit-font-smoothing: antialiased;\n}")
  .replace("button, input { font: inherit; color: inherit; }", ":where(.kn button, .kn input) { font: inherit; color: inherit; }")
  .replace("button { background: none;", ":where(.kn button) { background: none;")
  .replace("a { color: inherit; text-decoration: none; }", ":where(.kn a) { color: inherit; text-decoration: none; }")
  .replace("h1, h2 {", ":where(.kn h1, .kn h2) {")
  .replace("  html { scroll-behavior: auto; }\n", "")
  .replace("  *, *::before, *::after {", "  .kn, .kn *, .kn *::before, .kn *::after {")
  // the gauge's fill slot lives under .hero on the page; it belongs to the gauge
  .replace(".hero .gauge .slot {", ".gauge .slot {")
  .replace(".hero .gauge .slot i {", ".gauge .slot i {");
base = keep(stripComments(base));
// The page's own variables -> the system's tokens
base = base.replace(/var\(--([\w-]+)\)/g, (m, name) => (VARS[name] ? `var(--kn-${VARS[name]})` : m));

// Every class the kept CSS uses gets the kn- prefix (read from selectors only, never from values)
const CLASSES = new Set();
for (const [, sel] of stripComments(base).matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "kn") CLASSES.add(m[1]);
}
// Classes only the markup or the script toggle
["kiln", "used", "swap", "done", "active", "hold", "msg", "on", "sep"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["wave", "hint", "cfgIn", "blink-caret"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({
  prefix: "kn", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES,
});
const componentCss = prefixCss(tokenize(base)).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Static states for parts the page drives from its simulation ──── */
// The gauge at 62% load, built exactly as the page's script builds it
function gauge(v) {
  const GX = 120, GY = 128, REDLINE = 85;
  const polar = (x, r) => { const a = Math.PI - (x / 100) * Math.PI; return [GX + Math.cos(a) * r, GY - Math.sin(a) * r]; };
  const f = (n) => n.toFixed(1);
  const R = 92;
  const [ax, ay] = polar(0, R), [bx, by] = polar(100, R);
  let h = `<path class="g-track" d="M${f(ax)} ${f(ay)} A${R} ${R} 0 0 1 ${f(bx)} ${f(by)}"/>`;
  h += `<path class="g-band" pathLength="100" stroke-dasharray="${v} 100" d="M${f(ax)} ${f(ay)} A${R} ${R} 0 0 1 ${f(bx)} ${f(by)}"/>`;
  for (let x = 0; x <= 100; x += 2) {
    const major = x % 10 === 0;
    const [x0, y0] = polar(x, 100), [x1, y1] = polar(x, major ? 110 : 105);
    h += `<line class="${major ? "g-major" : "g-minor"}" x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1)}" y2="${f(y1)}"/>`;
    if (major) { const [lx, ly] = polar(x, 78); h += `<text class="g-label${x > REDLINE ? " r" : ""}" x="${f(lx)}" y="${f(ly)}">${x}</text>`; }
  }
  const [rx0, ry0] = polar(REDLINE, 114), [rx1, ry1] = polar(100, 114);
  h += `<path class="g-red" d="M${f(rx0)} ${f(ry0)} A114 114 0 0 1 ${f(rx1)} ${f(ry1)}"/>`;
  h += `<g class="g-needle" transform="rotate(${(v * 1.8).toFixed(2)} ${GX} ${GY})"><line x1="${GX + 14}" y1="${GY}" x2="${GX - 84}" y2="${GY}"/><line class="tip" x1="${GX - 72}" y1="${GY}" x2="${GX - 86}" y2="${GY}"/></g>`;
  h += `<circle class="g-pivot" cx="${GX}" cy="${GY}" r="7"/><circle cx="${GX}" cy="${GY}" r="2" fill="#0a0b0d"/>`;
  return h;
}
// The rating plate's barcode, from the page's fixed seed
function barcode() {
  let seed = 731, x = 0;
  const stops = [];
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  while (x < 150) {
    const bar = 1 + Math.floor(rnd() * 3), gap = 1 + Math.floor(rnd() * 3);
    stops.push(`#111c18 ${x}px ${x + bar}px`, `transparent ${x + bar}px ${x + bar + gap}px`);
    x += bar + gap;
  }
  return `linear-gradient(90deg,${stops.join(",")})`;
}
// The install log, finished (the page's instant() state)
const LINES = [
  [0, "unit unboxed · 24 kg · SN K04-C-000731", "OK", 1], [4, "rails seated · unit at U17–U18", "OK", 1],
  [11, "PSU A online · PSU B online · redundancy ok", "OK", 1], [17, "fans spun up · 38 dB(A) at 1 m", "OK", 1],
  [20, "rack it", "DONE", 1, true], [23, "link up · 100GbE · eth0", "OK", 2],
  [26, "default route requested: none · egress: none", "OK", 2], [30, "connect the network", "DONE", 2, true],
  [33, "drive mounted · weights bundle found", "OK", 3], [58, "copying weights · 214 GB", "OK", 3],
  [80, "verifying sha256 … match", "OK", 3], [86, "loading across 4 accelerators", "OK", 3],
  [89, "endpoint up · kiln.local/v1/chat/completions", "OK", 3], [90, "panel live", "LIVE", 3, true],
];
const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;
const logHtml = LINES.map((l) => `<li${l[4] ? ` class="${l[2] === "LIVE" ? "mile live" : "mile"}"` : ""} data-step="${l[3]}" data-t="${l[0]}"${l[4] ? " data-done" : ""}><span class="ts">${hm(l[0])}</span><span class="msg">${l[1]}</span><span class="st">[ ${l[2]} ]</span></li>`).join("\n");
const CFG = { tag: "Shown above", name: "K-04", sub: "The bench unit on this page. Most teams start here.", price: "$64,000",
  rows: [["Form", "2U"], ["Accelerators", "4 × 96 GB"], ["Storage", "30 TB"], ["Peak", "1,840 tok/s"], ["Draw", "284 W nominal"]] };

/* ── 5. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(markup), ...opts });
const arrow = /<a class="btn btn-amber btn-sm order"[^>]*>[\s\S]*?<\/a>/;

add("buttons", "Buttons", "Machined buttons: a graphite face with a lit top edge, or the amber-rimmed primary that glows on hover. Mono uppercase labels with a chevron or a play mark; a small size for bars.",
  `<div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
${el('<div class="hero-cta">').replace(/href="#[\w-]+"/g, 'href="#"')}
${arrow.exec(el('<header class="topbar"'))[0].replace(' order', '').replace(/href="#[\w-]+"/g, 'href="#"')}
<button class="btn btn-sm" type="button">Replay install</button>
</div>`);

add("type", "Type", "Archivo Black-weight display set tight and uppercase with one amber phrase that glows, mono eyebrows with an engraved separator, mono stencil legends, and muted Archivo body copy.",
  `${el('<div class="hero-copy">').replace(/<div class="hero-cta">[\s\S]*?<\/div>\n/, "")}
<div style="margin-top: 56px">
${el('<div class="section-head center">').replace(' center', '')}
</div>`);

add("nav", "Top bar", "A blurred void bar with the ringed lamp wordmark, an amber-rimmed order button and a recessed menu button whose middle line is amber and widens on hover.",
  `<div style="isolation: isolate">
${el('<header class="topbar"').replace(' order"', '"').replace(' id="topbar"', "").replace(' data-section="nav"', "").replace(' id="burger"', "").replace(' aria-controls="menu"', "").replace(/href="#[\w-]+"/g, 'href="#"')}
</div>`);

add("plate", "Status plate", "The core material: an anodised aluminium plate with a copper laminate edge, four turned copper screws, an engraved inner border and brushed grain. Holds an engraved legend, live stats with a lamp, and a recessed load bar.",
  `<div style="max-width: 420px">
${el('<div class="plate menu-card">')
    .replace('<b class="mled" id="m-led"></b><span id="m-state">Standby</span>', '<b class="mled on"></b><span id="m-state">Running</span>')
    .replace('<span id="m-load">0</span>', "<span>72</span>").replace('<span id="m-tps">0</span>', "<span>1,840</span>")
    .replace('<span id="m-temp">21</span>', "<span>58</span>").replace('<i id="m-bar"></i>', '<i style="width: 72%"></i>')}
</div>`);

add("rockers", "Rocker switches", "Rocker switches in a recessed bezel: the body tips in 3D on a spring when pressed, a lamp above lights green (red for turbo) and washes the metal around it, a grille and an engraved legend below. Click to toggle.",
  `<div class="bay well" style="display: inline-grid; padding: 26px 34px">
${el('<div class="rockers">').replace('id="pwr" aria-pressed="false"', 'data-kn-rocker aria-pressed="true"').replace('id="turbo" aria-pressed="false"', 'data-kn-rocker aria-pressed="false"')}
</div>`, { js: true });

add("gauge", "Gauge", "An analogue gauge in a well: a numbered scale with major and minor ticks, a cyan load band, a red line from 85, a damped needle with an amber tip, an engraved legend, a mono readout and a recessed fill slot.",
  `<div class="bay well gauge" style="max-width: 320px">
<p class="stencil">Thermal load</p>
<svg viewBox="0 0 240 142" aria-hidden="true">
<defs><radialGradient id="kn-pivotg" cx="38%" cy="32%"><stop offset="0" stop-color="#7a8089" /><stop offset="0.6" stop-color="#33363c" /><stop offset="1" stop-color="#16181b" /></radialGradient></defs>
${gauge(62).replace('class="g-pivot"', 'class="g-pivot" fill="url(#kn-pivotg)"')}
</svg>
<p class="gauge-read">LOAD <b class="roller">62</b>%</p>
<span class="slot" aria-hidden="true"><i style="width: 62%"></i></span>
</div>`);

add("thermal", "Heat window", "A viewing window onto the heating element: five coils whose glow, opacity and bloom all follow one --kn-heat value (0-1), behind a slatted grille, with an engraved legend and a mono caption.",
  `${el('<div class="bay well thermal">').replace('<div class="bay well thermal">', '<div class="bay well thermal" style="--kn-heat: 0.72; max-width: 320px">').replace(' id="thermMsg"', "").replace("Standby. Element cold.", "Element at 72%. Warm to the touch.")}`);

add("readings", "Readings strip", "Live readings in one long well: an icon, an engraved label and a big mono value per cell with a small unit, plus a micro-chart (bar meter, flowing wave or dots); a plate link closes the strip.",
  el('<div class="wrap stats">').replace('class="wrap stats"', 'class="stats"')
    .replace('<span class="roller" id="r-tps" data-n="4"></span>', '<span class="roller">1840</span>')
    .replace('<span class="roller" id="r-temp" data-n="2"></span>', '<span class="roller">58</span>')
    .replace('<span class="roller" id="r-draw" data-n="3"></span>', '<span class="roller">412</span>')
    .replace('<span class="roller" id="r-q" data-n="1"></span>', '<span class="roller">3</span>')
    .replace(/(<span class="bars" id="bars-tps"[^>]*>)<i><\/i><i><\/i><i><\/i><i><\/i>/, '$1<i class="on" style="height: 40%"></i><i class="on" style="height: 70%"></i><i class="on" style="height: 55%"></i><i class="on" style="height: 90%"></i>')
    .replace(/(<span class="bars" id="bars-draw"[^>]*>)<i><\/i><i><\/i><i><\/i>/, '$1<i class="on" style="height: 50%"></i><i class="on" style="height: 65%"></i><i class="on" style="height: 45%"></i>')
    .replace(/(<span class="dots" id="dots-q"[^>]*>)<i><\/i><i><\/i><i><\/i>/, '$1<i class="on"></i><i class="on"></i><i class="on"></i>')
    .replace(/href="#[\w-]+"/g, 'href="#"'));

add("rating", "Rating plate", "The one bright metal: a riveted, slightly rotated sage-aluminium rating plate with an engraved border, brand and model, a two-column spec grid, input power, certification marks, a barcode and fine print.",
  el('<div class="rating">').replace('<span class="barcode" id="barcode" aria-hidden="true"></span>', `<span class="barcode" aria-hidden="true" style="background: ${barcode()}"></span>`));

add("compare", "Compare switch", "One copper-knob switch flips every row of a comparison in place: the hosted answer slides up and out, the Kiln answer slides in with an amber lamp, staggered row by row. Click the switch.",
  `<div data-kn-compare>
${el('<div class="versus-head">').replace(' id="flipper"', "")}
${el('<div class="well versus"').replace(' id="versus"', "")}
</div>`, { js: true });

add("install", "Install log", "Milestones beside a terminal well: numbered steps that light amber then go green, and a mono log with timestamps, status tags, milestone rows and a glowing live row under an amber clock. Replay plays it back.",
  el('<div class="wrap install">').replace('<div class="wrap install">', '<div class="install" data-kn-install>')
    .replace(' id="milestones"', "").replace(/<li data-step="(\d)">/g, '<li class="done" data-step="$1">')
    .replace(' id="replay"', " data-kn-replay").replace(' id="clock">T+00:00', `>T+${hm(90)}`)
    .replace('<ol class="log" id="log"></ol>', `<ol class="log">\n${logHtml}\n</ol>`), { js: true });

add("rack", "Rack picker", "A 19-inch rack in a well: square-holed rails, a U scale, blank panels and units with copper ears, a vent and two lamps. Pick a unit and it slides out on a spring while the spec card beside it swaps in.",
  el('<div class="rackbay">').replace('<div class="rackbay">', '<div class="rackbay" data-kn-rack>')
    .replace('<ol class="u-scale" id="uscale" aria-hidden="true"></ol>', `<ol class="u-scale" aria-hidden="true">${Array.from({ length: 11 }, (_, i) => `<li>U${11 - i}</li>`).join("")}</ol>`)
    .replace(' id="rack"', "").replace(' id="cfg"', "")
    .replace('id="cfg-tag">Shown above', `data-kn-cfg="tag">${CFG.tag}`).replace('id="cfg-name">K-04', `data-kn-cfg="name">${CFG.name}`)
    .replace(/id="cfg-sub">[^<]*/, `data-kn-cfg="sub">${CFG.sub}`)
    .replace('<ul id="cfg-list"></ul>', `<ul data-kn-cfg="list">${CFG.rows.map((r) => `<li><span>${r[0]}</span><span>${r[1]}</span></li>`).join("")}</ul>`)
    .replace(/id="cfg-price">[^<]*/, `data-kn-cfg="price">${CFG.price}`).replace('id="cfg-btn">K-04', 'data-kn-cfg="btn">K-04')
    .replace('href="#order"', 'href="#"'), { js: true });

add("faq", "FAQ", "Native disclosure rows divided by machined grooves; a recessed plus turns into an amber cross on a spring when a row opens.",
  `<div style="max-width: 760px">
${el('<div class="faq">')}
</div>`);

add("keyslot", "Key slot", "The call to action as a key and a slot: hover or focus and the copper key slides into the well, and the lamp beside the slot lights amber.",
  `<div style="display: grid; justify-items: center; padding: 20px 0">
${dropStyle(el('<a class="keyslot"'), []).replace('href="#panel"', 'href="#"')}
</div>`);

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Kiln components: rocker switches, the compare switch, the rack picker and the install replay. */
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CONFIGS = {
    k02: { tag: 'Departmental', name: 'K-02', sub: 'One team, one model, one shelf.', price: '$38,500',
      rows: [['Form', '1U'], ['Accelerators', '2 × 96 GB'], ['Storage', '15 TB'], ['Peak', '820 tok/s'], ['Draw', '160 W nominal']] },
    k04: { tag: 'Shown above', name: 'K-04', sub: 'The bench unit on this page. Most teams start here.', price: '$64,000',
      rows: [['Form', '2U'], ['Accelerators', '4 × 96 GB'], ['Storage', '30 TB'], ['Peak', '1,840 tok/s'], ['Draw', '284 W nominal']] },
    k08: { tag: 'Datacentre', name: 'K-08', sub: 'Several models at once, or one very large one.', price: '$119,000',
      rows: [['Form', '4U'], ['Accelerators', '8 × 96 GB'], ['Storage', '61 TB'], ['Peak', '3,900 tok/s'], ['Draw', '540 W nominal']] }
  };
  function pick(rack, k) {
    var d = CONFIGS[k];
    if (!d) return;
    var get = function (n) { return rack.querySelector('[data-kn-cfg="' + n + '"]'); };
    get('tag').textContent = d.tag; get('name').textContent = d.name; get('sub').textContent = d.sub;
    get('price').textContent = d.price; get('btn').textContent = d.name;
    get('list').innerHTML = d.rows.map(function (r) { return '<li><span>' + r[0] + '</span><span>' + r[1] + '</span></li>'; }).join('');
    var units = rack.querySelectorAll('.kn-ru');
    for (var i = 0; i < units.length; i++) units[i].setAttribute('aria-pressed', String(units[i].getAttribute('data-cfg') === k));
    var card = rack.querySelector('.kn-cfg');
    if (card && !REDUCED) { card.classList.remove('kn-swap'); void card.offsetWidth; card.classList.add('kn-swap'); }
  }
  function replay(box) {
    var lines = box.querySelectorAll('.kn-log li'), miles = box.querySelectorAll('.kn-milestones li'), clock = box.querySelector('.kn-clock');
    var stamp = function (m) { var h = Math.floor(m / 60), mm = Math.round(m % 60); return 'T+' + (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm; };
    var mark = function (step, done) {
      for (var j = 0; j < miles.length; j++) {
        var s = +miles[j].getAttribute('data-step');
        miles[j].classList.toggle('kn-done', s < step || (s === step && done));
        miles[j].classList.toggle('kn-active', s === step && !done);
      }
    };
    clearTimeout(box._t);
    for (var i = 0; i < lines.length; i++) lines[i].style.visibility = 'hidden';
    mark(1, false);
    var n = 0;
    (function next() {
      if (n >= lines.length) return;
      var li = lines[n++];
      li.style.visibility = '';
      if (clock) clock.textContent = stamp(+li.getAttribute('data-t'));
      mark(+li.getAttribute('data-step'), li.hasAttribute('data-done'));
      box._t = setTimeout(next, REDUCED ? 0 : 170);
    })();
  }
  document.addEventListener('click', function (e) {
    var rocker = e.target.closest('[data-kn-rocker]');
    if (rocker) rocker.setAttribute('aria-pressed', rocker.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    var flipper = e.target.closest('[data-kn-compare] .kn-flipper');
    if (flipper) {
      var on = flipper.getAttribute('aria-checked') !== 'true';
      flipper.setAttribute('aria-checked', String(on));
      flipper.closest('[data-kn-compare]').querySelector('.kn-versus').setAttribute('data-mode', on ? 'kiln' : 'hosted');
      flipper.parentNode.classList.toggle('kn-kiln', on);
      flipper.parentNode.classList.add('kn-used');
    }
    var unit = e.target.closest('[data-kn-rack] .kn-ru');
    if (unit) pick(unit.closest('[data-kn-rack]'), unit.getAttribute('data-cfg'));
    var again = e.target.closest('[data-kn-replay]');
    if (again) replay(again.closest('[data-kn-install]'));
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:radial-gradient(80% 55% at 50% -10%,#17181c,transparent 62%),var(--kn-void)}
.sp-top{padding:48px var(--kn-gutter) 24px}
.sp-top-in{max-width:var(--kn-page-max);margin:0 auto}
.sp-plate{padding:44px 46px 40px}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding-bottom:18px;border-bottom:1px solid rgba(0,0,0,.7);box-shadow:0 1px 0 rgba(255,255,255,.05)}
.sp-title{margin:26px 0 0;font-size:clamp(56px,9vw,128px);font-weight:900;line-height:.86;letter-spacing:-.045em;text-transform:uppercase;color:var(--kn-title)}
.sp-title em{display:block;font-style:normal;color:var(--kn-amber);text-shadow:0 0 34px rgba(255,148,38,.38)}
.sp-lede{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px 56px;align-items:end;margin-top:28px}
.sp-lede p{margin:0;max-width:54ch;font-size:16px;line-height:1.62;color:var(--kn-mute)}
.sp-lamps{display:flex;flex-wrap:wrap;gap:14px;align-items:center}
.sp-lamps i{display:block;width:14px;height:14px;border-radius:50%}
.sp-swatches{display:flex;flex-wrap:wrap;gap:8px}
.sp-swatches i{display:block;width:34px;height:34px;border-radius:9px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.06)}
.sp-main{max-width:var(--kn-page-max);margin:0 auto;padding:16px var(--kn-gutter) 120px}
.sp-sec{padding:56px 0;border-bottom:1px solid rgba(0,0,0,.7);box-shadow:0 1px 0 rgba(255,255,255,.04);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:8px 40px;margin-bottom:30px}
.sp-head h2{margin:12px 0 0;font-size:26px;font-weight:900;line-height:1;letter-spacing:-.03em;text-transform:uppercase;color:var(--kn-title)}
.sp-note{margin:0;max-width:640px;font-size:15px;line-height:1.62;color:var(--kn-mute)}
.sp-demo{position:relative}
@media (max-width:720px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-plate{padding:34px 24px 30px}}
`;
const lamp = (c) => `<i style="background:radial-gradient(circle at 35% 30%,#fff,var(--kn-${c}) 50%);box-shadow:0 0 10px var(--kn-${c})"></i>`;
const HERO = `
<header class="sp-top">
<div class="sp-top-in">
<div class="kn-plate sp-plate">
<span class="kn-screw kn-tl" aria-hidden="true"></span><span class="kn-screw kn-tr" aria-hidden="true"></span>
<span class="kn-screw kn-bl" aria-hidden="true"></span><span class="kn-screw kn-br" aria-hidden="true"></span>
<div class="sp-meta"><p class="kn-stencil">InstaLanding design system</p><p class="kn-stencil">kiln@${VERSION} · ${C.length} components</p></div>
<h1 class="sp-title">Kiln <em>front panel.</em></h1>
<div class="sp-lede">
<p>Machined hardware for a dark interface: anodised aluminium plates on a copper laminate edge, turned copper screws, recessed wells, engraved mono legends and amber lamps. Extracted from the Machine Front Panel page.</p>
<div style="display: grid; gap: 14px; justify-items: start">
<div class="sp-lamps" aria-label="Lamps">${["green", "amber", "cyan", "red"].map(lamp).join("")}</div>
<div class="sp-swatches" aria-label="Core colours">${["void", "alu", "alu-hi", "text", "amber", "ember"].map((t) => `<i title="--kn-${t}" style="background:var(--kn-${t})"></i>`).join("")}</div>
</div>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Kiln",
  slug: "kiln",
  version: VERSION,
  prefix: "kn",
  rootClass: "kn",
  labelClass: "kn-stencil",
  script: "scripts/systems/kiln.mjs",
  source: SOURCE,
  metaDescription: "The Kiln design system: tokens and working components extracted from the Machine Front Panel landing page.",
  defsNote: "empty: every Kiln part carries its own gradients",
  jsNote: "rocker switches, the compare switch, the rack picker and the install replay",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: '<svg id="kn-defs" width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false"></svg>',
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "kiln", prefix: "kn", rootClass: "kn", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "plate", "well", "stencil", "rocker", "gauge", "rating", "flipper", "ru", "faq", "screw", "topbar"] });
