import { useMemo } from "react";
import { highlightLines } from "@/lib/highlight";

/**
 * The demo's source, read-only. A plain <pre> rather than an editor: it can be
 * selected and copied in pieces but never typed into. Line numbers come from a
 * CSS counter on a pseudo-element, so they stay out of anything you select.
 *
 * The highlighted lines are our own escaped markup (see lib/highlight), set as
 * one string: a 100KB file is tens of thousands of spans, which is far cheaper
 * to hand the browser once than to build as React elements.
 */
const DemoCode = ({ code, file }: { code: string; file: string }) => {
  const lines = useMemo(() => highlightLines(code), [code]);
  const markup = useMemo(
    () => lines.map((line) => `<span class="pcode-line">${line}\n</span>`).join(""),
    [lines],
  );
  return (
    <div className="pcode-wrap">
      <div className="pcode-bar">
        <span className="pcode-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="pcode-file">{file}</span>
        <span className="pcode-meta">
          {lines.length.toLocaleString()} LINES · {Math.round(code.length / 1024)} KB · READ-ONLY
        </span>
      </div>
      <pre className="pcode" tabIndex={0} aria-label={`${file} source, read-only`}>
        <code dangerouslySetInnerHTML={{ __html: markup }} />
      </pre>
    </div>
  );
};

export default DemoCode;
