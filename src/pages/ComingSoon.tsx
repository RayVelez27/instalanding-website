import Sidebar from "@/components/Sidebar";

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
const ComingSoon = ({ title, blurb }: ComingSoonProps) => (
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

export default ComingSoon;
