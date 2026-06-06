import { test } from "node:test";
import assert from "node:assert/strict";
import { resizeKeepingAspect, handleLayout, HANDLE_MIN, HANDLE_MAX, HANDLE_EDGES_BELOW } from "./geom.js";

test("axis w, lock on → height segue a proporção", () => {
  const r = resizeKeepingAspect(200, 100, "w", 300, true);
  assert.deepEqual(r, { width: 300, height: 150 }); // ratio 2:1
});

test("axis h, lock on → width segue a proporção", () => {
  const r = resizeKeepingAspect(200, 100, "h", 50, true);
  assert.deepEqual(r, { width: 100, height: 50 });
});

test("lock off → só o eixo digitado muda (o outro é null)", () => {
  assert.deepEqual(resizeKeepingAspect(200, 100, "w", 300, false), { width: 300, height: null });
  assert.deepEqual(resizeKeepingAspect(200, 100, "h", 50, false), { width: null, height: 50 });
});

test("dimensão atual zerada não quebra (ratio 1)", () => {
  assert.deepEqual(resizeKeepingAspect(0, 0, "w", 80, true), { width: 80, height: 80 });
});

test("handleLayout: box grande → cantos + arestas, tamanho no teto", () => {
  assert.deepEqual(handleLayout(200, 120), { size: HANDLE_MAX, corners: true, edges: true });
});

test("handleLayout: box pequeno → cantos sempre, arestas escondidas", () => {
  const v = handleLayout(30, 200); // min=30 < 40
  assert.equal(v.corners, true);
  assert.equal(v.edges, false);
});

test("handleLayout: box minúsculo → cantos ainda presentes (resize não some)", () => {
  const v = handleLayout(12, 12);
  assert.equal(v.corners, true);
  assert.equal(v.size, HANDLE_MIN);   // alça no piso agarrável
});

test("handleLayout: tamanho proporcional entre piso e teto", () => {
  assert.equal(handleLayout(40, 40).size, 10);   // round(40/4)=10
  assert.equal(handleLayout(40, 200).edges, true); // min=40 >= 40
  assert.equal(HANDLE_EDGES_BELOW, 40);
});
