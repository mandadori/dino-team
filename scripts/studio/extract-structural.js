// scripts/studio/extract-structural.js
// Filtra deltas scope=structural do edits.json e agrupa por bloco, com linhas legíveis.

function lineFor(d) {
  if (d.prop === "removed") return `${d.target}: removido`;
  const from = d.from == null ? "auto" : d.from;
  return `${d.target}: ${d.prop} ${from}→${d.to}`;
}

export function extractStructural(editsJson) {
  const p = editsJson || {};
  const byBlockMap = {};
  (p.slides || []).forEach((s) => {
    (s.edits || [])
      .filter((e) => e.scope === "structural")
      .forEach((e) => {
        const key = s.block || `slide-${s.slide}`;
        if (!byBlockMap[key]) byBlockMap[key] = { block: key, deltas: [], lines: [] };
        byBlockMap[key].deltas.push(e);
        byBlockMap[key].lines.push(lineFor(e));
      });
  });
  const byBlock = Object.values(byBlockMap);
  return {
    estilo: p.estilo || null,
    estilo_path: p.estilo_path || null,
    hasStructural: byBlock.length > 0,
    byBlock,
  };
}
