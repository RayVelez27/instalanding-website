import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";
import { GITHUB_REPO } from "@/components/GithubButton";
import { track } from "@/lib/track";

/**
 * The site footer, on every page and every width: the mark and the licence on
 * the left, a short row of links on the right. Deliberately one quiet line.
 */
const LINKS: { label: string; to?: string; href?: string }[] = [
  { label: "Home", to: "/" },
  { label: "Pages", to: "/pages" },
  { label: "Systems", to: "/systems" },
  { label: "About", to: "/about" },
  { label: "Hire", to: "/hire" },
  { label: "Sponsor", to: "/sponsor" },
  { label: "Contact", to: "/contact" },
  { label: "GitHub", href: `https://github.com/${GITHUB_REPO}` },
  { label: "X", href: "https://x.com/pascowebdesigns" },
  { label: "llms.txt", href: "/llms.txt" },
];

const SiteFooter = () => (
  <footer className="site-footer">
    <p className="site-footer-mark">
      <BrandLogo className="site-footer-brand" />
      <span>© {new Date().getFullYear()} · Free and MIT · Built for humans and agents</span>
    </p>
    <nav aria-label="Footer">
      <ul className="site-footer-links">
        {LINKS.map((l) => (
          <li key={l.label}>
            {l.to ? (
              <Link to={l.to} onClick={l.to === "/hire" ? () => track("hire_click", { from: "footer" }) : undefined}>{l.label}</Link>
            ) : (
              <a href={l.href} target={l.href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  </footer>
);

export default SiteFooter;
