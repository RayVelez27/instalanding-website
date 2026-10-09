import { useEffect, useState } from "react";
import { Github, Star } from "lucide-react";

/**
 * The public library repo: every page as one HTML file plus its brief. This
 * is not the site's own source repo (instalanding-website).
 */
export const GITHUB_REPO = "RayVelez27/instalanding.ai";

const REPO_URL = `https://github.com/${GITHUB_REPO}`;
const CACHE_KEY = `gh-stars:${GITHUB_REPO}`;
/** Unauthenticated GitHub API calls are capped at 60 an hour per IP, so cache. */
const CACHE_MS = 10 * 60 * 1000;

const readCache = (): number | null => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { count, at } = JSON.parse(raw);
    return typeof count === "number" && Date.now() - at < CACHE_MS ? count : null;
  } catch {
    return null;
  }
};

const writeCache = (count: number) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ count, at: Date.now() }));
  } catch {
    /* storage blocked: just refetch next time */
  }
};

const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}K` : String(n));

/** Live star count for the public repo, or null until (or unless) it loads. */
const useStarCount = () => {
  const [count, setCount] = useState<number | null>(readCache);

  useEffect(() => {
    if (count !== null) return;
    const ctrl = new AbortController();
    fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (typeof data?.stargazers_count === "number") {
          writeCache(data.stargazers_count);
          setCount(data.stargazers_count);
        }
      })
      .catch(() => {
        /* rate-limited or offline: the button still works without a count */
      });
    return () => ctrl.abort();
  }, [count]);

  return count;
};

/**
 * GITHUB button, top right of the library: the repo link plus a live star
 * count that links to the stargazers.
 */
const GithubButton = () => {
  const stars = useStarCount();

  return (
    <div className="star-group">
      <a className="star-btn" href={REPO_URL} target="_blank" rel="noreferrer" title={`${GITHUB_REPO} on GitHub`}>
        <Github size={13} aria-hidden="true" />
        <span>GITHUB</span>
      </a>
      {stars !== null && (
        <a
          className="star-btn star-count"
          href={`${REPO_URL}/stargazers`}
          target="_blank"
          rel="noreferrer"
          title={`${stars.toLocaleString()} ${stars === 1 ? "star" : "stars"} on GitHub. Star the repo to follow new drops.`}
          aria-label={`${stars.toLocaleString()} GitHub ${stars === 1 ? "star" : "stars"}`}
        >
          <Star size={12} aria-hidden="true" />
          <span>{formatCount(stars)}</span>
        </a>
      )}
    </div>
  );
};

export default GithubButton;
