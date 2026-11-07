import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { AgentPanel } from "@/components/AgentMode";
import { MOTION_ITEMS, PAGES, SYSTEM_ITEMS, variedOrder, moreCovers, type Item } from "@/lib/libraryItems";
import { shuffle } from "@/data/prompts";
import HtmlTypewriter from "@/components/HtmlTypewriter";
import HomePagesGrid from "@/components/HomePagesGrid";
import { Card, MoreCard } from "@/components/HomeCards";
import { copyText } from "@/lib/copyText";
import { useAgentDark } from "@/hooks/useAgentDark";
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
const RANDOM_MOTION = shuffle(MOTION_ITEMS);
const RANDOM_SYSTEMS = variedOrder(SYSTEM_ITEMS, "dark");

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

/* The hero's CODE rings: scroll to the section after the hero, clear of the sticky bar */
const toNextSection = (e: MouseEvent<HTMLAnchorElement>) => {
  const next = e.currentTarget.closest(".home-hero")?.nextElementSibling;
  if (!next) return;
  e.preventDefault();
  const bar = document.querySelector(".home-top");
  const offset = bar && getComputedStyle(bar).position === "sticky" ? bar.getBoundingClientRect().height : 0;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: next.getBoundingClientRect().top + window.scrollY - offset, behavior: smooth ? "smooth" : "auto" });
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
  more,
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
  /** Ends the rail with a card that links to the whole collection */
  more?: { noun: string; pool: Item[] };
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
        {more && all && (
          <MoreCard
            to={all}
            count={count ?? more.pool.length}
            noun={more.noun}
            images={moreCovers(more.pool, items)}
          />
        )}
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

  // Sections fade up as they arrive (on desktop; phones show the whole page at once)
  useEffect(() => {
    const els = document.querySelectorAll(".home-reveal");
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 720px)").matches) {
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
      // Any sliver counts: a tall section never reaches a ratio threshold on a short screen
      { threshold: 0, rootMargin: "0px 0px -6% 0px" },
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
            <p className="home-badge">Copy. Remix. Ship It.</p>
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
          </div>
          {/* After Uiverse.io by Smit-Prajapati: five glass rings ripple out from the word.
              It takes you down to whatever follows the hero (the agent panel or the pages) */}
          <a className="home-ripple" href="#sec-pages" aria-label="Jump to the code: browse the pages" onClick={toNextSection}>
            <span className="home-ripple-box">
              <span className="home-ripple-word">CODE</span>
            </span>
            <span className="home-ripple-box" />
            <span className="home-ripple-box" />
            <span className="home-ripple-box" />
            <span className="home-ripple-box" />
          </a>
        </section>
        <AgentPanel />

        <HomePagesGrid onCopied={say} />
        <Rail
          id="motion"
          title="MOTION STUDIES"
          count={MOTION_ITEMS.length}
          sub="One movement per study, running live, taken apart in the lab."
          inline
          all="/motion"
          items={RANDOM_MOTION}
          more={{ noun: "motion studies", pool: MOTION_ITEMS }}
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
          more={{ noun: "design systems", pool: SYSTEM_ITEMS }}
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
