import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptThumb from "@/components/PromptThumb";
import { copyText } from "@/lib/copyText";
import { getPromptBySlug, getRelatedPrompts, visiblePrompts, categoryHref } from "@/data/prompts";
import { useSeo } from "@/hooks/useSeo";

const PromptDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = getPromptBySlug(slug);
  const [copied, setCopied] = useState(false);

  // Called before the not-found redirect below: hooks cannot be conditional.
  useSeo({
    title: entry?.title ?? "Not found",
    description: entry
      ? `${entry.description}. A single HTML file with no dependencies, plus the one-shot prompt that builds it.`
      : "",
    canonical: entry ? `/prompt/${entry.slug}` : undefined,
    image: entry?.thumbnail,
    imageSize: entry?.thumbnail ? [1200, 600] : undefined,
  });

  // Reset the copied flag when navigating between prompts
  useEffect(() => setCopied(false), [slug]);

  if (!entry) return <Navigate to="/" replace />;

  const index = visiblePrompts.findIndex((p) => p.slug === entry.slug);
  const prev = index > 0 ? visiblePrompts[index - 1] : null;
  const next = index >= 0 && index < visiblePrompts.length - 1 ? visiblePrompts[index + 1] : null;
  const related = getRelatedPrompts(entry);

  const handleCopy = async () => {
    await copyText(entry.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <article className="detail">
          <nav className="detail-crumbs" aria-label="Breadcrumb">
            <Link to="/">ALL</Link>
            <span aria-hidden="true">/</span>
            <Link to={categoryHref(entry.category)}>{entry.categoryLabel}</Link>
            <span aria-hidden="true">/</span>
            <span className="detail-crumbs-current">{entry.title}</span>
          </nav>

          <header className="detail-head">
            <p className="detail-kicker">{entry.categoryLabel} · ADDED {entry.added.toUpperCase()}</p>
            <h1 className="detail-title">{entry.title}</h1>
            <p className="detail-desc">{entry.description}</p>
          </header>

          <div className="detail-body">
            <section className="detail-preview" aria-label="Component preview">
              <div className="detail-preview-frame">
                <PromptThumb entry={entry} eager />
              </div>
              <p className="detail-preview-caption">
                {entry.video ? "RENDERED PREVIEW" : entry.thumbnail ? "LIVE SCREENSHOT" : "WIREFRAME PREVIEW"}
              </p>
            </section>

            <aside className="detail-meta">
              <dl>
                <div><dt>CATEGORY</dt><dd><Link to={categoryHref(entry.category)}>{entry.categoryLabel}</Link></dd></div>
                <div><dt>PREVIEW</dt><dd>{entry.preview.replace("-", " ").toUpperCase()}</dd></div>
                <div><dt>TILE</dt><dd>{entry.variant.toUpperCase()}</dd></div>
                <div><dt>ADDED</dt><dd>{entry.added}</dd></div>
                <div><dt>LENGTH</dt><dd>{entry.prompt.length} CHARS</dd></div>
                {entry.demo && <div><dt>DEMO</dt><dd>SINGLE FILE</dd></div>}
                {entry.repoUrl && <div><dt>SOURCE</dt><dd>GITHUB REPO</dd></div>}
              </dl>
              <button className="detail-copy-btn" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "COPIED" : "COPY PROMPT"}
              </button>
              {entry.demo && (
                <a className="detail-demo-btn" href={entry.demo} target="_blank" rel="noreferrer">
                  OPEN LIVE DEMO <ExternalLink size={12} />
                </a>
              )}
              {!entry.demo && entry.repoUrl && (
                <a className="detail-demo-btn" href={entry.repoUrl} target="_blank" rel="noreferrer">
                  VIEW CODE ON GITHUB <ExternalLink size={12} />
                </a>
              )}
              {entry.credits && entry.credits.length > 0 && (
                <div className="detail-credits">
                  <h2>BUILT ON</h2>
                  <ul>
                    {entry.credits.map((credit) => (
                      <li key={credit.href}>
                        <a href={credit.href} target="_blank" rel="noreferrer">
                          {credit.label} <ExternalLink size={11} />
                        </a>
                        {credit.note && <span>{credit.note}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          <section className="detail-prompt" aria-label="One-shot prompt">
            <div className="detail-prompt-head">
              <h2>ONE-SHOT PROMPT</h2>
              <button className="detail-copy-btn detail-copy-btn--ghost" onClick={handleCopy}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <pre className="detail-prompt-body">{entry.prompt}</pre>
            <p className="detail-prompt-hint">Paste it into your AI builder as-is, then iterate.</p>
          </section>

          {related.length > 0 && (
            <section className="detail-related" aria-label="More in this category">
              <h2>MORE IN {entry.categoryLabel}</h2>
              <ul className="detail-related-list">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link to={`/prompt/${r.slug}`} className="detail-related-card">
                      <div className="detail-related-thumb"><PromptThumb entry={r} /></div>
                      <span className="detail-related-title">{r.title}</span>
                      <span className="detail-related-desc">{r.description}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav className="detail-pager" aria-label="Prompt navigation">
            {prev ? (
              <Link to={`/prompt/${prev.slug}`} className="detail-pager-link">
                <ArrowLeft size={12} /><span>{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link to={`/prompt/${next.slug}`} className="detail-pager-link detail-pager-link--next">
                <span>{next.title}</span><ArrowRight size={12} />
              </Link>
            ) : <span />}
          </nav>
        </article>
      </main>
    </div>
  );
};

export default PromptDetail;
