import { Play } from "lucide-react";
import type { PromptEntry } from "@/data/prompts";

/**
 * A GOSPEL entry's video, for the prompt window and the standalone page.
 *
 * Plays inline through the privacy-mode YouTube player. When the rights holder
 * blocks embedding (`youtubeEmbed: false`) an embed only ever says "Video
 * unavailable", so the still stands in with a play button that opens YouTube.
 */
const VideoStage = ({ entry, className }: { entry: PromptEntry; className: string }) => {
  if (!entry.youtube) return null;
  const watch = `https://www.youtube.com/watch?v=${entry.youtube}`;

  if (entry.youtubeEmbed === false) {
    return (
      <a className={`${className} video-poster`} href={watch} target="_blank" rel="noreferrer" aria-label={`Watch ${entry.title} on YouTube`}>
        {entry.thumbnail && <img src={entry.thumbnail} alt="" decoding="async" />}
        <span className="video-poster-play" aria-hidden="true"><Play size={26} fill="currentColor" /></span>
        <span className="video-poster-note">PLAYS ON YOUTUBE</span>
      </a>
    );
  }

  return (
    <iframe
      key={entry.slug}
      className={className}
      src={`https://www.youtube-nocookie.com/embed/${entry.youtube}?rel=0&playsinline=1`}
      title={entry.title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
    />
  );
};

export default VideoStage;
