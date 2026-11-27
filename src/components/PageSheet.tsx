import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, ExternalLink, Monitor, Play, Smartphone } from "lucide-react";
import ItemSheet, { SheetCarousel, SheetRow } from "@/components/ItemSheet";
import { isRecent, shortDate } from "@/lib/sheetDates";
import PromptThumb from "@/components/PromptThumb";
import TemplateFeedback from "@/components/TemplateFeedback";
import HireLine from "@/components/HireLine";
import Lineage from "@/components/Lineage";
import DemoCode from "@/components/DemoCode";
import { useCopyCode } from "@/lib/useCopyCode";
import { copyText } from "@/lib/copyText";
import { loadDemoSource } from "@/lib/demoSource";
import { codePrompt, codePromptIntro } from "@/lib/codePrompt";
import { SITE_URL } from "@/lib/agentMode";
import { mobileThumbFor } from "@/data/mobileThumbs";
import { getRelatedPrompts, visiblePrompts, type PromptEntry } from "@/data/prompts";
import { getSystemForTemplate } from "@/data/systems";
import { motionsForPage } from "@/data/motion";
import { track } from "@/lib/track";
import { briefChars, loadBrief, useBrief } from "@/lib/briefs";

/**
 * A landing page in the item sheet (phones and tablets). The preview opens on
 * the desktop capture everywhere, with a toggle to the phone one. A tap loads
 * it live, laid out at that width and scaled to fit, so the phone view on a
 * tablet is the real 390px layout, not a stretched one.
 */

/** The live page laid out at `width` CSS px and scaled to the slot */
const ScaledFrame = ({ src, title, width }: { src: string; title: string; width: number }) => {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div className="isheet-fill isheet-scaled" ref={box}>
      {scale > 0 && (
        <iframe
          src={src}
          title={title}
          style={{ width, height: `${100 / scale}%`, transform: `scale(${scale})` }}
        />
      )}
    </div>
  );
};

const PageSheet = ({ entry, onClose, onGo }: { entry: PromptEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const navigate = useNavigate();
  const { copy, copied, code, source } = useCopyCode(entry, "sheet");
  // Desktop view by default: a page squeezed to phone width inside the sheet reads oddly; phone view is one tap away
  const [view, setView] = useState<"phone" | "desktop">("desktop");
  const [live, setLive] = useState(false);
  const [sub, setSub] = useState<null | "prompt" | "code" | "credits" | "feedback">(null);
  const [promptCopied, setPromptCopied] = useState(false);
  useEffect(() => {
    setLive(false);
    setSub(null);
    setPromptCopied(false);
  }, [entry.slug]);

  const index = visiblePrompts.findIndex((p) => p.slug === entry.slug);
  const prev = index > 0 ? visiblePrompts[index - 1] : null;
  const next = index >= 0 && index < visiblePrompts.length - 1 ? visiblePrompts[index + 1] : null;
  const related = useMemo(() => getRelatedPrompts(entry, 8), [entry]);
  const system = getSystemForTemplate(entry.slug);
  const motions = motionsForPage(entry.slug);
  const file = entry.demo?.split("/").pop() ?? "index.html";
  const phoneThumb = entry.thumbnail ? mobileThumbFor(entry.thumbnail) : undefined;
  // A page without a phone capture has nothing honest to show in phone view until it's live
  const poster = view === "phone" ? phoneThumb ?? entry.thumbnail : entry.thumbnail;
  const brief = useBrief("page", entry.slug, entry.prompt, !entry.demo && !entry.youtube);
  const promptLen = entry.demo && code ? codePrompt(entry, code, SITE_URL).length : briefChars(entry);
  const tokens = Math.round(promptLen / 4);

  const copyPrompt = async () => {
    if (!entry.demo) await copyText(brief ?? (await loadBrief("page", entry.slug, entry.prompt)));
    else await copyText(codePrompt(entry, code ?? (await loadDemoSource(entry.demo)), SITE_URL));
    setPromptCopied(true);
    track("copy_prompt", { template: entry.slug, from: "sheet" });
    window.setTimeout(() => setPromptCopied(false), 1400);
  };

  const toggle = (
    <span className="isheet-views" role="group" aria-label="Preview at">
      <button type="button" aria-pressed={view === "phone"} onClick={() => setView("phone")} aria-label="Phone view">
        <Smartphone size={13} aria-hidden="true" />
      </button>
      <button type="button" aria-pressed={view === "desktop"} onClick={() => setView("desktop")} aria-label="Desktop view">
        <Monitor size={13} aria-hidden="true" />
      </button>
    </span>
  );

  const media = entry.youtube ? (
    live && entry.youtubeEmbed !== false ? (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${entry.youtube}?autoplay=1&playsinline=1`}
        title={entry.title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    ) : (
      <button
        type="button"
        className="isheet-fill isheet-poster"
        onClick={() => (entry.youtubeEmbed !== false ? setLive(true) : window.open(`https://www.youtube.com/watch?v=${entry.youtube}`, "_blank"))}
        aria-label={`Play ${entry.title}`}
      >
        {entry.thumbnail && <img src={entry.thumbnail} alt="" />}
        <span className="isheet-play" aria-hidden="true"><Play size={26} fill="currentColor" strokeWidth={0} /></span>
      </button>
    )
  ) : !entry.demo ? (
    <div className="isheet-fill isheet-static"><PromptThumb entry={entry} eager /></div>
  ) : (
    <>
      {live ? (
        <ScaledFrame key={`${entry.slug}-${view}`} src={entry.demo} title={`${entry.title} live demo`} width={view === "phone" ? 390 : 1280} />
      ) : (
        <button type="button" className="isheet-fill isheet-poster" onClick={() => { setLive(true); track("try_live", { template: entry.slug, from: "sheet" }); }} aria-label={`Try ${entry.title} live`}>
          {poster && <img src={poster} alt="" />}
        </button>
      )}
    </>
  );

  const subs = {
    prompt: {
      title: "One-shot prompt",
      body: (
        <>
          <pre className="isheet-pre">{entry.demo ? codePromptIntro(entry, SITE_URL) : brief ?? "Loading the brief…"}</pre>
          {entry.demo && (
            <p className="isheet-p">
              <b>+ The code.</b> The whole of {file}
              {code && ` (${Math.round(code.length / 1024)} KB)`} follows this instruction. Copy prompt copies both, exactly what an agent gets.
            </p>
          )}
          <button type="button" className="isheet-btn isheet-btn--primary isheet-btn--block" onClick={copyPrompt}>
            {promptCopied ? "Copied" : "Copy prompt"}
          </button>
        </>
      ),
    },
    code: {
      title: file,
      body: (
        <div className="isheet-code">
          {code ? <DemoCode code={code} file={file} /> : <p className="pcode-status">{source.status === "error" ? "Couldn't load the source." : "Loading source…"}</p>}
        </div>
      ),
    },
    credits: {
      title: "Built on",
      body: (
        <dl className="isheet-dl">
          {(entry.credits ?? []).map((c) => (
            <div key={c.href}>
              <dt><a href={c.href} target="_blank" rel="noreferrer">{c.label}</a></dt>
              {c.note && <dd>{c.note}</dd>}
            </div>
          ))}
        </dl>
      ),
    },
    feedback: {
      title: "Feedback",
      body: <TemplateFeedback key={entry.slug} entry={entry} onDone={() => setSub(null)} />,
    },
  };

  const primary = entry.youtube
    ? { id: "youtube", label: "Watch on YouTube", href: `https://www.youtube.com/watch?v=${entry.youtube}` }
    : entry.demo
      ? { id: "open_demo", label: "Open live demo", icon: <ExternalLink size={15} aria-hidden="true" />, href: entry.demo, onClick: () => track("open_demo", { template: entry.slug, from: "sheet" }) }
      : entry.repoUrl
        ? { id: "repo", label: "View code", href: entry.repoUrl }
        : { id: "copy_prompt", label: promptCopied ? "Copied" : "Copy prompt", done: promptCopied, onClick: copyPrompt };

  return (
    <ItemSheet
      kind="page"
      slug={entry.slug}
      theme={entry.theme ?? "dark"}
      title={entry.title}
      summary={`${entry.description}.`}
      pills={[
        ...(isRecent(entry.added) ? [{ label: "New", accent: true }] : []),
        { label: entry.youtube ? "Video" : "Page" },
        ...(entry.theme ? [{ label: entry.theme }] : []),
        { label: shortDate(entry.added) },
      ]}
      media={media}
      mediaRatio={entry.demo && !entry.youtube ? (view === "phone" ? "4 / 5" : "2 / 1") : "2 / 1"}
      barStart={entry.demo && !entry.youtube ? toggle : undefined}
      mediaHint={entry.demo && !entry.youtube ? (live ? `Live · ${view} view` : "Tap to try it live") : undefined}
      canFullScreen={live}
      stats={
        entry.demo
          ? [
              { value: code ? `${Math.round(code.length / 1024)} KB` : "…", label: "One HTML file" },
              { value: tokens >= 1000 ? `~${Math.round(tokens / 1000)}k` : String(tokens), label: "Prompt tokens" },
            ]
          : undefined
      }
      primary={primary}
      secondary={entry.demo ? { id: "copy_code", label: copied === "done" ? "Copied" : "Copy", done: copied === "done", icon: <Copy size={15} aria-hidden="true" />, onClick: copy } : undefined}
      more={[
        ...(!entry.youtube ? [{ id: "copy_prompt", label: promptCopied ? "Prompt copied" : "Copy prompt", done: promptCopied, onClick: copyPrompt }] : []),
        ...(entry.demo
          ? [
              { id: "code", label: "View code", onClick: () => setSub("code") },
              { id: "download", label: "Download the file", href: entry.demo, download: file },
            ]
          : []),
        ...(system ? [{ id: "system", label: `${system.name} design system`, to: `/systems/${system.slug}` }] : []),
        { id: "feedback", label: "Send feedback", onClick: () => setSub("feedback") },
      ]}
      prev={prev && { title: prev.title, thumb: prev.thumbnail, go: () => onGo(prev.slug) }}
      next={next && { title: next.title, thumb: next.thumbnail, go: () => onGo(next.slug) }}
      sub={sub ? subs[sub] : null}
      onSubClose={() => setSub(null)}
      onClose={onClose}
    >
      <div className="isheet-rows">
        {!entry.youtube && <SheetRow label="One-shot prompt" value={`~${tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : tokens} tokens`} onClick={() => setSub("prompt")} />}
        {entry.demo && <SheetRow label="View the code" value={file} onClick={() => setSub("code")} />}
        {system && <SheetRow label="Design system" value={system.name} onClick={() => navigate(`/systems/${system.slug}`)} />}
        {motions.map((m) => (
          <SheetRow key={m.slug} label="Motion study" value={m.title} onClick={() => navigate(`/motion/${m.slug}`)} />
        ))}
        {entry.credits && entry.credits.length > 0 && <SheetRow label="Built on" value={String(entry.credits.length)} onClick={() => setSub("credits")} />}
      </div>
      {entry.parents && <Lineage entry={entry} compact />}
      {!entry.youtube && <HireLine slug={entry.slug} from="sheet" className="hire-line--sheet" />}
      <SheetCarousel
        title={`More in ${entry.categoryLabel}`}
        items={related.map((r) => ({ key: r.slug, title: r.title, sub: r.theme, thumb: r.thumbnail, onClick: () => onGo(r.slug) }))}
      />
    </ItemSheet>
  );
};

export default PageSheet;
