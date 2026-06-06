import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEstilo, parseSlotDescriptor } from "./parse-estilo.js";

test("parseSlotDescriptor extrai fonte, tamanho, posição e alinhamento", () => {
  const r = parseSlotDescriptor("Anton ~140px | rodapé-centro | centralizado");
  assert.equal(r.font, "Anton");
  assert.equal(r.sizePx, 140);
  assert.equal(r.position, "rodapé-centro");
  assert.equal(r.align, "centralizado");
});

test("parseSlotDescriptor lida com descriptor só de posição", () => {
  const r = parseSlotDescriptor("posição rodapé-centro");
  assert.equal(r.font, null);
  assert.equal(r.sizePx, null);
  assert.equal(r.position, "rodapé-centro");
});

test("parseEstilo extrai blocos, bg-drop e slots do estilo editorial", () => {
  const md = readFileSync(
    "templates/social-media/carrossel/estilos/editorial/estilo.md",
    "utf8"
  );
  const c = parseEstilo(md);
  const nomes = c.blocks.map((b) => b.name);
  assert.deepEqual(nomes, ["capa", "corpo", "cta"]);

  const capa = c.blocks.find((b) => b.name === "capa");
  assert.equal(capa.bg, "photo");
  const titulo = capa.slots.find((s) => s.name === "título");
  assert.ok(titulo, "slot título existe na capa");
  assert.equal(titulo.font, "Anton");
  assert.equal(titulo.sizePx, 140);

  const corpo = c.blocks.find((b) => b.name === "corpo");
  const headline = corpo.slots.find((s) => s.name === "headline");
  assert.equal(headline.sizePx, 88);
});
