/**
 * Publishes the prompt library as flat files an agent can read without running JS.
 *
 *   /prompts.json        the whole manifest (metadata only, no prompt bodies)
 *   /p/<slug>.txt        one prompt, raw, ready to paste verbatim
 *   /p/<slug>.json       the same prompt with its metadata
 *   /llms.txt            a markdown index, per the llms.txt convention
 *   /systems.json        every design system: tokens, components, files, linked pages
 *   /s/<slug>.txt        one system's agent instruction, tokens inline
 *   /motion.json         every motion study: choreography, inputs, linked pages
 *   /m/<slug>.txt        one motion study's one-shot prompt
 *   /SKILL.md            the agent skill (source: mcp/SKILL.md, also shipped with the CLI)
 *   /sitemap.xml         every crawlable route: the library, the builder pages, the rest
 *   /<slug>/index.html   static search landing pages (src/data/seoPages.ts, see seo-pages.mjs)
 *
 * Everything is derived from src/data/prompts.ts at build time, so adding an
 * entry there is the only step needed to publish it — nothing here to update.
 *
 * In dev the same paths are served from memory, ahead of the SPA fallback, so
 * the MCP server can be pointed at localhost while you work.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { transformSync } from "esbuild";
import { renderSeoPages, seoSitemapUrls, seoLlmsLines } from "./seo-pages.mjs";

const DATA_FILE = "src/data/prompts.ts";
const BUILDERS_FILE = "src/data/builders.ts";
const SEO_FILE = "src/data/seoPages.ts";
const SKILL_FILE = "mcp/SKILL.md";
const SYSTEMS_FILE = "src/data/systems.ts";
const MOTION_FILE = "src/data/motion.ts";
// Only type imports, which esbuild drops, so loadData can read it like the data files
const SYSTEM_AGENT_FILE = "src/lib/systemAgent.ts";

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
  // Video entries (GOSPEL) live in the feed but are not templates: no prompt to
  // build from and nothing for an agent to copy, so the endpoints never list them.
  const templates = prompts.filter((p) => !p.youtube);
  const used = new Set(templates.map((p) => p.category));
  return { prompts: templates, categories: categories.filter((c) => used.has(c.slug)) };
};

const abs = (base, url) => (url ? new URL(url, base).href : undefined);

/**
 * What an agent needs to know about a demo before it pays to read it, read off
 * the file itself so it can never disagree with the code:
 *
 *   sections  the data-section names in document order. Matches the HTML
 *             attribute and the JS forms ("data-section":"hero", dataset.section
 *             = "hero") so demos that build their DOM in script are covered too.
 *   stack     CDN libraries with versions, Google Fonts families, and the
 *             rendering features in play. Never a build step, by construction.
 */
const readDemo = (root, demo) => {
  if (!demo) return {};
  const file = path.resolve(root, "public", demo.replace(/^\/+/, ""));
  if (!existsSync(file)) return {};
  const html = readFileSync(file, "utf8");

  const sections = [];
  const sectionPattern =
    /data-section["']?\s*[:=]\s*["']([a-z0-9-]+)["']|dataset\.section\s*=\s*["']([a-z0-9-]+)["']/g;
  for (const m of html.matchAll(sectionPattern)) {
    const name = m[1] ?? m[2];
    if (!sections.includes(name)) sections.push(name);
  }

  const libraries = new Map();
  const cdns = [
    [/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/([^/"'\s]+)\/([^/"'\s]+)\//g, "cdnjs"],
    [/https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/@"'\s]+\/)?[^/@"'\s]+)@([^/"'\s]+)/g, "jsdelivr"],
    [/https:\/\/unpkg\.com\/((?:@[^/@"'\s]+\/)?[^/@"'\s]+)@([^/"'\s]+)/g, "unpkg"],
    [/https:\/\/esm\.sh\/((?:@[^/@"'\s]+\/)?[^/@"'\s]+)@([^/"'\s?]+)/g, "esm.sh"],
  ];
  for (const [pattern, cdn] of cdns) {
    for (const m of html.matchAll(pattern)) {
      // cdnjs names some packages after their site ("three.js"); npm does not.
      const name = cdn === "cdnjs" ? m[1].replace(/\.js$/, "") : m[1];
      if (!libraries.has(name)) libraries.set(name, { name, version: m[2], cdn });
    }
  }

  const fonts = new Set();
  for (const m of html.matchAll(/fonts\.googleapis\.com\/css2?\?([^"'\s)]+)/g)) {
    for (const f of m[1].replace(/&amp;/g, "&").matchAll(/family=([^:&]+)/g)) {
      fonts.add(decodeURIComponent(f[1]).replace(/\+/g, " "));
    }
  }

  const features = [
    [/getContext\(\s*["'](?:webgl2?|experimental-webgl)["']/, "webgl"],
    [/getContext\(\s*["']2d["']/, "canvas-2d"],
    [/<svg[\s>]/, "inline-svg"],
    [/customElements\.define\(/, "web-component"],
    // A demo shipped as a production React build, inlined: editable, but minified.
    [/react\.dev\/errors\//, "inlined-react-bundle"],
    [/data:font\//, "inlined-fonts"],
    [/data:image\//, "inlined-images"],
    [/prefers-reduced-motion/, "reduced-motion"],
  ]
    .filter(([pattern]) => pattern.test(html))
    .map(([, name]) => name);

  return {
    sections,
    stack: {
      format: "single-file-html",
      buildStep: false,
      libraries: [...libraries.values()],
      fonts: [...fonts],
      features,
    },
    demoBytes: Buffer.byteLength(html),
  };
};

/**
 * The three layers, linked: which system a page was extracted into, which
 * motion studies pair with it. Built once per render from the data files.
 */
const loadLayers = (root) => {
  const { systems = [] } = existsSync(path.resolve(root, SYSTEMS_FILE)) ? loadData(root, SYSTEMS_FILE) : {};
  const { motions = [] } = existsSync(path.resolve(root, MOTION_FILE)) ? loadData(root, MOTION_FILE) : {};
  return { systems, motions };
};

const pageLinks = (slug, layers, base) => {
  const system = layers.systems.find((s) => s.templates.includes(slug));
  const motion = layers.motions.filter((m) => m.pairsWith.includes(slug));
  return {
    system: system
      ? { slug: system.slug, name: system.name, url: abs(base, `/systems/${system.slug}`), instructionUrl: abs(base, `/s/${system.slug}.txt`) }
      : undefined,
    motion: motion.length
      ? motion.map((m) => ({ slug: m.slug, title: m.title, url: abs(base, `/motion/${m.slug}`), promptUrl: abs(base, `/m/${m.slug}.txt`) }))
      : undefined,
  };
};

/** One prompt as agents consume it: metadata plus the URLs that resolve it. */
const toEntry = (entry, base, root, layers = { systems: [], motions: [] }) => ({
  slug: entry.slug,
  title: entry.title,
  category: entry.category,
  categoryLabel: entry.categoryLabel,
  description: entry.description,
  bestFor: entry.bestFor ?? [],
  style: entry.style ?? [],
  theme: entry.theme ?? undefined,
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
  /** Bred from two library pages: what each parent gave */
  parents: entry.parents?.map((p) => ({ ...p, pageUrl: abs(base, `/prompt/${p.slug}`) })) ?? undefined,
  ...readDemo(root, entry.demo),
  ...pageLinks(entry.slug, layers, base),
});

const buildManifest = ({ prompts, categories }, base, siteName, root, layers) => ({
  name: siteName,
  url: base,
  description:
    "Premium landing pages built for humans and agents: single HTML files with no dependencies, each with the one-shot prompt that builds it. Copy it, remix it, ship it. Free, MIT, no account.",
  generated: new Date().toISOString(),
  count: prompts.length,
  license: "MIT",
  usage: {
    prompt: `${base}p/<slug>.txt`,
    promptJson: `${base}p/<slug>.json`,
    index: `${base}llms.txt`,
    skill: `${base}SKILL.md`,
    mcp: `${base}mcp`,
    mcpInstall: `claude mcp add --transport http instalanding ${base}mcp`,
    cli: "npx -y instalanding search <words>",
    systems: `${base}systems.json`,
    motion: `${base}motion.json`,
  },
  categories: categories.map((c) => ({
    slug: c.slug,
    label: c.label,
    count: prompts.filter((p) => p.category === c.slug).length,
  })),
  prompts: prompts.map((p) => toEntry(p, base, root, layers)),
});

/** Every design system as agents consume it, with the pages it came from. */
const buildSystems = (layers, library, base, root) => {
  const { systemAgentInstruction } = loadData(root, SYSTEM_AGENT_FILE);
  const pages = (s) => library.prompts.filter((p) => s.templates.includes(p.slug));
  const files = {};
  const entries = layers.systems.map((s) => {
    const tokensFile = path.resolve(root, "public", s.files.tokens.replace(/^\//, ""));
    const tokensCss = existsSync(tokensFile) ? readFileSync(tokensFile, "utf8").trim() : undefined;
    // The same instruction COPY FOR AGENT gives, so the site and the tools never disagree
    files[`s/${s.slug}.txt`] = systemAgentInstruction(s, {
      siteUrl: base.replace(/\/$/, ""),
      tokensCss,
      templates: pages(s),
      components: s.components,
    });
    return {
      slug: s.slug,
      name: s.name,
      version: s.version,
      tagline: s.tagline,
      description: s.description,
      theme: s.theme,
      tags: s.tags,
      palette: s.palette,
      prefix: s.prefix,
      rootClass: s.rootClass,
      components: s.components,
      tokenCount: tokensCss ? (tokensCss.match(/--[\w-]+\s*:/g) ?? []).length : undefined,
      pageUrl: abs(base, `/systems/${s.slug}`),
      instructionUrl: abs(base, `/s/${s.slug}.txt`),
      files: {
        specimen: abs(base, s.files.specimen),
        tokens: abs(base, s.files.tokens),
        css: abs(base, s.files.css),
        preview: abs(base, s.files.preview),
        fonts: s.fontsHref,
      },
      pages: pages(s).map((p) => ({ slug: p.slug, title: p.title, url: abs(base, `/prompt/${p.slug}`), promptUrl: abs(base, `/p/${p.slug}.txt`) })),
      motion: layers.motions
        .filter((m) => m.pairsWith.some((slug) => s.templates.includes(slug)))
        .map((m) => ({ slug: m.slug, title: m.title, url: abs(base, `/motion/${m.slug}`) })),
    };
  });
  return {
    json: {
      name: "INSTALANDING.AI design systems",
      url: base,
      description:
        "Design systems extracted from real InstaLanding pages: tokens as CSS custom properties, every component working in one specimen HTML file, and an instruction an agent can apply to an existing project.",
      generated: new Date().toISOString(),
      count: entries.length,
      license: "MIT",
      usage: { instruction: `${base}s/<slug>.txt`, mcpTools: ["search_systems", "get_system"] },
      systems: entries,
    },
    files,
  };
};

/** Every motion study as agents consume it, with the pages it pairs with. */
const buildMotion = (layers, library, base) => {
  const titleOf = (slug) => library.prompts.find((p) => p.slug === slug)?.title;
  const files = {};
  const entries = layers.motions.map((m) => {
    files[`m/${m.slug}.txt`] = m.prompt;
    return {
      slug: m.slug,
      title: m.title,
      kind: m.kind,
      tagline: m.tagline,
      description: m.description,
      added: m.added,
      theme: m.theme,
      tags: m.tags,
      bestFor: m.bestFor,
      library: m.library,
      approxPromptTokens: Math.round(m.prompt.length / 4),
      pageUrl: abs(base, `/motion/${m.slug}`),
      promptUrl: abs(base, `/m/${m.slug}.txt`),
      demoUrl: abs(base, m.demo),
      posterUrl: abs(base, m.poster),
      choreography: {
        life: `${m.life}s`,
        of: m.lifeLabel.toLowerCase(),
        elements: m.elements,
        stagger: m.stagger !== undefined ? `${m.stagger}s` : undefined,
        tracks: m.tracks.map((t) => ({ prop: t.prop, change: t.change, from: +(t.start * m.life).toFixed(3), to: +(t.end * m.life).toFixed(3), ease: t.ease, yoyo: t.yoyo || undefined })),
      },
      inputs: m.inputs.map((i) => `${i.keys.join(" / ")}: ${i.does}`),
      trick: m.trick,
      pairsWith: m.pairsWith
        .filter((slug) => titleOf(slug))
        .map((slug) => ({ slug, title: titleOf(slug), url: abs(base, `/prompt/${slug}`), promptUrl: abs(base, `/p/${slug}.txt`) })),
      credits: m.credits.length ? m.credits : undefined,
    };
  });
  return {
    json: {
      name: "INSTALANDING.AI motion studies",
      url: base,
      description:
        "Motion studies, one movement each: a single HTML demo, its choreography as data (tracks, eases, timing, inputs) and the one-shot prompt that builds it.",
      generated: new Date().toISOString(),
      count: entries.length,
      license: "MIT",
      usage: { prompt: `${base}m/<slug>.txt`, mcpTools: ["get_motion"] },
      motion: entries,
    },
    files,
  };
};

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
    `- Agent skill (how to use this library, step by step): ${manifest.url}SKILL.md`,
    `- MCP server, hosted (Streamable HTTP, no install, no key): ${manifest.url}mcp`,
    `  Claude Code: claude mcp add --transport http instalanding ${manifest.url}mcp`,
    `- CLI: npx -y instalanding search "dark technical ai" · inspect <slug> · get <slug> · add <slug>`,
    `- Design systems (tokens, components, agent instructions): ${manifest.url}systems.json`,
    `- Motion studies (choreography as data, one-shot prompts): ${manifest.url}motion.json`,
    "",
  ];

  for (const category of manifest.categories) {
    if (!category.count) continue;
    lines.push(`## ${category.label}`, "");
    for (const entry of prompts.filter((p) => p.category === category.slug)) {
      lines.push(
        `- [${entry.title}](${manifest.url}p/${entry.slug}.txt): ${entry.description}` +
          ` (~${Math.round(entry.prompt.length / 4)} tokens${entry.demo ? ", live demo" : ""})` +
          (entry.bestFor?.length ? ` Best for: ${entry.bestFor.join(", ")}.` : "")
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
const buildSitemap = (library, builders, base, seoPages = [], layers = { systems: [], motions: [] }) => {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: base, priority: "1.0" },
    { loc: `${base}pages`, priority: "0.9" },
    { loc: `${base}agents`, priority: "0.9" },
    { loc: `${base}builders`, priority: "0.9" },
    { loc: `${base}about`, priority: "0.4" },
    { loc: `${base}systems`, priority: "0.8" },
    ...layers.systems.map((s) => ({ loc: `${base}systems/${s.slug}`, priority: "0.7" })),
    { loc: `${base}motion`, priority: "0.8" },
    ...layers.motions.map((m) => ({ loc: `${base}motion/${m.slug}`, priority: "0.7" })),
    { loc: `${base}contribute`, priority: "0.5" },
    { loc: `${base}hire`, priority: "0.6" },
    { loc: `${base}sponsor`, priority: "0.4" },
    { loc: `${base}contact`, priority: "0.3" },
    ...builders.map((b) => ({ loc: `${base}${b.path.replace(/^\//, "")}`, priority: "0.9" })),
    ...seoSitemapUrls(seoPages, base),
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
const renderFiles = (library, builders, base, siteName, root) => {
  const layers = loadLayers(root);
  const manifest = buildManifest(library, base, siteName, root, layers);
  const systems = buildSystems(layers, library, base, root);
  const motion = buildMotion(layers, library, base);
  const { seoPages = [] } = existsSync(path.resolve(root, SEO_FILE)) ? loadData(root, SEO_FILE) : {};
  const live = String(library.prompts.filter((p) => !p.hidden && p.demo && p.thumbnail).length);
  // Guides go in llms.txt just ahead of the notes, so AI tools that read the index find them.
  const layerLines = [
    "## Design systems",
    "",
    ...systems.json.systems.map((s) => `- [${s.name}](${s.instructionUrl}): ${s.tagline}. ${s.components.length} components; from ${s.pages.map((p) => p.title).join(", ")}.`),
    "",
    "## Motion studies",
    "",
    ...motion.json.motion.map((m) => `- [${m.title}](${m.promptUrl}): ${m.tagline} (${m.library.name} ${m.library.version}, ~${m.approxPromptTokens} tokens)`),
    "",
  ];
  const llms = buildLlmsTxt(manifest, library).replace("## Notes", () => [...layerLines, ...seoLlmsLines(seoPages, base, live), "## Notes"].join("\n"));
  const files = {
    "prompts.json": JSON.stringify(manifest, null, 2),
    "llms.txt": llms,
    "sitemap.xml": buildSitemap(library, builders, base, seoPages, layers),
    "systems.json": JSON.stringify(systems.json, null, 2),
    "motion.json": JSON.stringify(motion.json, null, 2),
    ...systems.files,
    ...motion.files,
    ...renderSeoPages({ pages: seoPages, library, builders, base, readDemo: (demo) => readDemo(root, demo) }),
  };
  // The skill names the library by URL; point it at wherever this build is served.
  const skill = path.resolve(root, SKILL_FILE);
  if (existsSync(skill)) {
    files["SKILL.md"] = readFileSync(skill, "utf8").replaceAll("https://instalanding.ai/", base);
  }
  for (const entry of library.prompts) {
    files[`p/${entry.slug}.txt`] = entry.prompt;
    files[`p/${entry.slug}.json`] = JSON.stringify(
      { ...toEntry(entry, base, root, layers), prompt: entry.prompt },
      null,
      2
    );
  }
  return files;
};

const contentType = (file) =>
  file.endsWith(".html")
    ? "text/html; charset=utf-8"
    : file.endsWith(".md")
    ? "text/markdown; charset=utf-8"
    : file.endsWith(".json")
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
        let pathname = decodeURIComponent((req.url ?? "").split("?")[0]).replace(/^\/+/, "");
        const seo = existsSync(path.resolve(root, SEO_FILE)) ? loadData(root, SEO_FILE).seoPages : [];
        const seoHit = seo.find((p) => pathname === p.slug || pathname === `${p.slug}/`);
        if (seoHit) pathname = `${seoHit.slug}/index.html`;
        else if (!/^(prompts\.json|systems\.json|motion\.json|llms\.txt|SKILL\.md|sitemap\.xml|p\/[^/]+\.(txt|json)|[sm]\/[^/]+\.txt)$/.test(pathname))
          return next();
        let files;
        try {
          files = renderFiles(
            loadLibrary(root),
            loadData(root, BUILDERS_FILE).builders,
            `http://${req.headers.host}/`,
            siteName,
            root
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
      const files = renderFiles(loadLibrary(root), loadData(root, BUILDERS_FILE).builders, base, siteName, root);
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: "asset", fileName, source });
      }
      this.info?.(`library-endpoints: emitted ${Object.keys(files).length} files for agents`);
    },
  };
}
