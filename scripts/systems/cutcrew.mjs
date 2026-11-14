// Extracts the Cutcrew design system from its landing page.
//
//   node scripts/systems/cutcrew.mjs
//
// Reads public/demos/cutcrew-ai-video-agents.html (never edits it) and writes
// public/systems/cutcrew/ (specimen.html, tokens.css, cutcrew.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell (html, the bare section padding, the
// load-in .reveal and the gallery's #album id).
// Almost every picture and list on the page is written by its script at boot:
// ART draws the five robot mascots and the abstract covers as SVG strings, and
// small data arrays build the hero fan, the timeline tiles, the services index,
// the gantt, the projects, the team deck, the plans and the FAQ. That script is
// run here at build time, against a stand-in for the DOM that only records
// what each container's innerHTML was set to, so the specimen carries the
// page's own markup. The mascots become five <symbol>s in #cc-defs (each one is
// ~6KB of SVG and appears up to four times per component); everything else the
// page painted stays inline. What the script does on input stays in the
// component script: the create-mode accordion with its self-typing prompt, the
// gantt reveal, the team deck, the pricing toggle, the FAQ and the CTA ring.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/cutcrew-ai-video-agents.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
// Switzer is on Fontshare, not Google Fonts: the page links both, and so does the specimen
const FONTS = [/<link href="https:\/\/api\.fontshare\.com[^>]*>/, /<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/]
  .map((re) => (re.exec(page) || [""])[0]).join("\n");
if (!FONTS.includes("fontshare") || !FONTS.includes("Geist")) throw new Error("font links not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. The page's short
   custom-property names (--g1, --d0, --t60, --acc ...) keep their names under
   cc-, so the CSS reads the same as the page's. Group comments are what the
   SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Cutcrew · cutcrew@${VERSION}
   Extracted from https://instalanding.ai/demos/cutcrew-ai-video-agents.html
   Fonts: Switzer 400-700 (Fontshare: https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap; falls back to Inter),
          Inter 400-600 and Geist Mono 400/500 (Google Fonts) */
/* Switzer isn't on Google Fonts, so a system entry's fontsHref can't carry it;
   importing it here means anything that links cutcrew.css (the SYSTEMS dialog
   included) gets the real face instead of the Inter fallback. */
@import url("https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap");
:root {
  /* Color · core */
  --cc-acc: #2BEE19;
  --cc-d0: #0F0F0F;
  --cc-bg: #FAFAFA;
  --cc-white: #FFFFFF;
  --cc-g1: #EDEDED;
  --cc-g2: #E3E3E3;

  /* Color · accent */
  --cc-acc2: #24D613;
  --cc-accl: #BFFABA;
  --cc-accxl: #E2FDDF;

  /* Color · dark surfaces */
  --cc-d1: #1E1E1E;
  --cc-d2: #2E2E2E;

  /* Color · text */
  --cc-t: #0F0F0F;
  --cc-t60: rgba(15, 15, 15, 0.6);
  --cc-t35: rgba(15, 15, 15, 0.35);
  --cc-w: #FAFAFA;
  --cc-w60: rgba(250, 250, 250, 0.6);

  /* Color · lines */
  --cc-line: rgba(15, 15, 15, 0.1);
  --cc-line2: rgba(15, 15, 15, 0.2);
  --cc-wline: rgba(250, 250, 250, 0.12);

  /* Color · candy tints */
  --cc-tint-purple: #D6C1FF;
  --cc-tint-orange: #FFD2A8;
  --cc-tint-blue: #BFE3FF;
  --cc-tint-amber: #FFE2A3;
  --cc-tint-pink: #FFC1DE;
  --cc-sky: #5BB8FD;
  --cc-violet: #9757F0;

  /* Type · families */
  --cc-font-sans: "Switzer", "Inter", system-ui, sans-serif;
  --cc-font-mono: "Geist Mono", ui-monospace, monospace;

  /* Type · scale */
  --cc-h1: 104px;
  --cc-h2: 60px;
  --cc-h3: 44px;
  --cc-h4: 32px;
  --cc-h5: 24px;
  --cc-h6: 20px;
  --cc-lead: 20px;
  --cc-p: 16px;
  --cc-ps: 14px;
  --cc-xs: 13px;
  --cc-cap: 11px;

  /* Shape · radii */
  --cc-radius-tray: 32px;
  --cc-radius-tile: 28px;
  --cc-radius-card: 24px;
  --cc-radius-inner: 16px;
  --cc-radius-sm: 12px;
  --cc-radius-btn: 10px;
  --cc-radius-xs: 8px;
  --cc-radius-pill: 999px;

  /* Shape · borders */
  --cc-hairline: 1px;
  --cc-frame: 4px;

  /* Depth · soft shadows */
  --cc-shadow-chip: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 12px 24px -8px rgba(15, 15, 15, 0.35);
  --cc-shadow-card: 0 30px 60px -30px rgba(15, 15, 15, 0.45);
  --cc-shadow-deck: 0 24px 48px -20px rgba(15, 15, 15, 0.35);
  --cc-shadow-tip: 0 16px 32px -12px rgba(15, 15, 15, 0.45);
  --cc-shadow-panel: 0 40px 80px -32px rgba(15, 15, 15, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --cc-shadow-dark: 0 24px 48px -16px rgba(0, 0, 0, 0.6);
  --cc-glow: 0 0 0 2px rgba(43, 238, 25, 0.35), 0 10px 24px -10px rgba(43, 238, 25, 0.7);

  /* Motion · easing */
  --cc-ease-swift: cubic-bezier(0.3, 0.8, 0.2, 1);
  --cc-ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);
  --cc-ease-slide: cubic-bezier(0.2, 0.8, 0.2, 1);
  --cc-ease-spring: cubic-bezier(0.3, 1.3, 0.5, 1);
  --cc-ease-rise: cubic-bezier(0.2, 1.2, 0.4, 1);
  --cc-ease-pop: cubic-bezier(0.3, 1.6, 0.5, 1);
  --cc-ease-sweep: cubic-bezier(0.5, 0, 0.5, 1);

  /* Motion · durations */
  --cc-dur-quick: 0.2s;
  --cc-dur-hover: 0.3s;
  --cc-dur-slide: 0.5s;
  --cc-dur-open: 0.6s;
  --cc-dur-deck: 0.7s;
  --cc-dur-clip: 0.8s;
  --cc-dur-word: 0.9s;
  --cc-dur-rise: 1.1s;
  --cc-dur-float: 5s;
  --cc-dur-playhead: 7s;
  --cc-dur-marquee: 40s;
  --cc-dur-ring: 60s;

  /* Space · layout */
  --cc-wrap: 1136px;
  --cc-tray-pad: 8px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties move under cc- (--font -> --cc-font-sans, --mono -> --cc-font-mono);
// its local ones (--r on the statement slots, --s on the gallery floats) move too
const VARS = { font: "font-sans", mono: "font-mono" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("cc-") ? m : `--cc-${VARS[n] ?? n}`));
// Six-digit keys first: "#fff" must not eat the start of "#ffffff" (the normaliser also refuses a following hex digit)
const HEX = {
  "#ffffff": "white", "#fafafa": "w", "#0f0f0f": "d0", "#1e1e1e": "d1", "#2e2e2e": "d2", "#ededed": "g1", "#e3e3e3": "g2",
  "#2bee19": "acc", "#24d613": "acc2", "#bffaba": "accl", "#e2fddf": "accxl",
  "#d6c1ff": "tint-purple", "#ffd2a8": "tint-orange", "#bfe3ff": "tint-blue", "#ffe2a3": "tint-amber", "#ffc1de": "tint-pink",
  "#5bb8fd": "sky", "#9757f0": "violet", "#fff": "white",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--cc-${tok})`];
// The type classes' base sizes (the first rule for each; the breakpoints keep their literal steps)
const size = (sel, px, tok) => [new RegExp(`(${esc(sel)}\\{font-size:)${px}px`), `$1var(--cc-${tok})`];
const SWAPS = [
  size("h1,.h1", 104, "h1"), size(".h2", 60, "h2"), size(".h3", 44, "h3"), size(".h4", 32, "h4"), size(".h5", 24, "h5"),
  size(".h6", 20, "h6"), size(".lead", 20, "lead"), size(".p", 16, "p"), size(".ps", 14, "ps"), size(".xs", 13, "xs"), size(".cap", 11, "cap"),
  // Shadows before radii and colours: they are matched as written on the page
  val("inset 0 1px 0 rgba(255,255,255,.45),0 12px 24px -8px rgba(15,15,15,.35)", "shadow-chip"),
  val("0 40px 80px -32px rgba(15,15,15,.45),inset 0 1px 0 rgba(255,255,255,.08)", "shadow-panel"),
  val("0 0 0 2px rgba(43,238,25,.35),0 10px 24px -10px rgba(43,238,25,.7)", "glow"),
  val("0 30px 60px -30px rgba(15,15,15,.45)", "shadow-card"),
  val("0 24px 48px -20px rgba(15,15,15,.35)", "shadow-deck"),
  val("0 16px 32px -12px rgba(15,15,15,.45)", "shadow-tip"),
  val("0 24px 48px -16px rgba(0,0,0,.6)", "shadow-dark"),
  // Trays: a grey box with an 8px inner pad, holding the 24px white cards
  [/border-radius:32px;padding:8px/g, "border-radius:var(--cc-radius-tray);padding:var(--cc-tray-pad)"],
  [/padding:8px;border-radius:32px/g, "padding:var(--cc-tray-pad);border-radius:var(--cc-radius-tray)"],
  ...[[32, "tray"], [28, "tile"], [24, "card"], [16, "inner"], [12, "sm"], [10, "btn"], [8, "xs"], [999, "pill"]]
    .map(([px, t]) => [new RegExp(`border-radius:${px}px(?=[;}])`, "g"), `border-radius:var(--cc-radius-${t})`]),
  [/border:4px solid/g, "border:var(--cc-frame) solid"],
  [/(border(?:-top|-bottom)?:)1px solid/g, "$1var(--cc-hairline) solid"],
  [/max-width:1136px/g, "max-width:var(--cc-wrap)"],
  // Motion: the page's timings, in the pairs it writes them
  [/transition:transform \.2s,box-shadow \.3s/, "transition:transform var(--cc-dur-quick),box-shadow var(--cc-dur-hover)"],
  [/\.5s cubic-bezier\(\.3,\.8,\.2,1\)/g, "var(--cc-dur-slide) var(--cc-ease-swift)"],
  [/\.6s cubic-bezier\(\.3,\.8,\.2,1\)/g, "var(--cc-dur-open) var(--cc-ease-swift)"],
  [/\.7s cubic-bezier\(\.3,\.8,\.2,1\)/g, "var(--cc-dur-deck) var(--cc-ease-swift)"],
  [/cubic-bezier\(\.3,\.8,\.2,1\)/g, "var(--cc-ease-swift)"],
  [/\.5s cubic-bezier\(\.3,1\.3,\.5,1\)/g, "var(--cc-dur-slide) var(--cc-ease-spring)"],
  [/1\.1s cubic-bezier\(\.2,1\.2,\.4,1\)/g, "var(--cc-dur-rise) var(--cc-ease-rise)"],
  [/cubic-bezier\(\.3,1\.6,\.5,1\)/g, "var(--cc-ease-pop)"],
  [/\.9s cubic-bezier\(\.2,\.7,\.2,1\)/g, "var(--cc-dur-word) var(--cc-ease-out)"],
  [/cubic-bezier\(\.2,\.7,\.2,1\)/g, "var(--cc-ease-out)"],
  [/\.8s cubic-bezier\(\.2,\.8,\.2,1\)/g, "var(--cc-dur-clip) var(--cc-ease-slide)"],
  [/ 7s cubic-bezier\(\.5,0,\.5,1\)/g, " var(--cc-dur-playhead) var(--cc-ease-sweep)"],
  [/ 60s linear/g, " var(--cc-dur-ring) linear"],
  [/ 40s linear/g, " var(--cc-dur-marquee) linear"],
  [/ 5s ease-in-out/g, " var(--cc-dur-float) ease-in-out"],
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
// Page-only: the document shell, the page's section padding (a bare `section` rule would pad any
// host section inside the root), the load-in reveal and the gallery's id hook. :root becomes the tokens.
const DROP = /^(html|section|:root|\.reveal|\.reveal\.in|#album)$/;
function scopeSelector(sel) {
  if (sel === "*") return ":where(.cc, .cc *)";
  if (sel === "body") return ".cc";
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
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // Page-level scrolling belongs to the host page, not to the root
  .replace("-webkit-font-smoothing:antialiased;overflow-x:hidden}", "-webkit-font-smoothing:antialiased}");
const base = renameVars(keep(pageRules));

/* ── 4. The page's script, run at build time ─────────────────────────── */
// Everything from the palettes to the CTA ring, up to (not including) the line that paints the
// art into the DOM. $ hands back a recorder per selector; $$ finds nothing, so the hover, menu and
// paint loops are no-ops; setTimeout never fires, so the gallery's album() stays unbuilt.
const RUN_AT = page.indexOf("const PAL=[");
const RUN_END = page.indexOf("/* paint all art */");
if (RUN_AT < 0 || RUN_END < 0) throw new Error("page script markers not found");
const store = {};
const recorder = (sel) => (store[sel] ??= new Proxy({ innerHTML: "", textContent: "", style: {}, dataset: {} }, {
  get: (t, k) => (k in t ? t[k] : () => {}),
  set: (t, k, v) => { t[k] = v; return true; },
}));
const LOGO = /<a href="#top" class="logo"[^>]*>([\s\S]*?)<\/a>/.exec(page)[1];
recorder(".nav .logo").innerHTML = LOGO;
const lib = new Function("$", "$$", "setTimeout", "clearTimeout", "innerWidth",
  `let uid=0;const RM=false;\n${page.slice(RUN_AT, RUN_END)}\nreturn { ART, IC, ico, CHK, PL, TM };`)(
  (s) => recorder(s), () => [], () => 0, () => {}, 1440);

// Projects: three of the six are enough to show the deck
store["#pgrid"].innerHTML = store["#pgrid"].innerHTML.split(/(?=<a href="#contact" class="proj)/).slice(0, 3).join("");
// Plans: each one carries its monthly price, so the toggle can re-price it without the page's table
let planN = 0;
store["#plans"].innerHTML = store["#plans"].innerHTML.replace(/<div class="plan( hl)?">/g, (m) => m.replace(">", ` data-price="${lib.PL[planN++][1]}">`));
// Team: the deck as the page's team(0) leaves it, written in (the script keeps dealing from there)
let tcard = 0;
store["#tdeck"].innerHTML = store["#tdeck"].innerHTML.replace(/<div class="tcard">/g, () => {
  const o = tcard++, n = lib.TM.length;
  const tf = o === n - 1 ? "translateX(-120%) rotate(-12deg)" : o === 0 ? "none" : `translateY(${-o * 18}px) scale(${+(1 - o * 0.06).toFixed(2)})`;
  return `<div class="tcard" style="z-index:${10 - o};opacity:${o > 2 || o === n - 1 ? 0 : 1};transform:${tf}">`;
});
store["#members"].innerHTML = store["#members"].innerHTML.replace('class="mrow" data-k="0" aria-pressed="false"', 'class="mrow on" data-k="0" aria-pressed="true"');

// Each recorded container's markup, written into the page where the script would have put it
let H = page.slice(BODY);
for (const [sel, o] of Object.entries(store)) {
  if (sel[0] !== "#" || !o.innerHTML) continue;
  const re = new RegExp(`(<(\\w+)[^>]* id="${sel.slice(1)}"[^>]*>)(</\\2>)`);
  if (!re.test(H)) throw new Error("container not found: " + sel);
  H = H.replace(re, (_, open, tag, close) => open + o.innerHTML + close);
}
H = H.replace('<div class="ring" id="ring">', `<div class="ring" id="ring" style="top:${store["#ring"].style.top}">`);
// The Describe prompt types itself in; without the script it shows the whole brief
const TXT = /TXT='([^']+)'/.exec(page)[1];
H = H.replace('<div class="in" id="typed"></div>', `<div class="in" id="typed">${TXT}</div>`);

/* What the page does to [data-ic], [data-chk] and [data-art] at boot */
const svgIds = (s) => s.replace(/id="([a-z])(\d+)"/g, 'id="cc-$1$2"').replace(/url\(#([a-z])(\d+)\)/g, "url(#cc-$1$2)");
const agentUse = (k) => `<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><use href="#cc-agent-${k}"></use></svg>`;
H = H
  .replace(/(<(\w+)[^>]*?) data-ic="(\w+)"([^>]*>)/g, (_, a, tag, ic, b) => `${a}${b}<span class="chip">${lib.ico(lib.IC[ic] || lib.IC.spark, "")}</span>`)
  .replace(/(<i) data-chk(><\/i>)/g, (_, a, b) => a + b.replace("><", `>${lib.ico(lib.CHK)}<`))
  .replace(/<(\w+)([^>]*?) data-art="(\w+)"([^>]*)>/g, (_, tag, a, art, b) => {
    const attrs = a + b;
    const p = /data-p="(\d+)"/.exec(attrs)?.[1];
    const k = /data-a="(\d+)"/.exec(attrs)?.[1] ?? "0";
    const svg = art === "agent" ? agentUse(k) : svgIds(lib.ART[art](p == null ? undefined : +p, { dataset: { a: k } }));
    return `<${tag}${attrs.replace(/ data-[pa]="\d+"/g, "")}><div class="art" aria-hidden="true">${svg}</div>`;
  });

// The five mascots, once each, as symbols the components <use>
const DEFS = `<svg id="cc-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
${[0, 1, 2, 3, 4].map((k) => {
  const s = lib.ART.agent(undefined, { dataset: { a: k } });
  return `<symbol id="cc-agent-${k}" viewBox="0 0 200 200">${s.slice(s.indexOf("</defs>") + 7, s.lastIndexOf("</svg>")).trim()}</symbol>`;
}).join("\n")}
</defs></svg>`;

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// Section anchors become "#"; the script's id hooks become classes or data attributes; the load-in reveal stays with the page
const unhook = (html) => html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ id="tprev"/, ' data-step="-1"').replace(/ id="tnext"/, ' data-step="1"')
  .replace(/ id="[^"]*"/g, "")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/ href="#[a-z]+"/g, ' href="#"')
  .replace(/<div class="way( on)?" data-i="(\d)"/g, (m, on) => `${m} tabindex="0" aria-expanded="${!!on}"`)
  .replace(/ class="([^"]*)"/g, (_, l) => ` class="${l.split(/\s+/).filter((c) => c && c !== "reveal").join(" ")}"`)
  .replace(/\n {2,}/g, "\n");
const piece = (marker, from = 0) => sliceEl(H, marker, from).html;
const inSection = (name, marker) => piece(marker, H.indexOf(`data-section="${name}"`));
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

add("buttons", "Buttons & chips", "Buttons are 10px-radius blocks, not pills: dark (the default action), grey (secondary), white and electric green (on dark or colour), and a small dark one for the nav. Every button lifts 1px on hover and picks up a green glow (--cc-glow). Chips: the dark eyebrow square with a white line icon and a moulded --cc-shadow-chip, and the pale-green status pill with a green dot.",
  `<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center">
${piece('<a href="#contact" class="btn btn-dark">Book')}
${piece('<a href="#team" class="btn btn-gray">')}
${piece('<a href="#contact" class="btn btn-dark btn-sm"').replace(' style="margin-top:6px"', "")}
</div>
<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;margin-top:24px">
${inSection("numbers", '<span class="eyebrow"')}
${piece('<span class="pchip"><i></i>Most popular</span>')}
</div>
<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:24px;padding:24px;border-radius:24px;background:var(--d0)">
${piece('<a href="#contact" class="btn btn-acc">Try')}
${piece('<a href="#pricing" class="btn btn-white"')}
${piece('<a href="#contact" class="btn btn-acc">Scope')}
</div>`, { js: true });

add("type", "Type & statement", "Switzer at weight 400, set large and tight (h1 104px down to h6 20px, -.03em to -.01em tracking), with grey copy at 60% ink. A section head is an eyebrow chip over an h3 beside a short paragraph and a grey button. The statement line sets 60px words with the mascots dropped in as tilted 58px slots, the tail fading to 35% ink.",
  `${inSection("numbers", '<div class="head-row reveal">')}
${piece('<div class="statement reveal"')}`, { defs: true });

add("hero", "Hero agent fan", "Two lines of h1 words that blur in one by one, a dark rotated icon chip that pops in on the second line, and a fan of the five mascot cards rising from below: each card tilts by its place in the fan (-14 to 14 degrees), drops by its distance from the middle and straightens and lifts on hover.",
  asDiv(piece('<section class="hero"')), { defs: true });

add("mascots", "Robot mascots", "The five agents, Cut, Hue, Nova, Echo and Flow, as candy-coloured robots on their own tinted tiles, each with its own eyes, mouth and prop (antenna, droplet, sparkle, headphones, squiggle) and a levitation trail; they float on SMIL and bob in white-framed tiles over a faded phone. Each mascot is a <symbol> in #cc-defs: draw one with <svg viewBox=\"0 0 200 200\" preserveAspectRatio=\"xMidYMid slice\"><use href=\"#cc-agent-0\"/></svg> (0-4).",
  asDiv(piece('<section class="conn"')), { defs: true });

add("timeline", "Timeline strip", "A dark --cc-d0 panel lifted off a green status slab: a toolbar with a star button, a hint and a blinking live badge, then five mascot tiles. Hovering or focusing a tile raises it and shows a dark tooltip with the agent's icon in green, name and role. Three tiles show on phones.",
  piece('<div class="deck" id="timeline"'), { defs: true });

add("ways", "Create modes accordion", "Three ways to brief the agents in one grey tray: the open way grows to fill the row on --cc-ease-swift and shows its copy, check points, an 8s green timer and a stage (a fanned template with a Remix button, a prompt box that types its brief in, or a dark SDK card with code and a live preview); the closed ones shrink to a 200px peek. They auto-advance every 8s once on screen and stack open below 1199px.",
  inSection("create", '<div class="wrap">'), { js: true });

add("services", "Services index", "A grey tray of white rows: number, name and line, From and Timeline facts and an arrow tile. On hover a candy tint washes in from the corner, a cover slides open on the left and the arrow tile turns green. A dark scope row closes the index with a green button.",
  inSection("services", '<div class="sindex reveal"'));

add("gantt", "Six-week gantt", "A dark timeline of phases against a six-week ruler: each phase is a dark clip with a green tick that slides in when the gantt scrolls into view (the hot phase is solid green), and a green playhead sweeps the weeks back and forth on --cc-dur-playhead. It stacks to one lane per phase on phones.",
  inSection("process", '<div class="wrap">'), { js: true });

add("projects", "Project decks", "Each project is a grey tile holding three white-framed covers stacked like a hand of cards: on hover the outer two fan out on --cc-ease-spring, the middle one lifts, a candy tint fades in and a dark stat badge drops down. Category badge bottom-left, title and client below.",
  inSection("projects", '<div class="pgrid"'));

add("team", "Team card deck", "A white roster beside a dark stage holding a deck of grayscale portrait cards in white frames: the top card sits flat, the next two step up and shrink behind it, the last one flies off to the left. Rows, arrows and a 5s auto-advance deal the deck; a green bar tracks the place.",
  piece('<div class="team reveal">'), { js: true });

add("pricing", "Pricing & toggle", "A Monthly / Annual switch (the track turns green and knocks 20% off) over three plans: grey trays holding a white head with the name, a big h3 price and a button, then green-check features. The popular plan's head fades white to pale green and carries the status pill. A green gradient consultation band follows.",
  inSection("pricing", '<div class="wrap">'), { js: true });

add("faq", "FAQ accordion", "White question rows in a grey tray; the plus tile turns a quarter into a cross and the answer opens on a grid-template-rows transition.",
  inSection("faq", '<div class="acc reveal"'), { js: true });

add("cta", "CTA cover ring", "A sky-to-violet gradient panel with a green glow at its foot, an h2 and twelve covers (mascots among them) standing on a 3D ring that turns once a minute behind the green and white buttons. The ring's radius is 560px, 320px under 810px wide.",
  piece('<div class="cta"'), { js: true, defs: true });

add("footer", "Footer", "A grey tray holding a white card: the logo and a line, four link columns with faint heads, a hairline base row, and a huge 10%-ink cutcrew wordmark fading into the tray below.",
  piece("<footer"));

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
const CLASSES = new Set();
for (const [, sel] of base.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "cc" && !m[1].startsWith("cc-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("cc-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["on", "open", "ann", "in"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["pop", "blurIn", "rise", "blink", "marq", "fadeIn", "fill", "bob", "play", "ping", "spin"];
const ATTRS = ["i", "k", "step", "price"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "cc", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`))
  .replace(/animation:blink /g, "animation:cc-blink ");
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .cc itself, or :where(.cc) in front
const ROOTED = /(^|[\s,(>+~])\.cc(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude}{\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.cc) ${s}`)).join(",")}{${body}}`;
  }).join("\n");
}
/* On the page, headings and controls inherit Switzer from body. Inside a host
   they'd pick up the host's own heading and control fonts instead (the SYSTEMS
   dialog set the hero h1 in the site's mono), so they inherit from .cc. It goes
   first: the page's own rules for any of these come after it and still win. */
// One :where(.cc) per element (not :is(h1, h2, ...)) so every selector part reads as scoped
const RESET = `${["h1", "h2", "h3", "h4", "h5", "h6", "button", "input", "textarea", "select"].map((t) => `:where(.cc) ${t}`).join(",")}{font-family:inherit}`;
const componentCss = `${RESET}\n${rootEvery(prefixCss(tokenize(base))).trim()}`;
// (#000 stays: it is the opaque stop of the marquee and tint masks, an alpha, not a colour)
const leftHex = componentCss.replace(/url\([^)]*\)/g, "").replace(/#000(?![0-9a-f])/gi, "").match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Cutcrew components, no libraries. Every listener is delegated from the
     document, so components added later work without setup; the parts that
     run on their own (the create modes, the team deck, the gantt reveal) start
     when they scroll into view, as on the page. Under prefers-reduced-motion
     nothing auto-advances, the prompt shows in full and the mascots hold still. */
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  if (RM) all('.cc svg').forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  /* Create modes: the open way fills the tray; Describe types its brief in */
  function type(box) {
    if (box._ccTxt == null) box._ccTxt = box.textContent.trim();
    var txt = box._ccTxt, n = 0;
    clearInterval(box._ccT);
    if (RM) { box.textContent = txt; return; }
    box.innerHTML = '<span class="cc-caret"></span>';
    box._ccT = setInterval(function () {
      n++;
      box.innerHTML = txt.slice(0, n) + '<span class="cc-caret"></span>';
      if (n >= txt.length) clearInterval(box._ccT);
    }, 38);
  }
  function way(ways, k) {
    var list = all('.cc-way', ways), i = (k + list.length) % list.length;
    ways._ccI = i;
    list.forEach(function (w, j) {
      w.classList.remove('cc-on');
      w.setAttribute('aria-expanded', String(j === i));
      if (j === i) {
        void w.offsetWidth; /* restart the timer bar */
        w.classList.add('cc-on');
        var p = w.querySelector('.cc-prompt .cc-in');
        if (p) type(p);
      }
    });
    clearTimeout(ways._ccW);
    if (!RM) ways._ccW = setTimeout(function () { way(ways, i + 1); }, 8000);
  }

  /* Team deck: the chosen card on top, two stepped behind, the last flown off left */
  function team(t, k) {
    var cards = all('.cc-tcard', t), n = cards.length, i = ((k % n) + n) % n;
    t._ccI = i;
    cards.forEach(function (c, j) {
      var o = (j - i + n) % n;
      c.style.zIndex = 10 - o;
      c.style.opacity = o > 2 ? 0 : 1;
      c.style.transform = o === 0 ? 'none' : 'translateY(' + (-o * 18) + 'px) scale(' + (1 - o * 0.06) + ')';
      if (o === n - 1) { c.style.transform = 'translateX(-120%) rotate(-12deg)'; c.style.opacity = 0; }
    });
    all('.cc-mrow', t).forEach(function (r, j) { r.classList.toggle('cc-on', j === i); r.setAttribute('aria-pressed', String(j === i)); });
    var count = t.querySelector('.cc-tctl .cc-xs'), bar = t.querySelector('.cc-tprog b');
    if (count) count.textContent = pad(i + 1) + ' / ' + pad(n);
    if (bar) bar.style.width = ((i + 1) / n * 100) + '%';
    clearTimeout(t._ccT);
    if (!RM) t._ccT = setTimeout(function () { team(t, i + 1); }, 5000);
  }

  /* Pricing: the switch re-prices every plan beside it (annual is 20% off) */
  function flip(tg) {
    var on = !tg.classList.contains('cc-ann'), caps = all('.cc-cap', tg);
    tg.classList.toggle('cc-ann', on);
    tg.setAttribute('aria-checked', String(on));
    if (caps[0]) caps[0].style.color = on ? 'var(--cc-t35)' : '';
    if (caps[1]) caps[1].style.color = on ? 'var(--cc-t)' : 'var(--cc-t35)';
    all('.cc-plan[data-cc-price]', tg.parentElement).forEach(function (p) {
      var m = +p.getAttribute('data-cc-price'), h = p.querySelector('.cc-price .cc-h3'), per = p.querySelector('.cc-price .cc-xs');
      if (h) h.innerHTML = '<small>$</small>' + (on ? Math.round(m * 0.8) : m);
      if (per) per.textContent = '/ month' + (on ? ', billed yearly' : '');
    });
  }

  /* CTA ring: its radius follows the window width at load, as on the page (set once, not on resize) */
  all('.cc-ring').forEach(function (ring) {
    var small = innerWidth < 810, R = small ? 320 : 560;
    ring.style.top = ((small ? 110 : 170) + R) + 'px';
    all('.cc-ac', ring).forEach(function (c, k) { c.style.transform = 'rotate(' + k * 30 + 'deg) translateY(-' + R + 'px)'; });
  });

  /* Start the self-running parts when they come into view; the gantt clips slide in then */
  all('.cc-gantt').forEach(function (g) { g.classList.remove('cc-in'); });
  function start(el) {
    if (el.classList.contains('cc-gantt')) el.classList.add('cc-in');
    else if (el.classList.contains('cc-ways')) way(el, el._ccI || 0);
    else if (el.classList.contains('cc-team')) team(el, el._ccI || 0);
  }
  var parts = all('.cc-gantt, .cc-ways, .cc-team');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { start(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    parts.forEach(function (p) { io.observe(p); });
  } else parts.forEach(start);
  /* Below 1199px every way is open, so every prompt types at once */
  if (innerWidth < 1200) all('.cc-prompt .cc-in').forEach(type);

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.cc')) return;
    var w = t.closest('.cc-way');
    if (w && !w.classList.contains('cc-on')) { var ws = w.closest('.cc-ways'); way(ws, all('.cc-way', ws).indexOf(w)); return; }
    var row = t.closest('.cc-mrow');
    if (row) { team(row.closest('.cc-team'), +row.getAttribute('data-cc-k')); return; }
    var step = t.closest('[data-cc-step]');
    if (step) { var tm = step.closest('.cc-team'); team(tm, (tm._ccI || 0) + +step.getAttribute('data-cc-step')); return; }
    var tg = t.closest('.cc-toggle');
    if (tg) { flip(tg); return; }
    var q = t.closest('.cc-qr');
    if (q) { q.setAttribute('aria-expanded', String(q.parentElement.classList.toggle('cc-open'))); return; }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (t.classList && t.classList.contains('cc-way') && !t.classList.contains('cc-on')) { e.preventDefault(); way(t.closest('.cc-ways'), all('.cc-way', t.closest('.cc-ways')).indexOf(t)); }
    else if (t.classList && t.classList.contains('cc-toggle')) { e.preventDefault(); flip(t); }
  });
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own hero, its words swapped for the system's name, over the mascot fan
const HERO = asDiv(piece('<section class="hero"'))
  .replace(">Edit<", ">The<").replace(">Video<", ">Cutcrew<").replace(">With<", ">Design<").replace(">Agents.<", ">System.<")
  .replace(/(<p class="p word"[^>]*>)[^<]*/, "$1Candy-coloured robot mascots, grey trays holding white cards, Switzer set large and tight and one electric green. Extracted from the Cutcrew AI video agents page.");
const CHROME = `
body{margin:0;background:var(--cc-bg)}
.sp-top{max-width:var(--cc-wrap);margin:0 auto;padding:20px 32px 0;overflow:hidden}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 16px;padding:12px 16px;background:var(--cc-g1);border-radius:var(--cc-radius-sm)}
.sp-top .cc-hero{padding:36px 0 0;gap:22px}
.sp-top .cc-hero h1{font-size:clamp(48px,7.4vw,88px)}
.sp-top .cc-fan{height:250px}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;font:500 11px/1.4 var(--cc-font-mono);text-transform:uppercase;letter-spacing:.04em;color:var(--cc-t60)}
.sp-label::before{content:"";width:6px;height:6px;border-radius:3px;background:var(--cc-acc)}
.sp-main{max-width:var(--cc-wrap);margin:0 auto;padding:24px 32px 120px}
.sp-sec{padding:64px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:10px 0 0;font:400 40px/1.05 var(--cc-font-sans);letter-spacing:-.02em;color:var(--cc-t)}
.sp-note{margin:0;max-width:640px;font:400 15px/1.55 var(--cc-font-sans);color:var(--cc-t60)}
.sp-demo{position:relative;overflow:clip;padding:clamp(16px,3vw,32px);background:var(--cc-bg);border:1px solid var(--cc-line);border-radius:var(--cc-radius-tray)}
.sp-demo>.cc-hero{padding:24px 0 8px}
.sp-demo>.cc-conn{padding:48px 0}
.sp-demo>.cc-deck{padding:8px 0 56px}
.sp-demo>.cc-cta,.sp-demo>footer{padding:0}
@media (max-width:809px){.sp-top,.sp-main{padding-left:16px;padding-right:16px}.sp-head{grid-template-columns:minmax(0,1fr)}.sp-head h2{font-size:30px}.sp-top .cc-fan{height:180px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta"><p class="sp-label">InstaLanding design system</p><p class="sp-label">cutcrew@${VERSION} · ${C.length} components</p></div>
${prefixMarkup(unhook(HERO))}
</header>`;
const specimen = renderSpecimen({
  name: "Cutcrew",
  slug: "cutcrew",
  version: VERSION,
  prefix: "cc",
  rootClass: "cc",
  labelClass: "sp-label",
  script: "scripts/systems/cutcrew.mjs",
  source: SOURCE,
  metaDescription: "The Cutcrew design system: tokens and working components extracted from the Cutcrew AI video agents page.",
  defsNote: "the five robot mascots as <symbol id=\"cc-agent-0..4\">, floating on SMIL; draw one with <use href=\"#cc-agent-N\">",
  jsNote: "the create-mode accordion and its self-typing prompt, the gantt reveal, the team deck, the pricing toggle, the FAQ and the CTA ring radius",
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
writeSystem({ slug: "cutcrew", prefix: "cc", rootClass: "cc", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "btn-dark", "chip", "eyebrow", "card", "fan", "tile", "tip", "way", "srow", "gantt", "clip", "proj", "deck", "tcard", "plan", "qa", "ring", "art", "h3", "ico"] });
