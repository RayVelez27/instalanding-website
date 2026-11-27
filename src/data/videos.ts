/**
 * VIDEOS: short videos rendered live in the browser. Each entry is one HTML
 * file under public/video-demos/ (never under /videos/, which is the dialog's
 * URL) with every asset inlined: models, textures and the score are in the file
 * or generated in code, so it plays opened straight from disk.
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 */

export interface VideoEntry {
  slug: string;
  title: string;
  /** One sentence, like a PAGES description */
  description: string;
  added: string;
  /** Running time, as shown on the card: "0:15" */
  runtime: string;
  /** What it is made with: "WebGL · Web Audio" */
  tech: string;
  tags: string[];
  /** Third-party assets the video uses and their licences */
  credits: string[];
  /** The single HTML file */
  demo: string;
  /** 1200x600 still from the video */
  thumbnail: string;
  /** No soundtrack and no play button of its own: it starts as soon as the frame loads */
  silent?: boolean;
}

export const videos: VideoEntry[] = [
  {
    slug: "mobius-knot",
    title: "Mobius Knot V2",
    description:
      "A 13-second piece on black: a twisting Möbius ribbon tied into a knot turns full-frame in a raymarched shader, catching soft shadows and an iridescent sweep of blue, gold and violet, then pulls back and shrinks until it becomes the O in MOTION",
    added: "Nov 27, 2026",
    runtime: "0:13",
    tech: "WebGL2 · one fragment shader · GSAP timeline",
    tags: ["shader", "raymarching", "loop", "dark"],
    credits: [],
    demo: "/video-demos/mobius-knot.html",
    thumbnail: "/video-demos/mobius-knot.jpg",
    silent: true,
  },
  {
    slug: "iso-city-day-night",
    title: "Iso City Day & Night",
    description:
      "An 11-second day-to-night cycle on an isometric apartment tower built in CSS 3D: a sun-and-moon toggle flips, the sun sets as a crescent moon and stars rise, hundreds of windows warm from blue to magenta, and a frosted weather card swaps Sunny 98° for Clear 73° before it all turns back to day",
    added: "Nov 27, 2026",
    runtime: "0:11",
    tech: "CSS 3D · GSAP timeline",
    tags: ["isometric", "css 3d", "day and night", "weather"],
    credits: [],
    demo: "/video-demos/iso-city-day-night.html",
    thumbnail: "/video-demos/iso-city-day-night.jpg",
    silent: true,
  },
  {
    slug: "clay-cube-terrain",
    title: "Clay Cube Terrain",
    description:
      "A 15-second drift over an endless field of rounded clay blocks rising and falling, raymarched in a single shader with fog, soft shadows and shallow depth of field, crossfading every three seconds through ember, porcelain, bioluminescent night, steel and molten-magma looks",
    added: "Nov 27, 2026",
    runtime: "0:15",
    tech: "WebGL2 · raymarched terrain · GSAP timeline",
    tags: ["shader", "terrain", "generative", "background"],
    credits: [],
    demo: "/video-demos/clay-cube-terrain.html",
    thumbnail: "/video-demos/clay-cube-terrain.jpg",
    silent: true,
  },
  {
    slug: "voxel-pelican-assembly",
    title: "Voxel Pelican Assembly",
    description:
      "A 24-second voxel build-and-ride: a seaside diorama of a pelican on a bicycle assembles itself block by block in an isometric view, then the camera flattens to a side-on shot and the pelican pedals off across a bridge that builds itself just ahead of the wheels",
    added: "Nov 26, 2026",
    runtime: "0:24",
    tech: "three.js · voxels · GSAP timeline",
    tags: ["voxel", "3d", "isometric", "camera moves"],
    credits: [],
    demo: "/video-demos/voxel-pelican-assembly.html",
    thumbnail: "/video-demos/voxel-pelican-assembly.jpg",
    silent: true,
  },
  {
    slug: "tube-field-lights",
    title: "Tube Field Lights",
    description:
      "A 14-second WebGL piece on black: pink light balls bounce up and down through a dark grid of rounded-square tubes, then a green ball rises, freezes mid-air, and blooms until its light engulfs the frame before pulling back into a single glowing orb",
    added: "Nov 26, 2026",
    runtime: "0:14",
    tech: "three.js · point lights · GSAP timeline",
    tags: ["webgl", "lights", "generative", "dark"],
    credits: [],
    demo: "/video-demos/tube-field-lights.html",
    thumbnail: "/video-demos/tube-field-lights.jpg",
    silent: true,
  },
  {
    slug: "chaotic-time-clock",
    title: "Chaotic Time Clock",
    description:
      "An 8-second shot of a glowing seven-segment clock floating over its own reflection, where time has come loose: the digits whir, surge and stutter as the clock races ahead, the camera drifts and the neon cycles through the spectrum",
    added: "Nov 26, 2026",
    runtime: "0:08",
    tech: "CSS 3D · GSAP timeline",
    tags: ["clock", "neon", "css 3d", "dark"],
    credits: [],
    demo: "/video-demos/chaotic-time-clock.html",
    thumbnail: "/video-demos/chaotic-time-clock.jpg",
    silent: true,
  },
  {
    slug: "car-drive-loop",
    title: "Car Drive Loop",
    description:
      "An 11-second flat-illustrated drive: a time-machine sports car cruises through a circular porthole ringed by a glowing tachometer, across a synthwave desert of layered hills, cacti and hot-air balloons, until the porthole opens onto the whole sunset landscape",
    added: "Nov 26, 2026",
    runtime: "0:11",
    tech: "SVG car · Canvas 2D · GSAP timeline",
    tags: ["synthwave", "illustration", "car", "loop"],
    credits: [],
    demo: "/video-demos/car-drive-loop.html",
    thumbnail: "/video-demos/car-drive-loop.jpg",
    silent: true,
  },
  {
    slug: "vending-machine-city",
    title: "Vending Machine City",
    description:
      "A 10-second wordless pull-back: a glowing red vending machine on a dark street corner keeps dropping cans, which tumble out and roll across the pavement as the camera climbs away over a night-time isometric city of towers, hotels, parks and lamplit streets, until the machine is a red speck among the rooftops",
    added: "Nov 26, 2026",
    runtime: "0:10",
    tech: "Decoded Rive · Canvas 2D · procedural city",
    tags: ["isometric", "city", "camera moves", "night"],
    credits: [],
    demo: "/video-demos/vending-machine-city.html",
    thumbnail: "/video-demos/vending-machine-city.jpg",
    silent: true,
  },
  {
    slug: "medusa-naga",
    title: "Medusa Naga",
    description:
      "A 15-second talking ad for InstaLanding: a 3D snake-tailed Medusa in sunglasses waves, sways and speaks her lines in a synthesized voice, then stays live, watching your cursor, reacting when tapped and spinning when dragged",
    added: "Nov 26, 2026",
    runtime: "0:15",
    tech: "Real-time 3D · Web Audio · speech synthesis",
    tags: ["character", "3d", "interactive", "voice", "sound", "blackletter"],
    credits: [],
    demo: "/video-demos/medusa-naga.html",
    thumbnail: "/video-demos/medusa-naga.jpg",
  },
  {
    slug: "brand-identity",
    title: "Brand Identity",
    description:
      "A 15-second wordless brand reel: lime cards for type, palette, a cube, a face and a grid pop, flip and shatter under a moving camera, then gather into one identity board with its pieces in orbit",
    added: "Nov 21, 2026",
    runtime: "0:15",
    tech: "Decoded Rive · Canvas 2D · soundtrack",
    tags: ["brand", "camera moves", "motion blur", "sound"],
    credits: [],
    demo: "/video-demos/brand-identity.html",
    thumbnail: "/video-demos/brand-identity.jpg",
  },
  {
    slug: "geometry-madness",
    title: "Geometry Madness",
    description:
      "A 14-second beat-synced piece: a hand reaches in and taps a glowing square, which twists into a spiral tunnel, multiplies into a grid and shatters into prismatic light, cut to the soundtrack with a live HUD of spectrum, oscilloscope and binary beat counter",
    added: "Nov 21, 2026",
    runtime: "0:14",
    tech: "Decoded Rive · Canvas 2D · soundtrack",
    tags: ["beat-synced", "geometric", "rive", "sound"],
    credits: [],
    demo: "/video-demos/geometry-madness.html",
    thumbnail: "/video-demos/geometry-madness.jpg",
  },
  {
    slug: "canyon-run",
    title: "Canyon Run",
    description:
      "A 15-second real-time video: a wooden biplane flies through a sunset canyon that turns into code, with the canyon, sky, light and score all generated in the browser",
    added: "Nov 21, 2026",
    runtime: "0:15",
    tech: "Real-time 3D · generated score",
    tags: ["real-time", "3d", "procedural", "sound"],
    credits: ["Plane: “Basic Plane” by Blender3D, CC BY 4.0"],
    demo: "/video-demos/canyon-run.html",
    thumbnail: "/video-demos/canyon-run.jpg",
  },
];

export const getVideoBySlug = (slug?: string) => videos.find((m) => m.slug === slug);
