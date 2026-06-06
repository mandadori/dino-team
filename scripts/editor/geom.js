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

// Visibilidade das alças conforme o tamanho do box NA TELA (px já escalados).
// Box pequeno: só cantos (desafoga). Box muito pequeno: nenhuma — resize fino
// fica pelo campo "Tam" do painel e pelas setas do teclado.
export const HANDLE_HIDE_EDGES_BELOW = 48;
export const HANDLE_HIDE_ALL_BELOW = 24;
export function handleVisibility(screenW, screenH) {
  const m = Math.min(screenW, screenH);
  if (m < HANDLE_HIDE_ALL_BELOW) return { corners: false, edges: false };
  if (m < HANDLE_HIDE_EDGES_BELOW) return { corners: true, edges: false };
  return { corners: true, edges: true };
}

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.geom = { resizeKeepingAspect, handleVisibility };
}
