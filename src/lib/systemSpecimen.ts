import { useEffect, useState } from "react";
import type { SystemEntry } from "@/data/systems";

/**
 * Reads a system's specimen file (public/systems/<slug>/specimen.html), which is
 * the single source of truth for everything the SYSTEMS dialog shows and
 * copies: the token block, the component CSS, the shared SVG defs, the
 * component script and each component's markup.
 */
export interface SpecimenToken { name: string; value: string }
export interface SpecimenGroup { title: string; tokens: SpecimenToken[] }
export interface SpecimenComponent { id: string; label: string; note: string; html: string; js: boolean; defs: boolean }
export interface Specimen {
  tokensCss: string;
  componentsCss: string;
  defs: string;
  script: string;
  groups: SpecimenGroup[];
  components: SpecimenComponent[];
}

const cache = new Map<string, Promise<Specimen>>();

/** Pulls the token groups out of the CSS: a "/* Color · core *\/" comment starts a group. */
export function parseTokens(css: string): SpecimenGroup[] {
  const body = css.slice(css.indexOf("{") + 1, css.lastIndexOf("}"));
  const groups: SpecimenGroup[] = [];
  for (const line of body.split("\n")) {
    const head = /^\s*\/\*\s*(.+?)\s*\*\/\s*$/.exec(line);
    if (head) { groups.push({ title: head[1], tokens: [] }); continue; }
    const tok = /^\s*(--[\w-]+):\s*(.+?);\s*$/.exec(line);
    if (tok) {
      if (!groups.length) groups.push({ title: "Tokens", tokens: [] });
      groups[groups.length - 1].tokens.push({ name: tok[1], value: tok[2] });
    }
  }
  return groups.filter((g) => g.tokens.length);
}

function parse(html: string, prefix: string): Specimen {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = (sel: string) => doc.querySelector(sel)?.textContent?.trim() ?? "";
  const tokensCss = text(`style#${prefix}-tokens`);
  const components = Array.from(doc.querySelectorAll<HTMLElement>("section[data-component]")).map((sec) => ({
    id: sec.dataset.component ?? "",
    label: sec.dataset.label ?? "",
    note: sec.querySelector("[data-note]")?.textContent?.trim() ?? "",
    html: (sec.querySelector(".sp-demo")?.innerHTML ?? "").trim(),
    js: sec.hasAttribute("data-js"),
    defs: sec.hasAttribute("data-defs"),
  }));
  return {
    tokensCss,
    componentsCss: text(`style#${prefix}-components`),
    defs: doc.querySelector(`svg#${prefix}-defs`)?.outerHTML ?? "",
    script: text(`script#${prefix}-components-js`),
    groups: parseTokens(tokensCss),
    components,
  };
}

export function loadSpecimen(system: SystemEntry) {
  let pending = cache.get(system.slug);
  if (!pending) {
    pending = fetch(system.files.specimen)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((html) => parse(html, system.prefix));
    pending.catch(() => cache.delete(system.slug));
    cache.set(system.slug, pending);
  }
  return pending;
}

type State = { status: "loading" } | { status: "ready"; specimen: Specimen } | { status: "error" };

export function useSpecimen(system: SystemEntry | undefined) {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    if (!system) return;
    let live = true;
    setState({ status: "loading" });
    loadSpecimen(system).then(
      (specimen) => live && setState({ status: "ready", specimen }),
      () => live && setState({ status: "error" }),
    );
    return () => {
      live = false;
    };
  }, [system]);
  return state;
}

/**
 * One component, ready to paste: a comment saying what it needs, the shared
 * SVG defs if it draws characters, the markup inside the system's root class,
 * and the component script if it is interactive.
 */
export function componentSnippet(system: SystemEntry, spec: Specimen, c: SpecimenComponent, siteUrl: string) {
  return [
    `<!-- ${system.name} · ${c.label} · ${system.slug}@${system.version}`,
    `     Needs the system CSS: <link rel="stylesheet" href="${siteUrl}${system.files.css}">`,
    `     and its fonts: <link rel="stylesheet" href="${system.fontsHref}"> -->`,
    `<div class="${system.rootClass}">`,
    c.defs ? spec.defs : "",
    c.html,
    `</div>`,
    c.js ? `<script>\n${spec.script}\n</script>` : "",
  ].filter(Boolean).join("\n") + "\n";
}

/** Mixes a hex colour toward black (amount > 0) or white (amount < 0). */
export function shade(hex: string, amount: number) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const target = amount >= 0 ? 0 : 255, t = Math.abs(amount);
  const ch = (i: number) => {
    const v = parseInt(m[1].slice(i, i + 2), 16);
    return Math.round(v + (target - v) * t).toString(16).padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`.toUpperCase();
}

/** The token CSS with some values replaced (the playground's export). */
export function customizedTokens(tokensCss: string, overrides: Record<string, string>) {
  let css = tokensCss;
  for (const [name, value] of Object.entries(overrides)) {
    css = css.replace(new RegExp(`(\\n\\s*${name}:\\s*)[^;]+;`), `$1${value};`);
  }
  return css;
}
