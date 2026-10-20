import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, type Location } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, ExternalLink, MessageSquare, X } from "lucide-react";
import PromptThumb from "@/components/PromptThumb";
import PromptStage from "@/components/PromptStage";
import TemplateFeedback from "@/components/TemplateFeedback";
import HireLine from "@/components/HireLine";
import { useCopyCode } from "@/lib/useCopyCode";
import { getPromptBySlug, shuffle, visiblePrompts, type PromptEntry } from "@/data/prompts";
import { getSystemForTemplate } from "@/data/systems";
import { motionsForPage } from "@/data/motion";

/**
 * The detail view as a dialog over the grid.
 *
 * App renders this only when a navigation carried `backgroundLocation`, i.e.
 * the visit came from inside the app. A direct hit on /prompt/:slug — a shared
 * link, a new tab, a crawler — still renders the full page, so every prompt
 * keeps a real URL that stands on its own.
 */
const PromptModal = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const background = (location.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
  const entry = getPromptBySlug(slug);
  const system = slug ? getSystemForTemplate(slug) : undefined;
  const motions = slug ? motionsForPage(slug) : [];
  const entryCategory = entry?.category;

  /* FEEDBACK swaps the MORE ONE-SHOTS list for a feedback form about this template. */
  const [panel, setPanel] = useState<"more" | "feedback">("more");

  /* What to show instead of the prompt text: a handful of other one-shots,
     same category first so the suggestion is relevant, each group shuffled so
     the same eight are not always the eight. Memoised on the slug: it holds
     still while you read this one and redraws when you move on. The prompt
     itself lives in full on the page and in the endpoints. */
  const more = useMemo(() => {
    const others = visiblePrompts.filter((p) => p.slug !== slug);
    const sameCat = shuffle(others.filter((p) => p.category === entryCategory));
    const rest = shuffle(others.filter((p) => p.category !== entryCategory));
    return [...sameCat, ...rest].slice(0, 8);
  }, [slug, entryCategory]);

  // A hidden entry is not in this list, so it simply has no neighbours.
  const index = visiblePrompts.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? visiblePrompts[index - 1] : null;
  const next = index >= 0 && index < visiblePrompts.length - 1 ? visiblePrompts[index + 1] : null;

  const close = () => {
    // Undo the single push that opened it; prev/next replace rather than push,
    // so one step always lands back on the grid however far you browsed.
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(background?.pathname ?? "/", { replace: true });
  };

  const go = (to: string) =>
    navigate(`/prompt/${to}`, { state: { backgroundLocation: background }, replace: true });

  useEffect(() => setPanel("more"), [slug]);

  /* The same copy action and preview stage as the standalone page. */
  const { copy, copied, label: copyLabel, text: copyCaption, source } = useCopyCode(entry);

  /* Arrow keys walk the library without closing. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea")) return;
      if (event.key === "ArrowLeft" && prev) go(prev.slug);
      if (event.key === "ArrowRight" && next) go(next.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!entry) return null;


  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pmodal-overlay" />
        <Dialog.Content className="pmodal-dialog" aria-describedby="pmodal-desc">
          <header className="pmodal-head">
            <div className="pmodal-headings">
              <p className="pmodal-kicker">
                {entry.categoryLabel} · ADDED {entry.added.toUpperCase()}
                {entry.theme && (
                  <span className={`pmodal-theme pmodal-theme--${entry.theme}`}>
                    <span className="pmodal-theme-dot" aria-hidden="true" />
                    {entry.theme === "dark" ? "DARK" : "LIGHT"}
                  </span>
                )}
              </p>
              <Dialog.Title className="pmodal-title">{entry.title}</Dialog.Title>
              <Dialog.Description className="pmodal-desc" id="pmodal-desc">
                {entry.description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="pmodal-main">
            <PromptStage entry={entry} source={source} />

            <section className="pmodal-side" aria-label="Prompt">
              <div className="pmodal-actions">
                {entry.youtube ? (
                  <a
                    className="pmodal-btn pmodal-btn--solid"
                    href={`https://www.youtube.com/watch?v=${entry.youtube}`}
                    target="_blank"
                    rel="noreferrer"
                    title="Watch on YouTube"
                  >
                    <span className="pmodal-label">WATCH ON YOUTUBE</span> <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : (
                  <button className="pmodal-btn pmodal-btn--solid" onClick={copy} aria-live="polite" title={copyLabel}>
                    {copied === "done" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                    <span className="pmodal-label">{copyCaption}</span>
                  </button>
                )}
                {entry.demo && (
                  <a className="pmodal-btn" href={entry.demo} target="_blank" rel="noreferrer" title="Open in a new tab">
                    <span className="pmodal-label">NEW TAB</span> <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
                {!entry.demo && entry.repoUrl && (
                  <a className="pmodal-btn" href={entry.repoUrl} target="_blank" rel="noreferrer" title="View code">
                    <span className="pmodal-label">VIEW CODE</span> <ExternalLink size={12} aria-hidden="true" />
                  </a>
                )}
                {system && (
                  <Link className="pmodal-btn" to={`/systems/${system.slug}`} title={`The ${system.name} design system this template is built on`}>
                    <span className="pmodal-label">VIEW DESIGN SYSTEM</span> <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                )}
                {motions.map((m) => (
                  <Link key={m.slug} className="pmodal-btn" to={`/motion/${m.slug}`} title={`${m.title}: a motion study that pairs with this page`}>
                    <span className="pmodal-label">MOTION · {m.title.toUpperCase()}</span> <ArrowUpRight size={12} aria-hidden="true" />
                  </Link>
                ))}
                <button
                  className="pmodal-btn"
                  aria-pressed={panel === "feedback"}
                  aria-controls="pmodal-body"
                  onClick={() => setPanel((p) => (p === "feedback" ? "more" : "feedback"))}
                  title="Send feedback on this template"
                >
                  <MessageSquare size={12} aria-hidden="true" />
                  <span className="pmodal-label">FEEDBACK</span>
                </button>
                {!entry.youtube && <HireLine slug={entry.slug} from="modal" className="hire-line--modal" />}
              </div>

              <div className="pmodal-body" id="pmodal-body">
                {panel === "feedback" ? (
                  <>
                    <div className="pmodal-body-head">
                      <span>FEEDBACK</span>
                      <button type="button" className="pmodal-body-back" onClick={() => setPanel("more")}>
                        <ArrowLeft size={10} aria-hidden="true" /> MORE ONE-SHOTS
                      </button>
                    </div>
                    <TemplateFeedback key={entry.slug} entry={entry} onDone={() => setPanel("more")} />
                  </>
                ) : (
                  <>
                    <div className="pmodal-body-head">
                      <span>MORE ONE-SHOTS</span>
                      <span>{more.length} OF {visiblePrompts.length}</span>
                    </div>
                    <ul className="pmodal-more">
                      {more.map((item: PromptEntry) => (
                        <li key={item.slug}>
                          <button className="pmodal-more-row" onClick={() => go(item.slug)}>
                            <span className="pmodal-more-thumb">
                              {item.thumbnail ? (
                                <img src={item.thumbnail} alt="" loading="lazy" decoding="async" />
                              ) : (
                                <PromptThumb entry={item} />
                              )}
                            </span>
                            <span className="pmodal-more-text">
                              <span className="pmodal-more-title">{item.title}</span>
                              <span className="pmodal-more-cat">{item.categoryLabel}</span>
                            </span>
                            <ArrowRight size={12} className="pmodal-more-go" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </section>
          </div>

          <footer className="pmodal-pager">
            {prev ? (
              <button className="pmodal-pager-btn" onClick={() => go(prev.slug)}>
                <ArrowLeft size={12} />
                <span>{prev.title}</span>
              </button>
            ) : (
              <span />
            )}
            <span className="pmodal-hint">← → browse · ESC close</span>
            {next ? (
              <button className="pmodal-pager-btn pmodal-pager-btn--next" onClick={() => go(next.slug)}>
                <span>{next.title}</span>
                <ArrowRight size={12} />
              </button>
            ) : (
              <span />
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PromptModal;
