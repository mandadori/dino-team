#!/usr/bin/env node
/**
 * append_registro_angulos.js — append-only write-back ao registro de ângulos.
 *
 * Funde os antigos write-backs de `angulos-queimados.md` e `livro-razao.md`:
 * uma única linha por peça finalizada registra o que o conteúdo DISSE
 * (ângulo + verdade + pilar) num só ledger. A performance (o que GEROU) vive
 * separada em memory/performance/metricas.md, unida por `slug`.
 *
 * Uso:
 *   node scripts/memory/append_registro_angulos.js \
 *     --slug <slug-do-post> \
 *     --data <YYYY-MM-DD> \
 *     --canal <instagram|blog|email|comunidade> \
 *     --angulo <slug-do-angulo> \
 *     --verdade <slug|neutro> \
 *     [--pilar <slug|neutro>] \
 *     [--descanso <ex: 21d|6sem>]
 *
 * Override de caminho (para testes):
 *   REGISTRO_ANGULOS_PATH=/tmp/ra-test.md node scripts/memory/append_registro_angulos.js ...
 *
 * Contrato:
 * - Append-only: nunca reescreve linhas existentes.
 * - Escapa `|` no texto das células.
 * - `--pilar` default `neutro`; `--descanso` default `21d`.
 * - Atualiza `ultima_atualizacao` no frontmatter.
 * - Erro REGISTRO_ANGULOS_AUSENTE (exit 1) se arquivo ou tabela-cabeçalho não existir.
 * - Erro com uso se faltar arg obrigatório.
 * - Saída: imprime a linha anexada (1 linha), exit 0.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Helpers ──────────────────────────────────────────────────────────────────

function usage() {
  console.error(`Uso: node scripts/memory/append_registro_angulos.js \\
  --slug <slug-do-post> \\
  --data <YYYY-MM-DD> \\
  --canal <instagram|blog|email|comunidade> \\
  --angulo <slug-do-angulo> \\
  --verdade <slug|neutro> \\
  [--pilar <slug|neutro>] \\
  [--descanso <ex: 21d|6sem>]`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith('--')) {
        console.error(`Erro: argumento --${key} requer um valor.`);
        usage();
      }
      args[key] = val;
      i++;
    }
  }
  return args;
}

/** Escapa pipe (|) dentro do texto para não quebrar a tabela Markdown. */
function escapeCell(text) {
  return String(text).replace(/\|/g, '\\|');
}

/** Atualiza ultima_atualizacao no bloco frontmatter YAML (entre os dois ---). */
function updateFrontmatter(content, today) {
  const fmMatch = content.match(/^(---\n)([\s\S]*?)(---\n)/);
  if (!fmMatch) return content;

  const [full, open, body, close] = fmMatch;
  const updatedBody = body.replace(
    /^(ultima_atualizacao:\s*).*$/m,
    `$1${today}`
  );
  return content.replace(full, open + updatedBody + close);
}

// ── Main ─────────────────────────────────────────────────────────────────────

const REQUIRED = ['slug', 'data', 'canal', 'angulo', 'verdade'];
const HEADER_PATTERN = /\|\s*slug\s*\|\s*data\s*\|\s*canal\s*\|\s*ângulo\s*\|\s*verdade\s*\|\s*pilar\s*\|\s*descanso\s*\|/i;

const args = parseArgs(process.argv.slice(2));

// Validar args obrigatórios
for (const key of REQUIRED) {
  if (!args[key]) {
    console.error(`Erro: argumento --${key} é obrigatório.`);
    usage();
  }
}

// Defaults
const pilar = args.pilar || 'neutro';
const descanso = args.descanso || '21d';

// Resolver caminho do arquivo
const registroPath = process.env.REGISTRO_ANGULOS_PATH
  ? resolve(process.env.REGISTRO_ANGULOS_PATH)
  : resolve('memory/performance/registro-angulos.md');

// Verificar existência do arquivo
if (!existsSync(registroPath)) {
  console.error(`REGISTRO_ANGULOS_AUSENTE — arquivo não encontrado: ${registroPath}`);
  process.exit(1);
}

const original = readFileSync(registroPath, 'utf8');

// Verificar cabeçalho da tabela
if (!HEADER_PATTERN.test(original)) {
  console.error(`REGISTRO_ANGULOS_AUSENTE — cabeçalho da tabela não encontrado em: ${registroPath}`);
  process.exit(1);
}

// Construir nova linha
const newLine = `| ${escapeCell(args.slug)} | ${args.data} | ${escapeCell(args.canal)} | ${escapeCell(args.angulo)} | ${escapeCell(args.verdade)} | ${escapeCell(pilar)} | ${escapeCell(descanso)} |`;

// Localiza o separador da tabela que segue o cabeçalho e insere após a última linha.
const endsWithNewline = original.endsWith('\n');
const lines = original.split('\n');

let sepIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|[-| ]+\|$/.test(lines[i].trim())) {
    if (i > 0 && HEADER_PATTERN.test(lines[i - 1])) {
      sepIdx = i;
      break;
    }
  }
}

if (sepIdx === -1) {
  console.error(`REGISTRO_ANGULOS_AUSENTE — separador da tabela não encontrado em: ${registroPath}`);
  process.exit(1);
}

// Localiza o fim da tabela: última linha não-vazia que começa com |
let lastTableLineIdx = sepIdx;
for (let i = sepIdx + 1; i < lines.length; i++) {
  if (lines[i].trim().startsWith('|')) {
    lastTableLineIdx = i;
  } else if (lines[i].trim() !== '') {
    break;
  }
}

const updatedLines = [
  ...lines.slice(0, lastTableLineIdx + 1),
  newLine,
  ...lines.slice(lastTableLineIdx + 1),
];

let updated = updatedLines.join('\n');

if (endsWithNewline && !updated.endsWith('\n')) {
  updated += '\n';
}

updated = updateFrontmatter(updated, args.data);

writeFileSync(registroPath, updated, 'utf8');

// Saída: apenas a linha anexada
console.log(newLine);
