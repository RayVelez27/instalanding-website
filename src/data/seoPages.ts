/**
 * Search landing pages: one static HTML page per search intent ("one shot
 * html", "instant landing pages", ...), rendered at build time by
 * plugins/seo-pages.mjs into dist/<slug>/index.html.
 *
 * They are static on purpose. The app is client-rendered, and most AI crawlers
 * (and every link preview) read the raw HTML without running JavaScript, so a
 * React route would show them an empty shell. These pages carry their whole
 * text, a live list of templates and JSON-LD in the HTML itself.
 *
 * They are not linked from the app. Crawlers find them through sitemap.xml and
 * llms.txt, and they link to each other and into the library.
 *
 * Each page answers a different intent with its own content. A page that only
 * swaps the keyword is a doorway page and ranks like one, so close variants
 * ("1 shot html") are covered in the copy of the main page and 301 to it from
 * public/_redirects instead of getting a page of their own.
 *
 * Text fields may use {count} (live templates) and {site} (the site URL).
 * This file must stay import-free: the build plugin evaluates it directly.
 */

export interface SeoSection {
  h: string;
  p?: string[];
  list?: string[];
  steps?: string[];
  code?: string;
  /** Render the builder pages (src/data/builders.ts) as a link list. */
  builders?: boolean;
  /** Render the library categories as a link list. */
  categories?: boolean;
}

export interface SeoPage {
  /** URL segment; the page is served at /<slug>/ */
  slug: string;
  /** The search term the page is written for */
  keyword: string;
  /** <title>, without the site name */
  title: string;
  description: string;
  h1: string;
  lede: string;
  sections: SeoSection[];
  /** Which templates to show */
  pick: {
    /** Regex tested against description, bestFor and style; omit for all */
    match?: string;
    /** Only pages that load no JavaScript library */
    noLibraries?: boolean;
    sort?: "newest" | "detail";
    limit?: number;
  };
  gridTitle: string;
  faq: { q: string; a: string }[];
}

export const seoPages: SeoPage[] = [
  {
    slug: "one-shot-html",
    keyword: "one shot html",
    title: "One-Shot HTML: Complete Landing Pages From One Prompt",
    description:
      "One-shot HTML is a whole, working web page from a single prompt: one HTML file, no build step. Free one-shot HTML landing pages with the exact prompt behind each.",
    h1: "One-shot HTML",
    lede:
      "A complete, working page from a single prompt, delivered as one HTML file that opens straight from disk. You will also see it written “1-shot HTML” or “one shot HTML”. It is the same idea.",
    sections: [
      {
        h: "What one-shot HTML means",
        p: [
          "In AI-assisted building, a one-shot is a result that is right the first time: one message in, a finished artifact out, no back-and-forth. One-shot HTML applies that to the web. The model returns a single .html file with its CSS and JavaScript inline, and that file is the whole deliverable.",
          "There is no framework to scaffold, no package to install and no build to run. You open the file in a browser and it works, which also makes it easy to check: what you see is everything there is.",
        ],
      },
      {
        h: "Why most one-shot attempts come back generic",
        p: [
          "The prompt is usually the problem. “A landing page for an AI startup” leaves the model to choose the palette, the type scale, the section order and the motion, and it reaches for the average of everything it has seen.",
          "Prompts that one-shot reliably are long and specific. They name exact colours, fonts and sizes, list every section in order, describe each interaction, and call out the details that usually break, such as horizontal scroll on a phone or animation with no reduced-motion fallback. Every page below was built from a prompt like that, and the prompt is published next to it.",
        ],
      },
      {
        h: "How to one-shot an HTML page",
        steps: [
          "Pick a page below and open its live demo, so you know exactly what the prompt produces.",
          "Copy its prompt, or fetch it raw from {site}p/<slug>.txt.",
          "Paste it into Claude, ChatGPT, Gemini, Cursor or any coding agent and ask for a single HTML file with everything inline.",
          "Open the file in a browser. Then change the brand, copy and colours by hand or with one follow-up message.",
        ],
      },
      {
        h: "What a good one-shot HTML file looks like",
        list: [
          "Everything inline: CSS in a <style> block, JavaScript in a <script> block, graphics as SVG, CSS or canvas.",
          "No build step: it runs from file:// as well as from a server.",
          "Libraries, if any, from one pinned CDN version.",
          "Responsive down to a 390px phone with no horizontal scroll.",
          "A reduced-motion path for every animation.",
          "Marked sections and design tokens in one place, so a person or an agent can find and change each part.",
        ],
      },
    ],
    pick: { sort: "newest", limit: 9 },
    gridTitle: "Newest one-shot HTML pages",
    faq: [
      {
        q: "Is “1-shot HTML” the same as one-shot HTML?",
        a: "Yes. One-shot, 1-shot and single-shot all mean a complete result from one prompt, without iterating.",
      },
      {
        q: "Which AI model is best for one-shot HTML?",
        a: "Any current frontier model can do it when the prompt is detailed enough. The brief matters more than the model. The prompts here are written to work in Claude, ChatGPT and Gemini, and in coding agents such as Cursor, Codex and Claude Code.",
      },
      {
        q: "Can I use these pages commercially?",
        a: "Yes. Every page and prompt in the library is free and MIT licensed, with no account.",
      },
      {
        q: "Can I move a one-shot HTML page into React or Next.js?",
        a: "Yes. It starts as plain HTML, so it fits anywhere. Ask your agent to turn each marked section into a component and the design tokens into your theme.",
      },
    ],
  },
  {
    slug: "instant-landing-pages",
    keyword: "instant landing pages",
    title: "Instant Landing Pages: Free, Ready-to-Ship HTML",
    description:
      "Instant landing pages you can open, edit and deploy in minutes: free single-file HTML templates with live demos. No signup and no page builder.",
    h1: "Instant landing pages",
    lede:
      "Open one, change the words, ship it. Each page is a single HTML file that already works, so going live takes minutes instead of a sprint.",
    sections: [
      {
        h: "From nothing to live",
        steps: [
          "Browse the pages below and open the live demo of the one closest to what you need.",
          "Open its template page and press COPY CODE. That copies the complete HTML file.",
          "Replace the brand name, headline, copy and colours. Every file starts with a comment that maps its sections and design tokens.",
          "Deploy the file to any static host: Netlify Drop, Vercel, GitHub Pages, Cloudflare Pages or a storage bucket. It is one file, so there are no build settings.",
        ],
      },
      {
        h: "Instant, without a page builder",
        p: [
          "Hosted page builders are quick until you need something they do not do. Then you are on their plan and inside their editor. These pages are just files: you own them, host them anywhere and edit them with any editor or AI agent. Nothing is tied to an account and nothing costs money.",
        ],
      },
      {
        h: "Instant, with an AI agent",
        p: [
          "If you work with an agent such as Claude Code, Cursor or Codex, it can do the whole job: find a page, fetch its code or prompt, and adapt it to your product. Connect it to the library's hosted MCP server with one command, or point it at {site}llms.txt.",
        ],
        code: "claude mcp add --transport http instalanding {site}mcp",
      },
    ],
    pick: { match: "\\b(light|launch|saas|startup|product)\\b", sort: "newest", limit: 9 },
    gridTitle: "Pages you can ship today",
    faq: [
      {
        q: "How fast is “instant”?",
        a: "Swapping the copy takes minutes, because the layout, responsive behaviour and animation are already done. A rebrand takes a few minutes more: each page keeps its colours and fonts in one block of variables at the top.",
      },
      {
        q: "Do I need to know how to code?",
        a: "No. Paste the file into an AI chat, ask for your changes in plain words, then drag the result into Netlify Drop to put it online.",
      },
      {
        q: "Are they really free?",
        a: "Yes. MIT licensed, no signup, no watermark.",
      },
    ],
  },
  {
    slug: "single-file-html",
    keyword: "single file html landing page",
    title: "Single-File HTML Landing Pages (No Dependencies)",
    description:
      "Single-file HTML landing pages: one .html file with CSS, JavaScript and graphics inline. No build and no npm install. Free templates and the prompts that make them.",
    h1: "Single-file HTML landing pages",
    lede: "One file holding the CSS, the JavaScript and the graphics. Double-click it and it runs.",
    sections: [
      {
        h: "Why one file",
        list: [
          "Portable: email it, drop it in a repo, attach it to an issue. It works wherever it lands.",
          "Reviewable: the whole page is one diff, which is easy for a person or an agent to check.",
          "Durable: there is no dependency tree to rot. A file that works today still works in five years.",
          "Fast: no framework runtime has to download before anything renders.",
        ],
      },
      {
        h: "How these files are built",
        p: [
          "Styles live in one <style> block, organised around custom properties at the top, so a rebrand is a handful of values. Scripts live in one <script> block. Graphics are inline SVG, CSS or canvas, so there are no image requests.",
          "When a page needs a library, such as three.js or GSAP, it loads one pinned version from a CDN. The pages below need none at all: plain HTML, CSS and JavaScript, typically around 100 KB in total.",
        ],
      },
      {
        h: "When one file is no longer enough",
        p: [
          "Split it along its sections. Each page marks them with data-section attributes, so each one becomes a component in React, Vue, Svelte or Astro and the custom properties become your theme. An agent can make the split in one message because the structure is already labelled.",
        ],
      },
    ],
    pick: { noLibraries: true, sort: "newest", limit: 12 },
    gridTitle: "Single-file pages with zero dependencies",
    faq: [
      {
        q: "Can a single HTML file include fonts and images?",
        a: "Yes. Images can be inline SVG or data URIs, and fonts can come from a stylesheet link such as Google Fonts or be embedded as base64. Most pages here use inline SVG and a Google Fonts link.",
      },
      {
        q: "Is a single-file page bad for SEO?",
        a: "No. Search engines read the HTML, and a static file with real text, headings and a meta description is about as crawlable as a page gets. It also loads quickly, which helps.",
      },
      {
        q: "How big does a single-file page get?",
        a: "Smaller than you might expect. Most pages here are around 100 KB, and the most elaborate, with WebGL scenes and long scroll sequences, stay under 400 KB.",
      },
    ],
  },
  {
    slug: "one-shot-landing-page-prompts",
    keyword: "one shot landing page prompt",
    title: "One-Shot Landing Page Prompts That Work First Time",
    description:
      "Copy-paste landing page prompts that build a complete page in one message. Each prompt comes with a live demo of its output and works in Claude, ChatGPT, Gemini and coding agents.",
    h1: "One-shot landing page prompts",
    lede:
      "Long, specific briefs that get a finished landing page from one message, each shown next to the page it actually built.",
    sections: [
      {
        h: "What is in a prompt that one-shots",
        list: [
          "The system: exact hex colours, font families and weights, a type scale, radii and shadows.",
          "The structure: every section, in order, and what goes in it.",
          "The behaviour: each animation and interaction, with timings.",
          "The constraints: a single file, which libraries at which versions, no horizontal scroll at 390px, a reduced-motion path.",
          "The failure list: the specific things that usually go wrong with this kind of page, named before they happen.",
        ],
      },
      {
        h: "Why you should see the output first",
        p: [
          "A prompt you cannot preview is a gamble. Every prompt here ships with the page it built, so you can judge the result before spending a message, and you know what done looks like when your own run finishes.",
        ],
      },
      {
        h: "Using one",
        steps: [
          "Open a page's live demo.",
          "Copy its prompt, or fetch it raw from {site}p/<slug>.txt.",
          "Paste it into your model or agent and ask for one HTML file.",
          "Change the brand and copy in a follow-up message, or edit the file directly.",
        ],
      },
      {
        h: "Prompts adapted to your tool",
        p: ["Each tool wants to be asked a little differently. These guides add a short preamble that fits the prompts to it."],
        builders: true,
      },
    ],
    pick: { sort: "detail", limit: 9 },
    gridTitle: "The most detailed prompts in the library",
    faq: [
      {
        q: "How long are these prompts?",
        a: "Most run from about 4,500 to 11,000 characters, roughly 1,100 to 2,800 tokens. That is long enough to pin down the design and short enough for any current model.",
      },
      {
        q: "Will I get exactly the demo?",
        a: "Close, not identical. Models vary from run to run, so expect the same structure, palette and interactions with small differences in detail. The failure list in each prompt keeps those differences cosmetic.",
      },
      {
        q: "Can I change the brand in the prompt itself?",
        a: "Yes. Swap the brand name, product and copy before you paste it. The design instructions still apply.",
      },
    ],
  },
  {
    slug: "free-html-landing-page-templates",
    keyword: "free html landing page templates",
    title: "Free HTML Landing Page Templates (MIT, No Signup)",
    description:
      "{count} free HTML landing page templates: single-file, responsive, animated and MIT licensed. Live demos, full source and the AI prompt behind each. No signup.",
    h1: "Free HTML landing page templates",
    lede:
      "{count} complete landing pages, free to use for anything. Each one is a single HTML file with a live demo, its full source and the prompt that built it.",
    sections: [
      {
        h: "What comes with each template",
        list: [
          "The full HTML file, ready to deploy.",
          "A live demo, so you see it working before you take it.",
          "The prompt that generated it, to rebuild or remix it with AI.",
          "Its theme and section list, so you can tell at a glance whether it fits.",
          "The MIT licence: use it in personal and commercial projects.",
        ],
      },
      {
        h: "No framework required",
        p: [
          "These are not Bootstrap or Tailwind themes. Each page is hand-shaped CSS built on custom properties, with no CSS framework to learn or override. Some load a JavaScript library such as GSAP or three.js from a CDN for motion and 3D; many load nothing at all.",
        ],
      },
      {
        h: "Browse by kind",
        categories: true,
      },
    ],
    pick: { sort: "newest" },
    gridTitle: "Every template",
    faq: [
      {
        q: "Are these templates really free?",
        a: "Yes. Every template is MIT licensed, with no signup, no paywall and no watermark.",
      },
      {
        q: "Are they responsive?",
        a: "Yes. Every page is checked at desktop width and on a 390px phone, with no horizontal scroll.",
      },
      {
        q: "How do I download one?",
        a: "Open its template page and press COPY CODE, or open the live demo and save the page. Either way you get the complete single HTML file.",
      },
    ],
  },
  {
    slug: "ai-landing-page-templates",
    keyword: "ai landing page templates",
    title: "AI Landing Page Templates for AI Startups and Agents",
    description:
      "Landing page templates for AI products: agent platforms, copilots, model APIs and developer tools. Free single-file HTML with live demos and the prompts that built them.",
    h1: "AI landing page templates",
    lede:
      "Pages for AI products that look technical and alive: live terminals, agent runs, model routers and shader heroes, not a purple gradient and a stock robot.",
    sections: [
      {
        h: "What an AI product page has to show",
        list: [
          "The product working: a run log, a chat that answers, a pipeline that moves. AI buyers want proof more than adjectives.",
          "Speed and reliability as numbers: latency, uptime, throughput, evals.",
          "How it fits in: the SDK snippet, the integrations, the shape of the API.",
          "Trust: how data is handled, where it can be deployed, pricing that still makes sense at scale.",
        ],
      },
      {
        h: "Built for agents as well as people",
        p: [
          "The library is also published in forms an AI agent can use directly: a JSON manifest at {site}prompts.json, each prompt as plain text at {site}p/<slug>.txt, an index at {site}llms.txt and a hosted MCP server. An agent can search the library, pick a page for your product and adapt it without you copying anything.",
        ],
        code: "claude mcp add --transport http instalanding {site}mcp",
      },
    ],
    pick: { match: "\\b(ai|agent|agents|agentic|llm|llms|model|models|copilot|inference)\\b", sort: "newest", limit: 12 },
    gridTitle: "Templates for AI products",
    faq: [
      {
        q: "Can my coding agent use these directly?",
        a: "Yes. Add the MCP server with one command and your agent can search the library, read a prompt or fetch a page's code. Agents without MCP can read {site}llms.txt.",
      },
      {
        q: "What stack do they use?",
        a: "Plain HTML, CSS and JavaScript in one file. Some use three.js, GSAP or WebGL shaders from a pinned CDN version for 3D and motion.",
      },
      {
        q: "Are the brands real?",
        a: "No. Every brand, customer and number in the templates is fictional, so replace them with your own before you ship.",
      },
    ],
  },
];
