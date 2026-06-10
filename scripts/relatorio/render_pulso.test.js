import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPulso } from "./render_pulso.js";

const fatos = {
  periodo: "2026-W24", inicio: "2026-06-08", fim: "2026-06-14", hoje: "2026-06-14",
  commits: [
    { hash: "abc", tipo: "feat", escopo: "biblioteca", assunto: "nova ficha" },
    { hash: "def", tipo: "fix", escopo: "editor", assunto: "freeze" },
  ],
  saturacao: { porVerdade: { consistencia: 3 }, porAngulo: { "macro-certo": 2 }, emDescanso: [{ slug: "post-a", angulo: "macro-certo", ate: "2026-06-25" }] },
  execucoes: { porSkill: { "novo-post": { ok: 2, falha: 1 } }, totalFalhas: 1 },
  staleness: [{ slice: "mercado", ultima: "2026-06-01", diasStale: 13 }],
};

test("renderPulso produz markdown com as seções esperadas", () => {
  const md = renderPulso(fatos);
  assert.match(md, /# Pulso semanal — 2026-W24/);
  assert.match(md, /## Runs & falhas/);
  assert.match(md, /novo-post/);
  assert.match(md, /1 falha/);
  assert.match(md, /## Melhorias da semana/);
  assert.match(md, /feat\(biblioteca\)/);
  assert.match(md, /## Ângulos saturando/);
  assert.match(md, /macro-certo/);
});

test("renderPulso degrada cold start sem quebrar", () => {
  const vazio = { periodo: "2026-W24", inicio: "2026-06-08", fim: "2026-06-14", hoje: "2026-06-14",
    commits: [], saturacao: { porVerdade: {}, porAngulo: {}, emDescanso: [] },
    execucoes: { porSkill: {}, totalFalhas: 0 }, staleness: [] };
  const md = renderPulso(vazio);
  assert.match(md, /sem execuções registradas/i);
  assert.match(md, /sem atividade/i);
});
