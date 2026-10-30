// Extracts the Kairo design system from its landing page.
//
//   node scripts/systems/kairo.mjs
//
// Reads public/demos/kairo-time-assistant.html (never edits it) and writes
// public/systems/kairo/ (specimen.html, tokens.css, kairo.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system
// drops the page-level motion layer (the scroll progress bar, the cursor glow,
// the hero sparks canvas, the split and masked headline reveals, the card tilt
// and magnetic buttons) and keeps every component's settled state: the reveal
// transitions that fill the timeline, rings, bars and chart are switched on
// with the page's own .in class. The phones, logo marquee and orbit tiles,
// which the page stamps from its script at boot, are stamped here with that
// same script, so the markup is complete as is; the stat counters carry the
// numbers they count up to. The ambient loops (the floating phone, the orbit,
// the marquee, the shine and sweep, the AI line that rewrites itself) stay.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/kairo-time-assistant.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">';
const GRAIN = /body::before\{[^}]*?background-image:(url\("data:image\/svg\+xml,[^"]+"\))/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Kairo · kairo@${VERSION}
   Extracted from https://instalanding.ai/demos/kairo-time-assistant.html
   Fonts (Google Fonts): Inter 400-600 (text), Inter Tight 500-800 (display), JetBrains Mono 500-600 (labels, figures) */
:root {
  /* Color · core */
  --kr-bg: #050506;
  --kr-bg2: #0A0A0C;
  --kr-card: #0D0D10;
  --kr-card2: #121216;
  --kr-text: #F4F4F6;
  --kr-muted: #8D8D96;
  --kr-dim: #5B5B64;
  --kr-accent: #FF6B2C;
  --kr-accent-hi: #FF8549;
  --kr-accent2: #FFB36B;

  /* Color · signals */
  --kr-violet: #8B7BFF;
  --kr-mint: #4FE3B1;
  --kr-sky: #5CC8FF;
  --kr-rose: #FF5C8A;
  --kr-lime: #C6FF6B;

  /* Color · light sheet */
  --kr-paper: #F2F0EC;
  --kr-paper-ink: #0B0B0C;
  --kr-paper-muted: #64646B;
  --kr-mint-deep: #3FBF93;
  --kr-sky-deep: #3AA7E0;
  --kr-rose-deep: #E0457A;

  /* Color · lines */
  --kr-line: rgba(255,255,255,.07);
  --kr-line2: rgba(255,255,255,.13);
  --kr-spot: rgba(255,140,80,.55);

  /* Type · families */
  --kr-font-display: "Inter Tight", Inter, system-ui, sans-serif;
  --kr-font-text: Inter, system-ui, sans-serif;
  --kr-font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Type · scale */
  --kr-wordmark: clamp(80px, 19vw, 280px);
  --kr-hero: clamp(64px, 9.5vw, 148px);
  --kr-stat: 76px;
  --kr-title: clamp(40px, 6vw, 76px);
  --kr-h2: clamp(38px, 4.6vw, 60px);
  --kr-cta: clamp(34px, 4.4vw, 56px);
  --kr-h3: clamp(28px, 3.4vw, 40px);
  --kr-card-title: 26px;
  --kr-lead: 18px;
  --kr-small: 13px;
  --kr-label: 12px;

  /* Shape · radii */
  --kr-pill: 99px;
  --kr-r-sheet: 48px;
  --kr-r-stage: 40px;
  --kr-r-cta: 36px;
  --kr-r-card: 28px;
  --kr-r-panel: 22px;
  --kr-r-tile: 20px;
  --kr-r-chip: 16px;

  /* Shape · borders */
  --kr-hair: 1px;
  --kr-key: 3px;

  /* Depth · grain, glass and glow */
  --kr-grain: ${GRAIN};
  --kr-glass: blur(18px) saturate(1.4);
  --kr-shadow-pop: 0 30px 80px -20px #000;
  --kr-shadow-lift: 0 1px 2px rgba(0,0,0,.03), 0 30px 60px -40px rgba(0,0,0,.25);
  --kr-glow-accent: 0 10px 30px -10px var(--kr-accent);

  /* Motion · easing */
  --kr-ease: cubic-bezier(.2,.7,.1,1);

  /* Motion · durations */
  --kr-dur-quick: .3s;
  --kr-dur-knob: .55s;
  --kr-dur-fill: 1.4s;
  --kr-dur-ring: 2s;
  --kr-float: 7s;
  --kr-shine: 7s;
  --kr-marquee: 40s;
  --kr-orbit: 60s;

  /* Space · layout */
  --kr-maxw: 1240px;
  --kr-gut: 24px;
  --kr-sec: 140px;
  --kr-gap: 18px;
  --kr-nav-h: 76px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--display -> --kr-font-display);
// local ones (--pw, --c, --s, --w, --mx ...) move under kr- too, so a host's variables can't reach them
const VARS = { display: "font-display", mono: "font-mono" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("kr-") ? m : `--kr-${VARS[n] ?? n}`));
const esc = (v) => v.replace(/[().,+*]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--kr-${tok})`];
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--kr-${tok})`];
const rad = (v, tok) => [new RegExp(`border-radius:${esc(v)}(?=[;}])`, "g"), `border-radius:var(--kr-${tok})`];
const dur = (v, tok) => [new RegExp(`(?<=[\\s:,])${esc(v)} var\\(--kr-ease\\)`, "g"), `var(--kr-${tok}) var(--kr-ease)`];
const HEX = {
  "#050506": "bg", "#0a0a0c": "bg2", "#0d0d10": "card", "#121216": "card2", "#f4f4f6": "text", "#8d8d96": "muted", "#5b5b64": "dim",
  "#ff6b2c": "accent", "#ff8549": "accent-hi", "#ffb36b": "accent2", "#8b7bff": "violet", "#4fe3b1": "mint", "#5cc8ff": "sky", "#ff5c8a": "rose", "#c6ff6b": "lime",
  "#f2f0ec": "paper", "#0b0b0c": "paper-ink", "#64646b": "paper-muted", "#3fbf93": "mint-deep", "#3aa7e0": "sky-deep", "#e0457a": "rose-deep",
};
const SWAPS = [
  val("clamp(80px,19vw,280px)", "wordmark"), val("clamp(64px,9.5vw,148px)", "hero"), val("clamp(40px,6vw,76px)", "title"),
  val("clamp(38px,4.6vw,60px)", "h2"), val("clamp(34px,4.4vw,56px)", "cta"), val("clamp(28px,3.4vw,40px)", "h3"),
  [/font:700 76px\/1 /g, "font:700 var(--kr-stat)/1 "],
  fs_("26px", "card-title"), fs_("18px", "lead"), fs_("13px", "small"),
  [/font:500 12px(\/1)? var\(--kr-font-mono\)/g, "font:500 var(--kr-label)$1 var(--kr-font-mono)"],
  [/Inter,system-ui,sans-serif/g, "var(--kr-font-text)"],
  [/font-family:Inter,sans-serif/g, "font-family:var(--kr-font-text)"],
  [/\/18px Inter;/g, "/18px var(--kr-font-text);"],
  rad("99px", "pill"), rad("40px", "r-stage"), rad("36px", "r-cta"), rad("28px", "r-card"), rad("22px", "r-panel"), rad("20px", "r-tile"), rad("16px", "r-chip"),
  [/border-radius:48px 48px 0 0/g, "border-radius:var(--kr-r-sheet) var(--kr-r-sheet) 0 0"],
  [/(border(?:-top|-bottom)?:)1px solid var\(--kr-line/g, "$1var(--kr-hair) solid var(--kr-line"],
  [/border-bottom-width:3px/g, "border-bottom-width:var(--kr-key)"],
  [/backdrop-filter:blur\(18px\) saturate\(1\.4\)/g, "backdrop-filter:var(--kr-glass)"],
  [/box-shadow:0 30px 80px -20px #000/g, "box-shadow:var(--kr-shadow-pop)"],
  [/0 1px 2px rgba\(0,0,0,\.03\),0 30px 60px -40px rgba\(0,0,0,\.25\)/g, "var(--kr-shadow-lift)"],
  [/0 10px 30px -10px var\(--kr-accent\)/g, "var(--kr-glow-accent)"],
  [/rgba\(255,140,80,\.55\)/g, "var(--kr-spot)"],
  [/float 7s/g, "float var(--kr-float)"], [/shine 7s/g, "shine var(--kr-shine)"],
  [/marquee 40s/g, "marquee var(--kr-marquee)"], [/spin 60s/g, "spin var(--kr-orbit)"],
  [/max-width:1240px;margin:0 auto;padding:0 24px/g, "max-width:var(--kr-maxw);margin:0 auto;padding:0 var(--kr-gut)"],
  [/\.section\{padding:140px 0/g, ".section{padding:var(--kr-sec) 0"],
  [/gap:18px/g, "gap:var(--kr-gap)"],
  [/height:76px/g, "height:var(--kr-nav-h)"],
  dur(".3s", "dur-quick"), dur(".55s", "dur-knob"), dur("1.4s", "dur-fill"), dur("2s", "dur-ring"),
];

/* ── 3. Component CSS: the page's one <style>, minus the page-level motion layer ── */
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
// Page-only parts: the document shell and its fixed grain, the progress bar, the cursor glow,
// the sparks canvas, and the script-driven reveals (.js ...) and headline splits
const DROP = /^(html|body::before|\.progress|\.cursor-glow|#sparks)$|^\.js |\.words|\.hero-title \.ch/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".kr" : null;
  if (sel === "*") return ":where(.kr, .kr *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.kr, .kr *)${sel.slice(1)}`;
  if (sel === "body") return ".kr";
  // The page mutes every paragraph; in a system that would reach a host's own classed <p>
  // inside .kr too (every paragraph in the template is unclassed, so nothing here changes)
  if (sel === "p") return "p:not([class])";
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
      .filter((s) => !DROP.test(s))
      .map((s) => scopeSelector(s, inMedia))
      .filter(Boolean);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; every other id (the cart and menu hooks, the SVG
// gradients) moves under kr- with everything that points at it
const ANCHORS = "top|features|experience|stats|download|sign-up|integration";
const HOOKS = "section|speed";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter((c) => c && c !== "reveal").join(" ")}"`)
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!kr-)([^"]+)"/g, ' id="kr-$1"')
  .replace(/(href|xlink:href)="#(?!kr-)([^"]+)"/g, '$1="#kr-$2"')
  .replace(/url\(#(?!kr-)([^)]+)\)/g, "url(#kr-$1)")
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

// The page's own boot script, run at build time: the phone screen every [data-phone] gets,
// the invented logo marquee and the orbit tiles
const between = (a, b) => {
  const s = page.indexOf(a), e = page.indexOf(b, s);
  if (s < 0 || e < 0) throw new Error("script marker not found: " + a);
  return page.slice(s, e);
};
const appHTML = new Function(`${between("const tasks=", "document.querySelectorAll('[data-phone]')")}\nreturn appHTML;`)();
const LOGOS = new Function(`${between("const logos=[", "document.getElementById('logoTrack')")}\nreturn one+one;`)();
const TILE_FILL = /document\.getElementById\('orbit'\)\.innerHTML=(.*);\n/.exec(page)?.[1];
if (!TILE_FILL) throw new Error("orbit fill not found");
// The page staggers each tile's glow with an inline animation-delay; it is baked in here
const TILES = new Function(`${between("const tiles=[", "document.getElementById('orbit')")}\nreturn ${TILE_FILL};`)()
  .replace(/<div class="tile-in" style="([^"]*)"/g, (() => { let i = 0; return (_, s) => `<div class="tile-in" style="${s};animation-delay:0s, ${(i++ * 0.43).toFixed(2)}s"`; })());
const phones = (html) => html.replace(/<div class="(phone[^"]*)" data-phone([^>]*)><\/div>/g, (_, cls, rest) =>
  `<div class="${cls}"${rest.replace(/ data-speed="[^"]*"/, "").replace(/ id="themePhone"/, "")}>${appHTML()}</div>`);
// The counters show the numbers they count up to
const counted = (html) => html.replace(/<div class="stat-num" data-count="([^"]+)"([^>]*)>[^<]*<\/div>/g, (_, to, rest) => {
  const dec = +(/data-dec="(\d+)"/.exec(rest)?.[1] ?? 0), pre = /data-prefix="([^"]*)"/.exec(rest)?.[1] ?? "", suf = /data-suffix="([^"]*)"/.exec(rest)?.[1] ?? "";
  return `<div class="stat-num">${pre}${parseFloat(to).toFixed(dec)}${suf}</div>`;
});
// The settled state of every reveal: the page adds .in when a block scrolls into view
const settled = (html, marker) => html.replace(marker, marker.replace(/"$/, " in\""));

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<header class="nav"');
const HERO = el('<section class="hero"')
  .replace(/<canvas id="sparks"[^>]*><\/canvas>/, "")
  .replace('<div class="marquee-track" id="logoTrack"></div>', `<div class="marquee-track">${LOGOS}</div>`);
const EXP = el('<section class="section" id="experience"');
const INTEG = el('<section class="section integ"');
const STATS = el('<section class="section" id="stats"');
const DOWNLOAD = el('<section class="section" id="download"');
const SIGNUP = el('<section class="light-sec"');
const FOOT = el('<footer data-section="footer"');

add("nav", "Navigation", "A 76px bar on frosted near-black (--kr-glass over 72% ground, a hairline under it): the wordmark beside a dark squircle K mark with an orange star, the links in a hairline pill track whose items light on hover, a ring icon button with an orange count badge that opens a frosted cart panel, and a white Sign up pill. Under 900px the links fold into a frosted sheet behind a two-line menu button.",
  NAV.replace('class="nav"', 'class="nav scrolled"'), { js: true });

add("buttons", "Buttons, chips & keys", "Pills 46px tall in Inter 600: white with a soft white halo, or orange with a top highlight, an orange under-glow and a light sweep that crosses it every few seconds; both lift 2px on hover. Store badges are 58px rounded tiles, solid white or a hairline ghost. Eyebrows are mono capitals in a hairline pill with a pulsing orange dot; keys are mono caps with a 3px bottom border; the delta chip and the award badge sit on soft tints.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<button class="btn btn-accent"')}${piece(NAV, '<a href="#sign-up" class="btn btn-light"')}${piece(NAV, '<button class="icon-btn" id="cartBtn"')}${piece(HERO, '<span class="eyebrow"')}</div>
<div class="demo-gap"></div>
<div class="demo-row">${piece(DOWNLOAD, '<div class="stores')}</div>
<div class="demo-gap"></div>
<div class="demo-row">${piece(INTEG, '<div class="kbd-row"')}${piece(EXP, '<span class="delta"')}${piece(EXP, '<span class="badge-award"')}</div>
<div class="demo-gap"></div>
${piece(HERO, '<form class="form js-form"')}<div class="form-msg" aria-live="polite"></div>
</div>`, { js: true });

add("type", "Headline & section head", "Inter Tight 700 everywhere display: the hero word at --kr-hero with -.06em tracking and line-height .9, its second line glowing (an orange blurred copy behind it, breathing) and ending in an orange full stop. Section heads stack a mono eyebrow, a centred title at --kr-title (14ch) whose last words shine in a white-to-orange gradient that slides, and a muted 18px lead.",
  `<div class="demo-pad">
${piece(HERO, '<h1 class="hero-title')}
<div class="demo-gap"></div>
${piece(INTEG, '<div class="section-head')}
</div>`);

add("hero", "Hero with phone", "A three-column hero on a masked 72px grid with two drifting colour orbs: the giant two-line headline, a floating phone in the middle with an orange conic halo spinning behind it and two frosted notification chips beside it, and the copy with a pill email form and a star rating. Under 1060px it stacks, phone first. A logo marquee with faded edges runs under it.",
  phones(asDiv(HERO)), { js: true });

add("phone", "Phone app screen", "A phone drawn in CSS (a brushed graphite frame, side buttons, an island, a glass glare) sized by --kr-pw, holding the app: a status bar, a greeting, a tracking card with a live timer and a filling ring, a week of bars with today lit orange, an AI suggestion card whose message rewrites itself word by word, logged rows and a tab bar with an orange plus. Add .kr-light for the light screen.",
  `<div class="phones">
${phones('<div class="phone" data-phone style="--pw:280px"></div>')}
${phones('<div class="phone light" data-phone style="--pw:280px"></div>')}
</div>`, { js: true });

add("bento", "Spotlight bento", "A 12-column bento of near-black cards (28px radius, a hairline, a faint top-lit gradient). An orange spotlight follows the pointer across each card and lights its border. Each card pairs a live picture with a mono orange tag, an Inter Tight title and a muted line: a day timeline of glowing project bars with a NOW line that drifts, two synced devices, three focus rings that fill, and a billable-hours area chart with a pulsing point.",
  settled(asDiv(EXP), '<div class="bento"'), { js: true });

add("orbit", "Integration orbit", "Around a phone, seven glowing app tiles ride a dashed orbit (each counter-rotates to stay upright, its glow breathing in turn) inside a soft orange halo, while ripples spread from the centre. Under it, a ruled two-column row: a title and a line with keyboard shortcuts that press themselves in sequence.",
  phones(asDiv(INTEG))
    .replace('<div class="orbit" id="orbit"></div>', `<div class="orbit">${TILES}</div>`)
    .replace(/(<div class="phone" style="--pw:230px)/, '<span class="ripple" style="--rd:0s"></span><span class="ripple" style="--rd:1.5s"></span><span class="ripple" style="--rd:3s"></span>$1'));

add("stats", "Stats list", "A sticky head on the left (eyebrow, a --kr-h2 title ending in the shine gradient, a lead and a white pill) beside ruled rows: a 76px figure in Inter Tight fading from white to grey, a title, a line and a thin orange-to-peach bar filled to its value.",
  counted(settled(asDiv(STATS), '<div class="container stats-grid"')));

add("theme", "Download & theme preview", "A centred section head and two store badges over a 40px-radius stage lit orange from below. A pill switch (a white knob that slides, dark and light) flips the stage to warm paper and the phone, rising out of the stage's foot, to its light screen. It flips itself every few seconds until touched.",
  phones(asDiv(DOWNLOAD)), { js: true });

add("lightbento", "Light bento", "The light sheet: warm paper (--kr-paper) with 48px top corners, white cards with a soft lift shadow that rise 4px on hover. Pictures are drawn in code: a hub of tool nodes on dashed flowing lines, a live logging list, a K mark on a spinning conic mesh, a light phone rising out of its card, team bars, project chips by colour and three report sheets that fan out on hover.",
  settled(phones(asDiv(SIGNUP)).replace(piece(SIGNUP, '<div class="cta reveal">'), ""), '<div class="bento"'), { js: true });

add("cta", "Closing panel", "A near-black panel with 36px corners on the light sheet: a --kr-cta title and a soft line on the left, an orange glow drifting in the top corner, and a pill email form with a white button and a small print line on the right. The form thanks inline and sends nothing.",
  `<div class="light-sec demo-sheet"><div class="container">
${piece(SIGNUP, '<div class="cta reveal">')}
</div></div>`, { js: true });

add("footer", "Footer & wordmark", "On the paper sheet: the brand and a line, three columns of links under mono capitals (links turn orange on hover), a small print row, and a giant Kairo. wordmark in Inter Tight 800 fading from ink to nothing, its full stop orange.",
  FOOT.replace(/<span id="yr">2026<\/span>/, "2026"));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: the page's own
// h1, h2, h3 rule covers those three; h4 to h6 inherit. The nav and its sheet sit in the flow.
// The email input's intrinsic width (about 20 characters) set the form's min-content, so the
// centred hero column couldn't shrink below it; the page hid that overflow with body
// overflow-x: hidden, which a component can't rely on. width: 0 lets flex: 1 size it instead.
const HEADINGS = `h4, h5, h6 { font-family: inherit; }`;
const EXTRA = `
.nav { position: relative; animation: none; }
.hero { padding: 72px 0 60px; }
.hero-grid > * { min-width: 0; }
.form input { width: 0; }
.demo-pad { padding: clamp(28px, 4vw, 48px) var(--kr-gut); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 18px; }
.demo-gap { height: 26px; }
.phones { display: flex; flex-wrap: wrap; justify-content: center; gap: 48px; padding: 56px var(--kr-gut); }
.demo-sheet { border-radius: 0; padding: 56px 0; }
.demo-sheet .cta { margin-top: 0; }
@media (max-width: 900px) {
.mobile-menu { position: absolute; }
}
@media (max-width: 420px) {
.phones .phone { --kr-pw: 260px; }
}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "kr" && !m[1].startsWith("kr-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("kr-")) CLASSES.add(n);
const KEYFRAMES = ["float", "marquee", "pulse", "pulse2", "spin", "dash", "ringfill", "navIn", "drift", "gridpan", "breathe", "shine", "sweep", "shimmer", "bob", "ripple", "tileglow", "barGrow", "barPulse", "rowIn", "aiIn", "twinkle", "twIn", "hubPulse", "nowmove"];
const ATTRS = ["spot", "timer", "theme"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "kr", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .kr itself, or :where(.kr) in front
const ROOTED = /(^|[\s,(>+~])\.kr(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.kr) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Component script ─────────────────────────────────────────────── */
// The page's interactions, rewritten against classes instead of ids so any number of
// copies works: the live timer, nav menu and cart, card spotlight, local-only forms, the
// theme stage, and the ambient loops (the AI line, the shortcut keys, the logging counter)
const JS = `(function () {
  'use strict';
  /* Kairo components, no libraries. Every handler is delegated from the
     document, so components added later work too. With prefers-reduced-motion
     the theme stage stays put, the AI line, keys and counters hold still, and
     every CSS loop stops. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }

  /* Phone timer: every [data-kr-timer] counts up together */
  var secs = 2 * 3600 + 47 * 60 + 18;
  var two = function (n) { return String(n).padStart(2, '0'); };
  setInterval(function () {
    secs++;
    var t = two(Math.floor(secs / 3600)) + ':' + two(Math.floor(secs % 3600 / 60)) + ':' + two(secs % 60);
    each(document, '[data-kr-timer]', function (el) { el.textContent = t; });
  }, 1000);

  /* Theme stage: the switch flips the stage and its phone between dark and light */
  function setTheme(btn) {
    var stage = btn.closest('.kr-theme-stage');
    if (!stage) return;
    var light = btn.getAttribute('data-kr-theme') === 'light';
    stage.classList.toggle('kr-light-on', light);
    var phone = stage.querySelector('.kr-phone');
    if (phone) phone.classList.toggle('kr-light', light);
    each(stage, '[data-kr-theme]', function (x) { x.classList.toggle('kr-on', x === btn); });
  }

  /* Nav (menu sheet and cart panel), theme buttons and placeholder links */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.kr')) return;
    var nav = t.closest('.kr-nav');
    if (nav) {
      var cart = nav.querySelector('.kr-cart-panel'), sheet = nav.querySelector('.kr-mobile-menu'), menu = nav.querySelector('.kr-menu-btn');
      if (cart && t.closest('[aria-haspopup="dialog"]')) { cart.classList.toggle('kr-open'); e.preventDefault(); return; }
      if (cart && t.closest('.kr-cart-panel h6 button')) { cart.classList.remove('kr-open'); return; }
      if (sheet && t.closest('.kr-menu-btn')) { menu.setAttribute('aria-expanded', String(sheet.classList.toggle('kr-open'))); return; }
      if (sheet && t.closest('.kr-mobile-menu a')) { sheet.classList.remove('kr-open'); if (menu) menu.setAttribute('aria-expanded', 'false'); }
    }
    each(document, '.kr-cart-panel.kr-open', function (p) { if (!p.contains(t)) p.classList.remove('kr-open'); });
    var themeBtn = t.closest('.kr-theme-switch [data-kr-theme]');
    if (themeBtn) setTheme(themeBtn);
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    each(document, '.kr-cart-panel.kr-open, .kr-mobile-menu.kr-open', function (p) { p.classList.remove('kr-open'); });
    each(document, '.kr-menu-btn', function (b) { b.setAttribute('aria-expanded', 'false'); });
  });

  /* Card spotlight: the pointer position feeds the border and wash gradients */
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('[data-kr-spot]');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--kr-mx', e.clientX - r.left + 'px');
    c.style.setProperty('--kr-my', e.clientY - r.top + 'px');
  }, { passive: true });

  /* Forms: a valid address gets a thank-you in the .kr-form-msg after it; nothing is sent */
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('.kr-js-form');
    if (!f) return;
    e.preventDefault();
    var input = f.querySelector('input'), msg = f.nextElementSibling;
    if (!msg || !msg.classList.contains('kr-form-msg')) return;
    if (!/^\\S+@\\S+\\.\\S+$/.test(input.value)) { msg.style.color = '#ff8a6b'; msg.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    msg.style.color = ''; msg.textContent = 'Thank you! Your trial is on its way. Check your inbox.'; input.value = '';
  });

  if (reduce) return;

  /* Theme stages flip themselves every 4s until someone touches them */
  document.addEventListener('pointerdown', function (e) {
    var s = e.target.closest && e.target.closest('.kr-theme-stage');
    if (s) s._krHeld = true;
  });
  setInterval(function () {
    each(document, '.kr-theme-stage', function (s) {
      if (s._krHeld) return;
      var off = s.querySelector('[data-kr-theme]:not(.kr-on)');
      if (off) setTheme(off);
    });
  }, 4000);

  /* Keyboard shortcuts press themselves in sequence */
  var ki = 0;
  setInterval(function () {
    each(document, '.kr-kbd-row', function (row) {
      var keys = row.querySelectorAll('kbd');
      if (!keys.length) return;
      var k = keys[ki % keys.length];
      k.classList.add('kr-press');
      setTimeout(function () { k.classList.remove('kr-press'); }, 220);
    });
    ki++;
  }, 900);

  /* The AI card's line: Approve taps, then the next message types itself in word by word */
  var msgs = [
    'I logged <b>45m</b> to <b>Halcyon</b> from your 2pm review call. Look right?',
    'Lumen is at <b>92%</b> of this month\\u2019s budget. Want me to let them know?',
    'Your timesheet is ready: <b>38h 20m</b> across 4 clients. Submit it?',
    'You focus best 9\\u201311am. I blocked <b>tomorrow morning</b> for deep work.'
  ], mi = 0;
  function setMsg(p, html) {
    p.innerHTML = html;
    var k = 0;
    (function walk(n) {
      [].slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType !== 3) { walk(c); return; }
        var f = document.createDocumentFragment();
        c.textContent.split(/(\\s+)/).forEach(function (w) {
          if (!w) return;
          if (!w.trim()) { f.append(w); return; }
          var s = document.createElement('span');
          s.className = 'kr-tw'; s.style.animationDelay = (k++ * 45) + 'ms'; s.textContent = w;
          f.append(s);
        });
        c.replaceWith(f);
      });
    })(p);
  }
  setInterval(function () {
    each(document, '.kr-app-ai-btns .kr-ok', function (o) { o.classList.add('kr-tap'); setTimeout(function () { o.classList.remove('kr-tap'); }, 200); });
    setTimeout(function () { mi = (mi + 1) % msgs.length; each(document, '.kr-app-ai p', function (p) { setMsg(p, msgs[mi]); }); }, 260);
  }, 5200);

  /* The logging card's first row counts up live */
  setInterval(function () {
    each(document, '.kr-auto-row:first-of-type b, .kr-auto-live + .kr-auto-row b', function (b) {
      var v = b.textContent.split(':').reduce(function (a, x) { return a * 60 + +x; }, 0) + 1;
      b.textContent = Math.floor(v / 3600) + ':' + two(Math.floor(v % 3600 / 60)) + ':' + two(v % 60);
    });
  }, 1000);
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(piece(NAV, '<a href="#top" class="brand"')));
const CHROME = `
body{margin:0;background:var(--kr-bg)}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:999;opacity:.05;mix-blend-mode:overlay;background-image:var(--kr-grain)}
.sp-top{position:relative;overflow:hidden;padding:0 var(--kr-gut);border-bottom:1px solid var(--kr-line)}
.sp-glow{position:absolute;left:50%;top:40px;width:680px;height:680px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,107,44,.34),transparent 65%);filter:blur(80px);pointer-events:none}
.sp-gridbg{position:absolute;inset:0;background-image:linear-gradient(var(--kr-line) 1px,transparent 1px),linear-gradient(90deg,var(--kr-line) 1px,transparent 1px);background-size:72px 72px;-webkit-mask-image:radial-gradient(ellipse 70% 70% at 50% 20%,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse 70% 70% at 50% 20%,#000 20%,transparent 75%);opacity:.6;pointer-events:none}
.sp-meta{position:relative;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;max-width:var(--kr-maxw);min-height:76px;margin:0 auto}
.sp-meta>span{font:500 12px var(--kr-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--kr-muted)}
.sp-hero{position:relative;display:flex;flex-direction:column;align-items:center;max-width:var(--kr-maxw);margin:0 auto;padding:clamp(48px,7vw,104px) 0 clamp(52px,6vw,88px);text-align:center}
.sp-hero h1{margin:22px 0 18px;font-family:var(--kr-font-display);font-size:clamp(48px,7.4vw,112px);font-weight:700;line-height:.95;letter-spacing:-.05em;color:var(--kr-text)}
.sp-hero h1 em{font-style:normal;color:var(--kr-accent)}
.sp-hero p{max-width:640px;margin:0;font-size:var(--kr-lead);line-height:1.6;color:var(--kr-muted)}
.sp-swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:34px}
.sp-swatches i{width:44px;height:44px;border-radius:14px;border:1px solid var(--kr-line2);box-shadow:0 0 26px -8px currentColor}
.sp-main{max-width:1320px;margin:0 auto;padding:0 var(--kr-gut) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:14px 0 0;font-family:var(--kr-font-display);font-size:clamp(28px,3vw,42px);font-weight:700;line-height:1;letter-spacing:-.04em;color:var(--kr-text)}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;padding:8px 12px;border:1px solid var(--kr-line2);border-radius:99px;font:500 12px/1 var(--kr-font-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--kr-muted)}
.sp-label::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--kr-accent);box-shadow:0 0 12px var(--kr-accent)}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.6;color:var(--kr-muted)}
.sp-demo{position:relative;overflow:clip;border:1px solid var(--kr-line);border-radius:28px;background:var(--kr-bg)}
#c-nav .sp-demo{overflow:visible}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-gridbg" aria-hidden="true"></div>
<div class="sp-glow" aria-hidden="true"></div>
<div class="sp-meta">${brand}<span>Design system · kairo@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<p class="sp-label">Dark product UI</p>
<h1>Bento, devices <em>&amp; glow.</em></h1>
<p>A dark product language for AI apps: near-black cards on a masked grid, one hot orange with soft signal colours, Inter Tight set tight and heavy, mono labels in hairline pills, an orange spotlight that follows the pointer, phones and devices drawn in CSS, and a warm paper sheet to close on. Extracted from the Kairo AI Time Assistant page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--kr-accent" style="background:var(--kr-accent);color:var(--kr-accent)"></i><i title="--kr-accent2" style="background:var(--kr-accent2);color:var(--kr-accent2)"></i><i title="--kr-violet" style="background:var(--kr-violet);color:var(--kr-violet)"></i><i title="--kr-mint" style="background:var(--kr-mint);color:var(--kr-mint)"></i><i title="--kr-sky" style="background:var(--kr-sky);color:var(--kr-sky)"></i><i title="--kr-card2" style="background:var(--kr-card2);color:transparent"></i><i title="--kr-paper" style="background:var(--kr-paper);color:transparent"></i>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Kairo",
  slug: "kairo",
  version: VERSION,
  prefix: "kr",
  rootClass: "kr",
  labelClass: "sp-label",
  script: "scripts/systems/kairo.mjs",
  source: SOURCE,
  metaDescription: "The Kairo design system: tokens and working components extracted from the Kairo AI Time Assistant page.",
  defsNote: "not used: pictures are CSS (the phones, devices, rings' halos, the mesh) or inline SVG in each component",
  jsNote: "the phone timers, the nav menu and cart, the card spotlight, the local-only forms, the theme stage and the ambient loops (AI line, shortcut keys, logging counter)",
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
writeSystem({ slug: "kairo", prefix: "kr", rootClass: "kr", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-light", "btn-accent", "card", "lcard", "phone", "bento", "eyebrow", "nav", "mark", "tile", "store", "stat", "wordmark", "container", "grad", "in", "light-sec"] });
