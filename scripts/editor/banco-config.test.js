import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBancoConfig, restDaysFor } from "./banco-config.js";

const YAML = `# comentário
drive:
  pasta_raiz_id: "1AbC"
descanso_por_canal:
  instagram: 60
  email: 30
  ads: 0
`;

test("parseBancoConfig: lê pasta_raiz_id e descanso por canal", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(c.drive.pasta_raiz_id, "1AbC");
  assert.equal(c.descanso_por_canal.instagram, 60);
  assert.equal(c.descanso_por_canal.email, 30);
  assert.equal(c.descanso_por_canal.ads, 0);
});

test("parseBancoConfig: pasta_raiz_id vazio vira string vazia", () => {
  const c = parseBancoConfig(`drive:\n  pasta_raiz_id: ""\n`);
  assert.equal(c.drive.pasta_raiz_id, "");
});

test("restDaysFor: devolve o valor do canal", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(restDaysFor(c, "instagram"), 60);
  assert.equal(restDaysFor(c, "ads"), 0);
});

test("restDaysFor: canal ausente cai no default 30", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(restDaysFor(c, "comunidade"), 30);
});
