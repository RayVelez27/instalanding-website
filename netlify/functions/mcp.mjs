/**
 * The hosted MCP server: https://instalanding.ai/mcp
 *
 *   claude mcp add --transport http instalanding https://instalanding.ai/mcp
 *
 * Same tools as the npm package (mcp/src/server.js), over Streamable HTTP, so
 * an agent connects with a URL and installs nothing. Stateless: every POST gets
 * a fresh server and a plain JSON reply, which is what a serverless function
 * can hold. The library is read from the deploy that served the request, so a
 * deploy preview's /mcp answers with that preview's prompts.
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Library } from "../../mcp/src/library.js";
import { VERSION, createServer } from "../../mcp/src/server.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

/** One Library per origin, kept while the function is warm, so its 5-minute cache carries across requests. */
const libraries = new Map();
const libraryFor = (origin) => {
  if (!libraries.has(origin)) libraries.set(origin, new Library({ baseUrl: origin }));
  return libraries.get(origin);
};

/**
 * One PostHog event per MCP call, so agent use shows up beside the site's own
 * events: mcp_connect (initialize) and mcp_<tool> for every tool call, with the
 * slug, query and client. An MCP client never loads a page, so each client is
 * its own distinct_id ("mcp:<client name>") with no person profile. Sent with
 * the public project token (the same one every browser gets), so no setup.
 */
const BATCH = "https://us.i.posthog.com/batch/";
const TOKEN = "phc_vEFiebD4L2aJFU4cJdGwkD2tMZzUxTNhxR9Vpm6yrR8N";
const clip = (value) => (value == null || value === "" ? undefined : String(value).slice(0, 255));

const eventsFor = (body, userAgent) => {
  const messages = Array.isArray(body) ? body : [body];
  return messages.flatMap((m) => {
    if (m?.method === "initialize") {
      const client = m.params?.clientInfo;
      return [{ name: "mcp_connect", client: client?.name, props: { client: clip(client ? `${client.name} ${client.version ?? ""}`.trim() : userAgent) } }];
    }
    if (m?.method !== "tools/call" || typeof m.params?.name !== "string") return [];
    const args = m.params.arguments ?? {};
    return [{
      name: `mcp_${m.params.name}`.toLowerCase().replace(/[^a-z0-9_:-]/g, "_").slice(0, 64),
      props: { tool: clip(m.params.name), slug: clip(args.slug), query: clip(args.query), category: clip(args.category ?? args.theme), client: clip(userAgent) },
    }];
  });
};

const trackEvents = async (events, userAgent) => {
  if (!events.length) return;
  const who = (clip(events.find((e) => e.client)?.client ?? userAgent) ?? "unknown").toLowerCase();
  await fetch(BATCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: TOKEN,
      batch: events.map(({ name, props }) => ({
        event: name,
        distinct_id: `mcp:${who}`,
        timestamp: new Date().toISOString(),
        properties: { ...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)), $process_person_profile: false, $lib: "netlify-mcp" },
      })),
    }),
    signal: AbortSignal.timeout(4000),
  }).catch(() => {});
};

const withCors = (response) => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

/** What a person sees opening /mcp in a browser: how to connect, not a protocol error. */
const ABOUT = `INSTALANDING.AI MCP server ${VERSION}

This URL is for agents, over MCP (Streamable HTTP). Add it to yours:

  Claude Code   claude mcp add --transport http instalanding https://instalanding.ai/mcp
  Cursor        .cursor/mcp.json → { "mcpServers": { "instalanding": { "url": "https://instalanding.ai/mcp" } } }
  VS Code       .vscode/mcp.json → { "servers": { "instalanding": { "type": "http", "url": "https://instalanding.ai/mcp" } } }

Tools: search_prompts, inspect_prompt, get_prompt, get_demo_source, list_categories,
       search_systems, get_system (design systems), get_motion (motion studies).
Docs: https://instalanding.ai/agents
`;

export default async (request, context) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  if (request.method === "GET" && !(request.headers.get("accept") ?? "").includes("text/event-stream")) {
    return new Response(ABOUT, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
  }

  // Read a copy of the call for the event; the transport still gets the original body.
  if (request.method === "POST") {
    const ua = request.headers.get("user-agent");
    const events = await request.clone().json().then((body) => eventsFor(body, ua), () => []);
    const sent = trackEvents(events, ua);
    if (context?.waitUntil) context.waitUntil(sent);
  }

  const origin = new URL(request.url).origin;
  const server = createServer(libraryFor(origin));
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  try {
    return withCors(await transport.handleRequest(request));
  } finally {
    // The reply is fully buffered (JSON, not a stream), so the server can go.
    await server.close();
  }
};

export const config = { path: "/mcp" };
