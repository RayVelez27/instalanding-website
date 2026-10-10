/**
 * Posts a form to Netlify Forms.
 *
 * Netlify only learns a form exists by finding it in static HTML at deploy
 * time, and never runs the React app, so every form submitted through here
 * has a hidden twin in public/__forms.html with the same name and fields.
 * Posting to that static file rather than "/" keeps the SPA rewrite in
 * _redirects out of the way. A field the twin does not declare is silently
 * dropped from the submission, so keep the two in step.
 *
 * Netlify Forms only exists on a deploy: on the dev server this logs the
 * submission and resolves, so the UI can be exercised without sending.
 */
const FORMS_ENDPOINT = "/__forms.html";

export async function submitNetlifyForm(formName: string, fields: Record<string, string>) {
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 400));
    console.info(`[${formName}] dev server: not sent. Netlify Forms receives this on a deploy.`, fields);
    return;
  }
  const res = await fetch(FORMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": formName, ...fields }).toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * The same, as multipart, for a form with a file field (its twin must declare
 * `enctype="multipart/form-data"` and the file input). Netlify caps a
 * submission at 8 MB including files.
 */
export async function submitNetlifyFormWithFiles(
  formName: string,
  fields: Record<string, string>,
  files: Record<string, File>,
) {
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 400));
    console.info(`[${formName}] dev server: not sent. Netlify Forms receives this on a deploy.`, fields, files);
    return;
  }
  const body = new FormData();
  body.append("form-name", formName);
  for (const [k, v] of Object.entries(fields)) body.append(k, v);
  for (const [k, f] of Object.entries(files)) body.append(k, f, f.name);
  // No Content-Type header: the browser sets the multipart boundary itself.
  const res = await fetch(FORMS_ENDPOINT, { method: "POST", body });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
