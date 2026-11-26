/**
 * ICONS: animated icon sets. Each set is one HTML file that shows every icon
 * (public/icon-sets/<slug>/index.html), plus one standalone file per icon in
 * the same folder, so an icon can be copied on its own or the whole set at
 * once. Never under /icons/, which is the dialog's URL.
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 */

export interface IconEntry {
  /** The artboard's name in the source file, and the file name */
  id: string;
  name: string;
  /** The standalone single-icon HTML file */
  file: string;
}

export interface IconSetEntry {
  slug: string;
  title: string;
  /** One sentence, like a PAGES description */
  description: string;
  added: string;
  /** The look in a few words: "glassmorphism" */
  kind: string;
  /** What it is made with */
  tech: string;
  tags: string[];
  /** How the icons respond */
  interaction: string;
  /** Third-party assets and their licences */
  credits: string[];
  /** The whole set in one file */
  demo: string;
  /** 1200x600 still of the set */
  thumbnail: string;
  icons: IconEntry[];
}

const set = (slug: string, ids: [string, string][]) =>
  ids.map(([id, name]) => ({ id, name, file: `/icon-sets/${slug}/${id}.html` }));

export const iconSets: IconSetEntry[] = [
  {
    slug: "glassmorphism-material",
    title: "Glassmorphism Material Icons",
    description:
      "Nine frosted-glass icons on a deep violet field (account, lock, picture, location pin, plant, credit card, calendar, clock and documents), each lit by a neon gradient behind the glass, that lift, glow and catch a sheen of light as the pointer passes over them",
    added: "Nov 26, 2026",
    kind: "Glassmorphism",
    tech: "Decoded Rive · Canvas 2D · no libraries",
    tags: ["glass", "gradient", "hover", "animated", "app icons"],
    interaction:
      "Hover an icon and it lifts on a soft violet halo: a spotlight follows the pointer across the glass, a sheen sweeps over it once and the rim catches the light. Each icon also plays its own state-machine animation.",
    credits: ["Decoded from a Rive file and redrawn by a small Canvas 2D engine inlined in each file; no Rive runtime."],
    demo: "/icon-sets/glassmorphism-material/index.html",
    thumbnail: "/icon-sets/glassmorphism-material.jpg",
    icons: set("glassmorphism-material", [
      ["pin", "Location pin"],
      ["card", "Credit card"],
      ["docs", "Documents"],
      ["account", "Account"],
      ["time", "Clock"],
      ["calendar", "Calendar"],
      ["key", "Lock"],
      ["pic", "Picture"],
      ["plant", "Plant"],
    ]),
  },
];

export const getIconSetBySlug = (slug?: string) => iconSets.find((s) => s.slug === slug);
