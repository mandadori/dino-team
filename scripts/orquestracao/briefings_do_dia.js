#!/usr/bin/env node
/**
 * briefings_do_dia.js — resolve quais briefings de pauta vencem hoje.
 * Sem deps externas (parser YAML mínimo, como avaliar_politica.js).
 *
 * Uso: node scripts/orquestracao/briefings_do_dia.js
 * Env: CAMPANHAS_DIR (default "campanhas"), TODAY=YYYY-MM-DD (default hoje).
 * Saída (stdout): JSON array [{ campanha, tarefa_id, output, data_prevista }]
 *   — apenas tarefas estado=pendente, skill=/novo-post, data_prevista <= TODAY.
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve, join } from "path";

/** Parser mínimo da lista `tarefas:` de um status.yaml. */
export function parseTarefas(yamlText) {
  const lines = yamlText.split(/\r?\n/);
  const tarefas = [];
  let cur = null;
  let inTarefas = false;
  for (const line of lines) {
    if (/^tarefas:\s*$/.test(line)) { inTarefas = true; continue; }
    // chave top-level (sem indentação) encerra o bloco tarefas
    if (inTarefas && /^\S/.test(line) && !/^\s*-/.test(line)) { inTarefas = false; }
    if (!inTarefas) continue;
    const item = line.match(/^\s*-\s+id:\s*(.+?)\s*$/);
    if (item) {
      if (cur) tarefas.push(cur);
      cur = { id: item[1].trim() };
      continue;
    }
    const kv = line.match(/^\s+([a-z_]+):\s*(.*?)\s*$/);
    if (kv && cur) cur[kv[1]] = kv[2].trim();
  }
  if (cur) tarefas.push(cur);
  return tarefas;
}

/** Retorna os briefings vencendo até `today` (inclui atrasados pendentes). */
export function briefingsDoDia({ campanhasDir, today }) {
  const out = [];
  if (!existsSync(campanhasDir)) return out;
  for (const entry of readdirSync(campanhasDir)) {
    const statusPath = join(campanhasDir, entry, "status.yaml");
    if (!existsSync(statusPath)) continue;
    for (const t of parseTarefas(readFileSync(statusPath, "utf8"))) {
      if (
        t.estado === "pendente" &&
        t.skill === "/novo-post" &&
        t.data_prevista &&
        t.data_prevista <= today
      ) {
        out.push({
          campanha: entry,
          tarefa_id: t.id,
          output: t.output ?? null,
          data_prevista: t.data_prevista,
        });
      }
    }
  }
  out.sort((a, b) =>
    (a.data_prevista + a.campanha).localeCompare(b.data_prevista + b.campanha)
  );
  return out;
}

// CLI
const _thisFile = new URL(import.meta.url).pathname;
if (process.argv[1] && (process.argv[1] === _thisFile || decodeURIComponent(process.argv[1]) === decodeURIComponent(_thisFile))) {
  const campanhasDir = resolve(process.env.CAMPANHAS_DIR || "campanhas");
  const today = process.env.TODAY || new Date().toISOString().slice(0, 10);
  console.log(JSON.stringify(briefingsDoDia({ campanhasDir, today }), null, 2));
}
