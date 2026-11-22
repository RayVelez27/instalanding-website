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
}

export const videos: VideoEntry[] = [
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
