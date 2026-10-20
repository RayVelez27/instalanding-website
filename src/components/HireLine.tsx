import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/track";

/**
 * The one quiet line on every template (page, dialog and phone): the moment
 * someone likes a page but may not want to adapt it themselves. Links to
 * /hire with the template preselected, and records where the click came from.
 */
const HireLine = ({ slug, from, className = "" }: { slug: string; from: string; className?: string }) => (
  <p className={`hire-line ${className}`.trim()}>
    <span>Want this one built for you?</span>
    <Link to={`/hire?template=${encodeURIComponent(slug)}`} onClick={() => track("hire_click", { from, template: slug })}>
      HIRE RAY <ArrowRight size={12} aria-hidden="true" />
    </Link>
  </p>
);

export default HireLine;
