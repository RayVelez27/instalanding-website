/**
 * Renders the search landing pages in src/data/seoPages.ts as static HTML,
 * one dist/<slug>/index.html each. Static because the app is client-rendered
 * and most AI crawlers never run its JavaScript; everything here (copy,
 * template list, FAQ, JSON-LD) is in the HTML a crawler downloads.
 *
 * Called from library-endpoints.mjs, which owns loading the data files.
 */

const SITE_NAME = "InstaLanding.ai";
const ANALYTICS =
  '<script defer data-website-id="dfid_pauXjmQ3h5yYNr1572Y2Q" data-domain="instalanding.ai" src="https://datafa.st/js/script.js"></script>';

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/** Templates a visitor can open: not hidden, with a demo and a screenshot. */
const visible = (prompts) => prompts.filter((p) => !p.hidden && p.demo && p.thumbnail);

const pickTemplates = (page, prompts, readDemo) => {
  const { match, noLibraries, sort = "newest", limit } = page.pick;
  let list = visible(prompts);
  if (match) {
    const re = new RegExp(match, "i");
    list = list.filter((p) => re.test([p.description, ...(p.bestFor ?? []), ...(p.style ?? [])].join(" ")));
  }
  if (noLibraries) list = list.filter((p) => !(readDemo(p.demo).stack?.libraries?.length ?? 0));
  // prompts.ts is newest-first already
  if (sort === "detail") list = [...list].sort((a, b) => b.prompt.length - a.prompt.length);
  return limit ? list.slice(0, limit) : list;
};

const pageUrl = (base, page) => `${base}${page.slug}/`;

const CSS = `
:root{--bg:#fff;--fg:#121212;--muted:#5f5f5f;--line:#e4e4e4;--soft:#f6f6f6;--accent:#121212;--on-accent:#fff;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0a;--fg:#f2f2f2;--muted:#a3a3a3;--line:#262626;--soft:#141414;--accent:#f2f2f2;--on-accent:#0a0a0a;color-scheme:dark}}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;background:var(--bg);color:var(--fg);font-size:15px;line-height:1.65;-webkit-font-smoothing:antialiased}
a{color:inherit}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
header.top{border-bottom:1px solid var(--line)}
header.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;height:64px}
.brand{font-weight:600;letter-spacing:.08em;text-decoration:none;font-size:13px}
.top-cta{font-size:12px;letter-spacing:.08em;text-decoration:none;border:1px solid var(--fg);padding:8px 14px}
.top-cta:hover{background:var(--fg);color:var(--bg)}
.crumbs{font-size:11px;letter-spacing:.1em;color:var(--muted);margin-top:40px;text-transform:uppercase}
.crumbs a{text-decoration:none}
h1{font-size:clamp(32px,6vw,56px);line-height:1.05;letter-spacing:-.02em;margin-top:14px;font-weight:600;text-wrap:balance}
.lede{font-size:17px;color:var(--muted);max-width:62ch;margin-top:18px}
.ctas{display:flex;flex-wrap:wrap;gap:10px;margin-top:26px}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;border:1px solid var(--fg)}
.btn.solid{background:var(--accent);color:var(--on-accent)}
.btn:hover{opacity:.85}
main section{margin-top:56px}
h2{font-size:20px;font-weight:600;letter-spacing:-.01em;margin-bottom:12px}
p+p{margin-top:12px}
.prose{max-width:72ch}
ul.list,ol.steps{margin-top:6px;padding-left:22px;max-width:72ch}
ul.list li,ol.steps li{margin-top:8px}
pre{margin-top:14px;padding:14px 16px;background:var(--soft);border:1px solid var(--line);overflow-x:auto;font-size:13px}
.links{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;list-style:none}
.links a{display:inline-block;font-size:12px;padding:6px 12px;border:1px solid var(--line);text-decoration:none}
.links a:hover{border-color:var(--fg)}
.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:18px;list-style:none}
.card{border:1px solid var(--line);display:flex;flex-direction:column;min-width:0}
.card img{display:block;width:100%;height:auto;aspect-ratio:2/1;object-fit:cover;background:var(--soft);border-bottom:1px solid var(--line)}
.card-body{padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px;flex:1}
.card h3{font-size:14px;font-weight:600;line-height:1.3}
.card h3 a{text-decoration:none}
.card p{font-size:12.5px;color:var(--muted);line-height:1.55}
.card .meta{font-size:11px;color:var(--muted);letter-spacing:.04em}
.card .acts{display:flex;flex-wrap:wrap;gap:12px;margin-top:auto;padding-top:6px;font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.faq h3{font-size:15px;font-weight:600;margin-top:22px}
.faq p{color:var(--muted);margin-top:6px;max-width:72ch}
footer{margin-top:72px;border-top:1px solid var(--line);padding:28px 0 40px;font-size:12px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;gap:12px 24px;justify-content:space-between}
@media (max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:600px){.grid{grid-template-columns:minmax(0,1fr)}.lede{font-size:15px}}
`;

const fill = (text, vars) => text.replaceAll("{count}", vars.count).replaceAll("{site}", vars.base);

const renderSection = (s, ctx) => {
  const t = (x) => esc(fill(x, ctx));
  let out = `<section><h2>${t(s.h)}</h2>`;
  if (s.p) out += `<div class="prose">${s.p.map((x) => `<p>${t(x)}</p>`).join("")}</div>`;
  if (s.list) out += `<ul class="list">${s.list.map((x) => `<li>${t(x)}</li>`).join("")}</ul>`;
  if (s.steps) out += `<ol class="steps">${s.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol>`;
  if (s.code) out += `<pre><code>${t(s.code)}</code></pre>`;
  if (s.builders)
    out += `<ul class="links">${ctx.builders
      .map((b) => `<li><a href="${esc(b.path)}">${esc(b.title)}</a></li>`)
      .join("")}</ul>`;
  if (s.categories)
    out += `<ul class="links">${ctx.categories
      .map((c) => `<li><a href="/category/${esc(c.slug)}">${esc(c.label)} (${c.count})</a></li>`)
      .join("")}</ul>`;
  return out + `</section>`;
};

const renderCard = (p, i) => `<li class="card">
  <a href="/prompt/${esc(p.slug)}" tabindex="-1" aria-hidden="true"><img src="${esc(p.thumbnail)}" alt="" width="1200" height="600"${
    i > 2 ? ' loading="lazy"' : ""
  } decoding="async"></a>
  <div class="card-body">
    <h3><a href="/prompt/${esc(p.slug)}">${esc(p.title)}</a></h3>
    <p>${esc(p.description)}</p>
    <span class="meta">${esc([...new Set([p.theme, ...(p.style ?? [])].filter(Boolean))].slice(0, 4).join(" · "))} · ~${Math.round(
      p.prompt.length / 4
    ).toLocaleString("en-US")} token prompt</span>
    <span class="acts"><a href="${esc(p.demo)}">Live demo</a><a href="/p/${esc(p.slug)}.txt">Prompt</a><a href="/prompt/${esc(
      p.slug
    )}">Code</a></span>
  </div>
</li>`;

const renderPage = (page, ctx) => {
  const url = pageUrl(ctx.base, page);
  const title = `${fill(page.title, ctx)} | ${SITE_NAME}`;
  const description = fill(page.description, ctx);
  const templates = pickTemplates(page, ctx.prompts, ctx.readDemo);
  const others = ctx.pages.filter((o) => o.slug !== page.slug);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: fill(page.h1, ctx),
      headline: fill(page.title, ctx),
      description,
      url,
      inLanguage: "en",
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: ctx.base },
      about: page.keyword,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: templates.length,
        itemListElement: templates.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${ctx.base}prompt/${p.slug}`,
          name: p.title,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: ctx.base },
        { "@type": "ListItem", position: 2, name: fill(page.h1, ctx), item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map((f) => ({
        "@type": "Question",
        name: fill(f.q, ctx),
        acceptedAnswer: { "@type": "Answer", text: fill(f.a, ctx) },
      })),
    },
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ctx.base}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ctx.base}og.png">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt index">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>${CSS.trim()}</style>
${ld.map((x) => `<script type="application/ld+json">${JSON.stringify(x).replaceAll("<", "\\u003c")}</script>`).join("\n")}
${ANALYTICS}
</head>
<body>
<header class="top"><div class="wrap">
  <a class="brand" href="/">INSTALANDING.AI</a>
  <a class="top-cta" href="/">BROWSE ${ctx.count} PAGES</a>
</div></header>
<main class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/">InstaLanding.ai</a> / ${esc(fill(page.h1, ctx))}</nav>
  <h1>${esc(fill(page.h1, ctx))}</h1>
  <p class="lede">${esc(fill(page.lede, ctx))}</p>
  <div class="ctas">
    <a class="btn solid" href="/">Browse all ${ctx.count} pages</a>
    <a class="btn" href="/agents">Use with an AI agent</a>
  </div>
  ${page.sections.map((s) => renderSection(s, ctx)).join("\n  ")}
  <section>
    <h2>${esc(fill(page.gridTitle, ctx))}</h2>
    <p class="prose">Each one is a single HTML file. Open the live demo, read the prompt that built it, or copy the code.</p>
    <ul class="grid">${templates.map(renderCard).join("")}</ul>
  </section>
  <section class="faq">
    <h2>Questions</h2>
    ${page.faq.map((f) => `<h3>${esc(fill(f.q, ctx))}</h3><p>${esc(fill(f.a, ctx))}</p>`).join("\n    ")}
  </section>
  <section>
    <h2>Related guides</h2>
    <ul class="links">${others.map((o) => `<li><a href="/${o.slug}/">${esc(fill(o.h1, ctx))}</a></li>`).join("")}<li><a href="/builders">Prompts by AI builder</a></li></ul>
  </section>
</main>
<footer><div class="wrap">
  <span>InstaLanding.ai: premium one-shot HTML landing pages, free and MIT licensed.</span>
  <span><a href="/">Library</a> · <a href="/agents">Agents</a> · <a href="/llms.txt">llms.txt</a> · <a href="/prompts.json">prompts.json</a></span>
</div></footer>
</body>
</html>
`;
};

const contextFor = ({ pages, library, builders, base, readDemo }) => {
  const prompts = library.prompts;
  const live = visible(prompts);
  const categories = library.categories
    .filter((c) => c.slug !== "product") // parked section, shows a coming-soon page
    .map((c) => ({ ...c, count: live.filter((p) => p.category === c.slug).length }))
    .filter((c) => c.count);
  return { pages, prompts, builders, base, readDemo, categories, count: String(live.length) };
};

/** { "<slug>/index.html": html } for every search page. */
export const renderSeoPages = (opts) => {
  const ctx = contextFor(opts);
  return Object.fromEntries(opts.pages.map((page) => [`${page.slug}/index.html`, renderPage(page, ctx)]));
};

export const seoSitemapUrls = (pages, base) => pages.map((p) => ({ loc: pageUrl(base, p), priority: "0.8" }));

export const seoLlmsLines = (pages, base, count) => [
  "## Guides",
  "",
  ...pages.map((p) => `- [${p.h1}](${pageUrl(base, p)}): ${p.description.replaceAll("{count}", count)}`),
  "",
];
