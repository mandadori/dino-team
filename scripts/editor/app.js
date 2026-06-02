/* Dino Editor — app.js
 * Editor Figma-like, vanilla JS. Cada slide vive num <iframe> isolado (CSS do
 * estilo não colide com o chrome). Manipulação direta dentro do iframe em
 * coordenadas naturais (1080x1350). Salva de volta nos slide-N.html (só a
 * <section>; CSS preservado pelo servidor).
 */
(function () {
  "use strict";

  var DT_BACKEND = window.__DT_BACKEND || "http://localhost:4321";
  var FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Anton&family=Montserrat:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">';

  // Overlay injetado dentro de cada iframe (seleção, handles, guias).
  var OVERLAY = [
    "[data-slot]{cursor:pointer}",
    ".dt-sel{outline:2px solid #00e051!important;outline-offset:1px}",
    ".dt-handle{position:absolute;width:14px;height:14px;background:#00e051;border:1px solid #024;border-radius:2px;z-index:2147483600;cursor:nwse-resize}",
    ".dt-guide{position:absolute;background:#00e051;z-index:2147483500;pointer-events:none}",
    ".dt-guide.v{width:2px;top:0;bottom:0}.dt-guide.h{height:2px;left:0;right:0}",
    "[data-bg-drop].dt-drop{outline:6px dashed #00b140;outline-offset:-6px}",
    "[contenteditable=true]{outline:2px solid #00b140;cursor:text}"
  ].join("");

  var WEIGHTS = { Thin: "100", Light: "300", Regular: "400", Medium: "500", SemiBold: "600", Bold: "700" };
  var WEIGHT_NAMES = Object.keys(WEIGHTS);
  var FAMILIES = ["Anton", "Montserrat"];
  var COLORS = [["#ffffff", "branco"], ["#000000", "preto"], ["#7f7f7f", "cinza"]];
  var ALIGNS = ["left", "center", "right"];
  var SAFE = 80, SNAP = 9, W = 1080, H = 1350;

  // scope: o que volta pro estilo (structural) x fica só no post (content)
  var SCOPE = {
    text: "content", bg: "content", bgpos: "content",
    "font-size": "structural", width: "structural", height: "structural",
    "font-family": "structural", "font-weight": "structural", "text-align": "structural",
    color: "structural", left: "structural", top: "structural", removed: "structural"
  };

  // ---------- estado ----------
  var canvas = document.getElementById("dt-canvas");
  var panel = document.getElementById("dt-panel");
  var panelTitle = document.getElementById("dt-panel-title");
  var panelSub = document.getElementById("dt-panel-sub");
  var panelBody = document.getElementById("dt-panel-body");
  var hint = document.getElementById("dt-hint");
  var contract = null;
  var frames = [];                 // [{n, block, iframe, doc, root}]
  var sel = null;                  // {n, el, doc, root}
  var edits = [];                  // deltas
  var current = 0;

  // ---------- init ----------
  Promise.all([
    fetch(DT_BACKEND + "/slides").then(function (r) { return r.ok ? r.json() : null; }),
    fetch(DT_BACKEND + "/contract").then(function (r) { return r.status === 200 ? r.json() : null; }).catch(function () { return null; }),
    fetch(DT_BACKEND + "/suggestions").then(function (r) { return r.status === 200 ? r.json() : null; }).catch(function () { return null; })
  ]).then(function (res) {
    var data = res[0]; contract = res[1]; var sugg = res[2];
    if (!data || !data.slides || !data.slides.length) { hint.textContent = "nenhum slide encontrado — rode o server sobre um post com design/slide-N.html"; return; }
    buildFrames(data.css, data.slides, sugg);
    hint.textContent = (contract ? "estilo: " + (contract.estilo || "?") + " · " : "") + data.slides.length + " slides — clique num elemento pra editar";
  }).catch(function (e) { hint.textContent = "erro ao carregar: " + e.message; });

  function buildFrames(css, slides, sugg) {
    var scale = Math.min((window.innerHeight - 120) / H, 1);
    slides.forEach(function (s) {
      var iframe = document.createElement("iframe");
      iframe.className = "dt-frame";
      iframe.width = W; iframe.height = H; iframe.scrolling = "no";
      iframe.style.zoom = scale;
      iframe.srcdoc = "<!doctype html><html><head>" + FONTS + "<style>" + css + "</style><style>" + OVERLAY + "</style></head><body>" + s.html + "</body></html>";
      var frame = { n: s.n, block: s.block, iframe: iframe, doc: null, root: null };
      iframe.addEventListener("load", function () { wireFrame(frame, sugg); });
      canvas.appendChild(iframe);
      frames.push(frame);
    });
    updateNav();
    // Centraliza o primeiro slide após o layout ser calculado pelo browser.
    requestAnimationFrame(function () { goTo(0); });
  }

  // ---------- wiring por iframe ----------
  function wireFrame(frame, sugg) {
    var doc = frame.iframe.contentDocument;
    frame.doc = doc;
    frame.root = doc.querySelector("section") || doc.body;

    // seleção
    doc.querySelectorAll("[data-slot]").forEach(function (el) {
      if (el.hasAttribute("data-bg-drop")) { bindBg(frame, el); return; }
      el.addEventListener("mousedown", function (e) { e.stopPropagation(); selectEl(frame, el); startMove(frame, el, e); });
      el.addEventListener("dblclick", function (e) { e.stopPropagation(); startInline(frame, el); });
    });
    doc.addEventListener("mousedown", function (e) {
      if (e.target === doc.body || e.target === frame.root) deselect();
    });

    // pré-preenchimento de imagem sugerida
    if (sugg && sugg[frame.n]) {
      var z = frame.root.querySelector('[data-bg-drop="' + sugg[frame.n].drop + '"]') || frame.root.querySelector("[data-bg-drop]");
      if (z && !z.hasAttribute("data-has-bg")) applyBg(z, sugg[frame.n].dataUrl);
    }
  }

  // ---------- seleção + handles ----------
  function clearScaffold(doc) {
    doc.querySelectorAll(".dt-handle,.dt-guide").forEach(function (n) { n.remove(); });
    doc.querySelectorAll(".dt-sel").forEach(function (n) { n.classList.remove("dt-sel"); });
  }
  function deselect() {
    if (!sel) return;
    clearScaffold(sel.doc);
    sel = null; panel.classList.remove("is-open");
  }
  function selectEl(frame, el) {
    if (sel && sel.doc !== frame.doc) clearScaffold(sel.doc);
    if (sel) clearScaffold(sel.doc);
    sel = { n: frame.n, el: el, doc: frame.doc, root: frame.root };
    el.classList.add("dt-sel");
    placeHandles();
    buildPanel(frame, el);
    panel.classList.add("is-open");
    var idx = frames.findIndex(function (f) { return f.n === frame.n; });
    if (idx >= 0) { current = idx; updateNav(); }
  }
  function rectIn(el, root) {
    var r = el.getBoundingClientRect(), rr = root.getBoundingClientRect();
    return { left: r.left - rr.left, top: r.top - rr.top, w: r.width, h: r.height };
  }
  function placeHandles() {
    if (!sel) return;
    sel.doc.querySelectorAll(".dt-handle").forEach(function (n) { n.remove(); });
    var b = rectIn(sel.el, sel.root);
    var corners = [["nw", 0, 0], ["ne", b.w, 0], ["sw", 0, b.h], ["se", b.w, b.h]];
    corners.forEach(function (c) {
      var h = sel.doc.createElement("div");
      h.className = "dt-handle"; h.dataset.corner = c[0];
      h.style.left = (b.left + c[1] - 7) + "px";
      h.style.top = (b.top + c[2] - 7) + "px";
      h.addEventListener("mousedown", function (e) { e.preventDefault(); e.stopPropagation(); startResize(sel.el, c[0], e); });
      sel.root.appendChild(h);
    });
  }

  // ---------- mover + magnetismo ----------
  function ensureAbsolute(el, root) {
    var cs = el.ownerDocument.defaultView.getComputedStyle(el);
    if (cs.position === "absolute" && el.style.left) return;
    var b = rectIn(el, root);
    el.style.position = "absolute";
    el.style.left = b.left + "px";
    el.style.top = b.top + "px";
    el.style.right = "auto"; el.style.bottom = "auto"; el.style.margin = "0";
  }
  function startMove(frame, el, e) {
    var sx = e.clientX, sy = e.clientY, started = false, l0 = 0, t0 = 0;
    var doc = frame.doc;
    function mm(ev) {
      if (!started) {
        if (Math.abs(ev.clientX - sx) < 3 && Math.abs(ev.clientY - sy) < 3) return;
        ensureAbsolute(el, frame.root);
        l0 = parseFloat(el.style.left) || 0; t0 = parseFloat(el.style.top) || 0;
        started = true;
      }
      var snapped = snap(frame, el, l0 + (ev.clientX - sx), t0 + (ev.clientY - sy));
      el.style.left = snapped.l + "px"; el.style.top = snapped.t + "px";
      placeHandles();
    }
    function mu() {
      doc.removeEventListener("mousemove", mm); doc.removeEventListener("mouseup", mu);
      clearGuides(doc);
      if (started) {
        recordEdit(frame.n, slotName(el), "left", null, el.style.left);
        recordEdit(frame.n, slotName(el), "top", null, el.style.top);
      }
    }
    doc.addEventListener("mousemove", mm); doc.addEventListener("mouseup", mu);
  }
  function snap(frame, el, l, t) {
    clearGuides(frame.doc);
    var w = el.offsetWidth, h = el.offsetHeight;
    var ax = [[SAFE, l], [W / 2 - w / 2, l], [W - SAFE - w, l]];       // [alvo, valor-base]
    var ay = [[SAFE, t], [H / 2 - h / 2, t], [H - SAFE - h, t]];
    frame.root.querySelectorAll("[data-slot]").forEach(function (o) {
      if (o === el) return;
      var b = rectIn(o, frame.root);
      ax.push([b.left, l]); ay.push([b.top, t]);
    });
    var rl = l, rt = t, gl = null, gt = null;
    ax.forEach(function (a) { if (Math.abs(l - a[0]) <= SNAP) { rl = a[0]; gl = rl; } });
    ay.forEach(function (a) { if (Math.abs(t - a[0]) <= SNAP) { rt = a[0]; gt = rt; } });
    if (gl !== null) guide(frame.doc, "v", gl);
    if (gt !== null) guide(frame.doc, "h", gt);
    return { l: rl, t: rt };
  }
  function guide(doc, axis, pos) {
    var g = doc.createElement("div"); g.className = "dt-guide " + axis;
    if (axis === "v") g.style.left = pos + "px"; else g.style.top = pos + "px";
    (doc.querySelector("section") || doc.body).appendChild(g);
  }
  function clearGuides(doc) { doc.querySelectorAll(".dt-guide").forEach(function (n) { n.remove(); }); }

  // ---------- resize type-aware ----------
  function startResize(el, corner, e) {
    var isImg = el.tagName === "IMG";
    var sx = e.clientX, sy = e.clientY;
    var w0 = el.offsetWidth, h0 = el.offsetHeight;
    var fs0 = parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).fontSize) || 40;
    var doc = el.ownerDocument;
    var dir = (corner === "se" || corner === "ne") ? 1 : -1;
    function mm(ev) {
      var d = ((ev.clientX - sx) * dir + (ev.clientY - sy) * (corner.indexOf("s") >= 0 ? 1 : -1)) / 2;
      if (isImg) {
        var nw = Math.max(16, w0 + d);
        el.style.width = Math.round(nw) + "px"; el.style.height = "auto";
      } else {
        var nf = Math.max(8, fs0 + d * 0.6);
        el.style.fontSize = Math.round(nf) + "px";
      }
      placeHandles();
    }
    function mu() {
      doc.removeEventListener("mousemove", mm); doc.removeEventListener("mouseup", mu);
      if (isImg) recordEdit(sel.n, slotName(el), "width", null, el.style.width);
      else recordEdit(sel.n, slotName(el), "font-size", null, el.style.fontSize);
    }
    doc.addEventListener("mousemove", mm); doc.addEventListener("mouseup", mu);
  }

  // ---------- texto inline ----------
  function startInline(frame, el) {
    if (el.tagName === "IMG") return;
    selectEl(frame, el);
    sel.doc.querySelectorAll(".dt-handle").forEach(function (n) { n.remove(); });
    var before = el.innerHTML;
    el.setAttribute("contenteditable", "true");
    el.focus();
    function done() {
      el.removeAttribute("contenteditable");
      el.removeEventListener("blur", done);
      if (el.innerHTML !== before) recordEdit(frame.n, slotName(el), "text", textOf(before), el.textContent);
      placeHandles();
    }
    el.addEventListener("blur", done);
  }
  function textOf(html) { return html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim(); }

  // ---------- foto de fundo (drop + reposicionar) ----------
  function applyBg(zone, dataUrl) {
    var img = new Image();
    img.onload = function () {
      var doc = zone.ownerDocument;
      var sr = (doc.querySelector("section") || doc.body).getBoundingClientRect();
      var zr = zone.getBoundingClientRect();
      var zw = W * (zr.width / sr.width), zh = H * (zr.height / sr.height);
      var scale = Math.max(zw / img.naturalWidth, zh / img.naturalHeight);
      zone.style.backgroundImage = "url(" + dataUrl + ")";
      zone.style.backgroundRepeat = "no-repeat";
      zone.style.backgroundPosition = "50% 50%";
      zone.style.backgroundSize = (img.naturalWidth * scale).toFixed(0) + "px " + (img.naturalHeight * scale).toFixed(0) + "px";
      zone.classList.remove("placeholder");
      zone.setAttribute("data-has-bg", "1");
    };
    img.src = dataUrl;
  }
  function bindBg(frame, zone) {
    zone.addEventListener("dragover", function (e) { e.preventDefault(); zone.classList.add("dt-drop"); });
    zone.addEventListener("dragleave", function () { zone.classList.remove("dt-drop"); });
    zone.addEventListener("drop", function (e) {
      e.preventDefault(); e.stopPropagation(); zone.classList.remove("dt-drop");
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f || f.type.indexOf("image/") !== 0) return;
      var r = new FileReader();
      r.onload = function () { applyBg(zone, r.result); recordEdit(frame.n, "bg", "bg", null, "imagem"); };
      r.readAsDataURL(f);
    });
    // arrastar a foto reposiciona
    zone.addEventListener("mousedown", function (e) {
      if (!zone.hasAttribute("data-has-bg")) return;
      e.preventDefault(); e.stopPropagation();
      var pp = (zone.style.backgroundPosition || "50% 50%").split(/\s+/);
      var px = parseFloat(pp[0]) || 50, py = parseFloat(pp[1]) || 50, sx = e.clientX, sy = e.clientY;
      var doc = frame.doc, rect = zone.getBoundingClientRect();
      function mm(ev) {
        var nx = Math.max(0, Math.min(100, px + ((sx - ev.clientX) / rect.width) * 100));
        var ny = Math.max(0, Math.min(100, py + ((sy - ev.clientY) / rect.height) * 100));
        zone.style.backgroundPosition = nx.toFixed(1) + "% " + ny.toFixed(1) + "%";
      }
      function mu() { doc.removeEventListener("mousemove", mm); doc.removeEventListener("mouseup", mu); recordEdit(frame.n, "bg", "bgpos", null, zone.style.backgroundPosition); }
      doc.addEventListener("mousemove", mm); doc.addEventListener("mouseup", mu);
    });
  }

  // ---------- contrato ----------
  function slotName(el) { return el.getAttribute("data-slot"); }
  function slotDef(n, el) {
    if (!contract) return null;
    var frame = frames.find(function (f) { return f.n === n; });
    var block = contract.blocks && contract.blocks.find(function (b) { return b.name === (frame && frame.block); });
    if (!block) return null;
    return block.slots.find(function (s) { return s.name === slotName(el); }) || null;
  }

  // ---------- painel ----------
  function field(label, html) { return '<div class="dt-field"><label>' + label + "</label>" + html + "</div>"; }
  function opts(list, sel) { return list.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + v + '"' + (String(sel) === String(v) ? " selected" : "") + ">" + t + "</option>"; }).join(""); }
  function nameForWeight(w) { for (var k in WEIGHTS) if (WEIGHTS[k] === String(w)) return k; return "Regular"; }
  function familyOf(el) { var f = el.ownerDocument.defaultView.getComputedStyle(el).fontFamily || ""; for (var i = 0; i < FAMILIES.length; i++) if (f.indexOf(FAMILIES[i]) >= 0) return FAMILIES[i]; return FAMILIES[0]; }

  function buildPanel(frame, el) {
    var def = slotDef(frame.n, el);
    panelTitle.textContent = slotName(el) || "elemento";
    panelSub.textContent = "bloco " + frame.block + (def ? "" : " · livre");
    var isImg = el.tagName === "IMG";
    var cs = el.ownerDocument.defaultView.getComputedStyle(el);
    var html = "";
    if (!isImg) {
      html += field("Fonte", '<select id="p-fam">' + opts(FAMILIES, familyOf(el)) + "</select>");
      html += field("Peso", '<select id="p-weight">' + opts(WEIGHT_NAMES, nameForWeight(cs.fontWeight)) + "</select>");
      html += '<div class="dt-row">' + field("Alinhar", '<select id="p-align">' + opts(ALIGNS, cs.textAlign) + "</select>") + field("Cor", '<select id="p-color">' + opts(COLORS, "") + "</select>") + "</div>";
      html += field("Tamanho (px)", '<input id="p-size" type="number" value="' + Math.round(parseFloat(cs.fontSize)) + '">');
    } else {
      html += field("Largura (px)", '<input id="p-w" type="number" value="' + Math.round(el.offsetWidth) + '">');
    }
    panelBody.innerHTML = html;
    var rm = document.createElement("button"); rm.className = "dt-remove"; rm.textContent = "Remover elemento";
    rm.addEventListener("click", removeSel); panelBody.appendChild(rm);

    bind("p-fam", "change", function (v) { el.style.fontFamily = '"' + v + '", sans-serif'; recordEdit(frame.n, slotName(el), "font-family", null, v); placeHandles(); });
    bind("p-weight", "change", function (v) { el.style.fontWeight = WEIGHTS[v]; recordEdit(frame.n, slotName(el), "font-weight", null, WEIGHTS[v]); });
    bind("p-align", "change", function (v) { el.style.textAlign = v; recordEdit(frame.n, slotName(el), "text-align", null, v); });
    bind("p-color", "change", function (v) { el.style.color = v; recordEdit(frame.n, slotName(el), "color", null, v); });
    bind("p-size", "input", function (v) { if (v) { el.style.fontSize = v + "px"; recordEdit(frame.n, slotName(el), "font-size", null, v + "px"); placeHandles(); } });
    bind("p-w", "input", function (v) { if (v) { el.style.width = v + "px"; el.style.height = "auto"; recordEdit(frame.n, slotName(el), "width", null, v + "px"); placeHandles(); } });
  }
  function bind(id, ev, fn) { var i = document.getElementById(id); if (i) i.addEventListener(ev, function () { fn(i.value); }); }

  function removeSel() {
    if (!sel) return;
    recordEdit(sel.n, slotName(sel.el), "removed", "present", "removed");
    sel.el.style.display = "none";
    deselect();
  }

  // ---------- deltas ----------
  function recordEdit(n, slot, prop, from, to) {
    if (!slot) slot = prop;
    var ex = edits.find(function (e) { return e._n === n && e.target === slot && e.prop === prop; });
    if (ex) { ex.to = to; return; }
    var frame = frames.find(function (f) { return f.n === n; });
    edits.push({ _n: n, _block: frame ? frame.block : null, target: slot, prop: prop, from: from, to: to, scope: SCOPE[prop] || "content" });
  }

  // ---------- salvar / exportar ----------
  function cleanSection(root) {
    var clone = root.cloneNode(true);
    clone.querySelectorAll(".dt-handle,.dt-guide").forEach(function (n) { n.remove(); });
    clone.querySelectorAll(".dt-sel").forEach(function (n) { n.classList.remove("dt-sel"); });
    clone.querySelectorAll(".dt-drop").forEach(function (n) { n.classList.remove("dt-drop"); });
    clone.querySelectorAll("[contenteditable]").forEach(function (n) { n.removeAttribute("contenteditable"); });
    if (clone.classList) { clone.classList.remove("dt-sel", "dt-drop"); if (!clone.className) clone.removeAttribute("class"); }
    return clone.outerHTML;
  }
  function buildEditsPayload() {
    var bySlide = {};
    edits.forEach(function (e) {
      if (!bySlide[e._n]) bySlide[e._n] = { slide: e._n, block: e._block, edits: [] };
      bySlide[e._n].edits.push({ target: e.target, prop: e.prop, from: e.from, to: e.to, scope: e.scope });
    });
    return {
      estilo: (contract && contract.estilo) || "desconhecido",
      estilo_path: (contract && contract.estilo_path) || null,
      post: (contract && contract.post) || document.title,
      slides: Object.keys(bySlide).map(function (k) { return bySlide[k]; })
    };
  }
  var saveBtn = document.getElementById("dt-save");
  var exportBtn = document.getElementById("dt-export");
  saveBtn.addEventListener("click", function () {
    if (sel) clearScaffold(sel.doc);
    var slides = frames.map(function (f) { return { n: f.n, html: cleanSection(f.root) }; });
    saveBtn.textContent = "Salvando…";
    fetch(DT_BACKEND + "/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slides: slides, edits: buildEditsPayload() }) })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
      .then(function (res) { saveBtn.textContent = res.ok ? "Salvo ✓" : "Erro"; if (!res.ok) console.error("save:", res.b); setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1400); if (sel) placeHandles(); })
      .catch(function () { saveBtn.textContent = "Offline"; setTimeout(function () { saveBtn.textContent = "Salvar"; }, 1400); });
  });
  exportBtn.addEventListener("click", function () {
    exportBtn.textContent = "Exportando…";
    fetch(DT_BACKEND + "/export", { method: "POST" })
      .then(function (r) { exportBtn.textContent = r.ok ? "Exportado ✓" : "Erro"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 1800); })
      .catch(function () { exportBtn.textContent = "Offline"; setTimeout(function () { exportBtn.textContent = "Exportar"; }, 1800); });
  });

  // ---------- navegação ----------
  var prevBtn = document.getElementById("dt-prev"), nextBtn = document.getElementById("dt-next"), counter = document.getElementById("dt-counter");
  function updateNav() {
    counter.textContent = (current + 1) + " / " + frames.length;
    prevBtn.disabled = current === 0; nextBtn.disabled = current >= frames.length - 1;
  }
  function goTo(i) { current = Math.max(0, Math.min(frames.length - 1, i)); if (frames[current]) frames[current].iframe.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); updateNav(); }
  prevBtn.addEventListener("click", function () { goTo(current - 1); });
  nextBtn.addEventListener("click", function () { goTo(current + 1); });

  // expõe pra verificação headless
  window.__DT = { frames: function () { return frames; }, edits: function () { return edits; }, contract: function () { return contract; }, selection: function () { return sel; } };
})();
