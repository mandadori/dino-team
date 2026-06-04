/* Dino Editor — overlay.js
 * Motor de interação. O gesto é capturado pela superfície top-level (passada
 * pelo app) via setPointerCapture — nunca nasce dentro do iframe, então o
 * iframe não rouba o mouse. Seleção/handles/guias desenhados na #dt-overlay.
 */
window.DT = window.DT || {};
(function () {
  "use strict";
  var W = 1080, H = 1350, MARGIN = 80, THRESH = 7;

  var layer = null, stage = null;
  var sel = null;                 // { n, block, el, iframe, root, doc, surface }
  var box = null, hoverBox = null, handles = [], guides = [];
  var aspectLock = true;

  function init(opts) { layer = opts.layer; stage = opts.stage; }

  // ---------- helpers ----------
  function pnl(fn) { return DT.panel && DT.panel[fn]; }
  function hist() { return DT.history; }
  function slotOf(el) { return el.getAttribute("data-slot") || el.__dtslot || el.tagName.toLowerCase(); }
  function bgSlot(z) { return z.getAttribute("data-slot") || z.getAttribute("data-bg-drop") || "bg"; }
  function setDragging(on) { if (stage) stage.classList.toggle("is-dragging", on); }
  function frameScale() { return sel.iframe.getBoundingClientRect().width / W; }

  function typeOf(el) {
    if (el.hasAttribute("data-bg-drop")) return "bg-image";
    if (el.tagName === "IMG") return "image";
    // elemento de "preenchimento": sem texto direto e com fundo (cor/gradiente)
    var hasText = false;
    for (var c = el.firstChild; c; c = c.nextSibling) { if (c.nodeType === 3 && c.textContent.trim()) { hasText = true; break; } }
    if (!hasText) {
      var cs = el.ownerDocument.defaultView.getComputedStyle(el);
      var bgImg = cs.backgroundImage && cs.backgroundImage !== "none";
      var bgCol = cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== "transparent";
      if (bgImg || bgCol) return "bg-fill";
    }
    return "text";
  }
  function setAspect(on) { aspectLock = on; }
  function getAspect() { return aspectLock; }

  // style.left/top são relativos ao offsetParent (ex.: .half em position:relative),
  // mas guias/X-Y/align trabalham em coords da SEÇÃO. secOffset converte entre os dois.
  function secOffset(el, root) {
    var op = el.offsetParent || root;
    if (op === root) return { x: 0, y: 0 };
    var ob = op.getBoundingClientRect(), rb = root.getBoundingClientRect();
    return { x: ob.left - rb.left, y: ob.top - rb.top };
  }
  function ensureAbsolute(el, root) {
    var cs = el.ownerDocument.defaultView.getComputedStyle(el);
    if (cs.position === "absolute" && el.style.left) return;
    var op = el.offsetParent || root;
    var b = el.getBoundingClientRect(), ob = op.getBoundingClientRect();
    // Elementos esticados (ancorados em left+right / top+bottom, ex.: barra de
    // progresso) perdem o tamanho ao soltar right/bottom — fixa W/H antes.
    // NUNCA pinar W/H em texto: além de impedir o texto de crescer ao editar, um
    // width pinado (arredondado e medido antes da fonte Anton carregar) deixa o
    // elemento ~1px estreito e reflui ("quebra em 2 linhas"). Texto fica com
    // width/height auto → shrink-to-fit robusto. Atenção: `.half-text` é
    // position:relative (z-index), e o Chrome reporta left/right como "0px"
    // (não "auto"), então o teste left/right sozinho dispararia no texto.
    var isText = typeOf(el) === "text";
    if (!el.style.width && !isText && cs.left !== "auto" && cs.right !== "auto") el.style.width = Math.round(b.width) + "px";
    if (!el.style.height && !isText && cs.top !== "auto" && cs.bottom !== "auto") el.style.height = Math.round(b.height) + "px";
    el.style.position = "absolute";
    el.style.left = Math.round(b.left - ob.left) + "px";
    el.style.top = Math.round(b.top - ob.top) + "px";
    el.style.right = "auto"; el.style.bottom = "auto"; el.style.margin = "0";
  }

  // ---------- seleção + handles ----------
  var HPOS = [["nw", 0, 0], ["n", .5, 0], ["ne", 1, 0], ["e", 1, .5], ["se", 1, 1], ["s", .5, 1], ["sw", 0, 1], ["w", 0, .5]];

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
  function clearSelection() { if (box) { box.remove(); box = null; } handles.forEach(function (h) { h.remove(); }); handles = []; }

  function select(ctx) { sel = ctx; clearHover(); drawSelection(); if (pnl("show")) DT.panel.show(sel); }
  function deselect() { if (!sel) return; clearSelection(); clearGuides(); sel = null; if (pnl("hide")) DT.panel.hide(); }
  function reposition() { if (sel) drawSelection(); }

  // ---------- hover ----------
  function hover(frame, el) {
    if (sel && sel.el === el) { clearHover(); return; }
    if (!el) { clearHover(); return; }
    var r = frame.iframe.getBoundingClientRect(), s = r.width / W, b = el.getBoundingClientRect();
    if (!hoverBox) { hoverBox = document.createElement("div"); hoverBox.className = "dt-hoverbox"; layer.appendChild(hoverBox); }
    hoverBox.style.left = (r.left + b.left * s) + "px"; hoverBox.style.top = (r.top + b.top * s) + "px";
    hoverBox.style.width = (b.width * s) + "px"; hoverBox.style.height = (b.height * s) + "px";
  }
  function clearHover() { if (hoverBox) { hoverBox.remove(); hoverBox = null; } }

  // ---------- snapping + guias (slide + bloco pai + irmãos) ----------
  function snap(el, root, l, t) {
    var w = el.offsetWidth, h = el.offsetHeight;
    var xs = [0, MARGIN, W / 2, W - MARGIN, W], ys = [0, MARGIN, H / 2, H - MARGIN, H];
    var rb = root.getBoundingClientRect();
    var par = el.parentElement;
    if (par && par !== root) { var pb = par.getBoundingClientRect(), pl = pb.left - rb.left, pt = pb.top - rb.top; xs.push(pl, pl + pb.width / 2, pl + pb.width); ys.push(pt, pt + pb.height / 2, pt + pb.height); }
    Array.prototype.forEach.call(root.querySelectorAll("[data-dt-selectable]"), function (o) { if (o === el || o.style.display === "none") return; var b = o.getBoundingClientRect(), ol = b.left - rb.left, ot = b.top - rb.top; xs.push(ol, ol + b.width / 2, ol + b.width); ys.push(ot, ot + b.height / 2, ot + b.height); });
    var ax = [l, l + w / 2, l + w], ay = [t, t + h / 2, t + h];
    var bx = null, by = null;
    ax.forEach(function (a) { xs.forEach(function (tx) { var d = Math.abs(a - tx); if (d <= THRESH && (!bx || d < bx.d)) bx = { d: d, adj: tx - a, line: tx }; }); });
    ay.forEach(function (a) { ys.forEach(function (ty) { var d = Math.abs(a - ty); if (d <= THRESH && (!by || d < by.d)) by = { d: d, adj: ty - a, line: ty }; }); });
    var nl = l, nt = t, g = [];
    if (bx) { nl = l + bx.adj; g.push({ axis: "v", pos: bx.line }); }
    if (by) { nt = t + by.adj; g.push({ axis: "h", pos: by.line }); }
    nl = Math.max(-w + 60, Math.min(W - 60, nl));     // clamp: nunca perde o elemento
    nt = Math.max(-h + 30, Math.min(H - 30, nt));
    return { l: Math.round(nl), t: Math.round(nt), guides: g };
  }
  function drawGuides(list) {
    clearGuides();
    if (!sel) return;
    var r = sel.iframe.getBoundingClientRect(), s = r.width / W;
    list.forEach(function (g) {
      var e = document.createElement("div"); e.className = "dt-guide " + g.axis;
      if (g.axis === "v") { e.style.left = (r.left + g.pos * s) + "px"; e.style.top = r.top + "px"; e.style.height = (H * s) + "px"; }
      else { e.style.top = (r.top + g.pos * s) + "px"; e.style.left = r.left + "px"; e.style.width = (W * s) + "px"; }
      layer.appendChild(e); guides.push(e);
    });
  }
  function clearGuides() { guides.forEach(function (g) { g.remove(); }); guides = []; }

  // ---------- mover (pointer capture na superfície) ----------
  function beginMove(surface, e) {
    if (!sel) return;
    var el = sel.el;
    if (el.hasAttribute("data-bg-drop")) { if (el.hasAttribute("data-has-bg")) beginBgMove(surface, e); return; }
    var s = frameScale(), startX = e.clientX, startY = e.clientY, started = false, l0 = 0, t0 = 0, off = { x: 0, y: 0 };
    try { surface.setPointerCapture(e.pointerId); } catch (_) {}
    function move(ev) {
      if (!started) {
        if (Math.abs(ev.clientX - startX) < 3 && Math.abs(ev.clientY - startY) < 3) return;
        hist().begin(); ensureAbsolute(el, sel.root); off = secOffset(el, sel.root);
        l0 = (parseFloat(el.style.left) || 0) + off.x; t0 = (parseFloat(el.style.top) || 0) + off.y;  // seção
        started = true; setDragging(true);
      }
      var sn = snap(el, sel.root, l0 + (ev.clientX - startX) / s, t0 + (ev.clientY - startY) / s);     // seção
      el.style.left = (sn.l - off.x) + "px"; el.style.top = (sn.t - off.y) + "px";                     // offsetParent
      drawGuides(sn.guides); drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
    }
    function up() {
      try { surface.releasePointerCapture(e.pointerId); } catch (_) {}
      surface.removeEventListener("pointermove", move); surface.removeEventListener("pointerup", up); surface.removeEventListener("pointercancel", up);
      clearGuides(); setDragging(false);
      if (started) { DT.edits.record(sel.n, sel.block, slotOf(el), "left", null, el.style.left); DT.edits.record(sel.n, sel.block, slotOf(el), "top", null, el.style.top); }
    }
    surface.addEventListener("pointermove", move); surface.addEventListener("pointerup", up); surface.addEventListener("pointercancel", up);
  }

  // ---------- resize (handles top-level, pointer capture) ----------
  function onHandleDown(e) {
    e.preventDefault(); e.stopPropagation();
    if (!sel) return;
    var pos = e.currentTarget.dataset.pos, el = sel.el, t = typeOf(el), isImg = t === "image";
    var handle = e.currentTarget; try { handle.setPointerCapture(e.pointerId); } catch (_) {}
    var s = frameScale(), ox = e.clientX, oy = e.clientY;
    var w0 = el.offsetWidth, h0 = el.offsetHeight, ratio = h0 ? w0 / h0 : 1;
    var fs0 = parseFloat(el.ownerDocument.defaultView.getComputedStyle(el).fontSize) || 40;
    var west = pos.indexOf("w") >= 0, east = pos.indexOf("e") >= 0, north = pos.indexOf("n") >= 0, south = pos.indexOf("s") >= 0, corner = (west || east) && (north || south);
    var started = false, l0 = 0, t0 = 0;
    function move(ev) {
      if (!started) { hist().begin(); ensureAbsolute(el, sel.root); l0 = parseFloat(el.style.left) || 0; t0 = parseFloat(el.style.top) || 0; started = true; setDragging(true); }
      var dx = (ev.clientX - ox) / s, dy = (ev.clientY - oy) / s;
      if (isImg) {
        var nw = w0, nh = h0, nl = l0, nt = t0;
        if (east) nw = Math.max(16, w0 + dx); if (west) { nw = Math.max(16, w0 - dx); nl = l0 + (w0 - nw); }
        if (south) nh = Math.max(16, h0 + dy); if (north) { nh = Math.max(16, h0 - dy); nt = t0 + (h0 - nh); }
        if (corner && aspectLock) { nh = nw / ratio; if (north) nt = t0 + (h0 - nh); }
        el.style.width = Math.round(nw) + "px"; el.style.height = Math.round(nh) + "px"; el.style.left = Math.round(nl) + "px"; el.style.top = Math.round(nt) + "px";
      } else {
        // texto: qualquer handle escala a fonte (proporção natural)
        var dd = (south ? dy : (north ? -dy : 0)) + (east ? dx : (west ? -dx : 0));
        el.style.fontSize = Math.max(8, Math.round(fs0 + dd * 0.5)) + "px";
      }
      drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
    }
    function up() {
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
      handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", up); handle.removeEventListener("pointercancel", up);
      setDragging(false);
      if (started) {
        if (isImg) { DT.edits.record(sel.n, sel.block, slotOf(el), "width", null, el.style.width); DT.edits.record(sel.n, sel.block, slotOf(el), "height", null, el.style.height); }
        else DT.edits.record(sel.n, sel.block, slotOf(el), "font-size", null, el.style.fontSize);
      }
    }
    handle.addEventListener("pointermove", move); handle.addEventListener("pointerup", up); handle.addEventListener("pointercancel", up);
  }

  // ---------- texto inline ----------
  function editText(el, surface) {
    if (typeOf(el) !== "text") return;
    hist().begin();
    surface.style.pointerEvents = "none";       // deixa o iframe receber foco/teclado
    var before = el.innerHTML;
    el.setAttribute("contenteditable", "true"); el.focus();
    try { var rng = el.ownerDocument.createRange(); rng.selectNodeContents(el); var selo = el.ownerDocument.defaultView.getSelection(); selo.removeAllRanges(); selo.addRange(rng); } catch (_) {}
    function done() {
      el.removeAttribute("contenteditable"); el.removeEventListener("blur", done); surface.style.pointerEvents = "";
      if (el.innerHTML !== before) DT.edits.record(sel.n, sel.block, slotOf(el), "text", textOf(before), el.textContent);
      drawSelection();
    }
    el.addEventListener("blur", done);
  }
  function textOf(html) { return html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim(); }

  // ---------- foto de fundo ----------
  function applyBg(zone, dataUrl) {
    var img = new Image();
    img.onload = function () {
      var sr = (zone.ownerDocument.querySelector("section") || zone.ownerDocument.body).getBoundingClientRect();
      var zr = zone.getBoundingClientRect();
      var zw = W * (zr.width / sr.width), zh = H * (zr.height / sr.height);
      var cover = Math.max(zw / img.naturalWidth, zh / img.naturalHeight);
      zone.__bgNatW = img.naturalWidth; zone.__bgNatH = img.naturalHeight; zone.__bgCover = cover; zone.__bgZoom = 1;
      zone.style.backgroundImage = "url(" + dataUrl + ")"; zone.style.backgroundRepeat = "no-repeat"; zone.style.backgroundPosition = "50% 50%";
      zone.style.backgroundSize = Math.round(img.naturalWidth * cover) + "px " + Math.round(img.naturalHeight * cover) + "px";
      zone.classList.remove("placeholder"); zone.setAttribute("data-has-bg", "1");
    };
    img.src = dataUrl;
  }
  function setBgZoom(zone, z) { if (!zone.__bgCover) return; zone.__bgZoom = z; var sc = zone.__bgCover * z; zone.style.backgroundSize = Math.round(zone.__bgNatW * sc) + "px " + Math.round(zone.__bgNatH * sc) + "px"; }
  function clearBg(zone) { zone.style.backgroundImage = ""; zone.style.backgroundSize = ""; zone.style.backgroundPosition = ""; zone.removeAttribute("data-has-bg"); zone.classList.add("placeholder"); }
  function beginBgMove(surface, e) {
    var zone = sel.el, pp = (zone.style.backgroundPosition || "50% 50%").split(/\s+/), px = parseFloat(pp[0]) || 50, py = parseFloat(pp[1]) || 50;
    var rect = zone.getBoundingClientRect(), started = false;
    try { surface.setPointerCapture(e.pointerId); } catch (_) {}
    var sx = e.clientX, sy = e.clientY;
    function move(ev) {
      if (!started) { if (Math.abs(ev.clientX - sx) < 3 && Math.abs(ev.clientY - sy) < 3) return; hist().begin(); started = true; setDragging(true); }
      var nx = Math.max(0, Math.min(100, px + ((sx - ev.clientX) / rect.width) * 100));
      var ny = Math.max(0, Math.min(100, py + ((sy - ev.clientY) / rect.height) * 100));
      zone.style.backgroundPosition = nx.toFixed(1) + "% " + ny.toFixed(1) + "%";
    }
    function up() { try { surface.releasePointerCapture(e.pointerId); } catch (_) {} surface.removeEventListener("pointermove", move); surface.removeEventListener("pointerup", up); surface.removeEventListener("pointercancel", up); setDragging(false); if (started) DT.edits.record(sel.n, sel.block, bgSlot(zone), "bgpos", null, zone.style.backgroundPosition); }
    surface.addEventListener("pointermove", move); surface.addEventListener("pointerup", up); surface.addEventListener("pointercancel", up);
  }

  // ---------- API p/ painel + teclado ----------
  function align(type) {
    if (!sel) return; hist().begin(); ensureAbsolute(sel.el, sel.root);
    var b = sel.el.getBoundingClientRect(), w = b.width, h = b.height;
    var map = { left: ["left", MARGIN], hcenter: ["left", W / 2 - w / 2], right: ["left", W - MARGIN - w], top: ["top", MARGIN], vcenter: ["top", H / 2 - h / 2], bottom: ["top", H - MARGIN - h] };
    var m = map[type]; if (!m) return; var off = secOffset(sel.el, sel.root);
    sel.el.style[m[0]] = Math.round(m[1] - (m[0] === "left" ? off.x : off.y)) + "px";
    DT.edits.record(sel.n, sel.block, slotOf(sel.el), m[0], null, sel.el.style[m[0]]); drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
  }
  function setX(v) { if (!sel) return; hist().begin(); ensureAbsolute(sel.el, sel.root); var off = secOffset(sel.el, sel.root); sel.el.style.left = Math.round(v - off.x) + "px"; DT.edits.record(sel.n, sel.block, slotOf(sel.el), "left", null, sel.el.style.left); drawSelection(); }
  function setY(v) { if (!sel) return; hist().begin(); ensureAbsolute(sel.el, sel.root); var off = secOffset(sel.el, sel.root); sel.el.style.top = Math.round(v - off.y) + "px"; DT.edits.record(sel.n, sel.block, slotOf(sel.el), "top", null, sel.el.style.top); drawSelection(); }
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
  function setStyle(prop, val, noHist) {
    if (!sel) return; var el = sel.el;
    if (!noHist) hist().begin();
    var css = { "font-family": "fontFamily", "font-weight": "fontWeight", "text-align": "textAlign", "color": "color", "letter-spacing": "letterSpacing", "line-height": "lineHeight", "font-size": "fontSize", "opacity": "opacity" }[prop];
    if (prop === "font-family") el.style.fontFamily = '"' + val + '", sans-serif'; else if (css) el.style[css] = val;
    DT.edits.record(sel.n, sel.block, slotOf(el), prop, null, val); drawSelection();
  }
  function setBgFill(val, kind) {
    if (!sel) return; hist().begin(); var el = sel.el; el.style.background = val;
    // zona de foto que vira cor/gradiente: limpa o estado de foto pra a cor aparecer limpa
    if (el.hasAttribute("data-bg-drop")) { el.removeAttribute("data-has-bg"); el.classList.remove("placeholder"); el.__bgCover = null; el.__bgZoom = 1; }
    DT.edits.record(sel.n, sel.block, slotOf(el), kind === "gradient" ? "bg-gradient" : "bg-color", null, val); drawSelection();
  }
  // volta uma zona de fundo ao estado "foto" (placeholder) quando não há foto aplicada
  function bgToPhotoMode() {
    if (!sel) return; var el = sel.el; if (el.hasAttribute("data-has-bg")) return;
    el.style.background = ""; el.style.backgroundImage = ""; el.style.backgroundSize = ""; el.style.backgroundPosition = "";
    if (el.hasAttribute("data-bg-drop")) el.classList.add("placeholder"); drawSelection();
  }
  function nudge(dx, dy) {
    if (!sel) return; hist().begin(); ensureAbsolute(sel.el, sel.root);
    sel.el.style.left = Math.round((parseFloat(sel.el.style.left) || 0) + dx) + "px";
    sel.el.style.top = Math.round((parseFloat(sel.el.style.top) || 0) + dy) + "px";
    DT.edits.record(sel.n, sel.block, slotOf(sel.el), "left", null, sel.el.style.left); DT.edits.record(sel.n, sel.block, slotOf(sel.el), "top", null, sel.el.style.top); drawSelection(); if (pnl("syncGeom")) DT.panel.syncGeom();
  }
  function removeSel() { if (!sel) return; hist().begin(); DT.edits.record(sel.n, sel.block, slotOf(sel.el), "removed", "present", "removed"); sel.el.style.display = "none"; deselect(); }
  function replaceSelBg(file) { if (!sel || !sel.el.hasAttribute("data-bg-drop")) return; hist().begin(); var r = new FileReader(); r.onload = function () { applyBg(sel.el, r.result); DT.edits.record(sel.n, sel.block, bgSlot(sel.el), "bg", null, "imagem"); drawSelection(); if (pnl("show")) DT.panel.show(sel); }; r.readAsDataURL(file); }
  function zoomSelBg(z) { if (!sel || !sel.el.hasAttribute("data-bg-drop")) return; setBgZoom(sel.el, z); DT.edits.record(sel.n, sel.block, bgSlot(sel.el), "bg-zoom", null, String(z)); }
  function removeSelBg() { if (!sel || !sel.el.hasAttribute("data-bg-drop")) return; hist().begin(); clearBg(sel.el); DT.edits.record(sel.n, sel.block, bgSlot(sel.el), "bg", null, "removida"); if (pnl("show")) DT.panel.show(sel); }

  function currentGeom() { if (!sel) return null; var b = sel.el.getBoundingClientRect(), rb = sel.root.getBoundingClientRect(); return { x: Math.round(b.left - rb.left), y: Math.round(b.top - rb.top), w: Math.round(b.width), h: Math.round(b.height) }; }
  function currentType() { return sel ? typeOf(sel.el) : null; }

  DT.overlay = {
    init: init, select: select, deselect: deselect, reposition: reposition, beginMove: beginMove, hover: hover, clearHover: clearHover,
    current: function () { return sel; }, editText: editText, typeOf: typeOf,
    align: align, setX: setX, setY: setY, setW: setW, setH: setH, setStyle: setStyle, setBgFill: setBgFill, bgToPhotoMode: bgToPhotoMode, nudge: nudge, removeSel: removeSel,
    replaceSelBg: replaceSelBg, zoomSelBg: zoomSelBg, removeSelBg: removeSelBg, currentGeom: currentGeom, currentType: currentType,
    setAspect: setAspect, getAspect: getAspect
  };
})();
