import type { PromptEntry } from "@/data/prompts";

/**
 * Helpers for the VIDEOS and PRODUCTS dialogs, whose demos are single HTML
 * files that run to megabytes: inlined models, images and audio, and bundled
 * players minified onto very long lines.
 */

/** What the PAGES copy hook reads from a library item */
export interface BigDemo {
  slug: string;
  title: string;
  description: string;
  added: string;
  tags: string[];
  demo: string;
  thumbnail: string;
}

/** The copy hook takes a PromptEntry; a big demo fills the parts it reads */
export const asPage = (d: BigDemo, categoryLabel: string): PromptEntry => ({
  slug: d.slug,
  title: d.title,
  category: "web",
  categoryLabel,
  description: d.description,
  prompt: "",
  preview: "hero",
  variant: "large",
  added: d.added,
  demo: d.demo,
  thumbnail: d.thumbnail,
  theme: "dark",
  bestFor: [],
  style: d.tags,
});

export const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* Base64 assets can't be read, and src/lib/highlight.ts takes minutes on a
   100KB+ minified line, so CODE shows each as a one-line placeholder; the
   markup, CSS and the file's own script stay as they are. COPY CODE and
   DOWNLOAD always get the untouched file. */
const BLOB = /[A-Za-z0-9+/]{400,}={0,2}/g;
const LONG_LINE = 2000;

const collapseLine = (line: string) => {
  if (line.length <= LONG_LINE) return line;
  // Keep a script tag that opens or closes on the line, so the highlighter still sees the structure
  const open = /^\s*<script[^>]*>/i.exec(line)?.[0] ?? "";
  const close = /<\/script>\s*$/i.exec(line)?.[0] ?? "";
  return `${open}/* [minified code · ${fileSize(line.length)} on one line · in COPY CODE] */${close}`;
};

/** The source as the CODE tab shows it */
export const readableSource = (code: string) =>
  code
    .replace(BLOB, (run) => `[base64 data · ${fileSize((run.length * 3) / 4)} · in COPY CODE]`)
    .split("\n")
    .map(collapseLine)
    .join("\n");
