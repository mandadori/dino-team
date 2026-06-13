# Phase 6: Pipeline de Artigos - Pattern Map

**Mapped:** 2026-06-13
**Files analyzed:** 5 (2 new code, 1 new asset, 2 edits)
**Analogs found:** 4 / 5 (the default-cover asset has no code analog; consumer behavior documented instead)

This is a **brand-OS phase, not a site/React phase.** The new code lives in `scripts/` (deps-free Node CLI + `node --test` unit test). Analogs are anchored in real existing files in `scripts/`, `.claude/skills/`, and root — never in `site/` React land. The site contracts (`site/lib/blog.ts`, `site/lib/site.ts`) are the **source of truth to mirror**, not analogs to copy structure from.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `scripts/content/promover_artigo.js` (NEW) | utility / CLI script | file-I/O + transform | `scripts/memory/append_registro_angulos.js` (+ `scripts/orquestracao/registrar_execucao.js`) | exact (role + data flow) |
| `scripts/content/promover_artigo.test.js` (NEW) | test | file-I/O (tmpdir round-trip) | `scripts/orquestracao/registrar_execucao.test.js` | exact |
| `package.json` `"test"` glob (MODIFIED) | config | — | self (line 10) | exact |
| `.claude/skills/novo-artigo/SKILL.md` (MODIFIED) | skill (orchestration doc) | request-response (LLM flow) | self + `.claude/skills/novo-post/SKILL.md` (script-as-gate + scoped action structure) | self / role-match |
| `CLAUDE.md` (MODIFIED, lines 54 + 201) | config / doc | — | self | exact |
| `site/public/blog/covers/_default.webp` (NEW) | asset | — | none (consumer behavior documented) | no analog |

**Mirror-not-copy sources (read these for the contract, do not structurally copy):**
- `site/lib/blog.ts` lines 22-35 — `FrontmatterSchema` (NOT exported; mirror as hand-rolled validation)
- `site/lib/site.ts` lines 140-164 — `AUTHORS` keys + `CATEGORIES` slugs (the enum/key constraints)
- `site/content/blog/o-treino-que-funciona-e-o-que-voce-mantem.mdx` lines 1-11 — the emitted frontmatter shape

---

## Pattern Assignments

### `scripts/content/promover_artigo.js` (utility / CLI, file-I/O + transform)

**Analog A (primary structure):** `scripts/memory/append_registro_angulos.js` — `--flag value` arg parsing, required-arg validation with `usage()` + `exit(1)`, env path override for tests, `existsSync` guard, file write, exit codes, doc-header contract block.

**Analog B (exportable-fn + CLI dual-mode + deps-free):** `scripts/orquestracao/registrar_execucao.js` — exporting the core fn for unit test, the `import.meta.url === pathToFileURL(process.argv[1])` main-guard, `mkdirSync(dirname, {recursive})` before write, throw-from-fn / catch-in-main split.

**Imports pattern** (`append_registro_angulos.js` lines 33-34 — built-in modules only, the repo deps-free convention):
```javascript
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
```
For this script also pull `readdirSync` (slug scan) and from Analog B the main-guard helper:
```javascript
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
```
> **Deps-free is the hard rule (RESEARCH §Pitfall 1).** Do NOT `import { z } from 'zod'` (root resolves zod@3.25.76 transitively via puppeteer; site is zod@4.4.3 — version footgun) and do NOT `import matter from 'gray-matter'` (absent at root → `ERR_MODULE_NOT_FOUND`). Hand-roll validation + YAML write, exactly as `avaliar_politica.js`/`briefings_do_dia.js` hand-roll YAML.

**Arg-parsing idiom** (`append_registro_angulos.js` lines 50-65 — the `--key value` loop with missing-value guard):
```javascript
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith('--')) {
        console.error(`Erro: argumento --${key} requer um valor.`);
        usage();
      }
      args[key] = val;
      i++;
    }
  }
  return args;
}
```
> Note `registrar_execucao.js` has a terser variant (lines 27-35, `i += 2`) AND `export`s it for the test. Prefer the **exported** form so the test can call `parseArgs`/the core fn directly (see test analog below). The `append_registro_angulos` form is the richer one (missing-value teeth); export whichever you keep.

**Required-arg validation + defaults of discretion** (`append_registro_angulos.js` lines 87-102, adapted to D-06 fields):
```javascript
const REQUIRED = ['slug', 'title', 'description', 'author', 'category', 'draft'];
for (const key of REQUIRED) {
  if (!args[key]) { console.error(`Erro: argumento --${key} é obrigatório.`); usage(); }
}
// Defaults de discrição (D-06):
const date = args.date || new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const featured = args.featured === 'true';                       // bare-string → boolean
const cover = args.cover || '/blog/covers/_default.webp';
```

**Env path override for tests** (`append_registro_angulos.js` lines 105-107 — the exact idiom; `registrar_execucao.js` line 41 has the `path || env || default` triple):
```javascript
const contentDir = process.env.PROMOVER_CONTENT_DIR
  ? resolve(process.env.PROMOVER_CONTENT_DIR)
  : resolve('site/content/blog');
```
> Adopt the same env-override convention so the unit test writes to a tmpdir instead of the real `site/content/blog/`. Name it `PROMOVER_CONTENT_DIR` (mirrors `REGISTRO_ANGULOS_PATH` / `EXECUCOES_PATH` naming).

**Mirror BLOG-01 validator** — mirror `site/lib/blog.ts` lines 22-35 (`FrontmatterSchema`) + `site/lib/site.ts` lines 140-164 (`AUTHORS` keys, `CATEGORIES` slugs). The exact shape to reproduce as hand-rolled checks:
```javascript
// MIRROR of site/lib/blog.ts FrontmatterSchema (8 required + example optional):
//   title z.string · slug z.string · date z.coerce.date · author z.string
//   category z.enum(['treino','nutricao','mentalidade','bastidores'])
//   description z.string · cover z.string · featured z.boolean · example z.boolean.optional
const CATEGORIES = ['treino', 'nutricao', 'mentalidade', 'bastidores'];   // site/lib/site.ts:157-162
const AUTHORS = ['ramon-dino', 'mauri-rosolen'];                          // site/lib/site.ts:140-151 keys
function validate(fm) {
  const errs = [];
  for (const f of ['title', 'slug', 'date', 'author', 'category', 'description', 'cover'])
    if (typeof fm[f] !== 'string' || !fm[f]) errs.push(`${f}: obrigatório (string não-vazia)`);
  if (typeof fm.featured !== 'boolean') errs.push('featured: obrigatório (boolean)');
  if (!CATEGORIES.includes(fm.category)) errs.push(`category: "${fm.category}" ∉ ${CATEGORIES.join('|')}`);
  if (!AUTHORS.includes(fm.author)) errs.push(`author: "${fm.author}" não é key de AUTHORS — NUNCA "Dino Team" (D-04)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fm.date)) errs.push(`date: "${fm.date}" deve ser YYYY-MM-DD`);
  if (errs.length) { console.error('[promover] frontmatter inválido:\n - ' + errs.join('\n - ')); process.exit(1); }
}
```
> **Why `author`/`category` are real teeth, not just zod parity:** `site/app/blog/[slug]/page.tsx:137` does `const author = AUTHORS[post.author as keyof typeof AUTHORS]` (→ `undefined` for a bad key) and `:294` passes `author ?? post.author` to `AuthorBlock`, which at `site/components/blog/AuthorBlock.tsx:21` destructures `const { name, credential, photo, bio } = resolveAuthor(author)` → **build throw** on `undefined`. The site zod types `author` as `z.string()` and does NOT catch a bad key — the `AuthorBlock` lookup does, in `next build`. Pre-checking `author ∈ AUTHORS` fails earlier with a clear message.

**YAML frontmatter write** (3-quote rule, deps-free — emit the shape of `site/content/blog/o-treino-que-funciona-e-o-que-voce-mantem.mdx` lines 1-11):
```javascript
function yamlStr(s) { return `"${String(s).replace(/"/g, '\\"')}"`; } // quote title/description/cover
const frontmatter = [
  '---',
  `title: ${yamlStr(fm.title)}`,
  `slug: ${yamlStr(fm.slug)}`,
  `date: ${fm.date}`,            // bare YYYY-MM-DD — z.coerce.date() aceita (RESEARCH VERIFIED)
  `author: ${fm.author}`,        // bare key, sem aspas
  `category: ${fm.category}`,    // bare enum slug
  `description: ${yamlStr(fm.description)}`,
  `cover: ${yamlStr(fm.cover)}`,
  `featured: ${fm.featured}`,    // bare true/false
  // D-06 discrição: rastreabilidade marca↔site (zod ignora chaves extras)
  ...(fm.verdade_servida ? [`verdade_servida: ${yamlStr(fm.verdade_servida)}`] : []),
  ...(fm.pilar ? [`pilar: ${yamlStr(fm.pilar)}`] : []),
  '---',
  '',
].join('\n');
```
> The example MDX uses `cover: "/blog/covers/<slug>.webp"` and `featured: true` bare — match that exactly. Strip the draft's own brand frontmatter (`pilar`/`narrativa`/`data`/`autor`/`status` from `templates/artigo.md` lines 1-10); reuse ONLY the body after the closing `---` (RESEARCH §Pitfall 5 — avoid double frontmatter / `autor: "Dino Team"` leaking).

**Slug-collision scan (D-09) + path-traversal guard (V12)** — derive from `getAllPosts` (`site/lib/blog.ts` lines 108-115) but deps-free (no gray-matter):
```javascript
function existingSlugs(contentDir) {
  return readdirSync(contentDir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const raw = readFileSync(join(contentDir, f), 'utf8');
      const m = raw.match(/^slug:\s*["']?([^"'\n]+)["']?\s*$/m);
      return m ? m[1].trim() : null;
    })
    .filter(Boolean);
}
// V12 path-traversal: validate slug BEFORE using as filename, assert dest stays under contentDir
if (!/^[a-z0-9][a-z0-9-]*$/.test(args.slug)) { console.error(`[promover] slug inválido: "${args.slug}"`); process.exit(1); }
const dest = resolve(contentDir, `${args.slug}.mdx`);
if (!dest.startsWith(resolve(contentDir))) { console.error('[promover] destino fora de site/content/blog'); process.exit(1); }
if (existingSlugs(contentDir).includes(args.slug)) { console.error(`[promover] slug colide: "${args.slug}"`); process.exit(1); }
```
> `getPostBySlug` (`site/lib/blog.ts:118-124`) uses `.find` → duplicate slug shadows silently; build does NOT catch it (RESEARCH §Pitfall 3). The scan must precede the write.

**Main-guard + exportable core** (`registrar_execucao.js` lines 37-60 — export the fn, guard CLI entry):
```javascript
export function promoverArtigo({ /* fields */ }) { /* validate → assemble → write; throw on error */ }
function main() {
  const a = parseArgs(process.argv.slice(2));
  try { const out = promoverArtigo({ /* ...a */ }); console.log(out.dest); }
  catch (e) { console.error(String(e.message || e)); usage(); }
}
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
```
> Splitting a throwing core fn from a `process.exit`-ing CLI (Analog B pattern) makes the unit test call `promoverArtigo(...)` directly and `assert.throws` on invalid input, while the CLI test exercises `execFileSync`.

---

### `scripts/content/promover_artigo.test.js` (test, file-I/O tmpdir round-trip)

**Analog:** `scripts/orquestracao/registrar_execucao.test.js` — confirmed idiom: `node --test`, `node:assert/strict`, `mkdtempSync(join(tmpdir(), 'prefix-'))` for isolation, env path override via `execFileSync` `env`, both direct-fn-call and CLI-subprocess tests.

**Imports + tmpdir helper** (lines 1-14 — the exact idiom to copy):
```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
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
```

**Direct-fn assertion idiom** (lines 16-47 — valid assemble, round-trip, `assert.throws` on invalid):
```javascript
test("monta frontmatter BLOG-01 válido com os 8 campos (round-trip)", () => {
  const dir = tmpContentDir();
  // ...write a draft, call promoverArtigo, re-read dest, assert all 8 fields parse
});
test("rejeita author inválido (≠ AUTHORS)", () => {
  assert.throws(() => promoverArtigo({ /* author: "Dino Team" */ }), /author/);
});
test("detecta colisão de slug", () => {
  const dir = tmpContentDir();
  writeFileSync(join(dir, "x.mdx"), '---\nslug: "x"\n---\n');
  assert.throws(() => promoverArtigo({ /* slug: "x", contentDir: dir */ }), /colide/);
});
```

**CLI-subprocess idiom with env override** (lines 56-64 — the exact `execFileSync` + `env` pattern; mirror `EXECUCOES_PATH` → `PROMOVER_CONTENT_DIR`):
```javascript
test("CLI escreve o .mdx e sai 0", () => {
  const dir = tmpContentDir();
  const out = execFileSync("node", [join(HERE, "promover_artigo.js"), "--slug", "...", /* ...args */], {
    encoding: "utf8", env: { ...process.env, PROMOVER_CONTENT_DIR: dir },
  });
  assert.equal(existsSync(join(dir, "....mdx")), true);
});
```
> Test cases required by `06-VALIDATION.md`: valid assemble + round-trip, invalid `author` → exit 1, invalid `category` → exit 1, slug collision → exit 1, path-traversal guard (`../` slug rejected), written `.mdx` re-parses.

---

### `package.json` `"test"` glob (config edit)

**Analog:** self, line 10. Append `scripts/content/*.test.js` to the existing glob:
```json
"test": "node --test scripts/editor/*.test.js scripts/orquestracao/*.test.js scripts/relatorio/*.test.js scripts/content/*.test.js",
```
> Root is `"type": "module"`, engines `>=20`, deps = puppeteer/jsdom only (lines 2-21). No new dependency is added this phase.

---

### `.claude/skills/novo-artigo/SKILL.md` (skill edit — D-11, 9 skill-writing rules)

**Primary analog:** self (the current `## Fluxo` table lines 11-21 + steps 5/6/7 + `description` line 3 + §"Princípio central" lines 182-186 + §"Entregável final" lines 188-193 + §"Critério de conclusão" lines 195-200).

**Structural analog (skill that invokes a script as a gate + conditional gated action):** `.claude/skills/novo-post/SKILL.md` — it calls `scripts/export-png.js` as a *validating gate* (lines 175/303/350), then conditionally invokes `scripts/integrations/publish_instagram.js` (lines 502/508/516) only when policy says so, then `scripts/memory/append_registro_angulos.js` (line 475) + `scripts/orquestracao/registrar_execucao.js` (line 539). This is the closest existing "skill orchestrates a deterministic script + a quality gate" shape.
> **No skill currently does `git commit`** — D-10's commit step is net-new to the skill layer. Scope it tightly (security V12 / Tampering): `git add` ONLY `site/content/blog/<slug>.mdx` (+ `site/public/blog/covers/_default.webp` if new) — **never `git add .`**.

**Existing write-back call to preserve verbatim** (current `novo-artigo/SKILL.md` lines 170-178 — Claude's Discretion in CONTEXT says preserve, do not replace):
```bash
node scripts/memory/append_registro_angulos.js \
  --slug "<slug>" --data "$(date +%F)" --canal blog \
  --angulo "<angulo>" --verdade "<verdade_servida>" --pilar "<pilar>"
```

**The promote step the planner must insert** (after the brand gate, step 6 — invokes the new script then the build gate then the commit):
```bash
node scripts/content/promover_artigo.js \
  --slug <slug> --title <title> --description <description> \
  --author <ramon-dino|mauri-rosolen> --category <treino|nutricao|mentalidade|bastidores> \
  --date <hoje> --cover /blog/covers/_default.webp --featured false \
  --draft export/conteudos/blog/<slug>/artigo.mdx
cd site && npm run build   # GATE: exit 0 = verde; ≠0 = NÃO pronto (D-08; NUNCA `npm run lint`)
```

**Exact D-11 edit map** (lines verified against the current file + RESEARCH §State of the Art):

| Location | Old | New |
|----------|-----|-----|
| `SKILL.md:3` (`description` frontmatter) | "...Output em `export/...`. A publicação no site é trabalho do GSD do site (não desta skill)." | + promote step + `next build` gate + commit |
| `SKILL.md:11-21` (`## Fluxo` table) | 7 steps; **row `3.⏸` violates rule 1** (fractional step) | renumber **linear 1..N**; fold `3.⏸` into step 3 (rule 4: pause is part of its step); add promote / build-gate / commit rows after step 6 (preserve write-back row) |
| `SKILL.md:165` (step 7 final msg) | "Próximo passo: integração no site é trabalho do GSD do site (fora desta skill)." | "Publicado no site: /blog/<slug>" |
| `SKILL.md:182-186` (§Princípio central) | "**A publicação no site é fora de escopo.** ... fase do GSD do site." | rewrite — promotion is now deterministic via `promover_artigo.js`; build is the gate |
| `SKILL.md:188-193` (§Entregável final) | only `export/.../artigo.mdx` | + `site/content/blog/<slug>.mdx` (+ default cover if new) |
| `SKILL.md:195-200` (§Critério de conclusão) | draft + brand gate + write-back | + valid `.mdx` on 1st try, build verde, appears in `/blog`, committed |

> **9 skill-writing rules (CLAUDE.md §"Padrão de escrita de skills") the edit MUST follow:** rule 1 (linear `1..N` — fix `3.⏸`), rule 3 (conditionals as sub-bullets: "se slug colide → sufixa/reconfirma" under step 3), rule 4 (⏸ is part of its step), rule 6 (reference by section name `§Promover ao site`, never number), rule 8 (single source for system rules — point to `site/lib/blog.ts`, don't restate the schema). Rules 5 and 9 are N/A (`/novo-artigo` has no `--auto` mode; prose MDX, not Dino Editor slides).

---

### `CLAUDE.md` (config / doc edit — D-11)

**Analog:** self.

- **Line 54** (`/novo-artigo` pointer): drop the last sentence "A publicação no site é trabalho do GSD do site." → state that `/novo-artigo` now promotes to `site/content/blog/<slug>.mdx`, gated by `next build`, committed.
- **Line 201** (§"Criação de conteúdo — Blog"): "Artigo MDX draft pronto para integração no site." → "Artigo MDX publicado no site (passa `next build`)."

---

## Shared Patterns

### Deterministic deps-free Node CLI
**Source:** `scripts/memory/append_registro_angulos.js` (lines 33-65, 87-107) + `scripts/orquestracao/registrar_execucao.js` (lines 21-60)
**Apply to:** `scripts/content/promover_artigo.js`
Shebang `#!/usr/bin/env node`; doc-header contract block; built-in modules only; `parseArgs` `--key value` loop; `REQUIRED` array + `usage()`+`exit(1)`; env path override (`PROMOVER_CONTENT_DIR`); main-guard `import.meta.url === pathToFileURL(process.argv[1]).href`; exported core fn that throws (so the test can `assert.throws`).

### `node --test` tmpdir unit test
**Source:** `scripts/orquestracao/registrar_execucao.test.js` (lines 1-64)
**Apply to:** `scripts/content/promover_artigo.test.js`
`node:test` + `node:assert/strict`; `mkdtempSync(join(tmpdir(), 'prefix-'))` isolation; direct-fn-call tests + one `execFileSync` CLI test with `env` override; `assert.throws(..., /regex/)` for invalid-input cases.

### Mirror-not-import the site contract
**Source:** `site/lib/blog.ts:22-35` (`FrontmatterSchema`, NOT exported) + `site/lib/site.ts:140-164` (`AUTHORS` keys, `CATEGORIES` slugs)
**Apply to:** the validator inside `promover_artigo.js`
Reproduce the 8-field shape + the 2 enums as hand-rolled checks. Do NOT import zod (v3 root vs v4 site footgun) or gray-matter (absent at root). The real `author` teeth is `AuthorBlock` build-throw, not zod — pre-check `author ∈ AUTHORS`.

### Placeholder discipline for the default cover
**Source:** `site/lib/site.ts:144` (`photo: undefined` for ramon-dino) + `site/components/blog/PostCard.tsx:57` + `site/app/blog/[slug]/page.tsx:263`
**Apply to:** `site/public/blog/covers/_default.webp`
`cover` is `z.string()` non-empty → `post.cover ?` (PostCard `:57`, article hero `:263`) is ALWAYS truthy → the `<Image src={post.cover}>` branch always runs; the monochrome placeholder branch is NOT reached. So the file MUST physically exist at the path or it 404s at runtime (build stays green — `next/image` doesn't check existence at build-time, RESEARCH §Pitfall 2). Same intentional-placeholder logic as the existing `Foto do autor` / `Dino Team` monochrome slots.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `site/public/blog/covers/_default.webp` | asset | — | No code analog — it is a committed binary. Consumer behavior is documented under §Shared Patterns "Placeholder discipline": `PostCard.tsx:57` / article hero `[slug]/page.tsx:263` both gate on `post.cover ?` (always truthy since cover is non-empty), so the file must exist on disk to render clean. The 4 existing seeds point at `/blog/covers/<slug>.webp` that do NOT exist yet (build green, runtime 404) — `_default.webp` is the first real cover file. `site/public/blog/covers/` directory itself is created this phase. |

---

## Metadata

**Analog search scope:** `scripts/memory/`, `scripts/orquestracao/`, `.claude/skills/` (novo-artigo, novo-post, lote-posts), `site/lib/`, `site/components/blog/`, `site/app/blog/[slug]/`, `site/content/blog/`, root (`package.json`, `CLAUDE.md`), `templates/`
**Files scanned:** 13 read in full or targeted
**Pattern extraction date:** 2026-06-13
