/**
 * E-COMM: landing pages for stores and products. Each entry is one page, like
 * a PAGES entry, and opens in the same dialog (live preview at desktop or
 * mobile width, the source on CODE, COPY CODE); it just lives under its own
 * tab, so shoppers' pages are found together.
 *
 * Every page is a single HTML file under public/ecomm-demos/, never under
 * /ecomm/, which is the dialog's URL. Plain HTML on purpose: an agent turns it
 * into a Liquid section or a Hydrogen route, so the page ships no framework
 * code of its own.
 *
 * Like prompts.ts this file stays import-free, so build tooling can read it.
 */

export interface EcommEntry {
  slug: string;
  title: string;
  /** One sentence, like a PAGES description */
  description: string;
  added: string;
  theme: "dark" | "light";
  /** What is sold: footwear, skincare, coffee… */
  vertical: string;
  tags: string[];
  bestFor: string[];
  /** The single HTML file */
  demo: string;
  /** 1200x600 capture of the page's top */
  thumbnail: string;
}

export const ecomm: EcommEntry[] = [
  {
    slug: "amble",
    title: "Amble Sneaker Store Page",
    description:
      "A soft-grey sneaker store landing page with a shoe carousel over a giant model name, a best-seller grid and a factory story, every shoe and scene drawn in SVG",
    added: "Nov 11, 2026",
    theme: "light",
    vertical: "Footwear",
    tags: ["light", "editorial", "product-grid", "svg-art"],
    bestFor: ["footwear and apparel brands", "Shopify theme home pages", "product launches", "DTC stores with a small range"],
    demo: "/ecomm-demos/amble.html",
    thumbnail: "/ecomm-demos/amble.jpg",
  },
];

export const getEcommBySlug = (slug?: string) => ecomm.find((e) => e.slug === slug);
