import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import StarOnGithub from "@/components/StarOnGithub";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  useSeo({
    title: "InstaLanding.ai — One-Shot HTML Library for Humans and Agents",
    rawTitle: true,
    description:
      "Premium landing pages built for humans and agents. Each one is a single HTML file with no dependencies, plus the one-shot prompt that builds it. Copy it, remix it, ship it. Free and MIT.",
    canonical: "/",
  });
  return (
  <div className="app-layout">
    <Sidebar />
    <main>
      <div className="library-intro">
        <div className="library-intro-text">
          <p className="library-intro-kicker">ONE-SHOT HTML LIBRARY</p>
          <p className="library-intro-sub">
            Premium pages built for humans and agents. One file. No dependencies. Copy it, remix it, ship it.
          </p>
        </div>
        <StarOnGithub />
      </div>
      <PromptGrid invite />
    </main>
  </div>
  );
};

export default Index;
