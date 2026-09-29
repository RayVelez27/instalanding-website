import { Link } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import { buildersByKind } from "@/data/builders";
import { useSeo } from "@/hooks/useSeo";

/**
 * The hub every builder page links back to. It exists for two audiences:
 * someone who wants the page for the tool they already use, and a crawler
 * that needs one place where all of them are linked from.
 */
const Builders = () => {
  useSeo({
    title: "Landing Page Prompts for Every AI Builder",
    description:
      "One-shot landing page prompts adapted for Lovable, v0, Bolt.new, Claude Code, Cursor, Replit, Windsurf, Codex, Base44 and Firebase Studio — each with a reference build you can open first.",
    canonical: "/builders",
  });

  const groups = buildersByKind();

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <section className="builders">
          {/* Same head treatment as the ten pages below it, so the hub reads as
              one of them rather than as a different kind of page. */}
          <header className="builder-head">
            <p className="builder-kind">BUILDERS</p>
            <h1 className="builder-title">Landing page prompts for every AI builder</h1>
            <p className="builder-lede">
              The same prompts, rewritten for the tool you paste them into.
            </p>
          </header>

          <p className="builders-lede">
            A brief that works in a terminal agent does not work in a UI generator. One wants a
            file path and a verification step; the other wants a component tree and no
            dependencies. Every page below carries the adaptation for that environment — what it
            expects, what to say so it does not wander, and the block to paste in front of any
            prompt in the library.
          </p>

          {groups.map((group) => (
            <div className="builders-group" key={group.kind}>
              <h2 className="builders-group-title">{group.kind}</h2>
              <ul className="builders-list">
                {group.items.map((b) => (
                  <li key={b.path}>
                    <Link to={b.path} className="builder-card">
                      <span className="builder-card-name">{b.name}</span>
                      <span className="builder-card-lede">{b.lede}</span>
                      <span className="builder-card-go">Prompts for {b.name} &rarr;</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="builders-foot">
            Missing yours? Copilot, Devin, Manus, Google AI Studio, Bubble, Emergent and Figma
            Make are next. Until then, the closest page above will get you most of the way — the
            adaptations are about the shape of the environment, not the brand.
          </p>
        </section>
      </main>
    </div>
  );
};

export default Builders;
