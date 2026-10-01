export type PromptCategory = "web" | "motion" | "product" | "navigation" | "forms";

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
];

const entries: Omit<PromptEntry, "slug">[] = [
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
    description: "Soft UI in a violet palette: an aperture sunk into the page, tokens drifting across it, and a working control panel of wells and knobs below",
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
    description: "A warm-paper component system where a noise-displaced gradient picks the accent and re-themes every control at once",
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
    thumbnail: "/thumbs/drift-wind-routing.jpg",
    theme: "dark",
  },
  {
    title: "Clay Constellation SaaS Hero",
    category: "web",
    categoryLabel: "WEB",
    description: "Floating clay tiles wired with drawn SVG lines, and a button that measures itself with dashed guides and corner dots",
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
    thumbnail: "/thumbs/smartcare-ai.jpg",
    theme: "dark",
  },
  {
    title: "CRAFT Studio WebGL Landing Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Glass torus knot refracting giant type, scroll-lit statement, Swiss monochrome studio site",
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
    thumbnail: "/thumbs/monax-analytics.jpg",
    theme: "light",
  },
  {
    title: "Clay SaaS Platform Page",
    category: "web",
    categoryLabel: "WEB",
    description: "Neumorphic dev-platform page, 10 sections, glossy generate button, GSAP reveals",
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
    thumbnail: "/thumbs/clay-pharma-landing-hero.jpg",
    theme: "light",
  },
  {
    title: "Skewed Marquee Wall",
    category: "web",
    categoryLabel: "WEB",
    description: "Reels running behind the hero, thrown by a Rive slot-machine button, in a machine-room system sampled from it",
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
const interleaveByTheme = (list: readonly PromptEntry[]): PromptEntry[] => {
  const dark = shuffle(list.filter((p) => p.theme === "dark"));
  const light = shuffle(list.filter((p) => p.theme === "light"));
  // Anything untagged keeps its shuffled place at the end rather than being
  // dropped: a missing screenshot should not cost an entry its slot.
  const untagged = shuffle(list.filter((p) => p.theme !== "dark" && p.theme !== "light"));

  const out: PromptEntry[] = [];
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
const runnable = prompts.filter((p) => !p.hidden && (p.demo || p.repoUrl));

export const visiblePrompts: PromptEntry[] = interleaveByTheme(runnable);

/**
 * The main feed. Section-only entries are reachable from their section.
 *
 * Interleaved from the filtered list rather than filtered from the interleaved
 * one — which is a real distinction, not a tidy-up. Taking four entries out of
 * an alternating run closes the gaps they leave and their neighbours end up
 * side by side, so the feed came out with pairs and triples in it even though
 * the order it was cut from alternated perfectly.
 */
export const feedPrompts: PromptEntry[] = interleaveByTheme(
  runnable.filter((p) => !p.sectionOnly)
);

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
  const run = interleaveByTheme(runnable.filter((p) => p.category === category));
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
