# Dino Studio — Plano 1: Servidor `studio.js` + Editor reescrito

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o ciclo "preview no Claude Design → ajuste via agente designer → reanexar arquivo" por uma sessão de estúdio local: um servidor node leve serve um editor canvas preso-ao-contrato, e ao salvar grava `preview.html` + `edits.json` direto no disco — edição visual com zero token.

**Architecture:** Quatro módulos node testáveis (`parse-estilo`, `validate-edits`, `handlers`) por trás de um entry CLI/HTTP (`studio.js`), mais a reescrita do wrapper `preview-wrapper.html` num editor com seleção de elemento, painel lateral preso aos slots do `estilo.md`, guias inteligentes de alinhamento, drop de foto e botão Salvar que faz `POST /save`. O mapeamento DOM→contrato é determinístico via `data-block`/`data-slot`, exigindo tagging nos templates e no contrato do agente `designer`.

**Tech Stack:** Node ≥20 (ESM), módulo de teste embutido `node:test` + `node:assert` (zero dependência nova), `http`/`fs` nativos, Puppeteer (já instalado, reusado pelo `export-png.js`), HTML/CSS/JS vanilla no wrapper.

**Escopo deste plano:** Componentes **A** (editor) + **D** (servidor) do spec `docs/specs/2026-06-02-dino-studio-editor-aprendizado-design.md`. O loop de aprendizado (B) e o gerenciador de materiais (C) são Planos 2 e 3, separados.

**Contrato de saída que este plano produz (consumido pelo Plano 2):** `export/conteudos/<formato>/<data>-<slug>/design/edits.json`, com o schema definido na Task 3.

---

## Estrutura de arquivos

**Criar:**
- `scripts/studio.js` — entry CLI + servidor HTTP (wiring fino).
- `scripts/studio/parse-estilo.js` — parser `estilo.md` → contrato JSON (blocos + slots).
- `scripts/studio/parse-estilo.test.js` — testes do parser.
- `scripts/studio/validate-edits.js` — validação do payload de edição.
- `scripts/studio/validate-edits.test.js` — testes da validação.
- `scripts/studio/handlers.js` — handlers puros das rotas (serve/contract/save/export).
- `scripts/studio/handlers.test.js` — testes dos handlers.

**Modificar:**
- `package.json` — adicionar scripts `studio` e `test`.
- `templates/wrappers/preview-wrapper.html` — reescrita completa (editor).
- `templates/social-media/carrossel/estilos/editorial/slide.html` — adicionar `data-block`/`data-slot`.
- `templates/social-media/carrossel/estilos/layout-dividido/slide.html` — idem.
- `templates/social-media/carrossel/estilos/treino-dino/slide.html` — idem.
- `.claude/agents/designer.md` — adicionar a convenção `data-block`/`data-slot` ao contrato.
- `.claude/skills/novo-post/SKILL.md` — Passo 9: trocar a instrução de pausa para o uso do estúdio.

**Convenção de teste:** todos os testes vivem em `scripts/studio/*.test.js`; rodam com `npm test` (`node --test scripts/studio`).

---

## Task 1: Scripts npm + scaffolding

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Adicionar os scripts `studio` e `test`**

Substitua o bloco `"scripts"` de `package.json` por:

```json
  "scripts": {
    "export": "node scripts/export-png.js",
    "studio": "node scripts/studio.js",
    "test": "node --test scripts/studio"
  },
```

- [ ] **Step 2: Criar o diretório dos módulos**

Run: `mkdir -p scripts/studio`
Expected: diretório criado, sem saída.

- [ ] **Step 3: Verificar que o test runner roda (sem testes ainda)**

Run: `npm test`
Expected: termina sem erro com "tests 0" (ou aviso de nenhum arquivo encontrado) — confirma que `node --test` está disponível.

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore(studio): add studio + test npm scripts"
```

---

## Task 2: Parser `estilo.md` → contrato JSON

O editor precisa saber, por bloco, quais slots existem e seus hints (fonte, tamanho, posição, alinhamento) para construir o painel preso ao contrato.

**Files:**
- Create: `scripts/studio/parse-estilo.js`
- Test: `scripts/studio/parse-estilo.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseEstilo, parseSlotDescriptor } from "./parse-estilo.js";

test("parseSlotDescriptor extrai fonte, tamanho, posição e alinhamento", () => {
  const r = parseSlotDescriptor("Anton ~140px | rodapé-centro | centralizado");
  assert.equal(r.font, "Anton");
  assert.equal(r.sizePx, 140);
  assert.equal(r.position, "rodapé-centro");
  assert.equal(r.align, "centralizado");
});

test("parseSlotDescriptor lida com descriptor só de posição", () => {
  const r = parseSlotDescriptor("posição rodapé-centro");
  assert.equal(r.font, null);
  assert.equal(r.sizePx, null);
  assert.equal(r.position, "rodapé-centro");
});

test("parseEstilo extrai blocos, bg-drop e slots do estilo editorial", () => {
  const md = readFileSync(
    "templates/social-media/carrossel/estilos/editorial/estilo.md",
    "utf8"
  );
  const c = parseEstilo(md);
  const nomes = c.blocks.map((b) => b.name);
  assert.deepEqual(nomes, ["capa", "corpo", "cta"]);

  const capa = c.blocks.find((b) => b.name === "capa");
  assert.equal(capa.bg, "photo");
  const titulo = capa.slots.find((s) => s.name === "título");
  assert.ok(titulo, "slot título existe na capa");
  assert.equal(titulo.font, "Anton");
  assert.equal(titulo.sizePx, 140);

  const corpo = c.blocks.find((b) => b.name === "corpo");
  const headline = corpo.slots.find((s) => s.name === "headline");
  assert.equal(headline.sizePx, 88);
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/studio/parse-estilo.test.js`
Expected: FAIL — `Cannot find module './parse-estilo.js'`.

- [ ] **Step 3: Implementar o parser**

```js
// scripts/studio/parse-estilo.js
// Parser do contrato declarativo estilo.md → JSON consumido pelo editor.

const POSICOES = [
  "rodapé-centro", "rodapé", "topo-centro", "topo",
  "zona-inferior", "centro", "esquerdo", "direito", "abaixo", "acima",
];

export function parseSlotDescriptor(descriptor) {
  const raw = String(descriptor || "").trim();
  const fontMatch = raw.match(/\b(Anton|Montserrat)\b/);
  const sizeMatch = raw.match(/~?\s*(\d+)\s*px/);
  const alignMatch = raw.match(/\b(centralizado|esquerdo|direito|centro)\b/);

  let position = null;
  for (const p of POSICOES) {
    if (raw.includes(p)) { position = p; break; }
  }

  return {
    raw,
    font: fontMatch ? fontMatch[1] : null,
    sizePx: sizeMatch ? parseInt(sizeMatch[1], 10) : null,
    position,
    align: alignMatch ? alignMatch[1] : null,
  };
}

function parseBgDrop(visualText) {
  const m = visualText.match(/\[bg\]:[^\n]*drop:\s*([a-z0-9_-]+)/i);
  return m ? m[1] : null;
}

function parseSlots(visualText) {
  const lines = visualText.split("\n");
  const slots = [];
  let inSlots = false;
  for (const line of lines) {
    if (/^\s*\[slots\]:/.test(line)) { inSlots = true; continue; }
    if (!inSlots) continue;
    // Slots são linhas indentadas "  nome: descriptor".
    // Para na próxima diretiva de base ([tokens]:, ####, ---, ###).
    if (/^\s*\[[a-zà-ú]+\]:/i.test(line) || /^####/.test(line) ||
        /^---/.test(line) || /^###/.test(line)) {
      break;
    }
    const m = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (m) {
      const name = m[1].trim();
      slots.push({ name, ...parseSlotDescriptor(m[2]) });
    }
  }
  return slots;
}

export function parseEstilo(md) {
  const text = String(md || "");
  const estruturaIdx = text.indexOf("## Estrutura");
  const estrutura = estruturaIdx >= 0 ? text.slice(estruturaIdx) : text;

  // Quebra por "### bloco: <nome>"; o primeiro pedaço é cabeçalho da Estrutura.
  const parts = estrutura.split(/^###\s+bloco:\s*/m);
  const blocks = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const name = chunk.split("\n")[0].trim();
    // Recorta a região #### visual (até #### editorial ou fim do bloco).
    const visualStart = chunk.indexOf("#### visual");
    const editorialStart = chunk.indexOf("#### editorial");
    const visualText = visualStart >= 0
      ? chunk.slice(visualStart, editorialStart >= 0 ? editorialStart : undefined)
      : chunk;
    blocks.push({
      name,
      bg: parseBgDrop(visualText),
      slots: parseSlots(visualText),
    });
  }

  // estilo: 1ª linha "# Estilo `slug` — ..." se presente.
  const slugMatch = text.match(/^#\s+Estilo\s+`([^`]+)`/m);
  return { estilo: slugMatch ? slugMatch[1] : null, blocks };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/studio/parse-estilo.test.js`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/parse-estilo.js scripts/studio/parse-estilo.test.js
git commit -m "feat(studio): parse estilo.md into editor contract JSON"
```

---

## Task 3: Validação do payload de edição (`edits.json`)

Define e blinda o schema do `edits.json` — o contrato que o Plano 2 vai consumir.

**Files:**
- Create: `scripts/studio/validate-edits.js`
- Test: `scripts/studio/validate-edits.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEdits } from "./validate-edits.js";

const valido = {
  estilo: "editorial",
  estilo_path: "templates/social-media/carrossel/estilos/editorial/estilo.md",
  post: "2026-06-02-do-zero-ao-topo",
  slides: [
    {
      slide: 1,
      block: "capa",
      edits: [
        { target: "logo", prop: "size", from: "120px", to: "96px", scope: "structural" },
        { target: "título", prop: "text", from: "X", to: "Y", scope: "content" },
      ],
      background: { drop: "photo", image: "ramon-042.jpg", position: "center 30%", zoom: 1.2 },
    },
  ],
};

test("payload válido passa", () => {
  const r = validateEdits(valido);
  assert.equal(r.valid, true);
  assert.deepEqual(r.errors, []);
});

test("scope inválido falha", () => {
  const ruim = structuredClone(valido);
  ruim.slides[0].edits[0].scope = "qualquer";
  const r = validateEdits(ruim);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("scope")));
});

test("slides ausente falha", () => {
  const r = validateEdits({ estilo: "x", post: "y" });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("slides")));
});

test("edit sem target falha", () => {
  const ruim = structuredClone(valido);
  delete ruim.slides[0].edits[0].target;
  const r = validateEdits(ruim);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.includes("target")));
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/studio/validate-edits.test.js`
Expected: FAIL — `Cannot find module './validate-edits.js'`.

- [ ] **Step 3: Implementar a validação**

```js
// scripts/studio/validate-edits.js
// Valida o payload de edição antes de gravar design/edits.json.

const SCOPES = new Set(["content", "structural"]);

export function validateEdits(payload) {
  const errors = [];
  const p = payload || {};

  if (typeof p.estilo !== "string" || !p.estilo) errors.push("estilo: string obrigatória");
  if (typeof p.post !== "string" || !p.post) errors.push("post: string obrigatória");

  if (!Array.isArray(p.slides)) {
    errors.push("slides: array obrigatório");
    return { valid: false, errors };
  }

  p.slides.forEach((s, i) => {
    const ctx = `slides[${i}]`;
    if (typeof s.slide !== "number") errors.push(`${ctx}.slide: número obrigatório`);
    if (typeof s.block !== "string" || !s.block) errors.push(`${ctx}.block: string obrigatória`);
    if (!Array.isArray(s.edits)) {
      errors.push(`${ctx}.edits: array obrigatório`);
    } else {
      s.edits.forEach((e, j) => {
        const ec = `${ctx}.edits[${j}]`;
        if (typeof e.target !== "string" || !e.target) errors.push(`${ec}.target: string obrigatória`);
        if (typeof e.prop !== "string" || !e.prop) errors.push(`${ec}.prop: string obrigatória`);
        if (!("from" in e)) errors.push(`${ec}.from: obrigatório`);
        if (!("to" in e)) errors.push(`${ec}.to: obrigatório`);
        if (!SCOPES.has(e.scope)) errors.push(`${ec}.scope: deve ser "content" ou "structural"`);
      });
    }
    if (s.background !== undefined) {
      const b = s.background || {};
      if (typeof b.drop !== "string") errors.push(`${ctx}.background.drop: string obrigatória`);
    }
  });

  return { valid: errors.length === 0, errors };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/studio/validate-edits.test.js`
Expected: PASS — 4 testes.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/validate-edits.js scripts/studio/validate-edits.test.js
git commit -m "feat(studio): validate edits.json payload schema"
```

---

## Task 4: Handlers das rotas (serve / contract / save / export)

Lógica das rotas como funções puras (recebem caminhos e dependências injetadas), testáveis sem abrir porta.

**Files:**
- Create: `scripts/studio/handlers.js`
- Test: `scripts/studio/handlers.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { servePreview, serveContract, saveEdits, runExport } from "./handlers.js";

async function fixturePost() {
  const base = await mkdtemp(join(tmpdir(), "studio-"));
  const design = join(base, "design");
  await mkdir(design, { recursive: true });
  await writeFile(join(design, "preview.html"), "<html><body>old</body></html>");
  return { base, design };
}

test("servePreview devolve o preview.html", async () => {
  const { base } = await fixturePost();
  const r = await servePreview({ postDir: base });
  assert.equal(r.status, 200);
  assert.match(r.body, /old/);
});

test("servePreview devolve 404 sem preview", async () => {
  const base = await mkdtemp(join(tmpdir(), "studio-empty-"));
  const r = await servePreview({ postDir: base });
  assert.equal(r.status, 404);
});

test("serveContract roda parseEstilo sobre o estilo apontado", async () => {
  const { base } = await fixturePost();
  const r = await serveContract({
    estiloPath: "templates/social-media/carrossel/estilos/editorial/estilo.md",
  });
  assert.equal(r.status, 200);
  const c = JSON.parse(r.body);
  assert.ok(c.blocks.length >= 3);
});

test("serveContract devolve 204 sem estiloPath", async () => {
  const r = await serveContract({ estiloPath: null });
  assert.equal(r.status, 204);
});

test("saveEdits grava preview.html e edits.json válidos", async () => {
  const { base, design } = await fixturePost();
  const payload = {
    estilo: "editorial",
    post: "p",
    slides: [{ slide: 1, block: "capa", edits: [] }],
  };
  const r = await saveEdits({ postDir: base, html: "<html>new</html>", edits: payload });
  assert.equal(r.status, 200);
  assert.equal(await readFile(join(design, "preview.html"), "utf8"), "<html>new</html>");
  const written = JSON.parse(await readFile(join(design, "edits.json"), "utf8"));
  assert.equal(written.estilo, "editorial");
});

test("saveEdits rejeita payload inválido com 400", async () => {
  const { base } = await fixturePost();
  const r = await saveEdits({ postDir: base, html: "<html>x</html>", edits: { estilo: "e", post: "p" } });
  assert.equal(r.status, 400);
  assert.ok(r.body.includes("slides"));
});

test("runExport invoca o export-png.js com o postDir", async () => {
  const calls = [];
  const fakeSpawn = (cmd, args) => {
    calls.push({ cmd, args });
    return { on: (ev, cb) => { if (ev === "close") cb(0); } };
  };
  const r = await runExport({ postDir: "/tmp/post", spawn: fakeSpawn });
  assert.equal(r.status, 200);
  assert.equal(calls[0].cmd, "node");
  assert.deepEqual(calls[0].args, ["scripts/export-png.js", "/tmp/post"]);
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/studio/handlers.test.js`
Expected: FAIL — `Cannot find module './handlers.js'`.

- [ ] **Step 3: Implementar os handlers**

```js
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

export async function serveContract({ estiloPath }) {
  if (!estiloPath || !existsSync(estiloPath)) return { status: 204, type: "application/json", body: "" };
  const md = await readFile(estiloPath, "utf8");
  const contract = parseEstilo(md);
  return { status: 200, type: "application/json", body: JSON.stringify(contract) };
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
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/studio/handlers.test.js`
Expected: PASS — 7 testes.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/handlers.js scripts/studio/handlers.test.js
git commit -m "feat(studio): route handlers for serve/contract/save/export"
```

---

## Task 5: Entry CLI + servidor HTTP `studio.js`

Wiring fino: parseia argv, sobe o servidor, roteia para os handlers. (Verificação manual — o entry só liga peças já testadas.)

**Files:**
- Create: `scripts/studio.js`

- [ ] **Step 1: Implementar o entry**

```js
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
import { resolve } from "node:path";
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
      return send(res, await serveContract({ estiloPath }));
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
```

- [ ] **Step 2: Tornar executável e fumar o servidor**

Run:
```bash
chmod +x scripts/studio.js
# usa um post existente já gerado no repo:
node scripts/studio.js export/conteudos/carrossel/2026-05-29-o-que-o-resultado-esconde \
  --estilo templates/social-media/carrossel/estilos/editorial/estilo.md --port 4321 &
sleep 1
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/contract
kill %1
```
Expected: imprime `200` e `200` (preview e contrato servidos). Se o post de exemplo não existir, use qualquer pasta sob `export/conteudos/carrossel/` que tenha `design/preview.html`.

- [ ] **Step 3: Commit**

```bash
git add scripts/studio.js
git commit -m "feat(studio): CLI + HTTP server entry wiring handlers"
```

---

## Task 6: Tagging `data-block`/`data-slot` nos templates

O editor mapeia elemento clicado → slot do contrato por esses atributos. Tag nos 3 `slide.html` existentes.

**Files:**
- Modify: `templates/social-media/carrossel/estilos/editorial/slide.html`
- Modify: `templates/social-media/carrossel/estilos/layout-dividido/slide.html`
- Modify: `templates/social-media/carrossel/estilos/treino-dino/slide.html`

- [ ] **Step 1: Tag no `editorial/slide.html` — variante capa**

Na `<section class="slide capa">`, adicione `data-block="capa"` e tag os slots conforme o `estilo.md` (`logo`, `título`, `swipe-cue`, `barra-progresso`):

```html
  <section class="slide capa" data-block="capa">
    <div class="slide-bg placeholder" data-bg-drop="photo" data-slot="bg"></div>
    <div class="img-overlay"></div>

    <div class="title-block">
      <img src="../../../../../brand/assets/logo.png" alt="DINO" class="logo-img" data-slot="logo" />
      <h1 class="big-title" data-slot="título">DO ZERO<br>AO OLYMPIA</h1>
      <div class="swipe-cue" data-slot="swipe-cue">
        <span>ARRASTE</span>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="1.4"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
    </div>

    <div class="progress" data-slot="barra-progresso">
      <div class="track"><div class="fill" style="width: 33.33%"></div></div>
    </div>
  </section>
```

- [ ] **Step 2: Tag nas variantes `corpo` e `cta` (nos comentários-exemplo do mesmo arquivo)**

Atualize os blocos de exemplo comentados para refletir a convenção, batendo com os slots do `estilo.md`:
- variante `corpo`: `<section class="slide corpo" data-block="corpo">`, `data-slot` em `logo` (`.logo-img`), `eyebrow` (`.eyebrow`), `headline` (`.headline`), `corpo` (`.body-text`), `swipe-cue`, `barra-progresso`, e `data-slot="bg"` no `.slide-bg`.
- variante `cta`: `<section class="slide cta" data-block="cta">`, `data-slot` em `logo`, `título` (`.cta-headline`), `sub` (`.cta-sub`), `barra-progresso`, e `bg`.

Mantenha o texto explicativo das INSTRUÇÕES e acrescente o item:

```
9. Tagging para o editor: a <section> leva data-block="<capa|corpo|cta>" e cada
   slot leva data-slot="<nome exatamente como no estilo.md>". O .slide-bg leva
   data-slot="bg" além do data-bg-drop.
```

- [ ] **Step 3: Aplicar a mesma convenção em `layout-dividido/slide.html` e `treino-dino/slide.html`**

Para cada um: leia o `estilo.md` irmão (`## Estrutura`), e adicione `data-block` na `<section>` de cada variante + `data-slot="<nome>"` em cada elemento que corresponde a um slot declarado, usando exatamente os nomes do `estilo.md`. O `.slide-bg`/elemento de drop recebe `data-slot="bg"`.

- [ ] **Step 4: Verificar o tagging com o parser**

Run:
```bash
node -e '
import("./scripts/studio/parse-estilo.js").then(async (m) => {
  const fs = await import("node:fs");
  for (const slug of ["editorial","layout-dividido","treino-dino"]) {
    const base = `templates/social-media/carrossel/estilos/${slug}`;
    const c = m.parseEstilo(fs.readFileSync(`${base}/estilo.md","utf8"));
    const html = fs.readFileSync(`${base}/slide.html`,"utf8");
    for (const b of c.blocks) {
      if (!html.includes(`data-block="${b.name}"`)) console.log(`FALTA data-block ${slug}/${b.name}`);
      for (const s of b.slots) {
        if (!html.includes(`data-slot="${s.name}"`)) console.log(`FALTA data-slot ${slug}/${b.name}/${s.name}`);
      }
    }
  }
  console.log("check concluído");
});
'
```
Expected: imprime "check concluído" sem linhas "FALTA". (Corrija qualquer slot faltante — nomes devem bater exatamente com o `estilo.md`.)

> Nota: corrija a aspa do template literal do `estilo.md` no comando acima para `` `${base}/estilo.md` `` ao colar (foi quebrada aqui só pela formatação).

- [ ] **Step 5: Commit**

```bash
git add templates/social-media/carrossel/estilos/*/slide.html
git commit -m "feat(templates): tag slides with data-block/data-slot for the editor"
```

---

## Task 7: Convenção no contrato do agente `designer`

Assets gerados futuramente precisam nascer com `data-block`/`data-slot`.

**Files:**
- Modify: `.claude/agents/designer.md`

- [ ] **Step 1: Adicionar a regra na seção "Princípios da especialidade"**

Após o bullet "**Drop zones de foto.**" insira:

```markdown
- **Tagging para o editor.** Toda `<section data-slide>` leva também `data-block="<nome do bloco em ## Estrutura>"`, e cada elemento que materializa um slot leva `data-slot="<nome exato do slot no estilo.md>"`. O elemento de fundo fotográfico leva `data-slot="bg"` além do `data-bg-drop`. O editor do estúdio usa esses atributos para prender o painel ao contrato — slot sem tag fica ineditável.
```

- [ ] **Step 2: Verificação (revisão de prosa)**

Run: `grep -n "data-slot" .claude/agents/designer.md`
Expected: a nova regra aparece. Confirme que o texto referencia "nome exato do slot no estilo.md".

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/designer.md
git commit -m "docs(designer): require data-block/data-slot tagging in assets"
```

---

## Task 8: Reescrita do wrapper — base (estrutura, CSS, carrossel, scaling, export-mode)

Reescreve `preview-wrapper.html` do zero. Esta task entrega a base **sem** edição ainda: estrutura, CSS do chrome + painel, carrossel, scaling e export-mode. As funções de carrossel/scaling são portadas do wrapper atual (mostradas completas).

**Files:**
- Modify (rewrite): `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Escrever o esqueleto HTML + CSS + JS base**

Substitua o conteúdo inteiro de `templates/wrappers/preview-wrapper.html` por:

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Preview — {tema} ({estilo})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* Dino Studio: editor preso-ao-contrato + carrossel + drop de imagem */
    html, body { margin: 0; padding: 0; background: #111; overscroll-behavior: none; }

    .dt-carousel {
      display: flex; align-items: center; gap: 40px; padding: 0 40px;
      overflow-x: auto; overflow-y: hidden; height: 100vh;
      scroll-snap-type: x mandatory; scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .dt-carousel::-webkit-scrollbar { display: none; }
    section[data-slide] {
      flex-shrink: 0; scroll-snap-align: center; position: relative;
      overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.6);
    }

    /* Drop zones */
    [data-bg-drop].dt-drop-active { outline: 6px dashed #00b140; outline-offset: -6px; }
    [data-bg-drop][data-has-bg] { cursor: grab; }
    [data-bg-drop][data-has-bg].dt-grabbing { cursor: grabbing; }

    /* Seleção de elemento editável */
    [data-slot] { cursor: pointer; }
    .dt-selected { outline: 2px solid #00e051 !important; outline-offset: 2px; }

    /* Guias inteligentes */
    .dt-guide { position: absolute; z-index: 50; pointer-events: none; background: #00e051; }
    .dt-guide.v { width: 1px; top: 0; bottom: 0; }
    .dt-guide.h { height: 1px; left: 0; right: 0; }

    /* Painel lateral */
    .dt-panel {
      position: fixed; top: 0; right: 0; width: 300px; height: 100vh;
      background: rgba(18,18,18,.96); backdrop-filter: blur(8px);
      border-left: 1px solid rgba(255,255,255,.12); color: #fff;
      font-family: "Montserrat", sans-serif; padding: 20px; box-sizing: border-box;
      transform: translateX(100%); transition: transform .18s; z-index: 9998; overflow-y: auto;
    }
    .dt-panel.is-open { transform: translateX(0); }
    .dt-panel h3 { font-size: 13px; letter-spacing: .1em; margin: 0 0 16px; text-transform: uppercase; }
    .dt-field { margin-bottom: 14px; }
    .dt-field label { display: block; font-size: 11px; opacity: .7; margin-bottom: 4px; letter-spacing: .06em; }
    .dt-field input, .dt-field select, .dt-field textarea {
      width: 100%; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
      color: #fff; border-radius: 6px; padding: 6px 8px; font: 600 13px "Montserrat", sans-serif;
      box-sizing: border-box;
    }
    .dt-field textarea { resize: vertical; min-height: 60px; }
    .dt-remove {
      width: 100%; margin-top: 8px; background: rgba(220,40,40,.18); border: 1px solid #d33;
      color: #ff6b6b; border-radius: 6px; padding: 8px; cursor: pointer; font-weight: 700;
      letter-spacing: .06em;
    }

    /* Controles inferiores */
    .dt-controls {
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 14px; padding: 10px 18px;
      background: rgba(0,0,0,.72); backdrop-filter: blur(10px);
      border-radius: 999px; font-family: "Montserrat", sans-serif; color: #fff; z-index: 9999; user-select: none;
    }
    .dt-controls button {
      background: transparent; border: 1px solid rgba(255,255,255,.28); color: #fff;
      width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; line-height: 1;
      display: flex; align-items: center; justify-content: center; padding: 0; transition: background .15s, opacity .15s;
    }
    .dt-controls button:hover { background: rgba(255,255,255,.12); }
    .dt-controls button:disabled { opacity: .25; cursor: default; }
    .dt-save, .dt-export {
      width: auto !important; padding: 0 14px !important; font-size: 12px !important;
      font-weight: 700; letter-spacing: .06em; white-space: nowrap; border-radius: 999px !important;
    }
    .dt-save { background: rgba(0,177,64,.18) !important; border-color: #00b140 !important; color: #00e051 !important; }
    .dt-save:hover { background: rgba(0,177,64,.36) !important; }
    .dt-controls .dt-dots { display: flex; gap: 6px; }
    .dt-controls .dt-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.32); cursor: pointer; transition: background .15s, transform .15s; }
    .dt-controls .dt-dot.is-active { background: #fff; transform: scale(1.15); }
    .dt-controls .dt-counter { font-size: 12px; letter-spacing: .14em; font-weight: 600; min-width: 48px; text-align: center; }

    /* Export-mode: layout linear, sem chrome */
    body.export-mode .dt-controls, body.export-mode .dt-panel { display: none !important; }
    body.export-mode .dt-carousel { display: block; padding: 0; gap: 0; overflow: visible; height: auto; scroll-snap-type: none; }
    body.export-mode section[data-slide] { box-shadow: none; }
    body.export-mode .dt-selected { outline: none !important; }
  </style>
</head>
<body>
  <div class="dt-carousel" id="dt-carousel">
    <!-- SLIDES_HERE -->
  </div>

  <aside class="dt-panel" id="dt-panel"><h3 id="dt-panel-title">Elemento</h3><div id="dt-panel-body"></div></aside>

  <div class="dt-controls" id="dt-controls">
    <button class="dt-prev" type="button" aria-label="Slide anterior">‹</button>
    <div class="dt-dots"></div>
    <button class="dt-next" type="button" aria-label="Próximo slide">›</button>
    <span class="dt-counter">1 / 1</span>
    <button class="dt-save" id="dt-save" type="button">Salvar</button>
    <button class="dt-export" id="dt-export" type="button">Exportar</button>
  </div>

  <script>
  (function () {
    "use strict";
    var carousel = document.getElementById("dt-carousel");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("section[data-slide]"));
    var total = slides.length; if (total === 0) return;
    var controls = document.getElementById("dt-controls");
    var prevBtn = controls.querySelector(".dt-prev");
    var nextBtn = controls.querySelector(".dt-next");
    var dotsEl = controls.querySelector(".dt-dots");
    var counterEl = controls.querySelector(".dt-counter");

    // ---------- Carrossel ----------
    slides.forEach(function (_, i) {
      var d = document.createElement("span"); d.className = "dt-dot";
      d.addEventListener("click", function () { goTo(i); }); dotsEl.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsEl.querySelectorAll(".dt-dot"));
    var current = 0;
    function update() {
      counterEl.textContent = (current + 1) + " / " + total;
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === current); });
      prevBtn.disabled = current === 0; nextBtn.disabled = current === total - 1;
    }
    function goTo(idx) {
      current = Math.max(0, Math.min(total - 1, idx));
      slides[current].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      update();
    }
    prevBtn.addEventListener("click", function () { goTo(current - 1); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); });
    document.addEventListener("keydown", function (e) {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });
    var st;
    carousel.addEventListener("scroll", function () {
      clearTimeout(st);
      st = setTimeout(function () {
        var c = carousel.scrollLeft + carousel.clientWidth / 2, n = 0, m = Infinity;
        slides.forEach(function (s, i) {
          var sc = s.offsetLeft + s.offsetWidth / 2, d = Math.abs(sc - c);
          if (d < m) { m = d; n = i; }
        });
        if (n !== current) { current = n; update(); }
      }, 80);
    });
    update();

    // ---------- Scaling ----------
    function computeScale(slide) {
      var h = parseInt(slide.style.height, 10) || slide.offsetHeight;
      var w = parseInt(slide.style.width, 10) || slide.offsetWidth;
      if (!h || !w) return 1;
      return Math.min((window.innerHeight - 80) / h, (window.innerWidth - 80) / w, 1);
    }
    function applyScaling() {
      if (document.body.classList.contains("export-mode")) return;
      slides.forEach(function (s) { s.style.zoom = computeScale(s); });
    }
    function removeScaling() { slides.forEach(function (s) { s.style.zoom = ""; }); }
    new MutationObserver(function () {
      if (document.body.classList.contains("export-mode")) removeScaling(); else applyScaling();
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    applyScaling();
    window.addEventListener("resize", applyScaling);

    // Pontos de extensão preenchidos nas próximas tasks:
    window.__DT = { slides: slides, current: function () { return current; } };
  })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verificar a base no navegador**

Run:
```bash
node scripts/studio.js export/conteudos/carrossel/2026-05-29-o-que-o-resultado-esconde \
  --estilo templates/social-media/carrossel/estilos/editorial/estilo.md --port 4321 &
sleep 1; echo "abra http://localhost:4321 no navegador"
```
> Nota: o post de exemplo foi gerado com o wrapper antigo; este passo valida só o chrome novo (carrossel/scaling) servido. A integração plena vem na Task 13.

Expected (browser): o carrossel aparece, navega com ‹ ›/setas/dots, slides escalam pra caber. Encerre com `kill %1`.

- [ ] **Step 3: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): rewrite wrapper base — carousel, scaling, export-mode, panel shell"
```

---

## Task 9: Wrapper — drop de imagem, reposicionar e zoom (portado)

Reintroduz a edição de fundo fotográfico no wrapper novo, agora com o zoom no painel lateral.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Adicionar o módulo de background antes de `window.__DT = ...`**

Insira, dentro da IIFE, logo antes da linha `window.__DT = {...}`:

```javascript
    // ---------- Background fotográfico (drop / reposicionar / zoom) ----------
    var dragBg = null;
    function getZoneDesignSize(zone) {
      var slide = zone.closest("section[data-slide]") || zone;
      var slideW = parseInt(slide.style.width, 10) || slide.offsetWidth;
      var slideH = parseInt(slide.style.height, 10) || slide.offsetHeight;
      var sr = slide.getBoundingClientRect(), zr = zone.getBoundingClientRect();
      return { w: slideW * (zr.width / sr.width), h: slideH * (zr.height / sr.height) };
    }
    function applyBgZoom(zone) {
      var bw = (zone._bgNatW * zone._bgScale * zone._bgZoom).toFixed(1);
      var bh = (zone._bgNatH * zone._bgScale * zone._bgZoom).toFixed(1);
      zone.style.backgroundSize = bw + "px " + bh + "px";
    }
    function readPos(zone) {
      var pp = (zone.style.backgroundPosition || "50% 50%").split(/\s+/);
      var x = parseFloat(pp[0]), y = parseFloat(pp[1]);
      return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
    }
    document.addEventListener("mousemove", function (e) {
      if (!dragBg) return;
      var zone = dragBg.zone, rect = zone.getBoundingClientRect();
      var dx = ((dragBg.sx - e.clientX) / rect.width) * 100;
      var dy = ((dragBg.sy - e.clientY) / rect.height) * 100;
      var nx = Math.max(0, Math.min(100, dragBg.sp.x + dx));
      var ny = Math.max(0, Math.min(100, dragBg.sp.y + dy));
      zone.style.backgroundPosition = nx.toFixed(1) + "% " + ny.toFixed(1) + "%";
    });
    document.addEventListener("mouseup", function () {
      if (!dragBg) return; dragBg.zone.classList.remove("dt-grabbing"); dragBg = null;
    });
    function bindBgZone(zone) {
      zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("dt-drop-active"); });
      zone.addEventListener("dragleave", function (e) { if (e.target === zone) zone.classList.remove("dt-drop-active"); });
      zone.addEventListener("drop", function (e) {
        e.preventDefault(); e.stopPropagation(); zone.classList.remove("dt-drop-active");
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (!f || f.type.indexOf("image/") !== 0) return;
        var r = new FileReader();
        r.onload = function () {
          var img = new Image();
          img.onload = function () {
            var ds = getZoneDesignSize(zone);
            zone._bgNatW = img.naturalWidth; zone._bgNatH = img.naturalHeight;
            zone._bgScale = Math.max(ds.w / img.naturalWidth, ds.h / img.naturalHeight);
            zone._bgZoom = 1.0;
            zone.style.backgroundImage = "url(" + r.result + ")";
            zone.style.backgroundRepeat = "no-repeat";
            zone.style.backgroundPosition = "50% 50%";
            applyBgZoom(zone);
            zone.setAttribute("data-has-bg", "1");
            if (window.__DT.onBgChanged) window.__DT.onBgChanged(zone);
          };
          img.src = r.result;
        };
        r.readAsDataURL(f);
      });
      zone.addEventListener("mousedown", function (e) {
        if (!zone.hasAttribute("data-has-bg")) return;
        e.preventDefault();
        dragBg = { zone: zone, sx: e.clientX, sy: e.clientY, sp: readPos(zone) };
        zone.classList.add("dt-grabbing");
      });
    }
    slides.forEach(function (slide) {
      var zones = Array.prototype.slice.call(slide.querySelectorAll("[data-bg-drop]"));
      if (zones.length === 0) { slide.setAttribute("data-bg-drop", "full"); zones = [slide]; }
      zones.forEach(bindBgZone);
    });
```

E expanda a linha de extensão para expor o que as próximas tasks usam:

```javascript
    window.__DT = {
      slides: slides, current: function () { return current; },
      applyBgZoom: applyBgZoom, readPos: readPos
    };
```

- [ ] **Step 2: Verificar drop + reposicionar no navegador**

Suba o estúdio (como na Task 8), arraste um arquivo de imagem para um slide, confirme que a foto entra, e arraste com o mouse sobre a foto para reposicionar.
Expected (browser): foto aplicada como `cover`, reposicionável por arraste. Encerre o servidor.

- [ ] **Step 3: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): port photo drop/reposition into rewritten wrapper"
```

---

## Task 10: Wrapper — contrato + seleção de elemento + painel

Busca `/contract`, e ao clicar num `[data-slot]` abre o painel com os controles permitidos por aquele slot.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Adicionar o módulo de seleção/painel antes de `window.__DT = {...}`**

```javascript
    // ---------- Contrato + seleção + painel ----------
    var panel = document.getElementById("dt-panel");
    var panelTitle = document.getElementById("dt-panel-title");
    var panelBody = document.getElementById("dt-panel-body");
    var contract = null;      // { estilo, blocks:[{name, bg, slots:[...]}] }
    var selected = null;      // elemento [data-slot] selecionado
    var edits = [];           // deltas acumulados

    fetch("/contract").then(function (r) { return r.status === 200 ? r.json() : null; })
      .then(function (c) { contract = c; }).catch(function () { contract = null; });

    function slotDef(el) {
      if (!contract) return null;
      var section = el.closest("section[data-slide]");
      var blockName = section && section.getAttribute("data-block");
      var slotName = el.getAttribute("data-slot");
      var block = contract.blocks.find(function (b) { return b.name === blockName; });
      if (!block) return null;
      return block.slots.find(function (s) { return s.name === slotName; }) || null;
    }

    function selectEl(el) {
      if (selected) selected.classList.remove("dt-selected");
      selected = el; el.classList.add("dt-selected");
      buildPanel(el);
      panel.classList.add("is-open");
    }
    function deselect() {
      if (selected) selected.classList.remove("dt-selected");
      selected = null; panel.classList.remove("is-open");
    }

    function field(label, inputHtml) {
      return '<div class="dt-field"><label>' + label + '</label>' + inputHtml + '</div>';
    }

    function buildPanel(el) {
      var def = slotDef(el);
      var slotName = el.getAttribute("data-slot");
      panelTitle.textContent = slotName + (def ? "" : " (livre)");
      // Os controles concretos entram na Task 11; aqui só o título + remover.
      panelBody.innerHTML = "";
      var rm = document.createElement("button");
      rm.className = "dt-remove"; rm.textContent = "Remover elemento";
      rm.addEventListener("click", function () { window.__DT.removeSelected(); });
      panelBody.appendChild(rm);
    }

    // Clique em elemento editável seleciona; clique no fundo/controles deseleciona.
    slides.forEach(function (slide) {
      slide.querySelectorAll("[data-slot]").forEach(function (el) {
        if (el.hasAttribute("data-bg-drop")) return; // bg tem fluxo próprio
        el.addEventListener("click", function (e) { e.stopPropagation(); selectEl(el); });
      });
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest(".dt-panel") || e.target.closest(".dt-controls") ||
          e.target.closest("[data-slot]")) return;
      deselect();
    });
```

E adicione ao objeto `window.__DT` os campos `contract`, `edits`, `slotDef`, `selectEl` e um `removeSelected` placeholder (preenchido na Task 11):

```javascript
    window.__DT = {
      slides: slides, current: function () { return current; },
      applyBgZoom: applyBgZoom, readPos: readPos,
      getContract: function () { return contract; },
      getEdits: function () { return edits; },
      slotDef: slotDef, selectEl: selectEl,
      removeSelected: function () {}, onBgChanged: null
    };
```

- [ ] **Step 2: Verificar seleção no navegador**

Suba o estúdio com `--estilo` apontando para `editorial/estilo.md` sobre um post **gerado com os templates já tagueados** (se ainda não houver, use um slide de teste; a Task 14 faz o round-trip real). Clique num título/headline.
Expected (browser): elemento ganha contorno verde, painel desliza da direita mostrando o nome do slot e o botão "Remover elemento". Clicar no fundo fecha o painel.

- [ ] **Step 3: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): contract fetch + element selection + panel shell"
```

---

## Task 11: Wrapper — controles de edição + tracking de deltas

Painel ganha os controles (texto, tamanho, posição, estilo de texto), cada mudança registra um delta com `scope`. Implementa também `removeSelected`.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Substituir a função `buildPanel` e o módulo de deltas**

Troque a `buildPanel` placeholder da Task 10 por esta versão completa, e adicione as funções de delta logo acima dela:

```javascript
    // Mapa de propriedade -> scope (content = só este post; structural = candidato a estilo)
    var SCOPE = {
      text: "content", "bg": "content",
      size: "structural", weight: "structural", align: "structural",
      color: "structural", "position.bottom": "structural", removed: "structural"
    };
    function slideIndexOf(el) {
      var section = el.closest("section[data-slide]");
      return section ? parseInt(section.getAttribute("data-slide"), 10) : 0;
    }
    function blockOf(el) {
      var section = el.closest("section[data-slide]");
      return section ? section.getAttribute("data-block") : null;
    }
    function recordEdit(el, prop, from, to) {
      var slide = slideIndexOf(el), target = el.getAttribute("data-slot");
      var existing = edits.find(function (e) {
        return e._slide === slide && e.target === target && e.prop === prop;
      });
      if (existing) { existing.to = to; return; }
      edits.push({
        _slide: slide, _block: blockOf(el),
        target: target, prop: prop, from: from, to: to,
        scope: SCOPE[prop] || "content"
      });
    }

    function buildPanel(el) {
      var def = slotDef(el);
      panelTitle.textContent = el.getAttribute("data-slot") + (def ? "" : " (livre)");
      var cs = window.getComputedStyle(el);
      var html = "";
      var hasText = el.children.length === 0 || /H1|H2|H3|P|SPAN/.test(el.tagName);
      if (hasText) {
        html += field("Texto", '<textarea id="dt-c-text">' + el.textContent.trim() + '</textarea>');
      }
      html += field("Tamanho (px)", '<input id="dt-c-size" type="number" value="' + parseInt(cs.fontSize, 10) + '">');
      html += field("Peso", '<select id="dt-c-weight">' +
        ["300", "400", "500", "600", "700"].map(function (w) {
          return '<option value="' + w + '"' + (cs.fontWeight === w ? " selected" : "") + '>' + w + '</option>';
        }).join("") + '</select>');
      html += field("Alinhamento", '<select id="dt-c-align">' +
        ["left", "center", "right"].map(function (a) {
          return '<option value="' + a + '"' + (cs.textAlign === a ? " selected" : "") + '>' + a + '</option>';
        }).join("") + '</select>');
      html += field("Cor", '<select id="dt-c-color">' +
        [["#ffffff", "branco"], ["#000000", "preto"], ["#7f7f7f", "cinza"]].map(function (c) {
          return '<option value="' + c[0] + '">' + c[1] + '</option>';
        }).join("") + '</select>');
      html += field("Posição inferior (px)",
        '<input id="dt-c-bottom" type="number" value="' + (parseInt(el.style.bottom, 10) || "") + '" placeholder="auto">');
      panelBody.innerHTML = html;

      var rm = document.createElement("button");
      rm.className = "dt-remove"; rm.textContent = "Remover elemento";
      rm.addEventListener("click", function () { window.__DT.removeSelected(); });
      panelBody.appendChild(rm);

      var t = document.getElementById("dt-c-text");
      if (t) t.addEventListener("input", function () {
        var from = el.textContent; el.textContent = t.value; recordEdit(el, "text", from, t.value);
      });
      bindNum("dt-c-size", function (v) { var f = el.style.fontSize; el.style.fontSize = v + "px"; recordEdit(el, "size", f || null, v + "px"); });
      bindSel("dt-c-weight", function (v) { var f = el.style.fontWeight; el.style.fontWeight = v; recordEdit(el, "weight", f || null, v); });
      bindSel("dt-c-align", function (v) { var f = el.style.textAlign; el.style.textAlign = v; recordEdit(el, "align", f || null, v); });
      bindSel("dt-c-color", function (v) { var f = el.style.color; el.style.color = v; recordEdit(el, "color", f || null, v); });
      bindNum("dt-c-bottom", function (v) { var f = el.style.bottom; el.style.position = "absolute"; el.style.bottom = v + "px"; recordEdit(el, "position.bottom", f || null, v + "px"); });
    }
    function bindNum(id, fn) { var i = document.getElementById(id); if (i) i.addEventListener("input", function () { if (i.value !== "") fn(parseInt(i.value, 10)); }); }
    function bindSel(id, fn) { var i = document.getElementById(id); if (i) i.addEventListener("change", function () { fn(i.value); }); }
```

- [ ] **Step 2: Implementar `removeSelected` no `window.__DT`**

Substitua o campo `removeSelected: function () {}` por:

```javascript
      removeSelected: function () {
        if (!selected) return;
        recordEdit(selected, "removed", "present", "removed");
        selected.style.display = "none"; // oculta (não destrói) — preserva no DOM salvo? Ver nota.
        deselect();
      },
```

> Nota de design: "removido" oculta via `display:none` para sobreviver no HTML salvo de forma reversível e ser detectável pelo Plano 2 via `edits.json`. O `export-png.js` não renderiza elementos `display:none`, então o PNG sai sem o elemento — comportamento desejado.

- [ ] **Step 3: Verificar edição no navegador**

Suba o estúdio, selecione um título, edite o texto, mude o tamanho e o alinhamento, mexa na posição inferior, remova um elemento.
Expected (browser): cada mudança reflete no slide imediatamente. No console: `window.__DT.getEdits()` lista os deltas com `scope` correto (`text`→content, `size`/`align`/`position.bottom`/`removed`→structural).

- [ ] **Step 4: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): edit controls + scoped delta tracking + remove"
```

---

## Task 12: Wrapper — guias inteligentes (snapping)

Ao mexer na posição inferior de um elemento, mostra linhas-guia e faz snap a centro/bordas/safe-area/outros slots.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Adicionar o módulo de guias antes de `window.__DT = {...}`**

```javascript
    // ---------- Guias inteligentes ----------
    var SAFE = 80; // safe-area do brand (margem padrão em brand/social-media.md)
    var SNAP = 8;  // limiar de snap em px (espaço de design)
    function clearGuides(slide) {
      slide.querySelectorAll(".dt-guide").forEach(function (g) { g.remove(); });
    }
    function showGuide(slide, axis, posPx) {
      var g = document.createElement("div");
      g.className = "dt-guide " + axis;
      if (axis === "h") g.style.top = posPx + "px"; else g.style.left = posPx + "px";
      slide.appendChild(g);
    }
    // Retorna a posição-alvo "bottom" snapada (em px do espaço de design) + desenha guias.
    function snapBottom(el, bottomPx) {
      var slide = el.closest("section[data-slide]");
      var slideH = parseInt(slide.style.height, 10) || slide.offsetHeight;
      clearGuides(slide);
      var anchors = [SAFE, slideH / 2, slideH - SAFE]; // safe-bottom, centro, safe-top(espelhado)
      slide.querySelectorAll("[data-slot]").forEach(function (o) {
        if (o === el) return;
        var b = parseInt(o.style.bottom, 10); if (!isNaN(b)) anchors.push(b);
      });
      var snapped = bottomPx;
      for (var i = 0; i < anchors.length; i++) {
        if (Math.abs(bottomPx - anchors[i]) <= SNAP) {
          snapped = anchors[i];
          showGuide(slide, "h", slideH - snapped); // linha na altura correspondente
          break;
        }
      }
      return snapped;
    }
```

- [ ] **Step 2: Ligar o snap ao controle de posição**

Na `buildPanel` (Task 11), substitua o handler do `dt-c-bottom` por:

```javascript
      bindNum("dt-c-bottom", function (v) {
        var snapped = snapBottom(el, v);
        var f = el.style.bottom; el.style.position = "absolute"; el.style.bottom = snapped + "px";
        recordEdit(el, "position.bottom", f || null, snapped + "px");
      });
```

E limpe as guias ao deselecionar — dentro de `deselect()` adicione, antes de `selected = null;`:

```javascript
      if (selected) { var s = selected.closest("section[data-slide]"); if (s) clearGuides(s); }
```

- [ ] **Step 3: Verificar snapping no navegador**

Selecione um elemento, ajuste "Posição inferior" aproximando-se de 80, do centro, ou da posição de outro slot.
Expected (browser): ao chegar perto de um anchor, o valor "gruda" e uma linha verde horizontal aparece naquela altura; sai do anchor → linha some.

- [ ] **Step 4: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): smart alignment guides with snapping"
```

---

## Task 13: Wrapper — botões Salvar e Exportar (POST)

Salvar serializa o DOM + monta o payload de `edits` e faz `POST /save`; Exportar faz `POST /export`.

**Files:**
- Modify: `templates/wrappers/preview-wrapper.html`

- [ ] **Step 1: Adicionar os handlers de Salvar/Exportar antes de `window.__DT = {...}`**

```javascript
    // ---------- Salvar / Exportar ----------
    function buildPayload() {
      var bySlide = {};
      edits.forEach(function (e) {
        var k = e._slide;
        if (!bySlide[k]) bySlide[k] = { slide: e._slide, block: e._block, edits: [] };
        bySlide[k].edits.push({ target: e.target, prop: e.prop, from: e.from, to: e.to, scope: e.scope });
      });
      // Background por slide (zona com foto aplicada)
      slides.forEach(function (slide) {
        var n = parseInt(slide.getAttribute("data-slide"), 10);
        var zone = slide.querySelector("[data-bg-drop][data-has-bg]");
        if (zone) {
          if (!bySlide[n]) bySlide[n] = { slide: n, block: slide.getAttribute("data-block"), edits: [] };
          bySlide[n].background = {
            drop: zone.getAttribute("data-bg-drop"),
            position: zone.style.backgroundPosition || "50% 50%",
            zoom: zone._bgZoom || 1
          };
        }
      });
      var c = contract || {};
      return {
        estilo: c.estilo || "desconhecido",
        post: document.title,
        slides: Object.keys(bySlide).map(function (k) { return bySlide[k]; })
      };
    }
    function serializeHtml() {
      // Remove artefatos de UI antes de serializar (seleção/guias).
      if (selected) selected.classList.remove("dt-selected");
      document.querySelectorAll(".dt-guide").forEach(function (g) { g.remove(); });
      return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
    }
    var saveBtn = document.getElementById("dt-save");
    var exportBtn = document.getElementById("dt-export");
    saveBtn.addEventListener("click", function () {
      var payload = { html: serializeHtml(), edits: buildPayload() };
      saveBtn.textContent = "Salvando…";
      fetch("/save", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
        .then(function (res) {
          saveBtn.textContent = res.ok ? "Salvo ✓" : "Erro";
          if (!res.ok) console.error("save errors:", res.b.errors);
          setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1500);
        }).catch(function () { saveBtn.textContent = "Offline"; setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1500); });
    });
    exportBtn.addEventListener("click", function () {
      exportBtn.textContent = "Exportando…";
      fetch("/export", { method: "POST" })
        .then(function (r) { exportBtn.textContent = r.ok ? "Exportado ✓" : "Erro"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 2000); })
        .catch(function () { exportBtn.textContent = "Offline"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 2000); });
    });
```

- [ ] **Step 2: Verificar save/export no navegador**

Suba o estúdio sobre um post real, faça edições, clique Salvar, depois Exportar.
Expected: botão vira "Salvo ✓"; no disco, `design/preview.html` foi sobrescrito e `design/edits.json` criado com os deltas; "Exportado ✓" e PNGs atualizados em `export/`.

Run (após salvar):
```bash
cat export/conteudos/carrossel/<post>/design/edits.json | head -30
```
Expected: JSON válido com `estilo`, `post`, `slides[].edits[]` contendo `scope`.

- [ ] **Step 3: Commit**

```bash
git add templates/wrappers/preview-wrapper.html
git commit -m "feat(studio): Save and Export buttons POST to studio server"
```

---

## Task 14: Round-trip de aceitação ponta-a-ponta

Valida o fluxo inteiro num post novo, garantindo que a saída do editor continua exportável pelo `export-png.js`.

**Files:** nenhum (teste de aceitação manual + comando).

- [ ] **Step 1: Gerar um preview novo a partir do wrapper reescrito**

Crie uma pasta de teste e consolide um preview do estilo `editorial` já tagueado:

```bash
mkdir -p /tmp/dtpost/design
# copia o wrapper e injeta UM slide do template tagueado como section[data-slide="1"]:
node -e '
const fs=require("fs");
const wrap=fs.readFileSync("templates/wrappers/preview-wrapper.html","utf8");
let slide=fs.readFileSync("templates/social-media/carrossel/estilos/editorial/slide.html","utf8");
const style=(slide.match(/<style>[\s\S]*?<\/style>/)||[""])[0];
const sec=(slide.match(/<section class="slide capa"[\s\S]*?<\/section>/)||[""])[0];
const inner=style+"\n"+sec.replace(/data-slide="[^"]*"/,"");
const html=wrap.replace("<!-- SLIDES_HERE -->",
  `<section data-slide="1" data-block="capa" style="width:1080px;height:1350px;">${inner}</section>`);
fs.writeFileSync("/tmp/dtpost/design/preview.html",html);
console.log("preview de teste criado");
'
```

- [ ] **Step 2: Editar no estúdio e salvar**

```bash
node scripts/studio.js /tmp/dtpost \
  --estilo templates/social-media/carrossel/estilos/editorial/estilo.md --port 4321 &
sleep 1; echo "abra http://localhost:4321 — edite o título, mude tamanho da logo, salve, depois encerre"
```
No navegador: selecione o título, edite o texto; selecione a logo, mude o tamanho; clique Salvar. Encerre com `kill %1`.

Expected: `Salvo ✓`; `/tmp/dtpost/design/edits.json` existe com um delta `target:"título" prop:"text" scope:"content"` e `target:"logo" prop:"size" scope:"structural"`.

- [ ] **Step 3: Exportar e conferir compatibilidade**

```bash
node scripts/export-png.js /tmp/dtpost
ls -la /tmp/dtpost/export/
```
Expected: gera `slide-1.png` sem erro — confirma que o `preview.html` editado (com `section[data-slide]`, sem JS nos slides, dimensões preservadas) continua exportável.

- [ ] **Step 4: Validar o edits.json salvo contra o schema**

```bash
node -e '
import("./scripts/studio/validate-edits.js").then(async (m)=>{
  const fs=await import("node:fs");
  const e=JSON.parse(fs.readFileSync("/tmp/dtpost/design/edits.json","utf8"));
  console.log(m.validateEdits(e));
});
'
```
Expected: `{ valid: true, errors: [] }`.

- [ ] **Step 5: Limpar**

Run: `rm -rf /tmp/dtpost`
Expected: sem saída.

---

## Task 15: Atualizar a pausa do Passo 9 no `/novo-post`

Trocar a instrução "abra no Claude Design" pela sessão de estúdio. (Os Passos 9.5/aprendizado e a marcação de materiais entram nos Planos 2 e 3.)

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Substituir o bloco de pausa do Passo 9**

Em `### 9. Design (pausa)`, troque o bloco `#### Pausa para revisão do preview` por:

```markdown
#### Pausa para revisão e edição no estúdio

```
Design gerado em export/conteudos/<formato>/<data>-<slug>/design/ (estilo: <slug | ad-hoc>):
- preview.html
- <assets individuais>

Abra o estúdio local para revisar e ajustar (texto, tamanho, posição, foto, estilo):

  node scripts/studio.js export/conteudos/<formato>/<data>-<slug> \
    --estilo <caminho do estilo.md>

No estúdio: edite, clique "Salvar" (grava preview.html + edits.json) e "Exportar" quando estiver pronto.

Opções de resposta:
- "ok" / "exportei" → sigo para a validação técnica (Passo 10).
- Peça ajustes que prefira que eu (Designer) faça → repasso ao Designer.
```

**Aguarde resposta.** Ajustes visuais agora são feitos pelo usuário no estúdio (zero token). Se o usuário pedir explicitamente um ajuste via Designer, repasse o ponto específico. Quando confirmar, siga para o Passo 10.
```

- [ ] **Step 2: Atualizar a tabela `## Fluxo` e a linha do designer na tabela de agentes**

Na linha do Passo 9 da tabela `## Fluxo`, ajuste o "Entrega" para `assets + edits.json (via estúdio)`. Na seção de agentes, na linha do `designer`, mantenha a descrição mas note que o preview agora é editado no estúdio local (não no Claude Design).

- [ ] **Step 3: Verificação (revisão de prosa)**

Run: `grep -n "studio.js\|Claude Design" .claude/skills/novo-post/SKILL.md`
Expected: aparece `studio.js` no Passo 9; nenhuma instrução remanescente mandando "abrir no Claude Design" no Passo 9 (as referências em Passos 13.5/13.6 ficam para o Plano 2/3).

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "docs(novo-post): replace Claude Design step with local studio session"
```

---

## Self-Review

**Cobertura do spec (Componentes A + D):**
- Editor reescrito do zero (A) → Tasks 8–13. ✓
- Painel preso ao contrato (slots/tokens do estilo.md) → Tasks 2 (parser), 10 (slotDef), 11 (controles). ✓
- Guias inteligentes → Task 12. ✓
- `edits.json` com `scope` content/structural → Tasks 3 (schema), 11 (tracking). ✓
- Servidor local serve+save+export (D) → Tasks 4 (handlers), 5 (entry). ✓
- Compatibilidade com `export-png.js` → Task 14 (round-trip). ✓
- Convenção DOM→contrato (`data-block`/`data-slot`) → Tasks 6 (templates), 7 (designer). ✓
- Integração no `/novo-post` Passo 9 → Task 15. ✓
- Fora de escopo (Planos 2/3): loop de aprendizado (lê edits.json → promove estilo.md), gerenciador de materiais. Declarado no cabeçalho. ✓

**Placeholders:** nenhum "TBD/TODO"; todo passo de código tem código completo. As tasks de browser são explicitamente de aceitação (não unit) — declarado. A única nota de cuidado é a aspa do template literal no comando da Task 6 Step 4 (sinalizada inline).

**Consistência de tipos/nomes:** `parseEstilo`/`parseSlotDescriptor` (Task 2) usados em handlers (Task 4) e no contrato do editor (Task 10). `validateEdits` (Task 3) usado em `saveEdits` (Task 4) e na Task 14. `window.__DT` cresce de forma aditiva (Tasks 8→9→10→11→13) sem renomear campos. `recordEdit`/`SCOPE`/`buildPayload` consistentes entre Tasks 11 e 13. Rotas `/`, `/contract`, `/save`, `/export` idênticas entre handlers (Task 4), entry (Task 5) e wrapper (Tasks 10/13).

---

## Execução

Plano salvo. Próximo: escolher modo de execução (subagent-driven recomendado) — ou seguir para os Planos 2 e 3 depois deste estar de pé.
