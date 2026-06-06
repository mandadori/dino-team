# Dino Studio — Plano 2: Loop de aprendizado de estilo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ao voltar do estúdio, o Claude Code detecta no `edits.json` as mudanças estruturais que o usuário fez (tamanho de logo, posição de slot, elemento removido) e oferece **promovê-las ao `estilo.md` + `slide.html`** do estilo — codificando o aprendizado para posts futuros.

**Architecture:** Um módulo node determinístico (`extract-structural`) lê o `edits.json` (contrato do Plano 1), filtra `scope == "structural"`, agrupa por bloco e produz linhas legíveis. Um novo passo 9.5 no `/novo-post` apresenta a proposta e, na aprovação, aciona o agente `designer` em **modo promoção** para aplicar os deltas ao `estilo.md` (slots/tokens) e ao `slide.html` (implementação), atomicamente.

**Tech Stack:** Node ≥20 (ESM), `node:test`, edição de markdown/HTML pelo agente `designer`.

**Depende de:** Plano 1 (schema do `edits.json`, `validate-edits.js`). **Escopo:** Componente B do spec `docs/specs/2026-06-02-dino-studio-editor-aprendizado-design.md`.

---

## Estrutura de arquivos

**Criar:**
- `scripts/studio/extract-structural.js` — extrai e agrupa deltas estruturais do `edits.json`.
- `scripts/studio/extract-structural.test.js` — testes.

**Modificar:**
- `.claude/skills/novo-post/SKILL.md` — novo Passo 9.5 (loop de aprendizado).
- `.claude/agents/designer.md` — modo de tarefa "promover deltas estruturais".

---

## Task 1: Extrator de deltas estruturais

**Files:**
- Create: `scripts/studio/extract-structural.js`
- Test: `scripts/studio/extract-structural.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractStructural } from "./extract-structural.js";

const edits = {
  estilo: "editorial",
  estilo_path: "templates/social-media/carrossel/estilos/editorial/estilo.md",
  post: "2026-06-02-do-zero-ao-topo",
  slides: [
    { slide: 1, block: "capa", edits: [
      { target: "logo", prop: "size", from: "120px", to: "96px", scope: "structural" },
      { target: "título", prop: "text", from: "X", to: "Y", scope: "content" },
    ] },
    { slide: 2, block: "corpo", edits: [
      { target: "corpo", prop: "removed", from: "present", to: "removed", scope: "structural" },
    ] },
  ],
};

test("agrupa só deltas structural por bloco", () => {
  const r = extractStructural(edits);
  assert.equal(r.hasStructural, true);
  assert.equal(r.byBlock.length, 2);
  const capa = r.byBlock.find((b) => b.block === "capa");
  assert.equal(capa.deltas.length, 1);
  assert.equal(capa.deltas[0].target, "logo");
});

test("gera linhas legíveis por delta", () => {
  const r = extractStructural(edits);
  const capa = r.byBlock.find((b) => b.block === "capa");
  assert.equal(capa.lines[0], "logo: size 120px→96px");
  const corpo = r.byBlock.find((b) => b.block === "corpo");
  assert.equal(corpo.lines[0], "corpo: removido");
});

test("payload só com content → hasStructural false", () => {
  const r = extractStructural({
    estilo: "x", post: "y",
    slides: [{ slide: 1, block: "capa", edits: [{ target: "t", prop: "text", from: "a", to: "b", scope: "content" }] }],
  });
  assert.equal(r.hasStructural, false);
  assert.deepEqual(r.byBlock, []);
});
```

- [ ] **Step 2: Rodar o teste e ver falhar**

Run: `node --test scripts/studio/extract-structural.test.js`
Expected: FAIL — `Cannot find module './extract-structural.js'`.

- [ ] **Step 3: Implementar o extrator**

```js
// scripts/studio/extract-structural.js
// Filtra deltas scope=structural do edits.json e agrupa por bloco, com linhas legíveis.

function lineFor(d) {
  if (d.prop === "removed") return `${d.target}: removido`;
  const from = d.from == null ? "auto" : d.from;
  return `${d.target}: ${d.prop} ${from}→${d.to}`;
}

export function extractStructural(editsJson) {
  const p = editsJson || {};
  const byBlockMap = {};
  (p.slides || []).forEach((s) => {
    (s.edits || [])
      .filter((e) => e.scope === "structural")
      .forEach((e) => {
        const key = s.block || `slide-${s.slide}`;
        if (!byBlockMap[key]) byBlockMap[key] = { block: key, deltas: [], lines: [] };
        byBlockMap[key].deltas.push(e);
        byBlockMap[key].lines.push(lineFor(e));
      });
  });
  const byBlock = Object.values(byBlockMap);
  return {
    estilo: p.estilo || null,
    estilo_path: p.estilo_path || null,
    hasStructural: byBlock.length > 0,
    byBlock,
  };
}
```

- [ ] **Step 4: Rodar o teste e ver passar**

Run: `node --test scripts/studio/extract-structural.test.js`
Expected: PASS — 3 testes.

- [ ] **Step 5: Commit**

```bash
git add scripts/studio/extract-structural.js scripts/studio/extract-structural.test.js
git commit -m "feat(studio): extract structural deltas from edits.json grouped by block"
```

---

## Task 2: Modo "promoção" no contrato do agente `designer`

O `designer` é o owner do `estilo.md` + `slide.html`; ele aplica os deltas estruturais.

**Files:**
- Modify: `.claude/agents/designer.md`

- [ ] **Step 1: Adicionar o modo de tarefa na seção "Recebo"**

Após o parágrafo que descreve a `Tarefa`, adicione:

```markdown
### Modo promoção (aplicar deltas estruturais ao estilo)

Quando a `Tarefa` for "promover deltas estruturais ao estilo", recebo:
- Caminho do `estilo.md` e do `slide.html` do estilo.
- Lista de deltas por bloco (cada um: `bloco`, `target` = nome do slot, `prop`, `from`, `to`).

Aplico cada delta **atomicamente nos dois arquivos**, mantendo contrato e implementação coerentes:
- `size` num slot → atualizo o token/hint do slot no `## Estrutura` do `estilo.md` (ex.: `~140px`→`~120px`) **e** o CSS correspondente no `slide.html`.
- `position.bottom` → atualizo o `[layout]`/hint de posição do slot no `estilo.md` **e** o CSS no `slide.html`.
- `removed` → removo o slot da `## Estrutura` do bloco no `estilo.md` (ou marco como opcional, se ainda fizer sentido) **e** removo/comento o elemento no `slide.html`.
- `weight`/`align`/`color` → atualizo o hint do slot no `estilo.md` **e** o CSS no `slide.html`.

Não aplico deltas `scope: content` (texto, foto) — esses são do post, não do estilo. Se um delta não tiver mapeamento claro no estilo, devolvo `DELTA_NAO_MAPEAVEL — <bloco/slot/prop>` em vez de adivinhar.
```

- [ ] **Step 2: Adicionar o erro estrutural à seção "Input incompleto"**

Acrescente o bullet:

```markdown
- `DELTA_NAO_MAPEAVEL — <bloco/slot/prop>` — delta estrutural sem correspondência clara no estilo.md/slide.html.
```

- [ ] **Step 3: Verificação (revisão de prosa)**

Run: `grep -n "promoção\|DELTA_NAO_MAPEAVEL" .claude/agents/designer.md`
Expected: o modo promoção e o erro aparecem.

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/designer.md
git commit -m "docs(designer): add structural-delta promotion task mode"
```

---

## Task 3: Passo 9.5 (loop de aprendizado) no `/novo-post`

**Files:**
- Modify: `.claude/skills/novo-post/SKILL.md`

- [ ] **Step 1: Adicionar a linha na tabela `## Fluxo`**

Entre as linhas dos Passos 9 e 10, insira:

```markdown
| 9.5 | ⚙ loop aprendizado + ⏸ (condic.) | edits.json ← 9 | 9 | estilo.md/slide.html atualizados |
```

- [ ] **Step 2: Inserir a seção do Passo 9.5 após o Passo 9**

Após o fim do `### 9. Design (pausa)` e antes do `### 10.`, insira:

````markdown
### 9.5. Loop de aprendizado de estilo (condicional)

Após o usuário salvar no estúdio (Passo 9), leia `export/conteudos/<formato>/<data>-<slug>/design/edits.json` se existir e rode a extração:

```bash
node -e '
import("./scripts/studio/extract-structural.js").then(async (m) => {
  const fs = await import("node:fs");
  const p = "export/conteudos/<formato>/<data>-<slug>/design/edits.json";
  if (!fs.existsSync(p)) { console.log(JSON.stringify({hasStructural:false})); return; }
  console.log(JSON.stringify(m.extractStructural(JSON.parse(fs.readFileSync(p,"utf8")))));
});
'
```

Se `hasStructural` for `false` (ou o arquivo não existir), **pule** este passo sem mensagem.

Se `hasStructural` for `true`, **pause** e apresente:

```
Detectei mudanças estruturais no estilo '<estilo>':
<para cada bloco em byBlock>
- bloco <block>: <lines unidas por " · ">

Promover ao estilo.md? Isso atualiza o estilo para posts futuros.
- "tudo"            → promove todos os deltas
- "<bloco/slot>"    → promove só os escolhidos
- "não"             → fica só neste post (estilo intacto)
```

**Aguarde resposta.** Se "não", siga para o Passo 10 sem alterar o estilo.

Se "tudo" ou seleção, acione `designer` em modo promoção:

```
Tarefa: promover deltas estruturais ao estilo.

Inputs:
- estilo.md: <estilo_path do edits.json>
- slide.html: <pasta do estilo>/slide.html
- Deltas a aplicar (por bloco):
  <lista filtrada de byBlock[].deltas — bloco, target, prop, from, to>

Aplique cada delta nos dois arquivos atomicamente conforme o modo promoção do seu contrato.
Saída: manifesto com os arquivos alterados.
```

Em `DELTA_NAO_MAPEAVEL`, reporte ao usuário o delta problemático e siga com os demais (não trave o pipeline). Após a promoção, siga para o Passo 10.
````

- [ ] **Step 3: Verificação (revisão de prosa)**

Run: `grep -n "9.5\|Loop de aprendizado\|extract-structural" .claude/skills/novo-post/SKILL.md`
Expected: a seção 9.5 e a chamada ao `extract-structural.js` aparecem; a tabela de fluxo tem a linha 9.5.

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/novo-post/SKILL.md
git commit -m "docs(novo-post): add step 9.5 style-learning loop"
```

---

## Task 4: Aceitação ponta-a-ponta do loop

**Files:** nenhum (aceitação com fixture).

- [ ] **Step 1: Criar um edits.json de fixture com deltas estruturais**

```bash
mkdir -p /tmp/dt-learn
cat > /tmp/dt-learn/edits.json <<'JSON'
{
  "estilo": "editorial",
  "estilo_path": "templates/social-media/carrossel/estilos/editorial/estilo.md",
  "post": "teste",
  "slides": [
    { "slide": 1, "block": "capa", "edits": [
      { "target": "título", "prop": "size", "from": "140px", "to": "120px", "scope": "structural" },
      { "target": "título", "prop": "text", "from": "A", "to": "B", "scope": "content" }
    ] }
  ]
}
JSON
```

- [ ] **Step 2: Rodar a extração e conferir a saída**

```bash
node -e '
import("./scripts/studio/extract-structural.js").then(async (m) => {
  const fs = await import("node:fs");
  const r = m.extractStructural(JSON.parse(fs.readFileSync("/tmp/dt-learn/edits.json","utf8")));
  console.log(JSON.stringify(r, null, 2));
});
'
```
Expected: `hasStructural: true`, `byBlock[0].block === "capa"`, exatamente 1 delta (`título: size 140px→120px`), o delta `text` (content) ausente.

- [ ] **Step 3: Limpar**

Run: `rm -rf /tmp/dt-learn`
Expected: sem saída.

---

## Self-Review

**Cobertura do spec (Componente B):**
- Detecção determinística via `edits.json` → Task 1 (`extractStructural`). ✓
- Filtro `scope == structural` agrupado por bloco → Task 1. ✓
- Pausa com proposta (tudo/escolher/não) → Task 3 (Passo 9.5). ✓
- Promoção atualiza `estilo.md` + `slide.html` atomicamente → Task 2 (modo promoção no designer) + Task 3 (acionamento). ✓
- `content` nunca promovido → Task 1 (filtro) + Task 2 (regra explícita). ✓

**Placeholders:** nenhum; código completo nas tasks de código; tasks de prosa são contratos de skill/agente verificados por `grep` + revisão. Os comandos inline no SKILL.md usam `<formato>/<data>-<slug>` como variáveis do fluxo (substituídas em runtime), não placeholders de plano.

**Consistência:** `extractStructural` retorna `{estilo, estilo_path, hasStructural, byBlock:[{block, deltas, lines}]}` — usado igual na Task 3 e na aceitação (Task 4). Os nomes de `prop` (`size`, `position.bottom`, `removed`, `weight`, `align`, `color`) batem com o `SCOPE`/`recordEdit` do Plano 1 (Task 11) e com o modo promoção do designer (Task 2).
