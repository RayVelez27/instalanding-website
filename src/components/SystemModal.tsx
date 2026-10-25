import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Bot, Check, Copy, Download, ExternalLink, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import SystemBoard from "@/components/SystemBoard";
import { copyText } from "@/lib/copyText";
import { SITE_URL } from "@/lib/agentMode";
import { customizedTokens, shade, useSpecimen } from "@/lib/systemSpecimen";
import { systemAgentInstruction } from "@/lib/systemAgent";
import { getPromptBySlug, type PromptEntry } from "@/data/prompts";
import type { SystemEntry } from "@/data/systems";
import { track } from "@/lib/track";

/**
 * The SYSTEMS dialog: a design-system board, not a page. The header carries
 * the system's actions; below it one scroll area holds the board, a bento of
 * numbered panels (palette, type, every component, shape, motion, layout, an
 * app screen built from the components, all tokens). CUSTOMIZE opens a drawer
 * whose token edits recolour the whole board live.
 *
 * The system's CSS, SVG defs and component script are loaded into the page
 * once (all scoped under its prefix), and everything shown or copied is read
 * from the specimen file, so the board can't drift from what an agent gets.
 */
const loaded = new Set<string>();

const SystemModal = ({ system, onClose }: { system: SystemEntry; onClose: () => void }) => {
  const state = useSpecimen(system);
  const spec = state.status === "ready" ? state.specimen : null;
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [drawer, setDrawer] = useState(false);
  const [flash, setFlash] = useState("");
  const flashT = useRef<number>();

  const templates = system.templates.map((s) => getPromptBySlug(s)).filter((p): p is PromptEntry => !!p);
  const base = useMemo(() => {
    const map: Record<string, string> = {};
    spec?.groups.forEach((g) => g.tokens.forEach((t) => (map[t.name] = t.value)));
    return map;
  }, [spec]);

  // The system's fonts and CSS, once per page
  useEffect(() => {
    for (const [id, href] of [[`sys-fonts-${system.slug}`, system.fontsHref], [`sys-css-${system.slug}`, system.files.css]]) {
      if (document.getElementById(id)) continue;
      document.head.appendChild(Object.assign(document.createElement("link"), { id, rel: "stylesheet", href }));
    }
  }, [system]);

  // Its interaction script (pointer-tracking eyes, poke, pills), once per page
  useEffect(() => {
    if (!spec || loaded.has(system.slug)) return;
    loaded.add(system.slug);
    try {
      new Function(spec.script)();
    } catch {
      /* the board still renders; only the interactions are missing */
    }
  }, [spec, system]);

  useEffect(() => () => window.clearTimeout(flashT.current), []);

  const copy = async (key: string, text: string) => {
    await copyText(text);
    track("copy_system", { system: system.slug, copied: key, from: "modal" });
    setFlash(key);
    window.clearTimeout(flashT.current);
    flashT.current = window.setTimeout(() => setFlash(""), 1800);
  };

  const setControl = (token: string, value: string) => {
    const c = system.playground.find((x) => x.token === token);
    setOverrides((prev) => {
      const next = { ...prev, [token]: value };
      if (c?.kind === "color") for (const f of c.follow ?? []) next[f.token] = shade(value, f.darken);
      return next;
    });
  };

  const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v.trim());
  const edited = Object.keys(overrides).length > 0;
  const agentText = () =>
    systemAgentInstruction(system, { siteUrl: SITE_URL, tokensCss: spec?.tokensCss, templates, components: system.components });

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="pmodal-overlay" />
        <Dialog.Content className="pmodal-dialog smodal" aria-describedby="smodal-desc">
          <header className="pmodal-head">
            <div className="pmodal-headings">
              <p className="pmodal-kicker">
                SYSTEM · {system.slug.toUpperCase()}@{system.version} · {system.components.length} COMPONENTS · {templates.length}{" "}
                {templates.length === 1 ? "TEMPLATE" : "TEMPLATES"}
                <span className={`pmodal-theme pmodal-theme--${system.theme}`}>
                  <span className="pmodal-theme-dot" aria-hidden="true" />
                  {system.theme === "dark" ? "DARK" : "LIGHT"}
                </span>
              </p>
              <Dialog.Title className="pmodal-title">{system.name}</Dialog.Title>
              <Dialog.Description className="pmodal-desc" id="smodal-desc">
                {system.description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="pmodal-close" aria-label="Close">
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="smodal-actions">
            <button className="pmodal-btn pmodal-btn--solid" onClick={() => copy("agent", agentText())} aria-live="polite">
              {flash === "agent" ? <Check size={13} aria-hidden="true" /> : <Bot size={13} aria-hidden="true" />}
              <span className="pmodal-label">{flash === "agent" ? "COPIED" : "COPY FOR AGENT"}</span>
            </button>
            <button className="pmodal-btn" disabled={!spec} onClick={() => spec && copy("tokens", spec.tokensCss + "\n")}>
              {flash === "tokens" ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
              <span className="pmodal-label">{flash === "tokens" ? "COPIED" : "COPY TOKENS"}</span>
            </button>
            <a className="pmodal-btn" href={system.files.css} download={`${system.slug}.css`} title="Tokens and every component's CSS in one file">
              <Download size={12} aria-hidden="true" />
              <span className="pmodal-label">DOWNLOAD CSS</span>
            </a>
            <button className="pmodal-btn" aria-pressed={drawer} aria-controls="smodal-drawer" disabled={!spec} onClick={() => setDrawer((d) => !d)}>
              <SlidersHorizontal size={12} aria-hidden="true" />
              <span className="pmodal-label">{edited ? "CUSTOMIZE · EDITED" : "CUSTOMIZE"}</span>
            </button>
            <a className="pmodal-btn" href={system.files.specimen} target="_blank" rel="noreferrer" title="Every component on one page, in a new tab" onClick={() => track("open_specimen", { system: system.slug })}>
              <span className="pmodal-label">SPECIMEN</span> <ExternalLink size={12} aria-hidden="true" />
            </a>
            <ul className="smodal-tags" aria-label="Characteristics">
              {system.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>

          <div className="smodal-frame-wrap">
            <div className="smodal-scroll" tabIndex={0} aria-label={`${system.name} design system board`}>
              {state.status === "loading" && <p className="smodal-status">Loading the system…</p>}
              {state.status === "error" && <p className="smodal-status">Couldn't load the system. Try SPECIMEN instead.</p>}
              {spec && (
                <>
                  {/* Zero-size, not display:none: gradients inside a hidden SVG stop painting in Chrome */}
                  <div className="smodal-defs" aria-hidden="true" dangerouslySetInnerHTML={{ __html: spec.defs }} />
                  <SystemBoard system={system} spec={spec} templates={templates} overrides={overrides} flash={flash} onCopy={copy} />
                </>
              )}
            </div>

            {drawer && spec && (
              <aside className="smodal-drawer" id="smodal-drawer" aria-label="Customize tokens">
                <div className="smodal-drawer-head">
                  <span>CUSTOMIZE</span>
                  <button className="smodal-drawer-close" onClick={() => setDrawer(false)} aria-label="Close customize">
                    <X size={14} />
                  </button>
                </div>
                <p className="smodal-lede">Edit the tokens the system is built to take. The whole board updates live.</p>
                <div className="smodal-controls">
                  {system.playground.map((c) => {
                    const value = overrides[c.token] ?? base[c.token] ?? "";
                    const id = `ctl-${c.token.slice(2)}`;
                    return c.kind === "color" ? (
                      <label className="smodal-control" key={c.token} htmlFor={id}>
                        <span className="smodal-control-label">{c.label}</span>
                        <span className="smodal-control-token">{c.token}</span>
                        <input id={id} type="color" value={isHex(value) ? value : "#000000"} onChange={(e) => setControl(c.token, e.target.value.toUpperCase())} />
                        <span className="smodal-control-value">{value}</span>
                      </label>
                    ) : (
                      <label className="smodal-control smodal-control--range" key={c.token} htmlFor={id}>
                        <span className="smodal-control-label">{c.label}</span>
                        <span className="smodal-control-token">{c.token}</span>
                        <input
                          id={id}
                          type="range"
                          min={c.min}
                          max={c.max}
                          step={c.step}
                          value={parseFloat(value) || 0}
                          onChange={(e) => setControl(c.token, `${e.target.value}${c.unit ?? ""}`)}
                        />
                        <span className="smodal-control-value">{value}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="smodal-play-actions">
                  <button className="smodal-mini" disabled={!edited} onClick={() => setOverrides({})}>
                    <RotateCcw size={11} aria-hidden="true" /> RESET
                  </button>
                  <button className="smodal-mini smodal-mini--solid" onClick={() => copy("custom", customizedTokens(spec.tokensCss, overrides) + "\n")}>
                    {flash === "custom" ? "COPIED" : edited ? "COPY CUSTOMIZED TOKENS" : "COPY TOKENS"}
                  </button>
                </div>
              </aside>
            )}
          </div>

          <footer className="smodal-foot">
            <span>{system.prefix}- CLASSES · SCOPED UNDER .{system.rootClass} · NO FRAMEWORK · CLICK ANY TOKEN TO COPY ITS VAR()</span>
            <span className="pmodal-hint">SCROLL FOR THE FULL SYSTEM · ESC close</span>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SystemModal;
