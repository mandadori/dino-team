/* Dino Editor — history.js
 * Undo/redo por snapshot. Antes de cada mudança, begin() guarda o estado atual
 * (HTML de cada <section> + cópia dos deltas). undo()/redo() restauram via
 * callback do app (que reescreve o innerHTML e re-marca selecionáveis).
 */
window.DT = window.DT || {};
(function () {
  "use strict";
  var past = [], future = [], framesRef = null, restoreCb = null, onChange = null;
  var lastKey = null, lastTs = 0;   // coalescência de begins consecutivos (ex.: drag do color picker)

  function init(opts) { framesRef = opts.frames; restoreCb = opts.restore; onChange = opts.onChange; }

  function snapshot() {
    return {
      slides: framesRef().map(function (f) { return { n: f.n, html: f.root ? f.root.innerHTML : "" }; }),
      edits: JSON.parse(JSON.stringify(DT.edits.list()))
    };
  }
  function apply(state) {
    framesRef().forEach(function (f) {
      var s = state.slides.find(function (x) { return x.n === f.n; });
      if (s && f.root) f.root.innerHTML = s.html;
    });
    DT.edits.replace(state.edits);
    if (restoreCb) restoreCb();        // re-marca selecionáveis, limpa seleção
    fire();
  }
  // chamado ANTES de uma mudança commitar (captura o estado pré-mudança).
  // key opcional: begins consecutivos com a MESMA key dentro de 1s coalescem num
  // único snapshot — senão o color picker (fire input contínuo) empilha dezenas de
  // estados e o ⌘Z só anda 1px por vez.
  function begin(key) {
    var now = Date.now();
    if (key != null && key === lastKey && (now - lastTs) < 1000) { lastTs = now; return; }
    lastKey = key; lastTs = now;
    past.push(snapshot()); if (past.length > 80) past.shift(); future.length = 0; fire();
  }
  function undo() { if (!past.length) return; lastKey = null; future.push(snapshot()); apply(past.pop()); }
  function redo() { if (!future.length) return; lastKey = null; past.push(snapshot()); apply(future.pop()); }
  function canUndo() { return past.length > 0; }
  function canRedo() { return future.length > 0; }
  function fire() { if (onChange) onChange({ undo: canUndo(), redo: canRedo() }); }

  DT.history = { init: init, begin: begin, undo: undo, redo: redo, canUndo: canUndo, canRedo: canRedo };
})();
