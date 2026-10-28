// Extracts the Corvane design system from its private equity page.
//
//   node scripts/systems/corvane.mjs
//
// Reads public/demos/corvane-capital.html (never edits it) and writes
// public/systems/corvane/ (specimen.html, tokens.css, corvane.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system drops
// the GSAP machinery (the pinned hero and principles, the sticky strategy
// stage, the process fill, the cursor) and keeps every section's static form,
// which is what the page shows without GSAP. Every picture on the page is drawn
// by its script at boot (the five strategy visuals, the about chart, the eight
// portraits, the office tiles, the insight thumbnails and the portfolio
// glyphs): this script runs those same generators, sliced out of the page, and
// bakes their SVG into the markup, so each component is complete as is. What
// has to stay live (the topo ridgeline canvas, the office clocks, the gross /
// net switch, the menu, the chart draw-in, the portfolio marquee and the form)
// is in the component script.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/corvane-capital.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300..600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">';
const GRAIN = /body::after\{[^}]*background-image:(url\("data:image\/svg\+xml[^"]+"\))/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Corvane · corvane@${VERSION}
   Extracted from https://instalanding.ai/demos/corvane-capital.html
   Fonts (Google Fonts): Instrument Serif 400 + italic (display), Inter Tight 300-600 (text), JetBrains Mono 400-500 (labels)
   Tones: every data-cv-tone (dark, ivory, bone, gold) re-points the four "Color · tone" tokens; these are the dark defaults */
:root {
  /* Color · core */
  --cv-ink: #0A0B0D;
  --cv-ink-2: #111317;
  --cv-ivory: #EEEAE1;
  --cv-bone: #E3DDD1;
  --cv-gold: #C6A15B;
  --cv-gold-hi: #E6CC93;
  --cv-champ: #BFA06A;
  --cv-bronze: #8E6B2B;
  --cv-muted: #7F838A;

  /* Color · status */
  --cv-live: #3C8C5A;

  /* Color · tone */
  --cv-rule: rgba(238,234,225,.09);
  --cv-soft: rgba(238,234,225,.56);
  --cv-acc: var(--cv-gold);
  --cv-chip: rgba(238,234,225,.06);

  /* Type · families */
  --cv-font-display: "Instrument Serif", Georgia, serif;
  --cv-font-text: "Inter Tight", system-ui, sans-serif;
  --cv-font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Type · scale */
  --cv-index: clamp(3rem, 8vw, 8.4rem);
  --cv-figure: clamp(3.8rem, 7.4vw, 7rem);
  --cv-closing: clamp(2.7rem, 5.8vw, 5.6rem);
  --cv-display: clamp(2.5rem, 5.2vw, 4.8rem);
  --cv-statement: clamp(2.2rem, 4.6vw, 4.4rem);
  --cv-stat: clamp(2.6rem, 4.2vw, 4rem);
  --cv-quote: clamp(2.1rem, 3.9vw, 3.8rem);
  --cv-aim: clamp(2.6rem, 3.6vw, 3.6rem);
  --cv-title: clamp(2rem, 3.3vw, 3.2rem);
  --cv-step: clamp(1.9rem, 3vw, 2.8rem);
  --cv-ledger: clamp(1.5rem, 2.2vw, 2rem);
  --cv-h3: clamp(1.4rem, 2vw, 1.8rem);
  --cv-lead: clamp(1.08rem, 1.3vw, 1.26rem);
  --cv-body: 16px;
  --cv-label: .7rem;
  --cv-label-sm: .66rem;
  --cv-micro: .62rem;

  /* Shape · radii */
  --cv-r: 2px;

  /* Shape · borders */
  --cv-hairline: 1px;
  --cv-bar: 2px;

  /* Depth · grain and shade */
  --cv-grain: ${GRAIN};
  --cv-shade: linear-gradient(to top, rgba(10,11,13,.85), transparent);
  --cv-shadow-card: 0 1px 0 rgba(10,11,13,.04);

  /* Motion · easing */
  --cv-ease: cubic-bezier(.7,0,.2,1);

  /* Motion · durations */
  --cv-dur-quick: .35s;
  --cv-dur: .4s;
  --cv-dur-fill: .45s;
  --cv-dur-tone: .5s;
  --cv-dur-wipe: .55s;
  --cv-dur-sheet: .6s;
  --cv-dur-pass: .7s;
  --cv-dur-slow: 1.4s;

  /* Space · layout */
  --cv-pad: clamp(16px, 2.5vw, 32px);
  --cv-cell: clamp(12px, 1.3vw, 18px);
  --cv-hdr: 72px;
  --cv-sp: clamp(104px, 12vw, 192px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--f-display -> --cv-font-display)
const VARS = { "f-display": "font-display", "f-text": "font-text", "f-mono": "font-mono" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("cv-") ? m : `--cv-${VARS[n] ?? n}`));
const HEX = { "#0a0b0d": "ink", "#111317": "ink-2", "#eeeae1": "ivory", "#e3ddd1": "bone", "#c6a15b": "gold", "#e6cc93": "gold-hi", "#bfa06a": "champ", "#8e6b2b": "bronze", "#7f838a": "muted", "#3c8c5a": "live" };
const esc = (v) => v.replace(/[().,]/g, "\\$&");
const size = (v, tok) => [new RegExp(esc(v), "g"), `var(--cv-${tok})`];
const dur = (v, tok) => [new RegExp(` ${esc(v)} var\\(--cv-ease\\)`, "g"), ` var(--cv-${tok}) var(--cv-ease)`];
const SWAPS = [
  size("clamp(3rem,8vw,8.4rem)", "index"), size("clamp(3.8rem,7.4vw,7rem)", "figure"), size("clamp(2.7rem,5.8vw,5.6rem)", "closing"),
  size("clamp(2.5rem,5.2vw,4.8rem)", "display"), size("clamp(2.2rem,4.6vw,4.4rem)", "statement"), size("clamp(2.6rem,4.2vw,4rem)", "stat"),
  size("clamp(2.1rem,3.9vw,3.8rem)", "quote"), size("clamp(2.6rem,3.6vw,3.6rem)", "aim"), size("clamp(2rem,3.3vw,3.2rem)", "title"),
  size("clamp(1.9rem,3vw,2.8rem)", "step"), size("clamp(1.5rem,2.2vw,2rem)", "ledger"), size("clamp(1.4rem,2vw,1.8rem)", "h3"),
  size("clamp(1.08rem,1.3vw,1.26rem)", "lead"),
  [/font:400 16px\/1\.5/g, "font:400 var(--cv-body)/1.5"],
  [/(font:\d00 )\.7rem\//g, "$1var(--cv-label)/"],
  [/(font:\d00 )\.66rem\//g, "$1var(--cv-label-sm)/"],
  [/(font:\d00 )\.62rem\//g, "$1var(--cv-micro)/"],
  [/border-(top|bottom|left|right|inline):1px solid/g, "border-$1:var(--cv-hairline) solid"],
  [/inset 0 0 0 1px/g, "inset 0 0 0 var(--cv-hairline)"],
  // The ruled field behind every sheet and the footer
  [/\/1px 100% no-repeat/g, "/var(--cv-hairline) 100% no-repeat"],
  [/height:2px;background:var\(--cv-rule\)/g, "height:var(--cv-bar);background:var(--cv-rule)"],
  [/background:linear-gradient\(to top,rgba\(10,11,13,\.85\),transparent\)/g, "background:var(--cv-shade)"],
  [/box-shadow:0 1px 0 rgba\(10,11,13,\.04\)/g, "box-shadow:var(--cv-shadow-card)"],
  dur(".35s", "dur-quick"), dur(".4s", "dur"), dur(".45s", "dur-fill"), dur(".5s", "dur-tone"), dur(".55s", "dur-wipe"),
  dur(".6s", "dur-sheet"), dur(".7s", "dur-pass"), dur("1.4s", "dur-slow"),
];

/* ── 3. Component CSS: the page's one <style>, minus the GSAP machinery ── */
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
    if (sel[i] === "(" || sel[i] === "[") depth++;
    else if (sel[i] === ")" || sel[i] === "]") depth--;
    else if (sel[i] === "," && depth === 0) { out.push(sel.slice(start, i).trim()); start = i + 1; }
  }
  out.push(sel.slice(start).trim());
  return out.filter(Boolean);
}
// Page-only parts: the document shell, its fixed grain and cursor, and every
// state GSAP sets (pinned scenes, the sticky stage, the process fill). The
// portfolio marquee (.vc-row.is-live) stays: the component script runs it on CSS.
const DROP = /^(html|body::after)$|cursor|has-stage|svc-frame|svc-stage|svc-count|hero-stage|stage-hud|stage-shade|pr-mark|pr-progress|pc-fill|is-on\b/;
const isLive = (s) => s.includes(".is-live") && !s.startsWith(".vc-row.is-live");
// What survives of .motion: the about chart's draw-in, under a class the component script sets
const MOTION = { ".motion .draw": ".about-viz.is-armed .draw", ".motion .about-viz .fade-in": ".about-viz.is-armed .fade-in" };
function scopeSelector(sel) {
  if (sel === "*") return ":where(.cv, .cv *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.cv, .cv *)${sel.slice(1)}`;
  if (sel === "body" || sel === ":root") return ".cv";
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
    // The token line itself (the system's tokens replace it)
    if (prelude === ":root" && body.includes("--ink:")) return "";
    const parts = splitSelectors(prelude)
      .map((s) => (s.startsWith(".motion") ? MOTION[s] ?? null : s))
      .filter((s) => s && !DROP.test(s) && !isLive(s))
      .map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
// Sections pick their tone by data-cv-tone, so a host's own data-tone is never touched
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, ""))).replace(/\[data-tone/g, "[data-cv-tone");

/* ── 4. The page's own picture generators, run here ──────────────────── */
// Sliced from the page's script: the shared helpers and every generator up to the hero canvas.
const SCRIPT = page.slice(page.indexOf("<script>\n(()=>{"));
const GEN = SCRIPT.slice(SCRIPT.indexOf("const rng="), SCRIPT.indexOf("/* ---------- hero canvas"));
if (!GEN.includes("const VIZ=") || !GEN.includes("const OFF=")) throw new Error("generators not found");
const JOBS = [];
new Function("init", "$$", "setInterval", "IntersectionObserver", GEN)(
  (sel, fn) => JOBS.push([sel, fn]),
  () => [], // the page's clock list: the component script keeps the clocks live instead
  () => 0,
  class { observe() {} disconnect() {} },
);
const attrsOf = (tag) => Object.fromEntries([...tag.matchAll(/ ([\w-]+)(?:="([^"]*)")?/g)].map((m) => [m[1], m[2] ?? ""]));
const matches = (sel, tagName, attrs) => {
  const m = /^(\w+)?(?:\.([\w-]+))?(?:\[([\w-]+)\])?$/.exec(sel);
  if (!m) return false;
  if (m[1] && m[1] !== tagName) return false;
  if (m[2] && !(attrs.class || "").split(/\s+/).includes(m[2])) return false;
  if (m[3] && !(m[3] in attrs)) return false;
  return true;
};
/** Every element a generator targets gets the SVG the page would draw into it at boot. */
function bake(html) {
  let out = "", i = 0;
  const re = /<(figure|svg)\b[^>]*>/g;
  for (let m; (m = re.exec(html)); ) {
    const attrs = attrsOf(m[0]);
    const job = JOBS.find(([sel]) => matches(sel, m[1], attrs));
    if (!job) continue;
    const { html: whole, end } = sliceEl(html, m[0], m.index);
    const inner = whole.slice(m[0].length, whole.length - `</${m[1]}>`.length);
    const dataset = {};
    for (const [k, v] of Object.entries(attrs)) if (k.startsWith("data-")) dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
    const fake = { dataset, innerHTML: null, added: {}, pre: "", classList: { add() {} },
      setAttribute(k, v) { this.added[k] = v; }, insertAdjacentHTML(_, h) { this.pre += h; } };
    job[1](fake);
    const extra = Object.entries(fake.added).filter(([k]) => !(k in attrs)).map(([k, v]) => ` ${k}="${v}"`).join("");
    out += html.slice(i, m.index) + m[0].replace(/>$/, `${extra}>`) + fake.pre + (fake.innerHTML ?? inner) + `</${m[1]}>`;
    i = end;
    re.lastIndex = end;
  }
  return out + html.slice(i);
}

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; every other id (the menu, the portrait
// gradients) moves under cv- with everything that points at it
const ANCHORS = "hero|about|strategy|principles|process|team|portfolio|offices|sectors|criteria|record|faq|insights|contact|site-footer";
const HOOKS = "section|kind|split|reveal|rule|count|dec|pre|suf|shutter|words|depth|drift|rise|crit|wipe|thumb|viz|name|i|office|glyph|loop";
const unhook = (html) => html
  .replace(/<canvas id="topo"/g, "<canvas")
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!cv-)([^"]+)"/g, ' id="cv-$1"')
  .replace(/ aria-controls="(?!cv-)([^"]+)"/g, ' aria-controls="cv-$1"')
  .replace(/(href|xlink:href)="#(?!cv-)([^"]+)"/g, '$1="#cv-$2"')
  .replace(/url\(#(?!cv-)([^)]+)\)/g, "url(#cv-$1)");
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");
const drop = (html, marker) => { const p = sliceEl(html, marker); return html.slice(0, html.indexOf(marker)) + html.slice(p.end); };

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(bake(markup)), ...opts });

const HDR = el('<header class="hdr"');
add("nav", "Header", "A ruled bar on the same four columns as the page: the brand (a three-stroke mark with one gold stroke beside the name in Instrument Serif) and a mono tagline, six links that redraw their underline on hover, then an LP portal cell and a gold Contact cell that wipes ivory from below. Under 900px the links fold into a full-screen ink menu set in the serif, behind a plus button that swaps its label.",
  `${HDR}\n${el('<div class="menu"')}`, { js: true });

const HERO = el('<section class="hero sheet"');
const PROCESS = el('<section class="process sheet"');
const LEDGER = el('<section class="ledger-sec sheet"');
const FOOTER = el('<footer class="ftr"');
const btn = piece(HERO, '<a class="btn"');
const line = piece(PROCESS, '<a class="btn btn-line"');
const link = piece(HERO, '<a class="link"');
const top = piece(FOOTER, '<a class="ibtn ftr-top"').replace(' ftr-top', "");
add("buttons", "Buttons & links", "Buttons are square-cornered (2px) in Inter Tight 500 with a corner tick: gold on dark, ink on the light tones. On hover two half-height bands wipe in from opposite sides. The line button is a hairline outline. Links carry a 1px underline that runs out and back in on hover. Icon buttons are 44px hairline squares that fill gold from below. The gross / net switch is a chip group with an ink pressed state.",
  `<div class="demo-pad" data-tone="dark">
<div class="demo-row">${btn}${line}${link}${top}</div>
</div>
<div class="demo-pad" data-tone="ivory">
<div class="demo-row">${btn}${line}${link}${piece(LEDGER, '<div class="toggle"')}</div>
</div>`, { js: true });

const tone = (t, head) => `<div class="sheet" data-tone="${t}">
<p class="demo-tone mono">data-cv-tone="${t}"</p>
${head}
</div>`;
add("tones", "Tones, rules & headings", "Every section is a .cv-sheet that draws the four-column ruled field behind itself (1px rules at 0, 25, 50, 75 and 100%; two columns under 760px) and sets data-cv-tone: dark (ink), ivory, bone or gold (champagne). The tone re-points --cv-rule, --cv-soft and --cv-acc, so the same heading reads on all four. Headings are Instrument Serif 400 with one italic phrase in the accent; eyebrows are JetBrains Mono caps behind a short accent rule.",
  `<div class="demo-tones">
${tone("dark", el('<div class="grid cr-head">'))}
${tone("ivory", el('<div class="grid svc-head">'))}
${tone("bone", el('<div class="grid sc-head">'))}
${tone("gold", `<div class="grid">${el('<div class="pr-head">')}</div>`)}
</div>`);

add("hero", "Hero & topo window", "The display word set as large as its three columns allow (font-size from --cv-len, the character count) in Instrument Serif with one gold italic letter, a mono stat column, a window of 46 ridgelines drawn live on a canvas (one gold line in eleven) with mono HUD corners, a light lead with a button and a link, and the fund figure in gold-hi. A serif statement closes it.",
  asDiv(drop(HERO, '<div class="hero-stage"')), { js: true });

add("about", "Firm chart & figures", "A two-column head, then a framed SVG chart (a revenue index from entry against a public benchmark: the gold line draws in, the area and labels fade up once on screen) beside a lead and a caption, over four huge serif figures in gold-hi, each under a hairline rule.",
  asDiv(el('<section class="about sheet"')), { js: true });

add("strategy", "Strategy theses", "On ivory: a head, then one row per thesis on the ruled grid: a framed generated visual on the left two columns (stacked layers, a node mesh with gold pulses, a scanning perimeter, settlement rails, a pulsing data field), and on the right a mono index, a serif title, muted copy and chips with a plus glyph. One column under 1024px.",
  asDiv(drop(el('<section class="services sheet"'), '<div class="svc-stage"')));

add("principles", "Principles field", "The champagne field (data-cv-tone=\"gold\"): ink text, darker rules and ink as the accent. A head on two columns, then six numbered principles in Roman numerals, the title on the left half and the reason on the right, each under a hairline.",
  asDiv(drop(drop(el('<section class="principles"'), '<div class="pr-mark"'), '<div class="pr-progress"')));

add("process", "Value-creation steps", "On ivory: a head with a line button beside a ruled track of steps, each marked by an accent diamond ringed in ivory: a mono time window, a serif title and muted copy.",
  asDiv(drop(PROCESS, '<span class="pc-fill"')));

add("team", "Partner portraits", "Four-across portraits on the ruled grid, each generated from the person's name: a dark frame with a gold glow, scan lines, orbit arcs with one gold arc (they turn on hover) and a business silhouette, with mono plate labels. Then a serif name, a soft role and a footer line with a link.",
  asDiv(el('<section class="team sheet"')));

add("portfolio", "Quote & portfolio", "On bone: a big serif pull quote with an accent quote mark and a credit, then ivory cards for portfolio companies: a generated gold glyph and a serif name, a description, and a mono line with sector, year and status. The cards loop sideways while on screen and pause on hover or focus; without motion they wrap.",
  asDiv(el('<section class="voices sheet"')), { js: true });

add("offices", "Office tiles & clocks", "A staggered collage of framed office tiles, each with its own generated line drawing (a street grid, contours, scattered rings, a meridian fan, a dot field) under a dark shade: the city in serif, coordinates in mono and a live gold-hi clock for its time zone.",
  asDiv(el('<section class="gallery sheet"')), { js: true });

add("sectors", "Sector index", "On ivory: a ruled list of sectors set at index size in Instrument Serif, every other one italic, with a muted note in the last column.",
  asDiv(el('<section class="sectors sheet"')));

add("criteria", "Criteria bars", "Four criteria across the grid: a 2px bar filled in gold to --cv-fill, a mono key, a serif figure in gold-hi and a short muted line.",
  asDiv(el('<section class="criteria sheet"')));

add("ledger", "Track-record ledger", "On ivory: a head with the gross / net switch beside a ruled ledger: a mono header row, serif fund names and figures, a status dot (green while investing) and a disclosure note. The switch swaps every cell from data-cv-gross / data-cv-net; status columns hide on phones.",
  asDiv(LEDGER), { js: true });

add("faq", "FAQ", "A sticky head beside native details rows: the question in the serif with a thin plus that turns to a cross when open, an accent-free answer in soft text, and the open row easing its height where the browser allows.",
  asDiv(el('<section class="faq sheet"')));

add("insights", "Insight list", "On ivory: ruled rows across the four columns: a mono date and topic, a serif title that takes the accent on hover, and a framed generated thumbnail.",
  asDiv(el('<section class="journal sheet"')));

add("contact", "Contact form", "A serif closing headline with an italic phrase, a mono definition list of contacts, and a form on the grid: role chips that fill gold when chosen, underlined fields whose rule turns gold on focus, and a gold send button. Submitting shows the thank-you line; nothing is sent.",
  asDiv(el('<section class="contact sheet"')), { js: true });

add("footer", "Footer & wordmark", "A ruled ink footer: a serif lead with a button, three columns of links under mono heads and a back-to-top square, then the wordmark set to the full width (the mark plus the name, sized by --cv-len) and a base row of legal links.",
  FOOTER.replace(/ id="site-footer"/, ""));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
// The page's header is fixed and its hero opens below it; in a component both sit in the flow
const EXTRA = `
.hdr { position: relative; }
.hero-pin { min-height: clamp(560px, 92svh, 880px); padding-top: clamp(24px, 3vw, 40px); }
.demo-pad { padding: clamp(28px, 4vw, 56px) clamp(16px, 4vw, 56px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }
.demo-tones .sheet { --cv-sp: clamp(40px, 5vw, 72px); }
.demo-tone { margin-bottom: 18px; padding-inline: var(--cv-cell); color: var(--cv-soft); }
.vc-row.is-live .vc-track { animation: marquee var(--cv-marquee, 60s) linear infinite; }
.vc-row:hover .vc-track, .vc-row:focus-within .vc-track, .vc-row.is-off .vc-track { animation-play-state: paused; }
@keyframes marquee { to { transform: translateX(-50%); } }`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "cv" && !m[1].startsWith("cv-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("cv-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["is-open", "is-live", "is-off", "is-in", "is-armed", "is-sent"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["pass", "blink", "vfloat", "vdash", "vspin", "vpulse", "marquee"];
const ATTRS = ["tone", "tz", "basis", "gross", "net", "sent", "chart", "marquee", "label-open", "label-close"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "cv", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .cv itself, or :where(.cv) in front
const ROOTED = /(^|[\s,(>+~])\.cv(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media") || prelude.startsWith("@supports")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.cv) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Corvane components, no libraries. The topo canvas draws its 46 ridgelines
     (and drifts them while on screen), office clocks tick per time zone, the
     about chart draws in once, the portfolio row loops while visible, and the
     menu, the gross / net switch and the contact form answer clicks and
     submits. With prefers-reduced-motion nothing moves and every component is
     complete. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  function seen(el, fn, margin) {
    if (!window.IntersectionObserver) { fn(true); return null; }
    var o = new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting, o); }, { rootMargin: margin || '0px' });
    o.observe(el);
    return o;
  }
  function token(el, name, fallback) { return getComputedStyle(el).getPropertyValue(name).trim() || fallback; }

  /* Topo: the page's ridgeline field at rest (46 lines, one gold line in eleven) */
  function topo(cv) {
    var ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    var W = 0, H = 0, dpr = 1, vis = true, raf = 0, t0 = performance.now(), ink, hi, iv;
    function draw(t) {
      if (!W || !H) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1; ctx.fillStyle = ink; ctx.fillRect(0, 0, W, H);
      var cx = .52 * W, sig = Math.max(18, .14 * W), top = .22 * H, bot = .86 * H, amp = .24 * H, N = 46, st = Math.max(3, W / 240);
      for (var i = 0; i < N; i++) {
        var y0 = top + (bot - top) * i / (N - 1), path = new Path2D(), first = true;
        for (var x = -st; x <= W + st; x += st) {
          var u = (x - cx) / sig, env = Math.exp(-u * u * .5), xn = x / W;
          var n = (Math.sin(xn * 31 + i * 1.37 + t * .5) * .35 + Math.sin(xn * 71 - i * .71 - t * .8) * .18 + Math.sin(xn * 11 + i * .43 + t * .25) * .47 + 1) / 2;
          n = n * n;
          var y = y0 - env * amp * n * 1.4 - Math.sin(xn * 9 + i * .3 + t * .4) * 1.4;
          if (first) { path.moveTo(x, y); first = false; } else path.lineTo(x, y);
        }
        var fill = new Path2D(path);
        fill.lineTo(W + st, H + st); fill.lineTo(-st, H + st); fill.closePath();
        ctx.globalAlpha = 1; ctx.fillStyle = ink; ctx.fill(fill);
        var gold = i % 11 === 6;
        ctx.lineWidth = gold ? 1.3 : 1;
        ctx.strokeStyle = gold ? hi : iv;
        ctx.globalAlpha = gold ? .95 : .14 + .42 * i / N;
        ctx.stroke(path);
      }
      ctx.globalAlpha = 1;
    }
    function frame() { raf = 0; draw(reduce ? 0 : (performance.now() - t0) / 1000); if (!reduce && vis) raf = requestAnimationFrame(frame); }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    function fit() {
      var b = cv.parentElement.getBoundingClientRect();
      W = b.width; H = b.height; dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
      ink = token(cv, '--cv-ink', '#0A0B0D'); hi = token(cv, '--cv-gold-hi', '#E6CC93'); iv = token(cv, '--cv-ivory', '#EEEAE1');
      kick();
    }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(cv.parentElement);
    fit();
    seen(cv.parentElement, function (on) { vis = on; if (on) kick(); });
  }

  /* Office clocks: one shared tick for every [data-cv-tz] */
  function tick() {
    var now = new Date();
    each(document, '.cv [data-cv-tz]', function (c) {
      try { c.textContent = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: c.getAttribute('data-cv-tz') }).format(now); } catch (e) {}
    });
  }

  /* Portfolio marquee: clone the cards once, then loop at a steady 34px/s while visible */
  function marquee(row) {
    var track = row.firstElementChild;
    if (!track || !track.children.length) return;
    [].slice.call(track.children).forEach(function (li) {
      var c = li.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      each(c, 'a, button', function (el) { el.setAttribute('tabindex', '-1'); });
      track.appendChild(c);
    });
    row.classList.add('cv-is-live');
    row.style.setProperty('--cv-marquee', Math.max(20, track.scrollWidth / 2 / 34) + 's');
    seen(row, function (on) { row.classList.toggle('cv-is-off', !on); });
  }

  function init(scope) {
    each(scope, '.cv-hero-window canvas', function (el) { if (el._cv) return; el._cv = true; topo(el); });
    each(scope, '[data-cv-chart]', function (el) {
      if (el._cv || reduce) return;
      el._cv = true;
      el.classList.add('cv-is-armed');
      seen(el, function (on, o) { if (!on) return; el.classList.add('cv-is-in'); if (o) o.disconnect(); }, '0px 0px -15% 0px');
    });
    if (reduce) return;
    each(scope, '[data-cv-marquee]', function (el) { if (el._cv) return; el._cv = true; marquee(el); });
  }
  init(document);
  tick();
  setInterval(tick, 1000);
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; init(document); tick(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Menu: the header's plus opens the ink sheet that follows it */
  function menuOf(btn) {
    var hdr = btn.closest('.cv-hdr'), next = hdr && hdr.nextElementSibling;
    return next && next.classList.contains('cv-menu') ? next : document.getElementById(btn.getAttribute('aria-controls'));
  }
  function setMenu(btn, open) {
    var menu = menuOf(btn);
    if (menu) menu.classList.toggle('cv-is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', btn.getAttribute(open ? 'data-cv-label-close' : 'data-cv-label-open') || '');
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') each(document, '.cv-hdr-menu[aria-expanded="true"]', function (b) { setMenu(b, false); });
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.cv')) return;

    var menu = t.closest('.cv-hdr-menu');
    if (menu) { setMenu(menu, menu.getAttribute('aria-expanded') !== 'true'); return; }
    var inMenu = t.closest('.cv-menu.cv-is-open a');
    if (inMenu) each(document, '.cv-hdr-menu[aria-expanded="true"]', function (b) { setMenu(b, false); });

    /* Gross / net: every cell carrying both values in the same section swaps its text */
    var opt = t.closest('[data-cv-basis]');
    if (opt && opt.closest('.cv-toggle')) {
      var basis = opt.getAttribute('data-cv-basis'), scope = opt.closest('.cv-ledger-sec') || opt.closest('[data-cv-tone]') || document;
      each(opt.closest('.cv-toggle'), '[data-cv-basis]', function (b) { b.setAttribute('aria-pressed', String(b === opt)); });
      each(scope, '[data-cv-' + basis + ']', function (el) { el.textContent = el.getAttribute('data-cv-' + basis); });
      return;
    }

    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* Contact form: shows the thank-you line; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.cv-ct-form');
    if (!form) return;
    e.preventDefault();
    var note = form.querySelector('.cv-ct-note');
    if (note && form.getAttribute('data-cv-sent')) note.textContent = form.getAttribute('data-cv-sent');
    form.classList.add('cv-is-sent');
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const logo = prefixMarkup(unhook(piece(HDR, '<a class="hdr-brand"')));
const CHROME = `
body{margin:0;background:var(--cv-ink)}
.cv::after{content:"";position:fixed;inset:0;z-index:300;pointer-events:none;opacity:.06;background-image:var(--cv-grain)}
.sp-top{--cv-sp:0px;padding:22px var(--cv-pad) 72px}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding:0 var(--cv-cell) 16px;border-bottom:1px solid var(--cv-rule)}
.sp-meta>span{font:500 var(--cv-label)/1.3 var(--cv-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--cv-soft)}
.sp-hero{margin-top:clamp(40px,7vw,96px);row-gap:28px;align-items:end}
.sp-word{grid-column:1/4;container-type:inline-size}
.sp-word h1{margin:0}
.sp-side{grid-column:4;display:flex;flex-direction:column;gap:22px}
.sp-side p{margin:0;font-size:.95rem;line-height:1.5;color:var(--cv-soft)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
.sp-swatches i{display:block;height:44px;border-radius:var(--cv-r);box-shadow:inset 0 0 0 1px var(--cv-rule)}
.sp-main{padding:0 var(--cv-pad) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px;color:var(--cv-ivory)}
.sp-head h2{margin:10px 0 0;font:400 clamp(30px,3vw,44px)/1 var(--cv-font-display);letter-spacing:-.02em}
.sp-label{display:flex;align-items:center;gap:.8em;margin:0;font:500 var(--cv-label)/1 var(--cv-font-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--cv-soft)}
.sp-label::before{content:"";width:22px;height:1px;background:var(--cv-gold)}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.55;color:var(--cv-soft)}
.sp-demo{--cv-sp:clamp(56px,6vw,96px);position:relative;border-radius:var(--cv-r);overflow:clip;background:var(--cv-ink);box-shadow:0 0 0 1px var(--cv-rule)}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.sp-word,.sp-side{grid-column:1/-1}}
`;
const HEROHTML = `
<header class="sp-top cv-sheet" data-cv-tone="dark">
<div class="sp-meta">${logo}<span>Design system · corvane@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero cv-grid">
<div class="sp-word"><h1 class="cv-giant" style="--cv-len:7">Corva<em>n</em>e</h1></div>
<div class="sp-side">
<p>A dark, editorial private-equity language: ink and ivory with gold and champagne accents, Instrument Serif set huge with one gold italic letter, Inter Tight for text and JetBrains Mono for labels, a four-column ruled grid behind every sheet, and section tones (dark, ivory, bone, gold) that re-point the rule, soft and accent tokens. Pictures are drawn in code: a topo ridgeline canvas, data visuals, generated portraits and office tiles with live clocks. Extracted from the Corvane Capital Private Equity page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--cv-ink" style="background:var(--cv-ink)"></i><i title="--cv-ivory" style="background:var(--cv-ivory)"></i><i title="--cv-bone" style="background:var(--cv-bone)"></i><i title="--cv-gold" style="background:var(--cv-gold)"></i><i title="--cv-champ" style="background:var(--cv-champ)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Corvane",
  slug: "corvane",
  version: VERSION,
  prefix: "cv",
  rootClass: "cv",
  labelClass: "sp-label",
  script: "scripts/systems/corvane.mjs",
  source: SOURCE,
  metaDescription: "The Corvane design system: tokens and working components extracted from the Corvane Capital Private Equity page.",
  defsNote: "empty: every picture is inline SVG baked into its component (portrait gradient ids under cv-)",
  jsNote: "the topo canvas, the office clocks, the about chart draw-in, the portfolio marquee, the menu, the gross / net switch and the contact form",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: '<svg id="cv-defs" width="0" height="0" aria-hidden="true" style="position:absolute"></svg>',
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "corvane", prefix: "cv", rootClass: "cv", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-line", "link", "ibtn", "sheet", "grid", "frame", "eyebrow", "lead", "giant", "svc", "person", "vc-card", "gl", "sector", "crit", "lg-row", "fq", "post", "field", "ftr", "toggle"] });
