import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve, join } from "node:path";
import { defaultOutFor } from "./scaffold-estilo.js";

test("defaultOutFor: preview na pasta do estilo (não em export/)", () => {
  const out = defaultOutFor("templates/social-media/carrossel/estilos/editorial/estilo.md");
  assert.equal(out, join(resolve("templates/social-media/carrossel/estilos/editorial"), "preview"));
});
