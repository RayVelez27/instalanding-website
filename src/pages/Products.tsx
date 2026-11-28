import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check, Code2, Copy, Download, ExternalLink, Eye, PanelRight, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import LibraryCard from "@/components/LibraryCard";
import DemoCode from "@/components/DemoCode";
import { AgentPanel } from "@/components/AgentMode";
import { products, getProductBySlug, type ProductEntry } from "@/data/products";
import { asPage, fileSize, readableSource } from "@/lib/bigDemo";
import { loadDemoSource } from "@/lib/demoSource";
import { useCopyCode } from "@/lib/useCopyCode";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";
import { useIsCompact } from "@/hooks/useIsCompact";
import ItemSheet, { SheetCarousel, SheetRow } from "@/components/ItemSheet";
import { isRecent, shortDate } from "@/lib/sheetDates";
import ModalDesc from "@/components/ModalDesc";
import { shuffle } from "@/data/prompts";

/* A new order on every page load, like PAGES and MOTION. Kept for the visit, so closing a
   dialog (which changes the route) doesn't reshuffle the grid, and the dialog's previous / next
   and "more" lists follow the grid's order. */
let dealt: ProductEntry[] | null = null;
const ordered = () => (dealt ??= shuffle(products));

/**
 * /products and /products/:slug. A product is a device or app concept you can
 * operate, from one HTML file. Unlike VIDEOS the dialog runs it straight away:
 * the point is to use it. It still runs in a sandboxed frame (no
 * allow-same-origin), so the product gets its own process and its startup can
 * never freeze the site. CODE, COPY CODE and DOWNLOAD work as in VIDEOS.
 */

/** The product laid out on a desktop-sized canvas (at least 1440 x 900, stretched to the
    stage's shape so it still fills the full width) and scaled to fit, so the dialog always
    shows its desktop layout. Products switch layouts on height as well as width. */
const DESK_W = 1440, DESK_H = 900;
const ProductFrame = ({ src, title }: { src: string; title: string }) => {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const k = size.w && size.h ? Math.min(1, size.w / DESK_W, size.h / DESK_H) : 1;
  return (
    <div className="product-stage" ref={box}>
      {size.w > 0 && (
        <iframe
          src={src}
          title={title}
          sandbox="allow-scripts allow-downloads allow-pointer-lock"
          allow="autoplay; fullscreen"
          allowFullScreen
          style={k < 1 ? { width: size.w / k, height: size.h / k, transform: `scale(${k})`, transformOrigin: "0 0" } : undefined}
        />
      )}
    </div>
  );
};

const ProductModal = ({ entry, onClose, onGo }: { entry: ProductEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const page = useMemo(() => asPage(entry, "PRODUCTS"), [entry]);
  const { copy, copied, label: copyLabel, text: copyCaption, source, code } = useCopyCode(page, "product_modal");
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const shown = useMemo(() => (code && mode === "code" ? readableSource(code) : null), [code, mode]);
  useEffect(() => setMode("preview"), [entry.slug]);
  // The details (controls, credits, more products) slide over the stage on demand, so the product gets the full width
  const [details, setDetails] = useState(false);
  const index = ordered().findIndex((p) => p.slug === entry.slug);
  const prev = index > 0 ? ordered()[index - 1] : null;
  const next = index < ordered().length - 1 ? ordered()[index + 1] : null;
  const others = ordered().filter((p) => p.slug !== entry.slug);

  /* Arrow keys walk the products without closing, like PAGES. Keys pressed
     inside the product go to its own frame, so they never reach this. */
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
                PRODUCTS · {entry.kind.toUpperCase()} · ADDED {entry.added.toUpperCase()}
              </p>
              <Dialog.Title className="pmodal-title">{entry.title}</Dialog.Title>
              <ModalDesc text={entry.description} />
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="pmodal-main pmodal-main--wide">
            <section className="pmodal-stage-col" aria-label="Product">
              <div className="pmodal-toolbar">
                <div className="pmodal-views" role="group" aria-label="Show">
                  <button className="pmodal-view" aria-pressed={mode === "preview"} onClick={() => setMode("preview")} title="Use it">
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
                    ? "LIVE · USE EVERY CONTROL"
                    : code
                      ? `FULL FILE ${fileSize(code.length)} · BASE64 ASSETS SHOWN AS PLACEHOLDERS`
                      : "LOADING SOURCE"}
                </span>
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
                    title="Open full screen in a new tab"
                    onClick={() => track("open_product", { product: entry.slug, from: "modal" })}
                  >
                    <span className="pmodal-label">LIVE DEMO</span> <ExternalLink size={12} aria-hidden="true" />
                  </a>
                  <a
                    className="pmodal-btn"
                    href={entry.demo}
                    download={`${entry.slug}.html`}
                    title="Download the single HTML file"
                    onClick={() => track("download_product", { product: entry.slug, from: "modal" })}
                  >
                    <Download size={12} aria-hidden="true" />
                    <span className="pmodal-label">DOWNLOAD</span>
                  </a>
                </div>
                <button
                  type="button"
                  className="pmodal-btn product-details-btn"
                  aria-expanded={details}
                  aria-controls="product-details"
                  onClick={() => setDetails((d) => !d)}
                >
                  <PanelRight size={13} aria-hidden="true" />
                  <span className="pmodal-label">{details ? "HIDE DETAILS" : `DETAILS · ${entry.controls.length} CONTROLS`}</span>
                </button>
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
                <ProductFrame key={entry.slug} src={entry.demo} title={`${entry.title}, live`} />
              )}
            </section>

            <section id="product-details" className={`pmodal-side product-drawer${details ? " is-open" : ""}`} aria-label="Product details" {...(details ? {} : { inert: "" })}>
              <button type="button" className="product-drawer-close" onClick={() => setDetails(false)} aria-label="Hide details">
                <X size={15} aria-hidden="true" />
              </button>
              <div className="pmodal-body">
                <div className="pmodal-body-head">
                  <span>THE CONTROLS</span>
                </div>
                <div className="ecom-body">
                  <dl className="product-controls">
                    {entry.controls.map((c) => (
                      <div key={c.control}>
                        <dt>{c.control}</dt>
                        <dd>{c.does}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="ecom-note product-note">
                    <b>{entry.tech.toUpperCase()}</b>
                    One HTML file, nothing to install. Every control is drawn and wired in the file, so it runs opened
                    straight from disk.
                  </p>
                  {entry.credits.length > 0 && (
                    <p className="ecom-note product-note">
                      <b>CREDITS</b>
                      {entry.credits.join(" · ")}
                    </p>
                  )}
                  {others.length > 0 && (
                    <>
                      <div className="pmodal-body-head">
                        <span>MORE PRODUCTS</span>
                        <span>
                          {others.length} OF {ordered().length}
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
                                <span className="pmodal-more-cat">{o.kind.toUpperCase()}</span>
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

/** Phones and tablets: the product in the item sheet, live from the first frame */
const ProductSheet = ({ entry, onClose, onGo }: { entry: ProductEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const page = useMemo(() => asPage(entry, "PRODUCTS"), [entry]);
  const { copy, copied, code, source } = useCopyCode(page, "product_sheet");
  const [sub, setSub] = useState<null | "controls" | "about" | "code">(null);
  useEffect(() => setSub(null), [entry.slug]);
  const index = ordered().findIndex((p) => p.slug === entry.slug);
  const prev = index > 0 ? ordered()[index - 1] : null;
  const next = index < ordered().length - 1 ? ordered()[index + 1] : null;
  const shown = useMemo(() => (code && sub === "code" ? readableSource(code) : null), [code, sub]);
  const file = entry.demo.split("/").pop() ?? "index.html";

  const subs = {
    controls: {
      title: "Controls",
      body: (
        <dl className="isheet-dl">
          {entry.controls.map((c) => (
            <div key={c.control}>
              <dt>{c.control}</dt>
              <dd>{c.does}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    about: {
      title: "How it's built",
      body: (
        <>
          <p className="isheet-p"><b>{entry.tech}.</b> One HTML file, nothing to install. Every control is drawn and wired in the file, so it runs opened straight from disk.</p>
          {entry.credits.length > 0 && <p className="isheet-p"><b>Credits.</b> {entry.credits.join(" · ")}</p>}
          <ul className="isheet-tags">{entry.tags.map((t) => <li key={t}>{t}</li>)}</ul>
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
      kind="product"
      slug={entry.slug}
      theme="dark"
      title={entry.title}
      summary={`${entry.description}.`}
      pills={[...(isRecent(entry.added) ? [{ label: "New", accent: true }] : []), { label: "Product" }, { label: entry.kind }, { label: shortDate(entry.added) }]}
      media={
        <iframe
          key={entry.slug}
          src={entry.demo}
          title={`${entry.title}, live`}
          sandbox="allow-scripts allow-downloads allow-pointer-lock"
          allow="autoplay; fullscreen"
        />
      }
      mediaRatio="16 / 11"
      mediaHint="Live · tap to use"
      canFullScreen
      stats={[
        { value: String(entry.controls.length), label: "Controls" },
        { value: "1", label: "HTML file" },
        { value: String(entry.credits.length || "—"), label: entry.credits.length === 1 ? "Credit" : "Credits" },
      ]}
      primary={{ id: "open_demo", label: "Live Demo", icon: <ExternalLink size={15} aria-hidden="true" />, href: entry.demo, onClick: () => track("open_product", { product: entry.slug, from: "sheet" }) }}
      secondary={{ id: "copy_code", label: copied === "done" ? "Copied" : "Copy", done: copied === "done", icon: <Copy size={15} aria-hidden="true" />, onClick: copy }}
      more={[
        { id: "code", label: "View code", onClick: () => setSub("code") },
        { id: "new_tab", label: "Open in a new tab", href: entry.demo },
        { id: "download", label: "Download the file", href: entry.demo, download: `${entry.slug}.html`, onClick: () => track("download_product", { product: entry.slug, from: "sheet" }) },
      ]}
      prev={prev && { title: prev.title, thumb: prev.thumbnail, go: () => onGo(prev.slug) }}
      next={next && { title: next.title, thumb: next.thumbnail, go: () => onGo(next.slug) }}
      sub={sub ? subs[sub] : null}
      onSubClose={() => setSub(null)}
      onClose={onClose}
    >
      <div className="isheet-rows">
        <SheetRow label="Controls" value={String(entry.controls.length)} onClick={() => setSub("controls")} />
        <SheetRow label="How it's built" value={entry.credits.length ? "Credits" : undefined} onClick={() => setSub("about")} />
        <SheetRow label="View the code" value={file} onClick={() => setSub("code")} />
      </div>
      <SheetCarousel
        title="More products"
        items={ordered().filter((o) => o.slug !== entry.slug).map((o) => ({ key: o.slug, title: o.title, sub: o.kind, thumb: o.thumbnail, onClick: () => onGo(o.slug) }))}
      />
    </ItemSheet>
  );
};

const ProductTile = ({ entry }: { entry: ProductEntry }) => (
  <LibraryCard
    kind="product"
    title={entry.title}
    sub={`${entry.kind.toLowerCase()} · ${entry.tags.filter((t) => t !== entry.kind.toLowerCase()).slice(0, 2).join(" · ")}`}
    to={`/products/${entry.slug}`}
    image={entry.thumbnail}
    copy={() => loadDemoSource(entry.demo)}
  />
);

const Products = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getProductBySlug(slug);
  const compact = useIsCompact();
  useAgentDark();

  useSeo({
    title: open ? open.title : "Products",
    description: open
      ? `${open.description}. One HTML file you can operate in your browser.`
      : "Product concepts you can actually operate: devices and apps, one HTML file each, every control drawn and wired inside.",
    canonical: open ? `/products/${open.slug}` : "/products",
    image: open?.thumbnail,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/products" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="products"
          title="PRODUCTS"
          description="Product concepts you can actually operate: devices and apps, one HTML file each, every control drawn and wired inside."
        />
        <AgentPanel />

        <div className="media-grid layer-grid">
          <div className="card-grid">
            {ordered().map((p) => (
              <ProductTile key={p.slug} entry={p} />
            ))}
          </div>
          <p className="sys-list-foot">
            <span>Not screenshots. Every control works.</span>
            <span>More products are being built.</span>
          </p>
        </div>
      </main>
      {open && compact && (
        <ProductSheet
          entry={open}
          onClose={() => navigate("/products")}
          onGo={(s) => navigate(`/products/${s}`, { replace: true })}
        />
      )}
      {open && !compact && (
        <ProductModal
          entry={open}
          onClose={() => navigate("/products")}
          onGo={(s) => navigate(`/products/${s}`, { replace: true })}
        />
      )}
    </div>
  );
};

export default Products;
