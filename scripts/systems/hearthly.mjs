// Extracts the Hearthly design system from its landing page.
//
//   node scripts/systems/hearthly.mjs
//
// Reads public/demos/hearthly-home-care.html (never edits it) and writes
// public/systems/hearthly/ (specimen.html, tokens.css, hearthly.css) through
// the shared pipeline in lib.mjs. The page keeps one flat <style>; the system
// drops the scroll machinery behind .motion (the pinned hero flood, washes,
// line reveals, step states) and keeps every section's static form, which is
// what the page shows without GSAP. The ambient loops (floating cards, the
// spinning ring and burst, pulses, typing dots, the live status) become plain
// rules, and the review marquee runs on a CSS keyframe. The page's SVG sprite
// becomes the shared <svg id="hy-defs">; every id in it and in the inline art
// (the night scene, the portraits) moves under hy-. Values the page's script
// computes at boot (folder tab offsets, the plate arch and tab sides, bar
// widths, float timings) are computed here, so the markup is complete as is.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/hearthly-home-care.html";
const { page, BODY, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">';
const GRAIN = /--grain:(url\("data:image\/svg\+xml,[^"]+"\))/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Hearthly · hearthly@${VERSION}
   Extracted from https://instalanding.ai/demos/hearthly-home-care.html
   Fonts (Google Fonts): Instrument Sans 400-700 (everything), Instrument Serif italic (one word per heading, signatures) */
:root {
  /* Color · core */
  --hy-bg: #F6F2EA;
  --hy-ink: #14130F;
  --hy-dark: #0F1714;
  --hy-marker: #F1DD9A;

  /* Color · tones */
  --hy-ember: #E8693C;
  --hy-sage: #B9D3B0;
  --hy-amber: #F2B544;
  --hy-sky: #9CC6DC;
  --hy-pine: #1F4D43;

  /* Color · derived */
  --hy-muted: color-mix(in oklab, var(--hy-ink) 60%, var(--hy-bg));
  --hy-line: color-mix(in oklab, var(--hy-ink) 12%, var(--hy-bg));
  --hy-soft: color-mix(in oklab, var(--hy-ink) 4.5%, var(--hy-bg));

  /* Color · night and status */
  --hy-night: #0B110F;
  --hy-night-text: #EEE9DF;
  --hy-live: #2FB67A;
  --hy-ok: #3FCF8E;

  /* Type · families */
  --hy-font-sans: "Instrument Sans", system-ui, sans-serif;
  --hy-font-serif: "Instrument Serif", Georgia, serif;
  --hy-font-hand: "Instrument Serif", Georgia, serif;

  /* Type · scale */
  --hy-display: clamp(46px, 7.6vw, 124px);
  --hy-numeral: clamp(64px, 7vw, 112px);
  --hy-figure: clamp(56px, 6vw, 92px);
  --hy-price: clamp(52px, 5vw, 80px);
  --hy-title: clamp(38px, 5vw, 78px);
  --hy-h2: clamp(34px, 4.3vw, 66px);
  --hy-scene: clamp(30px, 4.2vw, 64px);
  --hy-quote: clamp(28px, 3.6vw, 54px);
  --hy-folder: clamp(24px, 2.5vw, 38px);
  --hy-lead: clamp(15px, 1.15vw, 18px);
  --hy-small: 15px;
  --hy-caption: 14px;
  --hy-micro: 13px;
  --hy-label: 12px;

  /* Shape · radii */
  --hy-r: clamp(12px, 1.4vw, 20px);
  --hy-r-panel: 28px;
  --hy-r-card: 18px;
  --hy-r-tab: 14px;
  --hy-r-pill: 99px;

  /* Shape · borders */
  --hy-hairline: 1px;
  --hy-stroke: 1.2px;

  /* Depth · grain, glass and shadow */
  --hy-grain: ${GRAIN};
  --hy-glass: blur(14px);
  --hy-glass-chip: blur(10px);
  --hy-shadow-card: 0 24px 50px -24px rgba(0,0,0,.45);
  --hy-shadow-chip: 0 10px 30px -12px rgba(0,0,0,.35);

  /* Motion · easing */
  --hy-ease: cubic-bezier(.2,.75,.15,1);

  /* Motion · durations */
  --hy-dur-quick: .35s;
  --hy-dur: .4s;
  --hy-dur-fill: .45s;
  --hy-dur-wash: .5s;

  /* Space · layout */
  --hy-pad: clamp(16px, 6.9vw, 110px);
  --hy-maxw: 1320px;
  --hy-gap: clamp(8px, 1.2vw, 18px);
  --hy-sec: clamp(88px, 10vw, 150px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--c1 -> --hy-ember)
const VARS = { c1: "ember", c2: "sage", c3: "amber", c4: "sky", c5: "pine", font: "font-sans", serif: "font-serif", hand: "font-hand" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("hy-") ? m : `--hy-${VARS[n] ?? n}`));
const HEX = { "#0b110f": "night", "#eee9df": "night-text", "#2fb67a": "live", "#3fcf8e": "ok", "#14130f": "ink", "#f6f2ea": "bg" };
const esc = (v) => v.replace(/[().,]/g, "\\$&");
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--hy-${tok})`];
const dur = (v, tok) => [new RegExp(` ${esc(v)} var\\(--hy-ease\\)`, "g"), ` var(--hy-${tok}) var(--hy-ease)`];
const SWAPS = [
  fs_("clamp(46px,7.6vw,124px)", "display"), fs_("clamp(64px,7vw,112px)", "numeral"), fs_("clamp(56px,6vw,92px)", "figure"),
  fs_("clamp(52px,5vw,80px)", "price"), fs_("clamp(38px,5vw,78px)", "title"), fs_("clamp(34px,4.3vw,66px)", "h2"),
  fs_("clamp(30px,4.2vw,64px)", "scene"), fs_("clamp(28px,3.6vw,54px)", "quote"), fs_("clamp(24px,2.5vw,38px)", "folder"),
  fs_("clamp(15px,1.15vw,18px)", "lead"), fs_("15px", "small"), fs_("14px", "caption"), fs_("13px", "micro"), fs_("12px", "label"),
  [/border-radius:99px/g, "border-radius:var(--hy-r-pill)"],
  [/border-radius:28px/g, "border-radius:var(--hy-r-panel)"],
  [/border-radius:18px/g, "border-radius:var(--hy-r-card)"],
  [/border-radius:14px(?=[;}])/g, "border-radius:var(--hy-r-tab)"],
  [/border-(top|bottom):1px solid/g, "border-$1:var(--hy-hairline) solid"],
  [/inset 0 0 0 1\.2px/g, "inset 0 0 0 var(--hy-stroke)"],
  [/backdrop-filter:blur\(14px\);-webkit-backdrop-filter:blur\(14px\)/g, "backdrop-filter:var(--hy-glass);-webkit-backdrop-filter:var(--hy-glass)"],
  [/backdrop-filter:blur\(10px\);-webkit-backdrop-filter:blur\(10px\)/g, "backdrop-filter:var(--hy-glass-chip);-webkit-backdrop-filter:var(--hy-glass-chip)"],
  [/box-shadow:0 24px 50px -24px rgba\(0,0,0,\.45\)/g, "box-shadow:var(--hy-shadow-card)"],
  [/box-shadow:0 10px 30px -12px rgba\(0,0,0,\.35\)/g, "box-shadow:var(--hy-shadow-chip)"],
  [/var\(--hy-grain\)/g, "var(--hy-grain)"],
  dur(".35s", "dur-quick"), dur(".4s", "dur"), dur(".45s", "dur-fill"), dur(".5s", "dur-wash"),
];

/* ── 3. Component CSS: the page's one <style>, minus the scroll machinery ── */
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
// Page-only parts: the document shell and its fixed grain overlay
const DROP = /^(:root|html|body::after)$|^main>\*$/;
// What survives of .motion: the ambient loops, their pause, and the marquee under a class its own script sets
const LOOPS = new Set([".pulse", ".ring__svg", ".look", ".burst", ".typing i", ".status i", ".voices__track.is-running", ".voices__track.is-running .review",
  ".hero.is-still .look", ".hero.is-still .burst", ".hero.is-still .ring__svg"]);
function scopeSelector(sel) {
  if (sel === "*") return ":where(.hy, .hy *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.hy, .hy *)${sel.slice(1)}`;
  if (sel === "body") return ".hy";
  return sel;
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude)
      .map((s) => (s.startsWith(".motion") ? (LOOPS.has(s.replace(/^\.motion /, "")) ? s.replace(/^\.motion /, "") : null) : s))
      .filter((s) => s && !DROP.test(s))
      .map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; every other id (SVG symbols, gradients, filters,
// the ring's text path) moves under hy- with everything that points at it
const ANCHORS = "top|hero|intro|collections|range|lookbook|process|materials|team|voices|pricing|faq|contact|footer";
const HOOKS = "section|kind|component|hdr|reveal|open|mark|split|drift|words|rules|swipe|wordmark|people|steps|chart|plates|folders|fixed|flood|flood-from";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!hy-)([^"]+)"/g, ' id="hy-$1"')
  .replace(/ aria-controls="(?!hy-)([^"]+)"/g, ' aria-controls="hy-$1"')
  .replace(/(href|xlink:href)="#(?!hy-)([^"]+)"/g, '$1="#hy-$2"')
  .replace(/url\(#(?!hy-)([^)]+)\)/g, "url(#hy-$1)")
  .replace(/var\(--([a-z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");
const drop = (html, marker) => { const p = sliceEl(html, marker); return html.slice(0, html.indexOf(marker)) + html.slice(p.end); };

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const nav = el('<header class="hdr"');
add("nav", "Header", "A frosted paper bar (88% paper, 14px blur): the house logo, five links that highlight with a marker swipe on hover, round icon buttons for search and account that fill with ink, and an outline Get the app pill. Under 1000px the links fold into a full-width sheet behind a burger whose label swaps open and close.",
  nav, { js: true });

const HERO = el('<section id="hero"');
const COLL = el('<section id="collections"');
const PRICING = el('<section id="pricing"');
const arrow = '<svg class="btn__arr" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 9 9 3M4 3h5v5"/></svg>';
const plus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
add("buttons", "Buttons & links", "Buttons are pills in Instrument Sans 500. The ink one washes amber from the bottom on hover and its arrow nudges up and right; the outline one washes ink. Links are highlighted, not underlined: a marker band sweeps in under the text. Icon buttons are rings that fill with ink from the centre. The billing toggle is a ringed pill with an ink pressed state.",
  `<div class="demo-pad">
<div class="demo-row"><a class="btn" href="#">Start free for 30 days ${arrow}</a><a class="btn btn--line" href="#">Get the app</a><a class="btn btn--sm" href="#">Book a pro</a><a class="btn btn--line btn--sm" href="#">Meet an advisor</a></div>
<div class="demo-row"><a class="link" href="#">See what it monitors</a><a class="link" href="#">Talk to a person</a><span class="ibtn" aria-hidden="true">${plus}</span><span class="ibtn ibtn--bare" aria-hidden="true">${plus}</span>${piece(PRICING, '<div class="toggle"')}</div>
</div>`, { js: true });

add("type", "Headings & highlighter", "Headings are Instrument Sans 700 with tight tracking and one word in Instrument Serif italic (em.s). A section head pairs the heading with a muted lead and a highlighted link. Eyebrows are small caps with an ember dot in a soft halo; signatures are set in the serif italic on a marker band, like a highlighter pen.",
  `<div class="demo-pad">
<p class="eyebrow">Your home, quietly looked after</p>
<div class="demo-gap"></div>
${piece(COLL, '<div class="wrap sec-head">')}
<p class="demo-sign"><span class="sign">Maya, homeowner since 2024</span></p>
</div>`);

const TILES = [["g-ember", "s-thermo", "ember"], ["g-amber", "s-bolt", "amber"], ["g-sage", "s-leaf", "sage"], ["g-sky", "s-drop", "sky"], ["g-pine", "s-shield", "pine"], ["g-cream", "s-wrench", "cream"], ["g-night", "s-orb", "night"], ["g-sage", "s-wind", "sage"], ["g-ember", "s-house", "ember"], ["g-sky", "s-spark", "sky"]];
const chip = piece(HERO, '<div class="chip">');
add("art", "Illustrated plates", "Every picture is drawn in code: a .art plate is a radial gradient (g-ember, g-amber, g-sage, g-sky, g-pine, g-cream, g-night) with a top light, a floor shadow, a vignette and grain, holding one icon from the shared sprite (an isometric house, thermostat, water drop, charger, leaf, shield, wrench, air purifier, the AI orb). Each gradient also sets the icon's three inks. Plates take a folder-tab notch on either top corner (tab-l, tab-r) and can carry a frosted status chip.",
  `<div class="demo-pad">
<div class="tiles">
${TILES.map(([g, s, name], i) => `<figure class="tile-wrap"><div class="tile${i === 1 ? " tab-l" : i === 3 ? " tab-r" : ""}"><div class="art ${g}"><svg class="ico" viewBox="0 0 200 200"><use href="#${s}"/></svg></div>${i === 6 ? chip : ""}</div><figcaption>${s.slice(2)} · ${name}</figcaption></figure>`).join("\n")}
</div>
</div>`, { defs: true });

// The hero's float timings, set by the page's script at boot
let look = 0;
const HERO_STATIC = asDiv(drop(HERO, '<div class="flood"')).replace(/<figure class="look/g, (m) => {
  const i = look++;
  return `<figure style="--fd:${(3.2 + (i % 3) * 0.7).toFixed(1)}s;--fdl:${(-i * 0.6).toFixed(1)}s;--fa:${i % 2 ? 5 : -5}px" class="look`;
});
add("hero", "Hero collage", "A centred Instrument Sans headline with one italic word, a spinning text ring with a play button on the left and two portrait avatars with a plus on the right, over a five-column collage of illustrated plates: tall ones with folder-tab notches, short ones carrying status chips, a dotted burst and a full-width call to action in the middle column. The cards float gently out of phase.",
  HERO_STATIC, { js: true, defs: true });

add("scene", "Night scene", "A full illustrated night scene of the house, drawn in SVG: sky and moon, lit windows, trees, the drive and sensor rings around the home, under a dark gradient with a headline and lead set in paper white. On the page the hero's centre card floods open into it.",
  `<div class="demo-pad">${el('<div class="flood"')}</div>`, { defs: true });

add("intro", "Quote & feature", "A small testimonial (a quote mark, a 500-weight quote and a highlighted signature) beside a feature link: a big light numeral, a muted label, a ring button and a title that takes the marker highlight on hover.",
  asDiv(el('<section id="intro"')), { defs: true });

// The folder tab offsets, set by the page's script at boot
const nFolders = (COLL.match(/<article class="folder /g) || []).length;
let folder = 0;
const FOLDERS = COLL.replace(/<article class="folder /g, () => {
  const i = folder++;
  return `<article style="--i:${i};--p:${nFolders > 1 ? (i / (nFolders - 1)).toFixed(3) : 0}" class="folder `;
});
add("folders", "Service folders", "Coloured folders that stack as you scroll (each sticks one tab-height lower than the last): a tab that slides from left to right across the stack with inverted corners, then a body with a large lead, a huge light numeral and a meta line beside an illustrated plate carrying a frosted live-status card. Tones: ember, sky, sage, amber, pine.",
  asDiv(FOLDERS).replace(/^<div[^>]*>\s*<div class="wrap sec-head">[\s\S]*?<\/div>\s*<\/div>\s*(<div class="wrap folders)/, '<div class="coll">\n    $1'), { defs: true });

// The arch and the tab sides, set by the page's script at boot
const RANGE = el('<section id="range"');
const nPlates = (RANGE.match(/<li class="plate/g) || []).length, mid = (nPlates - 1) / 2;
let plate = 0;
const PLATES = RANGE.replace(/<li class="plate([^"]*)">([\s\S]*?)<figure class="plate__card"/g, (m, cls, between) => {
  const i = plate++;
  const arch = mid ? (1 - Math.abs(i - mid) / mid).toFixed(3) : 0;
  const tab = mid && i !== mid ? (i < mid ? " tab-l" : " tab-r") : "";
  return `<li class="plate${cls}" style="--arch:${arch}">${between}<figure class="plate__card${tab}"`;
});
add("plates", "System plates", "A row of tall coloured plates that rise in an arch toward the middle, the outer ones notched toward the centre. Each holds an illustration over a solid caption band with the system's name and a count. Two columns on phones, the odd one out spanning both.",
  asDiv(PLATES), { defs: true });

add("gallery", "Room gallery", "A centred display headline and lead over three offset columns of illustrated shots (landscape, portrait and tall), some notched, each with a two-part caption: what was caught and what it saved.",
  asDiv(el('<section id="lookbook"')), { defs: true });

add("process", "Assistant chat & steps", "A night plate holding the assistant's conversation: frosted AI bubbles with an orb label, amber replies from the owner, a quote card and typing dots. Below it, steps on a rule with ember dots that run across on desktop and down on phones.",
  asDiv(el('<section id="process"')), { defs: true, js: true });

// The bar widths, set by the page's script at boot
const FACTS = asDiv(el('<section id="materials"')).replace(/<li class="bar([^"]*)"([^>]*)>([\s\S]*?)<\/li>/g, (all, cls, attrs, inner) => {
  const v = parseFloat((/class="bar__value">([\d.]+)/.exec(inner) || [])[1]);
  return isNaN(v) ? all : `<li class="bar${cls}"${attrs}>${inner.replace('<span class="bar__fill"', `<span class="bar__fill" style="width:${v}%"`)}</li>`;
});
add("facts", "Figures & bars", "On the soft band: a heading, a lead and big light figures over a rule, beside labelled bars in the five tones whose widths are their values.",
  FACTS);

add("team", "Team portraits", "Portrait cards with an illustrated person (drawn in SVG with gradients and a soft rim light) rising into a notched tone plate, a name in 600 and a muted role.",
  asDiv(el('<section id="team"')), { defs: true });

add("voices", "Quote & reviews", "A large 600-weight pull quote with a quote mark and a highlighted signature, then soft review cards with ember stars, a short quote and a signature. The cards loop sideways while on screen and pause on hover or focus; without motion they wrap.",
  asDiv(el('<section id="voices"')), { js: true });

add("pricing", "Plans", "A section head with the billing toggle, then three soft plans that align to the bottom: name, a big light price with its period, a line, a dotted list and a button. The chosen plan is pine-dark with an amber glow, amber dots and a tab on its top-left corner. The toggle swaps every price and period from data-hy-monthly and data-hy-yearly.",
  asDiv(PRICING), { js: true });

add("faq", "FAQ", "A sticky head beside native details rows: the question in 600 with a ring button that fills on hover and turns its plus into a minus when open, under an ink rule.",
  asDiv(el('<section id="faq"')));

add("contact", "App panel", "A big headline with an italic phrase, a highlighted email address, a definition list and two buttons, beside an amber plate holding a tilted phone: a polished metal frame and a cream screen with a greeting, an ink home-score card, four system tiles and a booked task.",
  asDiv(el('<section id="contact"')), { defs: true });

add("footer", "Footer", "A dark pine-black footer with an amber glow and grain: a frosted call-to-action card with the AI orb and two store buttons, a five-column grid (brand with a live status pill, three link columns, a newsletter field with an amber send button), then a base row with legal links, badges and round social links.",
  el('<footer class="foot"'), { js: true, defs: true });

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// The page clips every section through main>* (dropped as shell); the components carry it themselves
const EXTRA = `
h1, h2, h3, h4, h5, h6 { font-family: inherit; }
.hero, .intro, .coll, .range, .lookbook, .process, .facts, .team, .voices, .pricing, .faq, .contact { position: relative; overflow-x: clip; }
.hdr { position: relative; }
.hero { padding-top: 0; }
.demo-pad { padding: clamp(28px, 4vw, 56px) clamp(16px, 4vw, 56px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }
.demo-row + .demo-row { margin-top: 24px; }
.demo-gap { height: 22px; }
.demo-sign { margin-top: 8px; }
.flood { margin: 0 auto; }
.tiles { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--hy-gap); }
.tile-wrap { margin: 0; min-width: 0; }
.tile { position: relative; overflow: hidden; aspect-ratio: 4 / 5; border-radius: var(--hy-r); --lr: var(--hy-r); --t: 16px; --tw: 56%; --s: 13px; --fs: 12px; background: var(--hy-soft); }
.tile .art > .ico { --s: 66%; }
.tile-wrap figcaption { margin-top: 10px; font-size: var(--hy-micro); font-weight: 500; color: var(--hy-muted); }
.voices__track.is-running { animation: marquee var(--hy-marquee, 60s) linear infinite; }
.voices__row:hover .voices__track.is-running, .voices__row:focus-within .voices__track.is-running, .voices__row.is-off .voices__track.is-running { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (max-width: 760px) {
.tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "hy" && !m[1].startsWith("hy-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("hy-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["is-open", "is-running", "is-off", "is-still"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["pulse", "floaty", "spin", "blink", "breathe", "marquee"];
const ATTRS = ["marquee", "toggle", "period", "monthly", "yearly", "news", "label-open", "label-close"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "hy", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .hy itself, or :where(.hy) in front
const ROOTED = /(^|[\s,(>+~])\.hy(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.hy) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. The sprite ───────────────────────────────────────────────────── */
const SPRITE = sliceEl(page, '<svg width="0" height="0"', BODY).html;
const DEFS = unhook(SPRITE).replace(/^<svg /, '<svg id="hy-defs" ');

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Hearthly components, no libraries. The header menu, billing toggle and
     newsletter answer clicks and submits; the review marquee runs only while
     on screen, and the hero's floating loops pause when it leaves the screen.
     With prefers-reduced-motion nothing moves and every component is complete. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  function seen(el, fn) {
    if (!window.IntersectionObserver) return;
    new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }).observe(el);
  }

  /* Marquee: clone the cards once, then loop at a steady 55px/s while visible */
  function marquee(row) {
    var track = row.firstElementChild;
    if (!track || !track.children.length) return;
    [].slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      each(c, 'a, button', function (el) { el.setAttribute('tabindex', '-1'); });
      track.appendChild(c);
    });
    track.classList.add('hy-is-running');
    row.style.setProperty('--hy-marquee', Math.max(20, track.scrollWidth / 2 / 55) + 's');
    seen(row, function (on) { row.classList.toggle('hy-is-off', !on); });
  }

  function init(scope) {
    each(scope, '.hy-hero', function (el) { if (el._hy) return; el._hy = true; seen(el, function (on) { el.classList.toggle('hy-is-still', !on); }); });
    if (reduce) return;
    each(scope, '[data-hy-marquee]', function (el) { if (el._hy) return; el._hy = true; marquee(el); });
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

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.hy')) return;

    /* Header: the burger opens the links as a sheet and swaps its label; a link closes it */
    var menu = t.closest('.hy-menu-btn');
    if (menu) {
      var hdr = menu.closest('.hy-hdr'), nav = hdr && hdr.querySelector('.hy-nav');
      var open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', menu.getAttribute(open ? 'data-hy-label-close' : 'data-hy-label-open') || '');
      if (nav) nav.classList.toggle('hy-is-open', open);
      return;
    }
    var navLink = t.closest('.hy-nav.hy-is-open a');
    if (navLink) {
      var h = navLink.closest('.hy-hdr'), b = h && h.querySelector('.hy-menu-btn');
      navLink.closest('.hy-nav').classList.remove('hy-is-open');
      if (b) { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', b.getAttribute('data-hy-label-open') || ''); }
    }

    /* Billing toggle: every element carrying both periods swaps its text */
    var opt = t.closest('[data-hy-period]');
    if (opt && opt.closest('[data-hy-toggle]')) {
      var period = opt.getAttribute('data-hy-period'), scope = opt.closest('.hy-pricing') || document;
      each(opt.closest('[data-hy-toggle]'), '[data-hy-period]', function (b) { b.setAttribute('aria-pressed', String(b === opt)); });
      each(scope, '[data-hy-' + period + ']', function (el) { el.textContent = el.getAttribute('data-hy-' + period); });
      return;
    }

    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* Newsletter: a valid address gets the thank-you line; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('[data-hy-news]');
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector('input'), ok = form.querySelector('.hy-news__ok');
    if (!input.value || !input.checkValidity()) { if (ok) ok.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    if (ok) ok.textContent = 'Thanks — your first check-in arrives next month.';
    input.value = '';
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const logo = prefixMarkup(unhook(piece(nav, '<a class="logo"')));
const CHROME = `
body{margin:0;background:var(--hy-bg)}
.sp-top{padding:22px clamp(16px,4vw,56px) 72px;color:var(--hy-ink)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:1px solid var(--hy-line)}
.sp-meta>span{font-size:var(--hy-label);font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--hy-muted)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px 48px;align-items:end;margin-top:clamp(40px,7vw,96px)}
.sp-hero h1{margin:0;font-family:var(--hy-font-sans);font-size:clamp(48px,7.4vw,112px);font-weight:700;line-height:1;letter-spacing:-.04em}
.sp-hero h1 em{font-family:var(--hy-font-serif);font-style:italic;font-weight:400;letter-spacing:-.01em}
.sp-hero p{margin:0;max-width:46ch;font-size:var(--hy-lead);line-height:1.55;color:var(--hy-muted)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:24px}
.sp-swatches i{display:block;height:52px;border-radius:var(--hy-r);box-shadow:inset 0 0 0 1px var(--hy-line)}
.sp-main{padding:0 clamp(16px,4vw,56px) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-family:var(--hy-font-sans);font-size:clamp(28px,2.8vw,40px);font-weight:700;line-height:1.02;letter-spacing:-.035em;color:var(--hy-ink)}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;font-size:var(--hy-label);font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--hy-muted)}
.sp-label::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--hy-ember);box-shadow:0 0 0 4px color-mix(in oklab,var(--hy-ember) 22%,transparent)}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.55;color:var(--hy-muted)}
.sp-demo{--hy-sec:clamp(56px,6vw,96px);--hy-pad:clamp(16px,4vw,56px);position:relative;border-radius:var(--hy-r-card);overflow:clip;background:var(--hy-bg);box-shadow:0 0 0 1px var(--hy-line)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${logo}<span>Design system · hearthly@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Warm, illustrated and <em>quietly</em> clever.</h1>
<div>
<p>A friendly home-care language: warm paper and ink, five soft tones (ember, sage, amber, sky, pine), Instrument Sans with one serif italic word per heading, a highlighter marker for links and signatures, folder-tab notches on every card, and illustrations drawn in code from one SVG sprite. Extracted from the Hearthly AI Home Care page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--hy-ember" style="background:var(--hy-ember)"></i><i title="--hy-sage" style="background:var(--hy-sage)"></i><i title="--hy-amber" style="background:var(--hy-amber)"></i><i title="--hy-sky" style="background:var(--hy-sky)"></i><i title="--hy-pine" style="background:var(--hy-pine)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Hearthly",
  slug: "hearthly",
  version: VERSION,
  prefix: "hy",
  rootClass: "hy",
  labelClass: "sp-label",
  script: "scripts/systems/hearthly.mjs",
  source: SOURCE,
  metaDescription: "The Hearthly design system: tokens and working components extracted from the Hearthly AI Home Care page.",
  defsNote: "the illustration sprite (house, thermostat, drop, charger, leaf, shield, wrench, purifier, orb, spark, logo) and its filters, patterns and gradients (ids under hy-)",
  jsNote: "the header menu, the billing toggle, the review marquee, the hero's off-screen pause and the newsletter form",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "hearthly", prefix: "hy", rootClass: "hy", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn--line", "link", "ibtn", "art", "ico", "look", "folder", "plate", "shot", "chip", "plan", "review", "qa", "wrap", "sec-head", "foot"] });
