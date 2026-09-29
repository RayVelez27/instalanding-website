import { useId, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useSubscribe } from "@/hooks/useSubscribe";

/** Inline "notify me about new components" signup, sized for the sidebar or the mobile menu. */
const SignupField = ({ variant = "sidebar" }: { variant?: "sidebar" | "overlay" }) => {
  const [email, setEmail] = useState("");
  const { status, error, subscribe, reset } = useSubscribe();
  const inputId = useId();
  const errorId = useId();
  const done = status === "success" || status === "exists";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (await subscribe(email)) setEmail("");
  };

  return (
    <form className={`signup signup--${variant}`} onSubmit={handleSubmit} noValidate>
      <label htmlFor={inputId} className="signup-label">
        NEW DROPS
      </label>
      <p className="signup-hint">Get an email when new components land.</p>

      {done ? (
        <p className="signup-done">
          <Check size={12} aria-hidden="true" />
          {status === "exists" ? "ALREADY ON THE LIST" : "YOU'RE ON THE LIST"}
        </p>
      ) : (
        <div className={`signup-row ${status === "error" ? "is-invalid" : ""}`}>
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") reset();
            }}
            aria-invalid={status === "error"}
            aria-describedby={error ? errorId : undefined}
          />
          <button type="submit" aria-label="Subscribe" disabled={status === "loading"}>
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight size={14} aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="signup-error" id={errorId} role="alert">
          {error}
        </p>
      )}
      {/* Persistent live region so the confirmation is announced */}
      <p className="sr-only" role="status" aria-live="polite">
        {status === "success" && "Subscribed. You'll get an email when new components are added."}
        {status === "exists" && "You're already subscribed."}
      </p>
    </form>
  );
};

export default SignupField;
