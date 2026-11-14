// Extracts the KYMA design system from its landing page.
//
//   node scripts/systems/kyma.mjs
//
// Reads public/demos/kyma-ai-automation-agency.html (never edits it) and writes
// public/systems/kyma/ (specimen.html, tokens.css, kyma.css) through the shared
// pipeline in lib.mjs. The page keeps one flat, minified <style>; the system
// keeps it whole but for the document shell, the scroll reveals (components
// ship in their settled state; only the masked headline lines keep their
// block layout) and the sections it does not carry (the client marquee, the
// who-we-are stats, testimonials, team and hiring). The blend header and the
// menu overlay are absolute in the system, so they stay inside whatever holds
// them; a page pins them with position: fixed, as the specimen does. What the
// page's script writes at boot is written here at build time with the page's
// own code: the seeded SVG portraits, the hero pipeline's nodes and paths, the
// case-study rings and bars, the integrations tiles, the FAQ rows and the
// article and crystal pictures. What it does on input stays in the component
// script: the clock, the menu, the playable pipeline, the pain chips flying out
// on scroll, the ROI calculator, the process ruler, the billing switch, the FAQ
// and the two forms' simulated states.
import { readPage, sliceEl, normalizer, renderSpecimen, writeSystem } from "./lib.mjs";

const SOURCE = "public/demos/kyma-ai-automation-agency.html";
const { page, BODY, css: pageCss } = readPage(SOURCE);
const VERSION = "1.0.0";
// The page loads two stylesheets; the system asks for all three families in one
const FONTS = '<link href="https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400..800&family=Inter+Tight:wght@400;500;600;700;800&family=Roboto+Mono:wght@400;500;600&display=swap" rel="stylesheet">';
const GRAIN = /\.grain\{[^}]*?background-image:(url\("data:image\/svg\+xml,[^"]+"\));/.exec(pageCss)?.[1];
if (!GRAIN) throw new Error("grain not found");

/* ── 1. Tokens ─────────────────────────────────────────────────────────
   Every value comes from the page's :root and rules. One declaration per
   line; the group comments are what the SYSTEMS board lays its panels out by. */
const TOKENS = `/* InstaLanding design system · KYMA · kyma@${VERSION}
   Extracted from https://instalanding.ai/demos/kyma-ai-automation-agency.html
   Fonts (Google Fonts): TASA Orbiter 400-800 (display and copy, Inter Tight as its fallback), Roboto Mono 400-600 (labels, data, kickers) */
:root {
  /* Color · core */
  --ky-ink: #050505;
  --ky-ink2: #0F0F11;
  --ky-panel: #1C1E19;
  --ky-paper: #F4F4E8;
  --ky-paper2: #FFFFED;
  --ky-lime: #D1FF00;
  --ky-lime-hi: #E3FF58;

  /* Color · greys */
  --ky-g1: #686868;
  --ky-g2: #BCBCBC;
  --ky-g3: #3D3D3D;
  --ky-g4: #999999;
  --ky-line: rgba(156, 156, 156, 0.18);
  --ky-lime-wash: rgba(209, 255, 0, 0.03);

  /* Color · screens & signals */
  --ky-screen: #0B0C0A;
  --ky-screen-line: #1D1F1B;
  --ky-art: #060706;
  --ky-avatar: #222222;
  --ky-thumb: #1F8BFF;
  --ky-error: #FF4D2E;

  /* Type · families */
  --ky-font-head: "TASA Orbiter", "Inter Tight", Inter, "Helvetica Neue", Arial, sans-serif;
  --ky-font-mono: "Roboto Mono", ui-monospace, Menlo, monospace;

  /* Type · scale */
  --ky-ghost: clamp(150px, 23vw, 330px);
  --ky-giant: clamp(110px, 15vw, 220px);
  --ky-menu: clamp(44px, 8vw, 110px);
  --ky-display: clamp(40px, 4.9vw, 74px);
  --ky-h2: clamp(40px, 4vw, 64px);
  --ky-total: clamp(40px, 4.4vw, 64px);
  --ky-h2-sm: clamp(36px, 3.8vw, 56px);
  --ky-kpi: clamp(40px, 3.6vw, 56px);
  --ky-h3: clamp(28px, 2.6vw, 38px);
  --ky-lead: 19px;
  --ky-text: 14px;
  --ky-small: 13px;
  --ky-ui: 12px;
  --ky-label: 11px;
  --ky-micro: 10px;
  --ky-tiny: 9px;

  /* Shape · radii */
  --ky-round: 50%;

  /* Shape · borders */
  --ky-hair: 1px;
  --ky-rule: 2px;
  --ky-focus: 2px;

  /* Depth · glow and grain */
  --ky-glow: 0 0 8px var(--ky-lime);
  --ky-ring: 0 0 0 2px var(--ky-ink);
  --ky-grain: ${GRAIN};

  /* Motion · easing */
  --ky-ease-wipe: cubic-bezier(0.7, 0, 0.2, 1);
  --ky-ease-out: cubic-bezier(0.2, 0.7, 0.2, 1);

  /* Motion · durations */
  --ky-dur-quick: 250ms;
  --ky-dur-hover: 300ms;
  --ky-dur-nudge: 350ms;
  --ky-dur-soft: 400ms;
  --ky-dur-fill: 450ms;
  --ky-dur-slide: 600ms;
  --ky-dur-wipe: 700ms;
  --ky-dur-zoom: 1.2s;

  /* Space · layout */
  --ky-max: 1360px;
  --ky-pad: 40px;
  --ky-bar: 60px;
  --ky-sec: 130px;
  --ky-sec-s: 110px;
}`;

/* ── 2. Normalisation ────────────────────────────────────────────────── */
// The page's custom properties take their system names (--head -> --ky-font-head);
// local ones (--p on the sliders, --hl on the pain highlight, --bg on the bolt mark) move under ky- too
const VARS = { head: "font-head", mono: "font-mono", bg: "mark-bg" };
const renameVars = (s) => s.replace(/(?<![\w-])--([a-zA-Z][\w-]*)/g, (m, n) => (n.startsWith("ky-") ? m : `--ky-${VARS[n] ?? n}`));
const HEX = {
  "#050505": "ink", "#0f0f11": "ink2", "#1c1e19": "panel", "#f4f4e8": "paper", "#ffffed": "paper2", "#d1ff00": "lime",
  "#e3ff58": "lime-hi", "#686868": "g1", "#bcbcbc": "g2", "#3d3d3d": "g3", "#999": "g4", "#0b0c0a": "screen",
  "#1d1f1b": "screen-line", "#060706": "art", "#222": "avatar", "#1f8bff": "thumb", "#ff4d2e": "error",
};
const esc = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const val = (v, tok) => [new RegExp(esc(v), "g"), `var(--ky-${tok})`];
const fs_ = (v, tok) => [new RegExp(`font-size:${esc(v)}(?=[;}])`, "g"), `font-size:var(--ky-${tok})`];
// Durations only inside transition declarations (the blink, pulse and spin loops keep their own)
const DUR = { ".25s": "quick", ".3s": "hover", ".35s": "nudge", ".4s": "soft", ".45s": "fill", ".6s": "slide", ".7s": "wipe", "1.2s": "zoom" };
const durations = (s) => s.replace(/transition:[^;}]*/g, (decl) => decl.replace(/(?<![\d.])(1\.2s|\.\d+s)/g, (d) => (DUR[d] ? `var(--ky-dur-${DUR[d]})` : d)));
const SWAPS = [
  val("clamp(150px,23vw,330px)", "ghost"), val("clamp(110px,15vw,220px)", "giant"), val("clamp(44px,8vw,110px)", "menu"),
  val("clamp(40px,4.9vw,74px)", "display"), val("clamp(40px,4vw,64px)", "h2"), val("clamp(40px,4.4vw,64px)", "total"),
  val("clamp(36px,3.8vw,56px)", "h2-sm"), val("clamp(40px,3.6vw,56px)", "kpi"), val("clamp(28px,2.6vw,38px)", "h3"),
  fs_("19px", "lead"), fs_("14px", "text"), fs_("13px", "small"), fs_("12px", "ui"), fs_("11px", "label"), fs_("10px", "micro"), fs_("9px", "tiny"),
  [/border-radius:50%/g, "border-radius:var(--ky-round)"],
  [/outline:2px solid/g, "outline:var(--ky-focus) solid"],
  [/(?<![\d.])2px solid/g, "var(--ky-rule) solid"],
  [/(?<![\d.])1px solid/g, "var(--ky-hair) solid"],
  val("rgba(156,156,156,.18)", "line"), val("rgba(209,255,0,.03)", "lime-wash"),
  [/box-shadow:0 0 8px var\(--ky-lime\)/g, "box-shadow:var(--ky-glow)"],
  [/box-shadow:0 0 0 2px var\(--ky-ink\)/g, "box-shadow:var(--ky-ring)"],
  val("cubic-bezier(.7,0,.2,1)", "ease-wipe"), val("cubic-bezier(.2,.7,.2,1)", "ease-out"),
  [/padding:130px/g, "padding:var(--ky-sec)"], [/padding:110px/g, "padding:var(--ky-sec-s)"],
  [/height:60px/g, "height:var(--ky-bar)"],
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
// Page-only parts: the document shell, the scroll reveals, and the sections the system doesn't carry
const DROP = /^(html|\.js\s.*|\.(logos|marq|who|quote|stats?|testi|feature|rating|cards|limecard|tcard|team|teamfoot|members?|socials|mission|hiring)\b.*)$/;
const DROP_KEYFRAMES = /^@keyframes (marq|scan)\b/;
function scopeSelector(sel, inMedia) {
  if (sel === ":root") return inMedia ? ".ky" : null;
  if (sel === "*") return ":where(.ky, .ky *)";
  if (sel === "body") return ".ky";
  return sel;
}
function keep(css, inMedia = false) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) {
      const inner = keep(body, true);
      return inner ? `${prelude}{\n${inner}\n}` : "";
    }
    if (prelude.startsWith("@keyframes")) return DROP_KEYFRAMES.test(prelude) ? "" : rule;
    const parts = splitSelectors(prelude)
      .filter((s) => !DROP.test(s))
      .map((s) => scopeSelector(s, inMedia))
      .filter(Boolean);
    return parts.length ? `${parts.join(",")}{${body}}` : "";
  }).filter(Boolean).join("\n");
}
const pageRules = pageCss
  .replace(/\/\*[\s\S]*?\*\//g, "")
  // The headline lines keep their block layout without the reveal (the page only sets it under .js)
  .replace(".js .lines .ln{display:block;overflow:hidden}", ".lines .ln{display:block;overflow:hidden}")
  // The body becomes the root: clip, not hidden, so the root isn't a scroll box and the pain section can still stick
  .replace(/(body\{[^}]*?)overflow-x:hidden/, "$1overflow-x:clip")
  // The header and the menu overlay sit inside whatever holds them; a page pins them with position: fixed
  .replace(".top{position:fixed;", ".top{position:absolute;")
  .replace(".menu{position:fixed;", ".menu{position:absolute;")
  .replace(`background-image:${GRAIN};`, "background-image:var(--grain);");
if (pageRules.includes("data:image")) throw new Error("grain left in the rules");
const base = renameVars(keep(pageRules));

/* ── 4. What the page's script writes at boot, written here with its own code ── */
const SCRIPT = page.slice(page.lastIndexOf("<script>"), page.lastIndexOf("</script>"));
const between = (a, b) => {
  const i = SCRIPT.indexOf(a), j = SCRIPT.indexOf(b, i);
  if (i < 0 || j < 0) throw new Error("page script marker not found: " + (i < 0 ? a : b));
  return SCRIPT.slice(i, j);
};
// A stand-in for the page's $ and document: every hook it writes into is a plain { innerHTML } box
const fakeDom = () => {
  const store = {};
  const $ = (sel) => (store[sel] ??= { innerHTML: "", kids: [], appendChild(k) { this.kids.push(k); } });
  const document = { createElement: () => ({ className: "", innerHTML: "", textContent: "" }) };
  return { store, $, document };
};
const MULBERRY = between("function mulberry", "\n");
const NS = "const NS='http://www.w3.org/2000/svg';";
const portrait = new Function(`${NS}\n${MULBERRY}\n${between("const tones=", "$$('[data-avatars]')")}\nreturn portrait;`)();
function run(code) {
  const dom = fakeDom();
  new Function("$", "document", `${NS}\n${MULBERRY}\n${code}`)(dom.$, dom.document);
  return dom.store;
}
const FLOW = run(between("const flow=$('#flow');", "const pk=$('#pk',flow)"))["#flow"].innerHTML;
const CASE = run(between("/* ---------- case study art", "/* ---------- integrations grid"));
const TILES = run(between("const tools=[", "/* ---------- team"))["#igrid"].kids
  .map((d) => `<div class="${d.className}">${d.innerHTML || d.textContent}</div>`).join("");
const FAQ = run(between("const faqs=[", "$$('.qi',qa)"))["#qa"].innerHTML;
const ART = run(between("/* ---------- article artwork", "/* ---------- forms"));

const fill = (html, re, inner) => {
  if (!re.test(html)) throw new Error("fill target not found: " + re);
  return html.replace(re, (_, open, close) => open + inner + close);
};
let DOM = page.slice(BODY);
DOM = fill(DOM, /(<svg class="flow" id="flow"[^>]*>)(<\/svg>)/, FLOW);
DOM = fill(DOM, /(<g id="rings"[^>]*>)(<\/g>)/, CASE["#rings"].innerHTML);
DOM = fill(DOM, /(<g id="caseBars">)(<\/g>)/, CASE["#caseBars"].innerHTML);
DOM = fill(DOM, /(<div class="qa" id="qa">)(<\/div>)/, FAQ);
for (const id of ["art1", "art2", "art3", "crystal"]) DOM = fill(DOM, new RegExp(`(<svg id="${id}"[^>]*>)(</svg>)`), ART["#" + id].innerHTML);
DOM = DOM.replace(/(<div class="igrid" id="igrid">[\s\S]*?<\/h2><\/div>)/, `$1${TILES}`);
// Avatars: the page's own seeded portraits, stack by stack
DOM = DOM.replace(/<div class="stack( rv)?" data-avatars="([\d,]+)"(?: data-more="([^"]+)")?><\/div>/g, (_, rv, seeds, more) =>
  `<div class="stack${rv || ""}">${seeds.split(",").map((s) => `<span class="av">${portrait(+s)}</span>`).join("")}${more ? `<span class="more">${more}</span>` : ""}</div>`);
DOM = DOM.replace(/<span class="av" data-seed="(\d+)"><\/span>/g, (_, s) => `<span class="av">${portrait(+s)}</span>`);

/* ── 5. Markup ───────────────────────────────────────────────────────── */
// The page's section anchors become "#"; the script's hooks become classes or data
// attributes; every other id (SVG symbols, gradients, filters, form fields) moves under ky-
const ANCHORS = "home|about|pain|roi|services|process|case|testimonials|integrations|team|pricing|faq|articles|contact";
const HOOKS = "openMenu|closeMenu|screen|flow|log|playBtn|playIcon|tlabel|prog|ovh|total|rulerOn|weeks|optM|optA|billing|save|plans|qa|igrid|auditForm|newsForm|marq|members|hirePat|after|art1|art2|art3|crystal|rings|caseBars";
// fill and stroke attributes in the token colours become styles, so drawings follow the palette
const HEX_ATTR = new RegExp(` (fill|stroke)="(${Object.keys(HEX).join("|")})"(?=[\\s/>])`, "gi");
const paintStyles = (html) => html.replace(/<([a-zA-Z]+)(\s[^<>]*?)?(\/?)>/g, (m, tag, attrs = "", slash) => {
  const paints = [];
  let rest = attrs.replace(HEX_ATTR, (_, prop, hex) => { paints.push(`${prop}:${hex}`); return ""; });
  if (!paints.length) return m;
  if (/ style="/.test(rest)) rest = rest.replace(/ style="([^"]*)"/, (_, css) => ` style="${css.replace(/;?$/, ";")}${paints.join(";")}"`);
  else rest += ` style="${paints.join(";")}"`;
  return `<${tag}${rest}${slash}>`;
});
const unhook = (html) => paintStyles(html
  .replace(/ data-section="[^"]*"/g, "")
  .replace(/ data-(count|suffix|prefix|dec|rows)="[^"]*"/g, "")
  .replace(new RegExp(` id="(${ANCHORS})"`, "g"), "")
  .replace(new RegExp(` href="#(${ANCHORS})"`, "g"), ' href="#"')
  .replace(/ id="clock"/g, " data-clock")
  .replace(/ id="(emp|hrs|cost)"/g, ' data-roi="$1"')
  .replace(/ id="o-(emp|hrs|cost)"/g, ' data-out="$1"')
  // the pipeline's own ids: edges, nodes and the counters the script writes into
  .replace(/ id="e(\d)"/g, ' data-e="$1"').replace(/ id="n(\d)"/g, ' data-n="$1"')
  .replace(/ id="pk"/g, " data-pk").replace(/ id="pkB"/g, " data-pkb").replace(/ id="cnt"/g, " data-cnt").replace(/ id="hrsSaved"/g, " data-saved")
  .replace(new RegExp(` id="(${HOOKS})"`, "g"), "")
  .replace(/ aria-controls="menu"/g, ' aria-controls="ky-menu"')
  .replace(/ id="(?!ky-)([^"]+)"/g, ' id="ky-$1"')
  .replace(/ for="(?!ky-)([^"]+)"/g, ' for="ky-$1"')
  .replace(/ href="#(?!ky-)([\w-]+)"/g, ' href="#ky-$1"')
  .replace(/url\(#(?!ky-)([\w-]+)\)/g, "url(#ky-$1)")
  // The page's load-in sequence stays with the page
  .replace(/ class="([^"]*)"/g, (_, l) => ` class="${l.split(/\s+/).filter((c) => c && !/^(rv|d[1-4])$/.test(c)).join(" ")}"`)
  .replace(/ class=""/g, "")
  .replace(/^  /gm, ""));
const el = (marker) => sliceEl(DOM, marker).html;
const piece = (html, marker) => sliceEl(html, marker).html;
const pad = (style, html) => html.replace(/^(<section [^>]*?)>/, `$1 style="${style}">`);

const C = [];
const add = (id, label, note, markup, opts = {}) => C.push({ id, label, note, raw: unhook(markup), ...opts });

const HEADER = el('<header class="top"');
const MENU = el('<div class="menu" id="menu"');
const HERO = el('<section class="hero dark"');
const PAIN = el('<section class="pain"');
const ROI = el('<section class="roi"');
const SERVICES = el('<section class="services dark"');
const PROCESS = el('<section class="process"');
const CASESEC = el('<section class="case dark"');
const INTEG = el('<section class="integ dark"');
const PRICING = el('<section class="pricing dark"');
const FAQSEC = el('<section class="faq"');
const ARTICLES = el('<section class="articles"');
const CONTACT = el('<section class="cta2 dark"');
const FOOTER = el("<footer ");
const SUBMIT = piece(CONTACT, '<button class="btn" type="submit"');

add("nav", "Blend header & menu", "A four-column bar on the grid: the mirrored-K wordmark, two mono lines (the second carries a live Los Angeles clock) and a paper MENU button with three bars. It blends with mix-blend-mode: difference, so the same paper text reads dark on paper and light on black. MENU wipes a black overlay down over --ky-dur-wipe (clip-path, --ky-ease-wipe) with numbered links in huge capitals that turn lime and step right on hover; a lime CLOSE, a link or Escape wipes it back, and it leaves the tab order once closed.",
  `<div class="nav-stage">\n${HEADER}\n${MENU}\n</div>`, { js: true, defs: false });

add("buttons", "Buttons, links & switches", "One button: a panel-dark bar with a 2px lime underline, an uppercase label and the pixel-arrow glyph, which a lime fill wipes up through on hover (--ky-dur-fill, --ky-ease-wipe); it also carries loading, done and error states. Mono links end in a 12px square arrow; the price link hangs off a lime rule. Tags are panel chips, the yes/no pair and the billing switch are square, and the lime square moves on --ky-dur-hover.",
  `<div class="dark demo-pad">
<div class="demo-row">${piece(HERO, '<a href="#services" class="btn"')}${SUBMIT.replace('type="submit"', 'type="button" data-state="done"').replace(">Book my free audit<", ">Thank you<")}${SUBMIT.replace('type="submit"', 'type="button" data-state="error"').replace(">Book my free audit<", ">Error, try again<")}</div>
<div class="demo-row">${piece(SERVICES, '<div class="price-link')}${piece(ROI, '<div class="yn"')}${piece(PRICING, '<div class="toggle')}</div>
<div class="demo-row">${piece(SERVICES, '<div class="tags">')}</div>
</div>
<div class="demo-pad">
<div class="demo-row">${piece(ARTICLES, '<a href="#articles" class="link all')}${piece(PROCESS, '<div class="pcard')}</div>
</div>`, { js: true, defs: true });

add("type", "Kickers & display type", "Every section opens on a mono kicker: a grey [index], the label (lime on black) and a blinking cursor. Headings are TASA Orbiter 700 in capitals at -.035em and line-height .95, set in masked lines (.ky-lines > .ky-ln); a grey .ky-muted run starts a two-tone heading. Copy is TASA Orbiter 600 at --ky-lead in grey; Roboto Mono carries the column heads, captions and every label.",
  `${pad("padding:72px 0 64px", PROCESS.replace(/<div class="ruler">[\s\S]*$/, "</div></section>"))}
${pad("padding:72px 0 0", SERVICES.replace(/<div class="svc rv">[\s\S]*$/, "</div></section>"))}`, { defs: true });

add("hero", "Hero & live pipeline", "A black hero on the four-column grid: the kicker, a two-line display headline with lime [bracketed] figures, a grey lead and a full-column button, a portrait stack with lime stars, and a giant grey KYMA ghost word bleeding off the bottom. The demo card in the fourth column is a playable automation: packets ride six glass nodes along dashed SVG paths, nodes flash lime as they land, tasks and hours count up and a two-line log ticks; clicking the screen (or Enter / Space) runs a 90-second demo at 2.4x with a lime progress bar.",
  HERO, { js: true, defs: true });

add("pain", "Pain-point scatter", "A sticky full-height frame inside a 260vh section: a centred display heading, eight black mono chips with lime crosses placed at fractions of the frame (data-ky-x, data-ky-y) that fly outward along their own angle and spin away as you scroll, and an answer line a lime highlight then sweeps across (--ky-hl).",
  PAIN, { js: true });

add("roi", "ROI calculator", "A two-column black calculator in the middle of the grid: three range sliders with mono captions and live outputs (the track fills lime to --ky-p, the thumb is the one blue on the page), a square yes/no overhead toggle, and the annual cost in a big lime figure that eases to employees x hours x rate x 52 (x1.3 with overhead). A grey footnote, a pitch line, a portrait and a lets-get-started button sit under it.",
  ROI, { js: true, defs: true });

add("services", "Indexed services table", "A black table on a 1 / 1 / 2 grid under mono column heads: a lime index number, a mono service name with a line icon, an uppercase display claim and panel tag chips, rows ruled by hairlines that wash faintly lime on hover. It closes on a two-tone heading and the lime-ruled pricing link.",
  SERVICES, { defs: true });

add("process", "Six-week process ruler", "A ruler (fine 16px ticks under 80px majors, drawn with two repeating gradients) with a lime marker over four week steps that stair-step down the columns. The active step turns paper-light with a lime underline and a ringed lime dot; steps auto-advance every 3.2s, follow the pointer and take Enter / Space. Post-launch cards follow, three to a row.",
  PROCESS, { js: true });

add("case", "Case study", "A black two-up: the kicker and date, a display headline, a hairline meta table with mono icons, two big KPI figures split by a hairline and the button; beside it a generated picture (concentric lime ellipses turning slowly over breathing lime bars, on --ky-art) with the client mark.",
  CASESEC, { defs: true });

add("integrations", "Integrations grid", "A black grid of 84px tiles, four across, ruled by hairlines: paper tool marks that scale up and reveal a mono name on a panel fill when hovered, empty tiles left as rhythm, a lime +40 MORE tile, and a black title card spanning the middle two columns.",
  INTEG);

add("pricing", "Pricing with billing toggle", "Three plans on black, ruled by hairlines and aligned to the bottom: the middle one in --ky-ink2 with a lime POPULAR flag and a taller head. Each has a display name, mono copy, a tabular price that eases to 80% when the square switch goes annual (with a lime BILLED ANNUALLY note), mono check rows, and a footer of grey stripes beside the button.",
  PRICING, { js: true, defs: true });

add("faq", "Numbered FAQ", "A hairline accordion in the last three columns: each row a lime numbered square, the question in TASA Orbiter 600 and a plus that turns to a cross; one row is open at a time, on a paper-light fill, the answer opening on a grid-row transition. A paper-light ask strip with a quote mark, a portrait and a square-arrow link closes it.",
  FAQSEC, { js: true, defs: true });

add("articles", "Article cards", "Three posts on a 2 / 1 / 1 grid split by hairlines: a black mono date-and-topic bar, a generated picture that slowly zooms on hover, a byline, an uppercase display title and grey copy.",
  ARTICLES, { defs: true });

add("contact", "Audit form", "A black two-up: on the left the kicker, a display headline, mono check rows in panel squares, a generated lime crystal and a signed quote; on the right panel fields with a hairline underline that turns lime on focus, a phone prefix, square spend chips (radio inputs), a square consent box and the button. Submitting validates in place: empty fields underline in --ky-error and the button reads Error, then Loading, then Thank you. Nothing is sent.",
  CONTACT, { js: true, defs: true });

add("footer", "Footer & giant wordmark", "A paper footer on the grid: a newsletter form, the wordmark and address, mono nav links whose capitals roll up to a grey copy on hover, a lime email chip, numbered socials and legal lists, and a giant mirrored-K KYMA bleeding off the bottom.",
  FOOTER, { js: true, defs: true });

/* ── 6. Prefixing ────────────────────────────────────────────────────── */
// A host that sets a face on heading tags (0,0,1) would beat inheritance: match it, and every class (0,1,0) stays above it.
// (Also the first rule of the block, so it never opens on an @media the board's parsers could misread)
const HEADINGS = `h1, h2, h3, h4, h5, h6 { font-family: inherit; }`;
// Demo surfaces for the specimen and the board, in the system's own terms
const EXTRA = `
.demo-pad{padding:48px var(--pad);display:flex;flex-direction:column;gap:28px}
.demo-row{display:flex;flex-wrap:wrap;align-items:flex-start;gap:20px 28px}
.demo-row .btn{width:260px}
.demo-row .price-link{width:260px}
.demo-row .pcard{max-width:320px}
.nav-stage{position:relative;height:var(--bar);overflow:hidden;background:linear-gradient(90deg,var(--ink) 50%,var(--paper) 50%);transition:height var(--dur-wipe) var(--ease-wipe)}
.nav-stage:has(.menu.open){height:640px}`;
const CLASSES = new Set();
const allCss = HEADINGS + base + EXTRA;
for (const [, sel] of allCss.replace(/url\([^)]*\)/g, "").matchAll(/([^{};]+)\{/g)) {
  if (sel.trim().startsWith("@")) continue;
  for (const m of sel.matchAll(/\.([a-zA-Z][\w-]*)/g)) if (m[1] !== "ky" && !m[1].startsWith("ky-")) CLASSES.add(m[1]);
}
for (const c of C) for (const m of c.raw.matchAll(/ class="([^"]*)"/g)) for (const n of m[1].split(/\s+/)) if (n && !n.startsWith("ky-")) CLASSES.add(n);
// Set by the component script, not present in the markup
["open", "on", "annualon"].forEach((c) => CLASSES.add(c));
const KEYFRAMES = ["blink", "pulse", "spin", "grain"];
const ATTRS = ["clock", "roi", "out", "e", "n", "pk", "pkb", "cnt", "saved", "x", "y", "m", "v"];
const { tokenize, prefixCss, prefixMarkup: prefixRaw } = normalizer({ prefix: "ky", hex: HEX, swaps: SWAPS, classes: [...CLASSES], keyframes: KEYFRAMES, attrs: ATTRS });
// Inline styles and painted SVG attributes take the same variable names and tokens
const prefixMarkup = (html) => prefixRaw(html.replace(/ style="([^"]*)"/g, (_, css) => ` style="${renameVars(css)}"`));
for (const c of C) { c.markup = prefixMarkup(c.raw); delete c.raw; }

// Every selector sits under the root: .ky itself, or :where(.ky) in front
const ROOTED = /(^|[\s,(>+~])\.ky(?![\w-])/;
function rootEvery(css) {
  return splitRules(css).map((rule) => {
    const at = rule.indexOf("{");
    const prelude = rule.slice(0, at).trim();
    const body = rule.slice(at + 1, -1);
    if (prelude.startsWith("@media")) return `${prelude} {\n${rootEvery(body)}\n}`;
    if (prelude.startsWith("@keyframes")) return rule;
    return `${splitSelectors(prelude).map((s) => (ROOTED.test(s) ? s : `:where(.ky) ${s}`)).join(",\n")} {${body}}`;
  }).join("\n");
}
const componentCss = rootEvery(prefixCss(durations(tokenize(HEADINGS + "\n" + base + "\n" + renameVars(EXTRA))))).replace(/\n{3,}/g, "\n\n").trim();
const leftHex = componentCss.match(/#[0-9a-f]{3,6}\b/gi);
if (leftHex) console.warn("literal colours left:", [...new Set(leftHex)].join(" "));

/* ── 7. Shared SVG defs: the symbols every component points at ──────── */
const DEFS = prefixMarkup(unhook(sliceEl(DOM, '<svg width="0" height="0" style="position:absolute" aria-hidden="true">').html))
  .replace("<svg ", '<svg id="ky-defs" ')
  // the bolt mark's inner fill reads the same local variable the client marks set (--bg -> --ky-mark-bg)
  .replace(/var\(--[\w-]+/g, (m) => renameVars(m));

/* ── 8. Component script ─────────────────────────────────────────────── */
const JS = `(function () {
  'use strict';
  /* KYMA components, no libraries. Every listener is delegated and every loop
     looks its components up afresh, so components added later work without
     setup: the clock, the menu, the playable pipeline, the pain chips, the ROI
     calculator, the process ruler, the billing switch, the FAQ and the forms. */
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function all(scope, sel) { return [].slice.call(scope.querySelectorAll(sel)); }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  function tween(from, to, ms, draw) {
    var t0 = performance.now();
    (function f(now) { var k = Math.min(1, (now - t0) / ms); draw(from + (to - from) * ease(k)); if (k < 1) requestAnimationFrame(f); })(t0);
  }

  /* Clock: Los Angeles time in every [data-ky-clock] */
  function tick() {
    var s; try { s = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()); } catch (e) { return; }
    all(document, '.ky [data-ky-clock]').forEach(function (c) { c.textContent = s; });
  }
  tick(); setInterval(tick, 1000);

  /* Menu: the header's MENU opens the .ky-menu that follows it */
  function menuOf(top) { var m = top && top.nextElementSibling; return m && m.classList.contains('ky-menu') ? m : null; }
  function setMenu(menu, open) {
    var top = menu.previousElementSibling, btn = top && top.querySelector('.ky-menu-btn');
    menu.classList.toggle('ky-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (open) { var c = menu.querySelector('.ky-close'); if (c) c.focus(); }
    else if (btn && menu.contains(document.activeElement)) btn.focus();
  }

  /* Pipeline: packets ride the nodes' paths; the screen plays a 90s demo at 2.4x */
  var MSGS = ['INVOICE #4821 → PARSED', 'TICKET #219 → ROUTED', 'LEAD SCORED: 87', 'CONTRACT → FLAGGED', 'REPORT Q3 → SENT', 'FORM #77 → EXTRACTED', 'EMAIL → AUTO-REPLIED', 'PO #1180 → APPROVED'];
  var TO = [1, 2, 3, 4, 5, 5]; /* where each edge lands (edge 5 is the shortcut from CLASSIFY to REPORT) */
  var NS = 'http://www.w3.org/2000/svg';
  function pipe(screen) {
    if (screen._ky) return screen._ky;
    var q = function (s) { return screen.querySelector(s); };
    return (screen._ky = { pk: q('[data-ky-pk]'), pkB: q('[data-ky-pkb]'), cnt: q('[data-ky-cnt]'), saved: q('[data-ky-saved]'), log: q('.ky-log'), packets: [], logs: [], done: 0, playing: false, playT: 0, acc: 0 });
  }
  function dot(r) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', r); c.style.fill = 'var(--ky-lime)'; return c; }
  function flash(screen, i) {
    var r = screen.querySelector('[data-ky-n="' + i + '"] rect');
    if (!r) return;
    r.style.stroke = 'var(--ky-lime)';
    setTimeout(function () { r.style.stroke = ''; }, 260);
  }
  function stepPipe(screen, dt) {
    var s = pipe(screen);
    if (!s.pk) return;
    var speed = s.playing ? 2.4 : 1;
    if (!RM || s.playing) {
      s.acc += dt * speed;
      if (s.acc > 0.7) {
        s.acc = 0;
        var p = dot(3), b = dot(5);
        p.setAttribute('filter', 'url(#ky-glow)');
        s.pk.appendChild(p); s.pkB.appendChild(b);
        s.packets.push({ el: p, b: b, seg: 0, t: 0, alt: Math.random() < 0.3 });
      }
    }
    s.packets = s.packets.filter(function (p) {
      p.t += dt * speed * 1.3;
      var ei = p.alt && p.seg === 1 ? 5 : p.seg;
      var path = screen.querySelector('[data-ky-e="' + ei + '"]');
      var pt = path.getPointAtLength(Math.min(1, p.t) * path.getTotalLength());
      p.el.setAttribute('cx', pt.x); p.el.setAttribute('cy', pt.y); p.b.setAttribute('cx', pt.x); p.b.setAttribute('cy', pt.y);
      if (p.t >= 1) {
        p.t = 0;
        flash(screen, TO[ei]);
        if (ei === 5 || p.seg >= 4) {
          p.el.remove(); p.b.remove(); s.done++;
          if (s.cnt) s.cnt.textContent = s.done.toLocaleString();
          if (s.saved) s.saved.textContent = (s.done * 0.37).toFixed(1);
          s.logs.unshift(MSGS[s.done % MSGS.length]); s.logs = s.logs.slice(0, 2);
          if (s.log) s.log.innerHTML = s.logs.map(function (m, i) { return i ? m : '<b>' + m + '</b>'; }).join('<br>');
          return false;
        }
        p.seg++;
      }
      return true;
    });
    if (s.playing) {
      s.playT += dt;
      var t = Math.min(90, s.playT), label = screen.querySelector('.ky-time span'), prog = screen.querySelector('.ky-prog');
      if (label) label.textContent = '0' + Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
      if (prog) prog.style.width = (t / 90 * 100) + '%';
      if (t >= 90) togglePlay(screen);
    }
  }
  function togglePlay(screen) {
    var s = pipe(screen), icon = screen.querySelector('.ky-play path'), label = screen.querySelector('.ky-time span'), prog = screen.querySelector('.ky-prog');
    s.playing = !s.playing;
    screen.setAttribute('aria-pressed', String(s.playing));
    if (icon) icon.setAttribute('d', s.playing ? 'M3 2h3v10H3zM8 2h3v10H8z' : 'M3 1.5v11l9-5.5z');
    if (!s.playing) {
      if (s.playT >= 90) { s.playT = 0; if (prog) prog.style.width = '0'; }
      if (label) label.textContent = s.playT ? 'PAUSED' : 'PLAY DEMO';
    }
  }
  var last = performance.now();
  (function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    all(document, '.ky .ky-screen').forEach(function (sc) { stepPipe(sc, dt); });
    requestAnimationFrame(loop);
  })(last);

  /* Pain: chips fly out of the sticky frame along their own angle, then the answer is highlighted */
  function painScroll() {
    all(document, '.ky .ky-pain').forEach(function (pain) {
      var frame = pain.querySelector('.ky-sticky'), after = pain.querySelector('.ky-after');
      if (!frame) return;
      var r = pain.getBoundingClientRect(), h = pain.offsetHeight - frame.offsetHeight;
      var p = h > 0 ? Math.max(0, Math.min(1, -r.top / h)) : 0;
      var W = frame.clientWidth, H = frame.clientHeight;
      all(pain, '.ky-chip').forEach(function (c, i) {
        var dx = +c.getAttribute('data-ky-x'), dy = +c.getAttribute('data-ky-y');
        var a = Math.atan2(dy, dx), rot = (i % 2 ? 1 : -1) * (4 + i * 1.5);
        var x = dx * W * (W < 700 ? 1.1 : 1), y = dy * H;
        var k = Math.max(0, Math.min(1, (p - 0.15 - i * 0.03) / 0.45)), fly = k * k * (W * 0.6);
        c.style.transform = 'translate(-50%,-50%) translate(' + (x + Math.cos(a) * fly) + 'px,' + (y + Math.sin(a) * fly) + 'px) rotate(' + (k * rot * 4) + 'deg)';
        c.style.opacity = String(1 - k);
      });
      if (after) after.style.setProperty('--ky-hl', (Math.max(0, Math.min(1, (p - 0.55) / 0.3)) * 100) + '%');
    });
  }
  addEventListener('scroll', painScroll, { passive: true });
  addEventListener('resize', painScroll);

  /* ROI: employees x hours x hourly cost x 52, x1.3 with overhead, eased */
  function calc(box) {
    var v = {};
    all(box, 'input[data-ky-roi]').forEach(function (i) {
      v[i.getAttribute('data-ky-roi')] = +i.value;
      i.style.setProperty('--ky-p', ((i.value - i.min) / (i.max - i.min) * 100) + '%');
    });
    var out = function (k, t) { var o = box.querySelector('[data-ky-out="' + k + '"]'); if (o) o.textContent = t; };
    out('emp', v.emp); out('hrs', v.hrs + ' HRS'); out('cost', '$' + v.cost);
    var on = box.querySelector('.ky-yn .ky-on'), ovh = on ? +on.getAttribute('data-ky-v') : 1;
    var target = v.emp * v.hrs * v.cost * 52 * (ovh ? 1.3 : 1), total = box.querySelector('.ky-big');
    tween(box._kyShown || 0, target, 400, function (n) { box._kyShown = n; if (total) total.textContent = '$' + Math.round(n).toLocaleString('en-US'); });
  }

  /* Process: one active week; the ruler's lime marker follows it */
  function setWeek(weeks, i) {
    weeks._kyI = i;
    all(weeks, '.ky-wk').forEach(function (w, j) { w.classList.toggle('ky-on', j === i); w.setAttribute('aria-pressed', String(j === i)); });
    var ruler = weeks.previousElementSibling, on = ruler && ruler.querySelector('.ky-on');
    if (on) on.style.left = (i * 25) + '%';
  }
  function weeksInit() {
    all(document, '.ky .ky-weeks').forEach(function (weeks) {
      if (weeks._kyReady) return;
      weeks._kyReady = true;
      all(weeks, '.ky-wk').forEach(function (w, i) { w.tabIndex = 0; w.setAttribute('role', 'button'); w.setAttribute('aria-pressed', String(i === 0)); });
    });
  }
  if (!RM) setInterval(function () {
    weeksInit();
    all(document, '.ky .ky-weeks').forEach(function (weeks) {
      if (weeks._kyHold || Date.now() - (weeks._kyAt || 0) < 3000) return;
      setWeek(weeks, ((weeks._kyI || 0) + 1) % 4);
    });
  }, 3200);

  /* Pricing: the switch eases every price to 80% and back */
  function setBilling(sw, annual) {
    sw.classList.toggle('ky-on', annual);
    sw.setAttribute('aria-pressed', String(annual));
    var toggle = sw.closest('.ky-toggle');
    if (toggle) { var o = all(toggle, '.ky-opt'); if (o[0]) o[0].classList.toggle('ky-on', !annual); if (o[1]) o[1].classList.toggle('ky-on', annual); }
    var sec = sw.closest('.ky-pricing');
    if (!sec) return;
    var save = sec.querySelector('.ky-save'), plans = sec.querySelector('.ky-plans');
    if (save) save.classList.toggle('ky-on', annual);
    if (plans) plans.classList.toggle('ky-annualon', annual);
    all(sec, '.ky-plan .ky-pr b').forEach(function (b) {
      var m = +b.getAttribute('data-ky-m'), to = annual ? Math.round(m * 0.8) : m, from = +b.textContent.replace(/\\D/g, '');
      tween(from, to, 450, function (n) { b.textContent = '$' + Math.round(n); });
    });
  }

  /* Forms: validate in place, then Loading and Thank you; nothing is sent */
  function submit(form) {
    var btn = form.querySelector('button[type=submit]'), lab = btn && btn.querySelector('.ky-lab');
    if (!btn || !lab) return;
    if (!lab.getAttribute('data-orig')) lab.setAttribute('data-orig', lab.textContent);
    var req = all(form, '[required]');
    var bad = req.filter(function (i) { return i.type === 'checkbox' ? !i.checked : !i.value.trim() || (i.type === 'email' && !/^\\S+@\\S+\\.\\S+$/.test(i.value)); });
    req.forEach(function (i) { i.style.borderBottomColor = ''; });
    if (bad.length) {
      btn.dataset.state = 'error'; lab.textContent = 'Error, try again';
      bad.forEach(function (i) { i.style.borderBottomColor = 'var(--ky-error)'; });
      setTimeout(function () { btn.dataset.state = ''; lab.textContent = lab.getAttribute('data-orig'); }, 1800);
      return;
    }
    btn.dataset.state = 'loading'; lab.textContent = 'Loading';
    setTimeout(function () { btn.dataset.state = 'done'; lab.textContent = 'Thank you'; }, 1200);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t.closest || !t.closest('.ky')) return;
    var open = t.closest('.ky-menu-btn');
    if (open) { var m = menuOf(open.closest('.ky-top')); if (m) setMenu(m, true); return; }
    var close = t.closest('.ky-menu .ky-close, .ky-menu nav a');
    if (close) { setMenu(close.closest('.ky-menu'), false); if (close.tagName === 'A') e.preventDefault(); return; }
    var screen = t.closest('.ky-screen');
    if (screen) { togglePlay(screen); return; }
    var yn = t.closest('.ky-yn button');
    if (yn) {
      all(yn.parentNode, 'button').forEach(function (b) { b.classList.toggle('ky-on', b === yn); });
      var box = yn.closest('.ky-calc'); if (box) calc(box);
      return;
    }
    var wk = t.closest('.ky-wk');
    if (wk) { var weeks = wk.closest('.ky-weeks'); setWeek(weeks, all(weeks, '.ky-wk').indexOf(wk)); weeks._kyAt = Date.now(); return; }
    var sw = t.closest('.ky-switch');
    if (sw) { setBilling(sw, !sw.classList.contains('ky-on')); return; }
    var qb = t.closest('.ky-qi > button');
    if (qb) {
      var qi = qb.parentNode, was = qi.classList.contains('ky-open'), qa = qi.closest('.ky-qa') || qi.parentNode;
      all(qa, '.ky-qi').forEach(function (x) { x.classList.remove('ky-open'); var b = x.querySelector('button'); if (b) b.setAttribute('aria-expanded', 'false'); });
      if (!was) { qi.classList.add('ky-open'); qb.setAttribute('aria-expanded', 'true'); }
      return;
    }
    var a = t.closest('a[href="#"]');
    if (a) e.preventDefault();
  });
  document.addEventListener('input', function (e) {
    var box = e.target.closest && e.target.closest('.ky-calc');
    if (box && e.target.hasAttribute('data-ky-roi')) calc(box);
  });
  document.addEventListener('mouseover', function (e) {
    var wk = e.target.closest && e.target.closest('.ky .ky-wk');
    if (!wk) return;
    var weeks = wk.closest('.ky-weeks'), i = all(weeks, '.ky-wk').indexOf(wk);
    weeks._kyHold = true;
    if (weeks._kyI !== i) setWeek(weeks, i);
  });
  document.addEventListener('mouseout', function (e) {
    var weeks = e.target.closest && e.target.closest('.ky .ky-weeks');
    if (weeks && !weeks.contains(e.relatedTarget)) weeks._kyHold = false;
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { all(document, '.ky .ky-menu.ky-open').forEach(function (m) { setMenu(m, false); }); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target;
    if (!t.closest || !t.closest('.ky')) return;
    if (t.classList.contains('ky-screen')) { e.preventDefault(); togglePlay(t); }
    else if (t.classList.contains('ky-wk')) { e.preventDefault(); var weeks = t.closest('.ky-weeks'); setWeek(weeks, all(weeks, '.ky-wk').indexOf(t)); weeks._kyAt = Date.now(); }
  });
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.closest || !form.closest('.ky')) return;
    e.preventDefault();
    submit(form);
  });

  weeksInit();
  all(document, '.ky .ky-calc').forEach(calc);
  painScroll();
  /* SMIL loops (case bars and rings, article glows) don't read reduced-motion CSS */
  if (RM) all(document, '.ky svg').forEach(function (v) { if (v.pauseAnimations) v.pauseAnimations(); });
})();`;

/* ── 9. The specimen page ────────────────────────────────────────────── */
// Dressed in the system: the page's own grid lines and grain, its blend header
// pinned as on the page, and its hero holding the specimen's title and the live pipeline
const stripIds = (html) => html.replace(/ id="[^"]*"/g, "").replace(/ aria-controls="[^"]*"/g, "").replace(/ for="[^"]*"/g, "");
const topHeader = stripIds(prefixMarkup(unhook(HEADER.replace(">AI Automation Specialists<", ">Design system · kyma@" + VERSION + "<"))));
const topMenu = stripIds(prefixMarkup(unhook(MENU
  .replace(/<nav>[\s\S]*?<\/nav>/, `<nav>\n${C.slice(0, 6).map((c, i) => `<a href="#c-${c.id}"><small>${String(i + 1).padStart(2, "0")}</small>${c.label.split(" ")[0].replace(/,$/, "")}</a>`).join("\n")}\n</nav>`))))
  // its links are specimen anchors, not page sections
  .replace(/href="#ky-c-/g, 'href="#c-');
// Defs ids stay: the pipeline's glow, mask and clip are the same picture as in the hero component
const topHero = prefixMarkup(unhook(HERO
  .replace(/(<span class="n">)\[01\](<\/span><span class="t">)Eliminate your bottleneck/, `$1[00]$2Design system · kyma@${VERSION}`)
  .replace(/<h1 class="h lines">[\s\S]*?<\/h1>/, `<h1 class="h lines"><span class="ln"><span>Black, paper and <span class="b">[lime]</span></span></span><span class="ln"><span>on a visible <span class="b">[4]</span> column grid.</span></span></h1>`)
  .replace(/<p class="sub[^"]*">[\s\S]*?<\/p>/, `<p class="sub"><b>The KYMA design system:</b> tokens and ${C.length} working components, each sliced from the KYMA AI automation agency page.</p>`)
  .replace('<a href="#services" class="btn"><span>Our services</span>', '<a href="#c-buttons" class="btn"><span>See the components</span>')
  .replace(">Trusted by 50+ companies<", `>${C.length} components · one grid<`)))
  .replace(' href="#ky-c-buttons"', ' href="#c-buttons"');
const CHROME = `
body{margin:0;background:var(--ky-paper)}
.sp-top{position:relative}
.sp-top .ky-top,.sp-top .ky-menu{position:fixed}
.sp-main{padding:0 0 120px}
.sp-sec{padding:96px 0 0;scroll-margin-top:72px}
.sp-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:8px 40px;align-items:end;max-width:calc(var(--ky-max) + var(--ky-pad)*2);margin:0 auto 24px;padding:0 var(--ky-pad)}
.sp-head h2{margin:12px 0 0;font:700 clamp(30px,3.2vw,46px)/.95 var(--ky-font-head);letter-spacing:-.035em;text-transform:uppercase;color:var(--ky-ink)}
.sp-label{display:flex;gap:6px;margin:0;font:600 var(--ky-label)/1 var(--ky-font-mono);text-transform:uppercase;color:var(--ky-g1)}
.sp-label::after{content:"_";color:var(--ky-ink);animation:ky-blink 1s steps(1) infinite}
.sp-note{margin:0;max-width:720px;font:500 var(--ky-text)/1.45 var(--ky-font-head);color:var(--ky-g1)}
.sp-demo{position:relative;isolation:isolate;overflow:clip;border-top:1px solid var(--ky-line);border-bottom:1px solid var(--ky-line)}
@media (max-width:980px){.sp-head{grid-template-columns:minmax(0,1fr)}}
`;
const HEROHTML = `
<div class="ky-gridlines" aria-hidden="true"><div class="ky-wrap"><i></i><i></i><i></i><i></i></div></div>
<div class="ky-grain" aria-hidden="true"></div>
<header class="sp-top">
${topHeader}
${topMenu}
${topHero}
</header>`;
const specimen = renderSpecimen({
  name: "KYMA",
  slug: "kyma",
  version: VERSION,
  prefix: "ky",
  rootClass: "ky",
  labelClass: "sp-label",
  script: "scripts/systems/kyma.mjs",
  source: SOURCE,
  metaDescription: "The KYMA design system: tokens and working components extracted from the KYMA AI automation agency page.",
  defsNote: "the symbols every component points at: the pixel arrow (ky-px), quote mark, check, plus, client marks and social icons; include it once per page",
  jsNote: "the clock, the menu, the playable pipeline, the pain chips, the ROI calculator, the process ruler, the billing switch, the FAQ and the two forms",
  fonts: FONTS,
  tokens: TOKENS,
  componentsCss: componentCss,
  chromeCss: CHROME,
  defs: DEFS,
  heroHtml: HEROHTML,
  components: C,
  js: JS,
});

/* ── 10. Write ───────────────────────────────────────────────────────── */
writeSystem({ slug: "kyma", prefix: "ky", rootClass: "ky", version: VERSION, tokens: TOKENS, componentsCss: componentCss, specimen, components: C,
  checkClasses: ["btn", "link", "lbl", "h", "mono", "dark", "wrap", "top", "menu", "hero", "screen", "calc", "svc", "wk", "ruler", "plan", "qi", "tile", "post-c", "fl", "giant", "chip"] });
