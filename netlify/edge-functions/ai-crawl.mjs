/**
 * AI crawler tracking for DataFast's Bot traffic card.
 * https://datafa.st/docs/bot-traffic-tracking
 *
 * The browser script in index.html only sees visitors that run JavaScript.
 * GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User and the rest don't, so they
 * get counted here, at the edge, before the static file is served. Humans are
 * filtered out by user agent inside the package, and the report is sent in
 * the background (context.waitUntil), so it never slows a response down.
 */
import { trackAICrawlerRequest } from "@datafast/ai-crawl";

// The package skips .txt and .json by default as "static assets". On this site
// they are the product for agents: /prompts.json, /p/<slug>.txt|json, SKILL.md.
// So the list is the default minus those, plus the media we actually serve.
const IGNORED_EXTENSIONS = [
  "avif", "bmp", "br", "cjs", "css", "csv", "eot", "gif", "gz", "ico", "jpeg",
  "jpg", "js", "map", "mjs", "mov", "mp3", "mp4", "otf", "pdf", "png", "svg",
  "ttf", "wasm", "wav", "webm", "webmanifest", "webp", "woff", "woff2", "zip",
];

export default async (request, context) => {
  trackAICrawlerRequest(request, context, {
    websiteId: "dfid_pauXjmQ3h5yYNr1572Y2Q",
    domain: "instalanding.ai",
    // Optional: a dfbot_ token from the Bot traffic card settings, set as an
    // environment variable in Netlify. Netlify.env is undefined outside Netlify.
    authToken: globalThis.Netlify?.env.get("DATAFAST_BOT_TOKEN") || undefined,
    ignoredExtensions: IGNORED_EXTENSIONS,
    // DataFast verifies crawlers by source IP; Netlify hands it over directly.
    getIp: () => context.ip,
  });
};

export const config = {
  path: "/*",
  // Bundled JS/CSS, images and the MCP endpoint never need the edge hop.
  excludedPath: ["/assets/*", "/thumbs/*", "/previews/*", "/mcp", "/.netlify/*"],
};
