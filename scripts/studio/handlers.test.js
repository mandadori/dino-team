import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { servePreview, serveContract, saveEdits, runExport } from "./handlers.js";

async function fixturePost() {
  const base = await mkdtemp(join(tmpdir(), "studio-"));
  const design = join(base, "design");
  await mkdir(design, { recursive: true });
  await writeFile(join(design, "preview.html"), "<html><body>old</body></html>");
  return { base, design };
}

test("servePreview devolve o preview.html", async () => {
  const { base } = await fixturePost();
  const r = await servePreview({ postDir: base });
  assert.equal(r.status, 200);
  assert.match(r.body, /old/);
});

test("servePreview devolve 404 sem preview", async () => {
  const base = await mkdtemp(join(tmpdir(), "studio-empty-"));
  const r = await servePreview({ postDir: base });
  assert.equal(r.status, 404);
});

test("serveContract roda parseEstilo e inclui estilo_path + post", async () => {
  const estiloPath = "templates/social-media/carrossel/estilos/editorial/estilo.md";
  const r = await serveContract({ estiloPath, postSlug: "2026-06-02-do-zero-ao-topo" });
  assert.equal(r.status, 200);
  const c = JSON.parse(r.body);
  assert.ok(c.blocks.length >= 3);
  assert.equal(c.estilo_path, estiloPath);
  assert.equal(c.post, "2026-06-02-do-zero-ao-topo");
});

test("serveContract devolve 204 sem estiloPath", async () => {
  const r = await serveContract({ estiloPath: null });
  assert.equal(r.status, 204);
});

test("saveEdits grava preview.html e edits.json válidos", async () => {
  const { base, design } = await fixturePost();
  const payload = {
    estilo: "editorial",
    post: "p",
    slides: [{ slide: 1, block: "capa", edits: [] }],
  };
  const r = await saveEdits({ postDir: base, html: "<html>new</html>", edits: payload });
  assert.equal(r.status, 200);
  assert.equal(await readFile(join(design, "preview.html"), "utf8"), "<html>new</html>");
  const written = JSON.parse(await readFile(join(design, "edits.json"), "utf8"));
  assert.equal(written.estilo, "editorial");
});

test("saveEdits rejeita payload inválido com 400", async () => {
  const { base } = await fixturePost();
  const r = await saveEdits({ postDir: base, html: "<html>x</html>", edits: { estilo: "e", post: "p" } });
  assert.equal(r.status, 400);
  assert.ok(r.body.includes("slides"));
});

test("runExport invoca o export-png.js com o postDir", async () => {
  const calls = [];
  const fakeSpawn = (cmd, args) => {
    calls.push({ cmd, args });
    return { on: (ev, cb) => { if (ev === "close") cb(0); } };
  };
  const r = await runExport({ postDir: "/tmp/post", spawn: fakeSpawn });
  assert.equal(r.status, 200);
  assert.equal(calls[0].cmd, "node");
  assert.deepEqual(calls[0].args, ["scripts/export-png.js", "/tmp/post"]);
});
