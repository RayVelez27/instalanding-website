import { useState } from "react";
import { Check, Copy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { copyText } from "@/lib/copyText";
import { useDemoSource } from "@/lib/demoSource";
import { useSeo } from "@/hooks/useSeo";

/**
 * The manifesto for agents: why the library is built for them, the loop to
 * follow, and the four ways in. Every command on this page is real and every
 * file it names is served — the page is documentation an agent can act on,
 * so it must never describe something that does not exist yet.
 *
 * The CLI and MCP server ship as one npm package, `instalanding`. Until it is
 * published, the npx lines would fail, so they carry a note and the HTTP and
 * SKILL.md routes (which work today) lead. Flip this when the package is live.
 */
const NPM_PUBLISHED = false;

/** Demo whose header comment is shown as the "every file is a map" exhibit. */
const EXHIBIT_DEMO = "/demos/fire-button.html";

const TENETS: { title: string; body: string }[] = [
  {
    title: "Agents are the primary reader.",
    body: "People supervise; agents fetch, compare and build. So everything is a flat file at a stable URL: no account, no JavaScript, no scraping, CORS open.",
  },
  {
    title: "Taste is the missing part.",
    body: "Your agent can already write the JSX. What it lacks is the design prior — what to build, how it should feel, and what breaks. Every entry is that prior, written down.",
  },
  {
    title: "Briefs over code.",
    body: "A brief survives any stack; code survives one. Build from the brief in the user's framework, and open the reference build when you want to see it done.",
  },
  {
    title: "Design as numbers.",
    body: "Hex values, radii, easing curves, type scale, breakpoints. Adjectives are where generic pages come from; numbers are how a page keeps its character when it is rebuilt.",
  },
  {
    title: "Every file is a map.",
    body: "Each reference build opens with a header comment — where the tokens live, the sections in order, what each script does, what breaks when you change it — and marks its regions with data-section.",
  },
  {
    title: "One protocol, every agent.",
    body: "A CLI, an MCP server, plain HTTP and a SKILL.md, all reading the same files. No per-agent integrations to rot. If your agent has a shell or a fetch, it is supported.",
  },
  {
    title: "Fictional by default.",
    body: "Every brand, number, logo and testimonial in the library is invented. Replace them with the user's before anything ships.",
  },
  {
    title: "Free and open.",
    body: "MIT. Use it, change it, ship it, commercially too. Where an entry is built on someone else's work, keep the credit.",
  },
];

const LOOP: { verb: string; text: string }[] = [
  { verb: "search", text: "by what the page is for and how it should look — \"dark technical ai\", \"light editorial pricing\"." },
  { verb: "inspect", text: "two or three candidates: stack, sections in order, best-for, style, sizes. A few hundred tokens each." },
  { verb: "get", text: "the brief and build from it in the user's stack. This is the default path." },
  { verb: "add", text: "the reference build instead when the user wants that exact page, fast. One HTML file, opens from disk." },
  { verb: "adapt", text: "replace the fictional brand, copy and numbers; keep the brief's design values and its warnings." },
  { verb: "verify", text: "in a real browser: no console errors, no horizontal scroll at 390px, reduced motion respected." },
];

const CLI_BLOCK = `npx -y instalanding search "dark technical ai"
npx -y instalanding inspect monax-analytics-landing-page
npx -y instalanding get monax-analytics-landing-page > brief.txt
npx -y instalanding add monax-analytics-landing-page ./public`;

const HTTP_BLOCK = `# the manifest: slugs, best-for, style, sections, stack, sizes, URLs
curl -s https://instalanding.ai/prompts.json

# one brief, raw — nothing else in the response, so it pastes verbatim
curl -s https://instalanding.ai/p/monax-analytics-landing-page.txt

# the same brief with its metadata
curl -s https://instalanding.ai/p/monax-analytics-landing-page.json`;

const MCP_CLIENTS: { name: string; where: string; block: string }[] = [
  {
    name: "Claude Code",
    where: "terminal",
    block: "claude mcp add instalanding -- npx -y instalanding mcp",
  },
  {
    name: "Codex",
    where: "~/.codex/config.toml",
    block: `[mcp_servers.instalanding]
command = "npx"
args = ["-y", "instalanding", "mcp"]`,
  },
  {
    name: "Cursor",
    where: ".cursor/mcp.json",
    block: `{
  "mcpServers": {
    "instalanding": { "command": "npx", "args": ["-y", "instalanding", "mcp"] }
  }
}`,
  },
  {
    name: "OpenCode",
    where: "opencode.json",
    block: `{
  "mcp": {
    "instalanding": { "type": "local", "command": ["npx", "-y", "instalanding", "mcp"] }
  }
}`,
  },
];

const SKILL_BLOCK = `# Claude Code and other SKILL.md-aware agents
npx -y instalanding skill --install          # → .claude/skills/instalanding/SKILL.md

# or without npm
mkdir -p .claude/skills/instalanding
curl -s https://instalanding.ai/SKILL.md -o .claude/skills/instalanding/SKILL.md

# Codex, OpenCode, Cursor and anything that reads AGENTS.md — add one line:
echo "For landing pages and UI components, follow https://instalanding.ai/SKILL.md" >> AGENTS.md`;

const HANDOFF_BLOCK = `Build a landing page for <your product>. Use INSTALANDING.AI for the design:
read https://instalanding.ai/SKILL.md and follow its loop. Search the library for
<what it is for> with a <dark/light, editorial/technical…> look, inspect the best
two or three, and build from the brief of the one that fits — in this project's
stack, with my brand, copy and numbers instead of the fictional ones.`;

/** A copyable block, styled like the builder preambles. */
const Block = ({ label, code }: { label: string; code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="builder-preamble agents-block">
      <pre>
        <code>{code}</code>
      </pre>
      <button type="button" className="builder-copy" onClick={handleCopy} aria-label={`Copy ${label}`}>
        {copied ? <Check size={13} /> : <Copy size={13} />}
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
};

/** The live header comment of one reference build, so the exhibit can't drift from the file. */
const Exhibit = () => {
  const state = useDemoSource(EXHIBIT_DEMO, true);
  if (state.status !== "ready") return null;
  const header = state.code.match(/<!--[\s\S]*?-->/)?.[0];
  if (!header || !header.includes("INSTALANDING.AI")) return null;
  return (
    <div className="builder-preamble agents-block agents-exhibit">
      <pre>
        <code>{header}</code>
      </pre>
    </div>
  );
};

const Agents = () => {
  useSeo({
    title: "For Agents — Give Your Agent Better Taste",
    description:
      "INSTALANDING.AI is a library of landing pages and UI components written for coding agents: a CLI, an MCP server, plain HTTP and a SKILL.md, all reading the same one-shot briefs and single-file reference builds.",
    canonical: "/agents",
  });
  const [client, setClient] = useState(0);

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <article className="builder agents">
          <header className="builder-head agents-head">
            <h1 className="builder-title">Give your agent better taste.</h1>
            <p className="builder-lede">
              A library of landing pages and UI components written for coding agents first and
              the people supervising them second.
            </p>
          </header>

          <section className="builder-section" aria-labelledby="agents-manifesto">
            <h2 id="agents-manifesto">The manifesto</h2>
            <ol className="agents-tenets">
              {TENETS.map((t) => (
                <li key={t.title}>
                  <strong>{t.title}</strong> {t.body}
                </li>
              ))}
            </ol>
          </section>

          <section className="builder-section" aria-labelledby="agents-loop">
            <h2 id="agents-loop">The loop</h2>
            <p>Whichever way your agent connects, it does the same six things.</p>
            <ol className="agents-loop">
              {LOOP.map((step) => (
                <li key={step.verb}>
                  <code>{step.verb}</code>
                  <span>{step.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="builder-section" aria-labelledby="agents-handoff">
            <h2 id="agents-handoff">Hand it to your agent</h2>
            <p>
              Nothing to install. Paste this into Claude Code, Codex, Cursor, OpenCode or any agent
              that can fetch a URL, and fill in the brackets.
            </p>
            <Block label="agent instruction" code={HANDOFF_BLOCK} />
          </section>

          <section className="builder-section" aria-labelledby="agents-ways">
            <h2 id="agents-ways">Four ways in, one library</h2>
            {!NPM_PUBLISHED && (
              <p className="builder-gotcha">
                <strong>The npm package lands with launch.</strong> Until then the CLI and MCP lines
                below will not resolve; HTTP and SKILL.md work today and cover everything the CLI does.
              </p>
            )}

            <h3 className="agents-h3">HTTP — works with anything that can fetch</h3>
            <Block label="HTTP commands" code={HTTP_BLOCK} />

            <h3 className="agents-h3">SKILL.md — teach the loop once</h3>
            <Block label="skill install" code={SKILL_BLOCK} />

            <h3 className="agents-h3">CLI — for agents with a shell</h3>
            <p>
              Results on stdout, everything else on stderr, <code>--json</code> on every command,
              exit codes 0 / 1 / 2. <code>get</code> prints the brief and nothing else, so it pipes.
            </p>
            <Block label="CLI commands" code={CLI_BLOCK} />

            <h3 className="agents-h3">MCP — for tool-aware clients</h3>
            <p>
              Tools: <code>search_prompts</code>, <code>inspect_prompt</code>, <code>get_prompt</code>,{" "}
              <code>get_demo_source</code>, <code>list_categories</code>. Every prompt is also a
              resource at <code>instalanding://prompt/&lt;slug&gt;</code>.
            </p>
            <div className="agents-tabs" role="tablist" aria-label="MCP client">
              {MCP_CLIENTS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  role="tab"
                  id={`mcp-tab-${i}`}
                  aria-selected={client === i}
                  aria-controls="mcp-panel"
                  className={client === i ? "agents-tab agents-tab--on" : "agents-tab"}
                  onClick={() => setClient(i)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div id="mcp-panel" role="tabpanel" aria-labelledby={`mcp-tab-${client}`}>
              <p className="agents-where">{MCP_CLIENTS[client].where}</p>
              <Block label={`${MCP_CLIENTS[client].name} MCP config`} code={MCP_CLIENTS[client].block} />
            </div>
          </section>

          <section className="builder-section" aria-labelledby="agents-file">
            <h2 id="agents-file">Every file is a map</h2>
            <p>
              Each reference build is one HTML file that opens from disk. It starts with a header
              comment written for the agent about to edit it — this is the real one from the fire
              button:
            </p>
            <Exhibit />
            <p>
              Every top-level region carries <code>data-section</code> (<code>nav</code>,{" "}
              <code>hero</code>, <code>features</code>, <code>pricing</code>, <code>footer</code>…),
              and widgets worth lifting on their own carry <code>data-component</code>. The same
              section list is published in the manifest, so an agent knows a page's structure before
              it downloads a byte of it.
            </p>
          </section>

          <section className="builder-section" aria-labelledby="agents-endpoints">
            <h2 id="agents-endpoints">Endpoints</h2>
            <dl className="agents-endpoints">
              <div><dt><a href="/SKILL.md">/SKILL.md</a></dt><dd>How to use the library, step by step. Start here.</dd></div>
              <div><dt><a href="/prompts.json">/prompts.json</a></dt><dd>The manifest: every entry's metadata, stack, sections and URLs.</dd></div>
              <div><dt>/p/&lt;slug&gt;.txt</dt><dd>One brief, raw, ready to paste.</dd></div>
              <div><dt>/p/&lt;slug&gt;.json</dt><dd>The brief plus its metadata.</dd></div>
              <div><dt><a href="/llms.txt">/llms.txt</a></dt><dd>A short index, per the llms.txt convention.</dd></div>
              <div><dt>/demos/&lt;file&gt;.html</dt><dd>The reference builds. Static, CORS-open.</dd></div>
            </dl>
          </section>
        </article>
      </main>
    </div>
  );
};

export default Agents;
