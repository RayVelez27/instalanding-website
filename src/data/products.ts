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
    slug: "character-creator",
    title: "Character Creator",
    description:
      "A playful avatar builder: a glossy little character on the left and a tabbed panel on the right, where every pick, from body colour and shape to eyes and props, animates onto the character as you tap it",
    added: "Nov 22, 2026",
    kind: "App UI",
    tech: "Decoded Rive · Canvas 2D",
    tags: ["avatar", "playful", "onboarding", "interactive"],
    controls: [
      { control: "BODY · EYES · PROPS", does: "The tab bar switches the panel; the active tab slides into a dark pill" },
      { control: "COLOUR", does: "Green, blue or yellow; the shape buttons and the flower prop follow the colour" },
      { control: "SHAPE", does: "Square, pentagon, circle, bow tie, flower or two pills" },
      { control: "EYES", does: "Default, happy, closed or wink" },
      { control: "PROPS", does: "None, glasses, phone, moustache, flower or sneakers" },
    ],
    credits: [],
    demo: "/product-demos/character-creator.html",
    thumbnail: "/product-demos/character-creator.jpg",
  },
  {
    slug: "driving-ui",
    title: "Futuristic Driving UI",
    description:
      "A glowing in-car dashboard concept: press LAUNCH and a speedometer, a live map and nine mode tiles power up, hold the accelerator to climb toward 240 km/h, and pick Eco, Sport or Autonomous to recolor the whole cockpit",
    added: "Nov 22, 2026",
    kind: "Automotive HMI",
    tech: "Decoded Rive · Canvas 2D",
    tags: ["automotive", "hud", "neon", "interactive"],
    controls: [
      { control: "LAUNCH", does: "Starts the car: the speedometer, the map and the mode tiles animate in" },
      { control: "ACCELERATOR", does: "Press and hold: the gear drops from N into D and the speed climbs toward 240 km/h; let go and it eases back down" },
      { control: "ECO", does: "Turns the cockpit green and swaps the map" },
      { control: "SPORT", does: "Turns the cockpit orange and swaps the map" },
      { control: "AUTONOMOUS", does: "Turns the cockpit violet and swaps the map" },
      { control: "STATUS TILES", does: "Battery, sensor, power, weather, terrain and ambient show the car's state; the sensor sweeps and the weather tile glows" },
    ],
    credits: [],
    demo: "/product-demos/driving-ui.html",
    thumbnail: "/product-demos/driving-ui.jpg",
  },
  {
    slug: "aureon-dashboard",
    title: "Aureon Wealth Dashboard",
    description:
      "A dark private-wealth dashboard: net worth and cash-flow cards with sparklines, a balance chart you can scrub, settlement rings, savings goals and an allocation card, with date ranges that re-count every figure, a CSV export and a light theme",
    added: "Nov 22, 2026",
    kind: "Web app",
    tech: "HTML, CSS & SVG · no libraries",
    tags: ["dashboard", "fintech", "dark", "interactive"],
    controls: [
      { control: "DATE RANGE", does: "Jan–May 2025, last 12 months or 2024: every figure counts to the new value and the charts redraw" },
      { control: "FILTER", does: "Show income, outflow or both in the cash-flow chart, and toggle the month markers" },
      { control: "EXPORT", does: "Downloads the selected range as a CSV" },
      { control: "BALANCE CHART", does: "Move the pointer along it to read savings, checking and brokerage at any point" },
      { control: "THEME", does: "Switches between the dark and light themes" },
      { control: "SIDEBAR", does: "Expands to show labels; on phones it becomes a drawer" },
      { control: "SEARCH · BELL · AVATAR", does: "Open the search field, the notifications and the profile menu" },
    ],
    credits: ["Aureon is a fictional bank; the accounts, figures and people are invented."],
    demo: "/product-demos/aureon-dashboard.html",
    thumbnail: "/product-demos/aureon-dashboard.jpg",
  },
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
