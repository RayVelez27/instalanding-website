import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bot, Check, Copy, Eye, Play } from "lucide-react";
import { copyTextLater } from "@/lib/copyText";

/**
 * The library card, everywhere an item is listed: the HOME rails and the
 * PAGES, SYSTEMS and MOTION grids, on every width. The picture (2:1) opens
 * the item, and says so on hover with an eye in the middle; COPY CODE sits on
 * the picture and takes the hover for itself when the pointer is on it; the
 * title and a short line sit under it with an arrow. Phones show COPY CODE
 * all the time, since there is no hover to reveal it.
 *
 * With `frames`, hovering flicks through them (a system's components) with
 * story-style progress bars along the top.
 */
const FRAME_MS = 900;

export interface LibraryCardProps {
  kind: "page" | "motion" | "system";
  title: string;
  sub: string;
  to: string;
  /** Router state for the links (open as a dialog over the list) */
  state?: object;
  image?: string;
  /** Replaces the image (a video thumbnail, a wireframe) */
  art?: ReactNode;
  /** Hover frames, shown in turn; the first is the resting picture */
  frames?: string[];
  /** Resolves to the text COPY CODE puts on the clipboard; no button without it */
  copy?: () => Promise<string>;
  /** "COPY CODE" unless set (Agent Mode copies a task instead) */
  copyLabel?: string;
  agent?: boolean;
  onCopied?: (message: string) => void;
  /** A YouTube entry: a play badge on the picture */
  video?: boolean;
  onPointerEnter?: () => void;
}

const LibraryCard = ({ kind, title, sub, to, state, image, art, frames, copy, copyLabel = "COPY CODE", agent, onCopied, video, onPointerEnter }: LibraryCardProps) => {
  const [copied, setCopied] = useState(false);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [primed, setPrimed] = useState(false); // extra frames load on the first hover
  const copyTimer = useRef<number>();
  const many = !!frames && frames.length > 1;

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);
  useEffect(() => {
    if (!playing || !many) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % frames!.length), FRAME_MS);
    return () => window.clearInterval(id);
  }, [playing, many, frames]);

  const enter = (e: React.PointerEvent) => {
    onPointerEnter?.();
    if (!many || e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPrimed(true);
    setFrame(1);
    setPlaying(true);
  };
  const leave = () => {
    setPlaying(false);
    setFrame(0);
  };

  const doCopy = async () => {
    if (!copy) return;
    try {
      await copyTextLater(copy());
    } catch {
      return;
    }
    onCopied?.(agent ? "TASK COPIED" : "HTML COPIED");
    setCopied(true);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`home-card home-card--${kind}`} onPointerEnter={enter} onPointerLeave={leave}>
      <Link to={to} state={state} className="home-card-link" aria-label={`Open ${title}`}>
        <span className="home-card-art">
          {art ?? (image && <img src={image} alt="" width={1200} height={600} loading="lazy" decoding="async" />)}
          {many &&
            primed &&
            frames!.slice(1).map((src, i) => (
              <img key={src} className={`card-frame${frame === i + 1 ? " is-on" : ""}`} src={src} alt="" decoding="async" />
            ))}
          {many && (
            <span className={`card-frames${playing ? " is-playing" : ""}`} aria-hidden="true">
              {frames!.map((src, i) => (
                <i key={src} className={i < frame ? "is-done" : i === frame ? "is-on" : undefined} style={{ animationDuration: `${FRAME_MS}ms` }} />
              ))}
            </span>
          )}
          {video && (
            <span className="card-play" aria-hidden="true">
              <Play size={16} fill="currentColor" />
            </span>
          )}
          {/* Hover: the eye says the picture opens it; it steps back while COPY CODE is hovered */}
          <span className="home-eye" aria-hidden="true">
            <Eye size={20} strokeWidth={2.2} />
          </span>
        </span>
        <span className="home-card-text">
          <span>
            <b>{title}</b>
            <small>{sub}</small>
          </span>
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </Link>
      {copy && (
        <button type="button" className="home-quick" onClick={doCopy} aria-label={`${agent ? "Copy an agent task" : "Copy the HTML"} for ${title}`}>
          {copied ? (
            <Check size={11} strokeWidth={2.6} aria-hidden="true" />
          ) : agent ? (
            <Bot size={11} strokeWidth={2.4} aria-hidden="true" />
          ) : (
            <Copy size={11} strokeWidth={2.4} aria-hidden="true" />
          )}
          {copied ? "COPIED" : copyLabel}
        </button>
      )}
    </div>
  );
};

export default LibraryCard;
