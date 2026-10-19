import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType, type Location } from "react-router-dom";

const backgroundOf = (l: Location) => (l.state as { backgroundLocation?: Location } | null)?.backgroundLocation;
const isSystems = (path: string) => path === "/systems" || path.startsWith("/systems/");
const fromList = (l: Location) => Boolean((l.state as { fromList?: boolean } | null)?.fromList);

/**
 * BrowserRouter keeps the scroll position across route changes, so a new page
 * opened from far down the feed (or the menu) started part way down. Each new
 * page now starts at the top, before paint. Left alone:
 * - Back and Forward (POP), so returning to the feed lands where you were;
 * - opening or closing a prompt dialog, which keeps the grid underneath;
 * - /systems and /systems/:slug, which are the same list with a dialog over it,
 *   and a motion study opened as a dialog from /motion;
 * - links to an #anchor.
 */
const ScrollToTop = () => {
  const location = useLocation();
  const type = useNavigationType();
  const prev = useRef(location);

  useLayoutEffect(() => {
    const from = prev.current;
    prev.current = location;
    if (from.key === location.key || type === "POP" || location.hash) return;
    if (backgroundOf(location) || backgroundOf(from)) return;
    if (isSystems(from.pathname) && isSystems(location.pathname)) return;
    if (fromList(location) || fromList(from)) return;
    // html has scroll-behavior: smooth; a page change should jump, not glide
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location, type]);

  return null;
};

export default ScrollToTop;
