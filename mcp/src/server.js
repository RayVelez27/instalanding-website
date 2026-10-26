/**
 * INSTALANDING.AI — the MCP server's tools and resources, shared by both ways
 * of running it:
 *
 *   hosted   claude mcp add --transport http instalanding https://instalanding.ai/mcp
 *   local    claude mcp add instalanding -- npx -y instalanding mcp
 */
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DEMO_INLINE_LIMIT, LibraryError, formatInspect, rank } from "./library.js";

export const VERSION = "0.3.0";

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

/** A design system as a search result: enough to choose one */
const describeSystem = (s) =>
  [
    `### ${s.name} (${s.slug}@${s.version})`,
    `slug: ${s.slug}`,
    `${s.tagline}`,
    `theme: ${s.theme} · tags: ${s.tags.join(", ")}`,
    `${s.components.length} components${s.tokenCount ? ` · ${s.tokenCount} tokens` : ""} · classes ${s.prefix}- under .${s.rootClass}`,
    s.pages?.length ? `extracted from: ${s.pages.map((p) => `${p.title} (${p.slug})`).join(", ")}` : null,
    `apply it: get_system("${s.slug}")`,
  ]
    .filter(Boolean)
    .join("\n");

/** A motion study's choreography as plain lines: what moves, when, on which ease */
const choreography = (m) => {
  const c = m.choreography;
  return [
    `${c.of}: ${c.life}${c.stagger ? `, ${c.elements} elements ${c.stagger} apart` : ""}`,
    ...c.tracks.map((t) => `- ${t.prop}: ${t.change} · ${t.from}s → ${t.to}s · ${t.ease}${t.yoyo ? " · yoyo" : ""}`),
  ].join("\n");
};

/* ── server ──────────────────────────────────────────────────────────── */

/**
 * Builds the server with every tool and resource registered. Transport-free:
 * index.js connects it to stdio (npx), the site's /mcp function to HTTP.
 *
 * @param {Library} library  where the prompts are read from
 */
export function createServer(library) {
  const server = new McpServer(
    { name: "instalanding", version: VERSION },
    {
      instructions:
        "The INSTALANDING.AI library of landing pages and UI components, each one a single HTML file. " +
        "Search with search_prompts (plain words: what it is for and how it should look), " +
        "check a candidate with inspect_prompt (stack, sections, best-for, size — cheap), then " +
        "get_prompt for the one you pick. A prompt is code, not prose: a short instruction (keep the " +
        "design, replace the fictional brand and copy, convert to the user's stack if they have one) " +
        "followed by the page's whole HTML file, which is the specification. get_demo_source returns " +
        "the same file without the instruction. Most run 15,000–60,000 tokens (inspect_prompt gives the size); to take one part, " +
        "lift it by its data-section attribute. " +
        "The library has two more layers. Design systems: search_systems, then get_system for an " +
        "instruction (tokens inline) that restyles an existing project in that language. Motion studies: " +
        "get_motion lists them; get_motion(slug) gives the choreography as data and the one-shot prompt. " +
        "Pages name their system and the motion that pairs with them, and vice versa.",
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
          `Then: inspect_prompt("<slug>") to check the fit, get_prompt("<slug>") for the prompt (instruction + code).`,
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
        "Return the one-shot prompt for a slug: a short instruction, then the page's whole HTML file. " +
        "Build the page from it as the instruction says. " +
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
          entry.system ? `design system: ${entry.system.name} — get_system("${entry.system.slug}")` : null,
          entry.motion?.length ? `motion that pairs: ${entry.motion.map((m) => `${m.title} — get_motion("${m.slug}")`).join("; ")}` : null,
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
        "Return the code alone — the same HTML file get_prompt carries, without the instruction: " +
        "one self-contained file with " +
        "every asset inlined. Most run 60–240 KB, so by default this reports the size and how to " +
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
            `With the instruction on top: get_prompt("${entry.slug}").`,
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

  server.registerTool(
    "search_systems",
    {
      title: "Search design systems",
      description:
        "Find a design system to restyle a project with: tokens as CSS custom properties plus working " +
        "components, each extracted from a real page in the library. Search by look ('dark industrial', " +
        "'editorial serif', 'y2k'). Omit the query to list them all.",
      inputSchema: {
        query: z.string().optional().describe("The look you want, in plain words."),
        theme: z.enum(["dark", "light"]).optional().describe("Only dark or only light systems."),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    guard(async ({ query, theme }) => {
      const manifest = await library.systemsManifest();
      const pool = theme ? manifest.systems.filter((s) => s.theme === theme) : manifest.systems;
      // The page ranker, fed each system's own words
      const shaped = pool.map((s) => ({
        slug: s.slug,
        title: s.name,
        description: `${s.tagline}. ${s.description}`,
        category: "system",
        style: s.tags,
        theme: s.theme,
        bestFor: (s.pages ?? []).map((p) => p.title),
        sections: s.components.map((c) => c.label),
        system: s,
      }));
      const results = rank(shaped, query, 10).map((r) => r.system);
      if (!results.length) {
        return text(
          `No design system matched${query ? ` "${query}"` : ""}. The library has ${manifest.count}: ` +
            `${manifest.systems.map((s) => `${s.name} (${s.slug}, ${s.theme})`).join(", ")}.`
        );
      }
      return text(
        [
          `${results.length} of ${pool.length} design systems${query ? ` for "${query}"` : ""}:`,
          "",
          ...results.map(describeSystem),
          "",
          `Then: get_system("<slug>") for the instruction to apply it, tokens included.`,
        ].join("\n\n")
      );
    })
  );

  server.registerTool(
    "get_system",
    {
      title: "Get a design system",
      description:
        "Return the instruction for applying one design system to the user's existing project: where its " +
        "CSS, tokens, specimen and fonts live, its conventions, step-by-step how to apply it without touching " +
        "logic, and every token inline. Follow it in the user's codebase.",
      inputSchema: {
        slug: z.string().describe('Design system slug, e.g. "kiln".'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    guard(async ({ slug }) => {
      const { entry, text: instruction } = await library.systemInstruction(slug);
      return text(
        [
          `# ${entry.name} · ${entry.slug}@${entry.version}`,
          `${entry.tagline}`,
          `page: ${entry.pageUrl} · specimen: ${entry.files.specimen}`,
          entry.pages?.length
            ? `pages in this language: ${entry.pages.map((p) => `${p.title} — get_prompt("${p.slug}")`).join("; ")}`
            : null,
          entry.motion?.length ? `motion that pairs: ${entry.motion.map((m) => `get_motion("${m.slug}")`).join(", ")}` : null,
          "",
          "--- INSTRUCTION ---",
          "",
          instruction,
        ]
          .filter((line) => line !== null)
          .join("\n")
      );
    })
  );

  server.registerTool(
    "get_motion",
    {
      title: "Get a motion study",
      description:
        "Motion studies are one movement each (a carousel, an accordion, a loop) with a single-file demo. " +
        "With no slug, list them. With a slug, return the choreography as data (what moves, from when to " +
        "when, on which ease), the inputs, how it works, the pages it pairs with, and the one-shot prompt " +
        "to build it.",
      inputSchema: {
        slug: z.string().optional().describe('Motion study slug, e.g. "coverflow-carousel". Omit to list.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    guard(async ({ slug }) => {
      if (!slug) {
        const manifest = await library.motionManifest();
        return text(
          [
            `${manifest.count} motion studies:`,
            "",
            ...manifest.motion.map((m) =>
              [
                `### ${m.title}`,
                `slug: ${m.slug} · ${m.kind.toLowerCase()} · ${m.library.name} ${m.library.version}`,
                m.tagline,
                `best for: ${m.bestFor.join(", ")}`,
                `get_motion("${m.slug}")`,
              ].join("\n")
            ),
          ].join("\n\n")
        );
      }
      const { entry: m, text: prompt } = await library.motionPrompt(slug);
      return text(
        [
          `# ${m.title}`,
          m.description,
          `stack: ${[`${m.library.name} ${m.library.version}`, ...m.library.plugins].join(", ")}, one HTML file · demo: ${m.demoUrl} · page: ${m.pageUrl}`,
          "",
          "CHOREOGRAPHY",
          choreography(m),
          "",
          "INPUTS",
          ...m.inputs.map((i) => `- ${i}`),
          "",
          `HOW IT WORKS · ${m.trick.title}`,
          ...m.trick.steps.map((s, i) => `${i + 1}. ${s}`),
          m.pairsWith?.length ? `\nPAIRS WITH: ${m.pairsWith.map((p) => `${p.title} — get_prompt("${p.slug}")`).join("; ")}` : null,
          m.credits?.length ? `BUILT ON: ${m.credits.map((c) => `${c.label} — ${c.href}`).join("; ")}` : null,
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
      description: "One page's prompt: a short instruction, then its whole HTML file.",
      mimeType: "text/plain",
    },
    async (uri, { slug }) => {
      const { text: prompt } = await library.promptText(slug);
      return { contents: [{ uri: uri.href, mimeType: "text/plain", text: prompt }] };
    }
  );

  return server;
}
