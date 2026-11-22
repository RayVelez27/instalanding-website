/**
 * PRODUCTS: interactive product concepts, a device or an app you can actually
 * operate. Each entry is one HTML file under public/product-demos/ (never under
 * /products/, which is the dialog's URL) with every asset inlined, so it runs
 * opened straight from disk.
 *
 * Not the parked PRODUCT category in prompts.ts (/product): that one holds
 * prompt entries behind a Coming Soon page. This is its own tab.
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 */

export interface ProductEntry {
  slug: string;
  title: string;
  /** One sentence, like a PAGES description */
  description: string;
  added: string;
  /** What it is: "Hardware concept", "Mobile app"… */
  kind: string;
  /** What it is made with */
  tech: string;
  tags: string[];
  /** The product's controls and what each does, shown beside the live preview */
  controls: { control: string; does: string }[];
  /** Third-party assets and marks, and their licences or disclaimers */
  credits: string[];
  /** The single HTML file */
  demo: string;
  /** 1200x600 still of the product */
  thumbnail: string;
}

export const products: ProductEntry[] = [
  {
    slug: "agent-terminal",
    title: "Agent Terminal",
    description:
      "A desk-radio controller for coding agents: three agent sessions run on its screen while real dials, sliders and tape keys set effort, autonomy, thinking budget, subagents and plan mode",
    added: "Nov 21, 2026",
    kind: "Hardware concept",
    tech: "Decoded Rive · Canvas 2D",
    tags: ["hardware", "agents", "skeuomorphic", "interactive"],
    controls: [
      { control: "POWER", does: "Boots the screen; ▶ then runs all three agents" },
      { control: "SKIP KEYS", does: "Switch between the auth-service, api-gateway and docs agents" },
      { control: "EFFORT", does: "Low to max: longer thinking before each step" },
      { control: "AUTONOMY", does: "Ask first, auto edits or full auto; low asks before every edit" },
      { control: "DIALS", does: "One sets the thinking budget (off to 64k tokens), the other the subagents (×1 to ×8)" },
      { control: "TAPE KEYS", does: "Accept edits, plan mode (edits skipped), or stop all agents" },
      { control: "SIDE KEYS", does: "/compact shrinks the context; /clear starts the session over" },
      { control: "JOYSTICK", does: "Scrolls the transcript" },
    ],
    credits: ["A fan concept, not an Anthropic product. Claude and Claude Code are trademarks of Anthropic; this demo isn't affiliated with or endorsed by Anthropic."],
    demo: "/product-demos/agent-terminal.html",
    thumbnail: "/product-demos/agent-terminal.jpg",
  },
];

export const getProductBySlug = (slug?: string) => products.find((p) => p.slug === slug);
