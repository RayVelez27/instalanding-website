import { useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useSeo } from "@/hooks/useSeo";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import { visiblePrompts } from "@/data/prompts";
import { track } from "@/lib/track";

/**
 * /sponsor — the mission, and a request-info form for sponsors, partners
 * and investors. In the sidebar nav as SPONSOR.
 *
 * Goes to Netlify Forms as `sponsor` (twin in public/__forms.html). Interests
 * travel as one comma-joined field so the twin stays a flat list of inputs.
 *
 * The only numbers on the page are ones the code can prove (the template
 * count is read from the library), so nothing here goes stale or overpromises.
 */
const FORM_NAME = "sponsor";

const INTERESTS = [
  { id: "sponsor", title: "Sponsor a drop", body: "Your name on a new template, seen by everyone who ships it." },
  { id: "feed", title: "Feed placement", body: "A labelled tile in the home feed, in the library's own style." },
  { id: "partner", title: "Partner", body: "Put the library inside your agent, builder or platform." },
  { id: "invest", title: "Invest", body: "Talk to us about where this goes next." },
] as const;
type InterestId = (typeof INTERESTS)[number]["id"];

// Templates only: the GOSPEL videos live in the feed but aren't pages.
const TEMPLATE_COUNT = visiblePrompts.filter((p) => !p.youtube).length;

const STATS = [
  { value: String(TEMPLATE_COUNT), label: "PAGES, FREE" },
  { value: "1", label: "FILE EACH. ZERO DEPS" },
  { value: "MIT", label: "LICENSED, FOREVER" },
];

type Fields = { name: string; email: string; company: string; website: string; message: string };
type FieldKey = keyof Fields | "interests";
type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: Fields = { name: "", email: "", company: "", website: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeUrl = (value: string) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value);
const isUrl = (value: string) => {
  try {
    const u = new URL(normalizeUrl(value));
    return u.hostname.includes(".");
  } catch {
    return false;
  }
};

const validate = (f: Fields, picked: InterestId[]): { key: FieldKey; message: string } | null => {
  if (!f.name.trim()) return { key: "name", message: "Add your name." };
  if (!EMAIL_RE.test(f.email.trim())) return { key: "email", message: "Add an email we can reply to." };
  if (!f.company.trim()) return { key: "company", message: "Add your company or fund." };
  if (f.website.trim() && !isUrl(f.website.trim())) return { key: "website", message: "That website doesn't look like a URL." };
  if (!picked.length) return { key: "interests", message: "Pick what you're interested in. More than one is fine." };
  return null;
};

const Sponsor = () => {
  useSeo({
    title: "Sponsor the mission",
    description:
      "InstaLanding.ai gives coding agents the HTML they need to make the web beautiful. Sponsor, partner or invest.",
    canonical: "/sponsor",
  });

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [picked, setPicked] = useState<InterestId[]>([]);
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
  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    clearError();
  };
  const toggle = (p: InterestId) => {
    setPicked((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));
    clearError();
  };

  const invalid = (key: FieldKey) => status === "error" && error?.key === key;
  const describedBy = (key: FieldKey) => (invalid(key) ? id("error") : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const problem = validate(fields, picked);
    if (problem) {
      setError(problem);
      setStatus("error");
      document.getElementById(id(problem.key === "interests" ? `interest-${INTERESTS[0].id}` : problem.key))?.focus();
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      await submitNetlifyForm(FORM_NAME, {
        "bot-field": botField,
        name: fields.name.trim(),
        email: fields.email.trim(),
        company: fields.company.trim(),
        website: normalizeUrl(fields.website.trim()),
        interests: INTERESTS.filter((p) => picked.includes(p.id)).map((p) => p.title).join(", "),
        message: fields.message.trim(),
      });
      setStatus("sent");
      track("sponsor_request", { interests: picked.join(",") || "none" });
      setFields(EMPTY);
      setPicked([]);
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
            <h1 className="about-name">Sponsor</h1>
            <p className="about-role">Agents can write the code. We give them the taste.</p>
          </header>

          <div className="contrib-grid">
            <aside className="contrib-explainer" aria-labelledby={id("mission")}>
              <h2 id={id("mission")} className="contrib-kicker">THE MISSION</h2>
              <p className="sponsor-mission">
                Give every coding agent the HTML it needs to make the web beautiful.
              </p>
              <p>
                Agents are about to build most of the internet. Left alone, they build the same page a
                million times. InstaLanding.ai is the fix: hand-finished, single-file landing pages, each
                with the one-shot prompt that rebuilds it, served in formats agents read directly.
              </p>

              <ul className="sponsor-stats" aria-label="The library in numbers">
                {STATS.map((st) => (
                  <li key={st.label}>
                    <strong>{st.value}</strong>
                    <span>{st.label}</span>
                  </li>
                ))}
              </ul>

              <h2 className="contrib-kicker">WHY NOW</h2>
              <p>
                Every product launches with a landing page, and more of them are written by agents every
                month. The page an agent starts from is the page the world ends up seeing. We're building
                that starting point.
              </p>

              <h2 className="contrib-kicker">WAYS IN</h2>
              <ul className="sponsor-list">
                {INTERESTS.map((p) => (
                  <li key={p.id}>
                    <strong>{p.title}</strong>
                    <span>{p.body}</span>
                  </li>
                ))}
              </ul>

              <p className="contrib-soon">
                <strong>THE RULE:</strong> sponsors are always labelled, and the library stays free.
              </p>
            </aside>

            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <Check size={16} aria-hidden="true" />
                  <p>Thanks. Your request is in, and we'll reply with the details.</p>
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

                  <div className="contrib-pair">
                    <div>
                      <label className="contact-label" htmlFor={id("name")}>YOUR NAME</label>
                      <input id={id("name")} name="name" className="contact-input" autoComplete="name" required
                        value={fields.name} onChange={set("name")} aria-invalid={invalid("name")} aria-describedby={describedBy("name")} />
                    </div>
                    <div>
                      <label className="contact-label" htmlFor={id("email")}>EMAIL</label>
                      <input id={id("email")} name="email" type="email" className="contact-input" autoComplete="email" required
                        value={fields.email} onChange={set("email")} aria-invalid={invalid("email")} aria-describedby={describedBy("email")} />
                    </div>
                  </div>

                  <div className="contrib-pair">
                    <div>
                      <label className="contact-label" htmlFor={id("company")}>COMPANY OR FUND</label>
                      <input id={id("company")} name="company" className="contact-input" autoComplete="organization" required
                        value={fields.company} onChange={set("company")} aria-invalid={invalid("company")} aria-describedby={describedBy("company")} />
                    </div>
                    <div>
                      <label className="contact-label" htmlFor={id("website")}>WEBSITE</label>
                      <input id={id("website")} name="website" type="url" inputMode="url" className="contact-input" placeholder="yourproduct.com"
                        value={fields.website} onChange={set("website")} aria-invalid={invalid("website")} aria-describedby={describedBy("website")} />
                    </div>
                  </div>

                  <fieldset className="sponsor-picks" aria-describedby={describedBy("interests")}>
                    <legend className="contact-label">I'M INTERESTED IN</legend>
                    {INTERESTS.map((p) => (
                      <label key={p.id} className="sponsor-pick" htmlFor={id(`interest-${p.id}`)}>
                        <input
                          id={id(`interest-${p.id}`)}
                          type="checkbox"
                          checked={picked.includes(p.id)}
                          onChange={() => toggle(p.id)}
                          aria-invalid={invalid("interests")}
                        />
                        <span>{p.title}</span>
                      </label>
                    ))}
                  </fieldset>

                  <label className="contact-label" htmlFor={id("message")}>ANYTHING WE SHOULD KNOW?</label>
                  <textarea id={id("message")} name="message" rows={4} className="contact-input contact-textarea"
                    placeholder="What you're building, who you'd like to reach, or the question you want answered."
                    value={fields.message} onChange={set("message")} />

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
                        REQUEST INFO <ArrowRight size={14} aria-hidden="true" />
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

export default Sponsor;
