import { useEffect, useState } from "react";
import { Github, Star } from "lucide-react";

/** owner/repo for the library itself. One place to change after the repo is public. */
export const GITHUB_REPO = "RayVelez27/instalanding";

const CACHE_KEY = `stars:${GITHUB_REPO}`;

const formatStars = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

/**
 * Star button for the top-right of the library.
 *
 * The count is a nicety, not a requirement: the unauthenticated GitHub API is
 * rate limited and answers 404 until the repo is public, so any failure just
 * leaves the button label alone. The last good count is cached per session so
 * navigating around does not re-hit the API.
 */
const StarOnGithub = () => {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;

    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) setStars(Number(cached));
    } catch {
      /* private mode */
    }

    fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!alive || typeof data?.stargazers_count !== "number") return;
        setStars(data.stargazers_count);
        try {
          sessionStorage.setItem(CACHE_KEY, String(data.stargazers_count));
        } catch {
          /* private mode */
        }
      })
      .catch(() => {
        /* offline or rate limited: the button still works */
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      className="star-btn"
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noreferrer"
      title={`Star ${GITHUB_REPO} on GitHub`}
    >
      <Github size={13} />
      <span className="star-btn-label">STAR ON GITHUB</span>
      <Star size={12} className="star-btn-icon" />
      {stars !== null && <span className="star-btn-count">{formatStars(stars)}</span>}
    </a>
  );
};

export default StarOnGithub;
