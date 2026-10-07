#!/usr/bin/env node
/**
 * INSTALANDING.AI — MCP server.
 *
 * Gives an agent the prompt library without a browser: search it, pull a
 * one-shot prompt, read a single-file demo's source.
 *
 *   claude mcp add instalanding -- npx -y instalanding mcp
 *
 * Point it somewhere else with INSTALANDING_BASE_URL (or --base-url), e.g. at a
 * local dev server while you are adding prompts.
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DEMO_INLINE_LIMIT, Library, LibraryError, formatInspect, rank } from "./library.js";

const VERSION = "0.2.0";

const argFor = (flag) => {
  const index = process.argv.indexOf(flag);
  return index > -1 ? process.argv[index + 1] : undefined;
};

const library = new Library({ baseUrl: argFor("--base-url") });

/* ── helpers ─────────────────────────────────────────────────────────── */

const text = (value) => ({ content: [{ type: "text", text: value }] });

const failure = (error) => ({
  isError: true,
  content: [
    {
      type: "text",
      text:
        error instanceof LibraryError
          ? error.message
          : `Unexpected error: ${String(error?.message ?? error)}`,
    },
  ],
});

/** Every tool answers, never throws: an agent can act on a message. */
const guard = (handler) => async (args) => {
  try {
    return await handler(args ?? {});
  } catch (error) {
    return failure(error);
  }
};

const describe = (entry) =>
  [
    `### ${entry.title}`,
    `slug: ${entry.slug}`,
    `category: ${entry.categoryLabel ?? entry.category}`,
    `${entry.description}`,
    entry.bestFor?.length ? `best for: ${entry.bestFor.join(", ")}` : null,
    entry.style?.length ? `style: ${entry.style.join(", ")}` : null,
    `prompt: ~${entry.approxPromptTokens ?? Math.round((entry.promptChars ?? 0) / 4)} tokens · get_prompt("${entry.slug}")`,
    entry.demoUrl
      ? `demo: ${entry.demoUrl}`
      : entry.repoUrl
        ? `code: ${entry.repoUrl} (repository, not a single file)`
        : "demo: none (prompt only)",
    entry.credits?.length
      ? `built on: ${entry.credits.map((c) => `${c.label} — ${c.href}`).join("; ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

/* ── server ──────────────────────────────────────────────────────────── */

const server = new McpServer(
  { name: "instalanding", version: VERSION },
  {
    instructions:
      "The INSTALANDING.AI library of one-shot prompts for landing pages and UI components. " +
      "Search with search_prompts (plain words: what it is for and how it should look), " +
      "check a candidate with inspect_prompt (stack, sections, best-for, size — cheap), then " +
      "get_prompt to read the full brief and build from it. Prompts are prose briefs, not code — " +
      "follow the brief and write the code yourself, in the user's stack. get_demo_source returns " +
      "a working reference implementation as a single HTML file, which is large: read it only when " +
      "the prompt alone is not enough, and lift sections by their data-section attribute.",
  }
);

server.registerTool(
  "search_prompts",
  {
    title: "Search prompts",
    description:
      "Find one-shot prompts by what you want to build ('pricing table', 'rive button', " +
      "'three.js hero'). Returns matching prompts with their slugs. Omit the query to browse.",
    inputSchema: {
      query: z.string().optional().describe("What you want to build. Plain words work best."),
      category: z
        .enum(["web", "motion", "product", "navigation", "forms"])
        .optional()
        .describe("Restrict to one category."),
      limit: z.number().int().min(1).max(50).optional().describe("Max results (default 8)."),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  guard(async ({ query, category, limit }) => {
    const manifest = await library.manifest();
    const pool = category
      ? manifest.prompts.filter((entry) => entry.category === category)
      : manifest.prompts;
    const results = rank(pool, query, limit ?? 8);

    if (!results.length) {
      return text(
        `Nothing matched${query ? ` "${query}"` : ""}${category ? ` in ${category}` : ""}. ` +
          `The library has ${manifest.count} prompts across ${manifest.categories
            .map((c) => `${c.slug} (${c.count})`)
            .join(", ")}. Try a broader word, or call list_categories.`
      );
    }

    return text(
      [
        `${results.length} of ${pool.length} prompts${query ? ` for "${query}"` : ""}:`,
        "",
        ...results.map(describe),
        "",
        `Then: inspect_prompt("<slug>") to check the fit, get_prompt("<slug>") for the full brief.`,
      ].join("\n\n")
    );
  })
);

server.registerTool(
  "inspect_prompt",
  {
    title: "Inspect a prompt",
    description:
      "Check whether an entry fits before reading it: its stack (libraries, fonts, WebGL/canvas), " +
      "its sections in order, what it is best for, its style, and the size of the prompt and demo. " +
      "A few hundred tokens — much cheaper than get_prompt.",
    inputSchema: {
      slug: z.string().describe('Prompt slug, e.g. "monax-analytics-landing-page".'),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  guard(async ({ slug }) => text(formatInspect(await library.entry(slug))))
);

server.registerTool(
  "get_prompt",
  {
    title: "Get a one-shot prompt",
    description:
      "Return the complete one-shot prompt for a slug — the brief to build the component from. " +
      "Use the slug exactly as search_prompts reported it.",
    inputSchema: {
      slug: z.string().describe('Prompt slug, e.g. "rive-fire-button".'),
      metadata: z
        .boolean()
        .optional()
        .describe("Prepend a short metadata header (default true). Set false for the raw prompt."),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  guard(async ({ slug, metadata = true }) => {
    const { entry, text: prompt } = await library.promptText(slug);
    if (!metadata) return text(prompt);
    return text(
      [
        `# ${entry.title}`,
        `${entry.description}`,
        `category: ${entry.categoryLabel ?? entry.category} · page: ${entry.pageUrl}`,
        entry.demoUrl
          ? `reference implementation: ${entry.demoUrl} (get_demo_source)`
          : entry.repoUrl
            ? `reference implementation: ${entry.repoUrl} (a repository — read it there)`
            : null,
        entry.credits?.length
          ? `built on: ${entry.credits.map((c) => `${c.label} — ${c.href}`).join("; ")}`
          : null,
        "",
        "--- ONE-SHOT PROMPT ---",
        "",
        prompt,
      ]
        .filter((line) => line !== null)
        .join("\n")
    );
  })
);

server.registerTool(
  "get_demo_source",
  {
    title: "Get a demo's source",
    description:
      "Return the built reference implementation for a prompt: one self-contained HTML file with " +
      "every asset inlined. These run 40–160 KB, so by default this reports the size and how to " +
      "fetch it; pass inline: true to read it into the conversation. A few entries live in their " +
      "own repository instead — this reports where.",
    inputSchema: {
      slug: z.string().describe('Prompt slug, e.g. "rive-fire-button".'),
      inline: z
        .boolean()
        .optional()
        .describe("Return the file contents (default false — costly in tokens)."),
      maxChars: z
        .number()
        .int()
        .min(1000)
        .max(400_000)
        .optional()
        .describe(`Truncate inlined source (default ${DEMO_INLINE_LIMIT}).`),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  guard(async ({ slug, inline = false, maxChars }) => {
    const { entry, source } = await library.demoSource(slug);
    const limit = maxChars ?? DEMO_INLINE_LIMIT;

    if (!inline) {
      return text(
        [
          `${entry.title} — demo source`,
          `${source.length.toLocaleString()} characters (~${Math.round(
            source.length / 4
          ).toLocaleString()} tokens), single HTML file, all assets inlined.`,
          `URL: ${entry.demoUrl}`,
          "",
          `To read it here: get_demo_source({ slug: "${entry.slug}", inline: true }).`,
          `To build instead of copy: get_prompt("${entry.slug}") — the brief is far cheaper.`,
        ].join("\n")
      );
    }

    const truncated = source.length > limit;
    return text(
      [
        `${entry.title} — ${entry.demoUrl}`,
        truncated
          ? `Showing the first ${limit.toLocaleString()} of ${source.length.toLocaleString()} characters. ` +
            `Fetch the URL directly for the rest.`
          : `Complete file, ${source.length.toLocaleString()} characters.`,
        "",
        truncated ? source.slice(0, limit) : source,
      ].join("\n")
    );
  })
);

server.registerTool(
  "list_categories",
  {
    title: "List categories",
    description: "What the library holds, by category, with counts and how fresh it is.",
    inputSchema: {},
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  guard(async () => {
    const manifest = await library.manifest();
    return text(
      [
        `${manifest.name} — ${manifest.count} one-shot prompts`,
        manifest.description,
        `source: ${manifest.url} · generated ${manifest.generated}`,
        "",
        ...manifest.categories.map(
          (category) =>
            `- ${category.label} (${category.slug}): ${category.count} prompt${
              category.count === 1 ? "" : "s"
            }`
        ),
        "",
        `search_prompts({ category: "web" }) to browse one.`,
      ].join("\n")
    );
  })
);

/* Each prompt is also a resource, so clients that attach context can pick one. */
server.registerResource(
  "prompt",
  new ResourceTemplate("instalanding://prompt/{slug}", {
    list: async () => {
      try {
        const manifest = await library.manifest();
        return {
          resources: manifest.prompts.map((entry) => ({
            uri: `instalanding://prompt/${entry.slug}`,
            name: entry.title,
            description: entry.description,
            mimeType: "text/plain",
          })),
        };
      } catch {
        return { resources: [] };
      }
    },
  }),
  {
    title: "One-shot prompt",
    description: "The full brief for one component in the library.",
    mimeType: "text/plain",
  },
  async (uri, { slug }) => {
    const { text: prompt } = await library.promptText(slug);
    return { contents: [{ uri: uri.href, mimeType: "text/plain", text: prompt }] };
  }
);

/* ── boot ────────────────────────────────────────────────────────────── */

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
