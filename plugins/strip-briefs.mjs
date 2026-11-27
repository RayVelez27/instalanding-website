/**
 * Keeps the written briefs out of the browser bundle.
 *
 * src/data/prompts.ts and src/data/motion.ts carry every entry's one-shot
 * brief (`prompt`), about 690 KB of text that a visitor reads one entry at a
 * time, if at all. The same text is already published as /p/<slug>.txt and
 * /m/<slug>.txt (plugins/library-endpoints.mjs), so in the app the field is
 * emptied and `promptChars` keeps its length; lib/briefs.ts fetches the text
 * when a sheet or page needs it.
 *
 * Only the browser bundle is touched: the build plugins read the data files
 * from disk themselves, and Vitest (VITEST is set) sees them whole.
 */
const FILES = [/[\\/]src[\\/]data[\\/]prompts\.ts$/, /[\\/]src[\\/]data[\\/]motion\.ts$/];
const SYSTEMS = /[\\/]src[\\/]data[\\/]systems\.ts$/;

/**
 * Systems: `conventions` (about 140 KB) only feeds COPY FOR AGENT, and the build
 * publishes that exact text at /s/<slug>.txt, which the system sheet fetches.
 * Each `conventions: [ … ]` array becomes `[]`; strings are skipped whole, so a
 * bracket inside a rule can't end the array early.
 */
export const stripConventions = (code) => {
  let out = "";
  let at = 0;
  const re = /\n(\s+)conventions:\s*\[/g;
  let m;
  while ((m = re.exec(code))) {
    let j = m.index + m[0].length;
    let depth = 1;
    while (j < code.length && depth) {
      const c = code[j];
      if (c === '"' || c === "'" || c === "`") {
        j += 1;
        while (j < code.length && code[j] !== c) j += code[j] === "\\" ? 2 : 1;
      } else if (c === "[") depth += 1;
      else if (c === "]") depth -= 1;
      j += 1;
    }
    out += code.slice(at, m.index) + `\n${m[1]}conventions: []`;
    at = j;
    re.lastIndex = at;
  }
  return out + code.slice(at);
};

export const stripBriefs = (code) => {
  let out = "";
  let at = 0;
  const re = /\n(\s+)prompt:\s*/g;
  let m;
  while ((m = re.exec(code))) {
    const start = m.index + m[0].length;
    const q = code[start];
    if (q !== '"' && q !== "'" && q !== "`") continue; // the interface's `prompt: string;`
    let j = start + 1;
    while (j < code.length) {
      const c = code[j];
      if (c === "\\") { j += 2; continue; }
      if (q === "`" && code.startsWith("${", j)) throw new Error("strip-briefs: a brief uses ${…}; extend the scanner");
      if (c === q) break;
      j += 1;
    }
    // length of the string's value, not its source (escapes count once)
    const chars = new Function(`return ${code.slice(start, j + 1)}`)().length;
    out += code.slice(at, m.index) + `\n${m[1]}prompt: "", promptChars: ${chars}`;
    at = j + 1;
    re.lastIndex = at;
  }
  return out + code.slice(at);
};

export default function stripBriefsPlugin() {
  return {
    name: "strip-briefs",
    enforce: "pre",
    transform(code, id) {
      if (process.env.VITEST) return null;
      const file = id.split("?")[0];
      if (SYSTEMS.test(file)) return { code: stripConventions(code), map: null };
      if (!FILES.some((f) => f.test(file))) return null;
      return { code: stripBriefs(code), map: null };
    },
  };
}
