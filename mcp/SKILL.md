---
name: instalanding
description: Use when building or restyling a landing page, hero, marketing site or UI component and the result should look designed rather than generic. Finds a proven page in the INSTALANDING.AI library, checks its fit, and builds it from the page's own code: every entry is a single HTML file, and its prompt is that file with a short instruction on top.
---

# INSTALANDING.AI

**Browsing, with no shell and no MCP? Three fetches:**

1. `https://instalanding.ai/llms.txt` — every page in one line each: what it is, what it suits.
   Or `https://instalanding.ai/prompts.json` to filter by style, sections and stack.
2. `https://instalanding.ai/p/<slug>.txt` — the prompt for the one you picked: a short instruction,
   then the page's whole HTML file. Most are 15,000–60,000 tokens, a few run past 100,000
   (`approxPromptTokens` in the manifest says which). For example
   `https://instalanding.ai/p/sumwise-ai-accounting-firm-page.txt` or
   `https://instalanding.ai/p/nota-wearable-ai-page.txt`.
3. Do what the instruction says: keep the layout, design values and motion, replace the fictional
   brand and copy with the user's, convert to their stack if they have one.

A free, open library of landing pages and UI components, written for agents. Every entry is
**code**: one HTML file, every asset inlined, no build step. Its **prompt** is the same file with
a short instruction on top, so a person pasting it and an agent fetching it get the same page.
There is no prose brief to interpret: the file is the specification.

You can already write the JSX. This library supplies the part that is hard to invent from a
blank file: the design decisions, the composition, the motion, and the pitfalls someone already
hit — all of it as working code.

## The loop

1. **Search** by what the page is for and how it should look, not by component names.
2. **Inspect** two or three candidates. It is cheap: stack, sections, best-for, style, sizes.
3. **Get** the one you pick: its prompt (instruction + code), or just the code.
4. **Adapt**: replace the fictional brand, copy and numbers with the user's. Keep every design
   value as it is in the file. Read the MAP and ADAPTING notes in its header comment first.
   If the user has a stack, convert the file to it faithfully; the markup, CSS and timings carry over.
5. **Verify** in a browser: no console errors, no horizontal scroll at 390px, reduced motion works.

## Commands

With the CLI (`npx -y instalanding <command>`):

```bash
instalanding search "dark technical ai infrastructure"     # ranked slugs
instalanding inspect <slug>                                 # fit check, ~300 tokens
instalanding get <slug>                                     # the prompt: instruction + code, to stdout
instalanding add <slug> ./public                            # writes the code to ./public/<slug>.html
```

Every command takes `--json`. `get` prints the prompt and nothing else, so it pipes.

With the MCP server — hosted at `https://instalanding.ai/mcp`, nothing to install
(`claude mcp add --transport http instalanding https://instalanding.ai/mcp`), or locally with
`npx -y instalanding mcp`: `search_prompts`, `inspect_prompt`, `get_prompt` (instruction + code),
`get_demo_source` (the code alone), `list_categories`, plus `search_systems` / `get_system` for
design systems and `get_motion` for motion studies. A page's `get_prompt` names its design system
and the motion that pairs with it.

Over plain HTTP, when neither is installed — every endpoint is static and CORS-open:

| fetch | returns |
| --- | --- |
| `https://instalanding.ai/prompts.json` | the manifest: every entry's slug, description, `bestFor`, `style`, `sections`, `stack`, sizes and URLs. One fetch, then search it yourself. |
| `https://instalanding.ai/p/<slug>.txt` | the prompt: a short instruction, then the page's whole HTML file |
| `https://instalanding.ai/p/<slug>.json` | the same prompt plus its metadata |
| `demoUrl` from the manifest | the code alone: the HTML file |
| `https://instalanding.ai/systems.json` | every design system: tokens, components, files, and the pages it was extracted from |
| `https://instalanding.ai/s/<slug>.txt` | one system's instruction for restyling an existing project, every token inline |
| `https://instalanding.ai/motion.json` | every motion study: the choreography as data (tracks, eases, timing), inputs, pages it pairs with |
| `https://instalanding.ai/m/<slug>.txt` | one motion study's one-shot prompt |
| `https://instalanding.ai/llms.txt` | a short index of everything |

## Reading the code

Every file starts with a header comment: slug, URLs, licence, and a **MAP** (where the design
tokens live, the sections in order, what each script does, what is inlined) followed by
**ADAPTING** notes. Read that comment first; it is a few hundred tokens and tells you where
everything is in the rest of the file.

Each top-level region carries `data-section` (`nav`, `hero`, `features`, `pricing`, `cta`,
`footer`, …) and lifted widgets carry `data-component`. To take just the pricing section, take
the element with `data-section="pricing"`, the CSS rules it uses, and the tokens from `:root`.

## Rules

- **The code is the specification.** Keep its hex values, type, spacing, radii, easing curves,
  breakpoints and motion. They are the reason the result looks designed; do not "improve" them.
- **Converting to a framework** (React, Vue, Svelte, Astro): move the markup into components,
  the `:root` tokens and CSS into the project's styles, and the scripts into effects, without
  changing what renders. CDN libraries (GSAP, Lenis, Three.js) can become npm installs.
- **Every brand in the library is fictional**, and so are its numbers, testimonials and logos.
  Never ship them as the user's. Replace or ask.
- **Credit**: keep the INSTALANDING.AI credit line as a comment at the top of the file you produce,
  and keep any third-party attribution in an entry's `credits`.
- Hotlinked third-party assets are not allowed in the demos; do not add them when adapting.
- Licence: MIT. Free to use, modify and ship, commercially too.
