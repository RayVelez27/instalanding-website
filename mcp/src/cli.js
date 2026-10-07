#!/usr/bin/env node
/**
 * INSTALANDING.AI — command line.
 *
 *   instalanding search "dark technical ai"
 *   instalanding inspect monax-analytics-landing-page
 *   instalanding get monax-analytics-landing-page > brief.txt
 *   instalanding add monax-analytics-landing-page ./public
 *   instalanding skill --install
 *   instalanding mcp
 *
 * Written for agents first: stdout carries only the result, so `get` pipes
 * cleanly; progress and errors go to stderr; every command takes --json; exit
 * codes are 0 ok, 1 library error, 2 usage error. Reads the same published
 * files as the MCP server, through the same Library, so they always agree.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Library, LibraryError, formatInspect, rank } from "./library.js";

const VERSION = "0.2.0";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_SOURCE = path.resolve(HERE, "..", "SKILL.md");

const HELP = `instalanding ${VERSION} — landing pages and UI components for coding agents

Usage
  instalanding search [words...]     find entries by use, look or stack
        --category <web|motion|product|navigation|forms>   --limit <n> (default 8)
  instalanding inspect <slug>        stack, sections, best-for, sizes — before you commit
  instalanding get <slug>            the one-shot brief, raw, to stdout
        --meta                       prepend a short metadata header
  instalanding add <slug> [path]     write the reference build (one HTML file)
        path: a file, or a directory (gets <slug>.html). Default ./<slug>.html
        --force                      overwrite an existing file
  instalanding skill                 print the agent skill (SKILL.md)
        --install [dir]              write it to <dir>/instalanding/SKILL.md
                                     (default .claude/skills)
  instalanding mcp                   run the MCP server on stdio
  instalanding categories            what the library holds

Global
  --json              machine-readable output
  --base-url <url>    read another library, e.g. http://localhost:8081
                      (or INSTALANDING_BASE_URL)

The flow: search → inspect → get (build from the brief) or add (start from the code).
`;

/* ── argument parsing ─────────────────────────────────────────────────── */

const VALUE_FLAGS = new Set(["--category", "--limit", "--base-url"]);

const parse = (argv) => {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [name, inline] = arg.split("=", 2);
    if (VALUE_FLAGS.has(name)) {
      flags[name] = inline ?? argv[++i];
    } else if (name === "--install") {
      // optional value: only take the next arg if it is not another flag
      flags[name] = inline ?? (argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true);
    } else {
      flags[name] = inline ?? true;
    }
  }
  return { command: positional.shift(), positional, flags };
};

class UsageError extends Error {}

const out = (value) => process.stdout.write(value.endsWith("\n") ? value : `${value}\n`);
const note = (value) => process.stderr.write(`${value}\n`);
const json = (value) => out(JSON.stringify(value, null, 2));

const needSlug = (positional, command) => {
  if (!positional[0]) throw new UsageError(`${command} needs a slug. Find one with: instalanding search <words>`);
  return positional[0];
};

/* ── commands ─────────────────────────────────────────────────────────── */

const commands = {
  async search(library, { positional, flags }) {
    const manifest = await library.manifest();
    const category = flags["--category"];
    const limit = flags["--limit"] ? Number(flags["--limit"]) : 8;
    if (!Number.isInteger(limit) || limit < 1) throw new UsageError("--limit must be a positive whole number");
    const pool = category ? manifest.prompts.filter((p) => p.category === category) : manifest.prompts;
    const query = positional.join(" ");
    const results = rank(pool, query, limit);

    if (flags["--json"]) return json({ query, count: results.length, results });
    if (!results.length) {
      note(`Nothing matched "${query}". Try fewer or broader words, or: instalanding categories`);
      process.exitCode = 1;
      return;
    }
    const width = String(results.length).length;
    results.forEach((entry, i) => {
      const n = String(i + 1).padStart(Math.max(2, width), "0");
      out(`${n}  ${entry.slug}`);
      out(`    ${entry.title} — ${entry.description}`);
      const traits = [...(entry.bestFor ?? []).slice(0, 3), ...(entry.style ?? []).slice(0, 3)];
      if (traits.length) out(`    ${traits.join(" · ")}`);
    });
    note(`\nNext: instalanding inspect <slug>`);
  },

  async inspect(library, { positional, flags }) {
    const entry = await library.entry(needSlug(positional, "inspect"));
    if (flags["--json"]) return json(entry);
    out(formatInspect(entry, { cli: true }));
  },

  async get(library, { positional, flags }) {
    const { entry, text } = await library.promptText(needSlug(positional, "get"));
    if (flags["--json"]) return json({ ...entry, prompt: text });
    if (flags["--meta"]) {
      out(`# ${entry.title}\n${entry.description}\nslug: ${entry.slug} · ${entry.pageUrl}\n\n--- ONE-SHOT PROMPT ---\n`);
    }
    out(text);
  },

  async add(library, { positional, flags }) {
    const slug = needSlug(positional, "add");
    const { entry, source } = await library.demoSource(slug);
    let target = positional[1] ?? `${entry.slug}.html`;
    const isDir =
      (existsSync(target) && statSync(target).isDirectory()) || /[\\/]$/.test(target) || !path.extname(target);
    if (isDir) target = path.join(target, `${entry.slug}.html`);
    if (existsSync(target) && !flags["--force"]) {
      throw new UsageError(`${target} already exists. Pass --force to overwrite it.`);
    }
    mkdirSync(path.dirname(path.resolve(target)), { recursive: true });
    writeFileSync(target, source);

    const result = { slug: entry.slug, file: path.resolve(target), bytes: Buffer.byteLength(source), sections: entry.sections ?? [] };
    if (flags["--json"]) return json(result);
    out(result.file);
    note(
      `Wrote ${entry.title} (${Math.round(result.bytes / 1024)} KB). Open it directly — no build step.\n` +
        (result.sections.length ? `Sections: ${result.sections.join(", ")} (data-section attributes).\n` : "") +
        "The header comment maps the tokens, scripts and what breaks when you change them.\n" +
        `Brief it was built from: instalanding get ${entry.slug}`
    );
  },

  async skill(_library, { flags }) {
    const skill = readFileSync(SKILL_SOURCE, "utf8");
    if (!flags["--install"]) return out(skill);
    const dir = flags["--install"] === true ? path.join(".claude", "skills") : flags["--install"];
    const target = path.join(dir, "instalanding", "SKILL.md");
    if (existsSync(target) && !flags["--force"]) {
      throw new UsageError(`${target} already exists. Pass --force to overwrite it.`);
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, skill);
    if (flags["--json"]) return json({ file: path.resolve(target) });
    out(path.resolve(target));
  },

  async categories(library, { flags }) {
    const manifest = await library.manifest();
    if (flags["--json"]) return json(manifest.categories);
    out(`${manifest.name} — ${manifest.count} entries · generated ${manifest.generated}`);
    for (const c of manifest.categories) out(`  ${c.slug.padEnd(11)} ${c.count}`);
  },
};

/* ── boot ─────────────────────────────────────────────────────────────── */

async function main() {
  const args = parse(process.argv.slice(2));

  if (args.flags["--version"] || args.command === "version") return out(VERSION);
  if (!args.command || args.command === "help" || args.flags["--help"]) return out(HELP);

  // The MCP server reads --base-url from argv itself and boots on import.
  if (args.command === "mcp") {
    await import("./index.js");
    return;
  }

  const run = commands[args.command];
  if (!run) throw new UsageError(`Unknown command "${args.command}". Run: instalanding help`);
  const library = new Library({ baseUrl: args.flags["--base-url"] });
  await run(library, args);
}

// exitCode rather than process.exit(): exiting while undici is still closing a
// socket trips a libuv assertion on Windows and turns exit 2 into a crash.
main().catch((error) => {
  if (error instanceof UsageError) {
    note(error.message);
    process.exitCode = 2;
    return;
  }
  note(error instanceof LibraryError ? error.message : `Unexpected error: ${error?.stack ?? error}`);
  process.exitCode = 1;
});
