#!/usr/bin/env node
// scripts/studio.js
// Estúdio local de edição: serve o preview, expõe /contract, /save, /export.
//
// Uso:
//   node scripts/studio.js <pasta-do-post> --estilo <caminho-do-estilo.md> [--port 4321]
//
// Ex.:
//   node scripts/studio.js export/conteudos/carrossel/2026-06-02-do-zero-ao-topo \
//     --estilo templates/social-media/carrossel/estilos/editorial/estilo.md

import http from "node:http";
import { resolve, basename } from "node:path";
import { servePreview, serveContract, saveEdits, runExport } from "./studio/handlers.js";

function parseArgs(argv) {
  const args = argv.slice(2);
  let postDir = null, estiloPath = null, port = 4321;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--estilo") { estiloPath = args[++i]; }
    else if (a === "--port") { port = parseInt(args[++i], 10) || port; }
    else if (!postDir) { postDir = a; }
  }
  return { postDir, estiloPath, port };
}

function readBody(req) {
  return new Promise((res) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => res(data));
  });
}

function send(res, r) {
  res.writeHead(r.status, { "Content-Type": r.type || "text/plain" });
  res.end(r.body || "");
}

const { postDir, estiloPath, port } = parseArgs(process.argv);
if (!postDir) {
  console.error("Uso: node scripts/studio.js <pasta-do-post> --estilo <estilo.md> [--port N]");
  process.exit(1);
}
const absPost = resolve(postDir);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, await servePreview({ postDir: absPost }));
    }
    if (req.method === "GET" && url.pathname === "/contract") {
      return send(res, await serveContract({ estiloPath, postSlug: basename(absPost) }));
    }
    if (req.method === "POST" && url.pathname === "/save") {
      const raw = await readBody(req);
      const { html, edits } = JSON.parse(raw || "{}");
      return send(res, await saveEdits({ postDir: absPost, html, edits }));
    }
    if (req.method === "POST" && url.pathname === "/export") {
      return send(res, await runExport({ postDir: absPost }));
    }
    send(res, { status: 404, type: "text/plain", body: "not found" });
  } catch (err) {
    send(res, { status: 500, type: "text/plain", body: String(err && err.message || err) });
  }
});

server.listen(port, () => {
  console.log(`Dino Studio em http://localhost:${port}`);
  console.log(`  post:   ${absPost}`);
  console.log(`  estilo: ${estiloPath || "(nenhum — painel em modo livre)"}`);
});
