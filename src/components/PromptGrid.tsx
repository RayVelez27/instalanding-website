import { Fragment, useMemo, useState } from "react";
import { Copy, Check, ArrowRight, ArrowUp, ExternalLink, Play } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { feedPrompts, promptsInCategory, type PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import { copyText, copyTextLater } from "@/lib/copyText";
import { loadDemoSource } from "@/lib/demoSource";
import { agentCommand, agentHandoff, useAgentMode } from "@/lib/agentMode";
import { useIsPhone } from "@/hooks/useIsPhone";
import FilterRow from "@/components/FilterRow";
import { feedTags, tagsOf } from "@/lib/feedTags";

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
  // Phones skip the dialog and go to the full page, which is built for them.
  const location = useLocation();
  const phone = useIsPhone();
  const asModal = phone ? undefined : { backgroundLocation: location };

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
        {/* Phones: the picture itself opens the template (no hover overlay to reveal first) */}
        <Link to={`/prompt/${entry.slug}`} state={asModal} className="tile-tap" aria-label={`Open ${entry.title}`} />
        {entry.youtube && (
          <span className="tile-play" aria-hidden="true">
            <span className="tile-play-shade" />
            <span className="tile-play-disc">
              {/* Play glyph after Uiverse.io by jubayer-10 */}
              <svg viewBox="0 0 24 24">
                <path d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z" />
              </svg>
            </span>
          </span>
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
      <TileCaption entry={entry} asModal={asModal} />
    </div>
  );
};

/* ── Phone caption: title, tags and the one action that makes sense on a phone ── */

const TileCaption = ({ entry, asModal }: { entry: PromptEntry; asModal?: object }) => {
  const tags = (entry.style ?? []).filter((t) => t !== "dark" && t !== "light").slice(0, 2);
  return (
    <div className="tile-caption">
      <Link to={`/prompt/${entry.slug}`} state={asModal} className="tile-caption-title">
        {entry.title}
      </Link>
      <p className="tile-caption-tags">
        {entry.youtube ? "VIDEO" : [entry.theme, ...tags].filter(Boolean).join(" · ")}
      </p>
      <div className="tile-caption-actions">
        {entry.youtube ? (
          <a className="tile-caption-btn tile-caption-btn--solid" href={`https://www.youtube.com/watch?v=${entry.youtube}`} target="_blank" rel="noreferrer">
            WATCH <Play size={11} fill="currentColor" aria-hidden="true" />
          </a>
        ) : (entry.demo || entry.repoUrl) ? (
          <a className="tile-caption-btn tile-caption-btn--solid" href={entry.demo ?? entry.repoUrl} target="_blank" rel="noreferrer">
            {entry.demo ? "DEMO" : "CODE"} <ExternalLink size={11} aria-hidden="true" />
          </a>
        ) : (
          <Link className="tile-caption-btn tile-caption-btn--solid" to={`/prompt/${entry.slug}`} state={asModal}>
            VIEW <ArrowRight size={11} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
};

/* ── Phones: after the first rows, point at the new SYSTEMS section ── */

const SystemsBanner = () => (
  <Link to="/systems" className="feed-banner">
    <span className="feed-banner-badge">NEW</span>
    <span className="feed-banner-text">
      <b>Design systems</b>
      <span>Tokens, components and agent instructions from real pages</span>
    </span>
    <ArrowRight size={16} aria-hidden="true" />
  </Link>
);

/* ── Phones: a way back up, after the very last item ── */

const BackToTop = ({ count }: { count: number }) => (
  <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
    <ArrowUp size={14} aria-hidden="true" />
    BACK TO TOP
    <span>{count} {count === 1 ? "template" : "templates"}</span>
  </button>
);

/* ── Grid ── */

const PromptGrid = ({ category }: { category?: string }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const agent = useAgentMode();

  // promptsInCategory, not a filter over the interleaved list: filtering an
  // alternating run closes the gaps and the themes clump again.
  const all = category ? promptsInCategory(category) : feedPrompts;
  const tags = useMemo(() => feedTags(all), [all]);
  const [filter, setFilter] = useState("all");
  // Filtering keeps the feed's order, so the light / dark alternation mostly holds
  const items = useMemo(() => (filter === "all" ? all : all.filter((p) => tagsOf(p).includes(filter))), [all, filter]);

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
      <FilterRow tags={tags} total={all.length} active={filter} onPick={setFilter} />
      <div className="grid-container">
        {items.map((p, i) => (
          <Fragment key={p.slug}>
            {i === 4 && !category && filter === "all" && <SystemsBanner />}
            <GridTile {...p} onCopy={handleCopy} copied={copiedSlug === p.slug} agent={agent} />
          </Fragment>
        ))}
      </div>
      <BackToTop count={items.length} />
    </div>
  );
};

export default PromptGrid;
