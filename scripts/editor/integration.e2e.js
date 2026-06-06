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
  browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  page = await browser.newPage();
  // edits.js usa window.__DT_BACKEND como override do URL padrão (4321).
  // Injetar antes dos scripts para apontar para a porta real do teste.
  await page.evaluateOnNewDocument((port) => { window.__DT_BACKEND = `http://localhost:${port}`; }, PORT);
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

test("edição habilita o iframe pro ponteiro (seleção nativa de texto) e restaura ao sair (#A)", async () => {
  const res = await page.evaluate(async () => {
    if (!window.__DT._edit(0, "text")) return null;
    var f = window.__DT.frames()[0];
    var during = f.iframe.style.pointerEvents;
    var el = f.doc.querySelector('[contenteditable="true"]'); if (el) el.blur();
    await new Promise(function (r) { setTimeout(r, 20); });
    return { during: during, after: f.iframe.style.pointerEvents };
  });
  assert.equal(res.during, "auto", "iframe deveria ficar interativo durante a edição");
  assert.equal(res.after, "", "iframe deveria voltar a pointer-events herdado (none) ao sair");
});

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
    await new Promise(function(res){ setTimeout(res, 30); });
    var tb = document.querySelector(".dt-text-tb");
    if (!tb || tb.style.display === "none") return { ok: false, reason: "no-toolbar" };
    var b = tb.querySelector("button");      // primeiro botão = "B" (negrito 700)
    // Reproduz a sequência real de um clique na barra (top-level) sobre um editável
    // dentro do iframe: pointerdown na barra → o editável perde o foco (blur) →
    // click. Sem a guarda, o blur derruba a edição antes do estilo aplicar.
    b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    el.blur();
    b.click();
    await new Promise(function(res){ setTimeout(res, 40); });
    return { ok: true, html: el.innerHTML, editing: el.getAttribute("contenteditable") === "true" };
  });
  assert.equal(res.ok, true, "fluxo: " + res.reason);
  assert.match(res.html, /font-weight:\s*700/, "trecho deveria ficar em negrito");
  assert.equal(res.editing, true, "deveria continuar em edição (barra não derrubou)");
  await page.evaluate(() => { var f = window.__DT.frames()[0]; var e = f.doc.querySelector('[contenteditable="true"]'); if (e) e.blur(); });
});

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

test("undo reverte mudança contínua de cor de fundo num passo só (#B)", async () => {
  const res = await page.evaluate(async () => {
    DT.overlay.deselect();
    if (!window.__DT._select(0, "[data-bg-drop]")) return { skip: true };
    var el0 = window.__DT.selection().el;
    var before = el0.style.background || "";
    // simula o input contínuo do color picker (várias mudanças seguidas)
    DT.overlay.setBgFill("#111111", "solid");
    DT.overlay.setBgFill("#222222", "solid");
    DT.overlay.setBgFill("#333333", "solid");
    var afterChange = window.__DT.selection().el.style.background;
    DT.history.undo();
    // undo re-escreve o innerHTML → re-buscar o elemento
    var f = window.__DT.frames()[0];
    var afterUndo = (f.doc.querySelector("[data-bg-drop]") || {}).style ? f.doc.querySelector("[data-bg-drop]").style.background : "?";
    return { before: before, afterChange: afterChange, afterUndo: afterUndo };
  });
  if (res.skip) return;
  assert.notEqual(res.afterChange, res.before, "a cor deveria ter mudado");
  assert.equal(res.afterUndo, res.before, "1 undo deveria reverter a mudança inteira (veio " + res.afterUndo + ", esperado " + res.before + ")");
  await page.evaluate(() => DT.overlay.deselect());
});
