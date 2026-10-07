import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, type Location } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Code2,
  Copy,
  Eye,
  ExternalLink,
  Monitor,
  Smartphone,
  X,
} from "lucide-react";
import PromptThumb from "@/components/PromptThumb";
import DemoCode from "@/components/DemoCode";
import { loadDemoSource, useDemoSource } from "@/lib/demoSource";
import { copyText } from "@/lib/copyText";
import { getPromptBySlug, shuffle, visiblePrompts, type PromptEntry } from "@/data/prompts";

/** Logical widths the preview renders the demo at, before it is scaled to fit. */
const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1440, icon: Monitor },
  mobile: { label: "Mobile", width: 390, icon: Smartphone },
} as const;

type ViewportKey = keyof typeof VIEWPORTS;

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
  const entryCategory = entry?.category;

  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const copyTimer = useRef<number>();
  const [view, setView] = useState<ViewportKey>("desktop");
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const observer = useRef<ResizeObserver>();

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

  useEffect(() => {
    setCopied("idle");
    setView("desktop");
    setMode("preview");
  }, [slug]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /* Loaded whenever there is a demo, not only on the CODE tab: COPY CODE is
     always on screen, and the clipboard write should happen inside the click
     (Safari drops it after an await on the network). The preview iframe has
     already requested the same file, so this is normally a cache hit. */
  const source = useDemoSource(entry?.demo, Boolean(entry?.demo));

  /* The preview is a real page scaled to fit, so the stage has to be measured.
     This is a callback ref rather than an effect on purpose: the dialog mounts
     inside a portal, so a layout effect can run before the node exists — and
     then the observer is never attached and the frame stays at scale 1. */
  const attachStage = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    const measure = () => setStage({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if ("ResizeObserver" in window) {
      observer.current = new ResizeObserver(measure);
      observer.current.observe(node);
    }
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

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

  const code = source.status === "ready" ? source.code : null;

  /* COPY CODE puts the demo's whole HTML file on the clipboard. An entry with
     no single-file demo (code in its own repo) has no HTML to copy, so it
     keeps COPY PROMPT instead. */
  const handleCopy = async () => {
    try {
      if (!entry.demo) await copyText(entry.prompt);
      else await copyText(code ?? (await loadDemoSource(entry.demo)));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied("idle"), 2000);
  };
  const copyLabel = entry.demo ? "COPY CODE" : "COPY PROMPT";

  const logical = VIEWPORTS[view].width;
  // Never scale up: at mobile width the frame sits at 1:1 and is centred.
  const scale = stage.width ? Math.min(1, stage.width / logical) : 1;
  const frameHeight = scale ? stage.height / scale : stage.height;

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
            <section className="pmodal-stage-col" aria-label="Preview">
              <div className="pmodal-toolbar">
                {entry.demo && (
                  <div className="pmodal-views" role="group" aria-label="Show">
                    <button className="pmodal-view" aria-pressed={mode === "preview"} onClick={() => setMode("preview")}>
                      <Eye size={13} />
                      Preview
                    </button>
                    <button className="pmodal-view" aria-pressed={mode === "code"} onClick={() => setMode("code")}>
                      <Code2 size={13} />
                      Code
                    </button>
                  </div>
                )}
                {entry.demo && mode === "code" ? null : entry.demo ? (
                  <div className="pmodal-views" role="group" aria-label="Preview width">
                    {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => {
                      const Icon = VIEWPORTS[key].icon;
                      return (
                        <button
                          key={key}
                          className="pmodal-view"
                          aria-pressed={view === key}
                          onClick={() => setView(key)}
                        >
                          <Icon size={13} />
                          {VIEWPORTS[key].label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="pmodal-note">WIREFRAME PREVIEW</span>
                )}
                {entry.demo && mode === "preview" && (
                  <span className="pmodal-note">{logical}px · scroll inside the frame</span>
                )}
              </div>

              <div
                className={`pmodal-stage pmodal-stage--${mode === "code" ? "code" : view}`}
                ref={attachStage}
              >
                {entry.demo && mode === "code" ? (
                  code ? (
                    <DemoCode code={code} file={entry.demo.split("/").pop() ?? "index.html"} />
                  ) : (
                    <p className="pcode-status">
                      {source.status === "error" ? "Couldn't load the source. Try NEW TAB instead." : "Loading source…"}
                    </p>
                  )
                ) : entry.demo ? (
                  <iframe
                    /* Keyed by view so the demo re-runs anything it measured on load. */
                    key={`${entry.slug}-${view}`}
                    className="pmodal-frame"
                    src={entry.demo}
                    title={`${entry.title} live preview`}
                    loading="lazy"
                    style={{
                      width: logical,
                      height: frameHeight || "100%",
                      transform: `scale(${scale})`,
                    }}
                  />
                ) : (
                  <div className="pmodal-fallback">
                    <PromptThumb entry={entry} eager />
                  </div>
                )}
              </div>
            </section>

            <section className="pmodal-side" aria-label="Prompt">
              <div className="pmodal-actions">
                <button className="pmodal-btn pmodal-btn--solid" onClick={handleCopy} aria-live="polite">
                  {copied === "done" ? <Check size={13} /> : <Copy size={13} />}
                  {copied === "done" ? "COPIED" : copied === "failed" ? "COPY FAILED" : copyLabel}
                </button>
                {entry.demo && (
                  <a className="pmodal-btn" href={entry.demo} target="_blank" rel="noreferrer">
                    NEW TAB <ExternalLink size={12} />
                  </a>
                )}
                {!entry.demo && entry.repoUrl && (
                  <a className="pmodal-btn" href={entry.repoUrl} target="_blank" rel="noreferrer">
                    VIEW CODE <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="pmodal-body">
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
              </div>

              {entry.credits && entry.credits.length > 0 && (
                <div className="pmodal-credits">
                  <span>BUILT ON</span>
                  {entry.credits.map((credit) => (
                    <a key={credit.href} href={credit.href} target="_blank" rel="noreferrer">
                      {credit.label} <ExternalLink size={11} />
                    </a>
                  ))}
                </div>
              )}
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
