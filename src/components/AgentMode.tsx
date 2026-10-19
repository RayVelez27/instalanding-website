import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Check, Copy } from "lucide-react";
import { copyText } from "@/lib/copyText";
import { MCP_CLIENTS, MCP_URL, SITE_URL, setAgentMode, useAgentMode } from "@/lib/agentMode";

/**
 * AGENT MODE switch, top right of the library beside GITHUB. The neo switch
 * look is after Uiverse.io by chicogale, driven by a class instead of a hidden
 * checkbox so it stays one real button with role="switch".
 */
export const AgentModeToggle = () => {
  const on = useAgentMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`agent-toggle${on ? " agent-toggle--on" : ""}`}
      onClick={() => setAgentMode(!on)}
      title={on ? "Back to the library for people" : "Show the library the way your agent uses it"}
    >
      <span className="agent-toggle-label">
        <span className="agent-toggle-name">
          <Bot size={12} aria-hidden="true" />
          AGENT MODE
        </span>
        <span className="agent-toggle-status" aria-hidden="true">
          <span className="agent-toggle-dot" />
          {on ? "ACTIVE" : "STANDBY"}
        </span>
      </span>
      <span className="neo-track" aria-hidden="true">
        <span className="neo-grid" />
        <span className="neo-spectrum">
          <span /><span /><span /><span /><span />
        </span>
        <span className="neo-highlight" />
        <span className="neo-thumb">
          <span className="neo-thumb-ring" />
          <span className="neo-thumb-core">
            <span className="neo-thumb-wave" />
            <span className="neo-thumb-pulse" />
          </span>
        </span>
      </span>
    </button>
  );
};

/** A command or config with a copy button beside it. */
const CopyRow = ({ code, label }: { code: string; label: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="agent-route-row">
      <pre>{code}</pre>
      <button type="button" className="agent-route-copy" onClick={handleCopy} aria-label={`Copy ${label}`}>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    </div>
  );
};

/* Every route here works today: the MCP server is hosted on the site itself,
   so none of it waits on the npm package. */
const SIDE_ROUTES: { label: string; note: string; code: string }[] = [
  {
    label: "TELL YOUR AGENT",
    note: "Any agent with a fetch",
    code: `Read ${SITE_URL}/SKILL.md and follow its loop to build my landing page.`,
  },
  {
    label: "HTTP",
    note: "Every template, one manifest",
    code: `curl -s ${SITE_URL}/prompts.json`,
  },
];

/** The connect strip shown above the grid while Agent Mode is on. */
export const AgentPanel = () => {
  const on = useAgentMode();
  const [client, setClient] = useState(0);
  if (!on) return null;
  const current = MCP_CLIENTS[client];

  return (
    <section className="agent-panel" aria-label="Connect your agent">
      <div className="agent-panel-head">
        <p className="agent-panel-title">CONNECT YOUR AGENT</p>
        <p className="agent-panel-sub">
          One URL. Nothing to install, no key, no login. Every tile now copies a task your agent can run.
        </p>
      </div>

      <div className="agent-routes">
        <div className="agent-route agent-route--mcp">
          <p className="agent-route-label">
            ADD THE MCP SERVER <span>{MCP_URL.replace("https://", "")}</span>
          </p>
          <div className="agent-clients" role="tablist" aria-label="Your agent">
            {MCP_CLIENTS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="tab"
                id={`agent-client-${i}`}
                aria-selected={client === i}
                aria-controls="agent-client-panel"
                className={client === i ? "agent-client agent-client--on" : "agent-client"}
                onClick={() => setClient(i)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div id="agent-client-panel" role="tabpanel" aria-labelledby={`agent-client-${client}`}>
            <p className="agent-route-where">{current.where}</p>
            <CopyRow code={current.block} label={`${current.name} MCP config`} />
          </div>
          <p className="agent-route-tools">
            Tools: search_prompts · inspect_prompt · get_prompt · get_demo_source · list_categories ·
            search_systems · get_system · get_motion
          </p>
        </div>

        <div className="agent-route-stack">
          {SIDE_ROUTES.map((r) => (
            <div key={r.label} className="agent-route">
              <p className="agent-route-label">
                {r.label} <span>{r.note}</span>
              </p>
              <CopyRow code={r.code} label={`${r.label.toLowerCase()} command`} />
            </div>
          ))}
        </div>
      </div>

      <Link to="/agents" className="agent-panel-more">
        ALL CLIENTS & AGENT DOCS <ArrowRight size={12} />
      </Link>
    </section>
  );
};
