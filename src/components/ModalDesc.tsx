import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

/**
 * A desktop dialog's description: one line by default, ending in an ellipsis,
 * with a More button that expands it to the full text (and Less to fold it
 * back). More only shows when the line is actually cut off, and the text folds
 * again when the dialog moves to another item.
 */
const ModalDesc = ({ text, id }: { text: string; id?: string }) => {
  const [open, setOpen] = useState(false);
  const [clipped, setClipped] = useState(false);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => setOpen(false), [text]);

  useLayoutEffect(() => {
    const el = line.current;
    if (!el) return;
    const measure = () => setClipped(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  return (
    <div className={`pmodal-desc-row${open ? " is-open" : ""}`}>
      <Dialog.Description className="pmodal-desc" id={id}>
        <span ref={line} className="pmodal-desc-text">{text}</span>
      </Dialog.Description>
      {(clipped || open) && (
        <button type="button" className="pmodal-desc-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Less" : "More"}
        </button>
      )}
    </div>
  );
};

export default ModalDesc;
