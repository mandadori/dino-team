import { test } from "node:test";
import assert from "node:assert/strict";
import { resizeKeepingAspect } from "./geom.js";

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
