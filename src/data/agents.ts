export interface Agent {
  name: string;
  url: string;
  blurb: string;
}

export interface AgentGroup {
  id: string;
  label: string;
  /** How to use a one-shot prompt with this kind of tool */
  how: string;
  agents: Agent[];
}

/** Tools that can take a one-shot prompt and produce a working page or component. */
export const agentGroups: AgentGroup[] = [
  {
    id: "builders",
    label: "App builders",
    how: "Paste the prompt as your first message. They build, preview and host it.",
    agents: [
      { name: "Lovable", url: "https://lovable.dev", blurb: "Full-stack apps from chat" },
      { name: "Bolt.new", url: "https://bolt.new", blurb: "In-browser dev environment" },
      { name: "v0", url: "https://v0.app", blurb: "Vercel's UI and app builder" },
      { name: "Replit Agent", url: "https://replit.com", blurb: "Builds and deploys apps" },
      { name: "Figma Make", url: "https://www.figma.com/make", blurb: "Prompt to prototype in Figma" },
      { name: "Google AI Studio", url: "https://aistudio.google.com", blurb: "Build mode for web apps" },
      { name: "Firebase Studio", url: "https://firebase.studio", blurb: "Prototype and ship on Firebase" },
      { name: "Base44", url: "https://base44.com", blurb: "No-code apps from a prompt" }
    ]
  },
  {
    id: "chat",
    label: "Chat + canvas",
    how: "Paste the prompt and ask for a single HTML file. The page renders right in the chat.",
    agents: [
      { name: "Claude", url: "https://claude.ai", blurb: "Artifacts render live pages" },
      { name: "ChatGPT", url: "https://chatgpt.com", blurb: "Canvas previews HTML" },
      { name: "Gemini", url: "https://gemini.google.com", blurb: "Canvas previews HTML" },
      { name: "Le Chat", url: "https://chat.mistral.ai", blurb: "Mistral's canvas" }
    ]
  },
  {
    id: "coding",
    label: "Coding agents",
    how: "Paste the prompt and ask the agent to save it as index.html (or a component) in your project.",
    agents: [
      { name: "Claude Code", url: "https://www.claude.com/product/claude-code", blurb: "Agentic coding in your terminal" },
      { name: "Cursor", url: "https://cursor.com", blurb: "AI-first code editor" },
      { name: "GitHub Copilot", url: "https://github.com/features/copilot", blurb: "Agent mode in your IDE" },
      { name: "Windsurf", url: "https://windsurf.com", blurb: "Agentic IDE" },
      { name: "OpenAI Codex", url: "https://openai.com/codex", blurb: "Cloud and CLI coding agent" },
      { name: "Gemini CLI", url: "https://github.com/google-gemini/gemini-cli", blurb: "Open-source terminal agent" },
      { name: "Cline", url: "https://cline.bot", blurb: "Open-source agent for VS Code" },
      { name: "Aider", url: "https://aider.chat", blurb: "Pair programming in the terminal" }
    ]
  }
];
