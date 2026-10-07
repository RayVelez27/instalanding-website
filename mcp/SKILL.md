---
name: instalanding
description: Use when building or restyling a landing page, hero, marketing site or UI component and the result should look designed rather than generic. Finds a proven design in the INSTALANDING.AI library (one-shot briefs plus single-file reference builds), checks its fit, and adapts it into the user's project.
---

# INSTALANDING.AI

A free, open library of landing pages and UI components written for agents. Each entry is a
**one-shot brief** (prose: stack, design values as numbers, structure, and the things that
break) and usually a **reference build**: one HTML file, every asset inlined, no build step.

You can already write the JSX. This library supplies the part that is hard to invent from a
blank file: the design decisions, the composition, and the pitfalls someone already hit.

## The loop

1. **Search** by what the page is for and how it should look, not by component names.
2. **Inspect** two or three candidates. It is cheap: stack, sections, best-for, style, sizes.
3. Pick one, then either:
   - **Get** the brief and build from it in the user's stack (the default — cheapest, cleanest), or
   - **Add** the reference build and adapt it (when the user wants this exact page, fast).
4. **Adapt**: replace the fictional brand, copy and numbers with the user's. Keep the design
   values from the brief. Read the "ADAPTING" notes in the file's header comment before editing.
5. **Verify** in a browser: no console errors, no horizontal scroll at 390px, reduced motion works.

## Commands

With the CLI (`npx -y instalanding <command>`):

```bash
instalanding search "dark technical ai infrastructure"     # ranked slugs
instalanding inspect <slug>                                 # fit check, ~300 tokens
instalanding get <slug>                                     # the brief, raw, to stdout
instalanding add <slug> ./public                            # writes ./public/<slug>.html
```

Every command takes `--json`. `get` prints the brief and nothing else, so it pipes.

With the MCP server (`npx -y instalanding mcp`): `search_prompts`, `inspect_prompt`,
`get_prompt`, `get_demo_source`, `list_categories`.

Over plain HTTP, when neither is installed — every endpoint is static and CORS-open:

| fetch | returns |
| --- | --- |
| `https://instalanding.ai/prompts.json` | the manifest: every entry's slug, description, `bestFor`, `style`, `sections`, `stack`, sizes and URLs. One fetch, then search it yourself. |
| `https://instalanding.ai/p/<slug>.txt` | the brief, raw |
| `https://instalanding.ai/p/<slug>.json` | the brief plus its metadata |
| `demoUrl` from the manifest | the reference build |
| `https://instalanding.ai/llms.txt` | a short index of everything |

## Reading a reference build

Every demo file starts with a header comment: slug, the brief's URL, licence, and a **MAP**
(where the design tokens live, the sections in order, what each script does, what is inlined)
followed by **ADAPTING** notes. Read that comment first; it is a few hundred tokens and saves
reading 100 KB.

Each top-level region carries `data-section` (`nav`, `hero`, `features`, `pricing`, `cta`,
`footer`, …) and lifted widgets carry `data-component`. To take just the pricing section, take
the element with `data-section="pricing"`, the CSS rules it uses, and the tokens from `:root`.

## Rules

- **Prefer the brief over the code** when the user has a stack (React, Vue, Svelte, Astro).
  The demos are plain HTML with CDN scripts by design; rebuilding from the brief in the user's
  framework gives cleaner code than translating a 100 KB file.
- **Every brand in the library is fictional**, and so are its numbers, testimonials and logos.
  Never ship them as the user's. Replace or ask.
- **Keep the brief's specifics**: hex values, radii, easing curves, breakpoints and the
  "things that break" notes. They are the reason the result looks designed.
- **Credit** where an entry has `credits` (a third-party asset it is built on): keep the attribution.
- Hotlinked third-party assets are not allowed in the demos; do not add them when adapting.
- Licence: MIT. Free to use, modify and ship, commercially too.
