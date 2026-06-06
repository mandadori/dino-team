# Dino Editor — Fluidez + 4 Correções · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o Dino Editor fluido (canvas Figma-like) corrigindo 4 inconsistências — cadeado/dimensões, troca de seleção, vizinho corrompido ao mover, e formatação de trecho de texto — mais containment de imagem em zona.

**Architecture:** O editor é client-side clássico (IIFEs em `window.DT`, sem bundler) servido por um server Node local; testes são `node --test`. A solução **congela o layout** (tudo `position:absolute` após as fontes carregarem) para que mover nunca afete vizinhos, extrai a lógica pura para módulos ESM testáveis (`freeze.js`, `geom.js`, `spans.js`) com bridge para `window.DT`, e adiciona um smoke test puppeteer para as invariantes de DOM/layout.

**Tech Stack:** Node 20 (ESM), `node:test`, jsdom (novo devDep, p/ testes de DOM puro), puppeteer (já presente), HTML/CSS/JS clássico no browser.

**Spec:** `docs/specs/2026-06-03-dino-editor-fluidez-e-correcoes-design.md`

---

## File Structure

**Novos arquivos:**
- `scripts/editor/freeze.js` — funções puras do congelamento: `frozenStyleFor(rect, type)`, `isFrozen(el)`. Bridge → `window.DT.freeze`.
- `scripts/editor/geom.js` — proporção de imagem: `resizeKeepingAspect(curW, curH, axis, value, lock)`. Bridge → `window.DT.geom`.
- `scripts/editor/spans.js` — formatação de trecho: `applyStyleToRange(range, styleObj)`, `mergeSpans(root)`. Bridge → `window.DT.spans`.
- `scripts/editor/freeze.test.js`, `geom.test.js`, `spans.test.js` — unit tests.
- `scripts/editor/integration.e2e.js` — smoke test puppeteer (rodado por `npm run test:e2e`, fora do `npm test`).

**Arquivos modificados:**
- `scripts/editor/index.html` — incluir os 3 módulos novos (`type="module"`).
- `scripts/editor/app.js` — `freezeLayout()` chamado após `fonts.ready`; `overflow:hidden` nas zonas via `IFRAME_CSS`; hooks de teste `_select`/`_selectType` em `window.__DT`.
- `scripts/editor/overlay.js` — selbox de fundo `pointer-events:none`; `setW`/`setH` chamam `syncGeom`; toolbar flutuante + wiring de `selectionchange` em `editText`.
- `scripts/editor/panel.js` — bloco "Dimensões" só para imagem.
- `package.json` — devDependency `jsdom` + script `test:e2e`.

> **Nota de desvio do spec:** congelamos apenas os elementos `[data-dt-selectable]` (frente) — `selectable()` já exclui `[data-bg-drop]` (`app.js:132`). Zonas de fundo não refluem e não causam o bug ③; recebem só `overflow:hidden` (containment). Isso é mais seguro que congelar zonas e cumpre o objetivo do spec.

---

## Task 1: Dependência jsdom + script de e2e

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar jsdom como devDependency**

Run:
```bash
npm install --save-dev jsdom
```
Expected: `package.json` ganha `"devDependencies": { "jsdom": "^25.x" }` e o pacote instala sem erro.

- [ ] **Step 2: Adicionar o script `test:e2e`**

Em `package.json`, dentro de `"scripts"`, adicionar a linha `test:e2e` (mantendo as existentes):

```json
  "scripts": {
    "export": "node scripts/export-png.js",
    "editor": "node scripts/editor/server.js",
    "test": "node --test scripts/editor/*.test.js",
    "test:e2e": "node --test scripts/editor/integration.e2e.js"
  },
```

Observação: `npm test` usa o glob `*.test.js` — o smoke (`integration.e2e.js`) **não** é incluído nele (roda só via `npm run test:e2e`), mantendo o `npm test` rápido.

- [ ] **Step 3: Sanidade**

Run: `npm test`
Expected: a suíte atual passa (nenhuma regressão; jsdom instalado).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(editor): add jsdom devDep + test:e2e script"
```

---

## Task 2: `freeze.js` — transform puro do congelamento (TDD)

**Files:**
- Create: `scripts/editor/freeze.js`
- Test: `scripts/editor/freeze.test.js`

- [ ] **Step 1: Escrever o teste que falha**

Create `scripts/editor/freeze.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { frozenStyleFor, isFrozen } from "./freeze.js";

test("frozenStyleFor: texto fixa width (ceil) e NÃO fixa height", () => {
  const s = frozenStyleFor({ left: 10.2, top: 20.8, width: 300.4, height: 120 }, "text");
  assert.equal(s.position, "absolute");
  assert.equal(s.left, "10px");
  assert.equal(s.top, "21px");
  assert.equal(s.width, "301px");        // ceil preserva quebra de linha
  assert.equal(s.height, undefined);     // altura cresce com o conteúdo
});

test("frozenStyleFor: imagem fixa width e height (round)", () => {
  const s = frozenStyleFor({ left: 0, top: 0, width: 200.4, height: 100.6 }, "image");
  assert.equal(s.width, "200px");
  assert.equal(s.height, "101px");
});

test("isFrozen: true só quando position:absolute inline + left definido", () => {
  assert.equal(isFrozen({ style: { position: "absolute", left: "10px" } }), true);
  assert.equal(isFrozen({ style: { position: "absolute", left: "" } }), false);
  assert.equal(isFrozen({ style: { position: "", left: "10px" } }), false);
  assert.equal(isFrozen({ style: {} }), false);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/editor/freeze.test.js`
Expected: FAIL — `Cannot find module './freeze.js'`.

- [ ] **Step 3: Implementar o mínimo**

Create `scripts/editor/freeze.js`:

```js
/* Dino Editor — freeze.js
 * Lógica pura do "congelar layout" (Figma-like). O measuring (getBoundingClientRect,
 * offsetParent) vive em app.js; aqui só o transform rect+tipo → estilos inline,
 * testável sem layout. Bridge para window.DT.freeze no browser.
 */

// rect já vem relativo ao offsetParent. Texto fixa só width (ceil) pra preservar a
// quebra de linha; height fica auto (cresce com o conteúdo). Não-texto fixa W e H.
export function frozenStyleFor(rect, type) {
  const style = {
    position: "absolute",
    left: Math.round(rect.left) + "px",
    top: Math.round(rect.top) + "px",
  };
  if (type === "text") {
    style.width = Math.ceil(rect.width) + "px";
  } else {
    style.width = Math.round(rect.width) + "px";
    style.height = Math.round(rect.height) + "px";
  }
  return style;
}

// Idempotência: elemento já absoluto com left inline → já congelado, pular.
export function isFrozen(el) {
  return !!(el && el.style && el.style.position === "absolute" && el.style.left);
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.freeze = { frozenStyleFor, isFrozen };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/editor/freeze.test.js`
Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
git add scripts/editor/freeze.js scripts/editor/freeze.test.js
git commit -m "feat(editor): freeze.js — transform puro do congelamento de layout"
```

---

## Task 3: `geom.js` — proporção da imagem (TDD)

**Files:**
- Create: `scripts/editor/geom.js`
- Test: `scripts/editor/geom.test.js`

- [ ] **Step 1: Escrever o teste que falha**

Create `scripts/editor/geom.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { resizeKeepingAspect } from "./geom.js";

test("axis w, lock on → height segue a proporção", () => {
  const r = resizeKeepingAspect(200, 100, "w", 300, true);
  assert.deepEqual(r, { width: 300, height: 150 }); // ratio 2:1
});

test("axis h, lock on → width segue a proporção", () => {
  const r = resizeKeepingAspect(200, 100, "h", 50, true);
  assert.deepEqual(r, { width: 100, height: 50 });
});

test("lock off → só o eixo digitado muda (o outro é null)", () => {
  assert.deepEqual(resizeKeepingAspect(200, 100, "w", 300, false), { width: 300, height: null });
  assert.deepEqual(resizeKeepingAspect(200, 100, "h", 50, false), { width: null, height: 50 });
});

test("dimensão atual zerada não quebra (ratio 1)", () => {
  assert.deepEqual(resizeKeepingAspect(0, 0, "w", 80, true), { width: 80, height: 80 });
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/editor/geom.test.js`
Expected: FAIL — `Cannot find module './geom.js'`.

- [ ] **Step 3: Implementar o mínimo**

Create `scripts/editor/geom.js`:

```js
/* Dino Editor — geom.js
 * Proporção de imagem ao redimensionar por valor (campos L/A do painel).
 * Puro e testável. Bridge para window.DT.geom no browser.
 */
export function resizeKeepingAspect(curW, curH, axis, value, lock) {
  const ratio = curW && curH ? curW / curH : 1;
  if (axis === "w") {
    const width = Math.round(value);
    return { width, height: lock ? Math.round(width / ratio) : null };
  }
  const height = Math.round(value);
  return { width: lock ? Math.round(height * ratio) : null, height };
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.geom = { resizeKeepingAspect };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/editor/geom.test.js`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add scripts/editor/geom.js scripts/editor/geom.test.js
git commit -m "feat(editor): geom.js — proporção pura da imagem"
```

---

## Task 4: `spans.js` — formatação de trecho (TDD com jsdom)

**Files:**
- Create: `scripts/editor/spans.js`
- Test: `scripts/editor/spans.test.js`

- [ ] **Step 1: Escrever o teste que falha**

Create `scripts/editor/spans.test.js`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { applyStyleToRange, mergeSpans } from "./spans.js";

function dom(html) {
  const d = new JSDOM(`<!doctype html><body>${html}</body>`);
  return d.window.document;
}

test("applyStyleToRange envolve o trecho num span com o estilo", () => {
  const doc = dom("<p>hello world</p>");
  const p = doc.querySelector("p");
  const text = p.firstChild;            // node de texto "hello world"
  const range = doc.createRange();
  range.setStart(text, 0);
  range.setEnd(text, 5);                // "hello"
  const span = applyStyleToRange(range, { fontWeight: "700" });
  assert.equal(span.tagName, "SPAN");
  assert.equal(span.style.fontWeight, "700");
  assert.equal(span.textContent, "hello");
  assert.match(p.innerHTML, /<span[^>]*>hello<\/span> world/);
});

test("applyStyleToRange retorna null para range colapsado", () => {
  const doc = dom("<p>abc</p>");
  const range = doc.createRange();
  range.setStart(doc.querySelector("p").firstChild, 1);
  range.collapse(true);
  assert.equal(applyStyleToRange(range, { color: "#fff" }), null);
});

test("mergeSpans funde spans adjacentes de estilo idêntico", () => {
  const doc = dom('<p><span style="font-weight: 700;">a</span><span style="font-weight: 700;">b</span></p>');
  mergeSpans(doc.querySelector("p"));
  const spans = doc.querySelectorAll("p span");
  assert.equal(spans.length, 1);
  assert.equal(spans[0].textContent, "ab");
});

test("mergeSpans NÃO funde spans de estilos diferentes", () => {
  const doc = dom('<p><span style="font-weight: 700;">a</span><span style="color: red;">b</span></p>');
  mergeSpans(doc.querySelector("p"));
  assert.equal(doc.querySelectorAll("p span").length, 2);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test scripts/editor/spans.test.js`
Expected: FAIL — `Cannot find module './spans.js'`.

- [ ] **Step 3: Implementar o mínimo**

Create `scripts/editor/spans.js`:

```js
/* Dino Editor — spans.js
 * Formatação de TRECHO de texto: envolve um Range num <span style> e funde spans
 * adjacentes equivalentes (evita "sopa de spans"). DOM puro (sem layout) → testável
 * com jsdom. Bridge para window.DT.spans no browser.
 */

// styleObj: chaves em camelCase do CSSStyleDeclaration, ex.: { fontWeight:"700" },
// { color:"#ffffff" }, { fontSize:"40px" }.
export function applyStyleToRange(range, styleObj) {
  if (!range || range.collapsed) return null;
  const doc = range.commonAncestorContainer.ownerDocument;
  const span = doc.createElement("span");
  Object.keys(styleObj).forEach((k) => { span.style[k] = styleObj[k]; });
  try {
    range.surroundContents(span);                 // range simples (dentro de um nó)
  } catch (_) {
    const frag = range.extractContents();         // range cruzando fronteiras de nó
    span.appendChild(frag);
    range.insertNode(span);
  }
  return span;
}

// Funde spans irmãos adjacentes com o MESMO atributo style; depois normaliza os
// nós de texto. Loop até estabilizar.
export function mergeSpans(root) {
  let changed = true;
  while (changed) {
    changed = false;
    const spans = root.querySelectorAll("span[style]");
    for (const s of spans) {
      const next = s.nextSibling;
      if (next && next.nodeType === 1 && next.tagName === "SPAN" &&
          next.getAttribute("style") === s.getAttribute("style")) {
        while (next.firstChild) s.appendChild(next.firstChild);
        next.remove();
        changed = true;
        break;
      }
    }
  }
  root.normalize();
  return root;
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.spans = { applyStyleToRange, mergeSpans };
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test scripts/editor/spans.test.js`
Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
git add scripts/editor/spans.js scripts/editor/spans.test.js
git commit -m "feat(editor): spans.js — aplicar/mesclar span de trecho de texto"
```

---

## Task 5: Incluir os módulos no HTML + freezeLayout + overflow + hooks de teste

**Files:**
- Modify: `scripts/editor/index.html:126-130`
- Modify: `scripts/editor/app.js` (IFRAME_CSS `12-17`; `wire` `69-79`; `window.__DT` `192`)

- [ ] **Step 1: Incluir os 3 módulos no index.html**

Em `scripts/editor/index.html`, substituir o bloco de scripts (linhas 126-130) por:

```html
  <script src="./edits.js"></script>
  <script src="./history.js"></script>
  <script src="./overlay.js"></script>
  <script src="./panel.js"></script>
  <script src="./app.js"></script>
  <script type="module" src="./freeze.js"></script>
  <script type="module" src="./geom.js"></script>
  <script type="module" src="./spans.js"></script>
```

> Os módulos são `defer` por natureza: executam após o parse dos scripts clássicos e antes do `build()` (que roda só depois dos `fetch`). `app.js`/`overlay.js` só chamam `DT.freeze`/`DT.geom`/`DT.spans` em tempo de interação/build, então `window.DT.*` já está populado.

- [ ] **Step 2: Adicionar `overflow:hidden` nas zonas (containment ② / D4)**

Em `scripts/editor/app.js`, no array `IFRAME_CSS` (linhas 12-17), acrescentar uma regra:

```js
  var IFRAME_CSS = [
    "[data-dt-selectable]{pointer-events:auto!important}",
    "[data-bg-drop]{pointer-events:auto!important}",
    "[data-bg-drop]{overflow:hidden!important}",
    "[contenteditable=true]{outline:2px solid #00b140;cursor:text}",
    "[data-bg-drop].dt-drop{outline:4px dashed #00b140!important;outline-offset:-4px}"
  ].join("");
```

- [ ] **Step 3: Implementar `freezeLayout` e chamá-lo após `fonts.ready`**

Em `scripts/editor/app.js`, substituir a função `wire` inteira (linhas 69-79) por:

```js
  function wire(frame, sugg) {
    var doc = frame.iframe.contentDocument; frame.doc = doc; frame.root = doc.querySelector("section") || doc.body;
    markSelectable(doc);
    prefillBg(frame, sugg);
    // Congela o layout (Figma-like) após as fontes assentarem: cada selecionável
    // vira position:absolute na posição medida → mover um nunca reflui o vizinho.
    var ready = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
    ready.then(function () { freezeLayout(doc, frame.root); });
    var surf = frame.surface;
    surf.addEventListener("pointerdown", function (e) { onDown(frame, e); });
    surf.addEventListener("pointermove", function (e) { if (e.buttons === 0) DT.overlay.hover(frame, hitTest(frame, e.clientX, e.clientY)); });
    surf.addEventListener("pointerleave", function () { DT.overlay.clearHover(); });
    surf.addEventListener("dblclick", function (e) { var el = hitTest(frame, e.clientX, e.clientY); if (el && DT.overlay.typeOf(el) === "text") { DT.overlay.select(ctx(frame, el)); DT.overlay.editText(el, surf); } });
    doc.addEventListener("keydown", onKey);
  }

  // Congela cada [data-dt-selectable] em position:absolute na posição medida.
  // Dois passes (medir tudo → aplicar tudo) pra um congelamento não deslocar a
  // medição do próximo. Idempotente: pula os já congelados (reabrir slide salvo).
  function freezeLayout(doc, root) {
    var view = doc.defaultView;
    if (view.getComputedStyle(root).position === "static") root.style.position = "relative";
    var els = Array.prototype.slice.call(root.querySelectorAll("[data-dt-selectable]"));
    var measures = els.map(function (el) {
      if (DT.freeze.isFrozen(el)) return null;
      var op = el.offsetParent || root;
      var b = el.getBoundingClientRect(), ob = op.getBoundingClientRect();
      return { el: el, type: DT.overlay.typeOf(el), rect: { left: b.left - ob.left, top: b.top - ob.top, width: b.width, height: b.height } };
    });
    measures.forEach(function (m) {
      if (!m) return;
      var s = DT.freeze.frozenStyleFor(m.rect, m.type);
      Object.keys(s).forEach(function (k) { m.el.style[k] = s[k]; });
      m.el.style.right = "auto"; m.el.style.bottom = "auto"; m.el.style.margin = "0";
    });
  }
```

- [ ] **Step 4: Adicionar hooks de teste em `window.__DT`**

Em `scripts/editor/app.js`, substituir a linha do `window.__DT` (linha 192) por:

```js
  window.__DT = {
    frames: function () { return frames; }, edits: function () { return DT.edits.list(); },
    contract: function () { return contract; }, selection: function () { return DT.overlay.current(); },
    hitTest: hitTest, goTo: goTo,
    // hooks de teste (smoke e2e): seleção determinística sem simular ponteiro
    _select: function (i, sel) { var f = frames[i]; if (!f || !f.doc) return false; var el = f.doc.querySelector(sel); if (!el) return false; DT.overlay.select(ctx(f, el)); return true; },
    _selectType: function (i, type) { var f = frames[i]; if (!f || !f.doc) return false; var els = f.doc.querySelectorAll("[data-dt-selectable]"); for (var k = 0; k < els.length; k++) { if (DT.overlay.typeOf(els[k]) === type) { DT.overlay.select(ctx(f, els[k])); return true; } } return false; }
  };
```

- [ ] **Step 5: Verificação manual rápida**

Run:
```bash
node scripts/editor/server.js export/conteudos/carrossel/_editor-test --estilo templates/social-media/carrossel/estilos/editorial/estilo.md --port 4399
```
Abra `http://localhost:4399` no browser. Esperado: os slides carregam normalmente, o texto **não** quebra diferente do original (freeze após fontes), e clicar/mover funciona. Encerre o server (Ctrl-C).

- [ ] **Step 6: Commit**

```bash
git add scripts/editor/index.html scripts/editor/app.js
git commit -m "feat(editor): congelar layout pós-fontes + overflow nas zonas + hooks de teste"
```

---

## Task 6: Troca de seleção — selbox de fundo click-through (②)

**Files:**
- Modify: `scripts/editor/overlay.js` (`drawSelection` `76-97`)

- [ ] **Step 1: Tornar a selbox de fundo não-interativa**

Em `scripts/editor/overlay.js`, dentro de `drawSelection`, localizar o bloco que cria a `box` e ajustar para definir `pointerEvents` conforme o tipo a cada chamada. Substituir o corpo de `drawSelection` (linhas 76-97) por:

```js
  function drawSelection() {
    if (!sel) return;
    var r = sel.iframe.getBoundingClientRect(), s = r.width / W;
    var b = sel.el.getBoundingClientRect();
    var L = r.left + b.left * s, T = r.top + b.top * s, Wd = b.width * s, Hd = b.height * s;
    if (!box) {
      box = document.createElement("div"); box.className = "dt-selbox";
      box.style.cursor = "move";
      box.addEventListener("pointerdown", function (e) { if (sel) { e.preventDefault(); beginMove(sel.surface, e); } });
      box.addEventListener("dblclick", function (e) { if (sel && typeOf(sel.el) === "text") { e.preventDefault(); editText(sel.el, sel.surface); } });
      layer.appendChild(box);
    }
    // Fundo selecionado: a selbox cobriria o slide inteiro e engoliria todo clique.
    // pointer-events:none deixa o clique atravessar pro hit-test e trocar a seleção.
    // Mover o fundo segue possível clicando numa área vazia (cai no bg-drop).
    var t = typeOf(sel.el);
    var isBg = t === "bg-image" || t === "bg-fill" || sel.el.hasAttribute("data-bg-drop");
    box.style.pointerEvents = isBg ? "none" : "auto";
    box.style.left = L + "px"; box.style.top = T + "px"; box.style.width = Wd + "px"; box.style.height = Hd + "px";
    if (!handles.length) {
      HPOS.forEach(function (p) { var h = document.createElement("div"); h.className = "dt-handle"; h.dataset.pos = p[0]; h.addEventListener("pointerdown", onHandleDown); layer.appendChild(h); handles.push(h); });
    }
    var hide = sel.el.hasAttribute("data-bg-drop");
    handles.forEach(function (h) { var p = HPOS.find(function (x) { return x[0] === h.dataset.pos; }); h.style.left = (L + Wd * p[1]) + "px"; h.style.top = (T + Hd * p[2]) + "px"; h.style.display = hide ? "none" : "block"; });
  }
```

> Nota: a `.dt-selbox` no CSS já é `pointer-events:none` por padrão (`index.html:42`); o `box.style.pointerEvents = "auto"` antes era setado uma vez na criação. Agora é definido a cada `drawSelection` conforme o tipo.

- [ ] **Step 2: Verificação manual**

Suba o server (como na Task 5, porta 4399), abra no browser. Selecione o fundo (clique numa área vazia do slide). Depois clique num texto por cima — deve **selecionar o texto** (antes não selecionava). Encerre o server.

- [ ] **Step 3: Commit**

```bash
git add scripts/editor/overlay.js
git commit -m "fix(editor): selbox de fundo click-through — destrava troca de seleção"
```

---

## Task 7: Dimensões da imagem — `setW`/`setH` sincronizam o painel (①)

**Files:**
- Modify: `scripts/editor/overlay.js` (`setW` `273-278`, `setH` `279-284`)

- [ ] **Step 1: Chamar `syncGeom` ao fim de `setW` e `setH`**

Em `scripts/editor/overlay.js`, substituir `setW` e `setH` (linhas 273-284) por:

```js
  function setW(v) {
    if (!sel) return; var el = sel.el, t = typeOf(el); hist().begin();
    if (t === "image") { var b = el.getBoundingClientRect(); el.style.width = Math.round(v) + "px"; if (aspectLock) el.style.height = Math.round(v * (b.height / b.width)) + "px"; DT.edits.record(sel.n, sel.block, slotOf(el), "width", null, el.style.width); }
    else { var bb = el.getBoundingClientRect(), fs = parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).fontSize) || 40; el.style.fontSize = Math.max(8, Math.round(fs * (v / bb.width))) + "px"; DT.edits.record(sel.n, sel.block, slotOf(el), "font-size", null, el.style.fontSize); }
    drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
  }
  function setH(v) {
    if (!sel) return; var el = sel.el, t = typeOf(el); hist().begin();
    if (t === "image") { var b = el.getBoundingClientRect(); el.style.height = Math.round(v) + "px"; if (aspectLock) el.style.width = Math.round(v * (b.width / b.height)) + "px"; DT.edits.record(sel.n, sel.block, slotOf(el), "height", null, el.style.height); }
    else { var bb = el.getBoundingClientRect(), fs = parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).fontSize) || 40; el.style.fontSize = Math.max(8, Math.round(fs * (v / bb.height))) + "px"; DT.edits.record(sel.n, sel.block, slotOf(el), "font-size", null, el.style.fontSize); }
    drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
  }
```

> Mudança: acrescentar `if (pnl("syncGeom")) DT.panel.syncGeom();` ao fim de cada (antes só `drawSelection()`). Assim o campo companheiro (L ao digitar A, e vice-versa) reflete a geometria real na hora. A lógica de proporção da imagem já existe inline; a `geom.js` (Task 3) cobre a regra em unit test.

- [ ] **Step 2: Verificação manual**

Server na 4399, abra no browser. Selecione uma **imagem**, ative o cadeado, digite um novo L → o campo A deve atualizar proporcionalmente na hora. Encerre.

- [ ] **Step 3: Commit**

```bash
git add scripts/editor/overlay.js
git commit -m "fix(editor): setW/setH sincronizam o painel (cadeado de imagem visível)"
```

---

## Task 8: Painel — bloco "Dimensões" só para imagem (①/D2)

**Files:**
- Modify: `scripts/editor/panel.js` (`show` `77-85`)

- [ ] **Step 1: Condicionar o bloco "Dimensões" ao tipo imagem**

Em `scripts/editor/panel.js`, na função `show`, localizar o bloco `// ---- Dimensões ----` (linhas 77-85) e envolvê-lo num `if (type === "image")`. Substituir essas linhas por:

```js
    // ---- Dimensões (só imagem; texto se dimensiona pelo "Tam" + alças) ----
    if (type === "image") {
      var dim = section("Dimensões");
      var wh = el("div", "pnl-row"); wh.appendChild(field("L", "p-w", g.w, "number")); wh.appendChild(field("A", "p-h", g.h, "number"));
      var lock = el("button", "pnl-lock" + (DT.overlay.getAspect() ? " on" : ""), DT.overlay.getAspect() ? ICON.lockOn : ICON.lockOff);
      lock.title = "Travar proporção"; lock.addEventListener("click", function () { var on = !DT.overlay.getAspect(); DT.overlay.setAspect(on); lock.classList.toggle("on", on); lock.innerHTML = on ? ICON.lockOn : ICON.lockOff; });
      wh.appendChild(lock);
      dim.appendChild(wh);
      root.appendChild(dim);
    }
```

> Removido: o `var dim = section("Dimensões")` incondicional e o `if (type === "text") dim.appendChild(label("Em texto, L/A escalam o tamanho da fonte."));`. Agora texto não tem bloco Dimensões. `bindCommon` segue chamando `bindOne("p-w"/"p-h", …)` — inofensivo quando os campos não existem (`refs["p-w"]` é `undefined`, `bindOne` faz no-op).

- [ ] **Step 2: Verificação manual**

Server na 4399. Selecione um **texto** → o painel **não** mostra "Dimensões" (só Posição, Aparência, Tipografia). Selecione uma **imagem** → "Dimensões" aparece com L/A + cadeado. Encerre.

- [ ] **Step 3: Commit**

```bash
git add scripts/editor/panel.js
git commit -m "fix(editor): bloco Dimensões só para imagem; texto dimensiona pelo Tam"
```

---

## Task 9: Formatação de trecho — toolbar flutuante + wiring (④)

**Files:**
- Modify: `scripts/editor/overlay.js` (`editText` `214-227`; bloco de fundo de arquivo `262-324`)

- [ ] **Step 1: Implementar a toolbar de trecho dentro de `editText`**

Em `scripts/editor/overlay.js`, substituir `editText` (linhas 214-227) por:

```js
  // ---------- texto inline ----------
  var textTB = null;             // mini-barra flutuante de formatação de trecho
  function editText(el, surface) {
    if (typeOf(el) !== "text") return;
    hist().begin();
    surface.style.pointerEvents = "none";       // deixa o iframe receber foco/teclado
    var before = el.innerHTML;
    el.setAttribute("contenteditable", "true"); el.focus();
    try { var rng = el.ownerDocument.createRange(); rng.selectNodeContents(el); var selo = el.ownerDocument.defaultView.getSelection(); selo.removeAllRanges(); selo.addRange(rng); } catch (_) {}
    var doc = el.ownerDocument;
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

  // mostra/posiciona a toolbar quando há trecho selecionado dentro do elemento em edição
  function updateTextToolbar(el) {
    var doc = el.ownerDocument, gsel = doc.defaultView.getSelection();
    if (!gsel || gsel.rangeCount === 0 || gsel.isCollapsed) { hideTextToolbar(); return; }
    var range = gsel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) { hideTextToolbar(); return; }
    if (!textTB) textTB = buildTextToolbar(el);
    textTB.__el = el;
    var fr = el.ownerDocument.defaultView.frameElement.getBoundingClientRect(), s = fr.width / W;
    var rb = range.getBoundingClientRect();
    textTB.style.display = "flex";
    textTB.style.left = (fr.left + (rb.left + rb.width / 2) * s) + "px";
    textTB.style.top = (fr.top + rb.top * s - 44) + "px";
  }
  function hideTextToolbar() { if (textTB) textTB.style.display = "none"; }

  // aplica um estilo ao trecho selecionado via DT.spans, mantendo a seleção
  function applyToSelection(styleObj) {
    var el = textTB && textTB.__el; if (!el) return;
    var doc = el.ownerDocument, gsel = doc.defaultView.getSelection();
    if (!gsel || gsel.rangeCount === 0 || gsel.isCollapsed) return;
    var span = DT.spans.applyStyleToRange(gsel.getRangeAt(0), styleObj);
    DT.spans.mergeSpans(el);
    if (span) { var r = doc.createRange(); r.selectNodeContents(span); gsel.removeAllRanges(); gsel.addRange(r); }
    updateTextToolbar(el);
  }

  function buildTextToolbar(el) {
    var tb = document.createElement("div"); tb.className = "dt-text-tb"; tb.style.display = "none";
    function btn(label, on) { var b = document.createElement("button"); b.textContent = label; b.addEventListener("mousedown", function (e) { e.preventDefault(); }); b.addEventListener("click", function (e) { e.preventDefault(); on(); }); tb.appendChild(b); return b; }
    btn("B", function () { applyToSelection({ fontWeight: "700" }); }).style.fontWeight = "700";
    btn("Aa", function () { applyToSelection({ fontWeight: "400" }); });
    [["#ffffff", "Branco"], ["#000000", "Preto"], ["#7f7f7f", "Cinza"]].forEach(function (c) {
      var b = btn("", function () { applyToSelection({ color: c[0] }); }); b.title = c[1];
      b.className = "dot"; b.style.background = c[0];
    });
    btn("A-", function () { stepFontSize(-4); });
    btn("A+", function () { stepFontSize(4); });
    layer.appendChild(tb);
    return tb;
  }
  // ajusta o font-size do trecho relativo ao tamanho computado do elemento em edição
  function stepFontSize(delta) {
    var el = textTB && textTB.__el; if (!el) return;
    var base = parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).fontSize) || 40;
    applyToSelection({ fontSize: Math.max(8, Math.round(base + delta)) + "px" });
  }
```

- [ ] **Step 2: Adicionar o CSS da toolbar de trecho**

Em `scripts/editor/index.html`, logo após a regra `.dt-toolbar button:disabled { … }` (linha 58), adicionar:

```css
    .dt-text-tb { position: fixed; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; padding: 6px 8px; background: rgba(0,0,0,.9); backdrop-filter: blur(8px); border-radius: 8px; z-index: 700; user-select: none; }
    .dt-text-tb button { background: transparent; border: 1px solid rgba(255,255,255,.24); color: #fff; height: 26px; min-width: 26px; border-radius: 5px; cursor: pointer; font: 600 12px "Montserrat", sans-serif; padding: 0 8px; display: inline-flex; align-items: center; justify-content: center; }
    .dt-text-tb button:hover { background: rgba(255,255,255,.14); }
    .dt-text-tb button.dot { width: 22px; min-width: 22px; padding: 0; border-radius: 999px; border: 1px solid rgba(255,255,255,.5); }
```

- [ ] **Step 3: Verificação manual**

Server na 4399. Dê duplo-clique num texto pra editar, **selecione uma palavra** → a mini-barra aparece acima do trecho. Clique em **B** → só a palavra fica bold. Clique numa cor → só a palavra muda de cor. Clique fora (blur) → salva no DOM. Aperte ⌘Z → desfaz a edição inteira. Encerre.

- [ ] **Step 4: Commit**

```bash
git add scripts/editor/overlay.js scripts/editor/index.html
git commit -m "feat(editor): formatação de trecho de texto (toolbar flutuante + spans)"
```

---

## Task 10: Smoke test puppeteer (integração)

**Files:**
- Create: `scripts/editor/integration.e2e.js`

- [ ] **Step 1: Escrever o smoke test**

Create `scripts/editor/integration.e2e.js`:

```js
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";

const PORT = 4399;
const POST = "export/conteudos/carrossel/_editor-test";
const ESTILO = "templates/social-media/carrossel/estilos/editorial/estilo.md";

let server, browser, page;

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("server timeout")), 8000);
    child.stdout.on("data", (b) => { if (String(b).includes("Dino Editor em")) { clearTimeout(t); resolve(); } });
    child.stderr.on("data", (b) => process.stderr.write(b));
  });
}

before(async () => {
  server = spawn("node", ["scripts/editor/server.js", POST, "--estilo", ESTILO, "--port", String(PORT)]);
  await waitForReady(server);
  browser = await puppeteer.launch({ headless: "new" });
  page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__DT && window.__DT.frames().length > 0, { timeout: 8000 });
  // aguarda o freeze (roda após fonts.ready do iframe)
  await page.waitForFunction(() => {
    var f = window.__DT.frames()[0];
    var el = f.doc && f.doc.querySelector("[data-dt-selectable]");
    return el && el.style.position === "absolute";
  }, { timeout: 8000 });
});

after(async () => { if (browser) await browser.close(); if (server) server.kill(); });

test("congela: todo selecionável vira position:absolute com left", async () => {
  const ok = await page.evaluate(() => {
    var f = window.__DT.frames()[0];
    var els = f.doc.querySelectorAll("[data-dt-selectable]");
    return els.length > 0 && Array.prototype.every.call(els, (e) => e.style.position === "absolute" && e.style.left);
  });
  assert.equal(ok, true);
});

test("containment: zonas de fundo têm overflow:hidden", async () => {
  const ok = await page.evaluate(() => {
    var f = window.__DT.frames()[0];
    var zones = f.doc.querySelectorAll("[data-bg-drop]");
    if (!zones.length) return true; // estilo sem zona → vacuamente ok
    return Array.prototype.every.call(zones, (z) => f.doc.defaultView.getComputedStyle(z).overflow === "hidden");
  });
  assert.equal(ok, true);
});

test("seleção: selbox de fundo é click-through (pointer-events:none)", async () => {
  const pe = await page.evaluate(() => {
    var sel = window.__DT._select(0, "[data-bg-drop]");
    if (!sel) return "no-bg";
    var box = document.querySelector(".dt-selbox");
    return box ? box.style.pointerEvents : "no-box";
  });
  assert.ok(pe === "none" || pe === "no-bg", `esperado none, veio ${pe}`);
});

test("painel: texto não mostra bloco Dimensões", async () => {
  const res = await page.evaluate(() => {
    var ok = window.__DT._selectType(0, "text");
    if (!ok) return "no-text";
    return Array.from(document.querySelectorAll("#dt-panel h3")).some((h) => h.textContent.includes("Dimensões"));
  });
  assert.ok(res === false || res === "no-text", `Dimensões não deveria aparecer para texto (veio ${res})`);
});

test("painel: imagem mostra bloco Dimensões (quando há imagem)", async () => {
  const res = await page.evaluate(() => {
    var ok = window.__DT._selectType(0, "image");
    if (!ok) return "no-image";
    return Array.from(document.querySelectorAll("#dt-panel h3")).some((h) => h.textContent.includes("Dimensões"));
  });
  assert.ok(res === true || res === "no-image", `imagem deveria ter Dimensões (veio ${res})`);
});
```

- [ ] **Step 2: Rodar o smoke**

Run: `npm run test:e2e`
Expected: PASS (5 testes). Se aparecer erro de sandbox do Chromium, rode com `PUPPETEER_DISABLE_SANDBOX` ou adicione `args: ["--no-sandbox"]` no `puppeteer.launch`.

- [ ] **Step 3: Commit**

```bash
git add scripts/editor/integration.e2e.js
git commit -m "test(editor): smoke e2e — freeze, containment, troca de seleção, painel"
```

---

## Task 11: Paridade do export (HTML salvo absoluto → PNG idêntico)

**Files:**
- Verify: `scripts/export-png.js`, `scripts/editor/handlers.js:73-91`

- [ ] **Step 1: Confirmar que o export lê o HTML salvo**

Run: `grep -n "slide-\|design\|readFile\|puppeteer\|setViewport\|screenshot" scripts/export-png.js`
Expected: confirmar que `export-png.js` renderiza os `design/slide-N.html` (os mesmos que o save grava) a 1080×1350. Anotar o caminho de saída dos PNGs.

- [ ] **Step 2: Gerar baseline antes de salvar**

Run:
```bash
node scripts/export-png.js export/conteudos/carrossel/_editor-test
```
Expected: PNGs gerados sem erro (baseline do estado atual).

- [ ] **Step 3: Salvar via editor (gera HTML absoluto) e re-exportar**

Suba o server na 4399, abra no browser, clique **Salvar** (sem editar nada — só pra serializar o DOM congelado), encerre. Depois:
```bash
node scripts/export-png.js export/conteudos/carrossel/_editor-test
```
Expected: export roda sem erro sobre o HTML agora absoluto; abrir os PNGs e confirmar visualmente que o layout permanece idêntico ao baseline (mesmas posições, sem reflow). Se houver divergência, é sinal de que o freeze mediu antes das fontes — investigar `fonts.ready`.

- [ ] **Step 4: Reverter artefatos do fixture (não versionar mudança de teste)**

Run:
```bash
git checkout -- export/conteudos/carrossel/_editor-test
```
Expected: o fixture volta ao estado versionado (o save/export foi só verificação).

> Sem commit nesta task — é verificação. Se `_editor-test` não estiver versionado, apenas descartar manualmente os arquivos gerados.

---

## Task 12: Suíte completa + sign-off

**Files:** — (nenhum; verificação final)

- [ ] **Step 1: Rodar toda a suíte unit**

Run: `npm test`
Expected: PASS — testes existentes + `freeze.test.js`, `geom.test.js`, `spans.test.js`.

- [ ] **Step 2: Rodar o smoke e2e**

Run: `npm run test:e2e`
Expected: PASS (5 testes).

- [ ] **Step 3: Sign-off visual do usuário (browser)**

Suba o server:
```bash
node scripts/editor/server.js export/conteudos/carrossel/_editor-test --estilo templates/social-media/carrossel/estilos/editorial/estilo.md --port 4399
```
Peça ao usuário pra abrir `http://localhost:4399` e validar manualmente:
- Mover um texto com swipe cue logo abaixo → o vizinho **não** se mexe (③).
- Selecionar fundo, clicar num texto → troca a seleção (②).
- Imagem + cadeado: digitar L atualiza A na hora (①).
- Texto não tem "Dimensões"; imagem tem (①).
- Imagem em zona não-bleed: mover/zoom não ultrapassa as bordas (D4).
- Selecionar palavra dentro de um texto → toolbar → bold/cor/tamanho só no trecho (④).

> Lembrete (memória do projeto): a validação visual é feita pelo usuário abrindo o browser — **nunca** via agent-browser.

- [ ] **Step 4: Commit final (se houver ajustes do sign-off)**

```bash
git add -A
git commit -m "chore(editor): ajustes do sign-off de fluidez + 4 correções"
```

---

## Self-Review (cobertura do spec)

- **A. Congelar layout (③):** Tasks 2 (transform puro) + 5 (wiring `freezeLayout` após `fonts.ready`, idempotente, 2 passes). Smoke em 10. ✔
- **B. Dimensões texto/imagem (①/D2/D3):** Task 8 (painel só imagem) + Task 7 (`syncGeom`) + Task 3 (proporção pura). ✔
- **C. Containment em zona (D4):** Task 5 step 2 (`overflow:hidden`); reposição/zoom já clampados no código atual; smoke em 10. ✔
- **D. Troca de seleção (②):** Task 6 (selbox click-through). Smoke em 10. ✔
- **E. Formatação de trecho (④):** Task 4 (spans puros) + Task 9 (toolbar + wiring). ✔
- **Export parity:** Task 11. ✔
- **Testes:** unit (2,3,4) + smoke (10) + manual (12). ✔

Sem placeholders. Tipos/nomes consistentes entre tasks: `frozenStyleFor`/`isFrozen` (freeze.js), `resizeKeepingAspect` (geom.js), `applyStyleToRange`/`mergeSpans` (spans.js), `freezeLayout`/`_select`/`_selectType` (app.js), `updateTextToolbar`/`applyToSelection`/`buildTextToolbar`/`stepFontSize` (overlay.js).
