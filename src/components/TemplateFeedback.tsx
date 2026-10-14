import { useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import type { PromptEntry } from "@/data/prompts";

/**
 * Feedback on one template, opened from FEEDBACK in the prompt modal.
 *
 * Submissions go to Netlify Forms as `template-feedback`. The template is
 * baked in as hidden fields, so nobody picks it from a list: `template`,
 * `template_slug` and `template_url` identify it, and `subject` is the line
 * Netlify uses for the notification email ("Template feedback: <title>").
 * Keep the fields in step with its twin in public/__forms.html.
 */
export const FEEDBACK_FORM = "template-feedback";

const SITE = "https://instalanding.ai";

type Status = "idle" | "sending" | "sent" | "error";

const TemplateFeedback = ({ entry, onDone }: { entry: PromptEntry; onDone: () => void }) => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const ids = { message: useId(), email: useId(), error: useId() };

  const template = {
    subject: `Template feedback: ${entry.title}`,
    template: entry.title,
    template_slug: entry.slug,
    template_url: `${SITE}/prompt/${entry.slug}`,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!message.trim()) {
      setError("Add a note first.");
      setStatus("error");
      return;
    }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("That email doesn't look right. Leave it empty if you'd rather not get a reply.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      await submitNetlifyForm(FEEDBACK_FORM, { "bot-field": botField, ...template, email: email.trim(), message });
      setStatus("sent");
      setMessage("");
    } catch {
      setError("That didn't send. Try again in a moment.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="pfeedback contact-sent" role="status">
        <Check size={16} aria-hidden="true" />
        <p>Thanks. Your note on {entry.title} went straight to Ray.</p>
        <button type="button" className="contact-submit" onClick={onDone}>
          BACK TO MORE ONE-SHOTS
        </button>
      </div>
    );
  }

  return (
    <form
      name={FEEDBACK_FORM}
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="pfeedback contact-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <input type="hidden" name="form-name" value={FEEDBACK_FORM} />
      {Object.entries(template).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <p className="contact-trap" aria-hidden="true">
        <label>
          Leave this empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" value={botField} onChange={(e) => setBotField(e.target.value)} />
        </label>
      </p>

      <p className="pfeedback-about">
        <span>ABOUT</span>
        {entry.title}
      </p>

      <label className="contact-label" htmlFor={ids.message}>WHAT WORKED, WHAT DIDN'T</label>
      <textarea
        id={ids.message}
        name="message"
        required
        rows={5}
        autoFocus
        className="contact-input contact-textarea"
        placeholder="A bug, a section you'd change, how the prompt did in your builder…"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        aria-invalid={status === "error" && /note/i.test(error)}
        aria-describedby={error ? ids.error : undefined}
      />

      <label className="contact-label" htmlFor={ids.email}>
        EMAIL <span className="pfeedback-optional">OPTIONAL, FOR A REPLY</span>
      </label>
      <input
        id={ids.email}
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        className="contact-input"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        aria-invalid={status === "error" && /email/i.test(error)}
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
            SEND FEEDBACK <ArrowRight size={14} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
};

export default TemplateFeedback;
