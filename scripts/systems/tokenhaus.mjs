// Extracts the Tokenhaus design system from its landing page.
//
//   node scripts/systems/tokenhaus.mjs
//
// Reads public/demos/tokenhaus-design-academy.html (never edits it) and writes
// public/systems/tokenhaus/ (specimen.html, tokens.css, tokenhaus.css) through
// the shared pipeline in lib.mjs. The page keeps one flat, minified <style>
// (its tag shares a line with the first rule, so the CSS is sliced here rather
// than by readPage). The system drops everything behind .motion (GSAP,
// ScrollTrigger, SplitText and Lenis: the sticky hero cover, tiles turning on
// scroll, the echo fan, the rolling disc, the stacked quotes) and keeps every
// section's resting frame, which is what the page shows without motion. What
// the page's script does without motion stays: echo copies of the outlined
// words, the course and FAQ accordions, bar widths from their % labels, the
// header menu, and the coded artwork, which is lifted whole into the component
// script with its SVG classes and ids moved under the prefix.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/tokenhaus-design-academy.html";
const { page, el } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@600..900&family=Instrument+Sans:wght@400..600&display=swap" rel="stylesheet">';
const STYLE_AT = page.indexOf("<style>@property");
if (STYLE_AT < 0) throw new Error("style block not found");
const pageCss = page.slice(STYLE_AT + 7, page.indexOf("</style>", STYLE_AT));

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Tokenhaus · tokenhaus@${VERSION}
   Extracted from https://instalanding.ai/demos/tokenhaus-design-academy.html
   Fonts (Google Fonts): Gabarito 600-900 (display, set 800-900 and uppercase), Instrument Sans 400-600 (text) */
:root {
  /* Color · core */
  --tk-ink: #212445;
  --tk-paper: #E7ECF0;
  --tk-amber: #FFA802;
  --tk-sky: #00A9FF;
  --tk-pink: #FF73A5;
  --tk-light: #FDFEFD;

  /* Color · derived */
  --tk-soft-on-paper: color-mix(in oklab, var(--tk-ink) 78%, var(--tk-paper));
  --tk-faint-on-paper: color-mix(in oklab, var(--tk-ink) 65%, var(--tk-paper));
  --tk-track: color-mix(in oklab, var(--tk-ink) 10%, var(--tk-paper));
  --tk-soft-on-ink: color-mix(in oklab, var(--tk-light) 80%, var(--tk-ink));
  --tk-dim-on-ink: color-mix(in oklab, var(--tk-light) 60%, var(--tk-ink));

  /* Type · families */
  --tk-font-display: "Gabarito", system-ui, sans-serif;
  --tk-font-text: "Instrument Sans", system-ui, sans-serif;

  /* Type · scale */
  --tk-display: clamp(42px, 7.4vw, 112px);
  --tk-say: clamp(28px, 4.3vw, 66px);
  --tk-quote: clamp(26px, 3.3vw, 50px);
  --tk-step: clamp(30px, 3.4vw, 52px);
  --tk-row: clamp(24px, 3vw, 44px);
  --tk-statement: clamp(21px, 2.3vw, 34px);
  --tk-h3: clamp(22px, 2.1vw, 30px);
  --tk-question: clamp(20px, 1.9vw, 27px);
  --tk-lead: clamp(17px, 1.35vw, 19px);
  --tk-text: 17px;
  --tk-button: 16px;
  --tk-small: 15px;
  --tk-k: .7;

  /* Shape · radii */
  --tk-pill: 999px;
  --tk-rq: clamp(96px, 18vw, 280px);

  /* Shape · borders */
  --tk-rule: 3px;
  --tk-focus: 3px;

  /* Motion · easing */
  --tk-ease: cubic-bezier(.7, 0, .2, 1);

  /* Motion · durations */
  --tk-dur: .45s;
  --tk-dur-turn: .5s;
  --tk-dur-wipe: .55s;
  --tk-dur-run: .7s;

  /* Space · layout */
  --tk-gut: clamp(10px, 1.6vw, 22px);
  --tk-side: clamp(16px, 4vw, 56px);
  --tk-wrap: 1320px;
  --tk-pad: clamp(80px, 11vw, 168px);
  --tk-gap: clamp(14px, 1.8vw, 24px);
  --tk-hh: 64px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--display -> --tk-font-display);
// local ones (--tb, --tf, --r, --len, --m ...) move under tk- too, so a host's variables can't reach them
const VARS = { display: "font-display", text: "font-text" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("tk-") ? m : `--tk-${VARS[n] ?? n}`));
const esc = (v) => v.replace(/[().,+*/]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--tk-${tok})`];
const dur = (v, tok) => [new RegExp(`${esc(v)} var\\(--tk-ease\\)`, "g"), `var(--tk-${tok}) var(--tk-ease)`];
const SWAPS = [
  val("clamp(42px, 7.4vw, 112px)", "display"), val("clamp(28px, 4.3vw, 66px)", "say"), val("clamp(26px, 3.3vw, 50px)", "quote"),
  val("clamp(30px, 3.4vw, 52px)", "step"), val("clamp(24px, 3vw, 44px)", "row"), val("clamp(21px, 2.3vw, 34px)", "statement"),
  val("clamp(22px, 2.1vw, 30px)", "h3"), val("clamp(20px, 1.9vw, 27px)", "question"), val("clamp(17px, 1.35vw, 19px)", "lead"),
  [/font:400 17px\/1\.55/g, "font:400 var(--tk-text)/1.55"],
  [/font:700 16px\/1/g, "font:700 var(--tk-button)/1"],
  [/font-size:15px/g, "font-size:var(--tk-small)"],
  [/(border(?:-top|-bottom)?:)3px solid/g, "$1var(--tk-rule) solid"],
  [/outline:3px solid/g, "outline:var(--tk-focus) solid"],
  [/color-mix\(in oklab, var\(--tk-ink\) 78%, var\(--tk-paper\)\)/g, "var(--tk-soft-on-paper)"],
  [/color-mix\(in oklab, var\(--tk-ink\) 65%, var\(--tk-paper\)\)/g, "var(--tk-faint-on-paper)"],
  [/color-mix\(in oklab, var\(--tk-ink\) 10%, var\(--tk-paper\)\)/g, "var(--tk-track)"],
  [/color-mix\(in oklab, var\(--tk-light\) 80%, var\(--tk-ink\)\)/g, "var(--tk-soft-on-ink)"],
  [/color-mix\(in oklab, var\(--tk-light\) 60%, var\(--tk-ink\)\)/g, "var(--tk-dim-on-ink)"],
  dur(".45s", "dur"), dur(".5s", "dur-turn"), dur(".55s", "dur-wipe"), dur(".7s", "dur-run"),
  // The data hooks the CSS reads move under the prefix with the markup
  [/\[data-echo\]/g, "[data-tk-echo]"],
  [/\[data-ink=/g, "[data-tk-ink="],
];

/* ── 3. Component CSS: the page's one <style>, minus the motion layer ── */
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
// Page-only parts: the document shell and main > * (each section's paper ground and clip, which
// the components carry themselves below)
const DROP = /^(html|main ?> ?\*)$/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".tk" : null;
  if (sel === "*") return ":where(.tk, .tk *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.tk, .tk *)${sel.slice(1)}`;
  if (sel === "body") return ".tk";
  return sel;
}
function keep(css, inMedia = false) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    // @property --m registers the hero module as a length; the system computes it in place
    if (prelude.startsWith("@property")) return "";
    if (prelude.startsWith("@media")) {
      const inner = keep(body, true);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude)
      .filter((s) => !s.startsWith(".motion") && !DROP.test(s))
      .map((s) => scopeSelector(s, inMedia))
      .filter(Boolean);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
// The page shows the menu with .menu-open on the header; the system keeps that class name
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// Motion-only hooks go; the section anchors become "#"; every other id moves under tk-
const ANCHORS = "hero|about|courses|manifesto|work|process|tutors|numbers|voices|fees|faq|contact";
const HOOKS = "section|kind|head|fixed|turn|reveal|reveal-corner|split|grow|from|roll|print|turn-in|stack|rise";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!tk-)([^"]+)"/g, ' id="tk-$1"')
  .replace(/ aria-controls="(?!tk-)([^"]+)"/g, ' aria-controls="tk-$1"')
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m))
  .replace(/^  /gm, "");
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<header class="site-head"');
const HERO = el('<section id="hero"');
const ABOUT = el('<section id="about"');
const COURSES = el('<section id="courses"');
const MANIFESTO = el('<section id="manifesto"');
const WORK = el('<section id="work"');
const PROCESS = el('<section id="process"');
const TUTORS = el('<section id="tutors"');
const NUMBERS = el('<section id="numbers"');
const VOICES = el('<section id="voices"');
const FEES = el('<section id="fees"');
const FAQ = el('<section id="faq"');
const CONTACT = el('<section id="contact"');
const FOOT = el('<footer class="foot"');

// The page's tiles, one of each shape and a spread of grounds, lifted from the hero, the principles and the contact cluster
const TILES = [
  piece(HERO, '<i class="t q big"').replace(' big"', '"'),
  piece(HERO, '<i class="t q" data-turn="2" style="--tb:var(--ink);--tf:var(--amber)'),
  piece(ABOUT, '<i class="t h"'),
  piece(ABOUT, '<i class="t ring"'),
  piece(FOOT, '<i class="t dot"'),
  piece(VOICES, '<i class="vo-shape t dot"').replace('vo-shape ', ""),
  piece(CONTACT, '<i class="t q" data-turn="2" style="--tb:var(--pink);--tf:var(--light)'),
  piece(VOICES, '<i class="vo-shape t ring"').replace('vo-shape ', ""),
  piece(HERO, '<i class="t q" data-turn="-2" style="--tb:var(--amber)'),
  piece(CONTACT, '<i class="t h" data-turn="2"'),
];

add("nav", "Header", "A paper bar 64px tall (56px on phones): the wordmark beside its two-tile mark (an amber quarter-round and an ink dot), five links with a 3px pill underline that runs out and back on hover, and a small ink pill. Under 1080px the links fold into an amber burger that opens a full ink sheet of giant uppercase links.",
  NAV, { js: true });

add("buttons", "Buttons & links", "Buttons are Gabarito 700 pills: ink with light text by default, amber with ink text on dark panels. On hover a pink circle grows from the bottom-left corner and the text turns ink. Links are 600 with a 3px pill underline that shrinks to the right and regrows from the left. Plus icons sit in round amber or ink buttons and turn a quarter on hover.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<a class="btn"')}${piece(NAV, '<a class="btn btn-sm head-cta"').replace(" head-cta", "")}${piece(HERO, '<a class="lnk"')}${piece(COURSES, '<span class="c-ico icon-btn"')}${piece(FAQ, '<span class="fq-ico icon-btn"')}</div>
</div>
<div class="demo-pad contact">
<div class="demo-row">${piece(CONTACT, '<a class="btn" href="mailto:')}${piece(CONTACT, '<a class="lnk" href="#faq"')}</div>
</div>`);

add("tiles", "Geometric tiles", "The system's one picture primitive: a square <i class=\"tk-t\"> filled with --tk-tb, holding a <b> shape in --tk-tf turned by --tk-r quarter turns. Five shapes: tk-q (a quarter-round), tk-h (a half disc), tk-ring (a quarter ring), tk-dot (a centred disc) and tk-bar (a pill). Tiles build marks, mosaics, clusters and corners; any ink can be ground or shape.",
  `<div class="demo-pad">
<div class="tiles">
${TILES.join("\n")}
<i class="t bar" style="--tb:var(--sky);--tf:var(--ink)"><b></b></i>
<i class="t bar" style="--tb:var(--ink);--tf:var(--amber);--r:1"><b></b></i>
</div>
</div>`);

add("type", "Type & echo", "Gabarito set heavy and uppercase for display (900 at --tk-display, line-height .9), 800 for h3s and 700 for statements; Instrument Sans for body and leads. Words marked data-tk-echo get stacked outline copies underneath them (data-tk-echo-inks colours the copies pink, amber, light, ink), and .tk-fit words size themselves to fill their container from --tk-len, the letter count.",
  `<div class="demo-pad">
${piece(COURSES, '<div class="sec-head">')}
<div class="demo-gap"></div>
${piece(ABOUT, '<h2 class="say"')}
</div>
${asDiv(MANIFESTO)}`, { js: true });

add("hero", "Tile hero", "A seven-module ink board sized to the screen: a 4x3 field of quarter-round tiles with an amber eye, an amber pill stack, a sky block holding the uppercase line (with an echo) and the intro, and ACADEMY set to fill the band beside a pink corner tile. On phones the board stacks into four columns.",
  asDiv(HERO), { js: true });

add("about", "Statement & principles", "A bold 700 statement across eleven columns, then a sky picture with one huge quarter-round corner (--tk-rq) beside principle rows between 3px ink rules, each led by a 64px tile.",
  asDiv(ABOUT), { js: true });

add("courses", "Pill accordion", "On amber, courses are full-width ink pills: a name in 800, a soft meta line and a round amber plus. Open, the pill squares its lower corners and drops a panel with the description, facts and an amber price with a booking pill.",
  asDiv(COURSES), { js: true });

add("work", "Tile mosaic", "A six-column grid of square modules (two on phones): coded artwork with paper caption chips, plain colour tiles, and big quarter-round or half-module corners cut from the blocks.",
  asDiv(WORK), { js: true });

add("process", "Rail steps", "On pink: a sticky head on the left, and on the right a rail with a four-ink disc at its top and four steps, each an ink time pill, an uppercase 900 title and a short line.",
  asDiv(PROCESS));

add("tutors", "Halftone portraits", "On ink: portraits drawn in code on amber, sky or pink grounds behind a halftone dot screen, with a rounded top-right corner, a name in 800 and a sky role.",
  asDiv(TUTORS), { js: true });

add("numbers", "Stat tiles & bars", "Three flat colour cards with a figure that fills its card (the last one cut by the big corner), then a chart of pill bars whose widths come from their % labels.",
  asDiv(NUMBERS), { js: true });

add("reviews", "Quote cards", "Colour cards with a 700 quote, a signature and a tile in the top-right corner; the big quarter-round sits on the bottom-right. On the page they stack and pin as you scroll; here they rest in a column.",
  asDiv(VOICES));

add("pricing", "Fee cards", "Light cards (the main one ink) under a colour head holding one shape: an arch, a quarter-round or a disc. A figure that fills its card, a soft period line, pink pill bullets and a pill.",
  asDiv(FEES));

add("faq", "FAQ", "On amber: a head on the left and rows between 3px ink rules on the right, each an 800 question with a round ink plus that turns into a minus when open.",
  asDiv(FAQ), { js: true });

add("contact", "Contact", "On ink: SAY HELLO filling the width with its echo, a lead and a two-column list of sky labels over details, an amber pill and a link, and a 3x2 tile cluster.",
  asDiv(CONTACT), { js: true });

add("footer", "Footer & ink bar", "A paper footer on twelve columns (the wordmark, an address, two link lists, a soft copyright line), standing on a bar of the four inks.",
  FOOT);

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// (Also the first rule of the block, so it never opens on an @media the board's parsers could misread)
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
// The sections' paper ground and clip came from main > *; the header and hero lose the page's fixed and sticky
// positions (the header no longer overlaps, so the hero drops its header allowance)
const EXTRA = `
.hero, .about, .courses, .manifesto, .work, .process, .tutors, .numbers, .voices, .fees, .faq, .contact { position: relative; overflow-x: clip; }
.hero, .about, .work, .numbers, .fees { background: var(--paper); }
.site-head { position: relative; }
.hero { position: relative; top: auto; padding-top: var(--gut); }
.demo-pad { padding: clamp(28px, 4vw, 56px) var(--side); }
.demo-pad.contact { padding-block: clamp(28px, 4vw, 56px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 26px; }
.demo-gap { height: 22px; }
.tiles { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); max-width: 720px; }
.tiles .t { aspect-ratio: 1; }
@media (max-width: 599px) {
.tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "tk" && !m[1].startsWith("tk-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("tk-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["is-open", "menu-open", "echo-copy"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["pillrun", "rise"];
const ATTRS = ["echo", "echo-inks", "bars", "art", "label-open", "label-close"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "tk", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .tk itself, or :where(.tk) in front
const ROOTED = /(^|[\s,(>+~])\.tk(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.tk) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + renameVars(EXTRA)))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Component script ─────────────────────────────────────────────── */
// The page's coded artwork, whole: its helpers write SVG with one-letter ink classes (i, a, s, p, l, g)
// and ids for filters, clips and patterns; both move under tk- so they meet the system CSS and never a host's
const ART_START = page.indexOf("let seed=7;");
const ART_END = page.indexOf("document.querySelectorAll('svg[data-art]')", ART_START);
if (ART_START < 0 || ART_END < 0) throw new Error("artwork not found");
let ART = page.slice(ART_START, ART_END).trimEnd();
const swapJs = (from, to) => {
  if (!ART.includes(from)) throw new Error("artwork marker not found: " + from);
  ART = ART.split(from).join(to);
};
swapJs("const at=o=>Object.entries(o).map(([k,v])=>`${k}=\"${v}\"`).join(' ');",
  "const at=o=>Object.entries(o).map(([k,v])=>`${k}=\"${k==='class'?pc(v):v}\"`).join(' ');");
swapJs('<text class="i tx"', '<text class="tk-i tk-tx"');
ART = ART.replace(/ id="/g, ' id="tk-').replace(/url\(#/g, "url(#tk-");

const JS = `(function () {
  'use strict';
  /* Tokenhaus components, no libraries. The page's coded artwork paints every
     svg[data-tk-art] (fan, wall, poster, paper, curves, typecase, roller and the
     four halftone portraits); words with data-tk-echo get their outline copies;
     the course and FAQ rows open and close; bar widths come from their % labels;
     the header burger opens the menu sheet. Nothing here moves on its own, so
     prefers-reduced-motion needs no special case beyond the CSS. */
  const pc = (v) => String(v).split(' ').filter(Boolean).map((c) => 'tk-' + c).join(' ');
  const arts = (function () {
${ART.replace(/^/gm, "    ")}
    return arts;
  })();
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), function (el) { if (el._tk) return; el._tk = true; fn(el); }); }

  function init(scope) {
    each(scope, 'svg[data-tk-art]', function (el) {
      var f = arts[el.getAttribute('data-tk-art')];
      if (f) try { el.innerHTML = f(); } catch (e) { console.error(e); }
    });
    /* Echo: n stacked copies under the word, each a step further down; the outline is a text-shadow in --tk-eb */
    each(scope, '[data-tk-echo]', function (el) {
      // A copied component may already hold copies: start from the word alone
      [].forEach.call(el.querySelectorAll('.tk-echo-copy'), function (c) { c.remove(); });
      var n = Math.max(0, parseInt(el.getAttribute('data-tk-echo'), 10) || 0), text = el.textContent;
      el.style.setProperty('--tk-n', n);
      for (var i = 1; i <= n; i++) {
        var c = document.createElement('span');
        c.className = 'tk-echo-copy';
        c.setAttribute('aria-hidden', 'true');
        c.textContent = text;
        c.style.zIndex = -i;
        c.style.transform = 'translateY(calc(' + i + ' * var(--tk-eg, .34em)))';
        if (el.hasAttribute('data-tk-echo-inks')) c.setAttribute('data-tk-ink', i);
        el.append(c);
      }
    });
    /* Bars: a % label sets the width directly, any other figure is scaled to the largest */
    each(scope, '[data-tk-bars]', function (list) {
      var bars = [].map.call(list.querySelectorAll('.tk-bar'), function (b) { return { b: b, t: (b.querySelector('.tk-bar-val') || {}).textContent || '' }; });
      var max = Math.max.apply(null, [1].concat(bars.map(function (x) { return parseFloat(x.t.replace(/[^\\d.]/g, '')) || 0; })));
      bars.forEach(function (x) {
        var v = parseFloat(x.t.replace(/[^\\d.]/g, '')), f = x.b.querySelector('.tk-bar-fill');
        if (f && !isNaN(v)) f.style.setProperty('--tk-v', Math.min(100, x.t.indexOf('%') >= 0 ? v : v / max * 100));
      });
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

  /* Header: the burger shows the menu sheet and swaps its label */
  function setMenu(head, open) {
    var btn = head.querySelector('.tk-menu-btn'), menu = head.querySelector('.tk-menu');
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    head.classList.toggle('tk-menu-open', open);
    var label = btn.getAttribute(open ? 'data-tk-label-close' : 'data-tk-label-open');
    if (label) btn.setAttribute('aria-label', label);
  }
  /* Accordion rows: the button's aria-expanded, the panel's hidden and .tk-is-open on the item move together */
  function toggleRow(item, row, body) {
    var open = row.getAttribute('aria-expanded') !== 'true';
    row.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
    item.classList.toggle('tk-is-open', open);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.tk')) return;
    var menuBtn = t.closest('.tk-menu-btn');
    if (menuBtn) {
      var head = menuBtn.closest('.tk-site-head');
      if (head) setMenu(head, menuBtn.getAttribute('aria-expanded') !== 'true');
      return;
    }
    var inMenu = t.closest('.tk-menu a');
    if (inMenu) setMenu(inMenu.closest('.tk-site-head'), false);
    var row = t.closest('.tk-c-row, .tk-fq-q');
    if (row) {
      var item = row.closest('.tk-c-item, .tk-fq-item');
      var body = item && item.querySelector('.tk-c-body, .tk-fq-a');
      if (body) toggleRow(item, row, body);
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') [].forEach.call(document.querySelectorAll('.tk-site-head.tk-menu-open'), function (h) { setMenu(h, false); });
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(piece(NAV, '<a class="brand"')));
const heroTiles = prefixMarkup(unhook([
  piece(HERO, '<i class="t q big"').replace(' big"', '"'),
  piece(HERO, '<i class="t q" data-turn="2" style="--tb:var(--ink);--tf:var(--amber)'),
  piece(HERO, '<i class="t q" data-turn="-2" style="--tb:var(--ink);--tf:var(--pink)'),
  piece(ABOUT, '<i class="t h"'),
  piece(HERO, '<i class="t q" data-turn="-2" style="--tb:var(--amber)'),
  piece(ABOUT, '<i class="t ring"'),
  piece(CONTACT, '<i class="t q" data-turn="1" style="--tb:var(--sky);--tf:var(--light);--r:3'),
  piece(FOOT, '<i class="t dot"').replace("var(--paper)", "var(--light)"),
  piece(HERO, '<i class="t q" data-turn="-1" style="--tb:var(--pink);--tf:var(--ink);--r:1'),
].join("\n")));
const inks = prefixMarkup(unhook(piece(FOOT, '<div class="inks"')));
const CHROME = `
body{margin:0;background:var(--tk-paper)}
.sp-top{color:var(--tk-ink);background:var(--tk-paper)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding:16px var(--tk-side);border-bottom:var(--tk-rule) solid var(--tk-ink)}
.sp-meta>span{font:600 13px/1.3 var(--tk-font-text);letter-spacing:.04em}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:clamp(24px,4vw,64px);align-items:end;padding:clamp(32px,5vw,72px) var(--tk-side) clamp(32px,4vw,56px)}
.sp-hero h1{margin:0;font:900 clamp(52px,8.4vw,132px)/.86 var(--tk-font-display);letter-spacing:-.015em;text-transform:uppercase}
.sp-hero p{margin:clamp(20px,2.4vw,32px) 0 0;max-width:46ch;font:400 var(--tk-lead)/1.5 var(--tk-font-text);color:var(--tk-soft-on-paper)}
.sp-tiles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));aspect-ratio:1;max-width:460px;width:100%;justify-self:end}
.sp-tiles .tk-t{aspect-ratio:1}
.sp-main{padding:0 var(--tk-side) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font:900 clamp(30px,3vw,46px)/.95 var(--tk-font-display);text-transform:uppercase;color:var(--tk-ink)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font:800 13px/1 var(--tk-font-display);letter-spacing:.06em;text-transform:uppercase;color:var(--tk-ink)}
.sp-label::before{content:"";width:12px;height:12px;border-radius:0 100% 0 0;background:var(--tk-amber)}
.sp-note{margin:0;max-width:680px;font:400 15px/1.55 var(--tk-font-text);color:var(--tk-soft-on-paper)}
.sp-demo{position:relative;overflow:clip;background:var(--tk-paper);box-shadow:0 0 0 var(--tk-rule) var(--tk-ink)}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-tiles{justify-self:start;max-width:340px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${brand}<span>Design system · tokenhaus@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div>
<h1>Four inks, one grid.</h1>
<p>A Bauhaus-bright academy language: ink, amber, sky and pink on cool paper, Gabarito set heavy and uppercase, and one picture primitive, a square tile holding a quarter-round, half disc, ring, dot or pill that builds marks, mosaics and corners. Pills grow a pink circle on hover, outlined words carry stacked echoes, and every picture is drawn in code. Extracted from the tokenhaus AI Design System Academy page.</p>
</div>
<div class="sp-tiles" aria-hidden="true">
${heroTiles}
</div>
</div>
${inks}
</header>`;
const specimen = renderSpecimen({
  name: "Tokenhaus",
  slug: "tokenhaus",
  version: VERSION,
  prefix: "tk",
  rootClass: "tk",
  labelClass: "sp-label",
  script: "scripts/systems/tokenhaus.mjs",
  source: SOURCE,
  metaDescription: "The Tokenhaus design system: tokens and working components extracted from the tokenhaus AI Design System Academy page.",
  defsNote: "not used: pictures are CSS tiles or SVG painted into svg[data-tk-art] by the component script",
  jsNote: "the coded artwork, echo copies, the course and FAQ accordions, bar widths and the header menu",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: "",
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "tokenhaus", prefix: "tk", rootClass: "tk", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-sm", "lnk", "icon-btn", "t", "q", "h", "ring", "dot", "bar", "art", "h2", "h3", "lead", "fit", "fill", "wrap", "sec-head", "c-row", "fq-q", "nu-card", "fe-card", "vo-card", "brand", "mark"] });
