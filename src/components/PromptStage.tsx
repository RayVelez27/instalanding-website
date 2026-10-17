import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Eye, Monitor, Smartphone } from "lucide-react";
import PromptThumb from "@/components/PromptThumb";
import DemoCode from "@/components/DemoCode";
import VideoStage from "@/components/VideoStage";
import type { PromptEntry } from "@/data/prompts";

/** Logical widths the preview renders the demo at, before it is scaled to fit. */
const VIEWPORTS = {
  desktop: { label: "Desktop", width: 1440, icon: Monitor },
  mobile: { label: "Mobile", width: 390, icon: Smartphone },
} as const;

type ViewportKey = keyof typeof VIEWPORTS;
type DemoSource = { status: "loading" } | { status: "ready"; code: string } | { status: "error" };

/**
 * The live preview: the demo in a scaled iframe at desktop or mobile width, its
 * source on the CODE tab, a video for GOSPEL entries, or the wireframe when
 * there is no demo. Used by the dialog and by the standalone /prompt page, so
 * the two always show the same thing; each parent only decides how tall it is.
 */
const PromptStage = ({ entry, source }: { entry: PromptEntry; source: DemoSource }) => {
  const [view, setView] = useState<ViewportKey>("desktop");
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const [stage, setStage] = useState({ width: 0, height: 0 });
  const observer = useRef<ResizeObserver>();

  useEffect(() => {
    setView("desktop");
    setMode("preview");
  }, [entry.slug]);

  /* The preview is a real page scaled to fit, so the stage has to be measured.
     This is a callback ref rather than an effect on purpose: inside the dialog
     it mounts in a portal, so a layout effect can run before the node exists —
     and then the observer is never attached and the frame stays at scale 1. */
  const attachStage = useCallback((node: HTMLDivElement | null) => {
    observer.current?.disconnect();
    if (!node) return;
    const measure = () => setStage({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if ("ResizeObserver" in window) {
      observer.current = new ResizeObserver(measure);
      observer.current.observe(node);
    }
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  const code = source.status === "ready" ? source.code : null;
  const logical = VIEWPORTS[view].width;
  // Never scale up: at mobile width the frame sits at 1:1 and is centred.
  const scale = stage.width ? Math.min(1, stage.width / logical) : 1;
  const frameHeight = scale ? stage.height / scale : stage.height;

  return (
    <section className="pmodal-stage-col" aria-label="Preview">
      <div className="pmodal-toolbar">
        {entry.demo && (
          <div className="pmodal-views" role="group" aria-label="Show">
            <button className="pmodal-view" aria-pressed={mode === "preview"} onClick={() => setMode("preview")} title="Preview">
              <Eye size={13} aria-hidden="true" />
              <span className="pmodal-label">Preview</span>
            </button>
            <button className="pmodal-view" aria-pressed={mode === "code"} onClick={() => setMode("code")} title="Code">
              <Code2 size={13} aria-hidden="true" />
              <span className="pmodal-label">Code</span>
            </button>
          </div>
        )}
        {entry.youtube ? (
          <span className="pmodal-note">{entry.youtubeEmbed === false ? "YOUTUBE · OPENS IN A NEW TAB" : "YOUTUBE · PLAYS HERE"}</span>
        ) : entry.demo && mode === "code" ? null : entry.demo ? (
          <div className="pmodal-views" role="group" aria-label="Preview width">
            {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => {
              const Icon = VIEWPORTS[key].icon;
              return (
                <button
                  key={key}
                  className={`pmodal-view pmodal-view--${key}`}
                  aria-pressed={view === key}
                  onClick={() => setView(key)}
                  title={VIEWPORTS[key].label}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span className="pmodal-label">{VIEWPORTS[key].label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <span className="pmodal-note">WIREFRAME PREVIEW</span>
        )}
        {entry.demo && mode === "preview" && (
          <span className="pmodal-note">{logical}px · scroll inside the frame</span>
        )}
      </div>

      <div
        className={`pmodal-stage pmodal-stage--${entry.youtube ? "video" : mode === "code" ? "code" : view}`}
        ref={attachStage}
      >
        {entry.youtube ? (
          <VideoStage entry={entry} className="pmodal-video" />
        ) : entry.demo && mode === "code" ? (
          code ? (
            <DemoCode code={code} file={entry.demo.split("/").pop() ?? "index.html"} />
          ) : (
            <p className="pcode-status">
              {source.status === "error" ? "Couldn't load the source. Try NEW TAB instead." : "Loading source…"}
            </p>
          )
        ) : entry.demo ? (
          <iframe
            /* Keyed by view so the demo re-runs anything it measured on load. */
            key={`${entry.slug}-${view}`}
            className="pmodal-frame"
            src={entry.demo}
            title={`${entry.title} live preview`}
            loading="lazy"
            style={{
              width: logical,
              height: frameHeight || "100%",
              transform: `scale(${scale})`,
            }}
          />
        ) : (
          <div className="pmodal-fallback">
            <PromptThumb entry={entry} eager />
          </div>
        )}
      </div>
    </section>
  );
};

export default PromptStage;
