// For each item file (jobs.json, from jobs.mts): the headline's and body's computed fonts and the Google Fonts links -> fonts.json
// Usage, with the dev server on :8080: node scripts/hero-fonts/extract.mjs   (BASE=, CHROME= to override). Resumable; delete fonts.json to start over.
import { spawn } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; import os from "node:os";
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Z]:)/, "$1");
const JOBS = process.argv[2] ?? path.join(HERE, "jobs.json");
const OUT = process.argv[3] ?? path.join(HERE, "fonts.json");
const BASE = process.env.BASE ?? "http://localhost:8080";
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const jobs = JSON.parse(fs.readFileSync(JOBS, "utf8"));
const out = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const READ = `(async () => {
  try { await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]); } catch {}
  const vis = (el) => { const r = el.getBoundingClientRect(); const c = getComputedStyle(el); return r.width > 4 && r.height > 4 && c.visibility !== 'hidden' && c.display !== 'none' && +c.opacity > 0.05; };
  const own = (el) => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
  const pick = (el) => { const c = getComputedStyle(el); return { family: c.fontFamily, weight: c.fontWeight, style: c.fontStyle, size: parseFloat(c.fontSize), ls: c.letterSpacing, tag: el.tagName.toLowerCase(), text: el.textContent.trim().slice(0, 40) }; };
  let head = [...document.querySelectorAll('h1')].find(h => vis(h) && h.textContent.trim().length > 1);
  if (!head) {
    let best = null, top = 0;
    for (const el of document.querySelectorAll('body *')) {
      if (!own(el) || !vis(el)) continue;
      const r = el.getBoundingClientRect(); if (r.top > 1400) continue;
      const s = parseFloat(getComputedStyle(el).fontSize); if (s > top) { top = s; best = el; }
    }
    head = best;
  }
  if (head) { let b = head, t = own(head) ? parseFloat(getComputedStyle(head).fontSize) : 0; for (const el of head.querySelectorAll('*')) { if (!own(el) || !vis(el)) continue; const s = parseFloat(getComputedStyle(el).fontSize); if (s > t) { t = s; b = el; } } head = b; }
  const para = [...document.querySelectorAll('p, li, dd')].find(p => vis(p) && own(p) && p.textContent.trim().length > 30 && parseFloat(getComputedStyle(p).fontSize) <= 24);
  const links = [...document.querySelectorAll('link[href*="fonts.googleapis"]')].map(l => l.href);
  const imports = [...document.querySelectorAll('style')].flatMap(s => [...s.textContent.matchAll(/@import\\s+url\\(['"]?([^'")]*fonts\\.googleapis[^'")]*)/g)].map(m => m[1]));
  return JSON.stringify({ head: head ? pick(head) : null, body: pick(para || document.body), links: [...new Set([...links, ...imports])] });
})()`;

let proc, ws, id = 0; const w = new Map();
const send = (method, params = {}) => new Promise((r) => { const i = ++id; w.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const withTimeout = (p, ms) => Promise.race([p, sleep(ms).then(() => "TIMEOUT")]);

async function start() {
  const port = 9400 + Math.floor(Math.random() * 400);
  const prof = fs.mkdtempSync(path.join(os.tmpdir(), "fx-"));
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

await start();
for (const [key, file] of jobs) {
  if (out[key]?.head) continue;
  const nav = await withTimeout(send("Page.navigate", { url: BASE + file + (file.includes("?") ? "&" : "?") + "t=1" }), 8000);
  if (nav !== "TIMEOUT") await sleep(2200);
  const r = nav === "TIMEOUT" ? "TIMEOUT" : await withTimeout(send("Runtime.evaluate", { expression: READ, awaitPromise: true, returnByValue: true }), 9000);
  if (r === "TIMEOUT") {
    out[key] = { error: "timeout" };
    console.log(key.padEnd(46), "TIMEOUT (restarting Chrome)");
    stop(); await start();
  } else {
    const v = r.result?.result?.value;
    try { out[key] = JSON.parse(v); } catch { out[key] = { error: String(v ?? r.result?.exceptionDetails?.text) }; }
    const o = out[key];
    console.log(key.padEnd(46), o.head ? `${o.head.family.split(",")[0]} ${o.head.weight}${o.head.style === "italic" ? "i" : ""}` : "-", "|", o.body ? o.body.family.split(",")[0] : "-");
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
}
stop(); setTimeout(() => process.exit(0), 300);
