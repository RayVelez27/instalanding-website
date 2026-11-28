import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, MoreCard } from "@/components/HomeCards";
import { moreCovers, variedOrder, type Item } from "@/lib/libraryItems";

/**
 * A HOME section as one row: a numbered header (number, title and count, a
 * one-line promise, arrows and See all) over a row of big cards that slides
 * sideways: four in view on desktop, about 2.3 on tablets and 1.3 on phones,
 * so the next card always peeks in. Twelve items dealt at random per visit
 * (light and dark alternating), then a card into the whole collection.
 */
const SHOWN = 12;

const HomeRow = ({
  n,
  id,
  title,
  sub,
  all,
  pool,
  noun,
  onCopied,
}: {
  /** The section's number, "01" */
  n: string;
  id: string;
  title: string;
  sub: string;
  all: string;
  pool: readonly Item[];
  /** Plural, lower case: "landing pages" */
  noun: string;
  onCopied: (m: string) => void;
}) => {
  const whole = pool.length <= SHOWN + 1;
  const [items] = useState(() => (whole ? variedOrder(pool) : variedOrder(pool, "dark").slice(0, SHOWN)));
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const read = () =>
      setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
    read();
    el.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      el.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.98, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="hx-row home-reveal" aria-labelledby={`sec-${id}-t`} id={`sec-${id}`}>
      <div className="hx-head">
        <span className="hx-head-n">{n}</span>
        <div className="hx-head-t">
          <h2 id={`sec-${id}-t`}>
            <Link to={all}>{title}</Link>
            <sup>{pool.length}</sup>
          </h2>
          <p>{sub}</p>
        </div>
        <div className="hx-head-tools">
          <Link to={all} className="hx-seeall">
            See all <span className="hx-seeall-n">{pool.length}</span>
          </Link>
          <button type="button" className="hx-arrow" onClick={() => go(-1)} disabled={edge.start} aria-label={`Previous ${noun}`}>
            <ArrowLeft size={15} aria-hidden="true" />
          </button>
          <button type="button" className="hx-arrow" onClick={() => go(1)} disabled={edge.end} aria-label={`More ${noun}`}>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="hx-track" ref={track} role="list" aria-label={title}>
        {items.map((it) => (
          <div role="listitem" className="hx-cell" key={it.key}>
            <Card item={it} onCopied={onCopied} />
          </div>
        ))}
        {!whole && (
          <div role="listitem" className="hx-cell">
            <MoreCard to={all} count={pool.length} noun={noun} images={moreCovers(pool, items)} />
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeRow;
