/**
 * MOTION: studies of one movement each. Not pages and not systems: the item
 * is the motion itself, so every entry carries its choreography as data (the
 * tracks one element runs through, the eases, the inputs that drive it) and
 * the lab draws it beside the live demo.
 *
 * The demo lives in public/motion-lab/<slug>.html (not public/motion/, where
 * Netlify's pretty URLs would serve it at /motion/<slug> instead of the lab). It
 * takes the lab's controls over postMessage (speed, step, autoplay, and one
 * message per knob and toggle, named by its id) and reports a status line
 * back; see the "Lab hooks" script at the bottom of each file.
 */

export type EaseName =
  | "none"
  | "power1.inOut"
  | "power4.inOut"
  | "power1.out"
  | "power2.in"
  | "power3.out"
  | "elastic.out(1, 0.3)"
  | "elastic.out(1, 0.6)";

export interface MotionTrack {
  /** What moves, as the code names it */
  prop: string;
  /** Human words for the change */
  change: string;
  /** Where it runs inside the life drawn on the timeline, 0..1 */
  start: number;
  end: number;
  ease: EaseName;
  /** Plays forward then back over its span */
  yoyo?: boolean;
}

/** A live control: the lab posts { type: id, value } to the demo */
export interface MotionKnob {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  note?: string;
}

export interface MotionToggle {
  id: string;
  label: string;
  value: boolean;
}

export interface MotionEntry {
  slug: string;
  title: string;
  kind: string;
  tagline: string;
  description: string;
  added: string;
  theme: "dark" | "light";
  demo: string;
  poster: string;
  library: { name: string; version: string; plugins: string[] };
  /** The span the timeline draws, in seconds, and what it is called */
  life: number;
  lifeLabel: string;
  /** How long one pass of the drawn playhead takes at 1x (slower or faster than life, to be readable) */
  drawSeconds: number;
  /** When elements run the same life offset in time */
  stagger?: number;
  elements: number;
  tracks: MotionTrack[];
  /** The stage's readout before the demo reports, and the step buttons' names */
  status: string;
  stepLabels: [string, string];
  /** The reel card's hands-off loop: ms between steps */
  reelAutoplay: number;
  inputs: { keys: string[]; does: string }[];
  /** Tweaks the lab can apply live to the demo */
  knobs: MotionKnob[];
  toggles: MotionToggle[];
  trick: { title: string; steps: string[] };
  tags: string[];
  bestFor: string[];
  /**
   * Library pages this movement would suit, chosen by hand. A suggestion, not a
   * claim that the page uses it: the site labels it PAIRS WITH.
   */
  pairsWith: string[];
  credits: { label: string; href: string; note: string }[];
  prompt: string;
}

export const motions: MotionEntry[] = [
  {
    slug: "coverflow-carousel",
    title: "Coverflow Carousel",
    kind: "CAROUSEL",
    tagline: "An endless 3D cover flow driven by the page's own scroll: swing, lift, reflect, snap",
    description:
      "Ten album covers swing through a perspective stage on one GSAP timeline. Scroll, drag, the arrow keys or a click scrub a playhead across it; the loop never ends because the scroll quietly wraps, and every stop snaps a cover to the centre with a floor reflection under it.",
    added: "Oct 18, 2026",
    theme: "dark",
    demo: "/motion-lab/coverflow-carousel.html",
    poster: "/motion-lab/coverflow-carousel.jpg",
    library: { name: "GSAP", version: "3.7.0", plugins: ["ScrollTrigger", "Draggable"] },
    life: 1,
    lifeLabel: "ONE COVER'S LIFE",
    drawSeconds: 4,
    stagger: 0.1,
    elements: 10,
    status: "CENTRE 01/10 · DUSKLINE",
    stepLabels: ["Previous cover", "Next cover"],
    reelAutoplay: 2400,
    tracks: [
      { prop: "opacity · scale", change: "fade in, 0.5 → 1", start: 0, end: 0.1, ease: "none" },
      { prop: "xPercent", change: "250 → −350 across the stage", start: 0, end: 1, ease: "power1.inOut" },
      { prop: "rotateY", change: "−50° → 50°, the swing", start: 0, end: 1, ease: "power4.inOut" },
      { prop: "z · scale", change: "lift 100px, 1.25× at centre", start: 0.4, end: 0.6, ease: "none", yoyo: true },
      { prop: "zIndex", change: "rises to the top, falls back", start: 0, end: 1, ease: "none", yoyo: true },
      { prop: "opacity · scale", change: "fade out, 1 → 0.5", start: 0.9, end: 1, ease: "none" },
    ],
    inputs: [
      { keys: ["SCROLL"], does: "Scrubs the playhead; the page scroll is the timeline" },
      { keys: ["DRAG"], does: "Grab a cover and throw it sideways" },
      { keys: ["←", "→"], does: "One cover back or forward (A and D too)" },
      { keys: ["CLICK"], does: "Any cover takes the shortest way to the centre" },
      { keys: ["◀", "▶"], does: "The glossy step buttons under the stage" },
    ],
    knobs: [
      {
        id: "perspective",
        label: "CAMERA DEPTH",
        min: 300,
        max: 1600,
        step: 10,
        value: 800,
        unit: "px",
        note: "Lower is a wide lens: the swing exaggerates. Higher flattens it.",
      },
    ],
    toggles: [{ id: "reflect", label: "FLOOR REFLECTION", value: true }],
    trick: {
      title: "Infinite without infinite scroll",
      steps: [
        "Build the strip three times over and lay every cover's 1s life on one paused timeline, 0.1s apart.",
        "Play only the middle copy: a second tween scrubs the timeline's totalTime across one cycle, so both ends always have covers.",
        "Map 2000px of page scroll onto that cycle with ScrollTrigger (pinned). At the bottom, jump the scroll to the top and count one more lap; at the top, the reverse. The jump is invisible because the playhead keeps adding laps.",
        "Ease toward the target with a 0.25s scrub tween instead of setting it, and snap to the nearest 1/10 on scrollEnd, so every stop lands a cover dead centre.",
      ],
    },
    tags: ["3D", "scroll-driven", "draggable", "infinite loop", "reflection"],
    bestFor: ["music and media libraries", "portfolio and case-study rails", "product galleries", "event line-ups"],
    pairsWith: ["starfork-game-studio-landing-page", "maasai-inspired-event-landing-page", "holographic-ticket-landing-page", "led-metro-tech-storefront"],
    credits: [
      {
        label: "Jhey Tompkins (jh3y) on CodePen",
        href: "https://codepen.io/jh3y",
        note: "The infinite scroll-driven album carousel this study is built on; the covers here are drawn in code",
      },
    ],
    prompt: `Build an endless 3D cover-flow carousel as one HTML file: ten square album covers swing through a perspective stage, driven by the page's own scroll, with drag, keys, clicks and two step buttons. GSAP 3.7 with ScrollTrigger and Draggable from cdnjs; no other libraries and no image files.

THE STAGE
- Background hsl(0 0% 10%). A full-viewport .boxes layer with perspective 800px and transform-style preserve-3d, pinned by ScrollTrigger.
- Each .box is absolutely centred, 20vmin square with a 200px minimum, yPercent -50, display none until the timeline is built.
- Covers are generated in code: ten SVG data URIs at 300x300 (sunset rings, diagonal stripes, a dot field, sine waves, a triangle mosaic, a crescent night, Bauhaus shapes, blurred glow blobs, a tilted checkerboard, a sunburst), each with a small monospace label bottom-left. A seeded PRNG keeps the random ones identical on every load.
- Floor reflection: -webkit-box-reflect: below 0.5vmin with a transparent-to-white mask. Where box-reflect is unsupported, draw it with ::after (the cover flipped below) and ::before (a gradient from the background to transparent over it).
- Two round glossy step buttons under the stage (2px light border, a grey-to-black gradient that inverts while pressed, a play-triangle icon, the first rotated 180deg), lifted to z 200 so they sit in front of the covers. A small scroll hint icon nudges in the top-right corner.

ONE COVER'S LIFE (a 1s timeline)
- set: xPercent 250, rotateY -50, opacity 0, scale 0.5
- 0 → 0.1: opacity 1, scale 1 (and the reverse from 0.9 → 1)
- 0 → 1: xPercent 250 → -350, ease power1.inOut (the pan)
- 0 → 1: rotateY -50 → 50, ease power4.inOut (the swing, fast through the middle)
- 0.4 → 0.6: z 100 and scale 1.25, yoyo (the lift at the centre)
- 0 → 1: zIndex 1 → 10 and back, yoyo, ease none (whoever is centred is on top)
- Use immediateRender: false on the fromTo tweens that start later in the same timeline.

THE INFINITE LOOP
- Repeat the list three times and add each cover's timeline to one paused LOOP timeline at index × 0.1 (stagger 0.1, so a cycle is 1s for ten covers).
- Never play LOOP directly. LOOP_HEAD is a tween of LOOP's totalTime from cycle + 0.5 (the middle copy, with cover 0 centred) to += cycle, linear, repeat -1, paused.
- A PLAYHEAD object holds the position; a SCRUB tween (0.25s, power3) eases position toward its target and, on update, sets LOOP_HEAD.totalTime(wrap(position)).
- ScrollTrigger from 0 to +2000px, pinned. On update, the target is (iteration + progress) × LOOP_HEAD.duration(). Past the end, add one to iteration and jump the scroll to 1; scrolling up past the top, subtract one and jump to end - 1. The jumps are invisible because iteration carries the lap count.
- On scrollEnd, snap the position to the nearest 1/10 and scroll there, wrapping the lap if the snapped progress leaves 0..1.

INPUTS
- Arrow keys and A / D step one cover. The buttons step one cover. Clicking a cover finds the shortest signed distance from the centred cover (wrapping around) and scrolls there.
- Draggable on a hidden proxy with the covers as its trigger: on press remember the position, on drag move it by (startX - x) × 0.001, on release snap.

THINGS THAT BREAK
- Keep the page scrollable (hide the scrollbar, don't set overflow hidden), or wheel and trackpad never reach ScrollTrigger.
- Set the covers to display block only after the timelines exist, or they flash at the centre on load.
- zIndex must ride the timeline too: depth sorting alone does not order siblings inside a preserve-3d stage reliably.

THE FLOOR
- Buttons are real buttons with visually hidden labels; covers have alt text; under prefers-reduced-motion the scrub tween has zero duration so steps land instantly. Works at 390px wide (the cover minimum is 200px).`,
  },
  {
    slug: "elastic-portrait-accordion",
    title: "Elastic Portrait Accordion",
    kind: "ACCORDION",
    tagline: "An editorial portrait row that springs open on a click: one card stretches wide, zooms in and names its sitter, the rest squeeze thin",
    description:
      "Five painted portraits, The Portrait Edit, stand side by side. Click one and it springs to almost three times its width on a loose elastic while the others squeeze to slivers on a tighter one; the portrait eases in a touch and its italic caption rises in. Click it again and the row springs back. The art never stretches: each card is a window onto a square that stays centred.",
    added: "Oct 18, 2026",
    theme: "light",
    demo: "/motion-lab/elastic-portrait-accordion.html",
    poster: "/motion-lab/elastic-portrait-accordion.jpg",
    library: { name: "GSAP", version: "3.12.5", plugins: [] },
    life: 2.5,
    lifeLabel: "ONE CLICK",
    drawSeconds: 5,
    elements: 5,
    tracks: [
      { prop: "width · the clicked card", change: "15vw → 42vw, overshoots and settles", start: 0, end: 1, ease: "elastic.out(1, 0.3)" },
      { prop: "width · every other card", change: "15vw → 8vw, a tighter spring", start: 0, end: 0.8, ease: "elastic.out(1, 0.6)" },
      { prop: "scale · the portrait", change: "1 → 1.06, a slow push in", start: 0, end: 0.96, ease: "power3.out" },
      { prop: "opacity · y · old caption", change: "out and down 12px", start: 0, end: 0.14, ease: "power2.in" },
      { prop: "opacity · y · new caption", change: "rises in after 0.55s", start: 0.22, end: 0.62, ease: "power3.out" },
    ],
    status: "ALL CLOSED · CLICK A PORTRAIT",
    stepLabels: ["Open the previous portrait", "Open the next portrait"],
    reelAutoplay: 2600,
    inputs: [
      { keys: ["CLICK"], does: "Opens that portrait, zooms it in and shows its name; the rest squeeze to slivers" },
      { keys: ["CLICK AGAIN"], does: "Springs the whole row back to equal widths" },
      { keys: ["CLICK ANOTHER"], does: "Hands the width over mid-spring, without a reset" },
    ],
    knobs: [
      {
        id: "openPeriod",
        label: "OPENING SPRING",
        min: 0.15,
        max: 1,
        step: 0.05,
        value: 0.3,
        note: "The clicked card's elastic period. Lower wobbles more; 1 barely overshoots. Applies from the next click.",
      },
      {
        id: "restPeriod",
        label: "SQUEEZE SPRING",
        min: 0.15,
        max: 1,
        step: 0.05,
        value: 0.6,
        note: "The other cards' period. Keep it tighter than the opening spring so the open card leads.",
      },
    ],
    toggles: [],
    trick: {
      title: "Two springs, one row",
      steps: [
        "Every click tweens every card: the clicked one to 42vw over 2.5s on elastic(1, 0.3), the rest to 8vw over 2s on elastic(1, 0.6). Clicking the open card sends them all back to 15vw.",
        "The two periods differ on purpose: the wide card swings longer and looser than the thin ones, so the eye follows the one that opened.",
        "The finish is layered on calmer eases: every caption drops out fast (power2.in, 0.35s), the opened one rises in 0.55s later (power3.out), and its portrait pushes in to 1.06 over 2.4s. The springs bounce; the details don't.",
        "Give the width and zoom tweens overwrite: true. Without it a fast second click leaves the first card's 2.5s tween running past the new one, and two cards end up open.",
        "Each portrait is generated by one SVG function from a palette per sitter (gradients for skin, hair, cloth, iris and lips, soft blurred shading, a rim light, film grain), sized at least as wide as its card and cropped (xMidYMid slice), so resizing reveals more of it instead of squashing it.",
      ],
    },
    tags: ["elastic", "accordion", "click", "editorial", "svg portraits"],
    bestFor: ["team and speaker pages", "portfolio and editorial galleries", "product or plan pickers", "testimonial rows"],
    pairsWith: ["maasai-inspired-event-landing-page", "generative-editorial-product-page", "peptide-skincare-store-landing-page", "social-work-agent-swarm-landing-page"],
    credits: [],
    prompt: `Build an elastic portrait accordion as one HTML file: an editorial row of five tall rounded portrait cards ("The Portrait Edit, Vol. I"); click one and it springs wide, zooms in a touch and reveals an italic caption, while the others squeeze thin. GSAP 3.12 from cdnjs; Google Fonts Cormorant Garamond (italic 400/500) and Inter (400/500). No other libraries, no image files.

THE STAGE
- body is a full-height flex centre on a 135deg gradient #295fd5 → #9d8ce0, user-select none, Inter. A small mark top-left: "The Portrait Edit" in Cormorant italic 20px, then "VOL. I" in 11px caps tracked .32em, white at 85%.
- One .group with white-space: nowrap, overflow hidden, padding 7vh 2vw 9vh. Each .item: inline-block, 15vw wide, 75vh tall, 1vw margin, 3vw radius, overflow hidden, isolation isolate, cursor pointer, a deep indigo drop shadow. ::after draws an inset 1px white hairline and a brighter top edge; ::before darkens the bottom 38% for the caption.
- Captions (.cap) sit bottom-left, hidden: "N° 02 — PORTRAIT" in 10px caps tracked .34em, the name in Cormorant italic clamp(26px, 5vh, 52px), and a 36px hairline rule.

THE PORTRAITS (one SVG function, five palettes)
- portrait(sitter, id) returns a 200x200 SVG (xMidYMid slice) with gradients namespaced by id: a background, drifting blurred orbs, then a gently breathing group with back hair, a garment, neck with shadow, ears, a face path filled with a radial skin gradient plus a side shade and a blurred rim light, highlight and blush ellipses, brows, eyes (white, gradient iris, pupil, catchlights, lids and a liner flick, all clipped to the eye shape; or closed with lashes), a nose and nostril shadow, lips from two gradient paths with highlights, then front hair and extras. A vignette and a feTurbulence grain overlay finish it.
- Sitters: Ember (long dark waves, sunset studio, a gold pendant), Lagoon (curls built from seeded circles, deep teal, gold hoops), Velvet (burgundy bob, eyes closed, black lapels), Aurum (copper bun, round gold frames, a ribbed green collar), Nocturne (pixie crop, moonlit sky with twinkling stars, pearl drop earrings). Use a seeded PRNG so the curls and stars are the same on every load.
- Ambient life in CSS: orbs drift (11-17s), eyes blink (scaleY .08 at 95.5% of a 6s loop), earrings sway ±5deg, the figure breathes 0.6px, stars twinkle. transform-box: fill-box so each shape moves around itself. All of it stops under prefers-reduced-motion.
- The SVG is absolutely positioned at top 0, left 50%, width max(75vh, 100%) with a negative margin of half that, height 75vh: it stays centred and covers the card at any width.

THE MOTION
- expand(item, i): mark every other card unclicked; tween all cards to width item.clicked ? 15vw : 8vw over 2s with ease elastic(1, 0.6); flip item.clicked; tween the clicked card to item.clicked ? 42vw : 15vw over 2.5s with ease elastic(1, 0.3). Both with overwrite: true.
- Every caption fades out and drops 12px (0.35s, power2.in); every portrait eases back to scale 1 (1.6s, power3.out). If the card opened: its caption rises in after 0.55s (1s, power3.out) and its portrait pushes in to scale 1.06 (2.4s, power3.out, transform-origin 50% 45%).

THINGS THAT BREAK
- Without overwrite, a quick second click leaves the first card's longer tween running after the new one ends, and two cards stay open.
- A fixed 75vh-wide SVG is narrower than a 42vw card on wide screens, which shows the card's edges and loses its rounded corners. Size it max(75vh, 100%).
- Namespace every gradient, clip path and filter id per portrait, or all five paint with the first one's colours.
- Keep the row on one line (nowrap): 4 × 8vw + 42vw plus margins stays under 100vw.

THE FLOOR
- Under prefers-reduced-motion, run the springs almost instantly and stop the ambient loops. Cards are clickable divs in the original; for production make them buttons with aria-expanded and give each SVG a label. Works at 390px wide (the widths are viewport units).`,
  },
  {
    slug: "neon-room-loop",
    title: "Neon Room Loop",
    kind: "INFINITE LOOP",
    tagline: "Three columns of cards drift forever in opposite directions, and every scroll kicks them faster",
    description:
      "Nine cards, each a different camera on one isometric neon room drawn in SVG, drift up and down in three columns that never end. The loop runs on its own; scrolling feeds the scroll velocity into it, so a flick sends the columns racing before they ease back to a cruise. Hover a card and it wakes from grey into full colour with a blue glow.",
    added: "Oct 18, 2026",
    theme: "dark",
    demo: "/motion-lab/neon-room-loop.html",
    poster: "/motion-lab/neon-room-loop.jpg",
    library: { name: "GSAP", version: "3.12.5", plugins: ["ScrollTrigger"] },
    life: 20,
    lifeLabel: "ONE CARD'S LAP",
    drawSeconds: 8,
    elements: 18,
    tracks: [
      { prop: "y · columns 1 and 3", change: "0 → −½ column, then wraps", start: 0, end: 1, ease: "none" },
      { prop: "y · column 2", change: "0 → +½ column, the other way", start: 0, end: 1, ease: "none" },
      { prop: "offset · on scroll", change: "velocity ÷ 2000, eases back to 0", start: 0.3, end: 0.325, ease: "power1.out" },
      { prop: "filter · on hover", change: "grey → full colour, glow", start: 0.6, end: 0.63, ease: "power1.out" },
    ],
    status: "CRUISING · SCROLL TO KICK IT",
    stepLabels: ["Kick the loop upward", "Kick the loop downward"],
    reelAutoplay: 3200,
    inputs: [
      { keys: ["SCROLL"], does: "Adds the scroll velocity to every card; harder flicks race further" },
      { keys: ["HOVER"], does: "Wakes a card from grey into colour with a neon edge" },
      { keys: ["IDLE"], does: "The columns keep drifting on their own, forever" },
    ],
    knobs: [
      {
        id: "kick",
        label: "SCROLL KICK",
        min: 400,
        max: 6000,
        step: 100,
        value: 2000,
        note: "Scroll velocity is divided by this. Lower kicks harder; up-scrolls use 1.5× it.",
      },
    ],
    toggles: [],
    trick: {
      title: "A loop that never resets",
      steps: [
        "Each column's cards are appended twice, so the column is two identical halves. Every card tweens y by half the column height over 20s, linear, repeat -1: when the first half has scrolled away the second is exactly where it started.",
        "A modifiers function wraps y with % (½ column height), so values never grow and the seam never shows. Columns 1 and 3 go up, column 2 goes down.",
        "Inside the same modifier, a shared offset keeps adding additionalY: scroll velocity from ScrollTrigger (÷2000 down, ÷3000 up), tweened back to 0. The base tween never changes; the kick rides on top.",
        "The cards are one SVG room rendered nine ways: boxes and planes in isometric space projected with (x − y)·0.866·s and (x + y)·0.5 − z, sorted by draw order, with a different scale and focus point per card (and one wireframe blueprint).",
      ],
    },
    tags: ["infinite loop", "scroll velocity", "isometric", "neon", "parallax columns"],
    bestFor: ["portfolio and case-study walls", "agency and studio hero sections", "product screenshot galleries", "event and gallery sites"],
    pairsWith: ["neon-glass-app-landing-page", "icon-cut-card-stack-page", "skewed-marquee-wall"],
    credits: [
      {
        label: "Made by Beings",
        href: "https://madebybeings.com",
        note: "The vertical image loop with scroll acceleration this study is built on, credited in the original",
      },
    ],
    prompt: `Build an endless three-column card loop with scroll acceleration as one HTML file: cards drift forever, columns alternate direction, and scrolling kicks them faster before they ease back. GSAP 3.12 and ScrollTrigger from cdnjs, Google Font Unbounded (400/600/800). No image files: every card is an SVG drawn by the script.

THE STAGE
- Palette: page radial #1d1935 → #07060f, whites #FBFAFE / #9E99C1 / #383358 / #282347, navy #1f2158, neon blues #5189fa and #287dd2, a red #D51E24.
- A 500vh section only gives the page something to scroll; the real view is a fixed .gallery of three flex columns (the middle one aligned to the bottom), 160% wide on phones so cards stay large.

THE CARDS
- Each card: 1rem padding around a 22px-radius frame with a hairline border, layered deep shadows, a 6px glowing blue status dot top-right, and a caption gradient at the bottom with an index ("02 / 09"), a title and a pill tag.
- At rest: filter saturate(.2) brightness(.78). On hover: full saturation, a blue border and glow, z-index on top, and the art scales 1.06 over 1.4s (cubic-bezier(.2,.7,.2,1)).
- The art is one isometric neon room rendered nine times with different cameras: describe the room as a list of boxes (x, y, z, w, d, h with top / left / right fills), flat quads on the walls and floor, and glows (radial-gradient ellipses). Project with P(x, y, z) = (ox + (x − y)·0.866·s, oy + ((x + y)·0.5 − z)·s), centring a focus point. The room: floor and rug, two walls with neon trims, a door with a neon frame, two paintings, a bookshelf with books, a media wall with speakers, a console and a glowing TV, a coffee table with a tablet, an L-shaped sofa. One card is a wireframe blueprint with a floor grid. Screens and some glows flicker (opacity .78 ↔ 1, 0.25s alternate).

THE LOOP
- Deal the nine cards three per column, then append a clone of each column's cards so every column is two identical halves.
- For every card: gsap.to(item, { y: '-=' or '+=' half the column height, duration 20, repeat -1, ease 'none', modifiers: { y: unitize(y => wrap) } }). Odd columns go down (+=), the rest up (-=).
- In the modifier, add a shared offset (offset += additionalY.val each call) and wrap: up columns y = (y + offset) % −half, down columns y = (y − offset) % half.
- ScrollTrigger on the section: on update take getVelocity(); set additionalY.val = −velocity / 2000 when scrolling down (÷3000 when up), and tween it back to 0 (default 0.5s, power1.out), killing the previous decay first.

THINGS THAT BREAK
- Measure each column's height after appending the clones, and wrap at exactly half of it, or a gap or a jump appears at the seam.
- Never change the base tween to speed up: the kick must ride on the offset, or the loop stutters every time the velocity changes.
- The gallery is position: fixed, so the page needs its tall section to scroll at all.

THE FLOOR
- prefers-reduced-motion stops the flicker; slow the loop right down for it as well. Captions are real text; each SVG has role="img" and an aria-label. No horizontal scroll at 390px.`,
  },
];

export const getMotionBySlug = (slug?: string) => motions.find((m) => m.slug === slug);

/** Motion studies suggested for a page (the reverse of pairsWith) */
export const motionsForPage = (pageSlug: string) => motions.filter((m) => m.pairsWith.includes(pageSlug));
