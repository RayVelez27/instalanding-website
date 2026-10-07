/**
 * Talks to the published library: /prompts.json, /p/<slug>.txt, /demos/*.html.
 *
 * Nothing here is generated or bundled — the server reads whatever the site is
 * serving, so prompts added to the library appear without a release.
 */

const DEFAULT_BASE_URL = "https://instalanding.ai";
const DEFAULT_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 15_000;

/** Demos are single files with every asset inlined, so they get large. */
export const DEMO_INLINE_LIMIT = 80_000;

export class LibraryError extends Error {
  constructor(message, { cause, status } = {}) {
    super(message);
    this.name = "LibraryError";
    this.cause = cause;
    this.status = status;
  }
}

export class Library {
  /**
   * @param {{ baseUrl?: string, ttlMs?: number, fetchImpl?: typeof fetch }} [options]
   */
  constructor(options = {}) {
    const raw = options.baseUrl ?? process.env.INSTALANDING_BASE_URL ?? DEFAULT_BASE_URL;
    this.baseUrl = raw.replace(/\/*$/, "/");
    this.ttlMs = options.ttlMs ?? Number(process.env.INSTALANDING_CACHE_TTL_MS ?? DEFAULT_TTL_MS);
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
    if (typeof this.fetchImpl !== "function") {
      throw new LibraryError("No fetch available — this server needs Node 18 or newer.");
    }
    /** @type {Map<string, { at: number, value: unknown }>} */
    this.cache = new Map();
  }

  url(pathname) {
    return new URL(pathname.replace(/^\/+/, ""), this.baseUrl).href;
  }

  async #get(pathname, { json = false } = {}) {
    const key = `${json ? "json" : "text"}:${pathname}`;
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < this.ttlMs) return hit.value;

    const url = this.url(pathname);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await this.fetchImpl(url, {
        signal: controller.signal,
        headers: { accept: json ? "application/json" : "text/plain, text/html;q=0.9, */*;q=0.8" },
      });
    } catch (error) {
      throw new LibraryError(
        `Could not reach ${url}. ${
          error?.name === "AbortError" ? "The request timed out." : String(error?.message ?? error)
        }`,
        { cause: error }
      );
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 404) {
      throw new LibraryError(`Not found in the library: ${url}`, { status: 404 });
    }
    if (!response.ok) {
      throw new LibraryError(`${url} returned ${response.status} ${response.statusText}`, {
        status: response.status,
      });
    }

    let value;
    if (json) {
      const body = await response.text();
      try {
        value = JSON.parse(body);
      } catch (error) {
        throw new LibraryError(
          `${url} did not return JSON. If this is a site root, it is probably serving the app shell — ` +
            `check that the library endpoints are deployed.`,
          { cause: error }
        );
      }
    } else {
      value = await response.text();
    }

    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  /** The whole manifest: metadata for every prompt, no bodies. */
  async manifest() {
    const manifest = await this.#get("prompts.json", { json: true });
    if (!manifest || !Array.isArray(manifest.prompts)) {
      throw new LibraryError("prompts.json is missing its `prompts` array.");
    }
    return manifest;
  }

  async entry(slug) {
    const manifest = await this.manifest();
    const wanted = String(slug ?? "").trim().toLowerCase();
    const found = manifest.prompts.find((p) => p.slug === wanted);
    if (found) return found;

    // A wrong slug is the most common agent mistake — answer with the near misses,
    // compared slug-to-slug so an unrelated word match never masquerades as one.
    // A truncated slug ("smartcare") shares too few trigrams with the full one
    // to clear the threshold, so slugs that contain it come first.
    const near = [
      ...manifest.prompts.filter((p) => wanted && p.slug.includes(wanted)).map((p) => p.slug),
      ...nearestSlugs(wanted, manifest.prompts, 3),
    ].filter((s, i, all) => all.indexOf(s) === i).slice(0, 3);
    throw new LibraryError(
      `No prompt with slug "${slug}".` + (near.length ? ` Did you mean: ${near.join(", ")}?` : "") +
        " Search for one first (search_prompts, or: instalanding search <words>)."
    );
  }

  /** The raw one-shot prompt, exactly as it should be pasted. */
  async promptText(slug) {
    const entry = await this.entry(slug);
    return { entry, text: await this.#get(`p/${entry.slug}.txt`) };
  }

  /** The demo's single-file HTML source. */
  async demoSource(slug) {
    const entry = await this.entry(slug);
    if (!entry.demoUrl) {
      throw new LibraryError(
        entry.repoUrl
          ? `"${entry.title}" is not a single file in this library — its code lives at ${entry.repoUrl}. ` +
            `Use get_prompt("${entry.slug}") for the brief, and read the repository for the implementation.`
          : `"${entry.title}" has no demo file — it ships as a prompt only.`
      );
    }
    const pathname = new URL(entry.demoUrl).pathname;
    return { entry, source: await this.#get(pathname) };
  }
}

/**
 * Substring match, except short terms must match a whole word: "ai" should
 * find "AI infrastructure", not every "detail" and "plain" in the library.
 */
const has = (text, term) =>
  term.length > 3
    ? text.includes(term)
    : new RegExp(`(^|[^a-z0-9])${term.replace(/[.+#]/g, "\\$&")}($|[^a-z0-9])`).test(text);

/** Token-overlap scoring: good enough for a 20–200 entry library, no deps. */
export const rank = (prompts, query, limit) => {
  const terms = String(query ?? "")
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);
  if (!terms.length) return prompts.slice(0, limit);

  const scored = prompts.map((entry) => {
    const title = entry.title.toLowerCase();
    const description = (entry.description ?? "").toLowerCase();
    const slug = entry.slug.toLowerCase();
    // What the page is for and how it looks — the words agents actually search
    // with ("dark technical ai") — plus what it is built from.
    const tags = [
      ...(entry.bestFor ?? []),
      ...(entry.style ?? []),
      entry.theme ?? "",
      ...(entry.stack?.libraries ?? []).map((l) => l.name),
      ...(entry.stack?.features ?? []),
      ...(entry.sections ?? []),
    ]
      .join(" ")
      .toLowerCase();
    const haystack = `${title} ${description} ${slug} ${entry.category} ${entry.preview ?? ""} ${tags}`;
    let score = 0;
    for (const term of terms) {
      if (has(title, term)) score += 6;
      if (has(slug, term)) score += 4;
      if (has(tags, term)) score += 4;
      if (has(description, term)) score += 3;
      else if (has(haystack, term)) score += 1;
    }
    // A full phrase match beats scattered word hits.
    if (terms.length > 1 && `${title} ${description}`.includes(terms.join(" "))) score += 5;
    return { entry, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
};

/** Trigram overlap between two slugs, 0–1. */
const trigrams = (value) => {
  const padded = `  ${value} `;
  const out = new Set();
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3));
  return out;
};

export const nearestSlugs = (wanted, prompts, limit, threshold = 0.3) => {
  const a = trigrams(wanted);
  if (!a.size) return [];
  return prompts
    .map((entry) => {
      const b = trigrams(entry.slug);
      let shared = 0;
      for (const gram of a) if (b.has(gram)) shared++;
      return { slug: entry.slug, score: shared / Math.max(a.size, b.size) };
    })
    .filter((candidate) => candidate.score >= threshold)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((candidate) => candidate.slug);
};

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

/**
 * Everything an agent needs to decide whether an entry fits, without reading
 * the prompt or the demo: what it is for, how it looks, what it is built from
 * and how it is laid out. Shared by `instalanding inspect` and the MCP tool so
 * the two never disagree.
 *
 * @param {object} entry   one manifest entry
 * @param {{ cli?: boolean }} [options]  name the next step as a CLI command or an MCP call
 */
export const formatInspect = (entry, { cli = false } = {}) => {
  const next = (verb, tool) => (cli ? `instalanding ${verb} ${entry.slug}` : `${tool}("${entry.slug}")`);
  const stack = entry.stack;
  const rows = [
    ["Stack", stack
      ? [
          "single HTML file, every asset inlined, no build step",
          stack.libraries?.length
            ? `libraries: ${stack.libraries.map((l) => `${l.name} ${l.version} (${l.cdn})`).join(", ")}`
            : "libraries: none — plain HTML, CSS and JS",
          stack.fonts?.length ? `fonts: ${stack.fonts.join(", ")} (Google Fonts)` : null,
          stack.features?.length ? `uses: ${stack.features.join(", ")}` : null,
        ]
      : entry.repoUrl
        ? [`a repository, not a single file: ${entry.repoUrl}`]
        : ["prompt only — no reference build"]],
    ["Sections", entry.sections?.length ? [entry.sections.join(" → ")] : null],
    ["Best for", entry.bestFor?.length ? [entry.bestFor.join(", ")] : null],
    ["Style", entry.style?.length || entry.theme
      ? [[entry.theme, ...(entry.style ?? []).filter((s) => s !== entry.theme)].filter(Boolean).join(", ")]
      : null],
    ["Prompt", [`~${(entry.approxPromptTokens ?? 0).toLocaleString()} tokens · ${next("get", "get_prompt")}`]],
    ["Demo", entry.demoUrl
      ? [`${entry.demoBytes ? `${kb(entry.demoBytes)} · ` : ""}${next("add", "get_demo_source")}`, entry.demoUrl]
      : null],
    ["Page", [entry.pageUrl]],
    ["Built on", entry.credits?.length ? entry.credits.map((c) => `${c.label} — ${c.href}`) : null],
  ];

  const lines = [
    entry.title,
    `${entry.slug} · ${entry.categoryLabel ?? entry.category}`,
    entry.description,
    "",
  ];
  for (const [label, values] of rows) {
    const shown = (values ?? []).filter(Boolean);
    if (!shown.length) continue;
    shown.forEach((value, i) => lines.push(`${(i ? "" : label).padEnd(10)} ${value}`));
  }
  return lines.join("\n");
};
