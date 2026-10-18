// Extracts the Footnote design system from its landing page.
//
//   node scripts/systems/footnote.mjs
//
// Reads public/demos/footnote-grounding.html (never edits it) and writes
// public/systems/footnote/ through scripts/systems/lib.mjs: specimen.html,
// tokens.css and footnote.css.
//
// The page already keeps its design in :root custom properties, so most of
// the normalisation is a rename (--paper -> --fn-paper, --serif ->
// --fn-font-body, …) plus a few repeated literals turned into tokens. Its
// highlighter tray is written in hsl(); the tokens carry the same colours as
// hex so the board can show them as swatches (the relative-colour shading,
// hsl(from var(--color) h s calc(l - 20)), reads hex just as well).
// The scenery (ridgeline parallax, sea, lighthouse) is page art, not system,
// and is left out; the paper, the highlighter, the pencil and the sheets stay.
import { readPage, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/footnote-grounding.html";
const { page, el, css: pageCssRaw } = readPage(SOURCE);
const VERSION = "1.0.0";
const P = "fn";

// The two inline noise textures, verbatim from the page's :root
const grain = /--grain:\s*(url\("[^"]+"\));/.exec(page)[1];
const grainPage = /--grain-page:\s*(url\("[^"]+"\));/.exec(page)[1];

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. Group comments ("/* Color · core *​/")
   are read by the dialog to lay the token panels out, so keep the format. */
const TOKENS = `/* InstaLanding design system · Footnote · footnote@${VERSION}
   Extracted from https://instalanding.ai/demos/footnote-grounding.html
   Fonts (Google Fonts): Source Serif 4 400/600/700 + italic, JetBrains Mono 400/500/700, Caveat 400-700 */
:root {
  /* Color · core */
  --fn-paper: #FFFCF0;
  --fn-paper-2: #F2F0E5;
  --fn-paper-3: #E6E4D9;
  --fn-sheet: #FFFDF6;
  --fn-ink: #100F0F;
  --fn-ink-2: #6F6E69;
  --fn-ink-3: #B7B5AC;
  --fn-rule: #DAD8CE;
  --fn-shore: #2F2B33;
  --fn-print: #205EA6;

  /* Color · highlighters */
  --fn-hl-red: #F5A69E;
  --fn-hl-orange: #FED2AE;
  --fn-hl-yellow: #F6E3A2;
  --fn-hl-green: #DDE2B1;
  --fn-hl-cyan: #BFE8D9;
  --fn-hl-blue: #C5DCE7;
  --fn-hl-purple: #E2D8E9;
  --fn-hl-magenta: #FCCFDA;

  /* Color · pencil & text */
  --fn-pencil: #B1382F;
  --fn-margin-rule: #EA8C86;
  --fn-graphite: #2B2926;
  --fn-ink-hover: #2A2827;
  --fn-text-soft: #2C2A28;
  --fn-text-muted: #46443F;
  --fn-text-card: #4A4843;

  /* Color · terminal & shore */
  --fn-term-dim: #8F8B94;
  --fn-term-dot: #55505C;
  --fn-foot-text: #BFBAB0;

  /* Type · families */
  --fn-font-display: "Source Serif 4", Georgia, serif;
  --fn-font-body: "Source Serif 4", Georgia, serif;
  --fn-font-mono: "JetBrains Mono", ui-monospace, monospace;
  --fn-font-hand: "Caveat", cursive;

  /* Type · scale */
  --fn-step-6: clamp(2.99rem, 2.3rem + 3.44vw, 5.15rem);
  --fn-step-close: clamp(2.6rem, 1.6rem + 4vw, 5rem);
  --fn-step-4: clamp(2.07rem, 1.76rem + 1.55vw, 3.05rem);
  --fn-step-2: clamp(1.44rem, 1.32rem + 0.58vw, 1.8rem);
  --fn-step-1: clamp(1.2rem, 1.13rem + 0.35vw, 1.42rem);
  --fn-step-0: clamp(1rem, 0.96rem + 0.22vw, 1.13rem);
  --fn-step--1: clamp(0.83rem, 0.8rem + 0.16vw, 0.92rem);

  /* Type · rhythm */
  --fn-leading: 1.6;
  --fn-leading-sheet: 1.75;
  --fn-tracking-label: .14em;

  /* Shape · radii */
  --fn-radius-sm: 3px;
  --fn-radius-md: 8px;

  /* Shape · borders */
  --fn-border: 1px;
  --fn-border-note: 3px;

  /* Shape · tilt */
  --fn-tilt-sheet: -0.25deg;
  --fn-tilt-listing: 0.6deg;

  /* Depth · paper shadows */
  --fn-shadow-sheet: 0 1px 0 var(--fn-paper-3), 0 18px 40px -28px rgba(16, 15, 15, 0.45);
  --fn-shadow-card: 0 1px 0 var(--fn-paper-3), 0 14px 28px -22px rgba(16, 15, 15, 0.5);
  --fn-shadow-glow: 0 14px 34px -14px rgba(16, 15, 15, 0.55), 0 0 0 4px hsl(46 83% 80% / 0.45);
  --fn-shadow-term: 0 22px 44px -22px rgba(0, 0, 0, 0.65), 0 0 0 1px hsl(270 6% 26%);

  /* Motion · easing */
  --fn-ease-pen: cubic-bezier(0.55, 0.06, 0.3, 1);
  --fn-ease-blob: cubic-bezier(0.3, 1.7, 0.5, 1);

  /* Motion · durations */
  --fn-dur-press: .18s;
  --fn-dur-pen: 480ms;
  --fn-dur-blob: 420ms;
  --fn-dur-blink: 1s;

  /* Space · layout */
  --fn-measure: 74ch;
  --fn-page-max: 1100px;
  --fn-gutter: 3rem;
  --fn-section-y: clamp(3.5rem, 7vw, 6rem);
  --fn-gap: 1.5rem;

  /* Texture · grain */
  --fn-grain: ${grain};
  --fn-grain-page: ${grainPage};
}`;

/* ── 2. The page CSS, trimmed to the system ───────────────────────────── */
function cut(css, from, to) {
  const a = css.indexOf(from);
  if (a < 0) throw new Error("cut start not found: " + from.slice(0, 50));
  const b = css.indexOf(to, a + from.length);
  if (b < 0) throw new Error("cut end not found: " + to.slice(0, 50));
  return css.slice(0, a) + css.slice(b);
}
function drop(css, text) {
  if (!css.includes(text)) throw new Error("drop not found: " + text.slice(0, 50));
  return css.replace(text, "");
}
let css = pageCssRaw;
// the page's :root blocks become TOKENS
css = cut(css, ":root {\n  color-scheme: light;", "* { margin: 0;");
css = cut(css, ":root {\n  --graphite:", ".paper { position: relative;");
css = drop(css, "html { scroll-behavior: smooth; }\n");
// scenery: the ridgeline parallax, its fir and cover, the sea and the lighthouse
css = cut(css, "/* THE TRACK */", ".hero .wrap {");
css = cut(css, ".parallax__layer {\n", "/* THE LOG");
css = drop(css, "  .parallax__layer .fir { left: 81%; }\n");
css = cut(css, "@media (prefers-reduced-motion: reduce) {\n  .parallax__layer {", ".hero h1 {");
css = cut(css, ".sea { position: absolute;", "/* THE COPY */");
css = cut(css, "@media (max-width: 720px) {\n  .close {", "/* the footer is the shore");
css = css.replace(/\/\* THE CLOSE[\s\S]*?\*\/\n/, "/* THE CLOSE — the closing call to action */\n");

/* Element rules become rules on the system root: the page's bare `body`,
   `mark`, `a`, `button`… are scoped under .fn, with :where() so they stay as
   weak as they were and the classes still win. */
function scopeElements(text) {
  return text.replace(/(^|[{}])(\s*)([^{}@]+?)(\s*)\{/g, (m, open, sp, rawSel, sp2) => {
    // A comment before a rule is captured with its selector: keep it, scope what follows it
    const [, lead, sel] = /^((?:\s*\/\*[\s\S]*?\*\/)*\s*)([\s\S]*)$/.exec(rawSel);
    const s = sel.trim();
    if (!s || /^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+%))*$/.test(s)) return m;
    const scoped = s.split(",").map((one) => {
      const x = one.trim();
      if (x === "body") return ".fn";
      if (x === "*") return ":where(.fn), :where(.fn) *";
      if (/^\*::/.test(x)) return `:where(.fn) ${x}`;
      if (/^(mark|footer|a|button|ul|ol|header|details|summary)([\s.:[>]|$)/.test(x)) return `:where(.fn) ${x}`;
      return x;
    }).join(", ");
    return `${open}${sp}${lead}${scoped}${sp2}{`;
  });
}
css = scopeElements(css).replace("  html { scroll-behavior: auto; }\n", "")
  .replace(/\[data-split\]/g, "[data-fn-split]")
  .replace(/url\(#rough\)/g, "url(#fn-rough)")
  .replace(/url\(#paper\)/g, "url(#fn-paper)")
  .replace(/url\(#crayon\)/g, "url(#fn-crayon)")
  .replace(/"Caveat", cursive/g, "var(--fn-font-hand)");

/* ── 3. Normalisation: page variables and literals -> tokens ─────────── */
const RENAME = {
  paper: "paper", "paper-2": "paper-2", "paper-3": "paper-3", ink: "ink", "ink-2": "ink-2", "ink-3": "ink-3", rule: "rule",
  "hl-red": "hl-red", "hl-orange": "hl-orange", "hl-yellow": "hl-yellow", "hl-green": "hl-green", "hl-cyan": "hl-cyan",
  "hl-blue": "hl-blue", "hl-purple": "hl-purple", "hl-magenta": "hl-magenta",
  serif: "font-body", mono: "font-mono", "step--1": "step--1", "step-0": "step-0", "step-1": "step-1", "step-2": "step-2",
  "step-4": "step-4", "step-6": "step-6", grain: "grain", "grain-page": "grain-page", graphite: "graphite", pencil: "pencil", print: "print",
};
const HEX = {
  "#fffdf6": "sheet", "#fffcf0": "paper", "#e6e4d9": "paper-3", "#2f2b33": "shore", "#2a2827": "ink-hover", "#2c2a28": "text-soft",
  "#46443f": "text-muted", "#4a4843": "text-card", "#8f8b94": "term-dim", "#55505c": "term-dot",
};
const SWAPS = [
  ...Object.entries(RENAME).map(([from, to]) => [new RegExp(`var\\(--${from.replace(/[-]/g, "\\-")}\\)`, "g"), `var(--fn-${to})`]),
  [/0 1px 0 var\(--fn-paper-3\), 0 18px 40px -28px rgba\(16, 15, 15, 0\.45\)/g, "var(--fn-shadow-sheet)"],
  [/0 1px 0 var\(--fn-paper-3\), 0 14px 28px -22px rgba\(16, 15, 15, 0\.5\)/g, "var(--fn-shadow-card)"],
  [/0 14px 34px -14px rgba\(16, 15, 15, 0\.55\), 0 0 0 4px hsl\(46 83% 80% \/ 0\.45\)/g, "var(--fn-shadow-glow)"],
  [/0 22px 44px -22px rgba\(0, 0, 0, 0\.65\), 0 0 0 1px hsl\(270 6% 26%\)/g, "var(--fn-shadow-term)"],
  [/hsl\(40 10% 72%\)/g, "var(--fn-foot-text)"],
  [/hsl\(4 70% 72%\)/g, "var(--fn-margin-rule)"],
  [/cubic-bezier\(0\.55, 0\.06, 0\.3, 1\)/g, "var(--fn-ease-pen)"],
  [/cubic-bezier\(0\.3, 1\.7, 0\.5, 1\)/g, "var(--fn-ease-blob)"],
  [/var\(--dur, 480ms\)/g, "var(--dur, var(--fn-dur-pen))"],
  [/scale 420ms /g, "scale var(--fn-dur-blob) "],
  [/transition: 0\.18s ease/g, "transition: var(--fn-dur-press) ease"],
  [/term-blink 1s /g, "term-blink var(--fn-dur-blink) "],
  [/border-radius: 3px/g, "border-radius: var(--fn-radius-sm)"],
  [/border-radius: 8px/g, "border-radius: var(--fn-radius-md)"],
  [/border-left: 3px solid/g, "border-left: var(--fn-border-note) solid"],
  [/1px solid var\(--fn-rule\)/g, "var(--fn-border) solid var(--fn-rule)"],
  [/rotate: -0\.25deg/g, "rotate: var(--fn-tilt-sheet)"],
  [/rotate: 0\.6deg/g, "rotate: var(--fn-tilt-listing)"],
  [/min\(74ch, 100% - 3rem\)/g, "min(var(--fn-measure), 100% - var(--fn-gutter))"],
  [/min\(1100px, 100% - 3rem\)/g, "min(var(--fn-page-max), 100% - var(--fn-gutter))"],
  [/padding: clamp\(3\.5rem, 7vw, 6rem\) 0/g, "padding: var(--fn-section-y) 0"],
  [/clamp\(2\.6rem, 1\.6rem \+ 4vw, 5rem\)/g, "var(--fn-step-close)"],
  [/line-height: 1\.6;\n  color: var\(--fn-ink\)/g, "line-height: var(--fn-leading);\n  color: var(--fn-ink)"],
  [/letter-spacing: 0\.14em; text-transform: uppercase; color: var\(--fn-ink-2\)/g, "letter-spacing: var(--fn-tracking-label); text-transform: uppercase; color: var(--fn-ink-2)"],
];
// Every class the trimmed CSS uses gets the fn- prefix (data: URIs aside, they hold no selectors)
const CLASSES = [...new Set([...css.replace(/url\([^)]*\)/g, "").matchAll(/\.([a-z][\w-]*)/gi)].map((m) => m[1]))]
  .filter((c) => !/^\d/.test(c) && c !== "fn");
CLASSES.push("w", "last", "is-drawn", "hl-yellow"); // added by the split script / the pen; yellow is the default --color
const KEYFRAMES = ["term-blink"];
const { tokenize, prefixCss, prefixMarkup } = normalizer({ prefix: P, hex: HEX, swaps: SWAPS, classes: CLASSES, keyframes: KEYFRAMES, attrs: ["split"] });
const componentCss = (prefixCss(tokenize(css)).trim() + `

/* A split phrase's words keep the phrase's verdict colour. On the page every
   word of a split mark fell back to the default yellow, because the bare mark
   rule resets --color on each new word; here a word inherits it instead. */
:where(.fn) mark.fn-w { --color: inherit; }
/* Stacked under 900px the listing's grid track is a bare 1fr, which grows to
   the longest JSON line; let it shrink so the <pre> scrolls instead. */
.fn-payload > * { min-width: 0; }`);

/* ── 4. Components (each one real markup from the page) ──────────────── */
const NOTES = [
  ["Grounded", "Impounding began in March 1936, with the reservoir declared operational that October.", "span 2 · district water authority, centenary review, p.14"],
  ["Paraphrased", "Following the 1974 inundation the spillway was reconstructed to a wider profile.", "span 4 · flood commission report, §3.2"],
  ["Stretched", "Design capacity at completion was 38.4 million cubic metres.", "span 1 · engineering appendix — a design figure, not a present-day reading"],
  ["Unsupported", "No retrieved span mentions a second intake, a 2031 date, or any planned works.", "nothing in the context supports this claim"],
];
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const local = (html) => html.replace(/href="#[\w-]*"/g, 'href="#"');

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(local(markup)), ...opts });

add("nav", "Navigation", "A thin paper bar: the mono wordmark with a pale registered mark, mono links in soft ink, and an outlined key button. Sticky and blurred over the page in use.",
  el('<header class="top" data-section="nav">').replace(' data-section="nav"', ""));

add("buttons", "Buttons", "Mono, letter-spaced and nearly square (3px). Filled ink, outlined ink, and the closing glow button with a pale yellow ring and an arrow that steps forward on hover.",
  `<div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center">
${/<a class="btn btn--fill" href="#start">Get a key<\/a>/.exec(page)[0]}
${/<a class="btn btn--line" href="#sheet">See a marked answer<\/a>/.exec(page)[0]}
${/<a class="btn btn--glow" href="#top">Get a key <span aria-hidden="true">→<\/span><\/a>/.exec(page)[0]}
</div>`);

add("headline", "Highlighted headline", "The hero sheet: wrinkled paper stock, a serif headline with one word marked, a lede where every colour is a verdict, and a stacked-disc sun behind. Multi-word marks split into one mark per word so they can wrap.",
  `<section class="hero" style="overflow: hidden">
${el('<div class="hero-sheet paper">')}
</section>`, { js: true, defs: true });

add("tray", "Highlighter tray", "The verdict colours as swatches: each mark is a pseudo-element behind the text, roughened by an SVG displacement filter, with a blob where the pen rested.",
  el('<div class="tray">'), { defs: true });

add("section-head", "Section head", "A mono uppercase label over a balanced serif heading and a muted paragraph, held to a reading measure.",
  el('<div class="sec-head">'));

const sheet = el('<div class="sheet paper">')
  .replace(/ data-note="(\d)"/g, (_, i) => {
    const [who, quote, cite] = NOTES[+i];
    return ` data-claim aria-expanded="false" data-fn-who="${attr(who)}" data-fn-quote="${attr(quote)}" data-fn-cite="${attr(cite)}"`;
  })
  .replace(' id="note"', "").replace(' id="noteWho"', "").replace(' id="noteQuote"', "").replace(' id="noteCite"', "");
add("sheet", "Marked answer", "A sheet of paper set at a slight tilt: a mono header, the answer in large serif with every claim marked, and a source note that opens under it when a claim is picked.",
  sheet.replace(/ data-claim(?=[\s>])/g, " data-fn-claim"), { js: true, defs: true });

add("figures", "Figures", "Four big serif numbers over mono captions, with a pale mono caveat underneath.",
  `<div>
${el('<div class="figures">')}
${el('<p class="caveat">')}
</div>`);

add("steps", "Numbered steps", "Paper cards with a decimal-leading-zero counter, each laid at its own slight angle (--r).",
  el('<div class="steps">'));

add("payload", "Annotated listing", "JSON on a paper sheet with marked values and pencil notes in the margin (Caveat, roughened by the crayon filter), beside its explanation.",
  el('<div class="wide payload">'), { defs: true });

add("cards", "Taped cards", "Paper cards pinned with a strip of tape, a pencil scrawl above each heading, every card at its own angle.",
  el('<div class="uses">'), { defs: true });

add("faq", "Margin notes", "Each question is its own sheet with a red margin rule, a pencilled question mark and a + that turns as it opens. Native details/summary.",
  el('<div class="faq">'), { defs: true });

add("terminal", "Run log", "A terminal in the shore colour, the verdicts printed in the highlighter colours, a blinking cursor on the last line.",
  `<div style="position: relative; height: 360px; --cover: 0px; overflow: hidden">
${el('<div class="term" id="term">').replace(' id="term"', "").replace('<span class="ln"><span class="dim"># what\'s left has roots.</span></span>', '<span class="ln cur"><span class="dim"># what\'s left has roots.</span></span>')}
</div>`);

add("cta", "Closing call", "The last word: a large balanced serif line with its key phrase marked, a short sentence and the glow button.",
  `<div class="close" style="min-height: 0; padding: 3rem 0 3.5rem">
${el('<div class="close__copy wrap">')}
</div>`, { defs: true });

add("footer", "Footer", "The shore the page ends on: the shore colour, mono small print in warm grey, links in paper.",
  el('<footer data-section="footer">').replace(' data-section="footer"', ""));

/* ── 5. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Footnote components. A mark is inline-block so its filter has a box, which
     means a phrase can't wrap: split each mark[data-fn-split] into one mark per
     word (only the last keeps the pen blob). Runs again when marks are added
     later, e.g. by a framework rendering the components. */
  function split() {
    var list = document.querySelectorAll('mark[data-fn-split]');
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.querySelector('mark')) continue;
      var words = m.textContent.split(/\\s+/).filter(Boolean);
      if (words.length < 2) continue;
      var frag = document.createDocumentFragment();
      words.forEach(function (w, j) {
        var s = document.createElement('mark');
        s.className = 'fn-w' + (j === words.length - 1 ? ' fn-last' : '');
        s.textContent = w;
        frag.append(s, document.createTextNode(' '));
      });
      frag.lastChild.remove();
      m.replaceChildren(frag);
    }
  }
  split();
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; split(); });
  }).observe(document.documentElement, { childList: true, subtree: true });

  /* Claims: picking one opens its source note under the sheet; picking it again closes it */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fn-claim]');
    if (!b) return;
    var sheet = b.closest('.fn-sheet'), note = sheet && sheet.querySelector('.fn-note');
    if (!note) return;
    var wasOpen = b.getAttribute('aria-expanded') === 'true';
    var all = sheet.querySelectorAll('[data-fn-claim]');
    for (var i = 0; i < all.length; i++) all[i].setAttribute('aria-expanded', 'false');
    if (wasOpen) { note.hidden = true; return; }
    b.setAttribute('aria-expanded', 'true');
    note.querySelector('.fn-who').textContent = b.getAttribute('data-fn-who');
    note.querySelector('q').textContent = b.getAttribute('data-fn-quote');
    note.querySelector('cite').textContent = b.getAttribute('data-fn-cite');
    note.hidden = false;
  });
})();`;

/* ── 6. Shared SVG defs: the highlighter's rough edge, the paper creases, the crayon ── */
const defs = el('<svg width="0" height="0" aria-hidden="true" style="position: absolute">')
  .replace("<svg ", '<svg id="fn-defs" ')
  .replace('<filter id="rough">', '<filter id="fn-rough">')
  .replace('<filter id="paper">', '<filter id="fn-paper">')
  .replace('<filter id="crayon">', '<filter id="fn-crayon">');

/* ── 7. The specimen page ────────────────────────────────────────────── */
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@400..700&display=swap" rel="stylesheet">';
const CHROME = `
body{margin:0;background:var(--fn-paper);background-image:var(--fn-grain-page);background-blend-mode:multiply}
.sp-top{border-bottom:var(--fn-border) solid var(--fn-rule)}
.sp-top-in{position:relative;max-width:var(--fn-page-max);margin:0 auto;padding:44px 1.5rem 52px;overflow:hidden}
.sp-meta{position:relative;z-index:1;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;padding-bottom:16px;border-bottom:var(--fn-border) solid var(--fn-rule)}
.sp-meta p:last-child{padding:2px 8px;background:var(--fn-paper)}
.sp-hero h1{position:relative;max-width:17ch;margin:36px 0 22px;font-size:var(--fn-step-6);font-weight:600;line-height:1.06;letter-spacing:-.025em;text-wrap:balance}
.sp-lede{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px 48px;align-items:end}
.sp-lede p{margin:0;max-width:46ch;font-size:var(--fn-step-1);color:var(--fn-text-soft)}
.sp-swatches{display:flex;flex-wrap:wrap;gap:8px}
.sp-swatches i{display:block;width:34px;height:34px;border-radius:50%;border:1px solid var(--fn-rule)}
.sp-sun{position:absolute;top:-7rem;right:-6rem;width:clamp(200px,30vw,400px);aspect-ratio:1;pointer-events:none}
.sp-sun i{position:absolute;left:50%;top:50%;width:var(--d);aspect-ratio:1;translate:-50% -50%;border-radius:50%;background:var(--c)}
.sp-sun i:nth-child(1){--d:100%;--c:hsl(345 88% 94%)}.sp-sun i:nth-child(2){--d:82%;--c:hsl(10 88% 89%)}.sp-sun i:nth-child(3){--d:65%;--c:hsl(27 98% 85%)}.sp-sun i:nth-child(4){--d:50%;--c:hsl(38 96% 80%)}.sp-sun i:nth-child(5){--d:36%;--c:hsl(46 92% 72%)}
.sp-main{max-width:var(--fn-page-max);margin:0 auto;padding:8px 1.5rem 120px}
.sp-sec{padding:56px 0;border-bottom:var(--fn-border) solid var(--fn-rule);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:8px 40px;margin-bottom:30px}
.sp-head h2{margin:10px 0 0;font-size:var(--fn-step-2);font-weight:600;line-height:1.15;letter-spacing:-.02em}
.sp-note{margin:0;max-width:640px;font-family:var(--fn-font-mono);font-size:var(--fn-step--1);line-height:1.7;color:var(--fn-ink-2)}
.sp-demo{position:relative}
@media (max-width:720px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-sun{right:-3rem;top:-5rem;width:200px}}
`;
const HERO = `
<header class="sp-top">
<div class="sp-top-in">
<span class="sp-sun" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
<div class="sp-meta"><p class="fn-label">InstaLanding design system</p><p class="fn-label">footnote@${VERSION} · ${C.length} components</p></div>
<div class="sp-hero"><h1>Footnote, a quiet paper system <mark class="fn-hl-green">marked</mark> by hand.</h1></div>
<div class="sp-lede">
<p>Warm paper and ink, Source Serif set calm and large, JetBrains Mono labels and a real highlighter: rough-edged marks whose colour is the meaning. Extracted from the Highlighter Markup landing page.</p>
<div class="sp-swatches" aria-label="Core colours">${["paper", "ink", "hl-green", "hl-orange", "hl-red", "hl-cyan", "pencil"].map((t) => `<i title="--fn-${t}" style="background:var(--fn-${t})"></i>`).join("")}</div>
</div>
</div>
</header>`;

const specimen = renderSpecimen({
  name: "Footnote",
  slug: "footnote",
  version: VERSION,
  prefix: P,
  rootClass: "fn",
  labelClass: "fn-label",
  script: "scripts/systems/footnote.mjs",
  source: SOURCE,
  metaDescription: "The Footnote design system: tokens and working components extracted from the Highlighter Markup landing page.",
  defsNote: "the highlighter's rough edge (#fn-rough), the paper creases (#fn-paper) and the crayon (#fn-crayon) filters",
  jsNote: "splits multi-word marks so they wrap, and opens a claim's source note",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: defs,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 8. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "footnote", prefix: P, rootClass: "fn", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "sheet", "card", "label", "wide", "claim", "paper", "tray", "step", "faq"] });
