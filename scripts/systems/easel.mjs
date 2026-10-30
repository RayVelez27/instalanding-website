// Extracts the Easel design system from its landing page.
//
//   node scripts/systems/easel.mjs
//
// Reads public/demos/easel-artist-assistant.html (never edits it) and writes
// public/systems/easel/ (specimen.html, tokens.css, easel.css) through the
// shared pipeline in lib.mjs. The page splits its CSS into cascade layers
// (tokens, base, atoms, layout, sections, scenes) across several <style>
// blocks; the system flattens them in layer order and drops the scenes layer
// (the GSAP and Lenis scroll machinery: the pinned sideways print run, the
// lens drift), keeping every section's static frame, which is what the page
// shows without motion. The hero's CSS intro (the drums dropping and printing
// their trails) and the drums' bob stay as keyframes. The m- atoms lose their
// m- (m-btn -> ea-btn) and the numbered type atoms get names (m-text-2 ->
// ea-display). Section ids become the classes the sections already carry, so
// #press .press__title -> .ea-press .ea-press__title. The six abstract studies,
// which the page draws into svg[data-art] at boot, are drawn by the same
// seeded generator, lifted whole into the component script.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/easel-artist-assistant.html";
const { page, el } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Gabarito:wght@700..900&family=Rethink+Sans:wght@400..700&display=swap" rel="stylesheet">';

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's @layer tokens and its rules. One
   declaration per line; the group comments are what the SYSTEMS board lays
   its panels out by. */
const TOKENS = `/* InstaLanding design system · Easel · easel@${VERSION}
   Extracted from https://instalanding.ai/demos/easel-artist-assistant.html
   Fonts (Google Fonts): Gabarito 700-900 (display), Rethink Sans 400-700 (text) */
:root {
  /* Color · inks */
  --ea-blue: #11138D;
  --ea-pink: #ED008E;
  --ea-paper: #F3F3FA;
  --ea-ink: #07061F;

  /* Color · rules */
  --ea-rule-on-blue: color-mix(in srgb, var(--ea-paper) 30%, transparent);
  --ea-rule-on-paper: color-mix(in srgb, var(--ea-blue) 25%, transparent);
  --ea-rule-on-pink: color-mix(in srgb, var(--ea-ink) 40%, transparent);

  /* Type · families */
  --ea-font-display: "Gabarito", "Gabarito Fallback", Arial, sans-serif;
  --ea-font-text: "Rethink Sans", "Rethink Sans Fallback", Arial, sans-serif;

  /* Type · scale */
  --ea-poster: 120px;
  --ea-display: clamp(40px, 5.6vw, 84px);
  --ea-sum: clamp(44px, 4.4vw, 64px);
  --ea-client: clamp(30px, 4.4vw, 64px);
  --ea-statement: clamp(36px, 4.3vw, 60px);
  --ea-title: clamp(22px, 0.9vw + 15px, 28px);
  --ea-lead: clamp(19px, 0.8vw + 13px, 24px);
  --ea-price: 24px;
  --ea-input: 18px;
  --ea-text: clamp(16px, 0.35vw + 14px, 18px);
  --ea-button: 16px;
  --ea-label: 13px;

  /* Shape · radii */
  --ea-pill: 999px;

  /* Shape · borders */
  --ea-hair: 1px;
  --ea-rule: 2px;
  --ea-focus: 3px;

  /* Depth · halftone and misregistration */
  --ea-dot: 9px;
  --ea-dot-pink: 11px;
  --ea-scallop: 6px;
  --ea-misregister: 0.05em;

  /* Motion · easing */
  --ea-ease: cubic-bezier(0.3, 0.7, 0.2, 1);
  --ea-ease-rise: cubic-bezier(0.2, 0.7, 0.2, 1);
  --ea-ease-print: cubic-bezier(0.35, 0.6, 0.2, 1);
  --ea-ease-drop: cubic-bezier(0.3, 1.35, 0.5, 1);

  /* Motion · durations */
  --ea-dur-quick: 0.3s;
  --ea-dur-dot: 0.4s;
  --ea-dur-icon: 0.45s;
  --ea-dur-fill: 0.55s;
  --ea-dur-drop: 0.7s;
  --ea-dur-rise: 0.75s;
  --ea-dur-print: 0.95s;
  --ea-bob: 2.6s;

  /* Space · layout */
  --ea-gut: clamp(16px, 3.2vw, 40px);
  --ea-sec: clamp(88px, 11vw, 160px);
  --ea-maxw: 1200px;
  --ea-nav-h: 76px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's tokens take their system names; local custom properties (--len, --trail-cols,
// --register-x ...) move under ea- too, so a host's variables can't reach them
const VARS = { "color-1": "blue", "color-2": "pink", "color-3": "paper", "color-4": "ink", "font-1": "font-display", "font-2": "font-text", "radius-1": "pill", "space-1": "gut", "space-2": "sec" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("ea-") ? m : `--ea-${VARS[n] ?? n}`));
// The m- atoms: m-btn -> btn, and the numbered type atoms by role
const TYPE = { "m-text-2": "display", "m-text-3": "poster", "m-text-4": "label", "m-text-5": "lead", "m-text-6": "title" };
const atoms = (s) => s.replace(/(?<![\w-])m-([a-z][\w-]*)/g, (m, n) => TYPE[m.replace(/(m-text-\d).*/, "$1")] ? TYPE[m.replace(/(m-text-\d).*/, "$1")] + m.slice(8) : n);
const esc = (v) => v.replace(/[().,+*]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--ea-${tok})`];
const fs_ = (v, tok) => [new RegExp(`font-size: ${esc(v)}(?=[;}])`, "g"), `font-size: var(--ea-${tok})`];
const dur = (v, tok) => [new RegExp(`(?<=[\\s,])${esc(v)}(?= var\\(--ea-ease)`, "g"), `var(--ea-${tok})`];
const SWAPS = [
  val("cubic-bezier(0.3, 0.7, 0.2, 1)", "ease"), val("cubic-bezier(0.2, 0.7, 0.2, 1)", "ease-rise"),
  val("cubic-bezier(0.35, 0.6, 0.2, 1)", "ease-print"), val("cubic-bezier(0.3, 1.35, 0.5, 1)", "ease-drop"),
  dur("0.4s", "dur-dot"), dur("0.45s", "dur-icon"), dur("0.55s", "dur-fill"), dur("0.7s", "dur-drop"), dur("0.75s", "dur-rise"), dur("0.95s", "dur-print"),
  [/(color|background-color|border-color) 0\.3s/g, "$1 var(--ea-dur-quick)"],
  [/2\.6s ease-in-out/g, "var(--ea-bob) ease-in-out"], [/animation-delay: -2\.6s/g, "animation-delay: calc(-1 * var(--ea-bob))"],
  val("clamp(16px, 0.35vw + 14px, 18px)", "text"), val("clamp(40px, 5.6vw, 84px)", "display"), val("clamp(19px, 0.8vw + 13px, 24px)", "lead"),
  val("clamp(22px, 0.9vw + 15px, 28px)", "title"), val("clamp(36px, 4.3vw, 60px)", "statement"), val("clamp(30px, 4.4vw, 64px)", "client"),
  val("clamp(44px, 4.4vw, 64px)", "sum"), fs_("120px", "poster"), fs_("13px", "label"), fs_("16px", "button"), fs_("18px", "input"), fs_("24px", "price"),
  [/color-mix\(in srgb, var\(--ea-paper\) 30%, transparent\)/g, "var(--ea-rule-on-blue)"],
  [/color-mix\(in srgb, var\(--ea-blue\) 25%, transparent\)/g, "var(--ea-rule-on-paper)"],
  [/color-mix\(in srgb, var\(--ea-ink\) 40%, transparent\)/g, "var(--ea-rule-on-pink)"],
  [/(border(?:-top|-bottom)?: )1px solid/g, "$1var(--ea-hair) solid"],
  [/(border(?:-top|-bottom)?: )2px (solid|dotted)/g, "$1var(--ea-rule) $2"],
  [/outline: 3px solid/g, "outline: var(--ea-focus) solid"],
  [/ 0 0 \/ 9px 9px/g, " 0 0 / var(--ea-dot) var(--ea-dot)"], [/background-size: 11px 11px/g, "background-size: var(--ea-dot-pink) var(--ea-dot-pink)"],
  [/radial-gradient\(circle 6px at 50% 0/g, "radial-gradient(circle var(--ea-scallop) at 50% 0"],
  [/height: 76px/g, "height: var(--ea-nav-h)"],
  [/, 1200px\)/g, ", var(--ea-maxw))"],
  // The poster lines and the footer wordmark size from their section, not the viewport, so they fit wherever the section sits
  [/min\(100vw - 2 \* var\(--ea-gut\)/g, "min(100cqi - 2 * var(--ea-gut)"],
];

/* ── 3. Component CSS: every layer but scenes, flattened in layer order ── */
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
const PARTS = [...page.matchAll(/<style data-8b-part="([^"]+)">\n([\s\S]*?)<\/style>/g)].map((m) => ({ part: m[1], css: m[2] }));
const LAYERS = ["base", "atoms", "layout", "sections"];
// Each part is one @layer block; unwrap it (tokens are re-declared above, scenes are motion-only)
const layered = PARTS.map(({ css }) => /^@layer (\w+) \{\n([\s\S]*)\}\s*$/.exec(css.trim()))
  .filter((m) => m && LAYERS.includes(m[1]))
  .sort((a, b) => LAYERS.indexOf(a[1]) - LAYERS.indexOf(b[1]))
  .map((m) => m[2])
  .join("\n");
if (!layered.includes(".m-btn") || !layered.includes("#footer")) throw new Error("layers not found");

// Page-only parts: the document shell and Lenis's smooth-scroll hooks
const DROP = /^(html|img)$|lenis/;
const SECTIONS = "nav|press|inks|process|studio|editions|quote|runs|faq|contact|footer";
function scopeSelector(sel) {
  if (sel === "*") return ":where(.ea, .ea *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.ea, .ea *)${sel.slice(1)}`;
  if (sel === "body") return ".ea";
  // The page sets its body text on body.m-text; the root carries it here
  if (sel === ".m-text") return ".ea,\n.m-text";
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
    if (prelude.startsWith("@")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(atoms(keep(layered.replace(/\/\*[\s\S]*?\*\//g, ""))
  .replace(new RegExp(`#(${SECTIONS})(?![\\w-])`, "g"), ".$1")
  .replace(/data-8b-motion/g, "data-ea-motion")
  .replace(/\[data-(scrolled|hidden|offscreen)\]/g, "[data-ea-$1]")));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; every other id (the menu, the headings the sections
// are labelled by, the form fields, the SVG patterns) moves under ea- with everything that points at it
const ANCHORS = SECTIONS + "|main";
const HOOKS = "section|8b-section|lenis-prevent";
const unhook = (html) => atoms(html)
  .replace(new RegExp(` data-(${HOOKS})(="[^"]*")?(?=[\\s>/])`, "g"), "")
  .replace(/ data-8b-motion="screen"/g, "")
  .replace(/data-8b-motion/g, "data-ea-motion")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="(?!ea-)([^"]+)"/g, ' id="ea-$1"')
  .replace(/ (aria-controls|aria-labelledby|for)="(?!ea-)([^"]+)"/g, ' $1="ea-$2"')
  .replace(/(href|xlink:href)="#(?!ea-)([^"]+)"/g, '$1="#ea-$2"')
  .replace(/url\(#(?!ea-)([^)]+)\)/g, "url(#ea-$1)")
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
// A section's rules hang off its class (.ea-press .ea-press__title), so pieces keep that wrapper
const asDiv = (html) => html.replace(/^<(section|header|footer)/, "<div").replace(/<\/(section|header|footer)>$/, "</div>");
const wrapIn = (cls, html, extra = "") => `<div class="${cls}"${extra}>\n${html}\n</div>`;

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<header id="nav"');
const PRESS = el('<section id="press"');
const S1 = piece(PRESS, '<div class="press__s1');
const S2 = piece(PRESS, '<div class="press__s2');
const QUOTE = el('<section id="quote"');
const CONTACT = el('<section id="contact"');
const FAQ = el('<section id="faq"');

add("nav", "Header", "A bar 76px tall on the blue: the lowercase easel wordmark in Gabarito 900 after two pink discs set out of register, five dotted links and a pink Start free pill. Under 900px the links fold into a full-screen pink sheet of display-size links, opened by a ring button whose dot drops.",
  asDiv(NAV), { js: true });

add("buttons", "Buttons, links & fields", "Pills are Rethink Sans 700 at 52px tall: pink with ink text on the blue, blue with paper text on paper. On hover a circle of the opposite ink swells up from below. Text links sit on a dotted underline whose dots swell into a solid bar. Ring icon buttons drop their dot; fields are square with a 2px ink line.",
  `<div class="press demo-pad">
<div class="demo-row">${piece(S1, '<a class="m-btn"')}${piece(S1, '<a class="m-link"')}${piece(NAV, '<button class="m-icon-btn nav__toggle"').replace(" nav__toggle", "")}</div>
</div>
<div class="demo-pad demo-paper">
<div class="demo-row">${piece(QUOTE, '<a class="m-btn-2"')}<a class="m-link" href="#">Read the guide</a></div>
<div class="demo-fields">${piece(QUOTE, '<div class="quote__field">')}${piece(CONTACT, '<div class="contact__field"><label class="m-text-4" for="contact-email"')}</div>
</div>`);

// The misregistered heading is the page's register effect held at its offset, where the scroll scene starts it
add("type", "Type scale", "Gabarito for display, from 900 down to 700, with tight tracking and line-height .86-1.05; Rethink Sans for text. The poster lines size themselves to their column from --ea-len (the letter count). Leads are 500, labels 600 in .06em capitals. Any heading can carry data-ea-motion=\"register\": a pink copy printed slightly out of register.",
  `<div class="press demo-pad">
${piece(S1, '<h1 id="press-title"')}
</div>
<div class="demo-pad demo-paper type-stack">
<h2 class="m-text-2" data-ea-motion="register" style="--register-x:var(--ea-misregister);--register-y:var(--ea-misregister);--register-a:1">Every layer stays yours.</h2>
<p class="m-text-6">Reference wrangler</p>
<p class="m-text-5">Easel never hands back a flat picture. Each suggestion lands on its own named layer.</p>
<p>Body text in Rethink Sans 400 at --ea-text, line-height 1.55: drop in references, thumbnails and notes, and Easel tags them by value, palette and pose.</p>
<p class="m-text-4">Value study · 4 layers</p>
</div>`);

add("hero", "Press hero", "The opening: a two-line poster title (the first line pink, each sized to fill the column) beside a lead and actions, and four ink drums that drop in, print their dotted trails up or down their lanes and bob in place. The trails are a mask of 80 shrinking dots, so the ink thins as it runs out.",
  wrapIn("press", S1), { js: true });

add("panel", "Printed panel & duotone photo", "A blue panel printed by four pink bands, a display statement and an ink note, beside a duotone picture: greyscale SVG lightened over blue, then darkened by pink, so black prints blue and white prints pink. Hairline-ruled facts and a dotted link follow.",
  wrapIn("press", S2), { defs: true });

add("inks", "Two-plate chart", "On paper: a heading and ruled layer list beside a chart of two plates overprinted with multiply, blue in columns and pink in rows, each at 0, 30, 60 and 100% halftone, with a registration mark at the corner of each plate.",
  asDiv(el('<section id="inks"')));

add("process", "Five-step run", "On the blue: a sheet with two plates (a blue disc and bars, pink dots) overprinted on paper over two offset sheets beneath, beside five ruled steps, each with a pink numbered disc, a title, a line and a label.",
  asDiv(el('<section id="process"')));

add("studio", "Features & duotone photos", "On pink: a heading over a two-column kit of features under ink rules, beside three duotone pictures in a staggered grid (one wide, one tall dropped 96px).",
  asDiv(el('<section id="studio"')), { defs: true });

add("editions", "Study rack", "Three staggered lanes of study cards on the blue, each lane hung from or standing on a pink dotted trail: a duotone study drawn by a seeded generator, a title and a label.",
  asDiv(el('<section id="editions"')), { js: true });

add("pricing", "Plan builder & ticket", "Pill choices that fill pink when checked, a seat count and a select, beside a paper ticket with a scalloped top edge: a dotted rule, the lines of the plan, a big total and a blue pill. The ticket prices the plan as you change it.",
  asDiv(QUOTE), { js: true });

add("runs", "Use-case log", "On paper: big Gabarito lines over hairline rules, each with an ink description set right.",
  asDiv(el('<section id="runs"')));

add("faq", "FAQ", "On pink: a display heading beside native details rows under an ink rule, each closing with a ring button whose dot drops when the row is open.",
  asDiv(FAQ));

add("contact", "Contact & drums", "On the blue: a heading, a lead and a dotted email link, a square-field form with a pink pill (it thanks inline and sends nothing), and four ink drums resting at the foot of their printed trails.",
  asDiv(CONTACT), { js: true });

add("footer", "Wordmark footer", "On paper: the easel wordmark printed full width in Gabarito 900 with a pink misregistered copy, then three columns of dotted links under a 2px rule, and a base line.",
  asDiv(el('<footer id="footer"')).replace('style="--len:5"', 'style="--len:5;--register-x:var(--ea-misregister);--register-y:var(--ea-misregister);--register-a:1"'));

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
// The header sits in the flow, not fixed over the page; the specimen's demo helpers
const EXTRA = `
.nav { position: relative; z-index: 2; background: var(--ea-blue); }
.press, .inks, .process, .studio, .editions, .quote, .runs, .faq, .contact, .footer { position: relative; overflow-x: clip; }
.press, .footer { container-type: inline-size; }
.press .press__s1 { min-height: min(100svh, 760px); padding-top: 56px; }
.press .press__s2 { min-height: 0; }
.demo-pad { padding: clamp(28px, 4vw, 56px) var(--ea-gut); }
.demo-paper { background: var(--ea-paper); color: var(--ea-blue); }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 28px; }
.demo-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; max-width: 760px; margin-top: 32px; }
.type-stack { display: grid; gap: 18px; }
@media (max-width: 760px) {
.demo-fields { grid-template-columns: minmax(0, 1fr); }
}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "ea" && !m[1].startsWith("ea-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("ea-")) CLASSES.add(n);
const KEYFRAMES = ["press-rise", "press-print", "press-print-up", "press-drop", "press-bob"];
const ATTRS = ["art", "out", "sent", "rate", "add", "factor", "label"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "ea", swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .ea itself, or :where(.ea) in front
const ROOTED = /(^|[\s,(>+~])\.ea(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.ea) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Shared SVG defs: the greyscale patterns and gradients the duotone pictures fill with ── */
const DEFS = prefixMarkup(unhook(el('<svg class="svg-defs"'))).replace('<svg class="ea-svg-defs"', '<svg id="ea-defs" class="ea-svg-defs"');

/* ── 7. Component script ─────────────────────────────────────────────── */
// The page's study generator, whole, with its hook and its ids moved under the prefix
const ART_AT = page.indexOf('<script data-8b-part="study-art">');
let ART = page.slice(page.indexOf("\n", ART_AT) + 1, page.indexOf("</script>", ART_AT));
const swapJs = (from, to) => {
  if (!ART.includes(from)) throw new Error("study-art marker not found: " + from);
  ART = ART.split(from).join(to);
};
swapJs("document.querySelectorAll('svg[data-art]').forEach(svg => {", "const draw = svg => {");
swapJs("const seed = Number(svg.dataset.art)", "const seed = Number(svg.dataset.eaArt)");
swapJs("id = 'art' + seed;", "id = 'ea-art' + seed;");
swapJs("    svg.innerHTML = s;\n  });", "    svg.innerHTML = s;\n  };");
ART = ART.replace(/^\(\(\) => \{\n/, "").replace(/\n\}\)\(\);\s*$/, "");
if (ART.includes("})();")) throw new Error("study-art wrapper not stripped");

const JS = `(function () {
  'use strict';
  /* Easel components, no libraries. The seeded study generator draws every
     svg[data-ea-art] as it arrives; the header menu, the plan ticket and the
     signup form answer clicks, inputs and submits; the hero's drums stop
     bobbing while off screen. The hero intro and the bob are CSS, and only
     run under prefers-reduced-motion: no-preference. */
${ART.replace(/^/gm, "  ").replace(/^ {2}$/gm, "")}
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }

  /* Plan ticket: the page's pricing, read from the inputs' data-ea-rate / -add / -factor */
  var usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  var whole = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  function price(quote) {
    var form = quote.querySelector('.ea-quote__form'), ticket = quote.querySelector('.ea-quote__ticket');
    if (!form || !ticket) return;
    var out = function (name) { return ticket.querySelector('[data-ea-out="' + name + '"]'); };
    var plan = form.querySelector('input[name="plan"]:checked');
    var style = form.querySelector('input[name="style"]:checked');
    var billing = form.querySelector('input[name="billing"]:checked');
    var select = form.querySelector('select[name="assists"]');
    var assists = select && select.selectedOptions[0];
    var seatsInput = form.querySelector('input[name="seats"]');
    if (!plan || !style || !billing || !assists || !seatsInput) return;
    var seats = Math.min(50, Math.max(1, Math.round(Number(seatsInput.value) || 1)));
    var perSeat = (Number(plan.dataset.eaRate) + Number(assists.dataset.eaAdd) + Number(style.dataset.eaAdd)) * Number(billing.dataset.eaFactor);
    out('plan').textContent = plan.dataset.eaLabel;
    out('seats').textContent = seats;
    out('assists').textContent = assists.textContent.trim();
    out('style').textContent = style.dataset.eaLabel;
    out('billing').textContent = billing.dataset.eaLabel;
    out('total').textContent = whole.format(Math.round(perSeat * seats));
    out('unit').textContent = usd.format(perSeat);
  }
  ['input', 'change'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      var quote = e.target.closest && e.target.closest('.ea .ea-quote');
      if (quote) price(quote);
    });
  });

  /* The hero's drums pause their bob while the hero is off screen */
  var io = window.IntersectionObserver && new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { en.target.toggleAttribute('data-ea-offscreen', !en.isIntersecting); });
  });

  function init(scope) {
    each(scope, 'svg[data-ea-art]', function (svg) { if (svg._ea) return; svg._ea = true; draw(svg); });
    each(scope, '.ea-quote', function (q) { if (q._ea) return; q._ea = true; price(q); });
    each(scope, '.ea-press', function (p) { if (p._ea || !io) return; p._ea = true; io.observe(p); });
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

  /* Header: the ring button opens the full-screen sheet; its close button, a link or Escape shut it */
  function setOpen(nav, open) {
    var menu = nav.querySelector('.ea-nav__menu'), toggle = nav.querySelector('.ea-nav__toggle');
    if (!menu) return;
    menu.hidden = !open;
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    var focus = open ? nav.querySelector('.ea-nav__close') : toggle;
    if (focus) focus.focus();
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.ea')) return;
    var nav = t.closest('.ea-nav');
    if (nav && t.closest('.ea-nav__toggle')) { setOpen(nav, true); return; }
    if (nav && (t.closest('.ea-nav__close') || t.closest('.ea-nav__menu a'))) setOpen(nav, false);
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    each(document, '.ea-nav__menu:not([hidden])', function (m) { setOpen(m.closest('.ea-nav'), false); });
  });

  /* Signup: a valid form shows the thank-you line; nothing is sent */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.ea form');
    if (!form) return;
    e.preventDefault();
    if (!form.classList.contains('ea-contact__form') || !form.reportValidity()) return;
    form.reset();
    var status = form.querySelector('[data-ea-sent]');
    if (status) status.hidden = false;
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(piece(NAV, '<a class="nav__brand"'))).replace('class="ea-nav__brand"', 'class="sp-brand"');
const CHROME = `
body{margin:0;background:var(--ea-blue)}
.sp-top{position:relative;overflow:hidden;background:var(--ea-blue);color:var(--ea-paper)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;width:min(100% - 2 * var(--ea-gut),var(--ea-maxw));margin:0 auto;min-height:var(--ea-nav-h)}
.sp-brand{display:inline-flex;align-items:center;gap:10px;color:var(--ea-paper);font-family:var(--ea-font-display);font-size:27px;font-weight:900;letter-spacing:-.03em;text-decoration:none}
.sp-brand .ea-nav__mark{display:inline-flex;gap:2px;align-items:flex-start;height:24px}
.sp-brand .ea-disc{width:12px}
.sp-brand .ea-disc:last-child{margin-top:12px}
.sp-meta>span{font-family:var(--ea-font-text);font-size:var(--ea-label);font-weight:600;letter-spacing:.06em;text-transform:uppercase}
.sp-hero{position:relative;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));column-gap:24px;width:min(100% - 2 * var(--ea-gut),var(--ea-maxw));margin:0 auto;padding:clamp(24px,3vw,44px) 0 clamp(40px,5vw,72px)}
.sp-hero h1{grid-column:1 / 9;margin:0;font-family:var(--ea-font-display);font-size:clamp(56px,8.6vw,132px);font-weight:900;line-height:.86;letter-spacing:-.035em;color:var(--ea-pink);text-shadow:var(--ea-misregister) var(--ea-misregister) 0 color-mix(in srgb,var(--ea-paper) 22%,transparent)}
.sp-hero h1 span{display:block;color:var(--ea-paper)}
.sp-copy{grid-column:1 / 7;margin-top:32px;font-family:var(--ea-font-text);font-size:var(--ea-lead);font-weight:500;line-height:1.35}
.sp-plates{grid-column:9 / 13;grid-row:1 / 3;position:relative;align-self:stretch;min-height:260px}
.sp-plates i{position:absolute;inset:0;mix-blend-mode:multiply}
.sp-plates i:nth-child(1){background:var(--ea-paper);clip-path:circle(36% at 40% 44%);mix-blend-mode:normal}
.sp-plates i:nth-child(2){background:radial-gradient(circle closest-side,var(--ea-pink) 88%,transparent 98%) 0 0/var(--ea-dot) var(--ea-dot);clip-path:circle(34% at 62% 60%)}
.sp-plates i:nth-child(3){background:var(--ea-pink);clip-path:circle(12% at 24% 78%);mix-blend-mode:normal}
.sp-swatches{grid-column:1 / -1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;margin-top:40px}
.sp-swatches i{height:18px}
.sp-main{padding:0 var(--ea-gut) 120px;background:var(--ea-paper)}
.sp-sec{padding:72px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-family:var(--ea-font-display);font-size:clamp(30px,3vw,46px);font-weight:800;line-height:1;letter-spacing:-.025em;color:var(--ea-blue)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font-family:var(--ea-font-text);font-size:var(--ea-label);font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ea-blue)}
.sp-label::before{content:"";width:10px;height:10px;border-radius:var(--ea-pill);background:var(--ea-pink)}
.sp-note{margin:0;max-width:680px;font-family:var(--ea-font-text);font-size:15px;line-height:1.55;color:var(--ea-ink)}
.sp-demo{position:relative;overflow:clip;background:var(--ea-blue);box-shadow:0 0 0 var(--ea-rule) var(--ea-blue)}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-hero h1,.sp-copy{grid-column:1 / -1}.sp-plates{grid-column:1 / -1;grid-row:auto;min-height:200px;margin-top:24px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${brand}<span>Design system · easel@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>Two inks,<span>one press.</span></h1>
<p class="sp-copy">A risograph print language: an electric blue and a fluorescent pink overprinted on paper, Gabarito set huge and tight, dotted links that swell solid, pink pills, halftone plates in register, duotone pictures and ink drums that print dotted trails. Extracted from the Easel AI Artist Assistant page.</p>
<div class="sp-plates" aria-hidden="true"><i></i><i></i><i></i></div>
<div class="sp-swatches" aria-label="Core colours">
<i title="--ea-blue" style="background:var(--ea-blue);box-shadow:inset 0 0 0 2px var(--ea-paper)"></i><i title="--ea-pink" style="background:var(--ea-pink)"></i><i title="--ea-paper" style="background:var(--ea-paper)"></i><i title="--ea-ink" style="background:var(--ea-ink)"></i>
</div>
</div>
</header>`;
const specimen = renderSpecimen({
  name: "Easel",
  slug: "easel",
  version: VERSION,
  prefix: "ea",
  rootClass: "ea",
  labelClass: "sp-label",
  script: "scripts/systems/easel.mjs",
  source: SOURCE,
  metaDescription: "The Easel design system: tokens and working components extracted from the Easel AI Artist Assistant page.",
  defsNote: "the greyscale patterns and gradients (ea-p-dot, ea-p-wood, ea-g-light ...) the duotone SVG pictures fill with; include it once per page",
  jsNote: "the seeded study generator for svg[data-ea-art], the header menu, the plan ticket and the signup form",
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
writeSystem({ slug: "easel", prefix: "ea", rootClass: "ea", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-2", "link", "icon-btn", "field", "surface", "disc", "trail", "photo", "wrap", "grid", "lanes", "lane", "drum", "display", "poster", "label", "lead", "title", "text", "press", "nav", "quote", "station", "sheet", "run", "edition"] });
