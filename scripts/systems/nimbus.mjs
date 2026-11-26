// Extracts the Nimbus design system from its landing page.
//
//   node scripts/systems/nimbus.mjs
//
// Reads public/demos/nimbus-ai-assistant.html (never edits it) and writes
// public/systems/nimbus/ (specimen.html, tokens.css, nimbus.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell (html, the menu scrim and its body lock),
// the scroll reveals (.reveal) and the hero's one-time rise (.fade-up, .d1-.d4):
// every component is shown settled. The fixed glass nav becomes a relative one
// (the hero carries it over its sky, as the page does when it sits at the top).
// What the page's script writes at boot is written here at build time with the
// page's own data: the integrations orbit (its rings and icons arrays become
// three rings of tool tiles), the ticker's second copy, the slides' and FAQ
// rows' ARIA state. What it does over time stays in the component script: the
// canvas cloud sky (the page's own puff, cloud and best-candidate code, now
// reading its two colours from tokens and re-fitting with a ResizeObserver),
// the process carousel, the menu and its sliding highlight, the shared billing
// switch, the FAQ accordion and the newsletter.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/nimbus-ai-assistant.html";
const { page, BODY, el, css: pageCss, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
if (!FONTS.includes("Instrument+Serif") || !FONTS.includes("Inter")) throw new Error("font link not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Nimbus · nimbus@${VERSION}
   Extracted from https://instalanding.ai/demos/nimbus-ai-assistant.html
   Fonts (Google Fonts): Instrument Serif (h1, h2, prices, menu, wordmark), Inter 400-700 (everything else) */
:root {
  /* Color · core */
  --nb-bg: #F6F6F6;
  --nb-white: #FFFFFF;
  --nb-ink: #0C0C0C;
  --nb-grey: #4D4D4D;
  --nb-muted: #BFBFBF;
  --nb-line: #EBEBEB;

  /* Color · coral */
  --nb-accent: #FF462E;
  --nb-coral: #FF6B4A;
  --nb-accent-08: color-mix(in srgb, var(--nb-accent) 8%, transparent);
  --nb-accent-16: color-mix(in srgb, var(--nb-accent) 16%, transparent);
  --nb-accent-soft: color-mix(in srgb, var(--nb-accent) 5%, #FFFFFF);

  /* Color · sky */
  --nb-sky-top: #07588A;
  --nb-sky-bottom: #E1F6F4;
  --nb-sky: linear-gradient(180deg, var(--nb-sky-top) 0%, var(--nb-sky-bottom) 100%);
  --nb-frost: #BFE3EF;

  /* Color · night and status */
  --nb-night: #07090C;
  --nb-phone: #111111;
  --nb-live: #3DDC97;
  --nb-up: #18A058;

  /* Type · families */
  --nb-font-serif: "Instrument Serif", Georgia, serif;
  --nb-font-sans: "Inter", system-ui, sans-serif;

  /* Type · scale */
  --nb-wordmark: clamp(110px, 27vw, 400px);
  --nb-h1: 72px;
  --nb-h1-tablet: 60px;
  --nb-h1-phone: 48px;
  --nb-display-int: 66px;
  --nb-display-int-phone: 44px;
  --nb-h2: 58px;
  --nb-h2-tablet: 48px;
  --nb-h2-phone: 38px;
  --nb-price: 58px;
  --nb-tagline: 52px;
  --nb-tagline-phone: 40px;
  --nb-menu: 34px;
  --nb-h3: 30px;
  --nb-h3-tablet: 26px;
  --nb-h3-phone: 24px;
  --nb-h4: 22px;
  --nb-lead: 19px;
  --nb-body: 16px;
  --nb-small: 14px;
  --nb-tag: 13px;

  /* Shape · radii */
  --nb-r: 10px;
  --nb-r-tag: 15px;
  --nb-r-card: 22px;
  --nb-r-sheet: 30px;
  --nb-r-panel: 32px;
  --nb-r-screen: 36px;
  --nb-r-footer: 40px;
  --nb-r-phone: 46px;
  --nb-r-pill: 999px;

  /* Shape · borders */
  --nb-hairline: 1px;

  /* Depth · shadow and glass */
  --nb-shadow: 0 16px 40px rgba(0,0,0,.05);
  --nb-shadow-phone: 0 30px 60px rgba(0,0,0,.25);
  --nb-shadow-panel: 0 50px 90px -40px rgba(0,0,0,.45);
  --nb-glass: rgba(255,255,255,.1);
  --nb-blur: blur(22px) saturate(170%);
  --nb-tilt: 6deg;

  /* Motion · easing */
  --nb-ease: cubic-bezier(.2,.8,.2,1);

  /* Motion · durations */
  --nb-dur-quick: .25s;
  --nb-dur: .5s;
  --nb-dur-slide: .6s;
  --nb-dur-carousel: 5s;
  --nb-dur-drift: 14s;
  --nb-dur-ticker: 30s;
  --nb-orbit-1: 46s;
  --nb-orbit-2: 70s;
  --nb-orbit-3: 100s;

  /* Space · layout */
  --nb-maxw: 1300px;
  --nb-gutter: 40px;
  --nb-gutter-phone: 20px;
  --nb-sec: 100px;
  --nb-sec-phone: 40px;
  --nb-gap: 8px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--serif -> --nb-font-serif, the orbit's --dur -> --nb-orbit-dur)
const VARS = { serif: "font-serif", sans: "font-sans", dur: "orbit-dur", dir: "orbit-dir", rdir: "orbit-rdir" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("nb-") ? m : `--nb-${VARS[n] ?? n}`));
const HEX = {
  "#f6f6f6": "bg", "#0c0c0c": "ink", "#4d4d4d": "grey", "#bfbfbf": "muted", "#ebebeb": "line", "#ff462e": "accent", "#ff6b4a": "coral",
  "#07588a": "sky-top", "#e1f6f4": "sky-bottom", "#bfe3ef": "frost", "#07090c": "night", "#3ddc97": "live", "#18a058": "up", "#111": "phone", "#fff": "white",
};
const esc = (v) => v.replace(/[().,]/g, "\\$&");
// A font size, only inside rules whose selector matches `sel`
const size = (sel, px, tok) => [new RegExp(`((?:^|\\n|,)${sel} \\{[^}]*?)font-size:${esc(px)}(?=[;}])`, "g"), `$1font-size:var(--nb-${tok})`];
const radius = (px, tok) => [new RegExp(`border-radius:${px}(?=[;}])`, "g"), `border-radius:var(--nb-${tok})`];
const SWAPS = [
  size("h1", "72px", "h1"), size("h1", "60px", "h1-tablet"), size("h1", "48px", "h1-phone"),
  size("h2", "58px", "h2"), size("h2", "48px", "h2-tablet"), size("h2", "38px", "h2-phone"),
  size("h3", "30px", "h3"), size("h3", "26px", "h3-tablet"), size("h3", "24px", "h3-phone"), size("h4", "22px", "h4"),
  size("\\.int h2", "66px", "display-int"), size("\\.int h2", "44px", "display-int-phone"),
  size("\\.price \\.amt", "58px", "price"), size("\\.tagline", "52px", "tagline"), size("\\.tagline", "40px", "tagline-phone"),
  size("\\.mi", "34px", "menu"), size("\\.lead", "19px", "lead"), size("\\.small", "14px", "small"), size("\\.tag", "13px", "tag"),
  size("\\.wordmark", "clamp(110px,27vw,400px)", "wordmark"), size("\\.nb", "16px", "body"),
  radius("10px", "r"), radius("15px", "r-tag"), radius("22px", "r-card"), radius("30px", "r-sheet"), radius("32px", "r-panel"),
  radius("36px", "r-screen"), radius("40px", "r-footer"), radius("46px", "r-phone"), radius("999px", "r-pill"),
  [/border(-top|-bottom|-right)?:1px solid/g, "border$1:var(--nb-hairline) solid"],
  [/box-shadow:0 30px 60px rgba\(0,0,0,\.25\)/g, "box-shadow:var(--nb-shadow-phone)"],
  [/box-shadow:0 50px 90px -40px rgba\(0,0,0,\.45\)/g, "box-shadow:var(--nb-shadow-panel)"],
  [/blur\(22px\) saturate\(170%\)/g, "var(--nb-blur)"],
  [/linear-gradient\(180deg,var\(--nb-sky-top\) 0%,var\(--nb-sky-bottom\) 100%\)/g, "var(--nb-sky)"],
  [/rotate\(-6deg\)/g, "rotate(calc(var(--nb-tilt) * -1))"], [/rotate\(6deg\)/g, "rotate(var(--nb-tilt))"],
  [/max-width:1300px;margin:0 auto;padding:100px 40px/g, "max-width:var(--nb-maxw);margin:0 auto;padding:var(--nb-sec) var(--nb-gutter)"],
  [/\.wrap \{padding:40px 20px\}/g, ".wrap {padding:var(--nb-sec-phone) var(--nb-gutter-phone)}"],
  [/((?:^|\n|,)\.(?:masonry|col|price-grid|small-posts|stats|faq-r) \{[^}]*?)gap:8px(?=[;}])/g, "$1gap:var(--nb-gap)"],
  [/animation:scroll 30s/g, "animation:scroll var(--nb-dur-ticker)"],
  [/animation:drift 14s/g, "animation:drift var(--nb-dur-drift)"],
  [/ \.5s cubic-bezier\(\.2,\.8,\.2,1\)/g, " var(--nb-dur) var(--nb-ease)"],
  [/ \.6s cubic-bezier\(\.2,\.8,\.2,1\)/g, " var(--nb-dur-slide) var(--nb-ease)"],
  [/cubic-bezier\(\.2,\.8,\.2,1\)/g, "var(--nb-ease)"],
  [/transition:transform \.25s,opacity \.25s/g, "transition:transform var(--nb-dur-quick),opacity var(--nb-dur-quick)"],
  [/\.nb \{([^}]*?)overflow-x:hidden/g, ".nb {$1overflow-x:clip"],
];

/* ── 3. Component CSS: the page's one <style>, minus the shell and the reveals ── */
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
// Page-only parts: the document shell, the menu scrim, the scroll reveals and the hero's one-time rise
const DROP = /^(:root|html|\.ease|\.nav-scrim|body\.menu-open( \.nav-scrim)?|\.reveal(\.in)?|\.fade-up|\.d[1-4])$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.nb, .nb *)";
  if (sel === "body") return ".nb";
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
    if (prelude.startsWith("@keyframes")) return /@keyframes (up|pulse)\b/.test(prelude) ? "" : rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// Section anchors become "#"; script hooks become data attributes or go; every other id
// (the icon sprite, gradients, filters) moves under nb- with everything that points at it
const ANCHORS = "hero|process|features|testimonials|pricing|blog|questions";
const HOOK_IDS = "nav|navLinks|navHl|menuBtn|menuPanel|navScrim|dots|ticker|intVisual|masonry|faq";
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/ id="prev"/g, ' data-step="-1"').replace(/ id="next"/g, ' data-step="1"').replace(/ id="news"/g, " data-news")
  .replace(new RegExp(` id="(${ANCHORS}|${HOOK_IDS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!nb-)([^"]+)"/g, ' id="nb-$1"')
  .replace(/(href|xlink:href)="#(?!nb-)([^"]+)"/g, '$1="#nb-$2"')
  .replace(/url\(#(?!nb-)([^)]+)\)/g, "url(#nb-$1)")
  .replace(/ class="([^"]*)"/g, (_, list) => {
    const kept = list.split(/\s+/).filter((c) => c && !/^(reveal|fade-up|d[1-4])$/.test(c));
    return kept.length ? ` class="${kept.join(" ")}"` : "";
  })
  // The coral in inline SVG follows the accent token
  .replace(/ (fill|stroke|stop-color)="#ff462e"/gi, ' style="$1:var(--accent)"')
  .replace(/var\(--([a-z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const NAV = el('<nav class="nav"');
const HERO = el('<section class="hero"');
const PROCESS = el('<section class="wrap" id="process"');
const FEATURES = el('<section class="wrap" id="features"');
const TESTI = el('<section class="wrap" id="testimonials"');
const PRICING = el('<section class="wrap" id="pricing"');
const BLOG = el('<section class="wrap" id="blog"');
const FAQ = el('<section class="wrap" id="questions"');
const CTA = el('<section class="cta"');
const FOOT = el('<footer class="foot-wrap"');
const SKY = piece(CTA, '<div class="sky"');

// The orbit, built here with the page's own rings, icons and names (its script builds it at boot)
const SCRIPT = page.slice(page.lastIndexOf("<script>"));
const grab = (re, what) => {
  const m = re.exec(SCRIPT);
  if (!m) throw new Error(what + " not found in the page script");
  return new Function(`return ${m[1]}`)();
};
const icons = grab(/const icons=(\[[\s\S]*?\n\]);/, "icons");
const names = grab(/const names=(\[[^\]]*\]);/, "names");
const rings = grab(/const rings=(\[[\s\S]*?\n\]);/, "rings");
let k = 0;
const ringHtml = rings.map((r, ri) => {
  const arms = [];
  for (let i = 0; i < r.n; i++) {
    const a = r.off + (i * 360) / r.n, [c, p] = icons[k % icons.length], nm = names[k % names.length];
    k++;
    arms.push(`<div class="arm" style="transform:rotate(${+a.toFixed(3)}deg)"><div class="node" style="--a:${+a.toFixed(3)}deg;--s:${+((r.s * 100) / r.d).toFixed(3)}%;--c:${c}" title="${nm}"><div class="tile" style="--dur:var(--nb-orbit-${ri + 1});--rdir:${r.dir === "normal" ? "reverse" : "normal"}"><svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg></div></div></div>`);
  }
  return `<div class="ring${r.dashed ? " dashed" : ""}" style="width:${r.d}%;height:${r.d}%"><div class="track" style="--dur:var(--nb-orbit-${ri + 1});--dir:${r.dir}"><span class="comet"></span>${arms.join("")}</div></div>`;
});
// The page inserts each ring before the last, so the outer ring comes first
const ORBIT = asDiv(FEATURES).replace(/(<div class="int-visual"[^>]*>)/, `$1\n      ${ringHtml.reverse().join("\n      ")}`);
if (k !== rings.reduce((n, r) => n + r.n, 0) || !ORBIT.includes('class="ring dashed"')) throw new Error("orbit not built");

// The ticker's second copy (the page doubles the track at boot), hidden from assistive tech
const TRUSTED = piece(PROCESS, '<div class="trusted').replace(/(<div class="ticker-track" id="ticker">)([\s\S]*?)(\s*<\/div><\/div>)/, (m, a, inner, z) =>
  a + inner + inner.replace(/<svg /g, '<svg aria-hidden="true" ') + z);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("nav", "Glass pill nav", "A fixed glass pill (dark translucent, 22px blur at 170% saturation, a 1px gradient rim): the logo, five links under a sliding highlight that follows the pointer and the active section, and a white Get started pill with a black arrow disc that turns -45deg on hover. .nb-scrolled narrows and darkens it. Under 1200px the links become a round menu button that opens a dark panel of big numbered serif links with arrow discs and a green All systems normal label.",
  `<div class="nav-stage">${SKY}${NAV}</div>`, { js: true, defs: true });

const tagOf = (html, marker) => piece(html, marker);
add("buttons", "Buttons, pills & tags", "Buttons are 10px-radius blocks with the soft shadow that lift 2px on hover: ink (.nb-btn-dark, with an icon) and white (.nb-btn-light). On dark panels the action is a white pill with a black arrow disc (.nb-nav-cta) beside a glass ghost pill. Carousel controls are white 40px squares and dots that stretch to an ink bar; the billing switch is a pill with a grey track that turns coral. Social links are glass discs that fill white; the status pill is mint on green.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<a href="#pricing" class="btn btn-dark">')}${piece(HERO, '<a href="#process" class="btn btn-light">')}${piece(BLOG, '<a href="#" class="btn btn-dark">')}${piece(PROCESS, '<div class="ctrl">')}${piece(PROCESS, '<div class="dots"')}<div>${piece(PRICING, '<div class="toggle"')}</div></div>
<div class="demo-row demo-night">${piece(FEATURES, '<a href="#pricing" class="nav-cta">')}${piece(FEATURES, '<a href="#" class="int-ghost">')}${tagOf(FEATURES, '<span class="tag dark">')}${piece(FOOT, '<div class="socials">')}${piece(FOOT, '<span class="sys-status">')}</div>
</div>`, { js: true, defs: true });

add("type", "Serif display & coral tags", "Headings are Instrument Serif 400 with tight tracking (-.03em): h1 at --nb-h1, h2 at --nb-h2, both stepping down at 1199 and 809px. Everything else is Inter 500; h3 and h4 stay in Inter. Every section title sits under a small coral tag with an icon: 8% coral fill, a 16% coral rim, 13px Inter 600. .nb-plain is a grey label tag, .nb-soft a borderless coral one.",
  `<div class="demo-pad">
<div class="demo-row">${tagOf(PROCESS, '<span class="tag">')}${tagOf(PRICING, '<span class="tag">')}${tagOf(FAQ, '<span class="tag">')}${tagOf(TESTI, '<span class="tag soft">')}${tagOf(TESTI, '<span class="tag plain">')}</div>
<div class="demo-gap"></div>
${piece(HERO, "<h1")}
<div class="demo-gap"></div>
${piece(TESTI, '<div class="t">')}
</div>`, { defs: true });

add("sky", "Cloud sky", "The signature: a sky gradient (--nb-sky-top to --nb-sky-bottom) with clouds drawn on canvas. One radial puff is stamped 20-90 times, rotated and scaled, into each cloud; clouds are spread by best-candidate sampling over faint stars, sorted by depth, drift left and wrap, and parallax with the section's scroll offset through a damped follow. It only animates while on screen; under reduced motion it draws once.",
  `<div class="sky-stage">${SKY}${piece(CTA, '<div class="badge-logo">')}</div>`, { js: true });

add("hero", "Sky hero & phones", "A 10px-radius card filled with the cloud sky under the glass nav: a white logo badge in a glass frame, the serif h1 in white with a soft blue text shadow, one line of copy, ink and white buttons, then two phones tilted by ±--nb-tilt and cropped by the card's bottom edge.",
  asDiv(HERO).replace('<div class="hero-card">', `<div class="hero-card">\n    ${NAV}`), { js: true, defs: true });

add("phones", "Phone mockups", "Phones drawn in CSS: a #111 body with a 46px radius, a 2px inner rim and a deep shadow, a notch, a status bar, and app screens in the system's own parts: a chat with ink and white bubbles, a coral avatar and a typing indicator, and a home screen with a serif greeting, prompt chips, a coral weekly bar chart and an ink up-next card. On phones the screens zoom to .57.",
  `<div class="demo-pad phones-stage">${piece(HERO, '<div class="phones')}</div>`, { defs: true });

add("process", "Process carousel", "Copy with a coral tag, serif h2, prev and next squares and dots beside a peach-to-periwinkle gradient panel whose blurred colour spots drift. On it, three app slides (assistant chat, insights KPIs with a coral area chart, an automations list with Live pills) cross-fade and rise; they auto-advance every --nb-dur-carousel while on screen.",
  `<div class="wrap" style="padding-bottom:40px">${piece(PROCESS, '<div class="process">')
    .replace(/<div class="slide on">/, '<div class="slide on" aria-hidden="false">')
    .replace(/<div class="slide">/g, '<div class="slide" aria-hidden="true">')}</div>`, { js: true, defs: true });

add("ticker", "Logo ticker", "A grey line of copy beside a white 22px card in which five made-up SVG wordmarks scroll sideways over --nb-dur-ticker, faded out at both ends by a mask.",
  `<div class="wrap" style="padding-top:40px;padding-bottom:40px">${TRUSTED}</div>`);

add("orbit", "Integrations orbit", "A near-black 32px panel with a cool glow and a masked dot grid: a dark tag, a serif h2 whose last words are a coral gradient italic, two pill buttons and three serif stats. Beside it the orbit: a white hub with the mark and three rings (the middle one dashed) spinning in alternating directions over --nb-orbit-1, -2 and -3, each with a comet, carrying 15 glass tool tiles that counter-rotate to stay upright and glow in their own brand colour on hover. Hovering the panel pauses it.",
  ORBIT, { defs: true });

add("outcomes", "Section head & stats", "A section head: coral tag, serif h2 and a grey line on the left, two white 22px stat cards with an Inter h3 figure on the right. It stacks under 1200px.",
  `<div class="wrap" style="padding-bottom:0">${piece(TESTI, '<div class="sec-head')}</div>`, { defs: true });

add("testimonials", "Quote masonry", "Three columns of 22px quote cards with 8px gaps: a primary card washing white to the soft coral with a coral rim and a big serif figure, a dark ink card, and plain white cards with outline brand marks, a grey label tag and a CSS portrait (a gradient square with a white head and shoulders).",
  `<div class="wrap">${piece(TESTI, '<div class="masonry"')}</div>`, { defs: true });

add("pricing", "Plans & billing switch", "Three 22px plan cards: primary (white to soft coral), plain white and dark ink. Each has an icon box, an Inter h4, a grey line, a serif price, a billing switch, a check list and a full-width button. Flipping any switch flips every card to annual and takes 15% off each price. A white perks strip follows.",
  asDiv(PRICING), { js: true, defs: true });

add("journal", "Journal posts", "One large post (art beside the copy) and three small ones (art above). The art is CSS and animated SVG: a morphing iridescent blob, a robot head with blinking coral eyes in fog, waving blue ribbons and drifting jellyfish. Cards lift 3px on hover while the art scales up.",
  asDiv(BLOG), { defs: true });

add("faq", "FAQ accordion", "A head with a coral tag and a support block beside seven white rows that open one at a time: the answer grows through a grid-rows transition, the plus turns to a minus and the open row washes to soft coral.",
  asDiv(FAQ).replace(/<div class="q">/g, '<div class="q" role="button" tabindex="0" aria-expanded="false">'), { js: true, defs: true });

add("footer", "Sky CTA & footer", "A sky card (\"Transform with AI.\") with a glass logo badge and both buttons floats over the top of a dark 40px footer panel with a cool glow and a gradient rim: the logo, a serif tagline with a frost italic, a pill newsletter form, four link columns whose underline draws in from the left, glass social discs, the status pill, a legal bar and a huge italic Nimbus wordmark fading out at the bottom.",
  `${asDiv(CTA)}\n${FOOT}`, { js: true, defs: true });

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
const EXTRA = `
h3, h4, h5, h6 { font-family: inherit; }
.nav { position: relative; }
.hero-card > .nav { position: absolute; top: 0; left: 0; right: 0; z-index: 5; }
.nav-stage { position: relative; min-height: 124px; overflow: hidden; transition: min-height var(--nb-dur) var(--nb-ease); }
.nav-stage:has(.nav.open) { min-height: 640px; }
.sky-stage { position: relative; display: grid; place-items: center; height: clamp(260px, 32vw, 420px); border-radius: var(--nb-r-card); overflow: hidden; }
.sky-stage > .badge-logo { position: relative; z-index: 1; }
.demo-pad { padding: clamp(28px, 4vw, 56px) clamp(16px, 4vw, 40px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 18px; }
.demo-row + .demo-row { margin-top: 24px; }
.demo-night { padding: 24px; border-radius: var(--nb-r-card); background: var(--nb-night); color: var(--nb-white); }
.demo-night .sys-status { margin-top: 0; }
.demo-gap { height: 28px; }
.phones-stage { display: flex; justify-content: center; padding-bottom: 0; }`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "nb" && !m[1].startsWith("nb-")) CLASSES.add(m[1]);
}
const SPRITE = sliceEl(page, '<svg width="0" height="0"', BODY).html;
for (const html of [...C.map((c) => c.raw), SPRITE]) for (const m of html.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("nb-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["open", "scrolled", "active", "on", "annual"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["drift", "blink", "scroll", "spin", "morph"];
const ATTRS = ["step", "news", "price", "sticky"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "nb", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .nb itself, or :where(.nb) in front
const ROOTED = /(^|[\s,(>+~])\.nb(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.nb) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();
for (const lit of ["#ff462e", "#07588a", "font-size:72px", "font-size:58px", "cubic-bezier(.2,.8,.2,1)"]) if (componentCss.toLowerCase().includes(lit)) throw new Error("literal left in component CSS: " + lit);

/* ── 6. The sprite ───────────────────────────────────────────────────── */
// <use> clones live in a shadow tree, out of reach of the scoped .nb-ico rule: the sprite
// carries the page's .ico stroke as presentation attributes instead
const ICO = /\.nb-ico \{([^}]*)\}/.exec(componentCss)?.[1];
if (!ICO || !/stroke-width:1\.8/.test(ICO)) throw new Error(".ico rule not found");
const DEFS = prefixMarkup(unhook(SPRITE.replace(/ class="ico"/g, ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"')))
  .replace(/^<svg /, '<svg id="nb-defs" ');

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Nimbus components, no libraries. The cloud sky draws on its canvas and
     animates only while on screen; the process carousel auto-advances while on
     screen; the menu, the sliding nav highlight, the billing switch, the FAQ and
     the newsletter answer the pointer and keyboard. Components added later (or
     cloned) are picked up by a MutationObserver. With prefers-reduced-motion the
     sky draws once, the carousel waits for a click and the SVG art is paused. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  function token(el, name, fb) { var v = getComputedStyle(el).getPropertyValue(name).trim(); return v || fb; }
  function ms(v) { var n = parseFloat(v); return /ms$/.test(v) ? n : n * 1000; }
  var rnd = function (a, b) { return Math.random() * (b - a) + a; };

  /* ── Cloud sky: the page's puff, clouds and best-candidate spread ── */
  var puff;
  function getPuff() {
    if (puff) return puff;
    puff = document.createElement('canvas'); puff.width = puff.height = 70;
    var c = puff.getContext('2d'), g = c.createRadialGradient(35, 35, 0, 35, 35, 35);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 70, 70);
    return puff;
  }
  function makeCloud() {
    var p = getPuff(), cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    var W = cv.width = Math.round(rnd(400, 700)), H = cv.height = Math.round(rnd(200, 260));
    var w = p.width, h = p.height, hw = w / 2, hh = h / 2, max = 2.5, n = Math.ceil(rnd(20, 90));
    while (n--) {
      var s = rnd(.4, max);
      ctx.globalAlpha = Math.max(0, Math.random() - .2);
      ctx.translate(rnd(hw, W - w * max * 1.3), rnd(hh + hh / 4, H - h * max));
      ctx.scale(s, rnd(s - .3, s)); ctx.translate(hw, hh); ctx.rotate(rnd(0, Math.PI / 2));
      ctx.drawImage(p, -hw, -hh); ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    return cv;
  }
  function sampler(w, h, k) {
    var pts = [], d = function (a, b) { return Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2); };
    return function () {
      var best = [Math.random() * w, Math.random() * h];
      if (pts.length) {
        var bd = 0;
        for (var i = 0; i < k; i++) {
          var c = [Math.random() * w, Math.random() * h], m = Infinity;
          for (var j = 0; j < pts.length; j++) m = Math.min(m, d(pts[j], c));
          if (m > bd) { bd = m; best = c; }
        }
      }
      pts.push(best); return best;
    };
  }
  function sky(canvas) {
    var host = canvas.parentElement, ctx = canvas.getContext('2d');
    if (!host || !ctx) return;
    var W = 0, H = 0, dpr = 1, els = [], y = 0, visible = true, raf = 0, DAMP = 40;
    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth; H = host.clientHeight;
      canvas.width = Math.max(1, W * dpr); canvas.height = Math.max(1, H * dpr);
      els = [];
      if (!W || !H) return;
      var n = Math.max(60, Math.round(W * H / 5000)), i, d;
      for (i = 0; i < n; i++) { d = rnd(.1, .3); els.push({ t: 's', x: Math.random() * W, y: Math.random() * H * .9, r: rnd(1, 2.6), d: d, z: d * 13, a: rnd(.35, .9) }); }
      var get = sampler(W, H, 10), count = Math.max(8, Math.floor(W * H / (510 * 260)));
      for (i = 0; i < count; i++) {
        var r = rnd(.4, 1.2), p = get(), img = makeCloud();
        els.push({ t: 'c', img: img, x: p[0], y: p[1], w: img.width, h: img.height, d: r, z: r * 13, a: r < .8 ? .8 : Math.min(r, 1), sp: r * rnd(.2, .4) });
      }
      els.sort(function (a, b) { return a.z - b.z; });
    }
    function target() { var r = host.getBoundingClientRect(); return Math.max(-H, Math.min(H * 2, -r.top)); }
    function draw() {
      y += (-target() - y) / DAMP;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var g = ctx.createLinearGradient(0, 0, 0, H || 1);
      g.addColorStop(0, token(host, '--nb-sky-top', '#07588A')); g.addColorStop(1, token(host, '--nb-sky-bottom', '#E1F6F4'));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < els.length; i++) {
        var e = els[i];
        ctx.save(); ctx.globalAlpha = e.a;
        var cx = e.t === 'c' ? e.x + e.w / 2 : e.x, cy = e.t === 'c' ? e.y + e.h / 2 : e.y;
        ctx.translate(cx, cy); ctx.scale(e.d, e.d); ctx.translate(0, y); ctx.translate(-cx, -cy);
        if (e.t === 's') { ctx.beginPath(); ctx.arc(e.x, e.y, e.r / e.d * .35, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); }
        else {
          ctx.drawImage(e.img, e.x, e.y, e.w, e.h);
          if (!reduce) e.x = (e.x * e.d) > -e.w ? e.x - e.sp : W + e.w * 2;
        }
        ctx.restore();
      }
    }
    function loop() { if (!canvas.isConnected) { raf = 0; return; } draw(); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; }
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; if (visible && !raf) loop(); }).observe(host);
    if (window.ResizeObserver) {
      var rt, w0 = -1, h0 = -1;
      new ResizeObserver(function () {
        if (host.clientWidth === w0 && host.clientHeight === h0) return;
        w0 = host.clientWidth; h0 = host.clientHeight;
        clearTimeout(rt); rt = setTimeout(function () { build(); y = -target(); draw(); }, 150);
      }).observe(host);
    }
    build(); y = -target(); loop();
  }

  /* ── Process carousel ── */
  function carousel(root) {
    var slides = root.querySelectorAll('.nb-slide'), dots = root.querySelectorAll('.nb-dots i'), cur = 0, timer, on = true;
    if (!slides.length) return;
    function go(n) {
      cur = (n + slides.length) % slides.length;
      [].forEach.call(slides, function (s, i) { s.classList.toggle('nb-on', i === cur); s.setAttribute('aria-hidden', String(i !== cur)); });
      [].forEach.call(dots, function (d, i) { d.classList.toggle('nb-on', i === cur); d.style.cursor = 'pointer'; });
      clearInterval(timer);
      if (!reduce) timer = setInterval(function () {
        if (!root.isConnected) { clearInterval(timer); return; }
        if (on) go(cur + 1);
      }, ms(token(root, '--nb-dur-carousel', '5s')));
    }
    root._nbGo = function (n, rel) { go(rel ? cur + n : n); };
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { on = es[es.length - 1].isIntersecting; }).observe(root);
    go(0);
  }

  function init(scope) {
    each(scope, '.nb-sky canvas', function (c) { if (c._nb) return; c._nb = true; sky(c); });
    each(scope, '.nb-process', function (el) { if (el._nb) return; el._nb = true; carousel(el); });
    if (reduce) each(scope, '.nb svg', function (s) { if (s.pauseAnimations) s.pauseAnimations(); });
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

  /* Header: a fixed nav marked data-nb-sticky narrows and darkens once the page scrolls */
  addEventListener('scroll', function () {
    each(document, '.nb-nav[data-nb-sticky]', function (n) { n.classList.toggle('nb-scrolled', scrollY > 60); });
  }, { passive: true });

  function setMenu(nav, open) {
    var btn = nav.querySelector('.nb-menu-btn');
    nav.classList.toggle('nb-open', open);
    if (btn) { btn.setAttribute('aria-expanded', String(open)); btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  function moveHl(links, a) {
    var hl = links.querySelector('.nb-nav-hl');
    if (!hl) return;
    a = a || links.querySelector('a.nb-active');
    if (!a) { hl.style.opacity = 0; return; }
    hl.style.opacity = 1; hl.style.width = a.offsetWidth + 'px'; hl.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }
  function setBilling(tog) {
    var on = tog.getAttribute('aria-checked') !== 'true', grid = tog.closest('.nb-price-grid');
    var cards = grid ? grid.querySelectorAll('.nb-pcard') : [tog.closest('.nb-pcard') || tog.parentElement];
    [].forEach.call(cards, function (c) {
      c.classList.toggle('nb-annual', on);
      var t = c.matches('.nb-toggle') ? c : c.querySelector('.nb-toggle'), amt = c.querySelector('.nb-amt'), base = +c.getAttribute('data-nb-price');
      if (t) t.setAttribute('aria-checked', String(on));
      if (amt && base) amt.textContent = '$' + (on ? Math.round(base * .85) : base);
    });
    tog.setAttribute('aria-checked', String(on));
  }
  function toggleQa(qa) {
    var list = qa.closest('.nb-faq-r') || qa.parentElement, open = qa.classList.contains('nb-open');
    each(list, '.nb-qa', function (x) { x.classList.remove('nb-open'); var q = x.querySelector('.nb-q'); if (q) q.setAttribute('aria-expanded', 'false'); });
    if (!open) { qa.classList.add('nb-open'); var q = qa.querySelector('.nb-q'); if (q) q.setAttribute('aria-expanded', 'true'); }
  }

  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest && e.target.closest('.nb-nav-links a');
    if (a) moveHl(a.parentElement, a);
  });
  document.addEventListener('mouseout', function (e) {
    var links = e.target.closest && e.target.closest('.nb-nav-links');
    if (links && !links.contains(e.relatedTarget)) moveHl(links, null);
  });

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.nb')) return;
    var btn = t.closest('.nb-menu-btn');
    if (btn) { var nav = btn.closest('.nb-nav'); if (nav) setMenu(nav, !nav.classList.contains('nb-open')); return; }
    var mi = t.closest('.nb-mi, .nb-mi-link');
    if (mi && mi.closest('.nb-nav')) setMenu(mi.closest('.nb-nav'), false);

    var step = t.closest('[data-nb-step]'), proc = t.closest('.nb-process');
    if (step && proc && proc._nbGo) { proc._nbGo(+step.getAttribute('data-nb-step'), true); return; }
    var dot = t.closest('.nb-dots i');
    if (dot && proc && proc._nbGo) { proc._nbGo([].indexOf.call(dot.parentElement.children, dot)); return; }

    var tog = t.closest('.nb-toggle');
    if (tog) { setBilling(tog); return; }
    var qa = t.closest('.nb-qa');
    if (qa) { toggleQa(qa); return; }

    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { each(document, '.nb-nav.nb-open', function (n) { setMenu(n, false); }); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (!t.closest) return;
    if (t.matches('.nb-toggle')) { e.preventDefault(); setBilling(t); }
    else if (t.matches('.nb-q')) { e.preventDefault(); toggleQa(t.closest('.nb-qa')); }
  });

  /* Newsletter: the button says you're in for a moment; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('[data-nb-news]');
    if (!form) return;
    e.preventDefault();
    var l = form.querySelector('.nb-lbl');
    if (l) { l.textContent = "You're in"; setTimeout(function () { l.textContent = 'Subscribe'; }, 2500); }
    form.reset();
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--nb-bg)}
.sp-top{padding:12px 12px 0}
.sp-card{position:relative;border-radius:var(--nb-r);overflow:hidden;box-shadow:var(--nb-shadow);padding:22px clamp(18px,4vw,48px) clamp(44px,6vw,80px);color:var(--nb-white)}
.sp-card>*:not(.nb-sky){position:relative;z-index:1}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,.22)}
.sp-meta .nb-logo{color:var(--nb-white)}
.sp-meta>span{font-size:12px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.82)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:28px 48px;align-items:end;margin-top:clamp(48px,8vw,120px);text-shadow:0 1px 14px rgba(4,40,68,.28)}
.sp-hero h1{margin:0;font-family:var(--nb-font-serif);font-weight:400;font-size:clamp(46px,6.6vw,96px);line-height:1;letter-spacing:-.03em}
.sp-hero p{margin:0;max-width:48ch;font-size:17px;line-height:1.5}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:22px}
.sp-swatches i{display:block;height:46px;border-radius:var(--nb-r);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5),var(--nb-shadow)}
.sp-main{padding:0 clamp(12px,4vw,56px) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-family:var(--nb-font-serif);font-size:clamp(32px,3.2vw,46px);font-weight:400;line-height:1;letter-spacing:-.03em;color:var(--nb-ink)}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;padding:6px 11px;border-radius:var(--nb-r-tag);background:var(--nb-accent-08);border:1px solid var(--nb-accent-16);color:var(--nb-accent);font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.sp-note{margin:0;max-width:700px;font-size:15px;line-height:1.55;color:var(--nb-grey)}
.sp-demo{position:relative;border-radius:var(--nb-r-card);overflow:clip;background:var(--nb-bg);box-shadow:0 0 0 1px var(--nb-line),var(--nb-shadow)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const logo = prefixMarkup(unhook(piece(NAV, '<a href="#hero" class="logo"')));
const HEROHTML = `
<header class="sp-top">
<div class="sp-card">
${prefixMarkup(unhook(SKY))}
<div class="sp-meta">${logo}<span>Design system · nimbus@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Soft sky, one coral, and phones that float.</h1>
<div>
<p>A light consumer-app launch language: a pale grey page with white 22px cards and a whisper of shadow, one coral accent used as tints and tags, Instrument Serif display over Inter, a canvas cloud sky, two tilted phones drawn in CSS, and tool tiles orbiting the logo. Extracted from the Nimbus AI Assistant page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--nb-bg" style="background:var(--nb-bg)"></i><i title="--nb-ink" style="background:var(--nb-ink)"></i><i title="--nb-accent" style="background:var(--nb-accent)"></i><i title="--nb-sky-top" style="background:var(--nb-sky-top)"></i><i title="--nb-sky-bottom" style="background:var(--nb-sky-bottom)"></i>
</div>
</div>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Nimbus",
  slug: "nimbus",
  version: VERSION,
  prefix: "nb",
  rootClass: "nb",
  labelClass: "sp-label",
  script: "scripts/systems/nimbus.mjs",
  source: SOURCE,
  metaDescription: "The Nimbus design system: tokens and working components extracted from the Nimbus AI Assistant page.",
  defsNote: "the icon sprite (bolt, spark, list, arrow, badge, check, tag, rocket, crown, sliders, pause, clock, book, question, chat and the X, Instagram and LinkedIn marks; ids under nb-)",
  jsNote: "the canvas cloud sky, the process carousel, the menu and sliding nav highlight, the shared billing switch, the FAQ accordion and the newsletter form",
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
writeSystem({ slug: "nimbus", prefix: "nb", rootClass: "nb", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-dark", "tag", "nav", "phone", "screen", "tile", "pcard", "qa", "tcard", "post", "wrap", "sky", "slide", "ico"] });
