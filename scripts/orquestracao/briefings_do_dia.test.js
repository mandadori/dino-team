import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { briefingsDoDia, parseTarefas } from "./briefings_do_dia.js";

test("parseTarefas extrai os campos de cada tarefa", () => {
  const yaml = `campanha:
  slug: x
tarefas:
  - id: post-a
    skill: /novo-post
    estado: pendente
    output: output/posts/1-a.md
    data_prevista: 2026-06-09
  - id: post-b
    skill: /novo-post
    estado: concluida
    output: output/posts/2-b.md
    data_prevista: 2026-06-10
aprovacoes_pendentes: []
`;
  const ts = parseTarefas(yaml);
  assert.equal(ts.length, 2);
  assert.equal(ts[0].id, "post-a");
  assert.equal(ts[0].data_prevista, "2026-06-09");
  assert.equal(ts[1].estado, "concluida");
});

test("briefingsDoDia retorna so pendentes /novo-post vencendo ate hoje", () => {
  const dir = mkdtempSync(join(tmpdir(), "camp-"));
  const c = join(dir, "2026-W24-pauta-semanal");
  mkdirSync(c, { recursive: true });
  writeFileSync(
    join(c, "status.yaml"),
    `tarefas:
  - id: hoje
    skill: /novo-post
    estado: pendente
    output: output/posts/1-hoje.md
    data_prevista: 2026-06-09
  - id: futuro
    skill: /novo-post
    estado: pendente
    output: output/posts/2-futuro.md
    data_prevista: 2026-06-20
  - id: feito
    skill: /novo-post
    estado: concluida
    output: output/posts/3-feito.md
    data_prevista: 2026-06-09
`
  );
  const res = briefingsDoDia({ campanhasDir: dir, today: "2026-06-09" });
  rmSync(dir, { recursive: true, force: true });
  assert.equal(res.length, 1);
  assert.equal(res[0].tarefa_id, "hoje");
  assert.equal(res[0].output, "output/posts/1-hoje.md");
});
