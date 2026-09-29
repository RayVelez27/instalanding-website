import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { agentGroups } from "@/data/agents";

const HOVER_DELAY = 350;

/**
 * Inline "AI builder" link that opens a blurred-backdrop dialog listing the
 * tools these one-shot prompts work with. Opens on click, or on a deliberate hover.
 */
const AiBuilderTrigger = ({ children = "AI builder" }: { children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<number>();
  // After closing with the pointer still on the trigger, wait for it to leave
  // before hover can reopen, so the dialog doesn't pop straight back up.
  const armed = useRef(true);

  const cancel = () => window.clearTimeout(timer.current);

  const handleOpenChange = (next: boolean) => {
    cancel();
    if (!next) armed.current = false;
    setOpen(next);
  };

  const total = agentGroups.reduce((n, g) => n + g.agents.length, 0);

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger
        className="ai-builder-trigger"
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse" || !armed.current) return;
          cancel();
          timer.current = window.setTimeout(() => setOpen(true), HOVER_DELAY);
        }}
        onPointerLeave={() => {
          cancel();
          armed.current = true;
        }}
      >
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="agents-overlay" />
        <Dialog.Content className="agents-dialog">
          <div className="agents-head">
            <span className="agents-kicker">WORKS WITH {total}+ TOOLS</span>
            <Dialog.Title className="agents-title">Paste it into any AI that writes code</Dialog.Title>
            <Dialog.Description className="agents-desc">
              Every prompt here is written to be one-shot and self-contained, so it works in app builders, chat
              assistants and coding agents alike.
            </Dialog.Description>
            <Dialog.Close className="agents-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </div>

          {agentGroups.map((group) => (
            <section key={group.id} className="agents-group" aria-labelledby={`agents-${group.id}`}>
              <div className="agents-group-head">
                <h3 id={`agents-${group.id}`}>{group.label}</h3>
                <p>{group.how}</p>
              </div>
              <ul className="agents-list">
                {group.agents.map((agent) => (
                  <li key={agent.name}>
                    <a className="agent" href={agent.url} target="_blank" rel="noreferrer">
                      <span className="agent-mono" aria-hidden="true">
                        {agent.name.charAt(0)}
                      </span>
                      <span className="agent-text">
                        <span className="agent-name">{agent.name}</span>
                        <span className="agent-blurb">{agent.blurb}</span>
                      </span>
                      <ArrowUpRight size={14} className="agent-arrow" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="agents-foot">Using something else? Any tool that can write an HTML file will do.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AiBuilderTrigger;
