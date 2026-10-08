import { Github } from "lucide-react";

/**
 * The public library repo: every page as one HTML file plus its brief. This
 * is not the site's own source repo (instalanding-website).
 */
export const GITHUB_REPO = "RayVelez27/instalanding.ai";

/** GITHUB button, top right of the library: icon, label, link to the public repo. */
const GithubButton = () => (
  <a
    className="star-btn"
    href={`https://github.com/${GITHUB_REPO}`}
    target="_blank"
    rel="noreferrer"
    title={`${GITHUB_REPO} on GitHub`}
  >
    <Github size={13} aria-hidden="true" />
    <span>GITHUB</span>
  </a>
);

export default GithubButton;
