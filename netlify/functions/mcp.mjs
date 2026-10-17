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

Tools: search_prompts, inspect_prompt, get_prompt, get_demo_source, list_categories.
Docs: https://instalanding.ai/agents
`;

export default async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  if (request.method === "GET" && !(request.headers.get("accept") ?? "").includes("text/event-stream")) {
    return new Response(ABOUT, { headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
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
