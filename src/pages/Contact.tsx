import { useId, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PromptThumb from "@/components/PromptThumb";
import { useSeo } from "@/hooks/useSeo";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import { track } from "@/lib/track";
import { getPromptBySlug } from "@/data/prompts";

/**
 * /contact — hiring Ray and getting in touch, as one page. It asks one thing
 * first, what this is about, as five cards (three services, a build from
 * scratch, or just saying hello), and the form under it fits the answer: what
 * it asks for, what is required, what the button says. The panel beside the
 * form says what that choice gets you.
 *
 * ?tier=<id> preselects a card (teardown, refine, partner, build, hello).
 * ?template=<slug> comes from the HIRE RAY line on every template: it picks
 * BUILD and shows the template as the starting point. /hire redirects here
 * with its query intact.
 *
 * Hellos go to Netlify Forms as `contact`, everything else as `hire`; both
 * have twins in public/__forms.html, so the inboxes are unchanged.
 */

type TopicId = "teardown" | "refine" | "partner" | "build" | "hello";

/** Set a figure ("$450", "$2,500/mo") to show it on the card; null shows the fallback. */
const PRICES: Record<Exclude<TopicId, "hello">, string | null> = {
  teardown: null,
  refine: null,
  partner: null,
  build: null,
};

interface Topic {
  id: TopicId;
  name: string;
  /** One line on the card */
  pitch: string;
  /** The small print under it: price and turnaround */
  meta: string;
  badge?: string;
  /** The panel beside the form */
  gets: string[];
  /** The form: the link field (none for hello), the message field, the button */
  site?: { label: string; required: boolean };
  message: { label: string; placeholder: string; required: boolean };
  submit: string;
}

const TOPICS: Topic[] = [
  {
    id: "teardown",
    name: "Teardown",
    pitch: "Why your AI-built page looks generic, and what to fix first.",
    meta: `${PRICES.teardown ?? "Fixed price"} · 48 hours`,
    badge: "START HERE",
    gets: [
      "A written teardown and a recorded walkthrough",
      "Type, colour, layout, logo and copy, each flagged with why it reads as generic",
      "A ranked fix list you can hand straight to your agent",
    ],
    site: { label: "THE PAGE TO TEAR DOWN", required: true },
    message: { label: "ANYTHING RAY SHOULD KNOW? (OPTIONAL)", placeholder: "Who it's for, what you built it with, and what already feels off.", required: false },
    submit: "REQUEST A TEARDOWN",
  },
  {
    id: "refine",
    name: "Draft-to-Distinct",
    pitch: "Keep what works. Rebuild the parts that could belong to anyone.",
    meta: `${PRICES.refine ?? "Fixed quote"} · 1–2 weeks`,
    gets: [
      "Hero, type system and palette reworked around what's actually yours",
      "One signature motion moment",
      "Your brand as a design system and a one-shot prompt, so every regeneration stays on-brand",
    ],
    site: { label: "WHAT YOU BUILT", required: true },
    message: { label: "WHAT SHOULD IT FEEL LIKE? (OPTIONAL)", placeholder: "Who it's for, who you're up against, what to keep, and when you need it.", required: false },
    submit: "GET A QUOTE",
  },
  {
    id: "partner",
    name: "Design partner",
    pitch: "A senior eye on every draft your agents ship.",
    meta: `${PRICES.partner ?? "Monthly"} · Ongoing`,
    gets: [
      "Reviews and refinements on new pages and screens",
      "The system and prompt kept current as the product grows",
      "Several brands? Ray audits them all and goes deep on the flagship",
    ],
    site: { label: "YOUR PRODUCT OR STUDIO", required: true },
    message: { label: "WHAT ARE YOU SHIPPING? (OPTIONAL)", placeholder: "How many brands or products, how often you ship new drafts, and what you build with.", required: false },
    submit: "GET A QUOTE",
  },
  {
    id: "build",
    name: "Build from scratch",
    pitch: "A landing page, design system or motion piece, made to the library's standard.",
    meta: `${PRICES.build ? `From ${PRICES.build}` : "Fixed quote"} · Agreed up front`,
    gets: [
      "One page, designed, animated and responsive, in a single file you own",
      "Or your brand as a system board an agent can follow, or a signature motion piece",
      "Every build ships with its one-shot prompt, so your agent can keep editing it",
    ],
    site: { label: "PRODUCT OR WEBSITE (OPTIONAL)", required: false },
    message: { label: "WHAT ARE YOU LAUNCHING?", placeholder: "What it is, who it's for, when you need it, and a rough budget if you have one.", required: true },
    submit: "GET A QUOTE",
  },
  {
    id: "hello",
    name: "Say hello",
    pitch: "Questions, collaborations, press, or a component you'd like to see.",
    meta: "Reply by email",
    gets: [],
    message: { label: "MESSAGE", placeholder: "What's on your mind?", required: true },
    submit: "SEND MESSAGE",
  },
];

const STEPS = [
  "Send the link to what you built, or tell Ray what you're launching.",
  "Ray replies within a day with a start date and a fixed price.",
  "You get the files, the system and the prompt. No dependencies, no lock-in. It's yours outright.",
];

const isTopic = (v: string | null): v is TopicId => TOPICS.some((t) => t.id === v);

type Fields = { name: string; email: string; website: string; message: string };
type FieldKey = keyof Fields;
type Status = "idle" | "sending" | "sent" | "error";
const EMPTY: Fields = { name: "", email: "", website: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  useSeo({
    title: "Contact and hire Ray",
    description:
      "Hire Ray Velez, the designer behind InstaLanding.ai, for a teardown, a Draft-to-Distinct refinement, an ongoing design partnership or a build from scratch, or just say hello.",
    canonical: "/contact",
  });

  const [params, setParams] = useSearchParams();
  const startFrom = getPromptBySlug(params.get("template") ?? undefined);
  const asked = params.get("tier");
  // A template link means "build me this one"; with nothing asked, it's a hello.
  const topicId: TopicId = isTopic(asked) ? asked : startFrom ? "build" : "hello";
  const topic = TOPICS.find((t) => t.id === topicId)!;
  const hire = topic.id !== "hello";

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ key: FieldKey | null; message: string } | null>(null);
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setError(null);
    }
  };
  const set = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    clearError();
  };
  const invalid = (key: FieldKey) => status === "error" && error?.key === key;
  const describedBy = (key: FieldKey) => (invalid(key) ? id("error") : undefined);

  const pick = (next: TopicId) => {
    params.set("tier", next);
    setParams(params, { replace: true });
    track("contact_topic", { topic: next });
    clearError();
  };
  const clearTemplate = () => {
    params.delete("template");
    setParams(params, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const problem: { key: FieldKey; message: string } | null =
      hire && !fields.name.trim()
        ? { key: "name", message: "Add your name." }
        : !EMAIL_RE.test(fields.email.trim())
          ? { key: "email", message: "Add an email Ray can reply to." }
          : topic.site?.required && !fields.website.trim()
            ? { key: "website", message: "Add the link so Ray can look at it." }
            : topic.message.required && !fields.message.trim()
              ? { key: "message", message: topic.id === "build" ? "Tell Ray what you're launching." : "Add a message." }
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
      if (hire) {
        await submitNetlifyForm("hire", {
          "bot-field": botField,
          name: fields.name.trim(),
          email: fields.email.trim(),
          website: fields.website.trim(),
          tier: topic.name,
          template: startFrom ? `${startFrom.title} (/prompt/${startFrom.slug})` : "",
          message: fields.message.trim(),
        });
        track("hire_request", { tier: topic.id, template: startFrom?.slug ?? "none" });
      } else {
        await submitNetlifyForm("contact", {
          "bot-field": botField,
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
        });
        track("contact_submit");
      }
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
        <section className="contrib cx">
          <header className="contrib-head">
            <h1 className="about-name">Contact</h1>
            <p className="about-role">Hire Ray for a project, or just say hello.</p>
          </header>

          <fieldset className="cx-topics">
            <legend className="contrib-kicker">WHAT CAN RAY HELP WITH?</legend>
            <div className="cx-topic-grid">
              {TOPICS.map((t) => (
                <label key={t.id} className={`cx-topic${t.id === topic.id ? " is-on" : ""}${t.id === "hello" ? " cx-topic--hello" : ""}`}>
                  <input type="radio" name="topic" value={t.id} checked={t.id === topic.id} onChange={() => pick(t.id)} className="cx-topic-input" />
                  <span className="cx-topic-top">
                    <span className="cx-topic-name">{t.name}</span>
                    {t.badge && <span className="cx-topic-badge">{t.badge}</span>}
                  </span>
                  <span className="cx-topic-pitch">{t.pitch}</span>
                  <span className="cx-topic-meta">{t.meta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="contrib-grid cx-grid">
            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <Check size={16} aria-hidden="true" />
                  <p>{hire ? "Sent. Ray will reply by email within a day." : "Sent. Ray will get back to you by email."}</p>
                  <button type="button" className="contact-submit" onClick={() => setStatus("idle")}>
                    SEND ANOTHER
                  </button>
                </div>
              ) : (
                <form
                  name={hire ? "hire" : "contact"}
                  method="POST"
                  data-netlify="true"
                  netlify-honeypot="bot-field"
                  className="contact-form"
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label={hire ? `${topic.name} request` : "Message to Ray"}
                >
                  <input type="hidden" name="form-name" value={hire ? "hire" : "contact"} />
                  {/* Honeypot: people never see it, bots fill it, Netlify drops those. */}
                  <p className="contact-trap" aria-hidden="true">
                    <label>
                      Leave this empty
                      <input name="bot-field" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
                    </label>
                  </p>

                  {startFrom && hire && (
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
                      <label className="contact-label" htmlFor={id("name")}>{hire ? "YOUR NAME" : "NAME (OPTIONAL)"}</label>
                      <input id={id("name")} name="name" className="contact-input" autoComplete="name" required={hire}
                        value={fields.name} onChange={set("name")} aria-invalid={invalid("name")} aria-describedby={describedBy("name")} />
                    </div>
                    <div>
                      <label className="contact-label" htmlFor={id("email")}>EMAIL</label>
                      <input id={id("email")} name="email" type="email" inputMode="email" className="contact-input" autoComplete="email" required
                        value={fields.email} onChange={set("email")} aria-invalid={invalid("email")} aria-describedby={describedBy("email")} />
                    </div>
                  </div>

                  {topic.site && (
                    <>
                      <label className="contact-label" htmlFor={id("website")}>{topic.site.label}</label>
                      <input id={id("website")} name="website" className="contact-input" placeholder="yourproduct.com" inputMode="url"
                        required={topic.site.required} value={fields.website} onChange={set("website")}
                        aria-invalid={invalid("website")} aria-describedby={describedBy("website")} />
                    </>
                  )}

                  <label className="contact-label" htmlFor={id("message")}>{topic.message.label}</label>
                  <textarea id={id("message")} name="message" rows={6} className="contact-input contact-textarea" required={topic.message.required}
                    placeholder={topic.message.placeholder}
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
                        {topic.submit} <ArrowRight size={14} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <aside className="contrib-explainer cx-aside" aria-live="polite">
              {hire ? (
                <>
                  <h2 className="contrib-kicker">WHAT YOU GET · {topic.name.toUpperCase()}</h2>
                  <ul className="cx-gets">
                    {topic.gets.map((g) => (
                      <li key={g}>
                        <Check size={12} aria-hidden="true" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                  <h2 className="contrib-kicker">HOW IT WORKS</h2>
                  <ol className="hire-steps">
                    {STEPS.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="contrib-soon">
                    <strong>PRICE:</strong> fixed and agreed before any work starts.
                  </p>
                </>
              ) : (
                <>
                  <p className="sponsor-mission">Ray reads every message.</p>
                  <p>
                    Questions about the library, a collaboration, press, or a page you'd like to see in it. Replies come
                    by email, usually within a day or two.
                  </p>
                  <p>
                    Want something built or fixed instead? Pick one of the services above and the form will ask for
                    what Ray needs.
                  </p>
                </>
              )}
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;
