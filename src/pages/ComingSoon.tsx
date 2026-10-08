import Sidebar from "@/components/Sidebar";
import { useLocation } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";

interface ComingSoonProps {
  /** Menu label, shown as the heading */
  title: string;
  /** One line on what will live here */
  blurb: string;
}

/**
 * A real page rather than a dead menu item: SYSTEMS and PRODUCT are both
 * announced but empty, so they share this. When one ships, replace the
 * route's element with the real page and delete nothing else.
 */
const ComingSoon = ({ title, blurb }: ComingSoonProps) => {
  const { pathname } = useLocation();
  useSeo({ title: `${title} — Coming Soon`, description: blurb, canonical: pathname });
  return (
  <div className="app-layout">
    <Sidebar />
    <main>
      <section className="soon">
        <div className="soon-inner">
          <p className="soon-tag">COMING SOON</p>
          <h1 className="soon-title">{title}</h1>
          <p className="soon-blurb">{blurb}</p>
        </div>
      </section>
    </main>
  </div>
  );
};

export default ComingSoon;
