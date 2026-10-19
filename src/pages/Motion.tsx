import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowUpRight, Check, Copy, ExternalLink, Maximize2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import MotionLab from "@/components/MotionLab";
import { EASES, easeRange } from "@/lib/eases";
import { AgentPanel } from "@/components/AgentMode";
import { getMotionBySlug, motions, type MotionEntry } from "@/data/motion";
import { shuffle } from "@/data/prompts";
import { copyText } from "@/lib/copyText";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useSeo } from "@/hooks/useSeo";

/**
 * /motion and /motion/:slug. Motion is shown running, not as a screenshot:
 * each item is a reel card whose stage plays the study live (only while it is
 * on screen) beside its choreography in miniature. From the list a study opens
 * as the lab in a dialog; a shared link, a refresh or a phone gets the lab as
 * a page of its own.
 */

const useCopy = () => {
  const [flash, setFlash] = useState("");
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  const copy = async (key: string, text: string | (() => Promise<string>)) => {
    await copyText(typeof text === "string" ? text : await text());
    setFlash(key);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setFlash(""), 1800);
  };
  return { flash, copy };
};

const demoCode = (m: MotionEntry) => async () => (await fetch(m.demo)).text();

/** The lab's actions: the same in the dialog and on the page */
const LabActions = ({ motion }: { motion: MotionEntry }) => {
  const { flash, copy } = useCopy();
  return (
    <div className="mlab-actions">
      <button className="pmodal-btn pmodal-btn--solid" onClick={() => copy("code", demoCode(motion))} aria-live="polite">
        {flash === "code" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
        <span className="pmodal-label">{flash === "code" ? "COPIED" : "COPY CODE"}</span>
      </button>
      <a className="pmodal-btn" href={motion.demo} target="_blank" rel="noreferrer">
        <Maximize2 size={12} aria-hidden="true" />
        <span className="pmodal-label">FULL SCREEN</span>
        <ExternalLink size={11} aria-hidden="true" />
      </a>
      <ul className="smodal-tags" aria-label="Characteristics">
        {motion.tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
};

const kicker = (m: MotionEntry) =>
  `MOTION · ${m.kind} · ${m.library.name} ${m.library.version} · ${m.elements} ELEMENTS`;

/** The reel card's choreography in miniature: every track, one playhead (pure CSS) */
const MiniChoreo = ({ motion }: { motion: MotionEntry }) => (
  <div className="mo-mini" aria-hidden="true">
    {motion.tracks.map((t, i) => (
      <span key={i} className="mo-mini-row">
        <i style={{ left: `${t.start * 100}%`, width: `${(t.end - t.start) * 100}%` }} />
      </span>
    ))}
    <b className="mo-mini-head" style={{ animationDuration: `${motion.drawSeconds}s` }} />
  </div>
);

const MiniEase = ({ ease }: { ease: keyof typeof EASES }) => {
  const f = EASES[ease];
  const [lo, hi] = easeRange(f);
  const d = Array.from({ length: 49 }, (_, i) => `${i ? "L" : "M"}${(i / 48) * 40} ${40 - ((f(i / 48) - lo) / (hi - lo)) * 40}`).join(" ");
  return (
    <span className="mo-ease" title={ease}>
      <svg viewBox="-2 -2 44 44" aria-hidden="true">
        <path d={d} />
      </svg>
      {ease}
    </span>
  );
};

const ReelCard = ({ motion }: { motion: MotionEntry }) => {
  const stage = useRef<HTMLAnchorElement>(null);
  const [live, setLive] = useState(false);
  const { flash, copy } = useCopy();
  const href = `/motion/${motion.slug}`;
  // Desktop opens the lab as a dialog over the list; a phone opens it as a page
  const phone = useIsPhone();
  const state = phone ? undefined : { fromList: true };

  // The stage only runs while it is on screen
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const eases = [...new Set(motion.tracks.map((t) => t.ease))].filter((e) => e !== "none");

  return (
    <article className="mo-card" aria-labelledby={`mo-${motion.slug}`}>
      {/* The stage is a second way into the lab; the title link is the one announced */}
      <Link to={href} state={state} className="mo-stage" ref={stage} tabIndex={-1} aria-hidden="true">
        <img src={motion.poster} alt="" width={1200} height={600} loading="lazy" decoding="async" />
        {live && <iframe src={`${motion.demo}?autoplay=${motion.reelAutoplay}`} title="" tabIndex={-1} aria-hidden="true" loading="lazy" />}
        <span className="mo-live">
          <i aria-hidden="true" /> {live ? "LIVE" : "PAUSED"}
        </span>
      </Link>

      <div className="mo-spec">
        <p className="mo-kicker">
          MOTION · {motion.kind}
        </p>
        <h2 className="mo-title" id={`mo-${motion.slug}`}>
          <Link to={href} state={state} className="mo-link">
            {motion.title}
          </Link>
        </h2>
        <p className="mo-tagline">{motion.tagline}</p>

        <div className="mo-chor">
          <span className="mo-label">
            CHOREOGRAPHY · {motion.tracks.length} TRACKS · {motion.life}s × {motion.elements}
          </span>
          <MiniChoreo motion={motion} />
        </div>

        <div className="mo-facts">
          {eases.map((e) => (
            <MiniEase key={e} ease={e} />
          ))}
          {motion.stagger !== undefined && (
            <span className="mo-fact">
              <b>{motion.stagger}s</b> STAGGER
            </span>
          )}
          <span className="mo-fact">
            <b>{motion.inputs.length}</b> INPUTS
          </span>
        </div>

        <p className="mo-stack">
          {[`${motion.library.name} ${motion.library.version}`, ...motion.library.plugins].join(" · ")}
        </p>

        <div className="mo-actions">
          <button className="sys-row-btn" onClick={() => copy("prompt", motion.prompt)} aria-live="polite">
            {flash === "prompt" ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
            <span>{flash === "prompt" ? "COPIED" : "COPY PROMPT"}</span>
          </button>
          <Link to={href} state={state} className="sys-row-btn sys-row-btn--solid">
            <span>OPEN THE LAB</span> <ArrowUpRight size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

/* A new order on every page load, like the home feed and SYSTEMS. A plain
   shuffle: with only a few studies, dealing light and dark alternately would
   leave just one or two possible orders. Kept for the visit, so opening and
   closing a study's dialog, which changes the route, doesn't reshuffle it. */
let dealt: MotionEntry[] | null = null;
const order = () => (dealt ??= shuffle(motions));

const MotionModal = ({ motion, onClose }: { motion: MotionEntry; onClose: () => void }) => (
  <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="pmodal-overlay" />
      <Dialog.Content className="pmodal-dialog smodal mmodal" aria-describedby="mmodal-desc">
        <header className="pmodal-head">
          <div className="pmodal-headings">
            <p className="pmodal-kicker">{kicker(motion)}</p>
            <Dialog.Title className="pmodal-title">{motion.title}</Dialog.Title>
            <Dialog.Description className="pmodal-desc" id="mmodal-desc">
              {motion.description}
            </Dialog.Description>
          </div>
          <Dialog.Close className="pmodal-close" aria-label="Close">
            <X size={18} />
          </Dialog.Close>
        </header>
        <LabActions motion={motion} />
        <div className="smodal-frame-wrap">
          <div className="smodal-scroll" tabIndex={0} aria-label={`${motion.title} motion lab`}>
            <MotionLab motion={motion} variant="modal" />
          </div>
        </div>
        <footer className="smodal-foot">
          <span>THE STAGE IS THE REAL FILE · SPEED AND EVERY KNOB ARE SENT TO IT LIVE</span>
          <span className="pmodal-hint">SCROLL FOR THE BREAKDOWN · ESC close</span>
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const MotionPage = ({ motion }: { motion: MotionEntry }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="mlab-page">
      <Link to="/motion" className="mlab-back">
        <ArrowLeft size={12} aria-hidden="true" /> ALL MOTION
      </Link>
      <header className="mlab-page-head">
        <p className="pmodal-kicker">{kicker(motion)}</p>
        <h1 className="mlab-page-title">{motion.title}</h1>
        <p className="mlab-page-desc">{motion.description}</p>
      </header>
      <LabActions motion={motion} />
      <MotionLab motion={motion} variant="page" />
    </main>
  </div>
);

const Motion = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const phone = useIsPhone();
  const open = getMotionBySlug(slug);
  const fromList = Boolean((location.state as { fromList?: boolean } | null)?.fromList);
  useAgentDark();

  useSeo({
    title: open ? `${open.title} · Motion Study` : "Motion",
    description: open
      ? `${open.tagline}. Live, slowed down and taken apart: the timeline, the eases, the inputs, and the one-shot prompt that builds it.`
      : "Motion studies, one movement each: live, slowed down and taken apart, with the one-shot prompt that builds them.",
    canonical: open ? `/motion/${open.slug}` : "/motion",
    image: open?.poster,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/motion" replace />;
  // A shared link, a refresh or a phone: the lab is the page
  if (open && (!fromList || phone)) return <MotionPage motion={open} />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="motion"
          kicker={`${motions.length} STUDIES · LIVE · TAKEN APART`}
          title="MOTION STUDIES"
          description="One movement per study, running live. Slow it down, step through it, and see the timeline, the eases and the inputs behind it."
        />
        <AgentPanel />

        <div className="mo-list">
          {order().map((m) => (
            <ReelCard key={m.slug} motion={m} />
          ))}
          <p className="sys-list-foot">
            <span>A page is where it lands. A motion study is how it moves.</span>
            <span>More studies are being cut from the library.</span>
          </p>
        </div>
      </main>
      {open && <MotionModal motion={open} onClose={() => navigate("/motion")} />}
    </div>
  );
};

export default Motion;
