import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { LABEL, type Item } from "@/lib/libraryItems";
import { useIsPhone } from "@/hooks/useIsPhone";

/* ── search across all three layers, ⌘K / Ctrl+K ── */
const LibrarySearch = ({ items }: { items: Item[] }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const phone = useIsPhone();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return (
      items
        // every word must match somewhere; title hits rank higher
        .filter((it) =>
          terms.every(
            (t) => it.words.includes(t) || it.title.toLowerCase().includes(t),
          ),
        )
        .map((it) => ({
          it,
          score: terms.reduce(
            (n, t) => n + (it.title.toLowerCase().includes(t) ? 3 : 1),
            0,
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((r) => r.it)
    );
  }, [q, items]);

  const pick = (it: Item) => {
    setOpen(false);
    setQ("");
    navigate(it.to, {
      state:
        it.kind === "page" && !phone
          ? { backgroundLocation: location }
          : undefined,
    });
  };

  return (
    <div
      className="home-search"
      onBlur={(e) =>
        !e.currentTarget.contains(e.relatedTarget) && setOpen(false)
      }
    >
      <Search size={15} aria-hidden="true" />
      <input
        ref={input}
        type="search"
        value={q}
        placeholder="Search pages, motion, systems…"
        aria-label="Search pages, motion and design systems"
        aria-expanded={open && results.length > 0}
        aria-controls="home-search-results"
        role="combobox"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            pick(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
            input.current?.blur();
          }
        }}
      />
      <kbd className="home-search-kbd" aria-hidden="true">
        ⌘ K
      </kbd>
      {open && q && (
        <ul
          className="home-search-results"
          id="home-search-results"
          role="listbox"
        >
          {results.length ? (
            results.map((it, i) => (
              <li key={it.key} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(it)}
                  onMouseEnter={() => setActive(i)}
                >
                  <img src={it.image} alt="" loading="lazy" />
                  <span>
                    <b>{it.title}</b>
                    <small>{it.sub}</small>
                  </span>
                  <em className={`home-kind-tag home-kind-tag--${it.kind}`}>
                    <i aria-hidden="true" />
                    {LABEL[it.kind]}
                  </em>
                </button>
              </li>
            ))
          ) : (
            <li className="home-search-empty">
              Nothing for “{q}”. Try a look (“dark”, “editorial”) or a kind
              (“carousel”).
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LibrarySearch;
