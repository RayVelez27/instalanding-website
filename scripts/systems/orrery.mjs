// Extracts the Orrery design system from its landing page.
//
//   node scripts/systems/orrery.mjs
//
// Reads public/demos/orrery-engine.html (never edits it) and writes
// public/systems/orrery/ (specimen.html, tokens.css, orrery.css) through the
// shared pipeline in lib.mjs. The page scrolls with GSAP and Lenis; the system
// does not: every component renders in its finished state, and the procedural
// canvas art, the menu, the billing switch, the FAQ, the source bars and the
// forms run on one small self-contained script with data-or-* hooks.
import { readPage, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/orrery-engine.html";
const { page, el } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Hubot+Sans:wdth,wght@100..125,500..700&family=Instrument+Sans:wght@400..700&display=swap" rel="stylesheet">';
// The page keeps its whole stylesheet on one line
const pageCssRaw = (() => { const a = page.indexOf("<style>:root") + 7; return page.slice(a, page.indexOf("</style>", a)); })();
const rootVal = (n) => new RegExp(`--${n}:([^;]+);`).exec(pageCssRaw)[1].trim();

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Orrery · orrery@${VERSION}
   Extracted from https://instalanding.ai/demos/orrery-engine.html
   Fonts (Google Fonts): Hubot Sans (wdth 100-125, wght 500-700), Instrument Sans 400-700 */
:root {
  /* Color · core */
  --or-ink: #111110;
  --or-night: #191816;
  --or-smoke: #2A2926;
  --or-ash: #55574F;
  --or-haze: #A6A9A3;
  --or-fog: #C8CAC4;
  --or-mist: #E7E6E1;
  --or-pearl: #F5F4F0;
  --or-ember: #D6B28A;
  --or-steel: #7D8C8B;

  /* Color · art */
  --or-space: #0B0A09;
  --or-umber: #6B5640;
  --or-plate: #E9DCCB;

  /* Type · families */
  --or-f-display: "Hubot Sans", system-ui, sans-serif;
  --or-f-text: "Instrument Sans", system-ui, sans-serif;

  /* Type · scale */
  --or-figure: clamp(64px, 8.4vw, 136px);
  --or-price: clamp(48px, 5.2vw, 80px);
  --or-display: clamp(30px, 4.4vw, 68px);
  --or-quote: clamp(25px, 3.5vw, 56px);
  --or-statement: clamp(27px, 3.45vw, 54px);
  --or-title: clamp(24px, 3vw, 46px);
  --or-lede: clamp(17px, 1.3vw, 20px);
  --or-body: 17px;
  --or-caps: clamp(14px, 1.2vw, 17px);
  --or-small: 14px;
  --or-label: 13px;

  /* Shape · radii */
  --or-r-lg: 24px;
  --or-r: 14px;
  --or-r-btn: 12px;
  --or-r-bar: 6px;

  /* Shape · borders */
  --or-border: 1px;
  --or-border-bracket: 2px;
  --or-bk: 22px;

  /* Depth · texture and shadow */
  --or-grain: ${rootVal("grain")};
  --or-frost: ${rootVal("frost")};
  --or-shadow-card: 0 30px 70px -40px rgba(17,17,16,.5);
  --or-shadow-form: 0 40px 80px -40px rgba(17,17,16,.7);

  /* Motion · easing */
  --or-ease: cubic-bezier(.19,1,.22,1);
  --or-ease-io: cubic-bezier(.77,0,.18,1);

  /* Motion · durations */
  --or-dur-fast: .35s;
  --or-dur: .5s;
  --or-dur-fill: .6s;
  --or-dur-open: 1.1s;

  /* Space · layout */
  --or-pad: clamp(16px, 4.2vw, 64px);
  --or-max: 1400px;
  --or-sec: clamp(96px, 12vw, 190px);
  --or-head-h: 76px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// Every custom property on the page moves under --or- (tokens, tone values and local knobs)
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("or-") ? m : `--or-${n}`));
const end = "(?=\\s*[;}])";
const esc = (s) => s.replace(/[().,]/g, "\\$&");
const fs = (v, tok) => [new RegExp(`font-size:\\s*${esc(v)}${end}`, "g"), `font-size:var(--or-${tok})`];
const SWAPS = [
  fs("clamp(30px, 4.4vw, 68px)", "display"), fs("clamp(27px, 3.45vw, 54px)", "statement"), fs("clamp(24px, 3vw, 46px)", "title"),
  fs("clamp(25px, 3.5vw, 56px)", "quote"), fs("clamp(17px, 1.3vw, 20px)", "lede"), fs("clamp(14px, 1.2vw, 17px)", "caps"),
  fs("17px", "body"), fs("14px", "small"), fs("13px", "label"),
  [/clamp\(64px, 8\.4vw, 136px\)/g, "var(--or-figure)"], [/clamp\(48px, 5\.2vw, 80px\)/g, "var(--or-price)"],
  [/border-radius:12px(?=[;}])/g, "border-radius:var(--or-r-btn)"], [/border-radius:6px(?=[;}])/g, "border-radius:var(--or-r-bar)"],
  [/box-shadow:0 30px 70px -40px color-mix\(in oklab, var\(--or-ink\) 50%, transparent\)/g, "box-shadow:var(--or-shadow-card)"],
  [/box-shadow:0 40px 80px -40px color-mix\(in oklab, var\(--or-ink\) 70%, transparent\)/g, "box-shadow:var(--or-shadow-form)"],
  [/#6b5640/gi, "var(--or-umber)"], [/#e9dccb/gi, "var(--or-plate)"],
  [/ \.35s(?=[\s;,)}])/g, " var(--or-dur-fast)"], [/ \.5s(?=[\s;,)}])/g, " var(--or-dur)"], [/ \.6s(?=[\s;,)}])/g, " var(--or-dur-fill)"], [/ 1\.1s(?=[\s;,)}])/g, " var(--or-dur-open)"],
];

/* ── 3. Component CSS: the page's <style>, minus what only the page needs ── */
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
// Page-only parts: the document shell, the GSAP start states, the scroll-driven hero and gallery track
const DROP = /^html|^main>|\.motion|\.files-rail\.is-live|\.field\.is-track|\.is-track|^\.site-head\.is-hidden/;
function scopeSelector(sel) {
  if (sel === ":root") return ".or";
  if (sel === "*" ) return ":where(.or, .or *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.or, .or *)${sel.slice(1)}`;
  if (sel === "body") return ".or";
  if (sel === ":focus-visible") return ":where(.or) :focus-visible";
  if (sel === "::selection") return ":where(.or) ::selection";
  // The menu state sits on the header itself, not on <html>
  if (sel.startsWith(".menu-open .site-head")) return sel.replace(".menu-open .site-head", ".site-head.menu-open");
  // Tones: on the root or on any element inside it
  const tone = /^\[data-tone=(dark|light)\]$/.exec(sel);
  if (tone) return `.or[data-or-tone=${tone[1]}], .or [data-or-tone=${tone[1]}]`;
  return sel;
}
let rootSeen = false;
function keep(css, inMedia = false) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body, true);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude === ":root" && !inMedia && !rootSeen) { rootSeen = true; return ""; } // the tokens
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
let base = renameVars(keep(pageCssRaw)).replace(/\[data-tone/g, "[data-or-tone");

const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.replace(/url\([^)]*\)/g, "").matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "or") CLASSES.add(m[1]);
}
["is-open", "is-solid", "menu-open", "shot", "file-body", "qa-list", "files-list", "rule", "tier-name", "bill", "voice-quote"].forEach((c) => CLASSES.add(c));
// Hooks in the markup that the script or CSS reads: all under data-or-
const ATTRS = ["tone", "art", "seed", "dpr", "mirror", "chart", "period", "monthly", "yearly", "label-open", "label-close", "sent"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "or", swaps: SWAPS, classes: [...CLASSES], attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(renameVars(html));

function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (s.includes(".or") ? s : `:where(.or) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
// The root carries the dark tone until a component sets its own (first, so the block opens on a plain rule)
const FIRST = `.or { --or-fg: var(--or-pearl); --or-fg2: var(--or-haze); --or-bg: var(--or-night); --or-line: color-mix(in oklab, var(--or-pearl) 15%, transparent); }`;
const EXTRA = `
/* A toned section paints its own ground (the page did this for main > section) */
.or section[data-or-tone], .or footer[data-or-tone] { position: relative; overflow-x: clip; background: var(--or-bg); }
/* Fixed and pinned on the page; components sit in the flow */
.or-site-head { position: relative; inset: auto; }
.or-site-head::before { opacity: 1; }
.or-hero { height: auto; }
.or-hero-stage { position: relative; height: min(100svh, 900px); }
/* The page sized the hero from the viewport; a component sizes it from its own width */
.or-hero { container-type: inline-size; }
.or-hero-stage { --or-sw: min(46cqi, 720px); --or-lf: clamp(15px, 2.05cqi, 31px); }
.or-hero-word { font-size: min(calc(100cqi / (var(--or-len) * var(--or-k))), 30svh, calc((var(--or-sy) - var(--or-sh) / 2 - var(--or-head-h) - 1.5svh - var(--or-lf) * 1.15 - 12px - 34px) / .8)); }
.or-hero-line { max-width: min(78cqi, 640px); }
.or-hero-cta { max-width: calc(100cqi - 2 * var(--or-pad)); }
@media (max-width:760px) { .or-hero-stage { --or-sw: 74cqi; } }
/* The menu panel stays inside the header's own box when it opens in a component */
@media (max-width:1080px) { .or-site-head.or-menu-open { height: auto; min-height: var(--or-head-h); flex-wrap: wrap; padding-block: 10px; } .or-site-head.or-menu-open .or-nav { order: 3; position: static; visibility: visible; opacity: 1; width: 100%; padding: 12px 0 28px; z-index: auto; background: none; } }`;
// (comments come out first: a comment before @media would hide the at-rule from the rule splitter)
const componentCss = rootEvery(FIRST + "\n" + prefixCss(tokenize(base)) + "\n" + EXTRA.replace(/\/\*[\s\S]*?\*\//g, "")).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Markup helpers ───────────────────────────────────────────────── */
const unhook = (html) => html
  .replace(/ data-(reveal|draw|defog|slot|parallax)(="[^"]*")?(?=[\s>])/g, "")
  .replace(/ data-(kind|section)="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/ for="news-email"/g, "")
  .replace(/ data-mirror="hero-fog"/g, " data-mirror")
  .replace(/href="#[a-z-]+"/g, 'href="#"');
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });
const toSection = (html) => html; // sections stay <section>: their tone paints the ground
const panel = (tone, inner, pad = "28px") => `<div data-tone="${tone}" style="padding: ${pad}; border-radius: var(--r-lg); background: var(--bg)">\n${inner}\n</div>`;

const head = el('<header class="site-head"');
add("nav", "Navigation", "The tracked ORRERY wordmark with its orbit glyph, quiet links and the ember-filling Request access button. Under 1080px the links fold behind a two-line menu button that crosses into an X.",
  panel("dark", head, "0"), { js: true });

const btnSolid = /<a class="btn" href="#tip">Request access<\/a>/.exec(head)[0];
const support = el('<section id="support"');
const btnGhost = /<a class="btn btn--ghost" href="#tip">Start free<\/a>/.exec(support)[0];
const brief = el('<section id="brief"');
const link = /<a class="link" href="#method">[\s\S]*?<\/a>/.exec(brief)[0];
const faq = el('<section id="faq"');
const iconBtn = /<span class="icon-btn qa-icon" aria-hidden="true"><i><\/i><\/span>/.exec(faq)[0];
add("buttons", "Buttons & links", "The solid button fills with ember from the middle out on hover; the ghost button is a hairline that fills with the ink; the link's 1px underline is swept by a 2px rule; the icon button grows two corner brackets on hover. All of them take their colours from the tone around them.",
  `${panel("dark", `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">${btnSolid}${btnGhost}${link}${iconBtn}</div>`)}
<div style="height: 16px"></div>
${panel("light", `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 22px">${btnSolid}${btnGhost}${link}${iconBtn}</div>`)}`);

const files = el('<section id="files"');
add("type", "Headline pairing", "Hubot Sans set wide (font-stretch 112%) and uppercase for heads, an Instrument Sans lede in the second foreground colour beside it, and an underline link under the lede.",
  panel("dark", /<div class="files-head">[\s\S]*?<\/a>\s*<\/div>/.exec(files)[0], "48px 28px"));

const hero = el('<section id="hero"');
add("hero", "Hero window", "A blurred, grain-covered mirror of the orrery fills the stage; a sharp window onto the same canvas sits in the middle with a glass rim and two corner brackets, between the huge words THINK and SLOW. The art is drawn in code and follows the pointer.",
  hero, { js: true });

add("capabilities", "Capability rows", "Ruled rows with a version in ember, a topic, a wide uppercase title, a line of text and a live rendering of the capability: a search tree, a memory sphere, agents asking first, a chart being read, sealed racks.",
  toSection(files), { js: true });

add("method", "Method steps", "Five stages that rise in a staircase, each with a rule and tick, a duration in wide type, a caps title and a line of text.",
  toSection(el('<section id="method"')), { js: true });

add("gallery", "Live renderings", "A grid of live canvases with a caps caption and an ember status dot: attention, retrieval graph, token stream, latent terrain, verifier rings, memory lattice.",
  toSection(el('<section id="field"')), { js: true });

add("outcomes", "Outcomes & sources", "Huge wide figures over drawn rules, sized from their character count, then where an answer comes from as grained bars filled to their value.",
  toSection(el('<section id="impact"')), { js: true });

add("team", "Team portraits", "Scan-line portraits drawn in code with a sweeping ember band, a caps name, an ember role and a note.",
  toSection(el('<section id="people"')), { js: true });

add("voices", "Voice cards", "Pearl quote cards with corner brackets painted into the background, a large Hubot quote and a caps byline.",
  toSection(el('<section id="voices"')), { js: true });

add("pricing", "Pricing tiers", "A Monthly / Yearly switch over three tiers on frosted glass; the key tier is a pale card with ember corner brackets. Prices size from their character count and swap with the switch.",
  toSection(support), { js: true });

add("faq", "FAQ", "A sticky side column and ruled questions; the plus turns into a minus and the answer opens on grid rows.",
  toSection(faq), { js: true });

add("contact", "Contact", "A dimmed live graph behind contact channels and a light form card with ember brackets; fields underline in ink on focus and the status line answers on submit.",
  toSection(el('<section id="tip"')), { js: true });

add("footer", "Footer", "A newsletter, three link columns, a legal line, and the wordmark huge over an ember glow and grain.",
  el('<footer class="site-foot"').replace('<input id="news-email" type="email"', '<input aria-label="Email address" type="email"'), { js: true });

/* ── 5. Component script ─────────────────────────────────────────────── */
// The renderers are the page's own code, sliced verbatim from its art engine
const A0 = page.indexOf("const PEARL='245,244,240'"), A1 = page.indexOf("const reduce=matchMedia('(prefers-reduced-motion: reduce)')");
if (A0 < 0 || A1 < 0) throw new Error("art engine not found");
const RENDERERS = page.slice(A0, A1).trim();

const JS = `(function () {
  'use strict';
  /* Orrery components, no libraries. Part 1 is the page's procedural art engine:
     every <canvas data-or-art="name" data-or-seed="n"> is drawn in code, sized to its
     box, and animated only while on screen. Part 2 runs the menu, billing switch,
     FAQ, source bars and forms. Markup added later is picked up automatically. */
${RENDERERS.split("\n").map((l) => "  " + l).join("\n")}

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T = 7.3, items = [];
  function paint(it) {
    if (!it.draw) return;
    it.ctx.save();
    try { it.draw(it.ctx, T); } catch (e) { console.error(e); }
    it.ctx.restore();
    if (it.mirror) {
      var m = it.mirror, mw = Math.max(1, Math.round(it.w / 4)), mh = Math.max(1, Math.round(it.h / 4));
      if (m.width !== mw || m.height !== mh) { m.width = mw; m.height = mh; }
      m.getContext('2d').drawImage(it.cv, 0, 0, mw, mh);
    }
  }
  function size(it) {
    var p = it.cv.parentElement, w = p.clientWidth, h = p.clientHeight;
    if (!w || !h || (w === it.w && h === it.h)) return;
    var d = Math.min(window.devicePixelRatio || 1, it.max);
    it.cv.width = Math.round(w * d); it.cv.height = Math.round(h * d);
    it.ctx.setTransform(d, 0, 0, d, 0, 0); it.w = w; it.h = h;
    it.draw = F[it.type](w, h, rng(it.seed * 7919 + 13));
    paint(it);
  }
  var ro = window.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { items.forEach(function (it) { if (it.cv.parentElement === e.target) size(it); }); }); }) : null;
  var io = window.IntersectionObserver ? new IntersectionObserver(function (es) { es.forEach(function (e) { items.forEach(function (it) { if (it.cv === e.target) it.vis = e.isIntersecting; }); }); }, { rootMargin: '160px' }) : null;
  function art(scope) {
    scope.querySelectorAll('canvas[data-or-art]').forEach(function (cv) {
      if (cv._orArt) return;
      var type = cv.getAttribute('data-or-art');
      if (!F[type]) return;
      cv._orArt = true;
      var stage = cv.closest('.or-hero-stage');
      var it = { cv: cv, ctx: cv.getContext('2d'), type: type, seed: +cv.getAttribute('data-or-seed') || 1, max: +cv.getAttribute('data-or-dpr') || 2, w: 0, h: 0, vis: !io, draw: null,
        mirror: cv.hasAttribute('data-or-mirror') && stage ? stage.querySelector('.or-hero-fog canvas') : null };
      items.push(it);
      size(it);
      if (ro) ro.observe(cv.parentElement);
      if (io) io.observe(cv);
    });
  }
  if (!reduce) {
    var last = performance.now();
    var loop = function (now) {
      T += Math.min(0.05, (now - last) / 1000); last = now;
      for (var k = items.length - 1; k >= 0; k--) {
        var it = items[k];
        if (!it.cv.isConnected) { if (io) io.unobserve(it.cv); items.splice(k, 1); continue; }
        if (it.vis) paint(it);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* Part 2: behaviour */
  function bars(scope) {
    scope.querySelectorAll('[data-or-chart]').forEach(function (chart) {
      if (chart._orChart) return;
      chart._orChart = true;
      var rows = [].slice.call(chart.querySelectorAll('.or-bar'));
      var vals = rows.map(function (b) { var t = (b.querySelector('.or-bar-value') || {}).textContent || ''; return { t: t, n: parseFloat(t.replace(/[^\\d.,-]/g, '').replace(',', '.')) || 0 }; });
      var pct = vals.every(function (v) { return v.t.indexOf('%') >= 0; }), max = pct ? 100 : Math.max.apply(null, [1].concat(vals.map(function (v) { return v.n; })));
      rows.forEach(function (b, i) { var f = b.querySelector('.or-bar-fill'); if (f) f.style.setProperty('--or-v', Math.max(0, Math.min(1, vals[i].n / max))); });
    });
  }
  function index(scope) {
    scope.querySelectorAll('.or-steps, .or-voice-stack').forEach(function (list) {
      [].slice.call(list.children).forEach(function (li, i) { li.style.setProperty('--or-i', i); });
    });
  }
  function init(scope) { art(scope); bars(scope); index(scope); }
  init(document);
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; init(document); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  function setMenu(head, open) {
    head.classList.toggle('or-menu-open', open);
    var btn = head.querySelector('.or-menu-btn');
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    var l = btn.getAttribute(open ? 'data-or-label-close' : 'data-or-label-open');
    if (l) btn.setAttribute('aria-label', l);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.or')) return;
    var mb = t.closest('.or-menu-btn');
    if (mb) { var head = mb.closest('.or-site-head'); if (head) setMenu(head, !head.classList.contains('or-menu-open')); return; }
    var q = t.closest('.or-qa-q button');
    if (q) {
      var qa = q.closest('.or-qa'), list = qa.parentElement, open = !qa.classList.contains('or-is-open');
      [].slice.call(list.querySelectorAll('.or-qa')).forEach(function (o) { o.classList.remove('or-is-open'); var b = o.querySelector('.or-qa-q button'); if (b) b.setAttribute('aria-expanded', 'false'); });
      qa.classList.toggle('or-is-open', open); q.setAttribute('aria-expanded', String(open));
      return;
    }
    var opt = t.closest('.or-bill-opt');
    if (opt) {
      var sec = opt.closest('.or-support') || opt.closest('.or'), period = opt.getAttribute('data-or-period');
      [].slice.call(sec.querySelectorAll('.or-bill-opt')).forEach(function (o) { o.setAttribute('aria-pressed', String(o === opt)); });
      [].slice.call(sec.querySelectorAll('[data-or-' + period + ']')).forEach(function (el) {
        var v = el.getAttribute('data-or-' + period);
        el.textContent = v;
        if (el.classList.contains('or-price')) el.style.setProperty('--or-len', v.length);
      });
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) { e.preventDefault(); var h = a.closest('.or-site-head'); if (h) setMenu(h, false); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    [].slice.call(document.querySelectorAll('.or-site-head.or-menu-open')).forEach(function (h) { setMenu(h, false); });
  });
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.closest || !form.closest('.or') || !form.hasAttribute('data-or-sent')) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var status = form.querySelector('.or-form-status');
    if (status) status.textContent = form.getAttribute('data-or-sent');
    form.reset();
  });
})();`;

/* ── 6. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--or-ink)}
.sp-top{position:relative;overflow:hidden;padding:28px var(--or-pad) 72px;isolation:isolate;background:var(--or-ink)}
.sp-top::after{content:"";position:absolute;inset:0;z-index:-1;background:var(--or-grain);background-size:190px;mix-blend-mode:overlay;opacity:.14;pointer-events:none}
.sp-glow{position:absolute;inset:-20% -10% auto;height:120%;z-index:-2;background:radial-gradient(40% 50% at 72% 30%,color-mix(in oklab,var(--or-ember) 26%,transparent),transparent 70%),radial-gradient(40% 50% at 20% 70%,color-mix(in oklab,var(--or-steel) 22%,transparent),transparent 70%)}
.sp-top-in{max-width:var(--or-max);margin:0 auto}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:14px;padding-bottom:20px;border-bottom:1px solid var(--or-line)}
.sp-meta span{color:var(--or-fg2)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:40px;align-items:end;margin-top:72px}
.sp-hero h1{font-family:var(--or-f-display);font-weight:600;font-stretch:125%;text-transform:uppercase;font-size:clamp(44px,7vw,112px);line-height:.86;letter-spacing:-.01em}
.sp-hero h1 em{font-style:normal;color:var(--or-ember)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-top:26px}
.sp-swatches i{display:block;aspect-ratio:1;border-radius:var(--or-r);box-shadow:inset 0 0 0 1px var(--or-line)}
.sp-main{max-width:var(--or-max);margin:0 auto;padding:16px var(--or-pad) 120px}
.sp-sec{padding:56px 0;border-bottom:1px solid var(--or-line);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:8px 40px;margin-bottom:28px}
.sp-head h2{margin:10px 0 0;font-family:var(--or-f-display);font-weight:600;font-stretch:112%;text-transform:uppercase;font-size:28px;line-height:1}
.sp-label{margin:0;font-family:var(--or-f-display);font-weight:700;text-transform:uppercase;letter-spacing:.3em;font-size:12px;color:var(--or-ember)}
.sp-note{margin:0;max-width:640px;font-size:16px;line-height:1.6;color:var(--or-fg2)}
.sp-demo{position:relative;border-radius:var(--or-r-lg);overflow:hidden}
@media (max-width:900px){.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:720px){.sp-top{padding:18px 16px 48px}.sp-main{padding:8px 16px 80px}}
`;
const brand = /<a class="brand" href="#hero">[\s\S]*?<\/a>/.exec(head)[0].replace('href="#hero"', 'href="#"');
const HERO = `
<header class="sp-top">
<div class="sp-glow" aria-hidden="true"></div>
<div class="sp-top-in">
<div class="sp-meta">${prefixMarkup(brand)}<span class="or-spaced">Design system · orrery@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div>
<p class="or-spaced" style="color: var(--or-ember)">Cinematic AI lab</p>
<h1>Think <em>slow</em>.<br>Show the work.</h1>
</div>
<div>
<p class="or-lede">Warm greys, one ember accent, Hubot Sans set wide, corner brackets that frame whatever matters, and pictures drawn in code: an orrery, search trees, memory spheres, live renderings. Extracted from the Orrery Reasoning Engine page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--or-ink" style="background:var(--or-ink)"></i><i title="--or-smoke" style="background:var(--or-smoke)"></i><i title="--or-haze" style="background:var(--or-haze)"></i><i title="--or-pearl" style="background:var(--or-pearl)"></i><i title="--or-ember" style="background:var(--or-ember)"></i>
</div>
</div>
</div>
</div>
</header>`;
const DEFS = '<svg id="or-defs" aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden"></svg>';
const specimen = renderSpecimen({
  name: "Orrery",
  slug: "orrery",
  version: VERSION,
  prefix: "or",
  rootClass: "or",
  labelClass: "sp-label",
  script: "scripts/systems/orrery.mjs",
  source: SOURCE,
  metaDescription: "The Orrery design system: tokens and working components extracted from the Orrery Reasoning Engine page.",
  defsNote: "empty: every picture is a canvas drawn by the component script",
  jsNote: "the procedural canvas art engine, then the menu, billing switch, FAQ, source bars and forms (no GSAP)",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 7. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "orrery", prefix: "or", rootClass: "or", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "link", "hero", "files", "tier", "qa", "voice", "person", "shot", "slot", "h2", "lede", "caps"] });
