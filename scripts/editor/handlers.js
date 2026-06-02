// scripts/editor/handlers.js
// Handlers puros das rotas do estúdio. Sem http aqui — apenas lógica testável.

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, resolve } from "node:path";

// Strips file:// absolute paths to relative HTTP paths so browsers can load
// assets when the slide HTML is embedded via srcdoc in an HTTP context.
const PROJECT_ROOT = resolve(".");
const FILE_PREFIX_PLAIN = "file://" + PROJECT_ROOT;
const FILE_PREFIX_ENCODED = "file://" + encodeURI(PROJECT_ROOT);
function rewriteFilePaths(html) {
  return html.replace(new RegExp(FILE_PREFIX_ENCODED, "g"), "").replace(new RegExp(FILE_PREFIX_PLAIN, "g"), "");
}
import { spawn as nodeSpawn } from "node:child_process";
import { parseEstilo } from "./parse-estilo.js";
import { validateEdits } from "./validate-edits.js";

const STYLE_RE = /<style>([\s\S]*?)<\/style>/;
const BODY_RE = /(<body[^>]*>)([\s\S]*?)(<\/body>)/i;
const SECTION_RE = /<section[\s\S]*<\/section>/;

// A <section> real fica no <body>; o <head>/<style> do estilo pode conter a string
// "<section" em comentários, então sempre operamos dentro do body.
function sectionOf(html) {
  const body = (html.match(BODY_RE) || [, , ""])[2];
  return (body.match(SECTION_RE) || [body])[0].trim();
}

function slideNumber(file) {
  const m = file.match(/slide-(\d+)\.html$/);
  return m ? parseInt(m[1], 10) : null;
}

// Lista os slide-N.html do post, ordenados por N.
async function listSlideFiles(design) {
  if (!existsSync(design)) return [];
  const files = (await readdir(design)).filter((f) => /^slide-\d+\.html$/.test(f));
  return files.sort((a, b) => slideNumber(a) - slideNumber(b));
}

// Serve os slides para o canvas: CSS do estilo (uma vez) + a <section> de cada slide.
export async function serveSlides({ postDir }) {
  const design = join(postDir, "design");
  const files = await listSlideFiles(design);
  if (files.length === 0) return { status: 404, type: "text/plain", body: "nenhum slide-N.html encontrado" };

  let css = "";
  const slides = [];
  for (const file of files) {
    let html = await readFile(join(design, file), "utf8");
    html = rewriteFilePaths(html);
    if (!css) css = (html.match(STYLE_RE) || [, ""])[1];
    const section = sectionOf(html);
    const block = (section.match(/data-block="([^"]*)"/) || [, null])[1];
    slides.push({ n: slideNumber(file), block, html: section });
  }
  return { status: 200, type: "application/json", body: JSON.stringify({ css, slides }) };
}

export async function serveContract({ estiloPath, postSlug }) {
  if (!estiloPath || !existsSync(estiloPath)) return { status: 204, type: "application/json", body: "" };
  const md = await readFile(estiloPath, "utf8");
  const contract = parseEstilo(md);
  const enriched = { ...contract, estilo_path: estiloPath, post: postSlug || null };
  return { status: 200, type: "application/json", body: JSON.stringify(enriched) };
}

// Salva os slides editados de volta nos slide-N.html: troca só a <section>
// (preserva head/fonts/CSS do arquivo) e grava edits.json. CSS não muda — as
// edições vivem como estilos inline na própria <section>.
export async function saveSlides({ postDir, slides, edits }) {
  const result = validateEdits(edits);
  if (!result.valid) {
    return { status: 400, type: "application/json", body: JSON.stringify({ errors: result.errors }) };
  }
  const design = join(postDir, "design");
  const written = [];
  for (const s of slides || []) {
    const file = join(design, `slide-${s.n}.html`);
    if (!existsSync(file)) continue;
    const original = await readFile(file, "utf8");
    // Substitui o conteúdo do <body> pela section editada (preserva head/style).
    const updated = original.replace(BODY_RE, (m, open, _inner, close) => open + "\n" + s.html + "\n" + close);
    await writeFile(file, updated, "utf8");
    written.push(`slide-${s.n}.html`);
  }
  await writeFile(join(design, "edits.json"), JSON.stringify(edits, null, 2), "utf8");
  return { status: 200, type: "application/json", body: JSON.stringify({ ok: true, written }) };
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

export async function serveSuggestions({ postDir }) {
  const file = join(postDir, "design", "suggestions.json");
  if (!existsSync(file)) return { status: 204, type: "application/json", body: "" };
  const sugg = JSON.parse(await readFile(file, "utf8"));
  const out = {};
  for (const slide of Object.keys(sugg)) {
    const { drop, image } = sugg[slide];
    if (!image || !existsSync(image)) continue;
    const buf = await readFile(image);
    const mime = MIME[extname(image).toLowerCase()] || "image/jpeg";
    out[slide] = { drop, dataUrl: `data:${mime};base64,${buf.toString("base64")}` };
  }
  return { status: 200, type: "application/json", body: JSON.stringify(out) };
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
