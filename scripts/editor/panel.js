/* Dino Editor — panel.js
 * Painel de propriedades (PT-BR), adaptado ao TIPO do elemento:
 *   texto    → Posição, Dimensões(escala fonte), Aparência, Tipografia
 *   imagem   → Posição, Dimensões(tamanho + trava), Aparência
 *   bg-imagem→ Imagem (trocar/zoom/reposicionar/remover)
 *   bg-fill  → Fundo (sólido/gradiente), Aparência
 */
window.DT = window.DT || {};
(function () {
  "use strict";
  var WEIGHTS = { Fina: "100", Leve: "300", Regular: "400", Média: "500", "Semi-bold": "600", Bold: "700" };
  var WEIGHT_NAMES = Object.keys(WEIGHTS);
  var FAMILIES = ["Anton", "Montserrat"];
  var COLORS = [["#ffffff", "Branco"], ["#000000", "Preto"], ["#7f7f7f", "Cinza"]];

  var root = null, contract = null, refs = {};

  function init() { root = document.getElementById("dt-panel"); }
  function setContract(c) { contract = c; }

  var ICON = {
    al: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2.5" y1="2" x2="2.5" y2="14"/><rect x="4.5" y="5" width="8" height="6"/></svg>',
    ac: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="8" y1="2" x2="8" y2="14"/><rect x="4" y="5" width="8" height="6"/></svg>',
    ar: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="13.5" y1="2" x2="13.5" y2="14"/><rect x="3.5" y="5" width="8" height="6"/></svg>',
    at: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="2.5" x2="14" y2="2.5"/><rect x="5" y="4.5" width="6" height="8"/></svg>',
    am: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="8" x2="14" y2="8"/><rect x="5" y="4" width="6" height="8"/></svg>',
    ab: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="13.5" x2="14" y2="13.5"/><rect x="5" y="3.5" width="6" height="8"/></svg>',
    tl: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="10" y2="8"/><line x1="2" y1="12" x2="12" y2="12"/></svg>',
    tc: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>',
    tr: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><line x1="2" y1="4" x2="14" y2="4"/><line x1="6" y1="8" x2="14" y2="8"/><line x1="4" y1="12" x2="14" y2="12"/></svg>',
    img: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="2" y="3" width="12" height="10" rx="1"/><circle cx="5.5" cy="6.5" r="1.2"/><path d="M3 12l3.5-3.5L9 11l2-2 3 3"/></svg>',
    lockOn: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3.5" y="7" width="9" height="6" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"/></svg>',
    lockOff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="3.5" y="7" width="9" height="6" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 0 1 4.8-1"/></svg>'
  };

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function field(key, id, value, type) { var f = el("div", "pnl-field grow"); if (key) f.appendChild(el("span", "k", key)); var i = el("input"); i.id = id; i.type = type || "text"; i.value = value; f.appendChild(i); refs[id] = i; return f; }
  function selectField(id, options, selected) {
    var f = el("div", "pnl-field grow"); var s = el("select"); s.id = id;
    options.forEach(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; var op = el("option"); op.value = v; op.textContent = t; if (String(v) === String(selected)) op.selected = true; s.appendChild(op); });
    f.appendChild(s); refs[id] = s; return f;
  }
  function btnGroup(items, current, onPick) {
    var g = el("div", "pnl-btns group");
    items.forEach(function (it) { var b = el("button", it[0] === current ? "on" : null, ICON[it[1]]); b.title = it[2] || ""; b.addEventListener("click", function () { g.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onPick(it[0]); }); g.appendChild(b); });
    return g;
  }
  function section(title) { var s = el("div", "pnl-sec"); if (title) s.appendChild(el("h3", null, title)); return s; }
  function label(t) { return el("p", "pnl-label", t); }

  function show(sel) {
    refs = {}; root.innerHTML = ""; root.classList.add("is-open");
    var elx = sel.el, type = DT.overlay.typeOf(elx);
    var cs = elx.ownerDocument.defaultView.getComputedStyle(elx);
    var slot = elx.getAttribute("data-slot") || elx.__dtslot || "elemento";
    var titles = { text: "Texto", image: "Imagem", "bg-image": "Foto de fundo", "bg-fill": "Fundo" };

    var head = el("div", "pnl-head"); var ht = el("div");
    ht.appendChild(el("h2", null, titles[type] || "Elemento"));
    ht.appendChild(el("div", "sub", slot + " · bloco " + (sel.block || "—")));
    head.appendChild(ht); root.appendChild(head);

    if (type === "bg-image") { buildBg(elx, cs); buildOpacity(cs); return; }
    if (type === "bg-fill") { buildFill(elx, cs); buildOpacity(cs); buildRemove(); return; }

    // ---- Posição ----
    var pos = section("Posição");
    pos.appendChild(label("Alinhamento"));
    var ar = el("div", "pnl-row");
    ar.appendChild(btnGroup([["left", "al", "Esquerda"], ["hcenter", "ac", "Centro H"], ["right", "ar", "Direita"]], null, function (t) { DT.overlay.align(t); }));
    ar.appendChild(btnGroup([["top", "at", "Topo"], ["vcenter", "am", "Meio V"], ["bottom", "ab", "Base"]], null, function (t) { DT.overlay.align(t); }));
    pos.appendChild(ar);
    var g = DT.overlay.currentGeom() || { x: 0, y: 0, w: 0, h: 0 };
    var xy = el("div", "pnl-row"); xy.appendChild(field("X", "p-x", g.x, "number")); xy.appendChild(field("Y", "p-y", g.y, "number")); pos.appendChild(xy);
    root.appendChild(pos);

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

    buildOpacity(cs);

    // ---- Tipografia (só texto) ----
    if (type === "text") {
      var ty = section("Tipografia");
      ty.appendChild(label("Fonte"));
      ty.appendChild(el("div", "pnl-row", null)).appendChild(selectField("p-fam", FAMILIES, familyOf(cs)));
      var wsz = el("div", "pnl-row"); wsz.appendChild(selectField("p-weight", WEIGHT_NAMES.map(function (n) { return [n, n]; }), nameForWeight(cs.fontWeight))); wsz.appendChild(field("Tam", "p-size", Math.round(parseFloat(cs.fontSize)), "number")); ty.appendChild(wsz);
      var lhls = el("div", "pnl-row"); lhls.appendChild(field("Entrelinha", "p-lh", lhVal(cs), "number")); lhls.appendChild(field("Tracking", "p-ls", lsVal(cs), "number")); ty.appendChild(lhls);
      ty.appendChild(label("Alinhamento do texto"));
      ty.appendChild(el("div", "pnl-row", null)).appendChild(btnGroup([["left", "tl", "Esq"], ["center", "tc", "Centro"], ["right", "tr", "Dir"]], cs.textAlign, function (t) { DT.overlay.setStyle("text-align", t); }));
      ty.appendChild(label("Cor"));
      ty.appendChild(el("div", "pnl-row", null)).appendChild(selectField("p-color", COLORS, hexOf(cs.color)));
      root.appendChild(ty);
    }

    buildRemove();
    bindCommon();
  }

  function buildOpacity(cs) { var ap = section("Aparência"); ap.appendChild(label("Opacidade")); ap.appendChild(el("div", "pnl-row", null)).appendChild(field("%", "p-op", Math.round((parseFloat(cs.opacity) || 1) * 100), "number")); root.appendChild(ap); bindOne("p-op", function (v) { DT.overlay.setStyle("opacity", String(Math.max(0, Math.min(100, parseFloat(v) || 100)) / 100)); }); }

  // Fundo (zona data-bg-drop): alterna entre Foto, Cor sólida e Gradiente.
  function buildBg(zone, cs) {
    var sec = section("Fundo");
    var fill = readFill(zone, cs);
    var mode = zone.hasAttribute("data-has-bg") ? "foto" : (fill.kind === "gradient" ? "gradiente" : (hasInlineColor(zone) ? "cor" : "foto"));
    var toggle = el("div", "pnl-row");
    toggle.appendChild(btnGroupText([["foto", "Foto"], ["cor", "Cor"], ["gradiente", "Gradiente"]], mode, function (m) {
      mode = m;
      if (m === "foto") DT.overlay.bgToPhotoMode();
      render();
      if (m !== "foto") applyFill();
    }));
    sec.appendChild(toggle);
    var body = el("div"); sec.appendChild(body); root.appendChild(sec);

    function colorRow(lbl, id, val) { var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl)); var c = el("input"); c.type = "color"; c.id = id; c.value = val || "#000000"; c.addEventListener("input", applyFill); row.appendChild(c); refs[id] = c; return row; }
    function applyFill() {
      if (mode === "cor") { DT.overlay.setBgFill(refs["f-c1"].value, "solid"); }
      else if (mode === "gradiente") { var a = parseInt((refs["f-ang"] && refs["f-ang"].value) || 180) || 180; DT.overlay.setBgFill("linear-gradient(" + a + "deg, " + refs["f-c1"].value + ", " + refs["f-c2"].value + ")", "gradient"); }
    }
    function render() {
      body.innerHTML = "";
      if (mode === "foto") { renderFoto(); return; }
      var cur = readFill(zone, cs);
      body.appendChild(colorRow(mode === "gradiente" ? "Cor 1" : "Cor", "f-c1", cur.c1));
      if (mode === "gradiente") {
        body.appendChild(colorRow("Cor 2", "f-c2", cur.c2));
        var ang = el("div", "pnl-row"); ang.appendChild(field("Ângulo", "f-ang", cur.angle, "number")); body.appendChild(ang);
        refs["f-ang"].addEventListener("change", applyFill);
      }
    }
    function renderFoto() {
      var has = zone.hasAttribute("data-has-bg");
      var btn = el("button", "pnl-img-btn", ICON.img + (has ? "Trocar foto" : "Adicionar foto"));
      var file = el("input"); file.type = "file"; file.accept = "image/*"; file.style.display = "none";
      btn.addEventListener("click", function () { file.click(); });
      file.addEventListener("change", function () { if (file.files && file.files[0]) { DT.overlay.replaceSelBg(file.files[0]); } });
      body.appendChild(btn); body.appendChild(file);
      if (has) {
        body.appendChild(label("Zoom")); var z = el("input"); z.type = "range"; z.min = "1"; z.max = "3"; z.step = "0.02"; z.value = String(zone.__bgZoom || 1);
        z.addEventListener("input", function () { DT.overlay.zoomSelBg(parseFloat(z.value)); });
        body.appendChild(z);
        body.appendChild(label("Arraste a foto no slide para reposicionar."));
        var rm = el("button", "pnl-remove", "Remover foto"); rm.addEventListener("click", function () { DT.overlay.removeSelBg(); render(); }); body.appendChild(rm);
      } else { body.appendChild(label("Arraste uma imagem na zona, ou use o botão.")); }
    }
    render();
  }
  function hasInlineColor(z) { var b = z.style.background || z.style.backgroundColor || ""; return !!b && b.indexOf("gradient") < 0 && b.indexOf("url(") < 0; }

  function buildFill(elx, cs) {
    var sec = section("Fundo");
    var cur = readFill(elx, cs);
    var mode = cur.kind;                 // "solid" | "gradient"
    var toggle = el("div", "pnl-row");
    toggle.appendChild(btnGroupText([["solid", "Sólido"], ["gradient", "Gradiente"]], mode, function (m) { mode = m; rebuildBody(); apply(); }));
    sec.appendChild(toggle);
    var body = el("div"); sec.appendChild(body); root.appendChild(sec);

    function colorRow(lbl, id, val) { var row = el("div", "pnl-row"); row.appendChild(el("span", "k", lbl)); var c = el("input"); c.type = "color"; c.id = id; c.value = val; c.addEventListener("change", apply); c.addEventListener("input", apply); row.appendChild(c); refs[id] = c; return row; }
    function rebuildBody() {
      body.innerHTML = "";
      if (mode === "solid") { body.appendChild(colorRow("Cor", "f-c1", cur.c1)); }
      else { body.appendChild(colorRow("Cor 1", "f-c1", cur.c1)); body.appendChild(colorRow("Cor 2", "f-c2", cur.c2)); var ang = el("div", "pnl-row"); ang.appendChild(field("Ângulo", "f-ang", cur.angle, "number")); body.appendChild(ang); refs["f-ang"].addEventListener("change", apply); }
    }
    function apply() {
      if (mode === "solid") { DT.overlay.setBgFill(refs["f-c1"].value, "solid"); }
      else { var a = parseInt((refs["f-ang"] && refs["f-ang"].value) || cur.angle) || 180; DT.overlay.setBgFill("linear-gradient(" + a + "deg, " + refs["f-c1"].value + ", " + refs["f-c2"].value + ")", "gradient"); }
    }
    rebuildBody();
  }

  function btnGroupText(items, current, onPick) {
    var g = el("div", "pnl-btns group");
    items.forEach(function (it) { var b = el("button", it[0] === current ? "on" : null, it[1]); b.style.fontSize = "11px"; b.addEventListener("click", function () { g.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onPick(it[0]); }); g.appendChild(b); });
    return g;
  }

  function buildRemove() { var sec = section(null); var b = el("button", "pnl-remove", "Remover elemento"); b.addEventListener("click", function () { DT.overlay.removeSel(); }); sec.appendChild(b); root.appendChild(sec); }

  function bindCommon() {
    bindOne("p-x", function (v) { DT.overlay.setX(parseFloat(v) || 0); });
    bindOne("p-y", function (v) { DT.overlay.setY(parseFloat(v) || 0); });
    bindOne("p-w", function (v) { DT.overlay.setW(parseFloat(v) || 0); });
    bindOne("p-h", function (v) { DT.overlay.setH(parseFloat(v) || 0); });
    bindOne("p-fam", function (v) { DT.overlay.setStyle("font-family", v); });
    bindOne("p-weight", function (v) { DT.overlay.setStyle("font-weight", WEIGHTS[v]); });
    bindOne("p-size", function (v) { if (v) DT.overlay.setStyle("font-size", parseFloat(v) + "px"); });
    bindOne("p-lh", function (v) { if (v !== "") DT.overlay.setStyle("line-height", String(parseFloat(v))); });
    bindOne("p-ls", function (v) { if (v !== "") DT.overlay.setStyle("letter-spacing", parseFloat(v) + "px"); });
    bindOne("p-color", function (v) { if (v) DT.overlay.setStyle("color", v); });
  }
  function bindOne(id, fn) { var i = refs[id]; if (i) i.addEventListener("change", function () { fn(i.value); }); }

  function syncGeom() { var g = DT.overlay.currentGeom(); if (!g) return; if (refs["p-x"]) refs["p-x"].value = g.x; if (refs["p-y"]) refs["p-y"].value = g.y; if (refs["p-w"]) refs["p-w"].value = g.w; if (refs["p-h"]) refs["p-h"].value = g.h; }
  function hide() { root.classList.remove("is-open"); root.innerHTML = ""; refs = {}; }

  // ---------- leituras ----------
  function familyOf(cs) { var f = cs.fontFamily || ""; for (var i = 0; i < FAMILIES.length; i++) if (f.indexOf(FAMILIES[i]) >= 0) return FAMILIES[i]; return FAMILIES[0]; }
  function nameForWeight(w) { for (var k in WEIGHTS) if (WEIGHTS[k] === String(w)) return k; if (w === "normal") return "Regular"; if (w === "bold") return "Bold"; return "Regular"; }
  function lhVal(cs) { var lh = cs.lineHeight; if (!lh || lh === "normal") return 1.2; var fs = parseFloat(cs.fontSize) || 1; return Math.round((parseFloat(lh) / fs) * 100) / 100; }
  function lsVal(cs) { var ls = cs.letterSpacing; return (!ls || ls === "normal") ? 0 : Math.round(parseFloat(ls) * 100) / 100; }
  function hexOf(rgb) { var m = (rgb || "").match(/\d+/g); if (!m) return ""; return "#" + m.slice(0, 3).map(function (n) { return ("0" + parseInt(n).toString(16)).slice(-2); }).join(""); }
  function readFill(elx, cs) {
    var bg = elx.style.background || cs.backgroundImage;
    if (bg && bg.indexOf("gradient") >= 0) { var cols = bg.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi) || []; var ang = (bg.match(/(-?\d+)deg/) || [, "180"])[1]; return { kind: "gradient", c1: hexOf(cols[0]) || "#000000", c2: hexOf(cols[1]) || "#333333", angle: parseInt(ang) }; }
    return { kind: "solid", c1: hexOf(cs.backgroundColor) || "#000000", c2: "#333333", angle: 180 };
  }

  DT.panel = { init: init, setContract: setContract, show: show, hide: hide, syncGeom: syncGeom };
})();
