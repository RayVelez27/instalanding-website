import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { AgentPanel } from "@/components/AgentMode";
import { MOTION_ITEMS, PAGES, PAGE_ITEMS, PRODUCT_ITEMS, SYSTEM_ITEMS, VIDEO_ITEMS } from "@/lib/libraryItems";
import HtmlTypewriter from "@/components/HtmlTypewriter";
import HomeGrid from "@/components/HomeGrid";
import HeroReel from "@/components/HeroReel";
import { copyText } from "@/lib/copyText";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";

/**
 * HOME: the front door to every layer. A sticky bar with search across the
 * library; a compact dark hero; a grid per layer (landing pages, design
 * systems, motion, videos, products), each dealt at random with a card and a
 * VIEW MORE button into its section; a band that shows the one-shot prompt
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
          <HeroReel />
        </section>
        <AgentPanel />

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
          id="videos"
          title="VIDEOS"
          sub="Short videos rendered live in your browser, sound and all. No video files."
          all="/videos"
          pool={VIDEO_ITEMS}
          noun="videos"
          onCopied={say}
        />
        <HomeGrid
          id="products"
          title="PRODUCTS"
          sub="Product concepts you can actually operate. Every control works."
          all="/products"
          pool={PRODUCT_ITEMS}
          noun="products"
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
