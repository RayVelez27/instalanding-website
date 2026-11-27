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
  /** How to use one icon file, after "Each icon is its own file" */
  single: string;
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
    slug: "healthcare-buttons",
    title: "Healthcare Buttons",
    description:
      "Six animated buttons for a patient portal (find a doctor, schedule, virtual care, refill prescription, online check-in and lab results), teal glass tiles with flat illustrations that pop a pill, bandage or syringe label on hover and act out their task on click",
    added: "Nov 26, 2026",
    kind: "Illustrated buttons",
    tech: "Decoded Rive · Canvas 2D · no libraries",
    tags: ["healthcare", "medical", "buttons", "hover", "click", "animated", "illustration"],
    interaction:
      "Hover a button and its label slides out on a capsule, bandage or syringe. Click it and it acts: the doctor becomes a map pin, the calendar gets a date circled, the laptop opens a video call, the pill bottle pops its cap, the check-in board flips, and the centrifuge lifts out a sample vial.",
    single:
      "with the button fitted to its canvas, label included: size the canvas to place it and change the page background to yours.",
    credits: [
      "Decoded from a Rive file and redrawn by a small Canvas 2D engine inlined in each file; no Rive runtime.",
      "Label font: Sofia Sans Extra Condensed, SIL Open Font License.",
    ],
    demo: "/icon-sets/healthcare-buttons/index.html",
    thumbnail: "/icon-sets/healthcare-buttons.jpg",
    icons: set("healthcare-buttons", [
      ["doctor", "Find a doctor"],
      ["schedule", "Schedule an appointment"],
      ["virtual-care", "Virtual care"],
      ["refill", "Refill prescription"],
      ["check-in", "Online check-in"],
      ["lab-results", "Lab results"],
    ]),
  },
  {
    slug: "css-software-icons",
    title: "Pure CSS Software Icons",
    description:
      "Nine software icons drawn in nothing but CSS (cloud upload, settings, terminal, code, sun, database, sync, lock and chat), white on near-black with a cyan accent, each idling on its own loop and doing its job when the pointer lands on it",
    added: "Nov 26, 2026",
    kind: "Pure CSS",
    tech: "HTML + CSS · no SVG, no JavaScript",
    tags: ["css only", "line icons", "hover", "animated", "developer", "app icons"],
    interaction:
      "Hover an icon and it performs its action: the cloud uploads, the gears whir, the terminal types a command, the code brackets spring apart, the sun blooms, the database streams data, sync spins double time, the lock opens and the chat bubble pops a reply.",
    single:
      "made of plain divs: size it with font-size on .icon, and set color on the page to your background, since the shapes are cut out of it.",
    credits: ["Hand-built CSS shapes and keyframes; no fonts, images or scripts."],
    demo: "/icon-sets/css-software-icons/index.html",
    thumbnail: "/icon-sets/css-software-icons.jpg",
    icons: set("css-software-icons", [
      ["cloud", "Cloud upload"],
      ["settings", "Settings"],
      ["terminal", "Terminal"],
      ["code", "Code"],
      ["sun", "Sun"],
      ["database", "Database"],
      ["sync", "Sync"],
      ["lock", "Lock"],
      ["chat", "Chat"],
    ]),
  },
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
    single: "with a transparent canvas: size the canvas to place it.",
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
