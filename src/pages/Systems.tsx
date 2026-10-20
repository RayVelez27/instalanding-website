import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BookOpen, LayoutGrid } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SystemModal from "@/components/SystemModal";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import { AgentPanel } from "@/components/AgentMode";
import { useAgentDark } from "@/hooks/useAgentDark";
import FilterRow from "@/components/FilterRow";
import ViewToggle from "@/components/ViewToggle";
import SystemBook from "@/components/SystemBook";
import LibraryCard from "@/components/LibraryCard";
import { rankTags, systemTagsOf } from "@/lib/feedTags";
import { getSystemBySlug, systemCover, systems, type SystemEntry } from "@/data/systems";
import { getPromptBySlug, interleaveByTheme, type PromptEntry } from "@/data/prompts";
import { useSpecimen } from "@/lib/systemSpecimen";
import { systemAgentInstruction } from "@/lib/systemAgent";
import { SITE_URL } from "@/lib/agentMode";
import { useSeo } from "@/hooks/useSeo";

/**
 * /systems and /systems/:slug. A compact list: one short row per design system
 * (thumbnail, name, tagline, palette and counts, actions), so many fit on a
 * screen; the full system lives in its dialog. A slug opens that system's dialog over
 * the list, so every system has a URL that can be shared.
 */
const SystemTile = ({ system }: { system: SystemEntry }) => {
  const state = useSpecimen(system);
  const spec = state.status === "ready" ? state.specimen : null;

  const templates = system.templates.map((s) => getPromptBySlug(s)).filter((p): p is PromptEntry => !!p);
  const href = `/systems/${system.slug}`;


  return (
    <LibraryCard
      kind="system"
      title={system.name}
      sub={`${system.components.length} components · ${system.theme}`}
      to={href}
      image={systemCover(system)}
      frames={system.files.posters}
      copy={async () =>
        systemAgentInstruction(system, { siteUrl: SITE_URL, tokensCss: spec?.tokensCss, templates, components: system.components })
      }
      copyLabel="COPY FOR AGENT"
      agent
    />
  );
};

/* A new order on every page load, like the home feed (light and dark dealt
   alternately). Kept for the whole visit, so opening and closing a system's
   dialog, which changes the route, doesn't reshuffle the list behind it. */
let dealt: SystemEntry[] | null = null;
const order = () => (dealt ??= interleaveByTheme(systems));

type View = "grid" | "book";
const VIEW_KEY = "il-systems-view";
const readView = (): View => {
  try {
    return localStorage.getItem(VIEW_KEY) === "book" ? "book" : "grid";
  } catch {
    return "grid";
  }
};

const Systems = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const open = getSystemBySlug(slug);
  useAgentDark();
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<View>(readView);
  const pickView = (v: View) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  };
  const tags = useMemo(() => rankTags(systems.map(systemTagsOf)), []);
  const shown = filter === "all" ? order() : order().filter((s) => systemTagsOf(s).includes(filter));

  useSeo({
    title: open ? `${open.name} Design System` : "Design Systems",
    description: open
      ? `${open.tagline}. Tokens, ${open.components.length} working components and agent instructions, extracted from a real InstaLanding template.`
      : "The design languages behind InstaLanding's pages: tokens, working components and agent instructions, extracted from real HTML.",
    canonical: open ? `/systems/${open.slug}` : "/systems",
    image: open ? systemCover(open) : undefined,
    imageSize: open ? [1200, 600] : undefined,
  });

  if (slug && !open) return <Navigate to="/systems" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <SiteTopBar />
        <ViewToggle
          view={view}
          onPick={pickView}
          options={[
            { id: "grid", label: "GRID", Icon: LayoutGrid, note: "Every system at once" },
            { id: "book", label: "BOOK", Icon: BookOpen, note: "A page per system" },
          ]}
        />
        {view === "grid" && (
          <RouteBanner
            tone="systems"
            title="DESIGN SYSTEMS"
            description="The language behind the pages. Tokens, working components and agent instructions, extracted from real HTML."
          />
        )}
        <AgentPanel />

        <div className={`media-grid layer-grid${view === "grid" ? "" : " media-grid--view"}`}>
          {view === "grid" ? (
            <>
              <FilterRow tags={tags} total={systems.length} active={filter} onPick={setFilter} label="Filter design systems by style" />
              <div className="card-grid">
                {shown.map((s) => (
                  <SystemTile key={s.slug} system={s} />
                ))}
              </div>
            </>
          ) : (
            <SystemBook systems={order()} />
          )}
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
