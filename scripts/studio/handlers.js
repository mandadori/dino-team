// scripts/studio/handlers.js
// Handlers puros das rotas do estúdio. Sem http aqui — apenas lógica testável.

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn as nodeSpawn } from "node:child_process";
import { parseEstilo } from "./parse-estilo.js";
import { validateEdits } from "./validate-edits.js";

export async function servePreview({ postDir }) {
  const file = join(postDir, "design", "preview.html");
  if (!existsSync(file)) return { status: 404, type: "text/plain", body: "preview.html não encontrado" };
  const body = await readFile(file, "utf8");
  return { status: 200, type: "text/html; charset=utf-8", body };
}

export async function serveContract({ estiloPath, postSlug }) {
  if (!estiloPath || !existsSync(estiloPath)) return { status: 204, type: "application/json", body: "" };
  const md = await readFile(estiloPath, "utf8");
  const contract = parseEstilo(md);
  const enriched = { ...contract, estilo_path: estiloPath, post: postSlug || null };
  return { status: 200, type: "application/json", body: JSON.stringify(enriched) };
}

export async function saveEdits({ postDir, html, edits }) {
  const result = validateEdits(edits);
  if (!result.valid) {
    return { status: 400, type: "application/json", body: JSON.stringify({ errors: result.errors }) };
  }
  const design = join(postDir, "design");
  await writeFile(join(design, "preview.html"), html, "utf8");
  await writeFile(join(design, "edits.json"), JSON.stringify(edits, null, 2), "utf8");
  return { status: 200, type: "application/json", body: JSON.stringify({ ok: true }) };
}

export function runExport({ postDir, spawn = nodeSpawn }) {
  return new Promise((resolve) => {
    const child = spawn("node", ["scripts/export-png.js", postDir]);
    child.on("close", (code) => {
      resolve(
        code === 0
          ? { status: 200, type: "application/json", body: JSON.stringify({ ok: true }) }
          : { status: 500, type: "application/json", body: JSON.stringify({ error: `export saiu com código ${code}` }) }
      );
    });
  });
}
