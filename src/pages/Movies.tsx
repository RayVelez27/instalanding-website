import { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Download, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import LibraryCard from "@/components/LibraryCard";
import { AgentPanel } from "@/components/AgentMode";
import { movies, getMovieBySlug, type MovieEntry } from "@/data/movies";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";

/**
 * /movies and /movies/:slug. A movie is a short film that renders live in
 * the browser from one HTML file. The dialog plays it in a 16:9 screen (the
 * film's own title card has the Play button, since browsers only start sound
 * after a click), with NEW TAB for full screen and DOWNLOAD for the file.
 * No COPY CODE: the files run to megabytes of inlined models and audio.
 */

const MovieModal = ({ entry, onClose, onGo }: { entry: MovieEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const index = movies.findIndex((m) => m.slug === entry.slug);
  const prev = index > 0 ? movies[index - 1] : null;
  const next = index < movies.length - 1 ? movies[index + 1] : null;
  const others = movies.filter((m) => m.slug !== entry.slug);

  /* Arrow keys walk the films without closing, like PAGES */
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
                MOVIES · {entry.runtime} · ADDED {entry.added.toUpperCase()}
              </p>
              <Dialog.Title className="pmodal-title">{entry.title}</Dialog.Title>
              <Dialog.Description className="pmodal-desc">{entry.description}</Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="pmodal-main">
            <div className="movie-stage">
              <iframe
                key={entry.slug}
                src={entry.demo}
                title={entry.title}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>

            <section className="pmodal-side" aria-label="Film">
              <div className="pmodal-actions">
                <a
                  className="pmodal-btn pmodal-btn--solid"
                  href={entry.demo}
                  target="_blank"
                  rel="noreferrer"
                  title="Watch full screen in a new tab"
                  onClick={() => track("open_movie", { movie: entry.slug, from: "modal" })}
                >
                  <span className="pmodal-label">NEW TAB</span> <ExternalLink size={12} aria-hidden="true" />
                </a>
                <a
                  className="pmodal-btn"
                  href={entry.demo}
                  download={`${entry.slug}.html`}
                  title="Download the single HTML file"
                  onClick={() => track("download_movie", { movie: entry.slug, from: "modal" })}
                >
                  <Download size={12} aria-hidden="true" />
                  <span className="pmodal-label">DOWNLOAD HTML</span>
                </a>
              </div>

              <div className="pmodal-body">
                <div className="pmodal-body-head">
                  <span>THE FILM</span>
                </div>
                <div className="ecom-body">
                  <ul className="ecom-best">
                    {entry.tags.map((t) => (
                      <li key={t}>{t.replace(/-/g, " ")}</li>
                    ))}
                  </ul>
                  <p className="ecom-note movie-note">
                    <b>{entry.tech.toUpperCase()}</b>
                    One HTML file, nothing to install. It renders every frame live in your browser, so it plays
                    opened straight from disk.
                  </p>
                  {entry.credits.length > 0 && (
                    <p className="ecom-note movie-note">
                      <b>CREDITS</b>
                      {entry.credits.join(" · ")}
                    </p>
                  )}
                  {others.length > 0 && (
                    <>
                      <div className="pmodal-body-head">
                        <span>MORE MOVIES</span>
                        <span>
                          {others.length} OF {movies.length}
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

const MovieTile = ({ entry }: { entry: MovieEntry }) => (
  <LibraryCard
    kind="movie"
    title={entry.title}
    sub={`${entry.runtime} · ${entry.tech.toLowerCase()}`}
    to={`/movies/${entry.slug}`}
    image={entry.thumbnail}
    video
  />
);

const Movies = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getMovieBySlug(slug);
  useAgentDark();

  useSeo({
    title: open ? open.title : "Movies",
    description: open
      ? `${open.description}. One HTML file that renders live in your browser.`
      : "Short films rendered live in your browser. One HTML file each, with the models, light and sound inside.",
    canonical: open ? `/movies/${open.slug}` : "/movies",
    image: open?.thumbnail,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/movies" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="movies"
          title="MOVIES"
          description="Short films rendered live in your browser. One HTML file each, with the models, light and sound inside."
        />
        <AgentPanel />

        <div className="media-grid layer-grid">
          <div className="card-grid">
            {movies.map((m) => (
              <MovieTile key={m.slug} entry={m} />
            ))}
          </div>
          <p className="sys-list-foot">
            <span>Every frame is drawn live. No video files.</span>
            <span>More films are in production.</span>
          </p>
        </div>
      </main>
      {open && (
        <MovieModal
          entry={open}
          onClose={() => navigate("/movies")}
          onGo={(s) => navigate(`/movies/${s}`, { replace: true })}
        />
      )}
    </div>
  );
};

export default Movies;
