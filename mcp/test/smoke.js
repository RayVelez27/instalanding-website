#!/usr/bin/env node
/**
 * End-to-end check: spawns the server over real stdio MCP and exercises every
 * tool and resource against a running library.
 *
 *   node test/smoke.js                       # against the public site
 *   node test/smoke.js http://localhost:8081 # against a local dev server
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import path from "node:path";

const baseUrl = process.argv[2] ?? process.env.INSTALANDING_BASE_URL ?? "https://instalanding.ai";
const serverPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/index.js");

let failures = 0;
const check = (label, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
};
const bodyOf = (result) => result.content.map((part) => part.text ?? "").join("\n");

const client = new Client({ name: "smoke", version: "0.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath, "--base-url", baseUrl],
  stderr: "pipe",
});

try {
  await client.connect(transport);
  console.log(`connected to instalanding-mcp → ${baseUrl}\n`);

  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  check(
    "tools advertised",
    ["get_demo_source", "get_prompt", "inspect_prompt", "list_categories", "search_prompts"].every((n) =>
      names.includes(n)
    ),
    names.join(", ")
  );
  check(
    "tools describe their inputs",
    tools.every((t) => t.description && t.inputSchema),
    `${tools.length} tools`
  );

  const categories = await client.callTool({ name: "list_categories", arguments: {} });
  check("list_categories", !categories.isError && /prompts/.test(bodyOf(categories)),
    bodyOf(categories).split("\n")[0]);

  const search = await client.callTool({
    name: "search_prompts",
    arguments: { query: "fire button", limit: 3 },
  });
  const searchText = bodyOf(search);
  const slug = searchText.match(/slug: ([a-z0-9-]+)/)?.[1];
  check("search_prompts finds something", !search.isError && Boolean(slug), `first slug: ${slug}`);

  const filtered = await client.callTool({
    name: "search_prompts",
    arguments: { category: "forms", limit: 5 },
  });
  check("search_prompts filters by category", !filtered.isError, bodyOf(filtered).split("\n")[0]);

  const miss = await client.callTool({ name: "search_prompts", arguments: { query: "zzzznope" } });
  check(
    "empty search explains itself",
    !miss.isError && /Nothing matched/.test(bodyOf(miss)),
    bodyOf(miss).slice(0, 60)
  );

  const inspect = await client.callTool({ name: "inspect_prompt", arguments: { slug } });
  check(
    "inspect_prompt reports stack and next steps",
    !inspect.isError && /Stack/.test(bodyOf(inspect)) && /get_prompt/.test(bodyOf(inspect)),
    bodyOf(inspect).split("\n")[0]
  );

  const prompt = await client.callTool({ name: "get_prompt", arguments: { slug } });
  const promptText = bodyOf(prompt);
  check(
    "get_prompt returns the brief",
    !prompt.isError && promptText.includes("ONE-SHOT PROMPT") && promptText.length > 400,
    `${promptText.length} chars`
  );

  const raw = await client.callTool({
    name: "get_prompt",
    arguments: { slug, metadata: false },
  });
  check(
    "get_prompt metadata:false is raw",
    !raw.isError && !bodyOf(raw).includes("ONE-SHOT PROMPT"),
    `${bodyOf(raw).length} chars`
  );

  const badSlug = await client.callTool({ name: "get_prompt", arguments: { slug: "does-not-exist" } });
  check(
    "unknown slug fails helpfully",
    badSlug.isError && /search_prompts/.test(bodyOf(badSlug)),
    bodyOf(badSlug).slice(0, 80)
  );

  const demoInfo = await client.callTool({ name: "get_demo_source", arguments: { slug } });
  check(
    "get_demo_source reports size first",
    !demoInfo.isError && /characters/.test(bodyOf(demoInfo)),
    bodyOf(demoInfo).split("\n")[1]
  );

  const demoInline = await client.callTool({
    name: "get_demo_source",
    arguments: { slug, inline: true, maxChars: 2000 },
  });
  check(
    "get_demo_source inlines and truncates",
    !demoInline.isError &&
      /<!doctype html>/i.test(bodyOf(demoInline)) &&
      bodyOf(demoInline).length < 4000,
    `${bodyOf(demoInline).length} chars`
  );

  const { resources } = await client.listResources();
  check("resources listed", resources.length > 0, `${resources.length} prompts`);
  if (resources.length) {
    const read = await client.readResource({ uri: resources[0].uri });
    check(
      "resource reads as prompt text",
      read.contents?.[0]?.text?.length > 100,
      resources[0].uri
    );
  }
} catch (error) {
  failures++;
  console.log(`FAIL  transport — ${error?.message ?? error}`);
} finally {
  await client.close().catch(() => {});
}

console.log(`\n${failures ? `${failures} failing check(s)` : "all checks passed"}`);
process.exit(failures ? 1 : 0);
