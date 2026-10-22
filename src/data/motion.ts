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
    slug: "conveyor-gallery",
    title: "Conveyor Gallery",
    kind: "WEBGL CONVEYOR",
    tagline: "A portfolio printed on a looping 3D conveyor belt: scroll and the covers glide round, and the camera turns from three-quarter to face-on",
    description:
      "Eight project covers (a wealth office, a spectral imaging lab, a ceramics atelier, a trading desk, a crypto exchange, a traders' social feed, a grappling tour and a developer community), every one painted in code with Canvas 2D, ride one continuous ribbon wrapped round a stadium-shaped loop. The wheel, a swipe or the arrows throw it forward with momentum that bleeds off each frame, while the camera swings from an angled three-quarter view to straight on. One WebGL shader tiles the covers along the belt, lights it, and ray-casts the belt's own soft shadow onto its far side; a picking pass makes every cover clickable. No libraries.",
    added: "Oct 22, 2026",
    theme: "dark",
    demo: "/motion-lab/conveyor-gallery.html",
    poster: "/motion-lab/conveyor-gallery.jpg",
    library: { name: "WebGL", version: "1.0", plugins: ["no libraries", "Canvas 2D covers"] },
    life: 1.2,
    lifeLabel: "ONE STEP: A COVER'S GLIDE AND THE CAMERA'S TURN",
    drawSeconds: 3,
    elements: 8,
    status: "SCROLL, SWIPE OR USE THE ARROWS",
    stepLabels: ["Previous cover", "Next cover"],
    reelAutoplay: 2000,
    tracks: [
      { prop: "offset · belt", change: "+1 cover: a kick of velocity that keeps 94% each frame", start: 0, end: 1, ease: "power3.out" },
      { prop: "present · camera", change: "angled → face-on, 7% of the way each frame", start: 0, end: 1, ease: "power3.out" },
      { prop: "rotation.y · belt", change: "sways ±0.08 rad with the offset, fading out as it faces you", start: 0, end: 1, ease: "power1.inOut", yoyo: true },
      { prop: "rig · parallax", change: "tilts after the pointer at 3.2% a frame", start: 0, end: 1, ease: "power1.out" },
    ],
    inputs: [
      { keys: ["WHEEL", "SWIPE"], does: "Throw the belt forward or back with momentum; scrolling down also turns the camera face-on, up turns it back" },
      { keys: ["↑", "↓", "←", "→"], does: "Move exactly one cover and turn the camera a little" },
      { keys: ["POINTER"], does: "Tilts the rig with a soft parallax; hovering a still cover shows a pointer, clicking opens it" },
    ],
    knobs: [
      {
        id: "friction",
        label: "FRICTION",
        min: 85,
        max: 98,
        step: 1,
        value: 94,
        unit: "%",
        note: "How much velocity survives each frame. Lower stops dead; higher glides a long way after one flick. A step still lands on exactly one cover.",
      },
      {
        id: "view",
        label: "CAMERA",
        min: 0,
        max: 100,
        step: 5,
        value: 0,
        unit: "%",
        note: "Where the camera sits between the angled three-quarter view (0) and straight on (100). Scrolling moves it too.",
      },
    ],
    toggles: [
      { id: "parallax", label: "POINTER PARALLAX", value: true },
      { id: "grain", label: "FILM GRAIN", value: true },
    ],
    trick: {
      title: "One ribbon, one shader, one number",
      steps: [
        "The belt is a single strip of 257 vertex pairs that follows a stadium loop: up the front straight, over a half circle, down the back and round again. Each vertex carries its distance round the loop (0 to 1) as uv.y, and its normal in the y-z plane.",
        "Every cover is painted at 1200 × 900 with Canvas 2D after the fonts load (a butterfly in bezier curves, a prism with a conic gradient, candlesticks from a seeded random walk) and packed into one texture atlas.",
        "The fragment shader turns uv.y into phase = uv.y × 8 + offset: the whole part picks the cover, the fraction is the row inside it. So one number, the offset, scrolls every cover round the belt at once. No geometry moves.",
        "Momentum is closed form: each frame the velocity is multiplied by 0.94 and the offset moves by v × 0.94 × (1 − 0.94ⁿ) / 0.06, so it stays right at any frame rate. That makes a step easy: a kick of 0.06 / 0.94 travels exactly one cover.",
        "The camera interpolates between an angled position (−2, −9.35, 11) with the belt rotated and a straight-on one, by a smoothstep of present; the belt's sway and the parallax fade out as it faces you. Soft shadows come from casting five rays per pixel towards the light against the belt's own analytic shape, two planes and two cylinders. Picking draws the same mesh with each cover's index as its colour and reads one pixel back.",
      ],
    },
    tags: ["webgl", "3d", "portfolio", "momentum", "canvas", "gallery"],
    bestFor: ["agency and studio portfolios", "selected-work and case-study indexes", "product galleries and showcases", "launch pages that show many screens at once"],
    pairsWith: ["craft-studio-webgl-landing-page", "starfork-game-studio-landing-page", "icon-cut-card-stack-page", "skewed-marquee-wall", "stage-light-launch-page"],
    credits: [
      {
        label: "Shakuro (Dribbble)",
        href: "https://dribbble.com/shakuro",
        note: "The selected-work conveyor this study is based on, named in the original; the covers here are fictional",
      },
    ],
    prompt: `Build a portfolio gallery where the project covers ride a looping 3D conveyor belt, as one HTML file, one screen with no scrollbar. Plain WebGL 1, no libraries. Google Fonts: Inter (400-900), Instrument Serif (with italic) and JetBrains Mono (400/700). No image files: every cover is painted with Canvas 2D at load.

THE STAGE
- Black page, html and body 100% with overflow hidden. A stage laid out at 1080px tall and scaled to the window height, holding: a breathing volumetric light from above (stacked radial gradients, blurred 18px, a faint conic ray mask, a 10s scale and opacity loop), a soft dark gradient at the bottom, and a full-screen WebGL grain canvas (four hashed randoms averaged, redrawn every 80ms, soft-light at 0.22). The stage fades in over 1.6s.
- #app is fixed over everything with touch-action none: the conveyor canvas (a drop shadow 20px 32px 28px) and a list of real links, one per project, visually hidden but focusable (the focused one shows as a pill at the bottom).

THE COVERS (1200 × 900 each, painted once the fonts load, 2.5s cap)
Eight fictional sites, each a full hero composition: Monarch (private wealth, a bezier monarch butterfly with veins and spots on dark amber, "Wings of quiet wealth." in Instrument Serif), Spektral (a ring of light refracting a beam into a spectrum, a conic gradient glow, channel bars), Owari (ceramics on paper with speckle, a striped red sun, vertical Japanese type, huge OWARI), Trading Dashboard (candlesticks from a seeded walk, a moving average, volume, an order book with depth bars, Buy and Sell), Crypto Exchange ("Trade what comes next.", a sparkline card, four coin cards), Chartroom (a light social feed for traders: profile, trending tickers, two posts with charts, a top traders list), Apex (a grappling tour: GRAND and outlined SLAM, a bracket, a tilted yellow marquee band, three event cards) and Developer Community (a code editor with syntax colours, a terminal, three post cards, stats and stacked avatars). Use a seeded random so they paint the same every time. Each cover is also the image of its link.

THE BELT
- A stadium loop: two straights of length 5.8 at z = ±1.02 joined by half circles of radius 1.02 (y from −2.9 to 2.9). Build a ribbon of 257 vertex pairs along it, width (11.6 + 2π·1.02) / 8 × 4/3 so a cover keeps 4:3; each vertex has x, y, z, uv (side, distance round the loop) and its normal in y-z.
- Pack the covers into one atlas (columns ceil(√(8 × 0.75))), with an anisotropic filter when available.
- Fragment shader: phase = mod(uv.y × 8 + offset, 8); the floor is the cover, the fraction the row; sample the atlas with a half-texel inset. Flip the normal for the back face. Light: a fixed direction (−0.45, 1.1, 0.8), ambient 0.36 on the front and 0.14 on the back (darker round the folds), diffuse, a faint specular. Soft self-shadow: from each pixel cast five rays towards the light (one plus four jittered) against the two straight planes and the two half cylinders analytically, fading by distance from the ribbon's edges.
- Vertex shader: rotate the belt (x 0.07, y −0.594 plus a sway of 0.081 × sin(offset × 2π / 8), z −0.28), then a rig rotation from the pointer, then a look-at camera with a fixed projection and the view shifted up by 0.2.

THE MOTION (state: offset, velocity, present, targetPresent, pointer, parallax)
- Every frame, n = elapsed / (1000 / 60) capped at 3: decay = 0.94ⁿ; offset += velocity × 0.94 × (1 − decay) / 0.06 (wrapped 0-8); velocity ×= decay; present eases to targetPresent by 1 − 0.93ⁿ; parallax eases to the pointer by 1 − 0.968ⁿ.
- The wheel adds deltaY × 0.00019 to the velocity and deltaY × 0.00033 to targetPresent (clamped 0-1); a touch drag uses 0.00155 and 0.0024. An arrow key adds exactly 0.06 / 0.94 (one cover) and ±0.12 to targetPresent.
- The camera: e = smoothstep(present). Position (−2, −9.35, 10.99 − 4.79e) scaled by (1 − e) on x and y, zoomed out on tall screens by max(1, 0.9 × height / width); the belt's rotations and the parallax are multiplied by (1 − e), so at e = 1 the belt faces you flat.
- Picking: draw the mesh with each cover's index + 1 in the red channel, read the pixel under the pointer, then redraw. When the belt is nearly still, a cover under the pointer shows a pointer cursor; a click (not a drag) opens its link.
- Optional autoplay for previews: advance one cover every 2s and swing the camera to face-on and back every two covers.

THINGS THAT BREAK
- Never make the page scroll to drive this: the wheel and touch move the state directly, and the page has no scrollbar.
- Make the momentum frame-rate independent with the closed form above, or a 120Hz screen glides twice as far.
- Paint the covers only after the fonts load, or the atlas is set in fallback type.
- Handle webglcontextlost on both canvases (fall back to a grid of the cover links, and a generated noise texture for the grain) and webglcontextrestored.
- Cap the device pixel ratio at 2 and the atlas at the GPU's MAX_TEXTURE_SIZE (4096 at most).

THE FLOOR
One visually hidden h1; the canvas is aria-hidden and every cover is a real link with an aria-label, so keyboard and screen reader users get the gallery. prefers-reduced-motion drops momentum (the wheel moves the belt directly, the arrows snap one cover) and stops the light, grain and fade. Without WebGL it is a responsive grid of the same covers. Works at 390px wide (the camera pulls back on tall screens).`,
  },
  {
    slug: "maison-noir-disintegrate",
    title: "Maison Noir Disintegrate",
    kind: "DISINTEGRATE LOOP",
    tagline: "A black metal members' card that crumbles into gold dust from its left edge to its right, then flies back together, on a loop",
    description:
      "A private-reserve card in brushed black metal (foil type, an EMV chip, a hologram, a gold seal, guilloché engraving, every detail drawn in Canvas 2D) sits under a soft light. Then it comes apart: the card is photographed once with html2canvas, its pixels are dealt across 75 transparent layers weighted from left to right, and each layer drifts, turns and fades on its own timeline. The left edge goes first and the dust sweeps across, holds, then every grain flies home, on a loop. The wheel or a drag takes the card by hand; let go and the loop picks up from there.",
    added: "Oct 21, 2026",
    theme: "dark",
    demo: "/motion-lab/maison-noir-disintegrate.html",
    poster: "/motion-lab/maison-noir-disintegrate.jpg",
    library: { name: "GSAP", version: "3.12.5", plugins: ["quickTo", "html2canvas 1.4.1"] },
    life: 1,
    lifeLabel: "ONE FRAGMENT'S FLIGHT (1s = ⅓ OF THE DISSOLVE)",
    drawSeconds: 5,
    stagger: 0.027,
    elements: 75,
    status: "INTACT · SCROLL OR DRAG TO DISSOLVE",
    stepLabels: ["Reassemble a stage", "Dissolve a stage"],
    reelAutoplay: 3400,
    tracks: [
      { prop: "x · y · fragment", change: "drifts 40px along its own random angle", start: 0, end: 1, ease: "power1.out" },
      { prop: "rotate · fragment", change: "turns up to ±15°", start: 0, end: 1, ease: "power1.out" },
      { prop: "opacity · fragment", change: "1 → 0, the grains fade as they leave", start: 0, end: 1, ease: "power1.out" },
      { prop: "opacity · scale · contact shadow", change: "fades and shrinks to 0.85 under the card", start: 0, end: 0.6, ease: "none" },
      { prop: "progress · eased follow", change: "chases the loop or your hand over 0.9s", start: 0, end: 1, ease: "power3.out" },
    ],
    inputs: [
      { keys: ["WHEEL", "DRAG"], does: "Scrub the card by hand, both ways (the page itself never scrolls); the loop resumes 3.5s after you let go" },
      { keys: ["◀", "▶", "←", "→"], does: "Glide to the previous or next stage: intact, crumbling, scattering, dust" },
      { keys: ["IDLE"], does: "Loops on its own: dissolve over 4s, hold as dust, reassemble, hold whole" },
    ],
    knobs: [
      {
        id: "drift",
        label: "DRIFT",
        min: 0,
        max: 200,
        step: 5,
        value: 40,
        unit: "px",
        note: "How far each fragment travels as it fades. Low reads as a dissolve in place, high as a blast of dust.",
      },
      {
        id: "spin",
        label: "SPIN",
        min: 0,
        max: 180,
        step: 5,
        value: 30,
        unit: "°",
        note: "The range each fragment turns through (± half of it). Turning the whole layer smears its grains into arcs.",
      },
    ],
    toggles: [{ id: "cue", label: "SCROLL CUE", value: true }],
    trick: {
      title: "One photograph, dealt across 75 layers",
      steps: [
        "The card is ordinary DOM: a 600 × 400 box of absolutely placed images. Every image is generated at load with Canvas 2D: foil and embossed text with manual letter-spacing, a chip with grooves, a conic-gradient hologram, a scalloped seal with circular microtext, and a background of guilloché rosettes, engraved bands, microprint and grain. Drawing them as images first is what lets html2canvas capture them faithfully.",
        "Once fonts and images are ready, html2canvas renders the card to one canvas (scale capped at 1.5 DPR) and the live card is hidden.",
        "Its pixels are dealt into 75 empty ImageData layers: every pixel is copied three times, each into the layer floor(75 × (random + 2x / width) / 3). The 2x / width term biases the left edge into early layers and the right edge into late ones, and the randomness keeps the boundary ragged.",
        "Each layer becomes its own canvas stacked over the card's position, so together they still show the whole card. Each gets a paused timeline: a 1-unit tween that drifts 40px along a random angle, turns up to ±15° and fades out, delayed by (i / 75) × 2. That delay is what sweeps the dust from left to right.",
        "Nothing scrolls. One number, the progress from 0 (whole) to 1 (dust), sets every timeline's progress at once. A loop tweens the goal (dissolve, hold, reassemble, hold), the wheel and a drag nudge it by hand, and gsap.quickTo eases the drawn progress after the goal over 0.9s, the same soft lag a scrubbed ScrollTrigger gives, without a scrollbar.",
      ],
    },
    tags: ["loop", "disintegration", "html2canvas", "particles", "luxury", "canvas"],
    bestFor: ["premium card and fintech launches", "luxury and membership brands", "dramatic hero exits and section transitions", "product reveals that leave the stage"],
    pairsWith: ["card-scanner-finance-page", "kestrel-ai-finance-landing-page", "facetry-security-landing-page", "holographic-ticket-landing-page", "stage-light-launch-page"],
    credits: [
      {
        label: "DevLoop01",
        href: "https://twitter.com/DevLoop01",
        note: "The Maison Noir card and its scroll disintegration this study is built on, credited in the original",
      },
      {
        label: "The disintegration technique (video)",
        href: "https://www.youtube.com/watch?v=5DGZhWDl6XM",
        note: "The pixel-dealing dust effect, credited in the original's source",
      },
    ],
    prompt: `Build a luxury members' card that disintegrates into dust and reassembles on a loop, as one HTML file, one screen with no scrollbar. GSAP 3.12.5 and html2canvas 1.4.1, from cdnjs. Google Fonts: Cormorant Garamond (500/600, italics), Inter (400-600), JetBrains Mono 500. No image files: every part of the card is drawn with Canvas 2D at load.

THE STAGE
- Page #07070a, exactly one screen (100vh, overflow hidden, touch-action none): nothing scrolls; ink #f3ece0, gold #d9b876. A fixed ambient layer: a faint gold radial glow in the middle and a warm brown glow rising from below. A fixed soft contact shadow under the card (not part of the capture) and a SCROLL OR DRAG cue at the bottom whose 1px gold bar drips (scaleY 0 → 1, then fades, 2s loop). A PREPARING veil covers everything until the card is ready, then fades over 900ms.

THE CARD (#capture: fixed, centred, 600 × 400, radius 26, #0e0e11, overflow hidden)
- Layers: a background image, a diagonal glare band (warm white at 0.13 peak), a gold hairline bevel with a dark inner bevel and a bright top edge highlight.
- Content, absolutely placed: top left a faceted gold diamond mark and MAISON NOIR in foil caps (Cormorant 600, 27px, 5.5px tracking) over "PRIVATE RESERVE · EST. MMXXVI"; top right EDITION / "Nº 0001 / 1000" in foil italics; an EMV chip and an embossed contactless symbol; a hologram top right; the number "4729 1180 5562 0918" in silver JetBrains Mono 25px with a tiny "4729" under it; MEMBER A. VALENTINE, SINCE 2026, VALID THRU 10/31 in silver Inter 12px; bottom right OBSIDIAN in foil caps and a gold seal.
- Draw each asset on a canvas at 3× and place it as an <img>:
  - foil text: per-character fillText with manual spacing; an emboss pass (a black shadow offset down, a faint light copy 0.55px up), a vertical gold or silver gradient fill (gold #fff4d1 → #ecc985 → #b88d47 → #86622a → #e4c283 → #9c773a), then, with source-atop, brushed lines (one random black or white row per pixel at up to 0.14 alpha) and a diagonal sheen.
  - background (2×): a dark diagonal gradient, a warm bloom top left, brushed rows, a huge faint italic N watermark, three guilloché rosettes on the right (polar curves r = R + a·sin(f·t + k·0.42) + 0.35a·cos(f/2·t), many copies), 26 wavy engraved bands along the bottom, three lines of 3px microprint, a vignette and per-pixel grain.
  - chip: a gold gradient rounded rect with brushed rows, grooved contact lines drawn twice (dark, then light offset 0.6px) and a sheen; hologram: a conic hue gradient under a grey wash, fine diagonal rainbow lines, concentric rings, a diamond emblem with MN and "A U T H E N T I C"; seal: a scalloped radial-gold disc with a drop shadow, rosette engraving, two rings, circular microtext and a debossed italic MN.
- Wait for every font (document.fonts.load for each face, then fonts.ready) before drawing, and decode every image before capturing.

THE DISINTEGRATION
- Move the card to the top-left corner for the capture (so nothing is clipped on small screens), render it with html2canvas (backgroundColor null, scale min(devicePixelRatio, 1.5)), then hide the live card.
- Create 75 empty ImageData layers of the same size. For every pixel, three times: pick layer floor(75 × (Math.random() + 2x / width) / 3) and copy the pixel's RGBA into it. The x term pushes the left side into early layers; the random term keeps the edge ragged.
- Put each layer on its own canvas (class capture-canvas: fixed, centred, width min(600px, 92vw)) stacked in a fixed stage. Together they still show the card.
- For layer i: a paused gsap timeline with one tween of duration 1, delay (i / 75) × 2: rotate 30 × (random − 0.5) deg, translate 40px along a random angle (x = 40·sin a, y = 40·cos a), opacity 0.
- One progress p (0 whole → 1 dust) drives everything: render() sets every layer timeline's progress to p, fades the cue over p 0 → 0.13 and the contact shadow (opacity 0, scale 0.85) over p 0 → 0.4.
- A goal and an eased view: gsap.quickTo(view, "p", { duration: 0.9, ease: "power3.out", onUpdate: render }) chases the goal, which gives the soft lag of a scrub.
- The loop tweens the goal: to 1 over 4s (power1.inOut), hold 1.1s, back to 0 over 3s, hold 1.4s, then again, always starting from the current value.
- Input: the wheel adds deltaY / 1800 and a pointer drag adds its movement / 700 to the goal (clamped 0-1); either pauses the loop, which resumes 3.5s after the last input. Arrow keys glide between four stops (0, 0.3, 0.6, 1).

THINGS THAT BREAK
- html2canvas cannot see canvas-drawn effects it does not support (filters, blend modes); draw every asset into an image first and keep the card to positioned images, gradients and borders.
- Capture only after fonts and image decodes resolve, or the dust is made of fallback type.
- 75 full-size canvases are heavy: cap the capture scale at 1.5 and never re-capture on resize.
- Never make the page scroll to drive this: a scrollbar appears in every frame and preview it is embedded in. Drive the timelines' progress yourself.

THE FLOOR
One visually hidden h1 describing the card; the stage of fragments has role="img" and an aria-label; ambient layers, the cue and the veil are aria-hidden. prefers-reduced-motion stops the dripping cue and the loop; the dust only moves when the reader scrubs it. Works at 390px wide (the fragments scale to 92vw).`,
  },
  {
    slug: "glow-boards",
    title: "Glow Boards",
    kind: "HOVER STACK",
    tagline: "A stack of neon boards in isometric depth: hover one and it lifts out of the line, leave and it settles back",
    description:
      "Sixteen thin boards stand in a diagonal line over a pink-to-cyan glow. Hover one and it rises out of the stack on a soft overshoot, its frosted face catching the light; move on and it eases back into place. Run the pointer along the line and the boards ripple up one after another. A Rive state machine, decoded and redrawn with plain Canvas 2D: no runtime, no images.",
    added: "Oct 19, 2026",
    theme: "dark",
    demo: "/motion-lab/glow-boards.html",
    poster: "/motion-lab/glow-boards.jpg",
    library: { name: "Canvas 2D", version: "decoded .riv", plugins: ["no runtime", "state machine"] },
    life: 1,
    lifeLabel: "ONE BOARD'S LIFT AND SETTLE",
    drawSeconds: 4,
    stagger: 0.14,
    elements: 16,
    status: "HOVER A BOARD",
    stepLabels: ["Lift the previous board", "Lift the next board"],
    reelAutoplay: 3800,
    tracks: [
      { prop: "hover input", change: "false → true as the pointer enters", start: 0, end: 0.02, ease: "none" },
      { prop: "y · lift", change: "rises 26–81 units out of the stack", start: 0, end: 0.53, ease: "power1.inOut" },
      { prop: "y · settle", change: "falls back on leave, slightly slower to start", start: 0.53, end: 1, ease: "power1.inOut" },
    ],
    inputs: [
      { keys: ["HOVER"], does: "Lifts the board under the pointer; leaving lets it settle" },
      { keys: ["SWEEP"], does: "Run the pointer along the stack and the boards ripple up in turn" },
      { keys: ["TAP"], does: "On touch, lifts the board you tap" },
    ],
    knobs: [
      {
        id: "gap",
        label: "WAVE GAP",
        min: 40,
        max: 400,
        step: 10,
        value: 140,
        unit: "ms",
        note: "Autoplay sends a wave through the stack: the time between one board lifting and the next.",
      },
    ],
    toggles: [{ id: "glow", label: "GRADIENT GLOW", value: true }],
    trick: {
      title: "A Rive file without the Rive runtime",
      steps: [
        "The .riv was decoded into plain data: the component tree (nodes, shapes, rectangles, fills, feathers), the 34 timeline animations and the state machine (17 layers, one per board, each switching between a hover and an unhover animation on a boolean input).",
        "Every frame, each layer advances its current animation and writes the keyed property (the board's y) back into the tree; world matrices are recomposed parent to child and the shapes are painted back to front.",
        "The glow is Rive's feather: a Gaussian-blurred rectangle. It is precomputed once per size as a sprite, a separable erf profile in x times one in y, and stretched into place, so a soft edge costs one drawImage.",
        "Hover is hit-testing through the inverse world matrix: the pointer is mapped into each board's local space and checked against its rectangle, and enter or leave fires the listener that flips that board's input.",
      ],
    },
    tags: ["hover", "isometric", "neon", "rive", "canvas", "state machine"],
    bestFor: ["AI and data product heroes", "layered-stack or pipeline metaphors", "dark launch pages", "interactive section dividers"],
    pairsWith: ["neon-glass-app-landing-page", "icon-cut-card-stack-page", "holographic-ticket-landing-page", "recessed-aperture-hero-page"],
    credits: [],
    prompt: `Build a stack of glowing boards that lift on hover, as one HTML file drawn with Canvas 2D: no libraries and no images. Black page, one full-viewport canvas.

THE SCENE (a 565 × 565 artboard, framed on the stack)
- Sixteen boards: 80 × 80 rectangles under a nested transform each (rotate -0.366 rad, scale 1.54-1.59 by 1.27; inside it rotate -0.12, scale 0.357 by 1.009; the shape itself rotate -1.018, scale 0.865 by 0.931), so each reads as a thin isometric plate standing at an angle. They sit in a diagonal line from about (152, 314) to (356, 181), stepping roughly 27 units right and 19 up, in pairs that share a position.
- Each board is layered fills: a #373737 base softened by a 30-unit feather, a #535252 face, a #cbc4c4 inner feather offset (-1, 1) for a lit edge, then two outer glows in rgba(235,235,235,0.4) and 0.25 with 20 and 40-unit feathers.
- Behind the stack, one large quadrilateral filled with two overlay-blended linear gradients: hot pink rgba(255,0,70,0.83) through electric blue rgba(8,0,255,0.82) to cyan #00f7ff. Overlay blending is what tints the grey boards pink at one end and cyan at the other.
- Paint back to front (the first in the tree is on top). Fit the stack box (x 100, y 108, w 372, h 336) to the viewport, contained and centred; cap DPR at 3.

THE FEATHER (soft glow)
A feathered rectangle is a Gaussian-blurred rectangle with sigma = strength / 2. Build it once per size and colour as a sprite: the alpha at each pixel is a separable product of two 1D profiles, 0.5 × (erf(u / (√2σ)) − erf((u − width) / (√2σ))), padded by 3σ, at 3 sprite pixels per unit. Draw it with the shape's transform. An inner feather is the shape clipped, minus a copy of itself offset by the feather offset (evenodd fill).

THE MOTION
- One boolean input and one state-machine layer per board. Hover true plays the hover animation: the board's y eases up over about 30 frames at 60fps on a cubic bezier around (0.42, 0, 0.35, 1.03) (a slight overshoot). Hover false plays the unhover back down over about 30 frames, slower to start (around 0.70, 0.02, 0.58, 1). Lifts range from 26 to 81 units depending on the board.
- Each frame: advance every layer's animation by dt (capped at 0.1s), write the sampled y back, recompose world matrices from parent to child, repaint.

HOVER
Map the pointer into artboard space, then into each board's local space through the inverse of its world matrix, and test it against the 80 × 80 rectangle. When a board's hit state changes, fire enter (hover true) or leave (hover false). pointerleave and pointercancel release everything.

THINGS THAT BREAK
- Composite in the order Rive does: each fill keeps its own blend mode, and the background gradient must be overlay, not normal, or the boards stay grey.
- Sample cubic eases by solving for t from x (bisection), not by treating the progress as t, or the overshoot vanishes.
- Precompute feather sprites; blurring every frame with a canvas filter costs far more and differs by browser.

THE FLOOR
The canvas has role="img" and an aria-label describing the stack; touch-action: none so a tap-drag hovers instead of scrolling. Works at 390px wide (the stack is contained and centred).`,
  },
  {
    slug: "hello-world-water",
    title: "Hello World Water",
    kind: "WEBGL SIMULATION",
    tagline: "A tiled pool seen from above where the water itself rises into HELLO, holds, and collapses into ripples before WORLD rises",
    description:
      "A real wave simulation on the GPU, seen from straight above a tiled pool. The water pulls itself up into the word HELLO, holds it while leaves are shouldered aside, then lets go: the letters fall back as travelling ripples and splashes before WORLD rises in their place. Caustics dance on the tiles, the sun drifts, leaves float and bob on the swell, and you can drag through the water, drop pebbles, double-click for a cannonball or bring on the rain.",
    added: "Oct 19, 2026",
    theme: "light",
    demo: "/motion-lab/hello-world-water.html",
    poster: "/motion-lab/hello-world-water.jpg",
    library: { name: "three.js", version: "0.180", plugins: ["GLSL shaders", "GPU wave sim"] },
    life: 9.2,
    lifeLabel: "ONE WORD'S LIFE",
    drawSeconds: 9.2,
    elements: 65536,
    status: "HELLO · HOLDING",
    stepLabels: ["Drop a pebble", "Next word"],
    reelAutoplay: 2600,
    tracks: [
      { prop: "form · spring", change: "0 → 1, the water pulls up into the word", start: 0, end: 0.3, ease: "power1.inOut" },
      { prop: "spray", change: "fine drops lift off the rising strokes", start: 0, end: 0.3, ease: "power1.inOut", yoyo: true },
      { prop: "calm", change: "ambient chop drops 72% around the word", start: 0, end: 0.3, ease: "power1.out" },
      { prop: "leaves", change: "shouldered downhill off the strokes", start: 0.1, end: 0.72, ease: "none" },
      { prop: "form · release", change: "1 → 0 fast: the letters collapse", start: 0.72, end: 0.78, ease: "power3.out" },
      { prop: "splashes", change: "11 crowns burst along the strokes", start: 0.72, end: 0.8, ease: "power2.in" },
      { prop: "ripples", change: "travel out and reflect off the walls", start: 0.72, end: 1, ease: "power1.out" },
    ],
    inputs: [
      { keys: ["DRAG"], does: "Wakes through the water; drag fast and it throws spray" },
      { keys: ["CLICK"], does: "Drops a pebble: a ring, a crown of droplets, leaves pushed away" },
      { keys: ["DOUBLE-CLICK"], does: "A cannonball: a deep cavity, then a central jet a moment later" },
      { keys: ["W"], does: "Rain on and off (N: next word · R: reset · SPACE: a pebble)" },
    ],
    knobs: [
      {
        id: "rain",
        label: "RAIN",
        min: 0,
        max: 1,
        step: 0.05,
        value: 0,
        note: "Rain roughens the surface with a fast chop, greys the sky and dims the sun as it eases in.",
      },
    ],
    toggles: [
      { id: "hold", label: "HOLD THE WORD", value: false },
      { id: "leaves", label: "LEAVES", value: true },
    ],
    trick: {
      title: "Typography made of water",
      steps: [
        "The surface is a 256×256 height field on the GPU: a fixed 120Hz step of the 2D wave equation, ping-ponged between two half-float render targets, with impulses (pebbles, wakes, raindrops, jets) added as gaussian bumps.",
        "Each word is drawn to a canvas, stretched to the pool's 8×5.2 aspect, and blurred twice: a sharp mask for the letter height and a wide one for how strongly to pull. The simulation adds a spring toward mask × height × form.",
        "form eases up over 2.8s, holds for 3.8s, then drops fast. With the spring gone the raised letters are just water, so they collapse on their own into ripples that travel and reflect: nothing is faked.",
        "Rendering is a refraction ray-trace: refract the view through the surface normal into a tiled basin, light it with caustics (a second pass that compares each triangle's area before and after refraction), mix in a sky reflection by Fresnel, and brighten the raised letters so the word reads from above.",
      ],
    },
    tags: ["webgl", "simulation", "typography", "caustics", "interactive", "three.js"],
    bestFor: ["launch and announcement moments", "hero headlines that need a wow", "wellness, travel and summer brands", "developer and creative tools"],
    pairsWith: ["tide-reveal-agent-page", "wind-field-routing-page", "grain-motion-system-page", "monax-analytics-landing-page"],
    credits: [],
    prompt: `Build an interactive pool seen from straight above, where the water rises into the word HELLO, holds, collapses into ripples, and then rises into WORLD, in a loop. One HTML file, three.js 0.180 as an ES module from jsdelivr, no images.

THE STAGE
- Page #eef0ec, a canvas centred at min(900px, 90vw, 123vh) wide with a 20:13 aspect and a soft teal shadow. A perspective camera (42°) looking straight down, fitted so the 8 × 5.2 pool fills it. ACES tone mapping, sRGB output.
- If WebGL 2 or float render targets are missing, show a plain error message instead.

THE SIMULATION (GPU)
- A 256×256 half-float height field ping-ponged between two render targets at a fixed 1/120s step (accumulate dt, cap 1/20). Red is height, green is velocity.
- Each step: velocity += laplacian (weighted for the non-square cells) × 1.21 × dt, damped by exp(−0.64 dt); then a spring toward the word: velocity += (mask.r × letterHeight × form − height) × 95 × pull × dt with pull = form × (0.18 + 0.82 × mask.g), extra damping exp(−4 pull dt); height += velocity × dt. Up to 16 queued impulses per step add (1 − q) e^−q bumps.
- Word masks: draw the word in 900-weight Arial Black on a 256 canvas, scaled vertically by 8/5.2 so letters stay square on the water; a light blur for the letter (r) and a wide normalised blur for the pull (g).

THE TIMELINE
- form eases up over 2.8s (smootherstep), holds 3.8s, then lets go fast (9× the rise rate) for 1.6s, rests 1s, and the next word takes over. While rising, fine spray lifts off the strokes; on release, 11 splashes burst at random points of the word and push the leaves away.
- An ambient sum of ten directional sine waves (domain-warped, sheltered, and calmed 72% while the word stands) rides on top, in the shader and in a matching CPU function so floating things bob in sync.

RENDERING
- The water mesh (256×256 plane) displaces by the height map plus ambient waves; normals by central differences.
- Fragment: refract the view ray (1/1.333) into a box basin (floor at −1.35, walls at ±4 / ±2.6) with procedural tiles (two teals, darker grout), wall caustics, ambient occlusion near edges, absorption exp(−(0.34, 0.075, 0.032) t), and soft shadows from leaves and splashes projected along the sun. Reflect into a generated sky with Fresnel (0.02037 + 0.97963 (1 − cos)^5), a sharp sun highlight, and lift raised water brighter and greener with a pale rim on steep flanks so the word reads.
- Caustics: a second pass renders the same grid refracted to the floor into a 1024 target, intensity = area before refraction ÷ area after (dFdx/dFdy cross products), additive.
- The sun drifts slowly round; a hemisphere light and a sun light for the leaves and droplets.

THE LIFE IN IT
- Splashes: instanced glassy droplets with gravity that make a small impulse where they land, plus a crown mesh (a ring of 64 quads with lobed height) that grows and fades in 0.4–0.6s.
- Ten leaves (six afloat, the rest falling in every 7–13s): drift on a current with two pool-return jets, bob and tilt on the ambient swell, collide softly, spin down, ride up over raised letters and are shouldered downhill off them.
- Rain (W or a control): eases in, adds a fine chop to the shader, greys the sky, dims the sun, and drops streaks that make tiny impulses and occasional droplets.

INPUTS
- Drag: segmented impulses along the path and leaf stirring; fast drags throw splashes. Click: a pebble (deep impulse, crown, leaves pushed). Double-click: a cannonball (bigger cavity, a central jet 210ms later). Keys: R reset, W rain, N next word, Space a random pebble.

THE FLOOR
- The canvas is focusable with a visible focus ring and an aria-label describing the loop. Handle context loss with a message and reload on restore. Cap the pixel ratio at 1.7 and pause while the tab is hidden.`,
  },
  {
    slug: "only-the-wind",
    title: "Only the Wind",
    kind: "AMBIENT SCENE",
    tagline: "A backlit evening by a lake where cherry petals ride the wind in three depths, and a click sends a gust through everything",
    description:
      "Two travellers watch the sun set over a lake while cherry petals blow past in three layers of depth: hazy specks far off, crisp petals that catch the light as they tumble, and huge out-of-focus ones sweeping past the lens. Grass sways, a lantern and a wind chime swing under the eaves, dust glitters in the sun and a haiku inks itself in. Click and a gust tears through the whole scene, then dies away. Everything is drawn in code: canvas, SVG and CSS, no images.",
    added: "Oct 19, 2026",
    theme: "light",
    demo: "/motion-lab/only-the-wind.html",
    poster: "/motion-lab/only-the-wind.jpg",
    library: { name: "Canvas 2D", version: "+ SVG", plugins: ["no libraries", "SMIL", "CSS keyframes"] },
    life: 10,
    lifeLabel: "ONE PETAL'S CROSSING",
    drawSeconds: 10,
    elements: 185,
    status: "BREEZE · CLICK FOR A GUST",
    stepLabels: ["A sudden calm", "Send a gust"],
    reelAutoplay: 4200,
    tracks: [
      { prop: "x · petal", change: "drifts right to left, eases to its wind speed", start: 0, end: 1, ease: "power1.out" },
      { prop: "y · petal", change: "gravity plus a sine wave of turbulence", start: 0, end: 1, ease: "power1.inOut", yoyo: true },
      { prop: "rotateX · Y · Z", change: "tumbles in 3D, lit when it faces the sun", start: 0, end: 1, ease: "none" },
      { prop: "gust", change: "+2.2 on a click, then ×0.972 a frame", start: 0.3, end: 0.62, ease: "power3.out" },
      { prop: "sway · grass", change: "two sines per blade, bent by the gust", start: 0, end: 1, ease: "power1.inOut", yoyo: true },
      { prop: "rotate · lantern · chime", change: "−3° to 3.6°, 5s and 3.1s", start: 0, end: 0.5, ease: "power1.inOut", yoyo: true },
      { prop: "scale · camera", change: "breathes 1.035 → 1.042 over 16s", start: 0, end: 1, ease: "power1.inOut", yoyo: true },
      { prop: "opacity · blur · haiku", change: "inks in one character at a time", start: 0.15, end: 0.45, ease: "power1.out" },
    ],
    inputs: [
      { keys: ["CLICK"], does: "Summons a gust: petals race, grass bends flat, dust streams, then it all settles" },
      { keys: ["SPACE"], does: "The same gust from the keyboard" },
      { keys: ["MOVE"], does: "The pointer parallaxes the sky, the figures and the grass at different depths" },
    ],
    knobs: [
      {
        id: "gust",
        label: "GUST STRENGTH",
        min: 0.6,
        max: 4,
        step: 0.1,
        value: 2.2,
        note: "Added to the wind on each click (capped at 1.6× this), then it decays by 2.8% a frame.",
      },
    ],
    toggles: [
      { id: "flare", label: "LENS FLARE", value: true },
      { id: "haiku", label: "HAIKU", value: true },
    ],
    trick: {
      title: "Depth from three fields and a fake lens",
      steps: [
        "One petal model, three fields: far (130 small petals with a haze tint and one blur pass), mid (46 crisp ones) and near (9 huge ones drawn from a 4-pass blurred sprite with motion trails). Size, wind and blur together read as depth of field.",
        "Each petal is a sprite drawn once, then projected with an affine setTransform from two rotated axis vectors: a full 3D tumble for the price of one drawImage. The face angle sets how much light comes through, and so does the distance to the sun.",
        "Every petal eases toward its own wind speed (smaller ones catch more wind) and falls under gravity plus a sine of its x position. A gust adds to every field at once and decays by ×0.972 a frame, so one click is a whole weather event.",
        "The photograph is procedural: ridgelines from midpoint displacement with aerial perspective, a sun path on the lake, fBm clouds, rays, mist and grain. Over the top, a lens flare (bloom, core, streak, spikes, ghosts mirrored through the centre) follows the sun as the scene parallaxes.",
      ],
    },
    tags: ["particles", "canvas", "depth of field", "click to gust", "lens flare", "procedural"],
    bestFor: ["storytelling and brand moments", "travel, hospitality and tea brands", "poetry, books and editorial", "calm hero sections and 404 pages"],
    pairsWith: ["sunset-scroll-story-page", "paper-sun-agent-page", "craft-studio-webgl-landing-page", "generative-editorial-product-page"],
    credits: [],
    prompt: `Build an ambient, backlit evening scene as one HTML file: two travellers by a lake at sunset while cherry petals blow past in three depths, with a click that sends a gust through everything. No libraries and no image files: canvas 2D, inline SVG and CSS only. Google Fonts Shippori Mincho B1 (500/700) and Cormorant Garamond (italic 300/400).

THE PHOTOGRAPH (procedural, drawn once to a canvas)
- A seeded PRNG (mulberry32) and a tiling value-noise fBm.
- Sky gradient #a2979f → #c6b0a4 → #e7c69e → #f8dfb2 to the horizon at 66.5%; the sun at (38%, 54%) as a large radial scatter and a white core.
- Four mountain ridges from midpoint displacement, coloured by aerial perspective (mix #efd2ab haze toward #2c2027 ink by depth), the nearer two topped with tree bumps and one with a small five-tier pagoda; each ridge edge rim-lit where it crosses the sun. Haze pools in the valleys.
- A lake below the horizon: mirrored ridges at low alpha, thin ripple strokes, and a glittering sun path that widens toward the viewer. A near hill (dark #2c2023 → #0b0708) rim-lit along its top.
- Separate canvases: tileable fBm clouds lit from below that drift over 380s; crepuscular rays as thin wedges from the sun (screen blend, slow rotate); two bands of drifting mist; diffraction spikes.

THE FIGURES (inline SVG, backlit)
- A traveller in a straw hat, haori and hakama, a sword at the hip; a girl in a furisode with an obi, a hair ornament with dangles, holding a glowing oiled-paper parasol. A temple eave top-right with tile ends and rafters, a paper lantern with the character 風 and a glass wind chime with a paper strip.
- Each silhouette gets a rim-light filter: offset the alpha, subtract it, blur, flood with #ffdcaa and merge twice, so the sun wraps around the edges.
- Robes and hair strands breathe with SMIL path morphs (3–4s, spline eased); the lantern and chime swing (rotate −3° to 3.6°, 5s and 3.1s, alternate) and the strip flutters faster.

THE PETALS
- Three notched petal shapes drawn once to 160px sprites in two palettes (lit: #f29a83 → #ffd4c0 → #fff6e8; shade: #c66d8a → #e6a9bc → #f6dbe3) with veins, a deep base and a light edge; blurred copies (4 halvings) for the near field and a haze-tinted copy for the far one.
- Fields: far (130, 5–14px, hazed), mid (46, 15–32px) and near (9, 60–115px, blurred, three trailing ghosts). Scale counts by viewport area.
- Each petal: eases its vx toward a wind speed between min and max (smaller petals catch more wind), adds gravity × (1.5 − windFactor), adds sin(x × 0.01 + phase) × turbulence, damps vy by 0.98, tumbles on three axes, and respawns off the right edge when it leaves.
- Draw with setTransform from two axis vectors rotated by (angleX, angleY, angleZ): the shade sprite first, then the lit sprite at an alpha from how face-on it is plus a gaussian of its distance to the sun.

THE AIR AND THE LENS
- Grass: about one blade per 2.4px, each a quadratic curve swaying on two sines and bent by the gust, batched into six tone buckets (one fill each) with a rim stroke near the sun, batched by brightness.
- Dust motes that glow near the sun, soft bokeh rings drifting left, and lake glitter that twinkles (pow(sin, 8)).
- A lens flare that follows the sun on screen: bloom, a white core, a horizontal streak, the spikes, and six ghosts (dot, hexagon, ring, warm) placed along the line from the sun through the centre at k = 0.42 … 2.2.
- The camera breathes (scale 1.035 → 1.042, 16s alternate); the pointer parallaxes sky (8px), figures (12px) and grass (16px). Film finish: a soft-light grade, a vignette, animated grain, and a white flash that fades out on load.

THE WIND
- gust starts at 0; a click or Space adds 2.2 (capped at 3.5) and each frame multiplies it by 0.972. Petal speed × (1 + gust), turbulence × (1 + gust × 0.6), grass leans by gust × 0.28, dust and bokeh speed up.

THE HAIKU
- 花は散り / 名を覚えている / 風ばかり, set vertical (writing-mode vertical-rl) top-left in Shippori Mincho with a rough ink displacement filter; each character fades in from blur(8px), 0.13s apart. A thin rule grows under it and a red hanko seal (風) stamps in with an overshoot. An italic English caption bottom-left; a "Click to summon the wind" hint after 7s.

THE FLOOR
- prefers-reduced-motion stops every loop and the gust and cuts the petal count to 40%. Rebuild the canvases on resize (debounced). Cap the device pixel ratio at 1.5–2. The haiku moves in and the caption hides below 760px.`,
  },
  {
    slug: "dusk-valley-parallax",
    title: "Dusk Valley Parallax",
    kind: "SCROLL PARALLAX",
    tagline: "One long scroll from sunset to starlight: hills peel apart in depth, the sun sinks and swells, bats scatter and a star falls",
    description:
      "A single SVG landscape, thirty-odd layers deep, scrubbed by the page's scroll. Scroll down and the valley's ridges slide apart at their own depths while the sun sinks behind a dusk range rising from below. The sun swells until it fills the sky, a flock of bats bursts out of it, and then the whole dusk lifts away to reveal a night valley under twinkling stars, with a shooting star crossing it. Scroll back up and every frame plays in reverse.",
    added: "Oct 19, 2026",
    theme: "dark",
    demo: "/motion-lab/dusk-valley-parallax.html",
    poster: "/motion-lab/dusk-valley-parallax.jpg",
    library: { name: "GSAP", version: "3.12.5", plugins: ["ScrollTrigger"] },
    life: 6,
    lifeLabel: "ONE SCROLL, 6000PX (1s = 1000PX)",
    drawSeconds: 12,
    elements: 36,
    status: "SUNSET · SCROLL TO DESCEND",
    stepLabels: ["Glide up a scene", "Glide down a scene"],
    reelAutoplay: 3600,
    tracks: [
      { prop: "x · clouds", change: "four clouds drift apart, ±500–1000", start: 0, end: 0.7, ease: "none" },
      { prop: "y · x · ridges, scene 1", change: "nine ridges fall away, nearest fastest", start: 0, end: 0.4, ease: "power2.in" },
      { prop: "cy · sun gradient", change: "−50 → 330, the sun sinks", start: 0.01, end: 0.36, ease: "none" },
      { prop: "y · ridges, scene 2", change: "dusk range rises 500–900 → 0", start: 0.15, end: 0.4, ease: "power1.inOut" },
      { prop: "offset · sun stops", change: "the sun swells to fill the sky", start: 0.33, end: 0.83, ease: "none" },
      { prop: "y · scale · bats", change: "burst out of the sun, 0 → 0.8", start: 0.4, end: 0.7, ease: "power3.out" },
      { prop: "y · scale · dusk", change: "lifts up and away, 1.5×", start: 0.6, end: 1, ease: "power1.inOut" },
      { prop: "y · ridges, scene 3", change: "night valley climbs in, stars appear", start: 0.7, end: 1, ease: "power1.inOut" },
      { prop: "x · y · falling star", change: "crosses the night sky", start: 0.7, end: 1, ease: "power1.out" },
    ],
    inputs: [
      { keys: ["SCROLL"], does: "The only clock: every layer is scrubbed by the page's scroll, both ways" },
      { keys: ["◀", "▶"], does: "Glide to the previous or next scene: sunset, dusk, nightfall, starlight" },
      { keys: ["IDLE"], does: "The scroll arrows bob and the stars twinkle on their own" },
    ],
    knobs: [
      {
        id: "depth",
        label: "PARALLAX DEPTH",
        min: 30,
        max: 220,
        step: 5,
        value: 100,
        unit: "px",
        note: "Scene 1's spread: each ridge moves a multiple of this. Low is a gentle drift, high tears the valley apart.",
      },
    ],
    toggles: [{ id: "cues", label: "SCROLL ARROWS", value: true }],
    trick: {
      title: "A film strip on a scroll bar",
      steps: [
        "Everything is one fixed, full-viewport SVG (viewBox 750×500, preserveAspectRatio xMidYMax slice), and a 6000px empty div behind it gives the page its length. The SVG never scrolls; the scroll only feeds the timelines.",
        "Each scene is its own timeline bound to a slice of that length with ScrollTrigger and scrub 2–3, so layers ease toward the scroll position instead of snapping to it. That lag is what reads as depth.",
        "Depth is a different multiple per layer: one speed unit, and the nearest ridge moves 3–5× while the far ones move 1–2×, some sideways in opposite directions, so the valley opens up rather than sliding.",
        "The sun is not a shape: it is the first stops of the sky's radial gradient. Tweening the gradient's cy sinks it, and tweening the stop offsets and colours swells it, all as attr tweens on the SVG.",
        "Scene 3 waits below the frame (y = SVG height − 40) and the dusk lifts out of view as it arrives, so the cut between scenes is a camera move, not a fade.",
      ],
    },
    tags: ["scroll-driven", "parallax", "SVG", "scene transitions", "scrub"],
    bestFor: ["storytelling and launch pages", "outdoor, travel and festival brands", "portfolio intros", "games and story worlds"],
    pairsWith: ["sunset-scroll-story-page", "paper-sun-agent-page", "maasai-inspired-event-landing-page", "event-horizon-orbital-page"],
    credits: [
      {
        label: "isladjan on CodePen",
        href: "https://codepen.io/isladjan",
        note: "The scroll-driven SVG parallax this study is built on; the shooting star is redrawn inline here",
      },
    ],
    prompt: `Build a scroll-driven SVG parallax landscape as one HTML file: a valley at sunset that, over one long scroll, sinks into dusk and lifts away into a starry night. GSAP 3.12 and ScrollTrigger from cdnjs; no other libraries and no image files.

THE STAGE
- body background #1d1d3a, scrollbar hidden but the page really scrolls. One svg.parallax, position fixed, 100% × 100vh, viewBox 0 0 750 500, preserveAspectRatio "xMidYMax slice", z-index 3. Behind it an empty .scrollElement, position absolute, 6000px tall: it is the timeline's length.
- The sky is a rect filled with a radial gradient centred at (375, −30), r ≈ 319: the first stop (#F5C54E, id sun) is the sun's disc, then #FFDBA6, #F7BB93, #F2995E, #f07560 and #FFAB93 out to the edge.
- Flat-shaded layers drawn as paths, each with its own linear gradient. Scene 1: nine pine ridges from pink-mauve (#d98981) in the distance to near-black navy (#120e22) in front, two big soft white cloud banks at 0.5 opacity and four thin white clouds. Scene 2: six rolling dusk ridges and a flock of five bats (hidden). Scene 3: a purple night sky (radial, pink at the horizon to navy), seventy small stars, a shooting star (a tapered white gradient tail with a bright head), four jagged night ridges with mix-blend multiply and two faint dinosaur skeletons in the foreground. Plus a bird silhouette and two chevron scroll arrows.

THE CHOREOGRAPHY (all scrubbed by scroll)
- Scene 1, top to 45% of the length, scrub 3: with speed = 100, ridges move y 1.7–5 × speed and x −2.5 to +1.6 × speed (the nearest most), the big cloud banks y 4.5 × speed, the opening clouds part ±300, the arrow drops away.
- Clouds, to 70%, scrub 1: cloud1 x +500, cloud2 +1000, cloud3 −1000, cloud4 −700.
- Sun, to 2150px, scrub 2: the gradient's cy −50 → 330 and the stops spread (0.15, 0.18, 0.25, 0.46): it sinks and softens.
- Scene 2, 15% → 40%, scrub 3: its ridges rise from y 500–900 to 0, a little staggered. The bird crosses the sky (x +800, y −250) and flips round when its trigger ends.
- Sun swells, 2000px → 5000px: the sun stop's offset → 1.4 and it turns #ffff00, so the disc fills the sky; the dusk ridges darken (#623951 → #261F36).
- Bats, 40% → 70%: from y 400, scale 0 to y 20, scale 0.8, power3.out; on enter each bat flaps (scaleX 0.5 yoyo, 9 repeats, staggered 0.1s).
- Transition, 60% → bottom: scene 3 starts at y = the SVG's height − 40; the dusk ridge lifts to y −(height + 100) at scale 1.5 and the night sky rises to 0.
- Scene 3, 70% → bottom: the night ridges climb from y 300–1000 to −550, staggered 0.03; stars fade to 0.5 and rise; the sky gradient's cy → 600 and r → 500; the up arrow fades in. The shooting star crosses from 4200px (x −700, y −250).

THINGS THAT BREAK
- Animate SVG gradients with attr tweens (cy, r, offset, stop-color): CSS transforms can't reach them.
- Give every scene its own ScrollTrigger range and keep scrub at 2–3; scrub true (no lag) flattens the depth.
- Set transformOrigin before scaling the bats, or they scale from the SVG's corner.
- Start from the top on reload (history.scrollRestoration = "manual"), or a mid-scroll restore lands between scenes with tweens half-set.

THE FLOOR
- prefers-reduced-motion stops the bobbing arrows and the twinkle; the scroll still drives the scenes, so nothing moves unless the reader moves it. The SVG slices to cover any aspect ratio; at 490px and below the arrows scale to 0.8 and lift. No horizontal scroll at 390px.`,
  },
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
