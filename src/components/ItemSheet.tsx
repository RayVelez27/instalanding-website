import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Maximize2, MoreHorizontal, X } from "lucide-react";
import { track } from "@/lib/track";
import { copyText } from "@/lib/copyText";

/**
 * The item sheet: how every library item (page, product, video, motion study,
 * design system) opens on a phone or tablet. One surface for all five, so it
 * is learnt once:
 *
 * - a bottom sheet over the list, which recedes behind it; drag the handle or
 *   the title down to dismiss, and swipe the title sideways for the next item
 * - the work first: live media edge to edge, which can go full screen
 * - a calm title block (pills, a serif title, a two-line summary), a stat strip
 * - depth one tap away: rows open a sub-sheet, never a scroll inside a scroll
 * - one frosted dock: a labelled primary verb, Copy, and ••• for the rest
 *
 * Desktop keeps its dialogs; the routes pick this one with useIsCompact.
 * Opens, actions, depth and dismissals are sent as item_sheet_* events.
 */

export type SheetKind = "page" | "product" | "video" | "motion" | "system";

export interface SheetAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  download?: string;
  /** In-app route */
  to?: string;
  /** Shows a check and keeps the label it is given (e.g. "Copied") */
  done?: boolean;
  /** Puts the media full screen instead (the sheet owns that state) */
  fullScreen?: boolean;
}

export interface SheetNeighbour {
  title: string;
  thumb?: string;
  go: () => void;
}

interface Props {
  kind: SheetKind;
  slug: string;
  theme: "dark" | "light";
  title: string;
  summary: string;
  pills: { label: string; accent?: boolean }[];
  media?: ReactNode;
  /** CSS aspect-ratio of the media slot */
  mediaRatio?: string;
  /** A live hint on the media, bottom left ("LIVE · TAP TO USE") */
  mediaHint?: string;
  /** Offer the full-screen button on the media */
  canFullScreen?: boolean;
  stats?: { value: string; label: string }[];
  /** Pinned to the top of the scroll once reached (tabs) */
  sticky?: ReactNode;
  children?: ReactNode;
  primary: SheetAction;
  secondary?: SheetAction;
  more?: SheetAction[];
  prev?: SheetNeighbour | null;
  next?: SheetNeighbour | null;
  /** A deeper view over the sheet (controls, code, the lab); null when closed */
  sub?: { title: string; body: ReactNode } | null;
  onSubClose?: () => void;
  onClose: () => void;
}

const haptic = () => {
  try {
    navigator.vibrate?.(8);
  } catch {
    /* not supported */
  }
};

const OUT_MS = 280;

const ActionEl = ({ a, className, onDone }: { a: SheetAction; className: string; onDone: () => void }) => {
  const body = (
    <>
      {a.done ? <Check size={15} aria-hidden="true" /> : a.icon}
      <span>{a.label}</span>
    </>
  );
  if (a.to)
    return (
      <Link className={className} to={a.to} onClick={onDone}>
        {body}
      </Link>
    );
  if (a.href)
    return (
      <a className={className} href={a.href} download={a.download} target={a.download ? undefined : "_blank"} rel="noreferrer" onClick={() => { a.onClick?.(); onDone(); }}>
        {body}
      </a>
    );
  return (
    <button type="button" className={className} onClick={() => { a.onClick?.(); onDone(); }} aria-live="polite">
      {body}
    </button>
  );
};

const ItemSheet = (p: Props) => {
  const { kind, slug } = p;
  const sheet = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [full, setFull] = useState(false);
  const [menu, setMenu] = useState(false);
  const [swipe, setSwipe] = useState<"" | "next" | "prev">("");
  const openedAt = useRef(Date.now());
  const depthSent = useRef(new Set<string>());
  const drag = useRef({ id: -1, x: 0, y: 0, t: 0, axis: "" as "" | "x" | "y", dx: 0, dy: 0 });

  const meta = { kind, slug };
  const depth = (what: string) => {
    const k = `${slug}:${what}`;
    if (depthSent.current.has(k)) return;
    depthSent.current.add(k);
    track("item_sheet_depth", { ...meta, what });
  };

  useEffect(() => {
    track("item_sheet_open", meta);
    openedAt.current = Date.now();
    setFull(false);
    setMenu(false);
    scroller.current?.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /* The tab says what's open, whatever the list underneath set; closing gives it back */
  useEffect(() => {
    const before = document.title;
    document.title = `${p.title} — InstaLanding.ai`;
    return () => {
      document.title = before;
    };
  }, [p.title]);

  /* The page behind recedes (CSS keys off this class); the origin is the middle
     of what's on screen, so it shrinks toward the reader, not the page top */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--isheet-origin", `${window.scrollY + window.innerHeight / 2}px`);
    root.classList.add("isheet-open");
    return () => root.classList.remove("isheet-open");
  }, []);

  const close = (how: string) => {
    if (closing) return;
    track("item_sheet_dismiss", { ...meta, how, ms: String(Date.now() - openedAt.current) });
    setClosing(true);
    document.documentElement.classList.remove("isheet-open");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(p.onClose, reduced ? 0 : OUT_MS);
  };

  const [linkCopied, setLinkCopied] = useState(false);
  useEffect(() => setLinkCopied(false), [slug]);
  const wire = (a: SheetAction): SheetAction =>
    a.fullScreen ? { ...a, onClick: () => { a.onClick?.(); setFull(true); depth("full_screen"); } } : a;
  const primary = wire(p.primary);
  const secondary = p.secondary && wire(p.secondary);
  // Every sheet can hand its link on; it is the last thing in •••
  const more: SheetAction[] = [
    ...(p.more ?? []).map(wire),
    {
      id: "copy_link",
      label: linkCopied ? "Link copied" : "Copy link",
      done: linkCopied,
      onClick: () => {
        copyText(window.location.origin + window.location.pathname).then(() => {
          setLinkCopied(true);
          window.setTimeout(() => setLinkCopied(false), 1400);
        });
      },
    },
  ];

  const act = (a: SheetAction) => () => {
    haptic();
    track("item_sheet_action", { ...meta, action: a.id });
  };

  /* Gestures on the grab zone (handle + title block): down drags the sheet,
     sideways swipes to the neighbour. The axis is decided after 8px. */
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), axis: "", dx: 0, dy: 0 };
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    d.dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.max(Math.abs(d.dx), Math.abs(d.dy)) < 8) return;
      d.axis = Math.abs(d.dy) > Math.abs(d.dx) ? "y" : "x";
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
    }
    const el = sheet.current;
    if (!el) return;
    if (d.axis === "y") {
      // Follows the thumb down; up past the top rubber-bands at a third
      const y = d.dy > 0 ? d.dy : d.dy * 0.35;
      el.style.transition = "none";
      el.style.transform = `translateY(${y}px)`;
      document.documentElement.style.setProperty("--isheet-pull", String(Math.min(Math.max(d.dy, 0) / el.offsetHeight, 1)));
    } else {
      const head = el.querySelector<HTMLElement>(".isheet-head");
      if (head) {
        head.style.transition = "none";
        head.style.transform = `translateX(${d.dx * 0.6}px)`;
        head.style.opacity = String(1 - Math.min(Math.abs(d.dx) / 400, 0.5));
      }
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;
    const el = sheet.current;
    if (!el || !d.axis) return;
    const ms = Math.max(performance.now() - d.t, 1);
    if (d.axis === "y") {
      document.documentElement.style.removeProperty("--isheet-pull");
      const fling = d.dy / ms > 0.5;
      if (d.dy > el.offsetHeight * 0.3 || (fling && d.dy > 40)) {
        el.style.transition = `transform ${OUT_MS}ms cubic-bezier(.32,.72,0,1)`;
        el.style.transform = "translateY(100%)";
        close("drag");
      } else {
        el.style.transition = "transform 360ms cubic-bezier(.32,.72,0,1)";
        el.style.transform = "";
      }
    } else {
      const head = el.querySelector<HTMLElement>(".isheet-head");
      if (head) {
        head.style.transition = "transform 300ms cubic-bezier(.32,.72,0,1), opacity 300ms";
        head.style.transform = "";
        head.style.opacity = "";
      }
      const target = d.dx < -70 ? p.next : d.dx > 70 ? p.prev : null;
      if (target) {
        haptic();
        setSwipe(d.dx < 0 ? "next" : "prev");
        depth("swipe");
        target.go();
      }
    }
  };

  const goNeighbour = (dir: "next" | "prev") => {
    const n = dir === "next" ? p.next : p.prev;
    if (!n) return;
    setSwipe(dir);
    depth(dir === "next" ? "next_card" : "prev");
    n.go();
  };

  return (
    <Dialog.Root open onOpenChange={(o) => !o && close("escape")}>
      <Dialog.Portal>
        <Dialog.Overlay className={`isheet-scrim${closing ? " is-closing" : ""}`} onClick={() => close("backdrop")} />
        <Dialog.Content
          ref={sheet}
          className={`isheet isheet--${p.theme}${closing ? " is-closing" : ""}`}
          aria-describedby="isheet-sum"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            // Escape backs out of the deepest layer first
            if (full) { e.preventDefault(); setFull(false); }
            else if (menu) { e.preventDefault(); setMenu(false); }
            else if (p.sub) { e.preventDefault(); p.onSubClose?.(); }
          }}
        >
          <div className="isheet-scroll" ref={scroller}>
            <div className="isheet-grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
              <span className="isheet-handle" aria-hidden="true" />
            </div>

            {p.media && (
              <div
                className={`isheet-media${full ? " is-full" : ""}`}
                style={{ aspectRatio: full ? undefined : p.mediaRatio ?? "16 / 10" }}
                onPointerDown={() => depth("media")}
              >
                {p.media}
                <button type="button" className="isheet-x" onClick={() => (full ? setFull(false) : close("close"))} aria-label={full ? "Exit full screen" : "Close"}>
                  <X size={17} aria-hidden="true" />
                </button>
                {p.mediaHint && !full && (
                  <span className="isheet-hint" aria-hidden="true">
                    <i /> {p.mediaHint}
                  </span>
                )}
                {p.canFullScreen && !full && (
                  <button type="button" className="isheet-full" onClick={() => { setFull(true); depth("full_screen"); }} aria-label="Full screen">
                    <Maximize2 size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div
              key={slug}
              className={`isheet-head${p.media ? "" : " isheet-head--bare"}${swipe ? ` is-in-${swipe}` : ""}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onAnimationEnd={() => setSwipe("")}
            >
              {!p.media && (
                <button type="button" className="isheet-x isheet-x--flat" onClick={() => close("close")} aria-label="Close">
                  <X size={17} aria-hidden="true" />
                </button>
              )}
              <ul className="isheet-pills" aria-label="About">
                {p.pills.map((pl) => (
                  <li key={pl.label} className={pl.accent ? "is-accent" : undefined}>{pl.label}</li>
                ))}
              </ul>
              <Dialog.Title className="isheet-title">{p.title}</Dialog.Title>
              <Summary text={p.summary} slug={slug} onMore={() => depth("summary")} />
              {p.stats && p.stats.length > 0 && (
                <dl className="isheet-stats">
                  {p.stats.map((s) => (
                    <div key={s.label}>
                      <dt>{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {p.sticky && <div className="isheet-sticky">{p.sticky}</div>}

            <div className="isheet-body">{p.children}</div>

            {(p.prev || p.next) && (
              <nav className="isheet-neighbours" aria-label="More items">
                {p.next && (
                  <button type="button" className="isheet-next" onClick={() => goNeighbour("next")}>
                    {p.next.thumb && <img src={p.next.thumb} alt="" loading="lazy" decoding="async" />}
                    <span>
                      <small>Up next</small>
                      <b>{p.next.title}</b>
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                )}
                {p.prev && (
                  <button type="button" className="isheet-prev" onClick={() => goNeighbour("prev")}>
                    <ChevronLeft size={14} aria-hidden="true" /> {p.prev.title}
                  </button>
                )}
                <p className="isheet-swipe-hint">Swipe the title sideways to browse</p>
              </nav>
            )}
          </div>

          <div className="isheet-dock">
            <ActionEl a={primary} className="isheet-btn isheet-btn--primary" onDone={act(primary)} />
            {secondary && <ActionEl a={secondary} className="isheet-btn" onDone={act(secondary)} />}
            {(
              <button type="button" className="isheet-btn isheet-btn--icon" aria-haspopup="menu" aria-expanded={menu} aria-label="More actions" onClick={() => { setMenu(true); depth("more"); }}>
                <MoreHorizontal size={18} aria-hidden="true" />
              </button>
            )}
          </div>

          {menu && (
            <div className="isheet-menu-wrap">
              <button type="button" className="isheet-menu-scrim" aria-label="Close menu" onClick={() => setMenu(false)} />
              <div className="isheet-menu" role="menu">
                <ul>
                  {more.map((a) => (
                    <li key={a.id} role="none">
                      <ActionEl
                        a={a}
                        className="isheet-menu-item"
                        onDone={() => {
                          act(a)();
                          setMenu(false);
                        }}
                      />
                    </li>
                  ))}
                </ul>
                <button type="button" className="isheet-menu-cancel" onClick={() => setMenu(false)}>Cancel</button>
              </div>
            </div>
          )}

          {p.sub && (
            <section className="isheet-sub" aria-label={p.sub.title}>
              <header className="isheet-sub-head">
                <button type="button" onClick={p.onSubClose} aria-label="Back">
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <h2>{p.sub.title}</h2>
              </header>
              <div className="isheet-sub-body">{p.sub.body}</div>
            </section>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** The summary, two lines until "More" */
const Summary = ({ text, slug, onMore }: { text: string; slug: string; onMore: () => void }) => {
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => setOpen(false), [slug]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setLong(el.scrollHeight > el.clientHeight + 2);
  }, [text, open]);
  return (
    <div className="isheet-sum-wrap">
      <Dialog.Description ref={ref} id="isheet-sum" className={`isheet-sum${open ? " is-open" : ""}`}>
        {text}
      </Dialog.Description>
      {(long || open) && (
        <button type="button" className="isheet-more-text" onClick={() => { setOpen((o) => !o); if (!open) onMore(); }}>
          {open ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

/** A row that opens a sub-sheet ("Controls  7 ›") */
export const SheetRow = ({ label, value, onClick }: { label: string; value?: string; onClick: () => void }) => (
  <button type="button" className="isheet-row" onClick={onClick}>
    <span>{label}</span>
    <span className="isheet-row-end">
      {value}
      <ChevronRight size={15} aria-hidden="true" />
    </span>
  </button>
);

/** A horizontal snap row of other items */
export const SheetCarousel = ({ title, items }: { title: string; items: { key: string; title: string; sub?: string; thumb?: string; onClick: () => void }[] }) =>
  items.length ? (
    <section className="isheet-carousel" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {items.map((it) => (
          <li key={it.key}>
            <button type="button" onClick={it.onClick}>
              <span className="isheet-card-img">{it.thumb && <img src={it.thumb} alt="" loading="lazy" decoding="async" />}</span>
              <b>{it.title}</b>
              {it.sub && <small>{it.sub}</small>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  ) : null;

export default ItemSheet;

