#!/usr/bin/env node
// scripts/editor/scaffold-estilo.js
// Gera um scaffold de PREVIEW descartável a partir de um estilo, para abrir o
// estilo no Dino Editor. O editor edita `design/slide-N.html` (não o slide.html
// único do estilo), então instanciamos cada bloco da `## Estrutura` em um
// slide-N.html standalone (head/CSS do estilo + uma <section> taggeada).
//
// Uso:
//   node scripts/editor/scaffold-estilo.js \
//     --estilo templates/social-media/carrossel/estilos/<slug>/estilo.md \
//     [--out export/conteudos/carrossel/_preview-<slug>] [--repeat 2]
//
// Saída (stdout): JSON { out, formato, slug, slides:[blocos...] }.
// O editor só suporta carrossel (canvas 1080x1350); para outros formatos avisa.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, basename, join, resolve } from "node:path";

function parseArgs(argv) {
  const a = argv.slice(2);
  let estilo = null, out = null, repeat = 2;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--estilo") estilo = a[++i];
    else if (a[i] === "--out") out = a[++i];
    else if (a[i] === "--repeat") repeat = parseInt(a[++i], 10) || 2;
    else if (!estilo) estilo = a[i];
  }
  return { estilo, out, repeat };
}

// Nomes de bloco na ordem da Estrutura, lidos dos cabeçalhos "### bloco: X".
function blocosDoEstilo(md) {
  const out = [];
  const re = /^###\s+bloco:\s*(.+?)\s*$/gm;
  let m;
  while ((m = re.exec(md))) {
    const nome = m[1].trim();
    // [instâncias] do bloco: detecta corpo flexível (N) logo abaixo do header.
    const rest = md.slice(m.index, m.index + 400);
    const inst = (rest.match(/\[instâncias\]:\s*(.+)/) || [, ""])[1];
    const flex = /\bN\b|1\.\.N|din[âa]mico|flex/i.test(inst);
    out.push({ nome, flex });
  }
  return out;
}

// Normaliza p/ casar nome de bloco com data-block (sem acento, minúsculo).
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Extrai <section ...data-block="X">...</section> do slide.html (inclusive os
// que estão dentro de comentários — são os exemplos). Ignora a legenda
// data-block="<capa|...>" (contém "<" ou "|"). Mantém a 1ª ocorrência por bloco.
function sectionsDoSlide(html) {
  const map = new Map();
  const re = /<section\b[^>]*\bdata-block="([^"]+)"[^>]*>[\s\S]*?<\/section>/g;
  let m;
  while ((m = re.exec(html))) {
    const db = m[1];
    if (db.includes("<") || db.includes("|")) continue; // legenda/placeholder
    const key = norm(db);
    if (!map.has(key)) map.set(key, m[0]);
  }
  return map;
}

function main() {
  const { estilo, out, repeat } = parseArgs(process.argv);
  if (!estilo || !existsSync(estilo)) {
    console.error("erro: --estilo <caminho/estilo.md> obrigatório e existente");
    process.exit(1);
  }
  const styleDir = dirname(resolve(estilo));
  const slug = basename(styleDir);
  // .../templates/social-media/<formato>/estilos/<slug>/estilo.md
  const formato = basename(dirname(dirname(styleDir)));
  const mainFile = existsSync(join(styleDir, "slide.html"))
    ? join(styleDir, "slide.html")
    : join(styleDir, "frame.html");
  if (!existsSync(mainFile)) {
    console.error("erro: estilo sem slide.html nem frame.html em " + styleDir);
    process.exit(1);
  }

  const md = readFileSync(estilo, "utf8");
  const slideHtml = readFileSync(mainFile, "utf8");
  const head = slideHtml.slice(0, slideHtml.indexOf("</head>") + 7);
  if (!head || head.indexOf("</head>") === -1) {
    console.error("erro: não achei <head> em " + mainFile);
    process.exit(1);
  }

  const blocos = blocosDoEstilo(md);
  const sections = sectionsDoSlide(slideHtml);
  if (!blocos.length) { console.error("erro: nenhum '### bloco:' em " + estilo); process.exit(1); }

  // Monta a sequência: capa×1 → corpo-flex×repeat → demais×1.
  const seq = [];
  const faltando = [];
  for (const b of blocos) {
    const sec = sections.get(norm(b.nome));
    if (!sec) { faltando.push(b.nome); continue; }
    const n = b.flex ? Math.max(1, repeat) : 1;
    for (let i = 0; i < n; i++) seq.push({ nome: b.nome, html: sec });
  }
  if (faltando.length) {
    console.error("erro: blocos sem <section data-block> correspondente no " +
      basename(mainFile) + ": " + faltando.join(", "));
    process.exit(2);
  }

  const outDir = out || join("export/conteudos", formato, "_preview-" + slug);
  const designDir = join(outDir, "design");
  if (existsSync(designDir)) rmSync(designDir, { recursive: true, force: true });
  mkdirSync(designDir, { recursive: true });

  seq.forEach((s, i) => {
    const doc = head + "\n<body>\n" + s.html + "\n</body>\n</html>\n";
    writeFileSync(join(designDir, "slide-" + (i + 1) + ".html"), doc);
  });

  const warn = formato !== "carrossel"
    ? " (AVISO: editor suporta só carrossel — canvas 1080x1350; '" + formato + "' pode não renderizar certo)"
    : "";
  console.log(JSON.stringify({ out: outDir, formato, slug, repeat, slides: seq.map((s) => s.nome) }) + warn);
}

main();
