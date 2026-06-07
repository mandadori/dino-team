#!/usr/bin/env node
/**
 * append_livro_razao.js — append-only write-back ao livro-razão de mensagens.
 *
 * Uso:
 *   node scripts/memory/append_livro_razao.js \
 *     --data <YYYY-MM-DD> \
 *     --mensagem "<ângulo/mensagem>" \
 *     --narrativa <slug|neutro> \
 *     --canal <instagram|email|blog|comunidade> \
 *     --peca <slug>
 *
 * Override de caminho (para testes):
 *   LIVRO_RAZAO_PATH=/tmp/lr-test.md node scripts/memory/append_livro_razao.js ...
 *
 * Contrato:
 * - Append-only: nunca reescreve linhas existentes.
 * - Escapa `|` no texto da mensagem.
 * - Atualiza `ultima_atualizacao` no frontmatter.
 * - Erro LIVRO_RAZAO_AUSENTE (exit 1) se arquivo ou tabela-cabeçalho não existir.
 * - Erro com uso se faltar arg obrigatório.
 * - Saída: imprime a linha anexada (1 linha), exit 0.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// ── Helpers ──────────────────────────────────────────────────────────────────

function usage() {
  console.error(`Uso: node scripts/memory/append_livro_razao.js \\
  --data <YYYY-MM-DD> \\
  --mensagem "<ângulo/mensagem>" \\
  --narrativa <slug|neutro> \\
  --canal <instagram|email|blog|comunidade> \\
  --peca <slug>`);
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
  return text.replace(/\|/g, '\\|');
}

/** Atualiza ultima_atualizacao no bloco frontmatter YAML (entre os dois ---). */
function updateFrontmatter(content, today) {
  // Localiza o bloco frontmatter (primeiros --- ... ---)
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

const REQUIRED = ['data', 'mensagem', 'narrativa', 'canal', 'peca'];
const HEADER_PATTERN = /\|\s*data\s*\|\s*mensagem\/ângulo\s*\|\s*narrativa\s*\|\s*canal\s*\|\s*peça\s*\|/i;

const args = parseArgs(process.argv.slice(2));

// Validar args obrigatórios
for (const key of REQUIRED) {
  if (!args[key]) {
    console.error(`Erro: argumento --${key} é obrigatório.`);
    usage();
  }
}

// Resolver caminho do arquivo
const livroPath = process.env.LIVRO_RAZAO_PATH
  ? resolve(process.env.LIVRO_RAZAO_PATH)
  : resolve('memory/narrativas/livro-razao.md');

// Verificar existência do arquivo
if (!existsSync(livroPath)) {
  console.error(`LIVRO_RAZAO_AUSENTE — arquivo não encontrado: ${livroPath}`);
  process.exit(1);
}

const original = readFileSync(livroPath, 'utf8');

// Verificar cabeçalho da tabela
if (!HEADER_PATTERN.test(original)) {
  console.error(`LIVRO_RAZAO_AUSENTE — cabeçalho da tabela não encontrado em: ${livroPath}`);
  process.exit(1);
}

// Construir nova linha
const newLine = `| ${args.data} | ${escapeCell(args.mensagem)} | ${args.narrativa} | ${args.canal} | ${args.peca} |`;

// Append: localiza o separador da tabela (linha com |---|...) que segue o cabeçalho
// e insere depois da última linha de dados, ou logo após o separador se não houver dados.
// Estratégia: adiciona ao fim do arquivo (após última linha não-vazia da tabela)
// para manter a ordem cronológica.

// Divide em linhas, preserva \n no final se existir
const endsWithNewline = original.endsWith('\n');
const lines = original.split('\n');

// Encontra o índice da linha do separador (| --- | --- | ... |)
let sepIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|[-| ]+\|$/.test(lines[i].trim())) {
    // Confirmar que a linha anterior é o cabeçalho
    if (i > 0 && HEADER_PATTERN.test(lines[i - 1])) {
      sepIdx = i;
      break;
    }
  }
}

if (sepIdx === -1) {
  console.error(`LIVRO_RAZAO_AUSENTE — separador da tabela não encontrado em: ${livroPath}`);
  process.exit(1);
}

// Localiza o fim da tabela: última linha não-vazia que começa com |
let lastTableLineIdx = sepIdx;
for (let i = sepIdx + 1; i < lines.length; i++) {
  if (lines[i].trim().startsWith('|')) {
    lastTableLineIdx = i;
  } else if (lines[i].trim() !== '') {
    // Linha não-vazia que não é tabela — tabela terminou
    break;
  }
}

// Insere newLine logo após a última linha da tabela
const updatedLines = [
  ...lines.slice(0, lastTableLineIdx + 1),
  newLine,
  ...lines.slice(lastTableLineIdx + 1),
];

let updated = updatedLines.join('\n');

// Garantir que termina com \n se o original terminava
if (endsWithNewline && !updated.endsWith('\n')) {
  updated += '\n';
}

// Atualizar frontmatter
updated = updateFrontmatter(updated, args.data);

writeFileSync(livroPath, updated, 'utf8');

// Saída: apenas a linha anexada
console.log(newLine);
