// Extracts the Modelyard design system from its landing page.
//
//   node scripts/systems/modelyard.mjs
//
// Reads public/demos/modelyard-router.html (never edits it) and writes
// public/systems/modelyard/ (specimen.html, tokens.css, modelyard.css) through
// the shared pipeline in lib.mjs. The page keeps one flat <style>; the system
// keeps all of it but the document shell and the load-in rise, and lifts every
// section's own top margin out (the section rhythm is the --my-s-* tokens).
// The notch is the page's own trick, kept as is: no clip-path, each panel
// paints a square of its NEIGHBOUR's colour behind its rounded corner at
// z-index -5, so every notched component carries its own stacking context.
// What the page's script writes at boot is written here at build time with the
// page's own code: the catalog cards and their benchmark plates (card() over
// the MODELS table), the slot reels' seven cells, the bench key, the uptime
// ticks and the policy estimate. What it does on input stays in the component
// script: the burger menu that swaps out the hero, the model carousel, route
// toggles and the nav count, copy buttons, the policy console, the FAQ, plan
// picks and the signup note.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/modelyard-router.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:opsz,wght@14..32,300..800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">';
const GRAIN = /\.grain::before \{[^}]*?background-image: (url\("data:image\/svg\+xml;utf8,[^"]+"\));/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Modelyard · modelyard@${VERSION}
   Extracted from https://instalanding.ai/demos/modelyard-router.html
   Fonts (Google Fonts): Anton (display, always capitals), Inter 300-800 (text), JetBrains Mono 400-600 (labels, data, code) */
:root {
  /* Color · core */
  --my-blue: #183FAD;
  --my-blue-2: #3253B6;
  --my-blue-3: #ABB9DE;
  --my-blue-deep: #0D2770;
  --my-yellow: #F1BF0A;
  --my-ink: #0B0D14;
  --my-white: #FFFFFF;

  /* Color · surfaces */
  --my-bg: #FFFFFF;
  --my-chip: #EEF0F7;
  --my-soft: #C7D1EC;
  --my-mist: #E9ECF6;
  --my-knob: #E9EBF2;
  --my-night: #0B0F1F;
  --my-muted: #586078;
  --my-ok: #3DDC97;
  --my-line: rgba(11, 13, 20, 0.11);
  --my-line-strong: rgba(11, 13, 20, 0.24);
  --my-glow: rgba(120, 150, 255, 0.22);
  --my-glow-night: rgba(70, 105, 230, 0.32);

  /* Color · code */
  --my-code-bg: #0A1233;
  --my-code-fg: #DDE3F5;
  --my-code-key: #F1BF0A;
  --my-code-str: #A9BBF0;
  --my-code-dim: #6C789E;

  /* Type · families */
  --my-font-display: "Anton", Impact, "Arial Narrow", sans-serif;
  --my-font-text: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  --my-font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  /* Type · scale */
  --my-display: clamp(48px, 11.2vw, 124px);
  --my-menu-lg: clamp(56px, 7.5vw, 88px);
  --my-h2: clamp(42px, 7.4vw, 66px);
  --my-menu: clamp(40px, 13vw, 60px);
  --my-h2-code: clamp(36px, 5.4vw, 54px);
  --my-h2-console: clamp(34px, 5vw, 50px);
  --my-h2-cta: clamp(32px, 4.8vw, 48px);
  --my-price: 48px;
  --my-stat: 36px;
  --my-h3: 28px;
  --my-lead: 17px;
  --my-text: 16px;
  --my-ui: 15px;
  --my-small: 13px;
  --my-eyebrow: 11px;

  /* Shape · radii */
  --my-r: 32px;
  --my-r-sm: 20px;
  --my-pill: 999px;

  /* Shape · borders */
  --my-focus: 2px;

  /* Depth · moulded plastic and grain */
  --my-sh-raised: 0 1px 1px rgba(9, 12, 30, 0.08), 0 8px 18px -10px rgba(9, 12, 30, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.55), inset 0 -2px 3px -1px rgba(0, 0, 0, 0.14), inset 0 12px 18px -6px rgba(255, 255, 255, 0.22);
  --my-sh-pressed: 0 1px 1px rgba(9, 12, 30, 0.06), inset 0 2px 6px rgba(0, 0, 0, 0.22), inset 0 -4px 10px -2px rgba(255, 255, 255, 0.35);
  --my-sh-knob: 0 12px 22px -10px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -3px 4px -1px rgba(0, 0, 0, 0.16), inset 0 16px 22px -8px rgba(255, 255, 255, 0.5);
  --my-sh-knob-on: 0 6px 14px -8px rgba(0, 0, 0, 0.5), inset 0 3px 7px rgba(0, 0, 0, 0.2), inset 0 -5px 10px -2px rgba(255, 255, 255, 0.45);
  --my-sh-term: 0 30px 60px -30px rgba(10, 18, 51, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  --my-sh-night: 0 30px 60px -34px rgba(11, 15, 31, 0.7);
  --my-grain: ${GRAIN};

  /* Motion · easing */
  --my-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Motion · durations */
  --my-dur-hover: 200ms;
  --my-dur-button: 220ms;
  --my-dur-press: 260ms;
  --my-dur-turn: 300ms;
  --my-dur-open: 360ms;
  --my-dur-swap: 420ms;
  --my-dur-fill: 480ms;
  --my-rig: 7.5s;

  /* Space · layout */
  --my-wrap: 1080px;
  --my-gap: 16px;
  --my-s-xl: clamp(80px, 11vw, 136px);
  --my-s-l: clamp(64px, 8vw, 96px);
  --my-s-m: clamp(36px, 5vw, 52px);
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--display -> --my-font-display);
// (--panel-ink and --soft-ink are the ink, --quiet the ground); local ones (--pill-bg, --plate, --v, --travel, the rig's face colours ...) move under my- too
const VARS = { display: "font-display", sans: "font-text", mono: "font-mono", "panel-ink": "ink", "soft-ink": "ink", quiet: "bg" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("my-") ? m : `--my-${VARS[n] ?? n}`));
const HEX = {
  "#183fad": "blue", "#3253b6": "blue-2", "#abb9de": "blue-3", "#0d2770": "blue-deep", "#f1bf0a": "yellow",
  "#0b0d14": "ink", "#ffffff": "white", "#eef0f7": "chip", "#c7d1ec": "soft", "#e9ecf6": "mist", "#e9ebf2": "knob",
  "#0b0f1f": "night", "#586078": "muted", "#3ddc97": "ok",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Matches a literal value however the page wrapped it across lines
const flex = (v) => new RegExp(esc(v.trim()).replace(/\s+/g, "\\s*"), "g");
const val = (v, tok) => [flex(v), `var(--my-${tok})`];
const fs_ = (v, tok) => [new RegExp(`font-size: ${esc(v)};`, "g"), `font-size: var(--my-${tok});`];
const dur = (v, tok) => [new RegExp(`(?<![\\d.])${esc(v)} var\\(--my-ease\\)`, "g"), `var(--my-${tok}) var(--my-ease)`];
const SWAPS = [
  val("clamp(48px, 11.2vw, 124px)", "display"), val("clamp(56px, 7.5vw, 88px)", "menu-lg"), val("clamp(42px, 7.4vw, 66px)", "h2"),
  val("clamp(40px, 13vw, 60px)", "menu"), val("clamp(36px, 5.4vw, 54px)", "h2-code"), val("clamp(34px, 5vw, 50px)", "h2-console"),
  val("clamp(32px, 4.8vw, 48px)", "h2-cta"),
  fs_("48px", "price"), fs_("36px", "stat"), fs_("28px", "h3"), fs_("17px", "lead"), fs_("16px", "text"), fs_("15px", "ui"),
  fs_("13px", "small"), fs_("11px", "eyebrow"),
  [/border-radius: 999px/g, "border-radius: var(--my-pill)"],
  [/outline: 2px solid/g, "outline: var(--my-focus) solid"],
  val("rgba(11, 13, 20, 0.11)", "line"), val("rgba(11, 13, 20, 0.24)", "line-strong"),
  val("rgba(120, 150, 255, 0.22)", "glow"), val("rgba(70, 105, 230, 0.32)", "glow-night"),
  val(`0 12px 22px -10px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -3px 4px -1px rgba(0, 0, 0, 0.16),
    inset 0 16px 22px -8px rgba(255, 255, 255, 0.5)`, "sh-knob"),
  val(`0 6px 14px -8px rgba(0, 0, 0, 0.5),
    inset 0 3px 7px rgba(0, 0, 0, 0.2),
    inset 0 -5px 10px -2px rgba(255, 255, 255, 0.45)`, "sh-knob-on"),
  val("0 30px 60px -30px rgba(10, 18, 51, 0.55), inset 0 0 0 1px rgba(255, 255, 255, 0.06)", "sh-term"),
  val("0 30px 60px -34px rgba(11, 15, 31, 0.7)", "sh-night"),
  [/7\.5s infinite/g, "var(--my-rig) infinite"],
  dur("200ms", "dur-hover"), dur("220ms", "dur-button"), dur("260ms", "dur-press"), dur("300ms", "dur-turn"),
  dur("360ms", "dur-open"), dur("420ms", "dur-swap"), dur("480ms", "dur-fill"),
  // The data hook the CSS reads moves under the prefix with the markup
  [/\[data-icon=/g, "[data-my-icon="],
];

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
// Page-only parts: the document shell and the load-in rise (a page sequence, not a component)
const DROP = /^(html|\.rise)$/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".my" : null;
  if (sel === "*") return ":where(.my, .my *)";
  if (sel === "body") return ".my";
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
    if (prelude.startsWith("@keyframes")) return prelude === "@keyframes rise" ? "" : rule;
    const parts = splitSelectors(prelude)
      .filter((s) => !DROP.test(s))
      .map((s) => scopeSelector(s, inMedia))
      .filter(Boolean);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // The rig's right-face colour shares --r with the panel radius; give it its own name
  .replace(/--r: #/g, "--rf: #")
  .replace("background-color: var(--r);", "background-color: var(--rf);")
  // The document's 16px frame is the host page's job, not the root's
  .replace(/(body \{[^}]*?)\s*min-height: 100dvh;\s*padding: var\(--gap\) var\(--gap\) 0;/, "$1")
  // Sections carry no outer margin: the page's rhythm is --my-s-xl / -l / -m between them
  .replace(/\n\s*margin-top: var\(--s-(?:xl|l|m)\);/g, "")
  .replace(/margin-top: var\(--s-(?:xl|l|m)\); ?/g, "")
  .replace(`background-image: ${GRAIN};`, "background-image: var(--grain);");
if (pageRules.includes("data:image")) throw new Error("grain left in the rules");
const base = renameVars(keep(pageRules));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; the script's hooks become data attributes;
// every other id moves under my-
const ANCHORS = "top|hero|quickstart|catalog|policy|plans|faq|signup|footer";
const HOOKS = "section|component";
const unhook = (html) => html
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="sw-(\w+)"/g, ' data-policy="$1"')
  .replace(/ id="prevModel"/g, ' data-step="-1"')
  .replace(/ id="nextModel"/g, ' data-step="1"')
  .replace(/ id="(?!my-)([^"]+)"/g, ' id="my-$1"')
  .replace(/ aria-controls="(?!my-)([^"]+)"/g, ' aria-controls="my-$1"')
  // The page's load-in sequence stays with the page
  .replace(/ class="([^"]*)"/g, (_, l) => ` class="${l.split(/\s+/).filter((c) => c && c !== "rise").join(" ")}"`)
  .replace(/ style="--d:\d+ms"/g, "")
  // SVG fills become styles, so the marks follow the colour tokens
  .replace(/ fill="(#[0-9a-f]{6})"/gi, ' style="fill:$1"')
  .replace(/^  /gm, "");
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<(section|main)/, "<div").replace(/<\/(section|main)>$/, "</div>");

/* What the page's script writes at boot, written here with the page's own code */
const LIB_AT = page.indexOf("var BENCH = [");
const LIB_END = page.indexOf("/* fill each slot reel");
const CARD_AT = page.indexOf("function card(m, i) {");
const CARD_END = page.indexOf("MODELS.forEach(function (m, i) { grid.appendChild");
const PAL_AT = page.indexOf("var PALETTES = [");
if ([LIB_AT, LIB_END, CARD_AT, CARD_END, PAL_AT].some((i) => i < 0)) throw new Error("page script markers not found");
const LIB = page.slice(LIB_AT, LIB_END).trim();
const PALETTES = page.slice(PAL_AT, page.indexOf("];", PAL_AT) + 2);
const fakeDoc = { createElement: () => ({ dataset: {} }) };
const lib = new Function("document", `${LIB}\n${page.slice(CARD_AT, CARD_END)}\nreturn { BENCH: BENCH, MODELS: MODELS, card: card, avg: avg };`)(fakeDoc);
const cardHtml = (i) => {
  const li = lib.card(lib.MODELS[i], i);
  return `<li class="${li.className}" data-i="${i}">${li.innerHTML}</li>`;
};
// The policy estimate: the page's syncPolicy, reading a set of switches instead of the DOM
const POLICY = `function policy(on) {
    var has = function (k) { return on.indexOf(k) >= 0; };
    var LABEL = { cost: "cost", fast: "latency", eval: "eval score" };
    var order = on.filter(function (k) { return k !== "fail"; }).map(function (k) { return LABEL[k]; });
    var failover = has("fail");
    /* embedding and safety endpoints aren't chat models, so they never win */
    var routable = MODELS.filter(function (m) { return m.chat; });
    var pool = routable.slice().sort(function (a, b) { return a.in - b.in; });
    if (has("fast")) pool = routable.slice().sort(function (a, b) { return a.ms - b.ms; });
    if (has("eval")) pool = pool.filter(function (m) { return avg(m) > 70; });
    if (!pool.length) pool = routable.slice();
    var picked = pool[0];
    var blend = pool.slice(0, failover ? 2 : 1);
    var rate = blend.reduce(function (t, m) { return t + m.in; }, 0) / blend.length;
    var tail = failover && blend[1] ? ", falling back to " + blend[1].name + "." : ".";
    return {
      est: "$" + rate.toFixed(2) + " <small>/ 1M in</small>",
      line: order.length
        ? "Routing by <b>" + order.join("</b>, then <b>") + "</b>, with failover <b>" + (failover ? "on" : "off") + "</b>. Requests land on " + picked.name + tail
        : "No policy selected. Every request goes to " + picked.name + ", with failover <b>" + (failover ? "on" : "off") + "</b>."
    };
  }`;
const policy = new Function(`${LIB}\nreturn ${POLICY};`)();
// Slot reels: seven copies of the icon, as the page fills them
const reels = (html) => html.replace(/(<span class="reel [^"]*" data-icon="(\w+)">)(<\/span>)/g, (_, open, icon, close) =>
  open + `<span class="cell"><span class="sc"><i class="ic-${icon}"></i></span></span>`.repeat(7) + close);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<nav class="nav wrap"');
const SWAP = reels(el('<div class="hero-swap wrap"'));
const HERO = piece(SWAP, '<header class="header');
const LOGOS = el('<section class="logos wrap');
const CODE = el('<section class="code wrap');
const CATALOG = el('<main class="main wrap"');
const CONSOLE = (() => {
  const raw = reels(el('<section class="console wrap'));
  const p = policy(["cost", "eval", "fail"]);
  return raw
    .replace(/(<p class="readout-line" id="policyLine">)[\s\S]*?(<\/p>)/, `$1${p.line}$2`)
    .replace(/(<span class="est" id="policyEst">)[\s\S]*?(<\/span>)/, `$1${p.est}$2`);
})();
const PLANS = el('<section class="plans wrap"');
const FAQ = el('<section class="faq wrap"');
const SIGNUP = el('<section class="signup wrap"');
let ticks = "";
for (let d = 0; d < 45; d++) ticks += `<i${d === 17 || d === 38 ? ' class="warn"' : ""}></i>`;
const FOOT = el('<footer class="footer wrap')
  .replace(/(<div class="uptime"[^>]*>)(<\/div>)/, `$1${ticks}$2`);

const RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /></svg>';

add("buttons", "Pills & round buttons", "One pill shape in three finishes, all with a 34px knob behind the icon that grows into a full fill on hover: yellow (the one primary action per screen, in moulded --my-sh-raised plastic), ghost (a hairline ring that fills cobalt) and glass (on cobalt, fills white). The glass pill carries the yellow mono route count. Round buttons are quiet hairline rings that turn cobalt on hover and cobalt with a yellow glyph when pressed; on cobalt they are 44px glass rings.",
  `<div class="demo-pad">
<div class="demo-row">${piece(HERO, '<a class="pill"')}${piece(CATALOG, '<a class="pill pill--ghost"')}${piece(cardHtml(0), '<button class="btn-round add"')}${piece(cardHtml(0), '<button class="btn-round add"').replace('aria-pressed="false"', 'aria-pressed="true"')}${piece(CODE, '<button class="btn-round"')}</div>
</div>
<div class="demo-pad demo-panel lit grain">
<div class="demo-row">${piece(NAV, '<a class="pill pill--glass"')}${piece(HERO, '<a class="pill"')}${piece(HERO, '<button class="btn-round btn-round--blue"')}${piece(HERO, '<button class="btn-round btn-round--blue" type="button" aria-label="Next model"')}</div>
</div>`, { js: true });

add("type", "Poster type", "Anton for every heading, always in capitals, at line-height .9-1: the headline at --my-display with its second line in an <em> tinted --my-blue-3, section titles at --my-h2. Inter carries the copy (muted on white, 82-92% white on cobalt); JetBrains Mono carries eyebrows (11px, .14em tracking, capitals), labels, prices and every number in data.",
  `<div class="demo-pad demo-panel lit grain">
${piece(HERO, '<h1 class="headline">')}
</div>
<div class="demo-pad">
${piece(CATALOG, '<div class="main-head">')}
</div>`);

add("nav", "Notched nav", "The brand tab and the cobalt bar interlock: the white tab's bottom-right corner is rounded and a cobalt square painted behind it (z-index -5) makes the corner read as a notch cut into the bar. The bar carries the burger and the glass Your route pill with its yellow count. Followed by a hero swap (as in the next component), the burger replaces the hero with the menu.",
  NAV, { js: true });

add("hero", "Notched hero & menu", "The nav over a lit cobalt panel with grain: the two-line poster headline, a lighter stage panel holding a yellow mono label, the copy and a pale-blue stat panel with a big Anton number and three slot-reel chips, and a notched foot (the yellow pill in a cobalt tab, the stage's floor, and a cobalt tab with two round arrows) whose corners bite into each other. An isometric stack of five labelled layers floats over it from 1024px. The arrows walk a model through the label, copy, stat, chips and layer labels; the burger blurs the hero out and lets the menu rows rise into the same panel.",
  `${NAV}\n${SWAP}`, { js: true });

add("stage", "Stage & stat panel", "The hero's stage on its own: a --my-blue-2 panel with --my-r corners on a cobalt ground, a yellow mono label, copy at --my-lead, and the stat panel (--my-blue-3, --my-r-sm) with a big Anton figure and slot-reel chips that spin and settle. The foot is three notched tabs: cobalt, the stage colour, cobalt, each painting the neighbour's colour behind its corners.",
  `<div class="demo-pad demo-panel lit grain">
${piece(HERO, '<div class="stage">')}
</div>`, { js: true });

add("rig", "Isometric layer stack", "Five skewed boxes (left, right and top faces from --my-l, --my-rf and --my-t, the label in mono in --my-tx) drop in from alternating sides, settle onto the stack and sink out on a --my-rig loop. Under prefers-reduced-motion they rest stacked.",
  `<div class="demo-panel lit grain rig-stage">
${piece(HERO, '<div class="rig"')}
</div>`);

add("logos", "Logo strip", "A centred mono eyebrow over customer names set in the system's own faces: Anton spaced out, Inter 800 tight, mono, and Inter 300 tracked wide, all muted.",
  asDiv(LOGOS));

add("quickstart", "Code panel", "Copy beside a terminal: an Anton title at --my-h2-code, muted Inter copy and mono arrow bullets in cobalt, and a deep navy terminal (--my-code-bg, --my-r-sm) with a mono bar, a copy button that flashes a check, and a request with yellow keys, pale-blue strings and dim comments.",
  asDiv(CODE), { js: true });

add("catalog", "Notched catalog cards", "A section head (mono eyebrow, Anton title, muted copy and a ghost pill) over cards built from four notched pieces: the mono price block and the action tab bite into each other's corners, then the name row and a body holding a benchmark plate (seven labelled bars on a 0-100 grid in a cobalt shade, with the yellow, white or pale bars from the model) and a mono meta line. The plus toggles to a check, marks the card routed and counts it into every nav pill.",
  asDiv(CATALOG).replace('<ul class="grid" id="grid" role="list"></ul>', `<ul class="grid" role="list">${[0, 1, 2].map(cardHtml).join("")}</ul>`)
    .replace(/(<p class="bench-key" id="benchKey">)(<\/p>)/, `$1Benchmarks, scored 0–100: ${lib.BENCH.map((b) => `<b>${b.k}</b> ${b.n}`).join(" · ")}.$2`), { js: true });

add("console", "Policy console", "A lit cobalt panel with a yellow eyebrow and Anton title over four moulded toggles: 74px wells holding 66px knobs that press in and turn yellow when on, each with a spinning slot-reel icon and a mono caption. A glass readout restates the policy with yellow keywords and a mono estimate recomputed from the model table.",
  asDiv(CONSOLE), { js: true });

add("pricing", "Plan cards", "Three --my-r cards: the outer two in --my-chip with a ghost pill, the middle one night navy (--my-night with a blue glow) with grain, a yellow eyebrow, yellow checks and the yellow pill. Plan names in Anton at --my-h3, prices in Anton at --my-price with a mono period.",
  asDiv(PLANS), { js: true });

add("faq", "FAQ", "A mono eyebrow over --my-chip rows with --my-r-sm corners: a 600 question and a quiet round plus that turns cobalt on hover and a quarter into a cross when open; the answer opens on a height transition.",
  asDiv(FAQ), { js: true });

add("signup", "Signup panel", "A pale blue (--my-soft) panel with --my-r corners: an Anton title, a pill email field with an inset hairline and a yellow pill. Choosing a plan writes into the note line; the form validates natively and sends nothing.",
  asDiv(SIGNUP), { js: true });

add("footer", "Status footer", "A lit cobalt footer with grain and rounded top corners: the wordmark, a line of copy and a glass status card (a pinging green dot, a mono figure and 45 uptime ticks, degraded days in yellow), mono link column heads in --my-blue-3, and a base row of socials and a round back-to-top button.",
  FOOT);

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// (Also the first rule of the block, so it never opens on an @media the board's parsers could misread)
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
// The notch squares paint at z-index -5: every notched piece needs a stacking context of its own
// (nav, header, console, footer and the pill already make one; the card does not on the page)
const EXTRA = `
.card { isolation: isolate; }
.demo-pad { padding: clamp(24px, 4vw, 48px); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px 22px; }
.demo-panel { position: relative; z-index: 0; overflow: hidden; color: var(--white); border-radius: var(--r); }
.demo-panel .headline { padding-inline: 0; }
.rig-stage { height: 440px; }
.rig-stage .rig { display: block; left: 50%; bottom: 10px; }`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "my" && !m[1].startsWith("my-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("my-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["open", "is-open", "done", "in-route", "swapping"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["loop-turn", "slot-up", "slot-down", "land-down", "land-up", "x-turn", "eye-blink", "from-left", "from-right", "status-ping"];
const ATTRS = ["icon", "i", "plan", "policy", "step"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "my", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .my itself, or :where(.my) in front
const ROOTED = /(^|[\s,(>+~])\.my(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.my) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + renameVars(EXTRA)))).replace(/\n{3,}/g, "\n\n").trim();
const leftHex = componentCss.replace(/--my-(l|rf|t|tx):\s*#[0-9a-f]{6}/gi, "").match(/#[0-9a-f]{6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 6. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Modelyard components, no libraries. The page's model table drives the hero
     carousel and the policy estimate; everything else answers clicks: the burger
     swaps the hero for the menu, the plus on a card routes it and counts it into
     every nav pill, copy buttons flash a check, the console re-prices as switches
     move, FAQ rows open, plan picks write into the signup note. Every listener is
     delegated, so components added later work without setup. */
  ${LIB.replace(/\n/g, "\n  ")}
  ${PALETTES.replace(/\n/g, "\n  ")}
  ${POLICY}
  function all(scope, sel) { return [].slice.call(scope.querySelectorAll(sel)); }

  /* Copy with a select-the-text fallback; the button shows a check for 1.4s */
  function flash(btn, label) {
    var html = btn.innerHTML, aria = btn.getAttribute('aria-label');
    btn.innerHTML = CHECK;
    btn.classList.add('my-done');
    btn.setAttribute('aria-label', label);
    setTimeout(function () { btn.innerHTML = html; btn.classList.remove('my-done'); btn.setAttribute('aria-label', aria); }, 1400);
  }
  function copy(text, btn, node) {
    function fallback() {
      try { var r = document.createRange(); r.selectNodeContents(node); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
      flash(btn, 'Selected, press Ctrl+C to copy');
    }
    try { navigator.clipboard.writeText(text).then(function () { flash(btn, 'Copied'); }, fallback); } catch (e) { fallback(); }
  }

  /* Route count: every routed card, shown in every nav pill and open menu */
  function syncCount() {
    var n = document.querySelectorAll('.my-card.my-in-route').length;
    all(document, '.my-nav-count').forEach(function (c) { c.textContent = String(n); });
    return n;
  }

  /* Menu: the burger's nav is followed by a .my-hero-swap; the menu and the hero share its cell */
  function setMenu(nav, open) {
    var burger = nav.querySelector('.my-nav-burger'), swap = nav.nextElementSibling;
    if (burger) {
      burger.classList.toggle('my-is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    if (!swap || !swap.classList.contains('my-hero-swap')) return;
    var menu = swap.querySelector('.my-mobile-menu'), hero = swap.querySelector('.my-header');
    swap.classList.toggle('my-open', open);
    if (menu) { menu.inert = !open; menu.setAttribute('aria-hidden', String(!open)); }
    if (hero) { hero.inert = open; hero.setAttribute('aria-hidden', String(open)); }
    var line = swap.querySelector('.my-menu-foot p');
    if (open && line) { var n = syncCount(); line.textContent = n + (n === 1 ? ' model' : ' models') + ' in your route'; }
  }

  /* Carousel: the arrows walk a model through the stage, its stat chips and the rig's labels */
  function showFeatured(stage, dir) {
    var cur = stage._myFeat == null ? -1 : stage._myFeat;
    var i = cur < 0 && dir < 0 ? MODELS.length - 1 : (cur + dir + MODELS.length) % MODELS.length;
    stage._myFeat = i;
    var m = MODELS[i], q = function (s) { return stage.querySelector(s); };
    var chips = q('.my-stat-chips');
    if (chips) {
      if (dir > 0) chips.appendChild(chips.firstElementChild); else chips.insertBefore(chips.lastElementChild, chips.firstElementChild);
      var p = PALETTES[(i + 1) % PALETTES.length];
      chips.style.setProperty('--my-c-love', p.love);
      chips.style.setProperty('--my-c-death', p.death);
      chips.style.setProperty('--my-c-robot', p.robot);
      chips.style.setProperty('--my-c-eye', p.eye);
      chips.classList.remove('my-swapping'); void chips.offsetWidth; chips.classList.add('my-swapping');
      clearTimeout(chips._myT);
      chips._myT = setTimeout(function () { chips.classList.remove('my-swapping'); }, 700);
    }
    if (q('.my-stage-label')) q('.my-stage-label').textContent = m.tag + ' · ' + (i + 1) + ' / ' + MODELS.length;
    if (q('.my-stage-copy')) q('.my-stage-copy').textContent = m.name + ' serves a ' + m.ctx + ' context at ' + money(m.in) + ' per million input tokens, with a median first token in ' + m.ms + ' ms. Route to it by rule, or let the gateway pick per request.';
    if (q('.my-stat-num')) q('.my-stat-num').textContent = m.ms + ' ms';
    if (q('.my-stat p')) q('.my-stat p').textContent = 'Median first token for ' + m.name + ', measured from our edge';
    var head = stage.closest('.my-header');
    var labels = head ? all(head, '.my-side-top b') : [];
    var text = [m.id.split('-')[0].toUpperCase(), m.ctx.toUpperCase() + ' CTX', money(m.in) + '/1M', m.ms + ' MS', avg(m) + ' AVG'];
    labels.forEach(function (b, k) { if (text[k]) b.textContent = text[k]; });
  }

  /* Policy console: the switches that are on, through the page's own routing rule */
  function syncPolicy(con) {
    var on = all(con, 'input[data-my-policy]').filter(function (x) { return x.checked; }).map(function (x) { return x.getAttribute('data-my-policy'); });
    var r = policy(on), line = con.querySelector('.my-readout-line'), est = con.querySelector('.my-est');
    if (line) line.innerHTML = r.line;
    if (est) est.innerHTML = r.est;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.my')) return;
    var burger = t.closest('.my-nav-burger');
    if (burger) { var nav = burger.closest('.my-nav'); if (nav) setMenu(nav, burger.getAttribute('aria-expanded') !== 'true'); return; }
    var inMenu = t.closest('.my-mobile-menu a');
    if (inMenu) { var sw = inMenu.closest('.my-hero-swap'), n2 = sw && sw.previousElementSibling; if (n2 && n2.classList.contains('my-nav')) setMenu(n2, false); }
    var step = t.closest('[data-my-step]');
    if (step) { var stage = step.closest('.my-stage'); if (stage) showFeatured(stage, +step.getAttribute('data-my-step')); return; }
    var cardBtn = t.closest('.my-card .my-btn-round');
    if (cardBtn) {
      var li = cardBtn.closest('.my-card');
      if (cardBtn.classList.contains('my-copy-id')) { var code = li.querySelector('code'); copy(code.textContent, cardBtn, code); return; }
      var on = cardBtn.getAttribute('aria-pressed') !== 'true';
      cardBtn.setAttribute('aria-pressed', String(on));
      cardBtn.innerHTML = on ? CHECK : PLUS;
      li.classList.toggle('my-in-route', on);
      syncCount();
      return;
    }
    var term = t.closest('.my-term-bar .my-btn-round');
    if (term) { var pre = term.closest('.my-terminal').querySelector('pre'); copy(pre.textContent.split('\\n\\n# ')[0].trim(), term, pre); return; }
    var q = t.closest('.my-faq-q');
    if (q) { var open = q.closest('.my-faq-row').classList.toggle('my-open'); q.setAttribute('aria-expanded', String(open)); return; }
    var plan = t.closest('[data-my-plan]');
    if (plan) {
      var signup = document.querySelector('.my-signup'), note = signup && signup.querySelector('.my-note');
      if (note) { note.textContent = plan.getAttribute('data-my-plan') + ' tier selected. Add your work email to request a key.'; signup._myPlan = plan.getAttribute('data-my-plan'); }
      if (signup) signup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('change', function (e) {
    var con = e.target.closest && e.target.closest('.my-console');
    if (con && e.target.hasAttribute('data-my-policy')) syncPolicy(con);
  });
  document.addEventListener('submit', function (e) {
    var signup = e.target.closest && e.target.closest('.my-signup');
    if (!signup) return;
    e.preventDefault();
    var form = e.target;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var label = form.querySelector('.my-pill > span:last-child'), note = signup.querySelector('.my-note'), email = form.querySelector('input[type="email"]');
    if (label) label.textContent = 'Requested';
    if (note) note.textContent = 'Request logged for ' + email.value + ' on the ' + (signup._myPlan || 'Hobby') + ' tier.';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    all(document, '.my-nav-burger.my-is-open').forEach(function (b) { setMenu(b.closest('.my-nav'), false); b.focus(); });
  });
})();`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own nav and a lit header panel, holding the
// specimen's title, a stage with its stat, and the isometric stack labelled with the system's parts
const STAGE_COPY = "Cobalt panels that interlock through notched corners, huge Anton capitals with a tinted second line, yellow spent on one action per screen, and every number set in mono.";
const topNav = prefixMarkup(unhook(NAV
  .replace(/\n\s*<button class="nav-burger"[\s\S]*?<\/button>/, "")
  .replace(/>0<\/span>/, ">16</span>")
  .replace("Your route", "Components")
  .replace('href="#catalog"', 'href="#c-buttons"')))
  .replace(/ id="[^"]*"/g, "")
  .replace(/>16<\/span>/, `>${C.length}</span>`);
const topHero = prefixMarkup(unhook(reels(HERO)
  .replace(/<h1 class="headline">[\s\S]*?<\/h1>/, "<h1 class=\"headline\">NOTCHED PANELS.<br><em>COBALT POSTER.</em></h1>")
  .replace(/(<p class="stage-label" id="stageLabel">)[^<]*/, `$1DESIGN SYSTEM · MODELYARD@${VERSION}`)
  .replace(/(<p class="stage-copy" id="stageCopy">)[^<]*/, `$1${STAGE_COPY}`)
  .replace(/(<span class="stat-num" id="statNum">)[^<]*/, `$1${C.length}`)
  .replace(/(<p id="statCopy">)[^<]*/, "$1components, each sliced from the Modelyard model-router page")
  .replace(/(<a class="pill" href=")#quickstart(">[\s\S]*?<span>)Start routing/, "$1#c-catalog$2See the cards")
  .replace(/<button class="btn-round btn-round--blue" type="button" aria-label="Previous model" id="prevModel">([\s\S]*?)<\/button>/, '<a class="btn-round btn-round--blue" href="#c-hero" aria-label="Jump to the hero">$1</a>')
  .replace(/<button class="btn-round btn-round--blue" type="button" aria-label="Next model" id="nextModel">([\s\S]*?)<\/button>/, '<a class="btn-round btn-round--blue" href="#c-console" aria-label="Jump to the console">$1</a>')
  .replace(/>ROUTER</, ">TOKENS<").replace(/>CACHE</, ">PANELS<").replace(/>EVALS</, ">PILLS<").replace(/>FAILOVER</, ">PLATES<").replace(/>LOGS</, ">CONSOLE<")))
  .replace(/ id="[^"]*"/g, "");
const CHROME = `
body{margin:0;padding:var(--my-gap) var(--my-gap) 0;background:var(--my-bg)}
.sp-top{max-width:var(--my-wrap);margin:0 auto}
.sp-top .my-nav,.sp-top .my-header{max-width:none}
.sp-main{max-width:var(--my-wrap);margin:0 auto;padding:0 0 120px}
.sp-sec{padding:var(--my-s-m) 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:18px}
.sp-head h2{margin:10px 0 0;font:400 clamp(30px,3.4vw,44px)/1 var(--my-font-display);color:var(--my-ink)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font:500 var(--my-eyebrow)/1 var(--my-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--my-muted)}
.sp-label::before{content:"";width:12px;height:12px;border-radius:0 0 0 6px;background:var(--my-yellow)}
.sp-note{margin:0;max-width:680px;font:400 15px/1.55 var(--my-font-text);color:var(--my-muted)}
.sp-demo{position:relative;isolation:isolate;overflow:clip;padding:var(--my-gap);background:var(--my-bg);border-radius:var(--my-r);box-shadow:inset 0 0 0 1px var(--my-line)}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:600px){.sp-demo{padding:0}}
`;
const HEROHTML = `
<header class="sp-top">
${topNav}
${topHero}
</header>`;
const specimen = renderSpecimen({
  name: "Modelyard",
  slug: "modelyard",
  version: VERSION,
  prefix: "my",
  rootClass: "my",
  labelClass: "sp-label",
  script: "scripts/systems/modelyard.mjs",
  source: SOURCE,
  metaDescription: "The Modelyard design system: tokens and working components extracted from the Modelyard model-router page.",
  defsNote: "not used: icons are inline SVG, the notches, reels and the isometric stack are CSS",
  jsNote: "the hero menu and model carousel, route toggles and the nav count, copy buttons, the policy console, the FAQ, plan picks and the signup note",
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
writeSystem({ slug: "modelyard", prefix: "my", rootClass: "my", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["pill", "pill--ghost", "btn-round", "card", "plate", "bars", "nav", "header", "stage", "stat", "rig", "box", "eyebrow", "wrap", "lit", "grain", "toggle", "plan", "faq-row", "headline", "terminal", "signup", "footer"] });
