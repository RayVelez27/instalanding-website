// Extracts the Fortix design system from its app page.
//
//   node scripts/systems/fortix.mjs
//
// Reads public/demos/fortix-ai-money-copilot.html (never edits it) and writes
// public/systems/fortix/ (specimen.html, tokens.css, fortix.css) through the
// shared pipeline in lib.mjs. The page keeps one flat <style>; the system keeps
// all of it but the document shell, the fixed blur bar and the scroll reveals
// (.rv, .pop, .rise, .rise2, .turn): every component is shown settled. The two
// reveals that ARE the component (the landscape dashboard tipping up, the
// carousel rising) keep their CSS and are settled with the page's own .in class.
// The page's tag selectors become classes (nav -> .fx-nav, footer -> .fx-footer)
// and its section rhythm becomes a token, so nothing reaches a host's own tags.
// What the page's script writes at boot is written here at build time with the
// page's own code: the six phone screens (screens{} with chart() and ring()),
// the landscape dashboard, the five stat cards with the ring's first pose
// (layoutStats() at rot 0) and the four feature cards. What it does over time
// stays in the component script: the turning stat ring, the tap-through
// carousel and the mobile menu.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/fortix-ai-money-copilot.html";
const { page, el, css: pageCss, fonts: FONTS } = readPage(SOURCE);
const VERSION = "1.0.0";
if (!FONTS.includes("Inter")) throw new Error("font link not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · Fortix · fortix@${VERSION}
   Extracted from https://instalanding.ai/demos/fortix-ai-money-copilot.html
   Fonts (Google Fonts): Inter 400-900 for everything, with tabular figures */
:root {
  /* Color · core */
  --fx-ink: #1A1A1A;
  --fx-ink65: rgba(26,26,26,.65);
  --fx-ink50: rgba(26,26,26,.5);
  --fx-ink10: rgba(26,26,26,.1);
  --fx-ink05: rgba(26,26,26,.05);
  --fx-bg: #FFFFFF;
  --fx-white: #FFFFFF;
  --fx-black: #000000;
  --fx-store-line: #A6A6A6;
  --fx-star: #FCA800;
  --fx-select: #6A6A6A;

  /* Color · gradient stops */
  --fx-violet: #7C4DFF;
  --fx-violet-deep: #4A1FB8;
  --fx-red: #F85032;
  --fx-red-deep: #E73827;
  --fx-gold: #FDC830;
  --fx-orange: #F37335;
  --fx-pink: #E60B79;
  --fx-pink-deep: #990750;
  --fx-green: #50B224;
  --fx-green-deep: #3F8C1C;
  --fx-blue: #3A8BFF;
  --fx-blue-deep: #0D4FD1;
  --fx-cyan: #22D3EE;
  --fx-cyan-deep: #0E7490;

  /* Color · gradients */
  --fx-g-purple: linear-gradient(225deg, var(--fx-violet), var(--fx-violet-deep));
  --fx-g-red: linear-gradient(225deg, var(--fx-red), var(--fx-red-deep));
  --fx-g-orange: linear-gradient(225deg, var(--fx-gold), var(--fx-orange));
  --fx-g-pink: linear-gradient(225deg, var(--fx-pink), var(--fx-pink-deep));
  --fx-g-green: linear-gradient(225deg, var(--fx-green), var(--fx-green-deep));
  --fx-g-blue: linear-gradient(225deg, var(--fx-blue), var(--fx-blue-deep));
  --fx-g-cyan: linear-gradient(225deg, var(--fx-cyan), var(--fx-cyan-deep));

  /* Color · screen */
  --fx-night: #06060B;
  --fx-lilac: #A78BFA;
  --fx-lilac-hi: #C4B5FD;
  --fx-aqua-hi: #67E8F9;
  --fx-orchid: #F0ABFC;
  --fx-magenta: #FF4FD8;
  --fx-up: #4ADE80;
  --fx-alert: #FCA5A5;
  --fx-blush: #FBCFE8;
  --fx-indigo: #1E1B4B;
  --fx-orb-core: #1B0F3D;
  --fx-orb-mini: #140B30;
  --fx-btn-ink: #0B0B12;
  --fx-text-gradient: linear-gradient(90deg, var(--fx-lilac-hi), var(--fx-aqua-hi));

  /* Type · families */
  --fx-font-display: Inter, system-ui, sans-serif;
  --fx-font-text: Inter, system-ui, sans-serif;

  /* Type · scale */
  --fx-h1: 80px;
  --fx-h2: 48px;
  --fx-stat: 48px;
  --fx-h3: 36px;
  --fx-card-title: 32px;
  --fx-lead: 24px;
  --fx-label: 16px;
  --fx-small: 14px;

  /* Shape · radii */
  --fx-pill: 100px;
  --fx-r-block: 32px;
  --fx-r-icon: 24px;
  --fx-r-card: 20px;
  --fx-r-bubble: 16px;
  --fx-r-logo: 12px;
  --fx-r-store: 10px;
  --fx-r-glass: 1.2em;
  --fx-r-phone: 16% / 7.4%;
  --fx-r-screen: 13.5% / 6.3%;

  /* Shape · borders */
  --fx-hair: 1px;
  --fx-av-ring: 4px;

  /* Depth · devices, glass and gloss */
  --fx-frame: linear-gradient(145deg, #4A4A52 0%, #16161A 22%, #2C2C33 48%, #0C0C0F 72%, #3A3A42 100%);
  --fx-shadow-device: 0 50px 60px -10px rgba(10,6,30,.35), 0 18px 24px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.18), inset 0 0 0 3px #08080A;
  --fx-screen: radial-gradient(90% 45% at 15% -5%, rgba(124,77,255,.55), transparent 70%), radial-gradient(70% 40% at 105% 15%, rgba(0,212,255,.28), transparent 70%), radial-gradient(80% 40% at 50% 115%, rgba(255,79,216,.18), transparent 70%), var(--fx-night);
  --fx-screen-wide: radial-gradient(60% 80% at 10% 0%, rgba(124,77,255,.5), transparent 70%), radial-gradient(50% 70% at 100% 100%, rgba(0,212,255,.25), transparent 70%), var(--fx-night);
  --fx-glass: linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
  --fx-glass-line: rgba(255,255,255,.1);
  --fx-blur: blur(12px);
  --fx-gloss: linear-gradient(180deg, rgba(255,255,255,.8), rgba(255,255,255,0));
  --fx-shadow-icon: 0 2px 4px rgba(0,0,0,.2);
  --fx-shadow-float: 0 8px 16px rgba(0,0,0,.2);
  --fx-shadow-card: 0 16px 24px rgba(0,0,0,.2);
  --fx-shadow-stat: 8px 20px 32px rgba(0,0,0,.25);

  /* Motion · easing */
  --fx-ease: cubic-bezier(.2,.8,.2,1);
  --fx-ease-turn: cubic-bezier(.3,.8,.3,1);

  /* Motion · durations */
  --fx-dur-hover: .25s;
  --fx-dur-quick: .3s;
  --fx-dur-turn: .9s;
  --fx-dur-ring: 1s;
  --fx-dur-tip: 1s;
  --fx-blink: 1.2s;
  --fx-spin: 5s;
  --fx-float: 6s;
  --fx-ring-step: 2.6s;
  --fx-carousel-step: 3.5s;

  /* Space · layout */
  --fx-wrap: 800px;
  --fx-gut: 24px;
  --fx-gap: 16px;
  --fx-nav-gap: 104px;
  --fx-sec: 240px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names; its seven gradients
// become --fx-g-* so the hex stops they are made of can keep the colour names
const VARS = { purple: "g-purple", red: "g-red", orange: "g-orange", pink: "g-pink", green: "g-green", blue: "g-blue", cyan: "g-cyan" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("fx-") ? m : `--fx-${VARS[n] ?? n}`));
const esc = (v) => v.replace(/[().,+*%/]/g, "\\$&");
const lit = (v, tok) => [v, `var(--fx-${tok})`];
// Compound values are swapped on the raw CSS, before the hex pass would split them up
const RAW = [
  lit("linear-gradient(145deg,#4a4a52 0%,#16161a 22%,#2c2c33 48%,#0c0c0f 72%,#3a3a42 100%)", "frame"),
  lit("0 50px 60px -10px rgba(10,6,30,.35),0 18px 24px rgba(0,0,0,.18),inset 0 0 0 1px rgba(255,255,255,.18),inset 0 0 0 3px #08080a", "shadow-device"),
  lit("radial-gradient(90% 45% at 15% -5%,rgba(124,77,255,.55),transparent 70%),radial-gradient(70% 40% at 105% 15%,rgba(0,212,255,.28),transparent 70%),radial-gradient(80% 40% at 50% 115%,rgba(255,79,216,.18),transparent 70%),#06060b", "screen"),
  lit("radial-gradient(60% 80% at 10% 0%,rgba(124,77,255,.5),transparent 70%),radial-gradient(50% 70% at 100% 100%,rgba(0,212,255,.25),transparent 70%),#06060b", "screen-wide"),
  lit("linear-gradient(160deg,rgba(255,255,255,.1),rgba(255,255,255,.03))", "glass"),
  lit("linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,0))", "gloss"),
  lit("linear-gradient(90deg,#c4b5fd,#67e8f9)", "text-gradient"),
  ["border:1px solid rgba(255,255,255,.1);border-radius:1.2em", "border:var(--fx-hair) solid var(--fx-glass-line);border-radius:var(--fx-r-glass)"],
  ["backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)", "backdrop-filter:var(--fx-blur);-webkit-backdrop-filter:var(--fx-blur)"],
  ["box-shadow:0 2px 4px rgba(0,0,0,.2)", "box-shadow:var(--fx-shadow-icon)"],
  ["box-shadow:0 8px 16px rgba(0,0,0,.2)", "box-shadow:var(--fx-shadow-float)"],
  ["box-shadow:0 16px 24px rgba(0,0,0,.2)", "box-shadow:var(--fx-shadow-card)"],
  ["box-shadow:8px 20px 32px rgba(0,0,0,.25)", "box-shadow:var(--fx-shadow-stat)"],
  ["border-radius:16%/7.4%", "border-radius:var(--fx-r-phone)"],
  ["border-radius:13.5%/6.3%", "border-radius:var(--fx-r-screen)"],
];
const HEX = {
  "#1a1a1a": "ink", "#fff": "white", "#000": "black", "#a6a6a6": "store-line", "#fca800": "star", "#6a6a6a": "select",
  "#7c4dff": "violet", "#4a1fb8": "violet-deep", "#f85032": "red", "#e73827": "red-deep", "#fdc830": "gold", "#f37335": "orange",
  "#e60b79": "pink", "#990750": "pink-deep", "#50b224": "green", "#3f8c1c": "green-deep", "#3a8bff": "blue", "#0d4fd1": "blue-deep",
  "#22d3ee": "cyan", "#0e7490": "cyan-deep",
  "#06060b": "night", "#a78bfa": "lilac", "#c4b5fd": "lilac-hi", "#67e8f9": "aqua-hi", "#f0abfc": "orchid", "#ff4fd8": "magenta",
  "#4ade80": "up", "#fca5a5": "alert", "#fbcfe8": "blush", "#1e1b4b": "indigo", "#1b0f3d": "orb-core", "#140b30": "orb-mini", "#0b0b12": "btn-ink",
};
// Selector-bound swaps: the same literal means different things in different rules
// (keep() has already put each selector on its own line and a space before the brace)
const at = (selector, from, to) => [new RegExp(`(${esc(selector).replace(/,/g, ",\\s*")}\\s*\\{[^}]*?)${esc(from)}`), `$1${to}`];
const SWAPS = [
  [/font-family:Inter,system-ui,sans-serif/g, "font-family:var(--fx-font-text)"],
  at("h1", "font-size:80px", "font-size:var(--fx-h1)"),
  at("h2", "font-size:48px", "font-size:var(--fx-h2)"),
  at("h3,.h3", "font-size:36px", "font-size:var(--fx-h3)"),
  at(".lead", "font-size:24px", "font-size:var(--fx-lead)"),
  at(".label", "font-size:16px", "font-size:var(--fx-label)"),
  at(".about p.big", "font-size:48px", "font-size:var(--fx-h2)"),
  at(".about .line", "font-size:48px", "font-size:var(--fx-h2)"),
  at(".stat .v", "font-size:48px", "font-size:var(--fx-stat)"),
  at(".fc h3", "font-size:32px", "font-size:var(--fx-card-title)"),
  at(".badge", "font-size:14px", "font-size:var(--fx-small)"),
  at(".bub", "font-size:14px", "font-size:var(--fx-small)"),
  at(".hint", "font-size:14px", "font-size:var(--fx-small)"),
  [/border-radius:(?:100|99)px/g, "border-radius:var(--fx-pill)"],
  at(".dblock", "border-radius:32px", "border-radius:var(--fx-r-block)"),
  at(".stat", "border-radius:32px", "border-radius:var(--fx-r-block)"),
  at(".ic", "border-radius:24px", "border-radius:var(--fx-r-icon)"),
  at(".fc", "border-radius:20px", "border-radius:var(--fx-r-card)"),
  at(".fcoin", "border-radius:20px", "border-radius:var(--fx-r-card)"),
  at(".logo", "border-radius:12px", "border-radius:var(--fx-r-logo)"),
  at(".store", "border-radius:10px", "border-radius:var(--fx-r-store)"),
  at(".bub", "border-radius:16px 16px 16px 0", "border-radius:var(--fx-r-bubble) var(--fx-r-bubble) var(--fx-r-bubble) 0"),
  at(".bub.rt", "border-radius:16px 16px 0 16px", "border-radius:var(--fx-r-bubble) var(--fx-r-bubble) 0 var(--fx-r-bubble)"),
  [/border(-top)?:1px solid/g, "border$1:var(--fx-hair) solid"],
  at(".av", "border:4px solid", "border:var(--fx-av-ring) solid"),
  [/cubic-bezier\(\.2,\.8,\.2,1\)/g, "var(--fx-ease)"],
  [/cubic-bezier\(\.3,\.8,\.3,1\)/g, "var(--fx-ease-turn)"],
  [/transition:\.25s/g, "transition:var(--fx-dur-hover)"], [/transform \.25s/g, "transform var(--fx-dur-hover)"],
  [/transition:\.3s/g, "transition:var(--fx-dur-quick)"],
  [/transform \.9s var\(--fx-ease-turn\),filter \.9s/g, "transform var(--fx-dur-turn) var(--fx-ease-turn),filter var(--fx-dur-turn)"],
  [/transform 1s var\(--fx-ease-turn\)/g, "transform var(--fx-dur-ring) var(--fx-ease-turn)"],
  [/transition:1s var\(--fx-ease\)/g, "transition:var(--fx-dur-tip) var(--fx-ease)"],
  [/spin 5s/g, "spin var(--fx-spin)"], [/float 6s/g, "float var(--fx-float)"], [/blink 1\.2s/g, "blink var(--fx-blink)"],
  [/max-width:800px;margin:0 auto;padding:0 24px/g, "max-width:var(--fx-wrap);margin:0 auto;padding:0 var(--fx-gut)"],
  [/max-width:800px;margin:0 auto;border-top/g, "max-width:var(--fx-wrap);margin:0 auto;border-top"],
  [/gap:16px(?=[;}])/g, "gap:var(--fx-gap)"],
  [/gap:104px/g, "gap:var(--fx-nav-gap)"],
];

/* ── 3. Component CSS: the page's one <style>, minus the document shell and the scroll reveals ── */
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
// Page-only parts: the document shell, the 240px section rhythm (it becomes --fx-sec, the
// host's to apply), the fixed blur bar at the viewport foot and the scroll reveals
const DROP = /^(html|section|\.blurbar|\.rv(\.in)?|\.pop(\.in)?|\.rise(\.in)?|\.dl \.dev \.rise2(\.in)?|\.turn(\.r|\.in)?)$/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".fx" : null;
  if (sel === "*") return ":where(.fx, .fx *)";
  if (sel === "body") return ".fx";
  // The page styles its <nav> and <footer> by tag; in a system those would reach a host's own
  return sel.replace(/^nav(?![\w-])/, ".nav").replace(/^footer(?![\w-])/, ".footer");
}
function keep(css, inMedia = false) {
  return splitRules(css).map((rule) => {
    const i = rule.indexOf("{");
    const prelude = rule.slice(0, i).trim();
    const body = rule.slice(i + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body, true);
      return inner ? `${prelude} {\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return rule;
    const parts = splitSelectors(prelude).filter((s) => !DROP.test(s)).map((s) => scopeSelector(s, inMedia)).filter(Boolean);
    return parts.length ? `${parts.join(",\n")} {${body}}` : "";
  }).filter(Boolean).join("\n");
}
let raw = pageCss.replace(/\/\*[\s\S]*?\*\//g, "");
for (const [from, to] of RAW) {
  if (!raw.includes(from)) throw new Error("raw value not found: " + from.slice(0, 60));
  raw = raw.split(from).join(to);
}
raw = raw
  // The carousel's class is .fx, the system's root: it becomes .carousel
  .replace(/\.fx(?![\w-])/g, ".carousel")
  // A component root shouldn't clip its host: the page hid sideways overflow on <body>
  .replace(";overflow-x:hidden;", ";");
const base = renameVars(keep(raw));

/* ── 4. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; its script hooks (nav, burger, stats, wide, fx)
// lose their ids; every other id (the menu, the SVG gradients and symbols) moves under fx-
const ANCHORS = "hero|overview|experience|details|features|download|wallet";
const HOOK_IDS = "nav|burger|stats|wide|fx";
const REVEALS = new Set(["rv", "pop", "rise", "rise2", "turn"]);
const unhook = (html) => html
  .replace(/ data-(section|component|screen)="[^"]*"/g, "")
  .replace(/ class="([^"]*)"/g, (_, list) => {
    const kept = list.split(/\s+/).filter((c) => c && !REVEALS.has(c));
    return kept.length ? ` class="${kept.join(" ")}"` : "";
  })
  // The reveal staggers only meant something with the reveals
  .replace(/ style="transition-delay:[^";]*"/g, "")
  .replace(/;transition-delay:[^";]*/g, "")
  .replace(new RegExp(` id="(${ANCHORS}|${HOOK_IDS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ aria-controls="(?!fx-)([^"]+)"/g, ' aria-controls="fx-$1"')
  .replace(/ id="(?!fx-)([^"]+)"/g, ' id="fx-$1"')
  .replace(/(href|xlink:href)="#(?!fx-)([^"]+)"/g, '$1="#fx-$2"')
  .replace(/url\(#(?!fx-)([^)]+)\)/g, "url(#fx-$1)")
  .replace(/var\(--([a-zA-Z][\w-]*)/g, (m) => renameVars(m));
const piece = (html, marker) => sliceEl(html, marker).html;
const asDiv = (html) => html.replace(/^<section/, "<div").replace(/<\/section>$/, "</div>");

// The page's own boot script, run at build time
const between = (a, b) => {
  const s = page.indexOf(a), e = page.indexOf(b, s);
  if (s < 0 || e < 0) throw new Error("script marker not found: " + a);
  return page.slice(s, e);
};
const after = (a, b) => between(a, b).slice(a.length);
const BOOT = new Function(`
${between("let uid=0;", "document.querySelectorAll('.phone[data-screen]')")}
const WIDE=${after("document.querySelector('#wide .ws').innerHTML=", "\n\n// stats")}
${between("const stats=", "\nconst st=")}
const STATS=${after("st.innerHTML=", "\nconst cards=")}
${between("const feats=", "\nconst fx=")}
const FEATS=${after("fx.innerHTML=", "\nlet fpos")}
return { screens, WIDE, STATS, FEATS };`)();
// The ring's first pose, through the page's own layoutStats() at rot 0 (desktop width)
const LAYOUT = /function layoutStats\(\)\{[\s\S]*?\n/.exec(page)?.[0];
if (!LAYOUT) throw new Error("layoutStats not found");
const posed = (html) => {
  const cards = [...html.matchAll(/<div class="stat"/g)].map(() => ({ style: {} }));
  new Function("cards", "innerWidth", `let rot=0;\n${LAYOUT}\nlayoutStats();`)(cards, 1440);
  let i = 0;
  return html.replace(/<div class="stat" style="([^"]*)"/g, (_, s) => {
    const c = cards[i++].style;
    return `<div class="stat" style="${s};transform:${c.transform};z-index:${c.zIndex};opacity:${c.opacity}"`;
  });
};
const phones = (html) => html.replace(/<div class="phone([^"]*)" data-screen="(\w+)"([^>]*)><\/div>/g, (_, cls, name, rest) =>
  `<div class="phone${cls}"${rest}><div class="scr">${BOOT.screens[name]()}</div></div>`);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const NAV = el('<nav id="nav"').replace('<nav id="nav"', '<nav class="nav" id="nav"');
const HERO = el('<section class="hero"');
const LOGOS = el('<section class="logos"');
const ABOUT = el('<section class="about"');
const EXP = el('<section id="experience"');
const MSG = el('<section class="msg"');
const DET = el('<section id="details"');
const WALLET = el('<section id="wallet"');
const FEAT = el('<section id="features"');
const DL = el('<section class="dl"');
const FOOT = el('<footer data-section="footer"').replace("<footer", '<footer class="footer"');
const SPRITE = el('<svg width="0" height="0" style="position:absolute"');
const ICONS = [...HERO.matchAll(/<span class="ic [^"]*"[^>]*>[\s\S]*?<\/svg><\/span>/g)].map((m) => m[0]);

add("nav", "Navigation", "A centred bar on a white fade (no box): two links either side of a 40px squircle mark whose four stepped blocks invert to white on ink on hover. Links are Inter 600 at 65% ink in pill hit areas that tint 5% on hover. Under 768px the links give way to a burger whose three lines cross into an X and open a white sheet of 28px links.",
  NAV, { js: true });

add("buttons", "Store buttons, icons & chips", "Store buttons are black 60px tiles with a grey hairline and a two-line label (an 11px kicker over a 20px name) that lift 2px on hover. App icons are 72px squircles on a 225deg gradient with a white gloss falling from the top and a white-gradient glyph from the sprite. Text links end in a chevron that slides 4px; the proof chip stacks three coloured dots in a 5% ink pill, the security chip is the green gradient.",
  `<div class="demo-pad"><div class="wrap">
<div class="demo-row">${ICONS.slice(0, 3).join("")}${piece(NAV, '<a class="logo"')}</div>
<div class="demo-gap"></div>
${piece(HERO, '<div class="stores')}
<div class="demo-gap"></div>
<div class="demo-row">${piece(EXP, '<a class="more"')}${piece(DET, '<div class="chipa"')}${piece(DET, '<div class="chipg"')}</div>
</div></div>`, { defs: true });

add("type", "Proof lines & headings", "Inter 700 throughout, tracked -.04em and set tight (.96 to 1.04). Proof paragraphs run at --fx-h2 in 50% ink with the key phrase in full ink, and inline proof sits in the line: a gold star and the rating, three tilted avatar tiles in white rings, a spinning conic AI orb. Section heads pair a 16px 50% label with an h2; leads are 24px 500 at 65% ink.",
  `<div class="about demo-pad"><div class="wrap">
${[...ABOUT.matchAll(/<div class="para rv">[\s\S]*?\n    <\/div>/g)].map((m) => m[0]).join("\n")}
<div class="demo-gap"></div>
<div class="center">${piece(WALLET, '<div class="hd rv">')}</div>
</div></div>`);

add("hero", "Hero with phones", "A centred headline whose words share the line with glossy gradient app icons (purple spark, red card, orange growth) that drop out under 768px for a row of three small icons above it; a 65% ink lead, two store buttons and a stage where two dark phones (net worth, AI chat) rise from below and fade into white. Partner logos sit under it in greyscale at 55% and colour in on hover.",
  phones(asDiv(HERO)).replace(/<\/div>$/, "") + "\n" + asDiv(LOGOS) + "</div>", { defs: true });

add("phone", "Phone & net-worth screen", "A phone drawn in CSS and sized by width alone (aspect-ratio .462, container-type: inline-size; everything inside is em off 3.85cqw): a brushed graphite frame (--fx-frame), side keys, an island, a glass glare. The screen is the dark palette: violet, cyan and pink light pooling on --fx-night, a status bar, a greeting with a spinning orb, the balance, a glowing smooth area chart, an AI card with a gradient hairline, three glass tiles with bars and a glass tab bar.",
  `<div class="phone-row">
${phones('<div class="phone" data-screen="home" style="width:300px"></div>')}
${phones('<div class="phone" data-screen="home" style="width:200px"></div>')}
</div>`);

add("chat", "AI chat screen", "The copilot's chat: the orb and an online dot in the header, the member's bubbles in a violet gradient with a tucked corner, the AI's replies in plain text with gradient figures and a glass plan card of labelled bars, a typing indicator whose three dots bob in turn, and a glass input pill with a glowing mic.",
  `<div class="phone-row">
${phones('<div class="phone" data-screen="chat" style="width:300px"></div>')}
</div>`);

add("stats", "Stat ring", "Five gradient stat cards (240 by 320, 32px corners, a white hairline, a light pool top-left and a shade bottom-right, the icon twice: small and as a big faint watermark) dealt onto a 3D ring that turns one place every --fx-ring-step. Back cards dim; each keeps its own slight tilt. Under 768px the ring becomes a horizontal snap scroller of square cards.",
  `<div class="demo-pad"><div class="wrap">
${posed(piece(ABOUT, '<div class="stats"').replace("></div>", `>${BOOT.STATS}</div>`))}
</div></div>`, { js: true });

add("feature", "Feature split blocks", "Two rows of a phone in a 5% ink block (32px corners, the phone rising out of its foot, two big blurred colour blobs glowing up from below) beside a heading, a lead and a chevron link; the second row flips sides. Under 768px they stack, text first on the flipped row. The phones show the AI chat home and the Autopilot rules (a progress ring, four glass rules with gradient toggles).",
  `<div class="demo-pad">${phones(asDiv(EXP))}</div>`);

add("details", "Forecast & fraud alert", "Two columns that stagger: copy above a phone on the left, a phone above copy on the right. The forecast screen has a segmented range picker, the predicted balance, a line that turns dashed into the future inside a confidence band, an AI heads-up and scheduled bills. The security screen leads with a red glass alert (the blocked amount struck through, two actions), a 98 safety ring and signal rows. Chips close each column.",
  `<div class="demo-pad">${phones(asDiv(DET).replace('class="phone turn r"', 'class="phone turn"'))}</div>`);

add("message", "Floating badges & bubbles", "A centred head in a 560px stage, ringed by what Fortix does: gradient badge pills with a white hairline and a glyph, glossy coin tiles that float on --fx-float out of step, and ink speech bubbles (one corner tucked into a little tail) with a gradient avatar under the tail. Under 768px the coins and one bubble drop out.",
  asDiv(MSG));

add("dashboard", "Landscape dashboard", "The same device turned on its side (aspect-ratio 2.16, the type in 1.85cqw): a three-column dashboard of the net worth, a glowing chart with a weekly AI card, and three glass goal bars. It tips up into view from rotateX(45deg) and .8 scale; add .fx-in to settle it.",
  `<div class="demo-pad">${asDiv(WALLET).replace('<div class="ws"></div>', `<div class="ws">${BOOT.WIDE}</div>`).replace('class="wide"', 'class="wide in"')}</div>`);

add("carousel", "3D feature carousel", "Four gradient feature cards (20px corners, a white hairline, an SVG illustration over the title) in a 3D ring: the front card flat, the side cards swung 60deg and darkened, the back card pushed away. A tap, Enter or Space brings the next card round; it also advances by itself every --fx-carousel-step unless hovered or focused.",
  `<div class="demo-pad">${asDiv(FEAT).replace(/<div class="fx"([^>]*)><\/div>/, `<div class="carousel in"$1>${BOOT.FEATS}</div>`)}</div>`, { js: true });

add("download", "Download CTA", "The closing block: a phone rising into a 240px window that fades to white at the foot, the h2 and a lead, and the two store buttons.",
  `<div class="demo-pad">${phones(asDiv(DL))}</div>`);

add("footer", "Footer", "A hairline-topped two-column footer on the --fx-wrap column: the mark, a one-line description, legal links and small print on the left; four short columns of Inter 600 links under 50% ink headings on the right. Under 768px the columns stack, the menu first.",
  FOOT);

/* ── 5. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance, so the headings
// name the display face themselves. The nav sits in the flow (the page fixed it to the top),
// so its menu sheet hangs under the bar instead of covering the viewport. The hero's 168px top
// was clearance for the fixed nav. The stat ring's back cards carry their dimmed opacity
// inline from the ring; the mobile scroller shows every card whole.
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: var(--fx-font-display); }`;
const EXTRA = `
.nav { position: relative; }
.menu { position: absolute; inset: 100% 0 auto; padding: 32px 0; box-shadow: var(--fx-shadow-float); border-radius: 0 0 var(--fx-r-block) var(--fx-r-block); }
.hero { padding-top: 96px; }
.footer { padding: 64px var(--fx-gut); }
.demo-pad { padding: clamp(40px, 6vw, 72px) 0; }
.demo-row { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; }
.demo-gap { height: 32px; }
.phone-row { display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-end; gap: 40px; padding: 56px var(--fx-gut); }
.phone-row .phone { max-width: 100%; }
@media (max-width: 767px) {
.stat { opacity: 1 !important; }
}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "fx" && !m[1].startsWith("fx-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("fx-")) CLASSES.add(n);
CLASSES.delete("fx");
const KEYFRAMES = ["spin", "blink", "float"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "fx", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES });
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .fx itself, or :where(.fx) in front
const ROOTED = /(^|[\s,(>+~])\.fx(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const i = rule.indexOf("{");
    const prelude = rule.slice(0, i).trim();
    const body = rule.slice(i + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.fx) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(tokenize(HEADINGS + "\n" + base + "\n" + EXTRA))).replace(/\n{3,}/g, "\n\n").trim();

/* ── 6. Shared SVG defs: the three app-icon glyphs and the white gradient they fill with ── */
const DEFS = unhook(SPRITE).replace("<svg ", '<svg id="fx-defs" ');

/* ── 7. Component script ─────────────────────────────────────────────── */
// The page's interactions, rewritten against classes instead of ids so any number of
// copies works, and delegated from the document so components added later work too
const JS = `(function () {
  'use strict';
  /* Fortix components, no libraries. With prefers-reduced-motion the stat ring
     and the carousel hold still (a tap still advances the carousel) and every
     CSS loop stops. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }
  // The steps are tokens, so a host can retime them in CSS
  function step(name, fallback) {
    var root = document.querySelector('.fx') || document.documentElement;
    var v = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return v > 0 ? v * 1000 : fallback;
  }

  /* Stat ring: the page's layoutStats(), per ring. Under 768px the cards are a CSS
     snap scroller and the transforms stay out of the way. */
  var TILT = [8, 1, -1, -6, -3];
  function layout(st) {
    if (innerWidth < 768) return;
    var cards = st.children, n = cards.length, rot = st._fxRot || 0;
    [].forEach.call(cards, function (el, i) {
      var a = ((i - rot) % n + n) % n, ang = a * 360 / n * Math.PI / 180;
      var x = Math.sin(ang) * 300, z = Math.cos(ang) * 260 - 260;
      el.style.transform = 'translate3d(' + x + 'px,40px,' + z + 'px) rotate(' + (TILT[i % TILT.length]) + 'deg) rotateY(' + (-Math.sin(ang) * 35) + 'deg)';
      el.style.zIndex = Math.round(z + 600);
      el.style.opacity = z < -380 ? .75 : 1;
    });
  }
  addEventListener('resize', function () { each('.fx-stats', layout); });

  /* Carousel: the front card goes round to the back */
  function advance(fx) {
    var cards = fx.querySelectorAll('.fx-fc'), n = cards.length;
    fx._fxPos = ((fx._fxPos || 0) + 1) % n;
    [].forEach.call(cards, function (el, i) { el.setAttribute('data-pos', ((i - fx._fxPos) % n + n) % n); });
  }

  /* Nav menu (under 768px), the carousel and placeholder links */
  function setMenu(nav, open) {
    nav.classList.toggle('fx-open', open);
    var b = nav.querySelector('.fx-burger');
    if (b) b.setAttribute('aria-expanded', String(open));
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.fx')) return;
    var burger = t.closest('.fx-burger');
    if (burger) { var nav = burger.closest('.fx-nav'); setMenu(nav, !nav.classList.contains('fx-open')); return; }
    var inMenu = t.closest('.fx-menu');
    if (inMenu) setMenu(inMenu.closest('.fx-nav'), false);
    var fx = t.closest('.fx-carousel');
    if (fx) { advance(fx); return; }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    var fx = e.target.closest && e.target.closest('.fx-carousel');
    if (fx && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); advance(fx); return; }
    if (e.key !== 'Escape') return;
    each('.fx-nav.fx-open', function (nav) { setMenu(nav, false); var b = nav.querySelector('.fx-burger'); if (b) b.focus(); });
  });

  if (reduce) return;

  setInterval(function () {
    each('.fx-stats', function (st) { st._fxRot = (st._fxRot || 0) + 1; layout(st); });
  }, step('--fx-ring-step', 2600));

  /* The carousel turns by itself unless hovered or focused */
  setInterval(function () {
    each('.fx-carousel', function (fx) { if (!fx.matches(':hover') && !fx.matches(':focus-within')) advance(fx); });
  }, step('--fx-carousel-step', 3500));
})();`;

/* ── 8. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the mark and meta over the page's own icon headline, retitled,
// with the gradient set as glossy icon swatches and two phones rising under it
const logo = prefixMarkup(unhook(piece(NAV, '<a class="logo"')));
const topHero = prefixMarkup(unhook(phones(`<div class="hero">${piece(HERO, '<div class="wrap">')}\n${sliceEl(HERO, '<div class="wrap">', HERO.indexOf('<div class="wrap">') + 1).html}</div>`
  .replace('data-screen="chat"', 'data-screen="shield"'))
  .replace(/<div class="stores[\s\S]*?\n    <\/div>/, "")
  .replace('<span class="rv" style="transition-delay:.1s">Save,</span>', '<span class="rv">Glossy</span>')
  .replace('<span class="rv" style="transition-delay:.35s">spend</span>', '<span class="rv">icons,</span>')
  .replace('<span class="rv" style="transition-delay:.6s">and</span>', '<span class="rv">glass</span>')
  .replace('<span class="rv" style="transition-delay:.75s">grow</span>', '<span class="rv">phones</span>')
  .replace('<span class="w"><span class="rv" style="transition-delay:.9s">smarter</span></span>', "")
  .replace(/(<p class="lead rv"[^>]*>)[^<]*/, "$1A bright, airy app language for AI money products: Inter set tight, glossy gradient icons, dark glass phones drawn in HTML and SVG. Extracted from the Fortix AI Money Copilot page.")));
const swatch = (g) => `<i title="--fx-g-${g}" style="background:var(--fx-g-${g})"></i>`;
const CHROME = `
body{margin:0;background:var(--fx-bg)}
.sp-top{position:relative}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px 24px;max-width:1120px;margin:0 auto;padding:24px var(--fx-gut) 0}
.sp-meta>span{font-size:14px;font-weight:600;color:var(--fx-ink50);letter-spacing:-.01em}
.sp-top .fx-hero{padding-top:28px}
.sp-top .fx-devices{margin-top:36px;height:420px}
.sp-swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:28px}
.sp-swatches i{position:relative;width:40px;height:40px;border-radius:12px;box-shadow:var(--fx-shadow-icon);overflow:hidden}
.sp-swatches i::before{content:"";position:absolute;inset:0;background:var(--fx-gloss);opacity:.6}
.sp-swatches i.sp-ink{background:var(--fx-ink)}
.sp-swatches i.sp-night{background:var(--fx-screen)}
.sp-main{max-width:1120px;margin:0 auto;padding:0 var(--fx-gut) 120px}
.sp-sec{padding:96px 0 0;scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,340px) minmax(0,1fr);gap:8px 40px;align-items:end;margin-bottom:20px}
.sp-head h2{margin:12px 0 0;font-family:var(--fx-font-display);font-size:clamp(28px,3vw,40px);font-weight:700;line-height:1.04;letter-spacing:-.04em;color:var(--fx-ink)}
.sp-label{display:inline-flex;align-items:center;gap:8px;margin:0;padding:6px 12px 6px 8px;border-radius:var(--fx-pill);background:var(--fx-ink05);font-size:14px;font-weight:600;color:var(--fx-ink65)}
.sp-label::before{content:"";width:16px;height:16px;border-radius:6px;background:var(--fx-g-purple)}
.sp-note{margin:0;max-width:680px;font-size:15px;font-weight:500;line-height:1.55;color:var(--fx-ink65)}
.sp-demo{position:relative;overflow:clip;border:1px solid var(--fx-ink10);border-radius:var(--fx-r-block);background:var(--fx-bg)}
#c-nav .sp-demo{overflow:visible;padding:24px}
@media (max-width:900px){.sp-head{grid-template-columns:minmax(0,1fr)}}
@media (max-width:767px){.sp-top .fx-devices{height:300px}}
`;
const HEROHTML = `
<header class="sp-top">
<div class="sp-meta">${logo}<span>Design system · fortix@${VERSION} · ${C.length} components</span></div>
${topHero.replace(/(<\/p>)(\s*<\/div>\s*<div class="fx-wrap">)/, `$1
<div class="sp-swatches" aria-label="Core gradients">${["purple", "red", "orange", "pink", "green", "blue", "cyan"].map(swatch).join("")}<i class="sp-ink" title="--fx-ink"></i><i class="sp-night" title="--fx-screen"></i></div>$2`)}
</header>`;
if (!HEROHTML.includes("sp-swatches")) throw new Error("specimen swatches not placed");
const specimen = renderSpecimen({
  name: "Fortix",
  slug: "fortix",
  version: VERSION,
  prefix: "fx",
  rootClass: "fx",
  labelClass: "sp-label",
  script: "scripts/systems/fortix.mjs",
  source: SOURCE,
  metaDescription: "The Fortix design system: tokens and working components extracted from the Fortix AI Money Copilot page.",
  defsNote: "the app-icon glyphs (fx-i-spark, fx-i-card, fx-i-grow) and the white gradient they fill with; include it once per page",
  jsNote: "the turning stat ring, the tap-through feature carousel and the mobile nav menu",
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
writeSystem({ slug: "fortix", prefix: "fx", rootClass: "fx", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["phone", "scr", "store", "stores", "ic", "stat", "stats", "fc", "carousel", "wide", "ws", "badge", "bub", "fcoin", "nav", "footer", "wrap", "lead", "label", "g", "ai", "orb", "hero", "devices", "logo", "more", "chipa", "chipg", "in"] });
