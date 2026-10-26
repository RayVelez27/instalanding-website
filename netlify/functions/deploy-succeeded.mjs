/**
 * Tells IndexNow (Bing, and the engines that share it: Yandex, Seznam, Naver)
 * which URLs changed, right after a production deploy goes live. Bing's index
 * feeds ChatGPT search and Copilot, so a new page can be cited within hours
 * instead of waiting for the next crawl.
 *
 * Netlify runs a function with this name on every successful deploy. The list
 * comes from /indexnow.json, which the build writes (plugins/library-endpoints.mjs):
 * the front doors plus anything added in the last week. The key file is
 * public/<INDEXNOW_KEY>.txt; IndexNow fetches it to check the site is ours.
 */
const INDEXNOW_KEY = "197e326a9bae2af87c395c8c7b8a7133";

export const handler = async (event) => {
  const { payload = {} } = JSON.parse(event.body || "{}");
  // Previews and branch deploys are not the site anyone should index.
  if (payload.context !== "production") return { statusCode: 200, body: `skipped: ${payload.context}` };

  const site = (payload.ssl_url || payload.url || process.env.URL || "https://instalanding.ai").replace(/\/$/, "");
  const { host } = new URL(site);
  let urls;
  try {
    const res = await fetch(`${site}/indexnow.json`, { signal: AbortSignal.timeout(8000) });
    urls = (await res.json()).urls;
  } catch (error) {
    return { statusCode: 200, body: `no indexnow.json: ${error.message}` };
  }
  urls = (urls ?? []).filter((u) => new URL(u).host === host).slice(0, 10000);
  if (!urls.length) return { statusCode: 200, body: "nothing to submit" };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: `${site}/${INDEXNOW_KEY}.txt`, urlList: urls }),
    signal: AbortSignal.timeout(10000),
  }).catch((error) => ({ status: 0, statusText: error.message }));
  const summary = `IndexNow: ${res.status} ${res.statusText ?? ""} for ${urls.length} URLs`.trim();
  console.log(summary);
  return { statusCode: 200, body: summary };
};
