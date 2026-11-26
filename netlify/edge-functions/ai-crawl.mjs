/**
 * AI crawler tracking, into PostHog.
 *
 * The PostHog script in the app only sees visitors that run JavaScript.
 * GPTBot, ClaudeBot, PerplexityBot, ChatGPT-User and the rest don't, so they
 * are counted here, at the edge, before the static file is served: one
 * `ai_crawler_visit` event per request, with the bot, its vendor, what kind of
 * fetch it is (training, search index, or fetching for a user right now) and
 * the path. Humans are skipped by user agent, and the event is sent in the
 * background (context.waitUntil), so it never slows a response down.
 *
 * Bots are matched by user agent only; that can be spoofed, so treat the
 * counts as a signal, not an audit. Each bot is its own distinct_id with no
 * person profile, so it never shows up as a "person" in PostHog.
 */

const POSTHOG = "https://us.i.posthog.com/i/v0/e/";
// The public project token, the same one src/lib/posthog.ts ships to every browser.
const TOKEN = "phc_vEFiebD4L2aJFU4cJdGwkD2tMZzUxTNhxR9Vpm6yrR8N";

/** [user-agent token, vendor, kind]. kind: "user" = fetching for a person now, "search" = an AI search index, "training" = model training. */
const BOTS = [
  ["ChatGPT-User", "OpenAI", "user"],
  ["OAI-SearchBot", "OpenAI", "search"],
  ["GPTBot", "OpenAI", "training"],
  ["Claude-User", "Anthropic", "user"],
  ["Claude-SearchBot", "Anthropic", "search"],
  ["ClaudeBot", "Anthropic", "training"],
  ["anthropic-ai", "Anthropic", "training"],
  ["Perplexity-User", "Perplexity", "user"],
  ["PerplexityBot", "Perplexity", "search"],
  ["meta-externalfetcher", "Meta", "user"],
  ["meta-externalagent", "Meta", "training"],
  ["MistralAI-User", "Mistral", "user"],
  ["DuckAssistBot", "DuckDuckGo", "search"],
  ["Google-CloudVertexBot", "Google", "user"],
  ["Gemini-Deep-Research", "Google", "user"],
  ["Applebot", "Apple", "search"],
  ["Amazonbot", "Amazon", "search"],
  ["bingbot", "Microsoft", "search"],
  ["cohere-ai", "Cohere", "training"],
  ["Bytespider", "ByteDance", "training"],
  ["CCBot", "Common Crawl", "training"],
  ["YouBot", "You.com", "search"],
  ["Diffbot", "Diffbot", "training"],
].map(([token, vendor, kind]) => ({ token, vendor, kind, re: new RegExp(token.replace(/[-.]/g, "\\$&"), "i") }));

// Static files nobody needs counted. .txt, .json and .md stay in: on this site
// they are the product for agents (/llms.txt, /prompts.json, /p/<slug>.txt, SKILL.md).
const IGNORED = /\.(avif|bmp|br|cjs|css|csv|eot|gif|gz|ico|jpe?g|js|map|mjs|mov|mp3|mp4|otf|pdf|png|svg|ttf|wasm|wav|webm|webmanifest|webp|woff2?|zip)$/i;

export default async (request, context) => {
  const ua = request.headers.get("user-agent") ?? "";
  const bot = ua && BOTS.find((b) => b.re.test(ua));
  if (!bot) return;
  const url = new URL(request.url);
  if (IGNORED.test(url.pathname)) return;

  const sent = fetch(POSTHOG, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TOKEN,
      event: "ai_crawler_visit",
      distinct_id: `bot:${bot.token.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      properties: {
        bot: bot.token,
        vendor: bot.vendor,
        kind: bot.kind,
        path: url.pathname,
        $current_url: url.href,
        $pathname: url.pathname,
        $host: url.host,
        user_agent: ua.slice(0, 300),
        $process_person_profile: false,
        $lib: "netlify-edge",
      },
    }),
    signal: AbortSignal.timeout(4000),
  }).catch(() => {});
  context?.waitUntil?.(sent);
  // Returning nothing hands the request on to the static file or the SPA.
};

export const config = {
  path: "/*",
  // Bundled JS/CSS, images and the MCP endpoint never need the edge hop.
  excludedPath: ["/assets/*", "/thumbs/*", "/previews/*", "/mcp", "/.netlify/*", "/ingest/*"],
};
