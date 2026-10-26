/**
 * Per-route copies of the app shell, so an agent that does not run JavaScript
 * still reads something true at /prompt/<slug>, /systems/<slug> and /motion/<slug>.
 *
 *   dist/prompt/<slug>.html    Netlify serves it for /prompt/<slug> ahead of the SPA fallback
 *   dist/systems/<slug>.html
 *   dist/motion/<slug>.html
 *
 * Each copy is the built index.html with that route's title, description and
 * canonical, and a <noscript> summary that names the page's prompt and code. The app
 * mounts over it exactly as it does over the plain shell, so people see no
 * difference. Assistants that browse (ChatGPT-User, Claude-User) read the
 * <noscript> note on / and follow it, which is why the summary lives there.
 *
 * Specimen pages are static already; they get the same pointer to the agent
 * instruction, injected after <body>.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Replace exactly one match, or fail the build: a silent miss would ship the wrong title. */
const swap = (html, pattern, replacement, what) => {
  if (!pattern.test(html)) throw new Error(`route-pages: index.html has no ${what}`);
  return html.replace(pattern, replacement);
};

const link = (base, url, label = url) => `<a href="${esc(new URL(url, base).href)}">${esc(label)}</a>`;

/** The summary an agent reads in place of the app. */
const noscript = (lines) => `<noscript>\n      ${lines.filter(Boolean).join("\n      ")}\n    </noscript>`;

const routeHtml = (shell, route) => {
  let html = shell;
  const title = `${route.title} — InstaLanding.ai`;
  html = swap(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, "<title>");
  html = swap(html, /(<meta name="description" content=")[^"]*(")/, `$1${esc(route.description)}$2`, "meta description");
  html = swap(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${esc(route.url)}$2`, "canonical");
  html = swap(html, /(<meta property="og:url" content=")[^"]*(")/, `$1${esc(route.url)}$2`, "og:url");
  html = swap(html, /(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`, "og:title");
  html = swap(html, /(<meta property="og:description" content=")[^"]*(")/, `$1${esc(route.description)}$2`, "og:description");
  html = swap(html, /(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`, "twitter:title");
  html = swap(html, /(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(route.description)}$2`, "twitter:description");
  html = swap(html, /<noscript>[\s\S]*?<\/noscript>/, noscript(route.lines), "<noscript> note");
  return html;
};

/** Every route that gets its own shell, with the lines its summary carries. */
export const buildRoutes = ({ prompts, systems, motion, base }) => {
  const skill = `How to use the library without a shell: ${link(base, "/SKILL.md")}. Index of everything: ${link(base, "/llms.txt")}.`;
  return [
    ...prompts.map((p) => ({
      file: `prompt/${p.slug}.html`,
      url: new URL(`/prompt/${p.slug}`, base).href,
      title: p.title,
      description: p.description,
      lines: [
        `<h1>${esc(p.title)}</h1>`,
        `<p>${esc(p.description)}</p>`,
        p.bestFor?.length ? `<p>Best for: ${esc(p.bestFor.join(", "))}. Style: ${esc((p.style ?? []).join(", "))}.</p>` : "",
        `<p>The prompt, a short instruction followed by the page's whole HTML file (~${Math.round(p.prompt.length / 4).toLocaleString("en-US")} tokens): ${link(base, `/p/${p.slug}.txt`)}. Give it to an agent and it builds this page.</p>`,
        `<p>The code alone, one HTML file: ${link(base, p.demo)}. With its metadata: ${link(base, `/p/${p.slug}.json`)}.</p>`,
        `<p>${skill}</p>`,
      ],
    })),
    ...systems.map((s) => ({
      file: `systems/${s.slug}.html`,
      url: s.pageUrl,
      title: `${s.name} design system`,
      description: `${s.tagline}. ${s.description ?? ""}`.trim(),
      lines: [
        `<h1>${esc(s.name)} design system</h1>`,
        `<p>${esc(s.tagline)}. ${esc(s.description ?? "")}</p>`,
        `<p>The agent instruction, every token inline: ${link(base, s.instructionUrl)}. Restyle an existing project with it.</p>`,
        `<p>Live specimen of every component: ${link(base, s.files.specimen)}. Tokens: ${link(base, s.files.tokens)}.</p>`,
        `<p>${skill}</p>`,
      ],
    })),
    ...motion.map((m) => ({
      file: `motion/${m.slug}.html`,
      url: m.pageUrl,
      title: m.title,
      description: `${m.tagline}. ${m.description ?? ""}`.trim(),
      lines: [
        `<h1>${esc(m.title)}</h1>`,
        `<p>${esc(m.tagline)}. ${esc(m.description ?? "")}</p>`,
        `<p>The one-shot prompt, plain text: ${link(base, m.promptUrl)}.${m.demoUrl ? ` Demo: ${link(base, m.demoUrl)}.` : ""}</p>`,
        `<p>${skill}</p>`,
      ],
    })),
  ];
};

/** Write the route shells and the specimen pointers into the finished build. */
export const writeRoutePages = (outDir, routes, systems, base) => {
  const shellFile = path.join(outDir, "index.html");
  if (!existsSync(shellFile)) throw new Error("route-pages: dist/index.html was not built");
  const shell = readFileSync(shellFile, "utf8");
  for (const route of routes) {
    const file = path.join(outDir, route.file);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, routeHtml(shell, route));
  }
  let specimens = 0;
  for (const s of systems) {
    const file = path.join(outDir, new URL(s.files.specimen).pathname);
    if (!existsSync(file)) continue;
    const html = readFileSync(file, "utf8");
    if (html.includes('data-agent-note')) continue;
    const note =
      `<noscript data-agent-note><p>${esc(s.name)} design system, for agents: the instruction with every token inline is ` +
      `${link(base, s.instructionUrl)}; the system page is ${link(base, s.pageUrl)}.</p></noscript>`;
    const alt = `<link rel="alternate" type="text/plain" href="${esc(s.instructionUrl)}" title="Agent instruction">`;
    writeFileSync(file, html.replace(/<\/head>/, `${alt}\n</head>`).replace(/<body([^>]*)>/, `<body$1>\n${note}`));
    specimens++;
  }
  return { routes: routes.length, specimens };
};
