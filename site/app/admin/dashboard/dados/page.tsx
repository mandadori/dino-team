import { readInteligencia } from "@/lib/dashboard/readers";
import { DispatchButton } from "@/components/admin/DispatchButton";

export const dynamic = "force-dynamic";

function formatData(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

export default function DadosPage() {
  const slices = readInteligencia();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl uppercase">Banco de dados</h1>
        <DispatchButton skill="/atualizar-ramon" label="Atualizar Ramon" />
      </div>

      <div className="mt-8 space-y-6">
        {slices.map((s) => (
          <div key={s.slice} className="border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl uppercase">{s.slice}</h2>
              <span className="font-body text-xs text-muted">
                atualizado: {formatData(s.ultimaAtualizacao)}
              </span>
            </div>
            <ul className="mt-4 space-y-1">
              {s.arquivos.length === 0 ? (
                <li className="font-body text-xs text-muted">(sem arquivos)</li>
              ) : (
                s.arquivos.map((a) => (
                  <li key={a.path} className="flex justify-between font-body text-xs text-muted">
                    <span className="text-fg">{a.path}</span>
                    <span>{formatData(a.ultimaAtualizacao)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
