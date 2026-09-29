/**
 * Publishes the prompt library as flat files an agent can read without running JS.
 *
 *   /prompts.json        the whole manifest (metadata only, no prompt bodies)
 *   /p/<slug>.txt        one prompt, raw, ready to paste verbatim
 *   /p/<slug>.json       the same prompt with its metadata
 *   /llms.txt            a markdown index, per the llms.txt convention
 *   /sitemap.xml         every crawlable route: the library, the builder pages, the rest
 *
 * Everything is derived from src/data/prompts.ts at build time, so adding an
 * entry there is the only step needed to publish it — nothing here to update.
 *
 * In dev the same paths are served from memory, ahead of the SPA fallback, so
 * the MCP server can be pointed at localhost while you work.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { transformSync } from "esbuild";

const DATA_FILE = "src/data/prompts.ts";
const BUILDERS_FILE = "src/data/builders.ts";

/** Load a TS data module without a bundler: they have no imports by design. */
const loadData = (root, rel) => {
  const file = path.resolve(root, rel);
  const source = readFileSync(file, "utf8");
  const { code } = transformSync(source, { loader: "ts", format: "cjs", target: "es2022" });
  const module = { exports: {} };
  new Function("module", "exports", "require", code)(module, module.exports, () => {
    throw new Error(`${rel} must stay import-free: the library endpoints evaluate it directly.`);
  });
  return module.exports;
};

const loadLibrary = (root) => {
  const { prompts, categories } = loadData(root, DATA_FILE);
  if (!Array.isArray(prompts) || !prompts.length) throw new Error(`No prompts exported from ${DATA_FILE}`);
  return { prompts, categories };
};

const abs = (base, url) => (url ? new URL(url, base).href : undefined);

/** One prompt as agents consume it: metadata plus the URLs that resolve it. */
const toEntry = (entry, base) => ({
  slug: entry.slug,
  title: entry.title,
  category: entry.category,
  categoryLabel: entry.categoryLabel,
  description: entry.description,
  added: entry.added,
  tile: entry.variant,
  preview: entry.preview,
  promptChars: entry.prompt.length,
  /** Rough budget for an agent deciding what it can afford to read. */
  approxPromptTokens: Math.round(entry.prompt.length / 4),
  promptUrl: abs(base, `/p/${entry.slug}.txt`),
  promptJsonUrl: abs(base, `/p/${entry.slug}.json`),
  pageUrl: abs(base, `/prompt/${entry.slug}`),
  demoUrl: abs(base, entry.demo),
  thumbnailUrl: abs(base, entry.thumbnail),
  videoUrl: abs(base, entry.video),
  repoUrl: entry.repoUrl ?? undefined,
  credits: entry.credits ?? undefined,
});

const buildManifest = ({ prompts, categories }, base, siteName) => ({
  name: siteName,
  url: base,
  description:
    "One-shot prompts for landing pages and UI components. Copy a prompt, paste it into any AI builder, ship the component. Free, open source, no account.",
  generated: new Date().toISOString(),
  count: prompts.length,
  license: "MIT",
  usage: {
    prompt: `${base}p/<slug>.txt`,
    promptJson: `${base}p/<slug>.json`,
    index: `${base}llms.txt`,
    mcp: "npx -y instalanding-mcp",
  },
  categories: categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    count: prompts.filter((p) => p.category === c.slug).length,
  })),
  prompts: prompts.map((p) => toEntry(p, base)),
});

const buildLlmsTxt = (manifest, { prompts }) => {
  const lines = [
    `# ${manifest.name}`,
    "",
    `> ${manifest.description}`,
    "",
    "Each prompt below is a complete, self-contained brief: paste one into an AI builder and it",
    "produces a single working file. Fetch only the prompts you need — the whole library is large.",
    "",
    `- Manifest (all metadata, one fetch): ${manifest.url}prompts.json`,
    `- Any prompt, raw text: ${manifest.url}p/<slug>.txt`,
    `- MCP server (search and fetch without a browser): npx -y instalanding-mcp`,
    "",
  ];

  for (const category of manifest.categories) {
    if (!category.count) continue;
    lines.push(`## ${category.label}`, "");
    for (const entry of prompts.filter((p) => p.category === category.slug)) {
      lines.push(
        `- [${entry.title}](${manifest.url}p/${entry.slug}.txt): ${entry.description}` +
          ` (~${Math.round(entry.prompt.length / 4)} tokens${entry.demo ? ", live demo" : ""})`
      );
    }
    lines.push("");
  }

  lines.push(
    "## Notes",
    "",
    "- Prompts are prose briefs, not code. They name the stack, the structure and the details that",
    "  usually get missed; the builder writes the code.",
    "- Demos are single HTML files with every asset inlined. They run from `file://` with no build step.",
    "- Slugs are stable. Prompts may be revised in place; `prompts.json` carries a `generated` timestamp.",
    ""
  );
  return lines.join("\n");
};

/**
 * Every route worth crawling. The builder pages are the reason this exists —
 * they live at their own search terms and are only linked from the menu and
 * each other, so a sitemap is the difference between ten pages and none.
 */
const buildSitemap = (library, builders, base) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: base, priority: "1.0" },
    { loc: `${base}builders`, priority: "0.9" },
    { loc: `${base}about`, priority: "0.4" },
    ...builders.map((b) => ({ loc: `${base}${b.path.replace(/^\//, "")}`, priority: "0.9" })),
    // product has a section route of its own; the rest sit under /category/
    ...library.categories.map((c) => ({
      loc: c.slug === "product" ? `${base}product` : `${base}category/${c.slug}`,
      priority: "0.5",
    })),
    // Same filter the grid uses: a hidden entry, or one with nothing to show,
    // has a route but nothing worth crawling.
    ...library.prompts
      .filter((p) => !p.hidden && (p.demo || p.repoUrl))
      .map((p) => ({ loc: `${base}prompt/${p.slug}`, priority: "0.8" })),
  ];
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (u) =>
        `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><priority>${u.priority}</priority></url>`
    ),
    "</urlset>",
    "",
  ].join("\n");
};

/** Build every published file as { path: contents }. */
const renderFiles = (library, builders, base, siteName) => {
  const manifest = buildManifest(library, base, siteName);
  const files = {
    "prompts.json": JSON.stringify(manifest, null, 2),
    "llms.txt": buildLlmsTxt(manifest, library),
    "sitemap.xml": buildSitemap(library, builders, base),
  };
  for (const entry of library.prompts) {
    files[`p/${entry.slug}.txt`] = entry.prompt;
    files[`p/${entry.slug}.json`] = JSON.stringify(
      { ...toEntry(entry, base), prompt: entry.prompt },
      null,
      2
    );
  }
  return files;
};

const contentType = (file) =>
  file.endsWith(".json")
    ? "application/json; charset=utf-8"
    : file.endsWith(".xml")
      ? "application/xml; charset=utf-8"
      : "text/plain; charset=utf-8";

/**
 * @param {{ siteUrl?: string, siteName?: string }} options
 */
export default function libraryEndpoints(options = {}) {
  const siteName = options.siteName ?? "INSTALANDING.AI";
  // Trailing slash keeps new URL(path, base) from eating the last segment.
  const base = (options.siteUrl ?? "https://instalanding.ai").replace(/\/*$/, "/");
  let root = process.cwd();

  return {
    name: "library-endpoints",
    configResolved(config) {
      root = config.root;
    },

    configureServer(server) {
      // Registered directly (not in a returned hook) so it runs before the SPA
      // fallback, which would otherwise answer /p/*.txt with index.html.
      server.middlewares.use((req, res, next) => {
        const pathname = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\/+/, "");
        if (!/^(prompts\.json|llms\.txt|sitemap\.xml|p\/[^/]+\.(txt|json))$/.test(pathname))
          return next();
        let files;
        try {
          files = renderFiles(
            loadLibrary(root),
            loadData(root, BUILDERS_FILE).builders,
            `http://${req.headers.host}/`,
            siteName
          );
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          return res.end(`library-endpoints: ${error.message}`);
        }
        const body = files[pathname];
        if (body === undefined) {
          res.statusCode = 404;
          res.setHeader("content-type", "text/plain; charset=utf-8");
          return res.end(`Not in the library: ${pathname}`);
        }
        res.setHeader("content-type", contentType(pathname));
        res.setHeader("access-control-allow-origin", "*");
        res.setHeader("cache-control", "no-store");
        res.end(body);
      });
    },

    generateBundle() {
      const files = renderFiles(loadLibrary(root), loadData(root, BUILDERS_FILE).builders, base, siteName);
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: "asset", fileName, source });
      }
      this.info?.(`library-endpoints: emitted ${Object.keys(files).length} files for agents`);
    },
  };
}
