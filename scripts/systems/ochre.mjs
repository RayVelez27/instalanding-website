// Extracts the Ochre design system from its landing page.
//
//   node scripts/systems/ochre.mjs
//
// Reads public/demos/ochre-meditation.html (never edits it) and writes
// public/systems/ochre/ (specimen.html, tokens.css, ochre.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system
// drops the scroll machinery behind .motion (the pinned hero sweep, the moon
// window, the rising pillars, the disc that grows over the trial title) and
// keeps every section's static poster frame, which is what the page shows
// without GSAP. The ambient loops (the breathing orb and its cues, the ticker,
// the ripples, the candle) stay as CSS keyframes. The phone mockups, which the
// page fills from its SCREENS templates at boot, are filled here with those
// same templates, so the markup is complete as is; their landscapes are painted
// by the page's own scene engine, lifted whole into the component script (the
// hero's WebGL ocean is left out: its phone shows the painted ocean the page
// falls back to). Values the page's script computes at boot (the price pillar
// heights) are computed here too.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/ochre-meditation.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Reddit+Sans:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">';
const GRAIN = /body::after\{[^}]*?background-image:(url\("data:image\/svg\+xml;utf8,[^"]+"\))/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Ochre · ochre@${VERSION}
   Extracted from https://instalanding.ai/demos/ochre-meditation.html
   Fonts (Google Fonts): Reddit Sans 200-900 (everything; display set at 100-300) */
:root {
  /* Color · core */
  --oh-ink: #01262D;
  --oh-paper: #F5C279;
  --oh-sun: #EE8903;
  --oh-sage: #586354;
  --oh-khaki: #8C7D5A;
  --oh-rust: #9A4703;

  /* Color · derived */
  --oh-dim-on-ink: color-mix(in oklab, var(--oh-paper) 26%, var(--oh-ink));
  --oh-soft-on-ink: color-mix(in oklab, var(--oh-paper) 72%, var(--oh-ink));
  --oh-soft-on-paper: color-mix(in oklab, var(--oh-ink) 78%, var(--oh-paper));

  /* Type · families */
  --oh-font-display: "Reddit Sans", system-ui, sans-serif;
  --oh-font-text: "Reddit Sans", system-ui, sans-serif;

  /* Type · scale */
  --oh-numeral: clamp(110px, 14vw, 230px);
  --oh-date: clamp(96px, 12vw, 210px);
  --oh-call: clamp(60px, 10.2vw, 184px);
  --oh-display: clamp(46px, 7.4vw, 124px);
  --oh-statement: clamp(34px, 4.7vw, 78px);
  --oh-row: clamp(38px, 4.6vw, 76px);
  --oh-ticker: clamp(30px, 3.6vw, 58px);
  --oh-h3: clamp(24px, 2.3vw, 36px);
  --oh-quote: clamp(21px, 1.7vw, 27px);
  --oh-lead: clamp(18px, 1.1vw + 10px, 23px);
  --oh-text: clamp(16px, .45vw + 12px, 18px);
  --oh-button: 15px;
  --oh-meta: 13px;
  --oh-label: 12.5px;
  --oh-micro: 12px;

  /* Shape · radii */
  --oh-pill: 999px;
  --oh-r-glass: 24px;

  /* Shape · borders */
  --oh-rule: 1px;
  --oh-rule-double: 5px;

  /* Depth · grain, glass and shadow */
  --oh-grain: ${GRAIN};
  --oh-glass: blur(14px) saturate(1.5);
  --oh-shadow-card: 0 34px 60px -30px color-mix(in oklab, var(--oh-ink) 70%, transparent);
  --oh-shadow-shot: 0 34px 60px -34px color-mix(in oklab, var(--oh-ink) 75%, transparent);

  /* Motion · easing */
  --oh-ease: cubic-bezier(.2, .7, .1, 1);
  --oh-ease-breath: cubic-bezier(.45,0,.55,1);

  /* Motion · durations */
  --oh-dur-quick: .35s;
  --oh-dur: .45s;
  --oh-dur-fill: .5s;
  --oh-dur-wipe: .55s;
  --oh-dur-row: .6s;
  --oh-dur-line: .8s;
  --oh-dur-image: 1.4s;
  --oh-breath: 10s;
  --oh-tick: 46s;

  /* Space · layout */
  --oh-gut: clamp(16px, 3.4vw, 48px);
  --oh-maxw: 1520px;
  --oh-head-h: 64px;
  --oh-sec: clamp(96px, 12vw, 180px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--f-display -> --oh-font-display);
// local ones (--split, --len, --h, --R ...) move under oh- too, so a host's variables can't reach them
const VARS = { "f-display": "font-display", "f-text": "font-text" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("oh-") ? m : `--oh-${VARS[n] ?? n}`));
const esc = (v) => v.replace(/[().,+*]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--oh-${tok})`];
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--oh-${tok})`];
const dur = (v, tok) => [new RegExp(` ${esc(v)} var\\(--oh-ease\\)`, "g"), ` var(--oh-${tok}) var(--oh-ease)`];
const SWAPS = [
  val("clamp(110px, 14vw, 230px)", "numeral"), val("clamp(96px, 12vw, 210px)", "date"), val("clamp(60px, 10.2vw, 184px)", "call"),
  val("clamp(46px, 7.4vw, 124px)", "display"), val("clamp(34px, 4.7vw, 78px)", "statement"), val("clamp(38px, 4.6vw, 76px)", "row"),
  val("clamp(30px, 3.6vw, 58px)", "ticker"), val("clamp(24px, 2.3vw, 36px)", "h3"), val("clamp(21px, 1.7vw, 27px)", "quote"),
  val("clamp(18px, 1.1vw + 10px, 23px)", "lead"), val("clamp(16px, .45vw + 12px, 18px)", "text"),
  fs_("15px", "button"), fs_("13px", "meta"), fs_("12.5px", "label"), fs_("12px", "micro"),
  val("clamp(96px, 12vw, 180px)", "sec"),
  [/border-radius:24px/g, "border-radius:var(--oh-r-glass)"],
  [/(border(?:-top|-bottom)?:)1px solid/g, "$1var(--oh-rule) solid"],
  [/height:5px;/g, "height:var(--oh-rule-double);"],
  [/5px double/g, "var(--oh-rule-double) double"],
  [/-webkit-backdrop-filter:blur\(14px\) saturate\(1\.5\);backdrop-filter:blur\(14px\) saturate\(1\.5\)/g, "-webkit-backdrop-filter:var(--oh-glass);backdrop-filter:var(--oh-glass)"],
  [/box-shadow:0 34px 60px -30px color-mix\(in oklab, var\(--oh-ink\) 70%, transparent\)/g, "box-shadow:var(--oh-shadow-card)"],
  [/box-shadow:0 34px 60px -34px color-mix\(in oklab, var\(--oh-ink\) 75%, transparent\)/g, "box-shadow:var(--oh-shadow-shot)"],
  [/breathe 10s cubic-bezier\(\.45,0,\.55,1\)/g, "breathe var(--oh-breath) var(--oh-ease-breath)"],
  [/tick 46s linear/g, "tick var(--oh-tick) linear"],
  [/animation:10s linear infinite/g, "animation:var(--oh-breath) linear infinite"],
  dur(".35s", "dur-quick"), dur(".45s", "dur"), dur(".5s", "dur-fill"), dur(".55s", "dur-wipe"), dur(".6s", "dur-row"), dur(".8s", "dur-line"), dur("1.4s", "dur-image"),
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
// Page-only parts: the document shell, its fixed grain overlay, the scroll progress bar and the
// header's transparent-over-hero state (it reads the page's own <main>)
const DROP = /^(html|body::after|\.progress)$|^main ?> ?\*$|^body:has/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".oh" : null;
  if (sel === "*") return ":where(.oh, .oh *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.oh, .oh *)${sel.slice(1)}`;
  if (sel === "body") return ".oh";
  return sel;
}
function keep(css, inMedia = false) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
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
// The page opens its menu with .menu-open on <html>; the system puts .is-open on the header itself
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\.menu-open \.site-head/g, ".site-head.is-open")
  .replace(/\.menu-open /g, ".site-head.is-open ");
const base = renameVars(keep(pageRules));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; every other id (the nav, the SVG gradients and
// filters) moves under oh- with everything that points at it
const ANCHORS = "hero|about|programme|speakers|venue|schedule|tickets|gallery|voices|opencall|faq|contact";
const HOOKS = "section|kind|lines|reveal|words|drift|rule|rise|speed|fixed|price|gl|screen";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!oh-)([^"]+)"/g, ' id="oh-$1"')
  .replace(/ aria-controls="(?!oh-)([^"]+)"/g, ' aria-controls="oh-$1"')
  .replace(/(href|xlink:href)="#(?!oh-)([^"]+)"/g, '$1="#oh-$2"')
  .replace(/url\(#(?!oh-)([^)]+)\)/g, "url(#oh-$1)")
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

// The phone mockups, filled at build time by the page's own SCREENS templates and its fill line
const SCR_AT = page.indexOf("const ST='");
const SCR_END = page.indexOf("\n};", page.indexOf("const SCREENS={", SCR_AT)) + 3;
if (SCR_AT < 0 || SCR_END < 3) throw new Error("screens not found");
const SCREENS = new Function(`${page.slice(SCR_AT, SCR_END)}\nreturn SCREENS;`)();
const FILL = /p\.innerHTML=(`.*`)\}\);\n/.exec(page.slice(SCR_END))?.[1];
if (!FILL) throw new Error("phone fill not found");
const fillPhone = new Function("p", "SCREENS", `return ${FILL};`);
const phones = (html) => html.replace(/<div class="(phone[^"]*)" data-screen="(\w+)" data-scene="(\w+)"([^>]*)><\/div>/g, (_, cls, screen, scene, rest) =>
  `<div class="${cls}"${rest.replace(/ data-gl="[^"]*"/, "")}>${fillPhone({ dataset: { screen, scene } }, SCREENS)}</div>`);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<header class="site-head"');
const HERO = phones(el('<section id="hero"'));
const PROG = el('<section id="programme"');
const SPEAK = el('<section id="speakers"');
const VENUE = el('<section id="venue"');
const TICKETS = el('<section id="tickets"');
const GALLERY_RAW = el('<section id="gallery"');
const GALLERY = phones(GALLERY_RAW);
const FAQ = el('<section id="faq"');
const CONTACT = el('<section id="contact"');
const FOOT = el('<footer class="site-foot"');

add("nav", "Header", "A paper bar at 88% with a 14px blur and a hairline ink shadow: the wordmark with its orange sun mark and orbit stroke, five links in 500 and a dark teal Start free pill. Under 1020px the links fold into a full-screen teal sheet set in giant thin type, behind a two-line burger that turns into a cross.",
  NAV, { js: true });

add("buttons", "Buttons & links", "Buttons are pills in Reddit Sans 600: dark teal with paper text, sun with ink text, or paper on teal panels. On hover an opposite colour wipes in from the left and the arrow slides 4px. Text links are underlined with a 1px rule that redraws (out to the right, back in from the left). Icon buttons are hairline rings that fill with sun from below.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<a class="btn"')}${piece(HERO, '<a class="link"')}${piece(FAQ, '<span class="ibtn')}</div>
</div>
<div class="dark demo-pad">
<div class="demo-row">${piece(VENUE, '<a class="btn btn--sun"')}${piece(TICKETS, '<a class="btn btn--paper"')}${piece(CONTACT, '<a class="link" href="mailto:hello')}</div>
</div>`, { js: true });

add("type", "Type & wordmark", "One family, Reddit Sans, set thin and huge: headings at 200 with -.035em tracking and line-height .94, h3s at 300, leads at --oh-lead, small labels at 600 with .42em tracking in capitals. The wordmark fills its container exactly (font-size from the container width and --oh-len, the letter count), set at 200 in a single line.",
  `<div class="demo-pad">
${piece(HERO, '<p class="hero__dates tracked">').replace('class="hero__dates tracked"', 'class="tracked"')}
<div class="demo-gap"></div>
${piece(PROG, '<div class="sec-head">')}
${piece(SPEAK, '<h3 class="person__name h3">').replace('class="person__name h3"', 'class="h3"')}
</div>
${piece(FOOT, '<p class="foot__mark"')}`);

add("hero", "Poster hero", "A mid-century poster: a deep teal field covers the left 38% of the paper (fading into a dot screen at its foot), a huge thin OCHRE wordmark spans the full width and changes from paper to ink at the split, and an orange sun disc with a hairline orbit arc sits on the edge. Under it: in / out set in giant 100-weight type, a skyline of sage, khaki and rust colour blocks, a tilted phone breathing over a painted ocean, a tracked line, the intro with a pill and a link, and a ruled strip of three columns at the foot.",
  asDiv(HERO), { js: true });

add("ticker", "Ticker band", "A full-width sun band between two ink rules: thin 200-weight phrases separated by ink dots, every other one in italic, scrolling sideways on a 46s loop.",
  el('<div class="ticker"'));

add("statement", "Manifesto & figures", "A teal panel with a big thin statement (22ch) and a hairline sun arc drifting off the right edge, then three figures over dim rules: numerals at weight 100 sized to fill their column, with a soft caption.",
  asDiv(el('<section id="about"')));

add("features", "Ruled feature rows", "A section head (thin display title beside a lead) over rows divided by ink rules: a number, a thin title, a soft description, a capitalised meta line and a round thumbnail (a breathing orb, a glowing breath waveform or a painted landscape). On hover the row floods teal from the bottom and its picture zooms.",
  asDiv(PROG), { js: true });

add("phones", "Phones & breathing orb", "Phones drawn in CSS (a metal frame, an island, a glass glare) holding app screens over painted landscapes: breathe (a glass orb that grows and shrinks on a 10s cycle with fading cues), check-in (mood pills, the chosen one in sun), insights (glowing sun bars) and sleep (a waveform in a frosted card). The orb also stands alone in a dark macro with two ripples.",
  `<div class="phones">
${phones(piece(GALLERY_RAW, '<div class="phone" data-screen="checkin"'))}
${phones(piece(GALLERY_RAW, '<div class="phone" data-screen="breathe"'))}
${phones(piece(GALLERY_RAW, '<div class="phone" data-screen="insights"'))}
${phones(piece(GALLERY_RAW, '<div class="phone" data-screen="sleep"'))}
<div class="phones__macro">${piece(GALLERY, '<div class="art macro"')}</div>
</div>`, { js: true });

add("soundscapes", "Soundscape cards", "On a sun panel, a three-column grid of arch-topped frames (pill radius on the top corners only), each a painted landscape (dawn lake, ocean at dusk, desert night, forest rain with live rain, northern lights with snow, valley fog) with a frosted play pill. Under each: a 300-weight title, a place and a ruled capitalised meta line. Two columns on phones.",
  asDiv(SPEAK), { js: true });

add("privacy", "Night window", "A full-height teal panel with a painted moonlit lake clipped to a large circle, a teal shade rising from the foot, a thin display title, then a lead beside a ruled definition list and a sun pill.",
  asDiv(VENUE), { js: true });

// The day timeline renders without its scroll dot; the sun line stands at full height
add("day", "Day timeline", "A split field: teal on the left 34%, paper on the right, divided by a 2px sun line. The title changes colour at the split. Each part of the day pins a giant 100-weight hour (sun when current) on the teal, beside ruled rows of time, a 300-weight title and a soft meta line.",
  asDiv(el('<section id="schedule"')));

// The pillar heights, set by the page's script at boot from the prices
const prices = [...TICKETS.matchAll(/<p class="tier__price" data-price[^>]*>([^<]+)</g)].map((m) => parseFloat(m[1].replace(/[^\d.]/g, "")));
const top = Math.max(...prices);
let tier = 0;
const TIERS = TICKETS.replace(/<li class="tier ([^"]+)">/g, (_, cls) => `<li class="tier ${cls}" style="--h:${(prices[tier++] / top).toFixed(3)}">`);
add("pricing", "Price pillars", "On teal, a section head and four plans that stand on a double rule: the name, a soft line, a dot list in the plan's colour and a pill, over a colour block (khaki, sun, sage, paper) whose height comes from its price, with the price in thin display type inside. On phones the blocks lie down and their width follows the price.",
  asDiv(TIERS));

add("gallery", "App collage", "A twelve-column collage on paper, staggered in height over a sun disc and a sage bar: a phone on a dawn lake, the orb macro in a circle, a sleep phone in an arch, three phones on a warm studio sweep, a frosted focus timer over forest rain and a candle drawn in CSS. Each shot has a numbered caption.",
  asDiv(GALLERY), { js: true });

add("reviews", "Quote cards", "On teal, quote cards in three treatments (paper, sun, and a hairline outline on teal): a 300-weight quote and a signature with a glossy initial gem whose hue comes from --oh-h.",
  asDiv(el('<section id="voices"')));

add("trial", "Disc call to action", "On sun, a teal disc with a hairline orbit ring sits behind a huge thin centred title; the title is paper inside the disc and ink outside it, cut by the same radial edge. A lead and a pill with a link close it.",
  asDiv(el('<section id="opencall"')), { js: true });

add("faq", "FAQ", "A sticky thin title beside native details rows between ink rules: the question in 300 with a ring button whose plus turns into a cross and whose ring turns sun when open.",
  asDiv(FAQ));

add("contact", "Contact & signup", "A half-and-half block: a teal panel with a title and a ruled definition list of underlined links, and a paper side with a pill email field and button, under which a sun rises behind a skyline of sage, khaki and rust blocks. The form thanks inline and sends nothing.",
  asDiv(CONTACT), { js: true });

add("footer", "Ruled footer", "A double ink rule, then columns of small text and stacked underlined links, and the OCHRE wordmark in ink filling the full width at the foot.",
  FOOT);

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// The page clips every section through main>* (dropped as shell); the components carry it themselves
// (Also the first rule of the block, so it never opens on an @media the board's parsers could misread)
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
const EXTRA = `
.hero, .about, .programme, .speakers, .venue, .schedule, .tickets, .gallery, .voices, .opencall, .faq, .contact { position: relative; overflow-x: clip; }
.site-head { position: relative; }
.hero__stage { height: min(100svh, 900px); }
.demo-pad { padding: clamp(28px, 4vw, 56px) var(--oh-gut); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 26px; }
.demo-gap { height: 22px; }
.phones { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(0, 1.6fr); gap: clamp(16px, 2.4vw, 40px); align-items: center; padding: clamp(32px, 4vw, 64px) var(--oh-gut); }
.phones__macro { aspect-ratio: 1; container-type: inline-size; overflow: hidden; border-radius: 50%; }
@media (max-width: 760px) {
.phones { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.phones__macro { grid-column: 1 / -1; width: 72%; justify-self: center; }
}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "oh" && !m[1].startsWith("oh-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("oh-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["is-open"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["breathe", "cue1", "cue2", "cue3", "redraw", "tick", "ripple", "flick", "glow", "qa-in"];
const ATTRS = ["scene", "sent", "label-open", "label-close"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "oh", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .oh itself, or :where(.oh) in front
const ROOTED = /(^|[\s,(>+~])\.oh(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.oh) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Component script ─────────────────────────────────────────────── */
// The page's scene engine (presets, painters, rain and snow), whole, and its render and
// lifecycle lines, with the canvas hook moved under the prefix
const ENGINE_START = page.indexOf("/* ---- maths ---- */");
const ENGINE_END = page.indexOf("/* ---- real-time 3D ocean", ENGINE_START);
const LIFE_START = page.indexOf("function render(c){", ENGINE_END);
const LIFE_END = page.indexOf("if(ro)canvases.forEach(c=>ro.observe(c));", LIFE_START);
if ([ENGINE_START, ENGINE_END, LIFE_START, LIFE_END].some((i) => i < 0)) throw new Error("scene engine not found");
let ENGINE = page.slice(ENGINE_START, ENGINE_END) + page.slice(LIFE_START, LIFE_END);
const swapJs = (from, to) => {
  if (!ENGINE.includes(from)) throw new Error("engine marker not found: " + from);
  ENGINE = ENGINE.split(from).join(to);
};
swapJs("P[c.dataset.scene]", "P[c.dataset.ohScene]");
// The page collects its canvases once at load; the system adds them as components arrive
swapJs("const canvases=[...document.querySelectorAll('canvas.scene[data-scene]')];", "const canvases=[];");
swapJs("canvases.forEach(c=>io?io.observe(c):render(c));", "");

const JS = `(function () {
  'use strict';
  /* Ochre components, no libraries. The page's scene engine paints every
     canvas.oh-scene[data-oh-scene] (dawn, ocean, desert, forest, aurora, fog,
     night) when it nears the screen and repaints it on resize; rain and snow
     run only while on screen. The header menu, the trial disc's size and the
     signup form answer clicks, resizes and submits. With prefers-reduced-motion
     nothing moves: one still frame of each scene, and every loop stops. */
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
${ENGINE}
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }

  /* Trial: the disc's radius follows the title, as on the page */
  function disc(stage) {
    var title = stage.querySelector('.oh-opencall__title');
    if (!title) return;
    var size = function () { stage.style.setProperty('--oh-R', Math.round(Math.max(title.offsetHeight / 2 + 28, title.offsetWidth * .2)) + 'px'); };
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(title);
  }

  function init(scope) {
    each(scope, 'canvas.oh-scene[data-oh-scene]', function (c) {
      if (c._oh) return; c._oh = true;
      canvases.push(c);
      if (io) io.observe(c); else render(c);
      if (ro) ro.observe(c);
    });
    each(scope, '.oh-opencall__stage', function (el) { if (el._oh) return; el._oh = true; disc(el); });
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

  /* Header: the burger opens the links as a full-screen sheet and swaps its label */
  function setOpen(head, open) {
    var btn = head.querySelector('.oh-menu-btn');
    head.classList.toggle('oh-is-open', open);
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    var label = btn.getAttribute(open ? 'data-oh-label-close' : 'data-oh-label-open');
    if (label) btn.setAttribute('aria-label', label);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.oh')) return;
    var menu = t.closest('.oh-menu-btn');
    if (menu) {
      var head = menu.closest('.oh-site-head');
      if (head) setOpen(head, !head.classList.contains('oh-is-open'));
      return;
    }
    var navLink = t.closest('.oh-site-head.oh-is-open .oh-nav a');
    if (navLink) setOpen(navLink.closest('.oh-site-head'), false);
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') each(document, '.oh-site-head.oh-is-open', function (h) { setOpen(h, false); });
  });

  /* Signup: a valid address gets the thank-you line from data-oh-sent; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.oh-signup');
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector('input[type="email"]'), status = form.querySelector('.oh-signup__status');
    if (input && !input.checkValidity()) { input.reportValidity(); return; }
    if (status) status.textContent = form.getAttribute('data-oh-sent') || '';
    form.reset();
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(piece(NAV, '<a class="brand"')));
const CHROME = `
body{margin:0;background:var(--oh-paper)}
body::after{content:"";position:fixed;inset:0;z-index:90;pointer-events:none;opacity:.08;mix-blend-mode:multiply;background-image:var(--oh-grain)}
.sp-top{position:relative;overflow:hidden;color:var(--oh-ink);background:linear-gradient(90deg,var(--oh-ink) 0 38%,var(--oh-paper) 38%)}
.sp-meta{position:relative;z-index:1;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding:18px var(--oh-gut) 16px;background:var(--oh-paper);box-shadow:0 1px 0 var(--oh-ink)}
.sp-meta>span{font-size:var(--oh-micro);font-weight:600;letter-spacing:.32em;text-transform:uppercase}
.sp-hero{position:relative;display:grid;grid-template-columns:38% minmax(0,1fr);min-height:clamp(380px,40vw,560px)}
.sp-sun{position:absolute;left:38%;top:16%;width:min(30vw,380px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 30%,color-mix(in oklab,var(--oh-sun) 65%,#fff4dc),var(--oh-sun) 44%,color-mix(in oklab,var(--oh-sun) 80%,var(--oh-rust)))}
.sp-hero h1{position:relative;grid-column:1 / -1;align-self:start;margin:clamp(28px,4vw,56px) 0 0;padding:0 var(--oh-gut);font-family:var(--oh-font-display);font-size:clamp(48px,7.4vw,124px);font-weight:200;line-height:.94;letter-spacing:-.035em;background:linear-gradient(90deg,var(--oh-paper) 38%,var(--oh-ink) 38%);-webkit-background-clip:text;background-clip:text;color:transparent}
.sp-copy{position:relative;grid-column:2;align-self:end;max-width:560px;margin-left:auto;padding:24px var(--oh-gut) clamp(28px,4vw,48px)}
.sp-copy p{margin:0;font-size:var(--oh-lead);line-height:1.42}
.sp-swatches{display:flex;align-items:flex-end;height:64px;margin-top:24px}
.sp-swatches i{flex:1}
.sp-main{padding:0 var(--oh-gut) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-family:var(--oh-font-display);font-size:clamp(30px,3vw,46px);font-weight:200;line-height:1;letter-spacing:-.03em;color:var(--oh-ink)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font-size:var(--oh-micro);font-weight:600;letter-spacing:.32em;text-transform:uppercase;color:var(--oh-ink)}
.sp-label::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--oh-sun)}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.55;color:var(--oh-soft-on-paper)}
.sp-demo{position:relative;overflow:clip;background:var(--oh-paper);box-shadow:0 0 0 1px var(--oh-ink)}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:760px){.sp-top{background:var(--oh-paper)}.sp-hero{grid-template-columns:minmax(0,1fr);background:linear-gradient(90deg,var(--oh-ink) 0 38%,var(--oh-paper) 38%) 0 0/100% 320px no-repeat}.sp-sun{top:150px;width:44vw}.sp-hero h1{font-size:13vw}.sp-copy{grid-column:1;margin-left:0;max-width:none;padding-top:225px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${brand}<span>Design system · ochre@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<div class="sp-sun" aria-hidden="true"></div>
<h1>Warm, thin and poster-still.</h1>
<div class="sp-copy">
<p>A mid-century poster language: a deep teal field split against ochre paper, a huge thin Reddit Sans wordmark that changes colour at the split, an orange sun disc with a hairline orbit, muted sage, khaki and rust colour blocks, dark teal pills with underlined links, phones with a breathing glass orb, and ruled strips. Extracted from the Ochre AI Meditation App page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--oh-ink" style="height:100%;background:var(--oh-ink)"></i><i title="--oh-sun" style="height:72%;background:var(--oh-sun)"></i><i title="--oh-sage" style="height:88%;background:var(--oh-sage)"></i><i title="--oh-khaki" style="height:58%;background:var(--oh-khaki)"></i><i title="--oh-rust" style="height:40%;background:var(--oh-rust)"></i>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Ochre",
  slug: "ochre",
  version: VERSION,
  prefix: "oh",
  rootClass: "oh",
  labelClass: "sp-label",
  script: "scripts/systems/ochre.mjs",
  source: SOURCE,
  metaDescription: "The Ochre design system: tokens and working components extracted from the Ochre AI Meditation App page.",
  defsNote: "not used: pictures are CSS (the sun, the orb, the phones, the candle), inline SVG, or canvases painted by the component script",
  jsNote: "the scene engine that paints every canvas.oh-scene, the header menu, the trial disc's size and the signup form",
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
writeSystem({ slug: "ochre", prefix: "oh", rootClass: "oh", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn--sun", "link", "ibtn", "wm", "phone", "orb", "scene", "art", "frame", "pillar", "prog", "tier", "quote", "qa", "wrap", "sec-head", "shot", "h2", "h3", "lead", "tracked", "dark"] });
