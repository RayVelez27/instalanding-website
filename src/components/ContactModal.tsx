import { useEffect, useId, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Loader2, X } from "lucide-react";

/**
 * "Contact Ray", opened from the sidebar's mail icon and the About page.
 *
 * Submissions go to Netlify Forms. Netlify only learns a form exists by
 * finding it in a static HTML file at deploy time — this one is rendered by
 * React, which its build bot never runs — so a hidden twin lives in
 * public/__forms.html with the same name and fields, and this posts there.
 * Posting to that static file rather than "/" keeps the SPA rewrite in
 * _redirects out of the way. Keep the two field lists identical: a field the
 * twin does not declare is silently dropped from the submission.
 */
export const CONTACT_FORM = "contact";
const FORM_ENDPOINT = "/__forms.html";

type Status = "idle" | "sending" | "sent" | "error";

const encode = (data: Record<string, string>) => new URLSearchParams(data).toString();

const ContactModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [botField, setBotField] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const ids = { name: useId(), email: useId(), message: useId(), error: useId() };

  // A fresh form each time it opens, unless the last one is still in flight.
  useEffect(() => {
    if (open && status !== "sending") {
      setStatus("idle");
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
      // Netlify Forms only exists on a deploy. Locally, say so instead of
      // pretending: the dev server cannot accept the POST.
      if (import.meta.env.DEV) {
        await new Promise((r) => setTimeout(r, 500));
        console.info("[contact] dev server: not sent. Netlify Forms receives this on a deploy.", fields);
      } else {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encode({ "form-name": CONTACT_FORM, "bot-field": botField, ...fields }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setStatus("sent");
      setFields({ name: "", email: "", message: "" });
    } catch {
      setError("That didn't send. Try again in a moment.");
      setStatus("error");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="contact-overlay" />
        <Dialog.Content className="contact-dialog" aria-describedby={undefined}>
          <Dialog.Close className="contact-close" aria-label="Close">
            <X size={16} />
          </Dialog.Close>
          <Dialog.Title className="contact-title">Contact Ray</Dialog.Title>

          {status === "sent" ? (
            <div className="contact-sent" role="status">
              <Check size={16} aria-hidden="true" />
              <p>Sent. Ray will get back to you by email.</p>
              <button type="button" className="contact-submit" onClick={onClose}>
                CLOSE
              </button>
            </div>
          ) : (
            <form
              name={CONTACT_FORM}
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="contact-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <p className="contact-hint">Projects, collaborations, or a component you want built.</p>
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
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ContactModal;
