/* Dino Editor — spans.js
 * Formatação de TRECHO de texto: envolve um Range num <span style> e funde spans
 * adjacentes equivalentes (evita "sopa de spans"). DOM puro (sem layout) → testável
 * com jsdom. Bridge para window.DT.spans no browser.
 */

// styleObj: chaves em camelCase do CSSStyleDeclaration, ex.: { fontWeight:"700" },
// { color:"#ffffff" }, { fontSize:"40px" }.
export function applyStyleToRange(range, styleObj) {
  if (!range || range.collapsed) return null;
  const doc = range.commonAncestorContainer.ownerDocument;
  const span = doc.createElement("span");
  Object.keys(styleObj).forEach((k) => { span.style[k] = styleObj[k]; });
  try {
    range.surroundContents(span);                 // range simples (dentro de um nó)
  } catch (_) {
    const frag = range.extractContents();         // range cruzando fronteiras de nó
    span.appendChild(frag);
    range.insertNode(span);
  }
  return span;
}

// Funde spans irmãos adjacentes com o MESMO atributo style; depois normaliza os
// nós de texto. Loop até estabilizar.
export function mergeSpans(root) {
  let changed = true;
  while (changed) {
    changed = false;
    const spans = root.querySelectorAll("span[style]");
    for (const s of spans) {
      const next = s.nextSibling;
      if (next && next.nodeType === 1 && next.tagName === "SPAN" &&
          next.getAttribute("style") === s.getAttribute("style")) {
        while (next.firstChild) s.appendChild(next.firstChild);
        next.remove();
        changed = true;
        break;
      }
    }
  }
  root.normalize();
  return root;
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.spans = { applyStyleToRange, mergeSpans };
}
