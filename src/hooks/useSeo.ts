import { useEffect } from "react";

const SITE = "INSTALANDING.AI";

function setMeta(selector: string, attr: string, value: string, create: () => Element) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/**
 * Per-route title, description and canonical.
 *
 * This is a client-rendered SPA, so these tags land after hydration: good
 * enough for anything that executes JavaScript, not good enough for crawlers
 * that do not. The builder pages are the first part of the library written to
 * be found rather than browsed, so when they start earning traffic the next
 * step is prerendering these routes at build time — at which point this hook
 * keeps working unchanged and simply stops being the only source of the tags.
 */
export function useSeo(opts: { title: string; description: string; canonical?: string }) {
  const { title, description, canonical } = opts;

  useEffect(() => {
    const previous = document.title;
    document.title = `${title} — ${SITE}`;

    setMeta('meta[name="description"]', "content", description, () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    });
    setMeta('meta[property="og:title"]', "content", `${title} — ${SITE}`, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:title");
      return m;
    });
    setMeta('meta[property="og:description"]', "content", description, () => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:description");
      return m;
    });

    if (canonical) {
      const href = new URL(canonical, window.location.origin).toString();
      setMeta('link[rel="canonical"]', "href", href, () => {
        const l = document.createElement("link");
        l.setAttribute("rel", "canonical");
        return l;
      });
      setMeta('meta[property="og:url"]', "content", href, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:url");
        return m;
      });
    }

    return () => {
      document.title = previous;
    };
  }, [title, description, canonical]);
}
