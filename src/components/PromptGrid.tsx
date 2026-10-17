import { useState } from "react";
import { Copy, Check, ArrowRight, ExternalLink, Play } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { feedPrompts, promptsInCategory, type PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import { copyText, copyTextLater } from "@/lib/copyText";
import { loadDemoSource } from "@/lib/demoSource";
import { agentCommand, agentHandoff, useAgentMode } from "@/lib/agentMode";

/* ── Tile ── */

interface TileProps extends PromptEntry {
  onCopy: (entry: PromptEntry) => void;
  copied: boolean;
  /** Agent Mode: the copy button hands over a task for the user's agent instead of the raw brief. */
  agent: boolean;
}

const GridTile = (entry: TileProps) => {
  const [touchActive, setTouchActive] = useState(false);
  const { onCopy, copied, agent } = entry;
  // Handed to the prompt route so it opens over this grid instead of replacing it.
  const location = useLocation();
  const asModal = { backgroundLocation: location };

  return (
    <div
      className={`grid-item grid-item--${entry.variant} ${entry.videoAspect === "portrait" ? "grid-item--portrait" : ""} ${touchActive ? "touch-active" : ""}`}
      // Start fetching the demo on hover, so COPY CODE has the file by the time it is clicked.
      onPointerEnter={() => {
        if (entry.demo && !agent) loadDemoSource(entry.demo).catch(() => {});
      }}
      onTouchStart={() => setTouchActive(true)}
      onTouchEnd={() => setTimeout(() => setTouchActive(false), 600)}
    >
      <div className="shim shim--css" data-variant={entry.variant} />
      <div className="inner inner--prompt">
        <PromptThumb entry={entry} />
        {entry.youtube && (
          <span className="tile-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
        )}
        <div className="overview overview--prompt">
          {/* Covers the whole tile so the card reads as one link; the buttons below sit on top of it */}
          <Link
            to={`/prompt/${entry.slug}`}
            state={asModal}
            className="tile-link"
            aria-label={`Open ${entry.title}`}
          />
          <h3 className="title">{entry.title}</h3>
          {agent && !entry.youtube ? (
            <code className="tile-agent-cmd">{agentCommand(entry.slug)}</code>
          ) : (
            <p className="prompt-desc">{entry.description}</p>
          )}
          <div className="tile-actions">
            {entry.youtube ? (
              <>
                <Link to={`/prompt/${entry.slug}`} state={asModal} className="view-prompt-btn">
                  WATCH <Play size={11} fill="currentColor" />
                </Link>
                <a
                  className="view-prompt-btn"
                  href={`https://www.youtube.com/watch?v=${entry.youtube}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  YOUTUBE <ExternalLink size={12} />
                </a>
              </>
            ) : (
              <>
                <button
                  className="copy-prompt-btn"
                  onClick={(e) => { e.stopPropagation(); onCopy(entry); }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "COPIED" : agent ? "COPY FOR AGENT" : entry.demo ? "COPY CODE" : "COPY PROMPT"}
                </button>
                <Link to={`/prompt/${entry.slug}`} state={asModal} className="view-prompt-btn">
                  VIEW <ArrowRight size={12} />
                </Link>
                {(entry.demo || entry.repoUrl) && (
                  <a
                    className="view-prompt-btn"
                    href={entry.demo ?? entry.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {entry.demo ? "DEMO" : "CODE"} <ExternalLink size={12} />
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Grid ── */

const PromptGrid = ({ category }: { category?: string }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const agent = useAgentMode();

  // promptsInCategory, not a filter over the interleaved list: filtering an
  // alternating run closes the gaps and the themes clump again.
  const items = category ? promptsInCategory(category) : feedPrompts;

  /* COPY puts the demo's whole HTML file on the clipboard, like the detail
     view's COPY CODE. An entry with no single-file demo (code in its own repo)
     has no HTML to copy, so it copies the prompt. Agent Mode copies a task. */
  const handleCopy = async (entry: PromptEntry) => {
    try {
      if (agent) await copyText(agentHandoff(entry));
      else if (entry.demo) await copyTextLater(loadDemoSource(entry.demo));
      else await copyText(entry.prompt);
    } catch {
      return;
    }
    setCopiedSlug(entry.slug);
    setTimeout(() => setCopiedSlug((s) => (s === entry.slug ? null : s)), 2000);
  };

  return (
    <div className="media-grid">
      <div className="grid-container">
        {items.map((p) => (
          <GridTile key={p.slug} {...p} onCopy={handleCopy} copied={copiedSlug === p.slug} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default PromptGrid;
