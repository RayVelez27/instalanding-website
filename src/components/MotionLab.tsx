import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import type { EaseName, MotionEntry } from "@/data/motion";
import { EASES, easeRange } from "@/lib/eases";
import { getPromptBySlug, type PromptEntry } from "@/data/prompts";
import { getSystemForTemplate, type SystemEntry } from "@/data/systems";

/**
 * The MOTION lab: a motion study taken apart. The live demo runs in a framed
 * stage the lab drives over postMessage (slow motion, stepping, autoplay and
 * the study's own knobs and toggles), and beside it the choreography is drawn
 * from the entry's data: the tracks of one life on a timeline, the eases as
 * curves, the stagger when elements share a life, the inputs and the trick.
 * A shared playhead runs through the timeline and the curves.
 */

const SPEEDS = [0.1, 0.25, 0.5, 1];

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Maps an ease's value into a box, leaving room for overshoot (elastic) */
const fitter = (ease: EaseName) => {
  const f = EASES[ease];
  const [lo, hi] = easeRange(f);
  return { f, y: (v: number, top: number, bottom: number) => bottom - ((v - lo) / (hi - lo)) * (bottom - top) };
};

/** A track's ease drawn inside its bar (yoyo tracks go up and back down) */
const BarCurve = ({ ease, yoyo }: { ease: EaseName; yoyo?: boolean }) => {
  const { f, y } = fitter(ease);
  const pts = Array.from({ length: 49 }, (_, i) => {
    const u = i / 48;
    const v = yoyo ? f(u < 0.5 ? u * 2 : 2 - u * 2) : f(u);
    return `${(u * 100).toFixed(2)},${y(v, 2, 22).toFixed(2)}`;
  });
  return (
    <svg className="mlab-barcurve" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts.join(" ")} vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

/** One ease as a curve with a dot riding it (moved by the shared playhead) */
const EaseGraph = ({ ease, dot }: { ease: EaseName; dot: (el: SVGCircleElement | null) => void }) => {
  const { f, y } = fitter(ease);
  const d = Array.from({ length: 97 }, (_, i) => {
    const u = i / 96;
    return `${i ? "L" : "M"}${(8 + u * 84).toFixed(2)} ${y(f(u), 8, 92).toFixed(2)}`;
  }).join(" ");
  const y0 = y(0, 8, 92).toFixed(2);
  const y1 = y(1, 8, 92).toFixed(2);
  return (
    <svg className="mlab-ease-svg" viewBox="0 0 100 100" aria-hidden="true">
      <path className="mlab-ease-grid" d={`M8 ${y0}H92M8 8V92`} />
      <path className="mlab-ease-diag" d={`M8 ${y0}L92 ${y1}M8 ${y1}H92`} />
      <path className="mlab-ease-line" d={d} />
      <circle ref={dot} r="3.4" cx="8" cy={y0} />
    </svg>
  );
};

interface Props {
  motion: MotionEntry;
  /** "modal" sizes the stage to the dialog; "page" gives it more room */
  variant: "modal" | "page";
}

const MotionLab = ({ motion, variant }: Props) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const [speed, setSpeed] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const initialKnobs = () => Object.fromEntries(motion.knobs.map((k) => [k.id, k.value]));
  const initialToggles = () => Object.fromEntries(motion.toggles.map((t) => [t.id, t.value]));
  const [knobs, setKnobs] = useState<Record<string, number>>(initialKnobs);
  const [toggles, setToggles] = useState<Record<string, boolean>>(initialToggles);
  const [status, setStatus] = useState(motion.status);

  const send = (type: string, value: unknown) =>
    frame.current?.contentWindow?.postMessage({ source: "il-motion", type, value }, "*");

  // The demo reports a status line (which element is centred, which is open, how hard it is moving)
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      const d = e.data;
      if (d?.source === "il-motion-demo" && d.type === "status" && typeof d.text === "string") setStatus(d.text);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // A reloaded frame starts from its defaults, so hand it the lab's settings again
  const resync = () => {
    send("speed", speed);
    for (const [id, v] of Object.entries(knobs)) send(id, v);
    for (const [id, v] of Object.entries(toggles)) send(id, v);
    send("autoplay", autoplay);
  };

  // The shared playhead: one pass of the drawn life, scaled by SPEED
  const head = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const dots = useRef<Partial<Record<EaseName, SVGCircleElement | null>>>({});
  const speedRef = useRef(speed);
  speedRef.current = speed;
  useEffect(() => {
    let raf = 0;
    let t = 0.5;
    let last = performance.now();
    const fits = Object.fromEntries((Object.keys(EASES) as EaseName[]).map((e) => [e, fitter(e)])) as Record<EaseName, ReturnType<typeof fitter>>;
    const paint = () => {
      head.current?.style.setProperty("--t", t.toFixed(4));
      motion.tracks.forEach((tr, i) => rows.current[i]?.classList.toggle("is-on", t >= tr.start && t <= tr.end));
      for (const [name, el] of Object.entries(dots.current) as [EaseName, SVGCircleElement | null][]) {
        if (!el) continue;
        const { f, y } = fits[name];
        el.setAttribute("cx", (8 + t * 84).toFixed(2));
        el.setAttribute("cy", y(f(t), 8, 92).toFixed(2));
      }
    };
    if (reduced()) {
      paint();
      return;
    }
    const tick = (now: number) => {
      t = (t + ((now - last) / 1000 / motion.drawSeconds) * speedRef.current) % 1;
      last = now;
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  const eases = [...new Set(motion.tracks.map((t) => t.ease))].filter((e) => e !== "none");
  const pairs = motion.pairsWith.map((s) => getPromptBySlug(s)).filter((p): p is PromptEntry => !!p);
  const systems = [...new Map(pairs.flatMap((p) => getSystemForTemplate(p.slug) ?? []).map((s) => [s.slug, s] as [string, SystemEntry])).values()];
  const ratio = motion.drawSeconds / motion.life;
  const pace =
    Math.abs(ratio - 1) < 0.05 ? "AT REAL SPEED" : ratio > 1 ? `DRAWN ${+ratio.toFixed(1)}× SLOWER` : `DRAWN ${+(1 / ratio).toFixed(1)}× FASTER`;
  const edited =
    speed !== 1 || motion.knobs.some((k) => knobs[k.id] !== k.value) || motion.toggles.some((t) => toggles[t.id] !== t.value);

  return (
    <div className={`mlab mlab--${variant}`}>
      {/* 01 · the stage */}
      <section className="mlab-panel mlab-stage-panel" aria-label="Live stage">
        <div className="mlab-panel-head">
          <span className="mlab-n">01</span> LIVE STAGE
          <span className="mlab-centre" aria-live="polite">
            {status}
          </span>
        </div>
        <div className="mlab-stage">
          <iframe ref={frame} src={motion.demo} title={`${motion.title}, live demo`} onLoad={resync} />
        </div>
        <div className="mlab-transport">
          <div className="mlab-group" role="group" aria-label="Step">
            <button className="mlab-btn" onClick={() => send("step", -1)} aria-label={motion.stepLabels[0]} title={motion.stepLabels[0]}>
              <ChevronLeft size={14} />
            </button>
            <button className="mlab-btn" onClick={() => send("step", 1)} aria-label={motion.stepLabels[1]} title={motion.stepLabels[1]}>
              <ChevronRight size={14} />
            </button>
          </div>
          <button
            className="mlab-btn"
            aria-pressed={autoplay}
            onClick={() => {
              setAutoplay(!autoplay);
              send("autoplay", !autoplay);
            }}
          >
            {autoplay ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
            {autoplay ? "PAUSE" : "AUTOPLAY"}
          </button>
          <div className="mlab-group mlab-speed" role="group" aria-label="Playback speed">
            <span className="mlab-label">SPEED</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                className="mlab-btn"
                aria-pressed={speed === s}
                onClick={() => {
                  setSpeed(s);
                  send("speed", s);
                }}
              >
                {s}×
              </button>
            ))}
          </div>
          <span className="mlab-hint">{motion.inputs.map((i) => i.keys[0]).join(" · ")} INSIDE THE STAGE</span>
        </div>
      </section>

      {/* 02 · the choreography */}
      <section className="mlab-panel mlab-chor" aria-label="Choreography">
        <div className="mlab-panel-head">
          <span className="mlab-n">02</span> CHOREOGRAPHY · {motion.lifeLabel}
          <span className="mlab-sub">
            {motion.life}s · {pace}
            {speed !== 1 ? ` · ${speed}×` : ""}
          </span>
        </div>
        <div className="mlab-tl" ref={head}>
          <div className="mlab-tl-scale" aria-hidden="true">
            {[0, 0.25, 0.5, 0.75, 1].map((s) => (
              <span key={s} style={{ left: `${s * 100}%` }}>
                {+(s * motion.life).toFixed(2)}s
              </span>
            ))}
          </div>
          <ol className="mlab-tracks">
            {motion.tracks.map((tr, i) => (
              <li key={i} ref={(el) => (rows.current[i] = el)} className="mlab-track">
                <span className="mlab-track-name">
                  <b>{tr.prop}</b>
                  <small>{tr.change}</small>
                </span>
                <span className="mlab-track-lane">
                  <span className="mlab-bar" style={{ left: `${tr.start * 100}%`, width: `${(tr.end - tr.start) * 100}%` }}>
                    <BarCurve ease={tr.ease} yoyo={tr.yoyo} />
                  </span>
                </span>
                <span className="mlab-track-ease">
                  {tr.ease}
                  {tr.yoyo ? " · yoyo" : ""}
                </span>
              </li>
            ))}
          </ol>
          <span className="mlab-playhead" aria-hidden="true" />
        </div>
        {motion.stagger !== undefined && (
          <div className="mlab-stagger" aria-label={`${motion.elements} elements, ${motion.stagger}s apart`}>
            <span className="mlab-label">STAGGER</span>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
              {Array.from({ length: motion.elements }, (_, i) => (
                <rect key={i} x={i * (motion.stagger ?? 0) * 100} y={i * (40 / motion.elements)} width={100 * motion.life} height="3" rx="1.5" />
              ))}
            </svg>
            <span className="mlab-stagger-note">
              ×{motion.elements} · {motion.stagger}s APART · A FULL CYCLE IS {(motion.stagger * motion.elements).toFixed(1)}s
            </span>
          </div>
        )}
      </section>

      {/* 03 · eases */}
      <section className="mlab-panel mlab-eases" aria-label="Eases">
        <div className="mlab-panel-head">
          <span className="mlab-n">03</span> EASES
        </div>
        <div className="mlab-ease-grid-wrap">
          {eases.map((e) => (
            <figure key={e} className="mlab-ease">
              <EaseGraph ease={e} dot={(el) => (dots.current[e] = el)} />
              <figcaption>
                <b>{e}</b>
                <small>{motion.tracks.filter((t) => t.ease === e).map((t) => t.prop).join(", ")}</small>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 04 · knobs */}
      <section className="mlab-panel mlab-knobs" aria-label="Tweak it live">
        <div className="mlab-panel-head">
          <span className="mlab-n">04</span> TWEAK IT LIVE
        </div>
        {motion.knobs.map((k) => (
          <div key={k.id}>
            <label className="mlab-knob">
              <span className="mlab-label">{k.label}</span>
              <input
                type="range"
                min={k.min}
                max={k.max}
                step={k.step}
                value={knobs[k.id]}
                onChange={(e) => {
                  setKnobs((prev) => ({ ...prev, [k.id]: +e.target.value }));
                  send(k.id, +e.target.value);
                }}
              />
              <output>
                {knobs[k.id]}
                {k.unit ?? ""}
              </output>
            </label>
            {k.note && <p className="mlab-knob-note">{k.note}</p>}
          </div>
        ))}
        {motion.toggles.map((t) => (
          <button
            key={t.id}
            className="mlab-btn"
            aria-pressed={toggles[t.id]}
            onClick={() => {
              setToggles((prev) => ({ ...prev, [t.id]: !prev[t.id] }));
              send(t.id, !toggles[t.id]);
            }}
          >
            {t.label} · {toggles[t.id] ? "ON" : "OFF"}
          </button>
        ))}
        <button
          className="mlab-btn mlab-reset"
          disabled={!edited}
          onClick={() => {
            const k = initialKnobs();
            const t = initialToggles();
            setKnobs(k);
            setToggles(t);
            setSpeed(1);
            send("speed", 1);
            for (const [id, v] of Object.entries(k)) send(id, v);
            for (const [id, v] of Object.entries(t)) send(id, v);
          }}
        >
          <RotateCcw size={11} aria-hidden="true" /> RESET
        </button>
      </section>

      {/* 05 · inputs */}
      <section className="mlab-panel mlab-inputs" aria-label="Inputs">
        <div className="mlab-panel-head">
          <span className="mlab-n">05</span> INPUTS
        </div>
        <ul>
          {motion.inputs.map((inp) => (
            <li key={inp.does}>
              <span className="mlab-keys">
                {inp.keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </span>
              <span>{inp.does}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 06 · the trick */}
      <section className="mlab-panel mlab-trick" aria-label="How it works">
        <div className="mlab-panel-head">
          <span className="mlab-n">06</span> THE TRICK · {motion.trick.title.toUpperCase()}
        </div>
        <ol>
          {motion.trick.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {/* 07 · use it */}
      <section className="mlab-panel mlab-use" aria-label="Use it">
        <div className="mlab-panel-head">
          <span className="mlab-n">07</span> USE IT
        </div>
        <dl>
          <div>
            <dt>STACK</dt>
            <dd>{[`${motion.library.name} ${motion.library.version}`, ...motion.library.plugins, "one HTML file"].join(" · ")}</dd>
          </div>
          <div>
            <dt>BEST FOR</dt>
            <dd>{motion.bestFor.join(" · ")}</dd>
          </div>
          {pairs.length > 0 && (
            <div>
              <dt>PAIRS WITH</dt>
              <dd className="mlab-pairs">
                {pairs.map((p) => (
                  <Link key={p.slug} to={`/prompt/${p.slug}`} className="mlab-pair">
                    {p.thumbnail && <img src={p.thumbnail} alt="" loading="lazy" decoding="async" />}
                    <span>{p.title}</span>
                  </Link>
                ))}
              </dd>
            </div>
          )}
          {systems.length > 0 && (
            <div>
              <dt>IN THE LANGUAGE OF</dt>
              <dd>
                {systems.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 && " · "}
                    <Link to={`/systems/${s.slug}`}>{s.name}</Link> design system
                  </span>
                ))}
              </dd>
            </div>
          )}
          {motion.credits.map((c) => (
            <div key={c.href}>
              <dt>BUILT ON</dt>
              <dd>
                <a href={c.href} target="_blank" rel="noreferrer">
                  {c.label}
                </a>{" "}
                — {c.note}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
};

export default MotionLab;
