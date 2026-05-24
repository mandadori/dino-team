import { readCampanhas, type CampanhaResumo } from "@/lib/dashboard/readers";

export const dynamic = "force-dynamic";

const COLUNAS: { estado: string; titulo: string }[] = [
  { estado: "em-curso", titulo: "Em curso" },
  { estado: "aguardando-aprovacao", titulo: "Aguardando aprovação" },
  { estado: "concluida", titulo: "Concluída" },
];

function Card({ c }: { c: CampanhaResumo }) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="font-body text-sm font-semibold text-fg">{c.slug}</p>
      <p className="mt-1 font-body text-xs text-muted">{c.briefingsCount} briefings</p>
      <p className="mt-2 select-all font-body text-xs text-muted">{c.caminho}</p>
    </div>
  );
}

export default function CampanhasPage() {
  const campanhas = readCampanhas();

  return (
    <div>
      <h1 className="font-display text-4xl uppercase">Campanhas</h1>
      {campanhas.length === 0 && (
        <p className="mt-6 font-body text-muted">
          Nenhuma campanha ainda. Rode <code>/planejar-pauta-semanal</code> para criar a primeira.
        </p>
      )}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {COLUNAS.map((col) => {
          const itens = campanhas.filter((c) => c.estado === col.estado);
          return (
            <div key={col.estado}>
              <h2 className="font-body text-sm font-semibold uppercase tracking-[0.15em] text-muted">
                {col.titulo} <span className="text-fg">({itens.length})</span>
              </h2>
              <div className="mt-4 space-y-3">
                {itens.map((c) => (
                  <Card key={c.slug} c={c} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
