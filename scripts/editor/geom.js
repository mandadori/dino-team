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

if (typeof window !== "undefined") {
  window.DT = window.DT || {};
  window.DT.geom = { resizeKeepingAspect };
}
