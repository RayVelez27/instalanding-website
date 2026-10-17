/** Clipboard write with a textarea fallback for non-secure contexts. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

/**
 * Clipboard write for text that is still loading (a demo file being fetched).
 * Safari drops the click's clipboard permission across an await, so the
 * clipboard is handed a promise instead; elsewhere this falls back to copyText.
 */
export async function copyTextLater(text: Promise<string>) {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
      return;
    } catch {
      /* promise-valued ClipboardItem unsupported, or the fetch failed: retry plainly */
    }
  }
  await copyText(await text);
}
