import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptGrid from "@/components/PromptGrid";
import { builders, type Builder } from "@/data/builders";
import { useSeo } from "@/hooks/useSeo";
import { copyText } from "@/lib/copyText";

/**
 * One builder, one page. Everything that differs between these pages comes
 * out of `src/data/builders.ts` — the workflow, the steps, the paste-ready
 * preamble and the thing that usually goes wrong. The grid underneath is the
 * whole library, because the prompts themselves do not change; what changes
 * is the block you put in front of them.
 */
const BuilderPage = ({ builder }: { builder: Builder }) => {
  const [copied, setCopied] = useState(false);

  useSeo({
    title: builder.title,
    description: builder.description,
    canonical: builder.path,
  });

  const others = builders.filter((b) => b.path !== builder.path);

  const handleCopy = async () => {
    await copyText(builder.preamble);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <article className="builder">
          <nav className="builder-crumbs" aria-label="Breadcrumb">
            <Link to="/builders">BUILDERS</Link>
            <span aria-hidden="true">/</span>
            <span>{builder.name.toUpperCase()}</span>
          </nav>

          <header className="builder-head">
            <p className="builder-kind">{builder.kind.toUpperCase()}</p>
            <h1 className="builder-title">{builder.title}</h1>
            <p className="builder-lede">{builder.lede}</p>
          </header>

          <div className="builder-body">
            <section className="builder-section">
              <h2>How {builder.name} wants to be asked</h2>
              <p>{builder.how}</p>
              <p className="builder-gotcha">
                <strong>What usually goes wrong:</strong> {builder.gotcha}
              </p>
            </section>

            <section className="builder-section">
              <h2>Running one of these prompts in {builder.name}</h2>
              <ol className="builder-steps">
                {builder.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>

            <section className="builder-section">
              <h2>The {builder.name} preamble</h2>
              <p>
                Paste this first, then any prompt from the library underneath it. It is the whole
                adaptation: it tells {builder.name} what shape the output should take so the brief
                itself can stay about the design.
              </p>
              <div className="builder-preamble">
                <pre>{builder.preamble}</pre>
                <button type="button" className="builder-copy" onClick={handleCopy}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "COPIED" : "COPY PREAMBLE"}
                </button>
              </div>
            </section>
          </div>

          <div className="library-intro builder-grid-intro">
            <div className="library-intro-text">
              <p className="library-intro-kicker">PROMPTS FOR {builder.name.toUpperCase()}</p>
              <p className="library-intro-sub">
                Open the reference build first — that is exactly what the prompt produces.
              </p>
            </div>
          </div>
        </article>

        <PromptGrid />

        <section className="builder-others">
          <h2 className="builder-others-title">Not using {builder.name}?</h2>
          <ul className="builder-others-list">
            {others.map((b) => (
              <li key={b.path}>
                <Link to={b.path}>{b.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default BuilderPage;
