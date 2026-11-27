import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Layers, LayoutGrid, Menu, Sparkles } from "lucide-react";
import { track } from "@/lib/track";
import { openPhoneMenu } from "@/lib/phoneNav";

/**
 * The phone's way around (the mobile plan, item 6): Home · Pages · Systems ·
 * Motion · More, pinned to the bottom. More opens the full menu (Videos,
 * Icons, Products, About, Contact, Agent Mode). It tucks away while you scroll
 * down and comes back on the way up; CSS hides it under an item sheet and
 * above phone width.
 */
const TABS = [
  { to: "/", label: "Home", Icon: Home, match: (p: string) => p === "/" },
  { to: "/pages", label: "Pages", Icon: LayoutGrid, match: (p: string) => p === "/pages" || p.startsWith("/prompt/") || p.startsWith("/category/") },
  { to: "/systems", label: "Systems", Icon: Layers, match: (p: string) => p.startsWith("/systems") },
  { to: "/motion", label: "Motion", Icon: Sparkles, match: (p: string) => p.startsWith("/motion") },
];

const PhoneTabBar = () => {
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY.current;
      if (Math.abs(dy) < 6) return;
      setHidden(dy > 0 && y > 120);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setHidden(false), [pathname]);

  const more = !TABS.some((t) => t.match(pathname));

  return (
    <nav className={`tabbar${hidden ? " is-hidden" : ""}`} aria-label="Sections">
      {TABS.map(({ to, label, Icon, match }) => (
        <Link key={to} to={to} className={`tabbar-tab${match(pathname) ? " is-on" : ""}`} aria-current={match(pathname) ? "page" : undefined} onClick={() => track("tabbar", { to })}>
          <Icon size={20} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
      <button type="button" className={`tabbar-tab${more ? " is-on" : ""}`} onClick={() => { openPhoneMenu(); track("tabbar", { to: "more" }); }} aria-label="More sections and settings">
        <Menu size={20} strokeWidth={2} aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
};

export default PhoneTabBar;
