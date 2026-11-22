import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, MoreCard } from "@/components/HomeCards";
import { moreCovers, variedOrder, type Item } from "@/lib/libraryItems";

/**
 * A HOME section as a grid: three rows of three in the PAGES grid's layout
 * and cards. Eight items dealt at random every time the section mounts (light
 * and dark alternating), a ninth cell that links to the whole collection, and
 * a VIEW MORE button under the grid. A collection small enough to show whole
 * shows every item and skips the ninth cell.
 */
const SHOWN = 8;

const HomeGrid = ({
  id,
  title,
  sub,
  all,
  pool,
  noun,
  onCopied,
}: {
  id: string;
  title: string;
  sub: string;
  /** The section's own page */
  all: string;
  /** Every item in the collection */
  pool: readonly Item[];
  /** Plural, lower case: "landing pages" */
  noun: string;
  onCopied: (m: string) => void;
}) => {
  const whole = pool.length <= SHOWN + 1;
  // A fresh deal per visit to home, kept while it stays mounted
  const [items] = useState(() => (whole ? [...pool] : variedOrder(pool, "dark").slice(0, SHOWN)));
  return (
    <section className="home-sec home-reveal" aria-labelledby={`sec-${id}`}>
      <div className="home-sec-head">
        <div className="home-sec-title">
          <h2 id={`sec-${id}`}>
            {title}
            <sup>{pool.length}</sup>
          </h2>
          <p>{sub}</p>
        </div>
        <div className="home-sec-tools">
          <Link to={all} className="home-seeall">
            SEE ALL
          </Link>
        </div>
      </div>
      <div className={`card-grid home-pages-grid${whole ? " is-whole" : ""}`}>
        {items.map((it) => (
          <Card key={it.key} item={it} onCopied={onCopied} />
        ))}
        {!whole && <MoreCard to={all} count={pool.length} noun={noun} images={moreCovers(pool, items)} />}
      </div>
      <div className="home-viewmore">
        <Link to={all} className="home-viewmore-btn">
          VIEW MORE {noun.toUpperCase()} <ArrowRight size={13} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default HomeGrid;
