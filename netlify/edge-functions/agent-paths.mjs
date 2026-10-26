/**
 * Mends URLs that crawlers pull out of markdown with the punctuation still on.
 *
 * llms.txt lists entries as `[Title](https://instalanding.ai/p/slug.txt): description`,
 * and some crawlers (Amazonbot, so far) cut the URL out with a plain-text pattern
 * and keep the `):`. Without this, /p/slug.txt): falls through to the app shell
 * with a 200, and the crawler stores an empty page under the brief's name.
 *
 * A path that ends in ")" (or "%29") plus any trailing : . , ; is 301'd to the
 * same path without it, query kept. Everything else never reaches this function.
 */
const TRAILING = /(?:\)|%29)[):.,;'"]*$/i;

export default async (request) => {
  const url = new URL(request.url);
  const clean = url.pathname.replace(TRAILING, "");
  if (clean === url.pathname || !clean) return;
  url.pathname = clean;
  return Response.redirect(url.toString(), 301);
};

export const config = {
  pattern: "^.*(\\)|%29)[):.,;'\"]*$",
};
