import { useEffect, useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { PAGE_ITEMS } from "@/lib/libraryItems";

/**
 * The home hero's preview reel (desktop only): the newest landing pages' hero
 * thumbnails, one after another in a browser frame. Each holds for a beat with
 * a slow push in, then crossfades to the next; the segments underneath show
 * where you are and jump to a page. Hover or focus pauses it; the frame opens
 * the page showing. Under prefers-reduced-motion it holds still until a segment
 * is picked.
 */
const REEL = PAGE_ITEMS.slice(0, 8);
const HOLD = 3200;

const HeroReel = () => {
  const location = useLocation();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    if (paused || still) return;
    const t = window.setTimeout(() => {
      if (!document.hidden) setI((n) => (n + 1) % REEL.length);
    }, HOLD);
    return () => window.clearTimeout(t);
  }, [i, paused, still]);

  if (!REEL.length) return null;
  const cur = REEL[i];

  return (
    <div
      className={`hero-reel${paused || still ? " is-paused" : ""}`}
      style={{ "--hold": `${HOLD}ms` } as CSSProperties}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPaused(false)}
    >
      <Link
        to={cur.to}
        state={{ backgroundLocation: location }}
        className="hero-reel-frame"
        aria-label={`Preview: ${cur.title}. Open the page`}
      >
        <span className="hero-reel-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <span className="hero-reel-url">instalanding.ai{cur.to}</span>
        </span>
        <span className="hero-reel-stage">
          {REEL.map((it, n) => (
            <img
              key={it.key}
              src={it.image}
              alt=""
              className={n === i ? "is-on" : undefined}
              loading={n < 2 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
          <span className="hero-reel-open" aria-hidden="true">
            OPEN <ArrowUpRight size={13} />
          </span>
        </span>
      </Link>
      <div className="hero-reel-meta">
        <span className="hero-reel-title" aria-live="polite">
          {cur.title}
        </span>
        <span className="hero-reel-count" aria-hidden="true">
          {String(i + 1).padStart(2, "0")} / {String(REEL.length).padStart(2, "0")}
        </span>
      </div>
      <div className="hero-reel-segs">
        {REEL.map((it, n) => (
          <button
            key={it.key}
            type="button"
            className={n === i ? "is-on" : n < i ? "is-done" : undefined}
            onClick={() => setI(n)}
            aria-label={`Show ${it.title}`}
            aria-current={n === i}
          >
            <i key={n === i ? `on-${i}` : "off"} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroReel;
