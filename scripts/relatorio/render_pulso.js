#!/usr/bin/env node
/**
 * render_pulso.js — renderiza o pulso semanal (markdown) a partir do JSON de fatos.
 * Determinístico, sem agente. Lê fatos de stdin ou de --fatos <arquivo>.
 *
 * Uso: node scripts/relatorio/coletar.js --periodo 2026-W24 | node scripts/relatorio/render_pulso.js
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export function renderPulso(f) {
  const L = [];
  L.push(`# Pulso semanal — ${f.periodo}`);
  L.push("");
  L.push(`> ${f.inicio} a ${f.fim} · gerado em ${f.hoje} · fatos por script (sem opinião)`);
  L.push("");

  // Runs & falhas
  L.push("## Runs & falhas");
  const skills = Object.entries(f.execucoes.porSkill || {});
  if (skills.length === 0) {
    L.push("_sem execuções registradas no período._");
  } else {
    for (const [skill, c] of skills) {
      const falhaTxt = c.falha ? ` — ⚠ ${c.falha} falha${c.falha > 1 ? "s" : ""}` : "";
      L.push(`- \`${skill}\`: ${c.ok} ok${falhaTxt}`);
    }
  }
  L.push("");

  // Ângulos saturando
  L.push("## Ângulos saturando");
  const ang = Object.entries(f.saturacao.porAngulo || {});
  if (ang.length === 0) L.push("_sem atividade de ângulos no período._");
  else ang.sort((a, b) => b[1] - a[1]).forEach(([a, n]) => L.push(`- \`${a}\`: ${n} peça${n > 1 ? "s" : ""}`));
  L.push("");

  // Melhorias da semana
  L.push("## Melhorias da semana");
  if ((f.commits || []).length === 0) L.push("_sem atividade de commits no período._");
  else f.commits.forEach((c) => {
    const escopo = c.escopo ? `(${c.escopo})` : "";
    L.push(`- ${c.tipo}${escopo}: ${c.assunto} \`${c.hash}\``);
  });
  L.push("");

  L.push("---");
  L.push("→ relatório mensal profundo: `relatorios/<YYYY-MM>/relatorio.md`");
  L.push("");
  return L.join("\n");
}

function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--fatos");
  const raw = i >= 0 ? readFileSync(argv[i + 1], "utf8") : readFileSync(0, "utf8");
  process.stdout.write(renderPulso(JSON.parse(raw)));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
