// Extracts the Agentic design system from its landing page.
//
//   node scripts/systems/agentic.mjs
//
// Reads public/demos/agentic-art-expo.html (never edits it) and writes
// public/systems/agentic/ (specimen.html, tokens.css, agentic.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system drops
// the scroll machinery (everything behind .motion: the pinned programme flood,
// the split title, the wordmark flight, step-node states) and keeps each
// section's static form, which is what the page shows without GSAP. The two
// .motion loops worth keeping (grain, breathing satin) become plain rules, and
// the reviews marquee runs on a CSS keyframe instead of a GSAP tween. Every
// picture is still painted by the page's own generative art engine, lifted
// whole into the component script with its data-* hooks prefixed.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/agentic-art-expo.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Host+Grotesk:wght@400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">';
const GRAIN = /\.grain\{[^}]*?background-image:(url\("data:image\/svg\+xml,[^"]+"\))/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Agentic · agentic@${VERSION}
   Extracted from https://instalanding.ai/demos/agentic-art-expo.html
   Fonts (Google Fonts): Host Grotesk 400-700 (display and text), Instrument Serif italic (one word per heading),
   JetBrains Mono 400-500 (labels) */
:root {
  /* Color · core */
  --ag-bg: #EBE6DC;
  --ag-surface: #F7F4EE;
  --ag-ink: #0D0C0B;
  --ag-panel: #0B0A09;
  --ag-on-panel: #EFE9DF;
  --ag-accent: #D7FF3F;
  --ag-ember: #FF5A2E;

  /* Color · derived */
  --ag-muted: color-mix(in oklab, var(--ag-ink) 54%, var(--ag-bg));
  --ag-line: color-mix(in oklab, var(--ag-ink) 13%, transparent);
  --ag-shade: color-mix(in oklab, var(--ag-ink) 9%, var(--ag-bg));
  --ag-panel-muted: color-mix(in oklab, var(--ag-on-panel) 56%, var(--ag-panel));
  --ag-panel-line: color-mix(in oklab, var(--ag-on-panel) 15%, transparent);

  /* Type · families */
  --ag-font-display: "Host Grotesk", system-ui, sans-serif;
  --ag-font-text: "Host Grotesk", system-ui, sans-serif;
  --ag-font-serif: "Instrument Serif", Georgia, serif;
  --ag-font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Type · scale */
  --ag-t-giant: clamp(62px, 11.2vw, 168px);
  --ag-score: clamp(72px, 8vw, 120px);
  --ag-price: clamp(44px, 4.6vw, 68px);
  --ag-brand: clamp(40px, 4.6vw, 68px);
  --ag-t-h2: clamp(32px, 4.2vw, 62px);
  --ag-row: clamp(28px, 3.6vw, 54px);
  --ag-statement: clamp(28px, 3.5vw, 52px);
  --ag-figure: clamp(34px, 3.4vw, 50px);
  --ag-card: clamp(24px, 2.3vw, 34px);
  --ag-item: clamp(26px, 2.4vw, 34px);
  --ag-lede: clamp(19px, 1.7vw, 24px);
  --ag-intro: clamp(19px, 1.6vw, 23px);
  --ag-text: 17px;
  --ag-small: 15px;
  --ag-caption: 13px;
  --ag-label: 11.5px;

  /* Shape · radii */
  --ag-r-xl: 30px;
  --ag-r-lg: 22px;
  --ag-r-md: 16px;
  --ag-r-sm: 10px;
  --ag-r-pill: 999px;

  /* Shape · borders */
  --ag-hairline: 1px;

  /* Depth · grain, glass and shadow */
  --ag-grain: ${GRAIN};
  --ag-glass: blur(8px);
  --ag-shadow-float: 0 40px 80px -40px color-mix(in oklab, var(--ag-ink) 35%, transparent);

  /* Motion · easing */
  --ag-ease: cubic-bezier(.7,0,.2,1);

  /* Motion · durations */
  --ag-dur-quick: .35s;
  --ag-dur: .4s;
  --ag-dur-text: .45s;
  --ag-dur-line: .5s;
  --ag-dur-open: .6s;
  --ag-dur-paint: 1.2s;

  /* Space · layout */
  --ag-frame: 10px;
  --ag-gutter: clamp(16px, 2.6vw, 40px);
  --ag-space: clamp(96px, 11vw, 176px);
  --ag-header: 64px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--ink -> --ag-ink)
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("ag-") ? m : `--ag-${n}`));
const esc = (v) => v.replace(/[().,]/g, "\\$&");
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--ag-${tok})`];
const dur = (v, tok) => [new RegExp(` ${esc(v)} var\\(--ag-ease\\)`, "g"), ` var(--ag-${tok}) var(--ag-ease)`];
const SWAPS = [
  fs_("clamp(72px,8vw,120px)", "score"), fs_("clamp(44px,4.6vw,68px)", "price"), fs_("clamp(40px,4.6vw,68px)", "brand"),
  fs_("clamp(28px,3.6vw,54px)", "row"), fs_("clamp(28px,3.5vw,52px)", "statement"), fs_("clamp(34px,3.4vw,50px)", "figure"),
  fs_("clamp(24px,2.3vw,34px)", "card"), fs_("clamp(26px,2.4vw,34px)", "item"), fs_("clamp(19px,1.7vw,24px)", "lede"),
  fs_("clamp(19px,1.6vw,23px)", "intro"), fs_("17px", "text"), fs_("15px", "small"), fs_("13px", "caption"), fs_("11.5px", "label"),
  [/border-top:1px solid/g, "border-top:var(--ag-hairline) solid"],
  [/border-bottom:1px solid/g, "border-bottom:var(--ag-hairline) solid"],
  [/backdrop-filter:blur\(8px\)/g, "backdrop-filter:var(--ag-glass)"],
  [/0 40px 80px -40px color-mix\(in oklab,var\(--ag-ink\) 35%,transparent\)/g, "var(--ag-shadow-float)"],
  [/background-image:url\("data:image\/svg\+xml,[^"]+"\)/g, "background-image:var(--ag-grain)"],
  dur(".35s", "dur-quick"), dur(".4s", "dur"), dur(".45s", "dur-text"), dur(".5s", "dur-line"), dur(".6s", "dur-open"), dur("1.2s", "dur-paint"),
  [/\[data-(acc-btn|acc-panel|acc-item|live)\]/g, "[data-ag-$1]"],
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
// Page-only parts: the document shell, the pinned split title and its halves, the dark copy
// of the programme stage (the flood clones it at boot), and the letter-rise split
const DROP = /^(:root|html)$|^main>section$|^\.(split|half|is-split)(?![\w-])|^\.split-(title|over)\b|^\.svc-dark\b/;
// What survives of .motion: the two loops, and the marquee under a class its own script sets
const MOTION = {
  ".motion .grain": ".grain",
  ".motion .hero-photo .hero-base": ".hero-photo .hero-base",
  ".motion .marquee": ".marquee.is-run",
  ".motion .marquee-track": ".marquee.is-run .marquee-track",
  ".motion .review": ".marquee.is-run .review",
};
function scopeSelector(sel) {
  if (sel === "*") return ":where(.ag, .ag *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.ag, .ag *)${sel.slice(1)}`;
  if (sel === "body") return ".ag";
  return sel;
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude)
      .map((s) => (s.startsWith(".motion") ? MOTION[s] ?? null : s))
      .filter((s) => s && !DROP.test(s))
      .map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCss));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's scroll hooks, section ids and anchors belong to the page, not the system
const HOOKS = "section|flight-from|flight-to|mask|speed|inner|ink|rise|fan|unfold|draw|clip|flood|split|marquee|loops|chart";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>])`, "g"), "")
  .replace(/ id="site-nav"/g, ' id="ag-site-nav"').replace(/ aria-controls="site-nav"/g, ' aria-controls="ag-site-nav"')
  .replace(/ id="(?!ag-)[^"]*"/g, "")
  .replace(/ href="#[a-z]+"/g, ' href="#"');
const piece = (html, marker) => sliceEl(html, marker).html;
// A page <section> becomes a <div> inside the specimen's own section
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const nav = el('<header class="site-header"');
add("nav", "Header", "A paper bar: the wordmark with a raised ®, five medium links that underline from the left on hover, the dates in mono and a small Get tickets pill. Under 900px a burger (two lines that cross) opens the links as a dark rounded sheet in 30px type.",
  nav, { js: true });

const HERO = el('<section id="hero"');
const WORK = el('<section id="work"');
const RESULTS = el('<section id="results"');
const CTA = el('<section id="contact"');
const PRICING = el('<section id="pricing"');
const btnDark = '<a class="btn" href="#">How it works</a>';
add("buttons", "Buttons & links", "Every button is a pill with a lime dot on its right that scales up 90x on hover and floods the button, turning the label to ink. The default is ink on paper; the light one is for dark panels; the small one sits in headers and cards. Links underline from the left on hover; .link--under keeps a 35% rule at rest. Round icon buttons hold a plus that turns into a minus when its row opens.",
  `<div class="demo-pad">
<div class="demo-row">${btnDark}<a class="btn btn--sm" href="#">Get tickets</a><a class="link" href="#">Exhibits</a><a class="link link--under" href="#">Share your visit</a><span class="icon-btn" aria-hidden="true"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path class="v" d="M7 0v14"/><path d="M0 7h14"/></svg></span></div>
</div>
<div class="demo-pad on-panel">
<div class="demo-row"><a class="btn btn--light" href="#">Enter your agent</a><a class="btn btn--light btn--sm" href="#">Read the report</a><a class="link link--under" href="#">All articles</a></div>
</div>`);

const sec = (html) => piece(html, '<div class="sec-head wrap">');
add("titles", "Titles & section heads", "Giant titles are Host Grotesk 600 at --ag-t-giant, tracking -.058em, line-height .88, ending in a round full stop drawn by .dot. One word per heading turns Instrument Serif italic (.it). A section head pairs the title (with an optional mono tag above) with a muted lede on the right; h2-sized heads end in a typed full stop instead.",
  `<div class="demo-top">
${sec(WORK)}
${sec(RESULTS)}
</div>`);

add("hero", "Hero frame", "A dark frame inset 10px with 30px corners holds a breathing satin canvas, a live particle layer, a top-and-bottom shade and moving grain. The wordmark spans the width (sized from its container: 100cqw / --ag-len * 2.1), the edition line sits right with its year in lime italic, a live pill pulses, four hairline crosshairs mark a rule, and a three-column row closes it: the h1 (second sentence muted), a numbered list and a person card.",
  asDiv(HERO), { js: true });

const ART = [["silk", "night", 7], ["chrome", "ash", 9], ["contour", "ember", 5], ["orb", "violet", 17], ["bust", "bone", 21], ["ridge", "night", 3], ["petal", "bone", 12], ["flow", "ember", 33]];
const PALS = ["night", "bone", "ember", "violet", "lime", "ash"];
add("art", "Generative art", "Every picture is painted in code: a canvas with class ag-art names its kind (data-ag-art: silk, chrome, contour, orb, bust, ridge, petal, flow), its palette (data-ag-pal: night, bone, ember, violet, lime, ash) and a seed; the same seed always paints the same image. Raster kinds compute at a fixed pixel budget and upscale; canvases paint lazily near the viewport, a slice per frame, and fade in. Below, one silk swatch per palette.",
  `<div class="demo-pad">
<div class="art-grid">
${ART.map(([k, p, s]) => `<figure class="art-tile"><canvas class="art" data-art="${k}" data-pal="${p}" data-seed="${s}" aria-hidden="true"></canvas><figcaption class="mono">${k} · ${p}</figcaption></figure>`).join("\n")}
</div>
<div class="art-pals">
${PALS.map((p, i) => `<figure class="art-pal"><canvas class="art" data-art="silk" data-pal="${p}" data-seed="${40 + i}" aria-hidden="true"></canvas><figcaption class="mono">${p}</figcaption></figure>`).join("\n")}
</div>
</div>`, { js: true });

add("person", "Person card", "A surface card with a 4:5 painted portrait (a stone bust) on the left, a role over a muted organisation, a name in display type and a small button pinned to the bottom. It sits on dark frames and on paper alike.",
  `<div class="demo-pad on-panel">${piece(HERO, '<div class="person">')}</div>`, { js: true });

add("exhibits", "Exhibit cards", "A two-column grid of works; the first spans both columns at 21:9, the rest are 5:4 (4:5 on phones). Each card is a painted canvas with a frosted mono chip naming the agent, then a row of name, kind and year. The name ends in a dot that turns ember on hover while the name fades to muted.",
  `<div class="demo-top">${piece(WORK, '<div class="work-grid wrap">')}</div>`, { js: true });

add("statement", "Statement", "A large display statement (Host Grotesk 500 at --ag-statement) with one italic phrase, beside a 3:4 painted portrait, closed by a hairline row with a signature and a button. On the page its words fade from 16% to full ink as you read.",
  asDiv(el('<section id="about"')), { js: true });

const SERVICES = asDiv(el('<section id="services"')).replace(/\s*<div class="svc-layer svc-dark" aria-hidden="true"><\/div>/, "");
add("programme", "Programme accordion", "A dark panel opens with a giant title and a muted lede, then rows of numbered items in --ag-row display type. Each row opens to a small painted image, a paragraph and outlined tag pills; one row is open at a time and the icon's plus becomes a minus. A footer row closes it with a light button.",
  SERVICES, { js: true });

add("log", "Reasoning figure", "A wide painted figure with a dark top-and-bottom shade, a caption bottom left and a frosted mono log top right: the agent's name in lime, its steps in muted text and the decisions in light. It shows the work and the thinking behind it together.",
  `<div class="demo-pad">${el('<figure class="split-photo">')}</div>`, { js: true });

add("steps", "Timeline", "Four steps on a hairline with an ink line drawn over it, each a filled node, a mono date, a display title and a muted paragraph. It runs across on desktop and down the left edge under 760px.",
  piece(el('<section id="process"'), '<div class="steps wrap">'));

add("reviews", "Review marquee", "A giant title beside a 4.9/5 score, then surface cards with a quote in 500-weight text and a round painted avatar. The row loops sideways while it is on screen and pauses on hover or focus; the copies are aria-hidden and out of the tab order. Without motion the cards wrap.",
  `<div class="demo-top">${asDiv(el('<section id="reviews"'))}</div>`, { js: true });

// The charts the page measures at boot, measured here so the component is complete without script
const STATS = asDiv(RESULTS)
  .replace(/^<div[^>]*>\s*<div class="sec-head wrap">[\s\S]*?<\/div>\s*(<div class="bento)/, '<div class="results">\n  $1')
  .replace('<circle class="ring-fg"', '<circle class="ring-fg" style="stroke-dashoffset:3"')
  .replace(/<ul class="bars"([^>]*)>([\s\S]*?)<\/ul>/, (all, a, inner) => {
    const vals = [...inner.matchAll(/<span class="bar-val">([\d.]+)k<\/span>/g)].map((m) => +m[1]);
    const max = Math.max(...vals);
    let i = 0;
    return `<ul class="bars"${a}>${inner.replace(/<li>/g, () => `<li style="--h:${(vals[i++] / max).toFixed(3)}">`)}</ul>`;
  });
add("stats", "Figures bento", "A bento of four tiles: a tall dark case card on a painted orb (label, brand with an italic year, a light button), a column of three big figures and an italic pull quote, a ring chart with its number inside, and a bar chart whose heights come from its labels, the last bar in ink.",
  `<div class="demo-top">${STATS}</div>`, { js: true });

add("pricing", "Tickets", "A section head with a pill switch (Visitors / Exhibitors) that swaps every plan's name, line, price and unit from data-ag-visit and data-ag-exhibit. Three plans: surface cards with a dot list, the middle one dark with a lime badge and lime dots. A note with a painted face closes the section.",
  asDiv(PRICING), { js: true });

add("press", "Press list", "A side head beside rows of year, award in display type, issuer and the work, each row topped by a 20% ink rule (drawn left to right on the page). Under 760px the issuer and work drop under the award.",
  `<div class="demo-top">${asDiv(el('<section id="recognition"'))}</div>`);

add("faq", "FAQ accordion", "A sticky side title and lede beside question rows in 600-weight display type, each with a round plus button that becomes a minus; answers open with a grid-rows transition, one at a time.",
  `<div class="demo-top">${asDiv(el('<section id="faq"'))}</div>`, { js: true });

add("journal", "Journal posts", "A head with a link, then posts: a 4:3 painted image, a mono date, a display title that fades to muted on hover and a short muted summary.",
  `<div class="demo-top">${asDiv(el('<section id="journal"'))}</div>`, { js: true });

add("cta", "Invitation panel", "A dark panel on a painted satin with a diagonal shade and grain: a giant title, a lede, two notes over hairlines and a person card on the left; on the right a surface form (name, email, a select and a message) with a full-width button that thanks inline and sends nothing.",
  asDiv(CTA), { js: true });

add("footer", "Footer", "Four columns (a big email, the address, page links, social links) over a giant wordmark sized to the width like the hero's, then a hairline row with the legal line, a mono note and a privacy link.",
  el('<footer class="site-footer"'));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// The page anchors and clips every section through main>section (dropped as shell); the components carry it themselves
const EXTRA = `
h1, h2, h3, h4, h5, h6 { font-family: inherit; }
.hero, .work, .about, .services, .process, .reviews, .results, .pricing, .recognition, .faq, .journal, .contact { position: relative; overflow-x: clip; }
.site-header { position: relative; }
@media (max-width: 900px) {
.nav { position: absolute; top: 100%; }
}
.hero { min-height: min(100svh, 820px); padding: var(--ag-frame); }
.hero-frame { inset: var(--ag-frame); }
.on-panel { background: var(--ag-panel); color: var(--ag-on-panel); }
.demo-pad { padding: clamp(28px, 4vw, 56px) var(--ag-gutter); }
.demo-top { padding-top: clamp(28px, 4vw, 56px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }
.art-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.art-tile, .art-pal { margin: 0; min-width: 0; }
.art-tile canvas { aspect-ratio: 4 / 5; height: auto; border-radius: var(--ag-r-md); background: var(--ag-shade); }
.art-tile figcaption, .art-pal figcaption { margin-top: 10px; color: var(--ag-muted); }
.art-pals { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; margin-top: 28px; padding-top: 24px; border-top: var(--ag-hairline) solid var(--ag-line); }
.art-pal canvas { aspect-ratio: 1; height: auto; border-radius: var(--ag-r-sm); background: var(--ag-shade); }
.marquee.is-run .marquee-track { animation: marquee var(--ag-marquee, 60s) linear infinite; }
.marquee.is-run:hover .marquee-track, .marquee.is-run:focus-within .marquee-track, .marquee.is-off .marquee-track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }
@media (max-width: 760px) {
.art-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.art-pals { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "ag" && !m[1].startsWith("ag-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("ag-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["is-open", "is-run", "is-off", "is-painted"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["grain", "pulse", "breathe", "marquee"];
const ATTRS = ["art", "pal", "seed", "gain", "scale", "live", "accordion", "acc-item", "acc-btn", "acc-panel", "switch", "mode", "visit", "exhibit", "sent"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "ag", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .ag itself, or :where(.ag) in front
const ROOTED = /(^|[\s,(>+~])\.ag(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.ag) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Component script ─────────────────────────────────────────────── */
// The page's art engine, whole, with its hooks moved under the prefix
const ENGINE_START = page.indexOf("const TAU=Math.PI*2");
const ENGINE_END = page.indexOf("artInit(document);\n})();", ENGINE_START);
if (ENGINE_START < 0 || ENGINE_END < 0) throw new Error("art engine not found");
let ENGINE = page.slice(ENGINE_START, ENGINE_END);
const swapJs = (from, to) => {
  if (!ENGINE.includes(from)) throw new Error("engine marker not found: " + from);
  ENGINE = ENGINE.split(from).join(to);
};
swapJs("c.dataset.art", "c.dataset.agArt");
swapJs("c.dataset.pal", "c.dataset.agPal");
swapJs("c.dataset.seed", "c.dataset.agSeed");
swapJs("c.dataset.gain", "c.dataset.agGain");
swapJs("c.dataset.scale", "c.dataset.agScale");
swapJs("hasAttribute('data-live')", "hasAttribute('data-ag-live')");
swapJs("'canvas.art'", "'canvas.ag-art'");
swapJs("classList.add('is-painted')", "classList.add('ag-is-painted')");
swapJs("window.artInit=root=>", "const artInit=root=>");

const JS = `(function () {
  'use strict';
  /* Agentic components, no libraries. The generative art engine paints every
     canvas.ag-art lazily; the header menu, accordions, ticket switch and form
     answer clicks and submits; the marquee and the live particles run only
     while on screen, and not at all with prefers-reduced-motion. */
${ENGINE}
  artInit.paint = paint;
  window.agArt = artInit;

  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }

  /* Marquee: clone the cards once, then loop at a steady 38px/s while visible */
  function marquee(box) {
    var track = box.querySelector('.ag-marquee-track');
    if (!track || reduceMotion) return;
    [].slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      each(c, 'a, button', function (el) { el.setAttribute('tabindex', '-1'); });
      track.appendChild(c);
    });
    /* Cards past the clipped box's edge are invisible to the lazy observer until they slide in,
       then pop: the avatars are small, so paint the whole track now */
    requestAnimationFrame(function () { each(track, 'canvas.ag-art', function (cv) { artInit.paint(cv); }); });
    box.classList.add('ag-is-run');
    box.style.setProperty('--ag-marquee', Math.max(20, track.scrollWidth / 2 / 38) + 's');
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { box.classList.toggle('ag-is-off', !es[es.length - 1].isIntersecting); }).observe(box);
  }

  function init(scope) {
    artInit(scope);
    each(scope, '.ag-marquee', function (el) { if (el._ag) return; el._ag = true; marquee(el); });
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
    if (!t.closest || !t.closest('.ag')) return;

    /* Header: the burger opens the links as a sheet; a link closes it */
    var menu = t.closest('.ag-menu-btn');
    if (menu) {
      var header = menu.closest('.ag-site-header'), open = !header.classList.contains('ag-is-open');
      header.classList.toggle('ag-is-open', open);
      menu.setAttribute('aria-expanded', String(open));
      return;
    }

    /* Accordion: one row open at a time */
    var btn = t.closest('[data-ag-acc-btn]');
    if (btn) {
      var acc = btn.closest('[data-ag-accordion]'), item = btn.closest('[data-ag-acc-item]');
      var opening = !item.classList.contains('ag-is-open');
      if (acc) each(acc, '[data-ag-acc-item].ag-is-open', function (o) {
        if (o === item) return;
        o.classList.remove('ag-is-open');
        var b = o.querySelector('[data-ag-acc-btn]');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('ag-is-open', opening);
      btn.setAttribute('aria-expanded', String(opening));
      return;
    }

    /* Ticket switch: every element carrying both modes swaps its text */
    var opt = t.closest('[data-ag-mode]');
    if (opt && opt.closest('[data-ag-switch]')) {
      if (opt.getAttribute('aria-pressed') === 'true') return;
      var mode = opt.getAttribute('data-ag-mode'), scope = opt.closest('.ag-pricing') || document;
      each(opt.closest('[data-ag-switch]'), '[data-ag-mode]', function (b) { b.setAttribute('aria-pressed', String(b === opt)); });
      each(scope, '[data-ag-' + mode + ']', function (el) { el.textContent = el.getAttribute('data-ag-' + mode); });
      return;
    }

    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    each(document, '.ag-site-header.ag-is-open', function (h) {
      h.classList.remove('ag-is-open');
      var b = h.querySelector('.ag-menu-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });

  /* Form: native validation, then the thank-you line; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('form[data-ag-sent]');
    if (!form) return;
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var status = form.querySelector('.ag-form-status');
    if (status) status.textContent = form.getAttribute('data-ag-sent');
    form.reset();
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const logo = prefixMarkup(unhook(piece(nav, '<a class="logo"')));
const CHROME = `
body{margin:0;background:var(--ag-bg)}
.sp-top{padding:22px var(--ag-gutter) 72px;color:var(--ag-ink)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:1px solid var(--ag-line)}
.sp-meta>span{font-family:var(--ag-font-mono);font-size:var(--ag-label);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--ag-muted)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px 48px;align-items:end;margin-top:clamp(40px,7vw,96px)}
.sp-hero h1{margin:0;font-family:var(--ag-font-display);font-size:clamp(56px,9vw,140px);font-weight:600;line-height:.86;letter-spacing:-.058em}
.sp-hero h1 em{font-family:var(--ag-font-serif);font-weight:400;letter-spacing:-.02em}
.sp-hero p{margin:0;max-width:46ch;font-size:var(--ag-text);line-height:1.5;color:var(--ag-muted)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:24px}
.sp-swatches i{display:block;height:52px;border-radius:var(--ag-r-sm);box-shadow:inset 0 0 0 1px var(--ag-line)}
.sp-main{padding:0 var(--ag-gutter) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-family:var(--ag-font-display);font-size:clamp(28px,2.8vw,40px);font-weight:600;line-height:1;letter-spacing:-.05em;color:var(--ag-ink)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font-family:var(--ag-font-mono);font-size:var(--ag-label);font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--ag-muted)}
.sp-label::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--ag-ink)}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.55;color:var(--ag-muted)}
.sp-demo{--ag-space:clamp(56px,6vw,96px);position:relative;border-radius:var(--ag-r-lg);overflow:clip;background:var(--ag-bg);box-shadow:0 0 0 1px var(--ag-line)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${logo}<span>Design system · agentic@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Paper, ink and <em>painted</em> light.</h1>
<div>
<p>An editorial event language: warm paper and near-black panels inset 10px with 30px corners, Host Grotesk set huge and tight with round full stops, one Instrument Serif italic word per heading, mono labels, one lime accent, and every picture painted in code by a seeded generative engine. Extracted from the Agentic Art Expo page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--ag-bg" style="background:var(--ag-bg)"></i><i title="--ag-ink" style="background:var(--ag-ink)"></i><i title="--ag-surface" style="background:var(--ag-surface)"></i><i title="--ag-accent" style="background:var(--ag-accent)"></i><i title="--ag-ember" style="background:var(--ag-ember)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Agentic",
  slug: "agentic",
  version: VERSION,
  prefix: "ag",
  rootClass: "ag",
  labelClass: "sp-label",
  script: "scripts/systems/agentic.mjs",
  source: SOURCE,
  metaDescription: "The Agentic design system: tokens and working components extracted from the Agentic Art Expo page.",
  defsNote: "not used: every picture is a canvas painted by the component script",
  jsNote: "the generative art engine (every canvas.ag-art), the hero's live particles, the review marquee, the header menu, both accordions, the ticket switch and the invitation form",
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
writeSystem({ slug: "agentic", prefix: "ag", rootClass: "ag", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn--light", "title", "dot", "it", "mono", "art", "person", "project", "svc-item", "plan", "review", "tile", "faq-item", "form", "field", "wrap"] });
