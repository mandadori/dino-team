# Banco de imagens via Drive MCP com descanso por canal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Conectar o MCP oficial do Google Drive como fonte do banco de imagens da marca, com o `arquivista` selecionando a melhor imagem por tema/estilo e marcando uso com descanso **por canal** (a mesma foto fica livre em canais que ainda não a usaram).

**Architecture:** Abordagem híbrida (C) — o MCP descobre candidatos, a visão do agente compreende (legenda por thumbnail, uma vez), e o estado (índice + matemática de descanso por canal) vive em funções puras testáveis em `scripts/editor/banco.js`. Escopo de runtime: só Instagram; schema/scripts já nascem por-canal.

**Tech Stack:** Node.js (ESM, `type: module`), `node:test` nativo, parser YAML mínimo local (sem `js-yaml`, seguindo o padrão de `scripts/orquestracao/avaliar_politica.js`), MCP remoto via `.mcp.json`.

**Spec:** `docs/superpowers/specs/2026-06-07-drive-banco-imagens-por-canal-design.md`

---

## File Structure

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `scripts/editor/banco.js` | Funções puras do índice: normalização v1→v2, filtro de disponíveis por canal, marcação por canal, scan/caption por `drive_file_id` | Modificar |
| `scripts/editor/banco.test.js` | Testes unitários das funções puras (node:test) | Criar |
| `scripts/editor/banco-config.js` | Parser do `banco-imagens.yaml` + `restDaysFor(canal)` | Criar |
| `scripts/editor/banco-config.test.js` | Testes do parser de config | Criar |
| `scripts/index-banco.js` | CLI fino: `mark --canal` (obrigatório), novo `available <dir> <canal>`, `caption`/`scan` por `drive_file_id` | Modificar |
| `scripts/editor/banco-cli.test.js` | Testes do CLI (spawn) | Criar |
| `orquestracao/banco-imagens.yaml` | Config: pasta-raiz do Drive + descanso por canal | Criar |
| `.gitignore` | Ignorar `.cache/` | Modificar |
| `.mcp.json` | Registrar o MCP do Drive | Criar |
| `.claude/skills/configurar-banco/SKILL.md` | Skill que lista pastas via MCP e grava `pasta_raiz_id` | Criar |
| `.claude/agents/arquivista.md` | Contrato ganha eixo `canal` + fonte Drive/MCP + legenda por thumbnail | Modificar |
| `.claude/skills/novo-post/SKILL.md` | Passo 11m lê config (sem `--banco` manual); Passo 16 marca `--canal instagram` | Modificar |

**Nota de execução:** o worktree já está rebaseado em `dino-studio-editor`, então `scripts/editor/banco.js`, `scripts/index-banco.js` e `.claude/agents/arquivista.md` existem. Todos os comandos rodam de `/Users/unstudio/Documents/Projetos/dino team/.claude/worktrees/drive-banco-por-canal`.

---

## Task 1: Núcleo por-canal em `banco.js` (normalize + filterAvailable + markUsed)

**Files:**
- Modify: `scripts/editor/banco.js`
- Test: `scripts/editor/banco.test.js` (criar)

Estado atual de `scripts/editor/banco.js` (referência):

```js
// scripts/editor/banco.js
const IMG_RE = /\.(jpe?g|png|webp)$/i;

export function scanNew(files, index) {
  const known = new Set((index.images || []).map((i) => i.file));
  return files.filter((f) => IMG_RE.test(f) && !known.has(f));
}

export function upsertCaption(index, file, caption, tags) {
  if (!index.images) index.images = [];
  let e = index.images.find((i) => i.file === file);
  if (!e) {
    e = { file, caption: "", tags: [], used_in: [], rest_until: null };
    index.images.push(e);
  }
  e.caption = caption;
  e.tags = tags || [];
  return e;
}

function addDaysISO(dateISO, days) {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function markUsed(index, file, post, dateISO, restDays) {
  const e = (index.images || []).find((i) => i.file === file);
  if (!e) return null;
  e.used_in.push({ post, date: dateISO });
  e.rest_until = addDaysISO(dateISO, restDays);
  return e;
}

export function filterAvailable(index, todayISO) {
  return (index.images || []).filter((e) => !e.rest_until || e.rest_until <= todayISO);
}
```

- [ ] **Step 1: Write the failing test**

Criar `scripts/editor/banco.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeIndex,
  filterAvailable,
  markUsed,
} from "./banco.js";

test("normalizeIndex: converte índice v1 (rest_until string) para v2 (mapa vazio)", () => {
  const idx = {
    images: [
      { file: "a.jpg", caption: "x", tags: [], used_in: [], rest_until: "2099-01-01" },
    ],
  };
  normalizeIndex(idx);
  assert.equal(idx.version, 2);
  const e = idx.images[0];
  assert.equal(e.drive_file_id, "a.jpg"); // herda do file legado
  assert.equal(e.name, "a.jpg");
  assert.deepEqual(e.rest_until, {}); // string vira mapa vazio (= disponível)
});

test("filterAvailable: foto com rest_until.instagram futuro NÃO aparece no instagram", () => {
  const idx = normalizeIndex({
    images: [
      { drive_file_id: "1", name: "rest.jpg", rest_until: { instagram: "2099-01-01" } },
      { drive_file_id: "2", name: "free.jpg", rest_until: {} },
    ],
  });
  const disp = filterAvailable(idx, "instagram", "2026-06-07");
  assert.deepEqual(disp.map((e) => e.drive_file_id), ["2"]);
});

test("TESTE-CHAVE: foto usada no instagram continua disponível em email e ads", () => {
  const idx = normalizeIndex({
    images: [{ drive_file_id: "1", name: "x.jpg", rest_until: { instagram: "2099-01-01" } }],
  });
  assert.equal(filterAvailable(idx, "instagram", "2026-06-07").length, 0);
  assert.equal(filterAvailable(idx, "email", "2026-06-07").length, 1);
  assert.equal(filterAvailable(idx, "ads", "2026-06-07").length, 1);
});

test("markUsed: seta rest_until.instagram = data+60 e NÃO toca email", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  const e = markUsed(idx, "1", "post-a", "2026-06-07", "instagram", 60);
  assert.equal(e.rest_until.instagram, "2026-08-06");
  assert.equal(e.rest_until.email, undefined);
  assert.deepEqual(e.used_in, [{ post: "post-a", date: "2026-06-07", canal: "instagram" }]);
});

test("markUsed: dois canais coexistem independentes no mesmo arquivo", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  markUsed(idx, "1", "post-a", "2026-06-07", "instagram", 60);
  markUsed(idx, "1", "post-b", "2026-06-07", "email", 30);
  const e = idx.images[0];
  assert.equal(e.rest_until.instagram, "2026-08-06");
  assert.equal(e.rest_until.email, "2026-07-07");
  assert.equal(e.used_in.length, 2);
});

test("markUsed: restDays=0 (ads) não cria descanso — disponível imediatamente", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  markUsed(idx, "1", "post-a", "2026-06-07", "ads", 0);
  assert.equal(idx.images[0].rest_until.ads, undefined);
  assert.equal(filterAvailable(idx, "ads", "2026-06-07").length, 1);
});

test("markUsed: drive_file_id inexistente devolve null", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  assert.equal(markUsed(idx, "999", "p", "2026-06-07", "instagram", 60), null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/editor/banco.test.js`
Expected: FAIL — `normalizeIndex` não é exportada; `filterAvailable`/`markUsed` têm assinatura antiga.

- [ ] **Step 3: Write minimal implementation**

Substituir o conteúdo de `scripts/editor/banco.js` por:

```js
// scripts/editor/banco.js
// Helpers puros do índice do banco de imagens (.banco-index.json), schema v2.
// Estado: índice por drive_file_id; descanso é um MAPA por canal.

const IMG_RE = /\.(jpe?g|png|webp)$/i;

// Normaliza um índice cru (v1 ou v2) para a forma v2. Idempotente.
// v1: chave `file`, rest_until string|null. v2: chave `drive_file_id`, rest_until objeto.
export function normalizeIndex(index) {
  if (!index.images) index.images = [];
  index.version = 2;
  for (const e of index.images) {
    if (!e.drive_file_id) e.drive_file_id = e.file || e.name || null;
    if (!e.name) e.name = e.file || e.drive_file_id;
    if (typeof e.rest_until === "string" || e.rest_until == null) e.rest_until = {};
    if (!Array.isArray(e.used_in)) e.used_in = [];
    if (!Array.isArray(e.tags)) e.tags = [];
    if (typeof e.caption !== "string") e.caption = "";
  }
  return index;
}

// Candidatos do Drive ainda não indexados. driveFiles: [{drive_file_id, name}].
export function scanNew(driveFiles, index) {
  const known = new Set((index.images || []).map((i) => i.drive_file_id));
  return (driveFiles || []).filter(
    (f) => IMG_RE.test(f.name || "") && !known.has(f.drive_file_id),
  );
}

export function upsertCaption(index, driveFileId, name, caption, tags) {
  if (!index.images) index.images = [];
  let e = index.images.find((i) => i.drive_file_id === driveFileId);
  if (!e) {
    e = { drive_file_id: driveFileId, name, caption: "", tags: [], used_in: [], rest_until: {} };
    index.images.push(e);
  }
  if (name) e.name = name;
  e.caption = caption;
  e.tags = tags || [];
  return e;
}

function addDaysISO(dateISO, days) {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Marca uso no canal. restDays>0 → descanso; restDays<=0 → sem descanso (limpa a chave).
export function markUsed(index, driveFileId, post, dateISO, canal, restDays) {
  const e = (index.images || []).find((i) => i.drive_file_id === driveFileId);
  if (!e) return null;
  if (!Array.isArray(e.used_in)) e.used_in = [];
  if (!e.rest_until || typeof e.rest_until !== "object") e.rest_until = {};
  e.used_in.push({ post, date: dateISO, canal });
  if (restDays > 0) e.rest_until[canal] = addDaysISO(dateISO, restDays);
  else delete e.rest_until[canal];
  return e;
}

// Disponíveis para UM canal: ignora as chaves de descanso dos outros canais.
export function filterAvailable(index, canal, todayISO) {
  return (index.images || []).filter((e) => {
    const r = e.rest_until && e.rest_until[canal];
    return !r || r <= todayISO;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/editor/banco.test.js`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add scripts/editor/banco.js scripts/editor/banco.test.js
git commit -m "feat(banco): descanso por canal + normalize v1->v2 (funcoes puras)"
```

---

## Task 2: Não-regressão de `scanNew` / `upsertCaption` por `drive_file_id`

**Files:**
- Modify: `scripts/editor/banco.test.js` (adicionar testes)
- (implementação já feita na Task 1)

- [ ] **Step 1: Write the failing test**

Acrescentar ao final de `scripts/editor/banco.test.js`:

```js
import { scanNew, upsertCaption } from "./banco.js";

test("scanNew: filtra por extensão de imagem e por drive_file_id desconhecido", () => {
  const idx = normalizeIndex({ images: [{ drive_file_id: "1", name: "ja.jpg" }] });
  const driveFiles = [
    { drive_file_id: "1", name: "ja.jpg" },     // já indexada
    { drive_file_id: "2", name: "nova.png" },   // nova
    { drive_file_id: "3", name: "doc.pdf" },    // não-imagem
  ];
  const novos = scanNew(driveFiles, idx);
  assert.deepEqual(novos.map((f) => f.drive_file_id), ["2"]);
});

test("upsertCaption: cria entrada v2 por drive_file_id e atualiza legenda/tags", () => {
  const idx = { images: [] };
  upsertCaption(idx, "9", "palco.jpg", "Ramon no palco", ["palco"]);
  const e = idx.images[0];
  assert.equal(e.drive_file_id, "9");
  assert.equal(e.name, "palco.jpg");
  assert.equal(e.caption, "Ramon no palco");
  assert.deepEqual(e.tags, ["palco"]);
  assert.deepEqual(e.rest_until, {});
  // re-upsert atualiza sem duplicar
  upsertCaption(idx, "9", "palco.jpg", "Nova legenda", ["palco", "luz"]);
  assert.equal(idx.images.length, 1);
  assert.equal(idx.images[0].caption, "Nova legenda");
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `node --test scripts/editor/banco.test.js`
Expected: PASS (9 testes no total). Já passa — a Task 1 implementou as funções.

- [ ] **Step 3: Commit**

```bash
git add scripts/editor/banco.test.js
git commit -m "test(banco): nao-regressao scanNew/upsertCaption por drive_file_id"
```

---

## Task 3: Config `banco-imagens.yaml` + loader `banco-config.js`

**Files:**
- Create: `orquestracao/banco-imagens.yaml`
- Create: `scripts/editor/banco-config.js`
- Test: `scripts/editor/banco-config.test.js`
- Modify: `.gitignore`

- [ ] **Step 1: Criar o arquivo de config**

Criar `orquestracao/banco-imagens.yaml`:

```yaml
# Config do banco de imagens da marca — Dino Team
# Lida por: /novo-post (Passo 11m/16) e scripts/editor/banco-config.js
# Gravada por: /configurar-banco (campo pasta_raiz_id) e o usuário
# Versão: 1

drive:
  pasta_raiz_id: ""        # ID da pasta-raiz do Drive; vazio = seleção de imagem desligada

descanso_por_canal:        # dias que a imagem descansa no PRÓPRIO canal após uso; 0 = sem descanso
  instagram: 60
  email: 30                # declarado, ainda não consumido
  blog: 30                 # declarado, ainda não consumido
  ads: 0                   # 0 = sem descanso (sempre disponível)
```

- [ ] **Step 2: Write the failing test**

Criar `scripts/editor/banco-config.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBancoConfig, restDaysFor } from "./banco-config.js";

const YAML = `# comentário
drive:
  pasta_raiz_id: "1AbC"
descanso_por_canal:
  instagram: 60
  email: 30
  ads: 0
`;

test("parseBancoConfig: lê pasta_raiz_id e descanso por canal", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(c.drive.pasta_raiz_id, "1AbC");
  assert.equal(c.descanso_por_canal.instagram, 60);
  assert.equal(c.descanso_por_canal.email, 30);
  assert.equal(c.descanso_por_canal.ads, 0);
});

test("parseBancoConfig: pasta_raiz_id vazio vira string vazia", () => {
  const c = parseBancoConfig(`drive:\n  pasta_raiz_id: ""\n`);
  assert.equal(c.drive.pasta_raiz_id, "");
});

test("restDaysFor: devolve o valor do canal", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(restDaysFor(c, "instagram"), 60);
  assert.equal(restDaysFor(c, "ads"), 0);
});

test("restDaysFor: canal ausente cai no default 30", () => {
  const c = parseBancoConfig(YAML);
  assert.equal(restDaysFor(c, "comunidade"), 30);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test scripts/editor/banco-config.test.js`
Expected: FAIL — `banco-config.js` não existe.

- [ ] **Step 4: Write minimal implementation**

Criar `scripts/editor/banco-config.js`:

```js
// scripts/editor/banco-config.js
// Parser mínimo do banco-imagens.yaml (sem js-yaml — padrão do projeto).
// Estrutura conhecida: dois blocos de 1 nível (drive, descanso_por_canal).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/editor/ -> raiz do repo é dois níveis acima
const DEFAULT_PATH = resolve(__dirname, "../../orquestracao/banco-imagens.yaml");

const REST_DEFAULT = 30;

function stripQuotes(s) {
  return s.replace(/^["']|["']$/g, "");
}

// Parser linha-a-linha para o formato conhecido (chave de seção sem valor; itens com 2 espaços).
export function parseBancoConfig(text) {
  const cfg = { drive: { pasta_raiz_id: "" }, descanso_por_canal: {} };
  let section = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*$/, "").replace(/\s+$/, "");
    if (!line.trim()) continue;
    const indented = /^\s{2,}\S/.test(line);
    const m = line.trim().match(/^([\w]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, valRaw] = m;
    if (!indented) {
      section = key;
      if (valRaw) {
        // chave de topo com valor inline (não esperado, mas tolerante)
        section = null;
      }
      continue;
    }
    const val = stripQuotes(valRaw.trim());
    if (section === "drive") cfg.drive[key] = val;
    else if (section === "descanso_por_canal") cfg.descanso_por_canal[key] = parseInt(val, 10);
  }
  return cfg;
}

export function loadBancoConfig(path = DEFAULT_PATH) {
  if (!existsSync(path)) return { drive: { pasta_raiz_id: "" }, descanso_por_canal: {} };
  return parseBancoConfig(readFileSync(path, "utf8"));
}

// Dias de descanso de um canal; canal sem default explícito cai em 30.
export function restDaysFor(config, canal) {
  const v = config && config.descanso_por_canal && config.descanso_por_canal[canal];
  return Number.isFinite(v) ? v : REST_DEFAULT;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test scripts/editor/banco-config.test.js`
Expected: PASS (4 testes).

- [ ] **Step 6: Ignorar o cache local no git**

Acrescentar ao final de `.gitignore` (que hoje tem `node_modules/`, `*.log`, `.DS_Store`, `.superpowers/`, `.claude/worktrees/`):

```
.cache/
```

- [ ] **Step 7: Commit**

```bash
git add orquestracao/banco-imagens.yaml scripts/editor/banco-config.js scripts/editor/banco-config.test.js .gitignore
git commit -m "feat(banco): config banco-imagens.yaml + loader com restDaysFor por canal"
```

---

## Task 4: CLI `index-banco.js` — `mark --canal` + `available`

**Files:**
- Modify: `scripts/index-banco.js`
- Test: `scripts/editor/banco-cli.test.js` (criar)

Estado atual de `scripts/index-banco.js` (referência — ver subcomandos `scan`/`caption`/`mark`). A mudança: `mark` passa a exigir `--canal`, ganha default de `--rest` vindo da config quando omitido, e opera por `drive_file_id`; novo subcomando `available <dir> <canal>`.

- [ ] **Step 1: Write the failing test**

Criar `scripts/editor/banco-cli.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = resolve(fileURLToPath(import.meta.url), "../../index-banco.js");

function run(args, opts = {}) {
  return execFileSync("node", [CLI, ...args], { encoding: "utf8", ...opts });
}

async function fixtureIndex(images) {
  const dir = await mkdtemp(join(tmpdir(), "banco-"));
  await writeFile(join(dir, ".banco-index.json"), JSON.stringify({ version: 2, images }), "utf8");
  return dir;
}

test("mark sem --canal falha com exit != 0", async () => {
  const dir = await fixtureIndex([{ drive_file_id: "1", name: "x.jpg", rest_until: {} }]);
  assert.throws(() => run(["mark", dir, "1", "post-a"]), /canal/i);
});

test("mark --canal instagram --rest 60 grava no canal certo", async () => {
  const dir = await fixtureIndex([{ drive_file_id: "1", name: "x.jpg", used_in: [], rest_until: {} }]);
  run(["mark", dir, "1", "post-a", "--canal", "instagram", "--rest", "60"]);
  const idx = JSON.parse(await readFile(join(dir, ".banco-index.json"), "utf8"));
  const e = idx.images[0];
  assert.ok(e.rest_until.instagram, "deve ter rest_until.instagram");
  assert.equal(e.rest_until.email, undefined);
  assert.equal(e.used_in[0].canal, "instagram");
});

test("available <dir> instagram lista só os disponíveis no canal", async () => {
  const dir = await fixtureIndex([
    { drive_file_id: "1", name: "rest.jpg", rest_until: { instagram: "2099-01-01" } },
    { drive_file_id: "2", name: "free.jpg", rest_until: {} },
  ]);
  const out = run(["available", dir, "instagram"]).trim();
  assert.equal(out, "2\tfree.jpg");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/editor/banco-cli.test.js`
Expected: FAIL — `mark` ainda não exige `--canal`; `available` não existe.

- [ ] **Step 3: Write minimal implementation**

Substituir o conteúdo de `scripts/index-banco.js` por:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/editor/banco-cli.test.js`
Expected: PASS (3 testes).

- [ ] **Step 5: Rodar a suíte inteira (não-regressão do editor)**

Run: `npm test`
Expected: PASS — todos os `scripts/editor/*.test.js`, incluindo os do editor existentes.

- [ ] **Step 6: Commit**

```bash
git add scripts/index-banco.js scripts/editor/banco-cli.test.js
git commit -m "feat(banco): CLI mark --canal obrigatorio + subcomando available <canal>"
```

---

## Task 5: Registrar o MCP do Drive (`.mcp.json`)

**Files:**
- Create: `.mcp.json`

> Esta parte depende de serviço externo + OAuth — validada por **smoke manual**, não por teste automatizado.

- [ ] **Step 1: Criar `.mcp.json`**

Criar `.mcp.json` na raiz do worktree:

```json
{
  "mcpServers": {
    "google-drive": {
      "type": "http",
      "url": "https://drivemcp.googleapis.com/mcp"
    }
  }
}
```

- [ ] **Step 2: Smoke manual — registrar e autenticar**

Pedir ao usuário (não automatizável nesta sessão):

```
1. Reabra o Claude Code no projeto (o .mcp.json é lido na inicialização) e aprove o servidor MCP quando solicitado.
2. Rode no terminal:  claude mcp list
   Esperado: "google-drive" listado.
3. No primeiro uso de uma tool do Drive, conclua o login OAuth no navegador com a conta que tem acesso à pasta do banco.
```

Se o transporte `http` não conectar, testar `"type": "sse"` no lugar de `"http"` (mesma URL) e repetir o passo 2.

- [ ] **Step 3: Commit**

```bash
git add .mcp.json
git commit -m "chore(mcp): registra MCP oficial do Google Drive"
```

---

## Task 6: Skill `/configurar-banco`

**Files:**
- Create: `.claude/skills/configurar-banco/SKILL.md`

> Skill interativa que usa o MCP — validada por smoke manual. Sem teste automatizado (mockar o MCP daria falsa confiança).

- [ ] **Step 1: Criar a skill**

Criar `.claude/skills/configurar-banco/SKILL.md`:

````markdown
---
name: configurar-banco
description: Define qual pasta do Google Drive é o banco de imagens da marca. Lista as pastas do Drive via MCP, deixa o usuário escolher pelo nome e grava o pasta_raiz_id em orquestracao/banco-imagens.yaml. Use quando ainda não há banco configurado, ou para trocar a pasta-fonte. Requer o MCP do Drive (.mcp.json) autenticado.
---

# /configurar-banco

Aponta o banco de imagens da marca para uma pasta do Google Drive. Sem isso, o `/novo-post`
pula a seleção automática de imagem e o usuário dropa as fotos manualmente.

## Fluxo

| Passo | Ação | Entrega |
|---|---|---|
| 1 | Checar MCP do Drive | disponível ou orientação de setup |
| 2 | Listar pastas do Drive (MCP) | lista numerada |
| 3 | ⏸ usuário escolhe | folder ID |
| 4 | Gravar no YAML | `pasta_raiz_id` atualizado |

## Pipeline

### 1. Checar o MCP do Drive

Verifique se há tools do MCP `google-drive` disponíveis. Se não houver, oriente:

```
O MCP do Google Drive não está disponível. Confira:
- .mcp.json contém o servidor "google-drive".
- Reabra o Claude Code para carregar o .mcp.json e aprove o servidor.
- Rode `claude mcp list` e conclua o login OAuth no primeiro uso.
```

E pare (sem gravar nada).

### 2. Listar pastas do Drive

Use a tool de listagem/busca do MCP para listar pastas (`mimeType = 'application/vnd.google-apps.folder'`),
começando pela raiz e nas subpastas relevantes. Apresente numerado:

```
Pastas no seu Drive:
1. Dino Team / Banco de Imagens   (id: 1AbC...)
2. Dino Team / Bastidores         (id: 1DeF...)
3. ...

Qual é o banco de imagens da marca? (número, ou cole um ID/URL)
```

### 3. Escolha do usuário (⏸)

Aceite: número da lista, um folder ID cru, ou uma URL
`https://drive.google.com/drive/folders/<ID>` (extraia o trecho após `/folders/`, antes de `?`).
Resolva para `pasta_raiz_id`.

### 4. Gravar em orquestracao/banco-imagens.yaml

Se o arquivo não existir, crie-o com o bloco `descanso_por_canal` default
(instagram 60, email 30, blog 30, ads 0). Em qualquer caso, edite **só** a linha
`pasta_raiz_id:` dentro do bloco `drive:`, preservando o resto:

```yaml
drive:
  pasta_raiz_id: "<ID escolhido>"
```

Confirme inline:

```
Banco apontado para: <nome da pasta> (id: <ID>)
Gravado em orquestracao/banco-imagens.yaml.
Agora o /novo-post seleciona imagens automaticamente desse Drive.
```

## Critério de conclusão

- `orquestracao/banco-imagens.yaml` existe e tem `drive.pasta_raiz_id` não-vazio.
- O usuário viu a confirmação com o nome e o ID da pasta.
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/configurar-banco/SKILL.md
git commit -m "feat(skill): /configurar-banco aponta a pasta-raiz do Drive"
```

---

## Task 7: Atualizar o contrato do `arquivista` (eixo canal + Drive)

**Files:**
- Modify: `.claude/agents/arquivista.md`

- [ ] **Step 1: Atualizar a seção "Banco de imagens" dos princípios**

Em `.claude/agents/arquivista.md`, no bloco **Princípios da especialidade → Banco de imagens**, substituir a linha de "Respeito o descanso" e "Marcar, não mover" por versões por-canal:

Trocar:
```
- **Respeito o descanso.** Nunca sugere imagem com `rest_until` no futuro (espelho de `angulos-queimados`).
- **Marcar, não mover.** Uso é registrado no índice (`used_in` + `rest_until`); arquivos do banco nunca são movidos nem renomeados.
```
Por:
```
- **Respeito o descanso por canal.** Nunca sugere imagem com `rest_until[canal]` no futuro — para o canal pedido. A mesma imagem pode estar livre em outro canal que ainda não a usou.
- **Marcar por canal, não mover.** Uso é registrado no índice (`used_in` com `canal` + `rest_until[canal]`); arquivos do Drive nunca são movidos nem renomeados.
- **Drive é a fonte; o índice é o estado.** Imagens vêm da pasta-raiz do Drive (MCP). Legenda por **thumbnail** (mais barato que o original), uma vez, e persista. O índice é por `drive_file_id` (chave estável).
```

- [ ] **Step 2: Atualizar a lista de tarefas do domínio banco**

Substituir os itens 7–9 ("indexar"/"selecionar"/"marcar") por:

```
7. **indexar (lazy)** — receber candidatos do Drive (MCP, busca por tema na pasta-raiz), filtrar os já indexados (`scanNew`), baixar o **thumbnail** dos novos, legendar por visão e gravar via `node scripts/index-banco.js caption <dir> <drive_file_id> <name> "<legenda>" <tags...>`.
8. **selecionar** — para cada drop zone, considerar só os disponíveis no canal (`node scripts/index-banco.js available <dir> <canal>`), ranquear por aderência à copy/legenda/tags e gravar `design/suggestions.json` no post.
9. **marcar** — registrar uso de cada imagem no canal: `node scripts/index-banco.js mark <dir> <drive_file_id> <slug> --canal <canal>` (descanso vem da config por canal).
```

- [ ] **Step 3: Atualizar a seção "Recebo"**

Trocar as linhas de `selecionar`/`marcar` para incluir `canal`:

```
- Para `selecionar`: `canal`, caminho do `copy.md`, caminho do `estilo.md`, pasta de saída do post, pasta-raiz do Drive.
- Para `marcar`: `canal`, lista de `drive_file_id` usados + slug do post.
```

- [ ] **Step 4: Atualizar o manifesto de saída do domínio banco**

No bloco `<manifesto> tarefa: <indexar|selecionar|marcar>`, acrescentar a linha `canal:`:

```
canal: <canal>                                      (selecionar|marcar)
```

- [ ] **Step 5: Commit**

```bash
git add .claude/agents/arquivista.md
git commit -m "docs(arquivista): banco por canal + fonte Drive/MCP + legenda por thumbnail"
```

---

## Task 8: Ligar o fluxo no `/novo-post` (Passos 11m e 16)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Reescrever o "Pré-preenchimento de imagens" do Passo 11**

Em `.claude/skills/novo-post/SKILL.md`, no Passo 11, substituir o bloco **#### Pré-preenchimento de imagens (condicional)** inteiro por:

````markdown
#### Pré-preenchimento de imagens (condicional)

Carregue a pasta-raiz do Drive de `orquestracao/banco-imagens.yaml` (campo `drive.pasta_raiz_id`).

- Se `pasta_raiz_id` estiver **vazio** → pule a seleção; o usuário dropa as fotos manualmente no Dino Editor (sem erro).
- Se o MCP do Drive estiver indisponível → avise ("banco de imagens indisponível; siga dropando manual") e continue o post (a entrega nunca trava).
- Caso contrário, acione `arquivista`:

```
Tarefa: indexar (lazy) e depois selecionar.

Inputs:
- canal: instagram
- Pasta-raiz do Drive: <pasta_raiz_id de banco-imagens.yaml>
- copy.md: export/conteudos/<formato>/<data>-<slug>/copy.md
- estilo.md: <caminho do estilo.md>
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/

Saída: design/suggestions.json com a melhor imagem DISPONÍVEL NO CANAL instagram por drop zone.
```
````

- [ ] **Step 2: Reescrever a "Marcação de uso" do Passo 16**

No Passo 16, substituir o bloco **#### Marcação de uso de materiais (condicional)** por:

````markdown
#### Marcação de uso de materiais (condicional)

Se houve pré-preenchimento via banco, marque as imagens efetivamente presentes no preview final
(não as meramente sugeridas — uma foto trocada no Editor não deve queimar) acionando `arquivista`:

```
Tarefa: marcar.

Inputs:
- canal: instagram
- Pasta-raiz do Drive: <pasta_raiz_id de banco-imagens.yaml>
- drive_file_id usados: <lista dos IDs efetivamente aplicados nas drop zones>
- Post: <data>-<slug>
```

Isso registra `used_in` (com `canal`) + `rest_until.instagram` no índice — a foto descansa só no
Instagram (60 dias, da config) e permanece livre nos demais canais.
````

- [ ] **Step 3: Atualizar a tabela de Fluxo (linha 11m)**

Na tabela `## Fluxo`, trocar a coluna "Recebe" da linha 11m de `banco, copy, estilo` para
`canal, drive-raiz, copy, estilo`.

- [ ] **Step 4: Verificação de coerência**

Run: `grep -n "banco-imagens.yaml\|drive_file_id\|canal: instagram" .claude/skills/novo-post/SKILL.md`
Expected: aparições nos Passos 11m e 16 (config lida, canal fixado em instagram, IDs por drive_file_id).

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "feat(novo-post): seleciona/marca imagem do Drive por canal (Passos 11m/16)"
```

---

## Task 9: Verificação final e smoke

**Files:** nenhum (verificação)

- [ ] **Step 1: Suíte completa verde**

Run: `npm test`
Expected: PASS — `banco.test.js` (9), `banco-config.test.js` (4), `banco-cli.test.js` (3), e os testes pré-existentes do editor.

- [ ] **Step 2: Smoke manual da regra-chave (sem Drive)**

Run:
```bash
node -e '
import("./scripts/editor/banco.js").then((m) => {
  const idx = m.normalizeIndex({ images: [{ drive_file_id: "1", name: "x.jpg" }] });
  m.markUsed(idx, "1", "p", "2026-06-07", "instagram", 60);
  console.log("instagram disp:", m.filterAvailable(idx, "instagram", "2026-06-07").length); // 0
  console.log("email disp:", m.filterAvailable(idx, "email", "2026-06-07").length);         // 1
});
'
```
Expected: `instagram disp: 0` e `email disp: 1` — prova "livre em outro canal".

- [ ] **Step 3: Smoke manual do MCP + skill (com o usuário)**

Checklist para o usuário:
```
1. `claude mcp list` mostra "google-drive".
2. /configurar-banco → escolher a pasta → banco-imagens.yaml com pasta_raiz_id preenchido.
3. /novo-post carrossel <tema> → Passo 11m pré-preenche drop zones com fotos do Drive.
4. Finalizar o post → conferir no .banco-index.json da pasta: used_in com canal:instagram e rest_until.instagram ~60 dias à frente.
```

- [ ] **Step 4: Commit final (se houver ajuste de smoke) e fim**

Nenhuma alteração de código esperada aqui. Se a verificação do Passo 1/2 exigir correção, corrija no
arquivo apontado, re-rode `npm test`, e faça um commit `fix(banco): ...` correspondente.

---

## Self-Review (preenchido pelo autor do plano)

**Spec coverage:**
- Conexão MCP Drive → Task 5. ✓
- Seleção por tema/estilo (descoberta MCP + visão thumbnail) → Task 7 (contrato arquivista) + Task 8 (acionamento). ✓
- Descanso por canal → Tasks 1, 4 (core + CLI), testes-chave. ✓
- Escopo só Instagram, schema já por-canal → Task 8 fixa `canal: instagram`; core é genérico. ✓
- Pasta-raiz fixa configurada uma vez → Task 3 (config) + Task 6 (/configurar-banco). ✓
- Indexação lazy → Task 7 item 7 + Task 8 Passo 11m. ✓
- Descanso configurável por canal (ig 60, ads 0) → Task 3 (config + restDaysFor). ✓
- Migração tolerante v1→v2 → Task 1 (`normalizeIndex`, testado). ✓
- Error handling (pasta vazia, MCP off, sem disponíveis, drive renomeia) → Task 8 Passo 11m + Task 1 (chave drive_file_id). ✓
- Testes (todos os casos #1–#9 da spec) → Tasks 1, 2, 4. ✓

**Placeholder scan:** sem TBD/TODO; todo passo de código mostra o código.

**Type consistency:** assinaturas consistentes entre tasks — `filterAvailable(index, canal, todayISO)`, `markUsed(index, driveFileId, post, dateISO, canal, restDays)`, `normalizeIndex(index)`, `restDaysFor(config, canal)`, `loadBancoConfig(path?)`, `scanNew(driveFiles, index)`, `upsertCaption(index, driveFileId, name, caption, tags)`. CLI: `mark <dir> <drive_file_id> <post> --canal <c> [--rest N]`, `available <dir> <canal>`.
