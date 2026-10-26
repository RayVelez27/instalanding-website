export type PromptCategory = "web" | "motion" | "product" | "navigation" | "forms" | "gospel";

export interface PromptEntry {
  /** URL-safe id derived from the title — used by /prompt/:slug */
  slug: string;
  title: string;
  category: PromptCategory;
  categoryLabel: string;
  description: string;
  prompt: string;
  preview: PreviewKind;
  variant: "square" | "wide" | "tall" | "large";
  added: string;
  /** Path to a runnable single-file demo in /public, if one ships with the prompt. */
  demo?: string;
  /** Screenshot of the real component; replaces the CSS wireframe mock when present. */
  thumbnail?: string;
  /**
   * Whether the component itself is dark-ground or light-ground. Read off the
   * screenshot's mean Rec.709 luminance rather than by eye, so the call is the
   * same every time: the two populations here sit at 13-97 and 141-243, a gap
   * wide enough that nothing is a judgement call. Drives the badge on the
   * detail page and the alternation in the feed.
   */
  theme?: "dark" | "light";
  /** Third-party work the component is built on, credited on the detail page. */
  credits?: PromptCredit[];
  /**
   * Bred from two library pages: each parent's slug and what it gave (structure,
   * surface, a component). Shown as BRED FROM on the template page.
   */
  parents?: { slug: string; gave: string }[];
  /**
   * Looping preview clip shown instead of the still thumbnail. Pair it with
   * `thumbnail`, which becomes the poster frame and the reduced-motion fallback.
   */
  video?: string;
  /** Aspect of `video`, so the tile reserves the right box before it loads. */
  videoAspect?: "portrait" | "landscape" | "square";
  /** True when the clip is cut to loop seamlessly; otherwise it plays once. */
  videoLoop?: boolean;
  /** Where the code lives when it is not a single file in this repo. */
  repoUrl?: string;
  /**
   * A YouTube video id. The entry is a video, not a template: the tile opens a
   * player instead of a preview, there is no prompt to copy, it closes the feed
   * rather than being shuffled into it, and the agent endpoints leave it out.
   */
  youtube?: string;
  /**
   * False when the rights holder blocks the video from playing outside YouTube
   * (YouTube then shows "Video unavailable" in any embed). The window shows the
   * still with a play button that opens YouTube instead of a dead player.
   */
  youtubeEmbed?: boolean;
  /**
   * Keeps the entry out of the feed and the related rail. /prompt/:slug still
   * resolves and the endpoints still serve it, so shared links keep working.
   */
  hidden?: boolean;
  /**
   * Lives under its section page rather than in the main feed at /. Unlike
   * `hidden` the entry is still listed, browsable, related and served — it
   * just has one way in rather than two.
   */
  sectionOnly?: boolean;
  /**
   * What the page suits, in the words an agent searches with ("AI
   * infrastructure", "developer tools"). Published in the manifest and
   * ranked by `instalanding search`; the stack and sections are read off the
   * demo file itself, so they are not repeated here.
   */
  bestFor?: string[];
  /** How it looks: "dark", "editorial", "webgl", "glassmorphism". Also searched. */
  style?: string[];
}

export interface PromptCredit {
  label: string;
  href: string;
  /** What the source contributed, shown under the link. */
  note?: string;
}

export type PreviewKind =
  | "clay-hero"
  | "hero"
  | "navbar"
  | "pricing"
  | "buttons"
  | "footer"
  | "cards"
  | "form"
  | "gallery"
  | "testimonial"
  | "dashboard"
  | "marquee"
  | "parallax"
  | "sidebar-nav"
  | "modal";

export const categories: { slug: PromptCategory; label: string }[] = [
  { slug: "web", label: "WEB" },
  { slug: "motion", label: "MOTION" },
  { slug: "product", label: "PRODUCT" },
  { slug: "navigation", label: "NAVIGATION" },
  { slug: "forms", label: "FORMS" },
  { slug: "gospel", label: "GOSPEL" },
];

const entries: Omit<PromptEntry, "slug">[] = [
  {
    title: "Plinth AI Merchant Agents Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A gallery-quiet page for AI agents that run online stores: the store console stands on a marble and brass plinth in 3D, a pinned stack separates into the three layers every agent stands on, blueprint frames draw round each agent at work, and onboarding runs sideways along a lit wire",
    prompt: `Build a landing page for Plinth, a fictional company that deploys AI agents for independent online stores (support, catalog, inventory, pricing and retention agents, trained on the store's own policies, working inside its existing tools, with spend limits, approval rules and a signed receipt for every action), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, from jsdelivr. Google Fonts: Source Serif 4 (light, with italics) for display and Hubot Sans with its width axis for text and wide caps.

DESIGN SYSTEM
A quiet gallery in warm off-white: bg #F4F4F1, ink #22252E, brass accent #7F5F27, plus cool, paper and field tints and mixed muted, soft and line colours. Display headings Source Serif 4 at weight 300 with an italic brass word; small labels in Hubot Sans 112% wide, uppercase, tracked. Square corners; a 3.5% noise over everything. Buttons fill ink from the bottom with a corner mark that grows; links redraw their underline; round-free icon buttons with a plus that turns. A team section switches the whole page tone to a cool stone.

PICTURES IN CODE (no image files)
One shared SVG library: soft wall light with window gobos, gold and brass gradients, a matte black coffee bag with a foil label, a cognac leather tote with brass rings, coffee beans, and a portrait bust that takes --top, --skin and --hair so four team portraits share one drawing. Product scenes under studio light (coffee bag and steaming cup, tote on a marble plinth, amber serum bottle, a kraft shipping box with a label, a phone storefront, a brass watch listing, a night globe with order routes), and app scenes (support inbox with the agent's logged reasoning, pricing chart holding above a margin floor, forecast with a drafted purchase order, knowledge sources and brand-voice sliders, agent switches with guardrails, a Black Friday spike).

STRUCTURE
1. A fixed left rail on desktop (30vw): the wordmark with a stepped brass mark, an isometric line drawing of a plinth whose plates rise as the page scrolls, and section links that light as you pass. On phones a top bar with a menu button. A floating brass "Book a demo" button appears except over the hero, contact and footer.
2. Hero: two pills joined by a wire with a travelling brass signal, "Your store never sleeps." huge and light, the lead and buttons. Beside it a 3D scene in CSS perspective: the Plinth console (sidebar, greeting "Good night, Irene. Your agents have it.", three KPI cards with sparklines, a revenue chart, a live activity feed) standing on a marble and brass plinth with crystal shards and a brass column, plus an autonomy donut (92%) and a dark restock-approval card floating at different depths. Layers rise in on load, float gently and tilt toward the pointer.
3. Platform (pinned on desktop): "Every agent stands on three layers you control" with Context, Agents and Guardrails beside a framed diagram of the Plinth core wired to six store systems; on scroll the frame tilts back and separates into coloured plates with dashed guides, each plate sliding out as its note lights.
4. Merchants: three stacked case cards (a coffee roaster, a leather-goods maker, a skincare brand) with tags, a spec list of results, a product scene with parallax and a small inset app scene; each card scales back and dims as the next covers it.
5. Agents: a 12-column contact sheet of six frames whose blueprint borders, crosses and captions draw in before the picture wipes up. Pricing: Starter $490, Growth $1,900 (featured, fills brass after it rises), Enterprise Custom.
6. Onboarding (pinned): four steps (Connect, Train, Launch, Scale) scroll sideways while a brass wire grows along their pills, lighting each one. Team (cool tone): four people with portrait, role, bio and a short CV, as an accordion on phones.
7. Voices: a large quote whose words brighten as you scroll, and two smaller quotes. Results: a line chart drawn from the axis numbers (18k to 81k orders a month) that reveals left to right, and three big figures. FAQ: sticky intro and five accordion questions with brass rules that draw in. Journal: three entries with app or still-life thumbnails. Contact: details and a form whose underlines draw in. Footer in brass with a giant wordmark whose letters rise.

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s.
- Size the 3D hero in em units from a container query so the whole scene scales as one; keep it inside an overflow-hidden, masked box.
- Measure the onboarding wire and pill positions on refreshInit, and refresh ScrollTrigger when an accordion opens.
- Queue the scroll scenes and build them in small time slices so the page stays responsive, then split headings only as they come near.

THE FLOOR
One h1, a main, every section with an id. Scenes have role="img" and a label; decorative layers are aria-hidden. The menu button uses aria-expanded and swaps its label; Escape closes it. Accordions are buttons with aria-expanded. The form has labels and a polite status and sends nothing. Focus rings on everything. prefers-reduced-motion: no pinning, scrubbing, 3D float or Lenis. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 25, 2026",
    demo: "/demos/plinth-merchant-agents.html",
    bestFor: ["e-commerce and retail AI", "B2B SaaS for merchants", "AI agent platforms", "premium product launches"],
    style: ["editorial", "luxury", "3d-css", "svg-illustration", "scroll-driven"],
    thumbnail: "/thumbs/plinth-merchant-agents.jpg",
    theme: "light",
  },
  {
    title: "Sumwise AI Accounting Firm Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A print-shop page for an AI accounting firm: an ink cover opens to full screen as eight duotone illustration tiles fly out and back, a sample monthly close walks itself through, halftone dots resolve into each service, a chat replays an AI answering from the books, and the tax year scrolls past on a pinned track",
    prompt: `Build a landing page for Sumwise, a fictional AI accounting firm for small business (bookkeeping, taxes, payroll, invoicing, bill pay and cash forecasts, done around the clock by an AI and checked by a licensed CPA), as one HTML file. GSAP 3.13 with ScrollTrigger, and Lenis 1.3, from jsdelivr. Google Sans 400-700 with a metric-matched Arial fallback.

DESIGN SYSTEM
White paper, ink #0b0b0b, orange #fe7141, lilac #cdabfe and sage #d1ddd3, with two greys. Square corners everywhere and hairline rules that draw in from the left. Headings Google Sans 500, very tight (-0.055em). Buttons are ink or orange blocks whose opposite colour opens from the centre on hover, with an arrow that slides or a plus that turns; links fill lilac from the bottom; highlighted words get a coloured marker that wipes in. Small uppercase badges in white.

PICTURES IN CODE (no image files)
One hidden SVG sprite holds every illustration, drawn in greys at 400 x 500 and multiplied over each frame's flat tint (orange, lilac or sage) with a grain overlay, so they print as duotone: receipts under a scanning beam, an invoice that gets a PAID stamp and flies off as a paper plane, a cash forecast with a pulsing dot, a tax return stamped FILED, an AI chip with dots running along its traces, a cheque and a calendar ticked off, a CPA shield with a check that draws in, a calculator on a ledger, a bank wired to cards and phones, a kitchen team marked PAID, a shoebox of receipts being scanned, and seven portraits built from one shared face with different hair, glasses, clothes and props. All animation is SMIL inside the sprite.

STRUCTURE
1. A white top bar with an ink wordmark and orange "AI" tag, an orange "Start free for 30 days" button, four bordered links and an orange scroll progress line; it hides on scroll down. Under 900px a "Menu +" button opens a full ink menu.
2. Hero (sticky stage): an ink cover card in the middle with "Accounting that does it all.", the lead, a live counter of transactions categorized today with a pinging dot, buttons and a big "24/7"; eight tinted illustration tiles with badges scattered around it. On scroll the ink spreads from the card to fill the screen, the tiles fly outward and back, and a statement appears with three highlighted trades (cut hair, bake bread, wire houses) above three principles.
3. Monthly close (lilac): four numbered notes beside a sticky one-page sample report for a bakery (profit, twelve cash bars, tax set aside, a "done for you" tally); as each note passes, its number fills and a sage band slides to the matching part of the report.
4. Services: three full-screen stacked slabs (Books orange, Taxes sage, Payroll lilac) with a giant name, copy, an illustration that resolves from big halftone dots, and an included list; each slab shrinks as the next covers it.
5. Everything: a ruled 4 x 3 grid of twelve jobs with icons and tags (Automated, You approve, CPA-signed) that deal in and fill colour on hover. Ask (orange): sample questions beside an ink chat window that replays a conversation with typing dots, including a mini cash chart card.
6. Switching: the shoebox illustration and three ruled steps. Tax year (ink, pinned): twelve month columns of deadline chips scroll sideways past an orange line, each chip filling with its colour as it crosses.
7. Stories: three alternating rows of an ink portrait panel and a tinted quote. Accountants: four portraits with CPA / CPP / EA badges that settle into the grid. FAQ (sage): six details rows.
8. Pricing: three plans ($49, $199, $499) whose coloured blocks are as tall as their price and rise on scroll. Contact: details and an ink form with coloured checkbox chips and a local-only status. Footer: columns, an orange "24/7" and a giant "Sumwise".

THINGS THAT BREAK
- Queue every motion setup and run them in order after fonts load; if one throws, revert its GSAP context and undo the attribute changes it made.
- Measure tile vectors, report bands and chip positions inside functions and use invalidateOnRefresh.
- Pause the hero tile pans when the stage is off screen, and only stack the service slabs on screens at least 900 x 680.

THE FLOOR
One h1, a main, every section with an id. Illustrations have role="img" and a label; sprites, rules and decorative bands are aria-hidden. The menu button uses aria-expanded, takes focus to Close and Escape closes it. FAQ is details/summary; the form has labels and a status line and sends nothing. Focus rings on everything. prefers-reduced-motion: no smooth scroll, pinning or scrubbing, and the chat shows in full. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 25, 2026",
    demo: "/demos/sumwise-ai-accounting.html",
    bestFor: ["fintech and accounting", "small-business SaaS", "AI services firms", "professional services"],
    style: ["duotone", "editorial", "svg-illustration", "bold-color", "scroll-driven"],
    thumbnail: "/thumbs/sumwise-ai-accounting.jpg",
    theme: "light",
  },
  {
    title: "Infra AI Thermal Agent Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A thermal-camera page for an AI agent that sees heat: a giant condensed \"INFRA\" over a swirling WebGL heat plume, its letters stretching from the centre out as you scroll, every picture painted as a live heat field with a camera HUD, and a probe that reads the temperature under your cursor",
    prompt: `Build a landing page for Infra, a fictional AI agent that watches thermal and infrared cameras, understands what the heat means and acts on it (six agents: Triage, Crowd, Machine, Building, Space, Rack; under 40 ms per frame, no faces stored, edge, cloud or on-prem), as one HTML file. GSAP 3.13 with ScrollTrigger, and Lenis 1.3.4, from jsdelivr. Google Fonts: Hubot Sans with its width axis (75% wide for condensed caps, 112-125% for tracked labels) and Kalnia for a light serif.

DESIGN SYSTEM
The palette of a thermal camera: ink #09050f, night #1c1046, cool #06a7e1, pink #e8098a, hot #ef3f29, sun #fbee0c, paper #e8e6e0. Sections alternate full blocks of hot, paper, ink, night and sun, each with an SVG noise grain. Big radial "heat halos" (cool at the core through pink to hot) sit behind headings and cards. Headings are Hubot Sans 75% wide, weight 820, uppercase, very tight; display serif moments in Kalnia 200 at 125% width. Square ink tags in tracked caps; buttons whose fill rises as a hot-to-sun gradient; links with a heat-gradient underline that runs in; icon buttons that fill sun from a circle.

PICTURES IN CODE (no image files)
Every image is a <canvas class="thermo"> painted by a small renderer: a greyscale scene drawn at low resolution where brightness is heat (a portrait with hair and glasses options, a sunny street, a concert crowd with raised hands, a heart made of hands, an operator at warm equipment, a gallery, a team at a board, a machine with hot rollers, a cinema, a sunlit hall), then blurred, bloomed, given value noise and posterised steps, and mapped through a heat, cold or fever palette chosen by the nearest data-map. Each frame gets a camera HUD: corner brackets, a crosshair and reading on the hottest point, MAX / MIN / emissivity, a colour scale bar, and a blinking LIVE IR 8-14µm label on live feeds, which re-render with moving sensor noise. Hovering any thermal image shows a crosshair probe that reads the temperature under the pointer.

STRUCTURE
1. A fixed header of separate ink blocks (wordmark in sun, links, a sun "Book a demo") that hides on scroll down; under 1100px a menu button opens a full-screen hot menu with a cool radial glow.
2. Hero (sticky for 115vh more): a hot field with a WebGL thermal plume (fbm-warped swirl in cool, night, pink and hot, iso-lines and sun flecks, following the pointer), falling back to the CSS halo; a tracked eyebrow "The AI agent that sees heat", a thin ellipse ring with a cool dot orbiting it, "INFRA" in weight 330 filling the width and scaled tall, a live thermal portrait in a paper frame with a tag, and two tags and a button. On scroll the letters stretch taller from the centre out, the ring flattens and fades, the plume grows and the feed rises.
3. Manifesto (paper): "See the / warmth" in the serif across the width over a pink halo and a thermal street photo, three big figures (40 ms, 0.05 °C, 0 faces) and the story.
4. Capabilities (ink): six cards (Watch, Detect, Reason, Act, Explain, Private) in rotating section colours with a glow, titles filling the card width, clipping up into view.
5. Agents (night): six portraits in a staggered grid that start in the cold palette and are scanned into the heat palette by a sun line as you scroll.
6. How it works (ink, pinned and scrolled sideways): an intro then three step cards (Sense, Reason, Act), each with a thermal frame that pans slightly and a timed log of what the agent did (00.00 to 01.30).
7. In the field (paper): a 12-column collage of six thermal frames with captions and offset outline frames, drifting at different parallax speeds. Alerts (ink): two marquees in opposite directions of quote cards, each an alert in one plain sentence, pausing on hover and focus.
8. API (sun): a vertical "Build on it", facts (latency, SDKs, free tier, runs on) and a framed thermal portrait whose outline draws in. Pricing (night): three plans (€49, €39 per camera, Custom) with tall thin prices; the middle card is hot with a rising glow.
9. CTA: "See heat" in outline over a 34-step text-shadow trail running cool to sun to hot to pink to night that grows down as you scroll. FAQ (paper): sticky title and six details rows with rules that draw in. Contact (night): address, details and buttons beside concentric isotherm ellipses that draw in around a sun core. Footer (hot): halo, columns, a giant stretched "INFRA".

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s.
- Render each thermal canvas at its real size (DPR capped at 2) through a ResizeObserver, cache the heat fields, re-render after fonts load, and run live feeds only while on screen.
- Render the WebGL plume at 0.6x resolution with DPR capped at 1.5, stop it off screen and handle context loss.
- Place the hero feed from measured positions so it never covers the eyebrow at any size.

THE FLOOR
One h1 (the eyebrow and the wordmark), a main, every section with an id. Thermal canvases have role="img" and a label; halos, rings and duplicates are aria-hidden. The menu button uses aria-expanded and swaps its label; Escape closes it. FAQ is details/summary. Marquee copies are aria-hidden and untabbable. Focus rings on everything. prefers-reduced-motion: no pinning, scrubbing, marquees or live noise. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 25, 2026",
    demo: "/demos/infra-thermal-agent.html",
    bestFor: ["computer vision and AI agents", "industrial and IoT monitoring", "security and safety products", "developer APIs"],
    style: ["thermal", "bold-color", "canvas-art", "webgl", "scroll-driven"],
    thumbnail: "/thumbs/infra-thermal-agent.jpg",
    theme: "dark",
  },
  {
    title: "Easel AI Artist Assistant Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A two-ink risograph page for an AI studio assistant for artists: four pink ink drums roll down the hero and print a panel as you scroll, blue and pink plates slide into register, every illustration is greyscale SVG turned duotone by a blend, and a live plan ticket prices as you pick",
    prompt: `Build a landing page for Easel, a fictional AI studio assistant for artists ("Your hand. A hundred more.": it sorts references, blocks in values, suggests palettes and preps print files while every stroke that matters stays the artist's; suggestions always land on their own named layers, it learns your palette and never imitates other artists, private by default), as one HTML file. GSAP 3.13 with ScrollTrigger, and Lenis 1.3, from jsdelivr. Google Fonts: Gabarito 700-900 for display, Rethink Sans 400-700 for text, each with a metric-matched local fallback.

DESIGN SYSTEM
Two inks like a risograph: blue #11138d (the page), pink #ed008e, paper #f3f3fa and ink #07061f. CSS cascade layers: tokens, base, atoms, layout, sections, scenes. Display type Gabarito 800-900, very tight. Pill buttons whose hover fill grows as a disc from below; links underlined with a dotted radial-gradient that swells into a solid bar on hover; round icon buttons with a dot that drops. A "trail" atom: a CSS mask of dots that shrink up a column, like ink left by a roller. Surfaces have a scalloped top edge from a radial mask.

PICTURES IN CODE (no image files)
Every illustration is a greyscale SVG (a hand with an ink roller on a slab, a print peeled from a block, a stapler on printed sheets, hands trimming a sheet on a cutting mat) inside .m-photo, where lighten and darken blends map dark to blue and light to pink, so they print as duotone. Six abstract "studies" (horizon, halftone ground, arcs and spheres) come from a seeded generator into svg[data-art]. Shared halftone, wood, brick and mat patterns in one hidden defs block.

STRUCTURE
1. A fixed nav, transparent then blue, that hides on scroll down: two-dot mark and "easel", five dotted links, "Start free"; under 900px a round menu button opens a full-screen pink menu.
2. Hero: "Your hand." in pink and "A hundred more." in paper, each line filling the width from its letter count, an intro and two buttons, and four lanes each with a pink drum disc that bobs and a dot trail. Scrolling on, the drums roll down and across into a four-band pink panel ("Layers, never a flattened image."), each band printing as its drum passes and the drums shrinking away; beside it a duotone photo and three facts.
3. Layers (paper): four named layers (Sketch, Colour, Light, Texture) beside a 4x4 chart where a blue plate of columns and a pink plate of rows in 0/30/60/100% halftone slide in from opposite sides into register, with crop marks.
4. How it works (blue): pinned, five numbered step cards (Gather, Block, Paint, Refine, Ship) slide sideways while a sheet prints its blue plate then its pink one and the sheets under it fan out.
5. Features (pink): six features in a two-column kit beside three duotone photos. Studies (blue): six study cards in three lanes that piston into line on scroll with dot trails.
6. Pricing: a form of pill radios, a seats number and an assists select beside a scalloped paper ticket that prices live (plan rate + assists + style model, x0.8 yearly). Uses (paper): six big rows (Concept art, Picture books, Comics, Tattoo flash, Album covers, Game textures) that drift sideways like a lens with a pink misregistered shadow away from the centre.
7. FAQ (pink): six details rows. Contact (blue): copy, email, a local-only signup form with a status line, and four drums that drop and print their trails. Footer (paper): "easel" filling the width, three columns and a base line.

THINGS THAT BREAK
- Queue every motion setup and run them in order after fonts load; if one throws, revert its GSAP context and undo the attribute changes it made, so a broken scene never breaks the rest.
- Measure the hero geometry in onRefresh after resetting transforms, and pause the bobbing when the hero is off screen.
- Headings with data-8b-motion="register" start with a pink offset shadow that settles into register as they scroll in; "screen" reveals photos through a growing dot mask once.

THE FLOOR
One h1, a skip link, a main, every section with an id and aria-labelledby. Photos have role="img" and a label; decorative drums and plates are aria-hidden. The menu button uses aria-expanded, takes focus to Close and Escape closes it. FAQ is details/summary; the forms have labels, the ticket total is aria-live and nothing is sent. Focus rings on everything. prefers-reduced-motion: no smooth scroll, pinning or scrubbing. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 25, 2026",
    demo: "/demos/easel-artist-assistant.html",
    bestFor: ["AI tools for artists and creatives", "creative software launches", "SaaS with plan builders", "print and design studios"],
    style: ["risograph", "two-color", "bold-type", "svg-illustration", "scroll-driven"],
    thumbnail: "/thumbs/easel-artist-assistant.jpg",
    theme: "dark",
  },
  {
    title: "Ochre AI Meditation App Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A sunset-poster page for an AI meditation app: a thin \"OCHRE\" is split ink-on-paper by a dark field that sweeps across as the sun sets, the hero phone breathes over a live WebGL ocean, a moon window opens into the night, and every landscape is painted on canvas",
    prompt: `Build a landing page for Ochre, a fictional AI meditation app ("Meditation that listens": it hears your breath through the phone or earbuds, learns the shape of your day and builds a session that fits, from three minutes to a full night's sleep; private by design, breath analysed on device), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, from jsdelivr. Google Fonts: Reddit Sans 200-900 with italics, display set very light (100-300) and tight.

DESIGN SYSTEM
Ink #01262D, paper #F5C279 (the page), sun #EE8903, sage #586354, khaki #8C7D5A and rust #9A4703, with mixed tints for soft text on ink and on paper. A sunset poster: a big sun disc with a radial highlight, thin orbit arcs drawn as dashed SVG circles, and stepped "pillars" of sage, khaki and rust standing on a double rule like a skyline. Display headings Reddit Sans 200, -0.035em; small labels tracked 0.42em uppercase. Pill buttons whose fill wipes in from the left on hover; links redraw their underline; round icon buttons fill sun from below. An 8% multiply grain over everything and a sun progress line at the top.

PICTURES IN CODE (no image files)
- Canvas landscapes painted from presets: layered fbm ridges and dunes lit by slope, pine silhouettes, fog bands, sun with halo or a cratered moon, stars and a Milky Way band, an aurora, clouds, water that reflects the sky by redrawing rows with a ripple offset, wave streaks and glitter; vignette and grain. Seven presets: lake at dawn, ocean at dusk, desert night, forest rain (animated rain), northern lights (animated snow), valley fog, moon over water.
- Phone mockups built in HTML with container-query units: a titanium frame, dynamic island and glass glare, and four screens over a painted scene (Breathe with me with a glossy glass breathing orb that scales on a 10-second cycle and cues that fade in and out; a sleep story with a waveform and chips; a morning check-in with mood pills; a weekly insights bar chart).
- The hero phone screen is a real-time WebGL ocean: a ray-marched heightfield of rolling swells under a dusk sky with clouds and a low sun, Fresnel reflections and fog, tilting the phone toward the pointer; it falls back to the painted ocean without WebGL.
- A CSS candle with a flickering flame and glow, a glowing orb macro with ripples, and a studio of three phones with reflections.

STRUCTURE
1. A fixed header, transparent over the hero then frosted paper: sun mark and "Ochre", five links and "Start free"; under 1020px a two-line menu button opens a full-screen ink menu.
2. Hero (pinned for 110svh): an ink field covers the left 38%, "OCHRE" fills the width in weight 200 with its letters paper over the ink and ink over the paper, the sun sits on the split with an orbit arc, "in / out" in huge thin type on the ink, the pillars along the bottom, the phone rising from below, a tracked "iOS · Android · 14 days free", an intro with two buttons, and a three-column footer strip on a double rule. On scroll the ink sweeps across to cover everything, the sun sets behind the pillars, "in / out" glows sun-coloured and the copy fades.
3. A sun-coloured ticker. Manifesto (ink): a statement whose words light up as you scroll and three huge thin stats (3, 180, 9).
4. Features: six ruled rows (Adaptive sessions, Breath sensing, Sleep, Focus, Daily check-in, Weekly letter) with number, title, text, meta and a round picture; rows fill ink from below on hover.
5. Soundscapes (sun): six arch-topped painted scenes with glass play pills, in three columns drifting at different parallax speeds.
6. Privacy (ink, pinned 140svh): the moon-over-water scene opens from a circle as a dark moon slides off it and a ring expands, then "A quiet room in your pocket" and three facts appear.
7. A day with Ochre: a split background (ink left, paper right) with the title coloured to match; a sun line grows down the split with a dot running along it; four sticky times of day (07, 13, 19, 23) whose numbers turn sun as they pass, each beside a list of sessions.
8. Pricing (ink): four plans ($12, $70, $110, $240) whose coloured pillars rise in proportion to the price. Gallery: a 12-column collage of six pictures (check-in phone over the dawn lake, the orb macro, a sleep story under the aurora, the three-phone studio, a focus timer over forest rain, the candle) drifting at different speeds around a sun disc.
9. Reviews (ink): five quote cards with glossy initial gems in a marquee that pauses on hover. Trial (sun): "Your first breath is on us" whose letters turn paper inside an ink disc that grows from a dot. FAQ: sticky title, six details rows. Contact: an ink column of contacts and a paper column with a newsletter form, a rising sun and pillars. Footer: a double rule, four columns and a giant "OCHRE".

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s.
- Paint each canvas only when it nears the viewport, at its real size, and repaint on resize; keep rain and snow on a cached base image and pause them off screen.
- Cap the WebGL canvas at 1.75 DPR, stop its loop when off screen or hidden, and handle context loss.
- The hero split and the title gradient share one --split custom property so the letters always change colour exactly at the edge of the ink.

THE FLOOR
One h1 (the wordmark, with a screen-reader tagline), a main, every section with an id. Canvases that are pictures have role="img" and a label; decorative ones are aria-hidden. The menu button uses aria-expanded and swaps its label; Escape closes it. FAQ is details/summary; the signup has a label and a polite live status and sends nothing. Focus rings on everything. prefers-reduced-motion: no pinning, breathing, weather or marquee, one still frame of the ocean. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 24, 2026",
    demo: "/demos/ochre-meditation.html",
    bestFor: ["wellness and meditation apps", "consumer AI apps", "health and sleep products", "mobile app launches"],
    style: ["sunset-poster", "minimal-type", "canvas-art", "webgl", "scroll-driven"],
    thumbnail: "/thumbs/ochre-meditation.jpg",
    theme: "light",
  },
  {
    title: "tokenhaus AI Design System Academy Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A four-ink Bauhaus page for an AI design-systems academy: the hero is a grid of quarter-circle tiles that turn as the next section slides over it, \"SYSTEM\" fans out into echoes in pink, amber and white, courses grow out of circles into pills, and every swatch, specimen and tutor portrait is drawn in SVG",
    prompt: `Build a landing page for tokenhaus, a fictional academy that teaches designers to build design systems with AI (twelve-week live cohorts of twelve people on tokens, components, AI-assisted generation, docs and design-to-code sync, with an AI pair at every step), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, from jsdelivr. Google Fonts: Gabarito 600-900 for display, Instrument Sans 400-600 for text.

DESIGN SYSTEM
Four inks on paper: paper #E7ECF0, ink #212445, amber #FFA802, sky #00A9FF, pink #FF73A5 and light #FDFEFD. Sections are full-bleed blocks of one ink. Display type is Gabarito 900 uppercase, tight. The shape language is a tile: an <i class="t"> square with a ground colour and one shape on top (a quarter circle, a half circle, a quarter ring, a dot or a pill) rotated in quarter turns by a custom property; tiles build the hero, the logo mark, the bullets, the work grid and the contact figure. Big quarter-round corners (radius clamp(96px, 18vw, 280px)) on single corners of photos and cards. Pill buttons whose hover fill grows as a circle from the bottom-left; links with a 3px pill underline that runs out and back in on hover; plus icons that turn 90deg.

ECHO TYPE
data-echo="n" adds n absolutely positioned copies of a word behind it, each pushed down by --eg and outlined in the section colour with an 8-way text-shadow, so the word reads as a stack. With data-echo-inks the copies are pink, amber, light and ink.

PICTURES IN CODE (no image files)
Every picture is an SVG string written into svg[data-art] from a seeded generator: a fan of eight colour-token strips over a grid with swatch cards and an amber sample; a wall of six component cards (a "TOKEN SETS" card, striped, a dot grid "SPACE 04", a big "04", dark mode) taped up; a "BLUE 500" specimen poster; five stacked sheets showing elevation; quarter-round radius curves; a case of amber glyph keys in an ink tray; a roller painting a pink theme; and four tutor portraits built from the same face with different hair, clothes and a halftone quarter circle.

STRUCTURE
1. A paper header that hides on scroll down and returns on scroll up: tile mark and "tokenhaus", five links, "Apply now"; under 1080px an amber round menu button (three pills that become an x) opens a full-screen ink menu.
2. Hero (sticky, so the next section slides over it): a 7 x 4.4 module grid sized from the viewport height: nine quarter-circle tiles (one double-size with an amber eye) on the left, an amber block of three ink pills, a sky block with "AI DESIGN SYSTEMS" echoed twice and the lead and buttons, and an ink band with "ACADEMY" filling the width beside a pink corner tile. As the next section rises the tiles turn, the pills shrink to dots, the echoes spread and the hero darkens.
3. About: a large statement whose lines mask up on scroll, the token fan photo opening from its bottom-left corner, and three principles with tile bullets that turn in.
4. Courses (amber): five ink pill rows that grow from circles to full width on scroll, each opening into an accordion with a description, level, outcome, price ($290-$560) and "Book a place".
5. Manifesto (sky): "SYSTEM" filling the width with four echoes in pink, amber, light and ink; pinned for 250svh they fan downward and settle back, then a line of text fades in.
6. Work: an 11-cell grid of the coded pictures and plain tiles (some with quarter-round corners and captions) that slide in from four sides.
7. Process (pink): a sticky heading beside four steps (Audit, Tokens, Components & AI, Ship) on a rail, with a four-colour disc that rolls down the rail and steps that brighten as they reach it.
8. Tutors (ink): four portraits that wipe in from the left, then the art drops in. Numbers: three stat cards (12, 900+, 94%) that turn up from their corner, and four pill bars of where graduates go.
9. Voices (sky): four sticky quote cards that scale and tilt as the next covers them. Fees: three cards ($480, $860, $1,900) with shape headers, the middle one ink. FAQ (amber): sticky heading, five accordion rows. Contact (ink): "SAY HELLO" echoed, details, and a six-tile figure. Footer with a four-ink strip that grows up.

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s.
- Size the hero module from both the viewport height and the container width, and set the sticky top to min(0, innerHeight - hero height) so a tall hero still scrolls into view.
- Measure pill widths inside the clip-path functions and use invalidateOnRefresh, and refresh ScrollTrigger when an accordion opens.
- Keep the echo copies aria-hidden and unselectable, and pause the hero loops once it is covered.

THE FLOOR
One h1 (the two hero lines), a main, every section with an id. Every coded picture has role="img" and a label; decorative tiles are aria-hidden. The menu button uses aria-expanded and swaps its label; Escape closes it. Accordions are buttons with aria-expanded. Focus rings on everything. prefers-reduced-motion: no sticky cover, scrubbing or loops. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 24, 2026",
    demo: "/demos/tokenhaus-design-academy.html",
    bestFor: ["online courses and cohorts", "design and education brands", "AI tools for designers", "bootcamps and academies"],
    style: ["bauhaus", "geometric", "bold-color", "svg-illustration", "scroll-driven"],
    thumbnail: "/thumbs/tokenhaus-design-academy.jpg",
    theme: "light",
  },
  {
    title: "Ostler AI Hotel Concierge Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A late-night oxblood page for an AI hotel concierge: a giant \"Ostler\" springs apart letter by letter over a guest's phone chat, six module covers slide past sideways, \"Awake\" zooms into a hotel facade at night, and every phone, dashboard and room is drawn in SVG",
    prompt: `Build a landing page for Ostler, a fictional AI concierge for independent hotels ("An AI concierge that knows your hotel like your best night porter": it answers guest messages in 41 languages on chat, SMS, email and the phone, sells the extras, and hands the tricky ones to the team; live in 212 hotels, set up in fourteen days), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, from jsdelivr. Google Fonts: Gabarito 500-900 for display, Instrument Sans 400-700 (with italics) for text.

DESIGN SYSTEM
Ink #100C0D (the page), red #A72D2D with red-deep #7A2222, cream #E2DCCE and olive #5B6A45. Sections are rounded cards (radius clamp(20px, 2.3vw, 34px)) inset from the edges by a small gap on the ink page, coloured .on-red, .on-cream or .on-olive; each card has two small square corner marks (top right, bottom left). Display words in Gabarito 900, line-height 0.8, -0.045em, sized to fill their box exactly: font-size = 100cqi / (--len x --k) with --k 0.52. Headings Gabarito 800. Pill buttons with an arrow: on hover a circle fill grows from the arrow end, the button tilts -3deg and the arrow nudges right. Links get a wavy underline on hover; icon buttons wobble. A 6% animated noise grain over everything and a red scroll-progress line at the top.

PICTURES IN CODE (no image files)
Everything is inline SVG with shared filters (drop shadows, blurs) and gradients (warm glow, brass, wood, linen): a lobby of blurred warm bokeh behind a phone showing a full guest chat with The Harbour House (taxi booked, late checkout sold, a receipt card) plus floating cards ("9 sec" median reply with a sparkline, "Late checkout sold +£35", "Handed to Sam"); a manager's 7am lock screen of overnight notifications; module mockups (a French chat with FR → EN tag, a sea-view upgrade offer, a housekeeping ticket list, a review with a drafted reply, a live call with waveform and transcript, requests-by-hour bars with the staffed hours shaded); a weekly dashboard with KPI tiles and a line chart; a hotel facade at night with lit windows, a red awning and street glow; integration nodes with animated dashed links; a knowledge base list; channel toggles; a resolution chart; six hotel "prints" (bedroom, rooftop pool, lobby with chandelier, candlelit table, spa, seaside hotel); a reception desk with key boxes and a brass bell.

STRUCTURE
1. A fixed rounded ink header bar (blurred): diamond and "Ostler", five links, a cream "Book a demo"; under 900px a two-line menu button opens a cream dropdown card of large links.
2. Hero: a tall red card (pinned for 75svh) with the lobby art, "Ostler" filling 92% of the width across its top edge (clipped so it hangs from the top), the phone on the right, the title, lead and a "See the product" button bottom left with a pulsing "Online now" dot. On load the letters spring into a slightly tilted stance and rock gently; on scroll the card shrinks to 0.86 and tilts while each letter flies up and away and the copy fades.
3. A ticker of claims (outlined words between red diamonds) and a row of hotel names in mixed type styles.
4. Story (cream): a headline whose words bounce in, the tilted lock-screen print dropping in, a paragraph and three red stats (1.8M, 9 sec, 87%).
5. Modules: pinned and scrolled sideways: an intro and six 4:5 covers (Concierge, Upsell, Rooms, Reviews, Voice, Insights) in red, olive and cream, each with its mockup, the name filling the width, a price and a line; the covers tilt and their words drift as they cross.
6. Pricing (olive): heading, lead and the dashboard with parallax beside six price rows whose rules draw across and whose prices pop in with a spin (£4, £1, £1, 50p, £2, £0).
7. Statement: the hotel at night full-screen with "Awake" knocked out of an ink layer (multiply blend); pinned for 160svh the word zooms 9x from its own centre until the photo is revealed, then a cream card rises: "Your front desk closes. Ostler doesn't."
8. How it works: a sticky intro beside four sticky step cards (Connect your systems, It learns your hotel, Go live on every channel, It gets better every night) that scale down and tilt as the next arrives.
9. Changelog (red): five dated rows with giant day numbers that wipe in, tagged Live or Next Thursday. Voices (olive): six cream quote cards in a marquee that slows to a stop on hover or focus. Gallery: six tilted hotel prints at different parallax speeds around "Checked in", whose letters drop in elastically. FAQ (cream): six details rows with a plus that turns. Contact (red): "Talk to us" filling the width, hours list, the reception print and a demo form that thanks inline. Footer: a giant "Ostler", links and a line.

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s; the pinned heights, sticky stacks and hidden start states live behind .motion.
- The sideways rail's section height is 100svh plus the track's overflow, written to --run on every ScrollTrigger refreshInit; the covers animate with containerAnimation.
- Split letters into an outer span (scroll) and an inner span (spring and rock) so the two animations don't fight.
- Set up each section's animations only when it comes near the viewport, one job per tick, and refresh ScrollTrigger once fonts load.
- Clone the marquee cards once, aria-hidden with links untabbable, and pause anything looping while it's off screen.

THE FLOOR
One h1, a main, every section with an id. Every picture is an SVG with role="img" and a label. The menu button uses aria-expanded and swaps its label; Escape closes it. FAQ is details/summary; the form has labels and a polite live status and sends nothing. Focus rings on everything. prefers-reduced-motion: no pinning, grain, ticker or SMIL animation, the rail as a grid. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 24, 2026",
    demo: "/demos/ostler-hotel-concierge.html",
    bestFor: ["hospitality software", "AI agents and assistants", "customer support automation", "vertical B2B SaaS"],
    style: ["editorial", "card-stack", "fill-type", "svg-illustration", "scroll-driven"],
    thumbnail: "/thumbs/ostler-hotel-concierge.jpg",
    theme: "dark",
  },
  {
    title: "Wayfind AI Travel Companion Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A sand-and-sea expedition poster of a page for an AI travel companion: \"wayfind\" is cut out of a desert photo that opens to full bleed as you scroll, mode posters stack and tilt, a nine-day route draws itself sideways, and every photo is raymarched live in WebGL",
    prompt: `Build a landing page for Wayfind, a fictional AI travel companion (it plans a whole trip in about 90 seconds, watches every booking, rebooks disruptions while you sleep and works offline in 140 countries; four agents behind one chat: Scout finds, Fixer rebooks, Compass navigates, Ledger tracks money), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, from jsdelivr. Google Fonts: Special Gothic (wdth 75-100, 400-700) for display, Hubot Sans (wdth 75-125, 200-900) for text.

DESIGN SYSTEM
Sand #E1C49C (the page), sky #89B3AA, sea #3B6A5F, moss #26352C, ink #181412 and coral #E06244, with paper mixed 62% sand into white and two sky "grade" tints laid over every photo. Sections alternate sand, moss (dark) and sky at full bleed; corners are square everywhere. Display type is Special Gothic 700 at 75% width, lowercase, line-height 0.8-0.86, in sea on sand, sky on moss, moss on sky. Body in Hubot Sans; small labels set wide (125%, weight 300). Facts are spec lists: a bold term with a trailing dash over a wide light value, in an auto-fit grid. The mark is a four-point concave star, used as logo, menu button, bullets, FAQ icon and route markers; it turns 45deg on hover. Buttons are coral or ink rectangles filled from the bottom on hover; links grow a 2px underline. A fixed SVG noise grain at 16% over everything.

PICTURES IN CODE (no image files)
- Each img carries data-scene and is rendered at load into a JPEG data URL. A single WebGL fragment shader raymarches heightfield terrain in six modes (dunes with ripples, ridged mountains with forest and snow lines, flat plains, a terraced canyon around a road, a lone rock tower, a volcano cone), with soft shadows, haze, clouds, a road with a dashed centre line, water with Fresnel reflections, salt-flat polygons and a night sky with stars and a Milky Way band, then ACES tone mapping, vignette and grain. The same shader draws a night globe with clouds, city lights and atmosphere, a phone on a table under window light with a map on its screen, a stack of coins beside a card, and a shaded topographic map with contour lines.
- 2D canvas overlays placed by reading the depth under a screen point: a red 4x4 wagon kicking up dust, a dark wagon with a roof tent, a white wagon on a dirt road, a rusted sedan, a row of tents, four camels with riders, five people round a campfire, camp beds under stars, a glowing tent, flight arcs over the globe, a route and pin over the topo map, and four backlit head-and-shoulders silhouettes with rim light for the team.
- If WebGL is missing or the context is lost, the same scene names render as flat SVG illustrations.

STRUCTURE
1. Header on sand: star and "Wayfind", six links, a coral "Start a trip"; the star menu button is fixed top right and turns sand over dark sections. It opens a full-screen moss menu that grows out of the button as a diamond clip-path, with huge sky links.
2. Hero (100svh): four spec facts across the top (Plans in, Works in, Rebooks, Offline), then "wayfind" sized to fill the width exactly, its letters filled with the hero photo (background-clip text aligned to the photo's real position). The photo frame starts clipped to begin at the word's baseline inside the side margins; pinned for 115% of a screen it opens to full bleed while the photo scales to 1.12, the word sinks, the facts fade up and a caption rises in sand over the bottom.
3. Manifesto: a coral star that turns on scroll, a large paragraph whose lines stretch from 75% to 125% width as they pass, a founders' signature and three facts under a rule that draws across.
4. Modes: four sticky posters (Weekend, Road trip, Off-grid, The big one) in paper, moss, sky and coral; each has a spec row, a giant title, copy, a price note and a photo that opens from an inset. As the next poster arrives the one under it scales to 0.9, tilts and darkens.
5. Agents (moss): four rows, each a giant sky name with role, a 16:10 photo that opens from a horizontal slit, and a spec list.
6. A trip: "Nine days, planned in ninety seconds", pinned and scrolled sideways through six day stops at alternating heights; an SVG route line draws through the star markers, and each stop's star turns coral and its photo wipes open as the line reaches it.
7. Disruptions (sky): heading, notes and a twelve-month bar chart (thousands fixed per month, the four busiest in coral, Nov and Dec still "-") that grows in; horizontal bars under 600px.
8. Team: four people with a giant first name overlapping the top of a 4:5 portrait, alternate columns drifting at different parallax speeds. Reviews (moss): a huge sky quote whose lines rise in, and a marquee of six quotes that pauses on hover or focus.
9. Gallery: a 12-column collage of six photos opening from four directions. Pricing (sky): Free, Plus (coral) and Pro with a Monthly/Yearly switch that slides the price up or down. FAQ: a sticky heading beside six accordion rows whose star turns. Contact (moss): contact facts, "let's go" knocked out of a mountain photo with parallax, a lead and two buttons. Footer on sand with a giant "wayfind", links and the star.

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s; pinning, the sideways itinerary and every hidden start state live behind .motion.
- Knockout text: compute the photo's drawn size and offset (object-fit cover, object-position) relative to the word and write them as background size and position; redo it on load, font load, resize and when the scene finishes rendering.
- Render the hero and contact scenes first, then whatever is nearest the viewport, one per frame, and fire a resize once the knockouts have their photos so ScrollTrigger re-measures.
- Sticky posters need their top offsets set in JS so the stack stays on screen, recalculated on ScrollTrigger refreshInit.
- Build the route path from the real marker positions on every refresh.

THE FLOOR
One h1, a main, every section with an id. Every img has alt text and width and height. The menu button uses aria-expanded and swaps its label, the menu is inert while closed and Escape closes it. FAQ is details/summary; the price switch uses aria-pressed; the marquee clones are aria-hidden and untabbable. Focus rings on everything. prefers-reduced-motion: no pinning, scrubbing or grain animation, the itinerary as a grid. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 24, 2026",
    demo: "/demos/wayfind-ai-travel.html",
    bestFor: ["travel and booking apps", "AI agents and assistants", "consumer subscription apps", "outdoor and adventure brands"],
    style: ["editorial", "expedition-poster", "knockout-type", "webgl", "scroll-driven"],
    thumbnail: "/thumbs/wayfind-ai-travel.jpg",
    theme: "light",
  },
  {
    title: "Tarn File Transfer Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A frosted steel-grey page for a heavy-file transfer service: the hero zooms out of a giant glass send button into its frame, a magnifying lens glides across the manifesto, a light sweeps the service tiles, and a send button you can try with your own file",
    credits: [
      { label: "8B AI Website Builder", href: "https://8b.com/", note: "Generated this page from a single prompt" },
    ],
    prompt: `Build a landing page for Tarn, a fictional heavy-file transfer service for studios ("Heavy files, handled lightly.": film cuts, raw shoots and whole archives, 2 TB per send, links that expire, no account needed to receive), as one HTML file. GSAP 3.13 with ScrollTrigger, and Lenis 1.3.4, from jsdelivr. Google Fonts: Hubot Sans (wdth 115, weights 300-400) for display, Geist 400-500 for text.

DESIGN SYSTEM
One family of steel-blue greys: ground #424C55, deep #333B43, steel #66727A, steel-hi #7E8A91, pane #56616A, frost #D3DDE3, and a near-white glow #E6EFF4, with inks #F3F6F8, #D9DFE3, #AAB4BB and a shade #14191E for shadows. No accent colour: everything is frosted glass. A .glass surface is a vertical gradient of its tint (--gl) with a frost glow at the bottom edge, an inner shadow at the top and a bright 1.5px rim top and bottom (--rim). Pill buttons and round icon buttons; on hover a diagonal sheen slides across, icon buttons lift their arrow and their underglow rises. Big rounded slabs (radius clamp(28px, 4.4vw, 60px)) hold the dark sections; cards at radius 22-30px. Headings in Hubot Sans 300 at width 115%, -0.025em, balanced.

PICTURES IN CODE (no image files)
- The hero slab is a gradient textured with an SVG filter: fractal noise lit by feSpecularLighting from a point light, blended in overlay, so it reads as brushed, frosted metal.
- Five gallery "photos" as inline SVG with grain, vignette and slow SMIL drift: a foggy sea with a sun haze and hundreds of glints on the water, a photo studio with an octagonal softbox, a light strip and a camera on a tripod with floating dust, concrete steps under the shadows of bare branches (recursively drawn), a mixing desk with rows of knobs and animated meters, and a mountain lake whose layered ridges, fog and treeline are mirrored through a turbulence displacement ripple. The contact picture is a still lake with trees, also reflected.

STRUCTURE
1. A fixed glass pill header: a glass dot and "tarn", four links, a "Send files" button; under 1024px a round menu button opens a glass dropdown.
2. Hero (200svh, sticky): the textured slab fills the screen inside an edge margin with "Heavy files, handled lightly.", a line of copy and three check chips. On load the stage is scaled 4x from its bottom-left corner so the round upload button and "Send files" pill fill the screen; scrolling the first screen shrinks it into place (one --p custom property drives translate and scale). The upload button has a conic highlight orbiting its rim.
3. Manifesto: a long paragraph in wide light type, signed by the founder; a round glass lens travels across it on scroll in a serpentine path, showing a 1.3x copy of the text inside, aligned to the words underneath.
4. Services (deep slab): six glass tiles with a chip each (Transfers, Review links, Archive, Vaults, Delivery pages, Watch folders); a large soft light travels across the grid on scroll and each tile's rim lights up as the light passes it.
5. Process: a sticky heading beside four glass steps, each with an inset toggle switch that flips on as the step reaches the middle of the screen, joined by a line that fills down.
6. Speed (deep slab): "A 60 GB folder, door to door." with a giant "9 min" and four inset bars (Tarn, shared drive sync, office FTP, email parts) that fill in proportion when they appear, Tarn's bar lit; a footnote on how it was measured.
7. Try it (lit slab): a big round upload button and a long glass pill. Choose or drop a file and the pill fills to "Link ready" and shows a fake link; nothing leaves the device.
8. Work: a 12-column collage of the five pictures with glass captions hanging off their bottom edges; each picture opens from a small pill shape to its full frame.
9. Pricing (lit slab): a monthly/yearly segmented control with a sliding glass thumb that swaps the prices with a rise; three plans (Light $0, Studio $16, House $44 per seat), the middle one glowing. Voices: six glass quote cards in a marquee that pauses on hover. FAQ: a sticky heading beside six glass accordion rows whose plus turns into an x. Contact: details list, the lake picture and a glass form overlapping it that thanks inline. Footer: a line, links and a giant engraved "tarn" wordmark rising into the bottom edge.

THINGS THAT BREAK
- Add .motion in the head before first paint unless prefers-reduced-motion, and remove it if GSAP has not arrived after 2.5s; the 200svh hero, the zoom and every hidden starting state live behind .motion.
- The lens copy must be the same width as the paragraph and offset by K x (lens position), measured again on every ScrollTrigger refresh, or the magnified words drift off the real ones.
- Measure tile centres on refresh, not once, so the light still lines up after the grid reflows.
- Clone the marquee cards once, mark the clones aria-hidden and inert, and animate the track by -50%.
- Pause the orbit, lens, light and marquee while their sections are off screen.

THE FLOOR
One h1, a main, every section with an id. Pictures are role="img" with a label and an aria-hidden SVG. The menu button uses aria-expanded and swaps its label; Escape closes it. FAQ questions are buttons with aria-expanded and aria-controls; the billing toggle uses aria-pressed; the send label and form note are live regions. Focus rings on everything. prefers-reduced-motion: no zoom, lens or light, switches shown on, marquee as a static grid. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 23, 2026",
    demo: "/demos/tarn-file-transfer.html",
    bestFor: ["file transfer and storage products", "creative and media tools", "B2B SaaS for studios", "developer and infrastructure tools"],
    style: ["glassmorphism", "monochrome", "frosted", "svg-illustration", "scroll-driven"],
    thumbnail: "/thumbs/tarn-file-transfer.jpg",
    theme: "dark",
  },
  {
    title: "Somatic AI Wellness Companion Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An acid-lime page for an AI wellness companion: a breathing point-sphere orb sits behind \"SOMATIC SIGNALS\" stretched to the full width, a diamond window opens to fill the screen as you scroll, five programs slide past sideways, and every heart trace, sleep map and portrait is drawn in code",
    prompt: `Build a landing page for Somatic, a fictional AI wellness companion ("the AI that listens to your body": it reads sleep, heart rhythm, breath and movement from the ring, watch or phone you already own and turns them into one calm plan for today), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Anybody (wdth 50-150, 100-900) at 58% width and weight 900 for display words, Bodoni Moda italic for the one emphasised word per heading, Space Grotesk 300-700 for text, Space Mono for labels.

DESIGN SYSTEM
Acid #D4FF3F, ink #0D0C0B, paper #ECEBE4, moss #1F2B24 and coral #FF5E3A, with a periwinkle #7AA0FF only inside the art. Sections alternate moss, acid, ink and paper at full bleed, no rounded corners anywhere: the shape language is the diamond (a 45deg square) for bullets, ticker separators, step marks, the menu icon and every reveal. Display words in Anybody 900 uppercase, condensed and set very tight; each h2 ends on a Bodoni italic word in coral or paper. Buttons are ink or acid rectangles whose hover fills from the centre with a rotated square; links have a block highlight that rises from a thin underline. A 22% SVG noise grain over the hero.

STRETCHED TYPE
- Rows of display type fill their container exactly: each .row is var(--r) x 100cqw tall, and its word's font-size is 100cqw / (--len x --k), then scaleY stretches it to the row height using the font's cap-height ratio --cap.
- After fonts load, measure the real cap height of Anybody on a canvas (actualBoundingBoxAscent at 100px) and each word's real width, and write --cap and --k back, so the words land edge to edge in any browser. --len (letter count) on each word is the fallback before the script runs.

PICTURES IN CODE (no image files)
- Hero: a canvas with a dark moss gradient, a coral glow bottom-left and a periwinkle glow top-right, 20 drifting contour rings, and a Fibonacci point sphere of 1,300 points that breathes, warps with two sines and turns toward the pointer; near points are acid and larger, far points paper and faint. The same frame is copied into a second canvas clipped to a diamond in the centre of the screen. Cap DPR at 1.5, pause off screen, one still frame under reduced motion.
- Program posters in SVG: a crescent moon over twinkling stars and sleep-stage bars (Sleep), pulsing concentric rings (Breathe), a filled HRV wave with a coral marker (Recover), a three-colour macro ring (Fuel), an orbiting focus dot (Focus).
- An ECG line with a coral scan running along it, a sleep hypnogram of coloured blocks on four levels, three topographic contour fields from perturbed circles, a scatter of 30 days of HRV dots with a trend line, a conic readiness ring, and a CSS breathing diamond that cycles Inhale, Hold, Exhale over 14 seconds.
- Team portraits are gradient fields with a diamond frame and the person's initials in Bodoni italic, blended with overlay.

STRUCTURE
1. A fixed acid header: wordmark "SOMATIC" with an italic "ai", five mono links, a "Start free" button; it hides on scroll down. Under 960px a Menu button with a turning diamond opens a full-screen acid menu with huge links.
2. Hero (moss, full height): a ticker, "SOMATIC" and "SIGNALS" stretched across the width, a reverse ticker, the two words again; the orb canvas behind, the diamond window on top. Pinned for 110% of a screen: the diamond grows until it covers the screen, the photo settles from 1.08 to 1, and the type rows stretch taller and drift up. The letters ripple in a slow scaleY wave.
3. About (acid): a ticker of biomarkers, a large lead paragraph whose lines rise in from masks, a 3:4 readiness figure (contours, a ring at 86, time 06:42) with parallax, three facts (24/7, 09, 4 min) and a button.
4. Programs (ink): pinned and scrolled sideways: an intro ("Pick your practice") and five tall posters, each with the program name stretched across its top, a mono meta strip between acid rules and a line of text; the art and the names drift in parallax as they cross.
5. Values (moss): four giant words (Private, Evidence, No guilt, Human loop), each letter stretching from flat to full height and beyond as it scrolls past, with a paragraph under each.
6. Your day (paper): five rows (Wake, Work, Pause, Move, Rest) with a giant day word, title and line, time, program and duration; each row is swept by an acid bar that wipes in and out before its content appears, and fills acid on hover.
7. Team (ink): four portraits that open from a point into a diamond and then to the full frame. Voices (acid): a featured quote whose words brighten as you scroll, a marquee of six ink quote cards that pauses on hover and focus, and a note that the testimonials are samples.
8. First week (paper): four steps on a rising staircase joined by a drawn line. Signals (ink with an acid frame): a bento of six tiles (live ECG, breathing diamond, last night's hypnogram, stress landscape, HRV dots, readiness ring) that tilt up into place.
9. The year so far (moss): three stats and a bar chart of nine months that grows in. Pricing (paper): three plans at $0, $12 and $29, the middle one acid, rising at different speeds. FAQ (acid): a sticky heading beside five accordion rows with a diamond plus that turns into an X. Contact (moss): drifting blurred colour orbs and contours behind "Begin gently", a waitlist card that thanks inline and sends nothing, and "LISTEN CLOSER" stretched across the bottom. Footer: a ticker, the wordmark, links and a medical disclaimer.

THINGS THAT BREAK
- Add a .motion class in the head before first paint unless prefers-reduced-motion, and drop it if GSAP has not loaded after 2.5s; pins, the sideways rail and every hidden-until-revealed state live behind .motion.
- The program rail's length is the track's scrollWidth minus the viewport: measure it on refreshInit with invalidateOnRefresh, or the pin ends early after a resize.
- The diamond window grows a custom property (--dd) inside clip-path; tween it with function values so it is recomputed on resize.
- Fit the stretched type after document.fonts.ready and only then create the ScrollTriggers, or every pin starts at the wrong place.
- Tickers clone their items enough times to cover the width, loop by exactly one period, play only while visible, and speed up with scroll velocity before easing back.
- Run every GSAP setup from a queue, one per task, so the first scroll does not stall.

THE FLOOR
One h1, a main, every section with an id. Decorative SVG and canvases are aria-hidden; the readiness figure has a role="img" label; cloned ticker items are aria-hidden and untabbable. The menu uses aria-expanded and swaps its label; Escape closes it. The FAQ buttons control their regions with aria-controls. Focus rings everywhere. The form status is a live region. A footer line says the product is a wellness tool that does not diagnose. prefers-reduced-motion: no pinning, no marquee, the orb drawn once. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 23, 2026",
    demo: "/demos/somatic-ai-wellness.html",
    bestFor: ["AI health and wellness apps", "wearables and sleep tracking", "digital health startups", "consumer AI companions"],
    style: ["acid", "bold-type", "stretched-type", "canvas", "scroll-driven", "horizontal-scroll"],
    thumbnail: "/thumbs/somatic-ai-wellness.jpg",
    theme: "light",
  },
  {
    title: "Latent AI Fashion Atelier Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A dark, iridescent page for an AI fashion atelier: a wireframe cloth ripples toward the pointer under a giant \"Latent\" that scatters as the hero tilts away, six capsules slide past sideways, a \"Zero\" knockout zooms open onto a gradient, and every picture is generative SVG",
    prompt: `Build a landing page for Latent, a fictional AI fashion atelier ("Clothes drafted by a model, finished by a tailor.": generative outerwear, engineered knit and smart optics, cut to a 3D scan of your body and released every Thursday), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Unbounded 300-900 for machine-scale display words, Geist 300-800 for headings and text, Doto 500-900 (a dot-matrix face) for the emphasised phrase in each heading, Geist Mono 400-500 for labels.

DESIGN SYSTEM
Ink #07070A with graphite #101015 and #18181F, bone #ECE7DC and #E2DCCF, violet #6D4CFF with a deep #2A1D78, cyan #5CE1FF and volt #D6FF5C. One iridescent gradient (105deg, violet to cyan to volt) for the logo tiles, highlights in the art and the footer wordmark. Sections are rounded cards (radius clamp(20px, 2.3vw, 34px)) inset by a gutter, coloured on-bone, on-violet or on-ink, each with two small crosshair marks in opposite corners. h2s in Geist 600 at -0.04em end on a lowercase Doto phrase; display words in Unbounded 800 uppercase at line-height .82. Pill buttons whose fill grows as a circle from the arrow end on hover, with a slight rotate on a springy cubic-bezier(.34, 1.56, .5, 1); links whose underline goes wavy on hover. An 8% SVG noise overlay across the page.

PICTURES IN CODE (no image files)
- A seeded PRNG (mulberry32) and seven SVG generators chosen by data-art and data-seed, painted once into each element at its own aspect, with a violet glow and an iridescent gradient for the "hot" lines: form (a torso made of horizontal scan lines from an eased width profile, with a glowing laser band and a ruler), portrait (head and shoulders from the same scan lines, tilted), drape (a perspective wireframe sheet of cloth), contour (a topographic pressure map), lens (two iridescent ringed lenses on a bridge), weave (an over-under woven texture, rotated), sphere (a Fibonacci point sphere with depth-sized dots and two orbit rings).
- The hero: a canvas wireframe sheet in perspective, 36 rows by 60 columns, rippling from three sines over time and bulging toward the pointer with a gaussian; every fourth row stroked with the gradient. Cap DPR at 2, pause off screen, draw a single still frame under reduced motion.
- Display words fit their box: measure at 100px and scale, re-run on font load and resize; a --len (letter count) gives a container-query fallback before the script runs.

STRUCTURE
1. A fixed pill header with a blurred glass bar: the gradient logo tile and wordmark, five links, a "Book a scan" pill. Under 900px a round menu button turns into an X and drops a bone card with big links.
2. Hero: a full-height card with the cloth canvas behind a gradient scrim, "LATENT" across the top edge clipped by the card, and at the bottom an eyebrow with a glowing volt dot, the title, a lede, the address; hours, a button and a gradient tile on the right. Pinned for 75% of a screen: the card scales to .86, tilts -2.5deg and sinks while the copy lifts and fades, and each letter of "LATENT" flies off upward on its own path. Before that, the letters rise in and rock gently.
3. A ticker of mono facts separated by violet stars.
4. Story (bone): the heading split into words that tip in, a rotated weave picture that drops in, a paragraph, three big violet facts (1.8M, 0.4mm, 0).
5. Capsules: pinned and scrolled sideways: an intro, then six 4:5 covers (Shell, Optic, Mesh, Lumen, Sole, Knit) each with generative art, its name as a giant display word at the top edge, a price range and a line; cards sway and rotate and their words drift as they cross the screen (containerAnimation).
6. Fit lab (ink): six services on drawn rules with prices in volt that stamp in, and a parallax torso scan.
7. Statement: a full-screen gradient behind an ink layer in multiply mode with a white "ZERO" knocked out of it; pinned for 160% of a screen, the ink layer scales 9x from the centre of the word until the gradient fills the screen, then a bone card ("Nothing is cut until it's ordered") springs up.
8. Process: a sticky intro beside four stacked sticky cards (Scan, Generate, Cut, Wear); each card shrinks and tilts as the next one slides over it.
9. Releases (violet): five dates with giant day numbers that wipe in, a title, a line and a bone tag. Studio (bone): four people with portrait scans that open from a pill shape. Voices (ink): six bone quote cards in a marquee that eases to a stop on hover and focus. Lookbook: six scattered, rotated pictures at different parallax speeds around a giant "RENDERED" whose letters fall in. FAQ (bone): six details rows with a plus that turns into a minus. Visit (violet): a giant "STEP IN", hours, contacts, a sphere and a glass form that thanks inline and sends nothing. Footer: the gradient wordmark, links and a base row.

THINGS THAT BREAK
- Add a .motion class in the head before first paint unless prefers-reduced-motion, and drop it if GSAP has not loaded after 2.5s; every pin height and the sideways track live behind .motion, so the page still reads top to bottom without scripts.
- The capsule rail's scroll length is the track's overflow (scrollWidth minus innerWidth): write it into a --run variable on every refreshInit and use invalidateOnRefresh, or the pin ends early after a resize.
- The "ZERO" zoom needs its transform-origin measured from the word's real box (a function value), or the screen opens on the wrong spot.
- Process cards stick at the header height plus 30px; the shrink of each card ends exactly at the next card's computed top.
- Split text only after document.fonts.ready, and wrap each hero letter in an inner span so the intro rock and the scrubbed fly-away do not fight over the same transform.
- Run every GSAP setup from a queue, one per task, and only set a section up when it comes within 120% of the viewport, so the first scroll does not stall.

THE FLOOR
One h1, a main, every section with an id. Every generated picture is a role="img" figure with a label and an aria-hidden SVG; the ticker is aria-hidden. The menu uses aria-expanded and swaps its label; Escape closes it. Focus rings on everything; button and link hover states also apply on focus-visible. The form status is a live region. prefers-reduced-motion: no pinning, no marquee, the cloth drawn once. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/latent-ai-fashion-atelier.html",
    bestFor: ["AI-native consumer brands", "fashion and apparel startups", "generative design studios", "made-to-measure and 3D-scanning products"],
    style: ["dark", "iridescent", "generative-svg", "canvas", "scroll-driven", "horizontal-scroll"],
    thumbnail: "/thumbs/latent-ai-fashion-atelier.jpg",
    theme: "dark",
  },
  {
    title: "Rowline Agronomy AI Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A dark-green landing page for a farm AI: a live NDVI scan wipes across a field rendered pixel by pixel, the scanner's lens opens into a dawn landscape with a drone flying in, five agents slide past sideways, and every field, crop map and device is drawn in code",
    prompt: `Build a landing page for Rowline, a fictional agronomy AI ("Every row, read by machine.": it flies, probes and models fields every day, then says where to water, feed and scout; live on 1,240 farms), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Bricolage Grotesque (opsz, wdth 75-100, 200-800) for display at wdth 94-96, Manrope 300-800 for text, Fraunces italic (SOFT 100, WONK 1) for the one emphasised word per heading, Martian Mono (wdth 80) for labels.

DESIGN SYSTEM
Night #0A0E0B with soil #111711, moss #17221A and deep #0E1A14 for dark sections; paper #EEF0E7, bone #E3E5D8 and ink #0D120E for light ones. One lime accent #C3EC6C (#8FC34A darker), wheat #D6B46E, water #7CC4DD, clay #B5653F, amber #F0B35A for warnings. A sage section #B9CF8A and a wheat gradient (#D8BB7A to #C79E55) break the rhythm. Pill buttons whose hover fills with a pressed, inset-shadowed copy of their colour from the centre; links with a hairline that draws across. Radius 4px on cards, pills elsewhere.

THE TERRAIN ENGINE (no image files)
- Hashed value noise with smoothstep, fbm (four octaves, lacunarity 2.03), and per-pixel painters that take (x, y) and write RGB plus an NDVI value in 0-1. Six kinds: patch (a warped grid of fields, each a crop type from its hash: stubble, cereal, bare soil, canola, ploughed, grass, with row texture, hedgerows and a meandering creek), pivot (centre-pivot circles in a road grid, part-harvested wedges, wheel tracks, the pivot arm), orchard (rotated tree rows with lit crowns, cast shadows and stressed trees going yellow), vine (contoured rows on hills in blocks, some blocks autumn-tinted), paddy (terraces from noise level sets, flooded or green), land (a dawn sky with a sun glow and cloud band over hills, and crop rows converging in perspective with a low-sun rim light), plus scan (a pure NDVI map around a crop's mean, with faint contour lines and a 50px grid).
- An NDVI ramp of seven stops from rust #60241C through orange and yellow to green #125C34. Painting a field with an NDVI sibling canvas fills both at once.
- One global paint queue: each job fills ImageData row by row until 14ms pass, puts the finished rows, and continues next frame; only one canvas paints at a time. Canvases paint lazily when within 120% of the viewport.

STRUCTURE
1. A fixed header (lime logo tile, six links, a "Book a field scan" pill) that blurs after 12px and hides on scroll down; under 1020px a two-line button opens a full-screen menu that wipes down.
2. Hero: copy on the left (live eyebrow with a pulsing dot, the title with "read" in lime italic, the lede, two actions, three facts: 11 d, −23%, 4 cm). On the right a 4:5 scanner card with a rounded top-left corner: the RGB field under its NDVI twin, revealed by a glowing lime bar that wipes left to right over 7s, holds 2.2s and repeats; three detection boxes (N-deficit, water stress in amber, rust risk) appear as the wipe passes them; a grid, corner brackets, a HUD with coordinates and a ticking clock, an NDVI legend, a crosshair lens, and three glass readouts that drift every second.
3. Then, pinned for 170% of a screen: the copy and HUD fade, the lens grows, and a dawn landscape opens as a circle clip-path from the lens's measured centre and radius to the farthest corner while it scales from 1.45 to 1; a small drone SVG flies in from the lower left; "At first light the drones are already up. By breakfast, every plant has a number." rises at the end.
4. About: two "doors" side by side, each with a rounded groove carved into its inner edge and a glowing lime stud; they slide toward each other as you scroll (vertically on wide screens, horizontally on phones).
5. Agents: pinned and scrolled sideways: an intro, then five tall cards (Scout: a CSS radar with a conic sweep and amber pings; Hydra: an SVG droplet over rippling ellipses; Yield: a forecast curve with a dashed projection to "9.4 t/ha"; Root: a soil cross-section with a probe and readings at three depths; Swarm: drones moving round a network on animateMotion). Each visual scales and rotates in as its card enters, using containerAnimation.
6. Crops: a big preview (an NDVI scan canvas with a HUD, the crop name, a note and three glass stats) beside nine crop chips (striped gradient swatches). A chip swaps the name, note and stats and repaints the scan from its seed and mean; ignore stale paints with a token.
7. Process: "From first flight to first decision in 72 hours." with an orchard canvas in a frame rounded at the bottom like a tombstone, a top-down drone with spinning props and a spray cone; four steps (Map, Model, Act, Learn) on a vertical line that draws as you scroll, each with a lime notch that extends.
8. Farms: five field canvases in an offset editorial grid, each unveiling from a centre slit, each with coordinates and an NDVI / RGB toggle that cross-fades the twin canvas.
9. Impact (sage): four outcome bars in recessed tracks that fill and count to 91, 84, 76 and 38%. Kit: three devices drawn in SVG (a soil probe in a cutaway, a weather mast with spinning cups and a solar panel, a docked drone). Reviews: five coloured cards with a recessed slot at the top, as a marquee that pauses on hover and off screen.
10. Pricing (bone): three plans ($6, $19 dark and featured, Quote) whose top rules draw in. Pilot (wheat): nine probe pucks in a dark tray with blinking LEDs, dealt out from a stacked pile in the centre as you scroll. FAQ: a sticky side title and five details rows. Contact: radar rings that scale in behind a glass form that thanks inline and sends nothing. Footer: a giant embossed "Rowline" sized to the width, four columns and a base row.

THINGS THAT BREAK
- Paint at a fixed pixel budget per canvas (500-1280px wide) and let CSS scale it; painting at device resolution freezes the page. Never paint two canvases in the same frame.
- Measure the hero's clip circle from the lens's real box on every refresh (function values, invalidateOnRefresh), or the landscape opens from the wrong place after a resize.
- The agents track pins for exactly its overflow: end '+=' (scrollWidth − section width), recomputed on refresh. On phones, cap card widths in vw so the track is not a mile long.
- Add a .motion class in the head before first paint unless prefers-reduced-motion, and drop it if GSAP has not loaded after 2.5s; the pinned hero overlay and the sideways track live behind .motion, so the page still reads top to bottom without scripts.
- Split headings only after document.fonts.ready, with autoSplit so lines re-split on resize.
- Run the GSAP setups from a queue, one per task, so the first scroll does not stall.

THE FLOOR
One h1, a main, every section with an id. The scanner has role="img" and a label; decorative canvases and SVGs are aria-hidden. Chips and the menu use aria-pressed and aria-expanded; the form status is a live region. prefers-reduced-motion: no pinning or marquee, the scan sits at 60%, no animation at all. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/rowline-agronomy-ai.html",
    bestFor: ["agtech and climate-tech startups", "AI products with sensors or hardware", "drone, mapping and geospatial companies", "B2B tools sold to operators in the field"],
    style: ["dark", "procedural-art", "canvas", "scroll-driven", "horizontal-scroll", "green"],
    thumbnail: "/thumbs/rowline-agronomy-ai.jpg",
    theme: "dark",
  },
  {
    title: "Corvane Capital Private Equity Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A quiet-money private equity page on a ruled four-column grid: a giant serif \"Compounding\" beside a window of live ridgelines that opens to full bleed as you scroll, a champagne principles field that fans six strokes into line, and a track record that flips between gross and net",
    prompt: `Build a landing page for Corvane Capital, a fictional New York private equity firm that partners with founder-led software companies ($8.4B under management, 47 platforms since 2012, Fund IV of $2.8B now investing), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Instrument Serif (with italic) for display, Inter Tight 300-600 for text, JetBrains Mono 400-500 for labels.

DESIGN SYSTEM
Near-black ink #0A0B0D with a raised #111317, ivory paper #EEEAE1 and a warmer bone #E3DDD1, gold #C6A15B with a highlight #E6CC93, a champagne field #BFA06A, muted grey #7F838A. Each section declares data-tone (dark, ivory, bone or gold), and the tone re-points three variables: the rule colour, the soft text colour and the accent. Instrument Serif 400 at -0.035em tracking and line-height .84 for the giants; h2s end on an italic, gold (or ink-gold on paper) phrase. Mono labels at 11px, uppercase, wide tracking. Radius 2px everywhere. A 6% SVG film grain fixed over the page.

THE RULED GRID
Every section is a .sheet that draws its own ruled field: a ::before inset by the page gutter with 1px vertical rules at 0, 25, 50, 75 and 100% (0, 50 and 100% under 760px). Content sits on a matching four-column grid (two columns on phones) with an inner cell padding, so every heading, figure and paragraph starts on a rule. The header is a strip of the same grid.

PICTURES IN CODE (no image files)
- Strategy: five SVG plates at 400 × 260 on #0E1013 with a faint grid and two mono corner labels: a stack of six floating isometric layers (the top one gold) for vertical software, a jittered 9 × 5 node network with gold dashes running along random edges for infrastructure, six dashed rings turning at different speeds with a radar sweep and a hexagon for security, seven settlement curves funnelling through a gold node with dots riding them (animateMotion) for financial rails, and a pulsing dot field under a gold signal line for data and AI.
- About: a 600 × 380 chart, platform revenue index (1.19^t) against a dimmer public SaaS index (1.088^t) over seven years, the gold line drawing in and the area fading in when it enters view, an "ENTRY 1.0x" and a "PLATFORM 3.3x" callout.
- Team: eight portraits drawn from the name: a seeded PRNG (mulberry32 seeded by an FNV hash of the name) jitters a dark silhouette (head, ears, neck, shoulders, faint lapels) on a gold radial glow with scanlines and five orbit arcs (one gold, ending in a dot) that turn on hover; the first name picks a hair shape (long, bob, bun, crop, short).
- Offices: five tiles: a rotated street grid with a gold avenue (New York), concentric bay ellipses (San Francisco), scattered island circles (Stockholm), bent meridians with a gold prime meridian (London), a dot field swelling at the centre (Singapore), each with its city, latitude and a live clock for that time zone (Intl.DateTimeFormat, every second).
- Portfolio glyphs (one of four marks, seeded by company name) and three insight thumbnails (a compounding bar chart, nested frames, scattered circles).
- Hero: a canvas of 46 ridgelines, each a row of summed sines lifted by a Gaussian envelope centred on the window, filled with ink beneath so nearer ridges hide farther ones, every eleventh line gold; it animates only while the hero is visible, at DPR at most 1.75.

STRUCTURE
1. A fixed header: the mark (three bars, one gold; they fan to an asterisk and back on a loop), "Corvane", a three-line mono tagline, six links, "LP portal" and a gold Contact block; under 900px a plus button opens a full-screen menu. The header recolours to the tone of the section under it.
2. Hero: a giant "Compounding" with a gold italic d, three mono stats (AUM, platforms, since), the ridgeline window in the right column with HUD corners ("Fund IV — investing", coordinates), the lede and two actions, and a "$2.8B" Fund IV figure.
3. About: "Operators first. Investors by discipline." with the chart and a row of four counting facts (14 years, $8.4B, 47, 3.1x) under rules that draw in.
4. Strategy: "Five theses, one discipline"; on wide screens a sticky stage on the left shows the plate for the thesis in the middle of the viewport, each new plate wiping in from below (or above when scrolling up) with a 01 / 05 counter; on narrow screens each plate sits in its row.
5. Principles: a champagne field that grows from one grid cell to the full screen, then pins. A mark of six strokes starts as a fan; per principle one stroke swings upright into a row, the previous principle clips up and out, the next rises in, and a progress bar fills.
6. Process: "The first hundred days", four steps on a line that fills as you scroll, each node lighting as it passes.
7. People (eight portraits that open like a shutter, staggered by column), Portfolio (a pull quote whose words brighten as you read and a marquee of seven companies that pauses on hover and focus and off screen), Offices (a collage moving at five parallax depths), Coverage (six huge sector names drifting left and right in alternation), Criteria (four bars that fill to their value with mono figures).
8. Track record: four funds in a ledger with a Gross / Net switch that swaps every IRR and multiple from data attributes with a rise; rows open from below one after another; a plain-words disclaimer that the figures are illustrative.
9. FAQ (details elements whose top rules draw in), Insights (three posts with wiping thumbnails), Contact: "Every lasting partnership starts with a conversation." with details and a form (I am a founder / LP / advisor, name, email, company, ARR, message) that thanks inline and sends nothing.
10. Footer: a lead line, three link columns, a back-to-top button, then a giant "Corvane" wordmark sized to the full width whose letters rise from random depths as it scrolls in while the mark's strokes fall into line, and a base row noting the firm is fictional.

THINGS THAT BREAK
- The hero is one pinned stage: measure the window's box inside the pin, clip the full-bleed stage to that box, and scrub the clip-path to inset(0) over the first 62% while the topo's centre, spread and amplitude ease from the window's geometry to full-screen values. Recompute on refresh (onRefreshInit, function values) or a resize leaves the clip at stale pixels.
- Size the giants from their container: container-type inline-size and font-size min(100cqi / (--len × .47), 36svh), with --len the character count; the footer word subtracts its padding and the mark's width.
- Add a .motion class in the head before first paint unless prefers-reduced-motion, and drop it if GSAP has not arrived after 2.5s. Pinned hero and principles and the sticky strategy stage live behind .motion and an .is-live class set by script, so the page still reads as plain sections without GSAP.
- Run SplitText after document.fonts.ready and revert line splits when they finish, or the lines break wrongly after a resize.
- Queue every ScrollTrigger setup and spread the queue across frames (8ms budget), then refresh once.
- The marquee clones its cards until the track overflows by one full span; mark the clones aria-hidden.

THE FLOOR
One h1, a main, every section with an id. The menu button has aria-expanded and a swapping label; Escape closes it. The gross / net switch is a group of buttons with aria-pressed. Decorative SVGs and the canvas are aria-hidden. A custom difference-blend cursor only on fine pointers. prefers-reduced-motion: no pinning, no marquee, no topo animation, no cursor. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/corvane-capital.html",
    bestFor: ["private equity and venture firms", "investment and wealth managers", "family offices and holding companies", "B2B firms that sell on trust"],
    style: ["dark", "editorial", "serif", "ruled-grid", "scroll-driven", "gold"],
    thumbnail: "/thumbs/corvane-capital.jpg",
    theme: "dark",
  },
  {
    title: "Agentic Art Expo Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An editorial event page for an expo where AI agents exhibit: a giant wordmark that flies into the header, a satin hero with live particle trails, a programme that floods dark from a full stop, and every picture painted in code",
    prompt: `Build a landing page for Agentic® Art Expo, a fictional five-day exhibition in Rotterdam where autonomous AI agents make, critique and sell original work live (14-18 April 2027, 212 agents, a former harbour warehouse), as one HTML file. GSAP 3.13 with ScrollTrigger and Lenis 1.3.4, all from jsdelivr. Google Fonts: Host Grotesk 400-700, Instrument Serif (italic, one or two words per heading), JetBrains Mono 400-500 for labels. No image files: every picture on the page is painted on a canvas by a small generative engine in the page.

DESIGN SYSTEM
Warm paper #EBE6DC with a lighter surface #F7F4EE, ink #0D0C0B, a near-black panel #0B0A09 with text #EFE9DF, one lime accent #D7FF3F and an ember #FF5A2E for hovers. Derive the muted text, hairlines and shades with color-mix in oklab rather than new hexes. Host Grotesk 600 headlines at -0.058em tracking and line-height .88; giant titles end in a round full stop (a .16em dot after the text), and one word per heading switches to Instrument Serif italic. Mono labels at 11.5px, uppercase, +.06em. Radii 30 / 22 / 16 / 10 / pill. Every dark panel sits inset 10px from the viewport edge with 30px corners. Pill buttons hold a small lime dot on the right that scales up 90x on hover to fill the button. Easing cubic-bezier(.7,0,.2,1) everywhere.

THE ART ENGINE
- Each canvas.art reads data-art, data-pal and data-seed. A seeded PRNG (mulberry32) and seeded Perlin noise with fbm and domain warping drive eight kinds: silk (a warped heightfield shaded with wrapped diffuse, a Blinn specular and a grazing sheen), chrome (the same field reflected into a fake studio environment of soft light bars), contour (anti-aliased iso-lines over a hillshade, every fifth line in the accent), orb (a glass sphere refracting its own background, Fresnel rim, two speculars and a caustic on the floor), bust (a featureless polished stone ovoid with marble veins, rim light and a contact shadow), ridge (sound-wave ridgelines with depth fog and one glowing accent row), petal (180 layered rose curves with additive glow) and flow (a flow field of additive light trails).
- Six palettes (night, bone, ember, violet, lime, ash), each a six-stop colour ramp baked into a 256-entry lookup table plus an accent. Finish every canvas with a vignette and a shared 192px grain tile in overlay.
- Raster kinds compute at a fixed pixel budget (100-230k samples) and upscale with high-quality smoothing, so cost does not grow with the screen. Paint lazily: an IntersectionObserver with a 900px margin queues canvases, and a requestAnimationFrame pump paints until 14ms have passed per frame. A ResizeObserver repaints on a real size change. Canvases fade in when painted.
- The hero adds a transparent live layer: about 2,600 particles following a slowly drifting noise field, drawn as additive strokes with a 5% destination-out fade per frame, 4% of them lime. It runs only while on screen and the tab is visible.

STRUCTURE
1. A fixed paper header: the logo (hidden at first), five links, the dates in mono, a small Get tickets button; under 900px a burger opens the links as a dark rounded sheet.
2. Hero: a full-height dark frame (inset 10px, under the header) holding the satin canvas (breathing slowly between scale 1 and 1.08), the particle layer, a top-and-bottom shade and an animated SVG grain. A giant "Agentic®" wordmark across the full width, "Art Expo ’27" right-aligned under it with the year in lime italic, a "Live now · 212 agents in studio" pill with a pulsing dot, four hairline crosshairs, then a three-column bottom row: the h1 (two sentences, the second muted), a numbered list of the four floors, and a director card (a stone-bust portrait, name, a button).
3. Exhibits: a sec-head (a mono tag, the giant title, a muted lede), then a two-column grid of works, the first full width at 21:9. Each card has an "Agent · Name" chip, a canvas, and a name, kind and year row; the name gets an ember dot on hover.
4. About: a portrait beside a large statement whose words fade from 16% to full ink as you scroll past.
5. Programme: a pinned stage where the giant "Programme." title sits on paper, and a dark circle grows from the title's full stop until the whole stage is dark with the same title in light. Below it, an accordion of four floors (each a small canvas, a paragraph and tag pills) and an open-call footer row.
6. Process: the title "Watch them think." pins, splits in half to both edges, and a figure opens from a 2%-wide slot to the full stage behind it, with the second copy of the title in light over the picture. A mono reasoning log ("loom-7 › amplitude too even — reject v41") and a caption fade in at the end. Then four timeline steps on a line that draws as you scroll, each node filling as the line reaches it.
7. Testimonials: a giant title with a 4.9/5 score, then a marquee of review cards with stone-bust avatars that plays only while visible and pauses on hover or focus.
8. Stats: a bento of a tall dark edition card on an orb canvas, a column of three figures and a pull quote, a ring chart (97%), and a bar chart of five days whose heights come from the labels.
9. Venue: five canvases in a scattered collage moving at different parallax speeds behind a sticky centred card.
10. Tickets: a Visitors / Exhibitors switch that swaps every name, line, price and unit from data attributes with a staggered rise; three plans, the middle one dark with a lime badge; the cards unfold from rotateX(-24deg) on entry.
11. Team (four portrait cards that fan in from the centre), Press (rows whose top rules draw left to right), FAQ (a sticky side title, an accordion whose rows wipe in), Journal (three posts with inner parallax).
12. CTA: a dark panel on a satin canvas with "See you there." rising letter by letter, two notes, the director card and an invitation form (name, email, type, message) that thanks inline and never sends anything. Then a footer with four columns, a giant "Agentic®" mark that rises into place, and a bottom row saying the event is fictional and the imagery is generated in code.

THINGS THAT BREAK
- Size both giant marks from their container: container-type inline-size on the parent and font-size calc(100cqw / --len * 2.1), where --len is the character count. "Agentic®" in Host Grotesk 600 measures 3.30em, so 2.1 fills the width; 2.8 looks fine on desktop only because the hero's 53vh cap kicks in first, and on a 390px phone it pushes "Agentic" out of the frame. Cap the hero one at 53vh.
- The wordmark flight: scrub the wordmark's x, y and scale to the header logo's measured position over the hero's first 72vh (at most 600px), switch its colour to ink at 62%, then swap the logo in at 98%. Keep the logo at opacity 0 under .motion and recompute on refresh (invalidateOnRefresh, function values).
- Add a .motion class in the head before first paint unless prefers-reduced-motion is set, and remove it if GSAP has not arrived after 2.5s. Every pinned layout (track heights, sticky stages, the clipped figure) lives behind .motion, so the page still reads as plain flowing sections without the scripts.
- The flood starts from the real full stop: turn the CSS ::after dot into a .stop span at boot, measure its centre relative to the stage, and grow a circle clip-path from its radius to the farthest corner. Clone the light layer into the dark one at boot rather than writing the copy twice.
- The split title needs words wrapped in spans and divided into two halves, a cloned overlay inside the figure, and both halves moved by the same measured distances, or the light and dark copies drift apart.
- The marquee clones its cards for the loop; mark the clones aria-hidden, take their links out of the tab order and run the art engine on them, or the duplicated avatars stay blank.
- Run the ScrollTrigger setups after document.fonts.ready and spread them across frames (a MessageChannel queue with an 8ms budget), so measured positions use the real font and the first scroll does not stall.
- Pause the grain and breathing loops while their section is off screen.

THE FLOOR
One h1 (the hero lede), a main, every section with an id. Accordions use buttons with aria-expanded; the ticket switch uses aria-pressed; decorative canvases are aria-hidden and the meaningful ones get role="img" with a label. prefers-reduced-motion: no particles, no grain or pulse, no pinned scenes, every section static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/agentic-art-expo.html",
    bestFor: ["AI art and creative-tech events", "exhibitions, fairs and festivals", "galleries and cultural venues", "conferences with ticket tiers"],
    style: ["dark", "editorial", "generative-art", "canvas", "scroll-driven", "grain"],
    thumbnail: "/thumbs/agentic-art-expo.jpg",
    theme: "dark",
  },
  {
    title: "GEO/LAB Planetary Geography Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A cyan-on-black instrument page for a geography lab: live contour lines drift across the hero while a reticle and HUD read elevation, slope and a terrain profile under your cursor, then eight elevation bands separate in 3D as you scroll",
    prompt: `Build a landing page for GEO/LAB, a fictional planetary geography laboratory ("Read the planet like a contour.": it turns elevation, strata and orbital telemetry into living, instrument-grade terrain models), as one HTML file. No libraries. Google Fonts: Instrument Serif (with italic) for headlines and big numbers, Inter Tight 300-600 for text, JetBrains Mono 300-500 for every label.

DESIGN SYSTEM
A game-style FUI map. Near-black field #010507 (with #030c10 and #061419 steps), one instrument cyan #00E3FF (teal #28F9EB, mint #4EFFE3, ice #9EFFF3 and sky #22C2DD steps), amber #DDA322 for datums, waypoints and targets, alert red #FF2C00 and ember #FF571D for hazards, text #E4FAFD with two dimmer greys, and hairlines of cyan at 22%, 10% and 5%. A film-grain overlay and a vignette over everything. Headlines in Instrument Serif with one italic cyan word that glows; mono caps labels at .14em; corner-bracket frames on panels; buttons with two clipped corners (clip-path), solid cyan or a ghost with an inset cyan line.

SECTIONS
1. boot: a full-screen loader with a cyan bar, a percentage and four log lines ("INITIALISING DATUM…" to "SURVEY 976 READY") that waits for the fonts, then fades and starts the hero's line reveal.
2. nav: fixed, frosting after 30px; a contour-ring logo with an amber dot, four "/ " mono links, a live UTC clock and a "Request access" button.
3. hero: a full-screen canvas of drifting contours: seeded Perlin fbm terrain with a massif behind the HUD, turned into 22 isolines by marching squares and redrawn at ~30fps as the field drifts, every fourth line brighter and a dashed amber datum. A dot grid, a left shade for the copy, a scanning band and two tick rails whose markers follow the pointer. The pointer gets a spinning reticle with its elevation and coordinates and a brighter lens of contours around it. A frosted HUD (top right) reads elevation at cursor in big serif, an elevation profile through that row with an amber cursor line, latitude, longitude, slope (turning to "Slope alert" in red on steep ground), and a 24-bar band histogram. Three diamond waypoints (two amber, one blinking red hazard) show their live elevations. Copy: the three-line h1 rising line by line, a lede, "Begin a survey" and "View instruments".
4. ticker: a marquee of peaks and deeps with their elevations (negatives in sky blue).
5. instruments: a 4-column ruled grid (2 on tablets, 1 on phones) of instrument cards (Contour Engine with self-drawing contours, Strata Scanner with floating stacked plates, Orbital Survey with orbiting dots, Hazard Lock with a pulsing red target), each with an ID, a status light (online, tracking, alert), a serif title, copy and a spec line; a cyan top line grows on hover.
6. strata (340vh, sticky): eight canvas-drawn elevation bands of an island (each filled where the terrain is above its threshold, with an edge line, inner contours, a dot grid and corner ticks; the summit band in amber) stacked in CSS 3D (rotateX 58°, rotateZ −36°). Scrolling eases them apart up to 58px each, lights them band by band with the matching rows of a TER 01-08 list, and counts a "band separation" readout; a progress line runs along the bottom.
7. orbital: a list of four bodies (click or Enter to target) beside an SVG solar map: a tick ring with degree labels, a dashed rotating ring, a radar sweep, dotted orbits, four bodies, two red ships on tilted ellipses pointing along their paths, and an amber "TARGET LOCK" reticle and line that follow the selected body with its distance in AU.
8. metrics: four ruled figures counting up (148 M KM² modelled, 0.12 M vertical RMSE, 8 bands, 90 S hazard latency) each with a small sparkline.
9. protocol: four steps (Acquire, Stratify, Model, Publish) on a dashed line, with bracketed number nodes and an output line.
10. pricing: three survey classes (Field $0, Survey $49 per seat as the recommended cyan card, Planetary custom).
11. cta: a dimmer contour canvas behind "Every map starts with a coordinate." and an email form that validates and answers in mono ("Coordinate logged…" or "Coordinate rejected…").
12. footer: logo, blurb, three link columns, a huge outlined GEO/lab wordmark and a coordinate bar.

THINGS THAT BREAK
- Marching squares: interpolate each crossing along its edge and handle the two saddle cases (5 and 10) with two segments, or lines break at every saddle.
- Only compute and draw the hero and CTA canvases while they are on screen (IntersectionObserver), cap the frame rate, and use a coarser grid on narrow screens.
- Size the canvases by devicePixelRatio (capped at 2) and rebuild the strata and canvases on resize, debounced.
- Keep the strata labels counter-rotated so they read flat, and hide them on phones.

THE FLOOR
One h1, a main, aria-hidden canvases, the ticker and the boot screen, an aria-label on the HUD and the orbital SVG, keyboard-selectable bodies, a labelled email field. prefers-reduced-motion skips the drift, the scan and the boot animation (the map redraws only under the pointer). No horizontal scroll at 390px; the HUD and waypoints hide on small screens.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/geolab-planetary-geography.html",
    bestFor: ["geospatial, mapping and earth-observation products", "scientific instruments and labs", "climate and hazard monitoring", "data-heavy deep-tech launches"],
    style: ["dark", "fui", "hud", "canvas", "generative", "scroll-driven"],
    thumbnail: "/thumbs/geolab-planetary-geography.jpg",
    theme: "dark",
  },
  {
    title: "Tessel AI Infrastructure Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A pinned isometric journey for an AI infrastructure platform: a pixel-art engineer walks a glowing route past six code-drawn scenes, from blueprint table to rocket launch, as chapter cards and a rail follow the scroll",
    prompt: `Build a landing page for Tessel, a fictional AI infrastructure platform ("From blueprint to liftoff.": architect clusters, train at scale, evaluate and deploy globally from one spec), as one HTML file. No libraries. Google Fonts: Inter Tight 400-600 only; a system monospace for code. No images: every illustration is SVG generated by the script.

DESIGN SYSTEM
Soft periwinkle daylight. Paper #DCE2F2 (with a radial white bloom and a periwinkle glow under it), a faint white isometric diamond grid masked to the middle, and a 5% multiply grain. Navy ink #1F2348 with #454B7C and #6D75A6 steps, navy blocks #33376A, periwinkle #8A98DA, one gold accent #F0B856 (glows, orbs, routes, primary buttons) and a green #3FA57A for live states. Inter Tight 500 headlines at -0.05em tracking with line-height .86 and the last words in 42% ink. Frosted white cards (blur 18px, a white inner top edge, a long navy shadow), pill buttons (navy, gold gradient, ghost, outline) whose arrows slide on hover, small rounded chips with a gold diamond.

THE WORLD (one SVG, 7900 × 1000 units, scaled to the viewport height)
- An isometric toolkit: P(x, y, z) → screen ((x − y)·0.866, (x + y)·0.5 − z); box() draws three faces filled with generated gradients (top lit diagonally, the left and right darker), white bevel lines on the front edges, a dark line at the base and a blurred contact shadow; matrices map flat SVG onto floors and walls (screens, keyboards, labels).
- Every scene sits on a white platform with a recessed gridded deck, corner screws, an accent light strip round two sides and a faint ghost slab far below, and a big outlined number with a title and subtitle written flat on the floor beside it.
- Scenes: a hero stack (three floating slabs, the navy one with a flowing gold border, a gold orb with a light beam and pulse rings); Architect (a navy blueprint on rollers with linked nodes and blinking LEDs, a stopwatch, a gold ruler, a floating glass spec card); Train (a white compute cube with typing code on one wall and a loss curve on the other, a pedestal with a gold orb, server tray stacks with blinking LEDs, a spinning gear, a coin flipping); Evaluate (two tablets with growing bars, A and B badges, a green PASS tag, a magnifier scanning); Deploy (a launch pad with a rocket, smoke puffs, a monitor and a plant); Scale (a 3 × 3 grid of server towers with glowing tops and flowing links, an orbiting satellite on an ellipse, three region pills with latencies); and a gold finish tile with a waving flag.
- A route of white dots joins the scenes with curves; a gold stroke fills it as you progress, and four glowing sparks travel it on animateMotion. A far layer of pale floating slabs and motes moves at 42% for parallax.
- The guide: a 16 × 24 pixel-art engineer drawn from strings of palette letters (crispEdges rects), with a facing-front frame that blinks and three side walk frames; a pixel speech bubble says "Pick me up — scroll ↓".

THE SCROLL STORY
- #story is tall (about 85vh per beat) with a sticky 100svh stage. Build a timeline of seven dwells (one per scene, a little longer on Deploy and the finale) separated by moves.
- Each frame, ease the drawn progress toward the scroll (8.5% a frame). In a dwell the guide stands on the scene; in a move he walks the route (getPointAtLength with an ease in-out cubic), flips to face the way he walks and cycles the walk frames by distance.
- The camera pans so the guide sits 60% across (centred on phones), clamped to the world. The rocket launches through the Deploy dwell (a cubic rise of 1100 units, the flame stretching, the smoke swelling and fading). The hero stack fades as you leave the start.
- Seven chapter cards on the left (a white scrim keeps them legible) swap with a blur-up stagger: the hero with an h1 and two buttons; Architect with a typed YAML spec; Train with a live utilisation sparkline and three stats; Evaluate with paired bars that fill (v2 periwinkle, v3 gold) and a gates-passed line; Deploy with a terminal; Scale with live region rows; Build with an email form that thanks inline.
- A frosted rail of seven chapter tabs at the bottom (numbers only on phones) with a gold progress line; nav links, the rail, the arrow keys and horizontal trackpad swipes all jump to a chapter with a smooth scroll. A "Scroll to walk" hint fades after the start.
- After the story, a dark navy band with a big closing line, two buttons and a four-column footer.

THINGS THAT BREAK
- Measure each route segment with getTotalLength once and drive the fill with stroke-dashoffset.
- Swap the sprite frames by toggling display on prebuilt groups; rebuilding the pixels every frame is slow.
- Recompute the scale, the world's top and the story height on resize, and keep the stage height in svh so phone toolbars do not jump it.
- On phones the cards sit in the lower half under a bottom-up scrim and the world sits above them.

THE FLOOR
One h1 (the hero card), a main, the world SVGs aria-hidden, a labelled rail with aria-selected, a labelled email field. prefers-reduced-motion stops every loop and transition and snaps the progress. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/tessel-ai-infrastructure.html",
    bestFor: ["AI infrastructure and MLOps platforms", "developer tools with a step-by-step story", "cloud and compute products", "scroll-driven product tours"],
    style: ["light", "isometric", "pixel-art", "svg", "scroll-driven", "interactive"],
    thumbnail: "/thumbs/tessel-ai-infrastructure.jpg",
    theme: "light",
  },
  {
    title: "Hearthly AI Home Care Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A warm, illustrated page for an AI home assistant: a floating collage of glossy home-system cards that floods open into a night scene of the house, stacking service folders, arched system plates and a word-lit testimonial",
    prompt: `Build a landing page for Hearthly, a fictional AI home assistant ("Your home, quietly looked after": it watches a home's water, heat, power, air and safety, explains problems in plain English and books vetted local pros at fixed prices), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Instrument Sans 400-700 and Instrument Serif (italic, for one word per heading and the signatures). No images: every picture is inline SVG drawn in code.

DESIGN SYSTEM
Warm editorial. Paper #f6f2ea, ink #14130f, deep pine #0f1714, five tones (ember #e8693c, sage #b9d3b0, amber #f2b544, sky #9cc6dc, pine #1f4d43) and a highlighter yellow #f1dd9a that sweeps under links, signatures and the email on hover. Bold Instrument Sans headings with tight tracking and one serif-italic word. A paper grain over everything. Cards often have a folder tab cut into their top edge (clip-path shape() with an arc and a curve, falling back to plain radii). Buttons are ink pills that fill amber from below on hover with a diagonal arrow; icon buttons fill ink in a growing circle.

THE ILLUSTRATIONS (one SVG sprite of symbols)
Glossy, softly lit 3D-style objects on radial-gradient backgrounds with a top highlight, a bottom shadow and grain: an isometric house with a lit window, solar panel, tree and pulsing status light; a brushed-metal smart thermostat reading 68° HEATING with a glowing tick arc; a water drop over ripples; a wall EV charger with a charging ring; a leaf with a dew drop; a security camera with a lens and glowing ring; a chrome wrench; a mesh air purifier; and the Hearthly AI orb (an amber-to-ember sphere with an iridescent ring). Plus a full night scene (a modern house with warm glass walls, slatted timber, a lit pool, trees, a moon and noise clouds) and four illustrated team portraits.

SECTIONS
1. nav: fixed and frosted; logo, five links, search and account icons and a "Get the app" outline pill; it hides on scroll down; under 1000px a burger opens a full-width menu.
2. hero (pinned for about a screen and a half): "Your home, quietly looked after" centred, a spinning circular text badge with a play button on the left, two avatars and a plus on the right, and a five-column collage of tall, floating cards below: the thermostat, a "Filter swap booked" chip card, the house with "All systems healthy", the orb card with a dotted burst above it and an "Explore services" button, the water drop with "Slow leak found", the camera, and a "Saved $46 this month" chip card. Scrolling floods the orb card open (a clip-path inset from its measured box to the full screen) into the night scene while the other columns fly outward and the headline lifts away; then "It notices the drip before the ceiling does. Then it books the plumber." rises in.
3. intro: a short quote with a highlighted signature, and a feature link (38 home services covered).
4. services: four sticky folder cards in the tones (Repairs & Fixes, Seasonal Care, Smart Monitoring, Upgrades & Projects) whose tabs step across the width and stack as you scroll, the one underneath shrinking and dimming; each has a lead, a big number, a button and an illustration with a glass UI card (a diagnosis, an autumn plan, an overnight leak shut-off, three quotes with a rebate).
5. systems: five tall plates in an arch (Heat, Air, Power, Water, Safety with checks per day) whose colour washes open down to the caption and whose tabs pop up, centre first.
6. gallery: "Inside a Hearthly home", three drifting columns of illustrated job cards with a room chip and "Saved $…" captions.
7. process: "From first ping to fixed in 48 hours" with a dark chat mock-up (Hearthly flags a slow water heater, offers a $120 fixed-price flush, the user books it, typing dots), and a four-step rail (Hour 0, 1, 3, 48) whose line fills and dots light as you scroll.
8. stats: two big figures and five horizontal bars by trade that fill on view.
9. team: four illustrated portraits that rise into tabbed frames.
10. testimonials: a big quote that lights word by word on scroll, then a marquee of review cards that pauses on hover and focus.
11. pricing: a Monthly / Yearly toggle and three plans (Essentials $0, Home Plus $14 as the dark card with a "Most homes choose" tab, Concierge $39).
12. faq: five details rows with drawn rules and a plus that turns.
13. contact: "Let your home talk back", the email highlighted on scroll, support details, two buttons, and a tilted phone showing the app (a health score ring, four system tiles, a booked job).
14. footer: a dark panel with an orb, "Give your home a second set of eyes." and app store buttons, then brand, three link columns, a newsletter form, legal links, trust badges and socials.

THINGS THAT BREAK
- Put html.motion on in <head> only when motion is allowed, drop it if GSAP has not loaded in 2.5s, and scope every hidden state under .motion.
- Measure the flood's starting clip from the orb card's real box inside the sticky stage, and invalidate on refresh.
- Size the collage columns from both the width and the viewport height, so it fits one screen.
- Build scroll scenes lazily as they come near; refresh ScrollTrigger once fonts and the page have loaded.
- Clone the marquee's reviews for the loop, aria-hidden and out of the tab order.

THE FLOOR
One h1, a main, a labelled burger with aria-expanded, role="img" and aria-labels on meaningful illustrations, aria-pressed on the billing toggle, a labelled email field with a live message. With motion reduced the page is complete and static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/hearthly-home-care.html",
    bestFor: ["smart home and proptech products", "consumer AI assistants", "home services marketplaces", "warm, friendly SaaS launches"],
    style: ["light", "illustrated", "svg", "gsap", "scroll-driven", "editorial"],
    thumbnail: "/thumbs/hearthly-home-care.jpg",
    theme: "light",
  },
  {
    title: "NOTA Wearable AI Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A quiet-luxury catalogue for a titanium AI wearable: a live device you can use in the hero (hold to ask, turn the crown, flip the mic switch), close-ups that are clones of it, a seven-segment privacy ledger and a technical drawing",
    prompt: `Build a product page for NOTA One, a fictional titanium AI wearable worn on a cord ("Remembers what you heard. Forgets when you ask it to."; it listens only while you hold a key, runs its model on the device and has a hardware mic switch), as one HTML file. No libraries. Google Fonts: Archivo with the width axis (wdth 62-125, wght 200-900) for display, Instrument Sans 400-600 for text, JetBrains Mono 400-700 for labels, and Noto Sans JP subset to the few Japanese characters used.

DESIGN SYSTEM
A quiet luxury catalogue: bead-blasted titanium bands (grey #C0BFBD with lighter and darker steps, ink #2A2928) alternate with sapphire-covered LCD glass bands (#171717 to #232323, text #F2F0EC). One signal orange #FF5B34 (with deep and light steps) for LEDs, the crown and the primary button, plus pink #EC2B63 and cyan #60B3DD for LED states. Archivo headlines at 600 with -0.035em tracking and a light grey second clause; mono uppercase labels; a multiply grain over everything. Buttons are hardware keys: a dark key in a black well, or an orange key with a glossy top. Safe-area aware gutters.

THE DEVICE (one live unit, every size in container units of the device)
A rounded-square titanium body with brushed texture, a bail and loop for the cord, four Torx screws, an orange mic switch on the top edge, a privacy LED, and a sapphire LCD: a battery and MIC icon, four mode cards (L R T Q), four seven-segment digits drawn as SVG polygons with a blinking colon, the mode word (LISTEN), a status line, a four-quadrant pie and four level matrices, over a canvas of faint sine waves. Under the screen: four mode LEDs (Listen, Recall, Translate, Quiet), a speaker grille, the ASK key in a machined well, and an orange knurled crown with an indicator. A foot with ノータ in orange and a serial. A soft sheen follows the pointer and the unit tilts slightly in 3D.
- Hold ASK (pointer, Space or Enter): the mic opens with a two-note chime, the LED turns orange (blue in Translate), the digits count seconds, the sine waves grow, the matrices bounce. Let go: it thinks (the pie cycles), then types a canned answer into a readout under the device with a blinking caret and a chime, and returns to idle. Saving a note turns the LED pink.
- The crown has four detents (drag, click to advance, arrow keys, wheel) and ticks; Quiet disables the key.
- The mic switch (or M) cuts the mics: the LED goes dark, the word reads MIC OFF, the key buzzes.
- It boots once: all segments lit (8888), every LED on, then settles to the clock.
- Sounds are tiny WebAudio oscillator blips, started on the first interaction.

SECTIONS
1. nav: sticky frosted titanium bar with the NOTA logo and an orange dot, four mono links and a "Reserve · $899" key.
2. hero: eyebrow, the two-clause headline, a lede and two buttons, then a dark studio panel with a faint grid holding the device hanging from a drawn cord, the readout, keyboard hints, and six callouts (Mic switch, Sapphire display, Microphone array, Privacy light, Mode crown, Titanium body) joined to the exact parts by measured leader lines (hidden under 1080px).
3. stats: a six-cell ruled strip (31 g, 3B on-device model, 0 bytes sent by default, 18 h, 38 mm, IP68).
4. how-it-works: three titanium cards (Hold the key with a key that keeps pressing itself, Say it plainly with a level meter, Read or listen with an LCD answer).
5. anatomy (dark): four close-ups, each a live clone of the device zoomed onto one part (crown, key, display, mic switch) with a code tag, copy and a small spec list.
6. privacy (dark): a ledger panel of three big seven-segment counters (words heard while the key was held, ticking up while you hold it; notes; 0 bytes sent), then "The light tells everyone what it's doing." and a legend of LED states (off, white, orange pulsing, pink, cyan).
7. modes: four small LCD screens, one per crown position, each animated (a rippling dot field, a grid of lit days, a Japanese line translating into English, a breathing dot).
8. build: a sticky technical drawing (the rear case with an embossed name, a Qi2 coil, an etched serial, Torx screws and lettered markers; the side profile with the switch and crown; dimension lines; a lettered legend) beside "Machined titanium and sapphire glass." and four facts.
9. specs (dark): a two-column technical sheet.
10. order: $899 and what's in the box on the left; three crown finishes (Signal orange, Chalk white, Graphite) as knob buttons on the right that recolour the crown on the live device and its close-ups, and a reserve button that answers inline (it is a concept page).
11. footer: a dark mono line.

THINGS THAT BREAK
- Size every part of the device in cqw so it scales as one object; px values break it at other widths.
- Make the close-ups by cloning the live device after its boot, drop the clone's canvas, make it inert and aria-hidden, scale it and centre the target part by measuring it; re-measure on resize and after fonts load.
- Measure the leader lines with the device's 3D tilt switched off, then restore it.
- Start the AudioContext only from a user gesture.
- Space must not scroll the page while it is held as the ASK key, except inside other controls.

THE FLOOR
One h1, a main, labelled ASK and mic switch buttons with aria-pressed, the crown as role="slider" with aria-valuetext, an aria-live readout, aria-hidden decorative LCD parts. prefers-reduced-motion stops the animations and skips the boot. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/nota-wearable.html",
    bestFor: ["hardware and wearable launches", "AI devices and gadgets", "premium product catalogues", "privacy-first products"],
    style: ["light", "skeuomorphic", "interactive", "hardware", "editorial", "svg"],
    thumbnail: "/thumbs/nota-wearable.jpg",
    theme: "light",
  },
  {
    title: "Mirai AI Companion Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A purple, mint and charcoal page for an AI companion: an illustrated character peeks over giant type between clouds, follows your cursor with her eyes, blinks, perks up when you come close and frowns when you poke her",
    prompt: `Build a landing page for Mirai, a fictional AI companion app ("The AI companion that actually listens": it remembers what matters, checks in and keeps conversations private), as one HTML file. No libraries. Google Fonts: Sora 300-800 and JetBrains Mono 400/600. No images: the character and every illustration are inline SVG and CSS gradients.

DESIGN SYSTEM
Flat, bold and friendly. Purple #b914f0 with a deeper #8814ad for big background circles, charcoal #1f2525 (with #182020 and #2a3232 steps) for the page and the cloud shapes, and one mint accent #66ddc6 for dots, ticks, highlights and the primary button. Sora 700 for headings with tight tracking and the key words in mint; Sora 300 for body; uppercase mono eyebrows with a glowing mint dot. Rounded everything: 22px cards, 28-36px panels, pill buttons that lift on hover.

SECTIONS
1. nav: fixed; MIRAI wordmark, four links (the active one marked by a mint dot, the others underlined in mint on hover) and a white "Let's Talk!" pill that turns mint. It frosts and shrinks after 40px; under 760px a burger opens a floating menu card.
2. hero: one full-screen SVG scene (viewBox 1920 × 1080, sliced to cover): a purple sky with deep-purple circles, MIRAI huge in white Sora 800 across the middle, the character rising between the letters, charcoal clouds made of overlapping circles filling the bottom corners and drifting, clusters of mint bubbles that pop in and float, and two lines of copy ("Hey, I'm your new friend," top left, "The AI companion that actually listens" bottom right). An intro: clouds rise from below, the word lifts, the character slides up with a slight overshoot, the bubbles pop. A scroll cue and a small mono hint ("psst, move closer, she notices. just don't poke her.").
   - The character: a girl drawn in SVG gradients (skin, blush, a black bun of circles, swept hair with strand strokes, one big and one small eye with clipped irises and highlights, brows, a tiny nose and mouth, an earring, a mint top). A rig updates her every frame: eyes follow the pointer (or glance around on their own when idle), she blinks every few seconds (sometimes twice), her head sways and breathes and tilts toward the pointer, she perks up (brows up, pupils wider) when the pointer comes near or the nav CTA is hovered, and when clicked she is annoyed (lids half closed, brows flattened, a quick head shake) for two seconds.
   - Every layer has a parallax depth and shifts with the pointer.
   - Under 760px the SVG reframes its viewBox around the character and scales the word down, and the copy moves into text blocks above and below.
3. ticker: a marquee of feature words in big type, alternating solid white and outlined, separated by mint dots; it pauses on hover.
4. features: "A companion that actually gets you." with filter tabs (All, Conversation, Wellbeing, Privacy) over a 12-column grid of cards: one big Memory card and five smaller ones (Voice with an animated waveform, Check-ins, Privacy with a lock, Journal, Control), each with CSS-gradient art in the palette, a big glyph, a badge, a corner label and a play button that pops on hover.
5. stats: four ruled figures that count up (<300 ms voice response, 40+ languages, 24/7, 0 ads).
6. how-it-works: a purple band with big background circles and four numbered rows (Say hi, It learns your vibe, It remembers, It shows up) that fill charcoal and spin their arrow on hover.
7. demo: a phone-style chat card on the left (avatar, online status, "remembers 214 things about you") playing a looping conversation with typing dots before each reply, and on the right "Feels personal. Stays private." with three mint-checked trust points.
8. pricing: a Monthly / Yearly switch with a sliding knob (−20% tag) and three plans (Hello $0, Plus $9.99 or $7.99 as the purple card with mint dots, Family $19.99 or $15.99) whose prices and notes swap.
9. faq: five details rows whose plus turns into a mint minus.
10. waitlist: a rounded purple panel with circles and floating mint bubbles, "Someone's been waiting to meet you." and a pill email form that confirms inline.
11. footer: wordmark and blurb with four round social buttons, three link columns, MIRAI huge in outlined type and a line saying Mirai is an AI and not a substitute for professional care.

THINGS THAT BREAK
- Map the pointer into SVG coordinates with getScreenCTM().inverse() before comparing it to the face, or the gaze is off at every size but one.
- Rotate the head around the neck (a fixed pivot), scale the irises around their own centres, and clip the irises and lids to the eye whites.
- Ease every rig value toward its target each frame (eye, tilt, near, annoyed, parallax) instead of setting it, so she never snaps.
- Keep the wordmark and copy in the SVG on desktop but move the copy to HTML on phones, where the reframed scene has no room for it.

THE FLOOR
One h1 (visually hidden, the hero is an illustration), a main, an aria-label on the hero SVG, aria-hidden on the ticker and decorative art, a labelled burger and email input. prefers-reduced-motion stops the intro, sway, drift, floats and marquee; the gaze still follows. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 22, 2026",
    demo: "/demos/mirai-ai-companion.html",
    bestFor: ["AI companion and assistant apps", "consumer AI and wellbeing products", "character-led brands and mascots", "playful app launches"],
    style: ["dark", "illustrated", "svg", "character", "playful", "interactive"],
    thumbnail: "/thumbs/mirai-ai-companion.jpg",
    theme: "dark",
  },
  {
    title: "ORVYN Autonomous Car Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI-native grand tourer on a near-black page: a spectrum autonomy dial steps through five levels, unlocking pods as it goes, over a radar, live telemetry and a horizon of light",
    prompt: `Build a landing page for ORVYN ONE, a fictional AI-native grand tourer that unlocks autonomy in five verified stages ("It already knows the road ahead."), as one HTML file. No libraries. Google Fonts: Geist 200-600 (everything, mostly 200-300), Geist Mono 400/500 (labels), Instrument Serif italic (one word per heading).

DESIGN SYSTEM
Near-black (#020203 ground, #0b0b0f panels) with hairline white borders at 7-12%, ink #f3f2f7, mute #8b8a96, dim #55545f, and one five-colour spectrum: cyan #3fe0ff, blue #2f6bff, violet #6a2bff, magenta #ff1f6b, orange #ff4a12. Headings are Geist 300 with -0.04em tracking and one serif-italic word filled with the spectrum gradient. Mono labels are 11px, uppercase, tracked 0.18em. A moving film-grain overlay at 5.5%. The primary button is a dark pill whose 1px border is a conic spectrum spinning around it (an @property --sweep angle animated to 360deg) with a blurred copy glowing behind; the arrow nudges on hover. One out-ease (0.16, 1, 0.3, 1) and one in-out ease (0.7, 0, 0.2, 1).

SECTIONS
1. nav: fixed; logo (a dashed spectrum ring around a triangle) and ORVYN tracked wide, four mono links, a blinking "Fleet online · 41,208" and a Reserve button; it frosts after 20px.
2. hero: copy on the left (a NEW pill, the headline with "ahead." in serif spectrum, a lede, Reserve and a "Watch it drive" play link, and a glass level card: LVL number, a coloured dot, name and description that cross-fade, and five dots that fill up to the current level). On the right, the autonomy dial (below).
3. ticker: a marquee of fleet figures (4.12B autonomous km, 0.003 disengagements per 10k km, 300 m perception, model N-7.4, 22 sensors, 8 ms, 148 cities).
4. autonomy: "Autonomy, unlocked in five stages." A five-part progress bar and five level cards (Assisted, Partial, Conditional, High, Full, each in its own spectrum colour) that light up in turn when scrolled into view: a soft colour bloom, a lock whose shackle swings open, the name, a line and verified km / state.
5. systems: a six-column bento: a big perception card (a radar of rings and ticks with a car glyph at the centre, a rotating conic sweep and four labelled blips that flash as it passes, plus sensor counts), a neural driver card (36 live bars and 2,000 TOPS counting up), an energy card (a 270° tick gauge filling to 86%), a dual-motor card (28 flame bars and 2.9s), and an over-the-air card (three release rows, the newest tagged Tonight). Cards carry a pointer spotlight.
6. manifesto: one huge centred sentence whose words light up one by one as it scrolls through the viewport.
7. specs: a sticky square HUD on the left (tick rings, a spectrum arc that fills to 82%, 305 KM/H · VMAX, a live clock and coordinates in the corners) and a ten-row spec table on the right.
8. reserve: "Your first drive is its thousandth." with a pill email form that confirms inline, then a horizon: a huge spectrum ring rising like a planet edge with a blurred glow, ticks and the five level colours as segments along its rim, fading into the page.
9. footer: brand and three link columns, ORVYN as an outlined spectrum wordmark fading downward, and a status line.

THE DIAL (SVG over CSS rings)
- A square container. A back SVG (viewBox -500..500): five ring segments centred at 0, 30, 60, 90 and 120 degrees between r 322 and 352, labelled LVL 01-05 along the arc, each a button; above each, a lock pod at r 432 whose shackle rotates open and whose ring takes the level's colour once reached; a blurred wedge of the active colour behind the active segment; a slowly spinning dashed ring; a scanner line that enters from the left and stops at the outer ring.
- CSS rings stacked in the middle: a "heat" ring (a conic violet → magenta → orange gradient masked to a thin band, with a blurred copy) and a progress ring (a conic blue → cyan sweep from -135deg to an @property --span angle, chopped into fine ticks with a repeating conic gradient), both radial-masked to bands.
- A front SVG: 150 faint outer ticks, a counter-spinning ring of 180 coloured dots, 96 inner ticks coloured around the circle with a highlight that sweeps round every few seconds, a dark core disc with two pulsing rings, a white needle, and a centre readout (AUTONOMY, the big level number, the level name in its colour) sized in container units.
- setLevel(n): --span = 70 + n × 43 degrees (transitioned 1.5s), needle and wedge rotate, reached segments darken to their colour and the active one fills, pods up to n open, the card and dots update. It autoplays 1 → 5 every 3.4s; a click on a segment, pod or dot sets the level and pauses autoplay for 9s.

THINGS THAT BREAK
- Register --span and --sweep with @property, or the progress ring and button borders jump instead of animating.
- Build the dial's ticks with createElementNS, not innerHTML strings, and keep the rings and SVGs in one square box so they stay concentric.
- Run the shimmer, bars and flames only while they are on screen (IntersectionObserver).

THE FLOOR
One h1, a main, role="group" on the dial with labelled segments that work with Enter and Space, labelled level dots, aria-hidden on decorative SVGs and the ticker, a labelled email input. prefers-reduced-motion stops the grain, spins, shimmer, marquee, autoplay and bars and shows everything revealed. Under 820px the dial sits above the copy at full width; no horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 21, 2026",
    demo: "/demos/orvyn-autonomous-gt.html",
    bestFor: ["automotive and mobility launches", "autonomy, robotics and hardware AI", "deep-tech product reveals", "premium pre-order and reservation pages"],
    style: ["dark", "svg", "spectrum", "dashboard", "interactive", "editorial"],
    thumbnail: "/thumbs/orvyn-autonomous-gt.jpg",
    theme: "dark",
  },
  {
    title: "Myriad Agent Swarm Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An agent-select screen for an AI swarm: pick one of five agents and a 640-point particle swarm reforms into its shape while the whole page recolours to match",
    prompt: `Build a one-screen landing page for Myriad OS, a fictional platform of specialist AI agents that work as one swarm, styled like a game's character-select screen, as one HTML file. No libraries. Google Fonts: Unbounded 300/500/700/800 (display), Space Grotesk 400/500 (body), JetBrains Mono 400/500 (labels).

DESIGN SYSTEM
Deep, glowing and tinted by the selected agent. Five colours are registered with @property (--c1 accent, --c2 light accent, --c3 near-white, --bg1 and --bg2 backgrounds) and :root transitions all five over 1.1s, so switching agent recolours every gradient, border and glow smoothly. Text is --c3 at 72%. Mono labels are uppercase and tracked 0.18-0.3em. Panels are chamfered with clip-path (a cut top-right and bottom-left corner) over a translucent accent gradient with a backdrop blur. A noise overlay and a vignette sit over everything. A custom cursor: a 38px accent ring that trails the pointer and grows over [data-cursor] elements, plus a 4px dot (hidden on touch).

THE AGENTS (data, five of them)
Each has a name, role, topology, model tier, a tagline, a paragraph, three stats (nodes, sync %, latency ms), a theme (c1, c2, c3, bg1, bg2) and four abilities (an icon, a name and a line; the fourth is the ULT). AEGIS the Sentinel (green #14d27c; Policy Gate, Sandbox, Seal, Bastion), AXON the Orchestrator (violet #8b6cff; Fan-out, Consensus, Re-route, Hive Mind), KESTR the Scout (amber #f5a742; Sweep, Deep Scan, Signal Lock, Skyline), LOOM the Synthesist (cyan #2fc6ff; Thread, Stack, Splice, Tapestry), ECHO the Critic (pink #ff4f8d; Replay, Weigh, Red Team, Resonance).

LAYOUT (one 100svh stage, min 740px)
1. nav: a hexagon logo of three linked nodes with MYRIAD tracked wide and a small OS, and a Launch console button.
2. hero, three columns:
   - the visual: a dashed orbit ring and a ring of 90 ticks turning slowly; inside it a circular grid of katakana glyphs, faint, with scattered cells pulsing on staggered nth-child timings and three random cells re-rolling every 140ms; the swarm canvas over it; a HUD bottom right with NODES, SYNC and LATENCY counting up to the agent's stats.
   - the copy: an outlined index number (01) that fills with a gradient, a vertical rule with a travelling glowing dot, the agent's name huge in Unbounded 800 with a gradient fill (scrambling through random characters into place on each switch), the tagline, a chamfered brief (ROLE / TOPOLOGY and the paragraph), four ability tiles keyed Q E C X (the fourth marked ULT) that show the ability's name and line below on hover, focus or click, and a chamfered Deploy <AGENT> button with a light sweep beside a View spec sheet link.
   - the rail: five hexagon buttons, each in its agent's colour with a glyph (a nested hexagon, an atom, a trefoil, a helix, a target), its number and name; the active one glows, scales up and shows a progress bar for the autoplay.
3. status: a bar along the bottom with a pinging dot and a live "12,480 agents online" count that drifts every 1.3s, and prev / 01 / 05 / next.
Switching agent fades the copy out (blur up) and staggers it back in (rise, blur down), recolours the page and reforms the swarm.

THE SWARM (Canvas 2D, additive)
- 640 points (380 under 700px wide). Five formations precomputed as target positions in 3D: an icosahedron's 30 edges plus its vertices (AEGIS), a Fibonacci sphere with two tilted rings (AXON), a trefoil knot (KESTR), a double helix with rungs (LOOM), seven concentric rings that ripple as a wave (ECHO). For each formation compute every point's two nearest neighbours once.
- Each point is a spring toward its target (velocity × 0.86 + offset × a per-point stiffness 0.012-0.04), with a small idle wobble; switching formation kicks every velocity randomly so the swarm bursts and reforms.
- Rotate slowly, tilt with the pointer (eased), project with a simple perspective (FOV 3.2) and scale to the visual's size. Points within 120px of the pointer are pushed away; up to nine beams are drawn from the pointer to nearby points.
- Draw with globalCompositeOperation lighter: a radial core glow, neighbour links (only when the projected link is short), points as cached radial-gradient sprites sized and faded by depth (every 23rd point a brighter hub), and message pulses that travel along links and hop up to six times. Colours ease toward the new theme each frame; rebuild the sprites when they change.

INPUT
Clicking the rail, the prev / next buttons, arrow keys, the mouse wheel (one step per 1.1s, desktop only) or a horizontal swipe on the visual changes agent. Autoplay advances every 9s and pauses while the pointer is over the copy or the rail.

THINGS THAT BREAK
- Register the five colours with @property or the theme jumps instead of transitioning.
- Precompute nearest neighbours per formation at load; doing it per frame is N² every frame.
- Size the glyph matrix from the orbit's measured box on resize, and only rebuild its cells when the column count changes.
- Cap the canvas DPR at 2.

THE FLOOR
One h1 (the agent name), the canvas and decorations aria-hidden, labelled rail buttons, an aria-live line for the selected ability, keyboard navigation. prefers-reduced-motion stops the glyph pulses, orbit spin, scramble, autoplay and pulses, and slows the swarm's rotation. Under 960px the layout stacks (visual, rail as a row, copy); no horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 21, 2026",
    demo: "/demos/myriad-agent-swarm.html",
    bestFor: ["multi-agent and AI platform launches", "AI product or model line-ups", "games and character-select screens", "developer tools with a strong visual identity"],
    style: ["dark", "canvas", "particles", "game-ui", "neon", "interactive"],
    thumbnail: "/thumbs/myriad-agent-swarm.jpg",
    theme: "dark",
  },
  {
    title: "Mirador Observability Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An observability platform in a framed night console: a WebGL ribbon of glowing fibers behind the hero, plates cut out of the frame with inverted corners, stacking feature cards with live trace mockups and a dark/light switch",
    prompt: `Build a landing page for Mirador, a fictional observability platform ("See every signal": traces, metrics and logs in one calm view, so the team finds the cause before customers find the bug), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3.4, all from jsdelivr. Google Fonts: Geist 300-700 (display and text), Geist Mono 400-500, Instrument Serif italic (one emphasised word per heading). No images: every chart, trace, map, portrait and icon is HTML, CSS, inline SVG or WebGL.

DESIGN SYSTEM
A night console in a rounded frame. Tokens: night #0a0912, ink #14122a, paper #f6f5fb and six signal colours (violet #8f80ff, indigo #3b30b8, sky #7cc4ff, amber #f5a54a, mint #4fe3b0, rose #ff6b8a). Role tokens (--bg, --plate, --text, --muted, --line, --mist, --card, --glass, --accent) are redefined under html.light for a paper theme with an indigo accent. The page sits inside a 14px frame with a 40px radius; "plates" in the page colour are cut out of the edges of full-bleed art, and each plate's outside corners are inverted fillets (small radial-gradient pieces painted in --plate) so the plate and the frame read as one surface. Glass cards blur only on large hover screens. Discs (a violet-to-indigo circle with the arch mark) sit in a circular bite masked out of a glass card. Buttons are pills with a round accent dot holding an arrow; on hover the accent floods from the dot as a growing circle and the arrow turns 45deg. Art backgrounds are layered radial "auroras" with a faint star field. Mock windows are dark mono panels with three dots, a title and a live/resolved badge.

SECTIONS
1. nav: fixed and click-through except its controls. A white "Product" pill at the left and "Pricing" at the right; in the middle a tab hanging from the top of the frame with filleted shoulders, holding three dropdown filters (Environment, Region, Time range) whose choice updates the hero card and re-rolls its sparkline and figures. A left rail of round icons (Home, Features, Tour, Book a demo, an avatar, changelog bell, call, and a moon/sun theme pair) that scroll-spies the sections, set into the frame while at the top and floating as a pill after; under 1024px it becomes a bottom dock. The header hides on scroll down and returns on scroll up.
2. hero (pinned): full-bleed night with a WebGL2 ribbon field: three twisting ribbons drawn as thousands of instanced glowing dots with bloom, depth of field, drifting dust, hover focus and a click pulse that runs along the nearest ribbon (skipped without WebGL2). "See every / signal." huge in the middle, a lede, a "Trusted by teams who ship daily" plate cut out of the bottom left (4,200+ teams, three avatars), and a glass checkout-api card at the bottom right (status, a p99 sparkline, three specs, watch/pin/share toggles) with the disc in its bite. Scrolling opens the frame to full bleed and the plates slide away.
3. intro: a big statement that lights word by word, with three inline pill pictures (a heartbeat, a trace, a timeline) that unclip from their centre; a note with a button and three stats whose rules draw in.
4. features: three sticky cards that stack, each a full aurora with a mock window (a trace waterfall of ten spans, a p99/p50 latency chart against an SLO line with a deploy tooltip, an incident timeline), a glass spec list and a filleted plate with the feature name, a line and a price; the card underneath scales down and dims.
5. integrations: four pill rows (Infrastructure, Data stores, Languages, Delivery) with a count and a gradient picture of glyph tiles that unclips from its round end on scroll.
6. gallery: a 12-column bento of dark tiles that drift at different speeds: an animated service map with a pulsing failing node, a live log tail with a cursor, SLO budget bars, a latency heatmap and a query, each with a filleted caption.
7. process (pinned): a radar sweep behind the title and a glass card that steps through four stages (Install one agent, Everything is discovered, Set the goals that matter, Page the right person) while a ring on the disc fills and the card travels across.
8. pricing: a Monthly/Annual segmented switch with a sliding thumb; three plans (Starter $0, Team $29 or $24 as the accent card, Enterprise Custom) whose prices roll when switched.
9. team: four arch-topped portraits drawn in CSS (initials in serif italic over coloured glows and dashed rings), unclipping upward, each with a mail button.
10. reviews: an aurora stage with a 4.9 score and a looping track of glass quote cards that pauses on hover and focus.
11. faq: a sticky side and five exclusive details whose plus turns into an x.
12. security: an aurora that closes in from full bleed, a shield with a mint check, a plate dropping from the top, and two glass facts.
13. contact: a demo form (name, work email, company, team-size chips, a message) and a side panel where a terminal installs the agent, revealed by a circle wipe, with a contact card and the disc.
14. footer: a violet and amber panel with a changelog signup, three link columns, MIRADOR huge in a fading gradient sized from its character count, and a status line.

THINGS THAT BREAK
- The fillets must be painted in exactly --plate; when the theme changes they change with it, or square notches appear.
- Put html.motion on in <head> only when motion is allowed, and take it off if GSAP has not arrived in 2.5s; scope every hidden-until-animated state under .motion.
- The WebGL field must stop rendering off screen and when the tab is hidden, cap its render size, and fall back to the aurora when WebGL2 is missing.
- Build scroll scenes lazily as sections approach, after fonts load, and let one failing scene fail alone.
- The review track clones its cards for the loop; mark the clones aria-hidden and take their links out of the tab order.

THE FLOOR
One h1, one main, a labelled rail nav, listbox filters with aria-expanded and aria-selected, aria-pressed on the theme, billing and card toggles, live form status, aria-hidden on every mock window and canvas. With motion reduced the page is complete and static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 21, 2026",
    demo: "/demos/mirador-observability.html",
    bestFor: ["observability and monitoring tools", "developer platforms and infrastructure", "B2B SaaS dashboards", "data and analytics products"],
    style: ["dark", "webgl", "gsap", "glass", "dashboard", "scroll-driven"],
    thumbnail: "/thumbs/mirador-observability.jpg",
    theme: "dark",
  },
  {
    title: "Side Quest Adoption Center Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A butter-yellow adoption center for ideas you have no time for: a waving page mascot, six illustrated side quests to adopt with confetti, and a lifecycle from spark to archive",
    prompt: `Build a landing page for The Side Quest Adoption Center, a fictional and very unserious "shelter" where developers adopt side-project ideas they have absolutely no time for ("Your next little distraction."), as one HTML file. No libraries. Google Fonts: Gloock (display, one weight) and Schibsted Grotesk 400-800 (text). No images: the mascot, every illustration and every icon is inline SVG.

DESIGN SYSTEM
Soft, sunny and toy-like. Tokens in oklch on the html rule: background a cool off-white (0.97 0.008 220), surface near-white, text a deep navy (0.25 0.035 245) with text-soft, muted, line and line-soft steps, a butter accent (0.9 0.16 98) with a deeper press state, and a lavender violet (0.78 0.12 295). Gloock for every heading at weight 400 with tight tracking; Schibsted Grotesk for everything else; small caps eyebrows tracked 0.16-0.18em with a short rule before them. A 4.5% fractal-noise grain over the whole page. Cards are 20-24px radius, white, hairline borders, a soft shadow that lifts on hover. Illustrations share one hidden <svg> of defs: glossy gradients (cream, a darker "side" for extruded depth, yellow, violet, blue, leaf, peach, a ceramic mug, coffee, a pearl and glass) plus blur and drop-shadow filters, so every drawing is a chunky sticker: navy 3.5px outlines, a stacked-offset side for thickness, a white highlight stroke and four-point sparkles. One out-ease (0.2, 0, 0, 1) and one spring ease for every pop.

SECTIONS
1. nav: sticky; a brand (an eight-spoke asterisk that rotates on hover, "side quest" in Gloock with ADOPTION CENTER tracked under it), a pill nav of five anchors, and a navy "Your side quests" pill with a butter counter that bumps on every adoption. It frosts after 12px; a 3px butter scroll-progress bar sits above it.
2. hero: full-bleed, a vertical gradient from cream to butter, a faint grid fading out, five drifting blurred clouds. A glass "Open for irresponsible decisions" sign with a pinging green dot, then "Your next little / distraction." with each line rising out of a mask and two hand-drawn butter brush strokes drawing in behind "distraction.". A one-line lede, a navy pill CTA with a butter circle arrow and a sheen sweep, and a footnote with four glossy icon avatars ("No experience required. Free time not included."). Below, the mascot: a cream page with a folded corner, stick arms and legs, a squiggly face that blinks, one arm waving, bobbing over a pulsing shadow, circled by a dashed orbit that marches, with a swinging violet "adopt me" tag and a beating heart, sparkles and burst marks. Two tilted chips drift beside it ("Scope: expanding", "Deadline: someday") and a pale horizon curve sits behind. A frosted bar of four items with icons closes the hero (Plants with webhooks, Newsletters for eleven, Cozy games with lore, Personal site, v7).
3. stats: four counters in one bordered strip that count up when seen (6 ideas seeking a home, 90% chance it becomes a repo, 0 shipped, 412 domains renewed out of guilt).
4. ideas: "Looking for a good home." with an availability pill that updates ("5 ideas, zero obligations", "Everyone found a home!"). A segmented filter (All side quests / My adopted ideas with a live count) with a sliding white pill, and a three-column grid of six cards rendered from data: a tinted art panel with an id badge (SQ-001), a temperament tag and a looping illustration (an overengineered to-do clipboard, a plant with a wifi signal and a falling drop, a newsletter envelope with a heart seal, a game controller with blinking buttons, a browser window with a clicking cursor, a judging coffee mug with steam); then the name, a line of copy, a facts box (estimated cost, "Becomes another GitHub repo" percent and a meter that fills) and an Adopt button. Adopting turns it butter with a check ("Adopted! (release idea)"), throws confetti from the button, toasts a line and bumps the counters; releasing toasts too. The illustrations' outlines draw in when the card is revealed, and a butter spotlight follows the cursor over the card. An empty state for the adopted filter.
5. how-it-works: three step cards (Browse, Adopt, Love it, briefly) with an outlined giant number and a chunky icon tile that sits on a hard navy shadow and tilts on hover: a magnifier, a beating heart, a spinning sparkle.
6. lifecycle: a navy band with a butter and violet glow. "From spark to archive, beautifully predictable." Six stages on a line that fills from butter to violet (Hour 1 The spark, Day 1 Domain secured, Day 3 Stack chosen, Week 2 The rewrite, Month 3 "On a break", Year 2 Archived, with love), each a glowing node that pops in turn; below, an "Enthusiasm over time" line that draws itself.
7. testimonials: three invented adopter stories, the first larger on butter, with glossy initial avatars; a small italic note that the stories are made up.
8. pricing: three free plans (Casual Tinkerer $0 / forever, Serial Starter $0 / every time as the raised navy "Most adopted" card, Founder Mode $0* billed in sleep), each with a bobbing glossy icon, a list with butter check badges and a CTA.
9. faq: five questions in details, one open at a time, the plus turning into a butter minus.
10. footer: a big butter panel with a dot field and a glow: "Your weekend called. It's a little nervous." with a violet underline that draws in, a small mascot waving a "see you" tag, sparkles, a CTA, then brand, two link columns, a status column (All ideas operational, Adopted today: n) and a back-to-top link.

THINGS THAT BREAK
- Draw-on paths need pathLength="1" and a dash of 1; set it on the card paths after rendering them, or they show solid.
- Card illustrations are SVG strings injected per render: re-rendering on adopt must not replay the reveal (render those cards already "in") and must put focus back on the same button.
- Animated SVG groups need transform-box: fill-box, or they rotate around the canvas corner.
- The filter pill measures its active button: move it after fonts load and on resize.
- Adoptions live in memory only; say so in the FAQ.

THE FLOOR
One h1, one main, aria-pressed on the adopt buttons and the filter, a polite live toast, aria-hidden on every decorative drawing, a visible focus ring. With motion reduced, every reveal, draw-on and meter is shown finished. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 21, 2026",
    demo: "/demos/side-quest-adoption.html",
    bestFor: ["playful consumer apps", "community and indie maker products", "idea boards and marketplaces", "launch pages with a sense of humour"],
    style: ["light", "playful", "illustrated", "svg", "warm", "interactive"],
    thumbnail: "/thumbs/side-quest-adoption.jpg",
    theme: "light",
  },
  {
    title: "Orrery Reasoning Engine Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI reasoning engine that shows its work: a hero window opens onto a canvas orrery, and every picture on the page is a live rendering drawn in code",
    prompt: `Build a dark-and-light landing page for Orrery, a fictional AI reasoning engine ("the reasoning engine that shows its work": it reads a team's contracts, tickets, code and spreadsheets and answers with the sources behind every claim), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3, all from jsdelivr. Google Fonts: Hubot Sans with the width axis (wdth 100-125, wght 500-700) for display, Instrument Sans 400-700 for text. No images: every picture is a <canvas data-art="..."> drawn by one procedural art engine.

DESIGN SYSTEM
Warm greys with one ember accent. Tokens: ink #111110, night #191816, smoke #2a2926, ash #55574f, haze #a6a9a3, fog #c8cac4, mist #e7e6e1, pearl #f5f4f0, ember #d6b28a, steel #7d8c8b; a fluid gutter (16-64px), max width 1400px, section padding clamp(96px, 12vw, 190px), radii 14 and 24, ease cubic-bezier(.19,1,.22,1). Two SVG noise textures as tokens: --grain (fractal noise through a diffuse light, used as an overlay on dark surfaces) and --frost (the same, turned into a white alpha frost for veils). Each section carries data-tone="dark" or "light", which sets --fg, --fg2, --bg and --line, so components restyle per section. Display type is Hubot Sans 600 uppercase at font-stretch 112-125%; labels are wide-tracked caps (.38em); body is Instrument Sans 17px. Corner brackets (two L-shaped 2px corners, top-right and bottom-left) frame anything important. Buttons fill with ember from the middle out (a clip-path inset that opens) on hover; text links have a 1px underline that a 2px rule sweeps over.

THE ART ENGINE
One script, a seeded PRNG (mulberry32) per canvas from data-seed, a renderer per data-art name in an object F, each returning a draw(ctx, t) closure. Canvases are sized by ResizeObserver at a capped devicePixelRatio (data-dpr), drawn once, then animated only while an IntersectionObserver says they are on screen; with reduced motion they are drawn once at a fixed time. Renderers:
- orrery: deep space with a quarter-resolution painted nebula, three depth layers of twinkling stars and cross-shaped glints, a pulsing sun with corona rays, seven planets on tilted elliptical orbits (shaded spheres with banding, a lit rim, atmosphere glow, comet-soft trails, a ringed planet, moons that pass in front and behind), a dust belt, orbit tick marks, an anamorphic lens streak with ghost flares, collision-aware instrument labels (Reasoning · depth 0.94, Memory · 10M tokens, Verification · 2x sourced) and a vignette; the pointer tilts it slightly.
- deliberate: a search tree growing left to right, a scan front, losing branches crossed out, the winning path committing in gold with "ANSWER conf 0.97".
- memory: tokens streaming into a rotating Fibonacci sphere of points, a scanning latitude, gold arcs linking recalled points, a "RECALL doc 4,812 · p.31" callout.
- agents: a glowing hub with tool tiles (mail, calendar, database, code, chart, doc, chat, card) on an orbit; one tile stops and asks "CONFIRM?" then "APPROVED".
- vision: a chart scanned left to right, its axis, peak, legend and footnote boxed in gold as they are recognised.
- deploy: isometric server racks with blinking LEDs inside a dashed gold perimeter, traffic looping inside, outbound traffic stopped at a lock.
- grid, graph, stream, terrain, rings, lattice: attention heatmap, retrieval graph with travelling pulses, token stream past a cursor, ridgeline terrain with one gold line, verifier rings, a rotating 3D lattice.
- portrait: a scan-line portrait silhouette with a gold band sweeping down.
The premium renderers share a HUD: corner brackets, a caps label top left, a gold status top right and a tick ruler along the bottom.

SECTIONS
1. nav: fixed; the brand (an orbit glyph and ORRERY tracked wide), four links and Request access. It hides on scroll down, returns on scroll up, turns solid (blurred on desktop) after 40px and retints to the tone of the section under it. Under 1080px a full-screen grain menu with huge links.
2. hero (pinned for two screens): a blurred, slightly enlarged copy of the orrery fills the screen (the sharp canvas mirrors itself into it at quarter size), a haze and grain over it, the words THINK and SLOW huge above and below (sized from --len and the space left), and in the middle a sharp window onto the orrery with a glass rim, two corner brackets and two caps lines ("Fast answers are cheap", "Right ones take a moment"). Scrolling opens the window to the full screen (a clip-path inset driven by --open), the words leave up and down, the lines slide out and the brackets travel to the screen corners.
3. brief (light): a large statement whose lines "defog" from blurred to sharp on scroll (SplitText lines), a framed terrain picture, a lede, and a row of five invented customer marks.
4. capabilities (dark): five rows (version, topic, title, text, picture). As you scroll, the row at the middle of the screen is in focus, the others dim and blur, its picture opens from a thin slit, and two corner brackets travel to frame it.
5. process (light): five stages that rise in a staircase, each with a rule that draws, a duration (0.2 s, 1-4 s, up to 8 min, every claim, after), a caps title that wipes in and a line of text.
6. gallery (dark): six live renderings in a horizontal track pinned and scrolled sideways, behind a frosted pane with a rounded window cut out of it (a mask with a hole) and corner brackets on the window; shots scale down away from the centre.
7. results (light): four huge figures rising out of their lines (41%, 10M, 0, 2,300), and four bars of where an answer comes from (your sources 71%, model reasoning 19%, verification 7%, clarifying questions 3%) that grow on view.
8. team (dark): four portraits that open from a slit, with name, role and a line each.
9. reviews (light): four quote cards that stick and stack; each one shrinks and frosts over as the next arrives.
10. pricing (dark): a Monthly/Yearly switch and three tiers (Personal $0, Pro $24 framed in ember brackets on a pale card, Team $60 per seat) that open from the middle.
11. faq (light): a sticky side column and an accordion that opens on grid-template-rows.
12. contact (dark): a blurred graph canvas behind, contact channels, and a light form card that unfrosts as it scrolls in.
13. footer: a newsletter, three link columns, a legal line saying the company is fictional, and ORRERY huge over an ember glow, rising on scroll.

THINGS THAT BREAK
- Put html.motion on in <head> only when motion is allowed, and take it off if GSAP has not arrived in 2.5s; scope every hidden-until-animated state under .motion.
- The hero window's clip-path and the rim must use the same custom properties (--sw, --sh, --sy, --sr), or they drift apart at other sizes.
- The horizontal gallery needs its scroll distance (track width minus the viewport) measured on every refresh, and the window hole positioned from the track's real height.
- Queue the scroll scenes and build them in idle time after fonts load, then refresh ScrollTrigger; re-read section tones for the header on every refresh.
- Canvases must stop drawing when off screen, or a page of eighteen animated canvases will burn a laptop.

THE FLOOR
One h1 (the hero words, with the brand in a visually hidden span), a main, a labelled menu button with aria-expanded, role="img" and an aria-label on every meaningful canvas, aria-hidden decoration, buttons with aria-pressed for billing and aria-expanded for questions, live form status, visible ember focus rings. With motion reduced the page is complete and static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 20, 2026",
    demo: "/demos/orrery-engine.html",
    bestFor: ["AI models and reasoning products", "research and analytics tools", "enterprise AI platforms", "deep-tech launches"],
    style: ["dark", "generative", "canvas", "gsap", "scroll-driven", "editorial"],
    thumbnail: "/thumbs/orrery-engine.jpg",
    theme: "dark",
  },
  {
    title: "Siliq AI Hardware Lab Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A sticker-bright bento for a small-batch AI hardware lab and school: SVG chips and GPUs, a hero board that breaks apart into a honey flood and a gallery that folds into a grid",
    prompt: `Build a landing page for Siliq, a fictional small-batch AI hardware lab and hardware school on "Foundry Row" (NPU sticks, RISC-V dev boards, tensor cards, inference chips; classes at a big workbench; a hardware leasing club), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3, all from jsdelivr. Google Fonts: Climate Crisis (display), Google Sans 400-700 (text), Playpen Sans 600-800 (handwritten notes). No images: every product, the lab and four portraits are inline SVG symbols in one sprite at the top of <body>, drawn as glossy sticker illustrations, and used with <use href>.

DESIGN SYSTEM
A playful bento of big rounded tiles on a pale sage ground. Tokens: ground #e4e8e3, paper #ffffff, sky #7cc4ea, honey #ffbf3c, tangerine #f47a3c, leaf #0a5c46 (the primary button), ink #0a1317. .tone-* classes set a tile's background, its blob and its little spark marks. Display type is Climate Crisis in caps, fitted to its container from its character count (--len) with container units. Tiles have a 28-36px radius; each product sits on an organic blob shape; three-stroke "spark" doodles and Playpen Sans notes with a dashed hand-drawn arrow ("Join in!") add the hand. Buttons are ink or leaf pills with a white secondary; one spring ease for every pop.

SECTIONS
1. nav: the logo (an S on a honey square plus the wordmark) in a white pill at left; links (Lineup, School, Compute club, Visit) and an Order button in a white pill at right. Under 900px a menu button opens a full sheet.
2. hero, a bento board: a big honey tile with "Built today!" as one fitted headline, a line and two buttons, a large chip illustration on an orange blob with a leaf "from $24" price badge; a tall white Edge NPU tile ($129, a blob and a spark); an orange "(4.8) stars from 1,200 builders" tile; a "Top picks" tile with four round product thumbnails; a sky "Workshops" tile with a robot arm and a handwritten Join in!. On scroll the board breaks apart, tiles flying off in their own directions, while a honey flood grows out of the main tile to fill the screen.
3. story: a quote ("We solder by hand, test in small batches...") split into lines that rise in on scroll, with stickers between the words, and three stats (2015, 36 modules, 48 h burn-in).
4. lineup: "On the bench": six product cards (NPU stick $89, Pocket board $59, Tensor card $1,299, Inference chip $24, Memory kit $210, Cooling kit $45), each a tone tile with the illustration popping in.
5. school: classes as date tiles (day and month, title, length and seats, price) with a private-session note and a Book a seat button.
6. process: "From wafer to rack", a timeline of four times (5:00 reflow on, 7:30 bench tested, 9:00 bikes out, 12:00 batch closed) that fills as you scroll.
7. gallery: "A peek inside", a strip of thumbnails that unfolds into a full grid of lab scenes on scroll.
8. team: four engineers with SVG portraits on coloured blobs, a role and a one-line joke each.
9. reviews: the 4.8 rating and an endless marquee of six forum quotes in coloured bubbles, paused on hover or focus.
10. pricing: "Compute club" with a Monthly/Yearly switch over three plans (Hobby node $49, Lab cluster $199 marked Most loved, Office rack $899) that fan out on view.
11. faq: details rows. 12. contact: hours, an address on Foundry Row and an order form. 13. footer: link cells, a Pre-order tile, the wordmark huge with a squash-and-stretch on view, and a legal line saying the business is fictional.

THINGS THAT BREAK
- Put html.motion on in <head> only when motion is allowed, and take it off if GSAP has not arrived in 2.5s; scope every hidden-until-animated state under .motion.
- Wait for document.fonts.ready before SplitText and before measuring fitted text, then refresh ScrollTrigger.
- The flood must start from the main tile's own box, measured on refresh; aim each flying tile from the board centre with function-based values and invalidateOnRefresh.
- The portraits are big SVG; keep only the ones used.

THE FLOOR
One h1, a main, a labelled menu button with aria-expanded, role="img" with labels on product pictures and aria-hidden decoration, aria-hidden cloned marquee items, a form that confirms in place, visible focus rings. With motion reduced the page is complete and static. Under 700px the bento becomes one column with paired small tiles. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 20, 2026",
    demo: "/demos/siliq-lab.html",
    bestFor: ["AI hardware and devices", "maker shops and electronics stores", "workshops, classes and schools", "playful product brands"],
    style: ["light", "bento", "playful", "illustrated", "gsap", "scroll-driven"],
    thumbnail: "/thumbs/siliq-lab.jpg",
    theme: "light",
  },
  {
    title: "Thorn Music Controller Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A desktop music controller built in CSS 3D from layered DOM: every dial, fader, joystick and tape key works, with clicks you can hear and three finishes",
    prompt: `Build a product landing page for THORN/98, a fictional desktop music controller ($649; two detented dials, two long-throw faders, a joystick and three latching tape keys around one small screen), as one HTML file with no libraries and no images. The device itself is the hero, built in CSS 3D from layered DOM, and every control on it works.

TYPE AND TOKENS
Saira for display and labels (weight 700-800, tight tracking in headlines, wide-tracked uppercase in small labels) and Asap for text, both embedded as woff2 data URIs. Palette: fog #c9ced3, alloy #b2b6bd, steel #92959c, graphite #51575d, carbon #0f1215 (the screen), ink #1b1d21 with two softer greys, signal orange #fe5d01 (record and accents), lime #7bb470 → #a9d046 (power only). The page is a soft grey with a big diagonal light shaft. Three finishes as token sets on [data-finish]: fog (cool grey shell, graphite faders), graphite (dark shell, fog faders), sand (#dad4c9 shell, umber #4c463e faders); each sets the shell, face, grip, thumb, key and label colours. Buttons are soft raised pills with an orange dot.

THE DEVICE
- One artboard, 651 x 331 design units; inside the device 1em is one unit (font-size: var(--u)), so a single variable scales it.
- Depth: a helper stacks N copies of a slice at increasing translateZ to extrude the shell, the dial knurls, the fader caps and the keys; the scene is tilted in perspective and follows the cursor a few degrees, with a specular sheen gradient that moves with it.
- Parts: a speaker grille of 46 holes, an engraved logo, a deep recessed screen with a matte bezel, two dials with 0-80 scales, two faders (VOLUME, TUNER), a joystick in a ring, three tape keys (stop, play, record) down the right edge, a power key (the only lit control, lime when on) and two lever toggles on the right flank (shuffle, repeat).
- State object mirroring a state machine: power, playing, track, progress, shuffle, loop, rec, mode (Player, Radio, Tape), the two dials, the two faders, the tape key. Mirror it onto <html> as data-power / data-playing / data-rec / data-mode / data-shuffle / data-loop so CSS styles from it.
- Input: dials turn by drag or arrow keys in 80 detents across a 320° sweep (low and high EQ); faders drag (volume 0-100; tuner across FM 87.5-108); the joystick moves left or right between modes and plays or pauses on tap; play and record latch down like a cassette deck. Each control is focusable with a role, a label and an aria value.
- Sound: a mechanical click per detent and key, made in Web Audio from a short decaying noise burst through a band-pass filter (a deeper double "thunk" for latching keys), toggled by a speaker button in the nav.
- The screen is blank in standby ("Press POWER to begin" under the device); powered on it shows the mode, a track with a progress bar, the value just changed, and a breathing lime glow behind the glass while playing (orange while recording). Toasts confirm changes.

SECTIONS
1. nav: the THORN / 98 wordmark, four links (Controls, Display, Finish, Specs), the sound toggle and a Reserve pill.
2. hero: an eyebrow, the h1 "Music you can put your hands on." with "hands" in white, a lede, Reserve — $649 and Explore the controls, the device large below with a row of finish swatches.
3. controls ("All hardware. Zero menus."): five numbered cards, each with a small live copy of one control (dials, faders, joystick, tape keys, the power key) and a readout.
4. display ("A screen that speaks only when spoken to."): a close-up of the screen with three notes (three modes, ambient glow, side toggles).
5. finish ("One alloy. Three finishes."): three swatch cards with their hex pairs, plus the power, record and display colours and the type.
6. specs: a definition list (dimensions, weight, display, controls, audio, radio, connectivity, finishes), noting which finish is shown.
7. cta ("Turn it on."): a small device, the price and a refundable reservation. 8. footer: the wordmark and a line saying the product is fictional.

THINGS THAT BREAK
- Keep the stack depth modest; every layer is DOM, and a phone needs fewer.
- Set pointer capture on drag and convert pointer motion to value through the control's own rotation and scale, or dials jump when the device is tilted.
- Create the AudioContext lazily inside the first click, never at load, and wrap it in try/catch so a blocked context stays silent.
- The swatches change data-finish on <html>; a mini device can pin its own finish.

THE FLOOR
One h1, labelled sliders and buttons with keyboard control, aria-hidden decorative layers, visible focus rings. With motion reduced the tilt and glow stop. Under 900px the hero stacks and the device scales to the width. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 20, 2026",
    demo: "/demos/thorn-controller.html",
    bestFor: ["consumer hardware and audio products", "product pre-orders and reservations", "industrial design studios", "interactive product showcases"],
    style: ["light", "3d", "skeuomorphic", "interactive", "product", "no libraries"],
    thumbnail: "/thumbs/thorn-controller.jpg",
    theme: "light",
  },
  {
    title: "Corvel Hard-Tech Capital Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A risograph-print investment firm for fabs, satellites and fusion: halftone art drawn in code, a sunburst arch that blows apart on scroll and a two-plate misregistered print",
    prompt: `Build a landing page for Corvel, a fictional hard-tech investment firm ("Capital for things that are hard to build": venture equity, equipment debt and project finance for fabs, satellites, energy storage and fusion), as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3, all from jsdelivr. Google Fonts: Inter Tight 400-900 (display and UI), JetBrains Mono 400-700 (labels), Newsreader (body serif, optical sizes). No images: every picture is SVG generated by script and printed through a CSS halftone screen.

DESIGN SYSTEM
A risograph print on warm paper. Tokens: paper #ebe8e1, paper-hi #f7f5f0, ink #0c1016, one red #ff5b1a, mid grey #8b939e; a 1.5px stroke; a fluid gutter (16-56px) and max width 1320px. Display type is Inter Tight 800-900 with tight negative tracking (-0.04 to -0.06em); labels are uppercase mono; body is Newsreader 18px. Hard offset shadows instead of blur: buttons are ink blocks with a 4px red shadow that collapses as the button slides into it on hover, sometimes with a second paper-coloured mono segment ("Reply in 24 h"). Links get a dotted underline whose dots swell on hover (an animated @property radius). Chips are a mono key in an ink cell beside a value. A paper grain is an SVG fractal-noise mask; dark sections rise out of the page on a "ramp": a row of dots growing from specks to full circles, as a repeating SVG mask on a ::before above the section.

HALFTONE AND GENERATED ART
- [data-art] elements are filled by one script with seeded SVG (a tiny LCG PRNG per element): a 300 mm wafer map with dies (or yield bins), a chip die with bond wires, a planet with orbits, a candlestick chart with a moving average, yield curves, a top-down toroidal reactor, a satellite constellation over the Earth's limb, a battery site plan with a state-of-charge curve, a tokamak cross-section with flux surfaces, halftone portrait silhouettes, a PCB, an order-book depth chart, a vibration spectrum and survey contours. Each uses the CSS colour classes (ink, red, paper) so it follows the tokens.
- .ht turns any art into a print: the art is greyscaled inside .ht-scr, which has filter contrast(20) and a rotated radial-gradient dot grid (--dot cell) multiplied over it, then the ink colour is laid on top with mix-blend lighten. .ht--red prints in red.

SECTIONS
1. nav: fixed; the brand "corvel." (red dot) fades out while the cover's masthead is on screen; dotted links, Pitch a build. It turns solid on scroll, ink over dark sections, hides on scroll down and returns on scroll up. Under 900px a full-screen menu opens with a circular clip-path from the button.
2. hero (a cover, pinned for one and a bit screens): the masthead "corvel" sized to fit its width from its character count (--len), a red mono tagline and email under it; an orbit diagram either side; a tall arch with a 1.5px outline full of slowly turning red-and-ink sunburst rays (two repeating-conic-gradients), dots fading up from the bottom and grain; long dashed rays radiating from the arch across the page; in front, a tilted paper print of the halftone wafer captioned "Tape-out No. 04", four floating framed plates (a die, a round orbit, a rounded candlestick card, a yield-curve card), two tilted mono tags (Underwrite, Build) and a speech bubble ("$4.2B deployed into hardware"), all gently bobbing. A table of contents at left and a big red "3 lead allocations left in Fund IV" at right; a plate chip and a two-part CTA along the bottom. Scrolling scrubs the cover apart: the masthead letters fly outward and rotate from the centre, every floating card flies away along its own direction from the arch, the rays turn and grow, the arch scales up, the print straightens and lifts.
3. services: a sticky heading with an orbit glyph beside a list of five instruments (venture equity, project finance, equipment debt, public co-funding, offtake), each with a price in red mono, a paragraph, mono bullets and a red rule that draws in.
4. story: a figure printed twice, ink and red plates of the same reactor art with different screen angles, starting misregistered and sliding into register on scroll with registration marks; the headline "Hard tech isn't too risky. It's mispriced." with a red offset shadow that also closes up; two columns with a drop cap and a signature.
5. portfolio (dark): four deal spreads (year in huge red numerals, sector, company, what was financed, the result) as cards with red offset shadows, pinned and scrolled horizontally on desktop, each slightly tilted.
6. stats (red, with faint rays): four big figures stamped in on view with a back-out overshoot.
7. process: five proof cards that stick and stack as you scroll, each with a CMYK-like colour bar, crop marks and a slight tilt.
8. team: four partners in arch-topped halftone portraits with an offset outline, revealed bottom to top.
9. reviews (dark): an endless marquee of speech-bubble quotes that pauses on hover or focus.
10. gallery: a 12-column collage of six plates that "develop" in through a growing dot mask.
11. pricing (dark): an Equity/Debt toggle above three hanging price tags (a hole and a string), the middle one red; tags swing in on view.
12. faq: details rows with a round chevron and red rules. 13. contact: "Bring us the bill of materials." with sunburst lines drawn out from the heading box to the page edge (some ending in dots) and a sunburst arch rising behind a form card. 14. footer: the wordmark huge in red, columns, chips, a legal line saying the firm is fictional.

THINGS THAT BREAK
- Put html.motion on in <head> only when motion is allowed, and take it off if GSAP has not arrived in 2.5s; scope every hidden-until-animated state under .motion so the page is never stuck invisible.
- Wait for document.fonts.ready before splitting the masthead into letters and building the cover timeline, then refresh ScrollTrigger.
- Compute each flying card's direction from the arch centre inside function-based tween values with invalidateOnRefresh, so a resize re-aims them.
- The horizontal portfolio pin needs its distance (track width minus the viewport) as a CSS variable on the pin, set again on every refresh.
- Large numbers and wordmarks are sized from --len (character count) and container units, so update --len when the text changes.

THE FLOOR
A main, one h1 (the masthead and tagline), labelled menu buttons with aria-expanded, role="img" and aria-labels on every generated picture, aria-hidden decoration and cloned marquee items, a live form status, visible red focus rings. With motion reduced the page is complete and static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 20, 2026",
    demo: "/demos/corvel-capital.html",
    bestFor: ["venture and investment firms", "hard-tech, deep-tech and climate funds", "industrial and infrastructure finance", "editorial brand sites"],
    style: ["light", "risograph", "halftone", "editorial", "gsap", "scroll-driven"],
    thumbnail: "/thumbs/corvel-capital.jpg",
    theme: "light",
  },
  {
    title: "Corelane Build Cluster Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An isometric dev-tool landing page: laptops and a core server on a glowing circuit field, plus a 96-machine fleet board you can put to sleep and run a build across",
    prompt: `Build a dark landing page for Corelane, a fictional product that pools the idle CPU cores in a team's laptops with one on-site "core" server into a private build cluster, as one HTML file with no libraries and no images. Every machine, server and circuit is inline isometric SVG.

FONTS (Google Fonts)
Oswald 400/500 for display (uppercase hero, tight line-height 0.96) and buttons; Instrument Sans 400-600 for text.

TOKENS
night #0f054c (page), night-2 #160a5c, indigo #24126a, ring #706ec4 (pill outlines, rules at 32% alpha), lavender #e9e9fd (text, filled buttons), muted #b6b3e3, faint #8a86c9, cyan #42e8e0 (available, focus rings), magenta #e84298 (building). Wrap 1200px, gutter clamp(20px, 4vw, 40px).

ATOMS
Pill buttons 48px high: transparent with a 1.5px ring outline, or filled lavender with night text; Oswald uppercase, letter-spacing .04em. A brand mark of nine small squares in a 3x3 grid rotated 45deg (cyan, lavender, one magenta centre).

SECTIONS
1. nav: fixed; transparent at the top, then night at 78% with a 14px backdrop blur and a hairline after 12px of scroll. Links with a scaleX underline and a scroll-spy current state; Sign in (ring) and Start free trial (filled). Under 860px a round menu button opens a full-width drawer.
2. hero, 5/7 columns: headline YOUR TEAM'S LAPTOPS ARE ALREADY A BUILD CLUSTER, a lead, two buttons, a note. Right, a stage (aspect 400/320) with: a violet radial glow; a circuit-trace field behind the art (one path mirrored to the right, feathered on all four edges with intersecting mask gradients) where a pink-then-cyan ring of light (an animated radial gradient r 60 to 620 over 3.6s, masked by the traces) pulses outward along the lines; the isometric illustration of four laptops around a server whose top is a 9x9 grid of LED diamonds that light magenta in waves. Under it a segmented control "Team machines / Core server": the second swaps the art (fade and 0.985 scale for 220ms) to a stacked core server, the glow turns teal and the circuits give way to an isometric grid with rippling diamond rings, blinking tiles and rising motes around the core. Clicking (or Enter on) the server lifts it out of the stack and back.
3. product: "Spare cycles, put to work", a two-column ledger (not cards) of four features separated by hairlines, each with a small isometric glyph.
4. fleet: "Every machine on the team, one queue". Left: a lead, a readout list (Machines available N of 96, Full build on one laptop 41m 00s, Full build with Corelane), Run a build and a legend. Right: a 12x8 grid of buttons on a lavender plate tilted rotateX(57deg) rotateZ(45deg) with a 10-step stacked box-shadow for thickness. Cells are cyan (available, glowing), dark violet (asleep, nine start asleep) or magenta (building). Click a cell to toggle sleep; arrow keys move a roving tabindex. The estimate is 2460s / (1 + 0.16 x (n - 1)). Running spreads "building" outward from the centre (delay = distance x 70ms), clears each cell at a staggered time, counts the estimate up over 2.6s and announces start and finish in a live region.
5. how: three numbered steps with isometric art (a laptop, the core box, the stacked server); step 3 shows the one-line config in a code chip.
6. pricing: a Monthly/Yearly role="switch" (yearly saves 20%), three joined plans (Studio $0, Team $19/$24 per machine featured in lavender with a badge, Campus custom).
7. faq: details/summary with a chevron that rotates.
8. cta: a rounded card with a radial indigo gradient, headline, an email form with inline validation, and the small core-box art.
9. footer: four columns and a legal line saying the product is fictional.

THE HERO RUNTIME
The illustration is exported vector-animation data replayed by a small runtime: a JSON object of nodes (x, y, rotation, scale, opacity), colour-keyed elements, morphing paths (straight, rounded and cubic vertices rebuilt into a d string each frame) and keyframed animations (oneShot, loop or ping-pong, speed multiplier, a cubic-bezier ease solved by bisection). A four-layer state machine picks "laptops" or "server" from the segmented control and plays the "up" animation forwards or backwards on the server click. Only write attributes that changed (dirty sets), cap dt at 0.1s and pause the loop with an IntersectionObserver when the hero is offscreen.

THINGS THAT BREAK
- The animation targets elements by id (n1768, p14874...): keep those ids when editing the SVG.
- Give every repeated SVG its own gradient id prefix (lp, co, sv, ca) or the steps' art picks up the hero's gradients.
- Pause the SVG SMIL animations of the circuit field (pauseAnimations) while the core scene shows, and pause the core field's CSS animations when it is hidden.

THE FLOOR
A skip link, one h1, a main, aria-hidden decoration, labelled grid and form, visible cyan focus rings. Under prefers-reduced-motion: no entrance, no SMIL, the scene jumps to its end state and the build finishes instantly. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 20, 2026",
    demo: "/demos/corelane-cluster.html",
    bestFor: ["developer tools and build infrastructure", "on-prem and edge compute products", "B2B SaaS with per-seat pricing", "AI compute and GPU-sharing products"],
    style: ["dark", "isometric", "illustrated", "interactive", "neon", "svg-animation"],
    thumbnail: "/thumbs/corelane-cluster.jpg",
    theme: "dark",
  },
  {
    title: "Halden Clinical Equipment Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A clinical equipment service in ink and paper: a dot-matrix wordmark that splits apart, a pinned 12-check inspection board, a rate card and a scroll-driven pre-owned shelf",
    credits: [
      { label: "8B · Reflow template", href: "https://8b.com/templates/reflow/", note: "The MIT repair-shop template this page adapts, its layout system and its scroll scenes" },
    ],
    prompt: `Build a landing page for Halden, a fictional clinical equipment service (patient monitors, infusion pumps, ultrasound, ECG) in Seattle, as one HTML file. GSAP 3.13 with ScrollTrigger and SplitText, and Lenis 1.3 for smooth scroll, all from jsdelivr. Google Fonts: Geist 300-600, Geist Mono 400/500, Instrument Serif (italic). Every device, monitor trace and "photo" is inline SVG; no images.

DESIGN SYSTEM
Use CSS cascade layers: tokens, base, atoms, layout, sections, scenes. Colours: ink #090c0e, paper #f3f5f6, light grey #d3d9dc, mid greys #8a959b and #58626a, line #1a2329, soft panel #e2e7ea, one cobalt signal #2b46ff, and a monitor green #3fd99a kept for live readouts only. Sections alternate dark (ink with a 7% fractal-noise SVG grain) and paper. Type atoms: a huge display (clamp 56-152px, weight 300, letter-spacing -0.05em, line-height 0.92), a large text (26-40px, weight 350), mono labels (11.5px, letter-spacing .08em, uppercase), and a justified "spread" eyebrow whose words are pushed to both edges. Italic Instrument Serif marks one phrase per headline. Pill buttons whose cobalt fill wipes in from the left on hover and whose trailing pill-dash slides; dashed underline links whose dashes flow on hover. A 4-column grid with a fluid gutter (16-28px), 2 columns under 48em.

SECTIONS
1. nav: a fixed blurred ink bar 60px high; brand mark of three pills; a "Bench open · Critical line 24/7" status with a pulsing green dot (only above 80em, or it collides with the links); four mono links; Book service. It hides on scroll down and returns on scroll up. Under 64em a full-screen menu replaces the links.
2. hero (sticky, 100svh): the word HALDEN drawn as a dot-matrix: each letter a 5 x 7 grid of rounded pill rows (grid-column spans), sized from the container and viewport height (--u), with rows that pulse sideways on a staggered loop. Below it the h1 ("Clinical equipment service, performed in view and documented to the line." with the last phrase in serif), a lead, actions, an animated ECG trace (three stacked paths: a faint base, a 35% tail and a glowing head, animated with stroke-dashoffset) and an address bar. Scrolling splits the wordmark: odd rows slide one way, even the other, stretching and thickening, then a paper flood grows out from the wordmark's box to fill the screen.
3. A paper second half: the stair headline "Most failing devices are fixable." with each word in its own grid cell, stepping down and right, the last word in a cobalt selection highlight, and three device illustrations (a bedside monitor with an NIBP alarm, an opened infusion pump, an ultrasound probe) placed in the stair's empty cells.
4. diagnosis (ink): "Fifteen minutes, free, on record." and a board of twelve checks (earth leakage, protective earth, ECG, SpO2, NIBP, battery, alarms, display, power, network, firmware, housing), each with a result; two are faults shown longer and in cobalt. On wide, tall screens the board pins and a cobalt band scans down it as you scroll, flipping each row from "Queued" to its result, then a summary with the quote fades in.
5. prices (paper): a rate card table grouped by device family with a bench-time bar per row (width from minutes) and a price.
6. bench (ink): "Done in plain sight." over one wide illustration cut into four vertical strips that settle into alignment as you scroll, and three short columns.
7. parts (paper): a three-grade comparison table (OEM, certified, rebuilt).
8. refurb (ink): "Second shift", a horizontally scrolling pinned shelf of five rebuilt devices with grade, price and Reserve.
9. fleet (paper): a weekly route board, one row per weekday with pickup windows as bars on an 08-18 axis; a cobalt time cursor sweeps across with scroll, colouring the window it is in.
10. mailin (ink): four mail-in steps with growing dashes. 11. reviews (paper): three large quotes where a cobalt box reads them word by word as you scroll. 12. faq (ink): details/summary with a pill marker that shrinks when open. 13. visit (paper): the words "Come to the bench." grow from small to full size into a staggered layout; facts, a photo, and a white booking form with inline validation. 14. footer with the ECG again and a fictional-business legal line.

MOTION RULES
Queue every scene so it runs after fonts load (SplitText and the stair measurements depend on them), lazily as its section nears, and revert it cleanly if it throws. Wrap each in gsap.matchMedia('(prefers-reduced-motion: no-preference)'). Drive Lenis from the GSAP ticker and feed its scroll to ScrollTrigger.update, with lagSmoothing(0).

THINGS THAT BREAK
- Measure positions (board rows, stair offsets, word boxes) inside onRefresh, never once at load: fonts and the sticky opening change them.
- The flood's clip-path must start at the wordmark's own box, computed from both rects on each refresh, or it jumps.
- The status line in the nav needs about 1280px beside the links; hide it below that.
- Keep the opening sticky stage and the flood inside one section, and reset the split rows at the end of the timeline so scrolling back up rebuilds the wordmark.

THE FLOOR
A skip link, one h1, a main, real tables with captions, labelled form fields, aria-hidden on decoration, visible focus rings. With motion reduced the page is complete and static. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 19, 2026",
    demo: "/demos/halden-clinical.html",
    bestFor: ["medical device and equipment services", "repair and maintenance businesses", "B2B service with a rate card", "healthcare operations"],
    style: ["dark", "editorial", "monospace", "gsap", "scroll-driven", "dot-matrix"],
    thumbnail: "/thumbs/halden-clinical.jpg",
    theme: "dark",
  },
  {
    title: "Calibre Grading Bench Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A glass grading bench on a planet horizon: it reads an AI answer claim by claim, highlights each one in its verdict colour and swings a needle to the score",
    parents: [
      { slug: "highlighter-markup-page", gave: "The claim-by-claim answer, the serif and the verdict highlighters" },
      { slug: "machine-front-panel-page", gave: "The lamps, the gauge and its needle, the amber and the display type" },
    ],
    prompt: `Build a dark landing page for Calibre, a fictional evaluation bench for AI answers ("Measure every answer before it ships"), as one HTML file with no libraries and no images. The hero is a centred headline over a tilted glass grading bench, lit from behind by a glowing planet horizon. The bench reads a model's answer claim by claim, highlights each claim in its verdict colour and swings a needle to the score.

FONTS (Google Fonts)
Archivo with the width axis (wdth 62-125, wght 100-900) for display: uppercase, weight 900, font-stretch 110%, letter-spacing -0.03em, line-height 0.92. Source Serif 4 for the answer text and italics, JetBrains Mono 400/500/700 for labels, chips and terminals.

TOKENS
One token set. Surfaces: void #08090b, alu #1c1e23 (hi #26292e, lo #15161a), well #0e0f12, hairlines rgba(255,255,255,.07/.12). Exactly three text greys: #eceef1, #a8aeb7, #7d838d. Amber #ff9426 (hi #ffb562, lo #e5750e). A verdict system, one hue per verdict, each with a lamp tone and a highlighter tone: green #4ad87a, yellow #ffd34d, orange #ff7d3a, red #ff4f44; on the bench and the verdict cards the highlighter tones are vivid and flat (#1d7a3b, #9c6c0e, #b0481a, #a8202b). A 4px spacing scale (4, 8, 12, 16, 24, 32, 48, 64, 96), three radii (16, 10, 4) and one ease, cubic-bezier(.2,.8,.2,1). One label style: mono 11px, letter-spacing .16em, uppercase, the third grey. A "gold" text gradient (#e6c43e → #ffbb30 → #ffa22a → #ff8c1e, background-clip text) marks one phrase per headline.

MATERIALS
- Glass: a 20px-radius card with a dark vertical gradient (rgba(34,36,42,.82) → rgba(14,15,18,.92)), a 1px inner hairline, a brighter 1px top edge and a deep drop shadow. Every card on the page uses it; on hover it lifts 4px and gains a glow in its own colour.
- Lamps: 8px dots, dark when off; on, they fill with their colour and glow.
- Icon tiles: 52px rounded squares on near-black with a radial glow in their colour and a drop-shadowed icon.
- Buttons: amber (a gradient with a 2px dark-orange base and an amber glow), secondary metal, and ghost glass with a backdrop blur. They lift 1px on hover.
- Pills: 38px rounded capsules with a lamp and mono uppercase text, used as section eyebrows.
- The highlighter means a verdict and appears nowhere else: a mark's ::before sits behind the text, coloured only through --c, and draws in by scaling X from the left.

SECTIONS
1. nav: sticky, blurred, a three-column grid: an amber gauge-glyph logo with CALIBRE in wide, tracked capitals; four links (Verdicts, How it works, Numbers, FAQ); Sign in (ghost) and Get a bench (amber).
2. hero, centred: a pill ("Eval bench for AI answers"), the h1 MEASURE EVERY ANSWER / BEFORE IT SHIPS. with "every answer" in gold, a lede with one italic serif phrase, two large buttons and three amber-icon trust notes. In the empty space either side of that copy, four floating glass "source" cards (a PDF, a web page, a database, a file), two a side and staggered (one beside the headline, one beside the lede), tilted in 3D toward the centre and drifting. Below, the stage: a 1380px planet (a near-black circle whose top rim burns amber through stacked inset and outer shadows), two lens flares, twinkling sparks, two layers of SVG rock terrain with an amber rim light (one behind the bench, one in front), and the bench tilted back 9deg on rotateX with a stacked glass layer behind it and an amber rim light along its lower edge. Under it a strip of eight invented customer logos.
3. verdicts: four glass cards, one per verdict (Grounded 1.00, Reworded 0.85, Stretched 0.35, Unsupported 0.00): an icon tile, the weight, a lit lamp tag, a title, a line of explanation and an example phrase whose mark draws in on view. Each card has a lit top edge and a glow in its verdict colour. Under them the formula: (1 + 0.85 + 0.35 + 1 + 0) ÷ 5 = 64.
4. how-it-works: three glass steps (Split, Check, Gate) joined by an amber pipeline line with a pulse travelling along it; each has an icon tile, a big outlined number, a title and a terminal well showing the command and result (5 claims; 2 grounded · 1 reworded · 1 stretched · 1 unsupported; 64 · blocked).
5. stats: one glass panel with a lit top edge and four figures (48M claims, 1 in 9 in amber, 210 ms, Zero) in silver-gradient display type, the numbers rolling up on view.
6. faq: a sticky side column (the heading and a "Still unsure?" contact card) beside five glass <details>; the open one gets an amber ring and its plus turns into an amber cross.
7. cta: a glass finale with a planet rising from the bottom, a glow floor, the headline PUT A NEEDLE ON / EVERY ANSWER. in gold, a lede, a glass email form with an amber button and three green-checked notes.
8. footer: a brand column with an "All benches operational" status, three link columns, the word CALIBRE huge in outlined, amber-tinted type, and a line saying the product and every number are fictional.

THE BENCH (the hero instrument)
- A top row: "// Run 0418 · support-bot" and a status (a lamp and "Scanning", pulsing while busy, green "Completed 4.6s" when done) with a replay icon button.
- Two cards side by side: the model answer (a serif paragraph of five claims, each a mark with a verdict and a source note in data attributes: two grounded, one reworded, one stretched, one unsupported) and a gauge: an SVG arc from -120° to +120° with a red → orange → yellow → green gradient stroke and a soft glow, 21 ticks placed with trigonometry (every fifth longer), an amber needle rotated by calc(-120deg + var(--a) * 240deg), the score in large display numerals over the hub, "Grounding" and a gate pill ("Gate ≥ 80 · passed/blocked").
- Four verdict chips with lamps and counts, and a source bar: a glowing tile, the checked span for the selected claim (its lamp in the verdict colour) and a next arrow that steps through the claims.
- A run: clear the marks and counts, then for each claim move an amber scanline to its line, wait about half a second, draw its mark, light its lamp, bump its count and set the needle's target to the running weighted score. Finish with the gate in green or red and the elapsed time. It runs once after load and replays on the button.
- The needle is a damped spring integrated per frame (stiffness 120, damping 14) toward the target, so it overshoots and settles; the score eases toward it. Stop the loop once it settles.

THINGS THAT BREAK
- A mark is inline-block, so a long claim cannot wrap. Split each claim into one span per word in script (each word its own ::before reaching over the following space, the last one not), staggering the draw by 40ms per word.
- Measure the scanline position from the claim's offset each run, since the text reflows by width.
- Keep the numbers on the page in agreement with the bench: 64, 2 / 1 / 1 / 1, gate 80.
- The planet and terrain are far wider than a phone: clip them inside the stage (clip-path on the stage, overflow hidden on the hero) and hide the floating source cards under 1280px, where the copy leaves no room beside it.

THE FLOOR
One h1, a main, labelled icon buttons, aria-hidden decoration, a live region on the source panel, visible amber focus rings, real labels on the form. Under prefers-reduced-motion the bench renders already graded with no scan and all animation is off. Below 1040px the verdicts and stats go to two columns and the FAQ stacks; below 860px the nav links hide, the bench untilts and stacks; below 560px everything is one column. No horizontal scroll at 390px.`,
    preview: "dashboard",
    variant: "large",
    added: "Oct 19, 2026",
    demo: "/demos/calibre-bench.html",
    bestFor: ["AI evaluation and observability tools", "LLM quality and grounding products", "developer tools with a release gate", "AI safety and compliance software"],
    style: ["dark", "glass", "glow", "highlighter", "planet horizon", "bred"],
    thumbnail: "/thumbs/calibre-bench.jpg",
    theme: "dark",
  },

  {
    title: "Facetry Security Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A black-and-chrome security platform page: an extruded metal logo on a rough stone pedestal in a CSS 3D scene, spring-morphing between three shapes, glass panels floating around it, a live spring tuner, and a footer with live region clocks",
    prompt: `Build a single-file HTML landing page for "Facetry", a fictional access-control and security platform ("Security, cut to shape."). The look is black glass and brushed chrome: near-black surfaces, metal gradient type and buttons, and one hero object, an extruded metal logo standing on a rough stone block in a real CSS 3D scene. The brand mark morphs between three shapes (diamonds, shield, triangle) on a spring, everywhere it appears. Fictional product, labelled as such in the footer. No libraries, no images, no web fonts: system UI and system mono, inline SVG, CSS 3D and one inline script.

THE SYSTEM
- Colours: page #000 with #09090b surfaces, text #f4f4f5 / #d4d4d8, soft #a1a1aa, muted #71717a, faint #3f3f46, hairlines white at 6% and 10%.
- --metal is a vertical gradient #fbfbfb → #e4e4e4 (18%) → #cccbcb (55%) → #9e9d9d. It fills .metal-text (background-clip text) in every headline's second line, primary buttons (dark ink text, inset white top line, soft white glow), badges, tags and tiny 45deg diamond bullets.
- Surfaces are 32px-radius cards with a top-lit radial (white 5% → 1% → black 40%), an inset 1px white top line at 12%, an inset hairline and a deep black drop shadow. Hover lifts 4px and brightens the top line.
- Background: a fixed diagonal stripe field (repeating 135deg gradient between #0e0f10 and #18191b, 70% opacity) drifting slowly, under a radial vignette that pulls the edges to black.
- Motion uses one ease, cubic-bezier(.16, 1, .3, 1). Reveals fade up 28px from an 8px blur with staggered delays.
- The rock texture is an inline SVG data URI (feTurbulence fractal noise into feDiffuseLighting with a distant light) used as a CSS variable.

THE MORPH ENGINE
- Each shape is four layers of cubic Bézier paths with the same number of points in every state: an outer and inner contour (an even-odd compound path) plus three detail layers. Straight polygon edges are converted to cubics (control points at thirds), so any state can tween into any other.
- A Morph class springs every coordinate toward the target state (stiffness 175, damping 22 by default) with a little scale kick on each switch, adds a motion blur proportional to speed, and marks itself settled when the speed falls below a threshold, so idle morphs cost nothing. It auto-advances every 2-3s, pauses on hover, and advances on click; tab buttons show a progress bar filling until the next switch. An IntersectionObserver stops off-screen instances. Under reduced motion it jumps straight to each state.
- Metal finish: SVG filters add a dark drop shadow and a 1px white top-edge highlight (feOffset + feComposite out + feFlood). Static icons across the page use the same paths and filters.

SECTIONS (data-section in order)
1. nav: a fixed floating pill (blurred dark glass, inset highlight) with the metal mark and "Facetry", four links, and a metal "Get started".
2. hero: a "2.0 · Adaptive policies are here" badge, the h1 "Security, / cut to shape." (second line in metal) at clamp(48px, 5.4vw, 92px), the lede, a big metal "Start building" and a ghost "See it move". Three chips (Precision, Protection, Foundation) with outlined icons double as the hero morph's tabs. The right side is a 640px CSS 3D scene (perspective 2200px, preserve-3d) tilted -19deg / -34deg that eases toward the pointer on a spring: a masked grid floor with a soft glow, a stone pedestal built from three clipped faces with chipped top edges and the rock texture, its shadow, the extruded logo (ten dark slices stepped 2.2px back in Z behind a brushed front face with a diagonal sheen), a flare, light rays, twinkling sparks, and glass panels with "+" corner marks floating at different depths: a tall back panel, a small icon tile, a dotted world map drawn from an ASCII grid, and a list (POLICIES, ACCESS, CONTROLS, MONITORING) whose active row follows the shape.
3. marquee: a masked strip of features with small icons, looping.
4. platform: "Three shapes. / One system." Three bento cards (Precision, Protection, Foundation) with a metal icon, a mono number, copy and diamond-bulleted lists, then a wide card with a "Policy as code" pitch beside a syntax-highlighted code window.
5. motion-lab: "Motion with mass." A stage card with its own morph and a dock of three tabs, beside a control card: presets (Default, Snappy, Bouncy, Heavy), stiffness and damping sliders with metal thumbs, and a live response curve (simulated at 240Hz over 1.4s) with a "settles in N ms" readout. Changing it retunes the lab morph.
6. stats: four big numbers that count up on a spring (3.2ms p99, 99.999%, 24 regions, 40B decisions).
7. pricing: "Pick your facet." Three tiers with metal icons; the middle one is featured with a glow and a "Most chosen" tag.
8. faq: four questions that open on an animated grid-template-rows 0fr → 1fr, with a plus that turns into a minus.
9. footer: one big rounded surface holding everything: a cursor-following spotlight, a huge outlined metal triangle slowly spinning behind, a hairline top edge; "Find your shape." with an email pill that swaps to "You're in ✓" and reshapes the CTA morph, assurance ticks, a tap-to-reshape stage; a live region band (SFO, IAD, LHR, FRA, SIN, SYD) with local clocks from Intl.DateTimeFormat and jittering p50 latency bars ticking every second; link columns with diamond hover markers; legal row and a back-to-top pill.

THINGS THAT BREAK
- Every morph state must have exactly the same number of numbers per layer, or the tween jumps. Keep the layer count fixed at four and pad simple shapes with extra cubic segments.
- A CSS blur on the 3D logo flattens its preserve-3d extrusion, so the hero morph skips motion blur.
- Give the hero grid columns min-width: 0 and scale the 3D scene with a --s variable per breakpoint, or the 640px scene pushes the page sideways.
- Run every morph, the parallax and the counters from one requestAnimationFrame loop with dt capped at 32ms, so a background tab does not explode the springs.

THE FLOOR
- Breakpoints at 1180px (hero stacks and centres), 920px (bento, lab, tiers and footer go to one column) and 640/520px (chips stack, region grid to two columns). No horizontal scroll at 390px.
- Real buttons for chips, tabs, presets and FAQ (aria-expanded), labelled sliders with outputs, a labelled email field, decorative SVG aria-hidden, and a prefers-reduced-motion block that stops the drift, marquee, sparks and spin and shows reveals immediately.`,
    preview: "hero",
    variant: "large",
    added: "Oct 18, 2026",
    demo: "/demos/facetry-security.html",
    bestFor: ["security and access-control products","developer infrastructure","B2B SaaS launches","premium dark product pages"],
    style: ["dark","chrome","css-3d","monochrome","interactive","svg-morph"],
    thumbnail: "/thumbs/facetry-security.jpg",
    theme: "dark",
  },
  {
    title: "Cyber Bird Arcade Game Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A pixel-art arcade game launch page with the game playable right in the hero: a one-button flyer threading an armored cyber-pickup through stainless rocket stacks, night, dawn and day skies drawn by code, difficulty presets and a local mission log",
    prompt: `Build a single-file HTML landing page for "Cyber Bird", a one-button pixel arcade game concept, with the game itself playable inside the hero. The player flies an angular armored cyber-pickup on hover-jets through gaps between stacks of stainless-steel rockets over a starbase. Every graphic, on the page and in the game, is drawn by code at runtime: no image files. Credit the original open-source game it is built on (Tesla Bird by Pavel Troshkin) in the footer, and say it is an unaffiliated fan concept.

STACK
- Google Fonts: Jersey 10 (pixel display: logo, headings, numbers, keycaps), Geist 400-600 (body), Geist Mono (labels, 10-12px uppercase, wide tracking).
- Canvas 2D for the game, the sprites, a starfield and two mini scenes. One inline script.

THE SYSTEM
- Dark: page #04050b, text #eef3ff, muted #98a0b3, dim #5d6477, hairlines at 9% / 17% white. Accent cyan #2fe0ff (#7af0ff hover) with dark ink #031218 on it.
- Two registered colour properties (@property --glow, --glow2) drive the auroras and glows, so switching the sky theme (night: blue / cyan; dawn: violet / coral; day: blue / pale blue) cross-fades them in CSS. The theme is remembered and also re-skins the game.
- Behind everything: a fixed starfield canvas (parallax with scroll, tinted per theme), radial aura glows, and faint CRT scanlines.
- The title "CYBER" at clamp(108px, 19vw, 270px) with a hard black offset shadow and a big glow, and a tilted "BIRD" sticker in a cyan-to-blue gradient tucked under its right edge.
- Cards: 18px radius, faint white gradient, a cursor-following radial highlight. Keycaps are pixel boxes with a 3px border and a hard 4px black shadow.

SPRITES (all generated into offscreen canvases once)
- The pickup (42x15): a single triangular roofline with the apex at x=24, steel slab sides with panel lines, dark glass, a light bar and tail light, wheels drawn as shaded discs, and a crashed variant with cracked glass. A cyan light beam ahead of it.
- Jet smoke: a 14-frame strip of flame then expanding, dithered puffs.
- Rockets in three pieces (nose cone with fins, a tileable body, an engine section with bells), shaded by a steel ramp across the width with a dark heat-shield tile pattern on one side.
- Three starbase skies (night with stars and a moon, dawn with a striped sunset sun, day with a sun and clouds) built from dithered gradient bands, rolling hills, launch towers, rockets and tanks in silhouette, a lit ground edge and a road.

THE GAME
- Native 640x360, rendered at 3x into a canvas and scaled to cover its box with a ResizeObserver; pixel-crisp (imageSmoothingEnabled false, image-rendering pixelated).
- Physics: gravity 1100, a boost sets velocity to -270, horizontal speed 115; the truck tilts from -12deg on the climb to +30deg in the fall. Rocket pairs every step px with a gap of innerColumn px, and each gap may only drift maxGapShift px from the last. Presets: easy 200 / 96 / 50, normal 170 / 80 / 60, hard 145 / 70 / 72.
- Screens drawn on the canvas in Jersey 10: start ("CYBER BIRD", CLICK or SPACE keycaps), an in-flight HUD (a T+ mission clock, a charge timeline LIFTOFF / 25 / 50 / 75 / FULL, pixel gauges for score and altitude), and game over (charge, score and best gauges, NEW BEST, a PLAY button). Every 10 points charges 25%.
- Input: Space, Up or W or a click / tap boosts; keys only act while the game is at least half visible or fullscreen. Best scores per difficulty, run count and theme go to localStorage, each read and write wrapped in try/catch.
- Expose it as a factory, CyberBird('container', { difficulty, theme }), returning start, restart, destroy, getScore, getBestScore, getState, setTheme.

SECTIONS (data-section in order)
1. nav: a fixed blurred bar with the pixel truck and "CYBER BIRD", section links, a Night / Dawn / Day segmented switch and a pixel GitHub icon.
2. hero: the eyebrow "Game concept · One-button arcade" with a blinking pixel dot, the title, the lede, "Launch the game" (scrolls to and focuses the game) and "See the build"; then the console: a gradient-bordered frame with lamps, a live T+ clock, a difficulty switch and a fullscreen button, the 16:9 game screen (4:3 on phones), a telemetry row (score, best for the mode, charge, status) updated ten times a second, and a spec line (640x360 native, 3x pixel render, 0 image files, 1 html file).
3. marquee: big pixel words (LIFTOFF, 25% CHARGE … FULL CHARGE, CLICK OR SPACE) scrolling.
4. features: a six-column bento: a flight-model card with a mini canvas of the truck hovering, a tall obstacle card with an animated rocket gap, a sky card whose three canvas swatches switch the theme, a progression card with a conic gauge and a charge ladder, and a code card showing the embed API.
5. modes: three cards built from the presets with 12-cell meters for spacing, gap and drift, your best per mode, and a "Fly" button that switches difficulty and launches; the current mode is highlighted.
6. manual: control rows with pixel keycaps and four numbered pilot tips.
7. mission-log: bests per difficulty, total runs and peak charge read from localStorage, with a reset link.
8. cta: "YOU." with a cyan full stop and "Fly now".
9. footer: the credit and non-affiliation line, GitHub and X icons.

THINGS THAT BREAK
- Keep every sprite and sky in its own offscreen canvas and only drawImage per frame; regenerate a sky only when the theme or the stage size changes.
- Snap the scaled stage to whole game pixels, or the art shimmers as it moves.
- Load the Jersey 10 font (document.fonts.load) before the first canvas text, or the screens draw in the fallback face.
- Remove the game's listeners and cancel its animation frame in destroy(), because switching difficulty remounts it.

THE FLOOR
- Breakpoints at 960px (bento to two columns), 900px (modes, manual and log stack, links hide) and 640px (4:3 screen, two-column telemetry). No horizontal scroll at 390px.
- The game container is focusable with role=region and a visible focus ring, a polite status line announces start and game over, theme and difficulty switches use aria-pressed, decorative canvases are aria-hidden, and prefers-reduced-motion stops the marquee, starfield drift and mini scenes.`,
    preview: "hero",
    variant: "large",
    added: "Oct 18, 2026",
    demo: "/demos/cyber-bird-arcade.html",
    bestFor: ["indie games and game launches","interactive product demos","playful brand pages","pixel-art and retro sites"],
    style: ["dark","pixel-art","retro","playable-game","canvas","interactive"],
    credits: [
      {
        label: "Tesla Bird by Pavel Troshkin",
        href: "https://github.com/troshkinpavel/tesla-bird",
        note: "The open-source one-button game this page's game logic is built on; the sprites here are redrawn in code",
      },
    ],
    thumbnail: "/thumbs/cyber-bird-arcade.jpg",
    theme: "dark",
  },
  {
    title: "Kestrel AI Finance Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A bright fintech page for an AI finance platform: a 3D-tilting cash-runway dashboard with a self-drawing forecast chart and a live agent feed, orbiting integration chips, glossy diamond icon tiles, product rows with dark live panels, hover-flip agent cards and a demo booking widget",
    prompt: `Build a single-file HTML landing page for "Kestrel", a fictional AI platform for finance teams that puts agents to work on forecasting, the month-end close and fraud review. The page should feel bright, precise and expensive: a pale mint-white ground lit by teal, sky and amber light, chunky rounded display type, a floating 3D dashboard in the hero and glossy diamond-shaped icon tiles everywhere. Fictional company, customers and numbers, labelled as such in the footer. No images and no libraries: everything is inline SVG, CSS and one canvas, driven by one inline script.

STACK
- Google Fonts: Bagel Fat One (all display: logo, headings, big numbers, always uppercase), Poppins 300-700 (body and buttons), Space Mono 400/700 (labels, eyebrows, tickers, tags; 9-11px, uppercase, letter-spacing 1-1.6px).

THE SYSTEM
- Colours: page #f4f8f7, surfaces #fff / #f9fbfb / #eef4f3, ink #10201e, muted #5a6b68, faint #8a9a97, hairlines #e1eae8, a deep panel #0f2a2a with #e8f3f1 text used sparingly. Accents are stored as bare RGB triplets so they can take any alpha: teal 20,184,166, sky 56,152,236, amber 245,166,35, coral 255,118,92 (alerts only).
- --grad is a 120deg teal → sky → amber gradient. It fills gradient text (.gt, background-clip text), 2-3px underlines under headings (a background, not a border), the 2px rule on top of the nav, panel title bars and the footer. A --grad-soft version at about 13% alpha tints chips, strips and featured cards.
- Radii 8 / 14 / 16px. Shadows are soft and ink-tinted (0 4px 20px rgba(16,32,30,.06)); floating things add a large negative-spread drop and an inset 1px white top highlight.
- Texture: a full-page fixed layer with a pale teal-to-blue-to-cream gradient run through an SVG filter (feTurbulence fractal noise → feSpecularLighting with a point light → composite → overlay blend) so surfaces look like lightly embossed paper. Section headers and the hero reuse it.
- Diamond icon tiles (.dia): a 42px square rotated 45deg with a teal-sky-amber gradient body, inner highlights, a coloured drop shadow and a blurred gradient glow on hover; inside, a counter-rotated white bevelled square holds the icon. Sizes sm 28px and lg 64px, and an ink variant with a dark glossy core. Icons are one SVG sprite of duotone symbols: a gradient stroke (#0d8a7a → #1f6db5 → #c47c14) plus a pale gradient fill, with tiny drop shadows so they read as embossed; on dark surfaces a light gradient stroke.
- Buttons: the primary is a dark glossy teal-black gradient (#2b4643 → #0d1c1b) with a sweeping white shine, turning teal on hover and lifting 2px; the ghost is translucent white with a hairline. All 11px uppercase, letter-spacing 1.2px.

SECTIONS (data-section in order)
1. ticker: a fixed 34px strip with a pulsing teal "models live · 99.99% uptime" dot, a looping market ticker (FX, treasuries, SOFR, indices, up in teal, down in coral) masked at both ends, and three anchor links.
2. nav: a fixed blurred white bar below it with the gradient rule on top; the logo is an ink diamond plus "KESTREL" with the T in gradient and a mono "ai for finance teams" line under it. Four diamond icon links with tooltips that pop under them, and a "book a demo" primary.
3. hero: inside a big rounded white wrapper (max 1240px). Behind it: the texture, three slow drifting blurred aurora blobs, a 36px grid masked to a radial fade and slowly panning, and a canvas particle network (dots in the three accents linked by fading lines under 120px). Left column: a shining "NEW · autonomous close, now in beta" pill, the h1 "Finance that" over a rotating gradient word (thinks ahead / forecasts / reconciles / protects, swapping every 2.6s with a blur-and-slide), each line rising in from a mask; the lead, two buttons, three trust pills (SOC 2 Type II, bank-grade encryption, 40+ currencies) and a glass stat strip that counts up ($2.1b reconciled / mo, 600+ teams, 11 days saved). Right column, the stage: two dashed orbits turning in opposite directions carrying integration chips (12,000+ banks, ERP ledgers, card spend, payroll, FX rates) that counter-rotate to stay upright, and a white dashboard panel that tilts in 3D toward the cursor with a moving soft-light glare. The panel has a dark title bar (traffic-light dots, "cash runway · q4 2026", a pulsing "synced") with an animated gradient underline; three KPI tiles with sparklines (cash on hand drifts and flashes teal every few seconds); an "actual vs. AI forecast" chart whose line draws itself, then a dashed amber forecast with a confidence band fades in, a pulsing marker sits on today and a dot travels the line, and a scan light sweeps across; and an "agent activity" feed where a new row (ledger, sentinel, oracle, analyst, colour-coded) slides in every 2.4s, keeping four. Three glass cards float and bob around it with parallax (fraud sentinel blocked a wire; reconcile 1,284 matches with a filling bar; a ring gauge "oracle forecast 97.4%"). A logo marquee of eight fictional wordmarks closes the hero.
4. about: a strip with two small art tiles (radial glow plus rings or bars), pairs of diamond links and a scrolling description box.
5. platform: section headers are white cards with the texture, a blurred colour blob and a big diamond, numbered automatically with a CSS counter ("01."). Then three product rows (Forecast, Autonomous close, Sentinel): a tinted top bar of "explore:" links, a dark tab hanging from the top-left with two stats, the title with a gradient underline, copy and check pills, and on the right a deep-teal "live" panel with dashed rows and ok/warn/bad tags.
6. how-it-works: a pill-and-diamond subhead, then three stacked step cards inside a tinted tray: centred title and mono detail, a deep side panel with a big value and a gradient meter that fills on reveal, and a dark footer strip with a white number tab and a gradient top rule.
7. agents: four 250x370 cards (Oracle, Ledger, Sentinel, Analyst), each an SVG portrait in its accent. On hover the art slides out and blurs, the name slides away, and a detail panel staggers in with three facts and a dark role label sliding up from the corner.
8. proof: four stat cards with blobs and counting gradient numbers, a customer story with a dark date bar, an uppercase display quote, certification pills and a deep "12 → 2 days" card with a meter.
9. pricing: three plans, the middle one tinted with a hanging "most popular" flag and gradient price.
10. footer: one big closing section with the aurora, grid and texture: a "close the books on autopilot" headline, an email form that confirms in text, trust ticks, and a glass booking card (day buttons Mon-Fri, six time slots, the selection echoed in the confirm button, a confirmation line); then a five-column link grid with a pulsing "all systems operational" pill, a giant faint KESTREL wordmark with a light sweeping through it, and a bottom bar with small diamond social links and legal links.

THINGS THAT BREAK
- The orbit chips sit on rotating rings, so each chip must counter-rotate at the same speed or the labels spin upside down.
- Keep the stage tilt in CSS variables (--rx, --ry, --px, --py) set from one mousemove handler; the floating cards use the individual translate property so the bob keyframes (transform) still run. Skip the tilt on touch devices and with reduced motion.
- Reveal-on-scroll elements start at opacity 0: use one IntersectionObserver that also fills meters and starts count-ups, and force everything visible under prefers-reduced-motion.
- Gradient ids in the agent portraits and art tiles must be unique on the page.
- Size the particle canvas to its box times devicePixelRatio (capped at 2) and rebuild on resize, with the particle count scaled to the area.

THE FLOOR
- Breakpoints at 1000px (hero stacks, products and steps stack, two-column stats, one-column pricing) and 640px (orbits, floating cards, the tab stats and side links hide; the wrapper goes full width; the form stacks). No horizontal scroll at 390px.
- Real buttons for days and slots, a labelled email input, tooltips copied into aria-label, decorative SVG and the wordmark aria-hidden, and a prefers-reduced-motion block that stops every animation and transition.`,
    preview: "hero",
    variant: "large",
    added: "Oct 18, 2026",
    demo: "/demos/kestrel-finance.html",
    bestFor: ["fintech and finance software","AI agent platforms","B2B SaaS dashboards","CFO and accounting tools"],
    style: ["light","fintech","glassmorphism","3d-tilt","dashboard","interactive"],
    thumbnail: "/thumbs/kestrel-finance.jpg",
    theme: "light",
  },
  {
    title: "Starfork Game Studio Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A premium indie game studio page set in a cosmic toy world: eight sprite-rigged characters with real animation poses standing on a glowing planet, a character select with pose and frame-rate controls, a playable 30-second endless runner with coins and fireworks, live game cards, and a careers quiz",
    prompt: `Build a single-file HTML landing page for "Starfork Studio", a fictional nine-person indie game studio, and its upcoming game "Desk Dash!", a cosmic endless runner across the messiest desk in the galaxy. The page should feel like the game's own menus: a deep indigo night full of floating toy shapes, a cast of cute object characters that are properly animated like sprite sheets, white glossy pill buttons, and something you can actually play. Fictional studio, games, team, players and roles, labelled as such in the footer. No images and no canvas: every character, prop, cube, ring and the planet are inline SVG or CSS, driven by one inline script.

STACK
- Google Fonts: Bricolage Grotesque 400-800 with the optical-size axis (all text; big headings at weight 700, letter-spacing -0.045em), Lilita One (the game logo and game titles), JetBrains Mono 500/700 (eyebrows, labels, HUD).

THE SYSTEM
- Colours: page #07041a, text #f4f1ff, muted #aaa4d8 / #9d96cf, mint #93f7cc (eyebrows, selection, focus rings), pink #ff8fd8, lilac #c9b8ff, sky #86b6ff, coin orange #ffb347 / #ffc46b. Sections sit on soft radial glows of violet, pink and mint.
- Buttons: the primary is a white-to-lilac vertical gradient pill (#fff to #e6defc) with dark ink text, an inset bottom shade and a lilac glow, lifting 2px on hover. Ghost buttons are translucent white with a blurred backdrop.
- Eyebrows are "01 — The crew" style mono labels in mint. Gradient words use a pink, lilac, sky clipped gradient in Lilita One.
- A .stars utility paints a field of dot stars from stacked radial gradients.

THE CHARACTER RIG
- sprite(el, kind, pose, fps, once, inplace) draws one of eight characters in a 120x120 viewBox with feet on the same line: Pip (orange pumpkin wizard, blue hat with a glowing tip, magic pen), Nib (pink spiral notebook with a green shield), Volt (green TV robot with a dark screen face and orange arms), Drip (blue drop in a party hat and bow tie), Gem (green cube with a plus badge), Puff (peach flower cloud with blush), Kit (red toolbox with a sprout) and Tome (pink book with a bookmark).
- Each instance gets its own gradient ids: a body gradient, a core whose colours slowly hue-shift (SMIL), a rim light, a sheen, glowing eyes with lids in a body-mix colour, a soft shadow. A palette per character (light, mid, deep) and a "feel" (bob height, squash, lean) make each move differently.
- Poses are CSS classes on the root: idle, walk, talk, run, punch, jump, death. Every keyframe holds whole frames with steps(1, end), like a hand-timed sprite sheet; frames per cycle are idle 24, walk 16, talk 8, run 8, punch 8, jump 8, death 16, and --dur = frames / fps. Body, feet, shadow, accessory, eyes, mouths and an impact sparkle each have their own track. Idle has a signature fidget per character (Pip twirls the pen, Nib hops, Volt waves, Drip jiggles, Gem rocks, Puff breathes, Kit rustles, Tome swings), and death has specials (Drip melts, Puff poofs, Volt's screen switches off). Jump and death can play once and hold the last frame.

THE LOADER (covers the first seconds)
- A tiny inline script in <head> adds .sf-wait to <html>, which hides the page and shows a full-screen loader, so the first paint is cheap. The loader is a mini lap of the game on the hero's night sky with a planet rim: the "Starfork Studio presents" pill, the gradient "Desk Dash!" logo, and Pip running a purple track with moving seams, collecting six coins while a six-slot coin meter fills, with a status line (Waking the crew…, Polishing the cubes…, Stacking the desk clutter…, Tuning the jump…) and a mono percentage.
- Progress is real: the main script dispatching 'sf:ready' once every character is drawn, the display fonts loading (document.fonts.load), and window load. It also creeps on its own, holds at 97% until all three are in, shows at least ~0.9s, then Pip throws the victory punch, "Ready!", and the loader fades and scales out while the page fades in. Fallbacks at 12s and 15s so it can never trap the page.

SECTIONS (data-section in order)
1. nav: a fixed floating glass pill (blurred, hairline border) with a star logo mark, five links and a "Play the demo" button.
2. hero: full height, a radial indigo sky with stars, pink and blue glow blobs, and five glossy floating toys drawn in the same style as the characters (a mint crystal block, a magenta ring, a small blue gem, an orange hourglass coin and a violet cube): each has a body gradient, a sheen, a rim light and a molten core of rotating triangles merged by an animated goo filter, glowing in its own colour; plus twinkling four-point sparkles, all drifting. A "NEW · Starfork Studio presents" pill, then the h1 game logo "Desk Dash!" in Lilita One at clamp(114px, min(21vw, 25.5vh), 276px), line-height 0.84, each letter its own pastel gradient with a small offset and tilt that bobs out of phase (the "!" in a pale-to-periwinkle blue), with a hard and a soft drop shadow. A sub, "Play a lap" and a ghost "Meet the crew", and "Coming 2026 · PC · Switch". At the bottom, the curve of a planet: an SVG circle of radius 1700 with a hazy violet halo, a radial fill, faint latitude and meridian lines, a sheen and a pink-white-blue rim light. The eight characters stand on it at staggered heights following the curve, and every 2.6s a random one throws a punch.
3. crew: "Pick a character." A panel with a 4x2 radiogroup of square portraits (arrow keys; the picked one gets a mint border and glow) beside a preview card: a mini stage with stars and a grid floor showing the character large (popping in on change), a "pose · frames" label and a live fps readout, seven segmented pose buttons, a frame-rate select (6, 12, 24, 60 f/s), name, role, a quote, three gradient stat bars, and a button that reads "Accept Nib" (or "Ready to run" once accepted), which makes them the runner, shows a toast and scrolls to the demo.
4. play: "Thirty seconds of Desk Dash!" with keycaps for Space, Up and W. A 420px stage in a glass bezel: stars, a far layer of desk lamps, desks and a moon scrolling at 0.18x, a purple ground with moving seams, and a HUD with a conic countdown dial and a six-slot coin meter. The runner uses the rig (run, jump once, punch on a win, death once on a crash) at the frame rate picked above, jumps with Space, Up, W, a click or a tap (gravity 2100, jump 760 scaled by the character), and meets desk clutter (books, mug, no-wifi sign, hurdle, speaker) every 1.1-2.1s, none in the last two seconds, with six bobbing coins (hourglass, pencil) at two heights. Speed ramps up. A crash ends on "Crunch!"; reaching 30s ends on "Shipped!", or "Perfect run!" with all six coins: up to three stars, firework bursts and confetti, and "Run it back". A "Ready?" overlay names the runner before the start.
5. games: "Tiny worlds, big runs." Three cards with live character scenes: Desk Dash! (Drip walking, Pip running and Volt talking on a planet; a mint "Coming 2026" tag), Moonmilk (Puff under a big moon, 2024) and Paper Comets (a cube, a ring and Nib jumping, 2022). Cards lift on hover.
6. studio: "Nine people, one cat, a lot of cubes." Copy beside a 2x2 grid of big coloured numbers (9 people on the team, 3 games shipped, 2.4M players so far, 1 office cat), then three value cards (Makers, Thinkers, Organizers) with small geometric icons.
7. careers: "Find your role." A three-question quiz in a glass card (Are you a Maker, Thinker, or Organizer? / A build breaks at 6pm… / Your favourite part of a game is…), radio rows that light up mint, Back and Next (disabled until answered, "See my role" last), progress dashes. The result shows the matching character talking, "You are a thinker", the role (Gameplay animator, Systems designer, Associate producer), who you would work with, tags, Retake and a demo-only Apply.
8. footer: a CTA card ("Take one more lap.") with the whole crew lined up and two buttons, then the logo, a pulsing "Now building: Desk Dash!" pill, three link columns, the fictional legal line and a back-to-top pill.

THINGS THAT BREAK
- Give every character instance unique gradient, mask and filter ids, or all copies paint with the first one's colours.
- Size every mask region to the art (maskUnits userSpaceOnUse with a box just past the viewBox). A huge default region is rasterised every frame for every character and drops the page to about 10fps.
- Pose changes must swap the root's classes, not rebuild the SVG, so the keyframes restart cleanly and the colour cycle keeps its phase.
- Move the runner, obstacles and coins with transforms each frame; do not re-render the stage.
- Inline-block letter spans in the logo must have no whitespace between them, or the word spreads apart.
- The hidden toast sits below the fold with opacity 0 and no pointer events.

THE FLOOR
- One h1 (the game logo, with a visually hidden text copy), real buttons, a radiogroup with arrow keys, native radios for poses and quiz answers, a labelled stage with role=application, a status line for run results, visible mint focus rings.
- Under 1000px the hero shows six of the cast; under 760px the nav links and floating pieces hide, four of the cast remain and the stage is 340px tall. No horizontal scroll at 390px.
- Reduced motion stops the drift, twinkles, cubes, logo bob, character poses and fireworks; the runner still plays because the visitor starts it.`,
    preview: "hero",
    variant: "large",
    added: "Oct 17, 2026",
    demo: "/demos/starfork-studio.html",
    bestFor: ["game studios and indie games","playful product launches","interactive brand pages","careers and recruiting pages"],
    style: ["dark","playful","cosmic","characters","sprite-animation","interactive"],
    thumbnail: "/thumbs/starfork-studio.jpg",
    theme: "dark",
  },
  {
    title: "Social Work Agent Swarm Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A loud neo-brutalist page for a swarm of AI agents that help social workers: huge stencil type over op-art ring patterns, animoji characters whose eyes follow the cursor, a filterable crew of eight agent cards, an approval queue, guardrails and pricing",
    prompt: `Build a single-file HTML landing page for "Kind Swarm", a fictional swarm of small AI agents for social work: they draft intake notes, find benefits, watch housing waitlists, keep court dates, translate and chase follow-ups, and a person approves everything. The look is loud and warm: flame-orange and lime blocks covered in concentric op-art ring patterns, huge stencil type, hard offset shadows, cream cards, and every agent is an animoji character, a glossy rounded diamond with big cartoon eyes. Fictional product, agents, prices and numbers, labelled as such in the footer. No images and no canvas: the characters are inline SVG with CSS and a few lines of JS.

STACK
- Google Fonts: Stardos Stencil 400/700 (display, uppercase, line-height .92), IBM Plex Sans Condensed 400-700 with italics (text, and an italic "serif" accent for second lines), IBM Plex Mono 500/600 (labels, tags, prices).

THE SYSTEM
- Colours: ink #15111F, cream #F4EFE6, flame #FF5A3C (deep #F0361A), lime #D4FF3A, focus blue #3D7BFF, muted lilac #B9B0CC / #CFC6E8.
- The .rings background: concentric arcs built from radial gradients alternating two colours (--c1 / --c2) at a tile size (--s), with a faint shadow tone. Variants: flame for the hero and closing CTA, lime for the marquee and the "zero" band, ink for guardrails, and eight pastel stage colours for the agent cards (blue, butter, peach, lilac, pink, lime, sky, orchid).
- A grain layer (an feTurbulence noise filter, multiplied at 22%) sits on the coloured bands.
- Buttons are pills with a 3px ink border and an 8px hard offset shadow that grows on hover and collapses when pressed: ink, paper and lime variants; on dark sections the border and shadow turn lime.
- Labels are mono, uppercase, letter-spaced ("02 — The crew").

THE CHARACTERS
- One hidden SVG holds shared gradients (blue to violet, sun, peach to pink, periwinkle, lilac), a gloss highlight and a shade. Each character is a glossy rounded-diamond body (most in blue-to-violet, the Benefits Navigator in sun, the Housing Scout in peach) with an ink outline offset as a hard shadow (drop-shadow 8px 8px 0 ink), big white eyes with ink pupils, and a face that tells its personality: the lead and the scribe have an antenna curl and a smile; the navigator sparkles with stars; the scout holds a magnifier; the court keeper holds a "31" calendar and looks anxious; crisis triage sweats with worried brows; the follow-up runner wears sunglasses and points; the interpreter winks with a thumbs up; the records clerk is exhausted, one eye an X and one heavy-lidded.
- .bod bobs (squash and stretch, 3.4s), .eye blinks every 5.6s, .pupil follows the pointer through --px / --py set on <html> (up to 7px). .d1 to .d4 stagger the timing. Clicking a character replays a .react squash-and-jump.

SECTIONS (data-section in order)
1. hero (flame rings, with the nav inside): logo character and "KIND SWARM" wordmark, four links and an ink "Book a demo". Mono labels "Agent swarms for social work" and "Drafts, never decisions" over a 3px rule. Then the giant h1 "KIND / SWARM" in Stardos Stencil filled with a slowly drifting dark ring pattern (background-clip text), with the big lead character rising in beside "KIND". Under it the italic "They draft, fetch and remind." over "PEOPLE DECIDE.", a sub, "Meet the crew" and "See the guardrails", and an ink stats strip: 08 agents on the desk, 00 (lime) decisions without a person, 24/7 on call with a pulsing lime dot.
2. marquee (lime rings): a slow edge-faded marquee of "Intake drafted · Benefits found · Court date kept · Housing matched · Follow-up sent · Human approved", alternating filled and outlined words, paused on hover.
3. how (cream): "Many hands. one desk." Three numbered steps with huge outlined numerals: Say it plainly, Lanes not a chatbot (with a hand-off trace "scribe → navigator · 1.8s"), You sign it off.
4. zero (lime band): a giant "0" and "Decisions made without a person. Not one."
5. crew (ink): "Eight agents. one job each." with "Showing 08 of 08" and a row of filter pills (All, Intake, Benefits, Housing, Legal, Crisis, Language; aria-pressed, the active one lime). A grid of cream cards with a lime hard shadow: a ringed pastel stage with a white tag ("Most deployed", "Finds money"…), a black agent code (AGT-01…), the character (lifts and tilts on hover), the name, a black price pill ($14/mo, Free…), a description and a mono skills line. Agents: Intake Scribe, Benefits Navigator, Housing Scout, Court Date Keeper, Crisis Triage, Follow-up Runner, Interpreter, Records Clerk. Filtering hides cards whose jobs don't match and updates the count.
6. queue (cream): "Nothing sends itself." beside an approval-queue panel with three drafts (SNAP application, hearing reminder in Spanish, three shelter options), each with the agent, the household, and Edit / Approve buttons; compliance chips (HIPAA, 42 CFR Part 2, SOC 2, State retention rules) and a testimonial.
7. guardrails (ink rings): "Drafts. never decisions." and four rule cards: Consent, Approve, Escalate, Audit.
8. pricing (cream): "Pick your crew." Three plans with hard shadows: Pick & mix (white, $9 from, per agent / month, Start small), Full swarm (ink with a flame shadow and lime bullets, per caseworker / month, a lime Book a demo) and Agency (white, Let's talk, Contact sales), each with a diamond-bullet list.
9. book (flame rings): "Give the desk back." with "Book a demo" and "Thirty minutes. Bring a real case."
10. footer: logo, links and the fictional legal line.

THE FLOOR
- One h1, real buttons and links, characters inside labelled buttons ("Poke the Intake Scribe"), the filter as a labelled group with aria-pressed and a polite live count, visible blue focus rings.
- Grids collapse to one column on phones and the hero type scales with the viewport; no horizontal scroll at 390px.
- Reduced motion stops every animation and transition: bob, blink, marquee, pattern drift, rise-in and poke.`,
    preview: "hero",
    variant: "large",
    added: "Oct 17, 2026",
    demo: "/demos/kindswarm-casework.html",
    bestFor: ["AI agent and multi-agent products","social services and nonprofit tech","B2B products with pricing tiers","character-led brands"],
    style: ["bold","playful","neo-brutalist","stencil-type","characters","interactive"],
    thumbnail: "/thumbs/kindswarm-casework.jpg",
    theme: "light",
  },
  {
    title: "Game Dev Agent Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI agent for game studios whose hero is a playable three.js diorama: a toy biplane with a corgi pilot flying a low-poly cherry-blossom road under bloom and tilt-shift, a full-page loader, a crew picker that repaints the plane live, in-engine card stills and generated sound",
    prompt: `Build a single-file HTML landing page for "Sortie", a fictional AI agent for game developers by the fictional "Sortie Labs". Sortie works inside the studio's engine and repo: it writes gameplay code, blocks out levels, playtests the build overnight and files the bugs it finds. The page proves the claim with its hero: not a screenshot but a small live game scene in three.js that the visitor can fly without leaving the page. Fictional product, studios, quotes, awards and numbers, labelled as such in the footer.

STACK
- three.js 0.170.0 as an ES module through an import map: "three" maps to https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js and "three/addons/" to .../examples/jsm/ (EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass, RoomEnvironment, RoundedBoxGeometry, Horizontal/VerticalTiltShiftShader). The map must come before the module script. Everything is generated in code: no models, textures, images or audio files.
- Google Fonts: Fredoka 500/600/700 for display (rounded, game-like), Nunito 400/600/800 for body at 17px/1.6, and M PLUS Rounded 1c 700 loaded with the text= parameter set to only the kana used on the signs.
- Three scripts: a tiny classic loader script, a classic script for the page chrome, one module for the world. They talk through CustomEvents on document: "corgi:progress" ({p, label}), "corgi:coat" (a crew key), "corgi:play" and "corgi:shots" (a map of data URLs).

THE SYSTEM
- Tokens on :root: sky #8fbdea, sky-2 #c9def3, haze #f3e1de, peach #f6dccd, paper #fbf6ee, card #fffdf9, ink #39324f, ink-soft #6d6680, line #eadfd2, orange #e08a3c / deep #b9652a, blossom #f6b6c8 / deep #e7839f, leaf #5aa578 / deep #3f6b4f, gold #f2a93b, radius 22px, easing cubic-bezier(.2,.8,.2,1). A paper grain from an feTurbulence SVG data URI sits on the body and the crew section.
- Everything is outlined in ink like the game: cards and buttons have a 2-3px ink border and a hard 5-6px ink drop shadow that grows on hover and collapses on press. Primary buttons are gold pills, ghost buttons translucent white.
- The headline "Hand it the grind. / Keep the fun." is styled like game subtitle text: Fredoka 700 at clamp(50px, 7.6vw, 108px), gold fill, the second line orange, a thick white rim built from sixteen 5px text-shadow offsets, then a soft orange drop. No background-clip tricks: they fight the rim.
- One inline SVG <symbol> of a corgi face filled with var(--coat), var(--saddle) and var(--white). Custom properties inherit into <use>, so one symbol draws all four crew portraits, the dossier face, the capsule mascot and the hero fallback.

THE LOADER
- Only when WebGL exists, html gets .gl-wait and a fixed full-page loader covers everything: the hero's sky gradient, the wordmark with the same white rim, "An agent for game developers", a dotted trail with a small plane icon flying along it, a label and a percentage, and a rounded progress bar.
- The bar creeps on its own toward 68% while three.js downloads (an exponential ease), then follows the build stages the module reports ("Planting the trees" 70, "Painting the road" 84, "Fuelling the plane" 92, "Ready" 100). At 100 it fades out. A 25s safety timeout removes it regardless. Without WebGL it never shows.

THE WORLD (module script)
- An opaque renderer cleared to the horizon peach, DPR capped at 1.5, PCF soft shadows from a low golden sun (#ffe0b0, offset 26/15/12) that follows the plane, a warm rim light (#ffb27a) from behind it along the line of sight and a cool hemisphere fill. A RoomEnvironment PMREM at low intensity gives the clearcoats something to reflect. Fog peach from 34 to 118.
- A BackSide sphere with a gradient shader sky (horizon, haze, mid and top blues, plus a soft sun glow) follows the camera, matching the CSS fallback gradient.
- Ink outlines by inverted hull: a back-faced ink copy of each mesh scaled ~1.035-1.08. For instanced trees, a second InstancedMesh with the ink material and every matrix scaled up.
- Terrain: a 260x260 plane (84 segments, 64 on phones) with a sum-of-sines height, converted to non-indexed with one of five greens per triangle and a pale verge near the road. Dip vertices within 4.2 of the road so no facet pokes through it.
- The road is one closed centripetal CatmullRomCurve3 through 14 points on a wobbly ellipse, sampled 720 times into three ribbons with polygonOffset: an ink edge, a pale shoulder and a lavender-grey surface.
- Trees from a seeded PRNG so every load and the thumbnail match, at least 7 units off the road: 30% sakura (trunk plus three pink blobs), 15% pines (three stacked cones), the rest round trees, plus 1,100 verge grass tufts (500 on phones). Canopies, their ink hulls and the grass sway in the vertex shader via onBeforeCompile, phase-shifted by instance position; set customProgramCacheKey.
- The plane: a toy biplane built from RoundedBoxGeometry: a painted fuselage with a cream band and cowl, a tail with a blinking beacon, two cream wings with struts and sakura roundels, red and green wingtip lights that blink, a glass windshield, landing gear, a spinning propeller with a faint disc, and smoke puffs from the tail. The pilot is a corgi head (physical materials: velvet sheen fur, clearcoat eyes and nose with catchlights) in chrome goggles, with a bandana scarf whose vertices stream in the wind.
- Watching: the plane cruises 1.7 units over the road, banks with the turn rate, pitches with the climb and glances toward the pointer. Opening shot (skipped under reduced motion): the camera drops from 30 units up over 3.8s and settles on a three-quarter front view; the kicker and headline pop as it lands. On screens 900px and wider, setViewOffset shifts the frame by -17% of the width so the plane flies beside the copy; under 900px shift it vertically instead. Ease the offset.
- 24 glowing petal tokens hover along the road; flying through one bumps the HUD counter. 380 falling petals (160 on phones) wrap in a box that follows the plane. Nine unfogged cloud clusters far out.
- Post: EffectComposer with UnrealBloomPass (desktop only), then horizontal and vertical tilt-shift whose focus band follows the plane, then OutputPass.

PLAY MODE
- "Play a lap, right here" (and "Fly the demo" further down) hands over the controls: a chase camera, W faster, S slower, A/D bank, Shift boost, kept inside a 100-unit radius. Tokens stay gone until all 24 are taken, then a toast and they return. Esc or "Stop playing" exits and the plane eases back onto the nearest road sample over 1.2s. Capture keys only while playing; preventDefault only on arrows and space. On touch screens a four-button pad appears, driven by pointer capture.

SECTIONS (data-section in order)
1. nav: fixed, transparent over the hero, paper with blur after 40px. Plane-in-a-gold-circle logo, How it works / Crew / Briefing / FAQ, a gold "Request access" pill.
2. hero: kicker pill, headline, a sub, the play button (hidden until the world renders) and "Request early access", a controls note and a WORKS WITH row of engine chips (Unity, Unreal, Godot, Custom engines). A vertical white nameboard reading ソーティー sits top right on wide screens. A HUD chip shows petals, the current crew member and a sound toggle.
3. world (How it works): three ink-bordered cards whose inline SVG art is replaced by in-engine stills: reads the whole project first, works in the engine not beside it, flies the long jobs overnight.
4. corgis (The crew): a radiogroup of four specialists, each the same agent tuned for a job (Mochi gameplay, Kinako level design, Azuki playtest and QA, Yuki build and release), roving tabindex and arrow keys. A dossier shows the face, role, bio and Code / Editor / Testing bars out of 5. Choosing one fires "corgi:coat": the pilot's coat and the plane's paint change live, and a second small renderer spins a full 3D corgi on a pink disc in the dossier.
5. controls (Briefing): copy about briefing it like a teammate (plans, asks, opens a pull request; nothing merges without a person) beside a dark timestamped sortie log in keycap style.
6. stats: an ink band of four gold numbers (42 studios, 18,000 runs a night, 9 hrs, 0 unreviewed merges) that count up once on arrival and read correctly before that.
7. press: one big pull quote with a giant blossom quote mark, three laurel badges (the branch drawn once along a quadratic curve and mirrored) and two short quotes.
8. faq: native details/summary with a + that rotates to x.
9. cta: a store-style card with engine pills, a local-only email form (nothing is sent) with a dark "Request access" button, and a 4:3 key-art capsule rendered from the scene with the logo over it.
10. footer: logo, links and the fictional legal line.

PREMIUM DETAILS
- Station signs as section labels: each section is a stop on the line (SO02 to SO07) with a green-bordered code, the name in kana, the English name and a green band linking to the neighbouring stations.
- In-engine stills: after the opening shot, render four fixed shots through the main renderer (down the blossom tunnel, close on the pilot, flying away into the haze, the capsule key art) with toDataURL, restore the hero and send them in "corgi:shots"; the SVG art stays until each image loads, then cross-fades.
- Sound with Web Audio, off by default (HUD toggle or M): brown-noise wind through a wandering band-pass, pentatonic chimes, a far level-crossing bell, and a pluck per petal; suspended while the tab is hidden.
- A slight 3D tilt toward the pointer on cards and the capsule, CSS petal drift on the paper sections, a pop on the petal counter.

THINGS THAT BREAK
- Never give two elements the same id: a canvas and a section both called "world" let a ResizeObserver grow the canvas and the hero in a loop.
- Keep the static fallback (CSS sky, two hills, the SVG corgi) until the module has rendered a frame and added html.gl-on, and gate the play and sound buttons on that class, so a failed CDN never leaves a blank hero or a dead button.
- Pause the loop when the hero is off screen or the tab is hidden. Under prefers-reduced-motion render one still frame; play mode still animates because the visitor asked.
- The play buttons scroll with window.scrollTo, not scrollIntoView, which would also scroll a page embedding this one.
- Show the saddle meshes only when the coat has a separate saddle colour, or they z-fight.

THE FLOOR
- One h1, a main, aria-hidden on the canvases and decorative SVGs, labels on the movement pad, role=status on the toast, loader label and form message, visible focus rings.
- No horizontal scroll at 390px: grids collapse under 1000px, nav links hide under 760px, the HUD moves left.
- Reduced motion also turns off reveals, the petal drift, button transitions and the loader's bob.`,
    preview: "hero",
    variant: "large",
    added: "Oct 17, 2026",
    demo: "/demos/sortie-game-agent.html",
    bestFor: ["AI agents and developer tools","game studios and game dev tooling","interactive product heroes","playful launch and waitlist pages"],
    style: ["light","playful","three.js","low-poly","toon-shaded","interactive"],
    thumbnail: "/thumbs/sortie-game-agent.jpg",
    theme: "light",
  },
  {
    title: "Peptide Skincare Store Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A warm, cream-toned peptide skincare store whose hero is a spinning sphere of code-drawn product tiles behind a glass search bar that types its own queries, with springy lab-style product renders, a draggable Dose lab vial, bubble-popping add-to-bag and a day-to-night routine",
    prompt: `Build a single-file HTML landing page for "Cosmos", a fictional peptide skincare brand that lists every peptide at its exact dose. The look is a quiet premium beauty store: warm cream ground, near-black ink, Wix Madefor type set tight, IBM Plex Mono for every number, glass pills, soft studio shadows and one amber accent. Every image on the page is an SVG drawn from code; there are no photos. Fictional brand, products, prices and journal issues; the peptide INCI names are real ingredients but doses and claims are illustrative.

STACK
- GSAP 3.12.5 and ScrollTrigger from cdnjs, then one inline script. Google Fonts: Wix Madefor Display 500-800 (headlines, buttons), Wix Madefor Text 400-600 (body), IBM Plex Mono 400-500 (eyebrows, doses, specs).
- Every visual is generated: a MODULES map of functions (u, r) => SVG markup, where u is a per-instance id prefix and r a seeded mulberry32 random. moduleSVG(name, seed, hue, viewBox) wraps it in an <svg preserveAspectRatio="xMidYMid slice">. Any element with data-module is filled on load.

THE SYSTEM
- Tokens on :root: bg #f4f2ec, bg-soft #faf8f1, surface #fff, ink #0a0a0a, ink-2 #3d3b36, muted #6f6c64, line #dedad0, amber #a85a22, glass rgba(190,184,170,.45) with a 45% white border. Safe-area gutters max(24px, env(safe-area-inset-*)), 16px under 720px.
- body::before is a fixed layer of three soft radial washes (white centre, peach lower-left, blue upper-right).
- Headlines Wix Madefor Display, letter-spacing -0.025em, line-height 1.02, text-wrap balance. Pill buttons 48px: a black primary, a 1px ghost. Mono eyebrows 12px, 0.08em, uppercase.

SECTIONS
1. nav: sticky, a 60px glass pill (72% cream, blur 18px), the logo (a ringed planet mark + "Cosmos" at 800), four links, a black "Bag" pill with a white mono count badge that pops (GSAP back.out) when items are added.
2. hero: a two-column head ("Peptides, by the percent." at clamp(48px, 8vw, 112px)/800, an intro and two buttons), then a 16:9 stage (max 760px tall):
   - a 540px white sphere with overflow hidden and an inner vignette, holding a rotated 4x4 grid of 16 small generative tiles (serum bottle, peptide bead chain, orbit, jar, faceted crystal, linen bag, kit, tube, blurred blob, drop, arch) at inset -8%. GSAP turns the grid 360deg over 200s; clicking the sphere spins it 90deg, pulses the tiles and reshuffles them with new seeds.
   - a 620x78 glass search bar centred on top: white icon, a blinking 1px caret divider, a readonly input whose placeholder types and erases a cycle of queries ("Copper peptides", "Matrixyl for firmness", "Argireline for lines"...), and a 60px white round button with a 3x2 dot grid that spins and pulses the cards. Clicking the input scrolls to the formulas.
   - six float cards around the sphere (rotated -4 to 4deg, 14px radius, a white 4px halo, a glass sheen and a bottom fade), each a cropped product render (data-vb is the viewBox) with a "Name | dose" mono label. They bob, follow the mouse with parallax, scale on hover, spin and re-render on click, and scatter outward as the stage scrolls (ScrollTrigger scrub).
   - Intro timeline: the sphere scales and rotates in, tiles pop from the centre, the bar stretches in, the cards land at random. .js-ready hides these only when GSAP loaded and motion is allowed.
3. ticker: a mono marquee of peptide INCI names, each dose in amber, duplicated group with aria-hidden, 50s loop.
4. how-it-works: three steps with a 1px ink top rule, mono numbers 01-03, 26px titles.
5. formulas: "Six peptide formulas. No filler." Filter chips (All, Fine lines, Firmness, Barrier, Recovery; aria-pressed) with a live mono count and an empty state. Six product cards in a 3/2/1 grid: a 26px-radius card with a 10px inset media plate (4:4.2, 18px radius, studio light overlay) holding an animated render, a mono "No. 0X" index, a glass class pill (Carrier, Signal, Neuropeptide...), a big white dose ("10%" + mono label); then name and price, a one-line description, a three-column spec ledger (Peptide / pH / Size) with hairlines, concern tags and an "Add" pill whose + icon turns 90deg on hover and swaps to a check on amber for 1.6s.
6. dose-lab: "Slide the vial. Meet the formula." A 30px-radius deep-teal slab (radial #2c6a8c → #1B4965 → #0F2939, cream #FFFCF9 ink, 8% noise): on the left an 800x420 SVG scale from 0 to 10% with ticks, a cream rail, a progress line and five coloured stop dots (1% GHK-Cu, 2% Tripeptide-8, 3% Matrixyl 3000, 5% Matrixyl, 10% Argireline); a big graduated test-tube vial rides the rail as a role="slider" handle. Dragging it moves a spring follower (velocity += (target - x) * .3, then *= .82) so the tube swings, the liquid tilts with velocity and its level rises with the dose, bubbles stream off it, a ghost 230px dose watermark changes behind, and on release it elastic-snaps to the nearest stop and pops a value bubble. Arrow keys, Home and End step between stops. On the right a readout (dose at up to 104px, class pill, INCI, trade name, what it does, "Found in" formula, a cream button) that restaggers in on each stop. On first view the vial slides in from 10% to 5%.
7. ingredients: a sticky labelled peptide figure beside a table (Peptide INCI + trade name, Class, What it does, Found in, Dose right-aligned tabular) in an 18px-radius box that scrolls sideways on its own at min-width 680px. Each dose cell becomes a small outlined vial filled to the dose in its class colour, with rising bubbles; the vials drop in with an elastic settle when the table scrolls into view and slosh when a row is hovered.
8. routine: a black 28px-radius slab: an animated plinth render on the left, then "Four peptide formulas, already in order.", Morning and Evening numbered lists, a cream "Add the routine" button and $148 with $170 struck through.
9. journal-footer: one dark 36px-radius card (#0c0b0a, amber and blue radial glows, a noise overlay): a pulsing-dot eyebrow, a gradient-clipped headline, an email pill form with an inline mail icon and a validating submit (amber note, aria-live), three check perks; a fanned stack of three journal covers (renders with masthead, issue number, title) that floats and spreads on hover; four link columns; a base row with a back-to-top link; a giant clipped "Cosmos" wordmark with a sweeping shine.

THE PRODUCT RENDERS (SMIL, each in a 0-100 viewBox)
- The six product cards use a lab style that matches the Dose lab vial: cream outlines, flat cel-shaded fills with a darker side band, a long offset drop shadow (feOffset dy 3.6), a graduated measuring shelf, dashed shines, rising bubbles with a dashed highlight arc, a slow dotted ring behind. Each product sits in a .tilt group with its liquid in a clipped .slosh group (data-cy = the surface), so script can tilt and slosh it.
- Each card has data-accent. Moving the cursor across the media drives the same spring follower: the bottle tilts up to 7deg, the liquid sloshes up to 24deg and fast moves stream accent bubbles; it settles back when the pointer leaves.
- Shared studio helpers: a radial backdrop, a floor glow, a top spotlight, a vignette and 6% fractal grain on top; an animated contact shadow that shrinks as the product bobs; a skewed light sweep clipped to the product; glossy radial beads; twinkling dust; and an orbit() helper that draws beads on a tilted ellipse twice, once behind and once clipped to the near half in front, so they pass around the bottle.
- pCopper: a dropper bottle of blue serum with a sloshing surface, copper ions orbiting, blue spheres floating. pMatrixyl: a cream jar under a floating gold lid, a collagen triple helix scrolling behind. pArgireline: an amber bottle while three expression lines smooth flat and return, and a drop falls and ripples. pEyeGel: a tube in a field of rising gel bubbles with cooling floor ripples. pBarrier: a green-lidded jar under a hexagon lattice that lights up in waves from the centre. pBooster: a gold-serum bottle with six coloured peptide beads orbiting. pPeptide: Pal-KTTKS as five glossy labelled amino acids on a bobbing backbone with a wavy C16 tail, dimension brackets and a scanning line. pRoutine: four products on a plinth while a sun then a crescent moon cross a dotted arc, the sky shifts from warm to night over 16s, MORNING/EVENING swap and the AM or PM products brighten.

FX LAYER
- A fixed, pointer-events-none SVG overlay (z-index 80) with a long soft shadow filter. Helpers: bubbleCloud (small circles that drift up with expo.out and shrink away), valueBubble (a coloured circle with a dashed arc and a label that squash-and-stretches in with two elastic eases, rises, then pops) and popBurst (eight radial strokes that travel outward and vanish). "Add" fires a "+1" bubble in the card's accent from the button, the routine button an amber one, the search button a bubble cloud, a valid signup a burst.

MOTION AND PERFORMANCE
- An IntersectionObserver pauses each render's SMIL clock (pauseAnimations) when it is off screen.
- Reduced motion: renders jump to 2s and pause, the CSS spins, ticker, caret and wordmark shine stop, and the GSAP intro, parallax, bobbing and scroll scatter are skipped.

RESPONSIVE
- Under 1100px the sphere is 460px, cards shrink and lose labels, the ingredient figure and routine stack. Under 860px the nav links hide and steps stack. Under 720px the stage drops its aspect ratio, the sphere is 320px, only two float cards remain, tucked into opposite corners. No horizontal scroll at 390px.

THINGS THAT BREAK
- Every gradient, clip and filter id inside a render must start with u, or two copies of the same module on the page steal each other's defs.
- The float cards are absolutely placed inside the stage; keep only two under 720px or they push the page wider than the viewport.
- Don't hide the hero in CSS alone: only add .js-ready once GSAP has loaded, or a CDN failure leaves a blank stage.`,
    preview: "hero",
    variant: "large",
    added: "Oct 17, 2026",
    demo: "/demos/cosmos-peptides.html",
    bestFor: ["skincare and beauty brands","DTC ecommerce stores","ingredient-led or science-backed products","product catalogs with filters"],
    style: ["light","warm","premium","glassmorphism","svg","generative","gsap"],
    thumbnail: "/thumbs/cosmos-peptides.jpg",
    theme: "light",
  },
  {
    title: "AI Work Assistant Chat Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A soft pastel AI-assistant launch page whose hero is a working chat: it types its own first question, streams answers with thread cards, drafts and calendar slots, and is ringed by agent badges that spin, tick and fail on their own",
    prompt: `Build a single-file HTML landing page for "Tidewell", a fictional AI assistant for work that reads your inbox, calendar and docs, then summarizes, drafts and schedules. The look is quiet, light and pastel: a near-black ink on white, Geist type set tight, soft blue and violet gradients, a faint page-wide grid that lights up around the cursor, two blurred glows behind a centred hero, and a real, scripted chat as the centrepiece. Full dark theme included. Fictional brand, investor, customers, inbox senders and testimonials, labelled as such in the footer.

STACK
- No libraries. Google Fonts: Geist 400-700 for everything, Geist Mono for times, step numbers and keycaps.
- One inline script. Avatars are gradients, icons are inline 24px stroke SVGs, integration marks are letters on tints.

THE SYSTEM
- Tokens on :root: bg #ffffff, bg-soft #f7f7f8, surface #ffffff, ink #0f1115, ink-2 #4f535b, ink-3 #9b9b9b, line #ececee, line-strong #e2e2e5, badge #f5f5f5, blue-1 #dbe5ff / blue-2 #cbdaff / blue-ink #1d6ad9, violet-1 #dfceff / violet-2 #d4bbff / violet-ink #422c6f, mint-1 #d3f5e4 / mint-ink #136c45, amber #d97706 / amber-soft #fff4e0, red-soft #ffe2e0 / red-ink #b42318, button #0f1115 on #fff.
- Two shadows: sm (0 1px 2px, 0 2px 8px at 4-5%) and lg (a three-layer drop out to 0 40px 80px -24px at 18%), plus two glows rgba(134,169,255,.45) and rgba(192,159,255,.45).
- A dark set (bg #0c0d10, surface #16171b, ink #f3f3f4, darker pastels, inverted button) applied by prefers-color-scheme: dark unless :root[data-theme="light"], and by :root[data-theme="dark"].
- Headlines are Geist 600-700 with letter-spacing -0.05em to -0.065em; the hero h1 "the ai for work" is clamp(48px, 9vw, 112px)/0.92 with "work" in ink-3. Pills everywhere: 40px buttons (48px large), a black primary with an inset highlight, a ghost with a 1px line.
- The logo is two overlapping 18px rounded squares, a blue gradient over a violet one with mix-blend-mode multiply (screen in dark).

SECTIONS (data-section in order)
1. nav: sticky, 78% bg via color-mix with saturate(180%) blur(14px), a hairline after 8px of scroll. Logo, Product / Integrations / Customers / Pricing, Sign in, Start free. Links hide under 860px.
2. hero, from back to front:
   - the two blurred glows (the grid now belongs to the whole page, below)
   - an amber eyebrow pill ("backed by foundry row", with an orange F tile), the h1, a sub, two CTAs and a small note
   - a 620px chat card (28px radius, the lg shadow, a top-light gradient border via mask-composite). Its header has an avatar, "Connected to your workspace" with a live green dot, and Mail / Calendar / Docs source pills. A 400px scrolling body starts with "Good afternoon, Jordan". The footer holds three suggestion chips, a composer (input plus a black send button, disabled when empty) and a hint row with an Enter keycap.
   - floating cards hanging off the chat edges, each bobbing with its own rotation through a --r variable: an email preview (left -170px, -4deg), a blue "Summarize this email…" command (top right, 3deg) and a violet AI summary (right -190px, 3.5deg)
   - six agent badges scattered around the stage (Analyze, Categorize, Summarize, Reply, Schedule, Archive)
3. logos: a muted row of six fictional wordmarks in varied faces.
4. product: three alternating feature rows, copy plus a 1/0.86 rounded canvas tinted with a radial pastel:
   - a stack of an email card, a command pill that types and erases three commands with a blinking caret, and a summary card, all floating
   - an inbox with category tabs (All / Needs reply / FYI / Later, with mono counts) that filter seven rows with coloured tags
   - a draft with Direct / Warm / Brief tone buttons that cross-fade the body text
5. how-it-works: three bordered step cards with mono 01-03.
6. integrations: a hub panel (36px radius, pastel radial washes, a masked dot grid): three tiles each side (Mail, Calendar, Team chat / Docs, Wiki, Tasks), each a 44px tinted icon tile coloured by its own --c, a name, a one-line meta and a mint "Live" chip, wired to a central 132px Tidewell mark with two expanding rings and a "6 sources in sync" label. The wires are one SVG with a 0-100 viewBox stretched over the panel (preserveAspectRatio none, vector-effect non-scaling-stroke): faint base curves plus gradient pulses that travel along them using pathLength=100 and a 10/90 dash. A footer strip lists the trust points and "40+ more via API". Under 900px the hub moves on top, the tiles go two then one per row, and the wires hide.
7. testimonials: a header with prev/next arrows and a full-bleed scroll-snap rail of eight 360px quote cards with gradient initials avatars. The rail pads itself to the content column with max(24px, (100vw - 1112px) / 2).
8. pricing: a Monthly / Yearly toggle (-20% in mint) that swaps prices from data-m / data-y. Starter $0, Pro $20 or $16 (violet-washed, "Most popular", lg shadow), Team $32 or $26 per seat.
9. faq: four native details rows with a + in a ring that rotates 45deg.
10. cta: a dark rounded card (ink background, bg text) with the two glows blurred inside, "get your afternoons back".
11. footer: brand blurb, three link columns, and a base row with the fictional notice.

PAGE GRID SPOTLIGHT
- One absolutely positioned layer behind main and footer (z-index 0 vs 1): a 64px grid at 4% ink, centred and faded in over the first 160px. On fine pointers a 520px patch of the same grid in blue with violet dots at the crossings, masked to a soft circle, plus a 560px blurred blue-violet glow, ease toward the cursor (12% per frame) in page coordinates, so they stay put while you scroll. Offset the patch's background-position by the base grid's centring so its lit lines land exactly on the base lines. Fade both out when the pointer leaves the window.

THE SCRIPTED CHAT
- When the chat is 40% on screen, wait 0.9s, type "Summarize what I missed this morning" into the composer character by character, then send it. Stop if the visitor has touched the input or a chip.
- A keyword router sends a prompt to one of four canned responses: draft/reply, summary/missed, afternoon/schedule/calendar, or a fallback that explains it is a demo inbox.
- Each response shows a small spinner with a "thinking" line (Reading 14 new emails…) for 1.1s, then streams its text word by word, 22-52ms per word. Rich blocks drop in between:
  - three thread cards with avatar, sender, subject, a one-line note and a Reply / Approve / Conflict tag
  - a draft card whose Send button turns mint and says Sent
  - three calendar slots, one protected violet focus block
- User bubbles are blue gradients with a 6px tail corner. Messages enter with a short translate-and-fade.
- Scroll the chat with its own scrollTop. scrollIntoView would also scroll any page embedding this one.

AGENT BADGES
- Each badge is a pill with an icon slot that expands from width 0 to 18px with an overshoot curve, and a label whose width animates.
- Each one loops on its own: idle, then processing (a spinning arc, "Reading…"), then success (a tick drawn with stroke-dashoffset, a small pop) or, about 6% of the time, error (a drawn cross and a shake), then back to idle.
- Labels swap with a blur: the old one slides down and out, the new one drops in. Measure the new label in a hidden span first and set the width before the swap, or the pill snaps instead of stretching. Clicking a badge steps it through the states.

THINGS THAT BREAK
- body needs overflow-x: clip, not hidden, or the sticky nav stops sticking.
- The floating cards and badges hang outside the chat. Hide the cards under 1040px and the badges under 1180px, or they cause horizontal scroll at 390px.
- The floating animation and the static rotation share transform, so the keyframes must include rotate(var(--r)). Otherwise the cards snap upright while they bob.
- The inbox and voice buttons need role=tab / aria-selected and aria-pressed kept in sync by the script, not only a visual .on class.

THE FLOOR
- One h1, a main, labelled send and arrow buttons, aria-live on the chat body, decorative badges aria-hidden and out of the tab order, visible focus rings.
- prefers-reduced-motion collapses every animation and transition, caps each scripted wait at 40ms, skips the badge loops and stops the typing loop after one command.`,
    preview: "hero",
    variant: "large",
    added: "Oct 16, 2026",
    demo: "/demos/tidewell-ai-for-work.html",
    bestFor: ["AI assistants and copilots","email and productivity apps","B2B SaaS launches","products with a demoable chat"],
    style: ["light","minimal","pastel","chat-ui","dark-mode","interactive"],
    thumbnail: "/thumbs/tidewell-ai-for-work.jpg",
    theme: "dark",
  },
  {
    title: "Maasai-Inspired Event Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A cultural events studio page on Maasai-inspired dusk: a Rive hero rebuilt in SVG where four warriors leap into the adumu, a scroll-driven frieze of leaping silhouettes, generated beadwork and gala art, and textures cut from the warriors' own shapes",
    prompt: `Build a single-file HTML landing page for "Sundune Events", a fictional studio that hosts festivals, retreats, ceremonies and galas co-hosted with Maasai communities in Narok, Kajiado and Laikipia. The hero recreates a Rive animation (a Maasai-inspired event hero banner) without any Rive runtime, and every texture and illustration on the page is drawn in code: no image files. Warm dusk palette, an editorial serif, and copy that presents community hosts as partners, not performers. Fictional studio, clients, dates and numbers, labelled as such, with a credit line for the Rive design it recreates.

STACK
- No libraries. Google Fonts: Instrument Serif (headlines, numbers, the giant footer wordmark), Jost 400-600 (body 17px/1.65, nav, labels), Archivo Black (the giant MAASAI word in the hero).
- One inline SVG sprite: a front-facing warrior, a profile warrior, a bird, a cattail reed and an acacia as <symbol>s, plus the paints the generated art shares (gradients, patterns, blur and bead-shadow filters, an feTurbulence grain).

THE SYSTEM
- Tokens on :root: bg #ead5b8, surface #f2e3cd, ink #1c0b06, ink-soft #5e3d2c, accent #b3261e, hairlines at 18% and 38% ink, the shuka-red band set (red #b3261e, red-ink #f8e9d4, red-soft #f3cdb8, a translucent red-line and red-tex), and the dusk sky #cf7f3c / #e19a57 / #efbd85. A full dark set (bg #140805, ink #f1e2cc, accent #e5574a, red #9c1f18) under prefers-color-scheme and :root[data-theme="dark"].
- Layout is editorial: hairline rules instead of cards, big serif headlines (clamp(52px, 6.6vw, 108px), line-height .94, tracking -.018em), pill buttons, underline links that wipe away on hover.
- Textures cut from the warriors' own geometry, built once in the script as SVG data URIs and used as CSS masks so their colour comes from tokens: --m-shuka (the three folded-cloth panels of the front warrior's shuka, mirrored and tiled), --m-spear (tip, shaft and butt spike, repeated as a fence-like rule), --m-collar (the beaded collar V, as a chevron row). The footer wordmark uses the shuka texture through background-clip:text.

THE HERO
- A fixed 1672x940 stage (the original artboard), aspect-ratio 1672/940, width max(100%, hero height x 1.7787), anchored to the bottom and centred; every part inside is positioned in % of that box. Layers back to front, each with a data-depth for pointer parallax: sky (sun glow, a breathing sun disc, drifting flat clouds), faceted mountains with a haze band, the ground with flat-topped acacias, rocks and tufts, the word MAASAI in Archivo Black (x 600, y 773, textLength 1000, a cream-to-peach gradient, rising in on load), four warriors as buttons, a flapping bird flock drifting west, swaying reeds and seeded spiky grass clumps, then grain.
- Warriors: two front-facing (black and rust shuka, red belt, white edge lines, diamond-tipped spear) and two in profile (long rust robe, ochre sash, bracelets), at left 51.02% / 59.92% / 66.18% / 75.27% of the stage, two of them mirrored by flipping the inner <svg>.
- Copy on the left: a place line with a rule ("Narok, Kajiado and Laikipia, Kenya"), the h1 "Gatherings / that rise." whose two lines slide up out of masks, a lede, a dark pill "Plan your event", an underline link to the season, and a hint "Tap a warrior to see the adumu, the jumping dance" with a small spear icon.
- The adumu: one Web Animations leap shared by the hero warriors, the frieze silhouettes and the enquiry warrior: a crouch (translateY 2%, scaleY .93), a straight-legged spring to about -62% of its height, a short hang, an ease-in fall and a landing squash, with the shadow shrinking. On load the four leap left to right once the word has risen; after that one random warrior leaps every 9-13s while nobody is interacting.

SECTIONS (data-section in order)
1. nav: fixed, transparent over the hero; after 40px it gets a blurred bg and shrinks from 84 to 66px. Logo is three beads plus "Sundune" in the serif. Under 900px a Menu button opens a full-screen shuka-red sheet with huge serif links.
2. hero as above. A fixed spear on the right edge (wide screens) tracks scroll progress.
3. frieze: a shuka-red band where huge serif words (Story, Song, Fire, Land, Welcome) alternate with black warrior silhouettes. It drifts sideways with scroll and the silhouettes leap in a wave whenever you scroll, with a note about the adumu.
4. approach: a manifesto paragraph whose words light up one by one as you read down, then three principles with line icons in a ruled row (Community-led, A fair share, Light on the land).
5. experiences: a list of four big serif rows (Cultural festivals, Leadership retreats, Weddings and ceremonies, Sunset galas) with guest counts. Hovering or scrolling a row swaps a sticky 4:5 frame of generated art and its caption:
   - a beaded collar of nine rings in the six bead colours with a fringe of strands and metal drops, every bead placed by code on leather
   - a dawn ridge over the Laikipia plateau with mist, acacias and three walkers
   - two interlocked beaded bangles on a checked shuka
   - a long gala table in true perspective running down to a fire at dusk, with guests, plates, glasses, hurricane candles, strings of lights on posts, stars, a crescent moon and rising sparks
   On phones each row carries its own copy of the art inline.
6. stats: a serif sentence with counted-up accent numbers (140 gatherings, 9,400 guests, 6 partner communities), then ten bead circles where three fill in red, blue and orange beside "30% of every fee goes straight to the host community's own fund". A spear rule follows.
7. season: the 2027 season as a ruled list of six dates with a serif date, the event, a strand of 12 beads filled for places taken, a status (accent when few places are left) and an Enquire or Join waitlist button that prefills the form.
8. process: three steps whose top rule draws itself left to right and ends in a spearhead.
9. testimonial: a collar-chevron rule, a large serif quote and a named fictional client.
10. cta: on shuka red, "Let's plan something that lasts", a black warrior who leaps when the form is sent, and a local-only form: occasion chips (radio inputs), a guests range with a serif readout, a month select and underline inputs for name and email (placeholder you@company.example). It validates and thanks the person by first name; nothing is sent.
11. footer: four columns, then a giant "Sundune" wordmark filled with the shuka texture, the legal line with the Rive Marketplace credit, and Back to top.

THINGS THAT BREAK
- A <use> inside its own <svg> needs viewBox "0 0 w h". Copying the symbol's own viewBox onto the instance draws the shape outside its frame.
- Scope full-size SVG rules to direct children (.layer > svg) or the nested reed and bird SVGs collapse to zero height. Give the grain SVG an explicit width and height or it renders at 300x150.
- Mirror a warrior by flipping its inner <svg>, never the button, so the leap's translate and transform-origin stay upright.
- The masks only exist after the script sets them; set them first thing so nothing paints blank.
- Clone the experience art for phones after the generated beads, stars and lights are drawn, or the clones are empty.
- The frieze moves the track with transform from a rAF-throttled scroll handler, and its leaps are rate-limited to one wave every 1.5s.

THE FLOOR
- One h1, a main, labelled warrior buttons, a dialog role on the menu sheet with Escape to close and focus moved in and back, role=img with labels on the bead strands and the share beads, role=status on the form message, visible focus rings.
- Under 900px the hero stacks the copy over a window onto the stage centred on the warriors; no horizontal scroll at 390px.
- prefers-reduced-motion stops the flock, sway, sparks, flicker, frieze drift and ambient leaps, shows the counted numbers at once and lights the whole manifesto; a press still plays one leap.`,
    preview: "hero",
    variant: "large",
    added: "Oct 16, 2026",
    demo: "/demos/maasai-event-hero.html",
    credits: [
      {
        label: "Maasai-Inspired Event Hero Banner Concept — Rive Marketplace",
        href: "https://rive.app/marketplace/27773-52471-maasai-inspired-event-hero-banner-concept/",
        note: "The Rive file whose hero this page recreates in plain SVG and CSS, with no Rive runtime",
      },
    ],
    bestFor: ["event and experience studios","cultural festivals and tourism","hospitality and destination brands","interactive illustrated heroes"],
    style: ["light","warm","editorial","illustrated","svg","dark-mode"],
    thumbnail: "/thumbs/maasai-event-hero.jpg",
    theme: "light",
  },
  {
    title: "Sakura Corgi Game Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A cozy game launch page whose hero is the game: a toon-shaded three.js corgi dancing down a low-poly cherry-blossom road under bloom and tilt-shift, an opening crane shot past a great weeping cherry, a playable lap, in-engine card stills, a 3D coat turntable and generated sound",
    prompt: `Build a single-file HTML landing page for "Corgi Road", a fictional cozy third-person walking game by the fictional studio "Petalfold Games": you are a corgi, dancing down one very long cherry-blossom road towards an eighty-metre corgi standing at the far end. The hero is not a screenshot but a small live slice of the game in three.js, and the visitor can take the controls without leaving the page. Fictional game, studio, press quotes, numbers and release date, labelled as such in the footer.

STACK
- three.js 0.170.0 as an ES module through an import map: "three" maps to https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js and "three/addons/" to .../examples/jsm/ (EffectComposer, RenderPass, UnrealBloomPass, ShaderPass, OutputPass, Horizontal/VerticalTiltShiftShader). The map must come before the module script. Everything is generated in code: no models, textures, images or audio files.
- Google Fonts: Fredoka 500/600/700 for display (rounded, game-like), Nunito 400/600/800 for body at 17px/1.6, and M PLUS Rounded 1c 700 subset with the text= parameter to only the kana on the station signs.
- One classic script for the page chrome and one module script for the world. They talk through two CustomEvents on document: "corgi:coat" (detail is a coat key) and "corgi:play".

THE SYSTEM
- Tokens on :root: sky #8fbdea, sky-2 #c9def3, haze #f3e1de, peach #f6dccd, paper #fbf6ee, card #fffdf9, ink #39324f, ink-soft #6d6680, line #eadfd2, corgi orange #e08a3c / deep #b9652a, blossom #f6b6c8 / deep #e7839f, leaf #5aa578 / deep #3f6b4f, gold #f2a93b, radius 22px, easing cubic-bezier(.2,.8,.2,1).
- Everything is outlined in ink like the game: cards and buttons have a 2-3px ink border and a hard 5-6px ink drop shadow (box-shadow 0 6px 0 ink) that grows on hover and collapses on press. Primary buttons are gold pills, ghost buttons translucent white.
- The headline is styled like the game's subtitle bubbles: Fredoka 700 at clamp(50px, 7.6vw, 108px), gold fill, the second line corgi orange, a thick white rim built from sixteen 5px text-shadow offsets, then a soft orange drop. No background-clip tricks: they fight the rim.
- One inline SVG <symbol> of a corgi face (ears, head, saddle cap, white blaze, cheeks, nose, tongue, eyes), filled with var(--coat), var(--saddle) and var(--white). Custom properties inherit into <use> instances, so one symbol draws all four roster portraits, the dossier face, the CTA mascot and the hero fallback.

THE WORLD (module script)
- An opaque renderer cleared to the horizon peach; the CSS sky gradient on the hero (sky, sky-2 30%, haze 54%, peach 72%) is only the fallback behind the canvas. Fog colour peach #f6dccd from 34 to 118 so the far hills melt into the shader sky. DPR capped at 1.5, PCF soft shadows from the sun, which follows the corgi (shadow camera +/-22).
- Hemisphere fill #e2ecff over #9a7fa0 at 1.5. The corgi uses MeshToonMaterial with a 3-texel ramp (120, 185, 255, NearestFilter); the world uses flat-shaded MeshLambertMaterial for the faceted low-poly look.
- Ink outlines by inverted hull: a back-faced ink copy of each mesh scaled ~1.07. For instanced trees, a second InstancedMesh of the same geometry with the ink material and every matrix scaled up.
- Terrain: a 260x260 plane, 84 segments (64 on phones), height = 2.4 sin(0.045x) cos(0.05z) + 1.3 sin(0.075(x+z)) + 0.55 sin(0.16x - 0.12z), plus jitter away from the road. Convert to non-indexed and give each triangle one colour from five greens (a pale verge green near the road).
- The road is one closed centripetal CatmullRomCurve3 through 14 points on a wobbly ellipse, so the corgi can walk forever. Sample it 720 times and draw three ribbons at the true terrain height, each with polygonOffset: an ink edge (half-width 2.9), a pale shoulder (2.7) and a lavender-grey surface (2.15). Dip terrain vertices within 4.2 of the road below it, or a faceted hill will poke through the ribbon.
- Trees: about 190 (120 on phones), placed by a seeded PRNG so every load and the thumbnail match. Keep them at least 7 units off the road, because the camera rides it and a closer canopy fills the frame. 30% sakura (a trunk plus three pink icosahedron blobs), 15% pines (three stacked 7-sided cones), the rest round trees (icosahedron detail 1). Instanced, per-instance colours, cast shadows.
- Nine unfogged cloud clusters far out. 380 falling petals (160 on phones) in one InstancedMesh, wrapping in a 50-unit box that follows the corgi.
- The corgi, built from primitives facing +z: a capsule body, a flattened saddle capsule and head cap shown only when the coat has a separate saddle colour (otherwise it z-fights), a white belly, bib, butt fluff and blaze, a coat-coloured tail nub, a sphere head with white cheeks and muzzle, black nose and eyes, four-sided cone ears with pink inner cones, a tongue, and four short white legs whose geometry is translated down so they pivot at the hip. It always dances: legs swing in diagonal pairs, the body bobs and waggles, the head tilts, the fluff and tail wag. It dances faster when it walks.
- The great tree: one ancient weeping cherry (a leaning trunk, five limbs, a wide low crown of 26 outlined blossom blobs and an 18-strand weeping fringe, scaled 3.6) stands on the horizon on the camera's line of sight past the corgi (88 units, 108 on tall screens, 96 while playing), softened by the fog, so it is always in shot.
- Instead of an alpha canvas, a BackSide sphere with a gradient shader sky (horizon, haze, mid and top blues, plus a soft sun glow along SUN_OFF) follows the camera; flat far fields at y -4.6 run past the terrain edge into the haze.
- Light is a low golden sun (#ffe0b0, 2.6, offset 26/15/12 from the corgi, long soft shadows) plus a warm rim light (#ffb27a) from behind the corgi along the line of sight, and a cool hemisphere fill.
- Post: an EffectComposer with UnrealBloomPass (0.32 strength, desktop only), then horizontal and vertical tilt-shift whose focus band follows the corgi's screen position, then OutputPass; petal tokens are slightly emissive so the bloom finds them.
- Wind: canopies, their ink hulls and 1,100 verge grass tufts sway in the vertex shader (onBeforeCompile), phase-shifted by each instance's position; key customProgramCacheKey on the sway amount.
- 24 petal tokens: pink pentagonal coins with outlines, spinning and bobbing along the road. Walking into one collects it and updates the HUD. While watching they grow back after 9 seconds; while playing they stay gone until all 24 are taken, then a toast says the big corgi approves and they return.

CAMERA AND PLAY MODE
- Opening shot (skipped under reduced motion): over 3.8s the camera drops from 30 units up, looking at the great tree's crown, and settles into the hero framing with an ease-in-out; the kicker and headline pop just as it lands.
- Watching: the corgi walks the loop at 2.6 m/s and the camera takes a three-quarter front view (6.4 ahead, 2.8 to the side, 2.1 up, 1.55x further on tall screens), so the hero shows its face. On screens 900px and wider, setViewOffset shifts the frame by -17% of the width so the corgi walks to the right of the copy. Under 900px, shift it vertically by -30% of the height so the corgi walks below the copy. Ease the offset rather than snapping it.
- Playing ("Play a lap, right here", or "Try it in the hero" further down): the game's chase camera, about 3 m up and 7 m back, trailing with exponential smoothing. W/Up walks, S/Down backs up, A/D or Left/Right turn, Shift runs. Keep it inside a 100-unit radius.
- Capture keys only while playing, and preventDefault only on arrows and space, so the page never loses its scroll keys. Esc or the "Stop playing" button exits. On touch screens a four-button pad appears, driven by pointer capture.
- On exit, ease the corgi back onto the nearest road sample over 1.2s instead of teleporting. Return focus to the hero's play button.

SECTIONS (data-section in order)
1. nav: fixed, transparent over the hero, paper with blur after 40px of scroll. Paw-print logo, World / Corgis / Controls / FAQ, a gold "Wishlist" pill.
2. hero: full viewport (min 640px). Kicker pill, the headline "You are / the corgi.", a sub, the play button (hidden until the world renders) and "Wishlist the full game", a note about the controls and platform chips. A HUD chip shows petals collected (and "/ 24" while playing) and which corgi is walking. A toast and a play bar with key hints and the stop button sit on top. A soft radial white wash behind the copy keeps it legible over the scene.
3. world: three ink-bordered cards with small inline SVG illustrations: "The long road west", "Dancing is the only verb", "Something very large" (a huge faded corgi face rising behind a hill).
4. corgis: a radiogroup of four coats (Mochi red & white #e08a3c, Kinako sable #cf9150 with saddle #7a5236, Azuki tricolour tan #c98545 with saddle #3a3440, Yuki cream #f0d6ad). Roving tabindex and arrow keys. A dossier card shows the face, name, coat, a one-line bio and Wiggle / Zoomies / Loaf bars out of 5. Choosing one fires "corgi:coat" and both the hero corgi and a dossier turntable change coat live. The turntable is a second small WebGLRenderer with its own corgi sharing the coat materials, slowly spinning and dancing on a pink disc, with its own IntersectionObserver.
5. controls: copy plus a dark keymap card of white keycaps (WASD, Shift, Mouse, Wheel, Esc).
6. stats: an ink band of four gold numbers (12 km of road, 40 dancing corgis, 1,800 petals, 80 m of very old cherry tree) that count up once when they arrive, and read correctly before that.
7. press: one big pull quote with stars and a giant blossom quote mark, three laurel badges (the branch drawn once along a quadratic curve and mirrored), and two short quotes.
8. faq: native details/summary with a + that rotates to x.
9. cta: a store-style card: platform pills with line icons, a local-only email form (placeholder you@studio.example, nothing is sent) with a dark "Add to wishlist" store button, and a 4:3 key-art capsule rendered from the scene with the logo and date over it.
10. footer: logo, links and the fictional legal line.

PREMIUM DETAILS
- Station signs as section labels: each section is a stop on the line (CR02 to CR07) with a green-bordered code, the name in kana, the English name and a green band linking to the neighbouring stations. A vertical white nameboard reading コーギーロード sits in the hero on wide screens.
- In-engine stills: 0.7s after load, render four fixed shots through the main renderer (down the blossom tunnel, a close dance, the great tree in the haze, and the capsule key art) with toDataURL, restore the hero, and hand them to the page in a "corgi:shots" event; the inline SVG art stays until each image loads, then cross-fades.
- Sound with Web Audio, off by default (a toggle in the HUD, or M): brown-noise wind through a wandering band-pass, pentatonic chimes, a far level-crossing bell every 30-60s, and a pluck on each petal; suspended while the tab is hidden.
- Paper grain (an feTurbulence data URI) on the page and the roster, a slight 3D tilt toward the pointer on cards and the capsule, a pop on the petal counter, and a loading shimmer card while three.js arrives.

THINGS THAT BREAK
- Never give two elements the same id. A canvas and a section both called "world" let a chrome script turn the canvas into a flow element, and a ResizeObserver on the hero then grew the canvas, the hero and the canvas again until the page was 20,000px tall.
- Keep the static fallback (the sky gradient, two CSS hills and the big SVG corgi) visible until the module has rendered a frame and added html.gl-on. Gate the play buttons on that class too, so a failed CDN or missing WebGL never leaves a blank hero or a dead button.
- Pause the loop when the hero is off screen (IntersectionObserver) or the tab is hidden. Under prefers-reduced-motion, render one still frame and stop. Play mode still animates because the visitor asked for it.
- The play button scrolls with window.scrollTo, not scrollIntoView, which would also scroll any page embedding this one.
- Section reveals use IntersectionObserver, whose first callback reports what is already on screen, so arriving via an anchor never leaves a section invisible.

THE FLOOR
- One h1, a main, aria-hidden on the canvas and decorative SVGs, labels on the movement pad, role=status on the toast and form message, visible focus rings.
- No horizontal scroll at 390px: grids collapse to one column under 1000px, the nav links hide under 760px, the HUD moves left.
- Reduced motion also turns off the CSS petal drift, reveals and button transitions.`,
    preview: "hero",
    variant: "large",
    added: "Oct 16, 2026",
    demo: "/demos/corgi-road-game.html",
    bestFor: ["indie game launches and wishlist pages","cozy and casual games","interactive product heroes","playful consumer brands"],
    style: ["light","playful","three.js","low-poly","toon-shaded","interactive"],
    thumbnail: "/thumbs/corgi-road-game.jpg",
    theme: "light",
    hidden: true,
  },
  {
    title: "Blackletter Biology Workbench",
    category: "web",
    categoryLabel: "WEB",
    description: "A computational biology platform set like an illuminated manuscript: blackletter headings lit by a WebGL shader, spinning conic frame borders, and hand-drawn lab sketches in the margins",
    prompt: `Build a single-file HTML landing page for "Mistfold", a fictional computational biology workbench (protein structure prediction, genomic alignment, molecular docking, single-cell analysis). The look is an illuminated manuscript on warm paper: blackletter headings, a serif body, framed panels with ornaments, and pale hand-drawn lab sketches drifting in the side margins. Google Fonts: UnifrakturMaguntia (headings and logo), Fanwood Text (body, 17px, line-height 1.55), Cinzel (numbers and small caps labels), JetBrains Mono (code). Rough.js 4.6.6 from jsDelivr for the sketches; everything else is hand-written CSS, inline SVG and one WebGL shader. Fictional brand, numbers and testimonial, labelled as such.

THE SYSTEM
- Tokens on :root: paper #f4f2ec, card #fdfcf9, tint #eef2ef, ink #4d524f / strong #1d2420 / soft #7a7f7b, lines #e2ded3 and #d3cec1, and the accents green #4c7264 (primary), blue #4c6d7b, violet #675a7c, mauve #86667f, mint #8fbcaa, lilac #b3a3c6. Three faint radial washes on a fixed body background.
- An SVG <symbol> sprite of 24x24 line icons (lens with a helix, microscope, hexagon, atom, folio, funnel, branching nodes, hexagon with a spark, open codex, sealed envelope), all stroked with one green-blue-violet userSpaceOnUse gradient.
- A four-point star as a data-URI SVG used as a CSS mask for every bullet, so bullets take any colour or gradient.
- Buttons: small uppercase serif, 1px green border, radius 6px with corner-shape: scoop (progressive), solid variant with a soft green shadow.
- Frames (.wbbase): 760px panels, padding 40px 30px, an inner 1px outline inset 7px, and a moving border: an @property --angle animated 0 to 360deg drives a conic gradient of greys with green-mint-blue and violet-lilac arcs, painted on a ::before with the padding-box/border-box background trick, plus a blurred copy at 28% opacity behind it as a glow. Stagger each frame's animation-delay so they are out of phase.

THE SECTIONS
- Sticky frosted nav: blackletter "Mistfold" logo, four uppercase links (hidden under 760px), a solid "Request access" button.
- Hero frame: the h1 "From Sequence to Structure" in 58px blackletter, an italic subtitle, a 60px vertical rule that draws down on load with a glowing spark that keeps travelling down it, an intro paragraph with a gradient left rule and a light sweep that runs down it every few seconds, four stats (0.92 median pLDDT, 40x faster alignment, 12M cells indexed, 100% reproducible runs) that rise in one by one with shimmering separators, and two CTAs.
- Modules frame: a small green label pill ("the instruments"), a 44px h2, an intro, a fleuron divider (❦ between fading rules), then four cards, each in its own accent via --accent: blackletter name, "compute intensity" as one to three filled hexagons, a description, star-bullet list, and a tinted footer split in two ("built on" / "outputs" with icons). Cards fade up as they enter with an IntersectionObserver.
- Workflow frame: four tinted steps (Ingest, Compose, Run, Publish), each with a pearl medal holding an icon inside a conic gradient ring cut out with mask-composite (it spins on hover), then a short Python SDK snippet in a paper-coloured code block with a green left rule and keyword, string and comment colours.
- Pricing frame: three tiers (Academic free, Lab $490/month featured with its own faster moving border, Enterprise custom) with star bullets, then an italic blockquote clearly labelled as an example testimonial.
- Finale: one wide frame that is both the CTA and the footer. A soft drifting aurora behind "Begin Your First Fold", a lead, an email + button form in one scooped pill (local only: on submit it shows an italic thank-you line in an aria-live region), three star-bulleted assurances, a fleuron rule, a four-column footer, a legal bar, and the "Mistfold" wordmark at the full width of the panel.

THE SHADER TEXT
One hidden WebGL canvas renders every blackletter heading, the nav logo and the footer wordmark. For each, rasterise the text into an offscreen 2D canvas as white on transparent (for headings, walk the text nodes and use Range.getClientRects so each word lands exactly where the DOM laid it out), upload it as a texture, and run a fragment shader that only draws where alpha is set: domain-warped fbm noise mapped through the five-colour green-mint-blue-violet-lilac palette, a bevel normal from the alpha gradient lit by a light that drifts and follows the pointer, a specular glint, a diagonal light band that sweeps across, and a little grain. Copy each result into a 2D canvas laid over the heading. Only after drawing, add a class that makes the real text transparent, so the CSS gradient text stays as the fallback and screen readers still read the real heading.

THE SKETCHES
A fixed full-viewport canvas behind the content, desktop only (min-width 1100px): twelve 24x24 biology icons (helix, benzene, atom, flask, cell, microscope, lens, petri dish, ribbon, virus, branching nodes, pipette) drawn with Rough.js in six muted inks at 32-54% alpha. Place them on a seeded grid in the two side margins, skipping any spot that would overlap a frame. Pre-render four rough "takes" of each and swap between them about seven times a second for a hand-drawn boil, with a slow bob and tilt.

THINGS THAT BREAK
- Wait for the blackletter font (document.fonts.load, with a timeout) before rasterising text, or the first frame is drawn in the fallback serif; re-layout on resize with a ResizeObserver.
- Never hide the headings in CSS up front: if WebGL is missing or the program fails to link, the gradient text must still be there.
- Cap the shader canvases at 1.5x DPR, pause any that are off screen with an IntersectionObserver, and skip frames while document.hidden.
- Load Rough.js with defer and start the sketches on DOMContentLoaded; guard on typeof rough so the page still works without it.
- Use overflow-x: clip on html and body (not hidden) so the sticky nav keeps sticking.
- Do not hotlink fonts or images from other sites: Google Fonts and a CDN script are the only external requests.

THE FLOOR
One h1, a main, data-section on every region, aria-hidden on the shader canvases, sketches and icons, a labelled email input, visible focus rings. Under prefers-reduced-motion every CSS animation and transition stops, the frames show a fixed ring angle, the cards are visible at once, and the shader renders one still frame. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 15, 2026",
    demo: "/demos/mistfold-biology-workbench.html",
    credits: [
      {
        label: "Rough.js by Preet Shihn",
        href: "https://roughjs.com",
        note: "The hand-drawn rendering library behind the margin sketches (MIT)",
      },
    ],
    bestFor: ["biotech and life-science platforms","scientific and research software","computational tools for academic labs","brands with a literary or archival voice"],
    style: ["light","editorial","blackletter","webgl","hand-drawn","manuscript"],
    thumbnail: "/thumbs/mistfold-biology-workbench.jpg",
    theme: "light",
  },
  {
    title: "LED Metro Tech Storefront",
    category: "web",
    categoryLabel: "WEB",
    description: "A big-tech devices homepage in warm clay and glass, with a live LED metro map for a hero, a Personal/Business switch that rewrites the page, and a dot-matrix ticker",
    prompt: `Build a single-file HTML homepage for "Meridian", a fictional devices, apps and AI company (laptops, a tablet, a productivity suite, an AI assistant called Assist). Warm paper page, clay and frosted-glass surfaces, and one dark LED dot-matrix panel as the hero visual. GSAP 3.12.2 and ScrollTrigger from cdnjs; Google Fonts Bricolage Grotesque (headings), Fraunces italic (accent words), Instrument Sans (body copy), Inter as the fallback. No images: every device, icon and logo is CSS or inline SVG. Fictional brand, offers and copy, with a footnote saying so.

THE SYSTEM
- Tokens on :root: page #f6f5f1, ink #111317, grey #6f747c, hairline rgba(17,19,23,0.08), purple #9d8cdc / deep #6c5bbd, mint #8fdea0, near-black #16191e, clay-light #f1f0ec. Four clay shadow recipes (light, dark, purple, green: one outer drop plus an inset highlight top-left and an inset shade bottom-right) and a three-layer soft shadow for cards.
- A fixed SVG fractal-noise grain at 3.5% over everything, and three blurred colour blobs (purple, mint, peach) behind the hero.
- Every heading pairs a Bricolage word with one Fraunces italic accent filled with a purple gradient via background-clip:text and lit by an SVG glow filter (stacked feGaussianBlur + feColorMatrix + feOffset layers merged under the source). Dark surfaces use a warm white glow, the ballot banner a green one. Descriptions are a grey gradient clipped to text with one phrase in .hl set solid ink and bolder.
- Primary CTA: a dark pill with the label left and a 51px pink circle right holding a 2-column dotted arrow that slides on hover. On dark surfaces it inverts to a white pill.

THE HERO
- A sticky frosted nav (radius 22px, top 14px): globe-with-meridians brandmark + "meridian" wordmark, five links, a Personal/Business segmented control with a white thumb that GSAP slides between buttons, a search button, and a hamburger under 1024px.
- Left: a NEW badge pill, the h1 "Meridian Book Ultra" at 88px with "Ultra" as the accent, a lede, the CTA plus an underlined text link, and an "AI-powered suggestions" glass card with three chip links.
- Right: a small pixel-art glyph with a caption, then the LED panel: a dark rounded bezel with a white 6px ring and purple glow, a header row ("LIVE NETWORK" with a blinking green dot, Chase/Rainbow/Breathe mode buttons, six colour swatches that filter lines), and a 36x20 dot grid. Six metro lines are waypoint lists whose segments are straight or exactly 45 degrees; each is expanded to one LED per cell. Each LED is an <i> placed by --x/--y custom properties and sized from a --pitch that a ResizeObserver computes from the screen box. Cells shared by two lines get interchange rings, and a glowing white "train" per line rides a looping GSAP timeline along the waypoints. Chase is a per-LED opacity keyframe delayed by index; Rainbow sets hsl(i*9deg) and hue-rotates the layer; Breathe pulses the whole layer. On boot the LEDs scale in, staggered by index.
- Floating over the panel: a rotated black PRE-ORDER sticker, a white "$1,000 back" trade-in pill and a "Secure" pill, each on its own sine float. Below, a timeline rule ending in a mint "NEW RELEASE" clay tile, and a short h3 + paragraph.

THE REST
- Quick links: six white cards whose dark fill slides up from the bottom on hover while the icon tile turns mint and the arrow rotates -45deg.
- Featured: a 600px slider with three slides (dark laptop slide whose screen is a second LED map in Rainbow mode, a lavender tablet slide, a mint slide with three stacked laptops and a chip badge), a 6s progress bar, a count, and pause/prev/next buttons; the UI turns light on the dark slide.
- Travel light: a two-column card with three serif specs and a CSS laptop whose lid opens (rotateX -88 to 0) scrubbed by scroll, inside concentric rings.
- Three AI article cards with a cursor-following radial spotlight: orbiting satellites round a shield, a third LED map, and datacenter towers growing out of the ground with leaves.
- FAQ: a sticky intro column and a GSAP height accordion (one open at a time, aria-expanded, aria-controls).
- A dark ballot banner topped by a dot-matrix ticker: a 5x7 bitmap font rendered as SVG circles, doubled, and scrolled with steps() easing so it moves one LED column at a time.
- Footer: "Follow" plus the brandmark, socials, six link columns, a bottom bar and the fictional-brand footnote.

PERSONAL / BUSINESS
Both copies of every audience-specific string live in the DOM as [data-for="personal"] and [data-for="business"]; a body class hides one set. Business also swaps the accent to blue (#2f6fe0, its own glow filter, blue badge dot and button accent). Switching staggers the new copy in, shows a toast, and saves the choice to localStorage inside try/catch.

THINGS THAT BREAK
- body must use overflow-x: clip, not hidden, or the sticky nav stops sticking.
- ScrollTrigger.batch with once: true never fires for elements already past its start when the page loads scrolled or jumps to an anchor; also sweep on ScrollTrigger refresh and scrollEnd and reveal anything on screen.
- Never put a float loop and a scrubbed parallax on the same element's y: the LED panel gets only the parallax, the pills only the float, and the floating suggestion card gets no hover lift.
- In the single-column slide layout use grid-template-columns: minmax(0, 1fr); a bare 1fr grows to the 460px laptop and the slider clips it at 390px.
- Pause each map's train timelines while its screen is off screen, and re-place the segmented thumb after document.fonts.ready because the web fonts change the button widths.

THE FLOOR
One h1, a main, data-section on every region, aria-pressed on the toggles and swatches, aria-label on icon-only buttons, aria-hidden on decorative art, visible focus rings. Under prefers-reduced-motion: no intro, floats, trains or reveals, the slider does not autoplay, and the LED boards render fully formed. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 15, 2026",
    demo: "/demos/meridian-led-storefront.html",
    credits: [
      {
        label: "CSS LED Challenge by Ben Evans (ivorjetski) on CodePen",
        href: "https://codepen.io/editor/ivorjetski/pen/01a07dcf-a1e8-7ab6-aea1-aa98135803b3",
        note: "The LED dot-matrix style the metro maps are adapted from",
      },
    ],
    bestFor: ["consumer electronics and hardware launches","big-tech style company homepages","software suites with personal and business audiences","AI assistant announcements"],
    style: ["light","claymorphism","glassmorphism","led-dot-matrix","editorial","gsap"],
    thumbnail: "/thumbs/meridian-led-storefront.jpg",
    theme: "light",
  },
  {
    title: "Hazard Terminal Security Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Antivirus as an amber hazard terminal: a spinning seal HUD, a live scan where three cores vote, and a searchable grid of 72 spirits, each guarding a threat",
    prompt: `Build a single-file HTML landing page for "Lemegeton", a fictional antivirus whose 72 protection modules are the 72 spirits of the Ars Goetia (public-domain names). The look is a sci-fi hazard terminal: amber glow on black, hazard stripes, hex cells and kanji labels. System font stacks only (a condensed sans for UI, a Mincho serif for headings and kanji, a monospace for readouts); no libraries, no images. Fictional brand, pricing and copy.

THE SYSTEM
- Tokens on body: an amber glow (rgb 255,102,0; text #fa0), a danger red (#f30, fill #f23), an ok green (#3f6), warm off-white body text, and a 36px faint amber grid behind everything with CRT scanlines on top.
- Seven rank colours (King amber, Duke orange, Prince violet, Marquis cyan, President green, Earl yellow, Knight white), each a class that sets --accent/--accent-rgb, all at 7:1 or better on black.
- Reusable pieces: a double glowing border (.-bordered with danger/ok/rank variants), diagonal hazard stripes with glowing edges, condensed uppercase labels with a 1px glow outline (mini, small, short and blinking sizes), a kanji label with a striped decal, hex-cell grids drawn from a data attribute (some cells off, the rest blinking out of step), and corner brackets.
- An Alert mode toggle turns the whole terminal red.

THE HERO
- A fixed 70px top bar: a kanji brand tile, "LEMEGETON" with a tiny "the lesser key to your system" over it, status labels ("seal status: nominal" in green with a blinking dot, "72 / 72 bound"), and Pause motion, Alert mode and Menu buttons (icon-only on phones).
- The page scrolls inside a container under the bar. Left: an eyebrow with a kanji block, the h1 "72 spirits. Zero infections." in huge uppercase serif with "Zero" in glowing red and indented, a lede, two CTAs and platform labels; a giant outlined vertical 七十二 sits behind it.
- Right: a "Seal analysis display" HUD with blinking "Approaching limits" and "Danger" labels, a crosshair, and an SVG seal: two counter-rotating rings, one carrying all 72 spirit names round its edge and one with a red text ring and a hexagram, plus HUD readouts, a hex grid and an "Internal" kanji label. Clicking the HUD pauses motion.
- A full-screen overlay menu: the kings as cards with generated sigils, three link columns, a "Season of SAMHAIN" name that is fitted to its box, font size and scanline controls, and a striped "current event" card.

THE REST
- A sticky section nav with kanji link prefixes that highlights the section in view, an "all systems nominal" status, and up/down buttons.
- A readout strip: four big monospace stats with progress bars.
- The three wards (firewall, sandbox, encrypted backup) as cards, each in its own rank colour with an animated SVG emblem, a readout, a status label, spec labels and a link.
- A live scan: a terminal that streams scanned file paths, with every third line binding a spirit to a threat in red, three "core" boxes that flip to BANISH together, a progress meter, and a tally of spirits per rank.
- The 72: a search box, rank filter buttons with counts, a large "summoned" panel (sigil, number, rank, name, lore, what it binds, stats), and a grid of all 72 spirit buttons. Each sigil is generated by tracing the spirit's letters round a 26-point wheel, inside rings and tick marks.
- Four directives, three pricing pacts (the middle one featured with a blinking "recommended" tag), a striped final CTA with a giant outlined 結界, and a footer that credits the public-domain names.

THE FLOOR
One h1, a main, data-section on every region, real buttons with aria-pressed, a skip link, visible focus, labelled search, aria-live on the count and the summon panel. Pause motion, alert mode, scanlines and font size are saved to localStorage inside try/catch. Under prefers-reduced-motion nothing spins or blinks. No horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 14, 2026",
    demo: "/demos/lemegeton-antivirus.html",
    bestFor: ["security and antivirus products","developer tools with a strong theme","games and occult or horror brands","sci-fi or HUD-heavy launches"],
    style: ["dark","hud","terminal","amber","occult","interactive-demo"],
    thumbnail: "/thumbs/lemegeton-antivirus.jpg",
    theme: "dark",
  },
  {
    title: "Purple Rain in the Rain",
    category: "gospel",
    categoryLabel: "GOSPEL",
    description: "Prince at the Super Bowl XLI halftime show, Miami, February 2007: a downpour, a purple stage, and Purple Rain to close it out",
    prompt: "Prince, Super Bowl XLI halftime show (Miami, 2007). Watch: https://www.youtube.com/watch?v=-WYYlRArn3g",
    preview: "hero",
    variant: "large",
    added: "Oct 13, 2026",
    youtube: "-WYYlRArn3g",
    // The NFL blocks this upload from playing on other sites, so it opens on YouTube.
    youtubeEmbed: false,
    thumbnail: "/thumbs/prince-super-bowl-xli-stage.jpg",
    theme: "dark",
  },
  {
    title: "Retro Messenger Agent Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI agent pitched as your old instant-messenger buddy: a working chat window that plans and runs tasks, nudges that shake the screen, and a buddy-list footer",
    prompt: `Build a single-file HTML landing page for "Hollr", a fictional AI chat assistant that lives in a nostalgic mid-2000s instant-messenger window and has an Agent mode that plans and runs tasks. Oswald (display), Neuton (descriptive copy) and Verdana/Tahoma (UI, like the old clients) from Google Fonts; no libraries, no images. Fictional brand, pricing and copy.

THE PALETTE
A night-indigo page (#2c2b5c to #1d1c45) with drifting violet, magenta and blue blurred orbs, a dot grain and twinkling stars. The messenger chrome is pale (#D7E4F5, #EEF0FD, #F5F2F9) with glossy two-tone title bars: blue for chat, violet once Agent mode runs. Window borders are slate #586170. The brand gradient runs from violet #6a2fc4 to magenta #c0169f, with a lemon #e6e82a accent and online green. Buttons come in two kinds: classic bevelled grey with an inset shadow, and gradient pills with a moving sheen.

THE HEADINGS
Every section heading is a framed block: a tiny Neuton kicker tracked at .5em, then one or two lines of uppercase Oswald 700 filled with a slowly moving pastel gradient (lilac, pink, white, lemon, sky) clipped to the text, with a double rule above and below.

THE HERO
- A slim full-width nav styled as a glossy messenger title bar: logo, an "Online" status pill, links, and a "Sign in" button with its access-key letter underlined.
- The framed h1 "Your favorite contact now gets things done." Its kicker is a glass pill with a gradient NEW badge before "MEET HOLLR · YOUR AI CONTACT", and the tracking tightens on phones so the pill stays on one line down to 320px. Then a Neuton lede.
- The centrepiece is a working messenger window that rises in with a 3D tilt, has a conic glowing border that spins faster while the agent runs, and tilts toward the pointer. It has:
  - a title bar with window controls and a toolbar (Invite, Send Files, Video, Voice, Activities) with underlined access keys;
  - a chat log, robot and you avatars, and a status bar with a progress bar;
  - a composer with a Chat/Agent segmented control (a sliding gradient pill), emoticon buttons that insert ":)" and ";)", a Voice clip button and a Nudge button;
  - a textarea whose placeholder types and deletes example tasks, tool toggles (Web, Files, Calendar, Email, as aria-pressed chips) and a Run button.
- Chat mode answers with a typing indicator and typed keyword replies. Nudge shakes the window, plays a short square-wave buzz through Web Audio, and makes the bot promise shorter answers.
- Agent mode matches the task against playbooks (party, report, trip, email, meeting, or a generic plan). It posts a plan card, runs each step with a spinner and a tool tag, and skips any step whose tool is turned off (striking it through). It ends with a result card (Approve & continue, Refine). Run turns into Stop while it works.
- Floating stickers (Web search, Calendar hold) bob beside the window. Suggestion chips below start example runs.
- A perspective grid floor scrolls under the hero, and a spotlight follows the pointer.

THE REST
- Features: six window-styled cards, each with a 3D layered icon (a stack of slabs with a glossy face, floating and catching a sheen) in its own colour, and small animated glyphs (nudge arrows, a winking smiley, lines being written, sound waves, clock hands, a status ripple).
- How it works: a sticky left column with a giant outlined step number that rolls over and a rail that fills with scroll. Three sticky stacking cards on the right; the card being covered scales down and dims. Each card plays its own mini animation: a sign-in form typing a name, a chat that switches to Agent mode and ticks off a mini plan, and an approval with a history list.
- FAQ: a help chat window with searchable questions ("/" focuses the search). Opening one shows typing dots before the answer bubble. An empty state offers to ask Hollr instead.
- A mega footer: the framed "Hollr has signed in." with an email form, trust ticks, and a tilted buddy-list window (your status, Hollr online with a rotating status message, three "agents at work" progress bars). Then link columns, a giant outlined HOLLR wordmark with flowing colour, and a status strip with Back to top.
- A "Hollr has just signed in" toast slides up after a few seconds.

THE FLOOR
One h1, a main, data-section on every region, labelled inputs, real buttons, visible focus, aria-live on the chat log, no horizontal scroll at 390px. Under prefers-reduced-motion, every animation collapses to its end state, the console doesn't tilt and replies appear at once.`,
    preview: "hero",
    variant: "large",
    added: "Oct 13, 2026",
    demo: "/demos/hollr-messenger.html",
    bestFor: ["consumer AI assistants","AI agents with a friendly face","chat and messaging products","nostalgic or playful brands"],
    style: ["dark","y2k","retro-ui","skeuomorphic","purple","interactive-demo"],
    thumbnail: "/thumbs/hollr-messenger.jpg",
    theme: "dark",
  },
  {
    title: "Event Horizon Orbital Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Satellite servicing under a ray-marched black hole you can drag to orbit, with nine live three.js mission scenes inside amber glass cards",
    prompt: `Build a single-file HTML landing page for "Halcyon Orbital", a fictional satellite-servicing company: inspection, refuelling, robotic repair, life-extension docking, relocation and end-of-life disposal, from LEO to GEO. Archivo (copy and the h1), Archivo Narrow (h2/h3) and JetBrains Mono (labels and HUD) from Google Fonts; three.js r128 from cdnjs; every texture drawn on canvas at load, no images. Fictional figures, fleet and contacts on an example domain.

THE PALETTE
Pure black with warm off-white ink #efebe2 and three steps of warm grey. One accent, amber #ffb45e, for CTAs, active states, HUD values and the glow. Pale ice blue #a9caff only for faults and secondary readouts. Labels are mono, uppercase and widely tracked. Headings are tight uppercase.

THE BLACK HOLE
A fixed, full-screen WebGL backdrop. One fragment shader ray-marches each pixel's light ray around the hole, bending it with a Schwarzschild-like acceleration (a = -1.5·h²·p/r⁵), and:
- marks rays that fall inside r = 1 as captured;
- accumulates a volumetric accretion disc between r = 3 and 13 that thickens outward, built from layered fbm arms, filaments and clumps, rotating Keplerian-fast near the centre;
- applies relativistic Doppler beaming and gravitational redshift, so one side of the disc is bright and blue-white and the other dim and red;
- shows a procedural starfield and faint nebula gas for rays that escape, plus a photon-ring halo.
Render the shader into a target, then a bright pass, a two-pass Gaussian bloom and an ACES composite with slight chromatic aberration, a warm grade, a vignette and fine grain. Run it in three quality tiers (pixel ratio and step count) and drop a tier if the first 90 frames average under 28 fps. Drag to orbit, double-click to reset, and let it slowly auto-orbit. Page scroll eases the camera in and over the disc. Below the hero, a fixed veil fades in to darken and frost the scene so the copy stays readable.

THE HERO
- A three-column nav: the logo (a small amber planet with a ring), centre links inside amber corner brackets with an amber dot on the section in view, and an outlined "Request a mission" button.
- Left: "NOTHING IN ORBIT HAS TO BE LOST." with "lost." in amber, a lede, a filled amber CTA and a ghost CTA, and three mono traits divided by amber hairlines.
- Top right: simulated live telemetry (range closing, closing rate, a drifting latitude, a docking-window countdown).
- Bottom right: a LEO/MEO/GEO radar whose rings and labels cycle, with dots orbiting at three speeds.
- A "Systems nominal" status box.
Scrims keep the left column readable without dimming the hole. The hero ignores pointer events, except on the buttons, so the scene stays draggable.

THE CARDS
Every panel is the same signature glass: a warm mesh-gradient fill (dark at the top, amber and peach glowing in the lower corners), an inset glow, and a 1px gradient border with an amber light sweeping round it (a conic gradient on an @property angle, desynchronised per card). Then:
- A four-up stats strip with count-ups.
- Six service cards. Each has a 3D scene, corner ticks and a live HUD:
  - Inspection: a drone circles a satellite while a LIDAR slice sweeps up it, revealing a point cloud and then finding a cracked cell.
  - Refuelling: propellant slugs run along a hose while a 24-segment gauge fills.
  - Repair: a two-link IK arm carries a reaction-wheel module into an empty bay and torques it in with sparks.
  - Docking: a tug closes on a client's aft end, captures it with a flash and fires its engine.
  - Relocation: a Hohmann transfer around a night-side planet with city lights, with burns at perigee and apogee.
  - Disposal: a satellite falls into a daylit limb, heats, trails plasma and breaks up.
- A four-phase mission timeline on diamond markers.
- Three coverage cards (LEO, MEO, GEO).
- Three fleet cards, each a turning procedural spacecraft (a tug with arms, an inspector with a scanning head, a propellant depot).
Draw all nine scenes with ONE shared WebGL renderer, copied into a 2D canvas per card, and only while on screen. Cards tilt the scene toward the pointer and dolly in on hover. Keep an inline SVG fallback in each card for no WebGL.

THE FOOTER
One large glass panel holding:
- "TELL US WHAT'S WRONG UP THERE." with three promises and a priority email line;
- a mission intake form (name, organisation, email, orbit regime, service, situation) with inline validation and a confirmation, no backend;
- a giant outlined wordmark fitted to its row by JS;
- link columns and a legal bar.

THE FLOOR
One h1, a main, data-section on every region, aria-hidden on the canvases, the veil, the telemetry and every decorative SVG, labelled form fields, visible focus, no horizontal scroll at 390px. A diagnostics overlay appears only if three.js, WebGL or a shader fails. Under prefers-reduced-motion, stop the sweeps, ticker, radar and pulses, stop the hole orbiting and freeze its disc, and render each card scene as one still at its showcase moment.`,
    preview: "hero",
    variant: "large",
    added: "Oct 13, 2026",
    demo: "/demos/halcyon-orbital.html",
    bestFor: ["space and aerospace companies","deep-tech and hardware startups","technical services with a showcase hero","products that want a WebGL wow moment"],
    style: ["dark","amber","webgl","shader","threejs","glassmorphism","hud"],
    thumbnail: "/thumbs/halcyon-orbital.jpg",
    theme: "dark",
  },
  {
    title: "Faceted Iceberg Platform Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI agent platform drawn in low-poly crystal: a shape-mosaic hero, an iceberg whose waterline drops as the platform takes on the stack, and a faceted sunrise footer",
    prompt: `Build a single-file HTML landing page for "Halcyra", a fictional AI agent platform ("Intelligence, orchestrated at scale"). Outfit from Google Fonts is the only font (500 for headlines, 200 for the light words set against them). No libraries, no images: every illustration is inline SVG built from one shared sprite. Fictional customers, figures and testimonial.

THE PALETTE
Near-black #06060a with glass surfaces (white at 3-5.5%) and hairlines (white at 8% and 14%). Text #f4f4f7, muted #9a9aab, dim #5f5f70. One five-stop spectrum carries the brand: lime #9be15d, teal #3fd1a8, sky #4cc4e8, iris #7f9cff, violet #a78bfa, used as --grad left to right for gradient text (slowly shimmering), pill tags and the primary button (whose gradient slides on hover). Headlines are tight (letter-spacing -.04em) with one phrase in each set in Outfit 200 and gradient text. Section kickers are uppercase with a small faceted diamond before them, in sky, or in sun, rose or mint variants for later sections. Behind the page sit fixed blurred colour orbs, a 72px grid masked to the top of the viewport and a fine SVG grain.

THE SPRITE
A hidden SVG holds the facet gradients and four low-poly symbols reused everywhere:
- #gem: a crystal in ice blues.
- #gem-g: the same crystal in greens.
- #orb: a geodesic hex ball in sunset oranges and magentas.
- #cube: an isometric data cube in aurora pinks with a few data marks.
Plus #cdot, a white callout dot with a lime centre. Callouts are always a pulsing lime dot, a thin white leader line with one elbow, and widely tracked uppercase labels.

THE HERO
A fixed pill nav (glass, blurred, darker once scrolled) with the logo (a gradient diamond with a dark inset), five links and a light "Start building" pill. Left: a "New · Agents 3.0 is live" eyebrow, the headline, a lede, and an email capture pill whose placeholder types and deletes three example addresses. It turns lime when valid, shakes red when not, and swaps to a success pill on submit. Below it, three ticked notes. Right: a 4x4 mosaic of tiles, each a different quarter-round shape (mixed border radii). They are glossy radial spheres in the five brand colours alternating with dark glass tiles holding an icon, an equaliser, a sparkline, a "tokens/s 18.4k" stat and a bobbing #orb. Tiles scale in one after another. Two glass stat cards float over the corners, and a "LIVE INFERENCE · EDGE" callout hangs below. Crystals drift around the hero. Then a marquee of fictional customer wordmarks.

THE MIDDLE
- How it works: three cards whose art panels are small SVG scenes of the sprite symbols bobbing, with callout labels.
- The platform: a horizontal slider of six cards with buttons, mouse drag with snap, and a gradient progress bar. Each card has a spinning conic-gradient border, pointer tilt and a spotlight, and a live visual: a chat exchange with typing dots, a node graph with flowing dashes, growing bars, shield rings, a typed SDK snippet, and an area chart.
- The iceberg: one faceted SVG iceberg in a framed panel, with five callouts down its length (Agents & UX, Workflows, Memory & evals, Models & runtime, GPUs & infra). Four stage buttons (Self-hosted, GPU cloud, Model APIs, Halcyra) move the waterline: the sky and the water tint translate together with a 1.5s ease. Each callout above the line reads "YOU MANAGE"; below, it dims and reads "HANDLED BY HALCYRA". The header counts the layers you still manage. It cycles on its own while on screen until someone clicks a stage.
- A performance bento: a 142ms p50 headline with comparison bars that fill on view, and count-up stats.
- Use-case buttons that swap the copy, three metrics and the art: the big symbol, its glow colour and the three callout labels change per team.
- An integrations orbit: dashed rings turning in opposite directions, flowing spokes and eight labelled nodes around a central crystal.
- A testimonial, three pricing plans (the featured one with a spinning conic border) and a FAQ with a sticky head and native details.

THE FINALE
A footer that turns to night: twinkling stars and an occasional shooting star, "The future of work runs on Halcyra.", a second email pill and a proof row. Then a horizon of three seeded low-poly terrain bands generated in JS from the sprite's gradients. The far and mid bands parallax, and a faceted #orb sun with a tilted ring rises out of them on scroll, with slowly turning conic rays behind it. Two callouts sit on the ridges: 4,000+ teams, 4.8B runs. Then link columns, a status pill and a giant outlined HALCYRA wordmark lit by a gradient spotlight that sweeps on its own and follows the pointer.

THE FLOOR
One h1, a main, data-section on every region, aria-hidden on every decorative SVG (the iceberg keeps role="img" and a label), stage and use-case buttons as toggle buttons with aria-pressed, visible focus everywhere, no horizontal scroll at 390px. Under prefers-reduced-motion, every animation runs once to its end state, the iceberg does not cycle and the placeholder does not type.`,
    preview: "hero",
    variant: "large",
    added: "Oct 13, 2026",
    demo: "/demos/halcyra-agents.html",
    bestFor: ["AI agent platforms","enterprise AI and orchestration","developer platforms with a pricing page","B2B SaaS that needs a stack diagram"],
    style: ["dark","low-poly","faceted","spectrum-gradient","glassmorphism","svg-illustration"],
    thumbnail: "/thumbs/halcyra-agents.jpg",
    theme: "dark",
  },
  {
    title: "Card Scanner Finance Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Autonomous finance agents: tilted cards in an orbit ring, a scroll-pinned scanner that turns cards into code, and a live control bento",
    prompt: `Build a single-file HTML landing page for "NOVA", fictional autonomous finance agents that read every transaction, tokenize every card and reconcile and close the books in real time, with a person in the loop. Inter Tight (display), Inter (copy) and JetBrains Mono (UI) from Google Fonts; GSAP 3.12.5 with ScrollTrigger and three.js r128 from cdnjs; everything else inline, no images. Fictional vendors and figures.

THE PALETTE
Near-black violet (#050508, #0b0a14), pale lilac text, accents lilac #c4b5fd and violet #8b5cf6, with a warm ember #e3857a and cream #f1dba7 for the close. Heavy uppercase headlines in Inter Tight 900, filled with a radial gradient clipped to the text whose centre (--gy) GSAP scrubs with scroll, so the light travels down the words as they pass. Use three oklch palettes (lilac, indigo, ember) and interpolate in oklch where supported. Give each headline width: fit-content so the gradient box covers the longest line.

THE HERO
Left: a pulsing "Agents online · v2.4" pill, "AUTONOMOUS / FINANCE / AGENTS" with the middle word in the indigo palette, a lede, a pale pill CTA and a ghost "Watch demo" with a ringed play icon. Right: one scene built at a fixed 880x640 and scaled to its column. It contains:
- A tilted glowing orbit ellipse with a running highlight, dust and three dots riding it with SVG animateMotion.
- A glass JSON panel showing a live transaction whose fields flash as they change.
- A scrolling mini code panel and a faint ghost panel.
- Two metallic cards (copper and graphite: chip, contactless mark, brushed texture, perspective tilt) floating out of phase. A sweep of light crosses the graphite card when it gets tokenized.
- A checklist (Transaction read → Card tokenized → Risk analysis → Category assigned → Reconciled → Books updated) that steps through one transaction at a time, with a READ → TOKENIZE → ANALYZE → RECONCILE → CLOSE pipeline lighting in sync.
- A light beam dropping into a strip of water at the bottom of the hero, whose horizon line and reflection align to the beam.
Tilt the scene gently toward the pointer. Behind it all, three.js additive particle dust drifts sideways, and a low SVG rock silhouette sits on the waterline. Four big mono stats sit in the water strip.

THE SCANNER
Pin a section and scroll a horizontal track of cards through a fixed vertical light bar at the screen's centre. Each card is two layers, the solid card and a dark panel of churning code (pseudo-source about tokenizing, risk scores and ledgers, with a glitch flicker and a fading mask). Clip them against the bar every frame, so a card turns into code as it crosses. Fire a scan flash the first time it enters. Draw the bar on a 2D canvas as stacked additive glow layers with a particle spray that intensifies while a card is in the beam. Fade the bar in only once the intro text has scrolled past it. Below each card, a numbered caption: Tokenize, Score, Act, Close. A progress hairline tracks the scroll. Render particles only for sections on screen, in one requestAnimationFrame loop.

CONTROL
A bento of glass tiles with gradient hairline borders and a pointer-following glow:
- A live ledger: rows stream in at the top with a scanning badge that settles to Matched or Flagged, a light beam sweeps across the table, and the counts tick.
- Guardrails: four real role="switch" toggles drive an autonomy meter (Guarded, Supervised, Autonomous) and write to the audit trail.
- Connectors: chips orbiting a glowing NOVA core with depth-based scale and opacity.
- A signed audit trail with hashes, where human actions are marked in cream.
- Month-end: "2 days", in the ember palette, with before/after bars that grow on view.
- An approval card: Approve or Hold a payment, each logged, and a new request arrives four seconds later.

THE REST
A two-column FAQ (sticky head with a "Talk to a human" tile, native details with smooth height animation and a glowing left rule on the open item). Then a super footer: a framed stage with HUD corner brackets, "Put your finance ops on autopilot." with "autopilot." in ember, and a gooey spinning-gradient Deploy button. Clicking Deploy runs a simulated agent in a console (timer, progress bar, six log lines resolving to results, then three metrics popping in). Below it, link columns and a newsletter field. Last, a giant NOVA wordmark split by a moving scan line: solid on one side, wireframe on the other.

THE FLOOR
One h1, a main, data-section on every region, aria-hidden on every decorative canvas and the hero scene, real buttons with types, visible focus (including on the invisible button layered over the custom Deploy button), no horizontal scroll at 390px. Under prefers-reduced-motion, stop the decorative loops (orbit, floats, glitch, sweeps, the wordmark split). Keep the pinned scroll, because the reader drives it.`,
    preview: "hero",
    variant: "large",
    added: "Oct 12, 2026",
    demo: "/demos/nova-agentic-finance.html",
    bestFor: ["fintech and payments","AI agents for finance teams","card issuing and treasury tools","B2B SaaS with a live product story"],
    style: ["dark","violet","glassmorphism","scroll-pinned","canvas","threejs","gsap","credit-cards"],
    thumbnail: "/thumbs/nova-agentic-finance.jpg",
    theme: "dark",
    credits: [
      {
        label: "Made by Beings",
        href: "https://madebybeings.com",
        note: "The page's design and build, as credited in its footer.",
      },
      {
        label: "Card scanner inspired by evervault",
        href: "https://evervault.com/",
        note: "The scroll-driven scanner that turns cards into code follows the effect on evervault's site.",
      },
    ],
  },
  {
    title: "Paper Sun Agent Page",
    category: "web",
    categoryLabel: "WEB",
    description: "AI agents for the night shift: a paper-cut sunset panel you can slap stickers on, a dusk-to-daybreak arc, and a run log that stops to ask",
    prompt: `Build a single-file HTML landing page for "Daybreak", a fictional product that runs AI agents overnight on the work a team keeps pushing to tomorrow, and has it waiting, checked and reviewable in the morning. Bricolage Grotesque (display, optical sizing on), Figtree (body) and JetBrains Mono (labels) from Google Fonts, everything else inline, no libraries. Every illustration is inline SVG and CSS. Write all colour in oklch.

THE PALETTE
A deep night navy page (oklch 14% 0.045 265) with panels a step lighter, and a dusk ramp for accents: ember, flame, marigold, a pale sky cyan and a sun yellow (oklch 90.9% 0.189 99.9) for the primary buttons. Headlines are two lines: the first in a soft white-to-ice gradient, the second in a full spectrum gradient (cyan, violet, pink, orange, yellow) across the words. Buttons are fat pills with a darker bottom edge, so they read as pressable.

THE HERO
A small dot-led kicker, "Hand it off at dusk. / Wake up to it done.", a lede, and a command-line style input ("> Start a free night run") with a gradient hairline border and a yellow arrow key, then three checkmarked reassurances.
On wide desktops (1260px and up) only, frame the headline with the story's two ends in the side gutters. On the left is dusk: a glowing crescent moon in a faint orbit ellipse, and a dotted ember-to-violet trail down to a glass "6:00 PM · Brief handed off" card. On the right is daybreak: a steaming coffee mug (the copy says you check the result over coffee), drawn in SVG. It has a sun-yellow-to-marigold body with the headline's spectrum as a band, a dark glass saucer with a violet rim, and three steam curls that rise and fade. Give it the same glow as the moon, and add a dotted marigold trail down to a warm-rimmed "7:00 AM · Digest ready" card. Don't put a second sun here; the hero panel below already has one. Add a floating icon tile and a few twinkling stars and sparkles on each side. Size each side as min(270px, 50% - 434px) and anchor it 410px from centre, so it never touches the headline. Keep it behind the hero content and aria-hidden, and hide it below 1260px.
Under it, the signature: a big glass app panel in 3D (perspective from above, slightly tilted), with two faint orbit ellipses around it and a glowing floor. Inside, a paper-cut sunset drawn in SVG: a bloom and a radial sun, then three layered hills in blue, violet and a magenta-to-orange band, each edge traced with a blurred glowing stroke. Over it: an icon rail, a "Night run · 12 tasks completed" header and floating glass task cards (Bug fixes, Reconciliations, Reports filed, Follow-ups, Refunds) at different translateZ depths, bobbing gently. Small square icon tiles float outside the panel's edges. Size everything in the panel in cqi against a container-type: inline-size box, so the whole scene scales as one.
The panel is a button: clicking it slaps a round "done" sticker exactly where you clicked (Refund sent, Bug fixed, Inbox zero…), cycling colours, and bumps the task count. Each sticker peels on from a folded corner: compute the fold axis from a random angle, store it in custom properties, and animate one registered @property --p from folded to flat. Keep the last 14.

THE BANDS
The page is a stack of torn-paper bands that overlap with negative margins: an orange band ("One brief. One night. One review.") with three stat orbs (5× faster turnaround and two more), then a night-blue band for the product.

ONE NIGHT, HOUR BY HOUR
A half-dome night sky (aspect 2:1, rounded top) with stars and a sun that rises as the night progresses. A gradient arc traces the dome, with six stops placed along it: 6 PM Plain-language briefs, 8 PM Your tools scoped, 11 PM Many hands one run, 2 AM Checkpoints that hold, 5 AM Full replay, 7 AM The morning digest. Each stop is a button with a glowing orb and a label card placed on the side away from the arc. The active hour lights up, the past ones dim, the progress stroke fills to it via dashoffset, the stars fade and the sun climbs, and the sky's bottom glow changes colour per hour. Below, a console card: a "Night run · <phase>" bar, six progress segments (the current one fills over the 4.5s auto-advance), the time, a title, a paragraph and a one-line terminal snippet with a blinking caret, plus previous and next buttons. Auto-advance until the visitor picks an hour.

EVERY STEP, WRITTEN DOWN
A two-column section: copy and three live metrics (actions logged, agents working, waiting on you) beside a run log card for "Clear the refund backlog under $200". The log reveals a row every 1.4s on a vertical track that fills as it goes: brief received, work split four ways, orders matched, then "Paused for you" in red with a "Review 3 refunds" button, refunds issued, digest ready. Clicking review turns the row green ("Reviewed by you · Approved") and zeroes the waiting count. When the log completes, a "Morning digest ready" footer appears with "Replay the night"; it also replays by itself after a pause.

THE REST
Pricing (Solo $29, Team $99 lifted and outlined in yellow, Enterprise "Let's talk") as rimmed glass cards, an FAQ of native details with a plus that turns, a CTA with a second paper-cut sunset across the full width and the same command input (confirming inline on submit), and a footer with a reflection glow and link columns.

THE FLOOR
One h1, a main, data-section on every region, a visually hidden label on each command input, aria-pressed on the hour stops, aria-live on the console readout, aria-hidden on all decorative art, visible focus, no horizontal scroll at 390px. Under prefers-reduced-motion, stop both timers, show the whole run log, and freeze the bobbing, the stickers and the sky.`,
    preview: "hero",
    variant: "large",
    added: "Oct 12, 2026",
    demo: "/demos/daybreak-night-shift.html",
    bestFor: ["AI agent products","automation and back-office tools","async and overnight workflows","B2B SaaS with personality"],
    style: ["dark","night","sunset-gradient","paper-cut","3d-panel","playful","spectrum-type"],
    thumbnail: "/thumbs/daybreak-night-shift.jpg",
    theme: "dark",
  },
  {
    title: "Tide Reveal Agent Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An AI agent platform over a live WebGL sea that, on scroll, ebbs into a terminal window, then a clickable workspace and a run trace",
    prompt: `Build a single-file HTML landing page for "Undertow", a fictional platform that runs AI agents on a company's recurring work: they plan, act and check, and ask a person before anything irreversible. Archivo (variable width), Instrument Sans and IBM Plex Mono from Google Fonts, GSAP 3.12.5 and ScrollTrigger from cdnjs, everything else inline. No images: the sea is a shader, every product screen is HTML and CSS, every chart is inline SVG. Example domains and 555 numbers only, and mark the customers, quote and figures as illustrative in a comment.

THE SYSTEM
One palette for the whole page: deep navy #0a1830 surfaces, white type, one signal blue (#8fb8ff, #4c8dff for action) for progress and selection, and coral only where a person is needed. Archivo at 125% width for display and the wordmark, Instrument Sans for reading, Plex Mono for labels and data. Write the base in CSS layers with logical properties and color-mix(in oklab) tints off one --paper token, then scope everything below the hero to a .stone class that re-points the same tokens, so one card style (navy, 1.1rem radius, a hairline ring and a long soft shadow) and one featured card (light) serve every section.

THE SEA
The hero is a full-screen raw-WebGL ocean, written from scratch: one ray-plane hit per pixel, a five-octave crest function (rotate the wave direction each octave, wobble it with value noise), a finite-difference normal, Fresnel sky reflection, a tight specular glint and exponential horizon haze. Render it at 0.45 to 0.6 of screen resolution capped near 1.1 million pixels, at 30fps, paused off screen, in hidden tabs and under reduced motion (draw one frame). Lerp the sea's height, chop, speed and colours toward a preset so it can change mood smoothly. No WebGL falls back to a CSS gradient.

THE HERO
Over the sea: a stacked headline "DELEGATE / THE / WORK." in heavy white Archivo with a thin italic "THE", and a real visually hidden h1 ("Delegate the work. Keep the judgment."), since the stacked words are aria-hidden. Behind the words, a tall glass slab skewed -33deg, and joined to it a second slanted pane carrying the lede. Draw them as ONE glass: a script measures both boxes, builds the two parallelograms as path subpaths, clips one blurred, frosted fill to their union, and strokes each outline with the other shape masked out, so there's no seam where they meet. A drop shadow falls only outside the glass. A kicker with a long rule into the slab, and a single white pill CTA with a navy arrow disc and a slow sheen, inside thin concentric rings and crosshair ticks.
Size the whole composition off one --fs (about min(10.6vw, 16.5vh)) and make it clear the nav. The block is centred on the headline, but the slab and kicker hang about 0.8 x --fs above it, so reserve that in the hero's top padding (nav height + 0.8 x --fs + 1rem). Otherwise, on a laptop-height window (730px and under), the slab runs up behind the nav links. Check 1280x600, 1536x730 and 1920x1080: the gaps above the slab and below the CTA should come out about equal.
The nav starts flat and full width over the sea, then after 24px of scroll gathers into a floating glass pill. Inline links mark the section on screen; under 46rem they give way to a menu button that opens a full-screen menu which clips down from the top, with inert content behind, a focus trap and Escape to close.

THE TIDE
Pin the hero for 95% of a viewport and scrub one timeline: the headline words lift, scale and blur away like spray; a glowing tideline drops down the screen while the sea is clip-path inset() down behind it; then the sea gathers into the exact rectangle of a terminal window on the right (rounded 18px) while the canvas stage pushes in. Never resize the canvas, only clip it, or the shader stalls. The copy rises line by line from behind masks: "PLAN. ACT. CHECK. / THEN ASK YOU.", a lede, a blue copy-to-clipboard install line, an outlined "undertow init" quickstart and a platforms line. When the scene ends, the terminal types a run over the sea: the command, planning, four green tool lines, a coral approval stop, "approve? [y/N] y", and the email sent. Measure the terminal on init and on width changes only; a phone's toolbar changes the height mid-scroll.

THE PRODUCT
Three cards, each a small live product screen: a plan that writes itself step by step ending in an approval gate and a "Run plan" button that lights; a queue of task chips draining into four agents with load bars; and a re-plan shown as a line diff with the reason, confidence and ETA change, cycling through three diffs.

THE WORKSPACE
A full product window, as real as you can make it: a top bar with breadcrumbs, a ⌘K search, avatars and "+ New run"; a left column of six runs with live status dots (running, needs you, done), the agents and the connected tools; a centre with the run title, status, a progress bar and Timeline / Output / Logs tabs; a right column with a "Needs you" approval card (preview, Approve, Edit), the files the run made and a budget meter. The churn run advances by itself every few seconds until it reaches the approval; Approve completes it with a toast and it resets later. Runs are keyboard-navigable. Number the three regions with small pins and explain them in a legend underneath.

THE RUN TRACE
An SVG trace on a time axis: one lane per tool plus a "you" lane, each step a dashed bar that fills as a playhead sweeps, a confidence line underneath with an 80% re-plan threshold and an annotated dip. At the approval the playhead holds with a pulsing "Waiting on you" chip, which turns to "Approved by you", then carries on and loops. Play and pause, and seven step buttons to jump. A four-cell readout below (step, tool and time, confidence, elapsed) whose values wrap rather than overflow, and which is not a live region, since it changes every frame.

THE REST
A trust band (six typographic wordmarks, a quote card, three big stats, compliance pills; two wordmarks per row on phones), an API section where a segmented control, two range sliders and an approval switch rewrite the JSON request beside them, three pricing tiers with the middle one light, a sign-up form with an FAQ of native details, and a footer.

THE FLOOR
One h1 and one main (the app window's centre column is a div), data-section on every region, the terminal as role="img" with a label describing the run and its typed lines hidden from screen readers, labels on every control, visible focus rings, reduced motion respected everywhere, no horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 12, 2026",
    demo: "/demos/undertow-agents.html",
    bestFor: ["AI agent platforms","workflow automation","developer tools with a CLI","B2B SaaS with a product demo"],
    style: ["dark","navy","webgl","shader","scroll-driven","glassmorphism","product-ui"],
    thumbnail: "/thumbs/undertow-agents.jpg",
    theme: "dark",
  },
  {
    title: "Manga Panel Dev Tool Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A deploy CLI pitched as a black-and-white manga issue: a sliced retro sun over a city skyline, a typing terminal, three villains defeated and a reader-mail FAQ",
    prompt: `Build a single-file HTML landing page for "OVERCLOCK", a fictional one-command deploy tool, styled as an issue of a black-and-white manga. Bangers, Anton, Barlow Condensed and JetBrains Mono from Google Fonts, everything else inline. No images and no libraries: every illustration is inline SVG animated with SMIL, and the screentone is CSS. Strictly two inks, #111 and an off-white paper #f8f8f5. Use example domains only, especially in the curl | sh install line.

THE PAGE
One 1120px panel with a 4px ink border and a hard 10px offset shadow, sitting on a halftone-dotted grey desk. Under 640px the panel goes full bleed and loses the frame.

THE HAND-DRAWN LINE
Two SVG filters declared once (feTurbulence into feDisplacementMap): a strong one for outlines and a light one for display pieces. Never filter a box that contains body text, or the text wobbles too. Instead set border:0 on cards, steps, plans and the terminal and draw the outline as an ::after overlay with the filter on it. Apply the light filter directly to buttons, tags, badges, the logo mark and the big numbers.

THE HERO
A dot-screen background with a huge paper circle bleeding off the top left behind the copy. An "issue" tag (Vol. 03 · Dev Tools · 2026), then the h1 in Bangers, white fill with a 7px ink stroke using paint-order: stroke fill, rotated -2deg, with a boxed Japanese subtitle under it (限界を超えろ, beyond the limit). A lede on a padded paper panel (so the dot screen never runs behind the words) with one phrase reversed out in ink, two hard-shadow buttons that lift on hover and press on active, and a copyable install line.
On the right, a terminal panel tilted 1.5deg with a doubled offset shadow and a speech-bubble "12 seconds?!". It types oc deploy --prod, then streams detection, a cache hit, a build time, a block progress bar and a ✓ LIVE line, holds, and loops.
Behind it all, the scene: a retro sun rising into place, sliced by paper bars that slide down it and thicken as they go, two rings pulsing outward from it, a seeded skyline of ink buildings with lit and blinking windows, and a perspective grid floor scrolling toward the viewer. Reserve the hero's bottom padding for it.

THE SCENE BUILDER
Don't hand-write the suns and skylines. Mark them up as empty <g data-sun> and <g data-skyline> groups configured by data attributes (centre, radius, bar count, start, end, duration, invert; width, base, min and max height, seed, a dip so buildings shorten under the sun, night mode) and build them with one small script from a seeded PRNG, so the city is identical on every load. Pause each SVG's animations with an IntersectionObserver while it is off screen.

THE ROGUES' GALLERY
A diagonal-hatched break strip ("3 villains are wanted!"), then three villain cards in a 2+2 grid, the first full width split art/info. Each has a numbered tag, an animated scene, a boxed stat tag, a katakana sound effect, a name in Bangers, an ink "villain · defeated by X" role strip, a paragraph and a dashed-rule fact list:
The Slow Build: a speedometer whose needle swings from 14 MIN to 0.8 S with speed lines, over a conveyor of ticked boxes on spinning wheels.
Config Hell: four config file tabs whose tangled wires straighten into the OC badge, an "AUTO-DETECTED ✓" stamp and packets running down the wires.
The 3 AM Outage: an inverted night panel, a small sliced moon, twinkling stars, a skyline in night mode and a heartbeat line that spikes, with a "ROLLBACK!" flag.

THE REST
A "how it works" frame with a tab on its top edge, three steps with ghosted big numbers and code chips, and a note that uses strikethrough, wavy underline, an ink highlight and a hatched mark. A second break ("Choose your power level"), then three plans, the middle one inverted and tilted -1deg with a "Most picked!" tag.

READER MAIL
A third break ("Got questions?"), then a two-column FAQ of six native <details> items, the first open. Each summary is a tilted ink "Q.01" tag, the question in Bangers (wavy underline on hover) and a round plus that rotates into a filled minus when open. Wobble the item outlines with the same ::after overlay, hide the default marker, give the summary a dashed inset focus ring, and fade the answer in under a thick ink left rule.

THE FINAL CHAPTER
An ink end panel split copy and art. Copy: a bordered "Final chapter · Your move" kicker, "To be deployed…" in huge paper Bangers with a hard grey drop shadow, a tilted paper caption, a line of copy, a terminal-style signup (a "$" prompt cell, the email field and an ink "Join beta →" button fused into one paper bar with a hard shadow that lifts on focus-within), an inline validation line and three ✓ perks. Art: an inverted sliced sun setting on a horizon, pulsing rings, twinkling stars and a perspective floor whose cross-lines accelerate toward the viewer, with a floating paper chip showing the ✓ LIVE result. Faint concentric rings and a masked dot screen texture the ink. A thin footer.

THE FLOOR
One h1 and a main, data-section on every region, aria-hidden on every scene, the terminal given role="img" with a label describing the run, labels on the copy button and the email field, visible focus rings in both inks, no horizontal scroll at 390px. Under prefers-reduced-motion stop the typing (print the finished run), draw the suns as static slices and freeze every SMIL scene on a good frame rather than hiding it.`,
    preview: "hero",
    variant: "large",
    added: "Oct 11, 2026",
    demo: "/demos/overclock-deploy.html",
    bestFor: ["developer tools and CLIs","deploy and hosting platforms","indie dev launches","playful B2B SaaS"],
    style: ["black-and-white","manga","comic","halftone","hand-drawn","svg-animation","retro-sun"],
    thumbnail: "/thumbs/overclock-deploy.jpg",
    theme: "light",
  },
  {
    title: "Ghost Agent Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Invisible AI agents pitched as ghosts: pixel ghosts float up a curved hero, and three SVG ghosts clear a 100-task board live",
    prompt: `Build a single-file HTML landing page for "Haunt", a fictional company whose AI agents work like ghosts: invisible, in the tools a team already uses, noticed only when the work is done. Archivo from Google Fonts (the variable width axis), everything else inline. No images and no libraries: the logo, the favicon and both kinds of ghost are inline SVG or pure CSS. Fictional brand, invented customers and figures, example.com-style contact details.

THE TYPE AND THE PALETTE
Near-black #060409 night, a slightly lifted #0b0711 for alternate sections, warm off-white text. One accent run, cyan #49e7ff to violet #9769ff to pink #ff4fc8, used as a gradient on the key word of the hero, the step numbers and thin rules. Display type is Archivo at font-stretch 125% and weight 900, uppercase, line-height .8, tight negative tracking; labels are the same face at weight 500, small, wide-tracked caps. Every headline ends in a cyan full stop, and one word per headline is outlined (transparent fill, a 1-2px text stroke).

THE HERO
Full height, a vertical gradient from deep teal at the foot through plum to magenta at the top, with a pink radial off the top right. The signature shape: a big rounded bottom-right corner (clamp 64px to 240px), plus an inverse curve under the bottom-left made from two pseudo-elements, one filled with the hero's bottom colour and one with the page colour rounded on its top-left, so the hero pours into the next section. Keep the bottom colour in one custom property both use.
Behind the copy, twenty pixel ghosts float up the hero: each one is a single span built from seven linear-gradient rectangles (head, eyes, mouth, body, a fading tail) all sized off one --size variable, plus-lighter blended, wobbling with a squash-and-stretch keyframe while it rises. Pause them when the hero is off screen and drop them under prefers-reduced-motion.
Copy: "AI agents that work like ghosts." with "ghosts" in the gradient, a lede, a filled pink-to-violet pill and a ghost pill, and a right-aligned meta line in small caps.

THE NAV
Transparent over the hero, dark glass with a hairline after 20px. A gradient ghost logo that bobs and blinks, the wordmark, and a MENU button whose three lines fold into an X. It opens a full-screen takeover: big numbered links on the left, a contact column on the right. Mark it inert while closed, focus the first link on open, close on Escape and on any link, and lock the page scroll while it is open.

THE AGENTS
Four rows, not cards: number, name with a role in cyan small caps, a sentence, and pill tags on the right. Scout researches, Scribe writes, Sentinel watches, Poltergeist does ops. Rows get a faint violet wash on hover.

THE CUSTOMERS
A 12-column grid of four tall cards, 7/5 then 5/7, each a dark radial colour field with the client's initials as a huge outlined monogram, a category line, the name and one result. Cards take a real photo through a custom property (--img). Below, a 2x2 client wall and a placeholder quote.

GHOST SHIFT
The live demo. A 10x10 board of task cells behind the stage, masked to a radial so it fades at the edges, every third cell labelled SCOUT, every fifth SCRIBE, every fifteenth SENTINEL. Three cute SVG ghosts stand in a row, the middle one larger, each with a bobbing body and a shadow ellipse that shrinks as it rises; clone them from one <template>. A pill player underneath: SUMMON AGENTS starts a 480ms beat that clears one task per beat, lights the current cell and three random ones in pink, violet or cyan, hops the matching ghost, flashes its name as an outlined word behind the stage, and updates a status line and a gradient progress bar. The intro fades and blurs away while it runs. After 100 the board refills. The button toggles to SEND THEM HOME.

HOW IT WORKS
Three steps (Summon, Assign, Vanish) with big gradient numbers, and a four-up stats row.

THE CYBER CARDS
The customer cards and the steps tilt toward the pointer in 3D (up to 7 and 10 degrees). Inject the decoration with JS so the markup stays clean: a glare that follows the pointer, three corner glows, four sweeping gradient lines, a scan bar, six drifting particles and four corner brackets that slide outward on hover. Skip the tilt on touch and under reduced motion.

THE CLOSE
A floating ghost, "Let something haunt you.", contact lines, and a demo form: name, work email, company, a custom listbox select for team size (options with a sub-line and a check, full keyboard support: arrows, Home, End, Enter, Escape, type-ahead) and a textarea. Submitting opens a prefilled mailto. Then a thin footer.

THE FLOOR
A skip link, one h1, a main, labels on every field, aria-hidden on all the decorative ghosts and layers, visible cyan focus rings, no horizontal scroll at 390px.`,
    preview: "hero",
    variant: "large",
    added: "Oct 11, 2026",
    demo: "/demos/haunt-agents.html",
    bestFor: ["AI agent startups","automation and ops tools","B2B SaaS launches","marketing agencies"],
    style: ["dark","neon-gradient","playful","pixel-art","3d-tilt-cards","expanded-type"],
    thumbnail: "/thumbs/haunt-agents.jpg",
    theme: "dark",
  },
  {
    title: "Sunset Scroll Story Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A fusion company told as one long sunset: scroll and the sun goes down over a layered SVG landscape, night falls, then a live canvas tokamak takes over",
    prompt: `Build a single-file HTML landing page for "Solstice", a fictional compact-fusion company, where the first 6000px of scroll is a story: the sun sets over a layered landscape, night falls, stars come out, and only then does the page arrive. Space Grotesk, Inter and JetBrains Mono from Google Fonts; GSAP 3.12.5 and ScrollTrigger from cdnjs; everything else inline. No images - the landscape is one inline SVG, the reactor is canvas, the icons are inline SVG. Say in the footer that the company is fictional, and credit the parallax landscape to its original artist if you build on one.

THE STAGE
One SVG fixed to the viewport, viewBox 750 by 500 with preserveAspectRatio "xMidYMax slice", so the hills always meet the bottom edge and the sky crops at the top on wide screens. Give it a white background: the sky rect is a radial gradient at 80 percent opacity and the colours were chosen over white, so it goes muddy over anything darker.
Three scenes stacked in that one SVG: scene 1 is dusk hills, trees and two banks of cloud; scene 2 is a second, darker range that rises from below; scene 3 is the night sky with its own radial gradient, a star field and a final range of hills. Paint every layer with linear gradients from peach through rose to plum and navy, darker the nearer it is.
The scroll distance is a 6000px empty element behind the SVG, and a 6000px spacer in the flow so the real content starts after it. Every trigger is keyed to that element - a percentage of it or a pixel offset into it - so its height and the trigger timings change together or the scenes overlap.

THE SUNSET
All scrubbed, never timed. Over the first 45 percent the near hills drop and drift sideways at different rates and the cloud banks part to the edges. The sun is the centre of the sky's radial gradient: animate its cy from above the frame to below the horizon and widen its colour stops as it goes, so the glow spreads as it sinks. Then the second range rises in staggered layers, the sky's outer stop darkens to plum, and from 60 percent the night scene slides up from below with the stars fading in and a few of them twinkling on their own loops. A single falling star crosses late: draw it as a short SVG line with a white-to-transparent gradient plus a soft radial glow at the head, never a hotlinked image.

THE HERO AND THE STORY
The hero sits over the bright sky in deep plum ink, centred: a mono eyebrow pill with a pulsing dot, a two-line display headline ("A sun that never sets."), a lede and two pill buttons. It fades and lifts away over the first 9 percent of the scroll.
On wide screens the slice-scaled hills climb behind the lede and the secondary button, and dark plum text over dark purple hills disappears. Put a soft peach radial haze behind the hero copy, ending just under the buttons, and give the ghost button a pale translucent fill with a backdrop blur. Hide any scroll-down arrow that ships with the landscape - it lands on the buttons.
Two captions tell the story mid-scroll, each fading in, holding and fading out inside its own scroll window: "The sun sets. Demand doesn't." at the peak, "Firm power, all night long." once it is night. Put them in a glass pill with a mono timestamp above, so they read over both the yellow sun and the night sky.

THE NAV
Fixed, transparent and plum over the sunset; after 140px it turns to dark glass with light text. Under 760px it collapses to a three-line burger that opens a full-screen menu: big numbered links that stagger in, a full-width call to action and a live status line. Lock the page scroll while it is open, close it on Escape and on any link, and close it if the window widens past the breakpoint.

THE PAGE AFTER DARK
The content sits on near-black ink, z-index above the fixed SVG, with a gradient fade on its top edge so it rises out of the night rather than cutting across it. In order: a four-up stats band with sun-to-pink gradient numbers; four technology cards (magnets, plasma control, breeding blanket, power cycle), each with a mono index, an icon tile, a paragraph and a dashed-rule spec line; the reactor; a manufacturing split with numbered steps; a vertical, scroll-driven milestone timeline (a sticky left column with the heading and a giant sun-to-violet gradient year that rolls to the milestone being read, a status line and a 2023-2032 meter; on the right a rail that fills to a reading line 55% down the viewport with a glowing comet at its tip, and five glass cards that light as their node crosses that line, each with a year, a Done / In progress / Next / Goal tag and two key figures; nodes are pink when done, sun and pulsing for now, violet once reached); a careers list of rows that indent on hover; a CTA panel lit by a pink-to-violet radial with an email form; and a footer.

THE REACTOR
A canvas tokamak in a framed panel, aspect-ratio 1 to 0.92, sized by a ResizeObserver: 18 toroidal-field coils drawn as Princeton-D loops (a straight inner leg against the central column), split into segments and depth-sorted together with every plasma particle so each coil passes in front of and behind the ring piece by piece (opaque casings with source-over, the optically thin plasma with additive blending); casings lit warm by the plasma near its midplane, plus a soft camera bloom over everything so the near coils sit inside the glow; a central solenoid with a current pulse running up it; about 1600 plasma particles (750 under 700px wide) following helical field lines (poloidal speed = toroidal speed / q, with q rising from 1 at the core toward the edge); a divertor glow ring; and four label chips with dashed leaders. Project with a simple perspective camera, tilt and yaw it toward the pointer with easing, and spin it slowly.
Run a shot when the panel first comes into view: coils energise, breakdown, ramp-up, flat-top, with a HUD that shows the phase, a live telemetry table and a scrolling fusion-power trace, plus a "New shot" button that restarts it. Pause the loop when the panel is off screen. Under prefers-reduced-motion draw one settled frame instead of animating, skip the section reveals and the star twinkle, and keep the landscape scrub, since the reader is driving it.

THE FLOOR
One h1, a main, aria-hidden on the landscape SVG and both canvases, labels on the burger and the restart button, visible focus rings, no horizontal scroll at 390px.`,
    preview: "parallax",
    variant: "large",
    added: "Oct 11, 2026",
    demo: "/demos/solstice-fusion.html",
    bestFor: ["climate and energy startups","deep-tech company sites","hardware launches","storytelling homepages"],
    style: ["illustrated","parallax","scroll-driven","sunset-gradient","canvas","gsap"],
    thumbnail: "/thumbs/solstice-fusion.jpg",
    theme: "light",
    credits: [
      {
        label: "Parallax scroll landscape by isladjan",
        href: "https://isladjan.com/work/4/",
        note: "The layered SVG landscape and its sunset-to-night scroll choreography come from this piece.",
      },
    ],
  },
  {
    title: "Radiating Rings Hero Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Concentric stadium rings radiating out of the call to action, under a streaked orb, with glass readouts floating in the gaps",
    prompt: `Build a single-file HTML landing page for "Proxima", a fictional inference edge network, where the hero is a wavefront: concentric stadium rings radiating out of the button, a streaked orb hanging over them, and glass readouts floating in the gaps. Poppins and JetBrains Mono from Google Fonts, everything else inline. No images and no libraries - the orb, the rings and the starfield are all CSS. Say in a legal line that the network and every figure are invented, and label the figures on the page as invented too.

THE RINGS
Five closed stadiums, every one centred on the button rather than anchored to the bottom, so the stack reads as a tunnel seen end-on instead of a set of arches. The outer is wide and flat - about 2.4 to 1 - and the next three step down uniformly at 86, 72 and 58 percent. The innermost breaks the pattern and goes flatter still, 50 by 40, so it hugs the button.
Fill each with a three-stop gradient running almost vertically, pale blue at the top through mid to deep navy at the foot, and give every one a 1px inset highlight on its top edge plus a soft outer glow so the bands separate without hard outlines.
Then lay a band of light across the middle of the stack: a wide flat radial in near-white, screen-blended, sitting slightly above centre and slightly left. That single element is what makes the rings read as lit from behind rather than as five stacked shapes.

THE LIGHT
No hard-edged sphere. The background is a wash: a large radial raked in from the top left over a diagonal gradient that falls to near-black at the bottom right. Add one soft rake of light off the top-left corner, but blur it far more than feels necessary - at 26px a rotated pill leaves a visible diagonal seam straight across the hero, and it needs to be nearer 96px to read as light rather than as a shape.

THE LIGHT TRACKS THE POINTER
The source carries a pointer listener called "tracking", and it is the thing that makes the hero feel alive: the light follows the cursor and the lit band on the rings follows with it.
Do it with transforms on two elements, not by animating gradient positions. Put the wash in its own element rather than in the section's background - moving a viewport-sized radial by editing its background-position repaints the whole hero on every frame, where a transform does not.
Move the band across the rings at about a third of the pointer's travel, so it stays on the stack instead of running off the ends, and leave a soft static wash underneath so the rings are never unlit. Lerp both toward the pointer and park the loop once they have caught up, rather than burning a frame a tick.
Rest it where the composition was authored - light up and to the left - so the page looks right before anyone touches it, on a phone, and under prefers-reduced-motion, where it is placed once and never tracks.

THE RINGS LIGHT WHEN YOU GO FOR THE BUTTON
The source has a listener per ring - box1 through box5 - and they are there so the stack illuminates when the pointer arrives. Hovering anywhere on the stack, the button included, lifts every ring to a brighter version of its own gradient.
Fade in a pseudo-element over each ring rather than filtering or re-shadowing the ring itself: opacity composites, and five stacked 1200px shapes re-filtering on hover does not.
Stagger it from the button outwards, and put the delay in the :hover rule rather than the base one - then the light ripples out on the way in and the whole stack drops together on the way out, which is what it should do. Measure it: at 70ms only the innermost should have moved.
Key it off :focus-within as well as :hover so it answers a keyboard too.

THE BEADS
A scatter of small circles, some solid blue and some just a ring, sitting ON the stack rather than behind it. Put them in their own layer inside the stack, above the rings and below the button: in the page's dust layer they disappear under the first band.

THE NAV
A pill nav with an indicator that slides between items. Measure it from the active link rather than hard-coding offsets, so it survives a font swap or a copy change, and re-measure on the font-ready promise and on resize. Let an IntersectionObserver hand the pill to whichever section is actually on screen.

THE REST
A starfield placed once from a seeded generator - nothing here needs to move to read as depth, and the hero already carries a 950px orb and five stacked stadiums. Then three feature cards whose badges are the ring motif at badge scale, a three-step list, four figures, a close and a footer.`,
    preview: "hero",
    variant: "large",
    added: "Sep 27, 2026",
    demo: "/demos/proxima-edge.html",
    bestFor: ["AI inference and edge networks","cloud infrastructure","developer platforms","usage-based pricing"],
    style: ["dark","blue","glassmorphism","concentric-rings","pointer-light"],
    thumbnail: "/thumbs/proxima-edge.jpg",
    theme: "dark",
  },
  {
    title: "Speech Console Dashboard",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    sectionOnly: true,
    description: "A moulded player deck for synthesised speech: a lit waveform, a dotted gain knob, stereo tick meters and a transcript that reads along",
    prompt: `Build a single-file HTML dashboard for "Timbre", a fictional speech-synthesis console. Inter and JetBrains Mono from Google Fonts, everything else inline. No images - the deck, the knob, the meters and the waveform are all CSS. Not a landing page: no hero, no pitch. Topbar, body, status bar, and nothing that scrolls, so page height equals viewport height exactly.

THE DECK
One piece of injection-moulded plastic sitting on a stack of trays. Off-white #f2f2f2 to #e7e7e7, a 22px radius, one light source at the top left, and a 1px white inner keyline just inside the edge to read as a moulding seam. Two tray slabs peek out below it, each a little narrower than the last.
Give the tray wrapper its own stacking context - position relative and z-index 0 - or the negative-z tray pseudo-elements fall through it and paint behind the page instead of behind the deck.
Sunken into the deck: a near-black screen at #1f2022 with an inset ring and an inner top shadow. Track title left, voice right, a metadata row along the bottom in mono - model, codec, rate, depth, elapsed.

THE WAVEFORM
Ninety-six bars, one span each, heights from a seeded generator so a take's shape is its own and never shifts between loads. Shape it like speech rather than noise: syllable bursts inside phrase-length swells, with the occasional near-silent gap.
Bars behind the playhead light to near-white; ahead of it they stay a dim slate. The playhead is a 2px amber line with a rounded cap that overhangs the top of the screen. Amber is #ff7700 and it is the only colour on the page.

THE CONTROLS
Five transport keys - previous, play, pause, stop, next - as small raised rounded rectangles that press in on active.
A gain knob: forty dots on a 270-degree arc, lit up to the value, with a raised cap and an indicator notch. Drag it on vertical travel, not on the angle to the pointer: a rotary that snaps to wherever the cursor happens to be is unusable. Give it arrow keys and a slider role too.
Two stereo tick meters, left and right, reading the waveform amplitude under the playhead rather than random noise - they should agree with what is on screen.

THE READ-ALONG
A transcript under the deck, one element per word, lit by the same playhead the waveform uses so the two can never disagree: word n lights when the head passes n over the total. Said words go to ink, the current one to amber.

THE REST
A queue of takes down the right side, each loading its own waveform, transcript, voice and model, plus three figures. One rAF for everything, parked whenever nothing is moving.
Under prefers-reduced-motion nothing auto-plays, but every control still works.
NO BRAND CHROME
This is a screen from inside a product, not a page selling one. Whoever is looking has already signed up, so the bar across the top carries the view they are in, the live status and the session or unit they are looking at — and no wordmark, no logotype and no marketing nav. A mark up there is the single thing that drags the whole screen back into looking like a landing page. Tabs that switch views stay, because those are the product; links to Pricing and Features do not, because there is no longer anything to sell. The one place the fictional name still belongs is the legal line in the status bar.
`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 26, 2026",
    demo: "/demos/timbre-console.html",
    bestFor: ["voice AI consoles","text-to-speech tools","audio review dashboards"],
    style: ["light","neumorphic","monospace","amber-accent","one-viewport"],
    thumbnail: "/thumbs/timbre-console.jpg",
    theme: "light",
  },
  {
    title: "Highlighter Markup Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A marked-up document: every highlight is a real highlighter, rough-edged by an SVG displacement filter, with a colour per verdict",
    prompt: `Build a single-file HTML landing page for "Footnote", a fictional grounding checker that marks up model output against the sources it was given. Source Serif 4 and JetBrains Mono from Google Fonts, everything else inline. No images - the paper grain and the highlighter texture are inline SVG data URIs. Say in a legal line that the product and every figure are invented, and label the figures on the page as invented too.

THE HIGHLIGHTER
Restyle <mark> as a real highlighter rather than the browser's flat yellow block.
Put the colour on a ::before behind the text, not on the element: an feTurbulence plus feDisplacementMap filter roughens the edge, and run that on the element itself and the glyphs come out wobbling too. Make it wider than the word (100% + 1ch, pulled a quarter-ch left), a little taller than the line, with one elliptical corner on the bottom right, a noise texture over the colour at 75% opacity, and two inset shadows in the same hue darkened twenty points. Then a ::after: a small rotated radial blob just past the last letter, where the pen rested a beat too long.
Drive it all from one --color custom property so a class or an inline style can recolour any mark.
Use relative colour syntax for the shading - hsl(from var(--color) h s calc(l - 20)) - so one property is the only thing a new colour needs.

THE WRAP
A mark has to be display:inline-block for the filter to have a box to act on, and that means a marked phrase cannot break across a line. This is the source's own open problem.
The fix is to stop marking phrases. Script splits a marked phrase into one mark per word, so the line breaks between them, each word keeps its own rough edge, and only the last word keeps the pen blob. Verify it by narrowing the viewport until the phrase has to break and checking the words report two distinct top offsets.

THE PAPER
Flexoki: #fffcf0 paper, #100f0f ink, and the 400 ramp for the highlighter tray.
Two grains, not one. The marks want the noise strong; the same value multiplied over the whole sheet turns warm paper grey - sample a pixel rather than trusting the computed background-color, which ignores the blended image entirely.
Flexoki red 400 and orange 400 sit a hair apart, and at 75% over warm paper two different verdicts came out the same colour. Deepen the red until a pixel sample puts real distance between them; on a page where the colour IS the verdict, that is a correctness bug rather than a taste one.

THE PAGE
A hero whose lede demonstrates the three verdicts it names, a tray of four colours each meaning something, a marked-up answer where every claim is a button that opens the span it was checked against, a strip of figures, three steps, and a close. Serif for the prose so it reads as a document, mono for every label and piece of chrome.
Make the claims buttons rather than hover targets, with aria-expanded and aria-controls, so the whole thing works from a keyboard.

THE RIDGELINE
Under the hero copy, seven silhouettes receding. Spread their crests across the WHOLE band, furthest one near the top: crowd them into its foot and there is barely any vertical range for the parallax to work with, so the layers separate by a few pixels each and the effect reads as a wobble. With the range filling the band the trees hold station while everything behind them sinks and a wide seam of sky opens above — which is the entire point of the ladder. the page's own highlighter hues run warm to cool and pale to deep from the furthest ridge to the conifers in front, so the recession is the palette rather than a second colour scheme. Give the hero the height to hold it - copy at the top, ridgeline filling the rest. The sun belongs up with the headline, not on the horizon, which is the order those two things come in anyway; a disc at z-index -1 needs a stacking context on its parent or it drops straight through to the page background, and with one there the copy paints over it without a single heading needing a z-index of its own.
The parallax is the old perspective trick: a scroll container at perspective 100px with each layer pushed back translateZ(-100x) and scaled (x+1) to undo the shrink, x running 3 to 0. Read what that actually does before you copy it. The scale exactly cancels the perspective division, so every layer's net scale is 1 and the only thing depth changes is that each one travels at 1/(1+x). The catch is that it needs the element carrying the perspective to BE the scroller, which on a real page means a second scrollbar nested inside the hero. Keep the ladder, drop the nesting: drive (1 - 1/(1+x)) of the scroll distance onto each layer and you get the same picture with the page's own scrollbar.
Proportional to the DISTANCE SCROLLED, and monotonic. The tempting shortcut is a 0-to-1 progress across the block's crossing scaled by a fixed travel, and it is wrong in a way that is easy to miss: the layers are already half spread before the block has been seen and they re-converge on the way out, where the original starts composed and comes apart the whole way past. Anchor the distance to the moment the block's top reaches the foot of the viewport so it begins at rest.
The original can afford the full lag because its layers are scaled boxes with bottom-anchored art and several viewport-heights of headroom. A band on a page has none of that, so scale the gain to the band — the RATIOS between the layers are what read as depth, not their absolute travel — and keep it to about half the band's height, or the far ridges sink clean out of frame and the section ends as silhouettes on an empty sky.
Draw the ridges rather than fetching them. Seven silhouette PNGs is how this is usually done and it ties the page to somebody else's server; a sum-of-sines ridge and a run of two-tier conifer spikes are a few lines each and can be cut from the palette you already have.
Every layer but the nearest moves, and a layer that has drifted up shows its own bottom edge - a sliver of sky under the hill in front of it. Run each fill on past the foot of its box so there is always more colour below than any layer can uncover.
`,
    preview: "hero",
    variant: "large",
    added: "Sep 26, 2026",
    demo: "/demos/footnote-grounding.html",
    bestFor: ["LLM grounding and evals","RAG citation checking","AI trust and safety","document AI"],
    style: ["light","editorial","paper","serif","highlighter"],
    thumbnail: "/thumbs/footnote-grounding.jpg",
    theme: "light",
    credits: [
      {
        label: "Nice <mark> by Christian Alder",
        href: "https://codepen.io/HejChristian",
        note: "The highlighter treatment - the displaced ::before, the pen blob and the --color hook - comes from this pen.",
      },
    ],
  },
  {
    title: "Recessed Aperture Hero Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Soft UI in a violet palette: an aperture sunk into the page, tokens drifting across it, and a working run dial below",
    prompt: `Build a single-file HTML landing page for "Mnemo", a fictional context layer for agents, where the hero is an aperture cut into the page. Barlow and Barlow Condensed from Google Fonts, everything else inline. No images at all - every disc, pill and badge is CSS. Say in a legal line that the product and every figure are invented, and label the figures on the page as invented too, not only in the footer.

THE MATERIAL: SOFT UI, DONE PROPERLY
One light source at the top left, and every raised or pressed surface is the SAME colour as the page. That rule is what the whole effect rests on - tint a surface away from its background and the shadows stop reading as relief and start reading as a drop shadow. Light mode does this with #FFF against #F0F0F3; the violet equivalent is a lighter and a darker violet either side of the page colour (#7f6b9b and #4d3e60 against #695681).
Put the relief on a pseudo-element behind the surface, not on the surface itself. One element can then carry an outer and an inner cast at once and cross-fade between them, which is the entire interaction language: press a card and its outer shadow fades out while its inner one fades in.
Two consequences to plan for. Anything using it needs its own stacking context - z-index 0 on the surface - or a z-index:-1 pseudo-element falls through its parent and lands behind whatever ancestor painted last. And never put overflow:hidden on one of these: it clips the cast and the element goes flat.
Build four named variants off the same pair - raised, pressed-lit-from-the-top-left, pressed-lit-from-the-bottom-right, and a shallow bead that is raised and pressed at once - and use them for everything: the aperture, the cards, the badge dots, the stat panels, the price wells, the switches, the slider track and the accordion rows.
The background must be flat. A gradient behind a flat-filled card turns every card into a lighter patch the further down the page you get, which is the one thing that gives the trick away.
Palette: coral #FB8A8A and cream #FFEDC0 for the marks, and two gradients - cream to peach, and indigo to orchid.

THE APERTURE
Two concentric wells sunk into the page, with a drift of rounded pills crossing them and the context size sitting in the hole.

THE PARALLAX
Six layers, each with a depth from 1.2 down to 0.1, translated against the pointer and lerped toward the target. Do not reach for a parallax library: it is one lerp and one transform per layer, and writing it out means you can stop the loop when the aperture scrolls away and park it once the layers have settled, which a drop-in will not do for you.
Watch what you keyframe. The entrance on the big number animates transform, and so does the parallax - but a filled animation outranks an inline style, so keyframing the layer itself leaves that one element the only thing in the scene that never moves. Parallax the layer, animate a child inside it.

THE TOKENS
Twelve pills, four per layer, sliding across and tapering on a thirteen second loop with staggered delays.
Make the field they live in wider than the viewport, not just wider than the aperture - 1800px against an 800px disc - and start a third of them off the edge so they bleed in. Sized to the disc they only ever orbit the hole and the page is bare either side of it; overrun the viewport and the hero fills right out past both edges. Place the outliers' delays between the others' so neither side band is ever empty at the same moment, and make the pills large: 170 to 380px wide, not 70 to 180.
Keep them out of the band the eyebrow sits in. Everything sweeps the full width, so a token cannot be kept off the copy by its x position - only by its row. The scrim under the copy is strongest at its middle and has already faded by the top, which is exactly where a 380px pill crossing the eyebrow will be least covered.
Animate left and width, not a transform. scaleX squashes the 80px radius into a lens and the pill stops being a pill, and on twelve small absolutely positioned elements the layout it would have saved measured at nothing.
Taper to a fixed width rather than a percentage of the field: at 1400px wide a tenth of it is 140px, which is larger than half the tokens start at, so they would swell on the way across instead of shrinking. On a phone the field is several times the screen width, so scale the field itself rather than re-sizing twelve pills and their positions by hand.

THE FIGURE
The context size, printed twice: once in white and once behind it in the shadow colour, blurred 10px at 80% opacity, so the front copy sits inside its own shadow. Punch it in from scale(10) with a skew.
Sit it in the upper half of the aperture and give the copy the lower half. Select it as .layer.figure, not .figure - the responsive rules retune .layer, and at equal specificity the later rule wins, which quietly hands the numeral back its centred position on a phone and drops it on the headline.
The copy sits where the drift is densest, so put a soft radial scrim behind it. The pills stay visible around the edges and the text stops fighting them.

BELOW THE FOLD
Three feature cards, a strip of four figures, a three-step pipeline whose step rules are the same token pill lying flat, a control panel, a pricing row, an accordion and a close.
The control panel is where this material earns its keep, because a control is the one thing it describes literally: a track is a well, a knob is a raised disc, a dial is a well with two more inside it. Make them work - the switches change the budget the slider sets, and the dial reports the result - so the panel is a working model rather than three pictures of controls. Scale the dial so it only touches its ceiling at the extreme; multiply a fraction by 100 and any pin at all pins it at 99. Keep the nav's underline trick: a 4px gradient bar that grows from left:100% to 40px wide on hover.
Under prefers-reduced-motion the aperture is already open, the pills are parked where they were authored rather than mid-drift, and the parallax never starts.`,
    preview: "hero",
    variant: "large",
    added: "Sep 26, 2026",
    demo: "/demos/mnemo-context-window.html",
    bestFor: ["agent memory infrastructure","LLM platform APIs","AI developer tools","usage-priced dev products"],
    style: ["purple","neumorphic","soft-ui","parallax","condensed-type"],
    thumbnail: "/thumbs/mnemo-context-window.jpg",
    theme: "dark",
    credits: [
      {
        label: "Parallax 404 by Rafaela Lucas",
        href: "https://www.rafaelalucas.com",
        note: "The recessed discs, the drifting pills and the doubled figure come from this pen.",
      },
    ],
  },
  {
    title: "Stage Light Launch Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A product announcement lit like a stage: conic spotlights, rising dust, a hairline grid and a light sweep running through the wordmark",
    prompt: `Build a single-file HTML launch page for "Umbra", a fictional inference runtime, staged like a product reveal under theatre lights. Archivo and JetBrains Mono from Google Fonts, everything else inline. No images and no libraries - every beam, mountain and particle is CSS or canvas. Say in a legal line that the product and every claim are invented.

THE STAGE
One 44em section holds the whole fold, position: relative and overflow: hidden, layered back to front: three conic spotlights, a dust canvas, the drafting frame, the type, and a ridge of lit mountains along the bottom.
Size the whole composition off one custom property - --size: min(min(600px, 80vh), 80vw) - and set the body font-size to 3% of it with a 10px floor, so the stage scales as a single object instead of as a pile of independently responsive parts.
Place the stage's children with percentages of the stage, not em. A top value in em resolves against the element's OWN font-size, so a 1.15em tagline at top: 24.4em lands 15% lower than the 1em grid around it - which is exactly how it ends up sitting on the mountain peaks.

THE SPOTLIGHTS
Each beam is a conic-gradient from 0deg at 50% -5%: transparent to 45%, the accent at 30/52/30 percent opacity across 49-51%, transparent from 55%. Give it a 30em width, an 86vh height, a bottom border-radius of 50% and transform-origin at the top centre, then blur it. Two of the three are rotated 20 and -20 degrees. They scale up from nothing on load and then drift forever.
Put the drift on a wrapper and the blur on the cone inside it. Keyframing scale() on the blurred element re-blurs a 30em layer every single frame; moving the transform to a parent lets the blurred cone rasterise once and be re-composited. Measured on the same software rasteriser that is 33fps against 45. Do not reach for will-change here - promoting three large blurred layers made it worse, not better.

THE DUST
A canvas of fine specks rising from the bottom edge, one per 2600 square css pixels, each a 1px-wide rect of random length, alpha and speed that holds and then fades out. Cap devicePixelRatio at 2.
Drive the rise and the fade in seconds off the frame delta, never in per-frame decrements, or every particle lives half as long on a 120Hz display. Guard the canvas resize behind an actual dimension change too: assigning width or height wipes the bitmap and resets fillStyle, and a ResizeObserver's own first callback will happily do that straight over the frame you just drew.

THE FRAME
A hairline grid, and it runs the length of the page rather than stopping at the fold - that is the point of it. Four verticals, and horizontals wherever a section starts or stops, with a small node dot at every crossing.
Express the vertical offsets as percentages of the viewport - roughly 28.5% and 40.5% in from each edge - not in em. Fixed em offsets measured from opposite edges swap sides somewhere around 1000px and end up 35px apart in the dead centre of the page at 900; percentages stay evenly distributed at every width and let you keep the outer pair on a phone instead of hiding the frame there.
The stage owns the top of the grid and a second layer owns everything below it. Because the lower section is a stacking context, that layer can sit at z-index -1 - above its own background, behind all of its content - so you do not have to make every section positioned just to stay on top of the grid. Both layers measure from the same viewport edges, so they line up as one continuous frame with no measuring.
The stage's grid scales in on load. The horizontals below it draw themselves out from the middle on an IntersectionObserver as you reach them, with the nodes fading in a beat behind the line, so the frame keeps assembling the whole way down instead of arriving all at once.

THE TYPE
A monospace "Introducing" eyebrow with a gradient rule fading out either side, then the wordmark at 7em.
Register @property --p as a percentage and animate it 0 to 300%. The wordmark's background is a 2em radial gradient at that position sitting over the base gradient, clipped to the text, so a highlight travels across the letterforms. Print the wordmark a second time behind the first with the same sweep blurred at 16px so the light bleeds past the glyphs.

THE RIDGE
Three squares rotated 45 degrees with inset box-shadows for the lit edges and a repeating-radial-gradient in one corner for the contour texture, sliding up from below into a horizon. A ::before over them fades to the page background so their bases dissolve into haze - run that fade over three stops, not two, or the mask ends in a visible horizontal seam across the full width.

THE STAGE LIGHT
The dot in the header swaps the whole page from cold moonlight to warm gold. Do it by redefining five custom properties under a body class, not with filter: invert - inverting turns the gradients to mud, and the dust should pick up the new colour too.

BELOW THE FOLD
A centred pitch with two concentric-ring accent shapes floating either side, then three capability cards, one wide card for the platforms it runs on, a strip of four figures, and a close. Balance the card headlines so none of them orphans a word, and label the figures as invented on the page, not just in the footer.

THE CARDS
One card component carries all three sections. A plate fills the card with a 3px gradient frame; inside it a dark face with asymmetric corners - roughly 13px, 99px, 40px, 13px clockwise from the top left - so the tint only shows as a hairline down most of the edge and swells into a crescent where the face pulls back off the corner. A gradient disc turns slowly behind it, a frosted panel floats over the left with the copy, and a rail of small mono type runs down the right ending in a circular chevron.
Keep the face opaque. That is what stops the drafting frame crossing the copy: the grid stays in the gutters between cards and behind nothing you have to read. Check it by sampling pixels rather than by eye - a rail should add zero brightness inside a card face and about +34 in the gutter beside it.
Push the disc against the right edge so it reads crisp in the rail gap and frosted behind the panel. Centre it and a wide panel swallows it whole, leaving a grey blur under the body copy and no disc at all. On the figure cards, which have no rail, reserve the same strip by hand or you get the blur with nothing to show for it.
Tint the panel glass dark rather than white. White frost over a bright disc does nothing to it, and the longest line of copy ends up sitting in the glare.
A disc turns only while its card is on screen. Every frosted panel over one has to re-read and re-blur its backdrop whenever it moves, so an offscreen card that keeps spinning pays full price for nothing. Track the on-screen set rather than toggling a class straight off the observer, or coming back to the tab leaves every disc parked - returning is not an intersection change.

TYPE FLOOR
Everything scales off --size, which on a phone is driven by 80vw, so the mono labels land between 6px and 9px there. Floor the base at 13px and give each small label its own max(0.6em, 10px) so the page stays legible when the composition shrinks.
Under prefers-reduced-motion the stage still arrives, it just arrives already assembled: beams at full opacity, mountains in place, the whole frame drawn with its nodes, one still frame of dust, and the stage light still switches.

THE FIELD — one frame for the whole page
Do not give each section a few rules of its own. Fix one drafting frame to the viewport and let the page slide past it: brackets in the four corners and a labelled depth axis, and nothing else. Resist ruling it. A full grid of verticals and horizontals is the obvious version and it is the wrong one — the lines run straight through the type and the artwork, and the page ends up sitting ON a diagram instead of being annotated by one. A ruler across the top has the same problem in miniature: it lands directly under whatever the eye goes to first. What survives is the margin notation, which says the same thing and competes with nothing.
Pin the axis and the brackets to ONE inset and let the axis span the full frame, top corner to bottom corner. At any inset short of that it sits inside the measure the content is set in and something eventually runs into it. Push the labels past the bracket's own arm or the first and last of them land on top of it. Two line weights, not one, and draw the lot in the variable the stage light swaps so the frame changes colour with the lamp.
Layering is the part that will bite. A page like this usually has an opaque panel under its lower half at a high z-index, which buries anything fixed behind it. Turn that panel into a ::before backdrop at z-index -1 and drop the wrapper's own z-index so it stops being a stacking context — then the backdrop escapes to the root, the fixed frame paints over it, and the sections lift to z-index 1 to paint over the frame. Backdrop, frame, content, in that order.
A fixed frame is wallpaper unless something in it moves with the reader, so put a cursor on the depth axis: a mark and a three-digit readout that ride the scroll. One custom property and one text node per frame, written from a rAF off a passive scroll listener, nothing that touches layout.
Two traps. A second line weight built as a color-mix of the first at more than 100% comes back unchanged, because a single percentage over 100 is clamped — declare the heavier weight outright. And when you switch the sweep off for reduced motion, match the specificity of the rule that started it; a two-class override loses to a three-class rule even inside a media query.

THE LAMP STAYS PUT
The bar and the light are fixed to the viewport and live outside the stage, not inside it: the lamp holds its place while the page runs underneath, so whatever section you have scrolled to is the one being lit. Put the cones on the same layer as the background frame — over the frame and over the lower page's panel, under the content of whatever section is on screen — so the light reads as falling behind the words rather than washing them.
Lifting the bar out of the stage is not optional. A fixed element inside a wrapper that is itself a stacking context has its z-index resolved INSIDE that wrapper, so a bar at z-index 60 in there still paints under a section at z-index 1 outside it, and the thing you just fixed to the viewport disappears the moment you scroll. Move it to the body.
One control, three states, cycling cool then warm then out then back. The two lit states are a palette swap; the third kills the cones and leaves the bulb a dark disc with a cold rim, which is the moment the background frame has to carry the page on its own. aria-pressed has two values and cannot describe three — let it track lit against unlit and put the real state in the label, updated on every press.
Set the two ends of the bar as one object at opposite insets: same size, same weight, same resting opacity, same hover. A pill on one side and a wordmark on the other never sit on the same line however carefully you nudge them, because one has a box and the other does not — and a bar with a lamp in the middle of it wants both ends to be type. Keep the boxed treatment for the call to action at the foot of the page, where it is the only thing on the line.
Leave the scroll indicator as the mark alone. A readout beside it is a second thing to read at the edge of the eye, in the one place on the page nothing should be asking for attention; the mark's position on the scale already says everything the number did.

THE STAGE AND THE GROUND
Size the stage to one viewport in svh, not a fixed measure in em and not vh — em leaves the fold landing wherever the root size happens to put it, and vh makes a phone's collapsing URL bar resize the whole composition mid-scroll. Keep a min-height so a short window does not crush the wordmark into the ridge.
Anchor the ridge to the stage's FOOT, not to a percentage part-way down it. The peaks are big shapes that hang well below their own box; floated at 72% they end wherever the fold happens to cut them, which reads as clipped artwork. Sitting on the bottom edge they come up out of it and the viewport cuts their bases, which is what a range on a horizon does anyway — no ground line needed, because the fold IS the ground. Keep them on a layer above the background frame so they cross its rules instead of stopping short of them.
Then take the ridge apart on the way out: a single 0-to-1 value over the first half-screen of scroll, written to the STAGE — not to :root, where a per-frame custom property write invalidates the whole document — with each peak given a resting offset and a direction to leave in, and the whole group fading as they go. The entrance animates the bottom offset, so drive the disassembly from the translate property and the two never contend for a channel.
Keep the background to the frame and the light. A drifting particle field and a ring of instrument circles both sound like they belong on a page like this, and both turn out to be noise once the frame is doing its job — the particles cost 22 frames a second on their own, and a circle sitting beside the wordmark competes with the one piece of type the page exists for.`,
    preview: "hero",
    variant: "large",
    added: "Sep 25, 2026",
    demo: "/demos/umbra-eclipse.html",
    bestFor: ["AI infrastructure launches","developer runtime announcements","waitlist pages","product reveals"],
    style: ["dark","theatrical","spotlight","conic-gradients","scroll-driven"],
    thumbnail: "/thumbs/umbra-eclipse.jpg",
    theme: "dark",
    credits: [
      {
        label: "Eclipx by RAFA3L",
        href: "https://codepen.io/RAFA3L",
        note: "The spotlight cones, the swept wordmark and the rotated-square ridge come from this pen.",
      },
    ],
  },
  {
    title: "Machine Front Panel Page",
    category: "web",
    categoryLabel: "WEB",
    description: "The landing page is the front panel: it boots itself on load, runs a needle self-test, then hands the switches to you",
    prompt: `Build a single-file HTML landing page for "Kiln", a fictional on-premise inference appliance, where the page IS the machine's front panel. Archivo and JetBrains Mono from Google Fonts, everything else inline. No images - every screw, blade, gauge and LED is CSS or inline SVG. Say in a legal line that the product and every reading are invented.

THE FOLD
There is no separate hero. The headline is etched into the chassis as a nameplate across the top of the machine - stencil line, h1, one paragraph, and a small lamp cluster on the right - so the working instrument starts inside the first screen instead of underneath half a page of copy. Budget the machine to about 780px tall: a nameplate that wraps to three lines will push it past 950 and cut the readouts off the bottom, so keep the headline measure wide (24ch) rather than narrow and tall.

THE BOOT
The page wakes itself about 560ms after load, because the first thing a visitor should see is the machine coming up rather than a dead panel waiting to be clicked. Three things fire together: a one-shot amber flash across the plate, a stepped opacity flicker on the power lamp so it catches before it latches, and an instrument self-test where the gauge runs all 34 ticks to the stop, holds, falls back, and only then hands over to the real load. Everything downstream - fan spin-up, coil glow, the four readouts - comes free from the load integrating.
Under prefers-reduced-motion skip all of it and start already running: no flash, no flicker, no sweep, no spinning turbine, but every switch, gauge and readout still live.

THE MATERIAL
Near-black #0a0a0c with iron plates at #1f2126 to #17181c. One .plate class carries the whole page: a 14px radius, a 162deg gradient, an inset top highlight, a deep inset bottom shade and a long drop shadow. On top of that a ::before paints wear - three soft rust-coloured radial patches and a 118deg repeating weave - and a ::after lays down a fractalNoise feTurbulence data URI at overlay blend.
Keep that grain on the plates, not on the viewport. A fixed full-screen noise layer with mix-blend-mode forces the entire page through an extra compositing pass on every animated frame, and on a page with a permanently spinning fan that is the difference between 47fps and 60.
Four screws hold every plate down: a 15px radial-gradient circle with an inset shadow and a ::after slot rotated a different amount per corner, so they do not look stamped.

THE INSTRUMENTS
- A turbine in a recessed circular well. Eleven swept blades generated in a loop, each running hub to rim with a 24 degree twist - narrow and swept, because wide petals read as a flower rather than a fan. Spin it with a CSS animation whose period is a custom property.
- Two rocker switches: an LED that goes green (or red for turbo), a 30x48 body whose highlight slides from top to bottom when thrown, and a small grille beneath. Turbo without power does nothing except blink the power lamp.
- A semicircular arc gauge of 34 radial ticks placed with trigonometry. Ticks light cyan up to the current load and turn ember in the top fifth.
- A card slot, a "warming rays" window with five glowing coil bars whose opacity and glow radius read from the heat property, and a four-cell readout of tokens per second, core temperature, draw and queue.

THE SIMULATION
One number drives everything. Integrate load toward a target per frame - zero when off, about 0.35 idling, about 0.86 in turbo - and derive the fan period, the lit tick count, the coil glow and all four readouts from it.
Write those custom properties on the machine element, never on the document, and only when the value actually changes: setting a custom property on :root every frame invalidates style for the whole page. Quantise the fan period to a tenth of a second too, because re-timing a running animation sixty times a second is worse than not animating at all.
Run the frame loop only while the panel is on screen and stop it once the machine is off and cold. Under prefers-reduced-motion stop the turbine outright - it is the page's one continuous motion - while leaving every switch, gauge and readout working.`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 25, 2026",
    demo: "/demos/kiln-panel.html",
    bestFor: ["on-prem AI hardware","AI infrastructure","self-hosted LLM appliances","live telemetry products"],
    style: ["dark","industrial","skeuomorphic","monospace","amber-accent"],
    thumbnail: "/thumbs/kiln-panel.jpg",
    theme: "dark",
  },
  {
    title: "Model Capture Console",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    sectionOnly: true,
    description: "A VHS case-file shell wrapped around a light inspector: one viewport, tabbed layers, hotspot anatomy, a scrubable trace and a live capture log",
    prompt: `Build a single-file HTML dashboard for "Maverick", a fictional capture console that records a language model run and lets you take it apart afterwards. Not a landing page: there is no hero, no pitch and no marketing section. The whole document is the app. Archivo and JetBrains Mono from Google Fonts, everything else inline. No images at all - every panel, glyph and chart is CSS or inline SVG. Say in a legal line that the product, the model, the capture and every number are invented.

THE APP IS THE DOCUMENT
Topbar, console, status bar, and nothing that scrolls: the page height should equal the viewport height exactly, so check that scrollHeight and innerHeight match rather than assuming.
A dashboard has no page footer, but the legal line and the credit still have to live somewhere - put them in the status bar the way a build stamp would sit there, and keep the line short enough that it is not truncated at a laptop width.
Make the topbar part of the instrument rather than page navigation: its buttons drive the same tablist as the console's own tabs, and its readout ticks.
Give the console section the viewport minus the topbar and let everything inside flex: section, shell, and the grid inside the shell all carry min-height 0, or the grid children refuse to shrink and hand the overflow to the page instead of to the panel. Subtract the topbar's real height: a 60px row with a 1px bottom border is 61, and subtracting 60 leaves the fold one pixel long. Put it in a custom property and use it in both places.
Below about 1000px wide the sidebar stacks on top of the panel and alone is most of a screen, and below about 700px tall there is not enough room for a panel worth reading - at both, drop back to auto height and let the page scroll.

WHAT THE HEIGHT COSTS YOU
A fixed fold exposes every block that simply stops halfway. Overview, timeline and trace left about 290px of dead screen under their last element, and the sidebar left as much under the transport.
Fix it three ways rather than by stretching things that do not want to be tall. Make each page a flex column with min-height 100%, then either grow its main element - the anatomy layer stack and the behaviour meters both look better tall - or drop its last element to the floor with margin-top auto. Pin a manifest of capture metadata to the foot of the sidebar. And dock a capture log along the bottom of the main column that appends a line every time the trace scrubs, so the extra height carries something that actually changes.
Style the dock off the shell's own palette, not the --ink tokens: those belong to the inspector and flip when its light/dark switch does, and the dock is furniture outside it.

THE IDEA: TWO OPPOSITE SHELLS, NESTED
The outside is a dented VHS case file - near-black #06070a with a scanline overlay, a dashed inset outline, a blinking REC timecode in the corner, a taped photo, a skewed tab row and a cassette transport down the side. The inside is the opposite: a calm light inspector at #f1f2f5 built from big 20px-radius cards, round icon buttons and soft borders. The whole page is the joke of putting a clean product UI inside a grubby surveillance rig, and it works because the case file already had a light "paper" panel where the inspector now sits.

THE SHELL
Sidebar: a flex column - a taped capture frame rotated -2deg with a generated scanline portrait inside (layered rounded bars plus scattered dots, no photograph), a REC label, a 40px 900-weight wordmark with a skewed gradient underline, and a transport - previous, play, next, a progress track, a step counter and a temperature slider that actually feeds the decoder panel.
Tabs: five skewed(-8deg) buttons that grow from 40px to 52px when selected, with the label counter-skewed so the text stays straight. Wire them as a real tablist with arrow-key support, and glitch the panel briefly on every change.

THE INSPECTOR, FIVE TABS
1. Overview - a rail of five component cards, a "captured spans" strip in the case-file style (rotated dark tiles with sparklines, glowing when current), and four stat cells.
2. Anatomy - a vertical SVG stack of the model's layers with a hotspot point on each one that pulses, grows on hover and opens that layer in a detail card beside it. Position the points in percentages of a wrapper that overlays the svg: this tab starts hidden, and a hidden element measures zero width, which puts every point in the same place.
3. Timeline - paged checkpoint cards with a pill of dots underneath, the active dot lit.
4. Behaviour - a dark "eval scan" monitor of animated meters inside the light panel, two taped notes beside it and a FLAGGED stamp rotated into the corner.
5. Trace - six step cards, current one lit, driven by the transport or clicked directly.
Add a round moon button that flips the inspector between light and dark by redefining five custom properties on the console - the shell stays dark either way. Give the console element its own id: reusing the section's anchor id means the toggle writes to the wrong element and nothing changes.

THE REST
A centred hero, a three-card "why a console" section, a CTA and a footer. Under prefers-reduced-motion drop every animation and transition but keep all the layout and all the interaction.
NO BRAND CHROME
This is a screen from inside a product, not a page selling one. Whoever is looking has already signed up, so the bar across the top carries the view they are in, the live status and the session or unit they are looking at — and no wordmark, no logotype and no marketing nav. A mark up there is the single thing that drags the whole screen back into looking like a landing page. Tabs that switch views stay, because those are the product; links to Pricing and Features do not, because there is no longer anything to sell. The one place the fictional name still belongs is the legal line in the status bar.
`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 25, 2026",
    demo: "/demos/maverick-console.html",
    bestFor: ["LLM observability","model interpretability tools","AI eval dashboards","agent run inspectors"],
    style: ["dark","vhs","scanlines","monospace","one-viewport"],
    thumbnail: "/thumbs/maverick-console.jpg",
    theme: "dark",
    credits: [
      {
        label: "VHS case-file layout by mahri",
        href: "https://codepen.io/mahricodes",
        note: "The dark shell, the skewed tabs, the taped photo and the sidebar transport are adapted from this pen",
      },
    ],
  },
  {
    title: "Driving Cluster Dashboard",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    sectionOnly: true,
    description: "A live instrument cluster filling one viewport: hold to accelerate, switch drive modes, and watch the route beside it",
    prompt: `Build a single-file HTML dashboard for "Meridian", a fictional instrument layer that sits between an autonomy stack and the person in the seat. Not a landing page: no hero, no pitch, no marketing sections. The whole document is the cluster.

THE APP IS THE DOCUMENT
Topbar, cluster, status bar, and nothing that scrolls - page height should equal viewport height exactly, so assert it rather than assuming it.
Two columns inside the shell: the instruments on the left, the route map filling the right. Make the instrument column a flex column with the readout strip pushed to the floor by margin-top:auto, and cap the dial against the viewport (min(430px, 88vw, 42vh)) so it gives up height to the readouts instead of pushing them off the bottom. The shell clips its overflow, so anything that does not fit is not merely ugly, it is invisible.
Below about 1100px the columns stack and are taller than any phone; there, stop being one screen and let the page scroll.
A dashboard has no page footer, so the legal line goes in the status bar. The topbar is part of the instrument too: it reads the live drive mode and range off the same simulation the dials use. Chakra Petch and JetBrains Mono from Google Fonts, everything else inline. No images and no libraries - every gauge, glyph and street is CSS or inline SVG. Say in a legal line that the company, the vehicle, the route and every reading are invented.

THE DESIGN SYSTEM
Near-black #06080c with #0a0e15 and #0d1219 panels, hairlines at rgba(34,224,240,0.14), cyan #22e0f0, text #dff7fa, muted #6c8994. Two page-level layers and nothing else: a 1px-in-3px scanline at about 3% opacity, and a radial vignette. Every chromatic thing on the page reads from one --accent property.

THE DIAL (build this once, use it eleven times)
A ticked bezel from a single repeating-conic-gradient - a tick every 5 degrees - masked to a thin ring with a radial-gradient, plus a second finer ring inside it at a different period. Four cardinal marks break the ring: dashes north and south, dots east and west.
Build each cardinal as a spoke that spans the full diameter and rotates about its own middle, with the mark as a pseudo-element pinned near the top. Do not position them with a percentage translate: a percentage resolves against each element's own size, so a 6px dot and a 47px dash end up at different radii.
Inside sits a line-art glyph on a 72x72 viewBox with 2.4 stroke and round caps: battery, sensor rings, a bolt, terrain, cloud with rain, sun, clock, folded map, a leaf for Eco, a gauge for Sport, a car with a roof sensor for Autonomous. Under it, a mono label at 0.34em tracking.

THE CLUSTER
1. A speedometer: the same dial at 430px with a 0-240 scale that starts at -126 degrees and sweeps 252. Position the major ticks and numbers with trigonometry, draw the live arc as an SVG path rebuilt each frame, and put a wedge needle on a single rotate. A three-digit readout with leading zeros in the middle, a gear letter below.
2. An accelerator pill you press and hold - pointer and keyboard both, with a real hold rather than a click. Chevrons either side animate while it is down.
3. Three drive modes as a radiogroup with arrow-key support, each a small version of the dial: Eco green and lazy, Autonomous cyan and self-driving, Sport red and urgent. Each sets --accent plus a redline, a pull rate, a drag coefficient and a regen figure.
4. A four-cell readout strip - battery, power draw, range, autonomy confidence - each with a thin bar.
Integrate speed per frame toward a target rather than tweening it, so the needle has weight: it leans into acceleration and coasts back. Battery drains with draw and recovers slightly while coasting; range and confidence fall out of the same number, and confidence drops faster in Sport.

THE HOVER BLOOM
Adapt the Uiverse button by zjssun into the page's own colour: on hover and focus, a four-stop box-shadow blooming out to 100px in --accent, the border going to --accent, and a white text-shadow. Put it on the instrument cards, the drive-mode buttons, the accelerator and the call to action, so the whole page lights up in whatever colour the current mode is.
Two adjustments matter. On a 280px card do not take the original's solid background fill - the glyph strokes are the accent colour and would disappear into it, so use a 13% tint instead. And the three white text-shadow stops only read as neon above about 15px: on letter-spaced mono labels the white fills the gaps between characters and turns into a white box, so keep those labels white in the face and bloom them purely in the accent.

THE REST
A generated city map: a seeded hash lays out about 24 verticals and 11 horizontals with drift, an arterial every third or fourth, a couple of diagonals, some short block-interior stubs, a polyline route with a flowing dashed overlay, and boxed points of interest. Put the vehicle marker on the route, not near it. A conic-gradient sweep rotates over the top.
Then an instrument gallery of eight dials, a three-card section explaining the bezel, the needle and the mode, and a closing note that none of it is real.
Run the frame loop only while the cluster is on screen, and stop it once the vehicle is stationary. Under prefers-reduced-motion drop every animation and let the cluster sit in standby until the visitor presses something themselves - it should never wander on its own.
NO BRAND CHROME
This is a screen from inside a product, not a page selling one. Whoever is looking has already signed up, so the bar across the top carries the view they are in, the live status and the session or unit they are looking at — and no wordmark, no logotype and no marketing nav. A mark up there is the single thing that drags the whole screen back into looking like a landing page. Tabs that switch views stay, because those are the product; links to Pricing and Features do not, because there is no longer anything to sell. The one place the fictional name still belongs is the legal line in the status bar.
`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 25, 2026",
    demo: "/demos/drive-cluster.html",
    bestFor: ["autonomous vehicle HUDs","EV telemetry dashboards","real-time instrument UIs","simulation control panels"],
    style: ["dark","hud","neon-cyan","monospace","one-viewport"],
    thumbnail: "/thumbs/drive-cluster.jpg",
    theme: "dark",
  },
  {
    title: "Neon Glass App Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Frosted panels lit by a comet that races their border, and a chat bar that opens into a breathing voice orb",
    prompt: `Build a single-file HTML landing page for "Arcline", a fictional platform that connects a company's tools and answers questions from its own data. Dark, blue-black and glassy. Everything inline - no CDN, no webfont, no image file, not one network request - and say in the footer that the company and every figure are invented.

THE GROUND
Near-black with blue in it rather than grey: --gray900 hsl(226 45% 3.5%) up to --gray50 hsl(214 45% 97%), on a hue ramp that warms slightly as it lightens (226 down to 214), so the neutrals never read as flat charcoal. One accent family: --blue hsl(218 95% 56%) with a lighter --blue-hi and a --blue-tint at 12% alpha for chips. Wash the page with two enormous off-centre radial gradients pinned behind everything at z-index -2 - one blue at 88% 12%, one cyan at 8% 78% - because a backdrop-filter has nothing to catch on flat colour. That wash is what makes the glass read as glass.
Set every panel's own background as three stacked gradients: a hue1 wash from the top-left corner, a hue2 wash from the bottom-right, and a near-opaque dark base underneath. Two corners lit in different hues is the whole trick; one flat tint looks like a grey box.

THE EDGE LIGHT - four layers, and they have to be separate elements
Each panel carries nine absolutely positioned spans, and they are not decoration you can collapse into pseudo-elements: a sheen, a sweep, a sweep bloom, two shines and four glows. They stack because each does one thing the others cannot.
- shine: a conic-gradient clipped to a 1px border box by the mask-composite trick - mask: linear-gradient(transparent), linear-gradient(black) with mask-clip: padding-box, border-box and mask-composite: subtract. That subtract is what leaves only the border ring. Give it border-top-right-radius: inherit and border-bottom-left-radius: inherit and place one at the top-right and one at the bottom-left, so each lights one corner of the panel rather than ringing the whole thing.
- glow: the same conic ring at 22px of border width, blurred 12px, in mix-blend-mode: plus-lighter, masked by an inline SVG feTurbulence so the bleed is grainy rather than a clean halo. Plus-lighter is the one that adds light; screen and lighten both go milky over a dark panel.
- glow-bright: a sharper 5px ring hugging the shine, blur 2px, no noise mask.
- sweep: one comet of light that races around the border. Register --sweep with @property as an <angle> with an initial value, or the conic-gradient will not interpolate and you get a jump cut instead of motion. Animate it -60deg to 300deg over about 1.7s, with a 6px blurred copy behind it in plus-lighter.
- sheen: a single diagonal glint travelling across the face, background-size 260% and background-position going 130% to -30%.
Order the arrival: the sweep runs first, then the corner lights ignite as it passes them - hold the shine and glow animations back by a --corner-lead of 0.65s on top of the panel's own --fx-base delay. Give each of the nine a slightly different --fx-d so they do not all snap on together.

THE HERO INPUT
A chat bar that rearranges itself. Three states driven by CSS alone:
- Idle: four attachment icons sit to the left of the field, and the field is indented past them with margin-inline-start on a --gap-closed of 7.75rem.
- Typing: :focus and :valid pull the field left to --gap-open, blur the icons away, slide in a round plus button, and swap the microphone for a send button. Use :valid with a required input - that is what makes "has text" a CSS state rather than a JS one. Put the transition on a cubic-bezier(0.175, 0.885, 0.32, 1.05) so it overshoots.
- Voice: a hidden checkbox expands the microphone button into a 19rem panel and reveals an orb. The orb is four radial-gradient circles orbiting inside an overflow-hidden core on different durations (4.8s to 6s, deliberately coprime so the pattern does not repeat), a backdrop-blurred glass cap over the top, and two conic rings rotating in 3D under perspective. Two more blurred rings pulse outward from the centre on a 1.5s loop. The "listening" label gets a moving gradient text clip.

THE PAGE
Sticky header, a hero with three entering widgets, then blocks: features, a three-step how-it-works, stats, a developer section with a fake code window, pricing with a monthly/yearly switch, an FAQ built from native details/summary, and a closing CTA. Reveal each on scroll with an IntersectionObserver that disconnects after firing once, and drive the panel's light show off the same is-visible class.
The three step cards each get their own inline-SVG illustration, animated with SMIL and CSS: dotted flow lines with animateMotion dots running along them, a document being scanned into a point cloud, and an agent run log with a spinner and a progress bar that grows on reveal. Draw the point cloud from a seeded PRNG rather than Math.random so the layout is the same on every load.

TWO THINGS THAT WILL BITE
Set text-transform: lowercase on html, body, inputs and svg text to match the wordmark - then exempt the code block and its title, or the sample turns into unreadable all-lowercase JavaScript.
Every animation in the edge-light system and the orb needs a prefers-reduced-motion branch. Do not just stop them: the sweep and sheen must be display: none and the corner lights must be set to opacity 1, or a reduced-motion visitor gets panels with no edges at all.`,
    preview: "hero",
    variant: "large",
    added: "Sep 29, 2026",
    demo: "/demos/arcline-neon-glass.html",
    bestFor: ["AI platform launches","enterprise knowledge assistants","agent automation SaaS","developer APIs","AI chat apps"],
    style: ["dark","glassmorphism","neon","blue","lowercase","react-bundle"],
    credits: [
      {
        label: "Neon Glass Context Menu by Simey",
        href: "https://codepen.io/",
        note: "The shine/glow edge-light technique the panels are built from, retuned to this palette",
      },
      {
        label: "Chat input by Cobp on Uiverse.io",
        href: "https://uiverse.io/",
        note: "The hero's expanding chat bar and its voice-panel state",
      },
    ],
    thumbnail: "/thumbs/arcline-neon-glass.jpg",
    theme: "dark",
  },
  {
    title: "Grain Motion System Page",
    category: "web",
    categoryLabel: "WEB",
    description: "An autumn lake painted in pure CSS, die-cut sticker type, and a live agent run that stops for a human checkpoint",
    prompt: `Build a single-file HTML landing page for "Grain", a fictional motion and surface system sold as plain CSS. Two halves have to agree with each other: a micro-transition token set (four easing curves, five durations) and a grainy radial gradient that is the only artwork on the page — and the gradient's middle stop is also the accent colour, so switching colourway re-themes every component in the same frame. Space Grotesk, Inter and JetBrains Mono from Google Fonts, everything else inline, no image files, no libraries. Say in the footer that the product and every number are invented.

THE MOTION HALF — nine numbers, and nothing outside them
- Curves: enter cubic-bezier(0, 0, 0.2, 1), exit (0.4, 0, 1, 1), standard (0.4, 0, 0.2, 1), spring (0.34, 1.56, 0.64, 1).
- Durations: micro 80ms, fast 120ms, standard 200ms, moderate 280ms, slow 400ms.
- Compose shorthands from those two tables (--t-color, --t-lift, --t-enter, --t-exit) and build every component from the shorthands. Nothing on the page may animate with a number that is not in the table.
- The rules that make it feel deliberate: cards lift 1-3px on the spring curve, everything that gets pressed snaps at a hard 60ms, focus rings never move anything, and a tooltip waits 400ms to appear and leaves instantly — set transition-delay on :hover and zero it on :not(:hover) or it hangs around.

THE BUTTON
Adapt the Uiverse button by ryota1231 rather than inventing one, and keep its whole choreography: a 100px pill that squares off to a 12px radius on hover, a 2px ring that expands to 10px of nothing, a small dot in the middle that grows into a full-bleed fill, and the label sliding sideways while one arrow leaves to the right and a second arrives from the left. Press scales it to 0.96.

Re-express the timing in the system's own table — the original runs 0.6s and 0.8s of cubic-bezier(0.23, 1, 0.32, 1), and a page whose headline is "fewer curves" cannot quietly adopt a fifth one. The radius morph, the label slide and the arrow travel are --d-slow on --ease-enter, the fill is --d-moderate, colour is --d-fast, and the press stays at 60ms. It reads the same and the table still has nine numbers in it.

Build it with no markup beyond a label span: the dot is .btn::before with isolation: isolate on the button and z-index: -1 on the dot, which puts it above the button's own background and below its label; the two arrows are the label's ::before and ::after, masked from one inline-SVG data URI so they take currentColor. Each variant owns a --fill (the accent for primary and danger, accent at 8% for secondary, surface-2 for ghost), so the colourway drives the button too. The 36px icon button runs the same choreography as a circle that squares off. Buttons that already carry an inline icon skip the arrows and keep everything else.

THE SURFACE HALF — the grain
An feTurbulence turbulence at baseFrequency 0.9, two octaves, feeding an feDisplacementMap at scale 30 over a radial-gradient(circle at 50% 100%, c1 20%, c2 40% 50%, c3 55%). Three things it needs:
- Draw the filtered layer at 110% and pull it back -5%: the default filter region clips at +10% and the displacement drags pixels past the element's edge, leaving bald corners otherwise.
- Animate the turbulence seed with SMIL — values="1;2;3;4" dur="0.8s" calcMode="discrete" — so it flickers like film. Animate it smoothly and it turns into a lava lamp.
- Ship a second, quieter filter at scale 11 for anything small. A 26px chip run through scale 30 dissolves into confetti.
Put the grain on a ::before so the host can still hold text: the hero panel, the nav mark, the section dots, the card thumbnails, the modal icon and the colourway swatches are all the same class.

HOW THE TWO HALVES MEET
Define a colourway as three gradient stops plus the accent they imply, on [data-way="..."] at the root, and derive --accent-soft/-mid/-glow with color-mix. Four ways: rose #c24a6d, amber #a96a1e, cyan #256f7c, violet #5c48b8. A swatch row sets one attribute on <html>; because every tint on the page is a mix of that one variable, the toggles, focus rings, badges, danger button, easing balls, section labels and the hero gradient all re-tint together. That single wire is the whole reason the page reads as one system rather than two references bolted together.

THE PALETTE AROUND IT
Warm paper: #f5f3ef ground, #fdfcf9 surface, #eeece7 and #e6e3dc for recessed, #dedad2 borders, #0d0d1a brand ink. Shadows are brown-tinted — rgba(90,55,20,.07) through .14 — because neutral grey shadows on a warm ground read as dirt. Space Grotesk for display (300 for the light half of a headline, 600-700 for the strong half), Inter for UI, JetBrains Mono for values.



FRACTURE
Every module reads as a plate that has been broken out of its frame: two or three jagged chunks snapped from its corners, dark and dead at rest. Put a pointer on one and the torn edges light amber along the break and the module's rim lights with them. Press it and the pieces fly home and vanish and the plate seals - rim lit, face warmed from the top. Amber throughout: the panel already has exactly one colour and this is not the place to introduce a second.
Break the plate at its OWN corners, clipped to itself. The version of this that floats shards outward into the space around the button works because a demo canvas is empty; a panel is not. Thrown outward they land on the headline and on the bay next door. Cropping each piece against the corner it came from is also what sells it - a shard cut off by the module's edge reads as snapped from it, where a whole pebble sitting on the face reads as debris dropped on top. Corners are the only region of these modules reliably free of content, since the bays centre their instrument and the cards run copy down the middle.
Scale the pieces to the module rather than picking a pixel size, or a 20px chip beside a 590px bay just looks like litter. Seven to nine vertices at 0.66-1 of the radius: more points or a wider jitter and the polygon comes out a spiky star that reads as a leaf instead of a chunk.
Generate them so no two modules break the same way, and so the page keeps plain plates if the script never runs - a module that is merely uncracked still looks like a module. Give each piece the vector back to its module's centre in a custom property and let the press state use it.

TYPE-ON
Headings and copy print themselves when they reach the viewport, a few glitch characters flickering through each letter before it settles. Two things make the difference between this reading as a machine printing its own labels and as a broken page.
Split IN PLACE. The usual version of this effect reads textContent and rebuilds the element from a flat string, which throws away every inline tag it contained - on this page that is the em carrying the one piece of colour in the headline. Walk the text nodes and wrap each character instead and the tree survives intact. Normalise whitespace while you are in there, or the newlines and indentation of your own source each take a typing tick and the line appears to stall.
Reveal with opacity, never display, so the block occupies its finished size from the first frame and nothing below it moves while the line runs. That also means the full sentence is in the accessibility tree the whole time, so there is no need for the hidden duplicate this effect usually ships with.
Keep it away from anything the page rewrites. Live readouts are replaced every frame; split one and its spans are gone on the next tick. Body copy also needs its own speed - 140 characters at a heading's pace is five seconds of somebody waiting to read a paragraph.
Give the panel real space above the first heading and below the last readout. The block padding is the only thing holding the headline off the top edge and the readings off the bottom one.

SECTIONS
Sticky blurred nav; a hero with the headline split light/bold, an install line with a copy button, and the grain panel carrying the caption in the accent with a real component card floating over its corner; 01 the colourway switch with three explainer cards; 02 the tokens, with four easing balls running the four curves against the same clock and a five-row duration scale that lights on hover; 03 a component bench with tabs for Buttons, Inputs and Overlays — every control live, each panel footed by a mono line naming the exact durations it just used; 04 three interactive-state cards; 05 three pricing tiers; 06 a FAQ built from native details/summary; a closer and a footer.

WHAT WILL BREAK
- A .nav-burger { display:none } declared before .btn { display:inline-flex } loses on source order, not specificity — the burger shows at every width. Scope it to .nav .nav-burger.
- White text on the grain only works over the saturated middle band. The top is pale and the bottom is cream, so put the caption in the accent instead of fighting it, and keep any white line inside the band.
- prefers-reduced-motion collapses every transition to 0.01ms, but CSS cannot reach a SMIL animation inside a filter. Call pauseAnimations() on the defs svg from script: the texture stays, the flicker stops.

RESPONSIVE AND A11Y FLOOR
Hero goes one column at 900px, the grids collapse 4-2-1, the nav links become a burger at 880px. No horizontal scroll at 390 or 1512. Every control is a real button with a focus ring, the dropdown and modal both close on escape and on outside click, the modal returns focus to the button that opened it, and the tab strip carries role="tablist" with aria-selected.

THE SECOND GRAIN — dither
The hero's grain and this one are opposites and the page should show both. The hero is continuous tone warped by a displacement map. Dither is a hard ordered break-up: a fill that holds solid and then falls apart into loose pixels at its edge.
Two mask layers make it. One is a small tiled PNG of random alpha, the other a radial gradient. Mask layers composite with add by default, and that default IS the effect rather than something to correct - where the gradient is opaque it wins and the colour stays solid, and only through the gradient's soft band does the noise get a say and scatter the edge. Force the layers to intersect and the whole shape dissolves at once, which is a different look. Set image-rendering to pixelated or the browser smooths the tile back into a gradient and there is nothing left to see.
Make the swept layer four times the element's width with the gradient repeating every half, then the hover animation can travel exactly one tile and the loop has no seam. A second layer on the same element, its gradient starting where the first finished and its mask cut further down, gives two colours meeting in a band of mixed pixels instead of on a line; the element's own background is the third colour.
Two places for it, doing two different jobs. On the cards under the hero, drive it from the accent so the colourway switcher still re-tints them - the section's whole argument is that one decision moves everything, and a card that ignores the switch contradicts the copy beside it. On the swatch walls, keep the source palette whole and fixed, because a wall re-tinted to match the page proves nothing about carrying multiple colours.
Lay the walls out on a grid, not wrapping flex. The captions are wider than the shapes and of different lengths, so a flex row breaks after five and strands the sixth on a line of its own.
`,
    preview: "buttons",
    variant: "large",
    added: "Sep 24, 2026",
    demo: "/demos/grain-motion-system.html",
    bestFor: ["AI agent runtimes","developer tools","workflow automation","human-in-the-loop AI"],
    style: ["light","illustrated","css-art","sticker","playful","grain"],
    thumbnail: "/thumbs/grain-motion-system.jpg",
    theme: "light",
    credits: [
      {
        label: "Animated Button — Uiverse",
        href: "https://uiverse.io/",
        note: "The morphing pill the button set is adapted from, by ryota1231",
      },
    ],
  },
  {
    title: "Icon-Cut Card Stack Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Glass cards with their icon punched clean through, on gradient throughlines that travel as you scroll",
    prompt: `Build a single-file HTML landing page for "Throughline", a fictional AI delivery platform that routes between models, grounds them in your corpus, gates releases on evals and ships behind a canary. A shader fans glowing threads behind the hero; as you scroll they converge into a line that carries on down the page, past a stack of glass cards whose icons are cut clean through them. GSAP 3.12.5 and ScrollTrigger from cdnjs, Source Code Pro from Google Fonts, raw WebGL2 for the shader, everything else inline, no image files anywhere. Say in the footer that the product and every number on the page are invented.

THE DESIGN SYSTEM — one spectrum, three appearances
- Two surfaces only: #131417 and white at low alpha (.09 hairlines, .16 borders, .4 and .64 text). #0e0f12 for anything recessed.
- One colour: a four-stop spectrum, linear-gradient(-45deg, #912acd 20%, #e6b71d, #16a242, #03b0ea 70%). It appears exactly three ways — clipped to text, as the SVG stroke on the throughlines, and as a 1.5px ring around a card — and nowhere else. Discipline is the whole look.
- Clipped text needs filter: brightness(2) over #131417 or the middle stops go muddy.
- Source Code Pro for everything, 15px/1.65 body. A landing page set entirely in mono reads as a page for people who live in a terminal, which is the point.

THE CARDS — the icon is a hole, not a picture
Five cards, each exactly 300x450 with a 20px radius, stacked down a 740px rig with alternating horizontal offsets above 640px.
- Behind each card: a frosted plate (rgba(0,0,0,.28) + backdrop-filter: blur(8px)) and a spectrum ring. Draw the ring as an inline-SVG data URI: a rounded rect path followed by its own 1.5px-inset copy with fill-rule="evenodd", filled with a linearGradient. That is a gradient border with no extra element.
- The card fill is black at the corners, not grey. A grey radial (the obvious choice) turns every card into a grey plate on a black page; black makes it a well, and the spectrum ring plus the frosted backdrop are all the separation it needs. Same rule as the slab below.
- Behind all five, one tilted slab on a sticky wrapper. Make it DARKER than the page, never lighter: a pale panel at low opacity does not read as a plane behind the cards, it reads as a patch of grey background, and it is the first thing anyone points at. A deeper black still catches its own edges and the page stays black. It is also 150vh tall sticking to the bottom of its rig, so it slides a screen and a half past the stack and lays itself across the section below — clip the stack section with overflow: clip, never overflow: hidden, which makes the section a scroll container and kills the sticky outright.
- The card itself is masked so its glyph is a hole cut through to whatever is behind it. Build that mask as ONE data URI containing a <mask> — a white 300x450 rect with the glyph painted black over it, applied to a second white rect — rather than as two mask layers with mask-composite: subtract. Self-contained subtraction needs nothing but plain mask-image support, so it works in every engine that can mask at all.
- A second data URI holds the same glyph stroked at 7px and not filled; use it to mask a ::before painted with the spectrum. Everything inside the hole is gone, so what survives is a hairline of colour tracing the cut edge.
- Author the glyphs in the card's own 300x450 coordinate space, in the lower third: a ring with a dot at its centre, a terminal window with a chevron and an underscore left solid inside the hole, three stacked discs, three bars, an arrow. Keep them chunky — a thin glyph reads as a scratch rather than a cut.

THE THROUGHLINES — one line material for the whole page
Four serpentine paths down a 740x3600 SVG, each a sine wave sampled at 36 points and smoothed into cubics (Catmull-Rom to Bezier), with different amplitudes and phases. Stroke them with the spectrum gradient, round caps, 20-40px wide, and give each a dasharray that is mostly one enormous gap — "20 50 120 50 20 50 300 50 20 50 150 50 20 20000" — so each line shows a short caravan of dots and dashes travelling its whole length instead of a repeating dotted line. Do not blur the SVG: a filter on the group re-rasterises a 740x3600 layer on every frame, and the dash offset already changes every frame, so it costs 21fps on the hero and 8 over the stack for a 1px softening on a 20-40px stroke.

Position it against the DOCUMENT, not inside the card stack: it starts at the top of the page and runs past the last card, so one run of line serves the hero and the stack both. z-index 1 puts it above the slab and below the cards and the hero copy.

It has two motions, and they are ADDED rather than switched between:
- idle: a constant ~28px/second drift plus a sway and a small tilt, so while you are sitting on the hero the marks visibly circle it under their own power.
- scroll: the big travel, about 3400 dash-pixels over the combined height of hero and stack.
Because the scroll term starts at zero and the idle term never stops, the handover at the bottom of the hero has nothing to jump: you just start adding to a line that was already moving. Switch between the two sources instead and the dash pattern snaps the moment you cross over. Damp the sway by the hero's own scroll progress so the line orbits the headline and then settles into a rail for the cards, and ramp the whole thing from 45% to 100% opacity across the same range.

THE POSTER
The hero is a poster, not a paragraph: three stacked display lines in a heavy condensed face, uppercase, leading under 0.9, sized so the longest line sets the measure and the block runs almost the full width. A lime blob sits under the middle line and bleeds off the left edge. The support sentence tucks into the gap the short first line leaves beside it, and drops below the block once there is no gap left. The button is extruded rather than blurred - a hard offset shadow that shortens on hover and collapses on press.
Set it on its own navy panel that falls to the page's black at the foot, so the poster reads as one object and the rest of the page carries on dark.
Check for a stale centred rule further down the sheet before wondering why a left-aligned hero keeps centring itself.

THE BLOB
The green is the hero's ground, not an ornament beside the type: one blob filling the whole panel, sliced rather than fitted so it bleeds past every edge, with the poster sitting on top of it. It is not a border-radius shape, it is circles run through a gooey filter: a Gaussian blur followed by a hard alpha contrast (feColorMatrix, alpha row 20 and -9). Anywhere two circles overlap comes back above the threshold and welds, so the cluster reads as one liquid mass with necks and bulges you cannot author out of four border-radius percentages. Set color-interpolation-filters to sRGB or the default linearRGB washes the greens to a pale mint. Give every circle the same gradient with gradientUnits="userSpaceOnUse" and one continuous ramp runs across the whole mass instead of restarting inside each circle.
Hover the headline and the droplets burst out and evaporate, and the core draws in behind them, so the blob comes apart and shrinks to a bead rather than simply fading. Four things decide whether that reads at all.
The core has to be a COMPLETE blob, authored in the markup — the droplets are generated, so with no JS or under reduced motion a skimpy core leaves a bead hiding behind a letterform.
Use the individual translate and scale properties rather than one transform, because they need different clocks: collapse a droplet while it is still travelling and the goo threshold eats it before it clears the mass, so you see a ripple and never a break-up. Fly out hard, hold full size while they cross the gap, then shrink. Per-droplet stagger goes in a custom property the transition reads, because an inline transition-delay flattens both halves back onto one clock.
Budget the filter before you scale it. Gooeyness is relative, so a blob that fills the hero wants a blur proportional to it - and a 45px blur over a 1512x874 surface measured 24fps in-run against 53 with the blob hidden. Droplet count turned out to matter more than blur: at the same radius, halving the droplets bought 7fps and below that the curve flattens. Fewer, larger droplets and a smaller blur put it back at the page's own idle. will-change and contain bought nothing - the cost is the raster, not the layer. Over a light-on-dark poster the mass also has to come down to about a third opacity or it eats the headline.
Aim the spray at whatever is actually empty. When the blob was a small shape behind the headline a radial burst sent half the droplets where the type covered them, and the answer was to aim the spray at the one open column; a blob that fills the panel has open ground on every side and comes apart evenly. And widen the filter region hard (x/y -110%, 320% square) or the beads are guillotined mid-flight at the default -10%/120%.
Trigger on the headline with :has(), not on the whole poster. The poster's box is most of the hero, so :hover there meant the blob was dissolved for as long as anyone was reading it. The blob is the headline's previous sibling, which is why the parent needs :has(). Give the CTA and meta rows position and a z-index too, or the droplets — positioned, z-index 1, in a parent that is not a stacking context — paint over the buttons.

THE WATERLINE
The poster does not end on a straight edge. Four bands of procedural wave roll across the foot of the hero and hand the page over to the sections below it, and each band carries one stop of the throughline's own gradient on its crest - violet, amber, green, cyan, back to front - so the wires that start under the hero are announced by the water above them.
Build the geometry in script, not by hand. Each band is a sum of sines whose cycle counts are whole numbers across one tile width, so the function repeats exactly: sample it over two tiles, scroll the group exactly one tile on a linear loop, and the seam is not merely hidden, it does not exist. Randomise each component's amplitude and phase per load and no two crests are ever stamped from the same shape. Give the bands different durations and alternate their direction and the stack reads as depth. Prove the periodicity by measuring the crest path with getPointAtLength at 0, half and full length - the three y values must be identical, not close.
Two things decide whether it looks like water or like four stray lines. First, the fill gradients: a body path runs from its own crest down to the bottom of the box, so an objectBoundingBox gradient is already most of the way to black before the wave even starts. Use userSpaceOnUse and key each one to where its crest actually sits, each starting a step darker than the band above it. Second, do not let the water reach the page colour until the last band - that one is flat page black, and it is the only thing allowed to be, because it is the handover.
Reverse the hero's own fall of colour to meet it: the ground gets lighter as it nears the water, and its last stop has to equal the top band's first stop exactly or a seam shows along the highest crest. Non-scaling strokes on the crests, or squashing the viewBox to the band height thins them out. The band is absolutely positioned, so add its height to the hero's bottom padding or it sits on the meta row.

THE LINE STARTS WHERE THE POSTER ENDS
Do not put a separate effect behind the copy. A shader fan in the hero and an SVG stroke below it are two different materials, and no amount of cross-fading hides the swap at the fold — you can see one thing stop and another start.
The throughline belongs to the sections under the poster, so measure its birth off the hero's bottom edge rather than off anything inside it - a real boundary, not a guess. Clear it by more than the mask's fade distance, or the first wires light up inside the poster.
Below that, the four paths gather toward the centre of the stack and splay apart as they run down, both terms unwinding to zero so every line ends up on the geometry it was authored with. Add a float on its own period and a lean toward the pointer, scaled the same way.
Find each path's crossing by binary-searching getPointAtLength on the referenced path — a <use> cannot be measured, so ask the <path> it points at — and re-measure whenever layout moves, because the headline shifts when the webfont lands. Under reduced motion there is no rig to refresh, so hook the font promise and resize directly or the birth point is stale.
Then reveal it with a mask rather than an opacity: nothing exists above the birth, the reveal starts inside the letterforms so the line shows through the counters of the last word, and a tip travels down the page as you scroll with a soft trailing edge for the head of the line. That is the whole trick — the line is not fading in, it is being pulled out of the text.
Vary the gauge with it too: about a fifth of the authored stroke-width on the hero, thickening to full as the fan converges, so the wires read as wires up top and as the throughline below. Write stroke-width only when it actually changes — it re-rasterises the SVG, and the idle float must stay transform-only or the hero re-rasters sixty times a second. Do not drive it from a scrubbed scroll handler either: that handler never fires at progress 0, so a page loaded at the top keeps whatever the pre-rig fallback last set.
Track the pointer on the hero section rather than on the line, because the headline sits on top and the line takes no events.

Over the hero it must frame the copy, not cross it. Give the snake a top fade under the nav and a nested child with a radial-gradient mask that is transparent in the middle — a hole the headline sits in. Two masks on two nested elements, not two layers and mask-composite: one mask per element is portable, compositing two of them is not.

THE SLAB
A 3D plate behind everything: rotateY(20deg), 150vh tall, a dark gradient at 25-30% opacity with an inset darker panel inside it. Make it position: sticky inside the stack section rather than position: fixed — fixed leaks into every other section of the page and you end up toggling its opacity from JS. Drift it vertically with a second custom property at roughly 40% of the scroll rate. Pause the whole rig with an IntersectionObserver when the snake scrolls off, and skip it while document.hidden.

WHAT WILL BREAK, IN THE ORDER YOU WILL HIT IT
1. Per-character opacity does nothing inside a background-clip: text parent. The gradient is painted by the PARENT and clipped to the union of its descendants' glyphs, so a character at opacity 0 still cuts its own shape out of that paint and stays fully visible — screenshot the same frame twice and they come back byte-identical. Fix: after splitting, give every character its own copy of the gradient with background-size set to the whole block and background-position set to minus the character's offset within it. The slices line up into one continuous spectrum, opacity starts working, and the parent's background is switched off once it has run. Repaint on resize and after document.fonts.ready, since the offsets are measured.
2. Never set scroll-behavior: smooth on html with ScrollTrigger. They fight over the scroll position and every scrubbed value stops matching the page. Let in-page links call scrollIntoView({ behavior: "smooth" }) themselves.
3. Do not put the page's own script behind the CDN tags. A slow request left the copy unsplit and the nav dead for as long as it took. Run your script first, load GSAP with defer after it, and wire the rig on window load only if window.gsap exists — the page must be readable and clickable when the CDN never answers at all.
4. A card already on screen at load never crosses its trigger, so reveal whatever is in view outright and re-check on ScrollTrigger refresh.

SECTIONS
Sticky blurred nav with the wordmark, four links, a burger under 880px and a spectrum CTA; the poster hero closed by the wave band; the card stack; four stage cards reusing the same glyphs as ordinary inline SVG; a four-cell numbers strip; three pricing tiers where the recommended one is the only element on the page with a spectrum border; a five-row FAQ built from native details/summary with the marker swapped for a + that becomes a minus; a closer; and a footer with the fiction disclaimer.

RESPONSIVE AND A11Y FLOOR
Under 640px the snake and the slab are hidden and the cards centre in one column — the rig is decoration and it is not worth a horizontal scrollbar. Stage cards go 4 to 2 to 1, tiers stack at 900px. No horizontal page scroll at 390 or 1512. Focus rings in cyan. Under prefers-reduced-motion nothing scrubs: every character is already on, the marks sit parked part-way along their lines so the stack still reads as a diagram, and the slab does not drift.`,
    preview: "cards",
    variant: "large",
    added: "Sep 23, 2026",
    demo: "/demos/throughline-scroll-stack.html",
    bestFor: ["AI infrastructure","LLM ops and eval platforms","developer tools","model gateways"],
    style: ["dark","monospace","spectrum-gradient","scroll-driven","poster"],
    thumbnail: "/thumbs/throughline-scroll-stack.jpg",
    theme: "dark",
  },
  {
    title: "Agent Run Transcript Page",
    category: "web",
    categoryLabel: "WEB",
    description: "One agent run wound onto tape — scrub the playhead and watch the context, the spend and the clock move with it",
    prompt: `Build a single-file HTML landing page for "Spool", a fictional trace recorder that keeps every step an AI agent took so the run can be played back afterwards. Its centrepiece is a tape deck — one recorded run, twenty-four steps, with a transport, a scrubbable tape and a transcript that follows the playhead — and that deck sits inside a full landing page: sticky nav, hero, ten numbered bands and a footer. EB Garamond, Space Grotesk, IBM Plex Mono and Silkscreen from Google Fonts; everything else inline; no image files anywhere. Say in the footer that the product, the run and every number are invented.

THE DESIGN SYSTEM — a printed field manual
Plain white stock, true-black line art, one halt red, four type registers that never blur into each other:
- --paper #ffffff, --paper-dim #f3f2ed, --paper-deep #e9e7de, --ink #0b0b0a with .72/.46/.22/.12 alpha steps, --halt #b3221d.
- display: EB Garamond italic for headlines and prose. label: Space Grotesk uppercase, 8.5-11px, 1.4-2.2px tracking, for captions. mono: IBM Plex Mono for the transcript and every number on the page. chrome: Silkscreen, and only for literal System-7 UI — the window title bar and the transport buttons.
- No border radius anywhere and no section ever gets a background colour: bands are separated by a 1.5px rule, columns by 1px, panels by 1.3px dashed. Buttons are a 1.3px border with a hard 2px offset shadow that collapses on :active as the button translates into it.
- Set Silkscreen at 11px, never 10px: at 10px on a 1x screen its C rasterises as an O and "RECONCILE" prints "REOONCILE".
- A fixed full-page grain layer (inline SVG feTurbulence data URI, opacity .15, mix-blend-mode multiply, pointer-events none) and fixed 18px "ruler" edges striped with a 20px repeating hairline.
- Shared motifs: a comb of stacked black bars at deterministic widths, two halftone discs from 7px and 4.5px radial-gradient dot patterns, a slowly rotating repeating-conic sunburst, 45-degree hatch and 1px stripe swatches, and a dither bar (radial dots under a linear-gradient mask).

THE RUN
Invent one twenty-four step run with a story in it — an agent reconciling a month of invoices against a ledger. Each step has a kind (think, tool, write, retry, halt), a title, the call as issued, its latency, tokens in and out, the working context size after it, what changed in the run state, and a sentence of commentary in the voice of someone who has read a lot of traces. Put real shape in it: a join that fails on a wrong column and is repaired from context; a compaction that halves the window mid-run; three source re-reads that trip a 429 and a backoff; a duplicate invoice caught by reasoning rather than by a tool; and a final step where the agent tries to email the report it just wrote and is refused by policy. The run ends halted, and the work it did before that is still good.

THE DECK
A System-7 window: striped title bar with a square close box, a transport row, the tape, then a two-column reading.
- Transport: start, back, play/pause, forward, end; a 1x/4x/16x speed group; a mono clock showing t / total and step n of 24.

EVERY MOVING GRAPHIC IS THE SAME CHART
The hero trace, and the line laid over the deck's tape, are drawn by one routine in the manner of a stats-chart: a faint grid at 0.1 stroke width, an area polygon under the line filled with a vertical gradient that fades to nothing at the bottom, and a gradient-stroked line on top. Both animate for exactly 1.3s linear, together: the line sets its own stroke-dasharray to its measured length and runs the dash offset to zero, while the area is revealed by a clip rectangle translating across from minus-its-own-width. Give the line's gradient two stops only — ink for most of the run and the halt red at the far end — so on a trace that ends in a halt the colour is information rather than decoration, and park a small red dot on the final point that fades in at 88% of the animation.

Three things about it:
- Set the dash length from getTotalLength() at draw time, not by hand: the value changes with the data and a wrong one either clips the line or leaves it visible from the start.
- Restarting a CSS animation with the offsetWidth reflow trick does NOT work on an SVG element — offsetWidth is undefined there, no reflow happens, and the class swap collapses into nothing. Use getBoundingClientRect() if you need to retrigger.
- The chart over the tape is an overlay with pointer-events:none, so scrubbing still reaches the blocks underneath it.
- The tape's curve is NOT a one-off like the hero's. Drive its dash offset and its clip from the playhead instead of from an animation, so the spend line builds as the run plays and jumps with you when you scrub. Same mechanic, different clock, and it turns an intro flourish into a readout.
- A viewBox stretched with preserveAspectRatio="none" scales the stroke with it: at ten to one the grid's verticals come out ten times heavier than its horizontals. Put vector-effect: non-scaling-stroke on anything stroked in there and measure the width in device pixels. A circle in the same viewBox is an ellipse, so drop the end dot on that chart rather than fighting it.
Under reduced motion neither animation is started at all: the dash offset is written as zero, the clip sits at its final position and the dot is already there, so the same picture arrives without a frame of movement. The count-up on the docket's totals follows the same rule.
- The tape is the centrepiece. One block per step in a flex row, and the block's width is flex-grow set to its duration while its height is its share of the tokens. That is what makes the picture honest: x maps linearly to time, so the playhead is just a percentage of the wall clock and the axis labels under it are true. The kind of step is written into the fill rather than into a colour — solid ink for a tool call, 45-degree hatch for reasoning, vertical stripe for a write, halt red for a retry or the halt. Future steps drop to 22% opacity; the current one grows a small red caret beneath it.
- Left column: the step's number and kind badge, its title in Garamond, the call in mono, the commentary, then a four-cell meta strip (latency, tokens in/out, spend to here, run state) and a waterfall of the eight steps around the head — hairline tracks with a bar offset by its start time and as wide as its duration.
- Right column: three ring gauges, the transcript, and a verdict box that changes at a retry and again at the halt. The rings are the chart's other form — the same path measured once, its length used as the dash array, the offset walked back toward zero as the value rises, with the percentage written in the middle from the same call so the ring and the digits can never disagree. Context against 128k, spend against a $1 cap, wall clock against the run: give them a 1.3s draw-in the first time the deck arrives and a 180ms transition after that, so they read as live instruments rather than an intro that keeps replaying.

BEHAVIOUR
- Play advances a millisecond clock by elapsed time times the speed multiplier; the playhead, the gauges and the clock update every frame, but the step card, the transcript, the waterfall and the tape classes only rebuild when the step index actually changes. Guard that with a lastIndex check or you rebuild forty nodes sixty times a second for no reason.
- Scrubbing: pointerdown on the tape sets a scrubbing flag, captures the pointer and seeks; pointermove seeks while held. Clicking pauses — someone who grabs the tape wants to look at something.
- The transcript follows the playhead by setting its own scrollTop to centre the live line. Do NOT use scrollIntoView: it scrolls every scroll parent including the document, and inside an iframe preview that yanks the whole page while the run plays.
- Keyboard: space plays and pauses, arrows step, home and end jump to the ends, 1/2/3 set the speed, ? opens the manual, escape closes it. The tape itself is a focusable slider with aria-valuenow and aria-valuetext and handles its own arrows, so the document handler ignores events whose target is the tape, and it ignores anything inside a summary or a form control too.
- Bind those shortcuts ONLY while the deck is at least 40% on screen. On a scrolling landing page space is how people page down, and stealing it while someone is reading the FAQ is worse than not having the shortcut at all.
- One IntersectionObserver on the deck with thresholds [0, 0.4] does three jobs: any sliver on screen keeps the clock running, 40% on screen binds the keys, and the same 40% starts the run playing the first time you scroll to it — once, and never under reduced motion.

EVERY TOTAL COMES FROM THE TAPE
Sum the wall clock, the token count and the spend from the step array at boot and write them into the docket on the cover, the masthead line, the axis labels and the comparison table. Hand-typed totals drift the moment you edit a step — the first draft of this page claimed fourteen tool calls in one place and eleven in another.

THE HERO — a thread shader that becomes the line
Behind the hero copy, a WebGL2 canvas running a fan of glowing sine threads: one full-screen triangle, one fragment shader, no library. Seven threads, each offset by TAU/n in phase, each an abs() distance field fed through glow(x) = dist / pow(x, falloff), summed and tinted from violet to cyan across the fan with an amber core mixed in where the sum is highest. A pinch point at x = 0.5 that the pointer can pull toward it, a mirror term that flips the phase either side of the pinch, a shimmer term, and a little grain on the output. Write premultiplied alpha and blend with ONE / ONE_MINUS_SRC_ALPHA.

Three things about wiring it into a page rather than a demo:
- The headline sits ON the canvas, so the canvas takes no pointer events at all — the hero section listens and hands the canvas its coordinates. Attach the listener to the canvas and the copy swallows every move.
- The threads run bright through the middle of the hero. The headline survives that; 64%-white body copy does not. Put a soft radial scrim between them, sized so you cannot see its edge against the shader.
- Cap DPR at about 1.75, pause on an IntersectionObserver and on visibilitychange, and under prefers-reduced-motion draw exactly one fully formed frame and never loop. If getContext("webgl2") returns null, leave the host empty and let the SVG snake carry the hero instead: the page should lose an effect, not a section.

THE HANDOVER
The hero belongs to the shader and the rest of the page belongs to the line, and they cross over rather than sit side by side. As the hero scrolls away, drive the shader's spread down by about 88%, its frequency up, and its opacity to zero on a curve — the fan converges toward the single line rather than just dissolving — while the snake's opacity comes up from almost nothing to full over the same range. Both are fed the same hero-progress number, so there is exactly one place to tune the crossover.

THE NAV AND THE HERO
A sticky top bar on the paper: the wordmark in Garamond italic, a hairline-divided tagline, five section links in Space Grotesk caps, and a System-7 CTA. Under 860px the links collapse into a MENU button that drops them down the page; the CTA hides under 520px. Give every section scroll-margin-top so an anchor never lands under the bar.

The hero sits in normal flow under it — not a cover screen you have to dismiss. A bordered jacket holding the comb and a four-line fading ticker, then the tape drawn full width into a canvas: film-sprocket rails top and bottom, a white field, one bar per step using the same width-is-time height-is-tokens rule, and a red head sweeping it on a loop. Build the hatch and stripe fills as canvas patterns from small tiles so the jacket and the deck draw the same picture — a pattern is bound to the context that created it, so make them lazily on first paint, and stop the loop with an IntersectionObserver when the hero scrolls away. Beside the title, a "docket" slip: a dark label bar and a mono definition list of task, model, steps, tools, tokens, spend, wall clock and outcome, with the outcome in red. Title left and docket right above 900px, stacked below. Under the jacket, a hairline strip of six invented customer names with a line admitting they are invented.

THE TEN BANDS
Number them in the margin in mono, and let rule weight and type size do all the separating — no band ever gets a background colour.
01 The deck: the player above, introduced by a headline and a lede.
02 Premise: three hairline columns on what it keeps, each led by one of the motifs.
03 Anatomy: one step of the run as it is stored — eight numbered mono fields in a bordered record on the left, and a numbered reading of each field on the right. The record is short and the reading is long, so make the record position:sticky beside it above 880px and static below.
04 Sheet II: this run against a cheaper model's run of the same task, as a printed table whose delta column is computed (the cheap model is 48% cheaper and takes 71% more steps to reach the same answer, and both halt in the same place).
05 How it works: three moves — record, read, route — with a big italic numeral each.
06 Recording: a three-tab code block and three fact cards.
07 Compatibility: eight things it clips onto, in a hairline grid.
08 From the pit: three quotes in Garamond with mono attributions, all invented.
09 Rate card: one price split across a price side and a feature side.
10 Questions: five native details/summary rows with a hairline between them, the marker swapped for a + that becomes a minus when open, and the last answer admitting the whole product is fiction.
Then a centred closer and a footer carrying the disclaimer and the key legend.

RESPONSIVE AND A11Y FLOOR
Two columns collapse to one at 860px, the rate card at 760px, the meta strip to 2x2 at 520px. Under 560px the sheet gives up its side padding and the scrub hint is hidden so the frame label has the row to itself. No horizontal page scroll at 390 or 1512. Focus rings in halt red. Under prefers-reduced-motion: no autoplay, no sweeping head, no blinking caret — park the deck on the final step, which is the frame that says the most, draw the jacket's tape once, and leave the transport working for anyone who presses it.`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 23, 2026",
    demo: "/demos/spool-run-transcript.html",
    bestFor: ["agent observability","LLM tracing and debugging","AI developer tools","replay UIs"],
    style: ["light","editorial","print","serif","monospace","retro"],
    thumbnail: "/thumbs/spool-run-transcript.jpg",
    theme: "light",
    // Parked for now. `hidden` rather than deleting: /prompt/:slug still
    // resolves and the endpoints still serve it, so any link already shared
    // keeps working.
    hidden: true,
  },
  {
    title: "Holographic Ticket Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "A WebGL agent swarm you can shove out of the way, and die-cut holographic tickets masked out of one conic gradient",
    prompt: `Build a single-file HTML landing page for "Murmur Labs", a fictional applied AI research lab whose product is a multi-agent platform called Swarm. Two ideas carry the whole page: a hero made of a hundred soft spheres you can push around, and every card on the page cut out to look like a holographic admission ticket. Oswald from Google Fonts, three.js r128 and GSAP + ScrollTrigger from a CDN, everything else inline. No image files and NO ICON FONT - draw the four social marks as inline SVG, because pulling a hundred kilobytes of icon CSS plus a woff2 for four glyphs is the one asset this page does not need. Say in the footer that the lab, the platform, the models and every figure are invented.

THE PALETTE
Cool paper and one dusty rose family, nothing else: --paper #fbfaff, --black #101117, --petal #f2c4c4, --albedo #c7a5a5, --rose #b76e79, and a single --gold-grad of #f7dccf to #dca79c to #b76e79 at 135deg. The gold gradient is the only accent: it fills the word-mark text clip, the button wipe, the rule that draws across a process step on hover, and the footer social hovers. Give the body a very slight left-to-right wash toward #ecf0fb so the page is not flat white.

THE HERO - A SWARM OF AGENTS
About a hundred spheres in one three.js group, hand-placed in three clusters (a dense core, a left wing, a right wing) with radii from 0.15 to 1. MeshLambertMaterial in --albedo with a red emissive, one ambient light, one spotlight high and to the right, one weak directional from below. The camera is a 25deg perspective at z 24.
- On load they fly in: every sphere starts 25 units below, and a GSAP timeline per sphere staggered by 0.02s arcs it up, overshoots, and settles on its own position, pushing z out and back with a sine of the tween progress so the arc has depth. Until that finishes the page chrome is at opacity 0 and a single huge word sits behind the cluster; when it finishes the chrome fades in and the word fades out.
- After that they breathe: every frame each sphere lerps at 0.018 toward its original position plus a small sine on y and cosine on z, offset by index so the cluster undulates rather than pulsing as one.
- Hovering pushes them. Raycast on mousemove, take the first hit, and store a force vector along the hit normal that is applied and damped by 0.95 each frame until it is negligible. Then resolve collisions pairwise: if two spheres are closer than 1.2x the sum of their radii, push both apart along the line between them. That pairwise pass is O(n squared) on a hundred spheres, which is fine at this count and is the reason not to raise it much.
- Three things to get right or the page fights the reader. Attach OrbitControls but turn OFF zoom and pan, or the wheel stops scrolling the page. On coarse pointers disable the controls entirely and set touch-action pan-y on the canvas, or the hero traps the first swipe. And gate the whole rAF behind an IntersectionObserver on the hero, because there is no reason to raycast and resolve ten thousand sphere pairs for a section nobody is looking at.
- Only push while the pointer is actually over the hero: compare clientY against the canvas rect, since the mousemove listener is on window.

THE TICKET - one mask recipe, used five ways
Every card is a die-cut ticket, and the die is a CSS mask rather than a background image. The paper is a conic-gradient of eight or ten pale iridescent stops over a soft vertical wash, with a second layer of repeating-radial rings in color-burn at low opacity drifting on a nine-second alternate loop, and a cursor-tracking radial white sheen in soft-light. Then cut it:
- Build the shape out of four mask layers composited with INTERSECT, not add: two repeating radial gradients along opposite edges for the perforations, and two single radial gradients for the notches where the stub tears off. Add would union the holes and you would get a rectangle back. Write both the -webkit-mask-composite: source-in and the standard mask-composite: intersect - they are different keywords for the same result and Chromium still wants the prefixed one.
- Keep the vertical and horizontal recipes in two custom properties on the same element, --mask-v and --mask-h, and switch between them by reassigning mask. The wide CTA ticket uses --mask-h; at narrow widths it flips back to --mask-v when the layout stacks, and the only thing that changes is which variable is assigned.
- The perforated edge is the mask, but the TEAR line is a separate dashed border inset by the notch radius, and the notch positions are driven off the same --stub variable the stub height uses, so the notches always sit exactly where the tear is.
- Float them: a 4.5s ease-in-out translate loop with animation-delay set from a per-card --i so they do not bob in unison. Use the individual translate property, not transform, because the pointer tilt writes transform and two owners of one property is how a card ends up stuck mid-air.
- On pointermove write a perspective rotateX/rotateY from the cursor position and set --mx/--my for the sheen; reset both on pointerleave. Guard it behind pointer: fine.

THE FIVE USES
1. A marquee strip: the ticket mask stretched across a rotated band, two copies of six words translating -50% on a linear loop, with a slow light sweep in soft-light over the top and the whole track pausing on hover.
2. Six product cards in a three-column grid, every second one dropped 90px, each holding a little constellation of CSS radial-gradient orbs that drift apart on hover.
3. Six model cards in a flex row that expand on hover - flex 1 to flex 2.4 - revealing a description and a barcode that were collapsed to zero height and width. Below 1200px this has to become a grid with everything already open, because a hover-to-expand row is unusable the moment hovering stops being a thing.
4. A wide admission ticket for the CTA, stub on the right, with a barcode scaled 1.6x on its x axis.
5. One dark variant for the embeddings model, which needs its own holographic stops, an inverted barcode and a screen blend instead of color-burn.
Draw the barcode with a single pseudo-element and a long box-shadow list rather than twenty spans.

TYPE AND SECTIONS
Oswald throughout, 200 to 700. A 160px hero numeral, 104px section titles, a 132px CTA headline with one word in -webkit-text-stroke outline. Sections are numbered 02 to 06 with an uppercase label and a rule. Between them: a statement paragraph with three stats, a four-step process row where a gold rule draws across the top border on hover, and a centred 68px quote. The footer ends with the word-mark at 19.5vw, the disclaimer, and a three-part bottom bar.

RESPONSIVE AND MOTION
Breakpoints at 1499, 1199, 991, 767. The work grid goes 3 to 2 to 1, the process grid 4 to 2 to 1, the model row to a 3-up then 2-up then 1-up grid with everything expanded, and the wide CTA ticket stacks with its stub underneath. Hide the hero nav under 767 and leave the hamburger. No horizontal scroll at 390 - the marquee band is deliberately wider than the viewport, so the overflow has to be clipped on html and body, not just on the band. Under prefers-reduced-motion drop the ticket float, the holographic drift and the marquee sweep.`,
    preview: "hero",
    variant: "large",
    added: "Sep 29, 2026",
    demo: "/demos/murmur-swarm-tickets.html",
    bestFor: ["AI research labs","multi-agent platforms","model family showcases","early-access waitlists"],
    style: ["light","pastel","holographic","webgl","three.js"],
    thumbnail: "/thumbs/murmur-swarm-tickets.jpg",
    theme: "light",
  },
  {
    title: "Notched Panel Catalog Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Interlocking cobalt panels, moulded-plastic controls, model cards with CSS benchmark plates",
    prompt: `Build a single-file HTML landing page for "Modelyard", an AI gateway that puts one endpoint in front of every model, in a bold cobalt-and-yellow poster style made of interlocking panels. Anton and Inter from Google Fonts, everything else inline, and no image files anywhere. Make the brand obviously fictional and say so in the footer.

THE NOTCH IS THE WHOLE SYSTEM
Every block is a large-radius panel whose corner is bitten into by its neighbour, and none of it uses clip-path or masks:
- A panel paints a square of the NEIGHBOUR's colour behind its own rounded corner — \`position: absolute; width: 50%; height: 50%; bottom: -4px; right: -4px; z-index: -5\` — so the radius reads as an inverse curve and the two blocks appear to interlock.
- Use it everywhere: the white logo block biting into the cobalt nav bar, the hero's footer row where a blue block, a mid-blue gap and a second blue block interlock across the bottom, and the catalogue cards where the price strip and the button cluster bite into each other.
- The trick only holds if the squares are coloured from the neighbour, so keep the palette to five values: #183fad cobalt, #4565bc mid, #abb9de pale, #e9ecf6 chip, #f1bf0a yellow, on #090909 ink.

THE CONTROLS ARE MOULDED, NOT FLAT
Every control wears one material, adapted from the Uiverse toggle by Pradeepsaranbishnoi. Six shadows in a fixed order do all of it:
\`0 15px 25px -4px rgba(0,0,0,.5)\` outer drop, \`inset 0 -3px 4px -1px rgba(0,0,0,.2)\` dark bottom lip, \`0 -10px 15px -1px rgba(255,255,255,.6)\` white glow above, \`inset 0 3px 4px -1px rgba(255,255,255,.2)\` lit top edge, \`inset 0 0 5px 1px rgba(255,255,255,.8)\` halo, and \`inset 0 20px 30px 0 rgba(255,255,255,.2)\` sheen across the upper half.
- Pressed swaps the stack: the sheen moves to the bottom, a dark inset lands on top, and a \`filter: blur(0.5px)\` plus a one-step-smaller label makes the surface look pushed into the page rather than recoloured. Transition on \`cubic-bezier(0.23, 1, 0.32, 1)\` over 300ms.
- Scale it down for small controls — an 8px drop on a 34px button, not 15px, or a chip floats like a 68px key.
- Keep the shapes: the capsule stays a capsule, the icon button stays a circle. The capsule also keeps its white knob, which still grows into a fill on hover (width and height, springy \`linear()\`, ~1.6s) — it just sits under the sheen now.
- The full-size version of the material is a 100px round toggle: a hidden checkbox, a 68.8px button, a 72px halo ring at 20% white behind it, and a label whose colour and size shift on \`:active\` and \`:checked\`.

SECTIONS
1. Nav: a white logo block with an inline-SVG mark, a cobalt bar with centred links, a burger under 768px, and a pill carrying a live count of what you have routed.
2. Header: a cobalt panel with the wordmark set in Anton at \`clamp(56px, 15.4vw, 158px)\` across the full width, then a mid-blue stage holding a yellow section label, a paragraph, and a pale stat card with a big number and three overlapping initial chips. Under it, the interlocking footer row: a pill on the left, two round arrows on the right.
3. In place of a product photo, an isometric rig: three slabs at \`rotateX(58deg) rotateZ(-45deg)\`, floating on staggered sine loops, labelled with the featured model's name, context and price. Rotate the label 45° inside the slab or it reads as a smear on that plane.
4. Catalogue: nine model cards. Each has a notched price strip (list price struck through, live price), two round pill buttons, a title bar, and — where the sketch had a photo — a "plate": a CSS grid of bars drawn from that model's benchmark numbers, coloured per model. Meta line underneath carries context window and p50 latency.
5. Routing policy console: a cobalt panel holding four of the 100px toggles — cheapest, fastest, top eval, failover — over a readout that rewrites one sentence and a blended $/1M rate as you press them. Derive the rate from the catalogue table, not a constant, and route only over the chat-capable models: the embedding and safety endpoints are cheaper and faster than everything else, so without that filter they win every policy and the number never moves.
6. Tiers: three notched panels, the middle one cobalt, each closing on a moulded pill. Pressing one writes the choice into the sign-up note below.
7. FAQ: rows that open on a max-height transition, with the round moulded control as the +/− marker.
8. Sign-up: a pale panel with an inset-shadowed pill input and a moulded submit that validates natively and sends nothing.
9. Footer: cobalt panel, centred links, social icons, and a line saying every number on the page is synthetic.

BEHAVIOUR
- The arrows walk a featured model through the header: label, copy, the stat number and all three slab labels change together.
- The card's plus button toggles into a check, marks the card as routed and increments the count in the nav; pressing again removes it.
- Keep every number in one table at the top of the script and draw the price, the plate and the meta from it, so adding a model is one object.

RESPONSIVE
One column of cards under 480px, two to 768px, three above. The interlocking footer row collapses to just the pill under 640px, the isometric rig hides under 768px, and the nav links become a burger that reveals them inline.`,
    preview: "cards",
    variant: "large",
    added: "Sep 23, 2026",
    demo: "/demos/modelyard-router.html",
    bestFor: ["LLM gateways and model routers","AI API platforms","model catalogs","developer tools"],
    style: ["light","poster","cobalt-yellow","notched-panels","bold"],
    thumbnail: "/thumbs/modelyard-router.jpg",
    theme: "light",
  },
  {
    title: "Squircle Keycap Product Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Generated SVG keycaps inside a neo-brutalist bento shell, with a hero key that runs a live runbook",
    prompt: `Build a single-file HTML landing page for "BIGRED", a runbook-automation product with an AI operator, where every control on the page is a generated 3D keycap. Inter 400–900, JetBrains Mono and Material Icons from Google Fonts, everything else inline. Make the brand obviously fictional and say so in the footer.

BUILD THE KEY FIRST; IT IS THE DESIGN SYSTEM
Two functions do all of it.
- \`S(w, h, r, x, y)\` walks a superellipse: four quadrants, 31 samples each, where the offset from the corner is \`sign(cos) * |cos|^0.6 * r\` rather than a circular arc. That exponent is the whole point — a border-radius flattens on the straight edge, this never does.
- \`createBtn(cfg)\` stacks that path into something physical: a base plate offset 12px down and filled at 60% black, a stroked base at 80%, a run of one-pixel side slices filled with a vertical gradient (light at both edges, dark through the middle) between the base and the face, then the face itself. Pressing moves the face from y=4 to y=9 and shrinks the drop shadow, so the key travels onto its base instead of changing colour.
- Colour comes from one string of 22 hex triplets — eleven pairs of face and shade — indexed by name. Derive every other tone with \`color-mix(in srgb, #hex N%, white|black)\` so a new stop needs six characters, not a palette file.
- Width is measured, not guessed: render the uppercase label to a canvas 2D context at \`900 15px Inter\` and add 80px, or 100px when there is an icon. Square icon keys are fixed at 48. Height scales the whole SVG through \`h / 40\`.
- Variants: square icon-only, floating (a 24px drop shadow that halves on press), full-width (re-measure through a ResizeObserver), disabled. Give each key an \`onPress\` callback and a \`set()\` that re-renders with new colour or icon — that is what makes the page interactive rather than a swatch sheet.
- Accessibility: role=button, tabindex, and Enter/Space driving the same press states as the pointer.

THE PAGE AROUND THEM IS NEO-BRUTALIST BENTO
Space Grotesk and DM Mono, a warm paper ground with two radial tints, and every surface a bento card: 3px ink border, 22px radius, hard \`7px 7px 0\` offset shadow, flat poster colour (yellow, cornflower, pink, lime, purple, orange). No blur anywhere, no gradient fills on the furniture, one ink for every line.

THE TWO SYSTEMS MEET IN THE SHADOW
This is the whole trick — do not leave the keys looking imported:
- Swap the key's soft drop shadow for the page's hard one: \`feDropShadow\` with \`stdDeviation="0"\`, full opacity, flooded with the page ink, offset 6px at rest and 2px pressed — the same travel the bento pills use.
- Stroke the base and the face with the page's ink at the page's 3px weight instead of a tinted highlight. Keys placed on the ink-coloured inspector take a paper stroke instead, so they read as outlined either way.
- Keep everything else: the superellipse, the extruded slices, the face that travels, the measured widths, the eleven-stop ramp.
- Watch inherited \`text-transform\`. A key dropped inside an uppercased block will uppercase its Material Icons ligature, and "BACKUP" is not an icon — it is the word, drawn across the button. Set \`text-transform: none\` on the key and scope the uppercase rule to the label it was meant for.

SECTIONS
1. A bento top bar: a tiny square key as the logo mark, mono links, a white key as the sign-in.
2. Hero bento, split: copy on paper — with the second headline line in red, ink-stroked, on a hard yellow text shadow — and beside it a cornflower panel holding a rotating sun dial (a repeating conic gradient ring with an orange disc inside) with a 104px red power key counter-rotating at its centre. A pink circle bleeds out of the hero's bottom edge.
3. A dark console with a six-step run log. Pressing the hero key runs it: each step goes from idle to a spinning tick to a green done with its duration; the key itself turns slate and becomes a stop, the status line counts steps, and pressing again halts the run and rolls it back. Nothing is real — say so.
4. Four flat-colour stat cards — yellow, cornflower, pink, lime — with a mono label, a huge number and a line of context.
5. A readiness audit: a circular grade chip, a barber-pole meter that fills on a timer, a status line and two keys (run, export). Finishing it flips the grade chip to lime and raises a toast.
6. Registry: pill filters on the right of the section head, a two-column grid of runbook cards each with a coloured circle bleeding out of its bottom-right corner, and a sticky ink inspector beside them — scope badge, category, what it does, what it will not do, an approval box in lilac holding a square key, a "next key" key and a text button that copies the runbook and toasts.
7. Key system: the palette as eleven labelled keys, the same eleven as square icon keys, a 30/44/60px size ramp, one full-width key.
8. Three numbered playbook cards in cornflower, yellow and pink with a ghosted numeral, then a lime footer.
9. A floating support key and a bottom-right toast.

DETAILS THAT MATTER
- Load Material Icons and use ligature names (\`restart_alt\`, \`power_settings_new\`, \`ac_unit\`) as the tspan's text. Inside a JS-built SVG string, write the font family unquoted — an escaped quote inside a quoted attribute inside a JS string is how that breaks.
- Reveal sections with an IntersectionObserver adding a class, staggered by index; no animation library.
- Respect prefers-reduced-motion: no reveal travel, no spinner, and the demo run collapses to a fast tick-through.
- At 960px the hero stacks, cards and tiers go single column and the nav links hide.`,
    preview: "buttons",
    variant: "large",
    added: "Sep 23, 2026",
    demo: "/demos/bigred-runbooks.html",
    bestFor: ["incident response and SRE tools","runbook automation","AI operator products","devops platforms"],
    style: ["light","neo-brutalist","bento","isometric","monospace","tactile"],
    thumbnail: "/thumbs/bigred-runbooks.jpg",
    theme: "light",
  },
  {
    title: "Generative Editorial Product Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Fashion-editorial layout for an AI product, every image a gooey generative composition",
    prompt: `Build a single-file HTML landing page for "Prism", an evals platform for teams shipping LLMs, in the language of a fashion portfolio rather than a SaaS template — and with no photography anywhere. Asul, Cabin and Covered By Your Grace from Google Fonts, GSAP 3.12 + ScrollTrigger from a CDN, everything else inline. Make the brand obviously fictional and say so in the footer.

THE IMAGES ARE GENERATED, NOT SHOT
Every picture on this page — the hero panel, the run gallery, the floating cards, the wide banner, the quote avatars — is the same component at a different size:
- A CSS grid of cells. Each cell holds one absolutely positioned shape, centred on the cell, sized 100% or 200% (the oversize is the point: it bleeds into the neighbours), rotated by a quarter turn, given either no corner radius or a 100vw one, and coloured from a six-colour palette: #561ccd, #a169e9, #361bec, #100091, #fc7f0c, #e51263.
- Six shape variants: plain fill, two dotted variants (\`radial-gradient(circle at center, var(--c1) 1px, transparent 1px, transparent 5px)\` over a second colour at 10px), a 45° half-gradient, a full circle, and a twelve-point star via clip-path.
- Every shape is \`mix-blend-mode: hard-light\`, and the whole grid runs through an SVG gooey filter: \`feGaussianBlur\` at 12, then a \`feColorMatrix\` with an alpha row of \`0 0 0 19 -9\` to crush the blurred ramp back to a hard edge, then \`feComposite ... operator="atop"\`. That is what makes neighbouring shapes melt into each other instead of sitting side by side.
- Drive it all from CSS custom properties set in JS, so resampling is one loop over the cells. Resample on click, and let the hero resample itself on a slow beat while it is on screen.
- Two things to get right or it falls apart: scale the cell count with the element (the sketch is 6x6 in a 500px box, so a 1400px panel needs 12x12 or the melt disappears — the blur is in pixels), and position the injected grid off the \`[data-goo]\` attribute rather than one wrapper class, or half the hosts collapse to a zero-height grid.

DESIGN SYSTEM
- Palette: white page, black ink, #ff4081 accent, #f1f1f1 / #e5e5e5 / #6b6b6b greys. The nav is a full-bleed accent bar.
- Asul 700 uppercase for display at -0.04em tracking and 0.96 line-height; Cabin 14px uppercase at 0.14px tracking for every label; Covered By Your Grace in accent, 28px, for hand-written margin notes — they are the page's whole personality, so put them everywhere: rotated over the hero word, beside section titles, numbering the steps and the contact lines.
- Links are lowercase-to-uppercase text with a 1px rule under them and an arrow that slides 3px on hover.
- Primary CTAs are full-width black bars at 64px display type.

SECTIONS
1. Sticky accent nav: wordmark, centred links, a ruled CTA.
2. Hero: one giant word at \`clamp(110px, 22vw, 340px)\`, with five hand-written decorations absolutely positioned against it (one rotated -35°, one rotated -72° off its own bottom-left corner, a © and a year), and four corner meta blocks — label over value — pinned to the section's corners.
3. A ticker of capability phrases separated by 64px rules, duplicated and translated -50% on a 60s linear loop, paused on hover.
4. Hero panel: a square generative composition with an 8x8 white rule grid over it, ten cells of which are lit accent at 60% with multiply blending. A note in the corner tells you it resamples on click.
5. About: a centred statement in display caps with hand notes around it, and three generative cards behind it at different parallax speeds.
6. Run gallery: rows of tiles at 3:4, 1:1 and 4:3, each with a max-width and a top padding so the row staggers vertically, captioned with a date right-aligned under it.
7. Platform: a black band, three cards rotated -6°, 10° and 3° and overlapped by -64px, each with an accent line icon.
8. A wide generative banner, then a second ticker at display size with accent blocks between phrases.
9. Process: three numbered steps with hand-written numerals, over floating generative cards that bob on a sine loop.
10. Quotes: a card slider — a centre card, two ghost cards behind it at 0.5 opacity, scaled 0.75 and rotated ±5°, prev/next buttons, and a generative avatar in every card.
11. Contact: a two-column block, one side a list of commands numbered by hand, the other a full-bleed composition with a black button on top. Then a footer with link columns and a legal bar.

MOTION
GSAP with one data attribute per behaviour: nav drop, a hero timeline (word up, decorations popping with back.out, meta fading), a random-order stagger on the 64 grid cells, reveal/photo/hand/card-pop batches on ScrollTrigger, a sine bob on the floats and scrubbed parallax on the about cards. Give floats and parallax separate wrappers so no two tweens write the same transform.

RESPONSIVE
At 1024px the centre nav, the about cards, the process floats and the ghost quote cards all drop out and the card rotations flatten. At 720px the hero meta becomes a two-column grid above the word, the run rows wrap to two per line, and the quote card fits the viewport. Respect prefers-reduced-motion: no tickers, no bobbing, no slider animation.`,
    preview: "gallery",
    variant: "large",
    added: "Sep 22, 2026",
    demo: "/demos/prism-evals-editorial.html",
    bestFor: ["LLM eval platforms","AI quality and CI gates","developer tools","editorial product launches"],
    style: ["light","editorial","generative-art","gooey","serif"],
    thumbnail: "/thumbs/prism-evals-editorial.jpg",
    theme: "light",
  },
  {
    title: "Wind Field Routing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Live WebGL wind field hero, six pressure presets, broken-frame buttons and cards",
    prompt: `Build a single-file HTML landing page for "Drift", a weather-routing platform for ocean fleets, around a live WebGL wind field. Bebas Neue + DM Mono from Google Fonts, raw WebGL in a script tag — no framework, no npm, no build step. Every other visual is CSS. Make the brand obviously fictional and say so in the footer.

THE FIELD (build this first; the whole page is drawn in its language)
A flow-field hero: 14,000 particles advected through the sum of six pressure vortices, drawn as GL line segments.
- Each system is { x, y, spin, r, strength }. Its contribution at a point is a tangential vector of magnitude \`strength * (d/r) * exp(-d² / 2r²) * gain\`, plus a radial inflow term of \`-spin * 0.32 * mag\` so lows draw in and highs push out. Sum the systems over a background flow (bgU, bgV).
- Precompute the field into a Float32 grid at one cell per 28px and refresh ONE row per frame, round-robin — the systems drift, so a fully recomputed field every frame is wasted work.
- Particles: bilinear-sample the field, step by \`u * dt * flowSpeed\`, respawn on death or when they leave the box. Ages and lifetimes are random so nothing pulses in sync.
- Draw into a ping-ponged framebuffer pair: each frame, blit the previous texture through a shader that mixes it 7% toward the background, then draw this frame's segments over it, then blit the result to the canvas and swap. The trails ARE the fade; never clear.
- Colour by speed: 8-stop palette, interpolate between stops on \`speed² * gain\`, alpha 0.54, additive-free SRC_ALPHA blending. Three palettes (marine, mistral, sirocco) so presets can re-tint the whole field.
- Cap DPR at 1 and the step at 30fps; the framebuffer trails carry the motion, not the frame rate.
- Overlay the systems as DOM markers: three concentric hairline rings at 0.72 / 1.18 / 1.72 scale with falling opacity, and a 1.8rem square-in-circle label reading L or H, moved with translate3d and smoothed toward the system's position at 0.12 so the marker lags the field slightly.

PRESETS
Six named fields — summer calm, levante, mistral, tramontana, sirocco, winter storm — each with its own palette, background colour, flow speed, field gain, background flow, wander and six systems. Switching one eases the systems toward their new targets rather than teleporting them, re-tints the legend, and clears the trail buffers so the new field draws clean.

DESIGN SYSTEM (everything else inherits from the field)
- Tokens: --bg #0d141a, --paper #f0ece3, --muted #a3b0b8, --low #e0896a, --high #6a9fe0. Bebas Neue for display, DM Mono 300 for everything else — including every number, endpoint and label.
- Use CSS layers (reset, base, layout, ui) and logical properties (inline-size, inset-block-start, margin-block) throughout. color-mix(in oklab, ...) for every tint, so one --paper drives all the hairlines.
- ONE rule weight: 1px hairlines at 16% paper, 34% for emphasis. No shadows, no radii, no fills — the page is drawn, not boxed.

BUTTONS AND CARDS (the broken frame)
Adapted from the Uiverse "fancy" button by cssbuttons-io, inverted for a dark page. Build the button once and let the cards be the same idea at card scale.
- The button is a square 2px frame, no radius, with a dash before the label: an absolutely positioned 1.5625rem x 2px bar at 1.5em from the left, vertically centred.
- Three "keys" punch gaps in the frame: one 1.5625rem bar at top -2px / left 0.625rem, and two at bottom -2px — 1.5625rem at right 1.875rem and 0.625rem at right 0.625rem. Paint them in the surface BEHIND the element, not in a fixed colour: put that colour in a variable each section sets, or the gaps stop being gaps the moment a band changes tone.
- Hover and focus-visible fill the button with paper, invert the label and the dash, shrink the dash from 1.5625rem to 0.9375rem, slide the label 0.5rem left, and close all three keys (width 0, pulled to the frame's corners) on a slower 0.5s ease-out than the 0.3s everything else runs at — the frame heals after the fill lands.
- Set the label's inset in rem, not em: the label is a small mono caps, and 2em of it lands the glyphs under the dash.
- The solid twin starts filled and empties on hover, so a pair still reads as primary and secondary.
- Cards (panels, preset cards) take the same 2px frame with two keys — top-left and bottom-right — that close on hover with a 6% paper wash. Two, not three: a card is wide enough that a third gap reads as damage rather than drawing.
- An 84px grid, ghosted over the field at 50% and over every section at 12%, as repeating-linear-gradients.
- Microcopy is lowercase mono at 0.55rem with 0.2em tracking; headings are Bebas at 0.86 line-height.

SECTIONS
1. Sticky hairline bar: wordmark, mono links, a ghost CTA.
2. Hero = the field, sized to the viewport minus the measured nav height. Over it: a caption block (title + "l = low pressure · h = high pressure · <mode>"), the headline and CTAs, the speed legend bottom left and the six preset buttons bottom right. The field is dense, so put a scrim behind the copy — a wash down the reading column and another under the instrument row, both inside the hero's own stacking context so they sit over the canvas and under every word.
3. Readout strip: four hairline-divided stats, counters counting up when they scroll in.
4. "The model": three plates, each a hairline figure of a pressure system (reuse the ring markup, with the ring opacities raised since a static figure has to carry the drawing) over a masked hatch of repeating lines, with a ruled caption bar underneath.
5. Live board: a mono table of voyages where the wind column is a swatch pulled from the same palette the legend shows, and ETA deltas are tinted with --high and --low.
6. Presets: six cards built FROM the preset objects — label, blurb, a gradient bar of that palette, and its flow/gain numbers. Clicking one drives the hero field and scrolls back to it.
7. API: a two-column block with a syntax-tinted request/response plate.
8. Pricing: three hairline panels, the middle one filled at 7% paper.
9. Access: an email form that validates natively and sends nothing, beside a details/summary FAQ with + and – markers.
10. Footer: link columns, a giant ghosted wordmark at 10% paper, and a legal bar with the current year.

BEHAVIOUR
- Pause the field when the hero leaves the viewport (IntersectionObserver) and when the tab hides; 14,000 particles are not worth simulating off screen.
- Drop the particle count to ~5,200 under 760px.
- If getContext("webgl") returns null, swap the canvas for a CSS pressure gradient and keep the presets driving the legend and the label — the page must not depend on WebGL, and must never throw.
- Handle webglcontextlost / restored.
- Under prefers-reduced-motion, run the field long enough to build its trails (about 40 frames) and then hold that frame.

RESPONSIVE
Under 62rem the grids go to two columns and the readout wraps. Under 46rem the nav links hide, grids go single column and the preset row left-aligns. Under 820px of HEIGHT the hero compresses its type and drops the lede, so the legend and presets stay above the fold.`,
    preview: "dashboard",
    variant: "large",
    added: "Sep 22, 2026",
    credits: [
      {
        label: "Uiverse — fancy button by cssbuttons-io",
        href: "https://uiverse.io/",
        note: "The broken-frame button the page's buttons and cards are built from.",
      },
    ],
    demo: "/demos/drift-wind-routing.html",
    bestFor: ["logistics and routing","fleet operations","geospatial data products","climate and weather tech"],
    style: ["dark","webgl","data-viz","editorial","monospace","scroll-pinned"],
    thumbnail: "/thumbs/drift-wind-routing.jpg",
    theme: "dark",
  },
  {
    title: "Clay Constellation SaaS Hero",
    category: "web",
    categoryLabel: "WEB",
    description: "A tilted live chat demo in a cloud of clay stat cards, pixel-type accents, and buttons that measure themselves",
    prompt: `Build a single-file HTML landing page for "Traffo", a fictional product analytics platform. Plus Jakarta Sans, Manrope and JetBrains Mono from Google Fonts; GSAP 3.12 with ScrollTrigger from a CDN. Every graphic is inline SVG — no image requests.

DESIGN SYSTEM
Warm paper #f6f3eb with a second tone #ecead4 for the lower half, ink #0f0f0f, soft ink #5a5a55. Three clay colours, each a three-stop family: mint #dcf5dc / #c8ecc8 / #95c598, acid yellow #f1ff76 / #e5ff00 / #b9cc00, purple #ece2f8 / #dcd0ee / #ab9bd0, plus a black tile at #3a3a3a → #050505. The acid comes from the button and is then used everywhere — tiles, stat suffixes, ambient orbs — so the page reads as one system rather than a button dropped onto a palette. Every clay surface uses the same recipe — a 165° gradient through all three stops, an inset white top edge, an inset dark bottom edge, an inset 30px inner glow, then a coloured ambient shadow and a wide soft one. Radius 36px on tiles and cards, 48px on big slabs. Plus Jakarta Sans 700 at -0.035em for display, Manrope for body, JetBrains Mono 11px at 0.14–0.18em for labels. Springs are cubic-bezier(.34,1.56,.64,1). A fixed SVG turbulence grain sits over the page at 10% multiply, with two blurred colour orbs behind it.

THE CONSTELLATION (the centrepiece)
A 600×660 field holding eleven clay tiles at absolute pixel positions — three sizes: 142×118 main, 156×132 for the black database at the centre, 64×64 circular pills — each with a line-art icon at 50% of the tile. Behind them, an SVG at the same 600×660 viewBox draws twelve curved paths connecting the tiles, stroked at 1.6px in 85% ink.
Build each tile as three nested layers, one owner per transform, or they will fight:
- \`.tile\` — position, and the GSAP entrance (opacity + elastic scale).
- \`.tile-float\` — a CSS keyframe drifting -6 to -12px on its own duration and delay per tile.
- \`.tile-inner\` — the hover lift (translateY(-10px) scale(1.06)), with the icon scaling and rotating -4°.
Put the float on \`.tile\` itself and the entrance tween writes the same \`transform\`; the elastic pop is what loses. And end that entrance tween with \`clearProps: "transform"\`, or the inline matrix GSAP leaves behind pins every tile and the float never starts.
The whole cluster tilts in 3D toward the pointer: rotationY ±12°, rotationX ±8°, \`transformPerspective: 1500\`, springing back with \`elastic.out(1, .5)\` on leave. Tilt an inner wrapper, not the element the scroll tween moves.

ENTRANCE
One GSAP timeline: header fades, the three headline lines slide up out of \`overflow: hidden\` masks, the description and CTA rise, the tiles pop in staggered \`from: "center"\` with \`elastic.out(1, .6)\`, the twelve lines draw themselves via stroke-dashoffset, then the workspace bar and its pills. Keep the initial hidden states in JS, not CSS — if the script fails to load, the page should still render complete rather than blank.

THE BUTTON — AND THE SYSTEM IT SETS
An acid-yellow pill that sits inside a measuring frame: four dashed guides and four corner dots that draw themselves in around it on hover, like a dimension being marked on a drawing. Give it six tokens and let the rest of the page pull from them: --dot-size 6px, --line-weight 1px, --line-distance .9rem 1.1rem, --animation-speed .35s, --dot-color #666, --line-color #999.
- The pill's radius is a percentage squish, not a pixel value: 30% / 200% at rest, 10% / 200% on hover, 20% / 200% on :active. That is what makes it read as a soft capsule that firms up when you reach for it. It also scales 1.05 on hover and 0.98 on press, and goes white on hover so the yellow reads as the resting state.
- Six-stop shadow stack from 0 0 0 1px #0003 down to 0 32px 24px rgba(3,7,18,.1) — the whole lift is in the shadow, not a transform.
- The dots are absolutely positioned behind the button and fly to the corners in sequence (0, 0.6, 1.2, 1.8 × --animation-speed). The guides then draw in at 0.8, 1.4, 2, 2.4 ×, each starting rotated 5° and scaled to 0 on the axis it will grow along, so they swing straight as they extend. Build the dashes from a repeating-linear-gradient rather than border-style: dashed, so the rhythm stays tied to --line-weight.
- After all of it, the wrapper washes to #e5ff0055 — an 80%-to-100% keyframe, so the wash only lands once the frame is complete.
- Arm it with .btn-wrapper:has(.btn:hover) so only the button itself starts the sequence, AND with :focus-within, or a keyboard user never sees the frame. Mark every dot and line aria-hidden — they are eight empty divs.
- Two things to fix from the usual version of this component: the label at #0008 on #e5ff00 is about 4.2:1, under AA for 16px semibold, so darken it to rgba(0,0,0,.82) — that measures 12.55:1; and on a dark slab the #999 / #666 guides vanish, so re-point --line-color and --dot-color on that section instead of rewriting the rules.
- Reuse the frame as a card treatment: the same dashed guides and corner dots, drawn with background gradients on ::before and ::after, fading in on hover with the dots delayed behind the lines.

SECTIONS
1. Header: cube logo in inline SVG, text nav, and the same button at a small size.
2. Hero: 1fr / 1.15fr split, headline at clamp(48px, 5.8vw, 84px), and the button below.
3. Workspace bar: three clay pills that lift and rotate -3° on hover.
4. Stats: four counters on the warm tone with a 48px top radius. Drive each from data attributes — \`data-num\`, \`data-decimals\`, \`data-prefix\`, \`data-suffix\` — and render prefix + value + a coloured suffix span. Do not derive the format from the magnitude at runtime: that is how 2400 with an "M" suffix renders as "2.4kM".
5. Features: a mono eyebrow with a rule, a split heading, a right-aligned mono meta block, and three clay cards that tilt in 3D toward the pointer. GSAP owns the card transform, so do not also give it a CSS hover transform.
6. Quote: an oversized quote mark that springs in, and a 64px statement.
7. Final CTA: a black slab with two blurred orbs and a yellow CTA.
8. Footer: brand, three link columns, a mono bottom bar.

WORD REVEALS
Split the section headings into per-word masks and slide them up on scroll. Split by walking TEXT NODES, not \`innerText.split(" ")\` — flattening the heading destroys inner markup like an accent span, and then the colour has to be guessed back by matching words.

CURSOR
Leave the pointer alone. A dot that replaces the caret is the first thing anyone notices and the first thing they ask you to take off: it reads as a circle following the mouse rather than as a cursor, it costs the operating system's own hover and text affordances, and it has to be gated on pointerType, handed back on the first touch, and propped up with focus rings — a lot of machinery to end up worse off than the arrow you started with.

RESPONSIVE
At 1100px the hero stacks and the cards go to one column. Below 700px hide the nav and scale the constellation — scale a WRAPPER, because GSAP writes an inline transform on the field during the scroll parallax and an inline style beats a media query. Remember a transform scales pixels but not the layout box: pair the scale with negative margins (600×(1-s)/2 each side, 660×(1-s) at the bottom) or the field keeps reserving 600×660 and the page overflows. \`prefers-reduced-motion\` skips the timeline, the floats, the tilts and the counters, rendering every final state immediately.

THE SLAB — claymorphism carrying glassmorphism
Set the whole hero on one slab of white clay inset from the page edges: a soft body, a warm cast underneath it, an inset lip along the bottom edge so the surface reads as thick, and a single acid band cut diagonally across one corner. The clay recipe calls for a COLOURED cast rather than a grey one and with a high-chroma accent that is a trap — tinted at full strength it comes back as a halo ringing the whole slab, which reads as a glow rather than as a shadow. Keep the cast and the lip warm-neutral and let the accent do its work where it is meant to: the band, the underline and the button.
Then straddle its edges with two frosted chips - a labelled tab hanging off the top-left, a disc over the bottom-right - each a wash of white at about 40%, a backdrop blur, a coloured drop shadow and an inset lip. The straddle is the entire reason to pair the two styles: a backdrop-filter has nothing to say sitting on flat colour and everything to say when half the chip is over the slab and half over the paper, so one piece of glass shows two blurs at once. Prove it is doing something rather than assuming - screenshot the chip with the filter on and off and compare, because a frosted panel that is only a pale fill looks convincing and is not glass.
Percentages of a gradient axis do not survive a change of scale. The band at 85-91% that clips the corner of a 400x250 card puts a 60px stripe 700px into the face of a 1450x860 slab, straight through the artwork; the same look wants 93-97% here.
Same trap on the sticker line. White letters held together by nothing but a coloured drop shadow work at 34pt and ghost at 84px, where the outline is too small a fraction of the letter to read - give it a real stroke to do the holding and let the accent do the depth, and loosen the tracking, because a stroke that wide closes the gaps between letters at display tracking.
A chip that hangs into the slab needs somewhere for the headline to start that is not underneath it: add the top padding back at narrow widths.


THE THEME AND THE BAR
Warm grey ground at #ebe9e1, cream cards, near-black ink and ONE yellow at #fde351. Do not reach for an acid yellow here: it is a signal colour, it reads as a highlighter wherever it lands, and any shadow tinted with it turns into a glow. The warmer yellow does the same jobs — fills a button, backs a word, cuts a band — without shouting over the type. Funnel Display throughout, and give the headline its 800 weight at -0.045em, because a humanist sans with a chunky black wants the tracking pulled harder than a neutral grotesk would.
The bar is a black pill floating on the paper, fixed to the top, with a yellow rule running the full width above it. Its relief is a moulding, not a glow: a lit top edge, a dark inner foot, a hard bottom lip and two spreads of neutral cast. The nav links live inside it as pills that fill on hover, and its call to action is a yellow pill inside the black one — the measuring frame that wraps the hero's button belongs on paper, since dashed guides and corner dots simply disappear on black.
Fixing the bar takes the page's top spacing with it. Leave room for the rule, the pill AND anything that hangs off the top of the first block — a glass tab straddling the slab's corner needs its own clearance, and clearing the pill alone drops the tab straight onto it.
One thing to re-check after a palette swap: any button shaded with a flat black overlay. A 25% black over an acid yellow reads as a soft shade; over a warm one it reads as mud. Shade with the theme's own three-stop ramp instead.`,
    preview: "hero",
    variant: "large",
    added: "Sep 22, 2026",
    demo: "/demos/traffo-constellation.html",
    bestFor: ["AI analytics","product analytics SaaS","AI copilots","growth tools"],
    style: ["light","clay","warm-paper","pixel-type","yellow-accent"],
    credits: [
      {
        label: "Button by dexter-st on Uiverse.io",
        href: "https://uiverse.io/",
        note: "The measuring-frame button this page's design system is built from (MIT)",
      },
    ],
    thumbnail: "/thumbs/traffo-constellation.jpg",
    theme: "light",
  },
  {
    title: "SmartCare Clinical AI Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Iridescence shader hero + CSS power switch: one light source for buttons, cards and charts",
    prompt: `Build a single-file HTML landing page for "SmartCare Solutions", a clinical AI platform, whose entire design system is one CSS control: a round power switch that lights up when it is on. Inter Tight from Google Fonts, GSAP 3.12 + ScrollTrigger from a CDN, everything else inline — every illustration, avatar and icon is inline SVG, and no asset is hotlinked.

BUILD THE SWITCH FIRST; EVERYTHING ELSE IS IT, RESIZED
A hidden checkbox, a circular label, an icon inside it.
- Unlit: a dark fill, a 2px grey rim, and \`box-shadow: 0 0 3px rgb(2,2,2) inset\` so the face sits below the surface. The icon's path is filled grey — fill, not stroke, so the glow has something solid to bloom off.
- Lit (\`input:checked + .switch\`): the rim goes white, the fill turns pale teal, and one shadow list does all the work — \`0 0 1px\`, \`0 0 2px\` and \`0 0 10px\` of rgb(151,243,255) inset, then \`0 0 40px\` and \`0 0 100px\` of it outside, then a \`0 0 5px\` rim. The icon gets \`filter: drop-shadow(0 0 5px)\` in the same cyan and a white fill.
- Put the size in a variable so the same control is a 70px power button or a 48px chip.
Then scale that recipe into the pill CTAs: idle keeps the dark inset, and hover, focus-within and a permanent \`is-live\` class all share one lit state built from the same stack. Soften only the two widest blooms to rgba there — at 40px and 100px of solid cyan a 300px pill lights the whole section instead of itself — and on any backdrop-filtered surface drop them entirely, since the filter's own layer clips them.
Because it is CSS, the button has no JS, no runtime and no loading state; the page renders lit with scripting off.

THE HERO'S LIGHT SOURCE
Behind the hero runs an iridescence shader, in plain WebGL in a script tag — no framework, no npm, no ogl. One full-screen triangle, one fragment shader: eight iterations where \`a\` feeds \`d\` and \`d\` feeds \`a\` (\`a += cos(i - d - a * uv.x); d += sin(uv.y * i + a);\`), then the result cosine-folded twice into RGB. That mutual feedback is what makes the bands fold into each other like oil on water instead of drifting in parallel.
Fit it to the page instead of dropping it on top: uColor multiplies the final sweep, so it is the palette knob — set it to the page's indigo (0.42, 0.46, 1.0) and the whole thing lands on this palette. Screen-blend the canvas so the dark board shows through rather than being covered, and mask it to an ellipse so it reads as a glow with an origin rather than a rectangle. The pointer moves the field through uMouse, smoothed at 0.06 — never by transforming the canvas, which would drag the mask along with it. Cap DPR at 1.5, pause when the hero scrolls out or the tab hides, and under reduced motion draw one settled frame and stop. No context: fall back to three blurred radial gradients in the same three hues.

ONE LIGHT, EVERYWHERE (the synthesis)
The shader sweeps cyan → blue → violet → magenta. Name that sweep once as a token and cut everything else from it, so the page has a single light source rather than a background and some accents:
- The confidence bars in the findings panel run the full sweep, starting on the switch's cyan.
- Every clay card carries a 1px hairline of it along its top edge, at zero opacity until hover — the card catches the sheen as you pass.
- The lit switch sits inside a slowly turning conic ring of the same sweep, masked to a 2px annulus: the cyan core stays the signal, the ring is where the signal comes from.
- The button's bloom leaves cyan and lands on violet and magenta at its outer edge, the way the shader's bands do.
- Section numbers are the sweep, background-clipped to the text.

DESIGN SYSTEM (sampled from the artboard, not invented)
- Board #05070e, pill idle #0e1343, pill hover #181f77, idle label #8789a1, hover label #ffffff.
- The two arcs are the only accents: magenta #ff3b7f along the top, electric blue #3d6cff along the bottom, with #7a3bff between them in gradients.
- Surfaces: #0b1030 cards on the board, hairlines rgba(124,146,255,.14/.26), text #eef1ff, muted #8789a1.
- Every raised thing wears the pill's own edge: inset 0 1px 0 rgba(255,255,255,.07), inset 0 -1px 0 rgba(0,0,0,.5), then a deep ambient shadow and, when active, a blue bloom. Radius 999px for controls, 24px for cards.
- Nav pills, cohort tabs, chips and the FAQ signs are all CSS twins of the button: indigo fill, hairline, blue glow when active.

THE BUTTON COMPONENT — the part that takes care
The artboard paints its own near-black board and bakes the word "Button" into the pill, so it cannot be used as-is. Composite it instead:
1. Markup is a wrapper holding a <canvas> and an opaque HTML .face (a real <a>) carrying the label. The face covers the baked pill and its text; the arcs and glow live outside the pill, so they are all that shows.
2. The pill sits at x180 y225, 138x58 in the artboard. Measure the face, then stretch a layout frame past the canvas so exactly that rect lands on it: Fit.Fill, Alignment.TopLeft, with a crop inflated by 14px left/right and 28/22 top/bottom for the arcs. minX = -crop.x * scale, maxX = (500 - crop.x) * scale, same for Y, in drawing-surface pixels (multiply by devicePixelRatio after resizeDrawingSurfaceToCanvas). Size and offset the canvas from that same ratio, so one button component fits any label width.
3. The canvas is mix-blend-mode: screen, which makes the near-black board vanish on a dark page. Two traps, both worth stating: any ancestor that forms a stacking context (a GSAP transform, a z-index: 1 child) limits the blend to that context and the board paints as a grey rectangle — so clearProps the intro transform; and a backdrop-filtered surface isolates blending entirely, so the button in the glass header must be a CSS-only twin that draws the two arcs as glowing 1px lines instead. For the CTA band, put the buttons on a flat panel in the board's own colour, where the canvas rect is invisible whether it blends or not.
4. A global img/svg/canvas { max-width: 100% } will clamp the effect canvas — set max-width: none on it.
5. Give the switch a real job rather than a decorative one: it powers the scan overlay. Off slides the reveal split fully right so only the raw study is left, parks the drag handle and sets aria-disabled on it; on restores the split it was last read at.

HERO
- Sticky glass pill header: blurred surface at 60%, logo mark, pill nav that fills indigo when active, burger + sheet under 900px, and the CSS-twin CTA.
- In its own absolutely-positioned band (not the page, or it drifts into the sections below): two blurred radial glows in magenta and blue, a giant outlined "FUTURE MEDICINE", and a flowing data ribbon of five bezier strands in the arcs' colours with a blurred bloom, a white highlight strand and drifting motes. The strands draw themselves in with stroke-dasharray.
- Headline "AI-POWERED MEDICINE: (three inline-SVG portraits + a glowing DNA pill) REDEFINING HEALTHCARE", each word sliding up out of an overflow-hidden mask, then a CTA row: the lit pill, a ghost twin, and a quiet "No PHI leaves your VPC".
- A 100px badge with text on a circular path spinning at 18s (6s on hover), parked below the title so it never collides with the headline. A right-aligned numbered list with hairline rows and a magenta active dot.

SECTIONS
1. Trust: a masked, paused-on-hover marquee of invented care providers.
2. Numbers: four stats that count up on view (97.4%, 12min, 34%, 6 sites).
3. Capabilities: four cards with indigo icon tiles and a blue bloom on hover.
4. Image analysis — the centrepiece. A dark 16:10 stage holding two inline SVG renderings of the same simulated axial MRI slice: the raw study, and the model's view (blue tint, segmentation grid, attention heat, a dashed lesion contour, a 12.4mm measurement, leader-line callouts, a HUD confidence chip). Reveal the annotated layer with clip-path: inset(0 0 0 var(--split)) driven by a draggable divider — pointer capture anywhere on the stage, plus role="slider" with arrow/Home/End keys and aria-valuetext. Both halves share the same tissue texture so it reads as one image. Beside it, findings whose confidence bars fill on view in the blue→violet→magenta gradient, under "Confidence, not a diagnosis. A clinician signs every report."
5. Predictive analytics: an SVG chart drawn from JS data — grid, uncertainty band, gradient area and line, two dots, a magenta dashed alert threshold — with three cohort tabs that redraw it and re-run the line's stroke-dashoffset draw. Beside it three risk cards with colour-coded scores and the drivers behind each.
6. How it works: three numbered steps on a dashed connector.
7. A pull-quote card with an inline-SVG portrait.
8. Governance: four compliance cards.
9. FAQ: an accordion with rotating plus signs and height-animated panels (height → scrollHeight → auto so it stays responsive).
10. A CTA band with magenta and blue radial washes and the flat button console, then a four-column footer and a legal line.

MOTION
- One GSAP intro: header, glows, ribbon slide and strand draw, motes, outline text, headline words, CTA row, badge, list rows.
- Three nested wrappers on the ribbon — scroll scrub, float loop, pointer parallax — so no two tweens fight over one transform. Same discipline for the badge; pointer parallax only touches axes a float does not own.
- Clay cards tilt ±4° toward the cursor with a lift; the header CTA is magnetic; both skipped on coarse pointers.
- prefers-reduced-motion: reveals without travel, no intro, floats, parallax, tilt or marquee, and the switch and buttons change state without transitions.

DETAILS
- Nav pills follow the section in view via IntersectionObserver with a -45%/-50% root margin.
- .page uses overflow-x: clip — not hidden — so the ribbon can hang off the side without breaking the sticky header.
- Skip link, focus-visible rings, aria-expanded on the burger and accordion, no horizontal scroll at 390px.
- Make the brand fictional and say so: a legal line stating the company, figures, patients and studies are synthetic and not medical advice.`,
    preview: "hero",
    variant: "wide",
    added: "Sep 22, 2026",
    demo: "/demos/smartcare-ai.html",
    bestFor: ["clinical and healthcare AI","medical imaging","regulated enterprise SaaS","risk prediction"],
    style: ["dark","clinical","webgl","iridescent","hud"],
    thumbnail: "/thumbs/smartcare-ai.jpg",
    theme: "dark",
  },
  {
    title: "CRAFT Studio WebGL Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Glass torus knot refracting giant type, scroll-lit statement, Swiss monochrome AI platform site",
    prompt: `Build a single-file HTML landing page for "CRAFT®", an independent design studio in Milano. Use Inter Tight 400–900 from Google Fonts and Three.js 0.170 through an import map from jsDelivr. Everything else is inline.

DESIGN SYSTEM
- Swiss monochrome: paper #e9e9e7, card #f3f3f1, ink #111, mute rgba(17,17,17,.55), hairlines rgba(17,17,17,.14).
- The ONLY accent is a "prism" gradient (#ff3b3b → #ffb000 → #2fd27a → #1e90ff → #a24bff), echoing the glass knot's dispersion. Use it sparingly: key words, one ring, hover states.
- Type: 900-weight uppercase display at clamp(56px, 12vw, 220px) with -0.045em tracking and 0.84 leading; 600-weight statements; 12–13px uppercase labels at 0.04–0.06em tracking.
- Numbered section labels "(01) Studio"; hairline borders; cubic-bezier(.7,0,.2,1) everywhere.

HERO (WebGL)
- A fixed full-viewport canvas. The headline "DIGITAL / DESIGN / EXPERIENCE" is drawn into a 2D canvas as a CanvasTexture on a plane that exactly fills the view, each line scaled to 92% of the width. Keep the real <h1> screen-reader-only.
- In front floats a TorusKnot in MeshPhysicalMaterial: transmission 1, roughness 0, thickness 0.7, ior 1.45, dispersion 4, with a PMREM RoomEnvironment. It rotates over time and tilts toward the pointer.
- Wait for document.fonts.load('900 100px "Inter Tight"') before drawing; fonts.ready alone resolves instantly.
- Scrolling through the hero swells the knot toward the camera, adds rotation, and drifts and fades the type.
- Render only while the hero is visible (IntersectionObserver + setAnimationLoop).
- If WebGL fails, reveal an HTML fallback headline.
- Nav: white text with mix-blend-mode: difference, so it reads as ink on light sections and paper on dark ones. A "Milano — 2026 / Scroll to explore" meta bar with an animated drip line fades out on scroll.

SECTIONS (opaque, sliding up over the fixed scene like a curtain)
1. Studio: a large statement split into word spans that light up from 14% to full opacity as the paragraph scrolls through the viewport; key words in prism gradient text.
2. Capabilities: numbered rows (Brand Systems, Digital Product, Motion & 3D, Creative Dev) with huge uppercase titles. On hover an ink panel wipes up from the bottom, the text inverts, the title nudges right and the arrow rotates.
3. Selected work: an asymmetric 12-column grid of four projects with procedural CSS covers:
   - an outlined giant letter sized with container units, plus a spinning conic prism ring;
   - a dot grid with a matte sphere;
   - diagonal stripes with a wordmark band;
   - an orbit ring with a drifting prism orb.
   Covers zoom on hover, with hairline meta rows. A difference-blended custom cursor grows into a "VIEW" disc over projects and re-checks what's under it on scroll.
4. Numbers (dark section): four huge counters that ease up on view, a big client quote, and a marquee of client wordmarks in mixed weights.
5. Contact: "LET'S MAKE IT" display type, a large email link with a prism hover, and a brief form with underline fields, budget pills and a round 128px "Send brief" button that fills with the prism on hover. Validate inline and show a success message; send nothing.
6. Footer: address, a live Milano clock (Intl, Europe/Rome, with timeZoneName so it shows CET/CEST correctly), socials, back to top, and a viewport-wide CRAFT® wordmark.

RESPONSIVE + A11Y
At 900px grids collapse to one column and the services rows reflow. At 640px, 22px gutters and no horizontal overflow. Respect prefers-reduced-motion: static knot, no word dimming, no marquee.`,
    preview: "hero",
    variant: "large",
    added: "Sep 22, 2026",
    demo: "/demos/craft-studio.html",
    bestFor: ["AI platforms","agent and RAG infrastructure","premium SaaS launches","design-forward tech brands"],
    style: ["light","swiss","monochrome","webgl","glass","three.js"],
    thumbnail: "/thumbs/craft-studio.jpg",
    theme: "light",
  },
  {
    title: "Launch Form Onboarding Flow",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    sectionOnly: true,
    categoryLabel: "PRODUCT",
    description: "100vh sign-up + onboarding web component that ends with a rocket publish button",
    prompt: `Build <launch-form>, a full-viewport (100dvh) sign-up and onboarding flow for "Orbit", a publishing product. Make it a custom element with Shadow DOM and no framework, in a single HTML file whose page holds nothing but the element. No dependencies at all: every graphic is inline SVG or CSS, so the file is the component.

STRUCTURE (after the classic sliding sign-in/sign-up panel)
- Two opaque 50% panes, Sign up (left) and Log in (right), under a starfield overlay half. The overlay slides across by translating its wrap, its 200%-wide inner and both panels, with the 0→49.99% / 50% z-index "show" keyframe. Mark the hidden pane inert.
- Overlay: a blue→indigo gradient, a twinkling CSS starfield, a glowing planet and a slowly rotating dashed orbit, both following the overlay side. "Already launched? Log in" / "New to Orbit? Create an account" with ghost buttons.
- After sign-up, the overlay's copy becomes a live PREVIEW: a floating glass browser card showing the URL, a DRAFT/LIVE badge, a cover and avatar in the theme color, the publication name and tagline, topic chips, and skeleton posts. It updates on every keystroke, with a per-step caption above it.
- Under 860px: one column with a gradient band on top (brand + step caption), one pane at a time, inline "Already have an account? Log in" links, and no overlay.

FLOW (stepper: Account · Publication · Style · Launch, with "Step n of 4")
0. Create account: name, email, password with a show/hide toggle and a 4-bar strength meter. The CTA shows a spinner; on success it prefills "{First}'s Notes".
1. Publication: name → auto-subdomain (stops syncing once edited, sanitised as you type) with a measured ".orbit.pub" suffix (ResizeObserver, since the webfont changes its width). Add an optional tagline with a counter.
2. Style: four theme cards (Nebula, Aurora, Supernova, Eclipse) that recolor the preview, and topic chips requiring 1–3 (the rest disable at 3).
3. Launch: a review list, then the Publish button.
4. "You're live" with the URL and "Open your dashboard". The preview badge flips to a pulsing LIVE and stars burst out of the card.
Log in: email + password, "Forgot password?" (asks for the email first, then a polite notice), and a "Welcome back" state.
Back buttons keep data. Steps slide in from the direction of travel. The header, stepper and step are vertically centred as one block. Focus moves to each step's first field.

THE PUBLISH BUTTON
A blue pill holding an inline SVG rocket and the word Publish, with four phases written to data-phase on the button: idle, launch, wait, done. Give it a tiny controller class with launch(), settle() and reset(), and a callback that reports each phase, so the publish flow talks to the button instead of to an animation timeline.
- idle: the rocket sits beside the label and nudges up-right 2px on hover and focus-visible. That is a CSS transition, not a state input.
- launch: the rocket flies out of the pill (translate 62px, -58px, scaling to 0.7 and fading, 520ms on an ease-in curve), the label drops away, an exhaust streak trails behind it and three white sparks scatter on their own delays.
- wait: reached 520ms after launch. The button HOLDS here on a centred spinner for as long as the request takes, however long that is. This is the point of the whole design: the animation is never allowed to promise a result the network has not delivered.
- done: only once the request has actually resolved. A check mark springs in, then the button returns to idle after 900ms.
If the request resolves before the rocket has finished leaving, the button reports success itself when it lands on wait. On failure, reset() puts it straight back to idle with the rocket restored, so the user can retry immediately.
Under prefers-reduced-motion keep all four phases but stop the flying: the face just goes, the spinner holds, the check lands.

DESIGN SYSTEM (sampled from the button)
Indigo #0b0724, surface #120c33, field #0d0829, electric blue #1c86fa with a #3dacff 1px highlight, text #eef0ff, muted #9b95c9, Inter + JetBrains Mono. Button radius = 0.2 × height. Floating-label fields with inset shadows and a blue focus glow. The CTA buttons and the publish button share one pill treatment, with star specks on hover.

API
Attributes: mode="signup|login", domain, simulate="normal|slow|fail". Events (bubbling, composed): launch-form:signup, launch-form:login and launch-form:publish, where detail is { data, respondWith(promise) } so the host supplies real requests; plus launch-form:step, launch-form:modechange and launch-form:complete. Add inline errors with aria-invalid, role=alert banners with a shake, a polite status live region, and prefers-reduced-motion support.`,
    preview: "form",
    variant: "large",
    added: "Sep 21, 2026",
    demo: "/demos/launch-form.html",
    bestFor: ["sign-up and onboarding flows","creator platforms","SaaS account creation","web component libraries"],
    style: ["dark","space","web-component","form","gradient"],
    thumbnail: "/thumbs/launch-form.jpg",
    theme: "dark",
  },
  {
    title: "Canvas Fire Button",
    category: "motion",
    categoryLabel: "MOTION",
    description: "Procedural canvas flame toggle with embers, hold-to-supercharge and a live playground",
    prompt: `Build a premium, playful "Fire Button" toggle component as a single HTML file, plus a showcase page for it. No dependencies and no animation runtime: the flame is drawn procedurally on a 2D canvas, every frame, from the button's own state. Palette: #070410 ground, #0e0b18 raised, #151126 and #1d1630 lifted, with flame stops #ffd36b, #ff9a2e, #ff5a1f, #c2260f.

THE COMPONENT
- Declarative markup: <button class="fb" data-size="sm|md|lg|xl" data-off="Ignite" data-on="On fire" data-variant="icon" data-surface="light" aria-pressed="false">. FireButton.upgradeAll() builds the inside.
- Anatomy: a glass pill body (layered inset highlights, deep drop shadow) with a recessed circular socket holding the flame canvas, and a two-word label that slides between states. The on-state label is gradient text with a moving shimmer.
- The flame canvas is deliberately much bigger than the socket (260% wide, 440% tall, offset left -80% and bottom -20%) so a lit flame towers out of the socket instead of being clipped by it.
- Size the backing store from the socket's measured width, and measure it in a ResizeObserver rather than in the frame loop: reading offsetWidth per frame forces a reflow per button per frame.

THE FLAME (the whole trick)
Draw it in layers, bottom up, every frame from four numbers - lit, hover, charge and a heat multiplier:
- A slate-blue root that is all you see when the button is off, so an unlit button still reads as a pilot light rather than a dead icon.
- Four side tongues, each licking on its own sine rhythm, then red to orange to gold teardrops, each with its own shadowBlur glow. One bezier helper draws every teardrop: two symmetric curves from a base point to a tip, with a lean term that shifts the tip.
- A stream of additive particles indexed by frame number and run through a hash, so the stream is stable rather than random per frame, with a few wisps that break off past the tip.
- A white-hot core at the base.
Everything wobbles on layered sines at different frequencies seeded per button, so no two buttons flicker in step. Under prefers-reduced-motion freeze the time input entirely: the flame still grows and shrinks with state, because that is feedback, but it stops flickering.
- On state: a warm body tint, a breathing radial heat glow, and a spinning conic "heat ring" border (@property --angle, masked to a 2px outline).
- Magnetic hover pull via a translate on the body; press squash via the individual scale property with a spring easing.

INTERACTIONS
- Tap toggles through the click event, so assistive tech works. Holding past 250ms charges an SVG ring around the socket (pathLength=1 dashoffset); completing it in 900ms fires supercharge(). Releasing early cancels without toggling.
- Space and Enter are handled on keydown/keyup so holding either charges too.
- Ignite: an ember burst, an expanding shockwave outline, an optional haptic pulse and an optional synthesized whoosh plus crackle (Web Audio noise through a swept bandpass; off by default).
- Extinguish: a puff of smoke.
- Supercharge: a 2× burst, a wiggle, and a full-screen scorch flash.
- Emit firebutton:change {on}, firebutton:supercharge and firebutton:input {name, value}.

EMBER ENGINE
One fixed full-viewport canvas shared by every button, DPR-aware (set its CSS size to 100%). Particles rise and sway with additive blending. Pre-render one soft radial-gradient glow sprite per color instead of flat circles. Cap at 700 particles and sleep the loop when empty. Lit, visible buttons trickle ambient embers. Stop drawing offscreen buttons with an IntersectionObserver, and skip the full-viewport clear entirely when no particles are alive, so an idle page does no per-frame work. Honour prefers-reduced-motion.

SHOWCASE PAGE (dark, Bricolage Grotesque + Instrument Serif italic accents + JetBrains Mono labels)
1. Sticky top bar: brand, breadcrumb, version tag, section links.
2. Hero: "Buttons that feel alive." with hint chips, live counters (ignitions, supercharges) and a decaying heat meter. Beside it, a stage card with an XL button, live ON/Hover input chips, and playground controls: size, label set, dark/light surface, ember and sound switches, and a heat-intensity slider that scales glow and particle counts.
3. Variants: primary; icon-only in three sizes; light surface (the cream body keeps a dark socket); and a habit streak tracker that lights today's day when the button fires.
4. Anatomy: three cards covering the state machine, tap vs. hold, and the ember engine.
5. Usage: a syntax-highlighted snippet with a copy button, and attribute/method/event reference cards.
6. A closing "Go on, set it off." CTA with one more button.`,
    preview: "buttons",
    variant: "large",
    added: "Sep 21, 2026",
    demo: "/demos/fire-button.html",
    bestFor: ["playful CTAs and toggles","gamified streak UIs","component showcases","launch buttons"],
    style: ["dark","canvas","particles","glass","playful"],
    credits: [
      {
        label: "Fire Button — Rive Marketplace",
        href: "https://rive.app/marketplace/3703-7734-fire-button/",
        note: "The community .riv the first version of this component was built around; the flame here is drawn in code instead",
      },
    ],
    thumbnail: "/thumbs/fire-button.jpg",
    theme: "dark",
  },
  {
    title: "Monax Analytics Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Dithered WebGL halftone panels, glossy 3D orbs, tabbed product demo, bento + pricing",
    prompt: `Build a single-file HTML landing page for "Monax", an analytics platform for business teams. Inter 300–900 from Google Fonts, GSAP 3.12 + ScrollTrigger from CDN, everything else inline. Every visual is CSS, inline SVG or a WebGL shader, so the page fetches no image assets at all — draw the avatars too, as gradient discs with an inline person glyph.

DESIGN SYSTEM
- Warm paper palette: --bg #efede8, --bg-2 #e5e2da, --ink #0d0d10, --ink-soft #2a2a2d, --mute #8a8780, --line #dad6c9, --green #bfd58f, --green-dark #5c7838. Body is a radial gradient from #f4f1ec to #dfdbcf, with a fixed SVG fractal-noise grain overlay at 5% opacity, multiply blend.
- Depth comes from layered shadows: a long soft drop, a tight contact shadow, a 1px inset top highlight and an inset bottom shade. Keep them as tokens (--shadow-card, --shadow-soft, --shadow-pill, --shadow-dark).
- "Glossy orbs" are the illustration language: radial-gradient spheres (coral, green, purple, blue, sand, red, gold) with a white highlight at 30% 25% via ::after.
- Type: 800-weight headlines with -0.03 to -0.045em tracking; small uppercase eyebrows at 0.28em tracking with a green dot; uppercase underlined "read more" links.
- Black pill buttons with inset highlights; 26–28px card radii; cubic-bezier(0.6, 0, 0.2, 1) hover lifts.

SECTIONS
1. Fixed blurred nav: wordmark, centered links with chevrons (anchors to sections), a black "Contact us" pill.
2. Hero: a 3-line 8vw headline, "Business Teams / Around / Analytical Work". Each word sits in an overflow-hidden mask and slides up from 105%. Line 2 has a dithered pill image before the word and a green "Behind every great idea" pill with a spinning glossy leaf after it.
3. Fanned card stack, directly under the headline and the centrepiece of the page. Eight cards of different sizes sit on a stage as absolutely positioned slots, each carrying its own --w, --h, --y, --z plus data-rot and data-depth, overlapping like a hand of cards held out: a coral "Freshness / Live" chip, a green "$4.2M Revenue" KPI, a dark "Connect / 6 sources synced" card holding the holographic M hub, a gold "Regions / EMEA up 32%" bar card, a tall dithered "Live dashboard / 3 viewing" panel, a blue "2.3% Churn" donut, a sand "Ask Monax / answered in 0.8s" card with a question bubble and an avatar row, and a red "Alerts / 3 new today" card. Behind the whole stack the words "real answers" sit as huge letterspaced ghost type. A "Try for free" pill closes the section.
4. Logo marquee of text wordmarks in mixed weights with small glossy orbs, CSS loop, edge mask.
5. Product demo: a tablist (Connect / Ask / Share) beside a mock app window. Connect shows 6 source chips wired to a pulsing "M" hub with animated dashed SVG lines. Ask shows a chat question, an AI answer and 4 bars that grow. Share shows KPI tiles and an area line chart revealed with a clip-path wipe, plus live viewer avatars. Tabs auto-advance every 6s with a progress bar, pause on hover or offscreen, and stop for good once the user picks one. Arrow keys work.
6. Bento: a dark 2×2 tile with an isometric stack of three glossy slabs (Sources / Models / Metrics) that slowly rotates and fans apart on hover (GSAP tweening CSS variables); a 200+ connector counter; "Governed by default" with a lock tile; and a Slack-style alert feed that reorders itself every few seconds with a manual FLIP animation.
7. Customer stories: a holographic art panel beside a quote card with author, metric chip, a 01 / 03 counter and prev/next round buttons. Moving slides swaps the panel's glyph to the new company's initial behind a quick scale-out / back.out scale-in.
8. Pricing: Starter / Team (dark, "Most popular") / Enterprise, with a monthly/annual switch that tweens the price 49 → 39 and green check bullets.
9. Resources: 3 cards whose thumbnails are small holographic scenes - a stepped stack, a question glyph, a talk bubble with a waveform - that zoom on hover.
10. Footer with a newsletter input pill, 4 link columns, a giant fading wordmark, the fictional-product disclaimer and a live "All systems normal" status.

DITHERED FIELD (a material, not a background)
The page background stays the paper gradient. What gets replaced is the fill of three surfaces: the pill image inline in the headline, the tall "Live dashboard" card in the fan, and the sand "Ask Monax" card next to it. Each one gets a WebGL canvas laid into it, written in plain WebGL in a script tag -- no framework, no npm, no ogl. One full-screen triangle, one fragment shader, driven per element by data attributes (data-fx-ink, data-fx-paper, data-fx-coverage, data-fx-scale, data-fx-density):
- Rotated fbm noise drives a dot grid; each cell prints a 5x5 dot whose radius falls off from its center, so the field reads as a printed halftone rather than pixels. Add a scanline bar, a rare horizontal glitch displacement, a flicker term and a slight barrel curvature.
- Do not tint it one color. Mix four inks along a slow diagonal that drifts with time, taken from the gradient that element used to have -- violet #8163c6, amber #f2a03b, red #e83a4d and blue #7bafce on the headline pill and the dashboard card, over paper #f2ece0 / #e8e0ce / #c8b89e; tan #c99368, gold #e0a82e, umber #8a7050 and cream #f8d6a6 on the sand card. Give each host its own coverage and density through data-fx-coverage and data-fx-density, so the small inline pill prints coarser than the card it sits beside. Print them onto that element's own base gradient, rebuilt in shader, and dither last in paper space so the banding goes with the dot edges.
- Compute the cell grid from the element's aspect (aspect x 15 columns, 15 rows) so dots stay square in a wide card and a tall one alike. The pointer nudges intensity through an exponential falloff with a ripple, smoothed at 0.08.
Wiring: the canvas is the host's first child at z-index -1, and the host gets position relative plus isolation isolate -- that gives it a stacking context of its own, so the layer sits above the element's background and below its ::before/::after gloss and every child, spheres and orbs included, with no way to escape behind the section. The element keeps its CSS gradient, which is then the automatic fallback when WebGL is missing or the shader fails to compile. Cap DPR at 1.5, skip offscreen panels with an IntersectionObserver, skip frames while document.hidden, and under prefers-reduced-motion render a fully formed field at a fixed time then stop.

HOLOGRAPHIC SCENES (the other material)
Where the dithered field is print, this is glass. One recipe, reused three times: a dark rounded panel, a 1px green outline, and a glyph drawn three times at different depths -- a back, a mid and a front layer sharing a --gap that sets how far apart they sit in Z, each outlined with -webkit-text-stroke and filled with a clipped gradient rather than a solid color, the whole group on a slow CSS wobble in 3D. It fills the "Connect" card in the fan (an M), the customer-stories art panel (the current company's initial), and the three resource thumbnails (a stepped stack, a question mark, a talk bubble with a waveform). Hovering the bento's layers tile tweens --gap from 36px out to 64px on back.out and back on elastic.out, so the depth spreads under the pointer.

MOTION
- Intro timeline: nav drops, words slide up line by line, pills pop with back.out. Then the ghost letters rise and the fan cards drop in from above, centre card first and outward, and only once every card has landed does the idle float start - otherwise the drop and the float fight over the same transform.
- Infinite sine yoyo bobs on the pills and the fan cards; mouse parallax on the fan slots through the CSS translate property, kept off GSAP's transform so the two never collide; hovering a card tilts its face toward the pointer and lifts it above its neighbours; on scroll the outer cards fan further out, the ghost phrase swells and fades, and the headline letters spread slightly.
- Sections reveal with ScrollTrigger.batch (y 40 → 0, once) using clearProps: "transform" so CSS hover lifts keep working. Never put two ScrollTriggered tweens on the same element's transform, and give scroll-driven sphere motion yPercent so it doesn't fight the y bob.

RESPONSIVE
At 1000px columns stack and the bento goes to 2 columns. At 700px everything is 1 column, the headline lines wrap, nav links hide, and there's no horizontal overflow. Respect prefers-reduced-motion.`,
    preview: "hero",
    variant: "large",
    added: "Sep 21, 2026",
    demo: "/demos/monax-analytics.html",
    bestFor: ["analytics SaaS","BI and data platforms","B2B dashboards","data team tools"],
    style: ["light","warm-paper","3d-orbs","webgl","bento"],
    thumbnail: "/thumbs/monax-analytics.jpg",
    theme: "light",
  },
  {
    title: "Clay SaaS Platform Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Liquid-glass agent platform with a three-theme switcher, dark terminal cards and circuit-trace module graphics",
    prompt: `Build a single-file HTML landing page for a developer platform — a dermatology imaging API — in a soft 3D "clay" / neumorphic style. Inter and JetBrains Mono from Google Fonts, GSAP 3.12 + ScrollTrigger from CDN, everything else inline. No image files at all: every visual is CSS or inline SVG.

DESIGN SYSTEM
- Palette: #e6e9ee page gray, #ffffff panel, #0e1116 text, #667085 muted, #0a0d12 clay dark, #f0f2f5 clay light, and one electric accent defined as a hue token (--accent-hue: 214deg) so buttons, meters, chips and glows all resolve from it. Alternate gray and white sections.
- Four shadow tokens as CSS variables: --shadow-light, --shadow-dark, --shadow-orange (the accent one), --shadow-glass. Each combines an outer drop shadow, an opposite-corner highlight and two inset highlights. Inset-well surfaces use only the inset pair.
- Type: headlines weight 500, clamp(32px, 4vw, 56px), -2px tracking, 1.05 line-height, second line in muted gray. Mono for every number, version, endpoint and label. Section labels are a 6px dot + 13px semibold text.
- Shapes: 24–40px radii, springy cubic-bezier(0.175, 0.885, 0.32, 1.275) hover lifts.
- "Element tiles": 36px rounded squares with a two-letter symbol (Img, Seg, Cls, Fhr…) and a tiny index in the corner, like a periodic table — used for capabilities and SDKs.

THE BUTTON (the page's anchor; build this first and let it set the accent)
A glossy dark pill that looks lit from inside, adapted from the Uiverse button by dexter-st.
- Structure: a relative, isolated .btn-wrapper holding the button, an inline sparkles SVG, and a label wrapper with two absolutely positioned labels — the idle one ("Generate") and the busy one ("Generating").
- The face is #10141b with five stacked inset white highlights (1/2/4/8/16px, falling opacity) and five upward black drop shadows at the same scale. 1px #fff2 border, 24px radius.
- ::before is a plate inset -4px behind it at z-index -1 carrying a 0deg #0004→#000a gradient and the hover/active glow; ::after is a sheen gradient from #fff through hsl(hue,100%,70%) to transparent, opacity 0 at rest. The wrapper MUST isolate, or that -1 plate slips behind whatever card the button sits on.
- Every letter is its own span, animated by a 2s flicker with an 0.08s delay per letter, so the label shimmers. Split the label in JS from plain text rather than shipping spans, so the label is still readable if the script never runs — and do not put word-spacing: -1em on the label, or multi-word labels run together.
- On focus (and on a click-applied .is-busy class, because iOS does not focus buttons on tap) the labels swap, the letters blur and scale once, the plate lights with the accent and the sheen comes up to 0.6. Hover lights the border and the icon; active drives all of it to full.
- Everything else on the page takes its accent from the same hue token.

SECTIONS
1. Fixed header with mix-blend-mode: exclusion so it inverts over light and dark sections: logo + wordmark, 6 centered nav links that smooth-scroll, a mono version readout, pill MENU button. Nothing glassy in here — the blend mode turns a frosted pill inside out and a green dot magenta.
2. Hero (100vh), two columns: left is just the three-line headline, whose last line is the accent, and the generate button beside a frosted ghost button. No status pill, no version and compliance row, no spec chips - the console on the right already carries the numbers, and a second set under the copy only reads as filler. Right is a "console": a dark slab with three window dots, a mono endpoint + latency, a syntax-coloured curl block, and three result tiles with accent meters. Behind it all, a 26vw background wordmark clipped to a white-to-transparent gradient.
3. About panel: white, 40px top radii, pulled up 30px over the hero; faint CSS wireframe globe; statement headline + social row; four giant 120px clay pills (white / accent / black arrow / inset gray) reading Ship · In · → · Days.
4. SDK marquee: two duplicated tracks of clay chips (element tile + language) scrolling infinitely in pure CSS, edge-faded with mask-image, paused on hover.
5. Modules: 4 cards on clay-light with inset "stage" wells holding CSS-drawn matte-black module slabs tilted a few degrees — an accent rail, a mono name, a face with two progress bars and a row of pins. Each card has a category badge, name, capability element tiles, a mono version line and a round "+" that toggles to an accent ✓ and flips its aria-label between Enable and Disable.
6. How it works: 4 numbered step cards with dark clay icon tiles (last one accent) under a thin track whose accent fill scrubs with scroll; then a dark clay stats panel with an accent radial glow and counters that count up (uptime stays static text, since a percentage does not count).
7. Pipelines: accessible tablist of glass pills (active = dark clay, arrow-key navigation) for 5 workloads. The panel shows a white summary card (accent kicker, big title, description, module chips) beside inset rows for IN, RUN and OUT — each an endpoint, a service and a one-line note. Switching crossfades with GSAP. Add a note that it is illustrative and the product is fictional.
8. Customers: 3 quote cards, the middle one dark clay and offset 40px down, each led by a mono metric chip rather than stars.
9. Developer FAQ: sticky intro with the generate button beside an accordion of white clay rows; the + icon rotates into a dark ×, and answers expand with a grid-template-rows 0fr→1fr transition. One open at a time. Ask the questions engineers actually ask: auth, rate limits, data residency, self-hosting, SLA.
10. Sandbox CTA: dark clay card with an accent glow and a frosted form (work email + pipeline select, inset dark fields) submitting with the same generate button. Validate natively, latch the button into its busy state, show a success line; send nothing.
11. Footer: gray panel with 40px top radii overlapping the section above; brand, three link columns, a giant gradient wordmark sized to fit the viewport, and a legal bar with the current year.

MOTION (GSAP)
- Hero entrance timeline: nav drops in, wordmark scales up from 0.9, the console rises 100px, hero copy staggers in from the left.
- Press Start 2P is a full-width face, so a headline in it sets its own measure: size the hero column to whatever the longest authored line needs, or the line wraps and three become four. On a phone the clamp floor is the trap - a fixed floor that fits a 390 screen runs off a 360 one, so below 420px track the viewport instead and pick the coefficient so it meets the floor at the breakpoint and there is no step.
- Continuous yoyo sine.inOut floats on the pills and module slabs. Never put a float and a scrubbed parallax on the same element's y — they fight over the transform and the element ends up dozens of pixels off.
- Parallax: wordmark -150px, console +50px / scale 0.95, both scrubbed.
- Every later section uses ScrollTrigger.batch reveals (y 40 → 0, stagger 0.12, once) with clearProps: "transform". A \`once\` batch only fires for elements that cross its start while you watch, so arriving mid-page by anchor or restored scroll leaves whole sections at opacity 0 — reveal anything already on screen outright, and re-check on ScrollTrigger's refresh and scrollEnd events.

RESPONSIVE
At 1100px the hero stacks and drops its fixed height. At 1024px grids go to 2 columns, section heads stack, the header drops its blend mode for a solid blurred bar, and the center nav hides. At 760px the header's version readout hides. At 640px everything is 1 column with 20px gutters and no horizontal overflow.`,
    preview: "clay-hero",
    variant: "large",
    added: "Sep 21, 2026",
    credits: [
      {
        label: "Uiverse — generate button by dexter-st",
        href: "https://uiverse.io/",
        note: "The glossy button the page's accent and lighting are built from.",
      },
    ],
    demo: "/demos/dermexcel-clay-hero.html",
    bestFor: ["AI agent platforms","developer APIs","SaaS control planes","workflow automation","B2B infrastructure"],
    style: ["light","clay","neumorphic","soft-ui","pastel","theme-switcher"],
    thumbnail: "/thumbs/clay-pharma-landing-hero.jpg",
    theme: "light",
  },
  {
    title: "Skewed Marquee Wall",
    category: "web",
    categoryLabel: "WEB",
    description: "Skewed marquee lanes of agent runs behind a working run console, with approval gates and a fleet kill switch",
    prompt: `Build a single-file HTML template called "SKEWSHOP": infinite marquee bands with no JavaScript in the animation, thrown by one physical-looking spin button. The button is a Rive artboard, inlined as base64, loaded from @rive-app/canvas on jsDelivr. Inter Tight and JetBrains Mono from Google Fonts. Every poster is inline SVG — nothing is fetched.

PROBE THE BUTTON FIRST
Artboard "BUTTON" 1280x720, state machine "State Machine BTN", three booleans:
- hover → glow_hover_in, arrow_hover_in. The dome only lights while hovered; at rest it is dim.
- click → button_down, click_on.
- SPIN/STOP → swaps the readout plate between "PRESS TO SPIN" (green) and "PRESS TO STOP" (red), and decides which colour the hover glow is. Green means pressing will start it; red means pressing will stop it.
Three rules come out of the file, and all three are load-bearing:
1. **Pulse click, never hold it.** Holding it true leaves the machine transitioning forever and the page stops answering entirely. Set it, clear it ~120ms later.
2. **Drop hover for the duration of that pulse.** With hover true AND click flipping, the HOVER_ARROW layer cycles and the runtime logs "exceeded max iterations" every frame — about fifty per press. Clear hover, pulse, restore it a beat later if the pointer is still there.
3. **Do not touch SPIN/STOP until the artboard's intro has played** (~1.6s). It opens by playing its readout plate in; interrupt that and the TXT layer strands mid-morph and the plate renders as a bare line.

DESIGN SYSTEM (sampled from that artboard, not invented)
Panel #3f4346 → #4f5256 with a #c3ccd5 light spill at the top and a #242527 deck below — the page is the machine the button is mounted in, so the body carries that same gradient down the document. Chrome #8a9095, shadowed #5b5f63, highlight #dbdfe3. Dome green #79ec54 lit, #849d8d at rest; red #ff7b81 with an #ec9b54 core while running. Readout plate #282b2c behind a 2px chrome border. One bevel token — inset 0 1px 0 rgba(255,255,255,.22), inset 0 -2px 3px rgba(0,0,0,.55) — is reused by every raised part: chips, buttons, cards, the console frame. Inter Tight for text, JetBrains Mono for anything that reads like a readout.

THE RAIL (unchanged engine, new skin)
- A \`.marquee\` is a flex row, \`overflow: hidden\`, \`gap: var(--gap)\`, holding TWO identical \`.marquee__group\` children: \`flex-shrink: 0\`, \`min-width: 100%\`, \`justify-content: space-around\`, each running \`animation: scroll var(--duration) linear infinite\`.
- The keyframe ends at \`translateX(calc(-100% - var(--gap)))\`, NOT \`-100%\`. Miss the gap and the strip jumps one gap every cycle.
- Mark the duplicate group \`aria-hidden="true"\`. Put \`will-change: transform\` on the group, not its children. Pause on \`:hover\` AND \`:focus-within\`. Reverse is the same keyframe with \`animation-direction: reverse\` and \`animation-delay: calc(var(--duration) / -2)\`. Mask both edges.
- A vertical rail is the same thing with \`flex-direction: column\`, \`translateY\`, and an explicit height on the rail — without a height the group has nothing to be 100% of, travels zero pixels, and fails silently.

STRUCTURE
1. Sticky blurred bar: wordmark with a dome that takes the running colour, four anchors, and a live "REELS SPINNING / STOPPED" readout plate with role="status".
2. Hero, full-bleed and at least a screen tall, in three layers. **The reels go BEHIND it** — three skewed bands (posters, a monospace readout band, posters reversed) absolutely positioned and overscanned by ~8% so the skew never shows a corner, at 0.62 opacity. Then a scrim: a radial darkening centred behind the type plus a vertical pair, so white text sits on moving posters comfortably. Then the content. The reels layer is decoration — aria-hidden and pointer-events: none, so it never eats a click or a caret.
3. On top: a two-row headline set in blocks rather than split by a <br>, so each row owns its colour and neither can rewrap into the other — PRESS IT in the ink, EVERYTHING SPINS in the system's red, the same one the spinning state uses. No eyebrow above it. Size it off a clamp whose cap carries the display size and whose slope is steep enough that the longer row still lands on one line at 390px; measure the row heights rather than trusting it. Then the console — the Rive canvas in a chrome deck (16:9), with a transparent round <button> sitting exactly over the dome (x 40.7–59.3%, y 19.7–60.7% of the artboard, measured from a render). That button owns hit-testing and keyboard access, so set shouldDisableRiveListeners. Under it, a lamp and a "Rive · State Machine BTN" caption.
4. Pressing it toggles ONE class on <body> and every rail on the page obeys. This is the whole point of the layout: the thing the button controls is already on screen when you press it, so the press has a visible consequence without scrolling. Stopped reels also drop to 0.4 opacity and desaturate, which makes the state legible even in a still frame. The page loads with the reels running, so the plate reads "press to stop".
5. "Six things this rail can be": the callout naming the \`-100% - gap\` trap, then six cards that are panels off the same machine. Each carries a CSS rebuild of the button — chrome bezel, glass dome, a specular cap, the spin glyph — and a readout plate for its label. Give them the button's rule, not its job: **dim at rest, lit only when reached for.** On hover the glass goes from #62796a to the dome's green, a glow blooms under it, the glyph turns 38°, the plate's lamp lights, and the card lifts 4px while a specular pass crosses the chrome. None of it does anything — it is material, shared, so the cards and the button read as parts of one object.
6. A vertical rail section with the height warning, a closing band skewed the other way, and a short footer. The hero's rails are decoration; the vertical rail keeps its hover-pause so the behaviour stays demonstrable.

FALLBACKS AND DETAIL
- Rive is the skin, not the logic. Behind the canvas sits a CSS dome and plate built from the same tokens; the page works with the class toggle alone, and under prefers-reduced-motion Rive never loads and every rail is paused rather than hidden.
- Load the runtime lazily on an IntersectionObserver, and resize the drawing surface on window resize.
- \`overflow-x: clip\` on the body — not \`hidden\` — so skewed bands overhang without a scrollbar and the sticky bar still sticks. Do not use \`background-attachment: fixed\` for the panel gradient; iOS treats it as scroll and it leaves everything outside the viewport unpainted.
- Skip link, focus-visible rings, aria-pressed on the console button with an sr-only label that says what the press will do, role="group" on the segmented control, no horizontal scroll at 390px.`,
    preview: "marquee",
    variant: "wide",
    added: "Sep 22, 2026",
    demo: "/demos/marquee-wall.html",
    bestFor: ["AI agents for operations","e-commerce automation","agent orchestration","back-office SaaS"],
    style: ["dark","industrial","pixel-type","marquee","terminal"],
    thumbnail: "/thumbs/marquee-wall.jpg",
    theme: "dark",
  },
  {
    title: "Infinite Logo Marquee",
    category: "motion",
    categoryLabel: "MOTION",
    description: "Seamless CSS-only scrolling brand strip",
    prompt:
      "Create an infinite horizontal marquee of company logos using pure CSS keyframes (no JS). Duplicate the logo list, translateX from 0 to -50% in a seamless loop, pause on hover. Logos in grayscale, fading mask on both edges. 40px gap, 30s duration, respects prefers-reduced-motion.",
    preview: "marquee",
    variant: "wide",
    added: "Sep 18, 2026",
  },
  {
    title: "Programmatic Video — Captions On A CRT",
    category: "motion",
    categoryLabel: "MOTION",
    description: "A video with no video file: every frame is a pure function of t, sliced type burning on a phosphor tube",
    prompt: `Build a video composition that has no video file — a program you render by asking it for frames. Three.js (r166) through an import map, WebGL shaders, no build step. The piece: speech, drawn as contour sections, burning on a CRT in a dark room.

THE ONE RULE
The composition is a pure function of time. \`seek(t)\` draws the frame at t seconds and depends on nothing but t — not on which frame was drawn before it, not on a clock, not on elapsed wall time. Everything below follows from that, and it is what lets any frame render on its own, in any order, in parallel, on any machine.

API
Export \`createScene({ width, height, container, captions, duration })\` returning \`{ duration, width, height, canvas, seek(t) }\`. Captions are \`{ text, start, end }\` in seconds; duration defaults to the last caption's end plus a two-second tail. The scene owns no clock — the page drives it, and a frame scraper drives it instead when you want files.

THE TYPE, AS SECTIONS
- Draw each caption once to an offscreen canvas, blur it into a soft field, and sample that field with ~200 instanced quads spread along Z and tilted 45°. Each quad keeps only the fragments where the field crosses its own threshold, so the stack reads as sections cut through a solid rather than as a letterform.
- The blur is doing the real work: threshold a hard-edged glyph and all 200 bands land on the same outline; cross a gradient at 200 depths and you get 200 different contours.
- Bake every caption ONCE, at load, into its own render target. Per-frame blurring is a ping-pong between two targets — exactly the kind of state that makes frame N depend on frame N-1 — and it would re-blur the same dozen lines a thousand times. Choosing between finished textures is a pure function of t.
- Await \`document.fonts.ready\` before rasterising, or the first captions bake in a fallback face.

THE ROOM
- Composite the type layer and a flow-field layer into one image first, then map that onto the tube: the tube distorts, tints and scans what is ON it, so the order is not negotiable.
- Tube: barrel distortion, phosphor tint, scanlines, bloom (UnrealBloomPass), a vignette, and a faint horizontal jitter. Keep the tube's own grade — leave its material untoned.
- Room: a dark floor, a desk, a keyboard, a spotlight just in front of the screen, and a background matched to the unlit floor so the horizon disappears and the dark stays one colour.
- Size the screen mesh from the render aspect (\`SCREEN_H = SCREEN_W * height / width\`). That one line is what lets the same composition render 16:9 or 9:16 — vertical gives a portrait tube, not a cropped one.

THE MOVE
One camera move, parameterised by \`t / duration\`, not by seconds: hold close on the phosphor for the first third while the words are the point, then ease back with a smootherstep to reveal the desk the tube has been sitting on. It is the one thing that does not return where it began, because a reveal that loops is not a reveal.

DETERMINISM, IN PRACTICE
- No \`Date.now()\`, no \`performance.now()\`, no accumulating counters, no \`Math.random()\` — seed any noise from t and an index. Simplex noise over (position, t) is fine; \`velocity += a\` is not.
- Any ping-pong buffer, trail buffer or feedback pass must be baked at load or re-derived from t.
- Give the demo page a \`?paused=1\` mode where the page stops seeking entirely, so an external driver owns the timeline. A page that keeps seeking to its own t will overwrite every frame the driver asked for, one tick later.
- Expose the scene on \`window\` in that page so a frame scraper drives the real bootstrap instead of keeping a second copy of it.
- Verify purity: render a handful of frames in order, then the same timestamps shuffled, and compare the images. They must be identical.

RENDERING FILES
A frame scraper seeks to t, waits two animation frames, and screenshots — 30fps × the duration. Pipe the PNGs through ffmpeg for an mp4. Vertical is just a different width and height; nothing in the composition needs to change.

AUDIO
None in the repo, and none in the DOM: a frame scraper should never find a track. Create it on the first gesture, keep it loosely in sync with t, and let it fail silently when the file is not there.`,
    preview: "parallax",
    variant: "tall",
    added: "Sep 22, 2026",
    repoUrl: "https://github.com/RayVelez27/you-can-see-code",
    video: "/previews/you-can-see-code.mp4",
    videoAspect: "portrait",
    videoLoop: true,
    thumbnail: "/thumbs/you-can-see-code.jpg",
    theme: "dark",
    hidden: true,
  },
  {
    title: "Three-Tier Pricing Table",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    description: "Highlighted middle tier with feature checklist",
    prompt:
      "Build a three-tier pricing section (Starter / Pro / Scale). Middle card elevated with a dark inverted background and a 'Most popular' pill. Each card: price with monthly/annual toggle state, 5-item feature checklist with check icons, full-width CTA button. Annual toggle shows a 'Save 20%' badge on prices. Cards equal height, 24px gap, rounded-2xl, hairline borders.",
    preview: "pricing",
    variant: "tall",
    added: "Sep 15, 2026",
  },
  {
    title: "Sticky Glass Navbar",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    description: "Backdrop-blur bar that condenses on scroll",
    prompt:
      "Create a sticky top navbar with backdrop-blur and a 1px bottom hairline that appears after scrolling 24px. Logo left, 5 links center, 'Sign in' ghost button + solid 'Get started' button right. On scroll past 80px the bar height shrinks from 72px to 56px with a smooth transition. Mobile: hamburger opens a full-height slide-in panel from the right.",
    preview: "navbar",
    variant: "square",
    added: "Sep 12, 2026",
  },
  {
    title: "Magnetic CTA Button",
    category: "motion",
    categoryLabel: "MOTION",
    description: "Button that leans toward the cursor",
    prompt:
      "Build a magnetic button: on mousemove within a 120px radius, translate the button toward the cursor by up to 12px using a spring easing (requestAnimationFrame lerp), and translate the inner label half as much for a parallax feel. On mouseleave, spring back to origin. Include a radial shine that follows the cursor position inside the button. Disable the effect on touch devices and when prefers-reduced-motion is set.",
    preview: "buttons",
    variant: "square",
    added: "Sep 10, 2026",
  },
  {
    title: "Email Waitlist Form",
    category: "forms",
    categoryLabel: "FORMS",
    description: "Single-field capture with success state",
    prompt:
      "Build an email waitlist form: single email input with inline validation, submit button with loading spinner state, then an animated success state that swaps the whole form for a checkmark and 'You're on the list' message. Error message slides in below the input on invalid email. Include a subtle count caption under the form ('2,431 builders already joined'). Keyboard accessible, aria-live for status messages.",
    preview: "form",
    variant: "square",
    added: "Sep 8, 2026",
  },
  {
    title: "Bento Feature Grid",
    category: "web",
    categoryLabel: "WEB",
    description: "Asymmetric feature cards in a bento layout",
    prompt:
      "Build a bento feature grid: 6 cards in a 4-column grid where two cards span 2x2 and 2x1. Each card has a small icon, bold title, one-line description, and a mini UI illustration in the corner. One card is inverted (dark) for contrast. Hover: card lifts 4px with a soft shadow. Collapse to 2 columns on tablet, 1 on mobile.",
    preview: "cards",
    variant: "large",
    added: "Sep 5, 2026",
  },
  {
    title: "Scroll-Reveal Sections",
    category: "motion",
    categoryLabel: "MOTION",
    description: "IntersectionObserver fade-up with stagger",
    prompt:
      "Create a scroll-reveal system with IntersectionObserver: elements start at opacity 0, translateY(24px), and animate in with a 600ms ease-out when 15% visible. Children of a [data-stagger] container get an 80ms incremental delay. Animate once, then unobserve. Provide a useReveal() hook. Respect prefers-reduced-motion by showing everything immediately.",
    preview: "parallax",
    variant: "tall",
    added: "Sep 2, 2026",
  },
  {
    title: "Mega Footer",
    category: "web",
    categoryLabel: "WEB",
    description: "Four-column sitemap footer with big wordmark",
    prompt:
      "Build a mega footer: four link columns (Product, Resources, Company, Legal), a newsletter signup row on top separated by a hairline, social icons, and a giant outlined wordmark spanning the full width at the very bottom that subtly fills on hover. Copyright + 'Built with' line centered under the wordmark. Monochrome.",
    preview: "footer",
    variant: "wide",
    added: "Aug 30, 2026",
  },
  {
    title: "Testimonial Cards",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    description: "Quote cards with avatar and star rating",
    prompt:
      "Build a testimonial section: 3 quote cards in a row (stack on mobile). Each card: 5-star row, short quote in a serif italic, avatar + name + role/company. Middle card slightly raised. Add a large decorative quotation mark in the corner of each card at 10% opacity. Hairline borders, 16px radius.",
    preview: "testimonial",
    variant: "square",
    added: "Aug 27, 2026",
  },
  {
    title: "Stats Dashboard Card",
    category: "product",
    hidden: true, // PRODUCT-PARKED
    categoryLabel: "PRODUCT",
    description: "Metric tiles with mini bar chart",
    prompt:
      "Build a compact dashboard card: header row with title and date-range dropdown, then 4 metric tiles (label, big number, delta pill green/red), and a 12-bar mini bar chart with the active bar highlighted and a tooltip on hover. All monochrome with one accent color for the active bar. Skeleton loading state included.",
    preview: "dashboard",
    variant: "wide",
    added: "Aug 24, 2026",
  },
  {
    title: "Vertical Sidebar Nav",
    category: "navigation",
    categoryLabel: "NAVIGATION",
    description: "Fixed left rail with icon + label items",
    prompt:
      "Create a fixed vertical sidebar navigation on the left: brand mark at top, vertical list of nav items (uppercase, letter-spaced), social icons and account link pinned to the bottom. Active item gets a left accent bar and full-contrast text; inactive items at 60% opacity, full on hover. On mobile it collapses to a top bar with a hamburger that opens a full-screen overlay menu.",
    preview: "sidebar-nav",
    variant: "tall",
    added: "Aug 20, 2026",
  },
  {
    title: "Search with Modal Command Palette",
    category: "forms",
    categoryLabel: "FORMS",
    description: "Cmd+K palette with fuzzy results",
    prompt:
      "Build a command palette modal: opens with Cmd+K or clicking a search trigger that shows the ⌘K hint. Centered dialog with a large input, grouped results (Recent, Components, Pages) with keyboard arrow navigation and Enter to select. Fuzzy-match filtering as you type, highlighted matches. Esc closes, backdrop click closes. Smooth scale-in animation from 98%.",
    preview: "modal",
    variant: "square",
    added: "Aug 16, 2026",
  },
  {
    title: "Masonry Gallery",
    category: "web",
    categoryLabel: "WEB",
    description: "Pinterest-style grid with hover captions",
    prompt:
      "Build a masonry gallery using CSS columns (3 on desktop, 2 on tablet, 1 on mobile). Items keep natural aspect ratios with 12px gutters. Each item has a hover overlay sliding up from the bottom with a title and tag. Add a subtle zoom (scale 1.03) on the image inside. Fade items in on load with a stagger.",
    preview: "gallery",
    variant: "square",
    added: "Aug 12, 2026",
  },
];

/** "Split Hero with Headline" → "split-hero-with-headline" */
export const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const prompts: PromptEntry[] = entries.map((entry) => ({
  ...entry,
  slug: slugify(entry.title),
}));

/** Fisher-Yates on a copy. Nothing is seeded, so every page load is a new
 *  order — which is the point: the feed should not have a permanent top. */
export const shuffle = <T>(list: readonly T[]): T[] => {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * Deal two shuffled piles into one run so the two themes alternate instead of
 * clumping.
 *
 * A plain shuffle of a 14/11 split puts four dark tiles together often enough
 * to notice, and in a masonry grid that reads as a mistake — a black quadrant
 * with the rest of the page around it. Strict A-B-A-B is no good either,
 * because the piles are different sizes and the surplus then lands in a block
 * at the end, which is the same fault moved to the bottom.
 *
 * So: walk the output positions and take from whichever pile is furthest
 * behind the rate it is owed — Bresenham, essentially. The ratio holds at
 * every point in the run, not just overall, so the extra darks are spread
 * through the feed rather than pooled anywhere.
 */
export const interleaveByTheme = <T extends { theme?: string }>(list: readonly T[]): T[] => {
  const dark = shuffle(list.filter((p) => p.theme === "dark"));
  const light = shuffle(list.filter((p) => p.theme === "light"));
  // Anything untagged keeps its shuffled place at the end rather than being
  // dropped: a missing screenshot should not cost an entry its slot.
  const untagged = shuffle(list.filter((p) => p.theme !== "dark" && p.theme !== "light"));

  const out: T[] = [];
  let d = 0, l = 0;
  const total = dark.length + light.length;
  for (let i = 0; i < total; i++) {
    // Which pile is further behind the share of the run it has been dealt?
    const dOwed = dark.length ? (d + 0.5) / dark.length : Infinity;
    const lOwed = light.length ? (l + 0.5) / light.length : Infinity;
    if (dOwed <= lOwed) out.push(dark[d++]);
    else out.push(light[l++]);
  }
  return out.concat(untagged);
};

/**
 * What the feed, the category pages and the pager walk.
 *
 * An entry earns its place by shipping something runnable — a demo in
 * `public/demos` or a repo. The rest are drafts: they still resolve at
 * /prompt/:slug, but a CSS wireframe standing in for a screenshot is not
 * something to put in front of anyone.
 *
 * Ordered once per page load, not per render, so it holds still while you
 * browse and changes when you come back.
 */
const runnable = prompts.filter((p) => !p.hidden && (p.demo || p.repoUrl || p.youtube));

/* Videos close a run instead of being shuffled into it: they are a different
   kind of thing from the templates, and the last tile is where they belong. */
const videosLast = (run: PromptEntry[]): PromptEntry[] =>
  run.filter((p) => !p.youtube).concat(run.filter((p) => p.youtube));

export const visiblePrompts: PromptEntry[] = videosLast(interleaveByTheme(runnable));

/**
 * The main feed. Section-only entries are reachable from their section.
 *
 * Interleaved from the filtered list rather than filtered from the interleaved
 * one — which is a real distinction, not a tidy-up. Taking four entries out of
 * an alternating run closes the gaps they leave and their neighbours end up
 * side by side, so the feed came out with pairs and triples in it even though
 * the order it was cut from alternated perfectly.
 */
export const feedPrompts: PromptEntry[] = videosLast(interleaveByTheme(
  runnable.filter((p) => !p.sectionOnly)
));

/**
 * A category's run, alternating within that category — same reason.
 *
 * Memoised so the order is fixed for the life of the page: recomputing per
 * render would reshuffle the grid underneath anyone who scrolled it.
 */
const categoryRuns = new Map<string, PromptEntry[]>();
export const promptsInCategory = (category: string): PromptEntry[] => {
  const cached = categoryRuns.get(category);
  if (cached) return cached;
  const run = videosLast(interleaveByTheme(runnable.filter((p) => p.category === category)));
  categoryRuns.set(category, run);
  return run;
};

/**
 * Product has a top-level section of its own, so it lives at /product rather
 * than under /category/. Everything else keeps the generic path.
 */
export const categoryHref = (slug: string) =>
  slug === "product" ? "/product" : `/category/${slug}`;

export const getPromptBySlug = (slug?: string) =>
  prompts.find((p) => p.slug === slug);

/** Other prompts in the same category, for the "more like this" rail. */
export const getRelatedPrompts = (entry: PromptEntry, limit = 4) =>
  promptsInCategory(entry.category)
    .filter((p) => p.slug !== entry.slug)
    .slice(0, limit);
