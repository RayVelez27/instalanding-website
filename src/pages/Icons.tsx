import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Copy, Download, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import LibraryCard from "@/components/LibraryCard";
import ItemSheet from "@/components/ItemSheet";
import { AgentPanel } from "@/components/AgentMode";
import { iconSets, getIconSetBySlug, type IconEntry, type IconSetEntry } from "@/data/icons";
import { loadDemoSource } from "@/lib/demoSource";
import { copyText } from "@/lib/copyText";
import { isRecent, shortDate } from "@/lib/sheetDates";
import { useIsCompact } from "@/hooks/useIsCompact";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";

/**
 * /icons and /icons/:slug. An icon set is one file with every icon, plus one
 * file per icon. The dialog (desktop) and the sheet (phones, tablets) show the
 * whole set live and a grid of the icons: each tile runs its own file, takes
 * the pointer (forwarded into the frame, so the hover works) and copies that
 * one icon when clicked. COPY ALL copies the file with every icon.
 */

const useFlash = () => {
  const [on, setOn] = useState("");
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  const flash = (k: string) => {
    setOn(k);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setOn(""), 1500);
  };
  return [on, flash] as const;
};

/** One icon, live. The frame ignores the pointer; the tile forwards it in so the hover plays, and a click copies. */
const IconTile = ({ icon, set, copied, onCopy }: { icon: IconEntry; set: IconSetEntry; copied: boolean; onCopy: () => void }) => {
  const frame = useRef<HTMLIFrameElement>(null);
  const send = (type: string, e?: React.PointerEvent) => {
    const doc = frame.current?.contentDocument;
    const canvas = doc?.querySelector("canvas");
    if (!canvas || !frame.current) return;
    const r = frame.current.getBoundingClientRect();
    const init = e ? { clientX: e.clientX - r.left, clientY: e.clientY - r.top, pointerType: e.pointerType, bubbles: true } : { bubbles: true };
    canvas.dispatchEvent(new PointerEvent(type, init));
  };
  return (
    <button
      type="button"
      className={`icon-tile${copied ? " is-copied" : ""}`}
      onClick={onCopy}
      onPointerEnter={() => loadDemoSource(icon.file).catch(() => {})}
      onPointerMove={(e) => send("pointermove", e)}
      onPointerDown={(e) => send("pointerdown", e)}
      onPointerUp={(e) => send("pointerup", e)}
      onPointerLeave={() => send("pointerleave")}
      aria-label={`Copy the ${icon.name} icon`}
      title={`Copy the ${icon.name} icon (${set.title})`}
    >
      <iframe ref={frame} src={icon.file} title="" tabIndex={-1} aria-hidden="true" loading="lazy" />
      <span className="icon-tile-name">
        {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
        {copied ? "Copied" : icon.name}
      </span>
    </button>
  );
};

const useIconCopy = (set: IconSetEntry) => {
  const [flash, setFlash] = useFlash();
  const copyIcon = async (icon: IconEntry) => {
    await copyText(await loadDemoSource(icon.file));
    setFlash(icon.id);
    track("copy_icon", { set: set.slug, icon: icon.id });
  };
  const copyAll = async () => {
    await copyText(await loadDemoSource(set.demo));
    setFlash("all");
    track("copy_icon_set", { set: set.slug });
  };
  return { flash, copyIcon, copyAll };
};

const IconGrid = ({ set, flash, onCopy }: { set: IconSetEntry; flash: string; onCopy: (i: IconEntry) => void }) => (
  <div className="icon-grid">
    {set.icons.map((i) => (
      <IconTile key={i.id} icon={i} set={set} copied={flash === i.id} onCopy={() => onCopy(i)} />
    ))}
  </div>
);

const IconSetModal = ({ set, onClose }: { set: IconSetEntry; onClose: () => void }) => {
  const { flash, copyIcon, copyAll } = useIconCopy(set);
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pmodal-overlay" />
        <Dialog.Content className="pmodal-dialog">
          <header className="pmodal-head">
            <div className="pmodal-headings">
              <p className="pmodal-kicker">
                ICONS · {set.kind.toUpperCase()} · {set.icons.length} ICONS · ADDED {set.added.toUpperCase()}
              </p>
              <Dialog.Title className="pmodal-title">{set.title}</Dialog.Title>
              <Dialog.Description className="pmodal-desc">{set.description}</Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>
          <div className="pmodal-main">
            <section className="pmodal-stage-col" aria-label="The set">
              <div className="pmodal-toolbar">
                <span className="pmodal-note">LIVE · HOVER THE ICONS</span>
              </div>
              <div className="icon-set-stage">
                <iframe key={set.slug} src={set.demo} title={`${set.title}, live`} />
              </div>
            </section>
            <section className="pmodal-side" aria-label="Icons">
              <div className="pmodal-actions">
                <button className="pmodal-btn pmodal-btn--solid" onClick={copyAll} aria-live="polite" title="Copy the file with all the icons">
                  {flash === "all" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  <span className="pmodal-label">{flash === "all" ? "COPIED" : `COPY ALL ${set.icons.length}`}</span>
                </button>
                <a className="pmodal-btn" href={set.demo} target="_blank" rel="noreferrer" title="Open the set in a new tab">
                  <span className="pmodal-label">NEW TAB</span> <ExternalLink size={12} aria-hidden="true" />
                </a>
                <a className="pmodal-btn" href={set.demo} download={`${set.slug}.html`} title="Download the file with all the icons">
                  <Download size={12} aria-hidden="true" />
                  <span className="pmodal-label">DOWNLOAD</span>
                </a>
              </div>
              <div className="pmodal-body">
                <div className="pmodal-body-head">
                  <span>CLICK AN ICON TO COPY IT</span>
                  <span>{set.icons.length} FILES</span>
                </div>
                <div className="ecom-body">
                  <IconGrid set={set} flash={flash} onCopy={copyIcon} />
                  <p className="ecom-note">
                    <b>EACH ICON IS ITS OWN FILE</b>
                    One HTML file per icon, with a transparent canvas: size the canvas to place it. {set.interaction}
                  </p>
                  <p className="ecom-note">
                    <b>{set.tech.toUpperCase()}</b>
                    {set.credits.join(" ")}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const IconSetSheet = ({ set, onClose, onGo }: { set: IconSetEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const { flash, copyIcon, copyAll } = useIconCopy(set);
  const i = iconSets.findIndex((s) => s.slug === set.slug);
  const prev = i > 0 ? iconSets[i - 1] : null;
  const next = i < iconSets.length - 1 ? iconSets[i + 1] : null;
  return (
    <ItemSheet
      kind="icons"
      slug={set.slug}
      theme="dark"
      title={set.title}
      summary={`${set.description}.`}
      pills={[...(isRecent(set.added) ? [{ label: "New", accent: true }] : []), { label: "Icons" }, { label: set.kind }, { label: shortDate(set.added) }]}
      media={<iframe key={set.slug} src={set.demo} title={`${set.title}, live`} />}
      mediaRatio="1 / 1"
      mediaHint="Live · touch the icons"
      stats={[
        { value: String(set.icons.length), label: "Icons" },
        { value: String(set.icons.length + 1), label: "HTML files" },
        { value: "0", label: "Libraries" },
      ]}
      primary={{ id: "copy_all", label: flash === "all" ? "Copied" : `Copy all ${set.icons.length}`, done: flash === "all", icon: <Copy size={15} aria-hidden="true" />, onClick: copyAll }}
      more={[
        { id: "new_tab", label: "Open in a new tab", href: set.demo },
        { id: "download", label: "Download the set", href: set.demo, download: `${set.slug}.html` },
      ]}
      prev={prev && { title: prev.title, thumb: prev.thumbnail, go: () => onGo(prev.slug) }}
      next={next && { title: next.title, thumb: next.thumbnail, go: () => onGo(next.slug) }}
      onClose={onClose}
    >
      <h3 className="isheet-section-title">Tap an icon to copy it</h3>
      <IconGrid set={set} flash={flash} onCopy={copyIcon} />
      <p className="isheet-p">
        <b>Each icon is its own file</b> with a transparent canvas; size the canvas to place it. {set.interaction}
      </p>
    </ItemSheet>
  );
};

const Icons = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getIconSetBySlug(slug);
  const compact = useIsCompact();
  useAgentDark();

  useSeo({
    title: open ? open.title : "Icons",
    description: open
      ? `${open.description}. Copy one icon or the whole set, one HTML file each.`
      : "Animated icon sets you can copy one icon at a time or all at once: every icon is its own HTML file, no libraries.",
    canonical: open ? `/icons/${open.slug}` : "/icons",
    image: open?.thumbnail,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/icons" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="icons"
          title="ICONS"
          description="Animated icon sets. Copy one icon or the whole set: every icon is its own HTML file, no libraries."
        />
        <AgentPanel />
        <div className="media-grid layer-grid">
          <div className="card-grid">
            {iconSets.map((s) => (
              <LibraryCard
                key={s.slug}
                kind="icons"
                title={s.title}
                sub={`${s.icons.length} icons · ${s.kind.toLowerCase()}`}
                to={`/icons/${s.slug}`}
                image={s.thumbnail}
                copy={() => loadDemoSource(s.demo)}
                copyLabel="COPY ALL"
              />
            ))}
          </div>
          <p className="sys-list-foot">
            <span>Every icon is its own file. Copy one, or the set.</span>
            <span>More sets are being drawn.</span>
          </p>
        </div>
      </main>
      {open && compact && <IconSetSheet set={open} onClose={() => navigate("/icons")} onGo={(s) => navigate(`/icons/${s}`, { replace: true })} />}
      {open && !compact && <IconSetModal set={open} onClose={() => navigate("/icons")} />}
    </div>
  );
};

export default Icons;
