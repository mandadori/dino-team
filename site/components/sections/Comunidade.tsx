import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/ui/CTAButton";
import { COMMUNITY_BENEFITS, COMMUNITY_WHATSAPP_URL } from "@/lib/site";

/**
 * Seção Comunidade — RSC (sem "use client").
 *
 * Enquadra a comunidade como parte do método, não como bônus ou brinquedo social.
 * Acesso exclusivo: entra quem contrata, permanece quem executa (D-14/D-15).
 *
 * CTA aponta para COMMUNITY_WHATSAPP_URL (link de convite do grupo exclusivo de alunos),
 * NUNCA para WHATSAPP_URL (suporte) nem para deeplink de plano (D-14/D-17, Pitfall 4).
 */
export function Comunidade() {
  return (
    <section className="border-t border-line px-6 py-24 sm:py-32">
      {/* max-w-4xl text-center — bloco textual centralizado (D-15) */}
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <h2 className="font-display text-4xl uppercase leading-tight sm:text-5xl">
            Não é só treino. É o ambiente que te puxa.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mx-auto mt-6 max-w-2xl font-body text-muted">
            Parte do método é o ambiente. A comunidade de alunos Dino Team é
            fechada — entra quem contrata, permanece quem executa o processo.
          </p>
        </Reveal>

        {/* Lista semântica de benefícios (D-15; UI-SPEC § Accessibility exige ul/li) */}
        <ul className="mt-10 space-y-4 text-left">
          {COMMUNITY_BENEFITS.map((b, i) => (
            <Reveal key={b} delay={0.06 * i}>
              <li className="font-body text-muted">{b}</li>
            </Reveal>
          ))}
        </ul>

        {/* CTA de convite — COMMUNITY_WHATSAPP_URL (grupo exclusivo de alunos, D-14/D-17) */}
        <Reveal delay={0.16}>
          <div className="mt-10 flex justify-center">
            <CTAButton href={COMMUNITY_WHATSAPP_URL}>
              Entrar na comunidade
            </CTAButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
