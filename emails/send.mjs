// Send one announcement email through Resend to the addresses you name. Never to a list.
//
//   node emails/send.mjs <file.html> "<subject>" <to> [<to> ...]
//
// Reads RESEND_API_KEY and RESEND_FROM (e.g. "InstaLanding <hello@instalanding.ai>") from
// the environment or from .env.local (git-ignored). The from address must be on a domain
// verified in Resend. The key is never printed.
//
// Resend Broadcasts fill {{{RESEND_UNSUBSCRIBE_URL}}}; a direct send like this one does not,
// so the link is pointed at the site for tests.
import fs from "node:fs";
import path from "node:path";

const [file, subject, ...to] = process.argv.slice(2);
if (!file || !subject || !to.length) {
  console.error('usage: node emails/send.mjs <file.html> "<subject>" <to> [<to> ...]');
  process.exit(1);
}

const envFile = path.resolve(".env.local");
const fromFile = fs.existsSync(envFile)
  ? Object.fromEntries(
      fs.readFileSync(envFile, "utf8").split(/\r?\n/)
        .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
        .filter(Boolean)
        .map(([, k, v]) => [k, v.replace(/^["']|["']$/g, "")]),
    )
  : {};
const key = process.env.RESEND_API_KEY || fromFile.RESEND_API_KEY;
const from = process.env.RESEND_FROM || fromFile.RESEND_FROM;
if (!key) { console.error("RESEND_API_KEY is not set (environment or .env.local)"); process.exit(1); }
if (!from) { console.error('RESEND_FROM is not set, e.g. RESEND_FROM="InstaLanding <hello@instalanding.ai>"'); process.exit(1); }

const html = fs.readFileSync(file, "utf8").replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "https://instalanding.ai");
// A plain-text part, for clients that show it and for spam filters that want one
const text = html
  .replace(/<style[\s\S]*?<\/style>/gi, "")
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) => `${label.replace(/<[^>]+>/g, "").trim()} (${href})`)
  .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|h1|h2|tr|div)>/gi, "\n").replace(/<[^>]+>/g, "")
  .replace(/&rarr;/g, "→").replace(/&bull;/g, "•").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
  .replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from, to, subject, html, text }),
});
const body = await res.text();
console.log(res.status, body);
// exitCode, not process.exit(): exiting while a socket is still closing trips a libuv assertion on Windows
process.exitCode = res.ok ? 0 : 1;
