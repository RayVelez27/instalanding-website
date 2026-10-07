# AGENTS.md

Guide for coding agents working **in** this repository. If you want to *use* the library
from an agent instead, read [`mcp/SKILL.md`](mcp/SKILL.md) (served at `/SKILL.md`), see
[`mcp/README.md`](mcp/README.md), or fetch `/llms.txt` from the deployed site.

## What this is

**INSTALANDING.AI** is a library of one-shot prompts for landing pages and UI components.
Each entry is a prose brief detailed enough that an AI builder produces a working component
in one pass, and most entries ship a **reference implementation**: a single HTML file with
every asset inlined, runnable from `file://`.

Free, open source, no account. Nothing is gated, so everything must be readable by a machine
as easily as by a person.

## Layout

```
src/data/prompts.ts        THE source of truth — every prompt entry lives here
src/components/            PromptGrid (Isotope masonry), Sidebar, PromptThumb, AiBuilderTrigger
src/pages/                 Index, Category, PromptDetail
src/index.css              all app styling (plain CSS, not Tailwind classes, for the library chrome)
public/demos/*.html        single-file reference implementations
public/thumbs/*.jpg        tile screenshots, 1200x600 (2:1)
plugins/library-endpoints.mjs   emits the agent-readable endpoints at build, serves them in dev
mcp/                       the `instalanding` npm package: CLI (src/cli.js), MCP server
                           (src/index.js), shared reader (src/library.js) and SKILL.md.
                           Its own package, own node_modules. Not yet published to npm.
src/pages/Agents.tsx       /agents, the manifesto. NPM_PUBLISHED at the top gates the npx note
```

## Commands

```bash
npm run dev          # vite dev server (port 8080; 8081 if taken)
npm run build        # production build + emits the agent endpoints into dist/
npm test             # vitest
npm run lint         # eslint
npx tsc --noEmit     # typecheck
```

`npm run lint` currently reports **6 pre-existing errors and 8 warnings** — in
`src/components/ui/command.tsx`, `ui/textarea.tsx`, `integrations/supabase/previewAuthStorage.ts`,
`pages/Login.tsx`, `pages/ResetPassword.tsx` and `tailwind.config.ts`. That is the baseline:
leave them unless you are fixing them deliberately, and do not let new ones join them.

## Adding a prompt entry

Everything else — the grid tile, the detail page, `/prompts.json`, `/p/<slug>.txt`, `/llms.txt`,
and the MCP server's results — derives from one object in `src/data/prompts.ts`. Prepend it to
`entries` (newest first) with:

| field | notes |
| --- | --- |
| `title` | Title case. The slug is generated from it and is **permanent** once published. |
| `category` | `web` \| `motion` \| `product` \| `navigation` \| `forms` |
| `categoryLabel` | Uppercase form of the category |
| `description` | One line, no trailing period. Shown on the tile and in search results. |
| `prompt` | The one-shot brief. See below. |
| `preview` | A `PreviewKind` — picks the CSS wireframe mock when there is no thumbnail |
| `variant` | Legacy tile size. Still published in the manifest as `tile`, but it no longer drives layout — see below |
| `added` | e.g. `"Sep 22, 2026"` |
| `demo` | `/demos/<name>.html` if a reference implementation ships |
| `repoUrl` | Use instead of `demo` when the code lives in its own repository |
| `thumbnail` | `/thumbs/<name>.jpg`, **1200x600** — or the poster frame for a clip |
| `video` | `/previews/<name>.mp4` for a motion preview (see below) |
| `videoAspect` | `portrait` \| `landscape` \| `square` |
| `credits` | Required when the component is built on someone else's work (see below) |
| `bestFor` | 3–5 use cases in the words an agent searches with: `"AI infrastructure"`, `"developer tools"` |
| `style` | 4–6 look descriptors: `"dark"`, `"editorial"`, `"webgl"`, `"glassmorphism"`. Searched and shown by `inspect` |

Do not add `sections` or `stack` to an entry: the endpoint plugin reads both off the demo file
(its `data-section` attributes, CDN script URLs, Google Fonts and canvas/WebGL use), so they
cannot drift from the code.

### Grid shape

The home grid has exactly **two formats**, and both come from the artwork rather than a
hand-set size:

- **Horizontal (default).** A 2:1 card, matching the 1200x600 every thumbnail is captured at.
  Two per row, three above 1600px, one under 720px.
`visiblePrompts` is the list every listing walks, and an entry earns its place there by
shipping something runnable — a `demo` in `public/demos` or a `repoUrl`. Draft entries with
neither are kept out of the feed automatically: a CSS wireframe standing in for a screenshot
is not something to put in front of anyone. They still resolve at `/prompt/:slug`, so add the
demo and the entry appears on its own.

`hidden: true` removes an entry that *does* ship, for when you want it gone from the feed but
not deleted. Deleting outright is the other option, and it orphans its demo, clip and
thumbnail.

That list is **shuffled once per page load**, so the feed has no permanent top and the pager,
the category pages and the modal all agree on the same order while you browse. The modal's
"More one-shots" list shuffles again per entry, same category first.

- **Vertical.** An entry whose preview clip is portrait (`videoAspect: "portrait"`) takes
  `grid-row: span 2` — the height of two stacked cards in its column — and the clip is
  `cover`ed so it fills the block edge to edge. The slot is roughly square, so a 9:16 clip
  shows its middle ~57%: only give an entry `videoAspect: "portrait"` when its clip is
  full-bleed texture that survives that crop. Neighbours fill the column beside it, so no
  holes.

That is the whole layout system. Do not reintroduce per-entry sizes: masonry was removed
because 2:1 captures were being cropped into square and 1:2 tiles.

Do not edit generated files — `prompts.json`, `p/*.txt`, `llms.txt` exist only in `dist/`.

### Writing the prompt

The prompt is the product. Aim for what a careful colleague would need to build the thing
without asking questions:

- **Name the stack explicitly**, with versions and where they load from (CDN, import map).
- **Give the design system as values**, not adjectives: hex colours, radii, shadow recipes,
  type scale, easing curve.
- **Walk the structure** section by section, in order.
- **Call out the things that break.** This is what makes these prompts worth copying — the
  layout-frame crop maths for a Rive artboard, `overflow-x: clip` instead of `hidden` so a
  sticky header survives, `clearProps: "transform"` so hover still works after a GSAP intro,
  fonts that must be loaded before drawing to a canvas. If you hit a bug while building the
  demo, the fix belongs in the prompt.
- **State the responsive and a11y floor**: breakpoints, focus rings, `prefers-reduced-motion`,
  no horizontal scroll at 390px.
- Keep it prose. It is a brief, not code.

### Preview clips

A motion entry can ship a clip instead of a still. Rules:

- **Vertical (9:16) for the `tall` tile**, `landscape` for the wide ones. Encode H.264 in an
  mp4 — the only format that plays inline everywhere — with `yuv420p` and `+faststart`.
- Keep it **under ~3.5 MB**. Render at source resolution, then downscale with ffmpeg's `area`
  filter: fine 1px detail (scanlines, hatching) moirés badly under `lanczos`, and `-tune grain`
  triples the file. `scale=540:960:flags=area` at `-crf 29` is the settled recipe.
- Always ship `thumbnail` alongside as the poster frame — it is also the reduced-motion still.
- The clip **plays once and stops**, and replays on hover. Reveals should not loop. A clip
  cut to loop seamlessly sets `videoLoop: true` and runs continuously instead.
- **Cutting a loop out of a longer render** (`scratchpad/loop-tail.sh` does this for
  `you-can-see-code.mp4`): take the last N seconds, then cross-dissolve the final ~0.5s into
  the frames that run up to the loop's first frame, so the frame it wraps on is that frame's
  natural predecessor. Do not trust a plain frame-difference search for the cut point — a thin
  moving element (a caption band, a sweep) barely moves the number but pops on screen. Look at
  a strip of the frames either side of the wrap before believing it.

To render one from a web source, drive it deterministically rather than screen-recording:
seek to `t`, wait two animation frames, screenshot, repeat at 30fps, then pipe the PNGs through
ffmpeg. `public/previews/you-can-see-code.mp4` was made this way from the scene's own
`seek(t)`, at 9:16, with `duration` passed so the camera move lands on the last frame.

### Building the demo

One HTML file. Inline everything: CSS, JS, SVG art, base64 `.riv`, base64 images. CDN
`<script>` tags are fine (GSAP, Three.js, Rive); hotlinked *assets* are not — no other site's
images, no `pravatar`, no CDN product photos. The file must work opened directly from disk.

If the component is real-brand adjacent or the content could be mistaken for genuine, make the
brand obviously fictional and say so in a legal line.

### Making the demo readable by agents

Every demo is also read by agents that will edit it, so three things are required:

- **A header comment** directly after `<!doctype html>`: title, slug, the `/p/<slug>.txt` URL,
  the page URL and the licence, then a **MAP** (where the tokens live, the `data-section` names
  in order, one line per script saying what it drives, what is inlined) and **ADAPTING** notes
  (the specific things that break when edited naively — usually the prompt's own warnings).
  Every line must be true of the file. The `/agents` page shows the fire button's header live.
- **`data-section="<name>"` on every top-level region**, in order: `nav`, `hero`, `features`,
  `how-it-works`, `stats`, `testimonials`, `pricing`, `faq`, `cta`, `footer`, or a short specific
  name. `data-component` marks a widget worth lifting on its own. When the DOM is built in
  script, set the attribute where the element is made — the plugin also matches
  `"data-section":"x"` and `dataset.section = "x"`. Never tag elements after the fact.
- **The accessibility floor**: `<html lang>`, one `<h1>`, a `<main>` (or `role="main"`), labels on
  icon-only controls, `aria-hidden` on decorative canvases and art. Agents that browse read the
  accessibility tree.

### Scroll reveals

`ScrollTrigger.batch(..., { once: true })` only fires for elements that cross its start
*while you are watching*. Arrive already past it — an anchor link, a restored scroll position,
the modal preview scrolled by the viewer — and those sections sit at `opacity: 0` forever.
Reveal whatever is already on screen outright, and re-check on ScrollTrigger's `refresh` and
`scrollEnd` events; an instant jump lands in one frame and never produces the crossing.

Never put a float loop and a scrubbed parallax on the same element's `y`. On the clay page
that combination parked the hero console 93px down, over the content beneath it.

### Shader backgrounds

Ported shaders (FaultyTerminal, Shadertoy sketches, ogl/React components) go in as plain
WebGL in a `<script>` tag: one full-screen triangle, one fragment shader, no npm and no
framework. Keep the original fragment source recognisable and note in a comment what you
changed and why.

Prefer a shader as the **fill of specific elements** over a page-wide background. On
`monax-analytics.html` it replaces the gradients on the hero product panel, two art cards and
the stories panel, driven per element by `data-fx-*` attributes; the page keeps its paper
background and the type stays on plain paper. A field behind the whole page fights every
paragraph on it.

Layering, learned the hard way on that page:

- Give the host `position: relative; isolation: isolate` and the canvas `z-index: -1`. The
  isolation creates a stacking context, so the layer sits above the element's background and
  below its `::before`/`::after` gloss and *all* children — including static ones, which
  otherwise paint under any positioned canvas. Insert the canvas as the first child.
- A *fixed* canvas at `z-index: -1` is painted over by `body`'s own background whenever the
  stylesheet also gives `html` a background: propagation to the viewport only happens when the
  root has none.
- Whatever the element kept as a CSS gradient is the fallback, so let it stand and add the
  class or canvas only *after* the program links.
- Compute the dot grid from the element's aspect (`aspect * 15` columns, 15 rows) or the cells
  stretch in anything that isn't 2:1.
- Cap DPR (1.5 is plenty), skip offscreen hosts with an IntersectionObserver, skip frames
  while `document.hidden`, and under `prefers-reduced-motion` render a fully formed field at a
  fixed time and then stop. Demos run inside the modal's iframe, sometimes several tabs deep.

Tint with several inks mixed across the frame, not one `uTint` — a single tint reads as grey
mud — and take them from the gradient you are replacing so the page's palette survives.

### ASCII exhibits

A character-grid scene is cheap and reads as instrumentation rather than decoration, but
three things bite:

- **Serialise one span per run of identical class**, not one per cell. A 60x15 grid is 900
  cells, and wrapping each of them costs more than the animation does.
- **Seed ambient noise from a stepped tick** (a sine hash of `Math.floor(t/3)`), never
  `Math.random()` per frame, or the scene strobes instead of reading like a dot-matrix printer.
- **The grid is a fixed column count, so size it from the viewport**: `clamp(7.6px, 1.75vw,
  12px)` with `width: max-content`. Under 560px the chrome around it has to give up its
  margins as well — sheet, record, frame and tabs — or the right-hand half of every scene
  scrolls out of view at 390 and nobody discovers it.

Anything stamped *over* a scene (a burst label, an impact ring) must only land on cells that
are already blank **and** skip a blank whose neighbours both have ink: an asterisk dropped
into the space inside a phrase printed "neither can*move", which reads as a bug rather than
as damage.

Set Silkscreen and other pixel faces at **11px, not 10px**. At 10px on a 1x screen its C
rasterises as an O, so "DIRECTORY" prints "DIREOTORY" — visible in a screenshot, invisible in
the code.

### Playback UIs

A demo that plays something back (`spool-run-transcript.html` scrubs a 24-step agent run)
has three rules of its own:

- **Never `scrollIntoView` a live line.** It scrolls every scroll parent including the
  document, and inside the modal's iframe that yanks the whole page on every step. Set the
  container's own `scrollTop` instead.
- **Split the render.** Continuous readouts — playhead, clocks, meters — update every frame;
  everything structural rebuilds only when the index actually changes, behind a `lastIndex`
  guard. Otherwise a forty-node rebuild runs at 60fps for no reason.
- **Derive every total from the data** at boot and write it into the page: headline stats,
  axis labels, docket rows, comparison columns. Spool's first draft had a hand-typed "14 tool
  calls" in the copy and 11 in the trace, and the page was the thing telling the lie.

Scrub with pointer capture (`setPointerCapture` on `pointerdown`), and pause the clock while
`document.hidden` or an IntersectionObserver says the player is off screen.

### Credits

When a demo is built on someone else's asset (a Rive marketplace file, a third-party sketch),
add a `credits` entry — it renders as **BUILT ON** on the detail page:

```ts
credits: [
  {
    label: "Fire Button — Rive Marketplace",
    href: "https://rive.app/marketplace/3703-7734-fire-button/",
    note: "The community .riv this component is built around",
  },
],
```

Never invent a source URL. If you do not have the link, leave it out and say so.

## Verification discipline

This project is verified in a real browser, not by eyeballing code. The established loop, which
you are expected to follow:

1. Build the demo as a single file.
2. Drive it in headless Edge over CDP: real pointer and keyboard events, check computed styles,
   collect console errors, screenshot each state, then **look at the screenshots**.
3. Check 1512px and 390px: `document.documentElement.scrollWidth === innerWidth` at both.
4. Capture the 1200x600 thumbnail from the finished demo.
5. Add the `prompts.ts` entry.
6. `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.
7. Verify the tile renders in the grid and the detail page resolves its demo link.

Scratch scripts belong in the session scratchpad, never in the repo.

Never mutate real user data while testing. Supabase inserts get mocked at the network layer;
demo forms use `.example` domains.

## House style

- Match the surrounding code: plain CSS with the existing token names, the same comment density,
  the same naming. The demos are hand-written HTML/CSS/JS — no framework, no build step.
- Comments explain **why**, especially where something non-obvious prevents a bug.
- Prefer fixing the root cause over adding a workaround, and say plainly when something is a
  workaround.
- `prompts.ts` must stay **import-free**: `plugins/library-endpoints.mjs` evaluates it directly
  to emit the agent endpoints, and an import would break the build.

## Builder pages

`src/data/builders.ts` drives `/builders` and one page per AI builder, each living at the search
term rather than under a folder (`/lovable-prompts`, `/claude-code-prompts`, ...). The routes,
the hub, the cross-links and the SEO tags are all generated from that array, so adding a builder
is one object and nothing else.

Every entry has to earn its page. The four fields that make it real are:

- `how` — how that environment wants to be asked, in its own terms
- `steps` — what you actually do there, in order
- `preamble` — the paste-ready block that adapts any library prompt to that environment
- `gotcha` — what usually goes wrong

**Do not add a builder you cannot write those four fields for.** Ten pages that differ only in a
product name are doorway pages; they rank badly and they deserve to. The preamble is the test:
if it would work unchanged on another builder's page, the entry is not ready.

Claims stay at the level of workflow shape — what kind of output the tool expects, whether it
runs in a repo or a sandbox. Do not state version numbers, pricing or feature specifics; they go
stale and we do not verify them.

Per-route `<title>`, description and canonical come from `useSeo` (`src/hooks/useSeo.ts`), which
sets them after hydration. That is enough for anything that runs JavaScript and not enough for
anything that does not — prerendering these routes is the next step when they start earning
traffic, and the hook keeps working unchanged when it happens.

## The agent-facing surface

Generated at build by `plugins/library-endpoints.mjs`, served from memory in dev:

| path | what it is |
| --- | --- |
| `/prompts.json` | manifest: every entry's metadata, URLs, token estimate, credits, `bestFor`, `style`, and — read off the demo — `sections`, `stack`, `demoBytes` |
| `/p/<slug>.txt` | one prompt, raw, ready to paste verbatim |
| `/p/<slug>.json` | the same prompt plus its metadata |
| `/llms.txt` | markdown index of the library, per the llms.txt convention |
| `/SKILL.md` | the agent skill, from `mcp/SKILL.md` with URLs rewritten to `SITE_URL` |
| `/sitemap.xml` | every crawlable route: library, categories, agents, builder pages, about |

Entries carry `videoUrl` and `repoUrl` in the manifest, so an agent can tell a repo-hosted
template from a single-file demo without fetching anything.

The CLI and the MCP server both read these files through `mcp/src/library.js`, and share its
`rank` and `formatInspect`, so `instalanding inspect` and the `inspect_prompt` tool always
agree. Test both against the dev server: `node mcp/test/cli.js http://localhost:8081` and
`node mcp/test/smoke.js http://localhost:8081`.

Keep these promises when changing the plugin: `prompts.json` always has a `prompts` array, slugs
are stable, `/p/<slug>.txt` is the prompt **and nothing else** (no header, no banner — it gets
pasted verbatim).

## Deployment notes

- The app is a client-routed SPA. Any host must rewrite unknown paths to `index.html` **after**
  static files, so `/p/*.txt` and `/prompts.json` are still served as files. `public/_redirects`
  covers Netlify and Cloudflare Pages; on Vercel use a `vercel.json` rewrite with the same
  ordering.
- `public/_headers` sets `Access-Control-Allow-Origin: *` on the agent endpoints so browser-based
  agents can read them. Reproduce that on any other host.
- `SITE_URL` at build time sets the absolute URLs inside `prompts.json` and `llms.txt`. Set it to
  the production origin or the manifest will point at `https://instalanding.ai`.
- Known gap: the SPA is not prerendered, so `/prompt/<slug>` returns the app shell to a fetcher.
  The flat endpoints exist precisely so agents do not need it — but prerendering is the next win
  for crawlers and link unfurls.
