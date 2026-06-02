// scripts/studio/validate-edits.js
// Valida o payload de edição antes de gravar design/edits.json.

const SCOPES = new Set(["content", "structural"]);

export function validateEdits(payload) {
  const errors = [];
  const p = payload || {};

  if (typeof p.estilo !== "string" || !p.estilo) errors.push("estilo: string obrigatória");
  if (typeof p.post !== "string" || !p.post) errors.push("post: string obrigatória");

  if (!Array.isArray(p.slides)) {
    errors.push("slides: array obrigatório");
    return { valid: false, errors };
  }

  p.slides.forEach((s, i) => {
    const ctx = `slides[${i}]`;
    if (typeof s.slide !== "number") errors.push(`${ctx}.slide: número obrigatório`);
    if (typeof s.block !== "string" || !s.block) errors.push(`${ctx}.block: string obrigatória`);
    if (!Array.isArray(s.edits)) {
      errors.push(`${ctx}.edits: array obrigatório`);
    } else {
      s.edits.forEach((e, j) => {
        const ec = `${ctx}.edits[${j}]`;
        if (typeof e.target !== "string" || !e.target) errors.push(`${ec}.target: string obrigatória`);
        if (typeof e.prop !== "string" || !e.prop) errors.push(`${ec}.prop: string obrigatória`);
        if (!("from" in e)) errors.push(`${ec}.from: obrigatório`);
        if (!("to" in e)) errors.push(`${ec}.to: obrigatório`);
        if (!SCOPES.has(e.scope)) errors.push(`${ec}.scope: deve ser "content" ou "structural"`);
      });
    }
    if (s.background !== undefined) {
      const b = s.background || {};
      if (typeof b.drop !== "string") errors.push(`${ctx}.background.drop: string obrigatória`);
    }
  });

  return { valid: errors.length === 0, errors };
}
