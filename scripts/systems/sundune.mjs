// Extracts the Sundune design system from its landing page.
//
//   node scripts/systems/sundune.mjs
//
// Reads public/demos/maasai-event-hero.html (never edits it) and writes
// public/systems/sundune/ (specimen.html, tokens.css, sundune.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell, the dark colour scheme (the system ships the
// light, sunlit set) and the fixed spear scroll marker, which belongs to a page,
// not a component. The header is relative in the system (a page pins it and adds
// .sd-scrolled once it scrolls); the hero carries it absolutely, as on the page.
// The page credits its hero as a recreation of the "Maasai-Inspired Event Hero
// Banner Concept" on the Rive Marketplace, in plain SVG and CSS; the footer
// keeps that credit and the specimen repeats it.
// The texture masks the page's script cuts from the figures' own SVG geometry
// (shuka folds, spear, beaded V) are built here with the page's code and ship
// as tokens, so they exist without the script. What the page draws at boot
// (grass clumps, the bead collar, the bangles, the gala table, stars, lights)
// stays in the component script, the page's own generator lifted whole; the
// season's bead strands are a fixed count, so they are written here.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/maasai-event-hero.html";
const { page, BODY, css: pageCss, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
if (!FONTS.includes("Instrument+Serif") || !FONTS.includes("Archivo+Black")) throw new Error("font link not found");

// The masks, built by the page's own section 0 against a stand-in for <html>
const MASK_AT = page.indexOf("function uri(svg)");
const MASK_END = page.indexOf("/* 1. The adumu");
if (MASK_AT < 0 || MASK_END < 0) throw new Error("mask code not found");
const M = {};
new Function("root", page.slice(MASK_AT, MASK_END))({ style: { setProperty: (k, v) => { M[k] = v; } } });
for (const k of ["--m-shuka", "--img-shuka", "--m-spear", "--m-collar"]) if (!M[k]) throw new Error("mask missing: " + k);

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules (the hero's literal
   colours get names). One declaration per line; the group comments are what
   the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Sundune · sundune@${VERSION}
   Extracted from https://instalanding.ai/demos/maasai-event-hero.html
   Fonts (Google Fonts): Instrument Serif 400 + italic (display), Jost 400-600 (copy, buttons, kickers),
   Archivo Black (the giant knockout word behind the figures) */
:root {
  /* Color · core */
  --sd-bg: #EAD5B8;
  --sd-surface: #F2E3CD;
  --sd-ink: #1C0B06;
  --sd-ink-soft: #5E3D2C;
  --sd-accent: #B3261E;
  --sd-white: #FFFFFF;

  /* Color · desert sky */
  --sd-sky-1: #CF7F3C;
  --sd-sky-2: #E19A57;
  --sd-sky-3: #EFBD85;
  --sd-sun: #F5C993;
  --sd-umber: #4F1A0A;
  --sd-bark: #2A1208;
  --sd-cream: #FBEEE0;
  --sd-dawn: #FFF4E6;
  --sd-halo: #FFF3E2;

  /* Color · shuka band */
  --sd-red: #B3261E;
  --sd-red-ink: #F8E9D4;
  --sd-red-soft: #F3CDB8;
  --sd-red-deep: #2A0D07;
  --sd-red-line: rgba(248, 233, 212, 0.42);
  --sd-red-tex: rgba(28, 8, 4, 0.24);

  /* Color · beads */
  --sd-bead-red: #C0281E;
  --sd-bead-blue: #2350A8;
  --sd-bead-orange: #E57A1F;

  /* Color · lines */
  --sd-line: rgba(28, 11, 6, 0.18);
  --sd-line-strong: rgba(28, 11, 6, 0.38);
  --sd-tex: rgba(28, 11, 6, 0.07);

  /* Type · families */
  --sd-font-display: "Instrument Serif", "Iowan Old Style", Georgia, serif;
  --sd-font-text: "Jost", "Avenir Next", system-ui, sans-serif;
  --sd-font-word: "Archivo Black", "Arial Black", sans-serif;

  /* Type · scale */
  --sd-wordmark: clamp(104px, 26vw, 430px);
  --sd-frieze: clamp(72px, 10.5vw, 176px);
  --sd-display: clamp(64px, 7.6vw, 128px);
  --sd-h2: clamp(52px, 6.6vw, 108px);
  --sd-ledger: clamp(42px, 5.8vw, 92px);
  --sd-row: clamp(42px, 4.6vw, 72px);
  --sd-statement: clamp(36px, 4.6vw, 70px);
  --sd-quote: clamp(36px, 4.4vw, 66px);
  --sd-sheet: clamp(48px, 13vw, 72px);
  --sd-date: clamp(30px, 2.8vw, 40px);
  --sd-numeral: 52px;
  --sd-logo: 32px;
  --sd-lead: 18px;
  --sd-text: 17px;
  --sd-button: 16px;
  --sd-label: 15px;
  --sd-small: 14px;
  --sd-micro: 13px;

  /* Shape · radii */
  --sd-pill: 999px;
  --sd-r-frame: 3px;
  --sd-r-focus: 4px;

  /* Shape · borders */
  --sd-rule: 1px;
  --sd-stroke: 1.5px;

  /* Depth · shadow, glass and textures */
  --sd-shadow-frame: 0 40px 70px -40px rgba(28, 11, 6, 0.6), 0 12px 24px -16px rgba(28, 11, 6, 0.4);
  --sd-figure-shadow: rgba(60, 22, 8, 0.35);
  --sd-glass: blur(14px) saturate(1.2);
  --sd-m-shuka: ${M["--m-shuka"]};
  --sd-img-shuka: ${M["--img-shuka"]};
  --sd-m-spear: ${M["--m-spear"]};
  --sd-m-collar: ${M["--m-collar"]};

  /* Motion · easing */
  --sd-ease: cubic-bezier(.2, .8, .2, 1);

  /* Motion · durations */
  --sd-dur-quick: .25s;
  --sd-dur-fade: .3s;
  --sd-dur-line: .35s;
  --sd-dur-link: .4s;
  --sd-dur-state: .45s;
  --sd-dur-bead: .5s;
  --sd-dur-slide: .6s;
  --sd-dur-art: .8s;
  --sd-dur-fade-in: 1s;
  --sd-dur-draw: 1.1s;
  --sd-dur-line-in: 1.3s;
  --sd-dur-zoom: 1.4s;
  --sd-dur-rise: 1.8s;
  --sd-dur-sun: 12s;
  --sd-dur-flock: 34s;
  --sd-dur-cloud: 120s;

  /* Space · layout */
  --sd-wrap: 1280px;
  --sd-gut: clamp(20px, 3.2vw, 56px);
  --sd-nav-h: 84px;
  --sd-hero-h: max(660px, 100svh);
  --sd-sec: clamp(90px, 10vw, 150px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under sd- (--serif -> --sd-font-display, --sans -> --sd-font-text);
// its local ones (--hh, --d, --dx, the masks) move too, so a host's variables can't reach them
const VARS = { serif: "font-display", sans: "font-text" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("sd-") ? m : `--sd-${VARS[n] ?? n}`));
// Six-digit keys first; the normaliser also refuses a following hex digit, so "#fff" can't eat "#fff4e6"
const HEX = {
  "#4f1a0a": "umber", "#2a1208": "bark", "#fbeee0": "cream", "#fff4e6": "dawn", "#fff3e2": "halo", "#efbd85": "sky-3",
  "#f5c993": "sun", "#c0281e": "bead-red", "#2350a8": "bead-blue", "#e57a1f": "bead-orange", "#2a0d07": "red-deep",
  "#1c0b06": "ink", "#f8e9d4": "red-ink", "#fff": "white",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--sd-${tok})`];
const fs_ = (px, tok) => [new RegExp(`((?:font:\\d00 |font-size:))${px}px(?=[/;}])`, "g"), `$1var(--sd-${tok})`];
const SWAPS = [
  val("clamp(104px, 26vw, 430px)", "wordmark"), val("clamp(72px, 10.5vw, 176px)", "frieze"), val("clamp(64px, 7.6vw, 128px)", "display"),
  val("clamp(52px, 6.6vw, 108px)", "h2"), val("clamp(42px, 5.8vw, 92px)", "ledger"), val("clamp(42px, 4.6vw, 72px)", "row"),
  val("clamp(36px, 4.6vw, 70px)", "statement"), val("clamp(36px, 4.4vw, 66px)", "quote"), val("clamp(48px, 13vw, 72px)", "sheet"),
  val("clamp(30px, 2.8vw, 40px)", "date"),
  fs_(52, "numeral"), fs_(32, "logo"), fs_(18, "lead"), fs_(17, "text"), fs_(16, "button"), fs_(15, "label"), fs_(14, "small"), fs_(13, "micro"),
  [/max\(660px, 100svh\)/g, "var(--sd-hero-h)"],
  [/width:min\(1280px, 100% - 40px\)/g, "width:min(var(--sd-wrap), 100% - 40px)"],
  val("clamp(20px, 3.2vw, 56px)", "gut"),
  val("clamp(90px, 10vw, 150px)", "sec"),
  [/height:84px/g, "height:var(--sd-nav-h)"],
  val("0 40px 70px -40px rgba(28,11,6,.6), 0 12px 24px -16px rgba(28,11,6,.4)", "shadow-frame"),
  [/background:rgba\(60,22,8,\.35\)/g, "background:var(--sd-figure-shadow)"],
  [/blur\(14px\) saturate\(1\.2\)/g, "var(--sd-glass)"],
  [/border-radius:999px/g, "border-radius:var(--sd-pill)"],
  [/border-radius:3px/g, "border-radius:var(--sd-r-frame)"],
  [/border-radius:4px/g, "border-radius:var(--sd-r-focus)"],
  [/(border(?:-top|-bottom|-left)?:)1px solid/g, "$1var(--sd-rule) solid"],
  [/(?<![\d.])1\.5px/g, "var(--sd-stroke)"],
];
// Durations: the first time in each transition / animation part, for the page's own named timings
// (delays stay literal; the illustration's loops keep their own odd periods)
const DUR = { ".25s": "quick", ".3s": "fade", ".35s": "line", ".4s": "link", ".45s": "state", ".5s": "bead", ".6s": "slide", ".8s": "art",
  "1s": "fade-in", "1.1s": "draw", "1.3s": "line-in", "1.4s": "zoom", "1.8s": "rise", "12s": "sun", "34s": "flock", "120s": "cloud" };
const TIMED = ["lineIn", "fadeIn", "masai", "sun", "cloud", "flock"];
function durations(css) {
  return css.replace(/((?:transition|animation):)([^;}]+)/g, (_, prop, value) => {
    const anim = prop.startsWith("animation");
    return prop + value.split(/,(?![^(]*\))/).map((part) => {
      if (anim && !TIMED.some((k) => new RegExp(`(^|\\s)${k}(\\s|$)`).test(part))) return part;
      return part.replace(/(^|\s)(\d*\.?\d+s)(?=\s|$)/, (m, sp, t) => (DUR[t] ? `${sp}var(--sd-dur-${DUR[t]})` : m));
    }).join(",");
  }).replace("visibility 0s .6s", "visibility 0s var(--sd-dur-slide)");
}

/* ── 3. Component CSS: the page's one <style>, minus the shell ───────── */
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
// Page-only: the document shell and its safe-area strip, the tokens (:root, both dark sets) and the fixed spear marker
const DROP = /^(html|body::before|:root.*|\.spear-progress.*)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.sd, .sd *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.sd, .sd *)${sel.slice(1)}`;
  if (sel === "body") return ".sd";
  return sel;
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",")}{${body}}` : "";
  }).filter(Boolean).join("\n");
}
// The page reads its scroll state from html.scrolled and its script state from html.js; the system puts
// .scrolled on the header itself, and the manifesto only dims words once the script has split them
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/html\.scrolled body::before\{[^}]*\}/, "")
  .replace(/html\.scrolled \.nav-in/g, ".nav.scrolled .nav-in")
  .replace(/html\.scrolled \.nav/g, ".nav.scrolled")
  .replace(/html:not\(\.scrolled\) \.pill/g, ".nav:not(.scrolled) .pill")
  .replace(/\.js \.scrub/g, ".scrub");
const base = renameVars(keep(pageRules));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// Section anchors become "#"; every other id (the sheet, the form fields, the hero's gradients, the
// sprite) moves under sd- with everything that points at it
const ANCHORS = "top|experiences|approach|season|enquire|process";
const unhook = (html) => html
  .replace(/ data-(section|component)="[^"]*"/g, "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ (id|for|aria-controls)="(?!sd-)([^"]+)"/g, ' $1="sd-$2"')
  .replace(/ href="#(?!sd-)([^"]+)"/g, ' href="#sd-$1"')
  .replace(/url\(#(?!sd-)([^)]+)\)/g, "url(#sd-$1)")
  // The giant word and the sun take the system's face and colour
  .replace(/ font-family="'Archivo Black', 'Arial Black', sans-serif"/g, ' style="font-family:var(--font-word)"')
  .replace(/(<circle class="sun"[^>]*?) fill="#f5c993"/g, '$1 style="fill:#f5c993"')
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");
const sec = (marker) => sliceEl(page, marker, BODY).html;

const SPRITE = sec('<svg width="0" height="0" style="position:absolute" aria-hidden="true">');
const NAV = sec('<nav class="nav"');
const SHEET = sec('<div class="sheet"');
const HERO_RAW = sec('<header class="hero"');
// The hero carries the header over its sky, as the page does
const HERO = HERO_RAW.replace(/^(<header class="hero"[^>]*>)/, `$1\n${NAV}`);
const FRIEZE = sec('<section class="frieze"');
const APPROACH = sec('<section id="approach"');
const EXPS = sec('<section id="experiences"');
const LEDGER = sec('<section class="ledger"');
const SPEARS = sec('<div class="spears"');
// The season's strands: twelve beads each, filled for the share of places taken (the page's step 5, at build time)
const SEASON = sec('<section id="season"').replace(/<span class="strand" data-taken="(\d+)" data-total="(\d+)"><\/span>/g, (_, t, n) => {
  const f = Math.round((t / n) * 12);
  const beads = Array.from({ length: 12 }, (_, i) => (i < f ? '<i class="f"></i>' : "<i></i>")).join("");
  return `<span class="strand" role="img" aria-label="${(+t).toLocaleString("en-GB")} of ${(+n).toLocaleString("en-GB")} places taken">${beads}</span>`;
});
const PROCESS = sec('<section id="process"');
const VOICE = sec('<section class="voice"');
const ENQUIRE = sec('<section id="enquire"');
const FOOTER = sec("<footer");
const CAPS = /var CAPS = (\[[^\]]+\]);/.exec(page)?.[1];
if (!CAPS) throw new Error("captions not found");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("nav", "Header & menu sheet", "Over the sky the header is transparent in bark brown: the Sundune wordmark in Instrument Serif at 32px after a three-bead mark (red, cream, blue), Jost 500 links whose 1.5px underline draws in from the left, and an outlined pill that fills on hover. Add .sd-scrolled once the page scrolls: it turns 86% sand behind a 14px blur, drops to 66px and gains a hairline. Under 900px the links fold into a Menu button that drops a full-screen shuka-red sheet of big serif links.",
  `<div class="demo-sky">${NAV}</div>
${NAV.replace('class="nav"', 'class="nav scrolled"')}
${SHEET}`, { js: true });

add("buttons", "Buttons, links & chips", "The primary is a dark umber pill (15px by 28px, Jost 500 16px, cream text) that deepens to bark and lifts 2px; beside it a text link underlined with a 1.5px gradient that wipes out to the right on hover. On sand: the outlined pill and the small row button that fills with ink. On the shuka-red band: radio chips with a 1.5px cream line (checked fills cream) and the light pill.",
  `<div class="demo-sky demo-pad"><div class="demo-row">${piece(HERO_RAW, '<a class="btn btn-hero"')}${piece(HERO_RAW, '<a class="link-u"')}</div></div>
<div class="demo-pad"><div class="demo-row">${piece(NAV, '<a class="pill"')}${piece(SEASON, '<a class="btn-sm"')}${piece(SEASON, '<a class="btn-sm" href="#enquire" data-occasion="Leadership retreat" data-month="June 2027"')}</div></div>
<div class="demo-red demo-pad"><div class="demo-row">${piece(ENQUIRE, '<div class="chips">').replace(/name="occasion"/g, 'name="occasion-sample"')}${piece(ENQUIRE, '<button class="btn btn-light"')}</div></div>`, { js: true });

add("type", "Type, kickers & labels", "Instrument Serif at 400 does all the talking, large and light: the display at .9 line-height and -.018em, each line rising out of a mask. Jost carries copy (17px/1.65) and the small kickers: on the sky a dawn-white place line after a 42px rule, on sand an accent label after a beaded V. Section heads pair a serif h2 with a soft Jost paragraph.",
  `<div class="demo-sky demo-pad">
${piece(HERO_RAW, '<p class="place"')}
${piece(HERO_RAW, '<h1 class="hero-title"')}
</div>
<div class="demo-pad">
${piece(APPROACH, '<p class="label"')}
${piece(EXPS, '<div class="sec-head">')}
</div>`);

add("hero", "Desert sky hero", "A burnt-orange to apricot sky (--sd-sky-1 to --sd-sky-3) with a pale sun disc that breathes on a 12s loop, drifting clouds, layered ochre ridges and acacias, a huge Archivo Black word rising behind four silhouette figures, a flock crossing, reeds and grass swaying and a linen grain over all. The stage is a fixed 1672x940 composition anchored to the bottom, every layer placed in % of it, with pointer parallax by depth. Each figure is a button that plays a straight-backed leap; all four leap once when the hero first shows.",
  HERO, { js: true, defs: true });

add("frieze", "Silhouette frieze", "A shuka-red band textured with the cloth's own folds: big serif words alternate with black silhouettes of the figures, drifting sideways as the page scrolls; scrolling makes the figures leap in a wave. A soft note line closes it.",
  asDiv(FRIEZE), { js: true, defs: true });

add("approach", "Manifesto & principles", "An accent label over a 21em serif statement whose words light up from 17% as you read down, then three principles over a hairline: an accent line icon, a Jost 600 title and a soft line, divided by vertical rules.",
  asDiv(APPROACH), { js: true });

add("experiences", "Experience rows & art frame", "Ruled rows with big serif titles: the active one turns accent and grows a shuka-textured swatch before its title, with meta set right. Beside them a sticky 4:5 frame (3px radius, a deep two-layer shadow) cross-fades and settles its art as you hover or scroll: a bead collar on leather, first light on the ridges, two linked bangles on a check cloth, a long gala table to the fire at dusk, every bead, star and bulb placed by the component script. On phones each row carries its own copy of the art.",
  asDiv(EXPS), { js: true, defs: true });

add("ledger", "Ledger & spear rule", "A serif sentence with its figures in accent that count up when seen, a ten-bead share row that fills three beads red, blue and orange, then a full-width band of spears cut from the figures' own spear (a CSS mask on ink).",
  `${asDiv(LEDGER)}\n${SPEARS}`, { js: true });

add("season", "Season dates", "Ruled date rows: a serif date, a Jost 600 title with a soft place line, a strand of twelve beads filled in ink for places taken, a status (accent when places are short) and a small pill that prefills the enquiry form. The grid folds to two and then three lines on smaller screens.",
  asDiv(SEASON), { js: true });

add("process", "Process steps", "Three steps, each under a 1.5px ink rule that draws itself out like a spear shaft and ends in a diamond tip when the list scrolls into view, with a 52px accent serif numeral, a Jost title and a soft line.",
  asDiv(PROCESS), { js: true });

add("testimonial", "Testimonial", "A short strip of beaded V's in accent, a big serif quote at up to 66px and a caption with the name in Jost 600.",
  asDiv(VOICE));

add("enquire", "Enquiry form", "On the shuka-red band: a serif title and lede beside a form of radio chips, a guest-count range with a serif readout, a select and line inputs that underline in cream on focus, and a light pill. It validates and thanks inline and sends nothing; the figure beside the title leaps when it is sent.",
  asDiv(ENQUIRE), { js: true, defs: true });

add("footer", "Footer & wordmark", "Four columns of Jost (the first twice as wide) over a giant serif Sundune wordmark in accent, textured with the shuka fold, then a hairline legal row carrying the page's credit and a back-to-top button.",
  FOOTER, { js: true });

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// The hero sits in components without the page's fixed header; on the page it scrolls under it
// The outlined pill only lives in .nav-links on the page, which drops the underline; on its own it needs that too
const EXTRA = `
.nav{position:relative}
.pill{text-decoration:none}
.hero > .nav{position:absolute;top:0;left:0;right:0}
.demo-pad{padding:clamp(28px, 4vw, 56px) var(--gut)}
.demo-row{display:flex;flex-wrap:wrap;align-items:center;gap:16px 30px}
.demo-sky{background:linear-gradient(var(--sky-1), var(--sky-2) 45%, var(--sky-3));color:var(--bark)}
.demo-red{position:relative;overflow:hidden;background:var(--red);color:var(--red-ink)}
.demo-red::before{content:"";position:absolute;inset:0;background:var(--red-tex);-webkit-mask:var(--m-shuka) 0 0/160px auto repeat;mask:var(--m-shuka) 0 0/160px auto repeat}
.demo-red > *{position:relative}`;
const CLASSES = new Set();
const allCss = base + renameVars(EXTRA);
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "sd" && !m[1].startsWith("sd-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("sd-")) CLASSES.add(n);
for (const m of SPRITE.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n) CLASSES.add(n);
// Set by the component script, not present in the markup
["w", "lit", "on", "in", "open", "paused", "scrolled", "spark", "flicker"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["lineIn", "fadeIn", "sun", "cloud", "masai", "flock", "bob", "flap", "sway", "flicker", "flame", "spark"];
const ATTRS = ["depth", "lift", "clump", "collar", "bangles", "loose", "gala", "stars", "sparks", "table", "strings", "i", "to", "inview", "occasion", "month"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "sd", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .sd itself, or :where(.sd) in front
const ROOTED = /(^|[\s,(>+~])\.sd(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.sd) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* On the page, headings and controls inherit their faces from body (or set them). Inside a host they'd
   pick up the host's heading and control fonts instead, so they inherit from .sd. It goes first: the
   page's own rules for any of these come after it and still win. */
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.sd) ${t}`).join(",")}{font-family:inherit}`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(durations(tokenize(base + "\n" + renameVars(EXTRA))))).trim()}`;
// (#000 / #fff in the SVG masks are alphas, not colours; they live in the tokens, not here)
const leftHex = componentCss.replace(/url\([^)]*\)/g, "").match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 6. Shared SVG defs: the figures, bird, reed, acacia and the art's paints ── */
const DEFS = prefixMarkup(unhook(SPRITE)).replace("<svg ", '<svg id="sd-defs" focusable="false" ');

/* ── 7. Component script ─────────────────────────────────────────────── */
// The page's adumu leap, whole
const LEAP_AT = page.indexOf("function leap(body, shadow, lift, dur)");
const LEAP_END = page.indexOf("var warriors =", LEAP_AT);
// The page's generated art (steps 2 and 3), whole, run per scope over elements not yet painted
const GEN_AT = page.indexOf("  var seed = 7;");
const GEN_END = page.indexOf("/* 4. Experiences");
if ([LEAP_AT, LEAP_END, GEN_AT, GEN_END].some((i) => i < 0)) throw new Error("page script markers not found");
const LEAP = page.slice(LEAP_AT, LEAP_END).trim();
let GEN = page.slice(GEN_AT, GEN_END);
const swapJs = (from, to) => {
  if (!GEN.includes(from)) throw new Error("generator marker not found: " + from);
  GEN = GEN.split(from).join(to);
};
for (const k of ["clump", "collar", "bangles", "loose", "gala"]) swapJs(`document.querySelectorAll('[data-${k}]')`, `fresh(scope, '[data-sd-${k}]')`);
for (const k of ["clump", "collar", "bangles"]) swapJs(`.dataset.${k}`, `.dataset.sd${k[0].toUpperCase()}${k.slice(1)}`);
for (const k of ["stars", "sparks", "table", "strings"]) swapJs(`[data-${k}]`, `[data-sd-${k}]`);
swapJs('class="spark" style="--dx:', 'class="sd-spark" style="--sd-dx:');
swapJs('class="flicker"', 'class="sd-flicker"');
GEN = GEN.replace(/url\(#(\w+)\)/g, "url(#sd-$1)");
if (/class="(?!sd-)/.test(GEN) || /data-(?!sd-)\w+/.test(GEN.replace(/data:image/g, ""))) throw new Error("unprefixed hook left in the generator");

const JS = `(function () {
  'use strict';
  /* Sundune components, no libraries. The page's own generator draws the grass
     clumps and the experience art (every bead, star, candle and bulb) into
     [data-sd-clump], [data-sd-collar], [data-sd-bangles], [data-sd-loose] and
     svg[data-sd-gala] when they arrive; the figures leap on the page's adumu
     keyframes (Web Animations). Scroll drives the frieze drift and leaps and the
     manifesto words; everything else answers clicks, hovers and submits, and
     starts when it scrolls into view. Under prefers-reduced-motion the loops
     stop, the frieze holds still, the manifesto lights at once and only a press
     plays a leap. */
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function fresh(scope, sel) {
    return all(sel, scope).filter(function (el) {
      if (el.hasAttribute('data-sd-done')) return false;
      el.setAttribute('data-sd-done', '');
      return true;
    });
  }

  /* The adumu: crouch, straight-legged spring, hang, land (the page's own keyframes) */
  ${LEAP}
  function jump(w) {
    if (w.dataset.sdBusy) return;
    w.dataset.sdBusy = '1';
    leap(w.querySelector('.sd-body'), w.querySelector('.sd-shadow'), -62 * parseFloat(w.getAttribute('data-sd-lift') || 1)).onfinish = function () { delete w.dataset.sdBusy; };
  }

  /* Generated art: the page's steps 2 and 3 */
  function paint(scope) {
${GEN}  }

  /* Experiences: hover or scroll a row to show its art; each row carries a copy for phones */
  var CAPS = ${CAPS};
  var expIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var g = e.target.closest('.sd-exp-grid');
      if (e.isIntersecting && g && g._sdSet) g._sdSet(+e.target.getAttribute('data-sd-i'));
    });
  }, { rootMargin: '-45% 0px -45% 0px' }) : null;
  function experiences(grid) {
    var rows = all('.sd-exp', grid), arts = all('.sd-frame .sd-art', grid), cap = grid.querySelector('.sd-cap-text');
    grid._sdSet = function (i) {
      rows.forEach(function (r, k) { r.classList.toggle('sd-on', k === i); });
      arts.forEach(function (a, k) { a.classList.toggle('sd-on', k === i); });
      if (cap && CAPS[i]) cap.textContent = CAPS[i];
    };
    rows.forEach(function (r, i) {
      var inline = r.querySelector('.sd-exp-inline');
      if (inline && arts[i] && !inline.firstElementChild) {
        var clone = arts[i].cloneNode(true);
        clone.removeAttribute('class');
        inline.appendChild(clone);
      }
      r.addEventListener('mouseenter', function () { grid._sdSet(i); });
      if (expIO) expIO.observe(r);
    });
  }

  /* Manifesto: words light as you read down */
  function split(s) {
    s._sdW = true;
    s.innerHTML = s.textContent.trim().split(/\\s+/).map(function (w) {
      return '<span class="sd-w">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>';
    }).join(' ');
  }
  function light(s) {
    var words = all('.sd-w', s), r = s.getBoundingClientRect(), h = innerHeight;
    var p = reduced.matches ? 1 : Math.max(0, Math.min(1, (h * .82 - r.top) / (r.height + h * .3)));
    var lit = Math.round(p * words.length);
    words.forEach(function (w, i) { w.classList.toggle('sd-lit', i < lit); });
  }

  /* Frieze: drifts with the scroll, and its figures leap in a wave when you scroll */
  function wave(fr) {
    fr._sdWave = Date.now();
    all('.sd-sil', fr).forEach(function (s, i) {
      setTimeout(function () {
        if (s.dataset.sdBusy) return;
        s.dataset.sdBusy = '1';
        leap(s, null, -34 - (i % 3) * 8, 1000).onfinish = function () { delete s.dataset.sdBusy; };
      }, i * 85);
    });
  }
  var ticking = false;
  function onScroll() {
    ticking = false;
    var h = innerHeight;
    all('.sd-frieze').forEach(function (fr) {
      var r = fr.getBoundingClientRect(), track = fr.querySelector('.sd-frieze-track');
      if (!track || reduced.matches || r.bottom <= 0 || r.top >= h) return;
      var half = track.scrollWidth / 2, off = (h - r.top) * .5;
      track.style.transform = 'translate3d(' + (-(off % Math.max(half, 1)) - 40).toFixed(1) + 'px,0,0)';
      if (fr._sdTop != null && Math.abs(r.top - fr._sdTop) > 2 && Date.now() - (fr._sdWave || 0) > 1500) wave(fr);
      fr._sdTop = r.top;
    });
    all('.sd-scrub').forEach(function (s) { if (s._sdW) light(s); });
  }
  /* Capture phase: the components may scroll inside a container rather than the window */
  document.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { capture: true, passive: true });
  addEventListener('resize', onScroll);

  /* Hero: pause off screen, one left-to-right leap the first time it shows, pointer parallax by depth */
  var heroIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var hero = e.target;
      hero.classList.toggle('sd-paused', !e.isIntersecting);
      if (e.isIntersecting && !hero._sdLeapt && !reduced.matches) {
        hero._sdLeapt = true;
        setTimeout(function () { all('.sd-warrior', hero).forEach(function (w, i) { setTimeout(function () { jump(w); }, i * 170); }); }, 1700);
      }
    });
  }) : null;
  if (matchMedia('(pointer: fine)').matches) {
    document.addEventListener('pointermove', function (e) {
      if (reduced.matches || !e.target.closest) return;
      var hero = e.target.closest('.sd-hero');
      if (!hero) return;
      var st = hero._sdP || (hero._sdP = { tx: 0, ty: 0, cx: 0, cy: 0, raf: 0, layers: all('.sd-stage .sd-layer', hero) });
      var r = hero.getBoundingClientRect();
      st.tx = -((e.clientX - r.left) / r.width - .5); st.ty = -((e.clientY - r.top) / r.height - .5);
      if (!st.raf) st.raf = requestAnimationFrame(function tick() {
        st.cx += (st.tx - st.cx) * .06; st.cy += (st.ty - st.cy) * .06;
        st.layers.forEach(function (l) { var k = +l.getAttribute('data-sd-depth'); l.style.transform = 'translate3d(' + (st.cx * k).toFixed(2) + 'px,' + (st.cy * k * .4).toFixed(2) + 'px,0)'; });
        st.raf = Math.abs(st.tx - st.cx) > .001 || Math.abs(st.ty - st.cy) > .001 ? requestAnimationFrame(tick) : 0;
      });
    });
  }

  /* In view: the process spears draw, the share beads fill, the ledger counts up */
  var once = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      once.unobserve(e.target);
      if (e.target.classList.contains('sd-ledger-text')) count(e.target); else e.target.classList.add('sd-in');
    });
  }, { rootMargin: '0px 0px -12% 0px' }) : null;
  function count(text) {
    all('.sd-n', text).forEach(function (n) {
      var to = +n.getAttribute('data-sd-to'), t0 = performance.now();
      if (reduced.matches) { n.textContent = to.toLocaleString('en-GB'); return; }
      (function step(t) {
        var k = Math.min(1, (t - t0) / 1600), e = 1 - Math.pow(1 - k, 3);
        n.textContent = Math.round(to * e).toLocaleString('en-GB');
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  function init(scope) {
    paint(scope);
    fresh(scope, '.sd-exp-grid').forEach(experiences);
    fresh(scope, '.sd-scrub').forEach(function (s) { split(s); light(s); });
    fresh(scope, '.sd-hero').forEach(function (h) { if (heroIO) heroIO.observe(h); });
    fresh(scope, '[data-sd-inview]').forEach(function (el) { if (once) once.observe(el); else el.classList.add('sd-in'); });
    fresh(scope, '.sd-ledger-text').forEach(function (t) {
      if (!once) return;
      if (!reduced.matches) all('.sd-n', t).forEach(function (n) { n.textContent = '0'; });
      once.observe(t);
    });
    fresh(scope, '.sd-form').forEach(guests);
  }

  /* Menu: the Menu button drops the sheet it controls; Close, a link or Escape lifts it */
  var opener = null;
  function setMenu(sheet, open) {
    sheet.classList.toggle('sd-open', open);
    all('[aria-controls="' + sheet.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', String(open)); });
    document.body.style.overflow = open ? 'hidden' : '';
    var close = sheet.querySelector('.sd-close');
    if (open && close) close.focus(); else if (!open && opener) opener.focus();
  }

  /* Enquiry: the range readout, the season rows' prefill and a local-only send */
  function guests(form) {
    var range = form.querySelector('input[type="range"]'), out = form.querySelector('output');
    if (!range || !out) return;
    var show = function () { out.textContent = (+range.value).toLocaleString('en-GB') + (+range.value >= +range.max ? '+' : ''); };
    form._sdShow = show;
    range.addEventListener('input', show);
    show();
  }
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.sd-form');
    if (!form) return;
    e.preventDefault();
    var name = form.elements.namedItem('name'), email = form.elements.namedItem('email'), msg = form.querySelector('.sd-form-msg');
    if (!name.value.trim() || !email.value || !email.checkValidity()) {
      if (msg) msg.textContent = 'Add your name and a valid email address to send your enquiry.';
      (name.value.trim() ? email : name).focus();
      return;
    }
    if (msg) msg.textContent = 'Enquiry sent, ' + name.value.trim().split(' ')[0] + '. This demo doesn\\u2019t send anything; a real one would get a reply within two working days.';
    var box = form.closest('.sd-enquire'), ew = box && box.querySelector('.sd-enq-warrior');
    if (ew) leap(ew.querySelector('.sd-body'), ew.querySelector('.sd-shadow'), -48, 1150);
    form.reset();
    if (form._sdShow) form._sdShow();
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.sd')) return;
    var w = t.closest('.sd-warrior');
    if (w) { jump(w); return; }
    var menu = t.closest('.sd-menu-btn');
    if (menu) {
      var sheet = document.getElementById(menu.getAttribute('aria-controls'));
      if (sheet) { opener = menu; setMenu(sheet, true); }
      return;
    }
    var openSheet = t.closest('.sd-sheet.sd-open');
    if (openSheet && (t.closest('.sd-close') || t.closest('a'))) setMenu(openSheet, false);
    var pre = t.closest('[data-sd-occasion]'), form = document.querySelector('.sd-form');
    if (pre && form) {
      var radio = form.querySelector('input[value="' + pre.getAttribute('data-sd-occasion') + '"]');
      if (radio) radio.checked = true;
      var month = form.elements.namedItem('month');
      if (month) month.value = pre.getAttribute('data-sd-month');
      var msg = form.querySelector('.sd-form-msg');
      if (msg) msg.textContent = '';
      form.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
    }
    if (t.closest('.sd-to-top')) scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') all('.sd-sheet.sd-open').forEach(function (s) { setMenu(s, false); });
  });

  init(document);
  onScroll();
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; init(document); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own hero, its words swapped for the system's, its local
// gradient ids suffixed so they don't collide with the hero component's copy
const HERO_IDS = [...HERO.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
const TOPHERO = prefixMarkup(unhook(HERO
  .replace(/(<p class="place">)[^<]*/, `$1InstaLanding design system · sundune@${VERSION} · ${C.length} components`)
  .replace(">Gatherings<", ">Sundune,<").replace(">that rise.<", ">sunlit.<")
  .replace(/(<p class="lede-hero">)[^<]*/, "$1Warm desert editorial: a burnt-orange sky over a pale sun, Instrument Serif set large and light, umber pills, shuka-red bands and figures drawn in SVG. From the Sundune event page.")
  .replace(/(<a class="btn btn-hero" href="#enquire">)[^<]*/, "$1See the components")
  .replace(/(<a class="link-u" href="#season">)[^<]*/, "$1The hero, live")))
  // In-page links to the specimen's own sections (unhook would have moved them under sd-)
  .replace('class="sd-btn sd-btn-hero" href="#"', 'class="sd-btn sd-btn-hero" href="#c-buttons"')
  .replace('class="sd-link-u" href="#"', 'class="sd-link-u" href="#c-hero"')
  .replace(new RegExp(` id="sd-(${HERO_IDS.join("|")})"`, "g"), ' id="sd-$1-top"')
  .replace(new RegExp(`url\\(#sd-(${HERO_IDS.join("|")})\\)`, "g"), "url(#sd-$1-top)");
const CHROME = `
body{margin:0;background:var(--sd-bg)}
.sp-top .sd-hero-title{font-size:clamp(58px, 7.2vw, 120px)}
.sp-main{width:min(var(--sd-wrap), 100% - 40px);margin:0 auto;padding:0 0 120px}
.sp-sec{padding:84px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:22px}
.sp-head h2{margin:12px 0 0;font:400 clamp(36px,4vw,56px)/1 var(--sd-font-display);letter-spacing:-.018em;color:var(--sd-ink)}
.sp-label{display:flex;align-items:center;gap:14px;margin:0;font:500 var(--sd-label)/1.4 var(--sd-font-text);color:var(--sd-accent)}
.sp-label::before{content:"";width:42px;height:var(--sd-stroke);background:currentColor;flex:none}
.sp-note{margin:0;max-width:700px;font:400 15px/1.6 var(--sd-font-text);color:var(--sd-ink-soft)}
.sp-demo{position:relative;overflow:clip;background:var(--sd-bg);border-radius:var(--sd-r-frame);box-shadow:0 0 0 var(--sd-rule) var(--sd-line)}
@media (max-width:899px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<div class="sp-top">
${TOPHERO}
</div>`;
const specimen = renderSpecimen({
  name: "Sundune",
  slug: "sundune",
  version: VERSION,
  prefix: "sd",
  rootClass: "sd",
  labelClass: "sp-label",
  script: "scripts/systems/sundune.mjs",
  source: SOURCE,
  metaDescription: "The Sundune design system: tokens and working components extracted from the Sundune event landing page.",
  defsNote: "the figures (sd-w-front, sd-w-side), bird, reed and acacia as <symbol>s, the experience art's patterns, gradients and filters, and the hero's linen grain; include it once per page",
  jsNote: "the page's art generator (grass, beads, stars, the gala table), the adumu leap, the hero's parallax, the frieze drift, the manifesto words, the in-view reveals and count-up, the menu sheet and the local-only enquiry form",
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
writeSystem({ slug: "sundune", prefix: "sd", rootClass: "sd", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-hero", "link-u", "pill", "nav", "hero", "warrior", "frieze", "sil", "scrub", "exp", "frame", "art", "ledger", "date", "strand", "steps", "chip", "line-input", "wordmark", "label", "place", "wrap", "layer", "stage"] });
