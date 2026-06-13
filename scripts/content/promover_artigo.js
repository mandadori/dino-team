#!/usr/bin/env node
/**
 * promover_artigo.js — promove um artigo aprovado para o site (BLOG-11).
 *
 * Ponte determinística brand-OS → site/. Recebe os campos resolvidos no briefing
 * de `/novo-artigo` (já aprovados pelo gate `revisor-brand`) + o caminho do draft
 * em `export/conteudos/blog/<slug>/artigo.mdx`, MONTA o frontmatter BLOG-01 do
 * zero (descartando o frontmatter da marca do draft, reusando só o corpo), VALIDA
 * contra um espelho exato do schema do site, escaneia colisão de slug, guarda
 * contra path-traversal, e escreve `site/content/blog/<slug>.mdx`.
 *
 * Deps-free (built-ins só): a raiz resolve zod@3 transitivo (site é zod@4) e não
 * tem o parser de frontmatter externo — importar qualquer um quebra. Validação +
 * YAML são hand-rolled, como avaliar_politica.js / briefings_do_dia.js.
 *
 * Uso:
 *   node scripts/content/promover_artigo.js \
 *     --slug <slug-kebab> --title <título> --description <desc> \
 *     --author <ramon-dino|mauri-rosolen> \
 *     --category <treino|nutricao|mentalidade|bastidores> \
 *     --draft <caminho do artigo.mdx aprovado> \
 *     [--date YYYY-MM-DD] [--featured true|false] [--cover <path>] \
 *     [--verdade_servida <slug>] [--pilar <slug>]
 *
 * Override de caminho (testes): PROMOVER_CONTENT_DIR=/tmp/blog
 *
 * Contrato:
 * - `promoverArtigo()` LANÇA em qualquer erro (validação/colisão/traversal/draft);
 *   `main()` captura → console.error + usage + exit 1. NUNCA process.exit dentro da fn.
 * - Defaults de discrição (D-06): date=hoje, featured=false, cover=/blog/covers/_default.webp.
 * - Escreve um único `.mdx`; o commit (escopado) é da skill, não deste script.
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  mkdirSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

// MIRROR de site/lib/site.ts (NÃO importar — espelhar):
const CATEGORIES = ["treino", "nutricao", "mentalidade", "bastidores"]; // CATEGORIES slugs
const AUTHORS = ["ramon-dino", "mauri-rosolen"]; // AUTHORS keys — NUNCA "Dino Team"

const REQUIRED = ["slug", "title", "description", "author", "category", "draft"];

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith("--")) {
        throw new Error(`argumento --${key} requer um valor`);
      }
      args[key] = val;
      i++;
    }
  }
  return args;
}

/** Cita strings no frontmatter (title/slug/description/cover). */
function yamlStr(s) {
  return `"${String(s).replace(/"/g, '\\"')}"`;
}

/** Slugs já existentes em contentDir (deps-free — sem parser externo; RESEARCH §Pitfall 3). */
function existingSlugs(contentDir) {
  if (!existsSync(contentDir)) return [];
  return readdirSync(contentDir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = readFileSync(join(contentDir, f), "utf8");
      const m = raw.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
      return m ? m[1].trim() : null;
    })
    .filter(Boolean);
}

/** Descarta o frontmatter da marca do draft e devolve só o corpo (RESEARCH §Pitfall 5). */
function extractBody(draftRaw) {
  const m = draftRaw.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return (m ? m[1] : draftRaw).replace(/^\n+/, "");
}

export function promoverArtigo({
  slug,
  title,
  description,
  author,
  category,
  draft,
  date,
  featured,
  cover,
  verdade_servida,
  pilar,
  contentDir,
}) {
  const dir = contentDir
    ? resolve(contentDir)
    : process.env.PROMOVER_CONTENT_DIR
      ? resolve(process.env.PROMOVER_CONTENT_DIR)
      : resolve("site/content/blog");

  // Defaults de discrição (D-06).
  const fm = {
    title,
    slug,
    date: date || new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    author,
    category,
    description,
    cover: cover || "/blog/covers/_default.webp",
    featured: featured === true || featured === "true", // bare-string → boolean
    verdade_servida,
    pilar,
  };

  // (1) MIRROR validate — falha cedo, antes de tocar o disco (D-05).
  const errs = [];
  for (const f of ["title", "slug", "date", "author", "category", "description", "cover"]) {
    if (typeof fm[f] !== "string" || !fm[f]) errs.push(`${f}: obrigatório (string não-vazia)`);
  }
  if (typeof fm.featured !== "boolean") errs.push("featured: obrigatório (boolean)");
  if (!CATEGORIES.includes(fm.category)) {
    errs.push(`category: "${fm.category}" ∉ ${CATEGORIES.join("|")}`);
  }
  if (!AUTHORS.includes(fm.author)) {
    errs.push(`author: "${fm.author}" não é key de AUTHORS — NUNCA "Dino Team" (D-04)`);
  }
  if (typeof fm.date === "string" && !/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) {
    errs.push(`date: "${fm.date}" deve ser YYYY-MM-DD`);
  }
  if (errs.length) {
    throw new Error("[promover] frontmatter inválido:\n - " + errs.join("\n - "));
  }

  // (2) Path-traversal guard (V12): valida slug ANTES de virar nome de arquivo.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error(`[promover] slug inválido (use ^[a-z0-9][a-z0-9-]*$): "${slug}"`);
  }
  const dest = resolve(dir, `${slug}.mdx`);
  if (!dest.startsWith(resolve(dir))) {
    throw new Error("[promover] destino fora de site/content/blog (path-traversal)");
  }

  // (3) Colisão de slug (D-09) — o loader sombreia em silêncio; checar antes de escrever.
  if (existingSlugs(dir).includes(slug)) {
    throw new Error(`[promover] slug colide com artigo existente: "${slug}"`);
  }

  // (4) Corpo do draft (frontmatter da marca descartado).
  const draftPath = resolve(draft);
  if (!existsSync(draftPath)) {
    throw new Error(`[promover] draft não encontrado: ${draft}`);
  }
  const body = extractBody(readFileSync(draftPath, "utf8"));

  // (5) Montar frontmatter BLOG-01 (3-quote rule; espelha o shape dos artigos-semente).
  const frontmatter = [
    "---",
    `title: ${yamlStr(fm.title)}`,
    `slug: ${yamlStr(fm.slug)}`,
    `date: ${fm.date}`, // bare YYYY-MM-DD (z.coerce.date aceita)
    `author: ${fm.author}`, // bare key
    `category: ${fm.category}`, // bare enum slug
    `description: ${yamlStr(fm.description)}`,
    `cover: ${yamlStr(fm.cover)}`,
    `featured: ${fm.featured}`, // bare true/false
    // D-06 discrição: rastreabilidade marca↔site (zod ignora chaves extras).
    ...(verdade_servida ? [`verdade_servida: ${yamlStr(verdade_servida)}`] : []),
    ...(pilar ? [`pilar: ${yamlStr(pilar)}`] : []),
    "---",
    "",
  ].join("\n");

  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, frontmatter + body, "utf8");
  return { dest };
}

function usage() {
  console.error(`Uso: node scripts/content/promover_artigo.js \\
  --slug <slug-kebab> --title <título> --description <desc> \\
  --author <ramon-dino|mauri-rosolen> \\
  --category <treino|nutricao|mentalidade|bastidores> \\
  --draft <caminho do artigo.mdx aprovado> \\
  [--date YYYY-MM-DD] [--featured true|false] [--cover <path>] \\
  [--verdade_servida <slug>] [--pilar <slug>]`);
}

function main() {
  let a;
  try {
    a = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(String(e.message || e));
    usage();
    process.exit(1);
  }
  for (const key of REQUIRED) {
    if (!a[key]) {
      console.error(`Erro: argumento --${key} é obrigatório.`);
      usage();
      process.exit(1);
    }
  }
  try {
    const out = promoverArtigo({
      slug: a.slug,
      title: a.title,
      description: a.description,
      author: a.author,
      category: a.category,
      draft: a.draft,
      date: a.date,
      featured: a.featured,
      cover: a.cover,
      verdade_servida: a.verdade_servida,
      pilar: a.pilar,
    });
    console.log(out.dest);
  } catch (e) {
    console.error(String(e.message || e));
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
