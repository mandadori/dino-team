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
