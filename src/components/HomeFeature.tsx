import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { HOME_PICKS } from "@/data/homePicks";
import { EVERYTHING, LABEL, PAGE_ITEMS, PRODUCT_ITEMS, VIDEO_ITEMS, type Item } from "@/lib/libraryItems";
import { track } from "@/lib/track";

/**
 * "This week" under the HOME hero: one big pick and two beside it (stacked on
 * desktop, side by side on tablets, the big one alone on phones). Picked by
 * hand in data/homePicks.ts; missing picks fill up with the newest video,
 * product and page. Every tile is one link.
 */
const byKey = new Map(EVERYTHING.map((it) => [it.key, it]));
const PICKS: Item[] = (() => {
  const out = HOME_PICKS.flatMap((k) => byKey.get(k) ?? []);
  for (const it of [VIDEO_ITEMS[0], PRODUCT_ITEMS[0], PAGE_ITEMS[0]]) {
    if (out.length >= 3) break;
    if (it && !out.some((o) => o.key === it.key)) out.push(it);
  }
  return out.slice(0, 3);
})();

const BADGE: Partial<Record<Item["kind"], string>> = { video: "PLAY", product: "TRY IT", motion: "PLAY" };

const Tile = ({ it, big }: { it: Item; big?: boolean }) => {
  const location = useLocation();
  const badge = BADGE[it.kind] ?? "OPEN";
  return (
    <Link
      to={it.to}
      state={it.kind === "page" ? { backgroundLocation: location } : undefined}
      className={`hx-tile${big ? " is-big" : ""}`}
      onClick={() => track("home_pick_open", { kind: it.kind, slug: it.to.split("/").pop() ?? "" })}
      aria-label={`${badge === "PLAY" ? "Watch" : badge === "TRY IT" ? "Try" : "Open"} ${it.title}`}
    >
      <img src={it.image} alt="" width={1200} height={600} loading={big ? "eager" : "lazy"} decoding="async" />
      <span className="hx-tile-shade" aria-hidden="true" />
      <span className="hx-tile-badge" aria-hidden="true">
        {badge === "PLAY" ? <Play size={11} fill="currentColor" strokeWidth={0} /> : null}
        {badge}
        {badge !== "PLAY" ? <ArrowUpRight size={12} /> : null}
      </span>
      <span className="hx-tile-meta" aria-hidden="true">
        <small>
          {LABEL[it.kind]} · {it.sub.split(" · ")[0]}
        </small>
        <b>{it.title}</b>
      </span>
    </Link>
  );
};

const HomeFeature = () => {
  if (!PICKS.length) return null;
  const [lead, ...rest] = PICKS;
  return (
    <section className="hx-feature-sec home-reveal" aria-labelledby="hx-week">
      <div className="hx-head">
        <span className="hx-head-n">THIS WEEK</span>
        <div className="hx-head-t">
          <h2 id="hx-week">New in the library</h2>
          <p>Hand-picked from the latest drops.</p>
        </div>
        <div className="hx-head-tools">
          <Link to="/videos" className="hx-seeall">
            All new <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="hx-feature">
        <Tile it={lead} big />
        <div className="hx-feature-stack">
          {rest.map((it) => (
            <Tile key={it.key} it={it} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFeature;
