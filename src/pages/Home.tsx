import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { AgentPanel } from "@/components/AgentMode";
import { MOTION_ITEMS, PAGES, PAGE_ITEMS, SYSTEM_ITEMS, variedOrder, type Item } from "@/lib/libraryItems";
import { shuffle } from "@/data/prompts";
import HtmlTypewriter from "@/components/HtmlTypewriter";
import LibraryCard from "@/components/LibraryCard";
import { copyText } from "@/lib/copyText";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useSeo } from "@/hooks/useSeo";

/**
 * HOME: the front door to all three layers. A sticky bar with search across
 * pages, motion and systems; a compact dark hero; a rail per layer (plus a
 * mixed "featured" rail), newest first; a band that shows the one-shot prompt
 * every file ships with; and the wordmark. Cards copy their prompt on hover
 * and link into their section: pages open their dialog over home (a page on
 * phones), motion studies their lab, systems their board.
 */


/* A fresh order on every load, like the feeds; kept for the visit */
const RANDOM_PAGES = variedOrder(PAGE_ITEMS).slice(0, 14);
const RANDOM_MOTION = shuffle(MOTION_ITEMS);
const RANDOM_SYSTEMS = shuffle(SYSTEM_ITEMS);

/** The demo file the band's code window copies */
const BAND_PAGE =
  PAGES.find((p) => p.slug === "starfork-game-studio-landing-page") ?? PAGES[0];

/* ── copying, with one shared toast ── */
const useToast = () => {
  const [msg, setMsg] = useState("");
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  const say = (m: string) => {
    setMsg(m);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(""), 1800);
  };
  return { msg, say };
};

/* ── the hero buttons' icons: a glass tile per layer, tinted in its colour,
   with a glyph drawn for it (a browser of stacked pages, an easing curve whose
   dot rides it on hover, a 2x2 grid of tokens) ── */
const CtaIcon = ({ kind }: { kind: "pages" | "motion" | "systems" }) => (
  <span className={`home-cta-icon home-cta-icon--${kind}`} aria-hidden="true">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {kind === "pages" && (
        <>
          <rect className="ci-back" x="6.5" y="3.5" width="14" height="11" rx="2" opacity="0.45" />
          <rect x="3.5" y="7.5" width="14" height="12" rx="2" fill="rgba(255,255,255,0.08)" />
          <path d="M3.5 11h14" />
          <circle cx="6" cy="9.3" r="0.55" fill="currentColor" stroke="none" />
          <circle cx="7.8" cy="9.3" r="0.55" fill="currentColor" stroke="none" />
          <path d="M6.5 14.5h6M6.5 17h4" opacity="0.7" />
        </>
      )}
      {kind === "motion" && (
        <>
          <path d="M3.5 19.5h17M3.5 19.5v-15" opacity="0.3" />
          <path className="ci-curve" d="M4 19C10 19 9.5 5 20 5" />
          <circle className="ci-dot" cx="20" cy="5" r="2.1" fill="currentColor" stroke="none" />
        </>
      )}
      {kind === "systems" && (
        <>
          <rect className="ci-t ci-t1" x="3.5" y="3.5" width="7.5" height="7.5" rx="2" fill="currentColor" stroke="none" />
          <rect className="ci-t ci-t2" x="13" y="3.5" width="7.5" height="7.5" rx="3.75" />
          <rect className="ci-t ci-t3" x="3.5" y="13" width="7.5" height="7.5" rx="2" />
          <rect className="ci-t ci-t4" x="13" y="13" width="7.5" height="7.5" rx="2" fill="rgba(255,255,255,0.12)" />
        </>
      )}
    </svg>
  </span>
);

/* ── a card: the shared library card, fed from an item ── */
const Card = ({ item, onCopied }: { item: Item; onCopied: (m: string) => void }) => {
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

/* ── a section: head (title, count, description, tools) and a rail ── */
const Rail = ({
  id,
  title,
  count,
  sub,
  inline,
  all,
  items,
  extra,
  backArrow = true,
  onCopied,
}: {
  id: string;
  title: string;
  count?: number;
  sub: string;
  inline?: boolean;
  all?: string;
  items: Item[];
  extra?: ReactNode;
  backArrow?: boolean;
  onCopied: (m: string) => void;
}) => {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const measure = () => {
    const el = track.current;
    if (el)
      setEdges({
        start: el.scrollLeft < 4,
        end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4,
      });
  };
  useEffect(() => {
    measure();
    track.current?.scrollTo({ left: 0 });
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);
  const go = (dir: number) =>
    track.current?.scrollBy({
      left: dir * track.current.clientWidth * 0.85,
      behavior: "smooth",
    });

  return (
    <section className="home-sec home-reveal" aria-labelledby={`sec-${id}`}>
      <div className="home-sec-head">
        <div className={`home-sec-title${inline ? " is-inline" : ""}`}>
          <h2 id={`sec-${id}`}>
            {title}
            {count !== undefined && <sup>{count}</sup>}
          </h2>
          <p>{sub}</p>
        </div>
        <div className="home-sec-tools">
          {extra}
          {all && (
            <Link to={all} className="home-seeall">
              SEE ALL
            </Link>
          )}
          {backArrow && (
            <button
              className="home-arrow"
              onClick={() => go(-1)}
              disabled={edges.start}
              aria-label={`Scroll ${title.toLowerCase()} back`}
            >
              <ChevronLeft size={13} />
            </button>
          )}
          <button
            className="home-arrow"
            onClick={() => go(1)}
            disabled={edges.end}
            aria-label={`Scroll ${title.toLowerCase()} forward`}
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
      <div className="home-track" ref={track} onScroll={measure}>
        {items.map((it) => (
          <Card key={it.key} item={it} onCopied={onCopied} />
        ))}
      </div>
    </section>
  );
};

/* ── the page ── */
const Home = () => {
  useAgentDark();
  useSeo({
    title: "InstaLanding.ai — Premium HTML for Humans and Agents",
    rawTitle: true,
    description:
      "Landing pages, motion studies and design systems, each one HTML file with no dependencies, plus the one-shot prompt that builds it. Free, MIT, built for humans and agents.",
    canonical: "/",
  });
  const { msg, say } = useToast();

  // Sections fade up as they arrive
  useEffect(() => {
    const els = document.querySelectorAll(".home-reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);


  return (
    <div className="app-layout">
      <Sidebar />
      <main className="home">
        <SiteTopBar />

        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-aurora" aria-hidden="true">
            <i />
          </div>
          <div className="home-hero-copy">
            <h1 id="home-title" className="home-title">
              <span className="home-ln">
                <span>PREMIUM HTML</span>
              </span>
              <span className="home-ln">
                <span>FOR HUMANS</span>
              </span>
              <span className="home-ln">
                <span className="home-title-outline">AND AGENTS</span>
              </span>
            </h1>
            <p className="home-lede">
              Landing pages, motion studies and design systems.
              <br />
              Free, open source and one file each, with no dependencies.
              <br />
              Copy it, remix it, ship it.
            </p>
          </div>
          <div className="home-ctas">
            <Link to="/pages" className="home-cta home-cta--pages">
              <CtaIcon kind="pages" />
              <span className="home-cta-label">EXPLORE PAGES</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link to="/motion" className="home-cta home-cta--motion">
              <CtaIcon kind="motion" />
              <span className="home-cta-label">EXPLORE MOTION</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
            <Link to="/systems" className="home-cta home-cta--systems">
              <CtaIcon kind="systems" />
              <span className="home-cta-label">EXPLORE SYSTEMS</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <AgentPanel />

        <Rail
          id="pages"
          title="LANDING PAGES"
          count={PAGES.length}
          sub="Production-ready landing pages. One file, no dependencies."
          all="/pages"
          items={RANDOM_PAGES}
          onCopied={say}
        />
        <Rail
          id="motion"
          title="MOTION STUDIES"
          count={MOTION_ITEMS.length}
          sub="One movement per study, running live, taken apart in the lab."
          inline
          all="/motion"
          items={RANDOM_MOTION}
          onCopied={say}
        />
        <Rail
          id="systems"
          title="DESIGN SYSTEMS"
          count={SYSTEM_ITEMS.length}
          sub="Tokens and working components, extracted from real HTML."
          inline
          all="/systems"
          items={RANDOM_SYSTEMS}
          onCopied={say}
        />

        <section
          className="home-band home-reveal"
          aria-labelledby="home-band-title"
        >
          <div className="home-aurora" aria-hidden="true">
            <i />
          </div>
          <div className="home-band-l">
            <p className="home-kicker">THE ONE-SHOT PROMPT</p>
            <h2 id="home-band-title" className="home-band-title">
              EVERY FILE SHIPS
              <br />
              WITH ITS <span>RECIPE</span>
            </h2>
            <p className="home-band-copy">
              Each page, motion study and system comes with the prompt that
              builds it. Hand it to your agent, swap the brand, and get a
              production page in one pass.
            </p>
            <ol className="home-steps">
              <li>
                <b>01</b> COPY IT
              </li>
              <li>
                <b>02</b> REMIX IT
              </li>
              <li>
                <b>03</b> SHIP IT
              </li>
            </ol>
          </div>
          <div className="home-band-r">
            <div className="home-code">
              <div className="home-code-head">
                <span className="home-code-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{BAND_PAGE.demo?.replace(/^\//, "").toUpperCase()}</span>
                <button
                  type="button"
                  className="home-code-copy"
                  onClick={async () => {
                    const html = BAND_PAGE.demo ? await (await fetch(BAND_PAGE.demo)).text() : "";
                    await copyText(html);
                    say("HTML COPIED");
                  }}
                >
                  <Copy size={11} aria-hidden="true" /> COPY
                </button>
              </div>
              <HtmlTypewriter />
              <div className="home-code-foot">
                <span>
                  <i aria-hidden="true" /> ONE FILE · NO DEPENDENCIES
                </span>
                <Link to={`/prompt/${BAND_PAGE.slug}`}>{BAND_PAGE.title} →</Link>
              </div>
            </div>
          </div>
        </section>

        <p className="home-wordmark" aria-hidden="true">
          1NSTALANDING.AI
        </p>
      </main>
      <div
        className={`home-toast${msg ? " is-on" : ""}`}
        role="status"
        aria-live="polite"
      >
        {msg && (
          <>
            <Check size={12} aria-hidden="true" /> {msg}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
