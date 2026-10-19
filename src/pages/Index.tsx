import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import SiteTopBar from "@/components/SiteTopBar";
import RouteBanner from "@/components/RouteBanner";
import { AgentPanel } from "@/components/AgentMode";
import { PAGES } from "@/lib/libraryItems";
import { useAgentDark } from "@/hooks/useAgentDark";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useAgentDark();

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
      <RouteBanner
        tone="pages"
        kicker={`ONE-SHOT HTML LIBRARY · ${PAGES.length} PAGES`}
        title="LANDING PAGES"
        description="Premium pages built for humans and agents. One file. No dependencies. Copy it, remix it, ship it."
      />
      <AgentPanel />
      <PromptGrid />
    </main>
  </div>
  );
};

export default Index;
