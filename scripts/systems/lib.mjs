// Shared extraction pipeline for design systems (one script per system uses it).
//
// A system is always extracted from a real template: slice its markup, rename
// its classes and keyframes under the system's prefix (so the CSS can't collide
// with a host app), swap literal colours, fonts, radii, shadows and timings for
// tokens, and write public/systems/<slug>/:
//   specimen.html  every component rendered live, one file (never index.html:
//                  the host would serve it at /systems/<slug>, the dialog's URL)
//   tokens.css     the design tokens as CSS custom properties
//   <slug>.css     tokens + component CSS, ready to link from any page
// The SYSTEMS dialog reads the specimen's <style id="<p>-tokens">,
// <style id="<p>-components">, <svg id="<p>-defs">, <section data-component>
// blocks and <script id="<p>-components-js">. Keep those ids and the token
// group comments ("/* Color · core */", "Type · families", "Type · scale",
// "Shape · radii", "Shape · borders", "Depth · …", "Motion · easing",
// "Motion · durations", "Space · layout") stable: the board's panels read them.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** The template's HTML, plus helpers that slice real markup out of its <body>. */
export function readPage(rel) {
  const page = fs.readFileSync(path.join(root, rel), "utf8").replace(/\r\n/g, "\n");
  // Search from <body>: a template's header comment often mentions the same markup.
  const BODY = page.search(/<body[\s>]/);
  const el = (marker, from = BODY) => sliceEl(page, marker, from).html;
  const all = (marker) => {
    const out = [];
    for (let i = page.indexOf(marker, BODY); i >= 0; i = page.indexOf(marker, i + marker.length)) out.push(sliceEl(page, marker, i).html);
    return out;
  };
  // The page's first real <style> block (its tag sits on its own line; comments may say "<style>" too)
  const styleAt = page.search(/\n<style[^>]*>\n/);
  const css = styleAt < 0 ? "" : page.slice(page.indexOf(">", styleAt) + 2, page.indexOf("</style>", styleAt));
  const fonts = (/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/.exec(page) || [""])[0];
  return { page, BODY, el, all, css, fonts };
}

/** The element starting at `marker` (searching from `from`), balanced on its own tag name. */
export function sliceEl(html, marker, from = 0) {
  const start = html.indexOf(marker, from);
  if (start < 0) throw new Error("marker not found: " + marker.slice(0, 70));
  const tag = /^<([a-z0-9]+)/i.exec(html.slice(start))[1];
  const re = new RegExp(`<${tag}[\\s>]|</${tag}>`, "gi");
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0][1] === "/" ? -1 : 1;
    if (depth === 0) return { html: html.slice(start, m.index + m[0].length), end: m.index + m[0].length };
  }
  throw new Error("unbalanced: " + marker.slice(0, 70));
}

/** Drops some declarations from the first element's style="" (e.g. section margins a component shouldn't carry). */
export const dropStyle = (html, props) =>
  html.replace(/^(<[^>]*? style=")([^"]*)"/, (_, a, css) =>
    a + css.split(";").map((d) => d.trim()).filter((d) => d && !props.some((p) => d.startsWith(p + ":"))).join("; ") + '"');

/**
 * Turns a template's literal values into the system's tokens and its class
 * names into prefixed ones.
 *   hex       { "#15111F": "ink", ... }  -> var(--<prefix>-ink)
 *   swaps     [[regex, replacement], ...] applied after the hex pass
 *   classes   class names to prefix (".btn" -> ".ks-btn", class="btn" -> class="ks-btn")
 *   keyframes keyframe names to prefix (@keyframes, animation:, animation-name:)
 *   attrs     data attributes to prefix in markup ("poke" -> data-ks-poke)
 */
export function normalizer({ prefix, hex = {}, swaps = [], classes = [], keyframes = [], attrs = [] }) {
  const CLASS_SET = new Set(classes);
  const tokenize = (css) => {
    let s = css;
    for (const [h, name] of Object.entries(hex)) s = s.replace(new RegExp(h + "(?![0-9a-f])", "gi"), `var(--${prefix}-${name})`);
    for (const [re, to] of swaps) s = s.replace(re, to);
    return s;
  };
  const prefixCss = (css) => {
    let s = css.replace(/\.([a-z][\w-]*)(?![\w-])/gi, (m, name) => (CLASS_SET.has(name) ? `.${prefix}-${name}` : m));
    for (const k of keyframes) {
      s = s.replace(new RegExp(`@keyframes ${k}(\\s*)\\{`, "g"), `@keyframes ${prefix}-${k}$1{`);
      s = s.replace(new RegExp(`(animation(?:-name)?:\\s*)${k}(?![\\w-])`, "g"), `$1${prefix}-${k}`);
      s = s.replace(new RegExp(`(,\\s*)${k}(\\s+[\\d.]+m?s)`, "g"), `$1${prefix}-${k}$2`);
    }
    return s;
  };
  const prefixMarkup = (html) => {
    let s = html
      .replace(/ class="([^"]*)"/g, (_, list) => ` class="${list.split(/\s+/).filter(Boolean).map((c) => (CLASS_SET.has(c) ? `${prefix}-${c}` : c)).join(" ")}"`)
      .replace(/ style="([^"]*)"/g, (_, css) => ` style="${tokenize(css)}"`);
    for (const a of attrs) s = s.replace(new RegExp(` data-${a}(?=[\\s>=])`, "g"), ` data-${prefix}-${a}`);
    return s;
  };
  return { tokenize, prefixCss, prefixMarkup };
}

/**
 * The specimen page. `chromeCss` and `heroHtml` are the system's own (the
 * specimen is dressed in the system it documents); everything else is shared.
 */
export function renderSpecimen(o) {
  const pad = (n) => String(n).padStart(2, "0");
  const p = o.prefix;
  return `<!doctype html>
<!--
  INSTALANDING.AI · Design system · ${o.name} · ${o.slug}@${o.version}
  Generated by ${o.script} from ${o.source}. Do not edit by hand.

  How to read this file
  - <style id="${p}-tokens">      the design tokens (also served as tokens.css)
  - <style id="${p}-components">  every component's CSS, scoped under .${o.rootClass} and ${p}- class names (with the tokens: ${o.slug}.css)
  - <svg id="${p}-defs">           ${o.defsNote}
  - <section data-component>     one per component; the markup inside .sp-demo is the component
  - <script id="${p}-components-js"> ${o.jsNote}
  Specimen chrome uses sp- class names and is not part of the system.
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${o.name} · Design system</title>
<meta name="description" content="${o.metaDescription}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${o.fonts}
<style id="${p}-tokens">
${o.tokens}
</style>
<style id="${p}-components">
${o.componentsCss}
</style>
<style>
/* Specimen chrome (not part of the system) */
${o.chromeCss.trim()}
</style>
</head>
<body>
<div class="${o.rootClass}">
${o.defs}

${o.heroHtml.trim()}

<main class="sp-main">
${o.components.map((c, i) => `<section class="sp-sec" id="c-${c.id}" data-component="${c.id}" data-label="${c.label}"${c.js ? " data-js" : ""}${c.defs ? " data-defs" : ""}>
<header class="sp-head"><div><p class="${o.labelClass}">${pad(i + 1)} · ${c.id}</p><h2>${c.label}</h2></div><p class="sp-note" data-note>${c.note.replace(/</g, "&lt;")}</p></header>
<div class="sp-demo">
${c.markup}
</div>
</section>`).join("\n\n")}
</main>
</div>
<script id="${p}-components-js">
${o.js}
</script>
</body>
</html>
`;
}

/** Writes the three files, after checking no un-prefixed class from `checkClasses` slipped through. */
export function writeSystem({ slug, prefix, rootClass, version, tokens, componentsCss, specimen, components, checkClasses = [] }) {
  if (checkClasses.length) {
    const re = new RegExp(`class="(?:[^"]* )?(?:${checkClasses.join("|")})(?: [^"]*)?"`, "g");
    const left = specimen.match(re);
    if (left) throw new Error("unprefixed classes left: " + left.slice(0, 3).join(" "));
  }
  const out = path.join(root, "public/systems", slug);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "specimen.html"), specimen);
  fs.rmSync(path.join(out, "index.html"), { force: true });
  fs.writeFileSync(path.join(out, "tokens.css"), tokens + "\n");
  fs.writeFileSync(path.join(out, `${slug}.css`), `${tokens}\n\n/* Components · scoped under .${rootClass}; class names use the ${prefix}- prefix */\n${componentsCss}\n`);
  console.log(`${slug}@${version}: ${components.length} components ->`, path.relative(root, out));
  console.log(components.map((c) => c.id).join(", "));
}
