/**
 * A small syntax highlighter for the single-file demos: HTML with CSS in
 * <style> and JS in <script>. Hand-rolled because the demos are one known
 * shape and a general highlighter (Prism, Shiki) would outweigh the feature.
 *
 * Returns one escaped HTML string per source line, so the code view can keep
 * one element per line for its line numbers.
 */
type Tok = [cls: string, text: string];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ---------------- JS ---------------- */
const JS_KEYWORDS = new Set(
  (
    "var let const function return if else for while do break continue switch case default new " +
    "typeof instanceof in of this null undefined true false try catch finally throw async await " +
    "class extends super import export from delete void yield static get set"
  ).split(" "),
);
// After these, a "/" starts a regex literal rather than a division.
const REGEX_AFTER = /[(,=:[!&|?{};+\-*%<>~^]$|^$|\b(return|typeof|case|in|of|new|delete|void|throw)$/;

function js(src: string, out: Tok[]) {
  const re =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n])+\/[dgimsuy]*)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\.\d+\b)|([A-Za-z_$][\w$]*)|(\s+)|([\s\S])/g;
  let prev = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [t, comment, str, regex, num, ident, ws] = m;
    if (comment) out.push(["c", t]);
    else if (str) out.push(["s", t]);
    else if (regex && REGEX_AFTER.test(prev)) out.push(["r", t]);
    else if (regex) {
      // Not a regex after all: emit the slash alone and rescan from just after it.
      out.push(["p", "/"]);
      re.lastIndex = m.index + 1;
      prev = "/";
      continue;
    } else if (num) out.push(["n", t]);
    else if (ident) {
      const isFn = /^\s*\(/.test(src.slice(re.lastIndex, re.lastIndex + 40));
      out.push([JS_KEYWORDS.has(t) ? "k" : isFn ? "f" : "", t]);
    } else if (ws) out.push(["", t]);
    else out.push(["p", t]);
    if (!ws && !comment) prev = (prev + t).slice(-12).trimEnd();
  }
}

/* ---------------- CSS ---------------- */
function cssValue(src: string, out: Tok[]) {
  const re =
    /(\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:[a-z%]+)?)|(!important)|(--[\w-]+)|([a-zA-Z-]+(?=\())|([a-zA-Z-]+)|(\s+)|([\s\S])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [t, comment, str, hex, num, imp, cssVar, fn, word, ws] = m;
    out.push([
      comment ? "c" : str ? "s" : hex || num ? "n" : imp ? "k" : cssVar ? "a" : fn ? "f" : word ? "v" : ws ? "" : "p",
      t,
    ]);
  }
}

/** Index of the first of `{`, `;` or `}` at or after `i`, skipping strings, comments and parens. */
function cssStop(src: string, i: number) {
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '"' || ch === "'") {
      const end = src.indexOf(ch, i + 1);
      i = end < 0 ? src.length : end;
    } else if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 1;
    } else if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === "{" || ch === ";" || ch === "}")) return i;
  }
  return src.length;
}

function css(src: string, out: Tok[]) {
  let i = 0;
  while (i < src.length) {
    const lead = /^(\s+|\/\*[\s\S]*?\*\/)/.exec(src.slice(i, i + 4000));
    if (lead) {
      out.push([lead[0].trim() ? "c" : "", lead[0]]);
      i += lead[0].length;
      continue;
    }
    if (src[i] === "}" || src[i] === "{" || src[i] === ";") {
      out.push(["p", src[i++]]);
      continue;
    }
    const stop = cssStop(src, i);
    const chunk = src.slice(i, stop);
    if (src[stop] === "{") {
      // A selector, or an at-rule prelude such as @media (max-width: 880px).
      const at = /^@[\w-]+/.exec(chunk);
      if (at) {
        out.push(["k", at[0]]);
        cssValue(chunk.slice(at[0].length), out);
      } else out.push(["t", chunk]);
    } else {
      const colon = chunk.indexOf(":");
      if (colon > 0 && !chunk.startsWith("@")) {
        out.push(["a", chunk.slice(0, colon)], ["p", ":"]);
        cssValue(chunk.slice(colon + 1), out);
      } else cssValue(chunk, out);
    }
    i = stop;
  }
}

/* ---------------- HTML ---------------- */
function html(src: string, out: Tok[]) {
  const re = /(<!--[\s\S]*?-->)|(<!doctype[^>]*>)|(<\/?)([a-zA-Z][\w-]*)|(&#?\w+;)|([^<&]+|[<&])/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [t, comment, doctype, open, name, entity] = m;
    if (comment) out.push(["c", t]);
    else if (doctype) out.push(["k", t]);
    else if (entity) out.push(["n", t]);
    else if (open) {
      out.push(["p", open], ["t", name]);
      // Attributes up to the closing ">".
      const attr = /\s+|([^\s=>/"']+)|(=)|("[^"]*"|'[^']*')|(\/?>)|([\s\S])/g;
      attr.lastIndex = re.lastIndex;
      let a: RegExpExecArray | null;
      while ((a = attr.exec(src))) {
        if (a[4]) {
          out.push(["p", a[4]]);
          break;
        }
        out.push([a[1] ? "a" : a[2] ? "p" : a[3] ? "s" : "", a[0]]);
      }
      re.lastIndex = attr.lastIndex;
      // Raw-text elements: hand their contents to the right highlighter.
      const tag = name.toLowerCase();
      if (open === "<" && (tag === "style" || tag === "script")) {
        const close = src.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
        const end = close < 0 ? src.length : close;
        (tag === "style" ? css : js)(src.slice(re.lastIndex, end), out);
        re.lastIndex = end;
      }
    } else out.push(["", t]);
  }
}

export function highlightLines(src: string): string[] {
  const toks: Tok[] = [];
  html(src.replace(/\r\n?/g, "\n"), toks);
  const lines: string[] = [];
  let line = "";
  for (const [cls, text] of toks) {
    // A token can span lines (comments, template strings): close and reopen its span per line.
    const parts = text.split("\n");
    parts.forEach((part, i) => {
      if (i > 0) {
        lines.push(line);
        line = "";
      }
      if (part) line += cls ? `<span class="hl-${cls}">${esc(part)}</span>` : esc(part);
    });
  }
  if (line) lines.push(line);
  return lines;
}
