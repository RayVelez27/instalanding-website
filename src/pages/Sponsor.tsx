import { useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useSeo } from "@/hooks/useSeo";
import { submitNetlifyForm } from "@/lib/netlifyForms";

/**
 * /sponsor — sponsorship enquiries.
 *
 * Reached only from the last tile in the home feed; it has no navbar entry.
 * Goes to Netlify Forms as `sponsor` (twin in public/__forms.html). Placements
 * travel as one comma-joined field so the twin stays a flat list of inputs.
 *
 * No audience numbers on the page on purpose: pricing and reach are answered
 * in the reply, so nothing here goes stale or overpromises.
 */
const FORM_NAME = "sponsor";

const PLACEMENTS = [
  {
    id: "feed",
    title: "Feed tile",
    body: "A tile in the home feed, drawn in the library's own black-and-white style and labelled as a sponsor.",
  },
  {
    id: "drops",
    title: "NEW DROPS email",
    body: "One line in the email that goes out when new templates land.",
  },
  {
    id: "template",
    title: "Template sponsor",
    body: "Your name on a template's page, as the sponsor of that release.",
  },
] as const;
type PlacementId = (typeof PLACEMENTS)[number]["id"];

type Fields = { name: string; email: string; company: string; website: string; message: string };
type FieldKey = keyof Fields | "placements";
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

const validate = (f: Fields, picked: PlacementId[]): { key: FieldKey; message: string } | null => {
  if (!f.name.trim()) return { key: "name", message: "Add your name." };
  if (!EMAIL_RE.test(f.email.trim())) return { key: "email", message: "Add an email we can reply to." };
  if (!f.company.trim()) return { key: "company", message: "Add the company or product you'd sponsor as." };
  if (f.website.trim() && !isUrl(f.website.trim())) return { key: "website", message: "That website doesn't look like a URL." };
  if (!picked.length) return { key: "placements", message: "Pick at least one placement. You can change your mind later." };
  return null;
};

const Sponsor = () => {
  useSeo({
    title: "Sponsor the library",
    description:
      "Sponsor InstaLanding.ai, the free, MIT-licensed library of one-shot landing pages for people building with AI.",
    canonical: "/sponsor",
  });

  const [fields, setFields] = useState<Fields>(EMPTY);
  const [picked, setPicked] = useState<PlacementId[]>([]);
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
  const toggle = (p: PlacementId) => {
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
      document.getElementById(id(problem.key === "placements" ? `placement-${PLACEMENTS[0].id}` : problem.key))?.focus();
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
        placements: PLACEMENTS.filter((p) => picked.includes(p.id)).map((p) => p.title).join(", "),
        message: fields.message.trim(),
      });
      setStatus("sent");
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
            <p className="about-role">Keep the library free, and get in front of the people building with AI.</p>
          </header>

          <div className="contrib-grid">
            <aside className="contrib-explainer" aria-labelledby={id("why")}>
              <h2 id={id("why")} className="contrib-kicker">WHY SPONSOR</h2>
              <p>
                Every page in this library is free and MIT licensed: one HTML file, a one-shot prompt that
                rebuilds it, and endpoints coding agents can read. The people who use it are designers,
                developers and founders shipping with AI tools, and that's who sponsors reach.
              </p>

              <h2 className="contrib-kicker">PLACEMENTS</h2>
              <ul className="sponsor-list">
                {PLACEMENTS.map((p) => (
                  <li key={p.id}>
                    <strong>{p.title}</strong>
                    <span>{p.body}</span>
                  </li>
                ))}
              </ul>

              <h2 className="contrib-kicker">THE RULES</h2>
              <p>
                Sponsors are always labelled as sponsors and never mixed into the templates or the prompts.
                The library stays free whether a placement is booked or not.
              </p>
              <p className="contrib-soon">
                <strong>HOW IT WORKS:</strong> tell us what you'd like to reach people with. Pricing and
                availability come back in the reply.
              </p>
            </aside>

            <div className="contrib-form-wrap">
              {status === "sent" ? (
                <div className="contact-sent" role="status">
                  <Check size={16} aria-hidden="true" />
                  <p>Thanks. Your enquiry is in, and you'll get a reply with pricing and open dates.</p>
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
                      <label className="contact-label" htmlFor={id("company")}>COMPANY OR PRODUCT</label>
                      <input id={id("company")} name="company" className="contact-input" autoComplete="organization" required
                        value={fields.company} onChange={set("company")} aria-invalid={invalid("company")} aria-describedby={describedBy("company")} />
                    </div>
                    <div>
                      <label className="contact-label" htmlFor={id("website")}>WEBSITE</label>
                      <input id={id("website")} name="website" type="url" inputMode="url" className="contact-input" placeholder="yourproduct.com"
                        value={fields.website} onChange={set("website")} aria-invalid={invalid("website")} aria-describedby={describedBy("website")} />
                    </div>
                  </div>

                  <fieldset className="sponsor-picks" aria-describedby={describedBy("placements")}>
                    <legend className="contact-label">PLACEMENTS YOU'RE INTERESTED IN</legend>
                    {PLACEMENTS.map((p) => (
                      <label key={p.id} className="sponsor-pick" htmlFor={id(`placement-${p.id}`)}>
                        <input
                          id={id(`placement-${p.id}`)}
                          type="checkbox"
                          checked={picked.includes(p.id)}
                          onChange={() => toggle(p.id)}
                          aria-invalid={invalid("placements")}
                        />
                        <span>{p.title}</span>
                      </label>
                    ))}
                  </fieldset>

                  <label className="contact-label" htmlFor={id("message")}>WHAT WOULD YOU LIKE TO PROMOTE?</label>
                  <textarea id={id("message")} name="message" rows={4} className="contact-input contact-textarea"
                    placeholder="Your product, a launch, a hiring push… and any dates you have in mind."
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
                        SEND ENQUIRY <ArrowRight size={14} aria-hidden="true" />
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
