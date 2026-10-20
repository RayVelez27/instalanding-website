/**
 * SYSTEMS: the design languages behind the pages.
 *
 * A template is a finished page; a system is the set of tokens and working
 * components that page was built from, so more can be built in its language.
 * Every system is extracted from a real template by a script in
 * scripts/systems/ and published as static files under public/systems/<slug>/:
 *
 *   specimen.html  the specimen: every component rendered live, one file. Its
 *                <style id="ks-tokens">, <style id="ks-components">,
 *                <svg id="ks-defs">, <section data-component> blocks and
 *                component script are what the SYSTEMS dialog reads and copies.
 *   tokens.css   the design tokens as CSS custom properties
 *   <slug>.css   tokens + component CSS, ready to link from any page
 *   preview.jpg  the gallery card (1200x600, the specimen's top)
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 * To add a system: write its extraction script, run it, capture preview.jpg,
 * and add an entry here. src/test/systems.test.ts checks the entry against
 * the generated files.
 */

/** A token the playground can edit. Colours can drag a darker partner along. */
export interface SystemControl {
  token: string;
  label: string;
  kind: "color" | "range";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Tokens recomputed from this one: each mixes the new colour toward black by `darken` (0-1). */
  follow?: { token: string; darken: number }[];
}

export interface SystemEntry {
  slug: string;
  name: string;
  /** Semantic version; the agent instruction pins it */
  version: string;
  /** One line for the card */
  tagline: string;
  description: string;
  added: string;
  theme: "dark" | "light";
  tags: string[];
  /** Core colours for the card's swatch row; each must be a token value in tokens.css */
  palette: string[];
  /** Prefix of the system's class names, tokens and specimen ids ("ks" -> .ks-btn, --ks-ink, #ks-tokens) */
  prefix: string;
  /** The root class components must sit inside */
  rootClass: string;
  /** Static files, all under public/systems/<slug>/ */
  files: {
    specimen: string;
    tokens: string;
    css: string;
    /** The board, captured whole (agents and the dialog use it) */
    preview: string;
    /** The cover, then hover frames: built by scripts/systems/posters.mjs */
    posters?: string[];
  };
  /** Google Fonts stylesheet the system needs */
  fontsHref: string;
  /** Slugs in prompts.ts this system was extracted from or is used by */
  templates: string[];
  /** In specimen order; ids match <section data-component="..."> */
  components: { id: string; label: string }[];
  playground: SystemControl[];
  /** Rules an agent needs beyond the tokens, grouped for the instruction */
  conventions: { title: string; rules: string[] }[];
  /** Tokens the board's own panels are drawn with */
  look: {
    /** Token names: the demo surface, the ink lines are drawn in, and the three font families */
    surface: string;
    ink: string;
    display: string;
    mono: string;
    body: string;
    /** The identity panel: extra classes, its background and text colour (CSS values) */
    identityClass: string;
    identityBg: string;
    identityText: string;
    /** Display type is set uppercase in this system */
    displayUpper: boolean;
    /** Sample lines for the type scale */
    sample: { display: string; body: string };
    /** One line under the layout panel's column illustration */
    layoutNote: string;
  };
  /**
   * The board, in reading order, on a 12-column grid. "tokens:*" panels are
   * drawn from the tokens; "component:<id>" panels render that component's
   * real markup; "context" composes an app screen from real components.
   */
  board: { panel: string; span: number; title?: string }[];
  /** The "In context" app screen: components placed in a header, a main column and a side column */
  context: { title: string; note: string; top: string[]; main: string[]; side: { component: string; select?: string }[] };
}

export const systems: SystemEntry[] = [
  {
    slug: "kind-swarm",
    name: "Kind Swarm",
    version: "1.0.0",
    tagline: "Loud neo-brutalism: stencil type, op-art rings, hard shadows and animoji",
    description:
      "Flame and lime bands of concentric op-art rings, Stardos Stencil set huge, 3px ink outlines with hard offset shadows that press flat on click, cream cards and glossy animoji characters whose eyes follow the pointer. Extracted from the Social Work Agent Swarm landing page.",
    added: "Oct 17, 2026",
    theme: "light",
    tags: ["neo-brutalist", "stencil type", "op-art pattern", "hard shadows", "characters"],
    palette: ["#15111F", "#F4EFE6", "#FF5A3C", "#D4FF3A", "#3D7BFF"],
    prefix: "ks",
    rootClass: "ks",
    files: {
      specimen: "/systems/kind-swarm/specimen.html",
      tokens: "/systems/kind-swarm/tokens.css",
      css: "/systems/kind-swarm/kind-swarm.css",
      preview: "/systems/kind-swarm/preview.jpg",
      posters: ["/systems/kind-swarm/poster-1.jpg", "/systems/kind-swarm/poster-2.jpg", "/systems/kind-swarm/poster-3.jpg", "/systems/kind-swarm/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Stardos+Stencil:wght@400;700&family=IBM+Plex+Sans+Condensed:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=IBM+Plex+Mono:wght@500;600&display=swap",
    templates: ["social-work-agent-swarm-landing-page"],
    components: [
      { id: "buttons", label: "Buttons" },
      { id: "type", label: "Type" },
      { id: "rings", label: "Ring patterns" },
      { id: "characters", label: "Animoji characters" },
      { id: "nav", label: "Navigation" },
      { id: "stats", label: "Stats strip" },
      { id: "marquee", label: "Marquee" },
      { id: "pills", label: "Filter pills" },
      { id: "card", label: "Agent card" },
      { id: "step", label: "Numbered step" },
      { id: "queue", label: "Approval queue" },
      { id: "chips", label: "Chips" },
      { id: "rules", label: "Rule cards" },
      { id: "plans", label: "Pricing plans" },
    ],
    playground: [
      { token: "--ks-flame", label: "Primary", kind: "color", follow: [{ token: "--ks-flame-deep", darken: 0.12 }, { token: "--ks-flame-hot", darken: 0 }] },
      { token: "--ks-lime", label: "Accent", kind: "color", follow: [{ token: "--ks-lime-deep", darken: 0.07 }] },
      { token: "--ks-ink", label: "Ink", kind: "color", follow: [{ token: "--ks-ink-ring", darken: -0.08 }] },
      { token: "--ks-paper", label: "Paper", kind: "color" },
      { token: "--ks-focus", label: "Focus", kind: "color" },
      { token: "--ks-radius-card", label: "Card radius", kind: "range", min: 0, max: 48, step: 1, unit: "px" },
      { token: "--ks-radius-panel", label: "Panel radius", kind: "range", min: 0, max: 48, step: 1, unit: "px" },
      { token: "--ks-shadow-offset", label: "Shadow offset", kind: "range", min: 0, max: 16, step: 1, unit: "px" },
      { token: "--ks-ring-size", label: "Ring size", kind: "range", min: 48, max: 220, step: 2, unit: "px" },
    ],
    look: {
      surface: "--ks-paper",
      ink: "--ks-ink",
      display: "--ks-font-display",
      mono: "--ks-font-mono",
      body: "--ks-font-body",
      identityClass: "ks-rings ks-hero-rings",
      identityBg: "var(--c1)",
      identityText: "var(--ks-ink)",
      displayUpper: true,
      sample: { display: "Kind Swarm", body: "Drafts, never decisions." },
      layoutNote: "Grids auto-fit with a 320px minimum, so they collapse to one column without breakpoints · gutter clamp(16px, 4vw, 56px)",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:buttons", span: 5 },
      { panel: "component:rings", span: 7 },
      { panel: "component:characters", span: 7 },
      { panel: "component:pills", span: 5 },
      { panel: "component:nav", span: 12 },
      { panel: "component:stats", span: 12 },
      { panel: "component:card", span: 8 },
      { panel: "tokens:shape", span: 4, title: "Shape & depth" },
      { panel: "component:queue", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:type", span: 8, title: "Headline pairing" },
      { panel: "component:step", span: 4 },
      { panel: "component:marquee", span: 12 },
      { panel: "component:rules", span: 12 },
      { panel: "component:plans", span: 12 },
      { panel: "component:chips", span: 5 },
      { panel: "tokens:layout", span: 7, title: "Layout & spacing" },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: a caseworker console",
      note: "The same components, re-composed into an app screen rather than a landing page.",
      top: ["nav"],
      main: ["stats", "queue"],
      side: [{ component: "card", select: ".ks-card" }],
    },
    conventions: [
      {
        title: "Typography",
        rules: [
          "Display: Stardos Stencil 700, uppercase, line-height .92 (--ks-leading-display), set very large (--ks-display-*). Pair a display line with an italic IBM Plex Sans Condensed second line (.ks-serif) at about .72em.",
          "Labels: IBM Plex Mono 500, 13px, uppercase, letter-spacing .16em (.ks-label), e.g. \"02 — The crew\".",
          "Body: IBM Plex Sans Condensed 400-700 at 17-20px, line-height 1.55; soft text uses --ks-text-soft on paper and --ks-on-ink-soft on ink.",
        ],
      },
      {
        title: "Layout",
        rules: [
          "Full-bleed bands alternate flame rings, paper, lime rings and ink; separate them with 3px ink rules. Content sits in .ks-wrap (max 1440px, gutter clamp(16px, 4vw, 56px)) with section padding --ks-section-y.",
          "Grids use repeat(auto-fit, minmax(min(100%, 320px), 1fr)) with 36-56px gaps, so they collapse to one column on phones without breakpoints.",
          "Outline everything in ink (--ks-border 3px) and give raised things a hard offset shadow (--ks-shadow): never a blurred shadow.",
        ],
      },
      {
        title: "Patterns",
        rules: [
          "Ring backgrounds: add .ks-rings plus a colour class (.ks-hero-rings, .ks-mq-rings, .ks-ink-rings, .ks-st1 to .ks-st8). The pattern reads --c1, --c2 and --s, so any band can be re-coloured with those three properties.",
          ".ks-wave-text clips the ring pattern into stencil type and drifts it slowly.",
          "Characters are inline SVG using the shared gradients in <svg id=\"ks-defs\">; wrap one in <button class=\"ks-poke\" data-ks-poke aria-label=\"...\"> to make it pokeable.",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Buttons lift 2px and grow their shadow on hover, and press flat (translate by the shadow offset, shadow 0) on :active, in --ks-dur-press with --ks-ease-press.",
          "Characters bob (--ks-dur-bob), blink (--ks-dur-blink) and squash on a poke (--ks-dur-poke, --ks-ease-spring); stagger them with .ks-d1 to .ks-d4.",
          "Sections rise in with .ks-rise; the marquee loops over --ks-dur-marquee and pauses on hover.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "Focus is a 3px --ks-focus outline offset 4px on every link and button.",
          "Decorative SVG and the marquee are aria-hidden; pokeable characters are real buttons with a label; filter pills are buttons with aria-pressed.",
          "prefers-reduced-motion stops every animation and transition inside .ks.",
        ],
      },
    ],
  },
  {
    slug: "kiln",
    name: "Kiln",
    version: "1.0.0",
    tagline: "Dark machined hardware: anodised plates, copper screws, recessed wells and amber lamps",
    description:
      "Bead-blasted aluminium plates on a laminated copper edge, turned copper screws, recessed wells, engraved mono legends, amber and green lamps, analogue gauges and rocker switches that tip on a spring. Extracted from the Machine Front Panel landing page.",
    added: "Oct 17, 2026",
    theme: "dark",
    tags: ["dark", "skeuomorphic", "industrial hardware", "engraved mono", "amber lamps"],
    palette: ["#08090B", "#1E2025", "#D4D8DE", "#FF9426", "#35E6DE"],
    prefix: "kn",
    rootClass: "kn",
    files: {
      specimen: "/systems/kiln/specimen.html",
      tokens: "/systems/kiln/tokens.css",
      css: "/systems/kiln/kiln.css",
      preview: "/systems/kiln/preview.jpg",
      posters: ["/systems/kiln/poster-1.jpg", "/systems/kiln/poster-2.jpg", "/systems/kiln/poster-3.jpg", "/systems/kiln/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap",
    templates: ["machine-front-panel-page"],
    components: [
      { id: "buttons", label: "Buttons" },
      { id: "type", label: "Type" },
      { id: "nav", label: "Top bar" },
      { id: "plate", label: "Status plate" },
      { id: "rockers", label: "Rocker switches" },
      { id: "gauge", label: "Gauge" },
      { id: "thermal", label: "Heat window" },
      { id: "readings", label: "Readings strip" },
      { id: "rating", label: "Rating plate" },
      { id: "compare", label: "Compare switch" },
      { id: "install", label: "Install log" },
      { id: "rack", label: "Rack picker" },
      { id: "faq", label: "FAQ" },
      { id: "keyslot", label: "Key slot" },
    ],
    playground: [
      { token: "--kn-amber", label: "Lamp / primary", kind: "color" },
      { token: "--kn-alu", label: "Plate metal", kind: "color", follow: [{ token: "--kn-alu-hi", darken: -0.06 }, { token: "--kn-alu-lo", darken: 0.25 }] },
      { token: "--kn-void", label: "Void", kind: "color" },
      { token: "--kn-text", label: "Text", kind: "color" },
      { token: "--kn-cyan", label: "Gauge band", kind: "color" },
      { token: "--kn-green", label: "Status lamp", kind: "color" },
      { token: "--kn-radius-plate", label: "Plate radius", kind: "range", min: 0, max: 28, step: 1, unit: "px" },
      { token: "--kn-radius-well", label: "Well radius", kind: "range", min: 0, max: 24, step: 1, unit: "px" },
      { token: "--kn-radius-btn", label: "Button radius", kind: "range", min: 0, max: 20, step: 1, unit: "px" },
    ],
    conventions: [
      {
        title: "Typography",
        rules: [
          "Display: Archivo 900, uppercase, letter-spacing -0.035em to -0.04em, line-height 0.9-0.98 (--kn-display-*). Light it with one amber phrase (<em> in --kn-amber with a soft amber text-shadow).",
          "Legends are engraved, not printed: JetBrains Mono 500 at 9.5px, letter-spacing .34em, uppercase, --kn-engrave with a dark-above / light-below text-shadow (.kn-stencil). Eyebrows are 11px mono with .26em tracking.",
          "Values and readouts are JetBrains Mono (20-30px) in --kn-bright with a small mono unit in --kn-mute; body copy is Archivo 13.5-16px in --kn-mute, line-height 1.55-1.66.",
        ],
      },
      {
        title: "Layout",
        rules: [
          "Content sits in .kn-wrap (min(1160px, 100% - 36px)); sections breathe with 92-150px of top padding and headers capped at about 50ch.",
          "Raised things are .kn-plate (anodised aluminium on the copper laminate edge, --kn-stack) with four .kn-screw corners; contained things sit in recessed .kn-well pockets; bays inside a plate use 14px padding and gaps.",
          "Grids are minmax(0, 1fr) columns that collapse to one column at 940px and 600px; long strips (readings, rack) re-flow rather than scroll.",
        ],
      },
      {
        title: "Materials",
        rules: [
          "One material, done properly: brushed aluminium (gradient + fine machining lines + an overlay noise texture), lit top chamfer, dark lower edge, an engraved inner border. Never flat fills for raised surfaces.",
          "Copper is reserved for fasteners and edges (screws, rack ears, the laminate stack, the key and switch knob); amber is light (lamps, glows, focus), never a fill colour for big areas.",
          "Lamps are radial-gradient LEDs that also wash the metal around them (::after glow). Off lamps are --kn-led-off with an inset shadow. The rating plate is the one bright metal: sage aluminium with rivets.",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Motion is physical: switches, knobs and rack units move on --kn-spring (cubic-bezier(0.34, 1.7, 0.5, 1)); everything else eases on --kn-ease over --kn-dur-quick to --kn-dur-roll.",
          "Hover lights things rather than moving them: an amber 1px rim and an amber bloom (--kn-glow-amber). Counters roll, the gauge needle is damped, the heat window follows one --kn-heat value (0-1).",
          "Only small loops run on their own (the readings wave, the flip hint, a terminal caret); prefers-reduced-motion cuts every animation and transition inside .kn to near zero.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "Focus is a 2px --kn-amber outline offset 3-5px on every switch, button, rack unit and summary.",
          "Switches are real buttons with aria-pressed (rockers, rack units) or role=switch with aria-checked (the compare flipper); decorative lamps, grilles, screws and gauges are aria-hidden with the value repeated in text.",
          "Engraved legends are decorative; anything a reader needs is also in --kn-mute or brighter text. FAQ rows are native <details>.",
        ],
      },
    ],
    look: {
      surface: "--kn-void",
      ink: "--kn-alu",
      display: "--kn-font-display",
      mono: "--kn-font-mono",
      body: "--kn-font-body",
      identityClass: "kn-plate",
      identityBg: "var(--kn-alu)",
      identityText: "var(--kn-title)",
      displayUpper: true,
      sample: { display: "Kiln", body: "Inference that never leaves the building." },
      layoutNote: "A 1160px column with an 18px gutter; panels sit on a 16px gap and the bays inside a plate on 14px.",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:plate", span: 5 },
      { panel: "component:gauge", span: 4 },
      { panel: "component:rockers", span: 3 },
      { panel: "component:nav", span: 12 },
      { panel: "component:buttons", span: 7 },
      { panel: "tokens:shape", span: 5, title: "Shape & depth" },
      { panel: "component:readings", span: 12 },
      { panel: "component:thermal", span: 4 },
      { panel: "component:compare", span: 8 },
      { panel: "component:rating", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:install", span: 12 },
      { panel: "component:rack", span: 12 },
      { panel: "component:type", span: 7, title: "Headline & legends" },
      { panel: "component:keyslot", span: 5 },
      { panel: "component:faq", span: 7 },
      { panel: "tokens:layout", span: 5, title: "Layout & spacing" },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: a fleet console",
      note: "The same parts, re-composed into an operations screen rather than a landing page.",
      top: ["nav", "readings"],
      main: ["install"],
      side: [{ component: "plate" }, { component: "gauge" }],
    },
  },
  {
    slug: "footnote",
    name: "Footnote",
    version: "1.0.0",
    tagline: "Quiet editorial paper: serif type, mono labels and a real, rough-edged highlighter",
    description:
      "Warm Flexoki paper and ink, Source Serif set calm and large, JetBrains Mono labels, sheets and taped cards with creased paper texture, pencil notes in the margin, and a real highlighter whose colour is the meaning: rough-edged marks drawn behind the text by an SVG displacement filter. Extracted from the Highlighter Markup landing page.",
    added: "Oct 17, 2026",
    theme: "light",
    tags: ["editorial", "serif", "paper texture", "highlighter", "quiet"],
    palette: ["#FFFCF0", "#100F0F", "#DDE2B1", "#FED2AE", "#F5A69E"],
    prefix: "fn",
    rootClass: "fn",
    files: {
      specimen: "/systems/footnote/specimen.html",
      tokens: "/systems/footnote/tokens.css",
      css: "/systems/footnote/footnote.css",
      preview: "/systems/footnote/preview.jpg",
      posters: ["/systems/footnote/poster-1.jpg", "/systems/footnote/poster-2.jpg", "/systems/footnote/poster-3.jpg", "/systems/footnote/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=JetBrains+Mono:wght@400;500;700&family=Caveat:wght@400..700&display=swap",
    templates: ["highlighter-markup-page"],
    components: [
      { id: "nav", label: "Navigation" },
      { id: "buttons", label: "Buttons" },
      { id: "headline", label: "Highlighted headline" },
      { id: "tray", label: "Highlighter tray" },
      { id: "section-head", label: "Section head" },
      { id: "sheet", label: "Marked answer" },
      { id: "figures", label: "Figures" },
      { id: "steps", label: "Numbered steps" },
      { id: "payload", label: "Annotated listing" },
      { id: "cards", label: "Taped cards" },
      { id: "faq", label: "Margin notes" },
      { id: "terminal", label: "Run log" },
      { id: "cta", label: "Closing call" },
      { id: "footer", label: "Footer" },
    ],
    playground: [
      { token: "--fn-paper", label: "Paper", kind: "color", follow: [{ token: "--fn-paper-2", darken: 0.05 }, { token: "--fn-paper-3", darken: 0.1 }] },
      { token: "--fn-ink", label: "Ink", kind: "color", follow: [{ token: "--fn-ink-hover", darken: -0.1 }] },
      { token: "--fn-hl-green", label: "Grounded mark", kind: "color" },
      { token: "--fn-hl-orange", label: "Stretched mark", kind: "color" },
      { token: "--fn-hl-red", label: "Unsupported mark", kind: "color" },
      { token: "--fn-pencil", label: "Pencil", kind: "color" },
      { token: "--fn-radius-sm", label: "Button radius", kind: "range", min: 0, max: 16, step: 1, unit: "px" },
      { token: "--fn-border-note", label: "Note rule", kind: "range", min: 1, max: 8, step: 1, unit: "px" },
    ],
    conventions: [
      {
        title: "Typography",
        rules: [
          "Display and body are Source Serif 4 (--fn-font-display / --fn-font-body): headings weight 600, letter-spacing -0.02em to -0.025em, text-wrap: balance, on the fluid --fn-step-* scale (--fn-step-6 for the hero, --fn-step-4 for section heads).",
          "Labels, buttons, nav and captions are JetBrains Mono (--fn-font-mono) at --fn-step--1; labels are uppercase with --fn-tracking-label (.14em) in --fn-ink-2 (.fn-label).",
          "Handwriting is Caveat (--fn-font-hand) in --fn-pencil through the #fn-crayon filter (.fn-scrawl), used only for margin notes, never for content.",
        ],
      },
      {
        title: "Layout",
        rules: [
          "Text holds a reading measure (.fn-wrap: min(74ch, 100% - 3rem)); wider pieces use .fn-wide (max 1100px). Sections are separated by 1px --fn-rule lines with --fn-section-y padding.",
          "Content sits on sheets and cards (.fn-paper) that carry creased-paper texture via #fn-paper, soft drop shadows (--fn-shadow-sheet / --fn-shadow-card) and a slight tilt (--r, --fn-tilt-*). Never a hard border box.",
          "Grids go 4 → 2 → 1 columns at 900px and 520px; the payload and steps stack under 900px.",
        ],
      },
      {
        title: "Marks",
        rules: [
          "A highlight is <mark> with a verdict class: .fn-hl-green grounded, .fn-hl-cyan paraphrased, .fn-hl-orange stretched, .fn-hl-red unsupported (yellow is the default). The colour is the meaning; don't use marks decoratively.",
          "The colour, grain and rough edge live on mark::before (through --color), never on the glyphs; the filter #fn-rough needs the shared <svg id=\"fn-defs\">.",
          "A mark is inline-block so it cannot wrap: give multi-word marks data-fn-split and include the component script, which splits them into one mark per word (only the last keeps the pen blob).",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Quiet by design: buttons ease background in --fn-dur-press, the glow button's arrow steps 4px on hover, the FAQ + rotates 45deg when open.",
          "Marks can draw on with a left-to-right clip (--fn-ease-pen over --fn-dur-pen) and the pen blob pops in on --fn-ease-blob, under an .fn-hl-anim class on an ancestor; without it the marks are simply there.",
          "The run log cursor blinks on --fn-dur-blink.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "Claims are real buttons with aria-expanded; their source note opens beneath the sheet. FAQ uses native details/summary.",
          "Focus is a 2px ink outline offset 3px on buttons, claims and summaries.",
          "Marks carry meaning by colour and by word (Grounded, Stretched…): keep a text label beside any colour-only verdict. prefers-reduced-motion drops all animation and transitions to near zero.",
        ],
      },
    ],
    look: {
      surface: "--fn-paper",
      ink: "--fn-ink",
      display: "--fn-font-display",
      mono: "--fn-font-mono",
      body: "--fn-font-body",
      identityClass: "fn-paper",
      identityBg: "var(--fn-paper)",
      identityText: "var(--fn-ink)",
      displayUpper: false,
      sample: { display: "Marked against the source.", body: "Supported in green. Stretched in orange." },
      layoutNote: "Text holds a 74ch measure, wide pieces 1100px · grids step 4 → 2 → 1 at 900px and 520px",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:tray", span: 7 },
      { panel: "component:buttons", span: 5 },
      { panel: "component:headline", span: 12 },
      { panel: "component:sheet", span: 8 },
      { panel: "tokens:shape", span: 4, title: "Shape & depth" },
      { panel: "component:nav", span: 12 },
      { panel: "component:steps", span: 12 },
      { panel: "component:payload", span: 12 },
      { panel: "component:cards", span: 12 },
      { panel: "component:faq", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:figures", span: 7 },
      { panel: "component:terminal", span: 5 },
      { panel: "component:section-head", span: 5 },
      { panel: "tokens:layout", span: 7, title: "Layout & spacing" },
      { panel: "component:cta", span: 12 },
      { panel: "component:footer", span: 12 },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: a grounding review queue",
      note: "The same components, re-composed into an app screen: the nav, a marked answer under review and its figures, with the run log alongside.",
      top: ["nav"],
      main: ["sheet", "figures"],
      side: [{ component: "terminal" }],
    },
  },
  {
    slug: "hollr",
    name: "Hollr",
    version: "1.0.0",
    tagline: "Y2K messenger chrome on a night-indigo page: glossy titlebars, bevelled buttons, a purple-to-magenta glow",
    description:
      "A dark retro desktop: night-indigo pages, pale messenger windows with glossy two-tone titlebars inside slowly turning conic rings, bevelled classic buttons beside a purple → magenta brand button with a gold edge, buddy lists, help chats and agent checklists. Oswald display, Neuton copy, Verdana and Tahoma for the UI. Extracted from the Retro Messenger Agent Page.",
    added: "Oct 18, 2026",
    theme: "dark",
    tags: ["y2k", "retro desktop", "messenger", "glossy chrome", "gradient", "chat ui"],
    palette: ["#1D1C45", "#D7E4F5", "#6A2FC4", "#C0169F", "#E6E82A"],
    prefix: "hl",
    rootClass: "hl",
    files: {
      specimen: "/systems/hollr/specimen.html",
      tokens: "/systems/hollr/tokens.css",
      css: "/systems/hollr/hollr.css",
      preview: "/systems/hollr/preview.jpg",
      posters: ["/systems/hollr/poster-1.jpg", "/systems/hollr/poster-2.jpg", "/systems/hollr/poster-3.jpg", "/systems/hollr/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Neuton:ital,wght@0,400;0,700;1,400&display=swap",
    templates: ["retro-messenger-agent-page"],
    components: [
      { id: "nav", label: "Navigation" },
      { id: "buttons", label: "Buttons" },
      { id: "badges", label: "Status & badges" },
      { id: "heading", label: "Framed heading" },
      { id: "window", label: "Messenger window" },
      { id: "agent-run", label: "Agent run" },
      { id: "cards", label: "Feature cards" },
      { id: "step-cards", label: "Step windows" },
      { id: "search", label: "Search & ask" },
      { id: "help-chat", label: "Help chat" },
      { id: "buddy", label: "Buddy list" },
      { id: "signup", label: "Sign-up panel" },
      { id: "toast", label: "Toast" },
      { id: "footer", label: "Footer" },
    ],
    playground: [
      { token: "--hl-ink-2", label: "Night page", kind: "color", follow: [{ token: "--hl-ink", darken: -0.15 }] },
      { token: "--hl-p1", label: "Brand purple", kind: "color", follow: [{ token: "--hl-violet-lo", darken: 0.15 }] },
      { token: "--hl-p2", label: "Brand magenta", kind: "color", follow: [{ token: "--hl-rose-lo", darken: 0.15 }] },
      { token: "--hl-gold", label: "Gold accent", kind: "color" },
      { token: "--hl-blue", label: "Titlebar blue", kind: "color", follow: [{ token: "--hl-blue-lo", darken: 0.12 }] },
      { token: "--hl-win", label: "Window chrome", kind: "color", follow: [{ token: "--hl-win-bottom", darken: 0.02 }] },
      { token: "--hl-radius-window", label: "Window radius", kind: "range", min: 0, max: 32, step: 1, unit: "px" },
      { token: "--hl-radius-btn", label: "Button radius", kind: "range", min: 0, max: 20, step: 1, unit: "px" },
    ],
    conventions: [
      {
        title: "Typography",
        rules: [
          "Display is Oswald (--hl-font-display), bold and uppercase: framed headings use .hl-ait with an .hl-ait-kick (Neuton, letter-spacing .5em) over an .hl-ait-big line filled with a moving pastel-to-gold gradient, on --hl-step-hero / --hl-step-xl.",
          "Descriptive copy (ledes, card text, answers) is Neuton (--hl-font-copy) at --hl-step-copy-lg / --hl-step-copy; UI text inside windows is Verdana (--hl-font-body) at 11-14px, and buttons are bold Tahoma (--hl-font-mono).",
          "Kickers and column heads are 11px uppercase, letter-spaced 2px, in --hl-tab gold-tan (.hl-eyebrow).",
        ],
      },
      {
        title: "Layout",
        rules: [
          "The page is dark (--hl-ink-2 → --hl-ink); content lives in pale windows (--hl-win-top → --hl-win-bottom) with 1px --hl-line borders. Never put body text straight on the night background except ledes and kickers.",
          "Width is .hl-wrap (--hl-page-max 1200px, --hl-gutter 20px); sections sit --hl-section-y apart. Feature grids go 3 → 2 → 1 at 980px and 680px; the messenger window drops its avatar column under 680px.",
          "Panes inside a window are separated by --hl-pane-gap with white inner panels (radius --hl-radius-md) on the chrome.",
        ],
      },
      {
        title: "Windows & chrome",
        rules: [
          "Every window has a glossy two-tone titlebar (.hl-titlebar: --hl-blue-hi → --hl-blue / --hl-blue-lo → --hl-blue-end, a hard stop at 48/52%) with a title, three .hl-ctl buttons (the last red) and a sheen sweeping across. Violet (agent, help) and rose titlebars use the --hl-violet-* / --hl-rose-* stops.",
          "Hero windows sit in an .hl-ring: a --hl-border-ring conic border in magenta, gold and purple turning on --hl-dur-ring, with --hl-shadow-window. Toolbars and card bars are the lilac --hl-bar-a → --hl-lilac → --hl-bar-a gradient; status strips are --hl-status with --hl-status-ink bold text.",
          "Two button families only: the brand .hl-btn-prime (--hl-p1 → --hl-p2, gold edge, glass top half, sheen, --hl-glow-prime) and the classic bevel (--hl-face, --hl-edge border, --hl-shadow-bevel) for everything secondary.",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Hover lifts by 1-2px on --hl-dur with --hl-ease; arrows step 4px right. Messages fade up on --hl-dur-msg; checkmarks, step numbers and picks pop on --hl-ease-spring.",
          "Ambient motion is slow and constant: ring rotation (--hl-dur-ring), sheens (--hl-dur-sheen), floating 3D icons, pinging online dots, typing dots.",
          "Nudge shakes the window (.hl-shake, twice). Under prefers-reduced-motion every animation and transition collapses to its end state.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "The Chat/Agent switch is a radiogroup with aria-checked; tool chips are toggle buttons with aria-pressed; help-chat questions are buttons with aria-expanded controlling a role=region answer.",
          "Focus is a 2px --hl-gold outline offset 3px on links, buttons and summaries.",
          "Decorative chrome (titlebar controls, avatars, stickers, wordmark) is aria-hidden; status text in a window's statusbar stays readable at --hl-status-ink on --hl-status.",
        ],
      },
    ],
    look: {
      surface: "--hl-ink-2",
      ink: "--hl-win",
      display: "--hl-font-display",
      mono: "--hl-font-mono",
      body: "--hl-font-body",
      identityClass: "",
      identityBg: "linear-gradient(135deg, var(--hl-p1), var(--hl-p2))",
      identityText: "#fff",
      displayUpper: true,
      sample: { display: "Hollr has signed in.", body: "Tell Hollr what you need, right in the chat." },
      layoutNote: "1200px page with 20px gutters · feature grid 3 → 2 → 1 at 980px and 680px · windows drop the avatar column under 680px",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:window", span: 12 },
      { panel: "component:buttons", span: 7 },
      { panel: "tokens:shape", span: 5, title: "Shape & depth" },
      { panel: "component:nav", span: 12 },
      { panel: "component:badges", span: 7 },
      { panel: "component:toast", span: 5 },
      { panel: "component:heading", span: 12 },
      { panel: "component:agent-run", span: 6 },
      { panel: "component:buddy", span: 6 },
      { panel: "component:cards", span: 12 },
      { panel: "component:step-cards", span: 12 },
      { panel: "component:help-chat", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:search", span: 5 },
      { panel: "tokens:layout", span: 7, title: "Layout & spacing" },
      { panel: "component:signup", span: 12 },
      { panel: "component:footer", span: 12 },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: an agent inbox",
      note: "The same components, re-composed into an app screen: the titlebar nav, an agent run in progress beside the buddy list of jobs at work.",
      top: ["nav"],
      main: ["agent-run", "badges"],
      side: [{ component: "buddy" }, { component: "toast" }],
    },
  },
  {
    slug: "overclock",
    name: "Overclock",
    version: "1.0.0",
    tagline: "A black-and-white manga issue: ink panels, screentone, shouted lettering and a sliced retro sun",
    description:
      "Pure ink on paper: hand-drawn panel outlines from an SVG wobble filter, halftone screentone and speed hatching, Bangers lettering stroked and tilted over Anton numerals and Barlow Condensed body, hard offset shadows, speech bubbles, and an animated sliced retro sun over a seeded city skyline. Extracted from the Manga Panel Dev Tool landing page.",
    added: "Oct 18, 2026",
    theme: "light",
    tags: ["manga", "comic", "black & white", "screentone", "retro sun"],
    palette: ["#111111", "#F8F8F5", "#FFFFFF", "#BDBDB8", "#EAEAE4"],
    prefix: "oc",
    rootClass: "oc",
    files: {
      specimen: "/systems/overclock/specimen.html",
      tokens: "/systems/overclock/tokens.css",
      css: "/systems/overclock/overclock.css",
      preview: "/systems/overclock/preview.jpg",
      posters: ["/systems/overclock/poster-1.jpg", "/systems/overclock/poster-2.jpg", "/systems/overclock/poster-3.jpg", "/systems/overclock/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Anton&family=Bangers&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,600&family=JetBrains+Mono:wght@400;700&display=swap",
    templates: ["manga-panel-dev-tool-page"],
    components: [
      { id: "nav", label: "Navigation" },
      { id: "buttons", label: "Buttons" },
      { id: "cover", label: "Cover" },
      { id: "terminal", label: "Terminal panel" },
      { id: "sun", label: "Retro sun & skyline" },
      { id: "stats", label: "Stats strip" },
      { id: "break", label: "Panel break" },
      { id: "section-title", label: "Section title" },
      { id: "cards", label: "Feature panels" },
      { id: "steps", label: "Story steps" },
      { id: "pricing", label: "Pricing" },
      { id: "faq", label: "Reader mail" },
      { id: "cta", label: "Final chapter" },
      { id: "footer", label: "Footer" },
    ],
    playground: [
      { token: "--oc-ink", label: "Ink", kind: "color" },
      { token: "--oc-paper", label: "Paper", kind: "color", follow: [{ token: "--oc-grey", darken: 0.09 }, { token: "--oc-mid", darken: 0.24 }] },
      { token: "--oc-white", label: "Panel white", kind: "color" },
      { token: "--oc-term-text", label: "Terminal text", kind: "color" },
      { token: "--oc-border-ink", label: "Ink rule", kind: "range", min: 1, max: 8, step: 1, unit: "px" },
      { token: "--oc-border-frame", label: "Panel frame", kind: "range", min: 1, max: 10, step: 1, unit: "px" },
      { token: "--oc-tone-pitch", label: "Screentone pitch", kind: "range", min: 4, max: 16, step: 1, unit: "px" },
      { token: "--oc-tone-dot", label: "Screentone dot", kind: "range", min: 0.6, max: 3, step: 0.1, unit: "px" },
    ],
    conventions: [
      {
        title: "Typography",
        rules: [
          "Lettering is Bangers (--oc-font-display), always uppercase: headlines in --oc-display-xl/-lg at line-height .86, white fill with a thick ink -webkit-text-stroke and a -2deg tilt; section heads --oc-display-md; buttons --oc-button with 2px tracking.",
          "Numerals and prices are Anton (--oc-font-numeral) at --oc-numeral-*; body is Barlow Condensed (--oc-font-body) at --oc-body/1.55; commands and terminals are JetBrains Mono (--oc-font-mono) at --oc-code.",
          "Labels (.oc-issue, .oc-role, stat captions) are tiny tracked uppercase on an inverted ink block. Katakana sound effects (.oc-jp, ゴゴゴ) are decoration and stay aria-hidden.",
        ],
      },
      {
        title: "Layout",
        rules: [
          "Content sits in panels on a --oc-page-max (1120px) page with a --oc-gutter edge and --oc-gap between panels, like a comic page; sections open with .oc-section-title or an .oc-break strip.",
          "Grids collapse at 900px (stats 4 → 2, steps, pricing and FAQ to one column, the closing panel stacks) and 640px (nav links hide, headline drops to 50px).",
          "The featured panel (.oc-plan-hot) inverts to ink and tilts 1deg; small tags (.oc-hot-tag, .oc-num, .oc-bubble) tilt between -6deg and 4deg.",
        ],
      },
      {
        title: "Panels & ink",
        rules: [
          "Black and white only: --oc-ink on --oc-paper/--oc-white, with greys (--oc-grey, --oc-mid) for shadows and screentone. The night panels use the --oc-night-* inks.",
          "Panel outlines are drawn by an :after overlay through url(#oc-sketchy); small labels use #oc-sketchy-sm. Both need the shared <svg id=\"oc-defs\">.",
          "Shadows are hard and unblurred: --oc-shadow-btn / --oc-shadow-ink on buttons, --oc-shadow-panel (white then ink) on the terminal, --oc-shadow-frame on the page. Texture is screentone (--oc-tone-dot on --oc-tone-pitch) or 45deg hatching (--oc-hatch-pitch), never a gradient.",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Buttons lift 2px on hover and press flat on --oc-dur-press; the FAQ ring spins and fills over --oc-dur-open on --oc-ease-pop.",
          "Cover copy rises in on --oc-dur-rise with 80ms staggers; the sun's gaps slide down it and its rings pulse (--oc-dur-sunrise); the grid floor scrolls on --oc-dur-floor; skyline windows and the terminal cursor blink.",
          "The sun and skyline are built by the component script from data-oc-sun / data-oc-skyline settings. Under prefers-reduced-motion the sun is drawn as static slices and animations stop.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "Scene art (sun, skyline, sound effects, the terminal's static frame) is aria-hidden; meaning lives in the text beside it.",
          "FAQ uses native details/summary; the signup is a real form with a labelled email field, and its result is written as text (✓ / ✗) into .oc-signup-msg, not shown by colour alone.",
          "Ink on paper is above 17:1; keep stroked lettering for display sizes only and set body copy as plain ink.",
        ],
      },
    ],
    look: {
      surface: "--oc-paper",
      ink: "--oc-ink",
      display: "--oc-font-display",
      mono: "--oc-font-mono",
      body: "--oc-font-body",
      identityClass: "",
      identityBg: "var(--oc-ink)",
      identityText: "var(--oc-paper)",
      displayUpper: true,
      sample: { display: "Ship it before the deadline!", body: "One command. No YAML sagas, no pipeline boss fights." },
      layoutNote: "Panels on a 1120px page with 12px gaps · grids collapse at 900px and 640px",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:nav", span: 12 },
      { panel: "component:cover", span: 7 },
      { panel: "component:terminal", span: 5 },
      { panel: "component:sun", span: 12 },
      { panel: "component:buttons", span: 5 },
      { panel: "component:break", span: 7 },
      { panel: "component:stats", span: 8 },
      { panel: "tokens:shape", span: 4, title: "Shape & depth" },
      { panel: "component:cards", span: 12 },
      { panel: "component:section-title", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:steps", span: 12 },
      { panel: "component:pricing", span: 12 },
      { panel: "component:faq", span: 7 },
      { panel: "tokens:layout", span: 5, title: "Layout & screentone" },
      { panel: "component:cta", span: 12 },
      { panel: "component:footer", span: 12 },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: a deploy dashboard",
      note: "The same components, re-composed into an app screen: nav and stats across the top, the deploy log and its steps in the main column, the current plan and a help question alongside.",
      top: ["nav", "stats"],
      main: ["terminal", "steps"],
      side: [{ component: "pricing", select: ".oc-plan-hot" }, { component: "faq", select: ".oc-faq-item" }],
    },
  },
  {
    slug: "meridian",
    name: "Meridian",
    version: "1.0.0",
    tagline: "Light big-tech storefront: warm clay, frosted glass, an LED dot-matrix display and a Fraunces italic accent",
    description:
      "Warm clay surfaces with soft neumorphic depth, frosted-glass navigation, a dot-matrix LED metro board and ticker, Bricolage Grotesque headlines lit by one glowing Fraunces italic word, and a Personal / Business switch that re-themes the whole system. Extracted from the LED Metro Tech Storefront landing page.",
    added: "Oct 18, 2026",
    theme: "light",
    tags: ["light", "claymorphism", "frosted glass", "LED dot-matrix", "big-tech storefront"],
    palette: ["#F6F5F1", "#111317", "#9D8CDC", "#8FDEA0", "#2F6FE0"],
    prefix: "md",
    rootClass: "md",
    files: {
      specimen: "/systems/meridian/specimen.html",
      tokens: "/systems/meridian/tokens.css",
      css: "/systems/meridian/meridian.css",
      preview: "/systems/meridian/preview.jpg",
      posters: ["/systems/meridian/poster-1.jpg", "/systems/meridian/poster-2.jpg", "/systems/meridian/poster-3.jpg", "/systems/meridian/poster-4.jpg"],
    },
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Fraunces:ital,opsz,wght@1,9..144,300..600&family=Instrument+Sans:wght@400..700&family=Inter:wght@400;500;600;700;800&display=swap",
    templates: ["led-metro-tech-storefront"],
    components: [
      { id: "nav", label: "Glass navigation" },
      { id: "buttons", label: "Buttons" },
      { id: "type", label: "Headline pairing" },
      { id: "badges", label: "Badges & pills" },
      { id: "led", label: "LED metro display" },
      { id: "ticker", label: "Dot-matrix ticker" },
      { id: "assist", label: "Assist card" },
      { id: "quick", label: "Quick links" },
      { id: "slider", label: "Feature slider" },
      { id: "travel", label: "Product banner" },
      { id: "articles", label: "Story cards" },
      { id: "faq", label: "FAQ" },
      { id: "ballot", label: "Dark banner" },
      { id: "footer", label: "Footer" },
    ],
    playground: [
      { token: "--md-purple", label: "Accent / glow", kind: "color", follow: [{ token: "--md-purple-deep", darken: 0.3 }] },
      { token: "--md-green", label: "Live green", kind: "color" },
      { token: "--md-bg", label: "Clay ground", kind: "color", follow: [{ token: "--md-clay", darken: 0.02 }] },
      { token: "--md-ink", label: "Ink", kind: "color" },
      { token: "--md-dark", label: "Dark surface", kind: "color" },
      { token: "--md-pink", label: "Button knob", kind: "color" },
      { token: "--md-radius-card", label: "Card radius", kind: "range", min: 0, max: 40, step: 1, unit: "px" },
      { token: "--md-radius-lg", label: "Panel radius", kind: "range", min: 0, max: 48, step: 1, unit: "px" },
      { token: "--md-radius-sm", label: "Control radius", kind: "range", min: 0, max: 24, step: 1, unit: "px" },
    ],
    conventions: [
      {
        title: "Typography",
        rules: [
          "Headlines are Bricolage Grotesque 700-800 with tight negative tracking (--md-display-*), and carry exactly one Fraunces italic word in <em>: a lilac gradient (green on dark, blue in Business) with a soft SVG glow from #md-defs.",
          "Body copy is Instrument Sans 15-17px in --md-gray at line-height 1.6; one phrase per paragraph is lifted to --md-ink in <strong>.",
          "Labels and eyebrows are Inter 600-700 at 11-12px, uppercase with wide tracking; the section eyebrow leads with a blinking green LED dot. Spec values set in Fraunces italic.",
        ],
      },
      {
        title: "Layout",
        rules: [
          "Content sits in a 1320px column with a 40px gutter; sections open with 130px of space and a two-part head (title left, description right).",
          "Cards are generously rounded (22-32px, pills at 999px) and sit on a 12-20px gap; tile rows (quick links, story cards) use minmax(0, 1fr) columns that collapse to one column on phones.",
          "Personal and Business copy live side by side as [data-for] blocks; the switch toggles .md-business on the root and the right set shows.",
        ],
      },
      {
        title: "Clay & glass",
        rules: [
          "Raised things are clay: a white or tinted fill with an outer drop shadow plus inner highlight and inner shade (--md-shadow-clay, -dark, -purple, -green). Never a flat fill for an icon tile or knob.",
          "Chrome floating over content is frosted glass: --md-glass with --md-glass-blur, a 1px white rim and --md-shadow-soft.",
          "Light is the accent: LED dots and the ticker glow on a near-black housing (--md-led-*), and Fraunces accents carry a soft bloom. Keep the warm off-white ground; dark panels are the exception.",
        ],
      },
      {
        title: "Motion",
        rules: [
          "Everything eases on --md-ease-out (cubic-bezier(.2, .8, .2, 1)) over --md-dur-fast to --md-dur-slide; the segmented thumb slides on --md-ease-switch.",
          "Hover rewards are small: the dotted-arrow knob animates, arrows turn 45°, quick-link tiles fill dark from the bottom, chips invert.",
          "Ambient loops are LED-only (chase, rainbow hues, breathe, blink, the stepped ticker, orbit rings); prefers-reduced-motion stops them and the transitions.",
        ],
      },
      {
        title: "Accessibility",
        rules: [
          "The Personal / Business switch and LED mode buttons are real buttons with aria-pressed; line swatches have aria-labels and aria-pressed.",
          "FAQ questions are buttons with aria-expanded; answers open on measured height.",
          "LED boards are aria-hidden decoration; the ticker carries its whole message in aria-label. Grey text stays at or above --md-gray on the clay ground.",
        ],
      },
    ],
    look: {
      surface: "--md-bg",
      ink: "--md-ink",
      display: "--md-font-display",
      mono: "--md-font-ui",
      body: "--md-font-body",
      identityClass: "",
      identityBg: "linear-gradient(160deg, var(--md-surface), var(--md-bg) 55%, var(--md-clay))",
      identityText: "var(--md-ink)",
      displayUpper: false,
      sample: { display: "Meridian", body: "Built for what's next, lit up dot by dot." },
      layoutNote: "A 1320px column with a 40px gutter; sections open with 130px of space and cards sit on a 20px gap.",
    },
    board: [
      { panel: "identity", span: 3 },
      { panel: "tokens:palette", span: 5, title: "Color palette" },
      { panel: "tokens:type", span: 4, title: "Typography" },
      { panel: "component:nav", span: 12 },
      { panel: "component:led", span: 7 },
      { panel: "tokens:shape", span: 5, title: "Clay, glass & radii" },
      { panel: "component:buttons", span: 7 },
      { panel: "component:assist", span: 5 },
      { panel: "component:badges", span: 12 },
      { panel: "component:ticker", span: 12 },
      { panel: "component:slider", span: 12 },
      { panel: "component:type", span: 7, title: "Headline pairing" },
      { panel: "tokens:layout", span: 5, title: "Layout & spacing" },
      { panel: "component:quick", span: 12 },
      { panel: "component:travel", span: 12 },
      { panel: "component:articles", span: 12 },
      { panel: "component:faq", span: 7 },
      { panel: "tokens:motion", span: 5, title: "Motion" },
      { panel: "component:ballot", span: 12 },
      { panel: "component:footer", span: 12 },
      { panel: "context", span: 12 },
      { panel: "used", span: 12, title: "Extracted from" },
      { panel: "tokens:all", span: 12, title: "All tokens" },
    ],
    context: {
      title: "In context: a device launch hub",
      note: "The same parts, re-composed into a product launch page rather than a storefront home.",
      top: ["nav", "ticker"],
      main: ["slider", "quick"],
      side: [{ component: "led" }, { component: "assist" }],
    },
  },
];

/** The cover image: the poster when there is one, else the board */
export const systemCover = (s: SystemEntry) => s.files.posters?.[0] ?? s.files.preview;

export const getSystemBySlug = (slug?: string) => systems.find((s) => s.slug === slug);

/** The system a template belongs to, for the "View design system" link on its page. */
export const getSystemForTemplate = (templateSlug: string) => systems.find((s) => s.templates.includes(templateSlug));
