// Extracts the Siliq design system from its landing page.
//
//   node scripts/systems/siliq.mjs
//
// Reads public/demos/siliq-lab.html (never edits it) and writes
// public/systems/siliq/ (specimen.html, tokens.css, siliq.css) through the
// shared pipeline in lib.mjs. The page animates with GSAP and Lenis; the system
// does not: every component renders complete, and the menu, the pricing switch,
// the review marquee and the form run on a small self-contained script with
// data-sq-* hooks. The illustrations are the page's own SVG sprite, kept in
// <svg id="sq-defs"> with every id under sq- (two of the four portraits, to
// keep the file small).
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/siliq-lab.html";
const { page, el, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Siliq · siliq@${VERSION}
   Extracted from https://instalanding.ai/demos/siliq-lab.html
   Fonts (Google Fonts): Climate Crisis (display), Google Sans 400-700 (text), Playpen Sans 600-800 (hand) */
:root {
  /* Color · core */
  --sq-ground: #E4E8E3;
  --sq-paper: #FFFFFF;
  --sq-sky: #7CC4EA;
  --sq-honey: #FFBF3C;
  --sq-tangerine: #F47A3C;
  --sq-leaf: #0A5C46;
  --sq-ink: #0A1317;

  /* Type · ink */
  --sq-ink-soft: color-mix(in oklab, var(--sq-ink) 70%, var(--sq-paper));

  /* Type · families */
  --sq-font-display: "Climate Crisis", "Arial Black", sans-serif;
  --sq-font-text: "Google Sans", "Segoe UI", system-ui, sans-serif;
  --sq-font-hand: "Playpen Sans", "Comic Sans MS", cursive;

  /* Type · scale */
  --sq-display-xl: clamp(34px, 5.4vw, 84px);
  --sq-statement: clamp(28px, 4.7vw, 72px);
  --sq-display-md: clamp(30px, 4.4vw, 70px);
  --sq-title: clamp(22px, 2.2vw, 32px);
  --sq-lead: clamp(17px, 1.35vw, 21px);
  --sq-body: clamp(15px, 1.12vw, 17px);
  --sq-small: 14px;
  --sq-label: 13px;
  --sq-k: 1.1;

  /* Shape · radii */
  --sq-r-tile: clamp(22px, 2.5vw, 36px);
  --sq-r-blob: 40%;
  --sq-r-pill: 999px;
  --sq-r-field: 18px;

  /* Shape · borders */
  --sq-border: 2px;

  /* Depth · float */
  --sq-shade: color-mix(in oklab, var(--sq-ink) 12%, transparent);
  --sq-shadow-float: 0 8px 28px var(--sq-shade);
  --sq-shadow-sheet: 0 20px 40px var(--sq-shade);

  /* Motion · easing */
  --sq-ease-pop: cubic-bezier(.3, 1.45, .5, 1);
  --sq-ease-open: cubic-bezier(.3, .8, .3, 1);

  /* Motion · durations */
  --sq-dur-fast: .25s;
  --sq-dur: .35s;
  --sq-dur-open: .45s;
  --sq-dur-pop: .6s;
  --sq-dur-jelly: .65s;
  --sq-dur-blink: 1.6s;
  --sq-dur-spin: 2.4s;
  --sq-dur-float: 3s;
  --sq-dur-marquee: 48s;

  /* Space · layout */
  --sq-gap: clamp(8px, 1.1vw, 14px);
  --sq-edge: clamp(12px, 1.9vw, 24px);
  --sq-pad: clamp(16px, 2.4vw, 34px);
  --sq-head-h: clamp(50px, 4.4vw, 58px);
  --sq-sec-space: clamp(72px, 10vw, 150px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// Every custom property on the page (tokens and the local knobs --t-bg, --fit-w,
// --len, --b-bg …) moves under --sq-
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("sq-") ? m : `--sq-${n}`));
const end = "(?=\\s*[;}])";
const esc = (v) => v.replace(/[().]/g, "\\$&");
const fs = (v, tok) => [new RegExp(`font-size:\\s*${esc(v)}${end}`, "g"), `font-size:var(--sq-${tok})`];
const SWAPS = [
  fs("clamp(34px, 5.4vw, 84px)", "display-xl"), fs("clamp(28px, 4.7vw, 72px)", "statement"), fs("clamp(30px, 4.4vw, 70px)", "display-md"),
  fs("clamp(22px, 2.2vw, 32px)", "title"), fs("clamp(17px, 1.35vw, 21px)", "lead"), fs("14px", "small"), fs("13px", "label"),
  [new RegExp(`border-radius:\\s*999px${end}`, "g"), "border-radius:var(--sq-r-pill)"],
  [new RegExp(`border-radius:\\s*18px${end}`, "g"), "border-radius:var(--sq-r-field)"],
  [/box-shadow:0 8px 28px var\(--sq-shade\)/g, "box-shadow:var(--sq-shadow-float)"],
  [/box-shadow:0 20px 40px var\(--sq-shade\)/g, "box-shadow:var(--sq-shadow-sheet)"],
  [/cubic-bezier\(\.3, \.8, \.3, 1\)/g, "var(--sq-ease-open)"],
  [/ \.6s var\(--sq-ease-pop\)/g, " var(--sq-dur-pop) var(--sq-ease-pop)"],
  [/ \.45s(?=[\s;,)}])/g, " var(--sq-dur-open)"],
  [/ \.35s(?=[\s;,)}])/g, " var(--sq-dur)"],
  [/ \.25s(?=[\s;,)}])/g, " var(--sq-dur-fast)"],
  [/jelly \.65s/g, "jelly var(--sq-dur-jelly)"],
  [/blink 1\.6s/g, "blink var(--sq-dur-blink)"],
  [/spin 2\.4s/g, "spin var(--sq-dur-spin)"],
  [/floaty 3s/g, "floaty var(--sq-dur-float)"],
  [/font:400 clamp\(15px, 1\.12vw, 17px\)\/1\.5/g, "font:400 var(--sq-body)/1.5"],
];

/* ── 3. Component CSS: the page's <style>, minus what only the page needs ── */
const cssAt = page.indexOf("<style>:root");
const pageCss = page.slice(cssAt + 7, page.indexOf("</style>", cssAt));
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
// Page-only parts: the document shell, the GSAP scenes (everything under .motion),
// the sticky stages and flood, section paddings
const DROP = new RegExp([
  `^html`, `^main>`, `\\.motion`, `\\.flood`, `\\.hero-stage`, `\\.gal-stage`, `\\.gal-thumbs`,
  `^\\.(menu|school|steps|team|reviews|pricing|faq|contact|gallery)$`,
].join("|"));
function scopeSelector(sel) {
  if (sel === "*") return ":where(.sq, .sq *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.sq, .sq *)${sel.slice(1)}`;
  if (sel === "body") return ".sq";
  if (sel === ":focus-visible") return ":where(.sq) :focus-visible";
  return sel.replace('[class*="tone-"]', '[class*="sq-tone-"]');
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith(":root")) return "";
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
let base = renameVars(keep(pageCss));

const CLASSES = new Set();
for (const [, sel] of base.matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "sq") CLASSES.add(m[1]);
}
["is-running", "is-open", "is-sent", "btn-label"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["dash", "jelly", "spin", "blink", "floaty", "trace"];
const ATTRS = ["weekly", "monthly", "sent", "form", "marquee", "label-open", "label-close"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "sq", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });

/* The illustration sprite: the page's own, with every id moved under sq- */
const SPRITE_AT = page.indexOf('<svg width="0" height="0"', page.search(/<body[\s>]/));
let sprite = sliceEl(page, '<svg width="0" height="0"', SPRITE_AT).html;
for (const who of ["tomas", "ravi"]) sprite = sprite.replace(sliceEl(sprite, `<symbol id="i-p-${who}"`).html, "");
const IDS = [...sprite.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const ID_SET = new Set(IDS);
const renameIds = (s) => s
  .replace(/ id="([^"]+)"/g, (m, id) => (ID_SET.has(id) ? ` id="sq-${id}"` : m))
  .replace(/url\(#([^)]+)\)/g, (m, id) => (ID_SET.has(id) ? `url(#sq-${id})` : m))
  .replace(/href="#([^"]+)"/g, (m, id) => (ID_SET.has(id) ? `href="#sq-${id}"` : m));
const prefixMarkup = (html) => renameIds(prefixRaw(renameVars(html)));
const DEFS = prefixMarkup(sprite)
  .replace('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">',
    '<svg id="sq-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">');
if (!DEFS.includes('<svg id="sq-defs"')) throw new Error("sprite root not found");

function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (s.includes(".sq") ? s : `:where(.sq) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const EXTRA = `
/* The fit factor and the FAQ's height transition need these on the root (the page set them on :root) */
.sq { --sq-k: 1.1; interpolate-size: allow-keywords; }
/* Fixed on the page; a component in the system sits in the flow */
.sq-site-head { position: relative; padding: 0; }
.sq-site-foot { padding: 0; }
/* The plan picture's padding was a percentage of the whole plan header on the page, which shrank the drawing to a dot */
.sq-plan-top .sq-pic { padding: 14px; }
/* The review marquee scrolls on CSS: the script appends an aria-hidden copy of the list */
.sq-marquee { overflow: hidden; padding-inline: 0; }
.sq-marquee.sq-is-running .sq-marquee-track { overflow: visible; width: max-content; animation: sq-marquee var(--sq-dur-marquee) linear infinite; }
.sq-marquee.sq-is-running:hover .sq-marquee-track,
.sq-marquee.sq-is-running:focus-within .sq-marquee-track { animation-play-state: paused; }
@keyframes sq-marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .sq-marquee.sq-is-running .sq-marquee-track { animation: none; }
}`;
const componentCss = rootEvery(prefixCss(tokenize(base)) + "\n" + EXTRA).replace(/\n{3,}/g, "\n\n").trim();

/* ── 4. Markup helpers ───────────────────────────────────────────────── */
// The page's scroll hooks and anchors belong to the page, not the system
const unhook = (html) => html
  .replace(/ data-(section|kind|stick|fixed|split|reveal|pop|spin|sticker|unveil|draw|slide|drop|brackets|grow)(="[^"]*")?(?=[\s>])/g, "")
  .replace(/ id="(hero|story|menu|school|steps|gallery|team|reviews|pricing|faq|contact)"/g, "")
  .replace(/(<a\b[^>]*?) href="#[a-z-]+"/g, '$1 href="#"');

/* ── 5. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(unhook(markup)), ...opts });
const section = (marker) => el(marker);
const inner = (marker, wrapMarker) => sliceEl(section(marker), wrapMarker).html;

add("nav", "Navigation", "Two white pills floating on the ground: the brand (an S on a honey blob and the wordmark in Climate Crisis) and the links with a leaf Order button. Under 900px the links fold into a round menu button that opens a sheet of huge tone-coloured links.",
  `<div style="padding: 14px; border-radius: var(--sq-r-tile); background: var(--sq-ground)">\n${section('<header class="site-head"')}\n</div>`, { js: true });

const hero = section('<section id="hero"');
const nav = section('<header class="site-head"');
add("buttons", "Buttons & links", "Pill buttons whose hover fill is a spinning blob rising from below (ink with a honey blob, leaf with honey, white with sky), a solid underline that turns into marching dashes, round icon buttons that jelly on hover, and the ink email pill.",
  `<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; padding: 24px; border-radius: var(--sq-r-tile); background: var(--sq-ground)">
${/<div class="main-actions">([\s\S]*?)<\/div>/.exec(hero)[1]}
${/<a class="btn btn--leaf" href="#contact">Order<\/a>/.exec(nav)[0]}
${/<a class="lnk" href="#contact">Pre-order for tomorrow<\/a>/.exec(section('<section id="menu"'))[0]}
${/<div class="pill-row">[\s\S]*?<\/div>/.exec(section('<section id="contact"'))[0]}
</div>`, { defs: false });

add("board", "Bento hero board", "The hero as a board of rounded tiles on a 4-column grid: the honey main tile with fitted Climate Crisis type, a chip on a tilted blob and a leaf price sticker; a tall white product tile; a tangerine rating; Top picks with overlapping round thumbnails; a sky Workshops tile with a handwritten Join in! and a dashed arrow.",
  `<div style="display: flex; min-height: 600px">\n${sliceEl(hero, '<div class="board"').html}\n</div>`, { defs: true });

add("story", "Statement & facts", "A big statement on honey with product pictures set inline in rounded pills, a handwritten signature, and white fact tiles whose numbers fit their tile.",
  section('<section id="story"').replace(/^<section[^>]*>/, '<div class="story" style="border-radius: var(--sq-r-tile)">').replace(/<\/section>$/, "</div>"), { defs: true });

add("products", "Product tiles", "Tone-coloured product tiles (white, sky, tangerine, honey): an illustration on a squircle blob, three-stroke sparks, a rotated leaf price sticker, a Climate Crisis name and a line of copy. Under 700px they turn into compact rows.",
  inner('<section id="menu"', '<div class="menu-grid">'), { defs: true });

add("classes", "Class schedule", "A sky card with a bench illustration in an arched window and a handwritten Join a class!, beside a white list of class rows: a honey blob date, title and seats, a Climate Crisis price and a round arrow button, on dashed dividers.",
  inner('<section id="school"', '<div class="wrap school-grid">'), { defs: true });

add("steps", "Timeline", "Four tone tiles on a dashed leaf timeline with honey-and-leaf dots, each with a fitted time, a bold title and a line of copy. Under 800px the line turns vertical.",
  inner('<section id="steps"', '<div class="steps-track">'));

add("gallery", "Picture bento", "Five illustrations in rounded frames of solid tone colours around a white text tile, on a 4 x 3 grid that becomes two columns on phones.",
  `<div style="display: flex; height: clamp(560px, 62vw, 760px)">\n${sliceEl(section('<section id="gallery"'), '<div class="gal-grid"').html.replace(/\s*<div class="gal-thumbs" aria-hidden="true"><\/div>/, "")}\n</div>`, { defs: true });

const team = inner('<section id="team"', '<div class="team-grid">');
const people = [...team.matchAll(/<article class="person[\s\S]*?<\/article>/g)].map((m) => m[0]);
add("team", "Team cards", "Tone tiles with an illustrated portrait on a tilted blob, the first name fitted in Climate Crisis, a bold role and a one-line joke.",
  `<div class="team-grid">\n${people.filter((p) => /i-p-(nell|joe)/.test(p)).join("\n")}\n</div>`, { defs: true });

const reviews = section('<section id="reviews"');
add("reviews", "Rating & reviews", "A honey rating tile with the score fitted between thin brackets, an intro tile, and an endless marquee of tone-coloured quote cards with a big leaf quote mark. It pauses on hover or focus; with motion reduced it is a scrolling row.",
  `${sliceEl(reviews, '<div class="wrap rev-head">').html}\n${sliceEl(reviews, '<div class="marquee"').html}`, { js: true });

const pricing = section('<section id="pricing"');
add("pricing", "Pricing plans", "A Monthly / Yearly switch with a springy knob above three plan tiles: a fitted price, a picture on a tilted squircle, leaf check bullets and a button. The middle plan wears a Most loved sticker.",
  `<div data-sq-pricing>\n${sliceEl(pricing, '<div class="sec-head">').html}\n${sliceEl(pricing, '<div class="plans">').html}\n</div>`, { js: true, defs: true });

add("faq", "FAQ", "A sky side tile with a handwritten note beside white question tiles; the honey plus spins into a sky cross and the answer opens on its natural height.",
  inner('<section id="faq"', '<div class="wrap faq-grid">'));

add("contact", "Contact & form", "A tangerine card with Come say hi! fitted in white, a storefront on a tilted sky squircle, the address grid and the email pill, beside a white form with soft ground fields that turn white with a leaf border on focus.",
  inner('<section id="contact"', '<div class="wrap contact-grid">'), { js: true, defs: true });

add("footer", "Footer", "A board of tiles: the wordmark fitted huge in honey on leaf, a handwritten line, two link cells, a honey pre-order cell and the legal line.",
  section('<footer class="site-foot"').replace(/^<footer[^>]*>/, '<footer class="site-foot">'));

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Siliq components. No GSAP: the menu sheet, the pricing switch, the review marquee and the form run here. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }

  function initMarquee(mq) {
    if (mq._sqBuilt) return;
    mq._sqBuilt = true;
    var track = mq.querySelector('.sq-marquee-track'), list = mq.querySelector('.sq-marquee-list');
    if (!track || !list || !list.children.length || reduce) return;
    var copy = list.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    each(copy, 'a, button', function (a) { a.tabIndex = -1; });
    track.appendChild(copy);
    mq.classList.add('sq-is-running');
  }
  function init(scope) { each(scope, '[data-sq-marquee]', initMarquee); }
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
    var btn = head.querySelector('.sq-menu-btn');
    head.classList.toggle('sq-is-open', open);
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    var label = btn.getAttribute(open ? 'data-sq-label-close' : 'data-sq-label-open');
    if (label) btn.setAttribute('aria-label', label);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest) return;
    var menu = t.closest('.sq-menu-btn');
    if (menu) { var head = menu.closest('.sq-site-head'); if (head) setMenu(head, !head.classList.contains('sq-is-open')); return; }
    var sheetLink = t.closest('.sq-sheet a');
    if (sheetLink) { setMenu(sheetLink.closest('.sq-site-head'), false); return; }
    var sw = t.closest('.sq-switch');
    if (sw) {
      var on = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(on));
      var scope = sw.closest('[data-sq-pricing]') || document;
      each(scope, '[data-sq-weekly][data-sq-monthly]', function (el) {
        el.textContent = on ? el.getAttribute('data-sq-monthly') : el.getAttribute('data-sq-weekly');
        if (el.style.getPropertyValue('--sq-len')) el.style.setProperty('--sq-len', String(Math.max(1, el.textContent.trim().length)));
      });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') each(document, '.sq-site-head.sq-is-open', function (h) { setMenu(h, false); });
  });
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('[data-sq-form]');
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var btn = form.querySelector('[data-sq-sent]'), label = btn && btn.querySelector('.sq-btn-label');
    if (label) label.textContent = btn.getAttribute('data-sq-sent');
    if (btn) btn.disabled = true;
    form.classList.add('sq-is-sent');
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(/<a class="brand"[\s\S]*?<\/a>/.exec(nav)[0].replace('href="#hero"', 'href="#"'));
const CHROME = `
body{margin:0;background:var(--sq-ground)}
.sp-top{padding:var(--sq-gap) var(--sq-edge) 0}
.sp-meta{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--sq-gap)}
.sp-meta>span{display:inline-flex;align-items:center;min-height:var(--sq-head-h);padding:0 22px;border-radius:999px;background:var(--sq-paper);box-shadow:var(--sq-shadow-float);font:600 13px/1.2 var(--sq-font-text)}
.sp-hero{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:var(--sq-gap);margin-top:var(--sq-gap)}
.sp-title{display:flex;flex-direction:column;justify-content:space-between;gap:28px;min-height:clamp(320px,34vw,480px);padding:var(--sq-pad);border-radius:var(--sq-r-tile);background:var(--sq-honey);container-type:inline-size}
.sp-title h1{color:var(--sq-paper);line-height:.88}
.sp-title h1 .sq-fit{--sq-fit-w:92cqi}
.sp-title p{max-width:30em;font-size:var(--sq-lead);line-height:1.45}
.sp-tones{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--sq-gap)}
.sp-tones div{display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-height:120px;padding:18px;border-radius:var(--sq-r-tile);font:600 14px/1.2 var(--sq-font-text)}
.sp-tones b{font:400 clamp(15px,1.6vw,22px)/1 var(--sq-font-display);text-transform:uppercase;overflow-wrap:anywhere}
.sp-main{padding:0 var(--sq-edge) 120px}
.sp-sec{padding:64px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:22px;padding:0 6px}
.sp-head h2{margin:10px 0 0;font:400 clamp(20px,1.9vw,28px)/1 var(--sq-font-display);text-transform:uppercase;overflow-wrap:anywhere}
.sp-label{margin:0;font:700 12px/1 var(--sq-font-text);letter-spacing:.12em;text-transform:uppercase;color:var(--sq-leaf)}
.sp-note{margin:0;max-width:640px;font-size:16px;line-height:1.5;color:var(--sq-ink-soft)}
.sp-demo{position:relative}
@media (max-width:899px){.sp-hero{grid-template-columns:minmax(0,1fr)}.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HERO = `
<header class="sp-top">
<div class="sp-meta">${brand.replace('<a class="sq-brand"', '<a class="sq-brand" style="box-shadow:var(--sq-shadow-float)"')}<span>InstaLanding design system · siliq@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div class="sp-title">
<h1 class="sq-display"><span class="sq-fit" style="--sq-len:8">Stickers</span><span class="sq-fit" style="--sq-len:9">and tiles</span></h1>
<p>A sticker-bright bento: rounded tiles in sky, honey and tangerine on a pale sage ground, Climate Crisis fitted to every tile, handwritten notes and glossy SVG products on squircle blobs. Extracted from the Siliq AI Hardware Lab page.</p>
</div>
<div class="sp-tones" aria-label="Tile tones">
<div class="sq-tone-honey"><b>Honey</b>#FFBF3C</div>
<div class="sq-tone-sky"><b>Sky</b>#7CC4EA</div>
<div class="sq-tone-tangerine" style="color:var(--sq-paper)"><b>Tangerine</b>#F47A3C</div>
<div style="background:var(--sq-leaf);color:var(--sq-honey)"><b>Leaf</b>#0A5C46</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Siliq",
  slug: "siliq",
  version: VERSION,
  prefix: "sq",
  rootClass: "sq",
  labelClass: "sp-label",
  script: "scripts/systems/siliq.mjs",
  source: SOURCE,
  metaDescription: "The Siliq design system: tokens and working components extracted from the Siliq AI Hardware Lab page.",
  defsNote: "the illustration sprite: products, the lab and two portraits as SVG symbols (sq-i-*), with their gradients and filters",
  jsNote: "the menu sheet, the pricing switch, the review marquee and the form (no GSAP)",
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
writeSystem({ slug: "siliq", prefix: "sq", rootClass: "sq", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "tile", "board", "item", "sticker", "plan", "fit", "display", "person", "review", "qa", "class-row"] });
