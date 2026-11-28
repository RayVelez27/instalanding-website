import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { AgentPanel } from "@/components/AgentMode";
import { ICON_ITEMS, MOTION_ITEMS, PAGE_ITEMS, PRODUCT_ITEMS, SYSTEM_ITEMS, VIDEO_ITEMS } from "@/lib/libraryItems";
import HomeHero from "@/components/HomeHero";
import HomeFeature from "@/components/HomeFeature";
import HomeRow from "@/components/HomeRow";
import HomeAgents from "@/components/HomeAgents";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";

/**
 * HOME: the front door, curated rather than complete. The hero ("Give your
 * agent a design."): describe a page and the best match shows beside it, live,
 * ready to copy for an agent or download (HomeHero); "This week", one big
 * pick and two beside it; then one row per layer (pages, systems, motion,
 * products, videos, icons), numbered, four big cards in view that slide
 * sideways, dealt at random per visit; the "Built for agents" band; and the
 * wordmark. Phones get the same story stacked, and the rows become swipe rows
 * with the next card peeking in.
 */

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

        <HomeHero />
        <AgentPanel />

        <HomeFeature />
        <HomeRow
          n="01"
          id="pages"
          title="Landing pages"
          sub="Production-ready pages, one file each, with the prompt that builds them."
          all="/pages"
          pool={PAGE_ITEMS}
          noun="landing pages"
          onCopied={say}
        />
        <HomeRow
          n="02"
          id="systems"
          title="Design systems"
          sub="Tokens and working components, extracted from real pages."
          all="/systems"
          pool={SYSTEM_ITEMS}
          noun="design systems"
          onCopied={say}
        />
        <HomeRow
          n="03"
          id="motion"
          title="Motion studies"
          sub="One movement per study, running live, taken apart in the lab."
          all="/motion"
          pool={MOTION_ITEMS}
          noun="motion studies"
          onCopied={say}
        />
        <HomeRow
          n="04"
          id="products"
          title="Products"
          sub="Concepts you can operate. Every control works."
          all="/products"
          pool={PRODUCT_ITEMS}
          noun="products"
          onCopied={say}
        />
        <HomeRow
          n="05"
          id="videos"
          title="Videos"
          sub="Rendered live in your browser, in one HTML file."
          all="/videos"
          pool={VIDEO_ITEMS}
          noun="videos"
          onCopied={say}
        />
        <HomeRow
          n="06"
          id="icons"
          title="Icons"
          sub="Animated icon sets. Every icon its own file, or copy the whole set."
          all="/icons"
          pool={ICON_ITEMS}
          noun="icon sets"
          onCopied={say}
        />

        <HomeAgents onCopied={say} />

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
