import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, ExternalLink, MoreHorizontal, Play, X } from "lucide-react";
import PromptThumb from "@/components/PromptThumb";
import TemplateFeedback from "@/components/TemplateFeedback";
import DemoCode from "@/components/DemoCode";
import { copyText } from "@/lib/copyText";
import { SITE_URL } from "@/lib/agentMode";
import { mobileThumbFor } from "@/data/mobileThumbs";
import { categoryHref, type PromptEntry } from "@/data/prompts";
import type { SystemEntry } from "@/data/systems";

/**
 * The prompt page on a phone. Built for reading and trying, not for building:
 * a phone-size preview that loads the live demo only when tapped, a one-line
 * meta strip, the prompt folded away, related templates in a sideways row,
 * clear previous / next, and one action bar pinned to the bottom (open the
 * demo, everything else behind ⋯). The desktop page keeps its full toolset.
 */
interface Props {
  entry: PromptEntry;
  prev: PromptEntry | null;
  next: PromptEntry | null;
  related: PromptEntry[];
  system?: SystemEntry;
  file: string;
  code: string | null;
  promptCopied: boolean;
  onCopyPrompt: () => void;
  /** COPY CODE: the demo's whole HTML file, the same action as on desktop */
  onCopyCode: () => void;
  codeCopied: "idle" | "done" | "failed";
  codeFailed: boolean;
}

const PhonePreview = ({ entry }: { entry: PromptEntry }) => {
  const [live, setLive] = useState(false);
  useEffect(() => setLive(false), [entry.slug]);
  const poster = entry.thumbnail ? mobileThumbFor(entry.thumbnail) ?? entry.thumbnail : undefined;

  if (entry.youtube) {
    const embed = entry.youtubeEmbed !== false;
    return (
      <div className="pdm-preview pdm-preview--video">
        {live && embed ? (
          <iframe
            className="pdm-video"
            src={`https://www.youtube-nocookie.com/embed/${entry.youtube}?autoplay=1&playsinline=1`}
            title={entry.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            className="pdm-poster"
            onClick={() => (embed ? setLive(true) : window.open(`https://www.youtube.com/watch?v=${entry.youtube}`, "_blank"))}
            aria-label={`Play ${entry.title}`}
          >
            {entry.thumbnail && <img src={entry.thumbnail} alt="" />}
            <span className="pdm-play" aria-hidden="true"><Play size={20} fill="currentColor" /></span>
          </button>
        )}
      </div>
    );
  }

  if (!entry.demo) {
    return (
      <div className="pdm-preview pdm-preview--static">
        <PromptThumb entry={entry} eager />
      </div>
    );
  }

  return (
    <div className={`pdm-preview ${live ? "pdm-preview--live" : ""}`}>
      {live ? (
        <>
          <iframe className="pdm-frame" src={entry.demo} title={`${entry.title} live demo`} />
          <p className="pdm-live-bar">
            <span><i aria-hidden="true" /> LIVE</span>
            <a href={entry.demo} target="_blank" rel="noreferrer">FULL SCREEN <ExternalLink size={11} aria-hidden="true" /></a>
          </p>
        </>
      ) : (
        <button className="pdm-poster" onClick={() => setLive(true)} aria-label={`Try ${entry.title} live`}>
          {poster && <img src={poster} alt="" />}
          <span className="pdm-try">TAP TO TRY IT LIVE</span>
        </button>
      )}
    </div>
  );
};

const PromptDetailPhone = ({ entry, prev, next, related, system, file, code, promptCopied, onCopyPrompt, onCopyCode, codeCopied, codeFailed }: Props) => {
  // The code view is only built once opened: highlighting a 150KB file is not free on a phone
  const [codeOpen, setCodeOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const feedbackRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenu(false);
    setFeedback(false);
  }, [entry.slug]);

  // The ⋯ menu closes on Escape and on a tap outside it
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  useEffect(() => {
    if (feedback) feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [feedback]);

  const copyLink = async () => {
    await copyText(`${SITE_URL}/prompt/${entry.slug}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const primary = entry.youtube
    ? { label: "WATCH ON YOUTUBE", href: `https://www.youtube.com/watch?v=${entry.youtube}` }
    : entry.demo
      ? { label: "OPEN LIVE DEMO", href: entry.demo }
      : entry.repoUrl
        ? { label: "VIEW CODE", href: entry.repoUrl }
        : null;

  return (
    <article className="pdm">
      <header className="pdm-head">
        <p className="pdm-kicker">
          <Link to={categoryHref(entry.category)}>{entry.categoryLabel}</Link>
          {entry.theme && <span>{entry.theme}</span>}
          <span>Added {entry.added}</span>
        </p>
        <h1 className="pdm-title">{entry.title}</h1>
        <p className="pdm-desc">{entry.description}</p>
      </header>

      <PhonePreview entry={entry} />


      {entry.demo && (
        <>
          <button className="pdm-btn pdm-btn--solid pdm-btn--wide pdm-copy-code" onClick={onCopyCode} aria-live="polite">
            {codeCopied === "done" ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {codeCopied === "done" ? "COPIED" : codeCopied === "failed" ? "COPY FAILED" : "COPY CODE"}
          </button>
          <details className="pdm-code" onToggle={(e) => setCodeOpen((e.target as HTMLDetailsElement).open)}>
            <summary>
              <span>Show code</span>
            </summary>
            {codeOpen && (
              <div className="pdm-code-body">
                {code ? (
                  <DemoCode code={code} file={file} />
                ) : (
                  <p className="pcode-status">{codeFailed ? "Couldn't load the source. Try OPEN LIVE DEMO." : "Loading source…"}</p>
                )}
              </div>
            )}
          </details>
        </>
      )}


      {entry.credits && entry.credits.length > 0 && (
        <p className="pdm-credits">
          Built on{" "}
          {entry.credits.map((c, i) => (
            <span key={c.href}>
              {i > 0 && ", "}
              <a href={c.href} target="_blank" rel="noreferrer">{c.label}</a>
            </span>
          ))}
        </p>
      )}

      {feedback && (
        <section className="pdm-feedback" ref={feedbackRef} aria-label="Feedback">
          <div className="pdm-section-head">
            <h2>Feedback</h2>
            <button className="pdm-icon" onClick={() => setFeedback(false)} aria-label="Close feedback"><X size={14} /></button>
          </div>
          <TemplateFeedback key={entry.slug} entry={entry} onDone={() => setFeedback(false)} />
        </section>
      )}

      {related.length > 0 && (
        <section className="pdm-related" aria-label={`More in ${entry.categoryLabel}`}>
          <div className="pdm-section-head">
            <h2>More in {entry.categoryLabel}</h2>
          </div>
          <ul className="pdm-related-row">
            {related.map((r) => (
              <li key={r.slug}>
                <Link to={`/prompt/${r.slug}`} className="pdm-card">
                  <span className="pdm-card-thumb"><PromptThumb entry={r} /></span>
                  <span className="pdm-card-title">{r.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!entry.youtube && (
        <details className="pdm-prompt">
          <summary>
            <span>Show the one-shot prompt</span>
            <span className="pdm-prompt-len">{entry.prompt.length.toLocaleString()} chars</span>
          </summary>
          <div className="pdm-prompt-body">
            <pre>{entry.prompt}</pre>
            {entry.demo && (
              <p className="pdm-prompt-ref">
                <b>+ Reference build.</b> COPY PROMPT adds the full source of {file}
                {code && ` (${Math.round(code.length / 1024)} KB)`} under the brief, as the exact expected output.
              </p>
            )}
            <button className="pdm-btn pdm-btn--solid pdm-btn--wide" onClick={onCopyPrompt}>
              {promptCopied ? <Check size={13} aria-hidden="true" /> : null}
              {promptCopied ? "COPIED" : "COPY PROMPT"}
            </button>
          </div>
        </details>
      )}

      {system && (
        <Link className="pdm-system" to={`/systems/${system.slug}`}>
          <span>
            <b>Design system</b> {system.name} · {system.components.length} components
          </span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      )}

      <nav className="pdm-pager" aria-label="Prompt navigation">
        {prev && (
          <Link to={`/prompt/${prev.slug}`} className="pdm-pager-link">
            <span className="pdm-pager-dir"><ArrowLeft size={12} aria-hidden="true" /> Previous</span>
            <span className="pdm-pager-title">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link to={`/prompt/${next.slug}`} className="pdm-pager-link pdm-pager-link--next">
            <span className="pdm-pager-dir">Next <ArrowRight size={12} aria-hidden="true" /></span>
            <span className="pdm-pager-title">{next.title}</span>
          </Link>
        )}
      </nav>

      <div className="pdm-bar" ref={menuRef}>
        {menu && (
          <ul className="pdm-menu" role="menu">
            {!entry.youtube && (
              <li role="none">
                <button role="menuitem" onClick={() => { onCopyPrompt(); setMenu(false); }}>Copy prompt</button>
              </li>
            )}
            <li role="none">
              <button role="menuitem" onClick={() => { copyLink(); setMenu(false); }}>Copy link</button>
            </li>
            {system && (
              <li role="none">
                <Link role="menuitem" to={`/systems/${system.slug}`}>View design system</Link>
              </li>
            )}
            <li role="none">
              <button role="menuitem" onClick={() => { setFeedback(true); setMenu(false); }}>Send feedback</button>
            </li>
          </ul>
        )}
        {primary ? (
          <a className="pdm-btn pdm-btn--solid pdm-btn--grow" href={primary.href} target="_blank" rel="noreferrer">
            {primary.label} <ExternalLink size={13} aria-hidden="true" />
          </a>
        ) : (
          <button className="pdm-btn pdm-btn--solid pdm-btn--grow" onClick={onCopyPrompt}>
            {promptCopied ? "COPIED" : "COPY PROMPT"}
          </button>
        )}
        <button
          className="pdm-btn pdm-btn--more"
          aria-haspopup="menu"
          aria-expanded={menu}
          aria-label="More actions"
          onClick={() => setMenu((m) => !m)}
        >
          {promptCopied || linkCopied ? <Check size={16} aria-hidden="true" /> : <MoreHorizontal size={18} aria-hidden="true" />}
        </button>
        <span className="sr-only" aria-live="polite">{promptCopied ? "Prompt copied" : linkCopied ? "Link copied" : ""}</span>
      </div>
    </article>
  );
};

export default PromptDetailPhone;
