/* Dino Editor — edits.js
 * Gravação de deltas (edits.json) + serialização de slides + save/export.
 * Formato idêntico ao anterior → o loop de aprendizado (/novo-post 9.5) continua.
 */
window.DT = window.DT || {};
(function () {
  "use strict";
  var BACKEND = window.__DT_BACKEND || "http://localhost:4321";

  // scope: o que volta pro estilo (structural) x fica só no post (content)
  var SCOPE = {
    text: "content", bg: "content", bgpos: "content", "bg-zoom": "content",
    "font-size": "structural", width: "structural", height: "structural",
    "font-family": "structural", "font-weight": "structural", "text-align": "structural",
    "letter-spacing": "structural", "line-height": "structural",
    color: "structural", opacity: "structural", left: "structural", top: "structural", removed: "structural"
  };

  var edits = [];

  function record(n, block, slot, prop, from, to) {
    if (!slot) slot = prop;
    var ex = edits.find(function (e) { return e._n === n && e.target === slot && e.prop === prop; });
    if (ex) { ex.to = to; return; }
    edits.push({ _n: n, _block: block || null, target: slot, prop: prop, from: from, to: to, scope: SCOPE[prop] || "content" });
  }

  function payload(contract) {
    var by = {};
    edits.forEach(function (e) {
      if (!by[e._n]) by[e._n] = { slide: e._n, block: e._block, edits: [] };
      by[e._n].edits.push({ target: e.target, prop: e.prop, from: e.from, to: e.to, scope: e.scope });
    });
    return {
      estilo: (contract && contract.estilo) || "desconhecido",
      estilo_path: (contract && contract.estilo_path) || null,
      post: (contract && contract.post) || document.title,
      slides: Object.keys(by).map(function (k) { return by[k]; })
    };
  }

  // Serializa a <section> do slide, removendo marcadores do editor (não persistem).
  function cleanSection(root) {
    var c = root.cloneNode(true);
    c.querySelectorAll("[data-dt-selectable]").forEach(function (n) { n.removeAttribute("data-dt-selectable"); });
    c.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); });
    if (c.removeAttribute) c.removeAttribute("data-dt-selectable");
    return c.outerHTML;
  }

  function save(contract, frames) {
    var slides = frames.map(function (f) { return { n: f.n, html: cleanSection(f.root) }; });
    return fetch(BACKEND + "/save", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slides: slides, edits: payload(contract) })
    }).then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); });
  }

  function exportPng() { return fetch(BACKEND + "/export", { method: "POST" }); }

  function replace(arr) { edits.length = 0; (arr || []).forEach(function (e) { edits.push(e); }); }

  DT.edits = { record: record, list: function () { return edits; }, replace: replace, payload: payload, cleanSection: cleanSection, save: save, exportPng: exportPng, BACKEND: BACKEND };
})();
