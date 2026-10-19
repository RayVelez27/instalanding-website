import { useEffect, useRef, useState } from "react";

/**
 * A code window that types out a single-file landing page, beautified and
 * syntax-coloured, line by line, then holds and starts again. Only the visible
 * part is tokenised, so it is cheap; it pauses off screen and under reduced
 * motion shows the finished snippet.
 */

type Tok = { t: string; c?: string };

/* The snippet: what "one file, no dependencies" looks like from the top */
export const SNIPPET = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Desk Dash! · Starfork Studio</title>
  <style>
    :root { --ink: #07041a; --mint: #93f7cc; }
    .hero h1 {
      font: 400 clamp(114px, 21vw, 276px)/.84 "Lilita One";
      animation: bob 2.4s ease-in-out infinite;
    }
  </style>
</head>
<body>
  <section class="hero" data-section="hero">
    <h1>Desk Dash!</h1>
    <a class="btn" href="#play">Play a lap</a>
  </section>
  <script>
    document.querySelector(".btn")
      .addEventListener("click", () => run());
  </script>
</body>
</html>`;

/** A small HTML / CSS / JS colouriser, enough for the snippet above */
const tokenize = (line: string): Tok[] => {
  const out: Tok[] = [];
  const push = (t: string, c?: string) => t && out.push({ t, c });
  // tags with attributes
  const tagRe = /(<\/?)([a-z!][\w-]*)([^>]*)(>)/gi;
  if (/^\s*</.test(line) && tagRe.test(line)) {
    tagRe.lastIndex = 0;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(line))) {
      push(line.slice(last, m.index), "tx");
      push(m[1], "pu");
      push(m[2], "tg");
      const attrs = m[3];
      const attrRe = /([\w-]+)(=)("[^"]*")/g;
      let al = 0;
      let a: RegExpExecArray | null;
      while ((a = attrRe.exec(attrs))) {
        push(attrs.slice(al, a.index));
        push(a[1], "at");
        push(a[2], "pu");
        push(a[3], "st");
        al = a.index + a[0].length;
      }
      push(attrs.slice(al), "at");
      push(m[4], "pu");
      last = m.index + m[0].length;
    }
    push(line.slice(last), "tx");
    return out;
  }
  // css / js
  const re = /("[^"]*"|'[^']*')|(--[\w-]+)|(#[0-9a-f]{3,6}\b)|(\b\d*\.?\d+(?:px|vw|s|%)?\b)|(\b(?:const|let|function|document|querySelector|addEventListener|animation|font|ease-in-out|infinite|clamp)\b)|([{}();:,.=>])/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    push(line.slice(last, m.index));
    const cls = m[1] ? "st" : m[2] ? "va" : m[3] ? "nu" : m[4] ? "nu" : m[5] ? "kw" : "pu";
    push(m[0], cls);
    last = m.index + m[0].length;
  }
  push(line.slice(last));
  return out;
};

const LINES = SNIPPET.split("\n");
const TOKENS = LINES.map(tokenize);

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const HtmlTypewriter = () => {
  const box = useRef<HTMLPreElement>(null);
  // How many characters of the snippet are showing
  const total = SNIPPET.length;
  const [n, setN] = useState(() => (reduced() ? total : 0));

  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    let visible = false;
    let shown = 0;
    let hold = 0;
    let last = performance.now();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (visible && !document.hidden) {
        if (shown < total) {
          // fast through whitespace, a touch slower on real characters
          shown = Math.min(total, shown + Math.max(1, Math.round(dt / 14)));
          setN(shown);
        } else if ((hold += dt) > 3200) {
          shown = 0;
          hold = 0;
          setN(0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [total]);

  // Render whole lines up to n characters, the current line cut mid-token
  let left = n;
  const rows: JSX.Element[] = [];
  for (let i = 0; i < LINES.length && left >= 0; i++) {
    const len = LINES[i].length;
    const take = Math.min(len, left);
    let rem = take;
    const parts: JSX.Element[] = [];
    TOKENS[i].forEach((tk, k) => {
      if (rem <= 0) return;
      const s = tk.t.slice(0, rem);
      rem -= s.length;
      parts.push(
        <span key={k} className={tk.c ? `hc-${tk.c}` : undefined}>
          {s}
        </span>,
      );
    });
    const typing = take < len || (left === len && i === LINES.length - 1) || left - len - 1 < 0;
    rows.push(
      <span key={i} className={`hc-line${typing ? " is-current" : ""}`}>
        <span className="hc-ln" aria-hidden="true">
          {String(i + 1).padStart(2, "0")}
        </span>
        <span className="hc-code">
          {parts}
          {typing && <span className="hc-caret" aria-hidden="true" />}
        </span>
      </span>,
    );
    left -= len + 1;
  }

  return (
    <pre className="home-code-body hc" ref={box} aria-label="A single-file landing page, typed out">
      {rows}
    </pre>
  );
};

export default HtmlTypewriter;
