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
    const near = nearestSlugs(wanted, manifest.prompts, 3);
    throw new LibraryError(
      `No prompt with slug "${slug}".` + (near.length ? ` Did you mean: ${near.join(", ")}?` : "") +
        " Use search_prompts to find one."
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
    const haystack = `${title} ${description} ${slug} ${entry.category} ${entry.preview ?? ""}`;
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 6;
      if (slug.includes(term)) score += 4;
      if (description.includes(term)) score += 3;
      else if (haystack.includes(term)) score += 1;
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
