import { useSyncExternalStore } from "react";
import type { PromptEntry } from "@/data/prompts";

/**
 * The CLI (and a local, stdio copy of the MCP server) ship as one npm package,
 * `instalanding`. Until it is published, the npx lines would fail, so they stay
 * hidden. The hosted MCP server at MCP_URL does not depend on npm and works today.
 * Flip this when the package is live.
 */
export const NPM_PUBLISHED = false;

/** Agents are handed production URLs, never the dev server's origin. */
export const SITE_URL = "https://instalanding.ai";

/** The hosted MCP server (netlify/functions/mcp.mjs): connect with a URL, install nothing. */
export const MCP_URL = `${SITE_URL}/mcp`;

/** How each client adds the hosted server. Shared by Agent Mode and /agents so they never disagree. */
export const MCP_CLIENTS: { name: string; where: string; block: string }[] = [
  {
    name: "Claude Code",
    where: "terminal",
    block: `claude mcp add --transport http instalanding ${MCP_URL}`,
  },
  {
    name: "Cursor",
    where: ".cursor/mcp.json",
    block: `{
  "mcpServers": {
    "instalanding": { "url": "${MCP_URL}" }
  }
}`,
  },
  {
    name: "VS Code",
    where: ".vscode/mcp.json",
    block: `{
  "servers": {
    "instalanding": { "type": "http", "url": "${MCP_URL}" }
  }
}`,
  },
  {
    name: "Codex",
    where: "~/.codex/config.toml",
    block: `[mcp_servers.instalanding]
url = "${MCP_URL}"`,
  },
  {
    name: "OpenCode",
    where: "opencode.json",
    block: `{
  "mcp": {
    "instalanding": { "type": "remote", "url": "${MCP_URL}" }
  }
}`,
  },
  {
    name: "Claude app",
    where: "Settings → Connectors → Add custom connector",
    block: MCP_URL,
  },
  ...(NPM_PUBLISHED
    ? [{ name: "Local (npx)", where: "any client, over stdio", block: "claude mcp add instalanding -- npx -y instalanding mcp" }]
    : []),
];

/**
 * Agent Mode: the library shown to someone who will hand it to their own agent
 * (Claude Code, Cursor, Codex…). Nothing is asked of them — no key, no login —
 * so the whole mode is one boolean, remembered per browser.
 */
const STORAGE_KEY = "instalanding.agentMode";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

let enabled = read();

export const setAgentMode = (next: boolean) => {
  enabled = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* storage blocked: the mode still holds for this visit */
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useAgentMode = () => useSyncExternalStore(subscribe, () => enabled, () => false);

/** The one-line fetch an agent runs for this entry's brief. */
export const agentCommand = (slug: string) =>
  NPM_PUBLISHED ? `npx -y instalanding get ${slug}` : `curl -s ${SITE_URL}/p/${slug}.txt`;

/** What a tile's copy button puts on the clipboard in Agent Mode: a task, not the raw brief. */
export const agentHandoff = (entry: PromptEntry) => {
  // No single-file page means no code to hand over: the written brief goes inline instead.
  if (!entry.demo) {
    return [
      `Build "${entry.title}" from INSTALANDING.AI in this project.`,
      entry.repoUrl ? `Code: ${entry.repoUrl}` : null,
      "",
      entry.prompt,
    ]
      .filter((line) => line !== null)
      .join("\n");
  }
  return [
    `Build "${entry.title}" from INSTALANDING.AI in this project.`,
    `Prompt (a short instruction, then the page's whole HTML file): ${SITE_URL}/p/${entry.slug}.txt`,
    `The code alone (one HTML file, opens from disk): ${SITE_URL}${entry.demo}`,
    `If the instalanding MCP server is connected (${MCP_URL}), get_prompt("${entry.slug}") returns the same prompt.`,
    "",
    "Fetch the prompt and do what its instruction says: keep the page's layout, design values and motion exactly; replace the fictional brand, copy and numbers with mine; convert it to this project's stack. Verify in a real browser: no console errors, no horizontal scroll at 390px, reduced motion respected.",
  ]
    .filter((line) => line !== null)
    .join("\n");
};
