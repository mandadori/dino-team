# Dino Editor — Correções de edição (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir 7 problemas de UX de edição no Dino Editor: seleção de trecho, barra flutuante de formatação, seletor de cor nativo + conta-gotas, seta do swipe cue, preview por estilo, estabilidade sob zoom do navegador e alças proporcionais.

**Architecture:** Sem mudança de arquitetura. Cada correção é isolada num arquivo/função existente. Lógica pura (visibilidade de alças, freeze, default de scaffold) vai pra módulos testáveis com `node:test`; wiring de UI (caret, barra, cor, scroll) é coberto por testes e2e Puppeteer em `integration.e2e.js` e validado no preview ao vivo.

**Tech Stack:** JS vanilla (sem build), `node:test` + `jsdom` (unit), `puppeteer` (e2e). Servidor local em `scripts/editor/server.js`. Estilos em `templates/social-media/carrossel/estilos/<slug>/`.

**Spec:** `docs/specs/2026-06-06-dino-editor-correcoes-edicao-design.md`

---

## File Structure

**Modificados:**
- `scripts/editor/geom.js` — + função pura `handleVisibility` (qual alça mostrar por tamanho de box).
- `scripts/editor/geom.test.js` — + testes de `handleVisibility`.
- `scripts/editor/overlay.js` — visibilidade de alças (#7); caret na entrada de edição (#1); guarda de blur + `savedRange` (#2); cor nativa + conta-gotas na barra (#3); preservação de scroll na seleção (#6).
- `scripts/editor/index.html` — CSS de alça pequena (#7); CSS de `.dt-tb-color`/`.pnl-eyedrop` (#3); CSS de `#dt-stage.is-busy` (#6).
- `scripts/editor/freeze.js` — `frozenStyleFor` aceita `opts.nowrap` (não pina width) (#4).
- `scripts/editor/freeze.test.js` — + teste de texto `nowrap`.
- `scripts/editor/app.js` — `freezeLayout` detecta `nowrap` e repassa (#4); hook de teste `_edit` (#1).
- `scripts/editor/panel.js` — campo de cor de texto nativo + conta-gotas; conta-gotas nos `colorRow` de fundo; helper `DT.eyedrop` (#3).
- `scripts/editor/scaffold-estilo.js` — extrai `defaultOutFor`, guarda `main()`, default `--out` = `preview/` do estilo (#5).
- `scripts/editor/integration.e2e.js` — + testes e2e (#1, #2, #3-estrutural, #6).
- `templates/social-media/carrossel/estilos/editorial/slide.html` — CSS do swipe cue (#4).
- `templates/social-media/carrossel/estilos/treino-dino/slide.html` — CSS do swipe cue (#4).
- `.claude/skills/novo-estilo/SKILL.md` — caminho do preview = pasta do estilo (#5).

**Criados:**
- `scripts/editor/scaffold-estilo.test.js` — teste de `defaultOutFor`.
- `templates/social-media/carrossel/estilos/{editorial,layout-dividido,treino-dino}/preview/design/slide-N.html` — previews commitados (gerados, #5).

**Removidos:**
- `export/conteudos/carrossel/_preview-editorial/`, `_preview-layout-dividido/`, `_preview-treino-dino/` (órfãos, #5).

---

## Task 1: Alças de seleção proporcionais (#7)

**Files:**
- Modify: `scripts/editor/geom.js`
- Test: `scripts/editor/geom.test.js`
- Modify: `scripts/editor/overlay.js` (`drawSelection`)
- Modify: `scripts/editor/index.html` (CSS opcional)

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao fim de `scripts/editor/geom.test.js` (antes do `EOF`, depois dos testes existentes):

```js
import { handleVisibility, HANDLE_HIDE_EDGES_BELOW, HANDLE_HIDE_ALL_BELOW } from "./geom.js";

test("handleVisibility: box grande mostra cantos e arestas", () => {
  assert.deepEqual(handleVisibility(200, 120), { corners: true, edges: true });
});

test("handleVisibility: box pequeno esconde só as arestas", () => {
  const v = handleVisibility(40, 200); // min=40 < 48
  assert.deepEqual(v, { corners: true, edges: false });
});

test("handleVisibility: box muito pequeno esconde tudo", () => {
  const v = handleVisibility(18, 18); // min=18 < 24
  assert.deepEqual(v, { corners: false, edges: false });
});

test("handleVisibility: limiares exportados", () => {
  assert.equal(HANDLE_HIDE_EDGES_BELOW, 48);
  assert.equal(HANDLE_HIDE_ALL_BELOW, 24);
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm test -- --test-name-pattern="handleVisibility"`
Expected: FAIL — `handleVisibility` não é exportado (`SyntaxError`/`undefined`).

- [ ] **Step 3: Implementar a função pura**

Em `scripts/editor/geom.js`, ANTES do bloco `if (typeof window !== "undefined")`, adicionar:

```js
// Visibilidade das alças conforme o tamanho do box NA TELA (px já escalados).
// Box pequeno: só cantos (desafoga). Box muito pequeno: nenhuma — resize fino
// fica pelo campo "Tam" do painel e pelas setas do teclado.
export const HANDLE_HIDE_EDGES_BELOW = 48;
export const HANDLE_HIDE_ALL_BELOW = 24;
export function handleVisibility(screenW, screenH) {
  const m = Math.min(screenW, screenH);
  if (m < HANDLE_HIDE_ALL_BELOW) return { corners: false, edges: false };
  if (m < HANDLE_HIDE_EDGES_BELOW) return { corners: true, edges: false };
  return { corners: true, edges: true };
}
```

Atualizar o bridge no fim do arquivo para expor a função:

```js
if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.geom = { resizeKeepingAspect, handleVisibility };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm test -- --test-name-pattern="handleVisibility"`
Expected: PASS (4 testes).

- [ ] **Step 5: Wirar no `drawSelection`**

Em `scripts/editor/overlay.js`, no fim de `drawSelection`, substituir o bloco atual:

```js
    var hide = sel.el.hasAttribute("data-bg-drop");
    handles.forEach(function (h) { var p = HPOS.find(function (x) { return x[0] === h.dataset.pos; }); h.style.left = (L + Wd * p[1]) + "px"; h.style.top = (T + Hd * p[2]) + "px"; h.style.display = hide ? "none" : "block"; });
```

por:

```js
    var isBgDrop = sel.el.hasAttribute("data-bg-drop");
    var vis = DT.geom.handleVisibility(Wd, Hd);
    handles.forEach(function (h) {
      var pos = h.dataset.pos, p = HPOS.find(function (x) { return x[0] === pos; });
      h.style.left = (L + Wd * p[1]) + "px"; h.style.top = (T + Hd * p[2]) + "px";
      var show = pos.length === 2 ? vis.corners : vis.edges;   // cantos = 2 chars (nw/ne/se/sw)
      var small = Math.min(Wd, Hd) < 48;
      h.classList.toggle("sm", small);
      h.style.display = (isBgDrop || !show) ? "none" : "block";
    });
```

- [ ] **Step 6: CSS da alça pequena**

Em `scripts/editor/index.html`, logo após a regra `.dt-handle { ... }` (a que começa com `position: fixed; width: 11px;`), adicionar:

```css
    .dt-handle.sm { width: 8px; height: 8px; margin: -4px 0 0 -4px; }
```

- [ ] **Step 7: Commit**

```bash
git add scripts/editor/geom.js scripts/editor/geom.test.js scripts/editor/overlay.js scripts/editor/index.html
git commit -m "fix(editor): alcas de selecao proporcionais ao tamanho do box (#7)"
```

---

## Task 2: Seta do swipe cue + freeze nowrap (#4)

**Files:**
- Modify: `scripts/editor/freeze.js`
- Test: `scripts/editor/freeze.test.js`
- Modify: `scripts/editor/app.js` (`freezeLayout`)
- Modify: `templates/social-media/carrossel/estilos/editorial/slide.html`
- Modify: `templates/social-media/carrossel/estilos/treino-dino/slide.html`

- [ ] **Step 1: Escrever o teste que falha**

Adicionar ao fim de `scripts/editor/freeze.test.js`:

```js
test("frozenStyleFor: texto nowrap NÃO fixa width (cresce com a fonte)", () => {
  const s = frozenStyleFor({ left: 10, top: 20, width: 120, height: 40 }, "text", { nowrap: true });
  assert.equal(s.position, "absolute");
  assert.equal(s.left, "10px");
  assert.equal(s.width, undefined);   // sem width → cresce com a fonte, seta não some
  assert.equal(s.height, undefined);
});

test("frozenStyleFor: texto sem opts mantém width (compat)", () => {
  const s = frozenStyleFor({ left: 0, top: 0, width: 200.4, height: 40 }, "text");
  assert.equal(s.width, "201px");
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm test -- --test-name-pattern="nowrap"`
Expected: FAIL — `s.width` é `"120px"`, esperado `undefined`.

- [ ] **Step 3: Implementar o `opts.nowrap`**

Em `scripts/editor/freeze.js`, substituir a função `frozenStyleFor` inteira por:

```js
export function frozenStyleFor(rect, type, opts) {
  const style = {
    position: "absolute",
    left: Math.round(rect.left) + "px",
    top: Math.round(rect.top) + "px",
  };
  if (type === "text") {
    // Texto comum fixa width (ceil) pra preservar quebra de linha. Texto nowrap
    // (ex.: swipe-cue inline-flex com seta ::after) NÃO fixa width — senão, ao
    // crescer a fonte, a seta estoura/colapsa e some.
    if (!(opts && opts.nowrap)) style.width = Math.ceil(rect.width) + "px";
  } else {
    style.width = Math.round(rect.width) + "px";
    style.height = Math.round(rect.height) + "px";
  }
  return style;
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `npm test -- --test-name-pattern="frozenStyleFor"`
Expected: PASS (todos os casos de `frozenStyleFor`, incl. os antigos).

- [ ] **Step 5: Repassar `nowrap` no call site (`freezeLayout`)**

Em `scripts/editor/app.js`, dentro de `freezeLayout`, no `.map` que mede os elementos, substituir:

```js
    var measures = els.map(function (el) {
      if (DT.freeze.isFrozen(el)) return null;
      var op = el.offsetParent || root;
      var b = el.getBoundingClientRect(), ob = op.getBoundingClientRect();
      var type = containers.indexOf(el) !== -1 ? "box" : DT.overlay.typeOf(el);
      return { el: el, type: type, rect: { left: b.left - ob.left, top: b.top - ob.top, width: b.width, height: b.height } };
    });
```

por:

```js
    var measures = els.map(function (el) {
      if (DT.freeze.isFrozen(el)) return null;
      var op = el.offsetParent || root;
      var b = el.getBoundingClientRect(), ob = op.getBoundingClientRect();
      var type = containers.indexOf(el) !== -1 ? "box" : DT.overlay.typeOf(el);
      var ws = view.getComputedStyle(el).whiteSpace;
      var nowrap = ws === "nowrap" || ws === "pre";
      return { el: el, type: type, nowrap: nowrap, rect: { left: b.left - ob.left, top: b.top - ob.top, width: b.width, height: b.height } };
    });
```

E na aplicação logo abaixo, substituir:

```js
      var s = DT.freeze.frozenStyleFor(m.rect, m.type);
```

por:

```js
      var s = DT.freeze.frozenStyleFor(m.rect, m.type, { nowrap: m.nowrap });
```

- [ ] **Step 6: CSS do swipe cue — editorial**

Em `templates/social-media/carrossel/estilos/editorial/slide.html`, substituir:

```css
      gap: 0.4em;
      font-family: var(--font-body);
      font-size: 14px;
```

por:

```css
      gap: 0.4em;
      white-space: nowrap;
      font-family: var(--font-body);
      font-size: 14px;
```

E substituir (bloco `::after`):

```css
      display: inline-block;
      width: 0.60em;
      height: 0.74em;
      background-color: currentColor;
```

por:

```css
      display: inline-block;
      flex: 0 0 auto;
      width: max(10px, 0.60em);
      height: max(12px, 0.74em);
      background-color: currentColor;
```

- [ ] **Step 7: CSS do swipe cue — treino-dino**

Em `templates/social-media/carrossel/estilos/treino-dino/slide.html`, substituir:

```css
      gap: 0.4em;
      font-family: var(--font-body);
      font-size: 26px;
```

por:

```css
      gap: 0.4em;
      white-space: nowrap;
      font-family: var(--font-body);
      font-size: 26px;
```

E substituir (bloco `::after`):

```css
      display: inline-block;
      width: 0.60em;
      height: 0.74em;
      background-color: currentColor;
```

por:

```css
      display: inline-block;
      flex: 0 0 auto;
      width: max(10px, 0.60em);
      height: max(12px, 0.74em);
      background-color: currentColor;
```

- [ ] **Step 8: Commit**

```bash
git add scripts/editor/freeze.js scripts/editor/freeze.test.js scripts/editor/app.js \
  templates/social-media/carrossel/estilos/editorial/slide.html \
  templates/social-media/carrossel/estilos/treino-dino/slide.html
git commit -m "fix(editor): seta do swipe cue nao some ao mudar tamanho do texto (#4)"
```

---

## Task 3: Preview por estilo, fora de export/ (#5)

**Files:**
- Modify: `scripts/editor/scaffold-estilo.js`
- Test: `scripts/editor/scaffold-estilo.test.js` (criar)
- Modify: `.claude/skills/novo-estilo/SKILL.md`
- Criados/Removidos: pastas `preview/` dos estilos / `export/.../_preview-*`

- [ ] **Step 1: Escrever o teste que falha**

Criar `scripts/editor/scaffold-estilo.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve, join } from "node:path";
import { defaultOutFor } from "./scaffold-estilo.js";

test("defaultOutFor: preview na pasta do estilo (não em export/)", () => {
  const out = defaultOutFor("templates/social-media/carrossel/estilos/editorial/estilo.md");
  assert.equal(out, join(resolve("templates/social-media/carrossel/estilos/editorial"), "preview"));
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `node --test scripts/editor/scaffold-estilo.test.js`
Expected: FAIL — `defaultOutFor` não é exportado (e `main()` roda no import, possivelmente saindo com erro).

- [ ] **Step 3: Extrair `defaultOutFor`, guardar `main()`, mudar o default**

Em `scripts/editor/scaffold-estilo.js`:

(a) No topo, ajustar o import de `node:url` (adicionar `pathToFileURL`):

```js
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
```

(b) ANTES de `function main()`, adicionar a função pura exportada:

```js
// Pasta de preview do próprio estilo: .../estilos/<slug>/preview (commitada).
// Substitui o antigo scaffold descartável em export/conteudos/<formato>/_preview-*.
export function defaultOutFor(estiloPath) {
  return join(dirname(resolve(estiloPath)), "preview");
}
```

(c) Dentro de `main()`, substituir:

```js
  const outDir = out || join("export/conteudos", formato, "_preview-" + slug);
```

por:

```js
  const outDir = out || defaultOutFor(estilo);
```

(d) No FIM do arquivo, trocar a chamada nua `main();` por uma guarda (só roda como CLI):

```js
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
```

- [ ] **Step 4: Rodar e confirmar passa**

Run: `node --test scripts/editor/scaffold-estilo.test.js`
Expected: PASS (1 teste).

- [ ] **Step 5: Gerar os previews commitados dos 3 estilos**

```bash
for s in editorial layout-dividido treino-dino; do
  node scripts/editor/scaffold-estilo.js --estilo templates/social-media/carrossel/estilos/$s/estilo.md
done
ls templates/social-media/carrossel/estilos/*/preview/design/
```
Expected: cada estilo agora tem `preview/design/slide-1.html` … (sem nada novo em `export/`).

- [ ] **Step 6: Remover os scaffolds órfãos de export/**

```bash
rm -rf export/conteudos/carrossel/_preview-editorial \
       export/conteudos/carrossel/_preview-layout-dividido \
       export/conteudos/carrossel/_preview-treino-dino
```

- [ ] **Step 7: Atualizar a skill `novo-estilo`**

Em `.claude/skills/novo-estilo/SKILL.md`:

Substituir a linha 99 (`--out export/conteudos/{formato}/_preview-{slug_alvo|rascunho}`) por:

```
     --out templates/social-media/{formato}/estilos/{slug_alvo|_rascunho}/preview
```

Substituir a linha 107 (`npm run editor -- export/conteudos/{formato}/_preview-{slug_alvo|rascunho} \`) por:

```
   npm run editor -- templates/social-media/{formato}/estilos/{slug_alvo|_rascunho}/preview \
```

Na linha 123, substituir `export/conteudos/{formato}/_preview-{...}/design/edits.json` por `templates/social-media/{formato}/estilos/{slug_alvo|_rascunho}/preview/design/edits.json`.

Substituir a linha 129 (`rm -rf export/conteudos/{formato}/_preview-{slug_alvo|rascunho}/`) por (o `preview/` do estilo final é COMMITADO; só o `_rascunho` é removido):

```
# preview do estilo final é commitado junto; remover só o rascunho se existir
rm -rf templates/social-media/{formato}/estilos/_rascunho/
```

Na linha 184, substituir o trecho `assim como o scaffold de preview em \`export/conteudos/{formato}/_preview-*/\`.` por `e o \`preview/\` do estilo (commitado) reflete o \`slide.html\` atual.`

- [ ] **Step 8: Commit**

```bash
git add scripts/editor/scaffold-estilo.js scripts/editor/scaffold-estilo.test.js \
  .claude/skills/novo-estilo/SKILL.md \
  templates/social-media/carrossel/estilos/editorial/preview \
  templates/social-media/carrossel/estilos/layout-dividido/preview \
  templates/social-media/carrossel/estilos/treino-dino/preview
git commit -m "feat(editor): preview por estilo na pasta do estilo, fora de export/ (#5)"
```

---

## Task 4: Caret na entrada de edição de texto (#1)

**Files:**
- Modify: `scripts/editor/overlay.js` (`editText`)
- Modify: `scripts/editor/app.js` (dblclick na surface + hook `_edit`)
- Test: `scripts/editor/integration.e2e.js`

- [ ] **Step 1: Escrever o teste e2e que falha**

Em `scripts/editor/integration.e2e.js`, adicionar ao fim do arquivo (antes de nenhum—é o último teste; usa o harness `before/after` existente):

```js
test("edição entra com seleção colapsada (caret), não select-all (#1)", async () => {
  const collapsed = await page.evaluate(() => {
    if (!window.__DT._edit(0, "text")) return null;
    var f = window.__DT.frames()[0];
    var g = f.doc.defaultView.getSelection();
    return g.isCollapsed;
  });
  assert.equal(collapsed, true);
  // limpa o estado de edição pra não vazar pros próximos testes
  await page.evaluate(() => { var f = window.__DT.frames()[0]; var e = f.doc.querySelector('[contenteditable="true"]'); if (e) e.blur(); });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:e2e -- --test-name-pattern="caret"`
Expected: FAIL — `window.__DT._edit` não existe (retorna `null`) **ou** seleção vem não-colapsada (select-all atual).

- [ ] **Step 3: Reescrever `editText` pra posicionar o caret**

Em `scripts/editor/overlay.js`, substituir a função `editText` atual (da assinatura até o `el.addEventListener("blur", done);`) por:

```js
  function editText(el, surface, clientX, clientY) {
    if (typeOf(el) !== "text") return;
    hist().begin();
    surface.style.pointerEvents = "none";       // deixa o iframe receber foco/teclado
    var before = el.innerHTML;
    el.setAttribute("contenteditable", "true"); el.focus();
    var doc = el.ownerDocument, view = doc.defaultView, selo = view.getSelection();
    // Caret no ponto do clique (em vez de selecionar tudo) → permite pegar trecho.
    var rng = null;
    if (clientX != null && doc.caretRangeFromPoint && view.frameElement) {
      var fr = view.frameElement.getBoundingClientRect(), s = fr.width / W;
      rng = doc.caretRangeFromPoint((clientX - fr.left) / s, (clientY - fr.top) / s);
    }
    try {
      selo.removeAllRanges();
      if (rng) { selo.addRange(rng); }
      else { var r2 = doc.createRange(); r2.selectNodeContents(el); r2.collapse(false); selo.addRange(r2); }
    } catch (_) {}
    function onSelChange() { updateTextToolbar(el); }
    doc.addEventListener("selectionchange", onSelChange);
    function done() {
      el.removeAttribute("contenteditable"); el.removeEventListener("blur", done);
      doc.removeEventListener("selectionchange", onSelChange); hideTextToolbar();
      surface.style.pointerEvents = "";
      if (el.innerHTML !== before) DT.edits.record(sel.n, sel.block, slotOf(el), "text", textOf(before), el.textContent);
      drawSelection();
    }
    el.addEventListener("blur", done);
  }
```

- [ ] **Step 4: Passar as coords do clique nos dois call sites de `editText`**

Em `scripts/editor/overlay.js`, no `drawSelection`, o dblclick do selbox — substituir:

```js
      box.addEventListener("dblclick", function (e) { if (sel && typeOf(sel.el) === "text") { e.preventDefault(); editText(sel.el, sel.surface); } });
```

por:

```js
      box.addEventListener("dblclick", function (e) { if (sel && typeOf(sel.el) === "text") { e.preventDefault(); editText(sel.el, sel.surface, e.clientX, e.clientY); } });
```

Em `scripts/editor/app.js`, no `wire`, o dblclick da surface — substituir:

```js
    surf.addEventListener("dblclick", function (e) { var el = hitTest(frame, e.clientX, e.clientY); if (el && DT.overlay.typeOf(el) === "text") { DT.overlay.select(ctx(frame, el)); DT.overlay.editText(el, surf); } });
```

por:

```js
    surf.addEventListener("dblclick", function (e) { var el = hitTest(frame, e.clientX, e.clientY); if (el && DT.overlay.typeOf(el) === "text") { DT.overlay.select(ctx(frame, el)); DT.overlay.editText(el, surf, e.clientX, e.clientY); } });
```

- [ ] **Step 5: Adicionar o hook de teste `_edit`**

Em `scripts/editor/app.js`, dentro de `window.__DT = { ... }`, após a entrada `_selectType: ...`, adicionar (lembrar da vírgula na linha anterior):

```js
    ,
    // hook de teste: seleciona um elemento do tipo e entra em edição (sem coords →
    // caret colapsado no fim). Usado pelos e2e de edição de texto.
    _edit: function (i, type) { if (!this._selectType(i, type || "text")) return false; var s = DT.overlay.current(); if (!s) return false; DT.overlay.editText(s.el, s.surface); return true; }
```

- [ ] **Step 6: Rodar e confirmar passa**

Run: `npm run test:e2e -- --test-name-pattern="caret"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/editor/overlay.js scripts/editor/app.js scripts/editor/integration.e2e.js
git commit -m "fix(editor): entrar em edicao posiciona caret, permite selecionar trecho (#1)"
```

---

## Task 5: Barra flutuante de trecho — guarda de blur (#2)

**Files:**
- Modify: `scripts/editor/overlay.js` (`updateTextToolbar`, `applyToSelection`, `buildTextToolbar`, `editText.done`)
- Test: `scripts/editor/integration.e2e.js`

- [ ] **Step 1: Escrever o teste e2e que falha**

Em `scripts/editor/integration.e2e.js`, adicionar ao fim:

```js
test("barra de trecho aplica negrito e mantém a edição (#2)", async () => {
  const res = await page.evaluate(async () => {
    if (!window.__DT._edit(0, "text")) return { ok: false, reason: "no-edit" };
    var f = window.__DT.frames()[0];
    var el = window.__DT.selection().el, doc = f.doc, view = doc.defaultView;
    // seleciona os 3 primeiros chars do primeiro nó de texto
    var tn = null; (function walk(n){ for (var c=n.firstChild;c;c=c.nextSibling){ if(c.nodeType===3 && c.textContent.trim()){ tn=c; return; } if(c.nodeType===1) walk(c); } })(el);
    if (!tn) return { ok: false, reason: "no-textnode" };
    var r = doc.createRange(); r.setStart(tn, 0); r.setEnd(tn, Math.min(3, tn.textContent.length));
    var g = view.getSelection(); g.removeAllRanges(); g.addRange(r);
    doc.dispatchEvent(new Event("selectionchange"));
    // espera a barra aparecer
    await new Promise(function(res){ setTimeout(res, 30); });
    var tb = document.querySelector(".dt-text-tb");
    if (!tb || tb.style.display === "none") return { ok: false, reason: "no-toolbar" };
    tb.querySelector("button").click();      // primeiro botão = "B" (negrito 700)
    await new Promise(function(res){ setTimeout(res, 30); });
    return { ok: true, html: el.innerHTML, editing: el.getAttribute("contenteditable") === "true" };
  });
  assert.equal(res.ok, true, "fluxo: " + res.reason);
  assert.match(res.html, /font-weight:\s*700/, "trecho deveria ficar em negrito");
  assert.equal(res.editing, true, "deveria continuar em edição (barra não derrubou)");
  await page.evaluate(() => { var f = window.__DT.frames()[0]; var e = f.doc.querySelector('[contenteditable="true"]'); if (e) e.blur(); });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:e2e -- --test-name-pattern="negrito"`
Expected: FAIL — o clique na barra derruba a edição (`editing` false) e o estilo não é aplicado (`html` sem `font-weight: 700`).

- [ ] **Step 3: Adicionar estado `savedRange`/`tbBusy` e guardar a seleção**

Em `scripts/editor/overlay.js`, na seção "texto inline", substituir a declaração:

```js
  var textTB = null;             // mini-barra flutuante de formatação de trecho
```

por:

```js
  var textTB = null;             // mini-barra flutuante de formatação de trecho
  var savedRange = null;         // último range não-colapsado (sobrevive ao blur)
  var tbBusy = false;            // interação em curso com a barra → não comita no blur
```

- [ ] **Step 4: Blindar o `blur` em `editText.done`**

Em `scripts/editor/overlay.js`, dentro de `editText` (a versão da Task 4), substituir a função `done` por:

```js
    function done() {
      // Clique na barra (top-level) tira o foco do editável (iframe). preventDefault
      // cross-document não segura o blur — então, se a interação é com a barra,
      // abortamos o commit, re-focamos e restauramos a seleção.
      if (tbBusy) { setTimeout(function () { try { el.focus(); restoreSaved(el); } catch (_) {} }, 0); return; }
      el.removeAttribute("contenteditable"); el.removeEventListener("blur", done);
      doc.removeEventListener("selectionchange", onSelChange); hideTextToolbar();
      surface.style.pointerEvents = "";
      savedRange = null;
      if (el.innerHTML !== before) DT.edits.record(sel.n, sel.block, slotOf(el), "text", textOf(before), el.textContent);
      drawSelection();
    }
```

- [ ] **Step 5: Salvar o range em `updateTextToolbar` + helper `restoreSaved`**

Em `scripts/editor/overlay.js`, substituir `updateTextToolbar` por:

```js
  function updateTextToolbar(el) {
    var doc = el.ownerDocument, gsel = doc.defaultView.getSelection();
    if (!gsel || gsel.rangeCount === 0 || gsel.isCollapsed) { hideTextToolbar(); return; }
    var range = gsel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) { hideTextToolbar(); return; }
    savedRange = range.cloneRange();
    if (!textTB) textTB = buildTextToolbar(el);
    textTB.__el = el;
    var fr = el.ownerDocument.defaultView.frameElement.getBoundingClientRect(), s = fr.width / W;
    var rb = range.getBoundingClientRect();
    textTB.style.display = "flex";
    textTB.style.left = (fr.left + (rb.left + rb.width / 2) * s) + "px";
    textTB.style.top = (fr.top + rb.top * s - 44) + "px";
  }
  function restoreSaved(el) {
    if (!savedRange) return;
    var gsel = el.ownerDocument.defaultView.getSelection();
    gsel.removeAllRanges(); gsel.addRange(savedRange);
  }
```

- [ ] **Step 6: `applyToSelection` opera sobre o range salvo e limpa `tbBusy`**

Em `scripts/editor/overlay.js`, substituir `applyToSelection` por:

```js
  function applyToSelection(styleObj) {
    var el = textTB && textTB.__el; if (!el) { tbBusy = false; return; }
    var doc = el.ownerDocument, gsel = doc.defaultView.getSelection();
    var range = (gsel && gsel.rangeCount && !gsel.isCollapsed) ? gsel.getRangeAt(0) : savedRange;
    if (!range || range.collapsed) { tbBusy = false; return; }
    var span = DT.spans.applyStyleToRange(range, styleObj);
    DT.spans.mergeSpans(el);
    if (span) { var r = doc.createRange(); r.selectNodeContents(span); savedRange = r.cloneRange(); gsel.removeAllRanges(); gsel.addRange(r); }
    updateTextToolbar(el);
    tbBusy = false;
  }
```

- [ ] **Step 7: `buildTextToolbar` marca `tbBusy` no pointerdown da barra**

Em `scripts/editor/overlay.js`, dentro de `buildTextToolbar`, logo após `tb.className = "dt-text-tb"; tb.style.display = "none";`, adicionar:

```js
    tb.addEventListener("pointerdown", function (e) { tbBusy = true; e.preventDefault(); });
    tb.addEventListener("mousedown", function (e) { tbBusy = true; e.preventDefault(); });
```

- [ ] **Step 8: Rodar e confirmar passa**

Run: `npm run test:e2e -- --test-name-pattern="negrito"`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add scripts/editor/overlay.js scripts/editor/integration.e2e.js
git commit -m "fix(editor): barra de trecho aplica estilo sem derrubar a edicao (#2)"
```

---

## Task 6: Seletor de cor nativo + conta-gotas (#3)

**Files:**
- Modify: `scripts/editor/panel.js` (cor de texto, conta-gotas em fundo, helper `DT.eyedrop`)
- Modify: `scripts/editor/overlay.js` (`buildTextToolbar`: cor na barra)
- Modify: `scripts/editor/index.html` (CSS `.dt-tb-color`, `.pnl-eyedrop`)
- Test: `scripts/editor/integration.e2e.js`

- [ ] **Step 1: Escrever o teste e2e que falha**

Em `scripts/editor/integration.e2e.js`, adicionar ao fim:

```js
test("painel de texto usa input de cor nativo (não dropdown) (#3)", async () => {
  const res = await page.evaluate(() => {
    if (!window.__DT._selectType(0, "text")) return null;
    var p = document.getElementById("dt-panel");
    return { hasColorInput: !!p.querySelector('input[type="color"]'), noColorSelect: !p.querySelector("#p-color") };
  });
  assert.equal(res.hasColorInput, true, "deveria ter <input type=color>");
  assert.equal(res.noColorSelect, true, "não deveria ter mais o select #p-color");
  await page.evaluate(() => DT.overlay.deselect());
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:e2e -- --test-name-pattern="input de cor nativo"`
Expected: FAIL — hoje a cor é um `<select id="p-color">`, não há `input[type=color]` no painel de texto.

- [ ] **Step 3: Helper `DT.eyedrop` + ícone, em panel.js**

Em `scripts/editor/panel.js`, dentro do objeto `ICON = { ... }`, adicionar a entrada (após `lockOff`):

```js
    ,eyedrop: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10.5 2.5a1.8 1.8 0 0 1 2.5 2.5l-1 1 1.2 1.2-1.3 1.3-1.2-1.2L5.5 12.5 3 13l.5-2.5 5.7-5.7z"/></svg>'
```

Logo após a linha `var root = null, contract = null, refs = {};`, adicionar o helper e o bridge:

```js
  // Conta-gotas: pega a cor de qualquer ponto da tela (Chromium). Sem EyeDropper,
  // o caller não desenha o botão (o input nativo já cobre gradiente + hex).
  function eyedrop(onPick) {
    if (!window.EyeDropper) return;
    new window.EyeDropper().open().then(function (res) { if (res && res.sRGBHex) onPick(res.sRGBHex); }).catch(function () {});
  }
  window.DT.eyedrop = eyedrop;
```

- [ ] **Step 4: `colorPickerRow` reutilizável + cor de texto nativa**

Em `scripts/editor/panel.js`, ANTES de `function show(sel)`, adicionar:

```js
  // Linha de cor: <input type=color> nativo (gradiente+hex) + conta-gotas opcional.
  function colorPickerRow(id, val, onChange) {
    var row = el("div", "pnl-row");
    var c = el("input"); c.type = "color"; c.id = id; c.value = val || "#000000";
    c.addEventListener("input", function () { onChange(c.value); });
    row.appendChild(c); refs[id] = c;
    if (window.EyeDropper) {
      var b = el("button", "pnl-eyedrop", ICON.eyedrop); b.title = "Conta-gotas (cor da tela)";
      b.addEventListener("click", function () { eyedrop(function (hex) { c.value = hex; onChange(hex); }); });
      row.appendChild(b);
    }
    return row;
  }
```

No `show`, dentro do bloco `if (type === "text")`, substituir:

```js
      ty.appendChild(label("Cor"));
      ty.appendChild(el("div", "pnl-row", null)).appendChild(selectField("p-color", COLORS, hexOf(cs.color)));
```

por:

```js
      ty.appendChild(label("Cor"));
      ty.appendChild(colorPickerRow("p-color-input", hexOf(cs.color) || "#ffffff", function (v) { DT.overlay.setStyle("color", v); }));
```

Em `bindCommon`, remover a linha que ligava o select antigo:

```js
    bindOne("p-color", function (v) { if (v) DT.overlay.setStyle("color", v); });
```

(A cor agora é aplicada pelo listener inline de `colorPickerRow`.)

- [ ] **Step 5: Conta-gotas nos `colorRow` de fundo**

Em `scripts/editor/panel.js`, dentro de `buildBg`, substituir o `colorRow` local:

```js
    function colorRow(lbl, id, val) { var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl)); var c = el("input"); c.type = "color"; c.id = id; c.value = val || "#000000"; c.addEventListener("input", applyFill); row.appendChild(c); refs[id] = c; return row; }
```

por:

```js
    function colorRow(lbl, id, val) {
      var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl));
      var c = el("input"); c.type = "color"; c.id = id; c.value = val || "#000000"; c.addEventListener("input", applyFill);
      row.appendChild(c); refs[id] = c;
      if (window.EyeDropper) { var b = el("button", "pnl-eyedrop", ICON.eyedrop); b.title = "Conta-gotas"; b.addEventListener("click", function () { eyedrop(function (hex) { c.value = hex; applyFill(); }); }); row.appendChild(b); }
      return row;
    }
```

E dentro de `buildFill`, substituir o `colorRow` local:

```js
    function colorRow(lbl, id, val) { var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl)); var c = el("input"); c.type = "color"; c.id = id; c.value = val; c.addEventListener("change", apply); c.addEventListener("input", apply); row.appendChild(c); refs[id] = c; return row; }
```

por:

```js
    function colorRow(lbl, id, val) {
      var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl));
      var c = el("input"); c.type = "color"; c.id = id; c.value = val; c.addEventListener("change", apply); c.addEventListener("input", apply);
      row.appendChild(c); refs[id] = c;
      if (window.EyeDropper) { var b = el("button", "pnl-eyedrop", ICON.eyedrop); b.title = "Conta-gotas"; b.addEventListener("click", function () { eyedrop(function (hex) { c.value = hex; apply(); }); }); row.appendChild(b); }
      return row;
    }
```

- [ ] **Step 6: Cor nativa + conta-gotas na barra de trecho (overlay.js)**

Em `scripts/editor/overlay.js`, dentro de `buildTextToolbar`, substituir o bloco das 3 bolinhas:

```js
    [["#ffffff", "Branco"], ["#000000", "Preto"], ["#7f7f7f", "Cinza"]].forEach(function (c) {
      var b = btn("", function () { applyToSelection({ color: c[0] }); }); b.title = c[1];
      b.className = "dot"; b.style.background = c[0];
    });
```

por:

```js
    // Cor do trecho: input nativo (gradiente+hex) + conta-gotas. tbBusy mantém a
    // edição viva enquanto o picker/eyedropper abrem (ambos tiram o foco do iframe).
    var ci = document.createElement("input"); ci.type = "color"; ci.className = "dt-tb-color";
    ci.addEventListener("pointerdown", function () { tbBusy = true; });
    ci.addEventListener("input", function () { applyToSelection({ color: ci.value }); });
    tb.appendChild(ci);
    if (window.EyeDropper && DT.eyedrop) {
      var eb = btn("", function () { tbBusy = true; DT.eyedrop(function (hex) { ci.value = hex; applyToSelection({ color: hex }); }); });
      eb.title = "Conta-gotas (cor da tela)"; eb.className = "dt-eyedrop";
      eb.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M10.5 2.5a1.8 1.8 0 0 1 2.5 2.5l-1 1 1.2 1.2-1.3 1.3-1.2-1.2L5.5 12.5 3 13l.5-2.5 5.7-5.7z"/></svg>';
    }
```

- [ ] **Step 7: CSS dos novos controles de cor**

Em `scripts/editor/index.html`:

(a) Após a regra `.dt-text-tb button.dot { ... }`, adicionar:

```css
    .dt-text-tb input.dt-tb-color { -webkit-appearance: none; appearance: none; width: 26px; height: 26px; border: 1px solid rgba(255,255,255,.4); border-radius: 5px; background: transparent; padding: 2px; cursor: pointer; }
    .dt-text-tb input.dt-tb-color::-webkit-color-swatch-wrapper { padding: 0; }
    .dt-text-tb input.dt-tb-color::-webkit-color-swatch { border: none; border-radius: 3px; }
```

(b) Após a regra `.pnl-lock svg { ... }`, adicionar:

```css
    .pnl-eyedrop { flex: 0 0 auto; width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--field-line); background: var(--field-bg); color: var(--ink-dim); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .pnl-eyedrop:hover { color: var(--ink); border-color: var(--accent-d); }
    .pnl-eyedrop svg { width: 14px; height: 14px; }
```

- [ ] **Step 8: Rodar e confirmar passa**

Run: `npm run test:e2e -- --test-name-pattern="input de cor nativo"`
Expected: PASS.

- [ ] **Step 9: Rodar a suíte unit completa (regressão)**

Run: `npm test`
Expected: PASS (nenhum teste unit quebrado pelas mudanças de panel/overlay).

- [ ] **Step 10: Commit**

```bash
git add scripts/editor/panel.js scripts/editor/overlay.js scripts/editor/index.html scripts/editor/integration.e2e.js
git commit -m "feat(editor): seletor de cor nativo + conta-gotas em texto, trecho e fundo (#3)"
```

---

## Task 7: Estabilidade sob zoom do navegador — scroll preservado (#6)

**Files:**
- Modify: `scripts/editor/overlay.js` (`select`/`deselect` preservam scroll do stage)
- Modify: `scripts/editor/index.html` (CSS `#dt-stage.is-busy`)
- Test: `scripts/editor/integration.e2e.js`

- [ ] **Step 1: Escrever o teste e2e que falha**

Em `scripts/editor/integration.e2e.js`, adicionar ao fim:

```js
test("selecionar não joga o carrossel pro início (#6)", async () => {
  const res = await page.evaluate(async () => {
    var stage = document.getElementById("dt-stage");
    DT.overlay.deselect();
    stage.scrollLeft = stage.scrollWidth;     // rola pro fim
    await new Promise(function (r) { setTimeout(r, 40); });
    var before = stage.scrollLeft;
    if (before < 50) return { skipped: true };  // poucos slides: sem scroll útil
    window.__DT._select(window.__DT.frames().length - 1, "[data-dt-selectable]");
    await new Promise(function (r) { setTimeout(r, 250); });  // > transição do painel (140ms)
    return { before: before, after: stage.scrollLeft };
  });
  if (res.skipped) return;
  assert.ok(res.after >= res.before - 10, "scroll deveria ser preservado (antes=" + res.before + " depois=" + res.after + ")");
  await page.evaluate(() => DT.overlay.deselect());
});
```

- [ ] **Step 2: Rodar e confirmar falha**

Run: `npm run test:e2e -- --test-name-pattern="carrossel pro início"`
Expected: FAIL — ao abrir o painel, o `scroll-snap` re-snapa e `after` cai pra perto de 0.

- [ ] **Step 3: CSS — suspender snap durante a troca de seleção**

Em `scripts/editor/index.html`, após a regra `#dt-stage.is-dragging { ... }`, adicionar:

```css
    #dt-stage.is-busy { scroll-snap-type: none; }
```

- [ ] **Step 4: Preservar scrollLeft em select/deselect**

Em `scripts/editor/overlay.js`, adicionar o helper logo após a função `reposition` (perto do topo, na seção helpers/seleção):

```js
  // Abrir/fechar o painel encolhe o #dt-stage → o scroll-snap re-snapa e o carrossel
  // pula pro início. Suspendemos o snap, executamos a troca e restauramos o scrollLeft.
  function preserveScroll(fn) {
    if (!stage) { fn(); return; }
    var sl = stage.scrollLeft;
    stage.classList.add("is-busy");
    fn();
    requestAnimationFrame(function () {
      stage.scrollLeft = sl;
      requestAnimationFrame(function () { stage.scrollLeft = sl; stage.classList.remove("is-busy"); });
    });
  }
```

Substituir `select` e `deselect` por:

```js
  function select(ctx) { sel = ctx; clearHover(); drawSelection(); preserveScroll(function () { if (pnl("show")) DT.panel.show(sel); }); }
  function deselect() { if (!sel) return; clearSelection(); clearGuides(); sel = null; preserveScroll(function () { if (pnl("hide")) DT.panel.hide(); }); }
```

- [ ] **Step 5: Rodar e confirmar passa**

Run: `npm run test:e2e -- --test-name-pattern="carrossel pro início"`
Expected: PASS (ou skip se o fixture tiver poucos slides — nesse caso, validar no preview ao vivo).

- [ ] **Step 6: Commit**

```bash
git add scripts/editor/overlay.js scripts/editor/index.html scripts/editor/integration.e2e.js
git commit -m "fix(editor): selecionar nao joga o carrossel pro inicio sob zoom (#6)"
```

---

## Task 8: Validação final (suíte + preview ao vivo)

**Files:** nenhum (verificação).

- [ ] **Step 1: Rodar a suíte unit completa**

Run: `npm test`
Expected: PASS (geom, freeze, scaffold-estilo, spans, handlers, etc.).

- [ ] **Step 2: Rodar a suíte e2e completa**

Run: `npm run test:e2e`
Expected: PASS (testes existentes + os 4 novos de #1, #2, #3, #6).

- [ ] **Step 3: Subir o editor sobre um preview de estilo pra validação manual**

```bash
npm run editor -- templates/social-media/carrossel/estilos/editorial/preview \
  --estilo templates/social-media/carrossel/estilos/editorial/estilo.md
```

Passar a URL `http://localhost:4321` pro usuário e pedir pra validar ao vivo (NUNCA via agent-browser, conforme regra do projeto):
- (#1) duplo-clique num texto cai com caret no ponto do clique; dá pra arrastar e pegar um trecho.
- (#2) selecionar um trecho → clicar B / cor / A± aplica e a edição continua.
- (#3) cor de texto/fundo abre o seletor nativo (gradiente + hex); botão conta-gotas pega cor da tela.
- (#4) aumentar/diminuir o tamanho do swipe cue mantém a seta visível.
- (#6) com zoom do navegador, clicar num elemento não joga o carrossel pro início.
- (#7) selecionar um texto pequeno mostra só cantos (ou nenhuma alça se minúsculo), sem cobrir o conteúdo.

- [ ] **Step 4: (após OK do usuário) derrubar o servidor**

Encerrar o processo `npm run editor` quando o usuário confirmar.

---

## Self-Review

**Spec coverage:**
- #1 caret → Task 4 ✓
- #2 barra flutuante → Task 5 ✓
- #3 cor nativa + conta-gotas → Task 6 ✓
- #4 swipe cue + freeze nowrap → Task 2 ✓
- #5 preview por estilo → Task 3 ✓
- #6 estabilidade sob zoom → Task 7 ✓
- #7 alças proporcionais → Task 1 ✓
- Entrega final (suíte + preview ao vivo) → Task 8 ✓
- Não-objetivos respeitados (sem zoom próprio, sem picker custom, sem mexer na mecânica de arrasto além de visibilidade).

**Type/símbolo consistency:**
- `handleVisibility(screenW, screenH) → { corners, edges }` definido (Task 1) e consumido (Task 1 step 5). ✓
- `frozenStyleFor(rect, type, opts)` definido (Task 2 step 3) e chamado com `{ nowrap: m.nowrap }` (Task 2 step 5). ✓
- `defaultOutFor(estiloPath)` definido e testado (Task 3). ✓
- `editText(el, surface, clientX, clientY)` — assinatura nova (Task 4) usada nos 2 call sites e no hook `_edit` (sem coords → fallback colapsado). ✓
- `savedRange`/`tbBusy`/`restoreSaved`/`preserveScroll` declarados antes do uso (Tasks 5 e 7). ✓
- `DT.eyedrop` definido em panel.js e consumido em overlay.js (ambos sob `window.DT`, usados em runtime após carga). ✓
- Hook `_edit` adicionado na Task 4 e usado pelos e2e das Tasks 4 e 5. ✓

**Placeholder scan:** sem TBD/TODO; todo step de código mostra o código; comandos com expected output. ✓
