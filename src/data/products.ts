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
    slug: "dx-coder-console",
    title: "DX-Coder Decoder Console",
    description:
      "A teal-on-black ops console for a prompt-decoding service, with five live sections: rolling-digit KPIs and a token-throughput chart, a decoder fleet with a scrolling bitstream and hex frame inspector, three regional streams and a request heatmap, model routing with its latency histogram, and a filterable decode log",
    added: "Nov 27, 2026",
    kind: "Web app UI",
    tech: "HTML + CSS + SVG · no libraries",
    tags: ["dashboard", "ops console", "data viz", "monospace", "dark", "interactive"],
    controls: [
      { control: "SECTIONS · 1–5", does: "The side rail switches between Overview, Decoders, Streams, Models and Logs; the number keys jump straight to one, and the arrow keys walk the rail" },
      { control: "1H · 24H · 7D · 30D", does: "Re-draws the token-throughput chart and its average for that range; hover the chart for a crosshair and the exact value" },
      { control: "TABLE", does: "Swaps in a data table under the throughput chart" },
      { control: "LOAD PROFILE GAUGE", does: "Click a dot (or use ← →) to set the profile from Eco to Max; the needle swings and the token budget updates" },
      { control: "DECODER FLEET", does: "Click a decoder to attach the bitstream view to its channel; click a bitstream column to lock the scanner on it, and click it again to release" },
      { control: "BATCH SIZE − +", does: "Steps the batch size with rolling digits" },
      { control: "MODEL ROUTING", does: "Click V0 or CX to route traffic; the latency histogram and the comparison table follow the selected model" },
      { control: "ALL · INF · WRN · ERR", does: "Filters the live decode log by level" },
    ],
    credits: ["DX-Coder is a fictional product.", "Chivo Mono by Omnibus-Type, under the SIL Open Font License."],
    demo: "/product-demos/dx-coder-console.html",
    thumbnail: "/product-demos/dx-coder-console.jpg",
  },
  {
    slug: "bastion-tiers",
    title: "Bastion Threat Protection Tiers",
    description:
      "A tier picker for a cybersecurity service, set on a dark glass card: an arc gauge with three lit segments where a needle swings to Proactive, Adaptive or Essential, the shield icon glows, the copy below rewrites itself and the whole scene re-lights in that tier's blue, orange or violet",
    added: "Nov 26, 2026",
    kind: "Web app UI",
    tech: "Decoded Rive · Canvas 2D · no libraries",
    tags: ["cybersecurity", "pricing", "tiers", "gauge", "dark", "interactive"],
    controls: [
      { control: "PROACTIVE · ADAPTIVE · ESSENTIAL", does: "The tabs under the card pick a tier: the needle swings to its segment, the headline and copy change and the accent colour follows" },
      { control: "HOVER A TAB", does: "Lights that tier's segment on the arc before you commit" },
      { control: "ARC SEGMENTS", does: "Hover a segment on the gauge itself to light it, and click it to select that tier" },
      { control: "← · →", does: "The arrow keys step through the tiers, wrapping round at either end" },
      { control: "TIER READOUT", does: "The corners of the card show the tier number and its code (SEC·PRO, SEC·ADP, SEC·ESS)" },
    ],
    credits: ["Bastion is a fictional brand.", "Geist and Geist Mono by Vercel, under the SIL Open Font License."],
    demo: "/product-demos/bastion-tiers.html",
    thumbnail: "/product-demos/bastion-tiers.jpg",
  },
  {
    slug: "lintel-terminal",
    title: "Lintel L1 Agent Terminal",
    description:
      "A periwinkle desk terminal for a coding agent, drawn in isometric SVG: approve or reject its edit to a rover's motor firmware on the tilted screen, hold the talk key to ask for a revision, then run it to build and flash and watch the serial log, with keys that sink and click and a knob that scrolls the screen",
    added: "Nov 26, 2026",
    kind: "Hardware concept",
    tech: "Isometric SVG · Web Audio · no libraries",
    tags: ["agent terminal", "isometric", "svg", "keyboard", "sound", "coding agent"],
    controls: [
      { control: "APPROVE · A", does: "Applies the agent's edit to src/motor.c; after a good flash it commits the change" },
      { control: "REJECT · X", does: "Discards the edit, and the screen asks you to tell the agent what to change" },
      { control: "TALK · HOLD SPACE", does: "After a reject or a commit, hold to speak: a live waveform and your words on screen; release and the agent sends back a revised edit or starts a new task" },
      { control: "RUN · R", does: "Once applied, builds and flashes the board with a progress bar, then shows the serial boot log" },
      { control: "KNOB · ↑ ↓", does: "Drag it round, scroll the wheel over it or use the arrow keys to scroll the screen, one detent click per line" },
      { control: "KEYS", does: "Sink with the original key-press curves and click with the original sound; Tab reaches each one and Enter or Space presses it" },
      { control: "STATUS LED", does: "Blinks while building, pulses while listening and stays lit when the board is flashed" },
    ],
    credits: [
      "Lintel is a fictional brand.",
      "The key click is the sound from the source .riv, and the key travel follows its animation curves.",
      "Space Grotesk and JetBrains Mono from Google Fonts, under the SIL Open Font License.",
    ],
    demo: "/product-demos/lintel-terminal.html",
    thumbnail: "/product-demos/lintel-terminal.jpg",
  },
  {
    slug: "obsidian-watch",
    title: "Obsidian Series I Smartwatch",
    description:
      "A titanium smartwatch on a studio-lit black set, with a face you can actually work: press the crown buttons to move between the real time, a live heart rate and step count, daylight and the weather, each change playing the watch's own transition, with a click you can hear and a crystal glare that follows your pointer",
    added: "Nov 25, 2026",
    kind: "Hardware concept",
    tech: "Decoded Rive · Canvas 2D · no libraries",
    tags: ["wearable", "hardware", "dark", "interactive"],
    controls: [
      { control: "CROWN BUTTONS", does: "Press the upper button to go forward a screen and the lower one to go back; each press clicks and buzzes on phones" },
      { control: "← · →", does: "The arrow keys (or A and D) do the same as the crown buttons" },
      { control: "TIME · HEART · DAYLIGHT · WEATHER", does: "The tabs under the watch jump straight to a screen, stepping through the transitions in between" },
      { control: "TIME", does: "Your real local time, day and date, with AM and PM" },
      { control: "HEART", does: "A heart rate that drifts between 62 and 86 BPM and a step count that keeps climbing" },
      { control: "SOUND", does: "Turns the two-tick button click on or off" },
      { control: "POINTER", does: "Move it around the watch and the glare on the crystal swings toward it" },
    ],
    credits: ["Obsidian is a fictional brand; the heart rate, steps and weather are simulated in the browser. The Goldman font is under the SIL Open Font License."],
    demo: "/product-demos/obsidian-watch.html",
    thumbnail: "/product-demos/obsidian-watch.jpg",
  },
  {
    slug: "medura-anatomy",
    title: "Medura Anatomy Explorer",
    description:
      "A soft, clinical-white anatomy app for the digestive system: a translucent body you can light up point by point and peel back in layers, a row of organ cards that open wide on hover, and a five-step timeline that follows a meal from swallowing to the end, with a dark mode and a focus view",
    added: "Nov 25, 2026",
    kind: "Health app",
    tech: "Decoded Rive · Canvas 2D · no libraries",
    tags: ["health", "anatomy", "education", "interactive"],
    controls: [
      { control: "OVERVIEW · ORGANS · TIMELINE", does: "The pill tabs switch the three views; the blue indicator slides to the one you pick" },
      { control: "BODY POINTS", does: "Hover a point on the digestive tract to light it, click to select it" },
      { control: "LAYER SWITCHES", does: "The three switches on the right show or hide the digestive path, the organs and the skeleton" },
      { control: "ZOOM · FOCUS", does: "+ and − zoom the body; the corner button hides the header for a full-screen view" },
      { control: "ORGAN CARDS", does: "Hover a card (gallbladder, large intestine, stomach, liver, pancreas) and it opens wide to show the organ" },
      { control: "TIMELINE", does: "Drag the slider or pick a dot to step through swallowing, the esophagus, the stomach, absorption and forming stool" },
      { control: "MOON · LOGO", does: "The moon switches dark mode; the logo opens the About dialog" },
    ],
    credits: ["Medura is the brand name the source prototype shipped with, kept as is. The anatomy is illustrative, not medical advice."],
    demo: "/product-demos/medura-anatomy.html",
    thumbnail: "/product-demos/medura-anatomy.jpg",
  },
  {
    slug: "vector-one-dashboard",
    title: "Vector One Vehicle Dashboard",
    description:
      "A black-and-lime in-car overview screen: a live instrument cluster with blinkers, gear select, speedometer, power bar and a radar sweep, wrapped in cards for speed, battery, range, energy, tyres, climate and alerts that all follow the car as you drive it",
    added: "Nov 23, 2026",
    kind: "Automotive HMI",
    tech: "Decoded Rive cluster · Canvas 2D · no libraries",
    tags: ["automotive", "dashboard", "dark", "interactive"],
    controls: [
      { control: "GEARS · P R N D", does: "Click a gear on the cluster or below it (or press P, R, N, D): the yellow block slides over and the letter grows" },
      { control: "BLINKERS", does: "Click a chevron or ◀ BLINK / BLINK ▶ (Q and E, or the arrow keys); both at once reads as hazards" },
      { control: "SPEED", does: "The slider (or ↑ / ↓) sets a target; the speedometer eases to it over 1.5s and the speed card follows" },
      { control: "PWR", does: "Fills the power bar; the energy draw, sparkline, battery and range react" },
      { control: "CLIMATE", does: "+ and − set the cabin temperature; A/C, SEAT and DEFROST toggle" },
      { control: "SIDEBAR", does: "Picks a section; it becomes an icon rail on tablets and a drawer on phones" },
    ],
    credits: ["Vector One is a fictional car and OS; every reading is simulated in the browser."],
    demo: "/product-demos/vector-one-dashboard.html",
    thumbnail: "/product-demos/vector-one-dashboard.jpg",
  },
  {
    slug: "kiln-dashboard",
    title: "Kiln Fleet Console",
    description:
      "A machined-hardware console for a rack of on-premise AI servers: live throughput, latency, power and heat across four units, a thermal gauge, a load heatmap, a rack you can pull units from and a network-boundary view, all driven by rocker switches and a key",
    added: "Nov 23, 2026",
    kind: "Web app",
    tech: "HTML, CSS & SVG · no libraries",
    tags: ["dashboard", "hardware", "ai infra", "interactive"],
    controls: [
      { control: "PANELS · 1–5", does: "Overview, Units, Thermals, Rack & boundary and Events; the number keys switch them too" },
      { control: "ALL POWER · TURBO", does: "Rocker switches for the whole fleet: turbo multiplies throughput and heat, and the gauge swings toward red" },
      { control: "UNIT ROCKERS", does: "Each unit panel has its own power and turbo switches" },
      { control: "LIVE KEY", does: "Turn the key to freeze the charts in place, turn it back to resume" },
      { control: "5M · 15M · 1H", does: "Sets how much history the charts show" },
      { control: "FOCUS A UNIT", does: "Pick a unit (in the list or the rack) to focus every chart on it; Escape clears it" },
      { control: "LOG FILTERS", does: "All events, warnings only, or the focused unit" },
      { control: "CHARTS", does: "Hover any chart for the exact readings at that moment" },
    ],
    credits: ["A companion to the Machine Front Panel page and the Kiln design system (instalanding.ai/systems/kiln): the same machined look and amber. Kiln is fictional; every reading is simulated in the browser."],
    demo: "/product-demos/kiln-dashboard.html",
    thumbnail: "/product-demos/kiln-dashboard.jpg",
  },
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
