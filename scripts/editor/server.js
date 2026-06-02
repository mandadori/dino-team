#!/usr/bin/env node
// scripts/editor/server.js
// Dino Editor — servidor local. Serve o editor (index.html + app.js) e expõe o
// backend /slides, /contract, /save, /export, /suggestions (com CORS). O editor
// pode ser aberto pelo próprio server (http://localhost:4321) ou pelo Live Preview
// do VS Code — o app chama o backend por URL absoluta http://localhost:4321.
//
// Uso:
//   node scripts/editor/server.js <pasta-do-post> --estilo <caminho-do-estilo.md> [--port 4321]
//
// Ex.:
//   node scripts/editor/server.js export/conteudos/carrossel/2026-06-02-do-zero-ao-topo \
//     --estilo templates/social-media/carrossel/estilos/editorial/estilo.md

import http from "node:http";
import { resolve, basename, join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { serveSlides, serveContract, saveSlides, runExport, serveSuggestions } from "./handlers.js";

// Diretório do próprio editor (index.html + app.js vivem aqui, ao lado deste server).
const EDITOR_DIR = dirname(fileURLToPath(import.meta.url));

// Serve um arquivo do editor (index.html, app.js).
async function serveEditorFile(name, type) {
  const file = join(EDITOR_DIR, name);
  if (!existsSync(file)) return { status: 404, type: "text/plain", body: `${name} não encontrado` };
  return { status: 200, type, body: await readFile(file, "utf8") };
}

// Tipos servidos pelo fallback estático (assets referenciados pelo preview: logo, etc.)
const STATIC_MIME = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".gif": "image/gif", ".css": "text/css", ".js": "text/javascript",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ico": "image/x-icon",
};

// Serve um arquivo da raiz do repo (process.cwd()) com proteção contra path traversal.
async function serveStatic(pathname) {
  const root = process.cwd();
  const target = normalize(join(root, decodeURIComponent(pathname)));
  if (!target.startsWith(root) || !existsSync(target)) {
    return { status: 404, type: "text/plain", body: "not found" };
  }
  const buf = await readFile(target);
  return { status: 200, type: STATIC_MIME[extname(target).toLowerCase()] || "application/octet-stream", body: buf };
}

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

// CORS liberado: o studio é só backend local; a página pode ser servida por
// outro origin (ex.: Live Preview do VS Code) e ainda chamar /save, /contract, etc.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function send(res, r) {
  res.writeHead(r.status, { "Content-Type": r.type || "text/plain", ...CORS });
  res.end(r.body || "");
}

const { postDir, estiloPath, port } = parseArgs(process.argv);
if (!postDir) {
  console.error("Uso: node scripts/editor/server.js <pasta-do-post> --estilo <estilo.md> [--port N]");
  process.exit(1);
}
const absPost = resolve(postDir);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      return res.end();
    }
    if (req.method === "GET" && url.pathname === "/") {
      return send(res, await serveEditorFile("index.html", "text/html; charset=utf-8"));
    }
    if (req.method === "GET" && url.pathname === "/app.js") {
      return send(res, await serveEditorFile("app.js", "text/javascript; charset=utf-8"));
    }
    if (req.method === "GET" && url.pathname === "/slides") {
      return send(res, await serveSlides({ postDir: absPost }));
    }
    if (req.method === "GET" && url.pathname === "/contract") {
      return send(res, await serveContract({ estiloPath, postSlug: basename(absPost) }));
    }
    if (req.method === "GET" && url.pathname === "/suggestions") {
      return send(res, await serveSuggestions({ postDir: absPost }));
    }
    if (req.method === "POST" && url.pathname === "/save") {
      const raw = await readBody(req);
      const { slides, edits } = JSON.parse(raw || "{}");
      return send(res, await saveSlides({ postDir: absPost, slides, edits }));
    }
    if (req.method === "POST" && url.pathname === "/export") {
      return send(res, await runExport({ postDir: absPost }));
    }
    // Fallback estático: serve assets do repo referenciados pelo preview (logo etc.)
    if (req.method === "GET") {
      return send(res, await serveStatic(url.pathname));
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
