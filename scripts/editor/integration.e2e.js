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
