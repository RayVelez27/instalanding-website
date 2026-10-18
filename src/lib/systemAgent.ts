import type { SystemEntry } from "@/data/systems";
import type { PromptEntry } from "@/data/prompts";

/**
 * COPY FOR AGENT on a system: an instruction a coding agent can act on in the
 * user's own project. It pins the version, says where every file lives, carries
 * the tokens inline (so it works even if the agent cannot fetch), and spells
 * out the conventions the tokens alone don't capture.
 */
export function systemAgentInstruction(
  system: SystemEntry,
  opts: { siteUrl: string; tokensCss?: string; templates: PromptEntry[]; components: { id: string; label: string }[] },
) {
  const { siteUrl, tokensCss, templates, components } = opts;
  const id = `${system.slug}@${system.version}`;
  const url = (p: string) => `${siteUrl}${p}`;
  const lines = [
    `Apply the InstaLanding design system ${system.name.toUpperCase()} (${id}) to my current application.`,
    ``,
    system.description,
    ``,
    `SOURCES (public, no key needed)`,
    `- System CSS, tokens + every component, scoped under .${system.rootClass} with ${system.prefix}- class names: ${url(system.files.css)}`,
    `- Tokens only: ${url(system.files.tokens)}`,
    `- Specimen, every component live in one HTML file: ${url(system.files.specimen)}`,
    `  Each component is a <section data-component="id">; the markup inside .sp-demo is the component. Shared SVG gradients are in <svg id="${system.prefix}-defs">, the interaction script in <script id="${system.prefix}-components-js">.`,
    `- Fonts: ${system.fontsHref}`,
    ...templates.map((t) => `- Extracted from "${t.title}": ${url(t.demo ?? `/prompt/${t.slug}`)} (its brief: ${url(`/p/${t.slug}.txt`)})`),
    ``,
    `COMPONENTS (${components.length}): ${components.map((c) => c.id).join(", ")}`,
    ``,
    ...system.conventions.flatMap((g) => [g.title.toUpperCase(), ...g.rules.map((r) => `- ${r}`), ``]),
    `HOW TO APPLY`,
    `1. Load the fonts and link (or copy in) the system CSS. Put the ${system.prefix}- tokens on :root and wrap the restyled UI in an element with class "${system.rootClass}".`,
    `2. Map my existing UI to the system's components: buttons, navigation, cards, forms, lists, badges and sections. Reuse the specimen's markup and class names rather than recreating them from screenshots.`,
    `3. Use the tokens (var(--${system.prefix}-...)) for every colour, font, radius, border, shadow and timing; don't introduce new values unless a token is genuinely missing, and then add it in the same naming scheme.`,
    `4. Preserve all existing business logic, routes, APIs, state management, forms and data. This is a visual change only.`,
    `5. Keep it responsive and accessible: the focus rings, aria labels, reduced-motion handling and the auto-fit grids are part of the system.`,
    `6. Pin this version (${id}). If you vendor the files, keep the version in a comment at the top.`,
  ];
  if (tokensCss) lines.push(``, `TOKENS (${id})`, "```css", tokensCss, "```");
  return lines.join("\n") + "\n";
}
