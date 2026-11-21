/**
 * MOVIES: short films rendered live in the browser. Each entry is one HTML
 * file under public/movie-demos/ (never under /movies/, which is the dialog's
 * URL) with every asset inlined: models, textures and the score are in the file
 * or generated in code, so it plays opened straight from disk.
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 */

export interface MovieEntry {
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
  /** Third-party assets the film uses and their licences */
  credits: string[];
  /** The single HTML file */
  demo: string;
  /** 1200x600 still from the film */
  thumbnail: string;
}

export const movies: MovieEntry[] = [
  {
    slug: "canyon-run",
    title: "Canyon Run",
    description:
      "A 15-second real-time film: a wooden biplane flies through a sunset canyon that turns into code, with the canyon, sky, light and score all generated in the browser",
    added: "Nov 21, 2026",
    runtime: "0:15",
    tech: "Real-time 3D · generated score",
    tags: ["real-time", "3d", "procedural", "sound"],
    credits: ["Plane: “Basic Plane” by Blender3D, CC BY 4.0"],
    demo: "/movie-demos/canyon-run.html",
    thumbnail: "/movie-demos/canyon-run.jpg",
  },
];

export const getMovieBySlug = (slug?: string) => movies.find((m) => m.slug === slug);
