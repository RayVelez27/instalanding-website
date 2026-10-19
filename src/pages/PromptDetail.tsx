import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Copy, Download, ExternalLink, MessageSquare } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptThumb from "@/components/PromptThumb";
import PromptStage from "@/components/PromptStage";
import TemplateFeedback from "@/components/TemplateFeedback";
import { loadDemoSource } from "@/lib/demoSource";
import { copyText } from "@/lib/copyText";
import { useCopyCode } from "@/lib/useCopyCode";
import { getPromptBySlug, getRelatedPrompts, visiblePrompts, categoryHref } from "@/data/prompts";
import { getSystemForTemplate } from "@/data/systems";
import { motionsForPage } from "@/data/motion";
import { useSeo } from "@/hooks/useSeo";
import { useIsPhone } from "@/hooks/useIsPhone";
import PromptDetailPhone from "@/components/PromptDetailPhone";

/**
 * The standalone /prompt/:slug page: what a shared link, a refresh, a new tab
 * or a crawler gets. It shows the same live preview and the same main actions
 * as the dialog (PromptStage and useCopyCode are shared, so the two cannot
 * drift), plus what only a page needs: breadcrumbs, the details, the full
 * prompt (the brief plus the demo's full source, which is what makes the
 * output exact) and related entries.
 */
const PromptDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const entry = getPromptBySlug(slug);
  const [promptCopied, setPromptCopied] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const { copy, copied, label: copyLabel, text: copyCaption, source, code } = useCopyCode(entry);
  const phone = useIsPhone();

  // Called before the not-found redirect below: hooks cannot be conditional.
  useSeo({
    title: entry?.title ?? "Not found",
    description: entry
      ? entry.youtube
        ? `${entry.description}.`
        : `${entry.description}. A single HTML file with no dependencies, plus the one-shot prompt that builds it.`
      : "",
    canonical: entry ? `/prompt/${entry.slug}` : undefined,
    image: entry?.thumbnail,
    imageSize: entry?.thumbnail ? [1200, 600] : undefined,
  });

  // Reset the per-entry state when navigating between prompts
  useEffect(() => {
    setPromptCopied(false);
    setFeedback(false);
  }, [slug]);

  if (!entry) return <Navigate to="/pages" replace />;

  const index = visiblePrompts.findIndex((p) => p.slug === entry.slug);
  const prev = index > 0 ? visiblePrompts[index - 1] : null;
  const next = index >= 0 && index < visiblePrompts.length - 1 ? visiblePrompts[index + 1] : null;
  const related = getRelatedPrompts(entry);
  const system = getSystemForTemplate(entry.slug);
  const motions = motionsForPage(entry.slug);

  const file = entry.demo?.split("/").pop() ?? "index.html";

  // A brief alone is ambiguous, so the prompt section copies the brief together
  // with the reference source when the entry has a single-file demo.
  const withSource = (src: string) =>
    [
      entry.prompt,
      "---",
      "REFERENCE BUILD. This is the exact expected output. Reproduce it faithfully, then adapt the content.",
      `${file}:`,
      "```html\n" + src + "\n```",
    ].join("\n\n") + "\n";
  const handleCopyPrompt = async () => {
    if (!entry.demo) await copyText(entry.prompt);
    else await copyText(withSource(code ?? (await loadDemoSource(entry.demo))));
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Phones get their own page: a preview to try, one action bar, the rest folded away
  if (phone) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main>
          <PromptDetailPhone
            entry={entry}
            prev={prev}
            next={next}
            related={related}
            system={system}
            motions={motions}
            file={file}
            code={code}
            promptCopied={promptCopied}
            onCopyPrompt={handleCopyPrompt}
            onCopyCode={copy}
            codeCopied={copied}
            codeFailed={source.status === "error"}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <article className="detail">
          <nav className="detail-crumbs" aria-label="Breadcrumb">
            <Link to="/pages">ALL</Link>
            <span aria-hidden="true">/</span>
            <Link to={categoryHref(entry.category)}>{entry.categoryLabel}</Link>
            <span aria-hidden="true">/</span>
            <span className="detail-crumbs-current">{entry.title}</span>
          </nav>

          <header className="detail-head">
            <p className="detail-kicker">
              {entry.categoryLabel} · ADDED {entry.added.toUpperCase()}
              {entry.theme && (
                <span className={`pmodal-theme pmodal-theme--${entry.theme}`}>
                  <span className="pmodal-theme-dot" aria-hidden="true" />
                  {entry.theme === "dark" ? "DARK" : "LIGHT"}
                </span>
              )}
            </p>
            <h1 className="detail-title">{entry.title}</h1>
            <p className="detail-desc">{entry.description}</p>
          </header>

          <div className="pmodal-actions detail-actions">
            {entry.youtube ? (
              <a
                className="pmodal-btn pmodal-btn--solid"
                href={`https://www.youtube.com/watch?v=${entry.youtube}`}
                target="_blank"
                rel="noreferrer"
                title="Watch on YouTube"
              >
                <span className="pmodal-label">WATCH ON YOUTUBE</span> <ExternalLink size={12} aria-hidden="true" />
              </a>
            ) : (
              <button className="pmodal-btn pmodal-btn--solid" onClick={copy} aria-live="polite" title={copyLabel}>
                {copied === "done" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                <span className="pmodal-label">{copyCaption}</span>
              </button>
            )}
            {entry.demo && (
              <a className="pmodal-btn" href={entry.demo} target="_blank" rel="noreferrer" title="Open in a new tab">
                <span className="pmodal-label">NEW TAB</span> <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            {!entry.demo && entry.repoUrl && (
              <a className="pmodal-btn" href={entry.repoUrl} target="_blank" rel="noreferrer" title="View code">
                <span className="pmodal-label">VIEW CODE</span> <ExternalLink size={12} aria-hidden="true" />
              </a>
            )}
            {system && (
              <Link className="pmodal-btn" to={`/systems/${system.slug}`} title={`The ${system.name} design system this template is built on`}>
                <span className="pmodal-label">VIEW DESIGN SYSTEM</span> <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            )}
            {motions.map((m) => (
              <Link key={m.slug} className="pmodal-btn" to={`/motion/${m.slug}`} title={`${m.title}: a motion study that pairs with this page`}>
                <span className="pmodal-label">MOTION · {m.title.toUpperCase()}</span> <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            ))}
            <button
              className="pmodal-btn"
              aria-pressed={feedback}
              aria-controls="detail-feedback"
              onClick={() => setFeedback((f) => !f)}
              title="Send feedback on this template"
            >
              <MessageSquare size={12} aria-hidden="true" />
              <span className="pmodal-label">FEEDBACK</span>
            </button>
          </div>

          {feedback && (
            <section className="detail-feedback" id="detail-feedback" aria-label="Feedback">
              <TemplateFeedback key={entry.slug} entry={entry} onDone={() => setFeedback(false)} />
            </section>
          )}

          <div className="detail-stage">
            <PromptStage entry={entry} source={source} />
          </div>

          <div className="detail-body">
            <aside className="detail-meta">
              <dl>
                <div><dt>CATEGORY</dt><dd><Link to={categoryHref(entry.category)}>{entry.categoryLabel}</Link></dd></div>
                {entry.youtube ? (
                  <div><dt>SOURCE</dt><dd>YOUTUBE</dd></div>
                ) : (
                  <div><dt>PREVIEW</dt><dd>{entry.demo ? "LIVE DEMO" : entry.preview.replace("-", " ").toUpperCase()}</dd></div>
                )}
                <div><dt>ADDED</dt><dd>{entry.added}</dd></div>
                {!entry.youtube && <div><dt>LENGTH</dt><dd>{entry.prompt.length} CHARS</dd></div>}
                {entry.demo && <div><dt>DEMO</dt><dd>SINGLE FILE</dd></div>}
                {entry.repoUrl && <div><dt>SOURCE</dt><dd>GITHUB REPO</dd></div>}
              </dl>
            </aside>
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
          </div>

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

          {!entry.youtube && (
            <section className="detail-prompt" aria-label="One-shot prompt">
              <div className="detail-prompt-head">
                <h2>ONE-SHOT PROMPT</h2>
                <button className="detail-copy-btn detail-copy-btn--ghost" onClick={handleCopyPrompt}>
                  {promptCopied ? <Check size={12} /> : <Copy size={12} />}
                  {promptCopied ? "COPIED" : "COPY PROMPT"}
                </button>
              </div>
              <pre className="detail-prompt-body">{entry.prompt}</pre>
              {entry.demo && (
                <div className="detail-prompt-ref">
                  <p className="detail-prompt-ref-title">+ REFERENCE BUILD</p>
                  <p>
                    The full source of <b>{file}</b>
                    {code && ` (${code.split("\n").length.toLocaleString()} lines · ${Math.round(code.length / 1024)} KB)`} is
                    part of this prompt: COPY PROMPT adds it under the brief as the exact expected output.
                  </p>
                  <p className="detail-prompt-ref-links">
                    <a href={entry.demo} target="_blank" rel="noreferrer">
                      Open the live page <ExternalLink size={11} aria-hidden="true" />
                    </a>
                    <a href={entry.demo} download={file}>
                      Download {file} <Download size={11} aria-hidden="true" />
                    </a>
                  </p>
                </div>
              )}
              <p className="detail-prompt-hint">Paste it into your AI builder as-is, then iterate.</p>
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
