import { readAprovacoesPendentes } from "@/lib/dashboard/readers";
import { DispatchButton } from "@/components/admin/DispatchButton";

export const dynamic = "force-dynamic";

export default function AprovacoesPage() {
  const pendentes = readAprovacoesPendentes();

  return (
    <div>
      <h1 className="font-display text-4xl uppercase">Aprovações pendentes</h1>
      {pendentes.length === 0 ? (
        <p className="mt-6 font-body text-muted">Nada aguardando aprovação. 🎯</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {pendentes.map((p) => (
            <li
              key={`${p.campanhaSlug}-${p.tarefaId}`}
              className="flex flex-col gap-4 border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-body text-sm font-semibold text-fg">{p.campanhaSlug}</p>
                <p className="mt-1 font-body text-xs text-muted">
                  tarefa: {p.tarefaId} · aguardando desde {p.aguardandoDesde}
                </p>
              </div>
              <DispatchButton
                skill="/lote-posts"
                args={`executar pauta ${p.campanhaSlug}`}
                label="Aprovar e executar"
                variant="primary"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
