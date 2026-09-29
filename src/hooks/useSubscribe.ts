import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SubscribeStatus = "idle" | "loading" | "success" | "exists" | "error";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Postgres unique_violation: the address is already on the list
const ALREADY_SUBSCRIBED = "23505";

/** Adds an email to the `subscribers` list. Resolves true when the address is on the list. */
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
      const { error: insertError } = await supabase.from("subscribers").insert({ email });
      if (!insertError) {
        setStatus("success");
        return true;
      }
      if (insertError.code === ALREADY_SUBSCRIBED) {
        setStatus("exists");
        return true;
      }
      throw insertError;
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
