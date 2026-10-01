/**
 * "Build with" hand-offs for a demo's source.
 *
 * None of these tools can take a 100KB file through a link: Lovable caps the
 * prompt at 50,000 characters and the others are far tighter. So every target
 * gets the same two-part hand-off — the full code goes on the clipboard, and the
 * tool opens with a short prompt that names the demo's public URL. A tool that
 * can read the link just works; one that can't has the code ready to paste.
 */
export type BuildTarget = {
  id: string;
  label: string;
  /** Short name for the "paste it into ___" note. */
  name: string;
  /** Swatch beside the name in the menu: a plain colour cue, not a logo. */
  dot: string;
  url: (prompt: string, demoUrl: string) => string;
};

const q = encodeURIComponent;

export const BUILD_TARGETS: BuildTarget[] = [
  { id: "claude", label: "Claude", name: "Claude", dot: "#d97757", url: (p) => `https://claude.ai/new?q=${q(p)}` },
  { id: "chatgpt", label: "ChatGPT", name: "ChatGPT", dot: "#10a37f", url: (p) => `https://chatgpt.com/?q=${q(p)}` },
  {
    id: "lovable",
    label: "Lovable",
    name: "Lovable",
    dot: "linear-gradient(135deg, #ff930f, #ff1b6b 55%, #bf0fff)",
    // Lovable reads its parameters from the hash, and `html` is a page it fetches as reference.
    url: (p, demo) => `https://lovable.dev/#prompt=${q(p)}&html=${q(demo)}`,
  },
  { id: "v0", label: "v0 by Vercel", name: "v0", dot: "#000", url: (p) => `https://v0.app/chat?q=${q(p)}` },
  { id: "bolt", label: "Bolt", name: "Bolt", dot: "#0061ff", url: (p) => `https://bolt.new/?prompt=${q(p)}` },
];

export function buildPrompt(title: string, demoUrl: string) {
  return (
    `Create a landing page with this as the starting point: "${title}".\n\n` +
    `It is a single self-contained HTML file: ${demoUrl}\n\n` +
    `I'll paste the full code below.\n\n`
  );
}
