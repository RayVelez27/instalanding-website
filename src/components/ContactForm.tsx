import { useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { submitNetlifyForm } from "@/lib/netlifyForms";

/**
 * The "Contact Ray" form, shared by the /contact page and the dialog opened
 * from About and the feed's WORK WITH ME tile.
 *
 * Submissions go to Netlify Forms as `contact` (see src/lib/netlifyForms.ts).
 * Keep the fields in step with its twin in public/__forms.html.
 */
export const CONTACT_FORM = "contact";

type Status = "idle" | "sending" | "sent" | "error";

const ContactForm = ({ onDone, doneLabel = "SEND ANOTHER" }: { onDone?: () => void; doneLabel?: string }) => {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const ids = { name: useId(), email: useId(), message: useId(), error: useId() };

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) {
      setError("Enter an email address Ray can reply to.");
      setStatus("error");
      return;
    }
    if (!fields.message.trim()) {
      setError("Add a message.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      await submitNetlifyForm(CONTACT_FORM, { "bot-field": botField, ...fields });
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
    } catch {
      setError("That didn't send. Try again in a moment.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="contact-sent" role="status">
        <Check size={16} aria-hidden="true" />
        <p>Sent. Ray will get back to you by email.</p>
        <button type="button" className="contact-submit" onClick={() => (onDone ? onDone() : setStatus("idle"))}>
          {doneLabel}
        </button>
      </div>
    );
  }

  return (
    <form
      name={CONTACT_FORM}
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="contact-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Netlify reads the form name from this field on an AJAX post. */}
      <input type="hidden" name="form-name" value={CONTACT_FORM} />
      {/* Honeypot: people never see it, bots fill it, Netlify drops those. */}
      <p className="contact-trap" aria-hidden="true">
        <label>
          Leave this empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
        </label>
      </p>

      <label className="contact-label" htmlFor={ids.name}>NAME</label>
      <input id={ids.name} name="name" className="contact-input" autoComplete="name" value={fields.name} onChange={set("name")} />

      <label className="contact-label" htmlFor={ids.email}>EMAIL</label>
      <input
        id={ids.email}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        className="contact-input"
        value={fields.email}
        onChange={set("email")}
        aria-invalid={status === "error" && /email/i.test(error)}
        aria-describedby={error ? ids.error : undefined}
      />

      <label className="contact-label" htmlFor={ids.message}>MESSAGE</label>
      <textarea
        id={ids.message}
        name="message"
        required
        rows={5}
        className="contact-input contact-textarea"
        value={fields.message}
        onChange={set("message")}
        aria-invalid={status === "error" && /message/i.test(error)}
        aria-describedby={error ? ids.error : undefined}
      />

      {error && (
        <p className="contact-error" id={ids.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="contact-submit" disabled={status === "sending"}>
        {status === "sending" ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <>
            SEND <ArrowRight size={14} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
};

export default ContactForm;
