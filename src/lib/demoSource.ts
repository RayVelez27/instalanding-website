import { useEffect, useState } from "react";

/* Fetched once per demo and kept for the session, so flipping between PREVIEW
   and CODE never refetches a 100KB file. */
const cache = new Map<string, Promise<string>>();

export function loadDemoSource(src: string) {
  let pending = cache.get(src);
  if (!pending) {
    pending = fetch(src).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    });
    pending.catch(() => cache.delete(src));
    cache.set(src, pending);
  }
  return pending;
}

type State = { status: "loading" } | { status: "ready"; code: string } | { status: "error" };

export function useDemoSource(src: string | undefined, enabled: boolean) {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    if (!src || !enabled) return;
    let live = true;
    setState({ status: "loading" });
    loadDemoSource(src).then(
      (code) => live && setState({ status: "ready", code }),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, [src, enabled]);
  return state;
}
