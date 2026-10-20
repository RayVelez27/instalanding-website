import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowUpRight, Check, ChevronLeft, ChevronRight, Copy, ExternalLink, Layers, LayoutGrid, Maximize2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import FilterRow from "@/components/FilterRow";
import ViewToggle from "@/components/ViewToggle";
import { useViewPref } from "@/hooks/useViewPref";
import LibraryCard from "@/components/LibraryCard";
import { rankTags, systemTagsOf } from "@/lib/feedTags";
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

const ReelCard = ({ motion, deck = false }: { motion: MotionEntry; deck?: boolean }) => {
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
    <article className={`mo-card${deck ? " mo-card--deck" : ""}`} aria-labelledby={`mo-${motion.slug}`}>
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
          <button className="sys-row-btn" onClick={() => copy("code", demoCode(motion))} aria-live="polite">
            {flash === "code" ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
            <span>{flash === "code" ? "COPIED" : "COPY CODE"}</span>
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

/* The DECK view: one study at a time, the next two stacked behind it. Arrows
   (and the arrow keys) on desktop; on a phone, swipe the card away. Left goes
   to the next study, right to the previous one, and the deck wraps round. A
   drag never counts as a click, so a swipe can't open the lab by accident. */
const SWIPE = 90;
const FLY_MS = 280;

const MotionDeck = ({ list }: { list: MotionEntry[] }) => {
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<0 | 1 | -1>(0);
  const drag = useRef({ id: -1, x: 0, y: 0, moved: false, scroll: false });
  const timer = useRef<number>();
  const n = list.length;
  const at = (k: number) => list[((k % n) + n) % n];
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = (dir: 1 | -1) => {
    if (leaving || n < 2) return;
    if (reduced) {
      setI((v) => v + dir);
      setDx(0);
      return;
    }
    setLeaving(dir);
    timer.current = window.setTimeout(() => {
      setI((v) => v + dir);
      setLeaving(0);
      setDx(0);
    }, FLY_MS);
  };
  const goRef = useRef(go);
  goRef.current = go;
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Arrow keys, unless the lab dialog is open or a field has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.querySelector('[role="dialog"]')) return;
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      goRef.current(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (leaving || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, scroll: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId || d.scroll) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.moved) {
      if (Math.abs(my) > 8 && Math.abs(my) > Math.abs(mx)) {
        d.scroll = true; // a vertical move is the page scrolling, not a swipe
        return;
      }
      if (Math.abs(mx) < 6) return;
      d.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone */
      }
    }
    setDx(mx);
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;
    if (!d.moved) return;
    if (Math.abs(dx) > SWIPE) go(dx < 0 ? 1 : -1);
    else setDx(0);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  if (!n) return null;
  const top = at(i);
  const pull = Math.min(Math.abs(dx) / 300, 1);
  const dragging = drag.current.moved && !leaving;
  const topStyle: React.CSSProperties = leaving
    ? { transform: `translateX(${-leaving * 130}%) rotate(${-leaving * 14}deg)`, opacity: 0, transition: `transform ${FLY_MS}ms ease-in, opacity ${FLY_MS}ms ease-in` }
    : { transform: `translateX(${dx}px) rotate(${dx / 24}deg)`, transition: dragging ? "none" : "transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)" };

  return (
    <section className="mo-deck" aria-roledescription="carousel" aria-label="Motion studies, one at a time">
      <div className="mo-deck-stage">
        <button type="button" className="mo-deck-arrow mo-deck-arrow--prev" onClick={() => go(-1)} aria-label="Previous study" disabled={n < 2}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="mo-deck-stack">
          {n > 2 && (
            <div className="mo-deck-ghost" style={{ transform: `translateY(${28 - pull * 14}px) scale(${0.9 + pull * 0.05})` }} aria-hidden="true">
              <img src={at(i + 2).poster} alt="" loading="lazy" decoding="async" />
            </div>
          )}
          {n > 1 && (
            <div className="mo-deck-ghost" style={{ transform: `translateY(${14 - pull * 14}px) scale(${0.95 + pull * 0.05})` }} aria-hidden="true">
              <img src={at(i + 1).poster} alt="" loading="lazy" decoding="async" />
            </div>
          )}
          <div
            className="mo-deck-top"
            style={topStyle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            onClickCapture={onClickCapture}
            onDragStart={(e) => e.preventDefault()}
            aria-roledescription="slide"
            aria-label={`${(((i % n) + n) % n) + 1} of ${n}: ${top.title}`}
          >
            <ReelCard key={top.slug} motion={top} deck />
          </div>
        </div>

        <button type="button" className="mo-deck-arrow mo-deck-arrow--next" onClick={() => go(1)} aria-label="Next study" disabled={n < 2}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>

      <div className="mo-deck-bar">
        <button type="button" className="mo-deck-step" onClick={() => go(-1)} aria-label="Previous study" disabled={n < 2}>
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="mo-deck-count" aria-live="polite">
          {String((((i % n) + n) % n) + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button type="button" className="mo-deck-step" onClick={() => go(1)} aria-label="Next study" disabled={n < 2}>
          <ChevronRight size={16} aria-hidden="true" />
        </button>
        <span className="mo-deck-hint">
          <span className="mo-deck-hint--desk">← → OR DRAG THE CARD</span>
          <span className="mo-deck-hint--phone">SWIPE FOR THE NEXT ONE</span>
        </span>
      </div>
    </section>
  );
};

/** The GRID tile: the poster, and on hover the same actions as a page tile */
const MotionTile = ({ motion }: { motion: MotionEntry }) => {
  const phone = useIsPhone();
  const href = `/motion/${motion.slug}`;
  const state = phone ? undefined : { fromList: true };
  return (
    <LibraryCard
      kind="motion"
      title={motion.title}
      sub={`${motion.kind.toLowerCase()} · ${motion.tracks.length} tracks · ${motion.life}s`}
      to={href}
      state={state}
      image={motion.poster}
      live={`${motion.demo}?autoplay=${Math.min(motion.reelAutoplay, 2000)}`}
      copy={demoCode(motion)}
      onPointerEnter={() => {
        fetch(motion.demo).catch(() => {});
      }}
    />
  );
};


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
  const [view, pickView, canSwitch] = useViewPref("il-motion-view", "deck");
  const [filter, setFilter] = useState("all");
  const tags = useMemo(() => rankTags(motions.map(systemTagsOf)), []);
  const shown = filter === "all" ? order() : order().filter((m) => systemTagsOf(m).includes(filter));

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
        {canSwitch && (
          <ViewToggle
            view={view}
            onPick={pickView}
            options={[
              { id: "grid", label: "GRID", Icon: LayoutGrid, note: "Every study at once" },
              { id: "deck", label: "DECK", Icon: Layers, note: "One study at a time, live" },
            ]}
          />
        )}
        {view === "grid" && (
          <RouteBanner
            tone="motion"
            title="MOTION STUDIES"
            description="One movement per study, running live. Slow it down, step through it, see the timeline, eases and inputs behind it."
          />
        )}
        <AgentPanel />

        <div className={`media-grid layer-grid${view === "grid" ? "" : " media-grid--view"}`}>
          {view === "grid" ? (
            <>
              <FilterRow tags={tags} total={motions.length} active={filter} onPick={setFilter} label="Filter motion studies" />
              <div className="card-grid">
                {shown.map((m) => (
                  <MotionTile key={m.slug} motion={m} />
                ))}
              </div>
            </>
          ) : (
            <MotionDeck list={order()} />
          )}
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
