#!/usr/bin/env node
/**
 * INSTALANDING.AI — MCP server over stdio.
 *
 * Gives an agent the prompt library without a browser: search it, pull a
 * one-shot prompt, read a single-file demo's source.
 *
 *   claude mcp add instalanding -- npx -y instalanding mcp
 *
 * The same tools are hosted at https://instalanding.ai/mcp (see server.js), so
 * nothing needs installing at all.
 *
 * Point it somewhere else with INSTALANDING_BASE_URL (or --base-url), e.g. at a
 * local dev server while you are adding prompts.
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Library } from "./library.js";
import { VERSION, createServer } from "./server.js";

const argFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index > -1 ? process.argv[index + 1] : undefined;
};

const library = new Library({ baseUrl: argFor("--base-url") });
const server = createServer(library);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is the protocol channel — anything human goes to stderr.
  console.error(`instalanding mcp ${VERSION} → ${library.baseUrl}`);
}

main().catch((error) => {
  console.error("instalanding-mcp failed to start:", error);
  process.exit(1);
});
