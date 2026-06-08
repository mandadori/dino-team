// scripts/editor/banco-config.js
// Parser mínimo do banco-imagens.yaml (sem js-yaml — padrão do projeto).
// Estrutura conhecida: dois blocos de 1 nível (drive, descanso_por_canal).

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/editor/ -> raiz do repo é dois níveis acima
const DEFAULT_PATH = resolve(__dirname, "../../orquestracao/banco-imagens.yaml");

const REST_DEFAULT = 30;

function stripQuotes(s) {
  return s.replace(/^["']|["']$/g, "");
}

// Parser linha-a-linha para o formato conhecido (chave de seção sem valor; itens com 2 espaços).
export function parseBancoConfig(text) {
  const cfg = { drive: { pasta_raiz_id: "" }, descanso_por_canal: {} };
  let section = null;
  for (const raw of text.split("\n")) {
    const line = raw.replace(/#.*$/, "").replace(/\s+$/, "");
    if (!line.trim()) continue;
    const indented = /^\s{2,}\S/.test(line);
    const m = line.trim().match(/^([\w]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, valRaw] = m;
    if (!indented) {
      section = key;
      if (valRaw) {
        // chave de topo com valor inline (não esperado, mas tolerante)
        section = null;
      }
      continue;
    }
    const val = stripQuotes(valRaw.trim());
    if (section === "drive") cfg.drive[key] = val;
    else if (section === "descanso_por_canal") cfg.descanso_por_canal[key] = parseInt(val, 10);
  }
  return cfg;
}

export function loadBancoConfig(path = DEFAULT_PATH) {
  if (!existsSync(path)) return { drive: { pasta_raiz_id: "" }, descanso_por_canal: {} };
  return parseBancoConfig(readFileSync(path, "utf8"));
}

// Dias de descanso de um canal; canal sem default explícito cai em 30.
export function restDaysFor(config, canal) {
  const v = config && config.descanso_por_canal && config.descanso_por_canal[canal];
  return Number.isFinite(v) ? v : REST_DEFAULT;
}
