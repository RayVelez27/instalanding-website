import { useEffect, useState } from "react";
import type { SheetKind } from "@/components/ItemSheet";
import { AGENTS, agentPrompt, type Agent } from "@/lib/openWith";
import { track } from "@/lib/track";

/**
 * "Open with your agent" in the item sheet (phones and tablets): a grid of
 * agents that open with this item's prompt typed in (see lib/openWith.ts),
 * and a Copy the prompt link for any other agent.
 */
const OpenWith = ({ kind, slug, title }: { kind: SheetKind; slug: string; title: string }) => {
  const [note, setNote] = useState("");
  const prompt = agentPrompt(kind, slug, title);

  useEffect(() => {
    setNote("");
  }, [slug]);

  const copy = async (then: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setNote(then);
    } catch {
      setNote("Couldn't copy here. Use one of the agents above instead.");
    }
  };

  const open = (a: Agent) => {
    track("open_with", { agent: a.id, kind, slug });
    if (!a.link) copy(a.copyNote ?? "Copied the prompt.");
  };

  return (
    <div className="openwith">
      <b>Open with your agent</b>
      <small>It opens with this {kind === "icons" ? "icon set" : kind}'s prompt typed in. You review it and press send.</small>
      <div className="openwith-grid">
        {AGENTS.map((a) =>
          a.link ? (
            <a key={a.id} className="openwith-agent" href={a.link(prompt)} target="_blank" rel="noreferrer" onClick={() => open(a)}>
              <span className="openwith-mark" style={{ background: a.bg }} aria-hidden="true">{a.mark}</span>
              {a.name}
            </a>
          ) : (
            <button key={a.id} type="button" className="openwith-agent is-desk" onClick={() => open(a)} aria-label={`Copy the prompt for ${a.name}`}>
              <span className="openwith-mark" style={{ background: a.bg }} aria-hidden="true">{a.mark}</span>
              {a.name}
            </button>
          ),
        )}
      </div>
      {note && <p className="openwith-note" role="status">{note}</p>}
      <div className="openwith-foot">
        <button type="button" onClick={() => { copy("Copied the prompt. Paste it into any agent."); track("open_with", { agent: "copy", kind, slug }); }}>
          Copy the prompt
        </button>
      </div>
    </div>
  );
};

export default OpenWith;
