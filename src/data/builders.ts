/**
 * The builders the library targets, one entry per landing page.
 *
 * These pages exist to be found — /lovable-prompts, /v0-prompts and so on are
 * the terms people actually search — but a page that only swaps a product name
 * is a doorway page and deserves to rank like one. So every entry carries
 * three things that are genuinely different per tool:
 *
 *   how      the shape of that environment's workflow, in its own terms
 *   steps    what you actually do to run one of these prompts there
 *   preamble a paste-ready block that adapts the brief to that environment
 *
 * `preamble` is the important one: it goes in front of any prompt in the
 * library and turns a generic brief into instructions that environment can
 * follow — file paths and verification for a repo agent, component shape for
 * a UI generator, dependency limits for an in-browser sandbox.
 *
 * Adding a builder is one object. Nothing else needs to change: the hub, the
 * routes, the cross-links and the SEO tags are all generated from this list.
 */

export type BuilderKind =
  | "App generator"
  | "UI generator"
  | "IDE agent"
  | "Terminal agent"
  | "Cloud workspace";

export interface Builder {
  /** URL path, chosen for the search term rather than for tidiness */
  path: string;
  /** Short name, used in menus and cross-links */
  name: string;
  /** The page's H1 and <title> */
  title: string;
  /** Meta description */
  description: string;
  kind: BuilderKind;
  /** One line under the H1 */
  lede: string;
  /** What this environment is, in two or three sentences */
  how: string;
  /** What you do, in order */
  steps: string[];
  /** Paste this in front of any prompt in the library */
  preamble: string;
  /** The thing that most often goes wrong here */
  gotcha: string;
}

export const builders: Builder[] = [
  {
    path: "/lovable-prompts",
    name: "Lovable",
    title: "Best Lovable Landing Page Prompts",
    description:
      "Free one-shot landing page prompts written for Lovable, with a reference build of every result you can open before you paste anything.",
    kind: "App generator",
    lede: "Prompts that give Lovable a whole page in one message, instead of ten rounds of nudging.",
    how:
      "Lovable builds and iterates on a working app from a conversation, so the first message sets the shape of everything after it. A brief that names the palette, the type scale and the section order up front gets you a page you refine; a brief that says 'a landing page for a SaaS' gets you a template you argue with.",
    steps: [
      "Start a new project rather than adding to one — these briefs assume an empty canvas.",
      "Paste the preamble and the prompt together as the first message.",
      "Let it finish the whole page before asking for anything. Partial corrections mid-build get overwritten.",
      "Refine by naming the section: \"the pricing band\", not \"the third one down\".",
    ],
    preamble:
      "Build this as a single landing page, not an app shell: no auth, no database, no routing beyond in-page anchors. Use the colours, type scale and section order exactly as written below rather than substituting a default theme. Build the whole page before asking me anything.",
    gotcha:
      "Lovable will happily add a backend you did not ask for. The preamble's first sentence is what stops that.",
  },
  {
    path: "/v0-prompts",
    name: "v0",
    title: "Best v0 Landing Page Prompts",
    description:
      "Landing page prompts adapted for v0: single-component React and Tailwind output, with a live reference build of each result.",
    kind: "UI generator",
    lede: "Briefs shaped the way v0 actually returns work — as components, in React and Tailwind.",
    how:
      "v0 generates interface code rather than a project, and it is strongest when the request maps onto one component tree it can render in the preview. Ask for a page and you get a page component; ask for a site and you get a fight with the preview.",
    steps: [
      "Paste the preamble and the prompt into a new chat.",
      "Take the first version as a draft — fork it before asking for changes so you can compare.",
      "Ask for one change per turn. Two changes in a message usually means one gets ignored.",
      "Bring it into your project with the shadcn CLI once the layout is right.",
    ],
    preamble:
      "Return this as one React page component in TypeScript with Tailwind classes. No new dependencies beyond shadcn/ui primitives, no external CSS files, no global style resets — everything inline in the component. Keep the section order below exactly and use the literal colour values given rather than the nearest Tailwind token.",
    gotcha:
      "Tailwind's palette will quietly eat your hex values. Saying \"use the literal values\" is the difference between your colour and slate-900.",
  },
  {
    path: "/bolt-prompts",
    name: "Bolt.new",
    title: "Best Bolt.new Website Prompts",
    description:
      "One-shot website prompts for Bolt.new, written for its in-browser build, with a reference implementation of every result.",
    kind: "App generator",
    lede: "Prompts that keep Bolt inside a single file and out of a ten-package install.",
    how:
      "Bolt scaffolds a real project and runs it in the browser, which is excellent for seeing the thing immediately and expensive every time it decides the page needs a framework. The briefs in this library are single-file by design, which is the shape Bolt handles fastest.",
    steps: [
      "Paste the preamble and the prompt into a fresh project.",
      "Let the install finish before touching anything — an early edit restarts it.",
      "Preview in the built-in browser, then download the file if you only wanted the page.",
      "Ask for changes against the file by name once it exists.",
    ],
    preamble:
      "Build this as one static HTML file with the CSS and JavaScript inlined. Do not scaffold a framework, do not add a build step, and do not install packages unless the brief names one — a CDN script tag is fine. The file must work when opened directly from disk.",
    gotcha:
      "Left alone, Bolt reaches for a framework. Naming the output as one static file up front saves the whole install.",
  },
  {
    path: "/claude-code-prompts",
    name: "Claude Code",
    title: "Landing Page Prompts for Claude Code",
    description:
      "Landing page prompts written for Claude Code: file paths, verification steps and repo discipline, with a reference build of each result.",
    kind: "Terminal agent",
    lede: "Briefs with the repo instructions a terminal agent needs — where the file goes and how it gets checked.",
    how:
      "Claude Code works in your repository with real file tools, so it can write the page, open it in a browser, look at the result and fix what it sees. That last part is the difference: it is the only environment here where \"verify it\" is a real instruction rather than a hope.",
    steps: [
      "Run it in the repo where the page should land.",
      "Paste the preamble with the path you want, then the prompt.",
      "Let it verify before you look — it will catch its own layout bugs given permission to screenshot.",
      "Review the diff like any other commit.",
    ],
    preamble:
      "Write this to public/demos/<name>.html as one file with every asset inlined. When it is written, open it in a browser at 1512px and at 390px, check the console is clean and that the page does not scroll horizontally, look at the screenshots, and fix anything that is visibly wrong before telling me it is done. Do not create any other files.",
    gotcha:
      "Without an explicit path it will invent a directory structure. Without \"look at the screenshots\" it will report success on a page it has never seen.",
  },
  {
    path: "/cursor-prompts",
    name: "Cursor",
    title: "Landing Page Prompts for Cursor",
    description:
      "Landing page prompts adapted for Cursor's agent: file-scoped instructions that produce a diff you can read, with a reference build of each result.",
    kind: "IDE agent",
    lede: "Prompts scoped to a file, so the agent returns a diff instead of a new project.",
    how:
      "Cursor's agent is at its best editing code that already exists and at its worst inventing structure from nothing. Create the empty file first and the whole job becomes a single reviewable diff against a path you chose.",
    steps: [
      "Create the empty file yourself and open it.",
      "Open the agent, reference the file explicitly, and paste the preamble and prompt.",
      "Read the diff before accepting — it is one file, so this takes a minute.",
      "Iterate in the same thread so the file stays in context.",
    ],
    preamble:
      "Write the whole page into the file I have open, replacing its contents. One file only: inline the CSS and JavaScript, add no imports, and create no other files in the project. Keep the section order and the literal values given below.",
    gotcha:
      "If the file does not exist yet, the agent will guess a location and a framework. Making the file first removes both guesses.",
  },
  {
    path: "/replit-prompts",
    name: "Replit Agent",
    title: "Landing Page Prompts for Replit Agent",
    description:
      "Landing page prompts for Replit Agent, written for a Repl that builds, runs and serves the result, with a reference build of each.",
    kind: "App generator",
    lede: "Prompts that end with a URL you can send someone, not a project you have to configure.",
    how:
      "Replit Agent builds inside a Repl and runs it, so what you get back is a live address rather than a folder. The trade is that it will reach for a server and a package list unless the brief tells it the page is static.",
    steps: [
      "Start an empty Repl rather than a template.",
      "Paste the preamble and the prompt into the agent.",
      "Let it run once, then open the preview in a new tab at full width.",
      "Ask for changes by section name and re-run.",
    ],
    preamble:
      "Serve this from the Repl as one static index.html, with its CSS and JavaScript in the same file. No Express, no Vite and no build step — the run command should be a static file server and nothing more. It has to render at full width both in the preview pane and at the published URL, so use no fixed pixel widths and no second route.",
    gotcha:
      "A static page does not need Express. Saying so up front is worth a couple of minutes and a lot of dependencies.",
  },
  {
    path: "/windsurf-prompts",
    name: "Windsurf",
    title: "Landing Page Prompts for Windsurf",
    description:
      "Landing page prompts adapted for Windsurf's Cascade agent: workspace-scoped, one file, with a reference build of every result.",
    kind: "IDE agent",
    lede: "Workspace-aware briefs that keep an agentic editor inside one file.",
    how:
      "Windsurf's agent reads across the workspace before it writes, which is useful in a real codebase and a liability in an empty one, where it will infer conventions that are not there. Naming the file and forbidding the rest keeps the inference on a leash.",
    steps: [
      "Open the folder the page belongs in, not your whole projects directory.",
      "Create the empty file and name it in the prompt.",
      "Paste the preamble and the prompt into Cascade.",
      "Review the changed-files list before accepting — it should have exactly one entry.",
    ],
    preamble:
      "Write the entire page into the single file named below and change nothing else in the workspace. Inline the CSS and JavaScript, add no dependencies, and do not create config, README or component files. If a convention in this workspace conflicts with the brief, follow the brief.",
    gotcha:
      "In an empty workspace it will helpfully add tooling you did not ask for. The last sentence of the preamble is what stops it.",
  },
  {
    path: "/codex-prompts",
    name: "Codex",
    title: "Landing Page Prompts for OpenAI Codex",
    description:
      "Landing page prompts written as Codex tasks: one file, one diff, explicit acceptance criteria, with a reference build of each result.",
    kind: "Terminal agent",
    lede: "Briefs written as a task with acceptance criteria, because that is what comes back as a diff.",
    how:
      "Codex takes a task against a repository and returns work you review rather than watch. That makes the acceptance criteria the most important part of the prompt: anything you did not say you would check is something you will find out about later.",
    steps: [
      "Point the task at the repo and the branch you want the work on.",
      "Paste the preamble, then the prompt, then any acceptance criteria of your own.",
      "Let it run to completion — this is not a conversation.",
      "Review the diff, then run the page locally before merging.",
    ],
    preamble:
      "Task: add one file at the path below containing the whole page, with CSS and JavaScript inlined and no new dependencies. Acceptance criteria: the file opens standalone in a browser, the console is clean, there is no horizontal scroll at 390px or 1512px, and no other file in the repository is modified.",
    gotcha:
      "Codex will satisfy exactly what you wrote down. Vague briefs come back vague and correct.",
  },
  {
    path: "/base44-prompts",
    name: "Base44",
    title: "Landing Page Prompts for Base44",
    description:
      "Landing page prompts for Base44, adapted for a builder that assumes an app with a backend, with a reference build of each result.",
    kind: "App generator",
    lede: "Prompts that ask Base44 for a marketing page rather than another app screen.",
    how:
      "Base44 is built around producing an application — data, users, screens — so a landing page is the unusual request rather than the default one. Saying plainly that this is a public page with no data behind it is most of the adaptation.",
    steps: [
      "Start a new project and describe it as a marketing site, not an app.",
      "Paste the preamble and the prompt as the first instruction.",
      "Skip any offer to add entities or auth for this page.",
      "Refine section by section once the full page exists.",
    ],
    preamble:
      "This is a public marketing page, not an application screen: no entities, no authentication, no database and no user state. Build the whole page as described below, using the literal colours and the section order given, and do not add navigation to screens that do not exist.",
    gotcha:
      "Accept one offer of a data model and every later change starts routing through it.",
  },
  {
    path: "/firebase-studio-prompts",
    name: "Firebase Studio",
    title: "Landing Page Prompts for Firebase Studio",
    description:
      "Landing page prompts for Firebase Studio's prototyping workspace, kept to one file and ready to host, with a reference build of each.",
    kind: "Cloud workspace",
    lede: "Prompts that produce something you can host from the same workspace you built it in.",
    how:
      "Firebase Studio gives you a cloud workspace with an agent in it and hosting a step away, which makes it a good place to put a page in front of someone quickly. The briefs here stay static so that last step is a deploy rather than a migration.",
    steps: [
      "Create a workspace from an empty or static template.",
      "Paste the preamble and the prompt into the agent.",
      "Preview in the workspace, then deploy to hosting when it looks right.",
      "Keep the page static — the moment it needs a function it stops being a one-shot.",
    ],
    preamble:
      "Build this as a single static HTML file with the CSS and JavaScript inlined, suitable for static hosting with no server-side code, no environment variables and no SDK initialisation. Do not wire up any Firebase product for this page.",
    gotcha:
      "A static page in a Firebase workspace will still get an SDK bootstrapped into it unless you say not to.",
  },
];

export const buildersByKind = (): { kind: BuilderKind; items: Builder[] }[] => {
  const order: BuilderKind[] = [
    "App generator",
    "UI generator",
    "IDE agent",
    "Terminal agent",
    "Cloud workspace",
  ];
  return order
    .map((kind) => ({ kind, items: builders.filter((b) => b.kind === kind) }))
    .filter((g) => g.items.length > 0);
};
