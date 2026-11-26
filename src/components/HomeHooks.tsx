import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { videos } from "@/data/videos";
import { products } from "@/data/products";
import { newest } from "@/lib/libraryItems";
import { track } from "@/lib/track";

/**
 * The strip right under the HOME hero: the things people open most, first.
 * Launch data (Nov 2026) had the three videos as the most-viewed items and
 * the products close behind, while 80% of visits started on home and 58% left
 * after one page, so home leads with them before the landing-page grid.
 *
 * Desktop: VIDEOS on the left (the lead video big, two under it) and PRODUCTS
 * on the right (two columns of three), the same height. Every tile is one
 * link, edge to edge: nothing here looks clickable without being clickable.
 */

const VIDEOS = videos; // the data's order is the order of views at launch
const PRODUCTS = newest(products);

const open = (kind: "video" | "product", slug: string) => track("home_hook_open", { kind, slug });

const HomeHooks = () => (
  <section className="home-hooks" aria-label="Videos and products">
    <div className="home-hooks-col home-hooks-col--videos">
      <div className="home-hooks-head">
        <h2>
          VIDEOS <sup>{VIDEOS.length}</sup>
        </h2>
        <p>Rendered live in your browser, sound and all</p>
        <Link to="/videos" className="home-hooks-all">
          ALL VIDEOS <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
      <div className="home-hooks-videos">
        {VIDEOS.map((v, i) => (
          <Link
            key={v.slug}
            to={`/videos/${v.slug}`}
            className={`hook-tile hook-tile--video${i === 0 ? " is-lead" : ""}`}
            onClick={() => open("video", v.slug)}
            aria-label={`Watch ${v.title}, ${v.runtime}`}
          >
            <img src={v.thumbnail} alt="" width={1200} height={600} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
            <span className="hook-shade" aria-hidden="true" />
            <span className="hook-play" aria-hidden="true">
              <Play size={i === 0 ? 22 : 15} fill="currentColor" strokeWidth={0} />
            </span>
            <span className="hook-meta" aria-hidden="true">
              <span className="hook-kicker">VIDEO · {v.runtime}</span>
              <b>{v.title}</b>
            </span>
          </Link>
        ))}
      </div>
    </div>

    <div className="home-hooks-col home-hooks-col--products">
      <div className="home-hooks-head">
        <h2>
          PRODUCTS <sup>{PRODUCTS.length}</sup>
        </h2>
        <p>Concepts you can operate. Every control works</p>
        <Link to="/products" className="home-hooks-all">
          ALL PRODUCTS <ArrowRight size={12} aria-hidden="true" />
        </Link>
      </div>
      <div className="home-hooks-products">
        {PRODUCTS.map((p) => (
          <Link
            key={p.slug}
            to={`/products/${p.slug}`}
            className="hook-tile hook-tile--product"
            onClick={() => open("product", p.slug)}
            aria-label={`Try ${p.title}, ${p.kind}`}
          >
            <img src={p.thumbnail} alt="" width={1200} height={600} loading="lazy" decoding="async" />
            <span className="hook-shade" aria-hidden="true" />
            <span className="hook-try" aria-hidden="true">
              TRY IT <ArrowUpRight size={11} />
            </span>
            <span className="hook-meta" aria-hidden="true">
              <span className="hook-kicker">{p.kind}</span>
              <b>{p.title}</b>
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default HomeHooks;
