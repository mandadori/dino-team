import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { serveSlides, serveContract, saveSlides, runExport } from "./handlers.js";

async function fixturePost() {
  const base = await mkdtemp(join(tmpdir(), "editor-"));
  const design = join(base, "design");
  await mkdir(design, { recursive: true });
  // estilo com a string "<section" num comentário — regressão do bug que comia o <style>
  const doc = (block, title) =>
    `<!doctype html><html><head><style>/* aplica em <section data-slide> */ .slide{width:1080px}</style></head>` +
    `<body><section class="slide ${block}" data-block="${block}">` +
    `<h1 data-slot="título">${title}</h1></section></body></html>`;
  await writeFile(join(design, "slide-1.html"), doc("capa", "UM"));
  await writeFile(join(design, "slide-2.html"), doc("corpo", "DOIS"));
  return { base, design };
}

test("serveSlides devolve css uma vez + a section de cada slide", async () => {
  const { base } = await fixturePost();
  const r = await serveSlides({ postDir: base });
  assert.equal(r.status, 200);
  const { css, slides } = JSON.parse(r.body);
  assert.match(css, /\.slide\{width:1080px\}/);
  assert.equal(slides.length, 2);
  assert.equal(slides[0].n, 1);
  assert.equal(slides[0].block, "capa");
  assert.match(slides[0].html, /data-slot="título"/);
  assert.ok(!slides[0].html.includes("aplica em"), "section não deve conter o comentário do <style>");
  assert.equal(slides[1].n, 2);
});

test("serveSlides devolve 404 sem slides", async () => {
  const base = await mkdtemp(join(tmpdir(), "editor-empty-"));
  await mkdir(join(base, "design"), { recursive: true });
  const r = await serveSlides({ postDir: base });
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

test("saveSlides troca só a section e preserva o CSS; grava edits.json", async () => {
  const { base, design } = await fixturePost();
  const novaSection =
    '<section class="slide capa" data-block="capa"><h1 data-slot="título" style="font-size:120px">EDITADO</h1></section>';
  const edits = { estilo: "editorial", post: "p", slides: [{ slide: 1, block: "capa", edits: [] }] };
  const r = await saveSlides({ postDir: base, slides: [{ n: 1, html: novaSection }], edits });
  assert.equal(r.status, 200);
  const saved = await readFile(join(design, "slide-1.html"), "utf8");
  assert.match(saved, /EDITADO/);
  assert.match(saved, /aplica em <section data-slide>/); // <style>/comentário preservado
  assert.match(saved, /\.slide\{width:1080px\}/);          // CSS preservado
  assert.match(saved, /font-size:120px/);
  const ej = JSON.parse(await readFile(join(design, "edits.json"), "utf8"));
  assert.equal(ej.estilo, "editorial");
});

test("saveSlides rejeita edits inválido com 400", async () => {
  const { base } = await fixturePost();
  const r = await saveSlides({ postDir: base, slides: [], edits: { estilo: "e", post: "p" } });
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

test("serveSuggestions resolve imagens em base64", async () => {
  const { mkdtemp, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { serveSuggestions } = await import("./handlers.js");

  const base = await mkdtemp(join(tmpdir(), "sugg-"));
  const design = join(base, "design");
  await mkdir(design, { recursive: true });
  const bank = await mkdtemp(join(tmpdir(), "bank-"));
  await writeFile(join(bank, "f.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  await writeFile(join(design, "suggestions.json"), JSON.stringify({
    "1": { drop: "photo", image: join(bank, "f.png") },
  }));

  const r = await serveSuggestions({ postDir: base });
  assert.equal(r.status, 200);
  const body = JSON.parse(r.body);
  assert.equal(body["1"].drop, "photo");
  assert.match(body["1"].dataUrl, /^data:image\/png;base64,/);
});

test("serveSuggestions devolve 204 sem suggestions.json", async () => {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { serveSuggestions } = await import("./handlers.js");
  const base = await mkdtemp(join(tmpdir(), "sugg-empty-"));
  const r = await serveSuggestions({ postDir: base });
  assert.equal(r.status, 204);
});
