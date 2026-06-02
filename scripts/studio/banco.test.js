import { test } from "node:test";
import assert from "node:assert/strict";
import { scanNew, upsertCaption, markUsed, filterAvailable } from "./banco.js";

test("scanNew retorna arquivos ainda não indexados", () => {
  const index = { images: [{ file: "a.jpg", caption: "x", tags: [], used_in: [], rest_until: null }] };
  const novos = scanNew(["a.jpg", "b.jpg", "c.png"], index);
  assert.deepEqual(novos, ["b.jpg", "c.png"]);
});

test("upsertCaption cria entrada nova com defaults", () => {
  const index = { images: [] };
  upsertCaption(index, "b.jpg", "Ramon de frente", ["frente", "pb"]);
  assert.equal(index.images.length, 1);
  assert.deepEqual(index.images[0], {
    file: "b.jpg", caption: "Ramon de frente", tags: ["frente", "pb"], used_in: [], rest_until: null,
  });
});

test("upsertCaption atualiza entrada existente sem perder uso", () => {
  const index = { images: [{ file: "b.jpg", caption: "velho", tags: [], used_in: [{ post: "p", date: "2026-01-01" }], rest_until: "2026-02-01" }] };
  upsertCaption(index, "b.jpg", "novo", ["x"]);
  assert.equal(index.images[0].caption, "novo");
  assert.deepEqual(index.images[0].tags, ["x"]);
  assert.equal(index.images[0].used_in.length, 1);
});

test("markUsed registra uso e define rest_until", () => {
  const index = { images: [{ file: "b.jpg", caption: "x", tags: [], used_in: [], rest_until: null }] };
  markUsed(index, "b.jpg", "2026-06-02-post", "2026-06-02", 30);
  const e = index.images[0];
  assert.deepEqual(e.used_in[0], { post: "2026-06-02-post", date: "2026-06-02" });
  assert.equal(e.rest_until, "2026-07-02");
});

test("filterAvailable exclui imagens em descanso", () => {
  const index = { images: [
    { file: "a.jpg", caption: "", tags: [], used_in: [], rest_until: null },
    { file: "b.jpg", caption: "", tags: [], used_in: [], rest_until: "2026-07-02" },
    { file: "c.jpg", caption: "", tags: [], used_in: [], rest_until: "2026-05-01" },
  ] };
  const disp = filterAvailable(index, "2026-06-02").map((e) => e.file);
  assert.deepEqual(disp, ["a.jpg", "c.jpg"]);
});
