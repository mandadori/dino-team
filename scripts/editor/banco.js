// scripts/editor/banco.js
// Helpers puros do índice do banco de imagens (.banco-index.json), schema v2.
// Estado: índice por drive_file_id; descanso é um MAPA por canal.

const IMG_RE = /\.(jpe?g|png|webp)$/i;

// Normaliza um índice cru (v1 ou v2) para a forma v2. Idempotente.
// v1: chave `file`, rest_until string|null. v2: chave `drive_file_id`, rest_until objeto.
export function normalizeIndex(index) {
  if (!index.images) index.images = [];
  index.version = 2;
  for (const e of index.images) {
    if (!e.drive_file_id) e.drive_file_id = e.file || e.name || null;
    if (!e.name) e.name = e.file || e.drive_file_id;
    if (typeof e.rest_until === "string" || e.rest_until == null) e.rest_until = {};
    if (!Array.isArray(e.used_in)) e.used_in = [];
    if (!Array.isArray(e.tags)) e.tags = [];
    if (typeof e.caption !== "string") e.caption = "";
  }
  return index;
}

// Candidatos do Drive ainda não indexados. driveFiles: [{drive_file_id, name}].
export function scanNew(driveFiles, index) {
  const known = new Set((index.images || []).map((i) => i.drive_file_id));
  return (driveFiles || []).filter(
    (f) => IMG_RE.test(f.name || "") && !known.has(f.drive_file_id),
  );
}

export function upsertCaption(index, driveFileId, name, caption, tags) {
  if (!index.images) index.images = [];
  let e = index.images.find((i) => i.drive_file_id === driveFileId);
  if (!e) {
    e = { drive_file_id: driveFileId, name, caption: "", tags: [], used_in: [], rest_until: {} };
    index.images.push(e);
  }
  if (name) e.name = name;
  e.caption = caption;
  e.tags = tags || [];
  return e;
}

function addDaysISO(dateISO, days) {
  const d = new Date(dateISO + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Marca uso no canal. restDays>0 → descanso; restDays<=0 → sem descanso (limpa a chave).
export function markUsed(index, driveFileId, post, dateISO, canal, restDays) {
  const e = (index.images || []).find((i) => i.drive_file_id === driveFileId);
  if (!e) return null;
  if (!Array.isArray(e.used_in)) e.used_in = [];
  if (!e.rest_until || typeof e.rest_until !== "object") e.rest_until = {};
  e.used_in.push({ post, date: dateISO, canal });
  if (restDays > 0) e.rest_until[canal] = addDaysISO(dateISO, restDays);
  else delete e.rest_until[canal];
  return e;
}

// Disponíveis para UM canal: ignora as chaves de descanso dos outros canais.
export function filterAvailable(index, canal, todayISO) {
  return (index.images || []).filter((e) => {
    const r = e.rest_until && e.rest_until[canal];
    return !r || r <= todayISO;
  });
}
