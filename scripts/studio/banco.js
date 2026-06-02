// scripts/studio/banco.js
// Helpers puros do índice do banco de imagens (.banco-index.json).

const IMG_RE = /\.(jpe?g|png|webp)$/i;

export function scanNew(files, index) {
  const known = new Set((index.images || []).map((i) => i.file));
  return files.filter((f) => IMG_RE.test(f) && !known.has(f));
}

export function upsertCaption(index, file, caption, tags) {
  if (!index.images) index.images = [];
  let e = index.images.find((i) => i.file === file);
  if (!e) {
    e = { file, caption: "", tags: [], used_in: [], rest_until: null };
    index.images.push(e);
  }
  e.caption = caption;
  e.tags = tags || [];
  return e;
}

function addDaysISO(dateISO, days) {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function markUsed(index, file, post, dateISO, restDays) {
  const e = (index.images || []).find((i) => i.file === file);
  if (!e) return null;
  e.used_in.push({ post, date: dateISO });
  e.rest_until = addDaysISO(dateISO, restDays);
  return e;
}

export function filterAvailable(index, todayISO) {
  return (index.images || []).filter((e) => !e.rest_until || e.rest_until <= todayISO);
}
