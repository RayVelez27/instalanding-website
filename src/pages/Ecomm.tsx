import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Bot, Check, Copy, ExternalLink, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import LibraryCard from "@/components/LibraryCard";
import PromptStage from "@/components/PromptStage";
import { AgentPanel } from "@/components/AgentMode";
import { ecomm, getEcommBySlug, type EcommEntry } from "@/data/ecomm";
import type { PromptEntry } from "@/data/prompts";
import { SITE_URL } from "@/lib/agentMode";
import { copyText } from "@/lib/copyText";
import { useCopyCode } from "@/lib/useCopyCode";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { track } from "@/lib/track";

/**
 * /ecomm and /ecomm/:slug. E-COMM entries are landing pages, like PAGES, and
 * open in the same dialog: the live preview at desktop or mobile width with
 * the source on CODE, COPY CODE and a new tab. They keep a tab of their own so
 * store pages are found together, and add one action PAGES doesn't have:
 * COPY FOR AGENT, the brief for turning the page into a Shopify store.
 */

/** The PAGES stage and copy hook take a PromptEntry; an E-COMM page fills the parts they read */
const asPage = (e: EcommEntry): PromptEntry => ({
  slug: e.slug,
  title: e.title,
  category: "web",
  categoryLabel: "E-COMM",
  description: e.description,
  prompt: "",
  preview: "hero",
  variant: "large",
  added: e.added,
  demo: e.demo,
  thumbnail: e.thumbnail,
  theme: e.theme,
  bestFor: e.bestFor,
  style: e.tags,
});

/** The brief COPY FOR AGENT hands over: the file by URL (it can run past a megabyte) and the job */
const agentTask = (e: EcommEntry) =>
  [
    `Build my store's landing page from "${e.title}" on InstaLanding (${SITE_URL}/ecomm/${e.slug}).`,
    "",
    `The page is one HTML file: ${SITE_URL}${e.demo}`,
    "Download it and keep its markup, CSS and motion. Then wire it to my store:",
    "- Shopify theme (Liquid): make it the home template, split into sections; product cards read real products and their Shop buttons post to /cart/add.js.",
    "- Shopify Hydrogen (React): make it the index route; load products in the loader and add to cart with CartForm.",
    "- Anything else: replace the product names, prices and links with my catalog.",
    "Ask me which platform and which products to feature before you start.",
  ].join("\n");

const useFlash = () => {
  const [on, setOn] = useState(false);
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  const flash = () => {
    setOn(true);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setOn(false), 1800);
  };
  return { on, flash };
};

const EcommModal = ({ entry, onClose, onGo }: { entry: EcommEntry; onClose: () => void; onGo: (slug: string) => void }) => {
  const page = useMemo(() => asPage(entry), [entry]);
  const { copy, copied, label: copyLabel, text: copyCaption, source } = useCopyCode(page, "ecomm_modal");
  const agent = useFlash();
  const index = ecomm.findIndex((e) => e.slug === entry.slug);
  const prev = index > 0 ? ecomm[index - 1] : null;
  const next = index < ecomm.length - 1 ? ecomm[index + 1] : null;
  const others = ecomm.filter((e) => e.slug !== entry.slug);

  /* Arrow keys walk the E-COMM pages without closing, like PAGES */
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
                E-COMM · {entry.vertical.toUpperCase()} · ADDED {entry.added.toUpperCase()}
                <span className={`pmodal-theme pmodal-theme--${entry.theme}`}>
                  <span className="pmodal-theme-dot" aria-hidden="true" />
                  {entry.theme === "dark" ? "DARK" : "LIGHT"}
                </span>
              </p>
              <Dialog.Title className="pmodal-title">{entry.title}</Dialog.Title>
              <Dialog.Description className="pmodal-desc">{entry.description}</Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="pmodal-main">
            <PromptStage entry={page} source={source} />

            <section className="pmodal-side" aria-label="Page">
              <div className="pmodal-actions">
                <button className="pmodal-btn pmodal-btn--solid" onClick={copy} aria-live="polite" title={copyLabel}>
                  {copied === "done" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                  <span className="pmodal-label">{copyCaption}</span>
                </button>
                <a className="pmodal-btn" href={entry.demo} target="_blank" rel="noreferrer" title="Open in a new tab" onClick={() => track("open_ecomm", { page: entry.slug, from: "modal" })}>
                  <span className="pmodal-label">NEW TAB</span> <ExternalLink size={12} aria-hidden="true" />
                </a>
                <button
                  className="pmodal-btn"
                  onClick={() => copyText(agentTask(entry)).then(() => { agent.flash(); track("copy_ecomm", { page: entry.slug, copied: "agent_task" }); }, () => {})}
                  aria-live="polite"
                  title="Copy a brief for turning this page into a Shopify store"
                >
                  {agent.on ? <Check size={12} aria-hidden="true" /> : <Bot size={12} aria-hidden="true" />}
                  <span className="pmodal-label">{agent.on ? "COPIED" : "COPY FOR AGENT"}</span>
                </button>
              </div>

              <div className="pmodal-body">
                <div className="pmodal-body-head">
                  <span>BUILT FOR</span>
                </div>
                <div className="ecom-body">
                  <ul className="ecom-best">
                    {entry.bestFor.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <p className="ecom-note">
                    <b>SHOPIFY · HYDROGEN</b>
                    One HTML file, no framework. Hand it to your agent with COPY FOR AGENT and it becomes a Liquid
                    home template or a Hydrogen route, with your products in the cards.
                  </p>
                  {others.length > 0 && (
                    <>
                      <div className="pmodal-body-head">
                        <span>MORE E-COMM</span>
                        <span>
                          {others.length} OF {ecomm.length}
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
                                <span className="pmodal-more-cat">{o.vertical.toUpperCase()}</span>
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

const EcommTile = ({ entry }: { entry: EcommEntry }) => (
  <LibraryCard
    kind="ecomm"
    title={entry.title.replace(/ Page$/, "")}
    sub={`${entry.vertical.toLowerCase()} · ${entry.tags.filter((t) => t !== "dark" && t !== "light").slice(0, 2).join(" · ").replace(/-/g, " ")}`}
    to={`/ecomm/${entry.slug}`}
    image={entry.thumbnail}
    copy={() => fetch(entry.demo).then((r) => r.text())}
  />
);

const Ecomm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getEcommBySlug(slug);
  useAgentDark();

  useSeo({
    title: open ? open.title : "E-commerce Landing Pages",
    description: open
      ? `${open.description}. One HTML file, ready for an agent to turn into a Shopify theme or a Hydrogen route.`
      : "Landing pages for stores and products, one HTML file each with no dependencies, ready for an agent to turn into a Shopify theme or a Hydrogen route.",
    canonical: open ? `/ecomm/${open.slug}` : "/ecomm",
    image: open?.thumbnail,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/ecomm" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="ecomm"
          title="E-COMM PAGES"
          description="Landing pages for stores and products. One HTML file each, ready for your agent to turn into a Shopify theme or a Hydrogen route."
        />
        <AgentPanel />

        <div className="media-grid layer-grid">
          <div className="card-grid">
            {ecomm.map((e) => (
              <EcommTile key={e.slug} entry={e} />
            ))}
          </div>
          <p className="sys-list-foot">
            <span>Pages that sell. Same one-file rules as PAGES.</span>
            <span>More store pages are being built.</span>
          </p>
        </div>
      </main>
      {open && (
        <EcommModal
          entry={open}
          onClose={() => navigate("/ecomm")}
          onGo={(s) => navigate(`/ecomm/${s}`, { replace: true })}
        />
      )}
    </div>
  );
};

export default Ecomm;
