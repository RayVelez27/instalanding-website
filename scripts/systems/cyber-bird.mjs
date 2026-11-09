// Extracts the Cyber Bird design system from its arcade game page.
//
//   node scripts/systems/cyber-bird.mjs
//
// Reads public/demos/cyber-bird-arcade.html (never edits it) and writes
// public/systems/cyber-bird/ (specimen.html, tokens.css, cyber-bird.css)
// through the shared pipeline in lib.mjs. The page keeps one flat <style>; the
// system drops the playable game (its stage, overlays and the fixed-position
// shell) and the scroll reveals, and keeps everything else: the starfield,
// aura and scanlines, the frosted nav with its Night / Dawn / Day switch, the
// pixel display type with its stepped black shadow, keycaps, the console,
// bento, mode cards, manual, mission log and footer. The sky switch is real:
// it sets data-cb-theme on the .cb root, which swaps --cb-glow and --cb-glow2
// (the colours every glow, aura and spotlight is mixed from) and repaints the
// pixel skies. Every picture is the page's own Sprites module, run in the
// browser: the cyber-pickup, the steel rocket stacks, the jet smoke and the
// three starbase skies, drawn pixel by pixel into canvases. Numbers the page
// fills from the game and localStorage (telemetry, gauge, mission log, mode
// bests) carry sample values; the mode cards are stamped with the page's own
// renderModes, and the pixel icons with its SOCIAL_LINKS paths.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/cyber-bird-arcade.html";
const { page, el, css: pageCssRaw } = readPage(SOURCE);
const VERSION = "1.0.0";
const P = "cb";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Jersey+10&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">';

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. The group comments are
   what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Cyber Bird · cyber-bird@${VERSION}
   Extracted from https://instalanding.ai/demos/cyber-bird-arcade.html
   Fonts (Google Fonts): Jersey 10 (pixel display), Geist 400-600 (text), Geist Mono 400-500 (labels, figures)
   Themes: set data-cb-theme="night|dawn|day" on the .cb root; it swaps the glow pair below */
:root {
  /* Color · core */
  --cb-bg: #04050B;
  --cb-ink: #EEF3FF;
  --cb-muted: #98A0B3;
  --cb-dim: #5D6477;
  --cb-accent: #2FE0FF;
  --cb-accent-hi: #7AF0FF;
  --cb-accent-ink: #031218;
  --cb-key: #0B0A1A;
  --cb-title-ink: #EAF3FF;
  --cb-void: #000000;
  --cb-track: #2A2D36;

  /* Color · skies (the glow pair per theme) */
  --cb-night-glow: #3B5BFF;
  --cb-night-glow2: #4FD8FF;
  --cb-dawn-glow: #9B37FF;
  --cb-dawn-glow2: #FF8A5C;
  --cb-day-glow: #2D7BFF;
  --cb-day-glow2: #9FD0FF;

  /* Color · sticker & code */
  --cb-sticker-hi: #8AF3FF;
  --cb-sticker-mid: #2FC8FF;
  --cb-sticker-lo: #2D6BFF;
  --cb-code-ink: #C9D1E3;
  --cb-code-key: #FF7A8A;
  --cb-code-str: #9FE0A8;
  --cb-code-num: #FFCF6B;

  /* Color · lines & glass */
  --cb-line: rgba(238, 243, 255, .09);
  --cb-line2: rgba(238, 243, 255, .17);
  --cb-fill: rgba(255, 255, 255, .03);
  --cb-fill-hi: rgba(255, 255, 255, .07);
  --cb-glass: rgba(6, 8, 18, .62);
  --cb-panel: rgba(6, 8, 16, .94);
  --cb-well: rgba(0, 0, 0, .45);
  --cb-scanline: rgba(255, 255, 255, .022);

  /* Type · families */
  --cb-font-display: "Jersey 10", monospace;
  --cb-font-text: "Geist", system-ui, -apple-system, sans-serif;
  --cb-font-mono: "Geist Mono", ui-monospace, monospace;

  /* Type · scale */
  --cb-title: clamp(108px, 19vw, 270px);
  --cb-final: clamp(66px, 11.5vw, 176px);
  --cb-h2: clamp(54px, 7.2vw, 100px);
  --cb-mode: 72px;
  --cb-log: 64px;
  --cb-big: 46px;
  --cb-h3: 40px;
  --cb-keycap: 30px;
  --cb-brand: 28px;
  --cb-lede: clamp(16px, 1.6vw, 19px);
  --cb-body: 15px;
  --cb-label-lg: 12px;
  --cb-label: 11px;
  --cb-micro: 10px;

  /* Shape · radii */
  --cb-pill: 999px;
  --cb-r-console: 20px;
  --cb-r-card: 18px;
  --cb-r-nav: 14px;
  --cb-r-btn: 12px;
  --cb-r-seg: 10px;
  --cb-r-icon: 9px;
  --cb-r-link: 8px;
  --cb-r-chip: 7px;
  --cb-r-badge: 6px;
  --cb-r-kbd: 5px;

  /* Shape · borders */
  --cb-hair: 1px;
  --cb-key-border: 3px;

  /* Depth · pixel steps and glass */
  --cb-step: .04em;
  --cb-step-title: .035em;
  --cb-key-step: 4px;
  --cb-blur: blur(16px) saturate(1.4);

  /* Motion · easing */
  --cb-ease: cubic-bezier(.2, .7, .2, 1);

  /* Motion · durations */
  --cb-dur-fast: .2s;
  --cb-dur: .25s;
  --cb-dur-card: .4s;
  --cb-dur-glow: .9s;
  --cb-dur-gauge: 1s;
  --cb-blink: 1.4s;
  --cb-marquee: 46s;

  /* Space · layout */
  --cb-maxw: 1200px;
  --cb-gutter: 16px;
  --cb-block: 150px;
  --cb-gap: 14px;
  --cb-head-gap: 48px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--display -> --cb-font-display)
const VARS = { display: "font-display", sans: "font-text", mono: "font-mono" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith(`${P}-`) ? m : `--${P}-${VARS[n] ?? n}`));
const esc = (v) => v.replace(/[().,+*/]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--${P}-${tok})`];
const font = (size, tok) => [new RegExp(`(font: \\d00 )${esc(size)}(?=/)`, "g"), `$1var(--${P}-${tok})`];
const rad = (v, tok) => [new RegExp(`border-radius: ${esc(v)}(?=[;}\\s])`, "g"), `border-radius: var(--${P}-${tok})`];
const dur = (v, tok) => [new RegExp(`(?<=[a-z-] )${esc(v)}(?=[,;\\s)])`, "g"), `var(--${P}-${tok})`];
const HEX = {
  "#04050b": "bg", "#eef3ff": "ink", "#98a0b3": "muted", "#5d6477": "dim", "#2fe0ff": "accent", "#7af0ff": "accent-hi",
  "#031218": "accent-ink", "#0b0a1a": "key", "#eaf3ff": "title-ink", "#2a2d36": "track",
  "#9b37ff": "dawn-glow", "#ff8a5c": "dawn-glow2", "#2d7bff": "day-glow", "#9fd0ff": "day-glow2",
  "#8af3ff": "sticker-hi", "#2fc8ff": "sticker-mid", "#2d6bff": "sticker-lo",
  "#c9d1e3": "code-ink", "#ff7a8a": "code-key", "#9fe0a8": "code-str", "#ffcf6b": "code-num",
};
const SWAPS = [
  // The stepped black shadow and the void behind the screen (masks keep their literal #000: it is alpha, not colour)
  [/ 0 #000/g, ` 0 var(--${P}-void)`], [/background: #000;/g, `background: var(--${P}-void);`],
  [/\.035em \.035em 0/g, `var(--${P}-step-title) var(--${P}-step-title) 0`],
  [/\.04em \.04em 0/g, `var(--${P}-step) var(--${P}-step) 0`],
  [/4px 4px 0 var/g, `var(--${P}-key-step) var(--${P}-key-step) 0 var`],
  [/border: 3px solid/g, `border: var(--${P}-key-border) solid`],
  [/border(-block|-top|-right|-bottom)?: 1px solid/g, `border$1: var(--${P}-hair) solid`],
  val("rgba(255,255,255,.022)", "scanline"), val("rgba(6, 8, 18, .62)", "glass"), val("rgba(6, 8, 16, .94)", "panel"),
  val("rgba(0,0,0,.45)", "well"), val("rgba(255,255,255,.03)", "fill"), val("rgba(255,255,255,.07)", "fill-hi"), val("rgba(255,255,255,.08)", "fill-hi"),
  val("blur(16px) saturate(1.4)", "blur"),
  val("clamp(108px, 19vw, 270px)", "title"), val("clamp(66px, 11.5vw, 176px)", "final"), val("clamp(54px, 7.2vw, 100px)", "h2"),
  val("clamp(16px, 1.6vw, 19px)", "lede"),
  font("72px", "mode"), font("64px", "log"), font("46px", "big"), font("40px", "h3"), font("30px", "keycap"), font("28px", "brand"),
  font("15px", "body"), font("12px", "label-lg"), font("11px", "label"), font("10px", "micro"),
  [/font-size: 15px/g, `font-size: var(--${P}-body)`],
  rad("999px", "pill"), rad("20px", "r-console"), rad("18px", "r-card"), rad("14px", "r-nav"), rad("12px", "r-btn"), rad("10px", "r-seg"),
  rad("9px", "r-icon"), rad("8px", "r-link"), rad("7px", "r-chip"), rad("6px", "r-badge"), rad("5px", "r-kbd"),
  val("cubic-bezier(.2,.7,.2,1)", "ease"),
  dur(".2s", "dur-fast"), dur(".25s", "dur"), dur(".4s", "dur-card"), dur(".9s", "dur-glow"), dur("1s", "dur-gauge"),
  [/blink 1\.4s/g, `blink var(--${P}-blink)`], [/scroll 46s/g, `scroll var(--${P}-marquee)`],
  [/width: min\(1200px, 100% - 32px\)/g, `width: min(var(--${P}-maxw), 100% - 2 * var(--${P}-gutter))`],
  [/padding-top: 150px/g, `padding-top: var(--${P}-block)`],
  [/gap: 14px/g, `gap: var(--${P}-gap)`],
  [/margin-bottom: 48px/g, `margin-bottom: var(--${P}-head-gap)`],
];

/* ── 3. Component CSS: the page's one <style>, minus the game and the page shell ── */
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
// Page-only parts: the document shell, the embedded game (stage, overlays, fullscreen) and the scroll reveals
const DROP = /^(html|:root|header|main|#game.*|\.screen:fullscreen|\.flappy-game|\.reveal.*)$|^\.tb-/;
function scopeSelector(sel) {
  if (sel === "*" || sel === "*::before" || sel === "*::after") return `:where(.${P}, .${P} *)${sel.slice(1)}`;
  if (sel === "body") return `.${P}`;
  if (sel === "#sky") return ".sky";
  const theme = /^html\[data-theme="(\w+)"\]$/.exec(sel);
  if (theme) return `.${P}[data-${P}-theme="${theme[1]}"]`;
  return sel;
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@property")) return "";
    if (prelude.startsWith("@media")) {
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector).filter(Boolean);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCssRaw.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
const between = (a, b) => {
  const s = page.indexOf(a), e = page.indexOf(b, s);
  if (s < 0 || e < 0) throw new Error("script marker not found: " + a);
  return page.slice(s, e);
};
// The page's pixel icons (12x12 crisp-edged paths), stamped where it stamps them at boot
const SOCIAL = new Function(`${between("const SOCIAL_LINKS = [", "function FlappyBird(")}\nreturn SOCIAL_LINKS;`)();
const icons = (html) => html.replace(/(<a class="icon-btn"[^>]*?) data-icon="([a-z]+)"><\/a>/g, (_, a, id) =>
  `${a}><svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="${SOCIAL.find((l) => l.id === id).path}"/></svg></a>`);
// The mode cards, stamped by the page's own renderModes (Normal selected)
const PRESETS = new Function(`${between("const DIFFICULTY_PRESETS", "const DEFAULT_SETTINGS")}\nreturn DIFFICULTY_PRESETS;`)();
const MODES = (() => {
  const box = {};
  new Function("DIFFICULTY_PRESETS", "DIFFS", "difficulty", "$", between("const max = {step", "bindSpotlight();"))(PRESETS, ["easy", "normal", "hard"], "normal", () => box);
  const bests = { easy: 41, normal: 27, hard: 12 };
  return box.innerHTML.replace(/<b data-mode-best="(\w+)">0<\/b>/g, (_, d) => `<b>${bests[d]}</b>`).replace(/\n\s+/g, "\n");
})();

// Hooks the page's script reaches by id or attribute become sample values or go
const SAMPLE = { "tm-score": "27", "tm-best": "34", "tm-charge": "50%", "tm-status": "IN FLIGHT", clock: "T+00:01:12", "gauge-val": "75",
  "log-easy": "41", "log-normal": "27", "log-hard": "12", "log-runs": "186", "log-charge": "100%" };
const unhook = (html) => icons(html)
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-(launch|fly="[^"]*")/g, "")
  .replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter((c) => c && c !== "reveal").join(" ")}"`)
  .replace(/<(\w+)([^>]*) id="([\w-]+)"([^>]*)>([^<]*)</g, (m, tag, a, id, b, text) => (id in SAMPLE ? `<${tag}${a}${b}>${SAMPLE[id]}<` : m))
  .replace(/<div id="game" tabindex="0"><\/div>/, '<canvas class="pix" data-scene="attract" width="640" height="360" role="img" aria-label="The cyber-pickup threading a rocket stack under the theme\'s sky"></canvas>')
  .replace(/ id="mini-car"/, ' data-scene="car"').replace(/ id="mini-rocket"/, ' data-scene="rocket"')
  .replace(/<div class="gauge" id="gauge">/, '<div class="gauge" style="--v:.75">')
  .replace(/<div data-at="(\d+)">/g, (_, at) => `<div data-at="${at}"${+at <= 30 ? ' class="on"' : ""}>`)
  .replace(/<button type="button" data-set-theme="night">/g, '<button type="button" data-set-theme="night" aria-pressed="true">')
  .replace(/<button type="button" data-set-theme="(dawn|day)">/g, '<button type="button" data-set-theme="$1" aria-pressed="false">')
  .replace(/<button class="swatch" type="button" data-set-theme="night">/g, '<button class="swatch" type="button" data-set-theme="night" aria-pressed="true">')
  .replace(/<button class="swatch" type="button" data-set-theme="(dawn|day)">/g, '<button class="swatch" type="button" data-set-theme="$1" aria-pressed="false">')
  .replace(/<button type="button" data-diff="normal">/, '<button type="button" data-diff="normal" aria-pressed="true">')
  .replace(/<button type="button" data-diff="(easy|hard)">/g, '<button type="button" data-diff="$1" aria-pressed="false">')
  .replace(/ id="(top|play|features|modes|manual|log|screen|fullscreen|ladder|reset-log|mode-cards|tm-mode)"/g, "")
  .replace(/ href="#(top|play|features|modes|manual|log)"/g, ' href="#"')
  .replace(/<canvas id="sky"/, '<canvas class="sky" data-stars');
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const NAV = el('<header class="nav"');
const HERO = el('<section class="hero wrap"');
const MARQUEE = el('<div class="marquee"');
const FEATURES = el('<section class="block wrap" id="features"');
const MODESEC = el('<section class="block wrap" id="modes"').replace('<div class="modes" id="mode-cards"></div>', `<div class="modes">${MODES}</div>`);
const MANUAL = el('<section class="block wrap" id="manual"');
const LOG = el('<section class="block wrap" id="log"');
const FINAL = el('<section class="final wrap"');
const FOOT = el('<footer data-section="footer"');
const SKY = ['<canvas id="sky" aria-hidden="true"></canvas>', '<div class="aura" aria-hidden="true"></div>', '<div class="scan" aria-hidden="true"></div>'];
for (const s of SKY) if (!page.includes(s)) throw new Error("backdrop not found: " + s);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("sky", "Night sky & scanlines", "The backdrop every part sits on: near-black --cb-bg, a canvas of square pixel stars that drift sideways, twinkle and parallax with scroll (tinted to the theme), an aura of three radial glows mixed from --cb-glow, --cb-glow2 and --cb-accent, and 1px scanlines every 3px. The page fixes all three to the viewport; any ancestor with a transform contains them, as here.",
  `<div class="demo-sky">\n${SKY.join("\n")}\n</div>`, { js: true });

add("nav", "Nav & sky switch", "A frosted bar (--cb-glass over --cb-blur, 14px corners, a hairline): the pixel-drawn cyber-pickup beside the CYBER BIRD wordmark in Jersey 10 with BIRD in cyan, muted links that light on hover, the Night / Dawn / Day segmented switch (mono capitals; the pressed one inverts to ink) and a pixel GitHub icon key. The switch is live: it sets data-cb-theme on the .cb root. Under 900px the links go.",
  NAV, { js: true });

add("buttons", "Keycaps, buttons & chips", "Buttons are 12px-radius slabs in Geist 600: cyan with a top highlight and a cyan under-glow, or a hairline ghost; both lift 2px on hover, and the primary carries a mono key hint (SPACE) in a 1px outlined keycap. Keycaps proper are Jersey 10 on --cb-key in a 3px ink border with a hard 4px black step. Around them: the blinking square-dot eyebrow pill, mono chips with an ink figure, the segmented switch, pixel icon keys, the fullscreen key and an underlined link button.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<div class="cta-row')}</div>
<div class="demo-gap"></div>
<div class="demo-row">${piece(MANUAL, '<div class="keys">')}</div>
<div class="demo-gap"></div>
<div class="demo-row">${piece(HERO, '<span class="eyebrow')}${piece(FEATURES, '<div class="chips">')}</div>
<div class="demo-gap"></div>
<div class="demo-row">${piece(HERO, '<div class="seg" role="group" aria-label="Difficulty">')}${piece(HERO, '<button class="fs-btn')}${piece(NAV, '<a class="icon-btn"')}${piece(LOG, '<button class="link-btn"')}</div>
</div>`, { js: true });

add("type", "Pixel display type", "Display is Jersey 10, a pixel face, always weight 400. The title runs at --cb-title (line-height .78) in --cb-title-ink with a hard black step (--cb-step-title) and a glow mixed from --cb-glow; a smaller word rides its corner as a tilted sticker in a cyan-to-blue gradient with its own black step. Section heads stack a cyan mono kicker behind a 24px rule, an --cb-h2 title with a --cb-step shadow whose second line drops to --cb-dim, and a muted line.",
  `<div class="demo-pad">
<div class="demo-center">${piece(HERO, '<h1 class="title')}</div>
<div class="demo-gap"></div>
${piece(FEATURES, '<div class="head')}
</div>`);

add("hero", "Hero & game console", "The centred hero: eyebrow, the CYBER BIRD title, a muted lede with ink highlights, a keycap CTA row, and the console: a glass slab with a gradient border mixed from --cb-glow2 and the accent, a mono status bar (three lamps, the first lit cyan; a T+ clock; the difficulty switch), a 16:9 black screen (4:3 under 640px) holding the game, here a pixel attract scene in the theme's sky, and four telemetry cells with Jersey 10 figures. A mono spec row closes it.",
  asDiv(HERO), { js: true });

add("marquee", "Pixel ticker", "A full-width band between hairlines with faded edges: Jersey 10 capitals at --cb-big in --cb-muted (the key words in ink), separated by cyan diamonds, scrolling left on a --cb-marquee loop.",
  MARQUEE);

add("bento", "Feature bento", "A 6-column bento of glass cards (18px corners, a hairline, a faint top-lit gradient) with a spotlight mixed from --cb-glow2 that follows the pointer. Each card pairs a dim mono tag, a Jersey 10 title and a muted line with a live pixel picture: the cyber-pickup hovering on its jets over speed lines, a steel rocket stack it threads, three sky swatches that switch the theme, a charge gauge with a cell ladder, and a code well.",
  asDiv(FEATURES), { js: true });

add("modes", "Mode cards", "Three glass cards: a giant Jersey 10 name, a mono badge, a line and three 12-cell meters (lit cells in ink), over a ruled foot with the best score and a button. The selected card takes a cyan border and inner ring, a filled badge and the primary button.",
  asDiv(MODESEC), { js: true });

add("manual", "Flight manual", "Controls as rows of keycaps (Jersey 10 in a 3px ink border with a hard black step, OR in dim mono between them) against a mono action label, beside numbered pilot notes whose numbers are cyan Jersey 10 counters.",
  asDiv(MANUAL), { js: true });

add("log", "Mission log", "A five-cell record strip in one glass frame split by hairlines: dim mono labels over Jersey 10 figures at --cb-log, the charge in --cb-accent-hi. Two columns under 900px. A mono foot line and an underlined reset link sit under it.",
  asDiv(LOG));

add("cta", "Final call", "The closing block: a centred kicker, a giant --cb-final YOU with a cyan full stop and the stepped shadow, a muted line and the keycap launch button.",
  asDiv(FINAL));

add("footer", "Footer", "A hairline-topped footer: dim mono small print on the left, two pixel icon keys on the right.",
  FOOT);

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// The page fixes its nav 14px from the top and pads its hero for it, and spaces the ticker 110px under
// the hero; as components the nav sits in the flow and the ticker carries no margin. The glow pair is registered (@property) so a theme switch fades over --cb-dur-glow, and
// it is set on the root from the per-theme tokens.
const EXTRA = `
.${P} { color-scheme: dark; --cb-glow: var(--cb-night-glow); --cb-glow2: var(--cb-night-glow2); transition: --cb-glow var(--cb-dur-glow) ease, --cb-glow2 var(--cb-dur-glow) ease; }
.nav { position: relative; top: auto; left: auto; translate: none; width: auto; z-index: 3; }
.hero { padding: 72px 0 0; }
.screen > canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.demo-sky { position: relative; height: 320px; transform: translateZ(0); overflow: hidden; background: var(--cb-bg); }
.demo-pad { padding: clamp(28px, 4vw, 48px) var(--cb-gutter); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 18px; }
.demo-row > .cta-row { margin-top: 0; justify-content: flex-start; }
.demo-row > .chips { margin-top: 0; }
.demo-gap { height: 26px; }
.demo-center { display: flex; justify-content: center; padding-bottom: clamp(48px, 7vw, 96px); }
.demo-center .title { margin-top: 0; }
.marquee { margin-top: 0; }
.final { padding-top: 110px; padding-bottom: 110px; }`;
const PROPS = `
@property --cb-glow { syntax: '<color>'; inherits: true; initial-value: #3B5BFF; }
@property --cb-glow2 { syntax: '<color>'; inherits: true; initial-value: #4FD8FF; }`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== P && !m[1].startsWith(`${P}-`)) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith(`${P}-`)) CLASSES.add(n);
const KEYFRAMES = ["blink", "scroll"];
const ATTRS = ["set-theme", "diff", "at", "scene", "stars", "sprite", "sky"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: P, hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .cb itself, or :where(.cb) in front
const ROOTED = new RegExp(`(^|[\\s,(>+~])\\.${P}(?![\\w-])`);
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.${P}) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = (rootEvery(prefixCss(tokenize(base + "\n" + EXTRA))) + PROPS).replace(/\n{3,}/g, "\n\n").trim();
// A literal the token pass should have caught means the swaps have drifted from the page
for (const h of Object.keys(HEX)) if (componentCss.toLowerCase().includes(h)) throw new Error("literal left: " + h);

/* ── 6. Component script ─────────────────────────────────────────────── */
// The page's Sprites module, verbatim: every picture is drawn pixel by pixel from it
const SPRITES = between("const Sprites = (() => {", "/* =========================================================================\n   GAME").trim();
// Its two scene helpers (the rocket stack and the twin jet smoke), verbatim
const STACK = between("    function drawStack(", "    function miniFrame(").trim();
const JS = `(function () {
  'use strict';
  /* Cyber Bird components, no libraries, no image files. Every picture is
     drawn into a canvas by the page's own Sprites module below. Handlers are
     delegated from the document, so components added later work too. With
     prefers-reduced-motion the stars and scenes hold still and every CSS loop
     stops. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(scope, sel) { return [].slice.call(scope.querySelectorAll(sel)); }
  function themeOf(el) { var r = el.closest('.${P}'); return (r && r.getAttribute('data-${P}-theme')) || 'night'; }

${SPRITES}

  var S = Sprites.all();
  ${STACK}

  /* Sprites and sky swatches: <canvas data-${P}-sprite="car"> and <canvas data-${P}-sky="night|dawn|day"> */
  function paint(scope) {
    all(scope, 'canvas[data-${P}-sprite="car"]').forEach(function (c) { var g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); g.drawImage(S.car_idle, 0, 0); });
    all(scope, 'canvas[data-${P}-sky]').forEach(function (c) { c.getContext('2d').drawImage(Sprites.background(c.getAttribute('data-${P}-sky'), c.width, c.height), 0, 0); });
  }

  /* Scenes: <canvas data-${P}-scene="car|rocket|attract">, drawn every frame while on screen */
  var skies = {};
  function sky(name) { return skies[name] || (skies[name] = Sprites.background(name, 640, 360)); }
  function scene(c, t) {
    var g = c.getContext('2d'), kind = c.getAttribute('data-${P}-scene'), cy, cx, i, x;
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, c.width, c.height);
    if (kind === 'car') {
      for (i = 0; i < 7; i++) {
        x = ((i * 41 - t * 90) % 140 + 140) % 140 - 10;
        g.fillStyle = 'rgba(238,243,255,.22)';
        g.fillRect(Math.round(x), 6 + i * 7, 6 + (i % 3) * 3, 1);
      }
      cy = Math.round(20 + Math.sin(t * 3) * 2);
      drawSmoke(g, 39, cy, Math.floor(t / .5 * 14));
      g.drawImage(S.car_idle, 39, cy);
      g.drawImage(S.light_beam, 80, cy + 5);
    } else if (kind === 'rocket') {
      drawStack(g, 58, 88, 128, 210);
      cy = Math.round(98 + Math.sin(t * 2.4) * 3);
      cx = Math.round(-30 + ((t * 26) % 60));
      drawSmoke(g, cx, cy, Math.floor(t / .5 * 14));
      g.drawImage(S.car_idle, cx, cy);
      g.drawImage(S.light_beam, cx + 41, cy + 5);
    } else {
      /* Attract mode: the game's 640x360 field in the theme's sky, stacks scrolling past a bobbing truck */
      g.drawImage(sky(themeOf(c)), 0, 0);
      var gaps = [118, 150, 96, 170], span = 170;
      for (i = 0; i < 5; i++) {
        x = Math.round(((i * span - t * 115) % (span * 5) + span * 5) % (span * 5) - 40);
        var top = gaps[i % gaps.length];
        drawStack(g, x, top, top + 80, 360);
      }
      cy = Math.round(150 + Math.sin(t * 2.2) * 14);
      drawSmoke(g, 150, cy, Math.floor(t / .5 * 14));
      g.drawImage(S.car_idle, 150, cy);
      g.drawImage(S.light_beam, 191, cy + 5);
    }
  }

  /* Starfield: <canvas data-${P}-stars> fills its containing block with drifting, twinkling pixel stars */
  var TINTS = { night: [200, 212, 255], dawn: [255, 205, 225], day: [210, 230, 255] };
  function stars(c, t) {
    var r = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) return;
    if (c.width !== w * dpr || c.height !== h * dpr || !c._cbStars) {
      c.width = w * dpr; c.height = h * dpr;
      c._cbStars = [];
      for (var i = 0, n = Math.round(w * h / 5200); i < n; i++) c._cbStars.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), p: Math.random() * 6.28 });
    }
    var g = c.getContext('2d'), tint = TINTS[themeOf(c)] || TINTS.night, sy = window.scrollY;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    c._cbStars.forEach(function (s) {
      var size = s.z > .9 ? 2 : 1;
      var x = (s.x - t * 6 * (.2 + s.z)) % w; if (x < 0) x += w;
      var y = (s.y - sy * (.05 + s.z * .15)) % h; if (y < 0) y += h;
      var a = (.25 + s.z * .6) * (.65 + .35 * Math.sin(t * (1 + s.z * 2) + s.p));
      g.fillStyle = 'rgba(' + tint[0] + ',' + tint[1] + ',' + tint[2] + ',' + a.toFixed(3) + ')';
      g.fillRect(Math.round(x), Math.round(y), size, size);
    });
  }

  function onScreen(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; }
  function frame(now) {
    var t = now / 1000;
    all(document, 'canvas[data-${P}-scene]').forEach(function (c) { if (onScreen(c)) scene(c, t); });
    all(document, 'canvas[data-${P}-stars]').forEach(function (c) { if (onScreen(c)) stars(c, t); });
  }
  function still() { paint(document); all(document, 'canvas[data-${P}-scene]').forEach(function (c) { scene(c, 0); }); all(document, 'canvas[data-${P}-stars]').forEach(function (c) { stars(c, 0); }); }
  function boot() {
    still();
    if (reduce) { addEventListener('scroll', still, { passive: true }); addEventListener('resize', still); return; }
    (function loop(now) { if (!document.hidden) frame(now); requestAnimationFrame(loop); })(performance.now());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  /* Sky switch: any [data-${P}-set-theme] sets data-${P}-theme on its .${P} root and presses its partners */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.${P}')) return;
    var b = t.closest('[data-${P}-set-theme]');
    if (b) {
      var root = b.closest('.${P}'), name = b.getAttribute('data-${P}-set-theme');
      root.setAttribute('data-${P}-theme', name);
      all(root, '[data-${P}-set-theme]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-${P}-set-theme') === name)); });
      if (reduce) still();
    }
    /* Segmented switches: one pressed per group */
    var d = t.closest('.${P}-seg [data-${P}-diff]');
    if (d) all(d.parentNode, '[data-${P}-diff]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === d)); });
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* Card spotlight: the pointer position feeds the --${P}-glow2 wash */
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.${P}-card');
    if (!c) return;
    var r = c.getBoundingClientRect();
    c.style.setProperty('--${P}-mx', e.clientX - r.left + 'px');
    c.style.setProperty('--${P}-my', e.clientY - r.top + 'px');
  }, { passive: true });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const pm = (html) => prefixMarkup(unhook(html));
const brand = pm(piece(NAV, '<a class="brand"'));
const themeSeg = pm(piece(NAV, '<div class="seg" role="group" aria-label="Sky theme">'));
const ctaRow = pm(piece(HERO, '<div class="cta-row'));
const CHROME = `
html,body{margin:0;background:var(--cb-bg)}
.sp-top,.sp-main{position:relative;z-index:2}
.sp-top{padding:0 var(--cb-gutter);border-bottom:1px solid var(--cb-line)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;max-width:var(--cb-maxw);min-height:76px;margin:0 auto}
.sp-meta>span{font:500 11px var(--cb-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--cb-muted)}
.sp-hero{display:flex;flex-direction:column;align-items:center;max-width:var(--cb-maxw);margin:0 auto;padding:clamp(40px,6vw,84px) 0 clamp(52px,6vw,88px);text-align:center}
.sp-hero h1{margin:26px 0 22px;font:400 clamp(72px,11vw,168px)/.8 var(--cb-font-display);letter-spacing:.02em;color:var(--cb-title-ink);text-shadow:var(--cb-step-title) var(--cb-step-title) 0 var(--cb-void),0 0 90px color-mix(in oklab,var(--cb-glow) 50%,transparent)}
.sp-hero h1 em{font-style:normal;color:var(--cb-accent)}
.sp-hero>p{max-width:640px;margin:0;font-size:var(--cb-lede);line-height:1.6;color:var(--cb-muted)}
.sp-hero .cb-cta-row{margin-top:30px}
.sp-swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:34px}
.sp-swatches i{width:40px;height:40px;border:3px solid var(--cb-ink);box-shadow:4px 4px 0 var(--cb-void)}
.sp-main{max-width:1260px;margin:0 auto;padding:0 var(--cb-gutter) 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:14px 0 0;font:400 clamp(40px,4.4vw,60px)/.9 var(--cb-font-display);letter-spacing:.02em;color:var(--cb-ink);text-shadow:var(--cb-step) var(--cb-step) 0 var(--cb-void)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font:500 12px/1 var(--cb-font-mono);letter-spacing:.18em;text-transform:uppercase;color:var(--cb-accent-hi)}
.sp-label::before{content:"";width:24px;height:1px;background:currentColor}
.sp-note{margin:0;max-width:680px;font-size:15px;line-height:1.6;color:var(--cb-muted)}
.sp-demo .cb-block{padding-bottom:56px}
.sp-demo{--cb-block:56px;position:relative;overflow:clip;border:1px solid var(--cb-line);border-radius:var(--cb-r-card);background:rgba(4,5,11,.72)}
#c-nav .sp-demo{overflow:visible;padding:14px;background:transparent}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
${prefixMarkup(unhook(SKY.join("\n")))}
<header class="sp-top">
<div class="sp-meta">${brand}${themeSeg}<span>Design system · cyber-bird@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<p class="sp-label">Pixel night arcade</p>
<h1>Press <em>start.</em></h1>
<p>A dark arcade language for games, launches and playful AI products: a night sky of drifting pixel stars and scanlines, Jersey 10 pixel type with a hard black step, one cyan glow, mono labels, keycaps with a key hint, and a Night / Dawn / Day switch that retints every glow. Every picture is drawn pixel by pixel in code. Extracted from the Cyber Bird arcade page.</p>
${ctaRow}
<div class="sp-swatches" aria-label="Core colours">
<i title="--cb-accent" style="background:var(--cb-accent)"></i><i title="--cb-accent-hi" style="background:var(--cb-accent-hi)"></i><i title="--cb-night-glow" style="background:var(--cb-night-glow)"></i><i title="--cb-dawn-glow" style="background:var(--cb-dawn-glow)"></i><i title="--cb-dawn-glow2" style="background:var(--cb-dawn-glow2)"></i><i title="--cb-day-glow2" style="background:var(--cb-day-glow2)"></i><i title="--cb-key" style="background:var(--cb-key)"></i>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Cyber Bird",
  slug: "cyber-bird",
  version: VERSION,
  prefix: P,
  rootClass: P,
  labelClass: "sp-label",
  script: "scripts/systems/cyber-bird.mjs",
  source: SOURCE,
  metaDescription: "The Cyber Bird design system: tokens and working components extracted from the Cyber Bird one-button arcade page.",
  defsNote: "not used: every picture is a canvas drawn pixel by pixel by the component script, and icons are inline 12x12 SVG",
  jsNote: "the page's Sprites module (truck, rockets, smoke, skies), the scenes and starfield, the Night / Dawn / Day switch, segmented switches and the card spotlight",
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
writeSystem({ slug: "cyber-bird", prefix: P, rootClass: P, version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-primary", "btn-ghost", "card", "nav", "brand", "seg", "key", "kbd", "title", "h2", "console", "screen", "bento", "mode", "chip", "pix", "wrap", "eyebrow", "sky", "aura", "scan"] });
