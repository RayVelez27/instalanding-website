import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { AGENTS, agentPrompt, itemSource } from "@/lib/openWith";
import { PAGES } from "@/lib/libraryItems";
import { copyText } from "@/lib/copyText";
import { track } from "@/lib/track";

/**
 * HOME's "Built for agents" band: shows an agent using a file instead of
 * claiming it. On the left the promise and Open with buttons (a real prompt
 * for one page, the same links the item sheet uses); on the right a terminal
 * that plays the exchange once when it scrolls into view.
 */
const DEMO = PAGES.find((p) => p.slug === "kairo-ai-time-assistant-page") ?? PAGES[0];
const TITLE = DEMO.title.replace(/ Landing Page$| Page$/, "");
const PROMPT = agentPrompt("page", DEMO.slug, TITLE);
const SRC = itemSource("page", DEMO.slug).replace(/^https:\/\//, "");

const LINES: { who: "you" | "agent"; text: string; src?: boolean }[] = [
  { who: "you", text: `build me a landing page like ${TITLE.split(" ")[0].toLowerCase()}, for my app` },
  { who: "agent", text: `reading ${SRC}`, src: true },
  { who: "agent", text: "1 file, no dependencies · keeping the design, swapping in your brand…" },
  { who: "agent", text: "done: index.html, ready to ship" },
];
const SHOWN_AGENTS = AGENTS.filter((a) => a.link).slice(0, 4);

const HomeAgents = ({ onCopied }: { onCopied: (m: string) => void }) => {
  const box = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(LINES.length);
      return;
    }
    let t: number | undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const step = (n: number) => {
        setShown(n);
        if (n < LINES.length) t = window.setTimeout(() => step(n + 1), n === 0 ? 300 : 750);
      };
      step(1);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <section className="hx-agents home-reveal" aria-labelledby="hx-agents-t">
      <div className="hx-agents-l">
        <p className="hx-kicker">BUILT FOR AGENTS</p>
        <h2 id="hx-agents-t">
          Your agent already knows{" "}
          <br />
          what to do with it.
        </h2>
        <p className="hx-agents-copy">
          Every item has a plain-text brief at a stable URL and the one-shot prompt that builds it. Hand it to your agent, swap
          the brand, ship it in one pass.
        </p>
        <div className="hx-agents-open" role="group" aria-label={`Open ${TITLE} with your agent`}>
          {SHOWN_AGENTS.map((a) => (
            <a
              key={a.id}
              href={a.link!(PROMPT)}
              target="_blank"
              rel="noopener noreferrer"
              className="hx-agent"
              onClick={() => track("open_with", { agent: a.id, kind: "page", slug: DEMO.slug, from: "home" })}
            >
              <i style={{ background: a.bg }} aria-hidden="true">
                {a.mark}
              </i>
              {a.name}
            </a>
          ))}
          <button
            type="button"
            className="hx-agent hx-agent--copy"
            onClick={async () => {
              await copyText(PROMPT);
              setCopied(true);
              onCopied("PROMPT COPIED");
              track("open_with", { agent: "copy", kind: "page", slug: DEMO.slug, from: "home" });
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
            {copied ? "Copied" : "Copy the prompt"}
          </button>
        </div>
      </div>
      <div className="hx-agents-r">
        <div className="hx-term" ref={box} aria-label="An agent building a page from InstaLanding.ai" role="img">
          <div className="hx-term-bar" aria-hidden="true">
            <i />
            <i />
            <i />
            <span>agent · ~/my-app</span>
          </div>
          <div className="hx-term-body" aria-hidden="true">
            {LINES.slice(0, shown).map((l, i) => (
              <p key={i} className={`is-${l.who}`}>
                <b>{l.who} ›</b> {l.src ? <>reading <em>{SRC}</em></> : l.text}
              </p>
            ))}
            {shown < LINES.length && <span className="hx-term-cursor" />}
          </div>
          <div className="hx-term-foot">
            <span>
              <i aria-hidden="true" /> ONE FILE · NO DEPENDENCIES
            </span>
            <Link to={`/prompt/${DEMO.slug}`}>{TITLE} →</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeAgents;
