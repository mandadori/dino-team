import { test } from "node:test";
import assert from "node:assert/strict";
import { extractStructural } from "./extract-structural.js";

const edits = {
  estilo: "editorial",
  estilo_path: "templates/social-media/carrossel/estilos/editorial/estilo.md",
  post: "2026-06-02-do-zero-ao-topo",
  slides: [
    { slide: 1, block: "capa", edits: [
      { target: "logo", prop: "size", from: "120px", to: "96px", scope: "structural" },
      { target: "título", prop: "text", from: "X", to: "Y", scope: "content" },
    ] },
    { slide: 2, block: "corpo", edits: [
      { target: "corpo", prop: "removed", from: "present", to: "removed", scope: "structural" },
    ] },
  ],
};

test("agrupa só deltas structural por bloco", () => {
  const r = extractStructural(edits);
  assert.equal(r.hasStructural, true);
  assert.equal(r.byBlock.length, 2);
  const capa = r.byBlock.find((b) => b.block === "capa");
  assert.equal(capa.deltas.length, 1);
  assert.equal(capa.deltas[0].target, "logo");
});

test("gera linhas legíveis por delta", () => {
  const r = extractStructural(edits);
  const capa = r.byBlock.find((b) => b.block === "capa");
  assert.equal(capa.lines[0], "logo: size 120px→96px");
  const corpo = r.byBlock.find((b) => b.block === "corpo");
  assert.equal(corpo.lines[0], "corpo: removido");
});

test("payload só com content → hasStructural false", () => {
  const r = extractStructural({
    estilo: "x", post: "y",
    slides: [{ slide: 1, block: "capa", edits: [{ target: "t", prop: "text", from: "a", to: "b", scope: "content" }] }],
  });
  assert.equal(r.hasStructural, false);
  assert.deepEqual(r.byBlock, []);
});
