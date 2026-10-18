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
  files: { specimen: string; tokens: string; css: string; preview: string };
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
];

export const getSystemBySlug = (slug?: string) => systems.find((s) => s.slug === slug);

/** The system a template belongs to, for the "View design system" link on its page. */
export const getSystemForTemplate = (templateSlug: string) => systems.find((s) => s.templates.includes(templateSlug));
