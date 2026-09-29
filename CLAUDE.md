# CLAUDE.md

See **[AGENTS.md](AGENTS.md)** — it covers the repo layout, how to add a prompt entry, the
single-file demo rules, the browser-verification loop and the deployment notes.

Quick facts:

- `src/data/prompts.ts` is the single source of truth and must stay import-free.
- Demos are one HTML file with every asset inlined, in `public/demos/`.
- Thumbnails are 1200x600 JPEGs in `public/thumbs/`.
- Verify in a real browser and look at the screenshots before reporting a change as done.
- `npm run lint` has 6 known pre-existing errors and 8 warnings; do not add more.
