#!/usr/bin/env node
// scripts/index-banco.js
// Gestão do índice do banco de imagens (.banco-index.json) na própria pasta do banco.
//
// Subcomandos:
//   scan      <dir>                                         → lista imagens novas (local fallback)
//   caption   <dir> <drive_file_id> <name> "<legenda>" [tag...]
//   mark      <dir> <drive_file_id> <post> --canal <c> [--rest N]
//   available <dir> <canal>                                 → lista disponíveis no canal

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { scanNew, upsertCaption, markUsed, filterAvailable, normalizeIndex } from "./editor/banco.js";
import { loadBancoConfig, restDaysFor } from "./editor/banco-config.js";

async function loadIndex(dir) {
  const p = join(dir, ".banco-index.json");
  const idx = existsSync(p) ? JSON.parse(await readFile(p, "utf8")) : { images: [] };
  return normalizeIndex(idx);
}
async function saveIndex(dir, index) {
  await writeFile(join(dir, ".banco-index.json"), JSON.stringify(index, null, 2), "utf8");
}

function flag(rest, name) {
  const i = rest.indexOf(name);
  return i >= 0 ? rest[i + 1] : null;
}

const [cmd, dir, ...rest] = process.argv.slice(2);

if (!cmd || !dir) {
  console.error("Uso: index-banco.js <scan|caption|mark|available> <dir> [...]");
  process.exit(1);
}

const index = await loadIndex(dir);
const today = new Date().toISOString().slice(0, 10);

if (cmd === "scan") {
  // Fallback local: lista nomes de arquivo de imagem não indexados (por name).
  const files = (await readdir(dir)).map((name) => ({ drive_file_id: name, name }));
  console.log(scanNew(files, index).map((f) => f.name).join("\n"));
} else if (cmd === "caption") {
  const [id, name, caption, ...tags] = rest;
  if (!id || !name || !caption) {
    console.error('Uso: caption <dir> <drive_file_id> <name> "<legenda>" [tag...]');
    process.exit(1);
  }
  upsertCaption(index, id, name, caption, tags);
  await saveIndex(dir, index);
  console.log(`captioned ${id}`);
} else if (cmd === "mark") {
  const [id, post] = rest;
  const canal = flag(rest, "--canal");
  if (!id || !post || !canal) {
    console.error("Uso: mark <dir> <drive_file_id> <post> --canal <canal> [--rest N]");
    process.exit(1);
  }
  const restFlag = flag(rest, "--rest");
  const restDays = restFlag !== null ? parseInt(restFlag, 10) : restDaysFor(loadBancoConfig(), canal);
  const r = markUsed(index, id, post, today, canal, restDays);
  if (!r) { console.error(`imagem não indexada: ${id}`); process.exit(1); }
  await saveIndex(dir, index);
  const until = r.rest_until[canal] || "sem descanso";
  console.log(`marked ${id} no canal ${canal} (descansa até ${until})`);
} else if (cmd === "available") {
  const canal = rest[0];
  if (!canal) { console.error("Uso: available <dir> <canal>"); process.exit(1); }
  const disp = filterAvailable(index, canal, today);
  console.log(disp.map((e) => `${e.drive_file_id}\t${e.name}`).join("\n"));
} else {
  console.error(`subcomando desconhecido: ${cmd}`);
  process.exit(1);
}
