import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import LibraryCard from "@/components/LibraryCard";
import { useIsPhone } from "@/hooks/useIsPhone";
import type { Item } from "@/lib/libraryItems";

/* The HOME cards: one item from any layer, and the card that ends a section */

/* ── a card: the shared library card, fed from an item ── */
export const Card = ({ item, onCopied }: { item: Item; onCopied: (m: string) => void }) => {
  const location = useLocation();
  const phone = useIsPhone();
  // Pages open as the dialog over home on desktop, like the feed does
  const state = item.kind === "page" && !phone ? { backgroundLocation: location } : undefined;
  return (
    <LibraryCard
      kind={item.kind}
      title={item.title}
      sub={item.sub}
      to={item.to}
      state={state}
      image={item.image}
      copy={() => fetch(item.code).then((r) => r.text())}
      onCopied={onCopied}
    />
  );
};

/* The last card of a section: three covers it did not show, under a count
   and a link to the whole collection (moreCovers picks them) */

export const MoreCard = ({ to, count, noun, images }: { to: string; count: number; noun: string; images: string[] }) => (
  <div className="home-card home-more">
    <Link to={to} className="home-card-link" aria-label={`Explore all ${count} ${noun}`}>
      <span className="home-card-art home-more-art">
        <span className="home-more-stack" aria-hidden="true">
          {images.map((src, i) => (
            <img key={src + i} src={src} alt="" loading="lazy" decoding="async" />
          ))}
        </span>
        <span className="home-more-copy">
          <span className="home-more-count">{count}</span>
          <span className="home-more-noun">{noun.toUpperCase()}</span>
          <span className="home-more-cta">
            EXPLORE THE LIBRARY <ArrowRight size={13} aria-hidden="true" />
          </span>
        </span>
      </span>
      <span className="home-card-text">
        <span>
          <b>SEE EVERYTHING</b>
          <small>The full collection, newest first</small>
        </span>
        <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  </div>
);
