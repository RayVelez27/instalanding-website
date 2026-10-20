// Extracts the Thorn design system from its landing page.
//
//   node scripts/systems/thorn.mjs
//
// Reads public/demos/thorn-controller.html (never edits it) and writes
// public/systems/thorn/ (specimen.html, tokens.css, thorn.css) through the
// shared pipeline in lib.mjs. The page builds its device and every control
// from layered DOM in one script and keeps its state on <html>; the system
// ships the same builders (sliced from the page, class names prefixed as they
// render) and keeps the state on the nearest [data-th-unit] or .th root, so
// several devices can live on one page.
import { readPage, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/thorn-controller.html";
const { page, el, css: pageCssRaw } = readPage(SOURCE);
const VERSION = "1.0.0";
// The page inlines its fonts as woff2; the system loads the same families from Google Fonts
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Saira:wght@100..900&family=Asap:wght@100..900&display=swap" rel="stylesheet">';

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. The finish
   group holds Fog, the default; Graphite and Sand override it wherever
   data-th-finish says so (see the components CSS). */
const TOKENS = `/* InstaLanding design system · Thorn · thorn@${VERSION}
   Extracted from https://instalanding.ai/demos/thorn-controller.html
   Fonts (Google Fonts): Saira 100-900 (display, labels), Asap 100-900 (text) */
:root {
  /* Color · core */
  --th-fog: #C9CED3;
  --th-alloy: #B2B6BD;
  --th-steel: #92959C;
  --th-graphite: #51575D;
  --th-slate: #3E3E40;
  --th-carbon: #0F1215;
  --th-soot: #2F2F2F;
  --th-signal: #FE5D01;
  --th-lime: #7BB470;
  --th-led: #A9D046;
  --th-amber: #FFBE00;

  /* Color · ink */
  --th-ink: #1B1D21;
  --th-ink-2: #4A4F56;
  --th-ink-3: #6D737A;
  --th-page: #BFC3C9;

  /* Color · finish */
  --th-b1: #D3D8DD;
  --th-b2: #C3C8CE;
  --th-hl: rgba(255,255,255,.7);
  --th-sh: rgba(28,31,37,.5);
  --th-line: #A3A7AD;
  --th-lbl: #5D646A;
  --th-badge: #646970;
  --th-badge2: #F5F6F7;
  --th-hole: #38383B;
  --th-hole-end: #E7E8E9;
  --th-face1: #E4E8EC;
  --th-face2: #B6BAC0;
  --th-ring: #3E4144;
  --th-grip1: #E8EAED;
  --th-grip2: #C1C5CA;
  --th-thumb1: #5D646A;
  --th-thumb2: #41464C;
  --th-key1: #D8DCE0;
  --th-key2: #BEC3C9;
  --th-keyedge: #F3ECEC;
  --th-tick: #A7ABB1;
  --th-house1: #ECEEF1;
  --th-house2: #BCC0C6;
  --th-plate1: #EEF0F2;
  --th-plate2: #BCC0C6;
  --th-nub1: #F7F7F7;
  --th-nub2: #D3D4D6;
  --th-label-ink: #3E3E40;
  --th-icon: #2F2F2F;
  --th-swatch: #C9CED3;

  /* Type · families */
  --th-font-display: "Saira", ui-sans-serif, system-ui, sans-serif;
  --th-font-body: "Asap", ui-sans-serif, system-ui, sans-serif;

  /* Type · scale */
  --th-display-xl: clamp(54px, 9vw, 140px);
  --th-display-lg: clamp(46px, 7.4vw, 118px);
  --th-display: clamp(36px, 5.2vw, 72px);
  --th-title: 24px;
  --th-title-sm: 22px;
  --th-lede: clamp(17px, 1.35vw, 19px);
  --th-body-lg: 17px;
  --th-body: 15px;
  --th-body-sm: 14px;
  --th-label: 13px;
  --th-label-sm: 12px;

  /* Shape · radii */
  --th-radius-tile: 22px;
  --th-radius-card: 18px;
  --th-radius-panel: 12px;
  --th-radius-key: 9px;
  --th-radius-round: 50%;

  /* Shape · borders */
  --th-border: 1px;
  --th-border-strong: 1.5px;

  /* Depth · machined */
  --th-shadow-key: inset 0 1px 0 rgba(255,255,255,.85), inset 0 -2px 0 rgba(0,0,0,.12), 0 1px 0 rgba(0,0,0,.08), 0 10px 24px -10px rgba(25,28,34,.45);
  --th-shadow-key-pressed: inset 0 2px 4px rgba(0,0,0,.18), 0 1px 0 rgba(255,255,255,.5);
  --th-shadow-tile: inset 0 1px 0 var(--th-hl), 0 1px 0 rgba(0,0,0,.08), 0 30px 50px -30px var(--th-sh);
  --th-glass: rgba(255,255,255,.18);
  --th-noise: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");

  /* Motion · easing */
  --th-ease: cubic-bezier(.2,.8,.2,1);
  --th-spring: cubic-bezier(.34,1.56,.64,1);

  /* Motion · durations */
  --th-dur-press: .15s;
  --th-dur-fast: .3s;
  --th-dur-finish: .6s;
  --th-dur-glow: .9s;
  --th-dur-blink: 1.1s;
  --th-dur-pulse: 1.8s;
  --th-dur-breathe: 4.2s;

  /* Space · layout */
  --th-page-max: 1240px;
  --th-gutter: 20px;
  --th-section-y: clamp(90px, 11vw, 150px);
  --th-gap: 18px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// Every custom property on the page (tokens, finish values and the local knobs
// --u, --q, --p, --rx, --ry, --gx, --gy, --sx, --a, --h) moves under --th-
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("th-") ? m : `--th-${n}`));
// The page's state lives on <html> as data-power and friends; the system's on its unit as data-th-*
const STATE = ["power", "playing", "rec", "mode", "shuffle", "loop", "finish"];
const renameState = (s) => s.replace(new RegExp(`\\[data-(${STATE.join("|")})(?=[=\\]])`, "g"), "[data-th-$1");

const HEX = { "#fe5d01": "signal", "#0f1215": "carbon", "#a9d046": "led", "#7bb470": "lime", "#2f2f2f": "soot" };
const end = "(?=\\s*[;}])";
const fs = (v, tok) => [new RegExp(`font-size:\\s*${v.replace(/[().]/g, "\\$&")}${end}`, "g"), `font-size:var(--th-${tok})`];
const rad = (px, tok) => [new RegExp(`border-radius:\\s*${px}px${end}`, "g"), `border-radius:var(--th-radius-${tok})`];
const SWAPS = [
  fs("clamp(54px,9vw,140px)", "display-xl"), fs("clamp(46px,7.4vw,118px)", "display-lg"), fs("clamp(36px,5.2vw,72px)", "display"),
  fs("clamp(17px,1.35vw,19px)", "lede"), fs("24px", "title"), fs("22px", "title-sm"), fs("17px", "body-lg"), fs("15px", "body"),
  fs("14px", "body-sm"), fs("13px", "label"), fs("12px", "label-sm"),
  rad(22, "tile"), rad(18, "card"), rad(12, "panel"), rad(9, "key"),
  [/font-family:Saira(?=[;}])/g, "font-family:var(--th-font-display)"],
  [/font-family:Asap(?=[;}])/g, "font-family:var(--th-font-body)"],
  [/font-family:"Asap",ui-sans-serif,system-ui,sans-serif/g, "font-family:var(--th-font-body)"],
  [/box-shadow:inset 0 1px 0 rgba\(255,255,255,\.85\),inset 0 -2px 0 rgba\(0,0,0,\.12\),0 1px 0 rgba\(0,0,0,\.08\),0 10px 24px -10px rgba\(25,28,34,\.45\)/g, "box-shadow:var(--th-shadow-key)"],
  [/box-shadow:inset 0 2px 4px rgba\(0,0,0,\.18\),0 1px 0 rgba\(255,255,255,\.5\)/g, "box-shadow:var(--th-shadow-key-pressed)"],
  [/box-shadow:inset 0 1px 0 var\(--th-hl\),0 1px 0 rgba\(0,0,0,\.08\),0 30px 50px -30px var\(--th-sh\)/g, "box-shadow:var(--th-shadow-tile)"],
  [/width:min\(1240px,100% - 40px\)/g, "width:min(var(--th-page-max),100% - 2*var(--th-gutter))"],
  [/padding:clamp\(90px,11vw,150px\) 0/g, "padding:var(--th-section-y) 0"],
  [/gap:18px(?=[;}])/g, "gap:var(--th-gap)"],
  [/background:rgba\(255,255,255,\.18\)(?=;)/g, "background:var(--th-glass)"],
  [/(?<=[\s:,])\.15s(?=[\s;,)}])/g, "var(--th-dur-press)"],
  [/(?<=[\s:,])\.3s(?=[\s;,)}])/g, "var(--th-dur-fast)"],
  [/(?<=[\s:,])\.6s(?=[\s;,)}])/g, "var(--th-dur-finish)"],
  [/(?<=[\s:,])\.9s(?=[\s;,)}])/g, "var(--th-dur-glow)"],
  [/ 1\.1s steps/g, " var(--th-dur-blink) steps"],
  [/ 1\.8s var/g, " var(--th-dur-pulse) var"],
  [/ 4\.2s ease-in-out/g, " var(--th-dur-breathe) ease-in-out"],
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
// Page-only parts: the document shell and grain, the scroll reveals, the fixed toast
const DROP = new RegExp([`^html`, `^body::before`, `^section${nb}`, `\\.reveal`, `\\.dev-in`, `\\.toast`].join("|"));
// Document-level selectors become selectors on the system root
function scopeSelector(sel) {
  if (sel === "*") return ":where(.th, .th *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.th, .th *)${sel.slice(1)}`;
  if (sel === "body") return ".th";
  if (sel === ":focus-visible") return ":where(.th) :focus-visible";
  return sel.replace(/^footer(?![\w-])/, ".footer");
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@font-face") || prelude.startsWith(":root")) return "";
    if (/^\[data-finish=/.test(prelude)) return ""; // finishes are rebuilt below
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}

const cssNoComments = stripComments(pageCssRaw);
let base = keep(cssNoComments);
// The finishes: each a set of values any element (or the unit) can carry with data-th-finish
const finishes = [...cssNoComments.matchAll(/\[data-finish=(\w+)\]\{([^}]*)\}/g)]
  .map(([, name, body]) => `.th[data-finish=${name}],\n.th [data-finish=${name}] {${body}}`).join("\n");
base = renameState(renameVars(finishes + "\n" + base));

// Every class the kept CSS uses gets the th- prefix (read from selectors only)
const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.replace(/url\([^)]*\)/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "th") CLASSES.add(m[1]);
}
const KEYFRAMES = ["breathe", "slring", "slblink", "recblink", "ring", "eq"];
// Hooks in the markup that scripts read or CSS styles on: all under data-th-
const ATTRS = ["c", "bind", "finish-set", "finish", "rx", "ry", "amp", "intro", "hint"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "th", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(renameVars(html));

// Anything still without the root after prefixing (bare h1, button, a…) goes under :where(.th)
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (s.includes(".th") ? s : `:where(.th) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
/* The unit of the device builders; the page set it on :root */
.th { --th-u: 1px; }
/* Fixed on the page; a component in the system sits in the flow */
.th-nav { position: relative; }
.th-hero { padding-top: 70px; }`;
const componentCss = rootEvery(prefixCss(tokenize(base)) + "\n" + EXTRA).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Markup helpers ───────────────────────────────────────────────── */
// The page's reveal hooks and anchors belong to the page, not the system
const unhook = (html) => html
  .replace(/ class="([^"]*)"/g, (m, cls) => {
    const kept = cls.split(/\s+/).filter((c) => c && !/^(reveal|dev-in)$/.test(c));
    return kept.length ? ` class="${kept.join(" ")}"` : "";
  })
  .replace(/ style="transition-delay:[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/href="#[a-z-]+"/g, 'href="#"');

/* ── 5. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });

const nav = el('<nav class="nav"').replace('<button class="snd" id="snd"', '<button class="snd" data-th-sound');
add("nav", "Navigation", "The THORN / 98 wordmark in Saira with a white numeral, tracked Saira links, a round sound toggle (the device's clicks on or off) and a tape-key Reserve button with its signal-orange dot. Links hide under 820px.",
  `<div style="padding: 6px 0; border-radius: 22px; background: linear-gradient(100deg,#8b8e95 0%,#a9adb4 38%,#c3c6cb 70%,#cbced3 100%)">\n${nav}\n</div>`, { js: true });

const hero = el('<header class="hero"');
add("hero", "Controller hero", "The device itself as the hero: a 651 x 331-unit artboard extruded in CSS 3D from stacked layers, tilting toward the cursor with a moving specular sheen. Every dial, fader, key and toggle on it works; the readout below follows the state and the swatches change the finish.",
  hero, { js: true });

const btns = /<div class="ctas">[\s\S]*?<\/div>/.exec(hero)[0];
add("buttons", "Tape-key buttons", "Buttons are tape keys: a brushed-alloy gradient with a bright top edge, a dark bottom lip and a soft drop, lifting 1px on hover and pressing in on :active. The dot is the record light. The dark key and the underlined text link sit beside it.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">
${btns.replace(/^<div class="ctas">|<\/div>$/g, "")}
<a class="btn dark" href="#"><span class="dot"></span>Reserve THORN/98</a>
</div>`);

add("type", "Headline pairing", "A Saira kicker led by a signal-orange dot, a tight Saira headline (weight 620, tracking -0.025em, line-height .98) and an Asap lede in the second ink, held to 34em.",
  el('<div class="sec-head">'));

add("bento", "Control tiles", "Five finish-coloured tiles, each holding one live control at its own scale with a value readout: the detent dials (80 steps over 320°), the long-throw faders, the joystick, the latching tape keys and the one lit key. The tile with the power key glows lime when the unit is on.",
  el('<div class="bento">'), { js: true });

const display = el('<section class="display sec"').replace(/^<section/, "<div").replace(/<\/section>$/, "</div>")
  .replace('<div class="queue" id="queue">', '<div class="queue">');
add("display", "Display", "A carbon section around the screen module: the screen sits deep in a raised bezel, sleeps behind a pulsing PRESS TO POWER ON badge, and when on shows Player, Radio or Tape with a breathing glow (lime playing, orange recording). Beside it an Up next queue and its own power key.",
  `<div style="border-radius: 22px; overflow: hidden">\n${display}\n</div>`, { js: true });

add("finishes", "Finish cards", "One card per finish, each with a mini device pinned to that finish by data-th-finish. Choosing a card re-finishes the whole unit: shell, faces, grips, fader caps, keys and labels all read their colours from the finish tokens.",
  el('<div class="fin-cards">'), { js: true });

add("accents", "Accent cards", "The colours that carry meaning across every finish: lime for power, signal for record, carbon for the screen, and the type card, each with a soft-light grain.",
  el('<div class="accents'));

add("specs", "Specifications", "A sticky side with a tilted device (shown in the current finish) beside a definition list: uppercase Saira terms in the third ink over 17px Asap values, ruled with a dark line and a white highlight under it.",
  el('<div class="wrap spec-grid">'), { js: true });

const finale = el('<section class="final"').replace(/^<section/, "<div").replace(/<\/section>$/, "</div>")
  .replace('<button class="btn" id="reserveBtn">', '<button class="btn" data-th-reserve>');
add("cta", "Reservation", "The closing call: a centred kicker, a huge Saira headline, the price line, a big power key that pulses until the unit is on, and the tape-key button (it turns the unit on).",
  `<div style="border-radius: 22px; overflow: hidden">\n${finale}\n</div>`, { js: true });

const footer = el('<footer data-section="footer">').replace(/^<footer[^>]*>/, '<footer class="footer">');
add("footer", "Footer", "The wordmark small, a line of copy, a ruled top edge on the darker alloy ground.",
  `<div style="border-radius: 22px; overflow: hidden">\n${footer}\n</div>`);

/* ── 6. Component script ─────────────────────────────────────────────── */
// The builders are the page's own code, sliced verbatim: its icons, the 3D
// layer helpers and one function per part. Their custom properties and data
// hooks move under th-, and PX() prefixes their class names as they render.
const S0 = page.indexOf("const I={"), S1 = page.indexOf("$$('[data-c=device]')");
if (S0 < 0 || S1 < 0) throw new Error("builders not found in the page script");
const HOOKS = ["dial", "fader", "thumb", "joy", "key", "act", "tippy", "modestep", "seek", "power-btn", "bind", "l"];
const BUILDERS = renameVars(page.slice(S0, S1).trim())
  .replace(new RegExp(`\\bdata-(${HOOKS.join("|")})(?=[=\\s>"])`, "g"), "data-th-$1");

const JS = `(function () {
  'use strict';
  /* Thorn components, no libraries. The device and every control are built from
     layered DOM; the state lives on the nearest [data-th-unit] (or the .th root),
     mirrored there as data-th-power / -playing / -rec / -mode / -shuffle / -loop. */
  var CLS = new Set(${JSON.stringify([...CLASSES].sort())});
  var PX = function (h) {
    return h.replace(/ class="([^"]*)"/g, function (_, l) {
      return ' class="' + l.split(/\\s+/).filter(Boolean).map(function (c) { return CLS.has(c) ? 'th-' + c : c; }).join(' ') + '"';
    });
  };
  var TR = ${JSON.stringify(JSON.parse(/const TR=(\[[^\n]*\]);/.exec(page)[1].replace(/(\w+):/g, '"$1":').replace(/'/g, '"')))};
  var MODES = ['PLAYER', 'RADIO', 'TAPE'];
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* ── builders (from the page) ── */
${BUILDERS.split("\n").map((l) => "  " + l).join("\n")}

  /* ── units: one state per [data-th-unit] or .th root ── */
  var STATE = new WeakMap(), UNITS = new Set();
  function unitOf(el) { return el.closest('[data-th-unit]') || el.closest('.th'); }
  function st(u) {
    var S = STATE.get(u);
    if (!S) {
      S = { power: false, playing: false, track: 2, prog: [0, 0, 0.02], shuffle: false, loop: false, rec: false, mode: 0, dial: [0, 0], fader: [0.35, 0.512], tape: 0, sound: true, toastT: 0 };
      STATE.set(u, S);
      UNITS.add(u);
    }
    return S;
  }

  /* sound: tiny synthesized mechanical clicks, made on the first click */
  var AC;
  function click(S, f, g, len) {
    if (!S.sound) return;
    f = f || 3200; g = g || 0.18; len = len || 0.018;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var n = AC.sampleRate * len | 0, buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
      var s = AC.createBufferSource(), bp = AC.createBiquadFilter(), gn = AC.createGain();
      bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.2; gn.gain.value = g;
      s.buffer = buf; s.connect(bp).connect(gn).connect(AC.destination); s.start();
    } catch (e) {}
  }
  function thunk(S) { click(S, 900, 0.35, 0.05); setTimeout(function () { click(S, 2400, 0.12, 0.015); }, 35); }

  /* ── render ── */
  var fm = function (S) { return (87.5 + S.fader[1] * 20.5).toFixed(1); };
  var vol = function (S) { return Math.round(S.fader[0] * 100); };
  var sgn = function (v) { return v === 0 ? '+0' : '+' + v; };
  function stoast(u, txt) {
    var S = st(u);
    $$('.th-s-toast', u).forEach(function (t) { t.textContent = txt; t.classList.add('th-show'); });
    clearTimeout(S.toastT);
    S.toastT = setTimeout(function () { $$('.th-s-toast', u).forEach(function (t) { t.classList.remove('th-show'); }); }, 1300);
  }
  function tapeStat(S) { return !S.power ? 'STANDBY' : S.rec ? '\\u25CF RECORDING' : S.playing ? '\\u25B6 PLAYING' : '\\u25A0 STOPPED'; }
  function bind(u, k, v) { $$('[data-th-bind=' + k + ']', u).forEach(function (e) { if (e.textContent !== v) e.textContent = v; }); }
  function render(u) {
    var S = st(u), d = u.dataset, t = TR[S.track];
    d.thPower = S.power ? 'on' : 'off'; d.thPlaying = S.playing ? 1 : 0; d.thRec = S.rec ? 1 : 0;
    d.thMode = S.mode; d.thShuffle = S.shuffle ? 1 : 0; d.thLoop = S.loop ? 1 : 0;
    bind(u, 'title', t.t); bind(u, 'artist', t.a); bind(u, 'mode', MODES[S.mode]); bind(u, 'fm', fm(S)); bind(u, 'vol', String(vol(S)));
    bind(u, 'd0', sgn(S.dial[0])); bind(u, 'd1', sgn(S.dial[1])); bind(u, 'tapeStat', tapeStat(S));
    bind(u, 'status', !S.power ? 'STANDBY' : S.rec ? 'RECORDING' : S.playing ? 'PLAYING' : 'READY');
    S.dial.forEach(function (v, i) {
      $$('[data-th-dial="' + i + '"]', u).forEach(function (f) {
        f.querySelector('.th-d-rot').style.setProperty('--th-a', v * 4 + 'deg');
        f.setAttribute('aria-valuenow', v);
        f.closest('.th-dial').querySelectorAll('.th-d-lbl').forEach(function (l) { l.classList.toggle('th-hit', +l.dataset.thL === v && S.power); });
      });
    });
    S.fader.forEach(function (v, i) {
      $$('[data-th-thumb="' + i + '"]', u).forEach(function (th) { th.style.top = (6 + (1 - v) * 35) + 'em'; });
      $$('[data-th-fader="' + i + '"]', u).forEach(function (f) { f.setAttribute('aria-valuenow', Math.round(v * 100)); f.setAttribute('aria-valuetext', i ? fm(S) + ' MHz' : vol(S) + '%'); });
    });
    $$('.th-key', u).forEach(function (k) {
      k.classList.toggle('th-down', (k.dataset.thKey === 'play' && S.playing && S.power) || (k.dataset.thKey === 'rec' && S.rec && S.power) || k.classList.contains('th-mom'));
    });
    $$('[data-th-power-btn]', u).forEach(function (b) { b.setAttribute('aria-pressed', S.power); });
    $$('[data-th-tippy]', u).forEach(function (b) { b.setAttribute('aria-pressed', S[b.dataset.thTippy]); });
    $$('.th-q', u).forEach(function (b) { b.classList.toggle('th-cur', +b.dataset.thTrack === S.track); });
    frame(u);
  }
  function frame(u) {
    var S = st(u), p = S.prog[S.track];
    $$('.th-s-bar', u).forEach(function (b) { b.firstChild.style.width = (p * 100) + '%'; b.children[1].style.left = (p * 100) + '%'; });
    $$('.th-r-needle', u).forEach(function (n) { n.style.left = (46 + S.fader[1] * 223) + 'em'; });
    $$('.th-reel svg', u).forEach(function (r) { r.style.transform = 'rotate(' + (S.tape * 40) + 'deg)'; });
    bind(u, 'count', String(Math.floor(S.tape)).padStart(4, '0'));
  }

  /* ── actions ── */
  function setPower(u, on) { var S = st(u); S.power = on; if (!on) { S.playing = false; S.rec = false; } else stoast(u, 'HELLO'); thunk(S); render(u); }
  function needPower(u) {
    if (st(u).power) return false;
    $$('[data-th-power-btn]', u).forEach(function (b) { if (b.animate) b.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 420 }); });
    return true;
  }
  function swapTrack(u, n) {
    $$('.th-pg-0', u).forEach(function (p) { p.classList.add('th-swap'); });
    setTimeout(function () { var S = st(u); S.track = n; S.prog[n] = 0; render(u); $$('.th-pg-0', u).forEach(function (p) { p.classList.remove('th-swap'); }); }, 180);
  }
  function nextTrack(u, dir) {
    var S = st(u);
    swapTrack(u, S.shuffle ? (S.track + 1 + Math.floor(Math.random() * (TR.length - 1))) % TR.length : (S.track + dir + TR.length) % TR.length);
  }
  function setMode(u, step) { var S = st(u); S.mode = (S.mode + step + MODES.length) % MODES.length; click(S, 2600, 0.15); render(u); }
  function act(u, a) {
    if (needPower(u)) return;
    var S = st(u);
    click(S, 2800, 0.14);
    if (a === 'toggle') { S.playing = !S.playing; if (!S.playing) S.rec = false; }
    if (a === 'prev') { if (S.prog[S.track] > 0.08) S.prog[S.track] = 0; else nextTrack(u, -1); }
    if (a === 'next') nextTrack(u, 1);
    if (a === 'shuffle') { S.shuffle = !S.shuffle; stoast(u, S.shuffle ? 'SHUFFLE ON' : 'SHUFFLE OFF'); }
    if (a === 'loop') { S.loop = !S.loop; stoast(u, S.loop ? 'REPEAT ON' : 'REPEAT OFF'); }
    render(u);
  }
  function momentary(u, el) { el.classList.add('th-mom'); setTimeout(function () { el.classList.remove('th-mom'); render(u); }, 180); }
  function keyPress(u, k, el) {
    var S = st(u);
    thunk(S);
    if (k === 'stop') momentary(u, el);
    if (needPower(u)) { if (k !== 'stop') momentary(u, el); render(u); return; }
    if (k === 'stop') { S.playing = false; S.rec = false; S.prog[S.track] = 0; }
    if (k === 'play') S.playing = true;
    if (k === 'rec') { S.rec = !S.rec; if (S.rec) { S.playing = true; S.mode = 2; } }
    render(u);
  }
  function setDial(u, i, v) {
    var S = st(u);
    v = Math.max(0, Math.min(80, v)); if (v === S.dial[i]) return;
    S.dial[i] = v;
    click(S, v % 10 === 0 ? 2200 : 3600, v % 10 === 0 ? 0.22 : 0.09, 0.012);
    if (S.power) stoast(u, (i ? 'HIGH ' : 'LOW ') + sgn(v));
    render(u);
  }
  function setFader(u, i, v) {
    var S = st(u);
    v = Math.max(0, Math.min(1, v));
    var before = i ? fm(S) : vol(S); S.fader[i] = v; var after = i ? fm(S) : vol(S);
    if (before !== after) { if (!i && after % 5 === 0) click(S, 4200, 0.05, 0.008); if (S.power) stoast(u, i ? 'FM ' + after : 'VOL ' + after); }
    render(u);
  }

  /* ── build: fill every [data-th-c] host once, then render its unit ── */
  var SCENES = [];
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vio = window.IntersectionObserver ? new IntersectionObserver(function (es) {
    es.forEach(function (en) { SCENES.forEach(function (s) { if (s.sc === en.target) s.vis = en.isIntersecting; }); });
  }, { rootMargin: '100px' }) : null;
  function build(scope) {
    var touched = new Set();
    $$('[data-th-c]', scope).forEach(function (el) {
      if (el._thBuilt) return;
      el._thBuilt = true;
      var c = el.getAttribute('data-th-c');
      if (c === 'device') {
        el.innerHTML = PX(device(el.hasAttribute('data-th-hint')));
        var sc = el.closest('.th-scene');
        if (sc && !sc.querySelector('.th-gshadow')) sc.insertAdjacentHTML('afterbegin', '<i class="th-gshadow"></i>');
      }
      if (c === 'dials') el.innerHTML = PX(dial(0) + dial(1));
      if (c === 'faders') el.innerHTML = PX(fader(0) + fader(1));
      if (c === 'joy') el.innerHTML = PX(joy());
      if (c === 'keys') el.innerHTML = PX(keys());
      if (c === 'power') el.innerHTML = PX(power());
      if (c === 'screen') el.innerHTML = PX(screen(null, null, true));
      // mini devices in finish cards are decorative
      if (el.closest('.th-fin')) {
        el.setAttribute('aria-hidden', 'true');
        $$('[tabindex], button', el).forEach(function (e) { e.tabIndex = -1; });
      }
      var u = unitOf(el);
      if (u) touched.add(u);
    });
    $$('.th-queue', scope).forEach(function (q) {
      if (q._thBuilt) return;
      q._thBuilt = true;
      TR.forEach(function (t, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'th-q'; b.dataset.thTrack = i;
        b.innerHTML = '<span class="th-i">0' + (i + 1) + '</span><span><span class="th-tt">' + t.t + '</span><span class="th-aa">' + t.a + '</span></span><span class="th-eq"><span></span><span></span><span></span></span>';
        q.appendChild(b);
      });
      var u = unitOf(q);
      if (u) touched.add(u);
    });
    $$('.th-scene', scope).forEach(function (sc) {
      if (sc._thScene) return;
      sc._thScene = true;
      var s = { sc: sc, bx: +sc.dataset.thRx || 0, by: +sc.dataset.thRy || 0, amp: RM ? 0 : +(sc.dataset.thAmp || 0), tx: 0, ty: 0, cx: 0, cy: 0, intro: sc.dataset.thIntro && !RM ? 1 : 0, vis: !vio };
      SCENES.push(s);
      if (vio) vio.observe(sc);
    });
    $$('[data-th-bind], [data-th-finish-set]', scope).forEach(function (e) { var u = unitOf(e); if (u) touched.add(u); });
    touched.forEach(render);
  }
  build(document);
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; build(document); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ── input ── */
  var HIT = '[data-th-power-btn],[data-th-act],[data-th-modestep],[data-th-key],[data-th-tippy],[data-th-finish-set],.th-q,[data-th-seek],[data-th-sound],[data-th-reserve]';
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest(HIT);
    if (!t || !t.closest('.th')) return;
    var u = unitOf(t), S = st(u);
    if (t.matches('[data-th-power-btn]')) return setPower(u, !S.power);
    if (t.matches('[data-th-reserve]')) { thunk(S); if (!S.power) setPower(u, true); return; }
    if (t.matches('[data-th-sound]')) { S.sound = !S.sound; $$('[data-th-sound]', u).forEach(function (b) { b.setAttribute('aria-pressed', S.sound); }); click(S, 2400, 0.15); return; }
    if (t.matches('[data-th-act]')) return act(u, t.dataset.thAct);
    if (t.matches('[data-th-modestep]')) { if (needPower(u)) return; return setMode(u, +t.dataset.thModestep); }
    if (t.matches('[data-th-key]')) return keyPress(u, t.dataset.thKey, t);
    if (t.matches('[data-th-tippy]')) {
      click(S, 1500, 0.3, 0.03);
      var k = t.dataset.thTippy; S[k] = !S[k];
      if (S.power) stoast(u, k === 'shuffle' ? (S.shuffle ? 'SHUFFLE ON' : 'SHUFFLE OFF') : (S.loop ? 'REPEAT ON' : 'REPEAT OFF'));
      return render(u);
    }
    if (t.matches('[data-th-finish-set]')) {
      var f = t.dataset.thFinishSet;
      u.setAttribute('data-th-finish', f);
      bind(u, 'finishName', f[0].toUpperCase() + f.slice(1));
      $$('[data-th-finish-set]', u).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.thFinishSet === f); });
      click(S, 2000, 0.12);
      return;
    }
    if (t.matches('.th-q')) { if (!S.power) setPower(u, true); S.mode = 0; S.playing = true; swapTrack(u, +t.dataset.thTrack); return; }
    if (t.matches('[data-th-seek]')) {
      if (needPower(u)) return;
      var r = t.getBoundingClientRect();
      S.prog[S.track] = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      click(S, 2800, 0.1); render(u);
    }
  });

  function dialFromPoint(el, x, y) {
    var r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var a = Math.atan2(x - cx, -(y - cy)) * 180 / Math.PI; if (a < 0) a += 360;
    return a <= 320 ? Math.round(a / 4) : (a < 340 ? 80 : 0);
  }
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (!e.target.closest) return;
    var d = e.target.closest('[data-th-dial]'), f = e.target.closest('[data-th-fader]'), j = e.target.closest('[data-th-joy]');
    if (!d && !f && !j) return;
    e.preventDefault();
    var u = unitOf(d || f || j), S = st(u);
    if (d) { var i = +d.dataset.thDial; drag = { type: 'd', u: u, el: d, i: i, last: S.dial[i] }; }
    if (f) { var th = f.parentNode.querySelector('.th-f-slot').getBoundingClientRect(); drag = { type: 'f', u: u, el: f, i: +f.dataset.thFader, top: th.top, h: th.height }; }
    if (j) { drag = { type: 'j', u: u, el: j, x: e.clientX, y: e.clientY, dx: 0, dy: 0 }; j.classList.add('th-drag'); }
    var cap = d || f || j;
    if (cap.setPointerCapture) cap.setPointerCapture(e.pointerId);
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (drag.type === 'd') {
      var v = dialFromPoint(drag.el, e.clientX, e.clientY);
      if (Math.abs(v - drag.last) > 40) return; // ignore wrap-around jumps
      drag.last = v; setDial(drag.u, drag.i, v);
    }
    if (drag.type === 'f') setFader(drag.u, drag.i, 1 - (e.clientY - drag.top - drag.h * 0.1) / (drag.h * 0.8));
    if (drag.type === 'j') {
      var r = drag.el.getBoundingClientRect(), unit = r.width / 36, dx = (e.clientX - drag.x) / unit, dy = (e.clientY - drag.y) / unit;
      var m = Math.hypot(dx, dy), max = 9; if (m > max) { dx *= max / m; dy *= max / m; }
      drag.dx = dx; drag.dy = dy; drag.el.style.transform = 'translate(' + dx + 'em,' + dy + 'em)';
      var arc = drag.el.closest('.th-joy').querySelector('.th-arc');
      if (m > 2) arc.style.transform = 'rotate(' + (Math.atan2(dy, dx) * 180 / Math.PI + 45) + 'deg)';
    }
  });
  function endDrag() {
    if (!drag) return;
    if (drag.type === 'j') {
      var u = drag.u, dx = drag.dx, dy = drag.dy, el = drag.el;
      el.classList.remove('th-drag'); el.style.transform = '';
      el.closest('.th-joy').querySelector('.th-arc').style.transform = '';
      if (Math.hypot(dx, dy) < 3) act(u, 'toggle');
      else if (Math.abs(dx) > Math.abs(dy)) { if (!needPower(u)) setMode(u, dx > 0 ? 1 : -1); }
      else if (!needPower(u)) { setFader(u, 0, st(u).fader[0] + (dy < 0 ? 0.1 : -0.1)); click(st(u), 3000, 0.1); }
    }
    drag = null;
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  document.addEventListener('keydown', function (e) {
    if (!e.target.closest) return;
    var d = e.target.closest('[data-th-dial]'), f = e.target.closest('[data-th-fader]'), j = e.target.closest('[data-th-joy]'), fin = e.target.closest('.th-fin');
    var step = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 }[e.key];
    if (d && step) { e.preventDefault(); var u = unitOf(d); setDial(u, +d.dataset.thDial, st(u).dial[+d.dataset.thDial] + step); }
    if (f && step) { e.preventDefault(); var uf = unitOf(f); setFader(uf, +f.dataset.thFader, st(uf).fader[+f.dataset.thFader] + step * 0.01); }
    if (j) {
      var uj = unitOf(j);
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(uj, 'toggle'); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); if (!needPower(uj)) setMode(uj, e.key === 'ArrowRight' ? 1 : -1); }
    }
    if (fin && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); fin.click(); }
  });

  /* ── loop: playback and the tape counter ── */
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.1, (now - last) / 1000); last = now;
    UNITS.forEach(function (u) {
      if (!u.isConnected) { UNITS.delete(u); return; }
      var S = st(u);
      if (!S.power || !S.playing) return;
      S.prog[S.track] += dt / TR[S.track].d; S.tape += dt * (S.rec ? 1.6 : 1.2);
      if (S.prog[S.track] >= 1) { S.prog[S.track] = 0; if (!S.loop) nextTrack(u, 1); }
      frame(u);
    });
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ── 3D: cursor-follow tilt, specular sheen, intro turn ── */
  var px = innerWidth / 2, py = innerHeight / 2;
  addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; px = e.clientX; py = e.clientY; }, { passive: true });
  function tilt() {
    for (var k = SCENES.length - 1; k >= 0; k--) {
      var s = SCENES[k];
      if (!s.sc.isConnected) { if (vio) vio.unobserve(s.sc); SCENES.splice(k, 1); continue; }
      if (!s.vis && !s.intro && s.init) continue;
      s.init = 1;
      if (!drag) {
        var r = s.sc.getBoundingClientRect();
        s.tx = Math.max(-1, Math.min(1, (px - (r.left + r.width / 2)) / (innerWidth * 0.5)));
        s.ty = Math.max(-1, Math.min(1, (py - (r.top + r.height / 2)) / (innerHeight * 0.6)));
      }
      s.cx += (s.tx - s.cx) * 0.06; s.cy += (s.ty - s.cy) * 0.06;
      if (s.intro && s.vis) s.intro *= 0.955;
      if (s.intro < 0.002) s.intro = 0;
      var rx = s.bx - s.cy * s.amp * 0.55 - s.intro * 18, ry = s.by + s.cx * s.amp - s.intro * 34, st2 = s.sc.style;
      st2.setProperty('--th-rx', rx.toFixed(2) + 'deg'); st2.setProperty('--th-ry', ry.toFixed(2) + 'deg');
      st2.setProperty('--th-gx', (55 + s.cx * 35 + ry * 0.8).toFixed(1) + '%'); st2.setProperty('--th-sx', (ry * 1.4).toFixed(1)); st2.setProperty('--th-gy', (18 + s.cy * 25).toFixed(1) + '%');
    }
    requestAnimationFrame(tilt);
  }
  requestAnimationFrame(tilt);
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--th-page)}
.sp-top{position:relative;overflow:hidden;padding:28px var(--th-gutter) 70px;background:radial-gradient(70% 60% at 82% 0%,rgba(255,255,255,.55),transparent 70%),linear-gradient(100deg,#8b8e95 0%,#a9adb4 38%,#c3c6cb 70%,#cbced3 100%)}
.sp-top-in{position:relative;max-width:var(--th-page-max);margin:0 auto}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;padding:14px 18px;border-radius:var(--th-radius-panel);background:var(--th-glass);box-shadow:inset 0 0 0 1px rgba(255,255,255,.35),0 1px 0 rgba(0,0,0,.06);font:500 13px/1 var(--th-font-display);letter-spacing:.08em;color:#40454b}
.sp-meta b{font-size:17px}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:40px;align-items:end;margin-top:72px}
.sp-hero h1{font-size:clamp(46px,6.4vw,96px);font-weight:640;color:#1e2125;margin-top:22px}
.sp-hero h1 em{font-style:normal;color:#f4f5f6;text-shadow:0 1px 0 rgba(0,0,0,.08)}
.sp-lede{color:#3c4147}
.sp-pick{margin-top:24px}
.sp-main{max-width:var(--th-page-max);margin:0 auto;padding:16px var(--th-gutter) 120px}
.sp-sec{padding:56px 0;border-bottom:1px solid rgba(0,0,0,.12);box-shadow:0 1px 0 rgba(255,255,255,.35);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:8px 40px;margin-bottom:28px}
.sp-head h2{margin:10px 0 0;font:620 30px/1 var(--th-font-display);letter-spacing:-.025em}
.sp-label{margin:0;font:550 12px/1 var(--th-font-display);letter-spacing:.18em;text-transform:uppercase;color:var(--th-ink-3)}
.sp-note{margin:0;max-width:640px;font:400 16px/1.6 var(--th-font-body);color:var(--th-ink-2)}
.sp-demo{position:relative}
@media (max-width:900px){.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:720px){.sp-top{padding:16px 16px 48px}.sp-main{padding:8px 16px 80px}}
`;
const pick = /<div class="finish-pick">[\s\S]*?<\/div>\s*<\/div>/.exec(hero)[0];
const HERO = `
<header class="sp-top">
<div class="sp-top-in">
<div class="sp-meta"><b>${prefixMarkup(/<a href="#top" class="brand">[\s\S]*?<\/a>/.exec(nav)[0].replace('href="#top"', 'href="#"'))}</b><span>INSTALANDING DESIGN SYSTEM · THORN@${VERSION} · ${C.length} COMPONENTS</span></div>
<div class="sp-hero">
<div>
<div class="th-kicker">Design system · machined alloy</div>
<h1>Hardware you can <em>build</em> with.</h1>
</div>
<div>
<p class="th-lede sp-lede">Bead-blasted alloy in three finishes, tape-key buttons, Saira set tight and a device extruded in CSS 3D whose dials, faders, joystick and keys all work. Extracted from the Thorn Music Controller page.</p>
<div class="sp-pick">${prefixMarkup(pick)}</div>
</div>
</div>
</div>
</header>`;
const DEFS = '<svg id="th-defs" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden"></svg>';
const specimen = renderSpecimen({
  name: "Thorn",
  slug: "thorn",
  version: VERSION,
  prefix: "th",
  rootClass: "th",
  labelClass: "sp-label",
  script: "scripts/systems/thorn.mjs",
  source: SOURCE,
  metaDescription: "The Thorn design system: tokens and working components extracted from the Thorn Music Controller page.",
  defsNote: "empty: every surface is CSS gradients and stacked layers",
  jsNote: "builds the device and every control from layered DOM and runs their state, sound and tilt (no libraries)",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "thorn", prefix: "th", rootClass: "th", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "tile", "bento", "device", "scene", "kicker", "lede", "fin", "nav", "hero", "queue"] });
