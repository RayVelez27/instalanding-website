import { Fragment, useMemo, useState } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { feedPrompts, promptsInCategory, type PromptEntry } from "@/data/prompts";
import PromptThumb from "@/components/PromptThumb";
import { copyText, copyTextLater } from "@/lib/copyText";
import { loadDemoSource } from "@/lib/demoSource";
import { agentHandoff, useAgentMode } from "@/lib/agentMode";
import { useIsPhone } from "@/hooks/useIsPhone";
import FilterRow from "@/components/FilterRow";
import PageCrate from "@/components/PageCrate";
import LibraryCard from "@/components/LibraryCard";
import { feedTags, tagsOf } from "@/lib/feedTags";
import { track } from "@/lib/track";

/* ── Card: the shared library card, fed from a prompt entry ── */

const pageSub = (p: PromptEntry) =>
  p.youtube
    ? "video"
    : (p.style ?? [])
        .filter((t) => t !== "dark" && t !== "light")
        .slice(0, 2)
        .join(" · ")
        .replace(/-/g, " ") || p.categoryLabel.toLowerCase();

const PageCard = ({ entry, agent }: { entry: PromptEntry; agent: boolean }) => {
  const location = useLocation();
  const phone = useIsPhone();
  const asModal = phone ? undefined : { backgroundLocation: location };
  /* COPY CODE puts the demo's whole HTML file on the clipboard, like the detail
     view's. An entry with no single-file demo (code in its own repo) copies its
     prompt; Agent Mode copies a task for the user's agent; a video has none. */
  const copy = entry.youtube
    ? undefined
    : agent
      ? async () => agentHandoff(entry)
      : entry.demo
        ? () => loadDemoSource(entry.demo!)
        : async () => entry.prompt;
  return (
    <LibraryCard
      kind="page"
      title={entry.title.replace(/ Landing Page$| Page$/, "")}
      sub={pageSub(entry)}
      to={`/prompt/${entry.slug}`}
      state={asModal}
      art={<PromptThumb entry={entry} />}
      video={!!entry.youtube}
      copy={copy}
      agent={agent && !entry.youtube}
      copyLabel={agent ? "COPY FOR AGENT" : entry.demo ? "COPY CODE" : "COPY PROMPT"}
      onPointerEnter={() => {
        if (entry.demo && !agent) loadDemoSource(entry.demo).catch(() => {});
      }}
    />
  );
};

/* ── Phones: after the first rows, point at the new SYSTEMS section ── */

const SystemsBanner = () => (
  <Link to="/systems" className="feed-banner">
    <span className="feed-banner-badge">NEW</span>
    <span className="feed-banner-text">
      <b>Design systems</b>
      <span>Tokens, components and agent instructions from real pages</span>
    </span>
    <ArrowRight size={16} aria-hidden="true" />
  </Link>
);

/* ── Phones: a way back up, after the very last item ── */

const BackToTop = ({ count }: { count: number }) => (
  <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
    <ArrowUp size={14} aria-hidden="true" />
    BACK TO TOP
    <span>{count} {count === 1 ? "template" : "templates"}</span>
  </button>
);

/* ── Grid ── */

export type PagesView = "grid" | "crate";

/**
 * `views` adds the GRID / CRATE switch (on /pages only). The page owns the
 * choice (useViewPref), because CRATE also hides the page's banner.
 */
const PromptGrid = ({ category, views }: { category?: string; views?: { view: PagesView; pick: (v: PagesView) => void } }) => {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const view: PagesView = views ? views.view : "grid";
  const agent = useAgentMode();

  // promptsInCategory, not a filter over the interleaved list: filtering an
  // alternating run closes the gaps and the themes clump again.
  const all = category ? promptsInCategory(category) : feedPrompts;
  const tags = useMemo(() => feedTags(all), [all]);
  const [filter, setFilter] = useState("all");
  // Filtering keeps the feed's order, so the light / dark alternation mostly holds
  const items = useMemo(() => (filter === "all" ? all : all.filter((p) => tagsOf(p).includes(filter))), [all, filter]);

  /* COPY puts the demo's whole HTML file on the clipboard, like the detail
     view's COPY CODE. An entry with no single-file demo (code in its own repo)
     has no HTML to copy, so it copies the prompt. Agent Mode copies a task. */
  const handleCopy = async (entry: PromptEntry) => {
    try {
      if (agent) await copyText(agentHandoff(entry));
      else if (entry.demo) await copyTextLater(loadDemoSource(entry.demo));
      else await copyText(entry.prompt);
    } catch {
      return;
    }
    setCopiedSlug(entry.slug);
    track("copy_code", { template: entry.slug, from: "crate", copied: agent ? "agent_task" : entry.demo ? "code" : "prompt" });
    setTimeout(() => setCopiedSlug((s) => (s === entry.slug ? null : s)), 2000);
  };

  return (
    <div className={`media-grid${view === "crate" ? " media-grid--view" : ""}`}>
      {view === "grid" && <FilterRow tags={tags} total={all.length} active={filter} onPick={setFilter} />}
      {view === "crate" ? (
        <PageCrate items={all} label="PAGES" onCopy={handleCopy} copiedSlug={copiedSlug} />
      ) : (
      <div className="card-grid">
        {items.map((p, i) => (
          <Fragment key={p.slug}>
            {i === 4 && !category && filter === "all" && <SystemsBanner />}
            <PageCard entry={p} agent={agent} />
          </Fragment>
        ))}
      </div>
      )}
      {view === "grid" && <BackToTop count={items.length} />}
    </div>
  );
};

export default PromptGrid;
