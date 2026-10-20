import type { LucideIcon } from "lucide-react";

/**
 * The GRID / second-view switch at the top of PAGES, SYSTEMS and MOTION. It
 * sits above the route banner, so it stays put when the immersive view
 * (CRATE, BOOK, DECK) hides the banner and filters.
 */
interface Option<V extends string> {
  id: V;
  label: string;
  Icon: LucideIcon;
  note: string;
}

const ViewToggle = <V extends string>({ view, options, onPick }: { view: V; options: Option<V>[]; onPick: (v: V) => void }) => {
  const current = options.find((o) => o.id === view);
  return (
    <div className="mo-toolbar pages-toolbar view-bar">
      <div className="mo-view" role="group" aria-label="View">
        {options.map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => onPick(id)}>
            <Icon size={13} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>
      {current && <span className="mo-view-note">{current.note}</span>}
    </div>
  );
};

export default ViewToggle;
