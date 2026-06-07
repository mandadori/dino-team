import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = resolve(fileURLToPath(import.meta.url), "../../index-banco.js");

function run(args, opts = {}) {
  return execFileSync("node", [CLI, ...args], { encoding: "utf8", ...opts });
}

async function fixtureIndex(images) {
  const dir = await mkdtemp(join(tmpdir(), "banco-"));
  await writeFile(join(dir, ".banco-index.json"), JSON.stringify({ version: 2, images }), "utf8");
  return dir;
}

test("mark sem --canal falha com exit != 0", async () => {
  const dir = await fixtureIndex([{ drive_file_id: "1", name: "x.jpg", rest_until: {} }]);
  assert.throws(() => run(["mark", dir, "1", "post-a"]), /canal/i);
});

test("mark --canal instagram --rest 60 grava no canal certo", async () => {
  const dir = await fixtureIndex([{ drive_file_id: "1", name: "x.jpg", used_in: [], rest_until: {} }]);
  run(["mark", dir, "1", "post-a", "--canal", "instagram", "--rest", "60"]);
  const idx = JSON.parse(await readFile(join(dir, ".banco-index.json"), "utf8"));
  const e = idx.images[0];
  assert.ok(e.rest_until.instagram, "deve ter rest_until.instagram");
  assert.equal(e.rest_until.email, undefined);
  assert.equal(e.used_in[0].canal, "instagram");
});

test("available <dir> instagram lista só os disponíveis no canal", async () => {
  const dir = await fixtureIndex([
    { drive_file_id: "1", name: "rest.jpg", rest_until: { instagram: "2099-01-01" } },
    { drive_file_id: "2", name: "free.jpg", rest_until: {} },
  ]);
  const out = run(["available", dir, "instagram"]).trim();
  assert.equal(out, "2\tfree.jpg");
});
