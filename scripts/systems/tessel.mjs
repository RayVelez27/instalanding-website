// Extracts the Tessel design system from its landing page.
//
//   node scripts/systems/tessel.mjs
//
// Reads public/demos/tessel-ai-infrastructure.html (never edits it) and writes
// public/systems/tessel/ (specimen.html, tokens.css, tessel.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system drops
// the pinned-story machinery (sticky stage, scrim, chapter-card swaps, scroll
// hint), renames .chap to .ts-copy and .after to .ts-band, turns the fixed
// backdrop and isometric diamond grid into a .ts-surface class and scopes
// everything under .ts. The pictures are the page's own: its isometric toolkit
// and its pixel sprite are run here, at build time, so the hero stack, the
// server-grid scene, the block ramps and the guide ship as static SVG drawing
// from one shared <svg id="ts-defs">. The live widgets (sparkline, regions,
// eval bars), the chapter rail, the guide's walk cycle and the signup form run
// on one small script with data-ts-* hooks.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/tessel-ai-infrastructure.html";
const { page, el, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;450;500;600&display=swap" rel="stylesheet">';
const GRID = /\.gridlayer\{[^}]*?background-image:(url\("data:image\/svg\+xml,[^"]+"\))/.exec(page)?.[1];
if (!GRID) throw new Error("diamond grid not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. One declaration per line; the group
   comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Tessel · tessel@${VERSION}
   Extracted from https://instalanding.ai/demos/tessel-ai-infrastructure.html
   Fonts (Google Fonts): Inter Tight 400-600 (everything); code uses the platform monospace stack */
:root {
  /* Color · core */
  --ts-ink: #1F2348;
  --ts-bg: #DCE2F2;
  --ts-navy: #33376A;
  --ts-peri: #8A98DA;
  --ts-gold: #F0B856;
  --ts-ok: #3FA57A;

  /* Color · steps */
  --ts-ink2: #454B7C;
  --ts-muted: #6D75A6;
  --ts-navy2: #262A58;
  --ts-peri2: #B4BEE4;
  --ts-gold2: #D99A33;
  --ts-bg2: #C8D0EA;
  --ts-white: #F7F8FD;
  --ts-snow: #FFFFFF;
  --ts-hint: #9AA0C4;
  --ts-ink-muted: rgba(31,35,72,.42);
  --ts-card: rgba(250,251,255,.74);
  --ts-line: rgba(51,55,106,.12);

  /* Color · gold button */
  --ts-gold-hi: #F6C76E;
  --ts-gold-lo: #E9A944;
  --ts-gold-ink: #2A2440;

  /* Color · code */
  --ts-code-bg: #22264F;
  --ts-code-ink: #C9D0F2;
  --ts-code-key: #9FB0FF;
  --ts-code-str: #F4C979;
  --ts-code-dim: #6E77AE;
  --ts-code-ok: #7FDCB0;

  /* Color · night band */
  --ts-night: #1E2247;
  --ts-night-head: #F2F0ED;
  --ts-night-text: #DDE2F7;
  --ts-night-link: #C3C9EA;
  --ts-night-quiet: #8790C2;

  /* Type · families */
  --ts-font-sans: "Inter Tight", "Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --ts-font-code: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;

  /* Type · scale */
  --ts-closing: clamp(44px, 6.6vw, 104px);
  --ts-display: clamp(48px, 5.8vw, 86px);
  --ts-title: clamp(36px, 3.6vw, 54px);
  --ts-figure: 34px;
  --ts-stat: 24px;
  --ts-brand: 19px;
  --ts-lead: 16.5px;
  --ts-field: 14.5px;
  --ts-text: 14px;
  --ts-small: 13.5px;
  --ts-caption: 12.5px;
  --ts-micro: 12px;
  --ts-tiny: 11.5px;

  /* Shape · radii */
  --ts-r-pill: 999px;
  --ts-r-panel: 18px;
  --ts-r-card: 14px;
  --ts-r-code: 12px;

  /* Shape · borders */
  --ts-hairline: 1px;
  --ts-frost-edge: rgba(255,255,255,.95);

  /* Depth · backdrop, glass and shadow */
  --ts-sky: radial-gradient(1200px 700px at 75% 15%, rgba(255,255,255,.75), transparent 60%), radial-gradient(900px 600px at 10% 90%, rgba(176,188,232,.55), transparent 60%), linear-gradient(180deg, #E3E8F6 0%, #D3DAEF 55%, #C9D1EB 100%);
  --ts-grid: ${GRID};
  --ts-glass: blur(18px) saturate(140%);
  --ts-shadow-panel: 0 30px 60px -30px rgba(51,55,106,.35), 0 2px 0 rgba(255,255,255,.6) inset;
  --ts-shadow-float: 0 18px 40px -20px rgba(51,55,106,.45);
  --ts-shadow-pill: 0 8px 30px -12px rgba(51,55,106,.25);
  --ts-shadow-field: 0 20px 40px -24px rgba(51,55,106,.5);
  --ts-shadow-dark: 0 10px 24px -10px rgba(31,35,72,.6), inset 0 1px 0 rgba(255,255,255,.15);
  --ts-shadow-dark-hover: 0 16px 30px -12px rgba(31,35,72,.7), inset 0 1px 0 rgba(255,255,255,.15);
  --ts-shadow-gold: 0 10px 24px -10px rgba(217,154,51,.8), inset 0 1px 0 rgba(255,255,255,.5);

  /* Motion · easing */
  --ts-ease: cubic-bezier(.22,1,.36,1);

  /* Motion · durations */
  --ts-dur: .3s;
  --ts-dur-type: .5s;
  --ts-dur-bar: 1.2s;
  --ts-dur-live: 1.8s;

  /* Space · layout */
  --ts-gutter: clamp(20px, 4vw, 64px);
  --ts-band-x: clamp(20px, 5vw, 72px);
  --ts-tray: 460px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names
const VARS = { sans: "font-sans", mono: "font-sans", code: "font-code" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-z][\w-]*)/g, (m, n) => (n.startsWith("ts-") ? m : `--ts-${VARS[n] ?? n}`));
const HEX = {
  "#1F2348": "ink", "#DCE2F2": "bg", "#33376A": "navy", "#8A98DA": "peri", "#F0B856": "gold", "#3FA57A": "ok",
  "#454B7C": "ink2", "#6D75A6": "muted", "#262A58": "navy2", "#B4BEE4": "peri2", "#D99A33": "gold2", "#C8D0EA": "bg2",
  "#F7F8FD": "white", "#FFFFFF": "snow", "#9AA0C4": "hint",
  "#F6C76E": "gold-hi", "#E9A944": "gold-lo", "#2A2440": "gold-ink",
  "#22264F": "code-bg", "#C9D0F2": "code-ink", "#9FB0FF": "code-key", "#F4C979": "code-str", "#6E77AE": "code-dim", "#7FDCB0": "code-ok",
  "#1E2247": "night", "#F2F0ED": "night-head", "#DDE2F7": "night-text", "#C3C9EA": "night-link", "#8790C2": "night-quiet",
  "#fff": "snow",
};
const esc = (v) => v.replace(/[().,]/g, "\\$&");
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--ts-${tok})`];
const SWAPS = [
  fs_("clamp(44px,6.6vw,104px)", "closing"), fs_("clamp(48px,5.8vw,86px)", "display"), fs_("clamp(36px,3.6vw,54px)", "title"),
  fs_("34px", "figure"), fs_("24px", "stat"), fs_("19px", "brand"), fs_("16.5px", "lead"), fs_("14.5px", "field"), fs_("14px", "text"),
  fs_("13.5px", "small"), fs_("12.5px", "caption"), fs_("12px", "micro"), fs_("11.5px", "tiny"),
  [/border-radius:(999|99)px/g, "border-radius:var(--ts-r-pill)"],
  [/border-radius:18px/g, "border-radius:var(--ts-r-panel)"],
  [/border-radius:14px/g, "border-radius:var(--ts-r-card)"],
  [/border-radius:12px/g, "border-radius:var(--ts-r-code)"],
  [/border:1px solid/g, "border:var(--ts-hairline) solid"],
  [/rgba\(255,255,255,\.95\)/g, "var(--ts-frost-edge)"],
  [/box-shadow:0 30px 60px -30px rgba\(51,55,106,\.35\),0 2px 0 rgba\(255,255,255,\.6\) inset/g, "box-shadow:var(--ts-shadow-panel)"],
  [/box-shadow:0 18px 40px -20px rgba\(51,55,106,\.45\)/g, "box-shadow:var(--ts-shadow-float)"],
  [/box-shadow:0 8px 30px -12px rgba\(51,55,106,\.25\)/g, "box-shadow:var(--ts-shadow-pill)"],
  [/box-shadow:0 20px 40px -24px rgba\(51,55,106,\.5\)/g, "box-shadow:var(--ts-shadow-field)"],
  [/box-shadow:0 10px 24px -10px rgba\(31,35,72,\.6\), inset 0 1px 0 rgba\(255,255,255,\.15\)/g, "box-shadow:var(--ts-shadow-dark)"],
  [/box-shadow:0 16px 30px -12px rgba\(31,35,72,\.7\), inset 0 1px 0 rgba\(255,255,255,\.15\)/g, "box-shadow:var(--ts-shadow-dark-hover)"],
  [/box-shadow:0 10px 24px -10px rgba\(217,154,51,\.8\), inset 0 1px 0 rgba\(255,255,255,\.5\)/g, "box-shadow:var(--ts-shadow-gold)"],
  [/backdrop-filter:blur\(18px\) saturate\(140%\)/g, "backdrop-filter:var(--ts-glass)"],
  [/ \.3s/g, " var(--ts-dur)"],
  [/ 1\.2s/g, " var(--ts-dur-bar)"],
  [/ 1\.8s infinite/g, " var(--ts-dur-live) infinite"],
];

/* ── 3. Component CSS: the page's one <style>, minus the pinned story ── */
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
// Page-only parts: the document shell, the fixed backdrop layers (they become .ts-surface),
// the sticky stage and the SVG worlds, the scrim, the chapter-card swap, the scroll hint,
// the rows the page hides on short screens, and the line reveals keyed to an active chapter
const DROP = /^(:root|html)$|^\.(backdrop|gridlayer|grain|scrim|cards|hint|opt)\b|^#(story|world|far)\b|^\.stage\b|^\.chap(\.on|\s*>|$)|^\.term \.ln$/;
const RENAME = { chap: "copy", after: "band" };
function scopeSelector(sel) {
  if (sel === "*") return ":where(.ts, .ts *)";
  if (sel === "*::before" || sel === "*::after") return `:where(.ts, .ts *)${sel.slice(1)}`;
  if (sel === "body") return ".ts";
  return sel.replace(/#dude/g, ".dude").replace(/\.([a-z][\w-]*)/g, (m, c) => `.${RENAME[c] ?? c}`);
}
function keep(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      if (prelude.includes("max-height")) return "";
      const inner = keep(body);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return /@keyframes hint\b/.test(prelude) ? "" : rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map(scopeSelector);
    // The page scrolls a pinned stage; a component never clips its host's overflow
    const decl = prelude === "body" ? body.replace(/;overflow-x:hidden/, "") : body;
    return parts.length ? `${parts.join(",\n")} {${decl}}` : "";
  }).filter(Boolean).join("\n");
}
const base = renameVars(keep(pageCss.replace(/\/\*[\s\S]*?\*\//g, "")));

/* ── 4. The page's own drawing code, run at build time ───────────────── */
const SCRIPT = page.slice(page.indexOf("<script>", page.search(/<body[\s>]/)));
const between = (a, b) => {
  const i = SCRIPT.indexOf(a), j = SCRIPT.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error("script marker not found: " + a);
  return SCRIPT.slice(i, j);
};
const ISO = new Function(`${between("const C = 0.8660254", "/* ================= World layout")}
${between("const lg = (id", "let segD = [];")}
${between("const PX = 4;", "const sprG")}
return { P, f, pts, box, heroCore, sceneScale, NAVY, WHITE, PERI, GOLD, defs, PAL, SPR, sprite, setAcc: (v) => { ACC = v; }, gdefs: () => GDEFS };`)();

// Every id the drawings use lives in the shared defs, under ts-
const svgIds = (s) => s
  .replace(/ id="([^"]+)"/g, ' id="ts-$1"')
  .replace(/url\(#([^)]+)\)/g, "url(#ts-$1)")
  .replace(/href="#([^"]+)"/g, 'href="#ts-$1"');

// Hero: the page's floating stack (platform slab, navy deck with a gold flow ring, periwinkle cap, gold orb)
ISO.setAcc("#D6A64F");
const HERO_ART = `<svg class="iso hero-art" viewBox="-215 -345 430 640" role="img" aria-label="Isometric stack of three blocks under a glowing gold orb">${svgIds(ISO.heroCore())}</svg>`;
// Scene: the Scale server grid, with its orbit, region pills and floor label
ISO.setAcc("#B9B0E3");
const SCENE_ART = `<svg class="iso scene-art" viewBox="-365 -345 735 765" role="img" aria-label="Isometric server grid on a platform with an orbiting satellite and live region pills">${svgIds(ISO.sceneScale())}</svg>`;
// Ramps: one block per face ramp, so new blocks can be drawn in the same light
const RAMPS = [["navy", ISO.NAVY], ["white", ISO.WHITE], ["peri", ISO.PERI], ["gold", ISO.GOLD]];
const RAMP_ART = `<svg class="iso ramp-art" viewBox="-80 -86 560 150" role="img" aria-label="Four isometric blocks: navy, white, periwinkle and gold">${RAMPS.map(([name, c], i) =>
  `<g transform="translate(${i * 135},0)">${svgIds(ISO.box(-34, -34, 0, 68, 68, 44, c))}<text x="0" y="58" text-anchor="middle" font-size="12" font-weight="450" fill="#6D75A6">${name}</text></g>`).join("")}</svg>`;
// Every gradient the drawings generated, plus the page's filters and fills
const DEFS_SVG = svgIds(ISO.defs.replace("</defs>", ISO.gdefs() + "</defs>"));

// The guide: the page's 16 x 24 pixel sprite, its blink, its speech bubble and its walk frames
const frame = (k, shown = true) => `<g class="spr" data-k="${k}"${shown ? "" : ' style="display:none"'}>${ISO.sprite(ISO.SPR[k])}</g>`;
const LID = `<g class="lid"><rect x="5" y="6" width="1" height="2" fill="${ISO.PAL.s}"/><rect x="10" y="6" width="1" height="2" fill="${ISO.PAL.s}"/></g>`;
// The bubble's own pixel frame and text, without the group that fades it on scroll
const bubbleAt = SCRIPT.indexOf('<g id="bubble"');
const BUBBLE = SCRIPT.slice(SCRIPT.indexOf("<g shape-rendering", bubbleAt), SCRIPT.indexOf("</g>\n</g>`;", bubbleAt)).trim();
const GUIDE_ART = `<svg class="guide-art" viewBox="-96 -170 192 180" role="img" aria-label="Pixel-art guide under a speech bubble">
  <g class="dude"><ellipse cx="2" cy="1" rx="22" ry="7" fill="#1B1F45" opacity=".26" filter="url(#ts-fB4)"/>
  <g class="body"><g transform="translate(-32,-94) scale(4)" shape-rendering="crispEdges">${frame("down")}${LID}</g></g></g>
  <g class="bubble">${BUBBLE}</g>
</svg>`;
// Drawn at the page's scale (4 units a pixel), so the walk bob is one pixel
const WALK_ART = `<svg class="guide-walk dude walking" viewBox="-40 -104 80 112" role="img" aria-label="The guide walking" data-walk><g class="body"><g transform="translate(-32,-94) scale(4)" shape-rendering="crispEdges">${["s0", "s1", "s0", "s2"].map((k, i) => frame(k, i === 0)).join("")}</g></g></svg>`;
const FRAMES = ["down", "s0", "s1", "s2"].map((k) => `<figure class="guide-frame"><svg viewBox="-1 -1 18 26" aria-hidden="true" shape-rendering="crispEdges">${frame(k)}</svg><figcaption>${k}</figcaption></figure>`).join("");

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// The page's scroll hooks, ids and anchors belong to the page, not the system
const unhook = (html) => html
  .replace(/ data-(go|section|component|i)="[^"]*"/g, "")
  .replace(/ id="(?!ts-)[^"]*"/g, "")
  .replace(/ onsubmit="[^"]*"/g, "")
  .replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter((c) => c && c !== "opt").map((c) => RENAME[c] ?? c).join(" ")}"`);
// The inside of a chapter card
const chapter = (i) => {
  const html = el(`<article class="chap" data-i="${i}"`);
  return html.slice(html.indexOf(">") + 1, html.lastIndexOf("</article>")).trim();
};
const piece = (html, marker) => sliceEl(html, marker).html;

// Live data the page fills in from script, rendered here so every component is complete without it
const REGS = JSON.parse(/const regs = (\[\[[\s\S]*?\]\]);/.exec(SCRIPT)[1].replace(/'/g, '"'));
const REGIONS = REGS.map(([n, ms, load]) => `<div class="reg"><span class="led"></span><span>${n}</span><span class="load"><i style="width:${load}%"></i></span><span class="ms">${ms}ms</span></div>`).join("");
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const SERIES = Array.from({ length: 48 }, (_, i) => 92 + Math.sin(i / 4) * 2 + rnd() * 2.5);
function sparkInner(series) {
  const mn = 85, mx = 100, n = series.length;
  const xy = series.map((v, i) => [i / (n - 1) * 300, 60 - (v - mn) / (mx - mn) * 54]);
  const line = xy.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
  const last = xy[n - 1];
  return `<defs><linearGradient id="ts-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B856" stop-opacity=".35"/><stop offset="1" stop-color="#F0B856" stop-opacity="0"/></linearGradient></defs><path d="${line}L300,64L0,64Z" fill="url(#ts-sg)"/><path d="${line}" fill="none" stroke="#D99A33" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3" fill="#D99A33"/>`;
}

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });
const tray = (inner) => `<div class="surface tray">\n${inner}\n</div>`;

const nav = el('<header class="nav"');
add("nav", "Navigation", "The wordmark (an isometric cube in gold, navy and periwinkle) beside a frosted pill of links that turn white on hover, then a ghost Sign in and the dark Request access pill. Under 980px the link pill folds away; under 760px the ghost button goes too.",
  `<div class="surface">\n${nav}\n</div>`, { js: true });

const C0 = chapter(0), C6 = chapter(6), BAND = el('<section class="after"');
const dark = piece(C0, '<a href="#" class="btn btn-dark"'), line = piece(C0, '<a href="#" class="btn btn-line"');
const gold = piece(BAND, '<a href="#" class="btn btn-gold"'), ghost = piece(nav, '<a href="#" class="btn btn-ghost"');
const lineOnNight = piece(BAND, '<a href="#" class="btn btn-line">Read the docs');
add("buttons", "Buttons", "Every button is a pill in Inter Tight 500: dark (ink, lifted by a soft shadow, the default), gold (a vertical gold gradient with dark violet text, one per view), line (frosted white with a hairline) and ghost (text only). The arrow slides 3px on hover. On the night band the line button turns outline-white.",
  `<div class="surface" style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 36px var(--ts-gutter)">${dark}${gold}${line}${ghost}</div>
<div class="band" style="padding: 32px var(--ts-gutter); background: var(--ts-night)"><div class="row" style="margin-top: 0">${gold.replace("Start building free", "Get access")}${lineOnNight}</div></div>`);

add("hero", "Isometric hero", "A chapter card on the periwinkle sky: an eyebrow with a dark version pill and a hairline, a tight Inter Tight 500 headline whose last words fade to muted ink, a lead, a dark and a line button and a dotted meta line. Beside it the page's isometric stack, drawn by its own toolkit: a ghost slab far below, a platform deck, a navy deck with a gold flow ring, a periwinkle cap and a glowing gold orb with pulse rings. The blocks bob out of phase.",
  `<div class="surface hero">\n<div class="copy">\n${C0}\n</div>\n${HERO_ART}\n</div>`, { defs: true });

const C1 = chapter(1), C2 = chapter(2), C3 = chapter(3), C4 = chapter(4), C5 = chapter(5);
add("chips", "Eyebrows & chips", "Eyebrows number the chapters with a dark pill and a hairline; chips are frosted pills with a small gold diamond; meta lines separate facts with periwinkle dots. The legend pairs a periwinkle and a gold dash for before and after.",
  `<div class="surface" style="display: grid; gap: 22px; padding: 36px var(--ts-gutter)">
${piece(C1, '<div class="eyebrow">')}
${piece(C1, '<div class="chips')}
${piece(C0, '<div class="meta')}
${piece(C3, '<div class="legend">')}
</div>`);

add("blocks", "Isometric blocks", "Everything illustrated is generated isometric SVG: P(x, y, z) projects a point, box() draws a block with three lit faces (each a generated gradient), a white specular edge and a contact shadow, and plane matrices lay flat drawings onto floors and walls. The scene is the page's Scale platform: a server grid with blinking green LEDs and gold vents, flowing gold and periwinkle wiring on the deck, an orbiting satellite, live region pills and the floor label. Below, the four face ramps (navy, white, periwinkle, gold).",
  `<div class="surface blocks">\n${SCENE_ART}\n${RAMP_ART}\n</div>`, { defs: true });

add("guide", "Pixel guide", "A 16 x 24 pixel-art character drawn from strings (one letter per palette colour, crisp edges, 4px per pixel), who blinks, carries a pixel speech bubble and walks on four frames (s0, s1, s0, s2) with a one-step bob. It is the page's narrator: one per page, never decoration.",
  `<div class="surface guide">\n<div class="guide-stage">${GUIDE_ART}</div>\n<div class="guide-side"><div class="guide-loop">${WALK_ART}<span>walk cycle</span></div><div class="guide-frames">${FRAMES}</div></div>\n</div>`, { js: true, defs: true });

add("spec", "Spec panel", "A frosted card (74% white, 18px blur, a white inner top edge and a long navy shadow) whose header pairs a file name with a price, over a navy YAML block: keys in periwinkle, values in gold, comments dim. Lines slide in one after another.",
  tray(piece(C1, '<div class="panel">')));

add("terminal", "Terminal", "The same code surface as a deploy log: a gold prompt, green checks, dim detail and a white live endpoint, each line typed in on its own delay.",
  tray(piece(C4, '<div class="panel">')));

const util = piece(C2, '<div class="panel">')
  .replace('<span class="big" id="utilNum">', '<span class="big" data-util>')
  .replace(/<svg class="spark" id="spark"([^>]*)><\/svg>/, (_, a) => `<svg class="spark" data-spark${a} aria-hidden="true">${sparkInner(SERIES)}</svg>`);
add("utilisation", "Utilisation panel", "A live panel: the header's green dot pings, a big tabular figure, a gold sparkline with a soft gold area and a dot on the newest sample, then three frosted stat tiles. The series ticks every 0.9s while on screen.",
  tray(`${util}\n${piece(C2, '<div class="stats')}`), { js: true });

const evals = piece(C3, '<div class="panel">').replace(/<i class="([ab])" data-w="(\d+)"><\/i>/g, '<i class="$1" style="width:$2%"></i>');
add("evals", "Eval bars", "Paired bars on one track: the baseline in periwinkle on the top half, the candidate in a gold gradient on the bottom, the candidate's score on the right, a legend in the header and a green gate line. The bars grow in when they come on screen.",
  tray(evals), { js: true });

add("regions", "Region rows", "A live mesh panel: each row is a glowing green LED, the region, a periwinkle-to-navy load bar and a latency, jittering every 0.9s while on screen. The header reads all systems normal in green.",
  tray(piece(C5, '<div class="panel">').replace('<div class="regions" id="regions"></div>', `<div class="regions" data-regions>${REGIONS}</div>`)), { js: true });

add("rail", "Chapter rail", "A frosted pill of chapter buttons, each a faint number and a name; the current one is a dark pill, and a gold progress hairline runs along the bottom edge. Under 760px only the numbers show.",
  `<div class="surface" style="padding: 40px 16px">\n${el('<div class="rail"').replace(/<div class="prog"><i id="progbar"><\/i><\/div>/, '<div class="prog"><i style="width:0%"></i></div>').replace('<button data-go="0">', '<button data-go="0" class="on" aria-selected="true">')}\n</div>`, { js: true });

const C6meta = piece(C6, '<div class="meta">');
add("signup", "Signup", "A white pill field holding an email input and the gold Get access button, a hairline and a long soft shadow; a valid address swaps it for a green thank-you line. A line button and a quiet note sit below.",
  `<div class="surface tray">\n<div class="join">\n${piece(C6, '<form class="signup"').replace('<input type="email"', '<input type="email" name="email"')}\n${piece(C6, '<div class="thanks">')}\n${C6meta}\n</div>\n</div>`, { js: true });

add("closing", "Closing band & footer", "The page ends on navy: the sky fades into a night band, a huge headline with its last words at 45%, a gold and an outline button, then the wordmark, three link columns in quiet periwinkle and the legal line over a faint rule.",
  `<div class="surface">
${BAND}
</div>`);

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
// The .ts h1 ... .ts button rule gives headings, fields and buttons the system face even where a host styles them by tag
const EXTRA = `
.ts h1, .ts h2, .ts h3, .ts h4, .ts p, .ts input, .ts button { font-family: var(--ts-font-sans); }
.surface { position: relative; isolation: isolate; background: var(--ts-sky); color: var(--ts-ink); }
.surface::before { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; opacity: .55; background-image: var(--ts-grid); background-size: 120px 69.28px; -webkit-mask-image: radial-gradient(ellipse 80% 60% at 55% 55%, #000 25%, transparent 75%); mask-image: radial-gradient(ellipse 80% 60% at 55% 55%, #000 25%, transparent 75%); }
.nav { position: relative; }
.tray { display: grid; justify-items: center; gap: 0; padding: clamp(28px, 4vw, 56px) clamp(16px, 3vw, 40px); }
.tray > * { width: min(100%, var(--ts-tray)); }
.tray > .panel:last-child, .tray > .stats:last-child { margin-bottom: 0; }
.hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, .85fr); align-items: center; gap: 24px 40px; padding: clamp(40px, 6vw, 88px) var(--ts-gutter); overflow: clip; }
.hero .copy { max-width: 520px; }
.hero-art { display: block; width: 100%; max-width: 420px; height: auto; justify-self: center; overflow: visible; }
.iso text { font-family: var(--ts-font-sans); }
.code .ln { animation: typeIn var(--ts-dur-type) var(--ts-ease) both; }
.blocks { display: grid; justify-items: center; gap: 8px; padding: clamp(24px, 4vw, 48px) var(--ts-gutter); overflow: clip; }
.scene-art { display: block; width: 100%; max-width: 680px; height: auto; overflow: visible; }
.ramp-art { display: block; width: 100%; max-width: 520px; height: auto; overflow: visible; }
.guide { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 28px; padding: clamp(28px, 4vw, 56px) var(--ts-gutter); }
.guide-art { display: block; width: 100%; max-width: 300px; height: auto; margin: 0 auto; overflow: visible; }
.guide-art .bubble text { font-family: var(--ts-font-sans); }
.guide-side { display: grid; gap: 22px; justify-items: center; }
.guide-loop { display: grid; justify-items: center; gap: 10px; font-size: var(--ts-caption); color: var(--ts-ink-muted); }
.guide-walk { display: block; width: 72px; height: auto; overflow: visible; }
.guide-frames { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.guide-frame { display: grid; justify-items: center; gap: 6px; margin: 0; padding: 12px 14px 10px; border-radius: var(--ts-r-card); background: rgba(255,255,255,.55); border: var(--ts-hairline) solid var(--ts-frost-edge); font-size: var(--ts-tiny); color: var(--ts-muted); }
.guide-frame svg { display: block; width: 40px; height: auto; }
.rail { position: relative; left: auto; bottom: auto; transform: none; width: max-content; max-width: 100%; margin: 0 auto; }
.meta { flex-wrap: wrap; row-gap: 8px; }
.join { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; }
.join .meta { margin-top: 18px; }
@media (max-width: 760px) {
.hero, .guide { grid-template-columns: minmax(0, 1fr); }
.hero-art { max-width: 280px; }
.rail { max-width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
.code .ln { animation: none; }
}`;
const CLASSES = new Set();
const allCss = base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "ts" && !m[1].startsWith("ts-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("ts-")) CLASSES.add(n);
["on", "signed", "walking"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["ping", "typeIn", "spin", "bobs", "bob", "flow", "pulse", "glow", "blink", "type", "draw", "grow", "coin", "scan", "flick", "wave", "puff", "pxbob", "lid"];
const ATTRS = ["util", "spark", "regions", "walk"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "ts", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
// Custom properties are renamed only inside style="" (a deploy log's "--regions" is text, not a token)
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .ts itself, or :where(.ts) in front
const ROOTED = /(^|[\s,(>+~])\.ts(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.ts) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
// The page's flat sheet keeps its literal colours in its own .backdrop rules (dropped); the
// SVG worlds' font rule is replaced by .ts-iso text
const componentCss = rootEvery(prefixCss(tokenize(base + "\n" + EXTRA)))
  .replace(/\n{3,}/g, "\n\n").trim();

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Tessel components, no libraries. The rail and the signup answer clicks and
     submits; the sparkline, the region rows, the eval bars and the guide's walk
     run only while on screen, and not at all with prefers-reduced-motion
     (every component is complete without them). */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(scope, sel, fn) { [].forEach.call(scope.querySelectorAll(sel), fn); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function seen(el, fn) {
    if (!window.IntersectionObserver) { fn(true); return; }
    new IntersectionObserver(function (es) { fn(es[es.length - 1].isIntersecting); }).observe(el);
  }
  function loop(el, ms, fn) {
    var timer = 0;
    seen(el, function (on) { clearInterval(timer); if (on) timer = setInterval(fn, ms); });
  }

  /* Utilisation: the series drifts between 90 and 99.4%, the figure follows the newest sample */
  function spark(svg) {
    var panel = svg.closest('.ts-panel'), num = panel && panel.querySelector('[data-ts-util]');
    var series = [];
    for (var i = 0; i < 48; i++) series.push(92 + Math.sin(i / 4) * 2 + Math.random() * 2.5);
    function draw() {
      var mn = 85, mx = 100, n = series.length, d = '';
      series.forEach(function (v, k) { d += (k ? 'L' : 'M') + (k / (n - 1) * 300).toFixed(1) + ',' + (60 - (v - mn) / (mx - mn) * 54).toFixed(1); });
      var y = (60 - (series[n - 1] - mn) / (mx - mn) * 54).toFixed(1);
      svg.innerHTML = '<defs><linearGradient id="ts-sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B856" stop-opacity=".35"/><stop offset="1" stop-color="#F0B856" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="' + d + 'L300,64L0,64Z" fill="url(#ts-sg)"/><path d="' + d + '" fill="none" stroke="#D99A33" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
        '<circle cx="300" cy="' + y + '" r="3" fill="#D99A33"/>';
      if (num) num.textContent = series[n - 1].toFixed(1) + '%';
    }
    draw();
    loop(svg, 900, function () { series.push(clamp(series[series.length - 1] + (Math.random() - .45) * 2.2, 90, 99.4)); series.shift(); draw(); });
  }

  /* Regions: latency and load jitter inside their ranges */
  function regions(list) {
    loop(list, 900, function () {
      each(list, '.ts-reg', function (row) {
        var ms = row.querySelector('.ts-ms'), bar = row.querySelector('.ts-load i');
        if (ms) ms.textContent = clamp(parseInt(ms.textContent, 10) + Math.round((Math.random() - .5) * 4), 18, 70) + 'ms';
        if (bar) bar.style.width = clamp(parseFloat(bar.style.width) + (Math.random() - .5) * 10, 20, 92).toFixed(1) + '%';
      });
    });
  }

  /* Evals: the bars grow from zero the first time they come on screen */
  function evals(list) {
    var bars = [].slice.call(list.querySelectorAll('.ts-t i')), done = false;
    var widths = bars.map(function (b) { return b.style.width; });
    bars.forEach(function (b) { b.style.width = '0'; });
    seen(list, function (on) {
      if (!on || done) return;
      done = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { bars.forEach(function (b, k) { b.style.width = widths[k]; }); }); });
    });
  }

  /* Guide: four walk frames, one every 140ms */
  function walk(svg) {
    var frames = svg.querySelectorAll('.ts-spr'), n = 0;
    loop(svg, 140, function () {
      n = (n + 1) % frames.length;
      [].forEach.call(frames, function (g, k) { g.style.display = k === n ? '' : 'none'; });
    });
  }

  function init(scope) {
    if (reduce) return;
    each(scope, '[data-ts-spark]', function (el) { if (el._ts) return; el._ts = true; spark(el); });
    each(scope, '[data-ts-regions]', function (el) { if (el._ts) return; el._ts = true; regions(el); });
    each(scope, '.ts-bars', function (el) { if (el._ts) return; el._ts = true; evals(el); });
    each(scope, '[data-ts-walk]', function (el) { if (el._ts) return; el._ts = true; walk(el); });
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

  /* Rail: a chapter button becomes the dark pill and moves the gold progress line */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.ts')) return;
    var btn = t.closest('.ts-rail button');
    if (btn) {
      var rail = btn.closest('.ts-rail'), btns = [].slice.call(rail.querySelectorAll('button')), i = btns.indexOf(btn);
      btns.forEach(function (b, k) { b.classList.toggle('ts-on', k === i); b.setAttribute('aria-selected', String(k === i)); });
      var bar = rail.querySelector('.ts-prog i');
      if (bar) bar.style.width = (i / Math.max(1, btns.length - 1) * 100).toFixed(1) + '%';
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* Signup: a valid email swaps the field for the thank-you line */
  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('.ts-signup');
    if (!form) return;
    e.preventDefault();
    var input = form.querySelector('input');
    if (input && input.checkValidity()) {
      var wrap = form.closest('.ts-join') || form.parentNode;
      wrap.classList.add('ts-signed');
    } else if (input && input.reportValidity) input.reportValidity();
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
const brand = prefixMarkup(unhook(piece(nav, '<a href="#" class="brand"')));
const CHROME = `
body{margin:0;background:var(--ts-bg)}
.sp-top{padding:22px var(--ts-gutter) 64px;color:var(--ts-ink)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;padding-bottom:16px;border-bottom:1px solid var(--ts-line)}
.sp-meta>span{font-size:var(--ts-caption);color:var(--ts-muted)}
.sp-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:32px 48px;align-items:end;margin-top:clamp(40px,7vw,96px)}
.sp-hero h1{margin:0;font-size:clamp(46px,7.4vw,112px);font-weight:500;line-height:.88;letter-spacing:-.05em;padding-bottom:.04em}
.sp-hero h1 em{font-style:normal;color:var(--ts-ink-muted)}
.sp-hero p{margin:0;max-width:46ch;font-size:var(--ts-lead);line-height:1.5;color:var(--ts-ink2)}
.sp-swatches{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:24px}
.sp-swatches i{display:block;height:52px;border-radius:var(--ts-r-card);box-shadow:inset 0 0 0 1px var(--ts-line)}
.sp-main{padding:0 var(--ts-gutter) 120px}
.sp-sec{padding:64px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font-size:clamp(26px,2.6vw,38px);font-weight:500;line-height:1;letter-spacing:-.045em;color:var(--ts-ink)}
.sp-label{display:inline-flex;align-items:center;gap:10px;margin:0;font-size:var(--ts-caption);color:var(--ts-ink-muted)}
.sp-label::before{content:"";width:6px;height:6px;border-radius:2px;background:var(--ts-gold);transform:rotate(45deg)}
.sp-note{margin:0;max-width:660px;font-size:15px;line-height:1.55;color:var(--ts-ink2)}
.sp-demo{position:relative;border-radius:var(--ts-r-panel);overflow:clip;box-shadow:0 0 0 1px var(--ts-frost-edge),var(--ts-shadow-panel)}
@media (max-width:900px){.sp-hero,.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HERO = `
<header class="sp-top ts-surface">
<div class="sp-meta">${brand}<span>Design system · tessel@${VERSION} · ${C.length} components</span></div>
<div class="sp-hero">
<h1>From blueprint to <em>building blocks.</em></h1>
<div>
<p>A soft, precise AI-infrastructure language: a periwinkle sky over an isometric diamond grid, navy ink in three steps, one gold accent, green kept for live states, frosted white cards, pill buttons and generated isometric blocks lit on every face. Extracted from the Tessel AI Infrastructure page.</p>
<div class="sp-swatches" aria-label="Core colours">
<i title="--ts-ink" style="background:var(--ts-ink)"></i><i title="--ts-bg" style="background:var(--ts-bg)"></i><i title="--ts-peri" style="background:var(--ts-peri)"></i><i title="--ts-gold" style="background:var(--ts-gold)"></i><i title="--ts-ok" style="background:var(--ts-ok)"></i>
</div>
</div>
</div>
</header>`;
const DEFS = `<svg id="ts-defs" width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">${DEFS_SVG}</svg>`;
const specimen = renderSpecimen({
  name: "Tessel",
  slug: "tessel",
  version: VERSION,
  prefix: "ts",
  rootClass: "ts",
  labelClass: "sp-label",
  script: "scripts/systems/tessel.mjs",
  source: SOURCE,
  metaDescription: "The Tessel design system: tokens and working components extracted from the Tessel AI Infrastructure page.",
  defsNote: "the filters and lit-face gradients the isometric drawings and the guide use (ids under ts-)",
  jsNote: "the live sparkline, region rows and eval bars, the guide's walk cycle, the chapter rail and the signup form",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HERO,
  components: C,
  js: JS,
});

/* ── 9. Write ────────────────────────────────────────────────────────── */
writeSystem({ slug: "tessel", prefix: "ts", rootClass: "ts", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-dark", "panel", "panel-h", "code", "chip", "eyebrow", "stat", "bar", "reg", "rail", "signup", "band", "foot", "copy", "surface"] });
