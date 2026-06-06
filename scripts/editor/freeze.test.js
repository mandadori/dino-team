import { test } from "node:test";
import assert from "node:assert/strict";
import { frozenStyleFor, isFrozen } from "./freeze.js";

test("frozenStyleFor: texto fixa width (ceil) e NÃO fixa height", () => {
  const s = frozenStyleFor({ left: 10.2, top: 20.8, width: 300.4, height: 120 }, "text");
  assert.equal(s.position, "absolute");
  assert.equal(s.left, "10px");
  assert.equal(s.top, "21px");
  assert.equal(s.width, "301px");        // ceil preserva quebra de linha
  assert.equal(s.height, undefined);     // altura cresce com o conteúdo
});

test("frozenStyleFor: imagem fixa width e height (round)", () => {
  const s = frozenStyleFor({ left: 0, top: 0, width: 200.4, height: 100.6 }, "image");
  assert.equal(s.width, "200px");
  assert.equal(s.height, "101px");
});

test("isFrozen: true só quando position:absolute inline + left definido", () => {
  assert.equal(isFrozen({ style: { position: "absolute", left: "10px" } }), true);
  assert.equal(isFrozen({ style: { position: "absolute", left: "" } }), false);
  assert.equal(isFrozen({ style: { position: "", left: "10px" } }), false);
  assert.equal(isFrozen({ style: {} }), false);
});

test("frozenStyleFor: texto nowrap NÃO fixa width (cresce com a fonte)", () => {
  const s = frozenStyleFor({ left: 10, top: 20, width: 120, height: 40 }, "text", { nowrap: true });
  assert.equal(s.position, "absolute");
  assert.equal(s.left, "10px");
  assert.equal(s.width, undefined);   // sem width → cresce com a fonte, seta não some
  assert.equal(s.height, undefined);
});

test("frozenStyleFor: texto sem opts mantém width (compat)", () => {
  const s = frozenStyleFor({ left: 0, top: 0, width: 200.4, height: 40 }, "text");
  assert.equal(s.width, "201px");
});
