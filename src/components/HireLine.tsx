import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { track } from "@/lib/track";

/**
 * The one quiet line on every template (page, dialog and phone): the moment
 * someone likes a page but may not want to adapt it themselves. Links to
 * the CONTACT page with the template preselected (which picks BUILD), and
 * records where the click came from.
 */
const HireLine = ({ slug, from, className = "" }: { slug: string; from: string; className?: string }) => (
  <p className={`hire-line ${className}`.trim()}>
    <span>Want this one built for you?</span>
    <Link to={`/contact?template=${encodeURIComponent(slug)}`} onClick={() => track("hire_click", { from, template: slug })}>
      HIRE RAY <ArrowRight size={12} aria-hidden="true" />
    </Link>
  </p>
);

export default HireLine;
