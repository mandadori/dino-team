/* Dino Editor — app.js
 * Bootstrap + wiring da interação. Cada slide tem um iframe (render) e uma
 * SUPERFÍCIE top-level que captura o ponteiro e faz hit-test via
 * elementFromPoint dentro do iframe. Orquestra DT.edits/history/overlay/panel.
 */
(function () {
  "use strict";
  var W = 1080, H = 1350;
  var FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">';
  // pointer-events:auto garante que elementFromPoint encontre os selecionáveis
  // (mesmo os que o estilo marca como pointer-events:none, ex.: brand-stamp).
  var IFRAME_CSS = [
    "[data-dt-selectable]{pointer-events:auto!important}",
    "[data-bg-drop]{pointer-events:auto!important}",
    "[contenteditable=true]{outline:2px solid #00b140;cursor:text}",
    "[data-bg-drop].dt-drop{outline:4px dashed #00b140!important;outline-offset:-4px}"
  ].join("");

  var stage = document.getElementById("dt-stage");
  var layer = document.getElementById("dt-overlay");
  var hint = document.getElementById("dt-hint");
  var counter = document.getElementById("dt-counter");
  var prevBtn = document.getElementById("dt-prev"), nextBtn = document.getElementById("dt-next");
  var saveBtn = document.getElementById("dt-save"), exportBtn = document.getElementById("dt-export");
  var undoBtn = document.getElementById("dt-undo"), redoBtn = document.getElementById("dt-redo");

  var contract = null, frames = [], current = 0;

  DT.overlay.init({ stage: stage, layer: layer });
  DT.panel.init();
  DT.history.init({ frames: function () { return frames; }, restore: restoreAll, onChange: function (s) { undoBtn.disabled = !s.undo; redoBtn.disabled = !s.redo; } });

  Promise.all([
    fetch(DT.edits.BACKEND + "/slides").then(function (r) { return r.ok ? r.json() : null; }),
    fetch(DT.edits.BACKEND + "/contract").then(function (r) { return r.status === 200 ? r.json() : null; }).catch(function () { return null; }),
    fetch(DT.edits.BACKEND + "/suggestions").then(function (r) { return r.status === 200 ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (res) {
    var data = res[0]; contract = res[1]; var sugg = res[2];
    if (!data || !data.slides || !data.slides.length) { hint.textContent = "nenhum slide encontrado — rode o server sobre um post com design/slide-N.html"; return; }
    DT.panel.setContract(contract);
    build(data.css, data.slides, sugg);
    hint.textContent = (contract ? "estilo: " + (contract.estilo || "?") + " · " : "") + data.slides.length + " slides — clique num elemento pra editar · ⌘Z desfaz";
  }).catch(function (e) { hint.textContent = "erro ao carregar: " + e.message; });

  function computeScale() { return Math.max(0.18, Math.min((window.innerHeight - 150) / H, 0.62)); }

  function build(css, slides, sugg) {
    var s = computeScale();
    slides.forEach(function (sl) {
      var wrap = document.createElement("div"); wrap.className = "dt-wrap";
      wrap.style.width = Math.round(W * s) + "px"; wrap.style.height = Math.round(H * s) + "px";
      var iframe = document.createElement("iframe"); iframe.width = W; iframe.height = H; iframe.scrolling = "no";
      iframe.style.width = W + "px"; iframe.style.height = H + "px"; iframe.style.transform = "scale(" + s + ")";
      iframe.srcdoc = "<!doctype html><html><head>" + FONTS + "<style>" + css + "</style><style>" + IFRAME_CSS + "</style></head><body>" + sl.html + "</body></html>";
      var surface = document.createElement("div"); surface.className = "dt-surface";
      var frame = { n: sl.n, block: sl.block, iframe: iframe, surface: surface, doc: null, root: null };
      iframe.addEventListener("load", function () { wire(frame, sugg); });
      wrap.appendChild(iframe); wrap.appendChild(surface); stage.appendChild(wrap); frames.push(frame);
    });
    updateNav();
    window.addEventListener("resize", onResize);
    stage.addEventListener("scroll", function () { DT.overlay.reposition(); syncCurrentToScroll(); }, { passive: true });
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(function () { goTo(0); });
  }

  function onResize() { var s = computeScale(); frames.forEach(function (f) { f.iframe.style.transform = "scale(" + s + ")"; var w = f.iframe.parentNode; w.style.width = Math.round(W * s) + "px"; w.style.height = Math.round(H * s) + "px"; }); DT.overlay.reposition(); }

  function wire(frame, sugg) {
    var doc = frame.iframe.contentDocument; frame.doc = doc; frame.root = doc.querySelector("section") || doc.body;
    markSelectable(doc);
    prefillBg(frame, sugg);
    var surf = frame.surface;
    surf.addEventListener("pointerdown", function (e) { onDown(frame, e); });
    surf.addEventListener("pointermove", function (e) { if (e.buttons === 0) DT.overlay.hover(frame, hitTest(frame, e.clientX, e.clientY)); });
    surf.addEventListener("pointerleave", function () { DT.overlay.clearHover(); });
    surf.addEventListener("dblclick", function (e) { var el = hitTest(frame, e.clientX, e.clientY); if (el && DT.overlay.typeOf(el) === "text") { DT.overlay.select(ctx(frame, el)); DT.overlay.editText(el, surf); } });
    doc.addEventListener("keydown", onKey);
  }
  function ctx(frame, el) { return { n: frame.n, block: frame.block, el: el, iframe: frame.iframe, root: frame.root, doc: frame.doc, surface: frame.surface }; }

  function markSelectable(doc) {
    var els = selectable(doc);
    els.forEach(function (e) { if (!e.getAttribute("data-slot")) e.__dtslot = synthSlot(e); e.setAttribute("data-dt-selectable", ""); });
    doc.querySelectorAll("[data-bg-drop]").forEach(function (z) { if (!z.getAttribute("data-slot")) z.__dtslot = z.getAttribute("data-bg-drop") || "bg"; });
  }
  function prefillBg(frame, sugg) {
    if (!sugg || !sugg[frame.n]) return; var d = sugg[frame.n];
    frame.doc.querySelectorAll("[data-bg-drop]").forEach(function (z) {
      var match = d.drop ? z.getAttribute("data-bg-drop") === d.drop : true;
      if (match && !z.hasAttribute("data-has-bg")) applyUrl(z, d.dataUrl);
    });
  }
  function applyUrl(zone, dataUrl) { // pré-preenchimento sem registrar delta nem histórico
    var img = new Image();
    img.onload = function () {
      var sr = (zone.ownerDocument.querySelector("section") || zone.ownerDocument.body).getBoundingClientRect(), zr = zone.getBoundingClientRect();
      var cover = Math.max((W * zr.width / sr.width) / img.naturalWidth, (H * zr.height / sr.height) / img.naturalHeight);
      zone.__bgNatW = img.naturalWidth; zone.__bgNatH = img.naturalHeight; zone.__bgCover = cover; zone.__bgZoom = 1;
      zone.style.backgroundImage = "url(" + dataUrl + ")"; zone.style.backgroundRepeat = "no-repeat"; zone.style.backgroundPosition = "50% 50%";
      zone.style.backgroundSize = Math.round(img.naturalWidth * cover) + "px " + Math.round(img.naturalHeight * cover) + "px";
      zone.classList.remove("placeholder"); zone.setAttribute("data-has-bg", "1");
    };
    img.src = dataUrl;
  }

  // hit-test: coords de tela → coords do slide → elementFromPoint no iframe
  function hitTest(frame, clientX, clientY) {
    var r = frame.iframe.getBoundingClientRect(), s = r.width / W;
    var x = (clientX - r.left) / s, y = (clientY - r.top) / s;
    if (x < 0 || y < 0 || x > W || y > H) return null;
    var el = frame.doc.elementFromPoint(x, y);
    while (el && el !== frame.root && el !== frame.doc.body) {
      if (el.hasAttribute("data-dt-selectable") || el.hasAttribute("data-bg-drop")) return el;
      el = el.parentElement;
    }
    return null;
  }
  function onDown(frame, e) {
    if (e.button !== 0) return;
    var el = hitTest(frame, e.clientX, e.clientY);
    if (!el) { DT.overlay.deselect(); return; }
    DT.overlay.select(ctx(frame, el));
    DT.overlay.beginMove(frame.surface, e);
  }

  function selectable(doc) {
    var slotted = Array.prototype.slice.call(doc.querySelectorAll("[data-slot]"));
    if (slotted.length) return slotted;
    var out = [];
    doc.querySelectorAll("h1,h2,h3,h4,h5,h6,p,span,div,img,figcaption,li,strong,em,small").forEach(function (e) {
      if (e.hasAttribute("data-bg-drop")) return;
      if (e.tagName === "IMG") { out.push(e); return; }
      var hasEl = false; for (var c = e.firstElementChild; c; c = c.nextElementSibling) { if (c.tagName !== "BR") { hasEl = true; break; } }
      if (!hasEl && e.textContent.trim().length) out.push(e);
    });
    return out;
  }
  function synthSlot(e) { var base = (e.className && String(e.className).trim().split(/\s+/)[0]) || e.tagName.toLowerCase(); var sibs = e.parentNode ? e.parentNode.querySelectorAll("." + base) : []; if (sibs.length > 1) { for (var i = 0; i < sibs.length; i++) if (sibs[i] === e) return base + "-" + (i + 1); } return base; }

  function restoreAll() { frames.forEach(function (f) { if (f.doc) markSelectable(f.doc); }); DT.overlay.deselect(); DT.overlay.reposition(); }

  // ---------- teclado ----------
  function onKey(e) {
    var meta = e.metaKey || e.ctrlKey;
    if (meta && (e.key === "z" || e.key === "Z")) { e.preventDefault(); e.stopPropagation(); if (e.shiftKey) DT.history.redo(); else DT.history.undo(); return; }
    if (meta && (e.key === "y" || e.key === "Y")) { e.preventDefault(); e.stopPropagation(); DT.history.redo(); return; }
    var sel = DT.overlay.current(); if (!sel) return;
    if (sel.doc && sel.doc.querySelector('[contenteditable="true"]')) return;
    var step = e.shiftKey ? 10 : 1;
    if (e.key === "ArrowLeft") { e.preventDefault(); DT.overlay.nudge(-step, 0); }
    else if (e.key === "ArrowRight") { e.preventDefault(); DT.overlay.nudge(step, 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); DT.overlay.nudge(0, -step); }
    else if (e.key === "ArrowDown") { e.preventDefault(); DT.overlay.nudge(0, step); }
    else if (e.key === "Escape") { DT.overlay.deselect(); }
    else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); DT.overlay.removeSel(); }
  }

  // ---------- navegação ----------
  function updateNav() { counter.textContent = (current + 1) + " / " + frames.length; prevBtn.disabled = current === 0; nextBtn.disabled = current >= frames.length - 1; }
  // Mantém o contador/navegação em sincronia quando o usuário desliza o carrossel
  // no touchpad (não só pelos botões ‹ ›). Acha o slide mais próximo do centro.
  var scrollRaf = null;
  function syncCurrentToScroll() {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(function () {
      if (!frames.length) return;
      var c = stage.getBoundingClientRect(), cx = c.left + c.width / 2, best = current, bd = Infinity;
      frames.forEach(function (f, i) { var w = f.iframe.parentNode.getBoundingClientRect(); var d = Math.abs((w.left + w.width / 2) - cx); if (d < bd) { bd = d; best = i; } });
      if (best !== current) { current = best; updateNav(); }
    });
  }
  function goTo(i) { current = Math.max(0, Math.min(frames.length - 1, i)); var w = frames[current] && frames[current].iframe.parentNode; if (w) w.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); updateNav(); }
  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });
  undoBtn.addEventListener("click", function () { DT.history.undo(); });
  redoBtn.addEventListener("click", function () { DT.history.redo(); });

  // ---------- salvar / exportar ----------
  saveBtn.addEventListener("click", function () {
    DT.overlay.deselect();
    saveBtn.textContent = "Salvando…";
    DT.edits.save(contract, frames)
      .then(function (res) { saveBtn.textContent = res.ok ? "Salvo ✓" : "Erro"; if (!res.ok) console.error("save:", res.b); setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1400); })
      .catch(function () { saveBtn.textContent = "Offline"; setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1400); });
  });
  exportBtn.addEventListener("click", function () {
    exportBtn.textContent = "Exportando…";
    DT.edits.exportPng().then(function (r) { exportBtn.textContent = r.ok ? "Exportado ✓" : "Erro"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 1800); }).catch(function () { exportBtn.textContent = "Offline"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 1800); });
  });

  window.__DT = { frames: function () { return frames; }, edits: function () { return DT.edits.list(); }, contract: function () { return contract; }, selection: function () { return DT.overlay.current(); }, hitTest: hitTest, goTo: goTo };
})();
