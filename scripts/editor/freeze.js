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
