import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { builders } from "@/data/builders";
import { Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  { to: "/contact", label: "CONTACT" },
  // AGENTS is hidden, not removed: /agents still resolves and is in the
  // sitemap, and the agent endpoints point at it. Restore to bring it back.
  // { to: "/agents", label: "AGENTS" },
  // BUILDERS is hidden, not removed: /builders and the per-builder pages still
  // resolve (they are search landing pages). Restore this line to bring it back.
  // { to: "/builders", label: "BUILDERS" },
];

/** Solid brand marks on lucide's 24-unit grid: lucide has no X logo, and its
    LinkedIn icon is an outline that sits badly beside a solid X. */
const XLogo = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInLogo = ({ size }: { size: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const SOCIALS = [
  { href: "https://x.com/pascowebdesigns", label: "Ray on X", Icon: XLogo },
  { href: "https://www.linkedin.com/in/raymond-velez-96aa4a172/", label: "Ray on LinkedIn", Icon: LinkedInLogo },
];

const Socials = ({ size, className }: { size: number; className: string }) => (
  <div className={className}>
    {SOCIALS.map(({ href, label, Icon }) => (
      <a key={href} href={href} target="_blank" rel="noreferrer me" aria-label={label} title={label} className="sidebar-social-link">
        <Icon size={size} />
      </a>
    ))}
  </div>
);

const BrandMark = () => (
  <Link to="/" className="brand-mark" aria-label="InstaLanding.ai home">
    <span className="brand-mark-text">1NSTALANDING.AI</span>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
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
          <Socials size={13} className="sidebar-socials" />
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
            <Socials size={22} className="sidebar-socials sidebar-socials--overlay" />
            <SignupField variant="overlay" />
          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;
