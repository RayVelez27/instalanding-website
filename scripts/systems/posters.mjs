// Poster thumbnails for the SYSTEMS grid: one cover per system, plus hover
// frames that flick through its signature components.
//
// Each poster is built inside the system's own specimen page, so the type,
// colours and components are the real thing, rendered by the system's own CSS
// and fonts: the name huge in its display face on its identity background, the
// tagline, a palette bar, and one component lifted out of the specimen and
// scaled up on the system's surface. Frame 1 is the cover; frames 2-4 swap
// the component. Writes public/systems/<slug>/poster-<n>.jpg at 1200x600.
//
//   npm run dev -- --port 8123          (the specimens must be served)
//   node scripts/systems/posters.mjs http://localhost:8123 [slug ...]
//
// Needs Microsoft Edge (headless) and Python with Pillow for the JPEG step.
// Add a system to HEROES when it lands; the components are chosen by hand.
// "pricing@1100" lays a fluid component out 1100px wide before it is scaled into the panel.
import fs from "node:fs";
import path from "node:path";
import { spawn, execFileSync } from "node:child_process";
import { root } from "./lib.mjs";

const HEROES = {
  "kind-swarm": ["characters", "rings", "card", "buttons"],
  kiln: ["rockers", "gauge", "plate", "keyslot"],
  footnote: ["headline", "tray", "sheet", "figures"],
  hollr: ["window", "buddy", "toast", "agent-run"],
  overclock: ["cover", "cta", "terminal", "pricing"],
  meridian: ["led", "assist", "quick", "articles"],
  thorn: ["hero", "bento", "accents", "buttons"],
  arcline: ["widgets", "chat", "pricing", "steps"],
  prism: ["art", "runs", "gate", "voices"],
  siliq: ["board@1100", "products@1100", "pricing@1000", "team@900"],
  orrery: ["gallery", "pricing@1100", "team@1100", "outcomes@1100"],
  halden: ["hero@1200", "diagnosis@1100", "shelf@1100", "routes@1100"],
  tessel: ["hero@1200", "blocks@1000", "utilisation@600", "guide@760"],
  agentic: ["hero@1200", "art@1100", "stats@1100", "programme@1100"],
  hearthly: ["art@1100", "plates@1100", "team@1100", "pricing@1100"],
  corvane: ["hero@1200", "criteria@1100", "team@1100", "ledger@1100"],
  lemegeton: ["seal@760", "wards@1100", "summon@1100", "pricing@1100"],
  ochre: ["hero@1200", "phones@1000", "pricing@1100", "soundscapes@1100"],
};

// Systems whose identity background is a pattern: their small text sits on a label
const BOXED = ["kind-swarm"];

const EDGE = process.env.EDGE ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const [base = "http://localhost:8123", ...only] = process.argv.slice(2);

/** The few fields a poster needs, read straight from src/data/systems.ts */
function readSystems() {
  const src = fs.readFileSync(path.join(root, "src/data/systems.ts"), "utf8").replace(/\r\n/g, "\n");
  const out = [];
  const re = /slug: "([a-z-]+)",\n\s+name: "([^"]+)",\n\s+version: "([^"]+)",\n\s+tagline: "([^"]+)"/g;
  for (let m; (m = re.exec(src)); ) {
    const seg = src.slice(m.index, m.index + 14000);
    const pick = (k) => seg.match(new RegExp(`${k}: "([^"]*)"`))?.[1] ?? "";
    out.push({
      slug: m[1],
      name: m[2],
      version: m[3],
      tagline: m[4],
      theme: pick("theme"),
      palette: JSON.parse(seg.match(/palette: (\[[^\]]*\])/)[1]),
      root: pick("rootClass"),
      look: {
        surface: pick("surface"),
        ink: pick("ink"),
        display: pick("display"),
        mono: pick("mono"),
        idClass: pick("identityClass"),
        idBg: pick("identityBg"),
        idText: pick("identityText"),
        upper: /displayUpper: true/.test(seg.slice(seg.indexOf("look: {"), seg.indexOf("look: {") + 600)),
        tracking: seg.slice(seg.indexOf("look: {"), seg.indexOf("look: {") + 600).match(/displayTracking: "([^"]+)"/)?.[1] ?? "",
      },
      components: seg.match(/components: \[([\s\S]*?)\],/)[1].match(/id: "([a-z-]+)"/g).length,
    });
  }
  return out;
}

/* Runs in the specimen page: builds the poster over everything else. */
const BUILD = (sys, pick, BOXED) => {
  const [heroId, layoutW] = pick.split("@");
  document.getElementById("ilp")?.remove();
  const L = sys.look;
  const css = document.createElement("style");
  css.id = "ilp-css";
  css.textContent = `
    html, body { overflow: hidden !important; }
    #ilp { position: fixed; inset: 0; z-index: 2147483000; display: grid; grid-template-columns: 47% 53%; grid-template-rows: 1fr 54px; background: ${L.idBg}; color: ${L.idText}; }
    #ilp .ilp-id { grid-row: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 44px 40px 34px 46px; min-width: 0; position: relative; }
    #ilp .ilp-id::before { content: ""; position: absolute; inset: 0; background: inherit; }
    #ilp .ilp-kick { position: relative; margin: 0; font: 600 13px/1.2 var(${L.mono}), ui-monospace, monospace; letter-spacing: .22em; text-transform: uppercase; opacity: .82; }
    #ilp .ilp-name { position: relative; margin: 0; overflow-wrap: normal; hyphens: manual; font-family: var(${L.display}); font-weight: 900; line-height: .86; letter-spacing: ${L.tracking || "-.035em"}; ${L.upper ? "text-transform: uppercase;" : ""} }
    #ilp.ilp-boxed .ilp-kick, #ilp.ilp-boxed .ilp-tag { align-self: flex-start; padding: 7px 10px; background: ${L.idText}; color: var(${L.surface}); opacity: 1; }
    #ilp .ilp-tag { position: relative; margin: 0; max-width: 30ch; font: 500 15px/1.45 var(${L.mono}), ui-monospace, monospace; opacity: .86; }
    #ilp .ilp-hero { grid-row: 1; position: relative; display: grid; place-items: center; overflow: hidden; background: var(${L.surface}); border-left: 3px solid currentColor; }
    #ilp .ilp-stage { color: var(${L.ink}); }
    #ilp .ilp-stage { transform-origin: center; }
    #ilp .ilp-stage .sp-demo { margin: 0 !important; padding: 0 !important; border: 0 !important; background: none !important; box-shadow: none !important; }
    #ilp .ilp-pal { grid-column: 1 / -1; grid-row: 2; display: flex; border-top: 3px solid currentColor; }
    #ilp .ilp-pal i { flex: 1; }
    #ilp .ilp-pal b { flex: none; display: flex; align-items: center; padding: 0 22px; font: 700 12px/1 var(${L.mono}), ui-monospace, monospace; letter-spacing: .22em; background: ${L.idBg}; color: ${L.idText}; border-left: 3px solid currentColor; }
  `;
  document.head.appendChild(css);

  const ilp = document.createElement("div");
  ilp.id = "ilp";
  ilp.className = sys.root + (BOXED.includes(sys.slug) ? " ilp-boxed" : "");
  ilp.innerHTML = `
    <div class="ilp-id ${L.idClass}">
      <p class="ilp-kick">Design system · ${sys.slug}@${sys.version}</p>
      <h1 class="ilp-name">${sys.name}</h1>
      <p class="ilp-tag">${sys.tagline}</p>
    </div>
    <div class="ilp-hero"><div class="ilp-stage"></div></div>
    <div class="ilp-pal">${sys.palette.map((c) => `<i style="background:${c}"></i>`).join("")}<b>${sys.components} COMPONENTS</b></div>`;
  document.body.appendChild(ilp);

  const demo = document.querySelector(`section[data-component="${heroId}"] .sp-demo`);
  const stage = ilp.querySelector(".ilp-stage");
  if (demo) {
    if (layoutW) stage.style.width = layoutW + "px";
    stage.appendChild(demo.cloneNode(true));
    // A fluid component (width: 100%) collapses when shrink-wrapped: give it the width it has in the specimen
    if (stage.scrollWidth < 300) stage.style.width = demo.getBoundingClientRect().width + "px";
  }

  // The name as big as the column allows
  const name = ilp.querySelector(".ilp-name");
  const col = ilp.querySelector(".ilp-id");
  let size = 150;
  name.style.fontSize = size + "px";
  const room = () => col.clientWidth - 86;
  while (size > 40 && (name.scrollWidth > room() || name.offsetHeight > 330)) {
    size -= 4;
    name.style.fontSize = size + "px";
  }

  // The component as big as the panel allows (never more than 2x)
  const hero = ilp.querySelector(".ilp-hero");
  const w = stage.scrollWidth, h = stage.scrollHeight;
  const k = Math.min(2, (hero.clientWidth - 70) / w, (hero.clientHeight - 60) / h);
  // Centred on its own box, so a component larger than the panel shrinks in place instead of overflowing to one side
  // (its measured width is kept, or a grid inside would shrink-wrap once it is absolutely positioned)
  Object.assign(stage.style, { position: "absolute", left: "50%", top: "50%", width: `${w}px`, transform: `translate(-50%, -50%) scale(${k})` });
  return { size, k: +k.toFixed(2), w, h, found: !!demo };
};

async function main() {
  const systems = readSystems().filter((s) => HEROES[s.slug] && (!only.length || only.includes(s.slug)));
  const port = 9600 + Math.floor(Math.random() * 40);
  const prof = path.join(process.env.TEMP ?? "/tmp", `posters-${port}`);
  const edge = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let ws;
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const p = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
      if (p) ws = new WebSocket(p.webSocketDebuggerUrl);
    } catch {}
    if (!ws) await sleep(200);
  }
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pend = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id) pend.get(m.id)?.(m);
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1200, height: 600, deviceScaleFactor: 1, mobile: false });

  for (const sys of systems) {
    await send("Page.navigate", { url: `${base}/systems/${sys.slug}/specimen.html` });
    await sleep(3500);
    await send("Runtime.evaluate", { expression: "document.fonts.ready", awaitPromise: true });
    for (const [n, heroId] of HEROES[sys.slug].entries()) {
      // Bring the component on screen first, so scroll reveals have run before it is cloned
      await send("Runtime.evaluate", { expression: `document.getElementById("ilp")?.remove(); document.querySelector('section[data-component="${heroId.split("@")[0]}"] .sp-demo')?.scrollIntoView({ block: "center" })` });
      await sleep(900);
      const r = await send("Runtime.evaluate", { expression: `(${BUILD})(${JSON.stringify(sys)}, ${JSON.stringify(heroId)}, ${JSON.stringify(BOXED)})`, returnByValue: true });
      await sleep(700);
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const png = path.join(prof, `${sys.slug}-${n + 1}.png`);
      fs.mkdirSync(prof, { recursive: true });
      fs.writeFileSync(png, Buffer.from(shot.result.data, "base64"));
      const jpg = path.join(root, "public/systems", sys.slug, `poster-${n + 1}.jpg`);
      execFileSync("python", ["-c", "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],quality=84,optimize=True)", png, jpg]);
      console.log(sys.slug, n + 1, heroId, JSON.stringify(r.result?.result?.value ?? r.result));
    }
  }
  ws.close();
  edge.kill();
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
