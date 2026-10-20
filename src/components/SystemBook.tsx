import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { systemCover, type SystemEntry } from "@/data/systems";

/**
 * The BOOK view of /systems: the design systems bound as a book, one system
 * per page, read as a two-page spread (one page on a phone). A title page
 * with the contents opens it and an end page closes it.
 *
 * The turning page bends like paper. It is the CSS bending trick: the leaf is
 * cut into STRIPS vertical strips, each nested inside the one before and
 * hinged on its left edge, so a small rotateY on every strip adds up into a
 * curl while the whole leaf rotates 180° about the spine. Each strip shows its
 * slice of the page's front and of its back (two faces, backface-hidden), so
 * any page content survives the cut. Only the turn is cut: at rest the pages
 * are ordinary, clickable HTML.
 *
 * The page you have just read moves to the left and the next one appears on
 * the right, so a phone, which shows only the right page, reads one system per
 * turn and a desktop sees two at a time.
 */
const STRIPS = 12;
const PAGE_W = 336;
const PAGE_H = 468;
const STRIP_W = PAGE_W / STRIPS;
const TURN_MS = 950;
const SWIPE = 70;

type Page = { kind: "title" } | { kind: "system"; system: SystemEntry; n: number } | { kind: "end" };
type Turn = { dir: 1 | -1; to: number };

const pad = (n: number) => String(n).padStart(2, "0");

interface PageProps {
  page: Page;
  systems: SystemEntry[];
  /** At rest the page is real; inside the turning leaf it is a picture of itself */
  live: boolean;
  onJump: (to: number) => void;
}

const PageBody = ({ page, systems, live, onJump }: PageProps) => {
  const tab = live ? undefined : -1;
  if (page.kind === "title") {
    return (
      <div className="sb-page sb-page--title">
        <p className="sb-kicker">
          <span>INSTALANDING.AI</span>
          <span>VOL. 1</span>
        </p>
        <h3 className="sb-book-title">
          DESIGN
          <br />
          SYSTEMS
        </h3>
        <p className="sb-sub">The language behind the pages: tokens, components and the rules an agent follows.</p>
        <p className="sb-label">CONTENTS</p>
        <ol className="sb-toc">
          {systems.map((s, i) => (
            <li key={s.slug}>
              <button type="button" onClick={() => onJump(i + 1)} tabIndex={tab}>
                <span>{s.name}</span>
                <i aria-hidden="true" />
                <span>{pad(i + 1)}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="sb-folio">
          <span>TURN THE PAGE →</span>
          <span>00</span>
        </p>
      </div>
    );
  }
  if (page.kind === "end") {
    return (
      <div className="sb-page sb-page--end">
        <p className="sb-kicker">
          <span>COLOPHON</span>
          <span>FIN</span>
        </p>
        <h3 className="sb-book-title sb-book-title--end">
          MORE
          <br />
          SOON.
        </h3>
        <p className="sb-sub">
          {systems.length} systems so far, each extracted from a real page in the library. More are being cut from it.
        </p>
        <button type="button" className="sb-open" onClick={() => onJump(0)} tabIndex={tab}>
          <RotateCcw size={12} aria-hidden="true" /> BACK TO THE START
        </button>
        <p className="sb-folio">
          <span>SET IN IBM PLEX MONO</span>
          <span>{pad(systems.length + 1)}</span>
        </p>
      </div>
    );
  }
  const { system: s, n } = page;
  return (
    <div className="sb-page">
      <div className="sb-band" aria-hidden="true">
        {s.palette.map((c) => (
          <i key={c} style={{ background: c }} />
        ))}
      </div>
      <p className="sb-kicker">
        <span>SYSTEM {pad(n)}</span>
        <span>{s.theme.toUpperCase()}</span>
      </p>
      <div className="sb-shot">
        <img src={systemCover(s)} alt="" width={1200} height={600} loading="lazy" decoding="async" draggable={false} />
      </div>
      <h3 className="sb-name">{s.name}</h3>
      <p className="sb-id">
        {s.slug}@{s.version}
      </p>
      <p className="sb-tagline">{s.tagline}</p>
      <ul className="sb-swatches" aria-label={`Palette: ${s.palette.join(", ")}`}>
        {s.palette.map((c) => (
          <li key={c} style={{ background: c }} title={c} />
        ))}
      </ul>
      <p className="sb-meta">
        {s.components.length} COMPONENTS · {s.templates.length} {s.templates.length === 1 ? "TEMPLATE" : "TEMPLATES"}
      </p>
      {live ? (
        <Link to={`/systems/${s.slug}`} className="sb-open">
          OPEN THE BOARD <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      ) : (
        <span className="sb-open">
          OPEN THE BOARD <ArrowUpRight size={12} aria-hidden="true" />
        </span>
      )}
      <p className="sb-folio">
        <span>{s.name.toUpperCase()}</span>
        <span>{pad(n)}</span>
      </p>
    </div>
  );
};

/** One strip of the leaf, and inside it the rest of the leaf */
const Strip = ({ k, front, back }: { k: number; front: ReactNode; back: ReactNode }) => (
  <div className={`sb-strip${k === 0 ? " sb-strip--root" : ""}`}>
    <div className="sb-face sb-face--front">
      <div className="sb-face-in" style={{ left: -k * STRIP_W }}>
        {front}
      </div>
    </div>
    <div className="sb-face sb-face--back">
      <div className="sb-face-in" style={{ left: -(PAGE_W - (k + 1) * STRIP_W) }}>
        {back}
      </div>
    </div>
    {k < STRIPS - 1 && <Strip k={k + 1} front={front} back={back} />}
  </div>
);

const SystemBook = ({ systems }: { systems: SystemEntry[] }) => {
  const pages: Page[] = [{ kind: "title" }, ...systems.map((system, i) => ({ kind: "system" as const, system, n: i + 1 })), { kind: "end" }];
  const last = pages.length - 1;
  // r is the page on the right; the left shows r - 1 (the inside cover when r is 0)
  const [r, setR] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const drag = useRef({ id: -1, x: 0, y: 0, done: false });
  const root = useRef<HTMLElement>(null);
  // Fit the book to the column: the spread with side arrows, the spread scaled down, or one page
  const [fit, setFit] = useState({ single: false, scale: 1, arrows: true });
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const spread = PAGE_W * 2 + 48;
    const measure = () => {
      const w = el.clientWidth;
      if (w >= spread + 160) setFit({ single: false, scale: 1, arrows: true });
      else if (w >= 600) setFit({ single: false, scale: Math.min(1, w / spread), arrows: false });
      else setFit({ single: true, scale: Math.min(1, (w - 8) / (PAGE_W + 28)), arrows: false });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const turnTo = (to: number) => {
    to = Math.max(0, Math.min(last, to));
    if (turn || to === r) return;
    if (reduced) setR(to);
    else setTurn({ dir: to > r ? 1 : -1, to });
  };
  const step = (dir: 1 | -1) => turnTo(r + dir);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.querySelector('[role="dialog"]')) return;
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      stepRef.current(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Swipe: left turns forward, right turns back. A vertical move is the page scrolling.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, done: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId || d.done) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      d.done = true;
      return;
    }
    if (Math.abs(dx) > SWIPE) {
      d.done = true;
      step(dx < 0 ? 1 : -1);
    }
  };
  const onPointerEnd = () => {
    drag.current.id = -1;
  };

  const body = (i: number, live: boolean) =>
    i < 0 ? <div className="sb-page sb-page--endpaper" /> : <PageBody page={pages[i]} systems={systems} live={live} onJump={turnTo} />;

  // What lies under the leaf while it turns
  const leftIdx = turn && turn.dir < 0 ? turn.to - 1 : r - 1;
  const rightIdx = turn && turn.dir > 0 ? turn.to : r;
  // The leaf's two sides: forward, it carries the right page over and lands as the new left;
  // back, it lifts the left page and lands as the new right.
  const front = turn ? body(turn.dir > 0 ? r : turn.to, false) : null;
  const back = turn ? body(turn.dir > 0 ? turn.to - 1 : r - 1, false) : null;

  const done = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget || !turn) return;
    setR(turn.to);
    setTurn(null);
  };

  const label = (i: number) => (pages[i].kind === "system" ? (pages[i] as { system: SystemEntry }).system.name : pages[i].kind === "title" ? "Contents" : "The end");

  return (
    <section
      ref={root}
      className={`sb${fit.single ? " sb--single" : ""}${fit.arrows ? "" : " sb--no-arrows"}`}
      aria-roledescription="book"
      aria-label="Design systems, as a book"
      style={{ "--sb-w": `${PAGE_W}px`, "--sb-h": `${PAGE_H}px`, "--sb-strip": `${STRIP_W}px`, "--sb-turn": `${TURN_MS}ms`, "--sb-scale": fit.scale } as React.CSSProperties}
    >
      <div className="sb-stage">
        <button type="button" className="mo-deck-arrow" onClick={() => step(-1)} disabled={r <= 0 && !turn} aria-label="Previous page">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="sb-viewport" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd}>
          <div className="sb-book">
            <div className="sb-cover" aria-hidden="true" />
            <div className={`sb-side sb-side--left${turn && turn.dir < 0 ? " is-revealed" : ""}`} aria-hidden={turn ? true : undefined}>
              {body(leftIdx, !turn)}
              <button type="button" className="sb-corner sb-corner--left" onClick={() => step(-1)} disabled={r <= 0} aria-label="Turn back" tabIndex={-1} />
            </div>
            <div className={`sb-side sb-side--right${turn && turn.dir > 0 ? " is-revealed" : ""}`} aria-hidden={turn ? true : undefined}>
              {body(rightIdx, !turn)}
              <button type="button" className="sb-corner sb-corner--right" onClick={() => step(1)} disabled={r >= last} aria-label="Turn the page" tabIndex={-1} />
            </div>
            <div className="sb-gutter" aria-hidden="true" />
            <div className="sb-ribbon" aria-hidden="true" />
            {turn && (
              <div className={`sb-leaf ${turn.dir > 0 ? "is-fwd" : "is-back"}`} onAnimationEnd={done} aria-hidden="true">
                <Strip k={0} front={front} back={back} />
              </div>
            )}
          </div>
        </div>

        <button type="button" className="mo-deck-arrow" onClick={() => step(1)} disabled={r >= last && !turn} aria-label="Next page">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="mo-deck-bar">
        <button type="button" className="mo-deck-step" onClick={() => step(-1)} disabled={r <= 0} aria-label="Previous page">
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="mo-deck-count sb-count" aria-live="polite">
          {label(r)}
        </span>
        <button type="button" className="mo-deck-step" onClick={() => step(1)} disabled={r >= last} aria-label="Next page">
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <span className="mo-deck-hint">
          <span className="mo-deck-hint--desk">← → OR CLICK A PAGE CORNER</span>
          <span className="mo-deck-hint--phone">SWIPE TO TURN THE PAGE</span>
        </span>
      </div>
    </section>
  );
};

export default SystemBook;
