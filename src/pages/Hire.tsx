import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptThumb from "@/components/PromptThumb";
import { useSeo } from "@/hooks/useSeo";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import { track } from "@/lib/track";
import { getPromptBySlug, type PromptEntry } from "@/data/prompts";

/**
 * /hire — paid custom work: the offer, how it runs, a few pages as proof, and
 * a request form. In the sidebar nav as HIRE; every template links here with
 * ?template=<slug>, which preselects it as the starting point.
 *
 * Goes to Netlify Forms as `hire` (twin in public/__forms.html).
 */
const FORM_NAME = "hire";

/** Set to a figure ("$1,500") to show a starting price; null shows "quoted per project". */
const PRICE_FROM: string | null = null;

const OFFER = [
  { title: "Landing page", body: "One page in the library's standard: designed, animated, responsive, in a single file you own." },
  { title: "Design system", body: "Your brand as a system board: type, colour, components and the rules an agent follows." },
  { title: "Motion", body: "A signature interaction or scroll piece for an existing site." },
  { title: "Agent-ready handoff", body: "Every build ships with its one-shot prompt, so your agent can keep editing it." },
];

const STEPS = [
  "Tell me what you're launching, and the template you like if there is one.",
  "I reply with a fixed quote and a style direction.",
  "You get the finished file, with no dependencies and no lock-in. It's yours outright.",
];

// The most-opened pages in the library: proof of the standard.
const WORK = [
  "sunset-scroll-story-page",
  "game-dev-agent-landing-page",
  "monax-analytics-landing-page",
  "card-scanner-finance-page",
]
  .map((slug) => getPromptBySlug(slug))
  .filter((e): e is PromptEntry => !!e);

type Fields = { name: string; email: string; website: string; message: string };
type FieldKey = keyof Fields;
type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Fields = { name: "", email: "", website: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Hire = () => {
  useSeo({
    title: "Hire Ray: custom landing pages",
    description:
      "A custom landing page, design system or motion piece from the designer behind InstaLanding.ai. Single file, yours outright, agent-ready.",
    canonical: "/hire",
  });

  const [params, setParams] = useSearchParams();
  const startFrom = getPromptBySlug(params.get("template") ?? undefined);
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

  const clearTemplate = () => {
    params.delete("template");
    setParams(params, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const problem: { key: FieldKey; message: string } | null = !fields.name.trim()
      ? { key: "name", message: "Add your name." }
      : !EMAIL_RE.test(fields.email.trim())
        ? { key: "email", message: "Add an email Ray can reply to." }
        : !fields.message.trim()
          ? { key: "message", message: "Tell Ray what you're launching." }
          : null;
    if (problem) {
      setError(problem);
      setStatus("error");
      document.getElementById(id(problem.key))?.focus();
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      await submitNetlifyForm(FORM_NAME, {
        "bot-field": botField,
        name: fields.name.trim(),
        email: fields.email.trim(),
        website: fields.website.trim(),
        template: startFrom ? `${startFrom.title} (/prompt/${startFrom.slug})` : "",
        message: fields.message.trim(),
      });
      track("hire_request", { template: startFrom?.slug ?? "none" });
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
            <h1 className="about-name">Hire</h1>
            <p className="about-role">Your landing page, built by the person who builds these.</p>
          </header>

          <div className="contrib-grid">
            <aside className="contrib-explainer" aria-labelledby={id("offer")}>
              <p className="sponsor-mission">
                Like a page here, but want it made for your product? I'll build it.
              </p>

              <h2 id={id("offer")} className="contrib-kicker">WHAT I BUILD</h2>
              <ul className="sponsor-list">
                {OFFER.map((o) => (
                  <li key={o.title}>
                    <strong>{o.title}</strong>
                    <span>{o.body}</span>
                  </li>
                ))}
              </ul>

              <h2 className="contrib-kicker">HOW IT WORKS</h2>
              <ol className="hire-steps">
                {STEPS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>

              {WORK.length > 0 && (
                <>
                  <h2 className="contrib-kicker">THE STANDARD</h2>
                  <ul className="hire-work">
                    {WORK.map((w) => (
                      <li key={w.slug}>
                        <Link to={`/prompt/${w.slug}`}>
                          <span className="hire-work-thumb"><PromptThumb entry={w} /></span>
                          <span className="hire-work-title">{w.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <p className="contrib-soon">
                <strong>PRICE:</strong> {PRICE_FROM ? `from ${PRICE_FROM}, ` : ""}fixed, quoted per project and agreed before
                I start.
              </p>
            </aside>

            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <Check size={16} aria-hidden="true" />
                  <p>Sent. Ray will reply by email with a quote.</p>
                  <button type="button" className="contact-submit" onClick={() => setStatus("idle")}>
                    SEND ANOTHER
                  </button>
                </div>
              ) : (
                <form
                  name={FORM_NAME}
                  method="POST"
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

                  {startFrom && (
                    <div className="hire-start">
                      <span className="hire-start-thumb"><PromptThumb entry={startFrom} /></span>
                      <span className="hire-start-text">
                        <span className="contact-label">STARTING FROM</span>
                        <strong>{startFrom.title}</strong>
                      </span>
                      <button type="button" className="hire-start-clear" onClick={clearTemplate} aria-label="Don't start from this template">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div className="contrib-pair">
                    <div>
                      <label className="contact-label" htmlFor={id("name")}>YOUR NAME</label>
                      <input id={id("name")} name="name" className="contact-input" autoComplete="name" required
                        value={fields.name} onChange={set("name")} aria-invalid={invalid("name")} aria-describedby={describedBy("name")} />
                    </div>
                    <div>
                      <label className="contact-label" htmlFor={id("email")}>EMAIL</label>
                      <input id={id("email")} name="email" type="email" inputMode="email" className="contact-input" autoComplete="email" required
                        value={fields.email} onChange={set("email")} aria-invalid={invalid("email")} aria-describedby={describedBy("email")} />
                    </div>
                  </div>

                  <label className="contact-label" htmlFor={id("website")}>PRODUCT OR WEBSITE (OPTIONAL)</label>
                  <input id={id("website")} name="website" className="contact-input" placeholder="yourproduct.com"
                    value={fields.website} onChange={set("website")} />

                  <label className="contact-label" htmlFor={id("message")}>WHAT ARE YOU LAUNCHING?</label>
                  <textarea id={id("message")} name="message" rows={6} className="contact-input contact-textarea" required
                    placeholder="What it is, who it's for, when you need it, and a rough budget if you have one."
                    value={fields.message} onChange={set("message")} aria-invalid={invalid("message")} aria-describedby={describedBy("message")} />

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
                        GET A QUOTE <ArrowRight size={14} aria-hidden="true" />
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

export default Hire;
