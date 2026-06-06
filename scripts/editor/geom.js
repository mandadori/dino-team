/* Dino Editor — geom.js
 * Proporção de imagem ao redimensionar por valor (campos L/A do painel).
 * Puro e testável. Bridge para window.DT.geom no browser.
 */
export function resizeKeepingAspect(curW, curH, axis, value, lock) {
  const ratio = curW && curH ? curW / curH : 1;
  if (axis === "w") {
    const width = Math.round(value);
    return { width, height: lock ? Math.round(width / ratio) : null };
  }
  const height = Math.round(value);
  return { width: lock ? Math.round(height * ratio) : null, height };
}

// Layout das alças conforme o tamanho do box NA TELA (px já escalados).
// Cantos SEMPRE visíveis (resize sempre possível); arestas só quando há espaço.
// O tamanho da alça é proporcional, com piso agarrável e teto padrão — assim em
// elemento pequeno a alça encolhe (não cobre o conteúdo) sem perder o resize.
export const HANDLE_MIN = 7;            // piso agarrável
export const HANDLE_MAX = 11;           // tamanho padrão
export const HANDLE_EDGES_BELOW = 40;   // abaixo disso, só cantos
export function handleLayout(screenW, screenH) {
  const m = Math.min(screenW, screenH);
  const size = Math.max(HANDLE_MIN, Math.min(HANDLE_MAX, Math.round(m / 4)));
  return { size: size, corners: true, edges: m >= HANDLE_EDGES_BELOW };
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.geom = { resizeKeepingAspect, handleLayout };
}
