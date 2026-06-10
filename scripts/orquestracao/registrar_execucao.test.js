import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { registrarExecucao, parseArgs } from "./registrar_execucao.js";

function tmpLedger() {
  return join(mkdtempSync(join(tmpdir(), "exec-")), "execucoes.jsonl");
}

test("registrarExecucao cria o arquivo se ausente e anexa uma linha JSON válida", () => {
  const path = tmpLedger();
  assert.equal(existsSync(path), false);
  const obj = registrarExecucao({
    skill: "pesquisar-mercado", modo: "auto", resultado: "ok",
    ts: "2026-06-09T12:00:00.000Z", path,
  });
  const linhas = readFileSync(path, "utf8").trim().split("\n");
  assert.equal(linhas.length, 1);
  const parsed = JSON.parse(linhas[0]);
  assert.equal(parsed.skill, "pesquisar-mercado");
  assert.equal(parsed.modo, "auto");
  assert.equal(parsed.resultado, "ok");
  assert.equal(parsed.slug, null);
  assert.equal(parsed.nota, null);
  assert.equal(parsed.ts, "2026-06-09T12:00:00.000Z");
  assert.equal(obj.skill, "pesquisar-mercado");
});

test("registrarExecucao é append-only (não reescreve linhas)", () => {
  const path = tmpLedger();
  registrarExecucao({ skill: "a", modo: "auto", resultado: "ok", ts: "2026-06-09T12:00:00.000Z", path });
  registrarExecucao({ skill: "b", modo: "manual", resultado: "falha", nota: "timeout", ts: "2026-06-09T13:00:00.000Z", path });
  const linhas = readFileSync(path, "utf8").trim().split("\n");
  assert.equal(linhas.length, 2);
  assert.equal(JSON.parse(linhas[1]).nota, "timeout");
});

test("registrarExecucao rejeita resultado inválido", () => {
  const path = tmpLedger();
  assert.throws(() => registrarExecucao({ skill: "a", modo: "auto", resultado: "talvez", path }), /resultado/);
});

test("parseArgs extrai flags --skill --modo --resultado --slug --nota", () => {
  const a = parseArgs(["--skill", "novo-post", "--modo", "auto", "--resultado", "ok", "--slug", "x-y", "--nota", "ok feito"]);
  assert.equal(a.skill, "novo-post");
  assert.equal(a.slug, "x-y");
  assert.equal(a.nota, "ok feito");
});
