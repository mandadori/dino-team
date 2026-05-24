#!/usr/bin/env node
/**
 * publish_instagram.js — tool determinística de publicação no Instagram.
 *
 * API alvo:        Instagram Graph API
 * Versão da API:   v22.0 (default; override por IG_API_VERSION)
 * Data de validação: 2026-05-23
 *
 * Determinístico, sem LLM. Recebe a pasta de um post Dino Team, monta os
 * containers de mídia (carrossel ou single) e publica. Idempotente: recusa
 * republicar um slug que já tem log de sucesso.
 *
 * Uso:
 *   node publish_instagram.js --post <pasta-do-post> [--dry-run]
 *
 * Pasta esperada (export/conteudos/<formato>/<data>-<slug>/):
 *   - export/*.png        → imagens em ordem alfabética
 *   - legenda.txt | legenda.md | briefing.md (frontmatter `legenda:`) → caption
 *
 * Env vars (ver .env.example):
 *   IG_USER_ID        — ID do Instagram Business Account
 *   IG_ACCESS_TOKEN   — token long-lived com instagram_content_publish
 *   IG_IMAGE_BASE_URL — base pública onde as PNGs estão hospedadas
 *                       (a Graph API exige image_url PÚBLICA; arquivo local não basta)
 *   IG_API_VERSION    — opcional, default v22.0
 *
 * Saída: JSON em stdout. Sucesso: {status, instagram_media_id, posted_at}.
 *        Falha: exit code != 0 + {error}.
 */

import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname;
const API_VERSION = process.env.IG_API_VERSION || "v22.0";
const GRAPH = `https://graph.facebook.com/${API_VERSION}`;

function fail(code, message, extra = {}) {
  console.error(JSON.stringify({ status: "error", code, error: message, ...extra }, null, 2));
  process.exit(1);
}

function parseArgs(argv) {
  const args = { dryRun: false, post: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--post") args.post = argv[++i];
    else if (a.startsWith("--post=")) args.post = a.slice("--post=".length);
  }
  return args;
}

function readCaption(postDir) {
  for (const name of ["legenda.txt", "legenda.md", "caption.txt"]) {
    const p = path.join(postDir, name);
    if (fs.existsSync(p)) return fs.readFileSync(p, "utf8").trim();
  }
  // fallback: frontmatter `legenda:` em briefing.md
  const briefing = path.join(postDir, "briefing.md");
  if (fs.existsSync(briefing)) {
    const txt = fs.readFileSync(briefing, "utf8");
    const m = txt.match(/^legenda:\s*(.+)$/m);
    if (m) return m[1].trim();
  }
  return null;
}

function listImages(postDir) {
  const exportDir = path.join(postDir, "export");
  const dir = fs.existsSync(exportDir) ? exportDir : postDir;
  return fs
    .readdirSync(dir)
    .filter((f) => /\.png$/i.test(f))
    .sort()
    .map((f) => ({ file: f, abs: path.join(dir, f) }));
}

function logPath(slug) {
  const logsDir = path.join(__dirname, ".logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(logsDir, `publish_instagram-${slug}-${ts}.json`);
}

function alreadyPublished(slug) {
  const logsDir = path.join(__dirname, ".logs");
  if (!fs.existsSync(logsDir)) return false;
  return fs
    .readdirSync(logsDir)
    .filter((f) => f.startsWith(`publish_instagram-${slug}-`))
    .some((f) => {
      try {
        const j = JSON.parse(fs.readFileSync(path.join(logsDir, f), "utf8"));
        return j.status === "success";
      } catch {
        return false;
      }
    });
}

async function graphPost(endpoint, params) {
  const url = `${GRAPH}/${endpoint}`;
  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      `Graph API ${endpoint} falhou: ${JSON.stringify(json.error || json)}`,
    );
  }
  return json;
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.post) fail("INPUT_INSUFICIENTE", "Faltou --post <pasta-do-post>");
  const postDir = path.resolve(args.post);
  if (!fs.existsSync(postDir)) fail("POST_AUSENTE", `Pasta não existe: ${postDir}`);

  const slug = path.basename(postDir);
  const images = listImages(postDir);
  if (images.length === 0) fail("SEM_IMAGENS", `Nenhuma PNG em ${postDir} (ou ${postDir}/export)`);

  const caption = readCaption(postDir);
  if (!caption) {
    fail(
      "LEGENDA_AUSENTE",
      `Sem legenda. Crie legenda.txt em ${postDir} ou adicione 'legenda:' no frontmatter de briefing.md`,
    );
  }

  if (alreadyPublished(slug)) {
    fail("JA_PUBLICADO", `Slug '${slug}' já tem log de sucesso. Republicação recusada (idempotência).`);
  }

  const tipo = images.length >= 2 ? "carrossel" : "single";

  // Validação de credenciais (a menos que dry-run)
  const { IG_USER_ID, IG_ACCESS_TOKEN, IG_IMAGE_BASE_URL } = process.env;
  if (!args.dryRun) {
    if (!IG_USER_ID) fail("ENV_AUSENTE", "IG_USER_ID não definido em env");
    if (!IG_ACCESS_TOKEN) fail("ENV_AUSENTE", "IG_ACCESS_TOKEN não definido em env");
    if (!IG_IMAGE_BASE_URL)
      fail("ENV_AUSENTE", "IG_IMAGE_BASE_URL não definido (Graph API exige image_url pública)");
  }

  const imageUrls = images.map(
    (img) => `${(IG_IMAGE_BASE_URL || "https://PLACEHOLDER").replace(/\/$/, "")}/${img.file}`,
  );

  if (args.dryRun) {
    const out = {
      status: "dry-run-ok",
      slug,
      tipo,
      containers: images.length,
      caption_preview: caption.slice(0, 80),
      image_urls: imageUrls,
      note: "Nenhuma chamada à API foi feita.",
    };
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  // ── Publicação real ──────────────────────────────────────────
  let creationId;
  if (tipo === "single") {
    const c = await graphPost(`${IG_USER_ID}/media`, {
      image_url: imageUrls[0],
      caption,
      access_token: IG_ACCESS_TOKEN,
    });
    creationId = c.id;
  } else {
    // 1. container por imagem (is_carousel_item)
    const childIds = [];
    for (const url of imageUrls) {
      const child = await graphPost(`${IG_USER_ID}/media`, {
        image_url: url,
        is_carousel_item: "true",
        access_token: IG_ACCESS_TOKEN,
      });
      childIds.push(child.id);
    }
    // 2. container do carrossel
    const carousel = await graphPost(`${IG_USER_ID}/media`, {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption,
      access_token: IG_ACCESS_TOKEN,
    });
    creationId = carousel.id;
  }

  // 3. publicar
  const published = await graphPost(`${IG_USER_ID}/media_publish`, {
    creation_id: creationId,
    access_token: IG_ACCESS_TOKEN,
  });

  const result = {
    status: "success",
    slug,
    tipo,
    instagram_media_id: published.id,
    posted_at: new Date().toISOString(),
  };

  fs.writeFileSync(
    logPath(slug),
    JSON.stringify({ ...result, input: { postDir, images: images.map((i) => i.file), caption } }, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => fail("ERRO_EXECUCAO", err.message));
