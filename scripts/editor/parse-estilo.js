// scripts/editor/parse-estilo.js
// Parser do contrato declarativo estilo.md → JSON consumido pelo editor.

const POSICOES = [
  "rodapé-centro", "rodapé", "topo-centro", "topo",
  "zona-inferior", "centro", "esquerdo", "direito", "abaixo", "acima",
];

export function parseSlotDescriptor(descriptor) {
  const raw = String(descriptor || "").trim();
  const fontMatch = raw.match(/\b(Anton|Montserrat)\b/);
  const sizeMatch = raw.match(/~?\s*(\d+)\s*px/);
  // Alinhamento é um segmento próprio (delimitado por | ou pelas bordas do
  // descriptor). Evita casar "centro" dentro de "rodapé-centro".
  const alignMatch = raw.match(/(?:^|\|)\s*(centralizado|esquerdo|direito|centro)\s*(?:\||$)/);

  let position = null;
  for (const p of POSICOES) {
    if (raw.includes(p)) { position = p; break; }
  }

  return {
    raw,
    font: fontMatch ? fontMatch[1] : null,
    sizePx: sizeMatch ? parseInt(sizeMatch[1], 10) : null,
    position,
    align: alignMatch ? alignMatch[1] : null,
  };
}

function parseBgDrop(visualText) {
  const m = visualText.match(/\[bg\]:[^\n]*drop:\s*([a-z0-9_-]+)/i);
  return m ? m[1] : null;
}

function parseSlots(visualText) {
  const lines = visualText.split("\n");
  const slots = [];
  let inSlots = false;
  for (const line of lines) {
    if (/^\s*\[slots\]:/.test(line)) { inSlots = true; continue; }
    if (!inSlots) continue;
    // Slots são linhas indentadas "  nome: descriptor".
    // Para na próxima diretiva de base ([tokens]:, ####, ---, ###).
    if (/^\s*\[[a-zà-ú]+\]:/i.test(line) || /^####/.test(line) ||
        /^---/.test(line) || /^###/.test(line)) {
      break;
    }
    const m = line.match(/^\s+([^:]+):\s*(.+)$/);
    if (m) {
      const name = m[1].trim();
      slots.push({ name, ...parseSlotDescriptor(m[2]) });
    }
  }
  return slots;
}

export function parseEstilo(md) {
  const text = String(md || "");
  const estruturaIdx = text.indexOf("## Estrutura");
  const estrutura = estruturaIdx >= 0 ? text.slice(estruturaIdx) : text;

  // Quebra por "### bloco: <nome>"; o primeiro pedaço é cabeçalho da Estrutura.
  const parts = estrutura.split(/^###\s+bloco:\s*/m);
  const blocks = [];
  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i];
    const name = chunk.split("\n")[0].trim();
    // Recorta a região #### visual (até #### editorial ou fim do bloco).
    const visualStart = chunk.indexOf("#### visual");
    const editorialStart = chunk.indexOf("#### editorial");
    const visualText = visualStart >= 0
      ? chunk.slice(visualStart, editorialStart >= 0 ? editorialStart : undefined)
      : chunk;
    blocks.push({
      name,
      bg: parseBgDrop(visualText),
      slots: parseSlots(visualText),
    });
  }

  // estilo: 1ª linha "# Estilo `slug` — ..." se presente.
  const slugMatch = text.match(/^#\s+Estilo\s+`([^`]+)`/m);
  return { estilo: slugMatch ? slugMatch[1] : null, blocks };
}
