import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Copy, Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { AgentPanel } from "@/components/AgentMode";
import { ICON_ITEMS, MOTION_ITEMS, PAGES, PAGE_ITEMS, PRODUCT_ITEMS, SYSTEM_ITEMS, VIDEO_ITEMS } from "@/lib/libraryItems";
import { Card } from "@/components/HomeCards";
import { openPhoneSearch } from "@/lib/phoneNav";
import HtmlTypewriter from "@/components/HtmlTypewriter";
import HomeGrid from "@/components/HomeGrid";
import HeroReel from "@/components/HeroReel";
import HomeHooks from "@/components/HomeHooks";
import { copyText } from "@/lib/copyText";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";

/**
 * HOME: the front door to every layer. A sticky bar with search across the
 * library; a compact dark hero; the hooks strip (every video and product,
 * the most-opened items at launch); a grid per layer (landing pages, design
 * systems, motion), each dealt at random with a card and a VIEW MORE button
 * into its section; a band that shows the one-shot prompt
 * every file ships with; and the wordmark. Cards copy their file on hover and
 * link into their section: pages open their dialog over home (a page on
 * phones), motion studies their lab, systems their board.
 */

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
    if (window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 1100px), (pointer: coarse) and (max-width: 1400px)").matches) {
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
            <Link to="/pages" className="home-badge">Copy. Remix. Ship It.</Link>
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
            {/* Phones: one line, one button into the library, search, and the sections (the mobile plan, item 5) */}
            <div className="home-phone-intro">
              <p className="home-phone-sub">{PAGE_ITEMS.length} landing pages, {SYSTEM_ITEMS.length} design systems and live motion, one HTML file each. Copy it, remix it, ship it.</p>
              <div className="home-phone-ctas">
                <Link to="/pages" className="home-phone-cta">Browse the library <ArrowRight size={16} aria-hidden="true" /></Link>
                <button type="button" className="home-phone-cta home-phone-cta--ghost" onClick={openPhoneSearch}><Search size={16} aria-hidden="true" /> Search</button>
              </div>
              <nav className="home-phone-chips" aria-label="Sections">
                {[["/pages", "Pages"], ["/systems", "Systems"], ["/motion", "Motion"], ["/videos", "Videos"], ["/icons", "Icons"], ["/products", "Products"]].map(([to, label]) => (
                  <Link key={to} to={to}>{label}</Link>
                ))}
              </nav>
            </div>
          </div>
          <HeroReel />
        </section>
        {/* Phones: the newest thing in every section, before the strip */}
        <section className="home-newest" aria-labelledby="home-newest-title">
          <h2 id="home-newest-title">New in the library</h2>
          <div className="home-newest-grid">
            {[PRODUCT_ITEMS[0], ICON_ITEMS[0], PAGE_ITEMS[0], SYSTEM_ITEMS[0], MOTION_ITEMS[0], VIDEO_ITEMS[0]].filter(Boolean).map((it) => (
              <Card key={it.key} item={it} onCopied={say} />
            ))}
          </div>
        </section>
        <AgentPanel />
        <HomeHooks />

        <HomeGrid
          id="pages"
          title="LANDING PAGES"
          sub="Production-ready landing pages. One file, no dependencies."
          all="/pages"
          pool={PAGE_ITEMS}
          noun="landing pages"
          onCopied={say}
        />
        <HomeGrid
          id="systems"
          title="DESIGN SYSTEMS"
          sub="Tokens and working components, extracted from real HTML."
          all="/systems"
          pool={SYSTEM_ITEMS}
          noun="design systems"
          onCopied={say}
        />
        <HomeGrid
          id="motion"
          title="MOTION STUDIES"
          sub="One movement per study, running live, taken apart in the lab."
          all="/motion"
          pool={MOTION_ITEMS}
          noun="motion studies"
          onCopied={say}
        />
        <HomeGrid
          id="icons"
          title="ICONS"
          sub="Animated icon sets. Every icon its own file, or copy the whole set."
          all="/icons"
          pool={ICON_ITEMS}
          noun="icon sets"
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
