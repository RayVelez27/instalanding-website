import { useId, useState } from "react";
import { ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useSeo } from "@/hooks/useSeo";
import { submitNetlifyFormWithFiles } from "@/lib/netlifyForms";

/**
 * /contribute — community template submissions.
 *
 * Goes to Netlify Forms as `contribute` (twin in public/__forms.html). The
 * pasted HTML travels as an attached .html file rather than a text field:
 * library pages run 100–400 KB, and a file lands in the Netlify dashboard as
 * something Ray can download and open directly.
 */
const FORM_NAME = "contribute";
/** Netlify caps a whole submission at 8 MB; leave room for the other fields. */
const MAX_HTML_BYTES = 7 * 1024 * 1024;

/** The prompt to hand Claude so the page meets the library's one-shot rules (AGENTS.md). */
const CLAUDE_PROMPT = `Make this landing page ready to submit to the InstaLanding.ai library. Rules:

1. One self-contained HTML file. Inline all CSS, JS and SVG; inline images as base64. CDN <script> tags (GSAP, Three.js, Rive) and Google Fonts are fine. No hotlinked images, no build step, no framework, no backend. It must work opened straight from disk.
2. Right after <!doctype html>, add a header comment: the title, one line on what it is, a MAP (where the design tokens live, the section names in order, one line per script saying what it drives) and ADAPTING notes (what breaks if someone edits it naively).
3. Put data-section="nav", "hero", "features", "pricing", "faq", "cta", "footer" (or a short specific name) on every top-level region, in order.
4. Accessibility: <html lang>, exactly one <h1>, a <main>, labels on icon-only buttons, aria-hidden on decorative canvases and art, visible focus rings, and respect prefers-reduced-motion.
5. Responsive: no horizontal scroll at 390px wide, and polished at 1440px.
6. Use a fictional brand and original copy. No real company names, logos or photos of real people.
7. Return the complete file in a single code block.`;

const SOCIAL_HOSTS = /(^|\.)(instagram\.com|x\.com|twitter\.com|linkedin\.com|github\.com)$/i;

const isSocialUrl = (value: string) => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return SOCIAL_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value);

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "template";

type Fields = {
  template_name: string;
  template_description: string;
  submitter_name: string;
  social_1: string;
  social_2: string;
  html: string;
};
type FieldKey = keyof Fields;
type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Fields = { template_name: "", template_description: "", submitter_name: "", social_1: "", social_2: "", html: "" };

const validate = (f: Fields): { key: FieldKey; message: string } | null => {
  if (!f.template_name.trim()) return { key: "template_name", message: "Give the template a name." };
  if (!f.template_description.trim()) return { key: "template_description", message: "Add a short description." };
  if (!f.submitter_name.trim()) return { key: "submitter_name", message: "Add your name so we can credit you." };
  if (f.social_1.trim() && !isSocialUrl(f.social_1.trim()))
    return { key: "social_1", message: "Social links must be Instagram, X, LinkedIn or GitHub." };
  if (f.social_2.trim() && !isSocialUrl(f.social_2.trim()))
    return { key: "social_2", message: "Social links must be Instagram, X, LinkedIn or GitHub." };
  if (!f.html.trim()) return { key: "html", message: "Paste the full HTML file." };
  if (!/<html[\s>]/i.test(f.html) || !/<\/html>/i.test(f.html))
    return { key: "html", message: "That isn't a full HTML file. It needs the whole page, from <!doctype html> to </html>." };
  if (new Blob([f.html]).size > MAX_HTML_BYTES) return { key: "html", message: "That file is over 7 MB. Compress the inlined images and try again." };
  return null;
};

const CopyPrompt = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the prompt is on screen to select by hand */
    }
  };
  return (
    <button type="button" className="contrib-copy" onClick={copy}>
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {copied ? "COPIED" : "COPY PROMPT"}
    </button>
  );
};

const Contribute = () => {
  useSeo({
    title: "Contribute a template",
    description:
      "Submit your own single-file HTML landing page to the InstaLanding.ai library, plus the Claude prompt that makes it one-shot ready.",
    canonical: "/contribute",
  });

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ key: FieldKey | null; message: string } | null>(null);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (status === "error") {
      setStatus("idle");
      setError(null);
    }
  };

  const invalid = (key: FieldKey) => status === "error" && error?.key === key;
  const describedBy = (key: FieldKey) => (invalid(key) ? id("error") : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const problem = validate(fields);
    if (problem) {
      setError(problem);
      setStatus("error");
      document.getElementById(id(problem.key))?.focus();
      return;
    }

    setStatus("sending");
    setError(null);
    const { html, ...rest } = fields;
    const file = new File([html], `${slugify(fields.template_name)}.html`, { type: "text/html" });
    try {
      await submitNetlifyFormWithFiles(
        FORM_NAME,
        {
          "bot-field": botField,
          ...rest,
          social_1: normalizeUrl(rest.social_1.trim()),
          social_2: normalizeUrl(rest.social_2.trim()),
          html_bytes: String(file.size),
        },
        { html_file: file },
      );
      setStatus("sent");
      setFields(EMPTY);
    } catch {
      setError({ key: null, message: "That didn't send. Try again in a moment." });
      setStatus("error");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <section className="contrib">
          <header className="contrib-head">
            <h1 className="about-name">Contribute</h1>
            <p className="about-role">Built a one-shot page you're proud of? Submit it to the library.</p>
          </header>

          <div className="contrib-grid">
            <aside className="contrib-explainer" aria-labelledby={id("how")}>
              <h2 id={id("how")} className="contrib-kicker">MAKE IT SUBMITTABLE</h2>
              <p>
                Every page in the library is one HTML file that runs on its own, with no build step. Before you
                submit, give Claude your page and this prompt:
              </p>
              <div className="contrib-prompt">
                <div className="contrib-prompt-bar">
                  <span>PROMPT FOR CLAUDE</span>
                  <CopyPrompt />
                </div>
                <pre>{CLAUDE_PROMPT}</pre>
              </div>
              <p>
                Then open the file straight from your desktop. If it looks right there, at phone width and at
                full width, it's ready. Accepted pages are credited to you, link to your socials, and are
                published under the library's MIT licence.
              </p>
              <p className="contrib-soon">
                <strong>COMING SOON:</strong> accounts, uploading more than one page, remixing other templates
                and a web editor. Submit now and you'll be first in line.
              </p>
            </aside>

            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <Check size={16} aria-hidden="true" />
                  <p>Submitted. Ray reviews every page. If yours is accepted, it goes live with your credit.</p>
                  <button type="button" className="contact-submit" onClick={() => setStatus("idle")}>
                    SUBMIT ANOTHER
                  </button>
                </div>
              ) : (
                <form
                  name={FORM_NAME}
                  method="POST"
                  encType="multipart/form-data"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  className="contact-form"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  <input type="hidden" name="form-name" value={FORM_NAME} />
                  {/* Honeypot: people never see it, bots fill it, Netlify drops those. */}
                  <p className="contact-trap" aria-hidden="true">
                    <label>
                      Leave this empty
                      <input name="bot-field" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
                    </label>
                  </p>

                  <label className="contact-label" htmlFor={id("template_name")}>NAME OF TEMPLATE</label>
                  <input
                    id={id("template_name")}
                    name="template_name"
                    className="contact-input"
                    required
                    value={fields.template_name}
                    onChange={set("template_name")}
                    aria-invalid={invalid("template_name")}
                    aria-describedby={describedBy("template_name")}
                  />

                  <label className="contact-label" htmlFor={id("template_description")}>DESCRIPTION OF TEMPLATE</label>
                  <textarea
                    id={id("template_description")}
                    name="template_description"
                    rows={3}
                    required
                    className="contact-input contact-textarea contrib-desc"
                    placeholder="What is it, who is it for, what makes it stand out?"
                    value={fields.template_description}
                    onChange={set("template_description")}
                    aria-invalid={invalid("template_description")}
                    aria-describedby={describedBy("template_description")}
                  />

                  <label className="contact-label" htmlFor={id("submitter_name")}>YOUR NAME</label>
                  <input
                    id={id("submitter_name")}
                    name="submitter_name"
                    className="contact-input"
                    autoComplete="name"
                    required
                    value={fields.submitter_name}
                    onChange={set("submitter_name")}
                    aria-invalid={invalid("submitter_name")}
                    aria-describedby={describedBy("submitter_name")}
                  />

                  <div className="contrib-pair">
                    {(["social_1", "social_2"] as const).map((key, i) => (
                      <div key={key}>
                        <label className="contact-label" htmlFor={id(key)}>SOCIAL LINK {i + 1}</label>
                        <input
                          id={id(key)}
                          name={key}
                          type="url"
                          inputMode="url"
                          className="contact-input"
                          placeholder={i === 0 ? "x.com/you" : "github.com/you"}
                          value={fields[key]}
                          onChange={set(key)}
                          aria-invalid={invalid(key)}
                          aria-describedby={describedBy(key)}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="contrib-hint">Instagram, X, LinkedIn or GitHub. Optional.</p>

                  <label className="contact-label" htmlFor={id("html")}>FULL HTML</label>
                  <textarea
                    id={id("html")}
                    className="contact-input contact-textarea contrib-html"
                    rows={10}
                    required
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder={"<!doctype html>\n<html lang=\"en\">\n…\n</html>"}
                    value={fields.html}
                    onChange={set("html")}
                    aria-invalid={invalid("html")}
                    aria-describedby={describedBy("html")}
                  />

                  {error && (
                    <p className="contact-error" id={id("error")} role="alert">
                      {error.message}
                    </p>
                  )}

                  <button type="submit" className="contact-submit" disabled={status === "sending"}>
                    {status === "sending" ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        SUBMIT TEMPLATE <ArrowRight size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contribute;
