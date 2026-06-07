#!/usr/bin/env node
/**
 * avaliar_politica.js — valida se um artefato é publicável segundo
 * orquestracao/politicas/publicacao.yaml, sem dependências externas.
 *
 * Uso:
 *   node scripts/orquestracao/avaliar_politica.js \
 *     --canal <canal> \
 *     --pilar <pilar> \
 *     --texto "<copy>" \
 *     [--orcamento <numero>]
 *
 * Saída: JSON { modo, regra, motivo } — exit 0 em sucesso, exit 1 em erro.
 *
 * Parser YAML: mínimo linha-a-linha para o formato conhecido de publicacao.yaml.
 * Não usa js-yaml (não está nas deps do projeto) — implementação local suficiente
 * para o schema estático e bem-delimitado dessa política.
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// 1. Parse de args CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
}

const canal = getArg("--canal");
const pilar = getArg("--pilar");
const texto = getArg("--texto");
const orcamentoRaw = getArg("--orcamento");
const orcamento = orcamentoRaw !== null ? parseFloat(orcamentoRaw) : null;

if (!canal || !pilar) {
  process.stderr.write("Erro: --canal e --pilar são obrigatórios\n");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Carregar publicacao.yaml com parser mínimo
// ---------------------------------------------------------------------------

const politicaPath = resolve(
  __dirname,
  "../../orquestracao/politicas/publicacao.yaml"
);

if (!existsSync(politicaPath)) {
  process.stderr.write(`Erro: arquivo não encontrado: ${politicaPath}\n`);
  process.exit(1);
}

const yamlText = readFileSync(politicaPath, "utf8");

/**
 * Parser mínimo — lê o YAML de publicacao.yaml linha por linha.
 * Extrai: defaults.modo, e para cada regra: id, condicao, modo, motivo.
 */
function parsePublicacaoYaml(text) {
  const lines = text.split("\n");

  let defaultModo = "aprovacao_humana";
  const regras = [];
  let currentRegra = null;
  let inRegras = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const stripped = line.trim();

    // Detectar seção defaults
    if (stripped.startsWith("modo:") && line.match(/^\s{4}modo:/)) {
      // defaults.modo — indentação de 4 espaços (dentro de defaults)
      defaultModo = stripped.replace("modo:", "").trim().replace(/['"]/g, "");
    }

    // Detectar início de lista de regras
    if (stripped === "regras:") {
      inRegras = true;
      continue;
    }

    // Fim de regras: outra chave de nível 2 (2 espaços, sem "-")
    if (inRegras && line.match(/^  [a-z]/) && !stripped.startsWith("-")) {
      inRegras = false;
    }

    if (!inRegras) continue;

    // Novo item de regra
    if (stripped.startsWith("- id:")) {
      if (currentRegra) regras.push(currentRegra);
      currentRegra = {
        id: stripped.replace("- id:", "").trim().replace(/['"]/g, ""),
        condicao: null,
        modo: null,
        motivo: null,
      };
      continue;
    }

    if (currentRegra) {
      if (stripped.startsWith("condicao:")) {
        currentRegra.condicao = stripped
          .replace("condicao:", "")
          .trim()
          .replace(/^["']|["']$/g, "");
      } else if (stripped.startsWith("modo:")) {
        currentRegra.modo = stripped
          .replace("modo:", "")
          .trim()
          .replace(/['"]/g, "");
      } else if (stripped.startsWith("motivo:")) {
        currentRegra.motivo = stripped
          .replace("motivo:", "")
          .trim()
          .replace(/['"]/g, "");
      }
    }
  }

  if (currentRegra) regras.push(currentRegra);

  return { defaultModo, regras };
}

const politica = parsePublicacaoYaml(yamlText);

// ---------------------------------------------------------------------------
// 3. Avaliador de condições
// ---------------------------------------------------------------------------

/**
 * Avalia a string de condição de uma regra.
 * Suporta:
 *   - artefato.canal == 'X'
 *   - briefing.pilar in ['a', 'b']
 *   - artefato.contem_termo('t')  — varre --texto
 *   - briefing.orcamento_brl > N
 *   - AND / OR (avaliação esquerda-para-direita, sem precedência de parênteses)
 */
function avaliarCondicao(condicao, ctx) {
  // Divide em partes por AND/OR mantendo os operadores
  const tokens = condicao.split(/\b(AND|OR)\b/);

  let resultado = null;
  let operadorPendente = null;

  for (const token of tokens) {
    const t = token.trim();

    if (t === "AND" || t === "OR") {
      operadorPendente = t;
      continue;
    }

    const valor = avaliarPredicado(t, ctx);

    if (resultado === null) {
      resultado = valor;
    } else if (operadorPendente === "AND") {
      resultado = resultado && valor;
    } else if (operadorPendente === "OR") {
      resultado = resultado || valor;
    }

    operadorPendente = null;
  }

  return resultado ?? false;
}

function avaliarPredicado(pred, ctx) {
  const p = pred.trim();

  // artefato.canal == 'X'
  const canalMatch = p.match(/^artefato\.canal\s*==\s*['"]([^'"]+)['"]/);
  if (canalMatch) {
    return ctx.canal === canalMatch[1];
  }

  // briefing.pilar in ['a', 'b', ...]
  const pilarInMatch = p.match(/^briefing\.pilar\s+in\s+\[([^\]]+)\]/);
  if (pilarInMatch) {
    const lista = pilarInMatch[1]
      .split(",")
      .map((s) => s.trim().replace(/['"]/g, ""));
    return lista.includes(ctx.pilar);
  }

  // artefato.contem_termo('t')
  const termoMatch = p.match(/^artefato\.contem_termo\(['"]([^'"]+)['"]\)/);
  if (termoMatch) {
    const termo = termoMatch[1].toLowerCase();
    return (ctx.texto ?? "").toLowerCase().includes(termo);
  }

  // briefing.orcamento_brl > N
  const orcamentoMatch = p.match(
    /^briefing\.orcamento_brl\s*(>|<|>=|<=|==)\s*([0-9.]+)/
  );
  if (orcamentoMatch) {
    const op = orcamentoMatch[1];
    const val = parseFloat(orcamentoMatch[2]);
    const orc = ctx.orcamento ?? 0;
    if (op === ">") return orc > val;
    if (op === "<") return orc < val;
    if (op === ">=") return orc >= val;
    if (op === "<=") return orc <= val;
    if (op === "==") return orc === val;
  }

  // Predicado não reconhecido — conservador: retorna false (não barra indevidamente)
  process.stderr.write(`Aviso: predicado não reconhecido: "${p}"\n`);
  return false;
}

// ---------------------------------------------------------------------------
// 4. Avaliar regras — coleta todas que casam; aprovacao_humana tem precedência
//    ("Termos sensíveis SEMPRE exigem aprovação humana" — defesa em profundidade,
//    spec publicacao.yaml). Isso garante que uma regra permissiva (ex: educacional)
//    não supere uma restritiva (ex: termos-sensiveis) só por vir antes no arquivo.
// ---------------------------------------------------------------------------

const ctx = { canal, pilar, texto: texto ?? "", orcamento };

const correspondentes = [];

for (const regra of politica.regras) {
  if (!regra.condicao) continue;

  try {
    if (avaliarCondicao(regra.condicao, ctx)) {
      correspondentes.push(regra);
    }
  } catch (e) {
    process.stderr.write(
      `Aviso: erro ao avaliar regra "${regra.id}": ${e.message}\n`
    );
  }
}

let resolucao = null;

if (correspondentes.length === 0) {
  resolucao = {
    modo: politica.defaultModo,
    regra: "default",
    motivo: "nenhuma regra específica casou; aplicando default conservador",
  };
} else {
  // Se qualquer regra que casou exige aprovacao_humana, ela prevalece.
  const restritiva = correspondentes.find((r) => r.modo === "aprovacao_humana");
  const vencedora = restritiva ?? correspondentes[0];
  resolucao = {
    modo: vencedora.modo ?? politica.defaultModo,
    regra: vencedora.id,
    motivo: vencedora.motivo ?? vencedora.modo,
  };
}

// ---------------------------------------------------------------------------
// 5. Saída
// ---------------------------------------------------------------------------

process.stdout.write(JSON.stringify(resolucao, null, 2) + "\n");
process.exit(0);
