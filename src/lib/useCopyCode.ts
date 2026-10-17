import { useEffect, useRef, useState } from "react";
import { loadDemoSource, useDemoSource } from "@/lib/demoSource";
import { copyText } from "@/lib/copyText";
import type { PromptEntry } from "@/data/prompts";

/**
 * The main copy action, shared by the dialog and the standalone page so the
 * two can never offer different things.
 *
 * COPY CODE puts the demo's whole HTML file on the clipboard. An entry with no
 * single-file demo (code in its own repo) has no HTML to copy, so it keeps
 * COPY PROMPT instead.
 *
 * The source is loaded up front, not on click: the clipboard write should
 * happen inside the click (Safari drops it after an await on the network), and
 * the preview iframe has already requested the same file, so this is normally
 * a cache hit.
 */
export function useCopyCode(entry: PromptEntry | undefined) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<number>();
  const source = useDemoSource(entry?.demo, Boolean(entry?.demo));

  useEffect(() => setCopied("idle"), [entry?.slug]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const code = source.status === "ready" ? source.code : null;

  const copy = async () => {
    if (!entry) return;
    try {
      if (!entry.demo) await copyText(entry.prompt);
      else await copyText(code ?? (await loadDemoSource(entry.demo)));
      setCopied("done");
    } catch {
      setCopied("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied("idle"), 2000);
  };

  const label = entry?.demo ? "COPY CODE" : "COPY PROMPT";
  const text = copied === "done" ? "COPIED" : copied === "failed" ? "COPY FAILED" : label;
  return { copy, copied, label, text, source, code };
}
