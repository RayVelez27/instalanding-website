import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, Link } from "react-router-dom";
import { ArrowUpRight, Bot, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SystemModal from "@/components/SystemModal";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import { AgentPanel } from "@/components/AgentMode";
import { useAgentDark } from "@/hooks/useAgentDark";
import FilterRow from "@/components/FilterRow";
import { rankTags, systemTagsOf } from "@/lib/feedTags";
import { getSystemBySlug, systems, type SystemEntry } from "@/data/systems";
import { getPromptBySlug, interleaveByTheme, type PromptEntry } from "@/data/prompts";
import { useSpecimen } from "@/lib/systemSpecimen";
import { systemAgentInstruction } from "@/lib/systemAgent";
import { copyText } from "@/lib/copyText";
import { SITE_URL } from "@/lib/agentMode";
import { useSeo } from "@/hooks/useSeo";

/**
 * /systems and /systems/:slug. A compact list: one short row per design system
 * (thumbnail, name, tagline, palette and counts, actions), so many fit on a
 * screen; the full system lives in its dialog. A slug opens that system's dialog over
 * the list, so every system has a URL that can be shared.
 */
const SystemRow = ({ system }: { system: SystemEntry }) => {
  const state = useSpecimen(system);
  const spec = state.status === "ready" ? state.specimen : null;
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const templates = system.templates.map((s) => getPromptBySlug(s)).filter((p): p is PromptEntry => !!p);
  const tokenCount = spec ? spec.groups.reduce((n, g) => n + g.tokens.length, 0) : null;
  const href = `/systems/${system.slug}`;

  const copyForAgent = async () => {
    await copyText(systemAgentInstruction(system, { siteUrl: SITE_URL, tokensCss: spec?.tokensCss, templates, components: system.components }));
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="sys-row" aria-labelledby={`sys-${system.slug}`}>
      <Link to={href} className="sys-row-thumb" tabIndex={-1} aria-hidden="true">
        <img src={system.files.preview} alt="" width={1200} height={600} loading="lazy" decoding="async" />
      </Link>

      <div className="sys-row-main">
        <h2 className="sys-row-name" id={`sys-${system.slug}`}>
          {/* The whole row is this link (stretched over it); the buttons sit above it */}
          <Link to={href} className="sys-row-link">{system.name}</Link>
          <span className="sys-row-id">{system.slug}@{system.version}</span>
        </h2>
        <p className="sys-row-tagline">{system.tagline}</p>
        <p className="sys-row-meta">
          <span className="sys-row-palette" aria-label={`Palette: ${system.palette.join(", ")}`}>
            {system.palette.map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          <span>{system.components.length} components</span>
          <span>{tokenCount === null ? "—" : tokenCount} tokens</span>
          <span>{templates.length} {templates.length === 1 ? "template" : "templates"}</span>
          <span className="sys-row-theme">{system.theme}</span>
        </p>
      </div>

      <div className="sys-row-actions">
        <button className="sys-row-btn" onClick={copyForAgent} aria-live="polite" title="Copy an instruction your coding agent can apply">
          {copied ? <Check size={12} aria-hidden="true" /> : <Bot size={12} aria-hidden="true" />}
          <span>{copied ? "COPIED" : "FOR AGENT"}</span>
        </button>
        <Link to={href} className="sys-row-btn sys-row-btn--solid">
          <span>OPEN</span> <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

/* A new order on every page load, like the home feed (light and dark dealt
   alternately). Kept for the whole visit, so opening and closing a system's
   dialog, which changes the route, doesn't reshuffle the list behind it. */
let dealt: SystemEntry[] | null = null;
const order = () => (dealt ??= interleaveByTheme(systems));

const Systems = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getSystemBySlug(slug);
  useAgentDark();
  const [filter, setFilter] = useState("all");
  const tags = useMemo(() => rankTags(systems.map(systemTagsOf)), []);
  const shown = filter === "all" ? order() : order().filter((s) => systemTagsOf(s).includes(filter));

  useSeo({
    title: open ? `${open.name} Design System` : "Design Systems",
    description: open
      ? `${open.tagline}. Tokens, ${open.components.length} working components and agent instructions, extracted from a real InstaLanding template.`
      : "The design languages behind InstaLanding's pages: tokens, working components and agent instructions, extracted from real HTML.",
    canonical: open ? `/systems/${open.slug}` : "/systems",
    image: open?.files.preview,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/systems" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <RouteBanner
          tone="systems"
          kicker={`${systems.length} SYSTEMS · TOKENS · COMPONENTS`}
          title="DESIGN SYSTEMS"
          description="The language behind the pages. Tokens, working components and agent instructions, extracted from real HTML."
        />
        <AgentPanel />

        <div className="sys-list">
          <FilterRow tags={tags} total={systems.length} active={filter} onPick={setFilter} label="Filter design systems by style" />
          {shown.map((s) => (
            <SystemRow key={s.slug} system={s} />
          ))}
          <p className="sys-list-foot">
            <span>A template is a finished page. A system is how to build more of it.</span>
            <span>More systems are being extracted from the library.</span>
          </p>
        </div>
      </main>
      {open && <SystemModal system={open} onClose={() => navigate("/systems")} />}
    </div>
  );
};

export default Systems;
