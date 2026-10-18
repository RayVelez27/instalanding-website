import { useLayoutEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import GithubButton from "@/components/GithubButton";
import { AgentModeToggle, AgentPanel } from "@/components/AgentMode";
import { useAgentMode } from "@/lib/agentMode";
import { useSeo } from "@/hooks/useSeo";

const Index = () => {
  const agent = useAgentMode();
  // Agent Mode reveals a dark panel, so the home page goes dark with it.
  // Set before paint (no white flash) and only while this page is mounted.
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("agent-dark", agent);
    return () => document.documentElement.classList.remove("agent-dark");
  }, [agent]);

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
        <div className="library-intro-actions">
          <AgentModeToggle />
          <GithubButton />
        </div>
      </div>
      <AgentPanel />
      <PromptGrid />
    </main>
  </div>
  );
};

export default Index;
