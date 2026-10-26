/**
 * The PROMPT for a library page: a short instruction, then the page's whole
 * HTML file. CODE is the same file on its own.
 *
 * A prose brief leaves the builder to guess what the page looks like; the code
 * cannot be misread. Wrapping it in a prompt is what makes it something you
 * paste into an agent: the instruction says what to keep, what to replace and
 * how to check the result, and the file says everything else.
 *
 * Shared by the site (COPY PROMPT) and the build (plugins/library-endpoints.mjs,
 * which serves it as /p/<slug>.txt and through MCP get_prompt), so people and
 * agents always get the same text. Import-free on purpose: the plugin evaluates
 * this file directly, the way it reads src/data/prompts.ts.
 */

export type CodePromptEntry = { slug: string; title: string; demo?: string };

/** The instruction above the code. Split out so the site can show it on its own. */
export const codePromptIntro = (entry: CodePromptEntry, siteUrl = "https://instalanding.ai") => {
  const site = siteUrl.replace(/\/+$/, "");
  return [
    `INSTALANDING.AI · ${entry.title}`,
    "",
    "The page below is the build. Use it as the starting point, not as inspiration:",
    "- Keep its layout, design values (colours, type, spacing, radii) and motion exactly as they are.",
    "- Replace the fictional brand, copy, names and numbers with mine.",
    "- If I name a stack (React, Next.js, Vue, Svelte, Astro...), convert it faithfully to that stack;",
    "  otherwise ship it as this one HTML file.",
    "- Read the MAP and ADAPTING notes in its header comment before you edit.",
    "- Check it in a real browser: no console errors, no horizontal scroll at 390px, reduced motion respected.",
    "",
    `Credit: keep this line as a comment at the top of the file you produce:`,
    `${entry.title} · INSTALANDING.AI (MIT) · ${site}/prompt/${entry.slug}`,
  ].join("\n");
};

/** The whole PROMPT: the instruction, then the file in a fenced block. */
export const codePrompt = (entry: CodePromptEntry, html: string, siteUrl = "https://instalanding.ai") => {
  const file = entry.demo?.split("/").pop() ?? "index.html";
  return `${codePromptIntro(entry, siteUrl)}\n\n${file}:\n\`\`\`html\n${html.trimEnd()}\n\`\`\`\n`;
};
