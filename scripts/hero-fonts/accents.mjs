// The accent colour of every library item -> src/data/heroAccents.ts
// Usage, with the dev server on :8080 and jobs.json made by jobs.mts: node scripts/hero-fonts/accents.mjs   (BASE=, CHROME= to override)
//
// 1. In the item's own page, the colours it shows off: the headline (its colour and
//    any gradient-text stops), coloured words inside headings, the solid fills of
//    buttons and links, and vivid text near the top. Scored by how vivid and how
//    prominent each is, grouped by hue; the heaviest hue wins.
// 2. Nothing vivid there (text drawn on a canvas, a black-and-white page): the
//    picture's vivid pixels, grouped the same way.
// 3. Neither: a warm white.
// The colour is then lifted so it reads on the hero's near-black and carries dark text.
import { spawn } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const OUT = process.argv[2] ?? path.join(HERE, "../../src/data/heroAccents.ts");
const BASE = process.env.BASE ?? "http://localhost:8080";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const jobs = JSON.parse(fs.readFileSync(path.join(HERE, "jobs.json"), "utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const withTimeout = (p, ms) => Promise.race([p, sleep(ms).then(() => "TIMEOUT")]);

/* Shared in the page: rgb strings -> [r,g,b] 0..1, and hue grouping */
const HELPERS = `
  const rgbs = (s) => [...String(s).matchAll(/rgba?\\(([^)]+)\\)/g)].map(m => m[1].split(/[ ,\\/]+/).map(Number)).filter(a => a.length >= 3 && (a[3] === undefined || a[3] > 0.35)).map(a => [a[0] / 255, a[1] / 255, a[2] / 255]);
  const hsv = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; } return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx, d]; };
  const N = 24;
  const pickHue = (cands) => {
    const w = new Array(N).fill(0), top = new Array(N).fill(null);
    for (const [c, wt] of cands) { const [h, , , d] = hsv(c); if (d < 0.22) continue; const k = Math.floor(h / (360 / N)) % N; const sc = wt * d * d; w[k] += sc; if (!top[k] || sc > top[k][1]) top[k] = [c, sc]; }
    let best = -1, t = 0;
    for (let k = 0; k < N; k++) { const s = w[(k + N - 1) % N] + w[k] + w[(k + 1) % N]; if (s > t) { t = s; best = k; } }
    if (best < 0) return null;
    const ks = [best, (best + 1) % N, (best + N - 1) % N].filter(k => top[k]).sort((a, b) => top[b][1] - top[a][1]);
    return top[ks[0]][0];
  };
`;

const FROM_PAGE = `(async () => {
  ${HELPERS}
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]); } catch {}
  const vis = (el) => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el); return r.width > 2 && r.height > 2 && r.top < 1800 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05; };
  const own = (el) => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
  const cands = [];
  const add = (cs, wt) => rgbs(cs).forEach(c => cands.push([c, wt]));
  for (const h of document.querySelectorAll('h1')) {
    if (!vis(h)) continue;
    for (const el of [h, ...h.querySelectorAll('*')]) {
      const c = getComputedStyle(el);
      if (own(el)) { add(c.color, 3); add(c.webkitTextFillColor, 3); }
      if (c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text') add(c.backgroundImage, 4);
    }
  }
  for (const h of document.querySelectorAll('h2, h3')) {
    if (!vis(h)) continue;
    const base = getComputedStyle(h).color;
    for (const el of h.querySelectorAll('em, i, span, strong, b, mark')) {
      const c = getComputedStyle(el);
      if (c.color !== base) add(c.color, 2);
      if (c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text') add(c.backgroundImage, 2);
    }
  }
  for (const el of document.querySelectorAll('a, button, [role=button]')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect(); if (r.width * r.height < 900 || r.width * r.height > 120000) continue;
    const c = getComputedStyle(el);
    add(c.backgroundColor, 3);
    add(c.backgroundImage, 2);
  }
  let n = 0;
  for (const el of document.querySelectorAll('body *')) {
    if (n > 1500) break; n++;
    if (!own(el) || !vis(el)) continue;
    const c = getComputedStyle(el);
    add(c.color, Math.min(3, parseFloat(c.fontSize) / 16) * 0.5);
  }
  const c = pickHue(cands);
  return c ? c : null;
})()`;

const FROM_PICTURE = (src) => `(async () => {
  ${HELPERS}
  const img = new Image(); img.src = ${JSON.stringify(src)}; await img.decode();
  const W = 160, H = Math.round(160 * img.height / img.width);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data, cands = [];
  for (let i = 0; i < px.length; i += 8) { const c = [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]; const [, s, v] = hsv(c); if (v > 0.28 && s > 0.3) cands.push([c, s * v]); }
  if (cands.length < W * H * 0.004) return null;
  return pickHue(cands);
})()`;

// rgb 0..1 -> hsl, lifted into a readable band -> hex
const lift = ([r, g, b]) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l0 = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = d === 0 ? 0 : d / (1 - Math.abs(2 * l0 - 1));
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; }
  h = (h * 60 + 360) % 360;
  s = Math.max(0.6, Math.min(1, s));
  // Blues and violets look darker than yellows at the same lightness: they get more
  const floor = h >= 200 && h <= 300 ? 0.74 : h >= 40 && h <= 180 ? 0.6 : 0.68;
  const l = Math.max(floor, Math.min(0.82, l0));
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [R, G, B].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
};
const NEUTRAL = "#ece8df";

let proc, ws, id = 0; const w = new Map();
const send = (method, params = {}) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
async function start() {
  const port = 9300 + Math.floor(Math.random() * 400);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "acc-"));
  proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, "--mute-audio", "about:blank"], { stdio: "ignore" });
  let tabs; for (let i = 0; i < 160; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch {} await sleep(250); }
  ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.method === "Page.javascriptDialogOpening") send("Page.handleJavaScriptDialog", { accept: true });
    if (d.id && w.has(d.id)) { w.get(d.id)(d); w.delete(d.id); }
  };
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
}
const stop = () => { try { ws.close(); } catch {} try { proc.kill(); } catch {} w.clear(); };
const evalIn = async (expr, ms) => { const r = await withTimeout(send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }), ms); return r === "TIMEOUT" ? "TIMEOUT" : r.result?.result?.value ?? null; };

await start();
const out = {}, how = {};
for (const [key, file, picture] of jobs) {
  let c = null;
  const nav = await withTimeout(send("Page.navigate", { url: BASE + file }), 8000);
  if (nav !== "TIMEOUT") { await sleep(1800); c = await evalIn(FROM_PAGE, 9000); }
  if (c === "TIMEOUT" || nav === "TIMEOUT") { stop(); await start(); c = null; }
  if (c) how[key] = "page";
  else {
    await withTimeout(send("Page.navigate", { url: BASE + "/robots.txt" }), 8000); await sleep(400);
    c = await evalIn(FROM_PICTURE(picture), 9000);
    if (c === "TIMEOUT") { stop(); await start(); c = null; }
    how[key] = c ? "picture" : "neutral";
  }
  out[key] = c ? lift(c) : NEUTRAL;
  console.log(key.padEnd(46), out[key], how[key]);
}
stop();

const body = Object.entries(out).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n");
fs.writeFileSync(OUT, `/**
 * The accent colour of every library item, for the HOME hero (components/HomeHero.tsx):
 * the colour the item itself shows off (its headline, coloured heading words, button
 * fills), or its picture's main vivid colour when its text is drawn on a canvas,
 * lifted to read on the hero's near-black and to carry dark text. Keyed like
 * libraryItems. An item missing here uses lime.
 *
 * Generated, do not edit by hand. With the dev server running:
 *   npx tsx scripts/hero-fonts/jobs.mts && node scripts/hero-fonts/accents.mjs
 */
export const HERO_ACCENTS: Record<string, string> = {
${body}
};
`);
setTimeout(() => process.exit(0), 300);
