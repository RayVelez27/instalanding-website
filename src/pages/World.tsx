import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import { visiblePrompts, type PromptEntry } from "@/data/prompts";
import { mobileThumbFor } from "@/data/mobileThumbs";
import { useIsPhone } from "@/hooks/useIsPhone";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";
import type { WorldHandle, WorldItem } from "@/components/world/engine";

/**
 * /world. The PAGES library as an isometric factory floor: walk the builder
 * bot between the pods and open any page in the usual prompt dialog. The
 * three.js engine is its own chunk, loaded only here. Pages you have opened
 * are remembered in this browser and light up on the minimap.
 */

const ACCENTS = ["#ff6a1a", "#a7bb8c", "#7f8cff", "#e8c36a", "#4fd1c5", "#ff5f8f", "#c9a064", "#73a7ff"];
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Newest first, so the latest drops stand nearest the spawn pad */
const floorEntries = (): PromptEntry[] =>
  visiblePrompts
    .filter((p) => p.thumbnail)
    .map((p, i) => ({ p, i, t: Date.parse(p.added) || 0 }))
    .sort((a, b) => b.t - a.t || a.i - b.i)
    .map(({ p }) => p);

const VISITED_KEY = "il-world-visited";
const readVisited = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(VISITED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
};

const World = () => {
  const entries = useMemo(floorEntries, []);
  const items = useMemo<WorldItem[]>(
    () =>
      entries.map((p) => ({
        slug: p.slug,
        title: p.title,
        thumb: p.thumbnail!,
        phone: mobileThumbFor(p.thumbnail!),
        accent: ACCENTS[Math.abs(hash(p.slug)) % ACCENTS.length],
        added: p.added,
      })),
    [entries]
  );

  const navigate = useNavigate();
  const location = useLocation();
  const phone = useIsPhone();
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tags = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLCanvasElement>(null);
  const world = useRef<WorldHandle | null>(null);
  const visited = useRef(readVisited());
  const [active, setActive] = useState<number | null>(null);
  const [seen, setSeen] = useState(visited.current.size);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const touch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useSeo({
    title: "World",
    description: "Walk the InstaLanding library as an isometric factory floor: every landing page stands on its own pod. Walk up to one and open it.",
    canonical: "/world",
  });

  // The engine reads these through refs, so it never has to be rebuilt
  const openRef = useRef<(i: number) => void>(() => {});
  openRef.current = (i: number) => {
    const item = items[i];
    if (!item) return;
    visited.current.add(item.slug);
    try {
      localStorage.setItem(VISITED_KEY, JSON.stringify([...visited.current]));
    } catch {
      /* private window: remembered for this visit only */
    }
    setSeen(visited.current.size);
    track("open_template", { template: item.slug, from: "world" });
    navigate(`/prompt/${item.slug}`, { state: phone ? undefined : { backgroundLocation: location } });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ createWorld }] = await Promise.all([
          import("@/components/world/engine"),
          // the floor signs are drawn in the pixel face, so it has to be in first
          document.fonts.load('700 40px "Silk"').catch(() => []),
          document.fonts.load('400 40px "Silk"').catch(() => []),
        ]);
        if (cancelled || !canvas.current || !tags.current) return;
        world.current = createWorld({
          canvas: canvas.current,
          tagLayer: tags.current,
          minimap: map.current,
          items,
          visited: () => visited.current,
          reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          hooks: {
            onActive: setActive,
            onOpen: (i) => openRef.current(i),
            onReady: () => setReady(true),
          },
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
      world.current?.dispose();
      world.current = null;
    };
  }, [items]);

  const current = active !== null ? items[active] : null;

  return (
    <div className="app-layout world-page">
      <Sidebar />
      <main>
        <SiteTopBar />
        <section className="world" aria-labelledby="world-title">
          <div
            className="world-stage"
            ref={stage}
            role="application"
            aria-label="The library as a factory floor. Move with WASD or the arrow keys, press E to open the page you are standing at."
          >
            <canvas ref={canvas} className="world-canvas" aria-hidden="true" />
            <div className="world-vignette" aria-hidden="true" />
            <div className="world-tags" ref={tags} aria-hidden="true" />

            <div className="world-hud world-hud--tl">
              <h1 id="world-title" className="world-t1">LANDING PAGE FACTORY</h1>
              <div className="world-t2">WORLD &middot; {items.length} PAGES ON THE FLOOR</div>
            </div>

            <div className="world-hud world-hud--tr">
              <div>
                VISITED <span className="world-count">{seen}</span>/{items.length}
              </div>
              <div className="world-bar" aria-hidden="true">
                <b style={{ width: `${(seen / Math.max(1, items.length)) * 100}%` }} />
              </div>
              <canvas ref={map} className="world-map" aria-hidden="true" />
            </div>

            <div className={`world-hud world-card${current ? " is-on" : ""}`} aria-live="polite">
              {current ? (
                <>
                  <div className="world-k">
                    POD {String(active! + 1).padStart(2, "0")} &middot; {current.added.toUpperCase()}
                  </div>
                  <div className="world-n">{current.title}</div>
                  <div className="world-bar world-bar--hp" aria-hidden="true">
                    <b style={{ background: current.accent }} />
                  </div>
                  <button type="button" className="world-open" onClick={() => world.current?.interact()}>
                    OPEN {touch ? "" : <kbd>E</kbd>}
                  </button>
                </>
              ) : (
                <>
                  <div className="world-k">NO POD</div>
                  <div className="world-s">{touch ? "TAP A POD TO WALK TO IT" : "WALK ONTO A POD, OR CLICK ONE"}</div>
                </>
              )}
            </div>

            <div className="world-hud world-keys">
              {!touch && (
                <div className="world-legend" aria-hidden="true">
                  <span><kbd>WASD</kbd> MOVE</span>
                  <span><kbd>SHIFT</kbd> RUN</span>
                  <span><kbd>E</kbd> OPEN</span>
                </div>
              )}
              <div className="world-zoom">
                <button type="button" aria-label="Zoom in" onClick={() => world.current?.zoom(1)}>
                  <Plus size={14} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Zoom out" onClick={() => world.current?.zoom(-1)}>
                  <Minus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            {!ready && (
              <div className="world-boot" role="status">
                {failed ? "THE FACTORY NEEDS WEBGL. BROWSE THE PAGES BELOW." : "POWERING UP THE FLOOR…"}
              </div>
            )}
          </div>

          {/* Every pod as a plain link, for keyboards and screen readers (and if WebGL is off) */}
          <nav className={failed ? "world-list" : "sr-only"} aria-label="Pages on the floor">
            <ul>
              {entries.map((p) => (
                <li key={p.slug}>
                  <Link to={`/prompt/${p.slug}`} state={phone ? undefined : { backgroundLocation: location }}>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </main>
    </div>
  );
};

export default World;
