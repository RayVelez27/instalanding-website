import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check, Code2, Copy, Download, ExternalLink, Eye, Play, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import LibraryCard from "@/components/LibraryCard";
import DemoCode from "@/components/DemoCode";
import { AgentPanel } from "@/components/AgentMode";
import { videos, getVideoBySlug, type VideoEntry } from "@/data/videos";
import { asPage, fileSize as size, readableSource as readable } from "@/lib/bigDemo";
import { loadDemoSource } from "@/lib/demoSource";
import { useCopyCode } from "@/lib/useCopyCode";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";
import { useIsCompact } from "@/hooks/useIsCompact";
import ItemSheet, { SheetCarousel, SheetRow } from "@/components/ItemSheet";
import { isRecent, shortDate } from "@/lib/sheetDates";

/**
 * /videos and /videos/:slug. A video renders live in the browser from one
 * HTML file. The dialog plays it in a 16:9 screen (the video's own title card
 * has the Play button, since browsers only start sound after a click), or
 * shows its source on CODE, like PAGES. COPY CODE copies the whole file;
 * DOWNLOAD saves it, for apps that choke on a multi-megabyte paste.
 */

const VideoModal = ({ entry, onClose, onGo }: { entry: VideoEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const page = useMemo(() => asPage(entry, "VIDEOS"), [entry]);
  const { copy, copied, label: copyLabel, text: copyCaption, source, code } = useCopyCode(page, "video_modal");
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const shown = useMemo(() => (code && mode === "code" ? readable(code) : null), [code, mode]);
  /* The video loads only when asked for: it's megabytes and heavy to start */
  const [watching, setWatching] = useState(false);
  useEffect(() => {
    setMode("preview");
    setWatching(false);
  }, [entry.slug]);
  const index = videos.findIndex((m) => m.slug === entry.slug);
  const prev = index > 0 ? videos[index - 1] : null;
  const next = index < videos.length - 1 ? videos[index + 1] : null;
  const others = videos.filter((m) => m.slug !== entry.slug);

  /* Arrow keys walk the videos without closing, like PAGES */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea")) return;
      if (event.key === "ArrowLeft" && prev) onGo(prev.slug);
      if (event.key === "ArrowRight" && next) onGo(next.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pmodal-overlay" />
        <Dialog.Content className="pmodal-dialog">
          <header className="pmodal-head">
            <div className="pmodal-headings">
              <p className="pmodal-kicker">
                VIDEOS · {entry.runtime} · ADDED {entry.added.toUpperCase()}
              </p>
              <Dialog.Title className="pmodal-title">{entry.title}</Dialog.Title>
              <Dialog.Description className="pmodal-desc">{entry.description}</Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="pmodal-main">
            <section className="pmodal-stage-col" aria-label="Video">
              <div className="pmodal-toolbar">
                <div className="pmodal-views" role="group" aria-label="Show">
                  <button className="pmodal-view" aria-pressed={mode === "preview"} onClick={() => setMode("preview")} title="Watch">
                    <Eye size={13} aria-hidden="true" />
                    <span className="pmodal-label">Preview</span>
                  </button>
                  <button className="pmodal-view" aria-pressed={mode === "code"} onClick={() => setMode("code")} title="Code">
                    <Code2 size={13} aria-hidden="true" />
                    <span className="pmodal-label">Code</span>
                  </button>
                </div>
                <span className="pmodal-note">
                  {mode === "preview"
                    ? watching
                      ? entry.silent ? "PLAYING IN THE FRAME · NO SOUND" : "PRESS PLAY IN THE FRAME · SOUND ON"
                      : "LOADS WHEN YOU PRESS WATCH"
                    : code
                      ? `FULL FILE ${size(code.length)} · BASE64 ASSETS SHOWN AS PLACEHOLDERS`
                      : "LOADING SOURCE"}
                </span>
              </div>
              {mode === "code" ? (
                <div className="pmodal-stage pmodal-stage--code">
                  {shown ? (
                    <DemoCode code={shown} file={entry.demo.split("/").pop() ?? "index.html"} />
                  ) : (
                    <p className="pcode-status">
                      {source.status === "error" ? "Couldn't load the source. Try LIVE DEMO instead." : "Loading source…"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="video-stage">
                  {watching ? (
                    /* Sandboxed without allow-same-origin: the video gets an opaque
                       origin, so Chrome runs it in its own process and its loading
                       (building the scene, composing the score) can't freeze the dialog */
                    <iframe
                      key={entry.slug}
                      src={entry.demo}
                      title={entry.title}
                      sandbox="allow-scripts allow-downloads allow-pointer-lock"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <button className="vplay" onClick={() => setWatching(true)} aria-label={`Watch ${entry.title}, ${entry.runtime}`}>
                      <img className="vplay-still" src={entry.thumbnail} alt="" />
                      <span className="vplay-shade" aria-hidden="true" />
                      <span className="vplay-orb" aria-hidden="true">
                        <span className="vplay-halo" />
                        <span className="vplay-ring" />
                        <span className="vplay-core">
                          <Play size={30} fill="currentColor" strokeWidth={0} />
                        </span>
                      </span>
                      <span className="vplay-meta" aria-hidden="true">
                        <span className="vplay-kicker">NOW SHOWING · INSTALANDING VIDEOS</span>
                        <span className="vplay-title">{entry.title}</span>
                        <span className="vplay-chips">
                          <span>{entry.runtime}</span>
                          <span>REAL-TIME</span>
                          <span>{entry.silent ? "NO SOUND" : "SOUND ON"}</span>
                        </span>
                      </span>
                      <span className="vplay-cta" aria-hidden="true">PRESS TO WATCH</span>
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="pmodal-side" aria-label="Video details">
              <div className="pmodal-actions">
                <button className="pmodal-btn pmodal-btn--solid" onClick={copy} aria-live="polite" title={`${copyLabel} (the whole file)`}>
                  {copied === "done" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  <span className="pmodal-label">{copyCaption}</span>
                </button>
                <a
                  className="pmodal-btn"
                  href={entry.demo}
                  target="_blank"
                  rel="noreferrer"
                  title="Watch full screen in a new tab"
                  onClick={() => track("open_video", { video: entry.slug, from: "modal" })}
                >
                  <span className="pmodal-label">LIVE DEMO</span> <ExternalLink size={12} aria-hidden="true" />
                </a>
                <a
                  className="pmodal-btn"
                  href={entry.demo}
                  download={`${entry.slug}.html`}
                  title="Download the single HTML file"
                  onClick={() => track("download_video", { video: entry.slug, from: "modal" })}
                >
                  <Download size={12} aria-hidden="true" />
                  <span className="pmodal-label">DOWNLOAD</span>
                </a>
              </div>

              <div className="pmodal-body">
                <div className="pmodal-body-head">
                  <span>THE VIDEO</span>
                </div>
                <div className="ecom-body">
                  <ul className="ecom-best">
                    {entry.tags.map((t) => (
                      <li key={t}>{t.replace(/-/g, " ")}</li>
                    ))}
                  </ul>
                  <p className="ecom-note video-note">
                    <b>{entry.tech.toUpperCase()}</b>
                    One HTML file, nothing to install. It renders every frame live in your browser, so it plays
                    opened straight from disk.
                  </p>
                  {entry.credits.length > 0 && (
                    <p className="ecom-note video-note">
                      <b>CREDITS</b>
                      {entry.credits.join(" · ")}
                    </p>
                  )}
                  {others.length > 0 && (
                    <>
                      <div className="pmodal-body-head">
                        <span>MORE VIDEOS</span>
                        <span>
                          {others.length} OF {videos.length}
                        </span>
                      </div>
                      <ul className="pmodal-more">
                        {others.map((o) => (
                          <li key={o.slug}>
                            <button className="pmodal-more-row" onClick={() => onGo(o.slug)}>
                              <span className="pmodal-more-thumb">
                                <img src={o.thumbnail} alt="" loading="lazy" decoding="async" />
                              </span>
                              <span className="pmodal-more-text">
                                <span className="pmodal-more-title">{o.title}</span>
                                <span className="pmodal-more-cat">{o.runtime}</span>
                              </span>
                              <ArrowRight size={12} className="pmodal-more-go" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          <footer className="pmodal-pager">
            {prev ? (
              <button className="pmodal-pager-btn" onClick={() => onGo(prev.slug)}>
                <ArrowLeft size={12} />
                <span>{prev.title}</span>
              </button>
            ) : (
              <span />
            )}
            <span className="pmodal-hint">← → browse · ESC close</span>
            {next ? (
              <button className="pmodal-pager-btn pmodal-pager-btn--next" onClick={() => onGo(next.slug)}>
                <span>{next.title}</span>
                <ArrowRight size={12} />
              </button>
            ) : (
              <span />
            )}
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/** Phones and tablets: the video in the item sheet. Play starts it in place; then it can go full screen */
const VideoSheet = ({ entry, onClose, onGo }: { entry: VideoEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const page = useMemo(() => asPage(entry, "VIDEOS"), [entry]);
  const { copy, copied, code, source } = useCopyCode(page, "video_sheet");
  const [watching, setWatching] = useState(false);
  const [sub, setSub] = useState<null | "about" | "code">(null);
  useEffect(() => {
    setWatching(false);
    setSub(null);
  }, [entry.slug]);
  const index = videos.findIndex((m) => m.slug === entry.slug);
  const prev = index > 0 ? videos[index - 1] : null;
  const next = index < videos.length - 1 ? videos[index + 1] : null;
  const shown = useMemo(() => (code && sub === "code" ? readable(code) : null), [code, sub]);
  const file = entry.demo.split("/").pop() ?? "index.html";
  const play = () => {
    setWatching(true);
    track("open_video", { video: entry.slug, from: "sheet" });
  };

  const subs = {
    about: {
      title: "How it's made",
      body: (
        <>
          <p className="isheet-p"><b>{entry.tech}.</b> One HTML file, nothing to install. It renders every frame live in your browser, so it plays opened straight from disk.</p>
          {entry.credits.length > 0 && <p className="isheet-p"><b>Credits.</b> {entry.credits.join(" · ")}</p>}
          <ul className="isheet-tags">{entry.tags.map((t) => <li key={t}>{t.replace(/-/g, " ")}</li>)}</ul>
        </>
      ),
    },
    code: {
      title: file,
      body: (
        <div className="isheet-code">
          {shown ? <DemoCode code={shown} file={file} /> : <p className="pcode-status">{source.status === "error" ? "Couldn't load the source." : "Loading source…"}</p>}
        </div>
      ),
    },
  };

  return (
    <ItemSheet
      kind="video"
      slug={entry.slug}
      theme="dark"
      title={entry.title}
      summary={`${entry.description}.`}
      pills={[...(isRecent(entry.added) ? [{ label: "New", accent: true }] : []), { label: "Video" }, { label: entry.runtime }, { label: shortDate(entry.added) }]}
      media={
        watching ? (
          <iframe key={entry.slug} src={entry.demo} title={entry.title} sandbox="allow-scripts allow-downloads allow-pointer-lock" allow="autoplay; fullscreen" />
        ) : (
          <button type="button" className="isheet-fill isheet-poster" onClick={play} aria-label={`Play ${entry.title}, ${entry.runtime}`}>
            <img src={entry.thumbnail} alt="" />
            <span className="isheet-play" aria-hidden="true"><Play size={26} fill="currentColor" strokeWidth={0} /></span>
          </button>
        )
      }
      mediaRatio="16 / 9"
      mediaHint={
        entry.silent
          ? watching ? "Playing · no sound" : `${entry.runtime} · no sound`
          : watching ? "Press play in the frame · sound on" : `${entry.runtime} · sound on`
      }
      canFullScreen={watching}
      stats={[
        { value: entry.runtime, label: "Runtime" },
        { value: "Live", label: "Rendered" },
        { value: "1", label: "HTML file" },
      ]}
      primary={watching ? { id: "full_screen", label: "Watch full screen", fullScreen: true } : { id: "play", label: "Play", icon: <Play size={15} fill="currentColor" strokeWidth={0} aria-hidden="true" />, onClick: play }}
      secondary={{ id: "copy_code", label: copied === "done" ? "Copied" : "Copy", done: copied === "done", icon: <Copy size={15} aria-hidden="true" />, onClick: copy }}
      more={[
        { id: "code", label: "View code", onClick: () => setSub("code") },
        { id: "new_tab", label: "Open in a new tab", href: entry.demo },
        { id: "download", label: "Download the file", href: entry.demo, download: `${entry.slug}.html`, onClick: () => track("download_video", { video: entry.slug, from: "sheet" }) },
      ]}
      prev={prev && { title: prev.title, thumb: prev.thumbnail, go: () => onGo(prev.slug) }}
      next={next && { title: next.title, thumb: next.thumbnail, go: () => onGo(next.slug) }}
      sub={sub ? subs[sub] : null}
      onSubClose={() => setSub(null)}
      onClose={onClose}
    >
      <div className="isheet-rows">
        <SheetRow label="How it's made" value={entry.tags.length ? `${entry.tags.length} tags` : undefined} onClick={() => setSub("about")} />
        <SheetRow label="View the code" value={file} onClick={() => setSub("code")} />
      </div>
      <SheetCarousel
        title="More videos"
        items={videos.filter((o) => o.slug !== entry.slug).map((o) => ({ key: o.slug, title: o.title, sub: o.runtime, thumb: o.thumbnail, onClick: () => onGo(o.slug) }))}
      />
    </ItemSheet>
  );
};

const VideoTile = ({ entry }: { entry: VideoEntry }) => (
  <LibraryCard
    kind="video"
    title={entry.title}
    sub={`${entry.runtime} · ${entry.tech.toLowerCase()}`}
    to={`/videos/${entry.slug}`}
    image={entry.thumbnail}
    video
    copy={() => loadDemoSource(entry.demo)}
  />
);

const Videos = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getVideoBySlug(slug);
  const compact = useIsCompact();
  useAgentDark();

  useSeo({
    title: open ? open.title : "Videos",
    description: open
      ? `${open.description}. One HTML file that renders live in your browser.`
      : "Short videos rendered live in your browser. One HTML file each, with the models, light and sound inside.",
    canonical: open ? `/videos/${open.slug}` : "/videos",
    image: open?.thumbnail,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/videos" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="videos"
          title="VIDEOS"
          description="Short videos rendered live in your browser. One HTML file each, with the models, light and sound inside."
        />
        <AgentPanel />

        <div className="media-grid layer-grid">
          <div className="card-grid">
            {videos.map((m) => (
              <VideoTile key={m.slug} entry={m} />
            ))}
          </div>
          <p className="sys-list-foot">
            <span>Every frame is drawn live. No video files.</span>
            <span>More videos are in production.</span>
          </p>
        </div>
      </main>
      {open && compact && (
        <VideoSheet entry={open} onClose={() => navigate("/videos")} onGo={(s) => navigate(`/videos/${s}`, { replace: true })} />
      )}
      {open && !compact && (
        <VideoModal
          entry={open}
          onClose={() => navigate("/videos")}
          onGo={(s) => navigate(`/videos/${s}`, { replace: true })}
        />
      )}
    </div>
  );
};

export default Videos;
