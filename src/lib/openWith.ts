/**
 * "Open with your agent": the item sheet's row of agents (phones and tablets).
 * Each one opens with a short prompt typed in that points the agent at the
 * item's plain-text brief or HTML file on the site; the visitor reviews it and
 * presses send. The full page prompt (~85k characters) is far too long for a
 * link: Claude cuts link prompts at ~14k characters and Cursor's links at
 * ~8-10k, so the link carries a pointer, not the file.
 *
 * Links (checked Nov 2026): Claude `claude.ai/new?q=` (documented), ChatGPT
 * `chatgpt.com/?q=` and Grok `grok.com/?q=` (undocumented but long-standing),
 * Lovable `lovable.dev/#prompt=` (documented). Cursor and Hermes have no use
 * on a phone or tablet (desktop app, terminal), so they copy the prompt
 * instead. None of these send on their own.
 */
import type { SheetKind } from "@/components/ItemSheet";

export const SITE = "https://instalanding.ai";

/** Where an agent reads the item: the plain-text brief, or the HTML file itself */
export function itemSource(kind: SheetKind, slug: string): string {
  switch (kind) {
    case "page": return `${SITE}/p/${slug}.txt`;
    case "motion": return `${SITE}/m/${slug}.txt`;
    case "system": return `${SITE}/s/${slug}.txt`;
    case "product": return `${SITE}/product-demos/${slug}.html`;
    case "video": return `${SITE}/video-demos/${slug}.html`;
    case "icons": return `${SITE}/icon-sets/${slug}/index.html`;
  }
}

/** The short prompt each agent opens with */
export function agentPrompt(kind: SheetKind, slug: string, title: string): string {
  const src = itemSource(kind, slug);
  switch (kind) {
    case "page":
      return `Build this landing page from InstaLanding.ai, "${title}". Read ${src}: it has the instruction and the full HTML. Then make it for me: keep the design and swap in my brand, copy and content.`;
    case "motion":
      return `Add this motion study from InstaLanding.ai, "${title}", to my project. Read ${src}: it has the build instructions and the full choreography. Rebuild it in my stack.`;
    case "system":
      return `Restyle my project with this design system from InstaLanding.ai, "${title}". Read ${src}: it has the tokens, the components and how to apply them.`;
    case "product":
      return `Here is a working product concept from InstaLanding.ai, "${title}", in one HTML file: ${src}. Read it, then adapt it for me: keep the design and every control working, and swap in my product.`;
    case "video":
      return `Here is a live-rendered video from InstaLanding.ai, "${title}", in one HTML file: ${src}. Read it, then remake it for my brand: keep the motion and the style, change the content.`;
    case "icons":
      return `Here is an animated icon set from InstaLanding.ai, "${title}", in one HTML file: ${src}. Read it, then give me these icons in my project's stack and colours.`;
  }
}

export interface Agent {
  id: string;
  name: string;
  /** Monogram and tile colour until official marks are added */
  mark: string;
  bg: string;
  /** Builds the link; absent means the agent can't be opened from a phone or tablet, so the prompt is copied */
  link?: (prompt: string) => string;
  /** Shown after copying, for agents without a link */
  copyNote?: string;
}

const q = (s: string) => encodeURIComponent(s);

export const AGENTS: Agent[] = [
  { id: "claude", name: "Claude", mark: "C", bg: "#c96442", link: (p) => `https://claude.ai/new?q=${q(p)}` },
  { id: "chatgpt", name: "ChatGPT", mark: "G", bg: "#10a37f", link: (p) => `https://chatgpt.com/?q=${q(p)}` },
  { id: "grok", name: "Grok", mark: "X", bg: "#1d1d1f", link: (p) => `https://grok.com/?q=${q(p)}` },
  { id: "lovable", name: "Lovable", mark: "L", bg: "#e5487a", link: (p) => `https://lovable.dev/#prompt=${q(p)}` },
  { id: "cursor", name: "Cursor", mark: "Cu", bg: "#3a3a40", copyNote: "Copied. Paste it into Cursor on your computer." },
  { id: "hermes", name: "Hermes", mark: "H", bg: "#5b3fa8", copyNote: "Copied. Paste it into hermes in your terminal." },
];

/** The smallest link limit among the agents (Cursor's), with room to spare */
export const MAX_LINK = 8000;
