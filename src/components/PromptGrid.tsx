import { useState } from "react";
import { Copy, Check, ArrowRight, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { feedPrompts, promptsInCategory, type PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import ContactModal from "@/components/ContactModal";
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

/* ── The last tile ──
   Not a PromptEntry: it reuses the grid's chrome, but it is a different kind
   of thing and pretending otherwise would put it in the manifest, the sitemap
   and /prompts.json.

   Opt-in, not "whenever there is no category": BuilderPage also renders the
   uncategorised feed, and it has its own closing section underneath. Only the
   home page asks for this.

   Drawn in the shell's own system rather than as artwork: black ink on
   white, a hairline black frame, the hatch from the About portrait, and the
   same flat button the detail page uses. */

/* WORK WITH ME opens the same Contact Ray dialog as the sidebar's mail icon. */
const InviteTile = () => {
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <div className="grid-item grid-item--invite">
      <div className="inner inner--invite">
        <div className="invite-body">
          <p className="invite-kicker">STILL HERE?</p>
          <h3 className="invite-title">Let&rsquo;s make something</h3>
          <p className="invite-copy">
            I&rsquo;m Ray. I design and build everything in this library. If you have
            something that deserves this kind of attention, I&rsquo;d like to hear
            about it.
          </p>
          <button type="button" className="invite-btn" onClick={() => setContactOpen(true)}>
            WORK WITH ME <ArrowRight size={12} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
};

/* ── Grid ── */

const PromptGrid = ({ category, invite }: { category?: string; invite?: boolean }) => {
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
        {invite && !category && <InviteTile />}
      </div>
    </div>
  );
};

export default PromptGrid;
