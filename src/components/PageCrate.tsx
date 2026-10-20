import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import type { PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import { useIsPhone } from "@/hooks/useIsPhone";

/**
 * The CRATE view of /pages: the templates stand in a record crate like vinyl
 * sleeves, and you dig through them. The record at the front is lifted toward
 * you; the ones behind step up and back so each shows its title tab; the ones
 * you have passed tip forward and drop away. Click the front record to pull it
 * out (it opens like a grid tile), or a tab behind it to jump there.
 *
 * Wheel, ← → and the buttons dig on desktop; a phone swipes sideways (an
 * up-and-down move still scrolls the page). Only a few records around the
 * front one are drawn, so a long library costs the same as a short one.
 */
const BEHIND = 6;
const STEP_PX = 26; // how far each record behind rises
const DEPTH_PX = 30; // how far each record behind sits back
const WHEEL_STEP = 50;
const SWIPE = 50;

const pad = (n: number) => String(n).padStart(2, "0");

const pose = (d: number, pulling: boolean): React.CSSProperties => {
  if (d < 0) return { transform: "translate3d(0, 26%, 120px) rotateX(-46deg)", opacity: 0 };
  if (d === 0)
    return pulling
      ? { transform: "translate3d(0, -78%, 60px) rotateX(-2deg)", opacity: 0 }
      : { transform: "translate3d(0, 9%, 34px) rotateX(-6deg)", opacity: 1 };
  return {
    transform: `translate3d(0, ${-(d + 0.4) * STEP_PX}px, ${-d * DEPTH_PX}px) rotateX(5deg)`,
    opacity: d >= BEHIND ? 0 : 1,
    filter: `brightness(${1 - d * 0.05})`,
  };
};

interface Props {
  items: PromptEntry[];
  /** The crate front reads the active filter, like a divider card */
  label: string;
  onCopy: (entry: PromptEntry) => void;
  copiedSlug: string | null;
}

const PageCrate = ({ items, label, onCopy, copiedSlug }: Props) => {
  const n = items.length;
  const [c, setC] = useState(0);
  const [pulling, setPulling] = useState<string | null>(null);
  const cRef = useRef(c);
  cRef.current = c;
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef({ id: -1, x: 0, y: 0, done: false, swiped: false });
  const navigate = useNavigate();
  const location = useLocation();
  const phone = useIsPhone();
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = (to: number) => setC(Math.max(0, Math.min(n - 1, to)));
  const goRef = useRef(go);
  goRef.current = go;

  const open = (entry: PromptEntry) => {
    const to = () => navigate(`/prompt/${entry.slug}`, { state: phone ? undefined : { backgroundLocation: location } });
    if (reduced) return to();
    setPulling(entry.slug);
    window.setTimeout(() => {
      setPulling(null);
      to();
    }, 240);
  };

  // The wheel digs while the pointer is over the crate. At either end it lets
  // go, so the page scrolls on past the crate as usual.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const dir = Math.sign(delta);
      const at = cRef.current;
      if ((dir > 0 && at >= n - 1) || (dir < 0 && at <= 0) || !dir) return;
      e.preventDefault();
      if (performance.now() < lock) return;
      acc += delta;
      if (Math.abs(acc) >= WHEEL_STEP) {
        goRef.current(at + dir);
        acc = 0;
        lock = performance.now() + 110;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [n]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.querySelector('[role="dialog"]')) return;
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      goRef.current(cRef.current + (e.key === "ArrowRight" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      swipe.current.swiped = false;
      return;
    }
    swipe.current = { id: e.pointerId, x: e.clientX, y: e.clientY, done: false, swiped: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = swipe.current;
    if (s.id !== e.pointerId || s.done) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
      s.done = true;
      return;
    }
    if (Math.abs(dx) > SWIPE) {
      s.done = true;
      s.swiped = true;
      go(cRef.current + (dx < 0 ? 1 : -1));
    }
  };
  const onPointerEnd = () => {
    swipe.current.id = -1;
  };
  // A swipe that ends over a record must not open it
  const onClickCapture = (e: React.MouseEvent) => {
    if (swipe.current.swiped) {
      e.preventDefault();
      e.stopPropagation();
      swipe.current.swiped = false;
    }
  };

  if (!n) return null;
  const front = items[Math.min(c, n - 1)];
  const tags = (front.style ?? []).filter((t) => t !== "dark" && t !== "light").slice(0, 3);
  const from = Math.max(0, c - 1);
  const to = Math.min(n - 1, c + BEHIND);
  const shown = items.slice(from, to + 1).map((entry, k) => ({ entry, i: from + k }));

  return (
    <section className="cr" aria-roledescription="carousel" aria-label="Landing pages, as a record crate">
      <div
        ref={stage}
        className="cr-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        <button type="button" className="mo-deck-arrow cr-arrow cr-arrow--prev" onClick={() => go(c - 1)} disabled={c <= 0} aria-label="Previous record">
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="cr-pit">
          {/* Back to front, so the paint order agrees with the depth */}
          {[...shown].reverse().map(({ entry, i }) => {
            const d = i - c;
            return (
              <button
                key={entry.slug}
                type="button"
                className={`cr-sleeve${d === 0 ? " is-front" : ""}`}
                style={pose(d, pulling === entry.slug)}
                onClick={() => (d === 0 ? open(entry) : go(i))}
                tabIndex={d === 0 ? 0 : -1}
                aria-label={d === 0 ? `Open ${entry.title}` : `Flip to ${entry.title}`}
                aria-hidden={d !== 0 ? true : undefined}
              >
                <span className="cr-tab">
                  <b>No.{pad(i + 1)}</b>
                  <span>{entry.title}</span>
                </span>
                <span className="cr-art">
                  {entry.thumbnail ? (
                    <img src={entry.thumbnail} alt="" loading={d <= 1 ? "eager" : "lazy"} decoding="async" draggable={false} />
                  ) : (
                    <PromptThumb entry={entry} />
                  )}
                </span>
                <span className="cr-foot">
                  <span>{entry.categoryLabel}</span>
                  <span className={`cr-theme cr-theme--${entry.theme ?? "light"}`}>{(entry.theme ?? "light").toUpperCase()}</span>
                </span>
              </button>
            );
          })}

          <div className="cr-front" aria-hidden="true">
            <span>INSTALANDING.AI</span>
            <b>{label}</b>
            <span>{n} RECORDS</span>
          </div>
        </div>

        <button type="button" className="mo-deck-arrow cr-arrow cr-arrow--next" onClick={() => go(c + 1)} disabled={c >= n - 1} aria-label="Next record">
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="cr-info" aria-live="polite">
        <div className="cr-info-text">
          <p className="cr-info-kicker">
            No.{pad(c + 1)} / {pad(n)} · {front.categoryLabel}
            {tags.length > 0 && ` · ${tags.join(" · ").replace(/-/g, " ")}`}
          </p>
          <h3 className="cr-info-title">{front.title}</h3>
          <p className="cr-info-desc">{front.description}</p>
        </div>
        <div className="cr-info-actions">
          {front.youtube ? (
            <a className="sys-row-btn sys-row-btn--solid" href={`https://www.youtube.com/watch?v=${front.youtube}`} target="_blank" rel="noreferrer">
              <span>YOUTUBE</span> <ExternalLink size={12} aria-hidden="true" />
            </a>
          ) : (
            <button type="button" className="sys-row-btn" onClick={() => onCopy(front)} aria-live="polite">
              {copiedSlug === front.slug ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
              <span>{copiedSlug === front.slug ? "COPIED" : front.demo ? "COPY CODE" : "COPY PROMPT"}</span>
            </button>
          )}
          {front.demo && (
            <a className="sys-row-btn" href={front.demo} target="_blank" rel="noreferrer">
              <span>DEMO</span> <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
          <button type="button" className="sys-row-btn sys-row-btn--solid" onClick={() => open(front)}>
            <span>PULL IT OUT</span> <ArrowUpRight size={12} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="cr-scrub" role="group" aria-label="Jump to a record">
        {items.map((entry, i) => (
          <button
            key={entry.slug}
            type="button"
            className={`cr-tick${i === c ? " is-on" : ""}${entry.theme === "dark" ? " is-dark" : ""}`}
            onClick={() => go(i)}
            aria-label={`${i + 1}: ${entry.title}`}
            aria-current={i === c ? "true" : undefined}
            title={entry.title}
          />
        ))}
      </div>
      <p className="mo-deck-hint cr-hint">
        <span className="mo-deck-hint--desk">SCROLL OVER THE CRATE, ← → OR CLICK A TAB TO DIG</span>
        <span className="mo-deck-hint--phone">SWIPE SIDEWAYS TO DIG · TAP TO PULL ONE OUT</span>
      </p>
    </section>
  );
};

export default PageCrate;
