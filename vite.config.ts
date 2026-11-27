import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import libraryEndpoints from "./plugins/library-endpoints.mjs";
import stripBriefs from "./plugins/strip-briefs.mjs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    // The written briefs are fetched from /p and /m when needed, not shipped in the bundle.
    stripBriefs(),
    react(),
    // Publishes /prompts.json, /p/<slug>.txt|json and /llms.txt for agents.
    libraryEndpoints({ siteUrl: process.env.SITE_URL ?? "https://instalanding.ai" }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
