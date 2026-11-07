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
 * /hire — paid work, sold as three tiers for founders who already shipped an
 * AI-built draft (Teardown → Draft-to-Distinct → Design partner), plus the
 * original from-scratch build. In the sidebar nav as HIRE; every template
 * links here with ?template=<slug>, which preselects it and the BUILD service.
 * ?tier=<id> preselects a service.
 *
 * Goes to Netlify Forms as `hire` (twin in public/__forms.html).
 */
const FORM_NAME = "hire";

type TierId = "teardown" | "refine" | "partner" | "build";

/** Set a figure ("$450", "$2,500/mo") to show it on the card; null shows the fallback. */
const PRICES: Record<TierId, string | null> = {
  teardown: null,
  refine: null,
  partner: null,
  build: null,
};

const TIERS: {
  id: Exclude<TierId, "build">;
  name: string;
  fallback: string;
  turnaround: string;
  pitch: string;
  includes: string[];
  lead?: boolean;
}[] = [
  {
    id: "teardown",
    name: "Teardown",
    fallback: "Fixed price",
    turnaround: "48 hours",
    pitch: "Send the URL. Get back exactly why it reads as AI-made, and what to fix first.",
    includes: [
      "Written teardown and a recorded walkthrough",
      "Type, colour, layout, logo and copy, each flagged with the reason it reads as generic",
      "A ranked fix list you can hand straight to your agent",
    ],
    lead: true,
  },
  {
    id: "refine",
    name: "Draft-to-Distinct",
    fallback: "Fixed quote",
    turnaround: "1–2 weeks",
    pitch: "Keep what works. Rebuild the parts that could belong to anyone.",
    includes: [
      "Hero, type system and palette reworked around what's actually yours",
      "One signature motion moment",
      "Your brand as a design system and a one-shot prompt, so every regeneration stays on-brand",
    ],
  },
  {
    id: "partner",
    name: "Design partner",
    fallback: "Monthly",
    turnaround: "Ongoing",
    pitch: "A senior eye on every draft your agents ship.",
    includes: [
      "Reviews and refinements on new pages and screens",
      "The system and prompt kept current as the product grows",
      "Several brands? I audit them all and go deep on the flagship",
    ],
  },
];

/** The form's service picker: the three tiers, plus a page built from scratch. */
const SERVICES: { id: TierId; label: string }[] = [
  ...TIERS.map((t) => ({ id: t.id, label: t.name })),
  { id: "build", label: "Build from scratch" },
];
const isTier = (v: string | null): v is TierId => SERVICES.some((s) => s.id === v);

/** What the form asks for, per service. */
const ASK: Record<TierId, { site: string; siteRequired: boolean; message: string; placeholder: string }> = {
  teardown: {
    site: "THE PAGE TO TEAR DOWN",
    siteRequired: true,
    message: "ANYTHING I SHOULD KNOW? (OPTIONAL)",
    placeholder: "Who it's for, what you built it with, and what already feels off.",
  },
  refine: {
    site: "WHAT YOU BUILT",
    siteRequired: true,
    message: "WHAT SHOULD IT FEEL LIKE? (OPTIONAL)",
    placeholder: "Who it's for, who you're up against, what to keep, and when you need it.",
  },
  partner: {
    site: "YOUR PRODUCT OR STUDIO",
    siteRequired: true,
    message: "WHAT ARE YOU SHIPPING? (OPTIONAL)",
    placeholder: "How many brands or products, how often you ship new drafts, and what you build with.",
  },
  build: {
    site: "PRODUCT OR WEBSITE (OPTIONAL)",
    siteRequired: false,
    message: "WHAT ARE YOU LAUNCHING?",
    placeholder: "What it is, who it's for, when you need it, and a rough budget if you have one.",
  },
};

/** The original offer, now the fourth service. */
const OFFER = [
  { title: "Landing page", body: "One page in the library's standard: designed, animated, responsive, in a single file you own." },
  { title: "Design system", body: "Your brand as a system board: type, colour, components and the rules an agent follows." },
  { title: "Motion", body: "A signature interaction or scroll piece for an existing site." },
];

const STEPS = [
  "Send the URL of what you built, or tell me what you're launching.",
  "I reply within a day with a start date and a fixed price.",
  "You get the files, the system and the prompt. No dependencies, no lock-in. It's yours outright.",
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
    title: "Hire Ray: make your AI-built brand distinct",
    description:
      "You built the first version with AI. A teardown, a Draft-to-Distinct refinement or an ongoing design partner turns it into something that's yours, from the designer behind InstaLanding.ai.",
    canonical: "/hire",
  });

  const [params, setParams] = useSearchParams();
  const startFrom = getPromptBySlug(params.get("template") ?? undefined);
  const tierParam = params.get("tier");
  // A template link means "build me this one", so it picks BUILD unless a tier is named.
  const tier: TierId = isTier(tierParam) ? tierParam : startFrom ? "build" : "teardown";
  const ask = ASK[tier];
  const tierLabel = SERVICES.find((s) => s.id === tier)?.label ?? "";
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

  const pickTier = (next: TierId, fromCard = false) => {
    params.set("tier", next);
    setParams(params, { replace: true });
    track("hire_tier", { tier: next, from: fromCard ? "card" : "form" });
    if (status === "error") {
      setStatus("idle");
      setError(null);
    }
    if (fromCard) {
      document.getElementById(id("form"))?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById(id("website"))?.focus({ preventScroll: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const problem: { key: FieldKey; message: string } | null = !fields.name.trim()
      ? { key: "name", message: "Add your name." }
      : !EMAIL_RE.test(fields.email.trim())
        ? { key: "email", message: "Add an email Ray can reply to." }
        : ask.siteRequired && !fields.website.trim()
          ? { key: "website", message: "Add the link so Ray can look at it." }
          : tier === "build" && !fields.message.trim()
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
        tier: tierLabel,
        template: startFrom ? `${startFrom.title} (/prompt/${startFrom.slug})` : "",
        message: fields.message.trim(),
      });
      track("hire_request", { tier, template: startFrom?.slug ?? "none" });
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
            <p className="about-role">You built the first version. I build the part that makes it yours.</p>
          </header>

          <section className="hire-tiers" aria-labelledby={id("tiers")}>
            <h2 id={id("tiers")} className="contrib-kicker">
              SHIPPED IT WITH AI, BUT IT LOOKS LIKE EVERYONE ELSE'S?
            </h2>
            <ol className="hire-tier-list">
              {TIERS.map((t, i) => (
                <li key={t.id} className={`hire-tier${tier === t.id ? " is-picked" : ""}`}>
                  <div className="hire-tier-top">
                    <span className="hire-tier-num">0{i + 1}</span>
                    {t.lead && <span className="hire-tier-badge">START HERE</span>}
                  </div>
                  <h3 className="hire-tier-name">{t.name}</h3>
                  <p className="hire-tier-price">
                    <strong>{PRICES[t.id] ?? t.fallback}</strong>
                    <span>{t.turnaround}</span>
                  </p>
                  <p className="hire-tier-pitch">{t.pitch}</p>
                  <ul className="hire-tier-includes">
                    {t.includes.map((x) => (
                      <li key={x}>
                        <Check size={12} aria-hidden="true" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="hire-tier-cta" onClick={() => pickTier(t.id, true)} aria-pressed={tier === t.id}>
                    {tier === t.id ? "SELECTED" : t.lead ? "GET A TEARDOWN" : `CHOOSE ${t.name.toUpperCase()}`}
                    <ArrowRight size={13} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <div className="contrib-grid">
            <aside className="contrib-explainer" aria-labelledby={id("offer")}>
              <p className="sponsor-mission">The draft isn't the product.</p>
              <p>
                AI gets you to a working first version fast. What it can't give you is a point of view: why your product
                is different, and how that shows up in every typeface, colour and screen. That part is the job.
              </p>

              <h2 id={id("offer")} className="contrib-kicker">OR BUILT FROM SCRATCH</h2>
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
                <strong>PRICE:</strong> {PRICES.build ? `from ${PRICES.build}, ` : ""}fixed and agreed before I start. Every build ships with its one-shot prompt, so your
                agent can keep editing it.
              </p>
            </aside>

            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status" id={id("form")}>
                  <Check size={16} aria-hidden="true" />
                  <p>Sent. Ray will reply by email within a day.</p>
                  <button type="button" className="contact-submit" onClick={() => setStatus("idle")}>
                    SEND ANOTHER
                  </button>
                </div>
              ) : (
                <form
                  id={id("form")}
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

                  <input type="hidden" name="tier" value={tierLabel} />
                  <fieldset className="sponsor-picks hire-service">
                    <legend className="contact-label">SERVICE</legend>
                    <div className="hire-service-grid">
                      {SERVICES.map((s) => (
                        <label key={s.id} className="sponsor-pick">
                          <input type="radio" name="service" value={s.id} checked={tier === s.id} onChange={() => pickTier(s.id)} />
                          {s.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

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

                  <label className="contact-label" htmlFor={id("website")}>{ask.site}</label>
                  <input id={id("website")} name="website" className="contact-input" placeholder="yourproduct.com" inputMode="url"
                    required={ask.siteRequired} value={fields.website} onChange={set("website")}
                    aria-invalid={invalid("website")} aria-describedby={describedBy("website")} />

                  <label className="contact-label" htmlFor={id("message")}>{ask.message}</label>
                  <textarea id={id("message")} name="message" rows={6} className="contact-input contact-textarea" required={tier === "build"}
                    placeholder={ask.placeholder}
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
                        {tier === "teardown" ? "REQUEST A TEARDOWN" : "GET A QUOTE"} <ArrowRight size={14} aria-hidden="true" />
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
