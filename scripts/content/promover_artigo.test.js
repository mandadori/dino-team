import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  existsSync,
  writeFileSync,
  mkdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { promoverArtigo, parseArgs } from "./promover_artigo.js";

const HERE = dirname(fileURLToPath(import.meta.url));

function tmpContentDir() {
  const d = join(mkdtempSync(join(tmpdir(), "promover-")), "blog");
  mkdirSync(d, { recursive: true });
  return d;
}

/** Escreve um draft com frontmatter da MARCA (não-site) + corpo, num tmp separado. */
function writeDraft(body = "## Abertura\n\nCorpo do artigo de teste.\n") {
  const p = join(mkdtempSync(join(tmpdir(), "draft-")), "artigo.mdx");
  writeFileSync(
    p,
    `---\npilar: "Mentalidade"\nnarrativa: "neutro"\ndata: "2026-06-13"\nautor: "Dino Team"\nstatus: "draft"\n---\n\n${body}`,
  );
  return p;
}

function validArgs(dir, draft, over = {}) {
  return {
    slug: "meu-artigo",
    title: "Meu Artigo",
    description: "Uma descrição sóbria do artigo.",
    author: "ramon-dino",
    category: "treino",
    draft,
    contentDir: dir,
    ...over,
  };
}

test("monta frontmatter BLOG-01 válido com os 8 campos (round-trip)", () => {
  const dir = tmpContentDir();
  const draft = writeDraft("## Abertura\n\nCorpo do artigo de teste.\n");
  const { dest } = promoverArtigo(validArgs(dir, draft, { date: "2026-06-13", featured: "true" }));
  const raw = readFileSync(dest, "utf8");
  assert.match(raw, /^title: "Meu Artigo"$/m);
  assert.match(raw, /^slug: "meu-artigo"$/m);
  assert.match(raw, /^date: 2026-06-13$/m);
  assert.match(raw, /^author: ramon-dino$/m);
  assert.match(raw, /^category: treino$/m);
  assert.match(raw, /^description: "Uma descrição sóbria do artigo\."$/m);
  assert.match(raw, /^cover: "\/blog\/covers\/_default\.webp"$/m);
  assert.match(raw, /^featured: true$/m);
  // Exatamente um par de fences (sem frontmatter duplo) e o corpo preservado.
  assert.equal((raw.match(/^---$/gm) || []).length, 2);
  assert.match(raw, /Corpo do artigo de teste\./);
  // O frontmatter da marca (autor: "Dino Team") NÃO vaza pro site.
  assert.doesNotMatch(raw, /Dino Team/);
});

test("rejeita author inválido (≠ AUTHORS)", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  assert.throws(() => promoverArtigo(validArgs(dir, draft, { author: "Dino Team" })), /author/);
});

test("rejeita category fora do enum das 4", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  assert.throws(() => promoverArtigo(validArgs(dir, draft, { category: "foo" })), /category/);
});

test("detecta colisão de slug com .mdx existente", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  writeFileSync(join(dir, "x.mdx"), '---\nslug: "x"\n---\n');
  assert.throws(() => promoverArtigo(validArgs(dir, draft, { slug: "x" })), /colide/);
});

test("rejeita slug com path-traversal (../)", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  assert.throws(() => promoverArtigo(validArgs(dir, draft, { slug: "../evil" })), /slug/);
});

test("lança em date fora do formato YYYY-MM-DD", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  assert.throws(() => promoverArtigo(validArgs(dir, draft, { date: "13/06/2026" })), /date/);
});

test("parseArgs extrai --slug --title --author --category", () => {
  const a = parseArgs(["--slug", "x-y", "--title", "T", "--author", "ramon-dino", "--category", "treino"]);
  assert.equal(a.slug, "x-y");
  assert.equal(a.title, "T");
  assert.equal(a.author, "ramon-dino");
  assert.equal(a.category, "treino");
});

test("CLI escreve o .mdx e sai 0 (env PROMOVER_CONTENT_DIR)", () => {
  const dir = tmpContentDir();
  const draft = writeDraft();
  execFileSync(
    "node",
    [
      join(HERE, "promover_artigo.js"),
      "--slug", "cli-artigo",
      "--title", "CLI Artigo",
      "--description", "Descrição do artigo via CLI.",
      "--author", "mauri-rosolen",
      "--category", "nutricao",
      "--draft", draft,
    ],
    { encoding: "utf8", env: { ...process.env, PROMOVER_CONTENT_DIR: dir } },
  );
  assert.equal(existsSync(join(dir, "cli-artigo.mdx")), true);
});
