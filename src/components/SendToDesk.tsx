import { useEffect, useState } from "react";
import { Check, Send } from "lucide-react";
import { submitNetlifyForm } from "@/lib/netlifyForms";
import { NEW_DROPS_FORM } from "@/hooks/useSubscribe";
import { track } from "@/lib/track";

/**
 * "Send it to your desk" (the mobile plan, item 7). Phone visitors come to
 * look; the work happens at a computer. One field emails them the item's
 * links (netlify/functions/send-to-desk.mjs), and a box opts them into New
 * drops on the same tap. Shown in the item sheet at phone width only (CSS).
 */
const KEY = "instalanding.deskEmail";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SendToDesk = ({ kind, slug }: { kind: string; slug: string }) => {
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [drops, setDrops] = useState(true);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [trap, setTrap] = useState("");
  useEffect(() => {
    setState("idle");
    setError("");
  }, [slug]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const to = email.trim();
    if (!EMAIL.test(to)) {
      setState("error");
      setError("Enter a valid email.");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/.netlify/functions/send-to-desk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: to, kind, slug, website: trap }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || "Couldn't send right now. Try again.");
      try {
        localStorage.setItem(KEY, to);
      } catch {
        /* fine: they'll type it again next time */
      }
      if (drops) submitNetlifyForm(NEW_DROPS_FORM, { email: to }).catch(() => {});
      setState("sent");
      track("send_to_desk", { kind, slug, drops: drops ? "yes" : "no" });
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Couldn't send right now. Try again.");
    }
  };

  if (state === "sent") {
    return (
      <div className="desk desk--sent" role="status">
        <Check size={18} aria-hidden="true" />
        <div>
          <b>Sent to {email.trim()}</b>
          <small>Open it on your computer when you're at your desk.</small>
        </div>
      </div>
    );
  }

  return (
    <form className="desk" onSubmit={send}>
      <b>Send it to your desk</b>
      <small>We'll email you the link{kind === "page" || kind === "motion" ? " and the prompt" : ""}. One email, no account.</small>
      <div className="desk-row">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-label="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={state === "sending"}>
          <Send size={15} aria-hidden="true" />
          {state === "sending" ? "Sending" : "Send"}
        </button>
      </div>
      {/* People leave this empty; bots fill every field */}
      <input className="desk-trap" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" />
      <label className="desk-drops">
        <input type="checkbox" checked={drops} onChange={(e) => setDrops(e.target.checked)} />
        Also get New drops, one email a week
      </label>
      {state === "error" && <p className="desk-error" role="alert">{error}</p>}
    </form>
  );
};

export default SendToDesk;
