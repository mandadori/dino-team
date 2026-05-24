import Link from "next/link";
import {
  readCampanhas,
  readAprovacoesPendentes,
  readInteligencia,
} from "@/lib/dashboard/readers";
import { DispatchButton } from "@/components/admin/DispatchButton";

export const dynamic = "force-dynamic";

export default function DashboardHome() {
  const campanhas = readCampanhas();
  const aprovacoes = readAprovacoesPendentes();
  const slices = readInteligencia();

  const emCurso = campanhas.filter((c) => c.estado === "em-curso").length;
  const aguardando = campanhas.filter((c) => c.estado === "aguardando-aprovacao").length;

  const cards = [
    { label: "Campanhas em curso", valor: emCurso },
    { label: "Aguardando aprovação", valor: aguardando },
    { label: "Aprovações pendentes", valor: aprovacoes.length },
    { label: "Slices do banco", valor: slices.length },
  ];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-4xl uppercase">Visão geral</h1>
        <div className="mt-6 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-bg p-6">
              <p className="font-display text-5xl">{c.valor}</p>
              <p className="mt-2 font-body text-sm text-muted">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-muted">
          Ações rápidas
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <DispatchButton skill="/planejar-pauta-semanal" args="5" label="Planejar pauta semanal" variant="primary" />
          <DispatchButton skill="/atualizar-ramon" label="Atualizar Ramon" />
          <DispatchButton skill="/lote-posts" args="carrossel 3" label="Novo lote (3)" />
        </div>
      </section>

      <section className="flex flex-wrap gap-4 font-body text-sm">
        <Link href="/admin/dashboard/campanhas" className="border border-line px-4 py-2 hover:border-fg">Campanhas →</Link>
        <Link href="/admin/dashboard/aprovacoes" className="border border-line px-4 py-2 hover:border-fg">Aprovações →</Link>
        <Link href="/admin/dashboard/dados" className="border border-line px-4 py-2 hover:border-fg">Dados →</Link>
      </section>
    </div>
  );
}
