// Extracts the Linework design system from its landing page.
//
//   node scripts/systems/linework.mjs
//
// Reads public/demos/linework-architect-assistant.html (never edits it) and
// writes public/systems/linework/ (specimen.html, tokens.css, linework.css)
// through the shared pipeline in lib.mjs. The page keeps one flat <style>; the
// system keeps all of it but the document shell (html, :root), with a few rules
// rewritten so the parts work inside any host: drawings are drawn by default and
// only hide their strokes once the script arms them (so nothing is blank without
// JS), the root clips instead of hiding overflow (so sticky parts still stick),
// and the menu sheet opens from its header rather than from <body>.
// Every picture on the page is SVG written by the page's own script: an
// amphitheatre hero, nine buildings as ink line sets and as shaded renders, a
// five-stage drawing, a studio figure and a harbour city. Those generators are
// pure string builders, so they run here, at build time, with the page's own
// code (sliced out of its <script> and evaluated), and the drawings ship as
// static SVG. What the page's script did at run time comes along as the
// component script: the draw-by-stroke reveal, the blueprint lens, the skyline
// filter, the drawing/render reveal and compare, the stage stepper, the quote
// carousel, the counters, the menu and the local-only form.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/linework-architect-assistant.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS_HREF = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Urbanist:wght@400;500;600&display=swap";
const FONTS = `<link href="${FONTS_HREF}" rel="stylesheet">`;

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. The page's names
   (--paper, --ink, --blue, --blue-soft, --rule, --muted, --graphite) keep their
   names under lw-; its type families become --lw-font-*, its two curves
   --lw-ease and --lw-ease-draw. Group comments are what the board reads. */
const TOKENS = `/* InstaLanding design system · Linework · linework@${VERSION}
   Extracted from https://instalanding.ai/demos/linework-architect-assistant.html
   Fonts: Instrument Sans 400-600, Urbanist 400-600, IBM Plex Mono 400/500 (Google Fonts) */
:root {
  /* Color · core */
  --lw-paper: #F5F5F1;
  --lw-ink: #121212;
  --lw-blue: #4353FF;
  --lw-blue-soft: #EEF0FF;
  --lw-rule: #E1E1DA;
  --lw-sheet: #FFFFFF;

  /* Color · text & drawing */
  --lw-muted: #86867F;
  --lw-graphite: #4B4B46;
  --lw-ink-drawing: #1C1C1A;
  --lw-pencil: #55554F;
  --lw-on-ink: #FFFFFF;

  /* Color · surfaces */
  --lw-tile: #F3F3F0;
  --lw-fig: #E6E6E1;
  --lw-dot: color-mix(in srgb, var(--lw-ink) 12%, transparent);

  /* Type · families */
  --lw-font-display: "Instrument Sans", system-ui, sans-serif;
  --lw-font-body: "Urbanist", system-ui, sans-serif;
  --lw-font-mono: "IBM Plex Mono", ui-monospace, monospace;

  /* Type · scale */
  --lw-display: clamp(2.8rem, 9vw, 4.75rem);
  --lw-display-xl: clamp(4.25rem, 5.6vw, 5.75rem);
  --lw-h2: clamp(2.4rem, 5vw, 4.25rem);
  --lw-h2-sheet: clamp(2.2rem, 4.4vw, 3.6rem);
  --lw-h2-studio: clamp(2.2rem, 4.4vw, 3.75rem);
  --lw-h3: clamp(2rem, 3.4vw, 2.9rem);
  --lw-quote: clamp(1.75rem, 3.6vw, 3rem);
  --lw-stat: 48px;
  --lw-stat-md: 56px;
  --lw-lead: 17px;
  --lw-body: 16px;
  --lw-label: 11px;

  /* Shape · radii */
  --lw-r-btn: 6px;
  --lw-r-tile: 4px;
  --lw-r-bar: 9px;
  --lw-r-pill: 999px;

  /* Shape · borders */
  --lw-hair: 1px;

  /* Drawing · line weights */
  --lw-stroke-outline: 1.5px;
  --lw-stroke-line: 1.05px;
  --lw-stroke-entourage: 0.8px;
  --lw-stroke-window: 0.75px;
  --lw-stroke-detail: 0.7px;
  --lw-stroke-guide: 0.65px;
  --lw-stroke-axis: 0.6px;
  --lw-stroke-surface: 0.55px;
  --lw-stroke-hatch: 0.5px;

  /* Depth · shadows */
  --lw-shadow-btn: 0 10px 30px -12px color-mix(in srgb, var(--lw-ink) 60%, transparent);
  --lw-shadow-btn-hover: 0 14px 34px -12px color-mix(in srgb, var(--lw-blue) 75%, transparent);
  --lw-shadow-sheet: 0 1px 0 rgba(0, 0, 0, .02), 0 40px 80px -50px color-mix(in srgb, var(--lw-ink) 35%, transparent);
  --lw-shadow-tag: 0 10px 26px -10px color-mix(in srgb, var(--lw-blue) 85%, transparent);
  --lw-shadow-knob: 0 6px 18px -6px rgba(0, 0, 0, .3);

  /* Motion · easing */
  --lw-ease: cubic-bezier(.2, .8, .2, 1);
  --lw-ease-draw: cubic-bezier(.65, .05, .25, 1);

  /* Motion · durations */
  --lw-dur-quick: .2s;
  --lw-dur-hover: .25s;
  --lw-dur-state: .3s;
  --lw-dur-fade: .5s;
  --lw-dur-swap: .55s;
  --lw-dur-draw: 800ms;
  --lw-dur-reveal: .9s;
  --lw-dur-intro: 1s;
  --lw-dur-scan: 2.4s;
  --lw-dur-walk: 14s;

  /* Space · layout */
  --lw-wrap: 1400px;
  --lw-gutter: 20px;
  --lw-gutter-md: 32px;
  --lw-hdr: 64px;
  --lw-hdr-md: 72px;
  --lw-grid: 22px;
}`;

/* ── 2. The page's own art generators, run at build time ──────────────
   The script is one IIFE of string builders (helpers, the nine buildings in B,
   the projects in P, drawB/photoB/vbFor, heroArt) followed by mount functions
   that write those strings into the DOM. We take the builders as they are, and
   the mount functions only up to the line that writes the DOM, then return the
   string they built. */
const SCRIPT = page.slice(page.indexOf("<script>\n(()=>{") + 15, page.lastIndexOf("})();"));
const cut = (a, b) => {
  const i = SCRIPT.indexOf(a), j = SCRIPT.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error("script slice not found: " + a);
  return SCRIPT.slice(i, j);
};
const GEN_SRC = [
  cut("const $=", "function mountHero"),
  cut("const XS=", "let filter"),
  cut("const STAGES", "$('#pdraw').innerHTML="), "return s}\n",
  cut("function mountFig(){", "$('#fig').insertAdjacentHTML("), "return s}\n",
  cut("function mountCity(){", "$('#city').innerHTML="), "return out.join('')}\n",
  cut("const Q=", "function mountQuotes"),
  "return {r1,R,circ,B,P,drawB,photoB,vbFor,heroArt,hatchDef,XS,VB,STAGES,mountProcess,mountFig,mountCity,Q};",
].join("\n");
// matchMedia is only read for prefers-reduced-motion, which build time doesn't have
const G = new Function("matchMedia", GEN_SRC)(() => ({ matches: false }));
if (G.P.length !== 9 || G.STAGES.length !== 5 || G.Q.length !== 3) throw new Error("page data changed: P, STAGES or Q");
const { r1, R, circ } = G;

// Art ids move under lw- (patterns, gradients, filters); the one hard-coded blue becomes the token
const artIds = (svg) => svg
  .replace(/ id="([\w-]+)"/g, ' id="lw-$1"')
  .replace(/url\(#([\w-]+)\)/g, "url(#lw-$1)")
  .replace(/stroke="#4353ff"/g, 'style="stroke:var(--blue)"');
const hatch = (id) => artIds(G.hatchDef(id));

/* ── 3. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under lw- (--sans/--head/--mono -> --lw-font-*, --draw -> --lw-ease-draw)
const VARS = { sans: "font-body", head: "font-display", mono: "font-mono", draw: "ease-draw" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("lw-") ? m : `--lw-${VARS[n] ?? n}`));
const HEX = {
  "#f5f5f1": "paper", "#121212": "ink", "#4353ff": "blue", "#eef0ff": "blue-soft", "#e1e1da": "rule", "#86867f": "muted",
  "#4b4b46": "graphite", "#f3f3f0": "tile", "#e6e6e1": "fig", "#1c1c1a": "ink-drawing", "#55554f": "pencil",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--lw-${tok})`];
const mix = (tok) => (_, a) => `color-mix(in srgb,var(--lw-${tok}) ${Math.round(parseFloat(a) * 100)}%,transparent)`;
const DUR = { ".2s": "quick", ".25s": "hover", ".3s": "state", ".5s": "fade", ".55s": "swap", ".9s": "reveal", "1s": "intro", "2.4s": "scan", "14s": "walk" };
// In each transition / animation item, the first time is its duration; delays stay literal
const durations = (css) => css.replace(/((?:transition|animation):)([^;}]+)/g, (_, k, v) => {
  const items = [];
  let depth = 0, start = 0;
  for (let i = 0; i < v.length; i++) {
    if (v[i] === "(") depth++;
    else if (v[i] === ")") depth--;
    else if (v[i] === "," && depth === 0) { items.push(v.slice(start, i)); start = i + 1; }
  }
  items.push(v.slice(start));
  return k + items.map((it) => it.replace(/(?<![\w.(-])(\d*\.?\d+m?s)(?![\w-])/, (t) => (DUR[t] ? `var(--lw-dur-${DUR[t]})` : t))).join(",");
});
// These run after renameVars, so the page's var(--ink) already reads var(--lw-ink)
const SWAPS = [
  // Shadows, as written on the page (before the rgba pass below)
  val("0 10px 30px -12px rgba(18,18,18,.6)", "shadow-btn"),
  val("0 14px 34px -12px rgba(67,83,255,.75)", "shadow-btn-hover"),
  val("0 1px 0 rgba(0,0,0,.02),0 40px 80px -50px rgba(18,18,18,.35)", "shadow-sheet"),
  val("0 10px 26px -10px rgba(67,83,255,.85)", "shadow-tag"),
  val("0 6px 18px -6px rgba(0,0,0,.3)", "shadow-knob"),
  // The dot grid
  [/radial-gradient\(rgba\(18,18,18,\.12\) 1px,transparent 1\.3px\);background-size:22px 22px/, "radial-gradient(var(--lw-dot) 1px,transparent 1.3px);background-size:var(--lw-grid) var(--lw-grid)"],
  // White: sheets behind, ink-side text in front
  [/background:#fff(?![0-9a-f])/gi, "background:var(--lw-sheet)"],
  [/background:rgba\(255,255,255,([\d.]+)\)/g, mix("sheet")],
  [/#fff(?![0-9a-f])/gi, "var(--lw-on-ink)"],
  [/rgba\(255,255,255,([\d.]+)\)/g, mix("on-ink")],
  // Tints of the core colours follow the tokens
  [/rgba\(18,18,18,([\d.]+)\)/g, mix("ink")],
  [/rgba\(67,83,255,([\d.]+)\)/g, mix("blue")],
  [/rgba\(245,245,241,([\d.]+)\)/g, mix("paper")],
  // Radii
  ...[[6, "btn"], [4, "tile"], [9, "bar"], [999, "pill"]].map(([px, t]) => [new RegExp(`border-radius:${px}px(?=[;}])`, "g"), `border-radius:var(--lw-r-${t})`]),
  // Hairlines
  [/(border(?:-\w+)?:)1px solid/g, "$1var(--lw-hair) solid"],
  // Line weights (scaled per drawing by --lw-sw)
  ...[["1.5", "outline"], ["1.05", "line"], [".8", "entourage"], [".75", "window"], [".7", "detail"], [".65", "guide"], [".6", "axis"], [".55", "surface"], [".5", "hatch"]]
    .map(([w, t]) => [new RegExp(`stroke-width:calc\\(${esc(w)}px\\*var\\(--lw-sw,1\\)\\)`, "g"), `stroke-width:calc(var(--lw-stroke-${t})*var(--lw-sw,1))`]),
  // Type
  [/(\.lw-hero h1\{font-size:|\.hero h1\{font-size:)clamp\(2\.8rem,9vw,4\.75rem\)/, "$1var(--lw-display)"],
  [/clamp\(4\.25rem,5\.6vw,5\.75rem\)/, "var(--lw-display-xl)"],
  [/clamp\(2\.4rem,5vw,4\.25rem\)/, "var(--lw-h2)"],
  [/clamp\(2\.2rem,4\.4vw,3\.6rem\)/, "var(--lw-h2-sheet)"],
  [/clamp\(2\.2rem,4\.4vw,3\.75rem\)/, "var(--lw-h2-studio)"],
  [/clamp\(2rem,3\.4vw,2\.9rem\)/, "var(--lw-h3)"],
  [/clamp\(1\.75rem,3\.6vw,3rem\)/, "var(--lw-quote)"],
  [/(dd\{margin-top:12px;font-family:var\(--lw-font-display\);font-size:)48px/, "$1var(--lw-stat)"],
  [/(dd\{font-size:)56px/, "$1var(--lw-stat-md)"],
  [/(\.lead\{font-size:|\.lw-lead\{font-size:)17px/, "$1var(--lw-lead)"],
  [/(font-family:var\(--lw-font-mono\);font-size:)11px(;font-weight:500;letter-spacing:\.14em)/, "$1var(--lw-label)$2"],
  [/(font-family:var\(--lw-font-body\);font-size:)16px/, "$1var(--lw-body)"],
  // Motion
  [/var\(--lw-dur,800ms\)/g, "var(--lw-dur,var(--lw-dur-draw))"],
  // Layout
  [/max-width:1400px/g, "max-width:var(--lw-wrap)"],
  [/(wrap\{max-width:var\(--lw-wrap\);margin:0 auto;padding:0 )20px/, "$1var(--lw-gutter)"],
  [/(wrap\{padding:0 )32px/, "$1var(--lw-gutter-md)"],
  [/(hdr-in\{height:)64px/, "$1var(--lw-hdr)"],
  [/(hdr-in\{height:)72px/, "$1var(--lw-hdr-md)"],
];

/* ── 4. Component CSS: the page's one <style>, minus the shell ───────── */
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
const DROP = /^(html|:root)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.lw, .lw *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.lw, .lw *)${sel.slice(1)}`;
  if (sel === "body") return ".lw";
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
let pageRules = pageCss.replace(/\/\*[\s\S]*?\*\//g, "");
const fix = (from, to) => {
  if (!pageRules.includes(from)) throw new Error("css not found: " + from.slice(0, 70));
  pageRules = pageRules.split(from).join(to);
};
// Drawn by default; the script arms a drawing (hides its strokes) before it draws it in
fix("stroke-dasharray:1 2;stroke-dashoffset:1}\n.on .st", "stroke-dasharray:1 2;stroke-dashoffset:0}\n.arm .st{stroke-dashoffset:1}\n.on .st");
fix("stroke-dasharray:1 2;stroke-dashoffset:1;transition:stroke-dashoffset 1s", "stroke-dasharray:1 2;stroke-dashoffset:0;transition:stroke-dashoffset 1s");
fix(".in .svc svg path,", ".arm .svc svg path{stroke-dashoffset:1}\n.in .svc svg path,");
fix("[data-reveal]{opacity:0;transform:translateY(18px);transition:", "[data-reveal].arm{opacity:0;transform:translateY(18px)}\n[data-reveal]{transition:");
fix(".pdraw .lbl{opacity:0;transition:opacity .5s}", ".pdraw .lbl{transition:opacity .5s}\n.pdraw.arm .lbl{opacity:0}");
fix(".pdraw .fade{opacity:0;transition:opacity .9s}", ".pdraw .fade{transition:opacity .9s}\n.pdraw.arm .fade{opacity:0}");
// The page's script-only ids become classes; the hero runs its scan once it is drawn (.on)
fix("#scan", ".scan");
fix("#lensFrame", ".lens-frame");
fix("#walker", ".walker");
fix(".hero-art.go", ".hero-art.on");
// The menu sheet opens with its header (the page opened it from <body>)
fix(".menu-open .mnav a.ml", ".mnav.menu-open a.ml");
fix(".menu-open .mnav{", ".mnav.menu-open{");
// The root clips instead of hiding overflow, so sticky parts inside it still stick
fix(";-webkit-font-smoothing:antialiased;overflow-x:hidden}", ";-webkit-font-smoothing:antialiased}");
// Written in the page's vocabulary: an in-flow header (.flow), a compact stepper (.compact), the drawing kit (.kit)
const EXTRA_CSS = `
.hdr.flow{position:relative;z-index:2}
.hdr.flow+.mnav{position:relative;inset:auto;z-index:1;display:none;min-height:440px}
.hdr.flow+.mnav.menu-open{display:flex}
.pgrid.compact .pstick{position:relative;top:auto}
.pgrid.compact .slist li{min-height:0;padding:24px 0;cursor:pointer;border-bottom:1px solid var(--rule)}
.pgrid.compact .slist li:not(.cur) .lead,.pgrid.compact .slist li:not(.cur) .pill{display:none}
@media(min-width:1024px){.pgrid.compact .pstick{height:620px}.pgrid.compact .slist li{min-height:0;padding:28px 0}}
.kit{display:grid;gap:16px}
@media(min-width:900px){.kit{grid-template-columns:.9fr 1.1fr}}
.kit>div{position:relative;padding-top:36px;border:1px solid var(--rule);background:var(--paper)}
.kit svg{display:block;width:100%;height:auto;color:var(--ink);overflow:visible}
.kit .tag{position:absolute;left:16px;top:14px;font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.lens-tag{fill:var(--blue)}
.lens-tag+.lbl{fill:#fff}`;
if (pageRules.includes("data:")) throw new Error("inlined data left in the rules");
const base = renameVars(keep(durations(pageRules + "\n" + EXTRA_CSS)));

/* ── 5. Markup ───────────────────────────────────────────────────────── */
const H = page.slice(BODY);
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
const at = (marker) => {
  const i = H.indexOf(marker);
  if (i < 0) throw new Error("markup not found: " + marker);
  return i;
};
// Section anchors become "#"; the script's id hooks and the page's section markers go
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ aria-labelledby="[^"]*"/g, "")
  .replace(/ id="[^"]*"/g, "")
  .replace(/ href="#[\w-]*"/g, ' href="#"')
  .replace(/\n {2,}/g, "\n");
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");
// Art is put in after unhook (it keeps its own lw- ids)
const ART = [];
const art = (svg) => `<!--art:${ART.push(svg) - 1}-->`;
const withArt = (html) => html.replace(/<!--art:(\d+)-->/g, (_, i) => ART[+i]);
const icon = (d) => `<svg class="i" viewBox="0 0 24 24"><path d="${d}"/></svg>`;
const ARROW = "M7 7h10v10M7 17 17 7", PREV = "m12 19-7-7 7-7M19 12H5", NEXT = "M5 12h14M12 5l7 7-7 7";
const pad2 = (i) => String(i + 1).padStart(2, "0");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: withArt(unhook(markup)), ...opts });

/* nav: the page's header with the menu sheet after it, kept in flow (.flow) for the demo */
const HDR = piece('<header class="hdr"')
  .replace('<header class="hdr"', '<header class="hdr flow solid"')
  .replace('<a href="#work">Projects</a>', '<a href="#work" class="cur">Projects</a>');
const MNAV = piece('<nav class="mnav dots"');
add("nav", "Header & menu", "A 64px bar (72px from 768px): the square-and-arch mark with the wordmark in Instrument Sans 500 over a mono kicker, pill-shaped text links (the current one on a 5% ink ground, hover turns blue) and a compact ink button. Under 768px the links and button give way to a two-line burger that crosses when the menu sheet is open; the sheet is dot-grid paper with numbered display links. On a page the header is fixed and turns to frosted paper with a hairline after 24px of scroll (.lw-solid, set by the script); add .lw-flow to keep it in flow, as here.",
  `${HDR.replace('aria-controls="mnav"', 'aria-controls="lw-mnav"')}\n${MNAV.replace('<nav class="mnav dots"', '<nav class="mnav dots" data-keep-id="lw-mnav"')}`, { js: true });

/* buttons */
const CATS = ["All", "Cultural", "Workplace", "Public", "Residential"];
const CHIPS = CATS.map((c) => `<button class="chip" aria-pressed="${c === "All"}" data-c="${c}">${c}<span>${c === "All" ? G.P.length : G.P.filter((p) => p.c === c).length}</span></button>`).join("");
add("buttons", "Buttons, links & chips", "The primary is a 44px ink block at --lw-r-btn (6px) in Urbanist 500 with a soft drop (--lw-shadow-btn); on hover it turns blue with a blue glow and its arrow steps up and right. Text links are 80% ink and turn blue with a 4px-offset underline. Round 44px outline buttons step through things; filter chips are 40px white pills with a mono count and fill ink when pressed (aria-pressed). Small mono pills mark status (blue dot) and a soft blue badge marks a category. On ink the button turns white (.lw-btn-w).",
  `<div style="display:grid;gap:28px">
<div style="display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center"><button class="btn">Get early access ${icon(ARROW)}</button><a class="link" href="#">See what it drew ${icon("M12 5v14M19 12l-7 7-7-7")}</a><span style="display:flex;gap:8px"><button class="circ" aria-label="Previous">${icon(PREV)}</button><button class="circ" aria-label="Next">${icon(NEXT)}</button></span></div>
<div class="filters" role="group" aria-label="Filter projects by type">${CHIPS}</div>
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center"><span class="badge">Cultural</span><p class="pill" style="margin-top:0">Minutes, not weeks</p><p class="mono">No. 01 / 09</p></div>
<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:24px;background:var(--lw-ink);color:var(--lw-on-ink)"><button class="btn btn-w" style="margin-top:0">Start drawing ${icon(ARROW)}</button><p class="eyebrow" style="color:color-mix(in srgb,var(--lw-on-ink) 50%,transparent)">( On ink )</p></div>
</div>`, { js: true });

/* type */
add("type", "Type, eyebrows & labels", "Instrument Sans at 400 sets every heading, light and tight (-.035em on the display, -.03em on h2s), with the first word of the display in --lw-muted. Urbanist carries copy: --lw-lead (17px/1.65) at 70% ink. IBM Plex Mono does every small label: eyebrows in parentheses, tracked .14em in capitals and muted (a <b> inside turns blue), counters, dt labels, hints and the labels drawn into the SVG (.lw-lbl), which read like a drawing's annotations: scales, levels, dimensions.",
  `<div style="display:grid;gap:36px">
<div><p class="eyebrow">( Drawn with <b>Linework</b> )</p><p class="h2" style="font-family:var(--lw-font-display);font-size:var(--lw-display-xl);line-height:.96;letter-spacing:-.035em"><span style="color:var(--lw-muted)">Design</span> places<br>that last.</p></div>
<div style="display:grid;gap:28px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
<div><h2 class="h2" style="margin-top:0">The skyline so far</h2><p class="lead" style="margin-top:16px">Every outline is a building that architects designed with Linework at their side.</p></div>
<div style="display:grid;gap:20px;align-content:start"><p class="mono">No. 01 / 09 · Stage <b style="font-weight:500;color:var(--lw-blue)">03</b> / 05</p><dl style="display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;font-size:14px"><div><dt>Area</dt><dd>6,400 m²</dd></div><div><dt>Status</dt><dd>Completed</dd></div></dl><p class="hint" style="margin-top:0">( Move across the drawing to see the blueprint )</p>
<svg viewBox="0 0 360 64" style="width:100%;max-width:360px;height:auto;color:var(--lw-ink)" aria-hidden="true"><path d="M2 40H358" stroke="currentColor" stroke-width=".7" fill="none"/><path d="M2 34V46M358 34V46" stroke="currentColor" stroke-width=".7"/><text class="lbl" x="180" y="30" font-size="11" text-anchor="middle">30.0 M</text><text class="lbl" x="2" y="62" font-size="11">SITE, 1:200</text><text class="lbl" x="358" y="62" font-size="11" text-anchor="end" style="fill:var(--lw-blue)">DETAIL A, 1:20</text></svg></div>
</div>
</div>`);

/* lines: the drawing kit, drawn with the page's own classes, helpers and one of its buildings */
const WEIGHTS = [["o", "Outline", "outline"], ["l", "Line", "line"], ["T", "Entourage", "entourage"], ["w", "Window", "window"], ["d", "Detail", "detail"], ["g", "Guide", "guide"], ["s", "Surface", "surface"], ["h", "Hatch", "hatch"]];
const ladder = () => {
  let s = `<defs>${hatch("hxk")}</defs>`;
  WEIGHTS.forEach(([c, name, tok], k) => {
    const y = 44 + k * 40;
    s += `<text class="lbl" x="0" y="${y + 4}" font-size="11">${name.toUpperCase()}</text><text class="lbl" x="118" y="${y + 4}" font-size="10" style="fill:var(--muted)">.lw-s${c}</text>`;
    s += `<path class="st s${c}" pathLength="1" d="M200 ${y}H500" style="--d:${k * 110}ms"/>`;
  });
  const y = 44 + WEIGHTS.length * 40;
  s += `<text class="lbl" x="0" y="${y + 4}" font-size="11">AXIS</text><text class="lbl" x="118" y="${y + 4}" font-size="10" style="fill:var(--muted)">.lw-sx</text><path class="sx" d="M200 ${y}H500" style="opacity:.8"/>`;
  s += `<text class="lbl" x="0" y="${y + 44}" font-size="11">SECTION FILL</text><path d="${R(200, y + 30, 300, 22)}" fill="url(#lw-hxk)"/><path class="st sl" pathLength="1" d="${R(200, y + 30, 300, 22)}" style="--d:900ms"/>`;
  return `<svg viewBox="-24 0 548 ${y + 76}" style="--sw:1.4" role="img" aria-label="The nine line weights of a Linework drawing, heaviest first">${s}</svg>`;
};
const kitBuilding = (hid) => {
  const b = G.B.library();
  let s = `<defs>${hatch(hid)}</defs>${G.drawB(b, hid)}`;
  const dims = [
    `M-46 300V8M-52 300H-40M-52 8H-40M-50 304L-42 296M-50 12L-42 4`,
    `M0 344H300M0 338V350M300 338V350M-4 348L4 340M296 348L304 340`,
  ];
  s += `<path class="st sg" pathLength="1" d="${dims[0]}" style="--d:900ms;--dur:700ms"/><path class="st sg" pathLength="1" d="${dims[1]}" style="--d:1000ms;--dur:700ms"/>`;
  s += `<text class="lbl" x="-58" y="154" font-size="11" transform="rotate(-90 -58 154)" text-anchor="middle">29.2 M</text><text class="lbl" x="150" y="366" font-size="11" text-anchor="middle">30.0 M</text>`;
  s += `<path class="st sd" pathLength="1" d="M312 300H340M326 300L320 294H332ZM312 30H340M326 30L320 24H332Z" style="--d:1100ms"/><text class="lbl" x="346" y="304" font-size="11">±0.00</text><text class="lbl" x="346" y="34" font-size="11">+27.00</text>`;
  s += `<path class="st sd" pathLength="1" d="${circ(390, -24, 14)}M390 -6V-42M384 -32L390 -42L396 -32" style="--d:1200ms"/><text class="lbl" x="390" y="16" font-size="11" text-anchor="middle">N</text>`;
  s += `<path class="st sl" pathLength="1" d="M0 404H200V410H0ZM50 404V410M100 404V410M150 404V410" style="--d:1250ms"/><path d="${R(0, 404, 50, 6)}${R(100, 404, 50, 6)}" fill="currentColor"/><text class="lbl" x="210" y="411" font-size="10">0  5  10  15  20 M · SCALE 1:200</text>`;
  // Detail A: the page's lens frame (corner marks and a blue tag) around two windows
  s += `<g style="color:var(--blue)"><path class="st sg" pathLength="1" d="M206 60V44H222M274 44H290V60M290 112V128H274M222 128H206V112M290 86H300" style="--d:1400ms;--sw:2"/><text class="lbl" x="304" y="90" font-size="10" style="fill:var(--blue)">DETAIL A, 1:20</text></g>`;
  return `<svg viewBox="-90 -60 520 490" style="--sw:1.3" role="img" aria-label="A library elevation with its dimensions, levels, a north point, a scale bar and a detail callout">${s}</svg>`;
};
add("lines", "Line weights & dimensions", "The drawing language as a kit. Every stroke is a <path class=\"lw-st lw-s?\" pathLength=\"1\"> with a weight class: outline (.lw-so, 1.5px), line, entourage (trees and people), window, detail, guide (blue), surface, hatch (.lw-sh, .5px), plus dashed blue axes (.lw-sx); each weight is a token, and --lw-sw scales a whole drawing. Section fills are a 45° blue hatch pattern. Annotations are mono .lw-lbl text: dimension lines with ticks and rotated values, level marks (±0.00, +27.00), a north point, a scale bar and a DETAIL callout in the hero lens's corner marks.",
  `<div class="kit"><div class="dots">${art(ladder())}<span class="tag">Line weights</span></div><div class="dots" data-lw-draw>${art(kitBuilding("hxb"))}<span class="tag">Elevation, 1:200</span></div></div>`.replace('<div class="dots"><', '<div class="dots" data-lw-draw><'), { js: true });

/* hero */
const HA = G.heroArt();
const HERO_SVG = `<svg viewBox="0 0 ${HA.W} ${HA.H}" role="img" aria-label="Ink drawing of a Roman amphitheatre: four tiers of arches rise on the left, then the wall curves away and steps down into a long ruin" data-lw-lens data-lw-g="${HA.G}" data-lw-x0="${HA.X0}"><g class="ink art" style="--sw:1">${HA.svg}</g></svg>`;
const HERO = asDiv(piece('<section class="hero dots"'))
  .replace('<div class="hero-art" id="heroArt"></div>', `<div class="hero-art" data-lw-draw>${art(HERO_SVG)}</div>`);
add("hero", "Drawing hero & blueprint lens", "Dot-grid paper, a light Instrument Sans display (--lw-display, up to --lw-display-xl from 1280px, where the copy moves over the drawing's right half), a lead, the ink button and a link, and a mono hint. The drawing is an amphitheatre in the page's own ink line set, wider than the screen, that draws itself stroke by stroke over three seconds: ground, outline, bays, then trees and people, with blue perspective guides and a dimension. A blue scan line sweeps it once, then a 300×190 blueprint lens (blue ground, white grid, the same drawing in white) roams on its own and follows the pointer, with DETAIL A, 1:200 above it and live X/H coordinates in metres below.",
  HERO, { js: true });

/* services */
add("services", "Service sheet & drawn icons", "A white sheet with hairline borders, crossed by two faint diagonals like a drawing's void marks, and a deep soft shadow (--lw-shadow-sheet). Its top splits into an eyebrow and h2 beside a lead; below sit three tiles (--lw-tile ground, --lw-r-tile corners) with a mono numbered title and a 64×64 line icon whose strokes draw in, one after another, as the tile reveals. Hover lifts a tile 3px onto white and turns its number and icon blue.",
  piece('<div class="card">'), { js: true });

/* skyline */
const SKY_G = G.P.map((p, i) => {
  const b = p.b;
  const left = r1(((G.XS[i] + b.w / 2 - G.VB.x) / G.VB.w) * 1000) / 10, top = r1(((-b.h + (b.top || 0) - 20 - G.VB.y) / G.VB.h) * 1000) / 10;
  return `<g class="bg${i === 0 ? " active" : ""}" data-i="${i}" data-lw-c="${p.c}" data-lw-t="${p.t}" data-lw-x="${left}" data-lw-y="${top}" transform="translate(${G.XS[i]} ${-b.h})" style="--bd:${i * 140}ms"><g class="lift"><rect x="-50" y="${(b.top || 0) - 50}" width="${b.w + 100}" height="${b.h - (b.top || 0) + 60}" fill="transparent"/>${artIds(G.drawB(b, "hx1"))}</g></g>`;
}).join("");
let GT = "";
for (let x = -30; x < 3870; x += 9) GT += `M${x} 8L${x + 7} 1`;
const SKY_SVG = `<svg viewBox="${G.VB.x} ${G.VB.y} ${G.VB.w} ${G.VB.h}" aria-hidden="true" data-lw-draw><defs>${hatch("hx1")}</defs><path class="st so" pathLength="1" d="M-34 0H3870" style="--dur:1800ms"/><path class="st sh" pathLength="1" d="${GT}" style="--dur:1800ms"/>${SKY_G}</svg>`;
const B0 = SKY_G.match(/data-lw-x="([\d.]+)" data-lw-y="([\d.]+)"/);
const BUBBLE = `<div class="bubble" style="left:${B0[1]}%;top:${B0[2]}%"><div><em>01</em><span>${G.P[0].t}</span>${icon(ARROW).replace('class="i"', 'class="i" style="width:14px;height:14px"')}</div><i></i></div>`;
const TICKS = G.P.map((p, i) => `<li style="left:${r1(((G.XS[i] + p.b.w / 2 - G.VB.x) / G.VB.w) * 1000) / 10}%"><a href="#" data-i="${i}"${i === 0 ? ' class="cur"' : ""}>${pad2(i)}<span class="sr">${p.t}</span></a></li>`).join("");
const WORK = piece('<section class="work"');
const SKYLINE = `<div class="work-scope">
${sliceEl(WORK, '<div class="wrap work-head">').html.replace('<div class="filters" role="group" aria-label="Filter projects by type" id="filters"></div>', `<div class="filters" role="group" aria-label="Filter projects by type">${CHIPS}</div>`)}
${sliceEl(WORK, '<div class="sky-wrap">').html
  .replace('<div class="sky-svg" id="sky"></div>', `<div class="sky-svg">${art(SKY_SVG)}${BUBBLE}</div>`)
  .replace('<ol class="ticks" id="ticks" aria-label="Projects on the skyline"></ol>', `<ol class="ticks" aria-label="Projects on the skyline">${TICKS}</ol>`)}
</div>`;
add("skyline", "Project skyline & filters", "Nine buildings drawn in line on one ground line, hatched along the bottom, each rising in turn (--lw-bd staggers them 140ms apart). Hover or tap a building, or pick its mono number on the scale below, and it lifts 12px, turns blue, shows its hatch and dashed axes, and a blue pill callout on a hairline leader names it. Filter chips dim (14%) what doesn't match and move the selection to the first that does. The strip keeps a 1080px minimum and scrolls sideways on small screens.",
  SKYLINE, { js: true });

/* panel: three of the projects, as the page draws them (line set + render), swapped by prev / next */
const projectParts = (i) => {
  const p = G.P[i], b = p.b, v = G.vbFor(b);
  const sk = `<svg viewBox="${v.vb}" preserveAspectRatio="xMidYMid meet" style="--sw:${r1(v.sw * 10) / 10}" aria-hidden="true" data-lw-draw><defs>${hatch("hx2")}</defs><g>${artIds(G.drawB(b, "hx2"))}</g></svg>`;
  const ph = `<svg viewBox="${v.vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${artIds(G.photoB(p, "pp" + i))}</svg>`;
  const info = `<div class="prow"><p class="mono">No. ${pad2(i)} / 09</p><span class="badge">${p.c}</span></div>
<h3>${p.t}</h3><p class="meta">${p.loc}<span aria-hidden="true" style="margin:0 8px">·</span>${p.y}</p><p class="sum">${p.sum}</p>
<dl><div><dt>Area</dt><dd>${p.a}</dd></div><div><dt>Status</dt><dd>${p.s}</dd></div></dl>
<div class="pact"><a class="btn" href="#">View project ${icon(ARROW)}</a><div><button class="circ" data-lw-step="-1" aria-label="Previous building">${icon(PREV)}</button><button class="circ" data-lw-step="1" aria-label="Next building">${icon(NEXT)}</button></div></div>`;
  return { sk, ph, info };
};
const PANEL_SET = [0, 1, 4];
const P0 = projectParts(PANEL_SET[0]);
const PANEL = sliceEl(WORK, '<div class="panel"').html
  .replace('<div class="pv" id="pv" role="button" tabindex="0" aria-label="Open project">', '<div class="pv" role="button" tabindex="0" aria-pressed="false" aria-label="Show the rendering">')
  .replace('<div class="sk dots"></div><div class="ph"></div>', `<div class="sk dots">${art(P0.sk)}</div><div class="ph">${art(P0.ph)}</div>`)
  .replace('<div class="pinfo" id="pinfo"></div>', `<div class="pinfo" aria-live="polite">${P0.info}</div>`)
  .replace(/<\/div>$/, `${PANEL_SET.map((i) => { const x = projectParts(i); return `<template data-lw-project>${art(x.sk)}${art(x.ph)}${x.info}</template>`; }).join("")}</div>`);
add("panel", "Project panel: drawing & render", "A white two-column panel. Left, the selected building as a line drawing on dot-grid paper, framed by three blue corner marks; move over it (or tap, or press Enter) and a circle opens from the pointer onto a shaded render of the same building, while the mono tag swaps from Drawing to Rendering in blue. Right, a mono index and category badge, an h3 at --lw-h3, location and year, a summary, a dl of facts over a hairline, and the actions: an ink button and round prev / next. Each project is a <template data-lw-project> inside the panel; the swap slides the details in and redraws the building.",
  PANEL, { js: true });

/* compare: the project sheet (the page's project dialog box, inline) */
const CP = G.P[2], CB = CP.b, CV = G.vbFor(CB, 0.22, 1.8);
const DART = `<div class="dart"><div class="dots" style="position:absolute;inset:0"><svg viewBox="${CV.vb}" preserveAspectRatio="xMidYMid meet" style="--sw:${r1(CV.sw * 10) / 10};color:var(--ink)" aria-hidden="true" data-lw-draw><defs>${hatch("hx4")}</defs><g>${artIds(G.drawB(CB, "hx4"))}</g></svg></div><div class="ph"><svg viewBox="${CV.vb}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${artIds(G.photoB(CP, "dp"))}</svg></div><div class="split"><b>⟷</b></div><input type="range" min="0" max="100" value="50" aria-label="Compare drawing and rendering"></div>`;
const DTXT = `<div class="dtxt"><div class="prow"><p class="mono">No. 03 / 09</p><span class="badge">${CP.c}</span></div><h3>${CP.t}</h3><p class="lead" style="margin-top:12px">${CP.sum}</p><div class="desc">${CP.d.map((x) => `<p>${x}</p>`).join("")}</div><div style="margin-top:24px;padding:16px 18px;border:1px solid rgba(67,83,255,.3);background:var(--blue-soft);border-radius:6px"><p class="eyebrow" style="color:var(--blue)">With Linework</p><p style="margin-top:6px;font-size:15px;line-height:1.6">${CP.ai}</p></div><dl><div><dt>Location</dt><dd>${CP.loc}</dd></div><div><dt>Year</dt><dd>${CP.y}</dd></div><div><dt>Area</dt><dd>${CP.a}</dd></div><div><dt>Status</dt><dd>${CP.s}</dd></div><div style="grid-column:1/-1"><dt>Client</dt><dd>${CP.cl}</dd></div></dl></div>`;
add("compare", "Project sheet & compare slider", "The page's project dialog, as a sheet you can place inline or inside a <dialog>: on the left the building's drawing and its render share one frame, split by a hairline with a round mono handle (⟷); dragging (a full-size transparent range input) moves the split. On the right, an index and badge, an h3, a lead, the story in paragraphs, a soft blue \"With Linework\" note and a dl of facts. Two columns from 900px; below that it stacks and scrolls.",
  `<div class="dbox">${art(DART)}${DTXT}</div>`, { js: true });

/* process */
const PSVG = `<svg viewBox="-84 -5 1068 555" role="img" aria-label="A community house drawn stage by stage">${artIds(G.mountProcess())}</svg>`;
const STEPS = G.STAGES.map((x, i) => `<button aria-label="Stage 0${i + 1}: ${x[0]}"${i === 0 ? ' class="cur" aria-current="step"' : ""}><i></i><span>0${i + 1}</span></button>`).join("");
const SLIST = G.STAGES.map((x, i) => `<li data-step="${i}"${i === 0 ? ' class="cur"' : ""}><div><p class="n">0${i + 1}</p><h3>${x[0]}</h3><p class="lead">${x[1]}</p><p class="pill">${x[2]}</p></div></li>`).join("");
const PROCESS = asDiv(piece('<section class="process"'))
  .replace('<div class="wrap pgrid">', '<div class="wrap pgrid compact">')
  .replace('id="stN">01</b>', 'data-lw-stn>01</b>').replace('<p id="stT">Site and brief</p>', '<p data-lw-stt>Site and brief</p>')
  .replace('<div class="pdraw" id="pdraw"></div>', `<div class="pdraw">${art(PSVG)}</div>`)
  .replace('<div class="psteps" id="psteps"></div>', `<div class="psteps">${STEPS}</div>`)
  .replace('<ol class="slist" id="slist"></ol>', `<ol class="slist">${SLIST}</ol>`);
add("process", "Stage drawing & stepper", "One drawing built in five stages: site and brief, massing, structure, facade and detail, then trees and people. Each stage's strokes draw in after the last, the current stage's lines turn blue and settle back to pencil grey, and labels (N, SITE 1:200, levels, spans) fade in. A frosted bar gives Stage 0n / 05 and the stage name; a strip of five 3px bars (blue for the current, pale blue for done) steps through it. Beside it, the five stages as mono numbers, h3s and leads with a status pill, the current at full strength. .lw-compact (as here) drives it from the steps or a click on a stage and folds the other stages to their titles; without it, a sticky drawing follows the full list as you scroll.",
  PROCESS, { js: true });

/* studio: the figure, the copy, principles and stats */
const FIG = `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A colleague walking past drawings pinned to the wall of the studio" style="filter:grayscale(1) contrast(1.04)"><defs>${hatch("hxs")}</defs>${artIds(G.mountFig()).replace(' id="lw-walker"', ' class="walker"')}</svg>`;
const STUDIO = asDiv(piece('<section class="studio"'))
  .replace('<div class="fig" id="fig"><span class="tag">Fig. 01</span></div>', `<div class="fig"><span class="tag">Fig. 01</span>${art(FIG)}</div>`)
  .replace(/<dd data-n="(\d+)">0<\/dd>/g, '<dd data-n="$1">$1</dd>');
add("studio", "Studio figure, principles & stats", "A 4:5 figure (Fig. 01, in a mono tag set in difference blend) shows drawings of the page's buildings pinned to a studio wall while a blurred colleague walks past on a 14s loop, with a mono caption split left and right. Beside it, an h2 at --lw-h2-studio, two columns of copy, numbered principles on hairline rows (number, h3, line; the number turns blue on hover) and a stats grid: hairline-separated white cells with a mono dt and a big Instrument Sans figure that counts up once in view.",
  STUDIO, { js: true });

/* quotes */
const QUOTE = (q) => `<blockquote><span>“</span>${q[0]}<span>”</span></blockquote><figcaption><span>${q[1]}<small>${q[2]}</small></span></figcaption>`;
const QUOTES = piece('<section class="quotes"')
  .replace('<span style="color:var(--ink)" id="qn">01</span>', '<span style="color:var(--ink)" data-lw-qn>01</span>')
  .replace('<figure class="qfig" id="qfig"></figure>', `<figure class="qfig">${QUOTE(G.Q[0])}</figure>${G.Q.map((q) => `<template data-lw-quote>${QUOTE(q)}</template>`).join("")}`)
  .replace('<div class="qdots" id="qdots"></div>', `<div class="qdots">${G.Q.map((_, i) => `<button aria-label="Show quote ${i + 1} of 3" aria-pressed="${i === 0}"><i></i></button>`).join("")}</div>`)
  .replace('id="qprev"', 'data-lw-step="-1"').replace('id="qnext"', 'data-lw-step="1"');
add("quotes", "Quote carousel", "A white band: a mono eyebrow and a 01 / 03 counter, then the quote in Instrument Sans at --lw-quote with blue quote marks, and its source after a 40px hairline. Short 3px bars (the current one 40px and blue) and two round arrow buttons change it; it also moves on every 8 seconds unless reduced motion is set, and each new quote rises in.",
  asDiv(QUOTES), { js: true });

/* enquire: the early-access dialog's box, inline */
const ENQ = sliceEl(H, '<div class="dtxt">', at('<dialog id="dlgE"')).html;
add("enquire", "Early-access form", "The page's early-access dialog box, inline: a white sheet with a mono eyebrow, an h3 and a form whose labels are mono capitals over paper-filled fields with hairline borders and 6px corners; focus turns the border blue and the field white. Sending (here, nothing is sent) swaps the form for a soft blue note. Put it inside <dialog> for the page's modal, which rises in over a blurred ink backdrop.",
  `<div class="dbox" style="grid-template-columns:1fr;max-width:640px">${ENQ}</div>`, { js: true });

/* footer */
const CITY = `<svg viewBox="0 0 3168 1180" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Ink drawing of a harbour city: gabled townhouses and brick warehouses on the quay, a mosque with a dome and minarets, a vaulted gallery, a stone library, new towers with two cranes at work, a bridge and boats on the water" data-lw-draw><g>${G.mountCity()}</g></svg>`;
const FOOTER = piece("<footer").replace('<div class="city" id="city"></div>', `<div class="city">${art(CITY)}</div>`);
add("footer", "Footer & harbour city", "An ink band: a white-on-ink eyebrow, a big h2 and a white button, beside an address and a footer nav in two columns. Below, a whole harbour city in white line at 62% (townhouses, a warehouse, a mosque, a vaulted gallery, a library, towers with two cranes, a bridge, boats and water) draws itself in when it comes into view. A hairline bottom bar carries the mark, the copyright and a back-to-top link.",
  FOOTER, { js: true });

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "lw" && !m[1].startsWith("lw-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("lw-")) CLASSES.add(n);
const ATTRS = ["reveal", "enquire", "close", "i", "c", "n", "s", "step"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "lw", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: ["up", "fade", "scan", "slideIn", "walk", "dlg"], attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`))
  .replace(/ data-keep-id="([\w-]+)"/g, ' id="$1"');
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .lw itself, or :where(.lw) in front
const ROOTED = /(^|[\s,(>+~])\.lw(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at2 = rule.indexOf("{");
    const prelude = rule.slice(0, at2).trim();
    const body = rule.slice(at2 + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.lw) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(base))).trim();
const leftHex = componentCss.match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Linework components, no libraries. Everything is set up by init(scope),
     which runs on load and again (through a MutationObserver) for markup added
     later, so pasted or rendered components work without setup.
     - [data-lw-draw]: armed (strokes hidden), then drawn stroke by stroke when
       it scrolls into view (.lw-on). [data-lw-reveal] rises in the same way.
     - svg[data-lw-lens]: the hero's blueprint lens, scan line and coordinates.
     - .lw-work-scope: skyline selection and filter chips.
     - .lw-panel: drawing / render reveal and prev / next over its templates.
     - .lw-dart: the compare slider. .lw-pgrid: the stage stepper.
     - .lw-quotes: the carousel. .lw-stats: the count-up.
     - .lw-hdr: solid on scroll, the burger and its menu sheet.
     - .lw-form: a local-only send. Nothing here talks to a server.
     Under prefers-reduced-motion drawings show at once, the lens stops roaming
     and the carousel stops advancing. */
  var RM = matchMedia('(prefers-reduced-motion: reduce)');
  var IO = 'IntersectionObserver' in window;
  var uid = 0;
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function fresh(scope, sel, key) {
    return all(sel, scope).filter(function (el) { if (el['_lw' + key]) return false; el['_lw' + key] = 1; return true; });
  }
  function once(el, fn, th) {
    if (!IO) { fn(el); return; }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { o.disconnect(); fn(e.target); } });
    }, { threshold: th || 0.15 });
    o.observe(el);
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function pad(n) { return (n < 9 ? '0' : '') + (n + 1); }
  function draw(el) {
    el.classList.remove('lw-on');
    el.classList.add('lw-arm');
    void el.getBoundingClientRect();
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('lw-on'); }); });
  }

  /* The blueprint lens: a clipped copy of the drawing in white on blue, roaming until the pointer takes it */
  function lens(svg) {
    var vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
    var G = +svg.getAttribute('data-lw-g') || H, X0 = +svg.getAttribute('data-lw-x0') || 0;
    var ink = svg.querySelector('.lw-ink');
    if (!ink) return;
    var id = 'lw-lens-' + (++uid);
    svg.insertAdjacentHTML('beforeend',
      '<defs><clipPath id="' + id + '-c"><rect width="300" height="190"/></clipPath>' +
      '<pattern id="' + id + '-g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".6"/><circle cx="0" cy="0" r="1" fill="#fff" fill-opacity=".35"/></pattern></defs>' +
      '<g clip-path="url(#' + id + '-c)" class="lw-lens"><rect width="' + W + '" height="' + H + '" style="fill:var(--lw-blue)"/><rect width="' + W + '" height="' + H + '" fill="url(#' + id + '-g)"/></g>' +
      '<line class="lw-scan" x1="0" x2="' + W + '" y1="0" y2="0" stroke-width="1.2" style="stroke:var(--lw-blue);filter:drop-shadow(0 0 8px color-mix(in srgb,var(--lw-blue) 70%,transparent))"/>' +
      '<g class="lw-lens-frame" style="pointer-events:none"><g fill="none" stroke-width="1.2" style="stroke:var(--lw-blue)"><path d="M0 16V0H16M284 0H300V16M300 174V190H284M16 190H0V174"/><path d="M-10 0H6M0 -10V6" stroke-width=".8"/></g>' +
      '<text x="0" y="-12" class="lw-lbl" font-size="11" style="fill:var(--lw-blue)">DETAIL A, 1:200</text>' +
      '<g transform="translate(300 202)"><rect class="lw-lens-tag" x="-144" y="0" width="144" height="20" rx="3"/><text x="-72" y="14" class="lw-lbl" font-size="11" text-anchor="middle">X 0.0 m  H 0.0 m</text></g></g>');
    var clip = svg.querySelector('#' + id + '-c rect'), layer = all('.lw-lens', svg).pop();
    var frame = all('.lw-lens-frame', svg).pop(), xy = frame.querySelector('.lw-lens-tag + text');
    var copy = ink.cloneNode(true);
    copy.classList.remove('lw-ink');
    copy.style.color = 'var(--lw-on-ink)';
    copy.style.setProperty('--lw-sw', '1.1');
    all('.lw-sx', copy).forEach(function (p) { p.style.opacity = '.9'; p.style.stroke = 'var(--lw-on-ink)'; });
    layer.appendChild(copy);
    var tx = W * 0.32, ty = H * 0.42, cx = tx, cy = ty, user = false, t0 = performance.now(), live = false, raf = 0;
    function toSvg(e) { var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
    svg.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; var p = toSvg(e); tx = p.x; ty = p.y; user = true; wake(); });
    svg.addEventListener('pointerdown', function (e) { var p = toSvg(e); tx = p.x; ty = p.y; user = true; wake(); });
    svg.addEventListener('pointerleave', function () { user = false; t0 = performance.now(); wake(); });
    function place() {
      var lx = cx - 150, ly = cy - 95;
      clip.setAttribute('x', r1(lx)); clip.setAttribute('y', r1(ly));
      frame.setAttribute('transform', 'translate(' + r1(lx) + ' ' + r1(ly) + ')');
      xy.textContent = 'X ' + ((cx - X0) / 10).toFixed(1).padStart(5, ' ') + ' m  H ' + Math.max(0, (G - cy) / 10).toFixed(1) + ' m';
    }
    function tick(now) {
      raf = 0;
      if (!user && !RM.matches) { var t = (now - t0) / 1000; tx = W * (0.36 + 0.2 * Math.sin(t * 0.35)); ty = H * (0.48 + 0.13 * Math.sin(t * 0.6)); }
      var k = RM.matches ? 1 : 0.12;
      cx += (tx - cx) * k; cy += (ty - cy) * k;
      place();
      var moving = Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2;
      if (live && (moving || (!user && !RM.matches))) raf = requestAnimationFrame(tick);
    }
    function wake() { if (live && !raf) raf = requestAnimationFrame(tick); }
    if (RM.matches) { tx = cx = W * 0.36; ty = cy = H * 0.48; }
    place();
    if (IO) new IntersectionObserver(function (es) { live = es[0].isIntersecting; wake(); }).observe(svg);
    else { live = true; wake(); }
  }

  /* Skyline: one selected building, a callout that follows it, and filter chips */
  function skyline(scope) {
    var bgs = all('.lw-bg', scope), ticks = all('.lw-ticks a', scope), chips = all('.lw-chip[data-lw-c]', scope);
    var bubble = scope.querySelector('.lw-bubble'), act = 0, filter = 'All';
    if (!bgs.length) return;
    function ok(i) { return filter === 'All' || bgs[i].getAttribute('data-lw-c') === filter; }
    function set(i) {
      act = i;
      bgs.forEach(function (g, k) { g.classList.toggle('lw-active', k === i); });
      ticks.forEach(function (a, k) { a.classList.toggle('lw-cur', k === i); });
      if (bubble) {
        bubble.style.left = bgs[i].getAttribute('data-lw-x') + '%';
        bubble.style.top = bgs[i].getAttribute('data-lw-y') + '%';
        bubble.querySelector('em').textContent = pad(i);
        bubble.querySelector('span').textContent = bgs[i].getAttribute('data-lw-t');
      }
    }
    bgs.forEach(function (g, i) { g.addEventListener('mouseenter', function () { set(i); }); g.addEventListener('click', function () { set(i); }); });
    ticks.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); if (ok(i)) set(i); }); });
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        filter = c.getAttribute('data-lw-c');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
        bgs.forEach(function (g, i) { g.classList.toggle('lw-muted', !ok(i)); });
        ticks.forEach(function (a, i) { a.classList.toggle('lw-muted', !ok(i)); });
        if (!ok(act)) for (var i = 0; i < bgs.length; i++) if (ok(i)) { set(i); break; }
      });
    });
  }

  /* Panel: the render opens in a circle from the pointer; prev / next swap in the next template */
  function panel(el) {
    var pv = el.querySelector('.lw-pv'), info = el.querySelector('.lw-pinfo'), tpl = all('template[data-lw-project]', el), cur = 0;
    if (!pv) return;
    function mv(e) { var r = pv.getBoundingClientRect(); pv.style.setProperty('--lw-mx', (e.clientX - r.left) + 'px'); pv.style.setProperty('--lw-my', (e.clientY - r.top) + 'px'); }
    function rev(on) { pv.classList.toggle('lw-rev', on); pv.setAttribute('aria-pressed', String(on)); }
    pv.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; mv(e); rev(true); });
    pv.addEventListener('pointermove', mv);
    pv.addEventListener('pointerleave', function () { rev(false); });
    pv.addEventListener('click', function (e) { if (e.pointerType === 'mouse') return; mv(e); rev(!pv.classList.contains('lw-rev')); });
    pv.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pv.style.removeProperty('--lw-mx'); pv.style.removeProperty('--lw-my'); rev(!pv.classList.contains('lw-rev')); } });
    el.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lw-step]');
      if (!b || !tpl.length || !el.contains(b)) return;
      cur = (cur + +b.getAttribute('data-lw-step') + tpl.length) % tpl.length;
      var f = tpl[cur].content, svgs = f.querySelectorAll('svg');
      pv.querySelector('.lw-sk').innerHTML = svgs[0].outerHTML;
      pv.querySelector('.lw-ph').innerHTML = svgs[1].outerHTML;
      var rest = f.cloneNode(true);
      all('svg', rest).forEach(function (s) { if (s.parentNode === rest) rest.removeChild(s); });
      info.classList.remove('lw-swap'); void info.offsetWidth;
      info.innerHTML = ''; info.appendChild(rest); info.classList.add('lw-swap');
      init(el);
      var focus = info.querySelector('[data-lw-step="' + b.getAttribute('data-lw-step') + '"]');
      if (focus) focus.focus();
    });
  }

  /* Stepper: stage n draws everything up to n, the current stage in blue */
  function stepper(grid) {
    var drawEl = grid.querySelector('.lw-pdraw'), steps = all('.lw-psteps button', grid), items = all('.lw-slist li', grid);
    var compact = grid.classList.contains('lw-compact'), cur = -1;
    if (!drawEl) return;
    drawEl.classList.add('lw-arm');
    function set(n) {
      if (n === cur) return;
      cur = n;
      var nEl = grid.querySelector('[data-lw-stn]'), tEl = grid.querySelector('[data-lw-stt]'), h = items[n] && items[n].querySelector('h3');
      if (nEl) nEl.textContent = '0' + (n + 1);
      if (tEl && h) tEl.textContent = h.textContent;
      all('[data-lw-s]', drawEl).forEach(function (el) { var s = +el.getAttribute('data-lw-s'); el.classList.toggle('lw-on', s <= n); el.classList.toggle('lw-cur', s === n); });
      steps.forEach(function (b, i) { b.classList.toggle('lw-cur', i === n); b.classList.toggle('lw-done', i < n); if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      items.forEach(function (l, i) { l.classList.toggle('lw-cur', i === n); });
    }
    steps.forEach(function (b, i) {
      b.addEventListener('click', function () {
        if (compact || !items[i]) set(i);
        else items[i].scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'center' });
      });
    });
    if (compact) items.forEach(function (l, i) { l.addEventListener('click', function () { set(i); }); });
    else if (IO) {
      var ob = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) set(+e.target.getAttribute('data-lw-step')); }); }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (l) { ob.observe(l); });
    }
    once(drawEl, function () { if (cur < 0) { cur = -2; set(0); } }, 0.2);
  }

  /* Quotes: three templates, dots, arrows and an 8s advance */
  function quotes(el) {
    var tpl = all('template[data-lw-quote]', el), fig = el.querySelector('.lw-qfig'), dots = all('.lw-qdots button', el), q = 0, timer = 0;
    if (!tpl.length || !fig) return;
    function show(n) {
      q = (n + tpl.length) % tpl.length;
      fig.classList.remove('lw-swap'); void fig.offsetWidth;
      fig.innerHTML = ''; fig.appendChild(tpl[q].content.cloneNode(true)); fig.classList.add('lw-swap');
      var c = el.querySelector('[data-lw-qn]'); if (c) c.textContent = pad(q);
      dots.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === q)); });
      clearInterval(timer);
      if (!RM.matches) timer = setInterval(function () { if (document.contains(el)) show(q + 1); else clearInterval(timer); }, 8000);
    }
    dots.forEach(function (b, i) { b.addEventListener('click', function () { show(i); }); });
    all('[data-lw-step]', el).forEach(function (b) { b.addEventListener('click', function () { show(q + +b.getAttribute('data-lw-step')); }); });
    if (!RM.matches) timer = setInterval(function () { if (document.contains(el)) show(q + 1); else clearInterval(timer); }, 8000);
  }

  /* Counters: from 0 to data-lw-n over 1.4s, once in view */
  function counter(dd) {
    var n = +dd.getAttribute('data-lw-n');
    if (RM.matches || !IO) { dd.textContent = n; return; }
    dd.textContent = '0';
    once(dd, function () {
      var t0 = performance.now();
      (function f(t) { var k = Math.min(1, (t - t0) / 1400); dd.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); })(t0);
    }, 0.5);
  }

  /* Header: solid after 24px of scroll (unless in flow), the burger opens the sheet it controls */
  function sheetOf(btn) {
    var id = btn.getAttribute('aria-controls'), hdr = btn.closest('.lw-hdr');
    var next = hdr && hdr.nextElementSibling;
    return next && next.classList.contains('lw-mnav') ? next : (id && document.getElementById(id));
  }
  function setMenu(btn, open) {
    var hdr = btn.closest('.lw-hdr'), sheet = sheetOf(btn);
    hdr.classList.toggle('lw-menu-open', open);
    if (sheet) sheet.classList.toggle('lw-menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (!hdr.classList.contains('lw-flow')) document.body.style.overflow = open ? 'hidden' : '';
  }
  function onScroll() { all('.lw-hdr:not(.lw-flow)').forEach(function (h) { h.classList.toggle('lw-solid', scrollY > 24); }); }
  addEventListener('scroll', onScroll, { passive: true });

  function init(scope) {
    fresh(scope, '[data-lw-draw]', 'd').forEach(function (el) {
      if (RM.matches) return;
      el.classList.add('lw-arm');
      once(el, function () { requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('lw-on'); }); }); });
    });
    fresh(scope, '[data-lw-reveal]', 'r').forEach(function (el) {
      if (RM.matches) { el.classList.add('lw-in'); return; }
      el.classList.add('lw-arm');
      once(el, function () { el.classList.add('lw-in'); });
    });
    fresh(scope, 'svg[data-lw-lens]', 'l').forEach(lens);
    fresh(scope, '.lw-work-scope', 'k').forEach(skyline);
    fresh(scope, '.lw-panel', 'p').forEach(panel);
    fresh(scope, '.lw-pgrid', 'g').forEach(stepper);
    fresh(scope, '.lw-quotes', 'q').forEach(quotes);
    fresh(scope, '.lw-stats [data-lw-n]', 'n').forEach(counter);
  }
  window.lwRedraw = draw;

  document.addEventListener('input', function (e) {
    var rg = e.target;
    if (!rg.closest || !rg.closest('.lw-dart') || rg.type !== 'range') return;
    var dart = rg.closest('.lw-dart');
    dart.querySelector('.lw-ph').style.clipPath = 'inset(0 0 0 ' + rg.value + '%)';
    dart.querySelector('.lw-split').style.left = rg.value + '%';
  });
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.lw-form');
    if (!form) return;
    e.preventDefault();
    form.classList.add('lw-done');
    var sent = form.nextElementSibling;
    if (sent) { sent.setAttribute('role', 'status'); sent.setAttribute('tabindex', '-1'); sent.focus(); }
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.lw')) return;
    var burger = t.closest('.lw-burger');
    if (burger) { setMenu(burger, burger.getAttribute('aria-expanded') !== 'true'); return; }
    var ml = t.closest('.lw-mnav a');
    if (ml) {
      var sheet = ml.closest('.lw-mnav'), hdr = sheet.previousElementSibling, b = hdr && hdr.querySelector('.lw-burger');
      if (b) setMenu(b, false);
    }
    var enq = t.closest('[data-lw-enquire]');
    if (enq) {
      var open = document.querySelector('.lw-burger[aria-expanded="true"]');
      if (open) setMenu(open, false);
      var dlg = document.querySelector('dialog.lw-dlg');
      if (dlg && dlg.showModal) { var f0 = dlg.querySelector('.lw-form'); if (f0) f0.classList.remove('lw-done'); dlg.showModal(); return; }
      var field = document.querySelector('.lw-form:not(.lw-done) input');
      if (field) { field.scrollIntoView({ behavior: RM.matches ? 'auto' : 'smooth', block: 'center' }); field.focus({ preventScroll: true }); }
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    all('.lw-burger[aria-expanded="true"]').forEach(function (b) { setMenu(b, false); b.focus(); });
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
// Dressed in the system: dot-grid paper, the display type, and a sheet with the kit's elevation and a title block
const TOP_SVG = kitBuilding("hxt");
const HEROHTML = prefixMarkup(withArt(`
<header class="sp-top dots">
<div class="sp-bar"><p class="sp-label">InstaLanding design system</p><p class="sp-label">linework@${VERSION} · ${C.length} components</p></div>
<div class="sp-intro">
<div class="sp-copy">
<p class="eyebrow">( Design system )</p>
<h1 class="sp-title"><span>Linework,</span> drawn<br>line by line.</h1>
<p class="lead">Warm paper with a dot grid, a light grotesk display, mono drawing labels, ink buttons, and architectural line drawings that draw themselves stroke by stroke, with a blue blueprint lens and dimension callouts.</p>
<div class="sp-ctas"><a class="btn" href="#c-hero">See the components ${icon(ARROW)}</a><a class="link" href="#c-lines">Line weights ${icon("M12 5v14M19 12l-7 7-7-7")}</a></div>
</div>
<div class="sp-sheet"><div data-lw-draw>${art(TOP_SVG)}</div>
<dl class="stats"><div><dt>Components</dt><dd data-lw-n="${C.length}">${C.length}</dd></div><div><dt>Line weights</dt><dd data-lw-n="9">9</dd></div><div><dt>Typefaces</dt><dd data-lw-n="3">3</dd></div><div><dt>Accent</dt><dd data-lw-n="1">1</dd></div></dl></div>
</div>
</header>`));
const CHROME = `
body{margin:0;background:var(--lw-paper)}
.sp-top{padding:16px 20px 56px;border-bottom:var(--lw-hair) solid var(--lw-rule)}
.sp-bar,.sp-intro,.sp-main{max-width:var(--lw-wrap);margin:0 auto}
.sp-bar{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;padding:10px 0;border-bottom:var(--lw-hair) solid var(--lw-rule)}
.sp-label{margin:0;font:500 var(--lw-label)/1.4 var(--lw-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--lw-muted)}
.sp-intro{display:grid;gap:40px;padding-top:48px;align-items:center}
@media(min-width:1024px){.sp-intro{grid-template-columns:1fr 1fr;gap:64px}}
.sp-title{margin-top:20px;font:400 clamp(3rem,6.4vw,5.5rem)/.96 var(--lw-font-display);letter-spacing:-.035em}
.sp-title span{color:var(--lw-muted)}
.sp-copy .lw-lead{margin-top:24px;max-width:520px}
.sp-ctas{margin-top:32px;display:flex;flex-wrap:wrap;gap:12px 24px;align-items:center}
.sp-sheet{border:var(--lw-hair) solid var(--lw-rule);background:var(--lw-sheet);box-shadow:var(--lw-shadow-sheet)}
.sp-sheet>div:first-child{padding:24px 24px 8px}
.sp-sheet svg{display:block;width:100%;height:auto;max-height:420px;color:var(--lw-ink);overflow:visible}
.sp-sheet .lw-stats{margin-top:0;border-width:var(--lw-hair) 0 0}
.sp-sheet .lw-stats dd{font-size:40px}
.sp-main{padding:24px 20px 120px}
.sp-sec{padding:80px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:12px 0 0;font:400 clamp(30px,3.6vw,44px)/1.02 var(--lw-font-display);letter-spacing:-.03em}
.sp-note{margin:0;max-width:720px;font-size:15px;line-height:1.6;color:color-mix(in srgb,var(--lw-ink) 70%,transparent)}
.sp-demo{--sp-pad:clamp(16px,3vw,32px);position:relative;overflow:clip;padding:var(--sp-pad);background:var(--lw-paper);border:var(--lw-hair) solid var(--lw-rule)}
.sp-demo>.lw-hdr{margin:calc(-1 * var(--sp-pad)) calc(-1 * var(--sp-pad)) 0}
.sp-demo>.lw-mnav{margin:0 calc(-1 * var(--sp-pad)) calc(-1 * var(--sp-pad))}
.sp-demo>.lw-hero,.sp-demo>.lw-process,.sp-demo>.lw-studio,.sp-demo>.lw-quotes,.sp-demo>footer{margin:calc(-1 * var(--sp-pad))}
.sp-demo>.lw-hero{padding-top:56px}
.sp-demo>.lw-process .lw-head{padding-top:56px}
.sp-demo>.lw-studio,.sp-demo>.lw-quotes{padding:64px 0}
.sp-demo>footer .lw-fgrid{padding-top:64px}
.sp-demo>.lw-work-scope .lw-work-head{padding-left:0;padding-right:0}
.sp-demo>.lw-panel{margin-top:0}
@media(max-width:899px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const DEFS = `<svg id="lw-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"></svg>`;
const specimen = renderSpecimen({
  name: "Linework",
  slug: "linework",
  version: VERSION,
  prefix: "lw",
  rootClass: "lw",
  labelClass: "sp-label",
  script: "scripts/systems/linework.mjs",
  source: SOURCE,
  metaDescription: "The Linework design system: tokens and working components extracted from the Linework AI architect assistant page.",
  defsNote: "empty: every Linework drawing is self-contained SVG (its hatch patterns and render gradients sit in its own <defs>)",
  jsNote: "the draw-by-stroke reveal, the hero's blueprint lens, the skyline filter, the drawing/render reveal and compare slider, the stage stepper, the quote carousel, the counters, the header menu and the local-only form",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});
if (/base64|<canvas|<script src/.test(specimen)) throw new Error("the specimen carries inlined data, a canvas or an external script");

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "linework", prefix: "lw", rootClass: "lw", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "link", "circ", "chip", "card", "svc", "panel", "pv", "pinfo", "hero", "hero-art", "st", "so", "sx", "lbl", "bg", "eyebrow", "lead", "wrap", "dots", "process", "pgrid", "quotes", "qfig", "stats", "form", "dbox", "dart", "kit", "hdr", "mnav"] });
