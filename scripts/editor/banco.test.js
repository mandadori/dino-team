import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeIndex,
  filterAvailable,
  markUsed,
} from "./banco.js";

test("normalizeIndex: converte índice v1 (rest_until string) para v2 (mapa vazio)", () => {
  const idx = {
    images: [
      { file: "a.jpg", caption: "x", tags: [], used_in: [], rest_until: "2099-01-01" },
    ],
  };
  normalizeIndex(idx);
  assert.equal(idx.version, 2);
  const e = idx.images[0];
  assert.equal(e.drive_file_id, "a.jpg"); // herda do file legado
  assert.equal(e.name, "a.jpg");
  assert.deepEqual(e.rest_until, {}); // string vira mapa vazio (= disponível)
});

test("filterAvailable: foto com rest_until.instagram futuro NÃO aparece no instagram", () => {
  const idx = normalizeIndex({
    images: [
      { drive_file_id: "1", name: "rest.jpg", rest_until: { instagram: "2099-01-01" } },
      { drive_file_id: "2", name: "free.jpg", rest_until: {} },
    ],
  });
  const disp = filterAvailable(idx, "instagram", "2026-06-07");
  assert.deepEqual(disp.map((e) => e.drive_file_id), ["2"]);
});

test("TESTE-CHAVE: foto usada no instagram continua disponível em email e ads", () => {
  const idx = normalizeIndex({
    images: [{ drive_file_id: "1", name: "x.jpg", rest_until: { instagram: "2099-01-01" } }],
  });
  assert.equal(filterAvailable(idx, "instagram", "2026-06-07").length, 0);
  assert.equal(filterAvailable(idx, "email", "2026-06-07").length, 1);
  assert.equal(filterAvailable(idx, "ads", "2026-06-07").length, 1);
});

test("markUsed: seta rest_until.instagram = data+60 e NÃO toca email", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  const e = markUsed(idx, "1", "post-a", "2026-06-07", "instagram", 60);
  assert.equal(e.rest_until.instagram, "2026-08-06");
  assert.equal(e.rest_until.email, undefined);
  assert.deepEqual(e.used_in, [{ post: "post-a", date: "2026-06-07", canal: "instagram" }]);
});

test("markUsed: dois canais coexistem independentes no mesmo arquivo", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  markUsed(idx, "1", "post-a", "2026-06-07", "instagram", 60);
  markUsed(idx, "1", "post-b", "2026-06-07", "email", 30);
  const e = idx.images[0];
  assert.equal(e.rest_until.instagram, "2026-08-06");
  assert.equal(e.rest_until.email, "2026-07-07");
  assert.equal(e.used_in.length, 2);
});

test("markUsed: restDays=0 (ads) não cria descanso — disponível imediatamente", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  markUsed(idx, "1", "post-a", "2026-06-07", "ads", 0);
  assert.equal(idx.images[0].rest_until.ads, undefined);
  assert.equal(filterAvailable(idx, "ads", "2026-06-07").length, 1);
});

test("markUsed: drive_file_id inexistente devolve null", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  assert.equal(markUsed(idx, "999", "p", "2026-06-07", "instagram", 60), null);
});
