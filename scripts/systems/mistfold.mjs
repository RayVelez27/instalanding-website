// Extracts the Mistfold design system from its landing page.
//
//   node scripts/systems/mistfold.mjs
//
// Reads public/demos/mistfold-biology-workbench.html (never edits it) and
// writes public/systems/mistfold/ (specimen.html, tokens.css, mistfold.css)
// through the shared pipeline in lib.mjs. The page is one <style> block; the
// system keeps every rule but the document shell (html, the fixed sketch
// canvas, the KApost column and the per-section ring delays) and scopes body
// to the .mf root. The page's custom tags become classes (<tit> -> .mf-display,
// <eti> -> .mf-label, <txt> -> .mf-txt, <nombre> -> .mf-name, <n> -> .mf-meta,
// <t> -> .mf-value, <fil1> -> .mf-fil) and its cryptic classes get names
// (wbbase -> frame, wblugarbbox -> card, wbsep2 -> fleuron ...). The WebGL
// shader that lights every blackletter heading is lifted whole into the
// component script: it now finds headings as they arrive, survives a scaled
// parent, and reads its five-colour palette from the tokens. The frame rings
// are built on the frame from --mf-ring-stops, so they really turn (the page
// resolved its ring once on :root, at 0deg). The Rough.js
// margin sketches are page decoration on a fixed canvas and are left out.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/mistfold-biology-workbench.html";
const { page, el, css: PAGE_CSS } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Fanwood+Text:ital@0;1&family=Cinzel:wght@400..900&family=UnifrakturMaguntia&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">';

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root blocks and its rules. One
   declaration per line; the group comments are what the SYSTEMS board lays
   its panels out by. */
const TOKENS = `/* InstaLanding design system · Mistfold · mistfold@${VERSION}
   Extracted from https://instalanding.ai/demos/mistfold-biology-workbench.html
   Fonts (Google Fonts): UnifrakturMaguntia (display), Fanwood Text 400 + italic (text), Cinzel 400-900 (numerals and small caps), JetBrains Mono 400/600 (code) */
:root {
  /* Color · paper & ink */
  --mf-paper: #F4F2EC;
  --mf-card: #FDFCF9;
  --mf-card-deep: #F7F5EF;
  --mf-tint: #EEF2EF;
  --mf-white: #FFFFFF;
  --mf-glass: #FAF9F5;
  --mf-ink: #4D524F;
  --mf-ink-strong: #1D2420;
  --mf-ink-soft: #7A7F7B;
  --mf-placeholder: #8D918E;
  --mf-line: #E2DED3;
  --mf-line-dark: #D3CEC1;
  --mf-line-faint: #EFECE4;

  /* Color · illumination */
  --mf-sage: #4C7264;
  --mf-sage-dark: #3D5E52;
  --mf-sage-deep: #2F5145;
  --mf-sage-light: #7FAE9C;
  --mf-mint: #8FBCAA;
  --mf-blue: #4C6D7B;
  --mf-violet: #675A7C;
  --mf-mauve: #86667F;
  --mf-lilac: #B3A3C6;

  /* Color · house accents */
  --mf-ochre: #897A5D;
  --mf-umber: #85613A;
  --mf-moss: #4E663E;
  --mf-olive: #7D7A4C;
  --mf-oxblood: #792E2E;
  --mf-plum: #5D4144;
  --mf-rust: #653E2F;

  /* Color · surfaces */
  --mf-foot: #FBFAF6;
  --mf-medal-mid: #F4F6F3;
  --mf-medal-edge: #E7ECE8;
  --mf-code-bg: #F3F1EA;
  --mf-code-ink: #2C4A40;
  --mf-code-comment: #80847F;
  --mf-code-string: #6A6740;

  /* Color · gradients */
  --mf-title-grad: linear-gradient(298deg, var(--mf-ink-strong) 5%, var(--mf-sage), var(--mf-sage-light) 70%, var(--mf-sage));
  --mf-mark-grad: linear-gradient(110deg, var(--mf-sage), var(--mf-mint), var(--mf-blue), var(--mf-violet), var(--mf-lilac), var(--mf-sage));
  --mf-medal-grad: conic-gradient(from 210deg, var(--mf-sage), var(--mf-mint), var(--mf-blue), var(--mf-violet), var(--mf-lilac), var(--mf-sage));
  --mf-star-grad: linear-gradient(135deg, var(--mf-sage), var(--mf-violet));

  /* Type · families */
  --mf-font-display: "UnifrakturMaguntia", serif;
  --mf-font-text: "Fanwood Text", serif;
  --mf-font-numeral: "Cinzel", serif;
  --mf-font-mono: "JetBrains Mono", monospace;

  /* Type · scale */
  --mf-wordmark: clamp(110px, 22vw, 260px);
  --mf-display: 58px;
  --mf-title-cta: 52px;
  --mf-title: 44px;
  --mf-display-sm: 40px;
  --mf-title-sm: 38px;
  --mf-price: 32px;
  --mf-name: 30px;
  --mf-logo: 28px;
  --mf-numeral: 26px;
  --mf-fleuron: 22px;
  --mf-subtitle: 19px;
  --mf-lead: 18px;
  --mf-text: 17px;
  --mf-card-text: 16px;
  --mf-foot-text: 15px;
  --mf-small: 14.5px;
  --mf-step: 14px;
  --mf-code: 12.5px;
  --mf-label: 12px;
  --mf-fine: 11.5px;
  --mf-caps: 11px;
  --mf-caps-sm: 10.5px;
  --mf-micro: 9.5px;

  /* Shape · radii */
  --mf-radius-sm: 6px;
  --mf-radius: 8px;
  --mf-radius-lg: 10px;
  --mf-radius-xl: 14px;
  --mf-radius-glow: 16px;
  --mf-corner: scoop;

  /* Shape · borders */
  --mf-hair: 1px;
  --mf-rule: 2px;
  --mf-spine: 3px;
  --mf-ring-w: 2px;
  --mf-ring-w-tier: 1.5px;
  --mf-focus: 2px;
  --mf-frame-inset: 7px;
  --mf-tier-inset: 5px;

  /* Shape · marks */
  --mf-star: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 1.5c.6 5.6 4.9 9.9 10.5 10.5-5.6.6-9.9 4.9-10.5 10.5C11.4 16.9 7.1 12.6 1.5 12 7.1 11.4 11.4 7.1 12 1.5z'/%3E%3C/svg%3E");

  /* Depth · rings */
  --mf-ring-stops: var(--mf-line-dark) 0%, var(--mf-sage) 12%, var(--mf-mint) 19%, var(--mf-blue) 27%, var(--mf-line-dark) 40%, var(--mf-line-dark) 52%, var(--mf-violet) 64%, var(--mf-lilac) 70%, var(--mf-sage) 80%, var(--mf-line-dark) 92%;
  --mf-ring-glow-stops: transparent 0%, var(--mf-sage) 12%, var(--mf-mint) 19%, var(--mf-blue) 27%, transparent 40%, transparent 52%, var(--mf-violet) 64%, var(--mf-lilac) 70%, var(--mf-sage) 80%, transparent 92%;

  /* Depth · shadows and glow */
  --mf-shadow-btn: 0 6px 18px -8px color-mix(in srgb, var(--mf-sage) 60%, transparent);
  --mf-shadow-card: 0 14px 30px -22px color-mix(in srgb, var(--mf-ink-strong) 35%, transparent);
  --mf-shadow-medal: 0 6px 14px -8px color-mix(in srgb, var(--mf-ink-strong) 35%, transparent);
  --mf-shadow-field: 0 18px 40px -26px color-mix(in srgb, var(--mf-ink-strong) 45%, transparent);
  --mf-shadow-field-focus: 0 18px 40px -22px color-mix(in srgb, var(--mf-sage) 55%, transparent);
  --mf-glow-blur: 20px;
  --mf-glow-opacity: 0.28;
  --mf-glass-blur: 10px;

  /* Motion · easing */
  --mf-ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --mf-ease-spark: cubic-bezier(0.65, 0, 0.35, 1);
  --mf-ease-sweep: cubic-bezier(0.45, 0, 0.2, 1);

  /* Motion · durations */
  --mf-dur: 0.25s;
  --mf-dur-reveal: 0.7s;
  --mf-dur-draw: 1.4s;
  --mf-medal-spin: 2.4s;
  --mf-ring-spin-fast: 6s;
  --mf-ring-spin: 9s;
  --mf-shimmer: 10s;
  --mf-shimmer-slow: 12s;
  --mf-aurora: 16s;

  /* Space · layout */
  --mf-nav-w: 1100px;
  --mf-finale-w: 1000px;
  --mf-frame-w: 760px;
  --mf-tiers-w: 680px;
  --mf-flow-w: 620px;
  --mf-stats-w: 600px;
  --mf-cards-w: 580px;
  --mf-intro-w: 560px;
  --mf-frame-pad: 40px 30px;
  --mf-frame-gap: 44px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's house colours take plain names; every other custom property (--accent, --angle, --sweep ...) moves under mf-
const VARS = {
  bruma: "sage", groups: "sage", northel: "blue", noctum: "violet", sakkrad: "mauve", alianza: "ochre", imperio: "umber",
  vardarien: "moss", daelarien: "olive", sombrias: "oxblood", shinzen: "plum", dragones: "rust", blackletter: "font-display",
};
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("mf-") ? m : `--mf-${VARS[n] ?? n}`));
// The page's custom tags, as the classes that replace them
const TAGS = { tit: ["span", "display"], eti: ["span", "label"], txt: ["div", "txt"], nombre: ["span", "name"], n: ["span", "meta"], t: ["span", "value"], fil1: ["div", "fil"] };
// Cryptic class names get readable ones (the rest keep theirs)
const RENAME = {
  wbbase: "frame", tit: "title", wbsep: "rule", wbintro: "intro", "intro-ico": "intro-icon", ico: "icon", "cta-row": "actions", wbsep2: "fleuron",
  wblugarb: "cards", wblugarbbox: "card", "wblugarbbox-main": "card-main", wblugarbboxinfo: "card-info", "wblugarbbox-extra": "card-foot",
  wblugarbboxinspo: "card-cell", c: "cm", k: "kw", s: "str",
};
const renameClasses = (css) => css.replace(/\.([a-zA-Z][\w-]*)(?![\w-])/g, (m, n) => (RENAME[n] ? "." + RENAME[n] : m));

// Exact template strings swapped for tokens; each must be found
const must = (s, from, to) => {
  if (!s.includes(from)) throw new Error("swap not found: " + from);
  return s.split(from).join(to);
};
const EXACT = [
  // shadows before the generic rgba pass
  ["box-shadow:0 6px 18px -8px rgba(76,114,100,.6)", "box-shadow:var(--mf-shadow-btn)"],
  ["0 14px 30px -22px rgba(29,36,32,.35)", "var(--mf-shadow-card)"],
  ["0 6px 14px -8px rgba(29,36,32,.35)", "var(--mf-shadow-medal)"],
  ["box-shadow:0 18px 40px -26px rgba(29,36,32,.45)", "box-shadow:var(--mf-shadow-field)"],
  ["box-shadow:0 18px 40px -22px rgba(76,114,100,.55)", "box-shadow:var(--mf-shadow-field-focus)"],
  ["filter:blur(20px);opacity:.28", "filter:blur(var(--mf-glow-blur));opacity:var(--mf-glow-opacity)"],
  ["backdrop-filter:blur(10px) saturate(1.2)", "backdrop-filter:blur(var(--mf-glass-blur)) saturate(1.2)"],
  ["background:conic-gradient(from 210deg,var(--mf-sage),var(--mf-mint),var(--mf-blue),var(--mf-violet),var(--mf-lilac),var(--mf-sage))", "background:var(--mf-medal-grad)"],
  ["background:linear-gradient(110deg,var(--mf-sage),var(--mf-mint),var(--mf-blue),var(--mf-violet),var(--mf-lilac),var(--mf-sage))", "background:var(--mf-mark-grad)"],
  ["linear-gradient(135deg,var(--mf-sage),var(--mf-violet))", "var(--mf-star-grad)"],
  ["font-size:clamp(110px,22vw,260px)", "font-size:var(--mf-wordmark)"],
  ["stroke:url(#ig)", "stroke:url(#mf-ig)"],
  // The page declared its ring gradients on :root, where var(--angle) is resolved once (to 0deg), so its rings never
  // turned; the system builds the gradient on the frame itself from the ring stops, so mf-ringSpin really turns it
  ["var(--mf-ring) border-box", "conic-gradient(from var(--mf-angle), var(--mf-ring-stops)) border-box"],
  ["background:var(--mf-ring-glow)", "background:conic-gradient(from var(--mf-angle), var(--mf-ring-glow-stops))"],
  // motion
  ["transition:.25s", "transition:var(--mf-dur)"],
  ["border-color .25s, box-shadow .25s", "border-color var(--mf-dur), box-shadow var(--mf-dur)"],
  ["opacity .7s ease, transform .7s ease", "opacity var(--mf-dur-reveal) ease, transform var(--mf-dur-reveal) ease"],
  ["ringSpin 9s linear", "ringSpin var(--mf-ring-spin) linear"],
  ["animation-duration:6s", "animation-duration:var(--mf-ring-spin-fast)"],
  ["moveGradient 10s", "moveGradient var(--mf-shimmer)"],
  ["moveGradient 12s", "moveGradient var(--mf-shimmer-slow)"],
  ["medalSpin 2.4s", "medalSpin var(--mf-medal-spin)"],
  ["aurora 16s", "aurora var(--mf-aurora)"],
  ["lineDraw 1.4s", "lineDraw var(--mf-dur-draw)"],
  ["cubic-bezier(.22,1,.36,1)", "var(--mf-ease-out)"],
  ["cubic-bezier(.65,0,.35,1)", "var(--mf-ease-spark)"],
  ["cubic-bezier(.45,0,.2,1)", "var(--mf-ease-sweep)"],
  // shape
  ["corner-shape:scoop", "corner-shape:var(--mf-corner)"],
  ["outline-offset:-7px", "outline-offset:calc(-1 * var(--mf-frame-inset))"],
  ["outline-offset:-5px", "outline-offset:calc(-1 * var(--mf-tier-inset))"],
  ["outline:2px solid var(--mf-sage)", "outline:var(--mf-focus) solid var(--mf-sage)"],
  ["border-left:3px solid", "border-left:var(--mf-spine) solid"],
  ["border-left:2px solid", "border-left:var(--mf-rule) solid"],
  ["border:2px solid transparent", "border:var(--mf-ring-w) solid transparent"],
  ["border-width:1.5px", "border-width:var(--mf-ring-w-tier)"],
  // layout
  ["max-width:1100px", "max-width:var(--mf-nav-w)"],
  ["width:1000px", "width:var(--mf-finale-w)"],
  ["width:760px", "width:var(--mf-frame-w)"],
  ["width:680px", "width:var(--mf-tiers-w)"],
  ["width:620px", "width:var(--mf-flow-w)"],
  ["width:600px", "width:var(--mf-stats-w)"],
  ["width:580px", "width:var(--mf-cards-w)"],
  ["width:560px", "width:var(--mf-intro-w)"],
  ["padding:40px 30px;margin:0 auto 44px", "padding:var(--mf-frame-pad);margin:0 auto var(--mf-frame-gap)"],
];
const HEX = {
  "#2f5145": "sage-deep", "#3d5e52": "sage-dark", "#7fae9c": "sage-light", "#1d2420": "ink-strong", "#fdfcf9": "card", "#f7f5ef": "card-deep",
  "#fbfaf6": "foot", "#f4f6f3": "medal-mid", "#e7ece8": "medal-edge", "#f3f1ea": "code-bg", "#2c4a40": "code-ink", "#80847f": "code-comment",
  "#6a6740": "code-string", "#efece4": "line-faint", "#8d918e": "placeholder", "#fff": "white",
};
const RGB = { "76,114,100": "sage", "103,90,124": "violet", "76,109,123": "blue", "29,36,32": "ink-strong", "250,249,245": "glass" };
const SIZES = {
  58: "display", 52: "title-cta", 44: "title", 40: "display-sm", 38: "title-sm", 32: "price", 30: "name", 28: "logo", 26: "numeral", 22: "fleuron",
  19: "subtitle", 18: "lead", 17: "text", 16: "card-text", 15: "foot-text", 14.5: "small", 14: "step", 12.5: "code", 12: "label", 11.5: "fine",
  11: "caps", 10.5: "caps-sm", 9.5: "micro",
};
const RADII = { 6: "radius-sm", 8: "radius", 10: "radius-lg", 14: "radius-xl", 16: "radius-glow" };
const SWAPS = [
  [/rgba\((\d+,\d+,\d+),([\d.]+)\)/g, (m, rgb, a) => (RGB[rgb] ? `color-mix(in srgb,var(--mf-${RGB[rgb]}) ${Math.round(+a * 100)}%,transparent)` : m)],
  [/font-family:"Fanwood Text",serif/g, "font-family:var(--mf-font-text)"],
  [/font-family:"Cinzel",serif/g, "font-family:var(--mf-font-numeral)"],
  [/font-family:"JetBrains Mono",monospace/g, "font-family:var(--mf-font-mono)"],
  [/font-size:([\d.]+)px/g, (m, n) => (SIZES[n] ? `font-size:var(--mf-${SIZES[n]})` : m)],
  [/border-radius:(\d+)px/g, (m, n) => (RADII[n] ? `border-radius:var(--mf-${RADII[n]})` : m)],
  [/(border(?:-top|-bottom|-left)?|outline):1px solid/g, "$1:var(--mf-hair) solid"],
];

/* ── 3. Component CSS ────────────────────────────────────────────────── */
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
// Page-only parts: the document shell, the fixed sketch canvas, the page column and the per-section ring delays
const DROP = /^(html|:root)$|^html,|#sketchbg|\.KApost|^#(modules|workflow|pricing|access)/;
const TAG_SEL = new RegExp(`(^|[\\s>+~])(${Object.keys(TAGS).join("|")})(?=$|[\\s.:,>+~\\[])`, "g");
function scopeSelector(sel) {
  if (sel === "*") return ":where(.mf, .mf *)";
  if (sel === "body") return ".mf";
  return sel.replace(TAG_SEL, (_, a, t) => `${a}.${TAGS[t][1]}`);
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
    if (prelude.startsWith("@")) return rule;
    if (DROP.test(prelude)) return "";
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
let base = renameVars(renameClasses(keep(PAGE_CSS.replace(/\/\*[\s\S]*?\*\//g, ""))));
// Media queries keep their literal breakpoints (a var() is not allowed there): shield them from the width swaps
base = base.replace(/@media \((max|min)-width:/g, "@media ($1-wıdth:");
for (const [from, to] of EXACT) base = must(base, from, to);
base = base.replace(/-wıdth:/g, "-width:");
if (!base.includes(".frame .display") || !base.includes(".card-info .meta")) throw new Error("tag selectors not converted");

/* ── 4. Markup ───────────────────────────────────────────────────────── */
const ANCHORS = "top|modules|workflow|pricing|access";
const unhook = (html) => {
  let s = html
    .replace(/ data-(section|component)="[^"]*"/g, "")
    .replace(new RegExp(` id="(${ANCHORS}|signup|thanks|finaleMark)"`, "g"), "")
    .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
    .replace(/ id="(?!mf-)([^"]+)"/g, ' id="mf-$1"')
    .replace(/(href|xlink:href)="#(?!mf-)([^"]+)"/g, '$1="#mf-$2"')
    .replace(/url\(#(?!mf-)([^)]+)\)/g, "url(#mf-$1)")
    // the icon gradient's stops follow the tokens, so the playground recolours the icons too
    .replace(/stop-color="#4c7264"/g, 'style="stop-color:var(--mf-sage)"')
    .replace(/stop-color="#4c6d7b"/g, 'style="stop-color:var(--mf-blue)"')
    .replace(/stop-color="#675a7c"/g, 'style="stop-color:var(--mf-violet)"');
  for (const [t, [tag, cls]] of Object.entries(TAGS)) s = s.replace(new RegExp(`<${t}>`, "g"), `<${tag} class="${cls}">`).replace(new RegExp(`</${t}>`, "g"), `</${tag}>`);
  return s.replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter(Boolean).map((c) => RENAME[c] ?? c).join(" ")}"`);
};
const piece = (html, marker) => sliceEl(html, marker).html;

const NAV = el('<header class="nav"');
const HERO = el('<section class="wbbase hero"');
const MODULES = el('<section class="wbbase" id="modules"');
const WORKFLOW = el('<section class="wbbase" id="workflow"');
const PRICING = el('<section class="wbbase" id="pricing"');
const FINALE = el('<footer class="wbbase finale"');
const DEFS_RAW = el('<svg width="0" height="0"');

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("nav", "Header", "A sticky frosted bar on paper glass: the Mistfold wordmark in UnifrakturMaguntia (lit by the shader), four uppercase links at 12px with 1px tracking that hide under 760px, and a solid sage Request access button.",
  NAV, { js: true });

add("buttons", "Buttons, labels & fields", "Buttons are Fanwood Text in 12px capitals with 1.5px tracking, 6px scooped corners: outlined sage that fills on hover, or solid sage with a soft green shadow. Labels are small white-on-sage pills. The field is a white scooped box that holds its button and glows sage on focus.",
  `<div class="wbbase">
${piece(MODULES, "<eti>")}
<div class="demo-row">${piece(HERO, '<a href="#access" class="btn solid">')}${piece(HERO, '<a href="#modules" class="btn">')}${piece(PRICING, '<a href="#access" class="btn">')}</div>
${piece(FINALE, '<form class="signup"')}
${piece(FINALE, '<div class="assurances">')}
</div>`, { defs: false });

add("type", "Blackletter type", "UnifrakturMaguntia for the display (58px h1, 44px h2, 30px card names) filled with a drifting sage gradient, then painted over by the WebGL shader; Fanwood Text for reading at 17px/1.55 with italic subtitles and bold-free emphasis in italics; Cinzel for numerals and small-caps heads. Display type sits inside a frame.",
  `<div class="wbbase">
${piece(MODULES, "<eti>")}
<h1>${piece(HERO, "<tit>")}</h1>
${piece(HERO, '<span class="subtitle">')}
<div class="wbsep2" aria-hidden="true">❦</div>
${piece(MODULES, '<h2 class="tit">')}
${piece(MODULES, '<div class="wbintro">')}
${piece(PRICING, "<blockquote>")}
</div>`, { js: true, defs: true });

add("ornaments", "Rules & fleurons", "The manuscript's punctuation: a 60px vertical rule fading from sage, the ❦ fleuron between two rules that fade outward, the footer's hairline fleuron rule, and four-point stars used as bullets (masked from --mf-star, filled with a sage-to-violet gradient).",
  `<div class="wbbase">
${piece(HERO, '<div class="wbsep"')}
${piece(MODULES, '<div class="wbsep2"')}
${piece(FINALE, '<div class="finale-rule"')}
<div class="demo-gap"></div>
${piece(FINALE, '<div class="assurances">')}
</div>`);

const SYMBOLS = [...DEFS_RAW.matchAll(/<symbol id="i-([a-z]+)"/g)].map((m) => m[1]);
add("icons", "Instrument icons", "Line icons drawn on a 24px grid at 1.5px with round caps, stroked by one sage-blue-violet gradient (#mf-ig in the defs): a lens with a helix, microscope, hexagon, atom, folio, funnel, branching nodes, charged hexagon, open codex and envelope seal. Use them as <svg class=\"mf-icon\"><use href=\"#mf-i-…\"/></svg>.",
  `<div class="demo-icons">
${SYMBOLS.map((s) => `<figure><svg class="ico" aria-hidden="true"><use href="#i-${s}"/></svg><figcaption>${s}</figcaption></figure>`).join("\n")}
</div>`, { defs: true });

add("hero", "Illuminated hero", "A 760px frame with scooped corners, an inset hairline and a conic ring of sage, mint, blue, violet and lilac that turns around it under a soft blurred glow. Inside: the blackletter h1, an italic subtitle, a rule that draws down with a travelling spark, an intro with a gradient left rule swept by light, four stats that rise in one by one, and two buttons.",
  HERO, { js: true, defs: true });

add("stats", "Small-caps stats", "Four Cinzel figures at 26px over 10.5px uppercase labels, divided by vertical rules that fade at both ends; two by two under 560px.",
  piece(HERO, '<div class="stats">'));

add("card", "Module card", "A white card with a 3px spine in its own --mf-accent: the blackletter name, a small-caps meta line with one to three hexagon pips, the description and a star-bullet list, then a tinted foot split in two (built on / outputs) with icons. Cards fade up as they enter.",
  `<div class="wblugarb">
${piece(MODULES, '<article class="wblugarbbox"')}
</div>`, { js: true, defs: true });

add("modules", "Module codex", "A frame of four cards, each in its own accent (sage, blue, violet, mauve): the label pill, the h2, the vertical rule, an intro with its icon, the fleuron and the card stack.",
  MODULES, { js: true, defs: true });

add("workflow", "Ritual steps & code", "Four tinted step tiles, each with a pearl medal whose conic rim spins on hover, a Cinzel title and a line; then a fleuron and a code block in JetBrains Mono on parchment with a sage spine and violet keywords.",
  WORKFLOW, { js: true, defs: true });

add("pricing", "Covenant tiers", "Three white tiers with scooped corners and an inset hairline: a label pill, a Cinzel price, star-bulleted lines over faint rules and a button. The featured tier wears the turning conic ring. An italic testimonial closes the frame.",
  PRICING, { js: true });

add("finale", "Call to action & footer", "The wide closing frame: a soft aurora behind a label, a 52px h2, a lead, the email field and three star assurances, a fleuron rule, a four-column footer with Cinzel heads and links whose underline draws in, a base line, and the Mistfold wordmark set full width and lit by the shader. The form thanks inline and sends nothing.",
  FINALE, { js: true });

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class stays above it.
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
// The specimen's demo helpers
const EXTRA = `
.demo-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 14px; margin-top: 8px; }
.demo-gap { height: 18px; }
.demo-icons { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; max-width: 620px; margin: 0 auto; }
.demo-icons figure { display: grid; justify-items: center; gap: 10px; margin: 0; padding: 18px 8px 14px; border: var(--mf-hair) solid var(--mf-line); border-radius: var(--mf-radius); corner-shape: var(--mf-corner); background: var(--mf-tint); }
.demo-icons .ico { width: 34px; height: 34px; }
.demo-icons figcaption { font-size: var(--mf-caps); text-transform: uppercase; letter-spacing: 1px; color: var(--mf-ink-soft); }
@media (max-width: 560px) {
.demo-icons { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
}`;
const extra = renameClasses(EXTRA);
const CLASSES = new Set();
const allCss = HEADINGS + base + extra;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "mf" && !m[1].startsWith("mf-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("mf-")) CLASSES.add(n);
// classes the component script sets
for (const n of ["in", "gl-on", "shader-host", "shader-canvas", "shaded"]) CLASSES.add(n);
const KEYFRAMES = ["moveGradient", "medalSpin", "lineDraw", "lineSpark", "sweepDown", "statIn", "statLine", "ringSpin", "aurora"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "mf", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .mf itself, or :where(.mf) in front
const ROOTED = /(^|[\s,(>+~])\.mf(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.mf) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + extra))).replace(/\n{3,}/g, "\n\n").trim();
// (the medal rim's mask layers are plain #000: a mask, not a colour)
const LEFT = componentCss.replace(/url\(#mf-[\w-]+\)|linear-gradient\(#000 0 0\)/g, "").match(/#[0-9a-f]{3,6}(?![\w-])/i);
if (LEFT) throw new Error("literal colour left: " + LEFT[0]);

/* ── 6. Shared SVG defs: the icon gradient and the instrument symbols ── */
const DEFS = prefixMarkup(unhook(DEFS_RAW)).replace('<svg width="0" height="0"', '<svg id="mf-defs" width="0" height="0"');

/* ── 7. Component script ─────────────────────────────────────────────── */
// The page's shader-text script, whole, with its hooks moved under the prefix
const SH_AT = page.indexOf("/* ---------- Shader text: nav logo, headings, footer wordmark ---------- */");
const SH_END = page.indexOf("/* ---------- Waitlist form", SH_AT);
let SHADER = page.slice(page.indexOf("\n", SH_AT) + 1, SH_END).trim();
const sw = (from, to) => { SHADER = must(SHADER, from, to); };
// The five-colour palette comes from the tokens, not literals
sw("uniform vec2 uLight;varying vec2 vUv;", "uniform vec2 uLight;uniform vec3 uC0,uC1,uC2,uC3,uC4;varying vec2 vUv;");
sw("vec3 c0=vec3(.298,.447,.392),c1=vec3(.561,.737,.667),c2=vec3(.298,.427,.482),c3=vec3(.404,.353,.486),c4=vec3(.702,.639,.776);", "vec3 c0=uC0,c1=uC1,c2=uC2,c3=uC3,c4=uC4;");
sw("['uRes','uTime','uUnit','uBevel','uLight']", "['uRes','uTime','uUnit','uBevel','uLight','uC0','uC1','uC2','uC3','uC4']");
sw("light:[.3,.8],phase:items.length*1.7};", "light:[.3,.8],phase:items.length*1.7,pal:null,palT:-1e9};");
// Headings are found as they arrive (below), not once at load
SHADER = SHADER.replace(/ {2}\/\/ 1\) inline headings[\s\S]*?mark\.classList\.add\('gl-on'\);\}\n/, "");
if (SHADER.includes("finaleMark")) throw new Error("shader heading lookup not stripped");
// Lay a heading out in its own pixels, so a scaled parent (a board panel, a poster) doesn't scale it twice
sw("const el=it.el, cs=getComputedStyle(el), box=el.getBoundingClientRect();\n      if(!box.width) return;",
  "const el=it.el, cs=getComputedStyle(el), box=el.getBoundingClientRect(), sc=box.width/(el.offsetWidth||box.width||1)||1;\n      if(!box.width) return;");
sw("const W=Math.ceil(box.width+pad*2), H=Math.ceil(box.height+pad*2);", "const W=Math.ceil(box.width/sc+pad*2), H=Math.ceil(box.height/sc+pad*2);");
sw("const base=rect.top-box.top+pad+(rect.height-(fA+fD))/2+fA;", "const base=(rect.top-box.top)/sc+pad+(rect.height/sc-(fA+fD))/2+fA;");
sw("o.fillText(m[0],rect.left-box.left+pad,base);", "o.fillText(m[0],(rect.left-box.left)/sc+pad,base);");
sw("const fam=\"UnifrakturMaguntia, serif\";", "const fam=getComputedStyle(it.el.querySelector('.mf-mark-fallback')||it.el).fontFamily;");
sw("it.el.classList.add('shaded')", "it.el.classList.add('mf-shaded')");
sw("gl.uniform2f(U.uLight,it.light[0],it.light[1]);", "gl.uniform2f(U.uLight,it.light[0],it.light[1]);\n    const P=palette(it,now);for(let i=0;i<5;i++)gl.uniform3fv(U['uC'+i],P[i]);");
sw("function loop(now){if(!document.hidden)items.forEach(it=>{if(it.visible)render(it,now)});requestAnimationFrame(loop);}",
  `function loop(now){
    for(let i=items.length-1;i>=0;i--) if(!items[i].el.isConnected){const it=items.splice(i,1)[0];if(io)io.unobserve(it.canvas);ro.unobserve(it.el);}
    if(!document.hidden)items.forEach(it=>{if(it.visible)render(it,now)});requestAnimationFrame(loop);}`);
SHADER = SHADER.replace(/ {2}if\('IntersectionObserver' in window\)\{[\s\S]*?\n {2}\}\n/, "");
SHADER = must(SHADER, `  fontsReady.then(()=>{
    items.forEach(layout);
    let rt; const ro=new ResizeObserver(()=>{clearTimeout(rt);rt=setTimeout(()=>items.forEach(layout),80)});
    items.forEach(it=>ro.observe(it.el));
    if(!reduce) requestAnimationFrame(loop);
  });`, `  // The palette, read from the tokens on the heading (so the playground and a host's overrides reach the shader)
  const PAL=['--mf-sage','--mf-mint','--mf-blue','--mf-violet','--mf-lilac'];
  const PAL0=[[.298,.447,.392],[.561,.737,.667],[.298,.427,.482],[.404,.353,.486],[.702,.639,.776]];
  function rgb(v){const m=/^#?([0-9a-f]{6})$/i.exec((v||'').trim());return m?[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255):null;}
  function palette(it,now){
    if(now-it.palT>1000){const cs=getComputedStyle(it.el);it.pal=PAL.map((n,i)=>rgb(cs.getPropertyValue(n))||PAL0[i]);it.palT=now;}
    return it.pal;
  }
  const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{const it=items.find(i=>i.canvas===e.target);if(it)it.visible=e.isIntersecting}),{rootMargin:'80px'}):null;
  let ready=false, rt;
  const ro=new ResizeObserver(()=>{clearTimeout(rt);rt=setTimeout(()=>items.forEach(layout),80)});
  function attach(el,canvas,mode,text){
    const it=makeItem(el,canvas,mode,text);
    if(io) io.observe(canvas);
    if(ready){layout(it);ro.observe(el);}
  }
  // 1) inline headings + header wordmark: a canvas overlays the real text, which stays in the DOM for accessibility
  // 2) footer wordmark: its canvas is sized to fit the panel width
  function find(){
    document.querySelectorAll('.mf .mf-nav .mf-logo, .mf .mf-frame .mf-display, .mf .mf-frame h2.mf-title').forEach(el=>{
      if(el._mfShader) return; el._mfShader=true;
      el.querySelectorAll(':scope > .mf-shader-canvas').forEach(c=>c.remove());   // a copy of a lit heading carries a blank canvas
      el.classList.remove('mf-shaded');
      const c=document.createElement('canvas');c.className='mf-shader-canvas';c.setAttribute('aria-hidden','true');
      el.classList.add('mf-shader-host');el.appendChild(c);attach(el,c,'overlay');
    });
    document.querySelectorAll('.mf .mf-finale-mark').forEach(mark=>{
      if(mark._mfShader) return; mark._mfShader=true;
      const fb=mark.querySelector('.mf-mark-fallback'), c=mark.querySelector('canvas');
      if(!c) return;
      attach(mark,c,'fit',(fb&&fb.textContent.trim())||'Mistfold');mark.classList.add('mf-gl-on');
    });
  }
  find();
  if(window.MutationObserver){
    let queued=false;
    new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;find();});})
      .observe(document.documentElement,{childList:true,subtree:true});
  }
  fontsReady.then(()=>{
    ready=true;
    items.forEach(layout);
    items.forEach(it=>ro.observe(it.el));
    if(!reduce) requestAnimationFrame(loop);
  });`);
const THANKS = /textContent='([^']+)'/.exec(page.slice(SH_END))[1];

const JS = `(function () {
  'use strict';
  /* Mistfold components, no libraries. Module cards fade up as they enter;
     the signup form thanks inline and sends nothing; links to "#" stay put.
     Then the page's WebGL shader text: one hidden GL context paints every
     blackletter heading (.mf-frame .mf-display, .mf-frame h2.mf-title, the
     header .mf-logo) and the footer wordmark with lit, drifting fbm ink in
     the five illumination tokens. The real text stays in the DOM; the CSS
     gradient text is the fallback when WebGL is missing. */
  function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }

  /* Module cards: reveal on scroll */
  var rio = window.IntersectionObserver && new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('mf-in'); rio.unobserve(e.target); } });
  }, { threshold: 0.15 });
  function cards() {
    each('.mf .mf-card', function (c) {
      if (c._mf) return; c._mf = true;
      if (rio && !c.classList.contains('mf-in')) rio.observe(c); else c.classList.add('mf-in');
    });
  }
  cards();
  if (window.MutationObserver) {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; cards(); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Waitlist: local only, nothing is sent anywhere */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.mf .mf-signup');
    if (!form) return;
    e.preventDefault();
    var box = form.parentNode, thanks = box && box.querySelector('.mf-thanks');
    if (thanks) thanks.textContent = ${JSON.stringify(THANKS)};
    form.reset();
  });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.mf a[href="#"]');
    if (a) e.preventDefault();
  });
})();

/* Shader text, from the page */
${SHADER}`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const CHROME = `
body{margin:0;background:var(--mf-paper)}
.sp-top{position:relative;padding:0 16px}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 24px;max-width:var(--mf-nav-w);margin:0 auto;padding:14px 0;border-bottom:var(--mf-hair) solid var(--mf-line)}
.sp-brand{font-family:var(--mf-font-display);font-size:var(--mf-logo);line-height:1;color:var(--mf-ink-strong)}
.sp-meta>span:not(.sp-brand){font-family:var(--mf-font-numeral);font-size:var(--mf-caps);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--mf-ink-soft)}
.sp-hero{width:min(100%,940px);padding:40px 44px 34px;margin:30px auto 0}
.sp-hero h1 .mf-display{font-size:clamp(54px,9vw,104px);line-height:1.02}
.sp-hero .mf-subtitle{max-width:640px;margin:16px auto 0;font-size:clamp(17px,1.6vw,20px);line-height:1.45}
.sp-hero .mf-fleuron{margin:22px 0 14px}
.sp-swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 14px;text-align:center}
.sp-swatches span{display:grid;justify-items:center;gap:6px;font-family:var(--mf-font-numeral);font-size:var(--mf-caps-sm);letter-spacing:1px;text-transform:uppercase;color:var(--mf-ink-soft)}
.sp-swatches i{width:46px;height:46px;border-radius:50%;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--mf-ink-strong) 14%,transparent),var(--mf-shadow-medal)}
.sp-main{max-width:1100px;margin:0 auto;padding:0 16px 120px}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:22px;padding-bottom:16px;border-bottom:var(--mf-hair) solid var(--mf-line-dark)}
.sp-head h2{margin:8px 0 0;font-family:var(--mf-font-display);font-size:clamp(30px,3.2vw,42px);font-weight:400;line-height:1.05;color:var(--mf-ink-strong)}
.sp-label{margin:0;font-family:var(--mf-font-numeral);font-size:var(--mf-label);font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--mf-sage)}
.sp-note{margin:0;max-width:680px;font-family:var(--mf-font-text);font-size:16px;line-height:1.5;color:var(--mf-ink)}
.sp-demo{position:relative;padding:clamp(24px,4vw,48px) clamp(10px,3vw,36px);border:var(--mf-hair) solid var(--mf-line);border-radius:var(--mf-radius-xl);background:color-mix(in srgb,var(--mf-card) 55%,transparent);overflow:clip}
.sp-demo>.mf-frame:last-child{margin-bottom:0}
.sp-demo:has(>.mf-nav){padding:0}
@media (max-width:760px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-hero{padding:30px 18px 26px}.sp-meta{justify-content:center;text-align:center}}
`;
const SWATCHES = [["sage", "Sage"], ["mint", "Mint"], ["blue", "Blue"], ["violet", "Violet"], ["lilac", "Lilac"], ["ink-strong", "Ink"], ["paper", "Paper"]];
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><span class="sp-brand">Mistfold</span><span>Design system · mistfold@${VERSION} · ${C.length} components</span></div>
<div class="mf-frame sp-hero">
<span class="mf-label">an illuminated workbench</span>
<h1><span class="mf-display">The Mistfold Codex</span></h1>
<span class="mf-subtitle">A computational-biology lab set like an illuminated manuscript: blackletter lit by a shader, Fanwood italics and Cinzel numerals, sage and violet ink on cream paper, scooped frames ringed in turning colour, fleurons, star bullets and line-drawn instruments. Extracted from the Blackletter Biology Workbench page.</span>
<div class="mf-fleuron" aria-hidden="true">❦</div>
<div class="sp-swatches" aria-label="Core colours">
${SWATCHES.map(([t, n]) => `<span><i style="background:var(--mf-${t})"></i>${n}</span>`).join("")}
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Mistfold",
  slug: "mistfold",
  version: VERSION,
  prefix: "mf",
  rootClass: "mf",
  labelClass: "sp-label",
  script: "scripts/systems/mistfold.mjs",
  source: SOURCE,
  metaDescription: "The Mistfold design system: tokens and working components extracted from the Blackletter Biology Workbench page.",
  defsNote: "the icon gradient (mf-ig) and the instrument symbols (mf-i-lens, mf-i-scope, mf-i-hex ...) every .mf-icon uses; include it once per page",
  jsNote: "the module-card reveal, the signup form, and the WebGL shader that lights every blackletter heading and the footer wordmark",
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
writeSystem({ slug: "mistfold", prefix: "mf", rootClass: "mf", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "solid", "frame", "wbbase", "card", "wblugarbbox", "tier", "stat", "step", "medal", "display", "title", "label", "icon", "ico", "logo", "nav", "finale"] });
