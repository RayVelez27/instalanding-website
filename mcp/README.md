# instalanding-mcp

MCP server for the [INSTALANDING.AI](https://instalanding.ai) one-shot prompt library.

Your agent searches the library and pulls a complete build brief without a browser, a copy
button, or an account. Free and open source, like the library itself.

```bash
claude mcp add instalanding -- npx -y instalanding-mcp
```

## Install

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add instalanding -- npx -y instalanding-mcp
```
</details>

<details>
<summary><b>Claude Desktop</b> — <code>claude_desktop_config.json</code></summary>

```json
{
  "mcpServers": {
    "instalanding": {
      "command": "npx",
      "args": ["-y", "instalanding-mcp"]
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
      "args": ["-y", "instalanding-mcp"]
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
npx instalanding-mcp --base-url http://localhost:8081
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
```

The smoke test spawns the server, then exercises every tool and resource: the tool list, search
with and without filters, an empty search, `get_prompt` in both modes, an unknown slug, demo
metadata, truncated inlining, and a resource read.

## License

MIT. The prompts and demos are free to use, modify and ship — commercially too. Where a demo is
built on someone else's asset, the library credits the source on that component's page; keep
that attribution if you redistribute it.
