import { useEffect, useRef, useState } from "react";

/**
 * One row of filter chips above the feed, at every width. It never wraps: it
 * scrolls sideways, by thumb on touch screens and by grabbing and dragging
 * with a mouse (a drag never counts as a click). The edges fade where there is
 * more to scroll to.
 */
interface Props {
  tags: { tag: string; n: number }[];
  total: number;
  active: string;
  onPick: (tag: string) => void;
  label?: string;
}

const FilterRow = ({ tags, total, active, onPick, label = "Filter templates by style" }: Props) => {
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = () => {
    const el = row.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [tags]);

  // Mouse only: touch and pens already scroll natively
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !row.current) return;
    drag.current = { down: true, x: e.clientX, left: row.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.down || !row.current) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setGrabbing(true);
      try {
        row.current.setPointerCapture(e.pointerId);
      } catch {
        /* the pointer is already gone */
      }
    }
    if (d.moved) row.current.scrollLeft = d.left - dx;
  };
  const end = (e: React.PointerEvent) => {
    if (!drag.current.down) return;
    drag.current.down = false;
    setGrabbing(false);
    if (row.current?.hasPointerCapture(e.pointerId)) row.current.releasePointerCapture(e.pointerId);
  };
  // A drag that ends over a chip must not select it
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const pick = (tag: string, el: HTMLElement) => {
    onPick(tag);
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  };

  return (
    <div className={`filter-row ${edges.start ? "has-start" : ""} ${edges.end ? "has-end" : ""}`}>
      <div
        ref={row}
        className={`filter-row-track ${grabbing ? "is-grabbing" : ""}`}
        role="group"
        aria-label={label}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <button className="filter-chip" aria-pressed={active === "all"} onClick={(e) => pick("all", e.currentTarget)}>
          All <span>{total}</span>
        </button>
        {tags.map(({ tag, n }) => (
          <button key={tag} className="filter-chip" aria-pressed={active === tag} onClick={(e) => pick(tag, e.currentTarget)}>
            {tag.replace(/-/g, " ")} <span>{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterRow;
