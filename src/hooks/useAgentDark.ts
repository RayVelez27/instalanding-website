import { useLayoutEffect } from "react";
import { useAgentMode } from "@/lib/agentMode";

/**
 * Agent Mode reveals a dark panel, so the page goes dark with it. Set before
 * paint (no white flash) and only while the calling page is mounted.
 */
export function useAgentDark() {
  const agent = useAgentMode();
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("agent-dark", agent);
    return () => document.documentElement.classList.remove("agent-dark");
  }, [agent]);
  return agent;
}
