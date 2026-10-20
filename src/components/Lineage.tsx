import { Fragment } from "react";
import { Link } from "react-router-dom";
import { getPromptBySlug, type PromptEntry } from "@/data/prompts";

/**
 * BRED FROM: a page made by crossing two library pages names its parents and
 * what each one gave. The full block (thumbnails, × between them) sits on the
 * template page; `compact` is one line for the dialog and the phone page.
 */
const Lineage = ({ entry, compact = false }: { entry: PromptEntry; compact?: boolean }) => {
  const parents = (entry.parents ?? [])
    .map((p) => ({ ...p, entry: getPromptBySlug(p.slug) }))
    .filter((p): p is typeof p & { entry: PromptEntry } => !!p.entry);
  if (parents.length < 2) return null;

  if (compact) {
    return (
      <p className="lineage-line">
        <span>BRED FROM</span>
        {parents.map((p, i) => (
          <span key={p.slug}>
            {i > 0 && <b aria-hidden="true"> × </b>}
            <Link to={`/prompt/${p.slug}`}>{p.entry.title}</Link>
          </span>
        ))}
      </p>
    );
  }

  return (
    <section className="lineage" aria-label="Bred from">
      <h2>BRED FROM</h2>
      <div className="lineage-row">
        {parents.map((p, i) => (
          <Fragment key={p.slug}>
            {i > 0 && (
              <span className="lineage-x" aria-hidden="true">
                ×
              </span>
            )}
            <Link to={`/prompt/${p.slug}`} className="lineage-parent">
              {p.entry.thumbnail && <img src={p.entry.thumbnail} alt="" loading="lazy" decoding="async" />}
              <span className="lineage-title">{p.entry.title}</span>
              <span className="lineage-gave">{p.gave}</span>
            </Link>
          </Fragment>
        ))}
      </div>
    </section>
  );
};

export default Lineage;
