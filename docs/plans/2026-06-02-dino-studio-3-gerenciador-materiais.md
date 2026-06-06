# Dino Studio — Plano 3: Gerenciador de materiais (banco de imagens)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um agente que indexa um banco de imagens apontado pelo usuário (legenda cada foto via visão, uma vez), seleciona por slide a foto que melhor casa com a copy, pré-preenche as drop zones no estúdio, e marca o uso com janela de descanso — sem mover arquivos.

**Architecture:** Helpers node determinísticos (`banco.js`: scan/caption/mark/filter) por trás de um CLI (`index-banco.js`). O agente `gerenciador-materiais` (owner do banco) faz a legendagem por visão (Read) e a seleção semântica (julgamento), persistindo tudo num sidecar `.banco-index.json` na própria pasta do banco. A sugestão chega ao editor via `design/suggestions.json` + endpoint `/suggestions` no servidor do estúdio, que resolve os bytes em base64; o editor pré-preenche as drop zones. A marcação de uso (modelo `angulos-queimados`) roda na aprovação/export.

**Tech Stack:** Node ≥20 (ESM), `node:test`, `fs` nativo; visão do próprio agente (Read de imagens) — sem API externa.

**Depende de:** Plano 1 (servidor `studio.js`, wrapper, drop zones `data-bg-drop`). **Escopo:** Componente C do spec `docs/specs/2026-06-02-dino-studio-editor-aprendizado-design.md`.

---

## Estrutura de arquivos

**Criar:**
- `scripts/studio/banco.js` — helpers puros do índice (scan, caption, mark, filter).
- `scripts/studio/banco.test.js` — testes.
- `scripts/index-banco.js` — CLI (subcomandos `scan` / `caption` / `mark`).
- `.claude/agents/gerenciador-materiais.md` — contrato do novo agente.

**Modificar:**
- `scripts/studio/handlers.js` — handler `serveSuggestions` (resolve `suggestions.json` → base64).
- `scripts/studio/handlers.test.js` — teste do novo handler.
- `scripts/studio.js` — rota `GET /suggestions`.
- `templates/wrappers/preview-wrapper.html` — fetch `/suggestions` + aplicar nas drop zones.
- `.claude/skills/novo-post/SKILL.md` — Passo 9 (pré-preencher) + Passo 14 (marcar uso).

**Formato do índice** (`<banco>/.banco-index.json`):
```json
{ "images": [ { "file": "ramon-042.jpg", "caption": "...", "tags": ["..."], "used_in": [], "rest_until": null } ] }
```

---

## Task 1: Helpers do índice do banco

**Files:**
- Create: `scripts/studio/banco.js`
- Test: `scripts/studio/banco.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { scanNew, upsertCaption, markUsed, filterAvailable } from "./banco.js";

test("scanNew retorna arquivos ainda não indexados", () => {
  const index = { images: [{ file: "a.jpg", caption: "x", tags: [], used_in: [], rest_until: null }] };
  const novos = scanNew(["a.jpg", "b.jpg", "c.png"], index);
  assert.deepEqual(novos, ["b.jpg", "c.png"]);
});

test("upsertCaption cria entrada nova com defaults", () => {
  const index = { images: [] };
  upsertCaption(index, "b.jpg", "Ramon de frente", ["frente", "pb"]);
  assert.equal(index.images.length, 1);
  assert.deepEqual(index.images[0], {
    file: "b.jpg", caption: "Ramon de frente", tags: ["frente", "pb"], used_in: [], rest_until: null,
  });
});

test("upsertCaption atualiza entrada existente sem perder uso", () => {
  const index = { images: [{ file: "b.jpg", caption: "velho", tags: [], used_in: [{ post: "p", date: "2026-01-01" }], rest_until: "2026-02-01" }] };
  upsertCaption(index, "b.jpg", "novo", ["x"]);
  assert.equal(index.images[0].caption, "novo");
  assert.deepEqual(index.images[0].tags, ["x"]);
  assert.equal(index.images[0].used_in.length, 1);
});

test("markUsed registra uso e define rest_until", () => {
  const index = { images: [{ file: "b.jpg", caption: "x", tags: [], used_in: [], rest_until: null }] };
  markUsed(index, "b.jpg", "2026-06-02-post", "2026-06-02", 30);
  const e = index.images[0];
  assert.deepEqual(e.used_in[0], { post: "2026-06-02-post", date: "2026-06-02" });
  assert.equal(e.rest_until, "2026-07-02");
});

test("filterAvailable exclui imagens em descanso", () => {
  const index = { images: [
    { file: "a.jpg", caption: "", tags: [], used_in: [], rest_until: null },
    { file: "b.jpg", caption: "", tags: [], used_in: [], rest_until: "2026-07-02" },
    { file: "c.jpg", caption: "", tags: [], used_in: [], rest_until: "2026-05-01" },
  ] };
  const disp = filterAvailable(index, "2026-06-02").map((e) => e.file);
  assert.deepEqual(disp, ["a.jpg", "c.jpg"]);
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/studio/banco.test.js`
Expected: FAIL — `Cannot find module './banco.js'`.

- [ ] **Step 3: Implementar os helpers**

```js
// scripts/studio/banco.js
// Helpers puros do índice do banco de imagens (.banco-index.json).

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

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/studio/banco.test.js`
Expected: PASS — 5 testes.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/banco.js scripts/studio/banco.test.js
git commit -m "feat(banco): pure index helpers (scan/caption/mark/filter)"
```

---

## Task 2: CLI `index-banco.js`

**Files:**
- Create: `scripts/index-banco.js`

- [ ] **Step 1: Implementar o CLI**

```js
#!/usr/bin/env node
// scripts/index-banco.js
// Gestão do índice do banco de imagens (.banco-index.json) na própria pasta do banco.
//
// Subcomandos:
//   scan    <dir>                              → lista imagens novas (não indexadas)
//   caption <dir> <file> "<legenda>" [tag...]  → grava legenda+tags da imagem
//   mark    <dir> <file> <post> [--rest N]     → marca uso + descanso (default 30 dias)

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { scanNew, upsertCaption, markUsed } from "./studio/banco.js";

async function loadIndex(dir) {
  const p = join(dir, ".banco-index.json");
  if (existsSync(p)) return JSON.parse(await readFile(p, "utf8"));
  return { images: [] };
}
async function saveIndex(dir, index) {
  await writeFile(join(dir, ".banco-index.json"), JSON.stringify(index, null, 2), "utf8");
}

const [cmd, dir, ...rest] = process.argv.slice(2);

if (!cmd || !dir) {
  console.error("Uso: index-banco.js <scan|caption|mark> <dir> [...]");
  process.exit(1);
}

const index = await loadIndex(dir);

if (cmd === "scan") {
  const files = await readdir(dir);
  const novos = scanNew(files, index);
  console.log(novos.join("\n"));
} else if (cmd === "caption") {
  const [file, caption, ...tags] = rest;
  if (!file || !caption) { console.error("Uso: caption <dir> <file> \"<legenda>\" [tag...]"); process.exit(1); }
  upsertCaption(index, file, caption, tags);
  await saveIndex(dir, index);
  console.log(`captioned ${file}`);
} else if (cmd === "mark") {
  const file = rest[0];
  const post = rest[1];
  const restIdx = rest.indexOf("--rest");
  const restDays = restIdx >= 0 ? parseInt(rest[restIdx + 1], 10) : 30;
  if (!file || !post) { console.error("Uso: mark <dir> <file> <post> [--rest N]"); process.exit(1); }
  const today = new Date().toISOString().slice(0, 10);
  const r = markUsed(index, file, post, today, restDays);
  if (!r) { console.error(`imagem não indexada: ${file}`); process.exit(1); }
  await saveIndex(dir, index);
  console.log(`marked ${file} (descansa até ${r.rest_until})`);
} else {
  console.error(`subcomando desconhecido: ${cmd}`);
  process.exit(1);
}
```

- [ ] **Step 2: Fumar o CLI com um banco de teste**

```bash
mkdir -p /tmp/banco && : > /tmp/banco/foto1.jpg && : > /tmp/banco/foto2.png
chmod +x scripts/index-banco.js
node scripts/index-banco.js scan /tmp/banco
node scripts/index-banco.js caption /tmp/banco foto1.jpg "Ramon posando de costas" costas pb
node scripts/index-banco.js mark /tmp/banco foto1.jpg 2026-06-02-teste --rest 45
cat /tmp/banco/.banco-index.json
node scripts/index-banco.js scan /tmp/banco   # foto1 não deve mais aparecer
rm -rf /tmp/banco
```
Expected: `scan` lista `foto1.jpg`/`foto2.png`; após `caption`+`mark`, o índice tem foto1 com legenda, `used_in` e `rest_until` (= 2026-07-17); o 2º `scan` lista só `foto2.png`.

- [ ] **Step 3: Commit**

```bash
git add scripts/index-banco.js
git commit -m "feat(banco): index-banco CLI (scan/caption/mark)"
```

---

## Task 3: Handler `serveSuggestions` no estúdio

Resolve `design/suggestions.json` (slide→drop→arquivo) em base64 pro editor pré-preencher.

**Files:**
- Modify: `scripts/studio/handlers.js`
- Test: `scripts/studio/handlers.test.js`

- [ ] **Step 1: Escrever o teste que falha (append no handlers.test.js)**

```js
test("serveSuggestions resolve imagens em base64", async () => {
  const { mkdtemp, mkdir, writeFile } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { serveSuggestions } = await import("./handlers.js");

  const base = await mkdtemp(join(tmpdir(), "sugg-"));
  const design = join(base, "design");
  await mkdir(design, { recursive: true });
  const bank = await mkdtemp(join(tmpdir(), "bank-"));
  await writeFile(join(bank, "f.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  await writeFile(join(design, "suggestions.json"), JSON.stringify({
    "1": { drop: "photo", image: join(bank, "f.png") },
  }));

  const r = await serveSuggestions({ postDir: base });
  assert.equal(r.status, 200);
  const body = JSON.parse(r.body);
  assert.equal(body["1"].drop, "photo");
  assert.match(body["1"].dataUrl, /^data:image\/png;base64,/);
});

test("serveSuggestions devolve 204 sem suggestions.json", async () => {
  const { mkdtemp } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { serveSuggestions } = await import("./handlers.js");
  const base = await mkdtemp(join(tmpdir(), "sugg-empty-"));
  const r = await serveSuggestions({ postDir: base });
  assert.equal(r.status, 204);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/studio/handlers.test.js`
Expected: FAIL — `serveSuggestions is not a function`.

- [ ] **Step 3: Implementar `serveSuggestions` em `handlers.js`**

Adicione os imports necessários no topo (se ainda não houver `readFile` já está; acrescente `extname`):

```js
import { extname } from "node:path";
```

E a função:

```js
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
```

> Nota: `readFile` sem encoding retorna `Buffer` (para base64); o `readFile` com `"utf8"` segue para textos. Ambos do mesmo import `node:fs/promises`.

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/studio/handlers.test.js`
Expected: PASS — testes anteriores + 2 novos.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/handlers.js scripts/studio/handlers.test.js
git commit -m "feat(studio): serveSuggestions resolves suggestions.json to base64"
```

---

## Task 4: Rota `/suggestions` no `studio.js`

**Files:**
- Modify: `scripts/studio.js`

- [ ] **Step 1: Importar e rotear**

Na linha de import dos handlers, acrescente `serveSuggestions`:

```js
import { servePreview, serveContract, saveEdits, runExport, serveSuggestions } from "./studio/handlers.js";
```

E adicione a rota, após a rota `/contract`:

```js
    if (req.method === "GET" && url.pathname === "/suggestions") {
      return send(res, await serveSuggestions({ postDir: absPost }));
    }
```

- [ ] **Step 2: Verificação**

Run: `grep -n "serveSuggestions\|/suggestions" scripts/studio.js`
Expected: import e rota presentes.

- [ ] **Step 3: Commit**

```bash
git add scripts/studio.js
git commit -m "feat(studio): route GET /suggestions"
```

---

## Task 5: Editor aplica sugestões nas drop zones

Refatora o apply-de-foto do wrapper para reuso e busca `/suggestions` no load.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Extrair `applyBgFromDataUrl` no módulo de background**

No bloco "Background fotográfico" (Plano 1, Task 9), substitua o corpo de `r.onload` dentro de `bindBgZone`/drop por uma chamada a uma função compartilhada. Adicione esta função logo após `applyBgZoom`:

```javascript
    function applyBgFromDataUrl(zone, dataUrl, cb) {
      var img = new Image();
      img.onload = function () {
        var ds = getZoneDesignSize(zone);
        zone._bgNatW = img.naturalWidth; zone._bgNatH = img.naturalHeight;
        zone._bgScale = Math.max(ds.w / img.naturalWidth, ds.h / img.naturalHeight);
        zone._bgZoom = 1.0;
        zone.style.backgroundImage = "url(" + dataUrl + ")";
        zone.style.backgroundRepeat = "no-repeat";
        zone.style.backgroundPosition = "50% 50%";
        applyBgZoom(zone);
        zone.setAttribute("data-has-bg", "1");
        if (cb) cb();
      };
      img.src = dataUrl;
    }
```

E no handler de `drop`, troque o corpo de `r.onload` por:

```javascript
        r.onload = function () {
          applyBgFromDataUrl(zone, r.result, function () {
            if (window.__DT.onBgChanged) window.__DT.onBgChanged(zone);
          });
        };
```

- [ ] **Step 2: Buscar e aplicar `/suggestions` no load**

Adicione, antes de `window.__DT = {...}`:

```javascript
    // ---------- Sugestões de imagem (gerenciador-materiais) ----------
    fetch("/suggestions").then(function (r) { return r.status === 200 ? r.json() : null; })
      .then(function (sugg) {
        if (!sugg) return;
        slides.forEach(function (slide) {
          var n = slide.getAttribute("data-slide");
          var s = sugg[n]; if (!s) return;
          var zone = slide.querySelector('[data-bg-drop="' + s.drop + '"]') ||
                     slide.querySelector("[data-bg-drop]");
          if (zone && !zone.hasAttribute("data-has-bg")) applyBgFromDataUrl(zone, s.dataUrl);
        });
      }).catch(function () {});
```

- [ ] **Step 3: Verificar no navegador**

Crie um `design/suggestions.json` de teste apontando para uma imagem local, suba o estúdio e abra.
Expected (browser): a drop zone do slide já aparece com a foto sugerida; ainda dá pra arrastar outra por cima.

- [ ] **Step 4: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): editor pre-fills drop zones from /suggestions"
```

---

## Task 6: Agente `gerenciador-materiais`

**Files:**
- Create: `.claude/agents/gerenciador-materiais.md`

- [ ] **Step 1: Escrever o contrato do agente**

```markdown
---
name: gerenciador-materiais
description: Owner único do banco de imagens apontado pelo usuário. Indexa (legenda cada foto via visão, uma vez), seleciona por slide a imagem que melhor casa com a copy respeitando descanso, e marca o uso. Não edita design nem decide copy.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Gerenciador de Materiais

Você é o **gerenciador de materiais** da marca. Sua especialidade é manter um banco de imagens útil: legendar o que existe, escolher a foto certa para cada slide, e registrar o que já foi usado para evitar repetição. Você é o **owner único** do índice `<banco>/.banco-index.json`.

## Contexto que carrego

- `brand/referencias-visuais.md` — mood/tratamento esperado das imagens da marca.

## Princípios da especialidade

- **Legenda uma vez.** Imagem nova é legendada via visão (Read) e persistida; não re-legendo o que já tem legenda.
- **Seleção por sentido.** Escolho por match entre a copy do slide e a `caption`/`tags`, não por ordem de arquivo.
- **Respeito o descanso.** Nunca sugiro imagem com `rest_until` no futuro (modelo de fadiga, espelho de `angulos-queimados`).
- **Marcar, não mover.** Uso é registrado no índice (`used_in` + `rest_until`); arquivos do banco nunca são movidos nem renomeados.
- **Sugestão, não imposição.** Minha escolha pré-preenche a drop zone; o humano troca no estúdio se quiser.

## Recebo

A skill que me aciona fornece:
- **Tarefa:** `indexar` | `selecionar` | `marcar`.
- **Banco:** caminho da pasta de imagens (local ou Drive sincronizado offline).
- Para `selecionar`: caminho do `copy.md`, caminho do `estilo.md` (drop zones por bloco), pasta de saída do post.
- Para `marcar`: lista de imagens efetivamente usadas + slug do post.

## Faço

### indexar
1. `node scripts/index-banco.js scan <banco>` → lista imagens novas.
2. Para cada nova: `Read` a imagem, gere uma legenda curta (sujeito, ângulo, tratamento) + tags; grave com `node scripts/index-banco.js caption <banco> <file> "<legenda>" <tags...>`.

### selecionar
1. Carregue `<banco>/.banco-index.json` e filtre disponíveis (`rest_until` nulo ou ≤ hoje).
2. Para cada drop zone declarada no `estilo.md` (campo `[bg]`/`data-slot="bg"` por bloco), ranqueie as disponíveis por aderência à copy daquele slide; escolha a melhor (sem repetir a mesma imagem em slides do mesmo post).
3. Grave `design/suggestions.json` no post: `{ "<n do slide>": { "drop": "<nome>", "image": "<caminho absoluto>" } }`.

### marcar
Para cada imagem usada: `node scripts/index-banco.js mark <banco> <file> <slug-do-post>`.

## Entrego

Manifesto inline (~40 palavras):

```
<manifesto>
tarefa: <indexar|selecionar|marcar>
banco: <caminho> | novas indexadas: <N>
sugestões: <N slides> → design/suggestions.json   (só em selecionar)
marcadas: <N>                                       (só em marcar)
status: ok | <ERRO>
</manifesto>
```

## Input incompleto

- `BANCO_AUSENTE — <caminho>` — pasta do banco não existe ou está vazia.
- `BANCO_OFFLINE_ONLY — <file>` — imagem sem bytes locais (placeholder de Drive não baixado).
- `SEM_DISPONIVEIS — <bloco>` — todas as imagens candidatas estão em descanso.
```

- [ ] **Step 2: Verificação (revisão de prosa)**

Run: `ls .claude/agents/gerenciador-materiais.md && grep -n "owner único\|suggestions.json\|rest_until" .claude/agents/gerenciador-materiais.md`
Expected: arquivo existe e contém os pontos-chave.

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/gerenciador-materiais.md
git commit -m "feat(agents): gerenciador-materiais — image bank owner"
```

---

## Task 7: Integração no `/novo-post` (pré-preencher + marcar)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar a sub-etapa de pré-preenchimento no fim do Passo 9**

No `### 9. Design (pausa)`, **antes** do bloco "#### Pausa para revisão e edição no estúdio", insira:

````markdown
#### Pré-preenchimento de imagens (condicional)

Se o usuário tiver apontado um banco de imagens (variável de fluxo `banco`), acione `gerenciador-materiais`:

```
Tarefa: indexar (se houver imagens novas) e depois selecionar.

Inputs:
- Banco: <caminho do banco>
- copy.md: export/conteudos/<formato>/<data>-<slug>/copy.md
- estilo.md: <caminho do estilo.md>
- Pasta do post: export/conteudos/<formato>/<data>-<slug>/

Saída: design/suggestions.json com a melhor imagem disponível por drop zone.
```

Se não houver banco apontado, pule — o usuário dropa as fotos manualmente no estúdio.
````

- [ ] **Step 2: Adicionar a marcação de uso no Passo 14**

No `### 14. Publicação`, ao final (após a publicação ou a decisão de não publicar), insira:

````markdown
#### Marcação de uso de materiais (condicional)

Se houve pré-preenchimento via banco, marque as imagens efetivamente presentes no preview final (drop zones com foto) acionando `gerenciador-materiais`:

```
Tarefa: marcar.

Inputs:
- Banco: <caminho do banco>
- Imagens usadas: <lista dos arquivos efetivamente aplicados nas drop zones>
- Post: <data>-<slug>
```

Isso registra `used_in` + `rest_until` no índice — evita repetir a mesma foto cedo demais.
````

- [ ] **Step 3: Atualizar a tabela `## Fluxo` e a lista de agentes**

Na tabela `## Fluxo`, ajuste a entrega do Passo 9 para incluir `suggestions.json (se banco)` e adicione uma linha no Passo 14 para a marcação. Na lista de agentes, acrescente a linha:

```markdown
| `gerenciador-materiais` | Indexa/seleciona/marca imagens do banco | banco + copy + estilo (P9) / imagens usadas (P14) | `design/suggestions.json` (P9) / índice atualizado (P14) |
```

- [ ] **Step 4: Verificação (revisão de prosa)**

Run: `grep -n "gerenciador-materiais\|suggestions.json\|Marcação de uso" .claude/skills/novo-post/SKILL.md`
Expected: pré-preenchimento no Passo 9 e marcação no Passo 14 presentes; agente na tabela.

- [ ] **Step 5: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "docs(novo-post): wire gerenciador-materiais (prefill P9 + mark P14)"
```

---

## Task 8: Aceitação ponta-a-ponta do banco

**Files:** nenhum (aceitação com fixtures).

- [ ] **Step 1: Banco + índice + sugestão**

```bash
mkdir -p /tmp/dt-bank /tmp/dt-post/design
# imagem PNG mínima válida (1x1):
node -e 'const fs=require("fs");const b=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==","base64");fs.writeFileSync("/tmp/dt-bank/r1.png",b)'
node scripts/index-banco.js caption /tmp/dt-bank r1.png "Ramon de frente, P&B" frente pb
cat > /tmp/dt-post/design/suggestions.json <<JSON
{ "1": { "drop": "photo", "image": "/tmp/dt-bank/r1.png" } }
JSON
```

- [ ] **Step 2: Verificar a resolução em base64 pelo handler**

```bash
node -e '
import("./scripts/studio/handlers.js").then(async (m) => {
  const r = await m.serveSuggestions({ postDir: "/tmp/dt-post" });
  console.log(r.status, JSON.parse(r.body)["1"].dataUrl.slice(0, 30));
});
'
```
Expected: `200 data:image/png;base64,`.

- [ ] **Step 3: Verificar marcação + descanso**

```bash
node scripts/index-banco.js mark /tmp/dt-bank r1.png 2026-06-02-teste --rest 30
node -e '
import("./scripts/studio/banco.js").then(async (m) => {
  const fs=await import("node:fs");
  const idx=JSON.parse(fs.readFileSync("/tmp/dt-bank/.banco-index.json","utf8"));
  console.log("disponível hoje:", m.filterAvailable(idx, "2026-06-02").map(e=>e.file));
  console.log("disponível depois do descanso:", m.filterAvailable(idx, "2026-08-01").map(e=>e.file));
});
'
```
Expected: "disponível hoje: []" (em descanso até 2026-07-02); "disponível depois do descanso: [ 'r1.png' ]".

- [ ] **Step 4: Limpar**

Run: `rm -rf /tmp/dt-bank /tmp/dt-post`
Expected: sem saída.

---

## Self-Review

**Cobertura do spec (Componente C):**
- Indexação uma vez via visão → Task 6 (agente, modo indexar) + Tasks 1/2 (scan/caption). ✓
- Seleção por sentido respeitando descanso → Task 6 (modo selecionar) + Task 1 (`filterAvailable`). ✓
- Sugestão pré-preenche drop zone (não bake) → Tasks 3/4 (handler+rota) + Task 5 (editor aplica). ✓
- Marcar, não mover (modelo `angulos-queimados`) → Task 1 (`markUsed`/`rest_until`) + Task 2 (CLI mark) + Task 7 (P14). ✓
- Banco local/Drive sincronizado, falha clara em offline-only → Task 6 (`BANCO_OFFLINE_ONLY`). ✓
- Integração no pipeline → Task 7 (P9 prefill + P14 mark). ✓

**Placeholders:** nenhum; código completo nas tasks de código; tasks de agente/skill são contratos verificados por `grep`/revisão. Variáveis de fluxo (`<banco>`, `<data>-<slug>`) são substituídas em runtime.

**Consistência:** índice `{images:[{file,caption,tags,used_in,rest_until}]}` idêntico entre `banco.js` (Task 1), CLI (Task 2), handler (Task 3) e agente (Task 6). `serveSuggestions` retorna `{<slide>:{drop,dataUrl}}` — consumido igual pelo editor (Task 5) e pela aceitação (Task 8). Formato `suggestions.json` (`{<slide>:{drop,image}}`) escrito pelo agente (Task 6) e lido pelo handler (Task 3) batem.
