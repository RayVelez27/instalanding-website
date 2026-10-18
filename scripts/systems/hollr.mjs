// Extracts the Hollr design system from its landing page.
//
//   node scripts/systems/hollr.mjs
//
// Reads public/demos/hollr-messenger.html (never edits it) and writes
// public/systems/hollr/ through scripts/systems/lib.mjs: specimen.html,
// tokens.css and hollr.css.
//
// Hollr is a dark Y2K desktop: a night-indigo page, pale messenger chrome with
// glossy two-tone titlebars, bevelled "classic" buttons and a purple → magenta
// brand gradient. The page keeps its palette in :root, so most of the work is
// a rename (--ink -> --hl-ink, --display -> --hl-font-display, …) plus the
// many literal chrome colours (titlebar stops, bevel, statusbar) turned into
// tokens. The page's sky (orbs, grain, stars), its spotlight and perspective
// floor, scroll reveals and the sticky how-it-works layout are page shell and
// are left out. Two keyframes the page references but never defines (spin,
// borderSpin) are defined here, so the conic window rings really turn.
import { readPage, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/hollr-messenger.html";
const { el, css: pageCssRaw } = readPage(SOURCE);
const VERSION = "1.0.0";
const P = "hl";

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page. Group comments ("/* Color · core *​/")
   are read by the dialog to lay the token panels out, so keep the format. */
const TOKENS = `/* InstaLanding design system · Hollr · hollr@${VERSION}
   Extracted from https://instalanding.ai/demos/hollr-messenger.html
   Fonts (Google Fonts): Oswald 400-700, Neuton 400/700 + italic; Verdana and Tahoma are system faces */
:root {
  /* Color · core */
  --hl-ink-2: #1D1C45;
  --hl-ink: #2C2B5C;
  --hl-ink-3: #3B3A78;
  --hl-win: #D7E4F5;
  --hl-win-2: #EEF0FD;
  --hl-lilac: #F5F2F9;
  --hl-p1: #6A2FC4;
  --hl-p2: #C0169F;
  --hl-gold: #E6E82A;
  --hl-online: #5EE36A;

  /* Color · chrome */
  --hl-bar-a: #D8E8F7;
  --hl-win-top: #E3ECF9;
  --hl-win-bottom: #D4E2F5;
  --hl-line: #586170;
  --hl-line-soft: #ABB0C6;
  --hl-rule: #D8DEF0;
  --hl-track: #E3E7F5;
  --hl-face: #FBFBFB;
  --hl-edge: #93989C;
  --hl-bevel: #C0C9E0;
  --hl-status: #FDFDFF;
  --hl-frame: #505E67;

  /* Color · text */
  --hl-text: #1B2340;
  --hl-muted: #3B4458;
  --hl-grey: #434C4B;
  --hl-navy: #1D2A8C;
  --hl-status-ink: #000080;
  --hl-whisper: #6B6F78;
  --hl-plum: #8A1576;
  --hl-haze: #A9B3E0;
  --hl-periwinkle: #CFD3FF;
  --hl-tab: #E2C47B;

  /* Color · titlebars */
  --hl-blue-hi: #7B9DE6;
  --hl-blue: #3F60C0;
  --hl-blue-lo: #2F4FAE;
  --hl-blue-end: #4A6FD0;
  --hl-violet-hi: #9A6BE8;
  --hl-violet-lo: #5A24AD;
  --hl-violet-end: #8A3FD0;
  --hl-rose-hi: #E870C8;
  --hl-rose-lo: #A3118A;
  --hl-rose-end: #D03AB0;
  --hl-sky: #2F6FD6;

  /* Color · state */
  --hl-ok: #3FBF5A;
  --hl-ok-deep: #25A046;
  --hl-lilac-tint: #F1E7FF;
  --hl-lilac-edge: #CBB6F2;

  /* Type · families */
  --hl-font-display: "Oswald", "Arial Narrow", sans-serif;
  --hl-font-body: Verdana, Tahoma, sans-serif;
  --hl-font-mono: Tahoma, Verdana, sans-serif;
  --hl-font-copy: "Neuton", Georgia, serif;

  /* Type · scale */
  --hl-step-hero: clamp(40px, 7vw, 104px);
  --hl-step-xl: clamp(34px, 4.6vw, 64px);
  --hl-step-lg: clamp(32px, 4.2vw, 52px);
  --hl-step-num: 56px;
  --hl-step-copy-lg: 20px;
  --hl-step-title: 19px;
  --hl-step-copy: 16.5px;
  --hl-step-ui: 14px;
  --hl-step-small: 12px;
  --hl-step-label: 11px;
  --hl-step-micro: 10.5px;

  /* Shape · radii */
  --hl-radius-pill: 999px;
  --hl-radius-window: 20px;
  --hl-radius-card: 14px;
  --hl-radius-md: 12px;
  --hl-radius-btn: 9px;
  --hl-radius-sm: 7px;

  /* Shape · borders */
  --hl-border: 1px;
  --hl-border-ring: 1.5px;
  --hl-border-frame: 4px;

  /* Depth · shadows */
  --hl-shadow-window: 0 60px 140px rgba(8, 4, 40, 0.75), 0 24px 50px rgba(0, 0, 0, 0.45), 0 0 0 8px rgba(255, 255, 255, 0.03);
  --hl-shadow-card: 0 14px 30px rgba(0, 0, 0, 0.35);
  --hl-shadow-bevel: -4px -4px 6px var(--hl-bevel) inset, 0 2px 0 rgba(0, 0, 0, 0.08);
  --hl-glow-prime: 0 1px 0 rgba(255, 255, 255, 0.45) inset, 0 10px 30px rgba(192, 22, 159, 0.45);

  /* Motion · easing */
  --hl-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --hl-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Motion · durations */
  --hl-dur-fast: .2s;
  --hl-dur: .25s;
  --hl-dur-msg: .45s;
  --hl-dur-pop: .7s;
  --hl-dur-sheen: 3.6s;
  --hl-dur-ring: 7s;

  /* Space · layout */
  --hl-page-max: 1200px;
  --hl-gutter: 20px;
  --hl-section-y: 110px;
  --hl-gap: 20px;
  --hl-pane-gap: 10px;
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
function swap(css, from, to) {
  if (!css.includes(from)) throw new Error("swap not found: " + from.slice(0, 50));
  return css.replace(from, to);
}
let css = pageCssRaw;
// the page's :root blocks become TOKENS
css = cut(css, ":root{\n  --ink:", "*{box-sizing:border-box}");
css = drop(css, ':root{--copy:"Neuton", Georgia, serif}\n');
css = drop(css, "html{scroll-behavior:smooth}\n");
// the sky: gradient, orbs, grain and stars (the drift keyframes stay, the footer orbs use them)
css = cut(css, "/* ---------- Ambient background ---------- */", "@keyframes drift1");
css = cut(css, ".grain{", "/* ---------- Layout ---------- */");
// hero scenery: the spinning halo, the floating stickers, the spotlight and the perspective floor
css = cut(css, ".halo{", ".tilt{");
css = cut(css, "/* floating stickers around the console */", ".hero .suggest{");
css = cut(css, ".hero .spot{", ".hero h1{");
// the marquee and scroll reveals
css = cut(css, "/* ---------- Marquee ---------- */", "/* ---------- Section heads ---------- */");
css = cut(css, "/* Reveal on scroll */", "/* ---------- Features ---------- */");
css = drop(css, ".faq-ring.rv{transition:opacity .9s var(--ease), transform .9s var(--ease)}\n");
css = drop(css, "  .rv{opacity:1;transform:none}\n");
css = drop(css, "  html{scroll-behavior:auto}\n");
// earlier drafts the page overrides later: old steps, details FAQ, CTA band and footer bar (.ok stays)
css = cut(css, "/* ---------- How it works ---------- */", "/* ---------- CTA ---------- */");
css = cut(css, ".cta{margin:110px", ".ok{");
css = cut(css, "/* ---------- Footer ---------- */", "/* ---------- Toast ---------- */");
// the how-it-works page layout (sticky side, big number, rail): page shell, not components
css = cut(css, ".how-grid{", ".stack{");
// stickers' media rules went with the stickers
css = drop(css, "@media (max-width:1320px){.sticker.s1{left:-40px}.sticker.s3{right:-16px}}\n");
// the kick badge only lived in the hero; let it stand anywhere, in the face it had inside the framed heading
css = swap(css, ".hero .kick-badge{display:inline-flex;", ".kick-badge{display:inline-flex;font-family:var(--copy);text-transform:uppercase;");
css = swap(css, "@media (max-width:560px){\n  .hero .kick-badge{", "@media (max-width:560px){\n  .kick-badge{");
// the composer textarea was styled by id
css = css.replace(/#goal/g, ".goal");
// the progress bars were meant to be staggered, but nth-of-type counts every div in the window: stagger them by sibling
css = swap(css, ".job:nth-of-type(2) .bar i{animation-delay:-2s}.job:nth-of-type(3) .bar i{animation-delay:-4s}", ".job + .job .bar i{animation-delay:-2s}.job + .job + .job .bar i{animation-delay:-4s}");
// keyframes the page uses but never defines
css += `
/* Referenced by the page but never defined there: the conic rings turn, the spinners spin */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes borderSpin{to{--a:360deg}}
`;

/* Element rules become rules on the system root: the page's bare `body`,
   `a`, `h1`, `kbd`… are scoped under .hl, with :where() so they stay as weak
   as they were and the classes still win. */
function scopeElements(text) {
  return text.replace(/(^|[{}])(\s*)([^{}@]+?)(\s*)\{/g, (m, open, sp, rawSel, sp2) => {
    // A comment before a rule is captured with its selector: keep it, scope what follows it
    const [, lead, sel] = /^((?:\s*\/\*[\s\S]*?\*\/)*\s*)([\s\S]*)$/.exec(rawSel);
    const s = sel.trim();
    if (!s || /^(from|to|\d+(\.\d+)?%)(\s*,\s*(from|to|\d+(\.\d+)?%))*$/.test(s)) return m;
    const scoped = s.split(",").map((one) => {
      const x = one.trim();
      if (x === "body") return ".hl";
      if (x === "*") return ":where(.hl), :where(.hl) *";
      if (/^\*::/.test(x)) return `:where(.hl) ${x}`;
      if (/^(a|img|svg|button|summary|section|h1|h2|h3|kbd|footer|details|input|textarea)([\s.:[>]|$)/.test(x)) return `:where(.hl) ${x}`;
      return x;
    }).join(", ");
    return `${open}${sp}${lead}${scoped}${sp2}{`;
  });
}
css = scopeElements(css)
  // the ring angle is a registered property: give it the system's name
  .replace(/--a(?![\w-])/g, "--hl-a");

/* ── 3. Normalisation: page variables and literals -> tokens ─────────── */
const RENAME = {
  ink: "ink", "ink-2": "ink-2", "ink-3": "ink-3", win: "win", "win-2": "win-2", lilac: "lilac", "bar-a": "bar-a",
  line: "line", "line-soft": "line-soft", text: "text", muted: "muted", grey: "grey", navy: "navy",
  p1: "p1", p2: "p2", gold: "gold", tab: "tab", online: "online",
  display: "font-display", body: "font-body", copy: "font-copy", ease: "ease",
};
const HEX = {
  "#6a2fc4": "p1", "#c0169f": "p2", "#e6e82a": "gold", "#5ee36a": "online", "#1d1c45": "ink-2",
  "#d7e4f5": "win", "#eef0fd": "win-2", "#e2c47b": "tab",
  "#fbfbfb": "face", "#93989c": "edge", "#c0c9e0": "bevel", "#fdfdff": "status", "#505e67": "frame",
  "#e3ecf9": "win-top", "#d4e2f5": "win-bottom", "#d8def0": "rule", "#e3e7f5": "track",
  "#7b9de6": "blue-hi", "#3f60c0": "blue", "#2f4fae": "blue-lo", "#4a6fd0": "blue-end",
  "#9a6be8": "violet-hi", "#5a24ad": "violet-lo", "#8a3fd0": "violet-end",
  "#e870c8": "rose-hi", "#a3118a": "rose-lo", "#d03ab0": "rose-end", "#2f6fd6": "sky",
  "#6b6f78": "whisper", "#8a1576": "plum", "#a9b3e0": "haze", "#cfd3ff": "periwinkle",
  "#3fbf5a": "ok", "#25a046": "ok-deep", "#f1e7ff": "lilac-tint", "#cbb6f2": "lilac-edge",
};
const lit = (s) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
const SWAPS = [
  ...Object.entries(RENAME).map(([from, to]) => [new RegExp(`var\\(--${from}\\)`, "g"), `var(--hl-${to})`]),
  [/color:navy/g, "color:var(--hl-status-ink)"],
  [/font-family:Tahoma,Verdana,sans-serif/g, "font-family:var(--hl-font-mono)"],
  [/font-family:Tahoma,sans-serif/g, "font-family:var(--hl-font-mono)"],
  [lit('"Oswald", sans-serif'), "var(--hl-font-display)"],
  [lit("cubic-bezier(.34,1.56,.64,1)"), "var(--hl-ease-spring)"],
  // type
  [lit("clamp(40px,7vw,104px)"), "var(--hl-step-hero)"],
  [lit("clamp(34px,4.6vw,64px)"), "var(--hl-step-xl)"],
  [lit("clamp(32px,4.2vw,52px)"), "var(--hl-step-lg)"],
  [/font-size:56px/g, "font-size:var(--hl-step-num)"],
  [/font-size:20px/g, "font-size:var(--hl-step-copy-lg)"],
  [/font-size:19px/g, "font-size:var(--hl-step-title)"],
  [/font-size:16\.5px/g, "font-size:var(--hl-step-copy)"],
  // shape
  [/border-radius:999px/g, "border-radius:var(--hl-radius-pill)"],
  [/border-radius:20px(?![\d.])/g, "border-radius:var(--hl-radius-window)"],
  [/border-radius:14px(?![\d.])/g, "border-radius:var(--hl-radius-card)"],
  [/border-radius:12px(?![\d.])/g, "border-radius:var(--hl-radius-md)"],
  [/border-radius:9px(?![\d.])/g, "border-radius:var(--hl-radius-btn)"],
  [/border-radius:7px(?![\d.])/g, "border-radius:var(--hl-radius-sm)"],
  [/padding:1\.5px/g, "padding:var(--hl-border-ring)"],
  [/border:4px double/g, "border:var(--hl-border-frame) double"],
  [/border-width:4px 0/g, "border-width:var(--hl-border-frame) 0"],
  // depth
  [lit("0 60px 140px rgba(8,4,40,.75),0 24px 50px rgba(0,0,0,.45),0 0 0 8px rgba(255,255,255,.03)"), "var(--hl-shadow-window)"],
  [lit("box-shadow:0 14px 30px rgba(0,0,0,.35)"), "box-shadow:var(--hl-shadow-card)"],
  [lit("-4px -4px 6px var(--hl-bevel) inset, 0 2px 0 rgba(0,0,0,.08)"), "var(--hl-shadow-bevel)"],
  [lit("0 1px 0 rgba(255,255,255,.45) inset, 0 10px 30px rgba(192,22,159,.45)"), "var(--hl-glow-prime)"],
  // motion
  [/ \.25s var\(--hl-ease\)/g, " var(--hl-dur) var(--hl-ease)"],
  [/ \.7s var\(--hl-ease\)/g, " var(--hl-dur-pop) var(--hl-ease)"],
  [/animation:msgIn \.45s/g, "animation:msgIn var(--hl-dur-msg)"],
  [/animation:sheen 3\.6s/g, "animation:sheen var(--hl-dur-sheen)"],
  [/animation:borderSpin 7s/g, "animation:borderSpin var(--hl-dur-ring)"],
  [/transition:background \.2s, transform \.2s/g, "transition:background var(--hl-dur-fast), transform var(--hl-dur-fast)"],
  // layout
  [lit(".wrap{max-width:1200px;margin:0 auto;padding:0 20px}"), ".wrap{max-width:var(--hl-page-max);margin:0 auto;padding:0 var(--hl-gutter)}"],
  [lit(".sec{padding:110px 0 0}"), ".sec{padding:var(--hl-section-y) 0 0}"],
  [lit("gap:20px;margin-top:48px"), "gap:var(--hl-gap);margin-top:48px"],
  [lit("gap:10px;padding:10px 10px 0"), "gap:var(--hl-pane-gap);padding:var(--hl-pane-gap) var(--hl-pane-gap) 0"],
];
// Every class the trimmed CSS uses gets the hl- prefix
const CLASSES = [...new Set([...css.matchAll(/\.([a-z][\w-]*)/gi)].map((m) => m[1]))]
  .filter((c) => c !== "hl");
CLASSES.push("lb", "run-label", "chatv", "user", "mega-cta", "g-nm", "l1"); // set by the page's script or only hooks there
const KEYFRAMES = [...new Set([...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]))];
const { tokenize, prefixCss, prefixMarkup } = normalizer({
  prefix: P, hex: HEX, swaps: SWAPS, classes: CLASSES, keyframes: KEYFRAMES, attrs: ["mode", "tool", "emo", "goal", "k"],
});
const componentCss = (prefixCss(tokenize(css)).trim() + `

/* Until the script has measured it, the Chat/Agent pill sits on the active button itself */
.hl-seg:not([data-hl-placed]) button.hl-on{background:linear-gradient(135deg,var(--hl-p1),var(--hl-p2));border-radius:var(--hl-radius-sm)}
.hl-seg:not([data-hl-placed]) .hl-seg-pill{display:none}`);

/* ── 4. Components (each one real markup from the page) ──────────────── */
const local = (html) => html
  .replace(/href="#[\w-]*"/g, 'href="#"')
  .replace(/url\(#lg1\)/g, "url(#hl-lg1)")
  .replace(/ rv(?=["\s])/g, "")
  .replace(/ style="--d:[^"]*"/g, "")
  .replace(/ fade-up(?=["\s])/g, "")
  .replace(/ style="animation-delay:[^"]*"/g, "");

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, markup: prefixMarkup(local(markup)), ...opts });

add("nav", "Navigation", "A slim, full-width glossy blue titlebar: the speech-bubble mark and an Oswald wordmark with a pulsing Online pill, white links and a pale bevelled Sign in key. A sheen sweeps across every few seconds.",
  el('<header class="nav" id="nav" data-section="nav">')
    .replace(' id="nav" data-section="nav"', "")
    .replace(/<defs>[\s\S]*?<\/defs>\s*/, ""));

add("buttons", "Buttons", "The brand button is the purple → magenta gradient with a gold edge, a glass top half and a sheen; the classic button is the old OS face, bevelled with an inset shadow. Run, Sign in and Back to top are the same two ideas at window scale.",
  `<div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center">
${/<button class="btn btn-prime" type="submit"><span><u>S<\/u>tart chatting<\/span>[\s\S]*?<\/button>/.exec(el('<form class="mega-form" id="signup" novalidate>'))[0].replace('type="submit"', 'type="button"')}
<a class="btn btn-classic" href="#how">See how it works <svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a>
${el('<button type="submit" class="run" id="runBtn">').replace(' id="runBtn"', "").replace('type="submit"', 'type="button"')}
${el('<a class="nav-btn" href="#start">')}
${el('<button type="button" class="totop" id="totop">').replace(' id="totop"', "")}
</div>`);

add("badges", "Status & badges", "Small talk of the chrome: the NEW kick badge, the Online pill, the model pill with a pinging dot, topic counts, Done / Approved / Resume pills and outlined tags.",
  `<div style="display: grid; gap: 18px">
<div style="display: flex; flex-wrap: wrap; gap: 14px; align-items: center">
${/<span class="ait-kick kick-badge">[\s\S]*?<\/span><\/span>/.exec(el('<h1 class="ait">'))[0].replace("ait-kick ", "")}
<span class="nav-status"><i></i>Online</span>
</div>
<div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; padding: 14px; border-radius: 12px; background: var(--hl-win-2); border: 1px solid var(--hl-line)">
<span class="faq-count">6 topics</span>
<span class="st done">Done</span><span class="st now">Approved</span><span class="st nxt">Resume</span>
<div class="sc-tags" style="margin: 0"><span>Chat mode</span><span>Agent mode</span></div>
<span class="model" style="margin-left: 0"><span class="dot sm"></span>Hollr · ready</span>
</div>
</div>`);

add("heading", "Framed heading", "A small Neuton kicker, letter-spaced wide, over an Oswald uppercase line filled with a slowly moving pastel-to-gold gradient, held between a double rule above and below.",
  `<div>
${el('<h2 class="ait rv" style="--d:.05s"><span class="ait-kick">Features</span>').replace(/^/, '<div class="ait-wrap">') + "</div>"}
<p class="sub">The features you remember, rebuilt around an assistant that actually knows things.</p>
</div>`);

const ring = el('<div class="ring" id="agentBox">')
  .replace(' id="agentBox"', "")
  .replace('<textarea id="goal"', '<textarea id="goal" class="goal"')
  .replace('<div class="log" id="log" aria-live="polite"></div>', `<div class="log" id="log" aria-live="polite">
                  <div class="msg sys">Hollr has signed in.</div>
                  <div class="msg user"><span class="who">You say:</span><div class="txt">hey! can you plan a birthday party for 12?</div></div>
                  <div class="msg bot"><span class="who">Hollr says:</span><div class="txt">Love a party. Tell me the guest count and vibe and I'll draft a checklist and playlist.</div></div>
                  <div class="msg bot"><span class="who">Hollr is typing</span><div class="typing"><i></i><i></i><i></i></div></div>
                </div>`);
add("window", "Messenger window", "The hero: a pale messenger window inside a slowly turning conic ring, with a glossy titlebar, a toolbar of icon tools, the conversation and the avatar, and the composer (Chat/Agent switch, emoticons, Nudge, tool chips and Run). Try the switch, the chips, Nudge and Run. Suggestion chips sit underneath.",
  `<div class="hero" style="padding: 0; overflow: visible">
<div class="stage" style="margin-top: 0">
${ring}
</div>
${el('<div class="suggest fade-up" style="animation-delay:1.2s" aria-label="Try an example">')}
${el('<div class="fine fade-up" style="animation-delay:1.3s">')}
</div>`, { js: true });

const TASK = (cls, label, detail, tag) => `<li class="task${cls ? " " + cls : ""}"><span class="st"></span><span class="lb">${label}${detail ? `<span class="detail">${detail}</span>` : ""}</span><span class="tag">${tag}</span></li>`;
add("agent-run", "Agent run", "What Agent mode prints into the conversation: the plan as a checklist (done, working, skipped because a tool is off, waiting), then the result card with Approve and Refine. Nothing goes out without the OK.",
  `<div class="history" style="max-width: 560px; border-radius: 10px; color: var(--hl-text)">
<div class="to">To: <strong>Hollr</strong> <span style="color:#6b6f78">(Agent mode)</span></div>
<div class="log" style="height: auto; overflow: visible">
<div class="msg user"><span class="who">You say:</span><div class="txt">Plan a birthday party for 12</div></div>
<div class="msg bot"><span class="who">Hollr says:</span><div class="txt">On it. Here's my plan — I'll check with you before anything goes out.</div></div>
<div class="msg plan"><div class="plan-h"><span>Birthday party plan</span><span class="ct">4/6</span></div><ol>
${TASK("done", "Understand the request", "Guest count, date, vibe", "Planner")}
${TASK("done", "Check the weekend forecast", "Indoor vs outdoor call", "Web search")}
${TASK("done", "Shortlist nearby venues", "Size, price, availability", "Web search")}
${TASK("active", "Build checklist &amp; budget", "", "Files")}
${TASK("skip", "Hold the date", "Skipped — Calendar access is off", "Calendar")}
${TASK("", "Draft the invite", "", "Email")}
</ol></div>
<div class="msg result"><div class="result-h"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg><span>Birthday party plan ready</span></div><ul><li>Venue shortlist with pros &amp; cons</li><li>Checklist, timeline and budget</li><li>Invite draft ready to review</li></ul><div class="result-a"><button type="button" class="go">Approve &amp; continue</button><button type="button" class="alt">Refine</button></div></div>
</div>
</div>`);

const grid = el('<div class="grid">');
const cards = grid.split(/\n\s*\n/).slice(0, 3).join("\n\n").replace(/ tilt(?=")/g, "") + "\n    </div>";
add("cards", "Feature cards", "Each card is a little window: a lilac bar with a gold tab and a number, then a white pane with a glossy 3D icon that floats and tilts, an Oswald title and Neuton copy. Every card has its own icon colours.",
  cards.replace('<div class="grid">', '<div class="grid" style="margin-top: 0">'));

add("step-cards", "Step windows", "How-it-works cards as windows with violet, blue and magenta titlebars: a big gradient step number, the copy and tags, and a mini window that plays the step (sign in, chat, approve). They replay when they scroll into view.",
  el('<div class="stack" id="howStack">')
    .replace(' id="howStack"', ' style="padding-bottom: 0"')
    .replace(/<!-- STEP \d -->\n\s*/g, "")
    .replace(/<article class="scard" id="step\d" style="--i:(\d)">/g, '<article class="scard on" style="--i:$1; position: relative; top: auto; margin-bottom: 28px">'),
  { js: true });

add("search", "Search & ask", "A frosted search field with a / shortcut key, and the Still curious? strip: the blinking bot avatar, Neuton copy and the brand button. Typing filters the help chat below.",
  `<div style="display: grid; gap: 4px; max-width: 520px">
${el('<div class="faq-search rv" style="--d:.15s">')}
${el('<div class="faq-ask rv" style="--d:.2s">').replace(' id="faqAsk"', "")}
</div>`, { js: true });

add("help-chat", "Help chat", "An FAQ as a conversation: a violet titlebar window, numbered questions, and answers that arrive as Hollr's speech bubble after a beat of typing dots. One open at a time.",
  `<div style="max-width: 760px">
${el('<div class="faq-ring rv" style="--d:.1s">')
    .replace(/\s*<div class="faq-empty" id="faqEmpty" hidden>[\s\S]*?<\/div>\n/, "\n")
    .replace('<div class="fq" ', '<div class="fq open" ')
    .replace('aria-expanded="false"', 'aria-expanded="true"')}
</div>`, { js: true });

add("buddy", "Buddy list", "The contact list window, tilted in 3D and floating: you at the top, a search box, the online group with Hollr and a rotating status line, and agents at work with gradient progress bars.",
  el('<div class="buddy-wrap">').replace(' id="smsg"', "").replace(' id="footChat"', ""), { js: true });

add("signup", "Sign-up panel", "The closing panel: a dark gradient pane with drifting orbs inside a turning conic ring, a framed heading, Neuton lede, a frosted email field joined to the brand button, and green-tick reassurances.",
  `<div class="mega">
<div class="mega-ring">
<div class="mega-in">
<div class="mega-orb o1" aria-hidden="true"></div>
<div class="mega-orb o2" aria-hidden="true"></div>
<div class="mega-top" style="grid-template-columns: minmax(0, 1fr)">
${el('<div class="mega-cta">').replace(' id="signup"', "").replace(' id="email"', "").replace('for="email"', "").replace(' id="ok"', "")}
</div>
</div>
</div>
</div>`, { js: true });

add("toast", "Toast", "A sign-in notification in the old style: a small window with a blue titlebar and a close key, the brand mark and a link. Close it and it signs in again.",
  `<div style="overflow: hidden; padding: 4px 0 30px">
${el('<div class="toast" id="toast" role="status">')
    .replace('<div class="toast" id="toast" role="status">', '<div class="toast show" role="status" style="position: relative; right: auto; bottom: auto; z-index: auto">')
    .replace(' id="toastX"', "").replace(' id="toastGo"', "")}
</div>`, { js: true });

add("footer", "Footer", "The mega footer's lower half: the brand with its pill and a Neuton blurb, gold uppercase column heads with links that underline in gold → magenta, the giant outlined wordmark, and a statusbar strip with All systems online and Back to top.",
  `<div class="mega">
<div class="mega-ring">
<div class="mega-in">
${el('<div class="mega-links">')}
${el('<div class="mega-word" aria-hidden="true">')}
${el('<div class="mega-bar">').replace(' id="totop"', "")}
</div>
</div>
</div>`);

/* ── 5. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* Hollr components: the Chat/Agent switch, tool chips, Nudge and Run in the
     messenger window; the help chat and its search; the toast; the buddy
     status line; the step windows replaying when they scroll into view. */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function placePill(seg) {
    var on = seg.querySelector('button.hl-on'), pill = seg.querySelector('.hl-seg-pill');
    if (!on || !pill || !on.offsetWidth) return;
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (on.offsetLeft - 3) + 'px)';
    seg.setAttribute('data-hl-placed', '');
  }
  function placeAll() {
    var s = document.querySelectorAll('.hl-seg');
    for (var i = 0; i < s.length; i++) placePill(s[i]);
  }
  placeAll();
  addEventListener('load', placeAll);
  addEventListener('resize', placeAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAll);

  function openFq(fq, btn) {
    var wasOpen = fq.classList.contains('hl-open');
    var open = fq.parentNode.querySelectorAll('.hl-fq.hl-open');
    for (var i = 0; i < open.length; i++) {
      open[i].classList.remove('hl-open', 'hl-thinking');
      open[i].querySelector('.hl-fq-q').setAttribute('aria-expanded', 'false');
    }
    if (wasOpen) return;
    fq.classList.add('hl-open');
    btn.setAttribute('aria-expanded', 'true');
    if (reduce) return;
    fq.classList.add('hl-thinking');
    clearTimeout(fq._t);
    fq._t = setTimeout(function () { fq.classList.remove('hl-thinking'); }, 750);
  }

  document.addEventListener('click', function (e) {
    var t = e.target, b;
    if (!t.closest) return;
    if ((b = t.closest('.hl-seg button'))) {
      var seg = b.closest('.hl-seg'), all = seg.querySelectorAll('button');
      for (var i = 0; i < all.length; i++) {
        all[i].classList.toggle('hl-on', all[i] === b);
        all[i].setAttribute('aria-checked', all[i] === b ? 'true' : 'false');
      }
      placePill(seg);
      var w = seg.closest('.hl-win'), lbl = w && w.querySelector('.hl-run-label');
      if (lbl) lbl.textContent = b.getAttribute('data-hl-mode') === 'chat' ? 'Send' : 'Run';
      return;
    }
    if ((b = t.closest('.hl-tchip'))) {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      return;
    }
    if ((b = t.closest('.hl-nudge'))) {
      var win = b.closest('.hl-win');
      if (win) { win.classList.remove('hl-shake'); void win.offsetWidth; win.classList.add('hl-shake'); }
      return;
    }
    if ((b = t.closest('.hl-run'))) {
      e.preventDefault();
      var ring = b.closest('.hl-ring');
      if (!ring) return;
      var rw = ring.querySelector('.hl-win');
      ring.classList.add('hl-running');
      if (rw) rw.classList.add('hl-agentic');
      clearTimeout(ring._t);
      ring._t = setTimeout(function () { ring.classList.remove('hl-running'); }, 2600);
      return;
    }
    if ((b = t.closest('.hl-fq-q'))) { openFq(b.closest('.hl-fq'), b); return; }
    if ((b = t.closest('.hl-toast-h button'))) {
      var toast = b.closest('.hl-toast');
      toast.classList.remove('hl-show');
      setTimeout(function () { toast.classList.add('hl-show'); }, 2400);
      return;
    }
  });

  /* Forms in the components never leave the page; the sign-up answers in its .hl-ok line */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f.closest || !f.closest('.hl')) return;
    e.preventDefault();
    var ok = f.parentNode.querySelector('.hl-ok'), em = f.querySelector('input[type="email"]');
    if (!ok || !em) return;
    if (!em.value || !em.checkValidity()) { ok.textContent = 'Please enter a valid email address.'; em.focus(); return; }
    ok.textContent = "You're on the list. Hollr will ping you soon.";
    em.value = '';
  });

  /* Help-chat search: filter the questions by their data-hl-k keywords */
  document.addEventListener('input', function (e) {
    var input = e.target;
    if (!input.closest || !input.closest('.hl-faq-search')) return;
    var q = input.value.trim().toLowerCase(), words = q ? q.split(' ') : [], shown = 0;
    var fqs = document.querySelectorAll('.hl-fq');
    for (var i = 0; i < fqs.length; i++) {
      var k = fqs[i].getAttribute('data-hl-k') || '', hit = true;
      for (var j = 0; j < words.length; j++) if (words[j] && k.indexOf(words[j]) < 0) hit = false;
      fqs[i].hidden = !hit;
      if (hit) shown++;
    }
    var counts = document.querySelectorAll('.hl-faq-count');
    for (var c = 0; c < counts.length; c++) counts[c].textContent = shown + (shown === 1 ? ' topic' : ' topics');
  });

  /* Buddy list: Hollr's status line changes every few seconds */
  var statuses = ['Planning your weekend…', 'Summarizing a 40-page PDF…', 'Drafting an email — not sent yet', 'Free to chat — say hi!', 'Holding a calendar slot for you…'], si = 0;
  if (!reduce) setInterval(function () {
    var lines = document.querySelectorAll('.hl-smsg');
    if (!lines.length) return;
    si = (si + 1) % statuses.length;
    for (var i = 0; i < lines.length; i++) lines[i].classList.add('hl-out');
    setTimeout(function () {
      for (var i = 0; i < lines.length; i++) { lines[i].textContent = statuses[si]; lines[i].classList.remove('hl-out'); }
    }, 350);
  }, 2800);

  /* Step windows play their little scene each time they come into view */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var c = en.target;
        // They play once on load; replay only when a card comes back after leaving the view
        if (!en.isIntersecting) { if (c._hlSeen) c._hlLeft = true; return; }
        c._hlSeen = true;
        if (!c._hlLeft) return;
        c._hlLeft = false;
        c.classList.remove('hl-on'); void c.offsetWidth; c.classList.add('hl-on');
      });
    }, { threshold: 0.45 });
    var cards = document.querySelectorAll('.hl-scard');
    for (var i = 0; i < cards.length; i++) io.observe(cards[i]);
  }
})();`;

/* ── 6. Shared SVG defs: the brand gradient the logo marks fill with ── */
const defs = `<svg id="hl-defs" width="0" height="0" aria-hidden="true" style="position: absolute">
  <defs><linearGradient id="hl-lg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a2fc4"/><stop offset="1" stop-color="#c0169f"/></linearGradient></defs>
</svg>`;

/* ── 7. The specimen page ────────────────────────────────────────────── */
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Neuton:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">';
const CHROME = `
body{margin:0;background:var(--hl-ink-2)}
.hl{min-height:100vh;background:radial-gradient(1200px 700px at 80% -10%,#3d2b8f 0%,transparent 60%),radial-gradient(900px 600px at -10% 30%,#23306f 0%,transparent 60%),linear-gradient(180deg,var(--hl-ink) 0,var(--hl-ink-2) 900px)}
.sp-top{padding:28px 0 64px;border-bottom:1px solid rgba(171,176,198,.22)}
.sp-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;margin-bottom:44px;padding:8px 14px;border-radius:var(--hl-radius-btn);background:var(--hl-status);border:1px solid var(--hl-frame);color:var(--hl-status-ink);font-size:11px;font-weight:700}
.sp-meta i{display:inline-block;width:8px;height:8px;margin-right:7px;border-radius:50%;background:var(--hl-ok)}
.sp-swatches{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:28px}
.sp-swatches i{display:block;width:32px;height:32px;border-radius:var(--hl-radius-btn);border:1px solid rgba(255,255,255,.35);box-shadow:0 1px 0 rgba(255,255,255,.4) inset}
.sp-main{max-width:var(--hl-page-max);margin:0 auto;padding:8px var(--hl-gutter) 120px}
.sp-sec{padding:64px 0;border-bottom:1px solid rgba(171,176,198,.18);scroll-margin-top:12px}
.sp-head{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);gap:8px 40px;margin-bottom:34px}
.sp-head h2{max-width:none;margin:12px 0 0;font-family:var(--hl-font-display);font-weight:700;font-size:30px;line-height:1.05;letter-spacing:-.3px;text-transform:uppercase}
.sp-note{margin:0;max-width:640px;font-family:var(--hl-font-copy);font-size:18px;line-height:1.55;color:var(--hl-win)}
.sp-demo{position:relative}
@media (max-width:720px){.sp-head{grid-template-columns:minmax(0,1fr)}.sp-top{padding-bottom:44px}}
`;
const HERO = `
<header class="sp-top hl-hero">
<div class="hl-wrap">
<div class="sp-meta"><span><i></i>InstaLanding design system</span><span>hollr@${VERSION} · ${C.length} components</span></div>
<div class="hl-hero-head">
<div class="hl-ait-wrap"><h1 class="hl-ait"><span class="hl-ait-kick hl-kick-badge"><span class="hl-kb-new">Design system</span><span class="hl-kb-t">Hollr · your AI contact</span></span><span class="hl-ait-big">A messenger window that gets things done.</span></h1></div>
<p class="hl-lede">A night-indigo page and pale messenger chrome: glossy two-tone titlebars, bevelled classic buttons, a purple-to-magenta brand gradient with a gold edge and windows inside turning conic rings. Oswald display, Neuton copy, Verdana and Tahoma for the UI. Extracted from the Retro Messenger Agent Page.</p>
<div class="sp-swatches" aria-label="Core colours">${["ink-2", "ink", "win", "win-2", "p1", "p2", "gold", "online", "blue"].map((t) => `<i title="--hl-${t}" style="background:var(--hl-${t})"></i>`).join("")}</div>
</div>
</div>
</header>`;

const specimen = renderSpecimen({
  name: "Hollr",
  slug: "hollr",
  version: VERSION,
  prefix: P,
  rootClass: "hl",
  labelClass: "hl-eyebrow",
  script: "scripts/systems/hollr.mjs",
  source: SOURCE,
  metaDescription: "The Hollr design system: tokens and working components extracted from the Retro Messenger Agent landing page.",
  defsNote: "the brand gradient (#hl-lg1) the speech-bubble logo marks are filled with",
  jsNote: "runs the Chat/Agent switch, tool chips, Nudge and Run, the help chat and its search, the toast, the buddy status line and the step windows' replay",
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
writeSystem({ slug: "hollr", prefix: P, rootClass: "hl", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "win", "titlebar", "card", "fq", "buddy", "toast", "scard", "msg", "task", "ait", "ring", "nav"] });
