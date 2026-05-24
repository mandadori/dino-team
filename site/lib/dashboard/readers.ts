import fs from "node:fs";
import path from "node:path";

/**
 * Leitores server-side do estado do sistema. Leem arquivos do repositório
 * (campanhas/, dados/) a partir da raiz — site/ é subpasta, então sobe 1 nível.
 *
 * NOTA: em produção (Vercel serverless) o repositório não está presente no
 * filesystem da função, então estes leitores retornam vazio graciosamente.
 * São pensados para uso local (npm run dev) e para um runtime com o repo.
 */
const REPO_ROOT = path.resolve(process.cwd(), "..");

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function matchField(text: string, field: string): string | null {
  const m = text.match(new RegExp(`^\\s*${field}:\\s*(.+)$`, "m"));
  return m ? m[1].trim() : null;
}

export type CampanhaResumo = {
  slug: string;
  estado: string;
  briefingsCount: number;
  ultimaAtividade: string | null;
  caminho: string;
};

export function readCampanhas(): CampanhaResumo[] {
  const dir = path.join(REPO_ROOT, "campanhas");
  return safe(() => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => {
        const slug = d.name;
        const base = path.join(dir, slug);
        const statusPath = path.join(base, "status.yaml");
        const estado = fs.existsSync(statusPath)
          ? matchField(fs.readFileSync(statusPath, "utf8"), "estado") ?? "desconhecido"
          : "desconhecido";
        const postsDir = path.join(base, "output", "posts");
        const briefingsCount = fs.existsSync(postsDir)
          ? fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")).length
          : 0;
        const logPath = path.join(base, "log.md");
        const ultimaAtividade = fs.existsSync(logPath)
          ? fs.statSync(logPath).mtime.toISOString()
          : null;
        return { slug, estado, briefingsCount, ultimaAtividade, caminho: `campanhas/${slug}/` };
      });
  }, []);
}

export type AprovacaoPendente = {
  campanhaSlug: string;
  tarefaId: string;
  aguardandoDesde: string;
};

export function readAprovacoesPendentes(): AprovacaoPendente[] {
  return safe(() => {
    const out: AprovacaoPendente[] = [];
    for (const c of readCampanhas()) {
      const statusPath = path.join(REPO_ROOT, "campanhas", c.slug, "status.yaml");
      if (!fs.existsSync(statusPath)) continue;
      const txt = fs.readFileSync(statusPath, "utf8");
      // bloco aprovacoes_pendentes: lê tarefa_id + aguardando_desde
      const bloco = txt.split("aprovacoes_pendentes:")[1];
      if (!bloco) continue;
      const ids = [...bloco.matchAll(/tarefa_id:\s*(.+)/g)].map((m) => m[1].trim());
      const datas = [...bloco.matchAll(/aguardando_desde:\s*(.+)/g)].map((m) => m[1].trim());
      ids.forEach((id, i) =>
        out.push({
          campanhaSlug: c.slug,
          tarefaId: id,
          aguardandoDesde: datas[i] ?? "—",
        }),
      );
    }
    return out;
  }, []);
}

export type SliceInfo = {
  slice: string;
  ultimaAtualizacao: string | null;
  arquivos: { path: string; ultimaAtualizacao: string }[];
};

export function readInteligencia(): SliceInfo[] {
  const dadosDir = path.join(REPO_ROOT, "dados");
  const slices = ["ramon", "mercado", "performance"];
  return safe(() => {
    return slices.map((slice) => {
      const dir = path.join(dadosDir, slice);
      const arquivos: SliceInfo["arquivos"] = [];
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          if (!f.endsWith(".md")) continue;
          const stat = fs.statSync(path.join(dir, f));
          arquivos.push({ path: `dados/${slice}/${f}`, ultimaAtualizacao: stat.mtime.toISOString() });
        }
      }
      const ultimaAtualizacao =
        arquivos.length > 0
          ? arquivos.map((a) => a.ultimaAtualizacao).sort().reverse()[0]
          : null;
      return { slice, ultimaAtualizacao, arquivos };
    });
  }, []);
}

export function readPoliticas(): string {
  const p = path.join(REPO_ROOT, "dados", "politicas", "publicacao.yaml");
  return safe(() => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "(política não encontrada)"), "(erro ao ler política)");
}
