#!/usr/bin/env node
// scripts/index-banco.js
// Gestão do índice do banco de imagens (.banco-index.json) na própria pasta do banco.
//
// Subcomandos:
//   scan    <dir>                              → lista imagens novas (não indexadas)
//   caption <dir> <file> "<legenda>" [tag...]  → grava legenda+tags da imagem
//   mark    <dir> <file> <post> [--rest N]     → marca uso + descanso (default 30 dias)

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { scanNew, upsertCaption, markUsed } from "./editor/banco.js";

async function loadIndex(dir) {
  const p = join(dir, ".banco-index.json");
  if (existsSync(p)) return JSON.parse(await readFile(p, "utf8"));
  return { images: [] };
}
async function saveIndex(dir, index) {
  await writeFile(join(dir, ".banco-index.json"), JSON.stringify(index, null, 2), "utf8");
}

const [cmd, dir, ...rest] = process.argv.slice(2);

if (!cmd || !dir) {
  console.error("Uso: index-banco.js <scan|caption|mark> <dir> [...]");
  process.exit(1);
}

const index = await loadIndex(dir);

if (cmd === "scan") {
  const files = await readdir(dir);
  const novos = scanNew(files, index);
  console.log(novos.join("\n"));
} else if (cmd === "caption") {
  const [file, caption, ...tags] = rest;
  if (!file || !caption) { console.error("Uso: caption <dir> <file> \"<legenda>\" [tag...]"); process.exit(1); }
  upsertCaption(index, file, caption, tags);
  await saveIndex(dir, index);
  console.log(`captioned ${file}`);
} else if (cmd === "mark") {
  const file = rest[0];
  const post = rest[1];
  const restIdx = rest.indexOf("--rest");
  const restDays = restIdx >= 0 ? parseInt(rest[restIdx + 1], 10) : 30;
  if (!file || !post) { console.error("Uso: mark <dir> <file> <post> [--rest N]"); process.exit(1); }
  const today = new Date().toISOString().slice(0, 10);
  const r = markUsed(index, file, post, today, restDays);
  if (!r) { console.error(`imagem não indexada: ${file}`); process.exit(1); }
  await saveIndex(dir, index);
  console.log(`marked ${file} (descansa até ${r.rest_until})`);
} else {
  console.error(`subcomando desconhecido: ${cmd}`);
  process.exit(1);
}
