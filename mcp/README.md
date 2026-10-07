# instalanding

Give your agent better taste. CLI, MCP server and agent skill for the
[INSTALANDING.AI](https://instalanding.ai) library of landing pages and UI components.

Your agent searches the library, checks a candidate's fit, and pulls a complete build brief or
a single-file reference build — without a browser, a copy button, or an account. Free and open
source, like the library itself.

```bash
npx -y instalanding search "dark technical ai"
npx -y instalanding inspect monax-analytics-landing-page
npx -y instalanding get monax-analytics-landing-page > brief.txt
npx -y instalanding add monax-analytics-landing-page ./public
```

One package, three surfaces, one data source — they always agree:

| surface | for | start |
| --- | --- | --- |
| CLI | any agent with a shell (Claude Code, Codex, Cursor, OpenCode, Gemini CLI, …) | `npx -y instalanding help` |
| MCP | tool-aware clients | `npx -y instalanding mcp` |
| Skill | agents that load `SKILL.md` / `AGENTS.md` instructions | `npx -y instalanding skill --install` |

## CLI

| command | what it does |
| --- | --- |
| `search [words...]` | Rank entries by use, look and stack. `--category`, `--limit` |
| `inspect <slug>` | Stack (libraries, fonts, WebGL/canvas), sections in order, best-for, style, sizes |
| `get <slug>` | The one-shot brief, raw, to stdout — and nothing else, so it pipes. `--meta` adds a header |
| `add <slug> [path]` | Write the reference build. A directory gets `<slug>.html`. `--force` to overwrite |
| `skill` | Print the agent skill. `--install [dir]` writes `<dir>/instalanding/SKILL.md` (default `.claude/skills`) |
| `mcp` | Run the MCP server on stdio |
| `categories` | What the library holds |

Every command takes `--json` and `--base-url`. Results go to stdout, progress and errors to
stderr. Exit codes: `0` ok, `1` library error (unknown slug, network), `2` usage error.

## Skill

`SKILL.md` teaches an agent the loop — search, inspect, get or add, adapt, verify — and works
over the CLI, the MCP server or plain HTTP, whichever the agent has. It is also served at
`https://instalanding.ai/SKILL.md`, so an agent can read it without installing anything.

## MCP install

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add instalanding -- npx -y instalanding mcp
```
</details>

<details>
<summary><b>Claude Desktop</b> — <code>claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "instalanding": {
      "command": "npx",
      "args": ["-y", "instalanding", "mcp"]
    }
  }
}
```
</details>

<details>
<summary><b>Cursor</b> — <code>.cursor/mcp.json</code></summary>

```json
{
  "mcpServers": {
    "instalanding": {
      "command": "npx",
      "args": ["-y", "instalanding", "mcp"]
    }
  }
}
```
</details>

Needs Node 18+. Nothing to configure, no key, no login.

## Try it

> Find me a landing page prompt with a WebGL hero, then build it.

The agent calls `search_prompts`, reads the brief with `get_prompt`, and writes the file.

## Tools

### `search_prompts`
Find prompts by what you want to build.

| arg | type | notes |
| --- | --- | --- |
| `query` | string, optional | Plain words — `"pricing table"`, `"rive button"`, `"three.js hero"` |
| `category` | `web` \| `motion` \| `product` \| `navigation` \| `forms`, optional | |
| `limit` | number, optional | Default 8 |

Returns each match with its slug, description, token estimate and demo URL. Omit `query` to
browse a category.

### `inspect_prompt`
Check whether an entry fits before reading it — a few hundred tokens.

| arg | type | notes |
| --- | --- | --- |
| `slug` | string | |

Returns the stack (CDN libraries with versions, Google Fonts, WebGL/canvas/web component),
the `data-section` names in order, what the page is best for, its style, and the size of the
prompt and the demo.

### `get_prompt`
The full one-shot brief for a slug — the thing you build from.

| arg | type | notes |
| --- | --- | --- |
| `slug` | string | Exactly as `search_prompts` reported it |
| `metadata` | boolean, optional | Default true. `false` returns the raw prompt with no header |

A wrong slug comes back with close matches rather than a bare failure.

### `get_demo_source`
The reference implementation: one self-contained HTML file, every asset inlined.

| arg | type | notes |
| --- | --- | --- |
| `slug` | string | |
| `inline` | boolean, optional | Default **false** — reports size and URL instead of the file |
| `maxChars` | number, optional | Truncation cap when inlining (default 80,000) |

A few entries are not single files at all — their code lives in their own repository, and the
tool reports that URL instead.

These files run 40–160 KB, which is 10k–40k tokens. The default keeps that out of your context
by accident; pass `inline: true` when you actually want to read the implementation. If you only
need to *build* the component, `get_prompt` is far cheaper and is the intended path.

### `list_categories`
What the library holds, by category, with counts and the manifest's timestamp.

## Resources

Every prompt is also an MCP resource at `instalanding://prompt/<slug>`, so clients that let you
attach context can pick one from a list.

## Configuration

| env | default | what it does |
| --- | --- | --- |
| `INSTALANDING_BASE_URL` | `https://instalanding.ai` | Which library to read |
| `INSTALANDING_CACHE_TTL_MS` | `300000` | How long the manifest and prompts are cached in memory |

`--base-url <url>` does the same as the env var. Point it at a local dev server while you are
adding prompts:

```bash
npx instalanding mcp --base-url http://localhost:8081
```

## How it works

The server is a thin, stateless reader over the library's published files:

```
/prompts.json      manifest — every entry's metadata
/p/<slug>.txt      one prompt, raw
/demos/<name>.html the single-file reference implementation
```

Nothing is bundled into the package, so prompts added to the site show up immediately — no
release, no version bump. Responses are cached in memory for five minutes and every network
call has a 15-second timeout; failures come back as readable messages rather than stack traces,
so the agent can recover on its own.

## Development

```bash
npm install
npm start                                   # stdio server against the public site
node test/smoke.js http://localhost:8081    # end-to-end over real MCP stdio
node test/cli.js http://localhost:8081      # end-to-end CLI: output, files written, exit codes
```

The smoke test spawns the server, then exercises every tool and resource: the tool list, search
with and without filters, an empty search, `get_prompt` in both modes, an unknown slug, demo
metadata, truncated inlining, and a resource read.

## License

MIT. The prompts and demos are free to use, modify and ship — commercially too. Where a demo is
built on someone else's asset, the library credits the source on that component's page; keep
that attribution if you redistribute it.
