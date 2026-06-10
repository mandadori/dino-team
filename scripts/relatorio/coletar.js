#!/usr/bin/env node
/**
 * coletar.js — coletor determinístico de fatos do período para o relatório.
 *
 * Parsers puros (testáveis com strings) + orquestração (git + arquivos) + CLI.
 * NÃO usa LLM. Os números do relatório saem daqui → sem alucinação.
 *
 * Uso:
 *   node scripts/relatorio/coletar.js --periodo <YYYY-MM | YYYY-Www>
 * Saída: JSON de fatos em stdout.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";

// ── Parsers puros ────────────────────────────────────────────────────────────

const TIPOS = new Set(["feat", "fix", "docs", "chore", "refactor", "test", "content"]);

export function groupCommits(raw) {
  if (!raw || !raw.trim()) return [];
  return raw.split("\n").map((l) => l.trim()).filter(Boolean).map((linha) => {
    const tab = linha.indexOf("\t");
    const hash = tab >= 0 ? linha.slice(0, tab) : "";
    const assuntoFull = tab >= 0 ? linha.slice(tab + 1) : linha;
    const m = assuntoFull.match(/^(\w+)(?:\(([^)]+)\))?:\s*(.*)$/);
    if (m && TIPOS.has(m[1])) {
      return { hash, tipo: m[1], escopo: m[2] ?? null, assunto: m[3] };
    }
    return { hash, tipo: "outro", escopo: null, assunto: assuntoFull };
  });
}

function descansoParaDias(d) {
  if (!d) return 0;
  const m = String(d).trim().match(/^(\d+)\s*(d|sem|mes|m)?$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const u = (m[2] || "d").toLowerCase();
  if (u === "sem") return n * 7;
  if (u === "mes" || u === "m") return n * 30;
  return n;
}

function parseTabela(md) {
  // Retorna linhas da tabela markdown como arrays de células (trim), pulando cabeçalho e separador.
  const linhas = md.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("|"));
  const corpo = linhas.filter((l) => !/^\|[\s|:-]+\|$/.test(l)); // remove separador ---
  // primeira linha restante é o cabeçalho
  return corpo.slice(1).map((l) => l.split("|").slice(1, -1).map((c) => c.trim()));
}

export function contarSaturacao(md, { inicio, fim, hoje }) {
  const porVerdade = {};
  const porAngulo = {};
  const emDescanso = [];
  for (const cels of parseTabela(md)) {
    const [slug, data, , angulo, verdade, , descanso] = cels;
    if (!data) continue;
    if (data >= inicio && data <= fim) {
      if (verdade) porVerdade[verdade] = (porVerdade[verdade] || 0) + 1;
      if (angulo) porAngulo[angulo] = (porAngulo[angulo] || 0) + 1;
    }
    const fimDescanso = new Date(new Date(data).getTime() + descansoParaDias(descanso) * 86400000)
      .toISOString().slice(0, 10);
    if (fimDescanso > hoje) emDescanso.push({ slug, angulo, ate: fimDescanso });
  }
  return { porVerdade, porAngulo, emDescanso };
}

export function parseExecucoes(jsonl, { inicio, fim }) {
  const porSkill = {};
  let totalFalhas = 0;
  for (const linha of (jsonl || "").split("\n")) {
    const t = linha.trim();
    if (!t) continue;
    let o;
    try { o = JSON.parse(t); } catch { continue; }
    const dia = (o.ts || "").slice(0, 10);
    if (!dia || dia < inicio || dia > fim) continue;
    porSkill[o.skill] = porSkill[o.skill] || { ok: 0, falha: 0 };
    if (o.resultado === "falha") { porSkill[o.skill].falha++; totalFalhas++; }
    else porSkill[o.skill].ok++;
  }
  return { porSkill, totalFalhas };
}

export function sliceStaleness(entries, hoje) {
  const base = new Date(hoje).getTime();
  return entries.map(({ slice, ultima }) => ({
    slice,
    ultima: ultima || null,
    diasStale: ultima ? Math.round((base - new Date(ultima).getTime()) / 86400000) : null,
  }));
}
