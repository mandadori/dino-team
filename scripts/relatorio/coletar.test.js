import { test } from "node:test";
import assert from "node:assert/strict";
import { groupCommits, contarSaturacao, parseExecucoes, sliceStaleness } from "./coletar.js";

test("groupCommits classifica por tipo conventional-commit", () => {
  const raw = [
    "abc123\tfeat(biblioteca): nova ficha",
    "def456\tfix(editor): freeze bug",
    "ghi789\tdocs(spec): plano",
    "jkl000\tpost carrossel sem prefixo",
  ].join("\n");
  const g = groupCommits(raw);
  assert.equal(g.length, 4);
  assert.equal(g[0].tipo, "feat");
  assert.equal(g[0].escopo, "biblioteca");
  assert.equal(g[0].assunto, "nova ficha");
  assert.equal(g[1].tipo, "fix");
  assert.equal(g[2].tipo, "docs");
  assert.equal(g[3].tipo, "outro");
  assert.equal(g[3].escopo, null);
});

test("groupCommits trata entrada vazia (cold start)", () => {
  assert.deepEqual(groupCommits(""), []);
  assert.deepEqual(groupCommits("\n  \n"), []);
});

test("contarSaturacao conta por verdade e por ângulo na janela", () => {
  const md = `| slug | data | canal | ângulo | verdade | pilar | descanso |
|---|---|---|---|---|---|---|
| post-a | 2026-06-02 | instagram | macro-certo | consistencia | nutricao | 21d |
| post-b | 2026-06-04 | blog | macro-certo | consistencia | nutricao | 21d |
| post-c | 2026-05-01 | instagram | zero-absoluto | identidade | mentalidade | 21d |
`;
  const s = contarSaturacao(md, { inicio: "2026-06-01", fim: "2026-06-30", hoje: "2026-06-09" });
  assert.equal(s.porVerdade.consistencia, 2);
  assert.equal(s.porVerdade.identidade, undefined); // fora da janela
  assert.equal(s.porAngulo["macro-certo"], 2);
  // post-b 2026-06-04 + 21d = 2026-06-25 > hoje → em descanso
  assert.ok(s.emDescanso.some((d) => d.angulo === "macro-certo"));
});

test("contarSaturacao com tabela vazia retorna contagens vazias", () => {
  const md = `| slug | data | canal | ângulo | verdade | pilar | descanso |
|---|---|---|---|---|---|---|
`;
  const s = contarSaturacao(md, { inicio: "2026-06-01", fim: "2026-06-30", hoje: "2026-06-09" });
  assert.deepEqual(s.porVerdade, {});
  assert.deepEqual(s.emDescanso, []);
});

test("parseExecucoes agrega ok/falha por skill na janela", () => {
  const jsonl = [
    JSON.stringify({ ts: "2026-06-02T10:00:00.000Z", skill: "pesquisar-mercado", modo: "auto", resultado: "ok" }),
    JSON.stringify({ ts: "2026-06-03T10:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "ok" }),
    JSON.stringify({ ts: "2026-06-03T11:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "falha" }),
    JSON.stringify({ ts: "2026-05-20T10:00:00.000Z", skill: "novo-post", modo: "auto", resultado: "ok" }), // fora
  ].join("\n");
  const e = parseExecucoes(jsonl, { inicio: "2026-06-01", fim: "2026-06-30" });
  assert.equal(e.porSkill["novo-post"].ok, 1);
  assert.equal(e.porSkill["novo-post"].falha, 1);
  assert.equal(e.porSkill["pesquisar-mercado"].ok, 1);
  assert.equal(e.totalFalhas, 1);
});

test("parseExecucoes ignora linhas malformadas e vazio", () => {
  const e = parseExecucoes("não é json\n\n", { inicio: "2026-06-01", fim: "2026-06-30" });
  assert.deepEqual(e.porSkill, {});
  assert.equal(e.totalFalhas, 0);
});

test("sliceStaleness calcula dias desde ultima_atualizacao", () => {
  const r = sliceStaleness([
    { slice: "mercado", ultima: "2026-06-01" },
    { slice: "ramon", ultima: "2026-04-01" },
  ], "2026-06-09");
  const mercado = r.find((x) => x.slice === "mercado");
  const ramon = r.find((x) => x.slice === "ramon");
  assert.equal(mercado.diasStale, 8);
  assert.equal(ramon.diasStale, 69);
});
