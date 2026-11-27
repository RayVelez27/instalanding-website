import { useEffect, useState } from "react";

/**
 * The written one-shot briefs, fetched when needed. The browser bundle ships
 * them empty (plugins/strip-briefs.mjs) because the same text is published at
 * /p/<slug>.txt (pages) and /m/<slug>.txt (motion). Where the field is still
 * filled (tests, tooling), it's used as is.
 */
type Kind = "page" | "motion";

const cache = new Map<string, Promise<string>>();

export const briefUrl = (kind: Kind, slug: string) => (kind === "page" ? `/p/${slug}.txt` : `/m/${slug}.txt`);

export const loadBrief = (kind: Kind, slug: string, inline?: string): Promise<string> => {
  if (inline) return Promise.resolve(inline);
  const key = `${kind}:${slug}`;
  let p = cache.get(key);
  if (!p) {
    p = fetch(briefUrl(kind, slug)).then((r) => (r.ok ? r.text() : Promise.reject(new Error(`brief ${r.status}`))));
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
};

/** The brief's text once loaded (null until then). Loading starts as soon as `enabled`. */
export const useBrief = (kind: Kind, slug: string | undefined, inline: string | undefined, enabled = true) => {
  const [text, setText] = useState<string | null>(inline || null);
  useEffect(() => {
    if (!slug || !enabled) return;
    if (inline) {
      setText(inline);
      return;
    }
    let live = true;
    setText(null);
    loadBrief(kind, slug).then((t) => live && setText(t), () => {});
    return () => {
      live = false;
    };
  }, [kind, slug, inline, enabled]);
  return text;
};

/** The brief's length, whether it's inline or stripped from the bundle */
export const briefChars = (e: { prompt: string; promptChars?: number }) => e.prompt.length || e.promptChars || 0;
