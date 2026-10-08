import { useState } from "react";
import { submitNetlifyForm } from "@/lib/netlifyForms";

/** `exists` is kept for callers' sake; Netlify Forms cannot tell a repeat address apart. */
export type SubscribeStatus = "idle" | "loading" | "success" | "exists" | "error";

/** The NEW DROPS list. Its static twin is the `new-drops` form in public/__forms.html. */
export const NEW_DROPS_FORM = "new-drops";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Sends an email to the NEW DROPS list as a Netlify form submission. Resolves true on success. */
export function useSubscribe() {
  const [status, setStatus] = useState<SubscribeStatus>("idle");
  const [error, setError] = useState("");

  const subscribe = async (raw: string) => {
    const email = raw.trim();
    setError("");
    if (!EMAIL.test(email)) {
      setStatus("error");
      setError("Enter a valid email.");
      return false;
    }

    setStatus("loading");
    try {
      await submitNetlifyForm(NEW_DROPS_FORM, { email });
      setStatus("success");
      return true;
    } catch {
      setStatus("error");
      setError("Something went wrong. Try again.");
      return false;
    }
  };

  const reset = () => {
    setStatus("idle");
    setError("");
  };

  return { status, error, subscribe, reset };
}
