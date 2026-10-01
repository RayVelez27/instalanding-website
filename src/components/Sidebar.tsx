import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { builders } from "@/data/builders";
import { Github, Twitter, Mail, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import NewsletterModal from "@/components/NewsletterModal";
import SignupField from "@/components/SignupField";

/**
 * The menu is no longer one entry per category. PAGES is the whole library
 * and always will be; SYSTEMS and PRODUCT are announced but empty. The
 * category routes still resolve — the detail page links to them — they are
 * just not in the menu any more.
 */
const NAV_LINKS: { to: string; label: string; soon?: boolean }[] = [
  { to: "/", label: "PAGES" },
  { to: "/systems", label: "SYSTEMS", soon: true },
  { to: "/product", label: "PRODUCT", soon: true }, // PRODUCT-PARKED
  { to: "/about", label: "ABOUT" },
  { to: "/builders", label: "BUILDERS" },
];

const BrandMark = () => (
  <Link to="/" className="brand-mark" aria-label="InstaLanding.ai home">
    <span className="brand-mark-text">1NSTALANDING.AI</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const [newsletterOpen, setNewsletterOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  // BUILDERS stays lit on the individual builder pages too, since those live
  // at the search term (/lovable-prompts) rather than under /builders/.
  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    if (to === "/builders")
      return (
        location.pathname === "/builders" ||
        builders.some((b) => b.path === location.pathname)
      );
    return location.pathname === to;
  };

  const handleNavClick = () => {
    if (isMobile) setMobileMenuOpen(false);
  };

  const socials = (iconSize: number) => (
    <>
      <a href="https://github.com" target="_blank" rel="noreferrer" title="GitHub" className="sidebar-social-link">
        <Github size={iconSize} />
      </a>
      <a href="https://twitter.com" target="_blank" rel="noreferrer" title="Twitter / X" className="sidebar-social-link">
        <Twitter size={iconSize} />
      </a>
      <button
        onClick={() => { setNewsletterOpen(true); handleNavClick(); }}
        title="Newsletter"
        className="sidebar-social-link"
      >
        <Mail size={iconSize} />
      </button>
    </>
  );

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <BrandMark />
          </div>
          {/* Desktop nav links */}
          <ul className="sidebar-nav sidebar-nav--desktop">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={isActive(link.to) ? "sidebar-nav-active" : undefined}
                >
                  {link.label}
                  {link.soon && <span className="sidebar-nav-soon">SOON</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop bottom */}
        <div className="sidebar-bottom sidebar-bottom--desktop">
          <div className="sidebar-socials">
            {socials(11)}
          </div>
          <SignupField />
        </div>

        {/* Mobile hamburger button */}
        <button
          className="sidebar-hamburger"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay">
          <button
            className="mobile-overlay-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <ul className="mobile-overlay-nav">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={handleNavClick}
                  className={isActive(link.to) ? "sidebar-nav-active" : undefined}
                >
                  {link.label}
                  {link.soon && <span className="sidebar-nav-soon">SOON</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-overlay-bottom">
            <div className="mobile-overlay-socials">
              {socials(22)}
            </div>
            <SignupField variant="overlay" />
          </div>
        </div>
      )}

      <NewsletterModal open={newsletterOpen} onClose={() => setNewsletterOpen(false)} />
    </>
  );
};

export default Sidebar;
