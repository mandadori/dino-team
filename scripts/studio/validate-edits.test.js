import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEdits } from "./validate-edits.js";

const valido = {
  estilo: "editorial",
  estilo_path: "templates/social-media/carrossel/estilos/editorial/estilo.md",
  post: "2026-06-02-do-zero-ao-topo",
  slides: [
    {
      slide: 1,
      block: "capa",
      edits: [
        { target: "logo", prop: "size", from: "120px", to: "96px", scope: "structural" },
        { target: "título", prop: "text", from: "X", to: "Y", scope: "content" },
      ],
      background: { drop: "photo", image: "ramon-042.jpg", position: "center 30%", zoom: 1.2 },
    },
  ],
};

test("payload válido passa", () => {
  const r = validateEdits(valido);
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, []);
});

test("scope inválido falha", () => {
  const ruim = structuredClone(valido);
  ruim.slides[0].edits[0].scope = "qualquer";
  const r = validateEdits(ruim);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("scope")));
});

test("slides ausente falha", () => {
  const r = validateEdits({ estilo: "x", post: "y" });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("slides")));
});

test("edit sem target falha", () => {
  const ruim = structuredClone(valido);
  delete ruim.slides[0].edits[0].target;
  const r = validateEdits(ruim);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("target")));
});
