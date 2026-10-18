// Extracts the Kind Swarm design system from its landing page.
//
//   node scripts/systems/kind-swarm.mjs
//
// Reads public/demos/kindswarm-casework.html (never edits it) and writes
// public/systems/kind-swarm/:
//   specimen.html   the specimen: every component rendered live, one file (not
//                   index.html: the host would serve it for /systems/<slug>, the dialog URL)
//   tokens.css      the design tokens as CSS custom properties
//   kind-swarm.css  tokens + component CSS, ready to link from any page
//
// The pipeline: slice real markup out of the page, rename its classes and
// keyframes under a ks- prefix (so the CSS can't collide with a host app),
// and swap the page's literal colours, fonts, radii, shadows and timings for
// the tokens below. The specimen's <style id="ks-tokens"> and
// <style id="ks-components"> blocks are what the site's SYSTEMS dialog reads.
import { readPage, sliceEl, dropStyle, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/kindswarm-casework.html";
const { page, el, css: pageCssRaw, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. Group comments ("/* Color · core *​/")
   are read by the dialog to lay the token panel out, so keep the format. */
const TOKENS = `/* InstaLanding design system · Kind Swarm · kind-swarm@${VERSION}
   Extracted from https://instalanding.ai/demos/kindswarm-casework.html
   Fonts (Google Fonts): Stardos Stencil 400/700, IBM Plex Sans Condensed 400-700 + italics, IBM Plex Mono 500/600 */
:root {
  /* Color · core */
  --ks-ink: #15111F;
  --ks-paper: #F4EFE6;
  --ks-white: #FFFFFF;
  --ks-flame: #FF5A3C;
  --ks-flame-deep: #F0361A;
  --ks-flame-hot: #FF3D1F;
  --ks-lime: #D4FF3A;
  --ks-lime-deep: #C6F230;
  --ks-focus: #3D7BFF;

  /* Color · text */
  --ks-text-soft: #3A3347;
  --ks-text-muted: #5A5168;
  --ks-text-card: #2A2436;
  --ks-on-ink-soft: #CFC6E8;
  --ks-on-ink-muted: #B9B0CC;
  --ks-on-ink-faint: #E4DEF2;

  /* Color · dark surfaces */
  --ks-ink-raised: #1F1A2E;
  --ks-ink-line: #3B3358;
  --ks-ink-ring: #221C3A;
  --ks-flame-shadow: #5A160C;

  /* Color · character gradients */
  --ks-moji-blue: #3D7BFF;
  --ks-moji-violet: #B56CFF;
  --ks-moji-sun: #FFD24A;
  --ks-moji-sun-deep: #FF9A1C;
  --ks-moji-peach: #FFB36B;
  --ks-moji-pink: #FF6FB5;

  /* Color · stage pastels */
  --ks-stage-1: #9CC8FF;
  --ks-stage-1-ring: #84B6F7;
  --ks-stage-2: #FFE08A;
  --ks-stage-2-ring: #FFD15C;
  --ks-stage-3: #FFC4A8;
  --ks-stage-3-ring: #FFAE8A;
  --ks-stage-4: #D6C2FF;
  --ks-stage-4-ring: #C3A8FF;
  --ks-stage-5: #FFB8D9;
  --ks-stage-5-ring: #FF9CC8;
  --ks-stage-6: #C9F26B;
  --ks-stage-6-ring: #B6E34A;
  --ks-stage-7: #A8E6FF;
  --ks-stage-7-ring: #86D8F7;
  --ks-stage-8: #F2C4FF;
  --ks-stage-8-ring: #E6A8FA;

  /* Type · families */
  --ks-font-display: "Stardos Stencil", "Courier New", serif;
  --ks-font-body: "IBM Plex Sans Condensed", "Arial Narrow", Arial, sans-serif;
  --ks-font-mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;

  /* Type · scale */
  --ks-display-xl: clamp(60px, 17vw, 260px);
  --ks-display-lg: clamp(48px, 8.4vw, 136px);
  --ks-display-md: clamp(40px, 4.4vw, 72px);
  --ks-display-sm: 34px;
  --ks-body-lg: 20px;
  --ks-body: 17px;
  --ks-label: 13px;
  --ks-label-tracking: .16em;
  --ks-leading-display: .92;
  --ks-leading-body: 1.55;

  /* Shape · radii */
  --ks-radius-pill: 999px;
  --ks-radius-card: 30px;
  --ks-radius-plan: 28px;
  --ks-radius-panel: 24px;
  --ks-radius-stage: 22px;
  --ks-radius-inset: 14px;

  /* Shape · borders */
  --ks-border: 3px;
  --ks-border-stage: 2.5px;
  --ks-border-thin: 2px;

  /* Depth · hard shadows */
  --ks-shadow-offset: 8px;
  --ks-shadow: var(--ks-shadow-offset) var(--ks-shadow-offset) 0 var(--ks-ink);
  --ks-shadow-hover: calc(var(--ks-shadow-offset) + 2px) calc(var(--ks-shadow-offset) + 2px) 0 var(--ks-ink);
  --ks-shadow-lime: var(--ks-shadow-offset) var(--ks-shadow-offset) 0 var(--ks-lime);
  --ks-shadow-lime-hover: calc(var(--ks-shadow-offset) + 3px) calc(var(--ks-shadow-offset) + 3px) 0 var(--ks-lime);

  /* Pattern · rings */
  --ks-ring-size: 120px;
  --ks-ring-size-sm: 90px;
  --ks-ring-size-stage: 76px;
  --ks-grain-opacity: .22;

  /* Space · layout */
  --ks-page-max: 1440px;
  --ks-gutter: clamp(16px, 4vw, 56px);
  --ks-section-y: clamp(80px, 10vw, 160px);
  --ks-gap: 36px;
  --ks-gap-lg: 56px;

  /* Motion · easing */
  --ks-ease-press: cubic-bezier(.2, .8, .2, 1);
  --ks-ease-spring: cubic-bezier(.3, 1.4, .5, 1);
  --ks-ease-bob: cubic-bezier(.45, 0, .55, 1);
  --ks-ease-rise: cubic-bezier(.16, 1, .3, 1);

  /* Motion · durations */
  --ks-dur-press: .14s;
  --ks-dur-hover: .25s;
  --ks-dur-poke: .76s;
  --ks-dur-bob: 3.4s;
  --ks-dur-blink: 5.6s;
  --ks-dur-rise: 1s;
  --ks-dur-marquee: 56s;
  --ks-dur-drift: 16s;
}`;

/* ── 2. Normalisation: literal values -> tokens ───────────────────────── */
const HEX = {
  "#15111F": "ink", "#F4EFE6": "paper", "#FFFFFF": "white", "#FF5A3C": "flame", "#F0361A": "flame-deep",
  "#FF3D1F": "flame-hot", "#D4FF3A": "lime", "#C6F230": "lime-deep", "#3D7BFF": "focus",
  "#3A3347": "text-soft", "#5A5168": "text-muted", "#2A2436": "text-card", "#CFC6E8": "on-ink-soft",
  "#B9B0CC": "on-ink-muted", "#E4DEF2": "on-ink-faint", "#1F1A2E": "ink-raised", "#3B3358": "ink-line",
  "#221C3A": "ink-ring", "#5A160C": "flame-shadow",
  "#9CC8FF": "stage-1", "#84B6F7": "stage-1-ring", "#FFE08A": "stage-2", "#FFD15C": "stage-2-ring",
  "#FFC4A8": "stage-3", "#FFAE8A": "stage-3-ring", "#D6C2FF": "stage-4", "#C3A8FF": "stage-4-ring",
  "#FFB8D9": "stage-5", "#FF9CC8": "stage-5-ring", "#C9F26B": "stage-6", "#B6E34A": "stage-6-ring",
  "#A8E6FF": "stage-7", "#86D8F7": "stage-7-ring", "#F2C4FF": "stage-8", "#E6A8FA": "stage-8-ring",
};
// Applied to CSS text and style="" attributes only: SVG presentation attributes can't read var().
const SWAPS = [
  [/"Stardos Stencil",\s*"Courier New",\s*serif|"Stardos Stencil",\s*serif|'Stardos Stencil',\s*serif/g, "var(--ks-font-display)"],
  [/"IBM Plex Sans Condensed",\s*"Arial Narrow",\s*(Arial,\s*)?sans-serif/g, "var(--ks-font-body)"],
  [/"IBM Plex Mono",\s*ui-monospace,\s*(Menlo,\s*)?monospace|'IBM Plex Mono',\s*monospace|ui-monospace,\s*Menlo,\s*monospace/g, "var(--ks-font-mono)"],
  [/(?<![\w-])8px 8px 0 var\(--ks-ink\)/g, "var(--ks-shadow)"],
  [/(?<![\w-])10px 10px 0 var\(--ks-ink\)/g, "var(--ks-shadow-hover)"],
  [/(?<![\w-])8px 8px 0 var\(--ks-lime\)/g, "var(--ks-shadow-lime)"],
  [/(?<![\w-])11px 11px 0 var\(--ks-lime\)/g, "var(--ks-shadow-lime-hover)"],
  [/border-radius:\s*999px/g, "border-radius:var(--ks-radius-pill)"],
  [/border-radius:\s*30px/g, "border-radius:var(--ks-radius-card)"],
  [/border-radius:\s*28px/g, "border-radius:var(--ks-radius-plan)"],
  [/border-radius:\s*24px/g, "border-radius:var(--ks-radius-panel)"],
  [/border-radius:\s*22px/g, "border-radius:var(--ks-radius-stage)"],
  [/border-radius:\s*14px/g, "border-radius:var(--ks-radius-inset)"],
  [/--s:\s*120px/g, "--s:var(--ks-ring-size)"],
  [/--s:\s*90px/g, "--s:var(--ks-ring-size-sm)"],
  [/--s:\s*76px/g, "--s:var(--ks-ring-size-stage)"],
  [/\.14s cubic-bezier\(\.2,\.8,\.2,1\)/g, "var(--ks-dur-press) var(--ks-ease-press)"],
  [/\.25s cubic-bezier\(\.2,\.8,\.2,1\)/g, "var(--ks-dur-hover) var(--ks-ease-press)"],
  [/\.35s cubic-bezier\(\.3,1\.5,\.5,1\)/g, ".35s var(--ks-ease-spring)"],
  [/\.3s cubic-bezier\(\.3,1\.5,\.5,1\)/g, ".3s var(--ks-ease-spring)"],
  [/\.76s cubic-bezier\(\.3,1\.4,\.5,1\)/g, "var(--ks-dur-poke) var(--ks-ease-spring)"],
  [/3\.4s cubic-bezier\(\.45,0,\.55,1\)/g, "var(--ks-dur-bob) var(--ks-ease-bob)"],
  [/1s cubic-bezier\(\.16,1,\.3,1\)/g, "var(--ks-dur-rise) var(--ks-ease-rise)"],
  [/ 5\.6s /g, " var(--ks-dur-blink) "],
  [/ 56s linear/g, " var(--ks-dur-marquee) linear"],
  [/ 16s linear/g, " var(--ks-dur-drift) linear"],
  [/border(-top|-bottom)?:\s*3px solid/g, "border$1:var(--ks-border) solid"],
  [/border:\s*2\.5px solid/g, "border:var(--ks-border-stage) solid"],
  [/border:\s*2px solid var\(--ks-ink\)/g, "border:var(--ks-border-thin) solid var(--ks-ink)"],
  [/max-width:1440px/g, "max-width:var(--ks-page-max)"],
  [/clamp\(16px,4vw,56px\)/g, "var(--ks-gutter)"],
];

/* Class and keyframe names get a ks- prefix. */
const CLASSES = ["disp", "serif", "label", "wrap", "btn", "btn-ink", "btn-paper", "btn-lime", "on-ink", "navlink", "rings",
  "hero-rings", "st1", "st2", "st3", "st4", "st5", "st6", "st7", "st8", "grain", "moji", "bod", "eye", "pupil", "d1", "d2", "d3", "d4",
  "react", "poke", "rise", "mq-rings", "wave-text", "ink-rings", "mqbox", "mq", "stats", "stat", "live", "pill", "on", "card", "stage",
  "tag", "code", "cbody", "chead", "cname", "cprice", "cdesc", "cskills", "step", "num", "qrow", "qbtn", "go", "chip", "rule", "plan"];
const KEYFRAMES = ["bob", "blink", "poke", "rise", "mq", "drift", "live"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({ prefix: "ks", hex: HEX, swaps: SWAPS, classes: CLASSES, keyframes: KEYFRAMES, attrs: ["poke"] });

/* ── 3. Component CSS, from the page's own <style> ───────────────────── */
const pageCss = pageCssRaw;
const componentCss = prefixCss(tokenize(pageCss
  .replace(/^body\{[^}]*\}\n/m, "")
  .replace(/^html\{scroll-behavior:smooth\}\n/m, "")
  .replace(/^a\{color:inherit\}a:hover\{color:inherit\}\n/m, // :where() keeps the scoped base rules as weak as the page's bare `a{}`, so .ks-btn-ink still sets its colour
    ":where(.ks) a{color:inherit}:where(.ks) a:hover{color:inherit}\n")
  .replace(/^a:focus-visible,button:focus-visible\{/m, ".ks a:focus-visible,.ks button:focus-visible{")
  .replace(/^\.ks\{([^}]*)overflow-x:hidden\}/m, ".ks{$1}")
  .replace(/^\[hidden\]\{display:none!important\}\n?/m, "")
  // Page-level scrolling belongs to the host page, not to the system
  .replace("html{scroll-behavior:auto}", "")
  .replace(/^\.ks \*,\.ks \*::before\{animation:none !important;transition:none !important\}/m, ".ks *,.ks *::before{animation:none !important;transition:none !important}")
)).trim();

/* ── 4. Slicing real markup ──────────────────────────────────────────── */
const defs = el('<svg width="0" height="0" style="position: absolute"').replace("<svg ", '<svg id="ks-defs" ');
const cards = readPage(SOURCE).all('<article class="card"');
const mojiOf = (card) => sliceEl(card, "<svg class=\"moji").html;
const leadMoji = sliceEl(el('<button class="poke rise"'), "<svg class=\"moji").html;
const pokeBtn = (svg, label, size = 150) => `<button class="poke" type="button" data-poke aria-label="Poke the ${label}" style="width: ${size}px; height: ${size}px">\n${svg}\n</button>`;
const cardName = (card) => /class="disp cname">([^<]*)/.exec(card)[1];

/* ── 5. Components (each one real markup from the page) ──────────────── */
const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(markup), ...opts });

add("buttons", "Buttons", "Pill buttons with a 3px ink border and a hard 8px offset shadow that grows on hover and collapses when pressed. Ink, paper and lime; on dark sections the border and shadow turn lime.",
  `<div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center">
${/<a class="btn btn-ink" href="#crew"[^>]*>[^<]*<\/a>/.exec(page)[0].replace('href="#crew"', 'href="#"')}
${/<a class="btn btn-paper" href="#guardrails">[^<]*<\/a>/.exec(page)[0].replace('href="#guardrails"', 'href="#"')}
<a class="btn btn-lime" href="#">Book a demo</a>
</div>
<div class="on-ink" style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center; margin-top: 28px; padding: 32px; border-radius: 24px; background: #15111F">
<a class="btn btn-ink" href="#">On ink</a>
<a class="btn btn-lime" href="#">Lime on ink</a>
</div>`);

add("type", "Type", "Stardos Stencil set huge and uppercase for display, an italic condensed second line as the accent, mono uppercase labels, condensed body copy.",
  `<div>
${el('<p class="label">01 — How a swarm works</p>')}
${el('<h2 class="disp" style="margin-top: 24px; font-size: clamp(48px, 8.4vw, 136px)">Many hands.')}
${el('<p style="max-width: 600px; margin: 32px 0 0; font-size: 20px')}
</div>`);

add("rings", "Ring patterns", "The signature surface: concentric arcs from two colours (--c1 / --c2) at a tile size (--s). Flame, lime and ink bands, eight pastel stages, and the pattern clipped into stencil type.",
  `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px">
<div class="rings hero-rings" style="height: 140px; border: 3px solid #15111F; border-radius: 22px; background-color: #FF5A3C"></div>
<div class="rings mq-rings" style="height: 140px; border: 3px solid #15111F; border-radius: 22px; background-color: #D4FF3A"></div>
<div class="rings ink-rings" style="height: 140px; border: 3px solid #15111F; border-radius: 22px; background-color: #15111F"></div>
</div>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: 12px; margin-top: 16px">
${[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `<div class="stage rings st${n}" style="height: 72px; border-radius: 14px"></div>`).join("\n")}
</div>
<p class="disp" style="margin-top: 24px; font-size: clamp(56px, 9vw, 120px)">${el('<span class="rings wave-text">Kind</span>')} ${el('<span class="rings wave-text">Swarm</span>')}</p>`);

add("characters", "Animoji characters", "Glossy rounded-diamond agents in shared gradients with a hard ink shadow. Pupils follow the pointer, eyes blink, bodies bob; click one to poke it. Needs the shared <svg id=\"ks-defs\"> and the component script.",
  `<div style="display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end">
${pokeBtn(leadMoji, "swarm lead", 170)}
${[0, 2, 5, 7].map((i) => pokeBtn(mojiOf(cards[i]), cardName(cards[i]), 120)).join("\n")}
</div>`, { js: true, defs: true });

add("nav", "Navigation", "Wordmark with the lead character, plain condensed links that underline thick on hover, and an ink CTA without its shadow.",
  `<div class="rings hero-rings" style="position: relative; overflow: hidden; border-radius: 22px; background-color: #FF5A3C; color: #15111F">
${dropStyle(el('<nav class="wrap" data-section="nav"'), []).replace(' data-section="nav"', "").replace(/href="#[a-z]+"/g, 'href="#"')}
</div>`, { defs: true });

add("stats", "Stats strip", "Big stencil numerals over mono labels on ink, divided by hairlines, with a pulsing lime live dot.",
  `<div style="background: #15111F; color: #F4EFE6; border-radius: 22px; padding: 0 28px">
${el('<dl class="wrap stats">').replace('class="wrap stats"', 'class="stats"')}
</div>`);

add("marquee", "Marquee", "An endless, edge-faded band of stencil phrases alternating filled and outlined, on lime rings. Pauses on hover.",
  dropStyle(el('<div data-section="marquee"'), []).replace(' data-section="marquee"', "").replace("position: relative;", "position: relative; border-radius: 22px;"));

add("pills", "Filter pills", "Outline pills on ink; the pressed one fills lime. A real toggle group with aria-pressed.",
  `<div class="on-ink" style="padding: 32px; border-radius: 24px; background: #15111F">
${el('<div role="group" aria-label="Filter agents by job"').replace(/ style="[^"]*margin-top: 48px"/, ' style="display: flex; flex-wrap: wrap; gap: 12px"').replace(' aria-label="Filter agents by job"', ' aria-label="Filter by job" data-ks-pills')}
</div>`, { js: true });

add("card", "Agent card", "Cream card with a lime hard shadow: a ringed pastel stage with a tag and code, the character (lifts and tilts on hover), name, price pill, description and a mono skills line.",
  `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 40px 36px; padding: 32px; border-radius: 24px; background: #15111F">
${cards[0]}
${cards[1]}
</div>`, { js: true, defs: true });

add("step", "Numbered step", "Huge outlined stencil numeral over a 3px rule, a character, a stencil heading and condensed copy.",
  `<div style="max-width: 420px">\n${el('<article class="step">')}\n</div>`, { defs: true });

add("queue", "Approval queue", "White panel with an ink header and a lime count; each row has a character, the draft, its agent and Edit / Approve buttons.",
  el('<div style="background: #FFFFFF; border: 3px solid #15111F; border-radius: 24px'), { defs: true });

add("chips", "Chips", "Outlined pills for compliance and facts, after a mono label.",
  dropStyle(el('<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: clamp(64px'), ["margin-top", "padding-top", "border-top"]));

add("rules", "Rule cards", "Dark raised cards on ink rings: a lime stencil keyword, a bold rule and soft lilac copy.",
  `<div class="rings ink-rings" style="padding: 32px; border-radius: 24px; background-color: #15111F; color: #F4EFE6">
${dropStyle(el('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px; margin-top: clamp(56px'), ["margin-top"])}
</div>`);

add("plans", "Pricing plans", "White plans with ink hard shadows and diamond bullets; the featured plan inverts to ink with a flame shadow and a lime button.",
  dropStyle(el('<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap: 36px; margin-top: clamp(56px'), ["margin-top"]).replace(/href="#book"/g, 'href="#"'));

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Kind Swarm components. Pupils follow the pointer through --px / --py on <html>. */
  var root = document.documentElement.style;
  window.addEventListener('pointermove', function (e) {
    var x = (e.clientX / window.innerWidth - 0.5) * 2, y = (e.clientY / window.innerHeight - 0.5) * 2;
    root.setProperty('--px', (x * 7).toFixed(2) + 'px');
    root.setProperty('--py', (y * 7).toFixed(2) + 'px');
  }, { passive: true });
  document.addEventListener('click', function (e) {
    /* Poke a character: replay its .ks-react animation */
    var b = e.target.closest('[data-ks-poke]');
    if (b) {
      var m = b.querySelector('.ks-moji');
      m.classList.remove('ks-react');
      void m.getBoundingClientRect();
      m.classList.add('ks-react');
      clearTimeout(m._t);
      m._t = setTimeout(function () { m.classList.remove('ks-react'); }, 780);
    }
    /* Filter pills: one pressed at a time within a [data-ks-pills] group */
    var p = e.target.closest('[data-ks-pills] .ks-pill');
    if (p) {
      var all = p.closest('[data-ks-pills]').querySelectorAll('.ks-pill');
      for (var i = 0; i < all.length; i++) {
        all[i].classList.toggle('ks-on', all[i] === p);
        all[i].setAttribute('aria-pressed', all[i] === p ? 'true' : 'false');
      }
    }
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--ks-paper)}
.sp-top{position:relative;overflow:hidden;background-color:var(--ks-flame);border-bottom:var(--ks-border) solid var(--ks-ink)}
.sp-top-in{position:relative;padding:40px var(--ks-gutter) 44px;max-width:var(--ks-page-max);margin:0 auto}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding-bottom:18px;border-bottom:var(--ks-border) solid var(--ks-ink)}
.sp-hero{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px 40px;margin-top:24px}
.sp-hero .ks-disp{font-size:clamp(64px,11vw,168px)}
.sp-cast{display:flex;gap:14px;align-items:flex-end;margin-bottom:12px}
.sp-cast span{display:block;width:clamp(56px,6vw,92px);height:clamp(56px,6vw,92px)}
.sp-cast svg{filter:drop-shadow(5px 5px 0 var(--ks-ink))}
.sp-lede{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:24px 56px;align-items:end;margin-top:28px}
.sp-lede p{margin:0;font-size:19px;line-height:1.5;font-weight:500;max-width:560px}
.sp-swatches{display:flex;flex-wrap:wrap;gap:10px}
.sp-swatches i{display:block;width:44px;height:44px;border:var(--ks-border) solid var(--ks-ink);border-radius:var(--ks-radius-pill);box-shadow:4px 4px 0 var(--ks-ink)}
.sp-main{max-width:var(--ks-page-max);margin:0 auto;padding:16px var(--ks-gutter) 120px}
.sp-sec{padding:56px 0;border-bottom:2px solid rgba(21,17,31,.14);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:8px 40px;margin-bottom:28px}
.sp-head h2{margin:10px 0 0;font-family:var(--ks-font-display);font-size:30px;line-height:1;text-transform:uppercase}
.sp-note{margin:0;max-width:640px;font-size:16px;line-height:1.55;color:var(--ks-text-soft)}
.sp-demo{position:relative}
@media (max-width:720px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HERO = `
<header class="sp-top ks-rings ks-hero-rings">
<svg class="ks-grain" aria-hidden="true"><rect width="100%" height="100%" filter="url(#ks-noise)"></rect></svg>
<div class="sp-top-in">
<div class="sp-meta"><p class="ks-label">InstaLanding design system</p><p class="ks-label">kind-swarm@${VERSION} · ${C.length} components</p></div>
<div class="sp-hero">
<h1 class="ks-disp"><span class="ks-rings ks-wave-text">Kind Swarm</span></h1>
<div class="sp-cast" aria-hidden="true">${[0, 1, 2, 5, 7].map((i) => `<span>${prefixMarkup(mojiOf(cards[i]))}</span>`).join("")}</div>
</div>
<div class="sp-lede">
<p>Loud, warm neo-brutalism: stencil type set huge, op-art ring patterns, 3px ink outlines with hard offset shadows, cream cards and animoji characters. Extracted from the Social Work Agent Swarm landing page.</p>
<div class="sp-swatches" aria-label="Core colours">${["ink", "paper", "flame", "lime", "focus"].map((t) => `<i title="--ks-${t}" style="background:var(--ks-${t})"></i>`).join("")}</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Kind Swarm",
  slug: "kind-swarm",
  version: VERSION,
  prefix: "ks",
  rootClass: "ks",
  labelClass: "ks-label",
  script: "scripts/systems/kind-swarm.mjs",
  source: SOURCE,
  metaDescription: "The Kind Swarm design system: tokens and working components extracted from the Social Work Agent Swarm landing page.",
  defsNote: "shared gradients and the grain filter the characters use",
  jsNote: "pointer-tracking eyes, poke and the filter pills",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: prefixMarkup(defs),
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "kind-swarm", prefix: "ks", rootClass: "ks", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "card", "moji", "disp", "label", "rings", "pill", "stage"] });
