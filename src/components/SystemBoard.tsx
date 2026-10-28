import { useMemo, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Copy, ExternalLink } from "lucide-react";
import { SITE_URL } from "@/lib/agentMode";
import { componentSnippet, type Specimen, type SpecimenGroup, type SpecimenToken } from "@/lib/systemSpecimen";
import type { SystemEntry } from "@/data/systems";
import type { PromptEntry } from "@/data/prompts";
import { motions as allMotions } from "@/data/motion";

/**
 * The design-system board: the system broken down into a bento of numbered
 * panels instead of shown as a page. Token panels (palette, type, shape,
 * motion, layout) are drawn from the tokens, so they work for any system;
 * component panels render the component's real markup from the specimen.
 * The board declares the system's tokens on itself, so the playground's
 * overrides (inline style on the board) recolour everything inside it,
 * including tokens derived from others, like the shadows.
 */
interface Props {
  system: SystemEntry;
  spec: Specimen;
  templates: PromptEntry[];
  overrides: Record<string, string>;
  flash: string;
  onCopy: (key: string, text: string) => void;
}

const TYPE_ROWS = 8;
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v.trim());
const short = (name: string, prefix: string) => name.replace(`--${prefix}-`, "");

function Panel({ n, span, title, actions, children, flush }: { n: number; span: number; title: string; actions?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className={`sb-panel sb-span-${span}`} aria-labelledby={`sb-h-${n}`}>
      <header className="sb-head">
        <span className="sb-num" aria-hidden="true">{String(n).padStart(2, "0")}</span>
        <h3 id={`sb-h-${n}`}>{title}</h3>
        {actions && <span className="sb-actions">{actions}</span>}
      </header>
      <div className={`sb-body ${flush ? "sb-body--flush" : ""}`}>{children}</div>
    </section>
  );
}

function CopyBtn({ id, flash, onClick, label = "COPY HTML" }: { id: string; flash: string; onClick: () => void; label?: string }) {
  return (
    <button className="sb-copy" onClick={onClick} title={label}>
      {flash === id ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}
      {flash === id ? "COPIED" : label}
    </button>
  );
}

/** cubic-bezier(a, b, c, d) as an SVG curve in a 100x100 box */
function EaseCurve({ value }: { value: string }) {
  const m = /cubic-bezier\(([^)]+)\)/.exec(value);
  if (!m) return null;
  const [a, b, c, d] = m[1].split(",").map((x) => parseFloat(x));
  const y = (v: number) => 90 - v * 70;
  return (
    <svg viewBox="0 -10 100 110" className="sb-ease-svg" aria-hidden="true">
      <path d="M10 90H90M10 90V10" className="sb-ease-axis" />
      <path d={`M10 ${y(0)} C${10 + a * 80} ${y(b)} ${10 + c * 80} ${y(d)} 90 ${y(1)}`} className="sb-ease-path" />
    </svg>
  );
}

const SystemBoard = ({ system, spec, templates, overrides, flash, onCopy }: Props) => {
  const p = system.prefix;
  const byId = useMemo(() => new Map(spec.components.map((c) => [c.id, c])), [spec]);
  const group = (title: string) => spec.groups.find((g) => g.title === title);
  const groupsLike = (start: string) => spec.groups.filter((g) => g.title.startsWith(start));
  const value = (t: SpecimenToken) => overrides[t.name] ?? t.value;
  const demoStyle = { background: `var(${system.look.surface})` } as CSSProperties;
  const copyVar = (t: SpecimenToken) => onCopy(t.name, `var(${t.name})`);

  // The board carries the tokens itself; inline overrides then win for everything derived from them.
  const scoped = spec.tokensCss.replace(":root", ".sysboard");
  const boardStyle = overrides as CSSProperties;

  const TokenChip = ({ t, children, className = "" }: { t: SpecimenToken; children: ReactNode; className?: string }) => (
    <button className={`sb-tok ${className}`} onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
      {children}
      <span className="sb-tok-name">{flash === t.name ? "COPIED" : short(t.name, p)}</span>
      <span className="sb-tok-value">{value(t)}</span>
    </button>
  );

  const pick = (html: string, select?: string) => {
    if (!select) return html;
    const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
    return doc.querySelector(select)?.outerHTML ?? html;
  };

  const panels = system.board.map((b, i) => {
    const n = i + 1;
    const key = `${b.panel}-${i}`;

    if (b.panel === "identity") {
      return (
        <section key={key} className={`sb-panel sb-span-${b.span} sb-identity`} aria-label={`${system.name} design system`}>
          <div className={`${system.rootClass} ${system.look.identityClass} sb-identity-in`} style={{
              // A gradient has to go on background-image; a colour on background-color, so a class's pattern survives
              ...(system.look.identityBg.includes("gradient(") ? { backgroundImage: system.look.identityBg } : { backgroundColor: system.look.identityBg }),
              color: system.look.identityText,
            }}>
            <p className="sb-identity-eyebrow" style={{ fontFamily: `var(${system.look.mono})` }}>INSTALANDING DESIGN SYSTEM</p>
            <p className="sb-identity-name" style={{ fontFamily: `var(${system.look.display})`, textTransform: system.look.displayUpper ? "uppercase" : "none", letterSpacing: system.look.displayTracking, fontSize: system.look.displaySize }}>{system.name}</p>
            <p className="sb-identity-tag" style={{ fontFamily: `var(${system.look.body})` }}>{system.tagline}</p>
            <p className="sb-identity-ver" style={{ fontFamily: `var(${system.look.mono})` }}>
              {system.slug}@{system.version} · {system.components.length} COMPONENTS
            </p>
          </div>
        </section>
      );
    }

    if (b.panel === "tokens:palette") {
      const core = spec.groups.find((g) => g.title.startsWith("Color") && g.tokens.every((t) => isHex(t.value)));
      const rest = groupsLike("Color").filter((g) => g !== core);
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Color palette"}>
          <div className="sb-swatches">
            {core?.tokens.map((t) => (
              <TokenChip key={t.name} t={t} className="sb-tok--swatch">
                <span className="sb-chip" style={{ background: `var(${t.name})` }} />
              </TokenChip>
            ))}
          </div>
          {rest.map((g) => (
            <div key={g.title} className="sb-strip">
              <span className="sb-strip-title">{g.title.replace(/^Color · /, "")}</span>
              <span className="sb-strip-row">
                {g.tokens.filter((t) => isHex(t.value)).map((t) => (
                  <button key={t.name} className="sb-dot" style={{ background: `var(${t.name})` }} onClick={() => copyVar(t)} title={`${t.name} ${value(t)}`}>
                    <span className="sr-only">{t.name}</span>
                  </button>
                ))}
              </span>
            </div>
          ))}
        </Panel>
      );
    }

    if (b.panel === "tokens:type") {
      const fams = group("Type · families")?.tokens ?? [];
      const scale = group("Type · scale")?.tokens ?? [];
      // A long scale would stretch the whole opening row; the rest are in All tokens
      const sizes = scale.filter((t) => /px|vw|clamp|rem/.test(t.value));
      const display = fams.find((t) => t.name === system.look.display) ?? fams[0];
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Typography"}>
          <div className="sb-type">
            <div className="sb-type-hero">
              <span className="sb-aa" style={{ fontFamily: `var(${display?.name})` }}>Aa</span>
              {fams.map((t) => (
                <button key={t.name} className="sb-fam" onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
                  <b style={{ fontFamily: `var(${t.name})` }}>{t.value.split(",")[0].replace(/"/g, "")}</b>
                  <span>{flash === t.name ? "COPIED" : short(t.name, p)}</span>
                </button>
              ))}
            </div>
            <div className="sb-scale">
              {sizes.slice(0, TYPE_ROWS).map((t) => {
                const isDisplay = t.name.includes("display");
                return (
                  <button key={t.name} className="sb-scale-row" onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
                    <small>
                      {flash === t.name ? "COPIED" : short(t.name, p)}
                      <br />
                      {t.value}
                    </small>
                    <span
                      style={{
                        fontFamily: `var(${isDisplay ? system.look.display : system.look.body})`,
                        fontSize: `min(var(${t.name}), ${isDisplay ? 34 : 20}px)`,
                        textTransform: isDisplay && system.look.displayUpper ? "uppercase" : "none",
                        letterSpacing: isDisplay ? system.look.displayTracking : undefined,
                        fontWeight: isDisplay ? 700 : 400,
                        lineHeight: 1.05,
                      }}
                    >
                      {isDisplay ? system.look.sample.display : system.look.sample.body}
                    </span>
                  </button>
                );
              })}
              {sizes.length > TYPE_ROWS && (
                <p className="sb-more">+{sizes.length - TYPE_ROWS} more sizes in All tokens</p>
              )}
            </div>
          </div>
        </Panel>
      );
    }

    if (b.panel === "tokens:shape") {
      const radii = group("Shape · radii")?.tokens ?? [];
      const borders = group("Shape · borders")?.tokens ?? [];
      const shadows = groupsLike("Depth").flatMap((g) => g.tokens).filter((t) => !t.name.endsWith("-offset"));
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Shape & depth"}>
          <p className="sb-sub">Radii</p>
          <div className="sb-shapes">
            {radii.map((t) => (
              <TokenChip key={t.name} t={t} className="sb-tok--shape">
                <span className="sb-radius" style={{ borderRadius: `min(var(${t.name}), 30px)`, borderColor: `var(${system.look.ink})` }} />
              </TokenChip>
            ))}
          </div>
          <p className="sb-sub">Shadows</p>
          <div className="sb-shapes">
            {shadows.map((t) => (
              <TokenChip key={t.name} t={t} className="sb-tok--shape">
                <span className="sb-shadow" style={{ boxShadow: `var(${t.name})`, borderColor: `var(${system.look.ink})`, background: `var(${system.look.surface})` }} />
              </TokenChip>
            ))}
          </div>
          <p className="sb-sub">Borders</p>
          <div className="sb-borders">
            {borders.map((t) => (
              <TokenChip key={t.name} t={t} className="sb-tok--line">
                <span className="sb-line" style={{ borderTopWidth: `var(${t.name})`, borderColor: `var(${system.look.ink})` }} />
              </TokenChip>
            ))}
          </div>
        </Panel>
      );
    }

    if (b.panel === "tokens:motion") {
      const eases = group("Motion · easing")?.tokens ?? [];
      const durs = group("Motion · durations")?.tokens ?? [];
      const secs = (v: string) => parseFloat(v) * (v.trim().endsWith("ms") ? 0.001 : 1);
      const max = Math.log(1 + Math.max(...durs.map((t) => secs(t.value)), 1));
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Motion"}>
          <div className="sb-eases">
            {eases.map((t) => (
              <button key={t.name} className="sb-ease" onClick={() => copyVar(t)} title={`Copy var(${t.name}). Hover to play.`}>
                <EaseCurve value={t.value} />
                <span className="sb-ease-track"><i style={{ transitionTimingFunction: `var(${t.name})` }} /></span>
                <span className="sb-tok-name">{flash === t.name ? "COPIED" : short(t.name, p)}</span>
              </button>
            ))}
          </div>
          <div className="sb-durs">
            {durs.map((t) => (
              <button key={t.name} className="sb-dur" onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
                <span className="sb-dur-name">{flash === t.name ? "COPIED" : short(t.name, p)}</span>
                <span className="sb-dur-bar"><i style={{ width: `${Math.max(4, (Math.log(1 + secs(t.value)) / max) * 100)}%` }} /></span>
                <span className="sb-dur-val">{t.value}</span>
              </button>
            ))}
          </div>
        </Panel>
      );
    }

    if (b.panel === "tokens:layout") {
      const space = groupsLike("Space").flatMap((g) => g.tokens);
      const pattern = groupsLike("Pattern").flatMap((g) => g.tokens);
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Layout & spacing"}>
          <div className="sb-cols" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => <i key={i} style={{ background: `var(${system.look.ink})` }} />)}
          </div>
          <p className="sb-cols-note">{system.look.layoutNote}</p>
          <div className="sb-rows">
            {[...space, ...pattern].map((t) => (
              <button key={t.name} className="sb-row" onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
                <span>{flash === t.name ? "COPIED" : short(t.name, p)}</span>
                <b>{value(t)}</b>
              </button>
            ))}
          </div>
        </Panel>
      );
    }

    if (b.panel === "tokens:all") {
      return (
        <Panel
          key={key}
          n={n}
          span={b.span}
          title={b.title ?? "All tokens"}
          actions={<CopyBtn id="all-tokens" flash={flash} label="COPY TOKENS" onClick={() => onCopy("all-tokens", spec.tokensCss + "\n")} />}
        >
          <div className="sb-all">
            {spec.groups.map((g: SpecimenGroup) => (
              <div key={g.title} className="sb-all-group">
                <p className="sb-sub">{g.title}</p>
                {g.tokens.map((t) => (
                  <button key={t.name} className="sb-all-row" onClick={() => copyVar(t)} title={`Copy var(${t.name})`}>
                    {isHex(value(t)) && <span className="sb-all-dot" style={{ background: `var(${t.name})` }} />}
                    <span className="sb-all-name">{flash === t.name ? "COPIED" : t.name}</span>
                    <span className="sb-all-val">{value(t)}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      );
    }

    if (b.panel === "used") {
      return (
        <Panel key={key} n={n} span={b.span} title={b.title ?? "Extracted from"}>
          <div className="sb-used">
            {templates.map((t) => (
              <div key={t.slug} className="sb-used-card">
                {t.thumbnail && <img src={t.thumbnail} alt="" loading="lazy" decoding="async" />}
                <div className="sb-used-text">
                  <b>{t.title}</b>
                  <span>{t.description}</span>
                  <span className="sb-used-links">
                    <Link to={`/prompt/${t.slug}`}>VIEW TEMPLATE <ArrowUpRight size={11} aria-hidden="true" /></Link>
                    {t.demo && (
                      <a href={t.demo} target="_blank" rel="noreferrer">LIVE PAGE <ExternalLink size={11} aria-hidden="true" /></a>
                    )}
                  </span>
                </div>
              </div>
            ))}
            {(() => {
              const pairs = allMotions.filter((m) => m.pairsWith.some((s) => templates.some((t) => t.slug === s)));
              return pairs.length ? (
                <p className="sb-used-motion">
                  <b>MOTION THAT PAIRS</b>
                  {pairs.map((m) => (
                    <Link key={m.slug} to={`/motion/${m.slug}`}>
                      {m.title} <ArrowUpRight size={11} aria-hidden="true" />
                    </Link>
                  ))}
                </p>
              ) : null;
            })()}
            <p className="sb-used-note">Every system on InstaLanding is extracted from a real, working page: the components here are its markup, not a redraw.</p>
          </div>
        </Panel>
      );
    }

    if (b.panel === "context") {
      const ctx = system.context;
      const html = (ids: { component: string; select?: string }[]) =>
        ids.map((x) => pick(byId.get(x.component)?.html ?? "", x.select)).join("\n");
      const asRefs = (ids: string[]) => ids.map((component) => ({ component }));
      return (
        <Panel key={key} n={n} span={b.span} title={ctx.title} flush>
          <p className="sb-context-note">{ctx.note}</p>
          <div className={`${system.rootClass} sb-context`} style={demoStyle}>
            <div className="sb-context-top" dangerouslySetInnerHTML={{ __html: html(asRefs(ctx.top)) }} />
            <div className="sb-context-grid">
              <div className="sb-context-main" dangerouslySetInnerHTML={{ __html: html(asRefs(ctx.main)) }} />
              <div className="sb-context-side" dangerouslySetInnerHTML={{ __html: html(ctx.side) }} />
            </div>
          </div>
        </Panel>
      );
    }

    if (b.panel.startsWith("component:")) {
      const c = byId.get(b.panel.slice("component:".length));
      if (!c) return null;
      return (
        <Panel
          key={key}
          n={n}
          span={b.span}
          title={b.title ?? c.label}
          actions={<CopyBtn id={`c-${c.id}`} flash={flash} onClick={() => onCopy(`c-${c.id}`, componentSnippet(system, spec, c, SITE_URL))} />}
        >
          <p className="sb-note">{c.note}</p>
          <div className={`${system.rootClass} sb-demo`} style={demoStyle} dangerouslySetInnerHTML={{ __html: c.html }} />
        </Panel>
      );
    }
    return null;
  });

  return (
    <div className="sysboard" style={boardStyle}>
      <style>{scoped}</style>
      {panels}
    </div>
  );
};

export default SystemBoard;
