import { useEffect } from "react";

const SITE = "InstaLanding.ai";
/** The default social card; index.html carries the same URL for non-JS crawlers. */
const DEFAULT_IMAGE = "/og.png";

/** Set a tag's attribute, creating the tag if the page does not have it yet. */
function setTag(selector: string, attr: string, value: string, make: () => Element) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = make();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

const meta = (key: "name" | "property", id: string, content: string) =>
  setTag(`meta[${key}="${id}"]`, "content", content, () => {
    const m = document.createElement("meta");
    m.setAttribute(key, id);
    return m;
  });

/**
 * Per-route title, description, canonical and social image.
 *
 * Every main route calls this, so navigating never leaves the previous page's
 * tags behind. `title` is the page's own name; the site name is appended
 * unless `rawTitle` is set (the home page, whose title already is the brand).
 *
 * This is a client-rendered SPA, so these tags land after hydration: good
 * enough for anything that executes JavaScript, not good enough for crawlers
 * that do not — those see index.html's defaults. Prerendering the routes at
 * build time is the next step, and this hook keeps working unchanged when it
 * happens.
 */
export function useSeo(opts: {
  title: string;
  description: string;
  canonical?: string;
  /** Path or absolute URL of the social card. Defaults to the site card. */
  image?: string;
  /** Pixel size of `image`; the site card is 1200x630, tile thumbnails 1200x600. */
  imageSize?: [number, number];
  rawTitle?: boolean;
}) {
  const { title, description, canonical, image = DEFAULT_IMAGE, imageSize = [1200, 630], rawTitle = false } = opts;
  const [imageW, imageH] = imageSize;

  useEffect(() => {
    const fullTitle = rawTitle ? title : `${title} — ${SITE}`;
    const imageUrl = new URL(image, window.location.origin).toString();

    document.title = fullTitle;
    meta("name", "description", description);
    meta("property", "og:title", fullTitle);
    meta("property", "og:description", description);
    meta("property", "og:image", imageUrl);
    meta("property", "og:image:width", String(imageW));
    meta("property", "og:image:height", String(imageH));
    meta("name", "twitter:title", fullTitle);
    meta("name", "twitter:description", description);
    meta("name", "twitter:image", imageUrl);

    if (canonical) {
      const href = new URL(canonical, window.location.origin).toString();
      setTag('link[rel="canonical"]', "href", href, () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      });
      meta("property", "og:url", href);
    }
  }, [title, description, canonical, image, imageW, imageH, rawTitle]);
}
