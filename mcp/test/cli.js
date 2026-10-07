/**
 * End-to-end check of the CLI: spawns it as a user (or an agent) would and
 * asserts on stdout, stderr and exit codes.
 *
 *   node test/cli.js [baseUrl]     default https://instalanding.ai
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "cli.js");
const baseUrl = process.argv[2] ?? "https://instalanding.ai";
const run = (...args) => {
  const r = spawnSync(process.execPath, [CLI, ...args, "--base-url", baseUrl], { encoding: "utf8" });
  return { out: r.stdout, err: r.stderr, code: r.status };
};

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

const help = run("help");
check("help", help.code === 0 && /search/.test(help.out) && /inspect/.test(help.out));

const search = run("search", "fire", "button", "--json");
const results = search.code === 0 ? JSON.parse(search.out).results : [];
const slug = results.find((r) => r.demoUrl)?.slug;
check("search --json returns entries", Boolean(slug), slug);

const inspect = run("inspect", slug);
check("inspect shows stack and next step", inspect.code === 0 && /Stack/.test(inspect.out) && /instalanding get/.test(inspect.out),
  inspect.out.split("\n")[0]);

const get = run("get", slug);
check("get prints only the brief", get.code === 0 && get.out.length > 400 && !/ONE-SHOT PROMPT/.test(get.out),
  `${get.out.length} chars`);

const dir = mkdtempSync(path.join(tmpdir(), "instalanding-cli-"));
try {
  const add = run("add", slug, dir + path.sep);
  const file = path.join(dir, `${slug}.html`);
  check("add writes the demo", add.code === 0 && existsSync(file) && /<!doctype html>/i.test(readFileSync(file, "utf8")),
    add.out.trim());
  const again = run("add", slug, dir + path.sep);
  check("add refuses to overwrite", again.code === 2 && /--force/.test(again.err));

  const skill = run("skill", "--install", path.join(dir, "skills"));
  check("skill --install writes SKILL.md", skill.code === 0 && existsSync(path.join(dir, "skills", "instalanding", "SKILL.md")));
} finally {
  rmSync(dir, { recursive: true, force: true });
}

const bad = run("inspect", "does-not-exist");
check("unknown slug exits 1 with a hint", bad.code === 1 && /Search for one/.test(bad.err), bad.err.trim().slice(0, 60));

const usage = run("get");
check("missing slug exits 2", usage.code === 2);

console.log(failures ? `\n${failures} failing check(s)` : "\nall checks passed");
process.exitCode = failures ? 1 : 0;
