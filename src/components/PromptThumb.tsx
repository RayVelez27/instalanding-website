import { useEffect, useRef, useState } from "react";
import PreviewMock from "@/components/PreviewMock";
import type { PromptEntry } from "@/data/prompts";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * A preview clip that starts itself when it scrolls into view.
 *
 * Clips cut to loop seamlessly (`videoLoop`) run continuously; the rest play
 * once, because a reveal's payoff is its last frame — those replay on hover so
 * a second look never needs a reload. Under reduced motion nothing plays at
 * all and the poster frame stands in.
 */
const PromptVideo = ({ entry, eager }: { entry: PromptEntry; eager: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(prefersReducedMotion);

  useEffect(() => {
    const video = ref.current;
    if (!video || still) return;

    const play = () => video.play().catch(() => {});
    if (eager) play();

    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const view of entries) {
          if (view.isIntersecting) play();
          else video.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, [eager, still]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setStill(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const replay = () => {
    const video = ref.current;
    if (!video || still || entry.videoLoop) return;
    if (video.ended || video.paused) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  return (
    <video
      ref={ref}
      className={`prompt-thumb prompt-thumb--video prompt-thumb--${entry.videoAspect ?? "portrait"}`}
      src={still ? undefined : entry.video}
      poster={entry.thumbnail}
      loop={entry.videoLoop ?? false}
      muted
      playsInline
      preload={eager ? "auto" : "metadata"}
      // No controls and no audio track: this is a thumbnail, not a player.
      aria-label={`${entry.title} preview`}
      onMouseEnter={replay}
      onFocus={replay}
    />
  );
};

/**
 * A prompt's visual: a preview clip when the entry ships one, a real screenshot
 * when it ships that, otherwise the CSS wireframe mock.
 */
const PromptThumb = ({ entry, eager = false }: { entry: PromptEntry; eager?: boolean }) => {
  if (entry.video) return <PromptVideo entry={entry} eager={eager} />;
  if (entry.thumbnail) {
    return (
      <img
        className="prompt-thumb"
        src={entry.thumbnail}
        alt={`${entry.title} preview`}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return <PreviewMock kind={entry.preview} />;
};

export default PromptThumb;
