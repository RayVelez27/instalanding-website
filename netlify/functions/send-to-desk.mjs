/**
 * "Send it to your desk": a phone visitor emails themselves an item from the
 * library, to open on the computer where it'll be used (the mobile plan,
 * item 7). POST { email, kind, slug, website } as JSON.
 *
 * The visitor supplies only their address and which item; everything in the
 * email (title, links) comes from the site's own route shell for that item,
 * so this can't be used to send anyone arbitrary text. `website` is a
 * honeypot (people never fill it). A light per-instance rate limit caps
 * repeats from one address or connection.
 *
 * Needs RESEND_API_KEY and RESEND_FROM in the Netlify site's environment
 * (the same values as .env.local). Without them it answers 503 and the sheet
 * tells the visitor to copy the link instead.
 */
const ROUTES = { page: "prompt", product: "products", video: "videos", motion: "motion", system: "systems", icons: "icons" };
const NOUN = { page: "landing page", product: "product", video: "video", motion: "motion study", system: "design system", icons: "icon set" };
const EMAIL = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,24}$/i;
const SLUG = /^[a-z0-9][a-z0-9-]{1,90}$/;

const recent = new Map(); // key -> [timestamps]
const limited = (key, max, windowMs) => {
  const now = Date.now();
  const list = (recent.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  recent.set(key, list);
  return list.length > max;
};

const json = (statusCode, body) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Bad request" });
  }
  const email = String(body.email ?? "").trim();
  const kind = String(body.kind ?? "");
  const slug = String(body.slug ?? "");
  if (body.website) return json(200, { ok: true }); // the honeypot: say yes, send nothing
  if (!EMAIL.test(email) || !ROUTES[kind] || !SLUG.test(slug)) return json(400, { error: "Check the email address." });

  const ip = event.headers["x-nf-client-connection-ip"] || event.headers["x-forwarded-for"] || "unknown";
  if (limited(`ip:${ip}`, 6, 10 * 60 * 1000) || limited(`to:${email.toLowerCase()}`, 3, 10 * 60 * 1000)) {
    return json(429, { error: "That's a few in a row. Try again in a few minutes." });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) return json(503, { error: "Email isn't set up yet. Copy the link instead." });

  // The item must exist; its title comes from its own route shell
  const site = (process.env.URL || "https://instalanding.ai").replace(/\/$/, "");
  const pageUrl = `${site}/${ROUTES[kind]}/${slug}`;
  let title = slug;
  try {
    const res = await fetch(pageUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return json(404, { error: "That item wasn't found." });
    const shell = await res.text();
    // Unknown paths fall back to the app's index.html; only a real item's own
    // route shell carries a canonical link to exactly this path
    if (!new RegExp(`rel="canonical"[^>]*/${ROUTES[kind]}/${slug}"`).test(shell)) return json(404, { error: "That item wasn't found." });
    const m = shell.match(/<title>([^<]*)<\/title>/i);
    if (m) title = m[1].replace(/\s+[—|-]\s+InstaLanding\.ai.*$/i, "").trim() || slug;
  } catch {
    return json(502, { error: "Couldn't reach the library. Try again." });
  }

  const links = [
    [`Open the ${NOUN[kind]}`, pageUrl],
    ...(kind === "page" ? [["The one-shot prompt (instruction plus the whole file)", `${site}/p/${slug}.txt`]] : []),
    ...(kind === "motion" ? [["The one-shot prompt", `${site}/m/${slug}.txt`]] : []),
    ...(kind === "system" ? [["The agent instruction", `${site}/s/${slug}.txt`]] : []),
  ];
  const subject = `${title} · from InstaLanding.ai`;
  const text = [`${title}`, ``, `You sent this ${NOUN[kind]} to yourself from your phone.`, ``, ...links.map(([l, u]) => `${l}: ${u}`), ``, `InstaLanding.ai · premium HTML for humans and agents`].join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f2">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:28px 12px"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e6e6e6;border-radius:14px">
<tr><td style="padding:28px 28px 8px;font:600 11px/1.4 Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:#888">InstaLanding.ai · sent from your phone</td></tr>
<tr><td style="padding:0 28px 6px;font:800 26px/1.15 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111">${esc(title)}</td></tr>
<tr><td style="padding:0 28px 18px;font:400 15px/1.55 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#555">Here's the ${esc(NOUN[kind])} you saved, ready on your computer.</td></tr>
${links.map(([l, u], i) => `<tr><td style="padding:0 28px 10px"><a href="${esc(u)}" style="display:block;padding:14px 16px;border-radius:10px;text-decoration:none;font:700 15px/1.3 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;${i === 0 ? "background:#111;color:#fff" : "background:#f4f4f2;color:#111"}">${esc(l)} &rarr;</a></td></tr>`).join("")}
<tr><td style="padding:14px 28px 28px;font:400 12px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#999">You got this because you asked for it on instalanding.ai. One email, nothing more.</td></tr>
</table></td></tr></table></body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [email], subject, html, text, tags: [{ name: "type", value: "send_to_desk" }] }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return json(502, { error: "Couldn't send right now. Try again." });
  } catch {
    return json(502, { error: "Couldn't send right now. Try again." });
  }
  return json(200, { ok: true });
};
