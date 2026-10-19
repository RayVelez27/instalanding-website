import GithubButton from "@/components/GithubButton";
import LibrarySearch from "@/components/LibrarySearch";
import { AgentModeToggle } from "@/components/AgentMode";
import { EVERYTHING } from "@/lib/libraryItems";

/**
 * The bar at the top of HOME, PAGES, SYSTEMS and MOTION: search across the
 * whole library (⌘K), Agent Mode and GitHub. Sticky on desktop; on phones it
 * scrolls with the page, since the phone header is already pinned.
 */
const SiteTopBar = () => (
  <div className="home-top">
    <LibrarySearch items={EVERYTHING} />
    <div className="library-intro-actions">
      <AgentModeToggle />
      <GithubButton />
    </div>
  </div>
);

export default SiteTopBar;
