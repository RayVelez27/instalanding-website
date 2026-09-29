import { useState } from "react";
import { Copy, Check, ArrowRight, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { feedPrompts, promptsInCategory, type PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import { copyText } from "@/lib/copyText";

/* ── Tile ── */

interface TileProps extends PromptEntry {
  onCopy: (entry: PromptEntry) => void;
  copied: boolean;
}

const GridTile = (entry: TileProps) => {
  const [touchActive, setTouchActive] = useState(false);
  const { onCopy, copied } = entry;
  // Handed to the prompt route so it opens over this grid instead of replacing it.
  const location = useLocation();
  const asModal = { backgroundLocation: location };

  return (
    <div
      className={`grid-item grid-item--${entry.variant} ${entry.videoAspect === "portrait" ? "grid-item--portrait" : ""} ${touchActive ? "touch-active" : ""}`}
      onTouchStart={() => setTouchActive(true)}
      onTouchEnd={() => setTimeout(() => setTouchActive(false), 600)}
    >
      <div className="shim shim--css" data-variant={entry.variant} />
      <div className="inner inner--prompt">
        <PromptThumb entry={entry} />
        <div className="overview overview--prompt">
          {/* Covers the whole tile so the card reads as one link; the buttons below sit on top of it */}
          <Link
            to={`/prompt/${entry.slug}`}
            state={asModal}
            className="tile-link"
            aria-label={`Open ${entry.title}`}
          />
          <h3 className="title">{entry.title}</h3>
          <p className="prompt-desc">{entry.description}</p>
          <div className="tile-actions">
            <button
              className="copy-prompt-btn"
              onClick={(e) => { e.stopPropagation(); onCopy(entry); }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "COPIED" : "COPY"}
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
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Grid ── */

const PromptGrid = ({ category }: { category?: string }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // promptsInCategory, not a filter over the interleaved list: filtering an
  // alternating run closes the gaps and the themes clump again.
  const items = category ? promptsInCategory(category) : feedPrompts;

  const handleCopy = async (entry: PromptEntry) => {
    await copyText(entry.prompt);
    setCopiedSlug(entry.slug);
    setTimeout(() => setCopiedSlug((s) => (s === entry.slug ? null : s)), 2000);
  };

  return (
    <div className="media-grid">
      <div className="grid-container">
        {items.map((p) => (
          <GridTile key={p.slug} {...p} onCopy={handleCopy} copied={copiedSlug === p.slug} />
        ))}
      </div>
    </div>
  );
};

export default PromptGrid;
