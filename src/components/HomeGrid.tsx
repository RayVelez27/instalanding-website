import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, MoreCard } from "@/components/HomeCards";
import { PAGES, PAGE_ITEMS, moreCovers, variedOrder } from "@/lib/libraryItems";
import { shuffle } from "@/data/prompts";

/**
 * HOME's landing pages: three rows of three in the PAGES grid's layout and
 * cards. Eight pages dealt at random every time the section mounts (light and
 * dark alternating), and a ninth cell that links to the whole collection.
 */
const SHOWN = 8;

const HomePagesGrid = ({ onCopied }: { onCopied: (m: string) => void }) => {
  // A fresh deal per visit to home, kept while it stays mounted
  const [items] = useState(() => variedOrder(shuffle(PAGE_ITEMS).slice(0, SHOWN), "dark"));
  return (
    <section className="home-sec home-reveal" aria-labelledby="sec-pages">
      <div className="home-sec-head">
        <div className="home-sec-title">
          <h2 id="sec-pages">
            LANDING PAGES
            <sup>{PAGES.length}</sup>
          </h2>
          <p>Production-ready landing pages. One file, no dependencies.</p>
        </div>
        <div className="home-sec-tools">
          <Link to="/pages" className="home-seeall">
            SEE ALL
          </Link>
        </div>
      </div>
      <div className="card-grid home-pages-grid">
        {items.map((it) => (
          <Card key={it.key} item={it} onCopied={onCopied} />
        ))}
        <MoreCard to="/pages" count={PAGES.length} noun="landing pages" images={moreCovers(PAGE_ITEMS, items)} />
      </div>
    </section>
  );
};

export default HomePagesGrid;
