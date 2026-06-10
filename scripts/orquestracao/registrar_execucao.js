#!/usr/bin/env node
/**
 * registrar_execucao.js — run-ledger append-only das routines autônomas.
 *
 * Uma linha JSON por execução de skill autônoma. Fonte da seção
 * "tarefas executadas & falhas" do relatório (coletar.js lê este arquivo).
 *
 * Uso:
 *   node scripts/orquestracao/registrar_execucao.js \
 *     --skill <nome> --modo <auto|manual> --resultado <ok|falha> \
 *     [--slug <slug>] [--nota <texto>]
 *
 * Override de caminho (testes): EXECUCOES_PATH=/tmp/x.jsonl
 *
 * Contrato:
 * - Append-only; cria o arquivo se ausente.
 * - `resultado` ∈ {ok, falha}; `modo` ∈ {auto, manual}.
 * - slug/nota default null. ts default new Date().toISOString().
 * - Saída: imprime a linha anexada; exit 0. Uso + exit 1 se arg faltar/inválido.
 */
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const LEDGER_DEFAULT = "orquestracao/execucoes.jsonl";

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k || !k.startsWith("--")) continue;
    out[k.slice(2)] = argv[i + 1];
  }
  return out;
}

export function registrarExecucao({ skill, modo, resultado, slug = null, nota = null, ts, path }) {
  if (!skill) throw new Error("registrar_execucao: --skill obrigatório");
  if (modo !== "auto" && modo !== "manual") throw new Error("registrar_execucao: --modo deve ser auto|manual");
  if (resultado !== "ok" && resultado !== "falha") throw new Error("registrar_execucao: --resultado deve ser ok|falha");
  const destino = resolve(path || process.env.EXECUCOES_PATH || LEDGER_DEFAULT);
  const obj = { ts: ts || new Date().toISOString(), skill, modo, resultado, slug: slug ?? null, nota: nota ?? null };
  if (!existsSync(dirname(destino))) mkdirSync(dirname(destino), { recursive: true });
  appendFileSync(destino, JSON.stringify(obj) + "\n", "utf8");
  return obj;
}

function main() {
  const a = parseArgs(process.argv.slice(2));
  try {
    const obj = registrarExecucao({ skill: a.skill, modo: a.modo, resultado: a.resultado, slug: a.slug ?? null, nota: a.nota ?? null });
    console.log(JSON.stringify(obj));
  } catch (e) {
    console.error(String(e.message || e));
    console.error("\nUso: node scripts/orquestracao/registrar_execucao.js --skill <nome> --modo <auto|manual> --resultado <ok|falha> [--slug <slug>] [--nota <texto>]");
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
