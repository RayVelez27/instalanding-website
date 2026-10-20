import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import { AgentPanel } from "@/components/AgentMode";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";
import { useViewPref } from "@/hooks/useViewPref";
import ViewToggle from "@/components/ViewToggle";
import { Disc3, LayoutGrid } from "lucide-react";

const Index = () => {
  useAgentDark();
  const [view, pickView] = useViewPref("il-pages-view", "crate");

  useSeo({
    title: "Landing Pages — One-Shot HTML Library",
    description:
      "Premium landing pages built for humans and agents. Each one is a single HTML file with no dependencies, plus the one-shot prompt that builds it. Copy it, remix it, ship it. Free and MIT.",
    canonical: "/pages",
  });
  return (
  <div className="app-layout">
    <Sidebar />
    <main>
      <SiteTopBar />
      <ViewToggle
        view={view}
        onPick={pickView}
        options={[
          { id: "grid", label: "GRID", Icon: LayoutGrid, note: "Every page at once" },
          { id: "crate", label: "CRATE", Icon: Disc3, note: "Dig through them like records" },
        ]}
      />
      {view === "grid" && (
      <RouteBanner
        tone="pages"
        title="LANDING PAGES"
        description="Premium pages built for humans and agents. One file. No dependencies. Copy it, remix it, ship it."
      />
      )}
      <AgentPanel />
      <PromptGrid views={{ view, pick: pickView }} />
    </main>
  </div>
  );
};

export default Index;
